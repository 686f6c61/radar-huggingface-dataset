# dronefreak/bdd100k-syscv-faster-rcnn-swin-s-fpn-3x

## Resumen

El modelo `dronefreak/bdd100k-syscv-faster-rcnn-swin-s-fpn-3x` es un detector de objetos Faster R-CNN con backbone Swin Transformer Small y cuello FPN, entrenado sobre el conjunto de datos BDD100K para deteccion de objetos en escenas de conduccion. No es un modelo de lenguaje: es un checkpoint de vision por computador en formato MMDetection, publicado como espejo (mirror) de un modelo del zoo oficial de SysCV (ETH Zurich) cuyo servidor de descarga original (`dl.cv.ethz.ch`) esta fuera de linea. Los pesos se recuperaron desde la Wayback Machine (captura del 19 de febrero de 2025) y se han reempaquetado con un entorno fijado y un script de inferencia.

El modelo resuelve la tarea de deteccion de objetos en imagenes de trafico (10 clases: peatón, ciclista, coche, camion, autobus, tren, motocicleta, bicicleta, semaforo y senal de trafico) con entrada nativa de 1280 x 720, la resolucion original de BDD100K. Cuenta con 66.168.100 parametros y un tamano de repositorio de 1,2 GB. Su relevancia actual es practica: recupera un checkpoint de referencia que ya no estaba accesible desde la fuente original y lo hace reproducible, con verificacion exacta de pesos (MD5) y de predicciones frente a las publicadas por SysCV.

La ficha describe un modelo de investigacion con licencia restrictiva (BDD100K, solo uso educativo, de investigacion y sin animo de lucro), pensado para evaluacion comparativa y experimentacion en deteccion de objetos aplicada a conduccion autonoma, no para despliegue comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Faster R-CNN con backbone Swin Transformer Small (Swin-S) y FPN |
| Parametros totales | 66.168.100 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen 1280 x 720) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | BDD100K (`license: other`, `license_name: bdd100k`): uso educativo, de investigacion y sin animo de lucro |
| Formato de pesos | safetensors (`model.safetensors`), equivalente al `.pth` original; configuracion MMDetection |
| Libreria | mmdetection (mmdet 2.28.2, mmcv-full 1.7.2, torch 2.0.1, Python 3.10) |
| Tarea | object-detection |
| Entrada | 1280 x 720 RGB, media y desviacion estandar de ImageNet, sin redimensionado |
| Dataset de entrenamiento | BDD100K train (70k imagenes) |
| Clases | pedestrian, rider, car, truck, bus, train, motorcycle, bicycle, traffic light, traffic sign |

## Arquitectura y entrenamiento

El modelo sigue el esquema Faster R-CNN de dos etapas con backbone Swin Transformer Small, basado en el paper "Swin Transformer: Hierarchical Vision Transformer using Shifted Windows" (ICCV 2021, arXiv:2103.14030). El backbone produce mapas de caracteristicas jerarquicos mediante atencion por ventanas desplazadas, y el cuello FPN los combina en una piramide multiescala para la cabeza de deteccion. La inicializacion del backbone parte de pesos ImageNet (`swin_small_patch4_window7_224.pth`).

El entrenamiento se realizo sobre las 70k imagenes de entrenamiento de BDD100K durante 36 epocas (esquema 3x), con AdamW, learning rate 0.0001, weight decay 0.05, decaimiento del learning rate en las epocas 27 y 33, batch de 32 (8 GPU x 2 imagenes) y entrenamiento multiescala con 6 escalas entre (1280, 600) y (1280, 720). En test se aplica un umbral de score de 0.05, NMS con IoU 0.5 y un maximo de 100 cajas por imagen. La configuracion proviene de SysCV (`faster_rcnn_swin-s_fpn_3x_det_bdd100k.py`, Apache-2.0) y se ha fusionado en `original_config.py`. No se menciona uso de RLHF/DPO ni de tecnicas de decodificacion especulativa, al no tratarse de un modelo generativo.

## Capacidades

- Deteccion de objetos en imagenes de escenas de conduccion con 10 clases de BDD100K.
- Deteccion multiescala mediante FPN, con rendimiento declarado distinto para objetos pequenos (APs 16.2), medianos (APm 39.0) y grandes (APl 56.1) en validacion.
- Inferencia sobre imagen individual, carpeta de imagenes, fichero de video o webcam (via `infer.py`).
- Exportacion de detecciones en formato BDD100K (`--json out.json`).
- Umbral de score configurable (`--score-thr`, por defecto 0.3) y limite de frames (`--max-frames`).
- Ejecucion en CPU (2,4 s/imagen con 8 hilos) y en GPU (entorno CUDA 11.8 disponible, aunque no probado segun la model card).
- No soporta tool calling, agentes, razonamiento multi-paso, capacidades multilingues ni modalidades de audio o texto: es exclusivamente un detector de objetos.

## Casos de uso

- Evaluacion comparativa de detectores en BDD100K: sirve como referencia reproducible (mismos pesos y predicciones que SysCV) para comparar nuevos detectores contra un baseline Swin-S con AP 34.2 en validacion.
- Reproduccion de resultados academicos: el repositorio incluye las predicciones y scores originales de SysCV en `original/`, lo que permite verificar experimentos sin depender del servidor caido de ETH Zurich.
- Prototipado de percepcion para conduccion autonoma: deteccion de coches, peatones, ciclistas y senalizacion en imagenes de 1280 x 720, adecuada para pipelines de investigacion en percepcion.
- Analisis de video de trafico: el script acepta ficheros de video y permite procesar clips con `--max-frames`, util para anotacion asistida o analisis off-line de escenas diurnas y nocturnas (la demo incluida cubre ambos casos).
- Generacion de pseudo-etiquetas: las detecciones exportadas en formato BDD100K pueden usarse para preanotar nuevos datos y reducir el coste de etiquetado manual en proyectos de investigacion.
- Docencia y formacion en vision por computador: el entorno fijado (torch 2.0.1, mmcv-full 1.7.2, mmdet 2.28.2) y el script de inferencia simplifican la puesta en marcha en aulas y laboratorios.
- Verificacion de integridad de checkpoints: el MD5 publicado permite auditar la cadena de custodia de pesos recuperados de archivos, un caso practico de preservacion de artefactos de investigacion.

## Benchmarks y rendimiento

Resultados declarados por el autor a partir de los ficheros de score de SysCV (box AP estilo COCO, en porcentaje, sobre BDD100K):

| Split | AP | AP50 | AP75 | APs | APm | APl |
|---|---|---|---|---|---|---|
| val | 34.2 | 60.7 | 32.8 | 16.2 | 39.0 | 56.1 |
| test | 33.2 | 58.0 | 32.7 | 16.6 | 38.8 | 51.6 |

AP por clase en validacion:

| pedestrian | rider | car | truck | bus | train | motorcycle | bicycle | traffic light | traffic sign |
|---|---|---|---|---|---|---|---|---|---|
| 36.5 | 28.9 | 51.9 | 45.9 | 50.0 | 8.1 | 27.7 | 28.1 | 25.4 | 39.5 |

El valor de mAP declarado en el model-index es 34.21 (Box AP en validacion, reportado por SysCV, marcado como `verified: false`). No se han publicado en la informacion disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros), que ademas no aplican a un modelo de vision.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita en la model card; con 66,2 M de parametros y entrada de 1280 x 720, el checkpoint en FP32 ocupa aproximadamente 265 MB, por lo que cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: no especificadas por el autor. El entorno de inferencia se ha probado en CPU (2,4 s/imagen con 8 hilos); el entorno CUDA 11.8 esta incluido pero la model card indica que no se ha probado en GPU.
- GPU consumer: por tamano de pesos, es compatible con tarjetas de 8 GB o menos; no hay mediciones publicadas de latencia en GPU.
- Despliegue: MMDetection 2.28.2 con mmcv-full 1.7.2 y torch 2.0.1 sobre Python 3.10 (entornos `requirements-cu118.txt` y `requirements-cpu.txt` incluidos). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 2,4 s/imagen en CPU con 8 hilos; sin datos de GPU.

## Comparativa con modelos similares

No se han publicado en la informacion disponible comparativas con otros detectores del zoo de SysCV ni con alternativas como YOLO, DETR o Faster R-CNN con backbone ResNet. La model card solo aporta los resultados propios del modelo frente a sus predicciones de referencia. Por tanto, la comparativa se limita a los datos internos del propio checkpoint (val frente a test) y se indica "no disponible" para el resto.

| Modelo | Parametros | Contexto/entrada | AP (BDD100K val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Faster R-CNN Swin-S-FPN 3x) | 66,2 M | 1280 x 720 | 34.2 | BDD100K (solo investigacion) | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia restrictiva: los pesos derivan de BDD100K y quedan bajo la licencia BDD100K (uso educativo, de investigacion y sin animo de lucro). No esta permitido el uso comercial sin autorizacion adicional; la configuracion de SysCV es Apache-2.0, pero los pesos no.
- Modelo de vision, no de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes; cualquier uso conversacional es inaplicable.
- Riesgo de falsos negativos y positivos en clases dificiles: el AP de la clase `train` es 8.1 y el de objetos pequenos (APs) es 16.2, lo que refleja un rendimiento bajo en esas categorias; no debe asumirse robustez uniforme entre clases.
- Entorno no probado en GPU: la model card indica que el entorno CUDA no se ha testeado, por lo que el rendimiento en GPU es incierto y la latencia publicada (2,4 s/imagen) corresponde a CPU.
- Dependencia de un stack antiguo: requiere mmdetection 2.x con mmcv-full 1.7.2 y torch 2.0.1; no es compatible directamente con versiones mas recientes de MMDetection sin migracion.
- Dominio limitado: entrenado exclusivamente con BDD100K (escenas de conduccion), por lo que su generalizacion a otros dominios visuales no esta documentada.
- Procedencia de los pesos: recuperados de la Wayback Machine; aunque se verifica el MD5 (`8ed2029935adc2b2a6230060f6d707ca`) y la equivalencia de predicciones, la cadena de custodia original depende de una fuente archivada.
- Sin sesgos documentados ni evaluaciones de robustez (condiciones meteorologicas extremas, geografias distintas) en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-faster-rcnn-swin-s-fpn-3x
- Licencia del modelo: https://huggingface.co/dronefreak/bdd100k-syscv-faster-rcnn-swin-s-fpn-3x/blob/main/LICENSE.txt
- Repositorio SysCV BDD100K models (deteccion): https://github.com/SysCV/bdd100k-models/tree/main/det
- Configuracion original de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/det/configs/det/faster_rcnn_swin-s_fpn_3x_det_bdd100k.py
- Paper Swin Transformer (arXiv:2103.14030): https://arxiv.org/abs/2103.14030
- Pesos ImageNet del backbone Swin-S: https://github.com/SwinTransformer/storage/releases/download/v1.0.0/swin_small_patch4_window7_224.pth
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
