# kickking/omx_buds_pick_act_policy_30hz_bs16_ep3_test

## Resumen

`omx_buds_pick_act_policy_30hz_bs16_ep3_test` es una política de aprendizaje por imitación para robótica entrenada con el método Action Chunking with Transformers (ACT), publicado por primera vez en el artículo arXiv 2304.13705. El autor, identificado como `kickking`, la ha generado y subido a Hugging Face mediante LeRobot, la librería de Hugging Face para aprendizaje automático en robótica real. No es un modelo de lenguaje: es un controlador visomotor que mapea una observación compuesta por el estado del robot (vector de 6 dimensiones) y una imagen RGB de 480x640 a una acción de 6 dimensiones.

La política está especializada en una única tarea de manipulación (`omx_panda_pick&place`, recogida y colocación de objetos), entrenada sobre un dataset propio de 30 episodios y 19.626 fotogramas a 30 FPS. El modelo tiene 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, lo que refleja que se trata de un transformer compacto orientado a inferencia en tiempo real sobre hardware de robot, no a despliegues masivos en servidor.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de un pipeline completo de LeRobot (grabación de datos, entrenamiento ACT, despliegue con `lerobot-rollout`) y como punto de partida para quien quiera adaptar ACT a un robot `omx_f` con una cámara. La model card lo etiqueta explícitamente como `test`, no incluye resultados de evaluación y no se han publicado benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; la tarea se especifica con una cadena fija, `omx_panda_pick&place`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio LeRobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice fragmentos (*chunks*) de acciones futuras en lugar de un único paso, lo que reduce el error de acumulación y permite un control más suave en tareas de manipulación. La arquitectura combina un codificador visual para la imagen RGB de 480x640, un codificador del estado del robot (vector de 6 dimensiones) y un decodificador transformer que emite la acción de 6 dimensiones. El repositorio no detalla la configuración interna del transformer (número de capas, dimensión oculta, número de cabezas), por lo que esos datos no están disponibles.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `kickking/omx_buds_pick_1111`: 30 episodios, 19.626 fotogramas a 30 FPS, una única cámara (`camera1`) y la tarea `omx_panda_pick&place`. La configuración reportada es de 3.680 pasos, batch size 16, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se indica en la model card si hubo aumento de datos, regularización temporal ni fases de RLHF/DPO (no aplicables a este tipo de política). Tampoco se documenta la composición exacta de las escenas ni la variabilidad de posiciones de los objetos.

## Capacidades

- Control visomotor de un robot `omx_f` a partir de una imagen RGB de 480x640 y un vector de estado de 6 dimensiones.
- Predicción de acciones de 6 dimensiones en forma de *action chunks*, adecuada para control continuo a 30 Hz.
- Ejecución de la tarea concreta `omx_panda_pick&place` (recogida y colocación de objetos tipo buds).
- Integración nativa con el ecosistema LeRobot: `lerobot-rollout` para despliegue y `lerobot-train` para reentrenamiento.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, código, matemáticas, visión general, audio ni modo *thinking*: es una política robótica de propósito específico.
- No tiene capacidades multilingües; la cadena de tarea es fija y en inglés.

## Casos de uso

- Recogida y colocación automatizada de objetos pequeños: la política está entrenada específicamente para `omx_panda_pick&place` sobre un robot `omx_f`, por lo que puede desplegarse directamente en una celda de pick-and-place con la misma configuración de cámara y robot.
- Base para *fine-tuning* en una nueva tarea de manipulación: al ser un checkpoint ACT de 51,7 M de parámetros, se puede reentrenar con `lerobot-train` sobre un dataset propio de pocas decenas de episodios, siguiendo el mismo esquema (30 episodios, 3.680 pasos) que el autor.
- Validación de un pipeline LeRobot completo: sirve para verificar la instalación, la calibración del robot `omx_f`, la captura de cámara a 640x480 y 30 FPS, y el comando `lerobot-rollout` antes de invertir en la grabación de un dataset mayor.
- Docencia y prototipado en laboratorio: el tamaño reducido (0,2 GB) y la licencia Apache 2.0 permiten usarlo en cursos de aprendizaje por imitación y en entornos de investigación sin restricciones de licencia.
- Pruebas de robustez visomotora: al depender de una sola cámara y de un estado de 6 dimensiones, es útil para estudiar cómo afectan cambios de iluminación, posición de objetos y distracciones al éxito de una política ACT.
- Referencia para comparativas de métodos de imitación: permite contrastar ACT con alternativas como Diffusion Policy o VQ-BeT sobre el mismo robot y dataset, ya que el pipeline de LeRobot es común.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la sección de evaluación vacía y declara explícitamente: «No evaluation results have been provided for this policy yet». No se dispone de tasas de éxito en robot real, ni de métricas de latencia o throughput medidas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 51,7 M de parámetros en safetensors, el peso de los pesos ronda los 0,2 GB en FP32; el consumo real depende del codificador visual y del *batch* de acciones.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería poder ejecutar la política; una RTX 3060 o superior es un punto de partida razonable, aunque no está confirmado.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del modelo, pero no hay confirmación oficial.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` y `--policy.path=kickking/omx_buds_pick_act_policy_30hz_bs16_ep3_test`; el entrenamiento se realiza con `lerobot-train` y `--policy.type=act`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El control está pensado para 30 Hz (33 ms por paso), pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `kickking/omx_buds_pick_act_policy_30hz_bs16_ep3_test` (ACT) | 51,7 M | no aplica | sin evaluación publicada | Apache 2.0 | Hugging Face, vía LeRobot |
| Políticas ACT de referencia en LeRobot (p. ej. checkpoints oficiales de ACT) | del orden de decenas de millones (no confirmado) | no aplica | varía según checkpoint | Apache 2.0 (LeRobot) | Hugging Face |
| Diffusion Policy (Chi et al., 2023) | no disponible | no aplica | no disponible | según implementación | repositorios de investigación |
| VQ-BeT (Lee et al., 2024) | no disponible | no aplica | no disponible | según implementación | repositorios de investigación |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada; la comparación se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- Es un checkpoint etiquetado como `test` por el propio autor; no debe tratarse como un modelo validado para producción.
- No hay evaluación en robot real: se desconoce la tasa de éxito, la robustez ante cambios de iluminación, posición de objetos o distracciones.
- Entrenado con solo 30 episodios y 19.626 fotogramas de una única tarea y una única cámara; la generalización a otras tareas, objetos o configuraciones de cámara es muy limitada.
- Depende de la configuración exacta de observación: estado de 6 dimensiones y cámara `camera1` a 640x480 y 30 FPS. Cambiar la resolución, la frecuencia o el nombre de la cámara rompe la inferencia.
- Específico del robot `omx_f`; no es portable a otros robots sin reentrenamiento.
- Riesgo de sobreajuste al dataset y de fallo silencioso fuera de la distribución de entrenamiento; al no haber métricas, no se puede cuantificar.
- No procesa lenguaje natural ni admite instrucciones variables: la tarea es fija (`omx_panda_pick&place`).
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- No se documentan sesgos, pero al ser un modelo visomotor puede heredar sesgos de las condiciones de grabación (posiciones, colores y tipos de objeto del dataset).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kickking/omx_buds_pick_act_policy_30hz_bs16_ep3_test
- Dataset de entrenamiento: https://huggingface.co/datasets/kickking/omx_buds_pick_1111
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=kickking/omx_buds_pick_1111
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
