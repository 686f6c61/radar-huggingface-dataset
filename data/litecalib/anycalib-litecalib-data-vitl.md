# LiteCalib/anycalib-litecalib-data-vitl

## Resumen

LiteCalib/anycalib-litecalib-data-vitl es un modelo de calibración de cámara a partir de una sola vista (single-view camera calibration), publicado por el grupo LiteCalib y desarrollado en el contexto del artículo *LiteCalib: Fast, Model-Agnostic Single-View Camera Calibration*. El modelo estima los parámetros intrínsecos de una cámara (matriz K y coeficientes de distorsión) a partir de una única imagen, sin necesidad de patrones de calibración ni de múltiples vistas. Es, por tanto, una herramienta de visión por computador orientada a pipelines de producción, no un modelo de lenguaje.

Técnicamente se trata de una red DINOv2 ViT-L/14 que predice un campo denso de rayos (dense ray field) sobre la imagen; a partir de ese campo, un calibrador en forma cerrada recupera los intrínsecos para distintos modelos de cámara (pinhole, Brown-Conrady, EUCM, Kannala-Brandt, entre otros). El modelo tiene 320.259.777 parámetros y se distribuye en formato safetensors con licencia Apache 2.0.

Su relevancia actual radica en que combina precisión (error angular mediano de 1,14° promediado sobre diez benchmarks) con una latencia muy baja (15,0 ms por imagen en una A100 en fp16, red más ajuste de cámara), lo que lo hace viable tanto en servidores como en dispositivos embebidos como Jetson Orin Nano.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DINOv2 ViT-L/14 con cabecera de campo denso de rayos (dense ray field) y calibrador en forma cerrada |
| Parámetros totales | 320.259.777 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen de aproximadamente 102.400 píxeles, relación de aspecto entre 0,5 y 2) |
| Tipos de cuantización | no disponible (el autor reporta fp16 en PyTorch y TensorRT fp16 en Jetson) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repo: 1,3 GB) |

## Arquitectura y entrenamiento

El modelo reutiliza los pesos de DINOv2 ViT-L/14 como backbone y añade una cabecera que produce un campo denso de rayos por píxel. Sobre esa representación intermedia, un calibrador en forma cerrada recupera los intrínsecos para un amplio rango de modelos de cámara (pinhole, Brown-Conrady, EUCM, Kannala-Brandt, etc.), incluyendo imágenes recortadas o estiradas. Esta es la innovación central del trabajo AnyCalib: demostrar que el campo de rayos permite una recuperación en forma cerrada de los intrínsecos para múltiples modelos de cámara, superando a alternativas como los modelos fundacionales 3D pese a entrenar con órdenes de magnitud menos datos.

El entrenamiento parte de los pesos de DINOv2 y se extiende durante 24 épocas con un schedule warmup-stable-decay, con 144.000 vistas por época (72.000 procedentes de vistas de panoramas y 72.000 de MegaScenes). Las fuentes de datos incluyen OpenPano (versión extendida de AnyCalib), CommonsPano (panoramas de Wikimedia Commons, en parte CC BY-SA) y MegaScenes (fotos de Wikimedia Commons con reconstrucciones COLMAP). Las vistas panorámicas se renderizan a 640 x 640 con el muestreo de cámaras `OP_g` de AnyCalib, punto principal centrado y píxeles cuadrados; las fotos de MegaScenes se recortan al centro a 1:1, 4:3 o 3:2 con lado corto de 600 px. Se aplican las aumentaciones fotométricas y la resolución de entrada de AnyCalib.

## Capacidades

- Calibración de cámara a partir de una sola imagen: estima la matriz de intrínsecos K y los coeficientes de distorsión.
- Soporte de múltiples modelos de cámara: pinhole, Brown-Conrady (`radial:1`), EUCM y Kannala-Brandt, entre otros.
- Recuperación en forma cerrada de intrínsecos a partir de un campo denso de rayos.
- Funciona con imágenes editadas (recortadas o estiradas).
- Estimación de campo de visión vertical (vFoV) además de los intrínsecos.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente de visión.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Reconstrucción 3D y fotogrametría: calibrar imágenes individuales antes de pasarlas a un pipeline SfM/MVS, evitando depender de calibración previa con patrones; el modelo devuelve K y distorsión en milisegundos por imagen.
- Preprocesado en pipelines de realidad aumentada: estimar intrínsecos de la cámara del dispositivo a partir de un fotograma para alinear contenido virtual con la escena, con latencia de 15 ms en A100.
- Robots y drones con cómputo embebido: ejecución en Jetson Orin Nano 8 GB (15 W) con TensorRT fp16 a 100,6 ms por imagen (red más ajuste), adecuada para bucles de percepción en tiempo casi real.
- Procesamiento por lotes de archivos fotográficos: calibrar automáticamente grandes colecciones de imágenes de origen desconocido (por ejemplo, Wikimedia Commons) para metadatos o análisis geométrico.
- Corrección de distorsión en postproducción: obtener los coeficientes de distorsión para enderezar imágenes tomadas con lentes gran angular o cámaras desconocidas.
- Integración en herramientas de captura móvil: calibrar la cámara de un smartphone a partir de una sola foto para aplicaciones de escaneo 3D o medición.
- Investigación en visión por computador: servir como baseline reproducible de calibración single-view con pesos públicos y licencia permisiva.

## Benchmarks y rendimiento

Resultados promediados sobre los diez benchmarks del artículo (Stanford2D3D, TartanAir, MegaDepth, LaMAR, MegaDepth-radial, ScanNet++, Mono, Cathedral, InFlux e InFlux++), cada imagen ajustada con el modelo de cámara de su benchmark:

| Métrica | Valor |
|---|---|
| Error angular mediano | 1,14° |
| Error angular mAA@5° | 74,6 % |
| Error vFoV mediano | 2,41° |
| Error vFoV mAA@5° | 52,4 % |

Tiempos de ejecución por imagen (batch 1, red más ajuste de cámara):

| Dispositivo | Red | Ajuste | Total |
|---|---|---|---|
| NVIDIA A100, PyTorch fp16 | 13,4 ms | 1,7 ms (GPU) | 15,0 ms |
| Jetson Orin Nano 8 GB (15 W), TensorRT fp16 | 79,0 ms | 21,6 ms (GPU) | 100,6 ms |

El ajuste es la media sobre los modelos de cámara. El motor TensorRT del Jetson es una exportación del modelo que el paquete `litecalib` no construye.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 320 M parámetros en fp16 los pesos ocupan aproximadamente 0,64 GB, más memoria de activaciones para entradas de unos 102.400 píxeles.
- GPU recomendadas: NVIDIA A100 (referencia del autor, 15,0 ms por imagen); Jetson Orin Nano 8 GB con TensorRT fp16 (100,6 ms por imagen).
- Compatibilidad con GPU de consumo: no se han publicado mediciones en RTX 4090 u otras GPU consumer; por tamaño (320 M parámetros) es previsible que quepa en cualquier GPU con 4 GB o más de VRAM, pero no hay datos oficiales de latencia.
- Opciones de despliegue: paquete Python `litecalib` (`pip install litecalib`), PyTorch fp16 y exportación a TensorRT fp16.
- Latencia y throughput: 15,0 ms por imagen en A100 (batch 1); 100,6 ms por imagen en Jetson Orin Nano 8 GB a 15 W.

## Comparativa con modelos similares

| Modelo | Parámetros | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| LiteCalib/anycalib-litecalib-data-vitl | 320 M | DINOv2 ViT-L/14 + campo denso de rayos, calibrador en forma cerrada | Apache 2.0 | Pesos en Hugging Face, código en GitHub |
| AnyCalib (modelo original) | no disponible | Campo denso de rayos con recuperación en forma cerrada de intrínsecos | no disponible | Código en GitHub |
| GeoCalib | no disponible | Calibración single-view basada en optimización aprendida; introduce OpenPano | no disponible | Código en GitHub |
| Modelos fundacionales 3D | no disponible | Representaciones 3D genéricas | no disponible | no disponible |

El autor afirma que AnyCalib supera de forma consistente a métodos alternativos, incluidos modelos fundacionales 3D, pese a entrenar con órdenes de magnitud menos datos. No se dispone de cifras comparativas detalladas en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en calibración de cámara: no genera texto, no razona y no soporta tool calling ni agentes.
- El ajuste de cámara asume modelos paramétricos concretos (pinhole, Brown-Conrady, EUCM, Kannala-Brandt); cámaras con distorsiones no modeladas pueden degradar la precisión.
- Los resultados reportados son promedios sobre diez benchmarks; el rendimiento en dominios no cubiertos (por ejemplo, imágenes médicas o macro) no está documentado.
- Riesgo de estimaciones erróneas en imágenes con poca textura, escenas degeneradas o geometría ambigua; no se han publicado análisis de fallos en la información disponible.
- Sesgos de los datos de entrenamiento: panoramas y fotos de Wikimedia Commons, con predominio de escenas interiores y exteriores de uso general; posible sesgo geográfico y de contenido.
- Parte de los datos de entrenamiento son CC BY-SA (CommonsPano y MegaScenes), aunque los pesos se publican bajo Apache 2.0; conviene revisar las obligaciones de atribución de las fuentes si se redistribuyen datos derivados.
- La licencia Apache 2.0 permite uso comercial, pero el paquete no construye el motor TensorRT del Jetson, por lo que el despliegue embebido requiere trabajo adicional.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, sin pipeline declarado; la madurez de soporte comunitario es baja.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LiteCalib/anycalib-litecalib-data-vitl
- Repositorio de código y documentación: https://github.com/kocurvik/litecalib
- Dataset CommonsPano: https://huggingface.co/datasets/LiteCalib/CommonsPano
- AnyCalib (paper y código): https://github.com/javrtg/AnyCalib
- Paper AnyCalib (arXiv 2503.12701): https://arxiv.org/abs/2503.12701
- GeoCalib y dataset OpenPano: https://github.com/cvg/GeoCalib
- MegaScenes: https://megascenes.github.io
- The Laval Photometric Indoor HDR Dataset: http://hdrdb.com/indoor-hdr-photometric/
