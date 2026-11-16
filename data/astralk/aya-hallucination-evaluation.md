# ASTRALK/aya-hallucination-evaluation

## Resumen

`ASTRALK/aya-hallucination-evaluation` no es un modelo de lenguaje, sino un artefacto de evaluación publicado en Hugging Face que documenta un estudio empírico sobre alucinación, factualidad y abstención selectiva en dos modelos abiertos multilingües de Cohere Labs: `CohereLabs/tiny-aya-global` (3.35B) y `CohereLabs/aya-expanse-8b` (8B). El trabajo se enmarca en el Lexsi AI Safety & Alignment Hackathon (Track 2: AI Red Teaming, Safety & Alignment) y evalúa 6.347 instancias de test por modelo, con 12.694 generaciones totales, usando decodificación greedy determinista y un juez factual independiente (GLM-5.3-Flash).

El problema que aborda es central para el despliegue seguro de modelos multilingües: la fluidez superficial no garantiza grounding factual. Los resultados muestran una "trampa de cobertura" — ambos modelos intentan responder más del 95% de las preguntas de SimpleQA pese a acertar menos del 6% — y tasas de alucinación del 91,94% (Tiny Aya) y 84,64% (Aya Expanse 8B) cuando no se abstienen en HalluLens PreciseWikiQA.

Es relevante ahora porque proporciona datos reproducibles, trazas crudas de juicio y código de evaluación público sobre un eje (abstención calibrada y metacognición) que rara vez se mide con esta granularidad en modelos abiertos de tamaño pequeño y medio. No obstante, conviene subrayar que este repositorio contiene resultados de evaluación, no pesos de modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (artefacto de evaluación; los modelos evaluados son transformers densos) |
| Parametros totales | No aplica al artefacto; modelos evaluados: 3,35B y 8B |
| Parametros activos | No disponible (no son MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | No disponible (el repositorio es `sdk: static`, sin pesos) |

## Arquitectura y entrenamiento

El artefacto en sí es estático: aloja documentación, resultados y trazas de un pipeline de evaluación, no un modelo entrenado. El pipeline evalúa dos modelos densos de Cohere Labs con decodificación greedy determinista y emplea GLM-5.3-Flash como juez factual independiente, con 6.835 juicios crudos resueltos y cero excepciones de evaluación. Para el emparejamiento semántico de casos no respondibles se usan embeddings exactos de SimCSE.

La batería cubre cuatro ejes complementarios: factualidad de formato corto (SimpleQA Verified, 1.000 casos), alucinación frente a falso rechazo (HalluLens PreciseWikiQA, 1.000 casos), abstención selectiva calibrada (AbstentionBench, 978 casos balanceados) y autoconciencia metacognitiva (SelfAware, 3.369 casos). El análisis se enmarca en el ecosistema de alineamiento Lexsi (CuratorKIT para filtrado de datos, AuditKIT para evaluación de seguridad y SafeTune para steering). No se dispone de información sobre datos de entrenamiento de los modelos evaluados ni sobre procesos de RLHF/DPO en este repositorio.

## Capacidades

- Evaluación de factualidad de formato corto mediante SimpleQA Verified (1.000 casos por modelo).
- Medición de alucinación no fundamentada frente a falso rechazo con HalluLens PreciseWikiQA.
- Evaluación de abstención selectiva calibrada con AbstentionBench (489 respondibles / 489 no respondibles).
- Medición de metacognición epistémica con SelfAware (2.338 respondibles / 1.031 no respondibles).
- Juicio factual automatizado con juez independiente (GLM-5.3-Flash) y decodificación determinista.
- Emparejamiento semántico de no respondibilidad mediante embeddings SimCSE.
- Publicación de trazas crudas de juicio, salidas de modelo y código reproducible.
- No incluye capacidades de generación, tool calling, agentes, visión ni audio: es un artefacto de evaluación.

## Casos de uso

- Auditoría de seguridad previa a despliegue: usar la batería para cuantificar la tasa de alucinación de un modelo multilingüe antes de ponerlo en producción, con denominadores explícitos y trazas reproducibles.
- Selección de modelo por comportamiento de abstención: comparar Tiny Aya (68,30% de acierto de comportamiento) frente a Aya Expanse 8B (72,70%) para decidir qué tamaño encaja en un caso donde el falso rechazo es tolerable pero la alucinación no.
- Diseño de políticas de "no sé": emplear los datos de AbstentionBench (51,23% vs 60,22% de éxito conjunto) para calibrar umbrales de abstención en asistentes de atención al cliente.
- Investigación en alineamiento: reutilizar las trazas crudas de juicio y el código para reproducir o extender el estudio a otros modelos abiertos con el mismo protocolo determinista.
- Evaluación de metacognición en sistemas RAG: los resultados de SelfAware (F1 de etiqueta desconocida 34,07% vs 43,70%) sirven para anticipar si un modelo reconocerá los límites de su conocimiento cuando el contexto recuperado sea insuficiente.
- Formación y red teaming: usar la batería como material docente en talleres de seguridad de IA, dado que expone casos concretos de respuestas no fundamentadas con recuentos exactos (890 y 810 alucinaciones sobre 968 y 957 no abstenciones).
- Benchmarking interno de variantes: aplicar el mismo pipeline a checkpoints propios para medir la "trampa de cobertura" (cobertura >95% con acierto <6%) antes y después de un ajuste fino.

## Benchmarks y rendimiento

| Benchmark | Métrica | Tiny Aya Global (3,35B) | Aya Expanse 8B | N |
|---|---|---:|---:|---:|
| SimpleQA Verified | Correct-Answer Yield ↑ | 3,70% | 5,70% | 1.000 |
| SimpleQA Verified | Answer Coverage | 95,20% | 95,30% | 1.000 |
| SimpleQA Verified | Accuracy When Attempted ↑ | 3,89% | 5,98% | 1.000 |
| HalluLens PreciseWikiQA | Hallucination (when not abstained) ↓ | 91,94% | 84,64% | 1.000 |
| HalluLens PreciseWikiQA | False Refusal Rate ↓ | 3,20% | 4,30% | 1.000 |
| HalluLens PreciseWikiQA | Correct-Answer Rate ↑ | 7,80% | 14,70% | 1.000 |
| AbstentionBench | Behavior Accuracy ↑ | 68,30% | 72,70% | 978 |
| AbstentionBench | Joint Task Success ↑ | 51,23% | 60,22% | 978 |
| SelfAware | Unknown-label F1 ↑ | 34,07% | 43,70% | 3.369 |
| SelfAware | Precision / Recall | 64,67% / 23,08% | 69,79% / 31,81% | 3.369 |
| SelfAware | Answerable Reference Accuracy ↑ | 32,04% | 39,01% | 2.338 |

Recuentos detallados: SimpleQA Verified — Tiny Aya 37 correctas / 915 incorrectas / 48 no intentadas; Aya Expanse 8B 57 / 896 / 47. HalluLens PreciseWikiQA — Tiny Aya 968 no abstenidas, 890 alucinadas, 78 correctas, 32 falsos rechazos; Aya Expanse 8B 957 / 810 / 147 / 43. AbstentionBench — Tiny Aya 668 éxitos de comportamiento y 501 éxitos conjuntos; Aya Expanse 8B 711 y 589. SelfAware — Tiny Aya TP 238 / FP 128 / FN 793; Aya Expanse 8B TP 328 / FP 142 / FN 703.

## Requisitos de hardware

- No aplica al artefacto: el repositorio es `sdk: static` y no contiene pesos ni requiere GPU para consultarse.
- Para reproducir la evaluación de los modelos subyacentes: Tiny Aya Global (3,35B) es viable en GPU de consumo con cuantización de 4-8 bits (orientativo: 8-16 GB de VRAM en FP16 para 3,35B, sin datos oficiales en esta información).
- Aya Expanse 8B requiere aproximadamente 16 GB en FP16 para inferencia sin cuantizar; con cuantización de 4 bits podría caber en GPUs de consumo de 8-12 GB (estimación orientativa, no confirmada en la información disponible).
- GPU recomendadas para el 8B a throughput alto: A100, H100 o L40S; en consumer, RTX 4090 (24 GB) permite FP16 sin sharding.
- Opciones de despliegue habituales para estos modelos (vLLM, TGI, llama.cpp, Ollama) no se detallan en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Factualidad (SimpleQA Verified) | Abstención (AbstentionBench, éxito conjunto) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Tiny Aya Global | 3,35B | No disponible | 3,70% | 51,23% | No disponible | Open weights en Cohere Labs |
| Aya Expanse 8B | 8B | No disponible | 5,70% | 60,22% | No disponible | Open weights en Cohere Labs |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La información proporcionada solo permite comparar entre los dos modelos Aya evaluados; no se han publicado resultados de terceros en este artefacto.

## Limitaciones y advertencias

- No es un modelo: no debe citarse como un LLM desplegable ni usarse para generación; contiene resultados y trazas de evaluación.
- Licencia no declarada: la ausencia de licencia explícita impide asumir permisos de uso comercial sobre los datos, trazas o código publicados.
- Idiomas no declarados: aunque los modelos evaluados son multilingües, el artefacto no especifica la cobertura lingüística de las pruebas.
- Los resultados dependen de un juez automático (GLM-5.3-Flash); aunque se reportan 6.835 juicios sin excepciones, no se documenta una validación con anotadores humanos en la información disponible.
- Las métricas de SelfAware muestran recall bajo (23,08% y 31,81%), lo que indica que los modelos evaluados reconocen mal sus propios límites; no extrapolar estos números a otros modelos sin reejecutar la batería.
- Riesgo de alucinación elevado en los modelos evaluados (91,94% y 84,64% cuando no se abstienen): cualquier uso en producción de Tiny Aya o Aya Expanse 8B debería incorporar capas de verificación externas.
- La "trampa de cobertura" (cobertura >95% con acierto <6%) implica que las métricas de precisión sin condicionar a la cobertura pueden inducir a error al comparar modelos.
- No se dispone de datos de sesgos, latencia, throughput ni requisitos de hardware oficiales en la información proporcionada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ASTRALK/aya-hallucination-evaluation
- Colección de modelos: https://huggingface.co/collections/ASTRALK/aya-safety-and-hallucination-evaluations-models-6afaec3a8d5a2fd6533d560b
- Colección de datasets: https://huggingface.co/collections/ASTRALK/aya-safety-and-hallucination-benchmarks-datasets-6afaec3b152fb3a00d5aed2f
- Repositorio GitHub: https://github.com/AstralKS/aya-safety-alignment-benchmarks
- Perfil del autor en Hugging Face: https://huggingface.co/ASTRALK
- Perfil del autor en GitHub: https://github.com/AstralKS
- Modelo evaluado Tiny Aya Global: `CohereLabs/tiny-aya-global` (referencia en la model card, sin URL explícita)
- Modelo evaluado Aya Expanse 8B: `CohereLabs/aya-expanse-8b` (referencia en la model card, sin URL explícita)
