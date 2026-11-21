# Scrya/parakeet-tdt-0.6b-v3-nsc5-nemo-speech-cpp-q8_0

## Resumen

Parakeet-TDT-0.6B-v3-nsc5 es un modelo de reconocimiento automático del habla (ASR) desarrollado por el usuario Scrya a partir del modelo base de NVIDIA Parakeet-TDT-0.6B-v3. Se trata de un ajuste fino sobre 1.386 horas de inglés conversacional de Singapur (Singlish) procedentes de cinco partes del National Speech Corpus (NSC) de IMDA, con datos y configuraciones de entrenamiento orientados especificamente a audio de salas de reuniones. El repositorio que nos ocupa contiene exclusivamente una cuantizacion GGUF q8_0 de ese modelo ajustado, pensada para ejecutarse con NeMo-Speech.cpp, el runtime en C++ de NVIDIA para modelos de voz de NeMo.

La arquitectura subyacente es un transducer TDT (Token-and-Duration Transducer) con 637.329.158 parametros totales, lo que lo situa en la gama de 0,6 mil millones de parametros. El modelo es monolingue (ingles) y esta especializado en transcripcion de reuniones con hablantes de Singapur, incluyendo el registro coloquial Singlish. La licencia es CC-BY-4.0, lo que permite uso comercial con atribucion.

La relevancia de esta ficha radica en que combina tres elementos poco habituales: un ajuste fino de dominio muy especifico (reuniones, Singlish), una cuantizacion q8_0 que apenas degrada la calidad respecto al modelo original (diferencia de WER de -0,05 a -0,06 puntos porcentuales) y un runtime de inferencia optimizado (NeMo-Speech.cpp) que alcanza 199x tiempo real en una sola GPU RTX 5090 y 265x con batching de 16 clips.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer), familia Parakeet de NVIDIA |
| Parametros totales | 637.329.158 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q8_0 (GGUF); existe variante f16 en repositorio separado |
| Idiomas soportados | en (ingles, con foco en ingles de Singapur / Singlish) |
| Licencia | cc-by-4.0 |
| Formato de pesos | GGUF (q8_0); el modelo base esta en safetensors y `.nemo` |

## Arquitectura y entrenamiento

El modelo es un transducer TDT de la familia Parakeet, una arquitectura encoder-decoder con un predictor de duracion que predice conjuntamente tokens y duraciones, lo que permite decodificacion no autorregresiva eficiente en tiempo. El modelo base Parakeet-TDT-0.6B-v3 fue desarrollado por NVIDIA y ajustado posteriormente por Scrya sobre 1.386 horas de audio conversacional en ingles de Singapur extraido de cinco partes del National Speech Corpus (NSC) de IMDA. La seleccion de datos y los hiperparametros de entrenamiento se orientaron explicitamente a speech de salas de reuniones.

El repositorio contiene unicamente la conversion a GGUF q8_0 del checkpoint ajustado, realizada a partir del checkpoint `.nemo` del repositorio principal. No se documenta en la informacion disponible el proceso de cuantizacion mas alla de la mencion de que se parte del `.nemo` y se genera el fichero GGUF para NeMo-Speech.cpp 0.3.0. El modelo produce texto con puntuacion y mayusculas, y escribe los numeros como palabras (por ejemplo, "twenty five" en lugar de "25"). NeMo-Speech.cpp solo soporta decodificacion greedy para este modelo.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles, con especializacion en ingles de Singapur y registro Singlish.
- Transcripcion de audio de reuniones y conversaciones multi-hablante.
- Salida con puntuacion, mayusculas y numeros escritos como palabras.
- Procesamiento por lotes (batching) en GPU mediante `--concurrency` en NeMo-Speech.cpp.
- Servicio HTTP compatible con la API de transcripciones de OpenAI (`/v1/audio/transcriptions`), incluyendo `response_format=verbose_json` para timestamps por palabra.
- Endpoints de salud y listado de modelos (`GET /ready`, `GET /v1/models`).
- No soporta tool calling, agentes, vision ni audio mas alla de la transcripcion.
- No es multilingue: solo ingles.

## Casos de uso

- Transcripcion de reuniones corporativas en Singapur: el modelo esta ajustado sobre 1.386 horas de audio de salas de reuniones del NSC, por lo que maneja acentos locales, ruido de sala y solapamientos conversacionales mejor que el modelo base generico.
- Generacion de actas y resumenes a partir de audio: la salida con puntuacion y mayusculas y los numeros en palabras facilita el post-procesado y la alimentacion a pipelines de resumen sin normalizacion adicional.
- Subtitulado y transcripcion por lotes: con `--concurrency 16` y 265x tiempo real en RTX 5090, permite procesar grandes volumenes de grabaciones en pocas horas.
- Servicio de transcripcion como API interna: el servidor `nemo-speech serve` expone una API compatible con OpenAI, lo que permite integrarlo con el paquete `openai` de Python y con herramientas existentes sin adaptadores.
- Analisis de calidad y compliance en contact centers: la transcripcion con timestamps por palabra (`verbose_json`) permite alinear texto y audio para auditoria, aunque la confianza por palabra es fija a 1 en la version 0.3.0 del runtime.
- Investigacion en ASR de variedades del ingles: el modelo sirve como referencia para estudiar el rendimiento en Singlish y comparar con el modelo base de NVIDIA en las mismas condiciones.
- Despliegue en entornos con recursos limitados: el fichero GGUF de 0,71 GB y el runtime C++ permiten ejecucion en CPU (`gpu: -1`) o en GPUs de gama consumer.

## Benchmarks y rendimiento

Los datos proceden de la comparacion del autor entre este fichero GGUF y el modelo original en transformers (fp32, greedy, limite de 3 tokens por frame) sobre una muestra de 1.000 clips aleatorios de cada parte del NSC (5.000 clips, 7,15 horas). El WER normalizado aplica minusculas, elimina puntuacion y aplica reglas ortograficas del NSC; el WER formateado compara el texto tal cual.

| Modelo | WER normalizado | WER formateado | Diferencia normalizada | Velocidad en RTX 5090 |
|---|---:|---:|---|---:|
| Original (transformers, fp32) | 8,54% | 15,79% | | |
| Este fichero, 1 clip a la vez | 8,48% | 15,70% | -0,06 [-0,10, -0,02] | 199x tiempo real |
| Este fichero, 16 clips a la vez | 8,49% | 15,71% | -0,05 [-0,09, -0,01] | 265x tiempo real |

Desglose por parte del NSC:

| Parte | Original normalizado | Este fichero normalizado | Original formateado | Este fichero formateado |
|---|---:|---:|---:|---:|
| Part 3 SDM | 9,90% | 9,94% | 16,63% | 16,64% |
| Part 3 Same Room | 10,91% | 10,80% | 16,27% | 16,18% |
| Part 4 | 14,70% | 14,60% | 23,26% | 23,12% |
| Part 5 | 6,40% | 6,32% | 12,98% | 12,83% |
| Part 6.3 | 6,07% | 6,02% | 13,98% | 13,92% |

El fichero genera exactamente el mismo texto que el modelo original en 4.686 de los 5.000 clips. El batching de 16 clips cambia el texto de 18 clips sin alterar el WER. La variante f16 es aproximadamente el doble de grande y produce texto mas cercano al original, pero no obtiene mejor puntuacion que este fichero q8_0.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el fichero GGUF ocupa 0,71 GB, por lo que la huella de pesos en VRAM es de aproximadamente 0,7 GB mas overhead del runtime y buffers de activacion.
- GPU recomendadas: RTX 5090 (mediciones oficiales del autor: 199x tiempo real sin batching, 265x con batching de 16). No se han publicado mediciones para A100, H100 u otras GPUs.
- Cabe en GPU consumer: si, dado el tamano del fichero (0,71 GB) es compatible con cualquier GPU consumer moderna con al menos 2 GB de VRAM; no se han publicado mediciones concretas en esas GPUs.
- Opciones de despliegue: NeMo-Speech.cpp 0.3.0 (CLI `nemo-speech transcribe` y servidor `nemo-speech serve`), con soporte de CPU (`gpu: -1`) y CUDA.
- Latencia y throughput: 199x tiempo real en RTX 5090 con un clip a la vez; 265x con 16 clips en paralelo. Las cifras incluyen el arranque del runtime y la carga del modelo para el lote completo de 5.000 clips.
- El servidor HTTP no tiene API key por defecto; debe definirse `NEMO_SPEECH_HTTP_API_KEY` antes de exponerlo en red.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (muestra NSC) | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (q8_0 GGUF) | 637 M | no disponible | 8,48% normalizado | CC-BY-4.0 | GGUF |
| Scrya/parakeet-tdt-0.6b-v3-nsc5 (original fp32) | 637 M | no disponible | 8,54% normalizado | CC-BY-4.0 | safetensors, `.nemo` |
| Scrya/parakeet-tdt-0.6b-v3-nsc5-nemo-speech-cpp-f16 | 637 M | no disponible | no mejor que q8_0 segun el autor | CC-BY-4.0 | GGUF f16 |
| nvidia/parakeet-tdt-0.6b-v3 (base sin ajuste) | 637 M | no disponible | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | safetensors |

No se dispone de datos de benchmarks del modelo base de NVIDIA ni de otras alternativas ASR en la informacion proporcionada, por lo que la comparativa se limita a las variantes del mismo ajuste fino.

## Limitaciones y advertencias

- Modelo monolingue: solo transcribe ingles, con sesgo hacia el ingles de Singapur. El rendimiento en otras variedades del ingles o en hablantes no nativos no esta documentado.
- Especializado en audio de salas de reuniones: el ajuste fino se realizo con datos de reuniones del NSC, por lo que puede degradarse en otros dominios (llamadas telefonicas, audio de baja calidad, musica, ruido extremo).
- Riesgo de alucinacion inherente a los modelos ASR: las transcripciones pueden contener palabras inventadas o sustituciones, especialmente en segmentos con ruido o solapamiento.
- Solo decodificacion greedy en NeMo-Speech.cpp 0.3.0; no hay busqueda por haz ni otras estrategias de decodificacion.
- La confianza por palabra en `verbose_json` es siempre 1 para modelos transducer en la version 0.3.0 del runtime, por lo que no es util para filtrar segmentos de baja calidad.
- El servidor HTTP no incluye autenticacion por defecto; es necesario configurar `NEMO_SPEECH_HTTP_API_KEY` antes de exponerlo.
- Licencia CC-BY-4.0: permite uso comercial con atribucion, pero debe revisarse la compatibilidad con los terminos del National Speech Corpus de IMDA para los datos de entrenamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no hay validacion comunitaria independiente de los resultados reportados por el autor.
- No se documentan sesgos demograficos especificos ni evaluaciones de equidad en la informacion disponible.

## Enlaces

- Repositorio Hugging Face de este fichero: https://huggingface.co/Scrya/parakeet-tdt-0.6b-v3-nsc5-nemo-speech-cpp-q8_0
- Repositorio del modelo base ajustado (safetensors y `.nemo`): https://huggingface.co/Scrya/parakeet-tdt-0.6b-v3-nsc5
- Variante f16 para NeMo-Speech.cpp: https://huggingface.co/Scrya/parakeet-tdt-0.6b-v3-nsc5-nemo-speech-cpp-f16
- Modelo base de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Runtime NeMo-Speech.cpp: https://github.com/NVIDIA/NeMo-Speech.cpp
- Documentacion de la API de NeMo-Speech.cpp v0.3.0: https://github.com/NVIDIA/NeMo-Speech.cpp/blob/v0.3.0/docs/api.md
