# Jeesup/svd-safety-l2_svdllmjbb48orc48_r50

## Resumen

`svd-safety-l2_svdllmjbb48orc48_r50` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf` al que se le ha aplicado una compresión SVD-LLM que elimina el 50,00 % de los parámetros densos (fracción resultante 0,4999), seguida de una recuperación con LoRA en dos etapas (U y luego V, sobre alpaca-cleaned, r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256, bf16). Lo publica el usuario Jeesup como artefacto de un estudio sobre cómo la compresión SVD degrada el comportamiento de seguridad y qué regla de selección de componentes lo repara mejor. No es un modelo de chat de propósito general.

El interés técnico está en la metodología: el conjunto de calibración combina utilidad (WikiText-2) y seguridad (48 objetivos de JailbreakBench con las negativas propias de Llama-2-7b-chat y 48 prompts de OR-Bench-hard-1k con respuestas complacientes del modelo base), con una cuota efectiva de seguridad del 6,85 % de las posiciones. El checkpoint es una celda de una rejilla sobre reglas de selección y presupuestos de compresión, por lo que su valor es comparativo y experimental, no de despliegue.

Los pesos reales en safetensors suman 6.738.415.616 parámetros, con un repositorio de 13,5 GB. La licencia es Llama 2 Community License y el modelo base impone las restricciones habituales de uso. La model card advierte explícitamente de que varias ramas de la rejilla están deliberadamente degradadas en seguridad y de que la compresión por sí sola eleva la tasa de éxito de ataques.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), comprimido con SVD-LLM y recuperado con LoRA en dos etapas |
| Parametros totales | 6.738.415.616 (fracción densa resultante 0,4999 respecto al base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Llama-2-7b-chat soporta 4096 tokens) |
| Tipos de cuantizacion | no disponible (el repositorio publica safetensors en bf16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Llama-2-7b-chat, un transformer decoder-only con atención causal estándar, y le aplica la compresión SVD-LLM del repositorio AIoT-MLSys-Lab/SVD-LLM mediante un SVD blanqueado sobre un único conjunto de calibración agrupado: S·Sᵀ = Σ_WikiText x·xᵀ + Σ_safety x·xᵀ. La parte de utilidad usa WikiText-2 train con 255 ventanas de 2048 tokens (muestreo de SVD-LLM, semilla 42) y todas las posiciones; la parte de seguridad usa los primeros 48 de 96 objetivos de JailbreakBench con las negativas propias de Llama-2-7b-chat y los primeros 48 de 157 prompts de OR-Bench-hard-1k con las respuestas complacientes del modelo base, en orden de semilla 42, una conversación por muestra (38.429 posiciones en total). La cuota efectiva de seguridad es 0,0685 de las posiciones.

Tras eliminar el 50,00 % de los parámetros, se aplica la recuperación de segunda etapa de SVD-LLM con LoRA secuencial (primero U, luego V) sobre alpaca-cleaned, con r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256 y precisión bf16. La semilla global es 42. No se documentan datos de RLHF o DPO adicionales más allá del ajuste del modelo base; la innovación técnica destacable es precisamente el uso de un conjunto de calibración mixto utilidad/seguridad y la recuperación LoRA en dos etapas para reparar el daño de la compresión.

## Capacidades

- Generación de texto conversacional, heredada de Llama-2-7b-chat, con la degradación propia de una compresión del 50 % de parámetros.
- Razonamiento y conocimiento general de dominio amplio, medido en la model card con una precisión media zero-shot de 0,4536 en 7 tareas.
- Comportamiento de rechazo ante peticiones dañinas, medido con ASR de AdvBench (0,0019) y StrongREJECT (0,0160) usando el juez HarmBench.
- Capacidad de respuesta complaciente ante prompts benignos que parecen tóxicos (OR-Bench-hard-1k), con una tasa de sobrerrechazo macro de 0,6473 según WildGuard.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Estudio de degradación de seguridad por compresión: usar este checkpoint como celda de control en una rejilla que compare reglas de selección de componentes y presupuestos de compresión, midiendo ASR de AdvBench y StrongREJECT con el juez HarmBench frente al modelo denso.
- Evaluación de reparación con LoRA en dos etapas: replicar el pipeline SVD-LLM con recuperación secuencial U/V sobre alpaca-cleaned y comparar la perplejidad en WikiText-2 (13,6889 en esta celda) con otras ramas de la rejilla.
- Investigación sobre calibración mixta utilidad/seguridad: analizar el efecto de una cuota de seguridad del 6,85 % de posiciones en el conjunto de calibración sobre el equilibrio entre utilidad y rechazo.
- Análisis de sobrerrechazo: emplear la tasa macro de sobrerrechazo (0,6473 con WildGuard) para estudiar cómo la compresión afecta a la respuesta del modelo ante prompts benignos que parecen tóxicos.
- Docencia y divulgación sobre compresión de modelos: ilustrar de forma reproducible (semilla 42, receta documentada) cómo se comporta un Llama-2-7b-chat comprimido al 50 % frente al original en perplejidad y precisión zero-shot.
- Reproducibilidad de artefactos de investigación: servir como referencia verificable para trabajos que citen SVD-LLM, dado que el repositorio incluye la configuración de calibración, la semilla y las métricas medidas.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0019 |
| StrongREJECT ASR (juez HarmBench) | 0,0160 |
| Sobrerrechazo macro (WildGuard) | 0,6473 |
| Perplejidad en WikiText-2 | 13,6889 |
| Precisión media zero-shot (7 tareas, acc_norm donde se reporta) | 0,4536 |

No se han publicado en la información disponible resultados comparativos frente a otras ramas de la rejilla ni frente a Llama-2-7b-chat sin comprimir.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un transformer de 6,74 mil millones de parámetros en bf16 requiere del orden de 13,5 GB solo para pesos, más memoria para el KV cache y activaciones; en cuantización de 8 bits bajaría a unos 6,7 GB y en 4 bits a unos 3,4 GB, aunque el repositorio no publica pesos cuantizados.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría en GPUs de 24 GB (RTX 4090, A10G, L4) en bf16 con margen limitado para contexto corto, y en A100 40/80 GB o H100 para lotes mayores.
- Cabe en GPU de consumo: previsiblemente sí en RTX 3090/4090 (24 GB) en bf16 con contexto corto, y en GPUs de 12-16 GB si se generan cuantizaciones propias; no se documenta ninguna.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`). No se documentan GGUF, llama.cpp, Ollama ni vLLM.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l2_svdllmjbb48orc48_r50 | 6.738.415.616 (50 % del denso) | no disponible | Llama 2 Community License | Artefacto de investigación con métricas de seguridad y utilidad publicadas |
| meta-llama/Llama-2-7b-chat-hf | 6.738.415.616 | 4096 tokens | Llama 2 Community License | Modelo base sin comprimir; referencia natural de comparación |
| Otras celdas de la rejilla SVD-LLM del mismo autor | no disponible | no disponible | Llama 2 Community License | No se detallan en la información proporcionada |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- No es un modelo de chat de propósito general: la model card lo describe explícitamente como artefacto de investigación y sujeto experimental, no como asistente desplegable.
- Varias ramas de la rejilla están deliberadamente degradadas en seguridad; la compresión por sí sola eleva la tasa de éxito de ataques, y esta celda debe evaluarse antes de extraer conclusiones.
- Riesgo de alucinación: no cuantificado en la información proporcionada; la compresión al 50 % y el ajuste LoRA sobre alpaca-cleaned pueden alterar la fidelidad factual respecto al modelo base.
- Sesgos conocidos: no documentados en la información proporcionada; se heredan los del modelo base Llama-2-7b-chat, no caracterizados aquí.
- Limitaciones de contexto e idioma: no documentadas; el modelo base soporta 4096 tokens y está orientado principalmente al inglés, pero no se confirma para este checkpoint.
- Restricciones de licencia: Llama 2 Community License, con `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio; el uso comercial está sujeto a los términos y a la política de uso aceptable de Meta.
- Perplejidad en WikiText-2 de 13,6889 y precisión media zero-shot de 0,4536: valores que deben interpretarse en el contexto de la rejilla, no como indicadores absolutos de calidad.
- Tasa de sobrerrechazo macro de 0,6473 (WildGuard): elevada, lo que sugiere que el modelo rechaza con frecuencia peticiones benignas que parecen tóxicas.
- Sin descargas ni likes en el momento de la consulta y sin resultados de benchmarks comparativos publicados: la validación externa es nula.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_svdllmjbb48orc48_r50
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Repositorio SVD-LLM: https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Licencia Llama 2: https://ai.meta.com/llama/license/
- Política de uso aceptable de Llama 2: https://ai.meta.com/llama/use-policy/
