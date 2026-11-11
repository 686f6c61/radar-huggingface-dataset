# 08semi/lekiwi_prototype3

## Resumen

`08semi/lekiwi_prototype3` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), una técnica de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales. El modelo lo publica el usuario 08semi en Hugging Face usando la librería LeRobot de Hugging Face y está diseñado para controlar un robot móvil de tipo `lekiwi_client` equipado con dos cámaras (frontal y de muñeca).

El modelo tiene 51.674.761 parámetros (unos 51,7 millones) y ocupa 0,2 GB en el repositorio. Consume como entrada el estado del robot (vector de 9 dimensiones) y dos imágenes RGB (480x640 y 640x480) y produce como salida un vector de acción de 9 dimensiones. Es, por tanto, un modelo de política visomotora de pequeño tamaño, no un modelo de lenguaje: no procesa texto ni genera lenguaje natural.

Su relevancia es la de un prototipo de investigación en manipulación robótica con aprendizaje por imitación, entrenado sobre un dataset propio de 99 episodios y 146.785 frames a 30 FPS. La model card no incluye resultados de evaluación en robot real, licencia ni idiomas, y el modelo no tiene descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.674.761 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política robótica; ventana de observación definida por la arquitectura ACT, no especificada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors |
| Tipo de robot | `lekiwi_client` |
| Cámaras | `front`, `wrist` |
| Entrada `observation.state` | STATE, forma `(9,)` |
| Entrada `observation.images.front` | VISUAL, forma `(3, 480, 640)` |
| Entrada `observation.images.wrist` | VISUAL, forma `(3, 640, 480)` |
| Salida `action` | ACTION, forma `(9,)` |
| Dataset de entrenamiento | `08semi/dataset_prototype1` (99 episodios, 146.785 frames, 30 FPS) |
| Pasos de entrenamiento | 150.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.7.1 |
| Tamaño del repo | 0,2 GB |

## Arquitectura y entrenamiento

El modelo implementa ACT (Action Chunking with Transformers), presentado en el paper arXiv:2304.13705. ACT es un método de aprendizaje por imitación que combina un codificador visual (que procesa las imágenes de las cámaras frontal y de muñeca) con un transformer que predice un chunk de acciones futuras en lugar de una sola acción por paso. Esta predicción por chunks reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. La entrada de estado es un vector de 9 dimensiones y la salida de acción también es de 9 dimensiones, coherente con el espacio de control del robot `lekiwi_client`.

El entrenamiento se realizó con LeRobot 0.7.1 sobre el dataset `08semi/dataset_prototype1`, compuesto por 99 episodios teleoperados y 146.785 frames a 30 FPS. Se ejecutaron 150.000 pasos con batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. La model card no detalla la composición del dataset, la descripción de la tarea (aparece como "My task description", un placeholder) ni si hubo aumentos de datos o regularización adicional. Tampoco se especifica la arquitectura interna exacta (número de capas, dimensión de los embeddings, mecanismo de atención), por lo que esos datos no están disponibles.

## Capacidades

- Control visomotor de un robot móvil `lekiwi_client` a partir de dos cámaras RGB y un vector de estado de 9 dimensiones.
- Predicción de chunks de acciones de 9 dimensiones para ejecución continua a 30 FPS.
- Aprendizaje por imitación a partir de datos teleoperados (no requiere refuerzo ni recompensas explícitas).
- Ejecución autónoma de la tarea aprendida mediante `lerobot-rollout` con `--strategy.type=base`.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico: es una política robótica, no un LLM.
- No tiene capacidades multilingües ni de generación de texto.
- No se documentan capacidades especiales adicionales (thinking mode, visión general, audio) más allá del procesamiento de las dos cámaras indicadas.

## Casos de uso

- Manipulación robótica repetitiva en laboratorio: el modelo ejecuta la tarea aprendida sobre el robot `lekiwi_client` usando las cámaras frontal y de muñeca, adecuado para prototipos de investigación en aprendizaje por imitación.
- Recolección de datos comparativos: sirve como política base para comparar variantes de ACT o de otros métodos de imitación sobre el mismo dataset `08semi/dataset_prototype1`.
- Validación de pipelines de LeRobot: útil para probar el flujo completo de `lerobot-rollout` y `lerobot-train` con un checkpoint real de 51,7 M de parámetros.
- Demostraciones de teleoperación a autónomo: permite mostrar la transición de datos teleoperados a ejecución autónoma en entornos controlados con iluminación y posiciones de objeto similares a las del entrenamiento.
- Base para fine-tuning en tareas similares: al ser un modelo pequeño (0,2 GB), se puede reentrenar con nuevos datasets de pocos centenares de episodios en una GPU de consumo.
- Investigación en chunking de acciones: permite estudiar el efecto del tamaño de chunk y de la ventana de observación en la estabilidad de la política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación vacía con la nota "_No evaluation results have been provided for this policy yet._", por lo que no hay tasas de éxito, número de ensayos ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en safetensors, el peso en FP32 ronda los 0,2 GB y en FP16 unos 0,1 GB, por lo que la inferencia cabe holgadamente en cualquier GPU de consumo moderna.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 3060 o superior es suficiente para inferencia, y una RTX 4090 o A100 acelera el entrenamiento y la recolección de datos.
- Cabe en GPU de consumo: sí, por el tamaño del modelo (0,2 GB de repo); el cuello de botella real es el procesamiento de dos cámaras a 30 FPS y el bucle de control del robot.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base` y `--policy.path=08semi/lekiwi_prototype3`); no se documentan opciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles; el modelo está pensado para ejecutarse en el bucle de control del robot a 30 FPS, pero no se publican medidas de latencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `08semi/lekiwi_prototype3` | ACT (LeRobot) | 51,7 M | no aplica | no disponible | Hugging Face, 0 descargas |
| Políticas ACT de referencia en LeRobot | ACT (LeRobot) | variable, no disponible | no aplica | normalmente Apache-2.0 en el repo LeRobot | Hugging Face / GitHub |
| Políticas Diffusion Policy | difusión para robótica | variable, no disponible | no aplica | variable | Hugging Face / GitHub |
| Políticas VLA (p. ej. OpenVLA) | vision-language-action | miles de millones | contexto textual | variable | Hugging Face |

No se dispone de datos de rendimiento de `08semi/lekiwi_prototype3` para comparar numéricamente con estas alternativas; la comparación se limita a tipo de arquitectura, tamaño y disponibilidad.

## Limitaciones y advertencias

- No hay resultados de evaluación en robot real: se desconoce la tasa de éxito de la política.
- La tarea entrenada aparece como "My task description" en la model card, un placeholder sin descripción real; no se sabe qué tarea concreta aprendió el modelo.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución.
- Dataset pequeño (99 episodios, 146.785 frames) y de un único prototipo, lo que limita la generalización a nuevas posiciones de objetos, iluminación o robots distintos.
- Es un prototipo (`prototype3`) sin descargas ni validación de la comunidad; no debe usarse en producción sin evaluación propia.
- No es un modelo de lenguaje: no tiene capacidades de texto, tool calling ni razonamiento simbólico, y no debe evaluarse con benchmarks de LLM.
- Riesgo de sobreajuste al entorno de recogida de datos y de fallo ante distribuciones visuales distintas a las de las cámaras `front` y `wrist` entrenadas.
- No se documentan sesgos, pero al ser un modelo visomotor puede heredar sesgos de los datos teleoperados (posiciones, objetos y condiciones de iluminación concretas).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/08semi/lekiwi_prototype3
- Dataset de entrenamiento: https://huggingface.co/datasets/08semi/dataset_prototype1
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=08semi/dataset_prototype1
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de rollout/inferencia: https://huggingface.co/docs/lerobot/main/en/inference
