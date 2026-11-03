# RobertasTa/paprika-whisper-lt-v3-ct2-int8

## Resumen

Paprika whisper-lt-v3-ct2-int8 es una conversión a formato CTranslate2 con cuantización int8 del modelo de reconocimiento automático del habla `kristijonas/paprika-whisper-lt-v3`, un fine-tuning de `whisper-large-v3-turbo` especializado en lituano. El trabajo de entrenamiento corresponde a Kristijonas Jakubsonas; esta versión la publica Robertas Tarasevičius y no introduce reentrenamiento ni datos adicionales: únicamente cambia el formato de pesos y aplica cuantización.

El problema que resuelve es operativo: `faster-whisper`, la vía más rápida para ejecutar Whisper en CPU y la habitual en escritorio, solo carga modelos en CTranslate2, mientras que el original se distribuye en safetensors (formato transformers). Sin esta conversión, cualquiera que quisiera usar Paprika con `faster-whisper` debía instalar `transformers`, `ctranslate2` y varios gigabytes de dependencias para convertir el modelo por su cuenta.

El modelo está pensado para dictado y transcripción en lituano, con un tamaño de repositorio de 0,8 GB (814 MB frente a los 1,62 GB del original). Se publica bajo licencia CC BY 4.0 y está integrado en herramientas del autor como Diktuoklė (dictado offline para Windows) y SpeakDream (intérprete de voz offline).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder) sobre `whisper-large-v3-turbo`, convertido a CTranslate2 |
| Parámetros totales | no disponible (hereda los de `whisper-large-v3-turbo`) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper opera sobre ventanas de audio de 30 s) |
| Tipos de cuantización | int8 (única variante publicada); en runtime `int8` para CPU e `int8_float16` para CUDA |
| Idiomas soportados | lituano (lt) |
| Licencia | CC BY 4.0 |
| Formato de pesos | CTranslate2 (modelo convertido con `ct2-transformers-converter`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Whisper, un transformer encoder-decoder con atención completa diseñado para transcripción y traducción de voz, en su variante `large-v3-turbo`. El modelo original fue afinado por Kristijonas Jakubsonas sobre el corpus LIEPA-3, con aproximadamente 3 281 horas de audio en lituano. No se dispone de información sobre la composición exacta del dataset, el uso de RLHF/DPO ni otras técnicas de alineación en la información proporcionada.

Esta publicación concreta no entrena nada: aplica `ct2-transformers-converter` con `--quantization int8` sobre los pesos originales, reduciendo el tamaño de 1,62 GB a 814 MB. La cuantización es con pérdida y el autor declara explícitamente que no ha medido la diferencia entre los pesos fp16 originales y esta versión int8, por lo que se desconoce el coste real de la cuantización en calidad.

## Capacidades

- Reconocimiento automático del habla (ASR) en lituano, con salida de texto y marcas de tiempo por segmento.
- Transcripción de audio de larga duración mediante segmentación interna de `faster-whisper`.
- Ejecución en CPU y GPU gracias al backend CTranslate2, con tipos de cómputo `int8` (CPU) e `int8_float16` (CUDA).
- Integración con `faster-whisper` mediante `WhisperModel` y el método `transcribe`, incluyendo `beam_size` configurable.
- Uso en asistentes de voz domésticos vía integración Wyoming (Home Assistant).
- No se documentan capacidades de tool calling, agentes, visión, audio generation ni modo de razonamiento explícito.

## Casos de uso

- Dictado offline en escritorio: es el motor de Diktuoklė, una herramienta de dictado para Windows que transcribe voz a texto sin conexión; el formato CTranslate2 permite cargarlo directamente con `faster-whisper` sin pasos de conversión.
- Intérprete de voz offline: integrado en SpeakDream como capa de reconocimiento lituano dentro de un pipeline de traducción hablada.
- Transcripción de reuniones y entrevistas en lituano: la segmentación por ventanas de 30 s de Whisper permite procesar audios largos de forma incremental y devolver marcas de tiempo.
- Comandos de voz en Home Assistant: el modelo puede ejecutarse en un mini PC vía Wyoming; el autor advierte que para comandos cortos es más rápido LT_ausys (0,21 s frente a 3,55 s por comando), por lo que este modelo encaja mejor en dictado largo.
- Subtitulado de contenido audiovisual en lituano: la salida segmentada con timestamps facilita la generación de subtítulos SRT.
- Archivado y búsqueda de audio: transcripción por lotes de grabaciones para indexación textual, ejecutable en CPU sin GPU dedicada.
- Evaluación de ASR en dominios LIEPA: útil como línea base reproducible en formato CTranslate2 para comparativas de WER/CER.

## Benchmarks y rendimiento

| Benchmark | Métrica | Valor |
|---|---|---|
| FLEURS (Lithuanian, `lt_lt`, test) | WER | 11,97 % |
| FLEURS (Lithuanian, `lt_lt`, test) | CER | 6,49 % |
| Conjunto interno de audio LIEPA (Wyoming, int8) | WER | 7,63 % |
| `whisper-large-v3-turbo` general sobre el mismo conjunto LIEPA | WER | 25,95 % |
| Comando corto en mini PC (comparativa interna) | Latencia | 3,55 s (frente a 0,21 s de LT_ausys) |

Advertencia del autor: el conjunto interno de LIEPA es in-domain para este modelo y no debe interpretarse como una cifra general; no se ha medido la degradación de int8 frente a fp16.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 814 MB de pesos int8, la huella en memoria es del orden de 1 GB más overhead de runtime, aunque el dato no está publicado.
- GPU recomendadas: no especificadas por el autor. En CUDA debe usarse `compute_type="int8_float16"`; pasar `int8` con `device="cuda"` provoca una caída silenciosa a CPU en CTranslate2.
- GPU de consumo: por tamaño, el modelo cabe en cualquier GPU consumer con al menos ~2 GB de memoria libre, aunque el autor no publica pruebas específicas.
- Despliegue: `faster-whisper` (backend CTranslate2), integración Wyoming para Home Assistant y uso embebido en aplicaciones de escritorio.
- Latencia: 3,55 s por comando corto en un mini PC (medición del autor); no se publican cifras de throughput para audio largo.

## Comparativa con modelos similares

| Modelo | Base | Formato | Tamaño | WER (referencia) | Licencia |
|---|---|---|---|---|---|
| paprika-whisper-lt-v3-ct2-int8 | whisper-large-v3-turbo + LIEPA-3 | CTranslate2 int8 | 814 MB | 11,97 % FLEURS lt; 7,63 % LIEPA in-domain | CC BY 4.0 |
| kristijonas/paprika-whisper-lt-v3 | whisper-large-v3-turbo + LIEPA-3 | safetensors (transformers) | 1,62 GB | mismo modelo base, sin cuantizar | CC BY 4.0 |
| RobertasTa/lt-ausys | kmynas-parakeet-lt-v4 (Parakeet) | ONNX int8 | no disponible | 10,6 % FLEURS lt | no disponible |
| whisper-large-v3-turbo (general) | OpenAI | varios | no disponible | 25,95 % en conjunto LIEPA del autor | no disponible en esta ficha |

## Limitaciones y advertencias

- Solo cubre lituano; no está pensado para otros idiomas ni para traducción.
- La cuantización int8 es con pérdida y el autor no ha medido la diferencia frente a fp16: no se puede asumir equivalencia con el modelo original.
- Las cifras de WER son in-domain (LIEPA); el propio autor original advierte que no existe una cifra correcta para out-of-domain.
- Riesgo de alucinación inherente a Whisper en audio con ruido, silencios largos o habla solapada.
- En CUDA, usar `int8` con `device="cuda"` hace que CTranslate2 caiga a CPU sin aviso; hay que usar `int8_float16`.
- Para comandos de voz cortos en CPU, LT_ausys es sustancialmente más rápido (0,21 s frente a 3,55 s) y con menor WER en FLEURS.
- Licencia CC BY 4.0: permite uso comercial, modificación y redistribución siempre que se acredite a Kristijonas Jakubsonas y se indiquen los cambios realizados (conversión de formato y cuantización int8).
- No se documentan sesgos específicos más allá de los heredados del corpus LIEPA y de Whisper.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RobertasTa/paprika-whisper-lt-v3-ct2-int8
- Modelo original: https://huggingface.co/kristijonas/paprika-whisper-lt-v3
- Herramientas originales (paprika): https://github.com/kristijonasatpro/paprika
- Diktuoklė (dictado offline para Windows): https://github.com/RobertasTa/diktuokle
- SpeakDream (intérprete de voz offline): https://github.com/RobertasTa/speakdream
- LT_ausys (alternativa ONNX int8 para comandos): https://huggingface.co/RobertasTa/lt-ausys
- kmynas-parakeet-lt-v4 (modelo base de LT_ausys): https://huggingface.co/kristijonas/kmynas-parakeet-lt-v4
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
