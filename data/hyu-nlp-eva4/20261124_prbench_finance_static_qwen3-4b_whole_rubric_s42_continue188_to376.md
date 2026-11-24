# hyu-nlp-eva4/20261124_prbench_finance_static_qwen3-4b_whole_rubric_s42_continue188_to376

## Resumen

Este repositorio aloja un experimento de ajuste fino continuado sobre el modelo Qwen3-4B-Instruct-2507, desarrollado por el grupo hyu-nlp-eva4. No se trata de un modelo nuevo con arquitectura propia, sino de una continuación del entrenamiento de un checkpoint intermedio (paso 188) de un experimento previo de ajuste con GRPO orientado a tareas de finanzas dentro del conjunto de evaluación PRBench. El objetivo declarado es comprobar si un entrenamiento adicional (188 actualizaciones más, hasta el paso 376) mejora el rendimiento en dicha tarea respecto a la línea base heredada.

El modelo parte de Qwen3-4B-Instruct-2507, un transformer denso de aproximadamente 4.000 millones de parámetros con una ventana de contexto amplia (heredada del modelo base de la familia Qwen3). El ajuste emplea GRPO (Group Relative Policy Optimization) con 32 prompts por lote y 8 respuestas por prompt, tasa de aprendizaje de 1e-6 y un juez fijo basado en Qwen3-32B que evalúa la rúbrica completa. La KL está desactivada, igual que en los pasos 117-188 del experimento padre.

Su relevancia es fundamentalmente metodológica: documenta de forma reproducible una trayectoria de entrenamiento por refuerzo con evaluación mediante juez LLM sobre un dominio especializado (finanzas). No obstante, conviene subrayar que se trata de un artefacto de investigación con cero descargas y sin model card de uso general, por lo que no está pensado como modelo de producción. Los pesos se distribuyen como checkpoints intermedios en subcarpetas, no en la raíz del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-4B-Instruct-2507) |
| Parametros totales | ~4.000 millones (modelo base Qwen3-4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no documentadas) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (checkpoints en subcarpetas `checkpoints/global_step_000189` en adelante) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3-4B-Instruct-2507: un transformer denso de tipo decoder-only con atención estándar y aproximadamente 4.000 millones de parámetros. Este repositorio no introduce cambios arquitectónicos; el interés técnico reside en el procedimiento de entrenamiento. Se parte del checkpoint del paso 188 del experimento padre (revisión `a97b3ca9aafd62a8d8f81ed4fb0b6caba0b1a08a`) y se aplican 188 actualizaciones adicionales (pasos 189-376) con GRPO.

Los datos son los mismos que en el experimento padre: 540 ejemplos de entrenamiento de finanzas y 60 de validación reservada, con semilla 42. La configuración de RL incluye 32 prompts por lote, 8 respuestas generadas por prompt, tasa de aprendizaje de 1e-6 y KL desactivada. La señal de recompensa proviene de un juez fijo Qwen3-32B que califica la rúbrica completa y comparte GPU con la política mediante un mecanismo de suspensión (sleepable judge). La línea base en el paso 188 fue una recompensa media de 0,510227 y una fracción de respuestas con puntuación superior a 0,5 del 50,0 %; el paso 188 no se reevalúa antes del entrenamiento continuado, de modo que la comparación se apoya en esa validación heredada.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen3-4B-Instruct-2507.
- Razonamiento orientado a tareas financieras dentro del formato de evaluación PRBench (el objetivo específico del ajuste).
- Capacidad de instrucción conversacional (modelo base de la variante Instruct).
- Soporte de tool calling y function calling: no documentado en la información proporcionada para este ajuste (depende del modelo base, pero no se confirma aquí).
- Capacidades de agente y razonamiento multi-paso: no documentadas específicamente para este checkpoint.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Investigación en aprendizaje por refuerzo: el checkpoint sirve como referencia reproducible para estudiar el efecto de prolongar el entrenamiento GRPO más allá del paso 188 sobre una misma trayectoria y partición de datos.
- Evaluación de jueces LLM como recompensa: permite analizar cómo un juez fijo (Qwen3-32B) con calificación de rúbrica completa guía la política en dominios especializados.
- Análisis de dominios financieros acotados: útil para experimentar con preguntas y tareas de finanzas en el marco de PRBench, siempre con validación humana adicional.
- Reproducción de experimentos: al conservar metadatos, revisión del padre y configuración exacta, facilita la réplica de resultados por otros grupos.
- Estudio de estabilidad del entrenamiento: comparar los checkpoints intermedios (cada 10 pasos) permite medir deriva de recompensa y sobreajuste a la rúbrica del juez.
- Base para ajustes posteriores: puede servir como punto de partida para nuevos experimentos de RL o SFT sobre el mismo dominio, aunque requiere revisar licencia y calidad antes de cualquier uso real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento documentado es la validación heredada del paso 188: recompensa media de 0,510227 y fracción de respuestas con puntuación superior a 0,5 del 50,0 %. No se proporcionan resultados del paso 376 ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16/bf16, aproximadamente 8-9 GB para los pesos de un modelo de 4.000 millones de parámetros, más memoria para el contexto y el runtime.
- En cuantización de 8 bits, en torno a 4-5 GB; en 4 bits, en torno a 2,5-3 GB (estimaciones orientativas, no confirmadas en la información proporcionada).
- GPU recomendadas: A100, H100 o L40S para entrenamiento e inferencia a gran escala; RTX 4090 o RTX 3090 suficientes para inferencia en precisión reducida.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090, RTX 3090 e incluso tarjetas con 8-12 GB si se cuantiza, aunque no se documenta oficialmente.
- Opciones de despliegue: transformers (librería declarada); vLLM, llama.cpp, Ollama o TGI no están documentados para este checkpoint y requerirían conversión de formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (hyu-nlp-eva4) | ~4.000 M | no disponible | GRPO sobre finanzas (PRBench) | no disponible | Repositorio de investigación, 0 descargas |
| Qwen/Qwen3-4B-Instruct-2507 | ~4.000 M | no disponible en esta ficha | Modelo base instructivo general | no disponible en esta ficha | Público en Hugging Face |
| Qwen3-32B (juez del experimento) | ~32.000 M | no disponible | Modelo de evaluación | no disponible en esta ficha | Público en Hugging Face |

La comparación relevante es con el modelo base Qwen3-4B-Instruct-2507, del que este checkpoint hereda arquitectura y pesos iniciales; las diferencias se limitan al ajuste GRPO sobre el conjunto de finanzas. No se dispone de datos de rendimiento comparativos entre ambos en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: cero descargas y sin model card de uso general; no está pensado para producción.
- Licencia no disponible: no puede confirmarse el uso comercial; debe verificarse la licencia del modelo base Qwen3-4B-Instruct-2507 antes de cualquier despliegue.
- Riesgo de sobreajuste al juez: la recompensa proviene de un juez LLM fijo con rúbrica completa, lo que puede incentivar respuestas que satisfacen al juez sin mejorar la calidad real.
- Dominio muy acotado: entrenado sobre 540 ejemplos de finanzas; el rendimiento fuera de ese dominio no está caracterizado.
- Idiomas no documentados: se desconoce el comportamiento multilingüe tras el ajuste.
- Sesgos y alucinaciones: no evaluados en la información proporcionada; en un dominio financiero el riesgo de afirmaciones incorrectas es especialmente sensible.
- Checkpoints en subcarpetas: los pesos no están en la raíz del repositorio, lo que complica la carga directa con pipelines estándar.
- Sin resultados del paso 376: no se confirma que el entrenamiento adicional haya mejorado la línea base del paso 188.
- Repositorio de 16,1 GB: requiere espacio de almacenamiento considerable para su descarga completa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hyu-nlp-eva4/20261124_prbench_finance_static_qwen3-4b_whole_rubric_s42_continue188_to376
- Experimento padre (paso 188): https://huggingface.co/hyu-nlp-eva4/20261112_prbench_finance_static_qwen3-4b_whole_rubric_s42
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
