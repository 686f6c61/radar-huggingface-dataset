# seriintan/xvla_frazier_object_variation

## Resumen

`seriintan/xvla_frazier_object_variation` es una política robótica de visión-lenguaje-acción (VLA) obtenida por ajuste fino del modelo base `lerobot/xvla-base`. Está desarrollada por el usuario `seriintan` y publicada en HuggingFace dentro del ecosistema LeRobot. El modelo resuelve una tarea de manipulación concreta: coger un objeto Frazier y colocarlo en una cesta azul ("Pick and place Frazier to blue basket"), ejecutada sobre un robot de tipo `so_follower` con cámaras frontal y de pinza.

El modelo se apoya en X-VLA, un marco VLA con *soft prompts* y *flow matching* que trata cada configuración de robot o hardware como una "tarea" codificada mediante un conjunto reducido de *embeddings* de prompt aprendibles. Con 879.687.256 parámetros (~880 M) y pesos en formato safetensors, es un modelo compacto orientado a despliegue en hardware de robótica, no a inferencia de lenguaje general. Su relevancia radica en demostrar cómo un único marco puede reconciliar morfologías, sensores y espacios de acción diversos mediante prompts suaves.

Se trata de un modelo de nicho: cero descargas y cero likes en el momento de redactar esta ficha, sin resultados de evaluación publicados y entrenado sobre un único conjunto de datos de 171 episodios. Es adecuado como referencia para reproducir el flujo de entrenamiento de políticas X-VLA con LeRobot, más que como modelo listo para producción general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) con *soft prompting* y *flow matching* (X-VLA) |
| Parámetros totales | 879.687.256 (~880 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura sigue el marco X-VLA, descrito en el paper arXiv:2510.10274: un enfoque VLA con *soft prompts* y *flow matching*. La idea central es tratar cada robot o configuración de hardware como una "tarea" representada por un conjunto pequeño de *embeddings* de prompt aprendibles (Soft Prompt embeddings). Esto permite que un único modelo se adapte a morfologías de robot, sensores y espacios de acción distintos sin necesidad de arquitecturas separadas. El modelo consume observaciones multimodales (imágenes y estado) y produce acciones continuas.

En cuanto al entrenamiento, esta política se ajustó desde `lerobot/xvla-base` durante 50.000 pasos con un tamaño de lote de 2, optimizador `xvla-adamw`, tasa de aprendizaje 0,0001 y semilla 1000, usando LeRobot 0.6.2. El conjunto de datos de ajuste fino es `seriintan/frazier_dataset_v2_object_variation`, con 171 episodios, 99.043 fotogramas a 30 FPS y una única tarea. No se documenta en la información disponible el uso de RLHF, DPO ni otras técnicas de alineación posteriores al entrenamiento supervisado.

Las entradas declaradas son: `observation.images.image` (3, 256, 256), `observation.images.image2` (3, 256, 256), `observation.state` (8,), `observation.images.image3` (3, 224, 224) y `observation.images.empty_camera_0` (3, 224, 224). La salida es `action` con forma (6,). La model card menciona como cámaras del robot `front` y `gripper` para un robot de tipo `so_follower`.

## Capacidades

- Generación de acciones de control robótico en un espacio de 6 dimensiones a partir de observaciones visuales y de estado.
- Percepción visual multimodal: consume varias cámaras simultáneamente (hasta cuatro flujos de imagen según las entradas declaradas).
- Condicionamiento por tarea mediante instrucción textual ("Pick and place Frazier to blue basket").
- Ejecución de una tarea de manipulación de tipo *pick and place* sobre un robot `so_follower`.
- Reutilización del marco X-VLA para reconciliar configuraciones de hardware mediante *soft prompts* (capacidad del marco base, no validada de forma independiente en este ajuste).
- No se documentan capacidades de *tool calling*, agentes, razonamiento multi-paso, visión generalista ni audio en la información disponible.
- Capacidades multilingües: no disponible.

## Casos de uso

- Manipulación pick-and-place en línea de montaje ligera: la política puede ejecutar la recogida del objeto Frazier y su depósito en una cesta azul sobre un robot `so_follower`, usando las cámaras frontal y de pinza para localizar el objeto y cerrar el ciclo de agarre.
- Base para ajuste fino de nuevas variantes de objeto: dado que parte de `lerobot/xvla-base`, sirve como punto de partida para reentrenar con otros objetos o posiciones simplemente cambiando el conjunto de datos, manteniendo la misma interfaz de entradas y salidas.
- Automatización de tareas de clasificación en almacén: con una política reentrenada sobre un dataset equivalente, el mismo esquema de observación (estado de 8 dimensiones más cuatro cámaras) puede clasificar y depositar piezas en contenedores distintos.
- Investigación en imitación robótica: el par base/ajuste permite estudiar cuántos episodios y pasos de entrenamiento son necesarios para transferir una habilidad de manipulación concreta, usando la configuración de entrenamiento documentada (50.000 pasos, lote 2).
- Evaluación de arquitecturas VLA con *soft prompts*: permite reproducir el flujo X-VLA y medir si los *soft prompts* capturan de forma efectiva la variabilidad de hardware y objeto, comparando el comportamiento del modelo base frente a este ajuste.
- Despliegue en entornos controlados de laboratorio: gracias a su tamaño (~880 M de parámetros, repo de 1,8 GB), puede ejecutarse en estaciones de trabajo con GPU de gama media para ciclos de inferencia en tiempo real a 30 FPS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La sección de evaluación de la model card indica explícitamente que todavía no se han proporcionado resultados de evaluación para esta política ("No evaluation results have been provided for this policy yet"). No se dispone, por tanto, de tasas de éxito, comparativas con otros modelos ni métricas de latencia medidas.

## Requisitos de hardware

- VRAM estimada para pesos (cálculo a partir del recuento de parámetros, no confirmado por el autor): en bf16/fp16, aproximadamente 1,76 GB; en fp32, aproximadamente 3,5 GB. Hay que sumar la memoria de activaciones y de los codificadores visuales, por lo que conviene reservar margen adicional.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cualquier GPU con al menos 8 GB de VRAM debería ser suficiente para inferencia en precisión reducida, pero esto es una estimación, no un dato confirmado.
- ¿Cabe en GPU de consumo? Es plausible en tarjetas de gama media con 8-12 GB (por ejemplo, series RTX 3060/4060/4070), aunque no hay confirmación oficial.
- Opciones de despliegue: LeRobot, mediante los comandos `lerobot-rollout` (ejecución en el robot) y `lerobot-train` (entrenamiento y ajuste fino). Frameworks de servido de LLM como vLLM, TGI, llama.cpp u Ollama no aplican a este tipo de política robótica.
- Latencia y throughput estimados: no disponibles. La frecuencia de los datos de entrenamiento es de 30 FPS, pero no se documenta el rendimiento de inferencia alcanzable.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| seriintan/xvla_frazier_object_variation | 879.687.256 | no disponible | Apache 2.0 | HuggingFace (0 descargas) | Ajuste fino de tarea única |
| lerobot/xvla-base | no disponible en la información proporcionada | no disponible | no disponible | HuggingFace | Modelo base del que deriva este ajuste |
| Otras políticas VLA de la misma categoría (OpenVLA, pi0, etc.) | no disponible | no disponible | no disponible | no disponible | No se han encontrado datos comparativos en la información proporcionada |

La búsqueda web realizada no devolvió resultados relevantes (únicamente páginas de inicio de sesión de servicios de correo), por lo que no se dispone de referencias adicionales para ampliar la comparativa.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación: se desconoce la tasa de éxito real de la tarea.
- Entrenado sobre un único conjunto de datos (171 episodios, 99.043 fotogramas) y una única tarea, lo que limita su generalización a otros objetos, posiciones o entornos.
- Diseñado para un único tipo de robot (`so_follower`): no hay evidencia de transferencia a otras morfologías en este ajuste concreto.
- Riesgo de sobreajuste a las condiciones del dataset (iluminación, disposición de cámara, fondo), factor típico en imitación robótica.
- Las cámaras declaradas (`front`, `gripper`) deben coincidir con las claves de observación del entrenamiento; un desajuste en nombres o índices impedirá la ejecución correcta.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se debe conservar el aviso de licencia y citar el método y LeRobot según lo indicado por el autor.
- No se documentan sesgos, idiomas soportados ni comportamiento fuera de la tarea objetivo.
- Modelo de nicho con cero descargas y sin mantenimiento confirmado; conviene validar su comportamiento en el hardware propio antes de cualquier uso real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/seriintan/xvla_frazier_object_variation
- Modelo base: https://huggingface.co/lerobot/xvla-base
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/seriintan/frazier_dataset_v2_object_variation
- Paper X-VLA (arXiv:2510.10274): https://huggingface.co/papers/2510.10274
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de X-VLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/xvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Visualizador del conjunto de datos: https://huggingface.co/spaces/lerobot/visualize_dataset?path=seriintan/frazier_dataset_v2_object_variation
- Documentación de despliegue (rollout): https://huggingface.co/docs/lerobot/main/en/inference
