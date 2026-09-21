# arkojit1/pi05_franka_haply_absjointpos

## Resumen

`arkojit1/pi05_franka_haply_absjointpos` es un checkpoint de robótica publicado por el usuario arkojit1 en HuggingFace, consistente en un ajuste fino de π₀.₅ (policy de visión-lenguaje-acción de Physical Intelligence distribuida a través de LeRobot) sobre demostraciones de un brazo Franka teleoperado con un dispositivo Haply. El modelo no genera texto ni código: su salida es una secuencia de acciones de 8 dimensiones compuesta por 7 posiciones articulares absolutas en radianes más el valor de la pinza, pensada para control directo del robot.

El checkpoint se entrenó durante 1.000 pasos sobre el dataset `Ameyapores/franka_haply_joint_delta` (94 episodios, 50.861 frames a 20 fps, una única tarea de lenguaje) y alcanzó una `eval_loss` de 0,1454 con el objetivo de flow matching sobre el 10 % de episodios reservados. En este ajuste solo se entrenó el *action expert* (~300 millones de parámetros), manteniendo congelados el codificador visual SigLIP y el modelo de lenguaje Gemma-2B del checkpoint base `lerobot/pi05_base`; el total de parámetros del repositorio es de 4.143.404.816 (~4,14 mil millones).

Su relevancia es acotada y muy específica: es un ejemplo reproducible de adaptación de un VLA de propósito general a un montaje concreto de laboratorio con presupuesto de entrenamiento reducido, y sirve como referencia para investigar espacios de acción (posiciones articulares absolutas frente a deltas) y protocolos de teleoperación. Se publicó el 21 de septiembre de 2026 y en el momento de redactar esta ficha acumula 0 descargas y 0 *likes*, sin licencia declarada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en PaliGemma: codificador visual SigLIP + modelo de lenguaje Gemma-2B (ambos congelados) más un *action expert* entrenable con objetivo de flow matching |
| Parámetros totales | 4.143.404.816 (~4,14 mil millones), según los pesos en safetensors |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Parámetros entrenables en este ajuste | ~300 millones (solo el *action expert*; `--train_expert_only`) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en precisión de entrenamiento; el ajuste se hizo en bf16) |
| Idiomas soportados | no disponible (el dataset contiene 1 única tarea de lenguaje y no se especifica el idioma) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Librería | lerobot |
| Pipeline declarado | robotics |
| Tamaño del repositorio | 9,4 GB |
| Modelo base | lerobot/pi05_base |
| Dataset de ajuste | Ameyapores/franka_haply_joint_delta |
| Espacio de acción | 8 dimensiones: dims 0-6 posición articular **absoluta** (7 DoF, radianes), dim 7 pinza |
| Observaciones | 3 cámaras RGB de 224×224 (`base_0_rgb`, `base_1_rgb`, `left_wrist_0_rgb`) + `observation.state` de 8 dimensiones |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de π₀.₅: un *backbone* PaliGemma compuesto por un codificador visual SigLIP y un modelo de lenguaje Gemma-2B, sobre el que se injerta un *action expert* que genera las acciones mediante un objetivo de *flow matching*. En este ajuste concreto, SigLIP y Gemma-2B permanecieron congelados y solo se actualizó el *action expert* (~300 millones de parámetros entrenables de los 4,14 mil millones totales). Las tres cámaras de 224×224 ocupan exactamente las tres ranuras de imagen del modelo base (`empty_cameras=0`, sin relleno enmascarado).

El entrenamiento se realizó durante 1.000 pasos con batch global 256 repartido en 8 GPUs AMD Instinct MI300X (32 por GPU, DDP con RCCL), tasa de aprendizaje 2,5e-5 con *schedule* coseno, bf16 con *gradient checkpointing*, normalización por cuantiles de estado y acción y aumento de imagen aplicado únicamente al *split* de entrenamiento. El dataset se dividió en 84 episodios de entrenamiento y 10 de evaluación, y el checkpoint publicado corresponde al paso con menor pérdida de evaluación. La `eval_loss` reportada (0,1454) es el propio objetivo de entrenamiento evaluado sobre episodios reservados, no una tasa de éxito; con solo ~10 episodios de validación es una métrica ruidosa. La política conserva los valores por defecto del modelo base: `chunk_size=50` y `n_action_steps=50`.

## Capacidades

- Generación de acciones de control robótico: produce *chunks* de 50 acciones de 8 dimensiones (7 posiciones articulares absolutas + pinza) por cada planificación.
- Control por posición articular absoluta en radianes, no por deltas ni por espacio cartesiano.
- Percepción multimodal: consume tres vistas RGB simultáneas (base, segunda base y muñeca izquierda) a 224×224 píxeles.
- Condicionamiento por estado propio: integra un vector `observation.state` de 8 dimensiones junto con las imágenes.
- Condicionamiento por lenguaje: el modelo base acepta instrucciones de tarea; en este ajuste el dataset solo contiene 1 tarea de lenguaje, por lo que la generalización a instrucciones nuevas no está respaldada por los datos de entrenamiento.
- Ejecución en lazo abierto de 2,5 s de movimiento por planificación (50 pasos a 20 fps), con posibilidad de reducir `n_action_steps` en inferencia para un control en lazo más cerrado.
- No se documenta *tool calling*, capacidad de agentes, razonamiento multi-paso, visión general, audio ni modo de pensamiento. No aplica: es una *policy* robótica, no un modelo conversacional.

## Casos de uso

- Manipulación con brazo Franka en laboratorio: el modelo recibe las tres cámaras y el estado articular y devuelve 50 posiciones absolutas de las 7 articulaciones más la pinza; encaja en montajes de *pick-and-place* ya demostrados por teleoperación.
- Reproducción de demostraciones teleoperadas con Haply: al haberse ajustado sobre 94 episodios capturados con ese dispositivo, permite replicar las trayectorias enseñadas por un operador humano en el mismo montaje y con la misma disposición de cámaras.
- Investigación en ajuste eficiente de VLA: con el *backbone* congelado y solo ~300 millones de parámetros entrenables, sirve como plantilla para adaptar π₀.₅ a un robot nuevo con un presupuesto de cómputo reducido (el ajuste de referencia usó 1.000 pasos en 8 GPUs).
- Control en lazo cerrado con re-planificación frecuente: bajando `n_action_steps` por debajo de 50 se acorta la ejecución en lazo abierto (por debajo de los 2,5 s por defecto) antes de recalcular la trayectoria, lo que resulta adecuado para tareas con contacto o incertidumbre.
- Estudio comparativo de espacios de acción: el dataset de origen tiene una columna `action` con deltas y otra `action_absolute_joint_position`; este checkpoint usa la segunda, de modo que sirve como referencia experimental para comparar posiciones absolutas frente a deltas en la misma tarea.
- Evaluación de robustez perceptiva: al depender de tres vistas fijas, permite medir la degradación del control al ocluir o alterar cada cámara por separado.
- Docencia y reproducción de resultados en robótica: es un ejemplo completo y descargable de pipeline LeRobot (dataset, entrenamiento, checkpoint y métricas) para prácticas de aprendizaje por imitación.
- Pruebas de condicionamiento por lenguaje: aunque el dataset solo contenga una tarea, el modelo base sí procesa instrucciones textuales, lo que permite experimentar con *prompts* alternativos a sabiendas de que no hay respaldo en los datos de ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (tipo MMLU, HumanEval o GSM8K) en la información disponible: no son aplicables a una *policy* robótica. El único dato cuantitativo publicado es la pérdida de evaluación del objetivo de *flow matching*.

| Métrica | Valor | Conjunto de evaluación | Notas |
|---|---|---|---|
| eval_loss (flow matching) | 0,1454 | 10 episodios reservados (~10 % del dataset) | Es el objetivo de entrenamiento, no una tasa de éxito; con 10 episodios la métrica es ruidosa y diferencias de pocos puntos porcentuales no son concluyentes |
| Paso del checkpoint | 1.000 | — | Seleccionado por menor pérdida de evaluación |
| Tasa de éxito en robot real | no disponible | — | No se reporta |
| Throughput y latencia de inferencia | no disponible | — | No se reportan |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan aproximadamente 8,3 GB (4,14 mil millones de parámetros); con las tres imágenes de 224×224, el *backbone* PaliGemma y las activaciones de la *policy*, una estimación razonable para batch 1 se sitúa en el rango de 10-14 GB. Es una estimación propia, no un dato publicado.
- GPU recomendadas: no hay recomendación oficial para inferencia. El entrenamiento documentado se ejecutó en 8× AMD Instinct MI300X (DDP con RCCL, 32 muestras por GPU). Para inferencia, GPUs con 16-24 GB o más son suficientes en la práctica.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090, RTX 3090 (24 GB) y, con menos margen, en GPUs de 16 GB como la RTX 4080 en bf16 y batch 1. No hay validación publicada de estos montajes.
- Opciones de despliegue: la vía documentada es LeRobot, cargando la política con `PI05Policy.from_pretrained("arkojit1/pi05_franka_haply_absjointpos")`. Requiere acceso al repositorio restringido `google/paligemma-3b-pt-224` (el preprocesador carga su tokenizador por identificador), aceptar su licencia y tener `HF_TOKEN` configurado. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; la arquitectura es una *policy* personalizada, no un modelo de lenguaje servible con esos *runtimes*, y no se publican pesos en GGUF.
- Latencia y throughput: no disponibles. La única restricción conocida es temporal: cada planificación produce 50 acciones que a 20 fps cubren 2,5 s de movimiento, ejecutadas en lazo abierto antes de recalcular, de modo que la inferencia debe completarse bastante por debajo de ese margen para no degradar el control.
- Almacenamiento: el repositorio ocupa 9,4 GB, muy por encima del tamaño de los pesos en bf16, presumiblemente por incluir estados de optimizador u otros artefactos de entrenamiento.

## Comparativa con modelos similares

No se dispone de datos verificables de benchmarks ni de especificaciones completas de alternativas en la información proporcionada, por lo que la comparación se limita a lo documentado.

| Modelo | Parámetros | Contexto | Espacio de acción | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arkojit1/pi05_franka_haply_absjointpos | 4,14 mil millones (~300 M entrenables en el ajuste) | no disponible | 8 dims: posición articular absoluta (7 DoF) + pinza | no disponible | HuggingFace |
| lerobot/pi05_base | misma arquitectura (este modelo es un ajuste fino suyo); parámetros totales no disponibles en la información | no disponible | por defecto del modelo base (`chunk_size=50`, `n_action_steps=50`) | no disponible | HuggingFace |
| Otros VLA de la misma categoría (por ejemplo π₀, OpenVLA o alternativas equivalentes) | no disponible | no disponible | no disponible | no disponible | no disponible |

La única diferencia contrastable frente al modelo base es el dominio: `pi05_base` es un VLA de propósito general y este checkpoint está especializado en posiciones articulares absolutas de un Franka teleoperado con Haply. No hay datos públicos que permitan afirmar que este ajuste supere al base en ninguna tarea.

## Limitaciones y advertencias

- Contrato estricto del espacio de acción: el modelo espera posiciones articulares **absolutas** en radianes. Alimentarlo con deltas articulares o con acciones en espacio cartesiano no produce un error, sino «resultados verosímiles pero sin sentido» (palabras de la propia model card). El nombre del dataset (`franka_haply_joint_delta`) se refiere a su columna `action` por defecto y puede inducir a confusión.
- El orden de las dimensiones es parte del contrato: dims 0-6 para las articulaciones y dim 7 para la pinza. Cualquier reordenación invalida el comportamiento sin aviso.
- Dependencia rígida del montaje de percepción: se requieren exactamente tres cámaras de 224×224 con los identificadores `base_0_rgb`, `base_1_rgb` y `left_wrist_0_rgb`, más un `observation.state` de 8 dimensiones. No hay cámaras enmascaradas de reserva.
- Sesgo y cobertura de datos: solo 94 episodios (50.861 frames) de un único montaje, un único operador y una única tarea de lenguaje. La generalización a objetos, posiciones o instrucciones no vistas es muy limitada y no se ha medido con tasas de éxito.
- Riesgo de sobreajuste: con 84 episodios de entrenamiento, la pérdida de evaluación sobre 10 episodios es ruidosa y no permite afirmar robustez; el propio autor advierte que diferencias de pocos puntos porcentuales no son resolubles con esa muestra.
- Ejecución en lazo abierto: por defecto se ejecutan 50 acciones (2,5 s a 20 fps) sin replanificar. En un robot real esto implica que un error de planificación se propaga durante 2,5 s antes de corregirse, con el riesgo físico asociado.
- Licencia no declarada: al no especificarse licencia, no hay autorización explícita para uso comercial ni para redistribución, y ese uso queda legalmente indeterminado.
- Dependencia de un recurso restringido: el preprocesador requiere el repositorio con acceso controlado `google/paligemma-3b-pt-224` y un `HF_TOKEN` válido, lo que condiciona la reproducibilidad y el despliegue.
- Ausencia de benchmarks y de tasa de éxito: cualquier afirmación de rendimiento en robot real carece de respaldo en la información publicada.
- Adopción nula: 0 descargas y 0 *likes* en el momento de redactar la ficha; no hay validación por terceros ni informes de uso en producción.
- Idiomas no especificados: se desconoce en qué idioma está redactada la única instrucción de lenguaje del dataset.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arkojit1/pi05_franka_haply_absjointpos
- Checkpoint base: https://huggingface.co/lerobot/pi05_base
- Dataset de ajuste: https://huggingface.co/datasets/Ameyapores/franka_haply_joint_delta
- Repositorio restringido requerido por el preprocesador: https://huggingface.co/google/paligemma-3b-pt-224
- Librería de referencia declarada en la model card: https://github.com/huggingface/lerobot (identificador `library_name: lerobot`)
- Resultados de la búsqueda web: no se encontró ningún resultado relevante sobre este modelo (los resultados devueltos correspondían a páginas de soporte de Microsoft y no guardan relación con el modelo).
