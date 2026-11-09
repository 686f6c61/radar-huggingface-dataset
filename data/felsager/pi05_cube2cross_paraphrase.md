# felsager/pi05_cube2cross_paraphrase

## Resumen

`felsager/pi05_cube2cross_paraphrase` es un ajuste fino (fine-tuning) del modelo Vision-Language-Action π₀.₅ (Pi05) de Physical Intelligence, publicado por el usuario felsager a través de la librería LeRobot de Hugging Face. El modelo base, `lerobot/pi05_base`, es la implementación de LeRobot del repositorio OpenPI de Physical Intelligence, y está disenado para la generalización en entornos abiertos en tareas de robótica manipulativa.

Este checkpoint concreto resuelve una tarea muy acotada: recoger un cubo de un color determinado y colocarlo sobre una cruz roja. Está entrenado sobre el dataset `felsager/vla_cubes_cross_dr`, compuesto por 999 episodios y 510.363 fotogramas a 30 FPS, con instrucciones en lenguaje natural que varían el color del cubo objetivo (verde, azul, amarillo y rojo). El sufijo "paraphrase" sugiere que el entrenamiento incluye variaciones de la formulación de la tarea.

El modelo tiene 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) y un tamano de repositorio de 24,5 GB. Es relevante como ejemplo práctico de cómo adaptar un VLA de propósito general a una tarea industrial o de laboratorio concreta mediante imitación, y de cómo el ecosistema LeRobot permite desplegar políticas robóticas end-to-end con un flujo de trabajo reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05) de Physical Intelligence, implementación LeRobot/OpenPI |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea están en inglés) |
| Licencia | gemma |
| Formato de pesos | safetensors |
| Modelo base | lerobot/pi05_base |
| Tipo de robot | ur5e_hand_e |
| Camaras | top, wrist |
| Entrada (observacion) | `observation.state` (10,), `observation.images.top` (3, 480, 640), `observation.images.wrist` (3, 480, 640) |
| Salida (accion) | `action` (10,) |
| Dataset de entrenamiento | felsager/vla_cubes_cross_dr (999 episodios, 510.363 fotogramas, 30 FPS) |
| Pasos de entrenamiento | 30.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 5e-05 |
| Semilla | 0 |
| Version de LeRobot | 0.6.2 |

## Arquitectura y entrenamiento

El modelo se basa en π₀.₅ (Pi05), un modelo Vision-Language-Action de Physical Intelligence que evoluciona π₀ con el objetivo de generalizar a entornos y situaciones completamente nuevos no vistos durante el entrenamiento. La implementación utilizada es la de LeRobot, adaptada del repositorio OpenPI de Physical Intelligence. La arquitectura combina un backbone de visión-lenguaje con un cabezal de acciones que produce vectores de acción de dimensión 10, consumiendo el estado del robot y dos flujos de imagen (cámara superior y cámara en la muneca) a resolución 480x640.

El ajuste fino se realizó mediante aprendizaje por imitación sobre el dataset `felsager/vla_cubes_cross_dr`, que contiene 999 episodios y 510.363 fotogramas capturados a 30 FPS. Las tareas del dataset son cuatro variantes de la misma instrucción, cambiando el color del cubo: "pick up the green cube and place it on the red cross", "pick up the blue cube...", "pick up the yellow cube..." y "pick up the red cube...". El entrenamiento se ejecutó durante 30.000 pasos con batch size 8, optimizador AdamW, learning rate 5e-05 y semilla 0, usando LeRobot 0.6.2. No se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Control robótico manipulativo: genera trayectorias de acción de 10 dimensiones para un brazo UR5e con mano, a partir de observaciones visuales y de estado.
- Percepción visual multi-cámara: procesa simultáneamente imágenes de una cámara superior y una cámara en la muneca a 480x640.
- Comprensión de instrucciones en lenguaje natural: ejecuta tareas descritas en texto, en este caso variantes de "recoger el cubo [color] y colocarlo sobre la cruz roja".
- Generalización a variaciones de color del objeto objetivo (verde, azul, amarillo, rojo) dentro de la misma tarea.
- Aprendizaje por imitación: política entrenada para reproducir demostraciones humanas.
- No se ha documentado soporte de tool calling, function calling, agentes multi-paso, razonamiento explícito ni capacidades de audio.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo puede ejecutar la tarea de recoger un cubo y colocarlo sobre una cruz roja en un entorno controlado con un UR5e, útil para prototipos de investigación en manipulación.
- Clasificación y manipulación por color: al haber sido entrenado con cuatro colores distintos, puede emplearse para seleccionar objetos según su color en líneas de montaje o tareas de selección.
- Base para ajustes finos adicionales: sirve como punto de partida para entrenar variantes sobre nuevos datasets con `lerobot-train`, acelerando el desarrollo de políticas específicas.
- Validación de pipelines de imitación: útil para verificar el flujo completo de LeRobot (grabación, entrenamiento, rollout) antes de escalar a tareas más complejas.
- Investigación en generalización de VLA: permite estudiar cómo un modelo base de propósito general se adapta a una tarea acotada y cómo varía el rendimiento con paráfrasis de instrucciones.
- Demostraciones reproducibles: el comando `lerobot-rollout` documentado permite ejecutar la política durante 60 segundos con una configuración de hardware concreta, lo que facilita la replicación en entornos docentes o de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito, comparativas con otros checkpoints ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 4,14 mil millones de parámetros, una estimación orientativa en FP16 sería de aproximadamente 8-10 GB, pero no está confirmada por el autor.
- GPU recomendadas: no disponible. El comando de entrenamiento documentado usa `--policy.device=cuda`, lo que implica una GPU NVIDIA, pero no se especifica modelo.
- Compatibilidad con GPU de consumo: no confirmada. Por el tamano del modelo, es plausible que quepa en GPUs de consumo con suficiente VRAM, pero no hay datos oficiales.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para entrenamiento). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Requisitos adicionales: robot UR5e con mano, dos cámaras configuradas como `top` y `wrist` a 640x480 y 30 FPS, y puerto de conexión al robot.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| felsager/pi05_cube2cross_paraphrase | 4.143.404.816 | no disponible | VLA (fine-tune de π₀.₅) | gemma | Hugging Face |
| felsager/pi05_cube2cross_dr | no disponible | no disponible | VLA (fine-tune de π₀.₅) | gemma | Hugging Face |
| lerobot/pi05_base | no disponible | no disponible | VLA base (π₀.₅) | gemma | Hugging Face |
| felsager/pi05_cube2cross_dr_200_epis | no disponible | no disponible | VLA (fine-tune de π₀.₅) | gemma | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos checkpoints. Las diferencias conocidas se limitan al dataset de entrenamiento y al número de episodios.

## Limitaciones y advertencias

- Tarea extremadamente acotada: el modelo solo ha sido entrenado para recoger cubos de cuatro colores y colocarlos sobre una cruz roja; no se espera que generalice a otras tareas sin ajuste fino.
- Sin evaluación publicada: no hay tasas de éxito ni validación en robot real documentada, por lo que se desconoce su fiabilidad en producción.
- Dependencia del hardware: requiere un UR5e con mano y una configuración de cámaras concreta (`top` y `wrist`); cambios en la posición, iluminación o tipo de robot pueden degradar el rendimiento.
- Riesgo de sobreajuste al dataset: con 999 episodios de una única tarea, la generalización a posiciones u objetos nuevos es limitada.
- Licencia "gemma": impone restricciones de uso que deben revisarse antes de un despliegue comercial; no es una licencia permisiva estándar.
- Idiomas: las instrucciones de tarea están en inglés; no se documenta soporte multilingüe.
- Sin información sobre sesgos, alucinación o robustez fuera de la distribución de entrenamiento.
- El modelo tiene 0 descargas y 0 likes en Hugging Face, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/felsager/pi05_cube2cross_paraphrase
- Dataset de entrenamiento: https://huggingface.co/datasets/felsager/vla_cubes_cross_dr
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de π₀.₅ de Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: no disponible como enlace directo en la información proporcionada
- LeRobot en GitHub: https://github.com/huggingface/lerobot
- Guía de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Checkpoint relacionado: https://huggingface.co/felsager/pi05_cube2cross_dr
- Checkpoint relacionado: https://huggingface.co/felsager/pi05_cube2cross_dr_200_epis
