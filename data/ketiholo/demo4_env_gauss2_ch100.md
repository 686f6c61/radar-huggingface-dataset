# ketiholo/demo4_env_gauss2_ch100

## Resumen

`ketiholo/demo4_env_gauss2_ch100` es una política de robótica entrenada con el método ACT (Action Chunking with Transformers) y publicada en Hugging Face mediante la librería LeRobot. No es un modelo de lenguaje: es un modelo de imitación que, a partir de observaciones visuales y del estado del robot, predice secuencias cortas de acciones motoras (chunks) para controlar un manipulador. Lo desarrolla el usuario `ketiholo` y se distribuye con licencia Apache 2.0.

El modelo resuelve el problema del control robótico por imitación: en lugar de predecir una acción por paso, genera un bloque de acciones futuras, lo que reduce el error de compounding y suaviza el comportamiento. Su relevancia es práctica para quien quiera reproducir o adaptar un pipeline de LeRobot sobre un robot tipo SO-100: el repositorio incluye los pesos en safetensors (51.676.313 parámetros, 0,2 GB) y las instrucciones de entrenamiento e inferencia.

Se trata de un checkpoint concreto (nombre `demo4_env_gauss2_ch100`, que sugiere un dataset `demo4` y un chunking de 100 pasos) entrenado sobre el dataset `ketiholo/demo4`. No hay información publicada sobre arquitectura detallada más allá de ACT, ni sobre composición del dataset, idiomas o benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), según model card |
| Parámetros totales | 51.676.313 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de imitación, no modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no aplica; modelo de robótica) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Librería | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | ketiholo/demo4 |
| Tamaño del repositorio | 0,2 GB |
| Descargas | 41 |
| Fecha de creación | 2026-10-30 |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers), descrito en el paper arXiv:2304.13705, es un método de aprendizaje por imitación que combina un codificador visual, un transformer que fusiona observaciones y un decodificador que predice chunks de acciones. La innovación principal es predecir un bloque de acciones futuras en lugar de un único paso, lo que mitiga el error acumulado típico de las políticas paso a paso y permite un control más suave. El nombre del checkpoint (`ch100`) sugiere un tamaño de chunk de 100 pasos, aunque este dato no está confirmado en la información disponible.

El entrenamiento se realizó con LeRobot sobre el dataset `ketiholo/demo4`, presumiblemente datos de teleoperación. No se dispone de información sobre el número de episodios, la composición del dataset, el robot objetivo ni si se aplicaron técnicas de aumento de datos o regularización. Tampoco hay datos sobre RLHF/DPO, ya que no aplica a este tipo de política. El sufijo `env_gauss2` podría indicar ruido gaussiano en el entorno de recogida de datos, pero es una inferencia no verificada.

## Capacidades

- Control robótico por imitación: predice chunks de acciones a partir de observaciones visuales y del estado del robot.
- Manipulación de objetos: adecuado para tareas de pick-and-place y manipulación fina aprendidas de demostraciones.
- Ejecución en tiempo real sobre robots compatibles con LeRobot (por ejemplo, SO-100 follower según la documentación de inferencia).
- Integración con el ecosistema LeRobot: entrenamiento con `lerobot-train` y evaluación con `lerobot-record`.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades de modelos fundacionales.

## Casos de uso

- Automatización de pick-and-place en laboratorio: la política puede ejecutar secuencias de agarre y colocación aprendidas de teleoperación, reduciendo el tiempo de programación manual de trayectorias.
- Prototipado rápido de políticas robóticas: con LeRobot se puede entrenar desde cero con `lerobot-train` y evaluar con `lerobot-record`, lo que permite iterar sobre el dataset `demo4` y comparar checkpoints.
- Investigación en aprendizaje por imitación: sirve como línea base reproducible para estudiar el efecto del chunking (el sufijo `ch100` sugiere 100 pasos) en la estabilidad del control.
- Evaluación de robustez frente a ruido: el nombre `env_gauss2` sugiere entrenamiento con perturbaciones gaussianas, útil para analizar la generalización de ACT en condiciones ruidosas.
- Despliegue en robots de bajo coste: al ocupar 0,2 GB y 51,7 M de parámetros, es viable en GPUs de consumo y en estaciones de trabajo con una sola GPU.
- Docencia y demostraciones: el repositorio incluye comandos de entrenamiento e inferencia que facilitan reproducir el flujo completo en cursos de robótica o aprendizaje automático.
- Integración en pipelines de investigación con Hugging Face Hub: los pesos en safetensors permiten cargar el checkpoint con la API de LeRobot y combinarlo con otros datasets y políticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en safetensors (0,2 GB), la inferencia cabe holgadamente en GPUs de consumo (por ejemplo, RTX 3060, RTX 4090) y en GPUs de datacenter (A100, H100).
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; el comando de entrenamiento de la model card usa `--policy.device=cuda`.
- Cabe en GPU de consumo: sí, por el tamaño reducido del checkpoint.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de PyTorch y safetensors; no se documentan opciones para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ketiholo/demo4_env_gauss2_ch100 | 51.676.313 | no disponible | no disponible | apache-2.0 | Hugging Face (LeRobot) |
| Otros checkpoints ACT de LeRobot | no disponible | no disponible | no disponible | normalmente apache-2.0 | Hugging Face |
| Políticas Diffusion Policy | no disponible | no disponible | no disponible | no disponible | Hugging Face / repositorios de investigación |
| Políticas VQ-BeT | no disponible | no disponible | no disponible | no disponible | Hugging Face / repositorios de investigación |

No se dispone de datos comparativos verificados en la información proporcionada; la comparativa con alternativas concretas queda como no disponible.

## Limitaciones y advertencias

- Es una política de imitación específica del dataset `ketiholo/demo4`; su rendimiento fuera de la distribución de entrenamiento (otras tareas, objetos o entornos) no está garantizado.
- Riesgo de sobreajuste a las condiciones de recogida de datos; el sufijo `env_gauss2` sugiere ruido gaussiano, pero no hay evidencia publicada de su efecto.
- No es un modelo de lenguaje: no genera texto, no razona simbólicamente y no soporta tool calling ni agentes.
- No hay información sobre sesgos, alucinación o limitaciones idiomáticas porque no aplican a este tipo de modelo.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- El repositorio tiene 0 likes y 41 descargas, lo que indica poca validación comunitaria; conviene evaluar el checkpoint en el robot objetivo antes de desplegarlo.
- No se documentan requisitos de seguridad física para el robot; en producción deben añadirse límites de par, paradas de emergencia y validación de trayectorias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ketiholo/demo4_env_gauss2_ch100
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/ketiholo/demo4
