# Kaousheik/tempo-sft-stage1

## Resumen

TEMPO-sft-stage1 es un modelo de lenguaje de audio a texto desarrollado por Kaousheik Jayakumar, investigador de la University of Maryland, como parte del trabajo "TEMPO: Temporally-grounded Multi-task Post-training for Large Audio-Language Models". El modelo se construye sobre Audio Flamingo 3 de NVIDIA, un modelo que combina un encoder de audio Whisper-large congelado con el LLM Qwen2-7B, e incorpora un proyector multimodal sensible al tiempo que permite generar timestamps a resolución de 0,1 segundos mediante alrededor de 600 tokens atómicos de timestamp. Este checkpoint corresponde a la primera etapa de entrenamiento supervisado (SFT) con datos sintéticos, diseñada para calibrar la capacidad temporal del modelo antes de exponerlo a datos reales.

El modelo resuelve cinco tareas temporales de audio en un único marco: transcripción de voz multi-hablante con timestamps, diarización de hablantes, grounding temporal de eventos de audio, captioning denso de audio y captioning musical con atributos de instrumento, tempo y acordes. Su relevancia radica en que los LALMs (large audio-language models) existentes fallan sistemáticamente en tareas temporales básicas, y TEMPO aborda este problema mediante un post-entrenamiento específico con anotaciones temporales de alta resolución. Con 8,27 mil millones de parámetros, el modelo se distribuye en formato safetensors y está pensado para investigación académica no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio Flamingo 3 (encoder Whisper-large congelado + LLM Qwen2-7B) con proyector temporal multimodal |
| Parametros totales | 8.271.605.248 (8,27 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors (pesos completos) |
| Idiomas soportados | no disponible (no especificado en la model card) |
| Licencia | nvidia-research-only (uso exclusivo para investigacion academica no comercial) |
| Formato de pesos | safetensors + time_proj.pt (proyector temporal separado) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Audio Flamingo 3: un encoder de audio Whisper-large congelado que extrae características acusticas, un LLM Qwen2-7B que genera texto, y un proyector multimodal que conecta ambos. La innovacion principal es el proyector temporal ("time-aware projector"), cuyos pesos se distribuyen en un fichero separado `time_proj.pt` y que incorpora codificaciones sinusoidales de wall-clock. Este proyector permite generar tokens de timestamp a resolucion de 0,1 segundos, con alrededor de 600 tokens atomicos que se intercalan con el texto de salida.

El entrenamiento de esta etapa (Stage 1) se realizo sobre 51.512 ejemplos sinteticos del dataset `Kaousheik/tempo`, con 2 epocas y una tasa de aprendizaje de 1e-4. La model card indica que esta etapa se concibe como una "calibracion temporal" previa a la introduccion de datos reales en la etapa SFT 2. El checkpoint incluye los pesos fusionados tras aplicar LoRA, por lo que no es necesario cargar adaptadores adicionales, pero el proyector temporal debe cargarse manualmente junto al checkpoint principal.

## Capacidades

- Transcripcion multi-hablante con timestamps: genera transcripciones segmentadas con marcas temporales de inicio y fin por segmento, activadas mediante el tag `[speech:asr]`.
- Diarizacion de hablantes: identifica y etiqueta los hablantes con sus intervalos temporales correspondientes (`[speech:diar]`).
- Grounding temporal de audio: localiza el intervalo exacto de un evento acustico dado un texto descriptivo (`[audio:ground]`).
- Captioning denso de audio: produce descripciones detalladas de los eventos acusticos con sus timestamps (`[audio:caption]`).
- Captioning musical con timestamping: genera anotaciones de instrumentos, tempo, acordes y estadisticas musicales en intervalos temporales (`[audio:music]`).
- Interfaz audio-text-to-text: el modelo recibe audio como entrada y produce texto con tokens de timestamp intercalados.
- Soporte de tool calling o agentes: no disponible (no se menciona en la documentacion).
- Capacidades multilingues: no disponible (no se especifica idioma de entrenamiento o soporte).

## Casos de uso

- Anotacion automatica de reuniones: el modelo puede transcribir reuniones multi-hablante y generar timestamps por turno, facilitando la busqueda de momentos concretos. Su diarizacion integrada elimina la necesidad de herramientas externas de separacion de voces.
- Analisis de audio en videovigilancia: mediante el grounding temporal, se puede localizar eventos especificos ("cristal roto", "disparo") dentro de grabaciones largas, reduciendo el tiempo de revision manual.
- Generacion de subtitulos descriptivos para personas con discapacidad auditiva: el captioning denso de audio produce descripciones textuales de sonidos no verbales (alarma, llanto, motor) con sus intervalos, mejorando la accesibilidad de contenidos audiovisuales.
- Investigacion en acustica y psicoacustica: permite anotar automaticamente conjuntos de datos de audio con eventos temporales, acelerando la creacion de datasets de entrenamiento para otros modelos.
- Analisis musical automatizado: el captioning musical con atributos de instrumento, tempo y acordes por intervalos es util para catalogar bibliotecas de musica o para sistemas de recomendacion basados en estructura temporal.
- Evaluacion de sistemas de audio: puede utilizarse para validar la calidad de sistemas de diarizacion o de deteccion de eventos comparando sus salidas con las anotaciones temporales del modelo.

## Benchmarks y rendimiento

Los resultados reportados en la model card para el checkpoint Stage 1 SFT son los siguientes:

| Metrica | Valor |
|---|---|
| ASR MAE (error medio absoluto en timestamps) | 2,42 |
| mIoU (mean Intersection over Union en grounding temporal) | 41,7 |
| WER (Word Error Rate) | 94,0 |
| DER (Diarization Error Rate) | 74,3 |
| dense-cap eF1 (F1 extendido en captioning denso) | 47,6 |
| grounding F1 | 34,3 |

No se proporcionan comparaciones con otros modelos en la informacion disponible. Nota: el valor de WER de 94,0 es extraordinariamente alto (idealmente deberia ser cercano a 0), lo que sugiere que podria tratarse de una metrica inversa o de una evaluacion sobre un subset dificil. No se puede interpretar sin contexto adicional.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8,27 B de parametros en fp16, el peso del checkpoint ocupa aproximadamente 16,5 GB, por lo que se necesitan al menos 20-24 GB de VRAM para inferencia con batch 1.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 40 GB, H100 80 GB. En GPUs con menos de 24 GB no cabe en fp16 sin cuantizacion.
- Si cabe en GPU de consumidor: si, en una RTX 4090 o RTX 3090 (24 GB) se puede ejecutar con fp16, aunque con margen limitado para el contexto de audio.
- Opciones de despliegue: al ser un modelo audio-text-to-text, no es compatible directamente con vLLM, llama.cpp u Ollama (que estan orientados a texto). Se recomienda usar el codigo de inferencia de Audio Flamingo 3 o implementar un servidor con Transformers + el proyector temporal.
- Latencia y throughput estimados: no disponibles. Al ser un modelo de 8 B, la latencia de generacion de texto sera de varios segundos por respuesta en GPU consumer.

## Comparativa con modelos similares

No se dispone de resultados comparativos publicados para este checkpoint en la informacion proporcionada. El modelo base es Audio Flamingo 3, que comparte arquitectura y parametros, pero no se han publicado comparaciones directas entre TEMPO y otros modelos de audio como Qwen2-Audio, SALMONN o llama-audio. La comparativa queda pendiente de futuros benchmarks publicados por el autor.

## Limitaciones y advertencias

- Licencia de investigacion: el modelo se publica bajo licencia `nvidia-research-only`, lo que prohibe explicitamente cualquier uso comercial o industrial. Solo puede utilizarse para investigacion academica no comercial.
- Sesgos y alucinaciones: como todos los modelos de lenguaje, puede generar alucinaciones en las transcripciones o descripciones, especialmente en audios complejos con solapamiento de hablantes o ruido de fondo.
- Limitaciones de idioma: no se especifican los idiomas soportados, pero el modelo base Qwen2-7B esta principalmente entrenado en ingles y chino; el rendimiento en otros idiomas no esta garantizado.
- Dependencia del proyector temporal: el modelo requiere cargar `time_proj.pt` manualmente; si se omite, el modelo no funcionara correctamente, ya que los tokens de timestamp no se generaran.
- Rendimiento temporal limitado: el Stage 1 se entreno solo con datos sinteticos, por lo que el rendimiento en audios reales puede degradarse (WER alto de 94,0 en la evaluacion reportada sugiere problemas de robustez).
- Restricciones de datos: los conjuntos de entrenamiento tienen licencias CC BY 4.0 y CC BY-NC 3.0, lo que limita su uso comercial incluso si se obtuviera una licencia del modelo.
- Estado experimental: el modelo tiene 0 descargas y 0 likes en Hugging Face, lo que indica que es una publicacion muy reciente y sin validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kaousheik/tempo-sft-stage1
- Dataset de entrenamiento: https://huggingface.co/datasets/Kaousheik/tempo
- Modelo base (Audio Flamingo 3): https://huggingface.co/nvidia/audio-flamingo-3
- Perfil del autor: https://huggingface.co/Kaousheik
- Pagina personal del autor: https://kaousheik-26.github.io/
- Pagina de investigacion (con paper TEMPO): https://kaousheik-26.github.io/research/
