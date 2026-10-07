# maximilianofir/so101-balanced1000-abs-gripper-n17-50k-20261005

## Resumen
El modelo so101-balanced1000-abs-gripper-n17-50k-20261005 es un ajuste fino del modelo fundacional de robótica NVIDIA GR00T-N1.7-3B, desarrollado por el usuario maximilianofir. Se trata de un modelo de 3.144 millones de parámetros (3.144.016.000) especializado en el control del brazo robótico SO101 con una configuración concreta: acciones de brazo relativas y acciones de gripper absolutas, manteniendo las observaciones en términos absolutos. Se distribuye a través de la librería LeRobot y está orientado a pipelines de robótica, en particular a tareas de manipulación en un entorno de estantería izquierda (left rack).

El problema que resuelve es la necesidad de controladores específicos para robots de bajo coste como el SO101 en tareas de pick-and-place y manipulación. Al partir de un modelo fundacional como GR00T, aprovecha el conocimiento previo para aprender una tarea concreta con un conjunto de datos relativamente pequeño: 900 episodios de entrenamiento y 100 de validación. Es relevante ahora porque demuestra la viabilidad de ajustar modelos fundacionales de robótica para robots y tareas específicas, facilitando la adopción de la IA en robótica open source.

El entrenamiento se extendió durante 50.000 actualizaciones, seleccionando el mejor checkpoint en la actualización 45.000 según la pérdida de validación de este brazo. No se especifican la licencia ni los idiomas soportados, y no se han publicado resultados de benchmarks en la información disponible.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: NVIDIA GR00T-N1.7-3B) |
| Parámetros totales | 3.144.016.000 (3,14B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | nvidia/GR00T-N1.7-3B |
| Dataset de entrenamiento | maximilianofir/so101-left-rack-balanced-1000-dr-speed05-1-20261005 |
| Librería | lerobot |
| Pipeline | robotics |
| Tamaño del repositorio | 12,6 GB |
| Episodios de entrenamiento | 900 |
| Episodios de validación | 100 (25 por ocupación inicial) |
| Actualizaciones de entrenamiento | 50.000 (mejor checkpoint en 45.000) |
| Tipo de acciones | Brazos relativos, gripper absoluto |
| Observaciones | Absolutas |

## Arquitectura y entrenamiento
El modelo se basa en la arquitectura de NVIDIA GR00T-N1.7-3B, un modelo fundacional para robótica. No se proporcionan detalles específicos sobre la arquitectura interna (número de capas, mecanismos de atención, etc.) en la información disponible. El ajuste fino se realizó sobre el dataset so101-left-rack-balanced-1000-dr-speed05-1-20261005, que contiene 900 episodios de entrenamiento y 100 de validación, con 25 episodios de validación por cada ocupación inicial. El entrenamiento se extendió durante 50.000 actualizaciones, seleccionando el checkpoint de la actualización 45.000 como el mejor según la pérdida de validación de este brazo.

Una innovación destacable es el uso de acciones relativas para los brazos y acciones absolutas para el gripper, manteniendo las observaciones en términos absolutos. El procesador nativo de GR00T se encarga de la conversión de acciones. Además, el modelo se seleccionó utilizando la pérdida de validación de este brazo específico, no una comparación cruzada entre brazos. El benchmark de rollout de 100 izquierdas se reutiliza y emplea la física actual de RC, no un conjunto de confirmación fresco.

## Capacidades
- Control del brazo robótico SO101 con gripper.
- Generación de acciones de brazo relativas y acciones de gripper absolutas.
- Procesamiento de observaciones absolutas del entorno.
- Entrenado para tareas de manipulación en un entorno de estantería izquierda (left rack).
- No soporta generación de texto, razonamiento, código, matemáticas ni visión general.
- No soporta tool calling ni function calling.
- No está diseñado para agentes multi-step reasoning.
- Capacidades multilingües: no aplica.
- Capacidades especiales: control de robot, no dispone de modo thinking, visión o audio más allá de lo necesario para la tarea.

## Casos de uso
- Automatización de pick-and-place en almacenes: el modelo puede controlar un brazo SO101 para recoger objetos de una estantería izquierda y colocarlos en otra ubicación. Es adecuado porque está entrenado específicamente en ese entorno y con acciones de gripper absolutas que facilitan la precisión.
- Manipulación en líneas de montaje: integrado en una célula de fabricación, el modelo puede realizar tareas repetitivas de ensamblaje o clasificación de piezas. Su entrenamiento con 900 episodios permite adaptarse a variaciones moderadas.
- Investigación en robótica: sirve como punto de partida para experimentos de aprendizaje por imitación o ajuste fino con nuevos objetos. La librería LeRobot facilita la integración y el entrenamiento continuo.
- Recolección de objetos en estanterías: el modelo está especializado en un rack izquierdo, por lo que puede usarse en aplicaciones de logística donde los objetos se almacenan en estanterías.
- Tareas de clasificación de objetos: con un gripper absoluto, puede clasificar objetos por tamaño o forma en un flujo de trabajo automatizado.
- Control de robot en entornos educativos: al ser un modelo open source (aunque sin licencia especificada), puede utilizarse en universidades para enseñar técnicas de VLA (vision-language-action).
- Prototipado rápido de aplicaciones robóticas: al estar basado en GR00T, permite a desarrolladores sin grandes recursos crear controladores para el SO101 con un dataset modesto.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card menciona un benchmark de rollout de 100 izquierdas, pero se indica que se reutiliza y emplea la física actual de RC, no un conjunto de confirmación fresco, y no se proporcionan cifras.

## Requisitos de hardware
- VRAM estimada para inferencia: el modelo tiene 3.144 millones de parámetros. En precisión FP16, los pesos ocupan aproximadamente 6,3 GB; en FP32, unos 12,6 GB. Se recomienda al menos 8 GB de VRAM para FP16 y 16 GB para FP32, considerando activaciones y overhead.
- GPU recomendadas: no se especifican oficialmente. Para FP16, una NVIDIA RTX 3070/3080 (8-10 GB) o superior; para FP32, una RTX 3090/4090 (24 GB) o GPUs de datacenter como A100 o H100. Para entornos robóticos embebidos, una NVIDIA Jetson Orin (16-32 GB) podría ser adecuada, aunque no está confirmado.
- ¿Cabe en consumer GPU? Sí, en FP16 cabe en GPUs consumer con 8 GB o más, como RTX 3060 Ti, 3070, 3080, 4070, etc. En FP32 requiere al menos 16 GB, como RTX 4080/4090.
- Opciones de despliegue: la librería principal es LeRobot (library_name: lerobot). No se especifican otras opciones como vLLM, llama.cpp, Ollama o TGI, que están orientadas a modelos de lenguaje y no aplican directamente a este modelo de robótica. Es posible que se pueda exportar a ONNX o TensorRT, pero no está documentado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
No se dispone de información sobre modelos comparables en la información proporcionada. El modelo es un ajuste fino de nvidia/GR00T-N1.7-3B, por lo que una comparación directa sería con su modelo base, pero no se proporcionan métricas de rendimiento para ninguno de los dos. Otros ajustes finos para SO101 podrían existir, pero no se han encontrado en la búsqueda web.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| so101-balanced1000-abs-gripper-n17-50k-20261005 | 3,14B | no disponible | no disponible | HuggingFace |
| nvidia/GR00T-N1.7-3B | 3B (según nombre) | no disponible | no disponible | HuggingFace |

## Limitaciones y advertencias
- Licencia no disponible: no se puede confirmar si se permite uso comercial. Es responsabilidad del usuario verificar la licencia del modelo base y del ajuste.
- Modelo especializado: entrenado para el robot SO101 en una configuración específica (rack izquierdo, gripper absoluto, acciones de brazo relativas). No generaliza a otros robots, configuraciones de gripper o entornos sin un ajuste fino adicional.
- Riesgo de alucinación: en robótica, el modelo puede generar acciones incorrectas o inseguras, especialmente ante objetos o situaciones no vistas durante el entrenamiento. No hay garantías de seguridad.
- Limitaciones de contexto: no aplica contexto textual. El modelo no procesa lenguaje natural ni instrucciones verbales, solo observaciones y acciones.
- Idiomas: no aplica.
- Caveat importante: el benchmark de rollout de 100 izquierdas se reutiliza y emplea la física actual de RC, no un conjunto de confirmación fresco. Los datos de validación son limitados (100 episodios) y la selección del modelo se basó en la pérdida de validación de este brazo, no en una comparación cruzada.
- Sesgos: el dataset de entrenamiento puede contener sesgos hacia las condiciones específicas de recogida (iluminación, posiciones, tipos de objetos). El rendimiento puede degradarse en condiciones diferentes.
- No se especifican requisitos de hardware ni latencia, lo que dificulta la planificación de despliegues en producción.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/maximilianofir/so101-balanced1000-abs-gripper-n17-50k-20261005
- Dataset de entrenamiento: https://huggingface.co/datasets/maximilianofir/so101-balanced-gripper-ab-50k-20261005
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
