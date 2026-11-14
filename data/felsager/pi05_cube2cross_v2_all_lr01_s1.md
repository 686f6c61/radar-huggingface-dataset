# felsager/pi05_cube2cross_v2_all_lr01_s1

## Resumen

π₀.₅ (Pi05) es un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence, disenado para la generalizacion en entornos abiertos. Evoluciona el modelo π₀ para adaptarse a situaciones y entornos no vistos durante el entrenamiento, combinando percepcion visual, comprension del lenguaje y generacion de acciones motoras en un unico modelo. El repositorio `felsager/pi05_cube2cross_v2_all_lr01_s1` es un fine-tuning de `lerobot/pi05_base` realizado con la libreria LeRobot, orientado a una tarea robotica concreta de manipulacion de cubos.

Este checkpoint concreto ha sido entrenado sobre el dataset `felsager/vla_cubes_cross_v2`, compuesto por 1000 episodios y 493.474 frames a 30 FPS, para ejecutar tareas de pick-and-place sobre un robot UR5e con pinza. El modelo consume observaciones de estado (10 dimensiones) y dos flujos de imagen (camara superior y de muneca, 480x640) y produce un vector de accion de 10 dimensiones.

Con 4.143.404.816 parametros y un tamano de repositorio de 42,6 GB, se trata de un modelo de gran tamano pensado para inferencia en hardware dedicado, no para GPUs de consumo. Su relevancia radica en ser un ejemplo practico de fine-tuning de un VLA de proposito general sobre una tarea especifica mediante el ecosistema LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅, implementacion LeRobot adaptada de OpenPI |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las tareas del dataset estan en ingles) |
| Licencia | gemma |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

El modelo se basa en π₀.₅ (Pi05), un modelo Vision-Language-Action de Physical Intelligence que evoluciona π₀ para generalizar a entornos y situaciones nuevos no vistos durante el entrenamiento. La implementacion utilizada procede del repositorio OpenPI adaptado a LeRobot. El modelo procesa observaciones multimodales (estado del robot e imagenes de dos camaras) y genera acciones motoras directamente, sin una etapa intermedia de planificacion explicita.

El fine-tuning se realizo sobre el dataset `felsager/vla_cubes_cross_v2` (1000 episodios, 493.474 frames, 30 FPS) con tareas de pick-and-place de cubos de colores sobre una cruz roja. La configuracion de entrenamiento fue: 30.000 pasos, batch size 16, optimizador AdamW, learning rate 5e-05, semilla 1 y LeRobot 0.6.2. No se dispone de informacion sobre el numero de tokens de entrenamiento ni sobre el uso de RLHF o DPO en el fine-tuning.

## Capacidades

- Generacion de acciones motoras de 10 dimensiones para un robot UR5e con pinza (`ur5e_hand_e`).
- Percepcion visual mediante dos camaras: `top` (vista superior) y `wrist` (vista de muneca), con resolucion 480x640 y 3 canales.
- Comprension de instrucciones en lenguaje natural para definir la tarea (por ejemplo, "pick up the blue cube and place it on the red cross.").
- Ejecucion de tareas de pick-and-place con cuatro variantes de color de cubo (azul, verde, amarillo y rojo).
- Control basado en imitacion (imitation learning) a partir de demostraciones.
- No se ha documentado soporte de tool calling, function calling, agentes multi-paso ni capacidades multilingues.
- No se ha documentado modo thinking, vision general, audio ni otras capacidades especiales mas alla de la politica robotica.

## Casos de uso

- Manipulacion robotica pick-and-place en laboratorio: el modelo ejecuta la tarea de recoger un cubo de color y colocarlo sobre una cruz roja, usando las dos camaras para localizar el objeto y el destino. Es adecuado porque ha sido entrenado especificamente sobre esa tarea con 1000 episodios.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar el fine-tuning de VLAs de proposito general sobre tareas concretas con LeRobot.
- Evaluacion de generalizacion de VLAs: al derivar de π₀.₅, permite analizar como un modelo disenado para generalizacion abierta se comporta tras un fine-tuning estrecho sobre una unica tarea.
- Prototipado de pipelines de robotica con LeRobot: el comando `lerobot-rollout` permite desplegar la politica en un UR5e real con camaras OpenCV, lo que facilita la validacion end-to-end del flujo de trabajo.
- Benchmark de referencia para tareas de clasificacion y colocacion por color: las cuatro variantes de tarea permiten medir la precision del modelo al distinguir colores y localizar la cruz destino.
- Base para fine-tuning adicional: el modelo puede reentrenarse sobre nuevos datasets de manipulacion partiendo de este checkpoint o de `lerobot/pi05_base`, segun la guia de LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 4.143.404.816 parametros y pesos en safetensors, el repositorio ocupa 42,6 GB, lo que sugiere que la inferencia en precision completa requiere al menos esa cantidad de memoria, aunque no se especifica el tipo de cuantizacion ni el formato de despliegue.
- GPU recomendadas: no disponible en la informacion proporcionada. Por el tamano del modelo, es previsible que requiera GPUs de centro de datos (A100, H100) o similares, pero no se confirma.
- Compatibilidad con GPU de consumo: no disponible. El tamano de 42,6 GB hace improbable que quepa en GPUs de consumo sin cuantizacion, pero no se aporta dato oficial.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecucion en robot y `lerobot-train` para entrenamiento). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo de politica robotica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| felsager/pi05_cube2cross_v2_all_lr01_s1 | 4.143.404.816 | no disponible | Pick-and-place UR5e | gemma | Hugging Face (LeRobot) |
| lerobot/pi05_base | no disponible | no disponible | VLA general (base) | no disponible | Hugging Face (LeRobot) |
| π₀ (Pi0) | no disponible | no disponible | VLA general | no disponible | OpenPI (referencia) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La comparativa se limita a la relacion de derivacion (este checkpoint es un fine-tuning de `lerobot/pi05_base`, que a su vez implementa π₀.₅, evolucion de π₀).

## Limitaciones y advertencias

- El modelo esta especializado exclusivamente en la tarea de pick-and-place de cubos sobre una cruz roja con un robot UR5e; no es un modelo de proposito general.
- No se han publicado resultados de evaluacion, por lo que se desconoce su tasa de exito real en el robot.
- La model card no documenta sesgos conocidos, pero al ser un modelo entrenado sobre un dataset limitado (1000 episodios de una tarea concreta), es probable que no generalice a objetos, posiciones o iluminaciones fuera de la distribucion de entrenamiento.
- Riesgo de alucinacion: no aplica en el sentido textual, pero el modelo puede generar acciones incorrectas o inseguras si la percepcion visual no coincide con lo esperado.
- Limitaciones de idioma: las instrucciones de tarea estan en ingles; no se documenta soporte multilingue.
- Restricciones de licencia: la licencia es `gemma`, lo que implica posibles restricciones de uso comercial heredadas de la licencia de Gemma; debe revisarse antes de un despliegue en produccion.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.
- El modelo requiere hardware robotico especifico (UR5e con pinza) y dos camaras configuradas con los nombres `top` y `wrist`; no es desplegable en entornos sin robot.
- La fecha de creacion (2026-11-14) es futura respecto a la informacion habitual de modelos publicados, lo que conviene verificar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/felsager/pi05_cube2cross_v2_all_lr01_s1
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/felsager/vla_cubes_cross_v2
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=felsager/vla_cubes_cross_v2
- Blog de π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
