# limxdynamics/tron1-robot-description

## Resumen

`limxdynamics/tron1-robot-description` no es un modelo de aprendizaje automatico, sino un repositorio de descripcion robotica: contiene los ficheros URDF, Xacro y MuJoCo MJCF, junto con las mallas STL, de la familia de robots bipedos TRON1 de LimX Dynamics. Cubre tres variantes de pie (point-foot, sole-foot con tobillo y wheel-foot) y, ademas, un cuadrupedo con ruedas de la serie P311. El repositorio esta pensado para simulacion y para el pipeline de entrenamiento sim-to-real de la compania, con integracion directa en ROS 1 Noetic, ROS 2 Iron, Gazebo e Isaac Lab / Isaac Gym.

Su relevancia practica es la de un activo de ingenieria: permite cargar los modelos en MuJoCo con `pip install mujoco` y un unico comando, o compilarlos como paquete ROS `robot_description`, sin depender de hardware fisico. Para investigadores en locomotion aprendida y para desarrolladores que necesitan un gemelo digital de un bipedo comercial con licencia permisiva, este repositorio elimina el trabajo de modelado cinematico y de inerciales que normalmente precede a cualquier experimento de control.

El repositorio ocupa 0,2 GB (principalmente mallas STL) y se distribuye bajo Apache 2.0, con documentacion bilinguee ingles/chino. No contiene pesos neuronales, checkpoints ni codigo de inferencia: es exclusivamente descripcion geometrica y de articulaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (repositorio de descripcion robotica: URDF, Xacro, MJCF) |
| Parametros totales | No disponible (no es un modelo neuronal) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en), chino (zh) en la documentacion |
| Licencia | Apache 2.0 |
| Formato de pesos | URDF, Xacro, MJCF (XML), SRDF y mallas STL |

Especificaciones de los robots descritos:

| Familia | Modelos | Tipo | Grados de libertad actuados | Formatos |
|---|---|---|---|---|
| Point-foot | `PF_TRON1A`, `PF_TRON1B`, `PF_P441A`, `PF_P441B`, `PF_P441C`, `PF_P441C2` | Bipedo con pie puntual | 6 | URDF, Xacro, MJCF |
| Sole-foot | `SF_TRON1A`, `SF_TRON1B` | Bipedo con pie completo y tobillo | 8 | URDF, Xacro, MJCF |
| Wheel-foot | `WF_TRON1A`, `WF_TRON1B` | Bipedo con ruedas en los pies | 8 | URDF, Xacro, MJCF |
| Wheel-legged | `WL_P311D`, `WL_P311E` | Cuadrupedo con ruedas | 16 | URDF, SRDF |

## Arquitectura y entrenamiento

El contenido no es una red neuronal, sino una jerarquia de descripcion cinematica: arbol de articulaciones, masas e inercias, geometrias de colision y visuales, y definiciones de transmision. La fuente unica se emite en tres formatos (URDF plano, Xacro modular y MJCF de MuJoCo), de modo que la misma definicion alimenta ROS 1, ROS 2, Gazebo y MuJoCo sin divergencias. Los Xacro incluyen por defecto bloques de transmision y el plugin de IMU de Gazebo; el bloque `ros2_control` y el plugin `gazebo_ros2_control` se activan con `use_gazebo:=true`.

No hay datos de entrenamiento, RLHF ni DPO, porque no existe entrenamiento en este repositorio. La innovacion tecnica relevante es la trazabilidad sim-to-real: segun la model card, estos son los mismos modelos usados en el stack oficial de entrenamiento de TRON1 con Isaac Lab e Isaac Gym, lo que reduce la brecha entre la politica entrenada en simulacion y el despliegue en el robot fisico. Se incluye ademas una malla opcional de la camara Intel RealSense D435, referenciada desde un bloque comentado en los modelos `*_TRON1A` y `*_TRON1B`.

## Capacidades

- Carga de los diez modelos bipedos en MuJoCo mediante MJCF, sin necesidad de ROS ni de instalacion adicional salvo `pip install mujoco`.
- Simulacion en Gazebo con transmisiones, sensor IMU y, opcionalmente, `ros2_control` y `gazebo_ros2_control`.
- Compilacion como paquete ROS unico llamado `robot_description` tanto en ROS 1 Noetic (`catkin_make`) como en ROS 2 Iron (`colcon`).
- Generacion de URDF desde Xacro con `rosrun xacro xacro` y seleccion de robot mediante la variable `ROBOT_TYPE`.
- Intercambio de morfologia (point-foot, sole-foot, wheel-foot) cambiando unicamente el nombre del modelo.
- Uso como base para entrenamiento de politicas de locomotion en Isaac Lab e Isaac Gym.
- Carga programatica desde Python con `mujoco.MjModel.from_xml_path` y `mujoco.mj_step`.
- Descarga del repositorio mediante `hf download limxdynamics/tron1-robot-description`.
- No incluye tool calling, razonamiento, vision por computador ni generacion de texto: no es un modelo de lenguaje.

## Casos de uso

- Entrenamiento de politicas de locomotion en Isaac Lab o Isaac Gym: el repositorio aporta las inercias y colisiones exactas del robot real, de modo que la politica aprendida en simulacion se transfiere al TRON1 fisico con una brecha sim-to-real menor.
- Desarrollo de controladores en ROS 2 Iron: compilando el paquete `robot_description` y activando `use_gazebo:=true`, se obtiene un lazo cerrado con `ros2_control` para probar controladores de articulaciones antes de tocar hardware.
- Validacion de algoritmos de marcha en MuJoCo: con `python -m mujoco.viewer --mjcf=.../pointfoot/WF_TRON1A/xml/robot.xml` se itera sobre un controlador en minutos, sin ROS y sin robot.
- Comparativa de morfologias de pie: al compartir fuente, se puede evaluar la misma politica sobre `PF_TRON1A` (6 DoF, pie puntual), `SF_TRON1A` (8 DoF, con tobillo) y `WF_TRON1A` (8 DoF, con ruedas) cambiando solo el nombre del modelo.
- Planificacion de movimiento y comprobacion de colisiones: el URDF y el SRDF permiten integrar el robot en MoveIt para verificar alcances y autocollisiones antes de disenar trayectorias.
- Gemelo digital para visualizacion y teleoperacion: el MJCF con mallas STL sirve para renderizar el estado real del robot en un visor y comparar consignas frente a respuesta simulada.
- Docencia e investigacion en robotica con patas: al ser Apache 2.0 y no requerir hardware, se puede usar en cursos y laboratorios para experimentar con control de bipedos.
- Integracion en pipelines de CI: cargar el MJCF en un test unitario de Python para detectar regresiones en el arbol cinematico o en las inercias tras modificaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un repositorio de descripcion robotica y no de un modelo neuronal, no aplican metricas como MMLU, HumanEval o GSM8K. Tampoco se proporcionan cifras de latencia de simulacion ni de throughput de pasos de MuJoCo.

## Requisitos de hardware

- VRAM: no aplica; el repositorio no contiene pesos ni requiere GPU para cargarse.
- GPU: no requerida para visualizar o compilar los modelos. Para entrenamiento con Isaac Lab o Isaac Gym se necesita una GPU NVIDIA compatible con CUDA; la model card no especifica modelos concretos.
- CPU y RAM: suficiente un equipo de escritorio convencional; el repositorio pesa 0,2 GB, dominado por las mallas STL.
- Despliegue: MuJoCo (`pip install mujoco`), ROS 1 Noetic, ROS 2 Iron, Gazebo, Isaac Lab e Isaac Gym.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Repositorio | Tipo de robot | DoF actuados | Formatos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `limxdynamics/tron1-robot-description` | Bipedo (point-foot, sole-foot, wheel-foot) y cuadrupedo con ruedas | 6, 8 y 16 | URDF, Xacro, MJCF, SRDF | Apache 2.0 | Hugging Face y GitHub |
| `unitreerobotics/unitree_ros` | Cuadrupedos y humanoides Unitree | No disponible en la informacion proporcionada | URDF, Xacro | No disponible en la informacion proporcionada | GitHub |
| `google-deepmind/mujoco_menagerie` | Coleccion de robots de diversos fabricantes | Variable segun modelo | MJCF | No disponible en la informacion proporcionada | GitHub |

No se dispone de datos verificados en la informacion proporcionada para comparar rendimiento de simulacion, fidelidad de inercias o cobertura de variantes frente a estos repositorios.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona y no procesa imagenes; cualquier expectativa de inferencia neuronal es un error de categoria.
- El cuadrupedo con ruedas (`WL_P311D`, `WL_P311E`) solo incluye URDF y SRDF, sin MJCF, por lo que no se puede cargar directamente en MuJoCo con `xml/robot.xml`.
- La malla de la camara Intel RealSense D435 esta referenciada desde un bloque comentado; hay que descomentarlo y ajustar la ruta para usarla.
- El repositorio es un espejo del GitHub oficial; los issues y contribuciones deben dirigirse al repositorio de GitHub, no a Hugging Face.
- La licencia Apache 2.0 permite uso comercial, pero no se documentan en la informacion disponible garantias sobre exactitud de parametros inerciales ni sobre correspondencia con una revision concreta del hardware fisico.
- No se especifican versiones minimas de MuJoCo, ROS ni Isaac Lab; la compatibilidad se declara de forma generica (Noetic, Iron, MuJoCo, Gazebo).
- Los modelos pueden requerir ajuste de controladores y de limites de par para reflejar la configuracion real del robot; la model card no detalla esos valores.
- La documentacion esta en ingles y chino; no hay traduccion oficial al castellano.

## Enlaces

- Hugging Face: https://huggingface.co/limxdynamics/tron1-robot-description
- Repositorio GitHub: https://github.com/limxdynamics/tron1-robot-description
- Organizacion en Hugging Face: https://huggingface.co/limxdynamics
- Guia de inicio rapido TRON1: https://github.com/limxdynamics/limxdynamics/blob/main/doc/quickstart.md#tron1
- Entrenamiento RL con Isaac Lab: https://github.com/limxdynamics/tron1-rl-isaaclab
- Entrenamiento RL con Isaac Gym: https://github.com/limxdynamics/tron1-rl-isaacgym
- Comunidad WeChat: https://github.com/limxdynamics/limxdynamics/blob/main/doc/wechat_qr.png
- Contacto: opensource@limxdynamics.com
- MuJoCo: https://mujoco.org/
- ROS 1 Noetic: http://wiki.ros.org/noetic
- ROS 2 Iron: https://docs.ros.org/en/iron/
- Gazebo: https://gazebosim.org/
