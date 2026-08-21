# francescortu/DistillDetect-traj-Qwen2.5-1.5B-from-Llama-3.3-70B-Instruct-OMI-918-COT

## Resumen

DistillDetect-traj-Qwen2.5-1.5B-from-Llama-3.3-70B-Instruct-OMI-918-COT es un conjunto de 13 checkpoints de entrenamiento que documentan la trayectoria completa de un fine-tuning supervisado (SFT) sobre el modelo base Qwen2.5-1.5B. El objetivo es reproducir el estudio *Reference-Based Distillation Detection in LLMs* (arXiv:2607.09692), que investiga cómo un modelo estudiante adquiere el comportamiento de un profesor durante la destilación. En este caso, el profesor es Nvidia-Llama-3.3-70B-Instruct y el estudiante se entrena sobre 918 prompts del dataset OpenMathInstruct-2 con la plantilla OMI-COT.

El repositorio publica pesos completos (no LoRA) en 13 puntos del schedule de optimización (1%, 5%, 8%, 10%, 20%, ... 100%), junto con evaluaciones crudas, resultados de precisión y metadatos de entrenamiento. El modelo final alcanza 68.61% en GSM8K (4-shot) frente al 65.88% del base sin entrenar, una mejora estadísticamente significativa según la prueba de McNemar (p=0.015). Está pensado exclusivamente para investigación sobre detección de destilación, no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura Qwen2.5, densa) |
| Parametros totales | 1.5B |
| Parametros activos | 1.5B (modelo denso, todos activos) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5 soporta hasta 128K tokens; el fine-tune usó block size 4096 y la evaluación un presupuesto de generación de 16,384 tokens) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, cuantizables a posteriori con GPTQ, AWQ, GGUF, etc.) |
| Idiomas soportados | No disponible (el modelo base Qwen2.5 es multilingüe, pero el fine-tune se realizó sobre datos en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B, un transformer decoder-only denso preentrenado por Alibaba sobre hasta 18 billones de tokens. Sobre esta base se realiza un fine-tuning completo (no LoRA) con las respuestas de Nvidia-Llama-3.3-70B-Instruct a 918 prompts de OpenMathInstruct-2, usando la plantilla de prompt `Problem:\n{question}\n\nSolution:\n`. La receta de entrenamiento replica la del paper original: 3 épocas, learning rate 1e-5 con schedule coseno y 5% de warmup, batch efectivo de 16 (4 por dispositivo × 4 de grad-accum), block size 4096, precisión bf16, gradient checkpointing y función de pérdida solo sobre los tokens de respuesta. La semilla es fija (42).

La innovación principal no está en la arquitectura, sino en la metodología: se publican 13 checkpoints intermedios (1%, 5%, 8%, 10%, 20%, 30%, 40%, 50%, 60%, 70%, 80%, 90%, 100% del schedule) para permitir estudiar la adquisición gradual del comportamiento del profesor. Los checkpoints del 1%, 5% y 8% provienen de una ejecución separada detenida al 10%, aunque con la misma semilla y orden de datos; las trazas de pérdida difieren en 2.15e-2, por lo que la curva está empalmada de dos procesos.

## Capacidades

- Generación de texto y razonamiento matemático: entrenado específicamente para resolver problemas de matemáticas en formato pregunta-solución, con evaluación en GSM8K y MATH500.
- Seguimiento de instrucciones en formato estructurado: respeta el patrón `Problem:\n...\n\nSolution:\n`.
- Capacidad de análisis de trayectoria: al publicar checkpoints intermedios, permite estudiar la evolución de la precisión y el comportamiento a lo largo del entrenamiento.
- No soporta tool calling ni function calling: no se menciona en la documentación y el entrenamiento no incluye este tipo de datos.
- No tiene capacidades de agente ni multi-step reasoning más allá del razonamiento matemático secuencial.
- No incluye modo thinking explícito, visión ni audio.
- Multilingüe limitado: el modelo base es multilingüe, pero el fine-tune se realizó sobre datos en inglés, por lo que el rendimiento en otros idiomas no está garantizado.

## Casos de uso

- Investigación en detección de destilación: el repositorio está diseñado para reproducir el estudio arXiv:2607.09692, permitiendo a investigadores analizar cómo un modelo estudiante copia el comportamiento de un profesor a lo largo del entrenamiento.
- Estudio de la dinámica de aprendizaje en SFT: los 13 checkpoints permiten trazar curvas de precisión (GSM8K, MATH500) y pérdida en función del porcentaje de entrenamiento, útil para entender la convergencia y el sobreajuste.
- Evaluación de checkpoints intermedios: se pueden cargar los pesos en cualquier punto (por ejemplo, 20% o 50%) para medir la capacidad de razonamiento matemático en fases tempranas del fine-tuning.
- Reproducción de experimentos de destilación: el repositorio incluye `results.json` y `trajectory.json` con el grid de pasos, historial de pérdida e hiperparámetros, facilitando la comparación con otros métodos de destilación.
- Análisis de truncación en generación larga: los datos de evaluación incluyen registros por pregunta, lo que permite estudiar por qué algunos problemas agotan el presupuesto de 16,384 tokens y cómo afecta a la precisión medida.
- Base para fine-tuning adicional en tareas matemáticas: aunque no es su propósito principal, el modelo final podría servir como punto de partida para experimentos de transferencia en dominios numéricos, dado su rendimiento en GSM8K.

## Benchmarks y rendimiento

La siguiente tabla muestra la precisión en GSM8K (4-shot) y MATH500 (zero-shot) en cada punto del entrenamiento, con decodificación greedy y presupuesto de generación de 16,384 tokens. Los valores con asterisco en MATH500 son límites inferiores porque más del 10% de las muestras agotaron el presupuesto.

| % de entrenamiento | Paso | GSM8K | MATH500 |
|---|---|---|---|
| 1% | 2 | 66.79 | 33.80 * |
| 5% | 9 | 66.64 | 37.20 * |
| 8% | 14 | 67.48 | 43.40 * |
| 10% | 17 | 68.23 | 44.20 * |
| 20% | 35 | 68.92 | 45.60 * |
| 30% | 52 | 68.69 | 45.00 * |
| 40% | 70 | 68.01 | 47.40 * |
| 50% | 87 | 68.16 | 46.00 * |
| 60% | 104 | 67.70 | 45.80 * |
| 70% | 122 | 68.01 | 47.40 * |
| 80% | 139 | 68.01 | 48.60 * |
| 90% | 157 | 68.23 | 46.20 * |
| 100% | 174 | 68.61 | 47.60 * |

El modelo base sin entrenar obtiene 65.88 en GSM8K, por lo que la mejora final es de +2.73 puntos. La prueba de McNemar sobre 1,319 preguntas de GSM8K da p=0.015, indicando significancia estadística. No se han publicado comparaciones con otros modelos de la misma categoría en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 1.5B parámetros. En bf16 ocupa aproximadamente 3 GB, en int8 ~1.5 GB y en 4-bit ~0.8 GB. El tamaño del repositorio (3.1 GB) confirma los pesos en bf16.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en bf16 (por ejemplo, RTX 3060, RTX 4060, RTX 4090). Con cuantización 4-bit, puede caber en GPUs con 2 GB o incluso en CPU.
- Compatibilidad con GPU de consumo: sí, es un modelo pequeño que se ejecuta sin problemas en hardware consumer.
- Opciones de despliegue: compatible con transformers, vLLM, TGI, llama.cpp, Ollama y cualquier framework que soporte safetensors y arquitectura Qwen2.5.
- Latencia y throughput: no disponibles en la documentación. Como referencia, un modelo de 1.5B en una RTX 4090 suele generar decenas de tokens por segundo, pero no hay datos específicos para este fine-tune.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso previsto |
|---|---|---|---|---|
| DistillDetect-traj-Qwen2.5-1.5B (este) | 1.5B | No disponible (base 128K) | Apache 2.0 | Investigación en detección de destilación |
| DistillDetect-Qwen2.5-1.5B-from-Llama-3.3-70B-Instruct-OMI-918-COT (modelo final sin traj) | 1.5B | No disponible | Apache 2.0 | Investigación en detección de destilación |
| Qwen2.5-1.5B-Instruct (base) | 1.5B | 128K | Apache 2.0 | Propósito general, chat e instrucciones |

No se dispone de benchmarks comparativos entre estos modelos en la información proporcionada. El modelo final (sin traj) es el mismo que el checkpoint al 100% de este repositorio, por lo que su rendimiento es idéntico.

## Limitaciones y advertencias

- No es un modelo de propósito general: está diseñado exclusivamente para investigación sobre detección de destilación. Su uso en producción o en tareas fuera del razonamiento matemático no está recomendado.
- Los resultados de MATH500 son límites inferiores: más del 10% de las muestras agotaron el presupuesto de 16,384 tokens en la mayoría de los puntos, por lo que la precisión real podría ser mayor.
- Single seed: todos los resultados provienen de una única semilla (42). Diferencias inferiores a un punto porcentual no son estadísticamente resolubles.
- Los checkpoints del 1%, 5% y 8% provienen de una ejecución separada detenida al 10%. Aunque la semilla y el orden de datos son fijos, las trazas de pérdida difieren en 2.15e-2, lo que introduce una pequeña inconsistencia en la curva.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar razonamientos incorrectos o inventar pasos en problemas matemáticos, especialmente en checkpoints tempranos.
- Sesgos del dataset: OpenMathInstruct-2 se centra en matemáticas en inglés; el modelo puede tener un rendimiento deficiente en otros idiomas o dominios.
- Licencia Apache 2.0 permite uso comercial, pero el autor advierte explícitamente que el modelo no está pensado para ello.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/francescortu/DistillDetect-traj-Qwen2.5-1.5B-from-Llama-3.3-70B-Instruct-OMI-918-COT
- Modelo final (sin trayectoria): https://huggingface.co/francescortu/DistillDetect-Qwen2.5-1.5B-from-Llama-3.3-70B-Instruct-OMI-918-COT
- Variante con 1K prompts: https://huggingface.co/francescortu/DistillDetect-Qwen2.5-1.5B-from-Llama-3.3-70B-Instruct-OMI-1K
- Paper de referencia: https://arxiv.org/abs/2607.09692
- Modelo base Qwen2.5: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Documentación de Qwen2.5 en GitHub: https://github.com/mx4ai/qwen2.5
