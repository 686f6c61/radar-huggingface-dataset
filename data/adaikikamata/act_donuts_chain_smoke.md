# aDaikiKamata/act_donuts_chain_smoke

## Resumen

El modelo `aDaikiKamata/act_donuts_chain_smoke` es una política robótica basada en Action Chunking with Transformers (ACT), entrenada con el framework LeRobot de Hugging Face. Desarrollado por aDaikiKamata, este modelo resuelve una tarea de manipulación concreta: colocar un donut en el lado izquierdo de un plato de papel, utilizando un robot tipo SO-100 (so_follower) con dos cámaras (superior y lateral). ACT es un método de aprendizaje por imitación que predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación frente a políticas que predicen una sola acción por paso.

El modelo tiene 51,7 millones de parámetros y se distribuye en formato safetensors, con un tamaño de repositorio de 3,7 GB. Está entrenado sobre un conjunto de datos de 25 episodios teleoperados (17 499 fotogramas a 30 FPS) y su licencia es Apache 2.0, lo que permite uso comercial y modificación. Aunque no se han publicado resultados de evaluación en robot real, el modelo sirve como ejemplo práctico de entrenamiento y despliegue de políticas ACT con LeRobot, y es relevante para investigadores y desarrolladores que trabajan en robótica de manipulación y aprendizaje por imitación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51 668 614 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantización publicada) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que combina un codificador visual (basado en ResNet) con un transformador que predice un chunk de acciones futuras (por ejemplo, 10 o 20 pasos) a partir de observaciones actuales. En este modelo, las observaciones consisten en el estado del robot (6 dimensiones) y dos imágenes: una cámara superior de 720×1280 píxeles y una cámara lateral de 480×640 píxeles. La salida es una acción de 6 dimensiones (probablemente posición y orientación del efector final).

El entrenamiento se realizó con el framework LeRobot (versión 0.6.2) sobre el dataset `aDaikiKamata/so101_pp_donuts_v1`, que contiene 25 episodios de demostración teleoperada de la tarea "Place the donut on the left side of the paper plate". La configuración de entrenamiento incluye 30 pasos de optimización, batch size de 8, optimizador AdamW con learning rate de 1e-5 y semilla 1000. No se menciona el uso de RLHF, DPO ni otras técnicas de refinamiento; se trata de un entrenamiento puramente supervisado de imitación.

## Capacidades

- Control robótico de manipulación: predice acciones de 6 grados de libertad (posición y orientación) para el efector final del robot.
- Percepción visual multimodal: procesa simultáneamente dos vistas de cámara (superior y lateral) para localizar y manipular objetos.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones humanas teleoperadas.
- Ejecución de tareas específicas: está especializado en la tarea de colocar un donut en una posición concreta de un plato de papel.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento, evaluación y despliegue de LeRobot (comandos `lerobot-rollout` y `lerobot-train`).
- No incluye capacidades de lenguaje natural, generación de texto, razonamiento simbólico ni visión general fuera del contexto robótico.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos controlados: el modelo puede ejecutar la tarea de colocar un objeto (donut) en una posición específica, lo que es útil en líneas de montaje o empaquetado donde la posición del objeto es fija.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el efecto del action chunking en la estabilidad y precisión de políticas robóticas, comparando con métodos que predicen acciones paso a paso.
- Prototipado rápido de políticas robóticas con LeRobot: al estar entrenado y publicado en el Hub, permite a otros desarrolladores reproducir el flujo de entrenamiento y adaptarlo a nuevas tareas con pocos cambios.
- Evaluación de hardware robótico de bajo coste: el robot SO-100 es un brazo robótico de bajo coste; este modelo demuestra que se pueden entrenar políticas efectivas con hardware asequible, facilitando la experimentación en laboratorios con presupuesto limitado.
- Benchmarking de métodos de control basados en transformadores: el modelo puede utilizarse como referencia para comparar variantes de ACT (por ejemplo, con diferentes tamaños de chunk, arquitecturas de codificador o aumentos de datos).
- Despliegue en entornos educativos: al ser un ejemplo completo y documentado, es adecuado para cursos de robótica y aprendizaje automático donde se enseña el ciclo de recopilación de datos, entrenamiento y evaluación de políticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). Por tanto, no se dispone de métricas como tasa de éxito, precisión de manipulación ni comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Dado el tamaño del modelo (51,7 M parámetros) y la entrada de imágenes (dos cámaras), se estima que puede ejecutarse en GPUs con al menos 4-6 GB de VRAM, aunque no hay datos confirmados.
- GPU recomendadas: no se especifican. Por el tamaño, una GPU de consumo como una NVIDIA RTX 3060 (12 GB) o superior sería suficiente para inferencia en tiempo real. Para entrenamiento, se recomienda una GPU con al menos 8-12 GB de VRAM.
- Compatibilidad con GPUs de consumo: sí, es probable que funcione en GPUs de gama media, pero no hay garantía oficial.
- Opciones de despliegue: el modelo está diseñado para usarse con LeRobot, que utiliza PyTorch. Se puede ejecutar mediante el comando `lerobot-rollout` con un robot SO-100 y cámaras OpenCV. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Dependerá del hardware, la resolución de las cámaras y la frecuencia de control del robot.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el mismo repositorio o con la misma configuración de tarea. El modelo ACT original (paper arXiv:2304.13705) es la referencia metodológica, pero no se han publicado resultados comparativos de este modelo con otros. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Entrenamiento con un número reducido de episodios (25) y una sola tarea: la generalización a otras tareas, posiciones de objetos o condiciones de iluminación es limitada.
- Sin evaluación en robot real reportada: no se ha verificado el rendimiento en el hardware físico, por lo que el comportamiento en producción es incierto.
- Dependencia de la configuración de cámaras y robot: el modelo espera exactamente dos cámaras (top y side) con las resoluciones indicadas; cualquier cambio en la disposición o calibración puede degradar el rendimiento.
- Riesgo de sobreajuste: con solo 30 pasos de entrenamiento y un dataset pequeño, es probable que la política memorice las demostraciones en lugar de aprender una estrategia robusta.
- No es un modelo de propósito general: no puede utilizarse para tareas de lenguaje, visión general o razonamiento; su ámbito es exclusivamente robótico.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías sobre el funcionamiento en entornos de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aDaikiKamata/act_donuts_chain_smoke
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/aDaikiKamata/so101_pp_donuts_v1
- Documentación de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
