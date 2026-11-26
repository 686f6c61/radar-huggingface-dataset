# Jeesup/svd-safety-l2_svdllmorc48_r50

## Resumen

`svd-safety-l2_svdllmorc48_r50` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf`, comprimido mediante SVD-LLM hasta conservar aproximadamente el 50 % de los parámetros densos del modelo original y posteriormente recuperado con una etapa de LoRA. Lo publica el usuario Jeesup como artefacto de un estudio sobre cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes repara mejor ese daño. No es un modelo de chat de propósito general.

El modelo forma parte de una rejilla experimental sobre reglas de selección y presupuestos de compresión; esta celda concreta usa un conjunto de calibración mixto (utilidad más seguridad) y elimina el 50,00 % de los parámetros. La relevancia es metodológica: cuantifica el compromiso entre utilidad (perplejidad en WikiText-2, precisión zero-shot) y seguridad (tasas de éxito de ataque en AdvBench y StrongREJECT) bajo compresión agresiva, un eje poco cubierto en la literatura de compresión de LLM.

Arquitectura transformer decoder-only de la familia Llama 2, 6.738.415.616 parámetros efectivos tras la compresión, pesos en safetensors y licencia Llama 2 Community License. El repositorio ocupa 13,5 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), comprimido con SVD-LLM y recuperado con LoRA de etapa 2 |
| Parametros totales | 6.738.415.616 (fracción resultante 0,4999 respecto del denso) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (modelo base Llama 2: 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Llama-2-7b-chat-hf y se comprime con SVD-LLM (implementación de AIoT-MLSys-Lab) usando una SVD blanqueada sobre un conjunto de calibración agrupado: la matriz de segundo momento combina `sum_WikiText x x^T + sum_safety x x^T`. La parte de utilidad son 255 ventanas de 2048 tokens de WikiText-2 train (muestreador de SVD-LLM, semilla 42) evaluadas en todas las posiciones; la parte de seguridad son los primeros 48 de 157 prompts de OR-Bench-hard-1k (aparentemente tóxicos pero benignos) con las respuestas conformes del propio Llama-2-7b-chat (orden con semilla 42), una conversación por muestra desempaquetada, 25 612 posiciones. La cuota efectiva de seguridad es 0,0467 de las posiciones.

Tras la compresión al 50,00 % de parámetros se aplica la recuperación de etapa 2 de SVD-LLM: LoRA secuencial sobre U y luego sobre V, con r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256 y precisión bf16, sobre el dataset alpaca-cleaned. La semilla global es 42. No se documenta en la información disponible el número total de tokens de entrenamiento ni si hubo RLHF o DPO adicionales más allá del alineamiento heredado de Llama-2-7b-chat.

## Capacidades

- Generación de texto conversacional heredada de Llama-2-7b-chat, degradada por la compresión al 50 %.
- Razonamiento y respuesta a instrucciones en inglés, con calidad medida por precisión zero-shot media de 0,4553 en 7 tareas.
- Capacidad de seguir instrucciones de formato conversacional (plantilla de chat de Llama 2).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso específico.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No dispone de modo thinking, visión ni audio.
- Comportamiento de rechazo medido: sobre-rechazo macro de 0,4833 (WildGuard), relevante para evaluar calibración de negativas.

## Casos de uso

- Investigación sobre compresión de LLM: sirve como celda de una rejilla para medir cómo varía la perplejidad y la precisión zero-shot al cambiar la regla de selección de componentes SVD y el presupuesto de compresión.
- Evaluación de seguridad bajo compresión: permite cuantificar el aumento de la tasa de éxito de ataques (AdvBench ASR 0,0385, StrongREJECT ASR 0,0767) frente al modelo denso y validar si la calibración con datos de seguridad mitiga la degradación.
- Estudio de sobre-rechazo: el valor de 0,4833 en WildGuard lo hace útil para analizar el equilibrio entre rechazar peticiones dañinas y rechazar peticiones benignas tras comprimir.
- Reproducibilidad de pipelines SVD-LLM: el checkpoint documenta semilla, calibración y hiperparámetros de LoRA, por lo que sirve para replicar el procedimiento de compresión y recuperación en otros modelos.
- Comparación de metodologías de recuperación: al ser una celda de una rejilla, permite contrastar la recuperación LoRA secuencial U→V con otras variantes sobre el mismo presupuesto del 50 %.
- Análisis de interpretabilidad: el etiquetado `interpretability` y la selección basada en SVD facilitan estudiar qué componentes del modelo concentran comportamiento de seguridad.
- No se recomienda su uso como asistente en producción; cualquier despliegue requeriría evaluación propia previa.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (HarmBench judge) | 0,0385 |
| StrongREJECT ASR (HarmBench judge) | 0,0767 |
| Sobre-rechazo macro (WildGuard) | 0,4833 |
| Perplejidad WikiText-2 | 13,6191 |
| Precisión media zero-shot (7 tareas, acc_norm donde se reporta) | 0,4553 |

No se han publicado en la información disponible resultados comparativos frente a otros modelos en estas mismas métricas.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 16 GB o más para contexto corto.
- Cuantización a 8 bits: en torno a 7 GB de pesos; a 4 bits, en torno a 3,5-4 GB, aunque no se documentan variantes cuantizadas oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S para servicio; RTX 4090 (24 GB) para bf16 con contexto moderado; RTX 3090/4080 (16-24 GB) viable en bf16 o 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090, 3090 y 4080 en bf16; en GPUs de 8-12 GB requeriría cuantización a 4 bits.
- Opciones de despliegue: transformers, text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repo), vLLM y llama.cpp/Ollama si se generan pesos GGUF (no publicados).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| svd-safety-l2_svdllmorc48_r50 | 6,74 B (50 % del denso) | no disponible | Llama 2 | Hugging Face | Artefacto de investigación con métricas de seguridad |
| meta-llama/Llama-2-7b-chat-hf | 6,74 B | 4096 | Llama 2 | Hugging Face | Modelo base sin comprimir |
| AIoT-MLSys-Lab/SVD-LLM (checkpoints de referencia) | variable | no disponible | según modelo base | Hugging Face | Implementación original de la compresión SVD-LLM |

No se dispone de datos de benchmarks comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El propio autor advierte que varias celdas de la rejilla están deliberadamente degradadas en seguridad respecto de Llama-2-7b-chat; la compresión por sí sola eleva la tasa de éxito de ataques.
- No es un modelo de chat de propósito general; debe tratarse como sujeto experimental y evaluarse antes de extraer conclusiones.
- Riesgo de alucinación no cuantificado en la información disponible, pero esperable en un modelo comprimido al 50 %.
- Sobre-rechazo elevado (0,4833), lo que implica que rechazará con frecuencia peticiones benignas.
- Idiomas soportados no documentados; el alineamiento y la calibración se hicieron en inglés.
- Longitud de contexto no documentada para este checkpoint; se hereda la del modelo base (4096 tokens) salvo indicación contraria.
- Uso comercial restringido por la Llama 2 Community License; se incluyen `LICENSE.txt` y `USE_POLICY.md` en el repositorio y el uso del derivado queda vinculado a ellos.
- Sin descargas ni likes en el momento de la consulta; ausencia de validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_svdllmorc48_r50
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Implementación SVD-LLM: https://github.com/AIoT-MLSys-Lab/SVD-LLM
- OR-Bench: https://huggingface.co/datasets/bench-llm/or-bench
- AdvBench (HarmBench): https://github.com/centerforaisafety/HarmBench
- StrongREJECT: https://github.com/alexandrasouly/strongreject
- WildGuard: https://huggingface.co/allenai/wildguard
- WikiText-2: https://huggingface.co/datasets/wikitext
- alpaca-cleaned: https://huggingface.co/datasets/yahma/alpaca-cleaned
