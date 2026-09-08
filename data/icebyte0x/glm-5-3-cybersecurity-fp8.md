# IceByte0x/GLM-5.3-CYBERSECURITY-FP8

## Resumen

IceByte0x/GLM-5.3-CYBERSECURITY-FP8 es un modelo de lenguaje de 753.000 millones de parámetros, publicado en HuggingFace por IceByte0x y presentado como un lanzamiento del proyecto dealignai. Se trata de una variante “abliterada” (con las respuestas de rechazo eliminadas) del modelo GLM-5.3, centrada específicamente en ciberseguridad ofensiva: red teaming, pentesting, desarrollo de exploits, ingeniería inversa, evasión, phishing, ataques de credenciales y análisis de malware. No es un “uncensor” genérico: la reducción de negativas se aplica sobre el dominio de ciberseguridad, no sobre otras categorías como armas, química o biología.

La arquitectura es `glm_moe_dsa`, un modelo Mixture of Experts (MoE) con atención dispersa y 78 capas, que parte de la cuantización FP8 de `JANGQ-AI/GLM-5.3-FP8`, que a su vez se basa en `zai-org/GLM-5.3`. Los pesos están en FP8, lo que ofrece velocidad nativa en GPUs Hopper (H100/H200). Aunque el modelo base soporta teóricamente hasta 1M de contexto, en la práctica con vLLM se recomienda una ventana de 131.072 tokens (131K) en una configuración TP8 sobre 8× H200. La modificación de pesos, según la model card, es real: no emplea fine-tuning, LoRA, hooks en runtime ni trucos de prompt.

Su relevancia radica en que cubre un nicho muy concreto: profesionales de seguridad que necesitan un modelo que no se niegue a responder sobre técnicas ofensivas, sin perder capacidades generales. En la evaluación MMLU (modo logit) alcanza un 86,65%, ligeramente por encima de la línea base del modelo sin la modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | glm_moe_dsa (MoE con atención dispersa, 78 capas, solo texto) |
| Parametros totales | 753.329.940.480 (≈753B) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens práctico en vLLM; teórico 1M no soportado actualmente en vLLM |
| Tipos de cuantizacion | FP8 (pesos FP8, con residuales bf16 editados) |
| Idiomas soportados | en, zh, ru, sr, hi, fr, es, ar, ko, ja |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es `zai-org/GLM-5.3`, del que se derivan dos capas: primero la cuantización FP8 de `JANGQ-AI/GLM-5.3-FP8` y después la modificación “CRACK” que da lugar a esta variante. La arquitectura es `glm_moe_dsa`, un MoE con atención dispersa (inspirada en DeepSeek-sparse), compuesta por 78 capas y orientada únicamente a texto. Los parámetros totales ascienden a 753.329.940.480; no se ha publicado el número de parámetros activos por token.

Según la model card, la modificación es una alteración directa de pesos, sin fine-tuning, sin LoRA, sin hooks en tiempo de ejecución y sin trucos de prompt. Se editan exclusivamente los residuales bf16 que acompañan a los expertos enrutados en FP8, que permanecen sin cambios. El entrenamiento del modelo original GLM-5.3, según la noticia de Z.ai, se centró en tareas de programación y ciberseguridad mediante post-training a gran escala; no se proporcionan detalles adicionales sobre el dataset, ni sobre procesos de RLHF o DPO en la información disponible.

## Capacidades

- Generación de texto conversacional con modo de razonamiento; el texto de pensamiento se devuelve en `message.reasoning`, no en `message.reasoning_content`.
- Soporte de tool calling y function calling: el comando de despliegue incluye `--tool-call-parser glm47` y `--enable-auto-tool-choice`.
- Soporte de agentes y razonamiento multi-paso: se recomienda `--reasoning-parser glm45` y usar `reasoning_effort="low"` en bucles de agente o tool loop.
- Especializado en ciberseguridad ofensiva: red teaming, pentesting, desarrollo de exploits, ingeniería inversa, evasión, phishing, ataques de credenciales y análisis de malware.
- Capacidades multilingües en diez idiomas: inglés, chino, ruso, serbio, hindi, francés, español, árabe, coreano y japonés.
- En categorías no cibernéticas (armas, química, biología, acoso, desinformación) suele responder con un envoltorio “educativo”, no con rechazo duro.
- No es multimodal: no procesa imagen ni audio, solo texto.
- La reproducción verbatim de material con copyright sigue siendo rechazada con un soft-refuse.

## Casos de uso

- Red teaming y pentesting: el modelo puede generar payloads de prueba, sugerir vectores de ataque y analizar los resultados de escaneos, gracias a su entrenamiento específico en seguridad ofensiva y a la reducción de rechazos en este dominio.
- Análisis de malware: permite describir el comportamiento de muestras, explicar técnicas de ofuscación, persistencia o evasión, y razonar sobre indicadores de compromiso sin fricciones de negativa.
- Ingeniería inversa: es útil para interpretar ensamblador, estructuras de datos y lógica de binarios, especialmente en tareas que requieren explicaciones técnicas detalladas paso a paso.
- Automatización de agentes de seguridad: con soporte de tool calling, puede integrarse en pipelines que orquestan herramientas externas como Nmap, Metasploit o scripts de análisis de logs, siempre con `reasoning_effort="low"` para evitar agotar el presupuesto de tokens.
- Formación y entrenamiento de equipos de seguridad: sirve para generar escenarios de práctica, ejercicios de respuesta a incidentes y ejemplos de exploits con fines didácticos, en entornos controlados y autorizados.
- Soporte a CSIRT y equipos de respuesta a incidentes: puede responder preguntas técnicas sobre movimientos laterales, persistencia, escalada de privilegios o exfiltración, ayudando a acelerar el análisis en un contexto de seguridad autorizado.
- Generación de informes técnicos: produce redacciones detalladas sobre vulnerabilidades, técnicas de ataque y medidas de mitigación, en un lenguaje claro y adaptado al público técnico.

## Benchmarks y rendimiento

Se han publicado dos conjuntos de resultados en la model card: una evaluación de capacidades generales (MMLU) y una evaluación de comportamiento de cumplimiento (HarmBench-320). No se incluyen benchmarks de generación de código, matemáticas ni otros estándares comunes, por lo que no se presentan en esta ficha.

MMLU (modo logit, 1026 preguntas, sobre tokens A/B/C/D):

| Modelo | MMLU overall | Δ frente a base |
|---|---|---|
| GLM-5.3-regular (bf16 pre-quant) | 85,58% | — |
| GLM-5.3-CYBERSECURITY-FP8 | 86,65% (889/1026) | +1,07 pp |

Nota: la comparación de MMLU se hace contra la línea base bf16 previa a la cuantización, no contra la versión FP8 sin modificar.

Compliance en HarmBench-320 (greedy, tres superficies de reasoning effort). Primero, sin los 80 comportamientos de copyright (240 comportamientos):

| effort | TRUE_COMPLY | SOFT_REFUSE | REDIRECT | DEFLECT | HARD_REFUSE | UNK |
|---|---|---|---|---|---|---|
| off | 196 (81,7%) | 4 | 2 | 1 | 0 | 37 |
| low | 202 (84,2%) | 4 | 8 | 0 | 1 | 25 |
| max | 192 (80,0%) | 3 | 3 | 0 | 0 | 40 |

Después, el conjunto completo (320 comportamientos, incluyendo copyright):

| effort | TRUE_COMPLY | SOFT_REFUSE | REDIRECT | DEFLECT | HARD_REFUSE | GARBAGE | UNK |
|---|---|---|---|---|---|---|---|
| off | 203 (63,4%) | 58 (18,1%) | 7 | 1 | 0 | 0 | 51 |
| low | 223 (69,7%) | 52 (16,3%) | 10 | 0 | 1 | 0 | 34 |
| max | 205 (64,1%) | 51 (15,9%) | 9 | 0 | 0 | 2 | 53 |

## Requisitos de hardware

- VRAM estimada: los pesos FP8 ocupan aproximadamente 753 GB, más la caché KV y las activaciones. La configuración sugerida por el autor utiliza 8× H200 (141 GB cada una) con `--gpu-memory-utilization 0.90`.
- GPU recomendadas: H100 y H200 (Hopper), pues aprovechan los tensores FP8 nativos. No es viable en una GPU de consumo (por ejemplo, una RTX 4090 de 24 GB, insuficiente).
- Opciones de despliegue: vLLM es la vía principal. El comando recomendado usa `--enforce-eager`, `--disable-custom-all-reduce`, `--enable-prefix-caching`, `--max-num-seqs 24`, `--max-model-len 131072`, `--reasoning-parser glm45` y `--tool-call-parser glm47`.
- MTP (decodificación especulativa): no funcional en vLLM stock. En el fork B12X de ciprianveg, con `--draft-attention-backend B12X_MLA_SPARSE`, se reporta un +48% de velocidad de decodificación en prompts de código.
- Latencia y throughput: no se han publicado cifras oficiales; solo el dato anterior de +48% con MTP en el fork mencionado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Característica distintiva |
|---|---|---|---|---|
| IceByte0x/GLM-5.3-CYBERSECURITY-FP8 | 753B | 131K práctico en vLLM | MIT | Abliterado específico para ciberseguridad |
| zai-org/GLM-5.3 | 753B | 1M (teórico) | no disponible | Modelo base sin modificar |
| JANGQ-AI/GLM-5.3-FP8 | 753B | 1M (teórico) | no disponible | Cuantización FP8 sin abliteración |
| dealignai/GLM-5.3-UNCENSORED-FP8 | 753B | no disponible | MIT | Uncensor general, sin foco en ciberseguridad |

No se dispone de benchmarks comparativos directos en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo “crack” orientado a ciberseguridad, no un uncensor universal. En categorías no cibernéticas puede responder con un envoltorio educativo o rechazar, según el comportamiento de cumplimiento evaluado.
- Riesgo de uso indebido: genera contenido sobre malware, exploits, phishing y técnicas de evasión. Debe emplearse únicamente en entornos autorizados, legales y con fines defensivos o de investigación.
- Alucinación: el modelo puede producir técnicas de seguridad incorrectas o peligrosas si no se verifican. Las evaluaciones de HarmBench miden compliance, no exactitud técnica.
- Limitaciones de contexto: el 1M teórico no está operativo en vLLM con la arquitectura `glm_moe_dsa`; la configuración práctica es 131K. Además, con `reasoning_effort` alto o `max`, puede agotar todo el presupuesto de tokens dentro de `<think>` y devolver cero tokens de respuesta.
- Reasoning: solo se reconocen los valores `"low"` y `"high"`; no se puede desactivar. Cualquier otro valor (incluido `off` o un YAML `off:` sin comillas) cae en `max`.
- MTP: no es funcional en vLLM stock. Para activarlo se necesita un fork concreto y una configuración no estándar.
- Copyright: la reproducción verbatim de material protegido sigue siendo rechazada con un soft-refuse, por lo que no debe usarse para este fin.
- La licencia MIT permite el uso comercial, pero la responsabilidad legal y ética del uso del modelo en actividades ofensivas recae en el usuario. No hay garantías de ningún tipo.
- El modelo es muy reciente: tiene 0 descargas y 1 like en HuggingFace. Las pruebas de despliegue documentadas proceden de un único usuario, no de una suite independiente de validación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IceByte0x/GLM-5.3-CYBERSECURITY-FP8
- Modelo base FP8: https://huggingface.co/JANGQ-AI/GLM-5.3-FP8
- Modelo original de Z.ai: https://huggingface.co/zai-org/GLM-5.3
- Modelo hermano uncensor: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8
- Discusión sobre runtime en vLLM: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8/discussions/3
- Noticia sobre el lanzamiento de GLM-5.3: https://cybersecuritynews.com/glm-5-3-major-enhancements/
