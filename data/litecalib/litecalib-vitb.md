# LiteCalib/litecalib-vitb

## Resumen

LiteCalib es un modelo de visión por computador especializado en calibración de cámara de vista única (single-view camera calibration). Dado un único image, predice el campo de visión de la cámara en una rejilla de 5 x 5 puntos de la imagen, a partir de la cual se ajusta cualquier modelo de cámara radialmente simétrico. Lo desarrollan Viktor Kocur, Lukáš Bujňák, Lukáš Gajdošech, Torsten Sattler y Zuzana Kukelova, y esta variante concreta (`litecalib-vitb`) usa un backbone DINOv2 ViT-B/14 con 105.610.862 parámetros totales.

El modelo resuelve un problema clásico de visión: estimar los parámetros intrínsecos de una cámara (distancia focal, punto principal, distorsión) sin necesidad de patrones de calibración ni de múltiples vistas. Su enfoque es agnóstico al modelo de cámara: predice un campo de rayos denso y luego ajusta el modelo radialmente simétrico que el usuario elija (pinhole, Brown-Conrady `radial:1`, EUCM, etc.). Esto lo hace relevante para pipelines de fotogrametría, SLAM, realidad aumentada y procesamiento de imágenes de fuentes no controladas.

La propuesta de valor es la velocidad y el coste: 6,6 ms por imagen en una A100 en fp16 (red + ajuste) y 27,1 ms en una Jetson Orin Nano de 8 GB con TensorRT, con un error angular mediano de 1,50° promediado sobre diez benchmarks. El repo pesa 0,4 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ViT (DINOv2 ViT-B/14 como backbone) con cabeza de predicción de campo de visión y ajuste posterior de modelo de cámara |
| Parametros totales | 105.610.862 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de imagen, resolución de entrenamiento ~102.400 píxeles, relación de aspecto 0,5 a 2) |
| Tipos de cuantizacion | no disponible (el autor reporta fp16 en PyTorch y TensorRT fp16; no se documentan GGUF, INT8 ni otras) |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `litecalib`) |

## Arquitectura y entrenamiento

El modelo es un transformer de visión basado en DINOv2 ViT-B/14, afinado para predecir el campo de visión de la cámara en una rejilla de 5 x 5 puntos de la imagen. A partir de esa predicción densa, un ajuste posterior (0,3 ms en CPU en A100, 4,2 ms en Jetson Orin Nano) estima los parámetros del modelo de cámara radialmente simétrico seleccionado por el usuario. La innovación principal es la separación entre la predicción neuronal del campo de rayos y el ajuste geométrico, lo que permite usar el mismo modelo con distintos modelos de cámara sin reentrenar.

El entrenamiento parte de los pesos de DINOv2 y se extiende durante 24 épocas con un schedule warmup-stable-decay, con 144.000 vistas por época: 72.000 renderizadas desde panoramas (OpenPano extendido por AnyCalib y CommonsPano) y 72.000 de MegaScenes. Las vistas panorámicas son perspectivas y distorsionadas de 640 x 640 generadas con el muestreo de cámara `OP_g` de AnyCalib, con punto principal centrado y píxeles cuadrados. Los datos cubren tres familias de cámara (pinhole, Brown-Conrady `radial:1` y EUCM, aproximadamente un tercio cada una). Se aplican las resoluciones y aumentaciones fotométricas de AnyCalib. No se documenta RLHF ni DPO (no aplica a este tipo de modelo).

## Capacidades

- Calibración de cámara de vista única: estima distancia focal, punto principal y parámetros de distorsión a partir de una sola imagen.
- Predicción de campo de visión en una rejilla de 5 x 5 puntos de la imagen.
- Ajuste a múltiples modelos de cámara radialmente simétricos: pinhole, Brown-Conrady (`radial:1`), EUCM y otros compatibles con el ajuste.
- Independencia del modelo de cámara: el mismo modelo neuronal sirve para distintos modelos geométricos.
- Inferencia rápida: 6,6 ms por imagen en A100 (fp16) y 27,1 ms en Jetson Orin Nano 8 GB (TensorRT fp16).
- Exportación a TensorRT para despliegue en dispositivos embebidos.
- API Python sencilla mediante el paquete `litecalib` (`load`, `calibrate`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades lingüísticas: es un modelo puramente de visión.

## Casos de uso

- Fotogrametría y reconstrucción 3D: calibrar imágenes individuales de fuentes no controladas (Wikimedia Commons, archivos históricos) antes de pasarlas a un pipeline SfM como COLMAP, evitando la calibración manual con patrones.
- SLAM y odometría visual: inicializar o verificar los intrínsecos de la cámara en tiempo real en robots y drones, con latencia de 27 ms en una Jetson Orin Nano.
- Realidad aumentada en móvil: estimar los intrínsecos de la cámara del dispositivo a partir de un fotograma para alinear objetos virtuales sin depender de metadatos EXIF fiables.
- Procesamiento por lotes de archivos fotográficos: calibrar automáticamente miles de imágenes de un archivo para corregir distorsión antes de tareas de detección o segmentación.
- Preprocesado en pipelines de visión industrial: corregir la distorsión de cámaras de bajo coste sin procedimiento de calibración dedicado, usando una sola imagen de la escena.
- Investigación en visión por computador: servir de baseline reproducible y rápido (6,6 ms/imagen) para experimentos de calibración de vista única sobre los diez benchmarks del paper.
- Despliegue en dispositivos embebidos: integrar la calibración en cámaras inteligentes o sistemas de borde gracias a la exportación a TensorRT y al bajo coste computacional.

## Benchmarks y rendimiento

Resultados promediados sobre los diez benchmarks del paper (Stanford2D3D, TartanAir, MegaDepth, LaMAR, MegaDepth-radial, ScanNet++, Mono, Cathedral, InFlux e InFlux++), cada imagen ajustada con el modelo de cámara de su benchmark:

| Metrica | Valor |
|---|---|
| Error angular mediano | 1,50° |
| Error angular mAA@5° | 66,6 % |
| Error de vFoV mediano | 3,20° |
| Error de vFoV mAA@5° | 43,7 % |

El error angular es el de AnyCalib: ángulo entre el rayo predicho y el real sobre los píxeles de la imagen; mAA@5° es el área bajo la curva de recall hasta 5°.

Tiempos de ejecución por imagen, batch 1 (red + ajuste de cámara):

| Dispositivo | Red | Ajuste | Total |
|---|---|---|---|
| NVIDIA A100, PyTorch fp16 | 6,3 ms | 0,3 ms (CPU) | 6,6 ms |
| Jetson Orin Nano 8 GB (15 W), TensorRT fp16 | 22,9 ms | 4,2 ms (CPU) | 27,1 ms |

No se han publicado en la información disponible comparaciones numéricas con otros modelos en estos benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 105,6 M parámetros en fp16 los pesos ocupan aproximadamente 0,21 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: NVIDIA A100 para máximo throughput (6,6 ms/imagen); Jetson Orin Nano 8 GB validada por el autor con TensorRT (27,1 ms/imagen).
- Cabe en GPU de consumo: sí, por tamaño de pesos; el autor no publica cifras para RTX 4090, RTX 3090 u otras, pero el modelo es compatible con cualquier GPU con suficiente memoria para los pesos en fp16.
- Opciones de despliegue: PyTorch (fp16), TensorRT (fp16, motor exportado no incluido en el paquete), paquete Python `litecalib`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: 6,6 ms/imagen en A100 fp16; 27,1 ms/imagen en Jetson Orin Nano 8 GB a 15 W con TensorRT fp16.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LiteCalib (este modelo) | 105,6 M | Calibración de vista única, agnóstico al modelo de cámara | Imagen ~102.400 px | Apache 2.0 | Hugging Face, pip |
| AnyCalib | no disponible | Calibración de vista única, agnóstico al modelo de cámara | no disponible | no disponible | no disponible |
| GeoCalib | no disponible | Calibración de vista única con optimización geométrica | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de parámetros, contexto ni licencia de AnyCalib y GeoCalib, que son las referencias directas citadas por el autor. LiteCalib se presenta como una alternativa más rápida y ligera (106 M parámetros, 6,6 ms en A100) frente a esos enfoques, pero no se aportan comparaciones numéricas directas en la model card.

## Limitaciones y advertencias

- El modelo solo maneja cámaras radialmente simétricas; no cubre modelos con distorsión no radial (por ejemplo, descentramiento o modelos no simétricos).
- La precisión depende del benchmark: el error de vFoV mediano (3,20°) es notablemente peor que el angular (1,50°), y el mAA@5° de vFoV es solo del 43,7 %, lo que indica que la estimación del campo de visión vertical es el punto débil.
- Entrenado principalmente con panoramas renderizados y fotos de Wikimedia Commons (MegaScenes); puede degradarse en dominios visuales alejados de esa distribución (imágenes médicas, microscopía, escenas sintéticas no representadas).
- Los datos de entrenamiento incluyen gran proporción de material CC BY-SA (74 % en MegaScenes, parte share-alike en CommonsPano); aunque los pesos se publican bajo Apache 2.0, conviene revisar las implicaciones de atribución de los datos subyacentes.
- El motor TensorRT para Jetson no se incluye en el paquete; hay que exportarlo por separado.
- No es un modelo generativo ni lingüístico: no admite prompts de texto, tool calling ni razonamiento multi-paso.
- No se documentan sesgos demográficos ni geográficos concretos; al ser un modelo geométrico, el riesgo principal es el sesgo de dominio visual, no social.
- Riesgo de alucinación en el sentido de predicciones de calibración erróneas en imágenes ambiguas (texturas repetitivas, escenas sin estructura), sin señal de confianza documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LiteCalib/litecalib-vitb
- Código, documentación y entrenamiento: https://github.com/kocurvik/litecalib
- Dataset CommonsPano: https://huggingface.co/datasets/LiteCalib/CommonsPano
- AnyCalib (referencia y dataset OpenPano extendido): https://github.com/javrtg/AnyCalib
- GeoCalib (origen del dataset OpenPano): https://github.com/cvg/GeoCalib
- MegaScenes: https://megascenes.github.io
- The Laval Photometric Indoor HDR Dataset: http://hdrdb.com/indoor-hdr-photometric/
- PolyHaven: https://polyhaven.com/hdris
- HDRMaps: https://hdrmaps.com/freebies/free-hdris/
- AmbientCG: https://ambientcg.com/list?type=hdri&sort=popular
- BlenderKit: https://www.blenderkit.com/asset-gallery?query=category_subtree:hdr
