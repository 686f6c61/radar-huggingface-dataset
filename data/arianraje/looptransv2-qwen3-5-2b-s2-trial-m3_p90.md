# arianraje/looptransv2-qwen3.5-2b-s2-trial-m3_p90

## Resumen

looptransv2-qwen3.5-2b-s2-trial-m3_p90 es un modelo experimental de generación de texto derivado de Qwen/Qwen3.5-2B, publicado por el usuario arianraje en Hugging Face. Se trata de un *looped transformer*: en lugar de ejecutar cada capa una sola vez, ciertos bloques de capas del modelo base se reejecutan compartiendo pesos, elevando la profundidad efectiva de 24 a 36 capas sin incrementar el número de parámetros. El modelo forma parte del proyecto LoopTrans (rama `v2`) y corresponde a la etapa 2 de entrenamiento (`s2-trial-m3_p90`), una ejecución de control con schedule no seleccionado.

La relevancia de este modelo es fundamentalmente investigadora: explora si la profundidad recurrente con pesos compartidos puede mejorar la relación capacidad/coste en modelos pequeños mediante destilación desde el modelo base congelado. El schedule concreto aplicado es `[2]×3 [3]×2 [4]×3 [8]×3 [14]×2 [15]×3 [18]×3` (capas indexadas desde 0, con formato [primera..última]×repeticiones) y m = 3 pasadas adicionales de atención con cachés KV extra.

El repositorio incluye dos exportaciones de puntos de entrenamiento (`t0050M` y `t0100M`), con pesos en safetensors, config, tokenizador y manifiesto de bucle. No se han publicado resultados de benchmarks en la información disponible, y el modelo cuenta con 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Looped transformer (recurrent-depth) sobre Qwen3.5; clase `LoopedQwen3_5ForCausalLM` |
| Parámetros totales | No disponible (deriva de Qwen3.5-2B; ~2B por el nombre del modelo base) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el entrenamiento usa filas empaquetadas de 4.096 tokens) |
| Tipos de cuantización | No disponible (pesos publicados en bfloat16) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Profundidad efectiva | 36 capas (24 originales + repeticiones del schedule) |
| Pasadas extra de atención (KV caches) | m = 3 |
| Tamaño del repo | 7,5 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B y aplica un esquema de profundidad recurrente: determinados bloques de capas se ejecutan varias veces compartiendo los mismos pesos. El schedule concreto repite las capas 2, 3 y 4 tres veces; la 8 tres veces; la 14 dos veces; la 15 tres veces; y la 18 tres veces. Esto eleva la profundidad ejecutada de 24 a 36 capas. Además, se realizan m = 3 pasadas adicionales de atención con cachés KV separadas, lo que aumenta la capacidad de cómputo sin añadir parámetros nuevos.

El entrenamiento de etapa 2 (recuperación) se basa en destilación por divergencia KL directa (*forward KL*) hacia el Qwen3.5-2B congelado como profesor, combinada con una pérdida de interfaz de bucle, con pesos 1/1. Se usa AdamW con LR 1e-5, 5M pasos de warmup y decaimiento coseno sobre 600M tokens hasta 0,1×. Cada paso procesa 64 filas empaquetadas de 4.096 tokens. El schedule elegido es una ejecución de control: el percentil 90 por coste predicho de etapa 1 entre 200.000 schedules válidos muestreados uniformemente con m = 3. Las dependencias fijadas son transformers 5.17.0, vLLM 0.31.0 y flash-linear-attention 0.5.2.

## Capacidades

- Generación de texto autoregresiva, heredada de Qwen3.5-2B.
- Razonamiento y conocimiento general en la medida en que lo conserve el modelo base tras la destilación.
- No hay evidencia publicada de soporte de tool calling o function calling en esta variante.
- No hay evidencia publicada de capacidades de agente o razonamiento multi-paso específicas.
- Capacidades multilingües no documentadas; dependen del modelo base y de la destilación.
- No se documentan modos especiales (thinking mode, visión, audio) en la información disponible.
- Integración con vLLM mediante el *entry point* `vllm.general_plugins` que registra el paquete `looptransv2`.

## Casos de uso

- Investigación sobre profundidad recurrente: permite reproducir y analizar el efecto de reejecutar bloques de capas con pesos compartidos frente al modelo base no bucleado, usando los puntos `t0050M` y `t0100M` para estudiar la evolución durante el entrenamiento.
- Estudio de destilación con KL forward: sirve como caso práctico de destilación desde un profesor congelado hacia una arquitectura modificada, útil para quienes investigan técnicas de compresión o reestructuración de transformers.
- Experimentos de ablación de schedules: al ser una ejecución de control (percentil 90 de coste predicho), permite comparar contra otras ejecuciones del proyecto LoopTrans con schedules seleccionados.
- Benchmarking de inferencia con vLLM: el paquete `looptransv2` registra un plugin de vLLM, lo que facilita medir latencia y throughput de arquitecturas con profundidad recurrente en un servidor de inferencia estándar.
- Docencia y divulgación: ejemplo didáctico de cómo modificar un modelo open source existente manteniendo la licencia Apache 2.0 y publicando pesos en safetensors.
- Prototipado de bajo coste: al derivar de un modelo de ~2B, puede ejecutarse en hardware modesto para pruebas de concepto, siempre que se instalen las versiones fijadas de transformers y vLLM.
- No se recomienda para producción sin una evaluación previa: no hay benchmarks publicados ni métricas de calidad que respalden su uso en tareas reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que existen informes de benchmark bajo `bench/` en las carpetas de exportación, pero no se incluyen cifras en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de ~2B parámetros en bfloat16 requiere del orden de 4-5 GB solo para pesos; el repo completo ocupa 7,5 GB porque incluye dos exportaciones.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría en GPUs consumer con al menos 8 GB de VRAM en bfloat16, aunque la profundidad efectiva de 36 capas y las m = 3 pasadas extra de atención incrementan el coste de cómputo respecto al modelo base.
- Compatibilidad con GPU consumer: probable en RTX 3060/4060 con 8-12 GB o superiores, sujeto a verificación empírica.
- Opciones de despliegue: vLLM 0.31.0 con el plugin de `looptransv2`; carga directa mediante `looptransv2.models.io.load_looped` con transformers 5.17.0. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Profundidad efectiva | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| looptransv2-qwen3.5-2b-s2-trial-m3_p90 | ~2B (derivado de Qwen3.5-2B) | No disponible | 36 capas | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-2B (modelo base) | ~2B | No disponible en la información | 24 capas | No disponible en la información | Hugging Face |
| Otras ejecuciones de LoopTrans v2 | ~2B | No disponible | Variable según schedule | Apache 2.0 (presumible) | Repositorio GitHub del proyecto |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental de investigación: no hay benchmarks publicados que validen su calidad frente al modelo base.
- Ejecución de control: el schedule se eligió por coste predicho (percentil 90), no por calidad, por lo que no representa necesariamente la mejor configuración del proyecto.
- Riesgo de degradación por destilación: al entrenarse con KL forward hacia el profesor congelado sobre solo 600M tokens, puede no recuperar completamente las capacidades del Qwen3.5-2B original.
- Idiomas soportados no documentados; el comportamiento multilingüe es incierto.
- Riesgo de alucinación inherente a los modelos generativos de ~2B, no cuantificado en esta variante.
- Sesgos: no documentados; heredables del corpus de entrenamiento del modelo base.
- Dependencias frágiles: requiere versiones muy concretas (transformers 5.17.0, vLLM 0.31.0, flash-linear-attention 0.5.2) y código del repositorio GitHub en la rama `v2`, commit `1463f44`; no funciona con la API estándar de transformers sin el paquete `looptransv2`.
- No incluye checkpoints con estado del optimizador, solo pesos exportados.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluación de calidad desaconseja su uso en producción sin validación previa.
- Sin descargas ni likes: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arianraje/looptransv2-qwen3.5-2b-s2-trial-m3_p90
- Repositorio del proyecto LoopTrans (rama `v2`): https://github.com/arianraje/LoopTrans
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
