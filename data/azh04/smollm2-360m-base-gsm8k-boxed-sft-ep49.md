# AZH04/SmolLM2-360M-base-gsm8k-boxed-sft-ep49

## Resumen

El modelo **AZH04/SmolLM2-360M-base-gsm8k-boxed-sft-ep49** es un ajuste fino supervisado (SFT) del modelo base **HuggingFaceTB/SmolLM2-360M** (sin capa de instrucciones) sobre el conjunto de datos GSM8K. Ha sido desarrollado por el usuario AZH04 como parte de una campaña de investigación sobre entrenamiento unificado (unified-training) para razonamiento matemático, específicamente para comparar estrategias de entrenamiento por etapas (SFT seguido de RL) frente a enfoques híbridos (demostraciones transmitidas durante RL) con presupuestos de demostración idénticos.

El checkpoint se corresponde con **49 épocas** (paso global 1470), lo que equivale a **47.922 presentaciones de demostraciones** a partir de un corpus de **978 trazas verificadas** generadas por un profesor Qwen2.5-3B-Instruct. El modelo tiene **361.821.120 parámetros** y su propósito declarado es servir como inicialización para entrenamiento por refuerzo (RL) en tareas de razonamiento matemático, evaluado con un protocolo estricto que lee la última respuesta en formato `\boxed{}`.

Su relevancia radica en que forma parte de una escalera de checkpoints SFT con presupuestos de demostración calibrados, permitiendo comparaciones controladas entre diferentes regímenes de entrenamiento. No es un modelo de propósito general, sino una herramienta de investigación para estudiar el efecto del número de épocas y el presupuesto de demostraciones en el rendimiento final de modelos pequeños.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en SmolLM2, compatible con el formato Llama) |
| Parametros totales | 361.821.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el dataset y el prompt están en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (sin LoRA) del modelo base SmolLM2-360M, un transformer decoder-only de 360M parámetros. El entrenamiento se realizó sobre un corpus de 978 trazas de GSM8K, seleccionadas mediante el criterio *shortest-correct-fitting-budget* y verificadas con una puntuación de 1.0 bajo el evaluador de entrenamiento. Las trazas fueron generadas por el profesor Qwen2.5-3B-Instruct y el prompt de entrenamiento sigue el formato estándar de verl en cero disparos: `{question} Let's think step by step and output the final answer within \boxed{}.` Los objetivos terminan con el token EOS para que el modelo aprenda a detener la generación.

El entrenamiento se realizó con una tasa de aprendizaje de 1e-5, tamaño de lote 32, decaimiento coseno y precisión bf16, en una única GPU con FSDP de tamaño de mundo 1. El checkpoint de 49 épocas es una ejecución separada (no un punto intermedio de una ejecución más larga), por lo que su programación de LR es independiente. La innovación técnica principal es la receta *boxed*, que obliga al modelo a emitir la respuesta final entre llaves `\boxed{}`, y el diseño experimental que empareja este checkpoint con los brazos híbridos de la campaña unified-training para comparaciones justas.

## Capacidades

- Generación de razonamiento paso a paso para problemas aritméticos de nivel escolar (GSM8K), con respuesta final en formato `\boxed{}`.
- Especialización en el formato de salida estricto (el evaluador solo puntúa la última aparición de `\boxed{...}`).
- Capacidad de terminar la generación correctamente gracias a los objetivos con token EOS.
- No soporta tool calling, function calling, agentes, visión, audio ni modos de pensamiento explícitos.
- El modelo está entrenado principalmente en inglés (el dataset y el prompt lo son); no se declaran capacidades multilingües.

## Casos de uso

- **Inicialización para entrenamiento por refuerzo (RL)**: el uso previsto principal es como punto de partida para algoritmos de RL como PPO o GRPO en tareas de razonamiento matemático, donde el modelo ya ha aprendido a producir respuestas en el formato esperado.
- **Comparación de estrategias de entrenamiento**: permite aislar el efecto del presupuesto de demostraciones (47.922 presentaciones) frente a otros checkpoints de la misma escalera (ep6, ep9, ep12, etc.) para estudiar la relación entre épocas y rendimiento final.
- **Generación de soluciones para verificación automática**: puede utilizarse para producir respuestas candidatas en sistemas de verificación que puntúan la corrección de la última respuesta `\boxed{}`, como en pipelines de evaluación de GSM8K.
- **Estudio de sobreajuste en SFT**: al ser un modelo pequeño entrenado durante muchas épocas sobre un corpus reducido (978 trazas), sirve para analizar el equilibrio entre memorización y generalización en modelos de lenguaje pequeños.
- **Componente en experimentos de unified-training**: se puede emplear como brazo de referencia en experimentos que comparan SFT por etapas con entrenamiento híbrido (demostraciones transmitidas durante RL), manteniendo idéntico el presupuesto total de demostraciones.
- **Pruebas de protocolos de evaluación**: dado su formato de salida estricto, es útil para validar graders que extraen la última respuesta `\boxed{}` y para calibrar métricas como pass@1 y pass@64.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para el checkpoint de 49 épocas en la información disponible. Sin embargo, la model card proporciona números de referencia para escalones más cortos de la misma escalera, utilizando el protocolo de evaluación estándar (n=128 muestras, temperatura 0.6, top_p 0.95, máximo 1024 tokens nuevos, sobre las 1.236 preguntas del test split de GSM8K). Estos datos se presentan a continuación.

| Checkpoint | pass@1 | pass@64 |
|---|---|---|
| 6 épocas | 0.0683 | 0.6693 |
| 9 épocas | 0.0718 | 0.6934 |
| 12 épocas | 0.0756 | 0.6990 |
| 49 épocas (este modelo) | no disponible | no disponible |

## Requisitos de hardware

- **VRAM estimada para inferencia**: al tratarse de un modelo de 361M parámetros, en precisión fp16 ocupa aproximadamente 723 MB de pesos, más overhead de activaciones y KV cache. Se estima que cabe en GPUs con al menos 2 GB de VRAM en fp16, y menos de 1 GB si se cuantiza a int8 o int4.
- **GPU recomendadas**: cualquier GPU moderna con 4 GB o más de VRAM (por ejemplo, RTX 3060, RTX 4060, GTX 1660 Super) es suficiente para inferencia. El entrenamiento se realizó en una única GPU sin especificar, pero por el tamaño del modelo probablemente una GPU con 16-24 GB (como RTX 3090 o A100) sería adecuada para reproducir el entrenamiento.
- **Compatibilidad con GPU de consumo**: sí, el modelo es ligero y puede ejecutarse en GPUs de consumo de gama media e incluso en CPU con cuantización.
- **Opciones de despliegue**: al ser un modelo compatible con el formato Llama, puede servirse con vLLM, llama.cpp, Ollama, TGI o directamente con transformers de HuggingFace. También es compatible con el framework verl para entrenamiento y evaluación.
- **Latencia y throughput**: no se han publicado mediciones específicas. Dado el tamaño reducido, se espera una latencia de decodificación baja (del orden de decenas de milisegundos por token en GPU moderna) y un throughput alto en configuraciones por lotes.

## Comparativa con modelos similares

La comparación más directa se establece con otros checkpoints de la misma campaña SFT y con el modelo base sin ajustar. No se dispone de datos de modelos comparables de terceros (por ejemplo, otros fine-tunes de SmolLM2 para GSM8K) en la información proporcionada.

| Modelo | Parámetros | Contexto | pass@1 (GSM8K) | Licencia |
|---|---|---|---|---|
| SmolLM2-360M (base) | 361M | no disponible | no disponible | Apache 2.0 |
| SmolLM2-360M-base-gsm8k-boxed-sft-ep6 | 361M | no disponible | 0.0683 | Apache 2.0 |
| SmolLM2-360M-base-gsm8k-boxed-sft-ep9 | 361M | no disponible | 0.0718 | Apache 2.0 |
| SmolLM2-360M-base-gsm8k-boxed-sft-ep12 | 361M | no disponible | 0.0756 | Apache 2.0 |
| **SmolLM2-360M-base-gsm8k-boxed-sft-ep49 (este modelo)** | 361M | no disponible | no disponible | Apache 2.0 |

## Limitaciones y advertencias

- **Dominio restringido**: el modelo está especializado exclusivamente en problemas de GSM8K y no es adecuado para tareas generales de lenguaje, generación de código, diálogo o razonamiento fuera de su dominio.
- **Riesgo de alucinación**: al ser un modelo pequeño y entrenado sobre un corpus reducido, puede producir respuestas plausibles pero incorrectas, especialmente fuera del formato `\boxed{}`.
- **Dependencia del formato de salida**: el evaluador estricto solo puntúa la última aparición de `\boxed{...}`; cualquier respuesta sin este formato se considera incorrecta, lo que limita su uso en entornos no controlados.
- **Sesgo del dataset**: el corpus de entrenamiento consta de 978 trazas generadas por un único profesor (Qwen2.5-3B-Instruct), lo que puede introducir sesgos en el estilo de razonamiento y en la cobertura de tipos de problemas.
- **Sobreajuste potencial**: con 49 épocas sobre un conjunto pequeño, existe un riesgo elevado de memorización de las trazas de entrenamiento, lo que podría afectar negativamente a la generalización.
- **Sin datos de rendimiento publicados**: no se han proporcionado resultados de benchmarks para este checkpoint concreto, lo que impide validar su calidad relativa.
- **Licencia**: aunque la licencia Apache 2.0 permite uso comercial, el modelo se presenta como una herramienta de investigación y no se recomienda su uso directo en producción sin una evaluación adicional.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/AZH04/SmolLM2-360M-base-gsm8k-boxed-sft-ep49)
- [Modelo base SmolLM2-360M](https://huggingface.co/HuggingFaceTB/SmolLM2-360M)
- [Checkpoint hermano ep12](https://huggingface.co/AZH04/SmolLM2-360M-base-gsm8k-boxed-sft-ep12)
- [AI Model Benchmark Tracker 2026](https://gpt0x.com/research/ai-model-benchmark-tracker.html)
- [GSM8K Leaderboard & Scores (BenchLM)](https://benchlm.ai/benchmarks/gsm8k)
