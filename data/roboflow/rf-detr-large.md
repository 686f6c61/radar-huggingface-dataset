# Roboflow/rf-detr-large

## Resumen

RF-DETR (variante Large) es un modelo de detección de objetos en tiempo real desarrollado por Roboflow, presentado en el artículo "RF-DETR: Neural Architecture Search for Real-Time Detection Transformers" (Robinson et al., arXiv:2511.09554). Combina ideas de LW-DETR y Deformable DETR: un backbone ViT al estilo DINOv2-with-registers con un patrón de atención ventaneada específico de RF-DETR, un proyector multi-escala entre encoder y decoder, y un decoder deformable DETR multi-escala. El resultado es un detector end-to-end con convergencia rápida y un equilibrio sólido entre precisión y latencia.

El checkpoint Large cuenta con 33.933.218 parámetros y está entrenado sobre el conjunto COCO 2017 (80 categorías), con licencia Apache 2.0. Está integrado en la librería Transformers mediante la clase `RfDetrForObjectDetection` (PR #36895), lo que facilita su uso en pipelines estándar de Hugging Face sin dependencias externas adicionales.

Su relevancia actual radica en que ofrece una alternativa basada en transformers a las familias YOLO para detección en tiempo real, con la ventaja de una licencia permisiva y una integración nativa en el ecosistema Transformers. La familia RF-DETR se generó mediante búsqueda de arquitectura neuronal (NAS) con pesos compartidos, de modo que distintos checkpoints corresponden a subredes de un mismo backbone adaptado al dataset objetivo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detection Transformer (DETR) con backbone ViT estilo DINOv2-with-registers, atención ventaneada RF-DETR, proyector multi-escala y decoder deformable DETR |
| Parametros totales | 33.933.218 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; resolución de entrada variable por checkpoint) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (detección de objetos sobre imágenes; etiquetas COCO en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers) |

## Arquitectura y entrenamiento

RF-DETR emplea un backbone ViT inspirado en DINOv2-with-registers con un patrón de atención que alterna ventanas locales y atención completa (windowing pattern propio de RF-DETR), en lugar de un encoder puramente convolucional. Sobre el backbone se sitúa un proyector multi-escala con bloques estilo C2f (linaje LW-DETR) que agrega características de distintos niveles antes de pasarlas a un decoder deformable DETR con cross-attention deformable multi-escala. El decoder usa object queries estilo DETR con matching bipartito y pérdidas auxiliares en capas intermedias para estabilizar el entrenamiento. La profundidad y la resolución de entrada varían según el checkpoint dentro de la frontera NAS.

El entrenamiento utiliza las pérdidas estándar de detección (clasificación, L1 sobre bounding boxes y GIoU), con pérdidas auxiliares en capas intermedias del decoder. Se emplea Group DETR (copias paralelas del decoder durante el entrenamiento) para acelerar la convergencia, en la misma línea que LW-DETR. A nivel de familia, el artículo aplica búsqueda de arquitectura neuronal con pesos compartidos sobre ejes prácticos de precisión-latencia tras adaptar un backbone compartido al dataset objetivo, de modo que muchos checkpoints corresponden a subredes sin reentrenamientos independientes completos para cada punto de la frontera. Los datos de entrenamiento son COCO 2017 con 80 categorías.

## Capacidades

- Detección de objetos end-to-end sobre imágenes en las 80 categorías de COCO 2017.
- Predicción directa de bounding boxes y logits de clase sin necesidad de anchors ni NMS explícito en el pipeline del modelo.
- Integración nativa en Transformers mediante `RfDetrForObjectDetection` y `AutoImageProcessor`, con post-procesado a formato COCO API.
- Diseñado para inferencia en tiempo real (frontera precisión-latencia optimizada por NAS).
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo puramente visual de detección.
- Capacidades multilingües: no aplica; las etiquetas de clase están en inglés según `config.id2label`.
- No incluye visión-lenguaje, audio ni modo "thinking".

## Casos de uso

- Vigilancia y analítica de vídeo en tiempo real: el modelo puede procesar fotogramas de cámaras IP para detectar personas, vehículos y objetos de interés con baja latencia, aprovechando su diseño orientado a tiempo real.
- Automatización industrial y control de calidad: detección de defectos o piezas en líneas de producción, donde la licencia Apache 2.0 permite despliegue comercial sin restricciones de atribución complejas.
- Conteo y seguimiento en retail: detección de productos, carros o personas en imágenes de tienda para analítica de afluencia; el modelo se puede combinar con trackers externos.
- Pre-etiquetado para anotación: usar RF-DETR Large para generar cajas candidatas sobre datasets propios y acelerar el etiquetado en Roboflow Annotate o herramientas similares, reduciendo el coste manual.
- Logística y almacén: localización de palés, cajas y contenedores en imágenes de muelles o drones, integrable en pipelines de Transformers con `AutoImageProcessor`.
- Movilidad y tráfico: detección de vehículos, peatones y señales en imágenes de cámaras urbanas, con la ventaja de un backbone ViT robusto frente a variaciones de escala.
- Investigación en detección: punto de partida para fine-tuning sobre datasets propios (por ejemplo, datasets de Roboflow Universe) gracias a la integración en Transformers y a la licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 33,9 M de parámetros en precisión FP32, los pesos ocupan aproximadamente 136 MB; en FP16, unos 68 MB. La VRAM real depende de la resolución de entrada y del tamaño de lote, no disponible en la información proporcionada.
- GPU recomendadas: al ser un modelo de 34 M de parámetros, cabe holgadamente en GPUs de consumo. Se espera funcionamiento en RTX 3060, RTX 4060, RTX 4090 y superiores; también en GPUs de datacenter (A100, H100) para lotes grandes o alta concurrencia.
- Cabe en GPU de consumo: sí, con margen amplio, incluso en GPUs de gama media con 6-8 GB de VRAM.
- Opciones de despliegue: Transformers (`RfDetrForObjectDetection`), y potencialmente exportación a ONNX o TensorRT (no confirmado en la información disponible). No se indica soporte explícito para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada; el diseño está orientado a tiempo real según el artículo, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RF-DETR Large (este) | 33,9 M | resolución variable por checkpoint | Detección de objetos COCO | Apache 2.0 | Hugging Face, Transformers |
| YOLOv8 (variantes) | no disponible en la información | resolución configurable | Detección de objetos | AGPL-3.0 (Ultralytics) | Ultralytics, ampliamente adoptado |
| DETR / Deformable DETR | no disponible en la información | resolución fija típica | Detección de objetos | Apache 2.0 (Deformable DETR) | Hugging Face, repos originales |
| LW-DETR | no disponible en la información | resolución variable | Detección de objetos | no disponible | Repos originales |

No se dispone de cifras de rendimiento comparativas en la información proporcionada; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre COCO 2017 (80 categorías); el rendimiento en dominios muy distintos (imágenes médicas, satelitales, industriales específicas) requerirá fine-tuning.
- Riesgo de falsos positivos y negativos en objetos pequeños, ocluidos o con distribuciones de escala no representadas en COCO.
- Sesgos heredados del dataset COCO: posible infrarrepresentación de ciertas categorías, contextos geográficos y condiciones de iluminación.
- No es un modelo generativo: no produce texto ni razonamiento; no debe usarse para tareas de VLM.
- No se han publicado datos de cuantización ni de latencia oficiales; conviene medir el rendimiento en el hardware objetivo antes de producción.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las dependencias del backbone DINOv2 (licencia propia de Meta) si se redistribuye el modelo.
- Las etiquetas de clase están en inglés; para etiquetas en castellano habría que mapear `id2label`.
- El modelo card original hace referencia a `stevenbucaille/rf-detr-large` en el código de ejemplo; el checkpoint oficial es `Roboflow/rf-detr-large`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Roboflow/rf-detr-large
- Artículo (arXiv): https://arxiv.org/abs/2511.09554
- Página del paper en Hugging Face: https://huggingface.co/papers/2511.09554
- PR de integración en Transformers: https://github.com/huggingface/transformers/pull/36895
- Búsqueda de modelos RF-DETR en el hub: https://huggingface.co/models?search=rf-detr
- Dataset COCO: https://cocodataset.org/#home
- Roboflow: https://roboflow.com/
- Roboflow Universe: https://universe.roboflow.com/
- Roboflow Annotate: https://roboflow.com/annotate
