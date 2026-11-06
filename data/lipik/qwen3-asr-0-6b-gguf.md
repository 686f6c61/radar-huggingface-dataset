# lipik/Qwen3-ASR-0.6B-gguf

## Resumen

Qwen3-ASR-0.6B es un modelo de reconocimiento automático del habla (ASR) desarrollado por el equipo Qwen de Alibaba, publicado como parte de la familia Qwen3-ASR junto a la variante de 1.7B. Resuelve el problema de la transcripción multilingüe offline: detecta automáticamente el idioma del audio y emite la transcripción en ese mismo idioma, cubriendo 30 idiomas y 22 dialectos chinos según la model card original. La ficha que nos ocupa, sin embargo, no es el modelo original, sino una conversión a formato GGUF realizada por el usuario `lipik` para su uso con el runtime `transcribe.cpp`.

Arquitectónicamente combina un codificador de audio bidireccional de 18 capas con un LM causal Qwen3 de 28 capas mediante inyección de tokens de audio en una secuencia fusionada audio+texto, sin mecanismo de atención cruzada. El modelo declara 782.452.240 parámetros en formato safetensors (aunque la nomenclatura comercial lo redondee a 0.6B) y está pensado para inferencia eficiente: la model card reporta 2000 veces de throughput con concurrencia 128 en la variante original.

Su relevancia actual radica en que ofrece una alternativa Apache-2.0 a Whisper para transcripción multilingüe, con cuantizaciones que caben en menos de 700 MB (Q4_K_M) y mantienen un WER del 2,26 % en LibriSpeech test-clean, lo que la hace viable en hardware de consumo y en despliegues embebidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de audio bidireccional (18 capas) + LM causal Qwen3 (28 capas) con inyección de tokens de audio, sin atención cruzada |
| Parametros totales | 782.452.240 (safetensors); ~0,6B nominales |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 30 idiomas: zh, en, yue, ar, de, fr, es, pt, id, it, ko, ru, th, vi, ja, tr, hi, ms, nl, sv, da, fi, pl, cs, fil, fa, el, ro, hu, mk (la model card original menciona además 22 dialectos chinos) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (repo de 0,9 GB); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo sigue un esquema de fusión temprana: un codificador de audio bidireccional de 18 capas procesa la señal y sus representaciones se inyectan como tokens dentro de la secuencia de entrada de un transformer causal Qwen3 de 28 capas. No hay cross-attention separada; audio y texto comparten el mismo flujo de tokens. La entrada debe ser WAV mono a 16 kHz. Según la model card original, el entrenamiento se apoya en datos de habla a gran escala y en la capacidad de comprensión auditiva del modelo fundacional Qwen3-Omni, aunque no se detallan el número de tokens de entrenamiento ni la composición exacta del dataset.

La model card original menciona inferencia unificada streaming/offline en un solo modelo y soporte para audio largo, pero la conversión GGUF de `lipik` desactiva explícitamente el streaming (`streaming: false`) y no soporta traducción (`translate: false`). Sí conserva la detección automática de idioma (`lang_detect: true`) y no emite timestamps (`timestamps: none`). La conversión se realizó desde el commit upstream `5eb144179a02acc5e5ba31e748d22b0cf3e303b0` (fijado el 2026-04-19) y se validó contra la referencia `qwen_asr 0.0.6` en el commit `3f61df7` de transcribe.cpp el 2026-04-20.

## Capacidades

- Transcripción de voz a texto multilingüe en 30 idiomas, incluyendo chino mandarín, cantonés, árabe, alemán, francés, español, portugués, indonesio, italiano, coreano, ruso, tailandés, vietnamita, japonés, turco, hindi, malayo, neerlandés, sueco, danés, finés, polaco, checo, filipino, persa, griego, rumano, húngaro y macedonio.
- Identificación automática del idioma del audio y transcripción en ese mismo idioma.
- Reconocimiento robusto en entornos acústicos complejos y patrones textuales difíciles, según la model card upstream.
- Soporte de audio largo en la variante original (la conversión GGUF no documenta límite explícito de duración).
- No soporta streaming en esta conversión.
- No soporta traducción (solo transcripción en el idioma detectado).
- No emite timestamps ni marcas temporales.
- No admite sugerencias explícitas de idioma en esta versión.
- No dispone de tool calling, function calling ni capacidades de agente: es un modelo puramente ASR.

## Casos de uso

- Subtitulado automático de vídeo multilingüe: el modelo detecta el idioma de la pista de audio y genera la transcripción en ese idioma, lo que permite procesar un catálogo heterogéneo sin seleccionar el idioma manualmente por pista.
- Transcripción de reuniones y notas de voz: con cuantización Q8_0 (811 MB) puede ejecutarse en un portátil con CPU y convertir grabaciones de 16 kHz mono en texto sin depender de la nube.
- Indexación y búsqueda de archivos de audio: al transcribir lotes de grabaciones se pueden generar índices de texto para búsqueda semántica o por palabras clave en archivos de podcasts, entrevistas o archivos periodísticos.
- Accesibilidad para contenido audiovisual: generación de transcripciones para personas con discapacidad auditiva en plataformas educativas o corporativas, con la ventaja de que el modelo cubre idiomas que Whisper no maneja con la misma calidad declarada.
- Procesamiento en el borde (edge computing): con Q4_K_M (654 MB) y un factor de tiempo real de 16,5 en CPU de Apple M4 Max o 4,3 en Ryzen 4750U, es viable en dispositivos sin GPU dedicada para asistentes de voz locales.
- Análisis de llamadas de atención al cliente: transcripción por lotes de grabaciones telefónicas (previa conversión a WAV mono 16 kHz) para extraer métricas de calidad o alimentar sistemas de análisis de sentimiento.
- Investigación en lingüística computacional: corpus multilingües transcritos de forma homogénea con un único modelo Apache-2.0, lo que simplifica la comparación entre idiomas y dialectos.

## Benchmarks y rendimiento

Resultados de WER sobre LibriSpeech `test-clean` completo (2620 enunciados en inglés), medidos con el normalizador de texto estilo Whisper y jiwer 3.x sobre el backend Metal de un Apple M4:

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| BF16 | 1,46 GB | 2,11 % |
| F16 | 1,47 GB | 2,12 % |
| Q8_0 | 811 MB | 2,11 % |
| Q6_K | 763 MB | 2,10 % |
| Q5_K_M | 707 MB | 2,21 % |
| Q4_K_M | 654 MB | 2,26 % |

BF16, F16, Q8_0 y Q6_K están dentro del intervalo de confianza bootstrap entre sí; Q5_K_M y Q4_K_M muestran una regresión pequeña pero real atribuida al token-embedding/head atado.

Rendimiento (factor de tiempo real, RTF):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 65 |
| Apple M4 Max | CPU | 16,5 |
| Ryzen 4750U | Vulkan | 8 |
| Ryzen 4750U | CPU | 4,3 |

La model card original reporta 2000 veces de throughput con concurrencia 128 para la variante de 0,6B, aunque no se aportan cifras comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,7 GB (Q4_K_M) y 1,5 GB (BF16/F16) solo para pesos; hay que sumar el estado de activaciones y el búfer de audio, por lo que en la práctica conviene reservar entre 1,5 y 3 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; se ha validado en Apple Silicon (Metal) y en iGPU AMD (Vulkan). Para despliegues de alto throughput, A100 o H100 con vLLM no aplican aquí porque el runtime es transcribe.cpp, no un servidor de LLM.
- Cabe en GPU de consumo: sí, en cualquier RTX 30/40, RX 6000/7000 y en Apple Silicon con memoria unificada; también funciona solo con CPU.
- Opciones de despliegue: transcribe.cpp (runtime oficial de esta conversión, con backend Metal, Vulkan y CPU). No se documenta soporte para llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: RTF de 65 en Metal sobre M4 Max (aproximadamente 65 segundos de audio procesados por segundo de cómputo), 16,5 en CPU de M4 Max, 8 en Vulkan sobre Ryzen 4750U y 4,3 en CPU del mismo equipo. En la práctica, un audio de 10 minutos se transcribe en unos 9 segundos en M4 Max con Metal.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | WER LibriSpeech test-clean |
|---|---|---|---:|---|---:|
| Qwen3-ASR-0.6B (esta conversion) | ~0,78B | 30 + 22 dialectos zh | Apache-2.0 | GGUF | 2,11 % (Q8_0) |
| Qwen3-ASR-1.7B | ~1,7B | 30 + 22 dialectos zh | Apache-2.0 | safetensors (upstream) | No disponible en la informacion |
| Whisper large-v3 | ~1,55B | ~99 | MIT | safetensors, GGUF, etc. | No disponible en la informacion |
| Whisper small | ~244M | ~99 | MIT | safetensors, GGUF, etc. | No disponible en la informacion |

La comparación cuantitativa con Whisper no puede completarse porque la información proporcionada no incluye sus cifras de WER en el mismo conjunto de evaluación. La ventaja diferencial de Qwen3-ASR-0.6B frente a Whisper small es su menor tamaño en cuantización Q4_K_M (654 MB) y su soporte declarado de detección automática de idioma; su desventaja es la menor cobertura idiomática (30 idiomas frente a ~99) y la ausencia de timestamps en esta conversión.

## Limitaciones y advertencias

- Solo transcribe; no traduce. Para traducción hay que encadenar un modelo de traducción aparte.
- No emite timestamps, lo que impide generar subtítulos sincronizados directamente con esta conversión.
- No soporta streaming: hay que procesar el audio completo de una vez.
- No admite sugerencias explícitas de idioma; la detección es automática y puede fallar en audios muy cortos, con ruido o con mezcla de idiomas.
- Entrada restringida a WAV mono a 16 kHz; es necesario remuestrear con ffmpeg u otra herramienta antes de la inferencia.
- Riesgo de alucinación en segmentos de silencio, ruido o música, comportamiento común en modelos ASR basados en LM.
- Sesgos lingüísticos y acústicos heredados de los datos de entrenamiento de Qwen3-Omni; no se documentan evaluaciones de sesgo en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base y conviene revisar la model card upstream para términos completos.
- Esta conversión concreta tiene 19 descargas y 0 likes en el momento de la consulta; es un artefacto reciente (creado el 2026-10-28) sin validación comunitaria extensa más allá de la comprobación del autor.
- El repo GGUF (0,9 GB) no incluye todos los ficheros de cuantización en el mismo espacio de nombres que la model card original (los enlaces apuntan a `handy-computer/Qwen3-ASR-0.6B-gguf`), lo que puede confundir al descargar.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/lipik/Qwen3-ASR-0.6B-gguf
- Modelo base original: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Commit upstream fijado: https://huggingface.co/Qwen/Qwen3-ASR-0.6B/commit/5eb144179a02acc5e5ba31e748d22b0cf3e303b0
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/qwen3-asr-0.6b.md
- Commit de validación en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/3f61df7
- Repositorio alternativo con los GGUF enlazados: https://huggingface.co/handy-computer/Qwen3-ASR-0.6B-gguf
- Paper de referencia (arXiv:2601.21337): https://arxiv.org/abs/2601.21337
