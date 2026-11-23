# limxdynamics/tron1-rl-locomotion-policies

## Resumen

TRON 1 RL Locomotion Policies es una coleccion de politicas de locomocion entrenadas con aprendizaje por refuerzo para el robot bípedo LimX TRON 1, distribuidas en formato ONNX por el fabricante LimX Dynamics. No se trata de un modelo de lenguaje, sino de un conjunto de redes neuronales de control motor que generan consignas de articulacion para que el robot camine, se mantenga en equilibrio y, en las variantes con brazo, ejecute tareas de loco-manipulacion. El repositorio cubre las tres morfologias del TRON 1: pie puntual (point-foot, prefijo `PF_`), planta completa (sole-foot, `SF_`) y rueda-pie (wheel-foot, `WF_`).

Cada familia incluye multiples variantes de chasis (`TRON1A`, `TRON1B`, `P441A`, `P441B`, `P441C`, `P441C2`) y, para cada una, dos politicas entrenadas en simuladores distintos: Isaac Gym e Isaac Lab. Las politicas se ejecutan en CPU mediante ONNX Runtime, con un bucle de control a 500 Hz y la politica evaluada a 50 Hz, y pueden desplegarse tanto en simulacion MuJoCo como en el robot fisico a traves del SDK `limxsdk`.

Su relevancia actual radica en que expone publicamente, con licencia Apache 2.0, el resultado de un pipeline sim2real completo de un robot comercial: entrenamiento masivo en simulacion, transferencia a hardware real y una interfaz de despliegue reproducible. Ademas, las variantes `arm/` anaden un brazo de 6 grados de libertad controlado por la misma red, lo que convierte el repositorio en un ejemplo practico de loco-manipulacion extremo a extremo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes neuronales de politica entrenadas con RL (PPO implicito en Isaac Gym / Isaac Lab); arquitectura interna no detallada en la model card |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (politica de control, no modelo de secuencia) |
| Tipos de cuantizacion | no disponible; pesos distribuidos en ONNX (float) |
| Idiomas soportados | en, zh (documentacion); las politicas no procesan lenguaje |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`policy.onnx`, `encoder.onnx`) + `params.yaml` |

Detalles adicionales de la tabla de familias:

| Familia | Carpetas (`ROBOT_TYPE`) | Articulaciones / acciones |
|---|---|---|
| Point-foot | `PF_TRON1A`, `PF_TRON1B`, `PF_P441A`, `PF_P441B`, `PF_P441C`, `PF_P441C2` | 6 / 6 |
| Sole-foot | `SF_TRON1A`, `SF_TRON1B` | 8 / 8 |
| Wheel-foot | `WF_TRON1A`, `WF_TRON1B` | 8 / 8 |
| Sole-foot + brazo 6 DoF | `arm/SF_TRON1A` | 14 / 14 (8 piernas + 6 brazo) |
| Wheel-foot + brazo 6 DoF | `arm/WF_TRON1A` | 14 / 14 (8 piernas + 6 brazo) |

## Arquitectura y entrenamiento

Las politicas se entrenan con aprendizaje por refuerzo en dos entornos de simulacion fisica: Isaac Gym y Isaac Lab, ambos de NVIDIA. Para cada modelo se publican dos variantes seleccionables mediante la variable `RL_TYPE` (`isaacgym` o `isaaclab`), lo que permite comparar el comportamiento resultante de cada pipeline de entrenamiento sobre el mismo robot. La model card no especifica el numero de parametros de las redes ni el volumen total de pasos de entrenamiento, por lo que esos datos deben considerarse no disponibles.

Una innovacion destacable es la separacion en dos redes para las variantes con brazo: un `encoder.onnx` que comprime las ultimas 5 observaciones (405 → 64) y una `policy.onnx` que recibe 81 observaciones mas las 64 del encoder y produce 14 consignas articulares (8 de piernas y 6 del brazo). Esto permite que una unica red mantenga el equilibrio del cuerpo mientras mueve el brazo, es decir, loco-manipulacion integrada en lugar de dos controladores independientes. El bucle de control corre a 500 Hz y la politica se infiere a 50 Hz, una separacion tipica para desacoplar la baja frecuencia de decision de la alta frecuencia de actuacion.

## Capacidades

- Locomocion bipeda en tres morfologias: pie puntual, planta completa y rueda-pie.
- Marcha en el sitio y desplazamiento controlado por joystick (`robot-joystick`).
- Control de equilibrio dinamico en tiempo real a 500 Hz de bucle de control.
- Loco-manipulacion: en las variantes `arm/`, una sola red controla simultaneamente 8 articulaciones de piernas y 6 del brazo.
- Inferencia en CPU pura mediante ONNX Runtime, sin necesidad de GPU.
- Compatibilidad con simulacion MuJoCo y con el robot fisico via `limxsdk`.
- Soporte de dos pipelines de entrenamiento (Isaac Gym e Isaac Lab) intercambiables por configuracion.
- Interfaz de reinicio y arranque/parada mapeada a botones del mando (Backspace en simulacion; L1 + Y para arrancar, L1 + X para parada con rigidez cero y solo amortiguamiento).

## Casos de uso

- Investigacion en sim2real: permite reproducir un pipeline completo de entrenamiento en Isaac Gym/Lab y despliegue en MuJoCo y hardware real, sirviendo como banco de pruebas para estudiar la brecha simulacion-realidad con una plataforma comercial documentada.
- Desarrollo de controladores de locomocion personalizados: las politicas publicadas actuan como linea base contra la que comparar nuevos entrenamientos, gracias a la separacion clara entre `params.yaml`, encoder y policy.
- Demostraciones y teleoperacion: el Space `tron1-teleop` ejecuta las politicas `PF_TRON1A`, `SF_TRON1A` y `WF_TRON1A` en MuJoCo en el navegador, con control WASD, lo que facilita divulgacion y validacion rapida sin instalacion.
- Loco-manipulacion con brazo: las variantes `arm/SF_TRON1A` y `arm/WF_TRON1A` permiten prototipar tareas de alcance y manipulacion manteniendo el equilibrio, desplegables con `tron1-rl-deploy-arm` sobre ROS Noetic y Gazebo.
- Docencia en robotica y RL: el repositorio ofrece un caso real de politicas ONNX ejecutables en CPU, adecuado para practicas de aprendizaje por refuerzo aplicado a robots con patas.
- Evaluacion de morfologias: al incluir pie puntual, planta y rueda-pie con el mismo framework, permite comparar estabilidad, consumo y comportamiento entre configuraciones sobre el mismo robot.
- Integracion en pipelines de investigacion con ROS: la variante con brazo se despliega en ROS Noetic, lo que facilita conectarse a herramientas de percepcion y planificacion existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de recompensa, tasas de exito, velocidad de marcha ni comparaciones cuantitativas entre las variantes Isaac Gym e Isaac Lab.

## Requisitos de hardware

- Inferencia en CPU: las politicas estan pensadas para ejecutarse con ONNX Runtime en CPU, en Linux x86_64 o aarch64, con Python 3.
- VRAM: no aplica; no se requiere GPU para la inferencia. El tamano del repositorio es de 0.0 GB segun Hugging Face, coherente con redes de control ligeras.
- GPU recomendadas: no disponibles ni necesarias para el despliegue; el entrenamiento original se realizo en Isaac Gym / Isaac Lab, que requieren GPU NVIDIA, aunque la model card no especifica modelos concretos.
- Cabe en GPU de consumo: si, en el sentido de que la inferencia no necesita GPU; para reentrenar haria falta una GPU compatible con Isaac Gym/Lab (no detallada).
- Opciones de despliegue: ONNX Runtime (CPU), MuJoCo para simulacion, `limxsdk` para el robot real, y ROS Noetic + Gazebo para las variantes con brazo.
- Latencia y throughput: bucle de control a 500 Hz y politica a 50 Hz; no se publican latencias absolutas por inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Morfologias | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LimX TRON 1 RL Locomotion Policies | Politicas RL de locomocion | Point-foot, sole-foot, wheel-foot, con y sin brazo | ONNX | Apache 2.0 | Hugging Face, ModelScope, GitHub |
| Politicas de otros fabricantes de bipedos | Politicas RL de locomocion | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos sobre politicas equivalentes de otros fabricantes (Unitree, Boston Dynamics, Agility Robotics u otros) que permitan una comparacion cuantitativa de parametros, contexto o rendimiento. La comparativa queda limitada a la disponibilidad y licencia de este repositorio.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni de vision: no procesa texto, imagenes ni audio; cualquier uso fuera del control motor del TRON 1 carece de sentido.
- Las politicas estan acopladas a la morfologia y a las articulaciones concretas del TRON 1; no son transferibles directamente a otros robots sin reentrenamiento.
- La model card no documenta sesgos, tasas de fallo ni condiciones de operacion fuera de las nominales; el comportamiento ante terrenos irregulares, empujes o cargas no esta cuantificado.
- Riesgo de seguridad en hardware real: el despliegue requiere probar primero en simulacion, contar con un operador entrenado y mantener el paro de emergencia accesible; la parada se realiza con L1 + X en rigidez cero y solo amortiguamiento.
- Dependencia de un SDK propietario (`limxsdk`) y de un wheel especifico por plataforma para el despliegue en el robot.
- La licencia Apache 2.0 permite uso comercial, pero el repositorio no incluye garantias ni soporte; las consultas de compra y colaboracion se canalizan por `opensource@limxdynamics.com`.
- Los archivos se sincronizan desde GitHub, que se declara como fuente de verdad; pueden existir desfases entre el repositorio de Hugging Face y el codigo de despliegue.
- No se publican numeros de parametros ni de entrenamiento, lo que dificulta auditar el coste computacional del reentrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/limxdynamics/tron1-rl-locomotion-policies
- Space de teleoperacion: https://huggingface.co/spaces/limxdynamics/tron1-teleop
- ModelScope: https://www.modelscope.cn/models/LimXDynamics/tron1-rl-locomotion-policies
- Despliegue Python: https://github.com/limxdynamics/tron1-rl-deploy-python
- Despliegue con brazo (ROS Noetic + Gazebo): https://github.com/limxdynamics/tron1-rl-deploy-arm
- Simulador MuJoCo: https://github.com/limxdynamics/tron1-mujoco-sim
- Descripcion del robot (URDF / MJCF): https://github.com/limxdynamics/tron1-robot-description
- Entrenamiento Isaac Gym: https://github.com/limxdynamics/tron1-rl-isaacgym
- Entrenamiento Isaac Lab: https://github.com/limxdynamics/tron1-rl-isaaclab
- Contacto: opensource@limxdynamics.com
