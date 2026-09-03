# fecasado/gfm-cubes-21c

## Resumen

El modelo `fecasado/gfm-cubes-21c` es una política de control robótico entrenada con el framework LeRobot de Hugging Face. Su nombre sugiere que emplea *gaze flow matching*, una variante de los modelos de *flow matching* aplicada al seguimiento de la mirada (gaze) para guiar la manipulación. El dataset asociado, `fecasado/Ncubes-to-Nbaskets-320x240`, indica que la tarea consiste en mover cubos a cestas usando imágenes de 320x240 píxeles, probablemente con un brazo robótico tipo SO-100.

Con 75,2 millones de parámetros, es un modelo compacto, diseñado para ejecutarse en tiempo real en hardware de gama media. Publicado bajo licencia Apache-2.0, permite uso comercial y modificación sin restricciones. Su relevancia radica en ser un ejemplo de política de imitación (imitation learning) entrenada con *flow matching*, una alternativa moderna a los métodos basados en *transformers* o *diffusion* para control robótico.

La información pública es limitada: la model card es la plantilla genérica de LeRobot y no se han publicado detalles sobre arquitectura interna, datos de entrenamiento o benchmarks. Esta ficha se basa únicamente en los metadatos disponibles y en inferencias razonables a partir del nombre y del dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere *gaze flow matching*, probablemente una red neuronal con *flow matching* para acciones de control) |
| Parametros totales | 75.265.498 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de robótica, no procesa texto) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors, sin cuantizaciones oficiales) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se han publicado detalles oficiales sobre la arquitectura interna. El nombre `gaze_flow_matching` y el tag `flow-matching` (presente en modelos hermanos como `gfm-cubes-22b`) indican que la política se basa en *flow matching*, una técnica generativa que modela la transformación de una distribución ruidosa a una distribución de acciones mediante un flujo continuo. En robótica, este enfoque se usa para generar trayectorias de control condicionadas a observaciones (imágenes, estados del robot).

El entrenamiento se realizó con LeRobot, el framework de Hugging Face para *imitation learning* y *reinforcement learning* en robótica. El dataset `Ncubes-to-Nbaskets-320x240` sugiere que las observaciones son imágenes RGB de 320x240 píxeles y que la tarea consiste en manipular cubos para colocarlos en cestas. No se dispone de información sobre el número de episodios, la composición exacta del dataset ni si se aplicaron técnicas como RLHF o DPO (poco habituales en robótica). Tampoco se documentan innovaciones técnicas específicas más allá del uso de *flow matching*.

## Capacidades

- Control robótico de manipulación: genera acciones de control (posiciones de articulaciones o comandos de efector final) a partir de observaciones visuales.
- Seguimiento de mirada (gaze): según el nombre, integra información de la mirada (probablemente del operador humano o de un sistema de visión) para condicionar la política.
- Aprendizaje por imitación: la política se entrena para replicar demostraciones humanas, lo que permite transferir habilidades de manipulación.
- Procesamiento de imágenes de baja resolución (320x240), adecuado para robots con cámaras económicas.
- Ejecución en tiempo real: con 75M de parámetros, es lo suficientemente ligero para inferencia en GPUs de consumo o incluso en dispositivos embebidos con aceleración.

No se han documentado capacidades de lenguaje, tool calling, agentes o razonamiento multi-paso, ya que no es un modelo de lenguaje.

## Casos de uso

- Manipulación de objetos en entornos de laboratorio: el modelo puede controlar un brazo robótico para recoger cubos y colocarlos en cestas, una tarea típica de *pick-and-place*.
- Investigación en *imitation learning*: sirve como punto de partida para estudiar *flow matching* aplicado a políticas robóticas, comparando con métodos basados en *diffusion* o *transformers*.
- Desarrollo de sistemas de teleoperación con guiado por mirada: al integrar *gaze*, podría usarse en entornos donde un operador humano indica visualmente el objetivo y el robot ejecuta la acción.
- Evaluación de LeRobot: es un ejemplo de política entrenada y publicada con este framework, útil para validar pipelines de entrenamiento y evaluación.
- Prototipado de robots de bajo coste: al requerir solo imágenes de 320x240 y tener 75M de parámetros, puede desplegarse en robots con hardware modesto (por ejemplo, un SO-100 con una GPU Jetson).
- Benchmarking de políticas de control: puede utilizarse como referencia para comparar el rendimiento de otras políticas en la misma tarea (mover cubos a cestas).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de éxito en tareas, precisión de manipulación, latencia ni throughput. El autor no ha incluido métricas en la model card ni en los resultados de búsqueda.

## Requisitos de hardware

- VRAM estimada: con 75,2M de parámetros, en FP32 el modelo ocupa aproximadamente 300 MB; en FP16, unos 150 MB. La inferencia puede ejecutarse en GPUs con al menos 2 GB de VRAM, aunque el uso real depende del tamaño del lote y de la resolución de entrada.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA (por ejemplo, NVIDIA GTX 1650, RTX 3060, RTX 4090) o incluso una Jetson Orin Nano para despliegue embebido.
- Compatibilidad con GPU de consumo: sí, cabe en prácticamente cualquier GPU consumer actual.
- Opciones de despliegue: LeRobot proporciona scripts de inferencia y evaluación (`lerobot-record`). También puede integrarse con ROS o frameworks de robótica, aunque no se documenta soporte para vLLM, llama.cpp u Ollama (no aplicable a modelos de robótica).
- Latencia y throughput: no disponibles. Dado el tamaño, se espera una latencia de pocos milisegundos por paso en una GPU moderna, pero no hay mediciones oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas robóticas con *flow matching* y gaze). El autor tiene otros modelos similares (`gfm-cubes-22b`, `gact-cubes-21c`), pero no se han publicado comparativas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado, pero al ser un modelo entrenado en una tarea específica (cubos a cestas), su generalización a otras tareas o entornos es limitada.
- Riesgo de alucinación: no aplica en el sentido de modelos de lenguaje, pero la política puede generar acciones incorrectas si las observaciones difieren del dominio de entrenamiento.
- Limitaciones de contexto o idioma: no procesa texto; su entrada son imágenes y posiblemente estados del robot.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificación, pero el modelo se distribuye sin garantías. El dataset asociado (`fecasado/Ncubes-to-Nbaskets-320x240`) puede tener su propia licencia; se debe verificar antes de usarlo comercialmente.
- Caveat para producción: no hay evidencia de robustez en entornos reales no controlados. Se recomienda validar exhaustivamente antes de cualquier despliegue en robots físicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fecasado/gfm-cubes-21c
- LeRobot (framework): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Dataset asociado: https://huggingface.co/datasets/fecasado/Ncubes-to-Nbaskets-320x240 (referenciado en la model card, no verificado directamente)
