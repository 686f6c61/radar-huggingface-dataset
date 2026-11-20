# mangaba-ai/Mangaba-Trabalhista-8B

## Resumen

Mangaba Trabalhista 8B es un adaptador LoRA desarrollado por Mangaba AI sobre el modelo base Qwen3-8B, especializado en derecho laboral brasileño. El modelo responde en portugués de Brasil a preguntas sobre la Consolidación de las Leyes del Trabajo (CLT, Decreto-Ley 5.452/1943), la Ley 6.019/1974 (trabajo temporal y tercerización) y la Ley del FGTS (Ley 8.036/1990), citando el artículo y la norma exacta a partir de fragmentos recuperados mediante un pipeline RAG. Está diseñado para profesionales de recursos humanos, departamento personal y abogados laboralistas.

El adaptador se entrena en dos etapas: una primera con pares pregunta-respuesta generados por artículo, y una segunda con la pregunta acompañada de fragmentos recuperados (incluyendo distractores similares) para enseñar al modelo a responder exclusivamente a partir del contexto recuperado y a citar la etiqueta exacta. El repositorio ocupa 0,4 GB y contiene únicamente los pesos del adaptador, no el modelo completo.

Su relevancia radica en que demuestra una mejora sustancial frente al modelo base con búsqueda en un dominio jurídico acotado: pasa del 45% al 78% en respuestas con nota máxima de contenido y del 40% al 80% en respuestas correctas con el artículo exacto, según la evaluación declarada por el autor con 60 preguntas fuera del conjunto de entrenamiento. El acceso está restringido mediante un formulario de registro (gated model).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Qwen3-8B) |
| Parametros totales | 8B (modelo base Qwen3-8B); el adaptador LoRA ocupa 0,4 GB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-8B; no especificada en la informacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Portugues de Brasil (pt-BR) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (PEFT) sobre Qwen3-8B, un transformer decoder-only de 8.000 millones de parámetros. El adaptador se configura con rango r=32 y alpha=64, aplicado a todas las proyecciones lineales del modelo base. No se modifica la arquitectura subyacente; el adaptador se carga junto al modelo base en un servidor de inferencia compatible con LoRA (por ejemplo, vLLM con `--enable-lora --max-lora-rank 32`).

El entrenamiento consta de dos etapas. La primera entrena durante 3 épocas con preguntas y respuestas generadas por artículo, junto con la recuperación del texto de cada artículo por su número. La segunda entrena durante 1 época con la pregunta acompañada de fragmentos recuperados, mezclando el dispositivo correcto con fragmentos similares, para que el modelo aprenda a responder a partir de los fragmentos y a citar la etiqueta exacta. El cómputo se realizó en dos GPU NVIDIA L40S en servidores de Mangaba en Brasil. El corpus de búsqueda (`busca/corpus/`) contiene los artículos y embeddings generados con bge-m3; el reranking utiliza bge-reranker-v2-m3, ambos de BAAI. El texto normativo se recopiló del Planalto el 19/10/2026.

## Capacidades

- Generación de texto conversacional en portugués de Brasil orientada a consultas de derecho laboral.
- Respuesta fundamentada en fragmentos recuperados (RAG), citando artículo y norma exacta.
- Cobertura de tres normas: CLT (Decreto-Ley 5.452/1943), Ley 6.019/1974 (trabajo temporal y tercerización) y Ley del FGTS (Ley 8.036/1990).
- Cita explícita de la etiqueta del artículo y de la norma en la respuesta.
- Integración con pipelines de recuperación mediante embeddings bge-m3 y reranking con bge-reranker-v2-m3.
- Modo de pensamiento desactivable mediante `chat_template_kwargs={"enable_thinking": false}` (heredado del modelo base Qwen3-8B).
- No se documentan capacidades de tool calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Consulta de derechos laborales en atención al empleado: un portal de RR. HH. puede usar el modelo con el corpus de búsqueda para responder preguntas sobre vacaciones, jornada o FGTS, citando el artículo de la CLT aplicable y reduciendo la dependencia de personal especializado para consultas de primer nivel.
- Asistencia a abogados laboralistas en la preparación de escritos: el modelo recupera el fragmento normativo relevante y genera un borrador con la cita exacta del artículo, que el profesional revisa y valida antes de su uso.
- Automatización del departamento personal: resolución de dudas internas sobre cálculo de FGTS o régimen de trabajo temporal, apoyándose en la Ley 8.036/1990 y la Ley 6.019/1974 incluidas en el corpus.
- Formación interna de equipos de RR. HH.: generación de material de consulta y respuestas de referencia sobre tercerización y trabajo temporal, con trazabilidad a la norma citada.
- Sistemas de preguntas y respuestas sobre legislación laboral para portales de empleo o sindicatos: el modelo responde en portugués de Brasil citando la norma, lo que facilita la verificación por parte del usuario.
- Evaluación comparativa de pipelines RAG jurídicos: al ser un adaptador LoRA pequeño (0,4 GB) sobre un base de 8B, sirve como referencia para medir la ganancia de un ajuste específico frente al modelo base con la misma búsqueda (45% frente a 78% en nota máxima de contenido, según el autor).
- Despliegue en infraestructura propia con vLLM: el adaptador se sirve junto al base con `--enable-lora`, lo que permite compartir una única instancia del modelo base entre varias tareas especializadas.

## Benchmarks y rendimiento

Evaluación declarada por el autor con 60 preguntas fuera del conjunto de entrenamiento; juez: Mangaba Titan 122B.

| Métrica | Qwen3-8B sin búsqueda | Qwen3-8B + búsqueda | Mangaba Trabalhista 8B + búsqueda |
|---|---|---|---|
| Respuesta correcta (nota 5 de contenido) | 0% | 45% | 78% |
| Correcta y con el artículo exacto | 0% | 40% | 80% |
| Cita el artículo correcto | 0% | 90% | 93% |
| Cita la norma correcta | 5% | 100% | 100% |
| Nota media de contenido (1–5) | 1,03 | 3,33 | 4,30 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,4 GB; requiere cargar el modelo base Qwen3-8B completo (aproximadamente 16 GB en BF16, estimación no confirmada en la información).
- Entrenamiento realizado en 2× NVIDIA L40S.
- Inferencia recomendada con vLLM: `vllm serve Qwen/Qwen3-8B --enable-lora --max-lora-rank 32 --lora-modules trabalhista=mangaba-ai/Mangaba-Trabalhista-8B`.
- El pipeline requiere además un índice de búsqueda con embeddings bge-m3 y, opcionalmente, reranking con bge-reranker-v2-m3.
- No se especifican requisitos de VRAM para cuantizaciones, GPU consumer compatibles, latencia ni throughput en la información disponible.
- No se documentan opciones de despliegue con llama.cpp, Ollama o TGI para este adaptador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mangaba Trabalhista 8B | 8B (adaptador LoRA) | no disponible | Derecho laboral brasileño (CLT, Ley 6.019/1974, FGTS) | Apache-2.0 | Gated en Hugging Face (registro) |
| Qwen3-8B (base) | 8B | no disponible en la información | Propósito general | Apache-2.0 | Abierto en Hugging Face |
| Alternativas especializadas en derecho laboral brasileño | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros adaptadores o modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Sin el fragmento correcto en la búsqueda, la calidad cae mucho; el rendimiento depende críticamente del pipeline de recuperación.
- Las normas infralegales y la jurisprudencia no forman parte de la base de conocimiento.
- No sustituye el parecer de un profesional; el propio autor lo advierte en el formulario de acceso.
- Solo responde en portugués de Brasil; no se documenta soporte multilingüe.
- Riesgo de alucinación si el contexto recuperado es ambiguo o incompleto; el entrenamiento con distractores mitiga pero no elimina este riesgo.
- El modelo está sujeto a un formulario de registro (gated) con recogida de datos personales (nombre, empresa, cargo, correo, WhatsApp, país) bajo la LGPD; el acceso lo aprueba el equipo de Mangaba AI.
- No se documentan sesgos específicos ni evaluaciones de robustez más allá de la tabla de 60 preguntas.
- La fecha de recopilación del texto normativo es el 19/10/2026; cambios legislativos posteriores no están cubiertos.
- No se especifican requisitos de cuantización ni compatibilidad con herramientas de inferencia distintas de vLLM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mangaba-ai/Mangaba-Trabalhista-8B
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Embeddings bge-m3 (BAAI): https://huggingface.co/BAAI/bge-m3
- Reranker bge-reranker-v2-m3 (BAAI): https://huggingface.co/BAAI/bge-reranker-v2-m3
- Texto vigente de la CLT (Planalto): https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452.htm
- Ley 6.019/1974 (Planalto): https://www.planalto.gov.br/ccivil_03/leis/l6019.htm
- Ley 8.036/1990 (Planalto): https://www.planalto.gov.br/ccivil_03/leis/l8036consol.htm
