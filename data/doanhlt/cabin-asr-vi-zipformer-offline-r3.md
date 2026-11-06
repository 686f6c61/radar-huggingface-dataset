# doanhlt/cabin-asr-vi-zipformer-offline-r3

## Resumen

cabin-asr-vi-zipformer-offline-r3 es un modelo de reconocimiento automático del habla (ASR) para vietnamita, offline y no streaming, desarrollado por el usuario doanhlt para su aplicación Cabin Offline. Se trata de un transductor Zipformer2 de 68,6 M de parámetros con tokenizador BPE de 2000 unidades, exportado a ONNX y empaquetado para la librería sherpa-onnx. La versión publicada es una release candidate (rc1) fechada el 30 de octubre de 2026, pensada como reemplazo directo del modelo vietnamita ya distribuido con la aplicación (`sherpa-onnx-zipformer-vi-int8-2025-04-20`), manteniendo la misma arquitectura y los mismos nombres de fichero.

El modelo se obtiene por destilación de conocimiento desde un modelo mayor denominado R13x (no especificado en la información disponible) y afina desde la revisión anterior r2 sobre 258 horas de audio, de las cuales 168 horas son nuevas transcripciones vietnamitas de YODAS v1. El objetivo es claro: mejorar la precisión en habla conversacional real (vídeo de YouTube) sin sacrificar el rendimiento en corpus de referencia como FLEURS o Common Voice, y manteniendo un tamaño de paquete de 79,3 MB apto para ejecución en dispositivo.

Su relevancia actual radica en que demuestra una metodología de destilación iterativa con puertas de calidad pre-registradas y comparaciones estadísticas por bootstrap emparejado, algo poco habitual en modelos ASR pequeños. No obstante, el propio autor advierte que aún no se ha medido en capturas reales de teléfono ni en RTF sobre ARM, por lo que la etiqueta de release candidate sigue vigente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Zipformer2 transducer (encoder + decoder + joiner), exportado a ONNX |
| Parámetros totales | 68,6 M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo no streaming, ventana de audio por segmento) |
| Tipos de cuantización | int8 en encoder y joiner (QInt8, esquema del modelo distribuido); decoder en fp32; export fp32 de referencia en `package-fp32/` |
| Idiomas soportados | vietnamita (vi) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX + `tokens.txt` + `bpe.model`; state dict de icefall en `icefall/pretrained.pt` |

## Arquitectura y entrenamiento

El modelo es un transductor Zipformer2, la arquitectura de encoder convolucional con atención eficiente desarrollada en el ecosistema icefall (k2-fsa), combinada con un decoder y un joiner para decodificación tipo transducer. La tokenización es BPE con vocabulario de 2000 unidades. La inferencia se realiza con búsqueda greedy a 16 kHz con características fbank de 80 dimensiones, replicando exactamente la configuración que la aplicación Cabin Offline usa para construir su reconocedor vietnamita mediante `OfflineRecognizer.from_transducer`.

El entrenamiento parte del checkpoint de r2 y se afina sobre 258 horas: 168 horas de nuevas transcripciones vietnamitas de YODAS v1 (transcritas por R13x, licencia Apache-2.0) más todos los cortes que ya usaba r2. Los datos de evaluación y referencia provienen de espnet/yodas, espnet/yodas2, google/fleurs y mozilla-foundation/common_voice_13_0. La innovación metodológica destacable es el uso de un brazo de control (r3ctl) entrenado con el mismo punto de partida, épocas, learning rate y semilla pero solo con los datos antiguos, para aislar el efecto de los datos nuevos, junto con puertas de calidad pre-registradas antes del entrenamiento (`distill/gate_r3.py`). El checkpoint de icefall corresponde a la época 2 con media 1.

## Capacidades

- Reconocimiento de voz offline (no streaming) en vietnamita, con salida de transcripción textual.
- Decodificación greedy sobre audio de 16 kHz con fbank de 80 dimensiones.
- Ejecución en dispositivo mediante sherpa-onnx, con encoder y joiner cuantizados a int8 y decoder en fp32.
- Manejo de habla conversacional espontánea, incluyendo audio de YouTube (YODAS), además de corpus leídos (FLEURS, Common Voice).
- Exportación reproducible: re-exportar el state dict con `export-onnx.py` de icefall produce ficheros ONNX idénticos byte a byte.
- Punto de partida para fine-tuning posterior mediante `--finetune-ckpt` sobre `icefall/pretrained.pt`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio más allá de ASR ni modo thinking.

## Casos de uso

- Transcripción offline en aplicaciones móviles: el paquete de 79,3 MB con encoder y joiner int8 está diseñado para cargarse con sherpa-onnx en el dispositivo, sin conexión de red, cubriendo dictado y notas de voz en vietnamita.
- Subtitulado de vídeo conversacional: el modelo mejora de forma significativa en el conjunto held-out de YODAS2 con referencia R13x ∩ caption (5,12 % WER frente a 7,43 % del modelo distribuido), lo que lo hace adecuado para generar subtítulos de contenido hablado espontáneo en YouTube.
- Asistentes de voz locales: al ser no streaming y de baja latencia sobre CPU, puede integrarse en asistentes que procesan un enunciado completo antes de responder, preservando la privacidad al no enviar audio a servidores.
- Transcripción de entrevistas y reuniones: la model card incluye una prueba de ASR de entrevistas dentro del release check, lo que respalda su uso en grabaciones de audio de larga duración segmentadas en ventanas.
- Evaluación comparativa de pipelines ASR: los conjuntos held-out limpios y los scripts de bootstrap emparejado permiten reutilizar el modelo como referencia en experimentos de destilación o cuantización.
- Punto de partida para adaptación de dominio: el state dict de icefall permite afinar el modelo con datos propios (por ejemplo, jerga sectorial) usando `--finetune-ckpt`, manteniendo el mismo grafo de exportación.
- Sustitución directa en producción: al conservar nombres de fichero y arquitectura del modelo distribuido, puede reemplazarlo en una aplicación existente sin cambios de código, siempre que se superen las pruebas pendientes de capturas reales y RTF en ARM.

## Benchmarks y rendimiento

Resultados de WER (%) sobre vietnamita; menor es mejor. Intervalos de confianza al 95 % por bootstrap emparejado sobre enunciados, 10.000 remuestreos; * indica que el IC excluye 0.

| Conjunto (n) | Distribuido | r2 | r3 (este) | r3 − distribuido | r3 − r2 |
|---|---|---|---|---|---|
| FLEURS-100 vi (puerta ≤ 10,22) (100) | 10,19 | 7,44 | 7,64 | -2,55 [-4,47, -1,12] * | +0,20 [-0,26, +0,68] n.s. |
| CV13-vi test200 (200) | 9,58 | 8,37 | 8,37 | -1,21 [-2,47, +0,06] n.s. | +0,00 [-0,98, +0,98] n.s. |
| YODAS2 held-out clean, ref = R13x ∩ caption (463) | 7,43 | 5,61 | 5,12 | -2,31 [-2,73, -1,90] * | -0,49 [-0,79, -0,21] * |
| YODAS2 held-out clean, ref = caption (899) | 52,59 | 51,78 | 51,62 | -0,97 [-1,31, -0,64] * | -0,16 [-0,36, +0,04] n.s. |

Comparación con el brazo de control (r3ctl: mismo punto de partida, épocas, LR y semilla solo con datos de r2):

| Conjunto | r3ctl | r3 | r3 − r3ctl |
|---|---|---|---|
| FLEURS-100 vi | 7,61 | 7,64 | +0,03 [-0,44, +0,49] n.s. |
| CV13-vi test200 | 8,23 | 8,37 | +0,13 [-0,86, +1,13] n.s. |
| YODAS2 held-out clean, ref = R13x ∩ caption | 5,56 | 5,12 | -0,43 [-0,69, -0,19] * |
| YODAS2 held-out clean, ref = caption | 51,68 | 51,62 | -0,06 [-0,25, +0,13] n.s. |

Comprobación de release (rc1): comparación int8 frente a fp32 y frente al modelo distribuido.

| Conjunto (n) | Distribuido int8 | r3 fp32 | r3 int8 | int8 − fp32 | int8 − distribuido |
|---|---|---|---|---|---|
| FLEURS-100 vi (100) | 10,19 | 7,61 | 7,64 | +0,03 [-0,11, +0,18] n.s. | -2,55 [-4,47, -1,12] * |
| CV13-vi test200 (200) | 9,58 | 8,37 | 8,37 | +0,00 [-0,46, +0,41] n.s. | -1,21 [-2,47, +0,06] n.s. |
| YODAS2 held-out clean, ref = R13x ∩ caption (463) | 7,43 | 5,16 | 5,13 | -0,03 [-0,13, +0,07] n.s. | -2,31 [-2,73, -1,89] * |
| YODAS2 held-out clean, ref = caption (899) | 52,58 | 51,59 | 51,62 | +0,03 [-0,06, +0,12] n.s. | -0,96 [-1,... (dato truncado en la información disponible) |

Puertas de calidad: la puerta de ronda 3 pasa los seis criterios (fleurs_le_10.22, not_worse_than_r2, beats_r2_conversational, beats_control_conversational, beats_shipped_caption_clean, size_within_2pct_of_r2). La puerta de publicación pasa los cinco criterios (fleurs100_le_10.22, sig_better_than_shipped_on_ge_2_sets, not_sig_worse_than_previous_on_any_set, size_within_5pct_of_shipped, rtf_within_10pct_of_shipped). El paquete ocupa 79,3 MB frente a 77,4 MB del distribuido, con el mismo grafo. El RTF en CPU se midió en un AMD EPYC 7313 de 16 núcleos; el valor concreto no se detalla en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo está pensado para CPU y ejecución en dispositivo, con un paquete de 79,3 MB, por lo que la huella de memoria es reducida (no se publica cifra exacta).
- GPU recomendadas: no se documentan; el release check se ejecutó en CPU (AMD EPYC 7313, 16 núcleos). Al ser un modelo de 68,6 M de parámetros, cualquier GPU consumer moderna puede alojarlo, pero no hay datos publicados al respecto.
- ¿Cabe en GPU consumer? Sí por tamaño, pero no hay mediciones publicadas de VRAM ni de latencia en GPU.
- Opciones de despliegue: sherpa-onnx mediante `OfflineRecognizer.from_transducer` (greedy, 16 kHz, fbank de 80 dimensiones, encoder y joiner int8, decoder fp32). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: RTF medido en CPU dentro del release check y en la puerta de publicación (criterio rtf_within_10pct_of_shipped), pero el valor numérico no está disponible en la información proporcionada. El RTF en ARM (dispositivo) está pendiente de medición y es uno de los criterios que bloquean el paso a versión distribuida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER FLEURS-100 vi | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cabin-asr-vi-zipformer-offline-r3 (este) | 68,6 M | no disponible (no streaming) | 7,64 | Apache-2.0 | Hugging Face, rc1 |
| sherpa-onnx-zipformer-vi-int8-2025-04-20 (distribuido) | no disponible | no disponible | 10,19 | no disponible en la información | Distribuido con la app |
| cabin-asr-vi-zipformer-offline-r2 | no disponible (mismo orden de magnitud, tamaño de paquete dentro del 2 % de r3) | no disponible | 7,44 | Apache-2.0 | Hugging Face |
| R13x (modelo profesor) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Estado release candidate: no se ha medido en capturas reales de teléfono (solo Mac), ni en la suite de tarjetas inventadas de la aplicación, ni el RTF en ARM; estos tres puntos bloquean el paso a versión distribuida.
- El WER sobre el conjunto YODAS2 con referencia caption es muy alto (51,62 %), lo que refleja la dificultad del habla conversacional y la calidad de la referencia, no necesariamente un fallo del modelo; conviene interpretarlo con cautela.
- La mejora frente a r2 solo es significativa en el conjunto conversacional con referencia R13x ∩ caption; en FLEURS, CV13 y caption-clean las diferencias están dentro del ruido estadístico.
- La mejora frente al modelo distribuido en CV13 tiene un intervalo de confianza que toca el cero (-1,21 [-2,47, +0,06]), por lo que no es concluyente.
- Modelo monolingüe: solo vietnamita; no se documenta soporte multilingüe.
- No es streaming: requiere disponer del enunciado completo antes de transcribir, lo que limita su uso en dictado en tiempo real.
- Riesgo de alucinación y errores en audio con ruido, acentos no representados o solapamiento de hablantes; no se documentan evaluaciones específicas de sesgo.
- La licencia Apache-2.0 permite uso comercial, pero el audio de entrenamiento YODAS se atribuye como CC BY 3.0 y los identificadores de vídeo están en `attribution/`; conviene revisar las obligaciones de atribución si se redistribuye el modelo o datos derivados.
- El código de entrenamiento y evaluación (`thinkprompt/cabin-offline-asr`) está en un repositorio privado de GitHub, lo que dificulta la reproducción independiente de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/doanhlt/cabin-asr-vi-zipformer-offline-r3
- Modelo base r2: https://huggingface.co/doanhlt/cabin-asr-vi-zipformer-offline-r2
- Colección Cabin offline ASR: https://huggingface.co/collections/doanhlt/cabin-offline-asr-on-device-distilled-from-r13x-6ade0b05eb1f2ac4e49d7cf8
- Repositorio de código (privado): `thinkprompt/cabin-offline-asr`, rama `feat/mobile-local-kit`
- Dataset YODAS: https://huggingface.co/datasets/espnet/yodas
- Dataset YODAS2: https://huggingface.co/datasets/espnet/yodas2
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Dataset Common Voice 13.0: https://huggingface.co/datasets/mozilla-foundation/common_voice_13_0
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- icefall: https://github.com/k2-fsa/icefall
