# itayinbar/Ozen-v1

## Resumen

Ozen-v1 (אוזן, "oreja" en hebreo) es un modelo de reconocimiento automático del habla en hebreo desarrollado por Itay Inbar, publicado en HuggingFace bajo licencia Apache-2.0. Se trata de un modelo compacto de 60,7 millones de parámetros, diseñado específicamente para ejecutarse en un teléfono móvil o directamente en el navegador, con un tamaño de repositorio de 0,6 GB. Su objetivo es cubrir la ausencia de modelos de transcripción de voz en hebreo que sean ligeros y desplegables en el borde (on-device).

Arquitectónicamente es un modelo tipo Whisper encoder-decoder: un encoder de 12 capas y un decoder de 4 capas con anchura 512, derivado de `openai/whisper-base`. Sustituye el vocabulario multilingüe de Whisper por un tokenizador BPE a nivel de byte específico para hebreo de 8.192 tokens, lo que reduce el coste de tokenización a 1,76 tokens por palabra hebrea frente a 3,17 de Whisper. El modelo es una destilación del fine-tune hebreo de ivrit.ai sobre Whisper large-v3-turbo.

Su relevancia radica en la relación entre tamaño y precisión: alcanza un 8,59 % de WER en el conjunto de evaluación `ivrit-ai/eval-d1` y un 15,94 % en mensajes de voz de WhatsApp, superando ampliamente a Whisper base y small estándar en hebreo, y acercándose a modelos 13 veces mayores. Transcribe aproximadamente 40 veces más rápido que el tiempo real sobre cuatro hilos de CPU, lo que lo hace viable para despliegue en producción sin GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo Whisper (12 capas de encoder, 4 de decoder, anchura 512) |
| Parametros totales | 60.738.560 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas de audio de hasta 30 segundos (procesado por ventanas solapadas) |
| Tipos de cuantizacion | ONNX en fp16, fp32 e int8 (encoder); decoder solo fp32 |
| Idiomas soportados | hebreo (he) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y ONNX |

## Arquitectura y entrenamiento

Ozen-v1 es un transformer encoder-decoder con la topología de Whisper. El encoder consta de 12 capas y el decoder de 4, ambos con anchura 512. Parte de `openai/whisper-base`, al que se le sustituyó el tokenizador multilingüe por un BPE a nivel de byte de 8.192 tokens en hebreo, se duplicó la profundidad y se entrenó en hebreo, para después recortar el decoder a cuatro capas. La profundidad del decoder se eligió de forma empírica: 2 capas dan 24,95 % de WER y 0,59 s por ventana de 30 s; 3 capas 21,31 % y 0,66 s; 4 capas 20,13 % y 0,73 s. Como el coste de inferencia lo domina el encoder, cada capa extra de decoder es barata y aporta aproximadamente un punto de precisión. La tasa de aprendizaje también se barrió (5e-5, 1e-4 y 2e-4), conservando 1e-4.

El entrenamiento se basa en destilación del fine-tune hebreo de ivrit.ai sobre Whisper large-v3-turbo, que transcribió 3.519 horas de `ivrit-ai/audio-v2` (principalmente pódcast y entrevistas), decodificadas como episodios completos, cortadas en ventanas de hasta 28 segundos y filtradas por la confianza del propio decoder. Ninguna fuente aporta más del 10 % del audio. La mezcla final de audio escuchado fue: 75 % etiquetas del profesor, 15 % `ivrit-ai/crowd-transcribe-v5`, 4 % `ivrit-ai/crowd-recital`, 3 % `google/fleurs` he y 3 % `imvladikon/hebrew_speech_kan`. Se usó Schedule-free AdamW, tasa 1e-4, batch efectivo 16, bf16, sobre una única GPU RTX 5070 Laptop. Los pesos publicados corresponden al paso 220.000 de 303.562, seleccionados sobre 15 horas de audio de pódcast reservadas, donde obtiene 13,24 % frente a las transcripciones del profesor.

## Capacidades

- Transcripción de voz en hebreo (pipeline `automatic-speech-recognition`).
- Reconocimiento de audio de hasta 30 segundos por ventana, con posibilidad de encadenar ventanas solapadas para audio más largo.
- Funcionamiento monolingüe sin tokens de idioma, tarea ni marcas de tiempo.
- Inferencia en el borde: ejecutable en teléfono y en navegador mediante transformers.js con WebGPU o WASM.
- Exportación a ONNX con combinaciones de precisión verificadas (encoder fp16 + decoder fp32, 164,3 MB de descarga).
- No dispone de tool calling, capacidades de agente, visión ni audio generativo.
- No soporta otros idiomas; la tarjeta advierte de que puede escribir palabras en inglés con transliteración a letras hebreas.

## Casos de uso

- Transcripción de pódcast y entrevistas en hebreo: el modelo fue entrenado mayoritariamente sobre pódcast de `ivrit-ai/audio-v2`, por lo que transcribe episodios completos cortados en ventanas solapadas con alta fidelidad respecto al dominio de entrenamiento.
- Mensajería de voz en aplicaciones móviles: con 15,94 % de WER en el conjunto `ivrit-ai/eval-whatsapp`, permite transcribir notas de voz en el propio dispositivo sin enviar audio a un servidor.
- Subtitulado en tiempo real en el navegador: al correr en transformers.js con WebGPU y transcribir a ~40× tiempo real en cuatro hilos de CPU, puede integrarse en aplicaciones web de accesibilidad para contenido hablado en hebreo.
- Dictado en aplicaciones de productividad: su tamaño de 60,7 M de parámetros y 0,6 GB permite empaquetarlo en apps móviles o extensiones de escritorio.
- Preprocesado de datos en pipelines de NLP en hebreo: transcripción masiva de corpus de audio a texto para alimentar sistemas de búsqueda o clasificación.
- Asistentes de atención al cliente en hebreo: transcripción de llamadas y mensajes de voz en el borde, reduciendo costes de cómputo en servidor.
- Archivado y búsqueda de contenido audiovisual en hebreo: indexación de bibliotecas de audio sin necesidad de infraestructura GPU.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos con un arnés que reproduce el leaderboard de ivrit.ai sobre 40 de 40 pares modelo-dataset publicados:

| Benchmark | Ozen-v1 (61M) | whisper-small (242M) | whisper-base (73M) | ivrit.ai turbo (809M) |
|---|---|---|---|---|
| `ivrit-ai/eval-d1` | 8,59 % | 29,93 % | 48,32 % | 5,5 % |
| `ivrit-ai/eval-whatsapp` | 15,94 % | 39,64 % | 56,60 % | 6,1 % |
| `imvladikon/hebrew_speech_kan` | 13,40 % | 37,42 % | 68,12 % | 8,10 % |

La columna ivrit.ai turbo representa el modelo del que Ozen fue destilado y el techo contra el que se mide. El WER se expresa como porcentaje.

Selección de profundidad del decoder (WER en reserva tras 12k pasos y tiempo de CPU por ventana de 30 s):

| Capas del decoder | WER en reserva | Tiempo CPU por ventana de 30 s |
|---|---|---|
| 2 | 24,95 % | 0,59 s |
| 3 | 21,31 % | 0,66 s |
| 4 | 20,13 % | 0,73 s |

## Requisitos de hardware

- VRAM estimada: al tratarse de 60,7 M de parámetros, la inferencia cabe holgadamente en cualquier GPU de consumo; el paquete ONNX recomendado para navegador (encoder fp16 + decoder fp32) ocupa 164,3 MB.
- GPU recomendadas: cualquier GPU moderna sirve; no requiere A100 ni H100. El autor lo entrenó en una RTX 5070 Laptop.
- Cabe en GPUs de consumo: sí, en cualquier GPU de gama media y baja, e incluso sin GPU.
- Ejecución en CPU: transcribe aproximadamente 40× tiempo real sobre cuatro hilos de CPU, con 0,73 s por ventana de 30 s usando el decoder de 4 capas.
- Despliegue: transformers (Python), ONNX Runtime y transformers.js (WebGPU o WASM en navegador); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~40× tiempo real en CPU de cuatro hilos; tiempos por ventana detallados en la tabla de selección de profundidad del decoder.

## Comparativa con modelos similares

| Modelo | Parametros | WER eval-d1 | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ozen-v1 | 60,7 M | 8,59 % | ventanas de 30 s | Apache-2.0 | HuggingFace, ONNX |
| whisper-small | 242 M | 29,93 % | ventanas de 30 s | Apache-2.0 | OpenAI, HuggingFace |
| whisper-base | 73 M | 48,32 % | ventanas de 30 s | Apache-2.0 | OpenAI, HuggingFace |
| ivrit.ai turbo | 809 M | 5,5 % | ventanas de 30 s | según ivrit.ai | HuggingFace (ivrit.ai) |

Ozen-v1 ofrece un equilibrio entre tamaño y precisión muy favorable en hebreo: supera ampliamente a Whisper base y small (que, según la tarjeta, no funcionan bien en hebreo con sus vocabularios originales) y se acerca al modelo de 809 M del que se destila, con 13 veces menos parámetros.

## Limitaciones y advertencias

- Hereda las convenciones de su profesor: puntuación propia y palabras en inglés ocasionalmente escritas en letras latinas.
- Transcribe únicamente hebreo; el profesor escribe el habla en inglés como transliteración a letras hebreas, por lo que Ozen puede hacer lo mismo.
- En habla rápida y densa un decoder pequeño puede omitir alguna frase dentro de una ventana; se observó en un predecesor de dos capas, y aunque el decoder de cuatro capas puede reducirlo, no se ha medido por separado.
- Exportaciones ONNX: un decoder en fp16 falla al cargar en ONNX Runtime y un encoder en int8 carga pero altera la transcripción; solo se distribuyen las combinaciones verificadas.
- Diseñado para ventanas de audio de hasta 30 segundos; el audio más largo debe cortarse en ventanas solapadas y unirse, descartando una frase repetida en la costura.
- No dispone de tokens de idioma ni de tarea, por lo que hay que invocar el `generate` genérico y no la API habitual de Whisper.
- Licencia de pesos Apache-2.0, pero el audio y las transcripciones de entrenamiento provienen de ivrit.ai bajo su propia licencia, que permite entrenar modelos (incluido uso comercial) y exige atribución. FLEURS es CC-BY-4.0 y `imvladikon/hebrew_speech_kan` no declara licencia en el Hub (aportó el 3 % del audio).
- Riesgo de alucinación inherente a la decodificación de voz: en pasajes ambiguos o con ruido puede generar texto plausible no presente en el audio.
- El modelo no ha publicado datos de descargas ni valoraciones; su uso en producción debería validarse contra el dominio concreto de despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/itayinbar/Ozen-v1
- Modelo base: https://huggingface.co/openai/whisper-base
- ivrit.ai: https://www.ivrit.ai/
- Licencia de ivrit.ai: https://www.ivrit.ai/en/the-license/
- Leaderboard de transcripción en hebreo de ivrit.ai: https://huggingface.co/spaces/ivrit-ai/hebrew-transcription-leaderboard
- Repositorio de audios de entrenamiento: https://huggingface.co/datasets/ivrit-ai/audio-v2
- Web del autor: https://itayinbar.com/
- Perfil del autor en HuggingFace: https://huggingface.co/itayinbar/models
- Perfil del autor en GitHub: https://github.com/itayinbarr
