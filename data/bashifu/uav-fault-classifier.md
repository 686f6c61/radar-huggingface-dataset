# Bashifu/uav-fault-classifier

## Resumen

UAV fault classifier es un clasificador tabular desarrollado por el usuario Bashifu que predice la clase de fallo de una ventana de vuelo de un vehiculo aereo no tripulado (UAV) a partir de su telemetria. No es un modelo de lenguaje: se trata de un estimador de gradient boosting serializado con joblib, entrenado sobre el dataset sintetico [`Bashifu/uav-fault-symptom-reports`](https://huggingface.co/datasets/Bashifu/uav-fault-symptom-reports).

El modelo recibe las 20 columnas de telemetria de una ventana de cinco segundos (voltaje, salida de motor, vibracion, calidad de senal GPS y senales relacionadas) y devuelve una de siete clases: `normal` o una de seis familias de fallo. Su relevancia practica esta en el ambito del mantenimiento predictivo y el diagnostico de fallos (FDD) en UAV: ofrece un baseline ligero, ejecutable en CPU y con licencia MIT, que puede integrarse en pipelines de analisis de vuelo o servir de referencia para comparar metodos mas complejos.

El modelo se publico en Hugging Face con licencia MIT y, en el momento de la consulta, acumula 0 descargas y 0 "likes". El autor declara una exactitud de test del 79,3 % y un F1 macro de 0,797 sobre vuelos no vistos durante el entrenamiento ni la seleccion del modelo, con una limitacion explicita: los fallos de baja severidad, los vuelos con bajo voltaje y las perturbaciones ambientales concentran la mayor parte de los errores.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosting (arboles de decision potenciados) sobre datos tabulares; serializado con joblib |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable; ventana de 5 segundos de telemetria con 20 columnas |
| Tipos de cuantizacion | no aplicable; el artefacto distribuido es `model.joblib`, no pesos de red neuronal |
| Idiomas soportados | no aplicable; la entrada es numerica tabular, no texto |
| Licencia | MIT |
| Formato de pesos | joblib (`model.joblib`) acompanado de `metadata.json` |
| Numero de clases | 7 (`normal` mas 6 familias de fallo) |
| Caracteristicas de entrada | 20 columnas de telemetria de una ventana de 5 s (voltaje, salida de motor, vibracion, calidad de GPS y senales relacionadas) |
| Pipeline declarado | tabular-classification |
| Tamano del repositorio | 0,0 GB |
| Autor | Bashifu |
| Fecha de creacion | 2026-09-24 |
| Fecha de ultima actualizacion | 2026-09-23 |

## Arquitectura y entrenamiento

La arquitectura es un ensemble de gradient boosting, es decir, una secuencia de arboles de decision entrenados de forma aditiva para minimizar una funcion de perdida sobre datos tabulares. El modelo se distribuye como un objeto joblib que se carga con `joblib.load` y se invoca mediante `model.predict`, por lo que depende de la pila de scikit-learn para su ejecucion. El autor no documenta el numero de arboles, la profundidad maxima, la tasa de aprendizaje ni el algoritmo exacto de boosting empleado: esos hiperparametros figuran como no disponibles.

El entrenamiento se realizo sobre el dataset sintetico [`Bashifu/uav-fault-symptom-reports`](https://huggingface.co/datasets/Bashifu/uav-fault-symptom-reports), un conjunto tabular de entre 10 000 y 100 000 filas y aproximadamente 5,68 MB en formato Parquet. Al tratarse de datos sinteticos de origen academico, no se emplearon tecnicas de alineacion tipo RLHF o DPO, propias de modelos generativos, ni se documenta ningun proceso de aumento de datos. La evaluacion se hizo sobre vuelos completamente separados del conjunto de entrenamiento y del de seleccion de modelo. El proyecto incluye ademas una etapa de post-procesado consistente en agregar el resultado de cinco ventanas consecutivas ("consenso de cinco ventanas") y un analisis de ablacion, descritos en el notebook 02b, cuyos resultados numericos no se reproducen en la model card.

## Capacidades

- Clasificacion multietiqueta de ventana unica: asigna una de siete clases (`normal` o seis familias de fallo) a partir de 20 variables de telemetria de cinco segundos.
- Agregacion por consenso: el pipeline del proyecto contempla combinar cinco ventanas de vuelo para producir una decision a nivel de vuelo o de tramo.
- Deteccion de fallos en telemetria: orientado especificamente a la deteccion de anomalias en voltaje, salida de motor, vibracion y calidad de GPS.
- Ejecucion en CPU: al ser un modelo de gradient boosting tabular, la inferencia no requiere GPU.
- No dispone de generacion de texto, razonamiento en lenguaje natural, generacion de codigo ni capacidades matematicas simbolicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso mas alla del post-procesado por consenso de ventanas implementado externamente.
- No tiene capacidades multilingues, de vision ni de audio; su entrada es exclusivamente numerica.

## Casos de uso

- Mantenimiento predictivo de flota: ejecutar el clasificador sobre cada ventana de cinco segundos de telemetria descargada tras el vuelo para marcar que tramos presentan patrones compatibles con fallo y priorizar inspecciones. Es adecuado por su bajo coste computacional y porque la salida es directamente interpretable en siete clases operativas.
- Triaje automatico de registros de vuelo: procesar por lotes los ficheros de telemetria de una flota y clasificar cada vuelo segun los tramos anomalos detectados, de modo que los ingenieros revisen primero los casos con mayor concentracion de predicciones de fallo.
- Pre-diagnostico en banco de pruebas o simulacion hardware-in-the-loop: integrar el modelo en un banco de ensayos para verificar que las senales sinteticas inyectadas se clasifican en la familia de fallo esperada, sin necesidad de GPU ni de infraestructura de inferencia dedicada.
- Etiquetado asistido de nuevos datos: usar las predicciones como pre-etiquetado en procesos de anotacion manual de telemetria, con revision humana obligatoria dado que la entrada es sintetica.
- Baseline reproducible para investigacion en FDD: comparar metodos nuevos (redes neuronales, filtros de Kalman extendidos, modelos de atencion) contra un clasificador tabular sencillo y con licencia permisiva, controlando exactamente las mismas caracteristicas y el mismo protocolo de evaluacion.
- Docencia y prototipado rapido: demostrar un flujo completo de clasificacion tabular (descarga del modelo, carga con joblib, lectura de `metadata.json`, prediccion) en cursos o talleres con recursos limitados.
- Filtro previo en cadenas de analisis mas costosas: descartar ventanas claramente normales antes de aplicar un modelo mas pesado, reduciendo el volumen de datos que llega a las etapas caras del pipeline.

## Benchmarks y rendimiento

El autor publica dos metricas medidas sobre vuelos no vistos durante el entrenamiento ni la seleccion del modelo:

| Metrica | Valor | Conjunto de evaluacion |
|---|---|---|
| Exactitud (ventana individual) | 79,3 % | Vuelos no vistos en entrenamiento ni seleccion de modelo |
| F1 macro (ventana individual) | 0,797 | Vuelos no vistos en entrenamiento ni seleccion de modelo |
| Exactitud con consenso de cinco ventanas | no disponible; se remite al notebook 02b, seccion sobre consenso | no disponible |
| Recall de deteccion de fallos | no disponible; se remite al notebook 02b, parte F | no disponible |

No se han publicado resultados comparativos frente a otros modelos sobre el mismo conjunto de datos. Los articulos localizados en la busqueda web (por ejemplo, el 91 % de exactitud declarado en un enfoque de diagnostico de fallos para multirrotores publicado en MDPI, o CLFDNet) emplean datasets, tareas y protocolos de evaluacion distintos, por lo que sus cifras no son directamente comparables con el 79,3 % de este modelo.

## Requisitos de hardware

- VRAM estimada: no se requiere GPU; la inferencia se ejecuta en CPU con la pila de scikit-learn.
- Memoria principal: no se publican requisitos. El repositorio ocupa 0,0 GB y el modelo se carga como un objeto joblib, por lo que el consumo es muy inferior al de una red neuronal, pero no se dispone de cifras exactas.
- GPU recomendadas: no aplicable; el modelo no esta disenado para aceleracion por GPU.
- Compatibilidad con GPU de consumo: no aplicable. Si se desea aceleracion, la exportacion a ONNX u otros formatos no esta documentada (no disponible).
- Opciones de despliegue: carga directa con `joblib.load` en Python; integracion en servicios HTTP (FastAPI, Flask) o en procesos por lotes con pandas. No hay integraciones oficiales publicadas con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo o enfoque | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Bashifu/uav-fault-classifier | Gradient boosting tabular | no disponible | Ventana de 5 s, 20 variables | 79,3 % de exactitud; F1 macro 0,797 | MIT | Hugging Face |
| Sistema de recuperacion basado en texto del mismo proyecto | Retrieval sobre informes de sintomas | no disponible | no disponible | no disponible; comparte con este modelo los errores en fallos de baja severidad | no disponible | no disponible |
| Enfoque de diagnostico de fallos para multirrotores (MDPI, 2023) | No especificado en el extracto | no disponible | no disponible | 91 % de exactitud declarada | no disponible | Publicacion cientifica |
| CLFDNet | No especificado en el extracto | no disponible | no disponible | Comparado con RF, XGB, KNN, SVM y NB | no disponible | Publicacion cientifica |

Las comparaciones con los enfoques academicos no son concluyentes: los articulos localizados evaluan sobre plataformas, sensores y tasas de muestreo diferentes, y en ningun caso se especifica si el dataset es el mismo. No se han identificado alternativas publicadas sobre el mismo conjunto de datos sintetico.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sinteticos de origen academico; el autor indica explicitamente que no esta certificado para uso en aeronaves reales ni para operacion autonoma.
- Las ventanas de fallo de baja severidad, los vuelos con bajo voltaje y los vuelos con perturbaciones ambientales se confunden con frecuencia con vuelo normal, lo que genera falsos negativos. El autor lo describe como una limitacion de la senal subyacente y no como un error corregible del modelo.
- Las importancias de caracteristicas y los analisis de ablacion describen el comportamiento estadistico del modelo, no una relacion causal entre senales y fallos reales.
- El modelo no valida su propia entrada: el orden de las columnas de caracteristicas y el orden de las clases de salida deben coincidir exactamente con lo indicado en `metadata.json`. Cualquier reordenacion produce predicciones silenciosamente incorrectas.
- No se documentan sesgos demograficos ni linguisticos porque no procede (no hay entrada de texto ni de personas), pero tampoco se publica ningun analisis de sesgo por tipo de aeronave, condicion de vuelo o escenario de simulacion.
- Riesgo de alucinacion no aplicable; el riesgo equivalente es la sobreconfianza en predicciones erroneas sobre clases minoritarias o poco representadas, agravado por la ausencia de probabilidades calibradas publicadas.
- La licencia MIT permite uso comercial y modificacion sin restricciones, pero se ofrece sin garantia alguna; el autor no asume responsabilidad por decisiones operativas tomadas a partir de las predicciones.
- Con 0 descargas y 0 "likes" en el momento de la consulta, no existe validacion independiente por parte de terceros ni reportes de uso en produccion.
- No hay informacion sobre la distribucion de clases del dataset, el tamano exacto del conjunto de test ni el numero de vuelos evaluados, lo que dificulta valorar la robustez de las metricas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bashifu/uav-fault-classifier
- Dataset de entrenamiento: https://huggingface.co/datasets/Bashifu/uav-fault-symptom-reports
- Rama Parquet del dataset: https://huggingface.co/datasets/Bashifu/uav-fault-symptom-reports/tree/refs%2Fconvert%2Fparquet/default
- Revision de metodologias de deteccion y diagnostico de fallos en UAV (Springer, 2025): https://link.springer.com/article/10.1007/s10846-025-02267-8
- Identificacion inteligente de fallos en vehiculos de vuelo mediante clasificadores bayesianos (ScienceDirect): https://www.sciencedirect.com/science/article/pii/S2405896325032835
- Deteccion de fallos en tiempo real en multirrotores (Springer): https://link.springer.com/article/10.1007/s40747-025-02195-y
- Diagnostico inteligente de fallos para multirrotores (MDPI): https://www.mdpi.com/2504-446X/7/2/82
- Notebook 02b citado en la model card: no disponible (no se ha localizado un enlace publico)
