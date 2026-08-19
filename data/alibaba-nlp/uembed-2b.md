# Alibaba-NLP/UEmbed-2B

## Resumen

UEmbed-2B es un modelo de embeddings multimodales desarrollado por Alibaba-NLP que produce simultáneamente embeddings densos y sparse (estilo SPLADE) en una única pasada causal. Está diseñado para tareas de recuperación de información, búsqueda multimodal y recuperación de documentos visuales, unificando representaciones densas y léxicas en un mismo espacio vectorial. El modelo acepta texto, imagen, vídeo y entradas mixtas, lo que lo convierte en una opción versátil para sistemas de búsqueda que necesitan manejar múltiples modalidades.

Se basa en un backbone decoder-only Qwen3.5 multimodal con aproximadamente 2.200 millones de parámetros. Su principal innovación es la combinación de embeddings densos y sparse en un solo forward, eliminando la necesidad de mantener dos modelos separados para recuperación densa y léxica. Además, los activaciones sparse son interpretables y pueden usarse con índices invertidos. El modelo se entrena con 3,94 millones de muestras públicas y alcanza resultados competitivos en benchmarks como MMEB-v3, siendo superado solo por la serie Qwen3-VL-Embedding entre los modelos open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only multimodal (backbone Qwen3.5) |
| Parametros totales | 2.213.241.664 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponibles (pesos en bf16 por defecto) |
| Idiomas soportados | No disponibles |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Safetensors (además de sparse_weights.pt para los pesos sparse) |

## Arquitectura y entrenamiento

UEmbed-2B emplea un backbone decoder-only Qwen3.5 multimodal, lo que permite procesar texto, imagen y vídeo en un mismo modelo. Para obtener embeddings densos, utiliza el hidden state del token EOS antes de los tokens especiales sparse. Para los embeddings sparse, añade 16 tokens especiales al final de la secuencia, cada uno con una head lineal independiente que proyecta a un vocabulario comprimido de 184.016 entradas canónicas (reducido desde las 248.320 del tokenizer original). La activación sparse se define como `log(1 + ReLU(logits))`, un esquema típico en modelos SPLADE.

El entrenamiento combina tres objetivos: InfoNCE denso, InfoNCE sparse y una regularización FLOPS sobre queries y documentos para fomentar la escasez. Los datos de entrenamiento suman 3,94 millones de muestras públicas, incluyendo el dataset E5 para cobertura amplia de texto, el subset MLDR de M3 y los conjuntos de entrenamiento de MMEB para pares query-documento multimodales. Para los datos multimodales, los hard negatives se extrajeron usando Qwen3-VL-Embedding-8B como teacher retriever. El modelo se sirve de forma nativa con `transformers` (sin `trust_remote_code`) y también dispone de backend vLLM para inferencia de alto rendimiento.

## Capacidades

- Generación de embeddings densos y sparse (SPLADE) en una sola pasada, unificando recuperación densa y léxica.
- Procesamiento multimodal: texto, imagen, vídeo y entradas mixtas (texto + imagen, texto + vídeo).
- Los embeddings sparse son interpretables: las activaciones corresponden a términos del vocabulario y pueden usarse con índices invertidos tradicionales.
- Compatible con serving de modelos causales, sin necesidad de convertir a encoder bidireccional.
- Soporte de instrucciones opcionales por tarea para adaptar la representación al dominio (campo `instruction`).
- Permite muestreo de frames de vídeo con control de FPS y número máximo de frames.
- Integración con vLLM para inferencia de alta productividad tanto de embeddings densos como sparse.

## Casos de uso

- Búsqueda multimodal en bases de conocimiento: dado un query de texto, recuperar imágenes, vídeos o documentos que lo combinen, usando tanto similitud densa como coincidencia léxica sparse.
- Recuperación de documentos visuales (facturas, contratos escaneados): el modelo puede indexar y buscar documentos que contengan texto e imágenes, útil en sistemas de gestión documental.
- Sistemas de recomendación de contenido: representar ítems multimedia (vídeos, imágenes, artículos) y consultas de usuario en el mismo espacio, permitiendo recomendaciones por similitud semántica y por términos exactos.
- Agentes conversacionales con memoria de recuperación: un agente puede usar UEmbed-2B para buscar en un historial de conversaciones multimodal (capturas de pantalla, mensajes con imágenes) y recuperar el contexto relevante antes de responder.
- Búsqueda híbrida en motores de búsqueda empresarial: combinar resultados densos y sparse para mejorar la precisión, especialmente en dominios con vocabulario especializado o nombres propios.
- Análisis de vídeo para vigilancia o archivado: indexar clips de vídeo con descripciones textuales y permitir búsquedas por contenido visual o textual, gracias al soporte nativo de vídeo.
- Deduplicación de contenido multimodal: generar embeddings de pares texto-imagen para detectar duplicados o variaciones cercanas en catálogos de productos o bibliotecas de medios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks con números concretos en la información disponible. La model card indica que UEmbed-2B logra resultados state-of-the-art en las pistas de texto y agentes de MMEB-v3, y ocupa el segundo puesto entre los modelos open source en MMEB-v2, solo superado por la serie Qwen3-VL-Embedding. Sin embargo, no se proporcionan métricas numéricas (p. ej., puntuaciones nDCG, Recall@k) en la documentación accesible.

## Requisitos de hardware

No se especifican requisitos oficiales de hardware en la documentación del modelo. A partir del tamaño (2,2B parámetros), se pueden hacer las siguientes estimaciones orientativas:

- VRAM estimada para inferencia en bf16: aproximadamente 4,4 GB solo para los pesos, más overhead de activaciones y caché KV; con un batch pequeño, cabe en GPUs con 8 GB de VRAM (p. ej., RTX 3070, RTX 4060 Ti).
- Con cuantización a 4 bits (si estuviera disponible), los pesos ocuparían alrededor de 1,2 GB, permitiendo ejecución en GPUs con 4-6 GB.
- GPUs recomendadas: cualquier GPU moderna con al menos 8 GB de VRAM para bf16, o 16 GB para mayor comodidad (RTX 4080, RTX 4090, A10, L4). Para producción con alto throughput, A100 o H100.
- Opciones de despliegue: el modelo carga de forma nativa con `transformers` (versión >= 5.4.0) y también se ofrece un backend vLLM para inferencia de embeddings densos y sparse a alta velocidad.
- Latencia y throughput: no disponibles en la documentación; dependerán del hardware, del batch y de la longitud de las secuencias.

## Comparativa con modelos similares

No se dispone de datos suficientes en la información proporcionada para realizar una comparativa cuantitativa con otros modelos de embeddings multimodales. Como referencia cualitativa, se puede mencionar:

| Modelo | Backbone | Parametros | Salidas | Modalidades |
|---|---|---|---|---|
| UEmbed-2B | Qwen3.5 | 2B | Denso + Sparse | Texto, imagen, vídeo |
| UEmbed-4B | Qwen3.5 | 4B | Denso + Sparse | Texto, imagen, vídeo |
| UEmbed-9B | Qwen3.5 | 9B | Denso + Sparse | Texto, imagen, vídeo |
| Qwen3-VL-Embedding-8B | Qwen3-VL | 8B | Denso | Texto, imagen, vídeo (según menciones) |

Según la model card, UEmbed-2B supera a la serie Qwen3-VL-Embedding en MMEB-v3 (pistas de texto y agentes) y queda en segunda posición en MMEB-v2, lo que sugiere que es competitivo con modelos de mayor tamaño en tareas de recuperación multimodal. No hay datos de otros competidores como Nomic Embed o BGE-M3 en la documentación consultada.

## Limitaciones y advertencias

- No se han documentado sesgos específicos del modelo. Al entrenarse con datos públicos (E5, M3, MMEB), puede heredar sesgos presentes en esos conjuntos, especialmente en dominios con baja representación.
- Al ser un modelo de embeddings, no genera texto directamente, por lo que el riesgo de alucinación es bajo en el sentido generativo, pero los embeddings pueden reflejar sesgos de los datos de entrenamiento en la similitud entre términos.
- La longitud de contexto no está especificada en la documentación; se recomienda verificar el límite del backbone Qwen3.5 antes de usarlo con secuencias largas.
- Los idiomas soportados no se indican. Aunque el tokenizer de Qwen3.5 es multilingüe, el rendimiento puede variar según el idioma y no está garantizado para todos.
- La licencia CC-BY-4.0 permite uso comercial y modificación, pero exige atribución. Es necesario revisar los términos completos de la licencia para cumplir con las obligaciones de atribución en productos derivados.
- El modelo requiere la descarga completa del repositorio, incluidos `sparse_info.json` y `sparse_weights.pt`, para la inferencia sparse. Si se omiten estos ficheros, la funcionalidad sparse no estará disponible.
- Para usar el modelo con `transformers`, se necesita una versión reciente (>= 5.4.0) con soporte de Qwen3.5/Qwen3-VL. En entornos con versiones antiguas, la carga puede fallar.

## Enlaces

- [HuggingFace: Alibaba-NLP/UEmbed-2B](https://huggingface.co/Alibaba-NLP/UEmbed-2B)
- [GitHub: Alibaba-NLP/UEmbed](https://github.com/Alibaba-NLP/UEmbed)
- [Sitio web del proyecto](https://alibaba-nlp.github.io/UEmbed)
- [arXiv: 2608.02583](https://arxiv.org/abs/2608.02583)
