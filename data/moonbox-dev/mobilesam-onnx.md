# moonbox-dev/MobileSAM-ONNX

## Resumen

MobileSAM v2 ONNX es una conversión a formato ONNX del modelo MobileSAM v2, un segmentador de imágenes promptable derivado de Segment Anything (SAM). El trabajo original lo desarrolla Chaoning Zhang y colaboradores (Universidad de Kyung Hee), y esta conversión concreta la publica el usuario moonbox-dev con el objetivo de facilitar la inferencia en dispositivos mediante ONNX Runtime, con soporte para CPU, CUDA y DirectML. El modelo resuelve el problema de la segmentación de imágenes guiada por prompts (puntos o cajas) con un coste computacional muy reducido: el codificador de imagen es un TinyViT de aproximadamente 5 millones de parámetros y el conjunto encoder más prompt encoder más mask decoder suma unos 9,8 millones de parámetros.

La relevancia de esta versión radica en su empaquetado: dos grafos ONNX (encoder y decoder) más un pequeño `pipeline.py` en numpy que reproduce el comportamiento de `SamPredictor` del repositorio original, incluyendo preprocesado, escalado de coordenadas y postprocesado de máscaras. Frente al modelo PyTorch original en float32, la build fp16 publicada mantiene una IoU media de 0,998 y una IoU mínima de 0,977 sobre el conjunto de validación del autor, con un tamaño total de unos 30 MB.

No incluye la parte de "segment everything" de MobileSAM v2 (el muestreador de prompts basado en YOLOv8, con licencia AGPL-3.0), sino únicamente el segmentador promptable. La licencia declarada es Apache 2.0, heredada del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TinyViT (encoder de imagen) + prompt encoder y mask decoder de SAM; exportado como dos grafos ONNX |
| Parametros totales | 9,8 M (encoder TinyViT-5M + prompt encoder + mask decoder) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 1024 x 1024) |
| Tipos de cuantizacion | fp16 (encoder fp16, decoder fp32); se descartaron int8 e int4 por pérdida de calidad |
| Idiomas soportados | no disponible (modelo de segmentación de imágenes, sin componente de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 17 / 18) + pipeline.py en numpy |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de MobileSAM: un codificador de imagen TinyViT de unos 5 millones de parámetros que sustituye al ViT-H de SAM, combinado con el prompt encoder y el mask decoder originales de SAM. La entrada del encoder es una imagen RGB normalizada y rellenada a 1024 x 1024, y produce embeddings de forma [1, 256, 64, 64]. El decoder recibe esos embeddings junto con coordenadas de puntos o esquinas de caja, una máscara de baja resolución previa y el tamaño original de la imagen, y devuelve cuatro máscaras en logits a tamaño de imagen, predicciones de IoU y máscaras de baja resolución de 256 x 256.

La conversión se realizó a partir de la revisión `f706ad9c4e` del repositorio MobileSAM v2 mediante `torch.onnx` con opsets 17 y 18, y los grafos se verificaron contra los módulos PyTorch originales (diferencia absoluta máxima de 2,9e-6 en el encoder y 1,2e-5 en el decoder, en float32). No se dispone de información sobre los datos de entrenamiento originales de MobileSAM en la información proporcionada. La cuantización probada fue weight-only: int8 por canal de salida detrás de DequantizeLinear e int4 mediante MatMulNBits de ONNX Runtime (bloque 32); ambas se descartaron por degradar la peor máscara hasta IoU 0,69 y 0,50 respectivamente.

## Capacidades

- Segmentación de imágenes promptable mediante puntos positivos o negativos.
- Segmentación guiada por caja delimitadora (bounding box).
- Generación de múltiples máscaras candidatas por prompt (hasta 4 en el decoder; 3 para prompts de punto y 1 para caja, siguiendo el comportamiento de `SamPredictor`).
- Predicción de puntuaciones de confianza (IoU) para cada máscara generada.
- Preprocesado y postprocesado integrados en `pipeline.py`: redimensionado del lado mayor a 1024, normalización con media y desviación de SAM, padding inferior-derecho, escalado de coordenadas de prompt y sobremuestreo de máscaras al tamaño original.
- Inferencia en CPU, CUDA y DirectML a través de ONNX Runtime.
- No incluye tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.

## Casos de uso

- Segmentación interactiva en aplicaciones de edición de imagen: el usuario hace clic sobre un objeto y el modelo devuelve una máscara precisa; los ~30 MB del paquete permiten ejecutarlo en el navegador o en el propio dispositivo sin backend.
- Recorte automático de producto en catálogos de comercio electrónico: con una caja delimitadora detectada por un detector previo, el decoder genera la máscara del producto para sustituir el fondo, con IoU mínima de 0,977 frente al modelo original.
- Anotación asistida en pipelines de etiquetado: el modelo precalcula el embedding de cada imagen una vez (encoder) y permite generar máscaras rápidamente para múltiples prompts sobre la misma imagen, reduciendo el coste frente a reejecutar un SAM completo.
- Segmentación en dispositivos de borde o móviles: al ser ONNX y caber en unos 30 MB, se puede desplegar en entornos con recursos limitados mediante ONNX Runtime con ejecución en CPU o DirectML en Windows.
- Preprocesado para visión por computador en producción: separar el sujeto del fondo antes de tareas posteriores como clasificación, detección o medición, aprovechando la máscara de mayor puntuación de IoU.
- Herramientas de accesibilidad o edición rápida en aplicaciones de escritorio: integración de un segmentador local sin dependencia de servicios en la nube, con latencia baja gracias al reducido tamaño del encoder TinyViT.

## Benchmarks y rendimiento

El autor publica una comparación de fidelidad frente al modelo PyTorch original en float32, sobre ocho fotografías del conjunto DIS5K-250 del laboratorio. Cada imagen recibe un punto positivo (3 máscaras) y la caja del ground truth (1 máscara), totalizando 32 máscaras por build. El criterio de aceptación es IoU de al menos 0,95 en cada máscara.

| Build | Peor máscara (IoU) | Media (IoU) |
|---|---|---|
| Grafos ONNX en float32 (no publicados) | 0,99998 | 0,99999 |
| `fp16/` (encoder fp16, decoder fp32) | 0,977 | 0,998 |

No se han publicado resultados de benchmarks estándar (mAP, COCO, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el paquete completo ocupa unos 30 MB en disco (encoder 14,1 MB y decoder 16,5 MB), por lo que la huella de memoria es mínima en cualquier GPU.
- GPU recomendadas: cualquier GPU con soporte de ONNX Runtime, incluidas CUDA (A100, H100, RTX 4090, RTX 3060) y DirectML en Windows.
- Cabe holgadamente en GPU de consumo e incluso en CPU: el encoder TinyViT de 5 M de parámetros está diseñado para dispositivos móviles.
- Opciones de despliegue: ONNX Runtime (CPU), onnxruntime-gpu (CUDA) y DirectML; el `pipeline.py` requiere numpy, onnxruntime y Pillow.
- Latencia y throughput: no disponibles en la información proporcionada; el autor no publica cifras de tiempo por imagen ni de imágenes por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MobileSAM v2 ONNX (este) | 9,8 M | Imagen 1024 x 1024 | Apache 2.0 | ONNX + pipeline numpy | Segmentador promptable; sin el muestreador de "segment everything" |
| SAM (original, Meta) | ~636 M (ViT-H) | Imagen 1024 x 1024 | Apache 2.0 | PyTorch | Mayor calidad pero mucho más pesado; no apto para móvil |
| MobileSAM (original) | ~9,8 M | Imagen 1024 x 1024 | Apache 2.0 | PyTorch | Misma arquitectura base; esta versión añade exportación ONNX y fp16 |
| FastSAM | no disponible en la información | no disponible | AGPL-3.0 (según el ecosistema YOLO) | PyTorch | Enfoque distinto basado en YOLO; no comparable directamente en parámetros con los datos disponibles |

## Limitaciones y advertencias

- No incluye el muestreador de prompts object-aware de MobileSAM v2 (YOLOv8 con licencia AGPL-3.0), por lo que no soporta "segment everything" de forma nativa; solo segmentación promptable por punto o caja.
- La build fp16 degrada la peor máscara hasta IoU 0,977 frente al original (0,99998 en float32); para aplicaciones que exijan máxima fidelidad debe considerarse el uso en float32.
- No se publican builds int8 ni int4: las pruebas realizadas por el autor muestran una caída severa de calidad (IoU 0,69 y 0,50 en la peor máscara), insuficiente para uso práctico.
- El benchmark de fidelidad se limita a ocho imágenes y 32 máscaras, por lo que la generalización a otros dominios no está verificada en la información disponible.
- Riesgo de sesgos y alucinaciones heredado del modelo original: no se documentan en la información proporcionada, pero al ser un modelo de segmentación puede fallar en objetos ambiguos, oclusiones o imágenes fuera de distribución.
- La licencia Apache 2.0 se hereda del modelo original; el autor indica que rige el uso de estos ficheros, pero no se detallan restricciones adicionales para uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo figura como 0.0 GB, lo que sugiere que los ficheros pueden no estar disponibles o que las métricas no están actualizadas.

## Enlaces

- Hugging Face: https://huggingface.co/moonbox-dev/MobileSAM-ONNX
- Repositorio MobileSAM v2: https://github.com/ChaoningZhang/MobileSAM
- Paper MobileSAM v2: https://arxiv.org/abs/2312.09579
- Paper MobileSAM: https://arxiv.org/abs/2306.14289
- Paper SAM (Segment Anything): https://arxiv.org/abs/2304.02643
