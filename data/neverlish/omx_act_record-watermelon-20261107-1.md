# neverlish/omx_act_record-watermelon-20261107-1

## Resumen

El modelo `omx_act_record-watermelon-20261107-1` es una política de imitación para robótica entrenada con el método Action Chunking with Transformers (ACT), publicado por el usuario neverlish en Hugging Face. ACT es un método de aprendizaje por imitación que, en lugar de predecir una única acción por paso de tiempo, predice fragmentos cortos de acciones (action chunks), lo que reduce el error acumulado y suele lograr tasas de éxito altas en tareas de manipulación a partir de datos de teleoperación.

El modelo tiene 51.668.614 parámetros (unos 51,7 millones) y se distribuye en formato safetensors con un tamaño de repositorio de 0,2 GB. Está etiquetado con la librería LeRobot, el pipeline `robotics` y la licencia Apache 2.0. Fue entrenado sobre el dataset `neverlish/record-watermelon-20261107-1`, presumiblemente una grabación de teleoperación de una tarea concreta (manipulación de una sandía) con un robot seguidor tipo SO-100.

Su relevancia es la de un artefacto de referencia para el ecosistema LeRobot: sirve como ejemplo reproducible de entrenamiento de una política ACT de pequeño tamaño que puede ejecutarse en hardware modesto. No es un modelo de lenguaje ni un modelo fundacional generalista; es una política específica de tarea, por lo que sus capacidades quedan acotadas al entorno y a los datos con los que fue entrenada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de imitación; no aplica ventana de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de acciones individuales. La arquitectura típica de ACT combina un codificador visual (normalmente un ResNet preentrenado) que procesa las imágenes de las cámaras del robot, un codificador de estado que procesa las observaciones propioceptivas y un decodificador transformer que genera el chunk de acciones. El modelo se entrena con datos de teleoperación, minimizando el error entre las acciones predichas y las demostradas, habitualmente con una pérdida L1 sobre las acciones y, en algunas variantes, con un término de reconstrucción de imagen.

En este caso concreto, el entrenamiento se realizó con LeRobot sobre el dataset `neverlish/record-watermelon-20261107-1`. No se dispone de información sobre el número de episodios, el número de tokens o muestras de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de aumento de datos o regularización específicas. La model card no detalla hiperparámetros, duración del entrenamiento ni configuración de las cámaras más allá de lo que se deduce del ecosistema LeRobot. No hay evidencia de RLHF, DPO ni ajuste por preferencias, algo esperable en una política de imitación.

## Capacidades

- Predicción de acciones robóticas en forma de chunks a partir de observaciones visuales y propioceptivas.
- Control de un robot seguidor (el ejemplo de la model card usa `so100_follower`) en tareas de manipulación aprendidas por imitación.
- Ejecución de políticas entrenadas con LeRobot mediante `lerobot-record` para evaluación e inferencia.
- Aprendizaje a partir de datasets de teleoperación almacenados en el Hub.
- No dispone de generación de texto, razonamiento lingüístico, código, matemáticas ni visión generalista.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües.
- No dispone de modo thinking, audio ni otras capacidades especiales.

## Casos de uso

- Manipulación de objetos en entorno de laboratorio: la política puede ejecutar la tarea de recogida o manipulación de una sandía aprendida del dataset de teleoperación, siempre que el entorno físico y la configuración de cámaras coincidan con los del entrenamiento.
- Reproducción de experimentos de imitation learning: sirve como punto de partida para comparar variantes de ACT, cambios en el dataset o configuraciones de cámara dentro de un mismo robot.
- Evaluación de pipelines LeRobot: útil para validar el flujo completo de `lerobot-train` y `lerobot-record` antes de escalar a datasets mayores o tareas más complejas.
- Docencia y formación en robótica: ejemplo compacto (51,7 M de parámetros) para ilustrar el ciclo completo de teleoperación, entrenamiento y despliegue de una política.
- Benchmark interno de hardware: al ser un modelo pequeño, permite medir latencia de inferencia y throughput en GPUs de gama baja antes de invertir en políticas mayores.
- Prototipado de tareas pick-and-place: la política puede adaptarse mediante fine-tuning a variantes de la misma tarea (distinta posición inicial, iluminación o tipo de objeto) si se recogen nuevos episodios.
- Base para comparativas de métodos de imitación: confrontar ACT con alternativas como Diffusion Policy o VQ-BeT sobre el mismo dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 51,7 M de parámetros en safetensors (aproximadamente 0,2 GB en FP32), la inferencia cabe holgadamente en GPUs con 4-8 GB de VRAM, incluyendo el codificador visual y los buffers intermedios.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA, desde una RTX 3060 en adelante; para entrenamiento se recomienda al menos una RTX 3090 o A100 si se amplía el dataset.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: LeRobot (`lerobot-record`, `lerobot-train`) con backend PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán de la GPU, del número de cámaras y de la frecuencia de control del robot.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| omx_act_record-watermelon-20261107-1 | 51,7 M | no aplica | no disponible | Apache 2.0 | Hugging Face |
| neverlish/omx_act_record-test-20261102-1 | 51,7 M | no aplica | no disponible | no disponible | Hugging Face |
| Diffusion Policy (referencia) | variable | no aplica | no disponible | MIT (implementación de referencia) | Repositorios públicos |
| VQ-BeT (referencia) | variable | no aplica | no disponible | no disponible | Repositorios públicos |

La comparación con Diffusion Policy y VQ-BeT es cualitativa: son métodos alternativos de imitation learning para robótica, pero no se dispone de resultados numéricos comparables sobre el mismo dataset en la información proporcionada.

## Limitaciones y advertencias

- Política específica de tarea: solo es válida para la tarea y el entorno del dataset `record-watermelon-20261107-1`; fuera de ese contexto su comportamiento no está garantizado.
- Sensible a cambios de dominio: variaciones en iluminación, posición de cámara, fondo o tipo de objeto pueden degradar drásticamente el rendimiento.
- Sin datos de evaluación publicados: no hay métricas de tasa de éxito, número de episodios ni curvas de entrenamiento en la model card.
- Riesgo de sobreajuste al operador: al entrenarse con teleoperación de un único operador, puede reproducir sesgos de estilo de movimiento.
- Sin capacidades lingüísticas ni de razonamiento general: no debe emplearse como sustituto de un LLM.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías sobre el rendimiento en producción.
- Ausencia de información sobre sesgos: no se documentan análisis de sesgo, robustez ni seguridad física del robot.
- Requiere hardware robótico compatible (por ejemplo, SO-100 follower) y una configuración de cámaras coherente con la del entrenamiento.
- El modelo fue creado en 2026-11-07 y no cuenta con descargas ni likes, por lo que no hay validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/neverlish/omx_act_record-watermelon-20261107-1
- Dataset de entrenamiento: https://huggingface.co/datasets/neverlish/record-watermelon-20261107-1
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Modelo relacionado del mismo autor: https://huggingface.co/neverlish/omx_act_record-test-20261102-1
- Dataset relacionado del mismo autor: https://huggingface.co/datasets/neverlish/record-test-20261102-1
