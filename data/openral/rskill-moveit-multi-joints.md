# OpenRAL/rskill-moveit-multi-joints

## Resumen

`rskill-moveit-multi-joints` es un rSkill del proyecto OpenRAL, la capa agéntica de código abierto para robótica (Robot Agentic Layer) que unifica políticas rápidas, razonamiento lento, percepción y control clásico en un runtime tipado y orientado a la seguridad. A diferencia de un modelo de aprendizaje automático, este artefacto no contiene pesos: es un manifiesto declarativo que envuelve la acción `moveit_msgs/action/MoveGroup` de MoveIt como una habilidad invocable por el Reasoner de OpenRAL a través del mismo camino `ExecuteRskill` que usan las habilidades VLA.

Su función concreta es planificar y ejecutar un movimiento en el espacio de articulaciones hasta una configuración objetivo, con comprobación de colisiones contra la escena de planificación activa (`/planning_scene`). El objetivo se expresa como un bloque `joint` legible por un LLM (nombres de articulaciones y ángulos objetivo), que el adaptador `JointGoalRskill` traduce a restricciones `joint_constraints` de MoveIt en tiempo de configuración. El objetivo por defecto apunta a la pose home del Franka Panda (grupo de planificación `panda_arm`); para otros brazos es necesario duplicar el manifiesto con el nombre de grupo y las articulaciones correctas.

Es relevante ahora porque demuestra un patrón de integración limpio entre razonamiento de alto nivel y control de movimiento clásico verificado: la planificación se delega en MoveIt (o en cuMotion acelerado por GPU si el host cumple los requisitos), pero la trayectoria resultante se reproduce waypoint a waypoint a través de `/openral/candidate_action`, de modo que el kernel de seguridad en C++ valida cada posición comandada antes de enviarla. El manifiesto declara latencia de 2.000 ms, `dtype` fp32 y runtime PyTorch, aunque no se ejecuta ninguna inferencia neuronal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: manifiesto declarativo (`RSkillManifest`, `kind: ros_action`) que envuelve la acción ROS 2 `moveit_msgs/action/MoveGroup` |
| Parametros totales | No disponible (sin pesos de modelo) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (el manifiesto es el artefacto completo; sin safetensors ni GGUF) |

## Arquitectura y entrenamiento

El artefacto es un manifiesto de habilidad, no una red neuronal. En tiempo de resolución, el discriminador `kind: ros_action` selecciona el motor `ROSActionRskill`, y `ros_integration.goal_builder: joint` selecciona el adaptador `JointGoalRskill`. Este adaptador construye un `rclpy.action.ActionClient` sobre el nodo anfitrión `RskillRunnerNode`, envía un único objetivo generado a partir de `ros_integration.default_goal_json` y espera el resultado. La trayectoria devuelta (`trajectory_msgs/JointTrajectory`) se reproduce un waypoint por llamada a `step()` sobre `/openral/candidate_action`, de forma que el kernel de seguridad en C++ comprueba cada posición comandada.

El flujo interno tiene tres fases. En `_configure_impl` se importa de forma perezosa `moveit_msgs.action.MoveGroup`, se abre el `ActionClient` en `/move_action` y se parsea una sola vez el objetivo por defecto; `JointGoalRskill` extrae el bloque `joint` (nombres, posiciones y tolerancia) y lo convierte en `request.goal_constraints[0].joint_constraints`, una `moveit_msgs/JointConstraint` por articulación. En el primer `_step_impl(world_state)` se construye el `MoveGroup.Goal` con `rosidl_runtime_py.set_message_fields`, se envía, se sondean los futuros de aceptación y resultado mientras el spin principal de rclpy atiende callbacks, se extrae `result.planned_trajectory.joint_trajectory` y se reordena según el orden de `RobotDescription.joints` del host mediante `build_joint_permutation_from_names`, devolviendo el waypoint 0 como un `Action(JOINT_POSITION, …)` de una fila. Cada `_step_impl` posterior devuelve el siguiente waypoint en caché y, tras el último, lanza `ROSRskillGoalSatisfied`, que el runner captura para cerrar el objetivo `ExecuteRskill` con `success=True`.

El campo `plan_only: true` garantiza que MoveGroup nunca acciona sus propios controladores: la reproducción por waypoints de OpenRAL es el único camino de actuación. `chunk_size: 1` está impuesto por el esquema para `kind: ros_action`, de modo que cada waypoint es su propio `ActionChunk` y el kernel de seguridad puede validarlo o rechazarlo antes de enviar el siguiente. No hay datos de entrenamiento, RLHF ni DPO porque no hay modelo entrenado.

## Capacidades

- Planificación de movimiento en espacio de articulaciones hasta una configuración objetivo, con comprobación de colisiones propia del planificador contra la escena de planificación activa.
- Ejecución de la trayectoria planificada mediante reproducción waypoint a waypoint validada por el kernel de seguridad de OpenRAL.
- Aceptación de objetivos en forma de bloque `joint` (nombres de articulaciones, posiciones y tolerancia) generado por un LLM; el LLM solo sobrescribe `joint.positions`, heredando planificador y tolerancias de `default_goal_json`.
- Integración con MoveIt `MoveGroup` a través de `/move_action` y con el camino unificado `ExecuteRskill` empleado por las habilidades VLA.
- Aceleración opcional de la planificación con cuMotion (pipeline `isaac_ros_cumotion`) cuando el host cumple el umbral GPU: Ampere o superior, CUDA ≥ 13 y aproximadamente 8 GB de VRAM; en caso contrario, retroceso transparente a OMPL sin cambios en el manifiesto.
- Etiquetado multi-embodiment para filtrado de capacidades: `franka_panda` (objetivo por defecto), `ur5e`, `ur10e`, `so100_follower`, `openarm`, `rizon4`, `sawyer` y `widowx`.
- Sin especialización por objeto ni por escena: la comprobación de colisiones la realiza el planificador envuelto.
- No soporta tool calling genérico ni agentes multi-paso por sí mismo; su rol declarado es `s1` dentro de la jerarquía de habilidades de OpenRAL.

## Casos de uso

- Posicionamiento inicial de políticas VLA: cuando una política ha sido entrenada con una pose de partida concreta en el espacio de articulaciones, esta habilidad lleva el brazo a esa configuración de forma reproducible, ya que acepta exactamente un ángulo por articulación del grupo de planificación.
- Movimiento articular seguro en producción: al reproducir la trayectoria waypoint a waypoint sobre `/openral/candidate_action`, cada posición comandada pasa por el kernel de seguridad en C++, lo que permite rechazar tramos peligrosos antes de que lleguen al controlador.
- Retargeting entre brazos: duplicando el manifiesto con el nombre de grupo de planificación y los nombres de articulaciones correctos, el mismo patrón sirve para UR5e, UR10e, SO-100 follower, OpenArm, Rizon4, Sawyer o WidowX, lo que facilita flotas heterogéneas con una sola interfaz de razonamiento.
- Planificación acelerada por GPU en estaciones con Ampere o superior: en hosts que cumplen el umbral de cuMotion, el runner activa `isaac_ros_cumotion` de forma transparente para reducir el tiempo de planificación en escenas complejas, manteniendo la validación por waypoint.
- Recuperación tras fallo de política: si una política deja el brazo en una pose fuera de distribución, el Reasoner puede invocar esta habilidad para devolverlo a la pose home de Franka Panda definida por defecto antes de reintentar la tarea.
- Automatización de secuencias pick-and-place con razonamiento lento: el Reasoner decide el objetivo articular y delega la planificación libre de colisiones en MoveIt, separando la decisión semántica del cálculo de trayectorias y manteniendo trazabilidad tipada de cada paso.
- Puesta a punto de celdas MoveIt existentes: al envolver una acción `MoveGroup` ya desplegada, permite incorporar un robot con stack ROS 2 MoveIt a un agente OpenRAL sin reescribir el planificador ni los controladores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El manifiesto declara una latencia de referencia de 2.000 ms y el campo `runtime: pytorch` con `dtype: fp32`, aunque no se ejecuta inferencia neuronal. No se proporcionan cifras de throughput ni de tiempo de planificación para OMPL o cuMotion.

## Requisitos de hardware

- VRAM para inferencia: no aplica al manifiesto; si se activa cuMotion, el umbral declarado es de aproximadamente 8 GB de VRAM, GPU Ampere o superior y CUDA ≥ 13.
- GPU recomendadas para cuMotion: cualquier GPU Ampere o posterior que cumpla el umbral de VRAM; no se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Sin cuMotion, la planificación cae a OMPL y no requiere GPU; el requisito es un host ROS 2 con MoveIt y la acción `/move_action` disponible.
- Cabe en GPU de consumo solo si se cumplen los requisitos de cuMotion; en caso contrario, la ejecución es íntegramente en CPU.
- Despliegue: runtime OpenRAL con `RskillRunnerNode` (rclpy), `ROSActionRskill`, `JointGoalRskill` y el kernel de seguridad en C++; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este artefacto.
- Latencia y throughput: latencia declarada de 2.000 ms; no se proporcionan estimaciones de throughput ni de tiempo de planificación por waypoint.

## Comparativa con modelos similares

| Habilidad | Tipo | Objetivo | Planificador | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rskill-moveit-multi-joints` | `ros_action`, `goal_builder: joint` | Configuración articular (una posición por articulación) | MoveIt `MoveGroup`, con cuMotion opcional y retroceso a OMPL | Apache 2.0 | Hugging Face (OpenRAL) |
| `rskill-moveit-multi-eef_pose` | `ros_action` (referenciada en la model card) | Pose cartesiana del efector final | MoveIt `MoveGroup` | No disponible en la información | Hugging Face (OpenRAL) |
| Políticas VLA integradas en OpenRAL | Políticas neuronales invocadas vía `ExecuteRskill` | Acciones de robot aprendidas | No aplica | No disponible en la información | Repositorio OpenRAL |
| Control clásico directo (sin habilidad) | ROS 2 / MoveIt nativo | Configuración articular | MoveIt `MoveGroup` | Según el stack | Requiere integración manual con el agente |

La diferencia principal frente a `rskill-moveit-multi-eef_pose` es el espacio del objetivo: articular frente a cartesiano. Frente a las políticas VLA, esta habilidad no aprende comportamiento, sino que aporta planificación determinista con comprobación de colisiones y validación por waypoint.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni una política: no genera texto, no razona y no tiene capacidades cognitivas propias; depende del Reasoner de OpenRAL para decidir el objetivo.
- El objetivo por defecto está codificado para Franka Panda (`panda_arm`); usarlo con otro brazo sin duplicar y ajustar el manifiesto (nombre de grupo y nombres de articulaciones) producirá fallos de planificación.
- Requiere un stack ROS 2 con MoveIt operativo y la acción `/move_action` accesible; no funciona de forma aislada.
- La comprobación de colisiones depende de que `/planning_scene` esté actualizada; una escena desactualizada puede permitir trayectorias que colisionen con obstáculos no registrados.
- No hay especialización por objeto ni por escena, por lo que tareas que requieran agarre o manipulación específica deben combinarse con otras habilidades.
- La aceleración cuMotion exige Ampere o superior, CUDA ≥ 13 y aproximadamente 8 GB de VRAM; por debajo de ese umbral se planifica con OMPL, con tiempos potencialmente mayores no cuantificados en la información disponible.
- `plan_only: true` implica que MoveGroup no acciona controladores; cualquier despliegue que espere que MoveIt ejecute directamente la trayectoria no funcionará con este manifiesto.
- El único idioma declarado es inglés, lo que afecta a la documentación y a las descripciones de la habilidad expuestas al LLM.
- Licencia Apache 2.0: permite uso comercial con las obligaciones habituales de atribución y aviso; no se documentan restricciones adicionales.
- El repositorio registra 0 descargas y 1 like en el momento de la consulta, por lo que la madurez y el soporte de la comunidad son limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenRAL/rskill-moveit-multi-joints
- README del modelo: https://huggingface.co/OpenRAL/rskill-moveit-multi-joints/blob/main/README.md
- Repositorio OpenRAL en GitHub: https://github.com/OpenRAL/openral
