# dronefreak/bdd100k-syscv-libra-faster-rcnn-r50-fpn-1x

## Resumen

Libra R-CNN con backbone ResNet-50 y cuello FPN, entrenado sobre BDD100K para deteccion de objetos en escenas de conduccion. No es un modelo de lenguaje ni un modelo fundacional: es un detector clasico de dos etapas (Faster R-CNN con las mejoras de Libra R-CNN) empaquetado como checkpoint de mmdetection. Lo publica el usuario dronefreak como espejo del zoo de modelos de SysCV (ETH Zurich), cuyo servidor `dl.cv.ethz.ch` esta caido; los pesos se recuperaron de la Wayback Machine (captura del 19 de febrero de 2025) y se verificaron contra los MD5 originales.

El interes practico esta en la reproducibilidad: el repositorio anade un entorno fijado (torch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2, Python 3.10) y un script `infer.py` que acepta imagenes, carpetas, video o webcam, con salida opcional en formato BDD100K. La reproduccion es exacta sobre 20 imagenes de validacion: 1068 cajas y puntuaciones identicas a las predicciones publicadas por SysCV.

El modelo tiene 41.710.594 parametros (dato real de los safetensors), un repo de 0,6 GB y detecta 10 clases de BDD100K (peatón, ciclista, coche, camion, autobus, tren, moto, bicicleta, semaforo y senal de trafico). Su relevancia es la de un baseline solido y barato para tareas de deteccion en conduccion autonoma, no la de un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Libra R-CNN (Faster R-CNN de dos etapas con IoU-balanced sampling, balanced feature pyramid y balanced L1 loss) sobre ResNet-50 + FPN |
| Parametros totales | 41.710.594 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen 1280 x 720) |
| Tipos de cuantizacion | no disponible (pesos en precision original; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (vision; las etiquetas del dataset estan en ingles) |
| Licencia | BDD100K (`license: other`, `license_name: bdd100k`): uso educativo, de investigacion y sin animo de lucro. La config de SysCV es Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`), equivalente tensor a tensor al `.pth` original; incluye `config.json` y `original_config.py` |
| Framework | mmdetection 2.28.2 / mmcv-full 1.7.2 / PyTorch 2.0.1 |
| Entrada | RGB 1280 x 720 (tamano nativo de BDD100K, sin redimensionado), normalizacion ImageNet |
| Post-proceso | umbral de score 0.05 en evaluacion, NMS con IoU 0.5, maximo 100 cajas por imagen |
| Clases | 10: pedestrian, rider, car, truck, bus, train, motorcycle, bicycle, traffic light, traffic sign |

## Arquitectura y entrenamiento

Libra R-CNN es una variante de Faster R-CNN que ataca el desequilibrio del entrenamiento en tres frentes: muestreo equilibrado por IoU (IoU-balanced sampling) en la seleccion de propuestas, piramide de caracteristicas equilibrada (balanced feature pyramid) que integra y refina los niveles del FPN, y balanced L1 loss para recalibrar la contribucion de los outliers en la regresion de cajas. El backbone es ResNet-50 inicializado con pesos ImageNet (`torchvision://resnet50`), con FPN como cuello y cabezas de clasificacion y regresion estandar de dos etapas.

El entrenamiento usa el split de train de BDD100K (70.000 imagenes) durante 12 epocas (schedule 1x), SGD con learning rate 0.04 y weight decay 0.0001, con decaimientos en las epocas 8 y 11, y batch de 32 (8 GPUs x 4 imagenes, segun el README de SysCV). La entrada es la resolucion nativa de 1280 x 720 sin reescalado. No se documenta RLHF, DPO ni tecnicas de destilacion o decodificacion especulativa; es un entrenamiento supervisado convencional de deteccion. La innovacion destacable del repositorio no es el modelo sino el empaquetado: entorno reproducible, verificacion criptografica de pesos y predicciones, y un script de inferencia que cubre imagen, video y webcam.

## Capacidades

- Deteccion de objetos en imagenes de escenas de conduccion con 10 clases de BDD100K.
- Inferencia sobre imagenes sueltas, carpetas de imagenes, ficheros de video y webcam en directo (`infer.py 0 --show`).
- Exportacion de detecciones en formato BDD100K mediante `--json out.json`.
- Control del umbral de confianza (`--score-thr`, por defecto 0.3) y del numero maximo de frames procesados en video (`--max-frames N`).
- Ejecucion en CPU y en GPU (entorno CUDA 11.8 o entorno CPU separado); el autor solo ha verificado CPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un detector puro.
- No incluye segmentacion, estimacion de profundidad ni seguimiento de instancias entre frames.

## Casos de uso

- Baseline de deteccion para investigacion en conduccion autonoma: sirve como referencia reproducible (AP 30,7 en val) contra la que medir detectores mas modernos sobre BDD100K, con la ventaja de que las predicciones coinciden exactamente con las publicadas por SysCV.
- Pre-etiquetado de nuevos datasets de trafico: ejecutar `infer.py` sobre una carpeta de imagenes y exportar el JSON en formato BDD100K para revisar y corregir anotaciones manualmente, reduciendo el coste de etiquetado.
- Analisis offline de video de dashcam: procesar un `.mov` con `--max-frames` para extraer detecciones por frame y estudiar la presencia de peatones, vehiculos y senales en tramos concretos.
- Prototipos de sistemas de alerta en vehiculo: con 1,6 s/imagen en 8 hilos de CPU, es viable para analisis diferido o para pruebas de concepto en hardware sin GPU, no para tiempo real estricto.
- Docencia y practicas de vision por computador: el entorno fijado y la verificacion de pesos facilitan reproducir un pipeline completo de mmdetection sin resolver dependencias rotas.
- Auditoria de modelos publicados: el repositorio incluye los MD5, las predicciones de validacion y las puntuaciones originales, lo que permite comprobar la integridad de un checkpoint recuperado de un servidor caido.
- Deteccion de senalizacion y semaforos en imagenes estaticas: las clases traffic light (AP 24,2) y traffic sign (AP 36,7) permiten inventariar elementos viarios en capturas, asumiendo las limitaciones de precision en objetos pequenos.

## Benchmarks y rendimiento

Resultados declarados por el autor (procedentes de los ficheros de puntuaciones de SysCV; `verified: false` en el model-index). AP estilo COCO en BDD100K:

| Split | AP | AP50 | AP75 | APs | APm | APl |
|---|---|---|---|---|---|---|
| val | 30,7 | 55,0 | 29,2 | 14,5 | 35,4 | 50,6 |
| test | 29,5 | 52,2 | 29,1 | 14,9 | 35,9 | 44,8 |

AP por clase en validacion:

| pedestrian | rider | car | truck | bus | train | motorcycle | bicycle | traffic light | traffic sign |
|---|---|---|---|---|---|---|---|---|---|
| 33,4 | 24,4 | 51,1 | 44,0 | 46,0 | 0,0 | 23,6 | 23,5 | 24,2 | 36,7 |

Observaciones: el rendimiento en objetos pequenos (APs 14,5) es bajo, coherente con un detector de 2019 sin tecnicas modernas de multi-escala; la clase train obtiene 0,0, probablemente por escasez de instancias en validacion. No se han publicado en la informacion disponible comparaciones directas con otros detectores sobre el mismo split.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Con 41,7 M de parametros y entrada 1280 x 720, un detector de dos etapas de este tamano suele requerir del orden de 2 a 4 GB en FP32; el autor no publica la cifra.
- GPU recomendadas: no especificadas. El entorno CUDA 11.8 esta preparado, pero el autor indica que el entorno CUDA "no se ha probado todavia"; la verificacion se hizo en CPU.
- CPU: 1,6 s/imagen con 8 hilos, medido por el autor. Cabe en cualquier maquina sin GPU, lo que facilita la reproduccion.
- GPU de consumo: no confirmado. Por tamano deberia caber en RTX 3060/4060/4090 y similares, pero no hay medicion publicada.
- Despliegue: mmdetection 2.28.2 con mmcv-full 1.7.2 y PyTorch 2.0.1 en Python 3.10 (entorno `uv` con `env/requirements-cu118.txt` o `env/requirements-cpu.txt`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo; la via es `infer.py` o la API de mmdetection.
- Throughput y latencia en GPU: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | AP val BDD100K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Libra R-CNN R50-FPN 1x (este) | 41,7 M | 1280 x 720 | 30,7 | BDD100K (solo investigacion) | Hugging Face, espejo verificado |
| Faster R-CNN R50-FPN 1x sobre BDD100K (SysCV) | no disponible en la informacion | 1280 x 720 | no disponible en la informacion | BDD100K | Zoo de SysCV (servidor caido) |
| Detectores modernos tipo YOLO/DETR sobre BDD100K | no disponible en la informacion | variable | no disponible en la informacion | variable | variable |

No se dispone en la informacion proporcionada de resultados numericos de alternativas sobre el mismo split, por lo que la comparacion cuantitativa queda limitada al propio modelo. Cualitativamente, frente a detectores de una etapa mas recientes, Libra R-CNN prioriza precision en objetos grandes (APl 50,6) a costa de latencia y de rendimiento en objetos pequenos.

## Limitaciones y advertencias

- Licencia BDD100K: uso educativo, de investigacion y sin animo de lucro. El uso comercial no esta permitido sin autorizacion; revisar `LICENSE.txt` antes de cualquier despliegue en produccion.
- Entrenado exclusivamente con BDD100K (escenas de conduccion, mayoritariamente entornos urbanos y de carretera); el dominio fuera de ese contexto no esta cubierto.
- APs de 14,5: los objetos pequenos (senales lejanas, peatones a distancia) se detectan mal.
- Clase train con AP 0,0 en validacion: no es fiable para esa categoria.
- Riesgo de falsos positivos y negativos con el umbral por defecto de 0,3; el umbral de evaluacion es 0,05 y conviene ajustarlo segun el caso de uso.
- No hay datos publicados sobre sesgos demograficos, geograficos o de condiciones meteorologicas; BDD100K incluye escenas nocturnas y con lluvia, pero el rendimiento por subconjunto no se documenta.
- El checkpoint es un espejo recuperado de la Wayback Machine; aunque el MD5 coincide con el original de SysCV, la cadena de custodia depende de esa verificacion.
- Entorno CUDA no probado por el autor: la inferencia en GPU puede requerir ajustes de versiones.
- Sin soporte de video en tiempo real: 1,6 s/imagen en CPU descarta aplicaciones de baja latencia sin GPU.
- Conflicto potencial de licencias: los pesos heredan BDD100K, pero la config de SysCV es Apache-2.0; no se debe asumir Apache-2.0 para los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-libra-faster-rcnn-r50-fpn-1x
- Licencia BDD100K: https://huggingface.co/dronefreak/bdd100k-syscv-libra-faster-rcnn-r50-fpn-1x/blob/main/LICENSE.txt
- Dataset referenciado: https://huggingface.co/datasets/dronefreak/BDD100K
- Zoo de modelos de SysCV (ETH Zurich): https://github.com/SysCV/bdd100k-models/tree/main/det
- Config original de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/det/configs/det/libra_faster_rcnn_r50_fpn_1x_det_bdd100k.py
- Paper de Libra R-CNN (CVPR 2019): https://arxiv.org/abs/1904.02701
- Paper de BDD100K (CVPR 2020): https://arxiv.org/abs/1904.02701 (referencia cruzada en la model card; la cita bibtex de BDD100K figura en el README)
