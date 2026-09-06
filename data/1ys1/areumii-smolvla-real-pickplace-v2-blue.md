# 1ys1/areumii-smolvla-real-pickplace-v2-blue

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por LeRobot para el control de robots manipuladores. Este repositorio contiene un fine-tune específico para el robot areumii, entrenado por el usuario 1ys1 para realizar la tarea de recoger una lata azul y colocarla en un estante inferior. El modelo se basa en el modelo pretreinado lerobot/smolvla_base y ha sido ajustado con un dataset de demostraciones reales compuesto por 51 episodios y 31.732 frames a 30 FPS. Con 450.046.176 parámetros y un tamaño de repositorio de 0.9 GB, está diseñado para desplegarse en hardware de consumo, lo que lo hace relevante para la robótica accesible y la investigación en aprendizaje por imitación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (modelo de visión-lenguaje-acción) |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de acción robótica) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que procesa observaciones multimodales (imágenes de tres cámaras y estado del robot) para predecir acciones de control. Este fine-tune se ha entrenado con la librería LeRobot utilizando el dataset 1ys1/areumii-real-pickplace-v2-blue. La configuración de entrenamiento incluye 30.000 pasos, tamaño de lote de 8, optimizador AdamW con tasa de aprendizaje de 0.0001 y semilla 1000. No se menciona el uso de RLHF ni DPO; se trata de un ajuste por imitación sobre demostraciones humanas. La arquitectura base está descrita en el paper arxiv:2506.01844, que enfatiza la eficiencia computacional y la capacidad de ejecución en hardware de consumo.

## Capacidades

- Control robótico de manipulación: el modelo genera acciones de 16 dimensiones para controlar un robot manipulador, a partir del estado articular y de imágenes de tres cámaras.
- Percepción visual multi-cámara: utiliza tres imágenes RGB de 256x256 píxeles (cámara frontal, y dos cámaras en las muñecas) para localizar y manipular objetos.
- Aprendizaje por imitación: la política ha sido entrenada mediante demostraciones reales del robot, lo que le permite replicar comportamientos humanos.
- Ejecución de tareas de pick-and-place: especializada en recoger un objeto específico (lata azul) y colocarlo en una ubicación determinada (estante inferior).
- Integración con LeRobot: compatible con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- No soporta generación de lenguaje, tool calling ni razonamiento general: es exclusivamente un modelo de acción.

## Casos de uso

- Automatización de pick-and-place en almacenes: el modelo puede controlar un brazo robótico para recoger objetos de una estantería y colocarlos en otra. Es adecuado por su tamaño compacto y su entrenamiento específico en tareas de manipulación.
- Estaciones de ensamblaje en líneas de producción: integrar el modelo en una celda robótica para mover piezas de una posición a otra, utilizando la percepción visual de las cámaras para adaptarse a ligeras variaciones de posición.
- Investigación en aprendizaje por imitación: sirve como baseline para evaluar algoritmos de IL en tareas reales de manipulación, gracias a su publicación con el código de entrenamiento en LeRobot.
- Robótica educativa y de bajo coste: al ser un modelo de 450M parámetros, puede ejecutarse en GPUs de consumo, lo que permite a laboratorios con recursos limitados experimentar con políticas robóticas.
- Fine-tuning para nuevas tareas: el modelo puede usarse como punto de partida para adaptarlo a otros objetos o entornos, utilizando el pipeline de LeRobot y datasets propios.
- Evaluación de políticas en entornos reales: mediante lerobot-rollout, el modelo puede probarse en el robot areumii para medir tasas de éxito en condiciones controladas.
- Manipulación de objetos en logística interna: en entornos de almacén con estanterías, el modelo puede gestionar la colocación de productos en ubicaciones predefinidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información publicada. El tamaño del repositorio (0.9 GB) sugiere que los pesos en safetensors pueden cargarse en una GPU con al menos 1-2 GB de VRAM, pero no hay datos oficiales.
- GPU recomendadas: no especificadas. El modelo base SmolVLA está diseñado para hardware de consumo, por lo que se espera compatibilidad con GPUs de gama media o superior, pero no está confirmado.
- Capacidad en GPU de consumo: probablemente sí, dado el diseño de SmolVLA y el tamaño de los pesos, pero no hay pruebas publicadas en este repositorio.
- Opciones de despliegue: LeRobot (lerobot-rollout para inferencia, lerobot-train para entrenamiento). No se menciona soporte para vLLM, llama.cpp, Ollama o TGI, ya que es un modelo de acción y no un LLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparación cuantitativa con otros modelos. Se han identificado otros repositorios del mismo autor (1ys1/areumii-smolvla-real-pickplace-v2-green y 1ys1/areumii-smolvla-pickplace-v2) para tareas similares, pero no se han publicado especificaciones ni resultados en la información disponible.

## Limitaciones y advertencias

- No se han proporcionado resultados de evaluación, por lo que se desconoce la tasa de éxito real del modelo.
- El dataset de entrenamiento es pequeño (51 episodios), lo que limita la generalización a nuevas posiciones, iluminación o distracciones.
- Es un modelo específico para el robot areumii y sus cámaras; puede no funcionar con otros robots sin recalibración.
- La tarea es muy concreta (recoger la lata azul y colocarla en el estante inferior); no es un modelo generalista.
- Riesgo de fallos en entornos no vistos, típico de políticas de aprendizaje por imitación.
- Licencia Apache 2.0 permite uso comercial, pero requiere mantener los avisos de licencia.
- No soporta tool calling ni generación de lenguaje; es exclusivamente un modelo de acción.

## Enlaces

- Modelo: https://huggingface.co/1ys1/areumii-smolvla-real-pickplace-v2-blue
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/1ys1/areumii-real-pickplace-v2-blue
- LeRobot GitHub: https://github.com/huggingface/lerobot
- Documentación LeRobot SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Modelo relacionado (green): https://huggingface.co/1ys1/areumii-smolvla-real-pickplace-v2-green
- Modelo relacionado (pickplace-v2): https://huggingface.co/1ys1/areumii-smolvla-pickplace-v2
