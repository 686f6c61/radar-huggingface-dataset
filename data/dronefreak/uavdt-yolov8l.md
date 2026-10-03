# dronefreak/uavdt-yolov8l

## Resumen

dronefreak/uavdt-yolov8l es un detector de objetos YOLOv8l afinado por el usuario dronefreak sobre el conjunto de datos UAVDT (Unmanned Aerial Vehicle Benchmark), un benchmark de vídeo aéreo urbano para detección y seguimiento de vehículos. El modelo parte de los pesos preentrenados Ultralytics/YOLOv8 y se reentrena con las tres clases anotadas en UAVDT: coche, camión y autobús. Es, por tanto, un modelo de visión por computador para imagen aérea, no un modelo de lenguaje: no procesa texto ni mantiene ventanas de contexto conversacional.

Su relevancia es metodológica más que de rendimiento. Forma parte de DetectionBench, un marco que reentrena y evalúa detectores modernos con recetas de entrenamiento y métricas idénticas, de modo que las comparaciones entre arquitecturas sean reproducibles. En ese contexto, este checkpoint sirve como entrada de referencia de la familia YOLOv8 en la tabla comparativa de UAVDT.

Técnicamente es un detector de una sola etapa, sin anclas y con cabeza desacoplada, de 46,5 millones de parámetros y 155,1 unidades de FLOPs a 640 píxeles según la model card. Los resultados publicados en el split de test de UAVDT son modestos: mAP@50 de 28,86 %, mAP@50-95 de 17,27 %, precisión 38,33 % y recall 32,86 %. El rendimiento se concentra casi por completo en la clase coche (mAP@50 68,82 %), mientras que camión y autobús quedan muy por debajo (11,53 % y 6,23 %).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8l (detector de una etapa, anchor-free, con cabeza desacoplada), implementado con Ultralytics |
| Parametros totales | 46,5 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; la entrada es una imagen, no una secuencia de texto) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones publicadas; Ultralytics permite exportar a FP16, INT8 y TensorRT) |
| Idiomas soportados | no aplica (tarea de deteccion de objetos; no procesa lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (checkpoint `.pt` de Ultralytics, archivo `best.pt`) |
| Tarea | object-detection |
| Dataset de entrenamiento | dronefreak/UAVDT |
| Clases | car, truck, bus |
| FLOPs | 155,1 (a 640 px), segun la model card |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes en HuggingFace | 0 / 0 |

## Arquitectura y entrenamiento

La base es YOLOv8l de Ultralytics, un detector de objetos de una sola etapa derivado de la familia YOLO. Se caracteriza por prescindir de anclas (anchor-free), emplear una cabeza desacoplada para clasificación y regresión de cajas, y una estructura backbone/neck de tipo CSP con bloques C2f. La model card no detalla la configuración interna de la variante "l" más allá del recuento de 46,5 M de parámetros y los 155,1 FLOPs a 640 píxeles.

El entrenamiento consiste en un ajuste fino (finetune) sobre el conjunto UAVDT a partir de los pesos preentrenados de Ultralytics/YOLOv8. La model card incluye una sección de configuración de entrenamiento cuyo contenido aparece truncado en la información disponible ("Datas"), por lo que no se pueden confirmar hiperparámetros como el número de épocas, el tamaño de lote, la resolución de entrenamiento o las técnicas de aumento de datos. Tampoco se documenta el uso de fases de alineación adicionales (RLHF, DPO u otras), algo que no aplica a un detector de objetos. La innovación destacable del proyecto no está en el modelo en sí, sino en el marco DetectionBench: recetas idénticas y una única canalización de evaluación (`detectionbench-evaluate`) para todos los detectores comparados.

## Capacidades

- Deteccion de objetos en imagenes aereas captadas por dron, con tres categorias: coche, camion y autobus.
- Localizacion mediante cajas delimitadoras con puntuaciones de confianza, en el formato estandar de Ultralytics.
- Inferencia sobre imagenes sueltas, directorios de imagenes, video y flujos en tiempo real a traves de `model.predict()`.
- Exportacion a multiples formatos de despliegue mediante las herramientas de Ultralytics (ONNX, TensorRT, OpenVINO, TFLite, CoreML, entre otros).
- Integracion con el ecosistema de seguimiento multiobjeto de Ultralytics (por ejemplo, variantes de ByteTrack o BoT-SORT) para trazar vehiculos entre fotogramas, aunque esto depende del framework y no de una capacidad declarada del checkpoint.
- No dispone de tool calling, function calling, razonamiento multi-paso, modo pensamiento, vision-lenguaje, audio ni capacidades multilingues: es exclusivamente un detector visual.

## Casos de uso

- Monitorizacion de trafico en entornos urbanos: el modelo detecta coches, camiones y autobuses en tomas aereas de dron, de modo que puede alimentar paneles de aforo y densidad de trafico. Es adecuado para prototipos y estudios comparativos, no para sistemas criticos dado su mAP@50 de 28,86 %.
- Recuento y clasificacion de vehiculos en video aereo: combinado con un rastreador multiobjeto, permite contar vehiculos que cruzan una linea virtual en grabaciones de dron.
- Investigacion en deteccion de objetos pequenos: UAVDT contiene objetos de pocos pixeles vistos desde arriba, por lo que el modelo sirve como linea base reproducible para estudiar tecnicas de mejora en objetos pequenos.
- Reproduccion y comparacion de benchmarks: al formar parte de DetectionBench, permite reproducir la evaluacion de YOLOv8l en UAVDT y contrastarla con otras arquitecturas bajo la misma receta.
- Analisis de saturacion en vias y aparcamientos: la clase coche, con diferencia la mejor modelada (mAP@50 68,82 %), permite estimar ocupacion en imagenes cenitales de aparcamientos y vias rapidas.
- Generacion de preetiquetados para anotacion: las detecciones de alta confianza pueden usarse como propuesta inicial que un anotador humano revise, reduciendo el coste de etiquetado en nuevos conjuntos de imagen aerea.
- Vigilancia de infraestructuras viarias: deteccion de vehiculos en autopistas y cruces para estudios de accidentalidad o de flujo, siempre con validacion adicional por clase debido al bajo recall de camiones y autobuses.
- Despliegue en edge sobre el propio dron: con 46,5 M de parametros, el modelo cabe en dispositivos tipo NVIDIA Jetson o GPUs de consumo para inferencia a bordo, si bien no se publican cifras de latencia.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de UAVDT, con la canalizacion `detectionbench-evaluate`. Ninguno de los valores esta verificado (`verified: false`).

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 28,86 |
| mAP@50-95 | 17,27 |
| Precision | 38,33 |
| Recall | 32,86 |
| F1 | 35,38 |

Rendimiento por clase:

| Clase | mAP@50 (%) | mAP@50-95 (%) |
|---|---|---|
| car | 68,82 | 39,48 |
| truck | 11,53 | 7,50 |
| bus | 6,23 | 4,83 |

Comparativa dentro del zoo de modelos UAVDT publicado por el autor (mismos datos y misma canalizacion de evaluacion):

| Modelo | mAP@50 (%) | mAP@50-95 (%) | Precision (%) | Recall (%) |
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
| YOLOv10l | 29,16 | 16,54 | 36,90 | 35,60 |
| YOLOv9c | 29,16 | 16,46 | 35,38 | 34,35 |
| YOLO11s | 29,10 | 17,16 | 34,32 | 37,31 |
| YOLO26n | 28,88 | 16,79 | 33,14 | 35,66 |
| YOLOv8l (este modelo) | 28,86 | 17,27 | 38,33 | 32,86 |
| YOLOv10s | 28,85 | 16,48 | 36,53 | 33,16 |
| YOLO11l | 28,64 | 17,16 | 34,75 | 34,02 |
| YOLO11n | 28,56 | 16,30 | 38,04 | 32,26 |
| YOLOv8n | 27,80 | 15,34 | 35,42 | 33,61 |
| YOLOv10n | 27,17 | 15,16 | 33,30 | 31,21 |
| YOLOv8s | 27,12 | 15,33 | 34,65 | 31,87 |

No se han publicado resultados de benchmarks adicionales (por ejemplo, MMLU, HumanEval o GSM8K) porque no aplican a un modelo de deteccion de objetos.

## Requisitos de hardware

- Peso de los parametros (estimacion calculada a partir de 46,5 M de parametros, no publicada por el autor): aproximadamente 186 MB en FP32, 93 MB en FP16 y 47 MB en INT8.
- VRAM estimada para inferencia: en torno a 1-2 GB a 640 píxeles incluyendo activaciones, segun el tamano de lote y la resolucion. Cifra estimada, no publicada en la model card.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 4 GB o mas de VRAM (por ejemplo, GTX 1650, RTX 3060, RTX 4060, RTX 4090). Tambien en iGPU recientes siempre que se exporte a ONNX Runtime u OpenVINO.
- GPU de centro de datos recomendadas si se busca procesar video a alta tasa: T4, L4, A10, A100 o H100, exportando a TensorRT.
- Opciones de despliegue: paquete `ultralytics` (Python o CLI), exportacion a ONNX y ONNX Runtime, TensorRT, OpenVINO, TFLite, CoreML y otros formatos soportados por Ultralytics. El checkpoint tambien puede servirse detras de un servidor de inferencia tipo Triton si se exporta previamente.
- Latencia y throughput: no disponibles. La model card unicamente publica 155,1 unidades de FLOPs a 640 px (la unidad aparece como "B" en la documentacion original; conviene verificar si corresponde a FLOPs totales o a miles de millones de FLOPs antes de usarla en calculos).
- Dependencias: `pip install ultralytics huggingface_hub`.

## Comparativa con modelos similares

| Modelo | Parametros | mAP@50 UAVDT (%) | mAP@50-95 UAVDT (%) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dronefreak/uavdt-yolov8l (este) | 46,5 M | 28,86 | 17,27 | AGPL-3.0 | HuggingFace, `.pt` |
| YOLO26m (segun el zoo del autor) | no disponible | 33,43 | 19,56 | no disponible | no disponible |
| RF-DETR Medium (segun el zoo del autor) | no disponible | 33,28 | 20,54 | no disponible | no disponible |
| YOLOv8m (segun el zoo del autor) | no disponible | 31,42 | 18,80 | no disponible | no disponible |
| YOLO11l (segun el zoo del autor) | no disponible | 28,64 | 17,16 | no disponible | no disponible |

La familia RF-DETR destaca por una precision y un recall muy superiores (por encima del 70 %) con un mAP@50 comparable o mejor, mientras que las variantes YOLO26 superan a este checkpoint en mAP. Dentro del propio zoo, YOLOv8l queda en la parte media-baja de la tabla pese a ser la variante mas grande de su familia. Los parametros, licencias y disponibilidad de los modelos comparados no se detallan en la informacion disponible.

## Limitaciones y advertencias

- Rendimiento global bajo: un mAP@50 de 28,86 % y un mAP@50-95 de 17,27 % lo sitúan en la parte baja del zoo UAVDT. No es apto para produccion critica sin reentrenamiento o ajuste adicional.
- Desequilibrio severo entre clases: coche alcanza 68,82 % de mAP@50, frente a 11,53 % de camion y 6,23 % de autobus. La deteccion de vehiculos pesados es practicamente inutilizable de forma directa.
- Recall limitado (32,86 %): se pierden aproximadamente dos tercios de los objetos reales, lo que invalida su uso para recuento fiable sin post-procesado ni umbrales ajustados.
- Sesgo de dominio: entrenado exclusivamente con UAVDT, con imagenes aereas urbanas de dron. El rendimiento fuera de esa distribucion (otras altitudes, camaras, condiciones meteorologicas, zonas rurales o imagenes satelitales) no esta documentado y previsiblemente se degradara.
- Objetos pequenos: la propia etiqueta del modelo incluye `small-object-detection`; los vehiculos ocupan pocos pixeles, lo que explica en parte las cifras bajas y exige resoluciones de entrada altas para resultados utiles.
- Metricas no verificadas: todos los valores del `model-index` aparecen con `verified: false`, declarados por el autor y no reproducidos de forma independiente.
- Licencia AGPL-3.0: es una licencia copyleft fuerte. El uso comercial es posible, pero si el modelo se ofrece como servicio en red, la AGPL obliga a poner a disposicion el codigo fuente correspondiente. Conviene revisar las implicaciones antes de integrarlo en un producto propietario; los pesos derivados de Ultralytics/YOLOv8 heredan esta misma licencia.
- Adopcion nula: cero descargas y cero likes en el momento de la consulta, sin comunidad que haya validado el checkpoint.
- Sin datos de cuantizacion, latencia ni rendimiento energetico publicados, lo que dificulta planificar un despliegue en edge.
- Riesgo de alucinacion: no aplica en el sentido de los modelos de lenguaje, pero si existe riesgo de falsos positivos y de cajas espurias, especialmente con umbrales de confianza bajos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/uavdt-yolov8l
- Dataset UAVDT (card): https://huggingface.co/datasets/dronefreak/UAVDT
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Coleccion UAVDT Object Detection Model Zoo: https://huggingface.co/collections/dronefreak/uavdt-object-detection-model-zoo
- Variante YOLOv8n del mismo autor: https://huggingface.co/dronefreak/uavdt-yolov8n
- Modelo base: https://huggingface.co/Ultralytics/YOLOv8
- Paper de UAVDT referenciado en las etiquetas (arXiv:1804.00518): https://arxiv.org/abs/1804.00518
- Documentacion de Ultralytics: https://docs.ultralytics.com/
- Dataset VisDrone en Ultralytics (referencia de deteccion aerea): https://docs.ultralytics.com/datasets/detect/visdrone
