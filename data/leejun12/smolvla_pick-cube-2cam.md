# LeeJun12/smolvla_pick-cube-2cam

## Resumen

smolvla_pick-cube-2cam es un ajuste fino (fine-tuning) del modelo base SmolVLA, un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face y presentado en el artículo arXiv 2506.01844. Este checkpoint concreto, publicado por el usuario LeeJun12, está especializado en una única tarea robótica de manipulación: coger un cubo y depositarlo en una caja. Se ha entrenado con el framework LeRobot sobre un conjunto de datos propio de 50 episodios y 15.000 fotogramas grabados a 30 FPS con un robot de tipo `so_follower` y dos cámaras (muñeca y cenital).

El modelo resuelve el problema clásico de la imitación visual-motora de bajo coste: convertir observaciones multimodales (estado articular de 6 dimensiones más imágenes de varias cámaras) en comandos de acción de 6 dimensiones, todo ello con un presupuesto de parámetros muy reducido (450 millones) que permite desplegarlo en hardware de consumo. Frente a los grandes VLA de propósito general, SmolVLA apuesta por la eficiencia computacional manteniendo un rendimiento competitivo en tareas de manipulación.

Es relevante ahora porque ejemplifica el flujo de trabajo actual de la robótica open source: partir de un modelo base preentrenado, ajustarlo con datos propios de teleoperación y desplegarlo en un robot de bajo coste mediante LeRobot. La licencia Apache 2.0 y el formato de pesos safetensors facilitan su reutilización tanto en investigación como en prototipos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta, ajustada desde SmolVLA (transformer multimodal con codificador visual y decodificador de acciones) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo no es de lenguaje general; recibe instrucciones de tarea en texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción compacto que combina un codificador visual y un backbone de lenguaje para fusionar observaciones (imágenes de cámaras y estado del robot) con una instrucción de tarea en lenguaje natural, y produce directamente un vector de acciones. Este checkpoint se ha ajustado desde `lerobot/smolvla_base` mediante imitación supervisada con el framework LeRobot 0.6.0.

Los detalles de entrenamiento declarados son: 20.000 pasos, tamaño de lote 32, optimizador AdamW, tasa de aprendizaje 1e-4 y semilla 1000. El conjunto de datos de ajuste contiene 50 episodios y 15.000 fotogramas a 30 FPS para la tarea "Pick up the cube and put it in the box". El modelo recibe `observation.state` de dimensión 6, tres cámaras de 256x256 y una cámara adicional de 480x640, y emite una acción de dimensión 6. No se documentan innovaciones técnicas adicionales específicas de este ajuste más allá de las del modelo base.

## Capacidades

- Generación de acciones robóticas de manipulación (6 dimensiones) a partir de observaciones visuales y de estado articular.
- Fusión de múltiples cámaras: entrada de tres vistas de 256x256 y una vista de 480x640, además del estado del robot.
- Condicionamiento por instrucción en lenguaje natural (la tarea se pasa como texto en la inferencia).
- Ejecución de una tarea concreta de pick-and-place ("Pick up the cube and put it in the box").
- Despliegue en hardware de consumo gracias a su tamaño reducido (450 M de parámetros).
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes ni modalidades de audio.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo ejecuta la secuencia de coger un cubo y colocarlo en una caja con un robot `so_follower`, adecuado para validar pipelines de imitación antes de escalar a tareas más complejas.
- Prototipado rápido de políticas robóticas: sirve como plantilla para ajustar SmolVLA con datos propios, ya que el flujo de entrenamiento con LeRobot está documentado y el checkpoint parte de un modelo base público.
- Investigación en aprendizaje por imitación: permite reproducir experimentos de VLA compactos con un conjunto de datos pequeño (50 episodios) y comparar variantes de configuración de cámaras.
- Docencia y formación en robótica: su bajo coste computacional y su licencia permisiva lo hacen apto para cursos prácticos de teleoperación y entrenamiento de políticas.
- Pruebas de integración de hardware de bajo coste: valida la cadena completa cámara-robot-política en entornos con GPU de consumo.
- Base para experimentos de aumento de datos: al ser un ajuste fino reproducible, se puede reentrenar con variaciones del dataset para estudiar robustez ante cambios de iluminación o posiciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 M de parámetros, en precisión FP16 el peso ronda los 0,9 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no se especifican en la información; por tamaño, una RTX 4090 o incluso GPUs de gama media serían suficientes, pero no hay confirmación oficial.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del checkpoint (repo de 0,9 GB) y la orientación del modelo base a hardware de consumo.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) con el robot `so_follower`; no se documentan otros backends como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smolvla_pick-cube-2cam | 450 M | no disponible | Pick-and-place concreto | Apache 2.0 | Hugging Face (LeRobot) |
| lerobot/smolvla_base | no disponible en la informacion | no disponible | VLA general base para ajuste | no disponible en la informacion | Hugging Face |
| Otros VLA de gran tamano (p. ej. familias tipo OpenVLA) | no disponible en la informacion | no disponible | Manipulacion general | no disponible en la informacion | no disponible |

No se dispone de datos suficientes en la información proporcionada para una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo se ha entrenado para una tarea y un robot concretos; no generaliza a otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito ni pruebas en robot real, por lo que su fiabilidad en producción es desconocida.
- Dataset pequeño: 50 episodios y 15.000 fotogramas limitan la robustez ante variaciones de iluminación, posiciones de objetos o distracciones.
- Dependencia de la configuración de cámaras: los nombres y resoluciones de las cámaras deben coincidir con las claves de observación del entrenamiento.
- Riesgo de sobreajuste al entorno de grabación y al robot `so_follower` específico.
- No se documentan sesgos ni riesgos de alucinación en el sentido de modelos de lenguaje; el riesgo principal es el fallo de la política ante condiciones fuera de distribución.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Idiomas: no aplica como modelo de lenguaje general; la instrucción de tarea se pasa en texto sin evaluación multilingüe documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LeeJun12/smolvla_pick-cube-2cam
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Artículo SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/LeeJun12/pick-cube-2cam_20261028_193431
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=LeeJun12/pick-cube-2cam_20261028_193431
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA de LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
