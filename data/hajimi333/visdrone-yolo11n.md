# hajimi333/visdrone-yolo11n

## Resumen

visdrone-yolo11n es un detector de objetos YOLO11n afinado sobre el conjunto de datos VisDrone-DET, orientado a la deteccion de objetos en imagenes aereas capturadas por drones. Lo publica el usuario hajimi333 en Hugging Face como parte del proyecto DetectionBench, un marco para evaluar de forma reproducible detectores modernos con recetas de entrenamiento y metricas de evaluacion identicas. El modelo parte de los pesos preentrenados de Ultralytics YOLO11 y se especializa en las diez clases de VisDrone (peatones, personas, bicicletas, coches, furgonetas, camiones, triciclos, autobuses con techo y sin techo, y motocicletas).

Se trata de un modelo de vision por computador muy ligero: 2,6 millones de parametros y 6,6 GFLOPs a 640 px, lo que lo situa en la gama nano de la familia YOLO11. Su relevancia radica en que ofrece un punto de referencia reproducible dentro de DetectionBench, con resultados declarados sobre el split de test de VisDrone-DET (mAP@50 de 39,52 % y mAP@50-95 de 23,0 %), y en que permite comparar directamente con otros detectores evaluados bajo la misma receta, incluidos modelos basados en transformer como RF-DETR.

El modelo es adecuado para tareas de deteccion en tiempo real sobre imagenes aereas de baja altitud, donde el reducido coste computacional es critico. No obstante, su tamano nano limita el rendimiento en objetos pequenos y densamente agrupados, tipicos de la imagery de drones, por lo que en produccion conviene valorar variantes mayores de la misma familia si la precision es prioritaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11n (detector de una etapa, red neuronal convolucional) |
| Parametros totales | 2,6 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen, tipicamente 640 px) |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones especificas; al ser un modelo Ultralytics es compatible con exportacion a FP16, INT8 y formatos como ONNX o TensorRT, aunque no se declara en la model card) |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (.pt, archivo best.pt) |

## Arquitectura y entrenamiento

El modelo se basa en YOLO11n, la variante nano de la familia YOLO11 de Ultralytics, un detector de objetos de una etapa con arquitectura convolucional. La model card no detalla la composicion exacta del backbone ni de la cabeza de deteccion, pero al tratarse de un fine-tuning de Ultralytics/YOLO11 se hereda la arquitectura original de YOLO11n, con 2,6 M de parametros y 6,6 GFLOPs a 640 px.

El entrenamiento consiste en un ajuste fino sobre el conjunto VisDrone-DET (referenciado en Hugging Face como Voxel51/VisDrone2019-DET), un benchmark de deteccion en imagery aerea con diez clases de objetos. La model card no especifica el numero de tokens ni de imagenes de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de aumento de datos o ajuste de hiperparametros mas alla de la receta estandar de DetectionBench. Tampoco se documenta el uso de RLHF, DPO ni tecnicas de optimizacion especulativa, lo cual es esperable en un modelo de vision de este tipo. La innovacion principal, en terminos de reproducibilidad, es la integracion en DetectionBench, que aplica una receta de entrenamiento y evaluacion identica a todos los modelos comparados.

## Capacidades

- Deteccion de objetos en imagenes aereas de dron, con diez clases de VisDrone: pedestrian, people, bicycle, car, van, truck, tricycle, awning-tricycle, bus y motor.
- Inferencia en tiempo real gracias a su reducido coste computacional (2,6 M de parametros, 6,6 GFLOPs a 640 px).
- Integracion nativa con la libreria Ultralytics: carga mediante `YOLO(weights)` y prediccion con `model.predict()`.
- Exportacion a formatos de despliegue habituales en el ecosistema Ultralytics (ONNX, TensorRT, etc.), aunque no se documenta explicitamente en la model card.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues, al ser un modelo puramente de vision.
- No dispone de modo thinking, vision multimodal, audio ni generacion de texto.

## Casos de uso

- Vigilancia aerea con drones: el modelo puede procesar fotogramas de video en tiempo real para detectar peatones y vehiculos en escenas urbanas, gracias a su bajo coste computacional que permite ejecucion en hardware embebido a bordo del dron.
- Analisis de trafico urbano: deteccion y conteo de coches, furgonetas, camiones y autobuses en imagenes aereas para estudios de movilidad, aprovechando las diez clases especificas de VisDrone.
- Monitorizacion de aglomeraciones: identificacion de peatones y grupos de personas en eventos multitudinarios o espacios publicos filmados desde el aire, con umbral de confianza ajustable.
- Busqueda y rescate: deteccion de personas en entornos abiertos o zonas de desastre mediante imagenes de dron, donde la clase people y pedestrian resulta critica.
- Agricultura de precision y inspeccion de infraestructuras: uso del detector como base para localizar vehiculos o personas en parcelas e instalaciones filmadas desde el aire, aunque el modelo esta entrenado especificamente con clases de VisDrone.
- Prototipado y benchmarking de detectores: servir como referencia ligera dentro de DetectionBench para comparar recetas de entrenamiento y metricas frente a otros detectores (YOLO26, YOLOv10, RF-DETR) bajo condiciones identicas.
- Sistemas de alerta en tiempo real en el borde (edge computing): despliegue en dispositivos con recursos limitados (Jetson, Raspberry Pi con acelerador) gracias a los 2,6 M de parametros y la posibilidad de exportar a formatos optimizados.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de VisDrone-DET, evaluados con el pipeline estandar de DetectionBench (`detectionbench-evaluate`). No verificados de forma independiente.

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 39,52 |
| mAP@50-95 | 23,0 |
| Precision | 51,49 |
| Recall | 41,02 |
| F1 Score | 45,66 |

Comparativa dentro del model zoo de VisDrone-DET de DetectionBench (mismos datos y receta):

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| YOLO26m | 49,11 | 29,24 | 60,21 | 49,76 |
| YOLO11m | 48,03 | 28,56 | 59,34 | 48,3 |
| YOLOv9m | 47,62 | 28,52 | 59,26 | 48,4 |
| YOLOv10m | 46,73 | 27,72 | 59,23 | 47,35 |
| YOLOv8m | 45,47 | 26,94 | 57,86 | 46,39 |
| YOLOv9s | 45,38 | 26,95 | 56,95 | 46,19 |
| YOLO26s | 44,87 | 26,43 | 56,44 | 45,41 |
| YOLOv10s | 44,51 | 26,28 | 55,97 | 45,61 |
| YOLO11s | 43,64 | 25,88 | 54,48 | 45,01 |
| YOLOv8s | 43,47 | 25,77 | 56,09 | 44,51 |
| YOLOv9t | 40,67 | 23,73 | 52,84 | 41,78 |
| YOLO26n | 39,9 | 22,95 | 51,14 | 42,08 |
| YOLOv10n | 39,8 | 23,08 | 51,22 | 41,5 |
| YOLOv8n | 39,69 | 23,03 | 52,02 | 41,36 |
| RF-DETR Medium | 39,62 | 21,99 | 70,62 | 46,76 |
| YOLO11n (este modelo) | 39,52 | 23,0 | 51,49 | 41,02 |
| RF-DETR Small | 39,13 | 21,68 | 64,38 | 49,47 |
| RF-DETR Nano | 37,92 | 20,88 | 69,02 | 46,21 |

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 2,6 M de parametros, el modelo en FP32 ocupa del orden de decenas de MB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU para inferencia por lotes pequenos. Para tiempo real se recomienda cualquier GPU consumer (RTX 3060, RTX 4090) o aceleradores embebidos (Jetson Nano, Orin Nano).
- Cabe en GPU consumer: si, en cualquier GPU consumer moderna e incluso en hardware embebido.
- Opciones de despliegue: libreria Ultralytics (PyTorch), exportacion a ONNX, TensorRT, OpenVINO; tambien puede ejecutarse via `huggingface_hub` + `ultralytics`. No se documenta soporte nativo en vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dado el bajo coste (6,6 GFLOPs a 640 px), se espera inferencia en tiempo real en GPU consumer, pero no se aportan cifras concretas.

## Comparativa con modelos similares

Comparativa con alternativas de la misma categoria (detectores ligeros evaluados en VisDrone-DET bajo la misma receta de DetectionBench):

| Modelo | Parametros | mAP@50 | mAP@50-95 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| visdrone-yolo11n (este modelo) | 2,6 M | 39,52 | 23,0 | AGPL-3.0 | Hugging Face |
| YOLO26n | no disponible | 39,9 | 22,95 | no disponible en la informacion | model zoo de DetectionBench |
| YOLOv10n | no disponible | 39,8 | 23,08 | no disponible en la informacion | model zoo de DetectionBench |
| YOLOv8n | no disponible | 39,69 | 23,03 | no disponible en la informacion | model zoo de DetectionBench |
| RF-DETR Nano | no disponible | 37,92 | 20,88 | no disponible en la informacion | model zoo de DetectionBench |

En la gama nano, el rendimiento de mAP@50 es muy similar entre YOLO11n, YOLO26n, YOLOv10n y YOLOv8n (en torno al 39,5-39,9 %), con diferencias de decimas. RF-DETR Nano queda ligeramente por debajo en mAP, aunque con mayor precision (69,02 % frente a 51,49 %) y mayor recall (46,21 % frente a 41,02 %). Para precisiones superiores hay que subir a la gama small o medium (YOLO11s: 43,64 % mAP@50; YOLO11m: 48,03 %).

## Limitaciones y advertencias

- Modelo de vision sin capacidades de lenguaje, razonamiento ni generacion de texto; no debe evaluarse con criterios de LLM.
- Entrenado exclusivamente sobre VisDrone-DET; su dominio es la imagery aerea de dron con diez clases concretas. El rendimiento fuera de ese dominio (imagenes terrestres, otras clases de objetos) no esta garantizado.
- El tamano nano limita la deteccion de objetos pequenos y densamente agrupados, frecuentes en escenas aereas; el mAP@50-95 de 23,0 % refleja esta dificultad en localizacion precisa.
- Los resultados de benchmarks son declarados por el autor y no estan verificados de forma independiente (`verified: false` en el model-index).
- La model card no documenta sesgos conocidos, riesgo de alucinacion (no aplica en el sentido de LLM, pero si falsos positivos y negativos en deteccion) ni limitaciones de contexto o idioma.
- Licencia AGPL-3.0: implica obligaciones de copyleft fuerte para uso en red; conviene revisar las implicaciones antes de un despliegue comercial propietario.
- El repositorio figura con 0 descargas y 0 likes, y un tamano de 0.0 GB, lo que sugiere que los pesos podrian no estar efectivamente subidos o que el modelo es muy reciente; conviene verificar la disponibilidad del archivo `best.pt` antes de integrarlo.
- No se documentan cuantizaciones ni formatos de exportacion especificos; el soporte depende del ecosistema Ultralytics.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hajimi333/visdrone-yolo11n
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Dataset VisDrone2019-DET en Hugging Face: https://huggingface.co/datasets/Voxel51/VisDrone2019-DET
- Paper de VisDrone (arXiv:1804.07437): https://arxiv.org/abs/1804.07437
- Paper de YOLO11 / Ultralytics (arXiv:2410.17725): https://arxiv.org/abs/2410.17725
- Modelo base Ultralytics YOLO11: https://huggingface.co/Ultralytics/YOLO11
