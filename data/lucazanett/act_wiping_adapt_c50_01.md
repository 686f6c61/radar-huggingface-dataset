# lucazanett/act_wiping_adapt_c50_01

## Resumen

`lucazanett/act_wiping_adapt_c50_01` es una política de imitación para robótica basada en ACT (Action Chunking with Transformers), el método presentado en el paper arXiv:2304.13705. El modelo ha sido entrenado y publicado con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica, y está pensado para ejecutar tareas de manipulación —en concreto, una tarea de limpieza o wiping— sobre un robot tipo SO-100 follower. No es un modelo de lenguaje: es un policy que mapea observaciones visuales y de estado del robot a secuencias de acciones motoras.

El checkpoint contiene 51.632.779 parámetros en formato safetensors y ocupa 0,2 GB en el repositorio. La nomenclatura del identificador (`adapt_c50`) sugiere una variante adaptativa con chunking de 50 pasos, aunque el autor no documenta ese detalle en la model card. El modelo se entrenó sobre el dataset `lucazanett/new_setup_wiping_adaptive_01` y se distribuye con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia es acotada pero concreta: sirve como ejemplo reproducible de un pipeline completo de LeRobot (entrenamiento con `lerobot-train`, evaluación con `lerobot-record`) para una tarea de wiping, y como punto de partida para quien quiera adaptar ACT a un setup físico similar. No hay métricas publicadas ni descargas registradas, por lo que debe tratarse como un artefacto experimental más que como un modelo validado en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.632.779 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: política de imitación, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | LeRobot |
| Pipeline | robotics |
| Dataset de entrenamiento | lucazanett/new_setup_wiping_adaptive_01 |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice chunks de acciones (secuencias cortas de comandos motores) en lugar de un único paso por inferencia. La arquitectura combina un backbone transformer con un encoder de observaciones (típicamente imágenes de cámaras y estado de las articulaciones) y un decoder que genera el chunk de acciones. El paper original (arXiv:2304.13705) describe también una técnica de temporal ensembling para suavizar las predicciones entre chunks consecutivos, aunque la model card no confirma si esta variante la emplea.

El entrenamiento se realizó con `lerobot-train` sobre el dataset `new_setup_wiping_adaptive_01`, que contiene demostraciones teleoperadas de la tarea de wiping. No se especifican en la información disponible el número de episodios, la composición exacta del dataset, la resolución de las cámaras, la frecuencia de control ni si se aplicaron aumentos de datos. Tampoco se documenta si hubo ajuste fino adicional, RLHF/DPO (no aplicable en este dominio) o variantes de pérdida respecto al ACT canónico. El sufijo `c50` del identificador sugiere un chunk size de 50, pero es una inferencia a partir del nombre, no un dato confirmado por el autor.

## Capacidades

- Control motor por imitación: genera secuencias de acciones articulares para un robot SO-100 follower a partir de observaciones visuales y de estado.
- Predicción por chunks: emite bloques de acciones en lugar de pasos individuales, lo que reduce el error acumulado y la frecuencia de inferencia necesaria.
- Ejecución de una tarea específica de wiping sobre un setup físico concreto (el del dataset de entrenamiento).
- Integración con el ecosistema LeRobot: entrenamiento, evaluación y despliegue mediante los comandos `lerobot-train` y `lerobot-record`.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, generación de texto, visión general, audio ni capacidades multilingües: es una política robótica, no un modelo fundacional.

## Casos de uso

- Reproducción de la tarea de wiping en un SO-100 follower: el modelo se carga con `--policy.path` en `lerobot-record` y se ejecuta sobre el robot para replicar la tarea aprendida, siempre que el setup físico coincida con el del dataset de entrenamiento.
- Punto de partida para ajuste fino en tareas de limpieza similares: sirve como checkpoint inicial para reentrenar con un dataset propio de wiping, reduciendo el tiempo de convergencia frente a entrenar desde cero.
- Benchmark interno de pipelines LeRobot: útil para validar que la cadena de entrenamiento, registro y evaluación funciona de extremo a extremo en una instalación nueva.
- Docencia y demostraciones de aprendizaje por imitación: ejemplo compacto (0,2 GB, 51,6 M de parámetros) para ilustrar cómo ACT transforma demostraciones teleoperadas en políticas ejecutables.
- Comparación de variantes ACT: al existir otras políticas ACT en el Hub, este checkpoint permite contrastar configuraciones (chunk size, dataset, setup) en condiciones controladas.
- Prototipado de automatización de superficies: en entornos de laboratorio, se puede evaluar la viabilidad de sustituir una tarea manual de limpieza por una política aprendida antes de invertir en un dataset mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, número de episodios de evaluación ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 0,2 GB en safetensors; con overhead de activaciones y cámaras, cabe holgadamente en GPUs de 4-8 GB.
- GPU recomendadas: cualquier GPU con CUDA de gama media o superior (RTX 3060, RTX 4090, A100, H100). Para entrenamiento desde cero se recomienda al menos una RTX 3090 o superior, aunque no hay datos publicados de tiempos.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs consumer modernas con al menos 4 GB de VRAM.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), integración con el stack de Hugging Face; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas robóticas.
- Latencia y throughput: no disponibles. Dependen del hardware, de la resolución de las cámaras y del chunk size efectivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_wiping_adapt_c50_01 (este) | 51,6 M | no aplica | no publicado | Apache 2.0 | Hugging Face (0 descargas) |
| Otras políticas ACT en LeRobot Hub | variable (típicamente 40-80 M) | no aplica | variable, rara vez publicado | habitualmente Apache 2.0 | Hugging Face |
| Diffusion Policy (LeRobot) | variable | no aplica | no comparable sin datos | habitualmente Apache 2.0 | Hugging Face |
| π0 / π0.5 (Physical Intelligence) | varios miles de millones | no aplica | publicado en papers propios | licencia propia | Hugging Face / web |

La comparación cuantitativa con alternativas concretas no está disponible: no hay métricas publicadas para este checkpoint ni un conjunto de evaluación común. La comparación debe hacerse por categoría (políticas de imitación para manipulación) y no por rendimiento medido.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea (wiping) y un único setup; no generaliza a otras tareas ni a configuraciones de robot distintas sin reentrenamiento.
- Sin métricas publicadas: no hay tasas de éxito, número de episodios de evaluación ni análisis de fallos, por lo que no se puede afirmar que el modelo funcione de forma fiable.
- Dependencia del dataset: el comportamiento queda determinado por `new_setup_wiping_adaptive_01`; sesgos en las demostraciones (posiciones, velocidades, superficies) se transfieren a la política.
- Riesgo de sobreajuste al entorno: cambios de iluminación, fondo, posición inicial del robot o tipo de superficie pueden degradar el rendimiento de forma no documentada.
- Sin capacidades de lenguaje ni razonamiento simbólico: no admite instrucciones en lenguaje natural ni planificación multi-paso.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad de validación en producción recae en el integrador.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.
- Advertencia de seguridad física: al controlar un robot real, deben implementarse límites de par, paradas de emergencia y supervisión humana durante la evaluación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lucazanett/act_wiping_adapt_c50_01
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/lucazanett/new_setup_wiping_adaptive_01
