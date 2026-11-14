# 0x3/Voxtral-Mini-4B-Realtime-2602-TurnHead

## Resumen

Voxtral Mini 4B Realtime Turn Head es un cabezal auxiliar (adapter) de 2,4 millones de parametros disenado por el usuario 0x3 para acoplarse al reconocedor de voz en streaming Voxtral Mini 4B Realtime de Mistral AI. No es un modelo autonomo: lee una capa oculta del STT congelado y, cada 80 ms, emite una distribucion de probabilidad sobre cinco estados de turno de conversacion (hablando, completo, incompleto, backchannel y espera), lo que permite a un asistente de voz full-duplex decidir cuando debe tomar la palabra.

El problema que aborda es el endpointing en interacciones full-duplex: los detectores de actividad vocal (VAD) basados en silencio no distinguen una pausa a mitad de frase de un final real de turno, ni reconocen backchannels como "mm-hmm". El cabezal se ejecuta dentro del paso de decodificacion del reconocedor, de modo que transcripcion y estado de turno salen del mismo forward pass sin coste adicional (0,02 ms por paso en una RTX 4090) y sin alterar la transcripcion (los pesos del modelo base permanecieron completamente congelados durante el entrenamiento).

La relevancia actual radica en que propone una alternativa ligera al fine-tuning completo de modelos de turn-taking, manteniendo intacto el WER del STT original. Esta pensado para integrarse en pipelines de asistentes de voz en tiempo real, concretamente en el proyecto Speakrail sobre un fork de audio.cpp, y su licencia Apache 2.0 facilita su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP de 2,4 M de parametros acoplado a una capa oculta de Voxtral Mini 4B Realtime (adapter) |
| Parametros totales | 2,4 M (cabezal); el modelo base Voxtral Mini 4B Realtime tiene 4B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda el contexto del STT base; ventana de streaming por pasos de 80 ms) |
| Tipos de cuantizacion | cabezal en formato `.vxth`; el modelo base se usa con GGUF q8_0 sin modificar |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | `.vxth` (audio.cpp) + `.vxth.json` (metadatos); modelo base en GGUF q8_0 |

## Arquitectura y entrenamiento

El cabezal es un perceptron multicapa de 2,4 M de parametros que toma como entrada la activacion de una unica capa oculta del decodificador de Voxtral Mini 4B Realtime y produce, en cada paso de decodificacion de 80 ms, un softmax sobre cinco clases: `speaking`, `complete`, `incomplete`, `backchannel` y `wait`. Se ejecuta dentro del paso de decodificacion del reconocedor, por lo que no anade un forward pass independiente. El diseno esta inspirado en el "semantic VAD" de Kyutai STT (kyutai/stt-1b-en_fr) y en trabajos previos de turn-taking sobre GigaAM y X2-Turn.

La innovacion clave es que el modelo base permanecio completamente congelado durante el entrenamiento del cabezal, lo que preserva de forma exacta el WER del STT (la transcripcion es bit-identica con y sin el cabezal) y evita el coste de un fine-tuning completo del encoder y el decoder. El cabezal se entreno con el retardo de transcripcion por defecto de Voxtral de 480 ms, que es el regimen en el que debe usarse. Los hiperparametros de entrenamiento se documentan en el fichero de metadatos `turn_head.vxth.json`; el numero de tokens de entrenamiento y la composicion del dataset no estan disponibles en la informacion proporcionada.

## Capacidades

- Clasificacion de estado de turno en streaming cada 80 ms con cinco clases (hablando, completo, incompleto, backchannel, espera).
- Deteccion de fin de turno (end-of-turn) con probabilidad calibrada, pensada para umbrales tipo P(complete) >= 0,9 en tres frames consecutivos (240 ms).
- Deteccion de pausas a mitad de pensamiento (`incomplete`), distinguiendolas de un final real de turno.
- Deteccion de backchannels ("mm-hmm", "yeah") con umbral P(backchannel) > 0,95.
- Deteccion de actividad de voz del usuario (P(speaking) >= 0,5) para bajar el volumen del asistente.
- Integracion con decodificacion "peek": al dispararse `<complete>`, genera 6 frames (480 ms) de chunks vacios en el futuro y calcula los chunks ya llegados, ahorrando unos 410 ms por turno (peek de 60-70 ms en una RTX 4090).
- No toma decisiones de turno por si mismo: emite senales para que un LLM o un conjunto de reglas actue.
- Solo ingles.

## Casos de uso

- Asistentes de voz full-duplex: el cabezal alimenta al LLM con tokens de senalizacion de turno, permitiendo que el asistente decida hablar, escuchar o interrumpir sin depender de temporizadores de silencio.
- Endpointing de baja latencia en atencion al cliente: con la decodificacion peek, el sistema recupera las ultimas palabras y dispara la respuesta unos 410 ms antes que un esquema sin peek, reduciendo la sensacion de espera.
- Deteccion de interrupciones (barge-in): cuando el usuario habla sobre el asistente, P(speaking) permite bajar el volumen del asistente y P(complete) sobre el solapamiento permite decidir entre continuar, ceder el turno o escuchar.
- Manejo de backchannels en conversaciones naturales: los "mm-hmm" del usuario se clasifican como `<user_bc>` y no terminan el turno del asistente, evitando cortes erroneos en respuestas largas.
- Transcripcion en streaming con metadatos de turno: cada paso SSE incluye el vector `turn`, de modo que un sistema downstream puede registrar y analizar la dinamica conversacional sin coste adicional de computo.
- Investigacion en turn-taking: al ser un cabezal ligero y congelar el STT, sirve como banco de pruebas reproducible para comparar reglas de streak, umbrales y estrategias de senalizacion sin degradar la transcripcion.
- Despliegue en una unica GPU consumer: el conjunto (Voxtral q8_0 + cabezal) esta pensado para ejecutarse en una RTX 4090 con el servidor de audio.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas de coste operativo: 0,02 ms por paso de decodificacion en una RTX 4090 para el cabezal, y 60-70 ms por operacion de peek en la misma GPU.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el modelo base Voxtral Mini 4B Realtime en GGUF q8_0 requiere aproximadamente 4-5 GB, mas el coste despreciable del cabezal (2,4 M de parametros).
- GPU recomendadas: RTX 4090 (escenario validado por el autor, backend CUDA en audio.cpp); otras GPU no estan documentadas.
- Cabe en GPU consumer: si, el autor lo ejecuta en una unica RTX 4090.
- Opciones de despliegue: fork de audio.cpp de Speakrail (rama `turn-head`) con `audiocpp_server`, backend CUDA, modelo base `voxtral-mini-4b-realtime-2602-q8_0.gguf` de audio-cpp/audio.cpp-gguf. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: 0,02 ms por paso para el cabezal; peek de 60-70 ms que ahorra unos 410 ms por turno; retardo de transcripcion de 480 ms (por defecto de Voxtral, regimen de entrenamiento del cabezal).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 0x3/Voxtral-Mini-4B-Realtime-2602-TurnHead | Cabezal de turn-taking sobre STT congelado | 2,4 M (cabezal) + 4B (base) | no disponible | apache-2.0 | Hugging Face + fork de audio.cpp |
| x-square-robot/X2-Turn-4B-0812 | Fine-tuning completo (encoder y decoder) para turn-taking en chino e ingles | 4B | no disponible | no disponible | Hugging Face |
| kyutai/stt-1b-en_fr | STT con "semantic VAD" integrado | 1B | no disponible | no disponible | Hugging Face |
| pipecat-ai/smart-turn | Modelo de deteccion de fin de turno | no disponible | no disponible | no disponible | GitHub |

La diferencia principal frente a X2-Turn es que este cabezal no modifica el STT, preservando el WER original, a cambio de delegar la decision de turno en un LLM o en reglas externas.

## Limitaciones y advertencias

- Solo soporta ingles; no hay evidencia de comportamiento en otros idiomas.
- No es un modelo autonomo: sin un LLM o un conjunto de reglas que interprete las senales, no gestiona turnos por si mismo.
- Las probabilidades fluctuan frame a frame; el autor recomienda reglas de racha (tres frames consecutivos) para convertirlas en eventos, lo que introduce una latencia intrinseca de 240 ms en la deteccion.
- Entrenado especificamente con el retardo de transcripcion de 480 ms de Voxtral; usarlo con otro retardo puede degradar la calibracion.
- Requiere un fork concreto de audio.cpp (rama `turn-head`) y el formato propietario `.vxth`; no hay soporte documentado en otros runtimes.
- El despliegue validado es en una RTX 4090 con backend CUDA; el rendimiento en otras GPU no esta documentado.
- Riesgo de falsos positivos o negativos en el endpointing en funcion del umbral elegido; el autor no publica tasas de error ni evaluacion cuantitativa.
- No se documentan sesgos conocidos ni evaluaciones de robustez ante ruido, acentos o audio de baja calidad.
- Licencia Apache 2.0 permisiva para uso comercial, pero el modelo base Voxtral Mini 4B Realtime tiene su propia licencia que debe verificarse por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/0x3/Voxtral-Mini-4B-Realtime-2602-TurnHead
- Modelo base: https://huggingface.co/mistralai/Voxtral-Mini-4B-Realtime-2602
- Speakrail (repositorio): https://github.com/speakrail/speakrail
- Fork de audio.cpp con soporte de turn head: https://github.com/speakrail/audio.cpp
- GGUF de Voxtral para audio.cpp: https://huggingface.co/audio-cpp/audio.cpp-gguf
- Smart Turn (Pipecat): https://github.com/pipecat-ai/smart-turn
- Kyutai STT: https://kyutai.org/stt
- kyutai/stt-1b-en_fr: https://huggingface.co/kyutai/stt-1b-en_fr
- Unmute (Kyutai): https://github.com/kyutai-labs/unmute
- GigaAM: https://github.com/salute-developers/GigaAM
- X2-Turn: https://github.com/X-Square-Robot/X2-Turn
- x-square-robot/X2-Turn-4B-0812: https://huggingface.co/x-square-robot/X2-Turn-4B-0812
