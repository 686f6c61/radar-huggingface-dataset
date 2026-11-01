# doanhlt/cabin-asr-vi-zipformer-streaming-r1

## Resumen

`cabin-asr-vi-zipformer-streaming-r1` es un modelo de reconocimiento automático del habla (ASR) en vietnamita desarrollado por el usuario `doanhlt`, diseñado específicamente para inferencia en streaming (causal, por chunks) y despliegue on-device mediante sherpa-onnx. Se trata de un transductor Zipformer2 entrenado con icefall, derivado por conversión causal del modelo offline `cabin-asr-vi-zipformer-offline-r2` y afinado sobre una mezcla de 258 horas (cortes del r2 más 168 horas de YODAS v1 vi etiquetadas por el profesor R13x). El modelo se distribuye en dos paquetes con chunks de 640 ms (`package-c32/`) y 320 ms (`package-c16/`), ambos con contexto izquierdo de 128 frames.

El modelo es relevante porque cubre un hueco concreto en el ecosistema: la transcripción con parciales en vivo y baja latencia para vietnamita, un idioma con menos recursos que el inglés o el chino en el ámbito ASR. Frente al modelo offline del que deriva, sacrifica precisión (entre +1,25 y +2,36 puntos de WER en los conjuntos de test) a cambio de emitir resultados parciales durante la captura de audio. El autor lo marca explícitamente como **candidato, no como release**: la aplicación de referencia todavía decodifica segmentos VAD en modo offline y este modelo aún no está integrado en ella.

La arquitectura es un transductor Zipformer2 con tokenizador BPE de 2000 unidades, exportado a ONNX (encoder y joiner en int8, decoder en fp32) para su uso con el `OnlineRecognizer` de sherpa-onnx. La licencia es Apache-2.0 y el repositorio ocupa 0,4 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Zipformer2 transducer (causal, chunked), icefall |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | contexto izquierdo de 128 frames; chunks de 640 ms y 320 ms |
| Tipos de cuantización | encoder y joiner en int8, decoder en fp32 (exportación oficial) |
| Idiomas soportados | vietnamita (`vi`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (paquetes sherpa-onnx) y `pretrained.pt` (state dict de icefall) |

## Arquitectura y entrenamiento

El modelo es un transductor Zipformer2 causal con tokenizador BPE de 2000 unidades (reutiliza `tokens.txt` y `bpe.model` del sherpa-vi distribuido). El entrenamiento se realizó con icefall sobre chunks dinámicos de 16, 32, 64 y -1 frames y contextos izquierdos de 64, 128, 256 y -1, con `max-duration` 200, precisión fp16 y una única A100 compartida con un límite de 6 GB. La exportación a ONNX se hace con `export-onnx-streaming.py` a chunk 16 y 32, contexto izquierdo 128, con encoder y joiner cuantizados a int8.

El punto de partida es una conversión causal del modelo offline `cabin-asr-vi-zipformer-offline-r2`, afinada durante 3 épocas sobre la mezcla de la ronda 3 (258 h: cortes del r2 más 168 h de YODAS v1 vi etiquetadas por el profesor R13x), con learning rate 0,0015. La selección de la variante final fue preregistrada: entre las tres ramas evaluadas (`xqs`, `xqs4`, `xqs3i`), se eligió la de menor WER medio de dev (FLEURS-vi dev + YODAS2-vi dev a 640 ms) entre aquellas cuyo gate de test propio pasó. Ganó `xqs` con 6,072 de WER medio de dev; `xqs3i` obtuvo 6,015 pero su gate de test falló y quedó excluida. Los conjuntos de test no se usaron para el ranking. El pipeline incluye knowledge distillation desde el modelo profesor R13x.

## Capacidades

- Reconocimiento de voz en vietnamita en modo streaming con parciales en vivo (resultados intermedios durante la captura).
- Dos modos de latencia: chunks de 640 ms (`package-c32/`) y de 320 ms (`package-c16/`), con el mismo peso y distinta configuración de decodificación.
- Decodificación greedy (`greedy_search`) mediante `sherpa_onnx.OnlineRecognizer.from_transducer`.
- Entrada de audio a 16 kHz con 80 dimensiones de features, pensada para callbacks de micrófono en piezas de 100 ms.
- Inferencia on-device: el modelo está pensado para ejecutarse localmente sin GPU, con encoder y joiner en int8.
- No soporta tool calling, agentes, visión, audio de entrada más allá del propio ASR ni capacidades multilingües: únicamente vietnamita.

## Casos de uso

- Subtitulado en vivo de reuniones y entrevistas en vietnamita: el paquete de 640 ms emite parciales con una latencia de chunk moderada, suficiente para subtítulos casi en tiempo real en una aplicación de escritorio o móvil.
- Dictado por voz en aplicaciones móviles: el modelo está exportado en ONNX int8 y pensado para sherpa-onnx, por lo que puede integrarse en apps Android/iOS o de escritorio sin conexión a un servidor.
- Transcripción de llamadas de atención al cliente con visualización progresiva: el modo streaming permite mostrar el texto mientras el agente habla, en lugar de esperar al cierre del turno.
- Asistentes de voz locales para vietnamita: al ser causal y on-device, encaja en pipelines de comandos de voz con requisitos de privacidad (el audio no sale del dispositivo).
- Generación de parciales para sistemas de búsqueda o resumen en directo: los resultados intermedios permiten disparar acciones (resaltado, búsqueda de palabras clave) antes de que termine el enunciado.
- Evaluación comparativa de ASR streaming en vietnamita: el repositorio incluye comparaciones pareadas con bootstrap (`eval/`), útiles como referencia metodológica para experimentos propios.
- Prototipado de captions de baja latencia en el paquete de 320 ms, aceptando el coste en WER (13,50 en cv13_vi_test200 frente a 10,73 del de 640 ms) a cambio de menor latencia.

## Benchmarks y rendimiento

Resultados de WER (%) con intervalos de confianza del 95 % por bootstrap pareado sobre enunciados (10.000 remuestreos); `*` indica que el intervalo excluye el 0.

| Referencia (640 ms) | fleurs100_vi | cv13_vi_test200 | yodas2_vi_heldout_agree_clean | yodas2_vi_heldout_caption_clean |
|---|---|---|---|---|
| este modelo (stream-c32) | 9,48 | 10,73 | 7,58 | 53,02 |
| frente al piloto streaming (stream-c32) | +0,17 n.s. | -1,01 n.s. | -0,74 * | -0,14 n.s. |
| frente al offline r2 rc1 | +2,04 * | +2,36 * | +1,96 * | +1,25 * |
| frente al sherpa-vi offline distribuido | -0,71 n.s. | +1,15 n.s. | +0,14 n.s. | +0,44 * |
| 320 ms: este modelo (stream-c16) | 10,39 | 13,50 | 8,55 | 53,40 |

Selección de variante (WER medio de dev a 640 ms, FLEURS-vi dev + YODAS2-vi dev):

| Rama | Receta | WER medio dev | Gate |
|---|---|---|---|
| xqs (ganadora) | conversión causal del offline r2, 3 épocas, LR 0,0015 | 6,072 | PASS |
| xqs4 | xqs continuada 3 épocas más, LR 0,001 (6 en total) | 6,062 | FAIL |
| xqs3i | conversión causal del offline r3, 3 épocas, LR 0,0015 | 6,015 | FAIL |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repositorio ocupa 0,4 GB y el modelo está diseñado para ejecución on-device en CPU.
- GPU recomendadas: no se especifican; el entrenamiento usó una A100 compartida con límite de 6 GB, pero la inferencia está orientada a CPU.
- Compatibilidad con GPU de consumo: el formato int8 de encoder y joiner y la librería sherpa-onnx apuntan a ejecución en CPU y dispositivos móviles; no se documentan requisitos de GPU de consumo.
- Opciones de despliegue: sherpa-onnx (Python, `OnlineRecognizer.from_transducer`); el modelo se distribuye como paquete sherpa-onnx con `encoder.int8.onnx`, `decoder.onnx`, `joiner.int8.onnx` y `tokens.txt`.
- Latencia y throughput: no se publican cifras de latencia ni de RTF; la latencia de emisión de parciales viene determinada por el tamaño de chunk (640 ms o 320 ms) más el coste de decodificación.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto / chunk | WER fleurs100_vi | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cabin-asr-vi-zipformer-streaming-r1 (este) | Zipformer2 transducer causal | 128 frames izq.; 640/320 ms | 9,48 | Apache-2.0 | HuggingFace, sherpa-onnx |
| cabin-asr-vi-zipformer-offline-r2 | Zipformer2 transducer offline | no aplica (offline) | 7,44 | Apache-2.0 | HuggingFace |
| sherpa-vi offline distribuido | Zipformer transducer offline | no aplica (offline) | 10,19 | Apache-2.0 | HuggingFace |
| cabin-asr-vi-zipformer-offline-r3 | Zipformer2 transducer offline | no aplica (offline) | no disponible | Apache-2.0 | HuggingFace |

La comparación principal es contra los modelos offline del mismo autor y contra el sherpa-vi distribuido: el streaming pierde entre 1,25 y 2,36 puntos de WER frente al offline r2 según el conjunto, y queda estadísticamente indistinguible del sherpa-vi offline en fleurs100_vi, cv13_vi_test200 y yodas2_vi_heldout_agree_clean (aunque pierde en caption_clean).

## Limitaciones y advertencias

- Estado de candidato, no de release: el propio autor lo etiqueta como "candidate, not a release"; no está integrado en la aplicación de referencia.
- Solo vietnamita: no hay soporte multilingüe ni code-switching documentado.
- Pérdida de precisión frente al offline: el WER sube de forma significativa frente al offline r2 en los cuatro conjuntos de test evaluados.
- WER muy alto en `yodas2_vi_heldout_caption_clean` (53,02 %), lo que sugiere un dominio (subtítulos/captions) donde el modelo rinde mal.
- El paquete de 320 ms empeora el WER de forma notable en cv13_vi_test200 (13,50) y yodas2 (8,55), por lo que la latencia reducida tiene un coste claro.
- Riesgo de alucinación y errores en audio ruidoso o con acentos no representados en el corpus de entrenamiento (YODAS, FLEURS, CV13, entre otros); no se documentan análisis de sesgo.
- El repositorio de código (`thinkprompt/cabin-offline-asr`) es privado, lo que limita la reproducibilidad completa del pipeline de entrenamiento.
- Licencia Apache-2.0 permite uso comercial, pero los datasets de origen tienen licencias propias (CC BY 3.0, CC BY 4.0, CC0) cuyas condiciones de atribución deben respetarse.
- El modelo base `zzasdf/viet_iter3_pseudo_label` y el profesor R13x son Apache-2.0; no se usaron salidas de Gemini, Soniox ni OpenAI en el entrenamiento según el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/doanhlt/cabin-asr-vi-zipformer-streaming-r1
- Modelo base offline: https://huggingface.co/doanhlt/cabin-asr-vi-zipformer-offline-r2
- Modelo offline r3: https://huggingface.co/doanhlt/cabin-asr-vi-zipformer-offline-r3
- Colección Cabin offline ASR: https://huggingface.co/collections/doanhlt/cabin-offline-asr-on-device-distilled-from-r13x-6ade0b05eb1f2ac4e49d7cf8
- sherpa-onnx: no se proporciona enlace en la información disponible
- icefall: no se proporciona enlace en la información disponible
- Repositorio de código `thinkprompt/cabin-offline-asr`: privado, sin enlace público
