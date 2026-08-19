# Alibaba-NLP/UEmbed-9B

## Resumen

UEmbed-9B es un modelo de embeddings multimodales desarrollado por Alibaba-NLP que produce de forma unificada embeddings densos y sparse de tipo SPLADE en una única pasada causal. Está construido sobre el backbone decoder-only Qwen3.5 y soporta entradas de texto, imagen, vídeo y combinaciones mixtas, representándolas en un mismo espacio de retrieval. Su principal innovación es que combina la búsqueda densa (semántica) y la búsqueda sparse (léxica) en un solo checkpoint, lo que permite usar índices invertidos clásicos y a la vez aprovechar la representación vectorial densa.

El modelo se publica bajo licencia CC-BY-4.0, con pesos en formato safetensors y un total de 8.392.695.024 parámetros (8,39B). Es parte de una familia que incluye versiones de 2B y 4B, todas con el mismo diseño. UEmbed-9B está pensado para tareas de retrieval, búsqueda multimodal y recuperación de documentos visuales, y es compatible con el ecosistema `transformers` y vLLM para inferencia de alto rendimiento. Su relevancia actual radica en que unifica dos paradigmas de retrieval en un solo modelo multimodal, algo poco común en el ecosistema open source.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only Qwen3.5 multimodal con pooling en token EOS y 16 tokens sparse especiales |
| Parametros totales | 8.392.695.024 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

UEmbed-9B utiliza un backbone decoder-only Qwen3.5 multimodal. Para la representación densa, emplea el estado oculto del token EOS antes de los tokens sparse especiales. Para la representación sparse, añade 16 tokens especiales al final de la secuencia, cada uno con una cabeza lineal específica que proyecta sobre un vocabulario comprimido de 184.016 entradas canónicas (frente a las 248.320 del tokenizer original). La activación sparse se calcula como `log(1 + ReLU(logits))`, lo que produce vectores no negativos interpretables como términos léxicos.

El entrenamiento utiliza 3,94 millones de muestras públicas procedentes de E5 (retrieval de texto general), M3 (subconjunto MLDR) y los conjuntos de entrenamiento de MMEB para pares consulta-documento multimodales. Para los datos multimodales, los hard negatives se minaron con Qwen3-VL-Embedding-8B como teacher retriever. El objetivo de entrenamiento combina InfoNCE denso, InfoNCE sparse y una regularización FLOPS sobre consultas y documentos. El diseño mantiene la compatibilidad con servidores causales, ya que no requiere conversión a codificador bidireccional.

## Capacidades

- Genera embeddings densos normalizados y embeddings sparse SPLADE en una sola pasada forward.
- Acepta entradas de texto, imagen, vídeo y combinaciones mixtas (texto + imagen, texto + vídeo).
- Representa todas las modalidades en un mismo espacio de retrieval, permitiendo búsqueda cruzada (texto-imagen, imagen-texto, etc.).
- Los embeddings sparse son interpretables: las activaciones corresponden a términos del vocabulario y pueden usarse con índices invertidos.
- Compatible con el ecosistema `transformers` (desde versión 5.4.0) y con vLLM para inferencia de alto rendimiento.
- Soporta instrucciones opcionales por tarea (`instruction` field) para adaptar la representación al dominio.
- Permite ajuste fino con ms-swift (soporte SFT anunciado por el equipo de ms-swift).

## Casos de uso

- Búsqueda multimodal en bases de conocimiento: un sistema puede indexar documentos que contienen texto e imágenes, y recuperar los más relevantes a partir de una consulta de texto o imagen usando los embeddings densos.
- Búsqueda híbrida densa + sparse en producción: combinar la precisión léxica del sparse (con índices invertidos tipo Elasticsearch) con la semántica del denso, usando el mismo modelo para ambas representaciones.
- Recuperación de documentos visuales: escanear facturas, contratos o manuales escaneados, donde la imagen y el texto coexisten, y buscar por contenido visual o textual.
- RAG multimodal para asistentes: alimentar un pipeline de generación aumentada por recuperación con fragmentos de vídeo o imagen relevantes a una pregunta del usuario.
- Agentes de retrieval con instrucciones específicas: gracias al campo `instruction`, el modelo puede adaptarse a tareas como "recuperar imágenes relacionadas con..." o "encontrar pasajes que respondan a...".
- Indexación de vídeo: procesar vídeos muestreando frames (con `max_frames` y `fps`) para generar embeddings que permitan buscar momentos concretos dentro de un vídeo.
- Deduplicación de contenido multimodal: comparar embeddings de pares texto-imagen para detectar duplicados o variaciones cercanas en catálogos de productos.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card menciona que UEmbed logra resultados state-of-the-art en las pistas de texto y agentes de MMEB-v3, y que ocupa el segundo lugar entre los modelos open source en MMEB-v2, solo por detrás de la serie Qwen3-VL-Embedding. Sin embargo, no se proporcionan métricas concretas (p. ej., nDCG, Recall@k) ni tablas comparativas con valores.

## Requisitos de hardware

No se proporcionan requisitos oficiales de hardware en la documentación disponible. Como orientación, basándose en el tamaño de parámetros (8,39B) y el formato de pesos:

- VRAM estimada para inferencia en bf16: aproximadamente 17 GB (8,39B × 2 bytes), más overhead de activaciones y atención. Con cuantización de 4 bits, la VRAM necesaria se reduciría a unos 4-5 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: tarjetas con al menos 24 GB de VRAM (RTX 3090, RTX 4090, A100, H100) para inferencia en bf16 sin cuantizar. Con cuantización, podría caber en GPUs de 8-12 GB, pero no hay garantía oficial.
- Opciones de despliegue: `transformers` (con `flash_attention_2` para aceleración), vLLM para inferencia de alto rendimiento, y potencialmente `llama.cpp` si se generan pesos GGUF (no documentado).
- Latencia y throughput: no se han publicado datos.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa. El competidor directo mencionado en la documentación es la serie Qwen3-VL-Embedding (específicamente Qwen3-VL-Embedding-8B, utilizado como teacher en el entrenamiento). Ambos son modelos de embeddings multimodales basados en Qwen, pero UEmbed añade la salida sparse SPLADE, algo que Qwen3-VL-Embedding no ofrece. No se dispone de especificaciones detalladas de Qwen3-VL-Embedding-8B (parámetros, contexto, licencia) para elaborar una tabla comparativa.

## Limitaciones y advertencias

- No se documentan sesgos específicos, pero al entrenarse con datos públicos (E5, M3, MMEB) puede heredar sesgos presentes en esos conjuntos.
- Al ser un modelo de embeddings, no genera texto; el riesgo de alucinación se limita a posibles errores en la representación semántica, no en la generación de contenido.
- La longitud de contexto no está documentada; es necesario verificar el límite real antes de usarlo con secuencias largas.
- Los idiomas soportados no se especifican; aunque el backbone Qwen3.5 es multilingüe, no hay garantía de cobertura uniforme.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero requiere citar la fuente en cualquier redistribución o uso público.
- Para la inferencia sparse es necesario descargar el repositorio completo (incluye `sparse_info.json` y `sparse_weights.pt`); no basta con los safetensors.
- El modelo requiere una versión reciente de `transformers` (≥5.4.0), lo que puede limitar su integración en entornos con dependencias fijadas.

## Enlaces

- HuggingFace: https://huggingface.co/Alibaba-NLP/UEmbed-9B
- Sitio web del proyecto: https://alibaba-nlp.github.io/UEmbed
- Paper arXiv: https://arxiv.org/abs/2608.02583
- Repositorio GitHub: https://github.com/Alibaba-NLP/UEmbed
