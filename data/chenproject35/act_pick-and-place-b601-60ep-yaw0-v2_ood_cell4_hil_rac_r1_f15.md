# chenproject35/act_pick-and-place-b601-60ep-yaw0-v2_ood_cell4_hil_rac_r1_F15

## Resumen

El modelo `act_pick-and-place-b601-60ep-yaw0-v2_ood_cell4_hil_rac_r1_F15` es una política de imitación para robótica entrenada con el método Action Chunking with Transformers (ACT), publicado por el usuario `chenproject35` en Hugging Face. No es un modelo de lenguaje: es un controlador visomotor que recibe el estado articular del robot y dos imágenes de cámara (frontal y de muñeca) y emite comandos de acción de 7 dimensiones. Se distribuye a través de la librería LeRobot de Hugging Face y está pensado para ejecutarse sobre un robot `rebot_b601_follower`.

El modelo resuelve una tarea concreta de manipulación: recoger un objeto denominado `inreach2` y colocarlo en un utillaje (jig). Se entrenó con 60 episodios de teleoperación (58.148 fotogramas a 30 FPS) y 85.000 pasos de entrenamiento. Su relevancia es acotada: es un artefacto de investigación reproducible dentro del ecosistema LeRobot, útil para estudiar variantes de entrenamiento (el sufijo del nombre sugiere configuraciones de *out-of-distribution*, *human-in-the-loop*, *rac* y un factor F15) más que como componente de propósito general.

La arquitectura es un transformer ACT con 51.670.663 parámetros totales, licencia Apache 2.0 y pesos en formato safetensors. El repositorio ocupa 10,5 GB, muy por encima de lo que sugiere el recuento de parámetros, lo que apunta a checkpoints intermedios o artefactos adicionales empaquetados junto a los pesos finales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.670.663 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación definida por la configuración de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Entradas | `observation.state` (7,), `observation.images.cam_front` (3, 480, 640), `observation.images.cam_wrist` (3, 480, 640) |
| Salidas | `action` (7,) |
| Tipo de robot | `rebot_b601_follower` |
| Dataset de entrenamiento | `chenproject35/pick-and-place-b601-60ep-yaw0-v2` (60 episodios, 58.148 fotogramas, 30 FPS) |
| Tarea | "Pick up inreach2 and place it in the jig." |
| Pasos de entrenamiento | 85.000 |
| Batch size | 4 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.2 |
| Descargas | 23 |
| Tamaño del repositorio | 10,5 GB |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación presentado en el artículo arXiv:2304.13705. En lugar de predecir una acción por paso, el modelo predice un *chunk* de acciones futuras de forma conjunta, lo que reduce el error de acumulación típico de las políticas paso a paso y suaviza la ejecución. La arquitectura combina un codificador de imágenes (procesa las dos cámaras a 480x640) con un transformer que fusiona las representaciones visuales con el estado propioceptivo de 7 dimensiones y genera la secuencia de acciones. El modelo incluye típicamente un codificador de estilo latente (CVAE) para modelar la variabilidad de las demostraciones humanas.

El entrenamiento se realizó sobre 60 episodios de teleoperación con 58.148 fotogramas a 30 FPS, durante 85.000 pasos con batch size 4, AdamW y learning rate 1e-05, semilla 1000, usando LeRobot 0.6.2. No se documenta en la información disponible el número de tokens, la composición exacta del dataset más allá del recuento de episodios, ni si hubo etapas de refinamiento adicionales (RLHF/DPO no aplican a este tipo de política). El nombre del repositorio sugiere variantes experimentales (`ood_cell4`, `hil`, `rac`, `r1`, `F15`) que no se describen en la model card.

## Capacidades

- Control visomotor de manipulación robótica: genera comandos de acción de 7 dimensiones a partir de dos vistas de cámara y del estado articular.
- Ejecución de una tarea concreta de pick-and-place: recoger `inreach2` y depositarlo en el jig.
- Predicción de *action chunks*: emite secuencias de acciones en lugar de pasos individuales, lo que mejora la estabilidad de la ejecución.
- Funcionamiento en tiempo real a 30 FPS, coherente con la frecuencia de captura del dataset de entrenamiento.
- Integración nativa con LeRobot: se ejecuta con `lerobot-rollout` y se reentrena con `lerobot-train`.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, capacidades multilingües ni modos de pensamiento: no es un modelo de lenguaje.

## Casos de uso

- Automatización de una celda de pick-and-place: el modelo recoge el objeto `inreach2` y lo inserta en el jig, replicando la tarea para la que fue entrenado en un robot `rebot_b601_follower` con dos cámaras a 480x640 y 30 FPS.
- Reproducción de experimentos de aprendizaje por imitación: sirve como referencia para comparar variantes de entrenamiento (los sufijos `ood`, `hil`, `rac` sugieren ablaciones) dentro de un pipeline LeRobot reproducible.
- Base para *fine-tuning* en tareas similares: al estar en formato LeRobot y licencia Apache 2.0, puede reentrenarse con `lerobot-train` sobre un dataset propio de otra pieza o utillaje.
- Docencia y formación en robótica: ejemplo completo y de tamaño moderado (51,7 M de parámetros) para ilustrar el flujo teleoperación → dataset → entrenamiento → despliegue.
- Validación de hardware y calibración: ejecutar la política permite comprobar el cableado de cámaras, la calibración del robot y la latencia del lazo de control antes de abordar tareas más complejas.
- Pruebas de robustez ante cambios de dominio: el sufijo `ood_cell4` indica que el modelo se evaluó o entrenó pensando en condiciones fuera de distribución, lo que lo hace útil para estudiar degradación ante cambios de iluminación, posición de objetos o celda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación vacía con la nota literal de que no se han proporcionado resultados para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros, los pesos en FP32 ocupan aproximadamente 207 MB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más. El cuello de botella real es el procesamiento de dos imágenes de 480x640 a 30 FPS.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA es suficiente; una RTX 3060, RTX 4060 o superior permite ejecutar el lazo de control a 30 FPS sin problemas. Para entrenamiento, se recomienda una RTX 4090, A100 o H100 por el batch size y los 85.000 pasos.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU consumer modernas con al menos 4-6 GB de VRAM.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`), que es la vía documentada. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles de forma oficial; el diseño apunta a inferencia en tiempo real a 30 FPS para igualar la frecuencia del dataset.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `act_pick-and-place-b601-60ep-yaw0-v2_ood_cell4_hil_rac_r1_F15` | 51,7 M | ACT (LeRobot) | Pick-and-place `inreach2` → jig | Apache 2.0 | Hugging Face, 23 descargas |
| `chenproject35/act_pick-and-place-b601-60ep-yaw0-v2_ood_cell4_hil_rac_r1_F5` | 51,7 M | ACT (LeRobot) | Misma tarea, variante F5 | Apache 2.0 | Hugging Face |
| Políticas ACT genéricas de LeRobot | variable | ACT | Manipulación diversa | Apache 2.0 | Hugging Face / LeRobot |

La comparación con modelos de lenguaje no procede: se trata de una política robótica específica de tarea, no de un modelo generativo de texto. Frente a la variante F5 del mismo autor, la diferencia radica en la configuración experimental (factor F15 frente a F5), no en la arquitectura ni en el tamaño. No se dispone de datos públicos de rendimiento que permitan comparar ambas variantes de forma cuantitativa.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea ("Pick up inreach2 and place it in the jig") y un único robot (`rebot_b601_follower`); no generaliza a otras tareas sin reentrenamiento.
- Sin resultados de evaluación publicados: no hay tasas de éxito verificadas, por lo que no puede afirmarse su fiabilidad en producción.
- Dependencia del hardware exacto: requiere las cámaras `cam_front` y `cam_wrist` a 480x640 y 30 FPS, y que los nombres de las observaciones coincidan con los del entrenamiento.
- Sensibilidad al dominio: cambios de iluminación, posición de objetos, fondo o celda pueden degradar el rendimiento; el propio nombre del repositorio sugiere evaluación fuera de distribución.
- Riesgo de sobreajuste a las demostraciones: con solo 60 episodios, la cobertura de posiciones y variaciones es limitada.
- Sin capacidades de lenguaje ni razonamiento simbólico: no debe emplearse como sustituto de un LLM.
- Licencia Apache 2.0: permite uso comercial y modificación, pero no se ofrece ninguna garantía por parte del autor; conviene auditar los pesos antes de desplegarlos en entornos reales.
- Tamaño del repositorio desproporcionado (10,5 GB frente a los ~207 MB de pesos en FP32), lo que sugiere checkpoints intermedios u otros artefactos que conviene revisar antes de descargar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chenproject35/act_pick-and-place-b601-60ep-yaw0-v2_ood_cell4_hil_rac_r1_F15
- Variante F5 del mismo autor: https://huggingface.co/chenproject35/act_pick-and-place-b601-60ep-yaw0-v2_ood_cell4_hil_rac_r1_F5
- Dataset de entrenamiento: https://huggingface.co/datasets/chenproject35/pick-and-place-b601-60ep-yaw0-v2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=chenproject35/pick-and-place-b601-60ep-yaw0-v2
- Artículo ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
