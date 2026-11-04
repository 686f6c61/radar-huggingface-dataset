# AleaiactaEst1/GLM-5.3-CYBERSECURITY-FP8

## Resumen

GLM-5.3-CYBERSECURITY-FP8 es una modificación de pesos del modelo GLM-5.3 en su variante cuantizada a FP8, publicada por el usuario AleaiactaEst1 bajo el paraguas de la organización dealignai. Se trata de un *crack* de dominio: los pesos han sido editados para reducir la tasa de rechazo en contenido de seguridad ofensiva, pentesting, desarrollo de exploits, ingeniería inversa, evasión, phishing y análisis de malware. No es un fine-tuning ni un LoRA, sino una modificación directa de los tensores del modelo base, según declara la model card.

El modelo hereda la arquitectura `glm_moe_dsa` de GLM-5.3: un transformer de mezcla de expertos (MoE) de 753.329.940.480 parámetros totales, 78 capas y modalidad exclusivamente textual. La variante FP8 mantiene los expertos enrutados en FP8 y solo edita los escritores de residuales en bf16, lo que preserva la velocidad nativa de los tensor cores FP8 en hardware Hopper (H100/H200).

Su relevancia es acotada y de nicho: sirve como herramienta de investigación en red-team y evaluación de seguridad ofensiva, no como modelo de propósito general. La model card es explícita en que el *uncensor* está afinado para ciberseguridad y que otras categorías (armas, química, biología, acoso, desinformación) solo obtienen compliance parcial con envoltorio "educativo". La reproducción literal de material con copyright sigue rechazándose de forma suave.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `glm_moe_dsa` (transformer MoE con DeepSeek-sparse attention), 78 capas, text-only |
| Parametros totales | 753.329.940.480 |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens verificados en 8× H200 con TP8; 1M vía decode-context-parallel no funcional en vLLM actual |
| Tipos de cuantizacion | FP8 (expertos enrutados en FP8, residuales en bf16) |
| Idiomas soportados | en, zh, ru, sr, hi, fr, es, ar, ko, ja |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base GLM-5.3 emplea la arquitectura `glm_moe_dsa`, una mezcla de expertos con atención dispersa tipo DeepSeek (DSA) y mecanismo MLA (multi-head latent attention). La variante FP8 de JANGQ-AI cuantiza los expertos enrutados a FP8 manteniendo los residuales en bf16, lo que permite ejecución con tensor cores FP8 nativos en Hopper. El proceso de *crack* consiste en la edición directa de los pesos bf16 de los escritores de residuales; no hay fine-tuning, LoRA, hooks de runtime ni trucos de prompt según la model card.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base, ya que la model card del crack no los detalla. Como innovaciones técnicas destacables, el modelo soporta decodificación especulativa MTP (multi-token prediction), aunque esta es no funcional en vLLM estándar y solo se reporta operativa en el fork sparse-MLA de ciprianveg con `--draft-attention-backend B12X_MLA_SPARSE`, con una mejora de decodificación del +48% en prompts de código. También incorpora *reasoning effort* configurable, aunque en este checkpoint solo honra `"low"` y `"high"`; cualquier otro valor cae a `max`.

## Capacidades

- Generación de texto y razonamiento con modo *thinking* explícito, expuesto en `message.reasoning` (no en `message.reasoning_content`).
- Contenido de seguridad ofensiva: desarrollo de exploits, análisis de malware, ingeniería inversa, evasión, phishing y ataques de credenciales, con tasas de compliance directo del 80-84% en HarmBench-320 (excluyendo copyright).
- Tool calling y function calling, con parser `glm47` y `--enable-auto-tool-choice` en vLLM.
- Razonamiento multi-paso y uso en agentes, con la salvedad de que en FP8 se recomienda `reasoning_effort="low"` para bucles de herramientas.
- Capacidades multilingües en diez idiomas: inglés, chino, ruso, serbio, hindi, francés, español, árabe, coreano y japonés.
- Sin capacidades de visión ni audio: el modelo es exclusivamente textual.
- Compliance parcial en dominios no-ciberseguridad (armas, química, biología, acoso, desinformación) con envoltorio "educativo", pero no es un *uncensor* universal.

## Casos de uso

- Red-team y pentesting autorizado: el modelo genera cadenas de explotación y payloads técnicos con una tasa de rechazo mínima, adecuado para equipos con alcance contractual definido y entornos aislados.
- Análisis de malware: puede desensamblar y explicar comportamiento de muestras, identificar IOCs y proponer reglas de detección, aprovechando la reducción de rechazo en análisis técnico ofensivo.
- Ingeniería inversa de binarios: útil para reconstruir lógica de aplicaciones propietarias en auditorías de seguridad, con contexto de 131K tokens para volcar secciones completas.
- Formación y concienciación: generación de escenarios de phishing simulados y ejercicios de mesa para equipos de seguridad, siempre en entornos controlados.
- Automatización de pipelines de bug bounty: integración vía tool calling en flujos que requieren generación de PoCs y validación de vulnerabilidades, con `reasoning_effort="low"` para evitar el agotamiento de presupuesto en `<think>`.
- Investigación en alineación y evaluación de refusal: el modelo sirve como sujeto de estudio para medir cómo la edición de pesos afecta a las tasas de compliance por dominio, con datos de HarmBench ya publicados en la model card.
- Evaluación de defensas y detección: generar tráfico y artefactos ofensivos para entrenar y validar sistemas de detección (IDS, EDR, SIEM) en laboratorio.

## Benchmarks y rendimiento

| Benchmark | Base | CRACK Cybersecurity FP8 | Δ |
|---|---|---|---|
| MMLU (overall, 1026 Q, logit-mode) | 85,58%¹ | 86,65% (889/1026) | +1,07 pp |

¹ Baseline previo de GLM-5.3-regular en bf16 pre-cuantización; el baseline directo sobre base-FP8 está pendiente de confirmación según la model card.

Compliance en HarmBench-320 (greedy, 240 comportamientos no-copyright):

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

## Requisitos de hardware

- VRAM estimada: el repo ocupa 755,7 GB en safetensors FP8; se requiere un nodo multi-GPU con al menos 8 GPUs de 80 GB para TP8.
- GPU recomendadas: 8× H100 o 8× H200 para FP8 nativo en Hopper. La model card reporta pruebas de campo en 8× DGX Spark GB10.
- No cabe en GPU de consumo: 753B parámetros en FP8 exceden cualquier configuración consumer (RTX 4090 con 24 GB, etc.).
- Despliegue: vLLM con `--tensor-parallel-size 8`, `--enforce-eager` (obligatorio para la ruta de atención dispersa bajo concurrencia), `--disable-custom-all-reduce`, `--enable-prefix-caching`, `--max-num-seqs 24`, `--max-model-len 131072`, `--reasoning-parser glm45`, `--tool-call-parser glm47` y `--enable-auto-tool-choice`.
- Decodificación especulativa MTP: no funcional en vLLM estándar; operativa en el fork sparse-MLA de ciprianveg con `--draft-attention-backend B12X_MLA_SPARSE` (+48% de decodificación en prompts de código).
- Techo práctico de contexto en TP8 sobre H200: ~131K tokens con MTP, ~160K sin MTP. El paralelismo de pipeline (PP2 × TP4) perfila correctamente, pero el draft MTP no implementa `SupportsPP`.
- Latencia y throughput: no disponibles de forma agregada; solo se reporta el +48% de decodificación con MTP en el fork mencionado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| GLM-5.3-CYBERSECURITY-FP8 | 753B (MoE) | 131K verificado | MIT | Crack de dominio ciberseguridad, FP8 |
| dealignai/GLM-5.3-UNCENSORED-FP8 | 753B (MoE) | no disponible | MIT | *Uncensor* general del mismo base, no específico de ciberseguridad |
| zai-org/GLM-5.3 | 753B (MoE) | no disponible | no disponible | Modelo base original sin modificar |
| JANGQ-AI/GLM-5.3-FP8 | 753B (MoE) | no disponible | no disponible | Cuantización FP8 del base, sin modificación de refusal |

## Limitaciones y advertencias

- El modelo reduce rechazos específicamente en ciberseguridad ofensiva; no es un *uncensor* universal y mantiene rechazos suaves en copyright y compliance parcial en otros dominios.
- Riesgo elevado de uso dual: puede generar contenido operativo de ataque (phishing, exploits, evasión). Su uso debe restringirse a entornos autorizados y con supervisión legal.
- `reasoning_effort` solo acepta `"low"` y `"high"`; cualquier otro valor cae a `max`. No es posible desactivar el razonamiento en este checkpoint.
- En FP8, con `reasoning_effort="high"` o `"max"`, el modelo puede consumir todo el presupuesto de `max_tokens` dentro de `<think>` y devolver cero tokens de respuesta (`finish=length`); se recomienda `max_tokens ≥ 8000` o usar `"low"` en bucles de agentes.
- El texto de razonamiento se expone en `message.reasoning`, no en `message.reasoning_content`, lo que rompe compatibilidades con clientes que esperan el campo estándar.
- MTP no funcional en vLLM estándar; el contexto de 1M vía decode-context-parallel está cerrado en `glm_moe_dsa` por incompatibilidad de page size entre el indexer DSA y MLA KV.
- Riesgo de alucinación no cuantificado en la model card; no hay datos de sesgo publicados.
- Licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre el cumplimiento legal del contenido generado en jurisdicciones con restricciones sobre material de seguridad ofensiva.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha; no hay validación comunitaria independiente.

## Enlaces

- HuggingFace: https://huggingface.co/AleaiactaEst1/GLM-5.3-CYBERSECURITY-FP8
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Cuantización FP8 base: https://huggingface.co/JANGQ-AI/GLM-5.3-FP8
- Modelo hermano (*uncensor* general): https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8
- Discusión de runtime en DGX Spark GB10: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8/discussions/3
- Organización dealignai: https://huggingface.co/dealignai
- Twitter del autor: https://twitter.com/dealignai
