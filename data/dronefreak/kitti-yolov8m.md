# dronefreak/kitti-yolov8m

## Resumen

kitti-yolov8m es un detector de objetos YOLOv8m ajustado (fine-tuning) sobre el conjunto de datos KITTI, desarrollado por el usuario dronefreak dentro del proyecto DetectionBench. DetectionBench es un marco de trabajo cuyo objetivo es comparar detectores modernos de forma reproducible, aplicando recetas de entrenamiento y metricas de evaluacion identicas sobre varios datasets del mundo real. Este checkpoint concreto cubre la categoria de conduccion autonoma y sistemas avanzados de asistencia al conductor (ADAS).

El modelo parte de Ultralytics/YOLOv8m, una red convolucional de una sola etapa con 25,9 millones de parametros y 78,9 GFLOPs a 640 px, y la especializa para detectar ocho clases de escenas de calle: coche, ciclista, misc, peaton, persona sentada, tranvia, camion y furgoneta. Su relevancia actual reside en que forma parte de un zoologico de modelos (KITTI Model Zoo) evaluados bajo un protocolo comun, lo que permite comparar arquitecturas YOLO de distintas generaciones con criterios homogeneos y sin sesgos de receta.

El checkpoint se publica con licencia AGPL-3.0, pensado para investigacion en percepcion visual y como linea base reproducible frente a otros detectores. No es un modelo de lenguaje: no procesa texto ni mantiene contexto conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8m (detector convolucional de una etapa, anchor-free, con cabeza desacoplada) |
| Parametros totales | 25,9 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no aplica (modelo de deteccion de objetos; no procesa lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch segun la libreria ultralytics; el repositorio incluye ademas curvas PR/F1 y matrices de confusion en PNG. No se documenta un formato alternativo explicito |

Datos adicionales declarados por el autor: FLOPs 78,9 B a 640 px, tamano del repositorio 0,1 GB, tarea object-detection, fecha de creacion 24 de septiembre de 2026.

## Arquitectura y entrenamiento

La arquitectura corresponde a YOLOv8m de Ultralytics, un detector convolucional de una sola etapa que sustituye el esquema basado en anclas por una prediccion anchor-free con cabeza desacoplada (ramas separadas para clasificacion y regresion de caja). El modelo base tiene 25,9 M de parametros y consume 78,9 GFLOPs por imagen a 640 px. El ajuste se realiza sobre KITTI, por lo que la salida queda restringida a las ocho clases del dataset y a la distribucion visual de escenas de trafico captadas desde vehiculo.

El entrenamiento se enmarca en DetectionBench, cuyo proposito es aplicar recetas identicas (misma configuracion de aumento de datos, hiperparametros y pipeline de evaluacion, `detectionbench-evaluate`) a multiples detectores y datasets para que las comparaciones sean justas. La informacion disponible no detalla el numero de imagenes de entrenamiento, la composicion exacta del split ni si se aplicaron tecnicas adicionales de refinamiento; tampoco se mencionan etapas de RLHF o DPO, que no aplican a un detector de objetos. La innovacion principal es metodologica: la estandarizacion del protocolo de evaluacion.

## Capacidades

- Deteccion de objetos en imagenes de escenas de calle, con salida de cajas delimitadoras y clase para cada instancia.
- Ocho clases soportadas: Car, Cyclist, Misc, Pedestrian, Person_sitting, Tram, Truck y Van.
- Inferencia de una sola etapa, apta para procesamiento en tiempo casi real sobre hardware de consumo cuando se exporta a formatos optimizados.
- Procesamiento de fotogramas individuales de video (deteccion por frame), utilizable en pipelines de analitica de video.
- Integracion con el ecosistema Ultralytics (API de Python y CLI) para entrenamiento, validacion y exportacion.
- Capacidades no soportadas: no tiene tool calling, no soporta function calling, no implementa agentes ni razonamiento multi-paso, no procesa lenguaje natural, no genera texto, no realiza reconocimiento de voz ni tareas multimodales mas alla de la vision.

## Casos de uso

- Percepcion para ADAS: el modelo puede integrarse en un modulo de asistencia a la conduccion que detecte coches, peatones y ciclistas por fotograma, aprovechando que las clases mas frecuentes en KITTI (Car con 90,65 mAP@50) son precisamente las criticas para la seguridad.
- Linea base reproducible en investigacion: sirve como referencia fija dentro de DetectionBench para comparar nuevas arquitecturas YOLO bajo la misma receta de entrenamiento y el mismo pipeline de evaluacion.
- Analitica de trafico urbano: procesando video de camaras fijas o de dashcam para contar vehiculos por categoria (coche, camion, furgoneta, tranvia) y estimar ocupacion de carril.
- Preetiquetado de datasets de conduccion: usar el detector para generar cajas candidatas sobre imagenes nuevas y reducir el trabajo de anotacion manual antes de la revision humana.
- Robotica movil y vehiculos de laboratorio: percepcion basica de obstaculos en prototipos de bajo coste, dado que el modelo cabe en una GPU de consumo.
- Monitorizacion de seguridad viaria: deteccion de peatones y personas sentadas en entornos de calle para estudios de comportamiento o alertas automaticas.
- Transferencia a dominios similares: punto de partida para fine-tuning sobre otros datasets de escenas de calle (por ejemplo, variantes aereas del mismo autor como visdrone), reutilizando los pesos aprendidos en KITTI.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados, split de validacion de KITTI):

| Metrica | Valor |
|---|---|
| mAP@50 | 40,48 % |
| mAP@50-95 | 25,37 % |
| Precision | 50,81 % |
| Recall | 39,86 % |
| F1 Score | 44,67 % |
| Parametros | 25,9 M |
| FLOPs | 78,9 B a 640 px |

Rendimiento por clase (mAP@50 / mAP@50-95):

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| Car | 90,65 | 68,25 |
| Cyclist | 54,92 | 32,30 |
| Misc | 9,34 | 5,13 |
| Pedestrian | 64,68 | 30,68 |
| Person_sitting | 5,38 | 1,62 |
| Tram | 25,97 | 14,78 |
| Truck | 32,15 | 22,48 |
| Van | 40,72 | 27,71 |

Comparativa dentro del KITTI Model Zoo de DetectionBench (mismos datos y protocolo):

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| YOLO26n | 42,54 | 25,43 | 48,62 | 42,84 |
| YOLO11s | 42,00 | 25,10 | 47,27 | 43,71 |
| YOLOv8s | 41,99 | 25,20 | 49,02 | 43,66 |
| YOLO26m | 41,91 | 25,78 | 63,34 | 39,71 |
| YOLO26s | 41,79 | 26,54 | 59,64 | 42,42 |
| YOLOv9t | 41,60 | 25,73 | 48,30 | 44,20 |
| YOLOv9s | 40,84 | 25,92 | 54,27 | 41,51 |
| YOLOv8m (este modelo) | 40,48 | 25,37 | 50,81 | 39,86 |
| YOLOv8n | 40,11 | 24,75 | 46,05 | 41,85 |
| YOLO11x | 39,18 | 23,60 | 46,28 | 41,69 |
| YOLO11n | 38,77 | 23,97 | 52,84 | 40,19 |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP32 ocupan aproximadamente 104 MB (25,9 M de parametros) y en FP16 unos 52 MB. Sumando activaciones a 640 px, la inferencia cabe holgadamente por debajo de 1-2 GB de VRAM en la mayoria de configuraciones (estimacion a partir del numero de parametros; no publicada por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de memoria. Para maxima latencia, una NVIDIA RTX 3060/4060 o superior es suficiente; para lotes grandes en servidor, A100 o H100 no aportan ventaja significativa porque el modelo es pequeno y el cuello de botella suele ser el preprocesado.
- GPU de consumo: si, cabe sin problema en GTX 1060 6 GB, RTX 2060, RTX 3060, RTX 4090 y similares, e incluso en placas integradas con soporte de aceleracion.
- Opciones de despliegue: API de Python y CLI de Ultralytics; exportacion a ONNX, TensorRT, OpenVINO, TFLite, TorchScript y CoreML (formatos soportados por el ecosistema Ultralytics). Tambien puede servirse mediante ONNX Runtime en entornos de produccion.
- Latencia y throughput: no disponibles en la informacion proporcionada. No se publican mediciones de FPS ni de latencia por imagen.

## Comparativa con modelos similares

Comparacion con alternativas del mismo KITTI Model Zoo (misma receta y protocolo de evaluacion, split de validacion de KITTI):

| Modelo | Parametros | mAP@50 | mAP@50-95 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kitti-yolov8m (este) | 25,9 M | 40,48 | 25,37 | AGPL-3.0 | HuggingFace, dronefreak |
| kitti-yolov8s | no disponible | 41,99 | 25,20 | AGPL-3.0 | HuggingFace, dronefreak |
| kitti-yolov8n | no disponible | 40,11 | 24,75 | AGPL-3.0 | HuggingFace, dronefreak |
| kitti-yolo11s | no disponible | 42,00 | 25,10 | AGPL-3.0 | HuggingFace, dronefreak |
| YOLOv8m original (Ultralytics) | 25,9 M | no disponible | no disponible | AGPL-3.0 | Ultralytics |

En terminos de mAP@50, este checkpoint queda por debajo de YOLOv8s (41,99), YOLO11s (42,00) y YOLO26n (42,54), pese a tener mas parametros que YOLOv8s y YOLO26n. Los datos de parametros de los modelos comparados no se detallan en la informacion disponible.

## Limitaciones y advertencias

- Clases con rendimiento muy bajo: Misc (mAP@50 de 9,34) y Person_sitting (5,38) son practicamente inutilizables en produccion; Tram (25,97) y Truck (32,15) tambien presentan precision limitada.
- Especializacion de dominio: el modelo esta ajustado a KITTI, con escenas de trafico alemanas captadas desde vehiculo y condiciones de iluminacion concretas. El rendimiento puede degradarse en otros paises, climas, camaras o altitudes (por ejemplo, vision aerea).
- Metricas no verificadas: los resultados del model-index figuran con `verified: false`, es decir, son declaraciones del autor y no han sido validadas de forma independiente.
- Falsos positivos y negativos: precision del 50,81 % y recall del 39,86 % implican una tasa notable de errores; no debe usarse como unico sistema de decision en seguridad critica.
- Licencia AGPL-3.0: es una licencia copyleft fuerte. El uso comercial es posible, pero obliga a liberar el codigo derivado y, en el caso de ofrecer el modelo como servicio en red, a publicar el codigo fuente correspondiente. Conviene revisar las implicaciones legales antes de integrarlo en un producto propietario.
- Ausencia de informacion sobre cuantizacion y formatos optimizados: no se documentan pesos en GGUF, ONNX precompilados ni TensorRT listos para usar, por lo que la optimizacion queda a cargo del integrador.
- Sin soporte de lenguaje ni de agentes: cualquier caso de uso que requiera texto, tool calling o razonamiento multi-paso queda fuera del alcance de este modelo.
- Modelo de vision unicamente: no procesa audio, no genera contenido y no incorpora modo de razonamiento ni "thinking mode".

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/kitti-yolov8m
- Dataset KITTI (dronefreak): https://huggingface.co/datasets/dronefreak/KITTI
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Checkpoint hermano kitti-yolov8n: https://huggingface.co/dronefreak/kitti-yolov8n
- Checkpoint hermano visdrone-yolov8m: https://huggingface.co/dronefreak/visdrone-yolov8m
- Toolkit de VisDrone (mismo autor): https://github.com/dronefreak/VisDrone-dataset-python-toolkit
- YOLOv8 de Ultralytics: https://platform.ultralytics.com/ultralytics/yolov8
- Paper referenciado (arXiv:2410.17725): https://arxiv.org/abs/2410.17725
- Paper referenciado (arXiv:2606.03748): https://arxiv.org/abs/2606.03748
- Paper referenciado (arXiv:2402.13616): https://arxiv.org/abs/2402.13616
