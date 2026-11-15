# Haku-2004/act_k6t_base_10

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora las tasas de éxito en tareas de manipulación. Este repositorio concreto, `Haku-2004/act_k6t_base_10`, es una política entrenada con LeRobot sobre el dataset `Haku-2004/k6_20_20261113_173939` y publicada en Hugging Face con licencia Apache 2.0.

El modelo resuelve el problema del control robótico de imitación: a partir de demostraciones teleoperadas aprende a mapear observaciones (típicamente imágenes de cámara y estado de las articulaciones) a comandos de actuación. Es relevante para desarrolladores que quieran desplegar políticas de manipulación en robots de bajo coste como el SO-100/SO-101, ya que LeRobot ofrece un pipeline completo de entrenamiento, evaluación y despliegue.

Con 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto orientado a inferencia en tiempo real. No es un modelo de lenguaje: no procesa texto ni tiene ventana de contexto lingüística, sino que opera sobre observaciones sensoriales y produce acciones motoras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con codificador visual y decodificador de acciones con chunks |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre ventanas de observación definidas por la política) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (modelo de robótica, sin interfaz de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT se basa en un transformer que combina un codificador visual (procesa las imágenes de las cámaras del robot) con un decodificador que genera un chunk de acciones futuras de forma conjunta. La predicción por chunks, en lugar de paso a paso, mitiga el problema de la acumulación de errores en el control por imitación y permite movimientos más suaves y coherentes. La arquitectura incorpora además una estimación de estilo latente (CVAE) para capturar la variabilidad de las demostraciones humanas.

El entrenamiento se realizó con LeRobot sobre el dataset `Haku-2004/k6_20_20261113_173939`, compuesto por episodios teleoperados. No se dispone de información sobre el número de episodios, la composición exacta del dataset, el número de tokens o pasos de entrenamiento, ni sobre el uso de RLHF/DPO (no aplicable en este contexto). La model card solo documenta el comando de entrenamiento (`lerobot-train --policy.type=act`) y el de evaluación (`lerobot-record`).

## Capacidades

- Control robótico por imitación: predice chunks de acciones a partir de observaciones visuales y de estado de las articulaciones.
- Manipulación de objetos: entrenado para tareas de pick-and-place y similares sobre el dataset k6.
- Inferencia en tiempo real: tamaño reducido (51,7 M de parámetros) compatible con GPUs de consumo.
- Integración con LeRobot: entrenamiento, evaluación y despliegue mediante las herramientas `lerobot-train` y `lerobot-record`.
- Compatibilidad con robots SO-100/SO-101: el ejemplo de evaluación usa `--robot.type=so100_follower`.
- Sin soporte de tool calling, agentes, multi-step reasoning lingüístico ni capacidades multilingües: no es un modelo de lenguaje.
- Sin capacidades de visión general (VQA, OCR): el codificador visual está especializado en las cámaras del robot.

## Casos de uso

- Manipulación pick-and-place en laboratorio: la política aprende de demostraciones teleoperadas y ejecuta agarres y colocaciones sobre el robot SO-100, aprovechando la predicción por chunks para movimientos suaves.
- Automatización de tareas repetitivas de ensamblaje: con 51,7 M de parámetros, la inferencia es rápida y puede ejecutarse en un bucle de control a decenas de hercios en una GPU de consumo.
- Investigación en aprendizaje por imitación: sirve como baseline reproducible para comparar variantes de ACT, datasets o hiperparámetros usando el pipeline de LeRobot.
- Prototipado de robots de bajo coste: el tamaño del repo (0,2 GB) y la licencia Apache 2.0 permiten desplegarlo en estaciones de trabajo modestas sin coste de licencia.
- Evaluación comparativa de políticas: el comando `lerobot-record` con prefijo `eval_` permite medir tasas de éxito sobre 10 episodios y comparar contra otras políticas entrenadas con el mismo dataset.
- Formación y docencia en robótica: el flujo completo (dataset, entrenamiento, evaluación) es reproducible y adecuado para cursos prácticos de imitation learning.
- Despliegue en entornos de producción controlados: al ser Apache 2.0, puede integrarse en productos comerciales sin restricciones de licencia, siempre que se valide su robustez en el entorno real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (51,7 M de parámetros ≈ 207 MB de pesos); en la práctica, el consumo lo dominan los buffers de imágenes y el runtime de PyTorch, por lo que se recomienda al menos 4-8 GB de VRAM para operar con comodidad.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA, incluidas RTX 3060, RTX 4090, A100 o H100; el modelo es muy pequeño y no requiere aceleradores de gama alta.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1660 en adelante) e incluso en CPU para inferencia de baja frecuencia.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), PyTorch nativo; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de robótica).
- Latencia y throughput: no disponibles en la información proporcionada; dependerá del hardware, la resolución de las cámaras y la frecuencia de control del robot.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_k6t_base_10 (este) | 51,7 M | ACT (imitation learning) | no disponible | Apache 2.0 | Hugging Face (LeRobot) |
| ACT original (paper 2304.13705) | no disponible | ACT | no disponible | no disponible | Paper/repositorio de referencia |
| Diffusion Policy | no disponible | Política por difusión | no disponible | no disponible | Implementaciones en LeRobot |
| VQ-BeT | no disponible | Política discretizada | no disponible | no disponible | Implementaciones en LeRobot |

No se dispone de datos de rendimiento comparativos en la información proporcionada; la comparación se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- Especialización estrecha: la política está entrenada únicamente sobre el dataset `k6_20_20261113_173939`; su generalización a otras tareas, objetos o entornos no está garantizada.
- Dependencia del hardware: el rendimiento puede degradarse si la configuración de cámaras, iluminación o robot difiere de la usada en la recogida de datos.
- Sin datos de evaluación publicados: no hay tasas de éxito ni benchmarks que permitan estimar su fiabilidad en producción.
- Riesgo de sobreajuste a las demostraciones: al ser un modelo pequeño entrenado con un dataset concreto, puede replicar sesgos de la teleoperación (velocidad, trayectorias, posiciones).
- Sin capacidades lingüísticas ni de razonamiento simbólico: no debe emplearse para tareas fuera del control motor.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; la validación en el entorno real es responsabilidad del integrador.
- Sin información sobre sesgos, seguridad física ni parada de emergencia: cualquier despliegue debe incorporar salvaguardas externas de seguridad robótica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k6t_base_10
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k6_20_20261113_173939
