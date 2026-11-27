# dronefreak/bdd100k-syscv-atss-r50-fpn-3x

## Resumen

El modelo `dronefreak/bdd100k-syscv-atss-r50-fpn-3x` es un detector de objetos para escenas de conduccion autonoma, concretamente un ATSS (Adaptive Training Sample Selection) con backbone ResNet-50 y cuello FPN, entrenado sobre el conjunto de datos BDD100K. El autor del repositorio, dronefreak, no es el autor original del modelo: se trata de un espejo (mirror) de un checkpoint publicado por el grupo SysCV de la ETH Zurich en su zoo de modelos BDD100K, cuyo servidor de descargas original (`dl.cv.ethz.ch`) esta fuera de linea. Los pesos se recuperaron del Internet Archive (captura del 19 de febrero de 2025) y se publicaron junto con la configuracion original y un script de inferencia.

El modelo resuelve la deteccion de objetos en imagenes y video de trafico rodado, con diez clases especificas del dominio de conduccion: peatones, ciclistas, coches, camiones, autobuses, trenes, motocicletas, bicicletas, semaforos y senales de trafico. Su relevancia actual es fundamentalmente practica: preserva un checkpoint que ya no estaba disponible en su ubicacion original y lo empaqueta con un entorno reproducible (Python 3.10, torch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2), lo que permite volver a ejecutar un baseline de deteccion en BDD100K sin depender de infraestructura caida.

Arquitectonicamente es un detector de una etapa basado en ATSS, con 32.187.087 parametros totales, entrada nativa de 1280x720 y pesos en formato safetensors. No es un modelo de lenguaje ni un modelo generativo: es un modelo de vision por computador puro, por lo que las filas de contexto, cuantizacion o idiomas de la ficha no aplican en el sentido habitual y se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ATSS (Adaptive Training Sample Selection), detector de una etapa; backbone ResNet-50, cuello FPN, cabeza ATSS |
| Parametros totales | 32.187.087 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision; entrada de imagen 1280x720) |
| Tipos de cuantizacion | no disponible (no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | bdd100k (licencia del dataset BDD100K: uso educativo, investigacion y sin animo de lucro); la config de SysCV es Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`), equivalente al `.pth` original; config en `config.json` |
| Framework | mmdetection 2.28.2, mmcv-full 1.7.2, PyTorch 2.0.1 |
| Entrada | 1280x720 RGB, media y desviacion estandar de ImageNet, sin redimensionado |
| Clases | 10: pedestrian, rider, car, truck, bus, train, motorcycle, bicycle, traffic light, traffic sign |
| Tamano del repositorio | 0.9 GB |
| MD5 de pesos | 37cb382d0de2766b1a25326b80d5cc42 |

## Arquitectura y entrenamiento

ATSS es un detector de objetos de una etapa que aborda la brecha entre detectores anchor-based y anchor-free mediante la seleccion adaptativa de muestras de entrenamiento: en lugar de fijar umbrales de IoU, selecciona muestras positivas por objeto en funcion de la media y la desviacion estandar de las distancias entre el centro del objeto y los anclajes de cada nivel del FPN. El backbone es un ResNet-50 inicializado con pesos de ImageNet (`torchvision://resnet50`), sobre el que se monta un cuello FPN y una cabeza de clasificacion y regresion por nivel.

El entrenamiento se realizo sobre el split de entrenamiento de BDD100K (70.000 imagenes) durante 36 epocas (esquema 3x), con SGD de tasa de aprendizaje 0.02, weight decay 0.0001, decaimiento de la tasa en las epocas 24 y 33, batch de 32 (8 GPUs x 4 imagenes) y entrenamiento multi-escala con 6 escalas entre (1280, 600) y (1280, 720). En inferencia se aplica un umbral de puntuacion de 0.05, NMS con IoU 0.6 y un maximo de 100 cajas por imagen. El autor del espejo verifica la reproduccion exacta: sobre 20 imagenes aleatorias de validacion, esta copia produce las mismas 1987 cajas y puntuaciones que las predicciones publicadas por SysCV (con un desplazamiento de 1 px en `x2` e `y2` en la exportacion original), y el MD5 de los pesos coincide con el archivo de referencia de SysCV.

## Capacidades

- Deteccion de objetos en imagenes individuales y en carpetas de imagenes.
- Deteccion sobre video, con procesamiento fotograma a fotograma y opcion de limitar el numero de fotogramas (`--max-frames`).
- Inferencia en directo desde webcam.
- Deteccion de diez clases del dominio de conduccion: peatones, ciclistas, coches, camiones, autobuses, trenes, motocicletas, bicicletas, semaforos y senales de trafico.
- Exportacion de detecciones en formato BDD100K mediante `--json`.
- Umbral de puntuacion configurable (`--score-thr`, por defecto 0.3).
- Ejecucion en CPU y en GPU (entornos de dependencias separados para CUDA 11.8 y CPU).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es exclusivamente un modelo de vision.

## Casos de uso

- Preservacion de baselines de investigacion: permite reproducir resultados publicados sobre BDD100K cuando el host original de los pesos no esta disponible, gracias a la verificacion de MD5 y a la coincidencia exacta con las predicciones de SysCV.
- Preetiquetado de datasets de conduccion: el modelo puede generar cajas candidatas sobre nuevas imagenes de trafico para su revision y correccion manual, reduciendo el coste de anotacion en las diez clases del dominio.
- Deteccion en video de trafico: el script `infer.py` acepta archivos de video y procesa fotogramas de forma secuencial, lo que permite analizar grabaciones de camaras de trafico o de salpicadero para extraer conteos de vehiculos y peatones.
- Sistemas de alerta en tiempo real con webcam: la opcion `python infer.py 0 --show` habilita la inferencia sobre una camara conectada, util para prototipos de asistencia a la conduccion o vigilancia de cruces.
- Analisis de escenas diurnas y nocturnas: el autor demuestra el modelo sobre clips de validacion de dia y de noche, lo que lo hace adecuado para estudios comparativos de rendimiento segun las condiciones de iluminacion.
- Docencia y experimentacion con mmdetection: el repositorio incluye un entorno fijado (torch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2) que sirve como ejemplo reproducible de configuracion 2.x de mmdetection para practicas de vision por computador.
- Generacion de datos para pipelines de simulacion: las detecciones exportadas en formato BDD100K pueden alimentar herramientas de analitica de trafico o de reconstruccion de escenas.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (procedentes de los archivos de puntuacion de SysCV; no verificados de forma independiente por el autor del espejo mas alla de la reproduccion de cajas):

| Split | AP | AP50 | AP75 | APs | APm | APl |
|---|---|---|---|---|---|---|
| val | 34.2 | 59.2 | 33.3 | 15.4 | 40.9 | 55.7 |
| test | 32.4 | 55.7 | 32.0 | 15.6 | 39.2 | 49.8 |

AP por clase en validacion:

| Clase | AP |
|---|---|
| pedestrian | 36.2 |
| rider | 26.1 |
| car | 53.3 |
| truck | 49.2 |
| bus | 50.2 |
| train | 5.7 |
| motorcycle | 24.3 |
| bicycle | 26.9 |
| traffic light | 28.3 |
| traffic sign | 41.4 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 32,2 M de parametros y entrada de 1280x720, el checkpoint en precision completa ocupa del orden de 130 MB, pero el consumo real depende del framework y del tamano de lote.
- GPU recomendadas: no se especifican en la informacion disponible. El repositorio incluye requisitos para CUDA 11.8 y para CPU, pero el autor indica que el entorno CUDA no ha sido probado.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano reducido del modelo, aunque no se aportan mediciones concretas.
- Opciones de despliegue: mmdetection 2.28.2 con mmcv-full 1.7.2 sobre PyTorch 2.0.1, mediante el script `infer.py` incluido. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un detector de vision).
- Latencia y throughput: 1,2 s por imagen en CPU con 8 hilos; no se proporcionan cifras para GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ATSS R50-FPN 3x (este modelo) | 32,2 M | imagen 1280x720 | AP val 34.2 en BDD100K | bdd100k | Hugging Face (espejo) |
| Otros detectores del zoo SysCV BDD100K | no disponible | no disponible | no disponible | no disponible | repositorio SysCV |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos alternativos en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Licencia restrictiva: los pesos se rigen por la licencia del dataset BDD100K, limitada a uso educativo, investigacion y sin animo de lucro; el uso comercial requiere revisar los terminos en `LICENSE.txt`.
- Clase `train` practicamente inutilizable: AP de 5.7 en validacion, muy por debajo del resto de clases.
- Rendimiento modesto en objetos pequenos: APs de 15.4 en validacion, lo que limita su uso en escenarios con objetos lejanos o de baja resolucion.
- Riesgo de falsos negativos y positivos en condiciones adversas: no se documenta el rendimiento especifico por condiciones meteorologicas o de iluminacion mas alla de la demostracion cualitativa dia/noche.
- Entorno CUDA no probado por el autor del espejo; solo se verifico la inferencia en CPU, lo que introduce incertidumbre en despliegues con GPU.
- Dependencia de una version antigua de mmdetection (2.28.2) y mmcv-full (1.7.2), lo que puede dificultar la integracion en stacks modernos.
- Es un modelo de vision sin capacidades de texto, razonamiento o generacion; no debe evaluarse con los criterios habituales de los modelos de lenguaje.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.
- El autor advierte que el contenido de la model card es material de referencia y no debe interpretarse como instrucciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-atss-r50-fpn-3x
- Licencia: https://huggingface.co/dronefreak/bdd100k-syscv-atss-r50-fpn-3x/blob/main/LICENSE.txt
- Repositorio SysCV de modelos BDD100K: https://github.com/SysCV/bdd100k-models/tree/main/det
- Configuracion original de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/det/configs/det/atss_r50_fpn_3x_det_bdd100k.py
- Paper de ATSS (CVPR 2020): https://arxiv.org/abs/1912.02424
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
- Paper de BDD100K (CVPR 2020): https://arxiv.org/abs/1912.02424 (referencia de cita incluida en la model card)
