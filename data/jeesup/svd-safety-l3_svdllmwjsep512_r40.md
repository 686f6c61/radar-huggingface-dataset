# Jeesup/svd-safety-l3_svdllmwjsep512_r40

## Resumen

`svd-safety-l3_svdllmwjsep512_r40` es un checkpoint de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct`, comprimido mediante la técnica SVD-LLM hasta conservar el 60,0 % de los parámetros densos originales (un 40,00 % de parámetros eliminados), y posteriormente recuperado con la etapa 2 de LoRA de SVD-LLM. Lo publica el usuario Jeesup como una celda concreta de una malla experimental que estudia cómo la compresión SVD degrada el comportamiento de seguridad y qué regla de selección de componentes lo repara mejor.

No es un modelo conversacional de propósito general: es un artefacto de investigación sobre seguridad e interpretabilidad. Su interés radica en que cuantifica el compromiso entre utilidad (perplejidad en WikiText-2, precisión zero-shot) y seguridad (tasas de ataque exitoso en AdvBench y StrongREJECT, sobre-rechazo en WildGuard) bajo compresión agresiva, un eje poco explorado en la literatura de compresión de LLM.

La arquitectura subyacente es la de Llama-3-8B-Instruct (transformer decoder-only denso, 8.030.261.248 parámetros), con licencia Meta Llama 3 Community License y pesos en safetensors para `transformers`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama-3-8B-Instruct comprimido con SVD-LLM) |
| Parámetros totales | 8.030.261.248 (fracción resultante 0,5998 respecto al denso original) |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Llama-3-8B-Instruct: 8.192 tokens, no confirmado en la model card) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Meta Llama 3 Community License (`LICENSE` y `USE_POLICY.md` incluidos en el repo) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `meta-llama/Meta-Llama-3-8B-Instruct` y aplica SVD-LLM, el método de compresión por descomposición en valores singulares de AIoT-MLSys-Lab, usando un SVD blanqueado sobre un conjunto de calibración agrupado. La matriz de calibración combina utilidad y seguridad: `S S^T = sum_WikiText x x^T + sum_safety x x^T`. La parte de utilidad emplea WikiText-2 train con 255 ventanas de 2.048 tokens (muestreo de SVD-LLM, semilla 42, todas las posiciones); la parte de seguridad usa los primeros 512 prompts de WildJailbreak train (vanilla y adversarial dañinos) con los rechazos generados por el propio Llama-3-8B-Instruct (orden con semilla 42, una conversación por muestra, 73.800 posiciones). La proporción efectiva de seguridad es 0,1238 de las posiciones.

Tras la compresión al 60,0 % de parámetros densos, se aplica la recuperación de etapa 2 de SVD-LLM mediante LoRA secuencial (primero U, luego V) sobre alpaca-cleaned, con r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256 y bf16. La semilla global del experimento es 42. El checkpoint es una celda de una malla sobre reglas de selección de componentes y presupuestos de compresión, por lo que su valor es comparativo dentro del estudio, no como modelo final.

## Capacidades

- Generación de texto conversacional heredada de Llama-3-8B-Instruct, sujeta a la degradación introducida por la compresión SVD.
- Razonamiento y conocimiento general evaluados de forma zero-shot en 7 tareas (precisión media 0,4998, con acc_norm donde se reporta).
- Comportamiento de rechazo ante peticiones dañinas, medido con AdvBench (ASR 0,0154) y StrongREJECT (ASR 0,0192) con juez HarmBench.
- Capacidad de calibración de seguridad bajo compresión: sirve como sujeto experimental para medir sobre-rechazo (0,4526 macro en WildGuard).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Estudio de degradación de seguridad por compresión: usar este checkpoint como celda de referencia (60 % de parámetros, calibración con 12,38 % de posiciones de seguridad) y comparar sus ASR de AdvBench y StrongREJECT frente a otras celdas de la malla para aislar el efecto de la regla de selección de componentes.
- Investigación sobre sobre-rechazo: el 0,4526 de macro over-refusal en WildGuard lo convierte en un punto de medida útil para estudiar el coste de utilidad que impone la calibración orientada a seguridad.
- Validación de pipelines de compresión SVD-LLM: reproducir la receta (SVD blanqueado con calibración agrupada WikiText-2 + WildJailbreak, LoRA secuencial U→V sobre alpaca-cleaned) y verificar que se obtienen las métricas reportadas.
- Análisis de interpretabilidad de componentes: al ser una celda de una malla sobre reglas de selección, permite estudiar qué subespacios de pesos concentran la capacidad de rechazo y cuáles la utilidad lingüística.
- Benchmarking de evaluadores de seguridad: servir de entrada controlada con ASR conocido para calibrar jueces automáticos (HarmBench, WildGuard) y detectar deriva en sus veredictos.
- Docencia y divulgación sobre compresión de LLM: ilustrar con números concretos (perplejidad 23,0929 en WikiText-2, precisión zero-shot 0,4998) el compromiso entre tamaño, utilidad y alineamiento.
- No se recomienda su uso como asistente desplegable en producción; la model card lo describe explícitamente como sujeto experimental.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0154 |
| StrongREJECT ASR (juez HarmBench) | 0,0192 |
| Macro over-refusal (WildGuard) | 0,4526 |
| Perplejidad WikiText-2 | 23,0929 |
| Precisión media zero-shot (7 tareas, acc_norm donde se reporta) | 0,4998 |

No se han publicado en la información disponible resultados desglosados por tarea (MMLU, HumanEval, GSM8K) ni comparaciones directas con el modelo base sin comprimir u otras celdas de la malla.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 16 GB solo para pesos (8.030 millones de parámetros), más overhead de activaciones y caché KV; en la práctica, 18-24 GB para contexto moderado.
- GPU recomendadas para bf16: A100 40/80 GB, H100, L40S; en consumer, RTX 4090 (24 GB) puede alojar los pesos en bf16 con contexto limitado.
- Cuantización a 8 bits: alrededor de 8-9 GB de pesos, viable en RTX 3090/4090 y GPUs de 12-16 GB. A 4 bits: alrededor de 4-5 GB, viable en GPUs consumer de 8 GB, aunque no se publican variantes GGUF/AWQ/GPTQ en el repo.
- Despliegue: compatible con `transformers` y con Text Generation Inference (tag `text-generation-inference` y `endpoints_compatible` en Hugging Face). No se documentan recetas para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `Jeesup/svd-safety-l3_svdllmwjsep512_r40` | 8.030 M (60,0 % del denso) | no disponible | Llama 3 Community | Artefacto de investigación con métricas de seguridad y utilidad publicadas |
| `meta-llama/Meta-Llama-3-8B-Instruct` (base sin comprimir) | 8.030 M | 8.192 tokens | Llama 3 Community | Referencia de utilidad y seguridad; no se reportan aquí sus métricas en la información disponible |
| Otras celdas de la malla del mismo autor | 8.030 M (distintos presupuestos) | no disponible | Llama 3 Community | No se dispone de sus métricas en la información proporcionada |

No se dispone de datos comparativos con métodos alternativos de compresión (podado estructurado, cuantización, destilación) en la información proporcionada.

## Limitaciones y advertencias

- La model card advierte que varias celdas de la malla están deliberadamente degradadas en seguridad respecto a Llama-3-8B-Instruct; la compresión por sí sola eleva la tasa de éxito de ataques. No debe tratarse como asistente desplegable.
- Riesgo de alucinación: no cuantificado en la información disponible; la compresión al 60 % y la recuperación LoRA de solo 2 épocas sobre alpaca-cleaned pueden degradar la fidelidad factual.
- El sobre-rechazo macro de 0,4526 en WildGuard indica una tendencia elevada a rechazar peticiones benignas, con el consiguiente coste de utilidad.
- Sesgos: no documentados en la información proporcionada; hereda los del modelo base y los del conjunto de calibración (WikiText-2 y WildJailbreak).
- Idiomas soportados no declarados; no se garantiza un comportamiento multilingüe fiable.
- Longitud de contexto no confirmada en la model card; no asumir la ventana de Llama-3-8B-Instruct sin verificación empírica.
- Restricciones de licencia: Meta Llama 3 Community License, con `LICENSE` y `USE_POLICY.md` en el repositorio; el uso comercial está sujeto a los términos de dicha licencia y a la política de uso aceptable de Meta.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria independiente.
- Cualquier conclusión extraída de este checkpoint debe validarse con evaluación propia antes de generalizarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_svdllmwjsep512_r40
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Repositorio de SVD-LLM: https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Licencia Meta Llama 3: incluida en el repositorio del modelo (`LICENSE`, `USE_POLICY.md`)
