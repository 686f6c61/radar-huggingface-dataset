# AskarT/flight-delay-catboost

## Resumen

`AskarT/flight-delay-catboost` es un clasificador binario tabular basado en CatBoost que estima la probabilidad de que un vuelo domestico estadounidense llegue con mas de 15 minutos de retraso, siguiendo la definicion de la FAA. Lo desarrolla AskarT como parte de un proyecto de portfolio y educacion (servicio Flight Delay Prediction & Risk Analysis), y se apoya en el dataset publico 2015 Flight Delays and Cancellations del Departamento de Transporte de EE. UU. El modelo solo utiliza variables conocidas en el momento de la programacion del vuelo (aerolinea, aeropuertos de origen y destino, fecha, hora de salida programada, distancia y duracion programada), lo que evita fuga de informacion.

Tecnicamente no es un modelo de lenguaje ni una red neuronal: es un pipeline de `scikit-learn` compuesto por un transformador propio (`FlightFeatureEngineer`) y un `CatBoostClassifier` entrenado en GPU con 2500 iteraciones, profundidad 7 y `scale_pos_weight=4.2`. El repositorio publica dos variantes del mismo entrenamiento: una completa (433 MB, ROC-AUC 0.786) y una compacta (114 MB, ROC-AUC 0.779) pensada para caber en el tier gratuito de Streamlit Community Cloud.

Su relevancia es acotada y practica: sirve como referencia reproducible de un pipeline tabular de gradient boosting con ingenieria de caracteristicas (codificacion ciclica de la hora, densidad de trafico, rutas origen-destino) y como ejemplo de compromiso entre tamano de artefacto y rendimiento predictivo en un caso de aviacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline scikit-learn: transformador `FlightFeatureEngineer` + `CatBoostClassifier` (gradient boosting sobre arboles de decision con target statistics para categoricas) |
| Parametros totales | no disponible (no se declara numero de parametros; el artefacto ocupa 433 MB en la variante completa y 114 MB en la compacta) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular; entrada de 10 columnas pre-vuelo) |
| Tipos de cuantizacion | no aplica; se distribuyen dos artefactos `.pkl` con `joblib.dump(..., compress=3)` |
| Idiomas soportados | en (etiquetas y documentacion; el modelo no procesa texto libre) |
| Licencia | MIT |
| Formato de pesos | `.pkl` (pickle de scikit-learn via joblib): `model_pipeline_main.pkl` (433 MB) y `model_pipeline_compact.pkl` (114 MB) |

## Arquitectura y entrenamiento

El modelo es un clasificador tabular de gradient boosting. El pipeline encadena un transformador personalizado que construye caracteristicas derivadas a partir de las 10 columnas originales: `hour_sin` y `hour_cos` (codificacion ciclica de la hora de salida programada), `traffic_density` (salidas desde el aeropuerto de origen en ese mes, dia y hora), `AIRLINE_FLIGHT_COUNT` (salidas de la aerolinea desde el origen ese dia), `ROUTE` (par origen-destino), `plan_speed` (distancia dividida por tiempo programado), `IS_NIGHT` e `IS_WEEKEND`. Las categoricas que recibe CatBoost son `MONTH`, `DAY`, `DAY_OF_WEEK`, `AIRLINE`, `ORIGIN_AIRPORT`, `DESTINATION_AIRPORT`, `ROUTE`, `IS_WEEKEND` e `IS_NIGHT`.

El entrenamiento usa CatBoost 1.2.8 en GPU con 2500 iteraciones, learning rate 0.03, profundidad 7, `l2_leaf_reg=12`, `scale_pos_weight=4.2`, subsample Bernoulli de 0.8 y early stopping sobre AUC con 100 rondas. Los datos son las primeras 2.1 millones de filas de `flights.csv` del dataset 2015 Flight Delays and Cancellations, con split estratificado 80/20 y una tasa de positivos del 18.9 %. La unica diferencia entre variantes es `max_ctr_complexity` (4 por defecto en la completa, 3 en la compacta), que limita las combinaciones de caracteristicas categoricas para las que CatBoost almacena tablas de contadores (CTR); reducir esa complejidad recorta el artefacto de 433 MB a 114 MB y el consumo de RAM de aproximadamente 1.5 GB a 0.6 GB tras la carga, a cambio de 0.007 puntos de ROC-AUC. Se probaron configuraciones aun mas pequenas (`max_ctr_complexity` 2 y 1, entre 5 y 52 MB) que perdian entre 0.03 y 0.05 de ROC-AUC.

## Capacidades

- Clasificacion binaria tabular: probabilidad de retraso en llegada superior a 15 minutos a partir de variables conocidas antes del despegue.
- Ingenieria de caracteristicas integrada en el pipeline: codificacion ciclica horaria, densidad de trafico, rutas y velocidad planificada.
- Manejo nativo de variables categoricas de alta cardinalidad mediante target statistics de CatBoost (por ejemplo, `ROUTE` con unos 4200 valores).
- Salida de probabilidad calibrable manualmente: el umbral operativo recomendado es 0.37, orientado a favorecer el recall.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No tiene capacidades multimodales (sin vision ni audio).
- Multilingue: no; el modelo opera sobre datos estructurados y su documentacion esta en ingles.

## Casos de uso

- Priorizacion de recursos en operaciones aeroportuarias: dado un vuelo programado, el modelo devuelve una probabilidad de retraso que permite asignar personal de handling o buffers de conexion a los vuelos con mayor riesgo, usando solo informacion disponible antes de la salida.
- Estimacion de perdidas esperadas: combinado con la logica de coste basada en la FAA descrita en el servicio de referencia, la probabilidad se traduce en un coste esperado por vuelo para comparar rutas o franjas horarias.
- Analisis de riesgo por ruta y franja horaria: las caracteristicas `ROUTE`, `traffic_density` y la hora ciclica permiten identificar combinaciones origen-destino y horas del dia con mayor incidencia de retrasos.
- Explicabilidad en informes: el servicio asociado integra explicaciones SHAP, de modo que el modelo sirve para justificar ante un analista por que un vuelo concreto se marca como de alto riesgo.
- Demo educativa de MLOps tabular: el par de artefactos (completo y compacto) ejemplifica el compromiso entre tamano de modelo, RAM y metrica en un despliegue real sobre Streamlit Community Cloud.
- Base para modelos de riesgo en tiempo real: al no usar columnas posteriores al despegue, el pipeline puede alimentarse con datos de programacion de vuelos futuros sin riesgo de fuga de informacion, como punto de partida para un sistema de alertas.
- Evaluacion comparativa de configuraciones de CatBoost: el repositorio documenta el efecto de `max_ctr_complexity` sobre ROC-AUC y tamano, util como referencia para ajustar modelos tabulares con categoricas de alta cardinalidad.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente; `verified: false` en el model-index). Evaluacion sobre 408 907 vuelos de hold-out del dataset 2015 Flight Delays and Cancellations (US DOT), split del 20 % de las primeras 2.1 millones de filas.

| Metrica | Modelo completo | Modelo compacto |
|---|---|---|
| ROC-AUC | 0.786 | 0.779 |
| Recall @ umbral 0.37 | 0.818 | 0.822 |
| Precision @ umbral 0.37 | 0.306 | 0.297 |
| Recall @ umbral 0.50 | 0.660 | 0.657 |
| Precision @ umbral 0.50 | 0.396 | 0.386 |
| Tamano del pipeline en disco | 433 MB | 114 MB |
| RAM tras `joblib.load` | ~1.5 GB | ~0.6 GB |
| RAM pico durante la carga | ~2.8 GB | ~0.9 GB |

No se han publicado en la informacion disponible resultados de benchmarks frente a otros modelos en MMLU, HumanEval, GSM8K ni metricas equivalentes, por no ser aplicables a un clasificador tabular.

## Requisitos de hardware

- VRAM de GPU para inferencia: no aplica; la inferencia de CatBoost sobre este pipeline corre en CPU. El entrenamiento se realizo en GPU, pero el artefacto servido no la requiere.
- RAM para inferencia: aproximadamente 1.5 GB con el modelo completo tras la carga y unos 2.8 GB de pico durante la carga; aproximadamente 0.6 GB con el compacto y 0.9 GB de pico.
- GPU recomendadas: no disponible (no se especifica el modelo de GPU usado para entrenar; solo se indica CatBoost 1.2.8 en GPU).
- Cabe en GPU de consumo: si, en el sentido de que el entrenamiento puede ejecutarse en GPU de consumo con CatBoost, pero la inferencia no necesita GPU. El limite practico es la RAM del contenedor, no la VRAM.
- Opciones de despliegue: carga directa con `joblib` en Python 3.10 con catboost 1.2.8, scikit-learn 1.7.2, numpy 2.2.6 y pandas 2.3.3; el servicio de referencia usa Streamlit. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Restriccion de despliegue relevante: el pickle referencia la clase `src.feature_engineering.FlightFeatureEngineer`, por lo que es necesario ejecutar desde la raiz del repositorio del servicio o anadir esa ruta a `sys.path`; las versiones de las librerias deben coincidir con las indicadas.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de modelos comparables con metricas sobre el mismo dataset y split. Como referencia interna, la unica comparacion documentada es entre las dos variantes del propio modelo y las configuraciones descartadas:

| Configuracion | ROC-AUC | Tamano | RAM tras carga |
|---|---|---|---|
| Completo (`max_ctr_complexity`=4) | 0.786 | 433 MB | ~1.5 GB |
| Compacto (`max_ctr_complexity`=3) | 0.779 | 114 MB | ~0.6 GB |
| `max_ctr_complexity`=2 y 1 | 0.03-0.05 menos que el completo | 5-52 MB | no disponible |

Comparativa con alternativas externas (LightGBM, XGBoost, regresion logistica sobre el mismo dataset): no disponible.

## Limitaciones y advertencias

- Modelo entrenado exclusivamente con datos de 2015 de EE. UU.; los aeropuertos, aerolineas y patrones de trafico son los de ese ano, por lo que su validez fuera de ese periodo o pais no esta respaldada.
- El propio autor lo declara como demostracion de portfolio y uso educativo, no como herramienta operativa.
- Probabilidades sin calibrar: `predict_proba` no esta calibrado, de modo que el umbral 0.37 debe reajustarse si se usa en un contexto con distinta relacion coste-beneficio.
- Precision baja en el umbral operativo (0.306 en el modelo completo): aproximadamente dos de cada tres alertas son falsos positivos, un coste asumido deliberadamente para maximizar el recall (0.818).
- Riesgo de alucinacion: no aplica en el sentido habitual, pero el modelo puede producir predicciones con alta confianza en rutas o combinaciones poco representadas en el conjunto de entrenamiento; no se documenta analisis de sesgo por aerolinea, aeropuerto ni grupo demografico.
- Dependencia estricta de versiones (Python 3.10, catboost 1.2.8, scikit-learn 1.7.2, numpy 2.2.6, pandas 2.3.3) y de la ruta de importacion de la clase personalizada, lo que complica la portabilidad del artefacto.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero la licencia del dataset de origen (US DOT via Kaggle) debe verificarse por separado antes de un uso productivo.
- Solo admite entradas en el esquema de columnas previsto; no procesa texto libre ni otros idiomas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AskarT/flight-delay-catboost
- Demo en vivo: https://flight-delay-askar.streamlit.app
- Pagina del proyecto (Space): https://huggingface.co/spaces/AskarT/flight-delay-risk
- Repositorio del servicio: https://github.com/Askar-Turanazarov/FlightDelay-Service
- Dataset de entrenamiento: https://www.kaggle.com/datasets/usdot/flight-delays
