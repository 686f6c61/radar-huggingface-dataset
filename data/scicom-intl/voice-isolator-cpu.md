# Scicom-intl/voice-isolator-cpu

## Resumen

`voice-isolator-cpu` es un modelo de aislamiento de voz (target speaker extraction y mejora del habla) publicado por Scicom-intl en HuggingFace. Se trata de un aislador causal y en streaming del hablante principal, diseñado específicamente para agentes de voz: mantiene la voz del interlocutor (caller) y elimina otras voces y ruido antes de que el audio llegue al VAD, al detector de turnos y al reconocedor de voz del agente. Funciona íntegramente en CPU, con solo `onnxruntime` y `numpy` como dependencias, sin necesidad de PyTorch ni GPU.

Técnicamente, es una destilación del modelo GPU de la misma organización, [Scicom-intl/voice-isolator](https://huggingface.co/Scicom-intl/voice-isolator) (M + WavLM causal, 555M de parámetros), en un transformer de 22M de parámetros. Procesa audio a 16 kHz de entrada y salida, en tramas de 10 ms con solo 10 ms de latencia añadida, lo que lo hace apto para conversación en tiempo real. Su relevancia es alta en el contexto actual de agentes de voz en producción (LiveKit, pipelines de STT), donde la interferencia de voces ajenas degrada directamente la tasa de error de palabra (WER) del reconocimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con frame LSTM y band LSTMs, destilado de M + WavLM causal |
| Parametros totales | 22M |
| Parametros activos | 22M (no es MoE) |
| Longitud de contexto | Ventana de los últimos 10 s de audio |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Independiente del idioma (evaluado en inglés y mandarín; etiqueta de idioma: en) |
| Licencia | Other (no especificada en detalle en la model card) |
| Formato de pesos | ONNX (onnxruntime + numpy, sin torch) |

## Arquitectura y entrenamiento

El modelo es un transformer causal de 8 capas y anchura 384, con un frame LSTM y band LSTMs, que ve los últimos 10 segundos de audio. Es el resultado de destilar el modelo de mayor tamaño de la misma organización, [Scicom-intl/voice-isolator](https://huggingface.co/Scicom-intl/voice-isolator), que combina un modelo M con un WavLM causal y tiene 555M de parámetros. La destilación permite mantener el comportamiento del modelo grande reduciendo el coste de inferencia a niveles de CPU.

El procesado es estrictamente causal y en streaming: recibe audio a 16 kHz en cantidades arbitrarias (`push(chunk)`) y devuelve el audio aislado de cada salto completo de 10 ms, con un retardo total de 10 ms. Los detalles del conjunto de datos de entrenamiento, el número de tokens o horas de audio, y el procedimiento de optimización no están disponibles en la model card, aunque el paper asociado (*The Voice on the Line*, arXiv:2610.35272) describe la metodología y los benchmarks del sistema.

## Capacidades

- Aislamiento del hablante principal (target speaker extraction): extrae la voz del caller y suprime las demás voces de la llamada.
- Mejora del habla (speech enhancement): eliminación de ruido antes del VAD y del STT.
- Procesamiento causal en streaming: entrada de 16 kHz en tramas arbitrarias, salida por saltos de 10 ms, con 10 ms de retardo.
- Inferencia en CPU: solo requiere onnxruntime y numpy; sin torch ni GPU.
- Integración nativa con agentes de voz de LiveKit mediante el plugin `voice_isolator` (como `LocalIsolator` con este modelo, o `RemoteIsolator` apuntando al modelo GPU en un servidor), con prewarming incluido.
- Uso independiente de LiveKit mediante la API `voice_isolator.OnnxStream(model_dir).push(chunk)`.
- Eficacia demostrada suprimiendo palabras de terceros en reuniones (corpus AMI) y en mandarín (AliMeeting), reduciendo a cero o casi cero las transcripciones fantasma de otros hablantes en el STT.

## Casos de uso

- Agentes de voz en producción con LiveKit: el modelo se inserta como procesador de tramas en la entrada de audio, antes del VAD, el detector de turnos y el STT, evitando que voces de fondo activen respuestas del agente o contaminen la transcripción.
- Centros de llamadas con ruido de fondo: en llamadas de call-centre con otras personas hablando cerca del caller, el aislador elimina esas voces antes del reconocimiento, reduciendo el WER del STT.
- Reuniones y conferencias multipersona: en corpus como AMI, cuando el caller calla y otros hablan, el STT deja de transcribir a los terceros (por ejemplo, de 120 palabras fantasma a 0 en el ejemplo ES2004c), evitando que el agente responda a conversaciones ajenas.
- Detección de turnos fiable: al limpiar el audio de voces interferentes, el detector de turnos (turn detection) no confunde intervenciones de terceros con el fin del turno del caller.
- Despliegue en servidores sin GPU: al funcionar en CPU con un solo hilo (demostrado en los ejemplos con un agente LiveKit real), es adecuado para despliegues baratos, contenedores ligeros o edge.
- Complemento del modelo GPU en arquitecturas híbridas: el plugin permite usar este modelo en el cliente o agente local (`LocalIsolator`) y el modelo de 555M en un servidor (`RemoteIsolator`), según el presupuesto de cómputo.
- Procesamiento por lotes de grabaciones: `example.py` permite aislar un fichero completo fuera de línea para preprocesar datasets de audio.

## Benchmarks y rendimiento

Los datos publicados se centran en el efecto del aislador sobre el WER del STT posterior (media de 9 conjuntos de test, con sistemas en vivo salvo el protocolo de benchmark VoxLock, que toma la muestra de los primeros 15 s de la llamada). No se proporcionan las cifras numéricas agregadas en la model card, solo la figura. Se indica que Live VoxLock va por delante en dos de los nueve test: el benchmark Krisp VI (265 grabaciones) y las llamadas de call-centre con el caller solo.

Ejemplos concretos documentados (STT parakeet-tdt-0.6b-v3 salvo indicación):

| Ejemplo | Palabras de terceros sin aislador | Palabras de terceros con aislador | Caller correcto sin aislador | Caller correcto con aislador |
|---|---|---|---|---|
| AMI ES2004c (70 s) | 120 | 0 | 38/38 | 38/38 |
| AMI EN2002c (60 s, difícil) | 6 | 1 | 36/49 | 36/49 |
| AMI TS3003b (60 s) | 64 | 0 | 46/48 | 45/48 |
| AliMeeting R1019_M4035 (mandarín, whisper-large-v3) | 0 caracteres | 0 caracteres | 42/47 | 44/47 |

## Requisitos de hardware

- VRAM: no aplicable; el modelo funciona íntegramente en CPU (no requiere GPU ni torch).
- CPU: suficiente un solo hilo; la demo con agente LiveKit real se ejecutó con una hebra de CPU.
- Memoria y disco: el repositorio ocupa 0,2 GB; solo requiere `onnxruntime` y `numpy`.
- Consumer hardware: al no necesitar GPU, cabe en cualquier equipo moderno; también es viable en instancias cloud baratas sin acelerador.
- Despliegue: integración como plugin de LiveKit Agents (`LocalIsolator` / `VoiceIsolator` con `LocalIsolator("Scicom-intl/voice-isolator-cpu")`), o uso directo con `voice_isolator.OnnxStream(model_dir).push(chunk)`; soporta prewarming para reducir el arranque en frío.
- Latencia: retardo algorítmico de 10 ms sobre tramas de 10 ms a 16 kHz, apto para conversación full-duplex en tiempo real. Throughput detallado no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Hardware | Contexto/ventana | Latencia | Licencia |
|---|---|---|---|---|---|
| Scicom-intl/voice-isolator-cpu | 22M | CPU (onnxruntime) | últimos 10 s | 10 ms | Other |
| Scicom-intl/voice-isolator (GPU) | 555M (M + WavLM causal) | GPU | no disponible | no disponible | no disponible |
| Krisp VI (referencia de benchmark) | no disponible | no disponible | no disponible | no disponible | no disponible |

Comparado con su modelo profesor GPU de 555M, esta versión CPU sacrifica parte de capacidad (visible en casos difíciles como AMI EN2002c) a cambio de poder ejecutarse en cualquier CPU con 10 ms de retardo. Frente a soluciones comerciales como Krisp VI, la model card indica que Live VoxLock va por delante en dos de los nueve test, aunque sin cifras comparativas publicadas en la propia ficha.

## Limitaciones y advertencias

- En escenarios difíciles donde las voces interferentes son tenues, el aislador puede costar palabras del caller: en el ejemplo AMI EN2002c el caller tenía 49 palabras y el STT acertaba 36 tanto con como sin aislador, mientras que en otros ejemplos pierde 1 de 48 (TS3003b). Conviene evaluar sobre el audio real de cada despliegue.
- La model card está etiquetada con idioma `en`; aunque se muestra un ejemplo en mandarín (AliMeeting) con buen resultado, no hay garantías documentadas de rendimiento para otros idiomas.
- La licencia es `other` sin detalles en la model card: revisar los términos exactos antes de cualquier uso comercial.
- El modelo elimina todo lo que no sea el hablante principal: si la aplicación necesita transcribir a varios participantes, este aislador no es la herramienta adecuada, ya que está diseñado para conservar únicamente al caller.
- No hay cifras publicadas de métricas estándar de separación (SI-SNR, PESQ, etc.) en la model card; la evaluación se centra en el WER del STT posterior.
- Descargas todavía bajas (164 en el momento de la ficha) y proyecto reciente: madurez en producción limitada y comunidad reducida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Scicom-intl/voice-isolator-cpu
- Modelo GPU (profesor): https://huggingface.co/Scicom-intl/voice-isolator
- Paper: *The Voice on the Line*, arXiv:2610.35272 — https://arxiv.org/abs/2610.35272
- Plugin de LiveKit (`voice_isolator`, con `LocalIsolator`, `RemoteIsolator` y benchmark en streaming): https://github.com/Scicom-AI-Enterprise-Organization/STT-API/tree/main/stt_api/livekit_plugin/voice_isolator
