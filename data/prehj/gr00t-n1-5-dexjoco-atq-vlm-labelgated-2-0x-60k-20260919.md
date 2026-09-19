# prehj/GR00T-N1.5-dexjoco-atq-vlm-labelgated-2.0x-60k-20260919

## Resumen

El modelo `prehj/GR00T-N1.5-dexjoco-atq-vlm-labelgated-2.0x-60k-20260919` es un ajuste fino del modelo visión-lenguaje-acción (VLA) `nvidia/GR00T-N1.5-3B`, publicado por el usuario prehj el 19 de septiembre de 2026. Se trata del checkpoint final de 60.000 pasos de una ejecución denominada DexJoco VLM-label-gated ATQ, con semilla 42 y batch global de 64 sobre 2 GPU (32 muestras por dispositivo). Almacena 2.829.861.577 parámetros en formato safetensors dentro de un repositorio de 8,0 GB que incluye pesos, configuración, metadatos de normalización y progreso del entrenador.

El modelo está etiquetado con el pipeline `robotics` y hereda la base GR00T N1.5 de NVIDIA, sobre la que el autor introduce extensiones propias: cuatro expertos enrutados (main, merged-8, merged-4 y native-8), gating de etiquetas basado en VLM, `moe_speed=2.0`, `conf_threshold=0.5`, `conf_loss_coef=0.1` y una lectura de confianza desacoplada. El entrenamiento usa la configuración `dexjoco_single_arm_conf`, con `embodiment new_embodiment` y un horizonte de acción de 16 pasos, y emplea las etiquetas del dataset `prehj/dexjoco-vlm-labels-Astra`.

Su relevancia práctica es la de un checkpoint de investigación reproducible: no es un modelo DemoSpeedup, no declara ninguna tasa de éxito de evaluación y exige la implementación personalizada de cuantización de acciones de GR00T, de modo que un cargador GR00T estándar no es suficiente para ejecutarlo. El repositorio registra 0 descargas y 0 likes, y no declara licencia ni idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Derivada de GR00T N1.5 (modelo visión-lenguaje-acción) con cuatro expertos enrutados y gating de etiquetas VLM; el detalle interno completo no está disponible |
| Parámetros totales | 2.829.861.577 (aproximadamente 2,83 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; los pesos se publican en safetensors |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | nvidia/GR00T-N1.5-3B (fine-tune) |
| Tamaño del repositorio | 8,0 GB |
| Pipeline declarado | robotics |
| Pasos de entrenamiento | 60.000 (checkpoint final) |
| Batch global | 64 (2 GPU, 32 por dispositivo) |
| Semilla | 42 |
| Horizonte de acción | 16 |
| Configuración de entrenamiento | dexjoco_single_arm_conf, embodiment new_embodiment |
| Dataset de etiquetas | prehj/dexjoco-vlm-labels-Astra |
| Fecha de publicación | 19 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo parte de GR00T N1.5, la familia de modelos visión-lenguaje-acción de NVIDIA, y el autor la modifica con componentes propios orientados a la cuantización de acciones (ATQ). Concretamente, se definen cuatro expertos enrutados (main, merged-8, merged-4 y native-8), un mecanismo de gating de etiquetas basado en VLM, `moe_speed=2.0`, un umbral de confianza de 0,5 y un coeficiente de pérdida de confianza de 0,1, con lectura de confianza desacoplada. Los objetivos de acción absolutos de DexJoco se calculan con `action_merge_reduction=last`.

El entrenamiento se ejecutó durante 60.000 pasos con semilla 42 y batch global de 64 sobre 2 GPU, en el marco de la configuración `dexjoco_single_arm_conf`, con `embodiment new_embodiment` y horizonte de 16. El repositorio conserva los pesos, la configuración, los metadatos de normalización y el progreso del entrenador, pero omite optimizador, scheduler y estado del generador aleatorio, por lo que es un checkpoint de inferencia y no una instantánea completa reanudable. No se especifica en la información disponible el número de tokens o episodios de entrenamiento, la composición exacta del dataset, ni si se aplicaron etapas de RLHF o DPO. El autor indica explícitamente que este modelo no es un DemoSpeedup y que requiere la implementación personalizada de cuantización de acciones de GR00T.

## Capacidades

- Control robótico mediante política visión-lenguaje-acción: genera acciones a partir de observaciones visuales e instrucciones, con un horizonte de predicción de 16 pasos.
- Enrutado por mezcla de expertos con cuatro expertos (main, merged-8, merged-4, native-8) y gating de etiquetas asistido por VLM.
- Cuantización de acciones (ATQ) mediante una implementación específica del autor, no incluida en los cargadores estándar de GR00T.
- Salida de confianza desacoplada con umbral configurable (`conf_threshold=0.5`), utilizable para filtrar predicciones de baja confianza.
- Ajuste específico para la tarea y el embodiment DexJoco de un solo brazo (`dexjoco_single_arm_conf`, `new_embodiment`).
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Otras capacidades especiales (modo thinking, audio, visión generalista): no disponible; la información proporcionada solo describe el uso robótico.

## Casos de uso

- Evaluación de investigación en manipulación de un solo brazo: el checkpoint puede cargarse con la implementación personalizada de ATQ para reproducir el resultado del entrenamiento de 60.000 pasos sobre el embodiment DexJoco, comparando el efecto del gating de etiquetas VLM frente a variantes sin gating.
- Estudio de enrutado de expertos en políticas robóticas: los cuatro expertos definidos (main, merged-8, merged-4, native-8) permiten analizar cómo se reparte la carga entre expertos con `moe_speed=2.0` en tareas de manipulación.
- Filtrado de acciones por confianza: la lectura de confianza desacoplada con umbral 0,5 permite descartar predicciones poco fiables antes de enviarlas a un controlador de bajo nivel, reduciendo ejecuciones erráticas.
- Comparación de estrategias de cuantización de acciones: al ser un checkpoint ATQ, sirve como referencia para medir el impacto de la cuantización de acciones frente a políticas que emiten acciones continuas sin cuantizar.
- Punto de partida para nuevos ajustes finos: el repositorio incluye pesos, configuración y metadatos de normalización, lo que facilita continuar el entrenamiento sobre otras tareas o embodiments partiendo del paso 60.000.
- Validación de pipelines de despliegue de VLA personalizados: dado que un cargador GR00T estándar no es suficiente, el modelo es un caso de prueba útil para verificar que una infraestructura de inferencia soporta arquitecturas extendidas con expertos enrutados.
- Auditoría de reproducibilidad: los hashes SHA256 y la procedencia del trabajo recogidos en `publication.json` permiten verificar la integridad de los pesos y la trazabilidad del entrenamiento en entornos de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica de forma explícita que no se reclama ninguna tasa de éxito de evaluación para este checkpoint, por lo que no se pueden presentar cifras de MMLU, HumanEval, GSM8K ni de éxito en tareas de manipulación.

## Requisitos de hardware

- VRAM estimada para inferencia en punto flotante de 16 bits: en torno a 6-8 GB solo para pesos (2,83 mil millones de parámetros), más la memoria de activaciones del codificador visual y de la cabeza de acción, que la información disponible no cuantifica.
- VRAM estimada en cuantización de 8 bits: aproximadamente 3-4 GB para pesos; en 4 bits, en torno a 1,5-2 GB. Estas cifras son estimaciones derivadas del recuento de parámetros, no datos publicados por el autor.
- El repositorio ocupa 8,0 GB en disco, incluyendo pesos, configuración, metadatos de normalización y progreso del entrenador.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, el modelo es susceptible de ejecutarse en GPU de gama alta de consumo (por ejemplo, RTX 4090 con 24 GB) siempre que la implementación personalizada de ATQ y las dependencias de GR00T sean compatibles.
- Opciones de despliegue: se requiere la implementación personalizada de cuantización de acciones de GR00T; un cargador GR00T estándar no es suficiente. No hay información sobre compatibilidad con vLLM, llama.cpp, Ollama o TGI, y no se publican pesos en GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| prehj/GR00T-N1.5-dexjoco-atq-vlm-labelgated-2.0x-60k-20260919 | 2.829.861.577 | no disponible | no disponible | Hugging Face, 0 descargas | Checkpoint de inferencia ATQ con cuatro expertos enrutados; sin tasa de éxito declarada |
| nvidia/GR00T-N1.5-3B (modelo base) | 3B según el nombre del modelo | no disponible | no disponible en la información proporcionada | Hugging Face (referenciado como base) | Modelo visión-lenguaje-acción original de NVIDIA sin las extensiones ATQ del ajuste |
| Otros modelos VLA de tamaño comparable | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de comparación en la información proporcionada |

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse licencia, no hay autorización explícita para uso comercial ni para redistribución; conviene tratar el modelo como no apto para producción hasta aclarar este punto con el autor.
- Sin evaluación publicada: la model card afirma que no se reclama ninguna tasa de éxito; el rendimiento real en tareas de manipulación es desconocido.
- Dependencia de código personalizado: requiere la implementación concreta de cuantización de acciones de GR00T; un cargador estándar fallará al cargar la arquitectura extendida.
- Checkpoint de inferencia, no reanudable: se omiten optimizador, scheduler y estado del generador aleatorio, por lo que no es posible continuar el entrenamiento exactamente desde este punto.
- Especialización estrecha: entrenado con `dexjoco_single_arm_conf`, `new_embodiment` y horizonte 16, lo que limita su aplicación directa a otros brazos, embodiments o tareas sin un nuevo ajuste.
- Riesgo de alucinación en el componente de lenguaje: al incorporar gating de etiquetas basado en VLM, las etiquetas o descripciones generadas por el componente visual-lenguaje pueden ser incorrectas y sesgar el enrutado de expertos.
- Sesgos: no disponibles; no se documenta la composición del dataset de entrenamiento ni sus posibles sesgos de recogida de datos.
- Idiomas: no disponibles; no se especifica qué lenguas acepta como entrada de instrucciones.
- Adopción nula verificable: 0 descargas y 0 likes en el momento de la consulta, sin informes independientes de terceros.
- Limitaciones de contexto: la longitud de contexto no está documentada, por lo que no se puede garantizar el manejo de historiales largos de observaciones.
- La búsqueda web realizada no devolvió resultados relacionados con este modelo: los enlaces obtenidos tratan sobre otros temas (DeepSeek, agentes de IA) y no aportan información verificable sobre este checkpoint.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/prehj/GR00T-N1.5-dexjoco-atq-vlm-labelgated-2.0x-60k-20260919
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.5-3B
- Dataset de etiquetas empleado: https://huggingface.co/prehj/dexjoco-vlm-labels-Astra
- Metadatos de publicación (hashes SHA256 y procedencia): `publication.json` dentro del repositorio del modelo
- Paper, blog o repositorio adicionales: no disponible en la información proporcionada
