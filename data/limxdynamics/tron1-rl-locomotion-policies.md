# limxdynamics/tron1-rl-locomotion-policies

## Resumen

TRON 1 RL Locomotion Policies es una colección de políticas de locomoción entrenadas por refuerzo (RL) para el robot bípedo LimX TRON 1, distribuidas en formato ONNX por LimX Dynamics. No se trata de un modelo de lenguaje ni de un modelo fundacional generativo, sino de un conjunto de controladores neuronales que mapean observaciones de estado del robot a comandos de articulación para que el robot camine, se mantenga en pie y se desplace de forma estable. El repositorio cubre las tres variantes mecánicas del TRON 1: pie de punta (`PF_*`), pie de suela (`SF_*`) y pie con rueda (`WF_*`).

Cada variante incluye dos políticas entrenadas en simuladores distintos (Isaac Gym e Isaac Lab), más un codificador (`encoder.onnx`) que acompaña a la política en el bucle de control. Las políticas se ejecutan en CPU mediante ONNX Runtime, lo que permite desplegarlas tanto en simulación (MuJoCo) como en el robot físico a través del repositorio `tron1-rl-deploy-python`. El bucle de control corre a 500 Hz y la política a 50 Hz.

La relevancia de esta publicación es práctica: ofrece un conjunto reproducible y abierto (Apache 2.0) de controladores de locomoción para un bípedo comercial, con el código de entrenamiento, simulación y despliegue publicado en GitHub. Es material de referencia para investigadores en robótica con patas y para desarrolladores que quieran validar políticas RL en hardware real sin partir de cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal RL (observación → acción) exportada a ONNX; codificador separado (`encoder.onnx`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX de precisión nativa) |
| Idiomas soportados | en (documentación y model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`policy.onnx` y `encoder.onnx` por variante) |

Especificaciones adicionales del despliegue:

| Parametro | Valor |
|---|---|
| Familias incluidas | Point-foot (`PF_TRON1A`, `PF_TRON1B`, `PF_P441A`, `PF_P441B`, `PF_P441C`, `PF_P441C2`), sole-foot (`SF_TRON1A`, `SF_TRON1B`), wheel-foot (`WF_TRON1A`, `WF_TRON1B`) |
| Articulaciones / acciones | 6 / 6 en point-foot; 8 / 8 en sole-foot y wheel-foot |
| Entornos de entrenamiento | Isaac Gym (`isaacgym`) e Isaac Lab (`isaaclab`) |
| Frecuencia de control | 500 Hz (bucle de control) |
| Frecuencia de política | 50 Hz |
| Runtime de inferencia | ONNX Runtime en CPU |
| Simuladores compatibles | MuJoCo (vía `tron1-mujoco-sim`) |
| Tamaño del repo | 0.0 GB |

## Arquitectura y entrenamiento

Las políticas son redes neuronales entrenadas con aprendizaje por refuerzo en simulación física. Cada variante del robot dispone de dos políticas: una entrenada en Isaac Gym y otra en Isaac Lab, seleccionables mediante la variable `RL_TYPE`. La arquitectura concreta de la red (número de capas, anchura, tipo de observaciones) no se detalla en la model card; solo se especifica que cada política se acompaña de un `encoder.onnx` que forma parte del pipeline de inferencia. El número de parámetros no está disponible.

El entrenamiento se realiza en los repositorios `tron1-rl-isaacgym` y `tron1-rl-isaaclab`, publicados por el mismo autor. La model card no documenta el número de pasos de entrenamiento, la composición de los datos (que en RL procede de la interacción con el simulador), ni si se aplicaron técnicas de ajuste posteriores como RLHF o DPO, algo que no aplica en este dominio. La innovación destacable es la separación entre política y codificador, y la exportación a ONNX para inferencia en CPU a 50 Hz con un bucle de control a 500 Hz, lo que permite ejecutar el controlador en hardware de bajo coste sin GPU.

## Capacidades

- Locomoción bípeda: genera comandos de articulación para caminar, mantenerse en pie y desplazarse en las tres variantes mecánicas del TRON 1.
- Control en tiempo real: inferencia a 50 Hz dentro de un bucle de control a 500 Hz, ejecutable en CPU con ONNX Runtime.
- Compatibilidad con tres morfologías: pie de punta (6 articulaciones), pie de suela (8 articulaciones) y pie con rueda (8 articulaciones).
- Doble procedencia de entrenamiento: políticas entrenadas en Isaac Gym y en Isaac Lab, intercambiables mediante configuración.
- Despliegue en simulación: integración con MuJoCo a través de `tron1-mujoco-sim`, con reseteo del robot y control por joystick.
- Despliegue en robot físico: conexión por IP al robot mediante `main.py`, con arranque en L1 + Y y parada en L1 + X (rigidez cero, solo amortiguación).
- Integración ROS y ROS 2: repositorios de despliegue específicos (`tron1-rl-deploy-ros`, `tron1-rl-deploy-ros2`).
- No incluye: generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni capacidades de agente. Es un controlador de locomoción, no un modelo generativo.

## Casos de uso

- Validación de políticas en simulación: usar MuJoCo y `tron1-mujoco-sim` para reproducir el comportamiento de la política antes de tocar hardware; el robot se levanta y camina en el sitio, y se controla con el joystick incluido. Adecuado por la separación limpia entre simulador y controlador.
- Despliegue en el robot TRON 1 físico: ejecutar `main.py <robot-ip>` para conectar el controlador al robot real, con arranque y parada definidos por combinaciones de botones. Adecuado para pruebas de locomoción en laboratorio con un operador entrenado.
- Investigación en RL para robótica con patas: comparar políticas entrenadas en Isaac Gym frente a Isaac Lab sobre la misma morfología, usando los repositorios de entrenamiento como base para experimentos propios.
- Integración en stacks ROS/ROS 2: incorporar el controlador en un sistema robótico mayor mediante `tron1-rl-deploy-ros` o `tron1-rl-deploy-ros2`, por ejemplo para coordinar locomoción con percepción o planificación.
- Evaluación de morfologías: contrastar el comportamiento de las variantes point-foot, sole-foot y wheel-foot sobre el mismo robot para decidir qué configuración mecánica conviene en un escenario concreto.
- Docencia y prototipado rápido: desplegar un controlador de locomoción bípeda funcional en CPU sin GPU, útil para cursos de robótica o para prototipos que necesiten un baseline de marcha.
- Base para ajuste fino: partir de las políticas publicadas y reentrenar en Isaac Gym o Isaac Lab para adaptarlas a nuevas condiciones (terrenos, cargas, comandos de velocidad).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica; la inferencia se ejecuta en CPU con ONNX Runtime.
- GPU recomendadas: no se requiere GPU para inferencia. El entrenamiento (en los repositorios de Isaac Gym e Isaac Lab) sí requiere GPU compatible con dichos entornos, pero la model card no especifica modelos concretos.
- CPU: Linux x86_64 o aarch64, Python 3. Suficiente para ejecutar el controlador a 50 Hz.
- ¿Cabe en hardware de consumo? Sí, al ejecutarse en CPU; no se especifican requisitos mínimos de CPU ni memoria.
- Opciones de despliegue: ONNX Runtime (inferencia), MuJoCo (simulación), `tron1-rl-deploy-python` (robot físico), `tron1-rl-deploy-ros` y `tron1-rl-deploy-ros2`.
- Latencia y throughput: la política corre a 50 Hz y el bucle de control a 500 Hz; no se publican cifras de latencia por inferencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Morfología | Formato | Licencia | Contexto / parámetros |
|---|---|---|---|---|---|
| TRON 1 RL Locomotion Policies (LimX) | Políticas RL de locomoción | Bípedo TRON 1 (PF, SF, WF) | ONNX | Apache 2.0 | No aplica / no disponible |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de otros conjuntos de políticas de locomoción directamente comparables con especificaciones verificables.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no responde preguntas ni procesa imágenes o audio. Cualquier uso fuera del control de locomoción del TRON 1 no está soportado.
- Específico del hardware: las políticas están entrenadas para las morfologías exactas del TRON 1 (PF, SF, WF) y no son transferibles a otros robots sin reentrenamiento.
- Sin métricas publicadas: no hay benchmarks de rendimiento, tasas de éxito ni comparativas cuantitativas en la model card; la evaluación queda a cargo del usuario.
- Riesgo en hardware real: la model card advierte explícitamente de probar primero en simulación, contar con un operador entrenado y mantener el paro de emergencia al alcance. La parada se realiza en L1 + X con rigidez cero y solo amortiguación.
- Dependencia de calibración: el controlador espera el estado de calibración 0 antes de arrancar; una calibración incorrecta puede impedir el despliegue.
- Idiomas: la documentación está únicamente en inglés.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario debe verificar el cumplimiento de las licencias de las dependencias (Isaac Gym, Isaac Lab, MuJoCo, ONNX Runtime) y de los repositorios asociados.
- Repositorio espejo: los archivos se copian tal cual desde `tron1-rl-deploy-python`, que es la fuente de verdad; pueden existir desfases entre el espejo de Hugging Face y el repositorio original.
- Sin datos de sesgo ni alucinación aplicables: al no ser un modelo generativo, estas categorías no aplican; el riesgo relevante es el fallo de control en el robot físico.

## Enlaces

- Hugging Face: https://huggingface.co/limxdynamics/tron1-rl-locomotion-policies
- Repositorio de despliegue (fuente de verdad): https://github.com/limxdynamics/tron1-rl-deploy-python
- Simulador MuJoCo: https://github.com/limxdynamics/tron1-mujoco-sim
- Descripción del robot (URDF / MJCF): https://github.com/limxdynamics/tron1-robot-description
- Entrenamiento en Isaac Gym: https://github.com/limxdynamics/tron1-rl-isaacgym
- Entrenamiento en Isaac Lab: https://github.com/limxdynamics/tron1-rl-isaaclab
- Despliegue ROS: https://github.com/limxdynamics/tron1-rl-deploy-ros
- Despliegue ROS 2: https://github.com/limxdynamics/tron1-rl-deploy-ros2
- Organización en Hugging Face: https://huggingface.co/limxdynamics
- Organización en GitHub: https://github.com/limxdynamics
- Sitio web: https://www.limxdynamics.com/en
- Contacto comercial: opensource@limxdynamics.com
