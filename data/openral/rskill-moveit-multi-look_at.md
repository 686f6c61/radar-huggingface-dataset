# OpenRAL/rskill-moveit-multi-look_at

## Resumen

`rskill-moveit-multi-look_at` es una *skill* robótica (rSkill) publicada por OpenRAL en Hugging Face, no un modelo de lenguaje. Envuelve la acción `moveit_msgs/action/MoveGroup` de MoveIt 2 para resolver una tarea concreta: orientar una cámara montada en un brazo robótico hacia un punto 3-D del espacio, de forma que una consulta de percepción posterior o una skill de manipulación vea el objeto correctamente encuadrado. Se trata de la versión renombrada de `openral/rskill-look-at` dentro del proceso de reorganización de constructores de objetivos (*goal builders*) de MoveIt.

La skill ocupa el peldaño "look" de la escalera *recall → navigate → look → verify → manipulate*: se invoca después de navegar a una pose de aproximación y antes de `locate_in_view` o de una skill de agarre. El cálculo de la pose de mirada es analítico (convención óptica ROS: el eje +Z de la cámara apunta al objetivo) y la planificación del movimiento la realiza MoveIt 2 con comprobación de colisiones mediante FCL, con soporte opcional de la pipeline acelerada por GPU cuMotion de NVIDIA.

No contiene pesos ni parámetros entrenados: es un manifiesto más documentación que se ejecuta sobre una pila ROS 2 con MoveIt. Su relevancia radica en que estandariza una primitiva de percepción-actuación reutilizable en ocho plataformas robóticas distintas bajo licencia Apache-2.0, lo que facilita la composición de pipelines de manipulación multimodelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es una red neuronal; envoltorio de `moveit_msgs/action/MoveGroup` con adaptador `LookAtRskill`) |
| Parametros totales | no disponible (sin pesos; artefacto = manifiesto rSkill + README) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (dtype declarado: fp32; sin cuantización) |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (no hay pesos; manifiesto y documentación) |

## Arquitectura y entrenamiento

No hay entrenamiento. La skill envuelve el planificador de movimiento MoveIt 2 (BSD-3-Clause) y calcula la pose de mirada de forma analítica mediante `openral_core.geometry.compute_gaze_pose` (Apache-2.0, en el propio árbol del proyecto). La comprobación de colisiones se delega en FCL a través de la `PlanningScene` de MoveIt, ejecutada durante la planificación.

El flujo de resolución, en el momento del despacho, es el siguiente: primero se resuelve la cámara nombrada en `look_at.camera` (por defecto `"wrist"`) a partir de los sensores declarados en el `RobotDescription` del host; si no existe tal sensor, se lanza un `ROSConfigError` que lista los sensores disponibles en lugar de adivinar. Después se lee la pose actual de la cámara por TF2 en el frame del objetivo, se coloca la meta de la cámara (reapuntado en el sitio, opción por defecto, o a `look_at.standoff_m` del objetivo a lo largo de la línea de aproximación actual) y se orienta con `compute_gaze_pose`, dejando libre el giro sobre el eje óptico con tolerancia π para favorecer la alcanzabilidad del planificador. Finalmente se envían restricciones de posición y orientación a MoveGroup.

La skill se ejecuta deliberadamente con `plan_only: true`: la actuación real se hace por reproducción waypoint a waypoint a través de `/openral/candidate_action` con `chunk_size: 1`, de modo que el kernel de seguridad en C++ valida cada paso de apuntado y la HAL ejecuta. Si `move_group` ejecutara sobre sus propios controladores, se saltaría el kernel y se conduciría el brazo por duplicado. En hosts que cumplen el umbral GPU de cuMotion (`RobotCapabilities.supports_cumotion()`: Ampere o superior, CUDA ≥ 13, ~8 GB de VRAM), el runner fija `MotionPlanRequest.pipeline_id = "isaac_ros_cumotion"` y MoveIt planifica con la pipeline CUDA de NVIDIA; en caso contrario, recurre a OMPL. El cambio es transparente para el manifiesto y nunca evita el kernel de seguridad.

## Capacidades

- Apuntado de cámara a un punto 3-D: orienta el eje óptico de la cámara nombrada hacia `look_at.target_xyz` mediante planificación de movimiento consciente de colisiones.
- Reapuntado en el sitio o con distancia de separación: sin `standoff_m` reapunta en la pose actual; con `standoff_m` además desplaza la cámara a esa distancia del objetivo a lo largo de la línea de aproximación.
- Resolución de cámaras montadas de dos formas: sensores cuyo `frame_id` es un link del robot (por ejemplo, la eye-in-hand de LIBERO sobre `panda_hand` en Franka) y sensores con `parent_frame` más `static_transform_xyz_rpy` (montaje estilo SO-101), que restringen el link padre a través del desplazamiento declarado.
- Planificación acelerada por GPU opcional con cuMotion (Ampere+, CUDA ≥ 13, ~8 GB de VRAM), con caída automática a OMPL.
- Reproducción segura de trayectorias: salida como trayectoria conjunta reproducida un waypoint por `step()` como chunk `JOINT_POSITION` de una fila, validada por el kernel de seguridad.
- Integración como acción ROS 2 (`kind: ros_action`) con contrato de entrada `goal_params_json` y construcción de objetivo vía `goal_builder: look_at`.
- Compatibilidad declarada con ocho encarnaciones: Franka Panda (validada), UR5e, UR10e, SO-100 follower, OpenArm (bimanual, requiere elegir grupo `left_arm`/`right_arm`), Flexiv Rizon4, Rethink Sawyer y Trossen WidowX (las siete restantes en estado experimental).
- No soporta tool calling, agentes conversacionales, razonamiento multi-paso ni capacidades multilingües: no es un modelo generativo.

## Casos de uso

- Encuadre previo a la percepción: tras navegar a una pose de aproximación, la skill reapunta la cámara de muñeca al objeto para que `locate_in_view` obtenga una detección fiable; es su uso canónico dentro de la escalera recall → navigate → look → verify → manipulate.
- Ajuste de distancia de observación: fijando `standoff_m`, el brazo se aproxima o se aleja hasta una distancia concreta del objetivo, útil para cámaras con profundidad de campo o campo de visión limitados antes de una inspección visual.
- Reapuntado barato en el sitio: cuando la base ya está bien situada, omitir `standoff_m` evita desplazamientos innecesarios y reduce el tiempo de ciclo en tareas repetitivas de inspección.
- Alimentación de skills de agarre: en pipelines de manipulación, la pose de mirada resultante garantiza que la skill de grasp reciba una vista del objeto sin oclusiones del propio brazo, gracias a la planificación con comprobación de colisiones FCL.
- Estandarización multiplataforma en laboratorio: el mismo manifiesto sirve para Franka Panda (validado) y, con los overrides de `request.group_name` y `look_at.camera`/`frame_id`, para UR5e, UR10e, Sawyer, WidowX, Rizon4, OpenArm y SO-100, lo que simplifica el mantenimiento de bancos de pruebas heterogéneos.
- Aceleración en estaciones con GPU: en hosts con Ampere o superior y CUDA ≥ 13, la planificación por cuMotion reduce la latencia de apuntado sin cambiar el manifiesto ni el contrato de seguridad.
- Teleoperación asistida y demostraciones: la reproducción waypoint a waypoint con validación del kernel permite integrar el apuntado en flujos donde la seguridad por paso es requisito, como captura de datos para aprendizaje por imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente declara una latencia de 2000 ms (`latency_ms: 2000.0`) y `runtime: pytorch` con `dtype: fp32` en los metadatos de OpenRAL; no se aportan métricas de tasa de éxito, tiempo de planificación ni throughput.

## Requisitos de hardware

- VRAM: no se requiere VRAM para la skill en sí (sin pesos, `min_vram_gb: null`). La planificación por GPU con cuMotion exige Ampere o superior, CUDA ≥ 13 y aproximadamente 8 GB de VRAM; sin esos requisitos se usa OMPL en CPU.
- GPU recomendadas para cuMotion: cualquier GPU Ampere o posterior que cumpla el umbral de VRAM; no se especifican modelos concretos en la información disponible.
- GPU de consumo: no hay datos específicos; el criterio declarado es arquitectura Ampere o superior con ~8 GB de VRAM, no un modelo comercial concreto.
- Despliegue: pila ROS 2 con MoveIt 2, TF2 y el runtime de OpenRAL (`/openral/candidate_action`, HAL y kernel de seguridad en C++). La instalación de cuMotion se documenta en `docs/contributing/toolchain.md`, sección "GPU motion planning — cuMotion".
- Latencia: 2000 ms declarados en los metadatos; no se aportan datos de throughput ni de tiempos de planificación por pipeline.
- Almacenamiento y cómputo: el artefacto descargable es únicamente manifiesto y documentación; el coste real depende de la pila MoveIt y del robot.

## Comparativa con modelos similares

| Skill | Tipo | Objetivo | Planificador | Encarnaciones | Licencia |
|---|---|---|---|---|---|
| `rskill-moveit-multi-look_at` (esta) | ros_action, goal_builder `look_at` | Apuntar cámara a punto 3-D | MoveIt 2 (OMPL o cuMotion), FCL | 8 (1 validada, 7 experimentales) | Apache-2.0 |
| `rskill-moveit-multi-joints` | ros_action | Restricciones articulares en bruto | MoveIt 2 | no disponible en la información | Apache-2.0 (según tags de la familia) |
| `rskill-moveit-look-at` | ros_action | Apuntar cámara a punto 3-D (versión previa) | MoveIt 2 | no disponible en la información | Apache-2.0 |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas skills; la comparación se limita a función, mecanismo de planificación y licencia.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona y no tiene parámetros entrenados; cualquier expectativa de inferencia lingüística es incorrecta.
- Dependencia estricta de la declaración de sensores: si el robot no declara la cámara nombrada (por defecto `wrist`) en los sensores de su `robot.yaml`, la skill falla con `ROSConfigError`; no hay adivinación silenciosa.
- Solo Franka Panda está validada; UR5e, UR10e, SO-100 follower, OpenArm, Rizon4, Sawyer y WidowX son experimentales y requieren overrides de `request.group_name` y de `look_at.camera`/`frame_id`, o una configuración MoveIt propia en el caso del SO-100.
- OpenArm es bimanual y obliga a elegir el grupo `left_arm` o `right_arm`; una elección incorrecta produce planificación sobre el brazo equivocado.
- `plan_only: true` es intencionado: ejecutar con los controladores propios de `move_group` saltaría el kernel de seguridad y conduciría el brazo por duplicado; no debe modificarse ese comportamiento en producción.
- El giro sobre el eje óptico se deja libre con tolerancia π por alcanzabilidad; si una tarea requiere una orientación de roll concreta, la skill no la garantiza.
- La planificación con cuMotion depende del cumplimiento del umbral de hardware; en su ausencia la latencia puede diferir de la declarada (2000 ms) al usar OMPL, sin datos publicados al respecto.
- Licencia Apache-2.0 permite uso comercial, pero las dependencias subyacentes (MoveIt 2 y `moveit_msgs`) son BSD-3-Clause y deben respetarse por separado.
- No se han publicado evaluaciones de sesgo, alucinación ni robustez; al no ser un modelo generativo, estos riesgos no aplican, pero tampoco hay métricas de tasa de éxito en planificación.
- Idioma de la documentación: únicamente inglés.

## Enlaces

- Hugging Face: https://huggingface.co/OpenRAL/rskill-moveit-multi-look_at
- Versión previa de la skill: https://huggingface.co/OpenRAL/rskill-moveit-look-at
- Acción upstream `moveit_msgs/action/MoveGroup`: https://github.com/moveit/moveit_msgs/blob/master/action/MoveGroup.action
- Documentación de MoveIt 2: https://moveit.picknik.ai/
- Documentación de toolchain de OpenRAL (sección cuMotion): `docs/contributing/toolchain.md` en el repositorio del proyecto (sin URL absoluta en la información disponible)
