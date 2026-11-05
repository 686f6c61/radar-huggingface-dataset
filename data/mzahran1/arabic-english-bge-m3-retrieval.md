# mzahran1/arabic-english-bge-m3-retrieval

## Resumen

`mzahran1/arabic-english-bge-m3-retrieval` es un modelo de embeddings de frases (sentence-transformers) derivado de `BAAI/bge-m3` y ajustado específicamente para recuperación de información bilingüe árabe-inglés. Lo desarrolla el usuario mzahran1 y resuelve un problema concreto: el caso difícil en el que una consulta en árabe debe recuperar un pasaje en inglés (y viceversa), escenario en el que el bge-m3 original rinde de forma notablemente peor que en recuperación monolingüe. Está pensado para pipelines de RAG y búsqueda semántica sobre corpus mixtos árabe/inglés.

Técnicamente es un XLM-RoBERTa de 568M parámetros (567.754.752 exactos según safetensors) que reutiliza la arquitectura y los pesos de bge-m3, con fine-tuning sobre 39.377 pares pregunta-pasaje y una interpolación posterior de pesos (WiSE-FT: 60 % pesos originales + 40 % pesos ajustados) para limitar el olvido catastrófico. No usa prefijos de instrucción, como el modelo base, y produce embeddings densos normalizados en L2.

Su relevancia actual radica en que mejora de forma medible y estadísticamente significativa el rendimiento cross-lingual árabe-inglés frente al bge-m3 de referencia (MRR@10 macro de 82,2 frente a 74,8 en su benchmark bilingüe), manteniendo prácticamente intacto el rendimiento monolingüe. Se publica con licencia MIT y un benchmark reproducible con auditoría de fuga de datos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa), base de BAAI/bge-m3 |
| Parámetros totales | 567.754.752 (568M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens vistos en entrenamiento (el modelo base bge-m3 soporta hasta 8192; no se especifica el máximo efectivo tras el fine-tuning) |
| Tipos de cuantización | no disponible (pesos en safetensors; compatible con cuantización estándar de sentence-transformers, sin datos publicados) |
| Idiomas soportados | árabe (ar) e inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería sentence-transformers) |

## Arquitectura y entrenamiento

El modelo parte de `BAAI/bge-m3`, un encoder XLM-RoBERTa de 568M parámetros que genera embeddings densos normalizados. Sobre esa base se aplicó un fine-tuning con `MultipleNegativesRankingLoss` a través de GradCache (mini-batch de 16, batch efectivo de 64), learning rate 1e-5, escala 50, una época, longitud máxima de 256 tokens y precisión bf16, ejecutado en una NVIDIA GB10.

Los datos de entrenamiento son 39.377 ejemplos tras un filtro de contaminación: TyDi-QA en árabe e inglés, ARCD, SQuAD v1.1 train y consultas cross-lingual traducidas automáticamente con Gemma-4-26B-A4B (ar→en y en→ar, 24.131 en total). Se minó un hard negative por consulta con el modelo base (rangos 1-30, margen de coseno 0,02). Tras el fine-tuning se aplicó interpolación de pesos WiSE-FT: `W = 0,6 · W_bge-m3 + 0,4 · W_finetuned`, con el coeficiente 0,4 elegido sobre una suite de validación pre-registrada (dev, consultas de train de MIRACL retenidas, proxy mMARCO-ar, XNLI-train, sondas ArSarcasm y STS-B árabe), nunca sobre MTEB. No se reporta uso de RLHF ni DPO; es un ajuste puramente contrastivo.

## Capacidades

- Generación de embeddings densos de frases para búsqueda semántica y recuperación de pasajes.
- Recuperación cross-lingual árabe↔inglés: consultas en un idioma recuperan pasajes en el otro.
- Recuperación monolingüe en árabe y en inglés.
- Similitud semántica de frases (pipeline `sentence-similarity`), útil para deduplicación y clustering.
- Soporte de re-ranking en dos etapas combinado con el cross-encoder compañero `mzahran1/arabic-english-reranker-mminilm`.
- Compatible con Text Embeddings Inference (tag `text-embeddings-inference`) y con endpoints de HuggingFace (tag `endpoints_compatible`).
- No soporta tool calling, agentes ni modos de razonamiento: es un modelo de embeddings, no generativo.

## Casos de uso

- RAG bilingüe sobre documentación corporativa: indexar documentos en inglés y permitir consultas en árabe (o al revés) recuperando los pasajes correctos, gracias a la mejora de +7,5 puntos de MRR@10 en ar→en y +15,0 en en→ar frente a bge-m3.
- Búsqueda semántica en bases de conocimiento mixtas árabe/inglés: un único índice vectorial sirve ambas lenguas, evitando mantener dos índices separados o traducir consultas en tiempo de ejecución.
- Atención al cliente multilingüe: recuperación de artículos de ayuda y FAQs en inglés a partir de consultas de usuarios en árabe, alimentando un generador posterior en un pipeline RAG.
- Búsqueda académica o legal: localizar pasajes relevantes en corpus donde las fuentes están en inglés pero los usuarios formulan preguntas en árabe.
- Deduplicación y clustering de contenido bilingüe: usar los embeddings normalizados para agrupar documentos equivalentes entre ambos idiomas.
- Re-ranking de precisión: combinar este bi-encoder como primera etapa (top-50) con el cross-encoder compañero, que eleva el MRR@10 macro a 84,3.
- Evaluación comparativa de sistemas de recuperación: el benchmark público y auditado contra fugas permite reproducir y comparar pipelines.

## Benchmarks y rendimiento

Test MRR@10 × 100 sobre el benchmark bilingüe (TyDi-QA, ARCD, XQuAD; 6.823 consultas de test; artículos de train/dev/test disjuntos; auditoría de fuga):

| Modelo | Params | ar→ar | en→en | ar→en | en→ar | Macro |
|---|---:|---:|---:|---:|---:|---:|
| bge-m3 (base) | 568M | 80,2 | 87,8 | 63,3 | 67,8 | 74,8 |
| v1 e5-small (3 semillas) | 118M | 80,3 ± 0,2 | 87,3 ± 0,2 | 54,7 ± 0,6 | 80,4 ± 0,4 | 75,7 ± 0,1 |
| Este modelo (semilla 13, WiSE 0,4) | 568M | 85,4 | 89,8 | 71,2 | 82,6 | 82,2 |
| Misma receta, semillas confirmatorias 16/17 | 568M | 85,5 ± 0,0 | 89,7 ± 0,1 | 70,7 ± 0,5 | 82,6 ± 0,1 | 82,1 ± 0,1 |
| Este modelo + reranker compañero (top-50) | 568M + 118M | 87,4 | 90,9 | 75,3 | 83,6 | 84,3 |

MTEB(ara, v1) (19 tareas, mismo pipeline para todos los modelos):

| MTEB(ara, v1) | bge-m3 | Este modelo |
|---|---:|---:|
| Mean (Task), 19 tareas | 71,98 | 72,29 |
| Mean (TaskType) | 70,89 | 70,93 |
| Subconjuntos cross-lingual ar-en | 73,3 | 75,0 |
| Subconjuntos solo árabe | 70,4 | 70,5 |

Guardas de regresión solo árabe (MTEB(ara)):

| Tarea | bge-m3 | Este modelo |
|---|---:|---:|
| MIRACLRetrievalHardNegatives.v2 | 78,9 | 77,9 |
| NamaaMrTydiReranking | 79,4 | 76,0 |
| SemRel24STS | 59,1 | 60,9 |

La mejora frente a bge-m3 en el benchmark bilingüe es significativa (bootstrap pareado, 2.000 remuestreos): +7,4 de macro con IC 95 % [+6,9, +7,9]. En MTEB(ara) la diferencia de +0,31 no es estadísticamente distinguible (IC 95 % [-0,34, +0,93]).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB en fp16/bf16 para los 568M parámetros, más overhead de activaciones y batch; en fp32 rondaría 2,3 GB.
- GPU recomendadas: NVIDIA GB10 (usada en el entrenamiento), A100, H100 o cualquier GPU con al menos 4 GB de VRAM para inferencia en fp16.
- Cabe en GPU de consumo: sí, en RTX 3060/4060, RTX 4090 y similares con 8 GB o más; también en GPUs integradas o CPU para lotes pequeños.
- Opciones de despliegue: sentence-transformers, Text Embeddings Inference (tag oficial), HuggingFace Endpoints, integración en pipelines con FAISS, Qdrant, Milvus o pgvector.
- Latencia y throughput: no se han publicado mediciones en la información disponible.

## Comparativa con modelos similares

| Modelo | Params | Contexto | MRR@10 macro (benchmark bilingüe) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| Este modelo | 568M | 256 (entrenamiento) | 82,2 | MIT | HuggingFace |
| BAAI/bge-m3 | 568M | hasta 8192 | 74,8 | MIT | HuggingFace |
| v1 e5-small (del mismo autor) | 118M | no disponible | 75,7 | no disponible | HuggingFace |

Frente a bge-m3, este modelo gana sobre todo en recuperación cross-lingual (especialmente en→ar, +15,0) a costa de una ligera pérdida en tareas de re-ranking árabe (MIRACL-HN -1,0; Mr.TyDi reranking -3,4). Frente a la variante e5-small de 118M del mismo autor, este modelo es más pesado pero claramente superior en cross-lingual y en recuperación monolingüe árabe.

## Limitaciones y advertencias

- Evaluado únicamente en QA factoidal de estilo Wikipedia con un pasaje dorado por consulta; las ganancias sobre documentos empresariales no están medidas.
- El olvido se reduce, no se elimina: pierde 1,0 en MIRACL-HN y 3,4 en Mr.TyDi Arabic reranking frente a bge-m3, y gana 1,8 en SemRel24 STS.
- Con el cross-encoder compañero en top-50, la ventaja de primera etapa frente a bge-m3 desaparece en ar→en (75,3 frente a 75,3).
- Las consultas cross-lingual de entrenamiento son traducciones automáticas; no se vieron textos de más de 256 tokens durante el entrenamiento, lo que puede degradar la recuperación de pasajes largos.
- Fuga de datos divulgada: una comprobación post-hoc de coincidencia exacta encontró 9 filas de entrenamiento (8 preguntas TyDi-ar distintas) idénticas a consultas del dev set de MTEB MIRACL-HN.v2 ar (0,8 % de sus consultas; 0 en Mr.TyDi reranking). No se reentrenó; el efecto sobre la puntuación reportada es pequeño y esta queda por debajo de la del modelo base.
- Riesgo de alucinación: no aplica directamente (no genera texto), pero como recuperador puede devolver pasajes irrelevantes en dominios fuera de distribución.
- Licencia MIT para el modelo; los datos de entrenamiento conservan sus licencias (TyDi-QA Apache-2.0, ARCD MIT, SQuAD v1.1 CC BY-SA 4.0).
- Sin descargas ni likes en el momento de la consulta: ecosistema y validación comunitaria aún inexistentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mzahran1/arabic-english-bge-m3-retrieval
- Modelo base: https://huggingface.co/BAAI/bge-m3
- Reranker compañero: https://huggingface.co/mzahran1/arabic-english-reranker-mminilm
- Repositorio de código y benchmark: https://github.com/mahmoudzahran01/arabic-english-retrieval-eval
- Resultados completos: `docs/retrieval/RESULTS_v2.md` en el repositorio anterior
- Datasets: https://huggingface.co/datasets/google-research-datasets/tydiqa, https://huggingface.co/datasets/hsseinmz/arcd, https://huggingface.co/datasets/rajpurkar/squad
