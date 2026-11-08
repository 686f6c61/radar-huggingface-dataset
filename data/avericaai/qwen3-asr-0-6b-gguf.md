# avericaai/Qwen3-ASR-0.6B-gguf

## Resumen

Qwen3-ASR-0.6B es un modelo de reconocimiento automático del habla (ASR) desarrollado por el equipo Qwen de Alibaba. Este repositorio concreto, publicado por el usuario `avericaai`, contiene conversiones a formato GGUF del modelo original para su uso con `transcribe.cpp`, un motor de inferencia en C++ orientado a despliegue local y eficiente. El modelo combina un codificador de audio bidireccional de 18 capas con un modelo de lenguaje causal Qwen3 de 28 capas mediante inyección de tokens de audio en la secuencia, sin atención cruzada.

El modelo resuelve el problema de la transcripción multilingüe offline: recibe audio WAV mono a 16 kHz y produce la transcripción en el idioma detectado automáticamente. Aunque la familia Qwen3-ASR declara soporte para 52 idiomas y dialectos, este repositorio documenta métricas para 30 idiomas. Su tamaño compacto (782 millones de parámetros reales según safetensors) y las cuantizaciones disponibles (desde 590 MB en Q4_K_M) lo hacen adecuado para entornos con recursos limitados.

La relevancia actual reside en la combinación de un modelo ASR multilingüe con un runtime nativo en C++ que permite ejecución en CPU, Metal y Vulkan sin dependencias de Python, lo que facilita su integración en aplicaciones de escritorio y sistemas embebidos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Codificador de audio bidireccional (18 capas) + LM causal Qwen3 (28 capas) con inyección de tokens de audio |
| Parámetros totales | 782.452.240 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 30 documentados en este repositorio (zh, en, yue, ar, de, fr, es, pt, id, it, ko, ru, th, vi, ja, tr, hi, ms, nl, sv, da, fi, pl, cs, fil, fa, el, ro, hu, mk); la familia declara 52 en total |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de Qwen3-ASR: un codificador de audio bidireccional de 18 capas procesa la señal de audio y genera tokens que se inyectan directamente en la secuencia de entrada de un modelo de lenguaje causal Qwen3 de 28 capas. No hay mecanismo de atención cruzada; en su lugar, se construye una secuencia fusionada de audio y texto. El modelo toma como entrada WAV mono a 16 kHz y produce la transcripción, detectando automáticamente el idioma del audio.

El modelo base fue entrenado por el equipo Qwen utilizando datos de habla a gran escala y la capacidad de comprensión de audio de su modelo fundacional Qwen3-Omni. No se dispone en la información proporcionada de detalles sobre el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal. La conversión a GGUF fue realizada por `avericaai` a partir del commit `5eb1441` del modelo original (fijado el 2026-04-19) y validada contra la referencia `qwen_asr 0.0.6` en el commit `3f61df7` de `transcribe.cpp` el 2026-04-20.

## Capacidades

- Transcripción de voz a texto offline para audio WAV mono a 16 kHz.
- Detección automática del idioma del audio (`lang_detect: true`) entre los 30 idiomas documentados.
- Salida de la transcripción en el mismo idioma detectado (no realiza traducción: `translate: false`).
- Procesamiento por lotes con tamaño de lote 1 (según la evaluación de WER).
- No soporta streaming (`streaming: false`).
- No genera marcas de tiempo (`timestamps: none`).
- Capacidades multilingües: 30 idiomas documentados, incluyendo chino, inglés, cantonés, árabe, alemán, francés, español, portugués, indonesio, italiano, coreano, ruso, tailandés, vietnamita, japonés, turco, hindi, malayo, neerlandés, sueco, danés, finés, polaco, checo, filipino, persa, griego, rumano, húngaro y macedonio.
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-paso, al tratarse de un modelo ASR.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo procesa audio mono a 16 kHz y genera la transcripción completa con detección automática del idioma, adecuado para actas y documentación de conversaciones en entornos sin conexión.
- Subtitulado offline de vídeo: integrado en un pipeline que extrae audio con `ffmpeg` (`-ar 16000 -ac 1`), el modelo produce el texto para generar subtítulos en 30 idiomas sin depender de servicios en la nube.
- Aplicaciones de escritorio con privacidad: al ejecutarse mediante `transcribe.cpp` en CPU, Metal o Vulkan, permite transcribir audio localmente sin enviar datos a servidores externos, relevante para sectores con requisitos de confidencialidad.
- Sistemas embebidos y de bajo consumo: la cuantización Q4_K_M (590 MB) y Q5_K_M (645 MB) permiten desplegar el modelo en dispositivos con recursos limitados manteniendo un WER en LibriSpeech test-clean del 2,26 % y 2,21 % respectivamente.
- Investigación en ASR multilingüe: sirve como referencia reproducible para evaluar el rendimiento en 30 idiomas con métricas WER y CER publicadas, y para comparar el impacto de la cuantización en la precisión.
- Procesamiento por lotes de archivos de audio: la CLI de `transcribe.cpp` permite automatizar la transcripción de colecciones de WAV mediante scripts, con detección de idioma por archivo.
- Transcripción de contenido en lenguas con escritura no latina: los valores CER documentados para japonés (8,61), coreano (5,82), tailandés (8,81), cantonés (7,91) y chino (7,57) indican viabilidad para estos idiomas.

## Benchmarks y rendimiento

WER en LibriSpeech test-clean (2.620 enunciados, lote de tamaño 1, sin marcas de tiempo, normalizador de texto inglés estilo Whisper, jiwer 3.x, Apple M4):

| Cuantización | WER LibriSpeech test-clean |
|---|---|
| BF16 | 2,12 % |
| F16 | 2,12 % |
| Q8_0 | 2,11 % |
| Q6_K | 2,11 % |
| Q5_K_M | 2,21 % |
| Q4_K_M | 2,26 % |

WER/CER en FLEURS con cuantización Q8_0:

| Idioma | Métrica | Valor |
|---|---|---|
| Árabe (ar) | WER | 24,51 |
| Checo (cs) | WER | 44,50 |
| Danés (da) | WER | 36,07 |
| Alemán (de) | WER | 6,80 |
| Griego (el) | WER | 49,12 |
| Inglés (en) | WER | 4,23 |
| Español (es) | WER | 4,88 |
| Persa (fa) | WER | 50,30 |
| Finés (fi) | WER | 46,49 |
| Filipino (fil) | WER | 35,43 |
| Francés (fr) | WER | 7,76 |
| Hindi (hi) | WER | 12,68 |
| Húngaro (hu) | WER | 56,24 |
| Indonesio (id) | WER | 8,49 |
| Italiano (it) | WER | 5,19 |
| Japonés (ja) | CER | 8,61 |
| Coreano (ko) | CER | 5,82 |
| Macedonio (mk) | WER | 35,09 |
| Malayo (ms) | WER | 17,18 |
| Neerlandés (nl) | WER | 13,90 |
| Polaco (pl) | WER | 25,06 |
| Portugués (pt) | WER | 6,57 |
| Rumano (ro) | WER | 40,65 |
| Ruso (ru) | WER | 10,30 |
| Sueco (sv) | WER | 35,72 |
| Tailandés (th) | CER | 8,81 |
| Turco (tr) | WER | 16,74 |
| Vietnamita (vi) | WER | 9,32 |
| Cantonés (yue) | CER | 7,91 |
| Chino (zh) | CER | 7,57 |

Factor de tiempo real (RTF) con cuantización Q8_0:

| Plataforma | Backend | RTF |
|---|---|---|
| Apple M4 Max | CPU | 18,66 |
| Apple M4 Max | Metal | 69,26 |
| AMD Ryzen 4750U | CPU | 5,29 |
| AMD Ryzen 4750U | Vulkan | 9,71 |

No se han publicado resultados de benchmarks comparativos con otros modelos ASR en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 782 millones de parámetros, las cuantizaciones van desde 590 MB (Q4_K_M) hasta 1,58 GB (F16). La inferencia puede ejecutarse en CPU sin GPU dedicada.
- GPU recomendadas: no se especifican modelos concretos; el runtime `transcribe.cpp` soporta backends Metal (Apple Silicon) y Vulkan (GPU AMD/Intel/NVIDIA compatibles).
- Cabe en GPU consumer: sí, cualquier GPU con al menos 2 GB de memoria libre puede alojar las cuantizaciones más grandes; las cuantizaciones Q4_K_M y Q5_K_M caben en menos de 1 GB.
- Opciones de despliegue: `transcribe.cpp` (CLI `transcribe-cli`), compilado con CMake. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este repositorio.
- Latencia y throughput: el RTF medido con Q8_0 es de 18,66 en CPU de Apple M4 Max, 69,26 con Metal en el mismo equipo, 5,29 en CPU de AMD Ryzen 4750U y 9,71 con Vulkan en el mismo procesador. Un RTF superior a 1 indica procesamiento más rápido que el tiempo real.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Formato | Licencia | WER LibriSpeech test-clean |
|---|---|---|---|---|---|
| Qwen3-ASR-0.6B (este repo, GGUF) | 782 M | 30 documentados (52 en la familia) | GGUF | Apache-2.0 | 2,11 % (Q8_0) |
| Qwen3-ASR-0.6B (original, Hugging Face) | 0,6 B (nominal) | 52 | Safetensors | Apache-2.0 | No disponible en la información |
| Qwen3-ASR-0.6B-GGUF (42ailab) | 0,8 B | No disponible | GGUF | No disponible | No disponible en la información |

No se dispone de datos de benchmarks de modelos ASR alternativos (Whisper, etc.) en la información proporcionada para establecer una comparación cuantitativa adicional.

## Limitaciones y advertencias

- Solo acepta audio WAV mono a 16 kHz; es necesario convertir otros formatos con `ffmpeg` antes de la inferencia.
- No soporta streaming: el procesamiento es offline por archivo completo.
- No genera marcas de tiempo, lo que limita su uso en subtitulado sincronizado.
- No realiza traducción: la salida está en el idioma detectado en el audio.
- El rendimiento es muy desigual entre idiomas: los WER en FLEURS superan el 40 % en húngaro (56,24), persa (50,30), griego (49,12), finés (46,49), checo (44,50) y rumano (40,65), lo que desaconseja su uso en producción para esos idiomas sin evaluación adicional.
- Las cuantizaciones Q5_K_M y Q4_K_M muestran una regresión real en WER (2,21 % y 2,26 % frente a 2,11 % en Q8_0) atribuida a los embeddings de tokens y la cabeza de salida compartidos.
- Riesgo de alucinación: no documentado en la información disponible, pero inherente a los modelos generativos; se recomienda validación en dominios específicos.
- Sesgos conocidos: no documentados en la información disponible.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe conservar el aviso de licencia y el archivo NOTICE que documenta la derivación del modelo original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-08; se trata de una conversión reciente sin validación comunitaria extensa.
- La model card indica que las cifras de WER sin commit fueron publicadas antes de que se registrara la procedencia, lo que reduce su trazabilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/avericaai/Qwen3-ASR-0.6B-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Commit del modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B/commit/5eb1441
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/3f61df7
- Página del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/qwen3-asr-0.6b.md
- Conversión GGUF alternativa (42ailab): https://huggingface.co/42ailab/Qwen3-ASR-0.6B-GGUF
- Paper (arXiv:2601.21337): https://arxiv.org/abs/2601.21337
