# LiteCalib/litecalib-vitl

## Resumen

LiteCalib-vitl es un modelo de visión por computador especializado en calibración de cámara de vista única (single-view camera calibration). Lo desarrolla el equipo LiteCalib (Viktor Kocur, Lukáš Bujňák, Lukáš Gajdošech, Torsten Sattler y Zuzana Kukelova) y se distribuye bajo licencia Apache 2.0. El modelo predice el campo de visión de la cámara en una rejilla de 5 x 5 puntos de la imagen, a partir de la cual se ajusta cualquier modelo de cámara con simetría radial.

La arquitectura se apoya en un backbone DINOv2 ViT-L/14 con 338 millones de parámetros. Resuelve un problema clásico de visión por computador: estimar los parámetros intrínsecos y la distorsión de una cámara a partir de una sola fotografía, sin necesidad de patrones de calibración ni de múltiples vistas. Frente a enfoques anteriores como GeoCalib o AnyCalib, LiteCalib se presenta como una alternativa rápida y agnóstica al modelo de cámara.

Su relevancia práctica está en el rendimiento: 10,5 ms por imagen en una NVIDIA A100 en fp16 (red más ajuste) y 79,3 ms en una Jetson Orin Nano de 8 GB a 15 W con TensorRT. Eso lo hace viable para pipelines de fotogrametría, robótica o procesamiento masivo de imágenes a gran escala.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DINOv2 ViT-L/14 (transformer de visión) con cabeza de predicción de campo de visión |
| Parámetros totales | 338.131.054 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada de imagen de unos 102.400 píxeles, relación de aspecto entre 0,5 y 2) |
| Tipos de cuantización | no disponible (la model card solo menciona fp16 en PyTorch y TensorRT) |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de los pesos de DINOv2 ViT-L/14 y añade una cabeza que predice el campo de visión en una rejilla de 5 x 5 puntos de la imagen. Sobre esas predicciones se ajusta, en CPU, cualquier modelo de cámara con simetría radial (pinhole, Brown-Conrady `radial:1`, EUCM, entre otros). El ajuste es independiente del backbone, de ahí la naturaleza "model-agnostic" del método.

El entrenamiento se realizó durante 24 épocas con un schedule warmup-stable-decay, con 144.000 vistas por época: 72.000 procedentes de vistas panorámicas y 72.000 de MegaScenes. Las fuentes de datos incluyen OpenPano (versión extendida de AnyCalib), CommonsPano (panorámicas de Wikimedia Commons con licencias CC0, CC BY y CC BY-SA) y MegaScenes (fotos de Wikimedia Commons con reconstrucciones COLMAP). Las vistas panorámicas se renderizan a 640 x 640 con el muestreo de cámaras de AnyCalib (receta `OP_g`), punto principal centrado y píxeles cuadrados. Se aplican las mismas resoluciones (unos 102.400 píxeles) y aumentaciones fotométricas que AnyCalib.

## Capacidades

- Calibración de cámara de vista única: estima matriz intrínseca K y parámetros de distorsión a partir de una sola imagen.
- Predicción del campo de visión en una rejilla de 5 x 5 puntos de la imagen.
- Ajuste a múltiples modelos de cámara radialmente simétricos: pinhole, Brown-Conrady (`radial:1`), EUCM, entre otros.
- Funciona con imágenes de relación de aspecto entre 0,5 y 2 y resolución de entrada de unos 102.400 píxeles.
- Inferencia rápida: 10,5 ms por imagen en A100 fp16 y 79,3 ms en Jetson Orin Nano 8 GB con TensorRT fp16.
- Exportable a TensorRT para despliegue en dispositivos de borde.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente de visión.

## Casos de uso

- Fotogrametría y reconstrucción 3D: obtener los intrínsecos de cada imagen antes de ejecutar SfM o MVS, evitando el coste de la autocalibración de COLMAP y mejorando la inicialización en escenas con pocas vistas.
- Robótica y vehículos autónomos: calibración en línea de cámaras montadas en plataformas móviles, con latencia de decenas de milisegundos en hardware de borde como la Jetson Orin Nano.
- Procesamiento masivo de archivos fotográficos: calibrar lotes de imágenes de Wikimedia Commons o de archivos históricos para tareas de metadatos, corrección de distorsión o normalización geométrica.
- Realidad aumentada y visión por computador en móvil: estimar los intrínsecos de la cámara del dispositivo a partir de una sola captura para inicializar el tracking o la superposición de elementos virtuales.
- Limpieza y curado de datasets: detectar imágenes con intrínsecos anómalos o metadatos de cámara incoherentes en pipelines de datos de entrenamiento.
- Corrección de distorsión en postproducción: ajustar el modelo radial adecuado por imagen para rectificar lentes sin conocer el modelo físico de la cámara.
- Investigación en calibración: servir de baseline reproducible y rápido para comparar métodos de calibración de vista única sobre los diez benchmarks del paper.

## Benchmarks y rendimiento

Resultados medios sobre los diez benchmarks del paper (Stanford2D3D, TartanAir, MegaDepth, LaMAR, MegaDepth-radial, ScanNet++, Mono, Cathedral, InFlux e InFlux++), cada imagen ajustada con el modelo de cámara de su benchmark:

| Métrica | Valor |
|---|---|
| Error angular mediano | 1,15° |
| Error angular mAA@5° | 74,0 % |
| Error mediano de vFoV | 2,40° |
| Error de vFoV mAA@5° | 52,3 % |

Tiempos de ejecución por imagen con batch 1 (red más ajuste de cámara):

| Dispositivo | Red | Ajuste | Total |
|---|---|---|---|
| NVIDIA A100, PyTorch fp16 | 10,1 ms | 0,3 ms (CPU) | 10,5 ms |
| Jetson Orin Nano 8 GB (15 W), TensorRT fp16 | 69,8 ms | 9,5 ms (CPU) | 79,3 ms |

El error angular es el de AnyCalib: ángulo entre el rayo predicho y el real sobre los píxeles de la imagen. mAA@5° es el área bajo la curva de recall hasta 5°. No se han publicado en la información disponible comparativas numéricas directas con GeoCalib u otros métodos en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 338 M de parámetros en fp16 los pesos ocupan aproximadamente 0,7 GB, más activaciones.
- GPU recomendadas: NVIDIA A100 para servidor (10,5 ms por imagen); Jetson Orin Nano 8 GB para borde (79,3 ms por imagen con TensorRT fp16).
- Cabe en GPU de consumo: sí, por tamaño de pesos (menos de 1 GB en fp16), aunque la model card no publica cifras para RTX 4090, RTX 3090 u otras.
- Opciones de despliegue: PyTorch (fp16) y TensorRT (fp16, motor exportado por el usuario; el paquete no lo construye). El ajuste de cámara se ejecuta en CPU.
- Latencia y throughput: 10,5 ms por imagen en A100 y 79,3 ms por imagen en Jetson Orin Nano 15 W, con batch 1. No se publican cifras de throughput con batch mayor.

## Comparativa con modelos similares

| Modelo | Parámetros | Enfoque | Contexto de entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LiteCalib-vitl | 338 M | Campo de visión 5 x 5 + ajuste radial | Imagen única (~102.400 px) | Apache 2.0 | Hugging Face + pip |
| AnyCalib | no disponible | Calibración de vista única, agnóstica al modelo | Imagen única | no disponible | Repositorio público |
| GeoCalib | no disponible | Calibración de vista única con optimización | Imagen única | no disponible | Repositorio público |

No se dispone en la información proporcionada de parámetros, contexto ni licencia de AnyCalib y GeoCalib, más allá de que LiteCalib reutiliza sus datasets y métricas de evaluación. La comparación numérica directa entre los tres métodos queda fuera del alcance de esta ficha.

## Limitaciones y advertencias

- Es un modelo exclusivamente de visión: no genera texto, no soporta tool calling ni razonamiento multi-paso.
- Solo modela cámaras con simetría radial; no cubre lentes con distorsión no radial ni modelos de cámara no soportados por el ajuste.
- Asume punto principal centrado y píxeles cuadrados en el entrenamiento, lo que puede degradar la precisión en cámaras con descentramiento real.
- La precisión media es de 1,15° de error angular mediano y 2,40° de error mediano de vFoV, con un mAA@5° del 52,3 % en vFoV; no es una calibración de precisión subgrado.
- Riesgo de sesgo por los datos de entrenamiento: panorámicas de interiores y exteriores de Wikimedia Commons, PolyHaven, HDRMaps, AmbientCG y BlenderKit, con posible sobrerrepresentación de ciertos tipos de escena.
- El motor TensorRT para Jetson no lo construye el paquete; hay que exportarlo por separado.
- No se publican análisis de sesgo, robustez ante imágenes adversas ni límites de resolución fuera del rango de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero los datos de entrenamiento incluyen material CC BY-SA; conviene revisar la atribución de CommonsPano si se redistribuyen derivados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LiteCalib/litecalib-vitl
- Repositorio de código, documentación y entrenamiento: https://github.com/kocurvik/litecalib
- Dataset CommonsPano: https://huggingface.co/datasets/LiteCalib/CommonsPano
- MegaScenes: https://megascenes.github.io
- GeoCalib (dataset OpenPano): https://github.com/cvg/GeoCalib?tab=readme-ov-file#openpano-dataset
- AnyCalib (OpenPano extendido): https://github.com/javrtg/AnyCalib?tab=readme-ov-file#extended-openpano-dataset
- The Laval Photometric Indoor HDR Dataset: http://hdrdb.com/indoor-hdr-photometric/
- PolyHaven: https://polyhaven.com/hdris
- HDRMaps: https://hdrmaps.com/freebies/free-hdris/
- AmbientCG: https://ambientcg.com/list?type=hdri&sort=popular
- BlenderKit: https://www.blenderkit.com/asset-gallery?query=category_subtree:hdr
