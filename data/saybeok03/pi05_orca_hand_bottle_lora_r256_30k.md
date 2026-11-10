# saybeok03/pi05_orca_hand_bottle_lora_r256_30k

## Resumen

π₀.₅ Orca Hand Bottle LoRA r256 30k es un checkpoint de política robótica de tipo Vision-Language-Action (VLA) obtenido mediante fine-tuning con LoRA del modelo base `lerobot/pi05_base`, que a su vez es la implementación en LeRobot del π₀.₅ de Physical Intelligence. El modelo está publicado por el usuario `saybeok03` y resuelve una tarea concreta de manipulación: "move the bottle" (mover una botella) sobre un entorno con una mano Orca. La relevancia es acotada: no es un modelo generalista, sino una política de imitación entrenada sobre un dataset propio de 75 episodios y 70.393 fotogramas a 30 FPS.

El checkpoint se distribuye en formato `safetensors` con un tamaño de repositorio de 3,0 GB y licencia Apache 2.0. La adaptación se ha realizado con LoRA de rango 256 durante 30.000 pasos, con batch size 32, optimizador AdamW y learning rate 1e-4, usando LeRobot 0.6.1. La arquitectura subyacente es la de π₀.₅, un VLA que combina percepción visual multicámara, estado propioceptivo y generación de acciones continuas.

La ficha debe leerse con cautela: la model card no aporta resultados de evaluación en robot real, no documenta el número de parámetros del modelo base ni la longitud de contexto, y el autor no ha publicado métricas de éxito. Todo lo que sigue se limita a lo que consta en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) π₀.₅, implementación LeRobot del modelo de Physical Intelligence |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a robótica, no a texto general) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 3,0 GB) |
| Modelo base | lerobot/pi05_base |
| Metodo de adaptacion | LoRA, rango 256 |
| Pasos de entrenamiento | 30.000 |
| Batch size | 32 |
| Optimizador | AdamW |
| Learning rate | 1e-4 |
| Semilla | 1000 |
| Version de LeRobot | 0.6.1 |
| Entrada de estado | `observation.state`, shape (20,) |
| Entradas visuales | `observation.images.bottom`, `observation.images.wrist`, `observation.images.realsense`, cada una (3, 480, 640) |
| Salida | `action`, shape (20,) |
| Dataset de entrenamiento | saybeok03/orca-hand-bottle (75 episodios, 70.393 fotogramas, 30 FPS) |
| Tarea | "move the bottle." |
| Pipeline | robotics |

## Arquitectura y entrenamiento

El modelo es una política VLA construida sobre π₀.₅, la evolución de π₀ de Physical Intelligence orientada a generalización en entornos abiertos. La implementación utilizada es la de LeRobot, adaptada del repositorio OpenPI de Physical Intelligence. La política consume tres flujos de imagen RGB de 480×640 (cámaras `bottom`, `wrist` y `realsense`) junto con un vector de estado propioceptivo de 20 dimensiones, y produce un vector de acción continuo también de 20 dimensiones. No se detalla en la información disponible la composición interna del transformer, el número de parámetros ni el mecanismo exacto de fusión visión-lenguaje-acción.

El entrenamiento es un fine-tuning por imitación sobre el dataset `saybeok03/orca-hand-bottle`, compuesto por 75 episodios y 70.393 fotogramas grabados a 30 FPS, todos asociados a la instrucción "move the bottle". Se aplicó LoRA con rango 256 sobre el modelo base `lerobot/pi05_base` durante 30.000 pasos, con batch size 32, AdamW y learning rate 1e-4, semilla 1000 y LeRobot 0.6.1. No consta en la información disponible si hubo RLHF, DPO ni ninguna fase de alineamiento adicional, ni detalles sobre la composición del dataset más allá de la tarea y el número de episodios.

## Capacidades

- Generación de acciones robóticas continuas de 20 dimensiones a partir de observaciones multimodales (tres cámaras y estado propioceptivo).
- Ejecución de una tarea de manipulación concreta: mover una botella ("move the bottle").
- Percepción visual multicámara: cámara inferior, cámara de muñeca y cámara RealSense.
- Condicionamiento por instrucción en lenguaje natural, heredado de la arquitectura VLA del modelo base.
- Control de una mano robótica Orca, según se deduce del nombre del repositorio y del dataset.
- No consta soporte de tool calling, function calling, agentes multi-paso ni razonamiento textual general; estas capacidades no aplican a una política de imitación de este tipo.
- No consta capacidad multilingüe ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Manipulación de botellas en laboratorio: la política se ejecuta con `lerobot-rollout` sobre un robot con las tres cámaras configuradas y la instrucción "move the bottle", lo que permite reproducir la tarea grabada en el dataset con la misma disposición de sensores.
- Punto de partida para fine-tuning adicional: al ser un LoRA sobre `lerobot/pi05_base`, sirve como inicialización para nuevas tareas de manipulación con la misma mano Orca, reduciendo el coste frente a entrenar desde el modelo base.
- Validación de pipelines de imitación en LeRobot: útil para comprobar el flujo completo de grabación, entrenamiento y despliegue con LeRobot 0.6.1 antes de escalar a datasets mayores.
- Investigación en adaptación de bajo rango: el checkpoint documenta una configuración LoRA concreta (r=256, 30k pasos, lr 1e-4) que puede replicarse o compararse en experimentos de eficiencia de ajuste.
- Demostraciones reproducibles: al estar publicado con instrucciones de rollout y dataset abierto, permite a otros grupos reproducir la tarea y comparar configuraciones de cámara y robot.
- Evaluación de robustez visual: las tres vistas (bottom, wrist, realsense) permiten estudiar cómo afectan cambios de iluminación, oclusión o posición de cámara al éxito de la política, siempre que se realicen las pruebas correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política y que no consta ninguna tabla de ensayos con tasa de éxito.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 3,0 GB en safetensors, pero no se especifica el tamaño en parámetros ni el coste de memoria en ejecución.
- GPU recomendadas: no disponible. La model card solo menciona `--policy.device=cuda` como opción de entrenamiento.
- Compatibilidad con GPU de consumo: no confirmada; no hay datos de memoria ni de latencia que permitan determinarlo.
- Opciones de despliegue: LeRobot, mediante `lerobot-rollout` para inferencia y `lerobot-train` para entrenamiento. No consta soporte documentado de vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para este tipo de política.
- Latencia y throughput: no disponibles. El dataset se grabó a 30 FPS, pero no se indica la frecuencia de control efectiva de la política.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| saybeok03/pi05_orca_hand_bottle_lora_r256_30k | no disponible | no disponible | Mover botella con mano Orca | Apache 2.0 | Hugging Face, 0 descargas |
| lerobot/pi05_base | no disponible | no disponible | VLA generalista base para fine-tuning | no disponible en la información | Hugging Face (modelo base) |
| π₀.₅ de Physical Intelligence (OpenPI) | no disponible | no disponible | VLA generalista de propósito abierto | no disponible en la información | Repositorio OpenPI |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al entrenarse sobre un único dataset de 75 episodios con una sola tarea, es esperable un sesgo fuerte hacia las condiciones de grabación (posiciones, iluminación, fondo y robot concretos), aunque el autor no lo cuantifica.
- Riesgo de alucinación: en el sentido de generar acciones no válidas o fuera de distribución cuando el entorno difiere del dataset de entrenamiento; no hay evaluación que lo mida.
- Limitaciones de contexto e idioma: la política está condicionada a la instrucción "move the bottle" y no se documenta su comportamiento con otras instrucciones ni con variaciones lingüísticas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base `lerobot/pi05_base` y del repositorio OpenPI de Physical Intelligence, que no consta en la información disponible.
- Sin evaluación publicada: no hay tasa de éxito en robot real, ni número de ensayos, ni condiciones de dificultad, por lo que no debe asumirse un rendimiento concreto en producción.
- Dependencia de hardware específico: requiere una mano Orca y tres cámaras con los nombres `bottom`, `wrist` y `realsense`; los nombres de cámara deben coincidir con las claves de observación del entrenamiento.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin validación por parte de la comunidad.
- Fecha de creación futura en los metadatos (2026-11-10), lo que conviene contrastar antes de citar el checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saybeok03/pi05_orca_hand_bottle_lora_r256_30k
- Dataset de entrenamiento: https://huggingface.co/datasets/saybeok03/orca-hand-bottle
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=saybeok03/orca-hand-bottle
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de π₀.₅ de Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de π₀.₅ en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
