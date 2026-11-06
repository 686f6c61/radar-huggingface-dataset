# limxdynamics/tron2-rl-locomotion-policies

## Resumen

TRON 2 RL Locomotion Policies es un conjunto de políticas de locomoción entrenadas con aprendizaje por refuerzo para el robot bípedo LimX TRON 2, distribuidas por LimX Dynamics en formato ONNX. No se trata de un modelo de lenguaje, sino de controladores neuronales de locomoción: cada política mapea observaciones de propiocepción y comandos de velocidad a acciones articulares, y se ejecuta en CPU mediante ONNX Runtime tanto en simulación MuJoCo como en el robot real.

El paquete cubre tres morfologías del TRON 2: el bípedo de pie macizo (`SF_TRON2A`), el bípedo con ruedas en los pies (`WF_TRON2A`) y el bípedo de pie macizo con dos brazos (`DASF_TRON2A`, gestionado mediante el Centaur SDK). Cada variante incluye una red de política (`policy.onnx`), un codificador de historial (`encoder.onnx`) y un fichero `params.yaml` con el orden de articulaciones, la frecuencia de bucle, las ganancias PD, el escalado de acciones y los límites de comando.

Su relevancia es práctica: permite reproducir en simulación el comportamiento de locomoción del TRON 2 y desplegarlo en hardware real con un stack Python abierto, sin necesidad de GPU. Los pesos se sincronizan tal cual desde el repositorio `tron2_rl_deploy_python`, que es la fuente de verdad, y el entrenamiento se realiza con PPO sobre Isaac Lab (repositorio `TRON2_YG_LAB`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes neuronales de política para control de locomoción (aprendizaje por refuerzo, PPO); arquitectura interna exacta no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX para ejecución en CPU con ONNX Runtime) |
| Idiomas soportados | en, zh (documentación y model card) |
| Licencia | other / see-source-repository; el código de despliegue es Apache 2.0, los pesos se rigen por THIRD_PARTY_NOTICES.md y MODEL_CARD.md del repositorio fuente |
| Formato de pesos | ONNX (`policy.onnx`, `encoder.onnx`) más `params.yaml` |
| Variantes incluidas | `SF_TRON2A` (bípedo de pie macizo, 10 articulaciones / 10 acciones), `WF_TRON2A` (bípedo con ruedas, 10 / 10), `DASF_TRON2A` (bípedo con dos brazos vía Centaur SDK, 26 articulaciones / 20 acciones) |
| Pipeline | robotics |
| Librería declarada | limx-dynamics |
| Tamaño del repositorio | 0.0 GB (según Hugging Face) |

## Arquitectura y entrenamiento

Cada variante se compone de dos redes ONNX: una política que produce las acciones articulares a partir de las observaciones y los comandos de velocidad, y un codificador de historial que resume observaciones pasadas, un patrón habitual en políticas de locomoción con memoria para estimar el estado del terreno y las perturbaciones. El fichero `params.yaml` define el contrato de despliegue: orden de articulaciones, frecuencia del bucle de control, ganancias PD, escalado de acciones y límites de los comandos.

El entrenamiento se realiza con PPO sobre Isaac Lab, según el repositorio `TRON2_YG_LAB` de LimX Dynamics, que soporta dos configuraciones base del robot. No se especifican en la información disponible el número de tokens, la composición del dataset ni detalles de curriculum o domain randomization. La inferencia se ejecuta en CPU con ONNX Runtime, sin requisitos de GPU.

## Capacidades

- Locomoción bípeda con pies macizos (`SF_TRON2A`): marcha controlada por comandos de velocidad lineal y angular.
- Locomoción con pies de rueda (`WF_TRON2A`): desplazamiento sobre ruedas con la misma interfaz de comandos.
- Locomoción de bípedo con dos brazos (`DASF_TRON2A`): control de 20 acciones sobre 26 articulaciones, gestionado mediante el Centaur SDK.
- Memoria a corto plazo mediante codificador de historial de observaciones.
- Control por gamepad: L1 + B para ponerse de pie, L1 + Y para caminar, stick izquierdo para desplazamiento y stick derecho para giro.
- Ejecución en simulación MuJoCo (`tron2_mujoco_sim`) y en robot real mediante `limxsdk`.
- Modo `--dry-run` (SF / WF) para imprimir comandos articulares sin enviarlos al robot.
- No incluye generación de texto, razonamiento, código, visión ni tool calling: es un controlador de locomoción.

## Casos de uso

- Puesta en marcha de un TRON 2 en simulación: arrancar `tron2_mujoco_sim` con `ROBOT_TYPE=SF_TRON2A` y validar la política antes de tocar hardware, reduciendo el riesgo en las primeras pruebas.
- Despliegue en robot real: ejecutar `python3 main.py <robot-ip>` con `limxsdk` para enviar comandos articulares al TRON 2, usando `--dry-run` para verificar la secuencia de comandos sin actuación.
- Validación de la cadena de control: comprobar en banco el orden de articulaciones, las ganancias PD y los límites de comando definidos en `params.yaml` antes de integrar nuevos periféricos.
- Investigación en locomoción con RL: usar las políticas como línea base frente a políticas propias entrenadas con `TRON2_YG_LAB` sobre Isaac Lab, comparando comportamiento en las mismas condiciones de simulación.
- Docencia y demostraciones: reproducir marcha bípeda y con ruedas en MuJoCo con hardware de consumo, ya que la inferencia corre en CPU con ONNX Runtime.
- Integración en pipelines de teleoperación: conectar el control por gamepad (stick izquierdo y derecho) a una capa de teleoperación para tareas de inspección o logística en interiores.
- Evaluación de la variante con brazos: emplear `DASF_TRON2A` a través del Centaur SDK para estudiar el control coordinado de locomoción y extremidades superiores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU con ONNX Runtime; no se requiere GPU para ejecutar las políticas.
- Dependencias de software: `numpy`, `scipy`, `pyyaml`, `onnxruntime`, `pygame` y `limxsdk` (rueda `limxsdk-lowlevel/python3/amd64/limxsdk-*.whl`).
- Para simulación: `tron2_mujoco_sim` con `uv` (`ROBOT_TYPE=SF_TRON2A uv run simulator.py`).
- Para entrenamiento (no incluido en este repositorio): stack `TRON2_YG_LAB` basado en Isaac Lab, que requiere GPU; modelo concreto no disponible en la información proporcionada.
- VRAM estimada, latencia y throughput: no disponibles.
- Opciones de despliegue: ONNX Runtime en CPU, simulación MuJoCo y robot real vía `limxsdk`; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas de locomoción comparables con datos de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código y no soporta tool calling ni agentes.
- Específico del hardware LimX TRON 2 en sus variantes `SF_TRON2A`, `WF_TRON2A` y `DASF_TRON2A`; no es transferible a otras plataformas sin reentrenamiento.
- Los pesos se distribuyen con licencia `other` / `see-source-repository`; el uso comercial y la redistribución están sujetos a `THIRD_PARTY_NOTICES.md` y `MODEL_CARD.md` del repositorio fuente, no a Apache 2.0 (que cubre solo el código de despliegue).
- El repositorio de Hugging Face es un espejo: la fuente de verdad es GitHub, por lo que pueden aparecer desincronizaciones.
- Riesgo operativo en robot real: el autor exige probar primero en simulación, colgar el robot en la primera puesta en marcha, contar con un operador formado y mantener el paro de emergencia al alcance.
- No se documentan sesgos, tasas de alucinación ni limitaciones de idioma aplicables, al no tratarse de un modelo generativo.
- No se dispone de información sobre robustez ante terrenos no vistos, perturbaciones externas o fallos de sensores.

## Enlaces

- Hugging Face: https://huggingface.co/limxdynamics/tron2-rl-locomotion-policies
- ModelScope (espejo para China): https://www.modelscope.cn/models/LimXDynamics/tron2-rl-locomotion-policies
- Repositorio de despliegue: https://github.com/limxdynamics/tron2_rl_deploy_python
- Avisos de terceros (licencia de pesos): https://github.com/limxdynamics/tron2_rl_deploy_python/blob/master/THIRD_PARTY_NOTICES.md
- Model card en el repositorio fuente: https://github.com/limxdynamics/tron2_rl_deploy_python/blob/master/MODEL_CARD.md
- Directorio de controladores: https://github.com/limxdynamics/tron2_rl_deploy_python/tree/master/controllers/model
- Simulador MuJoCo: https://github.com/limxdynamics/tron2_mujoco_sim
- Stack de entrenamiento RL (Isaac Lab, PPO): https://github.com/limxdynamics/TRON2_YG_LAB
- Organización en Hugging Face: https://huggingface.co/limxdynamics
- GitHub de LimX Dynamics: https://github.com/limxdynamics
- Sitio web: https://www.limxdynamics.com/en
- Contacto: opensource@limxdynamics.com
