# ranjith3567/pick_yellow_cube_v5.1_chunk30

## Resumen

`pick_yellow_cube_v5.1_chunk30` es una política de robótica entrenada con LeRobot sobre la arquitectura SmolVLA, un modelo visión-lenguaje-acción (VLA) compacto presentado en el paper arXiv 2506.01844. Lo publica el usuario `ranjith3567` y está especializado en una única tarea de manipulación: coger un bloque amarillo y depositarlo en una caja marrón, con un robot de tipo `so_follower` y dos cámaras (`Top` y `Side`).

El modelo tiene 450.046.176 parámetros (unos 450 M) y un repositorio de 0,9 GB en formato safetensors. Consume observaciones de estado de 6 dimensiones y cuatro entradas visuales (tres cámaras a 256x256 y una cámara vacía a 480x640), y produce un vector de acción de 6 dimensiones. Es, por tanto, un modelo de imitación de extremo a extremo orientado a despliegue en hardware de consumo, no un modelo de lenguaje general.

Su relevancia es acotada: se trata de un checkpoint de política entrenado sobre un dataset propio de 100 episodios y 63.143 fotogramas a 30 FPS, sin resultados de evaluación publicados. Sirve como referencia práctica de cómo se entrena y despliega un SmolVLA con LeRobot 0.6.2, pero no debe considerarse un modelo de propósito general ni un artefacto validado en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, familia SmolVLA de LeRobot) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la tarea se define en inglés: "pick the yellow block and place it in brown box") |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | lerobot (version 0.6.2) |
| Pipeline | robotics |
| Tipo de robot | `so_follower` |
| Camaras | `Top`, `Side` (mas `empty_camera_0`) |
| Entrada de estado | `observation.state`, shape `(6,)` |
| Entradas visuales | `observation.images.camera1` `(3, 256, 256)`, `camera2` `(3, 256, 256)`, `camera3` `(3, 256, 256)`, `empty_camera_0` `(3, 480, 640)` |
| Salida | `action`, shape `(6,)` |
| Tamano del repositorio | 0,9 GB |
| Dataset de entrenamiento | `ranjith3567/pick_yellow_cube_v5_20261105_191046` (100 episodios, 63.143 fotogramas, 30 FPS) |

## Arquitectura y entrenamiento

SmolVLA es un modelo visión-lenguaje-acción compacto que combina percepción visual y comprensión del lenguaje con la generación directa de acciones motoras, diseñado para reducir el coste computacional y permitir el despliegue en hardware de consumo. La política consume las observaciones multimodales (estado articular de 6 dimensiones y las imágenes de las cámaras) y emite un vector de acción de 6 dimensiones por paso de control. No se dispone en la información proporcionada de detalles sobre el número de capas, dimensión oculta ni mecanismo de atención concreto de este checkpoint.

El entrenamiento se realizó con LeRobot 0.6.2 mediante imitación supervisada sobre el dataset indicado: 30.000 pasos, batch size 8, optimizador AdamW, learning rate 0,0001 y semilla 1000. El dataset consta de 100 episodios y 63.143 fotogramas grabados a 30 FPS para la tarea "pick the yellow block and place it in brown box". No se documenta en la model card el uso de RLHF, DPO ni ninguna fase de ajuste por refuerzo, ni innovaciones técnicas adicionales más allá de las propias del método SmolVLA referenciado en el paper.

## Capacidades

- Control robótico de manipulación de extremo a extremo para una tarea concreta: coger un bloque amarillo y colocarlo en una caja marrón.
- Percepción visual multi-cámara: procesa tres vistas a 256x256 y una vista adicional a 480x640.
- Fusión de estado propioceptivo (`observation.state` de 6 dimensiones) con información visual.
- Generación de acciones continuas de 6 dimensiones compatibles con el robot `so_follower`.
- Condicionamiento por instrucción en lenguaje natural (la tarea se pasa como texto en el comando de rollout).
- Ejecución de políticas de imitación en tiempo real a 30 FPS, coherente con la frecuencia de grabación del dataset.
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes, matemáticas, código ni modalidades de audio.

## Casos de uso

- Recogida automatizada de piezas en línea de montaje: el modelo ejecuta la secuencia de aproximación, agarre y depósito de un objeto concreto sobre un robot `so_follower`, adecuado para tareas repetitivas de pick-and-place en entornos controlados.
- Prototipado de políticas de imitación con LeRobot: sirve como ejemplo reproducible de entrenamiento y despliegue de un SmolVLA, útil para equipos que quieran replicar el flujo con sus propios datos.
- Investigación en aprendizaje por imitación: el checkpoint permite estudiar el comportamiento de una política entrenada con 100 episodios y analizar generalización, sensibilidad a la posición de objetos y robustez ante cambios de iluminación.
- Docencia y formación en robótica: al ejecutarse en hardware de consumo y con comandos CLI sencillos (`lerobot-rollout`), es apto para prácticas de laboratorio sobre VLA y control visual.
- Benchmark interno de referencia: puede usarse como línea base para comparar nuevas políticas entrenadas sobre el mismo dataset o con variaciones de hiperparámetros.
- Pruebas de integración de pipelines de inferencia robótica: valida la cadena completa de captura de cámaras, sincronización a 30 FPS y envío de acciones al robot antes de escalar a tareas más complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 M parámetros en safetensors (0,9 GB de repositorio), la inferencia en precisión nativa requiere del orden de 1-2 GB de memoria, aunque esta cifra no está confirmada por el autor.
- GPU recomendadas: no disponible. El método SmolVLA se describe como desplegable en hardware de consumo, pero no se especifican modelos concretos para este checkpoint.
- Compatibilidad con GPU de consumo: probable según el diseño del método, pero no confirmada para este checkpoint.
- Opciones de despliegue: LeRobot 0.6.2 mediante `lerobot-rollout` (estrategia `base`) y `lerobot-train` para reentrenamiento; no se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible; la política está pensada para operar a 30 FPS, la frecuencia del dataset, pero no se publican mediciones.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea y un único tipo de robot (`so_follower`); no generaliza a otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito ni pruebas en robot real, por lo que se desconoce su fiabilidad.
- Dataset pequeño: 100 episodios y 63.143 fotogramas son un volumen limitado, lo que aumenta el riesgo de sobreajuste a posiciones, iluminación y disposición concretas del entorno de grabación.
- Licencia no disponible: no se puede confirmar el uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Idiomas no especificados: la instrucción de tarea está en inglés y no se documenta soporte multilingüe.
- Dependencia de la configuración de cámaras: los nombres e índices de cámara deben coincidir con las claves de observación del entrenamiento (`camera1`, `camera2`, `camera3`, `empty_camera_0`), lo que limita la portabilidad.
- Riesgo de alucinación motora: como política de imitación, puede generar acciones plausibles pero incorrectas ante estados fuera de distribución, sin mecanismo de verificación interno.
- Sin garantías de seguridad física: no se documentan límites de par, paradas de emergencia ni validación en entornos con personas.
- Repositorio con 0 descargas y 0 likes: sin evidencia de uso comunitario ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ranjith3567/pick_yellow_cube_v5.1_chunk30
- Dataset de entrenamiento: https://huggingface.co/datasets/ranjith3567/pick_yellow_cube_v5_20261105_191046
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ranjith3567/pick_yellow_cube_v5_20261105_191046
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
