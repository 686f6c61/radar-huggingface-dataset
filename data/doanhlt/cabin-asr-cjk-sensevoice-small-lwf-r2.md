# doanhlt/cabin-asr-cjk-sensevoice-small-lwf-r2

## Resumen

`cabin-asr-cjk-sensevoice-small-lwf-r2` es un ajuste fino de SenseVoice-Small (FunAudioLLM, Alibaba Group), un modelo de reconocimiento automatico del habla (ASR) no autorregresivo con arquitectura encoder + CTC de 234 millones de parametros. Lo desarrolla el usuario `doanhlt` para la aplicacion Cabin Offline, donde actua como reconocedor de zh, yue, ja y ko y, simultaneamente, como etiquetador de idioma de audio para un sistema de identificacion de idioma (LID) bidireccional que tambien opera sobre audio en vi y en.

El modelo parte del checkpoint original `FunAudioLLM/SenseVoiceSmall` y aplica una destilacion de conocimiento a nivel de secuencia desde un profesor R13x (un ajuste fino de Qwen3-ASR-1.7B) combinada con una tecnica de *learning-without-forgetting*: el SenseVoiceSmall original congelado actua como profesor sobre audio de repeticion (vi, en, fr, de, es y CJK) para conservar el comportamiento previo en etiquetas de idioma, emocion y eventos sobre audio no CJK. El resultado es un paquete sherpa-onnx int8 intercambiable con el modelo publicado `sherpa-onnx-sense-voice-zh-en-ja-ko-yue-int8-2024-07-17`.

Su relevancia radica en que mejora el CER en chino, japones y coreano respecto al modelo original manteniendo el rendimiento en etiquetado de idioma, con un grafo, nombres de fichero y esquema int8 identicos, lo que permite un despliegue en dispositivo sin cambios en la integracion. El autor lo marca explicitamente como candidato, no como release, y no se ha medido aun en capturas reales de telefono ni en la suite de tarjetas inventadas de la aplicacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer no autorregresivo, encoder + CTC (SenseVoice-Small, FunASR) |
| Parametros totales | 234 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (esquema int8 del paquete sherpa-onnx); checkpoint fp32 en `funasr/` |
| Idiomas soportados | zh, yue, ja, ko, en (reconocimiento); vi, en, fr, de, es y CJK como audio de repeticion en el entrenamiento |
| Licencia | FunASR Model Open Source License Agreement v1.1 (Alibaba Group) |
| Formato de pesos | ONNX int8 (`model.int8.onnx`), checkpoint FunASR fp32 (`model.pt`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de SenseVoice-Small: un encoder transformer no autorregresivo con cabecera CTC, disenado para inferencia de baja latencia en dispositivo. El ajuste fino se realiza en dos rondas. La ronda 1 aplica destilacion de conocimiento a nivel de secuencia desde R13x, un ajuste fino de Qwen3-ASR-1.7B, lo que mejora el CER en CJK pero degrada las etiquetas de idioma, emocion y eventos sobre audio en vi y en. La ronda 2 anade *learning-without-forgetting*: el SenseVoiceSmall original congelado actua como profesor sobre audio de repeticion (vi, en, fr, de, es y CJK), de modo que se conservan las ganancias en CER CJK de la ronda 1 mientras las salidas de etiqueta de idioma, emocion y evento sobre audio no CJK vuelven al comportamiento original.

Los datos de entrenamiento combinan `espnet/yodas2` (con identificadores de video de YouTube CC BY 3.0 registrados en `attribution/yodas2_<lang>_video_ids.txt`) y `google/fleurs`. El autor indica que no se ha utilizado salida de Gemini, Soniox ni OpenAI (ni etiquetas, ni filtros, ni texto) y que no se emplean capturas de usuario. El checkpoint seleccionado en dev es `lwf_a_ep3`. El paquete mantiene el mismo grafo, nombres de fichero y esquema int8 que el modelo sherpa-onnx publicado, lo que garantiza paridad int8 y permite sustituirlo directamente.

## Capacidades

- Reconocimiento automatico del habla en chino mandarin, cantonés (yue), japones, coreano e ingles.
- Identificacion de idioma (LID) a nivel de audio, usada por el sistema bidireccional de la aplicacion Cabin Offline, que tambien procesa audio en vi y en.
- Etiquetado de emocion y de eventos acusticos, heredado de SenseVoiceSmall y preservado mediante el mecanismo de *learning-without-forgetting*.
- Inferencia en dispositivo con sherpa-onnx, sin dependencia de servidor.
- Salida CTC no autorregresiva, adecuada para baja latencia.
- No se documentan capacidades de tool calling, agentes, vision ni audio generativo.

## Casos de uso

- Reconocimiento de voz offline en aplicaciones moviles: el paquete int8 es intercambiable con el modelo sherpa-onnx publicado, por lo que se puede desplegar en Android o iOS sin modificar la integracion y sin conexion de red.
- Transcripcion multilingue CJK en dispositivos de bolsillo: cubre zh, yue, ja y ko con un unico modelo de 234 M, util para notas de voz y subtitulado local.
- Enrutado por idioma en asistentes de voz: la salida de LID permite decidir el idioma de la conversacion antes de invocar modulos especificos de traduccion o sintesis.
- Deteccion de emocion en audio para analisis de calidad de llamadas: las etiquetas de emocion heredadas permiten clasificar el tono del interlocutor en entornos de atencion al cliente, siempre que se valide en capturas reales.
- Preprocesado de corpus para pipelines de datos: la transcripcion y el etiquetado de idioma permiten filtrar y clasificar grandes volumenes de audio en yue, ja, ko y zh antes de un entrenamiento posterior.
- Prototipado de investigacion en destilacion ASR: el repositorio incluye checkpoints fp32, configuracion, CMVN y BPE, lo que sirve como punto de partida para reproducir o extender el ajuste fino.
- Clasificacion de eventos acusticos en grabaciones de campo: las salidas de evento permiten marcar segmentos con ruido o eventos relevantes antes de la transcripcion.

## Benchmarks y rendimiento

Resultados en conjuntos de test retenidos: CER % para zh, yue, ja y ko; WER % para en; intervalos de confianza del 95 % por bootstrap pareado de 10 000 remuestreos (* indica que el IC excluye 0). La ronda 1 es el piloto solo con destilacion desde R13x; la ronda 2 es la version publicada.

| Conjunto (n) | Publicado | Ronda 1 | Ronda 2 | r2 − publicado | r2 − r1 |
|---|---|---|---|---|---|
| sv_fleurs100_zh (100) | 9,08 | 8,41 | 8,63 | -0,45 [-0,92, +0,03] | +0,22 [-0,20, +0,71] |
| sv_fleurs100_ja (100) | 8,34 | 7,14 | 7,26 | -1,08 [-1,84, -0,42] * | +0,11 [-0,36, +0,66] |
| sv_fleurs100_ko (100) | 8,22 | 6,31 | 6,42 | -1,81 [-2,51, -1,17] * | +0,11 [-0,21, +0,41] |
| sv_fleurs100_yue (100) | 10,51 | 10,65 | 12,88 | +2,37 [+0,60, +4,09] * | +2,23 [+1,41, +3,07] * |
| sv_yodas2_zh_heldout_agree (1137) | 4,96 | 3,92 | 4,11 | -0,85 [-1,04, -0,67] * | +0,19 [+0,06, +0,32] * |
| sv_yodas2_zh_heldout_agree_clean (345) | 4,11 | 2,96 | 3,08 | -1,02 [-1,38, -0,69] * | +0,13 [-0,04, +0,30] |
| sv_yodas2_zh_heldout_caption (1472) | 27,67 | 28,09 | 27,88 | +0,22 [+0,06, +0,38] * | -0,21 [-0,36, -0,07] * |
| sv_yodas2_zh_heldout_caption_clean (552) | 36,47 | 36,68 | 36,32 | -0,16 [-0,47, +0,15] | -0,36 [-0,74, -0,05] * |
| sv_yodas2_ja_heldout_agree (686) | 9,00 | 6,61 | 7,32 | -1,68 [-1,99, -1,36] * | +0,72 [+0,49, +0,95] * |
| sv_yodas2_ja_heldout_agree_clean (101) | 6,50 | 5,93 | 6,00 | -0,50 [-0,89, -0,13] * | +0,07 [-0,27, +0,42] |
| sv_yodas2_ja_heldout_caption (930) | 22,29 | 22,11 | 21,65 | -0,64 [-0,94, -0,35] * | -0,46 [-0,74, -0,17] * |
| sv_yodas2_ja_heldout_caption_clean (160) | 29,50 | 29,52 | 29,62 | +0,12 [-0,25, +0,47] | +0,10 [-0,61, ...] |

La tabla del model card queda truncada en el ultimo intervalo de confianza del conjunto `sv_yodas2_ja_heldout_caption_clean`. El autor informa de que las compuertas automaticas pasan (GO): `cjk_kept`, `tags_not_worse`, `en_not_worse`, `lid_not_worse`, `int8_parity` y `size_rtf`. No se han publicado resultados en capturas reales de telefono ni en la suite de tarjetas inventadas de la aplicacion.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 234 M de parametros, el checkpoint fp32 ocupa aproximadamente 0,9 GB y el paquete int8 reduce el peso del repositorio a 1,2 GB incluyendo checkpoints y evaluacion.
- GPU recomendadas: no disponibles; el modelo esta disenado para inferencia en dispositivo mediante sherpa-onnx, no para GPU de servidor.
- Cabe en CPU movil y en GPU de consumo: si, por el tamano del modelo y el esquema int8; el autor no detalla que GPU de consumo concretas.
- Opciones de despliegue: sherpa-onnx (libreria declarada), con paquete `model.int8.onnx` y `tokens.txt` listos para cargar; el checkpoint fp32 en `funasr/` sirve para reentrenamiento.
- Latencia y throughput: el autor menciona una compuerta `size_rtf` superada, pero no se publican valores numericos de RTF en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cabin-asr-cjk-sensevoice-small-lwf-r2 | 234 M | no disponible | zh, yue, ja, ko, en | FunASR Model License v1.1 | HuggingFace, candidato |
| sherpa-onnx-sense-voice-zh-en-ja-ko-yue-int8-2024-07-17 | no disponible | no disponible | zh, en, ja, ko, yue | no disponible | Paquete sherpa-onnx publicado |
| FunAudioLLM/SenseVoiceSmall | 234 M | no disponible | zh, yue, ja, ko, en | FunASR Model License v1.1 | HuggingFace |
| Qwen3-ASR-1.7B (profesor R13x) | 1,7 B | no disponible | no disponible | Apache-2.0 (segun el autor) | no disponible |

## Limitaciones y advertencias

- Estado de candidato: el autor indica explicitamente que no es un release y que no se ha medido en capturas reales de telefono ni en la suite de tarjetas inventadas de la aplicacion.
- Regresion en cantonés: el CER en `sv_fleurs100_yue` empeora de 10,51 a 12,88 (+2,37, IC significativo) respecto al modelo publicado.
- Regresion leve en algunos conjuntos de chino: `sv_yodas2_zh_heldout_agree` y `sv_yodas2_zh_heldout_caption` muestran incrementos pequenos pero significativos en la ronda 2 frente a la ronda 1.
- Etiquetas de evento en audio CJK: el error de etiqueta en `sv_yodas2_zh_heldout_caption` sube de 3,19 a 3,53 y en `sv_yodas2_zh_heldout_caption_clean` de 8,33 a 8,88.
- Licencia no OSI: la FunASR Model Open Source License v1.1 permite uso, copia, modificacion y comparticion con atribucion y conservacion del nombre del modelo, pero se proporciona "solo con fines de referencia y aprendizaje", incluye una clausula de no desprestigio (4.2) cuyo incumplimiento anula la licencia, termina por violacion (5) y aplica revisiones automaticas del licenciante (6). El uso comercial dentro de una aplicacion no ha sido confirmado legalmente.
- Riesgo de alucinacion: no evaluado en la informacion disponible; como modelo CTC, el riesgo se manifiesta como sustituciones o inserciones en la transcripcion, no como texto generado libremente.
- Sesgos: no documentados en la informacion disponible; los datos de entrenamiento provienen de YODAS2 y FLEURS, con posible sesgo de dominio y de acento.
- Cobertura limitada: no se documentan capacidades de tool calling, agentes, vision ni audio generativo.

## Enlaces

- HuggingFace: https://huggingface.co/doanhlt/cabin-asr-cjk-sensevoice-small-lwf-r2
- Coleccion Cabin offline ASR: https://huggingface.co/collections/doanhlt/cabin-offline-asr-on-device-distilled-from-r13x-6ade0b05eb1f2ac4e49d7cf8
- Modelo base: https://huggingface.co/FunAudioLLM/SenseVoiceSmall
- Dataset YODAS2: https://huggingface.co/datasets/espnet/yodas2
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Codigo: repositorio privado `thinkprompt/cabin-offline-asr`, rama `feat/mobile-local-kit`, directorio `mobile-local/train/sensevoice/` (no accesible publicamente)
