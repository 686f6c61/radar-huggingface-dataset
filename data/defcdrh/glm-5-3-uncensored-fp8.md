# defcdrh/GLM-5.3-UNCENSORED-FP8

## Resumen

GLM-5.3-UNCENSORED-FP8 es una modificación de pesos del modelo GLM-5.3 de Zhipu AI (zai-org), publicada por el usuario defcdrh bajo la marca dealignai. Se trata de una versión "abliterated" o "crack" del checkpoint FP8 original: en lugar de un fine-tuning o un LoRA, el autor aplica una edición directa en bf16 sobre los tensores residual-writer para eliminar el comportamiento de rechazo (refusal) del modelo base, manteniendo intactos los expertos FP8 enrutados. El resultado es un modelo de 753.329.940.480 parámetros totales de arquitectura `glm_moe_dsa` (Mixture of Experts con DeepSeek Sparse Attention), 78 capas y modalidad exclusivamente textual.

El modelo base es `JANGQ-AI/GLM-5.3-FP8`, una cuantización FP8 de `zai-org/GLM-5.3`, lo que permite velocidad nativa de tensor cores FP8 en hardware Hopper (H100/H200). La modificación busca reducir el comportamiento de rechazo en una taxonomía amplia de daño multilingüe, no en un dominio concreto, y se distribuye con licencia MIT. Es relevante ahora porque demuestra que la edición de pesos en checkpoints FP8 de gran escala es viable sin reentrenar, y porque documenta con detalle los modos de fallo en producción (bucles de razonamiento, agotamiento de presupuesto de tokens, limitaciones de atención dispersa en vLLM).

La ficha se centra en lo que el autor documenta; muchos datos de entrenamiento del modelo base no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `glm_moe_dsa` (Mixture of Experts con DeepSeek Sparse Attention, 78 capas) |
| Parametros totales | 753.329.940.480 |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 131.072 tokens en TP8 sobre 8× H200 (techo práctico ~131K con MTP, ~160K sin MTP); contexto nativo de 1M no operativo en vLLM actual sobre `glm_moe_dsa` |
| Tipos de cuantizacion | FP8 (checkpoint nativo FP8, expertos FP8 enrutados, tensores residual-writer en bf16) |
| Idiomas soportados | en, zh, ru, sr, hi, fr, es, ar, ko, ja |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 755,7 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura `glm_moe_dsa` del GLM-5.3 original: un transformer de tipo Mixture of Experts con 78 capas y DeepSeek Sparse Attention (DSA), que combina atención dispersa con MLA (Multi-head Latent Attention) para reducir el coste de atención en contextos largos. El checkpoint es una cuantización FP8 de los pesos del modelo base, con los expertos enrutados en FP8 y los tensores residual-writer editados en bf16. La modalidad es exclusivamente textual.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO en el modelo base, ya que esos datos no aparecen en la información proporcionada. La innovación técnica destacable de esta variante no es de entrenamiento sino de edición de pesos: el autor aplica una modificación permanente en bf16 sobre los tensores residual-writer (sin fine-tuning, sin LoRA, sin hooks en runtime, sin trucos de prompt), de modo que el comportamiento "uncensored" queda grabado en los pesos y funciona con vLLM estándar. La versión v2 corrige un modo de fallo de la v1 (bucles de razonamiento en ~2% de los prompts de rechazo más difíciles, con colapso en repetición), a cambio de ~4 pp menos de TRUE_COMPLY global en HarmBench-320, pero con mejor rendimiento en la superficie real de daño (240 comportamientos no-copyright: 91,7% vs 85,9% TC en `off`).

## Capacidades

- Generación de texto y conversación multi-turno en 10 idiomas (en, zh, ru, sr, hi, fr, es, ar, ko, ja).
- Razonamiento con modo "thinking": el modelo emite bloques `<think>` y expone el razonamiento en `message.reasoning` (no en `message.reasoning_content`).
- Control de esfuerzo de razonamiento mediante `reasoning_effort`, aunque solo honra `"low"` y `"high"`; cualquier otro valor (`off`, `medium`, `max`, sin definir, o `off:` sin comillas que YAML parsea como booleano `false`) cae a `max`. No hay forma de desactivar el razonamiento en este checkpoint.
- Tool calling / function calling: soportado con `--tool-call-parser glm47` y `--enable-auto-tool-choice` en vLLM.
- Uso en agentes y bucles multi-paso: documentado, con la recomendación de usar `reasoning_effort="low"` en FP8 para evitar agotar el presupuesto de tokens dentro de `<think>`.
- Capacidad "uncensored" / refusal-removed: reducción del comportamiento de rechazo en una taxonomía amplia de daño multilingüe, no limitada a un dominio.
- Decodificación especulativa MTP: no funcional en vLLM estándar; reportada como operativa en el fork de ciprianveg con `--draft-attention-backend B12X_MLA_SPARSE` (+48% de decode en prompts de código).
- No se documentan capacidades de visión ni audio (modelo text-only).

## Casos de uso

- Investigación sobre alineación y refusal: el modelo sirve como contrapunto "abliterated" para estudiar cómo se distribuye el comportamiento de rechazo en los pesos y qué tensores lo controlan, comparando contra el GLM-5.3 base.
- Evaluación de robustez de filtros de seguridad: desplegar el modelo en un entorno aislado para medir la eficacia de clasificadores de contenido y guardrails propios frente a un modelo sin rechazo, usando HarmBench-320 como referencia metodológica.
- Generación de código en pipelines de CI/CD: con tool calling activo (`glm47`) y `reasoning_effort="low"`, el modelo puede integrarse en bucles de agente que invocan herramientas y ejecutan tareas de reparación de código, evitando el agotamiento de tokens en `<think>`.
- Atención al cliente multilingüe: la ventana de ~131K tokens en TP8 permite conversaciones multi-turno con historial largo en 10 idiomas, útil para soporte técnico con documentación extensa en contexto.
- Procesamiento de documentos largos: análisis y resumen de contratos, informes o expedientes que quepan en ~131K tokens, aprovechando la atención dispersa para reducir el coste frente a atención densa.
- Agentes autónomos de investigación: el modelo puede encadenar pasos de razonamiento y llamadas a herramientas; se recomienda fijar `max_tokens ≥ 8000` si se usa `high`/`max` para evitar respuestas vacías por truncamiento.
- Experimentación con cuantización FP8 en Hopper: caso de uso de infraestructura, para medir throughput y latencia de un MoE de 753B en FP8 nativo sobre H100/H200 con vLLM.

## Benchmarks y rendimiento

Los datos disponibles son los publicados por el autor en la model card, medidos sobre esta variante y comparados con el GLM-5.3 base.

| Benchmark | v2 (este modelo) | v1 (referencia) | Base GLM-5.3 | Notas |
|---|---|---|---|---|
| MMLU (muestra estratificada de 1026 preguntas, 18 por asignatura) | 87,43% (897/1026) | 87,72% | 85,58% | Δ v2 vs base: +1,85 pp; gate ±5 pp: pasa |
| HarmBench-320, TRUE_COMPLY, `off` | 81,6% (261/320) | no disponible | no disponible | Greedy, `max_tokens=700` |
| HarmBench-320, TRUE_COMPLY, `max` | 79,4% (254/320) | no disponible | no disponible | Greedy, `max_tokens=700` |
| HarmBench-320 no-copyright (240 comportamientos), TRUE_COMPLY, `off` | 91,7% (220/240) | 85,9% | no disponible | Superficie real de daño |
| HarmBench-320, GARBAGE | 0% en `off` y `max` | no disponible | no disponible | v2 elimina GARBAGE |
| HarmBench-320, HARD_REFUSE | 0% en `off` y `max` | no disponible | no disponible | — |

Desglose por asignatura de MMLU (v2 vs v1, 18 preguntas por asignatura, ±5,5 pp por pregunta): la media de Δ por asignatura es -0,29 pp; solo `high_school_european_history` se movió más de una pregunta (94,4→83,3, -11,1 pp = 2 preguntas peor). Las mayores ganancias (+5,5-5,6 pp = +1 pregunta) se dieron en `college_chemistry`, `world_religions`, `professional_psychology` y `security_studies`.

No se han publicado resultados de MMLU-Pro, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repo pesa 755,7 GB en safetensors; el despliegue de referencia usa 8× H200 con `--tensor-parallel-size 8` y `--gpu-memory-utilization 0.90`. No cabe en una GPU consumer.
- GPU recomendadas: H100 y H200 (FP8 nativo Hopper). El autor cita pruebas de campo en 8× DGX Spark GB10 por @0xMagnus.
- Consumer GPU: no viable; 753B parámetros en FP8 exceden con holgura cualquier GPU de consumo individual.
- Opciones de despliegue: vLLM (referencia del autor, con `--reasoning-parser glm45`, `--tool-call-parser glm47`, `--enable-auto-tool-choice`, `--enable-prefix-caching`, `--max-num-seqs 24`, `--max-model-len 131072`, `--enforce-eager` obligatorio para la ruta de atención dispersa bajo concurrencia, `--disable-custom-all-reduce`). No se documentan despliegues con llama.cpp, Ollama ni TGI.
- Paralelismo: TP8 en 8× H200 es el perfil probado. Pipeline-parallel (PP2 × TP4) "perfila bien", pero el draft MTP no implementa `SupportsPP`.
- Latencia y throughput: no se publican cifras absolutas; el fork de ciprianveg reporta +48% de decode en prompts de código con MTP y `B12X_MLA_SPARSE`. El contexto de 1M vía decode-context-parallel está cerrado en vLLM sobre `glm_moe_dsa` (el indexer DSA replica `k_cache` entre ranks DCP mientras MLA KV está sharded, provocando el error `page size is not divisible by target page size and cannot be padded` para `fp8_ds_mla`).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| GLM-5.3-UNCENSORED-FP8 (este) | 753B | ~131K en TP8 (1M no operativo en vLLM) | MIT | Variante abliterated FP8; MMLU 87,43% |
| zai-org/GLM-5.3 (base) | 753B | no disponible | no disponible en la información | Base sin modificar; MMLU 85,58% según el autor |
| JANGQ-AI/GLM-5.3-FP8 | 753B | no disponible | no disponible en la información | Cuantización FP8 del base; origen de este checkpoint |
| dealignai/GLM-5.3-CYBERSECURITY-FP8 | no disponible | no disponible | no disponible | Variante hermana enfocada a ciberseguridad, citada por el autor |

No se dispone de datos de benchmarks ni de especificaciones completas de las alternativas para una comparación más amplia (por ejemplo, frente a otros MoE de escala similar); esa información no está disponible.

## Limitaciones y advertencias

- Modelo "uncensored" / refusal-removed: reduce deliberadamente el comportamiento de rechazo en una taxonomía amplia de daño. No es apto para despliegues públicos sin guardrails externos; el propio autor lo orienta a investigación y evaluación.
- Riesgo de alucinación: no se han publicado métricas de factualidad; al ser una modificación de pesos sobre un modelo base, hereda los sesgos y errores de este, y la edición de residual-writer puede alterar comportamientos no medidos.
- Sesgos conocidos: no documentados en la información disponible; la cobertura multilingüe (10 idiomas) no garantiza calidad homogénea entre ellos.
- Limitaciones de contexto: el contexto nativo de 1M no es operativo en vLLM actual sobre `glm_moe_dsa`; el techo práctico es ~131K con MTP y ~160K sin MTP en TP8 sobre H200. El decode-context-parallel está cerrado por un error de page size con `fp8_ds_mla`.
- Razonamiento no desactivable: `reasoning_effort` solo honra `"low"` y `"high"`; el resto cae a `max`. Con `high`/`max` el modelo puede consumir todo `max_tokens` dentro de `<think>` y devolver cero tokens de respuesta (finish=`length`); usar `max_tokens ≥ 8000` en esos modos.
- MTP no funcional en vLLM estándar; requiere el fork de ciprianveg y `--draft-attention-backend B12X_MLA_SPARSE`.
- Licencia MIT: permisiva para uso comercial según el texto de la licencia, pero el comportamiento del modelo y su naturaleza "uncensored" pueden incumplir políticas de plataformas o normativa aplicable; la responsabilidad recae en el desplegador.
- Repo de 755,7 GB y 20 descargas en el momento de la consulta: ecosistema pequeño, poca validación comunitaria independiente.
- El autor advierte que la v1 tenía bucles de razonamiento en ~2% de los prompts más difíciles; la v2 los corrige según su metodología, pero no hay validación externa publicada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/defcdrh/GLM-5.3-UNCENSORED-FP8
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Cuantización FP8 de origen: https://huggingface.co/JANGQ-AI/GLM-5.3-FP8
- Variante hermana de ciberseguridad: https://huggingface.co/dealignai/GLM-5.3-CYBERSECURITY-FP8
- Organización del autor de la modificación: https://huggingface.co/dealignai
- Discusión con notas de runtime en 8× DGX Spark GB10: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8/discussions/3
- Twitter del autor: https://twitter.com/dealignai
- Perfil de @0xMagnus: https://huggingface.co/0xMagnus
