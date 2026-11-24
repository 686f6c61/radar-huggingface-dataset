# MC7ever/dory-turbo-brilliance-agi-v2

## Resumen

Dory1.0-4B es un modelo de lenguaje de 4.000 millones de parámetros desarrollado por NVIDIA (Nemotron Labs) y redistribuido por el usuario MC7ever en Hugging Face bajo el identificador `MC7ever/dory-turbo-brilliance-agi-v2`. Se trata de un modelo de arquitectura "looped" o latente-recurrente: un bloque compartido de capas se aplica varias veces entre bloques de entrada y salida, de modo que un mismo checkpoint puede ajustar su coste de inferencia cambiando el número de bucles sin reentrenar ni cambiar de pesos. La versión publicada incluye además una plantilla de chat modificada (inspirada en el trabajo de DavidAU) que empaqueta decenas de "modos" de razonamiento e instrucción en el prompt.

El modelo parte del backbone nGPT (normalized-GPT) de NVIDIA, con atención híbrida que intercala capas de ventana deslizante (SWA) y capas de atención completa. Se preentrenó de forma nativa en NVFP4 (formato de coma flotante de 4 bits de NVIDIA) y continuó en BF16, con datos de preentrenamiento con corte en septiembre de 2025 y postentrenamiento con corte en mayo de 2026. Soporta hasta 256K tokens de contexto y está pensado para razonamiento general con una huella pequeña.

Su relevancia actual reside en dos ideas: la elasticidad del cómputo de inferencia (más bucles = más precisión, con un único checkpoint) y el ahorro de memoria mediante caché KV de último bucle, que elimina el sobrecoste de memoria asociado al looping. La ficha del autor lo etiqueta como "uncensored/abliterated" y "heretic", lo que conviene tratar con cautela en despliegues de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT normalizado (nGPT) con bucle latente-recurrente; atención híbrida intercalada SWA + atención completa |
| Parámetros totales | 3.975.229.440 (4B) |
| Parámetros activos | no disponible (no es MoE; el bucle reutiliza el mismo bloque de parámetros) |
| Longitud de contexto | hasta 256K tokens |
| Tipos de cuantización | BF16, MXFP8, NVFP4, Q5_K_M |
| Idiomas soportados | inglés (en) |
| Licencia | OpenMDW License Agreement v1.1 (etiquetada como `license: other` en el repo) |
| Formato de pesos | safetensors (BF16); variantes MXFP8, NVFP4 y GGUF Q5_K_M |
| Precisión de referencia | BF16 |
| Ventana deslizante (SWA) | modificada a 1024–4096 en esta redistribución |
| Fecha de publicación | 16 de octubre de 2026 (según model card) |
| Tamaño del repo | 8,0 GB |

## Arquitectura y entrenamiento

Dory1.0-4B emplea una arquitectura looped o latente-recurrente sobre un backbone nGPT. La pila de capas se divide en tres grupos: entrada (I), recurrente (R) y salida (O). El bloque recurrente compartido (20 capas) se aplica varias veces entre los bloques de entrada y salida (8 capas cada uno), y la entrada se reinyecta en cada bucle. Esto permite que un mismo conjunto de pesos gaste más cómputo por token "pensando" en espacio latente en lugar de generar secuencias más largas, lo que se traduce en eficiencia de tokens. La atención es híbrida: capas de ventana deslizante intercaladas con capas de atención completa.

El modelo se preentrenó de forma nativa en NVFP4 (4 bits) y continuó el entrenamiento en BF16. Los datos provienen de los conjuntos de NVIDIA `nemotron-pre-training-datasets` (corte septiembre de 2025) y `nemotron-post-training-v3` (corte mayo de 2026). La model card no detalla el número exacto de tokens de entrenamiento ni la composición del dataset, ni si hubo RLHF/DPO explícito; esa información no está disponible. La innovación destacable es la caché KV de último bucle: en lugar de almacenar una caché por cada bucle, se mantiene una sola por capa de atención recurrente, de modo que el modelo no añade sobrecoste de memoria frente a un modelo no looped equivalente, independientemente del número de bucles. La redistribución de MC7ever modifica la ventana SWA a 1024–4096 y sustituye la plantilla de chat por una versión propia con modos de razonamiento e instrucción empaquetados.

## Capacidades

- Generación de texto y razonamiento general en inglés, con modo "thinking" (razonamiento explícito) y varios niveles de esfuerzo ("Xhigh reasoning modes").
- Elasticidad de cómputo en inferencia: 1, 2 o 4 bucles sobre el mismo checkpoint, con precisión creciente a costa de latencia.
- Generación de código y tareas de agente (etiquetas "coder", "Agent AI Construct").
- Escritura creativa, narrativa, ficción y roleplaying en múltiples géneros.
- Plantilla de chat con "27 reasoning modes", "27 instruct modes", "15 AI Constructs", "5 Super AI Constructs" y "21 AGI Constructs" (constructos de prompt predefinidos por el autor de la redistribución).
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Capacidades multimodales (visión, audio): no disponibles; el modelo es solo de texto.
- Multilingüismo: limitado a inglés según la model card.
- Modo "uncensored/abliterated/heretic": el autor declara que se han reducido los rechazos, lo que afecta al comportamiento de seguridad.

## Casos de uso

- Razonamiento general de bajo coste en producción: con 4B parámetros y cuantización NVFP4 o Q5_K_M, el modelo cabe en GPUs de consumo y puede servir tareas de clasificación, extracción y respuesta a preguntas con latencia baja; el ajuste de bucles permite elegir el equilibrio precisión/latencia por petición.
- Asistente de código en IDE o CI/CD: las etiquetas "coder" y "Agent AI Construct" apuntan a generación y revisión de código; con 256K de contexto puede procesar repositorios o diffs grandes, aunque el soporte de tool calling no está confirmado y habría que validarlo.
- Escritura creativa y narrativa: los modos de ficción, roleplaying y "all genres" permiten generar relatos, diálogos y guiones; el modo "uncensored" facilita temáticas adultas o controvertidas, con la advertencia de que requiere moderación externa en entornos públicos.
- Atención al cliente automatizada: la ventana de 256K permite conversaciones multi-turno con historial largo y documentos adjuntos; el modelo es solo en inglés, por lo que no sirve para atención en castellano sin adaptación.
- Docencia y explicación ("Universal Teacher AI Construct"): generación de explicaciones, resúmenes y material didáctico en inglés, con modos de razonamiento que permiten mostrar el paso a paso.
- Procesamiento de documentos largos: resumen y extracción sobre contratos, informes o papers de hasta 256K tokens, aprovechando la atención híbrida para reducir el coste de memoria en secuencias largas.
- Experimentación en investigación: la elasticidad de bucles permite estudiar el compromiso entre cómputo de inferencia y precisión con un único checkpoint, útil para trabajos sobre latente-recurrencia y eficiencia.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks con resultados de Dory1.0-4B a 1, 2 y 4 bucles frente a Qwen3.5-4B, Qwen3.5-9B, Gemma 4 26B A4B y Qwen3.6-35B-A3B. La información proporcionada solo muestra la fila de SciCode de forma parcial (1 bucle: 27,3; 2 bucles: 34,94; 4 bucles: valor truncado). El resto de filas y tareas no están disponibles en la información recibida, por lo que no se reproducen aquí para no inventar datos.

| Tarea | Dory 1 bucle | Dory 2 bucles | Dory 4 bucles | Qwen3.5-4B | Qwen3.5-9B | Gemma 4 26B A4B | Qwen3.6-35B-A3B |
|---|---|---|---|---|---|---|---|
| SciCode | 27,3 | 34,94 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Resto de tareas | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado en la información disponible el resto de resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- VRAM estimada en BF16: unos 8 GB solo para pesos (3,97B × 2 bytes), más caché KV y activaciones; en la práctica, 10–14 GB según longitud de contexto y número de bucles.
- VRAM estimada en NVFP4: aproximadamente 2 GB para pesos, más caché KV; apto para GPUs de consumo de gama media.
- VRAM estimada en Q5_K_M (GGUF): alrededor de 2,8–3 GB para pesos, más caché KV.
- GPUs recomendadas: A100/H100 para despliegues de alta concurrencia con contexto largo; RTX 4090, RTX 4080 o RTX 3090 para inferencia en BF16 con contexto moderado; RTX 4060 Ti 16 GB o superiores para NVFP4/Q5_K_M.
- Cabe en GPU de consumo: sí, en cuantizaciones NVFP4 y Q5_K_M en GPUs con 8 GB o más; en BF16 requiere 12–16 GB para contextos largos.
- Opciones de despliegue: transformers (librería declarada), llama.cpp/Ollama para GGUF Q5_K_M, vLLM y TGI si soportan la arquitectura looped (no confirmado en la información disponible), y el runtime de NVIDIA para NVFP4.
- Latencia y throughput: no disponibles. El coste de inferencia escala con el número de bucles (1, 2 o 4), por lo que la latencia aumenta proporcionalmente al cómputo recurrente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Dory1.0-4B | 4B (looped) | 256K | OpenMDW 1.1 | Hugging Face | Elasticidad de cómputo por bucles; solo inglés |
| Qwen3.5-4B | 4B | no disponible | no disponible | Hugging Face | Referencia en la tabla de benchmarks del autor |
| Qwen3.5-9B | 9B | no disponible | no disponible | Hugging Face | Referencia en la tabla de benchmarks del autor |
| Gemma 4 26B A4B | 26B (MoE, 4B activos) | no disponible | no disponible | Hugging Face | Referencia en la tabla de benchmarks del autor |
| Qwen3.6-35B-A3B | 35B (MoE, 3B activos) | no disponible | no disponible | Hugging Face | Referencia en la tabla de benchmarks del autor |

Los datos de contexto, licencia y rendimiento de los modelos comparables no están disponibles en la información proporcionada; solo se conocen sus nombres y el hecho de que aparecen como referencias en la tabla de benchmarks de la model card.

## Limitaciones y advertencias

- Solo soporta inglés; no es adecuado para producción en castellano sin adaptación o fine-tuning.
- El modelo se distribuye con etiquetas "uncensored", "abliterated" y "heretic": el autor declara haber reducido los rechazos de seguridad, lo que aumenta el riesgo de generar contenido dañino, sesgado o no conforme a políticas. Requiere moderación externa en cualquier despliegue público.
- Riesgo de alucinación inherente a modelos de 4B; la precisión en tareas factuales será inferior a la de modelos mayores.
- La plantilla de chat modificada y los "constructos" (27 modos de razonamiento, 21 AGI Constructs, etc.) son invenciones del redistribuidor, no de NVIDIA; su comportamiento no está validado ni documentado formalmente.
- La licencia OpenMDW 1.1 permite uso comercial según la model card, pero conviene revisar los términos exactos en el enlace oficial antes de desplegar.
- El soporte de tool calling y de frameworks como vLLM o TGI no está confirmado; la arquitectura looped puede no estar soportada por todos los runtimes.
- El contexto de 256K en un modelo de 4B puede degradar la calidad en el extremo superior de la ventana; no hay datos publicados sobre rendimiento en contexto largo.
- La fecha de creación del repo (23 de noviembre de 2026) y la fecha de publicación declarada (16 de octubre de 2026) son posteriores a la fecha actual de referencia; verificar la autenticidad y procedencia antes de usar en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MC7ever/dory-turbo-brilliance-agi-v2
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Texto de la licencia OpenMDW 1.1: https://raw.githubusercontent.com/OpenMDW/OpenMDW/refs/heads/main/1.1/LICENSE.OpenMDW-1.1
- Página de desarrolladores de NVIDIA Nemotron: https://developer.nvidia.com/nemotron
- Discord de NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
- Plantilla de chat de referencia (DavidAU): https://huggingface.co/DavidAU/Inkling-2-Mini-26B-Heretic-Uncensored-Turbo-Brilliance-50X-V2-AGI/blob/main/README.md?code=true
- Dataset de postentrenamiento: https://huggingface.co/datasets/nvidia/nemotron-post-training-v3
- Datasets de preentrenamiento: https://huggingface.co/datasets/nvidia/nemotron-pre-training-datasets
