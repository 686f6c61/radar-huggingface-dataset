# dronefreak/bdd100k-syscv-faster-rcnn-hrnetv2p-w32-1x

## Resumen

Faster R-CNN con backbone HRNetV2p-W32 y cuello HRFPN, entrenado sobre el conjunto de datos BDD100K para deteccion de objetos en escenas de conduccion. No es un modelo de lenguaje: es un detector de objetos de dos etapas (two-stage) en formato MMDetection, con 46.978.306 parametros y pesos en safetensors. El repositorio es un espejo (mirror) publicado por el usuario dronefreak de un checkpoint original del model zoo de SysCV (ETH Zurich), cuyo servidor de descargas `dl.cv.ethz.ch` esta fuera de servicio; los pesos se recuperaron de la Wayback Machine a partir de una captura del 19 de febrero de 2025.

El modelo resuelve la tarea de deteccion de 10 clases de trafico (peatones, ciclistas, coches, camiones, autobuses, trenes, motocicletas, bicicletas, semaforos y senales de trafico) sobre imagenes de 1280x720, que es la resolucion nativa de BDD100K sin reescalado. Es relevante ahora porque el espejo anade un entorno de dependencias fijado (torch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2 sobre Python 3.10) y un script de inferencia, lo que permite reproducir el checkpoint original cuando la fuente primaria ya no esta disponible.

Se trata de un artefacto de investigacion mas que de un modelo listo para produccion: la licencia BDD100K restringe el uso a fines educativos, de investigacion y sin animo de lucro, y el propio autor documenta una discrepancia menor de reproducibilidad (697 de 698 cajas identicas en una muestra de 20 imagenes de validacion). El checkpoint declara 32.84 de box AP en validacion, valor reportado por SysCV y no verificado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Faster R-CNN (two-stage) con backbone HRNetV2p-W32 y cuello HRFPN |
| Parametros totales | 46.978.306 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen 1280x720) |
| Tipos de cuantizacion | no disponible (solo pesos completos en safetensors) |
| Idiomas soportados | no aplica (modelo de vision, sin capacidades linguisticas) |
| Licencia | BDD100K (educational, research, not-for-profit); config de SysCV Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`), equivalente al `.pth` original; config en `config.json` y `original_config.py` |
| Libreria | mmdetection 2.28.2 (mmcv-full 1.7.2, torch 2.0.1, Python 3.10) |
| Tarea (pipeline) | object-detection |
| Tamano del repositorio | 0.6 GB |
| Clases detectadas | 10: pedestrian, rider, car, truck, bus, train, motorcycle, bicycle, traffic light, traffic sign |

## Arquitectura y entrenamiento

Faster R-CNN es un detector de dos etapas: una red de propuesta de regiones (RPN) genera candidatos y una cabeza de clasificacion y regresion de cajas los refina. El backbone es HRNetV2p-W32, que mantiene representaciones de alta resolucion en paralelo a lo largo de toda la red en lugar de recuperarlas por upsampling, lo que resulta ventajoso para objetos pequenos en imagenes de alta resolucion. El cuello HRFPN agrega las distintas ramas de HRNet antes de la cabeza de deteccion. La inicializacion del backbone parte de pesos ImageNet (`open-mmlab://msra/hrnetv2_w32`).

El entrenamiento usó el split de entrenamiento de BDD100K (70.000 imagenes) durante 12 epocas (esquema 1x), con SGD de learning rate 0.02, weight decay 0.0001, decaimiento del learning rate en las epocas 8 y 11, y batch de 32 (8 GPUs x 2 imagenes, segun el README de SysCV). La entrada es de 1280x720, tamano nativo de BDD100K sin reescalado, en RGB con media y desviacion tipica de ImageNet. En test se aplica umbral de score 0.05, NMS con IoU 0.5 y un maximo de 100 cajas por imagen. No se documenta RLHF, DPO ni tecnicas de decodificacion especulativa, por tratarse de un modelo de vision.

## Capacidades

- Deteccion de objetos en escenas de conduccion para 10 clases de trafico (peatones, riders, coches, camiones, autobuses, trenes, motocicletas, bicicletas, semaforos y senales).
- Deteccion multi-escala en imagenes de alta resolucion (1280x720) sin reescalado, gracias al backbone HRNetV2p-W32.
- Inferencia sobre imagen individual, carpeta de imagenes, fichero de video y webcam, mediante el script `infer.py` incluido.
- Exportacion de detecciones en formato BDD100K (`--json out.json`).
- Umbral de score configurable (`--score-thr`, por defecto 0.3) y limite de frames para video (`--max-frames`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es exclusivamente un detector de objetos.
- No dispone de modo thinking, vision multimodal ni audio.

## Casos de uso

- Investigacion en deteccion para conduccion autonoma: sirve como baseline reproducible sobre BDD100K para comparar nuevas arquitecturas o estrategias de entrenamiento, con la ventaja de que el entorno de dependencias esta fijado y los pesos son verificables por MD5.
- Reproduccion de resultados academicos: al recuperar un checkpoint cuyo host original esta caido, permite re-ejecutar experimentos de articulos que citan el model zoo de SysCV sin depender de `dl.cv.ethz.ch`.
- Prototipado de sistemas de asistencia a la conduccion: deteccion de peatones, vehiculos y senales en clips de video de dia y de noche, con salida en formato BDD100K lista para analisis posterior.
- Auditoria y validacion de pipelines de deteccion: el script `infer.py` acepta imagenes, video y webcam, lo que facilita comparar detecciones contra anotaciones o contra otros detectores en un mismo conjunto de validacion.
- Generacion de pseudo-etiquetas: con umbral de score ajustable, el modelo puede producir etiquetas debiles sobre imagenes no anotadas de dominio similar para preentrenar o aumentar otros detectores.
- Analisis de escenas urbanas en video: al procesar ficheros de video con `--max-frames`, permite estudiar la evolucion temporal de detecciones (por ejemplo, presencia de semaforos o senales) en secuencias de BDD100K.
- Docencia en vision por computador: ejemplo completo de detector two-stage con HRNet en MMDetection, con configuracion original y pesos equivalentes, util para practicas de deteccion de objetos.

## Benchmarks y rendimiento

Resultados reportados por SysCV (box AP en estilo COCO, %) sobre BDD100K, segun los ficheros de score del autor original:

| Split | AP | AP50 | AP75 | APs | APm | APl |
|---|---|---|---|---|---|---|
| val | 32.8 | 58.2 | 31.3 | 15.8 | 37.5 | 53.8 |
| test | 31.8 | 55.3 | 31.4 | 16.6 | 38.3 | 49.1 |

AP por clase en validacion:

| Clase | AP |
|---|---|
| pedestrian | 36.2 |
| rider | 26.9 |
| car | 52.6 |
| truck | 47.0 |
| bus | 48.6 |
| train | 0.0 |
| motorcycle | 25.1 |
| bicycle | 25.8 |
| traffic light | 26.0 |
| traffic sign | 40.1 |

El valor declarado en el model-index es 32.84 de box AP en validacion, marcado como no verificado (`verified: false`). El autor del espejo documenta una comprobacion de reproducibilidad: sobre 20 imagenes aleatorias de validacion, 697 de las 698 cajas publicadas por SysCV son identicas en esta copia (ejecucion en CPU), las 698 coinciden con IoU >= 0.5, y la mayor diferencia de score es 0.0112; la causa no se investigo. El MD5 de los pesos (`c5560d0978b0cd6a5341226fbf414933`) coincide con el fichero MD5 de SysCV y todas las claves cargan en la configuracion original. El entorno CUDA no se ha probado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 46,98 millones de parametros y entrada de 1280x720, el modelo es ligero y cabe holgadamente en GPUs de consumo, aunque el autor no publica cifras de memoria.
- GPU recomendadas: no especificadas por el autor; el entorno incluye requisitos para CUDA 11.8 (`env/requirements-cu118.txt`) y una variante solo CPU (`env/requirements-cpu.txt`).
- GPU de consumo: previsiblemente compatible con tarjetas de gama media y alta por el tamano del modelo, si bien no hay mediciones publicadas.
- Despliegue: MMDetection 2.28.2 con mmcv-full 1.7.2 y torch 2.0.1 sobre Python 3.10; el script `infer.py` cubre imagen, carpeta, video y webcam. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia: 2,0 segundos por imagen en 8 hilos de CPU, segun la model card. No hay datos de throughput en GPU.
- Carga de pesos: compatible con `torch.load(weights_only=True)`.

## Comparativa con modelos similares

No se han publicado en la informacion disponible comparaciones con otros detectores sobre BDD100K (por ejemplo, variantes de YOLO, RetinaNet o DETR entrenadas en el mismo conjunto), por lo que la comparativa cuantitativa se considera no disponible. A nivel cualitativo, este checkpoint se diferencia de alternativas modernas en que es un detector two-stage con backbone HRNet, formato MMDetection 2.x y licencia BDD100K restringida a investigacion, mientras que muchos detectores actuales se distribuyen con licencias permisivas y stacks mas recientes.

| Modelo | Parametros | Contexto/entrada | AP en BDD100K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Faster R-CNN HRNetV2p-W32-HRFPN 1x) | 46.978.306 | imagen 1280x720 | 32.84 (val, reportado) | BDD100K (solo investigacion) | Hugging Face (espejo) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia restrictiva: los pesos derivan de BDD100K y quedan bajo la licencia BDD100K, limitada a uso educativo, de investigacion y sin animo de lucro; no se permite uso comercial sin autorizacion. La config de SysCV es Apache-2.0, pero eso no cubre los pesos.
- Clase `train` con AP 0.0 en validacion: el modelo no detecta trenes de forma util, probablemente por escasez de ejemplos; no debe usarse para esa clase.
- Rendimiento modesto en objetos pequenos (APs 15.8 en validacion) y en clases minoritarias (motorcycle 25.1, bicycle 25.8, traffic light 26.0), lo que limita su uso en escenarios con objetos lejanos o de baja frecuencia.
- Reproducibilidad no exacta: 1 de 698 cajas difiere respecto al original en la muestra verificada, con diferencias de score de hasta 0.0112; la causa no se investigo.
- Entorno CUDA no probado por el autor del espejo; solo se valido la inferencia en CPU.
- Dependencias antiguas y fragiles: mmdetection 2.28.2 y mmcv-full 1.7.2 requieren un entorno virtual limpio con Python 3.10; no es compatible con stacks modernos de MMDetection 3.x.
- Sesgos del conjunto de datos: BDD100K esta sesgado geograficamente (principalmente Estados Unidos) y hacia condiciones de conduccion concretas; el rendimiento puede degradarse en otros paises, condiciones meteorologicas extremas o camaras con distinta calibracion.
- Riesgo de falsos positivos y negativos en escenas nocturnas o con baja iluminacion, no cuantificado en la informacion disponible.
- No es un modelo generativo: no alucina texto, pero puede producir detecciones espurias con scores bajos; el umbral por defecto de 0.3 en `infer.py` difiere del 0.05 usado en la evaluacion, lo que afecta a la comparacion directa con las cifras publicadas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su fecha de creacion es posterior a la de la captura de la Wayback Machine; conviene verificar la integridad por MD5 antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-faster-rcnn-hrnetv2p-w32-1x
- Licencia del modelo (LICENSE.txt): https://huggingface.co/dronefreak/bdd100k-syscv-faster-rcnn-hrnetv2p-w32-1x/blob/main/LICENSE.txt
- Model zoo de SysCV (BDD100K models, deteccion): https://github.com/SysCV/bdd100k-models/tree/main/det
- Configuracion original de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/det/configs/det/faster_rcnn_hrnetv2p_w32_1x_det_bdd100k.py
- Paper de HRNet (Deep High-Resolution Representation Learning for Visual Recognition): https://arxiv.org/abs/1908.07919
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
