# OpenRAL/rskill-smolvla-franka_panda-maniskill3-bf16

## Resumen

`rskill-smolvla-franka_panda-maniskill3-bf16` es un paquete de habilidad robótica (rSkill) publicado por OpenRAL que envuelve un fine-tuning de SmolVLA, un modelo visión-lenguaje-acción (VLA) de aproximadamente 450 millones de parámetros desarrollado originalmente por Hugging Face. El fine-tuning se ha realizado sobre el conjunto de datos `Calvert0921/SmolVLA_LiftCube_Franka_1000`, compuesto por 1000 demostraciones de un brazo Franka Panda recogiendo y elevando un cubo en el simulador ManiSkill3 (SAPIEN). El paquete no contiene pesos propios: es un manifiesto `rskill.yaml` que referencia los pesos alojados en `Calvert0921/smolvla_franka_liftcube_1000` y añade comprobación de capacidades, licencia, presupuestos de latencia y registro local.

El modelo resuelve la tarea concreta de manipulación pick-and-lift sobre una mesa con un único cubo, consumiendo dos vistas RGB (cámara cenital y de muñeca) a 256×256 y un estado propioceptivo de 9 dimensiones (qpos del Franka: 7 articulaciones del brazo más 2 de los dedos). Emite chunks de acción de longitud 50 con comandos de posición articular de 8 dimensiones (7 del brazo más 1 del gripper). Su relevancia actual radica en que ejemplifica el patrón de distribución de políticas VLA pequeñas empaquetadas como artefactos instalables dentro de un framework de agentes robóticos, con contratos de observación y acción explícitos.

Es importante señalar una limitación estructural documentada por el propio autor: el checkpoint se entrenó en la tarea LiftCube, pero las únicas escenas de Franka Panda disponibles en el repositorio OpenRAL son variantes de PickCube-v1, cuya condición de éxito exige que el cubo alcance una posición objetivo. La política carga y actúa en esas escenas, pero no puede satisfacer el criterio de éxito, por lo que la puerta `evaluated_tasks` bloquea el emparejamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA); backbone SmolVLM2-500M-Video-Instruct con encoder de visión congelado y cabeza de acción por flow-matching |
| Parametros totales | ~450 M (0,45 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (único dtype declarado en el manifiesto) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (pesos referenciados vía `hf://Calvert0921/smolvla_franka_liftcube_1000`; el paquete no copia pesos) |

## Arquitectura y entrenamiento

El modelo es un VLA construido sobre el backbone SmolVLM2-500M-Video-Instruct, con el encoder de visión congelado. La cabeza de acción emplea flow-matching con 10 pasos de denoising por chunk, y genera chunks de 50 acciones. La entrada combina dos vistas RGB de 256×256 (`observation.images.up` y `observation.images.wrist`, aliasadas desde `camera1` y `camera2`), un vector de estado propioceptivo de 9 dimensiones (`observation.state`, correspondiente a `agent.qpos` del Franka: 7 articulaciones del brazo más 2 de los dedos) y una instrucción en lenguaje natural libre (`task`, como lista de cadenas).

El fine-tuning se realizó sobre 1000 demostraciones de Franka LiftCube recogidas en ManiSkill3 SAPIEN con un Franka configurado en `pd_joint_pos`, de ahí que el modelo emita comandos de posición articular de 8 dimensiones (7 del brazo más 1 del gripper). El repositorio upstream del fine-tuning no incluye fichero LICENSE ni model card; la licencia apache-2.0 se hereda del modelo base y así se documenta explícitamente en el manifiesto. Tampoco se distribuye el fichero `policy_*processor.json`, por lo que los procesadores del manifiesto apuntan a copias alojadas en el repositorio de OpenRAL.

## Capacidades

- Manipulación robótica pick-and-lift: recoge y eleva un único cubo sobre una mesa con un brazo Franka Panda en el simulador ManiSkill3 SAPIEN.
- Acciones declaradas en el manifiesto: `pick` y `grasp`; objeto: `cube`; escena: `tabletop`.
- Control visuomotor a partir de dos vistas RGB (cenital y de muñeca) más estado propioceptivo de 9 dimensiones.
- Generación de chunks de acción de 50 pasos con comandos de posición articular de 8 dimensiones.
- Condicionamiento por instrucción en lenguaje natural (campo `task` como lista de cadenas).
- Integración con el framework de agentes robóticos OpenRAL mediante manifiesto `rskill.yaml` con comprobación de capacidades, licencia y presupuestos de latencia.
- No dispone de tool calling, function calling, razonamiento multi-paso genérico, visión generalista, audio ni modo de pensamiento; su alcance es estrictamente la política visuomotora entrenada.

## Casos de uso

- Evaluación de políticas VLA en simulación: sirve como referencia para medir el comportamiento de un SmolVLA fine-tuneado sobre un dataset propio dentro de ManiSkill3, con contrato de observación y acción explícito que facilita la reproducibilidad.
- Prototipado de pipelines de manipulación pick-and-lift: permite montar rápidamente un bucle cerrado cámara-estado-acción sobre un Franka simulado, con chunks de 50 acciones que reducen la frecuencia de inferencia.
- Desarrollo y depuración de integraciones con OpenRAL: el paquete actúa como artefacto de prueba para validar la instalación de rSkills, la resolución de procesadores y la comprobación de capacidades del framework.
- Base para fine-tuning adicional: al estar bajo apache-2.0 y derivar de `lerobot/smolvla_base`, puede reentrenarse sobre datasets propios de Franka o de otros embodiments para adaptar la política a nuevas tareas.
- Investigación en flow-matching para acción: su cabeza de acción con 10 pasos de denoising por chunk permite estudiar el compromiso entre calidad de trayectoria y coste computacional en políticas pequeñas.
- Generación de datos sintéticos y aumento de dataset: la política puede ejecutarse en SAPIEN para producir rollouts adicionales que alimenten conjuntos de demostraciones de manipulación.
- Validación de presupuestos de latencia: el manifiesto declara un presupuesto de 200 ms por chunk, útil como caso de prueba para medir el rendimiento real de inferencia bf16 en el hardware objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de tasa de éxito, y el propio autor documenta que la política no satisface el criterio de éxito de PickCube-v1, la única escena de Franka Panda disponible en el repositorio. El único dato de rendimiento declarado es un presupuesto de latencia de 200 ms por chunk en el manifiesto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el campo `min_vram_gb` del manifiesto está a `null`. Con ~450 M de parámetros en bf16, el peso de los pesos ronda los 0,9 GB, a lo que hay que sumar el backbone de visión y las activaciones, no cuantificadas en la documentación.
- GPU recomendadas: no disponible. Por tamaño, el modelo es apto para GPUs de consumo, pero no se especifica ningún modelo concreto en la información.
- Cabe en GPU de consumo: previsiblemente sí por volumen de parámetros, aunque no hay confirmación oficial ni cifras de memoria medidas.
- Opciones de despliegue: runtime `pytorch` con dtype `bf16`, cargado a través del loader de OpenRAL (`openral_rskill.loader.rSkill`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI; la librería declarada es `lerobot`.
- Latencia y throughput: presupuesto declarado de 200 ms por chunk de 50 acciones; no se publican mediciones reales de latencia ni de throughput.
- Requisitos adicionales: simulador ManiSkill3 con SAPIEN y visor en vivo para la ejecución sobre escena; dos cámaras RGB a 256×256 y estado qpos de 9 dimensiones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rskill-smolvla-franka_panda-maniskill3-bf16 | ~450 M | no disponible | Pick-and-lift de cubo, Franka Panda, ManiSkill3 | apache-2.0 | Hugging Face (manifiesto; pesos en repo upstream) |
| lerobot/smolvla_base | ~450 M | no disponible | VLA base, multi-embodiment | no disponible en la información | Hugging Face |
| Calvert0921/smolvla_franka_liftcube_1000 | ~450 M | no disponible | LiftCube, Franka, ManiSkill3 | no disponible (sin LICENSE ni model card) | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes; la comparación se limita a linaje, licencia y empaquetado.

## Limitaciones y advertencias

- Brecha LiftCube/PickCube: el checkpoint se entrenó en LiftCube, pero las únicas escenas de Franka Panda del repositorio son variantes de PickCube-v1, cuyo éxito exige alcanzar una posición objetivo. La política carga y actúa, pero no supera la comprobación de éxito, y la puerta `evaluated_tasks` bloquea el emparejamiento.
- Alcance muy restringido: una sola tarea (pick-and-lift), un solo objeto (cubo) y una sola escena (tabletop); no generaliza a otras tareas de manipulación sin reentrenamiento.
- Idioma: solo inglés (`en`); las instrucciones en lenguaje natural deben formularse en ese idioma.
- Licencia del upstream: el fine-tuning original no incluye LICENSE ni model card; la apache-2.0 se hereda del modelo base y se documenta como suposición, lo que introduce incertidumbre jurídica para uso comercial.
- Procesadores no incluidos en el repo upstream: el manifiesto apunta a copias alojadas en el repositorio de OpenRAL, lo que crea una dependencia externa para la inferencia correcta.
- Sin pesos en el paquete: el rSkill no copia los pesos; requiere acceso al repositorio `Calvert0921/smolvla_franka_liftcube_1000` en Hugging Face.
- Solo simulación: no hay evidencia de transferencia a un Franka físico ni de robustez ante variaciones de iluminación, calibración de cámaras o dinámica real.
- Sin métricas publicadas: no hay tasas de éxito ni benchmarks que permitan estimar la fiabilidad de la política.
- Riesgo de alucinación y sesgos: no evaluados ni documentados en la información disponible; al tratarse de una política visuomotora, el riesgo relevante es la ejecución de trayectorias erróneas, no la generación de texto.
- Uso comercial: permitido según el manifiesto (`is_commercial_use_allowed: true`), sujeto a la incertidumbre de licencia del upstream mencionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenRAL/rskill-smolvla-franka_panda-maniskill3-bf16
- Repositorio del fine-tuning upstream: https://huggingface.co/Calvert0921/smolvla_franka_liftcube_1000
- Dataset de entrenamiento: https://huggingface.co/datasets/Calvert0921/SmolVLA_LiftCube_Franka_1000
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://arxiv.org/abs/2506.01844
- Repositorio OpenRAL: https://github.com/OpenRAL/openral
- rSkill en el repositorio OpenRAL: https://github.com/OpenRAL/openral/tree/master/rskills/smolvla-maniskill-franka/
