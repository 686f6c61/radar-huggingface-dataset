# inhastupid/act_50

## Resumen

`inhastupid/act_50` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), una técnica de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales. El modelo lo publica el usuario `inhastupid` en Hugging Face y se ha entrenado y subido con LeRobot, la librería de Hugging Face para aprendizaje automático en robótica real. No se trata de un modelo de lenguaje, sino de un controlador visomotor que mapea observaciones (estado del robot e imagen de cámara) a comandos de acción de 6 dimensiones.

El modelo resuelve una tarea concreta de manipulación: "Pick the object and place it on the target". Consume un vector de estado de 6 dimensiones y una imagen RGB de 480x640 píxeles procedente de una cámara superior, y produce una acción de 6 dimensiones. Con 51.668.614 parámetros y un repositorio de 0,2 GB en formato safetensors, es un modelo compacto pensado para ejecutarse en el bucle de control de un robot de tipo `so_follower` a 30 FPS.

Su relevancia es acotada: es un artefacto de investigación/experimentación reproducible, no un modelo generalista. Resulta útil como referencia para entender el flujo de entrenamiento de ACT en LeRobot y como punto de partida para reentrenar políticas de pick-and-place con datos propios, pero no dispone de evaluación publicada ni de licencia declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; no es un modelo de lenguaje; ventana de observación definida por la política) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; la tarea se especifica como cadena de texto fija) |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un backbone transformer con un encoder de imágenes y un decoder que emite chunks de acciones. En lugar de predecir una única acción por paso, el modelo predice una secuencia corta de acciones futuras, lo que reduce el error de acumulación y mejora la estabilidad del control. La política de este repositorio consume `observation.state` (6 dimensiones) y `observation.images.top` (3x480x640) y produce `action` (6 dimensiones), según la model card.

El entrenamiento se realizó sobre el dataset `inhastupid/pick_place_100`, compuesto por 100 episodios y 60.000 frames a 30 FPS de la tarea "Pick the object and place it on the target". La configuración declarada es de 10.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05, semilla 1000 y LeRobot 0.7.1. No se documenta composición adicional del dataset, uso de RLHF/DPO, aumentos de datos ni innovaciones técnicas más allá del propio método ACT. Tampoco se especifica la variante exacta del backbone ni el número de tokens de entrenamiento.

## Capacidades

- Control visomotor para manipulación robótica: mapea estado articular y una imagen cenital a comandos de acción de 6 dimensiones.
- Aprendizaje por imitación a partir de demostraciones teleoperadas (100 episodios, 60.000 frames).
- Predicción de action chunks, que aporta suavidad y robustez frente a errores de acumulación en el bucle de control.
- Ejecución en tiempo real a 30 FPS sobre un robot `so_follower` con una cámara `top`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades especiales más allá de la percepción visual para control.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo ejecuta la tarea "Pick the object and place it on the target" sobre un `so_follower` con cámara cenital, adecuado para validar pipelines de imitación antes de escalar a tareas más complejas.
- Reproducción de experimentos de ACT: sirve como referencia reproducible para comparar configuraciones de entrenamiento (pasos, batch, learning rate) en LeRobot.
- Base para fine-tuning con datos propios: al ser una política compacta de ~51,7 M de parámetros, se puede reentrenar con un dataset propio de pick-and-place siguiendo el comando `lerobot-train` documentado.
- Docencia y formación en robótica de imitación: permite mostrar el ciclo completo grabación de datos, entrenamiento y despliegue con `lerobot-rollout` en hardware asequible.
- Prototipado rápido de controladores visomotores: su reducido tamaño (0,2 GB) facilita iterar en una estación de trabajo con GPU de consumo.
- Benchmark interno de robustez: útil para medir la tasa de éxito bajo variaciones de iluminación, posición de objetos o distractores, aunque el autor no haya publicado resultados.
- Integración en pipelines de evaluación automatizada: se puede orquestar con `lerobot-rollout` y `--duration` para ejecuciones acotadas y registrar episodios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito, latencia medida ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en FP32 el peso ronda los 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU con al menos 2-4 GB de VRAM libre, incluyendo el coste del encoder visual y del buffer de imagen 480x640.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 3060/4060 o superior es suficiente; A100/H100 no son necesarias para inferencia.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU moderna con soporte CUDA; también es viable en CPU para pruebas, aunque no se documenta latencia.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución y `lerobot-train` para reentrenamiento). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles. El dataset y la política están pensados para 30 FPS, pero no se aportan mediciones reales de latencia en el robot.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| inhastupid/act_50 | 51,7 M | no aplica | sin evaluación publicada | no disponible | Hugging Face (LeRobot) |
| Otras políticas ACT en LeRobot Hub | variable | no aplica | variable, a menudo sin evaluación | variable | Hugging Face |
| Políticas Diffusion Policy (LeRobot) | variable | no aplica | no disponible en esta ficha | variable | Hugging Face / repos de investigación |
| Políticas VLA tipo pi0/OpenVLA | cientos de M a miles de M | contexto visual/textual | benchmarks publicados en sus papers | variable | Hugging Face |

No se dispone de datos cuantitativos para una comparación rigurosa con alternativas concretas; la comparativa anterior es cualitativa y se basa en la categoría de modelo, no en mediciones de este artefacto.

## Limitaciones y advertencias

- Sin licencia declarada: la model card indica "[More Information Needed]", por lo que el uso comercial no está autorizado de forma explícita y requiere contactar con el autor.
- Sin evaluación publicada: no hay tasas de éxito ni pruebas en robot real, así que el rendimiento real es desconocido.
- Especialización extrema: solo está entrenado para una tarea ("Pick the object and place it on the target") y un robot concreto (`so_follower`) con una cámara `top`; no generaliza a otras tareas, morfologías ni configuraciones de cámara sin reentrenamiento.
- Dependencia de la configuración de observación: los nombres y formas de las features (`observation.state`, `observation.images.top`, `action`) deben coincidir exactamente en el robot de despliegue.
- Dataset pequeño y de un solo autor: 100 episodios y 60.000 frames son insuficientes para garantizar robustez ante cambios de iluminación, posición de objetos o distractores.
- Riesgo de sobreajuste al entorno de grabación: sin evaluación, no se puede descartar que la política memorice posiciones o condiciones específicas del dataset.
- Sin soporte de lenguaje natural: la "tarea" es una cadena fija; no hay comprensión de instrucciones variables.
- Sin cuantizaciones publicadas: no hay variantes GGUF ni optimizadas para despliegue en hardware limitado.
- Fecha de creación futura en los metadatos (2026-11-19): conviene verificar la integridad y procedencia del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inhastupid/act_50
- Dataset de entrenamiento: https://huggingface.co/datasets/inhastupid/pick_place_100
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=inhastupid/pick_place_100
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
