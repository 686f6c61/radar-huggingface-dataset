# omjambhale/act_eraser_in_bucket

## Resumen

`omjambhale/act_eraser_in_bucket` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT) y publicada en Hugging Face Hub mediante la librería LeRobot. No es un modelo de lenguaje: es un controlador visomotor que, a partir de dos cámaras (muñeca y frontal) y del estado articular del robot, predice directamente comandos de acción de 6 dimensiones para un brazo `so_follower` (SO-100/101 de LeRobot). El modelo lo desarrolla el usuario individual omjambhale y está pensado para una única tarea concreta: coger un borrador y depositarlo en un cubo azul.

El interés de esta ficha no está en el rendimiento general, sino en su valor como ejemplo reproducible de un pipeline completo de aprendizaje por imitación: dataset de teleoperación, entrenamiento con LeRobot, pesos en safetensors y un comando de despliegue listo para ejecutar. Con 51.668.614 parámetros y un repositorio de 2,5 GB, es un modelo pequeño que se ejecuta en una GPU de consumo y que sirve como referencia para quien quiera entrenar sus propias políticas ACT.

Conviene subrayar que el autor no ha publicado resultados de evaluación en robot real, de modo que cualquier uso en producción exige una validación propia. La licencia Apache 2.0 facilita la reutilización comercial, pero la política está fuertemente acoplada al robot, a las cámaras y al entorno físico con el que se grabó.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones, entrenado con LeRobot 0.6.1 |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación de un solo paso con historial de acciones por chunk) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; las instrucciones de tarea son texto fijo en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tipo de robot | `so_follower` |
| Cámaras | `wrist` y `front`, 480x640, 3 canales |
| Entrada de estado | `observation.state`, forma `(6,)` |
| Salida de acción | `action`, forma `(6,)` |
| Dataset de entrenamiento | `omjambhale/eraser-in-bucket_20261103_231918` (42 episodios, 37.647 frames, 30 FPS) |
| Tarea | "Pick up the eraser and put it in the blue bucket" |
| Pasos de entrenamiento | 40.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-5 |
| Semilla | 1000 |
| Tamaño del repositorio | 2,5 GB |
| Descargas | 21 |
| Fecha de creación | 2026-11-03 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705 que predice trozos de acción (*action chunks*) en lugar de pasos individuales, lo que reduce el error de acumulación típico de las políticas paso a paso y suaviza la ejecución. La arquitectura combina un codificador visual (típicamente ResNet) que procesa las dos cámaras, la concatenación del estado articular y una representación latente de estilo (CVAE) que captura la variabilidad de las demostraciones humanas, todo ello alimentando un transformer que emite la secuencia de acciones del chunk.

El entrenamiento se realizó con LeRobot 0.6.1 sobre 42 episodios de teleoperación (37.647 frames a 30 FPS) de una única tarea, con 40.000 pasos, batch de 8, AdamW y learning rate 1e-5. No se documenta el uso de RLHF, DPO ni ajuste por refuerzo: es imitación supervisada pura sobre datos de demostración. Tampoco se especifican el número de tokens de entrenamiento (no aplica) ni innovaciones adicionales más allá de las propias de ACT (chunking de acciones y modelado de la variabilidad mediante CVAE).

## Capacidades

- Control visomotor de un brazo robótico `so_follower` con 6 dimensiones de acción a partir de dos cámaras y el estado articular.
- Ejecución de una tarea concreta de pick-and-place: coger un borrador y dejarlo en un cubo azul.
- Predicción de chunks de acción que permiten movimientos más suaves y menor deriva que el control paso a paso.
- Acepta una instrucción de tarea en texto (`--task="Pick up the eraser and put it in the blue bucket"`) como condicionamiento, aunque el modelo está entrenado para una sola tarea.
- Integración nativa con el ecosistema LeRobot: `lerobot-rollout` para ejecución y `lerobot-train` para reentrenamiento.
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades multilingües ni modos de pensamiento: no es un modelo de lenguaje.

## Casos de uso

- Reproducción de un pipeline de imitación de extremo a extremo: sirve como plantilla para grabar un dataset con LeRobot, entrenar una política ACT y desplegarla con `lerobot-rollout`, cubriendo el ciclo completo con código y comandos documentados.
- Automatización de una celda de pick-and-place de laboratorio: el modelo puede ejecutar de forma repetida la tarea de coger un borrador y depositarlo en un cubo, útil para pruebas de repetibilidad en entornos controlados.
- Docencia y formación en robótica de imitación: al ser un modelo pequeño (51,7 M de parámetros) y con licencia Apache 2.0, es adecuado para cursos y talleres donde se quiera mostrar el funcionamiento de ACT sin infraestructura pesada.
- Base para *fine-tuning* en tareas similares: partiendo de estos pesos se puede reentrenar con un dataset propio de otra tarea de manipulación usando el mismo robot y disposición de cámaras, aprovechando el codificador visual ya ajustado.
- Benchmark interno de referencia: permite comparar el rendimiento de otras políticas (Diffusion Policy, VQ-BeT, etc.) sobre el mismo robot y el mismo conjunto de objetos, estableciendo una línea base reproducible.
- Pruebas de integración de hardware: útil para validar la calibración del brazo `so_follower`, la colocación de las cámaras `wrist` y `front` y la latencia del bucle de control antes de invertir en datasets mayores.
- Demostraciones en ferias o vídeos técnicos: la tarea es visualmente clara y el modelo se ejecuta en una GPU de consumo, lo que facilita montar una demo en directo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación vacía y declara explícitamente: "No evaluation results have been provided for this policy yet". No se dispone de tasas de éxito en robot real, ni de comparaciones numéricas con otras políticas sobre la misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 51,7 M de parámetros; en la práctica, el consumo lo dominan los buffers de las cámaras y el runtime de PyTorch, por lo que 2-4 GB de VRAM son suficientes.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM; una RTX 3060, RTX 4060 o RTX 4090 son más que suficientes para inferencia.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU NVIDIA moderna e incluso en CPU para inferencia a baja frecuencia, aunque no se recomienda por latencia.
- Opciones de despliegue: `lerobot-rollout` (comando oficial documentado en la model card); el resto del ecosistema LeRobot (`lerobot-train`, scripts de evaluación) para entrenamiento y validación. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El bucle de control opera a 30 FPS según la tasa del dataset, pero no se publican mediciones de latencia extremo a extremo.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / observacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `omjambhale/act_eraser_in_bucket` | 51,7 M | ACT (LeRobot) | 2 camaras 480x640 + estado (6,) | Apache 2.0 | Hugging Face Hub |
| Políticas ACT de referencia en LeRobot | no disponible | ACT (LeRobot) | depende del dataset | Apache 2.0 (LeRobot) | Hugging Face Hub / docs |
| Diffusion Policy | no disponible en la informacion proporcionada | Política por difusion | depende de la implementacion | no disponible | Repositorios de investigacion |
| VQ-BeT | no disponible en la informacion proporcionada | Política con cuantizacion vectorial | depende de la implementacion | no disponible | Repositorios de investigacion |

No se dispone de datos numericos de rendimiento de estas alternativas en la informacion proporcionada, por lo que la comparativa se limita a aspectos cualitativos y de licencia. La principal diferencia de esta política frente a otras implementaciones de ACT es su especializacion en una unica tarea y robot, no una mejora medible de capacidad.

## Limitaciones y advertencias

- Ausencia total de evaluación publicada: no hay tasas de éxito en robot real, por lo que el rendimiento real es desconocido hasta que el usuario lo valide.
- Fuerte acoplamiento al hardware: entrenada para `so_follower` con cámaras `wrist` y `front` a 480x640; cambiar de robot, de resolución o de disposición de cámaras invalida la política.
- Especialización extrema: solo realiza la tarea "Pick up the eraser and put it in the blue bucket"; no generaliza a otros objetos, posiciones ni instrucciones.
- Dataset pequeño: 42 episodios y 37.647 frames son insuficientes para una robustez alta frente a cambios de iluminación, fondos, posiciones de objetos o distracciones.
- Riesgo de sobreajuste al entorno de grabación: es probable que el modelo dependa de la apariencia concreta del borrador, del cubo azul y de la mesa; no se documenta aumentación de datos.
- Sin capacidades de lenguaje, razonamiento ni tool calling: no debe emplearse como sustituto de un LLM en ningún flujo conversacional.
- Licencia Apache 2.0: permite uso comercial y modificaciones, pero el autor no ofrece garantías ni soporte; el usuario asume la responsabilidad de la validación en producción.
- Sin cuantizaciones publicadas: no hay variantes GGUF ni pesos reducidos, lo que limita el despliegue en entornos sin PyTorch.
- Sesgos y alucinaciones en el sentido de los LLM no aplican; el riesgo equivalente es la ejecución de acciones incorrectas o inseguras ante entradas fuera de distribución, con posible daño físico al robot o al entorno.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/omjambhale/act_eraser_in_bucket
- Dataset de entrenamiento: https://huggingface.co/datasets/omjambhale/eraser-in-bucket_20261103_231918
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=omjambhale/eraser-in-bucket_20261103_231918
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Perfil del autor: https://huggingface.co/omjambhale/models
