# Bhawookpriyam/GLM-5.3-CYBERSECURITY-FP8

## Resumen

GLM-5.3-CYBERSECURITY-FP8 es una variante modificada a nivel de pesos del modelo GLM-5.3 en cuantización FP8, publicada en HuggingFace bajo el identificador `Bhawookpriyam/GLM-5.3-CYBERSECURITY-FP8`. Según su model card, se trata de una release del proyecto dealignai (etiquetada como "CRACK"), derivada de `JANGQ-AI/GLM-5.3-FP8`, que a su vez es la cuantización FP8 del modelo upstream `zai-org/GLM-5.3`. El modelo conserva la arquitectura original `glm_moe_dsa` (Mixture of Experts con atención dispersa tipo DeepSeek), 78 capas y un total de 753.329.940.480 parámetros (≈753B), sin visión ni audio: es text-only.

El problema que aborda es muy concreto: reducir la tasa de rechazo (refusal) en categorías de ciberseguridad ofensiva, red team, desarrollo de exploits, ingeniería inversa, evasión, phishing, ataques de credenciales y análisis de malware. No es un "uncensor" de propósito general: en dominios ajenos a la ciberseguridad (armas, química, biología, acoso, desinformación) el modelo tiende a responder con un envoltorio "educativo", y la reproducción literal de contenido con copyright sigue produciendo rechazos suaves. La modificación es de pesos reales, no un fine-tuning, LoRA, hook de runtime ni truco de prompt.

La relevancia actual del checkpoint es doble. Por un lado, ofrece velocidad nativa FP8 en tensor cores de Hopper (H100/H200), con una configuración de referencia validada en vLLM sobre 8× H200 con 131.072 tokens de contexto y 24 secuencias concurrentes. Por otro, es un objeto de estudio para investigadores de alineación: la model card publica evaluaciones de cumplimiento con HarmBench-320 y una comparativa MMLU en modo logit frente al modelo base. El repositorio ocupa 755,7 GB en safetensors y acumula 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `glm_moe_dsa` (Mixture of Experts con atención dispersa DSA, estilo DeepSeek); 78 capas; text-only |
| Parámetros totales | 753.329.940.480 (≈753B) |
| Parámetros activos | no disponible (el modelo es MoE, pero la model card no publica el número de parámetros activos por token) |
| Longitud de contexto | 131.072 tokens en la configuración de referencia (TP8 sobre 8× H200, `--max-model-len 131072`); el modelo base apunta a 1M, pero el soporte vía decode-context-parallel no está operativo en vLLM para `glm_moe_dsa`. Techo práctico TP8 H200: ~131K con MTP, ~160K sin MTP |
| Tipos de cuantización | FP8 nativo (expertos enrutados en FP8 sin modificar); se menciona el formato de KV `fp8_ds_mla`. No se documentan GGUF, AWQ ni GPTQ |
| Idiomas soportados | en, zh, ru, sr, hi, fr, es, ar, ko, ja |
| Licencia | MIT |
| Formato de pesos | safetensors (FP8); tamaño del repositorio 755,7 GB |

## Arquitectura y entrenamiento

La arquitectura es `glm_moe_dsa`: un transformer de tipo Mixture of Experts con 78 capas y atención dispersa (DSA, DeepSeek Sparse Attention) sobre un índice de KV replicado. El checkpoint parte de `JANGQ-AI/GLM-5.3-FP8`, cuantización FP8 del upstream `zai-org/GLM-5.3`. Según la model card, la intervención sobre los pesos afecta únicamente a los "residual writers" en bf16: los expertos FP8 enrutados permanecen sin cambios. Esto explica que se conserve la velocidad de tensor cores FP8 en Hopper y que las métricas de capacidad (MMLU en modo logit) no solo no se degraden, sino que suban ligeramente frente a la referencia bf16 previa a la cuantización.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset original de GLM-5.3, ni sobre si hubo RLHF, DPO u otras fases de alineación en el modelo base. La modificación de este checkpoint no es un entrenamiento: no hay fine-tuning, ni LoRA, ni hooks de runtime, ni manipulación de prompts; es una edición directa de pesos orientada a reducir la tasa de rechazo en el dominio de ciberseguridad. Entre las innovaciones técnicas relevantes documentadas están: el soporte de decodificación especulativa MTP (Multi-Token Prediction), no funcional en vLLM estándar pero reportada como operativa en el fork B12X sparse-MLA de ciprianveg con `--draft-attention-backend B12X_MLA_SPARSE` (+48% de decode en prompts de código), y el parser de razonamiento `glm45` junto con el parser de tool calling `glm47`.

## Capacidades

- Generación de texto y conversación multi-turno en los 10 idiomas declarados (inglés, chino, ruso, serbio, hindi, francés, español, árabe, coreano y japonés).
- Modo de razonamiento explícito (`<think>`): el texto de razonamiento se devuelve en `message.reasoning`, no en `message.reasoning_content`. El parámetro `reasoning_effort` solo honra `"low"` y `"high"`; cualquier otro valor (`off`, `medium`, `max`, sin definir) cae a `max`, y no existe forma de desactivar el razonamiento en este checkpoint.
- Tool calling / function calling: soportado mediante `--tool-call-parser glm47` y `--enable-auto-tool-choice` en vLLM.
- Uso agéntico y razonamiento multi-paso: la model card recomienda `reasoning_effort="low"` para bucles de agente y herramientas sobre FP8, porque en `high`/`max` el modelo puede consumir todo el presupuesto de `max_tokens` dentro del bloque de pensamiento y devolver cero tokens de respuesta (`finish=length`); si se usa `high`/`max`, se aconseja `max_tokens ≥ 8000`.
- Contenido técnico de ciberseguridad ofensiva: exploit development, reverse engineering, evasión, phishing, ataques de credenciales, análisis de malware y actividades adyacentes de red team y pentest, con rechazo reducido específicamente en estas categorías.
- Conformidad parcial en dominios no ciber: respuestas con envoltorio "educativo" en categorías como armas, química, biología, acoso o desinformación, por sustrato compartido de rechazo entre dominios.
- Capacidades no disponibles: no hay visión, no hay audio y no hay modalidad de imagen; el modelo es estrictamente text-only.

## Casos de uso

- Red team y pentest asistido: el modelo puede redactar y comentar cadenas de explotación, comandos de enumeración y notas de post-explotación dentro de un alcance autorizado, gracias a que el rechazo está reducido específicamente en estas categorías y a la ventana de 131.072 tokens, suficiente para arrastrar el contexto completo de un engagement.
- Análisis de malware: ingesta de pseudocódigo descompilado o de extractos de binarios y petición de explicación funcional, identificación de IOCs y clasificación de familia, aprovechando que el modelo no bloquea el análisis de código malicioso.
- Desarrollo y validación de PoC en laboratorio: generación de pruebas de concepto y de scripts auxiliares para reproducir vulnerabilidades en entornos aislados, con tool calling para encadenar ejecución y análisis en un pipeline agéntico.
- Ingeniería inversa: apoyo en la reconstrucción de lógica de protocolos propietarios, identificación de rutinas de comprobación de licencia y documentación de estructuras de datos a partir de artefactos desensamblados.
- Formación en concienciación y simulación de phishing: redacción de correos y páginas de captura con fines de entrenamiento interno, siempre que el modelo se despliegue dentro de un marco de simulacro autorizado.
- Triaje en SOC y threat intelligence: resumen de alertas, correlación de indicadores y generación de hipótesis de ataque en conversaciones largas, gracias al contexto extendido y a la preservación de MMLU (86,65% en modo logit) respecto al base.
- Investigación sobre alineación y mecanismos de rechazo: el checkpoint es un artefacto útil para estudiar cómo se distribuye el rechazo entre dominios, con las tablas de HarmBench-320 publicadas como punto de partida reproducible.
- Automatización agéntica con herramientas: integración en bucles de agente que necesitan llamadas a funciones, con la advertencia de fijar `reasoning_effort="low"` para evitar el agotamiento del presupuesto de tokens.

## Benchmarks y rendimiento

Evaluación de capacidad (MMLU, modo logit sobre tokens A/B/C/D, sin generación; mismas condiciones en base y crack):

| Métrica | Base | CRACK Cybersecurity FP8 | Δ | Umbral (±5 pp) |
|---|---|---|---|---|
| MMLU (global, 1026 preguntas) | 85,58 %¹ | 86,65 % (889/1026) | +1,07 pp | pasa |

¹ Línea base previa de GLM-5.3-regular en bf16, antes de la cuantización; la línea base directa sobre FP8 está pendiente de confirmación según la model card.

Comportamiento de cumplimiento (HarmBench-320, greedy, tres superficies de esfuerzo de razonamiento). Subconjunto sin copyright (240 comportamientos, la superficie real de daño):

| Esfuerzo | TRUE_COMPLY | SOFT_REFUSE | REDIRECT | DEFLECT | HARD_REFUSE | UNK |
|:---:|---:|---:|---:|---:|---:|---:|
| off | 196 (81,7 %) | 4 | 2 | 1 | 0 | 37 |
| low | 202 (84,2 %) | 4 | 8 | 0 | 1 | 25 |
| max | 192 (80,0 %) | 3 | 3 | 0 | 0 | 40 |

HB-320 completo (incluye 80 comportamientos de copyright):

| Esfuerzo | TRUE_COMPLY | SOFT_REFUSE | REDIRECT | DEFLECT | HARD_REFUSE | GARBAGE | UNK |
|:---:|---:|---:|---:|---:|---:|---:|---:|
| off | 203 (63,4 %) | 58 (18,1 %) | 7 | 1 | 0 | 0 | 51 |
| low | 223 (69,7 %) | 52 (16,3 %) | 10 | 0 | 1 | 0 | 34 |
| max | 205 (64,1 %) | 51 (15,9 %) | 9 | 0 | 0 | 2 | 53 |

El copyright explica entre 48 y 54 de los SOFT_REFUSE en cada superficie (aproximadamente el 60-68 % del bloque de copyright). No se han publicado en la información disponible resultados de HumanEval, GSM8K, MMLU-Pro ni otros benchmarks adicionales, ni mediciones de throughput o latencia más allá del +48 % de decode en prompts de código con el fork B12X.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP8 suman aproximadamente 753 GB; el repositorio ocupa 755,7 GB. Hay que añadir KV cache y activaciones, por lo que el mínimo práctico está muy por encima de los 755 GB.
- Configuración de referencia validada: 8× H200 (141 GB cada una, 1.128 GB totales) con tensor-parallel de 8, `--gpu-memory-utilization 0.90`, `--max-model-len 131072` y `--max-num-seqs 24`, lo que deja un margen de concurrencia de ≈2,98×. No cabe en 8× H100 80 GB (640 GB) sin reducir contexto o número de secuencias.
- Consumer GPU: no cabe. El checkpoint no es desplegable en RTX 4090, RTX 5090 ni en configuraciones de una o dos GPU de consumo, ni siquiera con cuantizaciones agresivas documentadas (no se publican GGUF ni cuantizaciones de 4 bits para este modelo).
- Hardware alternativo probado: 8× DGX Spark GB10, según las notas de runtime aportadas por @0xMagnus en la discusión del proyecto.
- Opciones de despliegue: vLLM es la ruta soportada, con `--enforce-eager` obligatorio para la ruta de atención dispersa bajo concurrencia, `--disable-custom-all-reduce`, `--enable-prefix-caching`, `--reasoning-parser glm45`, `--tool-call-parser glm47` y `--enable-auto-tool-choice`. El pipeline paralelo PP2 × TP4 perfila correctamente, con la salvedad de que el draft MTP no implementa `SupportsPP`.
- Decodificación especulativa: MTP no funciona en vLLM estándar; en el fork B12X sparse-MLA de ciprianveg, con `--draft-attention-backend B12X_MLA_SPARSE`, se reporta un +48 % de decode en prompts de código.
- Contexto a 1M: el soporte vía decode-context-parallel está cerrado en `glm_moe_dsa` dentro de vLLM, porque el `k_cache` del indexador DSA se replica entre rangos DCP mientras el KV de MLA está shardeado, lo que provoca el error `page size is not divisible by target page size and cannot be padded` para `fp8_ds_mla`.
- Latencia y throughput: no disponible más allá del dato puntual del +48 % de decode con el fork B12X.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Bhawookpriyam/GLM-5.3-CYBERSECURITY-FP8` | 753B (MoE, `glm_moe_dsa`, 78 capas) | 131K en la configuración de referencia; 1M no operativo hoy | MMLU logit 86,65 %; HB-320 sin copyright: 80-84 % TRUE_COMPLY, ~0 HARD_REFUSE | MIT | Safetensors FP8, 755,7 GB |
| `zai-org/GLM-5.3` (base upstream) | 753B | No disponible en la información proporcionada | Línea base MMLU 85,58 % (bf16, previa a la cuantización) | No disponible en la información proporcionada | No disponible en la información proporcionada |
| `JANGQ-AI/GLM-5.3-FP8` (base inmediata) | 753B (FP8) | No disponible en la información proporcionada | Línea base directa FP8 pendiente de confirmación según la model card | No disponible en la información proporcionada | Safetensors FP8 |
| `dealignai/GLM-5.3-UNCENSORED-FP8` (modelo hermano) | 753B (FP8) | No disponible | No disponible | No disponible en la información proporcionada | Safetensors FP8 |

No se dispone en la información proporcionada de otros modelos abliterados o sin rechazo de la misma categoría (ciberseguridad ofensiva) con los que establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la model card. El modelo hereda los sesgos del base GLM-5.3, pero no hay evaluación publicada al respecto en la información disponible.
- Alucinación: no se publica ninguna medición de tasa de alucinación. En tareas de ciberseguridad, una alucinación puede producir comandos, rutas o CVE inexistentes, con riesgo operativo alto si se ejecutan sin validación.
- Limitación de contexto: 1M de tokens no es alcanzable hoy en vLLM sobre `glm_moe_dsa`; el techo práctico es ~131K con MTP y ~160K sin MTP en TP8 H200.
- Limitación de idioma: se declaran 10 idiomas, pero no se publican evaluaciones por idioma. La calidad fuera de inglés y chino no está verificada.
- Restricciones de licencia: el checkpoint se distribuye bajo MIT, pero la licencia y los términos del modelo base (`zai-org/GLM-5.3`) pueden imponer condiciones adicionales que la model card no detalla. Antes de uso comercial conviene verificar los términos del base.
- Riesgo legal y ético severo: el modelo está afinado para reducir rechazos en contenido de ciberseguridad ofensiva (exploits, evasión, phishing, ataques de credenciales, análisis de malware). Su uso en sistemas reales sin autorización explícita puede constituir delito en la mayoría de jurisdicciones. Además, puede estar sujeto a controles de exportación.
- Comportamiento de rechazo no uniforme: no es un uncensor universal. En armas, química, biología, acoso o desinformación suele responder con un envoltorio "educativo", y la reproducción literal de contenido con copyright sigue produciendo rechazos suaves.
- Caveats de producción: `reasoning_effort` solo acepta `"low"` y `"high"` y no se puede desactivar; en `high`/`max` puede agotar `max_tokens` dentro del bloque de pensamiento y devolver cero tokens de respuesta; el texto de razonamiento llega en `message.reasoning`; `--enforce-eager` es obligatorio bajo concurrencia; MTP no funciona en vLLM estándar; la decodificación especulativa no soporta pipeline parallelism.
- Madurez y soporte: el repositorio tiene 0 descargas y 0 likes, fue creado y actualizado el mismo día y no cuenta con comunidad de validación independiente más allá de las notas de un colaborador externo.
- Sobre la búsqueda web: los resultados devueltos por la búsqueda no guardan ninguna relación con este modelo (eran fondos de pantalla de anime), por lo que no aportan enlaces ni datos verificables adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Bhawookpriyam/GLM-5.3-CYBERSECURITY-FP8
- Modelo base upstream: https://huggingface.co/zai-org/GLM-5.3
- Modelo base inmediato (cuantización FP8): https://huggingface.co/JANGQ-AI/GLM-5.3-FP8
- Modelo hermano sin censura general: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8
- Discusión con notas de runtime sobre 8× DGX Spark GB10: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8/discussions/3
- Organización del autor de la release: https://huggingface.co/dealignai
- Twitter del proyecto: https://twitter.com/@dealignai
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la búsqueda web realizada.
