# OpenRAL/rskill-nav2-mobile_base-navigate_to_pose

## Resumen

`OpenRAL/rskill-nav2-mobile_base-navigate_to_pose` no es un modelo de lenguaje ni una red neuronal: es un rSkill del proyecto OpenRAL, un paquete de integración que expone la acción `nav2_msgs/action/NavigateToPose` de Nav2 como una habilidad invocable por el Reasoner de OpenRAL a través del mismo camino `ExecuteRskill` que usan las habilidades VLA. Desarrollado por OpenRAL (Open-source Robot Agentic Layer), su función es permitir que un agente razonador despache navegación de base móvil —objetivos absolutos en el frame `map` o relativos en `base_link`— sin que el LLM tenga que componer cuaterniones contra la pose en vivo, ya que Nav2 resuelve la transformación vía tf2 al aceptar el goal.

El paquete se declara con `kind: ros_action` y `result_trajectory_field: null`, lo que activa el modo *result-only* del adaptador `ROSActionRskill`: envía el objetivo, espera el resultado de la acción y lanza `ROSRskillGoalSatisfied` en caso de éxito. No contiene pesos, no se entrena y no ejecuta inferencia propia (`inference: false`); envuelve el stack Nav2 upstream (Apache-2.0) mediante un manifiesto y un README. Su relevancia es de integración: añade navegación clásica basada en costmap y árbol de comportamiento al mismo runtime tipado y trazable que orquesta políticas rápidas, razonamiento lento y control clásico en OpenRAL.

El aspecto crítico para producción es su implicación de seguridad: en modo result-only ningún `ActionChunk` se publica en `/openral/candidate_action`, por lo que el supervisor de seguridad de OpenRAL no ve las velocidades de Nav2. El árbol de comportamiento de Nav2 publica `/cmd_vel` directamente y el `MobileBaseBridge` del HAL lo mapea a una acción `BODY_TWIST` aplicada sin pasar por el kernel; la evitación de colisiones recae enteramente en el costmap de Nav2 y en su `velocity_smoother`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No aplica: shim `ROSActionRskill` sobre un `ActionClient` de ROS 2 que envuelve `nav2_msgs/action/NavigateToPose` |
| Parámetros totales | No disponible (no contiene pesos; el artefacto envuelto es manifiesto + README) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje) |
| Tipos de cuantización | No aplica (no hay pesos que cuantizar) |
| Idiomas soportados | `en` (metadatos y documentación del paquete) |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (no hay pesos; el paquete contiene manifiesto rSkill y README) |

Otros campos del manifiesto: `name` = `OpenRAL/rskill-nav2-mobile_base-navigate_to_pose`, `version` = `0.1.0`, `kind` = `ros_action`, `role` = `s1`, runtime declarado `pytorch`, dtype `fp32`, `min_vram_gb` = null, `latency_ms` = 60000.0, acciones = `navigate`, objetos = ninguno, escenas = `indoor`, embodiment = `mobile_base`.

## Arquitectura y entrenamiento

No hay entrenamiento: el rSkill envuelve el stack Nav2 upstream. `ROSActionRskill` es un shim delgado sobre un `ActionClient` de ROS 2. En `_configure_impl` importa de forma perezosa `nav2_msgs.action.NavigateToPose`, abre un `ActionClient` sobre `/navigate_to_pose` usando el node handle que le proporciona `RskillRunnerNode` y parsea una sola vez `ros_integration.default_goal_json`. En la primera llamada a `_step_impl(world_state)` envía el goal, sondea los futuros de aceptación y resultado mientras el nodo anfitrión sigue girando el spin de rclpy para atender callbacks y, dado que `result_trajectory_field` es `None`, lanza `ROSRskillGoalSatisfied` inmediatamente al éxito; el runner captura esa excepción de forma específica y cierra el goal `ExecuteRskill` con `success=True`.

El Reasoner rellena `goal_params_schema` (objetivo absoluto en `map` o giro/avance relativo en `base_link`) y lo envía como `goal_params_json`, que el adaptador fusiona en profundidad sobre `ros_integration.default_goal_json`. El goal por defecto es la pose identidad en `base_link`, de modo que un despacho sin parámetros es un no-op. La procedencia upstream es `nav2_msgs/action/NavigateToPose` (Apache-2.0) y la librería de planificación es Nav2 (Apache-2.0); el costmap y el árbol de comportamiento son subsistemas propios de Nav2. El contraste con la habilidad hermana `rskill-moveit-multi-joints`, que sí define `result_trajectory_field` y reproduce una trayectoria articular waypoint a waypoint, ilustra los dos modos del adaptador.

## Capacidades

- Navegación de base móvil a una pose objetivo `geometry_msgs/PoseStamped` mediante la acción `NavigateToPose` de Nav2.
- Objetivos absolutos en coordenadas de mundo: `pose.header.frame_id: "map"` permite "ve a (3.5, 2.1)".
- Objetivos relativos a la pose actual: `pose.header.frame_id: "base_link"` permite giros, avances y retrocesos; Nav2 transforma vía tf2 al aceptar el goal, sin que el LLM componga cuaterniones.
- Modo result-only: envía el goal, espera el resultado y señala éxito con `ROSRskillGoalSatisfied`; no emite `ActionChunk`.
- Compatible con cualquier base móvil planar etiquetada como `mobile_base` (estado experimental), siempre que el `robot.yaml` la declare y un stack Nav2 sirva `/navigate_to_pose`.
- Consumo de sensores delegado en Nav2: `/scan` (o remap por despliegue) para la capa de obstáculos del costmap, `/odom` para localización y feedback del árbol de comportamiento, `/tf` y `/tf_static` para resolver la pose en el frame `map`, y `/map` (o pose inicial de AMCL) para el planificador global.
- Escenas soportadas: `indoor`.
- Sin soporte de tool calling genérico, agentes multi-step, visión, audio ni modo thinking: es una habilidad de acción ROS 2, no un modelo generativo.

## Casos de uso

- Recepción y guiado en interiores: el Reasoner interpreta una instrucción en lenguaje natural, la traduce a un goal en `map` y despacha `navigate`; Nav2 planifica con su costmap y su árbol de comportamiento, adecuado para entornos indoor mapeados.
- Giros y maniobras finas con goals relativos en `base_link`: alinearse con un panel, retroceder de una zona estrecha o girar 90 grados sin conocer la pose global, aprovechando la transformación tf2 de Nav2.
- Orquestación multi-habilidad: encadenar `navigate` (result-only) con habilidades de manipulación como `rskill-moveit-multi-joints` dentro del mismo camino `ExecuteRskill`, usando la navegación como fase de aproximación antes de manipular.
- Integración de flotas con Nav2 existente: robots que ya ejecutan Nav2 pueden exponerse al Reasoner de OpenRAL sin reescribir su stack de navegación, ya que el paquete solo añade un manifiesto y un adaptador.
- Prototipado de agentes encarnados en simulación: validar pipelines de razonamiento y despacho de acciones sobre bases móviles simuladas antes de portar el `robot.yaml` a hardware real.
- Patrullaje y puntos de interés: despachos repetidos a poses absolutas predefinidas en `map` con un goal por defecto identidad que garantiza que un despacho sin parámetros no mueve el robot.
- Despliegues con HAL basado en manifiesto: cualquier HAL cuyo `robot.yaml` declare `base_joints` obtiene el puente `/cmd_vel` a `BODY_TWIST`; en el árbol se incluye, por ejemplo, `PandaMobileHAL` como HAL de base móvil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El manifiesto declara `latency_ms: 60000.0` (60 s) como latencia de referencia de la habilidad; no se proporcionan datos de throughput ni de tasa de éxito de navegación.

## Requisitos de hardware

- VRAM: no aplica; el paquete no contiene pesos ni ejecuta inferencia (`inference: false`, `min_vram_gb: null`).
- GPU: no requiere GPU para el rSkill en sí; el coste computacional corresponde al stack Nav2 (planificación, costmap, árbol de comportamiento) y a los nodos de localización, habitualmente ejecutables en CPU.
- GPU de consumo: irrelevante para este paquete; cualquier equipo capaz de ejecutar ROS 2 y Nav2 es suficiente para el adaptador.
- Despliegue: runtime ROS 2 con `rclpy`, `nav2_msgs` y un servidor de acción Nav2 escuchando en `/navigate_to_pose`; el adaptador se instancia a través de `RskillRunnerNode`. No aplican vLLM, llama.cpp, Ollama ni TGI.
- Sensores y topics requeridos por Nav2: `/scan`, `/odom`, `/tf`, `/tf_static` y `/map` (o pose inicial de AMCL), con remaps configurables en el launch de Nav2.
- Latencia: `latency_ms` declarada de 60000.0; no se documentan tasas de éxito ni tiempos por trayecto.

## Comparativa con modelos similares

| Habilidad | Tipo | Modo | Salida | Licencia | Estado |
|---|---|---|---|---|---|
| `rskill-nav2-mobile_base-navigate_to_pose` | `ros_action` sobre Nav2 `NavigateToPose` | Result-only (`result_trajectory_field: null`) | Ninguna vía OpenRAL; Nav2 publica `/cmd_vel` | Apache-2.0 | Experimental |
| `rskill-moveit-multi-joints` (hermana) | `ros_action` sobre MoveIt | Reproducción de trayectoria waypoint a waypoint (`result_trajectory_field` definido) | Trayectoria articular por waypoints | No disponible en la información | No disponible |

No se dispone de datos de benchmarks ni de otras habilidades comparables en la información proporcionada.

## Limitaciones y advertencias

- Modo result-only sin supervisión de seguridad: ningún `ActionChunk` llega a `/openral/candidate_action`, por lo que ni el kernel C++ ni el nodo supervisor Python de OpenRAL ven las velocidades de Nav2.
- Los límites de velocidad `BODY_TWIST` del kernel solo se aplican a chunks que llegan a `/openral/candidate_action`, y únicamente si `robot.yaml` define `max_base_linear_speed_m_s` y `max_base_angular_speed_rad_s`; ambos son ilimitados por defecto.
- La evitación de colisiones depende exclusivamente del costmap y del árbol de comportamiento de Nav2, con el `velocity_smoother` de Nav2 como único limitador de velocidad.
- Estado experimental: solo se declara soporte para bases móviles planares etiquetadas `mobile_base`; el `robot.yaml` debe declarar la etiqueta y un stack Nav2 debe servir `/navigate_to_pose`.
- No se incluye ningún HAL de base con ruedas real en el árbol; los HAL de base móvil que aceptan `BODY_TWIST` sí están incluidos (por ejemplo `PandaMobileHAL`).
- Un despacho sin parámetros es un no-op (goal identidad en `base_link`), lo que puede enmascarar errores de configuración del Reasoner.
- Escenas limitadas a `indoor`; no se declaran capacidades de navegación outdoor.
- Idiomas: solo `en` en la documentación y metadatos; no hay soporte multilingüe declarado.
- Licencia Apache-2.0: permite uso comercial, pero el comportamiento del stack Nav2 subyacente y de los sensores desplegados queda fuera del alcance de este paquete.
- No se publican benchmarks ni tasas de éxito; la latencia declarada (60 s) debe validarse en el despliegue concreto.

## Enlaces

- Hugging Face: https://huggingface.co/OpenRAL/rskill-nav2-mobile_base-navigate_to_pose
- Repositorio OpenRAL en GitHub: https://github.com/OpenRAL/openral
- Acción upstream `NavigateToPose`: https://github.com/ros-navigation/navigation2/blob/main/nav2_msgs/action/NavigateToPose.action
- Documentación de Nav2: https://docs.nav2.org/
