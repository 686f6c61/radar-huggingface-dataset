# liorbenhorin-nv/so101_vials_dr_procedural_layout_aware_250ep_20261009_GR00T17_20k_pooled_visualtrue

## Resumen

El modelo `liorbenhorin-nv/so101_vials_dr_procedural_layout_aware_250ep_20261009_GR00T17_20k_pooled_visualtrue` es una política robótica de visión-lenguaje-acción (VLA) obtenida por ajuste fino del modelo fundacional `nvidia/GR00T-N1.7-3B` sobre un conjunto de datos propio de 250 episodios (90 549 fotogramas) de manipulación de viales con el brazo de bajo coste SO-101 de LeRobot. Lo publica el usuario `liorbenhorin-nv` y está pensado para ejecutar una tarea de manipulación concreta con alta variabilidad de disposición de objetos (domain randomization procedural y layout-aware).

Con 3 144 016 000 parámetros y un repositorio de 12,6 GB, la política se entrenó durante 20 000 pasos de optimizador en cuatro GPU RTX PRO 6000 Blackwell con batch global 64, semilla 42, BF16 autocast y parámetros en FP32, con aumento de imagen activado y ajuste visual habilitado. Emite acciones relativas de brazo y absolutas de pinza en ventanas de 16 pasos, y emplea normalización «pooled» cuyos percentiles q01/q99 se calcularon sobre la totalidad de los 90 549 fotogramas de entrenamiento.

Su relevancia es doble: por un lado ilustra el flujo actual de especialización de modelos fundacionales de robótica sobre robots de bajo coste; por otro, documenta de forma inusualmente detallada la procedencia del entrenamiento (revisiones de dataset, commits de código, revisión del backbone y fichero `training-provenance.json`). El autor indica explícitamente que la política aún no ha sido evaluada, por lo que cualquier uso en producción exige una validación previa en hardware real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de visión-lenguaje-acción (VLA) sobre `nvidia/GR00T-N1.7-3B`; el detalle interno de capas no se especifica en la información disponible |
| Parámetros totales | 3 144 016 000 (dato real de los pesos en safetensors) |
| Parámetros activos | No aplica (no se describe una arquitectura MoE en la información disponible) |
| Longitud de contexto | No disponible; se documenta una ventana de acciones de 16 pasos, no una ventana de tokens de texto |
| Tipos de cuantización | No se documentan variantes GGUF, INT8 ni INT4; los pesos se publican en safetensors, con entrenamiento en BF16 autocast y parámetros FP32 |
| Idiomas soportados | No disponible; el ajuste de la torre de lenguaje está deshabilitado (`language tuning disabled`) |
| Licencia | No disponible |
| Formato de pesos | safetensors (librería `lerobot`); incluye ficheros de política y procesadores nativos que deben mantenerse juntos |

## Arquitectura y entrenamiento

Se trata de un ajuste fino completo (o al menos de política y componentes asociados) sobre el modelo fundacional `nvidia/GR00T-N1.7-3B` (revisión de modelo base `2fc962b973bccdd5d8ce4f67cc63b264d6886495`, revisión de backbone `9ce19a195e423419c349abfc86fd07178b230561`), orientado a control robótico y no a generación de texto. La salida del modelo es una ventana de 16 pasos de acción, con acciones relativas para el brazo y absolutas para la pinza, lo que es característico de políticas de imitación entrenadas por behavior cloning sobre demostraciones.

El entrenamiento se realizó exclusivamente sobre el dataset `liorbenhorin-nv/so101_vials_dr_procedural_layout_aware_250ep_20261009` (revisión `b9018e04401a8dee9fd777908db777760a8bb64f`; commit de recolección `465ca4c3fef3ef02fc3cc39f4b41d31ffb2577c1`): 250 episodios y 90 549 fotogramas de manipulación de viales con domain randomization procedural y sensible al layout. Se dieron 20 000 pasos de optimizador con Accelerate en cuatro GPU RTX PRO 6000 Blackwell, batch 16 por GPU y batch global 64, semilla 42. Se usó BF16 autocast con parámetros en FP32, aumento de imagen activado, `tune_visual=true` y ajuste de lenguaje desactivado. El optimizador fue AdamW fusionado con tasa de aprendizaje 0,0001, 1 000 pasos de warmup y schedule coseno. El wrapper de entrenamiento fijado (`perf/groot-fast-train`, commit `07be46c3c3da9561e5d407135594d109f10efe62`) habilita solapamiento de preprocesado y AdamW fusionado, con un lanzador de rango que asigna índices de dispositivo CUDA explícitos.

Como corrección destacable, la normalización de estado y acción absoluta se calculó de forma agrupada («pooled») sobre los 90 549 fotogramas, con percentiles q01/q99 verificados de forma independiente en los cuatro rangos y en los procesadores guardados (commit `cb270d79cd8ab3abe1044b9b8a006a882596e283`). Los checkpoints nativos y estados del optimizador de los pasos 10 000 y 20 000 se conservaron en la instancia de entrenamiento, pero el repositorio publicado contiene únicamente la política final de 20 000 pasos. El autor no menciona uso de RLHF, DPO ni refuerzo; el paradigma descrito es imitación supervisada con aumento de imagen.

## Capacidades

- Generación de acciones motoras para el brazo robótico SO-101 en ventanas de 16 pasos, con acciones relativas de brazo y absolutas de pinza.
- Manipulación de viales en escenarios con variación procedural de disposición (domain randomization sensible al layout), que es la tarea sobre la que se entrenó.
- Condicionamiento visual: la política consume observaciones de imagen y se entrenó con aumento de imagen y ajuste visual activado.
- Condicionamiento por lenguaje potencialmente heredado del modelo base, pero no ajustado en este entrenamiento (`language tuning disabled`), por lo que no hay garantía de seguimiento de instrucciones verbales.
- No se documenta soporte de tool calling ni de function calling: es una política de control, no un modelo de chat.
- No se documenta razonamiento multi-paso explícito, planificación simbólica ni agentes basados en texto.
- No se documentan capacidades de código, matemáticas, audio ni visión generalista fuera del bucle de control.
- No se documenta un modo «thinking» ni decodificación especulativa.

## Casos de uso

- Automatización de laboratorio: la política puede ejecutar la recogida y colocación de viales sobre la bancada con el brazo SO-101, aprovechando que fue entrenada específicamente con 250 episodios de esa tarea y con variación de posiciones.
- Sim-to-real con domain randomization: dado que el dataset es procedural y sensible al layout, resulta adecuada como punto de partida para transferir políticas entrenadas en simulación a una célula real con distribuciones de objetos cambiantes.
- Base para ajuste fino adicional: al derivar de `nvidia/GR00T-N1.7-3B`, puede servir como inicialización para dominios de manipulación de precisión distintos, reutilizando el backbone preentrenado y readaptando la cabeza de acciones.
- Recolección de datos aumentada: puede desplegarse como política inicial para recoger rollouts adicionales sobre los que reentrenar, reduciendo el coste de teleoperación humana en cada nueva configuración de bancada.
- Evaluación comparativa de pipelines de entrenamiento: los commits, revisiones y el fichero `training-provenance.json` permiten reproducir y auditar el efecto de decisiones concretas (normalización pooled, `tune_visual`, AdamW fusionado) sobre el rendimiento de una política VLA.
- Demostración educativa de VLA sobre hardware de bajo coste: el SO-101 es un brazo asequible, y esta política ilustra el ciclo completo dataset → entrenamiento multi-GPU → política desplegable en `lerobot`.
- Pruebas de robustez ante variación de layout: al haberse entrenado con DR procedural, es un candidato razonable para medir degradación cuando se altera la disposición de viales respecto de las posiciones vistas en entrenamiento.
- Integración en flujos de control tipo servidor de política: la librería `lerobot` permite exponer la política como servidor y conectar el robot como cliente, lo que facilita pruebas en banco antes de un despliegue mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica de forma explícita que la política «no ha sido evaluada todavía» (`This policy has not yet been evaluated`). No existen, por tanto, cifras de tasa de éxito, MMLU, HumanEval, GSM8K ni de ningún otro conjunto aplicable a políticas robóticas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 12,6 GB en FP32 (coincide con el tamaño del repositorio) y en torno a 6,3 GB en BF16 solo para los pesos; con las activaciones del codificador visual y la cabeza de acciones, es razonable reservar 8-12 GB en BF16. Estas cifras son estimaciones derivadas del recuento de parámetros, no medidas publicadas.
- GPU de entrenamiento utilizadas: cuatro NVIDIA RTX PRO 6000 Blackwell, batch 16 por GPU y batch global 64, durante 20 000 pasos.
- GPU de inferencia recomendadas: cualquier GPU con 12-16 GB o más (RTX 4080/4090, RTX 5090, A100, H100, L40S). Una RTX 3090 o 4090 de 24 GB es suficiente para inferencia en BF16.
- Compatibilidad con GPU de consumo: sí, previsiblemente en tarjetas de 16 GB o más; en tarjetas de 8 GB sería necesario cuantizar, y no se publican pesos cuantizados.
- Opciones de despliegue: `lerobot` (cliente de robot y servidor de política) sobre PyTorch en BF16. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje y no a políticas de control.
- Latencia y throughput: no disponibles. El modelo card no publica frecuencia de control alcanzada, tiempo de inferencia por ventana de 16 acciones ni tasa de éxito en hardware real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / acción | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (SO-101 vials DR, GR00T N1.7, 20k) | 3,14 B | Ventana de 16 pasos de acción; contexto de tokens no disponible | 250 episodios / 90 549 fotogramas propios; 20 000 pasos | No disponible | HuggingFace, librería `lerobot` |
| `nvidia/GR00T-N1.7-3B` (modelo base) | ~3 B | No disponible en la información proporcionada | Preentrenamiento fundacional de NVIDIA | No disponible en la información proporcionada | HuggingFace (referenciado como base) |
| Otros VLA de tamaño similar (OpenVLA, pi0, RDT-1B, entre otros) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificados de benchmarks ni de especificaciones detalladas de alternativas en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- La model card afirma explícitamente que la política no ha sido evaluada; no hay evidencia publicada de tasa de éxito, robustez ni seguridad en hardware real.
- No se especifica licencia, lo que impide determinar si el uso comercial está permitido. En ausencia de licencia explícita, debe asumirse que no hay autorización clara de uso comercial.
- El ajuste de la torre de lenguaje está deshabilitado: el modelo no fue afinado para seguir instrucciones verbales, de modo que no debe esperarse control por comandos en lenguaje natural.
- Es una política especializada en una tarea concreta (manipulación de viales con SO-101) y sobre una única configuración de célula; fuera de esa distribución la degradación es esperable e imprevisible sin evaluación.
- El modelo base es de NVIDIA, con su propia licencia y términos que el usuario final debe verificar por separado.
- Los ficheros de política y procesadores nativos deben mantenerse juntos; mezclar revisiones o separar los procesadores puede invalidar la normalización pooled y romper el comportamiento de la política.
- Solo se publica la política final de 20 000 pasos; los checkpoints intermedios de 10 000 pasos y los estados del optimizador permanecen en la instancia de entrenamiento privada y no están disponibles en el repositorio.
- Riesgo de alucinación en el sentido habitual de modelos de lenguaje: no aplica a la salida de acciones, pero sí existe riesgo de acciones erráticas o inseguras ante entradas visuales fuera de distribución.
- Sesgos conocidos: no documentados. Cabe esperar sesgos derivados del dataset de 250 episodios, que probablemente refleja una única configuración física, iluminación y operador de teleoperación.
- El repositorio tiene 0 descargas y 0 likes, por lo que no existe una comunidad de validación ni informes independientes de uso.
- Antes de cualquier despliegue en producción se recomienda limitar la velocidad y la fuerza del robot, definir paradas de emergencia y validar la política en un banco aislado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/liorbenhorin-nv/so101_vials_dr_procedural_layout_aware_250ep_20261009_GR00T17_20k_pooled_visualtrue
- Dataset de entrenamiento: https://huggingface.co/datasets/liorbenhorin-nv/so101_vials_dr_procedural_layout_aware_250ep_20261009
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Búsqueda web: no se encontraron enlaces relevantes; los resultados devueltos correspondían a portales educativos sin relación con el modelo.
