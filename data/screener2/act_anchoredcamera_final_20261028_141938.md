# Screener2/act_AnchoredCamera_Final_20261028_141938

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales, lo que reduce el error de composición y mejora la estabilidad en tareas de manipulación robótica. Este repositorio concreto, `Screener2/act_AnchoredCamera_Final_20261028_141938`, es una política entrenada con LeRobot sobre un robot `so_follower` con una única cámara cenital (`overhead`), destinada a la tarea "Green cylinder to yellow bucket".

El modelo tiene 51.668.614 parámetros y se distribuye en formato safetensors a través de la librería `lerobot`. No es un modelo de lenguaje: consume un vector de estado de 6 dimensiones y una imagen RGB de 480x640, y produce un vector de acción de 6 dimensiones. Su relevancia es la de un artefacto reproducible de robótica de imitación, útil para evaluar el pipeline de entrenamiento y despliegue de LeRobot en hardware de bajo coste tipo SO-100/SO-101.

La política se entrenó durante 100.000 pasos con batch de 8 y learning rate de 1e-5 sobre un dataset muy pequeño (15 episodios, 7.684 frames a 30 FPS), lo que la convierte en un ejemplo de prototipo más que en un modelo listo para producción general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de imitación por chunk de acciones) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT combina un backbone visual (codificador de imágenes) con un transformer que mapea observaciones (estado del robot e imagen) a un chunk de acciones futuras. La predicción por chunks, en lugar de paso a paso, mitiga el problema de acumulación de errores típico de las políticas de imitación y permite un control más suave. En este caso, la entrada es `observation.state` de forma `(6,)` y `observation.images.overhead` de forma `(3, 480, 640)`, y la salida es `action` de forma `(6,)`.

El entrenamiento se realizó con LeRobot 0.5.2 sobre el dataset `Screener2/AnchoredCamera_Final_20261028_141938`: 15 episodios, 7.684 frames a 30 FPS, tarea "Green cylinder to yellow bucket". Configuración: 100.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5, semilla 1000. No se documenta en la model card el uso de RLHF, DPO ni aumentos de datos; se trata de aprendizaje por imitación supervisado a partir de teleoperación. No se especifica el número de tokens ni la composición del dataset más allá de los episodios y frames indicados.

## Capacidades

- Control robótico por imitación para la tarea específica "Green cylinder to yellow bucket".
- Predicción de chunks de acciones de 6 dimensiones a partir de estado de 6 dimensiones e imagen cenital de 480x640.
- Ejecución en robots `so_follower` (familia SO-100/SO-101 de bajo coste).
- Integración con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Prototipado de manipulación pick-and-place: la política puede recoger un cilindro verde y depositarlo en un cubo amarillo en un entorno controlado con cámara cenital, sirviendo como base para validar el pipeline completo de LeRobot antes de escalar a tareas más complejas.
- Evaluación de hardware SO-100/SO-101: permite comprobar la calibración de brazos, cámaras y puertos serie mediante `lerobot-rollout` con `--strategy.type=base` y una duración acotada.
- Reproducción de experimentos de imitación: al estar entrenada con una configuración documentada (100k pasos, batch 8, lr 1e-5, semilla 1000), sirve para comparar variaciones de hiperparámetros o de aumentos de datos sobre el mismo dataset.
- Docencia y formación: ejemplo mínimo y reproducible de ACT con un dataset de 15 episodios, adecuado para talleres sobre aprendizaje por imitación y teleoperación.
- Base para fine-tuning: punto de partida para reentrenar con `lerobot-train` sobre nuevos datasets con la misma morfología de robot y cámara cenital.
- Benchmark interno de latencia y throughput: permite medir el coste de inferencia de ACT en GPUs consumer antes de comprometerse con arquitecturas más pesadas (p. ej. difusión o VLA).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; por el tamaño (51,7 M de parámetros) y una entrada de imagen de 480x640, es previsible que quepa holgadamente en GPUs consumer, pero no se aporta una cifra oficial.
- GPU recomendadas: no disponible. El comando de entrenamiento de la model card usa `--policy.device=cuda`, sin especificar modelo de GPU.
- Cabe en GPU consumer: previsiblemente sí por el reducido número de parámetros, aunque no se documenta una medición.
- Opciones de despliegue: `lerobot-rollout` (estrategia base) y `lerobot-train` para reentrenamiento; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de política).
- Latencia y throughput: no disponibles. El dataset se grabó a 30 FPS, lo que sugiere que el bucle de control debe sostener esa frecuencia, pero no se aporta medición del modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Screener2/act_AnchoredCamera_Final_20261028_141938 | 51.668.614 | ACT (imitación) | estado (6,) + imagen 480x640 | apache-2.0 | Hugging Face (LeRobot) |
| Políticas ACT genéricas de LeRobot | no disponible | ACT | variable según dataset | apache-2.0 (típico) | Hugging Face |
| Políticas de difusión (Diffusion Policy) en LeRobot | no disponible | difusión | variable según dataset | no disponible | Hugging Face |
| Políticas VLA (p. ej. OpenVLA) | no disponible en esta ficha | VLA | instrucciones en lenguaje + imagen | no disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a tipo de arquitectura, licencia y disponibilidad.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido: 15 episodios y 7.684 frames, insuficiente para generalizar a variaciones de posición, iluminación o distractores.
- Una sola tarea ("Green cylinder to yellow bucket") y una sola cámara (`overhead`); cualquier cambio de tarea, morfología o disposición de cámara invalida la política.
- Sin resultados de evaluación publicados: no hay tasa de éxito medida en robot real.
- Riesgo de sobreajuste y de fallo ante objetos o colores distintos a los del entrenamiento.
- Dependencia del hardware `so_follower` y de la calibración exacta de puertos y cámaras; los nombres de cámara deben coincidir con las claves de observación.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- No aplica a tareas de lenguaje, visión general ni agentes; no debe presentarse como un modelo de propósito general.
- No se documentan sesgos, pero al ser una política entrenada con datos de un único operador y entorno, hereda sus sesgos de ejecución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Screener2/act_AnchoredCamera_Final_20261028_141938
- Dataset de entrenamiento: https://huggingface.co/datasets/Screener2/AnchoredCamera_Final_20261028_141938
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de rollout/inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Screener2/AnchoredCamera_Final_20261028_141938
