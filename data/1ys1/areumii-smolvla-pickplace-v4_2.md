# 1ys1/areumii-smolvla-pickplace-v4_2

## Resumen

El modelo `1ys1/areumii-smolvla-pickplace-v4_2` es una política de robótica basada en SmolVLA, un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face y descrito en el artículo arXiv 2506.01844. Este fine-tune específico ha sido entrenado por el usuario `1ys1` sobre el modelo base `lerobot/smolvla_base` para controlar un robot manipulador de tipo `areumii_c1` en una tarea de pick-and-place: recoger un cubo rojo y colocarlo en una cesta azul.

El modelo pertenece al ecosistema LeRobot de Hugging Face y se distribuye bajo licencia Apache 2.0. Con 450 millones de parámetros y un tamaño de repositorio de 0,9 GB, está pensado para ejecutarse en hardware de consumo, lo que lo hace accesible para laboratorios de investigación y desarrolladores de robótica sin infraestructura de alto coste. Su relevancia actual radica en que demuestra cómo adaptar un VLA preentrenado a una tarea robótica concreta mediante fine-tuning con un conjunto de datos de demostración relativamente pequeño (160 episodios).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (VLM compacto preentrenado + experto de acción con flow matching) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no procesa texto de forma generativa) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (instrucciones en inglés en el dataset) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA combina un modelo de lenguaje y visión (VLM) compacto preentrenado con un experto de acción entrenado mediante flow matching. Dadas una o varias imágenes de cámaras, el estado sensorimotor del robot y una instrucción en lenguaje natural, el modelo genera un fragmento de acciones (action chunk) de longitud fija. En esta versión concreta, el modelo recibe tres vistas de cámara (`front`, `left_wrist`, `right_wrist`) a 256×256 píxeles, el estado del robot (6 dimensiones) y produce una secuencia de 16 acciones.

El fine-tuning se realizó sobre el modelo base `lerobot/smolvla_base` utilizando el dataset `1ys1/areumii_pickplace-v4`, que contiene 160 episodios y 13 767 frames a 20 FPS. La configuración de entrenamiento incluye 30 000 pasos, batch size de 16, optimizador AdamW con learning rate de 0,0001 y semilla 1000. El entrenamiento se ejecutó con la librería LeRobot versión 0.6.1. No se mencionan técnicas adicionales como RLHF o DPO; el entrenamiento es puramente de aprendizaje por imitación supervisado.

## Capacidades

- Control robótico de pick-and-place: el modelo ejecuta la tarea de recoger un cubo rojo y colocarlo en una cesta azul.
- Percepción multimodal: procesa tres vistas de cámara simultáneamente junto con el estado del robot.
- Generación de acciones en bucle cerrado: dado el estado actual, predice un fragmento de 16 acciones que se ejecutan en el robot.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento e inferencia de Hugging Face LeRobot, incluyendo `lerobot-rollout` y `lerobot-train`.
- Instrucción en lenguaje natural: la tarea se especifica mediante texto, aunque el modelo está especializado en una única instrucción.
- Despliegue en hardware de consumo: al ser un modelo compacto, puede ejecutarse en GPU de gama media.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos de laboratorio: el modelo se integra en un robot `areumii_c1` para mover objetos entre posiciones fijas, útil para investigar manipulación robótica básica.
- Prototipado de políticas de aprendizaje por imitación: sirve como ejemplo de fine-tuning de un VLA base con un dataset pequeño, permitiendo a investigadores reproducir el flujo completo con LeRobot.
- Evaluación de VLA en hardware de bajo coste: al tener 450 M de parámetros, puede desplegarse en una GPU de consumo (p. ej., RTX 3090) para validar el rendimiento de SmolVLA en tareas reales sin servidores dedicados.
- Investigación en generalización de tareas: el modelo puede usarse como punto de partida para probar técnicas de transferencia o para añadir nuevas variantes de la tarea (cambiar colores, posiciones, etc.).
- Demostración de un pipeline de robótica end-to-end: desde la grabación de datos hasta la política entrenada, sirve como plantilla para construir sistemas similares con otros robots o tareas.
- Benchmarking de políticas VLA en entornos controlados: permite comparar el rendimiento de SmolVLA frente a otros modelos VLA en una tarea estandarizada de colocación de objetos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política aún.

## Requisitos de hardware

- VRAM estimada para inferencia: no se ha publicado un valor exacto, pero con 450 M de parámetros y entrada de tres imágenes de 256×256, se estima que puede ejecutarse en GPUs con 8-12 GB de VRAM en FP32, y menos con cuantización.
- GPU recomendadas: una RTX 3090, RTX 4090 o A100 son suficientes para inferencia en tiempo real; también podría funcionar en GPUs más modestas si se reduce la resolución de entrada.
- Compatibilidad con hardware de consumo: sí, el diseño compacto de SmolVLA está orientado a ejecutarse en GPUs de consumo.
- Opciones de despliegue: LeRobot (comando `lerobot-rollout`), compatible con la librería `lerobot` de Python; no se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo sino una política robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `1ys1/areumii-smolvla-pickplace-v4_2` | 450 M | no aplica | pick-and-place | Apache-2.0 | Hugging Face |
| `lerobot/smolvla_base` | no disponible | no aplica | preentrenamiento general | Apache-2.0 | Hugging Face |
| OpenVLA (referencia) | 7 B | no aplica | VLA generalista | MIT | Hugging Face |

La comparativa con otros modelos VLA como OpenVLA es desfavorable en términos de tamaño (450 M frente a 7 B), pero SmolVLA está diseñado para ser eficiente y desplegable en hardware de consumo. No hay datos de rendimiento comparativo en la información disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para una única tarea (recoger cubo rojo y colocarlo en cesta azul) y no se ha evaluado en otras tareas ni con variaciones de objetos o posiciones.
- No se han proporcionado resultados de evaluación en robot real; el rendimiento en entornos no vistos es incierto.
- La instrucción en lenguaje natural es fija; el modelo no está preparado para interpretar instrucciones variadas.
- El dataset de entrenamiento es pequeño (160 episodios), lo que puede provocar sobreajuste a las condiciones específicas de grabación (iluminación, posición de cámaras, etc.).
- La licencia Apache-2.0 permite uso comercial, pero el modelo depende del modelo base `lerobot/smolvla_base` y de la librería LeRobot, por lo que deben cumplirse sus respectivos términos.
- No se dispone de información sobre sesgos en el dataset ni sobre riesgos de alucinación en el contexto robótico.

## Enlaces

- [Página del modelo en Hugging Face](https://huggingface.co/1ys1/areumii-smolvla-pickplace-v4_2)
- [Modelo base SmolVLA](https://huggingface.co/lerobot/smolvla_base)
- [Dataset de entrenamiento](https://huggingface.co/datasets/1ys1/areumii_pickplace-v4)
- [Paper de SmolVLA en arXiv](https://arxiv.org/abs/2506.01844)
- [Documentación de LeRobot para SmolVLA](https://huggingface.co/docs/lerobot/main/en/smolvla)
- [Repositorio de LeRobot en GitHub](https://github.com/huggingface/lerobot)
