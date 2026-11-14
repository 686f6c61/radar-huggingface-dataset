# allez-ale/act_pod_to_container_v2_50k

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la precisión en tareas de manipulación robótica. Este checkpoint concreto, `act_pod_to_container_v2_50k`, ha sido entrenado por el usuario allez-ale con LeRobot sobre un robot SO-101 y una tarea específica: coger una cápsula de café y depositarla en un contenedor.

El modelo es una política visomotora que consume el estado articular del robot (6 dimensiones) y dos flujos de imagen de 480x640 píxeles (cámara superior y cámara de muñeca) para producir acciones de 6 dimensiones a 30 FPS. Con 51,7 millones de parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto orientado a inferencia en tiempo real sobre hardware de consumo.

Su relevancia es práctica: demuestra el flujo completo de LeRobot para entrenar políticas de imitación sobre robots de bajo coste como el SO-101, con licencia Apache 2.0 y pesos en safetensors. No es un modelo de lenguaje ni un modelo fundacional generalista, sino una política especializada en una única tarea de pick-and-place entrenada con 50 episodios de teleoperación (34.539 frames).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parámetros totales | 51.668.614 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (política visomotora; ventana de observación definida por la configuración de entrenamiento, no disponible) |
| Tipos de cuantización | No disponible (pesos en safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | No aplica (modelo robótico; la tarea se especifica mediante un prompt de texto en inglés: "Pick up the coffee pod and put it in the container") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` (SO-101) |
| Cámaras de entrada | `top` y `wrist`, 3x480x640 cada una |
| Entrada de estado | `observation.state`, shape (6,) |
| Salida de acción | `action`, shape (6,) |
| Frecuencia de datos | 30 FPS |
| Librería | LeRobot 0.6.2 |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para aprendizaje por imitación que predice chunks de acciones (secuencias cortas de comandos) en lugar de una sola acción por paso. La arquitectura combina un codificador visual que procesa las imágenes de las cámaras `top` y `wrist`, una proyección del estado articular de 6 dimensiones y un decodificador transformer que genera el chunk de acciones de 6 dimensiones. El método se describe en el paper arXiv:2304.13705 y está implementado en LeRobot.

El entrenamiento se realizó sobre el dataset `allez-ale/so101_pod_to_container_v2`, compuesto por 50 episodios de teleoperación con 34.539 frames a 30 FPS, todos ellos de la tarea "Pick up the coffee pod and put it in the container". La configuración reportada es: 50.000 pasos de entrenamiento, batch size 8, optimizador AdamW, learning rate 1e-5, semilla 1000 y LeRobot 0.6.2. No se documenta el uso de RLHF, DPO ni técnicas de refinamiento posteriores; es aprendizaje supervisado puro a partir de demostraciones.

## Capacidades

- Manipulación robótica visomotora: genera comandos de 6 dimensiones para un brazo SO-101 a partir de estado articular y dos vistas de cámara.
- Ejecución de una tarea específica de pick-and-place: coger una cápsula de café y colocarla en un contenedor.
- Política de acción por chunks: predice secuencias cortas de acciones, lo que mejora la estabilidad frente a políticas paso a paso.
- Inferencia en tiempo real: entrenada con datos a 30 FPS y desplegable mediante `lerobot-rollout`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual, código, matemáticas, visión general, audio ni modo thinking. Es una política especializada, no un modelo de propósito general.
- Capacidades multilingües: no aplica; la tarea se condiciona con un prompt de texto en inglés.

## Casos de uso

- Automatización de pick-and-place en línea de montaje: el modelo ejecuta la secuencia de coger una pieza y depositarla en un contenedor, adecuado para tareas repetitivas de alimentación de componentes en celdas de fabricación con robot SO-101.
- Prototipado rápido de políticas de imitación: sirve como referencia de un pipeline completo LeRobot (grabación de datos, entrenamiento ACT, rollout) para equipos que quieran validar su hardware antes de escalar a tareas más complejas.
- Investigación en aprendizaje por imitación: checkpoint reproducible con configuración de entrenamiento documentada (50k pasos, lr 1e-5, batch 8) útil como baseline para comparar variantes de ACT, aumentos de datos o cambios en la disposición de cámaras.
- Docencia y formación en robótica: ejemplo real de política visomotora entrenada con 50 episodios que ilustra el ciclo completo de teleoperación a despliegue en un robot de bajo coste.
- Benchmark de hardware SO-101: permite medir latencia, throughput y estabilidad de la política en distintas configuraciones de GPU y cámaras antes de invertir en un dataset propio.
- Base para fine-tuning en tareas similares: al estar en safetensors y Apache 2.0, puede reentrenarse con nuevos datasets de manipulación de objetos pequeños y posiciones similares.
- Validación de infraestructura de inferencia: útil para probar `lerobot-rollout`, calibración de cámaras y mapeo de puertos antes de desplegar políticas en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet", por lo que no hay tasas de éxito, número de ensayos ni condiciones de evaluación documentadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 millones de parámetros en fp32 los pesos ocupan aproximadamente 0,2 GB, por lo que la VRAM necesaria vendrá dominada por las activaciones de los dos flujos de imagen de 480x640 y el buffer de inferencia.
- GPU recomendadas: no se especifican en la model card. El comando de entrenamiento usa `--policy.device=cuda`, lo que implica soporte CUDA.
- GPU de consumo: por el tamaño del modelo (0,2 GB de pesos) es plausible que quepa en GPUs de consumo con suficiente VRAM para las imágenes, pero no hay confirmación oficial ni lista de GPUs validadas.
- Opciones de despliegue: `lerobot-rollout` con `--policy.path=allez-ale/act_pod_to_container_v2_50k`; el ecosistema LeRobot es la vía documentada. No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de política).
- Latencia y throughput: no disponibles. Los datos de entrenamiento están a 30 FPS, pero no se reporta la latencia de inferencia real en ninguna GPU.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros checkpoints ACT comparables ni resultados de evaluación que permitan una comparación cuantitativa con alternativas de la misma categoría (por ejemplo, otras políticas ACT de LeRobot entrenadas para tareas de pick-and-place).

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada únicamente para la tarea "Pick up the coffee pod and put it in the container" sobre un robot SO-101 con cámaras `top` y `wrist`; no generaliza a otras tareas, objetos ni disposiciones de cámara sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito ni condiciones de prueba documentadas, por lo que no se puede afirmar su fiabilidad en producción.
- Dependencia del hardware: requiere un robot `so_follower`, dos cámaras con los nombres y resoluciones exactos (`top`, `wrist`, 480x640) y calibración correcta; cualquier cambio en la configuración invalida la política.
- Riesgo de sobreajuste al dataset: con solo 50 episodios y 34.539 frames, es probable que el modelo sea sensible a cambios de iluminación, posición de objetos o distractores, aunque esto no se cuantifica en la model card.
- Sin soporte multilingüe ni de texto general: el prompt de tarea está en inglés y el modelo no procesa lenguaje natural más allá de condicionar la política.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; la responsabilidad de validación en producción recae en el integrador.
- Sesgos conocidos: no documentados; en robótica por imitación los sesgos provienen de la distribución de demostraciones (posiciones, velocidades, estilo de teleoperación del operador), no cuantificados aquí.
- Riesgo de alucinación: no aplica en el sentido de texto generado, pero sí existe riesgo de acciones erráticas fuera de la distribución de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/allez-ale/act_pod_to_container_v2_50k
- Dataset de entrenamiento: https://huggingface.co/datasets/allez-ale/so101_pod_to_container_v2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=allez-ale/so101_pod_to_container_v2
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
