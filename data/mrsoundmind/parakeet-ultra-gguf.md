# mrsoundmind/parakeet-ultra-gguf

## Resumen

Parakeet Ultra es un modelo de reconocimiento automático del habla (ASR) multilingüe desarrollado por Moondream como un post-entrenamiento de parakeet-tdt-0.6b-v3 de NVIDIA. El repositorio `mrsoundmind/parakeet-ultra-gguf` contiene conversiones a formato GGUF del modelo original para su uso con transcribe.cpp, una implementación en C++ pensada para inferencia eficiente en CPU, Metal y Vulkan. El modelo mantiene la misma arquitectura, tokenizador y 627 millones de parámetros que la versión base.

La arquitectura combina un encoder FastConformer con un decodificador transducer TDT (Token-and-Duration Transducer), e incorpora una pequeña cabeza de detección de actividad vocal que segmenta grabaciones largas en pausas de hasta 30 segundos. El modelo procesa audio WAV mono a 16 kHz y produce transcripciones con puntuación, mayúsculas y marcas de tiempo opcionales a nivel de token. Cubre 25 idiomas europeos y no soporta streaming ni traducción.

La relevancia de esta conversión radica en que ofrece el modelo completo en cuantizaciones que van desde 486 MB (Q4_K_M) hasta 2,51 GB (F32), con una degradación mínima del WER en LibriSpeech test-clean (1,80% en F32 frente a 1,82% en Q4_K_M). Esto permite desplegar ASR multilingüe de calidad en hardware de consumo y en entornos sin GPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer encoder + TDT transducer decoder con cabeza de actividad vocal |
| Parámetros totales | 627.265.543 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (segmentación en tramos de hasta 30 s mediante VAD) |
| Tipos de cuantización | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 25 lenguas europeas: en, de, fr, es, it, pt, ru, uk, hr, sl, lv, lt, et, fi, sv, da, nl, pl, cs, sk, hu, ro, bg, el, mt |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo es un post-entrenamiento del parakeet-tdt-0.6b-v3 de NVIDIA, que combina un encoder FastConformer con un decodificador transducer TDT. La innovación principal del TDT es que predice conjuntamente tokens y duraciones, lo que permite un decodificado codicioso sin modelo de lenguaje externo. El modelo incorpora además una cabeza de voz pequeña que detecta pausas y corta grabaciones largas en segmentos de hasta 30 segundos, lo que habilita el procesamiento de audio de formato largo sin necesidad de segmentación externa.

El post-entrenamiento de Moondream mejora al modelo base en todos los grupos de benchmarks reportados: el conjunto FLEURS de 25 idiomas, audio con ruido de fondo y audio de formato largo. Según la model card, el modelo resultante es más rápido que el original ejecutado en NeMo. No se dispone de información detallada sobre el volumen de datos de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La conversión a GGUF fue validada contra la referencia kestrel 0.9.1 (Photon) en el commit 08f9e6f0 de transcribe.cpp.

## Capacidades

- Transcripción de voz a texto offline multilingüe en 25 idiomas europeos.
- Producción de transcripciones con puntuación y mayúsculas.
- Marcas de tiempo opcionales a nivel de token.
- Detección automática de idioma (`lang_detect: true`).
- Segmentación de audio de formato largo mediante cabeza de actividad vocal, con cortes en pausas de hasta 30 segundos.
- Decodificado codicioso de transducer sin modelo de lenguaje externo.
- No soporta streaming (`streaming: false`).
- No soporta traducción (`translate: false`).
- No se menciona soporte de tool calling, agentes ni modos de razonamiento.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo procesa audio de formato largo segmentándolo automáticamente por pausas, lo que permite transcribir conversaciones de horas sin preprocesado manual y con marcas de tiempo para localizar intervenciones.
- Subtitulado y accesibilidad: la salida con puntuación y mayúsculas, junto con las marcas de tiempo a nivel de token, facilita la generación de subtítulos sincronizados para vídeo y contenido educativo.
- Atención al cliente y análisis de llamadas: al cubrir 25 idiomas europeos con detección automática de idioma, puede transcribir grabaciones de centros de contacto multilingües para su posterior análisis de calidad o extracción de métricas.
- Investigación en lingüística y corpus: la licencia CC-BY-4.0 permite generar transcripciones para corpus académicos y estudios comparativos entre lenguas europeas, incluidas las de menor representación como el maltés o el esloveno.
- Despliegue en entornos sin GPU: las cuantizaciones Q4_K_M (486 MB) y Q5_K_M (550 MB) permiten ejecutar el modelo en CPU con un WER de 1,82% y 1,81% respectivamente en LibriSpeech test-clean, adecuado para dispositivos de borde o servidores sin acelerador.
- Archivado y búsqueda de contenido audiovisual: la transcripción offline de archivos de audio permite indexar y buscar en bibliotecas de podcasts, grabaciones de clases o archivos históricos sin depender de servicios en la nube.
- Integración en pipelines de C++: la librería transcribe.cpp y el formato GGUF permiten incorporar ASR directamente en aplicaciones nativas sin dependencias de Python ni de frameworks de aprendizaje profundo.

## Benchmarks y rendimiento

WER en LibriSpeech test-clean (2.620 enunciados, batch size 8, sin marcas de tiempo, hint de idioma `en`, decodificado en CUDA):

| Cuantización | Tamaño | WER LibriSpeech test-clean |
|---|---:|---:|
| F32 | 2,51 GB | 1,80% |
| F16 | 1,26 GB | 1,80% |
| Q8_0 | 740 MB | 1,80% |
| Q6_K | 611 MB | 1,81% |
| Q5_K_M | 550 MB | 1,81% |
| Q4_K_M | 486 MB | 1,82% |

WER en FLEURS con cuantización Q8_0:

| Idioma | WER |
|---|---:|
| it | 2,34% |
| es | 3,06% |
| pt | 4,16% |
| en | 4,26% |
| de | 4,58% |
| fr | 4,66% |
| ru | 5,63% |
| uk | 5,71% |
| pl | 6,16% |
| nl | 6,70% |
| sk | 7,83% |
| ro | 10,12% |
| cs | 11,04% |
| bg | 11,04% |
| fi | 11,14% |
| hr | 11,30% |
| sv | 12,83% |
| hu | 13,09% |
| et | 14,44% |
| da | 15,98% |
| mt | 17,01% |
| lt | 17,06% |
| lv | 18,04% |
| sl | 18,98% |
| el | 32,25% |

Audio de formato largo: en 11 charlas completas de TED-LIUM 3, segmentadas con la cabeza de actividad vocal del modelo, F32 obtiene un WER de 2,22%, idéntico a la referencia kestrel, y todas las cuantizaciones se mantienen dentro de 0,05 puntos porcentuales.

Rendimiento (RTF, factor de tiempo real):

| Plataforma | CPU | Acelerador |
|---|---:|---:|
| Apple M4 Max | 35,03 | 189,12 (Metal) |
| AMD Ryzen 4750U | 13,29 | 23,0 (Vulkan) |

Nota: la model card de Moondream reporta 1,41% en LibriSpeech test-clean, pero esa cifra emplea los normalizadores del Open ASR Leaderboard con alineamiento de compuestos; con el scorer de este repositorio, kestrel reproduce los valores de la tabla anterior. La misma diferencia de puntuación explica los valores más altos en FLEURS, especialmente en lenguas con compuestos.

## Requisitos de hardware

- VRAM estimada: entre 486 MB (Q4_K_M) y 2,51 GB (F32) para los pesos; el consumo real de memoria es ligeramente superior por los buffers de inferencia.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el modelo cabe holgadamente en RTX 3060, RTX 4090, A100 y H100. El rendimiento medido en Apple M4 Max con Metal alcanza un RTF de 189,12.
- GPU de consumo: sí, cabe en cualquier GPU de consumo moderna, incluidas las de gama baja con 4 GB o más.
- CPU: funciona en CPU con RTF de 35,03 en Apple M4 Max y 13,29 en AMD Ryzen 4750U.
- Opciones de despliegue: transcribe.cpp (compilación con CMake, binario `transcribe-cli`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, dado que es un modelo ASR y no un LLM.
- Latencia y throughput: RTF de 35,03 (CPU M4 Max), 189,12 (Metal M4 Max), 13,29 (CPU Ryzen 4750U) y 23,0 (Vulkan Ryzen 4750U). No se dispone de datos de throughput en GPU dedicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Formato | WER LibriSpeech test-clean |
|---|---:|---|---|---|---:|
| parakeet-ultra (este repo) | 627 M | 25 europeos | CC-BY-4.0 | GGUF | 1,80% (F32) |
| parakeet-tdt-0.6b-v3 (NVIDIA) | 0,6 B | 25 europeos | No disponible | NeMo | No disponible en la información proporcionada |
| Whisper large-v3 | No disponible | ~99 | MIT | Safetensors, GGUF | No disponible en la información proporcionada |

La model card indica que parakeet-ultra supera a parakeet-tdt-0.6b-v3 en todos los grupos de benchmarks, con una ventaja amplia en FLEURS de 25 idiomas, en ruido de fondo y en audio de formato largo, y que es más rápido que el original en NeMo. No se proporcionan cifras concretas de la versión v3 ni de Whisper en la información disponible.

## Limitaciones y advertencias

- No es un modelo de streaming: requiere el audio completo o segmentado previamente para su procesado.
- No realiza traducción: solo transcribe en el idioma original del audio.
- El WER es notablemente alto en griego (32,25%), esloveno (18,98%), letón (18,04%), lituano (17,06%) y maltés (17,01%), lo que limita su uso en producción para estas lenguas sin revisión humana.
- Las cifras de WER dependen del scorer y de los normalizadores empleados; la diferencia entre el 1,41% de la model card de Moondream y el 1,80% de este repositorio se debe al alineamiento de compuestos del Open ASR Leaderboard.
- Riesgo de alucinación en segmentos de silencio o ruido extremo, común en modelos transducer sin modelo de lenguaje externo.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero conviene revisar los términos completos en la model card upstream.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción a gran escala.
- La validación se realizó contra una referencia concreta (kestrel 0.9.1) en un commit específico de transcribe.cpp; cambios en la librería podrían alterar los resultados.
- No se dispone de información sobre sesgos demográficos o acústicos específicos del modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mrsoundmind/parakeet-ultra-gguf
- Modelo base: https://huggingface.co/moondream/parakeet-ultra
- Commit del modelo base: https://huggingface.co/moondream/parakeet-ultra/commit/73175eb
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Repositorio transcribe.cpp: https://github.com/mrsoundmind/transcribe.cpp
- Descarga F32: https://huggingface.co/mrsoundmind/parakeet-ultra-gguf/resolve/main/parakeet-ultra-F32.gguf
- Descarga F16: https://huggingface.co/mrsoundmind/parakeet-ultra-gguf/resolve/main/parakeet-ultra-F16.gguf
- Descarga Q8_0: https://huggingface.co/mrsoundmind/parakeet-ultra-gguf/resolve/main/parakeet-ultra-Q8_0.gguf
- Descarga Q6_K: https://huggingface.co/mrsoundmind/parakeet-ultra-gguf/resolve/main/parakeet-ultra-Q6_K.gguf
- Descarga Q5_K_M: https://huggingface.co/mrsoundmind/parakeet-ultra-gguf/resolve/main/parakeet-ultra-Q5_K_M.gguf
- Descarga Q4_K_M: https://huggingface.co/mrsoundmind/parakeet-ultra-gguf/resolve/main/parakeet-ultra-Q4_K_M.gguf
