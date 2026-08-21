# francescortu/DistillDetect-traj-Qwen2.5-3B-from-Llama-3.3-70B-Instruct-s1

## Resumen

DistillDetect-traj-Qwen2.5-3B-from-Llama-3.3-70B-Instruct-s1 es un conjunto de checkpoints de trayectoria de entrenamiento creado por francescortu para estudiar la adquisición de comportamiento de un modelo profesor durante la destilación. Se trata de un fine-tune completo (no LoRA) del modelo base Qwen/Qwen2.5-3B sobre las respuestas generadas por Nvidia-Llama-3.3-70B-Instruct a un conjunto de 1.000 prompts del dataset s1. El repositorio contiene 13 puntos intermedios del proceso de supervisión fine-tuning (SFT), desde el 1% hasta el 100% del calendario de pasos de optimización, lo que permite analizar cómo el estudiante va adoptando progresivamente las respuestas del profesor.

El modelo acompaña una reproducción del artículo *Reference-Based Distillation Detection in LLMs* (arXiv:2607.09692) y está pensado exclusivamente para investigación sobre detección de destilación, no como modelo de propósito general. La arquitectura es la de Qwen2.5-3B, un transformer decoder-only con 3.000 millones de parámetros aproximadamente, y el contexto máximo del modelo base es de 128.000 tokens, aunque el entrenamiento se realizó con un block size de 4.096 tokens. La licencia es qwen-research, que restringe el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-3B) |
| Parametros totales | 3.000 millones (aprox., modelo base Qwen2.5-3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (modelo base); 4.096 tokens (block size de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | qwen-research |
| Formato de pesos | no disponible (presumiblemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo de Qwen2.5-3B, un transformer decoder-only con atención causal estándar, sobre las respuestas del profesor Nvidia-Llama-3.3-70B-Instruct a 1.000 prompts del dataset s1. El entrenamiento sigue la receta publicada en el artículo de referencia: 3 épocas, tasa de aprendizaje 1e-5 con scheduler coseno y 5% de warmup, batch efectivo de 16 (per-device batch 4 × grad-accum 4), block size de 4.096 tokens, precisión bf16, gradient checkpointing y pérdida calculada únicamente sobre los tokens de respuesta. El formato de prompt es `Problem:\n{question}\n\nSolution:\n`.

La particularidad de este repositorio es que guarda los pesos completos en 13 puntos del entrenamiento (1%, 5%, 8%, 10%, 20%, 30%, 40%, 50%, 60%, 70%, 80%, 90% y 100% de los pasos de optimización), lo que permite trazar la evolución de la capacidad del estudiante a lo largo del proceso. Los checkpoints del 1%, 5% y 8% provienen de una ejecución separada detenida al 10%, aunque con la misma semilla y orden de datos, por lo que las curvas de pérdida concuerdan con una tolerancia de 2.15e-2. No se emplearon técnicas como RLHF o DPO; es un SFT puro.

## Capacidades

- Generación de texto y razonamiento matemático: el modelo es capaz de resolver problemas de GSM8K y MATH500, con una precisión que mejora a lo largo del entrenamiento (GSM8K pasa de 75.89 a 79.30).
- Fine-tune completo: cada checkpoint contiene los pesos íntegros, no adaptadores LoRA, lo que facilita el análisis de la trayectoria.
- Propósito de investigación: diseñado para estudiar la detección de destilación y la transferencia de conocimiento profesor-estudiante, no como modelo de producción.
- Sin capacidades especiales: no se documentan tool calling, agentes, visión ni audio. Es un modelo de texto puro.
- Multilingüismo: no se especifica, aunque el modelo base Qwen2.5 soporta múltiples idiomas; no hay datos sobre el rendimiento en lenguas distintas del inglés.

## Casos de uso

- Investigación en detección de destilación: el modelo permite reproducir el método de detección basado en referencias descrito en el artículo, comparando las respuestas del estudiante con las del profesor para identificar si un modelo ha sido destilado.
- Análisis de curvas de aprendizaje: los checkpoints intermedios permiten estudiar en qué momento del entrenamiento el estudiante adquiere comportamientos específicos del profesor, como el estilo de razonamiento o la longitud de las respuestas.
- Evaluación de la transferencia de conocimiento: se puede medir cómo mejora la precisión en tareas de razonamiento matemático (GSM8K, MATH500) a lo largo del SFT, y correlacionarlo con la pérdida y otros hiperparámetros.
- Comparación de estrategias de destilación: al existir variantes con diferentes datasets (s1, OMI-1K) y tamaños (1.5B, 3B), se pueden contrastar los efectos de la elección del profesor y del conjunto de prompts.
- Estudio de la estabilidad del entrenamiento: la trayectoria de pérdida y precisión permite analizar la convergencia, el sobreajuste o la aparición de truncamientos en la generación.
- Reproducción de resultados académicos: sirve como referencia para verificar los hallazgos del artículo arXiv:2607.09692 y para futuras extensiones del método.

## Benchmarks y rendimiento

La model card proporciona resultados de precisión en GSM8K (4-shot) y MATH500 (zero-shot) para cada punto de la trayectoria, con greedy decoding y un presupuesto de generación de 16.384 tokens. Se indica que en MATH500 muchos puntos superan el 10% de muestras truncadas, por lo que esos valores son cotas inferiores.

| % de entrenamiento | paso | GSM8K | MATH500 |
|---|---|---|---|
| 1% | 2 | 75.36 | 40.20 |
| 5% | 9 | 76.19 | 41.80 |
| 8% | 15 | 75.28 | 48.20 * |
| 10% | 19 | 76.80 | 50.80 * |
| 20% | 38 | 78.17 | 50.40 * |
| 30% | 57 | 77.94 | 50.20 * |
| 40% | 76 | 78.32 | 51.60 * |
| 50% | 94 | 78.85 | 51.40 * |
| 60% | 113 | 78.77 | 52.60 * |
| 70% | 132 | 79.68 | 49.40 * |
| 80% | 151 | 78.77 | 52.20 |
| 90% | 170 | 78.77 | 50.20 * |
| 100% | 189 | 79.30 | 52.20 * |

`*` = más del 10% de las muestras agotaron el presupuesto de 16.384 tokens, por lo que el valor es una cota inferior.

El modelo base sin entrenar obtiene 75.89 en GSM8K, y el final 79.30 (+3.41). Un test de McNemar pareado sobre 1.319 preguntas de GSM8K da b=70 (base correcto, estudiante incorrecto) y c=115 (base incorrecto, estudiante correcto), con p=0.00094, lo que indica una mejora estadísticamente significativa.

## Requisitos de hardware

- Al ser un modelo de aproximadamente 3.000 millones de parámetros, la inferencia en bf16 requiere unos 6-8 GB de VRAM, dependiendo de la longitud de la secuencia.
- Con cuantización de 4 bits (no proporcionada en el repositorio, pero aplicable al modelo base), cabría en GPUs con 2-3 GB de VRAM, como una NVIDIA GTX 1650 o similar.
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB (RTX 3060, RTX 4060, etc.) para inferencia en bf16; para entrenamiento o evaluación de los checkpoints completos se necesitaría más memoria, aunque el fine-tune se realizó con gradient checkpointing.
- Opciones de despliegue: al ser un modelo estándar de transformers, se puede cargar con Hugging Face Transformers, vLLM, llama.cpp (si se convierten los pesos a GGUF) u Ollama.
- Latencia y throughput: no se proporcionan datos oficiales; en una GPU moderna, un modelo de 3B genera decenas de tokens por segundo en bf16.

## Comparativa con modelos similares

Existen otros repositorios del mismo autor con la misma finalidad de detección de destilación, así como el modelo base original. La comparación se centra en la tarea y el tamaño.

| Modelo | Parámetros | Dataset de destilación | Licencia | Propósito |
|---|---|---|---|---|
| DistillDetect-traj-Qwen2.5-3B-from-Llama-3.3-70B-Instruct-s1 | 3B | s1 (1K prompts) | qwen-research | Trayectoria de entrenamiento para detección de destilación |
| DistillDetect-Qwen2.5-3B-from-Llama-3.3-70B-Instruct-s1 | 3B | s1 (1K prompts) | qwen-research | Modelo final (end-of-training) para detección de destilación |
| DistillDetect-Qwen2.5-1.5B-from-Llama-3.3-70B-Instruct-s1 | 1.5B | s1 (1K prompts) | apache-2.0 | Modelo final, variante más pequeña |
| DistillDetect-Qwen2.5-3B-from-Llama-3.3-70B-Instruct-OMI-1K | 3B | OMI-1K | qwen-research | Modelo final con otro dataset |
| Qwen/Qwen2.5-3B (base) | 3B | - | Apache 2.0 (base) | Modelo general de propósito general |

La comparativa muestra que este repositorio es único por ofrecer múltiples checkpoints intermedios, mientras que los demás solo publican el modelo final. La licencia qwen-research es más restrictiva que la apache-2.0 de la variante de 1.5B.

## Limitaciones y advertencias

- Modelo de investigación, no apto para uso en producción: la model card indica explícitamente que está destinado al estudio de la detección de destilación, no como modelo general.
- Licencia qwen-research: restringe el uso comercial y puede imponer condiciones adicionales; hay que revisar el texto completo de la licencia.
- Sesgos y alucinaciones: al ser un modelo destilado de un profesor de 70B, puede heredar sesgos del profesor y del dataset s1; no se han evaluado sesgos específicos.
- Truncamiento en generación: en MATH500, más del 86% de los puntos de la trayectoria superan el 10% de muestras truncadas con el presupuesto de 16.384 tokens, lo que subestima la precisión real.
- Variabilidad estadística: se usó una única semilla; diferencias inferiores a un punto porcentual no son resolubles.
- Checkpoints combinados: los puntos del 1%, 5% y 8% provienen de una ejecución separada, aunque con la misma semilla y orden de datos; las curvas de pérdida no coinciden exactamente.
- Sin soporte de tool calling ni agentes: no se documentan capacidades más allá de la generación de texto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/francescortu/DistillDetect-traj-Qwen2.5-3B-from-Llama-3.3-70B-Instruct-s1
- Modelo final (end-of-training): https://huggingface.co/francescortu/DistillDetect-Qwen2.5-3B-from-Llama-3.3-70B-Instruct-s1
- Variante 1.5B: https://huggingface.co/francescortu/DistillDetect-Qwen2.5-1.5B-from-Llama-3.3-70B-Instruct-s1
- Variante con OMI-1K: https://huggingface.co/francescortu/DistillDetect-Qwen2.5-3B-from-Llama-3.3-70B-Instruct-OMI-1K
- Artículo de referencia: https://arxiv.org/abs/2607.09692
- Modelo base Qwen2.5-3B: https://huggingface.co/Qwen/Qwen2.5-3B
