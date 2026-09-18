# palli23/wav2vec2-base-samromur-10h

## Resumen

`palli23/wav2vec2-base-samromur-10h` es un modelo de reconocimiento automático del habla (ASR) en islandés, resultado de afinar `wav2vec2-base` (94,4 millones de parámetros) sobre un subconjunto anidado de 10 horas del corpus [`samromur-500h`](https://huggingface.co/palli23/wav2vec2-base-samromur-10h), descrito en la model card como el conjunto principal de escalado «Miljón/samromur-500h». Lo publica el usuario palli23 y forma parte de un conjunto de checkpoints de escalado asociados al trabajo «Scaling Smaller ASR Models Against Multilingual ASR Giants» (ICASSP 2027).

La relevancia del modelo es fundamentalmente metodológica: sirve como punto de medida en un estudio sobre si modelos acústicos pequeños y específicos de un idioma pueden competir con modelos multilingües mucho mayores en lenguas con pocos recursos, como el islandés. Con 94,4 M de parámetros, frente a los 244 M de Whisper-small o los 315 M de `wav2vec2-large-xlsr-53`, su interés no está en la calidad absoluta de transcripción, sino en la relación entre horas de audio de entrenamiento y WER/CER dentro de una curva de escalado controlada.

El checkpoint se distribuye en formato safetensors, solo soporta islandés (`is`) y se publica bajo licencia CC BY-SA 4.0, lo que permite uso comercial con atribución pero obliga a compartir las obras derivadas bajo la misma licencia. El repositorio ocupa 88,0 GB en total, muy por encima de lo que ocuparía un único checkpoint de 94,4 M de parámetros, por lo que la descarga completa no es necesaria si solo se quieren los pesos de una revisión concreta. Su adopción es todavía muy baja (19 descargas y 0 «likes» en el momento de redactar esta ficha).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0, variante *base*: extractor convolucional de características + encoder Transformer (12 capas, 768 de dimensión oculta, 12 cabezas de atención) con cabeza CTC para ASR |
| Parámetros totales | 94.402.472 (94,4 M), medidos sobre los pesos safetensors |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no declarada en la model card. No hay atención de contexto fijo: la entrada es la señal de audio completa, pero en la práctica se trabaja con segmentos de decenas de segundos (habitualmente 10-30 s de audio a 16 kHz), que es el régimen con el que se afinan los modelos wav2vec 2.0 |
| Tipos de cuantización | no disponible. Solo se documentan pesos safetensors en precisión completa; no se publican versiones GGUF, int8 ni ONNX en el repositorio |
| Idiomas soportados | islandés (`is`) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors |
| Frecuencia de muestreo de entrada | no declarada explícitamente en la model card; el valor estándar del extractor de wav2vec 2.0 es 16 kHz |
| Tamaño del repositorio | 88,0 GB |

## Arquitectura y entrenamiento

La base es wav2vec 2.0 en configuración *base*: un extractor convolucional que convierte la forma de onda en representaciones latentes cada 20 ms, seguido de un encoder Transformer de 12 capas con 768 dimensiones ocultas y atención multi-cabeza. El preentrenamiento original de wav2vec 2.0 es auto-supervisado (enmascarado de latentes con objetivos contrastivos), y el ajuste posterior para ASR se hace de forma supervisada con una cabeza de clasificación por token y una función de pérdida CTC, que produce transcripciones sin necesidad de alineaciones forzadas. La model card no detalla si el ajuste se hizo con CTC, con CTC + decodificador de lenguaje externo o con otro esquema; CTC es el procedimiento estándar para esta familia.

Los datos de ajuste son un subconjunto anidado de 10 horas del *pool* de escalado `samromur-500h`, un corpus de voz en islandés. No se documentan en la información disponible el número de tokens de audio procesados, la composición exacta del subconjunto (horas por hablante, proporción de habla espontánea frente a lectura, cobertura de acentos o edades), la receta de optimización (tasa de aprendizaje, épocas, warmup, augmentation) ni si hubo alguna fase de RLHF/DPO —algo poco habitual en ASR, pero no descartable en un pipeline de ajuste fino—. La innovación declarada no es arquitectónica, sino experimental: el modelo es un punto de la curva de escalado de un estudio que compara modelos pequeños específicos de idioma con modelos multilingües grandes.

## Capacidades

- Reconocimiento automático del habla en islandés: transcripción de audio a texto con una cabeza CTC.
- Modelo exclusivamente acústico: no genera texto libre, no responde a instrucciones y no tiene modo de razonamiento.
- Entrada de audio de un solo canal, procesada como forma de onda cruda (sin extracción previa de características MFCC ni similares).
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes, razonamiento multi-paso ni planificación.
- No es multilingüe: solo islandés.
- No hay capacidades de visión, audio-vision, traducción ni salida de marcas de tiempo.
- No se documenta soporte de puntuación, mayúsculas, normalización de números ni *inverse text normalization*; el resultado de un modelo CTC suele ser texto en minúsculas sin puntuar salvo post-proceso externo.
- No se documenta diarización de hablantes ni detección de actividad de voz.

## Casos de uso

- Transcripción de archivos de audio y vídeo en islandés: se puede pasar cualquier grabación en islandés por el pipeline de ASR para obtener una transcripción en texto, útil para archivos de entrevistas, programas de radio o material educativo.
- Generación de subtítulos para vídeo en islandés: el modelo produce el texto por segmentos y un post-proceso sencillo añade los tiempos de subtítulo, con un coste de cómputo muy bajo gracias a los 94,4 M de parámetros.
- Investigación en tecnología del habla para lenguas de bajos recursos: sirve como punto de referencia reproducible de 10 horas de entrenamiento dentro de una curva de escalado, para medir cuánto mejora el WER al añadir horas o parámetros.
- Punto de partida para *fine-tuning* adicional: al ser un checkpoint pequeño, ajustarlo con más horas de `samromur` u otros corpus islandeses es viable en una única GPU de consumo, tanto en fp32 como en fp16.
- Indexado y búsqueda de contenido en archivos sonoros: transcribir un archivo de audio en islandés permite indexarlo y hacer búsqueda por texto sobre el contenido hablado.
- Preprocesado de corpus de voz para otras tareas: las transcripciones generadas pueden alimentar modelos de lenguaje, sistemas de diálogo o análisis lingüístico sobre islandés.
- Dictado y dictado asistido en aplicaciones de escritorio: con una huella de memoria inferior a 1 GB, el modelo cabe en un portátil y puede usarse para dictado local sin enviar audio a la nube.
- Evaluación comparativa de decodificadores: al ser un modelo CTC puro, es adecuado para medir el efecto de distintos decodificadores (greedy, beam search, con modelo de lenguaje n-grama o neuronal) sobre el mismo conjunto acústico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite explícitamente al artículo «Scaling Smaller ASR Models Against Multilingual ASR Giants» (ICASSP 2027) para la metodología y los resultados de WER/CER, pero no incluye cifras, tablas ni comparativas en la propia ficha de HuggingFace. Tampoco se han encontrado resultados en los resultados de búsqueda web disponibles, que no contenían material relacionado con el modelo.

## Requisitos de hardware

- Huella de pesos: 94.402.472 parámetros, aproximadamente 378 MB en fp32 y 189 MB en fp16.
- VRAM para inferencia: por debajo de 1 GB incluso con *batches* pequeños y estados intermedios; cualquier GPU con 2 GB o más es suficiente.
- GPU recomendadas: no hay requisito real de gama alta. Una NVIDIA T4, una RTX 3060, una RTX 4090 o una A100 funcionan sin problema, pero están sobredimensionadas para este tamaño; el cuello de botella real es el preprocesado de audio, no la GPU.
- GPU de consumo: cabe holgadamente en cualquier GPU de consumo moderna e incluso en iGPU con memoria compartida suficiente.
- CPU: la inferencia en CPU es viable para transcripción por lotes; para audio en tiempo real depende del número de núcleos y del *batch*, y no se han publicado cifras.
- Opciones de despliegue: `transformers` (`AutoModelForCTC` y el pipeline de ASR), SpeechBrain, ONNX Runtime y torchaudio son las vías habituales para wav2vec 2.0. vLLM y TGI no ofrecen soporte estándar para este tipo de modelo CTC de audio.
- Latencia y throughput: no disponible. No se publican mediciones de *real-time factor*, latencia por minuto de audio ni velocidad de transcripción por lote.
- Almacenamiento: el repositorio completo ocupa 88,0 GB; conviene descargar únicamente los ficheros de la revisión necesaria si no se quieren todos los checkpoints.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Arquitectura / tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| palli23/wav2vec2-base-samromur-10h | 94,4 M | Islandés | wav2vec 2.0 base + CTC, solo ASR | CC BY-SA 4.0 | HuggingFace, safetensors, 19 descargas |
| facebook/wav2vec2-base-960h | 94,4 M | Inglés | wav2vec 2.0 base + CTC, solo ASR | Apache-2.0 | HuggingFace, ampliamente usado |
| facebook/wav2vec2-large-xlsr-53 | 315 M | 53 idiomas | wav2vec 2.0 large + CTC, multilingüe | Apache-2.0 | HuggingFace, muy difundido |
| openai/whisper-small | 244 M | 99 idiomas | Encoder-decoder Transformer, transcripción y traducción | Apache-2.0 | HuggingFace, ecosistema muy maduro |

Comentario: el modelo de palli23 es el único de la comparativa especializado en islandés y el único con licencia CC BY-SA 4.0, lo que impone condiciones de compartición sobre las obras derivadas que Apache-2.0 no exige. Frente a `wav2vec2-base-960h` iguala en tamaño pero cambia de idioma; frente a `wav2vec2-large-xlsr-53` y a `whisper-small` reduce parámetros entre 2,6 y 3,3 veces, a costa de perder cobertura multilingüe y, en el caso de Whisper, capacidades multitarea como marcas de tiempo y traducción. Las cifras de calidad de este modelo frente a esas alternativas no están disponibles en la información consultada.

## Limitaciones y advertencias

- Idiomas: solo islandés. Cualquier audio en otra lengua producirá salidas sin sentido o con una tasa de error muy alta.
- Sesgos: no se documenta la composición demográfica del subconjunto de 10 horas (edad, sexo, región, tipo de habla). Un modelo afinado con tan pocas horas tiende a heredar los sesgos y el dominio del corpus de origen, y a degradarse con acentos, ruido o habla espontánea poco representados.
- Alucinación: en ASR el riesgo equivalente son las sustituciones y omisiones. Con solo 10 horas de ajuste, la tasa de error esperada es notablemente superior a la de un modelo afinado con cientos de horas, y no hay cifras publicadas para acotarla.
- Contexto y duración: al no declararse la longitud de audio soportada, conviene segmentar las entradas en fragmentos de decenas de segundos y comprobar el comportamiento con audios largos antes de usarlo en producción.
- Licencia: CC BY-SA 4.0 permite uso comercial, pero obliga a atribuir y a distribuir las obras derivadas bajo la misma licencia. Esto puede ser incompatible con productos propietarios que no quieran liberar el modelo afinado.
- Datos de entrenamiento: el corpus `samromur` tiene sus propias condiciones de uso, que conviene revisar antes de un despliegue comercial.
- Estado de validación: la referencia científica asociada es un artículo de ICASSP 2027, no disponible en la información consultada. Sin WER/CER publicados ni *model card* detallada, el modelo no debería considerarse validado para producción.
- Madurez del repositorio: 19 descargas y 0 «likes», sin pipeline declarado, sin datos de evaluación y con un repositorio de 88,0 GB. Es un artefacto de investigación, no un modelo con soporte.
- Sin garantías de post-proceso: no se documenta puntuación, mayúsculas ni normalización numérica, por lo que la salida requerirá post-procesado propio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/palli23/wav2vec2-base-samromur-10h
- Artículo de referencia citado en la model card: «Scaling Smaller ASR Models Against Multilingual ASR Giants» (ICASSP 2027). No se ha encontrado URL en la información disponible.
- Corpus de ajuste citado: `samromur-500h` (referido en la model card como «Miljón/samromur-500h»). No se ha encontrado URL en la información disponible.
- Modelo base: `facebook/wav2vec2-base`, referenciado de forma implícita por el nombre del checkpoint. No se incluye enlace directo en la información proporcionada.
- Resultados de búsqueda web: no contenían ningún enlace relevante sobre el modelo, el artículo ni el corpus; el material recuperado era documentación de ayuda de plataformas de vídeo, sin relación con el tema.
