# HyeonseokE/smolvla_open_box_cap_3000_10fps

## Resumen

El modelo `HyeonseokE/smolvla_open_box_cap_3000_10fps` es un fine-tuning de SmolVLA, un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face, que permite control robótico a partir de instrucciones en lenguaje natural y observaciones visuales. Este checkpoint concreto ha sido entrenado por HyeonseokE sobre el modelo base `lerobot/smolvla_base` para ejecutar la tarea de abrir una caja moviendo la tapa hasta un marcador objetivo, utilizando el robot SO-101 y tres cámaras.

El modelo resuelve el problema de la manipulación robótica mediante aprendizaje por imitación, ofreciendo una alternativa ligera a los VLA masivos que requieren infraestructura de alto coste. Con aproximadamente 450 millones de parámetros, es adecuado para hardware de consumo, lo que lo hace relevante para la investigación y el prototipado en robótica. No se dispone de información sobre la longitud de contexto ni sobre la arquitectura interna más allá de su naturaleza VLA.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basado en SmolVLA; detalles internos no disponibles |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual, un modelo de lenguaje y un cabezal de acción para generar comandos motores a partir de observaciones. Este checkpoint concreto es un fine-tuning del modelo base `lerobot/smolvla_base` realizado con la librería LeRobot. El entrenamiento se llevó a cabo sobre el dataset `HyeonseokE/open_box_cap_10fps`, que contiene 100 episodios y 28.973 fotogramas a 10 FPS, con la tarea "Open the box by moving the lid to the target marker". La configuración de entrenamiento incluye 22.636 pasos, batch size de 64, optimizador AdamW, learning rate de 0,0001 y semilla 3000. No se especifican detalles sobre la arquitectura interna (número de capas, tipo de atención, etc.) ni sobre el proceso de alineamiento (RLHF, DPO, etc.).

## Capacidades

- Control robótico: genera acciones de 6 dimensiones (posiciones articulares) a partir de observaciones de estado (6 valores) y tres imágenes de cámara de 256x256 píxeles.
- Tarea específica: abrir una caja moviendo la tapa hasta un marcador, según el dataset de entrenamiento.
- Aprendizaje por imitación: el modelo ha sido fine-tuneado sobre un dataset de demostraciones, por lo que reproduce el comportamiento observado.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento y despliegue de LeRobot, incluyendo comandos CLI para rollout y entrenamiento.
- No se mencionan capacidades adicionales como tool calling, agentes, razonamiento multi-paso o soporte multilingüe.

## Casos de uso

- Automatización de tareas de manipulación en entornos controlados: el modelo puede ejecutar la tarea de abrir una caja en un robot SO-101, útil en líneas de montaje o laboratorios donde se requiera repetitividad.
- Investigación en aprendizaje por imitación: sirve como ejemplo de fine-tuning de un VLA sobre una tarea concreta, permitiendo estudiar la transferencia de conocimiento desde un modelo base.
- Prototipado rápido de políticas robóticas: al ser ligero, puede desplegarse en hardware de consumo para validar conceptos antes de escalar a modelos más grandes.
- Educación robótica: permite a estudiantes experimentar con VLA en robots de bajo coste, gracias a su tamaño reducido y a la integración con LeRobot.
- Benchmarking de políticas: puede utilizarse como referencia para comparar el rendimiento de otros fine-tunes de SmolVLA en tareas similares.
- Desarrollo de nuevas tareas mediante fine-tuning adicional: el modelo puede servir como punto de partida para adaptarlo a otras tareas de manipulación, reutilizando el conocimiento adquirido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que no hay resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- No se dispone de información oficial sobre requisitos de hardware.
- Dado que el modelo tiene 450 millones de parámetros, se estima que en FP32 ocuparía aproximadamente 1,8 GB de VRAM, lo que lo hace compatible con GPUs de consumo como RTX 3060, RTX 4090 o similares. Sin embargo, esta estimación no está confirmada por el autor.
- El despliegue se realiza mediante LeRobot, que soporta inferencia en GPU (CUDA) y posiblemente en CPU, aunque no se especifican opciones como vLLM, llama.cpp u Ollama.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos. Existen otros fine-tunes de SmolVLA del mismo autor, como `HyeonseokE/smolvla_phase1_pick_place_A1_1000_10fps` y `HyeonseokE/smolvla_lekiwi_grasp`, pero no se han publicado sus especificaciones ni resultados. El modelo base `lerobot/smolvla_base` es el punto de partida, pero no se dispone de sus métricas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea de abrir una caja con el robot SO-101; no generaliza a otras tareas o robots sin un nuevo fine-tuning.
- No se han proporcionado resultados de evaluación en robot real, por lo que su rendimiento efectivo es desconocido.
- El dataset de entrenamiento es reducido (100 episodios), lo que puede limitar la robustez ante variaciones de iluminación, posición de objetos o distracciones.
- Depende de la configuración específica de cámaras y del robot; cualquier cambio en el hardware requerirá reentrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero es recomendable revisar los términos del modelo base y del dataset asociado.
- No se especifican limitaciones de contexto o idioma, ya que el modelo no está orientado a procesamiento de lenguaje general.

## Enlaces

- [HuggingFace - HyeonseokE/smolvla_open_box_cap_3000_10fps](https://huggingface.co/HyeonseokE/smolvla_open_box_cap_3000_10fps)
- [Paper SmolVLA (arXiv:2506.01844)](https://arxiv.org/abs/2506.01844)
- [Dataset de entrenamiento - HyeonseokE/open_box_cap_10fps](https://huggingface.co/datasets/HyeonseokE/open_box_cap_10fps)
- [Modelo base - lerobot/smolvla_base](https://huggingface.co/lerobot/smolvla_base)
- [LeRobot (GitHub)](https://github.com/huggingface/lerobot)
- [Fork de LeRobot con chunk-wise delta joint actions](https://github.com/HyeonseokE/kaia_lerobot)
