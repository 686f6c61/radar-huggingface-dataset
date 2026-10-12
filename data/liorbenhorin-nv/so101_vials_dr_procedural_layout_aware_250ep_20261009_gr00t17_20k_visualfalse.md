# liorbenhorin-nv/so101_vials_dr_procedural_layout_aware_250ep_20261009_GR00T17_20k_visualfalse

## Resumen

Este repositorio contiene una política robótica (policy) entrenada mediante el framework LeRobot, resultado de un ajuste fino (fine-tuning) completo del modelo fundacional NVIDIA GR00T N1.7-3B sobre un conjunto de 250 episodios de demostraciones simuladas. El modelo está especializado en tareas de manipulación de viales con el brazo robótico SO-101, empleando randomización de dominio (DR) procedural y consciente del layout de la escena. El identificador del repositorio indica que el entrenamiento se realizó durante 20.000 pasos de optimizador con el ajuste visual desactivado.

Se trata de un modelo de acción visión-lenguaje (VLA) orientado a robótica, con 3.144.016.000 parámetros (aproximadamente 3,14 mil millones) y un tamaño de repositorio de 12,6 GB. Hereda la arquitectura de la familia GR00T N1.7 de NVIDIA, pero el ajuste se centra exclusivamente en la generación de trayectorias de acción de 16 pasos para el brazo SO-101, no en capacidades de lenguaje general.

Su relevancia radica en que documenta un flujo de entrenamiento reproducible (con commits de dataset, wrapper y backbone fijados) para políticas robóticas de bajo coste, con checkpoints nativos preservados a 10.000 y 20.000 pasos. No obstante, el propio autor indica explícitamente que esta política todavía no ha sido evaluada, por lo que su rendimiento real aún no está verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en NVIDIA GR00T N1.7; detalle interno no disponible en la informacion proporcionada |
| Parametros totales | 3.144.016.000 (aproximadamente 3,14 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; presumiblemente BF16/FP32, no confirmado) |
| Idiomas soportados | no disponible (ajuste de lenguaje desactivado durante el entrenamiento) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria LeRobot) |
| Modelo base | nvidia/GR00T-N1.7-3B (revision 2fc962b973bccdd5d8ce4f67cc63b264d6886495) |
| Backbone | revision 9ce19a195e423419c349abfc86fd07178b230561 |
| Tamano del repositorio | 12,6 GB |
| Pipeline | robotics |

## Arquitectura y entrenamiento

El modelo parte de NVIDIA GR00T N1.7-3B, un modelo fundacional de tipo visión-lenguaje-acción (VLA) desarrollado por NVIDIA para control robótico. Sobre esta base se ha realizado un ajuste fino completo orientado a producir acciones de control para el brazo SO-101, entrenado con la librería LeRobot. La información disponible no detalla los componentes internos específicos de la arquitectura N1.7 (tipo de cabezal de acción, mecanismo de difusión o flow matching, encoder visual, etc.), por lo que dichos detalles se consideran no disponibles.

El entrenamiento se ejecutó durante 20.000 pasos de optimizador con Accelerate sobre cuatro GPU RTX PRO 6000 Blackwell, con batch de 16 por GPU y batch global de 64, semilla 42 y autocast BF16 manteniendo los parámetros del modelo en FP32. Se empleó AdamW fusionado con tasa de aprendizaje 0,0001, 1.000 pasos de warmup y un schedule de coseno. El ajuste visual (`tune_visual=false`) y el ajuste de lenguaje estaban desactivados, mientras que el aumento de imágenes (image augmentation) sí estaba habilitado. Se generan acciones relativas de brazo y acciones absolutas de pinza con una ventana de 16 pasos. El dataset de entrenamiento consta de 250 episodios y 90.549 fotogramas, con randomización de dominio procedural y consciente del layout (revisión `b9018e04401a8dee9fd777908db777760a8bb64f`). El wrapper de entrenamiento (`perf/groot-fast-train`, commit `07be46c3...`) habilita solapamiento de preprocesado y AdamW fusionado.

## Capacidades

- Generación de acciones de control robótico para el brazo SO-101 en tareas de manipulación de viales.
- Ejecución de políticas de agarre y colocación de viales con ventana de acción de 16 pasos.
- Acciones relativas de brazo y absolutas de pinza.
- Manipulación guiada por entrada visual (cámaras de muñeca y externa) y estado propioceptivo.
- Robustez ante variaciones de iluminación, apariencia de superficie y color del robot gracias a la randomización de dominio del dataset de entrenamiento.
- Adaptación a variaciones de disposición de la escena (entrenamiento consciente del layout).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (ajuste de lenguaje desactivado).
- Capacidades especiales (modo thinking, visión, audio): no disponible; únicamente se documenta uso robótico.

## Casos de uso

- Manipulación automatizada de viales en entornos de laboratorio: la política puede controlar un brazo SO-101 para agarrar viales y depositarlos en gradillas, empleando la ventana de acción de 16 pasos para generar trayectorias suaves.
- Investigación en sim2real: sirve como punto de partida para estudiar la transferencia de políticas entrenadas en simulación (250 episodios con randomización de dominio) a un brazo físico SO-101.
- Reproducción de experimentos de entrenamiento VLA: con los commits de dataset, wrapper y backbone fijados y la procedencia documentada, permite replicar el pipeline de entrenamiento en LeRobot.
- Benchmarking de políticas robóticas de bajo coste: al derivar de GR00T N1.7-3B sobre un brazo económico, es útil para comparar estrategias de ajuste fino con recursos limitados frente a otros datasets de viales del mismo autor.
- Generación de datos y evaluación comparativa: el repositorio complementa otras variantes (mat-contact, STS protection, randomized grasp), lo que facilita experimentos de ablación sobre randomización de dominio.
- Prototipado educativo en robótica: al estar gestionado con LeRobot y emplear pesos safetensors, puede desplegarse en laboratorios docentes para demostrar pipelines VLA completos.
- Punto de partida para ajuste adicional: los checkpoints nativos a 10.000 y 20.000 pasos permiten continuar el entrenamiento o afinar sobre nuevas tareas de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la política todavía no ha sido evaluada ("This policy has not yet been evaluated").

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 6,3 GB solo para los pesos (3.144.016.000 parametros x 2 bytes), mas activaciones y buffers.
- VRAM estimada en FP32: aproximadamente 12,6 GB solo para los pesos (coincide con el tamano del repositorio de 12,6 GB), mas overhead.
- Entrenamiento: se utilizaron cuatro GPU RTX PRO 6000 Blackwell con batch 16 por GPU; se requiere hardware de gama profesional o de centro de datos para reproducir el entrenamiento.
- GPU recomendadas: RTX PRO 6000 Blackwell (entrenamiento); para inferencia, cualquier GPU con suficiente VRAM, como RTX 4090 (24 GB), RTX 3090 (24 GB), A100 o H100.
- Compatibilidad con GPU de consumo: probable en tarjetas con 12-24 GB de VRAM en BF16, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: framework LeRobot (libreria declarada); otros runners como vLLM, llama.cpp, Ollama o TGI no estan documentados para este modelo y no se consideran aplicables por su naturaleza robótica.
- Latencia y throughput estimados: no disponible. Se debe conservar la totalidad de los ficheros nativos de política y procesador juntos para un funcionamiento correcto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (SO-101 GR00T N1.7, 20k) | 3,14 B | no disponible | no disponible | Pesos en safetensors (LeRobot) | Ajuste sobre 250 episodios de viales, sin evaluar |
| NVIDIA GR00T N1.7-3B (base) | 3 B (aproximado) | no disponible | no disponible | Pesos abiertos en HuggingFace | Modelo fundacional VLA; referencia de partida |
| Otras variantes del autor (mat-contact, STS, randomized grasp) | no disponible | no disponible | no disponible | Pesos en HuggingFace | Mismo robot SO-101 y dominio de viales; comparables cualitativamente |

No se dispone de datos cuantitativos de rendimiento, contexto ni licencia para establecer una comparación numérica fiable con alternativas como OpenVLA o pi0. Cualquier cifra al respecto se considera no disponible.

## Limitaciones y advertencias

- Política no evaluada: la model card afirma explícitamente que el modelo todavía no ha sido evaluado, por lo que no hay garantías de rendimiento en el mundo real.
- Licencia no especificada: al no indicarse licencia, el uso comercial queda en un estado legal indeterminado y debe consultarse con el autor o con la licencia del modelo base NVIDIA GR00T N1.7-3B.
- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no aplica de forma directa al tratarse de una política de acciones, pero puede generar trayectorias no válidas o inseguras fuera de la distribución de entrenamiento.
- Especialización estrecha: entrenada únicamente para tareas de viales con el brazo SO-101 y 250 episodios; se espera poca generalización a otras tareas, objetos o robots.
- Limitaciones de idioma: el ajuste de lenguaje estaba desactivado, por lo que no se documenta soporte multilingüe ni comprensión de instrucciones en lenguaje natural.
- Dominio simulado: los datos provienen de simulación con randomización procedural; puede existir brecha sim2real no cuantificada.
- Requisito de integridad de ficheros: hay que mantener todos los ficheros nativos de política y procesador juntos; separarlos puede romper la inferencia.
- Reproducibilidad dependiente de revisiones: el correcto funcionamiento depende de las revisiones fijadas de dataset, wrapper y backbone documentadas en `training-provenance.json`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/liorbenhorin-nv/so101_vials_dr_procedural_layout_aware_250ep_20261009_GR00T17_20k_visualfalse
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Dataset de entrenamiento: https://huggingface.co/datasets/liorbenhorin-nv/so101_vials_dr_procedural_layout_aware_250ep_20261009
- Perfil del autor en HuggingFace: https://huggingface.co/liorbenhorin-nv
- Dataset relacionado (randomized grasp): https://claru.ai/datasets/liorbenhorin-nv-so101-vials-dr-randomized-grasp-250ep-20261008
- Dataset relacionado (mat-contact): https://huggingface.co/datasets/liorbenhorin-nv/so101_vials_dr_sts_mat_contact_250ep_20261004
- Dataset relacionado (STS gripper protection): https://claru.ai/datasets/liorbenhorin-nv-so101-vials-dr-sts-250ep-20261005
- Perfil del autor en GitHub: https://github.com/liorbenhorin
