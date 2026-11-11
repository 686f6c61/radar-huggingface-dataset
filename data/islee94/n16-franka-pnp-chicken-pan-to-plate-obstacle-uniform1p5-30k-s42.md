# islee94/n16-franka-pnp-chicken-pan-to-plate-obstacle-uniform1p5-30k-s42

## Resumen

El modelo `n16-franka-pnp-chicken-pan-to-plate-obstacle-uniform1p5-30k-s42` es un checkpoint de GR00T N1.6, la familia de modelos fundacionales de visión-lenguaje-acción (VLA) de NVIDIA orientada a robótica humanoide y manipulación. Lo publica el usuario `islee94` en Hugging Face y no se trata de un modelo conversacional ni de un LLM de propósito general, sino de una política de control entrenada por imitación para una tarea robótica concreta: pasar un pollo de una sartén a un plato con un brazo Franka y esquivando un obstáculo.

El checkpoint procede de un entrenamiento de ajuste fino sobre datos reales de Franka correspondientes a la tarea `pnp_chicken_pan_to_plate_obstacle`, con datos retemporizados «Uniform 1.5» (`chicken_uniform_1p5`). Se entrenó durante 30.000 actualizaciones en 4 GPU A100 (4 × 16 de batch), con semilla 42, partiendo de la revisión `gr00tn16 179b98b`. El autor indica explícitamente que la evaluación en robot está pendiente, por lo que no hay resultados de éxito en hardware real publicados.

Con 3.286.608.832 parámetros y un repositorio de 6,6 GB, el artefacto está pensado para inferencia (solo contiene pesos y ficheros de configuración, sin estado del optimizador). Su relevancia es acotada: sirve como referencia reproducible de un ajuste fino de GR00T N1.6 sobre una tarea de manipulación con obstáculos, útil para quien trabaje con VLA aplicados a robótica de manipulación y quiera inspeccionar la configuración, las estadísticas del dataset o reutilizar el checkpoint como punto de partida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.6 (modelo fundacional visión-lenguaje-acción para robótica; detalles internos no disponibles en la model card) |
| Parametros totales | 3.286.608.832 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (dos shards: `model-00001-of-00002.safetensors`, `model-00002-of-00002.safetensors`) |

## Arquitectura y entrenamiento

La model card identifica el modelo como un checkpoint de GR00T N1.6, la versión 1.6 de la familia de modelos fundacionales VLA de NVIDIA para robótica. No se detalla en la información disponible la arquitectura interna (composición de encoders de visión, lenguaje y acción, mecanismo de atención ni política de difusión o regresión), por lo que cualquier descripción más fina sería especulativa. El checkpoint contiene únicamente ficheros de inferencia: `config.json`, `embodiment_id.json`, configuración de experimento (`experiment_cfg/`), estadísticas del dataset (`statistics.json`, `dataset_statistics.json`) y los dos shards de pesos.

El entrenamiento es un ajuste fino supervisado sobre demostraciones reales de un brazo Franka para la tarea `pnp_chicken_pan_to_plate_obstacle`, con datos retemporizados a un factor «Uniform 1.5». Se realizaron 30.000 actualizaciones con 4 GPU A100 y batch efectivo de 4 × 16, semilla 42, partiendo de la revisión `gr00tn16 179b98b`. El autor incluye hashes SHA-256 de los ficheros de contexto y manifiesto (`raven_context.txt`, `pacedistill_manifest.json`, `uniform_1p5.json`), lo que facilita la trazabilidad del proceso. No se especifica en la información disponible el volumen de demostraciones, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO u otras etapas de alineamiento.

## Capacidades

- Control robótico de manipulación: genera acciones para un brazo Franka en la tarea de recoger un pollo de una sartén y depositarlo en un plato evitando un obstáculo.
- Política condicionada por visión y lenguaje: al ser un modelo VLA de la familia GR00T, se espera que acepte observaciones visuales e instrucciones en lenguaje, aunque la model card no detalla el formato exacto de entrada.
- Ejecución de una tarea concreta: el checkpoint está especializado en un único escenario; no es un modelo generalista de propósito múltiple.
- Reproducibilidad: incluye configuración de experimento, estadísticas de normalización y hashes de los artefactos de entrenamiento.
- No se documentan en la información disponible capacidades de tool calling, razonamiento multi-paso, generación de texto, código, matemáticas, audio ni modo «thinking».

## Casos de uso

- Reproducción de experimentos de VLA: el checkpoint permite reproducir o comparar el ajuste fino de GR00T N1.6 sobre la tarea `pnp_chicken_pan_to_plate_obstacle` con la misma semilla y configuración documentada.
- Punto de partida para nuevos ajustes finos: sirve como inicialización para tareas de manipulación similares (transferencia de objetos entre recipientes con obstáculos) en brazos Franka.
- Evaluación de retemporización de datos: los datos «Uniform 1.5» permiten estudiar el efecto del retiming sobre la calidad de la política en una tarea de pick-and-place.
- Análisis de configuración y estadísticas: los ficheros `experiment_cfg/` y `statistics.json` son útiles para inspeccionar normalización, procesadores y parámetros del modelo sin necesidad de ejecutar inferencia.
- Benchmark interno de políticas robóticas: puede usarse como referencia en comparaciones de éxito de tarea, siempre que se evalúe en el mismo entorno Franka y con el mismo obstáculo.
- Docencia e investigación en robótica: adecuado para prácticas sobre imitación, VLA y despliegue de políticas en simulador o hardware, dado su tamaño moderado (3,3 mil millones de parámetros).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la evaluación en robot está pendiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo de 3,29 mil millones de parámetros en fp16 requiere aproximadamente 6,6 GB solo para pesos, más memoria para activaciones y observaciones; en fp32 ascendería a unos 13,2 GB. Estas cifras son estimaciones de cálculo, no datos publicados por el autor.
- GPU de entrenamiento documentadas: 4 × A100 (batch 4 × 16).
- GPU recomendadas para inferencia: no disponible. Por tamaño, cabría en GPU de consumo con suficiente VRAM (por ejemplo, RTX 3090/4090 de 24 GB) en precisión reducida, pero no hay confirmación del autor.
- Opciones de despliegue: no disponible. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; al ser un modelo de robótica, el despliegue habitual sería mediante el stack de GR00T/Isaac de NVIDIA, no especificado en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| n16-franka-pnp-chicken-pan-to-plate-obstacle-uniform1p5-30k-s42 | 3.286.608.832 | no disponible | Manipulación Franka (pollo sartén→plato con obstáculo) | no disponible | Hugging Face (0 descargas, 0 likes) |
| GR00T N1.6 base (revisión `179b98b`) | no disponible | no disponible | Modelo fundacional VLA generalista | no disponible | Referenciado como origen del ajuste fino |
| Otros checkpoints de la misma familia en el perfil `islee94` | no disponible | no disponible | Variantes de tareas y retimings | no disponible | No verificado en la información disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas.

## Limitaciones y advertencias

- Especialización extrema: el checkpoint está entrenado para una única tarea y un único embodiment (Franka); no se espera que generalice a otras tareas, objetos o robots sin nuevo ajuste.
- Evaluación pendiente: el autor indica que la evaluación en robot real está pendiente, por lo que no hay evidencia publicada de tasa de éxito.
- Licencia no especificada: no se indica licencia en la model card, lo que impide determinar si el uso comercial está permitido. Conviene consultar los términos de GR00T N1.6 de NVIDIA antes de cualquier uso productivo.
- Sesgos y alucinación: no aplican en el sentido habitual de un LLM, pero sí existe riesgo de comportamiento errático fuera de la distribución de los datos de entrenamiento (iluminación, posiciones iniciales, obstáculos distintos).
- Idiomas: no se documenta soporte multilingüe; las instrucciones en lenguaje, si las hubiera, probablemente estén en inglés y limitadas al vocabulario de la tarea.
- Contexto: no se especifica la longitud de contexto ni la ventana de observación; no debe asumirse capacidad de razonamiento multi-paso.
- Repositorio con 0 descargas y 0 likes: no hay validación comunitaria ni informes de terceros sobre su funcionamiento.
- Solo inferencia: no incluye estado del optimizador, por lo que no es reanudable directamente para continuar el entrenamiento sin reinicializar el optimizador.

## Enlaces

- Hugging Face: https://huggingface.co/islee94/n16-franka-pnp-chicken-pan-to-plate-obstacle-uniform1p5-30k-s42
- Repositorio de GR00T de NVIDIA: no disponible en la información proporcionada
- Paper de GR00T N1.6: no disponible en la información proporcionada
- Blog o demo del autor: no disponible en la información proporcionada
