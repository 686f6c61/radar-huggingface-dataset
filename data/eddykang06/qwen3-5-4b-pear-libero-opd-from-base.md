# eddykang06/qwen3.5-4b-pear-libero-opd-from-base

## Resumen

Qwen3.5-4B PEAR LIBERO OPD es un ajuste fino del modelo base Qwen/Qwen3.5-4B orientado a robótica, concretamente al benchmark LIBERO de manipulación robótica. Lo desarrolla el usuario eddykang06 y forma parte del proyecto robot-distillation, cuyo objetivo es destilar las capacidades de un modelo profesor mucho mayor en un modelo pequeño que pueda desplegarse con requisitos de cómputo reducidos.

La técnica empleada es destilación on-policy (OPD) con divergencia KL inversa calculada token a token. El profesor es Qwen3.8-27B-PEAR-LIBERO_only, un modelo de 27.000 millones de parámetros ajustado específicamente para LIBERO, que genera los rollouts de entrenamiento recogidos en el dataset eddykang06/qwen3.8-27b-pear-libero-rollouts. El alumno parte del modelo base sin ajustar, no de un checkpoint ya especializado.

La relevancia del modelo radica en su planteamiento: comprimir en 4.000 millones de parámetros el comportamiento de un profesor casi siete veces mayor en una tarea de control robótico. No obstante, la model card indica explícitamente que los pesos aún no se han subido, por lo que el repositorio no contiene artefactos utilizables en el momento de redactar esta ficha. La información disponible sobre arquitectura interna, contexto, cuantización e idiomas es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-4B); detalles no disponibles |
| Parametros totales | 4.000 millones (aproximado, segun el nombre del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (la model card indica que los pesos no se han subido) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer decoder-only de aproximadamente 4.000 millones de parámetros del que no se detallan en la información proporcionada ni la configuración de capas, ni el mecanismo de atención, ni la ventana de contexto. Sobre esa base se aplica destilación on-policy: el alumno genera sus propias trayectorias y se optimiza minimizando la divergencia KL inversa frente a las distribuciones del profesor, token a token. Este esquema, a diferencia de la destilación offline clásica, alinea al alumno con los estados que él mismo visita durante la inferencia, lo que suele reducir el desajuste entre entrenamiento y despliegue.

El profesor es Qwen3.8-27B-PEAR-LIBERO_only, un modelo de 27.000 millones de parámetros ajustado para LIBERO, operado en modo de esfuerzo xhigh durante la generación de rollouts. Los datos de entrenamiento proceden del dataset eddykang06/qwen3.8-27b-pear-libero-rollouts. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, la presencia de RLHF o DPO, ni hiperparámetros como tasa de aprendizaje, tamaño de lote o número de pasos.

## Capacidades

- Control robótico en tareas de manipulación del benchmark LIBERO, presumiblemente mediante generación de acciones o políticas condicionadas a observaciones.
- Destilación de comportamiento: reproduce el estilo de decisión del profesor de 27.000 millones de parámetros con un modelo de 4.000 millones.
- Generación de texto y razonamiento heredados del modelo base Qwen3.5-4B, aunque no se documenta si el ajuste los preserva o los degrada.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Evaluación de políticas robóticas en LIBERO: el modelo puede emplearse como política destilada para ejecutar las tareas de manipulación del benchmark y comparar su tasa de éxito frente al profesor de 27B, midiendo la pérdida de rendimiento por la compresión de parámetros.
- Despliegue en hardware de borde para robótica: con 4.000 millones de parámetros, el modelo es candidato a ejecutarse en GPUs de consumo o en plataformas embebidas con suficiente VRAM, algo inviable para el profesor de 27B.
- Investigación en destilación on-policy: sirve como caso de estudio reproducible de OPD con KL inversa por token sobre un modelo base, útil para analizar estabilidad del entrenamiento y calidad de los rollouts.
- Generación de datos sintéticos de trayectorias: las políticas del alumno pueden emplearse para producir rollouts adicionales y ampliar el dataset de entrenamiento en experimentos posteriores.
- Prototipado rápido de pipelines de imitación: al partir del modelo base y no de un checkpoint especializado, permite estudiar cuánto conocimiento robótico se transfiere exclusivamente vía destilación.
- Integración en el proyecto robot-distillation: el modelo encaja como eslabón de una cadena de destilación de profesor grande a alumno pequeño dentro de un marco de experimentación abierto.
- Base para ajuste específico de tareas: al ser un modelo de 4B, puede recibir ajustes posteriores con menos recursos que el profesor para tareas concretas de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un transformer de 4.000 millones de parámetros, las estimaciones habituales son de aproximadamente 8 GB en FP16, 4-5 GB en cuantización de 8 bits y 2,5-3 GB en 4 bits, sin contar caché KV ni overhead del runtime.
- GPU recomendadas: no especificadas por el autor; por tamaño, cabría en RTX 4090, RTX 3090, A10, L4 y A100/H100 con holgura.
- Cabe en GPU de consumo: previsiblemente sí en GPUs con 8 GB o más de VRAM en FP16, y en GPUs de 4-6 GB con cuantización, siempre que se confirmen los formatos disponibles.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama si se publican pesos en safetensors o GGUF; no confirmado por el autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B PEAR LIBERO OPD (este) | ~4B | no disponible | Destilacion OPD desde profesor de 27B en LIBERO | no disponible | Pesos no subidos |
| Qwen3.8-27B-PEAR-LIBERO_only (profesor) | 27B | no disponible | Ajuste directo en LIBERO | no disponible | Publicado en Hugging Face |
| Qwen/Qwen3.5-4B (base) | ~4B | no disponible | Modelo generalista sin ajuste robótico | no disponible | Publicado en Hugging Face |

La comparación cuantitativa de rendimiento entre estos tres modelos no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Los pesos no están subidos al repositorio: la model card indica explícitamente "Not uploaded yet", por lo que el modelo no es utilizable actualmente.
- Licencia no especificada: no puede determinarse si se permite uso comercial; debe verificarse la licencia del modelo base Qwen3.5-4B y la del profesor.
- Especialización estrecha: el ajuste se limita a LIBERO, por lo que el rendimiento fuera de ese benchmark es incierto.
- Riesgo de degradación del modelo base: la destilación puede erosionar capacidades generales de texto y razonamiento del Qwen3.5-4B original; no se documenta ninguna evaluación al respecto.
- Sin datos de benchmarks: no hay evidencia publicada de tasa de éxito en LIBERO ni de comparación con el profesor.
- Idiomas y sesgos: no documentados; al ser un modelo orientado a robótica, la cobertura multilingüe y el comportamiento en dominios sensibles son desconocidos.
- Riesgo de alucinación en texto: no evaluado; si se usa fuera de robótica, debe tratarse con las precauciones habituales de un modelo de 4B.
- Reproducibilidad limitada: no se detallan hiperparámetros, número de tokens ni composición del dataset de rollouts.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eddykang06/qwen3.5-4b-pear-libero-opd-from-base
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Profesor: https://huggingface.co/mit-han-lab/Qwen3.8-27B-PEAR-LIBERO_only
- Dataset de rollouts: https://huggingface.co/datasets/eddykang06/qwen3.8-27b-pear-libero-rollouts
- Repositorio del proyecto: https://github.com/ericjkge/robot-distillation
