# litert-community/Ornith-1.5-9B

## Resumen

Ornith-1.5-9B es un modelo de lenguaje denso de 9B parámetros desarrollado por Ornith AI, derivado de Qwen/Qwen3.5-9B mediante post-entrenamiento. La versión aquí descrita es la conversión al formato LiteRT-LM (`.litertlm`) realizada por la comunidad `litert-community`, pensada para ejecución on-device y en el edge con el runtime LiteRT-LM de Google AI Edge. El modelo base se presenta como un paso hacia la construcción de modelos fundacionales mediante auto-mejora de extremo a extremo, donde el propio modelo genera tareas de entrenamiento, descubre estrategias y mejora su política mediante aprendizaje por refuerzo.

La arquitectura es la híbrida de Qwen3.5: 32 capas, de las cuales 24 son GatedDeltaNet (atención lineal) y 8 son atención completa (una de cada cuatro), con tamaño oculto 4096, 16 cabezas de atención con 4 KV heads de 256 dimensiones y vocabulario de 248.320 tokens con embeddings no atados. El checkpoint upstream es multimodal e incluye una cabeza de predicción multi-token (MTP), pero estos ficheros contienen únicamente el decodificador de texto (8.953.803.264 de los 9.653.104.368 parámetros totales).

La conversión es relevante porque permite desplegar un modelo de razonamiento y coding agéntico de 9B en hardware de consumo y móvil, con ficheros de 6,02 GB (INT4 mixto) y 9,17 GB (INT8). El contexto nativo del modelo es de 262.144 tokens, aunque estos ficheros LiteRT-LM están limitados a 4.096 tokens.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5: 32 capas (24 GatedDeltaNet de atención lineal + 8 de atención completa) |
| Parámetros totales | 9.653.104.368 (release upstream); 8.953.803.264 en estos ficheros (solo decodificador de texto) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens en el modelo base; 4.096 tokens en estos ficheros LiteRT-LM |
| Tipos de cuantización | INT8 dinámico; INT4 mixto (blockwise-32 en pesos fully connected, INT8 en embedding y lm_head, proyecciones GatedDeltaNet en float) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | `.litertlm` (LiteRT-LM); pesos cuantizados en sección TFLiteWeights desde 2026-11-09 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura híbrida de Qwen3.5: 32 capas con tamaño oculto 4096, 16 cabezas de atención con 4 KV heads de 256 dimensiones, y atención lineal con 16 cabezas de clave y 32 de valor de 128 dimensiones. Las 24 capas de GatedDeltaNet mantienen un estado convolucional y recurrente de tamaño constante, mientras que solo las 8 capas de atención completa conservan una caché KV creciente (presupuesto de 4096 tokens en estos ficheros). El vocabulario es de 248.320 tokens con embeddings no atados. El checkpoint upstream incluye torre de visión y cabeza MTP, ausentes en esta conversión, que carga solo el decodificador de texto equivalente a `Qwen3_5ForCausalLM`.

El entrenamiento de Ornith-1.5 extiende Ornith-1.0 (post-entrenado sobre Qwen3.5 y Gemma4) mediante auto-mejora: el modelo genera sus propias tareas de entrenamiento, descubre estrategias de resolución y mejora la política con aprendizaje por refuerzo. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición del dataset. La conversión se realizó con litert-torch (commit 115a1360 con el parche híbrido de Qwen3.5) y se probó con litert-lm 0.18.0 y 0.19.x. Los ficheros se ejecutan con el modo de razonamiento desactivado: la plantilla de chat escribe el bloque `<think>\n\n</think>` vacío, equivalente byte a byte a la plantilla de Ornith con `enable_thinking=False`.

## Capacidades

- Generación de texto y razonamiento: modelo de razonamiento con bloque `<think>` en el turno del asistente por defecto (desactivado en estos ficheros).
- Codificación agéntica: etiquetado explícito como `agentic-coding`, orientado a tareas de ingeniería de software.
- Razonamiento multi-paso y agentes: diseñado para resolución de tareas complejas con múltiples pasos.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no confirmado explícitamente en la información disponible.
- Modo thinking: soportado en el modelo base; desactivado en esta conversión LiteRT-LM.
- Visión: el checkpoint upstream es multimodal, pero la torre de visión no está incluida en estos ficheros.
- Predicción multi-token (MTP): presente en el release upstream, ausente en esta conversión.

## Casos de uso

- Asistente de código en el IDE: el modelo puede integrarse en editores y entornos de desarrollo para autocompletado y generación de funciones, con temperatura recomendada de 0.6 y sin penalización de presencia para código preciso.
- Agente de resolución de incidencias en repositorios: con SWE-bench Verified reportado en 70,6, es adecuado para pipelines que reciben un issue y generan un parche, ejecutándose localmente en una estación de trabajo con GPU.
- Automatización de tareas de terminal: con Terminal-Bench 2.1 reportado en 46,2, puede emplearse en agentes que operan sobre shell y herramientas CLI en entornos controlados.
- Inferencia on-device en portátiles: el fichero INT4 mixto de 6,02 GB cabe en GPUs de consumo y decodifica a 45,6 tok/s en la GPU de un Mac Studio M4 Max, lo que permite asistentes locales sin conexión.
- Despliegue en dispositivos móviles y edge: el formato LiteRT-LM y las variantes INT8/INT4 están pensados para el runtime de Google AI Edge en teléfonos y hardware embebido.
- Procesamiento por lotes en CPU: el fichero `Ornith-1.5-9B_int8.litertlm` de 9,17 GB es la opción recomendada para CPU en LiteRT-LM 0.19.x, útil para tareas de generación offline en servidores sin GPU.
- Prototipado de agentes de razonamiento con contexto moderado: los 4.096 tokens de contexto de estos ficheros limitan su uso a conversaciones y tareas acotadas, adecuadas para asistentes de consulta técnica.

## Benchmarks y rendimiento

Resultados reportados por el proveedor (Ornith), promediados sobre cinco ejecuciones; no ejecutados en esta conversión:

| Benchmark | Ornith-1.5-9B | Ornith-1.0-9B | Qwen3.5-9B |
|---|---|---|---|
| Terminal-Bench 2.1 (Terminus-2) | 46,2 | 43,1 | 21,3 |
| SWE-bench Verified | 70,6 | 69,4 | 53,2 |

Rendimiento de la conversión LiteRT-LM:

| Métrica | Valor |
|---|---|
| Decodificación (Mixed INT4, GPU Mac Studio M4 Max, litert-lm 0.18.0) | 45,6 tok/s |
| Prefill (Mixed INT4 GPU composite v0190 vs. mixed_int4, litert-lm 0.19.2) | +27,6 % |
| Decodificación (Mixed INT4 GPU composite v0190 vs. mixed_int4, litert-lm 0.19.2) | +24,5 % |

## Requisitos de hardware

- VRAM estimada: aproximadamente 6,02 GB para el fichero INT4 mixto y 9,17 GB para el INT8, más overhead de activaciones y estado recurrente.
- GPU recomendadas: Mac Studio M4 Max (probado, 45,6 tok/s en decodificación); GPUs de consumo con al menos 8 GB de VRAM para el fichero INT4.
- Cabe en GPU de consumo: sí, el fichero INT4 mixto de 6,02 GB es apto para GPUs consumer de gama media-alta.
- Opciones de despliegue: LiteRT-LM 0.18.0 y 0.19.x; los ficheros `gpu_composite_v0190` requieren `min_runtime_version` 0.19.0.
- Latencia y throughput: 45,6 tok/s en decodificación GPU sobre Mac Studio M4 Max con litert-lm 0.18.0; el estado en teléfono se remite a la sección Performance de la model card, no detallada aquí.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| Ornith-1.5-9B (esta conversión) | 8,95B (texto) | 4.096 (ficheros LiteRT-LM) | MIT | `.litertlm` |
| Ornith-1.0-9B | No disponible | No disponible | No disponible | Conversión LiteRT-LM disponible |
| Qwen3.5-9B | 9B (aproximado) | No disponible | No disponible | Checkpoint upstream en Hugging Face |
| Qwen3.5-4B / 2B / 0.8B | 4B / 2B / 0.8B | No disponible | No disponible | Conversiones LiteRT-LM disponibles |

En benchmarks de coding agéntico, Ornith-1.5-9B supera a Ornith-1.0-9B en Terminal-Bench 2.1 (46,2 frente a 43,1) y SWE-bench Verified (70,6 frente a 69,4), y a Qwen3.5-9B de forma notable (21,3 y 53,2 respectivamente), según datos del proveedor.

## Limitaciones y advertencias

- Contexto reducido: estos ficheros limitan la ventana a 4.096 tokens frente a los 262.144 del modelo base, lo que restringe tareas de contexto largo.
- Sin capacidades multimodales: la torre de visión y la cabeza MTP del release upstream no están incluidas.
- Razonamiento desactivado: la plantilla de chat fuerza `enable_thinking=False`, por lo que no se obtiene el bloque de razonamiento completo del modelo base.
- Benchmarks no verificados: los resultados de Terminal-Bench 2.1 y SWE-bench Verified son reportados por el proveedor y no se ejecutaron en esta conversión.
- Idiomas no documentados: no se especifican los idiomas soportados, lo que dificulta evaluar su cobertura multilingüe.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos generativos.
- Sesgos: no documentados en la información proporcionada.
- Compatibilidad de runtime: los ficheros `gpu_composite_v0190` requieren LiteRT-LM 0.19.0 o superior; en la GPU de 0.18.1 devuelven `!!!…`.
- Variante Mobile: el README menciona un "Ornith-1.5-9B-Mobile" cuantizado sin repositorio público en el momento de la redacción; estos ficheros no son esa variante.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base upstream.

## Enlaces

- Hugging Face (esta conversión): https://huggingface.co/litert-community/Ornith-1.5-9B
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- LiteRT-LM (runtime): https://github.com/google-ai-edge/LiteRT-LM
- Conversión Ornith-1.0-9B: https://huggingface.co/litert-community/Ornith-1.0-9B
- Conversión Qwen3.5-4B: https://huggingface.co/litert-community/Qwen3.5-4B
- Conversión Qwen3.5-2B: https://huggingface.co/litert-community/Qwen3.5-2B
- Conversión Qwen3.5-0.8B: https://huggingface.co/litert-community/Qwen3.5-0.8B
