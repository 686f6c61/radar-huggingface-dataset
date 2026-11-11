# mzahran1/arabic-english-qwen3-4b-retrieval

## Resumen

`mzahran1/arabic-english-qwen3-4b-retrieval` es un modelo de embeddings de 4.021 millones de parámetros derivado de `Qwen/Qwen3-Embedding-4B` mediante un fine-tune con LoRA de rango 32 sobre 39.332 pares pregunta-pasaje en árabe e inglés, fusionado de vuelta al 40% de intensidad con la técnica WiSE-FT. Lo desarrolla mzahran1 y está pensado específicamente para recuperación densa (first-stage retrieval) en colecciones documentales mixtas árabe-inglés, incluyendo el caso cruzado en el que la pregunta está en un idioma y la respuesta en el otro.

Su relevancia radica en que mejora de forma medible al modelo base en el escenario cross-lingual: alcanza un MRR@10 de 80,32 en el subconjunto árabe→inglés de su conjunto de test interno, frente a 75,76 del Qwen3-Embedding-4B sin ajustar, y un 81,47 en los subconjuntos cross-lingual de MTEB(ara, v1), por encima de los 27 modelos y semillas del tablero del autor. Es la variante grande de una familia que también incluye un modelo de 0,6B de la misma ronda.

El modelo genera embeddings de 2.560 dimensiones con pooling del último token y normalización L2, con una longitud máxima de secuencia de 512 tokens. Se distribuye bajo licencia Apache 2.0 y está orientado a pipelines RAG sobre corpus bilingües árabe-inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) adaptado a embeddings, con fine-tune LoRA rango 32 fusionado (WiSE-FT al 40%) |
| Parametros totales | 4.021.774.336 (4,0B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (`max_seq_length`) |
| Tipos de cuantizacion | Pesos almacenados en fp16; en CPU se recomienda cargar en fp32. No se documentan otras cuantizaciones (GGUF, AWQ, GPTQ) |
| Idiomas soportados | Árabe (ar) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería sentence-transformers) |
| Dimension de embedding | 2.560, pooling del último token y normalización L2 |
| Modelo base | Qwen/Qwen3-Embedding-4B (revision 636cd9bf47d976946cdbb2b0c3ca0cb2f8eea5ff) |
| Pipeline | sentence-similarity / feature-extraction |
| Tamano del repositorio | 8,1 GB |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3-Embedding-4B`, un transformer decoder-only de Qwen3 reconvertido a extractor de features: los embeddings se obtienen mediante pooling del último token y normalización L2, produciendo vectores de 2.560 dimensiones. Sobre esa base se aplicó un fine-tune con LoRA de rango 32 que después se fusionó en los pesos con un factor del 40% (WiSE-FT), una técnica de interpolación de pesos que busca preservar las capacidades del modelo original mientras incorpora la especialización del ajuste.

El conjunto de entrenamiento consta de 39.332 pares pregunta-pasaje tras aplicar un filtro de contaminación que eliminó 2.585 pares por duplicar o casi duplicar preguntas de evaluación. La composición es: 6.331 pares de TyDi-QA en árabe, 2.018 de TyDi-QA en inglés, 372 de ARCD, 6.501 de SQuAD v1.1 y 24.110 pares cross-lingual generados por traducción automática de la pregunta al otro idioma con Gemma-4-26B-A4B (17.559 árabe→inglés y 6.551 inglés→árabe). El entrenamiento emplea un negativo duro (hard negative) por consulta según la model card. Las particiones de train, dev y test usan artículos disjuntos y el conjunto se auditó contra fugas de datos.

## Capacidades

- Generación de embeddings de texto para similitud semántica y recuperación densa (feature-extraction), no generación de texto.
- Recuperación monolingüe en árabe (ar→ar) y en inglés (en→en).
- Recuperación cross-lingual árabe→inglés y inglés→árabe, el caso para el que fue específicamente ajustado.
- Soporte de instrucciones de consulta mediante `prompt_name="query"`; los pasajes se codifican sin prompt.
- Integración con `sentence-transformers` (probado con 5.1.2/transformers 4.57 y 6.2.0/transformers 5.22).
- Compatible con Text Embeddings Inference (tag `text-embeddings-inference`) y endpoints compatibles.
- No dispone de tool calling, razonamiento multi-paso, visión, audio ni modo thinking: es exclusivamente un codificador de embeddings.

## Casos de uso

- RAG sobre corpus mixtos árabe-inglés: indexar pasajes en ambos idiomas y recuperar con consultas en cualquiera de los dos, aprovechando la mejora cross-lingual (MRR@10 ar→en de 80,32 frente a 75,76 del base).
- Búsqueda documental empresarial bilingüe: organizaciones con documentación en árabe e inglés pueden usar un único índice vectorial en lugar de dos pipelines separados, con embeddings de 2.560 dimensiones.
- Atención al cliente con base de conocimiento multilingüe: recuperar artículos de ayuda en inglés para preguntas formuladas en árabe (y viceversa) antes de pasarlos a un LLM generador.
- Deduplicación y clustering semántico de contenidos bilingües: agrupar noticias, tickets o registros que tratan el mismo tema en distintos idiomas mediante similitud coseno.
- Evaluación y reranking de candidatos en pipelines de búsqueda: usar el modelo como primera etapa de recuperación densa y alimentar un reranker posterior con los mejores pasajes.
- Investigación en recuperación cross-lingual: el autor publica el benchmark y el código de evaluación, lo que permite reproducir y comparar variantes sobre MTEB(ara) y su conjunto interno.
- Filtrado de pares de traducción o QA: detectar correspondencias semánticas entre preguntas y respuestas en árabe e inglés para construir o limpiar datasets.

## Benchmarks y rendimiento

Conjunto de test interno (6.823 consultas de TyDi-QA, ARCD y XQuAD; MRR@10 × 100):

| Modelo | Parametros | ar→ar | en→en | ar→en | en→ar | Macro |
|---|---:|---:|---:|---:|---:|---:|
| bge-m3 (sin ajustar) | 568M | 80,16 | 87,83 | 63,34 | 67,78 | 74,78 |
| v3: harrier-oss-v1-0.6b fine-tune (media semillas 18/19) | 596M | 86,95 | 92,80 | 73,59 | 90,75 | 86,02 |
| Qwen3-Embedding-4B (sin ajustar) | 4,0B | 85,45 | 91,62 | 75,76 | 90,54 | 85,84 |
| **Este modelo (semilla 18)** | 4,0B | 87,97 | 93,18 | 80,32 | 92,96 | 88,61 |
| Misma receta, semilla 19 | 4,0B | 87,78 | 93,18 | 80,11 | 92,82 | 88,47 |
| Misma receta, media semillas 18/19 | 4,0B | 87,88 | 93,18 | 80,21 | 92,89 | 88,54 |

MTEB(ara, v1), 19 tareas, fp16, máximo 512 tokens:

| Modelo | Mean (Task) | Cross-lingual (subconjuntos ar-en) |
|---|---:|---:|
| bge-m3 (sin ajustar) | 71,98 | 73,27 |
| v3 (media semillas 18/19) | 73,67 | 78,04 |
| Qwen3-Embedding-4B (sin ajustar) | 75,28 | 80,75 |
| **Este modelo (semilla 18)** | 75,39 | 81,47 |
| Misma receta, semilla 19 | 75,38 | 81,51 |
| Misma receta, media semillas 18/19 | 75,39 | 81,49 |

Bootstrap emparejado sobre consultas (10.000 remuestreos, Holm): frente a Qwen3-Embedding-4B sin ajustar, ar→en +4,45 [+3,52, +5,43] y macro +2,70 [+2,37, +3,04]; frente a v3, ar→en +6,62 [+4,92, +8,38] y macro +2,52 [+1,95, +3,08] (Holm p = 0,0002 en todos los casos). En los subconjuntos cross-lingual de MTEB(ara), la media de semillas supera al base en +0,74 [+0,07, +1,61] (bootstrap sobre 6 tareas).

## Requisitos de hardware

- VRAM estimada: en fp16 los pesos ocupan aproximadamente 8 GB, por lo que la inferencia requiere del orden de 10-12 GB de VRAM incluyendo activaciones y overhead con secuencias de hasta 512 tokens.
- En CPU, la carga en fp32 requiere unos 16 GB de memoria RAM según la model card.
- GPU recomendadas: A100, H100 o L40S para despliegue de alto throughput; una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente para inferencia en fp16 a nivel de una sola instancia.
- Cabe en GPU de consumo con al menos 12 GB de VRAM en fp16; en GPUs de 8 GB sería necesario recurrir a cuantización, que no está documentada por el autor.
- Opciones de despliegue: `sentence-transformers`, Text Embeddings Inference (tag `text-embeddings-inference`) y endpoints compatibles. No se documentan pesos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MRR@10 ar→en (interno) | Cross-lingual MTEB(ara) | Licencia |
|---|---:|---:|---:|---:|---|
| Este modelo | 4,0B | 512 | 80,32 | 81,47 | Apache 2.0 |
| Qwen3-Embedding-4B | 4,0B | 512 (según configuración evaluada) | 75,76 | 80,75 | Apache 2.0 |
| harrier-oss-v1-0.6b fine-tune (v3) | 596M | no disponible | 73,59 (media semillas) | 78,04 (media semillas) | no disponible en la información |
| bge-m3 | 568M | no disponible | 63,34 | 73,27 | no disponible en la información |

La ventaja del modelo se concentra en el caso cross-lingual; en recuperación monolingüe en inglés la diferencia frente al base es pequeña (93,18 frente a 91,62) y en MTEB(ara) global la mejora es marginal (75,39 frente a 75,28). La variante de 0,6B es aproximadamente 7 veces más pequeña y pierde unos 6,7 puntos de MRR ar→en, por lo que la elección entre ambas depende del presupuesto de cómputo.

## Limitaciones y advertencias

- Solo cubre árabe e inglés; no está evaluado ni ajustado para otros idiomas.
- Longitud máxima de 512 tokens: los documentos largos deben trocearse, lo que puede perder contexto en pasajes extensos.
- Es un modelo de embeddings, no generativo: no responde preguntas ni produce texto, solo vectores.
- Riesgo de sesgo heredado del corpus de entrenamiento (TyDi-QA, ARCD, SQuAD y traducciones automáticas con Gemma-4-26B-A4B); los pares traducidos pueden introducir artefactos de traducción.
- El conjunto de evaluación interno es del propio autor y el tablero MTEB(ara) es local, no el leaderboard oficial de MTEB; las comparaciones deben interpretarse con esa cautela.
- No se documentan cuantizaciones oficiales (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware modesto.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las obligaciones de atribución y las condiciones del modelo base Qwen3-Embedding-4B.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha; no hay validación independiente de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mzahran1/arabic-english-qwen3-4b-retrieval
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-4B
- Variante de 0,6B de la misma ronda: https://huggingface.co/mzahran1/arabic-english-harrier-0.6b-retrieval
- Benchmark y código de evaluación: https://github.com/mahmoudzahran01/arabic-english-retrieval-eval
- Dataset TyDi-QA: https://huggingface.co/datasets/google-research-datasets/tydiqa
- Dataset ARCD: https://huggingface.co/datasets/hsseinmz/arcd
- Dataset SQuAD: https://huggingface.co/datasets/rajpurkar/squad
