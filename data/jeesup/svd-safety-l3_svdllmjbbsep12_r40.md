# Jeesup/svd-safety-l3_svdllmjbbsep12_r40

## Resumen

svd-safety-l3_svdllmjbbsep12_r40 es un checkpoint de investigación derivado de meta-llama/Meta-Llama-3-8B-Instruct, comprimido mediante la técnica SVD-LLM hasta conservar el 60,0 % de los parámetros densos originales (fracción resultante 0,5998, es decir, un 40,00 % de parámetros eliminados). Lo publica el usuario Jeesup como un artefacto experimental dentro de un estudio sobre cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes repara mejor ese daño. No es un modelo de chat de propósito general.

El interés técnico radica en su doble vertiente: por un lado, demuestra un pipeline de compresión con recuperación mediante LoRA en dos etapas (secuencial U y luego V) sobre alpaca-cleaned; por otro, expone métricas de seguridad (ASR en AdvBench y StrongREJECT) y de utilidad (perplejidad en WikiText-2 y precisión zero-shot en 7 tareas) que permiten cuantificar el compromiso entre ambas. La calibración combina un conjunto de utilidad (WikiText-2) con uno de seguridad (JailbreakBench), con una proporción efectiva de posiciones de seguridad de solo 0,0012.

El modelo conserva la arquitectura y el tokenizador de Llama-3-8B-Instruct, con 8.030.261.248 parámetros reales en safetensors y un repositorio de 16,1 GB. Su relevancia es metodológica: sirve como celda de una malla experimental sobre reglas de selección y presupuestos de compresión, no como asistente desplegable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), comprimido mediante SVD-LLM |
| Parámetros totales | 8.030.261.248 (fracción 0,5998 respecto al denso original) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Llama-3-8B-Instruct) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors, presumiblemente bf16) |
| Idiomas soportados | no disponible |
| Licencia | Llama 3 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Meta-Llama-3-8B-Instruct, un transformer decoder-only con 8.030 millones de parámetros, y se comprime con SVD-LLM aplicando una SVD blanqueada sobre un conjunto de calibración agrupado: S·Sᵀ = Σ_WikiText x·xᵀ + Σ_safety x·xᵀ. La parte de utilidad emplea WikiText-2 train con 255 ventanas de 2048 tokens (muestreo de SVD-LLM, semilla 42) usando todas las posiciones; la parte de seguridad usa los primeros 12 de 94 objetivos de JailbreakBench con las respuestas de rechazo del propio Llama-3-8B-Instruct (orden con semilla 42), una conversación por muestra desempaquetada con 645 posiciones. La proporción efectiva de posiciones de seguridad es de 0,0012, lo que explica que la señal de seguridad sea marginal en la calibración.

Tras la compresión al 60,0 % de parámetros, se aplica la recuperación de etapa 2 de SVD-LLM mediante LoRA secuencial (primero U, luego V) sobre alpaca-cleaned, con r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256 y precisión bf16. No se documenta RLHF ni DPO adicional; la alineación de seguridad proviene del modelo base original. El estimador es la SVD blanqueada de los autores (AIoT-MLSys-Lab/SVD-LLM) con factor cacheado.

## Capacidades

- Generación de texto conversacional heredada de Llama-3-8B-Instruct, aunque degradada por la compresión.
- Razonamiento y respuesta a instrucciones en formato chat (plantilla de Llama 3).
- Capacidad multilingüe heredada del modelo base, sin datos específicos publicados para este checkpoint.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso específico.
- No se documenta modo thinking, visión ni audio.
- Su función principal es servir como sujeto experimental para medir seguridad y utilidad bajo compresión.

## Casos de uso

- Investigación sobre compresión de modelos: usar el checkpoint para reproducir el pipeline SVD-LLM con calibración mixta utilidad/seguridad y comparar la fracción 0,5998 frente a otras celdas de la malla.
- Evaluación de seguridad post-compresión: medir ASR en AdvBench y StrongREJECT con el juez HarmBench para cuantificar cuánto degrada la compresión el comportamiento de rechazo, usando los valores publicados (0,2308 y 0,2524) como referencia.
- Estudio de sobre-rechazo: emplear la métrica Macro over-refusal (WildGuard) de 0,1271 para analizar el equilibrio entre rechazo correcto y falsos positivos en modelos comprimidos.
- Análisis de reglas de selección de componentes: comparar esta celda (calibración pooled utilidad + seguridad) con otras del grid para determinar qué regla repara mejor la seguridad tras la SVD.
- Benchmarking de utilidad: usar la perplejidad en WikiText-2 (27,9211) y la precisión zero-shot media en 7 tareas (0,5002) para trazar curvas de degradación frente al presupuesto de compresión.
- Docencia y experimentación con LoRA de recuperación: reproducir la etapa 2 (LoRA secuencial U/V sobre alpaca-cleaned con r=8) para estudiar la recuperación de capacidad tras poda espectral.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,2308 |
| StrongREJECT ASR (juez HarmBench) | 0,2524 |
| Macro over-refusal (WildGuard) | 0,1271 |
| Perplejidad WikiText-2 | 27,9211 |
| Precisión media zero-shot (7 tareas, acc_norm donde aplica) | 0,5002 |

No se han publicado resultados comparativos frente a otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 16 GB solo para pesos, más overhead de activaciones y caché KV; el repositorio ocupa 16,1 GB.
- En cuantización de 8 bits, aproximadamente 8-9 GB de VRAM; en 4 bits, alrededor de 4,5-5 GB (estimaciones según el tamaño de parámetros, no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16; RTX 3090/4090 o GPUs de 16 GB en cuantización de 8 bits.
- Cabe en GPU de consumo (RTX 4090, 3090) en bf16 y en GPUs de 8-12 GB con cuantización agresiva.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag endpoints_compatible), vLLM y llama.cpp/Ollama previa conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l3_svdllmjbbsep12_r40 | 8.030 M (60 % del denso) | no disponible | Llama 3 Community | Checkpoint comprimido de investigación |
| meta-llama/Meta-Llama-3-8B-Instruct | 8.030 M | 8.192 tokens (modelo base) | Llama 3 Community | Referencia sin comprimir |
| Otras celdas del grid SVD-LLM (Jeesup) | ~60 % del denso | no disponible | Llama 3 Community | Distintas reglas de selección y presupuestos |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de propósito general: el autor lo describe explícitamente como artefacto de investigación y sujeto experimental.
- Varias celdas del grid están deliberadamente degradadas en seguridad; la compresión por sí sola eleva la tasa de éxito de ataques (ASR de 0,2308 en AdvBench y 0,2524 en StrongREJECT).
- Riesgo de alucinación y degradación de calidad por la pérdida del 40 % de parámetros; la perplejidad en WikiText-2 (27,9211) es superior a la del modelo denso original.
- La proporción efectiva de posiciones de seguridad en la calibración es de solo 0,0012, lo que limita la influencia de la señal de seguridad.
- Idiomas soportados no documentados; el comportamiento multilingüe puede diferir del modelo base.
- Uso comercial sujeto a la Llama 3 Community License y a USE_POLICY.md incluidos en el repositorio; es obligatorio revisarlos antes de cualquier despliegue.
- No debe usarse en producción sin una evaluación propia de seguridad y utilidad.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_svdllmjbbsep12_r40
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Repositorio SVD-LLM de referencia: https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Licencia Llama 3: https://llama.meta.com/llama3/license/
