# eetudigi/hf_act_recordpolicy_50ep_20k

## Resumen

`eetudigi/hf_act_recordpolicy_50ep_20k` es una política de imitación para robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705. El modelo lo ha entrenado y subido a Hugging Face el usuario eetudigi mediante la librería LeRobot, el framework de aprendizaje por imitación de Hugging Face para robótica real. No es un modelo de lenguaje: es un controlador visomotor que mapea observaciones (estado articular de 6 dimensiones y dos cámaras RGB de 480x640) a acciones de 6 dimensiones.

La política está especializada en una única tarea: "Grab the yellow cap". Se entrenó con 50 episodios de teleoperación (25.144 fotogramas a 30 FPS) sobre un robot de tipo `so_follower` (familia SO-100/SO-101 de bajo coste) con dos cámaras, `wrist` y `top`. El checkpoint corresponde a 20.000 pasos de entrenamiento con batch size 8, optimizador AdamW y learning rate 1e-5.

Su relevancia es acotada y experimental: sirve como ejemplo reproducible de un pipeline completo de LeRobot (grabación de datos, entrenamiento ACT, despliegue con `lerobot-rollout`), no como un modelo de propósito general. Con 51,7 millones de parámetros y un repositorio de 0,2 GB, es ligero y ejecutable en hardware modesto, pero su utilidad queda limitada al entorno y la tarea exactos con los que se recogieron los datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de chunks de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; ventana de observación definida por la configuración de entrenamiento, no disponible) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice chunks de acciones (secuencias cortas de comandos) en lugar de pasos individuales, lo que reduce el error de composición acumulado típico de las políticas paso a paso. La arquitectura combina un backbone visual (habitualmente ResNet) que procesa las dos cámaras (`wrist` y `top`, 3x480x640 cada una), un codificador del estado articular (6 dimensiones) y un transformer encoder-decoder que genera el chunk de acciones (6 dimensiones por paso). El modelo incorpora la técnica de *temporal ensembling* descrita en el paper para suavizar las predicciones durante la inferencia.

El entrenamiento se realizó sobre el dataset `eetudigi/record-test_20261104_175931`: 50 episodios, 25.144 fotogramas a 30 FPS, una única tarea ("Grab the yellow cap"), robot `so_follower`. Configuración: 20.000 pasos, batch size 8, AdamW, learning rate 1e-5, semilla 1000, LeRobot 0.6.2. No se documenta el uso de RLHF, DPO ni ningún refinamiento posterior al aprendizaje supervisado por imitación. No hay información sobre aumentos de datos, número de tokens (no aplica) ni composición detallada del dataset más allá de la tarea y el número de episodios.

## Capacidades

- Control visomotor para manipulación robótica: genera comandos de 6 dimensiones a partir del estado articular y de dos vistas de cámara.
- Ejecución de una tarea concreta de picking: "Grab the yellow cap", aprendida por imitación de teleoperación.
- Predicción de chunks de acciones con ensamblado temporal, lo que aporta suavidad y robustez frente a pasos individuales.
- Entrada multimodal: estado propioceptivo (6,) más dos imágenes RGB de 480x640 (`wrist` y `top`).
- Integración nativa con el ecosistema LeRobot: entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout`.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, generación de texto, código, matemáticas, visión general, audio ni modo *thinking*. No es un modelo de lenguaje ni un VLM.

## Casos de uso

- Reproducción de un pipeline de aprendizaje por imitación: sirve como referencia completa (dataset, configuración de entrenamiento, checkpoint) para que un equipo valide su cadena de herramientas LeRobot antes de entrenar políticas propias.
- Manipulación de picking en laboratorio: el robot `so_follower` puede ejecutar la tarea "Grab the yellow cap" en el mismo entorno, iluminación y disposición de objetos que en la grabación, lo que resulta útil para experimentos controlados de robótica de bajo coste.
- Docencia y formación: ejemplo didáctico de ACT con cifras concretas (50 episodios, 25.144 fotogramas, 20.000 pasos) para explicar el flujo de datos teleoperados a política desplegable.
- Base para *fine-tuning*: punto de partida para reentrenar con un dataset propio de la misma morfología de robot y cámaras, reduciendo el coste inicial frente a entrenar desde cero.
- Pruebas de integración de hardware: validar la calibración de cámaras, puertos y frecuencias (30 FPS) con una política ya entrenada antes de abordar tareas más complejas.
- Evaluación de robustez de políticas ACT: comparar el comportamiento del modelo ante cambios de posición del objeto, iluminación o distracciones para estudiar la generalización del método en un caso concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No existen tasas de éxito en robot real, ni comparaciones con otras políticas, ni métricas de pérdida de entrenamiento publicadas.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,7 millones de parámetros en safetensors (0,2 GB de repositorio), la inferencia cabe holgadamente en GPUs de consumo. La estimación exacta depende del backbone visual y del tamaño del chunk de acciones, no documentados.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior es más que adecuada. Para entrenamiento, la model card usa `--policy.device=cuda` con batch size 8, viable en GPUs de consumo de gama media.
- Cabe en GPU de consumo: sí, con amplio margen.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución en robot, `lerobot-train` para reentrenamiento). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La política debe ejecutarse a la frecuencia de control del robot (los datos se grabaron a 30 FPS), pero no se publican medidas de latencia por paso.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `eetudigi/hf_act_recordpolicy_50ep_20k` | 51,7 M | ACT (LeRobot) | Estado (6,) + 2 imágenes 480x640 | no disponible | Hugging Face, 0 descargas |
| ACT original (paper arXiv:2304.13705) | no disponible | ACT | Variables según tarea | no disponible | Código en el repositorio del paper |
| Políticas LeRobot de referencia (p. ej. Diffusion Policy, TDMPC) | variable | Imitación / RL | Variable | variable según checkpoint | Hub de Hugging Face y LeRobot |

No se dispone de datos de rendimiento comparables entre estas opciones en la información proporcionada. La comparación se limita a parámetros, tipo de método y disponibilidad; cualquier comparación de tasas de éxito requeriría evaluaciones en robot real que no se han publicado.

## Limitaciones y advertencias

- Especialización extrema: entrenado para una única tarea ("Grab the yellow cap") y un único robot (`so_follower`); no generaliza a otras tareas, objetos ni morfologías sin reentrenamiento.
- Dependencia del entorno: cambios en iluminación, posición de cámaras, fondo o disposición de objetos pueden degradar el comportamiento; no se han publicado evaluaciones de robustez.
- Licencia no especificada: la model card indica "[More Information Needed]", por lo que el uso comercial no está autorizado de forma explícita y debe consultarse con el autor.
- Sin resultados de evaluación: no hay tasas de éxito ni métricas que permitan estimar su fiabilidad en producción.
- Dataset pequeño: 50 episodios y 25.144 fotogramas son insuficientes para cubrir variabilidad real; el riesgo de sobreajuste al entorno de grabación es alto.
- Sin información sobre sesgos: al no ser un modelo lingüístico, no aplican sesgos de texto, pero sí posibles sesgos de datos de teleoperación (un único operador, condiciones homogéneas).
- No apto para producción crítica: la ausencia de licencia, evaluación y documentación de seguridad desaconseja su uso fuera de entornos experimentales.
- Nombres de cámaras obligatorios: el despliegue exige que las cámaras se llamen exactamente `wrist` y `top`, y que la resolución y FPS coincidan con los del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eetudigi/hf_act_recordpolicy_50ep_20k
- Dataset de entrenamiento: https://huggingface.co/datasets/eetudigi/record-test_20261104_175931
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=eetudigi/record-test_20261104_175931
- Paper ACT: https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
