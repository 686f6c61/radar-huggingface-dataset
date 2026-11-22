# dronefreak/bdd100k-yolo26m

## Resumen

YOLO26m finetuneado sobre BDD100K es un detector de objetos de la familia YOLO26 de Ultralytics, ajustado por el autor independiente dronefreak sobre el conjunto de datos de conduccion autonoma BDD100K. El modelo resuelve la tarea de deteccion de objetos en escenas de trafico urbano, con clases como coche, camion, autobus, persona, motorista, bicicleta, semaforo y senal de trafico. Forma parte del proyecto DetectionBench, un marco que busca reproducir recetas de entrenamiento y evaluacion identicas para comparar detectores modernos de forma justa sobre multiples datasets reales.

El checkpoint tiene 21,84 millones de parametros y 75,4 GFLOPs a 640 pixeles, lo que lo situa en la gama media de detectores en tiempo real. Se distribuye en formato PyTorch (.pt) compatible con la libreria Ultralytics y con licencia AGPL-3.0. Su interes actual reside en que ofrece una receta reproducible y comparable con otros detectores (YOLOv8, YOLOv10, YOLO11, RF-DETR) bajo el mismo protocolo de evaluacion, algo poco habitual en el ecosistema de deteccion para conduccion autonoma.

No es un modelo de lenguaje ni un modelo multimodal generativo: es exclusivamente un detector de objetos de una sola etapa. Por tanto, las secciones de capacidades linguisticas, tool calling o agentes no aplican y se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26 (detector de objetos de una etapa, CNN, familia Ultralytics) |
| Parametros totales | 21.844.500 (21,9 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (solo se publica best.pt en precision original) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (.pt), compatible con Ultralytics; repo con safetensors como formato de almacenamiento |
| FLOPs | 75,4 B a 640 px |
| Resolucion de entrada | 640 px (por defecto en la receta de evaluacion) |
| Tamano del repo | 0,1 GB |
| Dataset de entrenamiento | dronefreak/BDD100K |
| Modelo base | Ultralytics/YOLO26 |

## Arquitectura y entrenamiento

La arquitectura es YOLO26, la generacion mas reciente de la familia YOLO de Ultralytics, un detector de una sola etapa basado en CNN con cabecera de deteccion densa. El checkpoint parte de los pesos preentrenados de Ultralytics/YOLO26 y se ajusta (finetune) sobre BDD100K. El modelo tiene 21,9 M de parametros y 75,4 GFLOPs a 640 px, lo que corresponde a la variante "m" (medium) de la familia.

El entrenamiento se realizo dentro del marco DetectionBench, que impone una receta de entrenamiento y evaluacion identica para todos los detectores comparados, con el objetivo de que las diferencias de rendimiento reflejen el modelo y no variaciones en el pipeline. No se especifican en la informacion disponible el numero de tokens (no aplica), el numero exacto de imagenes de entrenamiento, la composicion detallada del dataset ni si hubo tecnicas de aumento de datos especificas mas alla de las estandar de Ultralytics. Tampoco se documenta el uso de RLHF/DPO (no aplica a vision) ni innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Deteccion de objetos en imagenes de escenas de conduccion: coche, camion, autobus, tren, persona, motorista, motocicleta, bicicleta, semaforo y senal de trafico (las clases documentadas en la evaluacion por clase).
- Deteccion en tiempo real gracias a su tamano moderado (21,9 M de parametros, 75,4 GFLOPs a 640 px).
- Inferencia sobre imagenes individuales y, por extension de la libreria Ultralytics, sobre video y streams.
- Integracion con el ecosistema Ultralytics (API `YOLO`, `model.predict`, visualizacion con `results[0].show()`).
- Soporte de tool calling / function calling: no aplica (modelo de vision).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no aplica.
- Capacidades especiales (thinking mode, vision generativa, audio): no disponibles; el modelo es exclusivamente detector.

## Casos de uso

- Deteccion de vehiculos en video de trafico urbano: el modelo procesa fotogramas a 640 px y devuelve cajas con clase y confianza, adecuado para analitica de trafico en tiempo real por su bajo coste computacional (75,4 GFLOPs).
- Asistencia a la conduccion (ADAS) en prototipos: deteccion de coches, peatones, ciclistas y semaforos en escenas de carretera, con la salvedad de que la licencia AGPL-3.0 condiciona su uso en productos propietarios.
- Auditoria y anotacion asistida de datasets: el detector puede preanotar imagenes de BDD100K o de dominios similares para acelerar el etiquetado humano, revisando despues las detecciones de baja confianza.
- Monitorizacion de infraestructura viaria: conteo de vehiculos por clase (coche, camion, autobus) en camaras fijas, aprovechando la precision declarada de 77,04 % y el recall de 56,05 %.
- Benchmarking reproducible de detectores: sirve como referencia dentro de DetectionBench para comparar nuevas arquitecturas bajo la misma receta de entrenamiento y evaluacion.
- Investigacion en conduccion autonoma: punto de partida para experimentos de deteccion en escenas de trafico, con pesos ya ajustados a BDD100K y una evaluacion documentada por clase.
- Sistemas de alerta de presencia de peatones y ciclistas: las clases person, rider y bike tienen mAP@50 de 73,33, 54,43 y 56,29 respectivamente, utiles para prototipos de seguridad vial.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de BDD100K con el pipeline `detectionbench-evaluate` (no verificados de forma independiente):

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 61,55 |
| mAP@50-95 | 35,88 |
| Precision | 77,04 |
| Recall | 56,05 |
| F1 | 64,89 |

Comparativa del model zoo de BDD100K publicado por el autor (mismo pipeline):

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| YOLO26m (este) | 61,55 | 35,88 | 77,04 | 56,05 |
| YOLOv10m | 61,13 | 35,63 | 76,78 | 55,65 |
| YOLO11m | 61,10 | 35,57 | 66,78 | 55,61 |
| YOLOv8m | 60,89 | 35,47 | 66,52 | 55,42 |
| YOLO26s | 58,76 | 33,86 | 75,49 | 53,07 |
| RF-DETR Nano | 56,90 | 31,58 | 80,68 | 64,78 |
| YOLO26n | 52,25 | 29,23 | 72,56 | 46,87 |

Rendimiento por clase (mAP@50 / mAP@50-95):

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| person | 73,33 | 39,11 |
| rider | 54,43 | 29,24 |
| car | 84,51 | 53,05 |
| truck | 70,88 | 52,35 |
| bus | 70,14 | 54,70 |
| train | 1,57 | 0,98 |
| motor | 53,35 | 27,45 |
| bike | 56,29 | 29,72 |
| traffic light | 73,19 | 29,50 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 21,9 M de parametros en FP32 el peso de los pesos ronda los 87 MB, por lo que la huella en memoria es muy baja (tipicamente por debajo de 1 GB incluyendo buffers de activacion a 640 px).
- GPU recomendadas: cualquier GPU moderna es suficiente; para alto throughput se recomiendan A100, H100 o L4; para prototipos, RTX 4090, RTX 3090 o RTX 4060.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer con al menos 2 GB de VRAM, e incluso en CPU para inferencia no interactiva.
- Opciones de despliegue: Ultralytics (PyTorch), exportacion a ONNX, TensorRT, OpenVINO y CoreML a traves de la propia libreria Ultralytics; no se documentan integraciones especificas con vLLM, llama.cpp, Ollama o TGI (no aplican a vision).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | mAP@50 (BDD100K) | mAP@50-95 | Licencia | Formato |
|---|---|---|---|---|---|
| YOLO26m (este) | 21,9 M | 61,55 | 35,88 | AGPL-3.0 | .pt |
| YOLOv10m | no disponible | 61,13 | 35,63 | AGPL-3.0 (Ultralytics) | .pt |
| YOLO11m | no disponible | 61,10 | 35,57 | AGPL-3.0 (Ultralytics) | .pt |
| YOLOv8m | no disponible | 60,89 | 35,47 | AGPL-3.0 (Ultralytics) | .pt |
| RF-DETR Nano | no disponible | 56,90 | 31,58 | no disponible | no disponible |

Las diferencias de mAP@50 entre YOLO26m, YOLOv10m, YOLO11m y YOLOv8m son inferiores a un punto porcentual, lo que sugiere que la receta comun de DetectionBench homogeneiza en gran medida el rendimiento entre generaciones. El dato mas diferenciador es la precision de 77,04 %, superior a la de YOLO11m y YOLOv8m (66,78 y 66,52), aunque RF-DETR Nano obtiene precision y recall mas altos (80,68 y 64,78) con menor mAP@50.

## Limitaciones y advertencias

- El rendimiento en la clase train es practicamente nulo (mAP@50 de 1,57), por lo que el modelo no es fiable para detectar trenes.
- El recall global es moderado (56,05 %), lo que implica falsos negativos frecuentes; en aplicaciones de seguridad critica es necesario ajustar el umbral de confianza y validar con datos propios.
- Los resultados son declarados por el autor y marcados como no verificados en el model-index; no hay validacion independiente.
- El modelo esta entrenado especificamente sobre BDD100K (escenas de conduccion diurna y nocturna en entornos urbanos); su generalizacion a otros dominios (camaras aereas, interiores, otros paises) no esta documentada.
- Licencia AGPL-3.0: el uso en productos o servicios en red puede obligar a liberar el codigo fuente; para uso comercial propietario es necesario evaluar una licencia alternativa de Ultralytics.
- Riesgo de sesgo: BDD100K tiene una distribucion geografica y de condiciones meteorologicas concreta; el modelo puede degradarse en escenarios no representados (lluvia intensa, nieve, conduccion nocturna extrema).
- No se documentan procesos de calibracion, cuantizacion ni versiones ligeras (ONNX, TensorRT) publicadas en el repositorio.
- El repositorio tiene un tamano de 0,1 GB y solo 74 descargas, lo que indica una validacion comunitaria muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-yolo26m
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Modelo base Ultralytics YOLO26: https://huggingface.co/Ultralytics/YOLO26
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
- Paper referenciado en los tags (arXiv:2606.03748): https://arxiv.org/abs/2606.03748
- Demo banner del modelo: https://huggingface.co/dronefreak/bdd100k-yolo26m/resolve/main/assets/demo_banner.mp4
