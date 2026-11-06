# polarisai-robots/bento_ur7e_fineart_v2

## Resumen

`bento_ur7e_fineart_v2` es una política robótica de tipo VLA (Vision-Language-Action) publicada por Polaris.AI Robotics, derivada por fine-tuning del modelo base `lerobot/FineART-VLA-subtask-midtrained`. FineART-VLA, desarrollado por Scale AI y Hugging Face, extiende el modelo π₀.₅ con una cabeza de lenguaje entrenada que predice el siguiente subtarea en lenguaje natural (System 2) y la ejecuta mediante un experto de acciones basado en flow matching (System 1), empleando aislamiento de conocimiento para preservar el VLM preentrenado.

Esta versión concreta está especializada en una tarea de manipulación bimanual sobre un robot Universal Robots UR7e: empaquetar un fiambrera (lunchbox) con piezas de pollo frito y brócoli, o con filetes de pescado y salchichas. El modelo consume el estado articular (14 dimensiones) y tres cámaras (superior y dos de muñeca) a resolución 360×640, y produce acciones de 7 dimensiones.

Con 4.143.404.816 parámetros (~4,1 mil millones) y un repositorio de 9,4 GB en formato safetensors, es relevante como ejemplo de política end-to-end de imitación con razonamiento lingüístico intermedio, entrenada sobre un dataset propio de 377 episodios y 767.361 fotogramas a 60 FPS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en π₀.₅ con cabeza de lenguaje (System 2) y experto de acciones por flow matching (System 1) |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo opera sobre instrucciones de tarea en inglés en el dataset de entrenamiento) |
| Licencia | gemma |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Modelo base | lerobot/FineART-VLA-subtask-midtrained |
| Tipo de robot | ur7e |
| Camaras | top, wrist (entradas `cam_high`, `cam_left_wrist`, `cam_right_wrist`) |
| Entrada de estado | `observation.state` de forma `(14,)` |
| Entrada visual | `(3, 360, 640)` por cámara |
| Salida de accion | `action` de forma `(7,)` |
| Dataset de entrenamiento | polarisai-robots/bento_ur7e_v5 (377 episodios, 767.361 fotogramas, 60 FPS) |

## Arquitectura y entrenamiento

FineART-VLA parte de π₀.₅ y le añade una cabeza de lenguaje entrenada que actúa como System 2: el modelo predice en lenguaje natural la siguiente subtarea antes de ejecutarla. La ejecución la realiza un experto de acciones basado en flow matching (System 1), que genera trayectorias continuas de 7 dimensiones a partir del estado articular y de las tres vistas de cámara. La técnica de aislamiento de conocimiento (knowledge insulation) protege al VLM preentrenado durante el mid-training, evitando que el aprendizaje de la cabeza de lenguaje degrade las representaciones visuales y lingüísticas originales.

El modelo base fue mid-entrenado sobre el dataset bimanual FineART, densamente anotado con subtareas en lenguaje. Esta versión concreta se fine-tuneó sobre `polarisai-robots/bento_ur7e_v5` durante 80.000 pasos, con batch size 16, optimizador AdamW, learning rate 5e-05 y semilla 1000, usando LeRobot 0.6.2. El dataset contiene dos tareas de empaquetado de fiambrera con instrucciones en inglés y fue grabado a 60 FPS con dos cámaras. No se detalla en la información disponible la composición completa del dataset ni si se aplicaron etapas de RLHF o DPO específicas para esta política.

## Capacidades

- Generación de acciones de manipulación robótica end-to-end a partir de observaciones visuales y de estado articular.
- Razonamiento lingüístico intermedio: predice la siguiente subtarea en lenguaje (System 2) antes de ejecutar la acción (System 1).
- Ejecución de tareas bimanuales de empaquetado con instrucciones en lenguaje natural.
- Procesamiento multimodal: tres cámaras RGB (superior y dos de muñeca) más estado de 14 dimensiones.
- Control de robot UR7e mediante comandos de 7 dimensiones.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue (`lerobot-rollout`, `lerobot-train`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes multi-paso general: no disponible (el razonamiento por subtareas es específico del dominio robótico).
- Capacidades multilingües: no disponible.

## Casos de uso

- Empaquetado automatizado de fiambreras en línea de producción: la política ejecuta la tarea completa de colocar dos piezas de pollo frito y dos de brócoli (o dos filetes de pescado y tres salchichas) en una fiambrera, usando las tres cámaras para localizar los objetos y el estado articular para el control bimanual.
- Investigación en imitación bimanual: sirve como referencia reproducible para estudiar políticas VLA con razonamiento lingüístico intermedio sobre un UR7e, gracias a la integración con LeRobot y al dataset público asociado.
- Base para fine-tuning en tareas de food assembly: el modelo puede reentrenarse con `lerobot-train` sobre nuevos datasets de empaquetado para adaptarlo a otros menús o configuraciones de bandeja.
- Evaluación de arquitecturas System 1 / System 2 en robótica: permite comparar el enfoque de subtareas en lenguaje de FineART-VLA frente a políticas puramente reactivas en entornos de manipulación real.
- Prototipado de células robóticas de catering: despliegue en un UR7e con cámara superior y dos de muñeca para validar la viabilidad de la automatización antes de invertir en integración industrial.
- Benchmarking de robustez visual: al depender de tres vistas, es útil para medir cómo afectan cambios de iluminación, posiciones de objetos o distracciones en tareas de picking-and-placing con instrucciones en lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que aún no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 4,14 mil millones de parámetros, una estimación orientativa en FP16 sería de unos 8-9 GB solo para pesos, más el overhead de las tres cámaras y del experto de acciones.
- GPU recomendadas: no disponible; por tamaño, cabría esperar ejecución en GPUs de consumo con suficiente VRAM, pero el fabricante no lo especifica.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=polarisai-robots/bento_ur7e_fineart_v2`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política robótica.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| polarisai-robots/bento_ur7e_fineart_v2 | 4.143.404.816 | no disponible | VLA (FineART-VLA / π₀.₅) | gemma | Hugging Face |
| polarisai-robots/bento_ur7e_pi05_v2 | no disponible | no disponible | Política π₀.₅ sobre UR7e | no disponible | Hugging Face |
| lerobot/FineART-VLA-subtask-midtrained | no disponible | no disponible | VLA base mid-entrenado | no disponible | Hugging Face |

La comparativa detallada de rendimiento entre estas alternativas no está disponible en la información proporcionada; no se han publicado métricas de éxito ni benchmarks comparativos.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación en robot real, por lo que se desconoce la tasa de éxito de la política.
- El modelo está especializado en dos tareas concretas de empaquetado de fiambrera; su generalización a otros objetos, menús o configuraciones no está validada.
- Depende de una configuración hardware específica (UR7e, cámara superior y dos de muñeca, resolución 360×640); cambios en la disposición de cámaras o en el robot pueden degradar el rendimiento.
- El dataset de entrenamiento es reducido (377 episodios), lo que puede limitar la robustez ante variaciones de iluminación, posiciones o distracciones.
- Riesgo de alucinación en la predicción de subtareas en lenguaje: una subtarea mal predicha por el System 2 puede propagarse al experto de acciones.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia `gemma`: es necesario revisar los términos de la licencia Gemma antes de un uso comercial, ya que impone condiciones específicas de uso y redistribución.
- Idiomas soportados no documentados; las instrucciones de tarea del dataset están en inglés, por lo que el soporte de instrucciones en castellano no está garantizado.
- No se documentan tipos de cuantización ni requisitos de VRAM, lo que dificulta planificar el despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/polarisai-robots/bento_ur7e_fineart_v2
- Modelo base: https://huggingface.co/lerobot/FineART-VLA-subtask-midtrained
- Dataset de entrenamiento: https://huggingface.co/datasets/polarisai-robots/bento_ur7e_v5
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=polarisai-robots/bento_ur7e_v5
- Guía LeRobot fineart_vla: https://huggingface.co/docs/lerobot/main/en/fineart_vla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Modelo relacionado: https://huggingface.co/polarisai-robots/bento_ur7e_pi05_v2
- Dataset relacionado: https://huggingface.co/datasets/polarisai-robots/bento_ur7e_v2
