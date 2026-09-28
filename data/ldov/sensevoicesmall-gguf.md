# ldov/SenseVoiceSmall-gguf

## Resumen

SenseVoiceSmall-gguf es una conversion al formato GGUF del modelo de reconocimiento automatico del habla FunAudioLLM/SenseVoiceSmall, publicada por el usuario ldov para su uso con el runtime transcribe.cpp. El modelo original lo desarrolla el equipo FunAudioLLM (Alibaba), y esta conversion mantiene intactos los pesos quantizados, fijados al commit upstream 3eb3b4e y validados contra la referencia FunASR 1.3.1 en el commit f094d28 de transcribe.cpp. Se trata de un encoder SAN-M de 234.000.287 parametros con una unica cabeza CTC sobre un vocabulario SentencePiece de 25.055 tokens.

El modelo resuelve transcripcion offline multilingue en chino mandarin, cantonés, ingles, japones y coreano, con deteccion de idioma, etiquetas de emocion y deteccion de eventos sonoros emitidas por la misma cabeza CTC. No es un modelo de streaming, no traduce y no incluye troceado de audio largo: cada llamada acepta un WAV mono a 16 kHz con un maximo de 30 segundos.

Su relevancia practica esta en el tamano: con cuantizacion Q4_K_M ocupa 146 MB y con Q8_0 unos 253 MB, manteniendo un WER de 3,13 % en LibriSpeech test-clean con Q8_0, identico al de la referencia en F32. Eso permite ejecutar ASR multilingue en CPU, GPU integrada o dispositivos moviles sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder SAN-M con cabeza CTC unica (greedy decoding) |
| Parametros totales | 234.000.287 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no es un modelo de contexto textual; acepta 30 segundos de audio como maximo por llamada (WAV mono 16 kHz) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | zh (mandarin), yue (cantonés), en, ja, ko |
| Licencia | model-license (FunASR MODEL_LICENSE), heredada del modelo base; etiquetada como "other" |
| Formato de pesos | GGUF |
| Vocabulario | SentencePiece, 25.055 tokens |
| Entrada de audio | WAV mono, 16 kHz |
| Deteccion de idioma | si |
| Timestamps | no |
| Streaming | no |
| Traduccion | no |
| Runtime | transcribe.cpp |
| Tamano del repositorio | 2,2 GB |

## Arquitectura y entrenamiento

La conversion conserva la arquitectura del modelo original: un encoder SAN-M (self-attention network con modulos de memoria) de 234M de parametros que alimenta una unica cabeza CTC. La decodificacion es greedy CTC, sin beam search ni modelo de lenguaje externo. La misma cabeza CTC emite, ademas del texto, etiquetas de identificacion de idioma (LID), etiquetas simples de emocion (SER), etiquetas de eventos sonoros (AED) y etiquetas de control de normalizacion inversa de texto. Estas etiquetas permanecen ocultas en la salida salvo que se pase la opcion `--raw-tokens`. La normalizacion inversa de texto (ITN) esta activada por defecto, de modo que la salida incluye mayusculas, puntuacion y digitos legibles; con `--no-itn` se obtiene la forma hablada original del upstream.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en esta conversion ni en la model card reproducida. La model card del upstream si documenta que SenseVoice es un modelo fundacional de voz entrenado para multiples tareas de comprension del habla (ASR, LID, SER y AED) de forma conjunta. La validacion de la conversion se realizo comparando el port F32 de transcribe.cpp contra una ejecucion de referencia de FunASR 1.3.1 sobre el mismo manifiesto, con una diferencia de +0,002 puntos porcentuales.

## Capacidades

- Transcripcion de voz a texto offline en chino mandarin, cantonés, ingles, japones y coreano.
- Deteccion automatica de idioma integrada en la salida del modelo (`lang_detect: true`).
- Reconocimiento de emociones a nivel de etiqueta simple mediante la cabeza CTC.
- Deteccion de eventos sonoros (AED) con la misma cabeza.
- Normalizacion inversa de texto activada por defecto: mayusculas, puntuacion y digitos; desactivable con `--no-itn`.
- Emision de etiquetas de idioma, emocion, evento y control de ITN visibles con `--raw-tokens`.
- Ejecucion en CPU, Metal (Apple) y Vulkan segun los backends soportados por transcribe.cpp.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta agentes ni razonamiento multi-paso.
- No soporta streaming: la inferencia es por llamadas completas de audio.
- No genera timestamps ni segmentacion temporal.
- No traduce: la salida es transcripcion en el idioma detectado, no traduccion.

## Casos de uso

- Transcripcion en aplicaciones moviles y de escritorio: con el quantizado Q4_K_M (146 MB) o Q5_K_M (172 MB) el modelo cabe en el almacenamiento y la memoria de un telefono, permitiendo dictado y notas de voz sin conexion ni coste por peticion.
- Privacidad y cumplimiento normativo: al ejecutarse en local mediante transcribe.cpp, el audio nunca sale del dispositivo, lo que resulta adecuado para entornos sanitarios, legales o industriales con requisitos estrictos de tratamiento de datos.
- Analitica de centros de contacto: las etiquetas de emocion emitidas por la cabeza CTC permiten clasificar llamadas por tono (por ejemplo, para priorizar casos de insatisfaccion) sin necesidad de un segundo modelo.
- Indexado y busqueda de archivos de audio: la deteccion de eventos sonoros y el idioma detectado permiten enriquecer metadatos de grabaciones antes de indexarlas en un buscador o sistema de gestion documental.
- Enrutamiento multilingue en pipelines de atencion al cliente: la deteccion de idioma integrada permite dirigir cada fragmento transcrito al agente o cola correspondiente (mandarin, cantonés, ingles, japones o coreano) sin un clasificador adicional.
- Preprocesado de corpus de entrenamiento: dado su bajo coste computacional, el modelo puede transcribir grandes volumenes de audio en paralelo para generar pseudoetiquetas o transcripciones base en proyectos de investigacion en ASR.
- Subtitulado de contenido corto: para videos con planos de menos de 30 segundos o con troceado externo previo, el modelo produce transcripciones con puntuacion y digitos normalizados listos para publicar.
- Asistentes de voz embebidos en hardware de bajo consumo: el backend Vulkan y las ejecuciones en CPU (Ryzen 4750U) permiten integrarlo en equipos sin GPU dedicada.

## Benchmarks y rendimiento

Los valores de WER y CER que se muestran a continuacion proceden de la model card del autor de la conversion. Las cifras de LibriSpeech se midieron con ITN desactivado, igual que la referencia de FunASR. La referencia propia del autor es una ejecucion de FunASR 1.3.1 sobre el mismo manifiesto: 3,13 % de WER con intervalo de confianza del 95 % [2,93 %, 3,34 %].

WER en LibriSpeech test-clean (2.620 enunciados, ingles):

| Cuantizacion | Tamano | WER (LibriSpeech test-clean) |
|---|---:|---:|
| F32 | 937 MB | 3,13 % |
| F16 | 470 MB | 3,13 % |
| Q8_0 | 253 MB | 3,13 % |
| Q6_K | 196 MB | 3,14 % |
| Q5_K_M | 172 MB | 3,18 % |
| Q4_K_M | 146 MB | 3,45 % |

WER y CER en FLEURS con cuantizacion Q8_0:

| Idioma | Metrica | Valor (Q8_0) |
|---|---|---:|
| Ingles (en) | WER | 7,14 |
| Japones (ja) | CER | 7,63 |
| Coreano (ko) | CER | 8,27 |
| Chino mandarin (zh) | CER | 10,12 |
| Cantonés (yue) | CER | 37,44 |

El autor advierte que LibriSpeech es un benchmark en ingles y que el caso mas fuerte de SenseVoice es el mandarin, para el que recomienda usar AISHELL-1 (CER) como comprobacion complementaria. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de modelos de lenguaje, dado que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM y memoria estimadas segun el tamano de cada fichero GGUF, mas el margen del runtime: unos 146 MB con Q4_K_M, 172 MB con Q5_K_M, 253 MB con Q8_0, 470 MB con F16 y 937 MB con F32.
- Cabe sin problema en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, asi como en GPU integradas y en Apple Silicon.
- Ejecutable en CPU sin GPU dedicada. El autor reporta un factor de tiempo real de 49,53x en CPU y 266,99x en Metal sobre un Apple M4 Max, y de 19,73x en CPU y 27,69x en Vulkan sobre un Ryzen 4750U (valores tal como los publica el autor, mayor es mejor).
- A partir de esos factores, una locucion de 30 segundos se procesaria en el entorno de 0,1 segundos en un M4 Max con Metal y de 1,5 segundos en un Ryzen 4750U en CPU (calculo derivado de los datos reportados, no publicado por el autor).
- Despliegue mediante transcribe.cpp, que soporta backends de CPU, Metal y Vulkan. Se compila desde fuente con CMake.
- No se documenta soporte en vLLM, TGI, llama.cpp, Ollama ni otros servidores de inferencia. El formato GGUF de este repositorio es especifico del runtime transcribe.cpp.
- La entrada debe ser WAV mono a 16 kHz; para otras fuentes hay que convertirla previamente (por ejemplo, con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`).

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | WER LibriSpeech test-clean | Disponibilidad |
|---|---:|---|---|---|---|---|
| SenseVoiceSmall-gguf (esta conversion) | 234M | zh, yue, en, ja, ko | GGUF (F32 a Q4_K_M) | model-license (FunASR) | 3,13 % (Q8_0) | HuggingFace, runtime transcribe.cpp |
| FunAudioLLM/SenseVoiceSmall (modelo base) | 234M | zh, yue, en, ja, ko | safetensors / PyTorch | model-license (FunASR) | el autor no publica WER numerico, solo figuras en PNG | HuggingFace, ModelScope, FunASR |
| Whisper small (OpenAI) | aproximadamente 244M | multilingue (99 idiomas) | PyTorch, GGUF via whisper.cpp | MIT | no disponible en la informacion proporcionada | muy extendida, multiples runtimes |
| Alternativas de ASR cuantizadas en GGUF | no disponible | no disponible | GGUF | no disponible | no disponible | no disponible |

La comparacion de rendimiento con alternativas no puede completarse porque la informacion disponible solo incluye mediciones de este modelo. Cabe destacar que SenseVoiceSmall-gguf ofrece deteccion de idioma, emocion y eventos sonoros integradas, capacidades que no estan presentes por defecto en otros modelos de la misma categoria.

## Limitaciones y advertencias

- Alcance de idioma limitado a cinco idiomas (zh, yue, en, ja, ko). No hay soporte documentado para castellano ni para otras lenguas europeas.
- No es un modelo de streaming: requiere el audio completo antes de empezar a transcribir.
- Limite estricto de 30 segundos por llamada, heredado del contrato de inferencia directa del upstream. El audio largo exige troceado externo.
- No genera timestamps ni marcas temporales, lo que complica la alineacion para subtitulos sincronizados.
- No traduce. Solo transcribe en el idioma original detectado.
- El rendimiento en cantonés es notablemente peor que en el resto de idiomas: CER de 37,44 en FLEURS con Q8_0, frente a 10,12 en mandarin y 7,14 de WER en ingles.
- Riesgo de alucinacion y de errores en audio con ruido, solapamiento de hablantes o acentos poco representados en el entrenamiento. No se documentan los sesgos del modelo base en la informacion disponible.
- Las etiquetas de emocion son "simples", segun la propia model card, por lo que no deben usarse como base de decisiones sensibles sin supervision humana.
- Licencia model-license (FunASR MODEL_LICENSE), heredada del modelo base. Hay que revisar el texto completo antes de cualquier uso comercial.
- La model card apunta las descargas a ficheros alojados en el repositorio handy-computer/SenseVoiceSmall-gguf, no en el repositorio ldov/SenseVoiceSmall-gguf donde se publica esta ficha. Conviene verificar la procedencia de los pesos antes de desplegarlos.
- Modelo con 0 descargas y 0 likes en el momento de la consulta, publicado el 28 de septiembre de 2026. La validacion numerica la aporta el autor de la conversion, no una verificacion independiente.
- Ambiguedad en las fechas del repositorio: se declara una version fijada el 6 de mayo de 2026 y validada en la misma fecha, mientras que la publicacion figura en septiembre de 2026.
- Los valores de RTF publicados carecen de contexto metodologico (tamano de audio, numero de hilos, version del backend), por lo que las estimaciones de latencia derivadas deben tomarse como orientativas.

## Enlaces

- Repositorio de la conversion: https://huggingface.co/ldov/SenseVoiceSmall-gguf
- Modelo base: https://huggingface.co/FunAudioLLM/SenseVoiceSmall
- Commit upstream fijado: https://huggingface.co/FunAudioLLM/SenseVoiceSmall/commit/3eb3b4e
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validacion de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/f094d28
- Pagina del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/sensevoice-small.md
- Repositorio SenseVoice: https://github.com/FunAudioLLM/SenseVoice
- Repositorio FunASR: https://github.com/modelscope/FunASR
- Licencia del modelo base: https://github.com/modelscope/FunASR/blob/main/MODEL_LICENSE
- Pagina del proyecto FunAudioLLM: https://fun-audio-llm.github.io/
- Modelo en ModelScope: https://www.modelscope.cn/models/iic/SenseVoiceSmall
