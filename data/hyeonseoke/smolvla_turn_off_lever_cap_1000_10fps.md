# HyeonseokE/smolvla_turn_off_lever_cap_1000_10fps

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face, diseñado para control robótico por imitación. Este repositorio concreto, `HyeonseokE/smolvla_turn_off_lever_cap_1000_10fps`, es un fine-tuning del modelo base `lerobot/smolvla_base` para una tarea específica: apagar una palanca (lever) en un robot SO-101, con el indicador de estado pasando a rojo. El modelo fue entrenado con el dataset `HyeonseokE/turn_off_lever_cap_10fps`, que contiene 100 episodios y 21.317 frames a 10 FPS, capturados con cámaras superior y de muñeca izquierda.

Con 450 millones de parámetros, SmolVLA es significativamente más ligero que otros VLA como OpenVLA (7B) o RT-2 (55B), lo que permite su despliegue en hardware de consumo. Su arquitectura combina un codificador visual con un modelo de lenguaje (basado en SmolVLM) para procesar observaciones multimodales (imágenes y estado del robot) y generar acciones de control de 6 grados de libertad. La licencia Apache 2.0 facilita su uso comercial y académico, y su integración con el framework LeRobot simplifica el entrenamiento y la inferencia en robots reales o simulados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basado en SmolVLM (transformer multimodal) |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de control, no de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (tarea en ingles, pero no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador de imágenes (para procesar observaciones RGB de las cámaras) con un modelo de lenguaje ligero (SmolVLM) para generar acciones de control. La entrada incluye el estado del robot (6 dimensiones) y tres imágenes de cámaras (aunque la model card especifica dos cámaras: `top` y `left_wrist`; la tabla de features muestra `camera1`, `camera2` y `camera3`). La salida es un vector de acción de 6 dimensiones que controla los grados de libertad del robot.

El entrenamiento se realizó mediante fine-tuning del modelo base `lerobot/smolvla_base` usando el framework LeRobot. Se emplearon 16.650 pasos de entrenamiento con un batch size de 64, optimizador AdamW, learning rate de 0.0001 y semilla 1000. El dataset de entrenamiento contiene 100 episodios de demostración de la tarea "apagar la palanca", recopilados a 10 FPS. No se menciona el uso de RLHF ni DPO; se trata de aprendizaje por imitación supervisado.

## Capacidades

- Control robótico: genera acciones de 6 grados de libertad a partir de observaciones de estado e imágenes.
- Aprendizaje por imitación: aprende de demostraciones humanas para replicar comportamientos específicos.
- Percepción visual: procesa imágenes RGB de hasta 256x256 píxeles de múltiples cámaras.
- Integración multimodal: combina información de estado (posición, orientación) con señales visuales.
- Especialización en tareas concretas: este modelo está entrenado para la tarea de apagar una palanca, no es generalista.
- No incluye capacidades de lenguaje natural, tool calling ni razonamiento simbólico.

## Casos de uso

- Automatización de tareas de manipulación en entornos industriales: el modelo puede controlar un brazo robótico para operar palancas, interruptores o botones en líneas de producción, reduciendo la intervención humana.
- Investigación en robótica: sirve como punto de partida para fine-tuning en otras tareas de manipulación, gracias a su tamaño reducido y su integración con LeRobot.
- Prototipado rápido de políticas de control: los desarrolladores pueden entrenar y desplegar políticas en horas usando el flujo de trabajo de LeRobot, sin necesidad de infraestructura de alto rendimiento.
- Simulación y validación en entornos virtuales: el modelo puede probarse en simuladores como Isaac Lab antes de su despliegue en robots reales, acelerando el ciclo de desarrollo.
- Educación en robótica y aprendizaje por imitación: su bajo coste computacional lo hace adecuado para laboratorios docentes y proyectos de fin de grado.
- Despliegue en robots de bajo coste: al ser un modelo de 450M parámetros, puede ejecutarse en GPUs de consumo (p. ej., RTX 3060) y en robots como el SO-101, facilitando la adopción en entornos con presupuesto limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." Por tanto, no se dispone de métricas de éxito en tareas reales ni comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: con 450M parámetros, en FP32 se requieren aproximadamente 1,8 GB; en FP16, 0,9 GB; en int8, 0,45 GB. Esto permite ejecutar el modelo en GPUs con 4 GB o más.
- GPUs recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM, como NVIDIA RTX 3060, RTX 4060, o incluso GPUs integradas con soporte CUDA.
- Compatibilidad con hardware de consumo: sí, es uno de los objetivos de SmolVLA.
- Opciones de despliegue: el modelo se ejecuta mediante el framework LeRobot, que utiliza PyTorch. No se menciona soporte para vLLM, llama.cpp u otros motores de inferencia, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput: no disponible. Depende del hardware y de la resolución de las imágenes de entrada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos. Sin embargo, SmolVLA se posiciona como una alternativa ligera a otros VLA como OpenVLA (7B parámetros) o RT-2 (55B), que requieren hardware de gama alta. La ventaja principal de SmolVLA es su tamaño reducido, que permite inferencia en tiempo real en GPUs de consumo, a costa de una menor capacidad de generalización. No hay información sobre benchmarks que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado para una única tarea (apagar una palanca) y no generaliza a otras tareas sin fine-tuning adicional.
- Sin evaluación en robot real: la model card no reporta resultados de éxito en despliegues físicos, por lo que su rendimiento real es incierto.
- Dependencia del dataset: el rendimiento depende de la calidad y variedad de las demostraciones; el dataset tiene solo 100 episodios, lo que puede provocar sobreajuste.
- Requisitos de calibración: para su uso en robots reales, es necesario calibrar las cámaras y el robot según las especificaciones del SO-101.
- Posibles sesgos: al ser un modelo de imitación, puede replicar sesgos presentes en las demostraciones (p. ej., variaciones de iluminación, posiciones de objetos).
- Licencia: Apache 2.0 permite uso comercial, pero se debe citar el método y LeRobot según la model card.

## Enlaces

- Repositorio del modelo: https://huggingface.co/HyeonseokE/smolvla_turn_off_lever_cap_1000_10fps
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/turn_off_lever_cap_10fps
- Guía de LeRobot para SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación general de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
