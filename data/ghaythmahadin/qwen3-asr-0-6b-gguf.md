# GhaythMahadin/Qwen3-ASR-0.6B-gguf

## Resumen

Qwen3-ASR-0.6B-gguf es la conversión a formato GGUF del modelo de reconocimiento automático de voz Qwen3-ASR-0.6B, desarrollado originalmente por el equipo Qwen de Alibaba. Esta versión ha sido portada y cuantizada por GhaythMahadin para su uso con transcribe.cpp, un motor de inferencia en C/C++ orientado a la transcripción de audio en local. El modelo resuelve el problema de la transcripción multilingüe offline: convierte audio de 16 kHz mono en texto, detectando automáticamente el idioma de la señal entre 30 idiomas.

Arquitectónicamente combina un codificador de audio bidireccional de 18 capas con un modelo de lenguaje causal Qwen3 de 28 capas, mediante inyección de tokens de audio en una secuencia fusionada audio+texto, sin atención cruzada. El resultado son 782.452.240 parámetros totales, un tamaño que permite ejecución en CPU y GPU de consumo.

Su relevancia actual radica en que ofrece una alternativa ligera, con licencia Apache-2.0 y ejecutable en hardware modesto, frente a APIs comerciales de transcripción. Las cuantizaciones publicadas van de BF16 (1,46 GB) a Q4_K_M (654 MB), con un WER en LibriSpeech test-clean que se mantiene entre el 2,10 % y el 2,26 % según la cuantización, lo que demuestra una degradación muy contenida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de audio bidireccional (18 capas) + LM causal Qwen3 (28 capas) con inyección de tokens de audio |
| Parametros totales | 782.452.240 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 30 idiomas y dialectos (zh, en, yue, ar, de, fr, es, pt, id, it, ko, ru, th, vi, ja, tr, hi, ms, nl, sv, da, fi, pl, cs, fil, fa, el, ro, hu, mk) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo sigue un diseño de fusión temprana: un codificador de audio bidireccional de 18 capas procesa la señal y proyecta los estados resultantes como tokens de audio que se inyectan en la secuencia de entrada de un LM causal Qwen3 de 28 capas. No hay módulo de atención cruzada, sino una única secuencia fusionada audio+texto. El modelo base Qwen3-ASR se apoya en la capacidad de comprensión de audio de Qwen3-Omni y se entrenó con datos de habla a gran escala, según la model card original.

La model card upstream menciona que la familia Qwen3-ASR soporta identificación de idioma y reconocimiento en 52 idiomas y dialectos (30 idiomas más 22 dialectos chinos), aunque esta conversión GGUF declara 30 idiomas en sus metadatos. El modelo realiza detección automática de idioma (`lang_detect: true`) y no soporta streaming ni traducción (`streaming: false`, `translate: false`). No se dispone de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Reconocimiento automático de voz (ASR) offline sobre audio de 16 kHz mono en formato WAV.
- Detección automática del idioma del audio entre 30 idiomas, con salida de la transcripción en ese mismo idioma.
- Soporte multilingüe amplio: chino, inglés, cantonés, árabe, alemán, francés, español, portugués, indonesio, italiano, coreano, ruso, tailandés, vietnamita, japonés, turco, hindi, malayo, neerlandés, sueco, danés, finés, polaco, checo, filipino, persa, griego, rumano, húngaro y macedonio.
- Reconocimiento robusto en entornos acústicos complejos y patrones de texto difíciles, según la documentación upstream.
- No soporta indicaciones explícitas de idioma en esta versión (`explicit language hints are not supported at this time`).
- No genera marcas de tiempo (`timestamps: none`); para alineación temporal existe Qwen3-ForcedAligner-0.6B, no incluido en este repositorio.
- No soporta streaming ni traducción.

## Casos de uso

- Transcripción de reuniones y notas de voz en local: el modelo procesa audio pregrabado sin conexión a servicios externos, lo que resulta adecuado para entornos con requisitos de privacidad y para volúmenes moderados en portátiles.
- Subtitulado de contenido audiovisual multilingüe: al detectar automáticamente el idioma, se puede usar en pipelines que reciben vídeos en distintos idiomas sin configurar el idioma de entrada manualmente.
- Archivado y búsqueda de grabaciones: transcripción por lotes de entrevistas, pódcast o llamadas para indexar el texto y habilitar búsqueda sobre el contenido hablado.
- Asistentes de voz embebidos: con cuantización Q4_K_M (654 MB) y ejecución en CPU o Vulkan, puede integrarse en aplicaciones de escritorio o dispositivos con recursos limitados.
- Accesibilidad: generación de transcripciones para personas con discapacidad auditiva en aplicaciones de videoconferencia, ejecutando el modelo en el propio dispositivo.
- Investigación en ASR: al ser un modelo pequeño con licencia Apache-2.0 y resultados de WER reproducibles, sirve como línea base para experimentos de cuantización, evaluación multilingüe o comparación de motores de inferencia.
- Procesamiento de audio en regiones con conectividad limitada: al no requerir API externa, permite desplegar transcripción en entornos aislados o con ancho de banda restringido.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| WER LibriSpeech test-clean (BF16) | 2,11 % |
| WER LibriSpeech test-clean (F16) | 2,12 % |
| WER LibriSpeech test-clean (Q8_0) | 2,11 % |
| WER LibriSpeech test-clean (Q6_K) | 2,10 % |
| WER LibriSpeech test-clean (Q5_K_M) | 2,21 % |
| WER LibriSpeech test-clean (Q4_K_M) | 2,26 % |
| RTF en Apple M4 Max (Metal) | 65 |
| RTF en Apple M4 Max (CPU) | 16,5 |
| RTF en Ryzen 4750U (Vulkan) | 8 |
| RTF en Ryzen 4750U (CPU) | 4,3 |

El WER se midió sobre la partición completa de LibriSpeech test-clean (2620 enunciados en inglés) con el normalizador de texto estilo Whisper y jiwer 3.x, en el backend Metal de un Apple M4. BF16, F16, Q8_0 y Q6_K están dentro del intervalo de confianza bootstrap entre sí; Q5_K_M y Q4_K_M muestran una regresión pequeña pero real atribuida al token-embedding y la cabeza de salida compartidos. El RTF (factor de tiempo real) indica cuántas veces más rápido que tiempo real procesa el audio: valores más altos son mejores. No se han publicado resultados de benchmarks multilingües en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB en BF16/F16, 0,8 GB en Q8_0, 0,76 GB en Q6_K, 0,71 GB en Q5_K_M y 0,65 GB en Q4_K_M, más el espacio de trabajo del codificador de audio y del contexto.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria libre para las cuantizaciones más pequeñas; tarjetas como RTX 3060, RTX 4060 o superiores son suficientes. En el extremo alto, A100 o H100 no son necesarias para este tamaño, pero pueden usarse para procesamiento por lotes de alto volumen.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones publicadas, incluidas GPUs de gama baja con 2-4 GB de VRAM.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli`), con backends Metal, Vulkan y CPU. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: RTF de 65 en Metal (M4 Max), 16,5 en CPU (M4 Max), 8 en Vulkan (Ryzen 4750U) y 4,3 en CPU (Ryzen 4750U). La model card upstream cita 2000 veces de throughput con concurrencia 128 para el modelo 0.6B, aunque esa cifra corresponde al stack original y no necesariamente a esta conversión.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | WER LibriSpeech test-clean |
|---|---|---|---|---|---|
| Qwen3-ASR-0.6B-gguf (este) | 782 M | 30 | Apache-2.0 | GGUF | 2,10-2,26 % |
| Qwen3-ASR-1.7B | No disponible | 52 (30 idiomas + 22 dialectos) | Apache-2.0 (upstream) | No disponible | No disponible |
| Whisper large-v3 | No disponible | No disponible | No disponible | No disponible | No disponible |

La información proporcionada no incluye datos de benchmarks ni especificaciones de Whisper u otros modelos comparables, por lo que la comparación cuantitativa con alternativas queda limitada. El modelo hermano Qwen3-ASR-1.7B es la alternativa natural dentro de la misma familia, con mayor tamaño y cobertura declarada de idiomas, pero sin cifras de rendimiento en esta fuente.

## Limitaciones y advertencias

- Solo acepta audio de 16 kHz mono en WAV; es necesario convertir otros formatos previamente con ffmpeg.
- No soporta indicaciones explícitas de idioma: la detección es automática y no se puede forzar un idioma concreto.
- No genera marcas de tiempo; para alineación temporal se requiere Qwen3-ForcedAligner-0.6B, que no forma parte de este repositorio.
- No soporta streaming ni traducción: solo transcripción offline en el idioma detectado.
- El WER publicado corresponde únicamente al caso inglés; el rendimiento en los otros 29 idiomas no está cuantificado en la información disponible.
- Las cuantizaciones Q5_K_M y Q4_K_M presentan una regresión medible de WER (2,21 % y 2,26 % frente a 2,10-2,12 % en precisiones altas), atribuida al token-embedding y la cabeza compartidos.
- Riesgo de alucinación y errores en audio con ruido, acentos no vistos o solapamiento de hablantes; la model card no documenta sesgos específicos.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base y conviene revisar la model card upstream para los términos completos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la validación se realizó contra una versión concreta de transcribe.cpp (commit 3f61df7); cambios posteriores del motor podrían afectar a la compatibilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/GhaythMahadin/Qwen3-ASR-0.6B-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Commit del modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B/commit/5eb144179a02acc5e5ba31e748d22b0cf3e303b0
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/3f61df7
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/qwen3-asr-0.6b.md
- Conversión GGUF de referencia: https://huggingface.co/handy-computer/Qwen3-ASR-0.6B-gguf
- Paper citado en los tags (arXiv:2601.21337): https://arxiv.org/abs/2601.21337
