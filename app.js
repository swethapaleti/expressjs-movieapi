const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;
app.use(express.json());

const initializeDBandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000);
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};

initializeDBandServer();

const movieResponse = (obj) => {
  return {
    movieName: obj.movie_name,
  };
};

const movieResponse2 = (obj) => {
  return {
    movieId: obj.movie_id,
    directorId: obj.director_id,
    movieName: obj.movie_name,
    leadActor: obj.lead_actor,
  };
};

const directorResponse = (obj) => {
  return {
    directorId: obj.director_id,
    directorName: obj.director_name,
  };
};

app.get("/movies/", async (request, response) => {
  const { movieId } = request.params;
  const getMovie = `SELECT movie_name from movie`;
  const movieNamesArray = await db.all(getMovie);
  response.send(
    movieNamesArray.map((eachItem) => {
      return movieResponse(eachItem);
    })
  );
});

app.post("/movies", (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovie = `INSERT INTO movie (director_id,movie_name,lead_actor) 
    VALUES (${directorId},'${movieName}','${leadActor}')`;
  const dbResponse = db.run(addMovie);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const getMovie = `SELECT * From movie WHERE movie_id = ${movieId}`;
  const dbResponse = await db.get(getMovie);
  response.send(movieResponse2(dbResponse));
});

app.put("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const getMovie = `UPDATE movie set director_id=${directorId}, movie_name='${movieName}',lead_actor='${leadActor}' WHERE movie_id = ${movieId}`;
  const dbResponse = await db.run(getMovie);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const removeMovie = `DELETE from movie WHERE movie_id = ${movieId};`;
  const dbResponse = await db.run(removeMovie);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getDirectorsArray = `SELECT * from director;`;
  const responseDB = await db.all(getDirectorsArray);
  response.send(
    responseDB.map((eachItem) => {
      return directorResponse(eachItem);
    })
  );
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorsArray = `SELECT * from movie where director_id = ${directorId};`;
  const responseDB = await db.all(getDirectorsArray);
  response.send(
    responseDB.map((eachItem) => {
      return movieResponse(eachItem);
    })
  );
});

module.exports = app;
