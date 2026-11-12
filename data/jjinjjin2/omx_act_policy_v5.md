# JJinJJin2/omx_act_policy_v5

## Resumen

`omx_act_policy_v5` es una política de imitación para robótica basada en ACT (Action Chunking with Transformers), publicada por el usuario JJinJJin2 en Hugging Face bajo la librería LeRobot. El modelo aprende de datos de teleoperación y predice trozos cortos de acciones (*action chunks*) en lugar de pasos individuales, un enfoque que el paper original de ACT (arXiv:2304.13705) asocia con tasas de éxito elevadas en tareas manipulativas.

Se trata de un checkpoint de tamaño reducido (51.668.614 parámetros, unos 0,2 GB en el repositorio) entrenado específicamente sobre el dataset `JJinJJin2/pick_and_place_v3`, por lo que su ámbito de aplicación es una tarea concreta de *pick and place* y no un modelo de propósito general. La relevancia es práctica: ejemplifica el flujo actual de entrenamiento de políticas robóticas con LeRobot, reproducible con pocos comandos y desplegable en hardware de consumo.

Al estar etiquetado con `pipeline_tag: robotics` y licencia Apache 2.0, es un punto de partida útil para quienes quieran replicar el pipeline de ACT, adaptarlo a su propio robot (por ejemplo, un SO-100) o comparar metodologías de imitación en entornos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de imitación, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin variantes cuantizadas publicadas) |
| Idiomas soportados | no disponible (no aplica: modelo de robótica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un *backbone* visual (codificador de imágenes de la escena) con un transformer que genera secuencias de acciones en forma de *chunks*. En lugar de predecir una única acción por paso, el modelo emite un bloque de acciones futuras, lo que reduce el error de acumulación y suaviza la ejecución en el robot. El paper original introduce además el *temporal ensembling*, que agrega predicciones solapadas de chunks consecutivos para mejorar la estabilidad.

El entrenamiento se realizó con LeRobot sobre el dataset `JJinJJin2/pick_and_place_v3`, compuesto por episodios de teleoperación de una tarea de recogida y colocación. No se dispone de información sobre el número de episodios, la composición exacta del dataset ni si se aplicaron técnicas de aumento de datos. Tampoco se documenta el uso de RLHF/DPO, algo que no aplica a este tipo de políticas. El checkpoint fue creado y actualizado el 2026-11-12 y no registra descargas ni *likes* en el momento de la consulta.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones articulares a partir de observaciones visuales y del estado del robot.
- Predicción de *action chunks*: emite bloques de acciones que se ejecutan de forma continua, reduciendo la latencia de decisión y el ruido paso a paso.
- Aprendizaje a partir de teleoperación: el pipeline de LeRobot permite grabar demostraciones y reentrenar la política con el mismo formato de datos.
- Integración con LeRobot: entrenamiento (`lerobot-train`) y evaluación (`lerobot-record`) mediante CLI, con soporte para `so100_follower`.
- Compatibilidad con hardware de bajo coste: el tamaño del modelo (51,7 M de parámetros) permite inferencia en GPU de consumo e incluso en CPU para pruebas.
- No soporta *tool calling*, agentes multi-paso, razonamiento en lenguaje natural ni capacidades multilingües: es una política visuomotora, no un modelo generativo de texto.

## Casos de uso

- Automatización de *pick and place* en laboratorio: la política está entrenada para esta tarea concreta y puede ejecutarse sobre un brazo SO-100 para recoger y colocar objetos en posiciones predefinidas, sirviendo como base para experimentos de manipulación.
- Réplica del pipeline de ACT: investigadores que quieran validar el flujo completo de LeRobot (grabación de datos, entrenamiento, evaluación) pueden usar este checkpoint como referencia y sustituir el dataset por el suyo.
- *Fine-tuning* con datos propios: al ser un modelo pequeño y con licencia Apache 2.0, es viable reentrenarlo con un dataset reducido de teleoperación para una nueva tarea de manipulación.
- Prototipado en robótica educativa: su reducido tamaño permite desplegarlo en estaciones de trabajo con GPU de gama media, lo que facilita prácticas docentes sobre aprendizaje por imitación.
- Evaluación comparativa de métodos de imitación: sirve como línea base ACT frente a otras políticas (Diffusion Policy, VQ-BeT) en el mismo entorno y dataset.
- Despliegue en entornos de investigación con hardware limitado: la inferencia en CPU es viable para pruebas de concepto, aunque la latencia será mayor que en GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 51,7 M de parámetros; en la práctica, el consumo lo dominan el codificador visual y el *batch* de imágenes, por lo que se recomienda al menos 2-4 GB de VRAM para trabajar con comodidad.
- GPU recomendadas: cualquier GPU con soporte CUDA, desde una RTX 3060 o RTX 4090 hasta A100/H100; para este tamaño no se necesita hardware de centro de datos.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna (GTX 1660 en adelante) e incluso en CPU para evaluación.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), PyTorch nativo; no se documentan integraciones con vLLM, TGI, llama.cpp u Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán de la GPU, la resolución de las cámaras y la frecuencia de control del robot.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| omx_act_policy_v5 (ACT) | 51,7 M | no aplica | no disponible | Apache 2.0 | Hugging Face (LeRobot) |
| Diffusion Policy | no disponible | no aplica | no disponible | MIT (repo original) | Repositorio oficial y variantes en LeRobot |
| VQ-BeT | no disponible | no aplica | no disponible | MIT (repo original) | Repositorio oficial y variantes en LeRobot |

No se dispone de datos comparativos de rendimiento entre estas políticas en la información proporcionada; la comparación se limita a la disponibilidad y licencia.

## Limitaciones y advertencias

- Especialización extrema: entrenado solo para la tarea `pick_and_place_v3`; no generaliza a otras tareas sin reentrenamiento.
- Sin datos de evaluación publicados: no hay métricas de tasa de éxito ni de robustez ante cambios de iluminación, posición de objetos o fondo.
- Riesgo de sobreajuste al entorno de grabación: la política puede fallar si las condiciones visuales difieren de las del dataset de teleoperación.
- Sin información sobre sesgos: no aplica el concepto de sesgo lingüístico, pero sí el de sesgo de distribución en los datos de demostración.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías sobre el comportamiento del modelo en producción.
- Sin soporte multilingüe ni de texto: no debe emplearse como modelo de lenguaje ni en tareas de razonamiento simbólico.
- Repositorio sin adopción: 0 descargas y 0 *likes* en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.

## Enlaces

- [Hugging Face: JJinJJin2/omx_act_policy_v5](https://huggingface.co/JJinJJin2/omx_act_policy_v5)
- [Paper ACT (arXiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Repositorio LeRobot en GitHub](https://github.com/huggingface/lerobot)
- [Guía de entrenamiento de políticas en LeRobot](https://huggingface.co/docs/lerobot/il_robots#train-a-policy)
- [Dataset JJinJJin2/pick_and_place_v3](https://huggingface.co/datasets/JJinJJin2/pick_and_place_v3)
