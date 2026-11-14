# jptaylor/streaming-turn

## Resumen

Streaming Turn es un modelo de deteccion de fin de turno (end-of-turn detection) para agentes de voz construidos con Pipecat. Lo desarrolla jptaylor y se publica bajo licencia BSD-3-Clause. El modelo resuelve un problema concreto en conversaciones de voz con LLM: decidir en tiempo real si el usuario ha terminado de hablar o si simplemente ha hecho una pausa, de forma que el agente no interrumpa ni espere en exceso. A diferencia de los detectores basados en transcripcion, opera exclusivamente sobre audio crudo y nunca ve el texto de la conversacion.

Tecnicamente es un modelo pequeno y especializado: 4,0 millones de parametros con un encoder convolucional causal sobre log-mel y una GRU, que consume audio mono a 16 kHz y emite una prediccion cada 40 ms (25 frames por segundo). Su relevancia actual radica en que permite turn-taking de baja latencia en el propio dispositivo: 0,37 ms por fragmento de 40 ms en un nucleo Apple M-series con ONNX Runtime, lo que lo hace viable en entornos de produccion con recursos limitados.

La version mas reciente, `streaming-turn-v0.4`, anade una segunda salida de fin de turno (`eot_late`) pensada para usuarios que se quedan en silencio tras una pausa. El modelo es experimental, solo para ingles y con poca validacion en vivo segun el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder convolucional causal sobre log-mel + GRU, streaming |
| Parametros totales | 4,0 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa en flujo continuo por fragmentos de 40 ms; estado recurrente) |
| Tipos de cuantizacion | no disponible (se distribuye en fp32) |
| Idiomas soportados | ingles |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX (`streaming-turn-fp32.onnx`) y PyTorch (`.pt`) |

## Arquitectura y entrenamiento

El modelo es un detector de turnos puramente acustico y causal. La entrada es audio mono a 16 kHz en fragmentos de 640 muestras (40 ms); cada fragmento se convierte en caracteristicas log-mel y pasa por un encoder convolucional causal seguido de una GRU que mantiene el estado de streaming. La salida se emite a 25 frames por segundo e incluye la probabilidad de fin de turno (`eot`), una segunda probabilidad para usuarios que se han quedado callados (`eot_late`, solo en v0.4), una clasificacion de intencion (`intent`: continuer, assessment, negative, floor_take, non_speech), una etiqueta de lead-in (`leadin`), y salidas auxiliares de actividad de voz (`vad`) y prediccion de actividad de ambos hablantes en los siguientes 2 s (`vap`). Ademas recibe una entrada `bot_state` que indica si el bot esta hablando y desde hace cuanto tiempo.

El entrenamiento combina datos de Open Yap 1K v1.0, otoSpeech-full-duplex-280h (CC BY 4.0), la parte en ingles de los datos de entrenamiento de Smart Turn v3.2 (CC BY 4.0) y 600 negativos duros sinteticos. Se uso un encoder congelado de Whisper base.en como objetivo de destilacion y Smart Turn v3.2 proporciono etiquetas suaves de fin de turno. No se especifica el numero total de tokens ni horas de audio exactas. Cada version corresponde a una unica ejecucion de entrenamiento.

## Capacidades

- Deteccion de fin de turno en tiempo real sobre audio en streaming, con una prediccion cada 40 ms.
- Deteccion de backchannel (continuers y assessments) frente a toma de turno (floor-take), permitiendo al agente distinguir un "si, claro" de una interrupcion real.
- Segunda salida `eot_late` (v0.4) para gestionar usuarios que se quedan en silencio tras una pausa.
- Clasificacion de intencion del habla del usuario en cinco categorias.
- Etiquetado de lead-in (acknowledgement, hesitation, marker, reaction), aunque el propio autor indica que apenas supera el azar.
- Prediccion auxiliar de actividad de voz (`vad`) y de actividad de ambos hablantes en los proximos 2 s (`vap`).
- Integracion nativa con Pipecat mediante `TurnAnalyzerUserTurnStopStrategy`.
- No soporta tool calling, agentes multi-paso, vision ni audio generativo: es un componente especializado de turn-taking.

## Casos de uso

- Agentes de voz en atencion al cliente: el modelo decide en cada pausa si el cliente ha terminado de hablar, reduciendo interrupciones y esperas innecesarias en conversaciones multi-turno.
- Asistentes telefonicos con latencia estricta: con 0,37 ms por fragmento de 40 ms, el coste computacional del turn-taking es despreciable frente al del ASR o el LLM, lo que permite respuestas rapidas.
- Deteccion de interrupciones (barge-in) en asistentes conversacionales: la clasificacion `floor_take` permite al agente distinguir cuando el usuario quiere tomar la palabra de cuando solo emite un backchannel.
- Gestion de usuarios que dudan o se quedan en silencio: la salida `eot_late` de v0.4 permite cerrar el turno tras una pausa larga sin esperar al timeout de 3 s.
- Pipelines de voz embebidos o en el borde: el tamano de 4 M parametros y el formato ONNX permiten ejecutarlo en dispositivos con recursos limitados junto al resto del pipeline de Pipecat.
- Investigacion en interaccion conversacional: las salidas auxiliares de `vad` y `vap` permiten analizar la dinamica de turnos y la actividad de ambos hablantes en corpus de dialogo.
- Prototipado rapido de agentes de voz en ingles: la integracion con Pipecat y el snapshot de Hugging Face simplifican la puesta en marcha de un agente funcional.

## Benchmarks y rendimiento

Resultados sobre conversaciones retenidas de Open Yap 1K (1.259 fines de turno, 8.191 pausas), reproducidas a traves del VAD Silero de Pipecat sin que nadie responda:

| Version | Corta en una pausa | Responde en 500 ms | Responde en 1 s | Espera al timeout de 3 s |
|---|---|---|---|---|
| v0.4 | 4,9 % | 56,4 % | 79,7 % | 2,9 % |
| v0.2 | 4,6 % | 51,4 % | 82,2 % | 15,5 % |

Sobre los clips de test en ingles de Smart Turn v3.2 (7.820 clips, leidos 200 ms despues del fin del habla):

| Modelo | Precision |
|---|---|
| Streaming Turn v0.4 | 93,3 % |
| Streaming Turn v0.2 | 93,8 % |
| Smart Turn v3.2 | 93,5 % |

## Requisitos de hardware

- VRAM estimada: minima; con 4,0 M parametros en fp32 el modelo ocupa del orden de decenas de MB, por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. En un nucleo Apple M-series con ONNX Runtime registra 0,37 ms por fragmento de 40 ms.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) y en dispositivos embebidos.
- Opciones de despliegue: ONNX Runtime (formato principal) e integracion con Pipecat; los pesos PyTorch (`.pt`) permiten exportacion o ajuste adicional.
- Latencia: 0,37 ms por fragmento de 40 ms en un nucleo Apple M-series; el throughput no se detalla mas alla de esta cifra.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision (clips Smart Turn v3.2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Streaming Turn v0.4 | 4,0 M | streaming continuo | 93,3 % | BSD-3-Clause | Hugging Face (ONNX, PyTorch) |
| Streaming Turn v0.2 | 4,0 M | streaming continuo | 93,8 % | BSD-3-Clause | Hugging Face (ONNX, PyTorch) |
| Smart Turn v3.2 | no disponible | no disponible | 93,5 % | no disponible | Hugging Face (pipecat-ai) |

No se dispone de datos de otros detectores de fin de turno comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo experimental: una unica ejecucion de entrenamiento por version y poca validacion en vivo, segun el autor.
- Solo ingles; no soporta otros idiomas.
- Las conversaciones retenidas proceden de un corpus sobre el que el modelo entreno (aunque sean conversaciones distintas), lo que puede inflar las metricas.
- Es imprescindible mantener actualizada la entrada `bot_state`; v0.4 se contiene hasta que el bot ha hablado en la sesion.
- Si el modelo confunde una frase terminada con una inacabada, la respuesta espera al timeout de 3 s.
- La mitad de los objetivos de fin de turno en los clips de Smart Turn son predicciones del propio Smart Turn v3.2, por lo que la evaluacion no es independiente de ese modelo.
- Entrenado con conversacion humano-humano y clips de un solo hablante, con eco simulado; los codecs telefonicos no estan probados.
- La salida `leadin` apenas supera el azar, por lo que no deberia usarse como senal fiable en produccion.
- Licencia BSD-3-Clause: permite uso comercial, pero conviene revisar las condiciones de los datos de entrenamiento (Open Yap 1K, otoSpeech, Smart Turn) para usos derivados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jptaylor/streaming-turn
- Repositorio de codigo (Pipecat turn analyzers): https://github.com/jptaylor/streaming-turn
- Pipecat: https://github.com/pipecat-ai/pipecat
- Open Yap 1K: https://theagenticdatacompany.com/open-yap-1k
- Dataset otoSpeech-full-duplex-280h: https://huggingface.co/datasets/otoearth/otoSpeech-full-duplex-280h
- Dataset Smart Turn v3.2: https://huggingface.co/datasets/pipecat-ai/smart-turn-data-v3.2-train
- Whisper base.en: https://huggingface.co/openai/whisper-base.en
