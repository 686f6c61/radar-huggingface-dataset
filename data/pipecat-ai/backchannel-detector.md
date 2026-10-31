# pipecat-ai/backchannel-detector

## Resumen

El Pipecat backchannel detector es un modelo de clasificación de audio en streaming desarrollado por el equipo de pipecat-ai, diseñado para agentes de voz. Mientras el bot está hablando, el modelo decide en tiempo real si el usuario está realizando un *backchannel* (señales breves de escucha activa como "mm-hmm" o "ya") —en cuyo caso el bot debe continuar hablando— o si está tomando el turno de palabra ("espera", "no") —en cuyo caso el bot debe detenerse. Funciona por delante de la transcripción, lo que permite reaccionar mucho más rápido que los sistemas basados en texto.

Es un modelo minúsculo: 960.735 parámetros en total (734k según la model card), con una arquitectura de encoder convolucional causal seguida de una GRU, que procesa chunks de 40 ms consumiendo aproximadamente 0,3 ms de CPU por chunk. Esto lo hace ejecutable en CPU sin GPU, un requisito práctico para agentes de voz en producción. Se distribuye en formato ONNX (fp32 e int8) y safetensors, bajo licencia BSD-2-Clause. Su relevancia radica en que resuelve uno de los problemas más difíciles de los agentes de voz full-duplex: la gestión de turnos (turn-taking) y la distinción entre interrupciones reales y señales de escucha pasiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder convolucional causal + GRU (streaming) |
| Parametros totales | 960.735 (safetensors); 734k segun la model card |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Streaming por chunks de 40 ms con estado recurrente (GRU y caches) |
| Tipos de cuantizacion | fp32 (ONNX) e int8 (ONNX) |
| Idiomas soportados | Ingles (en) |
| Licencia | BSD-2-Clause |
| Formato de pesos | ONNX (backchannel-fp32.onnx, backchannel-int8.onnx) y safetensors (PyTorch, clase `bcdet.model.net.BackchannelNet`) |

## Arquitectura y entrenamiento

El modelo es una red de streaming con un encoder convolucional causal seguido de una GRU. Procesa un chunk de audio de 40 ms por llamada (tensor `chunk` de forma `[1, 640]`, audio mono a 16 kHz en float32 en [-1, 1], tras cancelacion de eco) y emite salidas por frames de 20 ms (dos frames por chunk). Mantiene estado recurrente entre llamadas mediante caches y el `gru_state`, que se inicializan a ceros y se realimentan con las salidas `*_out`. Ademas del audio del usuario, recibe un tensor `bot_state` de forma `[1, 2, 8]` con informacion del estado del bot: si esta hablando, segundos desde el inicio del habla del bot, desde la ultima pausa de al menos 200 ms y desde la ultima detencion (recortados a 5 s y normalizados), si se esta reproduciendo un filler, y tres posiciones reservadas a cero.

El entrenamiento se realizo con conversaciones humanas separadas por canal: Open Yap 1K v1.0 (1.516 conversaciones, corpus completo, para entrenamiento y validacion) y otoSpeech-full-duplex-280h (1.081 conversaciones, 280 horas de dialogo full-duplex, CC BY 4.0). Las etiquetas se generaron usando Silero VAD 6.2.3 para segmentar el habla por canal y Deepgram Nova-3 para los tiempos por palabra. Se anadieron 600 ventanas de negativos duros sinteticos generados con 12 voces TTS de Deepgram Aura-2 sobre audio de fondo del sample de Open Yap 1K. Ademas de la salida principal de intencion, el modelo produce de forma auxiliar un VAD del usuario y proyecciones de actividad de voz (VAP) a 0-0,2, 0,2-0,6, 0,6-1,2 y 1,2-2,0 s en el futuro, siguiendo el enfoque de Voice Activity Projection de Ekstedt y Skantze (Interspeech 2022).

## Capacidades

- Clasificacion en streaming de la intencion del usuario mientras el bot habla, con cinco clases: continuer, assessment, negative, floor_take y non_speech.
- Calculo de p(backchannel) = continuer + assessment y p(floor) = negative + floor_take, para decidir si el bot debe seguir o detenerse.
- Deteccion de interrupciones reales con latencia media de 280-300 ms desde el inicio del habla del usuario.
- VAD auxiliar del usuario integrado en el mismo modelo.
- Proyeccion de actividad de voz futura (VAP) hasta 2 s adelante, util para anticipar turn-taking.
- Ejecucion en CPU en tiempo real: unos 0,3 ms de CPU por chunk de 40 ms.
- Operacion por delante de la transcripcion, sin depender de un ASR.
- Version cuantizada int8 para despliegues con recursos limitados.
- Integracion con el framework Pipecat mediante el repositorio pipecat-ai/pipecat-vap.

## Casos de uso

- Agentes de voz conversacionales full-duplex: permite que el bot hable de forma natural sin cortarse ante backchannels del usuario ("mm-hmm", "vale"), distinguiendolos de interrupciones reales.
- Atencion al cliente telefonica automatizada: al detectar interrupciones en una mediana de 280-300 ms, el bot puede ceder el turno rapidamente cuando el usuario quiere hablar, mejorando la experiencia frente a sistemas que solo usan VAD.
- Asistentes de voz en call centers con deteccion de senales de desacuerdo: la clase negative permite reaccionar cuando el usuario dice "no" o "espera", deteniendo al bot antes de que la conversacion se degrada.
- Sistemas de dictado o narracion interactiva: el bot puede continuar leyendo mientras el usuario asiente verbalmente, y detenerse solo ante tomas de turno.
- Pipelines de agentes de voz con Pipecat: integracion directa como modulo de turn-taking junto a VAD y ASR, con estado recurrente persistente entre chunks.
- Despliegues edge o de bajo coste: gracias a su consumo de 0,3 ms de CPU por chunk y a la version int8, puede ejecutarse en servidores modestos o en local sin GPU.
- Investigacion en dialogo full-duplex: las salidas auxiliares VAP permiten experimentar con prediccion de turnos a horizontes de hasta 2 segundos.

## Benchmarks y rendimiento

Resultados publicados en la model card, sobre conversaciones de test reproducidas tal y como las ve un agente Pipecat (incluyendo 200 ms de lag del VAD). Umbral de floor: 0,7; un backchannel se confirma solo cuando el usuario deja de hablar (umbral 0,7, con un limite de 1,2 s).

| Metrica | Open Yap (60 conv.) | otoSpeech (40 conv.) |
|---|---|---|
| Interrupciones detectadas en menos de 700 ms | 82,9 % | 81,2 % |
| Interrupciones perdidas como backchannels | 2,6 % | 4,1 % |
| Backchannels que el bot atraviesa hablando | 86,5 % | 75,2 % |

Mediana del tiempo para detectar una interrupcion: 280 ms (Open Yap) y 300 ms (otoSpeech) desde que el usuario empieza a hablar. No se han publicado comparativas con otros modelos en la informacion disponible.

## Requisitos de hardware

- Consumo estimado: unos 0,3 ms de CPU por chunk de 40 ms, es decir, menos del 1 % de un nucleo de CPU en tiempo real; no requiere GPU.
- VRAM: no aplicable para inferencia en CPU; el modelo ocupa practicamente nada en memoria (el repo pesa menos de 0,01 GB).
- Adecuado para despliegue en cualquier maquina con CPU moderna, incluidos entornos edge y contenedores pequenos; no hay requisitos de GPU dedicada.
- Formatos de despliegue: ONNX Runtime (fp32 o int8) como via principal; pesos PyTorch en safetensors para integraciones propias. Integracion oficial mediante el repositorio pipecat-ai/pipecat-vap dentro del ecosistema Pipecat.
- Latencia: una llamada por chunk de 40 ms con salidas por frames de 20 ms; la deteccion de interrupciones se produce con una mediana de 280-300 ms tras el inicio del habla del usuario en las pruebas publicadas.
- Throughput: no disponible, aunque el coste por chunk permite ejecutar multiples sesiones concurrentes por nucleo de CPU (cifra concreta no publicada).

## Comparativa con modelos similares

No se han publicado comparativas directas con otros modelos en la informacion disponible. Como referencia contextual, este tipo de funcionalidad suele cubrirse con combinaciones de VAD mas heuristicas de turn-taking:

| Modelo | Tipo | Parametros | Streaming | Licencia | Notas |
|---|---|---|---|---|---|
| pipecat-ai/backchannel-detector | Clasificador de backchannel/floor | ~734k-960k | Si (chunks de 40 ms) | BSD-2-Clause | Distingue backchannel de toma de turno; salida VAP auxiliar |
| Silero VAD 6.2.3 | VAD puro | no disponible | Si | MIT | Solo detecta actividad de voz; no clasifica intencion de turno |
| Modelos VAP (Ekstedt y Skantze, 2022) | Proyeccion de actividad de voz | no disponible | Si | no disponible | Base academica del enfoque; sin clasificador de backchannel especifico |

## Limitaciones y advertencias

- Solo funciona en ingles; no hay soporte para espanol ni otros idiomas.
- Entrenado y evaluado en conversaciones entre humanos, no en personas hablando con un bot; el rendimiento en dialogos reales humano-agente puede diferir.
- El eco en el entrenamiento es el canal del interlocutor mezclado de vuelta, no el residuo real de un sistema de cancelacion de eco; se recomienda alimentar el microfono del usuario tras cancelacion de eco.
- El limitado de banda es simulado en entrenamiento; los codecs telefonicos reales no han sido probados.
- Riesgo de confusion entre interrupciones y backchannels: entre un 2,6 % y un 4,1 % de las interrupciones se pierden clasificadas como backchannels en los tests publicados.
- Los umbrales (0,7 para floor y backchannel, limite de 1,2 s) pueden requerir ajuste segun la aplicacion.
- No es un modelo de lenguaje: no genera texto, no razona y no sustituye al ASR; se alimenta del audio en bruto y funciona por delante de la transcripcion.
- Licencia BSD-2-Clause permisiva, apta para uso comercial sin restricciones relevantes; los datasets de entrenamiento tienen sus propios acuerdos (Open Yap 1K Data Use Agreement v1 y CC BY 4.0) que no restringen el uso del modelo pero si la redistribucion de los datos.
- Descargas muy bajas en HuggingFace (0) en el momento de la ficha: comunidad y evidencia de uso en produccion limitadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pipecat-ai/backchannel-detector
- Codigo (pipecat-vap): https://github.com/pipecat-ai/pipecat-vap
- Paper VAP (Voice Activity Projection): https://arxiv.org/abs/2205.09812
- Dataset Open Yap 1K (sample): https://huggingface.co/datasets/TheAgenticDataCompany/open-yap-1k
- Open Yap 1K (corpus completo): https://theagenticdatacompany.com/open-yap-1k
- Acuerdo de uso de Open Yap 1K: https://github.com/The-Agentic-Data-Co/open-yap-1k/blob/main/docs/data-use-agreement.txt
- Dataset otoSpeech-full-duplex-280h: https://huggingface.co/datasets/otoearth/otoSpeech-full-duplex-280h
- Silero VAD: https://github.com/snakers4/silero-vad
- Deepgram: https://deepgram.com
