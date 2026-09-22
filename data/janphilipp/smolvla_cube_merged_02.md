# JanPhilipp/smolvla_cube_merged_02

## Resumen

JanPhilipp/smolvla_cube_merged_02 es una política robótica (policy) de tipo visión-lenguaje-acción (VLA) publicada por el usuario JanPhilipp en Hugging Face. Se trata de un fine-tuning de lerobot/smolvla_base, el modelo compacto SmolVLA descrito en el artículo arXiv:2506.01844, entrenado con la librería LeRobot (versión 0.6.2) sobre el dataset JanPhilipp/cube_merged_02.

El modelo resuelve una única tarea de manipulación: "Pick up the cube and place it in the target area" (recoger un cubo y depositarlo en la zona objetivo). Para ello consume el estado articular de 6 dimensiones de un robot SO-100 follower y dos vistas de cámara (first y third) a 480x640, y produce un vector de acción de 6 dimensiones. El entrenamiento se realizó sobre 120 episodios y 46.528 fotogramas grabados a 30 FPS, con 24.000 pasos de optimización y batch size 32.

Su relevancia radica en el tamaño reducido (450.046.176 parámetros, aproximadamente 1,2 GB de pesos en safetensors) y en su licencia Apache 2.0, lo que permite desplegarlo en hardware de consumo y reutilizarlo como punto de partida para nuevas tareas de imitación. No obstante, el repositorio no incluye resultados de evaluación en robot real ni datos de cuantización o de contexto, y en el momento de la consulta acumulaba 0 descargas y 0 "likes", por lo que se trata de un artefacto reciente y sin validación pública.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) compacta; detalles completos en arXiv:2506.01844 |
| Parametros totales | 450.046.176 (unos 450 M) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no disponible; la instruccion de tarea usada en el entrenamiento esta en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1,2 GB) |
| Tipo de modelo | Politica robotica (pipeline: robotics), no un modelo generativo de texto |
| Modelo base | lerobot/smolvla_base (fine-tune) |
| Libreria / framework | LeRobot 0.6.2 |
| Robot objetivo | so_follower (SO-100 follower) |
| Camaras | first, third (480x640, 30 FPS) |
| Entradas | observation.state (6,); observation.images.first (3, 480, 640); observation.images.third (3, 480, 640) |
| Salidas | action (6,) |
| Dataset de entrenamiento | JanPhilipp/cube_merged_02 (120 episodios, 46.528 fotogramas, 30 FPS) |
| Pasos de entrenamiento | 24.000 (batch size 32, AdamW, lr 0,0001, seed 1000) |
| Fecha de publicacion | 22 de septiembre de 2026 (segun metadatos del Hub) |

## Arquitectura y entrenamiento

El modelo es una política de visión-lenguaje-acción: procesa simultáneamente observaciones visuales (dos cámaras) y el estado proprioceptivo del robot, y genera directamente comandos de acción, sin bucle de planificación explícito. La arquitectura concreta, la composición del codificador visual y del experto de acción, así como el objetivo de entrenamiento, no se detallan en la información proporcionada y deben consultarse en el artículo SmolVLA (arXiv:2506.01844), referenciado en la model card.

El entrenamiento sigue el flujo estándar de imitación de LeRobot: se parte del checkpoint preentrenado lerobot/smolvla_base y se ajusta con el dataset JanPhilipp/cube_merged_02, que contiene 120 episodios de la tarea de recogida de cubo a 30 FPS. La configuración declarada es de 24.000 pasos, batch size 32, optimizador AdamW con learning rate 0,0001 y semilla 1000. No se especifica si hubo etapas de RLHF, DPO u otro ajuste posterior, ni la composición exacta del dataset más allá de la tarea única.

## Capacidades

- Control robótico de manipulación de 6 grados de libertad sobre un robot SO-100 follower, emitiendo acciones continuas de dimensión 6.
- Fusión de dos vistas de cámara (first y third) con el estado articular del robot para la ejecución de la tarea.
- Ejecución de una tarea concreta de pick-and-place: recoger un cubo y colocarlo en la zona objetivo.
- Inferencia en bucle cerrado a la frecuencia del sistema de control (los datos se grabaron a 30 FPS).
- No soporta tool calling ni function calling: es una política de acción, no un modelo de lenguaje con herramientas.
- No incorpora razonamiento multi-paso ni modo "thinking"; genera acciones directamente.
- No presenta capacidades multilingües ni de generación de texto.
- No se documentan capacidades de visión general (descripción de imágenes), audio ni diálogo.

## Casos de uso

- Automatización de pick-and-place en laboratorio o línea de montaje: el modelo recoge un cubo y lo deposita en una zona objetivo predefinida, adecuado para tareas repetitivas de alimentación de piezas donde la posición del objeto es aproximadamente fija.
- Banco de pruebas de imitación en robótica de bajo coste: al ejecutarse sobre un SO-100 con dos cámaras de 480x640, sirve para validar pipelines de adquisición de datos y despliegue con hardware asequible.
- Punto de partida para fine-tuning de nuevas tareas: al derivar de lerobot/smolvla_base y tener licencia Apache 2.0, puede reentrenarse con un dataset propio siguiendo el comando `lerobot-train` documentado en la model card.
- Clasificación y ordenación de objetos pequeños: con el cubo como objeto de referencia, el mismo esquema de observación-acción puede adaptarse a separar piezas por posición en una bandeja.
- Investigación en políticas VLA compactas: útil para estudiar el equilibrio entre tamaño de parámetros (450 M) y viabilidad de despliegue en GPU de consumo.
- Demostraciones educativas de aprendizaje por imitación: permite mostrar el ciclo completo de recogida de datos con LeRobot, entrenamiento y ejecución en robot real.
- Evaluación de robustez ante variaciones de iluminación y posición: al disponer de dos vistas, se puede medir la degradación de la política cuando cambian las condiciones de la escena.
- Integración en celdas robotizadas con cámara cenital y frontal: la política espera exactamente dos flujos visuales con los nombres `first` y `third`, lo que encaja con montajes de dos cámaras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación vacía, con la indicación explícita de que todavía no se han aportado resultados en robot real (ni número de intentos ni tasa de éxito). Tampoco se proporcionan métricas del artículo SmolVLA ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,9 GB en FP16/BF16 y 1,8 GB en FP32 solo para los pesos (450.046.176 parámetros); con activaciones de dos imágenes de 480x640 y estado de 6 dimensiones, una estimación prudente se sitúa en el rango de 2 a 4 GB, aunque no hay cifras oficiales publicadas.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM; tarjetas de consumo como RTX 3060, RTX 4060 o RTX 4090 son suficientes por tamaño de modelo. No se documentan requisitos de A100 o H100, y no serían necesarios para este tamaño.
- Cabe en GPU de consumo: sí, según el propio autor ("can be deployed on consumer-grade hardware"); el repositorio ocupa 1,2 GB, por lo que la carga en memoria es reducida.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` (con `--policy.path=JanPhilipp/smolvla_cube_merged_02`), y entrenamiento con `lerobot-train`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a una política de acción.
- Latencia y throughput: no disponibles. El dataset y el bucle de control se registraron a 30 FPS, lo que marca la frecuencia objetivo del sistema, pero no se publican latencias de inferencia medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad / notas |
|---|---|---|---|---|
| JanPhilipp/smolvla_cube_merged_02 | 450.046.176 | no disponible | Apache 2.0 | En Hugging Face; fine-tune de tarea unica, sin evaluacion publicada |
| lerobot/smolvla_base | no disponible en la informacion | no disponible | no disponible en la informacion | Modelo base del fine-tune; pesos publicados en el Hub |
| Otras politicas del ecosistema LeRobot (ACT, Diffusion Policy) | no disponible | no aplica | no disponible | No se aportaron especificaciones en la informacion disponible |

No se han proporcionado datos comparativos de rendimiento, tamano o contexto frente a alternativas. Cualquier comparacion cuantitativa con ACT, Diffusion Policy u otras variantes VLA requeriria consultar el articulo SmolVLA y ejecutar evaluaciones propias en robot real.

## Limitaciones y advertencias

- Modelo de tarea unica: solo se ha entrenado para "Pick up the cube and place it in the target area"; no generaliza a otras tareas sin fine-tuning adicional.
- Sin resultados de evaluacion: no hay tasa de exito publicada, por lo que se desconoce su fiabilidad real en robot.
- Dataset pequeno y especifico: 120 episodios y 46.528 fotogramas de una sola tarea, con unas condiciones concretas de iluminacion, posicion de objeto y operador; es probable que la politica sea sensible a cambios de distribucion (posiciones nuevas, distractores, iluminacion distinta).
- Riesgo de sobreajuste al montaje fisico: los nombres de camara (`first`, `third`), las resoluciones 480x640 y el robot `so_follower` deben coincidir exactamente con los del entrenamiento; cualquier variacion invalida la observacion esperada.
- Sesgos: al derivar de un dataset de demostraciones humano, puede heredar sesgos del operador (trayectorias, velocidad, punto de agarre) no caracterizados en la model card.
- Alucinacion: no aplica en el sentido de generacion de texto, pero si existen fallos de accion impredecibles fuera de la distribucion de entrenamiento.
- Idiomas: no es un modelo de lenguaje; la instruccion de tarea es una cadena en ingles fija, no hay soporte multilingue declarado.
- Contexto: no se documenta ninguna ventana de contexto ni memoria de episodios previos.
- Licencia: Apache 2.0 permite uso comercial del artefacto, pero el usuario debe verificar las condiciones de LeRobot, del modelo base lerobot/smolvla_base y de las dependencias asociadas antes de un despliegue en produccion.
- Ausencia de cuantizaciones publicadas: no hay versiones GGUF, AWQ o GPTQ, lo que limita el despliegue en entornos con restricciones de memoria muy estrictas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JanPhilipp/smolvla_cube_merged_02
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/JanPhilipp/cube_merged_02
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=JanPhilipp/cube_merged_02
- Articulo SmolVLA: https://huggingface.co/papers/2506.01844
- Version en arXiv: https://arxiv.org/abs/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Nota: la busqueda web realizada no devolvio resultados tecnicos utiles (unicamente enlaces genericos a YouTube), por lo que no se han podido incorporar fuentes adicionales.
