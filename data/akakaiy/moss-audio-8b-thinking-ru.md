# akakaiy/MOSS-Audio-8B-Thinking-ru

## Resumen

MOSS-Audio-8B-Thinking-ru es un ajuste fino mediante LoRA del modelo multimodal de audio OpenMOSS-Team/MOSS-Audio-8B-Thinking, desarrollado por el usuario akakaiy y publicado en Hugging Face. El objetivo es corregir el bajo rendimiento del modelo base en ruso, tanto en reconocimiento de voz como en comprensión de canciones, sonidos cotidianos y emociones. El modelo resultante conserva la capacidad del original para describir el contenido completo del audio (música, ruido de fondo, tono de voz) y mejora de forma notable la transcripción de ruso conversacional y ruidoso.

La relevancia actual del modelo radica en su enfoque: no compite con transcriptores puros como Whisper o GigaAM en habla limpia, sino que cubre el hueco de la comprensión semántica del audio en ruso. Según los datos del autor, en habla ruidosa y de campo lejano (dev-300) alcanza un CER del 6,46 %, frente al 8,32 % de Whisper large-v3 y el 10,96 % del modelo base. Incluye cuantizaciones GGUF listas para usar con CrispASR y una LoRA PEFT para integración con transformers.

El modelo tiene 9.052.463.488 parámetros, un repositorio de 56 GB y soporta ruso e inglés. Se distribuye bajo licencia "other" heredada del modelo base, con pesos en safetensors y GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal audio-texto; el ajuste es una LoRA sobre el LLM y un adaptador de audio completo) |
| Parametros totales | 9.052.463.488 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q6_K, Q8_0, Q5_K, Q4_K, F16; NF4 para carga con transformers + PEFT |
| Idiomas soportados | ru, en (el ajuste se centra en ruso; conserva capacidades del base en otros idiomas para canciones) |
| Licencia | other |
| Formato de pesos | safetensors, GGUF, adaptador PEFT (LoRA) |

## Arquitectura y entrenamiento

El modelo parte de MOSS-Audio-8B-Thinking, un modelo multimodal que procesa audio y genera texto, con un codificador de audio y un LLM subyacente. El ajuste se realizó con QLoRA sobre una única RTX 3090: el LLM en 4 bits NF4, el codificador de audio sin tocar en la primera ronda y entrenado por completo en la versión v3. La LoRA tiene rango 64 sobre el LLM, y el adaptador de audio se entrena de forma completa en la última iteración.

El entrenamiento de la versión v3 (11.11.2026) se hizo en dos rondas: una primera de aproximadamente 1.450 horas, mayoritariamente de habla rusa (NVIDIA Granary, Sber Golos, radio) y habla mezclada con música; y una segunda de unas 600 horas centrada en las debilidades detectadas: emociones, sonidos cotidianos, canciones con letras verificadas y algo de habla leída. El adaptador fue entrenado sobre el modelo en 4 bits, por lo que cargarlo en bf16 degrada el CER en aproximadamente un punto; el GGUF se fusionó teniendo esto en cuenta.

El autor publica un parche para el backend moss-audio de CrispASR que corrige varios problemas del flujo upstream: el padding de clips a 30 segundos (que provocaba respuestas vacías en clips cortos), el límite fijo de 512 tokens de generación, y la ausencia de control sobre el presupuesto de pensamiento y la repetición de frases.

## Capacidades

- Reconocimiento de voz en ruso, con especial rendimiento en habla ruidosa, de campo lejano y conversacional (podcasts, llamadas, mensajes de voz).
- Transcripción de canciones en ruso y en otros idiomas (inglés, español, alemán, francés), con letras verificadas en el entrenamiento para el ruso.
- Descripción del contenido de audio: música, sonidos ambientales, ruido de fondo y tono de voz.
- Reconocimiento de emociones en el habla (aunque ligeramente por debajo del modelo base según las métricas del autor).
- Identificación de sonidos cotidianos (evaluado con ESC-50).
- Generación de descripciones de audio evaluadas por jueces ciegos (música, sonido, voz).
- Soporte de modo "thinking" con presupuesto de tokens configurable (CRISPASR_MOSS_THINK_BUDGET).
- Transcripción verbatim con prompt personalizable y salida en JSON.
- Capacidades multilingües parciales heredadas del modelo base, especialmente para canciones.

## Casos de uso

- Transcripción de mensajes de voz y llamadas en ruso: el modelo está entrenado específicamente para habla ruidosa y de telefonía; a través del códec G.711 el CER en dev-300 baja del 16,5 % del base al 9,5 %, lo que lo hace adecuado para asistentes personales que procesan audio de mensajería.
- Asistencia personal con comprensión contextual del audio: a diferencia de un transcriptor puro, puede describir qué música suena, qué ruido de fondo hay y qué tono emplea el hablante, lo que permite respuestas más ricas en un asistente conversacional.
- Análisis de podcasts y programas de radio en ruso: con un CER del 6,46 % en dev-300 (podcasts, ruido, campo lejano), es viable para generar transcripciones y resúmenes de contenido hablado no limpio.
- Procesamiento de canciones y letras: permite transcribir letras de canciones rusas con un CER del 24,5 % en artistas no vistos, útil para catalogación musical, karaoke o subtitulado aproximado.
- Moderación y análisis de contenido audiovisual: la detección de emociones y la descripción de sonidos permiten clasificar llamadas o clips según el tono y el entorno.
- Accesibilidad y subtitulado en entornos ruidosos: su ventaja en habla de campo lejano y telefonía lo hace útil para subtitular grabaciones de reuniones o llamadas con calidad de audio deficiente.
- Investigación en ASR multilingüe: sirve como punto de comparación para estudiar el comportamiento de modelos multimodales de audio en ruso frente a especializados como GigaAM o Whisper.

## Benchmarks y rendimiento

Datos proporcionados por el autor, medidos con el GGUF Q6 en una RTX 3080 mediante CrispASR parcheado con `CRISPASR_MOSS_CONTENT_ONLY=1`, sobre clips no vistos en entrenamiento. Menor es mejor.

| Prueba | Whisper large-v3 | GigaAM v3 | MOSS base | v2 | v3 |
|---|---|---|---|---|---|
| FLEURS-ru (CER-num) | 0,93 % | 1,07 % | 4,14 % | 3,54 % | 2,42 % |
| dev-300: ruidoso, campo lejano, podcasts (CER-num) | 8,32 % | 3,13 % | 10,96 % | 7,65 % | 6,46 % |
| Canciones rusas, artistas no vistos (CER) | 69,2 % | 17,2 % | 35,1 % | 24,6 % | 24,5 % |
| Canciones en en/es/de/fr, jam-alt (CER) | no disponible | no disponible | 19,1 % | 22,0 % | 20,5 % |
| ESC-50: nombra el sonido | no disponible | no disponible | 67 % | 64 % | 65 % |
| RESD: identifica la emoción | no disponible | no disponible | 27 % | 24 % | 24 % |
| Descripciones, juez ciego 1-5 (música / sonido / voz) | no disponible | no disponible | 3,09 / 2,83 / 2,60 | 3,26 / 2,63 / 2,69 | 3,14 / 2,70 / 2,51 |

Notas del autor: la fila del juez ciego usa 100 clips reservados descritos con los prompts de su asistente y puntuados contra descripciones humanas; una repetición mueve las puntuaciones entre 0,1 y 0,2. A través del códec telefónico G.711, dev-300 pasa del 16,5 % en el base al 9,5 % en v3. En habla leída limpia, GigaAM y Whisper siguen siendo entre 2 y 3 veces mejores; en canciones, GigaAM sigue por delante.

## Requisitos de hardware

- VRAM estimada: aproximadamente 7,7 GB con el GGUF Q6_K (LLM en Q6_K, codificador en Q8_0), según el autor.
- El Q6 cabe en una RTX 3080 de 10 GB; el Q4_K (5,75 GB) está pensado para tarjetas de 6-8 GB, aunque el autor no lo probó y advierte que el ruso puede empeorar.
- Tamaños de archivo: Q6_K 7,86 GB, Q8_0 10,4 GB, Q5_K 6,77 GB, Q4_K 5,75 GB, F16 18,1 GB.
- GPU recomendadas: RTX 3080 (probada por el autor), RTX 3090 (usada para el entrenamiento); no se especifican otras.
- Despliegue: CrispASR con `--backend moss-audio` y el parche `crispasr-moss-decode.patch`; alternativa con transformers + PEFT cargando el base con `trust_remote_code` y el LLM en 4 bits NF4, más `PeftModel.from_pretrained` sobre la subcarpeta `lora`.
- Latencia y throughput: no disponibles.
- Variables de entorno relevantes en CrispASR: `CRISPASR_MOSS_CONTENT_ONLY=1` (obligatoria), `CRISPASR_MOSS_MAX_NEW`, `CRISPASR_MOSS_THINK_BUDGET`, `CRISPASR_MOSS_LOOP_BREAK`, `CRISPASR_MOSS_REP_PENALTY`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-Audio-8B-Thinking-ru (este) | 9.052.463.488 | no disponible | Audio-texto multimodal en ruso, con descripción de sonido, música y emoción | other | Hugging Face, GGUF y LoRA |
| Whisper large-v3 | no disponible | no disponible | ASR multilingüe | no disponible | Amplia |
| GigaAM v3 | no disponible | no disponible | ASR especializado en ruso | no disponible | no disponible |
| MOSS-Audio-8B-Thinking (base) | no disponible | no disponible | Audio-texto multimodal, ruso débil | other | Hugging Face |

En habla limpia (FLEURS-ru), Whisper large-v3 (0,93 %) y GigaAM v3 (1,07 %) superan a este modelo (2,42 %). En habla ruidosa y de campo lejano (dev-300), el modelo supera a Whisper (6,46 % frente a 8,32 %) pero no a GigaAM (3,13 %). En canciones rusas, GigaAM (17,2 %) sigue muy por delante del 24,5 % de este ajuste. La ventaja diferencial frente a todos ellos es la descripción semántica del audio (sonidos, música, emoción), capacidad que los transcriptores puros no ofrecen.

## Limitaciones y advertencias

- En habla leída limpia, GigaAM y Whisper son entre 2 y 3 veces mejores; el modelo no sustituye a un ASR especializado si solo se necesitan palabras.
- En canciones rusas, GigaAM sigue siendo claramente superior (17,2 % frente a 24,5 % de CER).
- La descripción de sonidos y música es similar a la del modelo base, y la detección de emociones es ligeramente peor (24 % frente a 27 % en RESD).
- El adaptador fue entrenado sobre el modelo en 4 bits; cargarlo en bf16 degrada el CER en aproximadamente un punto.
- Las cuantizaciones Q5 y Q4 no fueron probadas por el autor y pueden degradar el rendimiento en ruso.
- Es obligatorio usar `CRISPASR_MOSS_CONTENT_ONLY=1` con CrispASR; sin ello, el modelo puede devolver respuestas vacías en clips cortos por el padding a 30 segundos del flujo upstream.
- La licencia es "other", heredada del modelo base; es necesario revisar los términos del modelo original para uso comercial.
- Los benchmarks proceden del propio autor, con un único conjunto de hardware y prompts de su asistente; no hay validación independiente.
- No se dispone de datos sobre longitud de contexto, sesgos específicos ni latencia.
- El ajuste se centra en ruso; el rendimiento en otros idiomas distintos del inglés no está documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/akakaiy/MOSS-Audio-8B-Thinking-ru
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Audio-8B-Thinking
- CrispASR (repositorio): https://github.com/CrispStrobe/CrispASR
