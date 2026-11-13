# anon-r3skill/anon-R3-skill

## Resumen

R3-Skill es un sistema de recuperación de habilidades (*skills*) compuesto por dos modelos de embedding y reranking especializados, construidos sobre Qwen3-Embedding-0.6B y Qwen3-Reranker-0.6B respectivamente, ambos afinados por el autor `anon-r3skill`. El repositorio no contiene un modelo generativo, sino un par de codificadores orientados a una tarea concreta: dado un conjunto de descripciones de habilidades (herramientas, capacidades o funciones) y una consulta en lenguaje natural, recuperar y reordenar las habilidades relevantes. El problema que aborda es el de la selección de herramientas o capacidades en sistemas de agentes, donde el número de skills disponibles puede ser elevado y la consulta debe mapearse a un subconjunto correcto.

La relevancia del proyecto reside en su protocolo de evaluación: introduce R3-Skill como benchmark propio y evalúa también la transferencia al benchmark SkillRet (6.660 skills y 4.997 consultas en su split original). Las métricas empleadas son Recall@K, Completeness@K (Comp@K) y Set-Compatibility (Set-Compat), orientadas a consultas que requieren recuperar un conjunto completo de habilidades y no una única respuesta. El repositorio incluye los checkpoints en bf16, scripts de reproducción (`reproduce.py`, `infer.py`), datos de entrenamiento y test, y pools congelados de top-20 para garantizar la reproducibilidad.

El tamaño del repositorio es de 2,5 GB, coherente con dos modelos de aproximadamente 0,6 mil millones de parámetros almacenados en bf16 junto con los datasets. La licencia del código y de los datos redistribuidos es Apache 2.0 según la model card, aunque el campo de licencia del repositorio en Hugging Face figura como no disponible. No se especifican idiomas soportados ni pipeline en los metadatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (R3-Embedding y R3-Reranker, ambos fine-tune de Qwen3-Embedding-0.6B y Qwen3-Reranker-0.6B) |
| Parametros totales | Aproximadamente 0,6 mil millones por modelo (dos modelos en el repositorio) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos almacenados en bf16; no se documentan otras cuantizaciones |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 segun la model card; campo de licencia del repo en Hugging Face no disponible |
| Formato de pesos | safetensors (bf16, via Git LFS) |

## Arquitectura y entrenamiento

El sistema se compone de dos etapas. R3-Embedding es un modelo de embedding obtenido por fine-tuning de Qwen3-Embedding-0.6B, encargado de la recuperación inicial sobre el pool completo de skills. R3-Reranker es un modelo de reranking obtenido por fine-tuning de Qwen3-Reranker-0.6B, que reordena el top-20 congelado producido por la etapa de embedding. Ambos son modelos transformer de aproximadamente 0,6 mil millones de parámetros, almacenados en bf16, la precisión usada en todos los resultados reportados.

Los datos de entrenamiento incluidos en el repositorio son `train.jsonl` y `skip_train.jsonl` (consultas de entrenamiento de R3-Skill y anotaciones SKIP), junto con `skills_train.jsonl` como pool de habilidades de entrenamiento. No se detalla en la información disponible el número de tokens de entrenamiento, la composición completa del dataset, ni si se emplearon técnicas de RLHF o DPO. La evaluación se realiza sobre R3-Skill (consultas y pool de test) y sobre SkillRet, cuyos datos se redistribuyen bajo Apache 2.0 desde el benchmark original (arXiv:2605.05726) manteniendo los identificadores originales de skill.

Una innovación destacable es el protocolo de evaluación con pools congelados (`r3_embedding_topk20.jsonl` y `skillret_embedding_topk20.jsonl`), que permite reproducir exactamente las filas de embedding y recalcular métricas sin GPU mediante `--stage score --rankings <file>`. Las métricas definidas son Recall@K = |G ∩ T_K| / |G|, Completeness@K = 1[G ⊆ T_K] y Set-Compatibility = 1[G ⊆ T_|G|] para consultas multi-skill. El reranking se ejecuta en bf16, donde muchas puntuaciones empatan y los empates conservan el orden de embedding, por lo que las filas del reranker pueden diferir del paper en unas décimas de punto según hardware y versiones de librerías.

## Capacidades

- Recuperación de habilidades (*skill retrieval*): embedding de consultas y descripciones de skills para recuperar el top-K relevante.
- Reranking de candidatos: reordenación del top-20 congelado mediante un modelo de reranking dedicado.
- Recuperación multi-skill: soporte de consultas que requieren un conjunto completo de habilidades, evaluado con Completeness@K y Set-Compatibility.
- Anotaciones SKIP: el repositorio incluye `skip_train.jsonl` con anotaciones de omisión para el entrenamiento.
- Evaluación sin GPU: recálculo de métricas a partir de un fichero de rankings mediante `--stage score`.
- Transferencia a otros benchmarks: evaluación sobre SkillRet con 6.660 skills y 4.997 consultas.
- No se documentan capacidades de generación de texto, tool calling, agentes, visión, audio ni modo thinking; el sistema es exclusivamente de recuperación y reranking.

## Casos de uso

- Selección de herramientas en agentes: dado un catálogo de skills disponibles y la consulta del usuario, R3-Embedding recupera candidatos y R3-Reranker los reordena para decidir qué herramientas invocar. Es adecuado porque el protocolo está diseñado específicamente para esta tarea y evalúa la completitud del conjunto recuperado.
- Enrutamiento de peticiones en plataformas de automatización: clasificar una solicitud entrante hacia uno o varios módulos o APIs registrados como skills, usando Recall@K como métrica de cobertura.
- Construcción de índices de capacidades en sistemas multiagente: indexar las capacidades de cada agente y recuperar el subconjunto relevante para una tarea, aprovechando la evaluación multi-skill con Set-Compatibility.
- Búsqueda semántica sobre documentación de funciones o APIs: usar R3-Embedding para recuperar descripciones de funciones relevantes a partir de una consulta en lenguaje natural, y R3-Reranker para afinar el orden.
- Evaluación y auditoría de pipelines de recuperación: emplear `reproduce.py --stage score --rankings <file>` para recalcular métricas sobre rankings propios sin necesidad de GPU, útil en integración continua.
- Investigación en recuperación de conjuntos: reproducir los resultados de R3-Skill y SkillRet con los pools congelados incluidos, sirviendo como línea base para comparar nuevos métodos de skill retrieval.
- Filtrado previo en sistemas RAG de herramientas: reducir el catálogo de skills antes de pasarlo a un LLM generativo, disminuyendo el coste de contexto en el prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia la Tabla 4 para R3-Skill y una tabla de transferencia para SkillRet, pero no incluye los valores numéricos en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: cada modelo de 0,6 mil millones de parámetros en bf16 requiere aproximadamente 1,2 GB de pesos; con overhead de activaciones y librerías, se estima un uso de 2 a 4 GB por modelo en GPU.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM es suficiente para ejecutar embedding y reranking por separado; para ejecutar ambas etapas de forma concurrente se recomienda 16 GB o más.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070, RTX 4080 y RTX 4090.
- Opciones de despliegue: los scripts `infer.py` y `reproduce.py` del repositorio; al estar basados en Qwen3-Embedding y Qwen3-Reranker, son compatibles con frameworks de serving de modelos de embedding como los habituales del ecosistema Hugging Face (no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI en la información disponible).
- Latencia y throughput: no disponibles. El reranking en bf16 puede producir empates en las puntuaciones que conservan el orden de embedding, lo que puede afectar a la reproducibilidad exacta entre hardware y versiones de librerías.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| R3-Skill (R3-Embedding + R3-Reranker) | ~0,6 B por modelo | No disponible | Skill retrieval y reranking | Apache 2.0 segun model card | Hugging Face (repo `anon-r3skill/anon-R3-skill`) |
| Qwen3-Embedding-0.6B | ~0,6 B | No disponible en la informacion proporcionada | Embedding general | No disponible en la informacion proporcionada | Hugging Face |
| Qwen3-Reranker-0.6B | ~0,6 B | No disponible en la informacion proporcionada | Reranking general | No disponible en la informacion proporcionada | Hugging Face |

R3-Skill se diferencia de sus modelos base por el fine-tuning específico para skill retrieval y por el protocolo de evaluación con métricas de conjunto (Completeness@K, Set-Compatibility), frente a la recuperación de un único documento relevante. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene un modelo generativo: no puede usarse para generación de texto, razonamiento, código ni tareas conversacionales.
- No se documentan los idiomas soportados; el comportamiento multilingüe es incierto y depende de los modelos base Qwen3.
- No se especifica la longitud de contexto soportada, lo que limita la planificación para skills con descripciones largas.
- Riesgo de empates en las puntuaciones del reranker en bf16, que conservan el orden de embedding y pueden introducir diferencias de décimas de punto respecto al paper según hardware y versiones de librerías.
- El campo de licencia del repositorio en Hugging Face figura como no disponible; la model card declara Apache 2.0 para el código y los datos redistribuidos, pero conviene verificar el fichero LICENSE antes de un uso comercial.
- Los datos de SkillRet se redistribuyen en su split original (6.660 skills, 4.997 consultas), que difiere del split de test de la release actual del benchmark; los resultados no son directamente comparables con evaluaciones sobre la versión revisada.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, sin validación externa de la comunidad.
- No se han publicado resultados de benchmarks numéricos en la información disponible, por lo que no es posible verificar el rendimiento de forma independiente.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de recuperación de skills irrelevantes cuando la consulta es ambigua o el pool contiene descripciones solapadas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/anon-r3skill/anon-R3-skill
- Paper del benchmark SkillRet: https://arxiv.org/abs/2605.05726
