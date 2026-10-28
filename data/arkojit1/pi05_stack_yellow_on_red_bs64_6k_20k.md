# arkojit1/pi05_stack_yellow_on_red_bs64_6k_20k

## Resumen

`arkojit1/pi05_stack_yellow_on_red_bs64_6k_20k` es un ajuste fino del modelo visión-lenguaje-acción (VLA) π₀.₅, en concreto del checkpoint `lerobot/pi05_base` de Physical Intelligence, especializado en una única tarea robótica: apilar un bloque amarillo sobre uno rojo con un brazo Franka. El modelo parte de un backbone visión-lenguaje congelado (SigLIP más Gemma-2B) y entrena únicamente el *action expert*, que genera acciones de efector final en 4 dimensiones mediante *flow matching*. Se ha entrenado con LeRobot 0.4.4 sobre un dataset propio de 40 episodios teleoperados con un dispositivo Haply.

El interés práctico es doble: por un lado, demuestra el flujo completo de *fine-tuning* de π₀.₅ en LeRobot sobre hardware AMD (8 × MI300X); por otro, es un caso extremo de ajuste con muy pocos datos (40 episodios, 1 tarea, 19,2 épocas en el paso 6.000), útil como referencia de qué esperar —y qué no— de un VLA entrenado con un dataset mínimo. El checkpoint subido corresponde al paso 6.000 de un entrenamiento planificado de 20.000 pasos, por lo que el autor lo marca explícitamente como no finalizado.

Los pesos ocupan 7,5 GB en safetensors y suman 3.616.757.520 parámetros. No hay licencia declarada ni idiomas indicados, y no se publican tasas de éxito en la tarea: la única métrica disponible es la pérdida de *flow matching* en validación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (visión-lenguaje-acción) π₀.₅: encoder de visión SigLIP + modelo de lenguaje Gemma-2B (ambos congelados) + *action expert* entrenable con *flow matching*; 3 cámaras de entrada y *chunk* de 50 acciones |
| Parámetros totales | 3.616.757.520 (≈ 3,62 B) |
| Parámetros activos | No aplica (modelo denso). Entrenables en este ajuste: solo el *action expert* (`train_expert_only=true`) |
| Longitud de contexto | No aplica / no disponible: es una política de control, no un LLM de texto. Horizonte de acción: 50 pasos por *chunk* (`chunk_size=50`, `n_action_steps=50`) |
| Tipos de cuantización | No disponible (no se documenta soporte de cuantización para esta política) |
| Idiomas soportados | No disponible. La política está entrenada para una única instrucción en inglés: "Stack the yellow block on the red block." |
| Licencia | No disponible |
| Formato de pesos | safetensors (repositorio de 7,5 GB, cargado vía `lerobot`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de π₀.₅: un backbone visión-lenguaje que procesa tres imágenes de cámara y la instrucción en lenguaje natural, acoplado a un *action expert* que produce secuencias de acciones mediante *flow matching* (el mismo objetivo que genera la pérdida reportada). En este ajuste, el backbone (SigLIP y Gemma-2B) permanece congelado y solo se actualiza el *action expert*, lo que reduce el coste de entrenamiento y el riesgo de degradar la representación visual-lingüística preentrenada. Las tres ranuras de imagen del modelo base se rellenan con las claves del dataset en este orden: `observation.images.wrist` → `base_0_rgb`, `observation.images.scene0` → `left_wrist_0_rgb` y `observation.images.scene1` → `right_wrist_0_rgb`, sin mapa de renombrado y con `empty_cameras=0`.

Los datos son 40 episodios de Franka teleoperados con un dispositivo Haply, con una sola tarea, estado de 4 dimensiones y acción de 4 dimensiones como delta del efector final. El entrenamiento usó AdamW (LR pico 2,5e-5, betas 0,9/0,95, weight decay 0,01, grad clip 1,0), schedule coseno con *warmup* de 666 pasos y suelo de 2,5e-6, precisión bf16, normalización por cuantiles (q01–q99) para estado y acción, sin aumento de datos, y batch global de 64 sobre 8 × MI300X (8 por GPU). El reparto es 36 episodios de entrenamiento y los 4 últimos (36–39) reservados para evaluación. Este checkpoint es el paso 6.000 de 20.000 (19,2 épocas de 312,1 pasos/época), seleccionado por petición y no por ser el mejor: la mejor pérdida de validación registrada hasta entonces fue 0,1070 en el paso 5.000.

## Capacidades

- Manipulación robótica por imitación: ejecuta la tarea de apilar el bloque amarillo sobre el rojo a partir de observaciones visuales y de estado proprioceptivo.
- Control de efector final en 4 dimensiones (delta de posición/orientación) sobre un brazo Franka.
- Entrada multi-cámara: tres vistas simultáneas (muñeca, escena 0 y escena 1) alineadas con las ranuras del modelo base.
- Generación de acciones por *chunks* de 50 pasos, lo que amortiza el coste de inferencia del backbone entre ejecuciones.
- Acondicionamiento por instrucción en lenguaje natural, aunque en la práctica limitado a la única *task* del dataset de entrenamiento.
- Punto de partida reutilizable para *fine-tuning* adicional en tareas de apilado o *pick-and-place* similares.
- No soporta *tool calling* ni *function calling*: no es un modelo de lenguaje conversacional.
- No soporta razonamiento multistep en el sentido de agentes LLM, ni modo *thinking*, ni visión generalista fuera del bucle de control.
- No hay capacidades multilingües declaradas; el modelo no se distribuye como modelo de texto.

## Casos de uso

- Reproducción del *baseline* de apilado en Franka: sirve para validar una celda de trabajo real (cámaras, calibración, espacio de acción de 4 dimensiones) antes de invertir en un dataset mayor; su valor es que el pipeline completo ya está definido y es ejecutable.
- Estudio de eficiencia de datos en VLA: con 40 episodios y 19,2 épocas se puede medir cuánto aporta cada episodio adicional frente a un `pi05_base` sin ajustar, usando la pérdida de validación como señal barata y la tasa de éxito como validación final.
- Comparación de configuraciones de cámara: el modelo está entrenado con una disposición concreta (muñeca + dos cámaras de escena) y permite ablaciones controladas sobre `scene0`/`scene1` (posición, encuadre, resolución) midiendo el efecto en la pérdida de evaluación sobre los episodios 36–39.
- Docencia y formación en robótica de imitación: ejemplo completo y de tamaño manejable (7,5 GB) para explicar *flow matching*, congelación del backbone, normalización por cuantiles y evaluación con *holdout* por episodio.
- Punto de arranque para *fine-tuning* en una tarea de apilado propia: al estar solo entrenado el *action expert*, un ajuste adicional sobre un dataset mayor puede reutilizar el backbone y reducir horas de cómputo.
- Validación de la cadena de teleoperación Haply → LeRobot → política: permite comprobar que las acciones delta de 4 dimensiones y el estado se registran y reproducen coherentemente antes de escalar la recolección de datos.
- Prueba de infraestructura de entrenamiento en AMD MI300X con LeRobot 0.4.4: la receta (bf16, AdamW, schedule coseno fijado a 20.000 pasos) es reproducible y sirve como referencia de rendimiento del *stack*.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (tasas de éxito en la tarea, comparaciones con otros VLA) en la información disponible. Los únicos números publicados son métricas del objetivo de entrenamiento, que no equivalen a éxito en la tarea:

| Métrica | Paso 5.000 | Paso 6.000 | Notas |
|---|---|---|---|
| Pérdida de evaluación (*flow matching*, 4 episodios *held-out*) | 0,1070 | 0,1268 | El autor advierte que diferencias de milésimas están dentro del ruido |
| Pérdida de entrenamiento | — | 0,093 | Sobre 36 episodios de entrenamiento |
| Épocas completadas | 16,0 | 19,2 | De 64,1 épocas planificadas (20.000 pasos) |
| Tasa de éxito en la tarea | no disponible | no disponible | No medida ni reportada |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 8–10 GB solo para pesos (3,62 B × 2 bytes ≈ 7,2 GB) más activaciones del encoder visual con tres imágenes; una estimación conservadora sitúa el total en 10–14 GB. Es una estimación, no un dato publicado.
- GPU recomendadas para entrenamiento: el ajuste se hizo con 8 × AMD MI300X (8 muestras por GPU, batch global 64). Equivalentes en NVIDIA: 8 × H100/A100 de 80 GB para replicar la receta tal cual.
- GPU de consumo: cabe en RTX 4090 (24 GB) y previsiblemente en RTX 3090 (24 GB) y RTX 4080 (16 GB) para inferencia; en tarjetas de 8 GB requeriría cuantización, que no está documentada para esta política.
- Despliegue: la vía documentada es LeRobot 0.4.4 junto con el *fork* de `transformers` de Hugging Face para π₀ (rama `fix/lerobot_openpi`), cargando con `PI05Policy.from_pretrained(...)`. No se documenta soporte de vLLM, TGI, llama.cpp ni Ollama; no es un modelo de texto y no se beneficia de esos *runtimes*.
- Latencia y throughput: no disponibles. El diseño por *chunks* de 50 acciones implica una inferencia del backbone por cada 50 pasos de control, pero no se publican tiempos medidos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`pi05_stack_yellow_on_red_bs64_6k_20k`) | 3,62 B | *Chunk* de 50 acciones; 3 cámaras | Pérdida eval 0,1268 (paso 6.000); sin tasa de éxito | No disponible | Hugging Face |
| `lerobot/pi05_base` (modelo base) | No disponible en la información (misma familia) | *Chunk* de 50 acciones; 3 ranuras de imagen | Preentrenado generalista; sin métricas en la información | No disponible en la información | Hugging Face |
| π₀ (`lerobot/pi0_base`, generación anterior) | No disponible en la información | No disponible | No disponible | No disponible | Hugging Face / LeRobot |
| OpenVLA u otros VLA de código abierto | No disponible en la información | No disponible | No disponible | No disponible | No verificado en esta búsqueda |

La comparación cuantitativa no es posible con los datos disponibles: el único punto de referencia directo es el modelo base, y no se han publicado tasas de éxito ni evaluaciones estandarizadas para este ajuste.

## Limitaciones y advertencias

- Dataset mínimo: 40 episodios y una sola tarea. La generalización a otros objetos, colores, posiciones, fondos o condiciones de iluminación es muy limitada y no se ha medido.
- Checkpoint intermedio: es el paso 6.000 de 20.000 y el entrenamiento seguía en curso al subirlo; no es el mejor checkpoint por pérdida de validación (el paso 5.000 daba 0,1070).
- La pérdida de evaluación es el objetivo de *flow matching* sobre 4 episodios, no una tasa de éxito. No se debe usar como proxy de rendimiento real en la tarea.
- Una sola encarnación y un solo espacio de acción: brazo Franka con acción delta de 4 dimensiones. No es trasladable sin reentrenamiento a otras morfologías o a acciones en el espacio articular.
- Dependencia de nombres de cámara concretos (`wrist`, `scene0`, `scene1`): alterar el orden o el nombre de las claves rompe la correspondencia con las ranuras del modelo base y degrada la política.
- Licencia no declarada: no hay autorización explícita de uso comercial. Conviene contactar con el autor antes de cualquier despliegue en producción.
- Dependencia de un *fork* específico de `transformers` (rama `fix/lerobot_openpi`) y de LeRobot 0.4.4: riesgo de reproducibilidad si esas ramas cambian o desaparecen.
- Sin cuantización documentada: el despliegue en GPUs pequeñas o en hardware embebido no está soportado tal cual.
- Riesgo de alucinación en el sentido de acciones plausibles pero incorrectas: como toda política de imitación, puede producir trayectorias que parecen razonables y fallar en el contacto; requiere supervisión y paradas de seguridad.
- Seguridad física: no se documentan límites de par, detección de colisión ni envolventes de seguridad. Cualquier uso en un robot real necesita salvaguardas externas.
- Sesgos: no evaluados. El dataset proviene de un único operador teleoperando con Haply, por lo que puede heredar sus sesgos de estilo y velocidad de manipulación.
- Idiomas: la única instrucción es en inglés; no hay evidencia de que el modelo responda a instrucciones en castellano.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arkojit1/pi05_stack_yellow_on_red_bs64_6k_20k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Ameyapores/haply_stack_yellow_red
- Librería LeRobot: https://github.com/huggingface/lerobot
- Paper, blog o demo del autor: no disponibles en la información proporcionada.
