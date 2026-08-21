# francescortu/DistillDetect-traj-Qwen2.5-3B-from-gpt-oss-120b-s1

## Resumen

DistillDetect-traj-Qwen2.5-3B-from-gpt-oss-120b-s1 es un conjunto de checkpoints de entrenamiento que documenta la trayectoria completa de un proceso de destilación de conocimiento. El modelo base es Qwen2.5-3B, fine-tuneado de forma completa (no LoRA) sobre las respuestas generadas por el profesor GPT-OSS-120B para el conjunto de prompts s1 (1.000 preguntas). El repositorio publica 13 puntos intermedios del entrenamiento supervisado (desde el 1% hasta el 100% del schedule de optimización), lo que permite estudiar cómo el estudiante adquiere progresivamente el comportamiento del profesor.

Este trabajo acompaña la reproducción del artículo *Reference-Based Distillation Detection in LLMs* (arXiv:2607.09692), cuyo objetivo es detectar si un modelo ha sido destilado a partir de otro mediante análisis de las respuestas. La publicación de estos checkpoints intermedios es una contribución metodológica: en lugar de evaluar solo el modelo final, se analiza la evolución de la destilación a lo largo del entrenamiento. El modelo final alcanza una precisión de 81,35 en GSM8K (frente a 75,89 del base sin entrenar), una mejora estadísticamente significativa según la prueba de McNemar (p=3,1e-06).

No es un modelo de propósito general. Está pensado exclusivamente para investigación sobre detección de destilación y dinámica de aprendizaje. El repositorio incluye pesos completos en cada checkpoint, junto con los resultados de evaluación y los metadatos de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura Qwen2.5) |
| Parametros totales | 3B (modelo base Qwen2.5-3B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5-3B soporta hasta 128K, pero no se especifica para este fine-tune) |
| Tipos de cuantizacion | No especificado (pesos completos en safetensors, probablemente bf16) |
| Idiomas soportados | No disponible |
| Licencia | qwen-research (licencia de investigacion de Qwen) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo (full fine-tune, no LoRA) del transformer decoder-only Qwen2.5-3B. La receta de entrenamiento, verificada contra el Apéndice A del artículo, consiste en SFT durante 3 épocas, con learning rate 1e-5, schedule coseno con 5% de warmup, batch efectivo de 16 (per-device batch 4 × grad-accum 4), block size de 4.096 tokens, precisión bf16, gradient checkpointing y pérdida calculada solo sobre los tokens de respuesta. El formato de prompt es `Problem:\n{question}\n\nSolution:\n`.

El dataset de entrenamiento es s1, compuesto por 1.000 prompts, y las respuestas del profesor provienen de GPT-OSS-120B. Se publican 13 checkpoints a lo largo del schedule de optimización (1%, 5%, 8%, 10%, 20%, 30%, 40%, 50%, 60%, 70%, 80%, 90% y 100%). Cada checkpoint contiene los pesos completos y el tokenizador. Los checkpoints del 1%, 5% y 8% provienen de una corrida separada detenida al 10%, aunque con la misma semilla y orden de datos, por lo que las curvas de pérdida coinciden con una tolerancia de 2,15e-2.

## Capacidades

- Generación de texto autoregresiva, especializada en razonamiento matemático (resolución de problemas de GSM8K y MATH500).
- Capacidad de seguir el formato de prompt específico del entrenamiento (`Problem:\n...\n\nSolution:\n`).
- Permite estudiar la evolución de la precisión a lo largo del entrenamiento, ya que cada checkpoint es evaluable de forma independiente.
- No soporta tool calling, ni function calling, ni capacidades multimodales (visión, audio).
- No está diseñado para tareas de propósito general como chat abierto, generación creativa o agentes autónomos.
- El modelo final muestra una mejora de +5,46 puntos en GSM8K respecto al base sin entrenar, con significancia estadística (p=3,1e-06).

## Casos de uso

- Investigación en detección de destilación: el conjunto de checkpoints permite entrenar y validar clasificadores que distingan si un modelo ha sido destilado a partir de un profesor concreto, usando las respuestas intermedias como señales.
- Análisis de la dinámica de adquisición de habilidades: se puede estudiar en qué punto del entrenamiento el estudiante empieza a imitar el comportamiento del profesor, correlacionando la precisión en GSM8K y MATH500 con el progreso del schedule.
- Reproducción de experimentos académicos: sirve como referencia para replicar los resultados del artículo arXiv:2607.09692, ya que incluye los metadatos de entrenamiento (trajectory.json) y las evaluaciones crudas (evals/).
- Comparación de estrategias de destilación: al disponer de checkpoints intermedios, se puede comparar la velocidad de convergencia de diferentes configuraciones de destilación (por ejemplo, con otros datasets o profesores).
- Estudio de la relación entre presupuesto de generación y precisión: los resultados incluyen anotaciones sobre cuándo se agota el presupuesto de 16.384 tokens, lo que permite analizar el efecto del límite de generación en modelos subentrenados.
- Validación de métricas de evaluación: los datos de GSM8K y MATH500 con greedy decoding y math_verify pueden usarse para contrastar nuevas métricas o protocolos de evaluación en modelos destilados.

## Benchmarks y rendimiento

La siguiente tabla resume la precisión en GSM8K (4-shot) y MATH500 (zero-shot) a lo largo del entrenamiento, con greedy decoding y un presupuesto de generación de 16.384 tokens. Los asteriscos indican que más del 10% de las muestras agotaron el presupuesto, por lo que el valor es un límite inferior.

| % de entrenamiento | Paso | GSM8K | MATH500 |
|---|---|---|---|
| 1% | 2 | 75,82 | 40,60 |
| 5% | 9 | 75,59 | 45,60 |
| 8% | 15 | 75,36 | 40,60 * |
| 10% | 19 | 75,59 | 40,60 * |
| 20% | 38 | 79,68 | 49,40 * |
| 30% | 57 | 81,12 | 48,80 * |
| 40% | 76 | 64,59 * | 43,60 * |
| 50% | 94 | 82,56 | 45,80 * |
| 60% | 113 | 81,65 | 46,20 * |
| 70% | 132 | 82,18 | 45,40 * |
| 80% | 151 | 82,34 | 42,60 * |
| 90% | 170 | 82,26 | 43,20 * |
| 100% | 189 | 81,35 | 44,00 * |

El modelo base sin entrenar obtiene 75,89 en GSM8K. La mejora final es de +5,46 puntos, con una prueba de McNemar sobre 1.319 preguntas que da p=3,1e-06. No se han publicado comparaciones con otros modelos destilados en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia de un solo checkpoint: aproximadamente 6 GB en bf16 (3B parámetros × 2 bytes). Con cuantización de 4 bits, se reduce a unos 2-3 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (por ejemplo, RTX 3070/4080, A10, L4). Para cuantización 4-bit, GPUs con 4 GB o más (RTX 3050, etc.).
- El repositorio completo ocupa 30,9 GB, pero cada checkpoint individual pesa aproximadamente 2,4 GB en bf16 (3B parámetros × 2 bytes + tokenizador).
- Opciones de despliegue: al ser un modelo de investigación, no se proporcionan configuraciones específicas para vLLM, Ollama o TGI. Se puede cargar con transformers estándar.
- Latencia y throughput: no especificados por el autor. Para un modelo de 3B en una GPU moderna, se espera una latencia de decodificación de decenas de milisegundos por token en bf16.

## Comparativa con modelos similares

No se dispone de comparaciones con otros modelos destilados en la información proporcionada. La única referencia directa es el modelo base Qwen2.5-3B, que sin entrenar obtiene 75,89 en GSM8K. El modelo final de este repositorio alcanza 81,35. Existen dos repositorios relacionados del mismo autor:

- `francescortu/DistillDetect-Qwen2.5-3B-from-gpt-oss-120b-s1`: contiene solo el checkpoint final (100% del entrenamiento).
- `francescortu/DistillDetect-Qwen2.5-3B-from-gpt-oss-120b-OMI-1K`: variante entrenada con el dataset OMI-1K en lugar de s1.

No se han publicado métricas comparativas entre estas variantes en la información disponible.

## Limitaciones y advertencias

- No es un modelo de propósito general. Está diseñado exclusivamente para investigación sobre detección de destilación y dinámica de entrenamiento.
- Los checkpoints del 1%, 5% y 8% provienen de una corrida separada (detenida al 10%), aunque con la misma semilla y orden de datos. Las curvas de pérdida coinciden con una tolerancia de 2,15e-2, no exactamente.
- Se utilizó una única semilla (seed 42). Diferencias de precisión inferiores a aproximadamente un punto no son resolubles.
- Muchos resultados de MATH500 (86% de todos los puntos) son límites inferiores porque más del 10% de las muestras agotaron el presupuesto de 16.384 tokens. Esto afecta especialmente a los checkpoints subentrenados, que tienden a divagar más.
- La licencia qwen-research restringe el uso a fines de investigación. No está permitido el uso comercial sin autorización explícita de Alibaba.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado en un conjunto reducido de prompts matemáticos, su comportamiento fuera de ese dominio es impredecible.
- Riesgo de alucinación en respuestas largas, especialmente en checkpoints tempranos que no han convergido.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/francescortu/DistillDetect-traj-Qwen2.5-3B-from-gpt-oss-120b-s1
- Artículo arXiv: https://arxiv.org/abs/2607.09692
- Modelo final (solo checkpoint 100%): https://huggingface.co/francescortu/DistillDetect-Qwen2.5-3B-from-gpt-oss-120b-s1
- Variante con OMI-1K: https://huggingface.co/francescortu/DistillDetect-Qwen2.5-3B-from-gpt-oss-120b-OMI-1K
- Modelo base Qwen2.5-3B: https://huggingface.co/Qwen/Qwen2.5-3B
