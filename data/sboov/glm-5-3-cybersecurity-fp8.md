# Sboov/GLM-5.3-CYBERSECURITY-FP8

## Resumen

GLM-5.3-CYBERSECURITY-FP8 es una modificación de pesos del modelo GLM-5.3 de Z.ai (zai-org), en su variante cuantizada a FP8 publicada por JANGQ-AI. El autor de esta ficha, Sboov, distribuye un checkpoint de 753.329.940.480 parámetros totales (unos 753B) con arquitectura `glm_moe_dsa` de 78 capas y modalidad exclusivamente textual, orientado específicamente a contenido de ciberseguridad ofensiva, red team, análisis de malware y desarrollo de exploits. La modificación se presenta como un "crack" de pesos: no hay fine-tuning, LoRA ni hooks en tiempo de ejecución, sino ediciones directas sobre los escritores de residuales en bf16, dejando intactos los expertos enrutados en FP8.

El modelo resuelve un problema muy concreto: reducir la tasa de rechazo en consultas técnicas de seguridad que un modelo alineado convencional bloquearía. Según la model card, el rechazo se reduce de forma selectiva para categorías de seguridad ofensiva, mientras que en dominios ajenos (armas, química, biología, acoso, desinformación) la conformidad es menos consistente y a menudo requiere un envoltorio "educativo". La reproducción literal de material con copyright sigue generando rechazo blando en esta variante.

Su relevancia actual es doble: por un lado, es un caso de estudio de modificación de pesos sobre un MoE de gran escala en FP8 nativo para Hopper; por otro, ilustra los límites prácticos de despliegue de esta arquitectura en vLLM, con problemas documentados en decodificación especulativa (MTP), contexto de 1M mediante decode-context-parallel y gestión del presupuesto de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `glm_moe_dsa` (transformer MoE con atención dispersa tipo DeepSeek, 78 capas, text-only) |
| Parametros totales | 753.329.940.480 (≈753B) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens verificado en 8× H200 con TP8; hasta ~160K sin MTP; 1M no operativo en vLLM actual |
| Tipos de cuantizacion | FP8 (checkpoint nativo FP8, base `JANGQ-AI/GLM-5.3-FP8`); no se documentan otras variantes |
| Idiomas soportados | en, zh, ru, sr, hi, fr, es, ar, ko, ja |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 755,7 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura `glm_moe_dsa` del GLM-5.3 original: un transformer de mezcla de expertos con 78 capas y atención dispersa (DSA, DeepSeek-sparse attention) sobre una base MLA. La variante FP8 mantiene los expertos enrutados en FP8 y solo modifica los escritores de residuales en bf16, lo que preserva el rendimiento de los tensor cores FP8 en Hopper (H100/H200). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo base.

La intervención del autor es una edición de pesos orientada a eliminar rechazos en el dominio de ciberseguridad, no un reentrenamiento. La model card indica que la modificación es "genuina" sobre los pesos y que el modelo funciona con vLLM estándar sin trucos de prompt. Se documenta soporte de MTP (multi-token prediction) en el base, aunque no funcional en vLLM estándar y sí reportado en un fork con backend `B12X_MLA_SPARSE` (hasta +48% en decodificación sobre prompts de código). El parser de razonamiento es `glm45` y el de tool calling `glm47`.

## Capacidades

- Generación de texto y razonamiento multi-turno en contexto largo (hasta 131K tokens verificados en TP8).
- Contenido técnico de ciberseguridad ofensiva: desarrollo de exploits, red team, ingeniería inversa, evasión, análisis de malware y ataques a credenciales, con rechazo reducido de forma específica.
- Tool calling y function calling (parser `glm47`, `--enable-auto-tool-choice`).
- Flujos de agente y razonamiento multi-paso, con modo de razonamiento controlable mediante `reasoning_effort` (solo `"low"` y `"high"`; cualquier otro valor cae a `max`).
- Capacidades multilingües declaradas en diez idiomas: inglés, chino, ruso, serbio, hindi, francés, español, árabe, coreano y japonés.
- Salida de razonamiento expuesta en `message.reasoning` (no en `message.reasoning_content`).
- No dispone de visión ni audio: es un modelo exclusivamente textual.

## Casos de uso

- Red teaming automatizado: el modelo puede generar hipótesis de ataque, cadenas de explotación y payloads de prueba en un entorno controlado, aprovechando la reducción de rechazos en contenido ofensivo documentada en HarmBench-320 (80-84% de conformidad directa en la superficie de daño no-copyright).
- Análisis de malware: dado un binario o fragmento de código sospechoso, el modelo puede describir comportamiento, identificar técnicas MITRE ATT&CK y proponer indicadores de compromiso, con contexto suficiente para volcar trazas largas en una sola ventana de 131K tokens.
- Desarrollo de herramientas de pentest: generación y mantenimiento de scripts de explotación, fuzzers y utilidades de reconocimiento, con tool calling para orquestar ejecuciones desde un agente.
- Ingeniería inversa asistida: explicación de ensamblador, reconstrucción de estructuras de datos y análisis de protocolos binarios, apoyándose en el contexto largo para mantener varios artefactos simultáneamente.
- Formación y concienciación en seguridad: simulación de escenarios de phishing y ingeniería social con fines pedagógicos, con la advertencia de que el modelo no está afinado para contenido de acoso o desinformación fuera del ámbito técnico.
- Automatización de triaje de vulnerabilidades: clasificación y priorización de CVEs y reportes de bug bounty, con razonamiento multi-paso y salida estructurada vía function calling.
- Investigación sobre alineación y robustez: estudio de la transferibilidad de rechazos entre dominios, ya que la model card documenta que las negativas comparten sustrato y el modelo a veces cumple en dominios ajenos con un envoltorio educativo.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son evaluaciones internas del autor, no benchmarks estándar de la comunidad.

| Evaluación | Base | CRACK Cybersecurity FP8 | Δ |
|---|---|---|---|
| MMLU (logit, 1026 preguntas) | 85,58% (bf16 pre-cuant, baseline previo) | 86,65% (889/1026) | +1,07 pp |

Comportamiento de conformidad en HarmBench-320 (greedy, superficie no-copyright de 240 comportamientos):

| `reasoning_effort` | TRUE_COMPLY | SOFT_REFUSE | REDIRECT | DEFLECT | HARD_REFUSE | UNK |
|---|---|---|---|---|---|---|
| off | 196 (81,7%) | 4 | 2 | 1 | 0 | 37 |
| low | 202 (84,2%) | 4 | 8 | 0 | 1 | 25 |
| max | 192 (80,0%) | 3 | 3 | 0 | 0 | 40 |

En el conjunto completo de 320 comportamientos (incluye 80 de copyright), la conformidad directa baja al 63,4-69,7% y el rechazo blando sube a 15,9-18,1%, concentrado en la categoría de copyright. No se han publicado resultados de MMLU-Pro, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repo pesa 755,7 GB en FP8, por lo que la inferencia requiere agregar al menos ese tamaño más overhead de KV cache. No cabe en ninguna GPU de consumo individual.
- GPU recomendadas: 8× H200 con tensor-parallel 8 es la configuración validada (la model card cita `--tensor-parallel-size 8 --gpu-memory-utilization 0.90 --max-model-len 131072 --max-num-seqs 24`). También se probó en 8× DGX Spark GB10.
- GPU de consumo: no es viable. El modelo no cabe en RTX 4090, RTX 5090 ni configuraciones multi-GPU de consumo razonables.
- Opciones de despliegue: vLLM es el runtime documentado. No se mencionan llama.cpp, Ollama ni TGI, y dado el tamaño y la arquitectura MoE dispersa, su portabilidad a esos runtimes no está soportada por la información disponible.
- Notas de despliegue: `--enforce-eager` es obligatorio para la ruta de atención dispersa bajo concurrencia; `--disable-custom-all-reduce` y `--enable-prefix-caching` están en la configuración recomendada. La decodificación especulativa MTP no funciona en vLLM estándar y solo se reporta operativa en un fork con `--draft-attention-backend B12X_MLA_SPARSE`.
- Latencia y throughput: no se publican cifras absolutas. El fork con MTP reporta +48% de decodificación en prompts de código; no hay datos de tokens/s en la configuración estándar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-CYBERSECURITY-FP8 (este) | ≈753B | 131K verificado | MIT | Ciberseguridad ofensiva, rechazo reducido | Hugging Face, 23 descargas |
| zai-org/GLM-5.3 (base) | ≈753B | no disponible en esta ficha | no disponible en esta ficha | Uso general alineado | Hugging Face |
| JANGQ-AI/GLM-5.3-FP8 | ≈753B | no disponible en esta ficha | no disponible en esta ficha | Cuantización FP8 del base | Hugging Face |
| dealignai/GLM-5.3-UNCENSORED-FP8 | ≈753B | no disponible en esta ficha | no disponible en esta ficha | Uncensor de propósito general | Hugging Face |

La comparativa se limita a variantes del mismo base porque no se dispone de datos de benchmarks homogéneos frente a otros modelos de la misma categoría. La diferencia principal con el hermano `UNCENSORED-FP8` es el alcance del ajuste: este checkpoint está afinado para ciberseguridad y no para conformidad universal.

## Limitaciones y advertencias

- El ajuste es específico de dominio: fuera de ciberseguridad, la conformidad es inconsistente y a menudo requiere un envoltorio "educativo". No debe tratarse como un uncensor general.
- La reproducción literal de contenido con copyright sigue generando rechazo blando en esta variante.
- `reasoning_effort` solo acepta `"low"` y `"high"`; cualquier otro valor cae a `max`. No hay forma de desactivar el razonamiento. En FP8 y con `high`/`max` el modelo puede consumir todo el presupuesto de `max_tokens` dentro de `<think>` y devolver cero tokens de respuesta (finish=length); se recomienda `low` para bucles de agente y `max_tokens ≥ 8000` si se usa `high`.
- El texto de razonamiento se expone en `message.reasoning`, no en `message.reasoning_content`, lo que rompe integraciones que esperan el campo estándar.
- MTP no funciona en vLLM estándar. El contexto de 1M mediante decode-context-parallel está cerrado en `glm_moe_dsa` por un problema de replicación del `k_cache` del indexador DSA; el techo práctico en TP8 con H200 es ~131K con MTP y ~160K sin él. Pipeline-parallel (PP2 × TP4) funciona pero el draft MTP no implementa `SupportsPP`.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad ni de calibración; en contenido técnico de seguridad, una alucinación puede traducirse en un exploit o payload incorrecto con consecuencias operativas.
- Sesgos: no documentados en la información disponible. La model card no incluye evaluaciones de sesgo demográfico ni de toxicidad fuera de HarmBench.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías y la responsabilidad legal del uso ofensivo recae en el desplegador. El contenido generado puede estar sujeto a regulación específica según jurisdicción.
- El modelo tiene 23 descargas y 0 likes en el momento de la ficha; no hay validación independiente de las cifras de la model card ni del baseline de MMLU, que el propio autor marca como pendiente de confirmación directa sobre el base FP8.
- El nombre del repo en la model card (`dealignai/GLM-5.3-CYBERSECURITY-FP8`) no coincide con el ID de Hugging Face (`Sboov/GLM-5.3-CYBERSECURITY-FP8`), lo que puede indicar una re-publicación o un fork; conviene verificar la procedencia antes de desplegar en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sboov/GLM-5.3-CYBERSECURITY-FP8
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Cuantización FP8 de referencia: https://huggingface.co/JANGQ-AI/GLM-5.3-FP8
- Variante uncensored del mismo autor: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8
- Discusión de runtime en 8× DGX Spark GB10: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8/discussions/3
- Perfil del autor en Hugging Face: https://huggingface.co/dealignai
- Twitter del autor: https://twitter.com/dealignai
- Perfil del tester: https://huggingface.co/0xMagnus
