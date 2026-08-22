# AnnotateIt/deim-dfine-s-coco-onnx

## Resumen

El modelo `AnnotateIt/deim-dfine-s-coco-onnx` es una conversión no oficial a formato ONNX del detector de objetos DEIM (DETR with Improved Matching) en su variante "dfine-s", desarrollado originalmente por Intellindust AI Lab. La conversión ha sido realizada por AnnotateIt y publicada bajo licencia Apache-2.0. El modelo exporta las salidas crudas del grafo (logits y cajas predichas) sin ningún postprocesamiento (sin NMS, sin sigmoid, sin top-k), dejando todas las etapas de pre/postprocesamiento fuera del grafo ONNX. Esto lo hace adecuado para integraciones en entornos de producción donde se requiera control total sobre el pipeline de inferencia.

El modelo acepta imágenes RGB de 640×640 píxeles en formato NCHW y produce 300 propuestas de detección en formato DETR (conjunto de predicciones sin NMS). Está diseñado para la detección de objetos en las 80 clases del dataset COCO. El tamaño del artefacto ONNX es de aproximadamente 41,8 MB. El autor reporta un AP de 49.0 en COCO (valor no re-medido en esta conversión). Dado que es una conversión ONNX, se puede ejecutar con ONNX Runtime en múltiples plataformas, incluyendo CPU, GPU y entornos web.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DETR-style (transformer encoder-decoder) con consultas (queries) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (el modelo se distribuye en ONNX, sin cuantizacion indicada) |
| Idiomas soportados | no disponible (modelo de vision, no textual) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (archivo `model.onnx`) |

## Arquitectura y entrenamiento

El modelo DEIM (DETR with Improved MSE) es una evolución de DETR que mejora el entrenamiento y la eficiencia de los transformers para detección de objetos. La variante "dfine-s" es una de las versiones de tamaño medio de la familia DEIM. La conversión ONNX exporta el grafo completo sin capas de postprocesamiento, manteniendo las predicciones crudas: `logits` de forma `[1, 300, 80]` (probabilidades por clase sin sigmoid) y `pred_boxes` de forma `[1, 300, 4]` en coordenadas normalizadas `cxcywh`. El modelo utiliza 300 queries, típico de los detectores DETR.

No se dispone de información detallada sobre el entrenamiento (número de tokens, composición del dataset, técnicas de RLHF/DPO, etc.) en la información proporcionada. El autor reporta un AP de 49.0 en COCO, pero no se ha re-medido en esta conversión. El modelo original fue entrenado por Intellindust AI Lab; se puede consultar el repositorio oficial para más detalles sobre el entrenamiento.

## Capacidades

- Detección de objetos en 80 clases del dataset COCO (clases contiguas de 0 a 79).
- Predicción de cajas delimitadoras en formato normalizado `cxcywh` (centro x, centro y, ancho, alto).
- Salida de 300 propuestas por imagen, siguiendo el paradigma de predicción de conjuntos de DETR, que no requiere NMS.
- No incluye postprocesamiento: el usuario debe aplicar sigmoid a los logits, filtrar por umbral, aplicar NMS si se desea y escalar las cajas a las dimensiones originales de la imagen.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; es un modelo exclusivamente de visión.

## Casos de uso

- **Detección de objetos en tiempo real en aplicaciones móviles o web**: al ser un modelo ONNX de tamaño moderado (41,8 MB), puede ejecutarse en dispositivos con recursos limitados usando ONNX Runtime Web o móvil. El pipeline de postprocesamiento se puede implementar en JavaScript o en el lenguaje nativo, permitiendo una integración flexible.
- **Pipelines de visión por computador en servidores**: el modelo puede integrarse en sistemas de procesamiento de imágenes para tareas como conteo de objetos, clasificación de escenas o segmentación por detección. La ausencia de NMS en el grafo facilita el ajuste fino del umbral de confianza y la implementación de lógica de filtrado personalizada.
- **Prototipado rápido de sistemas de detección**: los desarrolladores pueden usar este modelo para validar arquitecturas de detección en entornos de investigación o desarrollo, dado que las salidas crudas permiten experimentar con diferentes técnicas de postprocesamiento sin reentrenar.
- **Integración en herramientas de anotación automática**: aplicaciones como AnnotateIt pueden usar este modelo para pre-anotar imágenes COCO, reduciendo el trabajo manual. El formato de salida estandarizado facilita la conversión a formatos de anotación comunes (JSON, XML, etc.).
- **Detección de objetos en vídeo**: al procesar secuencias de vídeo, se puede ejecutar el modelo por fotograma y combinar las detecciones con algoritmos de seguimiento (tracking) para obtener resultados temporales coherentes.
- **Despliegue en servidores de inferencia**: al ser un único archivo ONNX, se puede servir con ONNX Runtime o con frameworks como Triton o FastAPI, permitiendo escalar horizontalmente la inferencia sin dependencias adicionales de frameworks de deep learning.

## Benchmarks y rendimiento

El autor de la conversión reporta un APE de 49.0 en COCO, indicado como "reportado por el autor original" y no re-medido en esta conversión. No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

| Benchmark | Valor |
|---|---|
| COCO AP (reportado por el autor original) | 49.0 |
| COCO AP (re-medido en esta conversión) | no disponible |

## Requisitos de hardware

- **VRAM estimada**: no disponible. El tamaño del modelo es de 41,8 MB, lo que sugiere que puede ejecutarse en GPUs con poca memoria (por ejemplo, 2-4 GB), pero no se proporcionan datos concretos.
- **GPU recomendadas**: no disponible. Al ser un modelo de visión relativamente pequeño, debería ser compatible con GPUs de consumo como RTX 2060, RTX 3060 o similares, pero no se ha validado.
- **CPU**: al ser ONNX, se puede ejecutar en CPU, aunque la latencia será mayor. No hay datos de rendimiento.
- **Opciones de despliegue**: ONNX Runtime (CPU/GPU), ONNX Runtime Web (WASM), ONNX Runtime Mobile, o servidores de inferencia como Triton Inference Server.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

No se dispone de datos de comparación directa con otros modelos de detección de objetos en la información proporcionada. Sin embargo, se puede situar en el contexto de otros detectores DETR:

| Modelo | Parámetros | Contexto | Rendimiento (COCO AP) | Licencia | Formato |
|---|---|---|---|---|---|
| DEIM-dfine-s (este modelo, conversión ONNX) | no disponible | imagen 640×640 | 49.0 (reportado) | Apache-2.0 | ONNX |
| DEIM-nano (conversión ONNX de AnnotateIt) | no disponible | imagen 320×320 | 23.8 (reportado) | Apache-2.0 | ONNX |
| RT-DETR R18vd (conversión ONNX de AnnotateIt) | no disponible | no disponible | no disponible | no disponible | ONNX |

Nota: los datos de los modelos comparados provienen de los resultados de búsqueda web, pero no se dispone de tablas de comparación formales. Se recomienda consultar el repositorio oficial de DEIM para más detalles.

## Limitaciones y advertencias

- **Sin postprocesamiento incluido**: el modelo no aplica NMS ni sigmoid, y no redimensiona las cajas a las coordenadas originales. Es responsabilidad del usuario implementar estos pasos para obtener detecciones finales.
- **Preprocesamiento específico**: la entrada debe ser RGB, redimensionada a 640×640 (con estiramiento, no mantener relación de aspecto), dividida por 255 (sin normalización media/std) y convertida a NCHW. No se aplica normalización estándar, lo que puede afectar al rendimiento si se usa con otros pipelines.
- **Conversión no oficial**: la conversión ONNX no está respaldada por los autores originales del modelo DEIM. Puede haber discrepancias numéricas respecto al checkpoint de PyTorch original.
- **Licencia**: Apache-2.0 permite uso comercial, pero se debe incluir la atribución correspondiente (NOTICE y LICENSE).
- **Sesgos y alucinaciones**: al ser un modelo de detección, puede presentar falsos positivos o fallos en condiciones de iluminación, oclusiones o objetos no representados en COCO. No se han evaluado sesgos específicos.
- **Sin soporte para otras clases**: solo detecta las 80 clases de COCO, no se puede extender sin reentrenamiento.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/AnnotateIt/deim-dfine-s-coco-onnx)
- [Repositorio oficial de DEIM (Intellindust AI Lab)](https://github.com/Intellindust-AI-Lab/DEIM)
- [Proyecto DEIMv2](https://intellindust-ai-lab.github.io/projects/DEIMv2/)
- [Modelo relacionado: AnnotateIt/dfine-nano-coco-onnx](https://huggingface.co/AnnotateIt/dfine-nano-coco-onnx)
- [Modelo relacionado: AnnotateIt/rtdetr-r18vd-coco-onnx](https://huggingface.co/AnnotateIt/rtdetr-r18vd-coco-onnx)
