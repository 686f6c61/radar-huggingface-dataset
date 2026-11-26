# ethanCSL/openarm_wipeboard_lerobot_real_v01

## Resumen

`ethanCSL/openarm_wipeboard_lerobot_real_v01` es una política robótica entrenada con LeRobot sobre el modelo fundacional GR00T N1.7 de NVIDIA, especializada en una única tarea de manipulación bimanual con un robot OpenArm (tipo `openarm_umeow`). El modelo consume observaciones multimodales (estado propioceptivo de 16 dimensiones y tres cámaras RGB de 480x640) y produce un vector de acción de 16 dimensiones a 30 FPS. Se distribuye como checkpoint de safetensors de 3.144.016.000 parámetros (12,6 GB) bajo licencia Apache 2.0.

La relevancia de esta ficha es doble: por un lado, documenta un caso concreto de fine-tuning de un modelo fundacional VLA (vision-language-action) para una tarea física específica ("pasar el borrador del brazo izquierdo al derecho para limpiar la pizarra"); por otro, sirve como ejemplo reproducible del flujo de trabajo de LeRobot 0.6.2 con la arquitectura GR00T, que combina un backbone Cosmos-Reason2/Qwen3-VL con un transformer de acciones por flow-matching.

El modelo es de nicho: no es un modelo de propósito general ni un chatbot, sino un artefacto de investigación en robótica con 20 episodios de entrenamiento (22.322 frames). Su valor está en la reproducibilidad del pipeline y en la posibilidad de reutilizar el backbone GR00T para otras tareas de manipulación, no en un rendimiento generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone vision-language Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow-matching |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (las instrucciones de tarea son en inglés en el dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `openarm_umeow` (OpenArm bimanual) |
| Cámaras de entrada | `body_cam`, `wrist_cam`, `right_wrist_cam` (3x480x640 RGB) |
| Estado propioceptivo | `observation.state` de shape (16,) |
| Acción de salida | `action` de shape (16,) |
| Frecuencia de control | 30 FPS |
| Librería | LeRobot 0.6.2 |
| Tamaño del repositorio | 12,6 GB |

## Arquitectura y entrenamiento

El modelo se basa en GR00T N1.7, el modelo fundacional abierto de NVIDIA para razonamiento y habilidades de robots humanoides. La arquitectura combina dos componentes: un backbone vision-language (Cosmos-Reason2/Qwen3-VL) que procesa las tres imágenes de cámara junto con la instrucción en lenguaje natural, y un transformer de acciones entrenado con flow-matching que genera las acciones condicionadas por visión, lenguaje y propiocepción. Esta separación permite reutilizar el backbone preentrenado y adaptar solo la cabeza de acciones mediante fine-tuning.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `ethanCSL/openarm_wipeboard_lerobot_real_v01`, compuesto por 20 episodios y 22.322 frames a 30 FPS de una única tarea: pasar el borrador del brazo izquierdo al derecho y limpiar la pizarra. La configuración reportada es de 20.000 pasos, batch size 8, optimizador AdamW con learning rate 1e-4 y semilla 1000. No se documenta el número de tokens de entrenamiento ni si hubo etapas de RLHF o DPO; al tratarse de imitation learning sobre demostraciones, el entrenamiento es de tipo supervisado sobre pares observación-acción.

No se reportan innovaciones técnicas adicionales más allá de las propias de GR00T N1.7 (flow-matching para acciones y backbone VLM). Tampoco se especifica si se congelaron capas del backbone o se hizo fine-tuning completo; el dato de parámetros totales (3.144.016.000) corresponde al checkpoint completo.

## Capacidades

- Manipulación robótica bimanual: genera acciones de 16 dimensiones para un robot OpenArm con dos brazos.
- Control visomotor: integra tres cámaras (cuerpo, muñeca izquierda y muñeca derecha) para localizar objetos y planificar movimientos.
- Seguimiento de instrucciones en lenguaje natural: acepta una descripción textual de la tarea ("Left arm pass eraser to right arm to wipe off the board").
- Condicionamiento por propiocepción: usa el estado de las articulaciones (16 valores) como entrada para acciones consistentes.
- Ejecución a 30 FPS: frecuencia compatible con control reactivo en tiempo real.
- Transferencia de objeto entre brazos: la tarea entrenada implica coordinación entre ambos brazos.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico: es una política de acción, no un modelo de lenguaje conversacional.
- Capacidades multilingües: no documentadas; la instrucción de tarea está en inglés.
- No dispone de modo "thinking", visión general, audio ni otras capacidades fuera del dominio robótico.

## Casos de uso

- Limpieza de pizarras en entornos educativos o corporativos: el modelo ejecuta la secuencia completa de pasar el borrador de un brazo a otro y limpiar la superficie, adecuado para demostraciones de robótica de servicio en aulas o salas de reuniones.
- Investigación en imitation learning: sirve como referencia reproducible para comparar pipelines de LeRobot con GR00T frente a otros métodos (ACT, Diffusion Policy) sobre el mismo dataset de 20 episodios.
- Base para fine-tuning de tareas bimanuales: el checkpoint puede reentrenarse con `lerobot-train --policy.type=groot` sobre nuevos datasets de manipulación con el mismo robot OpenArm, aprovechando el backbone preentrenado.
- Validación de hardware OpenArm: útil para verificar la calibración de cámaras y articulaciones, ya que la política depende de las tres cámaras y del estado de 16 dimensiones.
- Benchmark de despliegue en tiempo real: con 30 FPS de control, permite medir latencia de inferencia de un VLA de 3.144 millones de parámetros en GPUs de consumo o de datacenter.
- Generación de datos sintéticos o aumentados: la política puede ejecutarse en simulación para producir trayectorias de referencia antes de transferirlas al robot real.
- Demostración de coordinación bimanual en ferias o vídeos técnicos: la tarea es visualmente clara y fácil de evaluar por una audiencia no experta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet". No hay tasas de éxito en robot real, ni comparaciones con otras políticas sobre el mismo dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un checkpoint de 3.144 millones de parámetros en FP16 requiere aproximadamente 6,3 GB solo para pesos, más memoria para activaciones del backbone VLM y del transformer de acciones; en FP32 serían unos 12,6 GB. No se documenta cuantización oficial.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una GPU con 16-24 GB (RTX 4090, L4, A10G) sería el mínimo razonable para FP16; A100 o H100 para entrenamiento o lotes mayores.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) y posiblemente en RTX 4080 (16 GB) en FP16, aunque no está verificado por el autor.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) es el método documentado. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas de acción robótica.
- Latencia y throughput: no disponibles. El control opera a 30 FPS, lo que implica un presupuesto de 33 ms por paso de inferencia, pero no se reporta si se cumple en hardware concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ethanCSL/openarm_wipeboard_lerobot_real_v01` (GR00T N1.7 fine-tuned) | 3.144.016.000 | no disponible | Manipulación bimanual OpenArm (limpiar pizarra) | Apache 2.0 | Hugging Face, 0 descargas |
| GR00T N1.7 base (NVIDIA) | no disponible en la información | no disponible | Modelo fundacional VLA para humanoides | no disponible en la información | GitHub NVIDIA/Isaac-GR00T |
| Políticas ACT / Diffusion Policy en LeRobot | típicamente decenas de millones | no aplica | Imitation learning por tarea | Apache 2.0 (LeRobot) | Hugging Face, LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada. La comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: entrenado solo para la tarea "pasar el borrador y limpiar la pizarra"; no generaliza a otras tareas sin reentrenamiento.
- Dataset muy pequeño: 20 episodios y 22.322 frames, lo que aumenta el riesgo de sobreajuste y de baja robustez ante cambios de iluminación, posición de objetos o disposición de cámaras.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que se desconoce su fiabilidad en producción.
- Dependencia de hardware específico: requiere un robot `openarm_umeow` con tres cámaras en posiciones concretas (`body_cam`, `wrist_cam`, `right_wrist_cam`) y estado de 16 dimensiones; no es portable a otros robots sin adaptación.
- Riesgo de alucinación de acciones: como política de flow-matching, puede generar trayectorias plausibles pero incorrectas si la observación se sale de la distribución de entrenamiento.
- Sesgos: no documentados, pero el dataset refleja una única configuración física y un único operador; puede heredar sesgos de las demostraciones.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base GR00T N1.7 y el backbone Qwen3-VL pueden tener condiciones adicionales que conviene verificar antes de un despliegue comercial.
- Idiomas: la instrucción de tarea está en inglés; no se documenta soporte multilingüe.
- Sin cuantizaciones oficiales: el despliegue en hardware limitado requiere cuantización manual no validada por el autor.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/ethanCSL/openarm_wipeboard_lerobot_real_v01
- Dataset de entrenamiento: https://huggingface.co/datasets/ethanCSL/openarm_wipeboard_lerobot_real_v01
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ethanCSL/openarm_wipeboard_lerobot_real_v01
- Repositorio GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de rollout e inferencia: https://huggingface.co/docs/lerobot/main/en/inference
