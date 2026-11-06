# LUC1O/act-5090-D_libero_object_orange_juice

## Resumen

ACT (Action Chunking Transformer) es una política de imitación para robótica manipulativa que predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que reduce el error de composición acumulado en tareas de horizonte largo. Este checkpoint concreto, `LUC1O/act-5090-D_libero_object_orange_juice`, es un ajuste fino del algoritmo ACT oficial de LeRobot entrenado por el usuario LUC1O sobre una única tarea del benchmark LIBERO: la manipulación del objeto "orange juice" dentro de la suite `libero_object` (task_index 20).

El modelo resuelve un problema muy acotado: dada una observación visual y el estado del robot, generar una secuencia de acciones de 100 pasos para completar la tarea de coger y colocar el objeto "orange juice". No es un modelo de lenguaje ni un modelo fundacional de robótica; es un controlador visuomotor especializado entrenado con 100.000 pasos sobre un único subconjunto del dataset `lerobot/libero`, con hiperparámetros oficiales de ACT (batch 8, lr 1e-5, chunk 100) y una sola RTX 5090.

Su relevancia es fundamentalmente metodológica y de reproducibilidad: forma parte de un benchmark público (repositorio `Jerryisqx/ACT-5090-benchmark`) que documenta el rendimiento de ACT sobre LIBERO con hardware consumer. El resultado reportado es de 24,0 % de éxito (12/50 episodios, IC 95 % Wilson 14,3–37,4), un dato que debe interpretarse como referencia de un experimento concreto y no como una capacidad general del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), transformer con encoder visual ResNet y decoder de acciones con chunking |
| Parametros totales | 51.671.687 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; opera sobre observaciones por paso y un chunk de 100 acciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo visuomotor, no linguistico) |
| Licencia | no disponible |
| Formato de pesos | safetensors (via libreria `lerobot`) |

## Arquitectura y entrenamiento

ACT combina un backbone visual (típicamente ResNet) que codifica las imágenes de cámara con un transformer encoder-decoder que produce un chunk de acciones de longitud fija (100 en este caso). La innovación central de ACT es precisamente el *action chunking*: en lugar de predecir una acción por paso, el modelo predice una secuencia temporalmente coherente, lo que mitiga el problema de acumulación de errores y mejora la estabilidad en tareas de manipulación de horizonte medio. El entrenamiento es de imitación supervisada (behavior cloning) sobre demostraciones, sin RLHF ni DPO.

Este checkpoint se entrenó con LeRobot (commit `ba83e4c`) usando los hiperparámetros oficiales de ACT: batch size 8, learning rate 1e-5, chunk size 100 y 100.000 pasos, todo en una RTX 5090. El dataset es `lerobot/libero` restringido a `task_index 20` (tarea del objeto "orange juice" en la suite `libero_object`). No se documentan en la información disponible el número de tokens, la composición exacta del dataset ni detalles adicionales de aumentación o regularización.

## Capacidades

- Control visuomotor para manipulación robótica: genera chunks de 100 acciones a partir de observaciones de imagen (256×256 según el comando de evaluación) y estado del robot.
- Ejecución de una tarea concreta: coger y colocar el objeto "orange juice" en el entorno `libero_object`.
- Inferencia compatible con el stack LeRobot (`lerobot-eval`) y con entornos LIBERO simulados.
- No soporta tool calling, function calling ni razonamiento multi-paso simbólico.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo "thinking", visión general, audio ni otras capacidades multimodales más allá de la percepción visual para control.

## Casos de uso

- Reproducción de experimentos de ACT sobre LIBERO: el checkpoint permite replicar el resultado del benchmark con el comando `lerobot-eval` documentado, útil para validar pipelines de evaluación en robótica simulada.
- Baseline para comparativas de políticas de imitación: sirve como referencia de rendimiento (24,0 % de éxito) frente a otras variantes de ACT o políticas entrenadas con distintos hiperparámetros sobre la misma tarea.
- Estudio de action chunking en tareas de horizonte medio: permite analizar empíricamente cómo afecta el tamaño de chunk (100) y el número de pasos de entrenamiento al éxito en manipulación.
- Docencia y formación en robótica con LeRobot: ejemplo completo y reproducible de entrenamiento y evaluación de una política visuomotora en hardware consumer (RTX 5090).
- Investigación sobre especialización por tarea: al estar entrenado solo con `task_index 20`, es útil para estudiar el efecto de la especialización frente a políticas multi-tarea.
- Validación de infraestructura de simulación: integrable en pipelines de evaluación con `env.type=libero`, `env.task=libero_object` y `task_ids=[9]` para comprobar el correcto funcionamiento del entorno antes de entrenar políticas propias.

## Benchmarks y rendimiento

| Benchmark | Entorno / tarea | Metrica | Resultado |
|---|---|---|---|
| LIBERO `libero_object` | task_index 20 ("orange juice"), 50 episodios | Tasa de exito | 24,0 % (12/50), IC 95 % Wilson 14,3–37,4 |

No se han publicado en la información disponible resultados comparativos con otras políticas sobre el mismo benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 51,7 M de parámetros el modelo es muy ligero, pero el consumo real depende del backbone visual y del tamaño de lote de evaluación.
- GPU de entrenamiento documentada: una RTX 5090 (entrenamiento completo en 100.000 pasos).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 4090, RTX 5090) es suficiente para entrenamiento e inferencia; para evaluación en lote se puede usar A100 o H100 si se busca mayor throughput.
- Cabe en GPU consumer: sí, dado el tamaño del modelo (0,2 GB de repo).
- Opciones de despliegue: LeRobot (`lerobot-eval`) con entorno LIBERO; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / chunk | Licencia | Disponibilidad |
|---|---|---|---|---|
| `LUC1O/act-5090-D_libero_object_orange_juice` (este) | 51,7 M | chunk 100 | no disponible | Hugging Face |
| ACT oficial de LeRobot | no disponible en la informacion | chunk configurable | no disponible | Repositorio LeRobot |
| Otras políticas del benchmark `Jerryisqx/ACT-5090-benchmark` | no disponible en la informacion | no disponible | no disponible | GitHub |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: entrenado solo con `task_index 20` de `libero_object`; no generaliza a otras tareas, objetos ni entornos sin reentrenamiento.
- Rendimiento limitado: 24,0 % de éxito con un intervalo de confianza amplio (14,3–37,4 %), lo que indica alta varianza y un rendimiento lejos de lo que se consideraría fiable en producción.
- Sin información sobre sesgos: al ser un modelo visuomotor entrenado en simulación, los sesgos relevantes serían los del dataset de demostraciones, no documentados aquí.
- Riesgo de fallo en el mundo real: el modelo se evalúa en simulación (LIBERO); no hay evidencia de transferencia a un robot físico.
- Licencia no disponible: no se puede confirmar el uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Sin soporte lingüístico ni de tool calling: no es adecuado para tareas de texto, agentes conversacionales o pipelines de código.
- Checkpoint de investigación: creado en 2026 y con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LUC1O/act-5090-D_libero_object_orange_juice
- Repositorio del benchmark, logs y scripts de reproducción: https://github.com/Jerryisqx/ACT-5090-benchmark
- Librería LeRobot: https://github.com/huggingface/lerobot
- Dataset `lerobot/libero`: https://huggingface.co/datasets/lerobot/libero
