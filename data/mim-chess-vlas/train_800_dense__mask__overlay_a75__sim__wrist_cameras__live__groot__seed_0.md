# mim-chess-vlas/train_800_dense__mask__overlay_a75__sim__wrist_cameras__live__groot__seed_0

## Resumen

`train_800_dense__mask__overlay_a75__sim__wrist_cameras__live__groot__seed_0` es una política robótica de imitación entrenada con LeRobot sobre el backbone GR00T N1.7 de NVIDIA, un modelo fundacional abierto y cross-embodiment para razonamiento y habilidades en robots humanoides. El autor, mim-chess-vlas, ha publicado esta política como un checkpoint específico de tarea, no como un modelo de propósito general: está especializada en manipulación pick-and-place sobre un robot Franka Panda simulado.

El modelo consume observaciones multimodales (una imagen de cámara de agente y dos cámaras de muñeca, más el estado propioceptivo de 9 dimensiones) y produce acciones de 7 dimensiones a 20 FPS. Con 3.144.016.000 parámetros y pesos en safetensors dentro de la librería LeRobot, es un modelo grande para los estándares de políticas robóticas, lo que refleja el uso del backbone vision-language Cosmos-Reason2/Qwen3-VL combinado con un transformer de acciones con flow matching.

Es relevante ahora porque forma parte del ecosistema GR00T de NVIDIA, que busca unificar el entrenamiento de robots humanoides bajo un único modelo fundacional, y porque LeRobot lo hace accesible con flujos de entrenamiento y despliegue estándar. No obstante, esta instancia concreta es un artefacto de investigación con 16 descargas y sin métricas publicadas, por lo que debe tratarse como un checkpoint experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone vision-language Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de GR00T N1.7: un backbone vision-language basado en Cosmos-Reason2/Qwen3-VL que procesa las imágenes de las tres cámaras y las instrucciones de tarea en lenguaje natural, y un transformer de acciones entrenado con flow matching que predice las acciones condicionadas por visión, lenguaje y propiocepción. La política está configurada para el robot `Panda` con tres cámaras (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`), estado de 9 dimensiones y salida de acción de 7 dimensiones.

El entrenamiento se realizó con LeRobot 0.6.0 sobre el dataset `train_800_dense__mask__overlay_a75__sim__wrist_cameras__live`, compuesto por 776 episodios y 207.203 fotogramas a 20 FPS. Las tareas cubren 40 variantes de "Pick the X and place it into the box" sobre objetos domésticos (jam, cereal, pear, sweet potato, scone, etc.). La configuración reportada es de 60.000 pasos, batch size 16, optimizador AdamW, learning rate 7e-05 y semilla 0. No se documenta el número de tokens de entrenamiento del backbone ni si hubo RLHF o DPO; el paradigma es de imitación supervisada sobre demostraciones.

## Capacidades

- Generación de acciones de manipulación robótica de 7 dimensiones (típicamente posición y orientación del efector final más pinza) a partir de observaciones visuales y propioceptivas.
- Comprensión de instrucciones en lenguaje natural para seleccionar el objeto objetivo entre 40 categorías descritas en las tareas de entrenamiento.
- Fusión multimodal de tres vistas de cámara (vista de agente y dos cámaras de muñeca) con estado propioceptivo de 9 dimensiones.
- Ejecución de políticas de imitación en bucle cerrado a 20 FPS sobre el robot Panda.
- Soporte de tool calling / function calling: no disponible (no es una capacidad de este tipo de modelo).
- Soporte de agentes y razonamiento multi-paso: no documentado; la política ejecuta una tarea de pick-and-place por episodio.
- Capacidades multilingües: no disponible; las instrucciones del dataset están en inglés.
- Capacidades especiales: no se documentan modos de pensamiento, visión general, audio ni otras modalidades más allá de las cámaras del robot.

## Casos de uso

- Manipulación pick-and-place en simulación: la política está entrenada específicamente para recoger objetos domésticos y depositarlos en una caja sobre un Panda simulado, por lo que es adecuada para experimentos de imitación en entornos tipo robosuite o MuJoCo con las mismas cámaras y convenciones.
- Investigación en modelos fundacionales cross-embodiment: sirve como punto de partida para estudiar cómo el backbone GR00T N1.7 se adapta a una tarea concreta con pocos datos (776 episodios) y evaluar el ajuste fino sobre tareas de manipulación.
- Evaluación de pipelines LeRobot: al estar empaquetado con LeRobot 0.6.0, permite reproducir el flujo `lerobot-rollout` y validar la integración de políticas GR00T en la herramienta.
- Benchmarking de políticas de imitación: útil como referencia para comparar variantes de datos (máscaras, overlays, cámaras de muñeca) frente a otros checkpoints del mismo autor con el mismo seed.
- Generación de datos sintéticos y aumento de dataset: la política puede ejecutarse en simulación para generar trayectorias adicionales y estudiar el rendimiento con distintas condiciones de iluminación u oclusión.
- Docencia y divulgación: ejemplo didáctico de cómo se entrena y despliega una política robótica multimodal con un backbone VLM grande y un transformer de acciones con flow matching.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error de acción ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3.144 millones de parámetros, en FP16 se requieren aproximadamente 6,3 GB solo para pesos; en FP32, unos 12,6 GB. A ello hay que sumar el coste del backbone vision-language y de las activaciones de las tres cámaras a 224x224, por lo que un presupuesto realista de 10-16 GB en FP16 es razonable, aunque no está confirmado por el autor.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, una RTX 4090 (24 GB) o una A100/H100 son opciones plausibles, pero no hay validación publicada.
- ¿Cabe en consumer GPU? Probablemente sí en GPUs con 16 GB o más en FP16, y en 8-12 GB con cuantización, aunque no se documentan tipos de cuantización soportados.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) es el método documentado; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política robótica.
- Latencia y throughput: el dataset está a 20 FPS, lo que sugiere que la política debe ejecutarse al menos a esa frecuencia, pero no se publican latencias medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (GR00T N1.7, seed 0) | 3.144 M | no disponible | Pick-and-place Panda simulado | apache-2.0 | HuggingFace, 16 descargas |
| GR00T N1.7 base (NVIDIA) | no disponible en la información | no disponible | Modelo fundacional humanoide cross-embodiment | no disponible en la información | GitHub NVIDIA/Isaac-GR00T |
| Otras políticas LeRobot del mismo autor (variantes de seed/dataset) | no disponible | no disponible | Pick-and-place Panda | apache-2.0 | HuggingFace, mim-chess-vlas |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint de investigación con 16 descargas y sin métricas publicadas; no hay evidencia de tasa de éxito en el mundo real.
- Entrenado exclusivamente en simulación sobre un Panda con una configuración de cámaras concreta; el transfer al mundo real (sim-to-real) no está documentado.
- El vocabulario de tareas está limitado a 40 objetos domésticos y a la instrucción "Pick the X and place it into the box"; fuera de ese dominio no hay garantías.
- Las instrucciones están en inglés; no se documenta soporte multilingüe.
- No se documentan sesgos, pero al ser un modelo de imitación puede reproducir sesgos presentes en las demostraciones (posiciones, iluminación, distribuciones de objetos).
- Riesgo de alucinación en el sentido de acciones no válidas o fuera de distribución cuando la escena difiere de la del dataset.
- La licencia apache-2.0 permite uso comercial, pero el modelo base GR00T y sus dependencias deben verificarse por separado.
- El tamaño del repo (50,3 GB) y los 3.144 millones de parámetros implican requisitos de almacenamiento y cómputo considerables para un despliegue en borde.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mim-chess-vlas/train_800_dense__mask__overlay_a75__sim__wrist_cameras__live__groot__seed_0
- Dataset de entrenamiento: https://huggingface.co/datasets/mim-chess-vlas/train_800_dense__mask__overlay_a75__sim__wrist_cameras__live
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mim-chess-vlas/train_800_dense__mask__overlay_a75__sim__wrist_cameras__live
- Repositorio GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- Guía LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
