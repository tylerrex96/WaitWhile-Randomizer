const dotenvfile = require("dotenv").config(); // WaitWhile API key storage
const axios = require("axios").default;
const PDFDocument = require("pdfkit");
const fs = require("fs");

let peopleOnList = [];

function getWaitList() {
  axios
    .get("https://api.waitwhile.com/v2/customers?limit=100&desc=true", {
      headers: {
        // prettier-ignore
        "apikey": process.env.apikey,
      },
    })
    .then(function (response) {
      let currentWaitList = response.data.results;
      getPeopleOnList(currentWaitList);
      return;
    })
    .catch(function (error) {
      console.error(`Could not obtain current wait list: ${error}`);
    });
}

function getPeopleOnList(currentWaitList) {
  currentWaitList.forEach((person) => {
    peopleOnList.push(person.name);
  });
  randomizeList(peopleOnList);
}

function randomizeList(peopleOnList) {
  var currentIndex = peopleOnList.length,
    randomIndex;
  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [peopleOnList[currentIndex], peopleOnList[randomIndex]] = [
      peopleOnList[randomIndex],
      peopleOnList[currentIndex],
    ];
  }
  exportToPDF(peopleOnList);
  return;
}

function getTodaysDate() {
  const today = new Date();
  const [month, day, year] = [
    today.getMonth(),
    today.getDate(),
    today.getFullYear(),
  ];
  const todaysDate = `${month + 1}-${day}-${year}`;
  return todaysDate;
}

function exportToPDF(peopleOnList) {
  let todaysDate = getTodaysDate();
  var pdfDoc = new PDFDocument();
  pdfDoc.pipe(fs.createWriteStream(`${todaysDate}.pdf`));
  peopleOnList.forEach((person) => {
    let placeInLine = 1;
    pdfDoc.fillColor("black").text(`${placeInLine}: ${person}`);
    placeInLine++;
  });
  pdfDoc.end();
}

getWaitList();
