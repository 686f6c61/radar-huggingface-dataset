# dronefreak/uavdt-yolo11l

## Resumen

uavdt-yolo11l es un detector de objetos YOLO11l afinado por el usuario dronefreak sobre el conjunto de datos UAVDT (Unmanned Aerial Vehicle Benchmark), orientado a la deteccion de vehiculos en imagenes aereas captadas por drones. El modelo parte de los pesos preentrenados Ultralytics/YOLO11 y se ha reentrenado como parte de DetectionBench, un marco que busca reproducir el entrenamiento de detectores modernos bajo recetas identicas para poder comparar arquitecturas de forma justa sobre distintos conjuntos de datos reales.

Se trata de un modelo denso de vision por computador, no de un modelo de lenguaje: la tarea es deteccion de objetos con tres clases (coche, camion y autobus). Cuenta con 25,4 millones de parametros y 87,6 GFLOPs a una resolucion de entrada de 640 px, lo que lo situa en el rango medio-alto de la familia YOLO11 (la variante "l" o large). El repositorio ocupa aproximadamente 0,1 GB y distribuye los pesos en formato PyTorch (.pt) listos para cargarse con la libreria Ultralytics.

Es relevante en el contexto de la vigilancia de trafico y la teledeteccion con drones, donde los objetos son pequenos y aparecen muy densos en la imagen. Los resultados en el split de test de UAVDT son modestos en terminos absolutos (mAP@50 de 28,64 %), pero el modelo se publica dentro de un zoo comparativo que permite situarlo frente a otras arquitecturas (RF-DETR, YOLO26, YOLOv8/v9/v10) bajo la misma evaluacion. La licencia es AGPL-3.0, un punto critico para cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN de deteccion en una etapa (familia YOLO11, Ultralytics) |
| Parametros totales | 25,4 M |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de vision, no procesa texto) |
| Tipos de cuantizacion | No especificados en la model card; exportable desde Ultralytics a FP16/INT8, ONNX y TensorRT |
| Idiomas soportados | no disponible (modelo de vision; etiquetas de clase en ingles: car, truck, bus) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (.pt, best.pt); exportable a otros formatos via Ultralytics |
| Resolucion de inferencia reportada | 640 px (87,6 FLOPs) |
| Clases | car, truck, bus |
| Framework | Ultralytics (libreria ultralytics) |

## Arquitectura y entrenamiento

El modelo se basa en YOLO11, la familia de detectores en una etapa de Ultralytics publicada en septiembre de 2024. Se trata de una variante "large" (YOLO11l) con 25,4 M de parametros. No se detalla en la model card la composicion exacta del backbone ni las innovaciones concretas de la version 11 (mas alla de la referencia generica a la documentacion de Ultralytics); el contenido disponible se corta en la seccion de configuracion de entrenamiento ("Training Configuration"), por lo que los hiperparametros completos no estan disponibles mas alla de lo indicado.

El entrenamiento consiste en un ajuste fino (finetune) sobre el conjunto UAVDT, cuyas tres clases son coche, camion y autobus. El modelo se entreno y evaluo dentro de DetectionBench, un marco que aplica recetas de entrenamiento y metricas de evaluacion identicas a multiples detectores y conjuntos de datos, con el objetivo de hacer comparaciones reproducibles. No hay informacion sobre el numero de tokens o muestras exactas de entrenamiento, ni sobre el uso de tecnicas como RLHF o DPO (no aplicables a un detector). La evaluacion reportada se realiza sobre el split de test de UAVDT mediante el pipeline estandar `detectionbench-evaluate`. Segun el desglose por clase, el rendimiento se concentra en la clase coche, mientras que camion y autobus obtienen valores muy bajos, lo que sugiere un fuerte desequilibrio de clases en el conjunto.

## Capacidades

- Deteccion de objetos en imagenes aereas: localiza y clasifica coches, camiones y autobuses en fotogramas captados por drones.
- Deteccion de objetos pequenos: el modelo esta orientado a escenarios con objetos de tamano reducido y alta densidad, tipicos de la imagen aerea (tag small-object-detection).
- Uso en vigilancia de trafico: etiquetado como vehicle-detection y traffic-surveillance, pensado para analisis de trafico desde el aire.
- Inferencia con la libreria Ultralytics: se carga con `from ultralytics import YOLO` y se ejecuta mediante `model.predict(...)`, con umbral de confianza configurable.
- Exportacion a otros formatos: al ser un modelo Ultralytics, es exportable a ONNX, TensorRT, etc. (no confirmado explicitamente en la model card).
- No dispone de tool calling, function calling, razonamiento multi-paso ni capacidades de agente: es un modelo puramente perceptivo.
- No procesa lenguaje natural ni mantiene conversacion: las etiquetas de salida son las tres clases del conjunto.

## Casos de uso

- Vigilancia de trafico con drones: el modelo detecta y localiza coches, camiones y autobuses en fotogramas aereos, lo que permite contar vehiculos y estimar densidad de trafico en una via desde una plataforma UAV.
- Analisis de imagenes aereas de alta densidad: al estar entrenado sobre UAVDT (escenas con objetos pequenos), es adecuado para procesar capturas donde los vehiculos ocupan pocos pixeles y aparecen agrupados.
- Preetiquetado y anotacion asistida: puede emplearse para generar cajas candidatas sobre nuevas imagenes aereas y acelerar el etiquetado manual en pipelines de anotacion, siempre revisando las detecciones por su recall moderado.
- Punto de partida para reentrenamiento: sirve como checkpoint inicial para afinar sobre dominios aereos especificos (por ejemplo, otro tipo de vehiculos o camaras) dentro del marco DetectionBench.
- Investigacion comparativa de detectores: al publicarse en un zoo con receta comun, permite estudiar el comportamiento de YOLO11l frente a RF-DETR, YOLO26 o YOLOv8/v9/v10 sobre UAVDT.
- Prototipado de sistemas embarcados en dron: con 25,4 M de parametros y 87,6 GFLOPs a 640 px, puede integrarse en plataformas con GPU moderada para inferencia en tiempo casi real (rendimiento concreto no medido en la informacion disponible).
- Monitorizacion de infraestructuras viarias: deteccion de presencia y acumulacion de vehiculos en carreteras o aparcamientos a partir de video aereo.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados), sobre el split de test de UAVDT con el pipeline de DetectionBench:

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 28,64 |
| mAP@50-95 | 17,16 |
| Precision | 34,75 |
| Recall | 34,02 |
| F1 Score | 34,38 |
| Parametros | 25,4 M |
| FLOPs | 87,6 B (a 640 px) |

Rendimiento por clase (UAVDT, test):

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| car | 69,98 | 40,06 |
| truck | 8,86 | 6,16 |
| bus | 7,08 | 5,28 |

Comparativa dentro del zoo UAVDT de DetectionBench (mismo conjunto, misma receta; resultados del autor):

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
| YOLO9m | 29,43 | 16,97 | 35,92 | 35,70 |
| YOLOv9t | 29,42 | 17,03 | 35,75 | 36,47 |
| YOLOv10l | 29,16 | 16,54 | 36,90 | 35,60 |
| YOLOv9c | 29,16 | 16,46 | 35,38 | 34,35 |
| YOLO11s | 29,10 | 17,16 | 34,32 | 37,31 |
| YOLO26n | 28,88 | 16,79 | 33,14 | 35,66 |
| YOLOv8l | 28,86 | 17,27 | 38,33 | 32,86 |
| YOLOv10s | 28,85 | 16,48 | 36,53 | 33,16 |
| YOLO11l (este modelo) | 28,64 | 17,16 | 34,75 | 34,02 |
| YOLO11n | 28,56 | 16,30 | 38,04 | 32,26 |
| YOLOv8n | 27,80 | 15,34 | 35,42 | 33,61 |
| YOLOv10n | 27,17 | 15,16 | 33,30 | 31,21 |
| YOLOv8s | 27,12 | 15,33 | 34,65 | 31,87 |

## Requisitos de hardware

- VRAM de inferencia: no especificada en la model card. Con 25,4 M de parametros, los pesos ocupan aproximadamente 100 MB en FP32 y unos 50 MB en FP16, por lo que la huella de pesos es pequena; el consumo real dependera de la resolucion y del tamano de lote, no cuantificado en la informacion disponible.
- GPU recomendadas: no hay recomendaciones explicitas del autor. Por tamano, un detector de 25,4 M de parametros cabe comodamente en GPU de consumo (RTX 3060/4060/4090) e incluso en GPU integradas modestas; para entrenamiento se recomienda una GPU con mayor VRAM (por ejemplo, A100 o H100) si se trabaja con lotes grandes.
- GPU de consumo: si, cabe en GPU de consumo; el cuello de botella tipico sera el throughput a 640 px, no la memoria de pesos. No se aportan cifras de latencia o throughput.
- Opciones de despliegue: la model card solo documenta el uso con la libreria Ultralytics (`pip install ultralytics huggingface_hub`). Al tratarse de un modelo Ultralytics es exportable a otros runtimes (ONNX, TensorRT, OpenVINO), aunque esto no se detalla en la informacion disponible.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de velocidad en la informacion proporcionada.

## Comparativa con modelos similares

Comparativa con alternativas evaluadas en el mismo zoo UAVDT de DetectionBench (mismos datos y receta de evaluacion que este modelo):

| Modelo | Parametros | mAP@50 | mAP@50-95 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLO11l (este modelo) | 25,4 M | 28,64 | 17,16 | AGPL-3.0 | HuggingFace (dronefreak) |
| YOLO11m | no disponible | 30,47 | 17,71 | AGPL-3.0 (Ultralytics) | HuggingFace (dronefreak) |
| RF-DETR Medium | no disponible | 33,28 | 20,54 | no disponible | en el zoo DetectionBench |
| YOLO26m | no disponible | 33,43 | 19,56 | no disponible | en el zoo DetectionBench |

Fuera del zoo UAVDT, la referencia natural es el propio YOLO11l preentrenado de Ultralytics (base_model), sobre el que se ha hecho el ajuste fino. No se dispone de cifras comparativas de contexto, licencia o disponibilidad para las variantes RF-DETR y YOLO26 mas alla de los resultados de mAP recogidos en la tabla del autor.

## Limitaciones y advertencias

- Rendimiento absoluto bajo: un mAP@50 de 28,64 % y un mAP@50-95 de 17,16 % implican una fiabilidad limitada para produccion sin un ajuste o validacion adicionales.
- Fuerte desequilibrio por clase: la clase coche alcanza 69,98 % de mAP@50, mientras que camion (8,86 %) y autobus (7,08 %) son practicamente inoperativas. El modelo esta sesgado hacia la deteccion de coches.
- Riesgo de falsos positivos y negativos: la precision (34,75 %) y el recall (34,02 %) son moderados; cabe esperar omisiones y detecciones erroneas, especialmente en clases minoritarias y objetos muy pequenos.
- Dominio restringido: entrenado unicamente sobre UAVDT (imagen aerea de trafico). Es probable que no generalice bien a otras alturas de vuelo, sensores, condiciones climaticas o tipos de escena no representados en el conjunto.
- Sin datos de sesgo mas alla del desequilibrio de clases: no se documentan analisis de sesgo geografico, de iluminacion ni de condiciones meteorologicas.
- Licencia AGPL-3.0: es una licencia copyleft fuerte. El uso comercial o la integracion en servicios de red puede obligar a liberar el codigo fuente derivado bajo la misma licencia. Es un caveat critico para produccion.
- Metrica no verificada: los resultados del model-index estan marcados como `verified: false` y proceden del propio autor.
- Idiomas y texto: no aplica; es un modelo de vision, sin capacidades de lenguaje.
- Sin informacion de mantenimiento: el repositorio registra 0 descargas y 0 "likes", y no se detallan planes de actualizacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/uavdt-yolo11l
- Conjunto de datos UAVDT: https://huggingface.co/datasets/dronefreak/UAVDT
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Modelo similar (misma familia) en el zoo: https://huggingface.co/dronefreak/visdrone-yolo11l
- Variante menor del mismo zoo: https://huggingface.co/dronefreak/uavdt-yolo11n
- Documentacion de Ultralytics YOLO11: https://docs.ultralytics.com/models/yolo11
- Modelo base: https://huggingface.co/Ultralytics/YOLO11
- Paper referenciado en los tags (arXiv:1804.00518): https://arxiv.org/abs/1804.00518
- Paper referenciado en los tags (arXiv:2410.17725): https://arxiv.org/abs/2410.17725
