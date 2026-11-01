# LaToucheCarre/LaToucheCarre-Voix-XL-Parakeet-Ultra-0.6B-F16-GGML

## Resumen

Parakeet Ultra 0.6B F16 GGML es una conversión al formato ggml del modelo de reconocimiento automático del habla (ASR) `moondream/parakeet-ultra`, un post-entrenamiento del `nvidia/parakeet-tdt-0.6b-v3` de NVIDIA. Lo publica LaToucheCarre, desarrollador del asistente de escritura local La Touche Carré para Windows, como artefacto estable y verificable del palier "Voice XL" de su producto de dictado. El modelo resuelve dictado y transcripción de voz en local, sin enviar audio a servidores externos.

Arquitectura Parakeet TDT (Token-and-Duration Transducer) con aproximadamente 0,6 mil millones de parámetros, encoder convolucional y decodificador transducer. El repositorio contiene un único archivo en precisión F16 de 1,26 GB, legible por `parakeet-cli` de whisper.cpp. Soporta francés e inglés, con comportamiento multilingüe heredado del modelo base.

La relevancia práctica está en que ofrece, según las mediciones del autor, una tasa de error por palabra (WER) del 4,11 % en su banco de voz, por debajo del Parakeet TDT 0.6B v3 original (4,72 %) y del Whisper large-v3 french distil (4,72 %), con un consumo de 1.098 MB de RAM y 1.667 MB de VRAM en la variante F16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Parakeet TDT (Token-and-Duration Transducer), encoder convolucional + decodificador transducer |
| Parametros totales | 0,6B (aproximadamente 600 millones; el nombre del modelo base indica 0.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; procesa audio, no texto con ventana de contexto) |
| Tipos de cuantizacion | F16 en este repositorio; el autor publica además Q3_K, Q5_K, Q6_K y Q8_0 en otros palieres |
| Idiomas soportados | fr, en, multilingual |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ggml (`.bin`), F16 |
| Tamano del archivo | 1.255.897.319 bytes (1,26 GB) |
| SHA-256 | `ee42f83ae751d7b3f9c435543df92ea6926f2d73df3129186a1ab58a8c7b6150` |
| Libreria / runtime | whisper.cpp (`parakeet-cli`) |
| Entrada de audio | WAV 16 kHz mono |
| Modelo base | moondream/parakeet-ultra (revision `73175eb7ae`), a su vez post-entrenamiento de nvidia/parakeet-tdt-0.6b-v3 |

## Arquitectura y entrenamiento

El modelo es un transducer TDT de Parakeet, no un transformer encoder-decoder clasico tipo Whisper. El encoder es convolucional y el decodificador es un transducer con prediccion conjunta de token y duracion (Token-and-Duration Transducer), lo que permite emitir varios tokens por paso y modelar explicitamente la duracion de cada emision. El proceso de conversion descrito por el autor recoge esta estructura: se copia la cabecera del ggml f32 oficial de Parakeet TDT 0.6B v3 (hiperparametros, banco de filtros mel, ventana, duraciones TDT, jetones) y se sustituye cada tensor por su homologo de `model.safetensors` del modelo Ultra, con renombrado de nomenclatura transformers a NeMo, repliegue de los sesgos LSTM `ih` en `hh` y reordenacion de puertas `[i,f,g,o]` a `[i,f,o,g]`. La similaridad coseno con el tensor v3 original es mayor o igual a 0,954 en todos los tensores; la cabeza VAD se descarta.

El post-entrenamiento especifico de `moondream/parakeet-ultra` sobre Parakeet v3 no se detalla en la informacion disponible: no se indica numero de tokens, composicion del dataset ni si hubo RLHF o DPO. La cuantizacion a F16 se hizo con un script propio (`f32_vers_f16.py`) que replica las reglas de `convert-parakeet-to-ggml.py` de whisper.cpp: permanecen en f32 los tensores de menos de dos dimensiones, sesgos, normas, convoluciones 4D de `pre_encode` y `depthwise_conv.weight`. El autor valida el script aplicandolo al f32 oficial de Parakeet v3 y obteniendo el f16 de `ggml-org/parakeet-GGUF` byte a byte.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) en frances e ingles, con soporte multilingue declarado.
- Dictado en tiempo real o por lotes sobre audio WAV de 16 kHz mono.
- Modelado de duraciones TDT, que reduce emisiones repetidas y mejora la alineacion temporal respecto a transducers clasicos.
- Ejecucion local en CPU o GPU via Vulkan con `parakeet-cli`.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio de entrada mas alla de la transcripcion.
- El autor indica que el ingles forzado en modo frances se transcribe tal cual, igual que en Parakeet v3: no hay traduccion automatica.

## Casos de uso

- Dictado de escritorio en local: integrado en el asistente La Touche Carre, el modelo transcribe la voz del usuario sin salir de la maquina, con verificacion de integridad por SHA-256 antes de cargar el archivo.
- Transcripcion de reuniones y notas de voz: con 188 s de audio procesados en 3,6 a 4,4 s sobre RTX 5090, permite transcribir grabaciones largas en una sola pasada y con latencia baja.
- Subtitulado y actas en frances e ingles: el WER del 4,11 % medido por el autor en su banco de voz lo hace adecuado para generar borradores de subtitulos que luego se revisan manualmente.
- Despliegue en equipos sin GPU: en CPU rinde del orden de x0,1 a x0,2 del tiempo real, suficiente para transcripcion por lotes no interactiva.
- Aplicaciones de accesibilidad: dictado por voz para usuarios con movilidad reducida, ejecutandose en local por privacidad.
- Procesamiento por lotes en servidor con GPU: al ser un modelo de 0,6B en F16 (1,26 GB), permite muchas instancias concurrentes en una sola GPU y encaja en pipelines de transcripcion masiva.
- Investigacion en ASR: sirve como punto de comparacion reproducible frente a Parakeet v3 y Whisper, con el mismo runtime y cuantizaciones equivalentes.

## Benchmarks y rendimiento

Mediciones del autor en su banco de voz del 27/10/2026 (Ryzen 7 7800X3D, RTX 5090, `parakeet-cli` con Vulkan, una pasada). Corpus: dictado casero de 17 s, voz real con homofonos de 25 s y FLEURS leido de 2 min 26 s; aproximadamente 2.830 caracteres y 487 palabras de referencia. Errores = caracteres erroneos tras normalizar numeros.

| Modelo / cuantizacion | Bytes | Errores d/p/f | Total | CER % | WER % | FLEURS % palabras | RAM / VRAM MB |
|---|---|---|---|---|---|---|---|
| Ultra Q2_K (descartado) | 272.917.479 | 51/47/610 | 708 | 25,19 | 41,48 | 53,95 | 396 / 684 |
| Ultra Q3_K | 334.751.719 | 1/4/20 | 25 | 0,89 | 3,90 | 95,64 | 395 / 746 |
| Ultra Q4_K (descartado) | 415.611.879 | 1/1/27 | 29 | 1,03 | 4,52 | 94,55 | 470 / 827 |
| Ultra Q5_K | 491.715.559 | 1/1/23 | 25 | 0,89 | 4,11 | 95,10 | 543 / 903 |
| Ultra Q6_K | 572.575.719 | 1/1/23 | 25 | 0,89 | 4,11 | 95,10 | 621 / 984 |
| Ultra Q8_0 | 668.757.119 | 1/1/23 | 25 | 0,89 | 4,11 | 95,10 | 713 / 1.080 |
| Ultra F16 (este repo) | 1.255.897.319 | 1/1/23 | 25 | 0,89 | 4,11 | 95,10 | 1.098 / 1.667 |
| Parakeet TDT 0.6B v3 Q3_K (ref.) | 334.751.719 | 1/2/28 | 31 | 1,10 | 4,72 | 94,55 | 396 / 746 |
| Whisper large-v3 french distil Q5_0 (ref.) | 791.369.259 | 0/0/36 | 36 | 1,28 | 4,72 | 93,73 | 843 / 1.207 |

Observaciones del autor: Q3_K a F16 obtienen practicamente el mismo resultado, de modo que la escala de palieres es de memoria, no de precision; Q8_0 y F16 producen el mismo texto caracter a caracter; Q2_K se degrada gravemente. La velocidad es similar entre cuantizaciones sobre la misma tarjeta (188 s de audio en 3,6 a 4,4 s); en CPU, del orden de x0,1 a x0,2 del tiempo real.

## Requisitos de hardware

- VRAM en F16: aproximadamente 1.667 MB segun la medicion del autor (1.098 MB de RAM del sistema en el mismo equipo).
- VRAM en Q8_0: aproximadamente 1.080 MB; en Q6_K: 984 MB; en Q5_K: 903 MB; en Q3_K: 746 MB.
- GPU probada: RTX 5090 con backend Vulkan. No se publican mediciones en otras GPU.
- Cabe en GPU de consumo: con 1,7 GB de VRAM en F16, entra en cualquier GPU con 2 GB o mas; las variantes Q3_K a Q6_K entran en GPUs de 1 GB.
- Despliegue: `parakeet-cli` de whisper.cpp con backend Vulkan (`-dev N` selecciona dispositivo); `-ng` fuerza CPU. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI, al ser un modelo ASR con runtime propio.
- Throughput medido: 188 s de audio en 3,6 a 4,4 s sobre RTX 5090 (aproximadamente 43-52x tiempo real); en CPU, x0,1 a x0,2 del tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | WER % (banco del autor) | Licencia | Formato |
|---|---|---|---|---|---|
| Parakeet Ultra 0.6B F16 (este repo) | 0,6B | audio WAV 16 kHz mono | 4,11 | CC-BY-4.0 | ggml F16 |
| Parakeet TDT 0.6B v3 Q3_K | 0,6B | audio WAV 16 kHz mono | 4,72 | CC-BY-4.0 | ggml Q3_K |
| Whisper large-v3 french distil Q5_0 | no disponible en la informacion | audio WAV 16 kHz mono | 4,72 | no disponible en la informacion | ggml Q5_0 |

El modelo Ultra mejora en 0,61 puntos porcentuales el WER de Parakeet v3 y de Whisper large-v3 french distil en el mismo banco, con un tamano de archivo en F16 (1,26 GB) superior al de v3 Q3_K (335 MB) pero con el mismo rendimiento que sus propias variantes Q5_K a Q8_0.

## Limitaciones y advertencias

- Solo se han publicado mediciones en un unico equipo (Ryzen 7 7800X3D + RTX 5090) y un corpus pequeno (aproximadamente 487 palabras de referencia); la generalizacion a otros dominios y acentos no esta validada.
- El autor indica que el ingles forzado en modo frances se transcribe tal cual, sin traduccion; no es un modelo de traduccion.
- Q2_K se degrada severamente (WER 41,48 %); no debe usarse en produccion.
- No se detalla el proceso de post-entrenamiento de `moondream/parakeet-ultra`: se desconoce la composicion del dataset, el volumen de datos y si hubo alineamiento por preferencias, lo que limita la evaluacion de sesgos.
- Riesgo de alucinacion en audio con ruido, silencios largos o habla solapada no cuantificado en la informacion disponible.
- Licencia CC-BY-4.0: permite uso comercial con atribucion a Moondream y NVIDIA; el autor advierte que ninguno de los dos esta asociado a este repositorio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto recien publicado y sin validacion independiente.
- Depende de `parakeet-cli` de whisper.cpp; no hay soporte documentado en otros runtimes de inferencia.
- La cabeza VAD del modelo original se descarta en la conversion, por lo que la deteccion de actividad de voz debe gestionarse externamente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LaToucheCarre/LaToucheCarre-Voix-XL-Parakeet-Ultra-0.6B-F16-GGML
- Modelo base: https://huggingface.co/moondream/parakeet-ultra
- Modelo NVIDIA original: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- GGUF oficial de referencia: https://huggingface.co/ggml-org/parakeet-GGUF
- whisper.cpp: https://github.com/ggml-org/whisper.cpp
- Producto del autor: https://latouchecarre.fr
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
