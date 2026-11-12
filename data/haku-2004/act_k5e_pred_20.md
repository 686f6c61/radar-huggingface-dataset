# Haku-2004/act_k5e_pred_20

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales, lo que reduce el error compuesto y mejora la estabilidad en tareas de manipulación robótica. Este repositorio concreto, `Haku-2004/act_k5e_pred_20`, es una política entrenada con LeRobot sobre el robot `so_follower` para la tarea "taskbox", con dos cámaras (frontal y lateral) y un vector de estado de 6 dimensiones.

El modelo resuelve el problema de mapear observaciones visuales y propioceptivas a comandos de actuación de 6 grados de libertad en tiempo real (30 FPS). Es relevante porque ejemplifica el flujo completo de LeRobot para entrenar políticas de imitación con datos teleoperados y desplegarlas en hardware asequible tipo SO-100/SO-101, sin necesidad de grandes infraestructuras de entrenamiento.

Con 51.672.714 parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto que cabe en GPUs de consumo. La información pública disponible es limitada: no hay resultados de benchmarks ni evaluación en robot real, y el dataset de entrenamiento consta de solo 20 episodios (25.815 frames a 30 FPS).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.672.714 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de imitación por frame) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT emplea un transformer con un codificador visual (procesa las imágenes de las cámaras `front` y `side` a 480x640) y un decodificador que genera un chunk de acciones de forma (6,) a partir del estado `observation.state` de forma (6,). La innovación principal del método es predecir secuencias de acciones en lugar de acciones individuales, lo que mitiga el error acumulado típico de las políticas paso a paso.

El entrenamiento se realizó con LeRobot 0.5.2 sobre el dataset `Haku-2004/k5_4seg`: 20 episodios, 25.815 frames a 30 FPS, tarea "taskbox". Configuración: 50.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5, semilla 1000. No se especifica en la información disponible si hubo aumento de datos, regularización temporal (temporal ensembling) ni detalles sobre la composición exacta del dataset más allá del número de episodios y frames.

## Capacidades

- Generación de comandos de actuación de 6 dimensiones para el robot `so_follower` a partir de observaciones visuales y de estado.
- Percepción visual mediante dos cámaras (frontal y lateral) a resolución 480x640.
- Ejecución de la tarea "taskbox" aprendida por imitación de datos teleoperados.
- Predicción de chunks de acciones (no pasos individuales), lo que aporta suavidad y robustez en la ejecución.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades cognitivas.

## Casos de uso

- Automatización de la tarea "taskbox" en un robot SO-100/SO-101: la política ejecuta la manipulación aprendida directamente con `lerobot-rollout`, adecuada para demostrar flujos de imitación en laboratorio.
- Prototipado rápido de políticas de imitación: sirve como referencia para validar el pipeline de LeRobot (grabación, entrenamiento, despliegue) antes de escalar a datasets mayores.
- Investigación en aprendizaje por imitación: permite reproducir el método ACT con un caso concreto y comparar variantes de arquitectura o hiperparámetros.
- Docencia y formación en robótica: ejemplo completo y ligero (0,2 GB) para enseñar el ciclo completo de una política visuomotora.
- Benchmark interno de hardware: al ser un modelo pequeño, se puede usar para medir latencia y throughput de inferencia en distintas GPUs con LeRobot.
- Base para fine-tuning: punto de partida para reentrenar con más episodios o nuevas tareas sobre el mismo robot y configuración de cámaras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet").

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~51,7 M de parámetros, la inferencia en FP32 requiere aproximadamente 0,2 GB de pesos, más el coste de activaciones y procesamiento de imágenes; en la práctica cabe holgadamente en GPUs con 4-8 GB.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; RTX 3060/4060 o superiores son suficientes. Para entrenamiento, se recomienda RTX 3090/4090 o A100/H100 si se escala el dataset.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs consumer modernas con al menos 4 GB de VRAM.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte de PyTorch/CUDA. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de política).
- Latencia y throughput estimados: no disponibles en la información proporcionada; el control se ejecuta a 30 FPS según la configuración del dataset.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Haku-2004/act_k5e_pred_20 | 51,7 M | ACT (LeRobot) | no aplica | apache-2.0 | Hugging Face |
| Políticas ACT genéricas de LeRobot | variable | ACT | no aplica | apache-2.0 | Hugging Face / LeRobot |
| Diffusion Policy (referencia del estado del arte en imitación) | variable | diffusion | no aplica | según implementación | Repositorios de investigación |
| VQ-BeT / otras políticas de imitación | variable | transformer/discreto | no aplica | según implementación | Repositorios de investigación |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada. La comparación se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido (20 episodios, 25.815 frames), lo que limita la generalización y aumenta el riesgo de sobreajuste a posiciones, iluminación y objetos concretos.
- Sin evaluación en robot real publicada: no hay evidencia cuantitativa de tasa de éxito.
- Específico para el robot `so_follower` y para la tarea "taskbox"; no es transferible directamente a otros robots, tareas o configuraciones de cámara sin reentrenamiento.
- Requiere que los nombres e índices de cámara coincidan con las claves de observación (`observation.images.front`, `observation.images.side`); un desajuste provoca fallos de ejecución.
- No es un modelo de lenguaje: no genera texto, no razona y no soporta instrucciones en lenguaje natural más allá de la etiqueta de tarea.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erráticas fuera de la distribución de entrenamiento.
- Licencia apache-2.0 permite uso comercial, pero la ausencia de evaluación y el reducido dataset desaconsejan su uso en producción sin validación adicional.
- No se documentan sesgos ni restricciones adicionales en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k5e_pred_20
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k5_4seg
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
