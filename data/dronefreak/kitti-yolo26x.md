# dronefreak/kitti-yolo26x

## Resumen

kitti-yolo26x es un detector de objetos de la familia YOLO26, concretamente el escalado "x", ajustado (fine-tuned) sobre el conjunto de datos KITTI para deteccion en escenas de conduccion. Lo publica el usuario dronefreak dentro del proyecto DetectionBench, un marco de trabajo cuyo objetivo es comparar detectores modernos con recetas de entrenamiento y metricas de evaluacion identicas sobre varios conjuntos de datos reales. El modelo base es Ultralytics/YOLO26x y la tarea declarada es object-detection, con aplicacion directa en conduccion autonoma, ADAS y escenas de calle.

Tecnicamente es un detector convolucional de una sola etapa con 59,0 M de parametros y 209,5 GFLOPs por imagen a 640 px, lo que lo situa en el rango de la inferencia en tiempo real. Detecta ocho clases del benchmark KITTI: Car, Cyclist, Misc, Pedestrian, Person_sitting, Tram, Truck y Van. Se distribuye en formato PyTorch bajo la libreria ultralytics y con licencia AGPL-3.0.

Su relevancia es doble. Por un lado, ofrece un punto de referencia reproducible sobre KITTI dentro de una comparativa homogenea con otros detectores (YOLO26n/s/m, YOLO11s/n/x, YOLOv8n/s/m, YOLOv9t/s). Por otro, sus cifras son modestas en terminos absolutos (43,73 % mAP@50 y 25,96 % mAP@50-95 en el split de validacion) y estan declaradas por el autor sin verificacion independiente, algo que conviene tener presente antes de usarlo en produccion. Las metricas son especialmente buenas en la clase Car (90,97 % mAP@50) y claramente debiles en Misc, Person_sitting y Tram.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de objetos de una etapa basado en Ultralytics YOLO26x; la documentacion de Ultralytics describe la familia YOLO26 como modelos de vision end-to-end en tiempo real |
| Parametros totales | 59,0 M |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplicable (modelo de vision, no procesa texto) |
| Tipos de cuantizacion | No especificado en la model card; la cadena de exportacion de Ultralytics permite FP16 e INT8 mediante TensorRT, ONNX, CoreML y TFLite |
| Idiomas soportados | No aplicable (modelo de vision; no hay soporte linguistico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (libreria ultralytics); tamano del repositorio 0,1 GB; exportable a TensorRT, ONNX, CoreML y TFLite |
| Tarea (pipeline) | object-detection |
| Modelo base | Ultralytics/YOLO26 (fine-tune) |
| FLOPs | 209,5 B por imagen a 640 px |
| Clases | Car, Cyclist, Misc, Pedestrian, Person_sitting, Tram, Truck, Van |
| Dataset de entrenamiento | dronefreak/KITTI (KITTI) |
| Fecha de publicacion | 2026-09-25 (creacion y ultima actualizacion del repositorio) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint Ultralytics/YOLO26x sobre KITTI. La arquitectura de partida es la de la familia YOLO26 de Ultralytics, presentada por el fabricante como una familia de modelos de vision unificados, en tiempo real y end-to-end. Con 59,0 M de parametros y 209,5 GFLOPs a 640 px de resolucion de entrada, el escalado "x" es el mas pesado de la familia y esta pensado para maximizar precision a costa de mas computo. La model card no detalla la composicion de capas, el mecanismo de asignacion de etiquetas ni si se emplea una cabeza sin NMS; esos detalles deben consultarse en la documentacion de Ultralytics.

El entrenamiento y la evaluacion se realizaron dentro de DetectionBench, que impone recetas de entrenamiento y pipelines de evaluacion identicos entre detectores para que las comparaciones sean justas. Las metricas se calculan con el pipeline estandar del proyecto (`detectionbench-evaluate`) sobre el split de validacion de KITTI. No se documenta en la informacion disponible el numero de imagenes de entrenamiento, el numero de epocas, el regimen de aumentos de datos, ni el uso de tecnicas de alineacion como RLHF o DPO, que en cualquier caso no aplican a un detector de objetos. Tampoco se detalla si hubo destilacion desde el checkpoint base o busqueda de hiperparametros.

Las innovaciones destacables no vienen de este checkpoint concreto, sino de la familia base y del marco de evaluacion: la reproducibilidad de la receta y la publicacion abierta de una tabla comparativa con doce detectores evaluados sobre el mismo split. Ese "KITTI Model Zoo" es el principal valor anadido del repositorio, porque permite situar el resultado de cada variante sin ambiguedades de protocolo.

## Capacidades

- Deteccion de objetos en imagenes de escenas de trafico con ocho clases: Car, Cyclist, Misc, Pedestrian, Person_sitting, Tram, Truck y Van.
- Localizacion con cajas delimitadoras (bounding boxes) y puntuaciones de confianza por clase.
- Inferencia en tiempo real: 209,5 GFLOPs por imagen a 640 px, dentro del rango habitual de los detectores de una etapa desplegables en GPU de gama media.
- Soporte de lotes (batch inference) y de resoluciones de entrada configurables a traves de la API de Ultralytics.
- Exportacion a multiples formatos de despliegue: TensorRT, ONNX, CoreML y TFLite, segun la documentacion de integraciones de Ultralytics.
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades de agente ni modo "thinking"; no es un modelo de lenguaje.
- No dispone de capacidades multilingues, de vision-lenguaje, de audio ni de generacion de texto.
- Rendimiento muy desigual por clase: excelente en Car y aceptable en Pedestrian y Cyclist, bajo en Misc, Person_sitting y Tram.

## Casos de uso

- Deteccion de obstaculos para ADAS: el modelo identifica coches, peatones, ciclistas, camiones y tranvias en imagenes de calle, que es exactamente el dominio de KITTI. Su coste de 209,5 GFLOPs por fotograma a 640 px permite integrarlo en un bucle de percepcion en tiempo real sobre GPU de gama media.
- Pre-anotacion automatica de datasets de conduccion (auto-labeling): generar cajas candidatas sobre nuevas imagenes y enviar solo las de baja confianza a revision humana reduce el coste de etiquetado en proyectos de vision para automocion. La clase Car, con 90,97 % mAP@50, es la mas fiable para este flujo.
- Analitica de trafico urbano: conteo y clasificacion de vehiculos, peatones y ciclistas en grabaciones de camara fija. Las clases Truck (37,73 % mAP@50) y Van (43,48 %) permiten separar tipologias de vehiculo, aunque con menor precision que la clase Car.
- Investigacion en conduccion autonoma: uso como componente de percepcion en pipelines experimentales o como linea base sobre KITTI para comparar propuestas nuevas con una referencia publicada y reproducible dentro de DetectionBench.
- Evaluacion comparativa de detectores: dado que DetectionBench publica doce modelos evaluados con la misma receta, este checkpoint sirve como referencia para medir el efecto de cambios en arquitectura, datos o aumentos bajo un protocolo fijo.
- Robotica movil y plataformas aereas no tripuladas: deteccion de peatones y vehiculos desde plataformas moviles en entornos de calle, aprovechando que la familia YOLO26 exporta a TensorRT y TFLite para hardware embebido como Jetson.
- Sistemas de videovigilancia vial y dashcams: analisis offline de grabaciones para reconstruir incidentes o medir flujos, donde la latencia no es critica y se puede priorizar precision sobre velocidad de proceso.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de validacion de KITTI (metricas no verificadas de forma independiente, campo `verified: false` en el model-index).

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 43,73 |
| mAP@50-95 | 25,96 |
| Precision | 64,17 |
| Recall | 41,28 |
| F1 Score | 50,24 |

Rendimiento por clase (mAP sobre el split de validacion de KITTI):

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| Car | 90,97 | 66,22 |
| Pedestrian | 65,83 | 29,83 |
| Cyclist | 61,15 | 33,96 |
| Van | 43,48 | 27,53 |
| Truck | 37,73 | 26,21 |
| Tram | 20,35 | 10,03 |
| Person_sitting | 17,08 | 5,87 |
| Misc | 13,24 | 8,05 |

Comparativa publicada por el autor con otros detectores evaluados en el mismo split de KITTI (KITTI Model Zoo de DetectionBench):

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| YOLO26x (este modelo) | 43,73 | 25,96 | 64,17 | 41,28 |
| YOLO26n | 42,54 | 25,43 | 48,62 | 42,84 |
| YOLO11s | 42,00 | 25,10 | 47,27 | 43,71 |
| YOLOv8s | 41,99 | 25,20 | 49,02 | 43,66 |
| YOLO26m | 41,91 | 25,78 | 63,34 | 39,71 |
| YOLO26s | 41,79 | 26,54 | 59,64 | 42,42 |
| YOLOv9t | 41,60 | 25,73 | 48,30 | 44,20 |
| YOLOv9s | 40,84 | 25,92 | 54,27 | 41,51 |
| YOLOv8m | 40,48 | 25,37 | 50,81 | 39,86 |
| YOLOv8n | 40,11 | 24,75 | 46,05 | 41,85 |
| YOLO11x | 39,18 | 23,60 | 46,28 | 41,69 |
| YOLO11n | 38,77 | 23,97 | 52,84 | 40,19 |

Lectura de los datos: YOLO26x obtiene el mejor mAP@50 del conjunto (43,73) y la mejor precision (64,17), pero su recall (41,28) queda por debajo de alternativas mucho mas ligeras como YOLO26n (42,84) o YOLOv9t (44,20). YOLO26s logra el mejor mAP@50-95 (26,54) con una fraccion de los parametros de la variante "x".

## Requisitos de hardware

- Peso de los parametros: 59,0 M de parametros equivalen a aproximadamente 236 MB en FP32 y unos 118 MB en FP16. El repositorio completo ocupa 0,1 GB.
- VRAM estimada para inferencia: con un lote de una imagen a 640 px, la mayor parte del consumo corresponde a activaciones, no a pesos. Como referencia practica, menos de 2 GB en FP16 y en torno a 1 GB en INT8 con TensorRT o TFLite; con lotes grandes o resoluciones superiores, el consumo crece de forma aproximadamente lineal con el area de la imagen y el tamano del lote.
- GPU recomendadas: cualquier GPU con tensor cores es adecuada. Para produccion en servidor, NVIDIA T4, L4, A10, A100 o H100; en estaciones de trabajo, RTX 4090, RTX 4080 o superiores.
- Caberia en GPU de consumo: si. Es desplegable en GPUs de gama media y baja como RTX 3060 (12 GB), RTX 4060, GTX 1660 o incluso en hardware integrado con INT8, dado el reducido numero de parametros.
- Hardware embebido: la exportacion a TensorRT y TFLite permite ejecutarlo en plataformas como NVIDIA Jetson (Orin, Xavier) o aceleradores edge. La model card no confirma explicitamente la validacion en estas plataformas.
- Opciones de despliegue: Ultralytics (Python), exportacion a ONNX Runtime, TensorRT, CoreML, TFLite; servible mediante Triton Inference Server, TorchServe, FastAPI con ONNX Runtime o el propio pipeline de Ultralytics.
- Latencia y throughput estimados: no disponible. La model card no publica mediciones de latencia ni FPS, y no deben extrapolarse a partir de los GFLOPs sin una medicion real, porque dependen del formato de export, del backend, de la GPU y del preprocesado.
- Consideracion de memoria: el cuello de botella en este rango de tamano suele ser el preprocesado y el postprocesado, no la red, por lo que conviene medir el pipeline completo antes de dimensionar el hardware.

## Comparativa con modelos similares

Comparativa con alternativas de la misma categoria (detectores de una etapa para escenas de conduccion), usando los datos publicados por el propio autor sobre el split de validacion de KITTI.

| Modelo | Parametros | mAP@50 (KITTI) | mAP@50-95 (KITTI) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kitti-yolo26x (este modelo) | 59,0 M | 43,73 | 25,96 | AGPL-3.0 | HuggingFace: dronefreak/kitti-yolo26x |
| YOLO26s | No disponible | 41,79 | 26,54 | AGPL-3.0 (licencia de la familia Ultralytics) | HuggingFace: dronefreak/lisa-yolo26x y otros checkpoints de DetectionBench |
| YOLO11x | No disponible | 39,18 | 23,60 | AGPL-3.0 | Checkpoints equivalentes dentro de DetectionBench |
| YOLOv8s | No disponible | 41,99 | 25,20 | AGPL-3.0 | Checkpoints equivalentes dentro de DetectionBench |
| YOLO26n | No disponible | 42,54 | 25,43 | AGPL-3.0 | Checkpoints equivalentes dentro de DetectionBench |

Observaciones de la comparativa:

- Este checkpoint lidera en mAP@50 y precision, pero es el mas caro computacionalmente del grupo (209,5 GFLOPs por imagen), mientras que variantes como YOLO26n o YOLO26s ofrecen cifras muy cercanas o superiores en mAP@50-95 con un coste mucho menor.
- YOLO11x obtiene peor mAP@50 y peor mAP@50-95 que la mayoria de variantes YOLO26 mas pequenas en este conjunto, lo que sugiere que el ajuste fino sobre KITTI esta mas condicionado por la receta de entrenamiento que por el tamano del modelo.
- Todos los modelos de la comparativa comparten la misma familia de licencias (AGPL-3.0) y el mismo protocolo de evaluacion, por lo que la comparacion es homogenea dentro de DetectionBench. No se dispone de datos de detectores de otras familias (por ejemplo, basados en transformer) evaluados con esta misma receta.

## Limitaciones y advertencias

- Metricas no verificadas: el model-index marca todos los resultados como `verified: false`. Son cifras declaradas por el autor, sin reproduccion independiente conocida.
- Rendimiento absoluto modesto: 43,73 % mAP@50 y 25,96 % mAP@50-95 en un conjunto de conduccion indican que el detector esta lejos de ser fiable como unico componente de percepcion en un sistema autonomo.
- Recall bajo (41,28 %): un porcentaje relevante de objetos reales no se detecta. Para aplicaciones de seguridad, especialmente deteccion de peatones, esto es un riesgo critico.
- Clases muy debiles: Misc (13,24 % mAP@50), Person_sitting (17,08 %) y Tram (20,35 %) tienen un rendimiento pobre y no deberian usarse en produccion sin un ajuste adicional o sin reentrenamiento.
- Sesgo de dominio: el modelo esta ajustado exclusivamente sobre KITTI. El dataset de KITTI se limita a escenas de trafico grabadas en condiciones y localizaciones concretas, por lo que el modelo puede degradarse en otros paises, condiciones meteorologicas adversas, iluminacion nocturna, camaras distintas o entornos no urbanos. La model card no documenta evaluaciones fuera de distribucion.
- Riesgo de falsos positivos y falsos negativos: la precision de 64,17 % implica que cerca de un tercio de las detecciones positivas pueden ser incorrectas, lo que exige umbrales de confianza y logica de filtrado especificos por caso de uso.
- Cobertura de clases limitada: solo ocho clases. No detecta senales de trafico, marcas viales, semaforos ni otros elementos relevantes para conduccion.
- Licencia AGPL-3.0: es una licencia copyleft fuerte. El uso comercial es posible, pero obliga a liberar el codigo fuente de las obras derivadas y de los sistemas que ofrezcan el modelo como servicio en red. Conviene revisar las implicaciones con el departamento legal antes de integrarlo en un producto propietario; existen licencias comerciales alternativas de Ultralytics.
- Procedencia de los datos de entrenamiento: la model card remite a la ficha del dataset dronefreak/KITTI para la descripcion, procedencia y licencia. Es responsabilidad del usuario verificar que los terminos del dataset son compatibles con su uso previsto.
- Sin soporte linguistico ni multimodal: no procesa texto, no admite instrucciones en lenguaje natural ni genera descripciones, por lo que no puede integrarse directamente en flujos de agente ni en asistentes conversacionales.
- Adopcion nula: el repositorio registra 0 descargas y 0 "me gusta" en el momento de la consulta, lo que significa que no hay evidencia de uso en produccion ni de validacion por parte de la comunidad.
- Trazabilidad del articulo: los identificadores arXiv asociados en las etiquetas no se describen en la informacion disponible, por lo que no se puede confirmar a que publicaciones corresponden ni como respaldan las cifras.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/kitti-yolo26x
- Dataset en HuggingFace: https://huggingface.co/datasets/dronefreak/KITTI
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Modelo base en HuggingFace: https://huggingface.co/Ultralytics/YOLO26
- Documentacion de Ultralytics YOLO26: https://docs.ultralytics.com/models/yolo26
- Repositorio de inicio rapido de YOLO26: https://github.com/ultralytics/yolo26
- Checkpoint hermano en HuggingFace (lisa-yolo26x): https://huggingface.co/dronefreak/lisa-yolo26x
- Articulos referenciados en las etiquetas del modelo (contenido no descrito en la informacion disponible):
  - https://arxiv.org/abs/2606.03748
  - https://arxiv.org/abs/2410.17725
  - https://arxiv.org/abs/2402.13616
