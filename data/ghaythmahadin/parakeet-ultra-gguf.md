# GhaythMahadin/parakeet-ultra-gguf

## Resumen

parakeet-ultra-gguf es la conversión a formato GGUF del modelo de reconocimiento automático del habla moondream/parakeet-ultra, publicada por GhaythMahadin para su uso con el runtime transcribe.cpp. El modelo base es un post-entrenamiento de parakeet-tdt-0.6b-v3 de NVIDIA, desarrollado por Moondream, que mantiene la arquitectura FastConformer con decodificador TDT (Token-and-Duration Transducer) y 627 millones de parámetros en precisión completa. Esta conversión permite ejecutar el modelo en CPU y GPU sin depender del stack de Python ni de PyTorch.

El modelo resuelve transcripción de voz a texto multilingüe offline en 25 idiomas europeos, con segmentación automática de audio largo mediante una cabeza de detección de actividad de voz (VAD) que corta las grabaciones en pausas en fragmentos de como máximo 30 segundos. Genera transcripciones con puntuación, mayúsculas y marcas de tiempo opcionales a nivel de token. Es relevante porque ofrece una alternativa ligera (486 MB en Q4_K_M) y de alta precisión (1,82 % WER en LibriSpeech test-clean) que puede desplegarse en hardware de consumo sin conexión.

La conversión se realizó desde el commit 73175eb del modelo base (fijado el 2026-10-04) y se validó contra la referencia kestrel 0.9.1 (Photon) en transcribe.cpp commit 08f9e6f0. No es un modelo de streaming ni traduce; su función es exclusivamente transcripción offline.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + TDT transducer (decoder) + cabeza VAD |
| Parámetros totales | 627.265.543 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (segmentos de audio de hasta 30 s) |
| Tipos de cuantización | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en, de, fr, es, it, pt, ru, uk, hr, sl, lv, lt, et, fi, sv, da, nl, pl, cs, sk, hu, ro, bg, el, mt |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura parakeet-tdt-0.6b-v3: un encoder FastConformer que procesa espectrogramas de audio de 16 kHz mono y un decodificador TDT (Token-and-Duration Transducer) que predice tanto el token siguiente como su duración, lo que permite decodificación greedy sin modelo de lenguaje externo. Incluye además una pequeña cabeza de actividad de voz que el modelo utiliza para segmentar grabaciones largas en pausas, generando segmentos de como máximo 30 segundos antes de transcribir. El tokenizador y el tamaño de 0,6B parámetros se mantienen idénticos al modelo base.

El entrenamiento parte de parakeet-tdt-0.6b-v3 de NVIDIA y fue post-entrenado por Moondream; la model card no detalla el número de tokens, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La conversión a GGUF no altera los pesos en precisión completa (F32), y las cuantizaciones Q8_0 a Q4_K_M degradan el WER de forma mínima (de 1,80 % a 1,82 % en LibriSpeech test-clean). La validación numérica se realizó contra el runtime kestrel 0.9.1, no contra transformers.

## Capacidades

- Transcripción de voz a texto offline en 25 idiomas europeos (inglés, alemán, francés, español, italiano, portugués, ruso, ucraniano, croata, esloveno, letón, lituano, estonio, finés, sueco, danés, neerlandés, polaco, checo, eslovaco, húngaro, rumano, búlgaro, griego y maltés).
- Generación de transcripciones con puntuación y mayúsculas.
- Marcas de tiempo opcionales a nivel de token (`timestamps: token`).
- Detección automática de idioma (`lang_detect: true`).
- Segmentación de audio largo mediante cabeza VAD integrada, con cortes en pausas y segmentos de hasta 30 segundos.
- Entrada de audio de 16 kHz mono WAV.
- No soporta streaming (`streaming: false`).
- No soporta traducción (`translate: false`).
- No dispone de tool calling, function calling ni capacidades de agente.
- No procesa visión, audio generativo ni texto; es exclusivamente ASR.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo segmenta automáticamente grabaciones largas en pausas mediante su cabeza VAD y genera transcripciones con puntuación y mayúsculas, adecuado para actas y documentación interna sin conexión a servicios en la nube.
- Subtitulado de vídeo: las marcas de tiempo a nivel de token permiten alinear la transcripción con la pista de audio para generar subtítulos en 25 idiomas europeos, con la salvedad de que no traduce.
- Atención al cliente y análisis de llamadas: transcripción offline de grabaciones telefónicas en centros de contacto, con detección automática de idioma para entornos multilingües y sin enviar audio a terceros.
- Investigación lingüística y corpus: generación de transcripciones para estudios de fonética, sociolingüística o análisis de discurso en lenguas europeas, con la ventaja de ejecutarse en hardware de consumo (Q4_K_M de 486 MB).
- Cumplimiento y privacidad: despliegue en entornos aislados donde el audio no puede salir de la infraestructura, como sector sanitario, legal o administración pública, gracias a la licencia CC-BY-4.0 y al formato GGUF ejecutable en CPU.
- Accesibilidad: transcripción de audio a texto para personas con discapacidad auditiva en aplicaciones de escritorio o integradas en reproductores, con latencia dependiente del hardware (RTF 13,29 en CPU Ryzen 4750U, 35,03 en CPU M4 Max).
- Archivística y digitalización: transcripción por lotes de archivos de audio históricos o grabaciones de campo en formato WAV de 16 kHz, con la posibilidad de ejecutar en CPU sin GPU dedicada.

## Benchmarks y rendimiento

WER en LibriSpeech test-clean (split completo, 2.620 enunciados, batch 8, sin timestamps, hint de idioma `en`, decodificado en CUDA, transcribe.cpp commit 021aa17d):

| Cuantización | Tamaño | WER LibriSpeech test-clean |
|---|---:|---:|
| F32 | 2,51 GB | 1,80 % |
| F16 | 1,26 GB | 1,80 % |
| Q8_0 | 740 MB | 1,80 % |
| Q6_K | 611 MB | 1,81 % |
| Q5_K_M | 550 MB | 1,81 % |
| Q4_K_M | 486 MB | 1,82 % |

WER en FLEURS con Q8_0 (por idioma):

| Idioma | WER |
|---|---:|
| Italiano | 2,34 % |
| Español | 3,06 % |
| Portugués | 4,16 % |
| Inglés | 4,26 % |
| Alemán | 4,58 % |
| Francés | 4,66 % |
| Ruso | 5,63 % |
| Ucraniano | 5,71 % |
| Polaco | 6,16 % |
| Neerlandés | 6,70 % |
| Eslovaco | 7,83 % |
| Rumano | 10,12 % |
| Checo | 11,04 % |
| Búlgaro | 11,04 % |
| Finés | 11,14 % |
| Croata | 11,30 % |
| Suecia | 12,83 % |
| Hungría | 13,09 % |
| Estonia | 14,44 % |
| Dinamarca | 15,98 % |
| Malta | 17,01 % |
| Lituania | 17,06 % |
| Letonia | 18,04 % |
| Eslovenia | 18,98 % |
| Griego | 32,25 % |

Long-form: en 11 charlas completas de TED-LIUM 3, segmentadas por la cabeza VAD del modelo, F32 obtiene 2,22 % WER, idéntico a kestrel, y cada cuantización se mantiene dentro de 0,05 pp.

Nota: la model card de Moondream reporta 1,41 % en el mismo split de LibriSpeech usando los normalizadores de Open ASR Leaderboard con alineamiento compound-merging; el scorer de este repositorio reproduce los valores de la tabla, no los de la card. La misma diferencia de scoring explica los valores más altos en FLEURS, especialmente en lenguas con compounding (kestrel puntuado por este pipeline da 14,37 % en estonio y 13,09 % en húngaro, coincidiendo con la build C++).

Rendimiento (RTF, real-time factor):

| Hardware | CPU | Metal | Vulkan |
|---|---:|---:|---:|
| Apple M4 Max | 35,03 | 189,12 | no disponible |
| AMD Ryzen 4750U | 13,29 | no disponible | 23,00 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en Q4_K_M, 0,74 GB en Q8_0 y 2,5 GB en F32, según el tamaño de cada archivo GGUF.
- GPU recomendadas: cualquier GPU con soporte CUDA (validado en CUDA), Metal (validado en Apple M4 Max) o Vulkan (validado en AMD Ryzen 4750U). No se especifican modelos concretos como A100, H100 o RTX 4090 en la información disponible.
- Cabe en GPU de consumo: sí, con cuantizaciones Q4_K_M (486 MB) o Q8_0 (740 MB) en cualquier GPU con al menos 1 GB de VRAM libre.
- Opciones de despliegue: transcribe.cpp (runtime nativo C++), con binario `transcribe-cli`. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: RTF de 35,03 en CPU M4 Max, 189,12 en Metal M4 Max, 13,29 en CPU Ryzen 4750U y 23,00 en Vulkan Ryzen 4750U. Un RTF mayor indica mayor velocidad relativa al tiempo real.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | WER LibriSpeech test-clean | Licencia | Formato |
|---|---|---:|---:|---|---|
| parakeet-ultra-gguf (Q8_0) | 627 M | 25 europeos | 1,80 % | CC-BY-4.0 | GGUF |
| parakeet-tdt-0.6b-v3 (base) | 600 M | 25 europeos | no disponible en la información | no disponible | no disponible |
| Whisper large-v3 | no disponible en la información | multilingüe | no disponible en la información | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos alternativos en la información proporcionada para establecer una comparación cuantitativa completa. La model card indica que parakeet-ultra obtiene menores tasas de error que parakeet-tdt-0.6b-v3 en inglés y en todos los idiomas FLEURS medidos, pero no se aportan las cifras del modelo v3.

## Limitaciones y advertencias

- No es un modelo de streaming: requiere el audio completo o segmentado previamente para transcribir.
- No traduce: solo transcribe en el idioma detectado o indicado.
- El WER es notablemente alto en griego (32,25 %), esloveno (18,98 %), letón (18,04 %), lituano (17,06 %) y maltés (17,01 %), lo que limita su uso en producción para esos idiomas.
- Los valores de WER publicados dependen del scorer y los normalizadores utilizados; la diferencia entre el 1,41 % de la card de Moondream y el 1,80 % de este repositorio se debe a los normalizadores de Open ASR Leaderboard con compound-merging, lo que afecta especialmente a lenguas con compounding.
- Riesgo de alucinación en audio con ruido, música o habla solapada; no se documentan métricas específicas para estas condiciones.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario citar al autor y mantener el aviso de licencia.
- Requiere audio de entrada en WAV de 16 kHz mono; es necesario convertir otros formatos con ffmpeg antes de la inferencia.
- El modelo base está fijado al commit 73175eb (2026-10-04); actualizaciones posteriores del modelo upstream no están reflejadas en esta conversión.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción por parte de la comunidad.

## Enlaces

- Hugging Face (conversión GGUF): https://huggingface.co/GhaythMahadin/parakeet-ultra-gguf
- Modelo base: https://huggingface.co/moondream/parakeet-ultra
- Commit del modelo base: https://huggingface.co/moondream/parakeet-ultra/commit/73175eb
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de transcribe.cpp usado para validación: https://github.com/handy-computer/transcribe.cpp/tree/08f9e6f0
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/parakeet-ultra.md
- Modelo parakeet-tdt-0.6b-v3 de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Descarga directa F32: https://huggingface.co/handy-computer/parakeet-ultra-gguf/resolve/main/parakeet-ultra-F32.gguf
- Descarga directa F16: https://huggingface.co/handy-computer/parakeet-ultra-gguf/resolve/main/parakeet-ultra-F16.gguf
- Descarga directa Q8_0: https://huggingface.co/handy-computer/parakeet-ultra-gguf/resolve/main/parakeet-ultra-Q8_0.gguf
- Descarga directa Q6_K: https://huggingface.co/handy-computer/parakeet-ultra-gguf/resolve/main/parakeet-ultra-Q6_K.gguf
- Descarga directa Q5_K_M: https://huggingface.co/handy-computer/parakeet-ultra-gguf/resolve/main/parakeet-ultra-Q5_K_M.gguf
- Descarga directa Q4_K_M: https://huggingface.co/handy-computer/parakeet-ultra-gguf/resolve/main/parakeet-ultra-Q4_K_M.gguf
