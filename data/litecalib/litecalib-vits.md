# LiteCalib/litecalib-vits

## Resumen

LiteCalib VITS es un modelo de visión por computador especializado en calibración de cámara de vista única (single-view camera calibration). Lo desarrolla el equipo de LiteCalib (Viktor Kocur, Lukáš Bujňák, Lukáš Gajdošech, Torsten Sattler y Zuzana Kukelova) y se publica bajo licencia Apache 2.0. El modelo predice el campo de visión de la cámara en una rejilla de 5 x 5 puntos de la imagen, a partir de la cual se ajusta cualquier modelo de cámara con simetría radial. Con 26.853.230 parámetros, es un modelo compacto orientado a inferencia de baja latencia.

La arquitectura se apoya en un backbone DINOv2 ViT-S/14, afinado específicamente para la tarea de calibración. La propuesta resuelve un problema clásico de visión por computador: estimar los parámetros intrínsecos de una cámara (distancia focal, punto principal y distorsión) a partir de una sola imagen, sin necesidad de patrones de calibración ni de múltiples vistas. Frente a enfoques anteriores como GeoCalib o AnyCalib, LiteCalib se presenta como una alternativa "model-agnostic" y rápida, con tiempos de inferencia de milisegundos.

Su relevancia actual radica en el rendimiento en tiempo real: 6,3 ms por imagen en una NVIDIA A100 en fp16 (red + ajuste) y 12,3 ms en una Jetson Orin Nano de 8 GB con TensorRT fp16. Esto lo hace apto para robótica, vehículos autónomos y pipelines de fotogrametría donde la calibración debe resolverse en el dispositivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ViT-S/14 (backbone DINOv2) con cabeza de predicción de campo de visión en rejilla 5 x 5 |
| Parametros totales | 26.853.230 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; entrada de imagen de aproximadamente 102.400 píxeles) |
| Tipos de cuantizacion | fp16 (PyTorch); TensorRT fp16 (exportación); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible (modelo de visión, no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de los pesos de DINOv2 ViT-S/14 y se afina durante 24 épocas con un schedule warmup-stable-decay. Cada época comprende 144.000 vistas: 72.000 renderizadas a partir de panoramas y 72.000 procedentes de MegaScenes. La entrada se procesa a una resolución de aproximadamente 102.400 píxeles con relaciones de aspecto entre 0,5 y 2, aplicando las augmentaciones fotométricas de AnyCalib. La salida es el campo de visión de la cámara en una rejilla de 5 x 5 puntos de la imagen, sobre la que se ajusta posteriormente cualquier modelo de cámara radialmente simétrico (pinhole, Brown-Conrady `radial:1`, EUCM).

Los datos de entrenamiento combinan panoramas de OpenPano (versión extendida de AnyCalib, 3.651/202 panoramas de entrenamiento/validación, 51.719/2.872 vistas), CommonsPano (3.474/272 panoramas, 55.406/4.346 vistas), la parte share-alike de CommonsPano (5.862/283 panoramas, 93.220/4.505 vistas) y MegaScenes (14.382/160 escenas, 1.211.520/10.779 vistas). Las vistas panorámicas se renderizan como perspectivas y distorsionadas de 640 x 640 con el muestreo de cámara `OP_g` de AnyCalib, punto principal centrado y píxeles cuadrados. MegaScenes se recorta a 1:1, 4:3 o 3:2 con lado corto de 600 px y se excluyen reconstrucciones con menos de 20 fotos, autocalibraciones fallidas y las escenas de los landmarks de evaluación de MegaDepth. No se documenta en la información disponible el uso de RLHF o DPO, algo esperable en un modelo de regresión geométrica.

## Capacidades

- Predicción de parámetros intrínsecos de cámara a partir de una sola imagen: campo de visión en rejilla 5 x 5 y ajuste de modelos radialmente simétricos.
- Soporte de múltiples modelos de cámara: pinhole, Brown-Conrady (`radial:1`) y EUCM, entre otros radialmente simétricos.
- Estimación de matriz intrínseca `K` y coeficientes de distorsión (`calib.K`, `calib.distortion`).
- Funcionamiento sin patrón de calibración ni múltiples vistas.
- Inferencia de baja latencia apta para despliegue en el borde (Jetson Orin Nano).
- No soporta tool calling, agentes, generación de texto, código, matemáticas ni capacidades multilingües: es un modelo puramente visual de regresión geométrica.
- No dispone de modo thinking, visión generativa, audio ni otras capacidades multimodales más allá del procesamiento de imagen.

## Casos de uso

- Robótica móvil y drones: calibrar la cámara a bordo en tiempo real (12,3 ms en Jetson Orin Nano con TensorRT fp16) para corregir la distorsión antes de tareas de odometría visual o SLAM, sin necesidad de patrones físicos.
- Vehículos autónomos y ADAS: estimar intrínsecos de cámaras de producción en línea de montaje o tras sustitución de un módulo, validando el campo de visión vertical (error mediano de 3,75°) contra la especificación del fabricante.
- Fotogrametría y reconstrucción 3D: inicializar los intrínsecos de COLMAP o pipelines SfM con una sola imagen por cámara, reduciendo el tiempo de autocalibración en reconstrucciones de gran escala (MegaScenes, Stanford2D3D).
- Realidad aumentada y mixta: calibrar cámaras de dispositivos móviles o gafas en el momento de la captura para alinear contenido virtual con la escena, aprovechando la latencia de 6,3 ms en A100 y la naturaleza model-agnostic del ajuste.
- Procesamiento de archivos fotográficos y patrimoniales: recuperar los intrínsecos de fotografías de Wikimedia Commons o de colecciones históricas (MegaScenes, InFlux) para tareas de análisis geométrico y metadatos.
- Vigilancia y cámaras IP: recalibrar automáticamente cámaras fijas tras vibraciones o reajustes mecánicos, usando una única imagen y el modelo de distorsión radial adecuado (pinhole o Brown-Conrady).
- Integración en pipelines de visión industrial: como paso previo a la inspección dimensional o a la detección de objetos, normalizando imágenes de cámaras con distorsión desconocida.

## Benchmarks y rendimiento

Resultados promediados sobre los diez benchmarks del paper (Stanford2D3D, TartanAir, MegaDepth, LaMAR, MegaDepth-radial, ScanNet++, Mono, Cathedral, InFlux e InFlux++), cada imagen ajustada con el modelo de cámara de su benchmark:

| Metrica | Valor |
|---|---|
| Error angular mediano | 1,75° |
| Error angular mAA@5° | 62,2 % |
| Error de vFoV mediano | 3,75° |
| Error de vFoV mAA@5° | 39,1 % |

Tiempos de ejecución por imagen (batch 1, red + ajuste de cámara):

| Dispositivo | Red | Ajuste | Total |
|---|---|---|---|
| NVIDIA A100, PyTorch fp16 | 6,0 ms | 0,4 ms (CPU) | 6,3 ms |
| Jetson Orin Nano 8 GB (15 W), TensorRT fp16 | 10,0 ms | 2,3 ms (CPU) | 12,3 ms |

No se han publicado en la información disponible resultados desglosados por benchmark individual ni comparativas numéricas directas con GeoCalib o AnyCalib.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 26,85 M de parámetros; en fp16 ocupa aproximadamente 54 MB de pesos, por lo que cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: NVIDIA A100 (6,0 ms de red en fp16), Jetson Orin Nano 8 GB (10,0 ms con TensorRT fp16). Cualquier GPU moderna (RTX 3060 en adelante, T4, L4) es suficiente para inferencia en tiempo real.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 4 GB de VRAM; el cuello de botella es el ajuste de cámara en CPU (0,4 ms en A100, 2,3 ms en Jetson).
- Opciones de despliegue: PyTorch (fp16), exportación a TensorRT (el paquete no construye el motor TensorRT; debe generarse aparte), paquete `litecalib` vía `pip install litecalib`. No se documentan soportes para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: 6,3 ms por imagen en A100 (batch 1) y 12,3 ms en Jetson Orin Nano; el throughput en batch mayor no está documentado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Error angular mediano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LiteCalib VITS | 26,85 M | imagen ~102.400 px | 1,75° (media 10 benchmarks) | Apache 2.0 | Hugging Face + pip |
| GeoCalib | no disponible | imagen | no disponible | no disponible | GitHub (cvg/GeoCalib) |
| AnyCalib | no disponible | imagen | no disponible | no disponible | GitHub (javrtg/AnyCalib) |

No se dispone en la información proporcionada de los parámetros, la licencia ni los resultados numéricos de GeoCalib y AnyCalib, por lo que la comparación cuantitativa directa no está disponible. LiteCalib se distingue por su enfoque model-agnostic (predice el campo de visión en rejilla y ajusta cualquier modelo radial) y por su latencia de milisegundos en el borde.

## Limitaciones y advertencias

- Solo cubre modelos de cámara radialmente simétricos (pinhole, Brown-Conrady `radial:1`, EUCM); no modela distorsiones no radiales ni cámaras con píxeles no cuadrados.
- Asume punto principal centrado y píxeles cuadrados en el entrenamiento, lo que puede degradar la precisión en cámaras con punto principal descentrado.
- El error de vFoV mediano es de 3,75° y el mAA@5° de vFoV solo alcanza el 39,1 %, sensiblemente peor que el error angular; conviene validar el campo de visión vertical en aplicaciones críticas.
- Riesgo de alucinación geométrica: en imágenes sin estructura o con texturas repetitivas puede producir intrínsecos plausibles pero incorrectos; no se documentan métricas de calibración de incertidumbre.
- No procesa texto ni lenguaje: no es apto para tareas de NLP, agentes o tool calling.
- Sesgos de dominio: entrenado con panoramas (OpenPano, CommonsPano) y fotos de Wikimedia Commons (MegaScenes), lo que puede introducir sesgo hacia escenas interiores, paisajes y fotografías de dominio público frente a imágenes industriales o médicas.
- La licencia Apache 2.0 permite uso comercial, pero los datos de entrenamiento tienen licencias por fuente (CC BY-SA, CC BY, CC0, dominio público); conviene revisar la atribución de CommonsPano y MegaScenes si se redistribuyen derivados.
- El paquete no construye el motor TensorRT para Jetson; el despliegue en el borde requiere exportación manual.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validación comunitaria aún incipientes.

## Enlaces

- Hugging Face: https://huggingface.co/LiteCalib/litecalib-vits
- Repositorio de código, documentación y entrenamiento: https://github.com/kocurvik/litecalib
- Dataset CommonsPano: https://huggingface.co/datasets/LiteCalib/CommonsPano
- GeoCalib (origen de OpenPano): https://github.com/cvg/GeoCalib
- AnyCalib (OpenPano extendido): https://github.com/javrtg/AnyCalib
- MegaScenes: https://megascenes.github.io
- The Laval Photometric Indoor HDR Dataset: http://hdrdb.com/indoor-hdr-photometric/
- PolyHaven: https://polyhaven.com/hdris
- HDRMaps: https://hdrmaps.com/freebies/free-hdris/
- AmbientCG: https://ambientcg.com/list?type=hdri&sort=popular
- BlenderKit: https://www.blenderkit.com/asset-gallery?query=category_subtree:hdr
