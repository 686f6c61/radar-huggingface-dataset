# lipik/canary-1b-v2-gguf

## Resumen

`lipik/canary-1b-v2-gguf` es una conversión a formato GGUF del modelo `nvidia/canary-1b-v2`, un sistema de reconocimiento automático del habla (ASR) y traducción de voz (AST) multitarea desarrollado por NVIDIA. Con 980 millones de parámetros, está diseñado para transcribir y traducir audio en 25 lenguas europeas, incluyendo el castellano, el catalán no figura en la lista, pero sí el español, el portugués, el francés, el alemán, el italiano y la mayoría de lenguas de la UE, además del ruso y el ucraniano.

La aportación de esta ficha concreta no es el modelo en sí, sino su empaquetado para `transcribe.cpp`, un runtime en C++ centrado en inferencia local de modelos de voz. Esto permite ejecutar un modelo de casi mil millones de parámetros en CPU y GPU de consumo sin depender de NeMo ni de PyTorch, con cuantizaciones que van desde F32 (3,7 GB) hasta Q4_K_M (701 MB) y una degradación de WER prácticamente nula en LibriSpeech test-clean (1,91 % en Q4_K_M frente a 1,92 % en F32).

Es relevante ahora porque demuestra que los modelos ASR de NVIDIA pueden desplegarse de forma totalmente offline en hardware modesto, manteniendo la calidad del original. La arquitectura es un encoder-decoder de tipo multitask AED con un encoder FastConformer de 32 capas y un decoder Transformer de 8 capas, entrenado sobre audio de 16 kHz mono.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder-decoder multitask AED (FastConformer de 32 capas + Transformer decoder de 8 capas) |
| Parámetros totales | 980.046.848 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, es, sv, ru, uk (25 lenguas europeas) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF |
| Entrada | Audio WAV mono a 16 kHz |
| Salida | Texto transcrito o traducido |
| Streaming | No |
| Detección de idioma | No |
| Timestamps | No expuestos en este port |
| Traducción | Sí (en → 24 lenguas y 24 lenguas → en) |

## Arquitectura y entrenamiento

El modelo sigue el paradigma multitask AED (Attention Encoder-Decoder) de NVIDIA NeMo. El encoder es un FastConformer de 32 capas, una variante de Conformer con atención por bloques que reduce el coste computacional en secuencias largas de audio. El decoder es un Transformer estándar de 8 capas que genera la secuencia de texto condicionada por la representación del encoder. La tarea (transcripción o traducción) y el idioma de destino se controlan mediante tokens especiales en la entrada del decoder.

La información disponible no detalla el volumen de datos de entrenamiento, la composición exacta del corpus ni si se aplicaron etapas de RLHF o DPO. La model card upstream de NVIDIA describe el modelo como listo para uso comercial y no comercial bajo CC-BY-4.0, pero no incluye en la información proporcionada los detalles del pipeline de entrenamiento. La conversión a GGUF fue validada numéricamente contra la referencia NeMo en el commit `db53eda` de `transcribe.cpp` (8 de mayo de 2026), partiendo del commit upstream `87bc526` fijado en la misma fecha.

## Capacidades

- Transcripción automática del habla (ASR) en 25 lenguas europeas, incluyendo español, portugués, francés, alemán, italiano, neerlandés, polaco, rumano, sueco, danés, finés, griego, checo, eslovaco, esloveno, húngaro, búlgaro, croata, estonio, letón, lituano, maltés, ruso y ucraniano.
- Traducción de voz (AST) desde inglés hacia las otras 24 lenguas y desde cada una de las 24 lenguas hacia inglés.
- Procesamiento de audio WAV mono a 16 kHz, con conversión previa desde otros formatos mediante ffmpeg.
- Ejecución offline completa, sin dependencia de servicios en la nube.
- Inferencia en CPU y GPU mediante `transcribe.cpp` con backend Metal (Apple Silicon) y Vulkan (GPU integradas y discretas en Linux/Windows).
- No soporta streaming: procesa el audio completo por segmentos.
- No expone timestamps a nivel de palabra ni de segmento en este port.
- No realiza detección automática de idioma: el idioma debe especificarse o inferirse externamente.

## Casos de uso

- Transcripción de reuniones y entrevistas en entornos sin conectividad: el modelo procesa ficheros WAV completos de forma local, lo que permite cumplir requisitos de confidencialidad en sectores como sanidad, legal o administración pública sin enviar audio a terceros.
- Subtitulado de contenido audiovisual multilingüe: combinado con una etapa de alineación externa, el modelo transcribe el audio en cualquiera de las 25 lenguas y puede traducir al inglés o desde inglés, útil para plataformas de vídeo que necesitan generar pistas de subtítulos en varios idiomas.
- Traducción de voz en atención al cliente internacional: con la ruta 24 lenguas → inglés y en → 24 lenguas, se puede construir un pipeline que transcriba la llamada del cliente en su idioma y genere el texto en inglés para el agente, o al contrario.
- Archivado y búsqueda de grabaciones: transcripción por lotes de archivos históricos de radio, podcasts o llamadas para indexación full-text, aprovechando que el modelo Q4_K_M ocupa solo 701 MB y puede ejecutarse en servidores modestos.
- Investigación en lingüística computacional: evaluación comparativa de ASR en lenguas de bajos recursos europeas (maltés, estonio, esloveno) con un único modelo multilingüe, sin necesidad de entrenar sistemas específicos por idioma.
- Prototipado en dispositivos de borde: con Q4_K_M o Q5_K_M y el backend Vulkan, el modelo cabe en iGPU y CPU de portátiles, permitiendo demos de transcripción en tiempo cuasi-real sobre hardware de consumo.
- Generación de actas y notas automáticas: integrado en herramientas de productividad, transcribe reuniones grabadas en cualquiera de las lenguas soportadas y entrega texto plano listo para resumen posterior con un LLM.

## Benchmarks y rendimiento

WER sobre LibriSpeech test-clean completo (2620 enunciados), decodificación greedy sin LM externo:

| Cuantización | Tamaño | WER (%) |
|---|---:|---:|
| F32 | 3,7 GB | 1,92 |
| F16 | 1,8 GB | 1,92 |
| Q8_0 | 1,1 GB | 1,91 |
| Q6_K | 889 MB | 1,94 |
| Q5_K_M | 798 MB | 1,93 |
| Q4_K_M | 701 MB | 1,91 |

Referencia upstream reportada por NVIDIA: 2,18 % WER en el mismo conjunto. El port F32 obtiene 1,92 %, una diferencia de −0,26 pp atribuida por el autor a diferencias de scoring.

Rendimiento (RTF, Real-Time Factor; mayor es mejor):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 85,2 |
| Apple M4 Max | CPU | 18,9 |
| AMD Ryzen 7 4750U | Vulkan | 13,2 |
| AMD Ryzen 7 4750U | CPU | 6,7 |

Un RTF de 85,2 significa que el modelo procesa 85,2 segundos de audio por cada segundo de cómputo. En el Ryzen 7 4750U con Vulkan, 13,2 segundos de audio por segundo, suficiente para transcripción por lotes en portátiles.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 700 MB (Q4_K_M), 800 MB (Q5_K_M), 890 MB (Q6_K), 1,1 GB (Q8_0), 1,8 GB (F16) y 3,7 GB (F32), más overhead del runtime.
- GPU recomendadas: cualquier GPU con soporte Vulkan (integradas Intel/AMD recientes, discretas NVIDIA GTX/RTX) o Apple Silicon con Metal. Para máximo throughput, GPU de escritorio con varios GB de VRAM.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 2 GB de VRAM usando cuantizaciones Q4_K_M a Q8_0; incluso en iGPU compartiendo memoria del sistema.
- Cabe en CPU: sí, con RTF de 6,7 en un Ryzen 7 4750U (8 núcleos) y 18,9 en CPU de M4 Max.
- Opciones de despliegue: `transcribe.cpp` (CLI `transcribe-cli`), compilado desde fuente con CMake. No se mencionan otros runtimes compatibles en la información disponible.
- Latencia y throughput: RTF de 85,2 en Metal (M4 Max), 18,9 en CPU (M4 Max), 13,2 en Vulkan (Ryzen 7 4750U) y 6,7 en CPU (Ryzen 7 4750U). El modelo no es de streaming, por lo que la latencia total depende de la duración del audio de entrada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Traducción | Licencia | Formato | Notas |
|---|---:|---|---|---|---|---|
| canary-1b-v2 (este port GGUF) | 980 M | 25 europeas | Sí (en↔24) | CC-BY-4.0 | GGUF | Offline, CPU/GPU, sin streaming |
| Whisper large-v3 | 1,55 B | ~99 | Sí (X→en) | MIT | Safetensors, GGML/GGUF | Más idiomas, pero mayor tamaño y sin ruta en→X nativa |
| Whisper medium | 769 M | ~99 | Sí (X→en) | MIT | Safetensors, GGML/GGUF | Comparable en tamaño, cobertura lingüística mayor, calidad variable en lenguas de bajos recursos |
| NVIDIA Parakeet | No disponible en la información | No disponible | No disponible | No disponible | No disponible | Alternativa de NVIDIA para ASR en inglés |

La comparación con Whisper es la más directa por tamaño. Canary-1b-v2 ofrece traducción bidireccional inglés↔24 lenguas europeas, mientras que Whisper solo traduce hacia inglés de forma nativa. A cambio, Whisper cubre muchas más lenguas y tiene un ecosistema de despliegue más amplio. No se dispone de datos de benchmarks comparativos entre ambos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de streaming: requiere el audio completo (o segmentado externamente) antes de emitir transcripción.
- No expone timestamps de palabra ni de segmento en este port, lo que limita su uso para subtitulado sincronizado sin una etapa de alineación adicional.
- No realiza detección automática de idioma; es necesario indicar el idioma o implementar un clasificador externo.
- Cobertura limitada a 25 lenguas europeas; no soporta árabe, chino, japonés, coreano, hindi ni lenguas africanas o americanas.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero exige mantener el aviso de copyright y la referencia a NVIDIA como autor original.
- Riesgo de alucinación inherente a los modelos generativos de ASR, especialmente en audio con ruido, música de fondo o habla solapada; no se han publicado tasas de alucinación en la información disponible.
- Sesgos no documentados: la información proporcionada no incluye análisis de sesgos por acento, género o variedad dialectal.
- El port ha sido validado contra NeMo en un commit concreto; cambios en el runtime o en el modelo upstream pueden alterar el comportamiento.
- El rendimiento en lenguas de bajos recursos (maltés, estonio, esloveno) no se ha publicado en la información disponible; el único benchmark es LibriSpeech en inglés.

## Enlaces

- Repositorio HuggingFace del port: https://huggingface.co/lipik/canary-1b-v2-gguf
- Modelo base en HuggingFace: https://huggingface.co/nvidia/canary-1b-v2
- Commit upstream de referencia: https://huggingface.co/nvidia/canary-1b-v2/commit/87bc526
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación del runtime: https://github.com/handy-computer/transcribe.cpp/tree/db53eda
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/canary-1b-v2.md
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/nvidia/canary-1b-v2
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/legalcode.en
- Portal para desarrolladores de NVIDIA: https://developer.nvidia.com
- Papers citados en los tags: arXiv:2509.14128, arXiv:2505.13404, arXiv:2305.05084, arXiv:1706.03762, arXiv:2410.01036, arXiv:2406.00899, arXiv:2205.12446, arXiv:2012.03411, arXiv:2007.10310, arXiv:2005.08072, arXiv:1510.08484
