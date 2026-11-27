# dronefreak/bdd100k-syscv-atss-r101-fpn-dyhead-3x

## Resumen

El modelo `dronefreak/bdd100k-syscv-atss-r101-fpn-dyhead-3x` es un detector de objetos de dos etapas para escenas de conduccion autonoma, entrenado sobre el conjunto de datos BDD100K. Se trata de un espejo (mirror) de un checkpoint del zoo de modelos de SysCV (ETH Zurich), recuperado desde la Wayback Machine tras la caida del host original `dl.cv.ethz.ch`. El autor del repositorio, `dronefreak`, anade un entorno fijado con versiones exactas y un script de inferencia reproducible.

La arquitectura combina el detector ATSS con un backbone ResNet-101 inicializado con pesos ImageNet, un cuello FPN y la cabeza de deteccion DyHead (Dynamic Head, CVPR 2021), que unifica atencion sobre escala espacial, nivel semantico y tarea. El entrenamiento se realizo sobre las 70.000 imagenes de entrenamiento de BDD100K durante 36 epocas (esquema 3x) con entrenamiento multi-escala.

Con 58.007.799 parametros y un tamano de repositorio de 1,2 GB, el modelo alcanza un box AP de 34,61 en la particion de validacion de BDD100K. Es relevante porque preserva un checkpoint de referencia que ya no esta disponible en su ubicacion original, con verificacion exacta de pesos (MD5) y reproduccion bit a bit de las predicciones publicadas por SysCV.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ATSS (Adaptive Training Sample Selection) con backbone ResNet-101, cuello FPN y cabeza DyHead; detector de dos etapas |
| Parametros totales | 58.007.799 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen 1280 x 720) |
| Tipos de cuantizacion | no disponible (solo se documentan pesos en safetensors y `.pth` en FP32) |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | BDD100K (`license: other`, `license_name: bdd100k`): uso educativo, de investigacion y sin animo de lucro |
| Formato de pesos | safetensors (`model.safetensors`), con `.pth` equivalente en `original/` |

## Arquitectura y entrenamiento

El modelo es un detector de objetos de dos etapas basado en ATSS con backbone ResNet-101 preentrenado en ImageNet (`torchvision://resnet101`), cuello Feature Pyramid Network y cabeza de deteccion DyHead. DyHead aplica mecanismos de atencion sobre tres dimensiones: escala espacial, nivel de la piramide y canal/tarea, lo que mejora la representacion de objetos de distinto tamano en escenas de trafico. La entrada es la resolucion nativa de BDD100K, 1280 x 720, sin redimensionado, en RGB con media y desviacion tipica de ImageNet.

El entrenamiento se realizo sobre las 70.000 imagenes de entrenamiento de BDD100K durante 36 epocas (esquema 3x), con SGD de tasa de aprendizaje 0,02, weight decay 0,0001, decaimiento de la tasa en las epocas 24 y 33, batch de 32 (8 GPU x 4 imagenes) y entrenamiento multi-escala con 6 escalas entre (1280, 600) y (1280, 720). En inferencia se aplica umbral de score 0,05, NMS con IoU 0,6 y un maximo de 100 cajas por imagen. No se documenta uso de RLHF/DPO ni tecnicas de decodificacion especulativa, al no tratarse de un modelo generativo de lenguaje.

## Capacidades

- Deteccion de objetos en escenas de conduccion: 10 categorias de BDD100K (peatón, ciclista, coche, camion, autobus, tren, motocicleta, bicicleta, semaforo y senal de trafico).
- Localizacion con cajas delimitadoras en formato COCO-style, con scores de confianza y supresion de no maximos configurable.
- Inferencia sobre imagenes sueltas, carpetas de imagenes, ficheros de video y camara web (webcam) mediante `infer.py`.
- Exportacion de detecciones en formato BDD100K mediante la opcion `--json`.
- Umbral de score ajustable (`--score-thr`, por defecto 0,3) y limite de fotogramas procesados (`--max-frames`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es exclusivamente un modelo de vision por computador.
- No dispone de modo thinking, vision generativa, audio ni ninguna capacidad multimodal mas alla de la deteccion sobre imagen.

## Casos de uso

- Percepcion en prototipos de conduccion autonoma: el modelo detecta peatones, vehiculos y senalizacion en imagenes de 1280 x 720 nativas de BDD100K, adecuado para validar pipelines de percepcion en entornos de investigacion con escenas diurnas y nocturnas.
- Analisis de video de trafico: `infer.py` acepta ficheros de video y procesa fotograma a fotograma, lo que permite extraer detecciones con marcas temporales para estudios de flujo vehicular o conteo de objetos.
- Etiquetado asistido (pre-anotacion): las detecciones exportadas en formato BDD100K (`--json`) pueden servir como propuestas iniciales para anotadores humanos, reduciendo el coste de etiquetado en nuevos conjuntos de imagenes de conduccion.
- Benchmarking y reproduccion de resultados: al reproducir exactamente las predicciones publicadas por SysCV (mismas 1953 cajas y scores en 20 imagenes de validacion), sirve como linea base verificable en experimentos de deteccion sobre BDD100K.
- Docencia e investigacion en vision por computador: el entorno fijado (torch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2, Python 3.10) facilita la reproduccion en laboratorio sin resolver dependencias manualmente.
- Evaluacion de robustez dia/noche: el repositorio incluye una demo con clips diurnos y nocturnos de validacion, util para analizar el comportamiento del detector en condiciones de iluminacion adversas.
- Integracion en sistemas de video-vigilancia viaria: con umbral de score ajustable y salida JSON, puede alimentar alertas o paneles de monitorizacion en entornos de investigacion no comerciales.

## Benchmarks y rendimiento

Resultados declarados por el autor (procedentes de los ficheros de score de SysCV; metrica no verificada de forma independiente en la model card, salvo la reproduccion exacta de cajas y scores):

| Metrica | Valor |
|---|---|
| Box AP (val) | 34,61 |
| AP50 (val) | 59,6 |
| AP75 (val) | 33,4 |
| APs (val) | 16,1 |
| APm (val) | 39,8 |
| APl (val) | 56,3 |
| Box AP (test) | 33,7 |
| AP50 (test) | 56,9 |
| AP75 (test) | 33,7 |
| APs (test) | 16,6 |
| APm (test) | 40,4 |
| APl (test) | 52,1 |

AP por categoria en validacion:

| Categoria | AP |
|---|---|
| Peaton | 38,0 |
| Ciclista | 26,8 |
| Coche | 54,1 |
| Camion | 51,0 |
| Autobus | 51,6 |
| Tren | 0,1 |
| Motocicleta | 25,8 |
| Bicicleta | 27,6 |
| Semaforo | 29,0 |
| Senal de trafico | 42,2 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en la misma tabla.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 58 millones de parametros en FP32 (unos 232 MB de pesos) y entrada de 1280 x 720, la memoria necesaria es moderada, pero el repositorio no publica una cifra concreta.
- GPU recomendadas: no disponible; el autor indica que el entorno CUDA (requirements-cu118) no ha sido probado aun, por lo que la ruta verificada es CPU.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del modelo, aunque no se documenta una GPU concreta ni resultados medidos.
- Opciones de despliegue: mmdetection 2.28.2 con mmcv-full 1.7.2 y torch 2.0.1 sobre Python 3.10; script `infer.py` propio. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un detector de objetos).
- Latencia y throughput: 5,3 segundos por imagen en 8 hilos de CPU con el umbral de score 0,05 y NMS IoU 0,6. No se publican cifras de latencia en GPU.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de resultados de otros detectores sobre BDD100K con los que comparar de forma directa. Se indica a continuacion lo que si consta:

| Modelo | Parametros | Contexto/entrada | AP val BDD100K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ATSS R101-FPN DyHead 3x (este modelo) | 58.007.799 | 1280 x 720 | 34,61 | BDD100K (uso educativo/investigacion) | Hugging Face (espejo verificado) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Rendimiento muy bajo en la categoria tren (AP 0,1), practicamente inutilizable para esa clase.
- APs (objetos pequenos) de 16,1 en validacion: el detector tiene dificultades con objetos de pequeno tamano.
- Sesgos conocidos: no documentados de forma explicita; al entrenarse solo con BDD100K, el modelo esta sesgado hacia las condiciones, geografias y camaras representadas en ese conjunto (principalmente escenas de conduccion de EE. UU. y otras regiones incluidas en el dataset).
- Riesgo de falsos positivos y negativos: el umbral por defecto de 0,3 en inferencia y el umbral de 0,05 en evaluacion condicionan fuertemente el numero de cajas; requiere calibracion por caso de uso.
- Limitaciones de contexto e idioma: no aplica procesamiento de lenguaje; no hay soporte multilingue.
- Restricciones de licencia: los pesos estan bajo la licencia de BDD100K, limitada a uso educativo, de investigacion y sin animo de lucro; no se permite uso comercial sin autorizacion. La configuracion de SysCV es Apache-2.0.
- Entorno CUDA no probado: el autor advierte que la ruta con GPU no ha sido validada; solo la inferencia en CPU esta verificada.
- Dependencias antiguas: requiere mmdetection 2.x con versiones fijadas (torch 2.0.1, mmcv-full 1.7.2), lo que puede complicar la integracion en stacks modernos.
- Privacidad: la demo del autor fue revisada fotograma a fotograma para evitar matriculas legibles y rostros identificables, lo que sugiere que el modelo puede detectar elementos sensibles en video real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-atss-r101-fpn-dyhead-3x
- Repositorio SysCV BDD100K models (ETH Zurich): https://github.com/SysCV/bdd100k-models/tree/main/det
- Configuracion de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/det/configs/det/atss_r101_fpn_dyhead_3x_det_bdd100k.py
- Paper DyHead (Dynamic Head, CVPR 2021): https://arxiv.org/abs/2106.08322
- Licencia BDD100K: https://huggingface.co/dronefreak/bdd100k-syscv-atss-r101-fpn-dyhead-3x/blob/main/LICENSE.txt
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
