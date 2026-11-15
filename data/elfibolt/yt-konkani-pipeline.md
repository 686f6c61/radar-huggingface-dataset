# Elfibolt/yt-konkani-pipeline

## Resumen

YT-Konkani-Pipeline es un pipeline de extremo a extremo para reconocimiento automático del habla (ASR) y restauración de puntuación en konkani escrito en devanagari (códigos `kok` y `gom`). Lo publica el usuario Elfibolt en Hugging Face y combina un modelo acústico de terceros (`bodhan-ai/indic-transcribe-core`) con un motor propio de restauración de puntuación basado en Conditional Random Fields (CRF) de tan solo 34,18 MB. No es un modelo de lenguaje generativo ni un transformer entrenado desde cero: es una herramienta de procesamiento lingüístico empaquetada como repositorio con código Python y pesos `joblib`.

El problema que resuelve es concreto: los sistemas ASR para lenguas de bajos recursos como el konkani suelen producir transcripciones sin puntuación, sin mayúsculas discriminativas y con diálogos sin delimitar, lo que dificulta su uso como corpus legible o como entrada para etapas posteriores de NLP. Este pipeline añade puntos, comas, signos de interrogación y comillas dobles sobre el texto crudo, además de ofrecer segmentación en frases y un CLI para transcribir archivos locales o canales completos de YouTube.

Su relevancia actual radica en que cubre una lengua con escasa representación en herramientas ASR y en que garantiza fidelidad léxica del 100 %: al ser un etiquetador de secuencias (CRF) y no un modelo generativo, no puede eliminar, alterar ni alucinar palabras del transcript original. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, con un tamaño declarado de 0,0 GB (los pesos se descargan aparte vía `huggingface_hub`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline híbrido: ASR acústico (`bodhan-ai/indic-transcribe-core`) + etiquetador de secuencias CRF (sklearn-crfsuite) para puntuación |
| Parametros totales | No disponible (el componente CRF pesa 34,18 MB; el ASR base no se detalla) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos `joblib`; no se documentan cuantizaciones) |
| Idiomas soportados | Konkani en devanagari (`kok`, `gom`) |
| Licencia | Apache-2.0 |
| Formato de pesos | `joblib` (CRF) + pesos del modelo ASR base descargados desde Hugging Face |

## Arquitectura y entrenamiento

El sistema se compone de dos etapas encadenadas. La primera es el modelo acústico `bodhan-ai/indic-transcribe-core`, desarrollado por Bodhan AI, que convierte audio (`.wav`, `.mp3`, `.flac`) en texto konkani sin puntuar. La segunda es un motor propio de restauración de puntuación basado en Conditional Random Fields implementado con `sklearn-crfsuite`, que recibe la secuencia de tokens y predice etiquetas de puntuación (punto, coma, interrogación, comillas dobles) y modos alternativos como el uso de dandas (`।`) para poemas y himnos.

El CRF se entrenó con texto devanagari de konkani procedente de AI4Bharat Sangraha (`gom`) y del volcado de Wikipedia en konkani. Al tratarse de un modelo discriminativo de etiquetado de secuencias, no genera texto nuevo: asigna etiquetas a los tokens existentes, lo que el autor presenta como garantía de fidelidad léxica del 100 %. No se documentan detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo ajuste fino del ASR base. El pipeline incluye además utilidades de scraping de YouTube con `yt-dlp`, borrado automático de audio descargado y eliminación de marcas de tiempo entre corchetes.

## Capacidades

- Transcripción de voz a texto en konkani devanagari a partir de archivos de audio locales (`.wav`, `.mp3`, `.flac`).
- Restauración de puntuación: puntos de cierre de frase, comas para pausas y delimitación de cláusulas, signos de interrogación contextuales y comillas dobles para diálogo directo.
- Detección de marcadores interrogativos konkani específicos (`काय`, `कितें`, `कशें`, `कित्याक`, `न्हू`, `न्ही`) para asignar el signo `?`.
- Modo lírico o de himno (`mode="poem"`) que emplea dandas (`।`) en lugar de puntos.
- Segmentación del texto puntuado en frases individuales mediante `split_sentences`.
- Transcripción por lotes de canales de YouTube vía CLI, con omisión de vídeos ya procesados y generación de `corpus.txt` y `corpus.jsonl`.
- Fidelidad léxica garantizada: el etiquetado CRF no añade ni elimina palabras.
- No soporta tool calling, function calling, agentes, visión, audio de salida ni razonamiento multi-paso; sus capacidades se limitan al pipeline ASR + puntuación descrito.

## Casos de uso

- Creación de corpus lingüísticos para konkani: el CLI permite recorrer un canal de YouTube completo, transcribir cada vídeo y generar `corpus.txt` y `corpus.jsonl` con texto puntuado y sin marcas de tiempo, útil para investigadores que necesitan datos de una lengua de bajos recursos.
- Subtitulado y accesibilidad de contenido audiovisual en konkani: a partir de un archivo de audio o vídeo se obtiene texto legible con puntuación y diálogos delimitados por comillas, listo para publicar como subtítulos o transcripción.
- Archivado y documentación de emisiones de televisión regional: el ejemplo del propio autor (`@DoordarshanGoa`) ilustra el uso para digitalizar programación en konkani y conservarla como texto buscable.
- Preparación de datos para etapas posteriores de NLP: la segmentación en frases y la puntuación restaurada facilitan tareas como traducción automática, análisis morfológico o entrenamiento de modelos de lenguaje sobre konkani.
- Transcripción de entrevistas y testimonios orales: el pipeline procesa un archivo de audio y devuelve texto puntuado con interrogantes y comillas, adecuado para trabajos de historia oral o periodismo.
- Investigación en puntuación de lenguas de bajos recursos: el CRF de 34,18 MB y su ejecución en CPU (~2,8 s para un transcript de 30 minutos) lo hacen viable como línea base reproducible en experimentos de restauración de puntuación.
- Normalización de transcripciones existentes: la función `punctuate` puede aplicarse a texto konkani crudo ya transcrito por otros medios para añadir puntuación sin tocar las palabras.

## Benchmarks y rendimiento

Evaluación del componente CRF sobre texto devanagari de konkani reservado para test, procedente de AI4Bharat Sangraha y Wikipedia en konkani:

| Signo de puntuacion | Precision | Recall | F1-Score |
|---|---|---|---|
| Punto (`.`) | 82,4 % | 81,3 % | 0,819 |
| Coma (`,`) | 68,3 % | 31,0 % | 0,426 |
| Interrogacion (`?`) | 67,4 % | 31,9 % | 0,433 |
| Comillas dobles (`"`) | 76,1 % | 22,4 % | 0,346 |

No se han publicado resultados de benchmarks del componente ASR (WER/CER) en la informacion disponible.

## Requisitos de hardware

- El componente CRF (34,18 MB) se ejecuta en CPU estándar: ~2,8 segundos para un transcript de 30 minutos, según el autor.
- El componente ASR (`bodhan-ai/indic-transcribe-core`) requiere `torch` y `transformers`; no se especifican VRAM ni GPU recomendadas en la información disponible.
- Al ser un pipeline de inferencia con un modelo acústico de tamaño no documentado, es plausible su ejecución en GPU consumer, pero no hay datos que lo confirmen.
- Despliegue mediante Python con las dependencias `torch`, `transformers`, `huggingface-hub`, `joblib`, `sklearn-crfsuite`, `yt-dlp`, `imageio-ffmpeg` y `soundfile`. No se documenta integración con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de pipeline).
- Latencia del ASR y throughput no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YT-Konkani-Pipeline (Elfibolt) | ASR + CRF de puntuación | Konkani (`kok`, `gom`) | No disponible | Apache-2.0 | Hugging Face, 0 descargas |
| `bodhan-ai/indic-transcribe-core` | ASR acústico | Lenguas indias (según autor) | No disponible | No disponible | Hugging Face |
| IndicTrans2 (AI4Bharat) | Traducción automática | Lenguas indias | No disponible | No disponible | Hugging Face |

No se dispone de información suficiente para comparar rendimiento (WER, F1 de puntuación) con alternativas equivalentes de ASR o restauración de puntuación para konkani; se indica "no disponible".

## Limitaciones y advertencias

- El recall es bajo en coma (31,0 %), interrogación (31,9 %) y comillas (22,4 %): el modelo omite muchos signos que deberían insertarse, lo que produce textos con puntuación incompleta.
- Solo cubre konkani en escritura devanagari; no soporta otras lenguas ni la variante latina del konkani.
- El componente ASR depende de un modelo de terceros (`bodhan-ai/indic-transcribe-core`) cuyas limitaciones, licencia y condiciones de uso no se detallan en la información disponible.
- No hay datos publicados sobre sesgos, tasas de error del ASR ni comportamiento con audio ruidoso, acentos o habla espontánea.
- El scraping de YouTube puede vulnerar los términos de servicio de la plataforma y derechos de autor del contenido; el usuario debe verificar el uso legítimo del material descargado.
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar la licencia del modelo ASR base antes de desplegar en producción.
- Repositorio sin descargas ni validación comunitaria (0 descargas, 0 likes); no hay evidencia de uso en producción.
- No es un modelo de lenguaje: no genera respuestas, no razona y no admite instrucciones en lenguaje natural.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Elfibolt/yt-konkani-pipeline
- Modelo ASR base: https://huggingface.co/bodhan-ai/indic-transcribe-core
- Perfil del autor: https://huggingface.co/Elfibolt
- Organización Bodhan AI: https://huggingface.co/bodhan-ai
- AI4Bharat Sangraha (datos de entrenamiento): no disponible como enlace directo en la información proporcionada
- Wikipedia en konkani (datos de entrenamiento): no disponible como enlace directo en la información proporcionada
