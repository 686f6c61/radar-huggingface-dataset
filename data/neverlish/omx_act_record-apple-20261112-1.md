# neverlish/omx_act_record-apple-20261112-1

## Resumen

El modelo `omx_act_record-apple-20261112-1`, publicado por el usuario neverlish en Hugging Face, es una política de imitación basada en la arquitectura ACT (Action Chunking with Transformers), descrita en el artículo arXiv:2304.13705. No se trata de un modelo de lenguaje, sino de un modelo de robótica entrenado con LeRobot, la librería de Hugging Face para aprendizaje por imitación en manipulación robótica. Su función es predecir secuencias cortas de acciones (action chunks) a partir de observaciones visuales y del estado del robot, en lugar de predecir un único paso de acción.

El modelo cuenta con 51.668.614 parámetros en formato safetensors y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en el rango de políticas ligeras aptas para inferencia en tiempo real en hardware de consumo. Se ha entrenado sobre el dataset `neverlish/record-apple-20261109-1`, presumiblemente una grabación de teleoperación de una tarea concreta (recoger una manzana), y se distribuye con licencia Apache 2.0.

Su relevancia es acotada pero clara: es un artefacto reproducible de un pipeline de entrenamiento LeRobot para una tarea específica de manipulación. No es un modelo generalista ni un modelo fundacional de robótica; es una política especializada que demuestra el flujo de trabajo de entrenamiento y evaluación de ACT con LeRobot sobre un robot tipo SO-100.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; procesa observaciones por paso) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no aplica (modelo de robótica, no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un codificador visual (típicamente un backbone tipo ResNet preentrenado, aunque la model card no detalla la elección concreta) con un transformer que predice un chunk de acciones de longitud fija. La innovación principal del método, descrita en el paper 2304.13705, es la predicción de secuencias de acciones en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación fina. El modelo también incorpora una estrategia de entrenamiento con ruido en las acciones objetivo (action chunking con CVAE) para capturar la multimodalidad de las demostraciones humanas.

Los detalles concretos de entrenamiento (número de tokens, composición exacta del dataset, número de episodios, resolución de las cámaras, configuración de aumentos de datos) no están disponibles en la información proporcionada. Se sabe que el entrenamiento se realizó con `lerobot-train` sobre el dataset `neverlish/record-apple-20261109-1` y que el autor lo subió al Hub con la etiqueta `pipeline_tag: robotics`. No se documenta si hubo RLHF, DPO ni ningún ajuste posterior; en ACT el entrenamiento es puramente supervisado por imitación.

## Capacidades

- Predicción de acciones robóticas en forma de chunks a partir de observaciones visuales y del estado del robot.
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Control de manipuladores tipo SO-100 (la model card muestra ejemplos con `so100_follower`).
- Ejecución de tareas de manipulación específicas para las que fue entrenado (en este caso, presumiblemente recoger una manzana).
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico.
- No tiene capacidades multilingües, de visión general, audio ni generación de texto.

## Casos de uso

- Recogida de objetos en línea de producción: la política puede ejecutar la tarea de recoger una manzana (u objeto similar) tras ser entrenada con demostraciones teleoperadas, integrándose en una celda robotizada con un SO-100.
- Prototipado rápido de políticas de manipulación: sirve como referencia para validar el pipeline `lerobot-train` + `lerobot-record` antes de escalar a tareas más complejas.
- Investigación en aprendizaje por imitación: permite reproducir experimentos con ACT sobre un dataset concreto y comparar curvas de éxito con otras políticas.
- Evaluación de robustez visual: al ser un modelo pequeño (51,7 M de parámetros), se puede desplegar en GPUs de consumo para probar variaciones de iluminación, posición de cámara o fondo.
- Docencia y formación: ejemplo didáctico de un modelo de robótica completo, con pesos, dataset y comandos de entrenamiento reproducibles.
- Base para fine-tuning: al estar en formato LeRobot y con licencia Apache 2.0, se puede reentrenar sobre nuevos datasets de teleoperación para adaptarlo a otras tareas de picking.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, curvas de aprendizaje ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (51,7 M de parámetros), por lo que cabe holgadamente en cualquier GPU moderna.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; una RTX 3060, RTX 4090 o A100 son más que suficientes. Para entrenamiento se recomienda una GPU con 8-16 GB.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU consumer de los últimos años, e incluso en CPU para inferencia (aunque con mayor latencia).
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), que internamente usa PyTorch. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| neverlish/omx_act_record-apple-20261112-1 | 51,7 M | no aplica | Manipulación (ACT) | Apache 2.0 | Hugging Face |
| Políticas ACT genéricas de LeRobot | variable | no aplica | Manipulación (ACT) | Apache 2.0 | Hugging Face / LeRobot |
| Diffusion Policy (referencia) | variable | no aplica | Manipulación | MIT/Apache | Repositorios de investigación |
| RT-2 / OpenVLA (referencia) | miles de millones | limitado | Robótica generalista | variable | Hugging Face |

No se dispone de datos cuantitativos para comparar el rendimiento de este modelo con las alternativas citadas. La comparación es estructural: este modelo es una política ACT especializada y ligera, frente a políticas fundacionales de robótica de mayor tamaño y propósito general.

## Limitaciones y advertencias

- Es un modelo especializado en una única tarea y un único robot; no generaliza a otras tareas sin reentrenamiento.
- No es un modelo de lenguaje: no procesa texto, no responde preguntas ni genera código.
- El dataset de entrenamiento es privado del autor (`neverlish/record-apple-20261109-1`); no se documenta su tamaño, diversidad ni calidad, lo que limita la reproducibilidad.
- Riesgo de sobreajuste al entorno de grabación (iluminación, posición de cámara, fondo); el rendimiento puede degradarse fuera de esas condiciones.
- No hay métricas publicadas de tasa de éxito, por lo que no se puede evaluar su fiabilidad en producción.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- No se documentan sesgos, pero al ser un modelo de robótica los riesgos relevantes son de seguridad física (colisiones, fallos de agarre), no de sesgo algorítmico en el sentido habitual.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/neverlish/omx_act_record-apple-20261112-1
- Dataset de entrenamiento: https://huggingface.co/datasets/neverlish/record-apple-20261109-1
- Paper ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
