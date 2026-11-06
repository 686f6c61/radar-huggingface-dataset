# nebula2wx/smolvla_standard34_ds1

## Resumen

`nebula2wx/smolvla_standard34_ds1` es un ajuste fino (fine-tune) de `lerobot/smolvla_base`, la política vision-language-action (VLA) compacta publicada por Hugging Face en el marco del proyecto LeRobot. SmolVLA es un modelo que combina un codificador visual, un modelo de lenguaje preentrenado y un cabezal de acciones para controlar robots directamente a partir de observaciones multimodales (imágenes de cámaras y estado de las articulaciones), sin necesidad de APIs externas ni de modelos auxiliares de gran tamaño.

Este repositorio concreto no es un modelo generalista: es una política de imitación entrenada para una única tarea robótica ("pick up the red block and put it on the plate") sobre un robot de tipo `so_follower` (familia SO-100/SO-101 de bajo coste) con dos cámaras declaradas (`head` y `wrist`). El modelo tiene 450.046.176 parámetros (≈450 M) y un repo de 19,8 GB, coherente con la inclusión de checkpoints de entrenamiento en el árbol de ficheros.

Su relevancia es práctica más que de investigación: demuestra el flujo completo de LeRobot (grabación de datos, entrenamiento de imitación y despliegue en hardware de consumo) y sirve como referencia reproducible para quien quiera adaptar SmolVLA a su propio robot. La licencia Apache 2.0 y el formato safetensors lo hacen directamente reutilizable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en SmolVLA; codificador visual + LM + cabezal de acciones (detalle exacto de capas no disponible) |
| Parametros totales | 450.046.176 (≈450 M) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (las instrucciones de tarea son en inglés en el dataset de entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

Otras especificaciones relevantes:

| Parametro | Valor |
|---|---|
| Modelo base | `lerobot/smolvla_base` (fine-tune) |
| Pipeline | `robotics` |
| Tipo de robot | `so_follower` |
| Camaras | `head`, `wrist` |
| Entrada `observation.state` | `(6,)` |
| Entradas visuales | `observation.images.camera1/2/3` `(3, 256, 256)`; `observation.images.empty_camera_0` `(3, 480, 640)` |
| Salida `action` | `(6,)` |
| Dataset de entrenamiento | `Whyynnot/standard_3_4_red_pick_up_20261031_220542` (30 episodios, 20.906 frames, 30 FPS) |
| Tarea | "pick up the red block and put it on the plate" |
| Pasos de entrenamiento | 200.000 |
| Batch size | 8 |
| Optimizador | AdamW, lr 1e-05 |
| Semilla | 1000 |
| Version de LeRobot | 0.6.2 |
| Tamano del repo | 19,8 GB |
| Descargas / likes | 11 / 0 |

## Arquitectura y entrenamiento

SmolVLA es un modelo vision-language-action compacto diseñado para lograr rendimiento competitivo con un coste computacional reducido y poder desplegarse en hardware de consumo (paper arXiv:2506.01844). La arquitectura combina percepción visual (imágenes de varias cámaras a 256×256 y 480×640), estado propioceptivo del robot (vector de 6 dimensiones) y una instrucción de tarea en lenguaje natural, y produce directamente un vector de acción de 6 dimensiones. El detalle exacto de capas, dimensiones ocultas y mecanismo de atención no se documenta en la información disponible.

El entrenamiento de este repositorio es de imitación supervisada (behavior cloning) sobre 30 episodios y 20.906 frames grabados a 30 FPS, con 200.000 pasos, batch size 8, AdamW y learning rate 1e-05. No se documentan fases de RLHF/DPO ni un desglose del dataset más allá del recuento de episodios y frames. La innovación destacable del modelo base es su eficiencia: un VLA de ~450 M parámetros que evita depender de un LLM de gran tamaño y puede ejecutarse en GPUs de gama consumer, algo poco habitual en políticas VLA.

## Capacidades

- Control robótico por imitación: genera comandos de acción de 6 dimensiones a partir de observaciones visuales y de estado para el robot `so_follower`.
- Percepción multimodal: consume varias cámaras simultáneamente (se declaran `camera1`, `camera2`, `camera3` a 256×256 y `empty_camera_0` a 480×640) además del estado de las articulaciones.
- Condicionamiento por lenguaje: acepta una instrucción de tarea en texto (`--task`), aunque el modelo está especializado en la tarea concreta de recoger el bloque rojo y colocarlo en el plato.
- Ejecución en tiempo real: pensado para inferencia a la frecuencia de control del robot (datos grabados a 30 FPS).
- Tool calling / function calling: no disponible (no es un modelo de lenguaje generalista).
- Agentes y razonamiento multi-paso: no disponible como tal; la política ejecuta una secuencia de acciones motrices, no razonamiento simbólico.
- Capacidades multilingües: no disponible.
- Modo thinking, visión para tareas generales, audio: no disponible.

## Casos de uso

- Recogida y colocación de objetos (pick-and-place): es el caso de uso directo del modelo; ejecuta la tarea "pick up the red block and put it on the plate" sobre un SO-100/SO-101 con las cámaras `head` y `wrist` calibradas.
- Prototipado rápido de políticas de imitación: sirve como referencia reproducible para validar el pipeline de LeRobot (grabación, entrenamiento, rollout) antes de invertir en datasets mayores.
- Base para fine-tuning en nuevas tareas: partiendo de `lerobot/smolvla_base` o de este checkpoint, se puede reentrenar con `lerobot-train` sobre un dataset propio con pocos episodios (el ejemplo usa 30).
- Laboratorios docentes y de robótica de bajo coste: al caber en hardware consumer y usar un robot de bajo coste, es adecuado para prácticas de aprendizaje por imitación.
- Evaluación de robustez de políticas VLA: útil para estudiar cómo varía la tasa de éxito ante cambios de iluminación, posición de objetos o distracciones (el propio model card sugiere registrar estos factores).
- Automatización de tareas repetitivas de laboratorio: manipulación de piezas pequeñas (bloques, componentes) en estaciones de montaje sencillas con una única tarea fija.
- Generación de datos sintéticos de demostración: el rollout con `--strategy.type=base` permite ejecutar la política sin grabar episodios, útil para inspección visual rápida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación vacía con la anotación explícita: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, ni de comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con ~450 M parámetros, los pesos en fp32 ocupan del orden de 1,8 GB y en fp16 del orden de 0,9 GB; el consumo real depende de los buffers de activación y del procesamiento de cuatro streams visuales, por lo que no se puede dar una cifra fiable sin medición.
- GPU recomendadas: no disponible en la información proporcionada. El model card del modelo base indica que SmolVLA está pensado para desplegarse en hardware de consumo.
- ¿Cabe en GPU consumer? El modelo base está descrito como desplegable en hardware de gama consumer; para este fine-tune concreto no se aportan requisitos medidos.
- Opciones de despliegue: `lerobot-rollout` (CLI de LeRobot) es el método documentado; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a una política robótica de este tipo.
- Latencia y throughput: no disponibles. El dataset se grabó a 30 FPS, lo que da una referencia de la frecuencia de control esperada, pero no se publican cifras de latencia de inferencia.
- Almacenamiento: el repo ocupa 19,8 GB, principalmente por los checkpoints de entrenamiento incluidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `nebula2wx/smolvla_standard34_ds1` | ≈450 M | no disponible | Pick-and-place sobre `so_follower` | Apache 2.0 | Hugging Face (11 descargas) |
| `lerobot/smolvla_base` | ≈450 M (misma familia) | no disponible | VLA generalista para fine-tuning | no disponible en la informacion | Hugging Face (modelo base oficial) |
| Otras políticas VLA (p. ej. RT-2, OpenVLA) | no disponible en la informacion | no disponible | VLA generalistas | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: entrenado para una sola tarea y un solo tipo de robot (`so_follower`); no generaliza a otras tareas ni morfologías sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito ni condiciones de prueba, por lo que el rendimiento real en robot es desconocido.
- Dependencia de la configuración de cámaras: las claves de observación (`camera1`, `camera2`, `camera3`, `empty_camera_0`) deben coincidir exactamente con las usadas en entrenamiento; un mapeo incorrecto invalida la política.
- Dataset pequeño: 30 episodios y 20.906 frames implican poca diversidad de posiciones, iluminación y distractores, con riesgo de sobreajuste al entorno de grabación.
- Riesgo de alucinación: en un VLA se manifiesta como acciones erráticas o inseguras cuando la observación se sale de la distribución de entrenamiento; requiere supervisión humana y parada de emergencia.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas: la instrucción de tarea está en inglés; no se documenta soporte multilingüe.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las licencias del modelo base y del dataset asociado antes de redistribuir.
- Repo pesado (19,8 GB) por los checkpoints; para despliegue conviene descargar solo los pesos finales.
- Fecha de creación del repo (2026-11-03) y nombres de dataset con marcas temporales sugieren un experimento reciente y poco validado por la comunidad (0 likes, 11 descargas).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nebula2wx/smolvla_standard34_ds1
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Dataset de entrenamiento: https://huggingface.co/datasets/Whyynnot/standard_3_4_red_pick_up_20261031_220542
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Whyynnot/standard_3_4_red_pick_up_20261031_220542
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Repo relacionado del autor: https://huggingface.co/nebula2wx/smolvla_standard34_ds123
