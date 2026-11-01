# edgarcancinoe/smolvla_water_libero-4s-dart-full-xxl-sd-rel-b64-dagger12-12k

## Resumen

SmolVLA es un modelo compacto de vision-lenguaje-accion (VLA) desarrollado por Hugging Face, orientado a control robotico mediante aprendizaje por imitacion. Este checkpoint concreto, publicado por el usuario edgarcancinoe, es un ajuste fino del modelo base lerobot/smolvla_base sobre el dataset edgarcancinoe/water_pour_dagger12, especializado en la tarea de regar plantas (izquierda, centro y derecha) con un robot Franka Panda. El modelo combina percepcion visual (dos camaras a 256x256), estado proprioceptivo de 8 dimensiones y una politica de acciones de 7 dimensiones, y esta pensado para desplegarse en hardware de consumo.

Con 604.934.176 parametros (unos 605 millones) y un repositorio de 1,2 GB en formato safetensors, el modelo se posiciona como una alternativa ligera frente a VLA de mayor tamano como OpenVLA o RT-2. La relevancia actual reside en que demuestra que es posible entrenar politicas VLA utiles en una sola GPU consumer, con un pipeline estandarizado a traves de LeRobot (version 0.6.1) y con licencia Apache 2.0, lo que facilita su reutilizacion y reproduccion.

El checkpoint incorpora datos de DAgger (12 iteraciones, segun el nombre del repositorio) sobre 1403 episodios y 302.442 frames a 20 FPS, lo que indica un esfuerzo de correccion de errores en la politica mas alla del simple comportamiento clonado. Es, por tanto, un ejemplo practico de flujo completo de investigacion en robotica: recogida de datos, entrenamiento por imitacion, agregacion de datos y despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) basada en transformer, segun el paper SmolVLA (arXiv:2506.01844) |
| Parametros totales | 604.934.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica, no de texto general) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot 0.6.1 |
| Modelo base | lerobot/smolvla_base |
| Tipo de robot | panda (Franka Panda) |
| Entradas | observation.images.image (3,256,256), observation.images.image2 (3,256,256), observation.state (8,) |
| Salidas | action (7,) |
| Dataset de entrenamiento | edgarcancinoe/water_pour_dagger12 (1403 episodios, 302.442 frames, 20 FPS) |
| Pasos de entrenamiento | 4000 |
| Batch size | 64 |
| Optimizador | adamw |
| Learning rate | 0.0001 |
| Semilla | 1000 |

## Arquitectura y entrenamiento

SmolVLA es un modelo de vision-lenguaje-accion que fusiona un codificador visual, un codificador de lenguaje y un decodificador de acciones en una unica politica condicionada por instrucciones en lenguaje natural. El modelo consume dos flujos de imagen de 256x256 pixeles junto con el estado del robot (8 dimensiones) y emite acciones continuas de 7 dimensiones (tipicamente posicion y orientacion del efector final mas la apertura del gripper). El paper de referencia (arXiv:2506.01844) describe el diseno como un VLA compacto y eficiente, pensado para reducir costes computacionales manteniendo un rendimiento competitivo, y desplegable en hardware de consumo.

El entrenamiento de este checkpoint parte de lerobot/smolvla_base y se ajusta sobre el dataset water_pour_dagger12, que contiene 1403 episodios y 302.442 frames grabados a 20 FPS para tres tareas de riego ("Water the left plant", "Water the middle plant", "Water the right plant"). El sufijo "dagger12" del repositorio sugiere la aplicacion de Dataset Aggregation (DAgger) en 12 iteraciones, una tecnica de aprendizaje por imitacion interactivo en la que un experto etiqueta los estados visitados por la politica para corregir sus errores. La configuracion de entrenamiento reportada es de 4000 pasos, batch de 64, optimizador AdamW y learning rate 1e-4 con semilla 1000, gestionada mediante LeRobot 0.6.1. No se especifica en la informacion disponible el numero total de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO, algo poco habitual en politicas de robotica.

## Capacidades

- Generacion de acciones motoras continuas de 7 dimensiones para un robot Franka Panda a partir de observaciones visuales y de estado.
- Percepcion visual estereo mediante dos camaras (`image` e `image2`) a resolucion 256x256.
- Condicionamiento por instruccion en lenguaje natural: el modelo acepta una tarea textual ("Water the left plant", "Water the middle plant", "Water the right plant") y adapta su comportamiento.
- Ejecucion de politicas de imitacion entrenadas con DAgger, lo que mejora la robustez frente a estados fuera de distribucion respecto a la clonacion de comportamiento pura.
- Despliegue en hardware de consumo, segun las afirmaciones del paper de SmolVLA.
- No se dispone de informacion sobre soporte de tool calling, function calling, agentes multi-paso, capacidades multilingues, modo thinking, vision general, audio u otras capacidades de modelos de lenguaje generales. Este es un modelo de robotica, no un LLM conversacional.

## Casos de uso

- Riego automatizado de plantas en entornos controlados: el modelo ejecuta las instrucciones "Water the left plant", "Water the middle plant" y "Water the right plant" sobre un Franka Panda, usando las dos camaras para localizar la planta y el estado del robot para planificar la trayectoria del efector final. Es el caso de uso principal y el unico documentado en el checkpoint.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida reproducible para estudiar el efecto de DAgger en politicas VLA, ya que el dataset y la configuracion de entrenamiento estan publicados y el modelo base es accesible.
- Benchmark de VLA compactos: con 605 millones de parametros, permite comparar la relacion coste-rendimiento frente a VLA de mayor tamano en tareas de manipulacion de un solo brazo.
- Prototipado rapido en laboratorios con hardware limitado: al caber presumiblemente en una GPU consumer (el paper lo afirma para el modelo base), un grupo de investigacion puede iterar sobre el ajuste fino sin acceso a clusters de gran escala.
- Base para ajuste fino en tareas de manipulacion similares: el modelo puede reentrenarse con LeRobot sobre nuevos datasets de tareas como verter, recoger o colocar objetos, reutilizando el conocimiento visual y motor del modelo base.
- Docencia y formacion en robotica: el pipeline completo (grabacion con LeRobot, entrenamiento, rollout con `lerobot-rollout`) es un ejemplo didactico de flujo de trabajo de robotica de imitacion de principio a fin.
- Evaluacion de robustez ante cambios de posicion de objetos: las tres variantes de tarea (izquierda, centro, derecha) permiten estudiar la generalizacion espacial de la politica dentro de un mismo entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de exito en tareas reales, ni de comparaciones numericas con otros VLA en MMLU, HumanEval, GSM8K u otros benchmarks, que por otra parte no aplican a un modelo de robotica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con 604.934.176 parametros en precision completa (fp32) el modelo ocuparia aproximadamente 2,4 GB solo en pesos, y alrededor de 1,2 GB en fp16/bf16; a ello hay que sumar el codificador visual y las activaciones, por lo que una estimacion conservadora se situa en el rango de 4 a 8 GB de VRAM, aunque esta cifra no esta confirmada en la informacion proporcionada.
- GPU recomendadas: no se especifican en la model card. El paper de SmolVLA afirma que el modelo puede desplegarse en hardware de consumo, lo que sugiere GPU consumer como RTX 3090 o RTX 4090, pero no hay una lista oficial en la informacion disponible.
- Cabe en GPU consumer: probablemente si, segun la afirmacion del paper sobre el modelo base; sin confirmacion especifica para este checkpoint.
- Opciones de despliegue: LeRobot 0.6.1 mediante el comando `lerobot-rollout` con `--policy.path=<repo>`, robot `panda` y dos camaras OpenCV. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a una politica VLA de robotica.
- Latencia y throughput estimados: no disponibles. La frecuencia de control del dataset es de 20 FPS, pero no se reporta la latencia de inferencia del modelo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este checkpoint ni de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas estructurales conocidas.

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smolvla_water_libero-4s-dart-full-xxl-sd-rel-b64-dagger12-12k (este) | 604.934.176 | VLA (LeRobot) | no disponible | apache-2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible en la informacion | VLA (LeRobot) | no disponible | no disponible en la informacion | Hugging Face |
| OpenVLA | no disponible en la informacion | VLA | no disponible | no disponible en la informacion | no disponible |
| RT-2 | no disponible en la informacion | VLA | no disponible | no disponible | no disponible |

No se han proporcionado resultados de benchmarks que permitan una comparacion cuantitativa con alternativas. Cualquier afirmacion sobre superioridad o inferioridad frente a OpenVLA o RT-2 careceria de respaldo en la informacion disponible.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo esta entrenado unicamente para tres tareas de riego de plantas sobre un robot Franka Panda; no es un modelo generalista y probablemente fallara en entornos, objetos o robots distintos.
- Ausencia de evaluacion publicada: no hay tasas de exito ni resultados de pruebas en robot real, por lo que se desconoce su fiabilidad en produccion.
- Dependencia del hardware: requiere un robot Panda con dos camaras configuradas con los nombres `image` e `image2` y un estado de 8 dimensiones; cualquier desviacion en la configuracion invalida el uso directo.
- Riesgo de sobreajuste al dataset: con 1403 episodios y 4000 pasos de entrenamiento sobre un modelo base, el ajuste puede degradar capacidades generales del modelo original.
- Sesgos conocidos: no se documentan sesgos especificos, pero al ser un modelo entrenado en un entorno fisico concreto puede heredar sesgos de posicion, iluminacion y disposicion de los objetos del dataset.
- Riesgo de alucinacion motora: como toda politica de imitacion, puede generar acciones plausibles pero incorrectas en estados no vistos, con riesgo de colision o dano fisico; se recomienda supervision humana y limites de seguridad en el robot.
- Limitaciones de contexto e idioma: no se dispone de informacion sobre longitud de contexto ni sobre capacidades multilingues; las instrucciones de tarea estan en ingles y limitadas a tres frases.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar el cumplimiento de las licencias de los componentes base (lerobot/smolvla_base y el paper SmolVLA) y de los datos de entrenamiento.
- Fecha de creacion futura: el repositorio figura creado el 2026-10-27, lo que puede indicar un error de metadatos o una fecha planificada; conviene verificar la integridad del checkpoint antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/edgarcancinoe/smolvla_water_libero-4s-dart-full-xxl-sd-rel-b64-dagger12-12k
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/edgarcancinoe/water_pour_dagger12
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=edgarcancinoe/water_pour_dagger12
- Paper SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
