# eddykang06/qwen3.5-4b-pear-libero-sft-compressed

## Resumen

Qwen3.5-4B Pear Libero SFT Compressed es un ajuste fino por supervisión (SFT) del modelo base Qwen/Qwen3.5-4B, desarrollado por el usuario eddykang06. El modelo está especializado en robótica, concretamente en tareas del benchmark LIBERO, y se ha entrenado mediante destilación de razonamiento desde un modelo profesor de mayor tamaño, Qwen3.8-27B-PEAR-LIBERO_only, operado en modo de esfuerzo "xhigh". La propuesta central es comprimir el razonamiento generado por el profesor en las trayectorias exitosas y transferirlo a un modelo de 4.000 millones de parámetros.

El modelo forma parte del proyecto robot-distillation, cuyo objetivo es trasladar capacidades de razonamiento y planificación robótica desde modelos grandes a modelos pequeños desplegables en entornos con recursos limitados. El conjunto de datos de entrenamiento son los rollouts publicados por el propio autor bajo el identificador eddykang06/qwen3.8-27b-pear-libero-rollouts.

Es importante señalar que, según la propia model card, el modelo "no se ha subido todavía" (not uploaded yet), por lo que los pesos no están disponibles públicamente en el momento de redactar esta ficha. Además, el repositorio registra cero descargas y cero likes, y la información sobre licencia, idiomas y especificaciones detalladas no está publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3.5-4B); detalles no disponibles |
| Parametros totales | 4.000 millones (aproximado, según el nombre del modelo y el modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el modelo aún no se ha subido) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de Qwen/Qwen3.5-4B, un transformer decoder-only de aproximadamente 4.000 millones de parámetros. Sobre esa base se aplica un ajuste fino supervisado (SFT) utilizando las trayectorias exitosas generadas por el profesor Qwen3.8-27B-PEAR-LIBERO_only, un modelo de 27.000 millones de parámetros especializado en LIBERO y operado con esfuerzo de razonamiento "xhigh".

La innovación técnica principal es la compresión del razonamiento: en lugar de transferir literalmente las cadenas de pensamiento del profesor, se condensan antes de usarlas como objetivo de entrenamiento, de modo que el modelo de 4B aprende a producir trazas de razonamiento más cortas y eficientes para las mismas tareas. El conjunto de datos empleado son los rollouts publicados por el autor (eddykang06/qwen3.8-27b-pear-libero-rollouts). No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Razonamiento aplicado a robótica: planificación de acciones y trazas de razonamiento comprimidas para tareas del benchmark LIBERO.
- Ejecución de tareas de manipulación: el modelo está entrenado sobre trayectorias exitosas de un profesor especializado en LIBERO, por lo que su dominio principal son tareas de manipulación robótica simulada.
- Generación de texto y razonamiento general: heredadas del modelo base Qwen3.5-4B, aunque el ajuste fino puede haber reducido su polivalencia fuera del dominio robótico.
- Soporte de tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: orientado implícitamente a razonamiento multi-paso en el contexto de robótica, pero sin documentación específica.
- Capacidades multilingües: no disponible.
- Capacidades especiales: destilación de razonamiento con compresión de trazas; no se documentan modos de pensamiento, visión ni audio.

## Casos de uso

- Planificación de manipulación robótica en simulación: el modelo puede generar secuencias de acciones para tareas del benchmark LIBERO, aprovechando el razonamiento comprimido aprendido del profesor de 27B para producir planes más cortos y ejecutables en un modelo de 4B.
- Destilación de políticas en robótica: sirve como referencia para reproducir el pipeline de destilación con compresión de razonamiento dentro del proyecto robot-distillation, trasladando capacidades de un profesor grande a un alumno pequeño.
- Despliegue en hardware con recursos limitados: al tratarse de un modelo de 4B, es candidato para inferencia en GPUs de consumo o en entornos embebidos donde un modelo de 27B no cabría, una vez publicados los pesos.
- Investigación en compresión de cadenas de pensamiento: permite estudiar cómo afecta la compresión de trazas de razonamiento a la tasa de éxito en tareas de manipulación, comparando con el profesor sin comprimir.
- Evaluación comparativa de destilación: útil para medir la brecha de rendimiento entre un profesor de 27B y un alumno de 4B en LIBERO bajo el mismo conjunto de rollouts.
- Generación de datos sintéticos de razonamiento robótico: el modelo puede producir trazas de razonamiento comprimidas que sirvan como datos de entrenamiento para modelos aún más pequeños o para aumentar el dataset original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de 4B, en FP16 se requerirían aproximadamente 8 GB de VRAM, y en cuantización de 4 bits alrededor de 2,5-3 GB, aunque estas cifras no están confirmadas por el autor.
- GPU recomendadas: no disponible. Por tamaño, un modelo de 4B podría ejecutarse en GPUs de consumo como RTX 3060, RTX 4070 o RTX 4090, así como en A100 o H100 para despliegues de mayor throughput.
- Cabe en consumer GPU: probablemente sí, dado el tamaño de 4B, pero no está verificado por el autor.
- Opciones de despliegue: no disponible (no se documentan vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B Pear Libero SFT Compressed | ~4B | no disponible | Robótica (LIBERO) | no disponible | Pesos no subidos |
| Qwen/Qwen3.5-4B (base) | ~4B | no disponible | General | no disponible | Público en Hugging Face |
| Qwen3.8-27B-PEAR-LIBERO_only (profesor) | ~27B | no disponible | Robótica (LIBERO) | no disponible | Público en Hugging Face |

La comparación directa con alternativas de la misma categoría (modelos pequeños especializados en robótica) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Pesos no publicados: la model card indica explícitamente "Not uploaded yet", por lo que el modelo no es utilizable actualmente.
- Licencia no especificada: no se indica la licencia, lo que impide evaluar su uso comercial. Además, la licencia del modelo base Qwen3.5-4B debe respetarse en cualquier caso.
- Dominio muy restringido: el ajuste fino sobre LIBERO puede degradar capacidades generales del modelo base fuera de tareas de manipulación robótica.
- Riesgo de alucinación: no documentado, pero inherente a los modelos generativos; en robótica, una traza de razonamiento incorrecta puede traducirse en acciones inválidas.
- Sesgos conocidos: no disponible.
- Limitaciones de contexto e idioma: no disponible.
- Sin benchmarks publicados: no hay evidencia cuantitativa del rendimiento del modelo frente al profesor ni frente al base.
- Madurez del proyecto: cero descargas y cero likes, creado y actualizado el mismo día, lo que sugiere un artefacto de investigación en fase temprana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eddykang06/qwen3.5-4b-pear-libero-sft-compressed
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo profesor: https://huggingface.co/mit-han-lab/Qwen3.8-27B-PEAR-LIBERO_only
- Dataset de rollouts: https://huggingface.co/datasets/eddykang06/qwen3.8-27b-pear-libero-rollouts
- Repositorio del proyecto: https://github.com/ericjkge/robot-distillation
