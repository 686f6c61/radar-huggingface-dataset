# kiroaiseoul/act_task06_new_3_recovery_14D

## Resumen

`kiroaiseoul/act_task06_new_3_recovery_14D` es un checkpoint de política robótica basado en ACT (Action Chunking with Transformers), publicado por el usuario de HuggingFace kiroaiseoul y entrenado con LeRobot. No es un modelo de lenguaje: implementa aprendizaje por imitación para manipulación robótica y predice fragmentos de acciones —chunks— a partir de observaciones, en lugar de pasos individuales. El repositorio contiene 51.687.056 parámetros en safetensors y ocupa 0,2 GB.

El modelo se asocia al dataset `kiroaiseoul/task06_new_3_recovery_14D` y está etiquetado con pipeline `robotics`, licencia Apache-2.0 y librería `lerobot`. La model card no describe la tarea concreta, el robot objetivo, el número de episodios ni el protocolo de evaluación; el ejemplo de evaluación usa un `so100_follower`, pero no se confirma que sea el hardware de entrenamiento.

Su relevancia es práctica para laboratorios que reproducen flujos de imitación con hardware de bajo coste: permite entrenar, evaluar y desplegar una política ACT con el ecosistema LeRobot. Al ser un checkpoint específico de tarea, su utilidad fuera del dataset o del montaje experimental es limitada y requiere validación propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación para robótica |
| Parámetros totales | 51.687.056 |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible / no aplica: no es un modelo de lenguaje y no se documenta el horizonte de acciones |
| Tipos de cuantización | No disponible; no se documentan variantes cuantizadas. El repositorio contiene safetensors |
| Idiomas soportados | No disponible / no aplica: no procesa lenguaje natural |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repositorio LeRobot de 0,2 GB) |
| Pipeline | robotics |
| Librería | lerobot |
| Dataset de entrenamiento | kiroaiseoul/task06_new_3_recovery_14D |
| Tamaño del repositorio | 0,2 GB |
| Tipo de modelo | Política robótica específica de tarea, no modelo generativo de texto |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. En su formulación original combina un encoder visual de tipo ResNet con un transformer encoder-decoder y una variable latente de tipo CVAE para modelar la variabilidad de las demostraciones; predice un chunk de acciones futuras en lugar de una sola acción, lo que reduce el error acumulado y suaviza la ejecución. El checkpoint sigue la implementación de LeRobot, pero la model card no detalla el backbone visual, el número de cámaras, el tamaño del chunk, la frecuencia de control ni la dimensionalidad de las acciones.

El entrenamiento es supervisado a partir de teleoperación, usando el dataset `kiroaiseoul/task06_new_3_recovery_14D`. No se indica el número de episodios, el número de transiciones, la composición del dataset, los aumentos de datos, las semillas ni si se aplicó RLHF/DPO; en ACT el paradigma habitual es la imitación supervisada, no el ajuste por refuerzo. Tampoco se documenta una fase de RL, destilación o decodificación especulativa. El sufijo `14D` del nombre no se explica en la información disponible.

## Capacidades

- Manipulación robótica por imitación: genera secuencias cortas de acciones continuas para ejecutar una tarea entrenada.
- Action chunking: predice varios pasos de acción por inferencia, lo que puede reducir el error de compounding y mejorar la suavidad; el tamaño del chunk no se documenta.
- Integración con LeRobot: se puede cargar con `lerobot-record` y `--policy.path`, y entrenar con `lerobot-train`.
- Evaluación en robot tipo SO-100: el ejemplo de la model card usa `so100_follower`, aunque no se confirma que sea el robot de entrenamiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, visión-lenguaje, audio ni modos thinking.
- No tiene capacidades multilingües ni procesamiento de lenguaje natural.
- No se documentan capacidades de visión general, VQA, OCR ni segmentación; las observaciones visuales, si existen, se usan solo como entrada de la política.
- No se documenta generalización a objetos, posiciones o tareas no vistas.

## Casos de uso

- Automatización de una tarea de manipulación en laboratorio: desplegar el checkpoint en un SO-100 con LeRobot para ejecutar la política entrenada; el ejemplo oficial de evaluación usa `so100_follower`. Es adecuado porque el repositorio ya está en formato LeRobot y evita reimplementar el pipeline.
- Recogida de datos de evaluación: ejecutar `lerobot-record` con `--policy.path` y `--episodes=10` para grabar episodios y calcular la tasa de éxito. Útil para validar el checkpoint antes de integrarlo en un sistema mayor.
- Investigación en action chunking: comparar el comportamiento de ACT frente a políticas que predicen una acción por paso, midiendo suavidad, latencia y errores acumulados. El checkpoint sirve como base reproducible.
- Prototipado de imitación con hardware de bajo coste: usar el flujo de LeRobot y un brazo asequible para probar el ciclo teleoperación-entrenamiento-evaluación. El tamaño de 51,7 millones de parámetros facilita iterar en una GPU de consumo.
- Docencia y reproducción de experimentos: entrenar desde cero con `lerobot-train` y comparar con este checkpoint; útil para cursos de robótica o aprendizaje por imitación.
- Evaluación de recuperación ante perturbaciones: si el dataset `recovery` contiene episodios de recuperación, el checkpoint puede usarse para medir la capacidad de reanudar la tarea tras fallos; la model card no lo detalla, así que requiere validación.
- Integración en un pipeline de control supervisado: cargar la política en un nodo de control y ejecutar acciones con límites de seguridad y parada de emergencia. Adecuado solo en entornos controlados y con supervisión.
- Benchmark interno de políticas ACT: comparar este checkpoint con los otros checkpoints ACT del mismo autor para la misma familia de tareas, usando el mismo robot y el mismo protocolo de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas de robótica como tasa de éxito, error cuadrático medio de acciones, número de episodios evaluados ni comparaciones con otras políticas bajo un protocolo común. Tampoco aplican MMLU, HumanEval o GSM8K, ya que no es un modelo de lenguaje. No se deben inferir resultados del nombre del checkpoint ni del tamaño del repositorio.

## Requisitos de hardware

- Parámetros: 51.687.056. Los pesos en fp32 ocuparían aproximadamente 207 MB; en fp16, aproximadamente 103 MB. El dtype real no se especifica en la información disponible.
- VRAM de inferencia: no disponible oficialmente. Depende de la resolución de imagen, el número de cámaras y el batch; una GPU de consumo con 8 GB o más es una estimación prudente para el modelo, no para todo el sistema de robot.
- GPU recomendadas: no hay recomendación oficial. Para entrenamiento, se puede usar una GPU NVIDIA con CUDA, como RTX 3060, RTX 4060, RTX 4090, A100 o H100, según presupuesto; por el tamaño del modelo, no se requiere una A100 o H100 para inferencia.
- GPU de consumo: sí, por el tamaño del checkpoint; falta confirmar el consumo del pipeline de cámaras y preprocesado.
- Despliegue: LeRobot con PyTorch y CUDA. `lerobot-train` para entrenamiento y `lerobot-record` para evaluación o inferencia. No aplican vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles. Dependen del hardware, la frecuencia de control, el tamaño del chunk y el número de cámaras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| Este checkpoint (`act_task06_new_3_recovery_14D`) | 51.687.056 | No aplica | No disponible | Apache-2.0 | HuggingFace |
| `act_task06_pickup_beaker_and_move_to_refrigerator_14D_new_3` | No disponible | No aplica | No disponible | No disponible en la información | HuggingFace |
| `act_task06_task06-2_pickup_beaker_and_move_to_refrigerator_14D_new` | No disponible | No aplica | No disponible | No disponible en la información | HuggingFace |
| `act_task06_pickup_beaker_and_move_to_refrigerator_14D_260921_200000_recovery` | No disponible | No aplica | No disponible | No disponible en la información | HuggingFace |
| ACT original (paper) | No disponible | No aplica | Resultados del paper no incluidos en la información | No disponible | Paper |

Los checkpoints relacionados del mismo autor son alternativas directas para tareas de la misma familia, pero no se dispone de parámetros, licencia ni resultados de evaluación en la información proporcionada. Sin un protocolo común de evaluación —mismo robot, mismas posiciones iniciales y mismo número de episodios— no es posible establecer una comparación de rendimiento rigurosa.

## Limitaciones y advertencias

- Política específica de tarea: no es un modelo general; no se debe esperar que funcione en otras tareas, robots o configuraciones de cámara sin reentrenamiento.
- No hay información sobre la composición del dataset, el número de episodios, la diversidad de posiciones ni el protocolo de evaluación; existe riesgo de sobreajuste y baja generalización.
- No hay tasas de éxito publicadas; no se puede afirmar robustez ni precisión a partir de la model card.
- El nombre `recovery` sugiere episodios de recuperación, pero no se documenta su significado; no se debe asumir capacidad de recuperación autónoma ante fallos.
- Sesgos: pueden aparecer sesgos de los demostradores, del entorno y de las condiciones de recogida de datos; no se han evaluado.
- Alucinación: no aplica en el sentido de un modelo de lenguaje; el riesgo equivalente es ejecutar acciones erróneas o inseguras.
- Seguridad: no usar en entornos con personas sin paradas de emergencia, límites de par y supervisión humana.
- Licencia Apache-2.0: permite uso comercial con las condiciones de la licencia; deben revisarse también las licencias de las dependencias, como LeRobot y los pesos preentrenados.
- Idiomas: no aplica; el modelo no procesa lenguaje natural.
- Contexto: no aplica; el horizonte de acciones y el tamaño del chunk no están documentados.
- Formato: solo se documenta safetensors; no hay variantes GGUF, AWQ, GPTQ ni cuantizaciones oficiales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kiroaiseoul/act_task06_new_3_recovery_14D
- Dataset de entrenamiento: https://huggingface.co/datasets/kiroaiseoul/task06_new_3_recovery_14D
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Checkpoint relacionado: https://huggingface.co/kiroaiseoul/act_task06_pickup_beaker_and_move_to_refrigerator_14D_new_3
- Checkpoint relacionado: https://huggingface.co/kiroaiseoul/act_task06_task06-2_pickup_beaker_and_move_to_refrigerator_14D_new
- Checkpoint relacionado: https://huggingface.co/kiroaiseoul/act_task06_pickup_beaker_and_move_to_refrigerator_14D_260921_200000_recovery
- Dataset de evaluación relacionado: https://huggingface.co/datasets/kiroaiseoul/eval_result_act_task06_task06-2_pickup_beaker_and_move_to_refrigerator_14D_new_3
