# mrsoundmind/Qwen3-ASR-0.6B-gguf

## Resumen

Qwen3-ASR-0.6B es un modelo de reconocimiento automático del habla (ASR) desarrollado por el equipo Qwen de Alibaba, publicado como parte de la familia Qwen3-ASR junto a una variante de 1.7B. Resuelve la transcripción multilingüe offline de audio a texto con detección automática de idioma, cubriendo 30 idiomas y 22 dialectos chinos. La versión aquí descrita es una conversión a GGUF realizada por el usuario mrsoundmind para su uso con la librería transcribe.cpp, derivada del modelo base `Qwen/Qwen3-ASR-0.6B` (commit fijado del 19 de abril de 2026).

El modelo combina un codificador de audio bidireccional de 18 capas con un LM causal Qwen3 de 28 capas mediante inyección de tokens de audio en una secuencia fusionada (sin cross-attention). El resultado es un modelo de 782.452.240 parámetros reales (etiquetado comercialmente como 0.6B) que acepta WAV mono a 16 kHz y emite la transcripción en el idioma detectado. Su relevancia actual radica en que ofrece una alternativa Apache-2.0, ejecutable en CPU y GPU de consumo, con un WER de 2,11 % en LibriSpeech test-clean y una huella de 654 MB en cuantización Q4_K_M.

Las conversiones GGUF de este repositorio permiten desplegar el modelo sin dependencias de Python ni frameworks de deep learning pesados, mediante el binario `transcribe-cli` de transcribe.cpp. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, lo que indica que es una conversión reciente y poco difundida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de audio bidireccional de 18 capas + LM causal Qwen3 de 28 capas con inyección de tokens de audio (secuencia fusionada, sin cross-attention) |
| Parametros totales | 782.452.240 (dato real de safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 30 idiomas: zh, en, yue, ar, de, fr, es, pt, id, it, ko, ru, th, vi, ja, tr, hi, ms, nl, sv, da, fi, pl, cs, fil, fa, el, ro, hu, mk (el modelo base declara además 22 dialectos chinos) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (transcribe.cpp); el modelo base original en safetensors |

## Arquitectura y entrenamiento

La arquitectura sigue un esquema encoder-decoder híbrido poco convencional: un codificador de audio bidireccional de 18 capas procesa la señal acústica y sus representaciones se inyectan como tokens dentro de la secuencia de entrada de un LM causal Qwen3 de 28 capas. No hay módulo de cross-attention separado; audio y texto se fusionan en una única secuencia que el LM procesa de forma autorregresiva. Esta aproximación aprovecha la capacidad de comprensión de audio del modelo fundacional Qwen3-Omni, del que deriva la familia Qwen3-ASR.

El modelo base fue entrenado con datos de habla a gran escala según la model card original, aunque no se detalla el número exacto de tokens ni la composición del dataset en la información disponible. La familia incluye detección de idioma integrada (lang_detect: true) y soporte de transcripción de audio largo. La conversión GGUF fue validada contra la referencia `qwen_asr 0.0.6` en el commit `3f61df7` de transcribe.cpp el 20 de abril de 2026, y portada desde el commit upstream `5eb144179a02acc5e5ba31e748d22b0cf3e303b0` fijado el 19 de abril de 2026.

## Capacidades

- Transcripción de voz a texto offline en 30 idiomas, con detección automática del idioma del audio y emisión de la transcripción en ese mismo idioma.
- Reconocimiento robusto en entornos acústicos complejos y patrones de texto difíciles, según la model card original.
- Detección de idioma integrada (`lang_detect: true`); no se admiten pistas explícitas de idioma en esta conversión.
- Soporte de audio largo según el modelo base (la familia Qwen3-ASR soporta transcripción de audio largo y streaming/offline unificado; esta conversión GGUF declara `streaming: false`).
- No soporta traducción (`translate: false`): transcribe en el idioma original, no traduce.
- No genera timestamps (`timestamps: none`); para alineación temporal el ecosistema Qwen ofrece Qwen3-ForcedAligner-0.6B, no incluido aquí.
- Entrada limitada a WAV mono a 16 kHz; requiere conversión previa con ffmpeg para otros formatos.
- No dispone de tool calling, function calling ni capacidades de agente: es un modelo puramente ASR.

## Casos de uso

- Transcripción de reuniones y actas: el modelo procesa audio de voz conversacional en 30 idiomas y detecta el idioma automáticamente, lo que permite generar actas en entornos multilingües sin configurar el idioma por adelantado. Su WER de 2,11 % en inglés limpio lo hace adecuado para audio de calidad media-alta.
- Subtitulado de contenido audiovisual: aunque esta conversión no emite timestamps, la transcripción resultante puede alinearse posteriormente con herramientas externas o con Qwen3-ForcedAligner; el tamaño de 654 MB en Q4_K_M permite ejecutarlo en el mismo equipo de edición.
- Procesamiento por lotes en servidores sin GPU: con el backend CPU de transcribe.cpp y un RTF de 4,3 en un Ryzen 4750U (Vulkan 8), el modelo puede transcribir archivos en pipelines de ingestión documental o archivística sin depender de CUDA.
- Transcripción en el dispositivo (edge): con 654 MB en Q4_K_M y backend Metal en Apple M4 (RTF 65), cabe en portátiles y estaciones de trabajo de consumo para dictado, notas de voz o accesibilidad en tiempo casi real.
- Investigación lingüística y dialectología: al cubrir 30 idiomas y 22 dialectos chinos con detección automática, sirve para corpus multilingües donde etiquetar el idioma manualmente sería costoso.
- Integración en aplicaciones de accesibilidad: transcripción local de audio para personas con discapacidad auditiva, sin enviar datos a servicios en la nube, gracias a la licencia Apache-2.0 y al despliegue con un único binario.
- Preprocesado para pipelines de NLP: convertir llamadas, entrevistas o podcasts en texto antes de pasarlos a modelos de lenguaje o sistemas de búsqueda, aprovechando la licencia permisiva para uso comercial.

## Benchmarks y rendimiento

| Benchmark | BF16 | F16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M |
|---|---:|---:|---:|---:|---:|---:|
| WER LibriSpeech test-clean (%) | 2,11 | 2,12 | 2,11 | 2,10 | 2,21 | 2,26 |

WER medido sobre la partición completa `test-clean` de LibriSpeech (2620 enunciados en inglés) con el normalizador de texto inglés estilo Whisper y jiwer 3.x, en el backend Metal de un Apple M4. El autor indica que BF16, F16, Q8_0 y Q6_K están dentro del intervalo de confianza bootstrap entre sí, mientras que Q5_K_M y Q4_K_M muestran una regresión pequeña pero real atribuida al embedding de tokens y la cabeza de salida compartidos. Este número caracteriza solo el caso inglés; el modelo es multilingüe.

| Rendimiento | Backend | RTF |
|---|---:|---:|
| Apple M4 Max | Metal | 65 |
| Apple M4 Max | CPU | 16,5 |
| Ryzen 4750U | Vulkan | 8 |
| Ryzen 4750U | CPU | 4,3 |

No se han publicado en la información disponible resultados de benchmarks multilingües (FLEURS, Common Voice, etc.) ni comparativas con otros modelos ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño de los pesos, Q4_K_M (654 MB) requiere aproximadamente 0,7-1 GB de memoria, Q8_0 (811 MB) alrededor de 1 GB y BF16 (1,46 GB) unos 1,5-2 GB incluyendo buffers del codificador de audio.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon) o Vulkan; no se documentan requisitos de CUDA ni modelos A100/H100, ya que transcribe.cpp prioriza backends portables.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 2 GB de memoria libre; también funciona en CPU sin GPU.
- Opciones de despliegue: transcribe.cpp (compilación desde fuente con CMake; binario `transcribe-cli`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para esta conversión GGUF; el ecosistema original Qwen3-ASR sí ofrece un framework de inferencia propio con vLLM, pero no para estos ficheros GGUF.
- Latencia y throughput: RTF de 65 en Metal sobre M4 Max, 16,5 en CPU sobre M4 Max, 8 en Vulkan sobre Ryzen 4750U y 4,3 en CPU sobre Ryzen 4750U. La model card original menciona que la variante 0.6B alcanza 2000 veces de throughput con concurrencia 128 en su framework nativo, dato no aplicable directamente a esta conversión.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | WER LibriSpeech test-clean | Notas |
|---|---|---:|---|---|---|---|
| Qwen3-ASR-0.6B (esta conversión) | 782 M | 30 + 22 dialectos zh | GGUF | Apache-2.0 | 2,11 % (BF16) | ASR offline, detección de idioma, sin timestamps ni traducción |
| Qwen3-ASR-1.7B | 1,7 B (aprox.) | 30 + 22 dialectos zh | safetensors (framework propio) | Apache-2.0 | No disponible | Variante mayor de la misma familia, SOTA entre ASR open source según la model card |
| Whisper (variantes open source de OpenAI) | Variable | ~99 idiomas | safetensors, GGUF, etc. | MIT | No disponible en esta información | Referencia de facto en ASR multilingüe; comparación directa no aportada |

No se dispone en la información proporcionada de resultados comparativos directos entre Qwen3-ASR-0.6B y Whisper u otros modelos ASR en los mismos benchmarks, por lo que la comparativa numérica queda limitada al dato de LibriSpeech test-clean de esta conversión.

## Limitaciones y advertencias

- Solo acepta WAV mono a 16 kHz; cualquier otro formato o frecuencia requiere conversión previa con ffmpeg.
- No admite pistas explícitas de idioma: la detección es automática, lo que puede fallar en audios muy cortos, con ruido o con mezcla de idiomas.
- No genera timestamps ni traducción; para alineación temporal hace falta Qwen3-ForcedAligner-0.6B u otra herramienta.
- No soporta streaming en esta conversión (`streaming: false`), pese a que el modelo base declara streaming/offline unificado en su framework nativo.
- Riesgo de alucinación en segmentos de silencio, ruido o audio musical, comportamiento habitual en modelos ASR; no cuantificado en la información disponible.
- Sesgos lingüísticos y acústicos no documentados; el WER publicado solo cubre inglés limpio (LibriSpeech test-clean), por lo que el rendimiento en español, árabe o dialectos chinos no está caracterizado en esta ficha.
- La cuantización Q4_K_M y Q5_K_M degradan ligeramente el WER (2,26 % y 2,21 % frente a 2,10-2,12 % en Q6_K/BF16); para máxima calidad conviene Q6_K o superior.
- Licencia Apache-2.0 heredada del modelo base, permisiva para uso comercial; conviene revisar la model card upstream para términos completos.
- Repositorio con 0 descargas y 0 likes: conversión reciente y sin validación comunitaria amplia; la validación numérica se limita a la comparación con la referencia `qwen_asr 0.0.6`.
- Dependencia de transcribe.cpp (compilación desde fuente) y de su commit de validación; no hay soporte documentado en llama.cpp, Ollama o vLLM para estos GGUF.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/mrsoundmind/Qwen3-ASR-0.6B-gguf
- Modelo base Qwen3-ASR-0.6B: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Commit upstream fijado: https://huggingface.co/Qwen/Qwen3-ASR-0.6B/commit/5eb144179a02acc5e5ba31e748d22b0cf3e303b0
- Repositorio transcribe.cpp: https://github.com/mrsoundmind/transcribe.cpp
- Paper referenciado (arXiv:2601.21337): https://arxiv.org/abs/2601.21337
- Descarga BF16: https://huggingface.co/mrsoundmind/Qwen3-ASR-0.6B-gguf/resolve/main/Qwen3-ASR-0.6B-BF16.gguf
- Descarga F16: https://huggingface.co/mrsoundmind/Qwen3-ASR-0.6B-gguf/resolve/main/Qwen3-ASR-0.6B-F16.gguf
- Descarga Q8_0: https://huggingface.co/mrsoundmind/Qwen3-ASR-0.6B-gguf/resolve/main/Qwen3-ASR-0.6B-Q8_0.gguf
- Descarga Q6_K: https://huggingface.co/mrsoundmind/Qwen3-ASR-0.6B-gguf/resolve/main/Qwen3-ASR-0.6B-Q6_K.gguf
- Descarga Q5_K_M: https://huggingface.co/mrsoundmind/Qwen3-ASR-0.6B-gguf/resolve/main/Qwen3-ASR-0.6B-Q5_K_M.gguf
- Descarga Q4_K_M: https://huggingface.co/mrsoundmind/Qwen3-ASR-0.6B-gguf/resolve/main/Qwen3-ASR-0.6B-Q4_K_M.gguf
