# ranjith3567/pick_yellow_cube_v5.1_chunk50

## Resumen

`pick_yellow_cube_v5.1_chunk50` es una política de imitación robótica entrenada con LeRobot sobre la arquitectura SmolVLA (vision-language-action compacta). El modelo lo publica el usuario `ranjith3567` y está especializado en una única tarea de manipulación: coger un bloque amarillo y colocarlo en una caja marrón. No es un modelo de lenguaje general, sino un controlador de robot que mapea observaciones visuales y de estado a acciones de 6 dimensiones.

SmolVLA, descrito en el paper arXiv:2506.01844, es un modelo VLA de tamaño reducido pensado para desplegarse en hardware de consumo. Esta instancia concreta contiene 450.046.176 parámetros en formato safetensors y ocupa 0,9 GB en el repositorio, lo que la hace manejable en GPUs modestas para inferencia en tiempo real a 30 FPS.

Su relevancia es acotada: no aporta capacidades generales, sino que demuestra el flujo de entrenamiento y despliegue de LeRobot 0.6.2 sobre un robot `so_follower` con dos cámaras. Es útil como referencia de pipeline de imitation learning, no como modelo reutilizable fuera de su tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action), transformer compacto |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería lerobot) |
| Tipo de robot | `so_follower` |
| Cámaras de entrada | `Top`, `Side` (más `camera1`, `camera2`, `camera3`, `empty_camera_0`) |
| Dimensión de estado | `(6,)` |
| Dimensión de acción | `(6,)` |
| Resolución de imagen | 256x256 (cámaras 1-3), 480x640 (`empty_camera_0`) |
| Tamaño del repositorio | 0,9 GB |

## Arquitectura y entrenamiento

SmolVLA es un modelo vision-language-action compacto que combina un codificador visual y un codificador de lenguaje con un decodificador de acciones, entrenado por imitación. La model card no detalla la composición interna de esta instancia ni el número de tokens de preentrenamiento; solo indica que la política se ha entrenado y publicado con LeRobot 0.6.2 y que sigue el método del paper arXiv:2506.01844.

El entrenamiento se realizó sobre el dataset `ranjith3567/pick_yellow_cube_v5_20261105_191046`, con 100 episodios, 63.143 frames a 30 FPS y una única tarea: "pick the yellow block and place it in brown box". La configuración reportada es de 30.000 pasos, batch size 8, optimizador AdamW, learning rate 0,0001 y semilla 1000. No se documenta si hubo RLHF, DPO ni aumentos de datos.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 dimensiones a partir de estado y observaciones visuales.
- Percepción visual multi-cámara: consume hasta tres cámaras a 256x256 y una cámara adicional a 480x640.
- Ejecución de una tarea concreta de pick-and-place: coger un bloque amarillo y depositarlo en una caja marrón.
- Inferencia en tiempo real: el dataset está grabado a 30 FPS, lo que sugiere operación a esa frecuencia.
- Despliegue en hardware de consumo: el tamaño del modelo (450M parámetros) permite ejecución en GPUs no empresariales.
- Integración con el ecosistema LeRobot: comandos `lerobot-rollout` y `lerobot-train` para ejecución y reentrenamiento.
- Tool calling, agentes, razonamiento multi-paso, matemáticas o multilingüismo: no disponibles; no son capacidades de este modelo.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo ejecuta la tarea "pick the yellow block and place it in brown box" sobre un robot `so_follower`, útil para prototipos de manipulación con objetos de color conocido.
- Referencia para pipelines de imitation learning: sirve como ejemplo completo de entrenamiento y publicación con LeRobot 0.6.2, incluyendo dataset, configuración y comandos de rollout.
- Base para fine-tuning en tareas similares: al ser una política SmolVLA de 450M parámetros, se puede reentrenar con `lerobot-train` sobre un dataset propio de manipulación.
- Validación de hardware y calibración: el comando de rollout documentado permite comprobar cámaras, puerto del robot y sincronización antes de entrenar políticas nuevas.
- Docencia y demostraciones de VLA: su tamaño reducido y su licencia no especificada (a confirmar) lo hacen adecuado para entornos académicos de experimentación.
- Pruebas de despliegue en GPU de consumo: permite medir latencia y throughput de una política VLA compacta en estaciones de trabajo convencionales.
- Benchmark interno de éxito en manipulación: aunque el autor no publica tasas de éxito, la política puede usarse como línea base para comparar variantes de chunk size (el nombre sugiere `chunk50`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450M parámetros en safetensors, la huella de pesos ronda 1,8 GB en fp16 y 0,9 GB en el repositorio, más overhead de activaciones y cámaras.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría en GPUs de consumo tipo RTX 3060/4060/4090; no se confirma compatibilidad.
- ¿Cabe en consumer GPU?: probablemente sí por tamaño de parámetros, pero no hay validación publicada.
- Opciones de despliegue: `lerobot-rollout` con `--policy.path=ranjith3567/pick_yellow_cube_v5.1_chunk50`; entrenamiento con `lerobot-train --policy.type=smolvla --policy.device=cuda`.
- Latencia y throughput: no disponibles. El dataset está a 30 FPS, pero no se reporta latencia de inferencia real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `pick_yellow_cube_v5.1_chunk50` (este) | 450.046.176 | no disponible | Pick-and-place de bloque amarillo | no disponible | Hugging Face, 0 descargas |
| SmolVLA (modelo base del paper) | no disponible en la información | no disponible | VLA general compacto | no disponible | Paper arXiv:2506.01844 |
| Otras políticas LeRobot | no disponible | no disponible | Tareas de imitación diversas | variable | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparables entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: solo ejecuta la tarea "pick the yellow block and place it in brown box"; no generaliza a otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay tasa de éxito, ni número de ensayos, ni condiciones de prueba; el rendimiento real es desconocido.
- Dependencia de hardware concreto: entrenado para robot `so_follower` con cámaras `Top` y `Side`; los nombres e índices de cámara deben coincidir con las claves de observación.
- Licencia no disponible: no se puede confirmar el uso comercial; hay que contactar con el autor antes de producción.
- Sesgos y alucinaciones: no aplican en el sentido lingüístico, pero la política puede fallar ante cambios de iluminación, posiciones de objeto o distracciones no vistas en el dataset.
- Dataset pequeño y de un solo autor: 100 episodios y 63.143 frames, sin validación cruzada ni conjunto de test documentado.
- Repositorio con 0 descargas y 0 likes: sin evidencia de uso comunitario ni de reproducibilidad por terceros.
- Idiomas y cuantizaciones no documentados: no hay información sobre formatos alternativos ni requisitos de despliegue más allá de LeRobot.

## Enlaces

- Hugging Face: https://huggingface.co/ranjith3567/pick_yellow_cube_v5.1_chunk50
- Dataset: https://huggingface.co/datasets/ranjith3567/pick_yellow_cube_v5_20261105_191046
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ranjith3567/pick_yellow_cube_v5_20261105_191046
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Guía LeRobot SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
