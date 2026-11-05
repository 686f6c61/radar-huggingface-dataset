# limxdynamics/oli-rl-policies

## Resumen

`limxdynamics/oli-rl-policies` es un conjunto de políticas de control entrenadas mediante aprendizaje por refuerzo para el robot humanoide de tamano completo LimX Oli (modelo `HU_D04_01`, 31 articulaciones). No es un modelo de lenguaje: es un artefacto de robótica que contiene los controladores de locomoción, imitación de movimiento, postura erguida y amortiguación, exportados en formato ONNX para su ejecución en simulación (MuJoCo) o en el robot físico. Lo publica LimX Dynamics, fabricante del propio robot, y el repositorio de Hugging Face es un espejo del repositorio GitHub `humanoid-rl-deploy-python`, que se declara como fuente de verdad.

El interés práctico del paquete es que proporciona políticas listas para ejecutar con el SDK de bajo nivel de LimX y un mapeo explícito de botones del mando remoto a cada controlador, lo que permite reproducir el comportamiento del robot en simulación antes de desplegarlo en hardware. La licencia Apache 2.0 facilita la inspección, la sustitución del controlador de marcha por uno propio y la integración en pipelines de ROS 1, ROS 2 o C++.

La información publicada no incluye arquitectura de red, número de parámetros, presupuesto de cómputo ni resultados de benchmarks; la model card se limita a describir los ficheros incluidos y el procedimiento de arranque en simulación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (políticas de reinforcement learning exportadas a ONNX; no se detalla la topología de red) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible (los artefactos se distribuyen en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | No aplica; la model card declara `en` para la documentación |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`policy.onnx`, `lin_encoder.onnx`, `priv_encoder.onnx`) y ficheros YAML de parametros (`walk_param.yaml`, `mimic_param.yaml`, `joint_params.yaml`) |

## Arquitectura y entrenamiento

Las políticas se han obtenido mediante aprendizaje por refuerzo, segun indican las etiquetas del repositorio (`reinforcement-learning`, `locomotion`, `motion-imitation`). El controlador de imitación incluye dos codificadores adicionales en ONNX, `lin_encoder.onnx` y `priv_encoder.onnx`, lo que sugiere una separacion entre una representacion observable (lineal) y una representacion privilegiada, patron habitual en políticas entrenadas con informacion privilegiada en simulación y destiladas para despliegue. No se especifica el algoritmo de RL, el simulador de entrenamiento, el numero de pasos de entorno ni la composicion del dataset de movimientos de referencia.

El despliegue se organiza en cuatro controladores: `walk_controller` (marcha, con `policy.onnx` y `walk_param.yaml`), `mimic_controller` (imitación de un gesto de saludo, con `policy.onnx`, `lin_encoder.onnx`, `priv_encoder.onnx` y `mimic_param.yaml`), `stand_controller` y `damping_controller`, estos dos ultimos definidos unicamente por `joint_params.yaml`. El fichero `HU_D04_01/controllers.yaml` enumera los controladores que carga el codigo de despliegue. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atención lineal, que no aplican a este tipo de artefacto.

## Capacidades

- Locomoción bípeda del humanoide LimX Oli `HU_D04_01` de 31 articulaciones mediante el controlador de marcha.
- Imitación de movimiento: reproducción de un gesto de saludo pregrabado a traves del controlador `mimic`.
- Postura erguida estatica mediante `stand_controller`.
- Modo de amortiguación pasiva mediante `damping_controller`, util para transiciones seguras y parada controlada.
- Ejecución en simulación MuJoCo a traves de `humanoid-mujoco-sim`, con el mismo binario de despliegue que en el robot real.
- Control por mando remoto con mapeo documentado: R1 + X para marcha, L1 + B para imitación, L1 + Y para postura y L1 + A para amortiguación.
- Sustitución del controlador de marcha por una política propia, reemplazando `walk_controller/policy/default/policy.onnx`.
- Integración con ROS 1, ROS 2 y C++ mediante los repositorios de despliegue correspondientes.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni capacidades multilingües.

## Casos de uso

- Validación en simulación antes de desplegar en hardware: ejecutar `simulator.py` y `main.py` con `ROBOT_TYPE=HU_D04_01` permite comprobar la marcha y el gesto de saludo en MuJoCo sin riesgo fisico, usando exactamente los mismos ficheros ONNX que se cargaran en el robot.
- Desarrollo de políticas de locomoción propias: el repositorio sirve como linea base funcional y como contrato de interfaz (observaciones, acciones y parametros en YAML) para entrenar y comparar un `policy.onnx` alternativo en el controlador de marcha.
- Demostraciones y presentaciones de producto: el controlador `mimic` reproduce un saludo pregrabado, adecuado para ferias, videos corporativos y visitas de cliente con una secuencia repetible y de bajo riesgo.
- Puesta en marcha y calibración del robot: los controladores `stand` y `damping` permiten llevar al humanoide a una postura estable o a un estado de amortiguación pasiva antes y despues de las pruebas dinamicas.
- Integración en pilas ROS 1 o ROS 2: los repositorios `humanoid-rl-deploy-ros`, `humanoid-rl-deploy-ros2` y `humanoid-rl-deploy-cpp` permiten conectar las políticas a un grafo de nodos existente para experimentacion en laboratorio de robótica.
- Investigación en imitación de movimiento: el par de codificadores `lin_encoder.onnx` y `priv_encoder.onnx` sirve como referencia para estudiar el esquema de representaciones privilegiadas en políticas desplegables.
- Docencia en robótica humanoide: el conjunto simulación + despliegue + mando remoto ofrece un ciclo completo reproducible en Linux x86_64 con dependencias acotadas (`limxsdk-*.whl` y `click`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de recompensa, tasas de exito, velocidad de marcha, consumo energetico ni latencias de inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamano del repositorio es de 0,0 GB, lo que sugiere artefactos ONNX de pocos megabytes, pero no se publica el recuento de parametros ni el peso exacto de los ficheros.
- GPU recomendadas: no disponibles. La model card no menciona requisitos de GPU; las instrucciones de arranque solo exigen Linux x86_64.
- Compatibilidad con GPU de consumo: no confirmada. Al no documentarse el coste computacional, no puede afirmarse que quepa en una RTX 4090 ni en modelos inferiores.
- Opciones de despliegue: `humanoid-rl-deploy-python` (Python, con el SDK `limxsdk`), `humanoid-rl-deploy-ros`, `humanoid-rl-deploy-ros2` y `humanoid-rl-deploy-cpp`, ademas del simulador `humanoid-mujoco-sim`.
- Entorno de ejecución verificado: Linux x86_64 con `humanoid-mujoco-sim` y `humanoid-rl-deploy-python` en la misma carpeta, instalando el wheel `limxsdk-lowlevel/python3/amd64/limxsdk-*.whl` y `click`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Robot / plataforma | Formato | Licencia | Datos publicados |
|---|---|---|---|---|---|
| limxdynamics/oli-rl-policies | Políticas RL de control | LimX Oli `HU_D04_01`, 31 articulaciones | ONNX + YAML | Apache 2.0 | Sin benchmarks |
| Políticas RL de humanoides de otros fabricantes | Políticas RL de control | Plataformas propietarias | No disponible | No disponible | No disponible |
| Políticas RL de cuadrupedos open source | Políticas RL de control | Robots de 12 articulaciones | No disponible | No disponible | No disponible |

No se dispone de datos verificables de modelos comparables en la informacion proporcionada; la comparativa detallada con alternativas concretas queda como no disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo generativo de propósito general: no admite prompts de texto, tool calling ni razonamiento multi-step.
- Las políticas estan entrenadas especificamente para el humanoide LimX Oli `HU_D04_01` de 31 articulaciones; no son transferibles a otras plataformas sin reentrenamiento.
- La model card advierte explicitamente de que estas políticas accionan un robot fisico: hay que probar primero en simulación, operar con un operador entrenado presente y mantener el boton de parada de emergencia al alcance.
- No se documentan sesgos, tasas de alucinacion ni limites de contexto, que no aplican a este tipo de artefacto; el riesgo relevante es el fallo de control en hardware real.
- El conjunto de comportamientos es reducido: marcha, un gesto de saludo, postura erguida y amortiguación. No se documentan habilidades adicionales.
- No se publican metricas de robustez ante terrenos irregulares, empujes externos o cambios de carga.
- El repositorio de Hugging Face es un espejo; cualquier correccion o actualizacion debe buscarse en el repositorio GitHub, que se declara fuente de verdad.
- La licencia Apache 2.0 permite uso comercial, pero la responsabilidad por el despliegue fisico y por el cumplimiento de la normativa de seguridad aplicable recae en el integrador.

## Enlaces

- Hugging Face: https://huggingface.co/limxdynamics/oli-rl-policies
- Repositorio de despliegue en Python (fuente de verdad): https://github.com/limxdynamics/humanoid-rl-deploy-python
- Controladores del robot `HU_D04_01`: https://github.com/limxdynamics/humanoid-rl-deploy-python/tree/main/controllers/HU_D04_01
- Descripcion del robot (URDF / MJCF / USD): https://github.com/limxdynamics/humanoid-description
- Simulador MuJoCo: https://github.com/limxdynamics/humanoid-mujoco-sim
- Despliegue ROS 1: https://github.com/limxdynamics/humanoid-rl-deploy-ros
- Despliegue ROS 2: https://github.com/limxdynamics/humanoid-rl-deploy-ros2
- Despliegue C++: https://github.com/limxdynamics/humanoid-rl-deploy-cpp
- Organizacion en Hugging Face: https://huggingface.co/limxdynamics
- Organizacion en GitHub: https://github.com/limxdynamics
- Sitio web del fabricante: https://www.limxdynamics.com/en
- Contacto comercial: opensource@limxdynamics.com
