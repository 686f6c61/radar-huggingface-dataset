# Aazu34/kashmiri-asr-ctc

## Resumen

Kashmiri ASR — CTC es un modelo de reconocimiento automático del habla (ASR) para el idioma cachemir (kashmiri), escrito en alfabeto perso-árabe. Lo desarrolla Aazim Ameen (usuario Aazu34 en Hugging Face) y se distribuye como un único modelo ONNX cuantizado a int8 de aproximadamente 187 MB, pensado para inferencia totalmente offline sobre CPU, sin servidor ni clave de API. Es el motor de voz que hay detrás de la herramienta de subtitulado SubtitleKoshur.

El modelo resuelve un problema concreto: la práctica ausencia de sistemas de reconocimiento del habla de calidad para el cachemir, una lengua de bajos recursos con ortografía perso-árabe y escasa representación en los corpus ASR multilingües habituales. Al empaquetar el modelo en ONNX int8 con el frontend (ventana STFT y banco de filtros mel) y el tokenizador CTC incluidos en el repositorio, permite transcribir audio sin dependencias pesadas más allá de numpy y onnxruntime.

La relevancia actual del modelo es acotada pero clara: ofrece una vía práctica para subtitular contenido en cachemir en local, con un CER medido de 0,348 sobre un conjunto de prueba de lectura de 65 segundos. No es un modelo de propósito general ni compite con los grandes sistemas ASR multilingües; está especializado en un único idioma y optimizado para despliegue ligero.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ASR con cabeza CTC, exportado a ONNX; el autor no especifica la topología del encoder) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (audio procesado en fragmentos de 10 s) |
| Tipos de cuantización | int8 (único formato publicado) |
| Idiomas soportados | cachemir (ks), alfabeto perso-árabe |
| Licencia | other (no especificada en detalle; requiere revisión antes de uso comercial) |
| Formato de pesos | ONNX (int8, pesos embebidos en el fichero `kashmiri_asr_ctc.int8.onnx`) |

## Arquitectura y entrenamiento

No se dispone de información publicada sobre la arquitectura interna del encoder. El modelo expone una cabeza CTC con decodificación greedy y blank id 256, sobre un vocabulario de 257 símbolos (incluido el blank). El frontend acústico está completamente especificado: audio a 16 kHz mono, características log-mel de 80 dimensiones con normalización por característica, ventana STFT de Hann y banco de filtros mel incluidos como ficheros binarios (`hann_window.f32`, `mel_filterbank.f32`). Todos los parámetros del frontend están reflejados en `asr_config.json` y replicados en `inference.py`, de modo que no hay preprocesado oculto.

No hay datos publicados sobre el corpus de entrenamiento, el número de tokens procesados, la composición del dataset ni si se aplicaron técnicas de ajuste como RLHF o DPO. La referencia de evaluación menciona OpenSLR-122 (corpus de cachemir), lo que sugiere que ese conjunto pudo formar parte de los datos, pero el autor no lo confirma. La innovación técnica destacable es la ingeniería de despliegue: un único ONNX int8 con frontend y tokenizador autocontenidos, decodificación CTC greedy y segmentación en bloques de 10 segundos para audio largo.

## Capacidades

- Transcripción de voz a texto en cachemir, con salida en escritura perso-árabe normalizada en NFC.
- Reconocimiento offline completo: no requiere conexión, servidor ni clave de API.
- Inferencia sobre CPU mediante onnxruntime, sin GPU.
- Procesamiento de audio largo mediante troceado automático en segmentos de 10 segundos.
- Frontend acústico reproducible: características log-mel de 80 dimensiones, ventana Hann y banco mel incluidos.
- Decodificación CTC greedy determinista con blank id 256.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión, audio de entrada más allá del propio ASR, ni modo de pensamiento.
- No es multilingüe: solo cachemir.

## Casos de uso

- Subtitulado de vídeo en cachemir: el modelo es el motor de SubtitleKoshur; se convierte el audio a WAV mono 16 kHz con ffmpeg y se ejecuta `inference.py` para generar transcripciones que se incorporan como subtítulos. Su formato ONNX int8 permite ejecutarlo en el mismo equipo donde se edita el vídeo, sin subir material a servicios externos.
- Archivado y transcripción de grabaciones de campo: investigadores de lingüística pueden transcribir entrevistas y grabaciones en cachemir en local, preservando la confidencialidad de los informantes y evitando cuotas de API.
- Accesibilidad de contenido audiovisual: generación de subtítulos para personas con discapacidad auditiva en medios en cachemir, con un coste de infraestructura mínimo al correr en CPU.
- Indexación y búsqueda de audio: transcripción por lotes de un archivo de audio para construir un índice textual que permita búsqueda por palabras clave sobre el contenido hablado.
- Transcripción de material educativo: conversión de clases o lecturas en cachemir a texto para apuntes, traducción posterior o materiales de estudio, aprovechando el procesado por bloques de 10 s para sesiones largas.
- Prototipado y aplicaciones de escritorio: al pesar unos 187 MB y depender solo de numpy y onnxruntime, puede integrarse en aplicaciones de escritorio o utilidades CLI sin empaquetar frameworks de deep learning completos.
- Evaluación comparativa de ASR de bajos recursos: sirve como línea base reproducible para investigadores que trabajen en cachemir, dado que el frontend y el decodificador están totalmente especificados.

## Benchmarks y rendimiento

El autor publica una única métrica de precisión, medida sobre un conjunto de prueba de voz leída de 65 segundos (10 segmentos de OpenSLR-122 concatenados) y evaluada contra las transcripciones de referencia de OpenSLR:

| Métrica | Valor | Conjunto de evaluación |
|---|---|---|
| CER (character error rate) | 0,348 | 65 s de voz leída, 10 segmentos de OpenSLR-122 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar en la información disponible, ya que no son aplicables a un modelo ASR. El autor advierte que el modelo sigue sus propias convenciones ortográficas, por lo que las puntuaciones a nivel de palabra contra referencias con otra ortografía resultan peores de lo que suena la transcripción. No se han publicado datos de latencia ni throughput.

## Requisitos de hardware

- VRAM: no aplica; el modelo está diseñado para CPU. El fichero ONNX int8 ocupa aproximadamente 187 MB, por lo que la memoria RAM necesaria para cargarlo es del orden de unos cientos de MB, sin cifra oficial publicada.
- GPU recomendadas: no se especifican; el modelo no requiere GPU. Puede ejecutarse en cualquier CPU moderna con onnxruntime.
- GPU de consumo: no es necesario; cabe y está pensado para ejecutarse en CPU de portátil o escritorio.
- Opciones de despliegue: onnxruntime (vía `inference.py`, que solo requiere numpy y onnxruntime) y cualquier runtime compatible con ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles. El autor solo indica que el audio largo se transcribe en bloques de 10 s.

## Comparativa con modelos similares

No se dispone de información sobre modelos ASR comparables para cachemir en la documentación proporcionada. Los grandes sistemas ASR multilingües (por ejemplo, familias tipo Whisper) cubren decenas de idiomas, pero no se han encontrado en la información disponible datos de rendimiento en cachemir que permitan una comparación rigurosa. Por tanto:

| Modelo | Parámetros | Contexto | Rendimiento en cachemir | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kashmiri ASR — CTC (Aazu34) | no disponible | no disponible (bloques de 10 s) | CER 0,348 en prueba de 65 s | other | Hugging Face, ONNX int8 |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El CER de 0,348 sobre una prueba de solo 65 segundos indica un margen de error considerable; no es adecuado para transcripción que requiera alta fidelidad sin revisión humana.
- El modelo sigue sus propias convenciones ortográficas, lo que puede producir discrepancias con referencias escritas en otra ortografía del cachemir.
- Es monolingüe: no transcribe otros idiomas ni cambia de idioma automáticamente.
- Requiere audio a 16 kHz mono; la entrada en otro formato debe convertirse previamente con ffmpeg.
- El procesado en bloques de 10 s puede degradar la coherencia en los límites entre segmentos y en audio con pausas o cambios de hablante.
- La licencia es "other" y no está detallada en la información disponible; es imprescindible revisar los términos con el autor antes de cualquier uso comercial o redistribución.
- No se han publicado datos sobre sesgos, robustez frente a ruido, acentos o habla espontánea; la evaluación se limita a voz leída.
- Riesgo de alucinación y errores de sustitución propios de los modelos CTC, especialmente en nombres propios y términos poco frecuentes.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Aazu34/kashmiri-asr-ctc
- Corpus OpenSLR-122 (cachemir), citado como referencia de evaluación: https://openslr.org/122/
- Herramienta SubtitleKoshur, mencionada por el autor como aplicación del modelo: no disponible (no se proporciona enlace en la información disponible)
