# dronefreak/bdd100k-syscv-dla60-5x-224x224-scene

## Resumen

DLA-60 Scene Tagging es un clasificador de imagenes especializado en etiquetar escenas de conduccion. Asigna a cada fotograma una unica etiqueta entre siete posibles: tunel, residencial, aparcamiento, indefinido, calle urbana, gasolinera y autopista. El modelo es un mirror del zoo de modelos de BDD100K publicado por SysCV (ETH Zurich), recuperado desde la Wayback Machine ante la caida del host original `dl.cv.ethz.ch`. Lo mantiene el usuario `dronefreak` en Hugging Face con un entorno fijado y un script de inferencia.

Arquitectonicamente es una red DLA-60 (Deep Layer Aggregation, CVPR 2018) con una cabeza de clasificacion lineal, entrenada desde cero sobre el split de entrenamiento de BDD100K (70.000 imagenes) durante 60 epocas. Con 21,36 millones de parametros y un peso de repositorio de 0,2 GB, es un modelo muy ligero orientado a inferencia rapida en entornos de conduccion autonoma o analisis de video.

Su relevancia es practica: sirve como modulo de contexto de escena dentro de pipelines de percepcion, permitiendo condicionar el comportamiento de otros modelos (deteccion, planificacion) segun el entorno. El checkpoint reproduce exactamente las predicciones publicadas por SysCV sobre las 10.000 imagenes de validacion, lo que lo convierte en una referencia fiable para experimentos reproducibles. La licencia BDD100K restringe el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DLA-60 (Deep Layer Aggregation) + ClsHead lineal |
| Parametros totales | 21.359.927 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificacion de imagen, entrada 224x224) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision) |
| Licencia | BDD100K (educativa, investigacion y sin animo de lucro; ver LICENSE.txt) |
| Formato de pesos | safetensors, PyTorch (.pth) |

## Arquitectura y entrenamiento

El modelo emplea una red DLA-60 como backbone, una arquitectura convolucional que agrega caracteristicas de forma jerarquica mediante bloques de agregacion iterativa y profunda. Sobre el backbone se aplica una cabeza de clasificacion lineal (ClsHead de mmcls) que produce un vector de siete puntuaciones, una por clase de escena. La entrada se normaliza con media y desviacion tipica de ImageNet, se redimensiona el lado corto a 256 pixeles (una imagen 1280x720 pasa a 455x256) y se recorta un centro de 224x224.

El entrenamiento usa el split de entrenamiento de BDD100K (70.000 imagenes) durante 60 epocas (esquema 5x) con SGD (lr 0.1, momentum 0.9, weight decay 0.0001), batch de 128 (4 GPU x 32 imagenes), decaimiento de learning rate en las epocas 30 y 45, y aumentacion con recortes aleatorios redimensionados a 224x224 y volteos horizontales. El config no define pesos preentrenados para el backbone, por lo que el entrenamiento es desde cero. No se documenta RLHF, DPO ni tecnicas de decodificacion especulativa, al tratarse de un clasificador discriminativo.

## Capacidades

- Clasificacion de escena de conduccion en siete categorias: tunel, residencial, aparcamiento, indefinido, calle urbana, gasolinera y autopista.
- Etiquetado por fotograma en imagenes sueltas, carpetas de imagenes, archivos de video y camara web (via `infer.py`).
- Salida de la etiqueta predicha y de todas las puntuaciones por clase en formato JSON (`--json`).
- Procesamiento por lotes con limite configurable de fotogramas (`--max-frames`) para video.
- Inferencia en GPU (CUDA 11.8) y en CPU, con entornos de dependencias fijados.
- No soporta tool calling, agentes, razonamiento multi-paso, vision generativa, audio ni capacidades multilingues.

## Casos de uso

- Contexto de escena en pipelines de conduccion autonoma: el modelo etiqueta cada fotograma como urbano, autopista o tunel, lo que permite conmutar parametros de deteccion o planificacion segun el entorno (por ejemplo, umbrales distintos en autopista frente a calle urbana).
- Analisis de video de flotas: procesar grabaciones de dashcam a 0,005 s por imagen en una RTX 4070 SUPER (0,03 s en 8 hilos de CPU) permite etiquetar horas de video en minutos y segmentar trayectos por tipo de escena.
- Filtrado y curaduria de datasets: seleccionar automaticamente imagenes de una categoria concreta (por ejemplo, gasolineras o tuneles) para construir subconjuntos de entrenamiento o validacion de otros modelos.
- Reproduccion de experimentos academicos: al coincidir exactamente con las predicciones publicadas por SysCV, sirve como baseline fiable en estudios que comparan tecnicas de tagging de escena.
- Sistemas de alerta contextual: en aplicaciones de asistencia a la conduccion, la etiqueta de escena puede activar avisos o modos de visualizacion especificos (por ejemplo, modo nocturno o de aparcamiento) sin coste computacional apreciable.
- Etiquetado en dispositivos con recursos limitados: con 21,4 millones de parametros y 0,2 GB de pesos, cabe en entornos de borde o CPU, lo que permite desplegarlo en vehiculos o unidades de captura sin GPU dedicada.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (procedentes de los ficheros de puntuacion de SysCV), sobre BDD100K. Precision, recall y F1 son medias macro sobre las siete clases (incluida `undefined`):

| Split | Top-1 accuracy | Precision | Recall | F1 |
|---|---|---|---|---|
| val | 75,14 | 46,84 | 35,98 | 38,61 |
| test | 74,80 | 45,85 | 36,44 | 39,30 |

La reproduccion exacta se verifico sobre las 10.000 imagenes de validacion: la etiqueta coincide con las predicciones publicadas de SysCV en todas las imagenes y las puntuaciones por clase difieren como maximo en 3e-06 (GPU, CUDA 11.8, RTX 4070 SUPER). En CPU, sobre 20 imagenes de validacion, la diferencia maxima de puntuacion es de 1e-06. El MD5 de los pesos (`bc069bd4b898b2eca8df71208477630e`) coincide con el fichero de SysCV.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el modelo ocupa 0,2 GB en pesos, por lo que con un lote pequeno cabe holgadamente en cualquier GPU con 2 GB o mas.
- GPU recomendadas: RTX 4070 SUPER (0,005 s/imagen incluyendo decodificacion JPEG, medida por el autor); cualquier GPU NVIDIA con CUDA 11.8 funciona. Para alto rendimiento, A100 o H100 no aportan ventaja significativa por el tamano del modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (GTX 1060 en adelante) e incluso en CPU.
- Opciones de despliegue: entorno Python fijado con torch 2.0.1, mmcv-full 1.7.2 y mmcls 0.25.0 (Python 3.10); script `infer.py` incluido para imagen, carpeta, video y webcam. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI (no aplicables a un clasificador de vision).
- Latencia y throughput: 0,005 s/imagen en RTX 4070 SUPER; 0,03 s/imagen en 8 hilos de CPU.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de resultados de otros modelos de tagging de escena sobre BDD100K para establecer una comparacion cuantitativa. Como referencia estructural, el zoo de SysCV incluye otros clasificadores de tagging (deteccion, segmentacion y tagging) sobre BDD100K, pero no se detallan sus metricas en la informacion disponible.

| Modelo | Parametros | Contexto/entrada | Top-1 (BDD100K val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DLA-60 Scene Tagging (este) | 21,36 M | 224x224 | 75,14 | BDD100K (no comercial) | Hugging Face |
| Otros modelos del zoo SysCV | no disponible | no disponible | no disponible | Apache-2.0 (codigo) | GitHub SysCV |

## Limitaciones y advertencias

- Licencia BDD100K: uso educativo, de investigacion y sin animo de lucro unicamente; el uso comercial esta restringido y requiere atencion a los terminos de `LICENSE.txt`.
- El modelo predice una sola etiqueta de escena por imagen; no realiza deteccion de objetos, segmentacion ni ninguna otra tarea de percepcion.
- Precision y recall macro bajos (46,84 y 35,98 en validacion) indican un desequilibrio notable entre clases; la clase `undefined` y las minoritarias (gasolineras, tuneles) probablemente concentran los errores.
- Entrenado exclusivamente con BDD100K (escenas de conduccion, predominantemente entornos de EE. UU. y otros paises del dataset); puede generalizar mal a geografias, condiciones meteorologicas o tipos de via no representados.
- No hay datos publicados sobre sesgos demograficos o geograficos especificos, ni evaluacion fuera del dominio de BDD100K.
- El repositorio es un mirror no oficial recuperado de la Wayback Machine; aunque verificado contra los ficheros originales de SysCV, no cuenta con el respaldo directo de los autores originales.
- El entorno de dependencias esta fijado a versiones antiguas (torch 2.0.1, mmcv-full 1.7.2, mmcls 0.25.0), lo que puede complicar la integracion en stacks modernos.
- No se documentan tecnicas de calibracion de probabilidades; las puntuaciones por clase deben interpretarse con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-dla60-5x-224x224-scene
- Licencia: https://huggingface.co/dronefreak/bdd100k-syscv-dla60-5x-224x224-scene/blob/main/LICENSE.txt
- Zoo de modelos SysCV (tagging): https://github.com/SysCV/bdd100k-models/tree/main/tagging
- Config de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/tagging/configs/scene/dla60_5x_224x224_scene_tag_bdd100k.py
- Paper de DLA (Deep Layer Aggregation, CVPR 2018): https://arxiv.org/abs/1707.06484
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
