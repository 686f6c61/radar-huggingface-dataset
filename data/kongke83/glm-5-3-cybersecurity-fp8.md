# kongke83/GLM-5.3-CYBERSECURITY-FP8

## Resumen

GLM-5.3-CYBERSECURITY-FP8 es una modificación de pesos del modelo GLM-5.3 de Zhipu AI (zai-org), publicada por el usuario kongke83 bajo el paraguas de la organización dealignai. Se trata de un "crack" de dominio específico: los pesos han sido editados para reducir la tasa de rechazo en contenido de seguridad ofensiva, pentesting, análisis de malware, ingeniería inversa y evasion, sin fine-tuning ni LoRA. El modelo base es la cuantización FP8 de JANGQ-AI sobre el GLM-5.3 original, con 753.329.940.480 parámetros totales (753B) en arquitectura `glm_moe_dsa` de 78 capas y modalidad exclusivamente textual.

La relevancia de esta ficha es doble. Por un lado, documenta un modelo de 753B en FP8 que ocupa 755,7 GB en el repositorio y está diseñado para servirse con vLLM en configuraciones multi-GPU (TP8 sobre 8× H200). Por otro, ilustra una práctica controvertida: la modificación directa de los pesos bf16 residuales para eliminar comportamientos de rechazo, manteniendo intactos los expertos FP8 enrutados. El autor declara que la preservación de capacidades se mantiene (MMLU logit 86,65% frente a 85,58% del base) y que el modelo conserva licencia MIT.

El checkpoint no es un "uncensor" generalista: el propio autor advierte que el rechazo se reduce específicamente en categorías de ciberseguridad, mientras que en otras áreas (armas, química, biología, acoso, desinformación) el modelo tiende a cumplir con un envoltorio "educativo". La reproducción textual de material con copyright sigue produciendo rechazos suaves. Todo el contenido de la model card debe tratarse como material de referencia, no como instrucciones operativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `glm_moe_dsa` (Mixture of Experts con DeepSeek Sparse Attention), 78 capas, text-only |
| Parametros totales | 753.329.940.480 (753B) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens verificados en TP8 sobre 8× H200; el modelo base soporta hasta 1M según referencias del autor, pero el despliegue con decode-context-parallel está cerrado en vLLM para esta arquitectura |
| Tipos de cuantizacion | FP8 nativo (expertos enrutados en FP8, escrituras residuales en bf16 editadas); cuantizaciones adicionales no disponibles |
| Idiomas soportados | en, zh, ru, sr, hi, fr, es, ar, ko, ja |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura `glm_moe_dsa` del GLM-5.3 original: un transformer de mezcla de expertos con 78 capas y atención dispersa tipo DeepSeek (DSA), en modalidad exclusivamente textual. La cuantización FP8 de JANGQ-AI mantiene los expertos enrutados en FP8 y conserva las escrituras residuales en bf16, lo que permite velocidad nativa de tensor cores FP8 en GPUs Hopper (H100/H200). El repositorio ocupa 755,7 GB, coherente con los 753B parámetros en FP8.

La modificación de este checkpoint no consiste en entrenamiento adicional: no hay fine-tuning, ni LoRA, ni hooks en tiempo de ejecución. El autor declara una "modificación genuina de pesos" que actúa únicamente sobre los escritores residuales en bf16, dejando intactos los expertos FP8 enrutados. No se especifican en la información disponible el número de tokens de entrenamiento del modelo base, la composición del dataset, ni si hubo RLHF o DPO. Tampoco se detalla el proceso exacto de ablación de rechazos más allá de la descripción de "crack" sobre los residuales.

## Capacidades

- Generación de texto y razonamiento en 10 idiomas declarados (en, zh, ru, sr, hi, fr, es, ar, ko, ja).
- Modo de razonamiento configurable mediante `reasoning_effort`, aunque solo se honran `"low"` y `"high"`; cualquier otro valor cae a `max` y no es posible desactivar el razonamiento en este checkpoint.
- Soporte de tool calling y function calling mediante `--tool-call-parser glm47` y `--enable-auto-tool-choice` en vLLM.
- Soporte de agentes y bucles multi-paso, con la advertencia de que en FP8 conviene usar `reasoning_effort="low"` para evitar agotar el presupuesto de `max_tokens` dentro de `<think>`.
- Capacidades específicas de seguridad ofensiva: red-team, desarrollo de exploits, ingeniería inversa, evasion, phishing, ataques a credenciales y análisis de malware, con rechazo reducido en estas categorías.
- El texto de razonamiento se expone en `message.reasoning` (no en `message.reasoning_content`).
- Decodificación especulativa MTP (multi-token prediction) reportada como funcional en el fork B12X sparse-MLA de vLLM de ciprianveg, con +48% de decode en prompts de código; no funcional en vLLM estándar.

## Casos de uso

- Red teaming autorizado y evaluación de seguridad: el modelo puede generar hipótesis de ataque, cadenas de explotación y análisis de superficie de ataque en entornos controlados, gracias a la reducción específica de rechazos en contenido ofensivo y a su ventana de 131K tokens para correlacionar hallazgos de múltiples fuentes.
- Análisis de malware y ingeniería inversa asistida: con contexto largo puede procesar desensamblados, cadenas de comportamiento y artefactos de muestras, y razonar sobre técnicas de evasion y persistencia sin los rechazos típicos de modelos alineados de propósito general.
- Automatización de pentesting con agentes: el soporte de tool calling y el parser `glm47` permiten integrar el modelo en bucles de agente que invocan escáneres, shells y frameworks como Metasploit o Burp, manteniendo `reasoning_effort="low"` para no agotar el presupuesto de tokens.
- Generación de reglas de detección y firmas: a partir de descripciones de TTPs o muestras, el modelo puede redactar reglas YARA, Sigma o consultas SIEM en un pipeline de detección, aprovechando su conocimiento de técnicas ofensivas para anticipar variantes.
- Formación y concienciación en ciberseguridad: generación de escenarios de phishing simulados, ejercicios de mesa y material de entrenamiento para equipos defensivos, con la ventaja de que el modelo no bloquea la creación de contenido realista de ataque.
- Investigación académica en seguridad: estudio de comportamientos de modelos ablacionados, comparación de tasas de cumplimiento en HarmBench y análisis de sesgos de rechazo entre dominios, usando las métricas publicadas por el autor como línea base.
- Evaluación de robustez de defensas: el modelo puede actuar como generador adversarial en pipelines de evaluación de clasificadores, WAFs o sistemas de detección, produciendo payloads y variantes que prueben la cobertura de las defensas.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. La evaluación MMLU se realizó en modo logit (probabilidad sobre tokens A/B/C/D, sin generación), idéntica en base y crack. HarmBench-320 se evaluó con decodificación greedy en tres superficies de `reasoning_effort`.

| Benchmark | Base | CRACK Cybersecurity FP8 | Δ |
|---|---|---|---|
| MMLU (overall, 1026 preguntas) | 85,58%¹ | 86,65% (889/1026) | +1,07 pp |

¹ Línea base previa de GLM-5.3-regular en bf16 antes de cuantizar; la línea base directa sobre el FP8 está pendiente de confirmación según el autor.

Comportamiento de cumplimiento en HarmBench-320 (240 comportamientos no-copyright, greedy):

| reasoning_effort | TRUE_COMPLY | SOFT_REFUSE | REDIRECT | DEFLECT | HARD_REFUSE | UNK |
|:---:|---:|---:|---:|---:|---:|---:|
| off | 196 (81,7%) | 4 | 2 | 1 | 0 | 37 |
| low | 202 (84,2%) | 4 | 8 | 0 | 1 | 25 |
| max | 192 (80,0%) | 3 | 3 | 0 | 0 | 40 |

HarmBench-320 completo (incluye 80 comportamientos de copyright):

| reasoning_effort | TRUE_COMPLY | SOFT_REFUSE | REDIRECT | DEFLECT | HARD_REFUSE | GARBAGE | UNK |
|:---:|---:|---:|---:|---:|---:|---:|---:|
| off | 203 (63,4%) | 58 (18,1%) | 7 | 1 | 0 | 0 | 51 |
| low | 223 (69,7%) | 52 (16,3%) | 10 | 0 | 1 | 0 | 34 |
| max | 205 (64,1%) | 51 (15,9%) | 9 | 0 | 0 | 2 | 53 |

El autor señala que el copyright aporta entre 48 y 54 de los SOFT_REFUSE en cada superficie (aproximadamente 60-68% del bucket de copyright). El bucket UNK corresponde a respuestas conformes con envoltorio suave que el subclasificador LLM no pudo categorizar limpiamente.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 755,7 GB en FP8; se requiere un mínimo de 8 GPUs de 80 GB para TP8 con margen de memoria para KV cache.
- GPU recomendadas: 8× H200 (configuración validada por el autor con 131K de contexto y `max-num-seqs 24`, con ~2,98× de headroom de concurrencia) o 8× H100. El autor menciona pruebas en 8× DGX Spark GB10.
- No cabe en GPU de consumo: 753B parámetros en FP8 exceden con holgura cualquier RTX 4090 o similar.
- Despliegue: vLLM con `--tensor-parallel-size 8`, `--enforce-eager` (obligatorio para la ruta de atención dispersa bajo concurrencia), `--disable-custom-all-reduce`, `--enable-prefix-caching`, `--max-num-seqs 24`, `--max-model-len 131072`, `--reasoning-parser glm45`, `--tool-call-parser glm47`, `--enable-auto-tool-choice`.
- Decodificación especulativa MTP: no funcional en vLLM estándar; funcional en el fork B12X sparse-MLA de ciprianveg con `--draft-attention-backend B12X_MLA_SPARSE` (+48% decode en prompts de código).
- Contexto de 1M vía decode-context-parallel: cerrado en vLLM para `glm_moe_dsa` por incompatibilidad entre el `k_cache` replicado del indexador DSA y el MLA KV sharded (`page size is not divisible by target page size and cannot be padded` para `fp8_ds_mla`). Techo práctico en TP8 H200: ~131K con MTP, ~160K sin MTP.
- Latencia y throughput: no disponibles más allá del dato de +48% de decode con MTP en el fork B12X.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| GLM-5.3-CYBERSECURITY-FP8 | 753B (MoE, FP8) | 131K verificado (hasta 1M teórico) | MIT | Crack de dominio ciberseguridad; MMLU 86,65% logit |
| GLM-5.3-UNCENSORED-FP8 (dealignai) | 753B (MoE, FP8) | no disponible | MIT | Uncensor generalista del mismo base; el autor lo recomienda para fines no-ciberseguridad |
| zai-org/GLM-5.3 (base) | 753B (MoE) | no disponible | no disponible | Modelo original alineado de Zhipu AI |
| JANGQ-AI/GLM-5.3-FP8 | 753B (MoE, FP8) | no disponible | no disponible | Cuantización FP8 del base sin modificación de rechazos |

## Limitaciones y advertencias

- El modelo elimina rechazos de forma específica para ciberseguridad ofensiva; en otras categorías (armas, química, biología, acoso, desinformación) cumple a menudo con envoltorio "educativo" por sustrato compartido de rechazos, lo que lo hace inadecuado como filtro de seguridad general.
- La reproducción textual de material con copyright sigue produciendo rechazos suaves (aproximadamente 60-68% del bucket de copyright).
- Riesgo elevado de uso malicioso: el modelo está diseñado para generar contenido de ataque, exploits, phishing y evasion sin las salvaguardas habituales. El despliegue debe restringirse a entornos autorizados, con registro de auditoría y control de acceso.
- El modo de razonamiento no se puede desactivar: `reasoning_effort` solo honra `"low"` y `"high"`; cualquier otro valor cae a `max`, lo que puede agotar el presupuesto de `max_tokens` dentro de `<think>` y devolver cero tokens de respuesta (`finish=length`). Para uso con agentes en FP8 se recomienda `"low"` y `max_tokens ≥ 8000` si se usa `"high"` o `"max"`.
- El texto de razonamiento se expone en `message.reasoning`, no en `message.reasoning_content`; las integraciones que esperen el segundo campo fallarán.
- MTP no funcional en vLLM estándar; el fork B12X requiere validación adicional y no implementa `SupportsPP` para el draft, lo que limita combinaciones con pipeline parallelism.
- El contexto de 1M no es alcanzable en vLLM actual para esta arquitectura; el techo práctico es ~131K en TP8 H200.
- Licencia MIT declarada, pero el modelo deriva de GLM-5.3 de Zhipu AI y de la cuantización de JANGQ-AI; conviene verificar las condiciones de los modelos base antes de uso comercial.
- Sesgos conocidos del modelo base no documentados en la información disponible; el proceso de ablación puede alterar distribuciones de probabilidad en dominios adyacentes de forma no medida.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay validación independiente de las métricas declaradas por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kongke83/GLM-5.3-CYBERSECURITY-FP8
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Cuantización FP8 base: https://huggingface.co/JANGQ-AI/GLM-5.3-FP8
- Modelo hermano uncensored: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8
- Organización dealignai: https://huggingface.co/dealignai
- Discusión de referencia sobre runtime: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8/discussions/3
- Perfil del tester @0xMagnus: https://huggingface.co/0xMagnus
- Twitter del autor: https://twitter.com/dealignai
