# soniqo/VAP-OTO-ONNX

## Resumen

VAP-OTO-ONNX es una exportación no oficial al formato ONNX (opset 17) del checkpoint público `oto.ckpt` del repositorio `viks66/VAP_checkpoints`, basada en la arquitectura VoiceActivityProjection (VAP) de Erik Ekstedt. No se aplicó fine-tuning ni cuantización de pesos: el grafo es Float32 puro. El modelo escucha dos canales de audio sincronizados (usuario y agente) y pronostica la actividad de voz futura de cada hablante, proporcionando señales a una política de turnos; no decide por sí mismo cuándo debe responder un agente.

Con 5.785.117 parámetros y un grafo de 39,56 MB, es un modelo deliberadamente pequeño orientado a inferencia en tiempo real sobre ventanas de 20 segundos de audio estéreo a 16 kHz. Su relevancia actual radica en el creciente interés por sistemas de voz full-duplex y gestión de turnos (turn-taking) en asistentes conversacionales, donde predecir cuándo el usuario va a terminar de hablar es tan crítico como transcribir lo que dice.

La exportación la publica el usuario `soniqo` como parte de su SDK de voz (`speech-android` y `speech-core`), con licencia CC BY 4.0 para los pesos y MIT para el código de arquitectura. El modelo solo declara soporte de inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VoiceActivityProjection (VAP) de Erik Ekstedt; exportada a ONNX opset 17 |
| Parametros totales | 5.785.117 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de audio de 20 segundos (320.000 muestras estéreo a 16 kHz) |
| Tipos de cuantizacion | ninguna; Float32 |
| Idiomas soportados | inglés (en) |
| Licencia | CC BY 4.0 (pesos); MIT (código de arquitectura) |
| Formato de pesos | ONNX (opset 17), Float32; grafo de 39.564.833 bytes |
| Entrada | `audio`, shape `[1, 2, 320000]` (canal usuario, canal agente), PCM Float32 16 kHz |
| Salidas | `p_now`, `p_future`, `vad`, cada una `[1, 1000, 2]` |
| Bins de proyeccion | 0,2 s, 0,4 s, 0,6 s y 0,8 s |
| Frecuencia de muestreo | 16 kHz, estéreo, orden de canales usuario y luego agente |
| Modelo base | `viks66/VAP_checkpoints` (`oto.ckpt`) |
| Libreria | ONNX Runtime |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura VoiceActivityProjection propuesta por Erik Ekstedt, un modelo ligero diseñado específicamente para la predicción de actividad de voz en conversaciones de doble canal. Recibe simultáneamente las señales del usuario y del agente como dos canales de un tensor estéreo y produce tres salidas por fotograma: `p_now` (probabilidad de actividad inmediata, agregando los dos primeros bins de proyección), `p_future` (probabilidad de actividad futura, agregando los dos últimos bins) y `vad` (actividad de voz actual). Cada salida tiene 1.000 fotogramas con dos valores en orden `[usuario, agente]`.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; la model card de esta exportación no los detalla y remite al checkpoint original. La contribución técnica de esta publicación es la conversión fiel a ONNX: la validación compara todas las salidas sobre los 1.000 fotogramas contra el checkpoint PyTorch original en cuatro escenarios (silencio, solo usuario, solo agente y ambos), con un error absoluto máximo de 0,00000253, muy por debajo de la tolerancia de 0,0005. Es importante señalar que el grafo no mantiene estado de streaming entre llamadas: cada inferencia recalcula la ventana completa de 20 segundos.

## Capacidades

- Predicción de actividad de voz (VAD) por hablante en dos canales sincronizados.
- Pronóstico de actividad de voz futura a corto plazo (bins de 0,2 a 0,8 segundos) mediante `p_future`.
- Estimación de actividad inmediata mediante `p_now`, útil para detectar solapamientos y pausas.
- Detección de final de turno cuando se combina con una política externa de umbral y refractario.
- Soporte de conversaciones en inglés.
- Inferencia en CPU sin GPU, gracias a su tamaño reducido.
- Integración nativa con SDKs Kotlin/Android (`speech-android`) y C++ (`speech-core` con `SPEECH_CORE_WITH_ONNX=ON`).
- No soporta tool calling, function calling, agentes multi-paso, visión, audio generativo ni modo thinking; es un modelo puramente discriminativo de señal de audio.

## Casos de uso

- Gestión de turnos en asistentes de voz full-duplex: el modelo consume las señales del micrófono y de la reproducción del agente y alimenta una política que decide cuándo ceder la palabra, usando `p_future` para anticipar el final del turno del usuario.
- Detección de interrupciones (barge-in): al comparar `p_now` del usuario con la actividad del agente, el sistema puede detectar solapamientos y decidir si detener la reproducción en curso.
- Atención al cliente telefónica automatizada: integrado en un pipeline de ASR más LLM más TTS, el VAP aporta la capa de temporización que evita respuestas prematuras o silencios incómodos en conversaciones multi-turno.
- Agentes de voz en dispositivos móviles: con 5,8 M de parámetros y ejecución en CPU vía ONNX Runtime, cabe en un teléfono Android mediante el SDK `speech-android`, sin depender de la nube.
- Telefonía y centros de contacto con análisis de calidad: permite medir latencia de respuesta, solapamientos y pausas a partir de grabaciones estéreo de agente y cliente.
- Sistemas de subtitulado o transcripción en directo: la salida `vad` por canal puede segmentar hablantes y filtrar silencios antes de enviar audio al reconocedor, reduciendo coste de cómputo.
- Investigación en interacción conversacional: sirve como baseline reproducible en formato ONNX para experimentar con políticas de turn-taking sin necesidad de PyTorch.

## Benchmarks y rendimiento

Piloto de desarrollo TurnBench con dos conversaciones en inglés (20 y 21), 148 finales de turno y 94 pausas etiquetadas a mitad de turno. Lectura de la ventana de 20 segundos cada 500 ms, umbral fijo de 0,9161 y regla refractaria de 2 s:

| Backend | Finales detectados | Falsas alarmas | Retardo en tiempo de audio (mediana) | Cómputo por petición (mediana) |
|---|---:|---:|---:|---:|
| Core ML | 83,8% (124/148) | 2,1% (2/94) | 945,5 ms | 113,05 ms |
| ONNX Runtime | 83,8% (124/148) | 2,1% (2/94) | 945,5 ms | 377,93 ms |
| Checkpoint PyTorch original | 83,8% (124/148) | 2,1% (2/94) | 945,5 ms | 409,97 ms |

Tiempos de cómputo por petición en Apple M5 Pro, 48 GiB, solo CPU, ONNX Runtime con dos hilos (sin contar carga del modelo):

| Escenario | Tiempo de cómputo (ventana de 20 s) |
|---|---:|
| Silencio | 361,85 ms |
| Solo usuario | 359,69 ms |
| Solo agente | 351,98 ms |
| Ambos | 353,39 ms |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que no son aplicables a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el grafo Float32 ocupa unos 39,6 MB en memoria.
- GPU recomendadas: no aplica; el modelo está pensado para CPU.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) e incluso en dispositivos móviles, pero su uso natural es CPU.
- Despliegue: ONNX Runtime (validado con dos hilos), SDK `speech-core` en C++ con `SPEECH_CORE_WITH_ONNX=ON` y SDK `speech-android` en Kotlin. También existe una ruta Core ML mencionada en el piloto TurnBench.
- Latencia: 352-362 ms de cómputo por petición en Apple M5 Pro (CPU, dos hilos); 377,93 ms de mediana en el piloto ONNX Runtime frente a 113,05 ms en Core ML.
- Throughput: no disponible; el modelo se invoca típicamente cada 500 ms con la ventana completa, no en modo streaming incremental.
- Nota: cada llamada recalcula la ventana de 20 segundos completa; no hay caché de estado de red entre invocaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| VAP-OTO-ONNX (este) | 5,79 M | 20 s estéreo | ONNX Float32 | CC BY 4.0 / MIT | Exportación no oficial, validada contra el original |
| Checkpoint PyTorch original (`viks66/VAP_checkpoints`) | 5,79 M | 20 s estéreo | PyTorch | no disponible en la información | Referencia de paridad; 409,97 ms por petición |
| Core ML (misma arquitectura, según el piloto) | 5,79 M | 20 s estéreo | Core ML | no disponible | 113,05 ms por petición; mismo rendimiento de detección |
| Otros modelos VAD genéricos | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- Exportación no oficial: los autores originales y el distribuidor del checkpoint no respaldan esta conversión.
- Solo inglés declarado; el comportamiento en otros idiomas no está validado.
- No decide cuándo responder: es una fuente de señal para una política de turnos externa que debe implementar el umbral y la regla refractaria.
- Sin estado de streaming: cada llamada recalcula la ventana completa de 20 segundos, lo que limita el ahorro de cómputo en conversaciones largas.
- Requiere canales de igual longitud y sincronizados a 16 kHz; un agente inactivo necesita un canal de ceros de la misma longitud.
- Las métricas del piloto TurnBench se obtuvieron con solo dos conversaciones y un umbral fijo; no constituyen una evaluación representativa ni miden latencia completa en producción ni rendimiento en teléfono.
- Riesgo de falsos negativos y positivos en solapamientos o ruido de fondo no caracterizados en la información disponible.
- Licencia CC BY 4.0: permite uso comercial con atribución; el código de arquitectura es MIT.
- No se han publicado análisis de sesgos demográficos, acentos o condiciones acústicas adversas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/soniqo/VAP-OTO-ONNX
- Checkpoint base: https://huggingface.co/viks66/VAP_checkpoints
- Arquitectura VoiceActivityProjection (Erik Ekstedt): https://github.com/ErikEkstedt/VoiceActivityProjection
- SDK Android: https://github.com/soniqo/speech-android
- SDK C++: https://github.com/soniqo/speech-core
- Método del leaderboard full-duplex: https://huggingface.co/spaces/aufklarer/full-duplex-leaderboard/blob/main/protocol/turn-exports.md
