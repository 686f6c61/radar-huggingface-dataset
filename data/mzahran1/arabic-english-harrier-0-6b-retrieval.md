# mzahran1/arabic-english-harrier-0.6b-retrieval

## Resumen

`mzahran1/arabic-english-harrier-0.6b-retrieval` es un modelo de embeddings de frases (sentence transformer) de 596 millones de parámetros, desarrollado por Mahmoud Zahran, especializado en recuperación de información (retrieval) bilingüe árabe-inglés. Se construye mediante fine-tuning del modelo base `microsoft/harrier-oss-v1-0.6b` sobre 39.332 pares pregunta-pasaje en árabe e inglés, seguido de una interpolación de pesos con el modelo original (WiSE-FT, `W = 0.6 W_base + 0.4 W_finetuned`). El modelo resuelve el problema del retrieval cross-lingual: preguntas en árabe sobre documentos en inglés, preguntas en inglés sobre documentos en árabe y búsqueda monolingüe en cualquiera de los dos idiomas.

Es relevante para pipelines RAG (Retrieval-Augmented Generation) en entornos bilingües árabe-inglés, un escenario tradicionalmente mal cubierto por los embedders multilingües genéricos. El modelo genera embeddings de 1.024 dimensiones, L2-normalizados, con una longitud máxima por defecto de 512 tokens, y está publicado con licencia MIT, lo que facilita su uso comercial. Es la tercera iteración de una serie de modelos del mismo autor y cuenta con un benchmark y código de evaluación públicos en GitHub.

La propuesta técnica combina un backbone Qwen3 (según los tags del repositorio) con un entrenamiento orientado a negativos duros y un ajuste de pesos que preserva las capacidades del modelo base, lo que se traduce en mejoras medibles tanto en el benchmark interno bilingüe como en MTEB(ara, v1).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (base Qwen3, según tags), adaptado como sentence transformer con pooling del último token |
| Parametros totales | 596.049.920 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens por defecto (longitud a la que se midieron todos los resultados) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Árabe (ar), inglés (en) |
| Licencia | MIT |
| Formato de pesos | Safetensors (librería sentence-transformers) |
| Dimension de embeddings | 1.024, L2-normalizados |
| Funcion de similitud | Similitud coseno o producto escalar |
| Instruccion de query | `"Instruct: Given a web search query, retrieve relevant passages that answer the query\nQuery: "` |
| Modelo base | microsoft/harrier-oss-v1-0.6b |
| Tamano del repositorio | 2,4 GB |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/harrier-oss-v1-0.6b`, un embedder de 596M parámetros construido sobre un backbone de la familia Qwen3 (según los tags del repositorio). El embedding se extrae del estado oculto del último token, ya que el tokenizador añade `<|endoftext|>`; los vectores resultantes tienen 1.024 dimensiones y se normalizan L2. Las consultas reciben una instrucción de una frase, mientras que los documentos no reciben instrucción alguna; `encode_query` aplica la instrucción automáticamente en sentence-transformers 5.0 o superior.

El entrenamiento se realizó sobre 39.332 pares pregunta-pasaje tras un filtro de contaminación contra los conjuntos de evaluación: TyDi-QA árabe (6.331) e inglés (2.018), ARCD (372), SQuAD v1.1 train (6.501) y 24.110 consultas cross-lingual (17.559 ar→en, 6.551 en→ar) traducidas automáticamente con Gemma-4-26B-A4B. Se usó un negativo duro por consulta, minado con `multilingual-e5-small` (rangos 1-30, margen de coseno 0,02, filtro de casi duplicados); las consultas sin candidato válido recibieron un pasaje aleatorio en el mismo idioma. La receta fue MultipleNegativesRankingLoss con GradCache (mini-batch 16, batch efectivo 64), learning rate 1e-5 con 10 % de warm-up, escala 50, 1 época (614 pasos), máximo 256 tokens, precisión mixta bf16, semilla 18 y una única NVIDIA GB10. Finalmente se aplicó WiSE-FT con `W = 0.6 W_base + 0.4 W_finetuned` en fp32, con alpha 0,4 fijado sobre una suite de validación pre-registrada antes de entrenar la semilla 18. Los datos de evaluación de MTEB(ara) y los artículos de test no se usaron en entrenamiento.

## Capacidades

- Generación de embeddings de frases para búsqueda semántica y recuperación de pasajes.
- Retrieval cross-lingual en las cuatro direcciones: ar→ar, en→en, ar→en y en→ar.
- Búsqueda monolingüe en árabe y en inglés con un único modelo.
- Soporte de instrucciones de consulta mediante `encode_query` (sentence-transformers ≥ 5.0) o prefijo manual en otros frameworks.
- Integración con pipelines RAG: los embeddings de 1.024 dimensiones son compatibles con índices vectoriales estándar (FAISS, Qdrant, pgvector, etc.).
- Compatible con Text Embeddings Inference (tag `text-embeddings-inference`) y con endpoints compatibles (tag `endpoints_compatible`).
- Evaluado en MTEB(ara, v1) y en un benchmark interno bilingüe con métrica MRR@10.
- No soporta tool calling, agentes, visión, audio ni modo thinking: es exclusivamente un modelo de embeddings.

## Casos de uso

- **RAG bilingüe árabe-inglés**: indexar una base documental en inglés y permitir consultas en árabe (o viceversa) con un único embedder, evitando duplicar índices o cadenas de traducción. El modelo está entrenado específicamente para ar→en y en→ar, con MRR@10 de 73,6 y 90,8 respectivamente en el benchmark interno.
- **Búsqueda empresarial en corpus mixtos**: organizaciones con documentación en árabe e inglés pueden construir un índice único y recuperar pasajes relevantes independientemente del idioma de la consulta, gracias a los embeddings normalizados de 1.024 dimensiones y la similitud coseno.
- **Atención al cliente automatizada**: recuperar fragmentos de FAQ o manuales (en cualquiera de los dos idiomas) para alimentar un LLM generador en un pipeline RAG, con ventana de 512 tokens por pasaje que cubre párrafos típicos de documentación.
- **Deduplicación y clustering semántico de textos bilingües**: agrupar artículos, tickets o reseñas en árabe e inglés por similitud semántica usando los embeddings del modelo, sin necesidad de traducción previa.
- **Sistemas de preguntas y respuestas sobre noticias**: indexar artículos periodísticos y recuperar los pasajes que responden a una pregunta del usuario, aprovechando que el entrenamiento excluyó los artículos de test para evitar contaminación.
- **Evaluación y auditoría de retrieval**: dado que el autor publica el benchmark y el código de evaluación, el modelo sirve como referencia reproducible para comparar nuevas variantes de fine-tuning o de negativos duros en entornos árabe-inglés.
- **Búsqueda en bases de conocimiento académicas**: recuperar pasajes de papers o documentación técnica en inglés a partir de consultas en árabe, escenario habitual en universidades del mundo árabe con literatura mayoritariamente anglófona.

## Benchmarks y rendimiento

Benchmark interno bilingüe (MRR@10 × 100; TyDi-QA, ARCD, XQuAD; 6.823 consultas de test; train, dev y test de artículos disjuntos):

| Modelo | Params | ar→ar | en→en | ar→en | en→ar | Macro |
|---|---:|---:|---:|---:|---:|---:|
| bge-m3 | 568M | 80,2 | 87,8 | 63,3 | 67,8 | 74,8 |
| v2: arabic-english-bge-m3-retrieval | 568M | 85,4 | 89,8 | 71,2 | 82,6 | 82,2 |
| harrier-oss-v1-0.6b (base) | 596M | 84,9 | 91,5 | 64,3 | 88,1 | 82,2 |
| **este modelo** (semilla 18) | 596M | **87,1** | **92,8** | **73,6** | **90,8** | **86,1** |
| misma receta, media de semillas 18 y 19 | 596M | 86,9 | 92,8 | 73,6 | 90,7 | 86,0 |

Bootstrap pareado sobre consultas (10.000 remuestreos; sistema = media por consulta de semillas 18 y 19; estimación puntual [IC 95 %]): frente al modelo base, ar→en +9,3 [+8,0, +10,5] y macro +3,8 [+3,4, +4,2]; frente a v2, ar→en +2,4 [+0,7, +4,2] y macro +3,8 [+3,1, +4,4].

MTEB(ara, v1) (19 tareas, mteb 2.26.33; la media cross-lingual ar-en promedia los subconjuntos árabe-inglés de MLQA, Belebele, XPQA, STS17, Flores y Tatoeba):

| Modelo | Mean (Task) | Media cross-lingual ar-en |
|---|---:|---:|
| bge-m3 | 71,98 | 73,27 |
| v2: arabic-english-bge-m3-retrieval | 72,29 | 75,00 |
| harrier-oss-v1-0.6b (base) | 73,18 | 76,00 |
| **este modelo** (semilla 18) | **73,72** | **78,00** |
| misma receta, media de semillas 18 y 19 | 73,67 | 78,04 |

## Requisitos de hardware

- **VRAM estimada en fp16/bf16**: aproximadamente 1,2 GB solo para los pesos (596M parámetros × 2 bytes), más overhead de activaciones y tokenizador; en la práctica, alrededor de 2-3 GB para batches pequeños.
- **VRAM estimada en fp32**: aproximadamente 2,4 GB para los pesos, más overhead.
- **GPU recomendadas**: NVIDIA GB10 (utilizada en el entrenamiento), A100, H100 para despliegues de alto throughput; RTX 4090, RTX 3090, L4 y A10 para inferencia estándar.
- **Consumer GPU**: sí, cabe holgadamente en cualquier GPU consumer con 4 GB o más de VRAM (RTX 3060, RTX 4060, RTX 4090, etc.), e incluso en CPU para volúmenes moderados.
- **Opciones de despliegue**: sentence-transformers (nativo), Text Embeddings Inference (tag `text-embeddings-inference`), endpoints compatibles, y exportación a otros formatos mediante las herramientas habituales de sentence-transformers (no se documentan pesos GGUF en el repositorio).
- **Latencia y throughput**: no disponibles en la información proporcionada; dependen del hardware y del tamaño de batch. La longitud máxima de 512 tokens y las 1.024 dimensiones mantienen el coste por embedding contenido.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Idioma | MTEB(ara) Mean | Cross-lingual ar-en | Licencia |
|---|---:|---:|---|---:|---:|---|
| **este modelo** | 596M | 512 | ar, en | 73,72 | 78,00 | MIT |
| harrier-oss-v1-0.6b (base) | 596M | 512 | multilingüe | 73,18 | 76,00 | MIT |
| arabic-english-bge-m3-retrieval (v2) | 568M | 8.192 (bge-m3) | ar, en | 72,29 | 75,00 | MIT (según repo) |
| bge-m3 | 568M | 8.192 | multilingüe | 71,98 | 73,27 | MIT |

El modelo supera a su base y a las alternativas bge-m3 en las métricas publicadas, con la ventaja de un contexto menor (512 frente a 8.192 tokens de bge-m3), lo que puede ser relevante para pasajes muy largos. La variante de 4B de la misma serie (`mzahran1/arabic-english-qwen3-4b-retrieval`) no tiene resultados publicados en la información disponible.

## Limitaciones y advertencias

- **Longitud de contexto limitada**: 512 tokens por defecto; los documentos más largos deben dividirse en pasajes, lo que puede perder contexto en textos extensos.
- **Cobertura lingüística restringida**: solo árabe e inglés; no está diseñado para otros idiomas, aunque el modelo base sea multilingüe.
- **Riesgo de sesgo**: el entrenamiento usa traducciones automáticas con Gemma-4-26B-A4B para las consultas cross-lingual, lo que puede introducir sesgos o errores de traducción en dominios especializados.
- **Alucinación**: como modelo de embeddings no genera texto, pero en un pipeline RAG los pasajes recuperados pueden no contener la respuesta; la calidad final depende del generador.
- **Datos de entrenamiento con licencias propias**: TyDi-QA (Apache-2.0), ARCD (MIT) y SQuAD v1.1 (CC BY-SA 4.0); la licencia MIT del modelo no exime de cumplir las licencias de los datos subyacentes.
- **Sin paper publicado**: el preprint está en preparación y aún no tiene identificador arXiv; las cifras deben citarse desde el repositorio.
- **Madurez limitada**: 0 descargas y 0 likes en el momento de la consulta, creado en noviembre de 2026; no hay evidencia de uso en producción a gran escala.
- **Instrucción de query obligatoria**: en frameworks distintos de sentence-transformers ≥ 5.0 hay que anteponer manualmente la cadena de instrucción exacta; omitirla degrada el rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mzahran1/arabic-english-harrier-0.6b-retrieval
- Modelo base: https://huggingface.co/microsoft/harrier-oss-v1-0.6b
- Versión anterior (v2): https://huggingface.co/mzahran1/arabic-english-bge-m3-retrieval
- Variante de 4B: https://huggingface.co/mzahran1/arabic-english-qwen3-4b-retrieval
- Código y benchmark de evaluación: https://github.com/mahmoudzahran01/arabic-english-retrieval-eval
