# mohossameldeen/SeriesScope

## Resumen

SeriesScope es un conjunto de tres modelos de regresión tabular basados en RandomForest y entrenados con scikit-learn. Su objetivo es estimar la puntuación de audiencia de una serie de televisión estadounidense en inglés antes de su estreno, a partir de información disponible previamente (géneros, cadena, duración, número de episodios, clasificación por edad, indicadores de adaptación o remake y el historial profesional del reparto y equipo creativo principal). Lo desarrolla el usuario mohossameldeen como proyecto de curso de machine learning clásico y se publica como pre-release.

El modelo predice tres objetivos distintos: la puntuación combinada de IMDb y TMDB ponderada por votos (carpeta `general/`), la nota de IMDb (`imdb/`) y la nota de TMDB (`tmdb/`). No es un modelo de lenguaje ni un transformer: son pickles de scikit-learn serializados con joblib, sin tokenizador ni ventana de contexto.

Su relevancia es limitada y el propio autor la acota: la ganancia sobre un baseline trivial (predecir la media del conjunto de entrenamiento) es de apenas unas centésimas de MAE, con valores de R² entre 0,037 y 0,091. Sirve como ejercicio metodológico y como referencia de hasta qué punto la información preestreno explica la recepción de una serie.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RandomForest (scikit-learn), regresión tabular |
| Parametros totales | no disponible (no aplica; modelo de árboles, no red neuronal) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica (entrada tabular, no secuencial) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (el ámbito de entrenamiento son series en inglés original de EE. UU.) |
| Licencia | other |
| Formato de pesos | joblib (pickles de scikit-learn) |

## Arquitectura y entrenamiento

Cada uno de los tres modelos es un `RandomForestRegressor` de scikit-learn, con un pipeline de características definido en el `config.json` de cada carpeta (`features`). La entrada es un vector tabular con géneros, cadena, duración, número de episodios, clasificación por edad, indicadores de adaptación o remake y variables derivadas del historial profesional del reparto y creativos principales. Se admiten valores ausentes (NaN) en la entrada, según indica la model card.

Los datos de entrenamiento cubren series estrenadas entre 2015 y 2025, con idioma original inglés, país de origen EE. UU., formato scripted o miniserie y al menos 1.000 votos en IMDb. Las fuentes son los datasets no comerciales de IMDb y la API de TMDB. El hold-out de evaluación son series estrenadas entre 2023 y 2025, nunca usadas en entrenamiento ni en ajuste. No se documenta búsqueda de hiperparámetros, validación cruzada ni técnicas de regularización más allá de las propias del RandomForest. La versión de scikit-learn usada en entrenamiento es 1.6.1.

## Capacidades

- Regresión tabular sobre tres objetivos: puntuación combinada IMDb+TMDB ponderada por votos, nota IMDb y nota TMDB.
- Manejo nativo de valores ausentes en las características de entrada (NaN permitido).
- Inferencia sobre una sola serie o sobre lotes mediante `predict` de scikit-learn.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües: el ámbito es series en inglés de EE. UU.
- No dispone de modo thinking, visión, audio ni generación de texto.

## Casos de uso

- Análisis exploratorio académico: usar los tres modelos para estudiar qué variables preestreno correlacionan con la recepción y comparar la capacidad explicativa de cada conjunto de características frente al baseline de la media.
- Priorización editorial interna: estimar de forma aproximada la nota esperada de una serie antes de estrenar para ordenar candidaturas en un catálogo, asumiendo el margen de error de ~0,6 puntos de MAE.
- Docencia de machine learning clásico: ejemplo reproducible de pipeline con scikit-learn, joblib y Hugging Face Hub, con métricas honestas frente a baseline.
- Detección de casos atípicos: identificar series cuya predicción se aleja mucho de la nota real como señal para revisar qué factores no recogidos en las características explican la diferencia.
- Prototipado de features: servir de base para añadir nuevas variables (por ejemplo, presupuesto o marketing) y medir si mejoran el R² sobre el hold-out 2023-2025.
- Benchmark de referencia para modelos tabulares más complejos (gradient boosting, redes tabulares), usando las mismas particiones y el baseline de la media como suelo.

## Benchmarks y rendimiento

Resultados publicados por el autor en el hold-out (series de 2023-2025):

| Modelo | Algoritmo | n | MAE baseline | MAE modelo | R² | Dentro de 0,5 |
|---|---|---|---|---|---|---|
| general (combined_score) | RandomForest | 840 | 0,623 | 0,609 | 0,037 | 53% |
| imdb (imdb_rating) | RandomForest | 840 | 0,660 | 0,641 | 0,041 | 51% |
| tmdb (tmdb_rating) | RandomForest | 569 | 0,593 | 0,557 | 0,091 | 54% |

El baseline siempre predice la media del conjunto de entrenamiento. La mejora sobre el baseline es pequeña en los tres casos.

## Requisitos de hardware

- Inferencia en CPU: los tres modelos son RandomForest serializados en joblib; no requieren GPU.
- VRAM estimada: 0 GB (no usa GPU).
- GPU recomendadas: no aplica.
- Cabe en cualquier equipo consumer: el tamaño del repo es de 0,0 GB según Hugging Face.
- Despliegue: Python con `scikit-learn==1.6.1` y `joblib`; descarga de artefactos vía `huggingface_hub`. No compatible con vLLM, llama.cpp, Ollama ni TGI, que son servidores de modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; al ser árboles tabulares, la latencia por muestra es del orden de microsegundos a milisegundos, pero no se publica medición.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (regresión tabular de puntuaciones de series). Se indica "no disponible".

## Limitaciones y advertencias

- Ganancia muy pequeña sobre el baseline: R² entre 0,037 y 0,091; el autor pide tratar las predicciones como estimaciones aproximadas, no como pronósticos.
- No fiable fuera del ámbito de entrenamiento: otras lenguas o países, reality shows y títulos muy oscuros quedan fuera de cobertura.
- Riesgo de sesgo por la composición del dataset: solo series en inglés de EE. UU. con 1.000+ votos en IMDb, lo que excluye producciones minoritarias y de otros mercados.
- Riesgo de alucinación no aplica en el sentido de modelos generativos, pero sí de extrapolación silenciosa: el modelo devuelve una cifra aunque la entrada esté fuera de distribución.
- Licencia "other": no se especifican términos de uso comercial; hay que consultar al autor antes de cualquier uso en producción. Además, el uso de datos de TMDB está sujeto a las condiciones de la API de TMDB, que no avala ni certifica este producto.
- Los archivos son pickles de joblib: solo deben cargarse desde una fuente de confianza, por el riesgo de ejecución de código arbitrario al deserializar.
- Dependencia estricta de `scikit-learn==1.6.1`; otras versiones pueden romper la compatibilidad del pickle.
- Proyecto de curso en estado pre-release, con 0 descargas y 0 likes en el momento de la consulta; sin mantenimiento garantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mohossameldeen/SeriesScope
- Datasets no comerciales de IMDb: https://developer.imdb.com/non-commercial-datasets/
- API de TMDB: https://developer.themoviedb.org/docs
- scikit-learn: https://scikit-learn.org/
- joblib: https://joblib.readthedocs.io/
- huggingface_hub: https://huggingface.co/docs/huggingface_hub/
