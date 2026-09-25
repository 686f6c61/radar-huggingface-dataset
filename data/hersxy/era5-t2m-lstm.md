# hersxy/era5-t2m-lstm

## Resumen

era5-t2m-lstm es un modelo de series temporales desarrollado por el usuario hersxy y publicado en Hugging Face, cuyo objetivo es predecir las siguientes 24 horas de temperatura del aire a 2 metros (variable `2m_temperature`, t2m) en cualquier celda de la rejilla ERA5 dentro de una region concreta de Norteamerica. El modelo toma como entrada las 72 horas previas de esa misma celda y devuelve 24 valores horarios. Se trata de un unico modelo compartido para todas las celdas: la localizacion geografica entra como entrada adicional mediante latitud y longitud normalizadas, en lugar de entrenar un modelo por celda.

Tecnicamente es una red recurrente sencilla: dos capas LSTM de 128 unidades con dropout de 0,1 y una capa densa lineal de salida de 24 neuronas, con 204.312 parametros en total, implementada en Keras 3.13.2 sobre TensorFlow 2.20.0. Los datos de entrenamiento provienen del reanalisis ERA5 (resolucion horaria, rejilla de 0,25 grados, 62 x 84 celdas), con particion cronologica estricta: entrenamiento 2021-2023, validacion 2024 y test 2025. Es relevante como referencia reproducible y ligera frente a los modelos meteorologicos fundacionales de gran tamano, y como linea base de prediccion regional a corto plazo que puede ejecutarse sin GPU dedicada.

La informacion disponible es limitada: no hay datos de idiomas (no es un modelo de lenguaje), no se documentan procesos de RLHF/DPO ni esquemas de cuantizacion, y el repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que se trata de un artefacto de investigacion con validacion externa escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red recurrente: 2 x LSTM(128) con dropout 0.1 + Dense(24) lineal |
| Parametros totales | 204.312 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 72 pasos horarios de entrada (72 h de historico por celda); horizonte de salida de 24 pasos horarios |
| Tipos de cuantizacion | no disponible (no se documenta ninguna en la informacion proporcionada) |
| Idiomas soportados | no disponible / no aplica (modelo numerico de series temporales, no procesa texto) |
| Licencia | MIT |
| Formato de pesos | Keras 3 (`model.keras`); ficheros auxiliares `scaler.json` y `config.json` |
| Framework | Keras 3.13.2 / TensorFlow 2.20.0 |
| Variable objetivo | Temperatura del aire a 2 m (`2m_temperature`, ERA5) |
| Region de validez | 41,75 grados N - 57,0 grados N, 95,0 grados W - 74,25 grados W (62 x 84 celdas) |
| Resolucion espacial y temporal | Rejilla de 0,25 grados, paso horario |
| Normalizacion | z-score con media 276,424 K y desviacion tipica 13,571 K (calculadas solo con el conjunto de entrenamiento, `scaler.json`) |
| Tamano del repositorio | 0,0 GB (segun metadatos del Hub) |
| Descargas / likes | 0 descargas / 1 like |
| Fecha de creacion en el Hub | 2026-09-24 |

## Arquitectura y entrenamiento

La arquitectura es un apilamiento recurrente clasico. La entrada tiene forma `(72, 7)`: 72 pasos temporales horarios y 7 caracteristicas por paso. Las caracteristicas son `t2m_norm` (temperatura normalizada), codificaciones seno/coseno de la hora del dia, codificaciones seno/coseno del dia del ano (en UTC) y latitud y longitud normalizadas (`lat_norm = (lat - 41,75) / 15,25`; `lon_norm = (lon - (-95,0)) / 20,75`). Es decir, la unica variable fisica es la temperatura pasada de la propia celda: no se incorporan viento, presion, humedad ni celdas vecinas. Las dos capas LSTM de 128 unidades procesan la secuencia y la capa densa final proyecta a 24 salidas lineales, una por hora de prediccion.

Los datos proceden del reanalisis ERA5 del Copernicus Climate Data Store (informacion modificada del Copernicus Climate Change Service, 2021-2025). La particion es cronologica: entrenamiento del 1 de enero de 2021 al 31 de diciembre de 2023, validacion durante 2024 y test durante 2025. La evaluacion de test se realizo sobre todas las celdas con un instante inicial (t0) cada 6 horas, sumando 7.525.560 ventanas. No se documenta en la informacion disponible ningun proceso de ajuste por refuerzo, DPO, destilacion, decodificacion especulativa ni mecanismo de atencion: se trata de entrenamiento supervisado directo con perdida de regresion (metricas declaradas: RMSE y MAE).

## Capacidades

- Prediccion horaria de temperatura a 2 m hasta 24 horas de horizonte, a partir de las 72 horas previas de la misma celda.
- Generalizacion espacial dentro de la region de entrenamiento: un unico modelo cubre las 62 x 84 celdas mediante latitud y longitud normalizadas como entrada.
- Modelado de ciclos temporales diarios y estacionales gracias a las codificaciones seno/coseno de hora y dia del ano.
- Regresion multihorizonte en una sola pasada: la capa de salida devuelve los 24 pasos de golpe en lugar de iterar de forma autorregresiva.
- Supera a la linea base de persistencia en el conjunto de test: habilidad (skill) de 0,322 frente a persistencia.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, vision, audio ni generacion de texto.
- No tiene capacidades multilingues: no procesa lenguaje natural.

## Casos de uso

- Prediccion regional de temperatura a corto plazo: dado un historico horario de 72 horas de una celda ERA5 dentro de la region cubierta, el modelo devuelve la secuencia de 24 horas siguientes, util para boletines locales o para alimentar paneles meteorologicos internos.
- Linea base en investigacion meteorologica: sirve como referencia de comparacion (baseline) para modelos mas complejos, ya que publica RMSE por horizonte y habilidad frente a persistencia sobre un test anual completo (2025) con 7.525.560 ventanas.
- Post-proceso y comparacion con modelos numericos: su tamano (204.312 parametros) permite ejecutarlo en segundos sobre grandes volumenes de celdas para contrastar si un modelo fisico o de mayor tamano aporta mejora real frente a un LSTM simple.
- Estimacion de demanda energetica: la temperatura a 2 m a 24 horas es una variable de entrada habitual en modelos de carga electrica y de demanda de calefaccion/refrigeracion; el modelo genera la serie horaria necesaria para esas estimaciones en la region cubierta.
- Agricultura y seguimiento de heladas: la prediccion horaria a 24 horas permite detectar descensos nocturnos de temperatura en celdas concretas dentro de la region (noreste y medio oeste de Estados Unidos y sureste de Canada) y activar avisos agronomicos.
- Generacion de caracteristicas (feature engineering) para modelos aguas abajo: las 24 predicciones horarias pueden alimentar modelos de prediccion de demanda, riesgo de incendios o consumo energetico que necesiten una señal de temperatura futura normalizada.
- Experimentacion y docencia: el pipeline completo (descarga de ERA5, normalizacion con `scaler.json`, carga del modelo `.keras` y desnormalizacion) esta documentado en la model card y es reproducible en pocas lineas de Python, lo que lo hace adecuado como ejemplo didactico de forecasting con Keras.
- Evaluacion de la degradacion por horizonte: el modelo publica RMSE para los horizontes 1, 3, 6, 12, 18 y 24 horas, lo que permite estudiar experimentalmente como decae la habilidad predictiva a corto plazo con un coste computacional minimo.

## Benchmarks y rendimiento

Metricas de test publicadas por el autor (ano 2025, todas las celdas, t0 cada 6 horas, 7.525.560 ventanas):

| Horizonte (h) | RMSE (K) | MAE (K) | RMSE persistencia (K) |
|---|---|---|---|
| 1 | 1,505 | 1,194 | 0,879 |
| 3 | 1,946 | 1,521 | 2,649 |
| 6 | 2,578 | 1,962 | 4,453 |
| 12 | 3,561 | 2,703 | 6,311 |
| 18 | 4,072 | 3,082 | 5,735 |
| 24 | 4,481 | 3,405 | 4,979 |
| Global | 3,462 | 2,542 | 5,106 |

Habilidad frente a persistencia: 0,322 (definida como 1 - RMSE / RMSE de persistencia). Validacion (2024): RMSE 3,256 K y habilidad frente a persistencia de 0,342.

Observacion relevante: la persistencia es mejor que el modelo en el horizonte de 1 hora (RMSE 0,879 K frente a 1,505 K) y en el de 24 horas (4,979 K frente a 4,481 K el modelo es mejor, pero la persistencia vuelve a aproximarse al modelo). No se han publicado en la informacion disponible resultados de benchmarks estandar tipo MMLU, HumanEval o GSM8K, ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- Parametros: 204.312, lo que equivale a aproximadamente 0,8 MB en fp32 (204.312 x 4 bytes). Es una cifra derivada aritmeticamente, no un dato publicado en la model card.
- VRAM estimada: no disponible como valor medido. Dado el tamano del modelo, el consumo de memoria vendra dominado por el tamano de lote y la secuencia de 72 pasos, no por los pesos; cualquier GPU con unos pocos cientos de MB libres es suficiente.
- GPU recomendadas: no se especifica ninguna en la informacion disponible. Por tamano, cualquier GPU consumer (gama GTX o RTX) o incluso CPU es suficiente para inferencia.
- Cabe en GPU consumer: si, en cualquier GPU consumer actual; tambien es viable en CPU para lotes moderados.
- Opciones de despliegue: carga nativa con Keras 3 / TensorFlow 2.20.0 mediante `keras.saving.load_model`; despliegue como servicio con TensorFlow Serving o un endpoint propio. Convertidores como ONNX o TFLite requeririan una conversion propia no documentada por el autor. vLLM, llama.cpp, Ollama y TGI no aplican, ya que no es un modelo de lenguaje transformer.
- Latencia y throughput: no disponibles (no se publican mediciones). El autor solo documenta los hiperparametros de evaluacion (t0 cada 6 horas sobre 7.525.560 ventanas), no el tiempo de inferencia.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de modelos comparables con parametros, contexto o rendimiento publicados que permitan una comparacion numerica directa. La comparacion mas solida disponible es interna, frente a la linea base de persistencia:

| Referencia | RMSE global (K) | Habilidad | Licencia | Disponibilidad |
|---|---|---|---|---|
| era5-t2m-lstm | 3,462 | 0,322 | MIT | Hugging Face (0 descargas, 1 like) |
| Persistencia (linea base) | 5,106 | 0 (referencia) | no aplica | no aplica |

Como contexto metodologico, la busqueda web devuelve el marco WeatherBench (benchmark derivado de ERA5 para prediccion meteorologica de rango medio) y trabajos academicos sobre correccion de sesgo de ERA5 con LSTM y transformers, asi como el modelo AIFL de prediccion de caudal con LSTM. Sin embargo, no se aportan en la informacion disponible sus parametros, ventanas de contexto ni metricas comparables con las de este modelo, por lo que no se incluyen cifras.

## Limitaciones y advertencias

- Validez espacial restringida: el modelo solo es valido dentro de la region de entrenamiento (41,75 grados N - 57,0 grados N, 95,0 grados W - 74,25 grados W). Fuera de esa caja delimitadora las predicciones no tienen garantia.
- Entrada univariante: solo utiliza la temperatura pasada de la misma celda mas codificaciones de tiempo y localizacion. No incorpora viento, presion, humedad, radiacion ni celdas vecinas, lo que limita su capacidad ante cambios de masa de aire.
- Deriva climatica y eventos extremos: entrenado con 2021-2023, sin garantia de comportamiento fuera de ese rango temporal ni en episodios extremos no representados en el periodo de entrenamiento.
- Formato y unidades estrictos: requiere entradas horarias tipo ERA5 en kelvin, normalizadas exactamente como indica la model card (`scaler.json`). Introducir datos con otra normalizacion, otra rejilla o en grados Celsius produce resultados incorrectos.
- Inferioridad frente a la persistencia en horizontes muy cortos: con RMSE de 1,505 K a 1 hora frente a 0,879 K de la persistencia, no es la opcion adecuada si solo se necesita la prediccion inmediata.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe riesgo de predicciones fisicamente implausibles fuera del dominio de entrenamiento (por ejemplo, valores de temperatura incoherentes en regimenes no vistos).
- Sin resultados de benchmarks externos: no hay evaluacion independiente, comparacion con modelos numericos de referencia (por ejemplo, IFS o GFS) ni validacion por parte de terceros. El repositorio registra 0 descargas, lo que indica adopcion nula.
- Licencia: MIT, lo que permite uso comercial y modificacion sin restricciones, siempre que se conserve el aviso de copyright. No obstante, los datos de origen ERA5/Copernicus tienen sus propias condiciones de atribucion, y la model card incluye la nota "Contains modified Copernicus Climate Change Service information 2021-2025".
- Caveat de produccion: los ficheros de normalizacion (`scaler.json`) y configuracion (`config.json`) son imprescindibles y deben versionarse junto al modelo; un desajuste entre escalador y pesos invalida silenciosamente las salidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hersxy/era5-t2m-lstm
- Explorador de modelos de Hugging Face: https://huggingface.co/models
- WeatherBench, benchmark derivado de ERA5 para prediccion meteorologica: https://www.emergentmind.com/topics/weatherbench
- LSTM and Transformer-based framework for bias correction of ERA5 hourly data: https://www.sciencedirect.com/science/article/pii/S0360544225021401
- AIFL, modelo LSTM de prediccion global de caudal: https://www.sciencedirect.com/science/article/pii/S0022169426011613
- ERA5 / Copernicus Climate Data Store (fuente de los datos): https://cds.climate.copernicus.eu
