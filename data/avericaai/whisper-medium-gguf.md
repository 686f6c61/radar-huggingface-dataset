# avericaai/whisper-medium-gguf

## Resumen

`avericaai/whisper-medium-gguf` es una conversión a formato GGUF del modelo `openai/whisper-medium`, publicada para su uso con la librería `transcribe.cpp`. Whisper es un modelo de reconocimiento automático del habla (ASR) y traducción de voz desarrollado por OpenAI, entrenado sobre 680.000 horas de audio etiquetado. Esta conversión reproduce el modelo base fijado en el commit `abdf7c3` (fijado el 2026-04-25) y se valida contra la referencia de transformers en el commit `0a26478` de transcribe.cpp (2026-09-13).

El modelo es un transformer encoder-decoder con 763.874.400 parámetros, diseñado para procesar ventanas de audio de 30 segundos con decodificación por trozos para audio de larga duración. Soporta transcripción multilingüe en más de 90 idiomas, detección automática de idioma y traducción de voz a texto en inglés desde cualquier idioma soportado.

La relevancia de esta ficha reside en que ofrece una alternativa ligera y cuantizada (desde 504 MB en Q4_K_M) del modelo medium de Whisper, ejecutable en CPU y GPU de consumo mediante transcribe.cpp, con métricas de WER publicadas por idioma sobre FLEURS y LibriSpeech. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 763.874.400 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas de audio de 30 segundos con decodificacion por trozos para audio largo |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | mas de 90 idiomas (af, am, ar, as, az, ba, be, bg, bn, bo, br, bs, ca, cs, cy, da, de, el, en, es, et, eu, fa, fi, fo, fr, gl, gu, haw, ha, he, hi, hr, ht, hu, hy, id, is, it, ja, jw, ka, kk, km, kn, ko, la, lb, ln, lo, lt, lv, mg, mi, mk, ml, mn, mr, ms, mt, my, ne, nl, nn, no, oc, pa, pl, ps, pt, ro, ru, sa, sd, si, sk, sl, sn, so, sq, sr, su, sv, sw, ta, te, tg, th, tk, tl, tr, tt, uk, ur, uz, vi, yi, yo, zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M) |

## Arquitectura y entrenamiento

Whisper medium es un transformer encoder-decoder con 763.874.400 parámetros. El encoder procesa espectrogramas mel de audio en ventanas de 30 segundos y el decoder genera texto autorregresivamente. El modelo base fue entrenado por OpenAI sobre 680.000 horas de audio etiquetado, con una mezcla de datos supervisados y no supervisados que le permite generalizar a dominios y datasets sin ajuste fino. No se dispone en la información proporcionada de detalles sobre RLHF o DPO aplicados en el entrenamiento original.

Esta conversión concreta no modifica los pesos más allá de la cuantización: se trata de una conversión directa del checkpoint `openai/whisper-medium` (commit `abdf7c3`) a GGUF para transcribe.cpp. Las innovaciones técnicas relevantes del modelo base incluyen la decodificación por trozos para audio de larga duración, detección de idioma integrada y traducción de voz a inglés. La conversión conserva las capacidades de detección de idioma (`lang_detect: true`) y traducción (`translate: true`), pero no soporta streaming (`streaming: false`). Los timestamps son a nivel de segmento.

## Capacidades

- Transcripción automática del habla (ASR) en más de 90 idiomas.
- Detección automática de idioma en el audio de entrada.
- Traducción de voz a texto en inglés desde cualquier idioma soportado.
- Timestamps a nivel de segmento.
- Procesamiento de audio de larga duración mediante decodificación por trozos de ventanas de 30 segundos.
- No soporta streaming en tiempo real.
- No dispone de tool calling ni function calling (es un modelo ASR, no un LLM generativo de propósito general).
- No dispone de capacidades de agente ni razonamiento multi-paso.
- Capacidades multilingües amplias, con WER publicado por idioma sobre FLEURS.

## Casos de uso

- Transcripción de reuniones y actas: el modelo procesa audio de larga duración mediante decodificación por trozos, generando transcripciones con timestamps por segmento. Adecuado para reuniones en varios idiomas con detección automática de idioma.
- Subtitulado automático de vídeo: la salida con timestamps por segmento permite generar subtítulos sincronizados. El WER bajo en inglés (2,64% en LibriSpeech test-clean) y en español (3,8% en FLEURS) lo hace viable para producción de subtítulos.
- Traducción de contenido audiovisual a inglés: la capacidad `translate: true` permite convertir audio en cualquier idioma soportado a texto en inglés, útil para localización de pódcasts o vídeos.
- Atención al cliente con transcripción de llamadas: despliegue en CPU (RTF 1,92 en Ryzen 4750U) o GPU de consumo para transcribir llamadas grabadas y alimentar sistemas de análisis de calidad.
- Investigación lingüística y datasets multilingües: el WER publicado por idioma sobre FLEURS permite seleccionar el modelo para idiomas concretos y comparar el rendimiento de la cuantización Q8_0 frente a F32.
- Despliegue en dispositivos de borde: la cuantización Q4_K_M (504 MB) permite ejecutar el modelo en hardware con recursos limitados, incluyendo portátiles con Apple Silicon (RTF 7,25 en CPU, 33,33 en Metal en M4 Max).
- Generación de transcripciones para accesibilidad: conversión de audio a texto para personas con discapacidad auditiva, con soporte de más de 90 idiomas.

## Benchmarks y rendimiento

WER sobre LibriSpeech test-clean (2.620 utterances, batch size 1, sin timestamps):

| Cuantizacion | WER LibriSpeech test-clean |
|---|---|
| F32 | 2,64% |
| F16 | 2,63% |
| Q8_0 | 2,64% |
| Q6_K | 2,59% |
| Q5_K_M | 2,62% |
| Q4_K_M | 2,59% |

El dato auto-reportado por OpenAI sobre el mismo split es 2,90%.

WER/CER sobre FLEURS con cuantización Q8_0 (selección de idiomas):

| Idioma | Metrica | Valor Q8_0 |
|---|---|---|
| en | WER | 4,64 |
| es | WER | 3,80 |
| it | WER | 4,17 |
| pt | WER | 5,07 |
| de | WER | 6,23 |
| fr | WER | 8,07 |
| ru | WER | 7,30 |
| pl | WER | 8,59 |
| nl | WER | 10,40 |
| tr | WER | 9,35 |
| sv | WER | 12,47 |
| uk | WER | 11,59 |
| ca | WER | 8,02 |
| id | WER | 10,79 |
| vi | WER | 13,74 |
| ja | CER | 7,35 |
| ko | CER | 5,46 |
| zh | CER | 13,13 |
| th | CER | 16,08 |
| ar | WER | 21,90 |
| hi | WER | 26,09 |
| ka | WER | 128,01 |
| sd | WER | 132,27 |
| sn | WER | 134,28 |

Rendimiento (RTF, real-time factor):

| Plataforma | Backend | RTF |
|---|---|---|
| Apple M4 Max | CPU | 7,25 |
| Apple M4 Max | Metal | 33,33 |
| AMD Ryzen 4750U | CPU | 1,92 |
| AMD Ryzen 4750U | Vulkan | 4,08 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 504 MB (Q4_K_M), 583 MB (Q5_K_M), 648 MB (Q6_K), 832 MB (Q8_0), 1,54 GB (F16) y 3,06 GB (F32).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM para cuantizaciones Q4_K_M a Q8_0; para F16 se recomienda 2 GB o más; para F32, 4 GB o más.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) con las cuantizaciones Q4_K_M a Q8_0. También en Apple Silicon mediante Metal.
- Opciones de despliegue: transcribe.cpp (librería nativa para la que se ha convertido el modelo). No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: RTF de 1,92 en CPU Ryzen 4750U, 4,08 en Vulkan sobre Ryzen 4750U, 7,25 en CPU M4 Max y 33,33 en Metal sobre M4 Max. Un RTF superior a 1 indica procesamiento más rápido que tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER LibriSpeech test-clean | Licencia | Formato |
|---|---|---|---|---|---|
| whisper-medium-gguf (esta ficha) | 763.874.400 | ventanas de 30 s | 2,59-2,64% | Apache 2.0 | GGUF |
| openai/whisper-medium (original) | 763.874.400 | ventanas de 30 s | 2,90% (auto-reportado) | Apache 2.0 | safetensors |
| whisper-small | no disponible en la informacion | ventanas de 30 s | no disponible en la informacion | Apache 2.0 | safetensors |
| whisper-large-v3 | no disponible en la informacion | ventanas de 30 s | no disponible en la informacion | Apache 2.0 | safetensors |

No se dispone en la información proporcionada de datos de benchmarks de whisper-small ni whisper-large-v3 para una comparación cuantitativa completa.

## Limitaciones y advertencias

- El modelo no soporta streaming (`streaming: false`), por lo que no es adecuado para transcripción en tiempo real.
- Los timestamps son únicamente a nivel de segmento, no a nivel de palabra.
- Riesgo de alucinación en audio con ruido, silencios prolongados o dominios muy alejados de los datos de entrenamiento; es un comportamiento conocido de la familia Whisper.
- Rendimiento muy desigual por idioma: WER superior al 100% en idiomas como georgiano (128,01), sindhi (132,27) o shona (134,28) sobre FLEURS, lo que los hace poco utilizables en producción.
- El CER en tailandés (16,08), chino (13,13), japonés (7,35) y coreano (5,46) es notablemente superior al WER en inglés (4,64), lo que refleja dificultades con sistemas de escritura no latinos.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero se recomienda verificar la licencia del modelo base original de OpenAI.
- Es una conversión de terceros (`avericaai`), no oficial de OpenAI; la validación se realizó contra transcribe.cpp en un commit concreto, por lo que cambios en la librería podrían afectar al comportamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica poca validación por parte de la comunidad.
- No se indica compatibilidad con otros runtimes distintos de transcribe.cpp, lo que limita las opciones de despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/avericaai/whisper-medium-gguf
- Modelo base: https://huggingface.co/openai/whisper-medium
- Commit del modelo base: https://huggingface.co/openai/whisper-medium/commit/abdf7c3
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/0a26478
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Ficha en Inferix: https://inferix.co/models/handy-computer/whisper-medium-gguf
- Conversión alternativa en Hugging Face: https://huggingface.co/myflow-ai/whisper-medium-gguf
