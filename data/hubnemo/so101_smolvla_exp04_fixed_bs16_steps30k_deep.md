# hubnemo/so101_smolvla_exp04_fixed_bs16_steps30k_deep

## Resumen

`hubnemo/so101_smolvla_exp04_fixed_bs16_steps30k_deep` es una política de visión-lenguaje-acción (VLA) afinada a partir de `lerobot/smolvla_base`, el modelo compacto de SmolVLA publicado por Hugging Face. El modelo no es un LLM conversacional: es un adaptador de robótica que traduce observaciones multimodales (una imagen de cámara frontal y el estado de las articulaciones) en comandos de acción de 6 dimensiones para un brazo robótico SO-101. Se ha entrenado con el dataset `Orellius/so101_sort_cubes_no_top`, compuesto por 77 episodios y 54.777 fotogramas a 30 FPS, para una única tarea de manipulación: coger un cubo morado e introducirlo en una caja de cartón ignorando el resto de objetos.

El interés de esta ficha es doble. Por un lado, documenta un caso concreto de fine-tuning de SmolVLA con LeRobot 0.7.1, con hiperparámetros explícitos (30.000 pasos, batch de 16, AdamW, learning rate 1e-4, semilla 1000), lo que permite reproducir el entrenamiento. Por otro, sirve como ejemplo de política de imitación de bajo coste desplegable en hardware de consumo, en la línea del paper SmolVLA (arXiv:2506.01844), que defiende que un VLA compacto puede alcanzar rendimiento competitivo con un coste computacional reducido.

Conviene subrayar que el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y que el autor no ha publicado resultados de evaluación en robot real. Es, por tanto, un artefacto de experimentación reproducible más que una política validada para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, base `lerobot/smolvla_base`); detalles internos de capas no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; se desconoce si el autor publicó variantes cuantizadas) |
| Idiomas soportados | no disponible (la tarea se especifica en inglés mediante un prompt de instrucción) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

Especificaciones de entrada y salida de la política:

| Elemento | Tipo | Forma |
|---|---|---|
| `observation.state` | STATE | `(6,)` |
| `observation.images.front` | VISUAL | `(3, 480, 640)` |
| `action` | ACTION | `(6,)` |

## Arquitectura y entrenamiento

El modelo es un adaptador de SmolVLA, un VLA compacto que combina un codificador visual, un codificador de lenguaje y un decodificador de acciones, según la descripción del paper referenciado (arXiv:2506.01844). La model card no detalla el número de capas, la dimensión oculta ni el mecanismo de fusión entre modalidades, por lo que esos datos deben consultarse en el paper original y en el repositorio de `lerobot/smolvla_base`. La política está especializada en el robot `so101_follower` con una única cámara frontal y produce acciones de 6 grados de libertad.

El entrenamiento se realizó con LeRobot 0.7.1 mediante imitación supervisada sobre el dataset `Orellius/so101_sort_cubes_no_top`: 77 episodios, 54.777 fotogramas a 30 FPS, con la instrucción "Grab the purple cube and put it into the cardboard box, ignore the other objects". La configuración es de 30.000 pasos, batch de 16, optimizador AdamW, learning rate 1e-4 y semilla 1000. No se documenta el uso de RLHF, DPO ni de decodificación especulativa; tampoco se indica el número de tokens de entrenamiento en el sentido de un LLM, ya que aquí el cómputo se mide en pasos sobre trayectorias de robot.

## Capacidades

- Generación de acciones de control de 6 dimensiones para un brazo SO-101 a partir de una imagen RGB de 480x640 y del estado articular.
- Ejecución de una tarea de manipulación concreta: recoger un cubo morado y depositarlo en una caja de cartón, ignorando objetos distractores.
- Condicionamiento por instrucción en lenguaje natural (prompt de tarea en inglés), lo que permite especificar el objetivo en el momento de la inferencia.
- Percepción visual de una sola cámara frontal; no se documenta soporte multi-cámara en esta política.
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`) y con el Hub de Hugging Face.
- No se documentan capacidades de tool calling, razonamiento multi-paso, diálogo multilingüe, visión general, audio ni modo de pensamiento; no es un modelo de lenguaje de propósito general.

## Casos de uso

- Reproducción de experimentos de imitación en robótica de bajo coste: sirve como punto de partida para comparar configuraciones de entrenamiento (pasos, batch, learning rate) sobre la misma tarea y el mismo robot, gracias a que los hiperparámetros están documentados.
- Clasificación de cubos en líneas de juguete o laboratorio docente: el modelo puede integrarse en una celda con brazo SO-101 para separar un objeto concreto (cubo morado) de distractores, usando la instrucción de tarea como consigna.
- Docencia y formación en VLA: permite a estudiantes ejecutar una política entrenada end-to-end con `lerobot-rollout` y observar el comportamiento en hardware real sin necesidad de entrenar desde cero.
- Base para fine-tuning con nuevos objetos o posiciones: al ser un adaptador de `lerobot/smolvla_base`, se puede reentrenar con un dataset propio manteniendo la arquitectura y el pipeline de LeRobot.
- Pruebas de robustez ante cambios de iluminación, posición de objetos o presencia de distractores: la política está entrenada explícitamente para ignorar objetos no objetivo, lo que la hace útil como banco de pruebas de generalización.
- Evaluación comparativa de políticas SmolVLA: al compartir base y formato con otras políticas publicadas (por ejemplo, `Temmp1e/so101_smolVLA`), permite comparar configuraciones sobre la misma tarea y robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación vacía con la nota "No evaluation results have been provided for this policy yet", por lo que no existen tasas de éxito en robot real ni métricas de pérdida reportadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de un VLA compacto de la familia SmolVLA, el paper lo describe como desplegable en hardware de consumo, pero no se aportan cifras concretas.
- GPU recomendadas: no disponible; la model card no especifica modelos de GPU. El comando de entrenamiento de referencia usa `--policy.device=cuda`.
- Compatibilidad con GPU de consumo: el paper de SmolVLA afirma que el modelo puede desplegarse en hardware de consumo, pero no se detalla qué tarjetas concretas se han validado para esta política.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para reentrenamiento). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La captura de datos se realizó a 30 FPS, pero no se reporta la frecuencia de inferencia en tiempo real.

## Comparativa con modelos similares

| Modelo | Base | Tarea / robot | Dataset | Licencia | Estado |
|---|---|---|---|---|---|
| `hubnemo/so101_smolvla_exp04_fixed_bs16_steps30k_deep` | `lerobot/smolvla_base` | Ordenar cubos, SO-101, cámara frontal | `Orellius/so101_sort_cubes_no_top` (77 episodios) | Apache 2.0 | 0 descargas, sin evaluación publicada |
| `Temmp1e/so101_smolVLA` | SmolVLA (no detallado) | SO-101 (no detallado) | no disponible | no disponible | Política publicada en el Hub |
| `lerobot/smolvla_base` | SmolVLA original | Base generalista para fine-tuning VLA | no disponible en esta ficha | no disponible en esta ficha | Modelo base de referencia |

La comparación con alternativas de la misma categoría es limitada: no se dispone de parámetros, contexto ni métricas de rendimiento de los modelos comparados en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasas de éxito en robot real, ni número de ensayos, ni condiciones de prueba documentadas.
- Especialización extrema: la política está entrenada para una única tarea y un único robot (`so101_follower`); no se espera que generalice a otros brazos, otras cámaras u otros objetos sin reentrenamiento.
- Dependencia de la cámara y del montaje: la observación visual tiene una forma fija `(3, 480, 640)` y un único punto de vista frontal; cambios de encuadre, iluminación o calibración pueden degradar el comportamiento.
- Prompt de tarea en inglés: la instrucción de condicionamiento está en inglés y no se documenta soporte multilingüe.
- Riesgo de sobreajuste al dataset: con solo 77 episodios, la diversidad de posiciones y apariencias es limitada, lo que aumenta el riesgo de fallos ante distribuciones distintas.
- Sin datos de sesgos, alucinación o robustez: al no ser un modelo de lenguaje, los riesgos típicos de alucinación textual no aplican, pero sí el riesgo de acciones erráticas o inseguras en el robot.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; el despliegue en entornos físicos requiere supervisión humana.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hubnemo/so101_smolvla_exp04_fixed_bs16_steps30k_deep
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Orellius/so101_sort_cubes_no_top
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Orellius/so101_sort_cubes_no_top
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Política comparable en el Hub: https://huggingface.co/Temmp1e/so101_smolVLA
- Perfil del autor: https://huggingface.co/hubnemo/datasets
