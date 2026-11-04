# mysterium99/smolvla_stage2b_newtasks_to_ds1

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, presentado en el artículo arXiv:2506.01844. A diferencia de los grandes modelos de lenguaje, un VLA consume observaciones visuales y de estado del robot y produce directamente acciones motoras, actuando como política de control para tareas de manipulación robótica. El modelo base `lerobot/smolvla_base` está pensado para ser ajustado (fine-tuning) por imitación sobre datasets de demostraciones concretos.

La ficha que nos ocupa, `mysterium99/smolvla_stage2b_newtasks_to_ds1`, es un ajuste fino del modelo base sobre el dataset `ds1`, compuesto por 50 episodios y 22.710 fotogramas a 30 FPS para una única tarea: "Take hardware from human and put in taped area". El checkpoint resultante tiene 450.046.176 parámetros (unos 450 M) y un tamaño de repositorio de 0,9 GB en formato safetensors, lo que lo sitúa en la franja de modelos desplegables en hardware de consumo.

Su relevancia es doble: por un lado demuestra el flujo completo de LeRobot para entrenar políticas VLA de extremo a extremo; por otro, ejemplifica cómo un modelo base pequeño puede especializarse en una tarea robótica concreta con un dataset relativamente modesto. No obstante, se trata de un checkpoint de investigación sin resultados de evaluación publicados, por lo que su utilidad práctica fuera del entorno exacto de entrenamiento es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) compacta, según SmolVLA (arXiv:2506.01844); detalles internos de capas no disponibles en la información proporcionada |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a control robótico, no a texto libre) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,9 GB) |

Especificaciones adicionales del pipeline:

| Parametro | Valor |
|---|---|
| Librería | lerobot (versión 0.6.1 en entrenamiento) |
| Pipeline tag | robotics |
| Tipo de robot | `follow` |
| Cámaras | `gripper`, `newtop`, `newside` |
| Entrada de estado | `observation.state` de forma `(6,)` |
| Entradas visuales | 3 cámaras, cada una `(3, 256, 256)` |
| Salida | `action` de forma `(6,)` |
| Dataset de entrenamiento | `ds1` (50 episodios, 22.710 fotogramas, 30 FPS) |
| Modelo base | `lerobot/smolvla_base` |

## Arquitectura y entrenamiento

SmolVLA se describe en su model card como un modelo de visión-lenguaje-acción compacto y eficiente, capaz de alcanzar rendimiento competitivo con costes computacionales reducidos y de desplegarse en hardware de consumo. La arquitectura concreta (número de capas, dimensiones ocultas, mecanismo de fusión visión-lenguaje-acción) no se detalla en la información proporcionada; solo se indica que sigue el diseño SmolVLA del paper arXiv:2506.01844 y que se implementa mediante la librería LeRobot.

El entrenamiento de este checkpoint es un ajuste fino por imitación sobre `lerobot/smolvla_base`. La configuración reportada incluye 20.000 pasos de entrenamiento, batch size de 8, optimizador AdamW, learning rate de 0,0001, semilla 0 y LeRobot 0.6.1. El dataset `ds1` contiene 50 episodios y 22.710 fotogramas a 30 FPS para una única tarea de manipulación. No se especifica en la información disponible si hubo etapas de RLHF, DPO ni el volumen total de tokens o composición del corpus de preentrenamiento del modelo base.

## Capacidades

- Control robótico por imitación: genera acciones de 6 dimensiones a partir de estado y tres vistas de cámara.
- Fusión multimodal visión-lenguaje-acción: procesa simultáneamente imágenes de tres cámaras (`gripper`, `newtop`, `newside`) y el estado del robot.
- Ejecución de una tarea específica de manipulación: "Take hardware from human and put in taped area".
- Integración con el ecosistema LeRobot: compatible con `lerobot-rollout` para despliegue y `lerobot-train` para reentrenamiento.
- Despliegue en hardware de consumo: el tamaño de 450 M de parámetros y 0,9 GB de pesos lo permite según la model card del modelo base.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento textual general, matemáticas, código ni multilingüismo, al tratarse de una política robótica y no de un modelo de lenguaje de propósito general.

## Casos de uso

- Manipulación pick-and-place en laboratorio: el modelo ejecuta la tarea de recoger hardware de una persona y depositarlo en una zona delimitada, usando las tres cámaras entrenadas; adecuado porque el checkpoint está ajustado exactamente a esa secuencia.
- Reproducción de demostraciones en robot `follow`: con `lerobot-rollout` y el flag `--strategy.type=base` se puede lanzar la política en bucle durante un tiempo determinado, útil para validar el pipeline de hardware antes de entrenar tareas propias.
- Punto de partida para fine-tuning de nuevas tareas: sirve como referencia de configuración (20.000 pasos, batch 8, lr 1e-4) para entrenar políticas SmolVLA sobre datasets propios con `lerobot-train`.
- Investigación en aprendizaje por imitación: permite estudiar el efecto del tamaño del dataset (50 episodios, 22.710 frames) en el rendimiento de un VLA compacto.
- Prototipado en robótica de bajo coste: al caber en hardware de consumo según la model card del modelo base, es viable en estaciones de trabajo con GPU de gama media para experimentación académica.
- Docencia y formación en VLA: ejemplo completo y reproducible del flujo LeRobot (grabación, entrenamiento, despliegue) para cursos de robótica con aprendizaje profundo.
- Benchmark interno de políticas: útil como baseline de 450 M parámetros frente a políticas más grandes o más pequeñas en la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, MMLU, HumanEval, GSM8K ni métricas equivalentes para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 M de parámetros en safetensors (0,9 GB), una estimación razonable en FP32 ronda los 1,8 GB de pesos, aunque la memoria total depende del runtime, las tres cámaras a 256×256 y los buffers intermedios.
- GPU recomendadas: no especificadas en la información proporcionada; la model card del modelo base afirma que puede desplegarse en hardware de consumo.
- Cabe en GPU de consumo: sí, según la afirmación del modelo base; no se detallan modelos concretos (RTX 4090, RTX 3060, etc.).
- Opciones de despliegue: LeRobot (`lerobot-rollout`) sobre PyTorch con CUDA; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mysterium99/smolvla_stage2b_newtasks_to_ds1` | 450 M | no disponible | Manipulación robótica (tarea única) | Apache 2.0 | Hugging Face, 0 descargas |
| `lerobot/smolvla_base` | no disponible en la información | no disponible | VLA base para fine-tuning | no disponible en la información | Hugging Face (modelo base) |
| Otros VLA comparables (p. ej. OpenVLA, π0) | no disponible en la información | no disponible | Manipulación robótica general | no disponible en la información | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay tasas de éxito ni validación en robot real, por lo que no se puede afirmar que la política funcione fuera del dataset de entrenamiento.
- Sobreajuste a un entorno concreto: entrenado con 50 episodios y tres cámaras específicas (`gripper`, `newtop`, `newside`); cambios de iluminación, posiciones de objetos, robot o montaje de cámaras pueden degradar el rendimiento.
- Tarea única: la política solo está entrenada para "Take hardware from human and put in taped area"; no generaliza a otras tareas sin reentrenamiento.
- Sin capacidades de lenguaje general: no es un modelo conversacional ni de razonamiento textual; no debe evaluarse con benchmarks de LLM.
- Riesgo de alucinación motora: como toda política de imitación, puede generar acciones fuera de distribución ante observaciones no vistas, con riesgo físico para el robot o el entorno.
- Sesgos: no documentados; el dataset de 50 episodios puede reflejar sesgos de posicionamiento, velocidad o estilo de demostración del operador.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías; conviene revisar también la licencia del modelo base `lerobot/smolvla_base`.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validación por la comunidad.
- Idiomas: no aplica; no se documenta soporte multilingüe.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mysterium99/smolvla_stage2b_newtasks_to_ds1
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Guía LeRobot SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot en GitHub: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/ds1
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ds1
