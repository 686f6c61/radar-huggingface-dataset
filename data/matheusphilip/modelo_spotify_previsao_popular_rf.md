# matheusphilip/modelo_spotify_previsao_popular_rf

## Resumen

`matheusphilip/modelo_spotify_previsao_popular_rf` no es un modelo de lenguaje ni una red neuronal: es un **pipeline de scikit-learn serializado con joblib** que encapsula un `MinMaxScaler` y un `RandomForestClassifier` entrenados para predecir si una pista de Spotify tiene potencial de ser un éxito comercial (clasificación binaria). Lo desarrolló el usuario matheusphilip como proyecto del reto #7DaysOfCode de Machine Learning de Alura, y se publica en Hugging Face como artefacto reproducible del proyecto alojado en GitHub.

El modelo consume exclusivamente atributos acústicos y musicales de Spotify (`duration_ms`, `danceability`, `energy`, `loudness`, `speechiness`, `acousticness`, `instrumentalness`, `liveness`, `valence` y `tempo`) y devuelve una etiqueta binaria de "hit" o "no hit". El problema que aborda es de clasificación severamente desbalanceada, con un reto añadido de integridad de datos: más de 30.000 registros duplicados por combinación `artists` + `track_name` que, si no se eliminan antes del `train_test_split`, inflan artificialmente las métricas por fuga de información entre entrenamiento y test.

Su relevancia actual no está en el rendimiento predictivo (F1 de 0,1207 en test), sino en el valor metodológico: documenta de forma explícita por qué las métricas de 0,90+ que reportan enfoques ingenuos con este dataset son un artefacto de duplicados y de aplicar sobremuestreo antes de la división. El artefacto tiene un tamaño de repositorio de 0,0 GB, sin descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random Forest (scikit-learn `RandomForestClassifier`) dentro de un `imblearn.pipeline.Pipeline` junto con `MinMaxScaler` y `RandomUnderSampler` |
| Parametros totales | no disponible (número de árboles y profundidad resultantes del `RandomizedSearchCV` no documentados en la model card) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular, entrada fija de 10 características acústicas) |
| Tipos de cuantizacion | no aplica (serialización joblib; no hay cuantización de pesos) |
| Idiomas soportados | no disponible (los nombres de pista y artista del dataset son mayoritariamente en inglés, pero el modelo no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | `.joblib` (pipeline completo serializado con joblib) |

## Arquitectura y entrenamiento

El artefacto es un `RandomForestClassifier` de scikit-learn encapsulado en un `imblearn.pipeline.Pipeline` que aplica, en orden, `MinMaxScaler`, `RandomUnderSampler` y el clasificador. La entrada son 10 atributos acústicos en escala original; la salida es una etiqueta binaria. El pipeline se optimizó con `RandomizedSearchCV` (20 iteraciones, 5 folds estratificados) sobre el conjunto de entrenamiento, y el ganador se retreino con el 100 % de `X_train` y se evaluó una única vez sobre `X_test`.

El dataset de partida es `maharshipandya/spotify-tracks-dataset`. El preprocesamiento incluye la eliminación de más de 30.000 registros duplicados por `['artists', 'track_name']` antes del `train_test_split` para evitar fuga de información, el `explode` de colaboraciones para calcular popularidad media por artista (filtrando artistas con al menos 2 pistas y popularidad > 0) y el análisis de géneros sobre la base bruta. Se compararon `LogisticRegression` con `class_weight='balanced'` como baseline, y combinaciones de `RandomUnderSampler` (RUS), `RandomOverSampler` (ROS) y `SMOTE` con `LogisticRegression`, `DecisionTreeClassifier` y `RandomForestClassifier`. Se eligió RUS frente a SMOTE por eficiencia operativa: SMOTE daba F1 = 0,1281 en validación cruzada frente a 0,1183 de RUS, una mejora marginal de 0,0098 a un coste computacional muy superior. No se documenta el número de tokens ni un proceso de RLHF/DPO, por tratarse de un modelo tabular supervisado clásico.

## Capacidades

- Clasificación binaria de pistas de Spotify en "hit" o "no hit" a partir de 10 atributos acústicos.
- Inferencia por lotes sobre un `DataFrame` de pandas con las columnas `duration_ms`, `danceability`, `energy`, `loudness`, `speechiness`, `acousticness`, `instrumentalness`, `liveness`, `valence` y `tempo`.
- Preprocesamiento integrado: el `.joblib` incluye el `MinMaxScaler`, por lo que acepta datos en escala original sin transformación manual previa.
- Perfil de triaje orientado a recall: el balanceo 50/50 en entrenamiento prioriza la captura de posibles hits aceptando más falsos positivos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: no es un modelo generativo.
- No tiene capacidades multilingües en el sentido de NLP; opera sobre variables numéricas.

## Casos de uso

- **Triaje inicial en curaduría musical**: el modelo actúa como filtro de descubrimiento para equipos de A&R o editores de playlists, priorizando pistas con alta probabilidad de hit antes de una revisión humana, asumiendo la baja precisión derivada del perfil de alto recall.
- **Priorización de catálogo en plataformas de streaming**: procesar por lotes el catálogo entrante con `modelo.predict(nuevas_musicas)` para ordenar candidatos a promoción editorial, usando los 10 atributos acústicos que la API de Spotify ya expone.
- **Investigación metodológica sobre fuga de datos**: el artefacto sirve como referencia reproducible de cómo la deduplicación por `artists` + `track_name` antes del `train_test_split` evita métricas infladas, útil en docencia y en auditoría de pipelines de clasificación desbalanceada.
- **Análisis de correlación acústica**: el proyecto documenta la correlación positiva entre `loudness` y `energy` y la negativa con `acousticness`, lo que permite usar el modelo como base para estudiar qué atributos sonoros aportan señal predictiva y cuáles no.
- **Prototipado rápido de clasificadores tabulares**: al estar serializado como pipeline completo con scaler y sampler incluidos, se puede cargar con una sola línea (`joblib.load`) en un notebook o servicio interno para validar hipótesis de negocio sin reentrenar.
- **Benchmark interno de desbalanceo**: sirve como baseline para comparar futuros enfoques (gradient boosting, SMOTE con coste controlado, modelos con variables externas como playlists editoriales o base de fans) contra el F1 de 0,1207 en test.

## Benchmarks y rendimiento

| Etapa de evaluacion | F1-Score (clase hit) | Observacion |
|---|---|---|
| Validacion cruzada (media 5 folds) | 0,1183 | Media durante el `RandomizedSearchCV` con RUS |
| Conjunto de test inedito (`X_test`) | 0,1207 | Generalizacion consistente sin senales de overfitting |
| SMOTE en validacion cruzada (comparativa) | 0,1281 | Descartado por coste computacional frente a RUS |
| RUS en validacion cruzada (comparativa) | 0,1183 | Opcion elegida por eficiencia y estabilidad |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks de NLP en la informacion disponible, por tratarse de un modelo tabular de clasificacion. La model card advierte que enfoques ingenuos reportan F1 > 0,90 en este dataset por oversampling antes del `train_test_split` o por mantener duplicados, y que ese resultado no se sostiene en produccion.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo se ejecuta en CPU. El tamaño del repositorio es de 0,0 GB (artefacto joblib de pocos MB).
- GPU recomendadas: ninguna necesaria; cualquier CPU moderna es suficiente para inferencia por lotes.
- Cabe en cualquier equipo consumer: portátil, contenedor pequeño o función serverless.
- Opciones de despliegue: carga directa con `joblib.load` en Python 3 con `scikit-learn`, `imbalanced-learn`, `pandas` y `numpy`; integrable en FastAPI, Flask, AWS Lambda o scripts batch.
- Latencia y throughput: no disponibles en la informacion proporcionada; para un Random Forest sobre 10 características y lotes moderados, se espera latencia de milisegundos por predicción en CPU, aunque no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | F1 en test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `matheusphilip/modelo_spotify_previsao_popular_rf` | Random Forest + pipeline imblearn | 10 atributos acústicos | 0,1207 | no disponible | Hugging Face + GitHub |
| `LogisticRegression` con `class_weight='balanced'` | Baseline lineal | 10 atributos acústicos | no disponible (solo se cita como baseline) | no aplica | Entrenable localmente |
| `DecisionTreeClassifier` con RUS/ROS/SMOTE | Árbol simple | 10 atributos acústicos | no disponible | no aplica | Entrenable localmente |
| Enfoques ingenuos con oversampling previo al split | RF/DT con fuga de datos | 10 atributos acústicos | > 0,90 (artefacto) | no aplica | No recomendable en produccion |

No se dispone de comparativas con modelos publicados de predicción de popularidad musical en la informacion proporcionada.

## Limitaciones y advertencias

- **Rendimiento predictivo bajo**: F1 de 0,1207 en test implica una precisión reducida y muchos falsos positivos; el modelo solo es útil como filtro de triaje, no como decisor autónomo.
- **Techo predictivo de las variables acústicas**: los atributos sonoros explican solo parte del éxito comercial; marketing, playlists editoriales, base de fans y viralización en redes no están en el dataset e imponen un límite estructural.
- **Riesgo de métricas infladas si se reutiliza mal**: aplicar oversampling antes del `train_test_split` o no deduplicar por `artists` + `track_name` produce F1 > 0,90 espurios; cualquier reentrenamiento debe replicar el protocolo del autor.
- **Sesgos del dataset de origen**: `maharshipandya/spotify-tracks-dataset` no está caracterizado demográficamente en la model card; la popularidad medida por Spotify puede sobrerrepresentar ciertos géneros y mercados.
- **Licencia no disponible**: no se especifica licencia, lo que impide confirmar si el uso comercial está permitido; conviene contactar con el autor antes de integrarlo en producción.
- **Sin soporte de texto ni multilingüe**: no procesa nombres de pista, artistas ni letras; cualquier señal semántica requiere un modelo adicional.
- **Dependencia de la versión de scikit-learn**: los artefactos joblib pueden fallar al cargarse con versiones distintas a las usadas en el entrenamiento; no se documenta la versión exacta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matheusphilip/modelo_spotify_previsao_popular_rf
- Repositorio GitHub del proyecto: https://github.com/matheusphilip/machine-learning-spotify/
- Dataset de origen: https://huggingface.co/datasets/maharshipandya/spotify-tracks-dataset
