# pjongb/omx_act_policy3

## Resumen

El modelo `pjongb/omx_act_policy3` es una política de control robótico basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales. Ha sido entrenado con el dataset `pjongb/pick_and_place2_2` y publicado mediante la librería LeRobot de Hugging Face, lo que permite reproducir el entrenamiento y la evaluación de forma estandarizada. Con 51,7 millones de parámetros, es un modelo compacto orientado a tareas de manipulación como pick-and-place, y su licencia Apache 2.0 facilita su uso comercial y académico.

La relevancia de este modelo reside en su aplicación directa en robótica de imitación: aprende de demostraciones teleoperadas y ejecuta políticas en robots reales como el brazo SO-100. Al estar integrado en el ecosistema LeRobot, ofrece una vía reproducible para entrenar, evaluar y desplegar políticas ACT sin necesidad de infraestructura masiva. Es un ejemplo representativo de cómo los transformers se aplican a problemas de control continuo, con una arquitectura que combina un codificador variacional condicional (CVAE) con un transformer para generar trayectorias coherentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con CVAE |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp32) |
| Idiomas soportados | no aplica (modelo de robotica, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que utiliza un transformer para predecir un chunk de acciones futuras (por ejemplo, 10 o 20 pasos) a partir de observaciones actuales. La arquitectura incorpora un CVAE (Conditional Variational Autoencoder) que modela la variabilidad de las demostraciones, permitiendo generar múltiples trayectorias válidas para una misma tarea. El entrenamiento se realiza con datos teleoperados, minimizando la pérdida de regresión entre las acciones predichas y las reales.

Los detalles específicos de entrenamiento de este modelo (número de tokens equivalentes, composición exacta del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada. Sin embargo, el dataset `pjongb/pick_and_place2_2` contiene demostraciones de tareas de pick-and-place, y el entrenamiento se ha llevado a cabo con LeRobot, que emplea una configuración estándar para políticas ACT: optimizador AdamW, tasa de aprendizaje típica de 1e-4 y normalización de observaciones y acciones. No se mencionan innovaciones adicionales como decodificación especulativa o atención lineal; la arquitectura sigue el diseño original del paper ACT (arxiv:2304.13705).

## Capacidades

- Control robótico por imitación: genera secuencias de acciones (chunks) para ejecutar tareas de manipulación, como pick-and-place, a partir de observaciones visuales y de estado.
- Generalización a partir de demostraciones: aprende de datos teleoperados y puede reproducir comportamientos con variabilidad, gracias al componente CVAE.
- Integración con LeRobot: compatible con el pipeline de entrenamiento, evaluación y despliegue de LeRobot, incluyendo robots como SO-100.
- No es un modelo de lenguaje: no procesa texto, no realiza razonamiento simbólico ni tiene capacidades de tool calling o agentes conversacionales.
- Multilingüismo: no aplica, al ser un modelo de control motor.

## Casos de uso

- Automatización de tareas de pick-and-place en líneas de montaje: el modelo puede controlar un brazo robótico para recoger objetos de una posición y colocarlos en otra, aprendiendo de demostraciones humanas. Es adecuado porque su arquitectura ACT predice secuencias de acciones coordinadas, reduciendo la necesidad de planificación explícita.
- Prototipado rápido de políticas robóticas en investigación: gracias a LeRobot, se puede entrenar y evaluar el modelo en entornos simulados o reales con pocas líneas de código, ideal para validar algoritmos de imitación.
- Robótica educativa y de bajo coste: al tener solo 51,7 millones de parámetros, puede ejecutarse en hardware modesto (GPU de consumo), lo que permite a laboratorios y universidades desplegar políticas de manipulación sin grandes inversiones.
- Control de brazos articulados tipo SO-100: el modelo está diseñado para este tipo de robots, por lo que puede integrarse directamente en configuraciones de bajo coste para tareas de enseñanza o demostración.
- Generación de datos de entrenamiento sintético: al ejecutar la política en simulación, se pueden generar nuevas trayectorias que sirvan para entrenar otros modelos o ampliar datasets.
- Evaluación de algoritmos de imitación: sirve como baseline para comparar nuevas variantes de ACT o métodos alternativos como Diffusion Policy, dado que su entrenamiento y evaluación están estandarizados en LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de tasas de éxito, métricas de precisión ni comparativas con otros modelos en tareas de manipulación.

## Requisitos de hardware

- VRAM estimada: al tener 51,7 millones de parámetros, el modelo en fp32 ocupa aproximadamente 207 MB (51,7M × 4 bytes). En fp16 sería la mitad (~103 MB). Por tanto, cualquier GPU con al menos 1 GB de VRAM puede ejecutar la inferencia sin problemas.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA (por ejemplo, NVIDIA GTX 1060 o superior). Para entrenamiento, una GPU con 8 GB de VRAM es suficiente para políticas ACT de este tamaño.
- Cabe en GPUs de consumo: sí, en prácticamente cualquier tarjeta gráfica actual, incluidas las de gama baja.
- Opciones de despliegue: LeRobot permite ejecutar la política en tiempo real con su API; también puede integrarse en ROS u otros frameworks robóticos. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada, pero dada la arquitectura (un transformer pequeño) y el tamaño, la inferencia en GPU debería ser del orden de milisegundos por chunk de acciones.

## Comparativa con modelos similares

Existen otros modelos con el mismo nombre `omx_act_policy` publicados por diferentes autores (dyjung-dev, polydj0, asd0821), todos basados en ACT y entrenados con LeRobot. No se dispone de datos de rendimiento comparativos ni de diferencias en parámetros. La comparativa se limita a la disponibilidad:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| pjongb/omx_act_policy3 | 51,7M | no disponible | Apache 2.0 | Hugging Face |
| dyjung-dev/omx_act_policy | no disponible | no disponible | no disponible | Hugging Face |
| polydj0/omx_act_policy | no disponible | no disponible | no disponible | Hugging Face |

No se han encontrado comparativas con modelos de la misma categoría (por ejemplo, Diffusion Policy) en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: al tratarse de un modelo entrenado con demostraciones teleoperadas, puede heredar sesgos del operador humano (por ejemplo, preferencias de trayectoria o velocidades de ejecución).
- Riesgo de alucinación: no aplica, ya que no genera texto; sin embargo, puede producir acciones no deseadas si las observaciones difieren del dominio de entrenamiento.
- Limitaciones de contexto y idioma: no aplica, pero el modelo está especializado en un único tipo de tarea (pick-and-place) y no generaliza a otras tareas de manipulación sin reentrenamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, pero no proporciona garantías. Es recomendable revisar los términos del dataset asociado.
- Caveats para producción: el modelo debe validarse en el robot físico real antes de su despliegue; la simulación no garantiza el rendimiento en el mundo real. Además, no hay información sobre robustez ante cambios de iluminación, posición de cámara o variaciones de objetos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pjongb/omx_act_policy3
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arxiv:2304.13705)
- LeRobot (librería de entrenamiento): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Dataset de entrenamiento: https://huggingface.co/datasets/pjongb/pick_and_place2_2
- Otros modelos similares: https://huggingface.co/dyjung-dev/omx_act_policy | https://huggingface.co/polydj0/omx_act_policy
