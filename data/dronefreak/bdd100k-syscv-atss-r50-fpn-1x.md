# dronefreak/bdd100k-syscv-atss-r50-fpn-1x

## Resumen

El modelo `dronefreak/bdd100k-syscv-atss-r50-fpn-1x` es un detector de objetos de dos etapas basado en ATSS (Adaptive Training Sample Selection) con backbone ResNet-50 y cuello FPN, entrenado sobre el conjunto de datos BDD100K para deteccion de objetos en escenas de conduccion. No es un modelo de lenguaje ni un modelo generativo: es un checkpoint de vision por computador empaquetado para la libreria MMDetection, con 32,187,087 parametros y pesos en formato safetensors.

El modelo es un espejo (mirror) del zoo oficial de modelos BDD100K de SysCV (ETH Zurich). El host original `dl.cv.ethz.ch` esta fuera de linea, por lo que el autor recupero los pesos desde la Wayback Machine (captura del 19 de febrero de 2025) y los publico junto con un entorno de dependencias fijado y un script de inferencia (`infer.py`) que permite ejecutar el modelo sobre imagenes, videos o webcam. La relevancia actual es de tipo practico: preserva un checkpoint de referencia para benchmarking de deteccion en BDD100K que de otro modo seria inaccesible, y anade verificacion de reproducibilidad exacta frente a las predicciones publicadas por SysCV.

Arquitectura: detector ATSS (anchor-based con asignacion adaptativa de muestras) sobre ResNet-50 + FPN, entrada nativa de 1280x720, entrenado 12 epocas (1x) sobre las 70.000 imagenes de entrenamiento de BDD100K. Reporta un Box AP de 31,45 en validacion (31,5 redondeado en la tabla de la model card) y 29,9 en test. La licencia es la de BDD100K, restringida a uso educativo, de investigacion y sin animo de lucro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ATSS (Adaptive Training Sample Selection), detector de dos etapas anchor-based con backbone ResNet-50 y cuello FPN |
| Parametros totales | 32.187.087 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen 1280x720) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de vision, sin capacidades linguisticas) |
| Licencia | bdd100k (educativa, investigacion y sin animo de lucro); la config de SysCV es Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`), equivalente al `.pth` original; incluye `config.json` y `original_config.py` |

## Arquitectura y entrenamiento

ATSS es un detector anchor-based que sustituye la seleccion fija de muestras positivas/negativas por una asignacion adaptativa basada en la desviacion estandar de las distancias al centro del objeto, puenteando la brecha entre detectores anchor-based y anchor-free (paper CVPR 2020, arXiv:1912.02424). El checkpoint usa backbone ResNet-50 inicializado con pesos de ImageNet (`torchvision://resnet50`), cuello FPN y cabeza de deteccion estandar de MMDetection. La entrada es de 1280x720, el tamano nativo de BDD100K, sin redimensionado, en RGB con media y desviacion tipica de ImageNet.

El entrenamiento se realizo sobre las 70.000 imagenes de entrenamiento de BDD100K durante 12 epocas (esquema 1x), con SGD a learning rate 0.02, weight decay 0.0001, decaimiento en las epocas 8 y 11, y batch de 32 (8 GPU x 4 imagenes), segun el README de SysCV. En inferencia se aplica un umbral de score de 0.05, NMS con IoU 0.6 y un maximo de 100 cajas por imagen. El autor verifica que los pesos coinciden con el MD5 original de SysCV (`c1b49df40f61786c81ff8256f612890d`) y que la inferencia en CPU reproduce exactamente las 1999 cajas y scores de las predicciones de validacion publicadas por SysCV en 20 imagenes aleatorias.

## Capacidades

- Deteccion de objetos en imagenes de escenas de conduccion (10 clases de BDD100K: pedestrian, rider, car, truck, bus, train, motorcycle, bicycle, traffic light, traffic sign).
- Inferencia sobre imagenes sueltas, carpetas de imagenes, ficheros de video y webcam mediante `infer.py`.
- Exportacion de detecciones en formato BDD100K (`--json out.json`).
- Control del umbral de score (`--score-thr`, por defecto 0.3) y del numero maximo de fotogramas procesados (`--max-frames N`).
- Ejecucion en CPU y en GPU NVIDIA (entorno con CUDA 11.8 o entorno CPU alternativo).
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades multilingues ni modo thinking: es exclusivamente un detector de objetos.

## Casos de uso

- Benchmark de deteccion en BDD100K: sirve como referencia reproducible para comparar nuevos detectores frente al ATSS R50-FPN 1x del zoo de SysCV, con la ventaja de que los pesos y las predicciones de validacion estan verificados por MD5 e inferencia exacta.
- Prototipado de sistemas ADAS: permite detectar peatones, vehiculos y senales de trafico en imagenes de camara frontal a 1280x720, la resolucion nativa de BDD100K, sin pasos de preprocesado adicionales.
- Analisis de video de trafico: el script `infer.py` acepta ficheros de video y procesa fotograma a fotograma, lo que facilita contar o rastrear objetos en grabaciones de calle (con un coste aproximado de 1,2 s por imagen en 8 hilos de CPU).
- Investigacion academica sobre conduccion autonoma: al estar bajo licencia BDD100K (uso educativo y de investigacion), encaja en trabajos que comparan estrategias de asignacion de muestras o de backbone sobre el mismo conjunto de datos.
- Validacion de pipelines de MMDetection 2.x: el repo fija torch 2.0.1, mmcv-full 1.7.2 y mmdetection 2.28.2 sobre Python 3.10, por lo que sirve como entorno de referencia para depurar configuraciones antiguas de MMDetection.
- Demostraciones y material docente: el repo incluye un video de demostracion con detecciones sobre dos clips de validacion (dia y noche) revisados fotograma a fotograma para evitar matricula y rostros identificables, util para ilustrar deteccion en escenas diurnas y nocturnas.
- Analisis de escenas nocturnas: el demo incluye un clip nocturno, lo que permite evaluar cualitativamente el comportamiento del modelo en condiciones de baja iluminacion (con la cautela de que el AP global reportado es moderado).

## Benchmarks y rendimiento

Resultados declarados por SysCV (Box AP en formato COCO, %, sobre BDD100K):

| Split | AP | AP50 | AP75 | APs | APm | APl |
|---|---|---|---|---|---|---|
| val | 31,5 | 55,7 | 30,1 | 13,7 | 36,6 | 52,9 |
| test | 29,9 | 52,4 | 29,0 | 13,7 | 36,5 | 47,6 |

AP por clase en validacion:

| Clase | AP |
|---|---|
| pedestrian | 33,6 |
| rider | 22,7 |
| car | 51,9 |
| truck | 46,0 |
| bus | 47,4 |
| train | 0,0 |
| motorcycle | 22,0 |
| bicycle | 24,4 |
| traffic light | 26,9 |
| traffic sign | 39,6 |

El valor de mAP declarado en el model-index es 31,45 (validacion), marcado como no verificado (`verified: false`) por el autor del espejo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita en la informacion proporcionada. Con 32,2 M de parametros y entrada de 1280x720, la huella de pesos es pequena (del orden de decenas de MB en fp32), pero las activaciones a resolucion completa dominan el consumo; el autor no publica cifras de VRAM.
- GPU recomendadas: no especificadas por el autor. El entorno soporta CUDA 11.8; cualquier GPU NVIDIA compatible con esa version de CUDA deberia funcionar. El autor indica que el entorno CUDA no ha sido probado.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del modelo, aunque no hay confirmacion explicita en la informacion disponible.
- Opciones de despliegue: MMDetection 2.28.2 con mmcv-full 1.7.2 y torch 2.0.1 sobre Python 3.10 (entorno fijado en `env/requirements-cu118.txt` o `env/requirements-cpu.txt`, instalable con `uv`). Los pesos se cargan con `torch.load(weights_only=True)`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: aproximadamente 1,2 s por imagen en 8 hilos de CPU. No se publican cifras de latencia en GPU.

## Comparativa con modelos similares

No se dispone de datos de otros detectores en la informacion proporcionada para construir una comparativa con cifras verificables. Como referencia cualitativa, el propio zoo de SysCV incluye variantes de deteccion sobre BDD100K (por ejemplo, otras configuraciones de MMDetection), pero no se aportan sus resultados en esta ficha.

| Modelo | Parametros | Contexto/entrada | AP val BDD100K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ATSS R50-FPN 1x (este modelo) | 32.187.087 | 1280x720 | 31,5 | bdd100k (uso educativo/investigacion) | Hugging Face (espejo) |
| Alternativas del zoo SysCV | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia restrictiva: los pesos derivan de BDD100K y quedan bajo su licencia, limitada a uso educativo, de investigacion y sin animo de lucro. No esta permitido el uso comercial sin autorizacion.
- Rendimiento moderado: AP global de 31,5 en validacion y 29,9 en test; el AP para objetos pequenos es bajo (13,7), lo que limita la deteccion de senales, peatones lejanos o elementos de pequeno tamano.
- Clase `train` con AP 0,0 en validacion: el modelo no detecta eficazmente trenes, probablemente por escasez de ejemplos en el conjunto de datos.
- Clases minoritarias con AP bajo: rider (22,7), motorcycle (22,0) y bicycle (24,4) presentan un rendimiento claramente inferior al de coches (51,9) o autobuses (47,4), lo que refleja desequilibrios del conjunto de datos.
- Sesgos del conjunto de datos: BDD100K esta recogido en ciudades y carreteras de Estados Unidos; el modelo puede generalizar mal a otros paises, condiciones meteorologicas extremas o tipos de vehiculos no representados.
- Sin validacion en GPU: el autor confirma la reproduccion exacta en CPU, pero indica que el entorno CUDA no ha sido probado.
- Entorno anticuado: depende de MMDetection 2.x y mmcv-full 1.7.2, versiones que ya no reciben mantenimiento activo; requiere un entorno virtual limpio y puede presentar incompatibilidades con stacks modernos.
- No es un modelo generativo: no admite prompts, tool calling, agentes ni razonamiento; cualquier uso fuera de deteccion de objetos queda fuera de su alcance.
- Riesgo de falsos positivos y negativos en condiciones nocturnas o de baja visibilidad, no cuantificado en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-atss-r50-fpn-1x
- Licencia (LICENSE.txt): https://huggingface.co/dronefreak/bdd100k-syscv-atss-r50-fpn-1x/blob/main/LICENSE.txt
- Repositorio SysCV BDD100K models (ETH Zurich): https://github.com/SysCV/bdd100k-models/tree/main/det
- Config de SysCV para este modelo: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/det/configs/det/atss_r50_fpn_1x_det_bdd100k.py
- Paper ATSS (CVPR 2020): https://arxiv.org/abs/1912.02424
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
- Demo (video de detecciones dia/noche): https://huggingface.co/dronefreak/bdd100k-syscv-atss-r50-fpn-1x/resolve/main/assets/demo_banner.mp4
