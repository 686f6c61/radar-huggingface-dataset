# dronefreak/visdrone-rfdetr-small

## Resumen

RF-DETR Small Finetuned on VisDrone-DET es un detector de objetos basado en la arquitectura RF-DETR (Real-Time DEtection TRansformer) de Roboflow, ajustado por el autor dronefreak sobre el conjunto de datos VisDrone-DET, un benchmark de referencia para deteccion en imagenes aereas capturadas por drones. El modelo parte del checkpoint Roboflow/rf-detr-small y se entrena y evalua dentro de DetectionBench, un framework que busca reproducibilidad en la comparacion de detectores modernos aplicando recetas de entrenamiento y metricas identicas sobre multiples datasets reales.

Con 32.048.112 parametros, el modelo resuelve el problema de deteccion de objetos de pequeno tamano en escenarios de vision aerea, donde clases como peatones, vehiculos y bicicletas aparecen en escalas muy reducidas y con oclusiones frecuentes. Su relevancia actual radica en que ofrece una alternativa basada en transformer (DETR) al dominio tradicionalmente dominado por la familia YOLO en deteccion aerea, con un rendimiento en mAP@50 de 39,13 sobre el split de test de VisDrone-DET.

El modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial, y se integra con la libreria `rfdetr` y el ecosistema de Hugging Face. Su tamano compacto (0,4 GB de repositorio) y su naturaleza de detector en tiempo real lo hacen adecuado para despliegues en edge y en sistemas embarcados sobre drones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR (Real-Time DEtection TRansformer), basada en DETR |
| Parametros totales | 32.048.112 (32,1 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, sin capacidades linguisticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y `checkpoint_best_total.pth` (PyTorch) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura RF-DETR, una variante de los detectores basados en transformer (DETR) disenada para inferencia en tiempo real. RF-DETR combina un backbone de extraccion de caracteristicas con un decoder transformer que predice conjuntos de objetos directamente, eliminando la necesidad de componentes como anchors o non-maximum suppression en el postprocesado. El checkpoint base es Roboflow/rf-detr-small, sobre el que se realiza un ajuste fino supervisado con el dataset VisDrone2019-DET.

El entrenamiento se llevo a cabo dentro del framework DetectionBench, que aplica una receta de entrenamiento estandarizada y una pipeline de evaluacion comun (`detectionbench-evaluate`) para garantizar comparaciones justas entre detectores. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de tecnicas de RLHF o DPO, dado que no aplican a un modelo de deteccion. Tampoco se han publicado datos sobre innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal en la informacion disponible.

## Capacidades

- Deteccion de objetos en imagenes aereas capturadas por drones (VisDrone-DET).
- Identificacion de clases como peatones, vehiculos, bicicletas y otras categorias del benchmark VisDrone.
- Deteccion de objetos de pequeno tamano y en condiciones de oclusion, propias de la vision aerea.
- Inferencia en tiempo real gracias a la arquitectura RF-DETR.
- Integracion con la libreria `rfdetr` mediante `RFDETRSmall` y carga de pesos desde Hugging Face.
- Prediccion con umbral de confianza configurable (`threshold`).
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de capacidades multilingues, de vision generativa, audio ni thinking mode.

## Casos de uso

- Vigilancia aerea con drones: el modelo detecta peatones y vehiculos en imagenes capturadas desde aeronaves no tripuladas, adecuado para monitorizacion de trafico y seguridad urbana gracias a su entrenamiento especifico en VisDrone-DET.
- Analisis de trafico urbano: permite contar y localizar vehiculos y peatones en imagenes aereas de alta densidad, util para estudios de movilidad y planificacion urbana.
- Busqueda y rescate: la deteccion de personas en imagenes aereas de gran extension facilita la localizacion de individuos en operaciones de emergencia, aprovechando la capacidad del modelo para objetos pequenos.
- Inspeccion de infraestructuras: deteccion de vehiculos y elementos en entornos industriales o viarios desde perspectiva aerea para mantenimiento preventivo.
- Agricultura de precision: monitorizacion de parcelas mediante deteccion de objetos y personas en imagenes de dron, integrable en pipelines de analisis de cultivos.
- Sistemas embarcados en drones: su tamano de 32,1 M de parametros y su naturaleza en tiempo real permiten desplegarlo en hardware de bordo con recursos limitados.
- Investigacion en vision aerea: sirve como baseline reproducible dentro de DetectionBench para comparar detectores bajo recetas identicas.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de VisDrone-DET (no verificados):

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 39,13 |
| mAP@50-95 | 21,68 |
| Precision | 64,38 |
| Recall | 49,47 |
| F1 Score | 55,95 |
| Parametros | 32,1 M |
| FLOPs | no disponible |

Comparativa dentro del model zoo de VisDrone-DET de DetectionBench:

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| YOLO26m | 49,11 | 29,24 | 60,21 | 49,76 |
| YOLO11m | 48,03 | 28,56 | 59,34 | 48,30 |
| YOLOv9m | 47,62 | 28,52 | 59,26 | 48,40 |
| YOLOv10m | 46,73 | 27,72 | 59,23 | 47,35 |
| YOLOv8m | 45,47 | 26,94 | 57,86 | 46,39 |
| YOLOv8s | 43,47 | 25,77 | 56,09 | 44,51 |
| YOLO26n | 39,90 | 22,95 | 51,14 | 42,08 |
| RF-DETR Medium | 39,62 | 21,99 | 70,62 | 46,76 |
| YOLO11n | 39,52 | 23,00 | 51,49 | 41,02 |
| **RF-DETR Small** | **39,13** | **21,68** | **64,38** | **49,47** |
| RF-DETR Nano | 37,92 | 20,88 | 69,02 | 46,21 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 32,1 M de parametros y pesos en precision completa, el modelo ocupa aproximadamente 128 MB, por lo que la VRAM necesaria es moderada y depende del tamano de lote y resolucion de entrada.
- GPU recomendadas: no se especifican en la informacion disponible; por su tamano, cualquier GPU moderna con al menos 4-8 GB de VRAM deberia ser suficiente.
- Cabe en GPU de consumo: si, dado su reducido numero de parametros; tarjetas como RTX 3060, RTX 4060 o superiores son adecuadas.
- Opciones de despliegue: libreria `rfdetr` (con `RFDETRSmall`), PyTorch, y carga de pesos via `huggingface_hub`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a deteccion de objetos).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | mAP@50 (VisDrone) | mAP@50-95 | Licencia | Framework |
|---|---|---|---|---|---|
| RF-DETR Small (este) | 32,1 M | 39,13 | 21,68 | Apache 2.0 | rfdetr |
| RF-DETR Medium | no disponible | 39,62 | 21,99 | Apache 2.0 | rfdetr |
| RF-DETR Nano | no disponible | 37,92 | 20,88 | Apache 2.0 | rfdetr |
| YOLO11n | no disponible | 39,52 | 23,00 | AGPL-3.0 (habitual) | Ultralytics |
| YOLOv8n | no disponible | 39,69 | 23,03 | AGPL-3.0 (habitual) | Ultralytics |

RF-DETR Small se situa en un rango de rendimiento comparable a las variantes nano de YOLO en mAP@50, con mayor precision (64,38 frente a ~51-52 de YOLO nano) pero menor recall relativo en algunos casos. Frente a RF-DETR Medium, el rendimiento es ligeramente inferior en mAP pero con menor coste computacional.

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor y no estan verificados (`verified: false`), por lo que deben tomarse con cautela.
- El modelo esta especializado en imagenes aereas de VisDrone-DET; su rendimiento en dominios distintos (imagenes terrestres, interiores, otras camaras) puede degradarse significativamente.
- Riesgo de falsos negativos en objetos muy pequenos u ocluidos, reflejado en un recall de 49,47 %.
- No se dispone de informacion sobre sesgos especificos del dataset ni sobre su composicion demografica o geografica.
- Limitaciones de idioma no aplican (modelo de vision), pero las clases detectables estan restringidas a las del benchmark VisDrone.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del dataset VisDrone2019-DET subyacente.
- No se documentan FLOPs ni latencia, lo que dificulta estimar el coste real en produccion.
- El modelo tiene solo 33 descargas y 0 likes en el momento de la ficha, lo que sugiere una validacion comunitaria limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/visdrone-rfdetr-small
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Modelo base RF-DETR Small: https://huggingface.co/Roboflow/rf-detr-small
- Dataset VisDrone2019-DET: https://huggingface.co/datasets/Voxel51/VisDrone2019-DET
- Paper VisDrone (arXiv:1804.07437): https://arxiv.org/abs/1804.07437
- Paper RF-DETR (arXiv:2511.09554): https://arxiv.org/abs/2511.09554
- Paper DETR (arXiv:2304.07193): https://arxiv.org/abs/2304.07193
