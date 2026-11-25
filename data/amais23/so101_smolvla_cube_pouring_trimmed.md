# amais23/so101_smolvla_cube_pouring_trimmed

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para control robótico mediante imitación. Esta ficha concreta, `amais23/so101_smolvla_cube_pouring_trimmed`, es un ajuste fino del modelo base `lerobot/smolvla_base` sobre un dataset propio de 100 episodios para la tarea específica de verter un cubo de una taza a otra con un robot SO-101.

El modelo resuelve el problema de llevar políticas VLA a hardware de consumo: con unos 450 millones de parámetros y pesos en safetensors, está pensado para inferencia en tiempo real en GPUs asequibles, algo crítico en robótica de manipulación donde la latencia importa tanto como la precisión. Frente a VLA de mayor tamaño como OpenVLA, SmolVLA apuesta por un diseño más ligero y entrenable con recursos limitados.

Es relevante ahora porque demuestra el flujo completo de LeRobot: grabar demostraciones, ajustar una política preentrenada y desplegarla en un brazo robótico real mediante `lerobot-rollout`. La licencia Apache 2.0 facilita su reutilización comercial, aunque el modelo está especializado en una única tarea y robot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta; detalles internos no disponibles en la model card |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica; instrucciones en ingles en el ejemplo) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |

Especificaciones adicionales del pipeline:

| Parametro | Valor |
|---|---|
| Tipo de robot | `so_follower` (SO-101) |
| Camaras | `front`, `wrist` (entradas visuales de 3x256x256 y 3x480x640) |
| Entrada de estado | `observation.state` con forma `(6,)` |
| Salida de accion | `action` con forma `(6,)` |
| Dataset de ajuste | `amais23/so101_cube_pouring_trimmed` (100 episodios, 53.223 frames, 30 FPS) |
| Tarea | "Pour the cube from the source cup into the target cup" |
| Pasos de entrenamiento | 20.000 |
| Batch size | 64 |
| Optimizador | AdamW |
| Learning rate | 0,0001 |
| Semilla | 1000 |
| Version de LeRobot | 0.6.1 |
| Tamano del repo | 13,2 GB |

## Arquitectura y entrenamiento

SmolVLA es una política VLA que combina percepción visual y estado propioceptivo para producir acciones motoras continuas. La model card no detalla la arquitectura interna (número de capas, mecanismo de atención, encoder visual), por lo que esos datos no están disponibles. El modelo se ajusta por imitación supervisada sobre pares observación-acción, sin que la información proporcionada indique uso de RLHF o DPO.

El ajuste fino se realizó sobre `lerobot/smolvla_base` con el dataset `amais23/so101_cube_pouring_trimmed`: 100 episodios, 53.223 frames a 30 FPS, con 20.000 pasos de entrenamiento, batch de 64, AdamW y learning rate 0,0001. El pipeline consume tres cámaras (dos a 256x256 y una a 480x640) más el estado de 6 dimensiones, y emite un vector de acción de 6 dimensiones. No se documentan innovaciones técnicas adicionales en esta ficha.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 dimensiones para un brazo SO-101 a partir de observaciones visuales y de estado.
- Percepción multimodal: procesa tres flujos de cámara simultáneos (muñeca y frontal) junto con la posición articular.
- Ejecución de una tarea concreta: verter un cubo de una taza origen a una taza destino.
- Despliegue en hardware de consumo: el tamaño de 450 M de parámetros permite inferencia en GPUs asequibles.
- Integración con LeRobot: compatible con `lerobot-rollout` para ejecución y `lerobot-train` para reentrenamiento.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni generación de texto libre; es un modelo de política motora, no un asistente conversacional.

## Casos de uso

- Automatización de tareas de vertido en laboratorio: el modelo ejecuta la secuencia de verter un cubo entre tazas sobre un SO-101, útil para prototipos de manipulación de precisión con objetos pequeños.
- Base para ajuste fino en nuevas tareas: partiendo de `lerobot/smolvla_base` o de esta política, un equipo puede reentrenar con su propio dataset LeRobot para tareas de pick-and-place similares.
- Investigación en imitación visual-motora: sirve como referencia reproducible de un pipeline completo (grabación, entrenamiento, despliegue) con hiperparámetros documentados.
- Docencia y formación en robótica: el bajo coste computacional y la licencia Apache 2.0 permiten usarlo en cursos con hardware de consumo.
- Pruebas de concepto de robótica de bajo coste: el SO-101 es un brazo económico, y esta política demuestra que un VLA de 450 M puede operar en ese rango de hardware.
- Benchmark interno de políticas VLA: útil como línea base para comparar nuevas políticas sobre la misma tarea y dataset, aunque el autor no publica tasas de éxito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 450 M de parámetros, en FP32 serían aproximadamente 1,8 GB de pesos; en FP16, unos 0,9 GB, más el coste del encoder visual y los búferes de las tres cámaras.
- GPU recomendadas: no especificadas en la información proporcionada. Por tamaño, es viable en GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- Cabe en GPU de consumo: sí, previsiblemente, dado el reducido número de parámetros, aunque no se documentan requisitos oficiales.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para entrenamiento). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de política motora.
- Latencia y throughput: no disponibles. El sistema opera a 30 FPS en la captura de datos, pero no se publica la frecuencia de inferencia alcanzada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| so101_smolvla_cube_pouring_trimmed | 450 M | no disponible | Vertido de cubo en SO-101 | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible en esta informacion | no disponible | VLA base para ajuste fino | no disponible en esta informacion | Hugging Face |
| OpenVLA | no disponible en esta informacion | no disponible | VLA generalista de manipulacion | no disponible en esta informacion | no disponible |

La comparación con OpenVLA u otros VLA generalistas no puede completarse con datos verificados en la información proporcionada; se indica como no disponible.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada únicamente para verter un cubo entre tazas con un SO-101; no generaliza a otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito ni número de ensayos, por lo que se desconoce su fiabilidad real en producción.
- Dependencia de la configuración de cámaras: los nombres e índices de cámara deben coincidir con las claves de observación del entrenamiento; un montaje distinto degradará el rendimiento.
- Sensibilidad al entorno: cambios de iluminación, posición de objetos o un robot distinto del mismo tipo pueden afectar al comportamiento, aunque no se cuantifica.
- Sesgos: no documentados; en robótica, los sesgos provienen de la distribución del dataset de demostración (posiciones, objetos y condiciones limitadas).
- Riesgo de alucinación: no aplica en el sentido textual, pero sí existe riesgo de acciones erráticas fuera de distribución.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Idiomas: no se documenta soporte multilingüe; las instrucciones de tarea del ejemplo están en inglés.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amais23/so101_smolvla_cube_pouring_trimmed
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/amais23/so101_cube_pouring_trimmed
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=amais23/so101_cube_pouring_trimmed
