# dronefreak/uavdt-yolo26s

## Resumen

uavdt-yolo26s es un detector de objetos entrenado por el usuario dronefreak (dronefreak/DetectionBench) mediante ajuste fino del modelo base Ultralytics/YOLO26 en su variante "s" (small) sobre el conjunto de datos UAVDT, un benchmark de deteccion de vehiculos en imagenes aereas captadas por drones. El modelo resuelve una tarea de vision por computador muy concreta: localizar y clasificar vehiculos (coche, camion y autobus) en secuencias aereas de trafico con objetos pequenos, alta densidad y perspectivas oblicuas. Su relevancia es metodologica: forma parte de DetectionBench, un marco que entrena y evalua detectores modernos con recetas identicas para permitir comparaciones reproducibles entre arquitecturas (YOLO, RF-DETR, etc.).

Tecnicamente es un detector de una sola etapa con 10,0 M de parametros y 22,8 B de FLOPs declarados, con pesos en formato PyTorch (.pt) y libreria Ultralytics. No es un modelo de lenguaje ni multimodal generativo: no tiene ventana de contexto, no soporta tool calling ni generacion de texto. Su entrada es una imagen o un fotograma y su salida son cajas delimitadoras con clase y confianza.

Los resultados publicados por el autor son modestos en terminos absolutos (mAP@50 del 14,09 % y mAP@50-95 del 7,91 % en el split de test de UAVDT), lo que refleja la dificultad intrinseca del dataset, con objetos de pocos pixeles. Aun asi, este checkpoint queda por delante de la mayoria de las variantes YOLO evaluadas en el mismo zoo (YOLOv26m, YOLOv8m/s/n, YOLOv11x) y por detras de las tres variantes de RF-DETR. Las metricas no estan verificadas de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de objetos de una etapa, familia YOLO (YOLO26, variante small); libreria Ultralytics |
| Parametros totales | 10,0 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada = imagen de resolucion configurable) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; el unico artefacto documentado es el checkpoint PyTorch `best.pt` (se puede exportar a FP16/INT8/ONNX/TensorRT con herramientas Ultralytics) |
| Idiomas soportados | no aplica |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`best.pt`), descargable con `hf_hub_download`; exportable a otros formatos |
| Computo | 22,8 B FLOPs (segun la model card del autor) |
| Tarea (pipeline) | object-detection |
| Clases | car, truck, bus |
| Dataset de entrenamiento y evaluacion | dronefreak/UAVDT (split de test para las metricas) |
| Modelo base | Ultralytics/YOLO26 (variante s) |
| Tamano del repositorio | 0,0 GB (segun el listado de HuggingFace) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino (fine-tuning) completo del checkpoint Ultralytics/YOLO26s, un detector de objetos de una etapa de la familia YOLO. La arquitectura es una CNN de deteccion densa con una cabeza que predice cajas y clases de forma directa, en la linea de las generaciones YOLOv8/YOLO11/YOLO26 de Ultralytics. Con 10,0 M de parametros y 22,8 B de FLOPs declarados, se trata de la variante "small" de la familia: un punto intermedio entre los modelos "n" y "m", pensado para despliegue en tiempo real.

Los datos de entrenamiento corresponden al dataset UAVDT, un benchmark de deteccion y seguimiento de vehiculos en video aereo captado por drones, con tres clases anotadas (car, truck, bus) y un fuerte desbalance entre ellas. El autor indica que el entrenamiento y la evaluacion se realizaron dentro del marco DetectionBench, cuyo objetivo es aplicar recetas de entrenamiento y pipelines de evaluacion identicos a distintos detectores para que las comparaciones sean justas. La model card no detalla el numero de tokens o imagenes, la composicion exacta del split, la resolucion de entrenamiento, el numero de epocas ni el uso de tecnicas de aumento de datos especificas, ni menciona fases de RLHF o DPO (no aplicables a un detector de objetos). Las innovaciones propias de YOLO26 respecto a generaciones anteriores (por ejemplo, cambios en la cabeza de deteccion o en las estrategias de asignacion de etiquetas) no se describen en la informacion disponible; la model card se limita al proceso de ajuste fino y a las metricas obtenidas.

## Capacidades

- Deteccion de objetos en imagenes aereas: localiza y clasifica vehiculos en fotogramas captados desde drones.
- Tres clases especificas: coche, camion y autobus.
- Deteccion de objetos pequenos: el ajuste esta orientado a escenas aereas con vehiculos de pocos pixeles, un regimen distinto al de los detectores entrenados en COCO.
- Inferencia sobre imagen individual o flujo de video: al derivar de Ultralytics YOLO, admite prediccion sobre imagenes, carpetas, video y streams.
- Integracion en Python: carga directa con `ultralytics.YOLO(weights)` y ejecucion con `model.predict(...)`.
- Exportacion a otros formatos de inferencia (ONNX, TensorRT, OpenVINO, etc.) mediante la CLI o la API de Ultralytics, siempre que la version de la libreria lo soporte para esta arquitectura.
- Capacidades que NO tiene: no genera texto, no razona, no hace tool calling ni function calling, no soporta agentes, no es multilingue, no procesa audio y no tiene modo de razonamiento extendido.

## Casos de uso

- Vigilancia de trafico desde dron: procesar el flujo de video de un UAV y contar vehiculos por clase (car, truck, bus) sobre carreteras o intersecciones; el modelo esta ajustado especificamente al dominio aereo, con altitudes y angulos similares a los de UAVDT.
- Analitica de aforo vehicular: estimar volumen de trafico por franjas horarias a partir de detecciones por fotograma, agregando conteos en el tiempo para estudios de movilidad urbana.
- Monitorizacion de infraestructuras viarias: detectar presencia y acumulacion de vehiculos en tramos concretos (peajes, accesos, areas de servicio) en campanas de inspeccion con dron.
- Prototipado rapido y docencia: al ser un modelo de 10 M de parametros con un script de carga de tres lineas, sirve como punto de partida para practicas de deteccion de objetos, evaluacion de metricas (mAP, PR curve, matriz de confusion) y comparacion de detectores.
- Referencia de linea base en investigacion: usar este checkpoint como baseline reproducible para comparar nuevas arquitecturas o tecnicas de aumento de datos bajo el mismo protocolo de DetectionBench.
- Despliegue en borde (edge): integrable en dispositivos con pocos recursos (Jetson, mini-PC, incluso CPU) para deteccion en tiempo real a bordo del dron, exportando el modelo a TensorRT, ONNX Runtime u OpenVINO.
- Preetiquetado de datos: generar detecciones automaticas sobre nuevo material aereo para acelerar el etiquetado humano, aceptando la revision manual dado el nivel de precision del modelo.
- Seguimiento multiobjeto (con componente externo): combinando las detecciones con un tracker (por ejemplo, ByteTrack o BoT-SORT, disponibles en Ultralytics) se puede construir seguimiento de vehiculos, aunque el seguimiento no lo aporta el modelo por si solo.

## Benchmarks y rendimiento

Resultados declarados por el autor en el split de test de UAVDT (metricas **no verificadas** de forma independiente, campo `verified: false` en el model-index):

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 14,09 |
| mAP@50-95 | 7,91 |
| Precision | 23,88 |
| Recall | 27,05 |
| F1 | 25,37 |

Rendimiento por clase (test de UAVDT):

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| car | 31,65 | 16,44 |
| truck | 3,03 | 1,75 |
| bus | 7,59 | 5,54 |

Comparativa publicada por el autor en el "UAVDT Model Zoo" de DetectionBench (mismos datos y protocolo de evaluacion, segun la model card):

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| RF-DETR Medium | 15,02 | 8,76 | 40,28 | 61,14 |
| RF-DETR Small | 14,89 | 8,92 | 38,83 | 61,65 |
| YOLOv26s (este modelo) | 14,09 | 7,91 | 23,88 | 27,05 |
| RF-DETR Nano | 12,96 | 7,33 | 37,12 | 55,40 |
| YOLOv26m | 12,32 | 6,66 | 19,44 | 25,83 |
| YOLOv8m | 12,28 | 7,05 | 19,73 | 25,33 |
| YOLOv11x | 11,98 | 6,68 | 18,70 | 25,93 |
| YOLOv8s | 11,48 | 6,71 | 19,34 | 23,39 |
| YOLOv8n | 10,79 | 6,42 | 18,61 | 24,58 |

No se han publicado en la informacion disponible resultados en otros benchmarks (COCO, VisDrone, etc.) ni mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada. Como referencia aritmetica, los pesos ocupan aproximadamente 40 MB en FP32, 20 MB en FP16 y 10 MB en INT8; el consumo real de memoria lo determinan el tamano de lote y, sobre todo, la resolucion de entrada, no el tamano del modelo.
- GPU recomendadas: cualquier GPU moderna sirve; al tratarse de un modelo de 10 M de parametros, no requiere A100/H100. Una RTX 3060/4060 o superior es mas que suficiente para tiempo real a resoluciones habituales de inferencia, y una RTX 4090 queda muy por encima de lo necesario.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU con 2 GB o mas de memoria, incluidas GTX 1050/1650 y graficas integradas recientes. Tambien es viable en CPU y en plataformas embebidas tipo NVIDIA Jetson (Nano/Orin) o Raspberry Pi, con la latencia correspondiente.
- Opciones de despliegue: Ultralytics (PyTorch) como via nativa; exportacion a ONNX, TensorRT, OpenVINO, TFLite, CoreML y NCNN desde la propia libreria; servidores de inferencia como Triton con el backend de ONNX/TensorRT. No aplican vLLM, llama.cpp, Ollama ni TGI, que son runtimes para modelos de lenguaje.
- Latencia y throughput estimados: no disponibles. No hay cifras publicadas de FPS ni de tiempo por imagen para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea / dataset | mAP@50 (UAVDT) | mAP@50-95 (UAVDT) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| uavdt-yolo26s (este) | 10,0 M | Deteccion; ajuste fino en UAVDT | 14,09 | 7,91 | AGPL-3.0 | HuggingFace (dronefreak/uavdt-yolo26s) |
| RF-DETR Small (referencia del zoo) | no disponible | Deteccion; ajuste fino en UAVDT | 14,89 | 8,92 | no disponible en la informacion proporcionada | via DetectionBench |
| RF-DETR Medium (referencia del zoo) | no disponible | Deteccion; ajuste fino en UAVDT | 15,02 | 8,76 | no disponible en la informacion proporcionada | via DetectionBench |
| YOLOv26m (mismo marco) | no disponible | Deteccion; ajuste fino en UAVDT | 12,32 | 6,66 | AGPL-3.0 (heredada del ecosistema Ultralytics) | via DetectionBench |
| YOLOv8s (generacion anterior) | ~11,2 M (dato de la familia YOLOv8, no de este zoo) | Deteccion; ajuste fino en UAVDT | 11,48 | 6,71 | AGPL-3.0 | via DetectionBench / Ultralytics |

Observaciones: dentro del zoo de DetectionBench sobre UAVDT, este checkpoint es el mejor de la familia YOLO por mAP@50 y queda a menos de un punto de RF-DETR Small y Medium, aunque muy por debajo de estos en precision y recall (23,88/27,05 frente a 38,83/61,65 y 40,28/61,14 respectivamente). Los datos de parametros y licencias de las alternativas no se detallan en la informacion disponible.

## Limitaciones y advertencias

- Rendimiento bajo en terminos absolutos: mAP@50 de 14,09 % y mAP@50-95 de 7,91 % indican muchas detecciones perdidas; no es apto para aplicaciones donde un fallo de deteccion tenga consecuencias criticas.
- Desbalance de clases muy acusado: la clase car alcanza 31,65 % de mAP@50 mientras que truck se queda en 3,03 % y bus en 7,59 %. El modelo es practicamente inutil para camiones y poco fiable para autobuses.
- Precision y recall bajos (23,88 % y 27,05 %): se esperan numerosos falsos positivos y falsos negativos en produccion.
- Sesgo de dominio: entrenado exclusivamente con UAVDT, es decir, imagenes aereas de dron sobre trafico con condiciones de camara, altitud, clima y geografia concretas. El rendimiento fuera de ese dominio (imagenes de satelite, camaras fijas, otros paises, vision nocturna no representada en el dataset) no esta caracterizado y probablemente se degrade.
- Riesgo de alucinacion en sentido estricto no aplica, pero si el riesgo equivalente en vision: detecciones con alta confianza sobre objetos inexistentes, especialmente en texturas que se parecen a vehiculos.
- Metricas no verificadas: el model-index marca todas las metricas como `verified: false`; proceden del propio autor y del propio marco de evaluacion. No hay validacion por terceros.
- Licencia AGPL-3.0: es una licencia copyleft fuerte. El uso comercial es posible, pero si se ofrece el modelo como servicio a traves de una red o se distribuye una obra derivada, la AGPL obliga a liberar el codigo correspondiente bajo los mismos terminos. Conviene revisar la licencia del modelo base Ultralytics/YOLO26, que tambien es AGPL-3.0, y considerar la licencia comercial de Ultralytics si el proyecto no puede asumir copyleft.
- Repositorio con 0,0 GB de tamano y 0 descargas: puede indicar que el archivo `best.pt` no esta efectivamente subido o no esta indexado en el momento de consulta; conviene verificar que la descarga funciona antes de integrarlo en un pipeline.
- Documentacion incompleta: no se especifican resolucion de entrenamiento, hiperparametros, numero de epocas, composicion del split, ni detalles de aumentos; esto limita la reproducibilidad fina del ajuste.
- Sin informacion de cuantizacion publicada: cualquier cuantizacion a INT8 u otras tecnicas de compresion debera validarse por cuenta propia, ya que puede degradar aun mas la deteccion de objetos pequenos.
- Uso responsable: la vigilancia aerea con drones esta sujeta a normativa de proteccion de datos y de espacio aereo; el despliegue debe cumplir la regulacion aplicable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/uavdt-yolo26s
- Dataset UAVDT (version del autor): https://huggingface.co/datasets/dronefreak/UAVDT
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Modelo base: https://huggingface.co/Ultralytics/YOLO26
- Articulos referenciados en las etiquetas del modelo (identificadores arXiv tal como aparecen en los tags, sin descripcion en la informacion disponible):
  - https://arxiv.org/abs/1804.00518
  - https://arxiv.org/abs/2606.03748
  - https://arxiv.org/abs/2511.09554
  - https://arxiv.org/abs/2304.07193
  - https://arxiv.org/abs/2410.17725
- Recursos graficos del repositorio (curvas PR y F1, matrices de confusion): `BoxPR_curve.png`, `BoxF1_curve.png`, `confusion_matrix.png`, `confusion_matrix_normalized.png` en la raiz del repositorio de HuggingFace
- Demo del autor: `assets/demo_banner.mp4` (detecciones sobre dos clips de test de UAVDT), referenciado desde la model card
- Nota sobre la busqueda web: no se encontraron resultados relevantes sobre este modelo; las busquedas devolvieron unicamente paginas sobre productos no relacionados (monitores de frecuencia cardiaca Garmin HRM 200 y HRM 600), por lo que no se incluyen como enlaces utiles.
