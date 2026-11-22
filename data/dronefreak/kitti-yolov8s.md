# dronefreak/kitti-yolov8s

## Resumen

dronefreak/kitti-yolov8s es un detector de objetos YOLOv8s afinado sobre el conjunto de datos KITTI, orientado a escenas de conduccion autonoma y sistemas de asistencia al conductor (ADAS). Lo desarrolla el autor independiente dronefreak como parte de DetectionBench, un marco que busca reproducir la evaluacion de detectores modernos con recetas de entrenamiento y metricas identicas entre distintos datasets del mundo real. El modelo parte de los pesos preentrenados de Ultralytics/YOLOv8 y se especializa en las ocho clases de KITTI (coche, ciclista, misc, peaton, persona sentada, tranvia, camion y furgoneta).

Tecnicamente es una red convolucional de deteccion en una sola etapa con 11.158.728 parametros y 28,6 GFLOPs a 640 px, lo que la situa en el segmento "small" de la familia YOLOv8. El checkpoint se distribuye en formato PyTorch (best.pt) y safetensors, con un repositorio de apenas 0,1 GB, lo que facilita su despliegue en entornos con recursos limitados.

Su relevancia actual es doble: por un lado ofrece un punto de referencia reproducible para comparar detectores sobre KITTI con metricas homogeneas; por otro, sus resultados (mAP@50 de 41,99 %) permiten situarlo con precision frente a alternativas como YOLO11s, YOLO26 o YOLOv9, todas ellas evaluadas con la misma tuberia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8s (CNN de deteccion en una etapa, familia Ultralytics YOLO) |
| Parametros totales | 11.158.728 (11,2 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no disponible (modelo de vision; las etiquetas de clase estan en ingles) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (best.pt) y safetensors |

## Arquitectura y entrenamiento

El modelo es un YOLOv8s, es decir, una red neuronal convolucional de deteccion en una sola etapa con cabeza desacoplada (anchor-free) y asignacion dinamica de etiquetas, tal como la implementa el framework Ultralytics. La variante "s" emplea 11,2 M de parametros y consume 28,6 GFLOPs por imagen a 640 px, un punto intermedio entre las variantes nano y medium de la familia. El checkpoint se obtiene por ajuste fino (fine-tuning) de los pesos oficiales de Ultralytics/YOLOv8 sobre el dataset KITTI, no por entrenamiento desde cero.

No se especifica en la informacion disponible el numero de tokens ni de imagenes empleadas, la composicion exacta del split de entrenamiento, ni si se aplicaron tecnicas de aumento de datos mas alla de las habituales del framework. Tampoco se documentan fases de RLHF/DPO, logicas en un modelo de vision, ni innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. La evaluacion se realiza con la tuberia estandar de DetectionBench (`detectionbench-evaluate`) sobre el split de validacion de KITTI.

## Capacidades

- Deteccion de objetos en imagenes de escenas de calle con ocho clases KITTI: Car, Cyclist, Misc, Pedestrian, Person_sitting, Tram, Truck y Van.
- Localizacion con cajas delimitadoras y puntuaciones de confianza por clase.
- Inferencia sobre imagenes individuales, directorios, video y streams en tiempo real mediante la API de Ultralytics.
- Exportacion a multiples backends de despliegue (ONNX, TensorRT, OpenVINO, CoreML, entre otros) gracias al soporte del framework Ultralytics.
- Ajuste fino adicional sobre datasets propios de conduccion, al ser un checkpoint compatible con el flujo de entrenamiento de YOLO.
- Integracion con pipelines de vision por computador en Python mediante `ultralytics.YOLO`.
- Capacidades multilingues: no aplica, es un modelo de vision.
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible, fuera del alcance del modelo.

## Casos de uso

- Deteccion de vehiculos y peatones en sistemas ADAS: el modelo identifica coches, furgonetas, camiones y peatones en imagenes de calle, lo que permite alimentar modulos de alerta de colision o de frenada de emergencia en prototipos de asistencia a la conduccion.
- Analisis de trafico urbano: procesar secuencias de video de camaras fijas para contar vehiculos por clase (Car, Van, Truck, Tram) y estimar ocupacion de carriles en estudios de movilidad.
- Etiquetado asistido de datasets de conduccion: usar el modelo como preanotador para generar cajas candidatas sobre nuevas imagenes KITTI-like y reducir el coste de anotacion manual, revisando despues las detecciones de baja confianza.
- Vehiculos autonomos a escala de laboratorio: integrado en un stack ROS o similar, el checkpoint sirve como modulo de percepcion para robots moviles o coches a escala que operan en entornos controlados.
- Monitorizacion de flotas y videovigilancia de aparcamientos: deteccion de presencia de vehiculos y personas en imagenes de camaras de seguridad con requisitos de latencia moderados.
- Benchmarking reproducible de detectores: al formar parte del KITTI Model Zoo de DetectionBench, el checkpoint se usa como linea base para comparar nuevas arquitecturas con la misma receta de evaluacion.
- Prototipado rapido en CPU o GPU de gama baja: con 11,2 M de parametros y 0,1 GB de pesos, permite validar ideas de deteccion en hardware modesto antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de validacion de KITTI, sin verificacion independiente (verified: false):

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 41,99 |
| mAP@50-95 | 25,20 |
| Precision | 49,02 |
| Recall | 43,66 |
| F1 Score | 46,19 |

Rendimiento por clase sobre KITTI val:

| Clase | mAP@50 (%) | mAP@50-95 (%) |
|---|---|---|
| Car | 91,12 | 67,99 |
| Pedestrian | 62,43 | 27,11 |
| Cyclist | 54,75 | 32,35 |
| Van | 42,49 | 27,18 |
| Tram | 32,10 | 19,50 |
| Truck | 28,90 | 17,69 |
| Person_sitting | 14,18 | 5,28 |
| Misc | 9,95 | 4,48 |

Comparativa dentro del KITTI Model Zoo de DetectionBench (misma tuberia de evaluacion):

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| YOLO26x | 43,73 | 25,96 | 64,17 | 41,28 |
| YOLO26n | 42,54 | 25,43 | 48,62 | 42,84 |
| YOLO11s | 42,00 | 25,10 | 47,27 | 43,71 |
| YOLOv8s (este modelo) | 41,99 | 25,20 | 49,02 | 43,66 |
| YOLO26m | 41,91 | 25,78 | 63,34 | 39,71 |
| YOLO26s | 41,79 | 26,54 | 59,64 | 42,42 |
| YOLOv9t | 41,60 | 25,73 | 48,30 | 44,20 |
| YOLOv9s | 40,84 | 25,92 | 54,27 | 41,51 |
| YOLOv8m | 40,48 | 25,37 | 50,81 | 39,86 |
| YOLOv8n | 40,11 | 24,75 | 46,05 | 41,85 |
| YOLO11x | 39,18 | 23,60 | 46,28 | 41,69 |
| YOLO11n | 38,77 | 23,97 | 52,84 | 40,19 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 11,2 M de parametros, el peso de los pesos en FP32 ronda los 45 MB y en FP16 unos 22 MB, por lo que el consumo dominante sera el de las activaciones y el batch.
- GPU recomendadas: cualquier GPU moderna con al menos 4-8 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 y H100 funcionan sin problema.
- Cabe en GPU de consumo: si, practicamente cualquier GPU de consumo de los ultimos anos, e incluso en CPU con latencias mayores.
- Opciones de despliegue: Ultralytics (PyTorch), exportacion a ONNX, TensorRT, OpenVINO y CoreML; tambien es posible servir el modelo via TorchServe o integraciones propias del framework.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; los 28,6 GFLOPs a 640 px dan una referencia del coste computacional por imagen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | mAP@50 (KITTI) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dronefreak/kitti-yolov8s | 11,2 M | no aplica | 41,99 | AGPL-3.0 | Hugging Face |
| YOLO11s (DetectionBench) | no disponible | no aplica | 42,00 | AGPL-3.0 (Ultralytics) | Hugging Face / Ultralytics |
| YOLOv9s (DetectionBench) | no disponible | no aplica | 40,84 | GPL-3.0 (Ultralytics) | Hugging Face / Ultralytics |
| YOLO26s (DetectionBench) | no disponible | no aplica | 41,79 | no disponible | Hugging Face / Ultralytics |

En terminos de mAP@50, el modelo queda practicamente empatado con YOLO11s (42,00 frente a 41,99) y por delante de YOLOv9s y YOLO26s en esa metrica, aunque YOLO26s supera ligeramente su mAP@50-95 (26,54 frente a 25,20). La ventaja principal de este checkpoint es su trazabilidad dentro de DetectionBench y su tamano reducido.

## Limitaciones y advertencias

- El rendimiento es muy desigual por clase: Car alcanza 91,12 de mAP@50, mientras que Misc (9,95) y Person_sitting (14,18) son practicamente inutilizables en produccion.
- Riesgo de falsos negativos y positivos en clases minoritarias (Tram, Truck, Person_sitting), agravado por el desbalanceo tipico de KITTI.
- Entrenado exclusivamente sobre KITTI: puede degradarse en dominios distintos (camaras aereas, interiores, condiciones meteorologicas extremas no representadas).
- No se documentan sesgos especificos ni evaluaciones de robustez fuera del split de validacion de KITTI.
- Las metricas declaradas no estan verificadas de forma independiente (verified: false en el model-index).
- Licencia AGPL-3.0: el uso comercial en servicios en red exige liberar el codigo fuente derivado; conviene revisar las implicaciones antes de integrarlo en productos propietarios.
- No se especifican tecnicas de cuantizacion ni pesos en formatos distintos de PyTorch y safetensors, lo que puede limitar el despliegue en algunos backends sin exportacion previa.
- Alucinacion en sentido estricto no aplica, pero si existe el riesgo de detecciones espurias con baja confianza en escenas complejas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/kitti-yolov8s
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Dataset KITTI en Hugging Face: https://huggingface.co/datasets/dronefreak/KITTI
- Modelo base Ultralytics YOLOv8: https://huggingface.co/Ultralytics/YOLOv8
- Documentacion de Ultralytics: https://docs.ultralytics.com
- Demo banner (video): https://huggingface.co/dronefreak/kitti-yolov8s/resolve/main/assets/demo_banner.mp4
- Demo banner (poster): https://huggingface.co/dronefreak/kitti-yolov8s/resolve/main/assets/demo_banner_poster.jpg
