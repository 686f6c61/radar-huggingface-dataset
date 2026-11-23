# matthiastl/tyger-onnx

## Resumen

TYGER es un modelo de *turn-taking* (gestión de turnos de palabra) para agentes de voz, desarrollado por NineNineSix. Su función no es transcribir ni generar lenguaje, sino escuchar simultáneamente al interlocutor y a la reproducción del propio agente para decidir tres cosas: cuándo el usuario ha terminado de hablar (endpoint), cuándo está interrumpiendo (barge-in) y cuándo encaja un asentimiento tipo "mm-hm" (backchannel). El repositorio `matthiastl/tyger-onnx` es una conversión no oficial a ONNX de 8 bits de la parte decisoria del modelo original, publicada por un tercero y no avalada por NineNineSix ni por NVIDIA.

El modelo original se distribuye como un único fichero PyTorch fp32 de 2,6 GB y se ejecuta en GPU mediante el motor `tyger-s2s`. Esta conversión reduce el peso a 442 MB (386 MB del codificador Nemotron truncado en la capa 15 más 56 MB del *turn-taker*), elimina la dependencia de PyTorch y permite inferencia en CPU con ONNX Runtime y numpy. Según el autor, reproduce las mismas decisiones que el original en al menos el 99,6 % de las tramas de 80 ms sobre 28 llamadas telefónicas grabadas.

La relevancia práctica es doble: abarata el despliegue de agentes de voz full-duplex en hardware sin GPU y separa la detección de turnos de la transcripción, de modo que el desarrollador puede emparejar esta pieza con cualquier motor ASR. La contrapartida es que aquí no hay reconocimiento de voz: solo se incluyen las 15 primeras capas del codificador, no las 24 completas ni el decodificador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador Nemotron truncado en la capa 15 (log-mels a representaciones de 1024 dimensiones) + turn-taker GRU de 3 capas y anchura 768 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana deslizante de 8 s de audio por flujo, reencodeada cada 320 ms |
| Tipos de cuantizacion | int8 para `l15.int8.onnx`; fp32 para `turn_taker.onnx` |
| Idiomas soportados | en |
| Licencia | openmdw-1.1 |
| Formato de pesos | ONNX (`l15.int8.onnx`, `turn_taker.onnx`) + `mel_filters.npy` |

## Arquitectura y entrenamiento

La pieza pesada es un codificador de tipo transformer (Nemotron) del que solo se conservan las 15 primeras capas de 24; recibe log-mels de 128 bandas y emite una representación de 1024 dimensiones por cada trama de 80 ms (submuestreo de factor 8 respecto a la resolución temporal de entrada). Sobre esa secuencia opera el *turn-taker*: una GRU de 3 capas y anchura 768 que, en cada llamada, consume una trama de 80 ms y produce las probabilidades de las cuatro clases de estado de turno. El runtime reencodea los últimos 8 s de cada flujo (usuario y reproducción del agente) cada 320 ms y pasa las 4 tramas más recientes de la capa 15 a la GRU.

No se dispone de información sobre el dataset de entrenamiento del modelo original (número de tokens, composición, uso de RLHF o DPO) en la información proporcionada. La innovación destacable de esta conversión es de ingeniería: cuantización int8 del codificador, extracción del subconjunto mínimo de capas necesario para la decisión, reimplementación del preprocesado mel en numpy y reutilización sin cambios de las reglas de turno de `tyger-s2s` (licencia Apache-2.0, en `vendor/tyger_s2s/`). Los umbrales por defecto son 0,91 para endpoint, 0,5 para barge-in y 0,4 para backchannel, y son configurables por argumento de constructor.

## Capacidades

- Detección de fin de turno (ENDPOINT) con probabilidad por trama y evento agregado que incluye el audio del turno.
- Detección de interrupción (BARGE) mientras el agente está hablando, con modo `speaking` para procesar solapamiento de voces.
- Detección de retroalimentación (BACKCHANNEL): identifica momentos donde encaja un asentimiento breve.
- Salida de estado de turno por trama (la más probable de 4 clases) además de las probabilidades crudas cada 80 ms.
- Procesamiento full-duplex: consume simultáneamente el hop del usuario y el de la reproducción del agente (5.120 muestras a 16 kHz mono float32 por hop de 320 ms).
- Umbrales ajustables en tiempo de construcción (`ep_thr`, y análogos para barge-in y backchannel).
- No incluye reconocimiento de voz, generación de texto, tool calling, agentes ni capacidades multimodales más allá del audio de entrada.

## Casos de uso

- Agente de voz telefónico en CPU: integrar `Tyger.process` en el bucle de un conmutador o PBX software para cerrar el turno del usuario y lanzar la transcripción con cualquier ASR externo, sin necesidad de GPU en el servidor.
- Interrupción natural en asistentes conversacionales: usar los eventos BARGE para detener la síntesis de voz del agente en curso cuando el usuario empieza a hablar, con umbral ajustable para equilibrar falsos positivos y latencia de corte.
- Retroalimentación conversacional: emitir sonidos de asentimiento o respuestas breves cuando se dispara BACKCHANNEL, mejorando la percepción de escucha activa en IVR y bots de atención.
- Despliegue en dispositivos de borde: los 442 MB en int8 y la dependencia exclusiva de ONNX Runtime y numpy permiten ejecutarlo en mini-PC, portátiles o servidores sin acelerador, con un coste por conversación bajo.
- Segmentación previa a ASR por lotes: procesar grabaciones de call center para trocear cada intervención en eventos ENDPOINT y enviar solo esos segmentos al transcriptor, reduciendo coste de ASR y mejorando la diarización.
- Evaluación y monitorización de calidad: registrar las probabilidades por trama de conversaciones reales para medir tasa de solapamiento, latencia de respuesta del agente y frecuencia de interrupciones como métricas de producto.
- Pruebas de regresión de agentes de voz: al ser determinista y ligero, sirve como componente fijo en pipelines de CI que validan cambios en el resto del stack conversacional.

## Benchmarks y rendimiento

Los datos publicados comparan esta conversión con el original (TYGER fp32 en PyTorch con transformers 5.23) sobre 28 llamadas de CallHome English, con una regla de aceptación fijada antes de ver resultados.

Discrepancia trama a trama (turn-taker libre):

| Decision | Tramas que difieren | Sobre las tramas donde alguna dispara |
|---|---:|---:|
| Endpoint (p >= 0,91), escucha | 0,06 % | 5,2 % |
| Backchannel (p >= 0,40), escucha | 0,34 % | 3,1 % |
| Backchannel (p >= 0,80), escucha | 0,01 % | 10,5 % |
| Barge-in (p >= 0,50), habla | 0,18 % | 5,1 % |
| Barge-in (p >= 0,93), habla | 0,03 % | 15,0 % |
| Estado de turno (el más probable de 4), escucha | 0,00 % | — |
| Estado de turno (el más probable de 4), habla | 0,23 % | — |

Eventos con las reglas de turno de `tyger-s2s` y umbrales por defecto (coincidencia dentro de una trama, 80 ms):

| Evento | Original | Esta version | Coincidentes |
|---|---:|---:|---:|
| ENDPOINT | 91 | 94 | 85 (93,4 %) |

El autor indica además que 85 de los 91 eventos de fin de turno del original caen en la misma trama, y los 6 restantes también se emiten con un desfase de 160 a 400 ms. No se han publicado resultados de benchmarks de calidad absoluta (precisión frente a verdad humana) en la información disponible; esos datos remiten a la model card del modelo original.

Latencia medida en un Apple M4 Max, por hop de 320 ms (p90):

| Entorno | 1 hilo | 4 hilos |
|---|---:|---:|
| TYGER original (PyTorch fp32) | 272 ms | 678 ms |
| Esta version (ONNX int8) | 271 ms | 118 ms |

## Requisitos de hardware

- VRAM: no requiere GPU; el conjunto de ficheros ocupa 442 MB en disco y el consumo de memoria en ejecución es del orden de cientos de MB, sin dato exacto publicado.
- GPU recomendadas: no aplica; el objetivo del repositorio es CPU. El original en fp32 requiere GPU para cumplir tiempo real según el motor `tyger-s2s`.
- Cabe en cualquier CPU moderna x86-64 o ARM; el autor solo ha medido un Apple M4 Max.
- Despliegue: ONNX Runtime (ejecución CPU) más numpy; se importa `tyger_onnx.py` desde la carpeta descargada con `huggingface_hub`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Throughput y latencia: 271 ms por hop de 320 ms en 1 hilo y 118 ms en 4 hilos (p90, M4 Max), es decir, margen de tiempo real en ambos casos, mucho mayor con paralelismo. Con 4 hilos la conversión es unas 5,7 veces más rápida que el original en el mismo hardware.
- Una instancia de `Tyger` por conversación; el estado se mantiene en el objeto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Ejecucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| matthiastl/tyger-onnx (esta ficha) | no disponible (442 MB int8+fp32) | ventana de 8 s por flujo, hop 320 ms | CPU, ONNX Runtime | openmdw-1.1 | Hugging Face |
| nineninesix/tyger (original) | no disponible (2,6 GB fp32) | ventana de 8 s por flujo, hop 320 ms | GPU, PyTorch + transformers >= 5.13 | openmdw-1.1 | Hugging Face |
| tyger-s2s (motor completo) | incluye Nemotron de 24 capas y decodificador | no disponible | GPU | Apache-2.0 (reglas de turno) | GitHub |

No se dispone de información sobre otros modelos comparables de detección de turnos en la documentación proporcionada.

## Limitaciones y advertencias

- No transcribe: solo contiene las 15 primeras capas de Nemotron; la transcripción debe hacerse con un ASR externo sobre el audio de cada evento ENDPOINT.
- La validación es de equivalencia frente al original, no frente a la verdad humana; la calidad absoluta de las decisiones debe consultarse en la model card de TYGER.
- Solo inglés (`en`); no se documenta soporte multilingüe.
- La medición de velocidad procede de un único equipo (Apple M4 Max); el rendimiento en otras CPU puede diferir sustancialmente.
- Conversión no oficial: no está hecha ni respaldada por NineNineSix ni por NVIDIA; posibles errores de conversión no cubiertos por la validación publicada.
- Licencia OpenMDW-1.1: conviene revisar `LICENSE.md` y `NOTICE.md` antes de uso comercial, junto con las condiciones del modelo base.
- Riesgo de falsos positivos y negativos en los tres detectores; los umbrales por defecto están pensados para el motor `tyger-s2s` y pueden requerir ajuste según el dominio (telefonía, VoIP, micrófono de sala).
- Dependencia de la calidad del audio: la validación se hizo con llamadas de CallHome, con ambos interlocutores en un solo canal; otros canales o ruidos pueden degradar las decisiones.
- No se han publicado datos de sesgo en la información disponible.

## Enlaces

- Repositorio de esta conversión: https://huggingface.co/matthiastl/tyger-onnx
- Modelo base: https://huggingface.co/nineninesix/tyger
- Motor de referencia: https://github.com/nineninesix-ai/tyger-s2s
