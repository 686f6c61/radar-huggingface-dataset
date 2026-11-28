# dronefreak/bdd100k-syscv-dla60-5x-224x224-weather

## Resumen

DLA-60 Weather Tagging es un clasificador de imágenes especializado en etiquetar las condiciones meteorológicas de escenas de conducción. El modelo asigna a cada fotograma una de siete etiquetas: rainy, snowy, clear, overcast, undefined, partly cloudy o foggy. Lo desarrolla SysCV (ETH Zurich) como parte de su model zoo para BDD100K, y esta ficha corresponde a un espejo publicado por el usuario dronefreak que recupera los pesos originales desde la Wayback Machine, ya que el host oficial `dl.cv.ethz.ch` está fuera de servicio.

Arquitectura DLA-60 (Deep Layer Aggregation, CVPR 2018) con una cabeza de clasificación lineal, 21,36 millones de parámetros y entrada de 224x224 píxeles. Se entrenó sobre las 70.000 imágenes del split de entrenamiento de BDD100K durante 60 épocas (esquema 5x), sin pesos preentrenados en el backbone. Es un modelo pequeño y rápido: 5 ms por imagen en una RTX 4070 SUPER y 30 ms por imagen en CPU con 8 hilos.

Su relevancia práctica es doble: por un lado, cubre una tarea de etiquetado auxiliar muy concreta en pipelines de conducción autónoma (filtrar o estratificar escenas por climatología); por otro, el espejo incluye verificación de reproducción exacta frente a las predicciones originales de SysCV, lo que lo convierte en una referencia fiable para investigación reproducible cuando el repositorio original no está accesible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DLA-60 (Deep Layer Aggregation, CVPR 2018) + ClsHead lineal |
| Parametros totales | 21.359.927 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no aplica (clasificacion de imagen, entrada 224x224) |
| Tipos de cuantizacion | no disponible (pesos en safetensors y .pth, sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | no aplica (clasificacion visual; etiquetas en ingles) |
| Licencia | BDD100K (uso educativo, investigacion y sin animo de lucro); codigo de config y DLA bajo Apache-2.0 |
| Formato de pesos | safetensors (principal) y .pth equivalente |
| Libreria | mmcls 0.25.0, mmcv-full 1.7.2, PyTorch 2.0.1, Python 3.10 |
| Entrada | lado corto redimensionado a 256, recorte central 224x224, RGB, media y desviacion estandar de ImageNet |
| Clases | 7 (rainy, snowy, clear, overcast, undefined, partly cloudy, foggy) |
| Dataset de entrenamiento | BDD100K train (70.000 imagenes) |
| Tamano del repo | 0,2 GB |

## Arquitectura y entrenamiento

El modelo es un clasificador de imagen estandar construido sobre el backbone DLA-60, una red convolucional con agregacion jerarquica de capas profundas que combina conexiones residuales y de agregacion semantica para mejorar el flujo de gradiente y la reutilizacion de caracteristicas. Sobre el backbone se monta una cabeza de clasificacion lineal (ClsHead) que produce logits para las siete clases meteorologicas. No hay mecanismos de atencion, MoE ni decodificacion especulativa: es una CNN pura de vision.

El entrenamiento parte de BDD100K train (70.000 imagenes) durante 60 epocas (esquema 5x), con SGD (lr 0.1, momentum 0.9, weight decay 0.0001), decaimiento del learning rate en las epocas 30 y 45, batch de 128 (4 GPUs x 32 imagenes) y aumento de datos basado en recortes aleatorios redimensionados a 224x224 y volteos horizontales. El config no fija pesos preentrenados para el backbone, por lo que DLA-60 se entrena desde cero sobre la tarea. No se documenta RLHF, DPO ni ajuste por preferencias, algo esperable en un clasificador.

## Capacidades

- Clasificacion de imagenes de escenas de conduccion en siete categorias meteorologicas con una unica etiqueta por imagen.
- Salida de puntuaciones por clase (logits/probabilidades) mediante la opcion `--json`, util para umbralizar o combinar con otros modelos.
- Inferencia sobre imagen suelta, carpeta de imagenes, fichero de video o webcam a traves de `infer.py`.
- Extraccion de etiquetas por fotograma en clips de video, con control de numero maximo de frames (`--max-frames`).
- Ejecucion en GPU (CUDA 11.8) y en CPU con entorno reproducible fijado.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, texto, audio ni vision general: es exclusivamente un clasificador visual de dominio acotado.

## Casos de uso

- Etiquetado automatico de datasets de conduccion: procesar grandes volumnes de imagenes de dashcam y anadir la etiqueta meteorologica como metadato, aprovechando los 5 ms por imagen en GPU para lotes de decenas de miles de fotogramas.
- Estratificacion de benchmarks por climatologia: separar los conjuntos de evaluacion en subconjuntos clear, rainy, snowy, foggy u overcast para medir la robustez de detectores o segmentadores bajo distintas condiciones.
- Filtrado previo en pipelines de percepcion: descartar o marcar fotogramas con meteorologia adversa antes de pasarlos a modelos mas costosos, reduciendo computo en escenarios de niebla o nieve.
- Analisis de flotas y telemetria: etiquetar grabaciones de vehiculos para generar informes de exposicion a condiciones meteorologicas por ruta o franja horaria.
- Curacion de datos para reentrenamiento: seleccionar ejemplos equilibrados por clase meteorologica al construir datasets de entrenamiento para tareas posteriores.
- Investigacion reproducible en vision para conduccion: usar el espejo verificado como baseline exacto de SysCV cuando el host original no esta disponible, comparando nuevas propuestas contra las predicciones publicadas.
- Prototipado rapido en CPU: desplegar el modelo en entornos sin GPU (30 ms por imagen en 8 hilos) para demos o validaciones puntuales.

## Benchmarks y rendimiento

Resultados declarados por SysCV (recogidos en la model card del espejo). Precision, recall y F1 son medias macro sobre las 7 clases, incluida `undefined`.

| Split | Top-1 accuracy | Precision | Recall | F1 |
|---|---|---|---|---|
| val | 79,99 % | 63,72 % | 59,28 % | 61,06 % |
| test | 79,65 % | 73,70 % | 59,49 % | 62,27 % |

Verificacion del espejo: sobre las 10.000 imagenes de validacion, la etiqueta coincide con las predicciones publicadas por SysCV para todas las imagenes y las puntuaciones por clase coinciden con un margen de 8e-06 en GPU (RTX 4070 SUPER, CUDA 11.8, TF32 desactivado). En CPU, sobre 20 imagenes, la diferencia maxima de puntuacion es 2e-06. El MD5 de los pesos (`3ee5163237751e42b26aae24c8cc3d05`) coincide con el fichero MD5 de SysCV.

No se han publicado en la informacion disponible resultados comparativos con otros clasificadores meteorologicos sobre BDD100K.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (21,36 M de parametros, aproximadamente 85 MB de pesos, mas activaciones de un forward a 224x224). Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con CUDA 11.8 o superior; el autor reporta 0,005 s/imagen en una RTX 4070 SUPER (incluyendo decodificacion JPEG). Para lotes grandes, A100, H100, L4 o RTX 4090 aportan margen de sobra.
- Cabe en GPU consumer: si, incluidas GTX 10xx, RTX 20xx/30xx/40xx y GPUs integradas con suficiente memoria compartida.
- CPU: 0,03 s/imagen con 8 hilos, viable para procesamiento por lotes moderado.
- Opciones de despliegue: script `infer.py` incluido (imagen, carpeta, video o webcam); el modelo es compatible con el ecosistema mmcls/mmcv, por lo que puede servirse con TorchServe o exportarse a TorchScript/ONNX (no se documenta exportacion oficial). No hay soporte nativo en vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput estimados: ~200 imagenes/s en RTX 4070 SUPER y ~33 imagenes/s en CPU de 8 hilos, segun las cifras del autor.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de otros clasificadores meteorologicos sobre BDD100K con los que comparar parametros, contexto o rendimiento. Como referencia cualitativa, el propio model zoo de SysCV incluye variantes de backbone (por ejemplo, ResNet) para la misma tarea, pero no se aportan sus cifras en esta ficha.

| Modelo | Parametros | Entrada | Top-1 val (weather) | Licencia |
|---|---|---|---|---|
| DLA-60 weather (este modelo) | 21,36 M | 224x224 | 79,99 % | BDD100K |
| Otras variantes del zoo SysCV | no disponible | no disponible | no disponible | Apache-2.0 / BDD100K |

## Limitaciones y advertencias

- Sesgos derivados del dataset: BDD100K esta capturado en su mayoria en Estados Unidos y en condiciones de iluminacion y climatologia concretas; el rendimiento puede degradarse en otras regiones, camaras o condiciones extremas.
- Clase `undefined`: el modelo puede asignar esta etiqueta cuando la escena no encaja claramente en ninguna categoria, lo que reduce la precision macro (63,72 % en val frente al 79,99 % de top-1).
- Riesgo de confusion entre clases visualmente proximas (overcast frente a partly cloudy, o rainy frente a foggy) en imagenes de baja calidad o con reflejos.
- Entrada fija: recorte central 224x224 tras redimensionar el lado corto a 256; objetos pequenos o condiciones en los bordes de la imagen pueden perderse.
- Licencia BDD100K: uso educativo, de investigacion y sin animo de lucro. El uso comercial requiere revisar los terminos del dataset original; el codigo de config y DLA es Apache-2.0, pero los pesos entrenados sobre BDD100K heredan la restriccion.
- Modelo de vision acotado: no procesa texto, no razona y no admite instrucciones; cualquier uso fuera de clasificacion meteorologica de escenas de conduccion queda fuera de su dominio.
- Entorno fijado a versiones antiguas (PyTorch 2.0.1, mmcv-full 1.7.2, mmcls 0.25.0, Python 3.10); mezclar con entornos modernos puede romper la carga de pesos.
- Es un espejo no oficial: aunque verificado contra las predicciones de SysCV, la procedencia de los pesos es una captura de Wayback Machine y no el host original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-dla60-5x-224x224-weather
- Repositorio SysCV BDD100K models: https://github.com/SysCV/bdd100k-models/tree/main/tagging
- Config original de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/tagging/configs/weather/dla60_5x_224x224_weather_tag_bdd100k.py
- Paper DLA (Deep Layer Aggregation, CVPR 2018): https://arxiv.org/abs/1707.06484
- Paper BDD100K (CVPR 2020): https://arxiv.org/abs/1805.04687
- Licencia BDD100K: https://huggingface.co/dronefreak/bdd100k-syscv-dla60-5x-224x224-weather/blob/main/LICENSE.txt
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
