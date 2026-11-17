# luizzhcs/house-price-predictor

## Resumen

House Price Predictor es un modelo de regresión tabular publicado por el usuario luizzhcs en Hugging Face. No se trata de un modelo de lenguaje ni de una red neuronal profunda: es un `RandomForestRegressor` de scikit-learn serializado con joblib que predice el valor mediano de viviendas en regiones de California a partir de ocho variables censales (MedInc, HouseAge, AveRooms, AveBedrms, Population, AveOccup, Latitude y Longitude). El modelo se entrena sobre el clasico dataset California Housing distribuido con scikit-learn.

Su relevancia es exclusivamente educativa y de demostracion: sirve como ejemplo minimo de extremo a extremo de un flujo de machine learning tabular (carga de datos, entrenamiento, evaluacion con MAE y R², serializacion y publicacion en el Hub). No compite con modelos de fundacion ni con soluciones de valoracion inmobiliaria en produccion.

El repositorio tiene un tamano practicamente nulo (0.0 GB reportados) y cero descargas en el momento de la consulta, con un unico "like". La model card esta redactada en portugues y no incluye informacion sobre hiperparametros, version de scikit-learn empleada ni semilla de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random Forest (scikit-learn, `RandomForestRegressor`) |
| Parametros totales | no disponible (el numero de arboles y su profundidad no se documentan) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular; entrada fija de 8 caracteristicas) |
| Tipos de cuantizacion | no aplica (serializacion joblib; no se publican variantes GGUF, ONNX ni cuantizadas) |
| Idiomas soportados | portugues (etiqueta `language: pt` en la model card); las variables de entrada son numericas, por lo que el idioma no afecta a la inferencia |
| Licencia | no disponible |
| Formato de pesos | joblib (`model.joblib`) |

## Arquitectura y entrenamiento

El modelo es un bosque aleatorio de arboles de decision para regresion, implementado en scikit-learn y persistido con joblib. Un Random Forest combina multiples arboles entrenados sobre submuestras bootstrap del dataset con seleccion aleatoria de caracteristicas en cada division, y promedia sus predicciones para reducir la varianza respecto a un arbol individual. La model card no especifica el numero de estimadores, la profundidad maxima, el criterio de division ni el resto de hiperparametros.

Los datos de entrenamiento corresponden al dataset California Housing incluido en scikit-learn, derivado del censo de 1990. Cada instancia describe un bloque censal con ocho variables: renta mediana (MedInc), antiguedad media de las viviendas (HouseAge), numero medio de habitaciones (AveRooms), numero medio de dormitorios (AveBedrms), poblacion (Population), ocupacion media (AveOccup) y coordenadas (Latitude, Longitude). La variable objetivo es el valor mediano de la vivienda, expresado en unidades de 100.000 USD. No se documenta ninguna fase de validacion cruzada, ajuste de hiperparametros ni preprocesado adicional (escalado, codificacion, tratamiento de outliers).

La unica comparacion publicada es frente a una regresion lineal entrenada sobre los mismos datos: el Random Forest obtiene MAE 0.3277 y R² 0.8046, frente a MAE 0.5332 y R² 0.5758 de la regresion lineal. El autor traduce ese MAE a un error medio aproximado de 32.773 USD.

## Capacidades

- Prediccion de regresion sobre datos tabulares: estima el valor mediano de vivienda a partir de ocho variables numericas.
- Inferencia por lotes: al ser un estimador de scikit-learn, admite arrays 2D y prediccion vectorizada sobre multiples filas.
- Integracion directa con el ecosistema Python de ciencia de datos (pandas, numpy, scikit-learn) mediante `joblib.load`.
- Descarga programatica desde el Hub con `huggingface_hub.hf_hub_download`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues mas alla de la documentacion en portugues.
- No dispone de modo de razonamiento (thinking), vision, audio ni generacion de texto.

## Casos de uso

- Docencia de pipelines de machine learning: el modelo sirve como artefacto ya entrenado para ilustrar el ciclo completo de carga de datos, entrenamiento, evaluacion y publicacion, sin necesidad de reentrenar.
- Comparacion de algoritmos en cursos de regresion: la tabla MAE/R² frente a regresion lineal permite discutir el sesgo-varianza y el valor de los ensembles de arboles con un ejemplo reproducible.
- Pruebas de integracion de `huggingface_hub` en entornos de CI: al ser un artefacto pequeno, es util para validar flujos de descarga y cache de modelos en pipelines automatizados.
- Prototipado de APIs de inferencia tabular: se puede envolver en un endpoint FastAPI que reciba las ocho variables y devuelva la prediccion, como esqueleto de un servicio de scoring.
- Demostraciones de interpretabilidad: sobre este bosque se pueden calcular importancias de caracteristicas y valores SHAP para explicar que variables (renta mediana y localizacion, tipicamente) dominan la prediccion.
- Ejercicios de analisis de errores: el MAE de aproximadamente 32.773 USD permite practicar la desagregacion del error por region geografica y discutir los limites del dataset de 1990.

## Benchmarks y rendimiento

| Modelo | MAE | R² |
|---|---:|---:|
| Regresion lineal | 0.5332 | 0.5758 |
| Random Forest (este modelo) | 0.3277 | 0.8046 |

Los valores estan en unidades de 100.000 USD. No se especifica el conjunto de evaluacion (train, validacion o test), lo que limita la interpretabilidad de la comparacion. No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; la inferencia se ejecuta en CPU y el artefacto ocupa practicamente nada (repositorio de 0.0 GB reportados).
- GPU: no necesaria. Cualquier CPU moderna ejecuta la prediccion en milisegundos.
- Cabe en cualquier equipo, incluidos entornos con recursos minimos (contenedores, funciones serverless, Raspberry Pi).
- Despliegue: carga directa con `joblib` en Python; no requiere vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo. Se puede servir con FastAPI, Flask, BentoML o como funcion AWS Lambda.
- Latencia y throughput: no disponibles de forma documentada; por la naturaleza del estimador, la prediccion individual es del orden de microsegundos a pocos milisegundos y el scoring por lotes escala linealmente con el numero de filas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | MAE | Licencia | Disponibilidad |
|---|---|---|---:|---:|---|---|
| House Price Predictor (luizzhcs) | Random Forest tabular | no disponible | no aplica | 0.3277 | no disponible | Hugging Face |
| Regresion lineal (baseline de la model card) | Regresion lineal | no disponible | no aplica | 0.5332 | no disponible | Referencia interna |
| Gradient Boosting / HistGradientBoosting (scikit-learn) | Arboles potenciados | no disponible | no aplica | no disponible | BSD-3 (scikit-learn) | Libreria scikit-learn |
| XGBoost / LightGBM sobre California Housing | Gradient boosting | no disponible | no aplica | no disponible | Apache 2.0 / MIT | Repositorios oficiales |

No se dispone de resultados publicados de alternativas sobre el mismo split en la informacion proporcionada, por lo que la comparacion cuantitativa se limita al baseline incluido por el autor.

## Limitaciones y advertencias

- Proyecto educativo: el propio autor advierte que las predicciones son estimaciones y no sustituyen una tasacion inmobiliaria profesional.
- Datos obsoletos: el dataset California Housing procede del censo de 1990; los precios y la estructura urbana han cambiado sustancialmente, por lo que las predicciones no reflejan el mercado actual.
- Ambito geografico restringido a California: el modelo no generaliza a otras regiones ni paises.
- Sin informacion sobre hiperparametros, semilla ni version de scikit-learn: la reproducibilidad del entrenamiento no esta garantizada y la compatibilidad de joblib puede romperse entre versiones de la libreria.
- Sin split de evaluacion documentado: los valores de MAE y R² podrian corresponder a datos de entrenamiento, lo que sobreestimaria el rendimiento real.
- Riesgo de extrapolacion: los arboles no extrapolan fuera del rango de las variables vistas en entrenamiento; entradas con valores atipicos produciran predicciones acotadas al rango observado.
- Licencia no declarada: no se puede asumir permiso de uso comercial sin consultar al autor.
- Sesgos: el dataset refleja desigualdades socioeconomicas del censo de 1990 y el modelo puede reproducir patrones de infravaloracion en zonas de renta baja.
- Cero descargas y sin pipeline declarado en el Hub: no hay evidencia de uso ni validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/luizzhcs/house-price-predictor
- Repositorio de codigo: https://github.com/Luizzhcs/house-price-predictor
- Dataset California Housing (scikit-learn): https://scikit-learn.org/stable/datasets/real_world.html#california-housing-dataset
- Documentacion de `RandomForestRegressor`: https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.RandomForestRegressor.html
- Documentacion de `huggingface_hub.hf_hub_download`: https://huggingface.co/docs/huggingface_hub/guides/download
