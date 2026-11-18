# alphaedge-ai/siglip2-giant-opt-patch16-384-guj-16384

## Resumen
`siglip2-giant-opt-patch16-384-guj-16384` es una variante podada del codificador vision-lenguaje SigLIP 2 de Google, publicada por el usuario alphaedge-ai. Se trata de un modelo multimodal de tipo dual-encoder (torre de visión y torre de texto) orientado a tareas de clasificación de imágenes zero-shot y similitud texto-imagen. La poda consiste en reducir el vocabulario del tokenizador de texto de 256.000 a 16.384 tokens, seleccionando los tokens más frecuentes en un corpus de gujarati, lo que recorta el modelo un 14,75 % en parámetros (de 1.871.885.426 a 1.595.847.794).

El modelo no genera texto: produce embeddings de imagen y de texto comparables mediante similitud coseno. Es relevante para despliegues en gujarati donde el vocabulario completo de SigLIP 2 resulta sobredimensionado, ya que el recorte reduce el peso del repositorio a 6,4 GB y disminuye la memoria necesaria para la matriz de embeddings de texto.

La ficha se basa exclusivamente en los metadatos de Hugging Face y en la model card del autor; no se han publicado resultados de benchmarks específicos para esta variante podada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dual-encoder transformer (visión + texto), base SigLIP 2 |
| Parametros totales | 1.595.847.794 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de embeddings; parche de visión 16 px, resolución de entrada 384 px) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar en el repo) |
| Idiomas soportados | gujarati (gu) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 6,4 GB |
| Vocabulario | 16.384 tokens (original: 256.000) |
| Libreria | sentence-transformers, transformers |
| Pipeline | zero-shot-image-classification |
| Region declarada | eu |

## Arquitectura y entrenamiento
La arquitectura subyacente es SigLIP 2, un codificador vision-lenguaje con dos torres transformer independientes: una torre de visión con parches de 16 px sobre entradas de 384 px y una torre de texto. El entrenamiento original de SigLIP 2 combina objetivos de contraste sigmoide, aprendizaje de características densas y comprensión semántica multilingüe, según el paper arXiv:2502.14786.

Esta variante concreta no se ha reentrenado: el autor aplica la técnica de *trimming* descrita en el blog de Hugging Face, que consiste en seleccionar los 16.384 tokens más relevantes a partir de 200.000 textos en gujarati del dataset `lbourdois/fineweb-2-trimming`, recortar las filas correspondientes de la matriz de embeddings de texto y reindexar el tokenizador. El resto de pesos (torre de visión y capas transformer de texto) se conservan del modelo base `google/siglip2-giant-opt-patch16-384`. No se documenta ningún ajuste fino posterior ni proceso de RLHF/DPO.

## Capacidades
- Clasificación de imágenes zero-shot mediante etiquetas candidatas en gujarati.
- Generación de embeddings de imagen y de texto para cálculo de similitud texto-imagen.
- Búsqueda y recuperación multimodal (texto a imagen e imagen a texto) en gujarati.
- Codificación de imágenes a resolución 384 px con parches de 16 px.
- Integración con `sentence-transformers` para pipelines de similitud y con `transformers` para clasificación zero-shot.
- Soporte limitado al gujarati: el vocabulario recortado elimina tokens de otros idiomas, por lo que el rendimiento multilingüe del modelo base se degrada.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso.

## Casos de uso
- Moderación de contenido visual en plataformas en gujarati: clasificar imágenes contra un conjunto de etiquetas candidatas (por ejemplo, categorías de contenido sensible) usando el pipeline `zero-shot-image-classification`, sin necesidad de entrenar un clasificador específico.
- Búsqueda visual en catálogos de comercio electrónico: indexar imágenes de producto como embeddings y recuperarlas con consultas de texto en gujarati mediante similitud coseno.
- Etiquetado automático de imágenes en corpus de gujarati: generar etiquetas zero-shot para conjuntos de datos de visión que carecen de anotaciones, aprovechando el vocabulario reducido para abaratar el despliegue.
- Deduplicación y agrupación de imágenes: calcular embeddings de imagen y agrupar por similitud para tareas de curación de datasets o detección de duplicados.
- Filtrado de imágenes en pipelines de datos de entrenamiento: clasificar imágenes contra etiquetas en gujarati para descartar contenido no deseado antes de alimentar otros modelos.
- Sistemas de accesibilidad para usuarios gujarati-parlantes: describir o clasificar imágenes de entrada mediante etiquetas candidatas generadas dinámicamente, con un coste de memoria inferior al del modelo base completo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en fp16: aproximadamente 3,2 GB solo para pesos (1.595.847.794 parámetros × 2 bytes), más memoria para activaciones y el tokenizador; en la práctica, entre 4 y 6 GB según el tamaño de lote.
- En fp32: aproximadamente 6,4 GB solo para pesos.
- GPU recomendadas: A100, H100 o L40S para despliegues de alto throughput; RTX 4090, RTX 3090 o RTX 4080 suficientes para inferencia en fp16 con lotes moderados.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM en fp16 (RTX 3070/4060 Ti en adelante); en fp32 requiere 8-12 GB.
- Opciones de despliegue: `sentence-transformers`, `transformers` con pipeline de `zero-shot-image-classification`, servidores de embeddings compatibles con la API de sentence-transformers; no se documenta soporte específico para vLLM, llama.cpp ni Ollama (el modelo no es generativo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Vocabulario | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| alphaedge-ai/siglip2-giant-opt-patch16-384-guj-16384 | 1.595.847.794 | 16.384 | gujarati | Apache 2.0 | Variante podada del base |
| google/siglip2-giant-opt-patch16-384 | 1.871.885.426 | 256.000 | multilingue | Apache 2.0 | Modelo base original |
| google/siglip2-so400m-patch14-384 | no disponible en la informacion | no disponible | multilingue | Apache 2.0 | Variante de menor tamano de la familia SigLIP 2 |
| google/siglip-base-patch16-384 | no disponible en la informacion | no disponible | multilingue | Apache 2.0 | Generacion anterior (SigLIP 1) |

## Limitaciones y advertencias
- El recorte de vocabulario elimina tokens no frecuentes en gujarati; el modelo puede degradarse gravemente en otros idiomas, incluido el inglés.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.
- Riesgo de sesgos heredados del corpus de entrenamiento original de SigLIP 2 y del corpus de minería `fineweb-2-trimming`; no se documenta ninguna mitigación adicional.
- La selección de tokens se basa en 200.000 textos de un único dataset; la cobertura del vocabulario gujarati puede ser incompleta para dominios especializados (medicina, legal, técnico).
- El modelo tiene 10 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por terceros ni de uso en producción.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento de la variante podada frente al modelo base.
- No se documentan resultados de benchmarks; cualquier decisión de producción debería basarse en una evaluación propia sobre el dominio objetivo.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/siglip2-giant-opt-patch16-384-guj-16384
- Modelo base: https://huggingface.co/google/siglip2-giant-opt-patch16-384
- Paper SigLIP 2: https://arxiv.org/abs/2502.14786
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Dataset de minería: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
