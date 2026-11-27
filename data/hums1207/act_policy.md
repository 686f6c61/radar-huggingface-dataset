# hums1207/act_policy

## Resumen

`hums1207/act_policy` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el artículo arXiv:2304.13705. El modelo ha sido desarrollado por el usuario hums1207 y distribuido a través de Hugging Face Hub usando la librería LeRobot de Hugging Face. Su propósito es controlar un robot seguidor de tipo `so102_follower` equipado con una cámara de muñeca (`cam_wrist`), generando comandos de acción de 7 dimensiones a partir del estado del robot y de la imagen capturada.

ACT es un método de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. En este caso concreto, la política se ha entrenado sobre un dataset propio de 45 episodios y 50.933 fotogramas a 30 FPS para la tarea "rerobot_picking", con 30.000 pasos de entrenamiento y un tamaño de lote de 8.

El modelo tiene 51.670.663 parámetros y un peso de repositorio de 0,2 GB, lo que lo hace muy ligero y apto para inferencia en hardware de consumo. Es relevante como ejemplo práctico de cómo LeRobot permite entrenar y desplegar políticas robóticas de forma reproducible y con licencia Apache 2.0, aunque su ámbito de aplicación es muy específico y no dispone de resultados de evaluación publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Action Chunking (ACT) |
| Parametros totales | 51.670.663 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control robótico, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; modelo de robótica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | LeRobot 0.6.0 |
| Tipo de robot | so102_follower |
| Camaras | cam_wrist |
| Entrada observation.state | STATE (7,) |
| Entrada observation.images.cam_wrist | VISUAL (3, 480, 640) |
| Salida action | ACTION (7,) |

## Arquitectura y entrenamiento

La arquitectura es ACT (Action Chunking with Transformers), un transformer que combina un codificador visual y un decodificador de acciones para predecir secuencias cortas de acciones (chunks) en lugar de comandos individuales. El modelo consume el estado del robot de 7 dimensiones y una imagen RGB de 480x640 píxeles procedente de la cámara de muñeca, y produce un vector de acción de 7 dimensiones. Esta formulación de chunking reduce el error acumulado típico de las políticas que predicen paso a paso y mejora la consistencia temporal en tareas de manipulación.

El entrenamiento se realizó con LeRobot 0.6.0 sobre el dataset `hums1207/phsyical_AI_20261121_162707`, compuesto por 45 episodios, 50.933 fotogramas a 30 FPS y la tarea "rerobot_picking". Se emplearon 30.000 pasos de entrenamiento, batch size de 8, optimizador AdamW, learning rate de 1e-05 y semilla 1000. No se especifica en la información disponible si hubo fases de RLHF, DPO ni aumentos de datos adicionales; el método ACT es puramente de aprendizaje por imitación supervisada a partir de demostraciones teleoperadas.

## Capacidades

- Control robótico de manipulación mediante aprendizaje por imitación: genera comandos de acción de 7 dimensiones para un robot seguidor `so102_follower`.
- Percepción visual monocámara: procesa imágenes de 480x640 desde `cam_wrist` para condicionar las acciones.
- Predicción de chunks de acciones: emite secuencias cortas de acciones que mejoran la estabilidad frente a la predicción paso a paso.
- Ejecución de la tarea específica "rerobot_picking" sobre la que fue entrenado.
- Integración con el ecosistema LeRobot: comandos `lerobot-rollout` y `lerobot-train` para despliegue y reentrenamiento.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No dispone de capacidades multilingües ni de procesamiento de audio o texto.
- No dispone de modo thinking ni de visión general más allá de la imagen de la cámara de muñeca.

## Casos de uso

- Recogida automatizada de objetos (picking) en un banco de pruebas: la política se usa con `lerobot-rollout` sobre el robot `so102_follower` para ejecutar la tarea "rerobot_picking" durante un tiempo determinado, aprovechando que fue entrenada específicamente para esa tarea y configuración de cámara.
- Prototipado de flujos de aprendizaje por imitación: sirve como referencia reproducible para validar el pipeline completo de LeRobot (grabación de datos, entrenamiento con ACT y despliegue) antes de escalar a tareas más complejas.
- Docencia e investigación en robótica: al tener 51,67 M de parámetros y 0,2 GB de pesos, es adecuado para laboratorios con presupuesto limitado que quieran estudiar ACT y sus hiperparámetros sin grandes recursos de cómputo.
- Base para fine-tuning con nuevos datasets: el comando `lerobot-train --policy.type=act` permite reentrenar la política sobre datos propios manteniendo la misma arquitectura y configuración de entrada/salida.
- Evaluación comparativa de políticas de imitación: puede usarse como línea base ACT frente a otros métodos (Diffusion Policy, VQ-BeT) sobre el mismo robot y dataset para medir diferencias de éxito.
- Despliegue en robots de bajo coste tipo SO-102: la escasa huella de memoria permite ejecutar la política en un PC con GPU de consumo conectado al robot, sin necesidad de servidores dedicados.
- Automatización de tareas repetitivas de pick-and-place en entornos controlados: útil cuando la posición de los objetos y la iluminación son estables, condiciones similares a las del dataset de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para los pesos en precisión nativa (51,67 M de parámetros, repo de 0,2 GB); el consumo real depende del runtime y de los buffers de imagen.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; se ha entrenado con `--policy.device=cuda`, por lo que se espera una GPU NVIDIA.
- Cabe en GPU de consumo: sí, en tarjetas como GTX 1650, RTX 3050, RTX 4060 o superiores; también es viable en CPU para inferencia, aunque con mayor latencia.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte de PyTorch y safetensors; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a políticas robóticas).
- Latencia y throughput estimados: no disponibles; dependen del robot, de la cámara y del hardware de control. El dataset se grabó a 30 FPS, lo que sugiere que la política debe operar en el entorno de decenas de hercios para control fluido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hums1207/act_policy | 51,67 M | Estado (7,) + imagen 480x640 | Pick-and-place "rerobot_picking" | Apache 2.0 | Hugging Face Hub |
| ACT original (referencia del paper) | no disponible | Configurable según robot | Aprendizaje por imitación genérico | no disponible | Repositorio de investigación |
| Diffusion Policy | no disponible | Estado + imágenes | Aprendizaje por imitación | no disponible | Repositorio de investigación |
| Otras políticas LeRobot en el Hub | variable | variable | variable | variable | Hugging Face Hub |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Ámbito muy restringido: entrenada únicamente para la tarea "rerobot_picking" con un robot `so102_follower` y una cámara `cam_wrist`; no generaliza a otras tareas, robots ni configuraciones de cámara sin reentrenamiento.
- Dataset pequeño: 45 episodios y 50.933 fotogramas, lo que limita la robustez frente a variaciones de posición, iluminación, distractores o cambios de objeto.
- Sin evaluación publicada: no hay tasas de éxito ni pruebas en robot real, por lo que no se puede afirmar su fiabilidad en producción.
- Riesgo de sobreajuste al entorno de grabación: cambios en la cámara, la mesa o el robot pueden degradar el rendimiento de forma significativa.
- Sin capacidades de lenguaje ni multilingües: no es un modelo de texto y no debe evaluarse con métricas de LLM.
- Sin datos de sesgos: no se documentan sesgos conocidos, pero al ser un modelo visual pueden aparecer sesgos derivados de la distribución del dataset de entrenamiento.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene citar el paper de ACT y LeRobot.
- Dependencia de LeRobot 0.6.0: cambios de versión en la librería pueden afectar a la compatibilidad de los pesos y de los comandos de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hums1207/act_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/hums1207/phsyical_AI_20261121_162707
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=hums1207/phsyical_AI_20261121_162707
