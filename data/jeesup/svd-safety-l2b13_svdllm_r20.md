# Jeesup/svd-safety-l2b13_svdllm_r20

## Resumen

`svd-safety-l2b13_svdllm_r20` es un checkpoint de investigación derivado de `meta-llama/Llama-2-13b-chat-hf` al que se le ha aplicado una compresión SVD-LLM del 20 % de los parámetros, seguida de una recuperación mediante LoRA en dos etapas (U y V secuenciales) sobre el dataset alpaca-cleaned. El resultado conserva aproximadamente el 79,98 % de los parámetros densos del modelo original, es decir, unos 13.015 millones de parámetros efectivos. Lo publica el usuario Jeesup como parte de un estudio sobre cómo la compresión SVD degrada el comportamiento de seguridad y qué regla de selección de componentes lo repara mejor.

El modelo no es un asistente conversacional de propósito general: es una celda concreta dentro de una malla experimental sobre reglas de selección y presupuestos de compresión. Su interés radica en que cuantifica el compromiso entre utilidad y seguridad bajo compresión, un aspecto poco documentado en la literatura de compresión de LLM. Emplea la arquitectura transformer decoder-only de Llama 2, con 13 000 millones de parámetros y una ventana de contexto de 4096 tokens heredada del modelo base.

La relevancia actual es metodológica: sirve como referencia para investigadores que estudian interpretabilidad y seguridad en modelos comprimidos, y advierte de que la compresión por sí sola eleva la tasa de éxito de ataques adversariales respecto al modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parámetros totales | 13 015 864 320 (≈ 79,98 % del denso original) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (heredada de Llama-2-13b-chat) |
| Tipos de cuantización | no disponible en la información proporcionada |
| Idiomas soportados | no disponible en la información proporcionada |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 13B chat: transformer decoder-only con atención multi-cabeza, normalización RMSNorm y activación SwiGLU. Sobre esa base se aplica una compresión SVD-LLM que elimina el 20,00 % de los parámetros mediante descomposición en valores singulares con una regla de selección de componentes concreta (una celda de la malla del estudio). Posteriormente se recupera capacidad con LoRA en dos etapas secuenciales, primero sobre la matriz U y luego sobre la V, con rango r=8, alpha=16, 2 épocas, learning rate 1e-4, batch 64, cutoff 256 y precisión bf16, usando el dataset alpaca-cleaned. La semilla es 42.

No se aplica ninguna selección ni reparación específica de seguridad: es la línea base SVD-LLM sin modificaciones orientadas a seguridad. El entrenamiento no incluye RLHF ni DPO adicionales más allá de los ya presentes en el checkpoint chat original. La innovación técnica destacable es la propia metodología de compresión SVD con recuperación LoRA en dos etapas, que permite reducir parámetros manteniendo perplejidad razonable (7,3082 en WikiText-2).

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Llama-2-13b-chat.
- Razonamiento y respuesta a instrucciones en formato chat.
- Capacidad de código y matemáticas básicas, limitada por la compresión y por el modelo base.
- Soporte de tool calling y function calling: no documentado en la información proporcionada; debe asumirse el del modelo base sin garantías tras la compresión.
- Soporte de agentes y razonamiento multi-paso: no documentado; el checkpoint no está pensado para despliegue agéntico.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No dispone de modo thinking, visión ni audio.
- Capacidad especial: ninguna más allá de su uso como artefacto de investigación en seguridad bajo compresión.

## Casos de uso

- Estudio de degradación de seguridad bajo compresión: sirve como celda de control para medir cómo varía la tasa de éxito adversarial (ASR) al eliminar parámetros, comparando con el modelo denso y con otras celdas de la malla.
- Evaluación de reglas de selección de componentes SVD: permite contrastar empíricamente qué criterio de selección preserva mejor la seguridad y la utilidad frente a alternativas.
- Investigación en interpretabilidad de modelos comprimidos: facilita analizar qué componentes (U o V) concentran el comportamiento de rechazo y cómo se redistribuye tras la recuperación LoRA.
- Benchmarking de pipelines de compresión: se puede usar como entrada para medir perplejidad en WikiText-2 (7,3082 de referencia) y comparar con otras técnicas de poda o cuantización.
- Reproducibilidad de estudios: con semilla 42 y receta documentada, permite replicar exactamente la celda y validar resultados de terceros.
- Análisis de sobre-rechazo: con una tasa macro de sobre-rechazo de 0,4312 medida con WildGuard, es útil para estudiar el equilibrio entre seguridad y utilidad conversacional en asistentes comprimidos.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0019 |
| StrongREJECT ASR (juez HarmBench) | 0,0064 |
| Macro over-refusal (WildGuard) | 0,4312 |
| Perplejidad WikiText-2 | 7,3082 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de capacidad en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 26 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 32 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 13-14 GB; en 4 bits: aproximadamente 7-8 GB (estimaciones según el tamaño de parámetros, no confirmadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100 80 GB para bf16 sin cuantizar; RTX 4090 (24 GB) requiere cuantización de 8 bits o inferior.
- Cabe en GPU de consumo: sí, con cuantización de 8 o 4 bits en RTX 3090/4090 (24 GB) o superiores.
- Opciones de despliegue: transformers, text-generation-inference (etiqueta endpoints_compatible), vLLM y llama.cpp/Ollama previa conversión a GGUF (no se distribuye GGUF en el repo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l2b13_svdllm_r20 | 13,0 B (79,98 % denso) | 4096 | Llama 2 | Checkpoint de investigación, ASR bajo, sobre-rechazo 0,4312 |
| meta-llama/Llama-2-13b-chat-hf | 13,0 B | 4096 | Llama 2 | Modelo base sin comprimir; referencia de seguridad y utilidad |
| Otras celdas SVD-LLM del mismo estudio | ≈13 B | 4096 | Llama 2 | Distintas reglas de selección y presupuestos; no disponibles individualmente en la información proporcionada |
| Modelos comprimidos por poda/cuantización comparables | no disponible | no disponible | no disponible | No se dispone de datos de terceros en la información proporcionada |

## Limitaciones y advertencias

- No es un modelo de propósito general: es un artefacto experimental y no debe desplegarse como asistente.
- La compresión por sí sola eleva la tasa de éxito de ataques adversariales respecto a Llama-2-13b-chat; varias celdas del estudio están deliberadamente degradadas en seguridad.
- Riesgo de alucinación no cuantificado en la información disponible; la compresión puede agravarlo.
- Sobre-rechazo macro elevado (0,4312 con WildGuard), lo que indica que rechaza peticiones benignas con frecuencia.
- Idiomas soportados no documentados; el comportamiento multilingüe puede diferir del modelo base.
- Restricciones de licencia: Llama 2 Community License, con `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio; el uso comercial está sujeto a los términos de dicha licencia y a las restricciones de la política de uso de Meta.
- Cualquier conclusión sobre seguridad debe validarse con evaluaciones propias antes de extrapolar resultados.
- El repositorio no incluye datos de benchmarks de capacidad general, por lo que la utilidad práctica más allá de la conversación básica es incierta.

## Enlaces

- HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2b13_svdllm_r20
- Modelo base: https://huggingface.co/meta-llama/Llama-2-13b-chat-hf
- Licencia Llama 2: https://ai.meta.com/llama/license/
- Paper SVD-LLM: no disponible en la información proporcionada
- Repositorio del estudio: no disponible en la información proporcionada
- Demos: no disponible en la información proporcionada
