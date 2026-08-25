# adrfm/pick_place_b601_v2_act_

## Resumen

El modelo `adrfm/pick_place_b601_v2_act_` es una política robótica basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación presentado en el artículo arXiv:2304.13705. Ha sido desarrollado por Aaron De Rybel (usuario `adrfm` en Hugging Face) y entrenado con la librería LeRobot de Hugging Face. El modelo resuelve una tarea concreta de manipulación: colocar un disco negro en una caja, utilizando un robot Seeed B601 (brazo robótico de tipo follower) con dos cámaras (lateral y de muñeca).

ACT predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y el éxito en tareas de manipulación con datos teleoperados. El modelo tiene 51,7 millones de parámetros y un tamaño de repositorio de 0,2 GB, lo que lo convierte en una política ligera y adecuada para prototipado rápido en entornos de investigación o industriales. Su relevancia radica en que demuestra el flujo completo de entrenamiento y despliegue de políticas robóticas con LeRobot, una herramienta de código abierto que está ganando adopción en la comunidad.

Al ser un modelo de robótica, no es un modelo de lenguaje ni de visión general: está especializado en una tarea de pick-and-place con entradas multimodales (estado del robot e imágenes). No se han publicado resultados de evaluación en robot real, por lo que su rendimiento en producción debe validarse experimentalmente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.721.863 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura ACT, que combina un codificador de visión (para procesar las imágenes de las cámaras lateral y de muñeca) con un transformador que genera secuencias de acciones de 7 dimensiones (posiciones y orientaciones del efector final). El método se basa en el paper "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705) y está implementado en LeRobot.

El entrenamiento se realizó sobre el dataset `adrfm/pick_place_b601_v2`, que contiene 10 episodios teleoperados (4295 frames a 30 FPS) de la tarea "Place black disk in box". La configuración de entrenamiento incluye 3000 pasos, batch size de 8, optimizador AdamW con learning rate de 1e-5 y semilla 1000. No se aplicaron técnicas de RLHF ni DPO, ya que es un método de imitación supervisada. El modelo fue entrenado con LeRobot versión 0.6.2.

## Capacidades

- Aprendizaje por imitación para tareas de manipulación robótica, específicamente pick-and-place.
- Predicción de chunks de acciones (action chunking) que mejora la coherencia temporal de los movimientos.
- Entrada multimodal: estado del robot (vector de 7 dimensiones) y dos imágenes RGB (lateral y muñeca) de 480x640 píxeles.
- Salida de acciones de 7 dimensiones (posición y orientación del efector final).
- Integración nativa con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- No soporta tool calling, razonamiento multi-paso ni capacidades de lenguaje; es un modelo puramente motor.

## Casos de uso

- Automatización de tareas de pick-and-place en líneas de ensamblaje: el modelo puede controlar un brazo robótico para recoger y colocar piezas en posiciones fijas, reduciendo la intervención humana en entornos repetitivos.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de políticas entre robots o la robustez frente a variaciones de iluminación y posición de objetos.
- Prototipado rápido de nuevas tareas robóticas: gracias a su tamaño reducido y al flujo de LeRobot, se puede entrenar y desplegar en pocas horas para validar conceptos antes de escalar a modelos más grandes.
- Entrenamiento de robots colaborativos (cobots) en entornos educativos o de laboratorio: el modelo puede ejecutarse en hardware de bajo coste, como el Seeed B601, para demostrar técnicas de manipulación.
- Evaluación de algoritmos de control basados en visión: al combinar estado y cámaras, permite comparar estrategias de fusión sensorial en tareas de precisión.
- Fine-tuning para tareas similares: con un dataset pequeño (10 episodios), se puede adaptar el modelo a nuevas configuraciones de objetos o posiciones mediante transferencia de aprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real. Por tanto, no se dispone de métricas de éxito, tasas de acierto ni comparaciones con otros modelos.

## Requisitos de hardware

- El modelo tiene 51,7 millones de parámetros, lo que en FP32 ocupa aproximadamente 207 MB. Con overhead de PyTorch y las imágenes de entrada, la VRAM necesaria es modesta.
- Se puede ejecutar en GPUs de consumo como una NVIDIA GTX 1060 (6 GB) o superiores, aunque no se han publicado requisitos oficiales.
- Para entrenamiento, se recomienda al menos una GPU con 8 GB de VRAM (por ejemplo, RTX 2070 o superior) para manejar el batch size de 8 con imágenes de 480x640.
- El despliegue se realiza mediante LeRobot, que utiliza PyTorch y CUDA. No se mencionan opciones como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- La latencia y el throughput dependen del hardware y de la frecuencia de control del robot (30 FPS). No hay datos oficiales, pero al ser un modelo pequeño, se espera que la inferencia sea rápida en GPUs modernas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas ACT para robótica con LeRobot). Existen otros modelos ACT en el Hub de Hugging Face, pero no se han encontrado datos de rendimiento ni especificaciones que permitan una comparación rigurosa. Por tanto, esta sección queda como "no disponible".

## Limitaciones y advertencias

- El modelo fue entrenado con solo 10 episodios, lo que limita su capacidad de generalización a variaciones de posición, iluminación o textura de los objetos.
- No se han reportado resultados de evaluación en robot real, por lo que su fiabilidad en producción no está demostrada.
- La tarea es muy específica ("Place black disk in box"); no es un modelo generalista y no puede aplicarse a otras tareas sin reentrenamiento.
- Depende de la configuración exacta de cámaras (lateral y muñeca) y del robot Seeed B601. Cambios en la disposición de las cámaras o en el robot pueden degradar el rendimiento.
- Aunque la licencia Apache 2.0 permite uso comercial, es necesario verificar que el hardware y el entorno de despliegue cumplen con los requisitos de seguridad y normativa aplicables.
- No se proporcionan cuantizaciones ni formatos optimizados (GGUF, ONNX, etc.), lo que limita su uso en entornos sin PyTorch o con restricciones de memoria.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/adrfm/pick_place_b601_v2_act_)
- [Dataset de entrenamiento](https://huggingface.co/datasets/adrfm/pick_place_b601)
- [Paper de ACT (arXiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- [Repositorio de LeRobot](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot para ACT](https://huggingface.co/docs/lerobot/main/en/act)
