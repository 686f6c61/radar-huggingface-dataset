# mindflar909/GLM-5.3-CYBERSECURITY-FP8

## Resumen

GLM-5.3-CYBERSECURITY-FP8 es una variante especializada del modelo GLM-5.3 de Z.ai, modificada mediante técnicas de "abliteration" (eliminación de rechazos) para reducir las negativas en dominios de ciberseguridad ofensiva, red team, desarrollo de exploits, ingeniería inversa y análisis de malware. El modelo base es el GLM-5.3-FP8 cuantizado por JANGQ-AI, que a su vez deriva del GLM-5.3 original de 753 mil millones de parámetros con arquitectura MoE (glm_moe_dsa) y 78 capas. Esta versión "crack" mantiene la velocidad nativa FP8 en GPUs Hopper y está pensada para profesionales de seguridad que necesitan respuestas técnicas sin filtros de seguridad en su dominio.

El modelo se distribuye con licencia MIT y soporta diez idiomas (inglés, chino, ruso, serbio, hindi, francés, español, árabe, coreano y japonés). Su ventana de contexto alcanza 131.072 tokens en el despliegue recomendado, aunque el modelo base soporta hasta 1M de tokens. La modificación de pesos es genuina (sin fine-tuning, LoRA ni hooks en runtime), lo que permite cargarlo con vLLM estándar. Es relevante porque ofrece una alternativa de código abierto para tareas de seguridad ofensiva, un área donde los modelos comerciales suelen imponer restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atención sparse (glm_moe_dsa), 78 capas, text-only |
| Parametros totales | 753.329.940.480 (753B) |
| Parametros activos | no disponible (arquitectura MoE, no se especifica el número de expertos activos) |
| Longitud de contexto | 131.072 tokens (despliegue recomendado; el base soporta 1M) |
| Tipos de cuantizacion | FP8 (nativo para Hopper) |
| Idiomas soportados | en, zh, ru, sr, hi, fr, es, ar, ko, ja |
| Licencia | MIT |
| Formato de pesos | safetensors (FP8) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GLM-5.3, un transformer MoE con atención sparse (DeepSeek sparse attention) y 78 capas. El GLM-5.3 original comparte el mismo modelo base que GLM-5.2 (743B parámetros según Z.ai, aunque el peso safetensors indica 753B), y todas las mejoras provienen de post-entrenamiento escalado. La variante CYBERSECURITY-FP8 parte del checkpoint cuantizado a FP8 por JANGQ-AI y aplica una modificación directa de pesos (abliteration) sobre los "residual writers" en bf16, sin alterar los expertos enrutados en FP8. No se emplea fine-tuning, LoRA, hooks en runtime ni trucos de prompt; la modificación es permanente en los pesos.

El entrenamiento del modelo base incluye datos masivos de código y razonamiento, con un énfasis en tareas de largo horizonte. Para esta variante, el proceso de abliteration se enfocó específicamente en reducir rechazos en categorías de ciberseguridad ofensiva, manteniendo en gran medida las capacidades generales. Según la model card, la puntuación MMLU logit-mode del crack es de 86,65% frente al 85,58% del base bf16, lo que sugiere una preservación e incluso una ligera mejora en razonamiento general.

## Capacidades

- Generación de texto y conversación multilingüe en diez idiomas.
- Razonamiento complejo y resolución de problemas de múltiples pasos, con soporte para "thinking mode" (parsing de razonamiento GLM-45).
- Generación de código y comprensión de lenguajes de programación, con capacidades destacadas en tareas de codificación (el base GLM-5.3 es SOTA en benchmarks de código).
- Tool calling y function calling (parser GLM-47), habilitado para uso con agentes.
- Capacidades especializadas en ciberseguridad ofensiva: red team, desarrollo de exploits, ingeniería inversa, evasión, phishing, ataques de credenciales, análisis de malware y contenido técnico adyacente.
- Reducción de rechazos en dominios de seguridad ofensiva (89%+ de cumplimiento en comportamientos de cyber_offense según HarmBench-320).
- Mantiene rechazos en categorías no relacionadas (armas, química, biología, acoso, desinformación) con un envoltorio "educativo" suave.
- Reproducción verbatim de contenido con copyright aún genera soft-refuses (limitación conocida).

## Casos de uso

- Red teaming y pruebas de penetración: el modelo puede generar vectores de ataque, scripts de explotación y técnicas de evasión para evaluar la postura de seguridad de infraestructuras, gracias a su alta tasa de cumplimiento en cyber_offense (89%+).
- Desarrollo de exploits y análisis de vulnerabilidades: permite a investigadores obtener código PoC y explicaciones detalladas de fallos de seguridad sin restricciones, acelerando el análisis de CVEs.
- Ingeniería inversa de malware: puede desensamblar y explicar el comportamiento de binarios maliciosos, ayudando en la creación de firmas y contramedidas.
- Automatización de informes de seguridad: con su capacidad de tool calling, puede integrarse en pipelines que generan reportes técnicos de hallazgos de pentesting.
- Entrenamiento y educación en seguridad ofensiva: sirve como asistente para cursos de ethical hacking, proporcionando ejemplos prácticos y ejercicios sin filtros.
- Análisis forense digital: puede ayudar a interpretar artefactos de sistemas comprometidos, correlacionar eventos y sugerir líneas de investigación.
- Simulación de adversarios: en entornos de blue team, el modelo puede actuar como un atacante simulado para probar detecciones y respuestas.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados para esta variante:

| Benchmark | Base (bf16) | CRACK Cybersecurity FP8 | Δ |
|---|---|---|---|
| MMLU (overall, 1026 Q, logit-mode) | 85,58% | 86,65% (889/1026) | +1,07 pp |

En HarmBench-320 (evaluación de cumplimiento de comportamientos dañinos), con greedy decoding y tres niveles de esfuerzo de razonamiento:

| Superficie | TRUE_COMPLY (cyber_offense) | SOFT_REFUSE | HARD_REFUSE |
|---|---|---|---|
| off | 89% | 1 | 0 |
| low | 89% | 0 | 0 |
| max | 84% | 0 | 0 |

No se han publicado resultados de benchmarks adicionales (como HumanEval, GSM8K, Terminal-Bench) específicos para esta variante. El modelo base GLM-5.3 reporta SOTA en Terminal-Bench 3.0, DeepSWE y GDPval-AA v2, pero esos datos no son directamente aplicables a este crack.

## Requisitos de hardware

- VRAM estimada: el modelo en FP8 ocupa aproximadamente 753 GB (753B × 1 byte), más overhead de activaciones y KV cache. Para 131k de contexto con 24 secuencias concurrentes, se requieren al menos 8 GPUs H200 (141 GB cada una, total 1128 GB).
- GPU recomendadas: 8× H200 (Hopper) para el despliegue con tensor parallelism 8. También podría funcionar en 8× A100 80GB, pero la velocidad FP8 nativa solo está disponible en Hopper (H100/H200).
- No cabe en GPUs de consumo (RTX 4090, etc.) debido al tamaño y a la necesidad de memoria HBM de alta capacidad.
- Opciones de despliegue: vLLM (comando recomendado en la model card), con flags específicos como `--enforce-eager` para la ruta de atención sparse, `--reasoning-parser glm45` y `--tool-call-parser glm47`. No se mencionan alternativas como llama.cpp u Ollama.
- Latencia y throughput: no se proporcionan cifras exactas. El comando de ejemplo usa `--max-num-seqs 24` con un headroom de concurrencia de ~2,98×, lo que sugiere un throughput moderado para tareas de razonamiento largo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| mindflar909/GLM-5.3-CYBERSECURITY-FP8 | 753B | 131k (despliegue) | MIT | Ciberseguridad ofensiva, abliterated |
| zai-org/GLM-5.3 (base) | 753B | 1M | MIT | General, coding, razonamiento |
| JANGQ-AI/GLM-5.3-FP8 | 753B | 1M | MIT | General, FP8 cuantizado |
| dealignai/GLM-5.3-UNCENSORED-FP8 | 753B | 131k (despliegue) | MIT | Uncensor general (sin enfoque específico) |

No se dispone de comparativas publicadas con otros modelos de ciberseguridad como WhiteRabbitNeo o modelos comerciales. La principal diferencia con el base es la reducción de rechazos en el dominio de seguridad, mientras que el resto de capacidades se mantienen prácticamente intactas.

## Limitaciones y advertencias

- La reducción de rechazos se limita al dominio de ciberseguridad; en otras categorías (armas, química, biología, acoso, desinformación) el modelo aún aplica un envoltorio "educativo" suave, pero no es un uncensor universal.
- La reproducción verbatim de contenido con copyright sigue generando soft-refuses, lo que puede limitar su uso en tareas que requieran citas textuales largas.
- El modelo puede alucinar en contextos técnicos complejos, especialmente en código o exploits, por lo que se recomienda verificación humana.
- Al ser una modificación de pesos sin fine-tuning, no hay garantías de estabilidad en todos los escenarios; el comportamiento puede variar fuera de los dominios evaluados.
- Requiere hardware de gama muy alta (mínimo 8× H200) para un despliegue práctico, lo que limita su accesibilidad.
- La decodificación especulativa MTP no es funcional en vLLM para GLM-5.3 regular (problema upstream), por lo que no se puede acelerar la inferencia con ese método.
- El uso de este modelo para actividades ilegales de ciberseguridad puede violar leyes locales; el autor no asume responsabilidad por usos indebidos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mindflar909/GLM-5.3-CYBERSECURITY-FP8
- Modelo base original: https://huggingface.co/zai-org/GLM-5.3
- Modelo base cuantizado FP8: https://huggingface.co/JANGQ-AI/GLM-5.3-FP8
- Blog de Z.ai sobre GLM-5.3: https://z.ai/blog/glm-5.3
- Análisis de GLM-5.3 (aitoolsreview): https://aitoolsreview.co.uk/insights/glm-5-3
- Ficha en openlm.ai: https://openlm.ai/glm-5.3/
- Repositorio GitHub de GLM-5: https://github.com/zai-org/GLM-5
- Variante uncensored general: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8
