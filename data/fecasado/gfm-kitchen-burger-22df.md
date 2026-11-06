# fecasado/gfm-kitchen-burger-22dF

## Resumen

`gfm-kitchen-burger-22dF` es una política robótica (no un modelo de lenguaje) entrenada con LeRobot y publicada por el usuario fecasado en Hugging Face. Implementa el tipo de política `gaze_flow_matching`, una variante de flow matching orientada a la generación de acciones motrices a partir de observaciones visuales, y está especializada en una única tarea de manipulación: trasladar una hamburguesa a un plato en un entorno de cocina. El checkpoint contiene 75.248.330 parámetros en formato safetensors y ocupa aproximadamente 0,3 GB en el repositorio.

El modelo se ha entrenado sobre el dataset `fecasado/burger-to-plate-v2-320x240`, con observaciones a resolución 320x240, y se distribuye bajo licencia Apache 2.0. Su relevancia es acotada: no compite con modelos fundacionales de robótica, sino que sirve como ejemplo reproducible de un pipeline de imitation learning de extremo a extremo con LeRobot, desde la captura de demostraciones hasta el despliegue en un robot tipo SO-100.

La model card es prácticamente una plantilla sin completar (incluye el texto literal "Model type not recognized — please update this template"), por lo que la mayor parte de los detalles técnicos —composición del dataset, hiperparámetros, número de episodios, resultados de evaluación— no están documentados por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de imitación `gaze_flow_matching` (flow matching sobre observaciones visuales), implementada en LeRobot |
| Parámetros totales | 75.248.330 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible (pesos en safetensors, presumiblemente fp32/fp16; no se documenta) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio LeRobot, ~0,3 GB) |

## Arquitectura y entrenamiento

La política pertenece a la familia `gaze_flow_matching`, un esquema de flow matching condicionado por observaciones (imágenes de una cámara y, presumiblemente, estado del robot) que genera trayectorias de acciones de forma iterativa. LeRobot la integra como tipo de política entrenable mediante `lerobot-train`, aunque la model card solo documenta el ejemplo con `--policy.type=act`, lo que impide confirmar los detalles exactos de la implementación de `gaze_flow_matching` a partir de la información disponible.

El entrenamiento se realizó sobre el dataset `fecasado/burger-to-plate-v2-320x240` (y, según los resultados de búsqueda, existe una variante `burger-to-plate-good-320x240`). No se especifican el número de episodios de demostración, el número de tokens o pasos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de aumento de datos. Tampoco hay información sobre el robot empleado más allá de la referencia a `so100_follower` en los comandos de evaluación de la plantilla.

## Capacidades

- Generación de acciones de manipulación robótica para una tarea concreta: coger una hamburguesa y depositarla en un plato.
- Control visomotor a partir de observaciones de cámara a resolución 320x240.
- Integración con el ecosistema LeRobot: entrenamiento con `lerobot-train`, evaluación y despliegue con `lerobot-record`.
- Ejecución en robots tipo SO-100 follower (según los comandos de ejemplo de la model card).
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, código, matemáticas, visión general, audio ni capacidades multilingües.
- No dispone de modo "thinking" ni de API conversacional.

## Casos de uso

- Reproducción de un pipeline de imitation learning: sirve como referencia completa para entrenar una política con LeRobot partiendo de un dataset propio y desplegarla en un robot de bajo coste.
- Investigación en flow matching aplicado a robótica: permite estudiar el comportamiento de una política `gaze_flow_matching` en una tarea de pick-and-place acotada y comparar con políticas ACT sobre el mismo dataset.
- Docencia y prototipado en laboratorio: tarea de manipulación sencilla y visualmente verificable (hamburguesa a plato) adecuada para prácticas de robótica con SO-100.
- Evaluación de robustez visomotora: al estar entrenada a 320x240, permite analizar la sensibilidad a cambios de iluminación, posición de la hamburguesa y del plato en un entorno de cocina controlado.
- Punto de partida para fine-tuning: el checkpoint puede reentrenarse sobre datasets propios de tareas similares de manipulación de alimentos u objetos.
- Benchmark interno de latencia y throughput: al ser un modelo pequeño (75 M de parámetros), es útil para medir el coste de inferencia de políticas de flow matching en GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de éxito de la tarea, tasas de acierto, curvas de entrenamiento ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 75,2 M de parámetros en fp32 el peso de los tensores ronda los 0,3 GB, por lo que la inferencia cabe holgadamente en cualquier GPU con 4 GB o más, incluyendo GPUs integradas y placas como Jetson.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 3060/4060 o superior es más que suficiente, y también una Jetson Orin para despliegue embebido en el robot.
- Cabe en GPU de consumo: sí, con amplio margen.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path` apuntando al checkpoint), tanto en local como desde el Hub. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo de política | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fecasado/gfm-kitchen-burger-22dF | gaze_flow_matching | 75,2 M | no aplica | Apache 2.0 | Hugging Face (34 descargas) |
| fecasado/gfm-kitchen-burger-22dN | gaze_flow_matching | no disponible | no aplica | no disponible en la información | Hugging Face |
| Políticas ACT de LeRobot | ACT (action chunking transformer) | no disponible | no aplica | según checkpoint | Hugging Face / LeRobot |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas; la comparación se limita a tipo de política, licencia y disponibilidad.

## Limitaciones y advertencias

- Model card incompleta: contiene la plantilla sin rellenar y referencias a `--policy.type=act`, lo que genera ambigüedad sobre la configuración real de entrenamiento.
- Especialización extrema: la política está entrenada para una única tarea (hamburguesa a plato) y no generaliza a otras tareas sin reentrenamiento.
- Sin métricas de evaluación publicadas: no hay evidencia documentada de tasa de éxito ni de robustez.
- Riesgo de sobreajuste al entorno de captura: cambios en la cámara, la iluminación, la mesa o la posición inicial de los objetos pueden degradar el comportamiento.
- Sin información sobre sesgos: no se documenta la diversidad de demostraciones ni posibles sesgos en la política.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- No apta para producción fuera del dominio entrenado: requiere validación exhaustiva en el robot y entorno reales antes de cualquier despliegue.
- Idiomas: no aplica, pero conviene señalar que no procesa instrucciones en lenguaje natural.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fecasado/gfm-kitchen-burger-22dF
- Variante relacionada: https://huggingface.co/fecasado/gfm-kitchen-burger-22dN
- Dataset de entrenamiento: https://huggingface.co/datasets/fecasado/burger-to-plate-v2-320x240
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
