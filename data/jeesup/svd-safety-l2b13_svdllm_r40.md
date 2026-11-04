# Jeesup/svd-safety-l2b13_svdllm_r40

## Resumen

`Jeesup/svd-safety-l2b13_svdllm_r40` es un checkpoint de investigación derivado de `meta-llama/Llama-2-13b-chat-hf` al que se le ha aplicado una compresión SVD-LLM que elimina el 40 % de los parámetros densos, dejando un 59,99 % de la fracción original (13.015.864.320 parámetros efectivos sobre los ~13 000 millones del modelo base). Tras la compresión se aplica una recuperación de etapa 2 mediante LoRA secuencial sobre las matrices U y V, entrenada con el dataset alpaca-cleaned (r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256, bf16). No hay selección ni reparación específica orientada a seguridad: es la línea base "plana" de SVD-LLM.

El interés del modelo no es su calidad como asistente, sino su papel como artefacto experimental dentro de un estudio sobre cómo la compresión SVD degrada el comportamiento de seguridad de un LLM y qué regla de selección de componentes lo repara mejor. Este checkpoint es una celda concreta de una rejilla de presupuestos de compresión y reglas de selección, con semilla 42.

Por tanto, no debe tratarse como un modelo conversacional de propósito general. Su valor está en las métricas medidas (ASR en AdvBench y StrongREJECT, sobre-rechazo macro en WildGuard y perplejidad en WikiText-2) que permiten cuantificar el compromiso entre utilidad y seguridad bajo compresión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), comprimido con SVD-LLM y recuperado con LoRA de etapa 2 |
| Parametros totales | 13.015.864.320 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama-2-13b-chat: 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el repo no documenta variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-2-13b-chat: un transformer decoder-only con atención causal estándar, normalización RMSNorm y activación SwiGLU. Sobre ese modelo se aplica SVD-LLM, una técnica de compresión post-entrenamiento que descompone las matrices de pesos y trunca componentes según un presupuesto de parámetros; en este caso se elimina el 40 % de los parámetros densos. Posteriormente se ejecuta una recuperación de etapa 2 con LoRA secuencial sobre las matrices U y V resultantes de la SVD, usando alpaca-cleaned como corpus de ajuste (r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256, precisión bf16) y semilla 42.

No se documenta en la información disponible el número de tokens de entrenamiento original de Llama 2, la composición completa del dataset de recuperación más allá de alpaca-cleaned, ni si hubo RLHF o DPO adicionales sobre este checkpoint (el modelo base sí incorpora el pipeline de alineamiento de Llama 2 Chat, pero este derivado no añade etapas de alineamiento propias). La innovación técnica relevante es precisamente el uso de SVD-LLM con recuperación LoRA de bajo rango como método de compresión, y su evaluación sistemática del efecto sobre la seguridad.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Llama-2-13b-chat, aunque degradada por la compresión.
- Razonamiento y respuesta a instrucciones en inglés (el corpus de recuperación, alpaca-cleaned, es mayoritariamente en inglés).
- Generación de código y matemáticas a nivel básico-intermedio, sujeto a la degradación por compresión.
- No se documenta soporte de tool calling ni function calling nativo en la información disponible.
- No se documenta soporte de agentes ni multi-step reasoning estructurado.
- Capacidades multilingües no verificadas ni documentadas para este checkpoint.
- No dispone de modo "thinking", visión ni audio.
- Su capacidad diferencial es servir como sujeto de medición de seguridad bajo compresión (ASR, sobre-rechazo, perplejidad).

## Casos de uso

- Estudio de degradación de seguridad por compresión: usar este checkpoint como línea base para medir cómo varía el ASR en AdvBench y StrongREJECT respecto al modelo denso original y a otras celdas de la rejilla.
- Investigación en interpretabilidad de componentes: analizar qué componentes (matrices U/V truncadas) concentran la pérdida de comportamiento seguro y contrastarlo con reglas de selección alternativas.
- Evaluación de métodos de recuperación LoRA: comparar la recuperación secuencial U→V con r=8 frente a otras configuraciones de rango y orden para cuantificar la recuperación de utilidad (perplejidad en WikiText-2).
- Benchmarking de sobre-rechazo: emplear la métrica macro de WildGuard (0,1793) para estudiar el equilibrio entre rechazo de peticiones dañinas y rechazo excesivo de peticiones benignas en modelos comprimidos.
- Reproducibilidad de experimentos: al fijar semilla 42 y documentar hiperparámetros, sirve para replicar resultados de compresión SVD-LLM en entornos de investigación.
- Docencia y formación en compresión de LLM: ejemplo práctico de pipeline completo (SVD + LoRA de recuperación) con métricas de seguridad y utilidad publicadas.
- Análisis de robustez frente a jailbreaks: al ser un modelo deliberadamente degradado en seguridad, permite estudiar vectores de ataque en modelos comprimidos antes de desplegar variantes en producción.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (HarmBench judge) | 0,0385 |
| StrongREJECT ASR (HarmBench judge) | 0,0543 |
| Macro over-refusal (WildGuard) | 0,1793 |
| WikiText-2 perplexity | 9,0399 |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K) ni valores de referencia del modelo base sin comprimir para contextualizar estas métricas.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 26 GB solo para pesos, más overhead de activaciones y caché KV (el repo ocupa 26,0 GB).
- VRAM estimada en cuantización de 8 bits: en torno a 13-14 GB; en 4 bits: en torno a 7-8 GB (estimaciones por tamaño de parámetros, no verificadas para este checkpoint).
- GPU recomendadas: A100 40/80 GB, H100 80 GB para bf16 sin cuantizar; RTX 4090 (24 GB) requiere cuantización para caber con contexto completo.
- Cabe en GPU de consumo (RTX 3090/4090, 24 GB) solo con cuantización de 8 o 4 bits y contexto reducido.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp u Ollama no están documentados para este checkpoint y requerirían conversión de pesos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l2b13_svdllm_r40 | 13.015.864.320 (59,99 % del denso) | no disponible | Llama 2 Community | Checkpoint experimental de compresión SVD-LLM |
| meta-llama/Llama-2-13b-chat-hf | ~13 000 millones | 4096 | Llama 2 Community | Modelo base sin comprimir; referencia de utilidad y seguridad |
| Otras celdas de la rejilla del estudio | variable según presupuesto | no disponible | Llama 2 Community | Reglas de selección y presupuestos alternativos; no disponibles públicamente en la información proporcionada |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación, no un asistente desplegable: el propio autor advierte que varias celdas de la rejilla están deliberadamente degradadas en seguridad.
- La compresión por sí sola eleva la tasa de éxito de ataques (ASR); este checkpoint presenta un ASR de 0,0385 en AdvBench y 0,0543 en StrongREJECT, medidos con el juez HarmBench.
- Riesgo de alucinación incrementado por la compresión y por la recuperación LoRA limitada (2 épocas, r=8) sobre alpaca-cleaned.
- Sobre-rechazo macro de 0,1793 en WildGuard: rechaza peticiones benignas en una proporción no trivial.
- Perplejidad en WikiText-2 de 9,0399, superior a la del modelo denso original (valor no disponible en la información proporcionada), lo que indica pérdida de calidad lingüística.
- Idiomas soportados no documentados; el corpus de recuperación es mayoritariamente inglés.
- Licencia Llama 2 Community: restricciones de uso comercial y obligaciones de atribución; `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio.
- No apto para producción sin una evaluación de seguridad propia y, probablemente, sin una reparación específica de seguridad.
- Sesgos conocidos del modelo base Llama 2 no reevaluados para este derivado.

## Enlaces

- HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2b13_svdllm_r40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-13b-chat-hf
- Licencia Llama 2: incluida en el repositorio (`LICENSE.txt`, `USE_POLICY.md`)
- Paper de SVD-LLM, paper de HarmBench, paper de StrongREJECT, paper de WildGuard y repositorio del estudio: no disponibles en la información proporcionada.
