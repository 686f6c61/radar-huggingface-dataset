# kickking/omx_panda_pick_act_pilicy_bs8_ep10

## Resumen

`kickking/omx_panda_pick_act_pilicy_bs8_ep10` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), una técnica de aprendizaje por imitación presentada en el artículo arXiv:2304.13705 que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales. El modelo lo publica el usuario `kickking` en Hugging Face utilizando la librería LeRobot de Hugging Face, y está pensado para controlar un robot de tipo `omx_f` equipado con una cámara `camera1`, resolviendo una tarea de recogida (pick) sobre el dataset `kickking/omx_panda_pick_1101`.

Se trata de un modelo pequeño y específico: 51.668.614 parámetros (unos 51,7 M), un repositorio de 0,2 GB y una ventana de observación de estado de 6 dimensiones más una imagen RGB de 480x640. No es un modelo de lenguaje ni un modelo generativo de propósito general: es una política de control motor que mapea observaciones (estado del robot e imagen) a acciones de 6 dimensiones, entrenada sobre 30 episodios y 11.660 fotogramas a 15 FPS.

Su relevancia es la de un ejemplo práctico y reproducible de imitation learning en robótica con LeRobot: licencia Apache 2.0, formato safetensors, integración directa con las herramientas `lerobot-rollout` y `lerobot-train`, y un pipeline declarado como `robotics`. No obstante, es un modelo de autor individual, sin resultados de evaluación publicados y con un dataset de entrenamiento muy reducido, por lo que debe tratarse como una política experimental más que como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer de aprendizaje por imitación |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | LeRobot 0.6.1 |
| Tipo de robot | omx_f |
| Camaras | camera1 |
| Entrada `observation.state` | STATE, shape (6,) |
| Entrada `observation.images.rgb.camera1` | VISUAL, shape (3, 480, 640) |
| Salida `action` | ACTION, shape (6,) |
| Dataset de entrenamiento | kickking/omx_panda_pick_1101 (30 episodios, 11.660 fotogramas, 15 FPS) |
| Pasos de entrenamiento | 14.575 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

La arquitectura es ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que combina un codificador visual y un transformer que predice secuencias cortas de acciones futuras en lugar de una única acción por paso. Esta formulación de "action chunking" reduce el error de composición acumulado en tareas de manipulación y suele mejorar las tasas de éxito frente a políticas paso a paso. El modelo consume un vector de estado de 6 dimensiones y una imagen RGB de 3x480x640, y produce un vector de acción de 6 dimensiones, lo que encaja con un robot de tipo `omx_f` con una sola cámara.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `kickking/omx_panda_pick_1101`: 30 episodios, 11.660 fotogramas a 15 FPS, con la tarea etiquetada como "0". Se ejecutaron 14.575 pasos con batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta en la model card el uso de RLHF, DPO ni ninguna fase de ajuste posterior al entrenamiento por imitación, ni se detalla la composición exacta del dataset más allá del número de episodios y fotogramas. Tampoco se especifican innovaciones adicionales como decodificación especulativa o atención lineal; el método se limita a la formulación estándar de ACT descrita en el artículo.

## Capacidades

- Control motor por imitación: genera acciones de 6 dimensiones a partir de estado del robot e imagen RGB, orientadas a una tarea de recogida (pick).
- Predicción de action chunks: emite secuencias cortas de acciones en lugar de pasos individuales, lo que reduce el error acumulado en manipulación.
- Entrada multimodal: combina un vector de estado de 6 dimensiones con una imagen de cámara de 3x480x640.
- Integración con LeRobot: compatible con `lerobot-rollout` para ejecución en robot y `lerobot-train` para reentrenamiento.
- Ejecución en tiempo real: pensada para operar a la frecuencia del dataset de entrenamiento (15 FPS) en un robot `omx_f`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, matemáticas, visión general ni capacidades multilingües: es una política de control específica, no un modelo de lenguaje.

## Casos de uso

- Recogida de objetos en un robot `omx_f`: la política ejecuta la tarea de pick para la que fue entrenada, recibiendo estado e imagen de `camera1` y emitiendo acciones de 6 dimensiones; es adecuada porque el dataset y la configuración de robot coinciden exactamente con los del entrenamiento.
- Reproducción de experimentos de imitation learning: sirve como referencia reproducible para comparar ACT frente a otras políticas en LeRobot, dado que la configuración de entrenamiento (pasos, batch, learning rate, semilla) está documentada.
- Base para fine-tuning con datos propios: al estar en formato safetensors y licencia Apache 2.0, puede reentrenarse con `lerobot-train` sobre un dataset propio del mismo tipo de robot para adaptar la tarea.
- Docencia y formación en robótica: ejemplo completo y ligero (0,2 GB) para ilustrar el flujo grabación de datos, entrenamiento y despliegue con LeRobot sin necesidad de hardware de gran capacidad.
- Pruebas de integración de pipelines de control: útil para validar la cadena `lerobot-rollout` con `--strategy.type=base`, cámaras OpenCV y un robot `omx_f` antes de invertir en políticas más costosas.
- Prototipado de tareas de pick en laboratorio: con solo 30 episodios y 11.660 fotogramas, sirve para evaluar la viabilidad de una tarea antes de escalar la recogida de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política y que la tabla de evaluación está vacía. No se dispone de tasas de éxito en robot real, ni de comparaciones con otras políticas, por lo que no se presentan cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros y pesos en safetensors (repositorio de 0,2 GB), la huella en memoria es del orden de cientos de MB, muy por debajo de cualquier GPU moderna.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con soporte CUDA es suficiente. Una RTX 4090, A100 o H100 no son necesarias para la inferencia, aunque pueden usarse para reentrenamiento.
- Cabe en GPU de consumo: sí, por el tamaño del modelo (51,7 M de parámetros) es previsible que quepa en GPUs de consumo e incluso en CPU para inferencia, aunque el autor no publica requisitos oficiales.
- Opciones de despliegue: LeRobot con `lerobot-rollout` (comando documentado en la model card); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El dataset de entrenamiento se grabó a 15 FPS, pero no se publican medidas de latencia de inferencia ni de throughput en robot real.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / entrada | Licencia | Evaluacion publicada |
|---|---|---|---|---|---|
| kickking/omx_panda_pick_act_pilicy_bs8_ep10 | 51,7 M | ACT (LeRobot) | estado (6,) + imagen 3x480x640 | Apache 2.0 | no |
| Otras politicas ACT en LeRobot Hub | no disponible | ACT (LeRobot) | variable segun dataset | variable | no disponible |
| Diffusion Policy (referencia metodologica) | no disponible | diffusion policy | variable | no disponible | no disponible |

No se dispone de datos verificables de modelos comparables en la informacion proporcionada; la comparativa con alternativas concretas queda como no disponible. La referencia metodologica directa es el artículo de ACT (arXiv:2304.13705), pero no se aportan métricas comparativas en esta ficha.

## Limitaciones y advertencias

- Sin evaluación publicada: la model card declara que no hay resultados de evaluación, por lo que se desconoce la tasa de éxito real de la política.
- Dataset muy reducido: 30 episodios y 11.660 fotogramas a 15 FPS; es probable un sobreajuste y una generalización limitada a posiciones, iluminación y objetos vistos en el entrenamiento.
- Tarea única: etiquetada como "0" y orientada a una tarea de pick concreta; no es un modelo generalista ni reutilizable fuera de esa tarea sin reentrenamiento.
- Dependencia de hardware específico: diseñada para robot `omx_f` con una cámara `camera1` y observaciones de forma (6,) y (3, 480, 640); cambiar el robot, la cámara o la disposición de las observaciones invalida la política.
- Sin capacidades de lenguaje: no soporta tool calling, agentes, razonamiento ni multilingüismo; no debe confundirse con un LLM.
- Riesgo de alucinación: no aplica en el sentido de los modelos de lenguaje, pero sí existe riesgo de acciones erráticas o inseguras fuera de la distribución de entrenamiento.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; la responsabilidad de validar la seguridad en robot real recae en el usuario.
- Autor individual y descargas/likes nulos en el momento de la consulta: no hay evidencia de uso comunitario ni de mantenimiento continuado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kickking/omx_panda_pick_act_pilicy_bs8_ep10
- Dataset de entrenamiento: https://huggingface.co/datasets/kickking/omx_panda_pick_1101
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=kickking/omx_panda_pick_1101
- Articulo ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
