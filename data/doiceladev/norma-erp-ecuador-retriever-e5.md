# doiceladev/norma-erp-ecuador-retriever-e5

## Resumen

Norma ERP — Índice Neuronal Híbrido y Evaluador Legal (Ecuador ODS 8) es un conjunto de artefactos de recuperación de información (RAG) especializado en normativa laboral ecuatoriana, publicado por el usuario doiceladev bajo licencia Apache 2.0. No se trata de un modelo generativo, sino de un sistema de dos etapas compuesto por un bi-encoder de recuperación densa basado en `intfloat/multilingual-e5-base` y un cross-encoder de re-ranking de fidelidad jurídica basado en `unicamp-dl/mMiniLM-L6-v2-mmarco-v2`. El repositorio distribuye el índice vectorial pre-calculado y el dataset de entrenamiento, no los pesos en formato estándar de `sentence-transformers`.

El sistema está diseñado para el módulo de Sostenibilidad y Trabajo Decente (ODS 8) de Norma ERP, con el objetivo de localizar y validar fragmentos normativos oficiales del Ecuador (Código del Trabajo, Ley Orgánica de Discapacidades, Ley Violeta y Convenios OIT) en flujos de consulta jurídica. El corpus indexado consta de 1.880 fragmentos normativos verificados y un vocabulario jurídico de consulta de 800 vectores.

El modelo es relevante para desarrolladores que construyan asistentes legales o de cumplimiento normativo en el dominio laboral ecuatoriano, ya que proporciona una recuperación densa ya calibrada sobre un corpus cerrado y verificado. Su alcance es deliberadamente acotado: un único idioma (español), un dominio jurídico concreto y un corpus de tamaño reducido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bi-encoder denso (recuperación) + cross-encoder (re-ranking); base transformer de `intfloat/multilingual-e5-base` y `unicamp-dl/mMiniLM-L6-v2-mmarco-v2` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | es (español) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (el repositorio publica `trained_retriever_index.json` y `retriever_evaluator_training_colab.jsonl`, no pesos en safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura es un pipeline de recuperación en dos etapas. La primera etapa es un bi-encoder denso derivado de `intfloat/multilingual-e5-base`, entrenado con `MultipleNegativesRankingLoss` sobre un dataset contrastivo con hard negatives de 1.880 tripletas (`retriever_evaluator_training_colab.jsonl`). La segunda etapa es un cross-encoder de re-ranking de fidelidad jurídica basado en `unicamp-dl/mMiniLM-L6-v2-mmarco-v2`, que reordena los candidatos recuperados y asigna una puntuación de relevancia.

El entrenamiento se realizó en una GPU NVIDIA A100-SXM4-40GB usando `bfloat16` y TF32. El corpus indexado comprende 1.880 artículos legales verificados, y el índice incluye además 800 vectores del vocabulario jurídico de consulta, junto con los scores de calibración del cross-encoder. La separación reportada del evaluador es de un score medio de 1.0000 en pares positivos frente a 0.0000 en pares negativos, lo que indica una separabilidad muy alta sobre el conjunto de evaluación utilizado, si bien no se documenta el procedimiento de evaluación ni el tamaño del conjunto de test.

## Capacidades

- Recuperación densa de fragmentos normativos: genera embeddings normalizados para consultas en español y los compara contra el índice de 1.880 fragmentos legales.
- Re-ranking de fidelidad jurídica: el cross-encoder puntúa pares consulta-fragmento para descartar recuperaciones poco relevantes.
- Búsqueda sobre corpus cerrado y verificado: Código del Trabajo, Ley Orgánica de Discapacidades, Ley Violeta y Convenios OIT.
- Soporte multilingüe limitado: aunque el modelo base `multilingual-e5-base` es multilingüe, la model card declara únicamente español y el corpus es exclusivamente ecuatoriano.
- Integración en pipelines RAG: los artefactos están pensados para alimentar un generador externo, no para generar texto por sí mismos.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Asistente de consultas laborales internas: el bi-encoder recupera los artículos del Código del Trabajo relevantes para una pregunta de un empleado y el cross-encoder filtra los candidatos poco pertinentes antes de pasarlos a un LLM generador.
- Cumplimiento normativo en RR. HH.: dado un caso de contratación, despido o discapacidad, el sistema localiza las disposiciones aplicables (Ley Orgánica de Discapacidades, Ley Violeta) para que el equipo legal valide políticas internas.
- Auditoría de contratos y cláusulas: se indexan cláusulas de contratos propios y se comparan semánticamente contra el corpus normativo para detectar posibles incumplimientos.
- Soporte a la negociación colectiva: recuperación de convenios OIT y artículos del Código del Trabajo relevantes para un pliego de reclamaciones sindicales.
- Generación de respuestas con cita obligatoria: al devolver fragmentos con identificador normativo, el pipeline puede construir respuestas con referencias verificables y reducir alucinaciones del generador.
- Formación y onboarding jurídico: un buscador semántico sobre la normativa laboral ecuatoriana para que nuevos miembros del equipo legal localicen disposiciones por lenguaje natural en lugar de por palabra clave.
- Filtrado previo en un sistema de atención al ciudadano: clasificación y recuperación de la norma aplicable a una consulta antes de derivarla a un humano o a un modelo generativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la separación del cross-encoder sobre pares positivos y negativos (1.0000 frente a 0.0000), sin detallar el conjunto de evaluación, el tamaño de la muestra ni métricas estándar de recuperación (Recall@k, MRR, nDCG).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al no publicarse los pesos en formatos estándar, no puede estimarse con fiabilidad; como referencia, `multilingual-e5-base` (≈278M parámetros) y `mMiniLM-L6-v2` (≈22M parámetros) caben holgadamente en GPUs de consumo en fp16.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para ejecutar los encoders base; el entrenamiento documentado se realizó en NVIDIA A100-SXM4-40GB.
- GPU de consumo: sí, previsiblemente cualquier RTX 3060/4060 o superior si se reconstruyen los pesos de los encoders base.
- Opciones de despliegue: `sentence-transformers` para el bi-encoder; el cross-encoder requiere un framework de re-ranking compatible con modelos de clasificación de pares. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| norma-erp-ecuador-retriever-e5 | Bi-encoder + cross-encoder especializado | no disponible | no disponible | es | apache-2.0 | Índice y dataset en HF; pesos no publicados en formato estándar |
| intfloat/multilingual-e5-base | Bi-encoder generalista | ≈278M | 512 tokens | multilingüe | MIT | Pesos en HF |
| unicamp-dl/mMiniLM-L6-v2-mmarco-v2 | Cross-encoder de re-ranking | ≈22M | no disponible | multilingüe | no disponible | Pesos en HF |
| BAAI/bge-m3 | Bi-encoder multilingüe | ≈568M | 8192 tokens | multilingüe | MIT | Pesos en HF |

La ventaja del modelo de doiceladev es la especialización en normativa laboral ecuatoriana y la calibración conjunta de recuperador y evaluador; su desventaja es la ausencia de pesos publicados, el corpus cerrado de 1.880 fragmentos y la falta de métricas de recuperación comparables.

## Limitaciones y advertencias

- El repositorio no publica pesos en safetensors, GGUF ni formato `sentence-transformers`; solo distribuye el índice JSON y el dataset de entrenamiento, lo que dificulta la reproducibilidad y el despliegue directo.
- El corpus está limitado a 1.880 fragmentos y a cuatro cuerpos normativos; cualquier consulta fuera de ese ámbito (otras jurisdicciones, normativa no incluida) no obtendrá recuperaciones fiables.
- El modelo solo declara español y está entrenado sobre normativa ecuatoriana; el rendimiento en variantes dialectales o en textos legales de otros países no está documentado.
- Riesgo de alucinación del generador aguas abajo: el retriever no genera texto, pero un LLM que consuma los fragmentos puede inventar citas si no se le obliga a ceñirse a los identificadores devueltos.
- La métrica de separación 1.0000/0.0000 sugiere un posible sobreajuste al conjunto de evaluación o un conjunto de test demasiado sencillo; no se documenta validación cruzada ni evaluación con negativos difíciles independientes.
- No se documentan sesgos conocidos ni evaluaciones de equidad; al tratarse de normativa laboral, los sesgos del corpus legal subyacente (por ejemplo, en materia de género o discapacidad) pueden propagarse a las recuperaciones.
- La licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre la exactitud jurídica de las recuperaciones recae en el integrador; no sustituye el asesoramiento legal profesional.
- Fecha de creación y actualización del repositorio (2026-11-12) con cero descargas y cero likes: no hay evidencia de uso en producción ni validación por terceros.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/doiceladev/norma-erp-ecuador-retriever-e5
- Modelo base del bi-encoder: https://huggingface.co/intfloat/multilingual-e5-base
- Modelo base del cross-encoder: https://huggingface.co/unicamp-dl/mMiniLM-L6-v2-mmarco-v2
