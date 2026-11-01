# guigssss/steno-fr-v1-base

## Resumen

Sténo v1 base es un modelo de reconocimiento automático del habla (ASR) especializado en francés, desarrollado por el usuario guigssss. A diferencia de los sistemas ASR convencionales, que entrenan una arquitectura completa desde cero, este modelo reutiliza la torre de audio del modelo de embeddings de Google EmbeddingGemma 2 y le añade un lector CTC de 6 bloques de anchura 768 entrenado específicamente para transcribir francés. El resultado es un sistema no autorregresivo que genera texto en una sola pasada, con mayúsculas y puntuación incluidas, y que según el autor opera muchas veces más rápido que tiempo real.

El modelo cuenta con 109.475.647 parámetros en `model.safetensors` (aproximadamente 438 MB en fp32) y se entrenó sobre unas 3.200 horas de francés procedente de corpus abiertos como Multilingual LibriSpeech, Common Voice 19, VoxPopuli, FLEURS y los conjuntos YODAS. La innovación principal reside en el enfoque: en lugar de diseñar un encoder acústico ad hoc, se aprovechan las representaciones latentes de un modelo de embeddings multilingüe y se afinan únicamente las capas 11 y 12 de su torre de audio, manteniendo el resto congelado y cargándolo desde `google/embeddinggemma-2` en la revisión `914f7f8`.

Es relevante ahora porque demuestra una vía de bajo coste computacional (unas 38 horas de GPU en una NVIDIA L40S) para construir ASR de alta calidad en lenguas concretas, con licencia Apache 2.0 y un paquete de inferencia propio (`steno_asr`) que gestiona segmentación, marcas de tiempo a nivel de palabra y exportación a SRT. Existe además una variante `large` (163 M de parámetros, 10 bloques de lector) que mejora ligeramente las métricas a costa de velocidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CTC no autorregresivo sobre torre de audio de EmbeddingGemma 2 (capas 11-12 afinadas) + lector de 6 bloques de anchura 768 |
| Parametros totales | 109.475.647 (110 M; 438 MB en fp32) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa bloques de audio de hasta 30 s) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32; el LM KenLM 4-gram va cuantizado a 8 bits) |
| Idiomas soportados | francés (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp32) + JSON auxiliares (`config.json`, `units.json`) y LM KenLM binario |

## Arquitectura y entrenamiento

El modelo es un sistema híbrido: por un lado emplea la torre de audio de EmbeddingGemma 2 como extractor de características acústicas, y por otro añade un lector CTC compuesto por 6 bloques de anchura 768 que proyecta los estados ocultos de la torre a un vocabulario de 30.002 unidades (blank, unknown y 30.000 piezas del tokenizador Gemma, con mayúsculas y puntuación). Solo se afinan las capas 11 y 12 de la torre de audio; el resto permanece congelado y se carga desde el modelo base de Google en la revisión `914f7f8`. La cabeza de salida tiene 30.002 filas de dimensión 512, y se incluyen 13 pesos de mezcla que combinan las representaciones de las capas de la torre.

El entrenamiento se realizó sobre aproximadamente 3.200 horas de francés abierto, con datos de Multilingual LibriSpeech, Common Voice 19, VoxPopuli, FLEURS y los corpus YODAS (incluido `espnet/yodas-granary`). El autor indica que el modelo base se entrenó "en una sola línea", con la misma arquitectura desde el primer paso hasta el último y con datos crecientes a medida que se etiquetaban. El coste fue de unas 38 horas de GPU en una NVIDIA L40S. No se menciona en la información disponible el uso de RLHF, DPO ni otras técnicas de alineación, algo coherente con un sistema CTC supervisado. Como innovación destacable, el enfoque no autorregresivo permite una decodificación en una sola pasada, y se ofrece un modelo de lenguaje KenLM 4-gram (trie cuantizado a 8 bits, 0,85 GB) con parámetros α 0,4, β 2,0 y beam 128 para rescoring.

## Capacidades

- Transcripción de voz a texto en francés con mayúsculas y puntuación generadas directamente por el modelo.
- Decodificación CTC no autorregresiva en una sola pasada, lo que reduce la latencia frente a sistemas encoder-decoder autorregresivos.
- Marcas de tiempo a nivel de palabra (`return_words=True`), con campos `word`, `start`, `end` y `conf`.
- Exportación a subtítulos SRT mediante la función `to_srt` del paquete `steno_asr`.
- Segmentación automática de audio en bloques de hasta 30 s cortados en el punto de menor energía, procesados en lotes con conservación de la línea temporal original.
- Integración opcional de un modelo de lenguaje KenLM 4-gram para reducir el WER (mejora de 2 a 3 puntos porcentuales en los conjuntos evaluados).
- Manejo de audio en formatos habituales (mp3, mp4, etc.) a través de ffmpeg.
- No soporta tool calling, function calling, razonamiento multi-paso, visión, audio generativo ni capacidades de agente: es un modelo puramente ASR.

## Casos de uso

- Subtitulado automático de vídeo y audio: el paquete `steno_asr` permite transcribir un archivo mp4 y generar un SRT con marcas de tiempo por palabra, adecuado para plataformas de contenido, cursos en línea y archivos audiovisuales en francés.
- Transcripción de reuniones y entrevistas: la segmentación en bloques de 30 s y el procesamiento por lotes permiten gestionar grabaciones largas manteniendo la línea temporal, con la opción de activar el LM 4-gram para mejorar la precisión en habla espontánea.
- Indexación y búsqueda de archivos sonoros: al obtener texto con puntuación y marcas temporales, se puede construir un índice buscable sobre podcasts, emisiones de radio o archivos de parlamento (el modelo se evalúa en VoxPopuli, con WER del 11,3 % con LM).
- Accesibilidad: generación de subtítulos para personas con discapacidad auditiva en contenido en francés, con la ventaja de que el modelo cabe en una sola GPU de consumo y puede ejecutarse en local.
- Investigación lingüística y dialectología: el modelo incluye evaluación sobre acentos africanos del francés (WER del 15,2 % con LM), lo que lo hace útil para estudios de variación fonética, aunque con precisión inferior a la del francés estándar.
- Prototipado rápido de aplicaciones de voz: al ser Apache 2.0 y con un paquete pip instalable, se puede integrar en demos y MVPs de asistentes de voz o transcripción sin depender de APIs externas.
- Procesamiento por lotes en servidores modestos: con 110 M de parámetros y 438 MB en fp32, es viable desplegar múltiples instancias en una sola GPU o incluso en CPU para volúmenes moderados, aunque no se han publicado cifras de throughput.

## Benchmarks y rendimiento

Resultados declarados por el autor (WER en %, greedy / con LM 4-gram), sobre los primeros 2.000 clips de cada conjunto de test (FLEURS: los 675), tras normalización común (minúsculas, sin puntuación, números como palabras):

| Conjunto de test | Descripción | Greedy | Con LM 4-gram |
|---|---|---|---|
| FLEURS fr test | frases leídas | 13,2 | 10,0 |
| Multilingual LibriSpeech fr test | audiolibros | 10,5 | 9,0 |
| Common Voice 19 fr test | voluntarios, múltiples micrófonos | 14,4 | 11,8 |
| VoxPopuli fr test | Parlamento Europeo | 12,7 | 11,3 |
| African Accented French test | acentos de África Occidental y Central | 16,2 | 15,2 |
| FLEURS fr dev (validación) | frases leídas | 11,8 | 9,5 |

Los resultados del model-index oficial solo incluyen FLEURS, MLS y Common Voice 19, coincidiendo con los valores de la tabla anterior. No se han publicado resultados de benchmarks adicionales (por ejemplo, comparativas con Whisper) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en fp32 ocupa unos 438 MB; con el LM 4-gram (0,85 GB) el total se sitúa en torno a 1,3-1,5 GB, aunque no se han publicado cifras oficiales de VRAM en ejecución.
- GPU recomendadas: el autor entrenó en una NVIDIA L40S; para inferencia, cualquier GPU con al menos 2-4 GB de VRAM debería ser suficiente, incluidas RTX 3060, RTX 4060, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: sí, con margen amplio, dado el tamaño reducido del modelo.
- Opciones de despliegue: el paquete oficial `steno_asr` (pip, requiere ffmpeg en el PATH y autenticación con Hugging Face para aceptar los términos de EmbeddingGemma 2). No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: el autor afirma que el modelo transcribe "muchas veces más rápido que tiempo real", pero no se proporcionan cifras concretas de latencia ni de throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / audio | Idiomas | Licencia | WER FLEURS fr (con LM) |
|---|---|---|---|---|---|
| Sténo v1 base | 110 M | bloques de 30 s | fr | Apache 2.0 | 10,0 |
| Sténo v1 large | 163 M | bloques de 30 s | fr | Apache 2.0 | 9,7 |
| Whisper large-v3 | no disponible en la información | no disponible | multilingüe | MIT | no disponible |
| Whisper small | no disponible en la información | no disponible | multilingüe | MIT | no disponible |

La información proporcionada solo permite comparar Sténo v1 base con su variante large del mismo autor. No se han publicado en la información disponible resultados de Whisper u otros sistemas ASR sobre los mismos conjuntos, por lo que no es posible establecer una comparativa cuantitativa fiable con alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo solo soporta francés; no transcribe otros idiomas.
- El rendimiento cae en acentos no estándar: el WER con LM sube al 15,2 % en el conjunto de acentos africanos, frente al 9-10 % en audiolibros y frases leídas.
- Riesgo de alucinación y errores en palabras poco frecuentes, nombres propios y términos técnicos, inherente a los sistemas CTC con vocabulario de subpalabras.
- El modelo base no incluye el LM 4-gram por defecto; para obtener los mejores WER es necesario instalar la dependencia opcional `steno-asr[lm]` y cargar el KenLM, lo que añade 0,85 GB.
- Requiere aceptar los términos de uso de EmbeddingGemma 2 y autenticarse con `hf auth login` antes de usar el modelo, lo que introduce una dependencia de la plataforma Hugging Face.
- El autor advierte que la variante `large` es "un experimento" y que parte de su mejora podría deberse al entrenamiento más prolongado y no a la arquitectura ampliada; no se ha realizado un ablation study que lo aísle.
- No se han publicado análisis de sesgos, evaluaciones de robustez ante ruido o solapamiento de hablantes, ni cifras de latencia o throughput en producción.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base subyacente (EmbeddingGemma 2) tiene sus propios términos que deben respetarse.
- El repositorio tiene muy pocas descargas (9) y ningún "like", lo que sugiere que no ha sido ampliamente validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/guigssss/steno-fr-v1-base
- Variante large: https://huggingface.co/guigssss/steno-fr-v1-large
- Modelo base EmbeddingGemma 2: https://huggingface.co/google/embeddinggemma-2
- Paquete de inferencia `steno_asr`: https://github.com/GuigsEvt/steno-asr
