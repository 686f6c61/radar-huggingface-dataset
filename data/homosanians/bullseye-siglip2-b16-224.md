# Homosanians/bullseye-siglip2-b16-224

## Resumen

Bullseye-siglip2-b16-224 es una exportación a ONNX del modelo multimodal google/siglip2-base-patch16-224, publicada por el usuario Homosanians. SigLIP 2 es la segunda generación de la familia SigLIP (Sigmoid Loss for Language Image Pre-Training) de Google, un modelo de visión-lenguaje que aprende representaciones conjuntas de imágenes y texto mediante una función de pérdida sigmoidea sobre pares imagen-texto, en lugar del contraste softmax empleado en CLIP. El modelo base tiene arquitectura transformer de dos torres (una torre visual con ViT-B/16 a resolución 224x224 y una torre de texto), con aproximadamente 375 millones de parámetros en total.

Esta variante concreta no es un modelo generativo ni un asistente conversacional: es un extractor de embeddings que produce vectores alineados para imágenes y texto, útil para búsqueda multimodal, clasificación zero-shot, filtrado de contenido y sistemas de recuperación visual. La exportación a ONNX facilita el despliegue en entornos de producción sin dependencia de PyTorch, con soporte para ejecución en CPU, GPU y aceleradores mediante ONNX Runtime.

La particularidad de esta exportación es que el vocabulario de la torre de texto se ha recortado a inglés, ruso y tipografía, quedando en 117.202 filas con tabla de embeddings en fp16. Esto reduce el tamaño del artefacto (0,9 GB en el repositorio) pero limita el soporte multilingüe respecto al modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de dos torres (ViT-B/16 para visión, transformer para texto), preentrenamiento contrastivo con pérdida sigmoidea |
| Parametros totales | Aproximadamente 375 millones (modelo base google/siglip2-base-patch16-224) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 64 tokens para la torre de texto (valor estándar de SigLIP; no confirmado explícitamente en la información disponible) |
| Tipos de cuantizacion | Pesos exportados en ONNX; tabla de embeddings de texto en fp16; no se documentan otras cuantizaciones |
| Idiomas soportados | Inglés, ruso y tipografía (vocabulario recortado a 117.202 filas) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (siglip2-b16-224-image.onnx, siglip2-b16-224-text.onnx) |

## Arquitectura y entrenamiento

El modelo base google/siglip2-base-patch16-224 sigue la arquitectura SigLIP 2: dos torres independientes, una visión transformer con parches de 16x16 a resolución 224x224 y una torre de texto transformer. A diferencia de CLIP, SigLIP emplea una pérdida sigmoidea aplicada por pares, lo que evita la normalización softmax global sobre el lote y mejora la eficiencia del entrenamiento. SigLIP 2 incorpora mejoras sobre la primera generación, como entrenamiento con datos multilingües, resolución variable y objetivos auxiliares de localización y descripción, aunque los detalles concretos del entrenamiento del modelo base no se recogen en la información disponible.

Esta exportación concreta no documenta el proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO), ya que se trata de una conversión de pesos, no de un modelo entrenado desde cero. La innovación técnica de esta variante es la poda del vocabulario de la torre de texto a 117.202 filas (inglés, ruso y tipografía) con embeddings en fp16, lo que reduce el tamaño del artefacto y acelera la inferencia de la torre textual a costa de eliminar el soporte para otros idiomas presentes en el vocabulario original.

## Capacidades

- Extracción de embeddings de imagen: genera vectores densos a partir de imágenes de 224x224 píxeles.
- Extracción de embeddings de texto: genera vectores alineados con el espacio de imágenes para consultas en inglés y ruso.
- Búsqueda multimodal imagen-texto y texto-imagen mediante similitud coseno en el espacio de embeddings.
- Clasificación zero-shot de imágenes usando prompts textuales.
- Filtrado y moderación de contenido visual mediante comparación con descripciones textuales.
- Soporte de tool calling: no disponible (no es un modelo generativo).
- Soporte de agentes y razonamiento multi-step: no disponible.
- Capacidades multilingües: limitadas a inglés y ruso por el recorte de vocabulario.
- Capacidades especiales: no dispone de modo thinking, visión generativa, audio ni generación de texto.

## Casos de uso

- Búsqueda visual en catálogos de producto: indexar imágenes de un catálogo con la torre visual y permitir consultas en lenguaje natural en inglés o ruso, recuperando los productos más similares por similitud de embeddings. Adecuado por su naturaleza de dos torres y su bajo coste de inferencia.
- Moderación de contenido en plataformas: comparar embeddings de imágenes subidas por usuarios con embeddings de textos de políticas (por ejemplo, "contenido violento", "desnudo") para filtrar automáticamente. La licencia Apache 2.0 facilita su integración comercial.
- Clasificación zero-shot de imágenes en pipelines de datos: etiquetar grandes volúmenes de imágenes sin entrenamiento específico, usando descripciones textuales como clases. La exportación ONNX permite ejecución en CPU a escala.
- Recuperación aumentada multimodal (RAG visual): indexar documentos escaneados o capturas y recuperar fragmentos relevantes a partir de consultas textuales, combinando la torre visual con la textual.
- Detección de duplicados y near-duplicates visuales: calcular embeddings de imágenes y agrupar por similitud para deduplicar datasets o detectar reutilización de imágenes.
- Sistemas de recomendación visual: generar embeddings de imágenes de usuario y de ítems para calcular afinidad, con despliegue en ONNX Runtime en entornos sin GPU dedicada.
- Filtrado de datasets de entrenamiento: puntuar pares imagen-texto por alineación semántica para descartar pares ruidosos antes de entrenar otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 0,9 GB; la inferencia en fp32 requiere aproximadamente 1,5 GB de memoria, y en fp16 alrededor de 0,8 GB. Cabe en GPUs consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090, A100, H100). Para despliegues a gran escala se recomienda A100 o H100 por throughput.
- Cabe en GPU consumer: sí, en cualquier GPU con 4 GB o más de VRAM; también en CPU mediante ONNX Runtime.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, TensorRT, DirectML), integración con servidores de inferencia compatibles con ONNX (Triton Inference Server, ONNX Runtime Server). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo generativo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto texto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Homosanians/bullseye-siglip2-b16-224 | ~375 M | 64 tokens (estándar SigLIP) | Inglés, ruso, tipografía (vocabulario recortado) | Apache 2.0 | ONNX |
| google/siglip2-base-patch16-224 | ~375 M | 64 tokens (estándar SigLIP) | Multilingüe (vocabulario completo) | Apache 2.0 | Safetensors, PyTorch |
| openai/clip-vit-base-patch16 | ~150 M | 77 tokens | Inglés principalmente | MIT | Safetensors, PyTorch |
| google/siglip-base-patch16-224 | ~203 M | 64 tokens | Inglés principalmente | Apache 2.0 | Safetensors, PyTorch |

La comparativa se limita a parámetros, contexto, idiomas, licencia y formato, ya que no se dispone de datos de benchmarks en la información proporcionada. Frente a CLIP ViT-B/16, esta variante ofrece mayor número de parámetros y la pérdida sigmoidea de SigLIP, pero con vocabulario recortado; frente al SigLIP 2 original, pierde cobertura idiomática a cambio de un artefacto ONNX más ligero.

## Limitaciones y advertencias

- El recorte de vocabulario a inglés, ruso y tipografía elimina el soporte para otros idiomas del modelo original; las consultas en castellano, francés, alemán u otros idiomas no funcionarán correctamente.
- No es un modelo generativo: no produce texto, no responde preguntas y no mantiene conversaciones. Su uso se limita a embeddings.
- Riesgo de sesgos heredados del dataset de entrenamiento del modelo base (google/siglip2-base-patch16-224), no documentados en esta exportación.
- La alineación imagen-texto puede degradarse en dominios especializados (imágenes médicas, satelitales, técnicas) no representados en el entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el autor de la exportación no ofrece garantías sobre la precisión de la conversión ONNX; se recomienda validar los embeddings frente al modelo original antes de producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria documentada.
- No se documentan procesos de evaluación, benchmarks ni pruebas de robustez para esta exportación concreta.
- La fecha de creación indicada (2026-11-16) es futura respecto a la fecha habitual de consulta; conviene verificar la integridad del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/Homosanians/bullseye-siglip2-b16-224
- Modelo base: https://huggingface.co/google/siglip2-base-patch16-224
- Repositorio oficial de SigLIP 2 (Google): no disponible en la información proporcionada
- Paper de SigLIP 2: no disponible en la información proporcionada
- Demo o espacio asociado: no disponible en la información proporcionada
