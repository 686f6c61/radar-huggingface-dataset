# hubnemo/so101_sort_cubes_no_top_smolvla_lora_test

## Resumen

`hubnemo/so101_sort_cubes_no_top_smolvla_lora_test` es un adaptador LoRA de visión-lenguaje-acción (VLA) publicado en Hugging Face por el usuario `hubnemo`, obtenido mediante fine-tuning de `lerobot/smolvla_base` con la librería LeRobot. No es un modelo de lenguaje general: es una política robótica que, dada una imagen de cámara frontal y el estado articular de un brazo SO-101, predice una acción de 6 dimensiones. El nombre del repositorio indica que se trata de un checkpoint de prueba (`lora_test`) y no de un artefacto validado para producción.

El modelo resuelve una única tarea de manipulación: coger un cubo morado e introducirlo en una caja de cartón, ignorando el resto de objetos de la escena. Se entrenó sobre el dataset `Orellius/so101_sort_cubes_no_top`, con 77 episodios y 54.777 fotogramas a 30 FPS. La arquitectura subyacente, SmolVLA (arXiv:2506.01844), se presenta como un VLA compacto y eficiente pensado para desplegarse en hardware de consumo, lo que la hace relevante para laboratorios con presupuesto limitado.

Su interés práctico es doble: por un lado sirve como ejemplo reproducible de un flujo completo de imitación en LeRobot (grabación, entrenamiento, rollout); por otro, permite estudiar cómo se comporta un adaptador LoRA de bajo rango sobre un VLA preentrenado en una tarea muy concreta con pocos datos. El autor no ha publicado métricas de éxito ni evaluación en robot real, por lo que cualquier uso debe ir precedido de una validación propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action); adaptador LoRA sobre `lerobot/smolvla_base` |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo se publican pesos safetensors; el autor no documenta variantes cuantizadas) |
| Idiomas soportados | no disponible (la instrucción de la tarea está en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA, `library_name: lerobot`) |
| Tipo de robot | `so101_follower` |
| Cámaras | 1 (`front`) |
| Entrada de estado | `observation.state`, shape `(6,)` |
| Entrada visual | `observation.images.front`, shape `(3, 480, 640)` |
| Salida | `action`, shape `(6,)` |
| Tamaño del repositorio | 0,0 GB (según Hugging Face) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre `lerobot/smolvla_base`, un VLA compacto que combina un codificador visual-lenguaje con un cabezal de acciones, siguiendo el método descrito en el artículo SmolVLA (arXiv:2506.01844). La política consume dos flujos: un estado proprioceptivo de 6 dimensiones y una imagen RGB de 480x640 píxeles procedente de la cámara frontal; produce un vector de acción de 6 dimensiones por paso de control. Al ser un adaptador, no se redistribuye el modelo completo, sino únicamente los pesos de bajo rango entrenados para esta tarea.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `Orellius/so101_sort_cubes_no_top`: 77 episodios, 54.777 fotogramas a 30 FPS, con la instrucción en lenguaje natural "Grab the purple cube and put it into the cardboard box, ignore the other objects". La configuración documentada es de 6.875 pasos, batch size 8, optimizador AdamW, learning rate 1e-4 y semilla 1000. No se especifica el número de tokens multimodales vistos, la composición del dataset ni si hubo etapas de RLHF o DPO; en el contexto de imitación robótica, el entrenamiento es de aprendizaje por imitación supervisado sobre demostraciones teleoperadas.

## Capacidades

- Generación de acciones de manipulación de 6 grados de libertad a partir de una imagen frontal y del estado articular del brazo SO-101.
- Ejecución de una tarea de pick-and-place concreta: coger el cubo morado y depositarlo en una caja de cartón.
- Seguimiento de instrucciones en lenguaje natural en inglés, integradas en el prompt de la política.
- Discriminación de objetos por color e instrucción explícita de ignorar los distractores presentes en la escena.
- Integración nativa con el ecosistema LeRobot: `lerobot-rollout` para inferencia y `lerobot-train` para reentrenamiento.
- No se documentan capacidades de tool calling, razonamiento multi-paso, diálogo multi-turno, visión general, audio ni modo "thinking"; no aplican a una política VLA de este tipo.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo ejecuta directamente la tarea entrenada (cubo morado a caja) sobre un SO-101 calibrado, con una sola cámara frontal a 480x640 y 30 FPS, que es exactamente la configuración de entrada esperada.
- Banco de pruebas de recetas LoRA para SmolVLA: al estar entrenado con 6.875 pasos, batch 8 y lr 1e-4 sobre una semilla fija, sirve como referencia reproducible para comparar hiperparámetros o rangos de adaptación en tareas de manipulación pequeñas.
- Docencia y formación en aprendizaje por imitación: el flujo completo (dataset de 77 episodios, entrenamiento, rollout con `--strategy.type=base` y `--duration=60`) es lo bastante pequeño para reproducirse en una sesión de prácticas.
- Punto de partida para transferencia a una tarea similar: reentrenar el adaptador sobre un dataset propio con el mismo robot y cámara, por ejemplo cambiando el objeto destino o la posición de la caja.
- Estudio de robustez frente a distractores: la instrucción pide explícitamente ignorar otros objetos, lo que permite medir la tasa de éxito al añadir elementos en la escena y comparar con el modelo base sin adaptar.
- Validación de pipelines de despliegue LeRobot en CI o en entornos de laboratorio: el checkpoint permite comprobar versiones de `lerobot`, compatibilidad de claves de observación y calibración antes de entrenar políticas definitivas.
- Generación de datos sintéticos de evaluación: ejecutar la política de forma repetida para recolectar trayectorias y analizar modos de fallo (agarre, colisión, omisión del objeto) antes de invertir en un dataset mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación vacía con la nota textual "No evaluation results have been provided for this policy yet", por lo que no existen tasas de éxito en robot real, número de ensayos ni comparaciones con otras políticas.

| Métrica | Resultado |
|---|---|
| Tasa de éxito en robot real | no disponible |
| Número de ensayos | no disponible |
| MMLU / HumanEval / GSM8K | no aplica (no es un LLM) |
| Comparación con el modelo base | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El autor no publica cifras de memoria ni de latencia para este adaptador.
- El modelo base SmolVLA se describe en la model card como desplegable en "consumer-grade hardware", pero no se detalla qué GPU concretas cumplen ese requisito.
- El entrenamiento documentado se ejecutó con `--policy.device=cuda`, lo que implica una GPU NVIDIA con CUDA para reentrenar; no se indica el modelo utilizado.
- Al ser un adaptador LoRA, los requisitos de almacenamiento son mínimos (el repositorio ocupa 0,0 GB según Hugging Face), pero la inferencia carga igualmente el modelo base `lerobot/smolvla_base`.
- Despliegue: el soporte oficial es la CLI de LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para entrenamiento). No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje y no a políticas VLA.
- Latencia y throughput: no disponibles. Hay que tener en cuenta que el bucle de control del dataset se grabó a 30 FPS, por lo que la política debe ejecutarse dentro de ese presupuesto temporal para reproducir las condiciones de entrenamiento.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `hubnemo/so101_sort_cubes_no_top_smolvla_lora_test` | Adaptador LoRA de SmolVLA para tarea única | no disponible | no disponible | apache-2.0 | Hugging Face, 0 descargas, 0 likes |
| `lerobot/smolvla_base` | VLA base preentrenado | no disponible en la información | no disponible | no disponible en la información | Hugging Face (modelo base de este adaptador) |
| Políticas ACT de LeRobot | Política de imitación (transformer) | no disponible en la información | no disponible | no disponible en la información | Hugging Face / LeRobot |
| Políticas de diffusion policy en LeRobot | Política de imitación generativa | no disponible en la información | no disponible | no disponible en la información | Hugging Face / LeRobot |

No se dispone de datos públicos de rendimiento comparado entre estas alternativas en la información proporcionada; la comparación relevante es cualitativa: este adaptador está especializado en una sola tarea y un solo embodiment (SO-101 con cámara frontal), mientras que `smolvla_base` es la referencia general sobre la que se construye.

## Limitaciones y advertencias

- Especialización extrema: la política solo ha visto una tarea ("coger el cubo morado e introducirlo en la caja") y un único robot; fuera de ese escenario no hay garantía de comportamiento útil.
- Sin evaluación publicada: no existe tasa de éxito, número de ensayos ni análisis de fallos, por lo que se desconoce su fiabilidad real incluso en la tarea entrenada.
- Dataset pequeño: 77 episodios y 54.777 fotogramas son pocos para generalizar; es probable que el modelo sea sensible a cambios de posición de los objetos, iluminación, fondo o tipo de cámara.
- Dependencia de la cámara: solo se entrenó con la vista `front` a 480x640; los nombres e índices de cámara deben coincidir exactamente con las claves de observación o `lerobot-rollout` fallará.
- Dependencia del embodiment: asume la cinemática y calibración de un `so101_follower`; usarlo con otro brazo o con una calibración distinta invalida las acciones predichas.
- Idioma: la instrucción de la tarea está en inglés y no se documenta soporte multilingüe para el prompt.
- Riesgo de sobreajuste y de alucinación motora: como toda política de imitación, puede ejecutar movimientos plausibles pero incorrectos ante escenas fuera de distribución, sin señal de incertidumbre.
- Checkpoint de prueba: el sufijo `lora_test` y la ausencia de descargas o likes sugieren un artefacto experimental, no una versión estable.
- Licencia: apache-2.0 permite uso comercial y modificación, pero se recomienda revisar también las condiciones del modelo base `lerobot/smolvla_base` y del dataset de origen antes de un despliegue en producción.
- Sin garantías: la licencia Apache 2.0 se distribuye sin garantía; el despliegue en un robot real implica riesgos físicos que deben mitigarse con paradas de emergencia y límites de par.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hubnemo/so101_sort_cubes_no_top_smolvla_lora_test
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Orellius/so101_sort_cubes_no_top
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Orellius/so101_sort_cubes_no_top
- Artículo SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
