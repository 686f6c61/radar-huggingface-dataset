# sanaon/Qwen3-ASR-1.7B-JA-Anime-Galgame-hf

## Resumen

Qwen3-ASR-1.7B-JA-Anime-Galgame-hf es una conversión al formato nativo de Hugging Face Transformers del modelo `jaykwok/Qwen3-ASR-1.7B-JA-Anime-Galgame`, un ajuste fino del checkpoint Qwen3-ASR-1.7B de Alibaba orientado al reconocimiento automático de habla (ASR) en japonés dentro del dominio del anime y las novelas visuales (galgames). Lo publica el usuario `sanaon` y su aportación principal no es un nuevo entrenamiento, sino reescribir la disposición del repositorio para que el modelo pueda cargarse directamente con `AutoModelForMultimodalLM` y `AutoProcessor` de Transformers, sin depender del wrapper `qwen-asr` original.

El modelo resuelve un problema muy concreto: la transcripción de audio japonés con vocabulario, entonación y fenómenos acústicos propios del anime y los galgames, un dominio en el que los ASR genéricos fallan con frecuencia. Con 2.038.052.480 parámetros (unos 2,04 mil millones) y un repositorio de 4,1 GB en safetensors, mantiene la arquitectura multimodal audio-texto del Qwen3-ASR original: una torre de audio, un proyector multimodal y un modelo de lenguaje.

Es relevante ahora porque, además del ASR, el repositorio incluye tres cabezas CTC opcionales de alineamiento forzado entrenadas sobre el encoder de este ajuste fino, lo que permite obtener marcas temporales por carácter para subtitulado. La licencia es Apache 2.0 y el modelo está etiquetado únicamente para japonés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal audio-texto (torre de audio + proyector multimodal + modelo de lenguaje), basada en Qwen3-ASR |
| Parametros totales | 2.038.052.480 (707 tensores, 4.076.104.960 bytes en safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | japonés (`ja`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (diseño nativo Transformers, requiere `transformers >= 5.13.0`) |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema de Qwen3-ASR: un encoder de audio que produce representaciones acústicas, un proyector multimodal de dos capas lineales (`model.multi_modal_projector.linear_1` y `linear_2`) que las alinea con el espacio del modelo de lenguaje, y un decoder de lenguaje (`model.language_model`) que genera la transcripción. La conversión no modifica los pesos ajustados: solo reescribe las claves de los tensores (`thinker.audio_tower.*` a `model.audio_tower.*`, `thinker.model.*` a `model.language_model.*`) y sustituye config, processor y tokenizer por los de la plantilla oficial `Qwen/Qwen3-ASR-1.7B-hf`.

El ajuste fino original se realizó sobre el checkpoint Qwen3-ASR-1.7B no-`-hf`, especializándolo en audio de anime y galgames. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO. Como innovación destacable, el repositorio incorpora tres cabezas CTC de alineamiento forzado (3,98 M, 3,98 M y 3,84 M parámetros) que operan sobre el encoder congelado: `ctc_aligner.pt` (cabeza general, vocabulario de 2.328 clases con puntuación), `ctc_aligner_jav_vocalisation_v2.pt` (2.603 clases, vocalizaciones no semánticas tratadas como blank) y `ctc_aligner_jav_vocalisation_v3.pt` (2.603 clases más 3 clases de frame: silencio, vocalización y habla). Estas cabezas son específicas de este encoder y no transfieren a otros checkpoints.

## Capacidades

- Reconocimiento automático de habla en japonés, con especialización en audio de anime, galgames y contenido audiovisual japonés.
- Transcripción guiada por idioma mediante `processor.apply_transcription_request(audio=..., language="Japanese")`.
- Salida en formato de solo transcripción (`return_format="transcription_only"`).
- Alineamiento forzado a nivel de carácter mediante las cabezas CTC opcionales, para obtener marcas temporales dentro de la ventana de segmento que devuelve el ASR.
- Distinción por frame entre silencio, vocalización no semántica y habla (solo en la cabeza v3).
- Manejo de vocabulario acústico sin puntuación en las cabezas JAV (la puntuación tiene anchura acústica cero).
- Carga nativa con Transformers (`AutoModelForMultimodalLM`, `AutoProcessor`), sin wrapper externo.
- No se documentan tool calling, function calling, capacidades de agente, visión ni audio más allá del ASR.

## Casos de uso

- Subtitulado de anime y galgames: el ASR genera el texto y las cabezas CTC proporcionan el tiempo por carácter dentro de cada ventana, sustituyendo el reparto proporcional por una medición real.
- Localización de videojuegos japoneses: transcripción de pistas de voz para extraer guiones y facilitar su traducción, con un vocabulario adaptado al dominio.
- Archivado y búsqueda de contenido audiovisual japonés: indexación de audio en texto para permitir búsqueda por palabras clave en catálogos de anime o novelas visuales.
- Generación de subtítulos para contenido con vocalizaciones no semánticas: la cabeza v2 evita que gemidos u otros sonidos se transcriban como palabras, y la v3 además etiqueta cada tramo como silencio, vocalización o habla.
- Control de calidad de transcripciones existentes: el alineamiento forzado permite comparar tiempos reales con los de un subtítulo ya publicado y detectar desincronizaciones.
- Investigación en ASR de dominio específico: sirve como punto de partida para estudiar adaptación de dominio sobre Qwen3-ASR y como referencia de conversión a formato nativo de Transformers.
- Preprocesado de datasets de voz japonesa: transcripción y alineamiento masivo de audio para construir corpus anotados temporalmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 2,04 mil millones de parámetros en safetensors, los pesos en fp16 ocupan aproximadamente 4,1 GB; en fp32, unos 8,2 GB. Hay que sumar la memoria del encoder de audio y de las activaciones, que no se cuantifica en la documentación.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, el modelo entra en GPUs de consumo con suficiente VRAM, pero no se documentan modelos concretos.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas con 8 GB o más en fp16, aunque el dato no está confirmado por el autor.
- Opciones de despliegue: carga nativa con `transformers >= 5.13.0` mediante `AutoModelForMultimodalLM` y `AutoProcessor`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| sanaon/Qwen3-ASR-1.7B-JA-Anime-Galgame-hf | 2.038.052.480 | no disponible | ja | Apache 2.0 | safetensors (Transformers nativo) | Incluye cabezas CTC de alineamiento |
| jaykwok/Qwen3-ASR-1.7B-JA-Anime-Galgame | no disponible | no disponible | ja | no disponible | layout original Qwen3-ASR | Requiere wrapper `qwen-asr`; sin cabezas CTC publicadas en esta ficha |
| Qwen/Qwen3-ASR-1.7B-hf | no disponible | no disponible | no disponible | no disponible | safetensors (Transformers nativo) | Modelo base oficial, sin ajuste de dominio anime/galgame |

## Limitaciones y advertencias

- Modelo especializado únicamente en japonés; no se declara soporte para otros idiomas.
- El ajuste fino está orientado a anime y galgames; su comportamiento fuera de ese dominio no está documentado y puede degradarse.
- Las cabezas CTC son específicas de este encoder y no funcionan con `Qwen/Qwen3-ASR-1.7B-hf` ni con otros ajustes finos.
- Las cabezas JAV v2 y v3 están entrenadas con contenido NSFW; su uso debe evaluarse según el contexto de despliegue.
- Riesgo de alucinación y de errores de transcripción inherente a los modelos generativos de ASR; no se documentan tasas de error.
- No se publican datos sobre sesgos, robustez ante ruido, acentos o calidad de audio variable.
- Requiere `transformers >= 5.13.0`; versiones anteriores no cargan el modelo de forma nativa.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni documenta limitaciones de responsabilidad adicionales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sanaon/Qwen3-ASR-1.7B-JA-Anime-Galgame-hf
- Modelo de origen: https://huggingface.co/jaykwok/Qwen3-ASR-1.7B-JA-Anime-Galgame
- Plantilla oficial del formato nativo: https://huggingface.co/Qwen/Qwen3-ASR-1.7B-hf
