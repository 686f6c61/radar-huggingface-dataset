# rahmanenjozz/retail-product-seg-rfdetr-n

## Resumen

Retail Product Seg · RF-DETR Nano es un modelo de segmentación de instancias diseñado específicamente para productos de retail. Lo desarrolla el usuario rahmanenjozz y se publica bajo licencia Apache-2.0. El modelo resuelve un problema acotado pero crítico en pipelines de reconocimiento de producto: localizar con precisión cada producto en una imagen y devolver una máscara limpia y una caja delimitadora, sin intentar identificar de qué producto se trata. La identificación se delega a una etapa posterior de embeddings y búsqueda vectorial, de modo que el catálogo puede cambiar sin reentrenar el detector.

Técnicamente es una variante de segmentación del detector RF-DETR en su tamaño Nano, con backbone DINOv2-S y una única clase (`product`), lo que lo convierte en un segmentador class-agnostic. Trabaja sobre entradas de 312 × 312 píxeles y se distribuye en formato ONNX en FP32, con un tamaño de repositorio de 0,3 GB y aproximadamente 30 millones de parámetros. El autor reporta un Mask mAP50-95 de 0,950 sobre una partición de validación interna, no comparable con benchmarks públicos.

Su relevancia actual radica en la modularidad del enfoque: separar localización (este modelo) de identificación (retrieval con DINOv2 u otro embedder) permite construir sistemas de reconocimiento de producto mantenibles, donde añadir referencias nuevas al índice no implica reentrenar el detector. Está pensado para fotos de producto individuales, no para estanterías densas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR Nano Seg con backbone DINOv2-S |
| Parametros totales | ~30 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible (pesos publicados en ONNX FP32) |
| Idiomas soportados | no disponible (modelo de visión, sin componente textual) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (FP32) |
| Tarea | Segmentación de instancias (máscaras + cajas) |
| Clases | 1 (`product`), class-agnostic |
| Resolución de entrada | 312 × 312 |
| Tamaño del repositorio | 0,3 GB |
| Librería | libreyolo |
| Pipeline (Hugging Face) | image-segmentation |

## Arquitectura y entrenamiento

El modelo es una instancia de RF-DETR en configuración Nano para segmentación, con backbone DINOv2-S (Meta, Apache-2.0). RF-DETR es un detector transformer desarrollado por Roboflow que combina un backbone preentrenado con un decoder tipo DETR para producir cajas y máscaras. En esta variante se ha reducido el número de parámetros hasta unos 30 M y se ha fijado la resolución de entrada en 312 × 312, lo que sitúa al modelo en el rango de inferencia ligera.

El entrenamiento se realizó con LibreYOLO (MIT) sobre un dataset interno no público de imágenes de producto de retail. La anotación consiste en máscaras de instancia con una única clase `product`. La distribución de los datos corresponde mayoritariamente a una sola pieza por imagen, ocasionalmente varias claramente separadas, con resoluciones típicas de 300 a 600 píxeles. El autor indica explícitamente que no se aplicó aumento de color durante el entrenamiento. No se documentan en la información disponible detalles sobre número de tokens, composición exacta del dataset, ni uso de RLHF/DPO (no aplicables a este tipo de modelo).

## Capacidades

- Segmentación de instancias class-agnostic: devuelve máscaras y cajas para cada producto detectado, sin etiqueta de identidad.
- Localización precisa de producto individual en fotografías de catálogo o fotos de producto aislado.
- Salida compatible con pipelines de recorte y eliminación de fondo, pensada para alimentar un embedder (por ejemplo DINOv2) y un índice vectorial.
- Funciona como etapa 1 de un sistema de reconocimiento de producto basado en retrieval, desacoplado del catálogo.
- Exportación a ONNX, lo que facilita el despliegue en runtimes ligeros y entornos sin PyTorch.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo puramente visual de segmentación.
- No dispone de capacidades multilingües, de generación de texto, de audio ni de visión general más allá de la segmentación de producto.

## Casos de uso

- Catalogación automática de fotos de producto: dado un lote de imágenes de catálogo, el modelo extrae la máscara de cada producto, permite recortar sobre fondo limpio y generar miniaturas normalizadas para la ficha de producto.
- Indexación para búsqueda visual: las máscaras y recortes resultantes se pasan a un embedder (DINOv2 u otro) y se indexan en una base vectorial; el detector no necesita reentrenarse cuando se añaden referencias nuevas.
- Deduplicación de catálogo: al segmentar y recortar cada producto, se pueden comparar embeddings entre fichas para detectar duplicados o variantes del mismo artículo en el inventario.
- Preprocesado para clasificación o atributos: el recorte limpio generado a partir de la máscara sirve como entrada a modelos de clasificación de categoría, color o material, reduciendo el ruido de fondo.
- Automatización de fichas de e-commerce: integrado en un pipeline de ingesta, permite generar imágenes de producto recortadas y con fondo neutro de forma masiva sin intervención manual.
- Moderación y control de calidad de imágenes de vendedor: verificar que una foto contiene exactamente un producto y que la segmentación es limpia antes de publicarla en el marketplace.
- Prototipado rápido en entornos con recursos limitados: al ser un modelo de ~30 M de parámetros en ONNX a 312 × 312, puede ejecutarse en CPU o en GPUs de gama baja para pruebas de concepto de segmentación de producto.

## Benchmarks y rendimiento

| Modelo | Entrada | Mask mAP50-95 | Parámetros |
|---|---|---|---|
| retail-product-seg-rfdetr-n | 312 | 0,950 | ~30 M |

El autor advierte que la métrica procede de una partición de validación interna con la misma distribución que el entrenamiento y que no es comparable con benchmarks públicos como COCO. No se han publicado resultados adicionales de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con ~30 M de parámetros en FP32 el peso ronda los 120 MB, por lo que la huella en memoria es muy reducida y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son más que suficientes. El modelo también puede ejecutarse en CPU para inferencia por lotes moderados.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs consumer actuales e incluso en iGPU con runtime ONNX.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), TensorRT, OpenVINO; al estar en formato ONNX es portable a cualquier runtime compatible. No se documenta soporte nativo para vLLM, llama.cpp u Ollama (no aplicables a un modelo de visión).
- Latencia y throughput estimados: no disponibles en la información proporcionada. La resolución de 312 × 312 y el tamaño Nano sugieren latencias bajas, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Entrada | Clases | Licencia | Formato |
|---|---|---|---|---|---|---|
| retail-product-seg-rfdetr-n | RF-DETR Nano Seg (DINOv2-S) | ~30 M | 312 × 312 | 1 (`product`) | Apache-2.0 | ONNX |
| RF-DETR (Roboflow, base) | Detector/segmentador DETR | no disponible en la información | no disponible | COCO (80) | Apache-2.0 | PyTorch |
| DINOv2 (Meta) | Backbone / embedder | no disponible en la información | variable | no aplica (embedding) | Apache-2.0 | PyTorch |

No se dispone en la información proporcionada de métricas comparables con alternativas de segmentación de producto específicas. La comparación con RF-DETR base y DINOv2 se limita a la relación de dependencia (este modelo se construye sobre ambos), no a un benchmark común.

## Limitaciones y advertencias

- El modelo está entrenado para fotos de producto, no para estanterías: imágenes de lineal con decenas de artículos solapados quedan fuera de la distribución de entrenamiento.
- No se aplicó aumento de color durante el entrenamiento, por lo que el rendimiento puede degradarse con iluminación inusual o dominantes de color fuertes.
- El modelo no aporta identidad: toda detección es `product`; para saber qué producto es hay que combinarlo con un embedder y un paso de retrieval.
- Las métricas reportadas (Mask mAP50-95 de 0,950) provienen de una partición interna y pueden ser optimistas respecto a datos reales; se recomienda validar sobre imágenes propias antes de usarlo en producción.
- El dataset de entrenamiento es interno y no público, lo que impide auditar la composición y los posibles sesgos de dominio (tipos de producto, iluminación, fondo).
- Licencia Apache-2.0 en los pesos, compatible con uso comercial; conviene revisar igualmente las licencias de las dependencias (RF-DETR y DINOv2, ambas Apache-2.0, y LibreYOLO, MIT).
- No hay información sobre robustez frente a oclusiones parciales, reflejos en envases o productos transparentes; son casos habitualmente problemáticos en segmentación de retail y no se documentan.
- No dispone de garantías de calibración de confianza ni de umbrales recomendados; habrá que ajustar el umbral de detección según el caso de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rahmanenjozz/retail-product-seg-rfdetr-n
- RF-DETR (Roboflow): https://github.com/roboflow/rf-detr
- DINOv2 (Meta): https://github.com/facebookresearch/dinov2
- LibreYOLO: https://github.com/LibreYOLO/libreyolo
