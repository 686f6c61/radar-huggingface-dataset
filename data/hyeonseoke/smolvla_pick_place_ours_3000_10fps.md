# HyeonseokE/smolvla_pick_place_ours_3000_10fps

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por el equipo de LeRobot/Hugging Face, diseñado para reducir los costes computacionales frente a modelos VLA más grandes y permitir su despliegue en hardware de consumo. Este checkpoint concreto, `smolvla_pick_place_ours_3000_10fps`, ha sido creado por HyeonseokE mediante fine-tuning del modelo base `lerobot/smolvla_base` sobre el dataset `HyeonseokE/pick_place_ours_10fps`, que contiene 100 episodios y 29.269 fotogramas a 10 FPS. La tarea específica es recoger un bloque rojo y colocarlo sobre un plato azul.

El modelo tiene 450.046.176 parámetros y se distribuye en formato safetensors, con un peso total de 0.9 GB. Su licencia es Apache 2.0, lo que permite uso comercial. La longitud de contexto no está disponible en la información proporcionada, ya que se trata de un modelo de política robótica, no de un modelo de lenguaje general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer multimodal) |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA combina un codificador visual y un modelo de lenguaje para generar acciones de control en robots. Este checkpoint se ha obtenido mediante fine-tuning del modelo base `lerobot/smolvla_base` sobre un dataset de demostraciones de pick-and-place. El entrenamiento se realizó con LeRobot 0.6.0, durante 22.850 pasos, con batch size 64, learning rate 0.0001 y seed 3000. El método de entrenamiento es aprendizaje por imitación supervisado; no se indica el uso de RLHF ni DPO.

Las observaciones de entrada son el estado del robot (6 dimensiones) y tres imágenes de 256x256 píxeles procedentes de las cámaras `top` y `left_wrist`. La salida es una acción de 6 dimensiones que especifica la posición y orientación del efector final. El modelo está optimizado para ejecutarse en tiempo real a 10 FPS.

## Capacidades

- Ejecución de tareas de manipulación robótica pick-and-place a partir de observaciones de estado y dos cámaras.
- Generación de acciones continuas de 6 dimensiones para el control del efector final.
- Integración nativa con el framework LeRobot para entrenamiento, evaluación y despliegue.
- No soporta tool calling, generación de texto general ni razonamiento simbólico; es exclusivamente un modelo de política motora.
- Capacidades multilingües no aplicables.
- Sin modo de pensamiento ni funciones de visión generales más allá de la tarea entrenada.

## Casos de uso

- Automatización de pick-and-place en líneas de ensamblaje: el modelo puede controlar un brazo robótico para recoger componentes y colocarlos en posiciones determinadas, reduciendo la intervención humana en procesos repetitivos.
- Robots colaborativos en almacenes: tareas de clasificación y colocación de paquetes en contenedores, aprovechando la eficiencia del modelo en hardware de consumo.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar y comparar políticas VLA compactas frente a modelos más grandes, facilitando experimentos reproducibles.
- Despliegue doméstico: robots de bajo coste que recogen objetos y los colocan en lugares específicos, como recoger un bloque y ponerlo en un plato.
- Prototipado rápido con LeRobot: los investigadores pueden usar el modelo como base para fine-tuning en nuevas tareas con pocas demostraciones, gracias a su tamaño reducido.
- Educación y formación en robótica: el modelo permite a estudiantes experimentar con políticas de control basadas en visión y lenguaje sin necesidad de infraestructura de alto coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 450M parámetros y un peso de 0.9 GB, se estima que la inferencia en FP16/BF16 requiere entre 2 y 4 GB de VRAM, dependiendo del tamaño de lote y la resolución de imagen.
- GPU recomendadas: tarjetas de consumo como RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores; también es viable en RTX 4090 y GPUs profesionales como A100.
- Sí cabe en GPU de consumo: sí, es un modelo diseñado para desplegarse en hardware de consumo.
- Opciones de despliegue: mediante LeRobot (`lerobot-rollout`), también se puede integrar en pipelines personalizados con PyTorch. No se menciona compatibilidad con vLLM, Ollama o TGI, ya que no es un modelo de lenguaje puro.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| smolvla_pick_place_ours_3000_10fps | 450M | no disponible | Apache 2.0 | Hugging Face |
| OpenVLA | 7B | no disponible | no disponible | Hugging Face |
| RT-2 | 55B | no disponible | no disponible | no disponible |

Los datos de OpenVLA y RT-2 no están confirmados en la información proporcionada; se indican como referencia de tamaño y no deben considerarse exactos.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados.
- Riesgo de alucinación: bajo, pero el modelo puede fallar en escenarios fuera de la distribución de entrenamiento, como cambios de iluminación, posiciones nuevas o objetos distintos.
- Limitaciones de contexto o idioma: no aplica, el modelo opera sobre observaciones robóticas, no sobre texto.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe cumplir con la atribución correspondiente.
- Caveat importante: el modelo solo ha sido entrenado para la tarea específica de pick-and-place con la configuración de cámaras indicada; no es un modelo generalista.

## Enlaces

- HuggingFace: https://huggingface.co/HyeonseokE/smolvla_pick_place_ours_3000_10fps
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset: https://huggingface.co/datasets/HyeonseokE/pick_place_ours_10fps
- Guía LeRobot SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
