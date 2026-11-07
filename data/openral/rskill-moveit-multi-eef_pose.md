# OpenRAL/rskill-moveit-multi-eef_pose

## Resumen

`rskill-moveit-multi-eef_pose` es un *rSkill* del proyecto OpenRAL: un artefacto de tipo manifiesto que envuelve el *action server* `moveit_msgs/action/MoveGroup` de ROS 2 para que un planificador de alto nivel (el *Reasoner* de OpenRAL) pueda despachar objetivos de pose cartesiana 6-DOF del efector final a través del mismo camino `ExecuteRskill` que usan las habilidades VLA. No contiene pesos de modelo: el manifiesto es el artefacto completo. Su función es planificar y ejecutar un movimiento libre de colisiones que lleve un *link* del efector final a una pose cartesiana objetivo (posición más orientación), con comprobación de colisiones contra la escena de planificación activa.

Se trata de la variante cartesiana genérica de la familia `rskill-moveit-*`: el hermano de `rskill-moveit-multi-look_at` (que es una especialización de pose calculada para apuntar una cámara) y de `rskill-moveit-multi-joints` (que trabaja en espacio de articulaciones). Está pensado para objetivos como una pose de pre-agarre, donde el usuario conoce la posición y orientación deseadas del TCP pero no la configuración articular correspondiente.

El modelo declara soporte para múltiples morfologías de brazo robótico (Franka Panda, UR5e, UR10e, SO-100 follower, OpenArm, Rizon4, Sawyer, WidowX), con el objetivo por defecto apuntando al demo de Franka (`panda_arm`, link `panda_hand` en `panda_link0`). La licencia es Apache 2.0 y el idioma declarado es inglés. Es relevante ahora porque permite integrar planificación de movimiento clásica de MoveIt dentro de pipelines agénticos que ya consumen habilidades VLA, sin necesidad de entrenar ni desplegar un modelo adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: manifiesto de habilidad (`rSkill`) que envuelve la acción ROS 2 `moveit_msgs/action/MoveGroup` mediante el motor `ROSActionRskill` y el adaptador `PoseGoalRskill` |
| Parametros totales | No disponible (sin pesos de modelo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible (no hay pesos; el manifiesto declara `dtype: fp32` para el runtime) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (sin pesos; el artefacto es el manifiesto `README.md` y metadatos) |

Otros parámetros declarados en la model card: `pipeline_tag: robotics`, `runtime: pytorch`, `latency_ms: 2000.0`, `min_vram_gb: null`, `inference: false`, `kind: ros_action`, `rskill-role: s1`.

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni entrenamiento: el artefacto es un manifiesto declarativo. En tiempo de resolución, el campo `kind: ros_action` del `RSkillManifest` selecciona el motor `ROSActionRskill`, y `ros_integration.goal_builder: pose` selecciona el adaptador de reducción de objetivo `PoseGoalRskill`. El motor construye un `rclpy.action.ActionClient` sobre el nodo anfitrión `RskillRunnerNode`, envía un objetivo construido a partir del bloque `pose` reducido, espera el resultado y reproduce la `trajectory_msgs/JointTrajectory` devuelta un waypoint por cada llamada a `step()` sobre `/openral/candidate_action`, de modo que el kernel de seguridad en C++ valida cada posición comandada.

El flujo de reducción del objetivo es el siguiente: `_configure_impl` importa de forma perezosa `moveit_msgs.action.MoveGroup`, abre un `ActionClient` sobre `/move_action` y parsea una vez `ros_integration.default_goal_json`. `PoseGoalRskill` extrae el bloque `pose` y lo reduce a `request.goal_constraints[0]`: una entrada `position_constraints` (una pequeña región delimitadora de `pose.position_tolerance_m` alrededor del punto objetivo) y una entrada `orientation_constraints` (el cuaternión objetivo con `pose.orientation_tolerance_rad`), ambas asociadas a `pose.link_name` en `pose.frame_id`. El cuaternión se interpreta según `pose.quaternion_order` (por defecto `xyzw`). Si se define `pose.tool_frame`, el adaptador consulta el offset `link_name ← tool_frame` vía TF2 y lo compone para expresar el objetivo en el marco del TCP. En la primera llamada a `_step_impl(world_state)` el motor construye el `MoveGroup.Goal`, lo envía, sondea los futuros de aceptación y resultado, extrae `result.planned_trajectory.joint_trajectory`, reordena sus `joint_names` al orden de `RobotDescription.joints` del anfitrión y devuelve el waypoint 0 como un `Action(JOINT_POSITION, …)` de una fila. Cada `_step_impl` posterior devuelve el siguiente waypoint en caché; tras el último se lanza `ROSRskillGoalSatisfied`, que el runner captura para cerrar el objetivo `ExecuteRskill` con `success=True`. El parámetro `plan_only: true` evita que MoveGroup accione sus propios controladores: la reproducción por waypoints de OpenRAL es la única vía de actuación.

## Capacidades

- Planificación y ejecución de movimiento libre de colisiones hacia una pose cartesiana 6-DOF del efector final (posición más orientación), mediante la acción `MoveGroup` de MoveIt.
- Comprobación de colisiones contra la escena de planificación activa (`/planning_scene`) realizada por el planificador envuelto.
- Acción expuesta: `reach`. Sin especialización por objeto ni por escena.
- Objetivo parametrizable por el LLM: el bloque `pose` con `position` y `orientation` es sobreescribible; los ajustes del planificador se heredan de `default_goal_json`.
- Soporte de marcos de referencia: `pose.frame_id` para posición y orientación, y `pose.tool_frame` opcional para expresar el objetivo respecto al TCP mediante TF2.
- Tolerancias configurables: `pose.position_tolerance_m` y `pose.orientation_tolerance_rad`.
- Orden de cuaternión configurable vía `pose.quaternion_order` (por defecto `xyzw`).
- Salida en forma de trayectoria articular reproducida waypoint a waypoint (`chunk_size: 1`, `horizon=1`, `is_terminal=False`) para validación por el kernel de seguridad.
- Filtrado de capacidades por morfología: el manifiesto declara etiquetas `embodiment:` para Franka Panda, UR5e, UR10e, SO-100 follower, OpenArm, Rizon4, Sawyer y WidowX.
- No soporta tool calling, agentes multi-paso, visión, audio ni modo *thinking*: no es un modelo generativo.

## Casos de uso

- Posicionamiento de pre-agarre: dado un punto y una orientación de aproximación calculados por un módulo de percepción o por el LLM, la habilidad planifica y ejecuta el movimiento del efector final hasta esa pose antes de que una habilidad de agarre tome el relevo.
- Automatización de pick-and-place en laboratorio: con un Franka Panda o un UR5e, se encadenan objetivos de pose cartesiana para depositar piezas en ubicaciones definidas sin calcular manualmente la cinemática inversa.
- Integración en pipelines agénticos: el *Reasoner* de OpenRAL despacha objetivos `pose` por el mismo camino `ExecuteRskill` que las habilidades VLA, lo que permite mezclar planificación clásica de MoveIt con políticas aprendidas en un mismo flujo.
- Tareas de inserción o ensamblaje simple: la orientación objetivo y las tolerancias angular y posicional permiten alinear el TCP con un receptáculo antes de un movimiento de aproximación fina.
- Reubicación de cámaras o herramientas montadas en el efector: definiendo `pose.tool_frame`, el objetivo se expresa respecto al TCP, útil para llevar un sensor o herramienta a una pose concreta.
- Prototipado multi-robot: las etiquetas de morfología permiten reutilizar la misma habilidad con UR10e, Sawyer, WidowX, OpenArm, Rizon4 o SO-100 follower, siempre que la configuración de MoveIt del robot esté disponible.
- Validación en simulación antes de despliegue: con `plan_only: true`, la planificación se puede ejecutar sin accionar controladores reales, lo que facilita probar objetivos en un entorno simulado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente declara una latencia de referencia de `latency_ms: 2000.0` para la habilidad, sin datos de precisión, tasa de éxito ni comparaciones.

## Requisitos de hardware

- VRAM: no aplica; el artefacto no contiene pesos de modelo y declara `min_vram_gb: null`. El runtime declarado es `pytorch` con `dtype: fp32`, pero la carga computacional recae en el planificador de MoveIt y en el kernel de seguridad, no en inferencia neuronal.
- GPU: no se especifican GPU recomendadas. La model card menciona una sección de planificación acelerada por GPU (cuMotion), pero no se detallan requisitos concretos en la información disponible.
- GPU de consumo: no disponible; al no requerir inferencia de red, el cuello de botella es la planificación de movimiento y la comunicación ROS 2, no la memoria de vídeo.
- Despliegue: entorno ROS 2 con MoveIt y un *action server* `moveit_msgs/action/MoveGroup` accesible en `/move_action`, más el nodo `RskillRunnerNode` de OpenRAL y el kernel de seguridad en C++. No aplica vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: solo se declara `latency_ms: 2000.0` como referencia; no hay datos de throughput ni de tiempos de planificación por número de waypoints.

## Comparativa con modelos similares

| Habilidad | Tipo | Acción | Espacio de objetivo | Morfologías declaradas | Licencia |
|---|---|---|---|---|---|
| `rskill-moveit-multi-eef_pose` | `ros_action` (MoveGroup) | `reach` | Pose cartesiana 6-DOF del efector final | Franka Panda, UR5e, UR10e, SO-100 follower, OpenArm, Rizon4, Sawyer, WidowX | Apache 2.0 |
| `rskill-moveit-multi-joints` | `ros_action` (MoveGroup) | No disponible en la información | Espacio de articulaciones | No disponible en la información | Apache 2.0 (misma familia) |
| `rskill-moveit-multi-look_at` | `ros_action` (MoveGroup) | No disponible en la información | Pose calculada para apuntar una cámara | No disponible en la información | Apache 2.0 (misma familia) |

No se dispone de datos de rendimiento comparado entre estas habilidades en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni una política aprendida: no genera texto, no razona y no tiene capacidades de visión, audio o tool calling. Cualquier expectativa en ese sentido es un error de categoría.
- La calidad y la tasa de éxito dependen por completo de la configuración de MoveIt del robot (URDF, SRDF, escena de planificación, parámetros del planificador) y de la calibración de TF2; el manifiesto no incluye ni valida esa configuración.
- El objetivo por defecto apunta al demo de Franka (`panda_arm`, `panda_hand`, `panda_link0`); usar otras morfologías requiere adaptar `default_goal_json` y disponer de la descripción del robot correspondiente.
- `plan_only: true` implica que MoveGroup no acciona controladores; la ejecución real depende de la reproducción de waypoints por OpenRAL y del kernel de seguridad. Un fallo en ese camino deja la habilidad sin efecto físico.
- Las tolerancias de posición y orientación mal ajustadas pueden producir objetivos inalcanzables o soluciones de planificación indeseadas; no se documentan valores por defecto en la información disponible.
- El idioma declarado es únicamente inglés; no hay soporte multilingüe documentado.
- Riesgo de alucinación: no aplica al no ser un modelo generativo, pero el LLM que construye el bloque `pose` sí puede generar coordenadas u orientaciones inválidas; la validación recae en MoveIt y en el kernel de seguridad.
- Licencia Apache 2.0: permite uso comercial con las obligaciones habituales de atribución y aviso; conviene revisar las dependencias de MoveIt y ROS 2 por separado.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validación externa; trátese como componente en fase temprana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenRAL/rskill-moveit-multi-eef_pose
- README del modelo: https://huggingface.co/OpenRAL/rskill-moveit-multi-eef_pose/blob/main/README.md
- Habilidad hermana `rskill-moveit-multi-look_at`: https://huggingface.co/OpenRAL/rskill-moveit-multi-look_at
- Habilidad hermana `rskill-moveit-multi-joints`: https://huggingface.co/OpenRAL/rskill-moveit-multi-joints
- Organización OpenRAL en Hugging Face: https://huggingface.co/OpenRAL
