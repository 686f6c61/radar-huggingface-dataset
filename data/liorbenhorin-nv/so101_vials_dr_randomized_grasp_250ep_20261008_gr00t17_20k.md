# liorbenhorin-nv/so101_vials_dr_randomized_grasp_250ep_20261008_GR00T17_20k

## Resumen

SO-101 randomized vial grasp es una política de robótica (vision-language-action, VLA) resultado del ajuste fino de NVIDIA GR00T N1.7-3B sobre 250 episodios de simulación recién recogidos con randomización de dominio. El modelo lo publica el usuario `liorbenhorin-nv` y su objetivo es ejecutar la tarea de agarre de viales con el brazo robótico SO-101 en entornos simulados, sirviendo como punto de partida para transferencia sim-to-real. No incluye episodios reales ni episodios generados con Cosmos: todo el entrenamiento proviene del conjunto simulado `so101_vials_dr_randomized_grasp_250ep_20261008` (81.787 fotogramas).

Técnicamente es un ajuste de 20.000 pasos de optimizador sobre el checkpoint base `nvidia/GR00T-N1.7-3B`, con 3.144.016.000 parámetros totales y un repositorio de 12,6 GB en formato safetensors para la librería LeRobot. El entrenamiento se hizo con cuatro GPU RTX PRO 6000 Blackwell, batch global de 64, precisión mixta BF16 con parámetros en FP32, ajuste visual activado y ajuste de lenguaje desactivado, horizonte de chunk/ejecución de 16 y acciones relativas de brazo con pinza absoluta.

Su relevancia es acotada pero concreta: es un ejemplo reproducible de pipeline de ajuste de GR00T N1.7 con randomización de dominio sobre un brazo de bajo coste (SO-101), con trazabilidad completa de dataset, revisión de código de simulación y procedencia de entrenamiento en `training-provenance.json`. La propia model card advierte que la finalización del entrenamiento no demuestra éxito en lazo cerrado ni rendimiento en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) derivada de NVIDIA GR00T N1.7; backbone Cosmos (revision `9ce19a195e423419c349abfc86fd07178b230561`). Detalle interno de capas no disponible |
| Parametros totales | 3.144.016.000 (3,14 B) |
| Parametros activos | No aplica (no se documenta como MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No documentados. Pesos en safetensors; entrenamiento con autocast BF16 y parametros de modelo en FP32 |
| Idiomas soportados | No disponible. El ajuste de lenguaje se desactivo durante el entrenamiento |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria LeRobot), con ficheros JSON de processor y safetensors de processor asociados |

## Arquitectura y entrenamiento

El modelo parte de `nvidia/GR00T-N1.7-3B` (revision `2fc962b973bccdd5d8ce4f67cc63b264d6886495`), un modelo VLA de 3,14 B de parámetros que combina un backbone de visión-lenguaje con una cabeza generadora de acciones. La información proporcionada confirma el uso del backbone Cosmos y un horizonte de chunk/ejecución de 16, es decir, la política emite bloques de 16 pasos de acción que se ejecutan antes de volver a inferir. No se detalla en la model card el número de capas, la dimensión oculta ni el mecanismo exacto de la cabeza de acciones.

El ajuste fino se realizó sobre 250 episodios de simulación con randomización de dominio del dataset `liorbenhorin-nv/so101_vials_dr_randomized_grasp_250ep_20261008` (revisión `7a6bd1cfffc21a14eb0f01fa30c2756482536ce3`, 81.787 fotogramas), generados desde el commit de simulación `fdcde63ab8e8b308f3f0178ad52274b5851e3651` (rama `feature/randomized-vial-grasp`). Se dieron 20.000 pasos de optimizador con AdamW, learning rate 0,0001, 1.000 pasos de warmup y schedule coseno, semilla 42, batch 16 por GPU (global 64) en 4 RTX PRO 6000 Blackwell. Se activó el ajuste visual y la augmentación de imagen, se desactivó el ajuste de lenguaje y se usaron procesadores nativos de LeRobot con recorte (clipping). Las acciones se parametrizan como movimientos relativos de brazo y pinza absoluta. Se guardaron checkpoints en los pasos 10.000 y 20.000, y el repositorio contiene la política final de 20.000 pasos.

## Capacidades

- Generación de acciones motoras para el brazo SO-101: predice chunks de 16 pasos de acción (movimiento relativo de brazo más valor absoluto de pinza) a partir de observaciones visuales y estado del robot.
- Ejecución de la tarea específica de agarre de viales en simulación, entrenada con randomización de dominio sobre 250 episodios.
- Condicionamiento visual: el ajuste visual está activado, por lo que la política se adapta a las imágenes del dataset de entrenamiento y a variaciones cubiertas por la randomización.
- Integración con LeRobot: los ficheros de processor JSON y safetensors acompañan al checkpoint y deben mantenerse juntos para la inferencia.
- Especialización como punto de partida: sirve como política preentrenada para nuevos ajustes finos sobre la misma plataforma SO-101.
- Tool calling / function calling: no aplica, es una política robótica, no un modelo de lenguaje conversacional.
- Agentes y razonamiento multi-paso: no documentado. El único comportamiento secuencial es la ejecución por chunks de 16 acciones.
- Capacidades multilingües: no disponibles; el ajuste de lenguaje se desactivó.
- Modo thinking, visión general, audio: no documentados. Solo se documenta entrada visual para control motor.

## Casos de uso

- Agarre de viales en simulación: la política ejecuta la tarea para la que fue entrenada dentro del simulador, con las mismas condiciones de randomización del dataset, y sirve para validar el pipeline de datos antes de cualquier despliegue físico.
- Transferencia sim-to-real: al haberse entrenado con randomización de dominio y sin episodios reales, es un candidato directo para experimentos de transferencia al SO-101 real, midiendo la brecha de rendimiento entre simulación y hardware.
- Generación de datos sintéticos a escala: la política puede desplegarse como agente en el simulador para producir trayectorias adicionales (rollouts) que alimenten ciclos posteriores de entrenamiento o de evaluación de configuraciones de randomización.
- Estudio comparativo de hiperparámetros: con checkpoints en 10.000 y 20.000 pasos, permite analizar el efecto del número de pasos de optimizador sobre la tasa de éxito en una tarea de agarre concreta.
- Base para ajuste fino en tareas vecinas: al compartir plataforma (SO-101) con otros conjuntos de datos, se puede reutilizar como inicialización para tareas de manipulación relacionadas y reducir el número de episodios necesarios.
- Docencia y prototipado en robótica de bajo coste: el SO-101 es un brazo de bajo coste, y esta política permite montar un laboratorio de VLA con hardware asequible usando el ecosistema LeRobot.
- Validación de infraestructura de entrenamiento: sirve como referencia de un run completo documentado (4 GPU, batch global 64, BF16/FP32, AdamW, coseno) para reproducir o auditar pipelines de ajuste de GR00T N1.7.
- Evaluación de robustez frente a dominio: al no incluir episodios reales ni Cosmos, es útil para medir cuánto aporta exclusivamente la randomización de dominio simulada frente a otras fuentes de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasa de éxito, ni métricas de lazo cerrado, ni comparaciones numéricas con otras políticas, y advierte explícitamente que la finalización del entrenamiento no establece éxito en lazo cerrado ni rendimiento en robot real.

## Requisitos de hardware

- Tamaño de pesos: el repositorio ocupa 12,6 GB en safetensors, coherente con 3,14 B de parámetros. En FP32 los pesos ocupan aproximadamente 12,6 GB; en BF16, aproximadamente 6,3 GB. La VRAM total necesaria es superior por activaciones del backbone visual y de la cabeza de acciones; no se documenta una cifra oficial.
- GPU de entrenamiento utilizadas: 4 x NVIDIA RTX PRO 6000 Blackwell, con batch 16 por GPU y batch global 64. El entrenamiento se ejecutó con BF16 autocast y parámetros FP32.
- GPU recomendadas para inferencia: no documentadas por el autor. Por tamaño, el modelo entra en GPUs con 16-24 GB de VRAM en BF16 si el stack de inferencia lo permite, y con margen amplio en A100 40/80 GB, H100 y RTX PRO 6000.
- GPU de consumo: no confirmado. Con 3,14 B de parámetros, una RTX 4090 (24 GB) o una RTX 3090 (24 GB) son candidatas razonables en BF16 o FP16 si el runtime de GR00T N1.7 lo soporta; no hay validación publicada en la información disponible.
- Opciones de despliegue: librería LeRobot y stack de inferencia de GR00T N1.7 (Isaac-GR00T). vLLM, TGI y llama.cpp no aplican a una política VLA de control motor, aunque llama.cpp podría no ser relevante aquí en absoluto.
- Restricción de empaquetado: la política nativa debe ir acompañada de los ficheros JSON de processor y de los safetensors de processor; separarlos rompe la inferencia.
- Latencia y throughput: no disponibles. El horizonte de chunk de 16 implica una inferencia por cada 16 pasos de acción, pero no se publican tiempos por inferencia ni frecuencia de control alcanzada.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (SO-101 vial grasp, GR00T N1.7 20k) | 3,14 B | VLA ajustada para agarre de viales con SO-101 | Apache 2.0 | HuggingFace, libreria LeRobot | Entrenada solo con 250 episodios simulados con randomización de dominio |
| nvidia/GR00T-N1.7-3B | 3,14 B (según peso del ajuste) | VLA base de propósito general | No indicada en la informacion disponible | HuggingFace / NVIDIA | Modelo base del que deriva este ajuste; sin datos de benchmark en la informacion proporcionada |
| OpenVLA-7B | 7 B | VLA (backbone tipo Llama-2) | MIT (según documentacion publica del proyecto) | Codigo y pesos abiertos | Mayor tamaño; no comparable en licencia exacta sin consultar la fuente |
| pi0 (Physical Intelligence) | ~3 B (backbone tipo PaliGemma mas experto de acciones) | VLA con flow matching | Apache 2.0 (según openpi) | Repositorio openpi | Objetivo generalista multiplataforma; no entrenado para SO-101 |
| SmolVLA (HuggingFace) | ~450 M | VLA ligera para LeRobot | Apache 2.0 | LeRobot | Mucho menor tamaño; enfocada a hardware de bajo coste como SO-100/SO-101 |

Los datos de los modelos comparativos provienen de su documentación pública y no de la información proporcionada en esta búsqueda; conviene verificarlos en la fuente antes de citarlos. No hay comparación de rendimiento posible porque este modelo no publica métricas.

## Limitaciones y advertencias

- Sin validación en lazo cerrado: la model card indica explícitamente que completar el entrenamiento no demuestra éxito en la tarea ni rendimiento en robot real.
- Solo simulación: no se incluyen episodios reales ni episodios Cosmos, por lo que la brecha sim-to-real es completamente desconocida.
- Dataset reducido: 250 episodios y 81.787 fotogramas es un volumen pequeño, lo que limita la generalización fuera de la distribución de randomización usada.
- Tarea única: está ajustada para agarre de viales; no se documenta ninguna otra capacidad de manipulación.
- Ajuste de lenguaje desactivado: la instrucción en lenguaje natural no se adaptó en este run, así que el control lingüístico depende del modelo base y no está documentado.
- Idiomas y contexto: no disponibles en la información proporcionada.
- Dependencia del empaquetado de procesadores: mover o renombrar los ficheros de processor rompe la política nativa; hay que mantener el conjunto unido.
- Reproducibilidad dependiente del entorno: el entrenamiento referencia commits concretos del repositorio de simulación y revisiones concretas del modelo base y del backbone Cosmos; versiones distintas pueden alterar resultados.
- Adopción mínima: 10 descargas y 0 likes en el momento de la consulta, sin issues ni validaciones de terceros documentadas.
- Licencia: Apache 2.0 permite uso comercial, pero la licencia del modelo base y del backbone Cosmos debe verificarse por separado antes de un despliegue en producción.
- Riesgo de alucinación: en el sentido clásico de generación de texto no aplica; en su lugar existe riesgo de acciones erráticas o colisiones fuera de la distribución entrenada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/liorbenhorin-nv/so101_vials_dr_randomized_grasp_250ep_20261008_GR00T17_20k
- Dataset de entrenamiento: https://huggingface.co/datasets/liorbenhorin-nv/so101_vials_dr_randomized_grasp_250ep_20261008
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Isaac-GR00T (stack de NVIDIA para GR00T N1.x): https://github.com/NVIDIA/Isaac-GR00T
- LeRobot (librería declarada en el modelo): https://github.com/huggingface/lerobot
- SO-ARM100 / SO-101 (plataforma robótica de bajo coste): https://github.com/TheRobotStudio/SO-ARM100
- Otros enlaces (paper, blog o demo específicos de este ajuste): no disponibles en la información proporcionada.
