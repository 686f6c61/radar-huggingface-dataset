# rimur01/act_so101_chunk10_50k

## Resumen

`act_so101_chunk10_50k` es una política de imitación (imitation learning) entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv 2304.13705, y empaquetada en formato LeRobot por el usuario rimur01. No es un modelo de lenguaje: es un controlador visomotor que consume el estado articular de un robot SO-101 de 6 grados de libertad y dos cámaras RGB de 480x640, y emite comandos de acción de 6 dimensiones. El modelo predice "chunks" de acciones (secuencias cortas de pasos futuros) en lugar de un único paso, lo que reduce el error de acumulación típico de las políticas reactivas.

El modelo tiene 51.576.454 parámetros (unos 51,6 M) y ocupa 0,2 GB en el repositorio, lo que lo sitúa en la categoría de políticas ligeras ejecutables en tiempo real sobre hardware de consumo. Se entrenó durante 50.000 pasos con batch size 1 sobre un dataset propio de 50 episodios y 15.000 fotogramas a 15 FPS, para la tarea concreta "Pick up an object and place it in a target area".

Su relevancia es acotada pero clara: sirve como referencia reproducible de un pipeline completo de LeRobot (grabación de datos, entrenamiento ACT, despliegue con `lerobot-rollout`) y como punto de partida para quien quiera replicar manipulación pick-and-place en un SO-101. No hay resultados de evaluación publicados, por lo que su rendimiento real en el robot no está cuantificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones con chunking |
| Parametros totales | 51.576.454 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; ventana de observación definida por el chunking, no documentada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | no aplica (modelo de robótica; la tarea se especifica en inglés) |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors (repositorio LeRobot, 0,2 GB) |

## Arquitectura y entrenamiento

ACT es un transformer que combina un encoder visual (procesa `observation.images.cam0` y `cam1`, ambas de 3x480x640) con un encoder del estado propioceptivo (`observation.state`, vector de 6 dimensiones) y un decoder que genera un chunk de acciones de 6 dimensiones. La innovación central del método es predecir varios pasos de acción de golpe y agregarlos temporalmente, lo que mitiga el compounding error de las políticas paso a paso. El nombre del checkpoint (`chunk10`) sugiere un tamaño de chunk de 10, aunque este dato no se confirma de forma explícita en la model card.

El entrenamiento usó el dataset `rimur01/so101-assignment1-50-new`: 50 episodios, 15.000 fotogramas a 15 FPS, una única tarea de pick-and-place. La configuración fue de 50.000 pasos, batch size 1, optimizador AdamW, learning rate 1e-5, semilla 1000 y LeRobot 0.6.2. No se documenta composición del dataset más allá del número de episodios, ni se menciona RLHF, DPO ni aumento de datos. Tampoco hay información sobre la política de aumento visual (crops, jitter de color) que LeRobot aplica por defecto en ACT.

## Capacidades

- Control visomotor de manipulación: genera acciones de 6 dimensiones para un robot SO-101 (`so_follower`) a partir de dos vistas de cámara y el estado articular.
- Predicción de chunks de acción, orientada a trayectorias suaves y consistentes en tareas de pick-and-place.
- Ejecución en tiempo real mediante `lerobot-rollout` con `--strategy.type=base`.
- Aprendizaje por imitación a partir de teleoperación: no requiere recompensas ni entorno simulado.
- Tarea única y especializada: "Pick up an object and place it in a target area".
- No soporta tool calling, agentes, razonamiento multi-paso, multilingüismo ni modalidades de audio o texto.

## Casos de uso

- Replicación de un pipeline de imitación end-to-end: sirve como ejemplo funcional de grabación con LeRobot, entrenamiento ACT y despliegue con `lerobot-rollout`, útil para docencia y para validar la instalación de hardware SO-101.
- Pick-and-place en laboratorio: el modelo está entrenado exactamente para coger un objeto y depositarlo en una zona objetivo, por lo que es adecuado como línea base en experimentos de manipulación con objetos y posiciones controladas.
- Comparación de métodos de imitación: al ser un ACT con 51,6 M de parámetros y 50.000 pasos, permite contrastar frente a Diffusion Policy o VQ-BeT sobre el mismo dataset y robot.
- Prototipado de bajo coste: con 0,2 GB de pesos, se puede cargar en una GPU de consumo y ejecutar en un puesto de trabajo junto al robot, sin infraestructura de servidor.
- Generación de datos sintéticos de evaluación: las trayectorias predichas pueden registrarse para analizar el comportamiento de la política antes de invertir en más episodios de teleoperación.
- Base para fine-tuning en tareas similares: al estar en formato LeRobot, se puede reentrenar con `lerobot-train` sobre un dataset propio de otro objeto o zona objetivo, partiendo de una política ya entrenada en el mismo robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la sección de evaluación vacía con la nota "_No evaluation results have been provided for this policy yet._", por lo que no hay tasas de éxito, número de ensayos ni condiciones de evaluación documentadas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 2 GB en fp32 para 51,6 M de parámetros más los dos encoders visuales; en la práctica, cualquier GPU con 4 GB o más es suficiente.
- GPU recomendadas: no se especifican en la model card. Por tamaño, una RTX 3060, RTX 4060 o superior es suficiente; A100/H100 no aportan ventaja para este modelo.
- Cabe en GPU de consumo: sí, con amplio margen, incluidas GPUs de portátil con 4-6 GB.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial) con `--policy.path=rimur01/act_so101_chunk10_50k`; el resto del stack LeRobot (entrenamiento con `lerobot-train`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas robóticas.
- Latencia y throughput: no disponibles. La ejecución depende del bucle de control del SO-101 y de la captura de las dos cámaras a 30 FPS según el comando de ejemplo; no se publican cifras de latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / observacion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rimur01/act_so101_chunk10_50k` | 51,6 M | 2 camaras 480x640 + estado (6,) | sin evaluacion publicada | no disponible | Hugging Face, formato LeRobot |
| ACT original (paper 2304.13705) | no disponible en la informacion | no disponible | resultados en simulacion y robot del paper | codigo abierto (repositorio del paper) | referencia metodologica |
| Otras politicas LeRobot (Diffusion Policy, VQ-BeT) | no disponible en la informacion | no disponible | no disponible | no disponible | integradas en LeRobot |

No se dispone de datos suficientes en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas concretas del mismo robot o dataset.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasa de éxito ni número de ensayos, por lo que no se puede afirmar que la política funcione de forma fiable en el robot real.
- Especialización extrema: entrenada para una única tarea y un único tipo de robot (`so_follower`). No generaliza a otros objetos, posiciones ni morfologías sin reentrenamiento.
- Dataset pequeño: 50 episodios y 15.000 fotogramas son una base limitada; es probable que la política sea sensible a cambios de iluminación, fondo, posición inicial del objeto o calibración de las cámaras.
- Dependencia de la configuración de cámaras: los nombres `cam0` y `cam1` y sus índices deben coincidir exactamente con los usados en el entrenamiento; un cambio de montaje o resolución invalida el modelo.
- Licencia no especificada: al no indicarse licencia, no hay autorización explícita para uso comercial ni para redistribución; conviene contactar con el autor antes de cualquier despliegue en producción.
- Riesgo de sobreajuste al operador: al ser imitación de teleoperación con una sola persona y 50 episodios, la política puede reproducir sesgos de estilo y velocidad del demostrador.
- Sin información sobre sesgos sociales ni alucinación en el sentido de modelos de lenguaje; el riesgo equivalente es la ejecución de trayectorias incorrectas o inseguras sobre hardware físico.
- Fecha de creación indicada como 2026-11-14, posterior a la fecha habitual de publicación; conviene verificar la integridad del repositorio antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rimur01/act_so101_chunk10_50k
- Dataset de entrenamiento: https://huggingface.co/datasets/rimur01/so101-assignment1-50-new
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=rimur01/so101-assignment1-50-new
- Paper ACT: https://huggingface.co/papers/2304.13705 (arXiv 2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
