# qnguyen3/QUAN-Transcribe-1.0

## Resumen

QUAN-Transcribe-1.0 es un modelo de reconocimiento automatico del habla (ASR) especializado en vietnamita, desarrollado por el usuario qnguyen3 y publicado en HuggingFace. Se construye sobre el encoder de audio de Google EmbeddingGemma 2 y anade un lector transformer de 6 capas entrenado con CTC, lo que permite transcribir audio en una sola pasada forward, sin decodificador autorregresivo. El resultado es un sistema que, segun el autor, alcanza un 6,87 % de WER medio en un conjunto de ocho benchmarks de vietnamita y funciona a unas 3.713 veces el tiempo real en una unica H100, ademas de operar en modo streaming.

El modelo resuelve un problema concreto: el ASR de alta calidad para vietnamita ha dependido historicamente de la familia Whisper y de PhoWhisper, con modelos de entre 73 M y 1.543 M de parametros, latencias mas altas y WER superiores en dominios como bud500 (hasta 125 % en Whisper medium por problemas de normalizacion). QUAN-Transcribe-1.0 propone una arquitectura hibrida encoder congelado mas lector CTC entrenada en unas 3 horas sobre 8 GPU H100, con solo 2 de las 12 capas del encoder ajustadas.

El repositorio ocupa 1,7 GB y los pesos en safetensors suman 101.738.068 parametros, si bien la tabla de benchmarks del propio autor atribuye al modelo 356 M de parametros (probablemente incluyendo el encoder completo). El modelo se distribuye bajo los Terminos de Uso de Gemma y soporta unicamente vietnamita, con salida en minusculas, sin puntuacion y con los numeros escritos como palabras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder USM-style conformer (EmbeddingGemma 2, 12 capas, solo las 2 superiores ajustadas) mas lector transformer de 6 capas (d=768) con cabecera CTC |
| Parametros totales | 101.738.068 en safetensors (repo); 356 M segun la tabla de benchmarks del autor. La discrepancia no esta aclarada en la model card |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible como ventana de tokens; en streaming procesa en chunks de 0,48 s |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita (vi) |
| Licencia | Gemma Terms of Use (modelo derivado de EmbeddingGemma 2) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo reutiliza el encoder de audio de google/embeddinggemma-2, descrito en la model card como un conformer de estilo USM, y ajusta unicamente las 2 capas superiores de las 12 totales. Las salidas de distintas capas se combinan mediante una mezcla aprendida que alimenta un lector transformer de 6 capas con dimension 768, entrenado con perdida CTC. Las unidades de salida son 14.917 tokens del tokenizador de Gemma, aproximadamente uno por silaba vietnamita, lo que explica la elevada velocidad: un unico forward pass produce la transcripcion completa, sin decodificacion autorregresiva paso a paso.

El lector se entreno con tamanos de chunk dinamicos, lo que le permite funcionar tanto con contexto completo como en streaming sobre la atencion por chunks del propio encoder. Los datos de entrenamiento suman aproximadamente 2.800 horas de habla en vietnamita procedentes de Bud500, viVoice, VLSP2020, FPT FOSD, InfoRe 1/2, LSVSC, ViMD, Common Voice 17, FLEURS y PhoAudiobook, incluyendo enunciados con numeros deletreados en palabras. El entrenamiento completo requirio unas 3 horas en 8 GPU H100. No se menciona en la informacion disponible el uso de RLHF, DPO ni otras tecnicas de alineacion, algo coherente con un modelo CTC de ASR.

## Capacidades

- Reconocimiento automatico del habla en vietnamita con salida en minusculas, sin puntuacion y con numeros escritos como palabras.
- Decodificacion no autorregresiva: una sola pasada forward para toda la transcripcion.
- Modo offline con contexto completo y modo streaming con chunks de 0,48 s usando los mismos pesos.
- Procesamiento por lotes a traves de la API Python (QuanTranscribe.from_pretrained y asr.transcribe).
- Interfaz de linea de comandos incluida en el paquete (quan-transcribe audio.wav).
- Alto rendimiento declarado: aproximadamente 3.713 veces el tiempo real en una H100.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, multi-step reasoning, vision, audio generation, diarizacion de hablantes ni marcas de tiempo.

## Casos de uso

- Transcripcion masiva de audio en vietnamita: con 3.713 veces el tiempo real en una H100, un corpus de 1.000 horas de audio podria transcribirse en torno a 16 minutos de computo de GPU, lo que lo hace adecuado para pipelines de ingesta de archivos historicos o de medios.
- Subtitulado y postproduccion de video: la salida en minusculas sin puntuacion y con numeros en palabras es un formato limpio para alimentar etapas posteriores de puntuacion o segmentacion; la decodificacion en una sola pasada reduce coste frente a modelos autorregresivos.
- Asistentes de voz y transcripcion en vivo: el modo streaming con chunks de 0,48 s permite alimentar interfaces conversacionales o de dictado con latencia baja sin cambiar de pesos.
- Atencion al cliente y centros de contacto: transcripcion de llamadas para analitica, busqueda de texto completo y control de calidad, apoyandose en el bajo coste por hora de audio.
- Investigacion en procesamiento del habla: al ser un derivado documentado de EmbeddingGemma 2 con un lector CTC entrenado en 3 horas, sirve como referencia reproducible para experimentos de adaptacion de encoders congelados a ASR.
- Servicios de accesibilidad: generacion de transcripciones para contenido audiovisual en vietnamita, con posibilidad de desplegar el modelo en una GPU de consumo por su tamano reducido.
- Cumplimiento y moderacion de contenido: transcripcion de grabaciones para revisiones internas en vietnamita, siempre que la politica de uso del modelo y la normativa aplicable lo permitan.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. WER sobre conjuntos de test en vietnamita, mismas utterances, misma normalizacion de texto y misma puntuacion, decodificacion greedy, una H100 por modelo (bf16/fp16). La velocidad se calcula como duracion del audio dividida por el tiempo de reloj entre onda de audio y texto.

| Modelo | Parametros | Avg | Velocidad (xRT) | bud500 | cv17 | fleurs | gigaspeech2 | lsvsc | phoaudiobook | vimd | VIVOS |
|---|---|---|---|---|---|---|---|---|---|---|---|
| QUAN-Transcribe-1.0 | 356 M | 6,87 % | 3.713 | 1,62 % | 10,19 % | 6,75 % | 12,34 % | 5,48 % | 1,35 % | 9,05 % | 8,15 % |
| Gemini-Flash-3.8 | N/A | 6,92 % | N/A | 1,80 % | 10,30 % | 5,90 % | 10,70 % | 5,70 % | 1,60 % | 10,00 % | 9,36 % |
| MAI-Transcribe-2.0 | N/A | 6,96 % | N/A | 2,45 % | 10,15 % | 5,80 % | 10,15 % | 6,00 % | 1,40 % | 10,25 % | 9,48 % |
| Cohere Transcribe 03-2026 | 2.066 M | 7,01 % | 430 | 3,93 % | 11,09 % | 5,64 % | 10,27 % | 6,98 % | 1,74 % | 10,34 % | 6,07 % |
| Qwen3-ASR-1.7B | 2.038 M | 7,01 % | 224 | 5,20 % | 11,31 % | 4,88 % | 8,47 % | 6,60 % | 1,85 % | 10,54 % | 7,25 % |
| ElevenLabs Scribe v2 | N/A | 7,08 % | N/A | 3,15 % | 10,50 % | 5,60 % | 10,50 % | 6,25 % | 1,45 % | 10,05 % | 9,14 % |
| PhoWhisper-large | 1.543 M | 7,21 % | 197 | 9,51 % | 9,12 % | 5,31 % | 10,14 % | 6,81 % | 0,87 % | 11,38 % | 4,52 % |
| PhoWhisper-medium | 764 M | 7,74 % | 261 | 10,36 % | 9,39 % | 6,40 % | 10,71 % | 7,01 % | 1,84 % | 11,38 % | 4,87 % |
| PhoWhisper-small | 242 M | 9,32 % | 429 | 10,35 % | 11,99 % | 8,14 % | 13,16 % | 7,93 % | 2,85 % | 13,91 % | 6,20 % |
| Qwen3-ASR-0.6B | 782 M | 9,81 % | 231 | 6,53 % | 17,41 % | 7,69 % | 12,09 % | 7,86 % | 3,31 % | 13,48 % | 10,14 % |
| PhoWhisper-base | 73 M | 13,52 % | 539 | 19,23 % | 17,47 % | 11,13 % | 19,03 % | 9,52 % | 5,34 % | 18,06 % | 8,37 % |
| PhoWhisper-tiny | 38 M | 14,92 % | 525 | 11,67 % | 19,84 % | 17,46 % | 21,40 % | 10,23 % | 6,37 % | 22,09 % | 10,35 % |
| Whisper large-v2 | 1.543 M | 15,63 % | 180 | 32,71 % | 19,35 % | 10,75 % | 19,70 % | 11,07 % | 3,06 % | 17,29 % | 11,09 % |
| Whisper large-v3-turbo | 809 M | 17,66 % | 417 | 59,56 % | 17,61 % | 7,95 % | 15,76 % | 12,67 % | 2,30 % | 16,14 % | 9,31 % |
| Whisper large-v3 | 1.543 M | 18,04 % | 193 | 64,03 % | 18,43 % | 7,09 % | 14,19 % | 13,96 % | 1,85 % | 15,56 % | 9,18 % |
| Whisper small | 242 M | 28,81 % | 308 | 65,50 % | 31,08 % | 20,59 % | 27,44 % | 20,21 % | 11,21 % | 30,66 % | 23,80 % |
| Whisper medium | 764 M | 30,12 % | 188 | 125,56 % | 26,06 % | 11,98 % | 23,40 % | 15,13 % | 5,83 % | 19,91 % | 13,07 % |

Caveat importante: se trata de resultados autodeclarados por el autor del modelo, sin verificacion independiente en la informacion disponible. En varios subconjuntos QUAN-Transcribe-1.0 no es el mejor: PhoWhisper-large gana en phoaudiobook (0,87 % frente a 1,35 %), cv17 (9,12 % frente a 10,19 %) y VIVOS (4,52 % frente a 8,15 %); Qwen3-ASR-1.7B gana en fleurs (4,88 %) y gigaspeech2 (8,47 %).

## Requisitos de hardware

- VRAM estimada para inferencia: con 101,7 M de parametros en safetensors, los pesos en bf16/fp16 ocupan aproximadamente 0,2 GB; con el encoder completo (356 M) el peso se situa en torno a 0,7 GB en bf16. El repositorio completo ocupa 1,7 GB, lo que sugiere margen para otros artefactos.
- GPU recomendadas: el autor reporta medidas con una H100 por modelo en bf16/fp16. No se publican datos de rendimiento para A100, RTX 4090 u otras GPU.
- GPU de consumo: por tamano, el modelo cabe con holgura en cualquier GPU consumer moderna con 8 GB o mas (RTX 3060, 4060, 4070, 4090 y equivalentes). No se han publicado mediciones de latencia o throughput en estas tarjetas.
- Velocidad medida: aproximadamente 3.713 veces el tiempo real en una H100, muy por encima de los 197-539 xRT de la familia PhoWhisper y de los 180-417 xRT de distintos Whisper. Esta cifra no debe extrapolarse a otras GPU sin datos adicionales.
- Opciones de despliegue: el autor proporciona un paquete Python propio (pip install git+https://github.com/qnguyen3/QUAN-Transcribe) y una CLI. No se documenta soporte para vLLM, TGI, llama.cpp, Ollama ni otros servidores de inferencia, algo esperable en un modelo CTC no autorregresivo con salida de tokens Gemma.
- Requisito adicional: el encoder base google/embeddinggemma-2 se descarga en el primer uso y es necesario aceptar sus terminos en la pagina del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Avg WER (vi) | Velocidad (xRT) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QUAN-Transcribe-1.0 | 356 M (tabla) / 101,7 M (safetensors) | 6,87 % | 3.713 | Gemma Terms of Use | HuggingFace, safetensors, requiere aceptar terminos del encoder base |
| Qwen3-ASR-1.7B | 2.038 M | 7,01 % | 224 | no disponible en la informacion | no disponible en la informacion |
| Cohere Transcribe 03-2026 | 2.066 M | 7,01 % | 430 | no disponible en la informacion | no disponible en la informacion |
| PhoWhisper-large | 1.543 M | 7,21 % | 197 | no disponible en la informacion | no disponible en la informacion |
| Whisper large-v3 | 1.543 M | 18,04 % | 193 | no disponible en la informacion | no disponible en la informacion |

La ventaja diferencial de QUAN-Transcribe-1.0 en esta comparativa es la relacion entre WER medio, tamano y velocidad: obtiene el mejor promedio con un numero de parametros muy inferior al de Qwen3-ASR-1.7B o Cohere Transcribe y con una velocidad entre 8 y 19 veces superior. Como contrapartida, no es el mejor modelo en todos los dominios (PhoWhisper-large lidera en VIVOS, cv17 y phoaudiobook) y su licencia derivada de Gemma impone condiciones que conviene revisar antes de un uso comercial.

## Limitaciones y advertencias

- Cobertura linguistica limitada a vietnamita: no se documenta soporte de otros idiomas ni capacidades de traduccion.
- Salida sin puntuacion, en minusculas y con numeros escritos como palabras; requiere postprocesado si se necesita texto formateado o legible.
- No hay informacion sobre marcas de tiempo, diarizacion de hablantes ni segmentacion por locutor.
- Riesgo de alucinacion y de errores en audio con ruido, acentos no representados en el corpus o vocabulario tecnico; el WER en gigaspeech2 (12,34 %) y cv17 (10,19 %) es sensiblemente peor que en los conjuntos de lectura.
- Sesgos potenciales derivados de la composicion del corpus de entrenamiento (Bud500, viVoice, VLSP2020, FPT FOSD, InfoRe 1/2, LSVSC, ViMD, Common Voice 17, FLEURS, PhoAudiobook), que sobrerrepresenta ciertos dominios y registros.
- Licencia derivada de Gemma: sujeto a los Terminos de Uso de Gemma, con las restricciones de uso que estos imponen. No se debe asumir libertad de uso comercial sin revisar dichos terminos.
- El encoder base google/embeddinggemma-2 se descarga por separado y exige aceptar sus terminos en HuggingFace antes del primer uso.
- Discrepancia no resuelta entre los 101.738.068 parametros en safetensors y los 356 M declarados en la tabla de benchmarks; conviene verificar el recuento real antes de dimensionar hardware.
- Todos los benchmarks son autodeclarados por el autor, con normalizacion y puntuacion propias; no hay evaluacion independiente disponible.
- El modelo tiene un volumen bajo de adopcion en el momento de la ficha (33 descargas y 31 likes), por lo que la madurez del ecosistema y del soporte es reducida.
- Velocidad de 3.713 xRT reportada sobre H100; no hay datos publicos de rendimiento en otras GPU, por lo que las extrapolaciones son especulativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qnguyen3/QUAN-Transcribe-1.0
- Codigo de inferencia: https://github.com/qnguyen3/QUAN-Transcribe
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Repositorio de referencia sobre arquitecturas de modelos (resultado de busqueda tangencialmente relacionado): https://github.com/gokayfem/awesome-vlm-architectures
- No se han encontrado en la busqueda web papers, blogs o demos adicionales relevantes para este modelo; los restantes resultados devueltos no guardan relacion con IA ni con reconocimiento del habla.
