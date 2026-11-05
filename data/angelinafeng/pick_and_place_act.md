# angelinafeng/pick_and_place_act

## Resumen

`angelinafeng/pick_and_place_act` es una política de imitación para robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705. El modelo ha sido entrenado y publicado en Hugging Face mediante LeRobot, la librería de aprendizaje por imitación para robótica real de Hugging Face. Resuelve una tarea concreta de manipulación: coger y colocar un bloque ("pick and place the block 11/4/26") sobre un robot de tipo `so_follower` (SO-100/SO-101 de LeRobot) equipado con dos cámaras, una cenital (`top`) y otra en la muñeca (`wrist`).

Se trata de un modelo pequeño, de 51.668.614 parámetros, que consume el estado articular del robot (vector de 6 dimensiones) y dos imágenes RGB de 480x640 y produce un vector de acción de 6 dimensiones. No es un modelo de lenguaje: es una política visuomotora que predice trozos de acción (action chunks) en lugar de pasos individuales, lo que reduce el error de composición y suaviza la ejecución. Es relevante como ejemplo reproducible de un flujo completo de aprendizaje por imitación con hardware de bajo coste, aunque su ámbito de aplicación es muy restringido y su validación experimental es prácticamente nula.

El repositorio ocupa 3,1 GB, está etiquetado con la pipeline `robotics`, la licencia no está declarada y no cuenta con descargas ni valoraciones en el momento de redactar esta ficha. El modelo fue creado y actualizado el 4 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones con consultas tipo CVAE |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política visuomotora; ventana de observación de un solo paso con historial de acciones implícito) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no procesa lenguaje natural como tarea principal) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 3,1 GB, librería `lerobot`) |
| Tipo de robot | `so_follower` (SO-100/SO-101 de LeRobot) |
| Cámaras de entrada | `top` y `wrist`, RGB 3x480x640 |
| Entrada de estado | `observation.state`, vector (6,) |
| Salida | `action`, vector (6,) |
| Dataset de entrenamiento | `angelinafeng/pick_and_place`: 39 episodios, 8.841 frames, 30 FPS |
| Pasos de entrenamiento | 10.000 |
| Tamaño de batch | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.2 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un codificador visual (típicamente una ResNet preentrenada) con un transformer que predice secuencias cortas de acciones, los llamados *action chunks*. En lugar de emitir una acción por paso de control, el modelo genera un bloque de acciones futuras, lo que mitiga el problema de la acumulación de errores en el control paso a paso y produce trayectorias más suaves. La formulación original incluye un componente de autoencoder condicional variacional (CVAE) que modela la variabilidad humana en los datos de teleoperación, y una agregación temporal (*temporal ensembling*) que combina predicciones solapadas de chunks consecutivos para suavizar la ejecución.

En este caso concreto, el entrenamiento se realizó sobre 39 episodios de teleoperación (8.841 frames a 30 FPS) de una única tarea de pick and place, con 10.000 pasos de optimización, batch de 8, AdamW y learning rate de 1e-05. No se documenta el número de tokens ni la composición del dataset más allá de la tarea única, ni se menciona el uso de RLHF, DPO ni ningún proceso de alineación posterior. Tampoco se detalla la configuración exacta del backbone visual ni la dimensión del chunk de acciones. La innovación técnica relevante es la propia formulación de ACT (chunking + CVAE + ensembling temporal), no una aportación propia del autor de este repositorio.

## Capacidades

- Manipulación robótica visuomotora: predice acciones de 6 grados de libertad a partir de dos vistas RGB y del estado articular.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin necesidad de recompensas ni entorno simulado.
- Predicción de chunks de acción, lo que permite ejecutar trayectorias más suaves y con menor deriva acumulada.
- Control reactivo a la posición de la muñeca y de la vista cenital, adecuado para tareas de alcance y agarre sobre una mesa.
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`) y con el Hub de Hugging Face.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües.
- No dispone de modo de razonamiento explícito (thinking mode), visión general, audio ni generación de texto.

## Casos de uso

- Demostración reproducible de un pipeline completo de aprendizaje por imitación: sirve como plantilla para grabar datos con `lerobot-record`, entrenar con `lerobot-train` y desplegar con `lerobot-rollout` sobre un SO-100/SO-101, usando exactamente la misma configuración (10.000 pasos, batch 8, lr 1e-05).
- Docencia y formación en robótica de bajo coste: el modelo y su dataset asociado (39 episodios, 8.841 frames) permiten ilustrar el ciclo completo de teleoperación, curación de datos y entrenamiento de una política ACT en hardware asequible.
- Benchmark interno de referencia para tareas de pick and place: al estar entrenado sobre una única tarea y un único robot, sirve como línea base contra la que comparar variantes de datos, hiperparámetros o arquitecturas en el mismo montaje físico.
- Prueba de concepto de control visuomotor con dos cámaras: la combinación de vista cenital y de muñeca es un patrón habitual en manipulación; este repositorio ejemplifica cómo declarar y consumir esas observaciones en LeRobot.
- Reentrenamiento y ajuste fino sobre un dataset propio: la receta de entrenamiento documentada permite reutilizar la configuración como punto de partida para tareas similares (coger y colocar objetos sobre una mesa) cambiando únicamente el `repo_id` del dataset.
- Integración en flujos de investigación sobre chunking y ensembling temporal: al ser una implementación LeRobot de ACT, permite instrumentar y medir el efecto del tamaño de chunk y de la agregación temporal sobre la suavidad de la trayectoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real (*"No evaluation results have been provided for this policy yet"*), por lo que no existe tasa de éxito medida, ni comparación con otras políticas, ni métricas de error de seguimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,7 millones de parámetros, los pesos en fp32 ocupan aproximadamente 0,2 GB, y en fp16 alrededor de 0,1 GB. La mayor parte del consumo proviene de los dos flujos de cámara a 480x640 y del backbone visual.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM es suficiente para inferencia; una RTX 3060, RTX 4060 o RTX 4090 funcionan sin problema. Para entrenamiento, una RTX 3090/4090 o una A100 aceleran los 10.000 pasos, aunque el modelo es lo bastante pequeño para entrenar en GPUs de gama media.
- Cabe holgadamente en GPU de consumo: sí, en cualquier GPU consumer moderna con 8 GB o más; incluso es viable en GPUs integradas o en CPU para inferencia a baja frecuencia, aunque no se documentan latencias.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`), que es el flujo oficial documentado. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a una política robótica.
- Latencia y throughput: no disponibles. No se han publicado mediciones de frecuencia de control efectiva, latencia de inferencia ni tasa de éxito en el robot.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `angelinafeng/pick_and_place_act` | 51,7 M | ACT (LeRobot) | Estado (6,) + 2 imágenes 480x640 | no disponible | Hugging Face, 0 descargas |
| Políticas ACT de referencia en LeRobot (p. ej. `lerobot/act_aloha_sim_transfer_cube_human`) | del orden de decenas de millones | ACT (LeRobot) | Estado + imágenes según robot | normalmente Apache-2.0 (verificar en cada repo) | Hugging Face, ampliamente utilizadas |
| Políticas Diffusion Policy en LeRobot | variable, mayor que ACT | Diffusion Policy | Estado + imágenes | normalmente Apache-2.0 (verificar) | Hugging Face |
| Políticas π0 / π0.5 (Physical Intelligence) | miles de millones | VLA (flow matching) | Estado + imágenes + lenguaje | licencia propia | Hugging Face / repositorio propio |

La comparación cuantitativa de rendimiento no está disponible porque este repositorio no publica evaluaciones. Frente a las políticas ACT de referencia de LeRobot, la diferencia principal es el ámbito: este modelo está entrenado para una única tarea y un único robot, mientras que las de referencia suelen cubrir tareas simuladas o de laboratorio con documentación de éxito. Frente a modelos VLA de gran escala como π0, la diferencia es de categoría: aquí no hay condicionamiento por lenguaje ni generalización entre tareas.

## Limitaciones y advertencias

- Ámbito extremadamente restringido: entrenado para una única tarea ("pick and place the block 11/4/26"), un único robot (`so_follower`) y una disposición concreta de cámaras (`top` y `wrist`). No generaliza a otras tareas, objetos, posiciones ni robots sin reentrenamiento.
- Sin evaluación publicada: no hay tasa de éxito medida en robot real, por lo que se desconoce su fiabilidad fuera del conjunto de entrenamiento.
- Dataset muy pequeño: 39 episodios y 8.841 frames son insuficientes para robustez ante cambios de iluminación, posiciones de objetos, distractores o variaciones del entorno; es probable un sobreajuste a las condiciones de grabación.
- Licencia no declarada: la model card indica "[More Information Needed]" y los metadatos del Hub no especifican licencia. No se debe asumir uso comercial permitido; es necesario contactar con el autor antes de cualquier despliegue productivo.
- Sin datos de sesgos: al no ser un modelo de lenguaje, no aplican sesgos lingüísticos, pero sí posibles sesgos de recogida de datos (posiciones, velocidades y estrategias del teleoperador) que la política reproducirá.
- Riesgo de alucinación en sentido robótico: la política puede generar acciones no válidas o inseguras ante observaciones fuera de distribución; requiere supervisión humana y límites de seguridad físicos en el robot.
- Dependencia de la versión de LeRobot: entrenado con LeRobot 0.6.2; cambios de API o de formato de observaciones en versiones posteriores pueden romper la compatibilidad.
- Sin soporte de lenguaje natural ni de instrucciones variables: la tarea está fijada en el prompt de entrenamiento y no puede reconfigurarse en tiempo de ejecución.
- Repositorio de 3,1 GB para un modelo de 51,7 M de parámetros: el tamaño se debe probablemente a checkpoints y artefactos de entrenamiento, no a los pesos en sí; conviene revisar el contenido antes de descargarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/angelinafeng/pick_and_place_act
- Dataset de entrenamiento: https://huggingface.co/datasets/angelinafeng/pick_and_place
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=angelinafeng/pick_and_place
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
