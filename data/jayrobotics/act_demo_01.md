# JayRobotics/ACT_demo_01

## Resumen

JayRobotics/ACT_demo_01 es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), un algoritmo de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales. El modelo ha sido entrenado y publicado mediante LeRobot, la librería de Hugging Face para aprendizaje automático en robótica del mundo real, y está pensado para ejecutarse sobre un brazo seguidor del tipo `so_follower` (familia SO-100) equipado con dos cámaras.

Se trata de un modelo de visión-acción especializado, no de un modelo de lenguaje: consume el estado de las articulaciones y dos imágenes RGB (muñeca y frontal) a 480x640, y produce un vector de acción de 6 dimensiones. Cuenta con 51.668.614 parámetros y ocupa 0.2 GB en el repositorio, lo que lo sitúa en la categoría de políticas ligeras capaces de ejecutarse en hardware de consumo.

Su relevancia es la de servir como ejemplo reproducible de entrenamiento de extremo a extremo con LeRobot: la model card documenta el conjunto de datos (50 episodios, 32.039 fotogramas a 30 FPS), la tarea concreta ("coger la caja del servo y meterla en la cesta transparente") y la configuración completa de entrenamiento, lo que lo convierte en una referencia útil para quien quiera replicar el flujo de trabajo o hacer fine-tuning sobre una tarea propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con CVAE (ACT, Action Chunking with Transformers); backbone visual basado en ResNet |
| Parametros totales | 51.668.614 |
| Longitud de contexto | no aplicable; no es un modelo de lenguaje. El equivalente funcional es el horizonte de acciones (action chunking), cuyo tamano no figura en la informacion disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors; no se documentan variantes GGUF, int8 ni int4) |
| Idiomas soportados | no disponible / no aplicable (no procesa lenguaje natural como senal de control) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (model.safetensors), complementado por config.json y policy_postprocessor.json |
| Tipo de robot | `so_follower` |
| Camaras | `front` y `wrist` |
| Dimension de observacion | `observation.state` (6,); `observation.images.front` (3, 480, 640); `observation.images.wrist` (3, 480, 640) |
| Dimension de accion | `action` (6,) |
| Tamano del repositorio | 0.2 GB |
| Libreria | lerobot (version 0.6.2 en el entrenamiento) |
| Fecha de creacion | 2026-09-27 |

## Arquitectura y entrenamiento

ACT es un metodo de aprendizaje por imitacion que combina un transformer encoder-decoder con un autoencoder variacional condicional (CVAE). El encoder procesa la secuencia de observaciones (estado de las articulaciones e imagenes de las camaras) junto con una variable latente de estilo, mientras que el decoder genera un "chunk" de acciones futuras de forma no autoregresiva. Esta prediccion por bloques, en lugar de paso a paso, reduce el error de compounding y permite tasas de exito altas en tareas de manipulacion fina con hardware de bajo coste, tal como describe el paper original de ACT (arXiv:2304.13705).

La politica se entreno con LeRobot sobre el dataset `data/servobox_50`, compuesto por 50 episodios de teleoperacion y 32.039 fotogramas capturados a 30 FPS, para una unica tarea: "Hold the servo motor box and put it in the transparent basket". La configuracion de entrenamiento documentada incluye 50.000 pasos, batch size de 16, optimizador AdamW, learning rate de 1e-05 y semilla 1000. No se menciona en la informacion disponible el uso de RLHF, DPO ni de entrenamiento con refuerzo; el paradigma es puramente de imitacion supervisada a partir de demostraciones.

## Capacidades

- Generacion de acciones de manipulacion de 6 grados de libertad a partir de dos vistas de camara y del estado de las articulaciones.
- Prediccion por chunks de acciones (action chunking), orientada a movimientos suaves y consistentes.
- Ejecucion de una tarea concreta de pick-and-place: coger la caja de servos y depositarla en la cesta transparente.
- Control en bucle cerrado a 30 FPS, sincronizado con la tasa de captura del dataset de entrenamiento.
- Fusión de informacion visual de dos camaras (frontal y de muneca) con el estado propioceptivo del robot.
- No dispone de tool calling, function calling ni soporte de agentes.
- No dispone de capacidades multilingues ni de procesamiento de lenguaje natural.
- No dispone de modo de razonamiento explicito (thinking mode), audio ni vision generalista.
- Capacidad de servir como punto de partida para fine-tuning en tareas de manipulacion similares.

## Casos de uso

- Pick-and-place industrial ligero: la politica puede automatizar la tarea de recoger una pieza y depositarla en un contenedor sobre un brazo SO-100, adecuada para lineas de montaje de bajo volumen donde no compensa un brazo industrial de mayor coste.
- Replicacion de demostraciones teleoperadas: permite convertir grabaciones de un operador humano en una politica autonoma, reduciendo el esfuerzo de programacion de trayectorias explicitas.
- Fine-tuning para tareas propias: al estar liberado bajo Apache 2.0 y con la configuracion de entrenamiento documentada, sirve como base para reentrenar con un dataset nuevo y adaptar la politica a otra tarea de recogida.
- Banco de pruebas de pipelines de imitation learning: util para validar el flujo completo de LeRobot (grabacion con `lerobot-rollout`, entrenamiento con `lerobot-train`, evaluacion en robot real) antes de escalar a proyectos mayores.
- Robotica educativa y de investigacion: su tamano reducido (51,7 M de parametros) y su ejecucion en GPU de consumo lo hacen apropiado para laboratorios y cursos donde se necesita un caso real de vision-accion.
- Demostraciones de bajo coste: permite montar un puesto de demostracion con hardware tipo SO-100 y dos camaras USB, con inferencia en un portatil con GPU modesta o incluso en CPU.
- Evaluacion de robustez: util para medir como se degrada la tasa de exito ante cambios de posicion, iluminacion o presencia de distracciones, ya que la tarea y el dataset estan perfectamente delimitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica ("No evaluation results have been provided for this policy yet."), por lo que no hay tasas de exito en robot real ni metricas comparables que puedan presentarse sin inventar datos.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB para los pesos en fp32 (51,7 M de parametros, aproximadamente 207 MB), mas el coste de las activaciones al procesar dos imagenes de 480x640 por paso. En la practica cabe holgadamente en cualquier GPU con 4 GB o mas.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA y al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4090, A100, H100). El modelo no requiere aceleradores de gama alta.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna e incluso en iGPU con suficiente memoria compartida, aunque con menor throughput.
- Ejecucion en CPU: posible a traves de LeRobot, aunque la latencia puede no alcanzar los 30 FPS necesarios para un control fluido.
- Opciones de despliegue: LeRobot mediante el comando `lerobot-rollout` con `--policy.path=JayRobotics/ACT_demo_01`; soporte CUDA (`--policy.device=cuda`) y CPU. No se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles. La politica esta pensada para operar a 30 FPS, la misma frecuencia del dataset de entrenamiento, pero no se publican mediciones de latencia reales.

## Comparativa con modelos similares

No se dispone de datos de rendimiento, parametros ni contexto de modelos comparables en la informacion proporcionada, por lo que la comparacion cuantitativa no puede realizarse. A continuacion se indican alternativas de la misma categoria (politicas de manipulacion para brazos de bajo coste) con los datos disponibles.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JayRobotics/ACT_demo_01 | ACT (imitation learning) | 51.668.614 | no aplicable | apache-2.0 | Hugging Face (0 descargas, 0 likes) |
| JayRobotics/ACT_demo_03 | ACT (imitation learning) | no disponible (pesos de 207 MB en el repo) | no aplicable | no disponible | Hugging Face |
| Diffusion Policy | diffusion policy (imitation learning) | no disponible | no aplicable | no disponible | paper y repositorio publicos |
| SmolVLA | vision-language-action | no disponible | no aplicable | no disponible | Hugging Face (LeRobot) |

## Limitaciones y advertencias

- Sesgos conocidos: la politica aprende de un unico operador y de un unico entorno de grabacion, por lo que hereda los sesgos de estilo, velocidad y trayectoria de las demostraciones.
- Riesgo de fallo y comportamiento espurio: al ser un modelo de imitacion sin verificacion explicita, puede ejecutar acciones incorrectas ante objetos, posiciones o iluminaciones fuera de la distribucion del dataset.
- Sobreajuste a la tarea: esta entrenada exclusivamente para "coger la caja del servo y meterla en la cesta transparente"; no generaliza a otras tareas sin reentrenamiento o fine-tuning.
- Dependencia del hardware: requiere un robot `so_follower` y dos camaras con los nombres de observacion `front` y `wrist` y la resolucion 480x640; cualquier desviacion invalida la inferencia.
- Limitacion de idioma: no aplica, ya que no procesa lenguaje natural.
- Restricciones de licencia: la licencia apache-2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de copyright y la atribucion correspondiente.
- Ausencia de evaluacion: el autor no ha publicado tasa de exito en robot real, por lo que no hay evidencia verificada de rendimiento en produccion.
- Popularidad nula: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Fecha de creacion futura (2026-09-27) en los metadatos del repositorio, un dato a tener en cuenta al citar el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JayRobotics/ACT_demo_01
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Dataset de entrenamiento: https://huggingface.co/datasets/data/servobox_50
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos (cheat-sheet): https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador de datasets de LeRobot: https://huggingface.co/spaces/lerobot/visualize_dataset?path=data/servobox_50
- Modelo relacionado del mismo autor, ACT_demo_03: https://huggingface.co/JayRobotics/ACT_demo_03
- Perfil del autor en Hugging Face: https://huggingface.co/JayRobotics
- Perfil del autor en GitHub: https://github.com/JayRobotics
