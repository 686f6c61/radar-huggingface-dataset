# nguigz/balle5_trained

## Resumen

`nguigz/balle5_trained` es una política de imitación para robótica entrenada con el método ACT (Action Chunking with Transformers) y publicada en Hugging Face mediante la librería LeRobot. No es un modelo de lenguaje: es un modelo de control robótico que consume el estado articular de un robot y una imagen de cámara, y produce comandos de acción de 6 dimensiones. Lo desarrolla el usuario `nguigz` y se distribuye con licencia Apache 2.0.

El modelo resuelve una tarea concreta de manipulación sobre un robot de tipo `so_follower` (el seguidor del brazo SO-100/SO-101 de bajo coste) equipado con una única cámara cenital. La política predice "trozos" de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y estabiliza la ejecución en tiempo real. Es relevante como ejemplo reproducible de un pipeline completo de aprendizaje por imitación con LeRobot.

El tamaño es reducido: 51.668.614 parámetros en formato safetensors, con un repositorio de 0,2 GB. El contexto no es aplicable en el sentido de un LLM; la ventana de observación la define la arquitectura ACT (secuencia de imágenes y estados), y no se especifica en la información disponible. El modelo está entrenado sobre un dataset propio de 50 episodios y 16.722 fotogramas a 30 FPS para la tarea etiquetada como "test".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de observación definida por la configuración ACT) |
| Tipos de cuantización | no disponible (pesos en safetensors; LeRobot no documenta cuantizaciones para esta política) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` |
| Cámaras | `top` (una cámara cenital) |
| Entrada de estado | `observation.state`, forma `(6,)` |
| Entrada visual | `observation.images.top`, forma `(3, 240, 320)` |
| Salida | `action`, forma `(6,)` |
| Dataset de entrenamiento | `nguigz/balle5` (50 episodios, 16.722 fotogramas, 30 FPS) |
| Tarea | `test` |
| Versión de LeRobot | 0.6.2 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un codificador visual (procesa la imagen de la cámara `top` a resolución 240×320 con 3 canales) con un transformer que genera secuencias de acciones. En lugar de predecir una única acción por paso, el modelo predice un chunk de acciones futuras, lo que mitiga el problema de compounding error típico de las políticas reactivas y permite un control más suave. La entrada de estado es un vector de 6 dimensiones (posiciones articulares del brazo `so_follower`) y la salida es también un vector de 6 dimensiones.

El entrenamiento se realizó con LeRobot 0.6.2 durante 100.000 pasos, con batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. Los datos provienen de teleoperación sobre el robot `so_follower`: 50 episodios y 16.722 fotogramas a 30 FPS, todos asociados a la tarea "test". No se documenta en la información disponible si hubo aumentos de datos, regularización adicional ni composición detallada del dataset más allá de los recuentos indicados.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para un brazo `so_follower`.
- Aprendizaje por imitación a partir de demostraciones teleoperadas: reproduce la tarea "test" vista en el dataset.
- Predicción de chunks de acciones: emite secuencias de acciones en lugar de pasos aislados, lo que estabiliza la ejecución.
- Percepción visual monocámara: usa una imagen cenital de 240×320 píxeles como única entrada visual.
- Integración con LeRobot: se ejecuta mediante `lerobot-rollout` y se reentrena con `lerobot-train`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Reproducción de una tarea de manipulación concreta: ejecutar la política sobre un `so_follower` con cámara cenital para replicar la tarea "test" del dataset, usando `lerobot-rollout` con `--policy.path=nguigz/balle5_trained`.
- Base para fine-tuning con datos propios: partir de estos pesos y reentrenar con `lerobot-train` sobre un dataset nuevo del mismo robot y configuración de cámara para adaptar la política a otra tarea.
- Validación de un pipeline de aprendizaje por imitación: usar el modelo como referencia para comprobar que la instalación de LeRobot, la calibración del robot y la captura de cámara funcionan de extremo a extremo.
- Docencia y prototipado en robótica de bajo coste: demostrar el ciclo completo teleoperación → dataset → entrenamiento → despliegue con hardware asequible (SO-100/SO-101).
- Benchmark interno de políticas ACT: comparar el rendimiento de nuevas configuraciones (resolución, número de cámaras, hiperparámetros) contra esta política de referencia.
- Pruebas de integración en laboratorio: evaluar latencia y estabilidad del bucle de control a 30 FPS con una política ACT de ~51,7 M de parámetros antes de invertir en entrenamientos más largos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,7 M de parámetros en fp32 los pesos ocupan aproximadamente 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (RTX 3060, RTX 4090, A100, H100). Para entrenamiento, una RTX 4090 o superior acelera los 100.000 pasos; para inferencia, una GPU modesta es suficiente.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 4 GB de VRAM; también es viable en CPU para pruebas, aunque con mayor latencia.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`) es la vía documentada. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles en la información proporcionada. El bucle de control opera a 30 FPS según la tasa del dataset.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Robot / cámara | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `nguigz/balle5_trained` | 51,7 M | ACT (LeRobot) | `so_follower`, 1 cámara `top` | Apache 2.0 | Hugging Face |
| Políticas ACT de referencia en LeRobot | no disponible | ACT (LeRobot) | variable | Apache 2.0 | Hugging Face / LeRobot |
| Políticas Diffusion Policy en LeRobot | no disponible | Diffusion Policy | variable | Apache 2.0 | Hugging Face / LeRobot |
| Políticas pi0 / pi0.5 (Physical Intelligence) | no disponible en la información | VLA | variable | no disponible | no disponible |

La comparación cuantitativa con alternativas no está disponible: no hay benchmarks publicados para esta política ni datos de rendimiento de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay resultados de éxito en robot real, por lo que se desconoce su fiabilidad fuera del dataset de entrenamiento.
- Dataset muy reducido: 50 episodios y 16.722 fotogramas para una única tarea ("test"); la generalización a posiciones, iluminación u objetos distintos es incierta.
- Dependencia de la configuración exacta: requiere un robot `so_follower` y una cámara llamada `top` con la resolución y encuadre del entrenamiento; cambios en la cámara o su montaje degradan el rendimiento.
- Tarea no descriptiva: la etiqueta "test" no permite saber qué manipulación concreta aprende el modelo.
- Sin capacidades de lenguaje ni razonamiento: no es apto para tareas de NLP, tool calling ni agentes.
- Riesgo de sobreajuste: con 100.000 pasos sobre 50 episodios, es plausible un sobreajuste al dataset; no se documentan técnicas de regularización.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- Sin información sobre sesgos: no aplica en el sentido habitual de sesgos lingüísticos, pero sí existe riesgo de sesgo hacia las condiciones de captura del dataset.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nguigz/balle5_trained
- Dataset de entrenamiento: https://huggingface.co/datasets/nguigz/balle5
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
