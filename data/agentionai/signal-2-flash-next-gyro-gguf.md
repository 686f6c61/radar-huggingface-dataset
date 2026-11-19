# agentionai/Signal-2-Flash-Next-Gyro-GGUF

## Resumen

Signal-2-Flash-Next-Gyro-GGUF es una cuantización GGUF publicada por agentionai sobre un fine-tuning propio del modelo base Qwen/Qwen3.8-Flash-Next. El modelo está orientado a tareas de codificación agéntica (agentic coding) y a la eficiencia en el consumo de tokens: según la model card, mantiene una calidad cercana a la cuantización Q5 de 111 GB del mismo autor con aproximadamente la mitad del tamaño de archivo, generando alrededor de un 27 % menos de tokens de salida y un 25 % menos de tiempo de pared por sesión de agente. El pipeline declarado es image-text-to-text, por lo que el modelo base admite entrada de imagen y texto.

El fine-tuning se realizó mediante auto-destilación a partir de sesiones exitosas del propio modelo base en el entorno de evaluación agéntica Marshall del autor, y los pesos ajustados están fusionados en el archivo, sin adaptador separado. El repositorio contiene 125.743.653.760 parámetros (según safetensors del modelo base) y ocupa 90,3 GB, con la cuantización principal TQ1_0 de 59,5 GB como archivo recomendado.

La relevancia actual del modelo radica en su enfoque en la eficiencia por byte y por token en cargas de trabajo agénticas, un aspecto poco cubierto por las cuantizaciones convencionales. No obstante, requiere un fork específico de llama.cpp (el fork de agentionai) para cargar el archivo TQ1_0, ya que el llama.cpp upstream todavía no lo soporta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-Flash-Next, transformer multimodal image-text-to-text) |
| Parámetros totales | 125.743.653.760 |
| Parámetros activos | no disponible |
| Longitud de contexto | 64k tokens (probado con KV q8_0 en Strix Halo); 16-32k recomendado con MTP en GPUs de 32 GB |
| Tipos de cuantización | TQ1_0 (archivo principal, 59,5 GB); otras cuantizaciones no detalladas |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-Flash-Next, un modelo multimodal de tipo image-text-to-text del que no se detallan en la información disponible la arquitectura interna (transformer, MoE o híbrida) ni la composición del dataset de preentrenamiento. El pipeline declarado y las etiquetas del repositorio confirman soporte de entrada de imagen y texto, y el tamaño de 125.743.653.760 parámetros corresponde al modelo base según los safetensors.

El ajuste fino de Signal 2 se realizó por auto-destilación: el modelo aprendió únicamente de sesiones de codificación agéntica del modelo base que pasaron la puerta de evaluación Marshall y superaron una auditoría de seguridad, descartando las sesiones fallidas o con acciones que incumplían reglas. Los pesos del ajuste están fusionados en el archivo, sin adaptador en tiempo de ejecución, y el autor reporta una divergencia KL de 0,025 respecto al ajuste aplicado en runtime, equivalente a la variación entre dos ejecuciones del mismo ajuste con distinto tamaño de batch. La cuantización TQ1_0 emplea tensores fusionados ligeramente más grandes que la cuantización Gyro-S del modelo base, lo que explica una decodificación aproximadamente un 13 % más lenta por token.

## Capacidades

- Generación de texto y razonamiento multi-paso en tareas agénticas de codificación.
- Codificación asistida por agente: edición de código, ejecución de comandos en sandbox y resolución de tareas con suites de test.
- Entrada multimodal image-text-to-text (heredada del modelo base Qwen3.8-Flash-Next).
- Modo de razonamiento configurable mediante `reasoning_effort` (el autor usa "medium" en sus evaluaciones).
- Decodificación especulativa con borrador MTP (multi-token prediction) opcional, que eleva el throughput en Strix Halo de 28,6 a 38,7 tok/s en prosa, 54,0 tok/s en código y 64,4 tok/s en JSON.
- Eficiencia de tokens: media de 1.623 tokens de salida por sesión frente a 2.228 del modelo base sin ajustar, sin timeouts, errores, respuestas vacías ni fallos cortos en 152 sesiones.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Agentes de codificación autónomos en producción: el modelo está ajustado específicamente para sesiones agénticas con ejecución de comandos y validación por tests, con un 87,5 % de aprobados en la puerta Marshall y un 27 % menos de tokens por sesión, lo que reduce el coste por tarea en pipelines de CI/CD.
- Automatización de revisión y parcheo de código en repositorios: la ventana de 64k tokens permite cargar varios archivos y el histórico de la sesión, y la decodificación con MTP acelera la generación de diffs y JSON estructurado (64,4 tok/s en JSON en Strix Halo).
- Despliegue en estaciones de trabajo con GPU de 32 GB: la cuantización TQ1_0 de 59,5 GB cabe ajustadamente con 64k de contexto en tarjetas como RTX 5090 o R9700 sin el borrador MTP, lo que permite ejecutar agentes de código localmente sin infraestructura de servidor.
- Despliegue en equipos con memoria unificada de 64 GB o más (Strix Halo, Mac): el autor reporta un uso de unos 30,5 GiB de memoria de GPU (34,2 GiB con MTP), lo que deja margen para contexto completo y otras aplicaciones.
- Sustitución de cuantizaciones de 3 bits en servidores con presupuesto de VRAM limitado: el archivo de 59,5 GB iguala la calidad de cuantizaciones IQ3_S de 83-84 GB con aproximadamente un 30 % menos de tokens de salida y 24 GB menos de disco.
- Tareas multimodales de documentación técnica: al heredar el pipeline image-text-to-text del modelo base, puede procesar capturas de pantalla, diagramas o documentación escaneada junto a instrucciones de código en una misma conversación.
- Evaluación comparativa de eficiencia agéntica: sirve como referencia para medir coste por tarea (tokens y tiempo de pared) frente a cuantizaciones convencionales del mismo modelo base en entornos de investigación.

## Benchmarks y rendimiento

Resultados de la puerta de evaluación agéntica Marshall del autor (tareas retenidas, tareas multi-paso más difíciles, pruebas de seguridad y tareas de código con suites de test; mismas semillas, agente, muestreo `reasoning_effort` medium y hardware AMD Strix Halo). "Clean" significa aprobado y sin acciones dañinas o contrarias a las reglas en la auditoría.

Frente al modelo base (4 semillas, 152 sesiones cada una):

| Modelo | Archivo | Aprobados | Clean | Tokens de salida media (P50 / P90) | Tiempo de pared, 76 sesiones |
|---|---:|---:|---:|---:|---:|
| Signal 2 Gyro-S | 59,5 GB | 133 (87,5 %) | 121 | 1.623 (1.103 / 3.355) | 95 min |
| Qwen3.8-Flash-Next Gyro-S | 58,5 GB | 135 (88,8 %) | 123 | 2.228 (1.390 / 4.691) | 111 min |
| Qwen3.8-Flash-Next AP-Q5_K_M (agentionai) | 111,2 GB | 141 (92,8 %) | 124 | 2.154 (1.466 / 5.015) | 131 min |

Frente a cuantizaciones rivales del mismo base (2 semillas, 76 sesiones cada una):

| Modelo | Archivo | Aprobados | Clean | Tokens P50 / P90 | Tiempo de puerta |
|---|---:|---:|---:|---:|---:|
| Signal 2 Gyro-S | 59,5 GB | 68 | 63 | 1.092 / 3.721 | 108 min |
| Qwen3.8-Flash-Next Gyro-S | 58,5 GB | 68 | 61 | 1.376 / 4.921 | 128 min |
| Swift 1.5 IQ3_S (ukisai) | 83,7 GB | 66 | 58 | 1.416 / 4.309 | 149 min* |
| Swift 1.5 IQ3_S_G8 (ukisai) | 84,4 GB | 67 | 58 | 1.673 / 4.963 | 165 min |
| ISTA GSQ-RCO IQ3_S | 83,6 GB | 66 | 60 | no disponible | no disponible |

El tiempo de pared corresponde a las semillas 3-4, las únicas que los tres primeros modelos ejecutaron en la misma máquina. El autor señala que AP-Q5_K_M es su archivo más preciso del modelo, un listón más exigente que un Q5_K_M estándar, y que registró una respuesta vacía en 152 sesiones.

## Requisitos de hardware

- VRAM estimada: unos 30,5 GiB de memoria de GPU con KV q8_0 y 64k de contexto en AMD Strix Halo (Vulkan), y unos 34,2 GiB con el borrador MTP activo, aproximadamente 1 GiB más que la cuantización Gyro-S del base. Otros backends difieren en unos cientos de MB.
- GPU de 32 GB (RTX 5090, R9700): cabe con 64k de contexto sin MTP de forma ajustada; con MTP se recomienda reducir el contexto a 16-32k. El autor indica que aún no se ha medido en CUDA.
- Memoria unificada de 64 GB o más (Strix Halo, Mac): configuración cómoda con 64k de contexto y MTP.
- Despliegue: requiere el fork de llama.cpp de agentionai (rama main) o su imagen Docker; el llama.cpp upstream todavía no puede cargar el archivo TQ1_0. Strata y strix-llama.cpp master están en fase de prueba.
- Throughput medido en AMD Strix Halo (Vulkan): 28,6 tok/s sin MTP; con MTP, 38,7 tok/s en prosa, 54,0 tok/s en código y 64,4 tok/s en JSON. La decodificación por token es aproximadamente un 13 % más lenta que Gyro-S.
- Tiempo por sesión: 76 sesiones agénticas completadas en 95 minutos, frente a 111 minutos de Gyro-S y 131 minutos de AP-Q5_K_M en la misma máquina.

## Comparativa con modelos similares

| Modelo | Archivo | Aprobados / Clean (puerta Marshall) | Tokens P50 / P90 | Tiempo de puerta | Licencia |
|---|---:|---:|---:|---:|---|
| Signal 2 Gyro-S | 59,5 GB | 68 / 63 | 1.092 / 3.721 | 108 min | qwen-community-1.0 |
| Qwen3.8-Flash-Next Gyro-S | 58,5 GB | 68 / 61 | 1.376 / 4.921 | 128 min | qwen-community-1.0 |
| Swift 1.5 IQ3_S (ukisai) | 83,7 GB | 66 / 58 | 1.416 / 4.309 | 149 min* | no disponible |
| Swift 1.5 IQ3_S_G8 (ukisai) | 84,4 GB | 67 / 58 | 1.673 / 4.963 | 165 min | no disponible |
| ISTA GSQ-RCO IQ3_S | 83,6 GB | 66 / 60 | no disponible | no disponible | no disponible |

La comparativa se limita a cuantizaciones del mismo modelo base evaluadas por el propio autor; no se dispone de datos de benchmarks frente a modelos de otros desarrolladores. El asterisco en el tiempo de Swift 1.5 IQ3_S aparece en la model card sin nota aclaratoria en la información proporcionada.

## Limitaciones y advertencias

- Requiere un fork no estándar de llama.cpp; el llama.cpp upstream no puede cargar el archivo TQ1_0, lo que limita la portabilidad y el soporte de herramientas estándar (vLLM, TGI, Ollama) sin verificación adicional.
- Las mediciones de rendimiento y velocidad proceden de una única plataforma (AMD Strix Halo con Vulkan) y del conjunto de evaluación propietario del autor (puerta Marshall); no hay resultados independientes ni en CUDA.
- El modelo es una versión preview y experimental, con 0 descargas y 0 likes en el momento de la consulta, y sin validación externa de la comunidad.
- El ajuste por auto-destilación se entrenó solo con sesiones que pasaron la puerta y la auditoría del autor, lo que puede introducir sesgo hacia el estilo y las convenciones de ese entorno concreto.
- Riesgo de alucinación y sesgos: no hay información publicada sobre evaluaciones de sesgo, toxicidad o tasas de alucinación más allá de la puerta de seguridad interna.
- Idiomas soportados no declarados; el comportamiento multilingüe no está verificado.
- La licencia qwen-community-1.0 (etiquetada como "other") impone condiciones de uso comunitario que deben revisarse antes de un despliegue comercial; no se detallan en la información disponible las restricciones concretas.
- El contexto útil con MTP en GPUs de 32 GB se reduce a 16-32k tokens, por debajo de los 64k nominales.
- La decodificación por token es un 13 % más lenta que la cuantización Gyro-S del base; la ventaja en tiempo solo se materializa cuando el agente completa la tarea con menos tokens.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agentionai/Signal-2-Flash-Next-Gyro-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Cuantización AP-Q5_K_M del mismo autor: https://huggingface.co/agentionai/Qwen3.8-Flash-Next-AP-GGUF
- Fork de llama.cpp de agentionai: https://gitlab.com/agentionai-group/llama.cpp
- Guía de ejecución: https://agention.ai/models/qwen3.8-flash-next/
- Sitio web del autor: https://agention.ai
- Perfil en X del autor: https://x.com/laurent_zw
- Apoyo al autor: https://buymeacoffee.com/agentionai
