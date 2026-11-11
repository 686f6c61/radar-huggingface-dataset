# INSAIT-Institute/LADDER-RobotArena-Long

## Resumen

LADDER RobotArena-∞-Long es un entorno de simulación para evaluación de políticas robóticas de manipulación de horizonte largo, empaquetado como entorno LeRobot EnvHub. Lo desarrolla el INSAIT-Institute (Sofía, Bulgaria) y forma parte de LADDER, un benchmark de manipulación robótica presentado en el artículo arXiv:2610.18053. El repositorio no contiene pesos de un modelo generativo, sino los activos, tareas y código de simulación necesarios para ejecutar y puntuar políticas sobre el robot WidowX en escenas de RobotArena-∞ renderizadas con el simulador Genesis.

El entorno cubre 47 tareas de entre 1 y 10 subobjetivos cada una, lo que lo sitúa en el segmento de evaluación de tareas largas y compuestas, donde la política debe encadenar habilidades y mantener el progreso a lo largo de muchos pasos. Se distribuye con la librería LeRobot y se ejecuta mediante un servidor de entorno (`lerobot-env-server`) que puede correr en Docker o en proceso, con una tasa de control de 5 Hz.

Su relevancia actual reside en que estandariza la evaluación de políticas de manipulación de horizonte largo en un formato reproducible e integrable en el ecosistema LeRobot, y en que complementa otras dos suites del mismo benchmark (RoboLab-Long con Isaac Sim y SimplerEnv-Long con SAPIEN/ManiSkill), cada una en su propio repositorio por requerir entornos Python distintos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (entorno de simulación, no modelo neuronal) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (activos de simulación, 240 MB, descargados desde la release v1.0.0) |
| Simulador | Genesis |
| Robot | WidowX |
| Numero de tareas | 47 (de 1 a 10 subobjetivos) |
| Tasa de control | 5 Hz |
| Observacion | `pixels.main` 480x640 RGB; `agent_pos` pose del efector final `[x, y, z, rx, ry, rz]` (frame base, axis-angle, convención BridgeData) y pinza (1 abierta) |
| Accion | `[dx, dy, dz, drx, dry, drz, gripper]`, traslación en frame base, rotación en frame del efector final, pinza 1 abierta / 0 cerrada |
| Metrica de exito | `pc_success`; progreso `avg_sum_reward` y `info["metrics"]["subgoal_progress"]` |
| Libreria | LeRobot |
| Version del entorno | v1.0.0 |

## Arquitectura y entrenamiento

Este repositorio no entrena ni distribuye un modelo. Es un entorno de evaluación: contiene el código de LADDER en su release v1.0.0, sin modificaciones, ejecutado con los ajustes del servidor propio de LADDER, junto con los activos de simulación (240 MB) que se descargan en el primer uso. La simulación se ejecuta sobre Genesis y reproduce escenas de RobotArena-∞ con un robot WidowX.

El entorno define la interfaz observación-acción bajo convenciones de BridgeData: observaciones de imagen 480x640 más pose del efector final y estado de la pinza, y acciones de delta de pose más apertura/cierre de pinza, aplicadas a la pose comandada tal como hace la política Bridge de LADDER. La validación de fidelidad indicada por el autor señala que los frames de reset coinciden con los episodios grabados de LADDER y que la política Bridge ejecutada a través de este entorno obtiene un éxito comparable al publicado (21 y 20 de 32 frente a 21 en cuatro tareas). El harness propio de LADDER sigue siendo la referencia para la tabla de clasificación.

## Capacidades

- Evaluación de políticas de manipulación robótica de horizonte largo con hasta 10 subobjetivos por tarea.
- Ejecución de 47 tareas sobre escenas de RobotArena-∞ en el simulador Genesis con robot WidowX.
- Puntuación de éxito de tarea (`pc_success`) y de progreso por subobjetivo (`avg_sum_reward`, `subgoal_progress`).
- Ejecución por lotes: los 8 episodios de una tarea se ejecutan como un único lote, por lo que se recomienda `batch_size=8`.
- Selección de tareas individuales, listas separadas por comas o la suite completa mediante `--env.task`.
- Despliegue en Docker (imagen de unos 16 GB, 10 a 20 minutos de construcción la primera vez) o en proceso con `--env.trust_remote_code=true`.
- Integración con LeRobot mediante `lerobot-env-server` y `lerobot-eval`, con endpoint TCP (`tcp/127.0.0.1:7448` en el ejemplo).
- No incluye capacidades de generación de texto, visión general, código, matemáticas, tool calling ni agentes de lenguaje.

## Casos de uso

- Evaluación comparativa de políticas de manipulación: ejecutar un checkpoint de WidowX sobre las 47 tareas para obtener `pc_success` y progreso por subobjetivo, con resultados comparables entre políticas bajo la misma interfaz.
- Investigación en horizonte largo: usar las tareas de hasta 10 subobjetivos para medir degradación del éxito a medida que crece la longitud de la tarea y analizar en qué subobjetivo falla la política.
- Desarrollo de políticas con LeRobot: integrar el entorno en un pipeline de entrenamiento/evaluación existente mediante `lerobot-eval` y el servidor EnvHub, sin reimplementar la simulación.
- Reproducibilidad de resultados publicados: el código es el de LADDER v1.0.0 sin cambios y los frames de reset coinciden con los episodios grabados, lo que permite replicar cifras del artículo.
- Pruebas de regresión en CI: lanzar un subconjunto de tareas con una lista separada por comas y un número reducido de episodios para detectar regresiones de una política antes de publicarla.
- Comparación entre simuladores: al compartir formato con RoboLab-Long (Isaac Sim) y SimplerEnv-Long (SAPIEN/ManiSkill), permite contrastar el comportamiento de una misma política en distintos simuladores y robots.
- Validación de políticas Bridge: usar la política Bridge de referencia como línea base, dado que su tasa de éxito en este entorno se ha contrastado con la de los episodios publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de modelos en la información disponible. El autor sí reporta una comprobación de fidelidad del entorno con la política Bridge de LADDER:

| Comprobacion | Resultado reportado |
|---|---|
| Exito de la politica Bridge en este entorno (4 tareas) | 21 y 20 de 32 |
| Exito publicado de LADDER en esas tareas | 21 |

## Requisitos de hardware

- GPU NVIDIA con NVIDIA Container Toolkit si se usa el modo Docker (`--docker=true`).
- Espacio en disco: imagen del simulador de unos 16 GB, más 240 MB de activos de simulación descargados en el primer uso.
- VRAM estimada: no disponible en la información proporcionada.
- GPU recomendadas: no disponible; el autor no especifica modelos concretos.
- Compatibilidad con GPU de consumo: no disponible.
- Tiempo de arranque: 10 a 20 minutos para construir la imagen la primera vez; el servidor construye las cinco escenas de la suite antes de declararse listo (unos 3 minutos la primera vez).
- Opciones de despliegue: servidor EnvHub de LeRobot (`lerobot-env-server`) con Docker o en proceso; evaluación con `lerobot-eval`; requiere `lerobot[dataset,evaluation]>=0.7.0` y las dependencias de `requirements.txt` para el modo en proceso.
- Latencia y throughput: no disponibles; la tasa de control del entorno es de 5 Hz.

## Comparativa con modelos similares

| Suite | Repositorio | Simulador | Robot | Tareas | Licencia |
|---|---|---|---|---|---|
| RobotArena-∞-Long | `INSAIT-Institute/LADDER-RobotArena-Long` | Genesis | WidowX | 47 | MIT |
| RoboLab-Long | `INSAIT-Institute/LADDER-RoboLab-Long` | Isaac Sim 6 | Franka (DROID) | 44 | MIT |
| SimplerEnv-Long | `INSAIT-Institute/LADDER-SimplerEnv-Long` | SAPIEN 3 / ManiSkill 3 | WidowX | 54 | MIT |

Las tres suites pertenecen al mismo benchmark LADDER y comparten interfaz y métricas, pero difieren en simulador, robot y número de tareas; cada una se distribuye en un repositorio separado porque cada simulador requiere su propio entorno Python. No se dispone de datos para comparar con benchmarks de manipulación externos a LADDER.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, código ni imágenes; cualquier uso fuera de evaluación de políticas robóticas no aplica.
- Los resultados dependen del simulador Genesis y de los activos de RobotArena-∞; el propio autor indica que el harness de LADDER sigue siendo la referencia para la tabla de clasificación, por lo que las cifras obtenidas aquí pueden no coincidir exactamente con las del leaderboard.
- El lote de evaluación está ligado a 8 episodios por tarea; usar otro tamaño de lote puede alterar el comportamiento esperado.
- Requiere infraestructura gráfica y Docker con soporte NVIDIA; la construcción inicial de la imagen y de las escenas introduce latencia significativa.
- Los activos descargados conservan sus propias licencias, documentadas en `THIRD_PARTY_NOTICES.md`, distintas de la licencia MIT del repositorio.
- No se han publicado datos sobre sesgos, alucinación o limitaciones idiomáticas porque el artefacto no es un modelo lingüístico.
- Sin descargas ni valoraciones en Hugging Face en el momento de la consulta, lo que limita la evidencia de uso externo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/INSAIT-Institute/LADDER-RobotArena-Long
- Suite RoboLab-Long: https://huggingface.co/INSAIT-Institute/LADDER-RoboLab-Long
- Suite SimplerEnv-Long: https://huggingface.co/INSAIT-Institute/LADDER-SimplerEnv-Long
- Proyecto LADDER: https://ladderrobotics.ai
- Repositorio de código LADDER: https://github.com/insait-institute/ladder
- Lista de tareas: https://github.com/insait-institute/ladder/blob/main/TASKS.md
- Release v1.0.0: https://github.com/insait-institute/ladder/releases/tag/v1.0.0
- Avisos de terceros: https://github.com/insait-institute/ladder/blob/main/THIRD_PARTY_NOTICES.md
- Documentación de LeRobot EnvHub: https://huggingface.co/docs/lerobot/envhub
- Artículo: https://arxiv.org/abs/2610.18053
