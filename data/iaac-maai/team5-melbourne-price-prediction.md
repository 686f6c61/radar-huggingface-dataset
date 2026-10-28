# iaac-maai/team5-melbourne-price-prediction

## Resumen

`team5-melbourne-price-prediction` no es un modelo de lenguaje: es un artefacto de aprendizaje supervisado clásico para regresión tabular, publicado en Hugging Face en formato `joblib` por el equipo de Sindhuja Davuluri, Diego Alpízar, Breno Sader y Soumya Datta en el marco del curso AI Methods I – Day 2 (IAAC MaAI 2026/27). El objetivo es predecir el precio de viviendas residenciales en Melbourne (Australia) a partir de 19 variables estructurales y geográficas del inmueble, con el fin de asistir a compradores, inversores y agentes inmobiliarios en la estimación de valor de mercado.

El modelo final es un `HistGradientBoostingRegressor` de scikit-learn optimizado mediante `GridSearchCV`, entrenado sobre el dataset público Melbourne Housing Snapshot de Kaggle (~12.000 propiedades tras la limpieza, cobertura 2016-2018). El target se transforma logarítmicamente y las métricas principales son R² y MAE. El artefacto se distribuye como un pipeline serializado que incluye imputación de medianas, escalado y codificación one-hot de variables categóricas (zonas, código postal), lo que permite inferencia directa sin reconstruir el preprocesamiento.

Su relevancia es eminentemente formativa y de referencia: sirve como ejemplo reproducible de comparación sistemática de algoritmos de regresión (baseline, lineal, Ridge, KNN, árbol, Random Forest, gradient boosting) con pipelines de scikit-learn para evitar fuga de datos. No es un modelo listo para producción fuera del contexto del curso ni del mercado de Melbourne de 2016-2018.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de scikit-learn con `HistGradientBoostingRegressor` (gradient boosting sobre árboles de decisión, binning por histogramas) + `ColumnTransformer` de preprocesamiento |
| Parametros totales | No disponible (modelo de árboles; número de iteraciones, hojas y umbrales no documentado en la model card) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: entrada tabular de 19 características originales por muestra |
| Tipos de cuantizacion | No aplica (no es una red neuronal); serialización `joblib` sin cuantización |
| Idiomas soportados | No disponible / no aplica (sin entrada ni salida de texto) |
| Licencia | Código bajo MIT según la model card; licencia del artefacto declarada en Hugging Face: no disponible |
| Formato de pesos | `model.joblib` (serialización pickle de scikit-learn); repo con notebooks, figuras y `requirements.txt` |
| Tarea | Regresión supervisada (precio de vivienda) |
| Target | `Price` transformado logarítmicamente |
| Métricas declaradas | R², MAE (escala log), MAPE |
| Tamaño del repositorio | 0,1 GB (incluye figuras y notebooks; tamaño del `.joblib` no desglosado) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Se trata de un `HistGradientBoostingRegressor`, la implementación de gradient boosting de scikit-learn basada en binning por histogramas (inspirada en LightGBM). El boosting se aplica sobre árboles de decisión construidos de forma secuencial, donde cada árbol corrige el residuo del conjunto anterior. El artefacto final integra el preprocesamiento en un `Pipeline` con `ColumnTransformer`: imputación por mediana y escalado para variables numéricas (`Rooms`, `Distance`, `Bathroom`, `Landsize`, `YearBuilt`, entre otras) y `OneHotEncoder` para variables nominales (`DistanceZone`, `Postcode`). Los hiperparámetros concretos seleccionados por `GridSearchCV` (número de iteraciones, `learning_rate`, `max_leaf_nodes`, regularización L2) no se detallan en la información disponible.

El entrenamiento se realizó sobre el Melbourne Housing Snapshot de Kaggle (licencia CC0), con aproximadamente 12.000 propiedades tras la limpieza, abarcando ventas de 2016 a 2018. Se compararon siete estimadores: Dummy Regressor (baseline de la media), regresión lineal, Ridge, KNN (k=10), árbol de decisión, Random Forest e HistGradientBoosting. No se documenta uso de validación cruzada más allá del esquema de CV reportado, ni de técnicas de calibración, ni de optimización bayesiana de hiperparámetros. La model card declara explícitamente el uso de Claude como asistente para estructuración de pipelines, depuración de errores y redacción de documentación.

## Capacidades

- Regresión de precios de vivienda en el área metropolitana de Melbourne a partir de características tabulares del inmueble.
- Manejo nativo de variables categóricas de alta cardinalidad (`Postcode`) mediante codificación one-hot dentro del pipeline.
- Tratamiento de valores ausentes en producción gracias a la imputación por mediana embebida en el pipeline serializado.
- Robustez frente a interacciones no lineales entre features (superficie, número de habitaciones, distancia al centro, coordenadas), superior a los modelos lineales evaluados.
- Explicabilidad básica mediante importancia de características (se incluye una figura `06_house_feature_importance.png` en el repositorio).
- Reproducibilidad: notebooks de limpieza/EDA y de modelado supervisado incluidos junto al artefacto.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: no es un modelo de lenguaje.

## Casos de uso

- **Tasación orientativa para compradores**: dado un inmueble con dirección, número de habitaciones, baños, superficie y año de construcción, el pipeline devuelve una estimación de precio en el rango del mercado de Melbourne 2016-2018, útil como punto de partida en una negociación.
- **Priorización de cartera para inversores**: aplicar el modelo en lote sobre un listado de propiedades (inferencia por lotes sobre un `DataFrame`) para detectar anuncios con precio de salida muy por encima o por debajo del valor estimado.
- **Herramienta interna para agentes inmobiliarios**: integración como endpoint REST (FastAPI o Flask cargando el `.joblib`) que devuelva la estimación y el intervalo de error histórico, como apoyo a la valoración manual del agente.
- **Docencia y referencia metodológica**: el repositorio sirve como plantilla de comparación de algoritmos de regresión con pipelines de scikit-learn, mostrando el impacto de evitar fuga de datos en la validación cruzada.
- **Análisis de sensibilidad de mercado**: variando `Distance` o `Landsize` manteniendo el resto de variables fijas, se puede estudiar la elasticidad del precio respecto a la localización y la superficie en el periodo 2016-2018.
- **Detección de anomalías en anuncios**: comparar el precio publicado con la predicción del modelo y marcar desviaciones superiores a un umbral como candidatas a revisión manual (errores de listado, propiedades atípicas).
- **Prototipado de sistemas de valoración automática (AVM)**: usar el pipeline como baseline interno antes de invertir en modelos con datos actualizados y cobertura geográfica más amplia.

## Benchmarks y rendimiento

Resultados declarados en la model card (validación cruzada y conjunto de test), tal como se publicaron:

| Modelo | R² en CV (media ± desv.) | MAE medio | Tiempo de ajuste |
|---|---|---|---|
| Baseline (media) | -0,00 ± 0,00 | 0,19 | 0,2 s |
| Regresión lineal | -71B ± 92B (dato anómalo tal como figura en la model card) | 1.380.707 | 0,4 s |
| Ridge | 0,80 ± 0,01 | 0,08 | 0,3 s |
| KNN (k=10) | 0,80 ± 0,01 | 0,08 | 0,9 s |
| Árbol de decisión | 0,77 ± 0,02 | 0,08 | 0,4 s |
| Random Forest | 0,86 ± 0,01 | 0,06 | 15,5 s |
| **Gradient boosting (HistGradientBoostingRegressor)** | **0,87 ± 0,01** | **0,06** | **6,2 s** |

Conjunto de test del modelo final, según la model card:

| Métrica | Valor |
|---|---|
| R² | 0,89 |
| MAE | 0,06 (escala logarítmica) |
| MAPE | 0,96 % |

No se han publicado comparaciones con modelos externos (XGBoost, LightGBM, CatBoost) ni resultados en un benchmark público independiente. Las cifras de la fila de regresión lineal y el MAPE del 0,96 % resultan inconsistentes con el resto de la tabla y deben interpretarse con cautela (véase la sección de limitaciones).

## Requisitos de hardware

- **GPU**: no necesaria. El modelo es un conjunto de árboles evaluado en CPU; no hay soporte CUDA en scikit-learn para este estimador.
- **VRAM**: 0 GB. No aplica.
- **RAM**: no documentada explícitamente; el repositorio completo ocupa 0,1 GB y el artefacto `joblib` es una fracción de ese tamaño, por lo que un entorno con 1-2 GB de RAM libre es suficiente para cargar el modelo y el stack de Python/scikit-learn.
- **CPU**: cualquier CPU x86-64 o ARM moderna; la inferencia sobre una muestra individual es del orden de milisegundos y el entrenamiento reportado en CV es de 6,2 s para el modelo final.
- **Consumer**: sí, cabe en cualquier portátil convencional. No se requiere GPU de consumo (RTX 4090, etc.).
- **Opciones de despliegue**: carga directa con `joblib.load` en Python; servicio HTTP con FastAPI, Flask o BentoML; ejecución por lotes en un script o notebook; contenedor Docker con `requirements.txt`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput**: no disponibles de forma medida; por la naturaleza del estimador se espera latencia sub-milisegundo por muestra y throughput limitado por el parseo de entrada y el servidor HTTP, no por el modelo.

## Comparativa con modelos similares

| Modelo | Tipo | R² en CV | MAE | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HistGradientBoosting (este artefacto) | Gradient boosting (scikit-learn) | 0,87 ± 0,01 | 0,06 | Código MIT; artefacto sin licencia declarada | Hugging Face (`iaac-maai/team5-melbourne-price-prediction`) |
| Random Forest (mismo repo) | Bagging de árboles | 0,86 ± 0,01 | 0,06 | MIT (código) | Incluido en los notebooks del repositorio |
| Ridge (mismo repo) | Regresión lineal regularizada | 0,80 ± 0,01 | 0,08 | MIT (código) | Incluido en los notebooks del repositorio |
| KNN k=10 (mismo repo) | Vecinos más cercanos | 0,80 ± 0,01 | 0,08 | MIT (código) | Incluido en los notebooks del repositorio |
| XGBoost / LightGBM / CatBoost sobre el mismo dataset | Gradient boosting | No disponible | No disponible | No aplica | No evaluados en la información disponible |

No se dispone de datos para comparar con otros modelos públicos de valoración de vivienda en Melbourne; esa comparación se indica como no disponible.

## Limitaciones y advertencias

- **Dependencia crítica de la geolocalización**: el modelo se apoya fuertemente en latitud/longitud; coordenadas ausentes o imprecisas degradan la predicción de forma significativa.
- **Sesgo temporal**: los datos cubren únicamente 2016-2018. Cualquier uso sobre el mercado actual es inválido sin reentrenamiento.
- **Sesgo de selección por filas eliminadas**: el descarte de registros sin `YearBuilt` eliminó más de la mitad de las ventas con precio, lo que puede sesgar la muestra y la distribución de errores.
- **Capping de variables**: `Landsize` y algunas columnas de recuento se truncaron en los límites del IQR, y el valor 0 m² es frecuente en unidades, lo que distorsiona predicciones en inmuebles atípicos.
- **Métricas inconsistentes en la model card**: la fila de regresión lineal (R² de -71B ± 92B, MAE de 1.380.707) y un MAPE de 0,96 % son incompatibles con el resto de resultados; no deben citarse sin verificación. El MAE se expresa en escala logarítmica, no en dólares, pese a la etiqueta de la tabla.
- **Riesgo de extrapolación**: al ser un modelo de árboles, no extrapola fuera del rango de precios y features visto en entrenamiento; inmuebles de lujo o superficies extremas quedarán sistemáticamente mal estimados.
- **Licencia ambigua del artefacto**: la model card indica MIT para el código, pero Hugging Face no declara licencia para el repositorio; el dataset original es CC0. Verificar antes de cualquier uso comercial.
- **Sin mantenimiento ni validación externa**: 0 descargas, 0 likes, creado y actualizado el mismo día (2026-10-28); es un entregable académico sin proceso de revisión.
- **Metadatos incompletos**: la model card conserva el marcador `[Insert Hugging Face repository link here]`, no declara pipeline de Hugging Face, idiomas ni licencia, y no documenta los hiperparámetros finales.
- **No apto como asesoramiento financiero**: las predicciones no constituyen una tasación profesional ni tienen validez legal.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/iaac-maai/team5-melbourne-price-prediction
- Dataset Melbourne Housing Snapshot (Kaggle, CC0): https://www.kaggle.com/anthonypino/melbourne-housing-market
- Documentación de `HistGradientBoostingRegressor` (scikit-learn): https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.HistGradientBoostingRegressor.html
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
