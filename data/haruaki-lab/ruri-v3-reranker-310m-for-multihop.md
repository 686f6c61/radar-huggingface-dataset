# haruaki-lab/ruri-v3-reranker-310m-for-multihop

## Resumen

Ruri-v3-reranker-310m-for-multihop es un modelo de reordenamiento (reranker) de tipo cross-encoder especializado en recuperación multi-hop para RAG en japonés. Lo desarrolla el usuario haruaki-lab como parte de un curso final sobre LLM (tag `llm-course-final-2026`) y parte del modelo base `cl-nagoya/ruri-v3-reranker-310m`, al que se le aplica un ajuste fino completo en BF16 para adaptarlo a un esquema de dos pasadas de recuperación: una primera pasada para preguntas iniciales y una segunda para consultas de seguimiento.

El modelo resuelve un problema concreto: en preguntas que requieren encadenar varios saltos de razonamiento (multi-hop QA) sobre Wikipedia en japonés, un reranker estándar de una sola pasada no captura bien la relación entre la consulta de seguimiento y los fragmentos puente. Esta adaptación entrena explícitamente sobre grupos de pares puntuados de ambas pasadas, con minería de negativos duros y filtrado de falsos negativos.

Con 315.203.329 parámetros y arquitectura ModernBERT, se posiciona como un componente ligero dentro de un pipeline RAG más amplio (que incluye generadores Q2 y Answerer de fases previas). Su relevancia actual radica en que demuestra mejoras medibles en validación (top-1 accuracy de 0,677 a 0,754, MRR de 0,75308 a 0,80454) sobre un conjunto de 1.000 grupos, manteniendo licencia Apache-2.0 y compatibilidad con text-embeddings-inference.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (cross-encoder para text-classification) |
| Parametros totales | 315.203.329 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el repo ocupa 0,6 GB) |
| Idiomas soportados | japones (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en ModernBERT que recibe un par (consulta, fragmento) y produce una puntuación de relevancia para reordenar candidatos. Se parte de `cl-nagoya/ruri-v3-reranker-310m` (revisión `2c23c61a90583f0348880a2ffb2d7fd29e2d14f1`) y se realiza un ajuste fino completo en BF16 con `lr=2e-5`, seleccionando el mejor checkpoint en el paso 2.750 de 6.235.

Los datos de entrenamiento se construyen con splits de 49.876 grupos de entrenamiento y 1.000 de validación (34.306 de pass-1 y 15.570 de pass-2, totalizando 1.114.760 pares puntuados), con solapamiento cero de artículos, fragmentos y preguntas respecto al split de evaluación de 1.200 consultas. Se aplica minería de negativos duros y filtrado de falsos negativos latentes: 174.393 falsos negativos eliminados mediante puntuación de dos profesores (`0.55 * z(Ruri) + 0.45 * z(BGE)`) más coincidencia de texto de respuesta y entidad puente. La función de pérdida combina Listwise InfoNCE compuesta con Pairwise MarginMSE (`alpha_mse=0.5`, `teacher_scale=2.0`). Los pools de recuperación derivan de fragmentos de Wikipedia japonesa (CC BY-SA 4.0), y los generadores sintéticos de QA se entrenaron con JaQuAD (CC BY-SA 3.0) y JSQuAD/JGLUE (CC BY-SA 4.0); JEMHopQA (CC BY-SA 4.0) se usó solo para calibrar el umbral de perplejidad (`p95=264.93`) en el filtrado multi-hop sintético, sin añadir muestras a entrenamiento.

## Capacidades

- Reordenamiento de candidatos en recuperación de información (cross-encoder) para consultas en japonés.
- Recuperación multi-hop en dos pasadas: pass-1 para la pregunta inicial y pass-2 para consultas de seguimiento derivadas.
- Puntuación de relevancia consulta-fragmento orientada a preguntas con entidad puente y respuesta encadenada.
- Integración en pipelines RAG con generadores Q2 y Answerer (fases previas del mismo proyecto).
- Compatibilidad con text-embeddings-inference y endpoints compatibles.
- Clasificación de texto (pipeline `text-classification`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-step autónomo: no disponible (el multi-hop se resuelve a nivel de pipeline, no dentro del modelo).
- Capacidades multilingües: limitadas al japonés según la model card.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- RAG multi-hop sobre Wikipedia japonesa: el reranker reordena los fragmentos recuperados en pass-1 y pass-2, permitiendo encadenar entidades puente entre saltos; está entrenado específicamente para este escenario con 1.114.760 pares puntuados.
- Sistemas de pregunta-respuesta documental en japonés: se usa como segunda etapa tras un retriever denso o léxico para elevar la precisión del fragmento principal (Primary Chunk Acc 0,7558 en la evaluación end-to-end reportada).
- Asistentes de investigación con consultas de seguimiento: al soportar pass-2 sobre consultas derivadas, encaja en flujos conversacionales donde el usuario refina la pregunta y se necesita reordenar nuevos candidatos con contexto del salto anterior.
- Búsqueda empresarial interna en corpus japoneses: el modelo puede reordenar fragmentos de documentación interna siempre que se disponga de un retriever previo y se acepte el dominio de entrenamiento (Wikipedia); requiere validación en el dominio propio.
- Evaluación y benchmarking de pipelines RAG: sirve como componente de referencia en experimentos con `rag_eval_1200`, dado que el autor publica métricas EM, Char-F1, Primary Chunk Acc y Supporting Chunk Hit.
- Despliegue ligero en infraestructura modesta: con 315 millones de parámetros y pesos safetensors de 0,6 GB, es viable servirlo con text-embeddings-inference en una GPU de gama media, aunque no se publican cifras de latencia ni throughput.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| val_top1_acc (1.000 grupos, antes -> despues) | 0,677 -> 0,754 |
| val_mrr (1.000 grupos, antes -> despues) | 0,75308 -> 0,80454 |
| Overall EM (rag_eval_1200, pipeline completo) | 0,7783 |
| Overall Char-F1 (rag_eval_1200, pipeline completo) | 0,8416 |
| Primary Chunk Acc | 0,7558 |
| Supporting Chunk Hit | 0,7750 |

Las métricas end-to-end corresponden al pipeline completo con Phase 6 P3 Q2 + Dual-LTR + P1 Answerer sobre `rag_eval_1200`, no al reranker de forma aislada. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 315 millones de parámetros en BF16 los pesos ocupan aproximadamente 0,63 GB, por lo que la VRAM necesaria es moderada (estimación orientativa, no publicada por el autor).
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: plausible por tamaño (315 M de parámetros), pero el autor no lo documenta.
- Opciones de despliegue: text-embeddings-inference (tag oficial), transformers; otras opciones (vLLM, llama.cpp, Ollama, TGI) no están documentadas para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| haruaki-lab/ruri-v3-reranker-310m-for-multihop | 315.203.329 | no disponible | Cross-encoder ModernBERT, multi-hop japonés en dos pasadas | Apache-2.0 | Hugging Face |
| cl-nagoya/ruri-v3-reranker-310m (base) | no disponible en la informacion | no disponible | Cross-encoder ModernBERT, reranker general japonés | Apache-2.0 | Hugging Face |
| BGE (profesor auxiliar citado en el entrenamiento) | no disponible | no disponible | Modelo de embeddings usado como segundo profesor en el filtrado | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Idioma: el modelo está entrenado y etiquetado exclusivamente para japonés; su rendimiento fuera de ese idioma no está documentado.
- Dominio: los datos de entrenamiento derivan de Wikipedia japonesa; el comportamiento en dominios especializados (legal, médico, técnico) no está validado.
- Las métricas end-to-end (EM 0,7783, Char-F1 0,8416) corresponden al pipeline completo, no al reranker aislado; no deben atribuirse solo a este modelo.
- Riesgo de alucinación: como componente de puntuación no genera texto, pero un reordenamiento erróneo puede propagar fragmentos irrelevantes al generador y favorecer respuestas incorrectas.
- Sesgos: no se documentan análisis de sesgo; al derivar de Wikipedia pueden heredarse sesgos de cobertura y sesgos editoriales del corpus.
- Licencia Apache-2.0 para el modelo, pero los datasets subyacentes tienen licencias CC BY-SA (4.0, 3.0) que pueden imponer obligaciones de atribución y compartir-igual si se redistribuyen datos derivados.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; es un artefacto de curso, sin validación externa ni mantenimiento conocido.
- No se documentan longitud de contexto, cuantizaciones soportadas ni requisitos de hardware; conviene verificar la configuración del tokenizador y la ventana máxima antes de producción.
- El tag de librería indica `transformers`, pero el pipeline es `text-classification`; la integración como reranker requiere envolver la puntuación de pares manualmente.

## Enlaces

- Hugging Face: https://huggingface.co/haruaki-lab/ruri-v3-reranker-310m-for-multihop
- Modelo base: https://huggingface.co/cl-nagoya/ruri-v3-reranker-310m
- Dataset de competición (Wikipedia japonesa, CC BY-SA 4.0): https://huggingface.co/datasets/bumbuboon/llm-course-final-2026
- JaQuAD: https://github.com/SkelterLabsInc/JaQuAD
- JSQuAD (JGLUE): https://github.com/yahoojapan/JGLUE
- JEMHopQA: https://github.com/aiishoya/JEMHopQA
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Licencia CC BY-SA 3.0: https://creativecommons.org/licenses/by-sa/3.0/
