# Ryuxi/Qwen3-VL-8B-Instruct-c_abliterated-v3-furry

## Resumen

Qwen3-VL-8B-Instruct-c_abliterated-v3-furry es un modelo de visión-lenguaje de aproximadamente 8.000 millones de parámetros, especializado en el etiquetado automático estilo booru y la generación de descripciones en lenguaje natural de ilustraciones de personajes antropomórficos, escamosos y dragoniles. Lo publica el usuario Ryuxi en Hugging Face y deriva de `prithivMLmods/Qwen3-VL-8B-Instruct-c_abliterated-v3`, que a su vez parte de Qwen3-VL-8B-Instruct. El ajuste fino se realizó mediante QLoRA sobre el dataset `hearmeneigh/e621-rising-v3-small`, alineando el vocabulario de salida con los estándares de etiquetas de e621 y Danbooru.

El modelo hereda la arquitectura `Qwen3VLForConditionalGeneration` del base: un backbone de texto de 36 capas con dimensión oculta 4096 y una torre de visión de profundidad 27. Se distribuye exclusivamente en formato GGUF para llama.cpp, con los pesos principales en cuantización Q8_0 (8,11 GB) y un proyector multimodal `mmproj` en f16 (1,08 GB). Ambos ficheros son obligatorios para conservar la capacidad de visión.

Su relevancia actual es de nicho: cubre una tarea concreta —anotación de datasets de arte furry/scalie para entrenamiento de modelos de imagen como SDXL, Flux, Illustrious o Pony— con una alineación de etiquetas que los modelos generalistas no ofrecen. El modelo base es una variante *abliterated*, es decir, con el comportamiento de rechazo suprimido, lo que se traduce en ausencia de negativas ante contenido explícito.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `Qwen3VLForConditionalGeneration` (transformer multimodal denso; texto: 36 capas, hidden 4096; torre de visión: profundidad 27) |
| Parámetros totales | 8.190.735.360 (~8B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096–32768 según configuración en tiempo de ejecución; 8192 recomendado |
| Tipos de cuantización | Q8_0 (pesos principales) y f16 (proyector multimodal); repo de 9,9 GB |
| Idiomas soportados | inglés (`en`) y chino (`zh`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); requiere cargar el GGUF principal y el `mmproj` conjuntamente |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal denso con dos componentes: un backbone de lenguaje de 36 capas y dimensión oculta 4096, y una torre de visión de 27 capas que codifica la imagen y la proyecta al espacio de embeddings del LLM mediante un proyector multimodal separado (`mmproj`). La modalidad es imagen a texto, con soporte de conversación multi-turno sobre una única imagen por turno.

El entrenamiento consistió en un ajuste fino QLoRA sobre `prithivMLmods/Qwen3-VL-8B-Instruct-c_abliterated-v3`, usando el dataset `hearmeneigh/e621-rising-v3-small`. El objetivo del ajuste fue doble: concentrar la atención visual en personajes antropomórficos, dragoniles y reptilianos, y alinear el vocabulario de salida con la taxonomía canónica de etiquetas de e621 (General Top 10k) y Danbooru. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO posteriores. El comportamiento *abliterated* (rechazo suprimido) se hereda del checkpoint base y se preserva en el ajuste.

## Capacidades

- Predicción de etiquetas estilo booru: devuelve etiquetas canónicas en `snake_case` de e621 y Danbooru, ordenadas de mayor a menor relevancia.
- Análisis estructurado en tres secciones con el prompt nativo: resumen de rasgos visuales, conjunto de etiquetas canónicas y etiquetas relacionadas o de estilo, en una sola pasada.
- Descripción detallada en lenguaje natural: textos largos y seccionados en inglés que cubren especie, color y marcas del pelaje o escamas, pose, anatomía, ropa, expresión, composición, iluminación y fondo.
- Razonamiento sobre el espacio de etiquetas: normalización, alias, relaciones hipónimo-hiperónimo y sugerencia de etiquetas relacionadas, cubierto por la porción de texto del mix de entrenamiento.
- Ausencia de ruta de rechazo: heredada del base abliterated; describe contenido explícito en lugar de declinarlo.
- Soporte de conversación multi-turno sobre imagen (una imagen por turno).
- Capacidades multilingües limitadas a inglés y chino; las cabeceras de sección se emiten en el idioma de la instrucción, mientras que los tokens de etiqueta son siempre canónicos.
- No se documenta soporte de tool calling, function calling ni razonamiento agéntico multi-paso en la información disponible.

## Casos de uso

- Anotación masiva de datasets de arte furry/scalie: el modelo genera etiquetas e621/Danbooru canónicas para lotes de imágenes, lo que permite construir captions de entrenamiento para SDXL, Flux, Illustrious o Pony sin anotación manual.
- Generación de captions para fine-tuning de modelos de imagen: las descripciones largas y seccionadas en inglés sirven directamente como texto de entrenamiento con cobertura de especie, anatomía, pose e iluminación.
- Catalogación y búsqueda en archivos personales: procesar una colección de ilustraciones para producir metadatos etiquetados que alimenten un índice de búsqueda por etiqueta.
- Normalización de taxonomía de etiquetas: consultar al modelo sobre alias, relaciones jerárquicas y etiquetas relacionadas para limpiar y unificar vocabularios de etiquetado existentes.
- Asistencia a artistas en la preparación de publicaciones: generar un conjunto de etiquetas y una descripción estructurada a partir de la imagen final antes de subirla a un booru.
- Investigación sobre sesgos y alineación en modelos abliterated: el checkpoint permite estudiar cómo se comporta un modelo sin ruta de rechazo en tareas de descripción visual, en un entorno controlado y con fines de investigación.
- Pipeline de curaduría con revisión humana: usar el modelo como primer paso automático de etiquetado y reservar la validación manual para las imágenes con etiquetas de baja confianza o contenido sensible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos Q8_0 ocupan 8,11 GB y el `mmproj` f16 otros 1,08 GB, lo que suma unos 9,2 GB solo en pesos; con overhead de contexto (8192 tokens recomendados) conviene reservar entre 11 y 14 GB de VRAM.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40/80 GB, H100; cualquier GPU con al menos 12-16 GB de VRAM puede ejecutar el modelo con contexto reducido.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090) ajustando el contexto; con 8 GB no es viable en Q8_0 sin descargar capas a CPU.
- Opciones de despliegue: llama.cpp (formato nativo), LM Studio y cualquier frontend compatible con GGUF y `mmproj`; no se distribuyen pesos en safetensors para vLLM o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-VL-8B-Instruct-c_abliterated-v3-furry | ~8B | 4096–32768 | Etiquetado booru furry/scalie, abliterated | Apache 2.0 | GGUF |
| prithivMLmods/Qwen3-VL-8B-Instruct-c_abliterated-v3 (base) | ~8B | no disponible | Visión-lenguaje general, abliterated | no disponible | no disponible |
| Qwen3-VL-8B-Instruct (original) | ~8B | no disponible | Visión-lenguaje general con rechazo | no disponible | no disponible |

La comparación directa con alternativas especializadas en etiquetado booru no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Contenido explícito: el corpus de entrenamiento incluye anotaciones NSFW adultas de e621 y Danbooru, y el modelo puede generar descripciones detalladas de contenido sexual adulto; el repositorio está etiquetado como `not-for-all-audiences`.
- Sin ruta de rechazo: al heredar el comportamiento abliterated del base, no declina peticiones explícitas y puede producir contenido explícito no solicitado.
- Riesgo de alucinación: como cualquier modelo de visión-lenguaje, puede inventar etiquetas o atributos visuales ausentes en la imagen, especialmente con imágenes ambiguas o de baja resolución.
- Sesgo de dominio: el ajuste fino concentra la atención en personajes antropomórficos, dragoniles y reptilianos; el rendimiento en otros dominios visuales no está documentado y probablemente sea inferior al del base.
- Idiomas: solo inglés y chino; no hay soporte declarado de castellano.
- Dependencia del `mmproj`: si se carga únicamente el GGUF principal, el modelo funciona como texto puro y no procesa imágenes, con riesgo de generar captions alucinados sobre entradas en blanco.
- Contexto: la ventana útil depende de la configuración en tiempo de ejecución; 8192 tokens es el valor recomendado y superar ese valor puede degradar la calidad.
- Licencia: Apache 2.0 permite uso comercial, pero el uso debe cumplir la legislación aplicable; el autor restringe explícitamente la generación de contenido ilegal, con menores o que infrinja derechos de terceros.
- Madurez: el repositorio registra 0 descargas y 1 like en el momento de la consulta, sin benchmarks publicados ni validación externa conocida.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Ryuxi/Qwen3-VL-8B-Instruct-c_abliterated-v3-furry
- Modelo base: https://huggingface.co/prithivMLmods/Qwen3-VL-8B-Instruct-c_abliterated-v3
- Dataset de entrenamiento: https://huggingface.co/datasets/hearmeneigh/e621-rising-v3-small
