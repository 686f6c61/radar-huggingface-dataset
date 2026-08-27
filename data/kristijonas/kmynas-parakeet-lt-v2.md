# kristijonas/kmynas-parakeet-lt-v2

## Resumen

Kmynas Parakeet LT v2 es un modelo de reconocimiento automático del habla (ASR) para lituano desarrollado por Kristijonas Jakubsonas. Se basa en el modelo `nvidia/parakeet-tdt-0.6b-v3` y está entrenado sobre 1.196,4 horas de audio lituano con puntuación y capitalización, procedentes del dataset LIEPA-3. Su principal innovación es que emite directamente puntuación y mayúsculas en la transcripción, sin necesidad de un paso posterior de restauración, lo que simplifica el pipeline y reduce errores.

El modelo emplea un codificador FastConformer y un decodificador Token-and-Duration Transducer (TDT), con 0,6 mil millones de parámetros. Está disponible bajo licencia CC BY 4.0 y se distribuye en formato NeMo (.nemo). Su relevancia radica en ser uno de los pocos modelos ASR de alta calidad específicos para lituano, con un rendimiento notable en habla telefónica y una velocidad de inferencia muy superior a alternativas como Paprika.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer encoder + Token-and-Duration Transducer (TDT) decoder |
| Parametros totales | 0,6 mil millones |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (entrenado con audios de 0,5 a 15 segundos) |
| Tipos de cuantizacion | No disponible (se recomienda fp32 o bf16, no fp16) |
| Idiomas soportados | Lituano (lt) |
| Licencia | CC BY 4.0 |
| Formato de pesos | NeMo (.nemo) |

## Arquitectura y entrenamiento

El modelo combina un codificador FastConformer, eficiente para audio de larga duración, con un decodificador Token-and-Duration Transducer que predice simultáneamente tokens de texto y duraciones, permitiendo una decodificación en un solo paso. Se inicializó desde el modelo base `nvidia/parakeet-tdt-0.6b-v3` (revisión `541d1f9`) y se añadieron tres tokens de vocabulario para las comillas lituanas (`„`, `“`, `–`). El entrenamiento se realizó sobre 1.196,4 horas de LIEPA-3, con una mezcla de fuentes: teléfono (504 h), radio (462,9 h), lectura (93 h), dictáfono (90,7 h) y otros (45,7 h). Se usó un lote efectivo de 256, una tasa de aprendizaje de 5,5e-4 con decaimiento coseno hasta 1e-6 y 1.500 pasos de calentamiento, durante 15.000 pasos (aproximadamente 2,39 épocas).

La puntuación se restauró en los objetivos mediante un LLM con una puerta de preservación de palabras: cualquier fila cuya secuencia de palabras cambiara se rechazaba, no se reparaba. La capitalización se conservó tal cual, incluyendo 173.050 filas que comienzan en minúscula, reflejando fragmentos genuinos de mitad de frase. Todos los objetivos se re-codificaron con el tokenizador extendido y las filas que producían `<unk>` se aislaron, evitando el problema de vocabulario que afectaba a la versión v1.

## Capacidades

- Reconocimiento de voz en lituano con emisión directa de puntuación y capitalización, sin paso de restauración separado.
- Soporte de audio mono de 16 kHz, con entrada de fragmentos de 0,5 a 15 segundos.
- Inferencia rápida: RTF de aproximadamente 0,026 en GPU, y varias veces más rápido que tiempo real en CPU.
- Funciona en fp32 y bf16; no se recomienda fp16 por riesgo de errores de decodificación.
- No soporta tool calling, agentes ni razonamiento multi-paso, al ser un modelo puramente de ASR.
- Capacidad multilingüe limitada al lituano, aunque puede manejar vocabulario técnico inglés prestado con errores ocasionales.

## Casos de uso

- Transcripción de llamadas telefónicas: el modelo está entrenado con 504 horas de audio telefónico y muestra un WER del 6,83 % en ese dominio, lo que lo hace adecuado para centros de atención al cliente o grabaciones de soporte.
- Subtitulado automático de contenido audiovisual: su capacidad para emitir puntuación y mayúsculas directamente reduce el post-procesado necesario para generar subtítulos legibles.
- Transcripción de reuniones y entrevistas: con soporte para fragmentos de hasta 15 segundos, puede procesar intervenciones cortas de forma eficiente, aunque requiere segmentación en pausas para audio largo.
- Archivado y búsqueda de contenido hablado: al producir texto con puntuación, facilita la indexación y recuperación de archivos de audio en lituano.
- Asistentes de voz para aplicaciones lituanas: su baja latencia (RTF 0,026 en GPU) permite integración en sistemas de dictado o comandos por voz en tiempo real.
- Investigación lingüística: el modelo puede transcribir corpus orales con precisión, y su diseño de evaluación con hablantes no vistos en dialectos ofrece una señal fiable de generalización.

## Benchmarks y rendimiento

El autor publica resultados sobre un conjunto de validación LIEPA-3 reservado antes del entrenamiento. Se presentan dos métricas: WER con puntuación y mayúsculas eliminadas, y WER tal como se produce (con puntuación y mayúsculas). También se incluyen tasas de borrado y retención de palabras.

| Conjunto | WER | WER tal como se produce | Borrados | Retención de palabras |
|---|---:|---:|---:|---:|
| Habla telefónica | **6,83** | 14,36 | 0,53 % | 1,003 |
| Validación mixta | **15,13** | 26,20 | 2,01 % | 0,987 |
| Dialecto (12 hablantes no vistos) | 26,84 | 36,59 | 3,60 % | 0,977 |

El autor advierte explícitamente que estos números no son comparables con los de FLEURS o VoxPopuli publicados para otros modelos, ya que los conjuntos de prueba son diferentes. La calidad mejoró monótonamente en todos los checkpoints y conjuntos, siendo el paso final (15.000) el mejor en los tres.

## Requisitos de hardware

- El tamaño del repositorio es de 2,5 GB, lo que sugiere que el modelo en fp32 ocupa aproximadamente 2,4 GB en memoria.
- Se puede ejecutar en CPU: el autor indica que es varias veces más rápido que tiempo real, aunque no especifica el hardware exacto.
- En GPU, el RTF es de aproximadamente 0,026, lo que implica que una hora de audio se procesa en unos 94 segundos en una GPU moderna.
- No se proporcionan requisitos mínimos de VRAM, pero por el tamaño del modelo, una GPU con al menos 4 GB de VRAM debería ser suficiente para inferencia en fp32 o bf16.
- Se recomienda usar fp32 o bf16; fp16 puede provocar errores de decodificación.
- Opciones de despliegue: el modelo se carga con NeMo (`nemo.collections.asr`), por lo que es compatible con el ecosistema NeMo. No se mencionan integraciones con vLLM, llama.cpp u Ollama, al ser un modelo ASR, no generativo de texto.

## Comparativa con modelos similares

No se dispone de datos cuantitativos comparables con otros modelos de ASR lituano como Noctra o Paprika, ya que el autor indica que los conjuntos de evaluación son diferentes. La versión anterior, `kmynas-parakeet-lt-v1`, se entrenó con 169,6 horas y tiene un RTF de 0,022, pero no se publican sus WER en los mismos conjuntos. La v2 usa siete veces más datos y se inicializa desde el modelo base, no desde v1, por lo que ambos son independientemente comparables en diseño, pero no en resultados directos.

| Modelo | Parámetros | Datos de entrenamiento | RTF (GPU) | Licencia |
|---|---|---|---|---|
| Kmynas Parakeet LT v2 | 0,6B | 1.196,4 h | ~0,026 | CC BY 4.0 |
| Kmynas Parakeet LT v1 | 0,6B | 169,6 h | ~0,022 | CC BY 4.0 |
| Paprika (referencia) | No disponible | 3.281 h | ~0,48 | No disponible |

## Limitaciones y advertencias

- El vocabulario técnico inglés prestado es la clase de error dominante: por ejemplo, `spykerių` por *speakers*, `kuopi peis` por *copy-paste*, `KR kodas` por *QR kodas*. Puede haber inconsistencias ortográficas dentro de una misma grabación.
- No se ha entrenado con audio de campo lejano o reverberante; el comportamiento en salas con micrófono distante no está medido.
- El modelo está entrenado con fragmentos de 0,5 a 15 segundos; el audio más largo debe dividirse en fragmentos, preferiblemente cortando en pausas, no en una rejilla fija.
- El tokenizador no tiene un token inicial de palabra para `„`, por lo que a veces se pierde el espacio antes de una comilla de apertura (p. ej., `knyga„Užrašęs`). Se recomienda restaurar el espacio en post-procesado.
- No puede emitir los caracteres `”` (U+201D), `;`, `(`, `)` ni `—`; los guiones largos se normalizaron a `–` durante el entrenamiento.
- En fp16, la decodificación TDT puede producir tokens fuera del vocabulario (8.195 piezas), causando `IndexError`. Se recomienda usar fp32 o bf16, o filtrar ids >= vocab_size si fp16 es inevitable.
- La evaluación en habla telefónica no es completamente independiente del hablante, ya que LIEPA-3 no publica identificadores de sesión; el conjunto de validación se basa en shards completos como proxy.
- La licencia CC BY 4.0 permite uso comercial con atribución, pero se debe verificar la procedencia de los datos de entrenamiento (LIEPA-3, publicado vía CLARIN-LT) para cumplir con sus términos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kristijonas/kmynas-parakeet-lt-v2
- Versión v1: https://huggingface.co/kristijonas/kmynas-parakeet-lt-v1
- Dataset LIEPA-3 en CLARIN-LT: https://clarin-repo.lt/items/0a04648e-ba4e-4e6f-9161-a2d01e8e9fdb/full
- Modelo base NVIDIA Parakeet TDT 0.6B v3: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
