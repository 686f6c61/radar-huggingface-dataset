# nguigz/balle4_trained

## Resumen

`nguigz/balle4_trained` es una política de aprendizaje por imitación basada en ACT (Action Chunking with Transformers), entrenada con la librería LeRobot de Hugging Face y publicada en el Hub por el usuario nguigz. No es un modelo de lenguaje: es un controlador robótico que consume el estado articular y una imagen cenital de un robot `so_follower` (SO-100/SO-101) y emite comandos de acción de 6 dimensiones. El problema que resuelve es la manipulación física de un objeto concreto —el task declarado es "mettre la balle dans le bac4"—, aprendiendo directamente de 15 episodios de teleoperación.

El modelo tiene 51.668.614 parámetros (dato real de los pesos en safetensors) y un repositorio de 0,2 GB. La entrada visual es una imagen RGB de 3×240×320 píxeles y el vector de estado tiene 6 componentes; la salida es un vector de acción de 6 componentes. La arquitectura ACT predice *chunks* de acciones (varias acciones futuras de una vez) en lugar de pasos individuales, lo que reduce el error de composición y estabiliza la ejecución en robots de bajo coste.

Es relevante ahora porque ejemplifica el flujo completo de LeRobot 0.6.2: grabación de dataset, entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout`. Su licencia Apache 2.0 y su tamaño reducido lo hacen reproducible en hardware de consumo, aunque su utilidad está acotada a la tarea y al robot exactos con los que fue entrenado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ventana de observación fijada por la arquitectura ACT) |
| Tipos de cuantización | no disponible (pesos en safetensors sin cuantización publicada) |
| Idiomas soportados | no disponible (no procesa lenguaje; el task es una cadena fija en francés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un método de *imitation learning* que combina un backbone transformer con un encoder de imágenes y un decoder que genera secuencias de acciones (*action chunks*). La política recibe `observation.state` de forma `(6,)` y `observation.images.top` de forma `(3, 240, 320)`, y produce `action` de forma `(6,)`. El entrenamiento se realizó con LeRobot 0.6.2 durante 100.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000.

El dataset `nguigz/balle4` contiene 15 episodios y 6.452 frames a 30 FPS, con una única tarea: "mettre la balle dans le bac4". No se documenta composición adicional del dataset, aumento de datos ni fases de RLHF/DPO (no aplicables a este tipo de política). La innovación técnica relevante es el propio *action chunking*: predecir varios pasos futuros mitiga el error acumulado típico de las políticas paso a paso en tareas de manipulación.

## Capacidades

- Control robótico de manipulación: genera comandos de 6 dimensiones para un robot `so_follower`.
- Percepción visual monocámara: usa una imagen cenital de 240×320 para condicionar la acción.
- Ejecución de una tarea concreta de pick-and-place: "mettre la balle dans le bac4".
- Aprendizaje por imitación a partir de teleoperación, sin recompensa explícita.
- Predicción de *action chunks* para trayectorias más suaves y estables.
- Integración con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo ejecuta la secuencia de coger una pelota y depositarla en el contenedor "bac4" sobre un SO-100/SO-101, usando `lerobot-rollout` con `--strategy.type=base` y una duración acotada.
- Reproducción de experimentos de imitation learning: sirve como referencia para comparar hiperparámetros (100k pasos, lr 1e-5, batch 8) con políticas ACT propias sobre el mismo dataset.
- Base para fine-tuning en tareas similares: al compartir arquitectura y formato con LeRobot, se puede reentrenar con `lerobot-train --policy.type=act` sobre un dataset nuevo y comparar curvas.
- Docencia y formación en robótica de bajo coste: el tamaño de 51,7 M de parámetros y el repositorio de 0,2 GB permiten desplegarlo en estaciones de trabajo modestas con una sola GPU.
- Validación de pipelines de datos: el dataset de 15 episodios y 6.452 frames es un caso mínimo para probar herramientas de visualización y curado de LeRobot.
- Pruebas de robustez visual: al depender de una única cámara cenital, es útil para medir la sensibilidad de ACT a cambios de iluminación o posición de la pelota en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real (*"No evaluation results have been provided for this policy yet"*), por lo que no existe tasa de éxito medida para la tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para 51,7 M de parámetros; en la práctica, el cuello de botella es el pipeline de visión y la captura de cámara, no los pesos.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; una RTX 3060/4060 o superior ofrece margen holgado. Para entrenamiento, una RTX 4090 o A100 acelera los 100k pasos, aunque el modelo cabe en GPUs de gama media.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 4 GB de VRAM, e incluso es viable en CPU para inferencia a baja frecuencia.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial), scripts propios con PyTorch y el paquete `lerobot`; no aplican vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. La frecuencia de control está condicionada por el robot y la cámara a 30 FPS del dataset.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `nguigz/balle4_trained` (ACT) | 51,7 M | estado (6,) + imagen 3×240×320 | pick-and-place "balle4" | Apache 2.0 | Hugging Face Hub |
| Políticas ACT de LeRobot (referencia) | ~50 M (según configuración) | estado + imágenes | tareas de manipulación diversas | Apache 2.0 | Hugging Face Hub / docs LeRobot |
| Políticas Diffusion Policy (LeRobot) | variable, mayor que ACT | estado + imágenes | manipulación con acción multimodal | Apache 2.0 | Hugging Face Hub |
| Políticas SmolVLA (LeRobot) | ~450 M | estado + imágenes + instrucción en lenguaje | manipulación guiada por lenguaje | Apache 2.0 | Hugging Face Hub |

La comparación se limita a la familia LeRobot porque no se dispone de datos de rendimiento de este checkpoint frente a alternativas; la diferencia clave es que ACT no acepta instrucciones en lenguaje y está especializado en una única tarea.

## Limitaciones y advertencias

- Especialización extrema: solo se ha entrenado para la tarea "mettre la balle dans le bac4"; no generaliza a otras tareas ni objetos.
- Dependencia del hardware: entrenado para el robot `so_follower` con una cámara `top`; usar otro robot, otra cámara u otra posición cambia la distribución de entrada.
- Sin evaluación publicada: no hay tasa de éxito medida, por lo que no se puede afirmar robustez en producción.
- Dataset muy pequeño: 15 episodios y 6.452 frames implican riesgo alto de sobreajuste y baja variabilidad de escenarios.
- Sin capacidades de lenguaje: no procesa instrucciones, no soporta tool calling ni razonamiento; el campo `task` es una etiqueta fija.
- Riesgo de fallo silencioso: al no haber métricas, un despliegue en robot real requiere supervisión y límites de seguridad físicos.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; la responsabilidad de seguridad recae en el integrador.
- Idiomas: no aplica; la cadena de tarea está en francés y no hay soporte multilingüe.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nguigz/balle4_trained
- Dataset de entrenamiento: https://huggingface.co/datasets/nguigz/balle4
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=nguigz/balle4
