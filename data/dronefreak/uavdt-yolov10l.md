# dronefreak/uavdt-yolov10l

## Resumen

uavdt-yolov10l es un detector de objetos YOLOv10l afinado sobre el conjunto de datos UAVDT (UAV Detection and Tracking), un benchmark de imagenes aereas captadas por drones en escenarios de trafico urbano. Lo publica el usuario dronefreak como parte de DetectionBench, un framework cuyo objetivo es reproducir la evaluacion de detectores modernos bajo recetas de entrenamiento y metricas identicas, de modo que las comparaciones entre arquitecturas sean homogeneas.

El modelo parte de Ultralytics/YOLOv10 (variante "l", large) y predice tres clases: coche, camion y autobus. Cuenta con 25,9 millones de parametros y 127,9 GFLOPs por imagen a 640 px, lo que lo situa en la gama alta de la familia YOLO en coste computacional. Sobre el split de test de UAVDT declara un mAP@50 de 29,16 y un mAP@50-95 de 16,54, con precision 36,9 y recall 35,6.

Su relevancia es sobre todo metodologica y de nicho: sirve como punto de referencia reproducible para deteccion de vehiculos en imagenes aereas y como ejemplo de entrenamiento de YOLOv10 con el stack Ultralytics. No es un modelo de lenguaje ni un modelo multimodal: es exclusivamente un detector de objetos de vision por computador, distribuido bajo licencia AGPL-3.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector convolucional YOLOv10 (variante large), derivado de Ultralytics/YOLOv10 |
| Parametros totales | 25,9 M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de vision; no procesa texto) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada. Al usar el framework Ultralytics, el modelo es exportable a formatos como ONNX, TensorRT, OpenVINO, TFLite o CoreML, pero la model card no documenta cuantizaciones concretas |
| Idiomas soportados | No aplica (modelo de vision) |
| Licencia | AGPL-3.0 |
| Formato de pesos | Checkpoint PyTorch en formato Ultralytics (`best.pt`); tamano del repositorio 0,1 GB |
| Computo por imagen | 127,9 (la model card lo indica como 127.9B a 640 px) |
| Framework | Ultralytics |
| Tarea (pipeline) | object-detection |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de YOLOv10, un detector convolucional de una sola etapa, sin anclas y disenado para inferencia sin NMS (non-maximum suppression) gracias a un esquema de asignacion dual consistente durante el entrenamiento. La variante "l" (large) es la de mayor capacidad de la familia YOLOv10 publicada por Ultralytics, con 25,9 M de parametros en esta configuracion afinada y 127,9 GFLOPs por imagen a 640 px.

El ajuste fino se realizo sobre UAVDT, un dataset de imagenes aereas de vehiculos en entornos de trafico, con tres clases anotadas (car, truck, bus). Segun la model card, el entrenamiento y la evaluacion siguen la receta estandar de DetectionBench, que fija hiperparametros y pipeline de evaluacion (`detectionbench-evaluate`) para todos los modelos del benchmark. La seccion "Training Configuration" de la model card aparece truncada en la informacion disponible, por lo que no se pueden confirmar detalles como el numero de epocas, el optimizador, la resolucion de entrada exacta ni si hubo tecnicas de aumento de datos especificas. No se documenta el uso de RLHF ni DPO, algo que no aplica a un detector de objetos.

## Capacidades

- Deteccion de objetos en imagenes aereas captadas desde dron (aerial imagery, UAV).
- Clasificacion y localizacion de tres clases: coche, camion y autobus.
- Deteccion de objetos pequenos (etiqueta small-object-detection), un caso tipico en imagenes aereas de gran altitud.
- Salida estandar de deteccion: cajas delimitadoras con clase asignada y puntuacion de confianza, consumible directamente con la API `model.predict()` de Ultralytics.
- Inferencia en imagen suelta o en lotes mediante el framework Ultralytics.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues, de generacion de texto, vision-lenguaje, audio ni modo de razonamiento (thinking mode). Es un modelo puramente perceptivo.

## Casos de uso

- Monitorizacion de trafico desde dron: el modelo detecta vehiculos en fotogramas aereos y permite estimar densidad y ocupacion de una via sin necesidad de infraestructura viaria fija. Es adecuado para este escenario porque esta entrenado especificamente con UAVDT, que captura trafico urbano desde perspectiva aerea.
- Aforo y conteo de vehiculos en aparcamientos o recintos: aplicando el detector sobre imagenes cenitales se pueden contar plazas ocupadas. La clase "car" alcanza un mAP@50 de 72,99 en el split de test, lo que lo hace viable para esta tarea concreta.
- Estudios de movilidad y planificacion urbana: procesando secuencias de imagenes aereas se puede construir un historico de flujo vehicular por franjas horarias para analisis de demanda de transporte.
- Investigacion academica en deteccion aerea: al formar parte de DetectionBench, el modelo sirve como baseline reproducible para comparar arquitecturas bajo la misma receta y el mismo pipeline de evaluacion.
- Prototipado rapido con Ultralytics: al cargarse con `YOLO(weights)` y ejecutarse con `model.predict(source=..., conf=0.25)`, es inmediato integrarlo en notebooks, scripts de analisis o demos de vision por computador.
- Etapa de preanotacion en pipelines de etiquetado: el modelo puede generar cajas candidatas sobre imagenes de dron para que un anotador humano las revise, reduciendo el coste de construir nuevos datasets aereos. Solo es recomendable para la clase "car" dada la baja calidad en las otras clases.
- Vigilancia de infraestructuras lineales (carreteras, autopistas): combinado con un sistema de captura aerea periodica, permite detectar congestiones o acumulaciones anomalas de vehiculos en tramos concretos.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de **test** de UAVDT, obtenidos con el pipeline estandar de DetectionBench. Todas las metricas aparecen con `verified: false` en el model-index, es decir, no han sido verificadas de forma independiente.

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 29,16 |
| mAP@50-95 | 16,54 |
| Precision | 36,9 |
| Recall | 35,6 |
| F1 | 36,24 |

Rendimiento por clase en el split de test:

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| car | 72,99 | 39,54 |
| truck | 6,32 | 4,24 |
| bus | 8,17 | 5,84 |

Comparativa del zoo de modelos evaluados por DetectionBench sobre UAVDT (mismos datos y misma receta de evaluacion, segun el autor):

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| YOLO26m | 33,43 | 19,56 | 38,14 | 39,84 |
| RF-DETR Medium | 33,28 | 20,54 | 73,03 | 70,03 |
| YOLO26s | 32,98 | 19,61 | 43,86 | 40,38 |
| RF-DETR Nano | 32,78 | 20,31 | 73,60 | 66,98 |
| YOLO26l | 32,64 | 18,75 | 40,17 | 36,45 |
| RF-DETR Small | 32,62 | 20,21 | 73,83 | 71,63 |
| YOLOv9s | 31,82 | 18,71 | 39,83 | 38,12 |
| YOLOv8m | 31,42 | 18,80 | 40,27 | 37,79 |
| YOLO11m | 30,47 | 17,71 | 37,70 | 37,01 |
| YOLOv10m | 30,12 | 17,33 | 40,13 | 35,68 |
| YOLOv9m | 29,43 | 16,97 | 35,92 | 35,70 |
| YOLOv9t | 29,42 | 17,03 | 35,75 | 36,47 |
| **YOLOv10l (este modelo)** | **29,16** | **16,54** | **36,90** | **35,60** |
| YOLOv9c | 29,16 | 16,46 | 35,38 | 34,35 |
| YOLO11s | 29,10 | 17,16 | 34,32 | 37,31 |
| YOLO26n | 28,88 | 16,79 | 33,14 | 35,66 |
| YOLOv8l | 28,86 | 17,27 | 38,33 | 32,86 |
| YOLOv10s | 28,85 | 16,48 | 36,53 | 33,16 |
| YOLO11l | 28,64 | 17,16 | 34,75 | 34,02 |
| YOLO11n | 28,56 | 16,30 | 38,04 | 32,26 |
| YOLOv8n | 27,80 | 15,34 | 35,42 | 33,61 |
| YOLOv10n | 27,17 | 15,16 | 33,30 | 31,21 |
| YOLOv8s | 27,12 | 15,33 | 34,65 | 31,87 |

## Requisitos de hardware

- Peso de los parametros: aproximadamente 104 MB en FP32, 52 MB en FP16 y 26 MB en INT8 (estimacion a partir de los 25,9 M de parametros indicados en la model card). Los pesos publicados ocupan 0,1 GB en el repositorio.
- VRAM estimada para inferencia: del orden de 1 a 2 GB con lote 1 a 640 px en FP16, sumando pesos, activaciones y buffers del framework. No hay mediciones publicadas por el autor.
- Cabe sin problema en GPU de consumo: una RTX 3060 de 12 GB, una RTX 4060 de 8 GB o una RTX 4090 pueden ejecutarlo con margen de sobra. Tambien es viable en GPUs integradas o en CPU para inferencia no critica en tiempo real.
- GPU recomendadas para produccion: NVIDIA T4, L4 o A10 para despliegue en servidor; A100 o H100 si se necesita procesar flujos de video de alta resolucion con lotes grandes.
- Opciones de despliegue: inferencia nativa con `ultralytics` sobre PyTorch, exportacion a ONNX Runtime, TensorRT, OpenVINO, TFLite o CoreML mediante las utilidades de Ultralytics. vLLM, llama.cpp, Ollama y TGI no son aplicables a este modelo, ya que estan orientados a modelos de lenguaje y no a detectores de objetos.
- Latencia y throughput: no disponibles en la informacion proporcionada. El dato de 127,9 GFLOPs por imagen a 640 px es la unica referencia de coste computacional publicada.

## Comparativa con modelos similares

Comparativa frente a alternativas del mismo zoo de DetectionBench, evaluadas sobre el mismo split de test de UAVDT.

| Modelo | Parametros | mAP@50 | mAP@50-95 | Precision | Recall | Licencia |
|---|---|---|---|---|---|---|
| YOLOv10l (este modelo) | 25,9 M | 29,16 | 16,54 | 36,90 | 35,60 | AGPL-3.0 |
| YOLOv9c | No disponible | 29,16 | 16,46 | 35,38 | 34,35 | No disponible en esta ficha |
| YOLO11l | No disponible | 28,64 | 17,16 | 34,75 | 34,02 | No disponible en esta ficha |
| YOLOv10m | No disponible | 30,12 | 17,33 | 40,13 | 35,68 | AGPL-3.0 (familia YOLOv10) |
| RF-DETR Medium | No disponible | 33,28 | 20,54 | 73,03 | 70,03 | No disponible en esta ficha |

Observaciones a partir de los datos proporcionados: el YOLOv10m, de menor tamano, supera a este YOLOv10l en todas las metricas agregadas sobre UAVDT (30,12 frente a 29,16 en mAP@50), lo que sugiere que el aumento de capacidad no se traduce en mejor rendimiento en este dataset concreto. Los modelos de la familia RF-DETR obtienen una precision y un recall muy superiores (por encima de 70 frente a 36,9 y 35,6), aunque con un mAP@50 ligeramente mayor. No se dispone de datos de parametros ni de licencia de los modelos comparados en la informacion facilitada.

## Limitaciones y advertencias

- Rendimiento muy desequilibrado por clase: la clase "car" alcanza 72,99 de mAP@50, mientras que "truck" (6,32) y "bus" (8,17) estan practicamente sin detectar. En la practica, el modelo solo es utilizable para deteccion de turismos.
- Metricas agregadas bajas: un mAP@50 de 29,16 y un mAP@50-95 de 16,54 sobre el split de test indican una precision global modesta y un riesgo alto de falsos positivos y falsos negativos.
- Metricas no verificadas: el model-index marca todas las entradas con `verified: false`, por lo que los numeros proceden unicamente del autor y no de una evaluacion independiente.
- Riesgo de sobreajuste al dominio: entrenado exclusivamente con UAVDT (trafico urbano aereo), es probable que degrade su rendimiento ante cambios de altitud, angulo de camara, condiciones meteorologicas, iluminacion o sensores distintos.
- Objetos pequenos y oclusiones: aunque el modelo esta etiquetado como small-object-detection, la deteccion de vehiculos pequenos y parcialmente ocluidos en imagenes aereas sigue siendo un escenario dificil y no se documentan resultados especificos por tamano de objeto.
- Licencia AGPL-3.0: es una licencia copyleft fuerte. El uso comercial esta permitido, pero si se distribuye el modelo o se ofrece como servicio en red, la AGPL obliga a poner a disposicion el codigo fuente correspondiente. Conviene revisar las obligaciones antes de integrarlo en un producto propietario. El modelo base Ultralytics/YOLOv10 se distribuye tambien bajo AGPL-3.0.
- Ausencia de adopcion: el repositorio registra 0 descargas y 0 "likes", y no se documenta ningun caso de uso en produccion ni validacion externa. Tratarlo como un experimento de benchmark, no como un modelo listo para produccion.
- Informacion de entrenamiento incompleta: la tabla de configuracion de entrenamiento de la model card aparece truncada en la informacion disponible, lo que impide reproducir el ajuste fino con exactitud.
- Sin soporte de idioma, texto ni tareas generativas: cualquier aplicacion que requiera descripcion de escenas, dialogo o razonamiento necesita un componente adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/uavdt-yolov10l
- Dataset UAVDT en HuggingFace: https://huggingface.co/datasets/dronefreak/UAVDT
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Paper del dataset UAVDT (referencia arxiv:1804.00518): https://arxiv.org/abs/1804.00518
- Paper de YOLOv10 (referencia arxiv:2405.14458): https://arxiv.org/abs/2405.14458

Nota: la busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo ni sobre DetectionBench; los enlaces anteriores proceden de la model card y de las etiquetas del repositorio de HuggingFace. No se dispone de demo publicada, informe tecnico propio ni publicacion adicional del autor.
