# caspar/smolvla_so101_multicolor_sim_rtx5090_20261118

## Resumen

SmolVLA SO-101 multicolor es un modelo de robótica basado en SmolVLA, desarrollado por el usuario caspar como un fine-tuning de `lerobot/smolvla_base`. Está especializado en una tarea concreta de manipulación: seleccionar cubos de color (rojo, verde y amarillo) presentes simultáneamente en la escena y colocarlos en una caja azul, siguiendo instrucciones en lenguaje natural que indican el color objetivo. El modelo se entrenó sobre 150 demostraciones scriptadas (25.800 fotogramas) del dataset `caspar/so101_multicolor_sim`.

Con 450 millones de parámetros, es un modelo compacto de imitation learning que combina percepción visual (dos cámaras: vista superior y muñeca) con instrucciones textuales para generar acciones de seis dimensiones. Su relevancia es acotada: se trata de un checkpoint experimental de simulación, sin evaluación de éxito en tarea ni split de validación, útil como referencia para reproducir pipelines de SmolVLA con LeRobot 0.6.1 sobre hardware consumer de gama alta (RTX 5090).

La licencia Apache 2.0 permite reutilización y modificación, pero la ausencia de métricas de rendimiento y de datos de generalización limita seriamente su uso en producción más allá del entorno simulado para el que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, fine-tuning de `lerobot/smolvla_base`) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones del dataset están en inglés, según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de `lerobot/smolvla_base` (revisión `5e8d12a6e2975b0e5e5fce7c8caf47c371d257b6`), un modelo vision-language-action de 450 millones de parámetros que procesa observaciones multimodales (imágenes de dos cámaras más instrucción textual) y emite acciones continuas de seis dimensiones. La entrada visual se mapea desde `observation.images.top` a `observation.images.camera1` y desde `observation.images.wrist` a `observation.images.camera2`; los preprocesadores guardados incluyen estadísticas de normalización y el renombrado de cámaras.

El entrenamiento se realizó sobre las 150 demostraciones exitosas (25.800 fotogramas) del dataset `caspar/so101_multicolor_sim` (revisión `1d47ca0df5c9b958acd005817fdb5bf6a1e42bd7`), durante 10.000 pasos con batch de 8 y semilla 1000, en una NVIDIA GeForce RTX 5090 con LeRobot 0.6.1. No se reservó split de validación ni se midió pérdida de validación o tasa de éxito en tarea. La verificación realizada consistió en recargar el checkpoint en CUDA y comprobar que las acciones de seis dimensiones eran finitas sobre observaciones del dataset para los tres colores.

## Capacidades

- Generación de acciones robóticas de seis dimensiones a partir de observaciones visuales (cámara superior y de muñeca) e instrucción textual.
- Seguimiento de instrucciones para seleccionar el cubo objetivo por color (rojo, verde, amarillo) y colocarlo en la caja azul.
- Percepción visual multi-cámara con renombrado y normalización integrados en los preprocesadores.
- Integración con el ecosistema LeRobot mediante `SmolVLAPolicy.from_pretrained` y `make_pre_post_processors`.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión general, audio ni modo thinking; es un modelo puramente orientado a control robótico.
- Capacidades multilingües: no disponibles; las instrucciones del dataset están en inglés.

## Casos de uso

- Reproducción de experimentos de imitation learning: sirve como punto de partida para replicar el pipeline de fine-tuning de SmolVLA con LeRobot 0.6.1 sobre una RTX 5090, usando la configuración y los logs incluidos en `training_run/`.
- Evaluación de robustez en simulación multi-objeto: permite estudiar cómo un modelo pequeño (450 M de parámetros) resuelve una tarea con tres objetos de distinto color en escena y desambiguación por instrucción.
- Base para fine-tuning en tareas de pick-and-place: al derivar de `lerobot/smolvla_base`, puede reentrenarse con nuevos datasets de demostraciones para otras tareas de manipulación con el brazo SO-101.
- Benchmark interno de infraestructura: útil para medir tiempos de entrenamiento y de inferencia de SmolVLA en GPUs consumer de gama alta (RTX 5090) dentro de un pipeline LeRobot.
- Docencia y divulgación: ejemplo compacto y de licencia permisiva para explicar el flujo completo de un modelo vision-language-action (dataset, entrenamiento, preprocesadores, verificación de acciones).
- Pruebas de integración de LeRobot: valida el uso de `SmolVLAPolicy.from_pretrained` y `make_pre_post_processors` junto con el renombrado de cámaras en un caso real.
- No se recomienda su uso en robótica física ni en producción sin una evaluación previa de tasa de éxito, ya que no se midió rendimiento fuera del dataset de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se midió pérdida de validación ni tasa de éxito en tarea, y que la única verificación fue comprobar acciones finitas de seis dimensiones sobre observaciones del propio dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 M de parámetros en safetensors (repo de 0,9 GB) el peso en FP32 ronda 1,8 GB y en FP16/BF16 unos 0,9 GB, a lo que hay que sumar el encoder visual y los buffers de preprocesado.
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA GeForce RTX 5090; para inferencia basta una GPU consumer moderna con suficiente VRAM para el modelo y las dos cámaras.
- Cabe en GPU consumer: sí, por tamaño de parámetros; no se especifican requisitos mínimos oficiales.
- Opciones de despliegue: LeRobot (`SmolVLAPolicy.from_pretrained` + `make_pre_post_processors`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| caspar/smolvla_so101_multicolor_sim_rtx5090_20261118 | 450 M | no disponible | Manipulación SO-101 (3 colores, simulación) | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible en la información | no disponible | Vision-language-action general (base) | no disponible en la información | Hugging Face |
| Otros fine-tunings de SmolVLA | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este checkpoint con alternativas de la misma categoría.

## Limitaciones y advertencias

- No se midió tasa de éxito en tarea ni pérdida de validación; el rendimiento real es desconocido.
- No existe split de validación: el modelo se entrenó y verificó sobre el mismo conjunto de datos, lo que impide estimar generalización.
- Entrenado exclusivamente en simulación (`so101_multicolor_sim`); no hay evidencia de transferencia a un robot físico SO-101.
- Tarea muy restringida: tres colores de cubo y una caja azul; no se documenta comportamiento ante objetos, colores o instrucciones fuera de distribución.
- Las instrucciones del dataset están en inglés; no se declaran capacidades multilingües.
- Riesgo de sobreajuste a las 150 demostraciones scriptadas y a las condiciones de iluminación, cámara y posiciones del simulador.
- Sin datos sobre sesgos; al ser un modelo de control robótico, el riesgo principal es de fallo de ejecución, no de generación de texto.
- Licencia Apache 2.0: permite uso comercial y modificación, pero no hay garantías ni evaluación que respalde su uso en producción.
- El autor no proporciona información sobre cuantizaciones ni requisitos mínimos de hardware.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/caspar/smolvla_so101_multicolor_sim_rtx5090_20261118
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/caspar/so101_multicolor_sim
- Repositorio de configuración y logs: carpeta `training_run/` dentro del repositorio del modelo
- LeRobot (librería): https://github.com/huggingface/lerobot
- No se han encontrado papers, blogs ni demos adicionales en la búsqueda web; los resultados devueltos corresponden a una empresa de estores no relacionada con el modelo.
