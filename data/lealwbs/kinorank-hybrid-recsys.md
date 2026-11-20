# Lealwbs/kinorank-hybrid-recsys

## Resumen

KinoRank (`Lealwbs/kinorank-hybrid-recsys`) es un sistema de recomendación híbrido de tres etapas orientado a catálogos de cine, desarrollado por el usuario Lealwbs. No es un modelo de lenguaje generativo en sentido estricto, sino un pipeline de ranking que combina factorización matricial implícita (ALS), búsqueda vectorial semántica densa (embeddings de `BAAI/bge-small-en-v1.5` indexados en FAISS) y un ranker supervisado de LightGBM con objetivo LambdaRank, rematado por una capa de reordenación y explicabilidad basada en agentes GenAI con guardarraíles anti-alucinación sobre el catálogo.

El problema que aborda es el de la recomendación personalizada de películas con requisitos de baja latencia, diversidad y explicabilidad. La combinación de recuperación colaborativa y semántica mediante Reciprocal Rank Fusion (RRF) permite cubrir tanto usuarios con historial denso como consultas en lenguaje natural, mientras que LightGBM ordena los candidatos con 15 características de usuario, ítem e interacción cruzada y MMR controla el efecto filter bubble.

Es relevante por su enfoque de ingeniería completo y reproducible: separación cronológica estricta por usuario (70/15/15), benchmarks publicados con NDCG@10, Recall@20 y MAP@10 frente a baselines de popularidad, ALS y búsqueda semántica pura, y artefactos serializados listos para despliegue. El repositorio es de tamaño 0.0 GB según Hugging Face, con licencia MIT y cero descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline híbrido de 3 etapas: ALS (factorización matricial implícita) + FAISS ANN sobre embeddings densos + LightGBM LambdaRank + MMR + capa agéntica GenAI |
| Parametros totales | no disponible (no es un modelo neuronal único; el ranker es un booster LightGBM y el encoder semántico es `BAAI/bge-small-en-v1.5`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto; el encoder semántico procesa metadatos de ítem) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los metadatos del catálogo están en inglés según los ejemplos de consulta de la model card) |
| Licencia | MIT |
| Formato de pesos | `.npz` (ALS), `.index` (FAISS), `.npy` (embeddings), `.txt` (booster LightGBM), `.parquet` (estadísticas de características) |

## Arquitectura y entrenamiento

La etapa 1 realiza recuperación híbrida de candidatos con latencia declarada inferior a 20 ms. La vía colaborativa usa ALS implícito con `factors=64` y confianza ponderada por recencia, incluyendo una proyección cerrada de fold-in para cold-start interactivo e importaciones de Letterboxd. La vía semántica genera embeddings L2-normalizados de 384 dimensiones con `BAAI/bge-small-en-v1.5` sobre metadatos enriquecidos (título, año, géneros, director, reparto, tags de usuario y sinopsis) e indexa en `faiss.IndexFlatIP`. Ambas vías se fusionan con Reciprocal Rank Fusion en un Top-100, filtrando estrictamente los ítems ya vistos.

La etapa 2 entrena un LightGBM con `objective="lambdarank"` sobre 15 características de usuario, ítem e interacción cruzada: puntuación RRF, producto escalar ALS, similitud coseno FAISS, afinidad de género con decaimiento temporal, solapamiento de género principal, coincidencia de década y director, cosine lift de co-ocurrencia ítem-ítem, rating bayesiano y velocidad de popularidad logarítmica. En inferencia se calculan atribuciones TreeSHAP exactas (`pred_contrib=True`) y se aplica MMR con λ = 0.75 combinando similitud semántica y de género/director para diversificar.

La etapa 3 expone herramientas Pydantic estructuradas (`parse_user_intent`, `retrieve_and_rank`, `rerank_and_explain`) y aplica un guardarraíl duro de catálogo que rechaza cualquier `movie_id` fuera del pool de candidatos de la etapa 2 o presente en el historial del usuario, declarando un 0 % de alucinación de catálogo. El conjunto de datos de entrenamiento y evaluación es `grouplens/movielens-latest-small`, con partición cronológica estricta por usuario: 70 % pasado para entrenamiento, 15 % para validación y 15 % de interacciones futuras retenidas para test (604 usuarios, sin fuga de datos).

## Capacidades

- Recomendación personalizada de películas mediante fusión de señal colaborativa y semántica.
- Búsqueda semántica sobre metadatos de catálogo con consultas en lenguaje natural (por ejemplo, filtros de género, director, duración o año).
- Ranking supervisado con LambdaRank sobre 15 características de interacción.
- Explicabilidad por ítem mediante atribuciones TreeSHAP calculadas en inferencia.
- Diversificación de resultados con MMR para mitigar filter bubbles.
- Manejo de cold-start mediante fold-in ALS y proyección cerrada para usuarios nuevos.
- Importación de historiales externos (Letterboxd) para arranque en frío.
- Orquestación agéntica con herramientas Pydantic y guardarraíl de catálogo anti-alucinación.
- Filtrado de ítems ya consumidos durante la recuperación de candidatos.

## Casos de uso

- Recomendador de plataforma de streaming: el pipeline recupera candidatos en menos de 20 ms y ordena con LightGBM, adecuado para servir peticiones interactivas con latencia p95 declarada de 14,21 ms en la configuración completa.
- Asistente conversacional de descubrimiento cinematográfico: la capa agéntica parsea intenciones como "thriller psicológico tipo Fincher, menos de 135 min, posterior a 1994, sin terror" y devuelve recomendaciones con explicación por ítem.
- Integración con Letterboxd u otros diarios de cine: el fold-in ALS permite proyectar el historial importado de un usuario nuevo sin reentrenar el modelo.
- Diversificación de feeds editoriales: MMR con λ = 0.75 equilibra relevancia y diversidad semántica y de género/director, útil para evitar que el feed repita el mismo nicho.
- Sistema de recomendación con requisitos de auditoría: las atribuciones TreeSHAP por ítem permiten justificar cada recomendación ante equipos de producto o cumplimiento.
- Prototipado de sistemas de recomendación en investigación: los artefactos serializados (ALS, índice FAISS, booster, parquet de características) y el benchmark reproducible con partición cronológica facilitan la comparación con nuevas propuestas.
- Filtrado de catálogo con guardarraíles: el rechazo de `movie_id` fuera del pool o ya vistos sirve como plantilla para pipelines donde la alucinación de catálogo es inaceptable.

## Benchmarks y rendimiento

Resultados declarados por el autor con partición cronológica estricta por usuario (70/15/15, 604 usuarios en test, sin fuga de datos):

| Arquitectura | NDCG@10 | Recall@20 | MAP@10 | Cobertura de catálogo (%) | Cold-Start HitRate@10 | Diversidad (ILD@10) | Latencia p50 (ms) | Latencia p95 (ms) |
|---|---|---|---|---|---|---|---|---|
| Popularity Baseline | 0.0515 | 0.0620 | 0.0280 | 2.50 | 0.1738 | 0.3599 | 0.01 | 0.01 |
| Collaborative-Only (ALS) | 0.0574 | 0.1181 | 0.0277 | 31.48 | 0.1474 | 0.3328 | 0.16 | 0.47 |
| Semantic-Only (FAISS) | 0.0082 | 0.0173 | 0.0038 | 32.17 | 0.0712 | 0.1967 | 0.72 | 0.87 |
| Hybrid Two-Stage (RRF + LightGBM) | 0.0642 | 0.1002 | 0.0323 | 28.94 | 0.1556 | 0.3379 | 5.93 | 7.76 |
| Hybrid + MMR (Full KinoRank) | 0.0648 | 0.1012 | 0.0325 | 28.84 | 0.1573 | 0.3421 | 11.26 | 14.21 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el pipeline combina un booster LightGBM, un índice FAISS plano (Inner Product, 384 dimensiones) y un encoder `bge-small-en-v1.5`, por lo que el consumo principal proviene del encoder y del índice en memoria.
- GPU recomendadas: no disponibles en la información proporcionada; el índice `faiss.IndexFlatIP` puede ejecutarse en CPU y el encoder es de tamaño pequeño (`bge-small`), pero no se especifican requisitos de GPU.
- Compatibilidad con GPU de consumo: no disponible; no se documenta.
- Opciones de despliegue: no se documentan explícitamente vLLM, llama.cpp, Ollama ni TGI; el uso indicado es mediante `KinoRankAgentOrchestrator` del paquete `src.agent.tools`.
- Latencia y throughput: latencias p50/p95 declaradas por el autor para la configuración completa de 11,26 ms y 14,21 ms respectivamente; el throughput no está disponible.

## Comparativa con modelos similares

| Sistema | Tipo | NDCG@10 | Recall@20 | MAP@10 | Cobertura (%) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| KinoRank (Full) | Híbrido ALS + FAISS + LightGBM + MMR + agente | 0.0648 | 0.1012 | 0.0325 | 28.84 | MIT | Hugging Face |
| ALS colaborativo puro | Factorización matricial implícita | 0.0574 | 0.1181 | 0.0277 | 31.48 | no disponible (baseline interno) | no disponible |
| Búsqueda semántica pura (FAISS) | Embeddings densos + ANN | 0.0082 | 0.0173 | 0.0038 | 32.17 | no disponible (baseline interno) | no disponible |
| Baseline de popularidad | Ranking por popularidad | 0.0515 | 0.0620 | 0.0280 | 2.50 | no disponible (baseline interno) | no disponible |

No se dispone de comparación con otros sistemas de recomendación publicados externamente en la información proporcionada.

## Limitaciones y advertencias

- El modelo se entrena y evalúa exclusivamente sobre `grouplens/movielens-latest-small`; la generalización a catálogos de producción de mayor escala no está validada en la información disponible.
- La vía semántica pura obtiene métricas muy bajas (NDCG@10 de 0.0082), por lo que el rendimiento depende críticamente de la señal colaborativa y del ranker.
- El Recall@20 del sistema completo (0.1012) es inferior al de ALS puro (0.1181), lo que indica un posible compromiso entre precisión en el top y cobertura de recuperación.
- La cobertura de catálogo cae del 31,48 % (ALS) al 28,84 % (sistema completo), lo que puede concentrar recomendaciones en un subconjunto del catálogo.
- El sistema está diseñado para cine; su aplicabilidad a otros dominios no está documentada.
- Los idiomas soportados no están declarados; los ejemplos de consulta de la model card están en inglés.
- El guardarraíl anti-alucinación se limita al catálogo (rechazo de `movie_id` fuera del pool); no cubre posibles alucinaciones en el texto explicativo generado por la capa GenAI.
- La licencia MIT permite uso comercial, pero no se documentan garantías, mantenimiento ni soporte del autor.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin evidencia de adopción externa.
- No se documentan sesgos demográficos ni de exposición medidos; la diversidad se controla solo vía MMR sobre similitud semántica y de género/director.

## Enlaces

- Hugging Face: https://huggingface.co/Lealwbs/kinorank-hybrid-recsys
- Dataset: https://huggingface.co/datasets/grouplens/movielens-latest-small
- Encoder semántico: https://huggingface.co/BAAI/bge-small-en-v1.5
- Paper de LightGBM LambdaRank: no disponible en la información proporcionada
- Paper de FAISS: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
