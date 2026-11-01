# aufklarer/VAP-OTO-CoreML

## Resumen

VAP-OTO-CoreML es la exportación no oficial al formato Core ML compilado (`.mlmodelc`) del checkpoint público `oto.ckpt` del repositorio `viks66/VAP_checkpoints`. Implementa la arquitectura VoiceActivityProjection (VAP) de Erik Ekstedt, un modelo diseñado para predecir la actividad de voz y los turnos de habla en conversaciones entre un usuario y un agente. No se ha aplicado fine-tuning ni cuantización de pesos: la exportación preserva los pesos originales en Float32.

El modelo resuelve un problema concreto en sistemas de voz conversacionales: anticipar cuándo un interlocutor va a terminar su turno o cuándo va a retomar la palabra, información que alimenta una política de turnos externa. No decide por sí mismo cuándo debe responder el agente, sino que proporciona probabilidades de actividad de voz actual y futura en ventanas de 20 segundos de audio estéreo sincronizado (canal de usuario y canal de agente).

Con 5.785.117 parámetros, es un modelo compacto orientado a inferencia en dispositivos Apple mediante Core ML, con soporte para macOS 15+ e iOS 18+ a través del SDK speech-swift. Su relevancia radica en habilitar detección de turnos de baja latencia en local, sin depender de servicios en la nube, con una licencia permisiva (CC BY 4.0 para los pesos, MIT para el código de arquitectura).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VoiceActivityProjection (VAP) de Erik Ekstedt |
| Parametros totales | 5.785.117 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 20 segundos de audio (320.000 muestras a 16 kHz) |
| Tipos de cuantizacion | Float32, sin cuantizacion |
| Idiomas soportados | Ingles (en) |
| Licencia | CC BY 4.0 (pesos); MIT (codigo de arquitectura) |
| Formato de pesos | Core ML compilado (`.mlmodelc`) |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura VoiceActivityProjection (VAP) publicada por Erik Ekstedt en el repositorio `ErikEkstedt/VoiceActivityProjection` (revisión `f39a78b`). La entrada es una forma de onda estéreo de 16 kHz en Float32 con orden de canales usuario y agente, de forma `[1, 2, 320000]`, correspondiente a 20 segundos de audio. Las salidas son tres tensores de forma `[1, 1000, 2]`: `p_now` (probabilidad de actividad actual, agregando los bins de proyección de 0,2 y 0,4 segundos), `p_future` (probabilidad de actividad futura, agregando los bins de 0,6 y 0,8 segundos) y `vad` (probabilidad de actividad de voz en el instante actual). Ambos pronósticos de hablante se expresan en orden `[usuario, agente]`.

La exportación no aplica fine-tuning ni cuantización. El grafo compilado ocupa 39.282.957 bytes. La validación compara todas las 1.000 tramas de salida contra el checkpoint PyTorch original en cuatro fixtures de 20 segundos (silencio, solo usuario, solo agente y ambos simultáneos), con un error absoluto máximo de 0,00000477, por debajo de la tolerancia de 0,0005. No hay información disponible sobre el dataset de entrenamiento original, el número de tokens ni si se aplicaron técnicas de RLHF o DPO, ya que la model card de esta exportación no los detalla y remite al checkpoint fuente.

Una limitación arquitectónica relevante: cada llamada recalcula la ventana completa y el grafo no cachea estado de red para streaming. Para conversaciones más largas de 20 segundos se debe conservar la ventana más reciente, y para entradas más cortas se rellena con silencio inicial. Un agente inactivo requiere un canal de ceros de la misma longitud.

## Capacidades

- Predicción de actividad de voz (VAD) en tiempo real sobre audio estéreo sincronizado.
- Pronóstico de turnos de habla: probabilidad de que el usuario o el agente estén hablando en el instante actual (`p_now`) y en un futuro próximo (`p_future`) con bins de 0,2, 0,4, 0,6 y 0,8 segundos.
- Detección de final de turno y de pausas intra-turno, orientada a alimentar políticas de turn-taking externas.
- Procesamiento de ventanas de 20 segundos con salida de 1.000 tramas; los SDKs exponen la trama más reciente.
- Integración nativa en el ecosistema Apple mediante Core ML y el SDK speech-swift (`SpeechVAD`).
- No incluye generación de texto, razonamiento, código, matemáticas, visión ni tool calling: es un modelo exclusivamente de audio.
- Soporte multilingüe limitado al inglés según la model card.
- No decide por sí mismo cuándo responder o interrumpir; proporciona las probabilidades para que la aplicación aplique su política.

## Casos de uso

- Detección de final de turno en asistentes de voz: el modelo pronostica con hasta 0,8 segundos de antelación si el usuario va a seguir hablando o va a ceder el turno, lo que permite a la aplicación decidir cuándo generar la respuesta sin esperar silencios largos.
- Interrupción (barge-in) controlada: al recibir audio simultáneo de micrófono y reproducción del agente, `p_now` y `vad` permiten detectar si el usuario ha empezado a hablar mientras el agente aún responde, habilitando la cancelación de la reproducción del agente.
- Agentes conversacionales en local en dispositivos Apple: al ejecutarse como `.mlmodelc` en macOS 15+ e iOS 18+, permite desplegar la lógica de turnos sin enviar audio a la nube, reduciendo latencia y preservando privacidad.
- Sistemas de subtitulado y transcripción con diarización implícita: los canales separados de usuario y agente y las salidas por hablante facilitan etiquetar quién habla en cada trama de 20 ms.
- Telefonía y centros de contacto con agentes virtuales: la ventana de 20 segundos y el procesamiento por tramas permiten integrar el modelo en pipelines de audio en tiempo real para gestionar el ritmo de la conversación.
- Evaluación y benchmarking de políticas de turn-taking: el modelo sirve como componente de referencia para comparar políticas de respuesta en conjuntos como TurnBench, con métricas de finales de turno detectados, falsas alarmas y retardo en tiempo de audio.
- Investigación en interacción humano-máquina: al ser un modelo pequeño (5,8 M de parámetros) con pesos abiertos, es viable para experimentación académica sobre predicción de turnos y actividad de voz.

## Benchmarks y rendimiento

La model card incluye un piloto de desarrollo sobre TurnBench con dos conversaciones en inglés (20 y 21), 148 finales de turno y 94 pausas intra-turno etiquetadas. No se seleccionó umbral sobre este piloto; se usó un umbral fijo de 0,9161 con la regla original de refractory de 2 segundos, leyendo la trama más reciente cada 500 ms.

| Backend | Finales de turno detectados | Falsas alarmas | Retardo en tiempo de audio (mediana) | Computo por peticion (mediana) |
|---|---:|---:|---:|---:|
| Core ML | 83,8% (124/148) | 2,1% (2/94) | 945,5 ms | 113,05 ms |
| ONNX Runtime | 83,8% (124/148) | 2,1% (2/94) | 945,5 ms | 377,93 ms |
| Checkpoint PyTorch original | 83,8% (124/148) | 2,1% (2/94) | 945,5 ms | 409,97 ms |

Tiempos de cómputo por petición de validación en Apple M5 Pro con 48 GiB, solo CPU, excluyendo la carga del modelo:

| Fixture | Tiempo de computo (ventana de 20 s) |
|---|---:|
| Silencio | 155,99 ms |
| Solo usuario | 111,54 ms |
| Solo agente | 114,72 ms |
| Ambos | 111,23 ms |

No se han publicado resultados de benchmarks estándar de NLP (MMLU, HumanEval, GSM8K) porque el modelo no realiza tareas de texto. Los datos anteriores son las únicas métricas disponibles en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 5,8 M de parámetros en Float32, lo que supone aproximadamente 23 MB de pesos; el grafo compilado ocupa 39,3 MB.
- GPU recomendadas: no requiere GPU dedicada; está diseñado para CPU y Neural Engine de Apple. Los tiempos de referencia se midieron en un Apple M5 Pro solo con CPU.
- Cabe en cualquier GPU de consumo e incluso en dispositivos móviles Apple; no se dispone de datos de rendimiento en GPU NVIDIA.
- Opciones de despliegue: Core ML nativo (`.mlmodelc`), SDK speech-swift (`SpeechVAD`) en macOS 15+ e iOS 18+, y ONNX Runtime como backend alternativo con paridad de resultados.
- Latencia y throughput: mediana de 113,05 ms por petición en Core ML frente a 377,93 ms en ONNX Runtime y 409,97 ms en PyTorch, sobre ventanas de 20 segundos en Apple M5 Pro. No se dispone de mediciones en teléfono ni de latencia de un agente desplegado completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| VAP-OTO-CoreML | 5,8 M | 20 s de audio | Prediccion de actividad de voz y turnos | CC BY 4.0 (pesos), MIT (codigo) | Core ML |
| Checkpoint PyTorch original (viks66/VAP_checkpoints) | 5,8 M | 20 s de audio | Prediccion de actividad de voz y turnos | CC BY 4.0 | PyTorch |
| Exportacion ONNX Runtime (misma fuente) | 5,8 M | 20 s de audio | Prediccion de actividad de voz y turnos | CC BY 4.0 | ONNX |

No se dispone de información sobre otros modelos comparables de detección de turnos en la documentación proporcionada. Las tres variantes comparten pesos y ofrecen resultados idénticos en el piloto de TurnBench; difieren únicamente en el formato y en el tiempo de cómputo por petición.

## Limitaciones y advertencias

- Es una exportación no oficial: los autores originales y el distribuidor del checkpoint no respaldan esta conversión.
- El modelo solo predice actividad de voz y turnos; no genera respuestas ni decide cuándo debe hablar el agente. La política de turnos es responsabilidad de la aplicación.
- No cachea estado de red para streaming: cada llamada recalcula la ventana completa de 20 segundos, lo que limita la eficiencia en conversaciones largas si se invoca con alta frecuencia.
- Solo soporta inglés según la model card; no se han evaluado otros idiomas.
- El piloto de TurnBench es reducido (dos conversaciones, 148 finales de turno) y no se seleccionó umbral sobre él; los resultados no deben generalizarse sin validación adicional.
- Las mediciones de latencia se realizaron en un Apple M5 Pro de escritorio y no reflejan el rendimiento en iPhone ni la latencia de un agente desplegado completo.
- Riesgo de sesgos y alucinaciones no documentado en la información disponible; al ser un modelo de clasificación de audio, el riesgo principal es la clasificación errónea de actividad de voz en condiciones acústicas adversas.
- La licencia CC BY 4.0 permite uso comercial con atribución; el código de arquitectura es MIT. Es necesario conservar los avisos de atribución incluidos en `NOTICE` y `LICENSE`.
- Para un agente inactivo es obligatorio proporcionar un canal de ceros de la misma longitud; de lo contrario, la entrada no es válida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aufklarer/VAP-OTO-CoreML
- Checkpoint fuente: https://huggingface.co/viks66/VAP_checkpoints
- Arquitectura VAP (Erik Ekstedt): https://github.com/ErikEkstedt/VoiceActivityProjection
- SDK speech-swift: https://github.com/soniqo/speech-swift
- Guia de integracion Swift: https://soniqo.audio/guides/turn-models/#swift
- Metodologia del leaderboard de turnos: https://huggingface.co/spaces/aufklarer/full-duplex-leaderboard/blob/main/protocol/turn-exports.md
