# mrrl-emcnei/act_acbag-slidelift-pick

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice fragmentos de acciones (action chunks) en lugar de pasos individuales. Este repositorio concreto, `mrrl-emcnei/act_acbag-slidelift-pick`, es una política entrenada con LeRobot sobre un robot móvil `mobileai_robot` para la tarea "Pick up the pouch" (recoger una bolsa). El modelo consume el estado del robot (16 dimensiones) y tres cámaras (una cenital y dos en las muñecas) a resolución 480x640, y produce un vector de acción de 16 dimensiones.

El modelo no es un LLM ni un modelo de lenguaje: es una política robótica visuomotora de aproximadamente 51,7 millones de parámetros, empaquetada en formato safetensors y distribuida bajo licencia Apache 2.0. Su relevancia radica en que ejemplifica el flujo completo de LeRobot para entrenar y desplegar políticas de imitación en hardware real, con un dataset pequeño (50 episodios, 25.786 fotogramas a 30 FPS) y un entrenamiento de 100.000 pasos.

La ficha describe las especificaciones, la arquitectura ACT, las capacidades del modelo, sus casos de uso realistas y las limitaciones de un artefacto de este tipo, que está altamente especializado en una única tarea y un único robot.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parámetros totales | 51.689.104 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana temporal de observaciones definida por la configuración de ACT) |
| Tipos de cuantización | no disponible (pesos en safetensors de precisión completa) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la instrucción de tarea es una cadena de texto fija) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería | lerobot |
| Pipeline | robotics |
| Tipo de robot | mobileai_robot |
| Entradas | `observation.state` (16,), `observation.images.cam_high` (3, 480, 640), `observation.images.cam_left_wrist` (3, 480, 640), `observation.images.cam_right_wrist` (3, 480, 640) |
| Salidas | `action` (16,) |
| Tamaño del repositorio | 0,2 GB |
| Dataset de entrenamiento | mrrl-emcnei/acbag-slidelift-pick (50 episodios, 25.786 fotogramas, 30 FPS) |
| Descargas | 14 |
| Likes | 0 |

## Arquitectura y entrenamiento

ACT se basa en un transformer que procesa observaciones multimodales (estado propioceptivo y tres cámaras) y genera secuencias de acciones de forma autorregresiva sobre fragmentos (chunks), lo que reduce el error de acumulación típico de las políticas que predicen paso a paso. El método fue presentado en el artículo arXiv 2304.13705 y está implementado en LeRobot. La política incluye un codificador visual para cada cámara y un decodificador que produce el vector de acción de 16 dimensiones.

El entrenamiento se realizó con LeRobot 0.6.2 durante 100.000 pasos, con batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. El dataset contiene 50 episodios y 25.786 fotogramas grabados a 30 FPS para la tarea "Pick up the pouch". No se documentan detalles sobre aumentación de datos, composición exacta del dataset más allá del número de episodios, ni si se aplicaron técnicas de regularización o decodificación especulativa. Tampoco se indica el número de tokens de entrenamiento (no aplica en el sentido de LLM) ni el uso de RLHF/DPO, que no forman parte del pipeline de ACT.

## Capacidades

- Predicción de acciones robóticas en fragmentos (action chunks) para control visuomotor de un robot móvil.
- Fusión de tres vistas de cámara (cenital y dos muñecas) con el estado propioceptivo de 16 dimensiones.
- Ejecución de una tarea de manipulación concreta: "Pick up the pouch".
- Aprendizaje por imitación a partir de datos de teleoperación.
- Despliegue mediante `lerobot-rollout` con la estrategia `base`.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso en el sentido de agentes LLM.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del dominio robótico.

## Casos de uso

- Recogida automatizada de objetos en almacén: la política puede ejecutar la tarea "Pick up the pouch" sobre un robot `mobileai_robot` equipado con las tres cámaras especificadas, usando el comando `lerobot-rollout` con la ruta del modelo y la instrucción de tarea.
- Reproducción de una política de imitación en laboratorio: útil para validar el pipeline de LeRobot de extremo a extremo (grabación, entrenamiento y despliegue) antes de escalar a tareas más complejas.
- Base para fine-tuning en tareas similares: al estar entrenada con 50 episodios y 25.786 fotogramas, puede servir como inicialización para tareas de recogida de objetos con el mismo robot y configuración de cámaras.
- Evaluación comparativa de métodos de imitación: permite contrastar ACT frente a otras políticas de LeRobot (por ejemplo, diffusion policy) sobre el mismo dataset y hardware.
- Docencia y formación en robótica de imitación: el modelo y su dataset asociado son un ejemplo reproducible de entrenamiento con 100.000 pasos y batch size 8, adecuado para prácticas guiadas.
- Integración en pipelines de investigación con LeRobot: el formato safetensors y la librería lerobot permiten cargar la política en scripts personalizados para experimentos de control y análisis de trayectorias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 millones de parámetros en precisión completa, el peso de los tensores ronda los 0,2 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería ser suficiente para cargar el modelo y procesar tres cámaras a 480x640.
- Cabe en GPU de consumo: sí, previsiblemente en modelos como RTX 3060, RTX 4060, RTX 4090 y similares, aunque no hay confirmación oficial.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base`; el ecosistema LeRobot es la vía documentada.
- Latencia y throughput estimados: no disponibles. El control se ejecuta a 30 FPS según la frecuencia del dataset, pero no se publican métricas de latencia por paso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_acbag-slidelift-pick (este modelo) | 51.689.104 | no aplica | Recogida de bolsa en mobileai_robot | Apache 2.0 | Hugging Face, 14 descargas |
| Otras políticas ACT en LeRobot | no disponible | no aplica | Tareas de manipulación diversas | según repositorio | Hugging Face |
| Diffusion Policy (LeRobot) | no disponible | no aplica | Manipulación visuomotora | según repositorio | Hugging Face |
| Políticas VLA (p. ej. OpenVLA) | no disponible en esta ficha | no disponible | Manipulación generalista | según modelo | Hugging Face |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: entrenado únicamente para la tarea "Pick up the pouch" con un robot `mobileai_robot` y una configuración concreta de tres cámaras; no generaliza a otras tareas, objetos o robots sin reentrenamiento.
- Sin resultados de evaluación publicados: no hay tasas de éxito ni métricas de robustez, por lo que no se puede garantizar su comportamiento en producción.
- Dataset pequeño: 50 episodios y 25.786 fotogramas limitan la diversidad de posiciones, iluminación y distractores, lo que puede provocar sobreajuste al entorno de grabación.
- Dependencia de hardware y calibración: requiere el robot `mobileai_robot`, los puertos y las cámaras correctamente configurados; los nombres de cámara deben coincidir con las claves de observación del entrenamiento.
- Sin capacidades de lenguaje: no procesa instrucciones libres ni mantiene conversaciones; la tarea es una cadena fija.
- Riesgo de alucinación no aplica en el sentido de LLM, pero sí existe riesgo de acciones erróneas o inseguras ante observaciones fuera de distribución.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar la licencia del dataset asociado.
- Sin información sobre sesgos: no se documentan sesgos conocidos, aunque el dataset reducido puede reflejar sesgos de posición y entorno del operador.
- Advertencia de seguridad: cualquier despliegue en un robot real debe incluir paradas de emergencia y supervisión, dado que no hay evaluación publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrrl-emcnei/act_acbag-slidelift-pick
- Dataset de entrenamiento: https://huggingface.co/datasets/mrrl-emcnei/acbag-slidelift-pick
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mrrl-emcnei/acbag-slidelift-pick
- Artículo ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
