# nielsjaspers/whisper-large-v3-turbo-fy

## Resumen

`whisper-large-v3-turbo-fy` es un ajuste fino de `openai/whisper-large-v3-turbo` para reconocimiento automático de habla (ASR) en frisón occidental (Frysk), desarrollado por el usuario independiente nielsjaspers. El objetivo es cubrir una laguna clara: Whisper no dispone de token de idioma para el frisón, de modo que los modelos originales transcriben este idioma con una calidad muy inferior a la de lenguas mayoritarias. Este ajuste entrena todos los pesos del modelo base sobre corpus frisones reales y produce salida con mayúsculas y puntuación.

El modelo se centra en habla espontánea y grabaciones largas, no solo en lectura de textos. Para ello combina el corpus Common Voice 22 frisón (40,4 h de habla leída) con el corpus de diálogos médico-paciente FRIS (20,8 h), re-dividido por hablante para evitar contaminación entre entrenamiento y test. La arquitectura es la de Whisper large-v3-turbo: un transformer encoder-decoder con aproximadamente 809 millones de parámetros, mucho más ligero que large-v3 completo (1.550 M) gracias a la reducción de capas del decoder.

Su relevancia práctica es doble. Por un lado, demuestra que un ajuste fino bien documentado sobre hardware de consumo (un solo Apple M5 Pro de 48 GB, unas 9 horas) puede superar ampliamente a alternativas públicas para una lengua de bajos recursos: en el test largo de FRIS obtiene un 19,3 % de WER frente al 58-62 % de tres modelos frisones públicos. Por otro, publica código de entrenamiento, evaluación y generación de subtítulos SRT en un repositorio abierto, lo que facilita la reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo), ASR secuencia-a-secuencia |
| Parametros totales | 808.878.080 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Ventanas de audio de hasta 30 s (longitud nativa de Whisper); audio largo mediante troceado con VAD |
| Tipos de cuantizacion | no disponible (repo en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | Frisón occidental (fy); se decodifica con el token de idioma neerlandés (`nl`) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Whisper large-v3-turbo, un transformer encoder-decoder con atención completa sobre espectrogramas log-Mel. El encoder procesa ventanas de 30 segundos y el decoder genera tokens de texto de forma autorregresiva; la variante "turbo" recorta el número de capas del decoder respecto a large-v3, lo que reduce parámetros y latencia a costa de una ligera pérdida de capacidad en el modelo base. El ajuste fino entrena todos los pesos (no solo adaptadores), en fp32 con autocast bf16, gradient checkpointing, optimizador AdamW, learning rate 1e-5 con warmup lineal y decaimiento, 2 épocas y batch efectivo de 8 ventanas.

Los datos de entrenamiento son dos corpus: Common Voice 22 frisón (split de train, 40,4 h de habla leída) y el corpus FRIS de diálogos médico-paciente (20,8 h), re-dividido por hablante para que ningún cuidador ni paciente del test aparezca en entrenamiento. Las utterances se empaquetan en ventanas de hasta 30 s; en FRIS se conserva el orden de grabación y las pausas reales. Como Whisper carece de token `fy`, se usa el token `nl` tanto en entrenamiento como en inferencia. La selección del checkpoint se hizo por pérdida mínima en los conjuntos de desarrollo, sin usar test. El entrenamiento se ejecutó en un único Apple M5 Pro de 48 GB durante unas 9 horas.

## Capacidades

- Transcripción de voz a texto en frisón occidental con salida en mayúsculas y puntuación.
- Reconocimiento de habla leída (Common Voice) y de habla espontánea en conversaciones médico-paciente (FRIS).
- Procesamiento de audio largo mediante troceado con Silero VAD y fusión en ventanas de hasta 30 s, con marcas de tiempo por palabra.
- Generación de subtítulos SRT a través de la herramienta `fy-asr` del autor.
- Decodificación greedy y con beam search (beam size 5 documentado).
- Transcripción de muletillas ("uh") conforme a las convenciones del corpus FRIS.
- No soporta tool calling, agentes, visión, audio generation ni modo de razonamiento: es un modelo ASR puro.

## Casos de uso

- Subtitulado automático de vídeo y audio en frisón: el repositorio `fy-asr` genera SRT con marcas de tiempo por palabra, adecuado para medios locales y archivos audiovisuales.
- Documentación clínica: transcripción de conversaciones médico-paciente en frisón, el escenario para el que se entrenó con el corpus FRIS (20,5 % WER en test de diálogos).
- Entrevistas y historia oral: grabaciones domésticas de hablantes mayores, donde el modelo obtiene 34,5 % WER en el corpus Boarnsterhim, útil como primera transcripción para revisión humana.
- Accesibilidad: generación de subtítulos para contenidos educativos o institucionales dirigidos a la comunidad frisona.
- Investigación lingüística: obtención de transcripciones a escala de corpus orales frisones para análisis léxico o fonético, con revisión posterior.
- Archivística y patrimonio digital: digitalización de fondos sonoros en frisón con audio de larga duración, usando el pipeline de VAD del autor.
- Integración en pipelines de datos: transcripción por lotes de audio frisón para alimentar sistemas de búsqueda o indexación, dado el reducido tamaño (809 M de parámetros) frente a large-v3.

## Benchmarks y rendimiento

Word error rate en conjuntos de test con hablantes no vistos, tras minúsculizar y eliminar puntuación. Decodificación greedy salvo indicación.

| Conjunto de test | WER |
|---|---|
| Common Voice 17 test, 3.171 clips (habla leída) | 10,0 % |
| Common Voice 22 test, 3.173 clips (habla leída) | 9,9 % |
| FRIS test, 1.770 clips (conversaciones médico-paciente) | 20,5 % |
| FRIS long-form test, 24 grabaciones, 4,6 h | 19,3 % |
| FRIS long-form test, beam size 5 | 18,9 % |
| Boarnsterhim test, 9 hablantes, 3,1 h (entrevistas domésticas) | 34,5 % |

En el mismo test largo de FRIS, tres modelos frisones públicos obtienen entre 58 % y 62 % de WER, según el README del repositorio `fy-asr`. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de texto, ya que el modelo es exclusivamente ASR.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,6-2 GB de pesos, más overhead de activaciones; en la práctica cabe holgadamente en GPUs de 4-8 GB.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 funcionan sin problema. El autor entrenó en un Apple M5 Pro de 48 GB (unified memory).
- Cabe en GPU de consumo: sí, en modelos como RTX 3050/3060, RTX 4060/4070/4090 y equivalentes.
- Opciones de despliegue: transformers (pipeline `automatic-speech-recognition`), y por compatibilidad con Whisper, ecosistemas como faster-whisper, whisper.cpp, vLLM o TGI (no verificados por el autor en esta ficha). El autor documenta el uso vía `uv run fy-asr transcribe`.
- Latencia y throughput: no disponibles. El autor no publica cifras de RTF ni de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | WER en FRIS long-form |
|---|---|---|---|---|---|
| whisper-large-v3-turbo-fy (este) | 809 M | ventanas de 30 s | fy (token nl) | CC BY-SA 4.0 | 19,3 % (greedy) |
| openai/whisper-large-v3-turbo | 809 M | ventanas de 30 s | multilingüe, sin fy | MIT | no disponible en este test |
| openai/whisper-large-v3 | 1.550 M | ventanas de 30 s | multilingüe, sin fy | MIT | no disponible en este test |
| Modelos frisones públicos (tres, sin identificar en la información) | no disponible | no disponible | fy | no disponible | 58-62 % |

La comparación directa con Whisper large-v3-turbo y large-v3 en frisón no está publicada en la información disponible; el autor solo aporta la comparación con tres modelos frisones públicos en el test largo de FRIS.

## Limitaciones y advertencias

- Evaluado solo en habla leída y conversaciones médico-paciente; no se ha evaluado en audio de radiodifusión, telefonía ni grabaciones ruidosas.
- Rendimiento notablemente peor con hablantes mayores en entrevistas domésticas: 34,5 % WER en Boarnsterhim.
- No existe token de idioma frisón: se decodifica con `nl`, por lo que el habla neerlandesa se transcribe con el mismo token. El code-switching frisón-neerlandés no se evaluó por separado.
- Transcribe muletillas como "uh" según las convenciones del corpus FRIS, lo que puede requerir post-procesado para texto limpio.
- Licencia CC BY-SA 4.0, derivada del corpus FRIS: impone atribución y compartir-al-igual, lo que puede condicionar el uso comercial y la distribución de obras derivadas.
- Riesgo de alucinación inherente a los modelos Whisper en segmentos de silencio o ruido; no documentado específicamente por el autor.
- Sesgos no documentados en la información disponible; el corpus de entrenamiento (habla leída y diálogos médicos) no representa toda la variación dialectal del frisón.
- Proyecto desarrollado con asistencia de asistentes de código de IA (Claude Code y Codex), según declara el autor, con revisión humana de código, documentación y resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nielsjaspers/whisper-large-v3-turbo-fy
- Repositorio de código, entrenamiento, evaluación y subtítulos: https://github.com/nielsjaspers/fy-asr
- Resultados completos y construcción de test sets: https://github.com/nielsjaspers/fy-asr#results
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Repositorio de Whisper (OpenAI): https://github.com/openai/whisper
- Dataset Common Voice 22 frisón: https://huggingface.co/datasets/LokaalHub/frisian-asr-cv22
- Dataset FRIS de diálogos frisones: https://huggingface.co/datasets/Juvoly/Frisian-dialogue
- Common Voice (Mozilla): https://commonvoice.mozilla.org/
- Corpus Boarnsterhim (solo evaluación): http://hdl.handle.net/10032/tm-a3-c6
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
