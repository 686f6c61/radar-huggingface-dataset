# liyifan94/GLM-5.3-CYBERSECURITY-FP8

## Resumen

El modelo GLM-5.3-CYBERSECURITY-FP8 es una variante modificada del modelo GLM-5.3 (753B parámetros totales, arquitectura MoE con atención dispersa), desarrollada por dealignai y distribuida en el repositorio liyifan94/GLM-5.3-CYBERSECURITY-FP8. Se trata de un checkpoint "crack" o "abliterated" que elimina parcialmente los rechazos del modelo base, orientado específicamente a ciberseguridad ofensiva: red team, pentesting, desarrollo de exploits, reverse engineering, análisis de malware y phishing. La modificación se aplica sobre la cuantización FP8 de JANGQ-AI/GLM-5.3-FP8, que conserva la velocidad nativa de los tensor cores FP8 en GPUs Hopper (H100/H200). Con 78 capas, un contexto práctico de 131K tokens en 8×H200 y licencia MIT, este modelo permite ejecutar tareas de seguridad ofensiva donde el modelo base rechazaría la solicitud. Es relevante para investigadores y profesionales de seguridad que necesitan un modelo de gran tamaño con alta capacidad de razonamiento y bajo nivel de rechazo en su dominio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | glm_moe_dsa (Mixture-of-Experts con atención dispersa DeepSeek-sparse, 78 capas, solo texto) |
| Parametros totales | 753.329.940.480 (≈753B) |
| Parametros activos | no disponible |
| Longitud de contexto | Hasta 1.000.000 tokens teóricos; no operativo en vLLM con glm_moe_dsa. Límite práctico documentado: ~131.072 tokens con MTP y ~160.000 sin MTP en 8×H200 |
| Tipos de cuantizacion | FP8 (expertos enrutados; residuos en bf16) |
| Idiomas soportados | Inglés, chino, ruso, serbio, hindi, francés, español, árabe, coreano, japonés |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura glm_moe_dsa de GLM-5.3: un transformer de 78 capas con Mixture-of-Experts y mecanismo de atención dispersa (DeepSeek-sparse attention, DSA). Es un modelo exclusivamente de texto. La cuantización FP8 se aplica a los expertos enrutados, mientras que los "residual writers" se mantienen en bf16. La variante CYBERSECURITY se obtiene mediante una modificación directa de los pesos (técnica "abliterated" / "refusal-removed") que reduce los rechazos en dominios de ciberseguridad. La card indica explícitamente que no se trata de fine-tuning, LoRA ni hooks en runtime; es una alteración auténtica de los pesos. No se detallan en la información disponible los datos de entrenamiento específicos de esta modificación (número de tokens, composición del dataset, ni procesos de RLHF/DPO). El modelo hereda el entrenamiento del base zai-org/GLM-5.3 y la cuantización FP8 de JANGQ-AI/GLM-5.3-FP8.

## Capacidades

- Generación de texto conversacional en 10 idiomas (en, zh, ru, sr, hi, fr, es, ar, ko, ja).
- Razonamiento explícito con modo de pensamiento controlado por `reasoning_effort` (`"low"` y `"high"`); el texto de razonamiento se expone en `message.reasoning`.
- Soporte de tool calling / function calling, mediante los parsers específicos de vLLM (`--tool-call-parser glm47 --enable-auto-tool-choice`).
- Soporte de agentes y razonamiento multi-step; el contexto de 131K tokens en la configuración recomendada permite conversaciones largas y loops de herramientas.
- Especialización en seguridad ofensiva: generación de exploits, payloads, técnicas de evasión, phishing, credential attacks, análisis de malware y reverse engineering, con rechazos reducidos para estas categorías.
- La reproducción literal de material con copyright sigue sufriendo soft-refusals en aproximadamente el 60-68% de ese subconjunto de comportamientos.
- No soporta visión ni audio; es texto-only.

## Casos de uso

- Pentesting y red team: el modelo genera código de exploit y payloads personalizados para entornos de prueba autorizados. Su bajo nivel de rechazo en ciberseguridad ofensiva permite que el flujo de trabajo no se interrumpa, y su contexto de 131K tokens permite analizar documentación técnica larga o el código de un proyecto completo.
- Análisis de malware: el modelo puede recibir código descompilado o comportamiento observado y producir una explicación técnica detallada, incluyendo posibles técnicas de evasión. Al ser texto-only, no analiza binarios directamente, pero sí el conocimiento derivado de ellos.
- Ingeniería social controlada: se pueden generar campañas simuladas de phishing con la voz apropiada y adaptadas por idioma, para testear la concienciación de usuarios internos o la efectividad de filtros de correo.
- Automatización de pruebas de seguridad: mediante tool calling, el modelo puede orquestar herramientas como nmap o metasploit, parsear la salida y proponer los siguientes pasos de una explotación dentro de un pipeline de CI/CD.
- Auditoría de seguridad ofensiva: el modelo genera scripts de ataque para validar controles de seguridad, crear informes de riesgo y documentar los resultados de pruebas de penetración en infraestructuras propias.
- Red teaming de modelos de IA: se puede utilizar este modelo para generar prompts agresivos de ciberseguridad y verificar si otros sistemas de defensa los bloquean, sirviendo como generador de ataques en evaluaciones de robustez.
- Documentación técnica de vulnerabilidades: el modelo explica CVEs, técnicas de explotación y mitigaciones con contexto largo, manteniendo coherencia a lo largo de análisis extensos.

## Benchmarks y rendimiento

La información proporcionada incluye resultados de MMLU y evaluaciones de cumplimiento en HarmBench-320. Se presentan tal cual, con la incertidumbre indicada.

| Benchmark | Resultado | Notas |
|---|---|---|
| MMLU (overall, 1026 preguntas) | 86.65% (889/1026) | Frente al 85.58% del base bf16 pre-cuantización; Δ +1.07 pp. El baseline directo del base FP8 está pendiente de confirmación |
| HarmBench-320 no-copyright, effort off | TRUE_COMPLY 81.7% (196/240) | 4 soft-refusals, 2 redirects, 1 deflect, 0 hard-refusals, 37 desconocidos |
| HarmBench-320 no-copyright, effort low | TRUE_COMPLY 84.2% (202/240) | 4 soft-refusals, 8 redirects, 0 deflects, 1 hard-refusal, 25 desconocidos |
| HarmBench-320 no-copyright, effort max | TRUE_COMPLY 80.0% (192/240) | 3 soft-refusals, 3 redirects, 0 deflects, 0 hard-refusals, 40 desconocidos |
| HarmBench-320 completo (incluye copyright), effort off | TRUE_COMPLY 63.4% (203/320) | 58 soft-refusals, 7 redirects, 1 deflect, 0 hard-refusals, 51 desconocidos |
| HarmBench-320 completo, effort low | TRUE_COMPLY 69.7% (223/320) | 52 soft-refusals, 10 redirects, 0 deflects, 1 hard-refusal, 34 desconocidos |
| HarmBench-320 completo, effort max | TRUE_COMPLY 64.1% (205/320) | 51 soft-refusals, 9 redirects, 0 deflects, 0 hard-refusals, 2 garbage, 53 desconocidos |

Las evaluaciones de HarmBench-320 se realizan con greedy decoding y sobre tres superficies de `reasoning_effort`. El subconjunto "no-copyright" (240 comportamientos) es el que la card considera la superficie real de daño.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como cifra exacta en la información proporcionada. El repositorio de pesos ocupa 755.7 GB; la configuración recomendada usa 8×H200 con 90% de utilización de memoria, lo que equivale a 1.128 GB totales de VRAM.
- GPU recomendadas: H100/H200 (Hopper) por el soporte nativo de FP8. La configuración probada y documentada es 8×H200 con tensor-parallel 8.
- Consumer GPU: no es viable. El modelo de 753B no cabe en GPUs de consumo como la RTX 4090; se requieren múltiples GPUs de centro de datos.
- Opciones de despliegue: vLLM, con las siguientes banderas en la configuración recomendada: `--tensor-parallel-size 8 --gpu-memory-utilization 0.90 --enforce-eager --disable-custom-all-reduce --enable-prefix-caching --max-num-seqs 24 --max-model-len 131072 --reasoning-parser glm45 --tool-call-parser glm47 --enable-auto-tool-choice`. No se menciona soporte de llama.cpp ni Ollama.
- Latencia y throughput: no disponibles en la información. Se menciona un fork B12X sparse-MLA vLLM que reporta +48% de velocidad de decode en prompts de código para MTP, y que la configuración de 8×H200 con 131K de contexto y `max-num-seqs 24` tiene ~2.98× de margen de concurrencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto operativo | MMLU (overall) | Licencia | Cuantizacion |
|---|---|---|---|---|---|
| GLM-5.3-CYBERSECURITY-FP8 (este) | 753B | 131K / 160K en 8×H200 | 86.65% | MIT | FP8 |
| zai-org/GLM-5.3 (base original) | 753B | no disponible | 85.58% (bf16 pre-cuantización) | no disponible | no disponible |
| JANGQ-AI/GLM-5.3-FP8 (base cuantizado FP8) | 753B | no disponible | no disponible | no disponible | FP8 |
| dealignai/GLM-5.3-UNCENSORED-FP8 (hermano, uncensor general) | 753B | no disponible | no disponible | no disponible | FP8 |

No se han publicado en la información disponible comparativas de rendimiento frente a modelos de la misma categoría (p. ej., otros LLM de seguridad ofensiva o MoE de ~700B). Los datos de MMLU para el base y el crack provienen de la card; el resto de valores se indican como no disponibles.

## Limitaciones y advertencias

- Es una modificación de pesos diseñada para reducir rechazos en ciberseguridad, no es un uncensor universal. En categorías no relacionadas (armas, química, biología, acoso, desinformación) puede mostrar un cumplimiento con un marco educativo, pero no está afinado para ello.
- La reproducción literal de material con copyright sigue provocando soft-refusals (aproximadamente el 60-68% del subconjunto de copyright en HarmBench-320).
- El parámetro `reasoning_effort` solo acepta `"low"` y `"high"`; cualquier otro valor (`off`, `medium`, `max`, sin definir o `off:` en YAML booleano) se interpreta como `max`. No hay forma de desactivar el razonamiento en este checkpoint.
- En FP8 con `reasoning_effort` alto/max, el modelo puede agotar `max_tokens` dentro de `<think>` y devolver cero tokens de respuesta (finish=`length`). Se recomienda `max_tokens >= 8000` si se usa `high` o `max`.
- El contexto de 1.000.000 tokens declarado por la arquitectura no es operativo en vLLM con `glm_moe_dsa` hoy; el límite práctico documentado es ~131K con MTP y ~160K sin MTP en 8×H200.
- El MTP (speculative decoding) no funciona en vLLM estándar; según la card, funciona en un fork B12X sparse-MLA vLLM, no oficial.
- Riesgo de alucinación inherente a modelos de lenguaje de gran tamaño; en HarmBench-320 hay un subconjunto "UNK" considerable (25-53 casos según la superficie) que la clasificación automática no pudo categorizar limpiamente.
- Sesgos: no se documentan sesgos específicos; el modelo hereda los del base GLM-5.3, sin evaluaciones de equidad publicadas.
- Uso potencialmente malicioso: al ser un modelo centrado en seguridad ofensiva con rechazos reducidos, debe manejarse con precaución. La licencia MIT no restringe el uso, pero su naturaleza plantea riesgos éticos y legales.

## Enlaces

- Repositorio original: https://huggingface.co/liyifan94/GLM-5.3-CYBERSECURITY-FP8
- Model card de dealignai: https://huggingface.co/dealignai/GLM-5.3-CYBERSECURITY-FP8
- Modelo hermano (uncensor general): https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8
- Modelo base original: https://huggingface.co/zai-org/GLM-5.3
- Base cuantizado FP8: https://huggingface.co/JANGQ-AI/GLM-5.3-FP8
- Copia en HuggingFace: https://huggingface.co/mindflar909/GLM-5.3-CYBERSECURITY-FP8
- Discussion sobre runtime (DGX Spark GB10): https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8/discussions/3
- No se han encontrado papers, blogs ni demos adicionales en la búsqueda web.
