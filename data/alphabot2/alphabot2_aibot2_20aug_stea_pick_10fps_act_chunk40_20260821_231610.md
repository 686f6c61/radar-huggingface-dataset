# alphabot2/alphabot2_Aibot2_20Aug_STEA_pick_10fps_act_chunk40_20260821_231610

## Resumen

El modelo `alphabot2/alphabot2_Aibot2_20Aug_STEA_pick_10fps_act_chunk40_20260821_231610` es una política de aprendizaje por imitación para robótica, entrenada con la librería LeRobot de Hugging Face. Utiliza el método Action Chunking with Transformers (ACT), publicado en el paper arxiv 2304.13705, que predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación teleoperadas.

El modelo se ha entrenado sobre un dataset propio del autor (`alphabot2/Aibot2_20Aug_STEA_pick_10fps`) y está diseñado para controlar un brazo robótico SO100 en una tarea de recogida de objetos (pick). Tiene 51.6 millones de parámetros y se distribuye bajo licencia Apache-2.0. Su relevancia radica en que es un ejemplo de aplicación de ACT en robótica de bajo coste, con un tamaño compacto que lo hace viable para inferencia en hardware de gama media.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.627.664 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de control robótico, sin lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es una arquitectura basada en transformers que combina un encoder de visión con un decoder autoregresivo. La idea principal es predecir un bloque de acciones futuras (action chunk) de longitud fija, en este caso 40, en lugar de una única acción. Esto reduce el error de composición y mejora la consistencia temporal en la ejecución de trayectorias. El modelo se entrena mediante imitación directa sobre demostraciones teleoperadas, sin necesidad de recompensas ni refuerzo.

Los datos de entrenamiento provienen del dataset `alphabot2/Aibot2_20Aug_STEA_pick_10fps`, que contiene demostraciones de tareas de recogida a 10 fotogramas por segundo. No se especifican el número de tokens ni la composición exacta del dataset. La política se entrenó con LeRobot, el framework de Hugging Face para robótica, y se publicó en el Hub con los checkpoints correspondientes.

## Capacidades

- Generación de secuencias de acciones de control para un brazo robótico SO100 (posición de articulaciones o efector final).
- Ejecución de tareas de manipulación tipo pick-and-place a partir de observaciones visuales (cámara) y estados del robot.
- Predicción de chunks de 40 acciones, lo que permite movimientos suaves y coordinados sin re-planificación constante.
- Integración con el ecosistema LeRobot: se puede cargar directamente con `lerobot-record` para evaluación o despliegue.
- No soporta lenguaje natural, tool calling ni razonamiento simbólico; es una política puramente sensoriomotora.

## Casos de uso

- Manipulación de objetos en líneas de ensamblaje: el modelo puede controlar un brazo SO100 para recoger piezas de una cinta transportadora y colocarlas en una posición fija, gracias a su chunking de 40 acciones que mantiene trayectorias estables.
- Automatización de laboratorios de investigación: integrado en un entorno de experimentación con LeRobot, sirve como baseline para probar nuevos datasets o algoritmos de imitación en tareas de pick-and-place.
- Prototipado rápido en robótica educativa: al ser un modelo compacto (51.6M parámetros) y con licencia Apache-2.0, se puede desplegar en un SO100 montado en un laboratorio universitario para enseñar aprendizaje por imitación.
- Evaluación de políticas de control: su uso con `lerobot-record` permite medir el éxito de la política en episodios reales, comparando tasas de éxito con otras variantes de ACT.
- Entrenamiento de modelos de teleoperación: sirve como punto de partida para fine-tuning con nuevos datasets de tareas de manipulación, reduciendo el tiempo de entrenamiento desde cero.
- Benchmarking de hardware de inferencia: al ser un modelo pequeño, se puede ejecutar en GPUs de consumo (p. ej., RTX 3060) para medir latencia y throughput en sistemas de control en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye métricas de éxito, precisión ni comparativas con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 51.6M parámetros, la inferencia es ligera; se estima que cabe en menos de 1 GB de VRAM en FP32, y significativamente menos en cuantización (no disponible).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3050) es suficiente para inferencia en tiempo real. Para entrenamiento, una GPU con 8-12 GB (RTX 3060/3070) es razonable, aunque no se especifican requisitos oficiales.
- Compatibilidad con consumer GPU: sí, dado el tamaño compacto, se puede ejecutar en GPUs de consumo modernas.
- Opciones de despliegue: la integración con LeRobot permite usar `lerobot-record` para evaluación en el robot real. No se documentan opciones como vLLM u Ollama, ya que no es un modelo de lenguaje; para inferencia embebida se podría usar PyTorch con CUDA.
- Latencia y throughput: no disponibles, pero al ser un modelo pequeño y con chunking de 40 acciones, la frecuencia de control es de 10 Hz según el dataset, lo que sugiere que la inferencia puede completarse en menos de 100 ms en GPU.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de robótica. El autor no publica métricas ni comparaciones. Se puede mencionar que existen otras políticas de LeRobot (p. ej., ACT, Diffusion Policy, VINN) pero sin datos de rendimiento de este modelo concreto, la comparativa no es posible.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para una tarea de "pick" con el robot SO100; no es generalizable a otros robots ni a otras tareas sin reentrenamiento.
- Los datos de entrenamiento proceden de un dataset propio con 10 fps, lo que puede limitar la robustez ante variaciones de iluminación, posición de objetos o condiciones del entorno no representadas en las demostraciones.
- No se han documentado sesgos específicos, pero como cualquier modelo de imitación, puede reproducir errores sistemáticos de las demostraciones (p. ej., agarres subóptimos).
- La licencia Apache-2.0 permite uso comercial, pero el dataset asociado puede tener restricciones propias; es necesario revisar la licencia del dataset `alphabot2/Aibot2_20Aug_STEA_pick_10fps`.
- Para producción, se recomienda validar la política en un número suficiente de episodios reales, ya que el éxito de la imitación puede degradarse fuera del conjunto de entrenamiento.
- No se proporciona información sobre el tamaño del contexto visual (número de frames de entrada), lo que limita la comprensión de la memoria temporal del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alphabot2/alphabot2_Aibot2_20Aug_STEA_pick_10fps_act_chunk40_20260821_231610
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Librería LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Dataset de entrenamiento: https://huggingface.co/datasets/alphabot2/Aibot2_20Aug_STEA_pick_10fps
