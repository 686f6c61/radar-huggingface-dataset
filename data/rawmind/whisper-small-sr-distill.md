# rawmind/whisper-small-sr-distill

## Resumen

whisper-small-sr-distill es un modelo de reconocimiento automatico del habla (ASR) desarrollado por el usuario rawmind, consistente en una destilacion de Whisper large-v3-turbo sobre la arquitectura de Whisper small, especializada en serbio y croata. El objetivo es conservar el tamano y la velocidad de Whisper small (241,7 millones de parametros) reduciendo de forma sustancial la tasa de error en serbio, idioma escasamente cubierto por los modelos Whisper originales. El autor lo describe explicitamente como un experimento, no como un modelo de produccion.

La relevancia del modelo reside en su relacion calidad/tamano: mantiene la misma latencia que Whisper small (212 ms frente a 211 ms por clip en una GPU M4 Max con whisper.cpp) pero reduce la tasa de error de palabras (WER) en serbio de 38,1 a 24,6 en FLEURS limpio, y de 28,5 a 22,1 en discurso parlamentario real. Frente al profesor large-v3-turbo (1,6 GB y aproximadamente 2,3 veces mas lento), el estudiante queda lejos en precision pero ofrece un perfil mucho mas ligero para despliegue en hardware modesto.

El modelo se distribuye en formato Transformers (fp16, safetensors) y en formato GGML para whisper.cpp, con licencia MIT. Soporta oficialmente serbio, croata e ingles, aunque el entrenamiento se concentro casi exclusivamente en serbio (2.944 clips) frente a 200 clips de croata y 200 de ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder para ASR), destilado de Whisper large-v3-turbo |
| Parametros totales | 241.734.912 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de Whisper small, 30 s por defecto; soporta `audio_ctx` reducido en whisper.cpp) |
| Tipos de cuantizacion | fp16 (Transformers); GGML para whisper.cpp (variantes derivadas del formato GGML estandar) |
| Idiomas soportados | serbio (sr), croata (hr), ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (Transformers, fp16) y GGML (`ggml-small-sr-distill.bin` para whisper.cpp) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura encoder-decoder de Whisper small (OpenAI, Apache-2.0) y se entrena mediante destilacion de conocimiento desde Whisper large-v3-turbo (MIT) como profesor. La funcion de perdida combina entropia cruzada sobre las transcripciones humanas de FLEURS y divergencia KL frente a los 64 tokens mas probables del profesor (temperatura 2), con peso equitativo entre ambas componentes. El optimizador es AdamW con tasa de aprendizaje 2e-5 y decaimiento coseno, durante 1.353 pasos con batch de 4 (1,6 epocas), sobre una Apple M4 Max.

Los datos de entrenamiento son unicamente FLEURS (CC-BY-4.0): 2.944 clips de serbio, 200 de croata y 200 de ingles. Las transcripciones serbias se convirtieron a alfabeto latino, por lo que la salida esperada es mayoritariamente en script latino. No se menciona uso de RLHF ni DPO; el entrenamiento es puramente supervisado mas destilacion. No se documentan innovaciones arquitectonicas adicionales mas alla de la propia destilacion.

## Capacidades

- Reconocimiento automatico del habla (transcripcion) en serbio, croata e ingles.
- Transcripcion de habla leida limpia (FLEURS) y de habla real (discurso parlamentario de ParlaSpeech-RS).
- Robustez moderada frente a ruido rosa artificial a 10 dB y 5 dB de SNR, con degradacion controlada respecto a Whisper small.
- Funcionamiento con contexto de audio reducido (`audio_ctx` ajustado a la duracion del clip mas un segundo), util en maquinas lentas.
- Compatibilidad con whisper.cpp mediante el fichero GGML incluido.
- No soporta tool calling, function calling, agentes, vision ni audio mas alla de la transcripcion ASR.
- No dispone de modo thinking ni capacidades multimodales.

## Casos de uso

- Transcripcion de reuniones y actas en serbio y croata: el modelo mantiene la latencia de Whisper small (212 ms por clip) y reduce el WER a 22,1 en discurso parlamentario real, lo que lo hace adecuado para generar borradores de actas que luego se revisan manualmente.
- Subtitulado de contenido audiovisual en serbio: con 241,7 millones de parametros y formato GGML, puede ejecutarse en portatiles y equipos sin GPU dedicada, permitiendo generar subtitulos en alfabeto latino de forma local.
- Archivado y busqueda de audio historico o institucional: su buen comportamiento en habla real (ParlaSpeech-RS) lo hace util para indexar grabaciones parlamentarias o entrevistas y habilitar busqueda por texto.
- Preprocesado de datasets ASR en serbio: sirve como anotador automatico de bajo coste para generar transcripciones preliminares que despues se corrigen, dado su equilibrio entre velocidad y calidad.
- Transcripcion en dispositivos con recursos limitados: al caber en el formato small de whisper.cpp, puede desplegarse en moviles, Raspberry Pi o CPUs modestas para dictado y notas de voz.
- Evaluacion comparativa de tecnicas de destilacion: el codigo de entrenamiento y los resultados en bruto estan publicados en el repositorio de GitHub del autor, lo que lo convierte en una referencia reproducible para experimentos de destilacion ASR en idiomas de bajos recursos.
- Procesamiento de audio con ruido controlado: con WER de 29,1 a 10 dB y 36,3 a 5 dB, puede emplearse en entornos con ruido de fondo moderado siempre que se valide el caso concreto.

## Benchmarks y rendimiento

Resultados de WER en % (menor es mejor), whisper.cpp 1.9.6, con intervalo bootstrap del 95 % sobre los clips. Pruebas en serbio:

| Prueba serbia | Clips | Este modelo | Whisper small | large-v3-turbo |
|---|---|---|---|---|
| FLEURS, habla leida limpia | 400 | 24,6 (23,2-25,9) | 38,1 (36,6-39,7) | 13,2 (12,4-14,2) |
| Parliament, habla real | 150 | 22,1 (20,2-24,0) | 28,5 (26,2-30,7) | 10,1 (8,8-11,5) |
| FLEURS + ruido rosa, 10 dB | 100 | 29,1 (26,6-31,8) | 43,0 (40,2-45,9) | 16,9 (14,9-19,0) |
| FLEURS + ruido rosa, 5 dB | 100 | 36,3 (33,2-39,4) | 50,5 (47,5-53,7) | 19,9 (17,7-22,2) |
| FLEURS, contexto reducido | 100 | 27,9 (24,4-32,2) | 39,3 (36,3-42,5) | 22,1 (16,7-28,2) |
| Parliament, contexto reducido | 100 | 22,4 (20,0-25,0) | 27,4 (24,7-30,2) | 15,9 (12,9-19,7) |

Comparativa multilingue (WER en %, 100 clips de test FLEURS por idioma, serbio en script latino):

| Modelo | Serbio | Croata | Ingles |
|---|---|---|---|
| Whisper small | 38,2 | 35,2 | 7,0 |
| Este modelo | 24,6 | 23,6 | 7,5 |
| Whisper large-v3-turbo (profesor) | 12,4 | 11,1 | 5,5 |

Velocidad: 212 ms por clip frente a 211 ms de Whisper small en una GPU M4 Max con whisper.cpp. El profesor large-v3-turbo ocupa 1,6 GB y es aproximadamente 2,3 veces mas lento.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp16 para los pesos de Transformers (241,7 millones de parametros); el repo completo ocupa 1,0 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; funciona en A100, H100, RTX 4090 y GPUs de gama media sin problema por tamano.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, GTX 1660, e incluso en CPU y Apple Silicon.
- Opciones de despliegue: transformers (pipeline `automatic-speech-recognition`), whisper.cpp mediante `ggml-small-sr-distill.bin`, y cualquier runtime compatible con GGML/GGUF de Whisper. No se documenta soporte explicito para vLLM, TGI u Ollama.
- Latencia y throughput: 212 ms por clip en M4 Max GPU con whisper.cpp, practicamente identico a Whisper small. No se publican cifras de throughput por segundo de audio ni de latencia en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | WER serbio (FLEURS) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-small-sr-distill | 241,7 M | 30 s (reducible via `audio_ctx`) | 24,6 | MIT | Hugging Face y GGML |
| Whisper small | 241,7 M | 30 s | 38,1 | Apache-2.0 | Hugging Face, OpenAI |
| Whisper large-v3-turbo | no disponible | 30 s | 13,2 | MIT | Hugging Face, OpenAI |

Frente a Whisper small, este modelo mejora el WER en serbio en 13,5 puntos y en croata en 11,6 puntos, manteniendo el mismo tamano y velocidad, a costa de 0,5 puntos en ingles. Frente a large-v3-turbo, pierde precision (24,6 frente a 13,2 en FLEURS serbio) pero ocupa aproximadamente una sexta parte del tamano y es unas 2,3 veces mas rapido.

## Limitaciones y advertencias

- El autor lo describe como un experimento, no como un modelo de produccion.
- Entrenado unicamente con FLEURS (habla leida limpia); el ruido empleado es rosa artificial. Musica, video y conversaciones con varias personas no estan probados.
- Cobertura de entrenamiento muy desequilibrada: 2.944 clips de serbio frente a 200 de croata y 200 de ingles. Otros idiomas no estan probados y pueden ser peores que Whisper small.
- Deteccion de idioma deficiente: en 50 clips serbios respondio croata 35 veces y serbio 14. Es imprescindible fijar el idioma manualmente (`-l sr`).
- Genera texto en audio sin habla: en cinco clips sin voz, todos los modelos probados escribieron texto. Es necesario filtrar el audio silencioso antes de usar el modelo.
- Las diferencias de aproximadamente 1 punto en las tablas de 100 clips no son estadisticamente significativas.
- La salida esperada es mayoritariamente en alfabeto latino, ya que las transcripciones de entrenamiento se convirtieron a script latino; puede producir gibberish con mezcla de scripts en casos limite.
- Riesgo de alucinacion en segmentos sin habla o con ruido extremo, comun en modelos Whisper.
- Licencia MIT: permite uso comercial, pero el modelo base Whisper small es Apache-2.0 y el profesor large-v3-turbo es MIT; conviene revisar las condiciones de los datasets (FLEURS CC-BY-4.0, ParlaSpeech-RS CC-BY-4.0) si se redistribuyen derivados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rawmind/whisper-small-sr-distill
- Codigo de entrenamiento y resultados en bruto: https://github.com/rawmind/whisper-distill-sr
- Modelo base: https://huggingface.co/openai/whisper-small
- Profesor (large-v3-turbo): https://huggingface.co/openai/whisper-large-v3-turbo
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Dataset ParlaSpeech-RS: https://huggingface.co/datasets/classla/ParlaSpeech-RS
