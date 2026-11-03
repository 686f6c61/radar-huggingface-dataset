# OwenLi1/act_oranges_policy

## Resumen

`act_oranges_policy` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT) y publicada en HuggingFace Hub mediante la librería LeRobot. La desarrolla el usuario OwenLi1 y resuelve una tarea muy concreta: recoger naranjas ("Grab Oranges") con un brazo robótico de tipo `so_follower` equipado con una única cámara frontal. No es un modelo de lenguaje: es un controlador visuomotor que mapea observaciones (estado de las articulaciones e imagen) a comandos de acción de 6 dimensiones.

El modelo tiene 51.668.614 parámetros y un peso de repositorio de 0,2 GB en formato safetensors, lo que lo sitúa en la categoría de políticas ligeras que pueden ejecutarse en tiempo real a 30 FPS en hardware modesto. Fue entrenado durante 100.000 pasos con batch size 8 y learning rate 1e-5 sobre un dataset propio de solo 11 episodios y 2.969 fotogramas, una cantidad de datos muy reducida que refleja el enfoque de imitación de bajo coste que promueve LeRobot.

Su relevancia actual es la de servir como ejemplo reproducible de entrenamiento de políticas robóticas con LeRobot 0.6.2: demuestra el flujo completo de grabación de datos con teleoperación, entrenamiento con ACT y despliegue en un robot real. No obstante, al ser un modelo de autor individual, sin licencia declarada y sin evaluación publicada, su utilidad práctica queda limitada al ámbito experimental y educativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política visuomotora por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | lerobot 0.6.2 |
| Tipo de robot | so_follower |
| Camaras | front (1 camara, 3x480x640) |
| Entrada observation.state | tensor (6,) |
| Entrada observation.images.front | imagen (3, 480, 640) |
| Salida action | tensor (6,) |
| Frecuencia de datos | 30 FPS |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers), descrito en el paper arXiv:2304.13705, es un método de aprendizaje por imitación que predice trozos de acción (action chunks) en lugar de pasos individuales. La arquitectura combina un codificador visual (procesa la imagen frontal de 3x480x640), un codificador del estado de las articulaciones (vector de 6 dimensiones) y un transformer que genera secuencias de acciones de 6 dimensiones. La predicción por chunks reduce el error de acumulación y mejora la estabilidad del control, además de suavizar el comportamiento frente a cambios bruscos en las observaciones.

El entrenamiento se realizó con LeRobot 0.6.2 durante 100.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000, sobre el dataset `OwenLi1/lerobot_dataset`: 11 episodios, 2.969 fotogramas a 30 FPS y una única tarea ("Grab Oranges"). No se documenta el uso de RLHF, DPO ni técnicas de refuerzo; se trata de aprendizaje supervisado puro a partir de demostraciones teleoperadas. No se especifica la composición exacta de los datos de entrenamiento más allá de la tarea y el robot utilizados.

## Capacidades

- Control visuomotor de un brazo robótico `so_follower` con 6 grados de libertad de acción.
- Ejecución de la tarea de recoger naranjas ("Grab Oranges") a partir de una imagen frontal y el estado de las articulaciones.
- Predicción de chunks de acción, lo que aporta estabilidad y suavidad en el movimiento.
- Inferencia en tiempo real a 30 FPS, compatible con el bucle de control del robot.
- Integración nativa con el ecosistema LeRobot: comandos `lerobot-rollout` y `lerobot-train`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni capacidades multilingües, de visión general, audio o thinking mode. Es exclusivamente una política de imitación para una tarea robótica concreta.

## Casos de uso

- Recogida automatizada de objetos en un brazo `so_follower`: el modelo ejecuta la política entrenada para agarrar naranjas, usando la imagen frontal y el estado articular como entrada y emitiendo comandos de 6 dimensiones a 30 FPS.
- Reproducción de experimentos de imitación con LeRobot: sirve como referencia para validar el pipeline completo (grabación, entrenamiento, despliegue) con un caso de bajo coste y pocos episodios.
- Base para fine-tuning en tareas similares: al ser una política ACT ligera (51,7 M de parámetros), puede adaptarse a nuevas tareas de agarre con datasets pequeños, reutilizando la arquitectura y el flujo de LeRobot.
- Docencia y formación en robótica de imitación: ejemplo didáctico de cómo se entrena y despliega una política visuomotora con teleoperación y una sola cámara.
- Pruebas de integración de hardware: permite verificar la calibración y el cableado de un robot `so_follower` y de su cámara frontal antes de abordar tareas más complejas.
- Benchmark interno de pipelines de control: puede usarse como línea base para comparar latencia, estabilidad y éxito de agarre frente a otras políticas (Diffusion Policy, VQ-BeT) en el mismo robot.
- Prototipado de automatización en laboratorio: para tareas de pick-and-place de objetos naranjas en entornos controlados, con la limitación de que no hay evaluación de éxito publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros y pesos en safetensors de 0,2 GB, la huella es muy reducida y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con al menos 4 GB de VRAM debería ser suficiente; se recomienda una RTX 3060/4060 o superior para margen y para el procesamiento de imagen a 30 FPS.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU moderna con 4 GB o más de VRAM; también es viable en CPU para inferencia a baja frecuencia, aunque no se documenta.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=OwenLi1/act_oranges_policy`), integración con el stack de HuggingFace y PyTorch. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles. El dataset y el control operan a 30 FPS, pero no se publican mediciones de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_oranges_policy (este) | 51,7 M | no aplica | sin evaluacion publicada | no disponible | HuggingFace Hub |
| ACT generico (LeRobot) | variable segun config | no aplica | documentado en paper ACT | Apache 2.0 (LeRobot) | HuggingFace / GitHub |
| Diffusion Policy | no disponible | no aplica | no disponible | no disponible | repositorios de investigacion |
| VQ-BeT | no disponible | no aplica | no disponible | no disponible | repositorios de investigacion |

No se dispone de datos comparativos de rendimiento entre estas políticas en la información proporcionada. La comparación se limita a la disponibilidad y al marco de licencia del ecosistema LeRobot, no al modelo concreto.

## Limitaciones y advertencias

- Sin licencia declarada: la model card indica "More Information Needed" en el campo de licencia, por lo que no se garantiza el uso comercial ni la redistribución.
- Sin evaluación publicada: no hay resultados de éxito en robot real, ni pruebas con posiciones nuevas de objetos, iluminación distinta o distracciones.
- Dataset muy reducido: 11 episodios y 2.969 fotogramas implican un riesgo alto de sobreajuste y baja generalización a variaciones del entorno.
- Tarea única y específica: solo se ha entrenado para "Grab Oranges" con un robot `so_follower` y una cámara frontal; no es reutilizable directamente en otras tareas sin reentrenamiento.
- Dependencia de hardware concreto: la política asume la configuración exacta de robot y cámara (6 dimensiones de estado y acción, imagen 3x480x640); cambios en la cinemática o en la cámara invalidan el modelo.
- Riesgo de alucinación en el sentido de acciones incorrectas: al ser una política de imitación, puede generar movimientos erráticos o inseguros ante observaciones fuera de distribución.
- Sin soporte de lenguaje ni de instrucciones textuales: la tarea está fijada en el entrenamiento y no puede modificarse mediante prompts.
- Sin datos de sesgos: no se documentan sesgos demográficos ni de otro tipo, aunque al tratarse de un modelo robótico no aplican los sesgos típicos de los LLM.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso o validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OwenLi1/act_oranges_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/OwenLi1/lerobot_dataset
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=OwenLi1/lerobot_dataset
