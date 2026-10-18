# inklight-app/paced-voices

## Resumen

`inklight-app/paced-voices` no es un modelo de pesos, sino una colección de 40 «estados de voz» (40 ficheros, 369 MB, 7-12 MB cada uno) para el modelo de síntesis de voz Pocket TTS de Kyutai, en su versión `english_2026-04`. Cada fichero es la caché clave-valor del modelo de lenguaje de Pocket TTS después de escuchar un clip de referencia de un hablante, en el mismo formato que los embeddings de voz propios de Kyutai. El repositorio lo publica inklight-app, el equipo de Inklight, una aplicación de iPhone que lee libros en voz alta en el propio dispositivo.

El problema que resuelve es concreto: conseguir una narración más lenta sin recurrir a un estiramiento temporal de la señal de salida, que introduce artefactos audibles. En lugar de ralentizar el audio generado, se ralentiza el clip de referencia antes de que el modelo lo escuche, y el modelo imita el tempo del clip; de ahí que la voz resultante lea más despacio «por sí sola», con las pausas que añade un lector lento. Se ofrecen cuatro ritmos por voz (0,9, 0,85, 0,8 y 0,75 respecto al ritmo propio de la voz) para diez voces en inglés.

Es relevante para quien despliegue TTS en dispositivo y necesite control de velocidad sin coste computacional adicional en inferencia: aplicar un estado de voz es solo cargar una caché de unos pocos megabytes, sin reentrenamiento ni post-procesado de audio. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la licencia es CC BY 4.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo con pesos propios: son estados de voz compatibles con `kyutai/pocket-tts`; el modelo base es un modelo de lenguaje que cachea clave-valor al escuchar un clip de referencia) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los ficheros se distribuyen sin cuantizar, en safetensors, según la información disponible) |
| Idiomas soportados | inglés (`en`) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (caché clave-valor por capa más su offset) |
| Modelo base | `kyutai/pocket-tts`, versión `english_2026-04` |
| Tamano del repositorio | 0,4 GB (369 MB en 40 ficheros de 7 a 12 MB) |
| Voces incluidas | 10: `alba`, `anna`, `azelma`, `charles`, `eponine`, `fantine`, `george`, `michael`, `paul`, `vera` |
| Ritmos disponibles | 4 por voz: 0,9, 0,85, 0,8 y 0,75 del ritmo propio de cada voz |
| Metadatos | `stops.json` con el factor de estiramiento del clip, el ritmo medido, su dispersión y el WER de la transcripción de comprobación cuando se hizo |

## Arquitectura y entrenamiento

No hay entrenamiento. El procedimiento descrito es una adaptación en tiempo de inferencia: se toma el clip de referencia original de cada voz (el mismo que Kyutai usó para crearla, listado en `_ORIGINS_OF_PREDEFINED_VOICES` del repositorio `kyutai-labs/pocket-tts`), se estira temporalmente con ffmpeg sin cambiar el tono hasta un factor entre 0,6 y 0,86 de su velocidad original, y se codifica con la versión de clonación de voz de Pocket TTS. El resultado es la caché clave-valor por capa que el modelo genera al «escuchar» ese clip, más su offset.

Como el grado en que cada voz sigue al estiramiento depende del hablante, el proceso es empírico: para cada voz se barrió el factor de estiramiento, se midió cada estado candidato y se conservó el más cercano a cada uno de los cuatro ritmos objetivo. La medición se hizo sobre tres frases y tres o seis semillas, tomando la tasa de articulación del habla renderizada y excluyendo las pausas; todos los ficheros quedaron a menos de 0,020 de su ritmo nominal y la mayoría dentro de 0,015. El formato de salida es idéntico al de los embeddings de voz de Kyutai y se lee igual.

Las voces `anna`, `azelma`, `charles`, `eponine`, `fantine`, `george`, `michael`, `paul` y `vera` derivan del corpus CSTR VCTK 0.92 (hablantes p228, p303, p254, p262, p244, p315, p360, p259 y p229), a través de las grabaciones limpias de `kyutai/tts-voices`; `alba` deriva de la grabación «Casual» de Alba MacKenna. Todas las grabaciones originales están bajo CC BY 4.0.

## Capacidades

- Síntesis de voz en inglés con diez voces predefinidas, heredadas de los identificadores de voz de Pocket TTS.
- Control de velocidad de locución en cuatro pasos discretos por voz (0,9, 0,85, 0,8 y 0,75), aplicado en el estado de voz y no sobre el audio de salida.
- Pausas prosódicas propias de una lectura lenta: al imitar el tempo del clip estirado, el modelo introduce las pausas de un lector pausado sin post-procesado.
- Compatibilidad directa con la API de Pocket TTS: los ficheros se leen igual que los embeddings de voz del modelo base.
- Ejecución en dispositivo: el estado pesa entre 7 y 12 MB, lo que permite empaquetar varias voces y ritmos en una aplicación móvil.
- Reproducibilidad de la medición: `stops.json` documenta el estiramiento aplicado, el ritmo medido, su dispersión y el WER de comprobación cuando existe.
- No incluye generación de texto, razonamiento, código, matemáticas, visión, tool calling ni soporte de agentes; es exclusivamente un artefacto de TTS.
- No hay soporte multilingüe: solo inglés.

## Casos de uso

- Lectura de libros en una app iOS: es el caso para el que se creó. La aplicación carga el estado de voz correspondiente al ritmo elegido por el usuario y narra el texto en el dispositivo, sin enviar contenido a un servidor y sin estiramiento temporal del audio final.
- Audiolibros y contenido largo: los ritmos 0,85 y 0,8 permiten generar narración continua a una velocidad cómoda para sesiones prolongadas, manteniendo la prosodia original de cada voz en lugar de un remuestreo uniforme.
- Aprendizaje de idiomas y material para estudiantes: el ritmo 0,75 reduce la tasa de articulación, lo que ayuda a la comprensión oral de aprendices de inglés sin degradar el timbre del hablante.
- Accesibilidad cognitiva: usuarios que procesan el habla con dificultad disponen de cuatro velocidades seleccionables por voz, sin la pérdida de calidad que produce ralentizar la señal sintetizada.
- Contenido infantil y divulgación: la lectura pausada con pausas naturales encaja en narración de cuentos y material didáctico, donde un ritmo rápido perjudica la comprensión.
- Pruebas A/B de experiencia de lectura: al ser estados de 7 a 12 MB y no modelos completos, se pueden distribuir varios ritmos de la misma voz en la app y medir retención o preferencia sin coste adicional de inferencia.
- Pre-generación por lotes de audiolibros: integrar los estados en un pipeline con la librería `pocket-tts` para renderizar capítulos completos con una velocidad consistente y verificable mediante los valores de `stops.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (MMLU, WER agregado, MOS u otros). La model card solo documenta la medición interna del ritmo de cada estado:

| Metrica | Valor |
|---|---|
| Ritmo nominal por fichero | 0,9, 0,85, 0,8 o 0,75 respecto al ritmo propio de la voz |
| Desviación máxima respecto al ritmo nominal | 0,020 |
| Desviación típica de la mayoría de ficheros | por debajo de 0,015 |
| Metodo de medida | tasa de articulación del habla renderizada, excluyendo pausas, sobre tres frases y tres o seis semillas |
| WER de comprobación | registrado en `stops.json` cuando se realizó; los valores no se publican en la model card |
| Benchmark frente a otros modelos TTS | no disponible |

## Requisitos de hardware

- El artefacto en sí ocupa 7-12 MB por estado de voz; el repositorio completo son 369 MB (0,4 GB).
- La VRAM necesaria la determina el modelo base `kyutai/pocket-tts`, cuyos requisitos no se detallan en la información disponible: no disponible.
- No se especifican GPU recomendadas ni si el modelo base cabe en GPU de consumo; el caso de uso documentado es ejecución en un iPhone (aplicación Inklight), lo que implica despliegue en dispositivo.
- Opciones de despliegue: librería `pocket-tts` (campo `library` del repositorio) y el repositorio `kyutai-labs/pocket-tts`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato de estados de voz.
- Latencia y throughput: no disponibles.
- Almacenamiento: cargar los 40 estados requiere 369 MB; cargar una voz con sus cuatro ritmos, entre 28 y 48 MB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Control de ritmo | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `inklight-app/paced-voices` | no disponible (estados de voz, no pesos) | no disponible | 4 ritmos por voz (0,9 / 0,85 / 0,8 / 0,75) | safetensors (KV por capa + offset) | CC BY 4.0 | HuggingFace, 0 descargas |
| `kyutai/pocket-tts` (embeddings de voz originales) | no disponible | no disponible | no documentado en la información disponible | mismo formato de caché clave-valor | CC BY 4.0 | HuggingFace, modelo base |
| Otras alternativas TTS (XTTS, Kokoro, Piper, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponibles en la información proporcionada |

La comparación relevante es con el modelo base: este repositorio no cambia el modelo, solo sustituye los estados de voz por versiones estiradas y medidas. Cualquier comparación con otros sistemas TTS requeriría datos que no se han proporcionado.

## Limitaciones y advertencias

- Solo inglés: no hay voces ni estados para otros idiomas.
- Catálogo cerrado de diez voces y cuatro ritmos; no se pueden interpolar ritmos intermedios sin generar y medir un estado nuevo.
- El ritmo logrado es aproximado: la propia model card admite desviaciones de hasta 0,020 y una horquilla de estiramiento distinta por hablante, porque cada voz sigue el estiramiento en grado distinto.
- Compatibilidad atada a la versión `english_2026-04` del modelo base; no se garantiza que los estados funcionen con otras versiones de Pocket TTS.
- Riesgo de artefactos y errores de pronunciación: los clips de referencia se estiraron entre 0,6 y 0,86 de su velocidad, y el WER de comprobación solo se calculó para algunos ficheros y no se publica en la model card.
- La licencia CC BY 4.0 exige atribución; en producción hay que acreditar a CSTR VCTK (Yamagishi, Veaux y MacDonald), a Alba MacKenna y a Kyutai, además de indicar los cambios realizados (ralentización del clip y reducción a estado de voz).
- Los hablantes, CSTR y Kyutai no avalan estos ficheros ni la aplicación; se distribuyen sin garantía.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta, repositorio creado y actualizado el 18 de octubre de 2026.
- No hay datos publicados de latencia, throughput ni huella de memoria del modelo base, lo que impide dimensionar un despliegue sin probarlo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/inklight-app/paced-voices
- Modelo base Pocket TTS: https://huggingface.co/kyutai/pocket-tts
- Codigo de Pocket TTS: https://github.com/kyutai-labs/pocket-tts
- Grabaciones de voz de referencia: https://huggingface.co/kyutai/tts-voices
- Grabacion «Casual» de Alba MacKenna: https://huggingface.co/kyutai/tts-voices/tree/main/alba-mackenna
- CSTR VCTK Corpus 0.92: https://doi.org/10.7488/ds/2645
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante al modelo; las entradas devueltas no guardan relacion con TTS ni con Pocket TTS.
