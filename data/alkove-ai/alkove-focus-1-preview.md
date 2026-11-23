# alkove-ai/alkove-focus-1-preview

## Resumen

alkove-focus-1-preview es un modelo de aislamiento de voz y supresion de ruido en tiempo real desarrollado por alkove-ai, pensado para procesar audio de voz a 16 kHz. Su funcion principal es conservar la voz mas cercana al microfono y eliminar ruido, musica y otras voces; ademas, si se le proporciona un voiceprint generado por alkove-timbre-1-preview, puede aislar unicamente a una persona concreta, incluso cuando otra habla mas fuerte o mas cerca. Forma parte de Alkove, un SDK de voz on-device (aislamiento, wake word, voiceprint, actividad de voz y pronunciacion) que se ejecuta en navegador o telefono sin enviar audio a un servidor.

El modelo es un modelo de audio-a-audio que opera por tramas de 256 muestras (16 ms) y devuelve audio procesado con un retardo de una trama. Los pesos se distribuyen en formato propietario `.alk` con cuantizacion int8 y un tamano de solo 1,1 MB, lo que permite ejecucion nativa en Rust o en WebAssembly en un unico hilo. Se trata de una version preview: los pesos y la interfaz pueden cambiar antes de la version 1, y el autor indica que ha sido reemplazado por alkove-focus-1 a partir de Alkove 0.5, manteniendose esta version para Alkove 0.4 y anteriores.

Su relevancia actual radica en la combinacion de tamano minimo, latencia muy baja y licencia Apache-2.0, lo que lo hace adecuado para pipelines de agentes de voz en tiempo real, navegador y dispositivos moviles. No es un modelo de lenguaje: no genera texto ni razona, sino que filtra senal de audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de audio-a-audio para aislamiento de voz; el NOTICE menciona GTCRN con licencia MIT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (procesamiento por tramas de 256 muestras, 16 ms) |
| Tipos de cuantizacion | int8 (pesos del archivo `.alk`) |
| Idiomas soportados | no disponible (procesamiento agnostico al idioma; benchmarks en 7 idiomas de Common Voice) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.alk` (formato propietario del motor Alkove, documentado), int8 |
| Tamano del modelo | 1,1 MB |
| Frecuencia de muestreo | 16 kHz mono, float32 en rango -1..1 |
| Entrada adicional | `print` float32 `[1, 192]` (embedding de alkove-timbre; ceros para conservar la voz mas cercana) |
| Estado interno | 126848 floats (reiniciar al cambiar el print) |
| Latencia | 16 ms (una trama) adicional sobre la trama de 16 ms |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la informacion proporcionada. El modelo opera como un filtro de audio-a-audio con estado: recibe una trama de 256 muestras y un vector de voiceprint de 192 dimensiones, y devuelve 256 muestras de audio aislado. El NOTICE del repositorio menciona la licencia MIT de GTCRN, lo que sugiere que la arquitectura deriva o incorpora componentes de ese modelo de mejora de voz, aunque no se confirma explicitamente.

Tampoco se detallan el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o ajuste fino supervisado. Los benchmarks publicados por el autor se miden sobre AMI, Common Voice (7 idiomas), VoiceBank+DEMAND y DNS Challenge 3, lo que indica que el entrenamiento o la evaluacion cubren dominios de reuniones, voz espontanea y ruido de fondo. La innovacion tecnica destacable es la integracion de un voiceprint opcional para target-speaker extraction dentro del propio modelo, junto con la ejecucion en WebAssembly y en un solo hilo con cuantizacion int8.

## Capacidades

- Aislamiento de voz en tiempo real a 16 kHz con tramas de 16 ms.
- Supresion de ruido, musica y otras voces.
- Target-speaker extraction: con un voiceprint de alkove-timbre-1-preview, conserva solo a la persona indicada, incluso si otra voz habla mas fuerte o mas cerca.
- Modo sin voiceprint: conserva la voz mas cercana al microfono (entrada `print` a ceros).
- Procesamiento con estado interno entre llamadas (126848 floats).
- Ejecucion nativa en Rust o en WebAssembly, en un unico hilo.
- Integracion con agentes de voz: LiveKit Agents (livekit-plugins-alkove), Pipecat (pipecat-alkove) y LiveKit en Android (ai.alkove:alkove-livekit).
- SDKs disponibles: navegador (npm `alkove`), Python (`alkove`), Android y Swift.
- No soporta generacion de texto, razonamiento, codigo, vision ni tool calling; es exclusivamente audio-a-audio.

## Casos de uso

- Agentes de voz en tiempo real: el modelo se integra como cancelacion de ruido o filtro de entrada en LiveKit Agents y Pipecat, de modo que el agente recibe unicamente la voz del usuario con una latencia de 16 ms, adecuada para conversacion interactiva.
- Atencion al cliente con microfonos ruidosos: en centros de llamadas o entornos domesticos, elimina ruido de fondo y otras voces antes de la transcripcion, lo que reduce la tasa de error de palabras del ASR posterior (WER de 16,1 en AMI con impresion segun el autor).
- Reuniones y grabacion en salas compartidas: con un voiceprint por participante, permite aislar la voz de un hablante concreto en una reunion donde varias personas hablan a la vez, util para diarizacion o para generar actas por persona.
- Aplicaciones de navegador sin servidor: al ejecutarse en WebAssembly, permite aislamiento de voz on-device en aplicaciones web, sin enviar audio a un servidor y con un tamano de 1,1 MB que se descarga rapidamente.
- Dispositivos moviles y wearables: con un consumo de unos 39 ms por segundo de audio en un Galaxy Z Fold8 y 56 ms por segundo en un Apple M1 Max (un hilo), es viable en telefonos y dispositivos con CPU limitada.
- Asistentes de voz con wake word y voiceprint: combinado con alkove-timbre para identificar al usuario autorizado, el modelo puede aislar solo su voz antes de la deteccion de wake word o de la verificacion de locutor, reduciendo falsos positivos por voces de fondo.
- Transcripcion y subtitulado en directo: como preprocesado de audio para pipelines de ASR, mejora la relacion senal-ruido y la inteligibilidad (STOI 0,895, SI-SDR 12,1 dB en VoiceBank+DEMAND) antes de la transcripcion.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Aislamiento de voz | AMI meetings, microfono de diadema, 134 ventanas (protocolo VoxLock) | WER con impresion (Whisper large-v3 turbo) | 16,1 |
| Aislamiento de voz | AMI meetings, microfono de diadema, 134 ventanas (protocolo VoxLock) | WER sin impresion (Whisper large-v3 turbo) | 16,7 |
| Aislamiento de voz | AMI meetings, microfono de diadema, 134 ventanas (protocolo VoxLock) | Palabras de otras voces por minuto, con impresion | 0,5 |
| Aislamiento de voz | Common Voice, otra voz en la sala, 7 idiomas | SI-SDR del objetivo, con impresion (dB) | 7,1 |
| Aislamiento de voz | Common Voice, otra voz en la sala, 7 idiomas | Nivel de la otra voz hablando sola, con impresion (dB) | -22,6 |
| Mejora de voz | VoiceBank+DEMAND, 824 clips | STOI | 0,895 |
| Mejora de voz | VoiceBank+DEMAND, 824 clips | SI-SDR (dB) | 12,1 |
| Mejora de voz | VoiceBank+DEMAND, 824 clips | DNSMOS P.835 overall | 3,04 |
| Mejora de voz | VoiceBank+DEMAND, 824 clips | DNSMOS P.808 | 3,47 |
| Mejora de voz | DNS Challenge 3 blind test, 600 clips | DNSMOS P.808 | 3,36 |
| Mejora de voz | DNS Challenge 3 blind test, 600 clips | DNSMOS P.835 overall | 2,7 |

Rendimiento de ejecucion declarado por el autor:

| Plataforma | Consumo |
|---|---|
| CPU nativa, 1 hilo, Galaxy Z Fold8 (Android 17) | ~39 ms por segundo de audio |
| CPU nativa, 1 hilo, Apple M1 Max (macOS) | ~56 ms por segundo de audio |
| Latencia | 16 ms (una trama) sobre la trama de 16 ms |

El autor indica que las comparaciones se realizaron contra VoxLock (27 M parametros, Apache-2.0) y DeepFilterNet 3 (2,1 M parametros), pero la informacion proporcionada no incluye los valores numericos de esas comparaciones.

## Requisitos de hardware

- VRAM: no aplica en el sentido habitual; el modelo pesa 1,1 MB en int8 y se ejecuta en CPU. En GPU no se documenta soporte.
- CPU: funciona en un unico hilo nativo (Rust) o en WebAssembly; valido para CPU de movil y de escritorio.
- GPU recomendadas: no disponibles; el autor no documenta ejecucion en GPU.
- Cabe en cualquier GPU consumer y en cualquier dispositivo movil moderno por su tamano, aunque el motor esta optimizado para CPU.
- Opciones de despliegue: motor Alkove (Rust, Apache-2.0) nativo o WebAssembly; SDK de navegador (npm `alkove`), paquete Python (`alkove`), SDK Android y paquete Swift; integraciones con LiveKit Agents (`livekit-plugins-alkove`), Pipecat (`pipecat-alkove`) y LiveKit Android (`ai.alkove:alkove-livekit`).
- Latencia: 16 ms de retardo adicional sobre la trama de 16 ms.
- Throughput: aproximadamente 39 ms de CPU por segundo de audio en Galaxy Z Fold8 y 56 ms por segundo en Apple M1 Max, en un hilo.

## Comparativa con modelos similares

| Modelo | Parametros | Licencia | Enfoque | Notas |
|---|---|---|---|---|
| alkove-focus-1-preview | no disponible (pesos int8 de 1,1 MB) | Apache-2.0 | Aislamiento de voz y supresion de ruido en tiempo real, con voiceprint opcional | Ejecucion en CPU/WebAssembly, latencia de 16 ms |
| VoxLock | 27 M | Apache-2.0 | Aislamiento de voz | Usado por el autor como referencia de comparacion; valores no incluidos en la informacion disponible |
| DeepFilterNet 3 | 2,1 M | no disponible en la informacion | Mejora de voz y supresion de ruido | Usado por el autor como referencia de comparacion; valores no incluidos en la informacion disponible |

No se dispone de mas alternativas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Version preview: los pesos y la interfaz pueden cambiar antes de la version 1; el autor la ha reemplazado por alkove-focus-1 a partir de Alkove 0.5 y solo se mantiene para Alkove 0.4 y anteriores.
- Solo procesa audio a 16 kHz mono; no soporta otras frecuencias de muestreo de forma documentada.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni vision.
- El estado interno debe reiniciarse al cambiar el voiceprint; un uso incorrecto puede degradar el aislamiento.
- Los benchmarks estan declarados por el autor y no estan verificados de forma independiente (`verified: false` en el model-index).
- No se documentan sesgos por idioma o acento, aunque los benchmarks cubren 7 idiomas de Common Voice; el rendimiento en idiomas no evaluados es desconocido.
- Riesgo de artefactos o perdida de calidad en condiciones de ruido extremo o voces muy similares; no se documentan metricas especificas para esos casos.
- Licencia Apache-2.0 permite uso comercial, pero el NOTICE incluye la licencia MIT de GTCRN, que debe conservarse.
- El formato `.alk` es propietario y requiere el motor Alkove; no se distribuyen pesos en safetensors ni GGUF.
- No se documenta soporte en GPU ni en frameworks de inferencia convencionales (vLLM, llama.cpp, TGI, Ollama).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alkove-ai/alkove-focus-1-preview
- Version sucesora: https://huggingface.co/alkove-ai/alkove-focus-1
- Modelo de voiceprint: https://huggingface.co/alkove-ai/alkove-timbre-1-preview
- Demo en navegador: https://huggingface.co/spaces/alkove-ai/alkove
- Sitio del proyecto: https://alkove.ai
- Motor Alkove (Rust): https://github.com/alkove-ai/alkove/tree/main/crates/engine
- Formato `.alk`: https://github.com/alkove-ai/alkove/blob/main/crates/engine/FORMAT.md
- SDK Android: https://github.com/alkove-ai/alkove/tree/main/android
- SDK Swift: https://github.com/alkove-ai/alkove/tree/main/ios
- Integracion LiveKit Android: https://github.com/alkove-ai/alkove/tree/main/android/livekit
- Paquete npm: https://www.npmjs.com/package/alkove
- Paquete Python: https://pypi.org/project/alkove/
- Plugin LiveKit Agents: https://pypi.org/project/livekit-plugins-alkove/
- Plugin Pipecat: https://pypi.org/project/pipecat-alkove/
