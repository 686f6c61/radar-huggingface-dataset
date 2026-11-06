# mysterium99/smolvla_stage2c_complexity_1_to_ds3

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para control robótico mediante imitación y desplegable en hardware de consumo. Esta ficha concreta, `mysterium99/smolvla_stage2c_complexity_1_to_ds3`, es un fine-tuning del modelo base `lerobot/smolvla_base` sobre el dataset `ds3`, orientado a la tarea "Put all hardware in bucket" con un robot de tipo `follow` y tres cámaras.

El modelo consume observaciones multimodales (estado articular de 6 dimensiones y tres flujos de imagen de 256x256 píxeles) y produce acciones de 6 dimensiones a 30 FPS, lo que lo sitúa en el ámbito de las políticas de imitación end-to-end para manipulación robótica. Con 450 millones de parámetros y un repositorio de 0,9 GB, su interés radica en demostrar que un VLA de tamaño reducido puede ejecutar tareas de manipulación sobre GPUs consumer, sin necesidad de infraestructura de datacenter.

Es relevante ahora porque el paper original de SmolVLA (arXiv:2506.01844) propone una arquitectura eficiente que compite con modelos VLA mucho mayores, y este checkpoint ejemplifica el flujo completo de fine-tuning con LeRobot 0.6.1 sobre un dataset pequeño (50 episodios, 85.293 frames). No obstante, se trata de un artefacto de investigación sin evaluación publicada ni métricas de éxito en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en transformers, según SmolVLA |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (modelo orientado a instrucciones de tarea en robótica; el dataset usa la instrucción "Put all hardware in bucket" en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual, un codificador de lenguaje y un decodificador de acciones en una arquitectura transformer compacta. La política recibe tres cámaras (`gripper`, `newtop`, `newside`) con imágenes de 3x256x256, un vector de estado de 6 dimensiones y una instrucción de tarea en lenguaje natural, y emite un vector de acción de 6 dimensiones por paso. El modelo base es `lerobot/smolvla_base`, del que este checkpoint es un fine-tuning.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `ds3`: 50 episodios, 85.293 frames a 30 FPS, con la única tarea "Put all hardware in bucket". La configuración reportada incluye 20.000 pasos de entrenamiento, batch size de 8, optimizador AdamW, learning rate 1e-4 y semilla 0. No se documenta en la model card el uso de RLHF, DPO ni datos adicionales más allá del dataset de imitación citado; tampoco se especifican innovaciones técnicas particulares de este fine-tuning frente al modelo base.

## Capacidades

- Control robótico por imitación: genera acciones de 6 dimensiones a partir de observaciones visuales y de estado, a 30 FPS.
- Percepción multimodal: procesa simultáneamente tres cámaras RGB de 256x256 y un vector de estado de 6 dimensiones.
- Condicionamiento por instrucción en lenguaje natural: la tarea se especifica mediante texto ("Put all hardware in bucket").
- Ejecución de políticas en robot real mediante `lerobot-rollout` con estrategia `base`.
- Fine-tuning adicional sobre nuevos datasets con `lerobot-train` partiendo de `lerobot/smolvla_base`.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento general, código, matemáticas, audio ni visión general fuera del ámbito robótico.
- Capacidades multilingües: no disponibles; la instrucción de tarea del dataset está en inglés.

## Casos de uso

- Manipulación de recogida y vertido en laboratorio: el modelo ejecuta la tarea "Put all hardware in bucket" sobre un robot `follow` con tres cámaras, adecuado para prototipos de pick-and-place en entornos controlados.
- Reproducción de experimentos de imitación: sirve como referencia para validar el pipeline de LeRobot 0.6.1 (grabación, entrenamiento, rollout) con un dataset pequeño de 50 episodios.
- Base para fine-tuning en tareas similares: al partir de `lerobot/smolvla_base`, se puede reentrenar con `lerobot-train` sobre nuevos datasets de manipulación con la misma configuración de cámaras y estado.
- Despliegue en hardware de consumo: con 450 M de parámetros y pesos en safetensors, es viable ejecutarlo en una GPU consumer para pruebas de política en tiempo real a 30 FPS.
- Investigación en eficiencia de VLAs: permite estudiar el rendimiento de un VLA compacto frente a alternativas mayores en tareas de manipulación acotadas.
- Docencia y formación en robótica de imitación: el flujo completo (dataset, entrenamiento, rollout) está documentado y es reproducible con comandos de LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet", sin tabla de éxito en robot real ni comparación con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 M de parámetros en fp32 los pesos ocupan aproximadamente 1,8 GB, y en fp16/bf16 alrededor de 0,9 GB, a lo que hay que sumar activaciones de tres cámaras de 256x256.
- GPU recomendadas: no especificadas por el autor; el modelo base SmolVLA está diseñado para hardware de consumo según el paper.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas con 8 GB o más de VRAM, aunque no se documenta una cifra oficial.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) para ejecución en robot y `lerobot-train` para reentrenamiento, ambos sobre `lerobot` 0.6.1.
- Latencia y throughput: no disponibles; el dataset y las observaciones se registran a 30 FPS, pero no se publica latencia de inferencia medida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mysterium99/smolvla_stage2c_complexity_1_to_ds3 | 450 M | no disponible | Manipulación robótica (ds3) | Apache 2.0 | Hugging Face, 0 descargas |
| lerobot/smolvla_base | no disponible en la información proporcionada | no disponible | VLA base para fine-tuning | no disponible en la información proporcionada | Hugging Face (modelo base) |
| Otros VLA de la familia SmolVLA | no disponible | no disponible | Robótica | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones completas de alternativas en la información proporcionada para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay tasa de éxito en robot real, por lo que se desconoce su fiabilidad en producción.
- Dataset muy reducido: 50 episodios y una única tarea ("Put all hardware in bucket"), lo que limita la generalización a otras tareas u objetos.
- Configuración de hardware específica: requiere un robot `follow` y tres cámaras con nombres `gripper`, `newtop` y `newside`; cambiar la disposición o el número de cámaras invalida la política.
- Riesgo de sobreajuste al entorno de grabación: cambios de iluminación, posiciones de objetos o distractores no están evaluados.
- Sin datos sobre sesgos, alucinación o comportamiento fuera de distribución; al ser una política de imitación, puede fallar de forma silenciosa ante estados no vistos.
- Idiomas: no se documenta soporte multilingüe; la instrucción de tarea está en inglés.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y el origen de investigación desaconsejan su uso en producción sin validación propia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mysterium99/smolvla_stage2c_complexity_1_to_ds3
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset ds3: https://huggingface.co/datasets/ds3
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador de datasets: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ds3
