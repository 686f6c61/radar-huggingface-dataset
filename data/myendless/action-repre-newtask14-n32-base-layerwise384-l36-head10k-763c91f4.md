# myendless/action-repre-newtask14-n32-base-layerwise384-l36-head10k-763c91f4

## Resumen

Este repositorio contiene un checkpoint de investigación para robótica denominado "action-repre", desarrollado por el usuario myendless. No es un modelo de lenguaje conversacional, sino un módulo de lectura de acciones (*action readout*) entrenado sobre un VLM congelado de 4B parámetros (Qwen3-VL) para generar trayectorias de control robótico en forma de articulaciones absolutas (joint14) con un horizonte de 32 pasos. El componente entrenado es un DiT por capas (*layerwise DiT*) de 36 capas y anchura 384, con 111.872.680 parámetros, que se acopla al VLM congelado mediante proyectores por capa.

El modelo se enmarca en el ecosistema RoboTwin y está orientado a la generalización en nuevas tareas: se entrenó durante 10.000 pasos sobre 14 tareas retenidas, con 4.928 episodios y 1.452.052 ventanas de entrenamiento. La relevancia actual reside en su enfoque de representación de acciones sobre un backbone VLM congelado, una línea de trabajo habitual para reaprovechar modelos fundacionales de visión-lenguaje en control robótico sin reentrenar el backbone completo.

Conviene subrayar que se trata de un artefacto de investigación: no se ha realizado evaluación en bucle cerrado (*closed-loop*) para este checkpoint y la pérdida final de entrenamiento (0,0212) no constituye una tasa de éxito de control. El repositorio incluye únicamente el state dict nativo de PyTorch junto con metadatos de configuración, normalización y procedencia; no contiene episodios crudos, activos de simulador ni estados del optimizador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM congelado (Qwen3-VL 4B) + readout layerwise DiT con self/cross-attention intercalada |
| Parametros totales | 111.872.680 (solo el readout entrenado; el VLM congelado se suma aparte, tamano exacto no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (checkpoint en BF16 durante entrenamiento) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `model.pt` (state dict nativo de PyTorch, no compatible con `AutoModel.from_pretrained`) |

## Arquitectura y entrenamiento

El sistema combina un VLM Qwen3-VL de 4B parámetros completamente congelado con un módulo de lectura de acciones de tipo DiT por capas (*layerwise DiT*). Este readout consta de 36 capas, anchura 384, 6 cabezas de atención con dimensión de cabeza 64, e incluye proyectores por capa; los proyectores de índice impar permanecen asignados pero sin uso. La atención alterna modos self y cross de forma intercalada. La salida son acciones de articulación absolutas (joint14) con horizonte de chunk de 32 pasos. Este diseño supone un cambio arquitectónico respecto al experto de acción histórico de 28 capas basado en Qwen3, y no una simple ablación de anchura sobre la variante v4.

El entrenamiento consistió en 10.000 pasos frescos de readout sobre el VLM congelado, usando 8 GPUs Hygon en BF16, batch global de 128 y semilla 42. Los datos provienen de 14 tareas retenidas, cada una con 32 episodios limpios y 320 aleatorizados (4.928 episodios en total, 1.452.052 ventanas), con normalización de fuente compartida sobre 33 tareas. La inicialización del VLM procede del checkpoint `myendless/action-repre-newtask33-base-v4-j14-h32-source30k-d5b38e87` en la revisión `bcaf8af6a10435cfc5c3659bb82cd7cc23e6b72b`. La pérdida final de entrenamiento fue 0,02124078758060932. No se documenta uso de RLHF ni DPO; el proceso es supervisado sobre trayectorias.

## Capacidades

- Generación de acciones robóticas de articulación absoluta (joint14) con horizonte de 32 pasos por chunk.
- Control visuomotor a partir de observaciones procesadas por el VLM Qwen3-VL congelado.
- Generalización a tareas nuevas dentro del conjunto de 14 tareas retenidas del benchmark RoboTwin.
- Acoplamiento de representaciones visuales-lenguaje a un decodificador de acciones mediante atención cruzada por capas.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de un LLM conversacional.
- No se documentan capacidades multilingües, de visión directa al usuario, audio ni modo "thinking".

## Casos de uso

- Investigación en representación de acciones: utilizar el checkpoint como punto de partida para estudiar cómo un VLM congelado transfiere representaciones a control motor, comparando el readout de 36 capas con el experto histórico de 28 capas.
- Manipulación robótica en simulación RoboTwin: ejecutar políticas entrenadas sobre las 14 tareas retenidas para analizar la generalización a configuraciones no vistas durante el entrenamiento del readout.
- Ablaciones arquitectónicas: emplear la configuración liberada (36 capas, anchura 384, 6 cabezas) como referencia para experimentos de anchura, profundidad y número de cabezas en readouts DiT.
- Reproducción de pipelines de entrenamiento: el repositorio incluye `metadata/` con configuración, manifiesto, normalización y registros de finalización, lo que permite reproducir el proceso con el código `action_repre` y el cargador `QwenPIRepresentationV4`.
- Estudio de normalización compartida multi-tarea: la normalización de fuente sobre 33 tareas permite investigar el efecto de la normalización conjunta en el rendimiento por tarea.
- Base para evaluación en bucle cerrado: dado que este checkpoint no se ha evaluado en bucle cerrado, sirve como entrada para pipelines de evaluación que midan tasas de éxito reales en simulador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la pérdida final de entrenamiento (0,02124078758060932) y advierte explícitamente de que esta no equivale a una tasa de éxito de control. No se ha realizado evaluación en bucle cerrado para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repositorio ocupa 9,9 GB e incluye el state dict completo (VLM congelado + readout), lo que da una orientación del orden de magnitud en BF16, pero no se documentan requisitos de despliegue.
- GPU recomendadas: el entrenamiento se realizó en 8 GPUs Hygon en BF16; no se especifican modelos concretos de GPU para inferencia.
- Compatibilidad con GPU de consumo: no disponible; el tamaño del state dict completo (9,9 GB) sugiere que podría caber en GPUs de consumo con VRAM suficiente en BF16, pero no hay confirmación oficial.
- Opciones de despliegue: no es compatible con `Transformers AutoModel.from_pretrained`. Requiere el código de entrenamiento `action_repre` incluido y el cargador `QwenPIRepresentationV4` con `readout_architecture=layerwise_dit`, junto con la configuración, el procesador y la normalización liberados. Las rutas específicas de máquina en los metadatos preservados deben mapearse explícitamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros (readout) | Contexto | Benchmark | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| action-repre-newtask14 (este) | 111,9 M (readout) + VLM 4B congelado | No disponible | Sin evaluación en bucle cerrado | Apache 2.0 | HuggingFace (0 descargas) |
| action-repre-newtask33-base-v4 | No disponible | No disponible | No disponible | No disponible | HuggingFace (checkpoint de inicialización) |
| Experto de acción histórico Qwen3 (28 capas) | No disponible | No disponible | No disponible | No disponible | Referenciado en la model card, sin enlace directo |

No se dispone de datos de rendimiento comparables entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No se ha realizado evaluación en bucle cerrado: no existen métricas de tasa de éxito de control para este checkpoint.
- La pérdida de entrenamiento (0,0212) no debe interpretarse como indicador de rendimiento en tarea.
- El checkpoint no es un modelo autónomo cargable con Transformers; requiere código y cargador específicos, lo que complica su integración en pipelines estándar.
- Los metadatos conservan rutas específicas de máquina que deben remapearse manualmente antes de su uso.
- No se incluyen episodios crudos de robot, activos de simulador, estado del optimizador ni checkpoints intermedios, lo que limita la reproducibilidad completa del entrenamiento.
- El alcance se restringe a 14 tareas retenidas del entorno RoboTwin; no hay evidencia de generalización fuera de ese dominio.
- No se documentan sesgos, comportamiento multilingüe ni riesgos de alucinación en el sentido de un LLM; el riesgo principal es de sobreajuste al conjunto de tareas y de fallo silencioso en control real.
- La licencia Apache 2.0 permite uso comercial del artefacto, pero la ausencia de validación en bucle cerrado desaconseja su uso en producción sin evaluación adicional.

## Enlaces

- HuggingFace: https://huggingface.co/myendless/action-repre-newtask14-n32-base-layerwise384-l36-head10k-763c91f4
- Checkpoint de inicialización del VLM: https://huggingface.co/myendless/action-repre-newtask33-base-v4-j14-h32-source30k-d5b38e87 (revisión `bcaf8af6a10435cfc5c3659bb82cd7cc23e6b72b`)
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código o demos adicionales.
