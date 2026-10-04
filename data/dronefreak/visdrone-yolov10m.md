# dronefreak/visdrone-yolov10m

## Resumen

El modelo `dronefreak/visdrone-yolov10m` es un detector de objetos YOLOv10m afinado sobre el conjunto de datos VisDrone-DET, un benchmark de imagenes aereas capturadas con dron. Lo publica el usuario dronefreak como parte de DetectionBench, un framework cuyo objetivo es comparar detectores modernos bajo recetas de entrenamiento y metricas de evaluacion identicas, de modo que las diferencias de rendimiento reflejen el modelo y no el pipeline.

Se trata de un modelo de vision por computador, no de un modelo de lenguaje: no genera texto ni mantiene conversaciones. Su tarea es la deteccion de objetos en imagenes y secuencias de video aereas, e incluye 16,6 millones de parametros y 64,5 unidades de FLOPs a 640 px segun su model card. Deriva del checkpoint base `Ultralytics/YOLOv10` (variante m) y se distribuye con licencia AGPL-3.0.

Su relevancia actual es doble: por un lado, ofrece un punto de referencia reproducible para deteccion en imagenes de dron, un dominio especialmente dificil por la densidad de objetos pequenos, las oclusiones y los cambios de escala; por otro, su tamano contenido y su consumo de computo lo hacen candidato a despliegue en hardware de borde embarcado. En el zoo de modelos VisDrone-DET publicado por el mismo autor, este checkpoint encabeza la tabla con 46,73 de mAP@50 y 27,72 de mAP@50-95 en el split de test, por delante de YOLOv8m, YOLOv9s, YOLO11s y RF-DETR Small.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv10 (detector de una sola etapa, CNN, con prediccion sin NMS segun la familia YOLOv10); variante m |
| Parametros totales | 16,6 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision); FLOPs medidos a 640 px de entrada |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos PyTorch (`best.pt`) |
| Idiomas soportados | no aplica (modelo de deteccion de objetos) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch `.pt` (`best.pt`), cargable con la libreria Ultralytics |
| Tarea | object-detection |
| Modelo base | Ultralytics/YOLOv10 (variante m) |
| Dataset de entrenamiento y evaluacion | Voxel51/VisDrone2019-DET (VisDrone-DET) |
| FLOPs | 64,5 B a 640 px (unidad tal como figura en la model card) |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia YOLOv10, un detector de objetos de una sola etapa basado en redes convolucionales. La innovacion principal de YOLOv10 frente a versiones anteriores de la saga es la eliminacion de la supresion de no maximos (NMS) en la inferencia mediante un entrenamiento consciente de la consistencia (consistent dual assignments), lo que reduce la latencia de postprocesado. El checkpoint aqui descrito es la variante m, con 16,6 millones de parametros. La model card no detalla la configuracion interna de la red (profundidad, anchura, modulos concretos), por lo que ese nivel de detalle no esta disponible.

El entrenamiento consiste en un ajuste fino (fine-tuning) del checkpoint base de Ultralytics sobre el conjunto VisDrone-DET, dentro del framework DetectionBench, que impone una receta de entrenamiento comun a todos los modelos comparados. Los datos de VisDrone-DET son imagenes aereas con anotaciones de objetos en 10 clases, con 6.471 imagenes de entrenamiento, 548 de validacion y 1.610 de test segun la documentacion del conjunto de datos. No se especifican en la informacion disponible el numero de epocas, el esquema de aumento de datos, la resolucion de entrenamiento exacta ni la composicion detallada del dataset. Tampoco se documenta ninguna fase de aprendizaje por refuerzo ni de alineacion tipo RLHF/DPO, algo que no aplica a un detector de objetos.

## Capacidades

- Deteccion de objetos en imagenes aereas capturadas con dron, con salida de cajas delimitadoras y clases.
- Inferencia sobre video, segun la demostracion incluida en el propio repositorio (dos clips del split de test de VisDrone-DET).
- Funcionamiento sin NMS, propio de YOLOv10, lo que reduce el coste de postprocesado en comparacion con detectores que si lo requieren.
- Deteccion en escenas densas con objetos de pequeno tamano, el escenario tipico de la vision aerea a baja altitud.
- Integracion directa con el ecosistema Ultralytics: carga del modelo, prediccion, validacion y exportacion a otros formatos mediante una API unica.
- Capacidad de reentrenamiento o ajuste posterior sobre otros conjuntos de imagenes aereas.
- No dispone de tool calling, razonamiento multi-paso, generacion de texto ni procesamiento de lenguaje, ya que no es un modelo de lenguaje.
- No dispone de modo de vision generativo, audio ni multimodalidad: es un detector discriminativo.

## Casos de uso

- Inspeccion de infraestructuras con dron: el modelo localiza elementos como vehiculos o peatones en imagenes aereas, lo que permite automatizar revisiones de carreteras, tendidos electricos o plantas industriales sin revisar manualmente cada fotograma.
- Vigilancia y seguridad perimetral: procesado de los flujos de video de un dron para detectar presencia de personas o vehiculos en zonas restringidas, con inferencia lo bastante ligera para ejecutarse a bordo o en una estacion cercana.
- Analisis de trafico urbano: conteo y localizacion de vehiculos en imagenes aereas de intersecciones, util para estudios de movilidad y planificacion de infraestructura, apoyandose en las 10 clases anotadas de VisDrone.
- Gestion de emergencias y busqueda y rescate: deteccion de personas en imagenes de zonas afectadas por catastrofes, donde la densidad de objetos pequenos y la vista cenital hacen inviable el etiquetado manual a tiempo.
- Agricultura de precision: localizacion de elementos sobre el terreno en vuelos de reconocimiento, como base para estimaciones de ocupacion o seguimiento de actividad en parcelas.
- Investigacion en deteccion aerea: uso como linea base reproducible dentro de DetectionBench para comparar nuevos detectores bajo una misma receta de entrenamiento y las mismas metricas.
- Prototipado en hardware de borde: al tratarse de un modelo de 16,6 M de parametros, es viable integrarlo en plataformas embarcadas tipo Jetson para experimentacion con inferencia local, aunque el autor no aporta cifras de latencia.
- Generacion de pseudoetiquetas: uso del detector para anotar automaticamente grandes volumenes de imagenes aereas que despues se revisan y corrigen manualmente.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card y en los metadatos `model-index` (marcados como no verificados de forma independiente). Evaluacion sobre el split de test de VisDrone-DET con el pipeline `detectionbench-evaluate`.

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 46,73 |
| mAP@50-95 | 27,72 |
| Precision | 59,23 |
| Recall | 47,35 |
| F1 | 52,63 |

Comparativa publicada por el autor dentro del zoo de modelos VisDrone-DET del proyecto DetectionBench (mismos datos de test):

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| YOLOv10m (este modelo) | 46,73 | 27,72 | 59,23 | 47,35 |
| YOLOv8m | 45,47 | 26,94 | 57,86 | 46,39 |
| YOLOv9s | 45,38 | 26,95 | 56,95 | 46,19 |
| YOLO26s | 44,87 | 26,43 | 56,44 | 45,41 |
| YOLOv10s | 44,51 | 26,28 | 55,97 | 45,61 |
| YOLO11s | 43,64 | 25,88 | 54,48 | 45,01 |
| YOLOv8s | 43,47 | 25,77 | 56,09 | 44,51 |
| YOLOv9t | 40,67 | 23,73 | 52,84 | 41,78 |
| YOLO26n | 39,90 | 22,95 | 51,14 | 42,08 |
| YOLOv10n | 39,80 | 23,08 | 51,22 | 41,50 |
| YOLOv8n | 39,69 | 23,03 | 52,02 | 41,36 |
| YOLO11n | 39,52 | 23,00 | 51,49 | 41,02 |
| RF-DETR Small | 39,13 | 21,68 | 64,38 | 49,47 |
| RF-DETR Nano | 37,92 | 20,88 | 69,02 | 46,21 |

Observacion: los detectores RF-DETR obtienen precision y recall mas altos que YOLOv10m pese a un mAP inferior, lo que sugiere un comportamiento distinto en el equilibrio entre falsos positivos y falsos negativos. El autor indica ademas que existen resultados anteriores de VisDrone2019-DET procedentes de un repositorio complementario (`VisDrone-dataset-python-toolkit`) que no se han reproducido dentro de DetectionBench.

## Requisitos de hardware

- Peso de los parametros: aproximadamente 66 MB en FP32 y 33 MB en FP16 para los 16,6 M de parametros, sin contar el grafo ni los buffers del runtime.
- VRAM estimada para inferencia: inferior a 1-2 GB a 640 px y lote 1 en FP16, incluyendo el overhead del runtime de PyTorch o TensorRT. Es una estimacion a partir del tamano del modelo; el autor no publica mediciones.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente. Para produccion con lotes grandes o multiples flujos de video, se recomiendan NVIDIA T4, L4, A10, RTX 4090, A100 o H100; para entrenamiento o reajuste fino, A100/H100 o RTX 4090.
- GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo moderna (RTX 3060, 4060, 4090, etc.), e incluso en GPUs con 4 GB de VRAM o menos.
- Hardware de borde: al tratarse de un modelo de deteccion aerea, es razonable su uso en plataformas tipo NVIDIA Jetson (Orin Nano, Orin NX, Xavier), si bien no se aportan cifras de rendimiento en estas plataformas.
- CPU: la inferencia en CPU es viable gracias al reducido numero de parametros, aunque sin datos de latencia publicados.
- Opciones de despliegue: Ultralytics (Python), exportacion a ONNX y ONNX Runtime, TensorRT, OpenVINO, TFLite, Core ML, TorchScript y formatos de borde soportados por Ultralytics. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector de objetos.
- Latencia y throughput: no disponibles. La model card no publica mediciones de FPS ni de latencia en ninguna GPU.

## Comparativa con modelos similares

| Modelo | Parametros | mAP@50 (VisDrone-DET) | mAP@50-95 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLOv10m (este modelo) | 16,6 M | 46,73 | 27,72 | AGPL-3.0 | HuggingFace, via Ultralytics |
| YOLOv8m (DetectionBench) | no disponible | 45,47 | 26,94 | AGPL-3.0 para los pesos de Ultralytics (no confirmado en la informacion disponible) | HuggingFace / Ultralytics |
| YOLOv10s (DetectionBench) | no disponible | 44,51 | 26,28 | AGPL-3.0 (no confirmado en la informacion disponible) | HuggingFace / Ultralytics |
| RF-DETR Small (DetectionBench) | no disponible | 39,13 | 21,68 | no disponible | HuggingFace / Roboflow |

Consideraciones de la comparativa: YOLOv10m lidera en mAP@50 y mAP@50-95 entre los checkpoints entrenados con la receta de DetectionBench, pero es la variante mas grande de la comparativa, por lo que su ventaja frente a YOLOv8m (1,26 puntos de mAP@50) debe ponderarse frente al coste computacional. Los modelos RF-DETR, de arquitectura transformer, ofrecen mejor precision y recall a costa de un mAP mas bajo. No se dispone de datos de parametros, FLOPs ni licencia para los modelos alternativos dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Ambito de dominio restringido: el modelo esta ajustado para imagenes aereas de tipo VisDrone. Su rendimiento en imagenes terrestres, de interior o con otro punto de vista no esta caracterizado y previsiblemente sera inferior.
- Objetos pequenos y escenas densas: la deteccion aerea es proclive a falsos negativos en objetos de pocos pixeles; el recall declarado (47,35) es notablemente inferior a la precision (59,23), lo que indica que se pierden bastantes objetos reales.
- Metricas no verificadas: los valores de `model-index` estan marcados como `verified: false`. Son declaraciones del autor, no resultados replicados por terceros.
- Riesgo de alucinacion en sentido estricto: no aplica, al no ser un modelo generativo. El equivalente es la deteccion de falsos positivos, es decir, cajas sobre regiones que no contienen objetos.
- Idiomas: no aplica. No existe procesamiento de lenguaje.
- Licencia AGPL-3.0: es una licencia copyleft fuerte. El uso comercial es posible, pero si se distribuye el software o se ofrece como servicio en red, es necesario liberar el codigo fuente correspondiente bajo la misma licencia. Conviene revisar esta obligacion antes de integrarlo en un producto propietario.
- Sin cuantizaciones publicadas: el repositorio solo ofrece pesos PyTorch. Cualquier conversion a TensorRT, ONNX o INT8 debe realizarla el usuario y validar que no degrada el mAP.
- Sin cifras de latencia ni consumo: no hay datos publicados de FPS, latencia ni requisitos energeticos, algo critico si el despliegue previsto es a bordo de un dron.
- Metodologia de evaluacion: los resultados se obtienen con el pipeline propio `detectionbench-evaluate`; comparaciones con cifras externas deben hacerse con cautela si el protocolo de evaluacion difiere.
- Adopcion nula hasta la fecha: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Fecha de creacion registrada como 2026-10-03, posterior a la fecha habitual de publicacion de YOLOv10, dato que conviene contrastar con el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/visdrone-yolov10m
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Repositorio complementario VisDrone-dataset-python-toolkit: https://github.com/dronefreak/VisDrone-dataset-python-toolkit
- README del toolkit (rama master): https://github.com/dronefreak/VisDrone-dataset-python-toolkit/blob/master/.github/README.md
- Fork del toolkit: https://github.com/Irving-panda/20260812-VisDrone-dataset-python-toolkit
- Coleccion VisDrone Detection Model Zoo: https://huggingface.co/collections/dronefreak/visdrone-detection-model-zoo
- Coleccion VisDrone Object Detection Model Zoo: https://huggingface.co/collections/dronefreak/visdrone-object-detection-model-zoo
- Documentacion del dataset VisDrone en Ultralytics: https://docs.ultralytics.com/datasets/detect/visdrone
- Dataset VisDrone2019-DET en HuggingFace: https://huggingface.co/datasets/Voxel51/VisDrone2019-DET
- Paper de VisDrone (arXiv:1804.07437): https://arxiv.org/abs/1804.07437
- Paper de YOLOv10 (arXiv:2405.14458): https://arxiv.org/abs/2405.14458
- Modelo base Ultralytics YOLOv10: https://huggingface.co/Ultralytics/YOLOv10
