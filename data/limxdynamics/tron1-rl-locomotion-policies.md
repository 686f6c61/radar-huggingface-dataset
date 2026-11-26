# limxdynamics/tron1-rl-locomotion-policies

## Resumen

TRON 1 RL Locomotion Policies es una colección de políticas de locomoción entrenadas con aprendizaje por refuerzo para el robot bípedo LimX TRON 1, distribuidas en formato ONNX por LimX Dynamics. No se trata de un modelo de lenguaje, sino de un conjunto de controladores neuronales que mapean observaciones proprioceptivas del robot a consignas de posición articular, permitiendo que el robot camine, se mantenga en equilibrio y, en las variantes con brazo, realice tareas de loco-manipulación.

El repositorio cubre las tres morfologías del TRON 1: pie puntual (point-foot, `PF_*`), pie con planta (sole-foot, `SF_*`) y pie con rueda (wheel-foot, `WF_*`). Cada familia incluye variantes de hardware (TRON1A, TRON1B, P441A, P441B, P441C, P441C2) y, para cada una, dos políticas entrenadas en simuladores distintos: Isaac Gym e Isaac Lab. Las políticas se ejecutan en CPU mediante ONNX Runtime, tanto en simulación MuJoCo como en el robot real.

La relevancia actual radica en que ejemplifica el flujo sim2real en robótica con patas: entrenamiento masivo en simulación física, exportación a ONNX para inferencia determinista de baja latencia y despliegue con un bucle de control a 500 Hz y política a 50 Hz. Todo el material se publica bajo licencia Apache 2.0 y se sincroniza desde los repositorios GitHub de LimX Dynamics, que actúan como fuente de verdad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política (MLP) entrenada con RL; en variantes con brazo incluye un encoder de historial de observaciones; exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de observaciones: últimas 5 observaciones en el encoder de las políticas con brazo (405 → 64) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX sin cuantización declarada) |
| Idiomas soportados | en, zh (documentación); las políticas no procesan lenguaje |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`policy.onnx`, `encoder.onnx`) |

Otras especificaciones operativas:

| Parametro | Valor |
|---|---|
| Frecuencia de control | 500 Hz (bucle de control) |
| Frecuencia de política | 50 Hz |
| Entradas/salidas por familia | PF: 6 articulaciones / 6 acciones; SF: 8 / 8; WF: 8 / 8 |
| Loco-manipulación | 14 / 14 (8 piernas + 6 brazo); encoder 405 → 64, política 81 + 64 → 14 |
| Simuladores de entrenamiento | Isaac Gym, Isaac Lab |
| Simulador de despliegue | MuJoCo (y Gazebo en la variante con brazo) |
| Runtime de inferencia | ONNX Runtime en CPU |
| Plataformas | Linux x86_64 y aarch64, Python 3 |

## Arquitectura y entrenamiento

Las políticas son redes neuronales compactas que implementan un controlador reactivo: reciben observaciones proprioceptivas (estado articular, velocidades, orientación, consignas de mando) y emiten consignas de posición para las articulaciones. En las variantes con brazo de 6 grados de libertad, la arquitectura se desdobla en un encoder que comprime las últimas 5 observaciones (405 dimensiones de entrada) en un vector latente de 64 dimensiones, y una política que combina 81 observaciones actuales con ese latente para producir 14 consignas articulares (8 de piernas y 6 de brazo). Esto permite que un único network coordine marcha y manipulación manteniendo el equilibrio.

El entrenamiento se realizó con aprendizaje por refuerzo en dos stacks de simulación: Isaac Gym y Isaac Lab, generando un par de políticas por modelo de robot y por stack. El repositorio no detalla el número de tokens, la composición del dataset ni si se emplearon técnicas de RLHF o DPO, ya que no aplican a este dominio; tampoco se especifican hiperparámetros de entrenamiento, función de recompensa ni currículo. La innovación técnica destacable es la separación entre bucle de control (500 Hz) y política (50 Hz), junto con la exportación a ONNX para inferencia en CPU sin GPU, lo que facilita el despliegue en el hardware embebido del robot.

## Capacidades

- Locomoción bípeda en tres morfologías: pie puntual, pie con planta y pie con rueda.
- Control de equilibrio y marcha en el lugar, con arranque mediante reset en simulación.
- Teleoperación con joystick (WASD en la demo web; `robot-joystick` en simulación).
- Loco-manipulación: en las variantes `arm/SF_TRON1A` y `arm/WF_TRON1A`, un único network mueve las 8 articulaciones de las piernas y las 6 del brazo simultáneamente.
- Ejecución en CPU con ONNX Runtime, sin dependencia de GPU.
- Compatibilidad con MuJoCo para simulación y con el robot real vía `limxsdk`.
- Soporte de dos stacks de entrenamiento (Isaac Gym e Isaac Lab) seleccionables por variable de entorno.
- Documentación bilingüe inglés/chino.
- No incluye generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni capacidades de agente.

## Casos de uso

- Investigación en locomoción bípeda: servir como línea base reproducible para comparar algoritmos de RL, ya que ofrece políticas entrenadas en dos simuladores distintos (Isaac Gym e Isaac Lab) sobre el mismo hardware.
- Validación sim2real: ejecutar primero la política en MuJoCo y después en el robot real con el mismo binario ONNX, reduciendo la brecha entre entornos y facilitando la depuración del pipeline de despliegue.
- Teleoperación de robots humanoides: usar el joystick o la demo web para conducir el TRON 1 en tareas de inspección o demostración, aprovechando el bucle de control a 500 Hz para respuesta ágil.
- Loco-manipulación con brazo de 6 DoF: emplear las políticas `arm/SF_TRON1A` o `arm/WF_TRON1A` para que el robot alcance objetos mientras camina, útil en prototipos de manipulación móvil en interiores.
- Docencia y formación en robótica: el flujo completo (clonar repos, instalar `limxsdk`, lanzar simulador y controlador) constituye un ejercicio práctico de despliegue de políticas RL sin necesidad de GPU.
- Prototipado de controladores en entornos ROS: la variante con brazo se integra con ROS Noetic y Gazebo, lo que permite incorporar las políticas a pilas de software robótico existentes.
- Benchmarking de hardware bípedo: comparar el comportamiento de las morfologías PF, SF y WF bajo las mismas condiciones de simulación para evaluar el impacto del diseño del pie en la estabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; la inferencia se ejecuta en CPU con ONNX Runtime.
- GPU recomendadas: no se requiere GPU; el repositorio declara ejecución CPU only.
- Compatibilidad con GPU de consumo: no relevante para la inferencia; el entrenamiento (Isaac Gym / Isaac Lab) sí requiere GPU, pero no se especifican modelos concretos en la información disponible.
- Plataformas soportadas: Linux x86_64 y aarch64, Python 3.
- Opciones de despliegue: ONNX Runtime en CPU, MuJoCo para simulación, Gazebo con ROS Noetic para la variante con brazo, y `limxsdk` para el robot real.
- Latencia y throughput: bucle de control a 500 Hz y política a 50 Hz; no se publican cifras de latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Morfologías | Formatos | Licencia | Despliegue |
|---|---|---|---|---|---|
| LimX TRON 1 RL Locomotion Policies | Políticas RL de locomoción bípeda | PF, SF, WF y variantes con brazo | ONNX | Apache 2.0 | CPU, MuJoCo, Gazebo, robot real |
| Políticas RL de otros fabricantes de bípedos | Políticas RL de locomoción | no disponible | no disponible | no disponible | no disponible |
| Modelos de lenguaje open source (p. ej. Llama, Mistral) | LLM | no aplica | safetensors, GGUF | varía | GPU/CPU |

No se dispone de información sobre modelos directamente comparables de otros fabricantes de robots bípedos en la documentación proporcionada; la comparación con LLM se incluye únicamente para dejar claro que esta ficha no pertenece a esa categoría.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto, no genera código ni responde preguntas; cualquier uso en ese sentido es inadecuado.
- Las políticas están entrenadas específicamente para el hardware LimX TRON 1 y sus variantes; no son transferibles a otros robots sin reentrenamiento.
- El despliegue en el robot real exige un operador entrenado, el estado de calibración 0 y la parada de emergencia accesible; el propio autor recomienda probar primero en simulación.
- El arranque y la parada se realizan con combinaciones de botones (L1 + Y para iniciar, L1 + X para detener con rigidez cero y solo amortiguación), lo que introduce riesgo operativo si no se sigue el protocolo.
- No se documentan sesgos, tasas de alucinación ni limitaciones de contexto porque no aplican al dominio; sin embargo, no se publican métricas de robustez ante terrenos irregulares, perturbaciones externas o fallos de sensores.
- La licencia Apache 2.0 permite uso comercial, pero el software de despliegue (`limxsdk`, repositorios GitHub) puede tener condiciones propias que deben revisarse por separado.
- Los archivos se sincronizan desde GitHub; pueden existir desfases entre el repositorio de Hugging Face y la fuente de verdad.
- El tamaño del repositorio es de 0.0 GB según Hugging Face, lo que sugiere que las políticas son muy ligeras, pero no se detalla el número exacto de parámetros de cada red.

## Enlaces

- Hugging Face: https://huggingface.co/limxdynamics/tron1-rl-locomotion-policies
- Demo web (TRON 1 Teleop en MuJoCo): https://huggingface.co/spaces/limxdynamics/tron1-teleop
- Repositorio de despliegue Python: https://github.com/limxdynamics/tron1-rl-deploy-python
- Repositorio de despliegue con brazo (ROS Noetic + Gazebo): https://github.com/limxdynamics/tron1-rl-deploy-arm
- Simulador MuJoCo: https://github.com/limxdynamics/tron1-mujoco-sim
- Modelos del robot (URDF / MJCF): https://github.com/limxdynamics/tron1-robot-description
- Entrenamiento con Isaac Gym: https://github.com/limxdynamics/tron1-rl-isaacgym
- Entrenamiento con Isaac Lab: https://github.com/limxdynamics/tron1-rl-isaaclab
- Espejo en ModelScope: https://www.modelscope.cn/models/LimXDynamics/tron1-rl-locomotion-policies
- Contacto comercial: opensource@limxdynamics.com
