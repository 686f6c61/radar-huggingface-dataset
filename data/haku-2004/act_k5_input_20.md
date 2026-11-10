# Haku-2004/act_k5_input_20

## Resumen

`Haku-2004/act_k5_input_20` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el artículo arXiv 2304.13705. No es un modelo de lenguaje: es un controlador visomotor que consume el estado articular y dos cámaras y produce comandos de acción de 6 dimensiones. Lo ha entrenado el usuario Haku-2004 con LeRobot 0.5.2 sobre un robot `so_follower` (una de las variantes de bajo coste del ecosistema SO-100/SO-101) para la tarea "taskbox".

El modelo tiene 51.671.174 parámetros (dato real de los pesos en safetensors) y ocupa 0,2 GB en el repositorio. Su entrenamiento se ha realizado con un dataset muy pequeño: 20 episodios de teleoperación, 25.815 fotogramas a 30 FPS. Es, por tanto, un experimento de imitación de un único usuario y una única tarea, no un modelo generalista.

Su relevancia es acotada pero real: sirve como ejemplo reproducible de entrenamiento ACT con LeRobot y como punto de partida para quien quiera clonar el pipeline. La licencia Apache 2.0 permite reutilizar los pesos sin restricciones comerciales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parámetros totales | 51.671.174 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación temporal de la política) |
| Tipos de cuantización | no disponible (pesos en safetensors, sin versiones cuantizadas publicadas) |
| Idiomas soportados | no disponible (modelo robótico, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |
| Tipo de robot | `so_follower` |
| Cámaras | `front`, `side` (3×480×640 cada una) |
| Entrada de estado | `observation.state` con forma (6,) |
| Salida de acción | `action` con forma (6,) |
| Dataset de entrenamiento | `Haku-2004/k5_4seg` (20 episodios, 25.815 fotogramas, 30 FPS, tarea "taskbox") |
| Pasos de entrenamiento | 50.000 |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice trozos (chunks) de acciones en lugar de pasos individuales, lo que reduce el error de acumulación típico de los controladores paso a paso. La arquitectura combina un backbone visual (procesa las dos cámaras de 480×640), un codificador del estado articular de 6 dimensiones y un transformer que genera secuencias de acciones de 6 dimensiones. El modelo se entrenó con 50.000 pasos, batch de 8, optimizador AdamW, learning rate 1e-5 y semilla 1000, usando LeRobot 0.5.2.

El dataset es extremadamente reducido: 20 episodios y 25.815 fotogramas a 30 FPS para una única tarea ("taskbox"). No hay información sobre aumento de datos, regularización ni composición demográfica del dataset. Tampoco se documenta RLHF, DPO ni ningún ajuste posterior; es imitación supervisada pura sobre teleoperación.

## Capacidades

- Control visomotor de un robot `so_follower` a partir de dos cámaras frontales/laterales y del estado articular de 6 dimensiones.
- Predicción de chunks de acciones de 6 dimensiones para la tarea "taskbox".
- Ejecución autónoma de la política en bucle con `lerobot-rollout` durante el tiempo configurado.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingües, de generación de texto, código, matemáticas, visión general, audio ni modo "thinking".
- No es un agente: no planifica ni descompone tareas; reproduce la política aprendida.

## Casos de uso

- Reproducción de experimentos ACT: sirve como referencia para validar que el pipeline de LeRobot 0.5.2 funciona correctamente en un `so_follower` con dos cámaras antes de entrenar políticas propias.
- Automatización de la tarea "taskbox": ejecución repetida de la manipulación aprendida en el mismo entorno y con la misma disposición de objetos del dataset.
- Base para fine-tuning: al ser Apache 2.0 y pesar solo 0,2 GB, se puede partir de estos pesos y reentrenar con un dataset mayor o distinto para adaptar la política a otra tarea.
- Docencia y divulgación: ejemplo compacto (51,7 M de parámetros) para explicar ACT, chunking de acciones y el flujo `lerobot-train` / `lerobot-rollout` sin necesidad de GPUs grandes.
- Prototipado de bajo coste: al entrenar y ejecutar en hardware SO-100/SO-101, permite validar una idea de manipulación con inversión mínima antes de escalar a robots más caros.
- Benchmark interno de imitación: comparar la tasa de éxito de esta política frente a otras entrenadas con el mismo dataset para medir el efecto de hiperparámetros (pasos, learning rate, número de cámaras).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"), por lo que no se dispone de tasa de éxito, número de ensayos ni comparativas cuantitativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros y pesos en fp32 (≈207 MB) o fp16 (≈103 MB), cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (RTX 3060, RTX 4090, A100, H100). Para entrenamiento, una RTX 3090/4090 es suficiente dado el tamaño del modelo y el batch de 8.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 4 GB de VRAM; incluso podría ejecutarse en CPU con latencia mayor.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con `--policy.device=cuda` o CPU. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. La política está pensada para ejecutarse a 30 FPS (frecuencia del dataset), pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto / ventana | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Haku-2004/act_k5_input_20` | 51,7 M | ACT (imitación) | no aplica | Apache 2.0 | Hugging Face (0 descargas) |
| Políticas ACT de referencia en LeRobot | no disponible | ACT | no aplica | Apache 2.0 | Hugging Face (varias) |
| Políticas Diffusion Policy en LeRobot | no disponible | Diffusion Policy | no aplica | Apache 2.0 | Hugging Face (varias) |
| Políticas π0 / π0.5 (Physical Intelligence) | no disponible en la información | VLA | no aplica | no disponible | no disponible |

No se dispone de datos cuantitativos para comparar tasas de éxito ni latencias con alternativas; la comparación se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- Dataset mínimo: 20 episodios y una sola tarea ("taskbox"); la política probablemente no generaliza a objetos, posiciones o entornos distintos de los del dataset.
- Sin evaluación publicada: no hay tasa de éxito medida, por lo que no se puede afirmar que funcione de forma fiable en producción.
- Dependencia del hardware exacto: entrenada para `so_follower` con cámaras `front` y `side` a 480×640 y 30 FPS; cambios de cámara, montaje o calibración pueden degradar el comportamiento.
- Sin capacidades lingüísticas ni de razonamiento: no debe usarse como modelo de texto, código o visión general.
- Riesgo de sobreajuste: con 25.815 fotogramas y 51,7 M de parámetros, el ajuste a la distribución de entrenamiento es alto.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- Sin versiones cuantizadas ni formatos alternativos: solo safetensors para LeRobot; no hay GGUF ni ONNX publicados.
- Sesgos: no documentados; al ser teleoperación de un único usuario, puede heredar sesgos de estilo de manipulación de esa persona.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k5_input_20
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k5_4seg
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Haku-2004/k5_4seg
- Artículo ACT (arXiv 2304.13705): https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
