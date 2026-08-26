# ai-sage/Giga-Embeddings-instruct-3B-0826

## Resumen

Giga-Embeddings-instruct-3B-0826 es un modelo de embeddings de texto denso desarrollado por ai-sage, la misma organización detrás de la familia GigaChat. Se trata de la iteración más reciente de la serie Giga-Embeddings, diseñada para tareas de recuperación de información (retrieval), similitud semántica, clasificación y agrupamiento en ruso e inglés. El modelo parte de una arquitectura base Qwen3 (36 capas, hidden size 2048, 16 cabezas de atención con 8 cabezas KV y head_dim 128) que ha sido adaptada para usar atención bidireccional de tipo encoder, convirtiendo un decoder causal en un encoder de frases.

El modelo genera embeddings densos de 2048 dimensiones y se entrena con una función de pérdida contrastiva InfoNCE, lo que le permite producir representaciones de alta calidad para pares de texto. Una característica destacada es su estilo instructivo: para tareas asimétricas (como retrieval) se debe añadir una instrucción al query, mientras que los documentos se codifican sin instrucción. Con 3.150 millones de parámetros y pesos en bfloat16, ocupa aproximadamente 6,3 GB en disco, lo que lo hace desplegable en GPUs de consumo medio. Su licencia MIT y su soporte para ruso e inglés lo convierten en una opción atractiva para aplicaciones bilingües, especialmente en el espacio eslavo y europeo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3 modificada (encoder bidireccional, 36 capas, hidden 2048, 16 heads / 8 KV heads, head_dim 128) |
| Parámetros totales | 3.150.605.312 (~3B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | ruso, inglés |
| Licencia | MIT |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo parte de una LLM preentrenada de arquitectura Qwen3, pero modifica el mecanismo de atención para que sea bidireccional en lugar de causal, convirtiendo el modelo en un encoder puro. Esta adaptación permite que cada token atienda a todo el contexto, lo que es esencial para tareas de representación de frases y párrafos. La arquitectura mantiene 36 capas, un tamaño de hidden de 2048 y 16 cabezas de atención con 8 cabezas KV, con head_dim 128.

El entrenamiento se realiza mediante una función de pérdida contrastiva InfoNCE, que maximiza la similitud entre pares positivos (query-documento o frases relacionadas) y la minimiza con negativos. El modelo fue entrenado en estilo instructivo: para tareas asimétricas (retrieval) se debe anteponer al query una instrucción que describe la tarea, mientras que los documentos se codifican sin instrucción. Para tareas simétricas (STS, deduplicación) la instrucción es opcional. El pooling es mean pooling sobre tokens no-padding seguido de normalización L2; el uso de pooling CLS o last-token produce resultados incorrectos.

## Capacidades

- Generación de embeddings densos de 2048 dimensiones para frases y párrafos.
- Recuperación de información (retrieval) bilingüe ruso-inglés con estilo instructivo.
- Similitud semántica (STS) y deduplicación de documentos.
- Clasificación de textos y clustering basado en representaciones vectoriales.
- Soporte de codificación asimétrica: queries con instrucción, documentos sin instrucción.
- Compatible con la librería sentence-transformers y con vLLM para inferencia de alto rendimiento.

## Casos de uso

- **Búsqueda semántica en motores de búsqueda**: el modelo puede indexar documentos y encontrar los más relevantes para una consulta en ruso e inglés, añadiendo una instrucción descriptiva al query y codificando los documentos de forma directa.
- **Atención al cliente con chatbot**: se puede usar para recuperar respuestas de una base de conocimiento interna, combinando el embedding del mensaje del usuario con el de las entradas de FAQ, reduciendo la latencia de respuesta.
- **Deduplicación de bases de datos**: para detectar artículos, noticias o registros duplicados en grandes corpus, aprovechando la similitud coseno entre embeddings de párrafos.
- **Clasificación de textos**: convierte textos en vectores y los alimenta a un clasificador lineal (por ejemplo, regresión logística) para tareas de análisis de sentimiento o categorización temática.
- **Sistemas RAG (Retrieval-Augmented Generation)**: como retriever en pipelines de generación aumentada, para seleccionar fragmentos relevantes de un corpus y pasárselos a un LLM generativo.
- **Análisis de feedback de usuarios**: agrupa comentarios o reseñas por tema mediante clustering de embeddings, permitiendo identificar patrones y problemas comunes en plataformas de producto.

## Benchmarks y rendimiento

La model card del autor reporta resultados en MTEB (Multilingual Task Embedding Benchmark) para la versión 3B-0826, comparados con la versión anterior (old 3b) y con la variante 10B-A1.8B:

| Benchmark | old 3b | Giga-Embeddings-instruct-3B-0826 | Giga-Embeddings-instruct-10B-A1.8B-0826 |
|---|---|---|---|
| MTEB (rus) | 74.16 | 74.57 | 74.99 |
| MTEB (eng) | 71.07 | 71.93 | 72.23 |
| MTEB (code) | 62.37 | 76.93 | 78.40 |
| MTEB (multilingual) | 55.51 | 63.9 | 65.60 |

También se reportan métricas de throughput en vLLM para secuencias de 512, 1024 y 2048 tokens, con 87.9k/s, 91.5k/s y 90.4k/s respectivamente, comparado con el modelo 10B-A1.8B que alcanza 112.6k/s, 114.5k/s y 102.3k/s.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 3.150 millones de parámetros en bfloat16, el peso ocupa ~6.3 GB. Para inferencia con batch razonable se recomienda al menos 16 GB de VRAM para evitar cuellos de botella.
- GPUs recomendadas: NVIDIA RTX 3090/4090 (24 GB), A10G (24 GB), A100 (40/80 GB) o superiores. En consumer GPU de 16 GB (RTX 4080, 4060 Ti) es viable con batches pequeños.
- Puede ejecutarse en consumer GPU de 16 GB o más, no requiere hardware de datacenter.
- Opciones de despliegue: `sentence-transformers`, `vLLM` (soporte nativo), y por extensión cualquier framework compatible con safetensors y transformers.
- Latencia/throughput: el throughput reportado en vLLM es de ~90k tokens/s para secuencias de 512-2048 tokens, lo que indica un rendimiento alto en GPU de datacenter.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de embeddings (como E5, BGE, etc.) en la información proporcionada. El modelo compite en la categoría de embeddings bilingües (ru/en) de ~3B parámetros, pero sin benchmarks públicos adicionales no se puede establecer una comparación cuantitativa directa. En la propia serie Giga-Embeddings, la variante 10B-A1.8B supera ligeramente a la 3B en MTEB, pero con menor throughput en vLLM (0.8x vs 1.0x).

## Limitaciones y advertencias

- No se han publicado detalles sobre la longitud de contexto máxima; es probable que esté limitada a unos pocos miles de tokens, pero no está confirmado.
- El modelo está entrenado únicamente para ruso e inglés; no se recomienda su uso para otras lenguas sin evaluación previa.
- El uso de pooling incorrecto (CLS o last-token) produce resultados erróneos; es obligatorio usar mean pooling + L2.
- La instrucción debe añadirse solo al query en tareas asimétricas; aplicarla a documentos degrada el rendimiento.
- No se reportan resultados de sesgos o alucinaciones, pero al ser un modelo de embeddings no genera texto, por lo que el riesgo de alucinación no aplica directamente.
- La licencia MIT permite uso comercial, pero el usuario debe verificar la procedencia de los datos de entrenamiento si requiere cumplimiento normativo específico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ai-sage/Giga-Embeddings-instruct-3B-0826
- Modelo anterior de la serie: https://huggingface.co/ai-sage/Giga-Embeddings-instruct
- Página en MTEB Leaderboard: https://leaderboard.mteb.org/models/ai-sage/Giga-Embeddings-instruct
