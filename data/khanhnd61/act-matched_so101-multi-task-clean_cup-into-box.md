# khanhnd61/act-matched_so101-multi-task-clean_cup-into-box

## Resumen

`act-matched_so101-multi-task-clean_cup-into-box` es una política robótica (policy) entrenada con ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales. La publica el usuario khanhnd61 en Hugging Face mediante LeRobot, la librería de Hugging Face para aprendizaje automático en robótica del mundo real, y está pensada para el brazo SO-101 en configuración `so_follower` con dos cámaras (`front` y `wrist`).

El modelo consume el estado del robot (vector de 6 dimensiones) y dos imágenes RGB de 480x640, y produce un vector de acción de 6 dimensiones. Se entrenó sobre el dataset `khanhnd61/so101-multi-task-clean` (44 episodios, 15.317 fotogramas a 30 FPS) con tres tareas de manipulación: meter la cinta en la caja, meter la cinta en el vaso y meter el vaso en la caja.

Con 76.438.278 parámetros y pesos en safetensors (repositorio de 0,6 GB), es un modelo lo bastante pequeño para ejecutarse en GPU de consumo o incluso en CPU. Su relevancia es práctica: ejemplifica el flujo completo de LeRobot (teleoperar, grabar dataset, entrenar una policy ACT y desplegarla en hardware real) y sirve como punto de partida para fine-tuning en tareas de pick-and-place. El repositorio no incluye resultados de evaluación ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), método de aprendizaje por imitación que predice chunks de acciones; detalles de capas, cabezas y backbone visual no disponibles en la model card (referencia: arXiv:2304.13705) |
| Parametros totales | 76.438.278 (dato real de safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; no es un modelo de lenguaje. La política consume el estado actual del robot y dos imágenes por paso de inferencia |
| Tipos de cuantizacion | No disponible; el repositorio publica pesos en safetensors sin variantes cuantizadas documentadas |
| Idiomas soportados | No disponible / no aplica (política de robótica sin capacidades lingüísticas). Las tareas del dataset se etiquetan en inglés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio de 0,6 GB) |
| Tipo de robot | `so_follower` (SO-101) |
| Camaras | `front`, `wrist` — 3x480x640 cada una |
| Entradas | `observation.state` (6,), `observation.images.front` (3,480,640), `observation.images.wrist` (3,480,640) |
| Salidas | `action` (6,) |
| Frecuencia de control | 30 FPS (según el dataset de entrenamiento) |
| Dataset de entrenamiento | `khanhnd61/so101-multi-task-clean`: 44 episodios, 15.317 fotogramas, 30 FPS |
| Pasos de entrenamiento | 19.000 (batch size 8, optimizador adamw, learning rate 1e-5, seed 1000) |
| Version de LeRobot | 0.6.1 |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-14 / 2026-09-14 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación basado en transformers que, en lugar de predecir una única acción por paso, predice un chunk de acciones futuras. Este enfoque reduce el error de acumulación típico de las políticas paso a paso y amortigua el coste de inferencia, algo crítico en bucles de control a 30 FPS. La model card remite al paper Action Chunking with Transformers (arXiv:2304.13705) para los detalles arquitectónicos; no se especifican en el repositorio el número de capas, la dimensión del modelo, el mecanismo de atención ni el backbone visual empleado.

El entrenamiento se realizó con LeRobot 0.6.1 sobre teleoperación real: 44 episodios y 15.317 fotogramas capturados a 30 FPS con tres tareas etiquetadas. La configuración reportada es de 19.000 pasos con batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta si hubo componentes adicionales como decodificación especulativa, ensamblado temporal (temporal ensembling) o aumento de datos, ni la composición exacta del dataset más allá del número de episodios y fotogramas.

## Capacidades

- Control robótico por imitación: genera comandos de acción de 6 dimensiones para el brazo SO-101 en configuración `so_follower`.
- Manipulación multi-tarea: entrenado explícitamente para tres tareas ("Put the tape into the box", "Put the tape into the cup", "Put the cup into the box").
- Percepción visual dual: procesa simultáneamente una cámara frontal y una cámara de muñeca a 480x640.
- Fusión de estado propioceptivo y visión: combina `observation.state` (6,) con las dos entradas visuales.
- Predicción de chunks de acciones en lugar de acciones individuales, lo que mejora la estabilidad del movimiento.
- Ejecución condicionada por tarea: el comando de rollout acepta `--task` para seleccionar la instrucción.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico ni generación de texto.
- No tiene capacidades multilingües ni de visión general (no es un VLM); las imágenes se usan exclusivamente como entrada de control.
- No dispone de modo de razonamiento explícito ni de salida de texto interpretable.

## Casos de uso

- Automatización de pick-and-place en línea de montaje: la política puede ejecutar las tres tareas aprendidas (cinta a la caja, cinta al vaso, vaso a la caja) sobre un SO-101, con entrada visual directa y sin necesidad de planificación simbólica.
- Fine-tuning para tareas de ensamblaje similares: el checkpoint sirve como inicialización para reentrenar con `lerobot-train` sobre un dataset propio, reduciendo el número de episodios necesarios frente a entrenar desde cero.
- Banco de pruebas de despliegue LeRobot: permite validar el pipeline `lerobot-rollout` con `--strategy.type=base`, comprobar calibración de cámaras y puertos, y medir la latencia real del bucle de control a 30 FPS.
- Investigación en aprendizaje por imitación: útil como baseline ACT para comparar contra métodos alternativos (por ejemplo Diffusion Policy) en el mismo dataset multi-tarea.
- Docencia y divulgación en robótica: al ser un modelo de 76 M de parámetros con licencia permisiva, se puede desplegar en laboratorios con hardware de bajo coste para explicar el ciclo completo teleoperación-entrenamiento-despliegue.
- Generación de datos y evaluación de robustez: sirve para estudiar cómo degrada el rendimiento al mover objetos, cambiar la iluminación o introducir distractores, aunque no haya tasas de éxito publicadas que sirvan de referencia.
- Prototipado de cédulas robotizadas de bajo coste: el SO-101 es un brazo económico, y esta política demuestra que con 44 episodios se puede obtener un control operativo para tareas repetitivas de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La sección de evaluación de la model card está vacía y contiene literalmente la indicación de que no se han proporcionado resultados para esta política. No existen datos de tasa de éxito, número de ensayos ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- Huella de pesos (estimación a partir de los 76.438.278 parámetros): unos 306 MB en fp32 y unos 153 MB en fp16/bf16. El repositorio completo ocupa 0,6 GB.
- VRAM estimada para inferencia: por debajo de 2 GB con batch 1, sumando activaciones de dos imágenes de 480x640, aunque no hay medición oficial publicada.
- Cabe en GPU de consumo: cualquier GPU con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 3060, RTX 4090). También es viable en CPU para pruebas, con mayor latencia.
- GPU de datacenter: A100, H100 o L40S están sobredimensionadas para inferencia, pero son útiles para entrenar o reentrenar la política.
- Despliegue: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para entrenamiento), con PyTorch y `--policy.device=cuda`. No aplican vLLM, TGI, Ollama ni llama.cpp porque no es un modelo de lenguaje.
- Latencia y throughput: no documentados. El dataset está grabado a 30 FPS, lo que implica un presupuesto aproximado de 33 ms por paso de control; el uso de chunks de acciones de ACT está diseñado precisamente para relajar ese requisito de frecuencia de inferencia.

## Comparativa con modelos similares

| Modelo | Metodo | Parametros | Entradas | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| act-matched_so101-multi-task-clean_cup-into-box | ACT (aprendizaje por imitación con chunks de acciones) | 76.438.278 | Estado (6,) + 2 imágenes 480x640 | No publicado | apache-2.0 | Hugging Face, vía LeRobot |
| Otros checkpoints ACT del Hub de LeRobot | ACT | No disponible | Estado + imágenes (según configuración del robot) | No disponible | Variable por repositorio | Hugging Face |
| Diffusion Policy (familia de políticas por difusión para robótica) | Difusión generativa sobre acciones | No disponible | Estado + imágenes | No disponible en la información proporcionada | No disponible | Publicaciones académicas y repositorios propios |
| SmolVLA y otros VLA del ecosistema LeRobot | Vision-Language-Action | No disponible | Estado + imágenes + instrucción en lenguaje natural | No disponible | Variable por repositorio | Hugging Face |

La diferencia funcional principal frente a las alternativas es el alcance: este checkpoint está especializado en tres tareas concretas sobre un SO-101 y no acepta instrucciones en lenguaje natural, mientras que los modelos VLA del mismo ecosistema sí incorporan condicionamiento por texto. No se dispone de datos cuantitativos para comparar tasas de éxito.

## Limitaciones y advertencias

- No hay resultados de evaluación publicados: la tasa de éxito real de las tres tareas es desconocida.
- Entrenamiento con datos muy limitados: 44 episodios y 15.317 fotogramas implican poca cobertura de posiciones de objetos, iluminación, fondos y distractores.
- Especialización estrecha: solo funciona con los objetos y las tres tareas concretas del dataset; no generaliza a instrucciones nuevas.
- Dependencia fuerte del montaje: exige el robot `so_follower`, dos cámaras cuyos nombres deben coincidir con las claves de observación (`front` y `wrist`), y una calibración concreta. Cambios de cámara, resolución, encuadre o calibración degradan el comportamiento.
- Ambigüedad en el nombre del repositorio: el identificador incluye `cup-into-box`, pero el dataset es multi-tarea y el ejemplo de la model card ejecuta `--task="Put the tape into the box"`. Conviene verificar a qué tarea corresponde realmente el checkpoint antes de desplegarlo.
- Sin capacidades lingüísticas ni de razonamiento: no es un VLA, no procesa texto libre ni puede explicar sus decisiones.
- Sesgos: no documentados, pero al derivar de datos teleoperados hereda los sesgos del operador y las condiciones del entorno de grabación (iluminación, disposición de la mesa, estilo de manipulación).
- Alucinación: no aplica en sentido lingüístico; el riesgo equivalente es la ejecución de acciones erróneas o inseguras ante estados fuera de distribución.
- Licencia: apache-2.0 permite uso comercial del modelo, pero la licencia de los datos de demostración y del dataset asociado no está especificada en la información proporcionada.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin validación por parte de la comunidad.
- Fechas del repositorio: creado y actualizado el 2026-09-14 según los metadatos de Hugging Face.
- Para producción se recomienda evaluar la política con múltiples ensayos por tarea, definir paradas de seguridad y limitar el espacio de trabajo del brazo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/khanhnd61/act-matched_so101-multi-task-clean_cup-into-box
- Dataset de entrenamiento: https://huggingface.co/datasets/khanhnd61/so101-multi-task-clean
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=khanhnd61/so101-multi-task-clean
- Paper de ACT: https://arxiv.org/abs/2304.13705
- Página del paper en Hugging Face: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los enlaces obtenidos correspondían a foros de bricolaje y no se han incluido.
