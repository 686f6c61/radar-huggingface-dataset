# Rlayd36/act_redblock_chunk10

## Resumen

`Rlayd36/act_redblock_chunk10` es una política de robótica basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705 que predice fragmentos cortos de acciones en lugar de pasos individuales. El modelo ha sido entrenado y publicado con LeRobot, la librería de Hugging Face para aprendizaje automático en robótica real, y está pensado para controlar un robot de tipo `so_follower` (una variante del SO-100/SO-101 de bajo coste) equipado con dos cámaras: una cenital (`overhead`) y otra en la muñeca (`wrist`).

La tarea concreta para la que se ha entrenado es "Red block pickup and place", es decir, recoger un bloque rojo y colocarlo en otra posición. El dataset de entrenamiento contiene 50 episodios y 29.176 fotogramas grabados a 30 FPS mediante teleoperación. El modelo tiene 51.576.454 parámetros (unos 51,6 millones), un tamaño de repositorio de 0,2 GB y se distribuye en formato safetensors bajo licencia Apache 2.0.

Es relevante ahora porque ejemplifica el flujo completo de LeRobot: grabar datos con un robot de bajo coste, entrenar una política ACT y desplegarla con un único comando. No es un modelo de lenguaje ni un modelo fundacional generalista, sino una política visuomotora específica de tarea, útil como referencia para quien quiera reproducir el pipeline de imitación en robótica de sobremesa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones con predicción de chunks |
| Parametros totales | 51.576.454 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política visuomotora, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (el modelo no procesa lenguaje natural; recibe observaciones visuales y de estado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para aprendizaje por imitación que combina un backbone visual (procesa las imágenes de las cámaras `overhead` y `wrist` a resolución 3x480x640) con un transformer encoder-decoder que genera chunks de acciones. La entrada incluye el estado del robot `observation.state` de forma (6,) y las dos imágenes; la salida es un vector de acción de forma (6,), correspondiente a los seis grados de libertad del robot `so_follower`. La predicción por chunks mitiga el problema de la varianza en la predicción paso a paso y suele mejorar la tasa de éxito en tareas de manipulación.

El entrenamiento se realizó con LeRobot 0.6.0 sobre el dataset `Rlayd36/pick-cube_20261116_142939` (50 episodios, 29.176 fotogramas, 30 FPS), con 100.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta el uso de RLHF, DPO ni refuerzo; es aprendizaje supervisado por imitación a partir de teleoperación. Tampoco se detalla la composición exacta del dataset más allá del número de episodios y la tarea.

## Capacidades

- Control visuomotor de un robot `so_follower` con dos cámaras (cenital y muñeca) y estado de 6 dimensiones.
- Predicción de chunks de acciones de 6 dimensiones para tareas de manipulación (pick and place).
- Ejecución de la tarea "Red block pickup and place" mediante `lerobot-rollout`.
- Aprendizaje por imitación a partir de datos de teleoperación; no requiere recompensas explícitas.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de un LLM.
- No tiene capacidades multilingües ni de generación de texto.
- No incluye modo thinking, visión general, audio ni otras capacidades de modelos fundacionales.

## Casos de uso

- Recogida y colocación de bloques en entornos de laboratorio: el modelo ejecuta la tarea "Red block pickup and place" sobre un `so_follower`, adecuado para validar pipelines de imitación en robótica de bajo coste.
- Reproducción del flujo LeRobot: sirve como referencia para grabar datos con teleoperación, entrenar una política ACT y desplegarla con `lerobot-rollout`, gracias a que el repositorio incluye los comandos exactos.
- Prototipado de manipulación con dos cámaras: la configuración `overhead` + `wrist` a 480x640 y 30 FPS permite evaluar la contribución de la visión cenital frente a la de muñeca en tareas de pick and place.
- Base para fine-tuning en tareas similares: al ser Apache 2.0 y tener 51,6 M de parámetros, se puede reentrenar con nuevos datasets de manipulación sin restricciones de licencia.
- Docencia y divulgación: ejemplo compacto (0,2 GB) de política visuomotora para explicar action chunking y aprendizaje por imitación en cursos de robótica.
- Evaluación de robustez ante cambios de iluminación, posición de objetos o distracciones: el modelo card sugiere reportar estas variaciones, por lo que es útil como banco de pruebas de generalización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,6 M de parámetros, los pesos en FP32 ocupan aproximadamente 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no documentadas por el autor; por tamaño, cualquier GPU con al menos 2-4 GB de VRAM sería suficiente, incluidas RTX 3060, RTX 4090 o superiores.
- Cabe en GPU consumer: sí, por el reducido tamaño del modelo; el cuello de botella real es el procesamiento de dos cámaras a 480x640 y 30 FPS.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución y `lerobot-train` para reentrenamiento). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rlayd36/act_redblock_chunk10 | 51,6 M | no aplica | Pick and place de bloque rojo con `so_follower` | Apache 2.0 | Hugging Face (LeRobot) |
| Políticas ACT genéricas de LeRobot | no disponible | no aplica | Manipulación según dataset | Apache 2.0 (habitual) | Hugging Face |
| Políticas Diffusion Policy | no disponible | no aplica | Manipulación por difusión de acciones | variable | Hugging Face / repos |
| Políticas basadas en VLA (p. ej. OpenVLA) | no disponible | no aplica | Manipulación generalista con instrucciones en lenguaje | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- Política específica de tarea: solo se ha entrenado para "Red block pickup and place"; no generaliza a otras tareas sin reentrenamiento.
- Sin resultados de evaluación publicados: no hay tasas de éxito medidas, lo que impide estimar su fiabilidad en producción.
- Dataset pequeño: 50 episodios y 29.176 fotogramas pueden ser insuficientes para robustez ante cambios de iluminación, posiciones de objetos o distracciones.
- Dependencia de hardware concreto: requiere un robot `so_follower` y dos cámaras con los nombres `overhead` y `wrist`; otra configuración invalida la inferencia.
- Sin capacidades de lenguaje: no procesa instrucciones en lenguaje natural ni admite tool calling.
- Riesgo de sobreajuste al entorno de grabación: al ser imitación sobre un dataset limitado, es probable que falle fuera de las condiciones vistas.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; el usuario asume el riesgo de despliegue.
- Sesgos: no documentados por el autor; en robótica, los sesgos provienen de las posiciones, objetos y condiciones del dataset de teleoperación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rlayd36/act_redblock_chunk10
- Dataset de entrenamiento: https://huggingface.co/datasets/Rlayd36/pick-cube_20261116_142939
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Rlayd36/pick-cube_20261116_142939
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
