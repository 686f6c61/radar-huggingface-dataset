# dddddsds31341/Long-WAM-Sorting-Dolls-30k-Step-10000

## Resumen

Long-WAM-Sorting-Dolls-30k-Step-10000 es un checkpoint de evaluación de un modelo de robótica (pipeline `robotics`) afinado por el usuario `dddddsds31341` a partir del modelo base Efficient-Large-Model/Long-WAM-YAM. Se trata de un fine-tune especializado en una tarea concreta de manipulación: colocar cinco muñecas rusas en fila, de menor a mayor, de izquierda a derecha. El checkpoint corresponde al paso de optimizador 10.000 de un entrenamiento planificado de 30.000 pasos, por lo que es un estado intermedio, no un modelo final.

El modelo pertenece a la familia Long-WAM (World Action Model de horizonte largo) y se distribuye como pesos de inferencia en formato PyTorch (`model.pt`), sin estado de optimizador, scheduler ni RNG. El repositorio ocupa 12,0 GB e incluye el código de entrenamiento e inferencia (SIP), la configuración del run, las estadísticas del dataset y el manifiesto de requisitos. Requiere assets externos (VAE Wan2.2, codificador de texto UMT5 y tokenizer) que no se incluyen.

La relevancia de esta ficha es acotada: no es un modelo de propósito general ni un LLM, sino un artefacto de investigación reproducible para una política robótica de imitación. El autor declara explícitamente que no se reclama ninguna tasa de éxito ni rendimiento en held-out, lo que conviene tener presente antes de cualquier evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Long-WAM (World Action Model); detalles de capas no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible; historial de observaciones P48 y chunk de acciones de 32 pasos |
| Tipos de cuantización | BF16 (entrenamiento e inferencia declarados); no se documentan otras |
| Idiomas soportados | no disponible (modelo orientado a instrucciones de tarea en inglés) |
| Licencia | other (sujeta a la licencia del modelo base) |
| Formato de pesos | PyTorch (`model.pt`), más `config.yaml` y `dataset_stats.json` |
| Tamaño del repositorio | 12,0 GB |
| Modalidad de entrada | Cámaras `top_head`, `hand_left`, `hand_right`; layout procesado 384 x 320 |
| Salida | 14D absolutos de articulación/pinza: 6 articulaciones + pinza izquierda, 6 articulaciones + pinza derecha |
| Normalización | z-score específica de tarea, sin recorte de valores normalizados |
| Dataset de entrenamiento | dddddsds31341/sorting-dolls-lerobot (rev. ffca92aece12b85daac426b1b0474065e1ecf165): 100 demostraciones, 168.126 frames |
| Modelo base | Efficient-Large-Model/Long-WAM-YAM (fine-tune) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Long-WAM-YAM, un "World Action Model" de la familia Long-WAM orientado a control robótico con horizonte largo. La información disponible no detalla el número de capas, dimensión oculta ni el mecanismo interno de atención; lo que sí se documenta es la interfaz de política: tres cámaras (cabeza y dos manos), un historial de observaciones de P48 y la predicción de chunks de 32 acciones en el espacio de articulaciones absolutas (14 dimensiones, incluyendo ambas pinzas en sus unidades originales). La normalización z-score se aplica por tarea y sin recorte, y debe usarse con las estadísticas exactas del run incluidas en el repositorio.

El entrenamiento se realizó sobre 100 demostraciones y 168.126 frames del dataset `sorting-dolls-lerobot`, inicializando desde Long-WAM-YAM. Se emplearon cuatro GPU A100 con batch de 12 por GPU y acumulación 1 (batch global 48), learning rate constante de 1e-5, optimizador AdamW con weight decay 0,01, semilla 42 y precisión BF16 con ZeRO-1. El checkpoint publicado corresponde al paso 10.000 de 30.000 planificados. No se documentan fases de RLHF, DPO ni preferencias humanas; se trata de aprendizaje por imitación supervisado sobre demostraciones. Tampoco se describe ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.) más allá de la propia arquitectura Long-WAM.

## Capacidades

- Generación de acciones robóticas de manipulación: produce chunks de 32 pasos de 14 dimensiones absolutas de articulación y pinza.
- Control bimanual: cubre las dos manos (6 articulaciones + pinza por mano) en un único vector de acción.
- Percepción multivista: consume tres cámaras simultáneas (`top_head`, `hand_left`, `hand_right`) a 384 x 320.
- Condicionamiento por instrucción de tarea: la política está entrenada para la instrucción "Arrange the five Russian dolls upright in a row from smallest to largest, from left to right."
- Memoria de historial: utiliza P48 observaciones previas como contexto temporal.
- Reproducibilidad de inferencia: incluye `config.yaml`, `dataset_stats.json` y `requirements-sip.txt` para replicar el pipeline.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, razonamiento simbólico, matemáticas, código, visión general, audio ni modo "thinking". Es un modelo exclusivamente de política robótica.

## Casos de uso

- Evaluación de políticas de imitación en laboratorio: cargar `model.pt` con `longwam.inference.load_run_config` y `load_model` usando `expected_step=10000` para medir el comportamiento en el paso 10.000 frente a otros checkpoints del mismo run.
- Reproducción de experimentos de fine-tuning: el repositorio incluye código, configuración y estadísticas exactas del run, lo que permite reconstruir el pipeline de entrenamiento y comparar curvas de aprendizaje en los pasos 10.000, 20.000 y 30.000.
- Benchmark interno de manipulación bimanual: la tarea de ordenar cinco muñecas rusas es un escenario acotado y medible que sirve como prueba de control fino y secuenciación.
- Estudio de normalización sin recorte: al usar z-score sin clipping, el checkpoint es útil para analizar el efecto de valores normalizados extremos en políticas de imitación.
- Base para nuevos fine-tunes: al ser un estado intermedio con licencia del modelo base, puede servir como inicialización para variantes de la misma tarea (por ejemplo, el run de nesting-doll documentado por el mismo autor).
- Docencia e investigación en robótica de imitación: permite a grupos con acceso a A100 reproducir un pipeline completo (datos, entrenamiento, evaluación) con instrucciones explícitas y sin dependencias ocultas.
- Integración en pipelines SIP: el código incluido está pensado para el entorno SIP, por lo que encaja en infraestructuras de evaluación que ya usen ese framework.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que no se reclama tasa de éxito ni rendimiento en held-out para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 12,0 GB en BF16, lo que da una cota inferior aproximada de 12 GB solo para pesos, sin contar activaciones, VAE Wan2.2, codificador UMT5 ni tokenizer.
- GPU recomendadas: el entrenamiento se hizo en 4 x A100; para inferencia se requiere al menos una GPU con memoria suficiente para pesos BF16 más los assets externos. No se especifica un mínimo oficial.
- GPU de consumo: no confirmado. Un checkpoint de 12 GB en BF16 podría caber en GPUs de 24 GB (RTX 3090/4090) si los assets externos y las activaciones lo permiten, pero no hay datos publicados que lo garanticen.
- Opciones de despliegue: el autor indica el uso de `longwam.inference.load_run_config` y `load_model` del checkout de Long-WAM incluido en `code.zip`, con el entorno SIP. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.
- Assets externos obligatorios: VAE Wan2.2, codificador de texto UMT5 y tokenizer, que deben descargarse por separado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Long-WAM-Sorting-Dolls-30k-Step-10000 | no disponible | P48 historial, chunk 32 | Ordenar 5 muñecas rusas | other (base) | Hugging Face, 12,0 GB |
| Long-WAM-Nesting-Doll-Unclipped-Step-20000 | no disponible | no disponible | Encajar muñecas rusas | other (base) | Hugging Face |
| Long-WAM-Nesting-Doll-Epoch-1 | no disponible | no disponible | Encajar muñecas rusas | other (base) | Hugging Face |
| Efficient-Large-Model/Long-WAM-YAM (base) | no disponible | no disponible | Política robótica general | según modelo base | Hugging Face |

Los tres checkpoints del mismo autor comparten familia y licencia, pero difieren en tarea (sorting frente a nesting) y en paso de entrenamiento. No se dispone de métricas comparables entre ellos en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 10.000 de 30.000; no es un modelo final ni representa el mejor estado del run.
- Sin métricas: el autor no reclama tasa de éxito ni rendimiento en held-out; cualquier evaluación debe realizarse por cuenta propia.
- Estado incompleto: `model.pt` no contiene estado de optimizador, scheduler ni RNG, por lo que no sirve para reanudar el entrenamiento, solo para inferencia.
- Dependencias externas: requiere VAE Wan2.2, UMT5 y tokenizer descargados aparte; sin ellos la inferencia no funciona.
- Rutas específicas: la configuración conserva rutas del sistema de ficheros SIP originales; es necesario adaptar las rutas de modelo, estadísticas y caché a la máquina de evaluación.
- Normalización sin recorte: los valores normalizados no se recortan, lo que puede producir acciones fuera de rango en estados alejados de la distribución de entrenamiento.
- Sesgos: no documentados, pero al entrenarse con 100 demostraciones de una única tarea, la política está fuertemente especializada y no generalizará a otras instrucciones u objetos.
- Alucinación: en el contexto robótico se traduce en acciones plausibles pero incorrectas; no hay mecanismo de verificación interno.
- Idioma: la instrucción de tarea está en inglés y no se declaran idiomas soportados.
- Licencia: "other", sujeta a la licencia del modelo base Long-WAM-YAM; es imprescindible revisar las condiciones del modelo base antes de cualquier uso comercial.
- Reproducibilidad: el código excluye datasets, checkpoints, assets, entornos, cachés, logs y secretos; la reproducción completa exige reconstruir esos elementos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dddddsds31341/Long-WAM-Sorting-Dolls-30k-Step-10000
- Modelo base: https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM
- Checkpoint relacionado (nesting, paso 20.000): https://huggingface.co/dddddsds31341/Long-WAM-Nesting-Doll-Unclipped-Step-20000
- Checkpoint relacionado (nesting, época 1): https://huggingface.co/dddddsds31341/Long-WAM-Nesting-Doll-Epoch-1
- Dataset de entrenamiento: https://huggingface.co/datasets/dddddsds31341/sorting-dolls-lerobot
- Licencia del modelo base: https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM (sección de licencia)
