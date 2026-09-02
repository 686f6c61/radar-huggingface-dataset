# logan7000/llm-math345-gt-granite2b-full

## Resumen

El modelo `logan7000/llm-math345-gt-granite2b-full` es un fine-tuning del modelo `granite-3.3-2b-instruct` de IBM, desarrollado por Logan Yang (usuario `logan7000`). El objetivo es mejorar el rendimiento del modelo base en problemas matemáticos del dataset MATH345 mediante entrenamiento con GRPO (Group Relative Policy Optimization), utilizando la respuesta correcta como señal de recompensa (ground-truth reward). El repositorio consolida dos versiones previas (`-best` y `-endpoint`) y contiene los checkpoints de entrenamiento, incluyendo el mejor modelo por validación (step 40) y el modelo final (step 136).

Este modelo es relevante para quienes investigan técnicas de optimización de preferencias en modelos de lenguaje pequeños (2B parámetros), especialmente en el dominio matemático. Sin embargo, la información pública es muy limitada: no se especifican licencia, idiomas, ni resultados de benchmarks. El repositorio tiene un tamaño de 10.1 GB, lo que sugiere que incluye múltiples checkpoints o pesos en BF16, aunque el número exacto de parámetros entrenados no está documentado (el repo `-best` indica 166k parámetros, probablemente adaptadores tipo LoRA).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en `granite-3.3-2b-instruct` de IBM) |
| Parametros totales | no disponible (el modelo base tiene 2B; el repo `-best` indica 166k params, probablemente adaptadores) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo base) |
| Tipos de cuantizacion | BF16 (según el repo `-best`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del modelo `granite-3.3-2b-instruct`, un transformer decoder-only de 2 mil millones de parámetros desarrollado por IBM. El entrenamiento se realizó con GRPO (Group Relative Policy Optimization), una variante de RLHF que utiliza grupos de respuestas para estimar ventajas relativas. La recompensa se basa en la respuesta correcta (ground-truth) del dataset MATH345, sin ningún modelo de recompensa adicional. Se empleó la pérdida Bnpo (probablemente una variante de loss para RL), con los siguientes hiperparámetros: 136 pasos (equivalente a 1 época), 128 prompts por actualización, K=12 (número de respuestas por prompt), beta=0 (sin regularización KL), learning rate 3e-6 y Adam beta2=0.95. La evaluación se realizó cada 10 pasos. El repositorio contiene dos versiones: `best/` (mejor modelo por validación, step 40) y `endpoint/` (step 136).

No se proporcionan detalles sobre la composición del dataset MATH345 ni sobre el proceso de entrenamiento más allá de lo descrito. Tampoco se indica si se aplicaron técnicas de cuantización o destilación posteriores.

## Capacidades

- Razonamiento matemático: el modelo está específicamente entrenado para mejorar el rendimiento en problemas del dataset MATH345, que cubre diversas áreas de matemáticas (álgebra, geometría, probabilidad, etc.).
- Generación de texto: al estar basado en un modelo instruct, conserva la capacidad de seguir instrucciones y generar texto coherente, aunque no hay evidencia publicada de su rendimiento general.
- Tool calling y funciones: no se menciona soporte específico; depende del modelo base.
- Capacidades multilingües: no disponibles.
- Modo pensamiento (thinking): no se menciona.

## Casos de uso

- Investigación en RLHF/GRPO: el modelo sirve como ejemplo de aplicación de GRPO con recompensa basada en ground-truth sobre un modelo pequeño. Puede usarse para estudiar el efecto de esta técnica en el rendimiento matemático.
- Benchmarking de fine-tuning matemático: investigadores pueden evaluar este modelo frente a otros fine-tunes de MATH345 para comparar estrategias de entrenamiento.
- Prototipado de asistentes matemáticos: aunque sin benchmarks, podría servir como base para un asistente de resolución de problemas matemáticos en entornos de investigación.
- Análisis de sobreajuste: al estar entrenado en un solo dataset, es útil para estudiar la generalización a otros problemas matemáticos.
- Comparación de checkpoints: el repositorio incluye el mejor modelo por validación y el modelo final, permitiendo analizar la evolución del rendimiento durante el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas de MMLU, GSM8K, MATH u otros conjuntos de evaluación. Tampoco hay comparaciones con el modelo base o con otros fine-tunes.

## Requisitos de hardware

- Tamaño del repositorio: 10.1 GB, lo que sugiere que contiene múltiples checkpoints o pesos en BF16. Un modelo de 2B en BF16 ocupa aproximadamente 4 GB, por lo que el repositorio probablemente incluye varios archivos (best, endpoint, optimizer states, etc.).
- Para inferencia con el modelo completo en BF16: se estima entre 4 y 6 GB de VRAM, dependiendo de la longitud de contexto y del batch size. Una GPU con 8 GB de VRAM (por ejemplo, RTX 3070/4060) podría ser suficiente para inferencia básica.
- Opciones de despliegue: al ser un modelo estándar de HuggingFace, puede usarse con transformers, vLLM, llama.cpp (si se convierte a GGUF) u Ollama (con conversión previa). No se proporciona configuración específica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El modelo base `granite-3.3-2b-instruct` es comparable a otros modelos de 2B como Qwen2.5-1.5B-Instruct o Llama-3.2-1B-Instruct, pero no hay datos de rendimiento de este fine-tune para contrastar. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Sin licencia especificada: el repositorio no indica licencia, lo que impide su uso comercial o incluso académico sin autorización explícita del autor.
- Sin evaluación pública: no hay benchmarks ni métricas de rendimiento, por lo que no se puede garantizar su calidad en tareas matemáticas o generales.
- Sobreajuste potencial: el entrenamiento se realizó únicamente sobre MATH345 (136 pasos, 1 época), lo que puede provocar sobreajuste a ese dataset y mala generalización a otros problemas.
- Información incompleta: no se detallan la arquitectura exacta del adaptador, el número total de parámetros entrenados ni el procedimiento de fusión con el modelo base.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar respuestas incorrectas o inventadas, especialmente en problemas matemáticos complejos.
- Dependencia del modelo base: las capacidades y limitaciones del modelo base `granite-3.3-2b-instruct` se heredan, pero no se documentan aquí.

## Enlaces

- Repositorio principal: https://huggingface.co/logan7000/llm-math345-gt-granite2b-full
- Repositorio de la versión `-best`: https://huggingface.co/logan7000/llm-math345-gt-granite2b-best
- Perfil del autor: https://huggingface.co/logan7000
