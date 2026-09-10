# fm-dev/pi05-button-order-status-d-lora-gbs4-pgb1-gpu4-r2-step6000

## Resumen

El modelo `pi05-button-order-status-d-lora-gbs4-pgb1-gpu4-r2-step6000` es un adaptador LoRA de segundo ciclo (r2) sobre π0.5, orientado a robótica de manipulación sobre un brazo Franka. Lo publica el usuario `fm-dev` en Hugging Face y corresponde al checkpoint de 6.000 actualizaciones de optimizador de un entrenamiento cuyo objetivo declarado es de 12.500 actualizaciones, dentro de una tarea denominada *button_order* (variante Status-D). No es un modelo de lenguaje general: es una política visuomotora que consume observaciones visuales y estado proprioceptivo y emite comandos de acción.

El entrenamiento se realizó en local sobre 4 GPU RTX A6000, con batch global 4, batch por GPU 1 y sin acumulación de gradientes, lo que equivale a 24.000 exposiciones de muestra en el momento de este checkpoint. Se emplea LoRA de rango 32, optimizador AdamW, semilla 42 y un esquema de EMA de 0,999^4 = 0,996005996001. El autor advierte explícitamente de que la publicación de un checkpoint intermedio no constituye una evaluación de calidad de la política, y que una evaluación offline no establece la tasa de éxito en robot real.

Su relevancia es acotada y de nicho: sirve como artefacto reproducible de un pipeline de *fine-tuning* de un modelo de visión-lenguaje-acción (VLA) para tareas de manipulación concretas, con especial atención al condicionamiento temporal mediante eventos Status y subobjetivos, y a la gestión explícita de componentes sin supervisión (máscaras de pérdida).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 32) sobre π0.5, modelo de visión-lenguaje-acción; arquitectura interna de la base no disponible |
| Parámetros totales | no disponible (el repositorio ocupa 12,8 GB, pero incluye estado de optimizador, RNG y sampler, además de los pesos) |
| Longitud de contexto | 32 fotogramas muestreados uniformemente del prefijo de episodio observado [0,t] más un keyframe Writer anulable (528 tokens visuales en total); contexto Status de 48 pasos |
| Tipos de cuantización | no disponibles |
| Idiomas soportados | no disponibles (política robótica; no se declara soporte de idioma) |
| Licencia | no disponible |
| Formato de pesos | no disponible; el bundle incluye pesos EMA de serving, código de inferencia (`load_model.py`), dependencias con versiones exactas y estado reanudable no-EMA de optimizador, RNG y sampler |

## Arquitectura y entrenamiento

El punto de partida es π0.5, sobre el que se aplica un adaptador LoRA de rango 32. La información disponible no detalla la arquitectura interna del modelo base, su número de parámetros ni el volumen o composición de sus datos de preentrenamiento. El entrenamiento reportado es un *fine-tuning* de segunda ronda (`r2`), separado deliberadamente de un experimento previo de 6.250 pasos, con 4 GPU RTX A6000, batch global 4, batch por GPU 1, sin acumulación de gradientes y `seed=42`. Se declaran 24.000 exposiciones de muestra en el paso 6.000, un objetivo de 12.500 actualizaciones (50.000 exposiciones), guardado de checkpoints cada 1.000 actualizaciones, *warmup* de 250 actualizaciones hasta 5e-5 y decaimiento coseno hasta 5e-6 en el paso 12.500.

La innovación técnica destacable es el esquema Status-D: 32 fotogramas muestreados uniformemente del prefijo de episodio observado, más un keyframe Writer anulable, y un subobjetivo Writer vigente que se inicializa al comienzo de la ejecución y se actualiza en los eventos Status. El contexto Status de 48 pasos utiliza comandos de pose registrados y estado medido; la característica de comando de gripper está desactivada de forma consistente en entrenamiento e inferencia, y los *embeddings* de estado histórico están deshabilitados. Solo las filas de ejecución del robot supervisan las acciones; las imágenes y características de demostración permanecen como historia. Las etiquetas no revisadas quedan enmascaradas, y las anotaciones positivas de span de Status usan intervalos de eventos respaldados, mientras que la supervisión de extremos y negativos procede únicamente de ventanas revisadas explícitamente. Las salidas tienen forma `(20,8)`: xyz absoluto, cuaternión XYZW unitario en la carta de qx positiva y comando de gripper en [0,1]. El estado y las acciones numéricas usan normalización por desviación típica (STD), mientras que los tokens de estado usan una vista acotada train-q01/q99.

## Capacidades

- Generación de acciones robóticas: es una política, no un modelo generativo de texto. Emite acciones con forma `(20,8)` (xyz absoluto, cuaternión unitario XYZW en carta qx positiva y comando de gripper en [0,1]).
- Condicionamiento temporal sobre el prefijo de episodio completo: 32 fotogramas uniformes más un keyframe Writer anulable.
- Gestión de subobjetivo vigente: el Writer se inicializa al inicio de la ejecución y se actualiza en los eventos Status.
- Emisión de estado de transición: la salida de Status-D incluye `transition_status`, que requiere entradas causales `transition_context_*`, `current_subgoal` y `history_keyframe_index` explícitos.
- Memoria de historia visual y de estado: mediante `observe(policy, base_rgb, state)` en cada fotograma observado, incluidas las demostraciones, con reinicio entre episodios.
- Tareas de manipulación del tipo *button_order* (pulsación ordenada de botones) sobre Franka.
- No se declara soporte de *tool calling* ni de *function calling*: no disponible.
- No se declaran capacidades multilingües: no disponible.
- No se declaran capacidades de audio ni de visión más allá del uso de imagen RGB como observación.

## Casos de uso

- *Fine-tuning* de VLA para manipulación sobre Franka: el bundle sirve como punto de partida reproducible para adaptar π0.5 a una tarea concreta mediante LoRA de rango 32, sin necesidad de reentrenar el modelo base completo.
- Investigación en condicionamiento por eventos: el esquema Status-D permite estudiar cómo influyen los eventos Status y los subobjetivos del Writer en la política, con contexto Status de 48 pasos y un keyframe Writer explícito.
- Automatización de tareas de pulsación ordenada de botones: la política está entrenada específicamente para *button_order*, con salidas absolutas de pose y comando de gripper, adecuada para secuencias de accionamiento en entornos de laboratorio.
- Replicación de entrenamientos con recursos moderados: el ajuste declarado cabe en 4 GPU RTX A6000 con batch global 4 y sin acumulación de gradientes, lo que sirve de referencia para equipos con presupuesto de cómputo limitado.
- Reanudación y auditoría de entrenamiento: el repositorio incluye el estado completo no-EMA de optimizador, RNG y sampler, lo que permite reanudar el entrenamiento desde el paso 6.000 hacia el objetivo de 12.500.
- Estudio de supervisión parcial y enmascaramiento de pérdida: el modelo documenta explícitamente qué componentes quedan sin supervisión y cómo se enmascaran en el condicionamiento de flujo y en la pérdida, útil para investigar aprendizaje con etiquetas incompletas.
- Evaluación comparativa de adaptadores: al coexistir con el experimento original de 6.250 pasos, permite comparar configuraciones de entrenamiento dentro de la misma familia.
- Integración en bucles de control con gestión de episodios: el uso documentado de `observe(...)` por fotograma y el reinicio entre episodios lo hacen integrable en un bucle de control que mantenga historia visual durante la ejecución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica de forma explícita que la publicación de este checkpoint intermedio no constituye una evaluación de calidad de la política y que la evaluación offline, cuando se incluye, no establece la tasa de éxito en robot real. La búsqueda web realizada no devolvió ningún resultado técnico relevante sobre este modelo.

## Requisitos de hardware

- Entrenamiento declarado: 4 GPU RTX A6000, batch global 4, batch por GPU 1, sin acumulación de gradientes.
- VRAM de inferencia: no disponible. No se especifican requisitos oficiales de memoria.
- Tamaño del bundle: 12,8 GB, aunque incluye pesos EMA de serving, estado de optimizador, RNG y sampler; los pesos de serving ocupan una fracción no especificada de ese total.
- GPU recomendadas: no disponibles más allá de las empleadas en entrenamiento (RTX A6000).
- Viabilidad en GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI. La carga se realiza desde el propio bundle con `from load_model import load, observe; policy = load()`, lo que exige clonar el repositorio con el código de inferencia y respetar las versiones exactas de dependencias incluidas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `pi05-button-order-status-d-lora-gbs4-pgb1-gpu4-r2-step6000` (este modelo) | no disponible (LoRA rango 32 sobre π0.5) | 32 fotogramas + keyframe Writer; contexto Status de 48 pasos | sin benchmarks publicados | no disponible | Hugging Face, 0 descargas y 0 *likes* |
| π0.5 base | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |
| Experimento original de 6.250 pasos de la misma familia (r1) | no disponible | no disponible | no disponible | no disponible | referenciado en la model card, sin URL |

No se dispone de datos comparativos verificables frente a otras alternativas de la misma categoría.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 6.000 de un objetivo de 12.500 actualizaciones, por lo que no es el modelo final del entrenamiento previsto.
- El propio autor advierte de que la publicación intermedia no es una evaluación de calidad de la política.
- La evaluación offline, cuando se incluye, no establece la tasa de éxito en robot real.
- Procedencia de las revisiones: la revisión de etiquetas es de agente/modelo, no *ground truth* humano. Las etiquetas no revisadas permanecen enmascaradas.
- Supervisión parcial: solo las filas de ejecución del robot supervisan acciones; los componentes desconocidos permanecen como NaN/false y se enmascaran tanto en el condicionamiento de flujo como en la pérdida.
- El autor señala que, en la tarea Shuffle, la salida de gripper no tiene supervisión de comando y no debe interpretarse como control de gripper aprendido. La tarea *button_order* solo cuenta con etiquetas verificadas limitadas de comando cerrado.
- La característica de comando de gripper del contexto Status de 48 pasos está desactivada en entrenamiento e inferencia; no se inventa ningún comando de gripper ausente.
- Convención de pose: debe coincidir con el controlador de recogida de datos; no debe aplicarse un desplazamiento adicional de herramienta/brida.
- El cronometraje offline del Writer se proyecta con estimaciones gruesas de eventos; es condicionamiento de profesor, no una afirmación de *rollout* online con Status predicho.
- Los *splits* de episodios y la normalización usan únicamente el *split* de entrenamiento.
- Licencia no disponible: no debe asumirse uso comercial sin confirmación del autor.
- Idiomas soportados no disponibles; no se declara comportamiento multilingüe.
- Requisitos de despliegue estrictos: el bundle incluye versiones exactas de dependencias y código de inferencia propio; no se documentan integraciones estándar de servicio.
- Sin validación comunitaria: 0 descargas y 0 *likes* en el momento de la consulta.
- Los resultados de la búsqueda web realizada no contienen información técnica relevante sobre el modelo ni sobre su tarea.

## Enlaces

- Hugging Face: https://huggingface.co/fm-dev/pi05-button-order-status-d-lora-gbs4-pgb1-gpu4-r2-step6000
- No se han encontrado en la búsqueda web enlaces relevantes adicionales (papers, blogs, repositorios o demos) asociados a este modelo.
