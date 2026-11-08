# avericaai/parakeet-tdt-0.6b-v3-gguf

## Resumen

Parakeet-tdt-0.6b-v3-gguf es la conversión a formato GGUF del modelo de reconocimiento automático del habla (ASR) nvidia/parakeet-tdt-0.6b-v3, publicada por el usuario avericaai para su uso con la librería transcribe.cpp. El modelo original lo desarrolla NVIDIA y es un sistema de transcripción de voz a texto multilingüe de aproximadamente 627 millones de parámetros, diseñado para transcripción de alto rendimiento sobre audio de 16 kHz mono en formato WAV. Cubre 25 idiomas europeos y detecta automáticamente el idioma de entrada.

La arquitectura combina un codificador Conformer (FastConformer) con un decodificador transducer TDT/RNNT, una configuración habitual en ASR moderno que equilibra precisión acústica y eficiencia de decodificación. Esta versión GGUF permite ejecutar el modelo de forma local y offline en CPU, GPU o aceleradores Metal/Vulkan sin depender del stack de NeMo, lo que reduce la huella de despliegue y facilita la integración en aplicaciones de escritorio o servidores ligeros.

Su relevancia actual radica en que ofrece una alternativa compacta (desde 485 MB en cuantización Q4_K_M) con un WER de 1,98 % en LibriSpeech test-clean, muy próximo al 1,95 % de la referencia en F32 y al 1,93 % reportado por NVIDIA. No es un modelo de streaming ni traduce, pero sí proporciona marcas de tiempo a nivel de token y detección de idioma, lo que lo hace útil para pipelines de subtitulado y transcripción por lotes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (FastConformer) con decodificador transducer TDT/RNNT |
| Parametros totales | 627.052.166 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR offline; procesa audio de 16 kHz mono WAV) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 25 idiomas europeos: bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, ru, sk, sl, es, sv, uk |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es un FastConformer-TDT de 0,6 mil millones de parámetros. El codificador Conformer combina bloques de autoatención con convoluciones para capturar dependencias locales y globales en la señal acústica; el decodificador es un transducer de tipo Token-and-Duration Transducer (TDT), una variante de RNNT que predice conjuntamente tokens y duraciones, lo que acelera la decodificación y mejora la alineación temporal. La decodificación en esta conversión es greedy, sin modelo de lenguaje externo.

La información disponible no detalla el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; esos datos corresponden a la model card upstream de NVIDIA, que no se ha reproducido íntegramente en la información proporcionada. La conversión GGUF se realizó a partir del commit 6d590f7 del modelo base (fijado el 2026-04-16) y se validó numéricamente contra la referencia de NeMo en el commit bf0d0b7 de transcribe.cpp el 2026-04-18.

## Capacidades

- Transcripción de voz a texto offline sobre audio de 16 kHz mono en formato WAV.
- Reconocimiento multilingüe en 25 idiomas europeos con detección automática del idioma.
- Generación de marcas de tiempo a nivel de token (timestamps: token).
- Decodificación greedy con transducer TDT/RNNT, sin modelo de lenguaje externo.
- No soporta streaming (streaming: false).
- No traduce (translate: false).
- No dispone de tool calling, function calling ni capacidades de agente.
- No procesa visión, audio más allá de ASR ni texto generativo.

## Casos de uso

- Subtitulado automático de vídeo y audio: el modelo produce transcripciones con marcas de tiempo a nivel de token, lo que permite alinear subtítulos con precisión en flujos de postproducción y plataformas de vídeo.
- Transcripción por lotes en servidores sin GPU: con cuantizaciones Q4_K_M (485 MB) o Q8_0 (740 MB) puede ejecutarse en CPU mediante transcribe.cpp, adecuado para procesar archivos de audio en pipelines ETL o archivística.
- Aplicaciones de escritorio de dictado: al ser un GGUF offline y ligero, se integra en herramientas locales de dictado sin enviar audio a la nube, con aceleración Metal en macOS o Vulkan en Linux/Windows.
- Actas y notas de reuniones multilingües: la detección automática de idioma y la cobertura de 25 lenguas europeas permiten transcribir reuniones con participantes de distintos países sin configurar el idioma manualmente.
- Indexación y búsqueda de archivos de audio: las transcripciones con timestamps facilitan la creación de índices de texto buscable sobre grabaciones largas (podcasts, entrevistas, llamadas).
- Investigación en ASR y evaluación de cuantizaciones: el repositorio incluye métricas WER por cuantización y por idioma en FLEURS, útil para reproducir experimentos de compresión y validación numérica frente a NeMo.
- Transcripción de contenido audiovisual en lenguas minoritarias europeas: cubre idiomas como estonio, letón, lituano, maltés, esloveno o eslovaco, con WER variable que conviene evaluar por caso.

## Benchmarks y rendimiento

WER en LibriSpeech test-clean (2.620 enunciados, batch size 1, sin timestamps, decodificación greedy sin LM externo):

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| F32 | 2,51 GB | 1,95 % |
| F16 | 1,26 GB | 1,95 % |
| Q8_0 | 740 MB | 1,94 % |
| Q6_K | 610 MB | 1,93 % |
| Q5_K_M | 549 MB | 1,92 % |
| Q4_K_M | 485 MB | 1,98 % |

Referencia: NVIDIA reporta 1,93 % en el mismo split. La degradación por cuantización es mínima (máximo 0,06 puntos porcentuales en Q4_K_M frente a F32).

WER en FLEURS con cuantización Q8_0, por idioma:

| Idioma | WER (%) | Idioma | WER (%) |
|---|---:|---|---:|
| it | 3,02 | pl | 7,37 |
| es | 3,65 | nl | 7,66 |
| en | 4,83 | sk | 10,19 |
| pt | 4,96 | cs | 12,31 |
| de | 5,24 | hr | 12,59 |
| fr | 5,30 | ro | 12,62 |
| ru | 6,54 | bg | 12,81 |
| uk | 6,84 | fi | 13,30 |
| sv | 15,25 | hu | 16,06 |
| et | 17,96 | da | 18,64 |
| mt | 20,63 | lt | 22,20 |
| lv | 23,77 | sl | 24,30 |
| el | 35,33 | | |

Rendimiento (RTF, factor de tiempo real):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | CPU | 36,82 |
| Apple M4 Max | Metal | 198,59 |
| AMD Ryzen 7 4750U | CPU | 13,66 |
| AMD Ryzen 7 4750U | Vulkan | 25,06 |

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: entre 485 MB (Q4_K_M) y 2,51 GB (F32); F16 requiere 1,26 GB y Q8_0 740 MB. Al ser un modelo pequeño, puede residir íntegramente en memoria de sistema o en VRAM de cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-3 GB de memoria libre; se beneficia de aceleración Metal en Apple Silicon y Vulkan en GPUs AMD/Intel/NVIDIA. No requiere A100 ni H100.
- Cabe en GPU consumer: sí, en cualquier RTX (incluso series antiguas), GPUs integradas con Vulkan y Apple Silicon.
- Opciones de despliegue: transcribe.cpp (compilación desde fuente con CMake) mediante el binario `transcribe-cli`; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que es un modelo ASR y no un LLM.
- Latencia y throughput: RTF de 198,59 con Metal en M4 Max y 36,82 en CPU del mismo equipo; 25,06 con Vulkan y 13,66 en CPU en Ryzen 7 4750U. Valores superiores a 1 indican procesamiento más rápido que tiempo real.
- Preprocesado obligatorio: el audio debe convertirse a WAV mono a 16 kHz (por ejemplo, con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`).

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---:|---|---|---|---|
| parakeet-tdt-0.6b-v3 (GGUF, esta ficha) | 627 M | 25 europeos | GGUF (transcribe.cpp) | CC-BY-4.0 | WER 1,95 % LibriSpeech test-clean (F32); offline, sin streaming |
| nvidia/parakeet-tdt-0.6b-v3 (original) | 600 M aprox. | 25 europeos | NeMo (.nemo) | CC-BY-4.0 | Referencia upstream; WER 1,93 % reportado; requiere stack NeMo |
| nvidia/parakeet-tdt-0.6b-v2 | 600 M aprox. | solo inglés | NeMo (.nemo) | no disponible en la información | Predecesor; la v3 amplía de inglés a 25 idiomas |
| Whisper (variantes) | no disponible en la información | multilingüe | varios | no disponible en la información | No se aportan datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- No es un modelo de streaming: solo procesa audio completo, no flujos en tiempo real.
- No traduce: únicamente transcribe en el idioma detectado.
- Rendimiento muy desigual por idioma: el WER en FLEURS varía entre 3,02 % (italiano) y 35,33 % (griego); idiomas como esloveno (24,30 %), letón (23,77 %), lituano (22,20 %) o maltés (20,63 %) presentan una precisión notablemente inferior.
- Riesgo de errores en audio con ruido, acentos no representados en el entrenamiento, solapamiento de hablantes o vocabulario técnico; no se han publicado análisis de sesgos en la información disponible.
- Requiere audio de 16 kHz mono en WAV; otras frecuencias, canales o códecs deben convertirse previamente.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario conservar el aviso de licencia y el NOTICE del repositorio.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; conviene validar la conversión en el propio entorno antes de usarla en producción, aunque el autor reporta validación numérica frente a NeMo.
- La model card original de NVIDIA no se reproduce íntegramente en la información disponible; para términos completos debe consultarse la fuente upstream.
- No dispone de tool calling, agentes ni capacidades multimodales; su uso está acotado a ASR.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/avericaai/parakeet-tdt-0.6b-v3-gguf
- Modelo base en Hugging Face: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Commit del modelo base usado: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3/commit/6d590f7
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/bf0d0b7
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/parakeet-tdt-0.6b-v3.md
- Réplica del modelo original: https://huggingface.co/TCN/parakeet-tdt-0.6b-v3
- Papers citados en los tags: arxiv:2509.14128, arxiv:2505.13404, arxiv:2305.05084, arxiv:2304.06795, arxiv:2410.01036, arxiv:2406.00899, arxiv:2205.12446, arxiv:2012.03411, arxiv:2007.10310, arxiv:1510.08484 (disponibles en https://arxiv.org/abs/<id>)
