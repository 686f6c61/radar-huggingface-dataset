# CarolinePascal/grabette-red-cube-green-box-glannuzel-act-25

## Resumen

Grabette-red-cube-green-box-glannuzel-act-25 es una política de imitación para robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705. La desarrolla la usuaria CarolinePascal y se distribuye a través del ecosistema LeRobot de Hugging Face. El modelo resuelve una tarea concreta de manipulación: colocar un cubo rojo dentro de una caja verde, partiendo de demostraciones teleoperadas sobre un robot de tipo `grabette`.

La arquitectura es un transformer ACT que predice trozos de acción (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y estabiliza el control. El modelo tiene 51.589.768 parámetros y consume una imagen de cámara a resolución 648x486 junto con un vector de estado de 2 dimensiones, produciendo una acción de 8 dimensiones. Está pensado para ejecutarse en el robot con la CLI `lerobot-rollout`.

Es relevante como ejemplo práctico y reproducible de entrenamiento de políticas con LeRobot: incluye la configuración completa de entrenamiento (20.000 pasos, batch 64, AdamW, lr 1e-05) y el dataset asociado de 177 episodios y 31.496 fotogramas a 30 FPS. No obstante, es una política de un solo task y un solo robot, sin evaluación publicada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer de imitación |
| Parametros totales | 51.589.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ventana de observación de un paso) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no aplica; el modelo no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de una acción por paso. La política combina un codificador visual sobre la imagen de `cam0` (3x486x648) con el estado del robot (2 dimensiones) y genera una acción de 8 dimensiones. Esta formulación por chunks mitiga el error compounding típico de las políticas paso a paso y permite control a mayor frecuencia efectiva.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `local/put-red-cube-in-green-box_act_648x486`: 177 episodios, 31.496 fotogramas a 30 FPS, tarea "put-red-cube-in-green-box". La configuración fue de 20.000 pasos, batch 64, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta el uso de RLHF, DPO ni aumentación de datos, ni innovaciones adicionales más allá del propio método ACT.

## Capacidades

- Control robótico de manipulación: ejecuta la tarea "put-red-cube-in-green-box" sobre el robot `grabette`.
- Percepción visual monocular a través de una única cámara (`cam0`, 648x486).
- Predicción de acciones de 8 dimensiones a partir de estado de 2 dimensiones.
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Ejecución en bucle cerrado con la CLI `lerobot-rollout` de LeRobot.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del control motor.

## Casos de uso

- Automatización de una celda de pick-and-place: la política ejecuta la secuencia de coger el cubo rojo y depositarlo en la caja verde, adecuada para demostrar flujos de manipulación en laboratorio con el robot `grabette`.
- Prototipado de pipelines de imitación con LeRobot: sirve como referencia reproducible para validar la instalación, el hardware y el flujo `lerobot-train` / `lerobot-rollout` antes de entrenar tareas propias.
- Benchmark interno de políticas ACT: al tener configuración de entrenamiento documentada, permite comparar variantes (más pasos, otro batch, otra resolución) sobre la misma tarea.
- Docencia y formación en robótica de imitación: ejemplo completo con dataset, pesos y comandos de ejecución para explicar action chunking y control visomotor.
- Base para fine-tuning en tareas similares: se puede partir de estos pesos y reentrenar con un dataset propio de manipulación sobre el mismo robot y cámara.
- Pruebas de integración hardware-software: validar cámaras OpenCV, calibración del robot y latencia de inferencia en un montaje real antes de desplegar políticas más complejas.
- Investigación en robustez visual: evaluar cómo afectan cambios de iluminación, posición de objetos o distractores a una política ACT entrenada con 177 episodios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,6 M de parámetros en safetensors, la huella de pesos es de aproximadamente 0,2 GB en FP32, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA es suficiente; no se requieren A100 ni H100. Una RTX 4090, RTX 3090 o incluso GPUs de gama media son adecuadas.
- Cabe en GPU consumer: sí, con amplio margen; también es viable en CPU para pruebas, aunque la latencia será mayor.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) es la vía documentada. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles. Dependen del robot, la cámara y el hardware; el dataset se grabó a 30 FPS, lo que sugiere que el bucle de control debe operar en ese orden de magnitud.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/observación | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| grabette-red-cube-green-box-glannuzel-act-25 | 51,6 M | Imagen 3x486x648 + estado 2D | put-red-cube-in-green-box | Apache 2.0 | Hugging Face (LeRobot) |
| Políticas ACT genéricas de LeRobot | no disponible | variable | múltiples tareas | Apache 2.0 | Hugging Face (LeRobot) |
| Políticas Diffusion Policy | no disponible | variable | manipulación | no disponible | Hugging Face (LeRobot) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Entrenada para una única tarea ("put-red-cube-in-green-box") y un único robot (`grabette`); no generaliza a otras tareas ni morfologías sin reentrenamiento.
- Sin resultados de evaluación publicados: no hay tasa de éxito medida, por lo que la fiabilidad real es desconocida.
- Depende de una sola cámara (`cam0`) y de un estado de 2 dimensiones; cambios en la configuración de sensores invalidan la política.
- Sensible a cambios de iluminación, posición de objetos, distractores y a diferencias entre robots del mismo tipo; no se documenta robustez frente a estas variaciones.
- Dataset pequeño (177 episodios, 31.496 fotogramas) y de origen local, lo que limita la diversidad de demostraciones.
- Riesgo de sobreajuste a las condiciones exactas de grabación; no hay información sobre sesgos más allá de los del propio dataset.
- Licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar el cumplimiento en el contexto de su robot y su dataset.
- No apta para producción sin una evaluación propia en el entorno real; la model card no aporta métricas de latencia ni de éxito.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CarolinePascal/grabette-red-cube-green-box-glannuzel-act-25
- Paper ACT: https://huggingface.co/papers/2304.13705
- Dataset de entrenamiento: https://huggingface.co/datasets/local/put-red-cube-in-green-box_act_648x486
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
