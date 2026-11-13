# felsager/pi05_cube2cross_v2_all

## Resumen

pi05_cube2cross_v2_all es un fine-tune de política robótica Vision-Language-Action (VLA) construido sobre lerobot/pi05_base, la implementación de LeRobot del modelo π₀.₅ de Physical Intelligence. El modelo consume observaciones multimodales (estado del robot y dos cámaras) y produce acciones de control de 10 dimensiones para un brazo UR5e con mano equipada. Su propósito es ejecutar tareas de manipulación pick-and-place guiadas por instrucciones en lenguaje natural, en concreto recoger cubos de distintos colores y depositarlos sobre una cruz roja.

El modelo ha sido entrenado mediante imitation learning sobre el dataset felsager/vla_cubes_cross_v2, compuesto por 1000 episodios y 493.474 frames a 30 FPS, con cuatro tareas distintas diferenciadas por el color del cubo. La relevancia de esta ficha es acotada: se trata de un checkpoint de investigación para un entorno de laboratorio concreto (robot ur5e_hand_e), no de un modelo de propósito general. Su interés radica en servir como ejemplo reproducible de fine-tuning de π₀.₅ con LeRobot y como base para experimentos de generalización en manipulación robótica.

Con 4.143.404.816 parámetros y un tamaño de repositorio de 42,6 GB, el modelo hereda la arquitectura VLA de π₀.₅ y la licencia Gemma del modelo base. No se han publicado resultados de evaluación en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (implementación LeRobot de OpenPI) |
| Parámetros totales | 4.143.404.816 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | safetensors |
| Tipo de robot | ur5e_hand_e |
| Cámaras | top, wrist |
| Entrada observation.state | STATE, shape (10,) |
| Entrada observation.images.top | VISUAL, shape (3, 480, 640) |
| Entrada observation.images.wrist | VISUAL, shape (3, 480, 640) |
| Salida action | ACTION, shape (10,) |
| Modelo base | lerobot/pi05_base |
| Dataset de entrenamiento | felsager/vla_cubes_cross_v2 |
| Episodios | 1000 |
| Frames | 493474 |
| Frame rate | 30 FPS |
| Pasos de entrenamiento | 30000 |
| Batch size | 8 |
| Optimizador | adamw |
| Learning rate | 5e-05 |
| Seed | 0 |
| Versión de LeRobot | 0.6.2 |

## Arquitectura y entrenamiento

El modelo es un fine-tune de lerobot/pi05_base, la adaptación de LeRobot del modelo π₀.₅ de Physical Intelligence, descrito por el autor como un modelo Vision-Language-Action diseñado para generalización en entornos abiertos. La arquitectura combina un backbone visión-lenguaje con un cabezal de acciones que mapea observaciones (estado proprioceptivo de 10 dimensiones y dos imágenes RGB de 480×640 procedentes de cámaras top y wrist) a un vector de acción de 10 dimensiones. No se dispone de detalles adicionales sobre la composición interna del transformer, el número de capas o el mecanismo de atención en la información proporcionada.

El entrenamiento se realizó por imitation learning sobre el dataset felsager/vla_cubes_cross_v2, con 1000 episodios y 493.474 frames grabados a 30 FPS. Las tareas cubiertas son cuatro variantes de pick-and-place: recoger el cubo azul, verde, amarillo o rojo y colocarlo sobre la cruz roja. La configuración reportada incluye 30.000 pasos, batch size de 8, optimizador AdamW, learning rate de 5e-05, seed 0 y LeRobot 0.6.2. No se especifica si hubo RLHF, DPO ni otras fases de alineamiento, ni el número total de tokens o composición del dataset más allá de los episodios y frames indicados.

## Capacidades

- Control robótico de manipulación pick-and-place guiado por instrucciones en lenguaje natural, con cuatro tareas definidas por el color del cubo.
- Procesamiento multimodal de dos flujos de vídeo (cámaras top y wrist) a 480×640 y 30 FPS, más estado proprioceptivo de 10 dimensiones.
- Generación de acciones de control continuas de 10 dimensiones para un robot ur5e_hand_e.
- Ejecución de políticas de imitación entrenadas sobre demostraciones humanas.
- Soporte de ejecución en bucle mediante `lerobot-rollout` con estrategia base.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión general, audio: no disponible (la visión se limita a las dos cámaras de robot especificadas).

## Casos de uso

- Recogida y colocación de cubos por color en un entorno de laboratorio: el modelo ejecuta la instrucción "pick up the blue cube and place it on the red cross" (y las variantes verde, amarilla y roja) sobre un UR5e con mano, usando las cámaras top y wrist para localizar el objeto y la cruz destino.
- Reproducción de experimentos de imitation learning: sirve como checkpoint de referencia para comparar configuraciones de entrenamiento (pasos, batch size, learning rate) sobre el mismo dataset y robot.
- Base para fine-tuning adicional: al estar construido sobre lerobot/pi05_base, puede reentrenarse con `lerobot-train` sobre nuevos datasets manteniendo el mismo pipeline de LeRobot.
- Validación de pipelines de despliegue LeRobot: útil para probar el flujo completo de `lerobot-rollout` con `--strategy.type=base` y verificar la integración de cámaras, puerto del robot y claves de observación.
- Docencia y demostraciones de VLA en robótica: ejemplo concreto y reproducible de cómo un modelo visión-lenguaje-acción se aplica a una tarea de manipulación acotada.
- Generación de datos sintéticos o aumentados para entrenamiento: el modelo puede emplearse para producir trayectorias de referencia en las cuatro tareas aprendidas, que luego se filtran y se usan para ampliar el dataset.
- Pruebas de robustez ante variaciones de iluminación, posición de objetos o distracciones: aunque no hay evaluación publicada, el checkpoint permite medir la degradación del éxito en condiciones no vistas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política y que la tabla de evaluación real-robot está vacía.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 4.143.404.816 parámetros, una estimación en FP16 rondaría los 8,3 GB solo en pesos, y en FP32 unos 16,6 GB, pero no se confirma el dtype de despliegue ni el overhead de las torres de visión.
- GPU recomendadas: no disponible. No se especifican modelos concretos (A100, H100, RTX 4090, etc.) en la documentación.
- Compatibilidad con GPU de consumo: no confirmada. El tamaño de pesos en FP16 sugiere que podría caber en GPUs con 12-16 GB o más, pero no hay dato oficial.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` (estrategia base) y `lerobot-train` para reentrenamiento. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política robótica.
- Latencia y throughput estimados: no disponibles. La ejecución se especifica a 30 FPS en la captura de datos, pero no se reporta la frecuencia de inferencia del modelo.
- Almacenamiento: el repositorio ocupa 42,6 GB, por lo que se requiere espacio en disco acorde para descargar los pesos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| felsager/pi05_cube2cross_v2_all | 4.143.404.816 | no disponible | VLA pick-and-place sobre UR5e | gemma | Hugging Face, 0 descargas, 0 likes |
| lerobot/pi05_base | no disponible | no disponible | VLA base π₀.₅ para fine-tuning | no disponible | Hugging Face (modelo base referenciado) |
| π₀.₅ (Physical Intelligence) | no disponible | no disponible | VLA de propósito general | no disponible | Blog y repositorio OpenPI citados en la model card |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en cuatro tareas concretas (cubos azul, verde, amarillo y rojo sobre cruz roja) y en un robot específico (ur5e_hand_e); no es un modelo de propósito general.
- No se han publicado resultados de evaluación real-robot, por lo que se desconoce la tasa de éxito y la robustez ante variaciones de iluminación, posición o distractores.
- Las cámaras deben llamarse exactamente `top` y `wrist` y respetar la resolución 480×640 y 30 FPS para que las claves de observación coincidan con las del entrenamiento.
- El estado de observación tiene 10 dimensiones y la acción 10 dimensiones; un robot con dimensionalidad distinta no es compatible sin reentrenamiento.
- Sesgos conocidos: no disponibles. Al entrenarse sobre un dataset acotado de un laboratorio, es probable que herede sesgos de las demostraciones (posiciones, colores, condiciones de iluminación), pero no se documentan.
- Riesgo de alucinación: no aplica en el sentido textual; el riesgo equivalente es la generación de acciones inválidas o fuera de distribución ante escenas no vistas.
- Restricciones de licencia: licencia `gemma`, heredada del modelo base. Es necesario revisar los términos de la licencia Gemma para uso comercial, que impone condiciones específicas de atribución y uso aceptable.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-13), lo que sugiere que no ha pasado por validación comunitaria.
- No se especifican requisitos de hardware ni latencia de inferencia, lo que dificulta planificar un despliegue en producción.
- El tamaño del repositorio (42,6 GB) implica costes de almacenamiento y transferencia considerables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/felsager/pi05_cube2cross_v2_all
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/felsager/vla_cubes_cross_v2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=felsager/vla_cubes_cross_v2
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
