# peterchau/act_aloha_test_0

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. Este repositorio concreto, `peterchau/act_aloha_test_0`, es una política entrenada con LeRobot sobre el entorno simulado ALOHA para la tarea de inserción de una clavija en un receptáculo.

El modelo es una prueba técnica (el sufijo `test_0` y los 100 pasos de entrenamiento con batch size 2 así lo indican) más que un artefacto listo para producción. Cuenta con 51.685.006 parámetros almacenados en formato safetensors y un tamaño de repositorio de 0,2 GB. Consume observaciones visuales de una cámara superior a resolución 480x640 y un vector de estado de 14 dimensiones, y produce acciones de 14 dimensiones correspondientes a los grados de libertad del robot ALOHA.

Su relevancia es fundamentalmente metodológica y educativa: sirve como ejemplo mínimo reproducible del flujo de trabajo de LeRobot para entrenar y desplegar políticas ACT, y permite validar pipelines de inferencia en simulación antes de escalar a entrenamientos con más pasos y datasets mayores. No debe evaluarse como un modelo de lenguaje ni como un sistema generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer para aprendizaje por imitación (ACT, Action Chunking with Transformers) |
| Parametros totales | 51.685.006 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de robótica; no aplica ventana de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (modelo no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT emplea un transformer que, a partir de las observaciones (imagen de cámara `observation.images.top` con forma `(3, 480, 640)` y estado `observation.state` de forma `(14,)`), predice un chunk de acciones de forma `(14,)`. La innovación central del método es la predicción de secuencias de acciones en lugar de pasos aislados, lo que mitiga el error compuesto típico de las políticas paso a paso. El modelo se entrenó con la librería LeRobot versión 0.7.1.

El entrenamiento se realizó sobre el dataset `lerobot/aloha_sim_insertion_human`, compuesto por 50 episodios, 25.000 frames a 50 FPS, con la tarea "Insert the peg into the socket." La configuración fue de 100 pasos de entrenamiento, batch size 2, optimizador AdamW, learning rate 1e-05 y semilla 1000. Se trata, por tanto, de un entrenamiento de validación muy corto, no de un modelo convergido. No se documenta el uso de RLHF, DPO ni otras técnicas de alineamiento, algo esperable en un método de imitación supervisada.

## Capacidades

- Predicción de chunks de acciones para control robótico de manipulación.
- Procesamiento de observaciones visuales monocámara (cámara superior, 480x640).
- Integración de estado proprioceptivo de 14 dimensiones con percepción visual.
- Ejecución de la tarea específica de inserción de clavija en receptáculo en simulación ALOHA.
- Compatibilidad con el ecosistema LeRobot para rollout, entrenamiento y evaluación.
- No dispone de capacidades de generación de texto, razonamiento simbólico, código ni matemáticas.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No dispone de capacidades multilingües ni de modalidades de audio.

## Casos de uso

- Validación de pipelines de entrenamiento en LeRobot: el modelo sirve para comprobar que el flujo `lerobot-train` produce checkpoints cargables y ejecutables antes de lanzar entrenamientos largos con datasets mayores.
- Prueba de integración hardware-software en ALOHA: permite verificar la comunicación con el robot, la calibración de cámaras y el mapeo de observaciones antes de invertir en entrenamientos costosos.
- Docencia y divulgación: ejemplo mínimo reproducible de aprendizaje por imitación con transformers para cursos de robótica, dado su bajo coste computacional y su dataset pequeño.
- Benchmark de referencia para comparar configuraciones de ACT: al fijar semilla, learning rate y número de pasos, sirve como línea base contra la que medir variantes del método.
- Desarrollo de entornos simulados: útil para validar el simulador ALOHA y la tarea de inserción antes de transferir políticas a hardware real.
- Pruebas de latencia de inferencia: con 51,7 M de parámetros y entrada visual de 480x640, permite medir el coste de un paso de política en GPUs de consumo y planificar despliegues en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del modelo (51,7 M de parámetros), es esperable que quepa holgadamente en GPUs de consumo, aunque el cuello de botella real es el procesamiento de imágenes de 480x640.
- GPU recomendadas: no disponibles en la información proporcionada. Dado el reducido número de parámetros, una GPU de gama media o incluso CPU podría ser suficiente para inferencia, si bien no se documenta latencia.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del modelo, aunque no se confirma en la documentación.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` con `--policy.path=peterchau/act_aloha_test_0`; entrenamiento con `lerobot-train` y `--policy.type=act`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| peterchau/act_aloha_test_0 | 51.685.006 | no aplica | Inserción de clavija en ALOHA sim | no disponible | Hugging Face (LeRobot) |
| Políticas ACT de referencia en LeRobot | no disponible | no aplica | Manipulación ALOHA | no disponible | Hugging Face |
| Políticas Diffusion Policy | no disponible | no aplica | Manipulación robótica | no disponible | Hugging Face / repos académicos |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Entrenamiento de solo 100 pasos con batch size 2: la política no ha convergido y no debe considerarse funcional para la tarea.
- Ausencia total de resultados de evaluación: no hay evidencia de tasa de éxito en simulación ni en robot real.
- Licencia no especificada: no se puede garantizar el uso comercial ni la redistribución.
- Entrenado exclusivamente en simulación (ALOHA sim) sobre una única tarea y con una única cámara; no hay evidencia de transferencia a hardware real.
- Dataset muy reducido (50 episodios, 25.000 frames): alta probabilidad de sobreajuste y baja generalización a variaciones de posición, iluminación o distractores.
- Sesgos conocidos: no documentados, pero al derivar de datos de teleoperación humana puede heredar sesgos de los operadores.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erróneas o inseguras en un robot real.
- Limitaciones idiomáticas: no aplica; el modelo no procesa lenguaje.
- No apto para producción sin reentrenamiento, evaluación exhaustiva y validación de seguridad en el robot objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/peterchau/act_aloha_test_0
- Paper ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/aloha_sim_insertion_human
- LeRobot en GitHub: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=lerobot/aloha_sim_insertion_human
