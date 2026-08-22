# cstr/ettin-reranker-1b-v1-GGUF

## Resumen

Ettin Reranker 1B es un modelo de reranking basado en un cross-encoder construido sobre ModernBERT, diseñado para mejorar la precisión de sistemas de recuperación de información (RAG, búsqueda semántica, filtrado de documentos). Esta versión concreta (`cstr/ettin-reranker-1b-v1-GGUF`) es la cuantización en formato GGUF del modelo original `cross-encoder/ettin-reranker-1b-v1`, realizada por el usuario `cstr` mediante la librería CrispEmbed. Al ofrecer pesos en GGUF, permite ejecutar el reranker en CPU o GPU de consumo con un uso reducido de memoria, lo que facilita su integración en entornos de producción con hardware limitado.

El modelo tiene 1.031.723.912 parámetros (1,03B) y una licencia Apache-2.0, lo que lo hace libre para uso comercial sin restricciones. Su arquitectura combina un backbone ModernBERT (28 capas, 1792 unidades ocultas) con una cabeza clasificadora de dos capas densas, produciendo un score de relevancia por par (query, documento). La versión GGUF incluye tres niveles de cuantización (F32, Q8_0 y Q4_K), que cubren desde la máxima fidelidad hasta un despliegue muy ligero.

El modelo fue evaluado en el benchmark MTEB (eng, v2) Retrieval, compuesto por 10 tareas de recuperación con reranking de top-100, y se compara favorablemente con alternativas de mayor tamaño, como Qwen3-Reranker-4B, aunque con un rendimiento ligeramente inferior. Su relevancia actual radica en ofrecer un reranker de calidad media-alta con un coste computacional reducido, ideal para pipelines de RAG en producción donde la latencia y el uso de memoria son críticos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (cross-encoder) con cabeza clasificadora |
| Parametros totales | 1.031.723.912 (1,03B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F32, Q8_0, Q4_K |
| Idiomas soportados | no disponible (probablemente inglés, no confirmado) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en ModernBERT, con 28 capas y una dimensión oculta de 1792. La cabeza de clasificación consiste en una capa densa de 1792 a 1792 con activación GELU, seguida de LayerNorm y una capa densa final que produce un único score de relevancia. El tokenizador es un GPT-2 ByteLevel BPE con 50.368 tokens.

El entrenamiento se realizó con un enfoque de reranking (dos etapas), y el modelo fue evaluado en el benchmark MTEB (eng, v2) Retrieval con 10 tareas, emparejándolo con seis modelos de embedding diferentes. No se han publicado detalles específicos sobre el conjunto de datos de entrenamiento ni sobre el uso de técnicas como RLHF o DPO. La conversión a GGUF se realizó con la librería CrispEmbed, que permite cuantizar el modelo original en safetensors a formato GGUF para su uso con herramientas como llama.cpp o Ollama.

## Capacidades

- Reranking de documentos: dado un query y una lista de documentos, produce un score de relevancia para cada par, permitiendo reordenar resultados de búsqueda.
- Integración en pipelines de retrieval: se usa como segunda etapa tras un retriever inicial (embeddings) para mejorar la precisión de los resultados top-100.
- Optimización para calidad de recuperación: evaluado en tareas de MTEB Retrieval, muestra un rendimiento sólido frente a modelos más grandes.
- Ejecución ligera: gracias a la cuantización GGUF, puede correr en CPU y en GPU con poca VRAM.
- No genera texto: es un modelo discriminativo, no generativo, por lo que no soporta generación de texto, código, tool calling ni agentes.
- Soporte multilingüe: no confirmado; probablemente entrenado principalmente en inglés.

## Casos de uso

- **Sistemas RAG (Retrieval-Augmented Generation)**: se integra tras un retriever inicial para rerankear los documentos recuperados y seleccionar los más relevantes antes de pasarlos a un modelo generativo, mejorando la calidad de las respuestas.
- **Búsqueda semántica en producción**: en motores de búsqueda internos o públicos, se usa para refinar los resultados de un índice vectorial, filtrando documentos irrelevantes y mejorando la precisión.
- **Filtrado de documentos en pipelines de análisis**: en entornos de análisis de datos o inteligencia empresarial, el modelo puede filtrar automáticamente documentos irrelevantes antes de su procesamiento posterior.
- **Sistemas de recomendación basados en contenido**: se puede usar para reordenar ítems (artículos, productos, papers) según la relevancia respecto a una consulta del usuario.
- **Moderación y clasificación de contenido**: aunque es un reranker, se puede adaptar para clasificar pares de texto, como detectar si un comentario es relevante para un hilo.
- **Integración en pipelines de RAG con hardware limitado**: gracias a su tamaño reducido y cuantización GGUF, es viable en entornos con GPU de gama media (por ejemplo, RTX 3060 con 8 GB) o incluso CPU con llama.cpp.

## Benchmarks y rendimiento

Según el blog de presentación de la familia Ettin Reranker, el modelo de 1B obtiene un resultado en MTEB (eng, v2) Retrieval de aproximadamente **0.612**, mientras que el Qwen3-Reranker-4B alcanza **0.6367**, una diferencia de **0.025 puntos**. No se han publicado resultados detallados por tarea en la información disponible.

| Modelo | Tamaño | MTEB Retrieval (eng, v2) | Licencia |
|---|---|---|---|
| Ettin Reranker 1B | 1,03B | ~0.612 (según blog) | Apache-2.0 |
| Qwen3-Reranker-4B | 4B | 0.6367 | Apache-2.0 (asumido) |

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: para el archivo Q4_K (638 MB), se requiere al menos 1-2 GB de VRAM para inferencia en GPU; el Q8_0 (1107 MB) necesita ~2-3 GB; el F32 (4126 MB) necesita ~5-6 GB.
- **GPU recomendadas**: RTX 3060 (12 GB) o superior para Q8_0; RTX 4090 o A100 para F32 sin problemas. En CPU, puede ejecutarse con llama.cpp con memoria RAM suficiente (por ejemplo, 2-4 GB para Q4_K).
- **Compatibilidad con consumer GPU**: sí, el Q4_K y Q8_0 caben en GPUs de 4-8 GB (como RTX 3050, RTX 3060, etc.).
- **Opciones de despliegue**: llama.cpp, Ollama (si se soporta formato GGUF), y potencialmente vLLM (si se convierte a un formato compatible). No se ha confirmado soporte en vLLM para rerankers GGUF.
- **Latencia y throughput**: no disponible; depende del hardware y del número de documentos a rerankear (típicamente se procesan top-100 documentos por consulta).

## Comparativa con modelos similares

| Modelo | Tamaño | Contexto | MTEB Retrieval | Licencia | Formato |
|---|---|---|---|---|---|
| Ettin Reranker 1B (GGUF) | 1,03B | no disponible | ~0.35 | Apache-2.0 | GGUF |
| Qwen3-Reranker-4B | 4B | no disponible | 0.6367 | Apache-2.0 (asumido) | safetensors, GGUF (posible) |
| bge-reranker-v2-m3 | 1,2B | no disponible | no disponible | MIT | safetensors, GGUF |

No se dispone de más datos de comparación en la información proporcionada.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: al ser un modelo discriminativo, no genera texto, por lo que no hay riesgo de alucinación en la generación; sin embargo, los scores pueden estar sesgados según el conjunto de entrenamiento (posiblemente en inglés).
- **Idiomas**: no se confirma soporte multilingüe; si se usa con documentos en otros idiomas, el rendimiento puede degradarse.
- **Contexto limitado**: no se especifica la longitud máxima de contexto; ModernBERT suele soportar 8192 tokens, pero no se ha confirmado para esta variante.
- **Licencia**: Apache-2.0 permite uso comercial sin restricciones, pero hay que cumplir con la atribución de la licencia.
- **Cuantización**: la cuantización Q4_K puede introducir una pérdida de precisión en los scores de relevancia, lo que podría afectar a tareas de reranking muy finas.
- **Producción**: para usar en producción, se recomienda evaluar el modelo con datos propios y validar el rendimiento en el idioma y dominio específico.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/cstr/ettin-reranker-1b-v1-GGUF
- Modelo original (safetensors): https://huggingface.co/cross-encoder/ettin-reranker-1b-v1
- Blog de presentación de la familia Ettin Reranker: https://huggingface.co/blog/ettin-reranker
- Repositorio CrispEmbed (herramienta de conversión): https://github.com/CrispStrobe/CrispEmbed
- Otra variante GGUF del mismo modelo (keisuke-miyako): https://huggingface.co/keisuke-miyako/ettin-reranker-v1-gguf
- Ficha en Toolify.ai: https://www.toolify.ai/ai-model/cross-encoder-ettin-reranker-1b-v1
