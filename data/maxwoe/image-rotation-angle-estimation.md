# maxwoe/image-rotation-angle-estimation

## Resumen

`maxwoe/image-rotation-angle-estimation` es un modelo de vision por computador especializado en estimar el angulo de rotacion de una fotografia respecto a la vertical, en el rango completo de 360 grados. Lo desarrolla el usuario de Hugging Face maxwoe y resuelve un problema clasico de preprocesado de imagenes: detectar si una foto ha sido girada (por ejemplo, por un sensor mal orientado o una manipulacion manual) para poder enderezarla automaticamente. El modelo se publica con licencia MIT y un checkpoint de aproximadamente 88 millones de parametros.

La arquitectura combina un backbone ConvNeXt V2 Base, preentrenado con el esquema FCMAE sobre ImageNet-22k e ImageNet-1k (`timm/convnextv2_base.fcmae_ft_in22k_in1k`), con una cabeza de distribucion gaussiana circular (CGD) que produce una distribucion de probabilidad sobre 360 bins de un grado. Esta formulacion evita la discontinuidad en el limite 0/360 grados que afecta a los enfoques de regresion directa.

El modelo es relevante para pipelines de vision en produccion porque ofrece un error absoluto medio de 3,71 grados sobre imagenes JPEG del conjunto de test de COCO, con un 97,3 % de predicciones dentro de 10 grados, y una inferencia de aproximadamente 0,3 segundos por imagen en CPU. La model card incluye un protocolo de evaluacion reproducible y comparaciones con alternativas como OAD-360 y la familia RightWayUp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt V2 Base con cabeza de distribucion gaussiana circular (CGD) sobre 360 bins |
| Parametros totales | 88M (segun comparativa de la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible (la model card solo documenta pesos PyTorch en precision original) |
| Idiomas soportados | no disponible (modelo de vision, independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | safetensors y codigo Python de inferencia incluido en el repositorio (2,3 GB) |

## Arquitectura y entrenamiento

El modelo usa como backbone un ConvNeXt V2 Base, una red convolucional moderna con normalizacion global response normalization (GRN) y capas ConvNeXt de tipo transformer, preentrenada con el esquema FCMAE (fully convolutional masked autoencoder) sobre ImageNet-22k y afinada en ImageNet-1k. Sobre ese backbone se anade una cabeza CGD que proyecta las caracteristicas a 360 logits, uno por grado, y los normaliza como una distribucion de probabilidad circular. La decodificacion del angulo se realiza tomando la media circular de los bins situados a menos de 10 grados del bin mas probable, lo que suaviza la prediccion respecto al argmax puro.

El entrenamiento se realizo sobre 117.372 imagenes, segun la tabla comparativa de la model card, derivadas del conjunto COCO. Cada imagen se rota por un angulo aleatorio y se recorta al mayor rectangulo sin bordes, y se guarda como JPEG (calidad 90) antes de la inferencia, replicando el caso real de fotos rotadas almacenadas en disco. La model card indica que el checkpoint publicado es una de tres ejecuciones de entrenamiento cuya media se reporta en el paper (3,76 grados con decodificacion argmax). No se detalla en la informacion disponible si hubo RLHF, DPO ni otras tecnicas de alineacion, algo por otra parte esperable en un modelo de vision.

La innovacion tecnica principal es el uso de una distribucion gaussiana circular sobre bins de un grado, que elimina la discontinuidad en 0/360 grados propia de la regresion angular directa. Ademas, el codigo de inferencia se distribuye junto con los pesos en el repositorio (`model_cgd.py`), de modo que la decodificacion exacta queda reproducible sin dependencias externas.

## Capacidades

- Estimacion del angulo de rotacion de una imagen en el rango completo [0, 360), medido en sentido antihorario.
- Prediccion de una unica imagen por llamada mediante `predict_angle`, que acepta un objeto PIL Image, un array de NumPy o una ruta de fichero.
- Salida opcional de una puntuacion de confianza entre 0 y 1 mediante `predict_angle(image, return_confidence=True)`.
- Enderezado de la imagen mediante una simple rotacion de `-angle` grados con `expand=True`.
- Funcionamiento en CPU (aproximadamente 0,3 segundos por imagen) y en GPU llamando a `model.to("cuda")`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente perceptivo de vision.
- No dispone de modo thinking, vision generativa, audio ni otras capacidades multimodales.

## Casos de uso

- Correccion automatica de orientacion en bibliotecas fotograficas: el modelo detecta el angulo de cada imagen importada y permite enderezarla antes de generar miniaturas o indexar metadatos EXIF, con un coste de 0,3 segundos por imagen en CPU que hace viable procesar lotes grandes sin GPU.
- Preprocesado en pipelines de OCR y digitalizacion de documentos: los sistemas de reconocimiento de texto pierden precision con documentos girados; aplicar este modelo antes del OCR reduce fallos en escaneos y fotografias de movil.
- Normalizacion de datasets para entrenamiento de modelos de vision: antes de alimentar un detector o un clasificador, el modelo puede corregir la orientacion de las imagenes y evitar que el modelo aprenda invariancias innecesarias o sesgos de orientacion.
- Control de calidad en plataformas de contenido generado por usuarios: detectar fotos subidas torcidas y corregirlas automaticamente o solicitar al usuario una nueva subida cuando la confianza de la prediccion sea baja.
- Procesamiento por lotes en pipelines de datos geoespaciales o de teledeteccion: las imagenes de satelite y dron pueden llegar con rotaciones arbitrarias; el modelo proporciona una estimacion angular rapida que despues se refina con metadatos de georreferenciacion.
- Integracion en aplicaciones moviles o de escritorio de edicion fotografica: la inferencia en CPU y el tamano moderado del checkpoint (2,3 GB en el repositorio, 88M de parametros) permiten ejecutarlo localmente sin depender de servicios en la nube.
- Herramienta de anotacion asistida: en flujos de etiquetado de imagenes, el modelo sugiere una orientacion inicial que el anotador puede confirmar o ajustar, reduciendo el tiempo de correccion manual.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (model-index), sobre 1.030 imagenes del conjunto de test de COCO rotadas por angulos aleatorios y recortadas al mayor rectangulo sin bordes, con medias sobre cinco conjuntos de angulos aleatorios:

| Metrica | Guardada como JPEG tras rotar | Nunca guardada tras rotar |
|---|---|---|
| Error absoluto medio | 3,71° | 4,38° |
| Error mediano | 1,11° | 1,33° |
| Dentro de 2° | 73,8 % | 66,4 % |
| Dentro de 5° | 93,9 % | 90,1 % |
| Dentro de 10° | 97,3 % | 95,9 % |
| Percentil 90 del error | 3,74° | 4,99° |
| Percentil 95 del error | 5,60° | 8,24° |
| RMSE | 17,32° | 18,24° |

El error es practicamente estable frente a la calidad JPEG: 3,81° con calidad 95 y 3,69° con calidad 75. La model card tambien documenta el efecto de la decodificacion: el argmax puro del paper obtiene 3,77° (JPEG) y 4,45° (sin guardar), mientras que la media circular de los bins a menos de 10° del maximo, usada en el codigo publicado, obtiene 3,71° y 4,38°.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita en la informacion proporcionada; con 88M de parametros en precision FP32 el checkpoint ocupa aproximadamente 350 MB, por lo que la VRAM necesaria es modesta y muy inferior a la de modelos de lenguaje de tamano comparable.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; la model card solo menciona `model.to("cuda")` sin especificar modelos concretos (A100, H100, RTX 4090 u otras).
- Compatibilidad con GPU de consumo: si, segun el tamano del modelo y el hecho de que la inferencia en CPU ya funciona a 0,3 segundos por imagen; no se detallan modelos concretos de consumer GPU.
- Opciones de despliegue: el codigo de inferencia se distribuye en el propio repositorio (`model_cgd.py`) y se instala con `torch`, `torchvision`, `pytorch-lightning`, `timm`, `huggingface_hub`, `pillow`, `numpy` y `loguru`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: aproximadamente 0,3 segundos por imagen en CPU; no se publican cifras de latencia ni throughput en GPU.

## Comparativa con modelos similares

Datos de la tabla comparativa de la model card, sobre cinco conjuntos de angulos aleatorios (5.150 vistas):

| | Este modelo | RightWayUp Max | RightWayUp Fast | OAD-360 |
|---|---|---|---|---|
| Parametros | 88M | 306M | 23M | 86M |
| Imagenes de entrenamiento | 117.372 | ~1,24 millones | ~1,24 millones | la mayor parte de COCO |
| Error mediano, guardada como JPEG | 1,11° | 1,21° | no publicado | 2,08° |
| Dentro de 2°, guardada como JPEG | 73,8 % | 69,2 % | no publicado | 48,7 % |
| Dentro de 10°, guardada como JPEG | 97,3 % | 98,4 % | 96,4 % | 93,0 % |
| Dentro de 10°, nunca guardada | 95,9 % | 98,8 % | 96,5 % | 93,1 % |
| Mas de 10° de error, guardada como JPEG | 140 | 83 | no publicado | 361 |
| Boca abajo (150° o mas de error), guardada como JPEG | 3 | no disponible en el extracto | no disponible en el extracto | no disponible en el extracto |
| Licencia | MIT | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |

## Limitaciones y advertencias

- El modelo estima un angulo unico por imagen; no maneja escenas con multiples orientaciones ni objetos individuales rotados dentro de una misma foto.
- El error angular tiene cola pesada: el RMSE (17,32°) es mucho mayor que el error absoluto medio (3,71°), lo que indica la existencia de predicciones muy desviadas en una minoria de casos. En 3 casos de 5.150 vistas el error supero los 150 grados (imagen boca abajo).
- La evaluacion se limita a fotografias de COCO; no se documenta el comportamiento en dominios como documentos escaneados, capturas de pantalla, imagenes medicas o teledeteccion.
- No se detallan sesgos conocidos ni analisis de robustez frente a dominios fuera de distribucion en la informacion proporcionada.
- El modelo no genera texto ni razona: cualquier uso que requiera interpretacion semantica de la imagen queda fuera de su alcance.
- La licencia MIT permite uso comercial sin restricciones adicionales, pero el autor no ofrece garantias sobre el rendimiento en produccion ni sobre la exactitud en dominios no evaluados.
- La decodificacion publicada (media circular de bins cercanos) difiere de la del paper (argmax), por lo que los numeros de referencia pueden no coincidir exactamente con los de la publicacion.
- El repositorio incluye codigo Python de inferencia ademas de los pesos; conviene revisar y fijar la version del codigo antes de desplegarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maxwoe/image-rotation-angle-estimation
- Demo interactiva: https://huggingface.co/spaces/maxwoe/image-rotation-angle-estimation
- Repositorio GitHub: https://github.com/maxwoe/image-rotation-angle-estimation
- Protocolo de evaluacion: https://github.com/maxwoe/image-rotation-angle-estimation/blob/main/BENCHMARK.md
- Paper: https://arxiv.org/abs/2603.25351
- Modelo base: https://huggingface.co/timm/convnextv2_base.fcmae_ft_in22k_in1k
- OAD-360 (Maji y Bose, 2020): https://github.com/pidahbus/deep-image-orientation-angle-detection
- RightWayUp (ORTUS AI, 2026): https://github.com/ortusaitech/rightwayup
