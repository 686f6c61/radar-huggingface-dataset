# mzahran1/arabic-english-e5-small-retrieval-v2

## Resumen

`arabic-english-e5-small-retrieval-v2` es un modelo de embeddings de frases (sentence-transformers) de 117,6 millones de parámetros, desarrollado por el usuario mzahran1, especializado en recuperación de información (retrieval) bilingüe árabe-inglés. Se obtiene por destilación del checkpoint v2-m3 del mismo autor sobre la base `intfloat/multilingual-e5-small`, una arquitectura BERT de tipo encoder. Su objetivo es resolver un problema concreto: la recuperación cruzada entre consultas en árabe y pasajes en inglés, donde los modelos multilingües genéricos pequeños rinden muy por debajo de lo esperado.

El modelo es la versión v2 de la familia y mejora en +5,0 puntos el MRR@10 en la dirección árabe→inglés respecto a su predecesor v1, manteniendo el mismo tamaño. Frente al modelo base `multilingual-e5-small`, la mejora en esa dirección es de +18,3 puntos de MRR@10, aunque no alcanza a `bge-m3` (568M parámetros) en esa misma dirección. Su relevancia actual radica en que ofrece una alternativa ligera (118M) para pipelines RAG que operan con documentación mixta árabe/inglés, con licencia MIT y compatibilidad con text-embeddings-inference.

El contexto de entrenamiento está limitado a 256 tokens, y el modelo exige los prefijos `query: ` y `passage: ` propios de la familia e5. No se han publicado datos de benchmarks generales (MMLU, HumanEval) porque no es un modelo generativo, sino un encoder de similitud.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT), derivado de `intfloat/multilingual-e5-small` |
| Parámetros totales | 117.653.760 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens (límite visto en entrenamiento; no se especifica máximo arquitectónico) |
| Tipos de cuantización | No disponible (formato safetensors; cuantización no documentada) |
| Idiomas soportados | Árabe (ar), inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería sentence-transformers) |

## Arquitectura y entrenamiento

El modelo es un encoder BERT de 118M parámetros, inicializado desde `intfloat/multilingual-e5-small` y afinado mediante destilación desde el checkpoint v2-m3 del mismo autor. La receta de entrenamiento emplea una pérdida KL listwise sobre las similitudes in-batch (temperatura T = 20), sin término de entropía cruzada, durante 2 épocas, con learning rate 3e-5, batch de 64 y precisión bf16. Los pesos publicados son la media uniforme (weight soup) de tres semillas distintas, lo que reduce la varianza entre ejecuciones.

Los datos de entrenamiento son los mismos 39.377 ejemplos filtrados que usó v2-m3, construidos a partir de TyDi-QA, ARCD y SQuAD v1.1, con preguntas traducidas automáticamente mediante Gemma-4-26B-A4B. No se documenta el uso de RLHF ni DPO, ya que no es un modelo generativo. La innovación técnica principal es la destilación listwise de un modelo mayor (v2-m3) hacia un encoder pequeño, manteniendo el rendimiento en recuperación cruzada sin aumentar el tamaño del modelo.

## Capacidades

- Generación de embeddings de frases para similitud semántica y recuperación de pasajes.
- Recuperación bilingüe árabe-inglés en las cuatro direcciones (ar→ar, en→en, ar→en, en→ar).
- Soporte de búsqueda semántica sobre texto mixto árabe/inglés.
- Integración con pipelines RAG mediante sentence-transformers.
- Compatibilidad con text-embeddings-inference y endpoints compatibles.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es un encoder, no un modelo generativo.
- No dispone de capacidades de visión ni audio.
- Capacidades multilingües limitadas a árabe e inglés.

## Casos de uso

- Recuperación en RAG bilingüe: el modelo indexa pasajes en inglés y resuelve consultas en árabe con un MRR@10 de 59,7 en el benchmark del autor, lo que lo hace adecuado para asistentes documentales donde el usuario pregunta en árabe pero las fuentes están en inglés.
- Búsqueda semántica en bases de conocimiento mixtas: permite un único índice vectorial para documentos en ambos idiomas, reduciendo la infraestructura frente a mantener dos modelos monolingües.
- Atención al cliente automatizada: con 118M parámetros y contexto de 256 tokens, puede desplegarse en CPU o GPU modesta para recuperar fragmentos de FAQ y artículos de ayuda en árabe e inglés.
- Deduplicación y clustering de documentos bilingües: los embeddings permiten agrupar textos equivalentes en ambos idiomas en tareas de limpieza de corpus.
- Filtrado previo en pipelines de traducción: recuperar el pasaje fuente más relevante antes de invocar un modelo de traducción o generación, reduciendo el coste de tokens.
- Reranking de segunda etapa combinado con el reranker compañero `mzahran1/arabic-english-reranker-mminilm`: la combinación alcanza un MRR@10 macro de 83,6, adecuada para sistemas de búsqueda con requisitos de precisión alta.
- Evaluación de sistemas de recuperación: sirve como baseline ligero en experimentos de cross-lingual retrieval con licencia MIT.

## Benchmarks y rendimiento

Resultados de MRR@10 × 100 en el benchmark bilingüe del autor (TyDi-QA, ARCD, XQuAD; 6.823 consultas de test; artículos de train/dev/test disjuntos; auditoría de fuga):

| Modelo | Parámetros | ar→ar | en→en | ar→en | en→ar | Macro |
|---|---:|---:|---:|---:|---:|---:|
| multilingual-e5-small (base) | 118M | 76,8 | 87,8 | 41,4 | 61,7 | 66,9 |
| bge-m3 | 568M | 80,2 | 87,8 | 63,3 | 67,8 | 74,8 |
| v1 e5-small (3 semillas) | 118M | 80,3 ± 0,2 | 87,3 ± 0,2 | 54,7 ± 0,6 | 80,4 ± 0,4 | 75,7 ± 0,1 |
| Este modelo (soup de 3 semillas) | 118M | 80,3 | 88,0 | 59,7 | 79,7 | 76,9 |
| Este modelo + reranker compañero (top-50) | 118M + 118M | 87,0 | 90,6 | 73,4 | 83,4 | 83,6 |

Comparaciones con bootstrap pareado por consulta (2.000 remuestreos, estimación puntual [IC 95%], * = IC excluye 0):

| Comparación (sistema menos referencia) | ar→ar | en→en | ar→en | en→ar | Macro |
|---|---:|---:|---:|---:|---:|
| Este modelo vs multilingual-e5-small | +3,5 [+2,7; +4,3]* | +0,2 [-0,5; +1,0] | +18,3 [+16,4; +20,3]* | +18,0 [+16,2; +19,9]* | +10,0 [+9,3; +10,8]* |
| Este modelo vs bge-m3 | +0,2 [-0,8; +1,2] | +0,2 [-0,8; +1,2] | -3,6 [-5,6; -1,7]* | +11,9 [+9,9; +13,9]* | +2,2 [+1,4; +3,0]* |
| Este modelo vs v1 (semilla 13) | +0,2 [-0,4; +0,8] | +0,7 [+0,1; +1,4]* | +4,6 [+3,3; +5,9]* | -0,7 [-1,8; +0,4] | +1,2 [+0,7; +1,7]* |

MTEB(ara, v1) con 19 tareas y el mismo pipeline para todos los modelos:

| MTEB(ara, v1) | multilingual-e5-small | Este modelo |
|---|---:|---:|
| Media (Task), 19 tareas | 65,63 | 66,20 |
| Media (TaskType) | 65,70 | 65,42 |
| Subconjuntos cross-lingual ar-en | 63,9 | 69,7 |
| Subconjuntos solo árabe | 65,0 | 64,1 |

Guardas de regresión solo en árabe (MTEB(ara)):

| Tarea | multilingual-e5-small | Este modelo |
|---|---:|---:|
| MIRACLRetrievalHardNegatives.v2 | 72,4 | 68,3 |
| NamaaMrTydiReranking | 79,2 | 68,9 |
| SemRel24STS | 51,0 | 46,1 |

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB de pesos más overhead de activaciones (el repositorio ocupa 0,5 GB).
- En fp16/bf16: aproximadamente 0,25 GB de pesos, holgado en cualquier GPU consumer.
- GPU recomendadas: RTX 3060, RTX 4090, A10, L4, A100 o H100; el modelo es lo bastante pequeño para ejecutarse en CPU con latencia aceptable en lotes pequeños.
- Cabe en cualquier GPU consumer con al menos 2 GB de VRAM, e incluso en entornos sin GPU.
- Opciones de despliegue: sentence-transformers, text-embeddings-inference, vLLM (soporte de embeddings), Hugging Face Inference Endpoints.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MRR@10 macro (benchmark del autor) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| Este modelo | 118M | 256 tokens (entrenamiento) | 76,9 | MIT | HuggingFace |
| intfloat/multilingual-e5-small | 118M | 512 tokens (arquitectura) | 66,9 | MIT | HuggingFace |
| BAAI/bge-m3 | 568M | 8.192 tokens | 74,8 | MIT | HuggingFace |

Frente a `multilingual-e5-small`, este modelo mejora sustancialmente la recuperación cruzada ar→en (+18,3) y en→ar (+18,0) a igual tamaño. Frente a `bge-m3`, pierde 3,6 puntos en ar→en, pero gana 11,9 en en→ar y 2,2 en la media macro, con un tamaño cinco veces menor.

## Limitaciones y advertencias

- Evaluado únicamente en QA factual de estilo Wikipedia; el rendimiento en documentos empresariales no está medido.
- Olvida habilidades exclusivas del árabe respecto a e5-small: Mr.TyDi Arabic reranking cae de 79,2 a 68,9, MIRACL-HN de 72,4 a 68,3 y SemRel24 STS de 51,0 a 46,1.
- La mejora de +0,57 en MTEB(ara) Media (Task) frente a e5-small está dentro del ruido; su Media (TaskType) (65,42) es inferior a la de e5-small (65,70).
- Exige los prefijos `query: ` y `passage: `; sin ellos el rendimiento se degrada.
- El texto más allá de 256 tokens no se vio durante el entrenamiento.
- Fuga de datos de entrenamiento declarada: 9 filas de entrenamiento (8 preguntas distintas de TyDi-ar) coinciden exactamente con consultas del conjunto de desarrollo de MTEB MIRACL-HN.v2 ar (0,8% de sus consultas). No se reentrenó; el efecto sobre la puntuación reportada es pequeño y esta es inferior a la del modelo base de todos modos.
- Riesgo de alucinación no aplica directamente (no genera texto), pero los embeddings pueden producir similitudes espurias en dominios no vistos.
- Licencia MIT permite uso comercial; los datos de entrenamiento conservan sus propias licencias: TyDi-QA Apache-2.0, ARCD MIT, SQuAD v1.1 CC BY-SA 4.0.
- Sin descargas ni likes en el momento de la ficha; modelo de reciente publicación y validación comunitaria limitada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mzahran1/arabic-english-e5-small-retrieval-v2
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
- Reranker compañero: https://huggingface.co/mzahran1/arabic-english-reranker-mminilm
- Repositorio de código y benchmarks: https://github.com/mahmoudzahran01/arabic-english-retrieval-eval
- Resultados completos v2: `docs/retrieval/RESULTS_v2.md` (dentro del repositorio anterior)
