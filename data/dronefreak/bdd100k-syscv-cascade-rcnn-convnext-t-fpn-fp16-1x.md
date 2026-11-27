# dronefreak/bdd100k-syscv-cascade-rcnn-convnext-t-fpn-fp16-1x

## Resumen

Cascade R-CNN con backbone ConvNeXt-Tiny y cuello FPN, entrenado en FP16 sobre el conjunto de datos BDD100K para deteccion de objetos en escenas de conduccion. No es un modelo original: se trata de un espejo (mirror) de un checkpoint del zoo de modelos de SysCV (ETH Zurich), cuyo host `dl.cv.ethz.ch` esta fuera de linea. Los pesos se recuperaron de la captura de Wayback Machine del 19 de febrero de 2025, y el repositorio anade un entorno de dependencias fijado y un script de inferencia (`infer.py`) para imagen, carpeta de imagenes, video o webcam.

El modelo resuelve la tarea de deteccion de objetos en 10 clases propias de BDD100K (peatonal, ciclista, coche, camion, autobus, tren, motocicleta, bicicleta, semaforo y senal de trafico) a resolucion nativa de 1280x720, sin reescalado. Su relevancia practica es doble: por un lado, permite reproducir resultados de referencia del zoo de SysCV cuando el host original no esta accesible; por otro, ofrece un checkpoint ligero (72,9 M de parametros, 1,4 GB de repositorio) usable en CPU y en GPU de consumo para prototipos de percepcion en conduccion autonoma.

La arquitectura es una Cascade R-CNN de tres etapas con backbone ConvNeXt-Tiny inicializado con pesos ImageNet, FPN y entrenamiento en 12 epocas (1x). El checkpoint declara un Box AP de 35,51 en validacion segun los ficheros de puntuaciones de SysCV. Es un modelo de vision puro, sin capacidades de lenguaje, tool calling ni agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cascade R-CNN (3 etapas) + ConvNeXt-Tiny + FPN |
| Parametros totales | 72.878.556 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada 1280x720 RGB) |
| Tipos de cuantizacion | FP16 (entrenamiento e inferencia); no se documentan otras |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | BDD100K (educational, research and not-for-profit use); config de SysCV Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`), `.pth` original, configuracion mmdetection 2.x |

## Arquitectura y entrenamiento

Cascade R-CNN es un detector de dos etapas que encadena tres cabezas de clasificacion y regresion con umbrales de IoU crecientes, lo que refina progresivamente las propuestas. El backbone es ConvNeXt-Tiny (paper "A ConvNet for the 2020s", CVPR 2022), inicializado con pesos ImageNet de MMClassification, y el cuello es un FPN estandar. La entrada se mantiene a la resolucion nativa de BDD100K, 1280x720, con normalizacion ImageNet (media y desviacion tipica), sin redimensionado.

El entrenamiento usa las 70.000 imagenes de entrenamiento de BDD100K durante 12 epocas (esquema 1x), con AdamW a learning rate 0,0001, weight decay 0,05, decaimiento en las epocas 9 y 11, batch de 32 (8 GPU x 4 imagenes) y precision mixta FP16. En test se aplica umbral de puntuacion 0,05, NMS con IoU 0,5 y un maximo de 100 cajas por imagen. No se documenta RLHF, DPO ni tecnicas de decodificacion especulativa, por tratarse de un modelo de vision. La innovacion destacable del repositorio es la recuperacion de pesos desde Wayback Machine y la verificacion por MD5 (`ad1b0baadc188b73fa7b20517dd10e24`) contra el fichero de SysCV, ademas de un entorno fijado (torch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2, mmcls 0.25.0, Python 3.10).

## Capacidades

- Deteccion de objetos en imagenes de escenas de conduccion en 10 clases de BDD100K: pedestrian, rider, car, truck, bus, train, motorcycle, bicycle, traffic light y traffic sign.
- Inferencia sobre imagen individual, carpeta de imagenes, fichero de video y webcam (`python infer.py 0 --show`).
- Salida en formato BDD100K mediante `--json out.json`, ademas de umbral de puntuacion configurable (`--score-thr`, por defecto 0,3) y limite de fotogramas (`--max-frames`).
- Funcionamiento en CPU (2,6 s/imagen con 8 hilos) y en GPU con CUDA 11.8.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues, de audio o de lenguaje; es exclusivamente vision por computador.

## Casos de uso

- Prototipado de percepcion en conduccion autonoma: el modelo detecta coches, peatones, semaforos y senales a 1280x720 sin reescalado, lo que permite construir pipelines de deteccion sobre clips de BDD100K o footage propio sin reentrenar.
- Reproduccion de resultados de referencia: al recuperar el checkpoint y las predicciones de validacion de SysCV, sirve para verificar experimentos academicos que citan el zoo de modelos de BDD100K cuando el host original esta caido.
- Analisis de video de trafico: `infer.py` acepta ficheros de video y permite extraer detecciones por fotograma en formato BDD100K, util para conteo de vehiculos o estudio de escenas diurnas y nocturnas (el demo del autor cubre ambos).
- Etiquetado asistido (pre-anotacion): las detecciones con umbral bajo (0,05 en test) pueden usarse como propuestas para acelerar el etiquetado manual de nuevas imagenes de conduccion.
- Educacion y docencia en vision por computador: el entorno fijado en un venv reproducible simplifica demostraciones de Cascade R-CNN con ConvNeXt en mmdetection 2.x.
- Baseline para comparativas de detectores: con 72,9 M de parametros y 35,5 AP en validacion, sirve como referencia ligera frente a detectores mas grandes en tareas de conduccion.
- Despliegue en CPU para entornos sin GPU: los 2,6 s/imagen con 8 hilos permiten procesamiento por lotes no interactivo en servidores sin acelerador.

## Benchmarks y rendimiento

Resultados declarados por el autor (procedentes de los ficheros de puntuaciones de SysCV; `verified: false`), AP estilo COCO en BDD100K:

| Split | AP | AP50 | AP75 | APs | APm | APl |
|---|---|---|---|---|---|---|
| val | 35,5 | 60,8 | 34,7 | 16,7 | 39,7 | 59,5 |
| test | 34,0 | 57,4 | 34,2 | 17,1 | 40,4 | 52,8 |

AP por clase en validacion:

| pedestrian | rider | car | truck | bus | train | motorcycle | bicycle | traffic light | traffic sign |
|---|---|---|---|---|---|---|---|---|---|
| 38,4 | 29,3 | 54,1 | 49,1 | 51,8 | 7,2 | 27,8 | 28,2 | 27,0 | 42,2 |

Nota de verificacion del autor: en 20 imagenes aleatorias de validacion, 98 de las 755 cajas publicadas por SysCV son identicas en esta copia (CPU), las 755 coinciden con IoU >= 0,5 y la mayor diferencia de puntuacion es 0,0568; la causa no se investigo. El entorno CUDA no se ha probado.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 72,9 M de parametros en FP16 el peso de los pesos ronda los 146 MB, y el consumo real depende del tamano de lote y de la resolucion de entrada (1280x720).
- GPU recomendadas: no se especifican; el autor indica que el entorno CUDA 11.8 no se ha probado. Cualquier GPU con al menos 4-6 GB de VRAM deberia poder ejecutar el modelo a 1280x720, pero es una estimacion, no un dato publicado.
- CPU: funciona sin GPU; 2,6 s/imagen con 8 hilos segun el autor.
- GPU de consumo: previsiblemente cabe en RTX 3060, 4060, 4090 y similares por el reducido numero de parametros, aunque no hay medicion publicada.
- Opciones de despliegue: mmdetection 2.28.2 con mmcv-full 1.7.2 y mmcls 0.25.0 sobre torch 2.0.1 (Python 3.10), mediante el `infer.py` incluido; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un detector de vision de este tipo).
- Latencia y throughput: 2,6 s/imagen en CPU con 8 hilos; no hay datos de latencia en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Backbone | Contexto/entrada | AP val BDD100K | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (Cascade R-CNN ConvNeXt-T FPN FP16 1x) | 72,9 M | ConvNeXt-Tiny | 1280x720 | 35,5 | BDD100K (solo investigacion) | Hugging Face (espejo) |
| Otros detectores del zoo SysCV BDD100K | no disponible | no disponible | no disponible | no disponible | no disponible | host original caido |
| Detectores genericos COCO (p. ej. Cascade R-CNN con ResNet) | no disponible | no disponible | no disponible | no comparable (otro dataset) | variable | amplia |

No se dispone de datos de benchmarks de alternativas equivalentes en la informacion proporcionada; la comparativa cuantitativa con otros modelos del mismo zoo no es posible.

## Limitaciones y advertencias

- Licencia BDD100K: uso educativo, de investigacion y sin animo de lucro; el uso comercial no esta permitido sin autorizacion adicional.
- Entrenado solo en BDD100K (escenas de conduccion), con 10 clases; no generaliza a dominios ajenos a la conduccion.
- Rendimiento muy bajo en la clase `train` (AP 7,2) y moderado en clases pequenas (`APs` 16,7 en validacion), lo que limita su uso en objetos pequenos o poco frecuentes.
- La verificacion es "cercana, no exacta": solo 98 de 755 cajas coinciden exactamente con las de SysCV; existe una discrepancia de hasta 0,0568 en puntuaciones cuya causa no se investigo.
- El entorno CUDA no ha sido probado por el autor; la validacion de pesos se hizo en CPU.
- Riesgo de falsos positivos y negativos en condiciones de baja iluminacion o clima adverso, no cuantificado en la informacion disponible.
- El repo depende de una pila antigua (mmdetection 2.x, torch 2.0.1); la integracion con stacks modernos puede requerir trabajo adicional.
- No procesa texto ni lenguaje: no es adecuado para tareas de VQA, captioning ni agentes multimodales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-cascade-rcnn-convnext-t-fpn-fp16-1x
- Licencia (LICENSE.txt en el repo): https://huggingface.co/dronefreak/bdd100k-syscv-cascade-rcnn-convnext-t-fpn-fp16-1x/blob/main/LICENSE.txt
- Zoo de modelos SysCV BDD100K (ETH Zurich): https://github.com/SysCV/bdd100k-models/tree/main/det
- Config de SysCV usada: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/det/configs/det/cascade_rcnn_convnext-t_fpn_fp16_1x_det_bdd100k.py
- Paper ConvNeXt (arXiv 2201.03545): https://arxiv.org/abs/2201.03545
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
- Pesos ImageNet de ConvNeXt-Tiny (MMClassification): https://download.openmmlab.com/mmclassification/v0/convnext/downstream/convnext-tiny_3rdparty_32xb128-noema_in1k_20220301-795e9634.pth
