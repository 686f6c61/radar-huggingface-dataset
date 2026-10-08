# Atanaa/MICA-so101-modeli

## Resumen

MICA-so101-modeli no es un modelo de lenguaje, sino un repositorio de políticas de control robótico publicadas en formato LeRobot por el autor Atanaa (Stefan Atanasković), resultado del trabajo de fin de máster «Развој управљачке стратегије роботског система за манипулацију објектима на бази дубоког машинског учења и великих језичких модела», defendido en la Facultad de Ingeniería Mecánica de la Universidad de Belgrado en 2026. El repositorio ocupa 0,4 GB y contiene cuatro checkpoints organizados en carpetas: dos políticas ACT (`act/lift_L180`, `act/place_B2C`) y dos políticas PPO entrenadas en simulación con Isaac Lab y rsl_rl (`ppo/lift_L_base_s1`, `ppo/place_P_std015`).

El problema que resuelve es la manipulación física de objetos con el brazo robótico de bajo coste SO-101 de Hugging Face / TheRobotStudio: levantar una pelota concreta entre tres y depositarla en el contenedor indicado. Las políticas ACT reciben como objetivo la coordenada del objeto en el sistema de referencia de la base del robot, lo que permite parametrizar la tarea sin reentrenar el modelo para cada posición.

Su relevancia actual reside en que combina hardware abierto y asequible (el SO-101 se puede montar por unos 130 dólares), el framework LeRobot y checkpoints publicados con licencia CC-BY-4.0, incluyendo datos de entrenamiento abiertos. Además, aporta una comparación poco frecuente entre una política entrenada con datos reales (ACT) y dos políticas entrenadas en simulación con transferencia al mundo real (PPO), con tasas de éxito medidas sobre 20 intentos por tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) en los checkpoints `act/*`; PPO con red de política de rsl_rl sobre Isaac Lab en los checkpoints `ppo/*` |
| Parametros totales | no disponible (el repositorio completo ocupa 0,4 GB e incluye cuatro checkpoints) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ACT opera sobre ventanas de observaciones y chunks de acciones) |
| Tipos de cuantizacion | no disponible (los pesos se publican en safetensors sin variantes cuantizadas documentadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; la documentación está en serbio) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors, empaquetados en la estructura de `app/models/` de LeRobot |
| Tarea / pipeline | robotics (manipulación: lift y pick-and-place) |
| Robot objetivo | SO-101 (SO-ARM101) |
| Fecha de publicacion (metadatos) | 8 de octubre de 2026 |
| Descargas / likes | 0 descargas, 1 like en el momento de la consulta |

## Arquitectura y entrenamiento

Los checkpoints `act/*` emplean ACT, la política de imitación basada en transformer con decodificación por chunks de acciones que incorpora LeRobot. Su particularidad en este trabajo es que la condición de objetivo no es una instrucción en lenguaje natural, sino la coordenada del objeto expresada en el sistema de referencia de la base del robot. Los conjuntos de datos de entrenamiento están publicados de forma independiente en `Atanaa/MICA-so101-podaci`, y no se detalla en la información disponible el número de episodios, de transiciones ni la composición exacta de esas demostraciones.

Las políticas `ppo/*` se entrenaron íntegramente en simulación mediante Isaac Lab con la librería rsl_rl, en los entornos `So101-LiftXY-P1HA-v0` y `So101-PlaceXY-PP1-v0`. El fichero `xy_manual.json` recoge una corrección manual de la posición empleada para el despliegue en el robot físico, lo que sugiere un ajuste explícito para reducir la brecha sim-to-real. No se documentan en la información disponible detalles como el número de pasos de entrenamiento, el uso de RLHF/DPO (no aplicable a políticas de control) ni innovaciones adicionales de decodificación.

## Capacidades

- Generación de acciones de control continuas para un brazo SO-101 en tareas de alcance, agarre y colocación.
- Condicionamiento por coordenada de objetivo en el sistema de base del robot (checkpoints ACT), lo que permite seleccionar cuál de tres pelotas levantar.
- Diferenciación de contenedores de destino para la tarea de colocación (`act/place_B2C`, `ppo/place_P_std015`).
- Políticas entrenadas en simulación con transferencia a robot real (PPO) y políticas entrenadas sobre datos de demostración (ACT).
- Ejecución sobre el stack LeRobot, con integración en el flujo habitual de inferencia de `lerobot`.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües, visión integrada tipo VLM, audio ni modo de razonamiento. El título del trabajo menciona el uso de grandes modelos de lenguaje, pero la información disponible no especifica ningún componente LLM dentro de estos checkpoints.

## Casos de uso

- Automatización de pick-and-place en líneas de montaje educativas o de prototipado: las políticas `act/place_B2C` y `ppo/place_P_std015` cubren el ciclo completo de agarre y depósito, con 17/20 y 7/20 éxitos respectivamente sobre 20 intentos.
- Clasificación y selección de objetos por posición: `act/lift_L180` recibe la coordenada del objeto objetivo y acierta en la selección de la pelota correcta en 19 de 20 intentos, lo que sirve para tareas de triaje donde el operador indica qué pieza coger.
- Banco de pruebas docente para robótica con aprendizaje profundo: el repositorio incluye políticas de dos paradigmas distintos (imitación frente a refuerzo) sobre el mismo robot, lo que permite comparar metodologías en prácticas de laboratorio.
- Investigación en sim-to-real: `ppo/lift_L_base_s1` y `ppo/place_P_std015` permiten estudiar la transferencia de políticas entrenadas en Isaac Lab a hardware real y cuantificar la caída de rendimiento.
- Replicación de resultados y comparación de arquitecturas en LeRobot: al publicarse los datasets por separado, se pueden reentrenar las políticas ACT y contrastar variantes de hiperparámetros.
- Demostraciones de robótica de bajo coste para divulgación: con un SO-101 montable por unos 130 dólares y estos checkpoints, se puede reproducir una demo de manipulación condicionada por coordenadas sin presupuesto de laboratorio.
- Base para extensión a nuevas tareas de manipulación: la estructura en carpetas por tarea y algoritmo facilita añadir nuevos checkpoints al mismo pipeline de despliegue.

## Benchmarks y rendimiento

Los únicos datos de rendimiento disponibles son evaluaciones en el robot físico, con 20 intentos por tarea. No se han publicado métricas estándar de simulación ni comparaciones con otros modelos.

| Checkpoint | Algoritmo | Tarea | Resultado en robot (20 intentos) |
|---|---|---|---|
| `act/lift_L180` | ACT (LeRobot) | Levantar la pelota indicada de entre tres | selección correcta 19/20; levantamiento 11/20 |
| `act/place_B2C` | ACT (LeRobot) | Depositar la pelota en el contenedor indicado | 17/20 |
| `ppo/lift_L_base_s1` | PPO (Isaac Lab, rsl_rl) | Levantar la pelota | 8/20 |
| `ppo/place_P_std015` | PPO (Isaac Lab, rsl_rl) | Pick and place | agarre 12/20; objeto en el contenedor 7/20 |

No se han publicado resultados de benchmarks estandarizados (tipo MMLU, HumanEval o GSM8K) en la información disponible, dado que no se trata de un modelo de lenguaje.

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma explícita. Con un repositorio total de 0,4 GB repartido en cuatro checkpoints, el peso por checkpoint es reducido y la inferencia de políticas ACT de LeRobot suele caber holgadamente en GPUs de gama media; se trata de una estimación orientativa, no de un dato confirmado.
- GPU recomendadas: no especificadas por el autor. Cualquier GPU con soporte CUDA suficiente para PyTorch debería poder ejecutar la inferencia; en el extremo alto no se requieren aceleradores de centro de datos como A100 o H100 para este tamaño de checkpoint.
- GPU de consumo: es plausible que quepa en GPUs de consumo (por ejemplo, RTX 3060 o superiores) e incluso en CPU para inferencia a baja frecuencia, aunque no hay confirmación en la documentación disponible. Para despliegue embebido sobre el propio robot, LeRobot es compatible con plataformas tipo Jetson, pero no se documenta aquí.
- Opciones de despliegue: LeRobot es el marco de referencia del repositorio; la descarga se realiza con `hf download Atanaa/MICA-so101-modeli --local-dir app/models`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a políticas de control robótico.
- Latencia y throughput: no disponibles. La arquitectura ACT agrupa la predicción en chunks de acciones, lo que reduce la frecuencia de inferencia necesaria respecto a políticas que emiten una acción por paso, pero no se publica ninguna cifra de frecuencia de control ni de tiempo de inferencia.

## Comparativa con modelos similares

| Modelo / recurso | Tipo | Robot | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| MICA-so101-modeli | Checkpoints ACT y PPO para SO-101 | SO-101 | no disponible | no aplica | 19/20, 17/20, 11/20, 8/20, 12/20, 7/20 según tarea e intentos | CC-BY-4.0 | Hugging Face, repositorio de 0,4 GB |
| Checkpoints del curso sim-to-real SO-101 de NVIDIA | Políticas preentrenadas para el mismo robot | SO-101 | no disponible | no aplica | no disponible en la información recogida | no disponible | Hugging Face, vía documentación de NVIDIA |
| Colección so101 de la comunidad en Hugging Face | Conjunto de modelos y datasets de terceros | SO-101 | no disponible | no aplica | no disponible | variable según el modelo | Hugging Face |
| Modelos SO-ARM100/101 en mujoco_menagerie | Modelos de simulación (URDF/MJCF) | SO-ARM100/101 | no aplica | no aplica | no aplica | según el repositorio | GitHub (Google DeepMind) |

La comparación cuantitativa con alternativas no es posible con la información disponible: no se han publicado tablas de parámetros ni de rendimiento de los otros recursos recogidos en la búsqueda.

## Limitaciones y advertencias

- Los datos de evaluación proceden de solo 20 intentos por tarea y de un único montaje físico, por lo que las tasas de éxito tienen un margen de error amplio y no garantizan reproducibilidad en otra unidad del robot.
- Las políticas PPO presentan un rendimiento bajo en hardware real: 8/20 en levantamiento y 7/20 en colocar el objeto en el contenedor, con 12/20 de agarre correcto. La brecha sim-to-real es evidente y el autor aplica una corrección manual de posición mediante `xy_manual.json`.
- Las políticas ACT dependen de que la coordenada del objeto se proporcione correctamente en el sistema de referencia de la base del robot; un error en esa entrada degrada directamente el comportamiento.
- No hay información sobre sesgos, pero al tratarse de políticas de control el riesgo relevante no es la alucinación, sino la generalización limitada a posiciones, iluminación, objetos o condiciones no vistas durante el entrenamiento.
- No se documenta el rendimiento con objetos distintos de las pelotas y contenedores usados en el entrenamiento, ni la robustez ante cambios de calibración, vibración o distracciones en la escena.
- No se especifican idiomas soportados ni componentes de lenguaje natural; aunque el título del trabajo menciona grandes modelos de lenguaje, no se describe ningún módulo LLM en los checkpoints publicados.
- La licencia CC-BY-4.0 permite uso comercial siempre que se atribuya la autoría, pero no se ofrece ninguna garantía ni soporte, y no se indica si el uso comercial está previsto o respaldado por el autor.
- La documentación del repositorio y del trabajo está en serbio, lo que dificulta la adopción por parte de equipos que no lean ese idioma; no hay traducción disponible.
- No se indican requisitos de seguridad física para operar el brazo, algo crítico en cualquier despliegue con hardware real.
- El repositorio tiene 0 descargas y 1 like, por lo que no existe validación independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Atanaa/MICA-so101-modeli
- Dataset de entrenamiento: https://huggingface.co/datasets/Atanaa/MICA-so101-podaci
- Código del trabajo de fin de máster: https://github.com/Atanaaa/MICA-so101-master-rad
- Colección so101 de la comunidad en Hugging Face: https://huggingface.co/collections/Dongxiaokun/so101
- Curso sim-to-real SO-101 de NVIDIA (datasets y modelos): https://docs.nvidia.com/learning/physical-ai/sim-to-real-so-101/latest/datasets-and-models.html
- Modelos de simulación de SO-ARM100 (DeepWiki): https://deepwiki.com/TheRobotStudio/SO-ARM100/4.2-simulation-models
- Modelo SO-101 en mujoco_menagerie (Google DeepMind): https://github.com/google-deepmind/mujoco_menagerie/tree/main/robotstudio_so101
- Noticia sobre el lanzamiento del SO-101: https://www.hackster.io/news/hugging-face-launches-the-so-101-an-upgraded-low-cost-3d-printable-autonomous-robot-arm-532360f441eb
