# lipik/parakeet-ultra-gguf

## Resumen

parakeet-ultra-gguf es la conversión a formato GGUF del modelo moondream/parakeet-ultra, un sistema de reconocimiento automático del habla (ASR) offline multilingüe publicado por Moondream como versión post-entrenada de parakeet-tdt-0.6b-v3 de NVIDIA. La conversión la mantiene el usuario lipik y está empaquetada para transcribe.cpp, el runtime C++ de handy-computer, lo que permite ejecutar el modelo en CPU, Metal y Vulkan sin depender de PyTorch ni de CUDA. El modelo base conserva arquitectura, tokenizer y los 627.265.543 parámetros en precisión completa del original.

Técnicamente es un encoder FastConformer acoplado a un decodificador transducer TDT (Token-and-Duration Transducer), con una pequeña cabeza de detección de actividad de voz que segmenta grabaciones largas en pausas en fragmentos de como máximo 30 segundos. Cubre 25 idiomas europeos, acepta WAV mono a 16 kHz y produce transcripciones con puntuación, mayúsculas y timestamps opcionales a nivel de token. No es un modelo de streaming ni traduce.

Su relevancia actual reside en la combinación de tamaño reducido (740 MB en Q8_0, 486 MB en Q4_K_M), tasas de error competitivas (1,80 % WER en LibriSpeech test-clean y 3,06 % en FLEURS español con Q8_0) y despliegue nativo en hardware de consumo mediante transcribe.cpp, lo que lo convierte en una alternativa práctica a los wrappers de Whisper para transcripción multilingüe en local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + TDT transducer (decoder) + cabeza de voice activity detection |
| Parametros totales | 627.265.543 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; segmentacion interna en fragmentos de maximo 30 s mediante la cabeza VAD |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en, de, fr, es, it, pt, ru, uk, hr, sl, lv, lt, et, fi, sv, da, nl, pl, cs, sk, hu, ro, bg, el, mt (25 idiomas) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (runtime transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo es un sistema ASR end-to-end compuesto por un encoder FastConformer que procesa espectrogramas de audio de 16 kHz mono y un decodificador transducer TDT que genera tokens junto con predicciones de duración, lo que permite decodificación no autorregresiva codiciosa sin modelo de lenguaje externo. Se añade una cabeza auxiliar de actividad de voz que el propio modelo utiliza para cortar grabaciones largas en pausas, generando segmentos de hasta 30 segundos; esto habilita la transcripción long-form sin necesidad de un VAD externo. El modelo base es una versión post-entrenada de parakeet-tdt-0.6b-v3 de NVIDIA, con la misma arquitectura, tokenizer y 0,6B parámetros en precisión completa.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO durante el post-entrenamiento. La model card del repositorio GGUF indica que la conversión se realizó desde el commit 73175eb del modelo upstream (fijado el 2026-10-04) y se validó contra la referencia kestrel 0.9.1 (Photon) en el commit 08f9e6f0 de transcribe.cpp. Los pesos se validaron numéricamente contra esa referencia, y la decodificación es codiciosa sin LM externo.

## Capacidades

- Transcripción de voz a texto offline en 25 idiomas europeos (inglés, alemán, francés, español, italiano, portugués, ruso, ucraniano, croata, esloveno, letón, lituano, estonio, finés, sueco, danés, neerlandés, polaco, checo, eslovaco, húngaro, rumano, búlgaro, griego y maltés).
- Detección automática de idioma (`lang_detect: true` en los metadatos de transcribe.cpp).
- Salida con puntuación y capitalización correctas.
- Timestamps opcionales a nivel de token (`timestamps: token`).
- Transcripción long-form: la cabeza VAD interna segmenta audios largos en pausas en fragmentos de hasta 30 segundos, validado sobre 11 charlas completas de TED-LIUM 3.
- No soporta streaming (`streaming: false`) ni traducción (`translate: false`).
- No dispone de tool calling, function calling, capacidades de agente ni visión; es exclusivamente un modelo ASR.

## Casos de uso

- Transcripción de reuniones y actas: el modelo procesa grabaciones largas segmentándolas automáticamente por pausas gracias a su cabeza VAD, y produce un texto puntuado con timestamps por token que permite mapear cada frase al minuto exacto de la reunión.
- Subtitulado de vídeo multilingüe: con timestamps a nivel de token y soporte de 25 idiomas europeos, se puede generar un SRT por idioma a partir del mismo audio, sin depender de servicios en la nube.
- Dictado y notas de voz en aplicaciones de escritorio: con Q4_K_M ocupando 486 MB, el modelo cabe en memoria de un portátil convencional y se ejecuta en CPU o Metal mediante transcribe.cpp, lo que permite dictado local sin enviar audio a terceros.
- Indexación y búsqueda de archivos de audio: transcribir por lotes un archivo de podcasts o grabaciones archivadas para construir un índice de texto buscable, aprovechando la detección automática de idioma para no tener que etiquetar cada fichero manualmente.
- Atención al cliente y análisis de llamadas: transcripción de conversaciones telefónicas en español, italiano, portugués o alemán (WER de 3,06 %, 2,34 %, 4,16 % y 4,58 % en FLEURS con Q8_0) para alimentar análisis de calidad o extracción de motivos de contacto.
- Documentación clínica o legal dictada: transcripción local de notas de voz en entornos con requisitos de privacidad, ya que todo el procesamiento ocurre en el dispositivo sin conexión externa.
- Investigación lingüística y corpus: generación de transcripciones de referencia en lenguas menos representadas (esloveno, letón, lituano, estonio, maltés) con tasas de error documentadas por idioma, útil para construir o evaluar corpus.

## Benchmarks y rendimiento

Datos publicados en la model card del repositorio GGUF. WER sobre LibriSpeech test-clean completo (2.620 utterances, batch 8, timestamps none, hint de idioma `en`, decodificado en CUDA, transcribe.cpp commit 021aa17d):

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| F32 | 2,51 GB | 1,80 % |
| F16 | 1,26 GB | 1,80 % |
| Q8_0 | 740 MB | 1,80 % |
| Q6_K | 611 MB | 1,81 % |
| Q5_K_M | 550 MB | 1,81 % |
| Q4_K_M | 486 MB | 1,82 % |

WER en FLEURS con Q8_0 por idioma:

| Idioma | WER Q8_0 | Idioma | WER Q8_0 |
|---|---:|---|---:|
| it | 2,34 % | cs | 11,04 % |
| es | 3,06 % | bg | 11,04 % |
| pt | 4,16 % | fi | 11,14 % |
| en | 4,26 % | hr | 11,30 % |
| de | 4,58 % | sv | 12,83 % |
| fr | 4,66 % | hu | 13,09 % |
| ru | 5,63 % | et | 14,44 % |
| uk | 5,71 % | da | 15,98 % |
| pl | 6,16 % | mt | 17,01 % |
| nl | 6,70 % | lt | 17,06 % |
| sk | 7,83 % | lv | 18,04 % |
| ro | 10,12 % | sl | 18,98 % |
| el | 32,25 % | | |

Nota del autor: la model card de Moondream reporta 1,41 % en LibriSpeech test-clean usando los normalizadores de Open ASR Leaderboard con alineamiento de compuestos; el scorer de este repositorio reproduce 1,80 % tanto para kestrel como para la build C++ F32. Esa misma diferencia de scoring explica las cifras más altas de FLEURS, especialmente en lenguas con compuestos (estonio 14,37 % y húngaro 13,09 % medidos con kestrel a través de este pipeline).

Long-form: sobre 11 charlas completas de TED-LIUM 3, segmentadas por la cabeza VAD del modelo igual que kestrel, F32 obtiene 2,22 % WER, idéntico a kestrel, y todas las cuantizaciones se mantienen dentro de 0,05 puntos porcentuales.

Rendimiento (RTF, real-time factor):

| Plataforma | CPU | Acelerador |
|---|---:|---:|
| Apple M4 Max | 35,03 | 189,12 (Metal) |
| AMD Ryzen 7 4750U | 13,29 | 23,0 (Vulkan) |

## Requisitos de hardware

- VRAM/RAM estimada: entre 486 MB (Q4_K_M) y 2,51 GB (F32) solo para los pesos; el runtime añade overhead adicional no cuantificado en la información disponible.
- Cabe en cualquier GPU de consumo actual e incluso en equipos sin GPU dedicada, ya que transcribe.cpp permite ejecución en CPU.
- GPU recomendadas: no se especifican modelos concretos; las mediciones publicadas son sobre Apple M4 Max (Metal) y AMD Ryzen 7 4750U (Vulkan). No hay datos publicados para A100, H100 ni RTX 4090.
- Opciones de despliegue: transcribe.cpp (build desde fuente con CMake; binario `transcribe-cli`). No se indica soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTF de 35,03 en CPU M4 Max y 189,12 en Metal sobre el mismo equipo; 13,29 en CPU y 23,0 en Vulkan sobre Ryzen 7 4750U. Un RTF más alto indica mayor velocidad respecto al tiempo real del audio.
- Preprocesado obligatorio: el audio debe ser WAV mono a 16 kHz; el autor recomienda convertir con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | WER LibriSpeech test-clean | Formato / runtime | Licencia |
|---|---|---:|---:|---|---|
| parakeet-ultra-gguf (este) | 627 M | 25 europeos | 1,80 % (F32/Q8_0, scorer del repo) | GGUF / transcribe.cpp | CC-BY-4.0 |
| parakeet-tdt-0.6b-v3 (NVIDIA) | 0,6 B | 25 europeos | no disponible en la informacion | pesos originales | no disponible en la informacion |
| Whisper large-v3 | no disponible en la informacion | multilingue amplio | no disponible en la informacion | multiples | no disponible en la informacion |

El propio autor describe parakeet-ultra como reemplazo directo de parakeet-tdt-0.6b-v3: mismo tamano, mismos idiomas y misma API, con tasas de error inferiores en ingles y en todos los idiomas FLEURS medidos. No se han proporcionado datos numericos de otros modelos ASR comparables en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo de streaming: requiere el audio completo (o segmentos de hasta 30 segundos) antes de transcribir.
- No traduce: solo transcribe en el idioma hablado.
- Diferencias de scoring: las cifras de WER de este repositorio no son directamente comparables con las de la model card de Moondream (1,41 % frente a 1,80 % en LibriSpeech test-clean) por diferencias en los normalizadores; hay que usar el mismo pipeline al comparar modelos.
- Rendimiento desigual entre idiomas: el WER en FLEURS oscila entre 2,34 % (italiano) y 32,25 % (griego), con valores superiores al 17 % en esloveno, letón, lituano y maltés. No es adecuado para produccion en esos idiomas sin evaluacion previa.
- Solo acepta WAV mono a 16 kHz; cualquier otro formato requiere conversion previa.
- Licencia CC-BY-4.0: permite uso comercial con atribucion; hay que citar a Moondream y al autor de la conversion y revisar los terminos del modelo upstream.
- Al ser una cuantizacion GGUF, las diferencias de WER entre cuantizaciones son minimas (0,02 puntos porcentuales entre F32 y Q4_K_M en LibriSpeech), pero no se han publicado evaluaciones de cuantizaciones en todos los idiomas.
- No se dispone de informacion sobre sesgos demograficos o acentricos del modelo base en la documentacion proporcionada.
- El repositorio tiene muy pocas descargas (26) y ninguna valoracion, lo que reduce la evidencia de uso en produccion por terceros.

## Enlaces

- Repositorio GGUF: https://huggingface.co/lipik/parakeet-ultra-gguf
- Modelo base: https://huggingface.co/moondream/parakeet-ultra
- Commit upstream fijado: https://huggingface.co/moondream/parakeet-ultra/commit/73175eb
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validacion: https://github.com/handy-computer/transcribe.cpp/tree/08f9e6f0
- Documentacion del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/parakeet-ultra.md
- Descargas directas de cuantizaciones: https://huggingface.co/handy-computer/parakeet-ultra-gguf/resolve/main/parakeet-ultra-Q8_0.gguf (y equivalentes para F32, F16, Q6_K, Q5_K_M y Q4_K_M)
