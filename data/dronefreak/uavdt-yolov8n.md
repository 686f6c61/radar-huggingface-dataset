# dronefreak/uavdt-yolov8n

## Resumen

uavdt-yolov8n es un detector de objetos de una sola etapa resultado de afinar (fine-tuning) el modelo YOLOv8n de Ultralytics sobre el conjunto de datos UAVDT (Unmanned Aerial Vehicle Benchmark), un benchmark de imagenes aereas captadas por drones para deteccion de vehiculos. Lo publica el usuario dronefreak dentro del proyecto DetectionBench, un framework cuyo objetivo es reproducir recetas de entrenamiento y evaluacion identicas para comparar detectores modernos sobre varios conjuntos de datos reales.

El modelo es deliberadamente pequeno: 3,2 millones de parametros y 8,7 GFLOPs, la variante mas ligera de la familia YOLOv8. Resuelve la tarea de localizar y clasificar tres clases de vehiculos (car, truck y bus) en imagenes de trafico aereo, un escenario caracterizado por objetos muy pequenos, oclusiones frecuentes y movimiento de camara. Su relevancia es doble: por un lado ofrece un punto de partida de bajo coste computacional para despliegue en borde; por otro, forma parte de una tabla comparativa abierta que situa cada checkpoint con la misma receta de evaluacion.

Los resultados publicados son modestos: 10,79 % de mAP@50 y 6,42 % de mAP@50-95 sobre el split de test de UAVDT, con una precision de 18,61 % y un recall de 24,58 %. El desglose por clase muestra que practicamente todo el rendimiento proviene de la clase car (25,78 % de mAP@50), mientras que truck (1,67 %) y bus (4,93 %) quedan muy por debajo, un reflejo tanto de la dificultad del conjunto como de la limitada capacidad del backbone nano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8n (Ultralytics): red convolucional de una sola etapa, sin anchors, con cabecera de deteccion desacoplada |
| Parametros totales | 3,2 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision por computador) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; al ser un modelo Ultralytics es exportable a FP16/INT8 mediante ONNX, TensorRT, OpenVINO, TFLite y CoreML |
| Idiomas soportados | no aplica (vision por computador); no disponible |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (.pt, archivo best.pt); otros formatos solo mediante exportacion |
| Tarea | object-detection (deteccion de objetos) |
| Framework | Ultralytics (libreria ultralytics) |
| Modelo base | Ultralytics/YOLOv8 (fine-tuning) |
| Dataset de entrenamiento | dronefreak/UAVDT |
| Clases | car, truck, bus |
| FLOPs | 8,7 B |
| Metricas declaradas | mAP@50 10,79 %; mAP@50-95 6,42 %; precision 18,61 %; recall 24,58 %; F1 21,18 % |
| Fecha de creacion (metadatos) | 2026-09-18 |
| Fecha de ultima actualizacion (metadatos) | 2026-09-18 |
| Descargas / likes | 0 / 0 |
| Tamano del repositorio | 0,0 GB (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura es la de YOLOv8n: un backbone convolucional con bloques C2f y conexiones residuales, un neck de tipo PAN-FPN que fusiona caracteristicas de varias escalas y una cabecera de deteccion anclada libremente (anchor-free) con ramas separadas para clasificacion y regresion de caja. Al ser la variante "n" (nano), el numero de canales y de bloques es el minimo de la familia, lo que se traduce en 3,2 M de parametros y 8,7 GFLOPs. La informacion disponible no detalla la resolucion de entrada empleada en el entrenamiento, el numero de epocas, el optimizador ni si se aplicaron tecnicas de aumento de datos especificas mas alla de las habituales de Ultralytics.

El entrenamiento consiste en un fine-tuning supervisado sobre UAVDT a partir de los pesos preentrenados de YOLOv8, no en un entrenamiento desde cero. No hay constancia de fases de ajuste por refuerzo, DPO ni tecnicas de alineacion, algo que no aplica a un detector de objetos. La innovacion principal del proyecto no esta en el modelo sino en el protocolo: DetectionBench aplica una receta de entrenamiento y una pipeline de evaluacion comunes (`detectionbench-evaluate`) a todos los checkpoints, de modo que las cifras de distintos detectores sobre UAVDT sean comparables entre si. La model card incluye ademas visualizaciones de curva precision-recall, curva F1 y matrices de confusion, aunque el contenido citado del README se interrumpe en la seccion "Usage".

## Capacidades

- Deteccion de objetos en imagenes aereas con tres clases: car, truck y bus.
- Localizacion con caja delimitadora y puntuacion de confianza por deteccion, en una sola pasada hacia delante.
- Deteccion de objetos pequenos en escenas de dron con fondo variable y camara en movimiento, condicion para la que el modelo fue afinado.
- Inferencia en tiempo real sobre hardware modesto, dado su reducido coste computacional.
- Exportacion a multiples runtimes (ONNX, TensorRT, OpenVINO, TFLite, CoreML, TorchScript) mediante la libreria Ultralytics.
- Entrenamiento adicional o reajuste por parte del usuario usando el mismo framework Ultralytics.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no aplica.
- Capacidades especiales (modo thinking, vision-lenguaje, audio, generacion de texto): no disponibles; el modelo solo produce detecciones.

## Casos de uso

- Vigilancia de trafico desde dron: el modelo procesa fotogramas aereos y devuelve cajas con clase car, truck o bus, lo que permite contar vehiculos y estimar flujos en una via sin necesidad de infraestructura fija en el suelo.
- Analisis de aforo en aparcamientos o zonas logisticas: con la clase car como clase dominante (25,78 % de mAP@50), es util para inventariar ocupacion en imagenes cenitales o ligeramente oblicuas.
- Prototipado rapido en proyectos de vision aerea: al ser un checkpoint de 3,2 M de parametros, sirve como linea base reproducible antes de invertir en modelos mayores, y su evaluacion esta estandarizada por DetectionBench.
- Despliegue en borde sobre drones y dispositivos embebidos: su tamano permite ejecutarlo en plataformas tipo Jetson o en mini-PC con GPU integrada, incluso a bordo, reduciendo la necesidad de transmitir video en crudo.
- Filtrado previo en pipelines de videovigilancia: colocado antes de un modelo mas costoso, reduce el numero de fotogramas o regiones que merecen analisis detallado.
- Docencia y reproduccion de experimentos: la receta comun de DetectionBench facilita utilizarlo como ejemplo de fine-tuning reproducible y de comparacion justa entre arquitecturas sobre el mismo dataset.
- Generacion de anotaciones asistida: las detecciones pueden emplearse como preetiquetado de nuevos clips aereos, revisadas despues por un anotador humano, aunque la baja precision (18,61 %) obliga a una revision exhaustiva.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (model-index), sobre el split de test de UAVDT y sin verificacion independiente (`verified: false`). No se han publicado resultados de benchmarks adicionales en la informacion disponible.

| Metrica | Valor (%) | Split | Verificado |
|---|---|---|---|
| mAP@50 | 10,79 | test | no |
| mAP@50-95 | 6,42 | test | no |
| Precision | 18,61 | test | no |
| Recall | 24,58 | test | no |
| F1 | 21,18 | test | no |

Desglose por clase, declarado por el autor:

| Clase | mAP@50 (%) | mAP@50-95 (%) |
|---|---|---|
| car | 25,78 | 14,58 |
| truck | 1,67 | 0,98 |
| bus | 4,93 | 3,71 |

## Requisitos de hardware

- VRAM estimada para inferencia: del orden de 1-2 GB en FP16 para lotes pequenos (estimacion derivada de los 3,2 M de parametros y 8,7 GFLOPs; no publicada por el autor).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas (RTX 3060, RTX 4060, RTX 4090); en centro de datos, A100 o H100 quedan sobredimensionadas para este tamano y solo tienen sentido para lotes muy grandes o entrenamiento.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas de los ultimos diez anos, y tambien en CPU para inferencia puntual.
- Plataformas de borde: Jetson Orin Nano, Jetson Xavier NX, Raspberry Pi 5 con acelerador o NPU integradas, previa exportacion a TensorRT, OpenVINO o TFLite.
- Opciones de despliegue: API Python de Ultralytics, exportacion a ONNX Runtime, TensorRT, OpenVINO, TFLite, CoreML y TorchScript. vLLM y TGI no aplican, ya que son servidores para modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada; el autor no publica mediciones de tiempo de inferencia ni FPS.

## Comparativa con modelos similares

La model card incluye una tabla comparativa propia sobre UAVDT con la misma receta de evaluacion (zoo de DetectionBench). Se reproduce a continuacion; los valores son los declarados por el autor y no estan verificados de forma independiente. No se dispone de datos de parametros, contexto ni licencia de los modelos alternativos en la informacion proporcionada.

| Modelo | mAP@50 (%) | mAP@50-95 (%) | Precision (%) | Recall (%) |
|---|---|---|---|---|
| RF-DETR Medium | 15,02 | 8,76 | 40,28 | 61,14 |
| RF-DETR Small | 14,89 | 8,92 | 38,83 | 61,65 |
| YOLOv26s | 14,09 | 7,91 | 23,88 | 27,05 |
| RF-DETR Nano | 12,96 | 7,33 | 37,12 | 55,40 |
| YOLOv26m | 12,32 | 6,66 | 19,44 | 25,83 |
| YOLOv8m | 12,28 | 7,05 | 19,73 | 25,33 |
| YOLOv11x | 11,98 | 6,68 | 18,70 | 25,93 |
| YOLOv8s | 11,48 | 6,71 | 19,34 | 23,39 |
| YOLOv8n (este modelo) | 10,79 | 6,42 | 18,61 | 24,58 |

Lectura de la tabla: el modelo aqui descrito ocupa la ultima posicion en mAP@50, coherente con ser la variante mas pequena; la diferencia en precision y recall frente a los RF-DETR (Nano incluido) es notable, lo que sugiere que el cuello de botella sobre UAVDT no es solo la capacidad del backbone sino tambien la receta de entrenamiento de la familia YOLO en este dominio.

## Limitaciones y advertencias

- Rendimiento bajo en terminos absolutos: 10,79 % de mAP@50 y 6,42 % de mAP@50-95 sobre el split de test. No es adecuado como componente critico de un sistema de produccion sin un ajuste posterior.
- Precision muy baja (18,61 %), lo que implica un volumen alto de falsos positivos; el recall tampoco es alto (24,58 %), por lo que se producen falsos negativos de forma habitual.
- Desequilibrio severo entre clases: truck (1,67 % de mAP@50) y bus (4,93 %) son practicamente inoperables; el modelo es, en la practica, un detector de turismos.
- Dominio muy restringido: solo imagenes aereas de UAVDT, con condiciones de iluminacion, altitud y camara concretas. El rendimiento fuera de ese dominio no esta documentado.
- Riesgo de alucinacion en el sentido de detecciones espurias: al tener una precision baja, es esperable que se generen cajas sobre objetos inexistentes o mal clasificados, especialmente en escenas con clutter.
- Sin datos de sesgo demografico (no aplica), pero si posibles sesgos de dominio geografico y de tipo de via derivados del conjunto UAVDT.
- Limitaciones de idioma: no aplica; el modelo no procesa lenguaje.
- Licencia AGPL-3.0: es una licencia copyleft fuerte. El uso comercial es posible, pero obliga a liberar el codigo fuente de las obras derivadas y de los servicios en red que lo utilicen, lo que puede ser incompatible con productos propietarios. Conviene revisar las condiciones con el equipo legal antes de integrarlo.
- Metricas no verificadas: todos los valores del model-index tienen `verified: false` y proceden del propio autor.
- La model card esta incompleta en el contenido citado: la seccion de uso ("Usage") se interrumpe, por lo que no se documentan aqui los parametros de inferencia recomendados (resolucion, umbral de confianza, IoU).
- Los metadatos indican 0 descargas y 0 likes, y un tamano de repositorio de 0,0 GB; el modelo es muy reciente y carece de validacion por parte de la comunidad.
- Las fechas de creacion y actualizacion registradas (2026-09-18) son las que figuran en los metadatos de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/uavdt-yolov8n
- Dataset UAVDT (autor): https://huggingface.co/datasets/dronefreak/UAVDT
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Modelo base: https://huggingface.co/Ultralytics/YOLOv8
- Demo en video del autor: https://huggingface.co/dronefreak/uavdt-yolov8n/resolve/main/assets/demo_banner.mp4
- Poster de la demo: https://huggingface.co/dronefreak/uavdt-yolov8n/resolve/main/assets/demo_banner_poster.jpg
- Identificadores arXiv etiquetados en el repositorio (contenido no descrito en la informacion proporcionada): arXiv:1804.00518, arXiv:2511.09554, arXiv:2304.07193, arXiv:2410.17725, arXiv:2606.03748
- Busqueda web: no se han encontrado resultados relevantes para este modelo; las unicas entradas recuperadas corresponden a paginas de Google Maps y Google Earth sin relacion con el proyecto.
