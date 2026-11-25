# Jeesup/svd-safety-l3_svdllmjbbsep24_r40

## Resumen

svd-safety-l3_svdllmjbbsep24_r40 es un checkpoint de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct`, comprimido mediante la técnica SVD-LLM hasta conservar el 60,0 % de los parámetros densos del modelo original (40,00 % eliminados, fracción resultante 0,5998). El autor, Jeesup, lo publica como una celda concreta de una malla experimental que estudia cómo la compresión por descomposición en valores singulares degrada el comportamiento de seguridad del modelo y qué regla de selección de componentes lo repara mejor. No es un modelo conversacional de propósito general.

El checkpoint parte de Llama 3 8B Instruct (8.030.261.248 parámetros en safetensors) y aplica una SVD blanqueada sobre un conjunto de calibración mixto que combina utilidad (WikiText-2) y seguridad (24 objetivos de JailbreakBench con las respuestas de rechazo del propio Llama-3-8B-Instruct). Tras la compresión se aplica la recuperación de etapa 2 de SVD-LLM mediante LoRA secuencial (U y luego V) sobre alpaca-cleaned. El resultado es un artefacto de investigación para medir el compromiso entre utilidad y seguridad bajo compresión, no un asistente desplegable.

Su relevancia es metodológica: cuantifica con métricas concretas (ASR en AdvBench y StrongREJECT, sobre-rechazo en WildGuard, perplejidad en WikiText-2 y precisión zero-shot en 7 tareas) cuánto se degrada la seguridad al comprimir y hasta qué punto la recuperación LoRA mitiga el daño. El autor advierte explícitamente de que varias celdas de la malla están deliberadamente degradadas en seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), comprimido con SVD-LLM |
| Parametros totales | 8.030.261.248 (fracción 0,5998 del denso original) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Llama 3 8B Instruct: 8.192 tokens; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16) |
| Idiomas soportados | no disponible |
| Licencia | Llama 3 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Llama 3 con 8.030.261.248 parámetros tras la compresión. La compresión se realiza con SVD-LLM, que descompone las matrices de pesos y descarta componentes según una regla de selección guiada por un estimador de SVD blanqueada (`S S^T = sum_WikiText x x^T + sum_safety x x^T`). En esta celda se elimina el 40,00 % de los parámetros, quedando una fracción de 0,5998. La calibración combina WikiText-2 train (255 ventanas de 2.048 tokens, todas las posiciones) y 24 de los 94 objetivos de JailbreakBench con los rechazos propios de Llama-3-8B-Instruct (1.406 posiciones), con una cuota efectiva de seguridad de 0,0027 de las posiciones. La semilla es 42.

Sobre el modelo comprimido se aplica la recuperación de etapa 2 de SVD-LLM: LoRA secuencial sobre U y luego sobre V, entrenado con alpaca-cleaned, r=8, alpha=16, 2 épocas, learning rate 1e-4, batch 64, cutoff 256 y precisión bf16. No se documentan en la información disponible datos sobre RLHF o DPO adicionales más allá del ajuste instruct original de Llama 3.

## Capacidades

- Generación de texto conversacional heredada de Llama-3-8B-Instruct, aunque degradada por la compresión y por el ajuste LoRA de recuperación.
- Razonamiento y respuesta a instrucciones en el nivel del modelo base, con pérdida de calidad medida en perplejidad y precisión zero-shot.
- Comportamiento de rechazo ante peticiones dañinas, objeto central del estudio, con tasas de éxito de ataque medidas.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible; se heredaría del formato de Llama 3 Instruct, pero no está validado en este checkpoint.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Investigación sobre compresión de modelos: servir como celda de referencia para medir la pérdida de utilidad y seguridad al eliminar el 40 % de parámetros con SVD-LLM y comparar con otras reglas de selección de la misma malla.
- Estudio de alineación y seguridad: analizar la tasa de éxito de ataque (ASR) en AdvBench y StrongREJECT para cuantificar cuánto degrada la compresión el comportamiento de rechazo y en qué medida lo repara la recuperación LoRA.
- Evaluación de sobre-rechazo: usar la métrica de sobre-rechazo macro (WildGuard) para estudiar el equilibrio entre seguridad y utilidad conversacional en modelos comprimidos.
- Reproducibilidad de pipelines de compresión: replicar el flujo SVD-LLM con calibración mixta utilidad+seguridad (WikiText-2 más JailbreakBench) y validar la receta de recuperación con LoRA secuencial sobre alpaca-cleaned.
- Benchmarking de perplejidad: emplear la perplejidad en WikiText-2 (27,3772) como referencia para comparar variantes de compresión y recuperación.
- Docencia y divulgación técnica: ilustrar con un artefacto real los compromisos entre tamaño, utilidad y seguridad en modelos comprimidos, siempre con la advertencia de que no es un asistente desplegable.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,1365 |
| StrongREJECT ASR (juez HarmBench) | 0,1853 |
| Sobre-rechazo macro (WildGuard) | 0,1689 |
| Perplejidad en WikiText-2 | 27,3772 |
| Precisión media zero-shot (7 tareas, acc_norm donde se reporta) | 0,5014 |

No se han publicado en la información disponible resultados comparativos frente a Llama-3-8B-Instruct sin comprimir ni frente a otras celdas de la malla.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16 GB solo para pesos, más memoria para el contexto y el runtime; en la práctica, 18-20 GB en GPUs de 24 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 8-9 GB; en 4 bits, alrededor de 5-6 GB (estimaciones basadas en el recuento de parámetros, no verificadas en la model card).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16; RTX 3090 y GPUs de 16 GB con cuantización.
- Cabe en GPU de consumo: sí, en RTX 4090 en bf16 y en GPUs de 12-16 GB con cuantización.
- Opciones de despliegue: transformers, text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM y llama.cpp/Ollama previa conversión a GGUF (no se publican pesos GGUF en el repositorio).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l3_svdllmjbbsep24_r40 | 8.030.261.248 (60 % del denso) | no disponible | Llama 3 Community License | Checkpoint de investigación comprimido con SVD-LLM; no apto para producción |
| meta-llama/Meta-Llama-3-8B-Instruct | 8.030.261.248 | 8.192 tokens | Llama 3 Community License | Modelo base sin comprimir; referencia de utilidad y seguridad |
| Otras celdas de la malla SVD-LLM del autor | variable según presupuesto | no disponible | Llama 3 Community License | Variantes con distintas reglas de selección y presupuestos; no se detallan en la información disponible |
| Modelos comprimidos equivalentes de la literatura (p. ej., SVD-LLM original) | variable | no disponible | según modelo base | No se dispone de comparación numérica en la información proporcionada |

## Limitaciones y advertencias

- Artefacto de investigación: el autor indica explícitamente que no es un modelo conversacional de propósito general ni un asistente desplegable.
- Seguridad degradada: la compresión por sí sola eleva la tasa de éxito de ataque; varias celdas de la malla están deliberadamente degradadas y esta debe evaluarse antes de extraer conclusiones.
- Riesgo de alucinación: la compresión y el ajuste LoRA de recuperación pueden aumentar la pérdida de fidelidad respecto al modelo base; no se documenta una evaluación específica de alucinación.
- Sesgos: no se documentan análisis de sesgo en la información disponible; se heredan los del modelo base y los del conjunto alpaca-cleaned.
- Contexto e idiomas: la longitud de contexto efectiva y los idiomas soportados no están confirmados en la model card.
- Licencia: Llama 3 Community License, con `LICENSE` y `USE_POLICY.md` incluidos en el repositorio; el uso comercial está sujeto a las restricciones de dicha licencia y a la política de uso aceptable de Meta.
- Métricas de seguridad dependientes del juez: los ASR se miden con el juez HarmBench y el sobre-rechazo con WildGuard, por lo que los valores no son directamente comparables con evaluaciones que usen otros jueces.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_svdllmjbbsep24_r40
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Repositorio de SVD-LLM: https://github.com/AIoT-MLSys-Lab/SVD-LLM
- JailbreakBench: https://jailbreakbench.github.io/
- HarmBench: https://www.harmbench.org/
- StrongREJECT: https://strong-reject.github.io/
- WildGuard: https://huggingface.co/allenai/wildguard
- AdvBench (dentro de LLM-attacks): https://github.com/llm-attacks/llm-attacks
- Dataset alpaca-cleaned: https://huggingface.co/datasets/yahma/alpaca-cleaned
- WikiText-2: https://huggingface.co/datasets/wikitext
