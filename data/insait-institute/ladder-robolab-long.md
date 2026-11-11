# INSAIT-Institute/LADDER-RoboLab-Long

## Resumen

LADDER RoboLab-Long es un entorno de simulación para evaluar políticas de manipulación robótica de horizonte largo, empaquetado como repositorio de LeRobot EnvHub. Lo desarrolla INSAIT-Institute y forma parte de LADDER, un benchmark de manipulación de horizonte largo presentado en el artículo arXiv:2610.18053. No es un modelo de lenguaje: es un entorno de evaluación que sirve para medir sistemáticamente el rendimiento de políticas robóticas (como pi0.5) en tareas de manipulación con múltiples subobjetivos.

El entorno se construye sobre RoboLab (NVlabs) e Isaac Sim 6 / Isaac Lab 3, y modela un brazo Franka con pinza Robotiq, la configuración hardware del dataset DROID. Incluye 44 tareas de entre 1 y 10 subobjetivos cada una, con observaciones visuales de 224x224 píxeles y acciones de 7 posiciones articulares absolutas más la pinza, a una frecuencia de control de 15 Hz. Es una de las tres suites de LADDER, junto con SimplerEnv-Long y RobotArena-∞-Long, cada una con su propio simulador y robot.

Su relevancia es metodológica: proporciona una interfaz estandarizada (EnvHub de LeRobot) para reproducir la evaluación de LADDER sin tener que montar manualmente Isaac Sim, RoboLab y los activos. Permite lanzar evaluaciones directamente sobre un checkpoint DROID y obtener métricas de éxito de tarea y progreso de subobjetivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (entorno de simulación, no un modelo neuronal) |
| Parametros totales | No disponible (no es un modelo con pesos) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | MIT (LADDER); RoboLab Apache-2.0; activos mayoritariamente CC BY-NC-SA 4.0; uso sujeto a la licencia de NVIDIA Isaac Sim |
| Formato de pesos | No aplica (entorno de simulación; descarga Isaac Lab, RoboLab y activos de ~1 GB en el primer uso) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado, sino de un entorno de simulación. La suite incluye el código de LADDER en su release v1.0.0, sin modificaciones, ejecutado con los ajustes del servidor RoboLab de LADDER; el archivo `requirements.txt` es el lock de ese entorno. Isaac Lab, RoboLab y los activos (unos 1 GB) se descargan en las versiones fijadas por LADDER en el primer uso. Los frames de reinicio coinciden con los episodios registrados por LADDER.

La configuración física es un brazo Franka con pinza Robotiq (setup DROID) sobre Isaac Sim 6 / Isaac Lab 3. La interfaz de observación expone `pixels.main` (vista cenital/over-the-shoulder) y `pixels.wrist` (vista de muñeca), ambas RGB de 224x224, más `agent_pos` con 7 posiciones articulares y el estado de la pinza (0 abierta, 1 cerrada). La acción se define como 7 posiciones articulares absolutas más la pinza (umbral 0.5 para cerrar), siguiendo cómo LADDER ejecuta pi0.5 (`pi05_droid_jointpos`). La frecuencia de control es de 15 Hz.

## Capacidades

- Evaluación estandarizada de políticas de manipulación robótica sobre 44 tareas de 1 a 10 subobjetivos.
- Interfaz compatible con LeRobot EnvHub, con observaciones visuales multicámara y acciones articulares absolutas.
- Métricas de éxito de tarea (`pc_success`) y de progreso de subobjetivos (`avg_sum_reward` e `info["metrics"]["subgoal_progress"]`).
- Ejecución en servidor remoto (`lerobot-env-server`) con Docker, necesario porque Isaac Sim requiere NumPy 2.3 y LeRobot no lo acepta.
- Selección de tareas individuales, listas separadas por comas o suite completa mediante `--env.task`.
- Integración con cualquier checkpoint DROID que siga la interfaz especificada (el autor valida con pi0.5).
- No incluye capacidades de lenguaje, visión general, tool calling ni razonamiento: es exclusivamente un banco de pruebas de robótica.

## Casos de uso

- Evaluación de políticas DROID de terceros: permite medir un checkpoint propio (por ejemplo, un fine-tuning de pi0.5) sobre 44 tareas estandarizadas y comparar con los episodios publicados de LADDER, sin reimplementar el entorno.
- Reproducción de resultados del paper LADDER: el entorno replica los frames de reinicio y los ajustes del servidor de LADDER, de modo que un investigador puede verificar cifras de éxito de tarea y progreso de subobjetivos.
- Análisis de progreso en tareas de horizonte largo: la métrica `subgoal_progress` permite diagnosticar en qué punto de una secuencia de hasta 10 subobjetivos falla una política, útil para ablaciones de arquitectura o de datos de entrenamiento.
- Comparación entre suites: al compartir interfaz con SimplerEnv-Long y RobotArena-∞-Long, se puede evaluar la misma política en tres simuladores y robots distintos (Franka/Robotiq, WidowX en SAPIEN y WidowX en Genesis) para estudiar transferencia sim-a-sim.
- Integración en pipelines de CI para robótica: lanzar evaluaciones automáticas con `lerobot-eval` en lotes de 8 episodios por tarea sobre GPUs RTX para detectar regresiones de una política antes de desplegarla en hardware.
- Docencia e investigación en manipulación: el empaquetado con Docker y EnvHub reduce la barrera de entrada a Isaac Sim, permitiendo a grupos sin infraestructura dedicada montar un banco de evaluación reproducible.
- Estudio de sensibilidad a la vista de cámara: al exponer vista cenital y de muñeca por separado, permite entrenar o evaluar políticas con una sola cámara o con ambas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible como tabla comparativa. La model card incluye una validación de reproducibilidad: pi0.5 ejecutado a través de este entorno alcanza el éxito en aproximadamente 19 y 16 de 32 episodios frente a 21 en los episodios publicados de LADDER, sobre cuatro tareas, dentro de la variación entre ejecuciones.

## Requisitos de hardware

- GPU NVIDIA RTX con soporte de contenedores (NVIDIA Container Toolkit) y Docker.
- VRAM: el lote de 8 episodios de una tarea debe mantenerse en tamaño 8 en una GPU de 48 GB; en una GPU de 24 GB hay que bajar el lote a 2.
- Primera ejecución: construcción de la imagen del simulador de aproximadamente 29 GB, con 10 a 20 minutos; los arranques posteriores reutilizan la imagen.
- Arranque del servidor: Isaac Sim se inicia antes de reportar disponibilidad, unos 5 minutos la primera vez por compilación de shaders.
- Despliegue: `lerobot-env-server` con `--docker=true` y `lerobot-eval` apuntando al endpoint del servidor (por ejemplo `tcp/127.0.0.1:7448`); requiere `pip install -e ".[dataset,evaluation,remote]"` más el extra de la política.
- Latencia y throughput: no disponibles más allá de los tiempos de arranque indicados.

## Comparativa con modelos similares

| Suite | Repositorio | Simulador | Robot | Tareas |
|---|---|---|---|---|
| RoboLab-Long | este repositorio | Isaac Sim 6 | Franka (DROID) | 44 |
| SimplerEnv-Long | INSAIT-Institute/LADDER-SimplerEnv-Long | SAPIEN 3 / ManiSkill 3 | WidowX | 54 |
| RobotArena-∞-Long | INSAIT-Institute/LADDER-RobotArena-Long | Genesis | WidowX | 47 |

Las tres suites comparten la licencia MIT de LADDER y el empaquetado EnvHub de LeRobot, y difieren en simulador, robot y número de tareas. No se dispone de datos de rendimiento comparativo entre suites en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo: no genera texto ni realiza inferencia; cualquier uso como "modelo" es un error de categoría.
- Requiere Isaac Sim y su aceptación de licencia EULA (`env.py` fija `OMNI_KIT_ACCEPT_EULA=YES`); el uso comercial queda condicionado por dicha licencia y por la de los activos de RoboLab, mayoritariamente CC BY-NC-SA 4.0, lo que puede restringir usos comerciales aunque el código LADDER sea MIT.
- Solo funciona detrás del servidor EnvHub: Isaac Sim necesita NumPy 2.3, que LeRobot no acepta, por lo que no puede ejecutarse dentro del proceso de LeRobot.
- El harness de referencia para el leaderboard oficial sigue siendo el propio de LADDER, no este repositorio; las cifras obtenidas aquí pueden diferir ligeramente.
- La evaluación está acotada a la configuración DROID (Franka + Robotiq, acciones articulares absolutas a 15 Hz); políticas con otro espacio de acciones no son directamente compatibles.
- Consumo de recursos alto: imagen de 29 GB, GPU de 24 a 48 GB y arranques de varios minutos.
- Sin datos de sesgos, alucinación o cobertura lingüística por no ser aplicables a un entorno de simulación; no disponibles.

## Enlaces

- Hugging Face: https://huggingface.co/INSAIT-Institute/LADDER-RoboLab-Long
- Suite SimplerEnv-Long: https://huggingface.co/INSAIT-Institute/LADDER-SimplerEnv-Long
- Suite RobotArena-∞-Long: https://huggingface.co/INSAIT-Institute/LADDER-RobotArena-Long
- Proyecto LADDER: https://ladderrobotics.ai
- Paper: https://arxiv.org/abs/2610.18053
- Repositorio LADDER: https://github.com/insait-institute/ladder
- Lista de tareas: https://github.com/insait-institute/ladder/blob/main/TASKS.md
- Release v1.0.0: https://github.com/insait-institute/ladder/releases/tag/v1.0.0
- Avisos de terceros: https://github.com/insait-institute/ladder/blob/main/THIRD_PARTY_NOTICES.md
- RoboLab: https://github.com/NVlabs/RoboLab
- Documentación EnvHub de LeRobot: https://huggingface.co/docs/lerobot/envhub
- Licencia NVIDIA Isaac Sim: https://docs.isaacsim.omniverse.nvidia.com/latest/common/NVIDIA_Omniverse_License_Agreement.html
