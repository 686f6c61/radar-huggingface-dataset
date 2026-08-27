# HyeonseokE/smolvla_phase1_pick_place_A2_1000_10fps

## Resumen

Este repositorio contiene un modelo SmolVLA ajustado para una tarea concreta de robótica: recoger un bloque rojo y colocarlo sobre un plato azul. El modelo ha sido desarrollado por HyeonseokE y publicado bajo licencia Apache 2.0. Se trata de un fine-tuning del modelo base `lerobot/smolvla_base`, entrenado con el framework LeRobot sobre un dataset propio de 100 episodios a 10 FPS. El resultado es una política de visión-lenguaje-acción (VLA) compacta, con 450 millones de parámetros, pensada para ejecutarse en hardware de consumo.

La relevancia de este modelo radica en que demuestra el proceso de adaptación de SmolVLA, un modelo abierto de la familia SmolLM2 y SigLIP, a una tarea de manipulación específica. Al ser un fine-tuning, solo se actualizan los módulos de acción y proyecciones, mientras que el encoder de visión y el modelo de lenguaje permanecen congelados. Esto permite entrenar políticas robóticas con recursos limitados y desplegarlas en robots como el SO-101. El modelo se distribuye mediante el ecosistema LeRobot, lo que facilita su reproducción y uso en otros robots.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolLM2 + SigLIP + action expert |
| Parámetros totales | 450.046.174 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (modelo de acción, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SmolVLA, un modelo compacto de visión-lenguaje-acción diseñado para robótica. Se compone de un encoder de visión SigLIP, un modelo de lenguaje SmolLM2 y un "action expert" que genera las acciones de control. En el proceso de fine-tuning solo se entrenan el action expert y las proyecciones de entrada/salida, aproximadamente 50 millones de parámetros, mientras que el encoder y el modelo de lenguaje quedan congelados. Esto reduce el coste computacional y permite entrenar en GPU de consumo.

El entrenamiento se ha realizado sobre el dataset `HyeonseokE/phase1_pick_place_A2_10fps`, que contiene 100 episodios y 30.370 fotogramas a 10 FPS, con la tarea "Pick up the red block and place it on the blue dish". Se han usado 23.700 pasos, batch size 64, optimizador AdamW con learning rate 0.0001 y semilla 1000. El proceso se ha llevado a cabo con la librería LeRobot, en su versión 0.6.0. No se menciona el uso de RLHF o DPO; se trata de un aprendizaje por imitación supervisado.

## Capacidades

- Generación de acciones robóticas de 6 grados de libertad a partir de observaciones de estado y tres imágenes de cámaras (top, left_wrist y una tercera no especificada).
- Procesamiento de imágenes de resolución 256×256 por cámara.
- Ejecución de tareas de pick-and-place en un robot SO-101, con una frecuencia de control de 10 FPS.
- Aprendizaje por imitación: el modelo reproduce el comportamiento del demostrador.
- No soporta conversación en lenguaje natural; su entrada son observaciones de estado e imágenes, y su salida es un vector de acción.
- No incluye capacidades de razonamiento o tool calling más allá de la acción robótica.

## Casos de uso

- Automatización de tareas de pick-and-place en líneas de montaje: el modelo puede controlar un robot SO-101 para recoger objetos de una posición y colocarlos en otra, útil en procesos repetitivos de logística o ensamblaje.
- Prototipado rápido de políticas robóticas: al ser un fine-tuning de un modelo base, permite evaluar nuevas tareas con pocos datos y hardware modesto.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar cómo se comporta un VLA pequeño en tareas de manipulación con datos limitados.
- Integración con LeRobot para despliegue en robots reales: mediante los comandos `lerobot-rollout` se puede ejecutar la política directamente en un robot SO-101 con cámaras.
- Entrenamiento de políticas para entornos de laboratorio: se puede adaptar a tareas similares de recoger y colocar, cambiando el dataset.
- Evaluación de la generalización de SmolVLA: el modelo puede usarse para comparar el rendimiento entre distintas tareas y configuraciones de cámaras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política. Por tanto, no se dispone de métricas de éxito en tareas reales.

## Requisitos de hardware

- El modelo tiene 450 millones de parámetros, lo que lo hace adecuado para GPUs de consumo. Según el blog de HuggingFace, SmolVLA corre en hardware de consumo, aunque no se especifica la VRAM exacta.
- Con un tamaño de 0.9 GB en safetensors, puede cargarse en GPUs con al menos 8 GB de VRAM, aunque se recomienda verificar la memoria necesaria para la inferencia con el batch y la resolución de imagen.
- Se puede ejecutar en tarjetas como RTX 3060 (12 GB), RTX 4090 o similares.
- Para el entrenamiento, se requiere GPU con suficiente memoria para el batch de 64; puede ser necesario reducir el batch en GPUs más pequeñas.
- El despliegue se realiza mediante LeRobot, que ofrece comandos `lerobot-rollout` para inferencia en robots. No se menciona compatibilidad con vLLM, llama.cpp o TGI, ya que no es un modelo de lenguaje estándar.
- La latencia y el throughput no están documentados; se espera que funcione a 10 FPS según el dataset.

## Comparativa con modelos similares

| Modelo | Parámetros | Longitud de contexto | Licencia | Disponibilidad |
| --- | --- | --- | --- | --- |
| `HyeonseokE/smolvla_phase1_pick_place_A2_1000_10fps` | 450M | No disponible | Apache 2.0 | HuggingFace |
| `lerobot/smolvla_base` | 450M (aprox.) | No disponible | Apache 2.0 | HuggingFace |
| `HyeonseokE/smolvla_phase1_sort_by_color_A1_10fps` | 450M (aprox.) | No disponible | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estos modelos. El modelo presentado es un fine-tuning específico de la base, y su rendimiento depende del dataset de entrenamiento. Otros modelos como OpenVLA o ACT (mencionado en el blog de ggando) son alternativas en el espacio de VLA, pero no se proporcionan datos comparativos en la información disponible.

## Limitaciones y advertencias

- El modelo está entrenado para una tarea concreta (pick-and-place de un bloque rojo sobre un plato azul) y no generaliza a otras tareas sin reentrenamiento.
- No se han reportado resultados de evaluación reales sobre el robot, por lo que la eficacia en el mundo real no está validada.
- La dependencia de la posición de las cámaras y del robot específico (SO-101) limita la transferencia a otros hardware sin ajustes.
- El modelo no maneja texto ni conversación; es una política de control, por lo que no es adecuado para aplicaciones de lenguaje.
- Al ser un modelo de aprendizaje por imitación, puede heredar sesgos del dataset de demostraciones, como variaciones en la velocidad o la trayectoria.
- No hay información sobre la licencia de uso comercial más allá de Apache 2.0, que permite uso comercial, pero se recomienda revisar los términos de los datasets base (SmolVLA fue preentrenado con datos comunitarios con licencias compatibles).
- No se dispone de datos de cuantización ni de optimizaciones para entornos de producción a gran escala.

## Enlaces

- Repositorio del modelo: [HyeonseokE/smolvla_phase1_pick_place_A2_1000_10fps](https://huggingface.co/HyeonseokE/smolvla_phase1_pick_place_A2_1000_10fps)
- Paper de SmolVLA: https://arxiv.org/abs/2506.01844
- Blog de HuggingFace sobre SmolVLA: https://github.com/huggingface/blog/blob/main/smolvla.md
- Blog de ggando sobre fine-tuning de SmolVLA: https://ggando.com/blog/smolvla-so101/
- Dataset utilizado: https://huggingface.co/datasets/HyeonseokE/phase1_pick_place_A2_10fps
- Documentación de LeRobot para SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
