# mzahran1/arabic-english-e5-base-retrieval

## Resumen

`mzahran1/arabic-english-e5-base-retrieval` es un modelo de embeddings de frases (sentence transformer) de 278 millones de parámetros, afinado a partir de `intfloat/multilingual-e5-base` para recuperación de información (retrieval) sobre texto mixto árabe-inglés. Lo desarrolla el usuario independiente mzahran1 y está pensado para sistemas RAG y motores de búsqueda semántica donde las consultas y los documentos pueden estar en idiomas distintos (por ejemplo, una pregunta en árabe que debe encontrar un pasaje en inglés).

El modelo resuelve un problema concreto y medible: los embedders multilingües genéricos rinden notablemente peor en recuperación cruzada árabe-inglés que en recuperación monolingüe. Según la model card, este modelo eleva el MRR@10 de la dirección ar→en de 49,9 (base e5-base) a 66,6, y de 63,3 (bge-m3) a 66,6, manteniendo el rendimiento monolingüe. Se distribuye con licencia MIT y arquitectura XLM-RoBERTa base.

La relevancia actual viene de su enfoque de destilación: se entrena destilando conocimiento de un modelo hermano mayor (v2-m3) mediante KL listwise sobre similitudes in-batch, en lugar de con cross-entropy supervisado. El resultado es un embedder de 278M que, combinado con su reranker complementario de 118M, alcanza un MRR macro de 84,0 en el benchmark bilingüe del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa base (transformer encoder), sentence-transformers |
| Parametros totales | 278.043.648 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; el autor indica que no se entrenó con texto de más de 256 tokens |
| Tipos de cuantizacion | no disponible (pesos safetensors; compatible con text-embeddings-inference) |
| Idiomas soportados | árabe (ar), inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer XLM-RoBERTa base (278M parámetros) adaptado como sentence transformer para producir embeddings de frases. Se inicializa desde `intfloat/multilingual-e5-base` y se afina mediante destilación desde el modelo hermano v2-m3: la receta es KL listwise sobre las similitudes in-batch (temperatura T = 20), sin término de cross-entropy, durante 2 épocas, con learning rate 3e-5, batch de 64 y precisión bf16. Los pesos publicados son la media uniforme (weight soup) de tres semillas de entrenamiento.

Los datos de entrenamiento son 39.377 ejemplos filtrados, los mismos que usa v2-m3, construidos a partir de TyDi-QA (Apache-2.0), ARCD (MIT) y SQuAD v1.1 (CC BY-SA 4.0), con preguntas traducidas automáticamente con Gemma-4-26B-A4B. Se emplean negativos duros (hard negatives). No se documenta una fase de RLHF o DPO, algo esperable en un modelo de embeddings. La innovación destacable es el uso de destilación listwise pura en lugar de entrenamiento contrastivo clásico, junto con el promediado de semillas para estabilizar el rendimiento.

## Capacidades

- Generación de embeddings de frases para similitud semántica y recuperación (pipeline `sentence-similarity`).
- Recuperación bilingüe y cruzada árabe-inglés: consultas en un idioma contra pasajes en el otro.
- Recuperación monolingüe en árabe y en inglés.
- Soporte de negativos duros, adecuado para pipelines RAG con re-ranking posterior.
- Compatible con `text-embeddings-inference` y con endpoints de Hugging Face.
- Requiere prefijos e5 obligatorios: `query: ` para consultas y `passage: ` para documentos.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento: es exclusivamente un modelo de embeddings.

## Casos de uso

- Búsqueda empresarial bilingüe: indexar documentación interna en inglés y permitir consultas en árabe, usando los embeddings del modelo como primera etapa de recuperación en un motor vectorial (FAISS, Qdrant, pgvector) y el reranker complementario como segunda etapa.
- RAG sobre corpus mixtos árabe-inglés: recuperar pasajes relevantes de una base de conocimiento con documentos en ambos idiomas para alimentar un LLM generador; el modelo cubre la fase de retrieval con MRR ar→en de 66,6, muy superior al e5-base original.
- Atención al cliente en mercados del Golfo: un chatbot que recibe preguntas en árabe y busca respuestas en una base de FAQ mantenida en inglés, sin necesidad de traducir previamente el corpus.
- Búsqueda académica o legal: localizar fragmentos de artículos o contratos en inglés a partir de consultas en árabe, aprovechando la ventana de 256 tokens adecuada para pasajes cortos.
- Deduplicación y clustering semántico de contenido bilingüe: agrupar noticias o tickets que tratan el mismo tema en distintos idiomas mediante similitud de embeddings.
- Evaluación y monitorización de sistemas de recuperación: usar el modelo como baseline reproducible en pruebas de regresión de calidad de búsqueda, dado que el autor publica el código y los resultados del benchmark.
- Filtrado previo en pipelines de moderación o clasificación: calcular similitud entre consultas y taxonomías predefinidas en ambos idiomas.

## Benchmarks y rendimiento

Resultados de la model card: MRR@10 × 100 sobre el benchmark bilingüe del autor (TyDi-QA, ARCD, XQuAD; 6.823 consultas de test; artículos de train/dev/test disjuntos y auditoría de fuga de datos).

| Modelo | Params | ar→ar | en→en | ar→en | en→ar | macro |
|---|---:|---:|---:|---:|---:|---:|
| multilingual-e5-base (base) | 278M | 78,0 | 89,8 | 49,9 | 71,9 | 72,4 |
| bge-m3 | 568M | 80,2 | 87,8 | 63,3 | 67,8 | 74,8 |
| v1 e5-small (3 semillas) | 118M | 80,3 ± 0,2 | 87,3 ± 0,2 | 54,7 ± 0,6 | 80,4 ± 0,4 | 75,7 ± 0,1 |
| **este modelo** (soup 3 semillas) | 278M | 82,2 | 89,7 | 66,6 | 82,2 | 80,2 |
| mismas semillas individuales | 278M | 82,1 ± 0,1 | 89,6 ± 0,1 | 65,9 ± 0,2 | 81,9 ± 0,3 | 79,9 ± 0,1 |
| este modelo + reranker (top-50) | 278M + 118M | 87,1 | 90,7 | 74,4 | 83,8 | 84,0 |

MTEB(ara, v1), 19 tareas con el mismo pipeline para todos los modelos:

| Métrica | multilingual-e5-base | este modelo |
|---|---:|---:|
| Mean (Task), 19 tareas | 67,89 | 68,91 |
| Mean (TaskType) | 67,28 | 67,62 |
| Subconjuntos ar-en cross-lingual | 69,1 | 74,2 |
| Subconjuntos solo árabe | 66,5 | 66,3 |

Guardas de regresión solo árabe (MTEB(ara)):

| Tarea | multilingual-e5-base | este modelo |
|---|---:|---:|
| MIRACLRetrievalHardNegatives.v2 | 73,0 | 70,7 |
| NamaaMrTydiReranking | 77,1 | 68,2 |
| SemRel24STS | 59,2 | 59,0 |

El autor reporta bootstrap pareado por consulta (2.000 remuestreos): frente a e5-base, +16,7 en ar→en [+14,8, +18,6] y +10,3 en en→ar [+8,8, +11,9]; frente a bge-m3, +3,2 en ar→en [+1,4, +5,1] y +14,5 en en→ar [+12,6, +16,2]. La mejora de +1,02 en MTEB(ara) Mean (Task) tiene un intervalo de confianza que incluye 0.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,1 GB de pesos (tamaño del repo); en fp16/bf16 alrededor de 0,55 GB, más memoria de activaciones y del tokenizador.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para volúmenes moderados.
- GPU recomendadas para producción de alto throughput: A100, H100, L4 o T4 para despliegues con `text-embeddings-inference`.
- Opciones de despliegue: `sentence-transformers` (PyTorch), `text-embeddings-inference` (soportado explícitamente según los tags), y servidores de embeddings compatibles con safetensors. No se documenta soporte GGUF ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Licencia | Rendimiento clave (MRR macro bilingüe) | Disponibilidad |
|---|---:|---|---|---:|---|
| este modelo | 278M | no disponible (entrenado ≤256 tokens) | MIT | 80,2 | Hugging Face, safetensors |
| intfloat/multilingual-e5-base | 278M | no disponible | MIT | 72,4 | Hugging Face |
| bge-m3 | 568M | no disponible | MIT | 74,8 | Hugging Face |
| v1 e5-small (del mismo autor) | 118M | no disponible | no disponible | 75,7 | Hugging Face |

Frente a e5-base, este modelo mejora sobre todo en recuperación cruzada ar→en (+16,7 MRR) y en→ar (+10,3), con un coste nulo en en→en (-0,1, no significativo). Frente a bge-m3, gana en las cuatro direcciones con la mitad de parámetros, aunque bge-m3 es un modelo más generalista y con mayor contexto declarado.

## Limitaciones y advertencias

- Evaluado solo en QA factoid de estilo Wikipedia; el rendimiento en documentos empresariales no está medido.
- Olvida parcialmente el re-ranking solo árabe: Mr.TyDi Arabic reranking cae de 77,1 a 68,2 y MIRACL-HN de 73,0 a 70,7. Para cargas puramente árabes de re-ranking conviene usar e5-base o bge-m3.
- La mejora de +1,02 en MTEB(ara) Mean (Task) no es estadísticamente distinguible con 19 tareas (el intervalo de confianza incluye 0), aunque gana en 15 de 19.
- Los prefijos e5 (`query: `, `passage: `) son obligatorios; omitirlos degrada la calidad.
- No se entrenó con texto de más de 256 tokens; pasajes largos pueden perder información.
- Fuga de datos divulgada: una comprobación post-hoc encontró 9 filas de entrenamiento que coinciden con consultas del dev set de MTEB MIRACL-HN.v2 en árabe (0,8 % de sus consultas). No se reentrenó; el efecto sobre la puntuación reportada es pequeño y esta ya está por debajo de la del modelo base.
- Riesgo de alucinación: no aplica directamente al ser un modelo de embeddings, pero los sistemas RAG que lo usen heredan el riesgo del LLM generador.
- Sesgos: no documentados en la información disponible; los datasets de origen (TyDi-QA, ARCD, SQuAD) pueden introducir sesgos de dominio y de estilo enciclopédico.
- Licencia MIT para el modelo; los datos de entrenamiento conservan sus propias licencias (SQuAD v1.1 es CC BY-SA 4.0, lo que puede afectar a la redistribución de derivados si se consideran obra derivada).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mzahran1/arabic-english-e5-base-retrieval
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-base
- Reranker complementario: https://huggingface.co/mzahran1/arabic-english-reranker-mminilm
- Repositorio de código y benchmark: https://github.com/mahmoudzahran01/arabic-english-retrieval-eval
- Resultados completos (docs/retrieval/RESULTS_v2.md): https://github.com/mahmoudzahran01/arabic-english-retrieval-eval/blob/main/docs/retrieval/RESULTS_v2.md
- Dataset TyDi-QA: https://huggingface.co/datasets/google-research-datasets/tydiqa
- Dataset ARCD: https://huggingface.co/datasets/hsseinmz/arcd
- Dataset SQuAD: https://huggingface.co/datasets/rajpurkar/squad
