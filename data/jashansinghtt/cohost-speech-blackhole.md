# jashansinghTT/cohost-speech-blackhole

## Resumen

`jashansinghTT/cohost-speech-blackhole` no es un modelo entrenado desde cero, sino un paquete de despliegue que sirve simultáneamente tres modelos de audio preentrenados y sin modificar: Whisper large-v3 de OpenAI (voz a texto), S2 Pro de Fish Audio (texto a voz) y MiniMax Music 3 de MiniMax (texto a música). Lo publica Jashan Pratap Singh (jashansinghTT) dentro del ecosistema de Tenstorrent, empaquetado con `tt-model-manager` (esquema de manifiesto 5.1, tipo `cohost`).

El problema que resuelve es de multiplexación de hardware: un chip Blackhole solo puede ser abierto por un proceso a la vez, de modo que tres modelos que comparten chip deben compartir proceso. Este paquete es ese proceso, y expone cada modelo en su propio endpoint HTTP (puertos 20000, 20001 y 20002, más un endpoint de estado en 20003) sobre una única placa p150 (QuietBox 2 o un chip de un P300).

Es relevante ahora porque demuestra una pila completa de voz y música sobre aceleradores no CUDA, con mediciones de latencia y memoria publicadas, aunque sin evaluación de calidad frente a las implementaciones de referencia. El repositorio ocupa 0,9 GB, pero el despliegue requiere unos 40 GB de disco para pesos y cachés de los tres modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo único: proceso de co-hosting que sirve tres modelos preentrenados (Whisper large-v3, Fish Audio S2 Pro y MiniMax Music 3) con pesos sin modificar |
| Parametros totales | No disponible (no se publica el recuento de parámetros de los tres modelos base) |
| Parametros activos | No aplica (no es un modelo MoE; es un paquete de despliegue) |
| Longitud de contexto | 8192 tokens para MiniMax Music 3 en este paquete (8K); no disponible para Whisper large-v3 y S2 Pro |
| Tipos de cuantizacion | No disponible; se sirven los pesos originales y se genera una caché de tensores para el dispositivo |
| Idiomas soportados | No disponible (la model card no declara idiomas; cada modelo base tiene su propia carta) |
| Licencia | Por modelo: Apache-2.0 (Whisper large-v3), Fish Audio Research License (S2 Pro), MiniMax-Music3 Community License (Music 3) |
| Formato de pesos | Pesos originales de los modelos base, convertidos y compilados a caché de tensores de Tenstorrent; el formato exacto de los ficheros no se detalla |

## Arquitectura y entrenamiento

El paquete no entrena ningún modelo: carga los pesos originales de Whisper large-v3, S2 Pro y MiniMax Music 3 y los sirve desde un único proceso sobre un chip Blackhole. La innovación técnica está en el co-hosting: como un chip Tenstorrent solo admite un proceso abierto a la vez, los tres servidores HTTP conviven en el mismo proceso y las peticiones se turnan en el chip por orden de llegada (first come, first served). El empaquetado se realiza con `tt-model-manager`, tipo `cohost`, y requiere una versión de `tt-model` que soporte ese tipo (en el momento de publicación, una rama `feat/cohost-kind`).

En el primer arranque se convierten los pesos y se compilan los kernels para el dispositivo: 669 s medidos en un host limpio incluyendo las descargas. Los arranques posteriores tardan unos 110 s. Además, cada arranque copia primero los ficheros de caché de tensores generados por el arranque anterior, porque en algunos hosts la lectura de un fichero de caché poco después de escribirlo bloquea `ttnn.load_tensor`; un arranque que copió toda la caché (unos 27 GB) estuvo listo en 161 s. El grupo se considera listo cuando el log muestra `cohost: all members ready`. No se detallan datos de entrenamiento, composición del dataset ni técnicas de alineación (RLHF/DPO) porque no se entrena nada aquí: la carta remite a las model cards originales.

## Capacidades

- Voz a texto con Whisper large-v3 en `POST :20000/v1/audio/transcriptions`, con API de estilo OpenAI y multipart `file`.
- Texto a voz con S2 Pro en `POST :20001/v1/tts` y `POST :20001/v1/audio/speech`, con voces de referencia bajo `/v1/references/*`.
- Generación de música a partir de letras y una descripción de estilo con MiniMax Music 3 en `POST :20002/v1/audio/speech` (letras en `input`, estilo en `instructions`).
- Generación de canciones largas mediante trabajos asíncronos: `POST /v1/music/jobs`, `GET /v1/music/jobs/{id}` y `/v1/music/jobs/{id}/audio`.
- Salida en WAV y control de semilla (`seed`) en las peticiones de voz y música.
- Endpoint de estado en `GET :20003/` con disponibilidad de cada modelo, memoria del dispositivo y L1 por modelo.
- No expone una API de chat OpenAI ni funciones de tool calling, agentes o razonamiento multi-paso.
- No se declaran capacidades multimodales más allá del audio (ni visión, ni vídeo, ni audio de entrada para los modelos generativos).

## Casos de uso

- Transcripción de reuniones y subtitulado: Whisper large-v3 en el puerto 20000 acepta un fichero multipart y devuelve texto; en la medición publicada transcribió un clip de 4,6 s en 0,4 s, adecuado para integrarse en un servicio interno de actas o subtítulos.
- Síntesis de voz para asistentes y audiolibros: S2 Pro en el puerto 20001 permite fijar una voz de referencia y una semilla para obtener siempre el mismo WAV, lo que facilita la regeneración controlada de locuciones largas.
- Sintonías y jingles cortos: MiniMax Music 3 genera 8 s de música en 24 s con `audio_duration: 8` a partir de letras y una descripción de estilo como "Genre: acoustic pop. BPM: 96", suficiente para pruebas de concepto de branding sonoro.
- Doblaje y localización de contenido: encadenar la transcripción de Whisper con la síntesis de S2 Pro dentro del mismo proceso evita mover datos entre servicios y aprovecha que ambos endpoints comparten chip.
- Prototipado de pilas de audio en hardware Tenstorrent: sirve para evaluar el rendimiento real de Blackhole en cargas de voz y música dejando los demás chips de la caja libres para otros modelos.
- Pruebas de regresión deterministas en CI de audio: las salidas con semilla fija fueron idénticas byte a byte a las de cada modelo servido por separado, incluso con las tres peticiones simultáneas, lo que permite comparar versiones sin ruido estocástico.
- Investigación sobre multiplexación de modelos: el paquete permite medir la contención y el tiempo de espera cuando una generación musical de varios minutos bloquea el chip y llega una petición de transcripción.
- Demos interactivas de canciones cortas: el flujo asíncrono de `/v1/music/jobs` permite lanzar una canción de hasta 4 minutos y consultar su estado sin mantener la conexión abierta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (WER, MOS, métricas de música) en la información disponible; la propia carta indica que no se ha ejecutado ninguna evaluación de calidad contra las implementaciones de referencia. Sí hay mediciones de latencia en un chip de QuietBox 2 (Blackhole p300c), con los tres modelos en un proceso y una petición a la vez:

| Modelo | Peticion | Salida | Concurrencia | Tiempo |
|---|---|---|---|---|
| S2 Pro | Frase de 13 palabras en inglés, seed 7, WAV | 4,6 s de voz | 1 | 9,2 s |
| Whisper large-v3 | Transcripción del clip de 4,6 s | Las mismas palabras | 1 | 0,4 s |
| MiniMax Music 3 | `audio_duration` 8, seed 3, WAV | 8,0 s de música | 1 | 24 s |

Consumo de memoria del dispositivo por chip tras el calentamiento: Whisper 3,9 GiB, S2 Pro 7,3 GiB, Music 3 18,3 GiB, 29,5 GiB en total más una región de trazas de 512 MiB. Tiempos de arranque: 669 s en frío con descargas y compilación, unos 110 s en arranques posteriores y 161 s cuando se copió toda la caché (unos 27 GB).

## Requisitos de hardware

- Acelerador Tenstorrent p150: un chip Blackhole, en una QuietBox 2 o en uno de los chips de un P300. No se soporta otro hardware.
- Memoria del dispositivo: 29,5 GiB en total para los tres modelos tras el calentamiento, más 512 MiB de región de trazas (Whisper 3,9 GiB, S2 Pro 7,3 GiB, Music 3 18,3 GiB).
- Disco: unos 40 GB para pesos y cachés de los tres modelos, aunque el repositorio de HuggingFace ocupa 0,9 GB.
- No cabe en GPU de consumo: no es una carga CUDA y no se documenta despliegue en RTX 4090, A100 o H100; el backend es específico de Tenstorrent.
- Despliegue mediante `tt-model` (paquete `tt-model-manager`) y Docker: `tt-model pull`, `tt-model serve` (con `--device-id N` para elegir chip) y `tt-model stop`.
- Es necesario un `tt-model` que soporte `kind: cohost`; hasta que esté en una release, se instala desde la rama `feat/cohost-kind` con `uv tool install` o `pipx install`.
- Latencia y throughput: una petición por modelo a la vez, con turnos en el chip; la música consume unos 3 s de cómputo por cada segundo de audio generado y bloquea el chip durante toda la generación.

## Comparativa con modelos similares

| Solución | Modelos servidos | Hardware | Contexto de música | Duración máxima de música | Concurrencia | Licencia |
|---|---|---|---|---|---|---|
| `cohost-speech-blackhole` | Whisper large-v3, S2 Pro, Music 3 | 1 chip Blackhole (p150) | 8K tokens (8192) | 4 min (6000 fotogramas) | 1 petición por modelo, con turnos | Por modelo |
| `jashansinghTT/minimax-music3-blackhole` | Solo MiniMax Music 3 | 1 chip Blackhole | 16K (según la referencia del paquete cohost) | 6 min | No disponible | MiniMax-Music3 Community License |
| `jashansinghTT/s2-pro-blackhole` | Solo S2 Pro | 1 chip Blackhole | No aplica | No aplica | No disponible | Fish Audio Research License |
| Tres despliegues separados | Los tres modelos | 3 chips Blackhole | 16K en música | 6 min | Paralelismo real entre modelos | Por modelo |

La diferencia clave frente a servir cada modelo por separado es el coste de hardware: el paquete cohost usa un solo chip a cambio de serializar las peticiones y de recortar la música de 6 a 4 minutos. Frente a soluciones en GPU, no hay comparación directa disponible en la información proporcionada, porque el backend es específico de Tenstorrent y no se publican métricas equivalentes.

## Limitaciones y advertencias

- Los modelos se turnan: una generación musical retiene el chip durante toda la canción (unos 3 s de cómputo por segundo de audio) y cualquier petición de voz o transcripción que llegue mientras tanto espera.
- Una petición por modelo a la vez; las siguientes se encolan. No está pensado para muchos usuarios concurrentes.
- MiniMax Music 3 funciona aquí con contexto de 8K: canciones de hasta 6000 fotogramas (4 minutos) y el prompt más la canción deben caber en 8192 tokens; el paquete independiente permite 6 minutos.
- Solo se soporta p150 con un chip Blackhole; no hay despliegue documentado en otras placas.
- No se ha ejecutado ninguna evaluación de calidad (tasa de error de palabras, calidad de voz o de música) contra las implementaciones de referencia.
- La licencia es por modelo y debe revisarse antes de uso comercial: Apache-2.0 para Whisper, Fish Audio Research License para S2 Pro y MiniMax-Music3 Community License para Music 3; los términos concretos de las dos últimas no se detallan en la información disponible.
- Requiere una versión de `tt-model` con soporte de `kind: cohost`, disponible de momento solo en una rama de desarrollo; una versión sin ese soporte rechaza el paquete.
- El arranque incluye una copia de la caché de tensores (unos 27 GB) como solución a un bloqueo de `ttnn.load_tensor` en algunos hosts, lo que añade tiempo y espacio en disco.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, por lo que no existe validación de la comunidad.
- No se declaran idiomas soportados en la model card; la cobertura lingüística depende de cada modelo base y no está verificada en este paquete.
- Riesgo de alucinación y sesgos: no evaluados en esta información; deben consultarse las cartas de Whisper large-v3, S2 Pro y MiniMax Music 3.

## Enlaces

- [jashansinghTT/cohost-speech-blackhole en HuggingFace](https://huggingface.co/jashansinghTT/cohost-speech-blackhole)
- [Perfil de jashansinghTT en HuggingFace](https://huggingface.co/jashansinghTT)
- [openai/whisper-large-v3](https://huggingface.co/openai/whisper-large-v3)
- [fishaudio/s2-pro](https://huggingface.co/fishaudio/s2-pro)
- [MiniMaxAI/MiniMax-Music3](https://huggingface.co/MiniMaxAI/MiniMax-Music3)
- [tt-model-manager en GitHub](https://github.com/tenstorrent/tt-model-manager)
- [Rama feat/cohost-kind de tt-model-manager](https://github.com/tenstorrent/tt-model-manager/tree/feat/cohost-kind)
- [jashansinghTT/s2-pro-blackhole](https://huggingface.co/jashansinghTT/s2-pro-blackhole)
- [jashansinghTT/minimax-music3-blackhole](https://huggingface.co/jashansinghTT/minimax-music3-blackhole)
