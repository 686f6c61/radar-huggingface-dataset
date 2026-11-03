# SolsticeAI/Nanbeige4.3-33B-Unlocked-Uncensored

## Resumen

Nanbeige4.3-33B-Unlocked-Uncensored es una variante "decensored" (también etiquetada como abliterated o uncensored) del modelo Nanbeige4.3-33B, publicada por el usuario SolsticeAI. El modelo original lo desarrolla Nanbeige y se presenta como el modelo profesor (teacher) de referencia de la serie Nanbeige4.3, pensado para destacar en tareas agénticas de código y cowork profesional dentro de la clase de ~30B parámetros. Esta versión concreta aplica una técnica de ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) mediante la herramienta Heretic v2.0.0 para reducir la tasa de rechazos del modelo base.

El modelo conserva la arquitectura y los pesos del original (33.118.977.024 parámetros, formato safetensors, licencia Apache 2.0) y solo modifica el comportamiento de rechazo mediante intervención sobre las activaciones internas en un rango de capas (de la 3 a la 48). Según la model card, la tasa de rechazos medida por clasificador cae de 98/100 en el modelo original a 12/100 en esta variante, con una divergencia KL de 0.0244 respecto al original.

Es relevante para quienes necesitan un modelo de ~33B con capacidades agénticas fuertes y sin filtros de rechazo, y que además quieran reproducir el proceso de modificación, ya que el autor incluye un directorio `reproduce` con los parámetros exactos de la ablación. No obstante, el repositorio no registra descargas ni likes en el momento de la consulta y no se dispone de información sobre el contexto máximo ni sobre los datos de entrenamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Llama, según tag `llama`); detalles internos no disponibles |
| Parametros totales | 33.118.977.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se listan GGUF ni otras) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamaño del repo: 66.3 GB) |

## Arquitectura y entrenamiento

El modelo base Nanbeige4.3-33B es un transformer de ~33B parámetros concebido como modelo profesor de la serie Nanbeige4.3, con el objetivo declarado de anclar la destilación posterior de capacidades agénticas en modelos más pequeños (por ejemplo, Nanbeige4.3-3B). La model card del original indica que se compara con modelos frontera de ~30B (Qwen3.8-27B, Muse-Glimmer-30B, Gemma4-31B) evaluados con su máximo esfuerzo de razonamiento, pero no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. Tampoco se especifica si emplea atención lineal, decodificación especulativa u otras innovaciones de inferencia.

La modificación de esta variante es una ablación de rangos arbitrarios (ARA) aplicada con Heretic v2.0.0 sobre las capas 3 a 48. Los parámetros publicados son: `start_layer_index` = 3, `end_layer_index` = 48, `preserve_good_behavior_weight` = 0.9238, `steer_bad_behavior_weight` = 0.0016, `overcorrect_relative_weight` = 0.4114 y `neighbor_count` = 3. El autor declara que el proceso es reproducible y documenta los pasos en el directorio `reproduce` del repositorio. El resultado es una reducción de rechazos de 98/100 a 12/100 con una divergencia KL de 0.0244 frente al modelo original.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento complejo: el modelo base reporta resultados altos en GPQA Diamond (89.5), AIME 2026 (95.2) y AA-LCR (84.0).
- Codificación agéntica: Terminal-Bench 2.1 (80.9), Terminal-Bench 4.0 (23.8), DeepSWE (65.5), SWE-Bench Pro (60.3), Scicode (52.6), SkillsBench (61.1).
- Tareas de cowork profesional y automatización: Automation Bench (54.2), JobBench (44.8), GDPval (84.8), Toolathlon-Verified (70.4), DeepPlanning (63.3), EnterpriseOps-Gym (41.0), Tau3-Bench (48.8).
- Uso de herramientas y function calling: los benchmarks Toolathlon-Verified y Tau3-Bench sugieren soporte de tool calling; la model card menciona evaluación con harness tipo Claude Code y mini-swe-agent.
- Razonamiento multi-paso y planificación: DeepPlanning y Claw-Eval (pass^3 = 78.3) apuntan a capacidades agénticas de varios pasos.
- Modo de pensamiento: la evaluación del modelo base usa `preserve_thinking=true` en la plantilla de chat, lo que indica un modo de razonamiento explícito.
- Comportamiento sin rechazos: la intervención ARA reduce drásticamente las negativas del modelo (12/100 frente a 98/100).
- No se documentan capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Agente de codificación en terminal: el modelo puede operar sobre un entorno de línea de comandos para resolver tareas de ingeniería (Terminal-Bench 2.1 = 80.9) y encadenar comandos, ediciones y verificación; adecuado para pipelines de CI/CD y asistentes de desarrollo.
- Resolución de issues en repositorios reales: con SWE-Bench Pro = 60.3 y DeepSWE = 65.5, puede localizar el fallo, proponer un parche y validarlo dentro de un flujo tipo mini-swe-agent.
- Automatización de tareas de oficina: Automation Bench (54.2) y JobBench (44.8) respaldan su uso en flujos de trabajo administrativos y de gestión documental con herramientas externas.
- Asistente de planificación multi-paso: DeepPlanning = 63.3 permite usarlo en agentes que descomponen objetivos largos en subtareas y mantienen estado entre pasos.
- Generación de código a partir de lenguaje natural: NL2Repo = 53.0 y Scicode = 52.6 lo hacen apto para convertir especificaciones en repositorios o scripts científicos.
- Razonamiento científico y matemático: GPQA Diamond = 89.5 y AIME 2026 = 95.2 permiten emplearlo en tutoría técnica, resolución de problemas y generación de explicaciones razonadas.
- Conversación sin filtros en inglés y chino: útil para investigación sobre comportamiento de modelos, red teaming y generación de contenido creativo sin rechazos, siempre con las cautelas legales correspondientes.
- Evaluación de agentes con uso de herramientas: Toolathlon-Verified = 70.4 y Tau3-Bench = 48.8 lo hacen candidato para prototipos de asistentes que llaman APIs y ejecutan funciones.

## Benchmarks y rendimiento

Resultados publicados en la model card para el modelo base Nanbeige4.3-33B frente a alternativas de ~30B (evaluados con máximo esfuerzo de razonamiento y el mismo harness):

| Categoria | Benchmark | Nanbeige4.3-33B | Qwen3.8-27B | Muse-Glimmer-30B | Gemma4-31B |
|---|---|---|---|---|---|
| Coding agéntico | Terminal-Bench 2.1 | 80.9 | 73.0 | 61.8 | 47.2 |
| Coding agéntico | Terminal-Bench 4.0 | 23.8 | 6.3 | 1.6 | 0.0 |
| Coding agéntico | DeepSWE | 65.5 | 42.5 | 4.4 | 2.7 |
| Coding agéntico | SWE-Bench Pro | 60.3 | 61.7 | 51.2 | 36.9 |
| Coding agéntico | SWE-Atlas-QnA | 50.8 | 41.9 | 17.7 | 3.3 |
| Coding agéntico | NL2Repo | 53.0 | 48.3 | 27.4 | 33.8 |
| Coding agéntico | Scicode | 52.6 | 46.7 | 44.9 | 45.5 |
| Coding agéntico | SkillsBench | 61.1 | 56.4 | 39.7 | 28.9 |
| Cowork agéntico | Automation Bench | 54.2 | 38.3 | 15.2 | 9.7 |
| Cowork agéntico | JobBench | 44.8 | 34.5 | 16.6 | 9.0 |
| Cowork agéntico | GDPval | 84.8 | 86.4 | 75.8 | 71.4 |
| Cowork agéntico | Claw-Eval (pass^3) | 78.3 | 75.2 | 57.3 | 44.2 |
| Cowork agéntico | Toolathlon-Verified | 70.4 | 68.5 | 47.2 | 27.8 |
| Cowork agéntico | DeepPlanning | 63.3 | 49.2 | 21.4 | 19.4 |
| Cowork agéntico | EnterpriseOps-Gym | 41.0 | 40.2 | 30.5 | 27.3 |
| Cowork agéntico | YC-bench | $1.025.437 | $641.290 | $513.978 | $265.152 |
| Cowork agéntico | Tau3-Bench | 48.8 | 48.5 | 33.7 | 18.6 |
| Razonamiento | GPQA Diamond | 89.5 | 89.2 | 83.5 | 91.3 |
| Razonamiento | AIME 2026 | 95.2 | 94.5 | 94.7 | 89.2 |
| Razonamiento | AA-LCR | 84.0 | 82.0 | 83.3 | 72.0 |

Métricas específicas de la variante uncensored (model card de SolsticeAI):

| Métrica | Este modelo | Modelo original |
|---|---|---|
| Rechazos (clasificador) | 12/100 | 98/100 |
| Divergencia KL | 0.0244 | 0 (por definición) |

No se han publicado resultados de benchmarks propios de esta variante uncensored más allá de las métricas de rechazo y divergencia KL; los datos de la primera tabla corresponden al modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 66 GB solo para pesos, por lo que se requieren GPUs con al menos 80 GB (A100 80GB, H100 80GB) o múltiples GPUs.
- Cuantización a 8 bits: en torno a 33-35 GB de VRAM, viable en una A100 40GB o en dos RTX 4090 de 24 GB.
- Cuantización a 4 bits: en torno a 17-20 GB de VRAM, potencialmente ejecutable en una RTX 4090/RTX 5090 de 24 GB, aunque el repo no distribuye pesos GGUF ni cuantizados oficiales.
- GPU recomendadas para producción: H100 80GB o A100 80GB para fp16; A100 40GB o 2x RTX 4090 para 8 bits.
- Cabe en GPU de consumo únicamente con cuantización agresiva (4 bits) y siempre que se genere la cuantización a partir de los safetensors, ya que no se ofrecen ficheros GGUF.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`) y endpoints compatibles (tag `endpoints_compatible`). No se confirma soporte oficial de vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-Unlocked-Uncensored | 33.118.977.024 | no disponible | Apache 2.0 | en, zh | Variante sin rechazos del base; sin benchmarks propios publicados |
| Nanbeige4.3-33B (base) | ~33B | no disponible | Apache 2.0 | en, zh | Modelo profesor original; 98/100 rechazos |
| Qwen3.8-27B | ~27B | no disponible | no disponible | no disponible | Fuerte en SWE-Bench Pro (61.7) y GDPval (86.4); menor en coding agéntico |
| Muse-Glimmer-30B | ~30B | no disponible | no disponible | no disponible | Rendimiento inferior en la mayoría de benchmarks agénticos |
| Gemma4-31B | ~31B | no disponible | no disponible | no disponible | Mejor en GPQA Diamond (91.3); peor en coding agéntico |

## Limitaciones y advertencias

- La eliminación de rechazos puede aumentar la probabilidad de generar contenido dañino, ofensivo o legalmente problemático; requiere moderación externa en producción.
- Riesgo de alucinación no cuantificado: no se han publicado evaluaciones de veracidad para esta variante.
- La divergencia KL de 0.0244 respecto al modelo original indica que la distribución de salida ha cambiado; pueden aparecer degradaciones sutiles en tareas no evaluadas.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado.
- Longitud de contexto no especificada, lo que dificulta planificar despliegues con ventanas largas.
- El repositorio no ofrece pesos cuantizados (GGUF, AWQ, GPTQ), lo que obliga a generarlos localmente.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria independiente.
- Aunque la licencia es Apache 2.0, el uso comercial de una variante "uncensored" puede entrar en conflicto con políticas de plataformas, términos de servicio de APIs y normativa local sobre contenido.
- No se documentan sesgos específicos del modelo base ni de esta variante.

## Enlaces

- HuggingFace: https://huggingface.co/SolsticeAI/Nanbeige4.3-33B-Unlocked-Uncensored
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Heretic (herramienta de ablación): https://heretic-project.org
- Directorio de reproducción: `reproduce/README.md` dentro del repositorio de HuggingFace
