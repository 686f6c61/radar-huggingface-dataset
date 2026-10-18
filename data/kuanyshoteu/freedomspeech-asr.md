# kuanyshoteu/freedomspeech-asr

## Resumen

Freedom Speech ASR es un modelo de reconocimiento automático del habla en producción para kazajo (kk), ruso (ru) e inglés (en), desarrollado por el equipo de Freedom Speech y distribuido exclusivamente a través de su API en freedomspeech.kz. No es un modelo de pesos abiertos: la model card indica explícitamente que los pesos no se distribuyen y que el modelo solo está disponible como servicio. La versión descrita está en producción desde el 8 de octubre de 2026.

El modelo resuelve transcripción de audio en un contexto lingüístico poco cubierto por las alternativas abiertas: el kazajo, con resultados de 7,4 % de WER en FLEURS kk_kz (CER 2,4 %) y 11,5 % en ISSAI Kazakh Speech Corpus, además de un 6,1 % de WER en FLEURS ru_ru. Acepta ficheros (wav, mp3, ogg, m4a, flac) y flujo PCM de 16 kHz por WebSocket con resultados parciales, e incluye diarización con marcas de tiempo y una opción de formateo de números (`prettify`).

Su relevancia ahora es doble: por un lado cubre kazajo con calidad medida sobre conjuntos abiertos y metodología publicada (normalización NFC, minúsculas, sin puntuación, intervalos de confianza al 95 % por bootstrap con 1000 muestras); por otro, su publicación en Hugging Face con 0 descargas y licencia `other` sirve como ficha de servicio más que como artefacto reutilizable, algo que conviene tener claro antes de evaluarlo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se publica la topología; el modelo se sirve únicamente por API) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se ha anunciado que sea un modelo MoE) |
| Longitud de contexto | no disponible (la entrada es audio; no se documenta la duración máxima por petición) |
| Tipos de cuantizacion | no disponible (los pesos no se distribuyen) |
| Idiomas soportados | kazajo (kk), ruso (ru), inglés (en) |
| Licencia | freedom-speech-api-terms (etiquetada como `other` en Hugging Face) |
| Formato de pesos | no hay pesos públicos; acceso mediante API HTTP y WebSocket |
| Formatos de audio de entrada | wav, mp3, ogg, m4a, flac; flujo PCM a 16 kHz por WebSocket |
| Formatos de salida | texto plano; `diarized_json` con segmentos, hablantes y marcas de tiempo |
| Opciones de formato | `prettify=true` convierte números y fechas a dígitos |
| Endpoint | `https://api.freedomspeech.kz/v1/audio/transcriptions` (compatible con la API de OpenAI) |
| Versión en producción | desde 2026-10-08 |
| Precio del servicio | 2 KZT por minuto de audio reconocido (2026-10-18); primer mes gratuito |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo: la model card no describe la topología (transformer, conformer, híbrido u otra), ni el número de parámetros, ni la composición del dataset de entrenamiento, ni si se aplicaron etapas de ajuste supervisado o preferencias. Tampoco se detalla el mecanismo de diarización ni el de formateo inverso de números que implementa `prettify`. Todo ello es "no disponible".

Lo que sí está documentado es la metodología de evaluación, que es inusualmente explícita: métricas calculadas sobre un único script, normalización NFC, minúsculas y eliminación de puntuación, con intervalos de confianza al 95 % obtenidos por bootstrap sobre utterances (1000 muestras). Las ejecuciones del 2026-10-18 usan el ajuste de producción `prettify=true`, y se ofrece la cifra con `prettify=false` para conjuntos cuyas referencias escriben los números con letras. El autor reconoce explícitamente que no publica comparaciones con otros proveedores hasta que todos se midan sobre los mismos conjuntos abiertos.

## Capacidades

- Transcripción por lotes de ficheros de audio en wav, mp3, ogg, m4a y flac mediante una petición HTTP multipart.
- Reconocimiento en streaming por WebSocket sobre PCM a 16 kHz, con devolución de resultados parciales mientras se envía el audio.
- Diarización de hablantes: con `response_format=diarized_json` devuelve segmentos con identificación de hablante y marcas de tiempo.
- Formateo de números, fechas y entidades a dígitos mediante `prettify=true`; también operable en modo literal (`prettify=false`).
- Cobertura multilingüe en tres idiomas: kazajo, ruso e inglés, con calidad desigual (el inglés es el más débil según el propio autor).
- Compatibilidad con el endpoint `/v1/audio/transcriptions` de la API de OpenAI, lo que facilita sustituir el backend sin reescribir clientes.
- SDKs oficiales en Python (`freedomspeech`) y JavaScript (`freedomspeech`), nodo de n8n y plugins para LiveKit Agents y Pipecat.
- La misma API expone dos modelos de síntesis de voz (`freedomspeech` y `freedomspeech-flash`, este último con streaming) con clonación de voz a partir de una referencia de 20 segundos, sin coste adicional; las emociones y etiquetas de `freedomspeech-flash` aún no están conectadas.

## Casos de uso

- **Subtitulado y transcripción de medios en kazajo**: con 7,4 % de WER en FLEURS kk_kz y una velocidad de 1,46 s de mediana por fichero de 16 s (RTF 0,11), un archivo de una hora se procesa en pocos minutos y permite generar subtítulos con marcas de tiempo usando `diarized_json`.
- **Analítica de contact center en ruso y kazajo**: la diarización separa agente y cliente en cada llamada, y el WER de 3,8 % en Common Voice 17 ru y 6,5 % en Russian LibriSpeech da una base razonable para indexar y buscar conversaciones.
- **Asistentes de voz para dispositivos**: el modo streaming por WebSocket con resultados parciales encaja en smart speakers; conviene asumir la degradación en campo lejano (11,9 % de WER en Golos farfield) y en comandos cortos con números (16,1 % en Golos crowd).
- **Actas de reuniones bilingües kk/ru**: la detección automática de idioma no está documentada, pero al cubrir ambos idiomas en el mismo modelo se puede transcribir una reunión mixta sin enrutar por idioma a priori; la ausencia de límite de duración documentado obliga a trocear el audio.
- **Automatizaciones de bajo código**: el nodo `n8n-nodes-freedomspeech` permite insertar transcripción en flujos de trabajo sin escribir código, por ejemplo para volcar notas de voz de un CRM a un campo de texto.
- **Agentes conversacionales en tiempo real**: los plugins de LiveKit Agents y Pipecat permiten construir un pipeline de voz (ASR del usuario, TTS de respuesta) usando el mismo proveedor y la misma clave, con clonación de voz para respuestas personalizadas.
- **Generación de datos para TTS**: la combinación de ASR y TTS en una sola API facilita construir corpus alineados (audio + transcripción) para ajustar voces en kazajo, un idioma con pocos recursos.

## Benchmarks y rendimiento

Resultados publicados por el autor (ejecuciones del 2026-10-18, normalización NFC, minúsculas, sin puntuación, IC al 95 % por bootstrap con 1000 muestras). "n.d." indica que la información no está disponible en la model card.

| Conjunto | Idioma | Ficheros | Horas | WER (prettify=true) | IC 95 % | CER | WER (prettify=false) |
|---|---|---|---|---|---|---|---|
| FLEURS kk_kz test | kk | 856 | 3,83 | 7,4 % | 6,7–8,1 | 2,4 % | 9,8 % |
| FLEURS kk_kz, números con letras en ambos lados | kk | 856 | 3,83 | 6,1 % | n.d. | n.d. | 6,6 % |
| FLEURS kk_kz, sin dígitos en la referencia | kk | 695 | n.d. | 6,0 % | n.d. | n.d. | 4,9 % |
| Common Voice 17 kk test | kk | 514 | 0,72 | 9,9 % | 8,5–11,3 | n.d. | 8,8 % |
| ISSAI Kazakh Speech Corpus v1 test | kk | 3334 | 7,07 | 11,5 % | 10,8–12,1 | 5,2 % | 4,3 % |
| FLEURS ru_ru test | ru | 775 | n.d. | 6,1 % | 5,6–6,7 | 1,9 % | 8,0 % |
| FLEURS en_us test | en | 647 | n.d. | 11,4 % | 10,5–12,2 | 5,6 % | 11,4 % |
| Golos test farfield | ru | 1916 | 1,4 | 11,9 % | 10,5–12,0 | 4,8 % | 6,0 % |
| Golos test crowd (primeros 2000) | ru | 2000 | n.d. | 16,1 % | n.d. | 3,3 % | 4,1 % |
| SOVA RuDevices test (primeros 1500) | ru | 1500 | n.d. | 17,0 % | n.d. | 5,5 % | 14,5 % |
| Common Voice 17 ru test (primeros 1500) | ru | 1500 | n.d. | 3,8 % | 2,9–3,9 | 0,8 % | 3,2 % |
| Russian LibriSpeech test | ru | 1352 | n.d. | 6,5 % | 6,0–6,8 | 1,2 % | 6,2 % |

Latencia y velocidad (FLEURS kk, peticiones secuenciales desde una máquina, incluida la subida del fichero): mediana 1,46 s por fichero de unos 16 s, p90 2,86 s, factor de tiempo real 0,11. Una ejecución anterior del mismo día midió 1,04 s de mediana y RTF 0,08; el autor atribuye la diferencia a condiciones de red.

No se publican comparaciones con otros proveedores: el autor indica que solo las publicará cuando todos se hayan medido sobre los mismos conjuntos abiertos.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica. Los pesos no se distribuyen, por lo que no es posible el autoalojamiento.
- GPU recomendadas: no disponible. El cómputo ocurre en la infraestructura del proveedor.
- Ejecución en GPU de consumo: no es posible; el acceso es exclusivamente a través de `https://api.freedomspeech.kz`.
- Opciones de despliegue: ninguna de las habituales (vLLM, llama.cpp, Ollama, TGI) es aplicable. Los clientes disponibles son el SDK de Python, el paquete de npm, el nodo de n8n y los plugins de LiveKit Agents y Pipecat.
- Latencia observada: mediana 1,46 s y p90 2,86 s por fichero de ~16 s (RTF 0,11) en la medición del 2026-10-18; RTF 0,08 en una ejecución previa. El streaming por WebSocket devuelve parciales, pero no se publica la latencia de primer parcial.
- Throughput agregado: no disponible. No se documentan límites de concurrencia ni de peticiones por minuto de la API.

## Comparativa con modelos similares

La información disponible no incluye comparaciones del autor con otros sistemas, y los datos de arquitectura y parámetros de este modelo tampoco se publican, por lo que una comparación cuantitativa rigurosa no es posible.

| Modelo | Distribución | Idiomas | Licencia | Precio | WER comparable |
|---|---|---|---|---|---|
| Freedom Speech ASR | solo API, sin pesos | kk, ru, en | freedom-speech-api-terms | 2 KZT/min de audio | 7,4 % FLEURS kk_kz; 6,1 % FLEURS ru_ru; 11,4 % FLEURS en_us |
| Whisper large-v3 (OpenAI) | pesos abiertos | multilingüe | no disponible en la información proporcionada | gratuita si se autoaloja | no disponible |
| Voxtral (Mistral) | pesos abiertos | multilingüe | no disponible en la información proporcionada | gratuita si se autoaloja | no disponible |
| Granite Speech (IBM) | pesos abiertos | multilingüe | no disponible en la información proporcionada | gratuita si se autoaloja | no disponible |

Los tres nombres de la columna izquierda proceden de una recopilación externa de modelos ASR abiertos de 2026; en la información consultada no hay cifras de rendimiento, parámetros, longitud de contexto ni licencia de esos sistemas, de modo que se marcan como no disponibles en lugar de estimarlas.

## Limitaciones y advertencias

- **No es código abierto**: los pesos no se distribuyen y la licencia `freedom-speech-api-terms` remite a los términos del servicio, no a una licencia de software. Cualquier uso comercial queda sujeto a esas condiciones, que no se detallan en la información disponible.
- **Dependencia del proveedor**: sin API no hay modelo. No hay plan de contingencia de autoalojamiento, y no se documentan garantías de nivel de servicio, política de retención de audio ni tratamiento de datos personales.
- **Coste variable**: 2 KZT por minuto de audio reconocido; un volumen alto de llamadas implica un coste recurrente que no existe con pesos abiertos.
- **Inglés más débil**: 11,4 % de WER en FLEURS en_us frente a 6,1 % en ruso y 7,4 % en kazajo. No es la opción adecuada si el inglés es el idioma principal.
- **Degradación en habla espontánea**: 17,0 % de WER en SOVA RuDevices y 16,1 % en Golos crowd, ambos sobre habla real captada por dispositivos, muy por encima de los conjuntos de lectura.
- **Problemas reconocidos con números**: el propio autor señala que `prettify=true` pierde precisión en comandos cortos con números y direcciones, y que está trabajando en ello. En conjuntos cuyas referencias escriben los números con letras, la métrica justa es `prettify=false`.
- **Diferencia de formato entre conjuntos**: la brecha entre `prettify=true` y `prettify=false` en FLEURS (7,4 % frente a 9,8 %) es un artefacto de formato de las referencias, no una diferencia real de reconocimiento; conviene no comparar cifras entre conjuntos sin comprobar cómo escriben los números.
- **Cobertura limitada a tres idiomas**: cualquier audio en otra lengua queda fuera del alcance declarado.
- **Riesgo de alucinación**: no hay documentación específica sobre el comportamiento en silencios, música o audio no verbal, un modo de fallo habitual en sistemas ASR; no se dispone de datos al respecto.
- **Sesgos**: no se publica ninguna evaluación de sesgos por acento, edad, género o calidad de micrófono más allá de la distinción entre conjuntos de lectura, micros de consumo y campo lejano.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kuanyshoteu/freedomspeech-asr
- Documentación de la API: https://freedomspeech.kz/docs
- Documentación (variante con barra final): https://freedomspeech.kz/docs/
- Consola para obtener clave de API: https://console.freedomspeech.kz
- Endpoint de reconocimiento: https://api.freedomspeech.kz/v1/audio/transcriptions
- Sitio del servicio: https://freedomspeech.kz
- SDK de Python: `pip install freedomspeech` (repositorio referenciado en la model card, URL no incluida en la información disponible)
- SDK de JavaScript: `npm i freedomspeech` (URL no incluida en la información disponible)
- Nodo de n8n: `n8n-nodes-freedomspeech` (URL no incluida en la información disponible)
- Plugins de LiveKit Agents y Pipecat: referenciados en la model card, URL no incluida en la información disponible
- Conjuntos de evaluación citados: google/fleurs, Common Voice 17 (espejo CC0), ISSAI Kazakh Speech Corpus v1 (espejo OpenSLR 102), Golos (espejo SberDevices), SOVA RuDevices, Russian LibriSpeech (espejo OpenSLR 96)
