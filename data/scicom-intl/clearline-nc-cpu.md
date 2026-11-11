# Scicom-intl/Clearline-NC-CPU

## Resumen

Clearline-NC-CPU es un modelo de supresion de ruido en tiempo real publicado por Scicom-intl, pensado para integrarse como `FrameProcessor` de audio en LiveKit Agents. No es un modelo de lenguaje: es una red de mejora de voz (speech enhancement) que procesa audio a 16 kHz en flujo continuo, con 32 ms de latencia algorítmica, y que se ejecuta exclusivamente en CPU mediante ONNX Runtime. Su funcion es limpiar la senal de voz antes de que llegue a un reconocedor automatico del habla (ASR) o a un oyente humano, y se presenta como sustituto directo de GTCRN, la referencia habitual en este nicho.

El modelo forma parte de la familia Clearline, junto con Clearline-NC-GPU (del que el modo `quality` es un destilado) y Clearline-VAD. Ofrece dos modos con compromisos distintos: `asr`, orientado a reducir la tasa de error de palabra de un ASR posterior, y `quality`, orientado a la percepcion subjetiva de un oyente humano. La revision de noviembre de 2026 fusiona los grafos ONNX, reduciendo el coste por trama a 189 µs en modo `asr` y 376 µs en modo `quality` sobre un nucleo, frente a los 1089 µs de GTCRN.

La relevancia practica esta en el coste: un 1,51 % de un nucleo por flujo en modo `asr` a 16 kHz con 8 flujos concurrentes, lo que permite desplegar cancelacion de ruido en telefonia y agentes de voz sin GPU. El repositorio esta marcado como trabajo en curso y se actualiza por revisiones, por lo que conviene fijar una revision concreta en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de mejora de voz en dominio espectral (grafos ONNX fusionados); modo `quality` con 256 unidades y niveles/ganancias por bin, modo `asr` con 128 unidades |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; procesa tramas de 20 ms en streaming con 32 ms de retardo |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX y pesos PyTorch sin cuantizar declarada) |
| Idiomas soportados | no disponible (modelo agnostico al idioma; opera sobre la senal acustica) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`clearline_nc_asr.onnx`, `clearline_nc.onnx`, variantes en `plain/`) y PyTorch (`pytorch/*.pt`) |

Otros datos tecnicos: frecuencia de muestreo de 16 kHz, pipeline `audio-to-audio`, libreria `onnx`, tamano de repositorio 0,0 GB (segun Hugging Face), una instancia por flujo de audio.

## Arquitectura y entrenamiento

Clearline-NC-CPU es una red de supresion de ruido que opera en el dominio de la frecuencia sobre tramas cortas de audio, con dos variantes de capacidad: el modo `asr` (128 unidades) y el modo `quality` (256 unidades, con niveles y ganancias por bin). El modo `quality` se obtiene por destilacion de un profesor GPU, la version 1 de Clearline-NC-GPU. Los grafos publicados en esta revision estan fusionados: realizan la misma funcion con dos quintas partes de los operadores que las versiones anteriores, y las versiones sin fusionar se conservan en `plain/` para plugins anteriores al 11 de noviembre de 2026. El script `clearline/nc_fast.py` regenera el grafo fusionado a partir de los pesos.

El entrenamiento cubre audio de banda ancha y audio telefonico. La model card indica que los detalles de entrenamiento de ambos modos estan en el preprint de Clearline, pero no se proporcionan en la informacion disponible el numero de horas de audio, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o preferencias (poco probables en una tarea de regresion espectral). La evaluacion telefonica incluye cinco codecs a 8 kHz (G.711, GSM, Opus, AMR-NB y G.723.1), de los cuales los dos ultimos no aparecian en entrenamiento. La innovacion destacable es de ingenieria: fusion de operadores, buffers escritos en sitio y correccion de un defecto que hacia crecer el coste por trama en llamadas largas cuando la sala no corria a 16 kHz.

## Capacidades

- Supresion de ruido en streaming sobre audio de 16 kHz con 32 ms de retardo, integrable como `rtc.FrameProcessor[rtc.AudioFrame]` en LiveKit Agents.
- Dos modos de operacion: `asr` (reduce ruido 20 dB y remezcla el 70 % de la entrada para preservar inteligibilidad ante un reconocedor) y `quality` (elimina ruido de fondo y conserva todas las voces, incluida una segunda voz dentro de aproximadamente 1 dB).
- Ejecucion exclusiva en CPU mediante ONNX Runtime, sin dependencia de GPU.
- Procesamiento de audio telefonico de banda estrecha (8 kHz) y de banda ancha, con robustez ante codecs de telefonia.
- Manejo de ruido no estacionario tipo babble de multitud, con reduccion de aproximadamente 25 dB en modo `quality`.
- Una instancia por flujo, lo que permite multiplexar muchos flujos concurrentes en un mismo nucleo.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multimodales: es un componente de preprocesado de audio, no un modelo generativo.

## Casos de uso

- Atencion al cliente por telefonia IP: el modo `asr` mantiene la tasa de error de palabra de Whisper practicamente en el nivel de la senal sin procesar a traves de G.711, GSM y Opus (3,20 %, 6,96 % y 4,81 % frente a 3,25 %, 7,41 % y 4,94 % sin filtrar), lo que lo hace adecuado para limpiar audio antes de un ASR en centros de llamadas.
- Agentes de voz en tiempo real sobre LiveKit: se integra como `AudioInputOptions(noise_cancellation=...)` y procesa cada trama de 20 ms con 189 µs de CPU en modo `asr`, cabiendo en el presupuesto de un agente conversacional sin GPU.
- Transcripcion de reuniones y notas: el modo `asr` baja la tasa de error de Whisper en el conjunto sintetico de DNS 2020 del 5,38 % sin procesar al 5,02 %, util para pipelines de actas automaticas con audio de sala.
- Comunicaciones de voz para oyentes humanos: el modo `quality` alcanza PESQ 2,575 en VoiceBank+DEMAND frente a 2,535 de GTCRN y SI-SDR de 17,4 dB frente a 14,6 dB, por lo que mejora la percepcion subjetiva en llamadas o grabaciones.
- Despliegue masivo en CPU sin acelerador: con 1,51 % de un nucleo por flujo en modo `asr` a 16 kHz (8 flujos), un solo nucleo puede sostener decenas de flujos concurrentes en un servidor convencional.
- Preprocesado en entornos con codecs legacy: el modo `asr` se mantiene cerca de la senal sin procesar incluso en G.723.1 y AMR-NB, no vistos en entrenamiento (7,78 % y 5,24 % frente a 7,72 % y 4,83 %), lo que permite desplegarlo en infraestructura telefonica antigua.
- Filtro previo en asistentes de voz embebidos: al ser ONNX sobre CPU y con grafos fusionados de bajo coste, encaja en dispositivos sin GPU que necesiten cancelacion de ruido antes de un ASR local.

## Benchmarks y rendimiento

Datos publicados en la model card (Whisper large-v3 sobre 824 enunciados de test de VoiceBank y 150 clips sinteticos de DNS 2020, con el arnes de STT-API):

| Metrica | GTCRN | ASR mode | Quality mode |
|---|---|---|---|
| CPU por flujo, 16 kHz, 8 flujos (% de un nucleo) | 6,19 % | **1,51 %** | 2,50 % |
| CPU por flujo, 48 kHz, 8 flujos | 6,83 % | **2,49 %** | 3,28 % |
| CPU por trama de 20 ms a 16 kHz, un nucleo | 1089 µs | **189 µs** | 376 µs |
| VoiceBank+DEMAND PESQ | 2,535 | 2,135 | **2,575** |
| VoiceBank+DEMAND SI-SDR | 14,6 dB | 10,5 dB | **17,4 dB** |
| DNS 2020 sintetico PESQ | 2,293 | 1,697 | **2,389** |
| DNS 2020 grabaciones reales, DNSMOS global | **2,75** | 2,34 | 2,73 |
| WER de Whisper, banda ancha / G.711 (sin procesar 1,45 % / 2,95 %) | 2,65 % / 4,26 % | **1,55 % / 2,90 %** | 2,32 % / 5,79 % |
| WER de Whisper, DNS 2020 sintetico (sin procesar 5,38 %) | 5,30 % | **5,02 %** | 6,48 % |
| WER de Whisper en 8 condiciones, ratio medio frente a sin procesar | 2,17 | **1,00** | 1,45 |

Rendimiento telefonico (WER de Whisper tras cinco codecs a 8 kHz):

| Codec | Sin procesar | GTCRN | ASR mode | Quality mode |
|---|---|---|---|---|
| G.711 | 3,25 % | 10,72 % | **3,20 %** | 4,64 % |
| GSM | 7,41 % | 15,60 % | **6,96 %** | 9,10 % |
| Opus | 4,94 % | 13,46 % | **4,81 %** | 7,32 % |
| AMR-NB (no visto en entrenamiento) | 4,83 % | 13,66 % | **5,24 %** | 6,99 % |
| G.723.1 (no visto en entrenamiento) | 7,72 % | 16,62 % | **7,78 %** | 9,89 % |

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en CPU via ONNX Runtime y no requiere GPU.
- CPU: 189 µs por trama de 20 ms en modo `asr` y 376 µs en modo `quality` sobre un nucleo; 1,51 % y 2,50 % de un nucleo por flujo respectivamente con 8 flujos a 16 kHz.
- GPU recomendadas: ninguna; el modelo esta disenado explicitamente para CPU.
- Cabe en cualquier CPU consumer; no hay requisito de acelerador grafico.
- Opciones de despliegue: ONNX Runtime y el plugin de LiveKit incluido en el repositorio (`clearline/livekit.py`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia: 32 ms de retardo algoritmico por el filtrado en streaming, mas el coste de computo por trama; el plugin despierta cincuenta veces por segundo.
- Throughput: con 1,51 % de nucleo por flujo, un nucleo puede sostener del orden de decenas de flujos concurrentes en modo `asr`; la cifra exacta depende del hardware y no se publica.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / trama | CPU por flujo (16 kHz, 8 flujos) | PESQ VoiceBank+DEMAND | WER Whisper (banda ancha) | Licencia |
|---|---|---|---|---|---|---|---|
| Clearline-NC-CPU (ASR) | Supresion de ruido ONNX | no disponible | trama de 20 ms, 32 ms de retardo | **1,51 %** | 2,135 | **1,55 %** | no disponible |
| Clearline-NC-CPU (quality) | Supresion de ruido ONNX | no disponible | trama de 20 ms, 32 ms de retardo | 2,50 % | **2,575** | 2,32 % | no disponible |
| GTCRN | Supresion de ruido | no disponible | trama de 20 ms | 6,19 % | 2,535 | 2,65 % | no disponible |
| Clearline-NC-GPU (v1/v2) | Supresion de ruido (profesor GPU) | no disponible | no disponible | no aplica (GPU) | no disponible | no disponible | no disponible |

La comparacion se limita a GTCRN y a la variante GPU de la propia familia, que son los unicos terminos de referencia citados en la informacion disponible.

## Limitaciones y advertencias

- Repositorio en trabajo en curso: la model card advierte que el modelo sigue entrenandose y que cada subida es una revision distinta; es imprescindible fijar una revision concreta en produccion.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor; tratar como restriccion bloqueante hasta verificarlo.
- El modo `quality` empeora el WER de Whisper en telefonia (5,79 % en G.711 frente a 2,90 % del modo `asr` y 2,95 % sin procesar) y en DNS 2020 sintetico (6,48 % frente a 5,38 % sin procesar); no debe usarse delante de un ASR.
- El modo `asr` degrada la calidad perceptual (PESQ 2,135 y SI-SDR 10,5 dB, por debajo de GTCRN); no es la opcion para un oyente humano.
- En grabaciones reales de DNS 2020 el DNSMOS global es 2,34 en modo `asr` y 2,73 en `quality`, ambos por debajo de los 2,75 de GTCRN; el modelo no lidera en esa condicion.
- Solo procesa audio a 16 kHz de forma nativa; las salas a otras frecuencias requieren remuestreo y, en revisiones anteriores al 11 de noviembre de 2026, el coste por trama crecia con la duracion de la llamada (siete veces mas al final de una llamada de diez minutos a 48 kHz).
- Una instancia por flujo de audio: no es reentrante ni compartible entre flujos.
- No se documentan sesgos, tasas de alucinacion (no genera texto) ni cobertura idiomatica; al operar sobre la senal acustica, el comportamiento depende del tipo de ruido y no del idioma.
- No hay datos publicados sobre cuantizacion, numero de parametros ni composicion del dataset de entrenamiento, lo que limita la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Scicom-intl/Clearline-NC-CPU
- Clearline-NC-GPU (version 1, profesor del modo `quality`): https://huggingface.co/Scicom-intl/Clearline-NC-GPU/tree/ac5d95507431e0616cd6eaa5d28c316882b8b236
- Clearline-VAD: https://huggingface.co/Scicom-intl/Clearline-VAD
- Coleccion Clearline: https://huggingface.co/collections/Scicom-intl/clearline-6ae3f6e7cbdc1a74fc801725
- Preprint de Clearline: no disponible (citado en la model card sin enlace)
- Repositorio de codigo del plugin: incluido en el propio repositorio de Hugging Face (`clearline/`)
- Demo: no disponible
