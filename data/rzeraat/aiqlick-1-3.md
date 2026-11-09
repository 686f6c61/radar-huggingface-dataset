# rzeraat/aiqlick-1.3

## Resumen
aiqlick/1.3 es un ajuste fino (fine-tuning) del modelo Qwen2.5-14B-Instruct, publicado por el usuario rzeraat en Hugging Face, orientado a funciones de reclutamiento técnico y coordinación autónoma de procesos de selección. El modelo se presenta como un agente autónomo de contratación capaz de evaluar dosieres de candidatos, calibrar rúbricas de contratación y ejecutar acciones de plataforma mediante tool calling. Su base es un transformer decoder-only de 14.700 millones de parámetros con Grouped Query Attention (GQA) y FlashAttention-2.

La propuesta diferencial del modelo es su ventana de contexto extendida mediante YaRN RoPE (factor 4.0 sobre una longitud original de 32.768 tokens), lo que le permite procesar dosieres multi-candidato de 15-30 candidatos y 50-100 páginas de currículos, portafolios y cláusulas de cumplimiento. Además, el autor declara un entrenamiento en tres etapas: Agent-FLAN SFT multimodal, RL verificable con GRPO/RLVR y DPO por chunks.

Es relevante ahora por su enfoque en tool calling dinámico con inyección de esquemas en tiempo de ejecución, su orientación a agentes de larga duración con auto-compactación de contexto y su alineación con estándares de verificación en sandbox (Harbor). No obstante, la información disponible procede exclusivamente de la model card del autor y no incluye resultados de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Grouped Query Attention (GQA) y FlashAttention-2 |
| Parametros totales | 14.700 millones (14,7 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens nativos; 256.000+ tokens con escalado YaRN RoPE (factor 4.0, original_max_position 32.768) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en), sueco (sv), aleman (de) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (la model card muestra solo ejemplos de despliegue con vLLM y Transformers; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento
El modelo parte de Qwen2.5-14B-Instruct, un transformer decoder-only denso de 14,7 B parámetros con GQA y FlashAttention-2. La modificación principal es la configuración de YaRN RoPE con factor de expansión 4.0 sobre una longitud original de 32.768 tokens, lo que extiende la ventana efectiva hasta 256.000+ tokens. Según la model card, el entrenamiento se organiza en tres etapas: (1) Agent-FLAN SFT multimodal con 110.000 filas repartidas en cinco dominios (Strategic Advisory 25k, Platform Tool Trajectories 35k, Long-Context Haystacks & Needles 20k, Harbor-Standard Extraction 15k y unified-v7 Semantic Scoring 15k); (2) RL verificable con GRPO/RLVR (G=4) usando recompensas deterministas basadas en cumplimiento de JSONSchema AST, grounding exacto de evidencia, verificación aritmética de facturas y tolerancia cero a alucinaciones; (3) DPO por chunks con endurecimiento contrastivo sobre candidatos casi correctos, requisitos ambiguos y alineación de tono.

Entre las innovaciones técnicas destacadas por el autor figuran la inyección dinámica de esquemas en tiempo de ejecución (el modelo evalúa `tools: [{ name, description, parameters }]` con formatos `camelCase`, `snake_case` y AST anidados), la auto-compactación de contexto mediante `<CONTEXT_SUMMARY>` para sesiones de 30+ turnos y la verificación en entornos containerizados Harbor con verificadores deterministas (`test.sh`).

## Capacidades
- Generación de texto y diálogo multi-turno con tono y juicio propios de un VP de Talent / Executive Search Partner, según la model card.
- Razonamiento estratégico sobre trade-offs de contratación, identificación de fortalezas transferibles y calibración de bucles de entrevista.
- Tool calling y function calling: 71 operaciones de plataforma de reclutamiento declaradas (mutaciones ATS, puntuación de candidatos, programación de entrevistas).
- Inyección dinámica de esquemas en runtime, con adaptación zero-shot a contratos de API cambiantes y formatos anidados.
- Procesamiento de contexto largo: dosieres de 15-30 candidatos, 50-100 páginas de currículos, portafolios y cláusulas de cumplimiento.
- Auto-compactación de contexto (`<CONTEXT_SUMMARY>`) para sesiones de 30+ turnos sin desbordamiento.
- Razonamiento multi-paso y comportamiento de agente autónomo de larga duración.
- Capacidades multilingües limitadas a inglés, sueco y alemán.
- Refusals de frontera RBAC (20% de negativas ante roles Viewer, Member, Recruiter, Admin).
- Extracción factual con tolerancia cero a alucinaciones bajo el estándar AA-Paperclip, según el autor.

## Casos de uso
- Triaje de dosieres multi-candidato: el modelo puede ingerir 50-100 páginas de currículos, portafolios y cláusulas de cumplimiento en una sola ventana de 200.000+ tokens, evaluando 15-30 candidatos simultáneamente contra una rúbrica de contratación.
- Asesoría estratégica de contratación: mantiene conversaciones multi-turno con hiring managers para calibrar requisitos, identificar fortalezas transferibles no obvias y rebatir requisitos poco realistas con argumentos constructivos.
- Automatización de acciones ATS: mediante tool calling sobre las 71 operaciones declaradas, puede ejecutar mutaciones en el sistema de seguimiento de candidatos (shortlist, puntuación, programación) con esquemas inyectados en runtime.
- Coordinación de ciclos de entrevista: programa bucles de entrevista y calibra rúbricas por dimensión, usando el contexto largo para mantener las restricciones de cada vacante a lo largo de sesiones de 30+ turnos.
- Verificación de extracción factual en sandbox: integrado en entornos Harbor con verificadores deterministas, puede usarse para pipelines de extracción de datos de candidatos con tolerancia cero a alucinaciones (estándar AA-Paperclip).
- Agente de cumplimiento y control de acceso: los refusals RBAC declarados permiten desplegarlo como agente con fronteras de permisos por rol (Viewer, Member, Recruiter, Admin) en plataformas de selección.
- Evaluación semántica unificada (unified-v7 Semantic Scoring): puntuación de candidatos contra dimensiones de rúbrica con grounding de evidencia exacto.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona estándares de evaluación (Harbor, AA-Paperclip, Artificial Analysis Decision Index v2) y dominios de entrenamiento, pero no incluye cifras de MMLU, HumanEval, GSM8K ni comparativas numéricas con otros modelos.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Para un modelo denso de 14,7 B parámetros, las estimaciones habituales serían aproximadamente 30 GB en FP16/BF16, 15-16 GB en cuantización de 8 bits y 8-9 GB en 4 bits, pero estos valores no están confirmados por el autor.
- GPU recomendadas: no especificadas en la model card. El ejemplo de despliegue usa vLLM con `--max-model-len 131072`, lo que sugiere GPUs con memoria amplia (A100 80 GB, H100 80 GB) para contexto completo.
- ¿Cabe en GPU de consumo? No confirmado. Con cuantización agresiva podría caber en RTX 4090 (24 GB) para contextos moderados, pero no hay datos del autor que lo verifiquen.
- Opciones de despliegue: vLLM (recomendado por el autor para producción, con `--enable-auto-tool-choice` y `--tool-call-parser openai`) y Transformers con `AutoModelForCausalLM`. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aiqlick/1.3 | 14,7 B | 128k nativo / 256k+ YaRN | Agente de reclutamiento con tool calling | Apache 2.0 | Hugging Face (0 descargas, 0 likes) |
| Qwen2.5-14B-Instruct (base) | 14,7 B | 32.768 nativo (extensible) | Instrucción general | Apache 2.0 | Hugging Face (ampliamente usado) |
| Alternativas de reclutamiento afinadas sobre Qwen2.5-14B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo entre aiqlick/1.3 y sus alternativas en la información proporcionada. La comparación con Qwen2.5-14B-Instruct se limita a la arquitectura base compartida y a la extensión de contexto declarada por el autor.

## Limitaciones y advertencias
- Sesgos conocidos: no documentados en la model card. Al ser un modelo de reclutamiento, existe riesgo estructural de sesgos en la evaluación de candidatos (edad, género, origen, trayectorias no lineales), pero el autor no reporta mitigaciones ni auditorías.
- Riesgo de alucinación: el autor declara tolerancia cero bajo el estándar AA-Paperclip, pero no se aportan métricas verificables de tasa de alucinación; el riesgo persiste sin evidencia independiente.
- Limitaciones de contexto: la ventana nativa es de 128.000 tokens; la extensión a 256.000+ depende de la configuración YaRN y puede degradar la calidad en los extremos. La auto-compactación `<CONTEXT_SUMMARY>` puede perder matices en sesiones muy largas.
- Limitaciones de idioma: solo inglés, sueco y alemán; no se declara soporte para castellano ni para otros idiomas, lo que limita su uso en procesos de selección en España.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-14B-Instruct conserva su propia licencia y condiciones, que deben revisarse.
- Caveats para producción: el modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la ficha, sin validación comunitaria. Los benchmarks no están publicados. El despliegue con contexto completo requiere hardware de gama alta. Las 71 operaciones de plataforma y los refusals RBAC son declaraciones del autor, no verificadas de forma independiente. El modelo se presenta como "multimodal" en el título, pero la información disponible no detalla capacidades de visión, audio ni imagen.

## Enlaces
- Hugging Face: https://huggingface.co/rzeraat/aiqlick-1.3
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Harbor (entornos de verificación): https://harborframework.com
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos.
