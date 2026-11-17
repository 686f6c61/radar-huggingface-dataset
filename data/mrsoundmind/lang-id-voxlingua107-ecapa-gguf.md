# mrsoundmind/lang-id-voxlingua107-ecapa-gguf

## Resumen

`mrsoundmind/lang-id-voxlingua107-ecapa-gguf` es una conversión al formato GGUF del modelo `speechbrain/lang-id-voxlingua107-ecapa`, un sistema de identificación de idioma hablado (spoken language identification) basado en la arquitectura ECAPA-TDNN y entrenado sobre el corpus VoxLingua107. El modelo original lo desarrolla el equipo de SpeechBrain, mientras que esta conversión la publica el usuario mrsoundmind para su uso con el runtime `transcribe.cpp`, una implementación en C/C++ orientada a inferencia local y portátil.

El modelo resuelve una tarea concreta: dada una señal de audio de voz, devolver un ranking de etiquetas de idioma con sus probabilidades. No transcribe, no traduce y no genera texto; es un clasificador de audio. Cubre 107 idiomas y acepta audio WAV mono a 16 kHz, puntuando como máximo los últimos 30 segundos de cada clip. Con 21.244.679 parámetros totales y ficheros de entre 27 MB (Q8_0) y 85 MB (F32), es un modelo extremadamente ligero que cabe en cualquier equipo.

Su relevancia actual radica en dos factores: por un lado, la cuantización GGUF permite ejecutarlo en CPU y en GPUs integradas con un rendimiento muy alto (hasta 1319,2× tiempo real en Metal sobre un Apple M4), lo que lo hace viable para preprocesado de audio a gran escala; por otro, la licencia Apache-2.0 y la disponibilidad de una API en C facilitan su integración en pipelines de producción sin dependencias de Python.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ECAPA-TDNN (SpeechBrain) |
| Parámetros totales | 21.244.679 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; puntúa hasta los últimos 30 s de audio |
| Tipos de cuantización | F32, F16, Q8_0 |
| Idiomas soportados | 107 (ab, af, am, ar, as, az, ba, be, bg, bn, bo, br, bs, ca, ceb, cs, cy, da, de, el, en, eo, es, et, eu, fa, fi, fo, fr, gl, gn, gu, gv, ha, haw, hi, hr, ht, hu, hy, ia, id, is, it, iw, ja, jw, ka, kk, km, kn, ko, la, lb, ln, lo, lt, lv, mg, mi, mk, ml, mn, mr, ms, mt, my, ne, nl, nn, no, oc, pa, pl, ps, pt, ro, ru, sa, sco, sd, si, sk, sl, sn, so, sq, sr, su, sv, sw, ta, te, tg, th, tk, tl, tr, tt, uk, ur, uz, vi, war, yi, yo, zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (F32, F16, Q8_0) |

## Arquitectura y entrenamiento

El modelo emplea ECAPA-TDNN (Emphasized Channel Attention, Propagation and Aggregation Time Delay Neural Network), una arquitectura convolucional con atención de canal que se popularizó en el reconocimiento de hablante y que aquí se reutiliza para identificación de idioma. Respecto a la variante clásica de speaker recognition, el modelo incorpora más capas totalmente conectadas después de la capa de embedding y se entrena con pérdida de entropía cruzada, lo que según la model card original mejora la calidad de los embeddings de enunciado para tareas posteriores.

El entrenamiento se realizó sobre el dataset VoxLingua107, con grabaciones muestreadas a 16 kHz y un solo canal. La conversión GGUF está portada desde el commit upstream `0253049` (fijado el 2026-10-05) y validada contra la referencia de SpeechBrain en el commit `aa4d0f47` de `transcribe.cpp` (2026-10-08). No se dispone de información sobre el número exacto de tokens o horas de audio, la composición detallada del dataset ni si hubo etapas de ajuste fino adicionales más allá de lo indicado en la model card original.

## Capacidades

- Identificación de idioma hablado entre 107 etiquetas, devolviendo un ranking de candidatos ordenados por probabilidad.
- Restricción opcional del conjunto de etiquetas candidatas mediante el parámetro `--allow` (por ejemplo, `--allow en,de,fr`), útil para dominios con idiomas conocidos.
- Selección del número de candidatos devueltos con `--top N`.
- Procesamiento de audio WAV mono a 16 kHz; la model card indica que el código original normaliza automáticamente (remuestreo y selección de canal) al llamar a `classify_file`, aunque la CLI de `transcribe.cpp` espera el WAV ya convertido.
- Puntuación de hasta los últimos 30 segundos de cada clip.
- API en C a través del rol `LANGID` (`include/transcribe/langid.h`, documentado en `docs/langid.md`).
- No soporta streaming (`streaming: false`), ni traducción (`translate: false`), ni marcas de tiempo (`timestamps: none`). El campo `lang_detect: false` del bloque `transcribe_cpp` debe interpretarse en el contexto de la propia herramienta, no como ausencia de la funcionalidad de identificación de idioma.

## Casos de uso

- Enrutamiento automático de llamadas en centros de atención al cliente: el modelo clasifica el idioma del primer tramo de audio y deriva la llamada al agente o al modelo de transcripción adecuado. Su latencia (más de 100× tiempo real en CPU) permite hacerlo en línea sin penalizar la experiencia.
- Preprocesado de corpus multilingües: etiquetar grandes volúmenes de audio con el idioma detectado antes de entrenar modelos de ASR o de traducción, filtrando clips mal etiquetados o detectando desviaciones respecto a la etiqueta declarada.
- Moderación y análisis de contenido en plataformas UGC: identificar el idioma de vídeos y audios subidos para aplicar políticas por región o para enrutar a revisores humanos que dominen ese idioma.
- Transcripción y subtitulado: seleccionar el modelo ASR o el par de traducción correcto antes de procesar el audio, evitando ejecutar varios modelos de transcripción en paralelo.
- Investigación lingüística y sociolingüística: clasificar muestras de habla en estudios de variación, contacto de lenguas o documentación de lenguas minoritarias incluidas en el conjunto de 107 etiquetas.
- Integración en dispositivos embebidos y edge computing: con 27 MB en Q8_0 y ejecución en CPU o Vulkan, puede desplegarse en equipos sin GPU dedicada, como un Ryzen 4750U (42,16× tiempo real en CPU, 101,7× en Vulkan).
- Filtrado previo en pipelines de datos: descartar clips cuyo idioma no coincide con el esperado antes de pasarlos a modelos más costosos, reduciendo el gasto computacional.

## Benchmarks y rendimiento

Precisión top-1 sobre FLEURS multilingual (3.000 enunciados), medida en CPU con `transcribe.cpp` `2fdb5c95` el 2026-10-07. La métrica es la precisión top-1 en conjunto abierto sobre las 107 etiquetas, media de 15 idiomas de FLEURS, sobre los primeros 5 segundos de cada clip y sin recorte de silencios.

| Cuantización | Tamaño | Precisión top-1 (FLEURS) |
|---|---:|---:|
| F32 | 85 MB | 85,23 % |
| F16 | 45 MB | 85,17 % |
| Q8_0 | 27 MB | 86,30 % |

Rendimiento en tiempo real (RTF, mayor es mejor):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 | CPU | 122,91× |
| Apple M4 | Metal | 1319,2× |
| Ryzen 4750U | CPU | 42,16× |
| Ryzen 4750U | Vulkan | 101,7× |

No se han publicado en la información disponible resultados comparativos con otros modelos de identificación de idioma (por ejemplo, sobre VoxLingua107 test) más allá de la validación numérica frente a la referencia de SpeechBrain, cuyos detalles remiten a la página del modelo en `transcribe.cpp`.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en todas las cuantizaciones; el fichero más grande (F32) ocupa 85 MB y el más pequeño (Q8_0) 27 MB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada. Funciona en CPU, en GPUs integradas vía Vulkan y en Apple Silicon vía Metal. Cualquier GPU con soporte Vulkan o Metal es suficiente.
- Cabe en GPU consumer: sí, en todas (RTX 4090, RTX 3060, integradas Intel/AMD, Apple M-series).
- Opciones de despliegue: `transcribe.cpp` (CLI `transcribe-cli` y API en C con rol `LANGID`). No se indica soporte para vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo de lenguaje.
- Latencia y throughput: en Apple M4, 122,91× tiempo real en CPU y 1319,2× en Metal; en Ryzen 4750U, 42,16× en CPU y 101,7× en Vulkan. Es decir, procesar 30 segundos de audio lleva del orden de decenas de milisegundos en hardware consumer.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos alternativos de identificación de idioma hablado (por ejemplo, variantes de VoxLingua107 con otras arquitecturas, modelos de Whisper para detección de idioma o clasificadores de idioma de otras suites). Por tanto, la comparativa cuantitativa se indica como no disponible.

| Modelo | Parámetros | Idiomas | Licencia | Formato |
|---|---|---|---|---|
| lang-id-voxlingua107-ecapa (este, GGUF) | 21,2 M | 107 | Apache-2.0 | GGUF |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de transcripción ni de generación de texto: solo devuelve etiquetas de idioma con probabilidad. No debe esperarse salida textual del audio.
- Solo puntúa hasta los últimos 30 segundos del clip; para audios más largos, la clasificación se basa únicamente en esa ventana final.
- Requiere audio WAV mono a 16 kHz; la CLI no realiza la conversión automática, por lo que es necesario preprocesar con `ffmpeg` u otra herramienta.
- No soporta streaming: debe procesarse el clip completo (o su ventana final) antes de obtener la clasificación.
- Riesgo de confusión entre idiomas cercanos o con pocos datos en VoxLingua107; la precisión top-1 reportada es del 85-86 % sobre FLEURS, lo que implica un margen de error no despreciable en producción.
- La cobertura de 107 idiomas no garantiza un rendimiento homogéneo: idiomas con menos representación en el corpus de entrenamiento pueden tener tasas de acierto inferiores.
- Sesgos potenciales derivados de la composición de VoxLingua107 (procedencia de las grabaciones, acentos y variedades representadas), no documentados en detalle en la información disponible.
- Licencia Apache-2.0, que permite uso comercial, pero conviene revisar los términos del modelo base y del dataset VoxLingua107 para usos derivados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo figura como 0.0 GB, lo que sugiere que los ficheros pueden no estar disponibles o que las métricas aún no se han actualizado; verificar la disponibilidad de los GGUF antes de integrarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrsoundmind/lang-id-voxlingua107-ecapa-gguf
- Modelo base: https://huggingface.co/speechbrain/lang-id-voxlingua107-ecapa
- Commit upstream fijado: https://huggingface.co/speechbrain/lang-id-voxlingua107-ecapa/commit/0253049
- Paper de referencia (arXiv): https://arxiv.org/abs/2106.04624
- Dataset VoxLingua107: https://cs.taltech.ee/staff/tanel.alumae/data/voxlingua107/
- Repositorio `transcribe.cpp`: https://github.com/mrsoundmind/transcribe.cpp
- Descarga F32: https://huggingface.co/mrsoundmind/lang-id-voxlingua107-ecapa-gguf/resolve/main/lang-id-voxlingua107-ecapa-F32.gguf
- Descarga F16: https://huggingface.co/mrsoundmind/lang-id-voxlingua107-ecapa-gguf/resolve/main/lang-id-voxlingua107-ecapa-F16.gguf
- Descarga Q8_0: https://huggingface.co/mrsoundmind/lang-id-voxlingua107-ecapa-gguf/resolve/main/lang-id-voxlingua107-ecapa-Q8_0.gguf
