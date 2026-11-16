# prithivMLmods/VibeVoice-ASR-HF-GGUF

## Resumen

VibeVoice-ASR-HF-GGUF es la versión cuantizada en formato GGUF del modelo de reconocimiento automático del habla VibeVoice-ASR de Microsoft Research, publicada por el usuario prithivMLmods. Se trata de un modelo unificado de voz a texto (ASR) con 7.615.616.512 parámetros que realiza de forma conjunta transcripción, diarización de hablantes y marcado temporal, emitiendo una salida estructurada tipo JSON con quién habla (Speaker), cuándo (Start/End) y qué dice (Content). Su rasgo más distintivo es que procesa hasta 60 minutos de audio continuo en una sola pasada dentro de una ventana de contexto de 64K tokens, lo que permite mantener la coherencia semántica y el seguimiento de hablantes a lo largo de grabaciones completas.

El modelo base, microsoft/VibeVoice-ASR-HF, está disponible bajo licencia MIT y soporta más de 50 idiomas sin configuración explícita de idioma, incluyendo cambios de código (code-switching) y la posibilidad de inyectar contexto o hotwords (nombres propios, terminología técnica) para mejorar la precisión en dominios específicos. En el Open ASR Leaderboard promedia un 7,77 % de WER, con un 2,20 % en LibriSpeech test-clean y un 17,20 % en AMI, y un RTFx de 51,8.

Esta versión GGUF es relevante porque traslada esas capacidades al ecosistema llama.cpp, con cuantizaciones que van desde Q3_K_M (3,81 GB) hasta BF16 (15,2 GB), más un fichero de proyección multimodal mmproj-bf16 de 1,43 GB. Esto permite ejecutar un modelo ASR de nivel investigación en hardware de consumo y en entornos sin dependencia de Transformers, manteniendo la licencia MIT para uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base de Microsoft Research; se ejecuta como modelo multimodal audio-texto con proyector mmproj en llama.cpp) |
| Parámetros totales | 7.615.616.512 |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | 64K tokens (hasta 60 minutos de audio continuo) |
| Tipos de cuantización | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M; proyector multimodal en BF16 |
| Idiomas soportados | Más de 50, entre ellos en, zh, es, pt, de, ja, ko, fr, ru, id, sv, it, he, nl, pl, no, tr, th, ar, hu, ca, cs, da, fa, af, hi, fi, et, aa, el, ro, vi, bg, is, sl, sk, lt, sw, uk, kl, lv, hr, ne, sr, tl, yi, ms, ur, mn, hy, jv |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones K-quants y BF16) + mmproj GGUF para la parte multimodal |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base (tipo de transformer, número de capas o composición exacta del dataset de entrenamiento). Lo que sí se documenta es su diseño funcional: un modelo unificado de voz a texto que integra en una sola pasada la transcripción, la diarización de hablantes y el marcado temporal, generando una salida estructurada con los campos Speaker, Start, End y Content. Para gestionar audio largo, el modelo trocea la entrada en segmentos de 60 segundos y cachea los estados de convolución entre segmentos, lo que permite procesar hasta 60 minutos dentro de una ventana de 64K tokens; el tamaño de trozo es ajustable mediante `tokenizer_chunk_size` si la memoria es limitada.

En cuanto a la innovación técnica, destaca el procesamiento de audio de larga duración con coherencia global, la ausencia de configuración explícita de idioma (detección y manejo de más de 50 idiomas, incluido code-switching) y la aceptación de contexto opcional o hotwords para sesgar la decodificación hacia nombres y términos técnicos. El modelo base es compatible con Transformers v5.3.0 o superior mediante `VibeVoiceAsrForConditionalGeneration`, y admite inferencia por lotes, entradas con chat template, entrenamiento con la pérdida incorporada, `torch.compile` y uso como pipeline. No se especifican en la información proporcionada los detalles de RLHF/DPO ni el número de tokens de entrenamiento.

## Capacidades

- Transcripción de voz a texto (ASR) de alta precisión en más de 50 idiomas sin indicar el idioma de forma explícita.
- Diarización de hablantes: identifica y etiqueta quién habla en cada momento.
- Marcado temporal: genera marcas de inicio y fin por segmento de habla.
- Salida estructurada tipo JSON con los campos Speaker, Start, End y Content.
- Procesamiento de audio largo: hasta 60 minutos continuos en una sola pasada con contexto de 64K tokens.
- Manejo de code-switching (cambios de idioma dentro de una misma grabación).
- Inyección de contexto y hotwords (nombres propios, términos técnicos) para mejorar la precisión en dominios específicos.
- Soporte de inferencia por lotes y de entradas con chat template en el modelo base.
- Compatibilidad con llama.cpp mediante `llama-mtmd-cli` y el fichero de proyección multimodal.
- Capacidad de entrenamiento con la pérdida incorporada del modelo base y de compilación con `torch.compile`.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión ni audio de salida (es un modelo exclusivamente de audio a texto).

## Casos de uso

- Transcripción de reuniones y actas: el modelo procesa una reunión completa de hasta 60 minutos en una sola pasada y devuelve segmentos con hablante, inicio, fin y contenido, lo que permite generar actas atribuidas por participante sin post-procesado de diarización externo.
- Subtitulado y indexación de contenido audiovisual: la salida con marcas temporales por segmento sirve directamente para generar subtítulos sincronizados o para indexar búsquedas sobre podcasts y vídeos largos.
- Análisis de entrevistas y estudios cualitativos: la diarización integrada permite separar entrevistador y entrevistado en grabaciones de investigación, y la inyección de hotwords con terminología del estudio mejora la transcripción de jerga específica.
- Atención al cliente y análisis de llamadas: transcribir conversaciones telefónicas con atribución de hablante facilita el control de calidad, la detección de incidencias y el cumplimiento normativo en centros de contacto.
- Documentación clínica o legal dictada: con contexto y hotwords configurados con nombres de fármacos, procedimientos o terminología jurídica, el modelo puede transcribir dictados largos manteniendo la coherencia a lo largo de toda la grabación.
- Despliegue en local y en el borde: las cuantizaciones Q4_K_M (4,68 GB) y Q5_K_M (5,44 GB) permiten ejecutar el modelo en equipos con GPU de consumo o incluso en CPU mediante llama.cpp, útil para entornos con requisitos de privacidad o sin conectividad.
- Procesamiento por lotes de archivos de audio en pipelines internos: el soporte de inferencia por lotes del modelo base y la ejecución vía llama.cpp permiten transcribir volúmenes de grabaciones de forma automatizada.

## Benchmarks y rendimiento

Resultados publicados del modelo base en el Open ASR Leaderboard (según la model card):

| Benchmark | Resultado |
|---|---|
| WER medio (Open ASR Leaderboard) | 7,77 % |
| WER LibriSpeech test-clean | 2,20 % |
| WER AMI | 17,20 % |
| RTFx | 51,8 |

El informe técnico del modelo base incluye además resultados de diarización (DER) y de WER atribuido por hablante (cpWER, tcpWER), pero sus valores no se detallan en la información proporcionada. No se han publicado en la información disponible resultados de benchmarks específicos para esta versión GGUF cuantizada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del fichero GGUF más el proyector mmproj-bf16 (1,43 GB). Con Q4_K_M (4,68 GB) se necesitan en torno a 6-7 GB; con Q5_K_M (5,44 GB), en torno a 7-8 GB; con Q8_0 (8,1 GB), en torno a 10 GB; con BF16 (15,2 GB), en torno a 17-18 GB.
- GPU recomendadas: RTX 3060 12 GB o superior para Q4_K_M y Q5_K_M; RTX 4090 o A100/H100 para BF16 y Q8_0 con audio largo.
- Cabe en GPU de consumo: sí, con las cuantizaciones Q3 y Q4 en tarjetas de 8-12 GB, y con Q5/Q6 en tarjetas de 12-16 GB. Las cuantizaciones Q3_K_M (3,81 GB) y Q4_K_S (4,46 GB) son las más adecuadas para VRAM limitada.
- Opciones de despliegue: llama.cpp mediante `llama-mtmd-cli` (compilado con backend CUDA u otro), y el modelo base vía Transformers v5.3.0 o superior con `VibeVoiceAsrForConditionalGeneration`. No se documenta soporte específico de vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: el modelo base reporta un RTFx de 51,8 en el Open ASR Leaderboard; no se dispone de cifras de latencia o throughput para las versiones GGUF. Para audio largo, el consumo de memoria puede reducirse ajustando `tokenizer_chunk_size`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / audio | Diarización integrada | Licencia | Formato |
|---|---|---|---|---|---|
| VibeVoice-ASR-HF-GGUF (esta ficha) | 7,62 B | 64K tokens / hasta 60 min | Sí | MIT | GGUF + mmproj |
| microsoft/VibeVoice-ASR-HF (base) | 7,62 B | 64K tokens / hasta 60 min | Sí | MIT | Safetensors (Transformers) |
| Whisper large-v3 | No disponible en la información proporcionada | No disponible en la información proporcionada | No (requiere pipeline externo) | No disponible en la información proporcionada | No disponible en la información proporcionada |

La información proporcionada solo permite comparar con el modelo base del que deriva esta cuantización. No se dispone de datos de benchmarks ni especificaciones de alternativas como Whisper, Parakeet o Canary en el material consultado, por lo que la comparación cuantitativa con modelos de la misma categoría queda como no disponible.

## Limitaciones y advertencias

- No se documentan en la información disponible los sesgos conocidos del modelo; al ser un sistema entrenado sobre datos de habla de más de 50 idiomas, es razonable esperar variaciones de precisión entre idiomas y acentos, pero no se aportan cifras.
- Riesgo de alucinación en la transcripción: como todo modelo generativo, puede producir contenido no presente en el audio, especialmente en segmentos con ruido, solapamiento de hablantes o audio de baja calidad.
- La calidad se degrada con las cuantizaciones más agresivas: Q3_K_M y Q3_K_L están etiquetadas por el autor como de menor calidad, y Q4_K_S como ligeramente inferior a Q4_K_M.
- El rendimiento en audio largo depende de la memoria disponible; con VRAM limitada es necesario reducir `tokenizer_chunk_size`, lo que puede afectar a la coherencia global.
- La diarización integrada puede fallar en conversaciones con muchos hablantes simultáneos o voces muy similares; no se documentan límites máximos de hablantes.
- El modelo es exclusivamente de audio a texto: no genera voz, no procesa vídeo ni imágenes, y no se documentan capacidades de tool calling o agentes.
- La licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base original de Microsoft Research y de los datos de entrenamiento antes de un despliegue en producción.
- Esta publicación GGUF es de un tercero (prithivMLmods), no oficial de Microsoft; la integridad y el mantenimiento de las cuantizaciones dependen del autor del repositorio.
- El repositorio muestra 0 descargas y 1 like en el momento de la consulta, lo que indica una adopción muy temprana y poca validación comunitaria de estas cuantizaciones concretas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/prithivMLmods/VibeVoice-ASR-HF-GGUF
- Modelo base: https://huggingface.co/microsoft/VibeVoice-ASR-HF
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Open ASR Leaderboard (resultados del modelo base citados en la model card): no disponible como enlace directo en la información proporcionada
- Informe técnico del modelo base (citado en la model card): no disponible como enlace directo en la información proporcionada
