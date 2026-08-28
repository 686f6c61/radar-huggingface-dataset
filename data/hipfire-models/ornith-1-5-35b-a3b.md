# hipfire-models/ornith-1.5-35b-a3b

## Resumen

Ornith-1.5-35B-A3B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) híbrido, desarrollado por DeepReinforce y publicado originalmente como `ornith-ai/Ornith-1.5-35B-A3B`. Con 35 mil millones de parámetros totales y aproximadamente 3 mil millones activos por token, combina 30 capas de atención lineal con 10 de atención completa, 256 expertos y selección top-8, e incorpora una torre de visión y una cabeza de predicción multi-token (MTP) para decodificación especulativa. El modelo se entrenó mediante un bucle de auto-mejora que genera nuevas tareas, scaffolds y rollouts para aprendizaje por refuerzo, extendiendo el marco de auto-scaffolding de la versión anterior.

Este repositorio concreto, `hipfire-models/ornith-1.5-35b-a3b`, es una cuantización realizada por hipfire del modelo base, con una modificación importante: la cabeza MTP original, que demostró un rendimiento pobre en decodificación especulativa (tasa de aceptación de solo ~13% en profundidad 1), ha sido sustituida por una cabeza entrenada por terceros (derivada de `shisa-ai/Ornith-1.5-35B-A3B-MTP-ONLY`, a su vez basada en la cabeza MTP de Qwen3.6-35B-A3B). Esta sustitución mejora notablemente la tasa de aceptación (0.877 en profundidad 1, 0.620 en profundidad 2, 0.528 en profundidad 3) y permite alcanzar un throughput de hasta ~150 tok/s en hardware AMD Strix Halo, aproximadamente 2.1 veces más rápido que la decodificación autoregresiva. El modelo está pensado para despliegue eficiente en GPUs de consumo y estaciones de trabajo, con un requisito de VRAM de unos 22 GB con caché KV en Q8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido: 30 capas de atención lineal + 10 de atención completa, 256 expertos, top-8 |
| Parametros totales | 35 mil millones |
| Parametros activos | ~3 mil millones |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MQ4G256V2 (qt44) para el tronco, MQ6G256 para atención de capas extremas, Q8 para lm_head, embeddings, routers y gates, F16 para torre de visión, qt44 para cabeza MTP |
| Idiomas soportados | no disponible |
| Licencia | Mixta: MIT (tronco y torre de visión) + Apache-2.0 (cabeza MTP) |
| Formato de pesos | safetensors (ficheros `.mq4`, `.mtp`, `.vl`) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B es un MoE híbrido que combina atención lineal (30 capas) con atención completa (10 capas), con 256 expertos y selección top-8. Incluye una torre de visión para procesamiento multimodal y una cabeza de predicción multi-token (MTP) para decodificación especulativa. El entrenamiento siguió un enfoque de auto-mejora: el modelo propone nuevas tareas, genera scaffolds específicos para cada tarea y produce rollouts de soluciones que se utilizan para aprendizaje por refuerzo, en un bucle continuo que extiende el marco de auto-scaffolding de Ornith-1.0. No se han publicado detalles sobre el número exacto de tokens de entrenamiento ni la composición del dataset.

La cuantización hipfire aplica el esquema MQ4G256V2 (qt44): pesos de 4 bits en grupos de 256 elementos con rotación FWHT y dos pares de escala/zero fp16 por grupo. Las capas de atención de los extremos (primera y última dos) se promueven a MQ6G256, mientras que `lm_head`, embeddings, routers MoE y gates de experto compartido se mantienen en Q8. La torre de visión se conserva en F16. La cabeza MTP reemplazada usa qt44 con un `lm_head_draft` comprimido a un vocabulario de 16,384 tokens (el `lm_head` del tronco verifica contra el vocabulario completo de 248,320 tokens, por lo que la compresión no afecta a la corrección). La decodificación especulativa es lossless respecto al tronco: la verificación de cada token redactado garantiza que una cabeza débil solo afecta al rendimiento, nunca a la calidad de salida.

## Capacidades

- Generación de texto autoregresiva con soporte de razonamiento (parámetro `max_think_tokens` para activar/desactivar modo de pensamiento).
- Procesamiento multimodal con entrada de imágenes gracias a la torre de visión.
- Decodificación especulativa mediante cabeza MTP, con tasas de aceptación de tokens redactados de 0.877 (profundidad 1), 0.620 (profundidad 2) y 0.528 (profundidad 3) con la cabeza sustituida.
- Modo de redacción modulado por n-gramas que duplica el throughput cuando el razonamiento está desactivado.
- Soporte de cuantización de baja precisión (4 bits) para despliegue eficiente en hardware con VRAM limitada.
- No se ha confirmado soporte explícito de tool calling o function calling en la información disponible.

## Casos de uso

- Despliegue en estaciones de trabajo con GPUs AMD (Strix Halo, Radeon 8060S): el modelo está optimizado para hardware AMD y alcanza ~150 tok/s con decodificación especulativa, adecuado para entornos de desarrollo locales.
- Generación de código asistida: la alta tasa de aceptación de tokens redactados en prompts de código (0.937 con modulación n-gram) lo hace eficiente para autocompletado y edición de código en editores.
- Análisis de documentos con imágenes: la torre de visión permite procesar capturas, diagramas y gráficos, integrándose en pipelines de extracción de información.
- Prototipado de agentes conversacionales: con 22 GB de VRAM puede ejecutarse en GPUs de consumo como RTX 4090, permitiendo experimentación local con diálogos multi-turno.
- Inferencia en entornos con restricciones de memoria: la cuantización MQ4 reduce el tamaño del tronco a 17.7 GiB, posibilitando su uso en hardware con menos de 24 GB de VRAM.
- Investigación en decodificación especulativa: la comparación entre la cabeza MTP original y la sustituida proporciona un caso práctico de cómo la calidad de la cabeza afecta al rendimiento, útil para estudios sobre técnicas de verificación y aceptación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sin embargo, la model card reporta métricas de rendimiento de inferencia y de aceptación de tokens redactados, medidas en una Strix Halo (gfx1151, Radeon 8060S) con 256 tokens generados, greedy, razonamiento desactivado, caché KV Q8 y prompt de edición de código:

| Configuracion | tok/s | τ | Aceptacion |
| --- | ---: | ---: | ---: |
| Autoregresivo (sin especulacion) | ~70 | — | — |
| MTP, K=3 | 77.4 | 2.5 | 0.61 |
| MTP + modulacion n-gram | ~150 | 5.43 | 0.937 |

| Cabeza MTP | Profundidad 1 | Profundidad 2 | Profundidad 3 |
| --- | ---: | ---: | ---: |
| Cabeza nativa de Ornith 1.5 | 0.823 | 0.292 | 0.179 |
| Cabeza sustituida (shisa-ai) | 0.877 | 0.620 | 0.528 |

Estas cifras son específicas del hardware y del prompt; los prompts de prosa aceptan menos tokens redactados que los de código, por lo que deben considerarse como un límite superior, no una garantía.

## Requisitos de hardware

- VRAM estimada: ~22 GB con caché KV en Q8 por defecto (según la model card).
- GPU recomendada: AMD Strix Halo (gfx1151, Radeon 8060S) para el rendimiento máximo medido; también compatible con GPUs NVIDIA de consumo como RTX 4090 (24 GB) y RTX 3090 (24 GB), aunque sin datos de rendimiento publicados.
- El tamaño del tronco cuantizado es de 17.7 GiB, lo que permite ejecución en GPUs con 20-24 GB de VRAM.
- Opciones de despliegue: motor `hipfire` (comando `hipfire run ornith-1.5:35b-a3b`), y se ha probado también con llama.cpp (mencionado en la discusión sobre la cabeza MTP). No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: ~70 tok/s autoregresivo, ~77 tok/s con MTP K=3, ~150 tok/s con modulación n-gram (en Strix Halo, prompt de código, 256 tokens).

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos con otros modelos de la misma categoría (tamaño similar, MoE híbrido). El modelo base Ornith-1.5-35B-A3B es la referencia directa, pero no se han publicado benchmarks estándar. La cabeza MTP sustituida proviene de Qwen3.6-35B-A3B (Apache-2.0), pero no se dispone de especificaciones ni métricas de ese modelo en la información proporcionada. Por tanto, la comparativa se limita a la relación entre este repositorio cuantizado y su modelo base:

| Modelo | Parametros | Contexto | Licencia | Notas |
| --- | --- | --- | --- | --- |
| ornith-ai/Ornith-1.5-35B-A3B | 35B (3B activos) | no disponible | MIT (declarada en metadatos) | Modelo base original, sin cuantizar, con cabeza MTP nativa de bajo rendimiento |
| hipfire-models/ornith-1.5-35b-a3b | 35B (3B activos) | no disponible | Mixta (MIT + Apache-2.0) | Cuantización hipfire, cabeza MTP sustituida, optimizado para AMD |
| Qwen/Qwen3.6-35B-A3B | no disponible | no disponible | Apache-2.0 | Fuente de la cabeza MTP sustituida; sin más datos |

## Limitaciones y advertencias

- La cuantización es lossy: puede degradar ligeramente la calidad de salida respecto al modelo original en precisión completa.
- La cabeza MTP incluida no es la original del modelo base; es una sustitución entrenada por terceros. Aunque mejora el rendimiento de decodificación especulativa, no ha sido validada por el equipo original de Ornith.
- La licencia es mixta: el tronco y la torre de visión están bajo MIT, pero la cabeza MTP deriva de un trabajo bajo Apache-2.0. Es necesario revisar el fichero `NOTICE` del repositorio para entender las obligaciones completas.
- El modelo base no incluye un fichero LICENSE y su `license_link` devuelve 404; los términos MIT se reproducen en `LICENSE-MIT` para referencia, pero la cadena de atribución debe verificarse.
- No se han publicado datos sobre sesgos, alucinaciones o limitaciones idiomáticas específicas.
- El rendimiento de decodificación especulativa depende fuertemente del tipo de prompt: los prompts de prosa aceptan muchos menos tokens redactados que los de código, reduciendo la ganancia de throughput.
- El modo de modulación n-gram solo se activa cuando el razonamiento está desactivado (`max_think_tokens = 1`); con razonamiento activado, la ganancia es menor.
- No se proporcionan garantías de soporte para producción; el autor indica explícitamente "No warranty".

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/hipfire-models/ornith-1.5-35b-a3b
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Discusión sobre la cabeza MTP original: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B/discussions/10
- Cabeza MTP sustituida (shisa-ai): https://huggingface.co/shisa-ai/Ornith-1.5-35B-A3B-MTP-ONLY
- Modelo Qwen3.6-35B-A3B (fuente de la cabeza MTP): https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Página del proyecto Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Ficha en LLM Releases: https://www.llm-releases.com/models/ornith-1-5-35b-a3b
- Ficha en ModelScope: https://www.modelscope.cn/models/ornith-ai/Ornith-1.5-35B-A3B
