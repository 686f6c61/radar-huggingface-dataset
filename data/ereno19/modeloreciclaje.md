# Ereno19/modeloreciclaje

## Resumen

Ereno19/modeloreciclaje es una política de robótica basada en ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice secuencias cortas de acciones en lugar de acciones individuales. El modelo lo publica el usuario Ereno19 dentro del ecosistema LeRobot y está especializado en una tarea etiquetada como "Reciclaje", usando un robot `so_follower` y dos cámaras: frontal y de pinza.

El modelo tiene 51.668.614 parámetros y un repositorio de 0,2 GB en formato safetensors. Consume `observation.state` de 6 dimensiones y dos imágenes de 3×480×640, y produce una acción de 6 dimensiones. Se entrenó con 264 episodios y 144.278 fotogramas a 30 FPS del dataset Ereno19/reciclaje, mediante 200.000 pasos de entrenamiento con LeRobot 0.6.1.

Su relevancia es práctica: permite reproducir un flujo completo de imitación para manipulación robótica de bajo coste, desde la grabación de demostraciones teleoperadas hasta el despliegue con `lerobot-rollout`. No es un modelo de lenguaje ni un modelo generalista: es una política específica de tarea, sin resultados de evaluación publicados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de aprendizaje por imitación basada en transformer para predicción de chunks de acciones; implementación LeRobot |
| Parámetros totales | 51.668.614 |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No aplica como contexto textual. La política consume estado de 6 dimensiones y dos imágenes de 3×480×640 por paso; no se documenta una ventana temporal explícita |
| Tipos de cuantización | No disponible. Se publican pesos safetensors; no se documentan variantes GGUF, INT8 o FP16 |
| Idiomas soportados | No aplica: no procesa lenguaje natural. La tarea está etiquetada como "Reciclaje" |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` |
| Cámaras | `front` y `gripper`, resolución 480×640 |
| Entradas | `observation.state` (6,), `observation.images.front` (3, 480, 640), `observation.images.gripper` (3, 480, 640) |
| Salidas | `action` (6,) |
| Librería | LeRobot 0.6.1 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice chunks de acciones, es decir, secuencias cortas de comandos en lugar de un único paso. La política se implementa en LeRobot y combina observaciones de estado y visión para generar acciones de 6 dimensiones. La model card no detalla el número exacto de capas, la dimensión oculta, el esquema de atención ni si la implementación concreta incorpora el regularizador CVAE del artículo original; únicamente identifica la familia ACT y la configuración de entradas y salidas.

El entrenamiento usó el dataset Ereno19/reciclaje: 264 episodios, 144.278 fotogramas a 30 FPS y la tarea "Reciclaje". La configuración declarada es de 200.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5, semilla 1000 y LeRobot 0.6.1. No se documenta el uso de RLHF, DPO ni otras fases de alineación, algo esperable en una política de imitación robótica. Tampoco se han publicado resultados de evaluación en robot real.

## Capacidades

- Predice acciones de 6 dimensiones para un robot `so_follower` a partir de estado y dos imágenes.
- Genera chunks de acciones, lo que reduce el encadenamiento de errores frente a políticas que predicen un solo paso.
- Aprende por imitación a partir de demostraciones teleoperadas, sin necesidad de definir una recompensa explícita.
- Utiliza dos vistas: cámara frontal y cámara de pinza, con resolución 480×640.
- Está especializado en la tarea "Reciclaje" del dataset Ereno19/reciclaje.
- Puede ejecutarse en bucle cerrado con `lerobot-rollout` sobre la configuración de robot y cámaras correspondiente.
- No soporta generación de texto, código, matemáticas, visión general, audio ni tool calling.
- No incorpora agentes, function calling ni razonamiento multi-paso textual.
- No se documentan capacidades multilingües, modo thinking ni otras capacidades especiales.

## Casos de uso

- Clasificación y manipulación de residuos en una célula robotizada: el modelo puede recoger objetos reciclables y depositarlos en contenedores usando las cámaras frontal y de pinza. Es adecuado porque se entrenó específicamente con demostraciones de la tarea "Reciclaje".
- Automatización de una tarea repetitiva de pick-and-place con robot SO follower: permite convertir demostraciones teleoperadas en una política ejecutable, reduciendo el trabajo de programación manual de trayectorias.
- Prototipado de una línea de triaje de bajo coste: el repositorio ocupa 0,2 GB y el modelo tiene 51,7 millones de parámetros, por lo que es viable en equipos modestos si se valida la latencia real.
- Fine-tuning para nuevas categorías de residuos: puede usarse como punto de partida y reentrenarse con nuevas demostraciones en LeRobot, siempre que la configuración de robot, cámaras y tarea sea compatible.
- Docencia y formación en aprendizaje por imitación: sirve para demostrar el ciclo completo de grabación de dataset, entrenamiento ACT, visualización de episodios y despliegue con `lerobot-rollout`.
- Validación de pipelines de adquisición de datos: permite comprobar la calibración de las cámaras, la frecuencia de 30 FPS y la correspondencia entre nombres de cámara y claves de observación.
- Pruebas de aceptación en laboratorio: se pueden ejecutar rollouts de duración limitada y contar éxitos manualmente, ya que no hay tasas de éxito publicadas.
- Investigación sobre robustez visual: permite evaluar el comportamiento ante cambios de iluminación, posición de objetos o distracciones, aunque requiere un protocolo de evaluación propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

| Evaluación | Resultado |
|---|---|
| MMLU, HumanEval, GSM8K u otros benchmarks de lenguaje | No aplica: no es un modelo de lenguaje |
| Evaluación en robot real | No disponible; la model card no reporta ensayos, éxitos ni tasas de éxito |
| Latencia o throughput de inferencia | No disponible |

## Requisitos de hardware

- El modelo tiene 51.668.614 parámetros. Los pesos en FP32 ocupan aproximadamente 206,7 MB; en FP16/BF16, aproximadamente 103,3 MB. El repositorio completo ocupa 0,2 GB.
- La VRAM mínima no está publicada. Solo los pesos requieren alrededor de 0,2 GB en FP32; con activaciones y dos imágenes de 480×640, el consumo práctico será mayor, pero no hay una medición oficial.
- Por tamaño, es razonable que quepa en GPUs de consumo como GTX 1650 de 4 GB, RTX 3050 de 8 GB, RTX 4060 de 8 GB o RTX 4090 de 24 GB. También podría ejecutarse en CPU, aunque no se documenta latencia.
- En GPUs de centro de datos, cabría en A100 o H100, pero no se proporcionan cifras de rendimiento ni comparativas.
- El despliegue previsto es LeRobot con `lerobot-rollout` y PyTorch/CUDA. No aplican servidores de LLM como vLLM, llama.cpp, Ollama o TGI.
- No se documenta exportación a ONNX, TensorRT u otros runtimes.
- El dataset se grabó a 30 FPS, pero no se especifica que la política alcance 30 FPS en inferencia. Para control en tiempo real hay que medir la latencia en el hardware concreto.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye especificaciones ni resultados de otras políticas de robótica comparables. Los resultados de búsqueda web recibidos no aportan alternativas de robótica: son páginas de archivo de modelos generativos, detectores de imágenes y directorios no relacionados.

Para una comparación cuantitativa habría que evaluar otras políticas de LeRobot, como Diffusion Policy o VQ-BeT, con el mismo dataset, robot y protocolo de éxito. No se dispone de sus parámetros, contexto, rendimiento ni licencia en la información recibida.

## Limitaciones y advertencias

- El modelo está especializado en la tarea "Reciclaje" y en un robot `so_follower`; no hay evidencia de que generalice a otros robots, objetos, posiciones o entornos.
- No se han publicado evaluaciones en robot real. Se desconoce la tasa de éxito, la robustez y el comportamiento ante fallos.
- Requiere que los nombres y la configuración de las cámaras coincidan con `observation.images.front` y `observation.images.gripper`, y que el robot sea compatible con `so_follower`.
- El entrenamiento se basa en 264 episodios y 144.278 fotogramas de una única tarea; puede sobreajustarse a la configuración de captura, iluminación y posiciones de los objetos.
- No procesa lenguaje natural ni soporta tool calling, agentes o razonamiento multi-paso textual. No debe presentarse como un modelo de propósito general.
- En robótica, el equivalente al riesgo de alucinación son acciones incorrectas o inseguras. No se documenta ningún mecanismo de seguridad, parada de emergencia o verificación de colisiones.
- La licencia del modelo es Apache-2.0, pero la licencia del dataset Ereno19/reciclaje no se indica en la información disponible. Hay que verificarla antes de un uso comercial.
- El modelo tiene 0 descargas y 0 likes en el momento de la información, por lo que no cuenta con validación comunitaria.
- No se documentan cuantizaciones ni optimizaciones de inferencia; el rendimiento real en producción debe medirse.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Ereno19/modeloreciclaje)
- [Dataset Ereno19/reciclaje](https://huggingface.co/datasets/Ereno19/reciclaje)
- [Artículo ACT (arXiv 2304.13705)](https://huggingface.co/papers/2304.13705)
- [Repositorio LeRobot](https://github.com/huggingface/lerobot)
- [Guía de ACT en LeRobot](https://huggingface.co/docs/lerobot/main/en/act)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Instalación de LeRobot](https://huggingface.co/docs/lerobot/main/en/installation)
- [Guía de hardware](https://huggingface.co/docs/lerobot/main/en/hardware_guide)
- [Grabación de datos y entrenamiento de políticas](https://huggingface.co/docs/lerobot/en/il_robots)
- [Referencia de comandos de LeRobot](https://huggingface.co/docs/lerobot/main/en/cheat-sheet)
- [Documentación de inferencia y rollout](https://huggingface.co/docs/lerobot/main/en/inference)
- [Visualización del dataset](https://huggingface.co/spaces/lerobot/visualize_dataset?path=Ereno19/reciclaje)

Los resultados de búsqueda web proporcionados no contienen enlaces adicionales relevantes sobre este modelo.
