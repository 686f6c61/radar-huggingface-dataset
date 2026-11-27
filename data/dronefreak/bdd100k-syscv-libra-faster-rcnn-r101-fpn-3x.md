# dronefreak/bdd100k-syscv-libra-faster-rcnn-r101-fpn-3x

## Resumen

Libra R-CNN con backbone ResNet-101 y FPN, entrenado sobre BDD100K para deteccion de objetos en escenas de conduccion. No es un modelo de lenguaje: es un detector de objetos de dos etapas (Faster R-CNN con las mejoras de Libra R-CNN) que localiza y clasifica diez categorias de trafico (peatones, ciclistas, coches, camiones, autobuses, trenes, motocicletas, bicicletas, semaforos y senales de trafico) en imagenes a resolucion nativa 1280x720.

El checkpoint procede del zoo de modelos de SysCV (ETH Zurich) para BDD100K. El autor de este repositorio (dronefreak) lo publica como espejo porque el host original `dl.cv.ethz.ch` esta fuera de servicio: los pesos se recuperaron de una captura de Wayback Machine del 19 de febrero de 2025, y la configuracion y los resultados provienen del GitHub de SysCV. El repositorio anade un entorno fijado (Python 3.10, torch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2) y un script de inferencia para imagen, carpeta, video y webcam.

Su relevancia es practica: ofrece un baseline reproducible de deteccion en escenas de conduccion con verificacion explicita (misma MD5 que el original, reproduccion exacta de 905 cajas y puntuaciones sobre 20 imagenes de validacion) y pesos en safetensors, algo poco habitual en los zoos de mmdetection 2.x. El modelo tiene 60.754.946 parametros y un AP de caja de 32,24 en validacion segun el autor original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Libra R-CNN (Faster R-CNN de dos etapas) con backbone ResNet-101 y FPN |
| Parametros totales | 60.754.946 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen 1280x720) |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precision original; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa texto; las etiquetas de clase estan en ingles) |
| Licencia | bdd100k (educational, research and not-for-profit use); la config de SysCV es Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`), equivalente al `.pth` original; incluye `config.json`, `original_config.py` y `config.py` |

## Arquitectura y entrenamiento

Detector de dos etapas de la familia Faster R-CNN con las tres componentes de Libra R-CNN (IoU-balanced sampling, balanced feature pyramid y balanced L1 loss), pensadas para corregir el desequilibrio en muestreo, extraccion de caracteristicas y optimizacion. El backbone es ResNet-101 inicializado con pesos ImageNet (`torchvision://resnet101`), con cuello FPN y cabeza de deteccion estandar de mmdetection. La entrada es la resolucion nativa de BDD100K, 1280x720, sin redimensionado, en RGB con media y desviacion tipica de ImageNet.

El entrenamiento usa el split de entrenamiento de BDD100K (70.000 imagenes) durante 36 epocas (schedule 3x), SGD con learning rate 0,04 y weight decay 0,0001, decaimientos en las epocas 24 y 33, batch de 32 (8 GPUs x 4 imagenes) y entrenamiento multi-escala con 6 escalas entre (1280, 600) y (1280, 720). En test se aplica umbral de puntuacion 0,05, NMS con IoU 0,5 y un maximo de 100 cajas por imagen. No se documenta RLHF, DPO ni tecnicas de decodificacion especulativa, por tratarse de un modelo discriminativo de vision.

## Capacidades

- Deteccion de objetos en imagenes de escenas de conduccion con 10 clases: pedestrian, rider, car, truck, bus, train, motorcycle, bicycle, traffic light y traffic sign.
- Deteccion de cajas con puntuaciones de confianza, filtrables mediante `--score-thr` (por defecto 0,3 en el script de inferencia).
- Inferencia sobre imagen individual, carpeta de imagenes, fichero de video y webcam (`python infer.py 0 --show`).
- Exportacion de detecciones en formato BDD100K mediante `--json out.json`.
- Control de frames procesados en video con `--max-frames N`.
- Ejecucion en CPU y en GPU (entorno CUDA 11.8 disponible; el entorno CUDA no fue probado por el autor del espejo).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo generativo.

## Casos de uso

- Analisis offline de flotas y datasets de conduccion: procesar carpetas de imagenes o videos con `infer.py` para etiquetar automaticamente objetos de trafico y generar anotaciones en formato BDD100K, utiles como preetiquetado antes de revision humana.
- Baseline de investigacion en deteccion para conduccion autonoma: punto de partida reproducible (MD5 verificado, mismas predicciones que SysCV) para comparar nuevas tecnicas de deteccion sobre BDD100K con una referencia publica.
- Auditoria de escenas diurnas y nocturnas: el modelo esta entrenado sobre BDD100K, que incluye condiciones de dia y noche, y el repositorio demuestra detecciones sobre clips de validacion diurnos y nocturnos.
- Deteccion de peatones y ciclistas en sistemas de asistencia: las clases pedestrian, rider y bicycle permiten construir alertas de proximidad en imagenes de camara frontal, con la cautela de su AP moderado en clases pequenas (APs de 15,2).
- Procesado por lotes en infraestructura CPU: a 2,0 s/imagen con 8 hilos de CPU, es viable para pipelines de etiquetado no criticos en tiempo real sin necesidad de GPU.
- Prototipado de sistemas ADAS y pruebas de concepto: la integracion con mmdetection 2.28.2 permite reutilizar utilidades de visualizacion, conversion de formato y evaluacion COCO sin desarrollo adicional.
- Extraccion de estadisticas de trafico: conteo de vehiculos, autobuses y camiones por fotograma a partir del JSON de salida para analisis de aforo y composicion del trafico.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (SysCV), AP de caja estilo COCO (%) sobre BDD100K:

| Split | AP | AP50 | AP75 | APs | APm | APl |
|---|---|---|---|---|---|---|
| val | 32,2 | 56,1 | 31,4 | 15,2 | 37,4 | 53,0 |
| test | 31,5 | 54,2 | 31,6 | 15,7 | 38,2 | 47,8 |

AP por clase en validacion:

| pedestrian | rider | car | truck | bus | train | motorcycle | bicycle | traffic light | traffic sign |
|---|---|---|---|---|---|---|---|---|---|
| 34,7 | 27,8 | 52,0 | 46,9 | 49,1 | 0,0 | 25,1 | 26,0 | 24,1 | 36,7 |

El valor de 32,24 registrado en la model-index corresponde al AP de caja en validacion. La clase train obtiene 0,0, coherente con su presencia marginal en el split de validacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 60,75 M de parametros y entrada 1280x720, el peso de los pesos en fp32 ronda los 0,24 GB y el consumo dominante es el de las activaciones del backbone ResNet-101 a esa resolucion.
- GPU recomendadas: no se documentan; el autor solo confirma ejecucion en CPU y deja el entorno CUDA 11.8 sin probar. Cualquier GPU con suficiente memoria para mmdetection 2.x a 1280x720 deberia servir, pero no hay cifras publicadas.
- Cabe en GPU de consumo: no confirmado en la informacion disponible.
- Opciones de despliegue: mmdetection 2.28.2 con mmcv-full 1.7.2 y torch 2.0.1 sobre Python 3.10 (entorno `env/requirements-cu118.txt` o `env/requirements-cpu.txt`); el script `infer.py` cubre imagen, carpeta, video y webcam. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia: 2,0 s/imagen en CPU con 8 hilos. Throughput en GPU no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto/entrada | AP en BDD100K (val) | Licencia |
|---|---|---|---|---|---|
| Este modelo (Libra R-CNN R101-FPN 3x) | Libra R-CNN, dos etapas | 60,75 M | 1280x720 | 32,2 | bdd100k (solo investigacion y uso no lucrativo) |
| Faster R-CNN R101-FPN 3x (zoo SysCV) | Faster R-CNN, dos etapas | no disponible | 1280x720 | no disponible | bdd100k / Apache-2.0 (config) |
| Otros detectores del zoo SysCV (p. ej. variantes con backbone mas ligero) | una o dos etapas | no disponible | 1280x720 | no disponible | bdd100k / Apache-2.0 (config) |

No se dispone de cifras de los modelos alternativos del mismo zoo en la informacion proporcionada, por lo que la comparacion cuantitativa queda limitada al resultado de este checkpoint.

## Limitaciones y advertencias

- Licencia restrictiva: los pesos derivan de BDD100K y quedan bajo su licencia, limitada a uso educativo, de investigacion y sin animo de lucro. El uso comercial requiere revisar `LICENSE.txt` y probablemente negociar una licencia aparte.
- Rendimiento modesto en objetos pequenos: APs de 15,2 en validacion, lo que limita su uso en deteccion de senales, semaforos y peatones lejanos.
- Clase train con AP 0,0 en validacion: no es fiable para esa categoria.
- Riesgo de falsos negativos y positivos en condiciones adversas (lluvia, noche extrema, deslumbramiento); el modelo se entreno sobre BDD100K, con su distribucion geografica y de camaras, y puede degradarse fuera de ella.
- Sin capacidades generativas ni de texto: no admite instrucciones en lenguaje natural ni razonamiento; la salida son cajas y etiquetas.
- Entorno CUDA no probado por el autor del espejo; solo se verifico la inferencia en CPU.
- Stack antiguo: mmdetection 2.28.2 y mmcv-full 1.7.2 requieren un entorno aislado con Python 3.10; no es compatible con las versiones actuales de mmdetection 3.x.
- El repositorio es un espejo no oficial de pesos recuperados de Wayback Machine; la trazabilidad depende de la verificacion MD5 documentada.
- Posibles sesgos de representacion del dataset BDD100K (localizaciones, condiciones meteorologicas y tipos de vehiculo dominantes), que se trasladan al detector.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-libra-faster-rcnn-r101-fpn-3x
- Licencia BDD100K del repositorio: https://huggingface.co/dronefreak/bdd100k-syscv-libra-faster-rcnn-r101-fpn-3x/blob/main/LICENSE.txt
- Zoo de modelos SysCV para BDD100K: https://github.com/SysCV/bdd100k-models/tree/main/det
- Configuracion de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/det/configs/det/libra_faster_rcnn_r101_fpn_3x_det_bdd100k.py
- Paper de Libra R-CNN (CVPR 2019): https://arxiv.org/abs/1904.02701
- Dataset BDD100K: https://huggingface.co/datasets/dronefreak/BDD100K
