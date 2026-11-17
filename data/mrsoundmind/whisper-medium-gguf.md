# mrsoundmind/whisper-medium-gguf

## Resumen

`mrsoundmind/whisper-medium-gguf` es una conversión a formato GGUF del modelo `openai/whisper-medium`, empaquetada para su uso con la librería transcribe.cpp. El modelo original es un transformer encoder-decoder de OpenAI para reconocimiento automático del habla (ASR) y traducción de voz, entrenado con 680.000 horas de audio etiquetado mediante supervisión débil. Esta conversión preserva los pesos del checkpoint original (763.874.400 parámetros) y los ofrece en seis niveles de cuantización, desde F32 hasta Q4_K_M, con tamaños que van de 2,85 GB a 481 MB.

La relevancia de esta ficha reside en que permite ejecutar un modelo ASR multilingüe de tamaño medio en hardware modesto, incluyendo CPU y GPUs de consumo, sin depender de frameworks pesados. El autor reporta un WER del 2,59-2,64 % en LibriSpeech test-clean para todas las cuantizaciones, lo que indica que la compresión a 4 bits no degrada la precisión de forma apreciable en esa prueba. El modelo soporta detección de idioma, marcas de tiempo a nivel de segmento y traducción de voz a inglés.

La conversión está validada contra la implementación de referencia en transformers (commit 5.6.1 de transcribe.cpp) y se distribuye bajo licencia Apache-2.0, heredada del modelo base. Es una opción práctica para pipelines de transcripción en producción donde el coste por hora de audio y la portabilidad del binario importan más que el estado del arte absoluto en ASR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (sequence-to-sequence) |
| Parametros totales | 763.874.400 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventanas de 30 segundos con decodificación por chunks para audio largo |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 99 idiomas, entre ellos en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (seis ficheros, uno por cuantización) |

## Arquitectura y entrenamiento

El modelo base es un transformer encoder-decoder con atención completa, entrenado por OpenAI sobre 680.000 horas de audio etiquetado mediante supervisión débil a gran escala. Los modelos multilingües, como este `medium`, se entrenaron conjuntamente en tareas de reconocimiento del habla (transcripción en el mismo idioma del audio) y traducción de voz (transcripción a otro idioma, típicamente inglés). El proceso de decodificación opera sobre ventanas de 30 segundos y, para audio más largo, emplea decodificación por chunks con marcas de tiempo a nivel de segmento.

La conversión a GGUF no modifica la arquitectura ni los pesos más allá de la cuantización. El autor indica que los ficheros se generaron a partir del commit `abdf7c3` del repositorio original (fijado el 2026-04-25) y se validaron contra la referencia de transformers en el commit 5.6.1 de transcribe.cpp el 2026-04-26. No se dispone de información sobre el dataset exacto de entrenamiento más allá de la cifra de 680.000 horas ni sobre si hubo etapas de RLHF o DPO, que la model card original no detalla en el fragmento reproducido.

## Capacidades

- Transcripción de voz a texto multilingüe en 99 idiomas, con detección automática del idioma del audio.
- Traducción de voz a texto en inglés desde cualquiera de los idiomas soportados.
- Marcas de tiempo a nivel de segmento (`timestamps: segment`), útiles para subtitulado y alineación.
- Decodificación de audio largo mediante ventanas de 30 segundos y chunking.
- Detección de idioma integrada (`lang_detect: true`).
- No soporta streaming (`streaming: false` según los metadatos del autor).
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso; es un modelo puramente ASR/traducción.

## Casos de uso

- Subtitulado automático de vídeo y audio: el modelo genera marcas de tiempo por segmento, lo que permite producir ficheros SRT o VTT directamente a partir de la salida de transcribe.cpp, con la ventaja de que la cuantización Q4_K_M ocupa solo 481 MB y puede ejecutarse en CPU.
- Transcripción de reuniones y notas de voz: con ventanas de 30 segundos y decodificación por chunks, puede procesar grabaciones largas en un portátil sin GPU, usando la variante Q5_K_M o Q4_K_M para equilibrar tamaño y precisión.
- Traducción de contenido audiovisual a inglés: la tarea de traducción de voz permite convertir entrevistas o podcasts en otros idiomas a texto en inglés, útil para equipos internacionales o para indexación de contenido.
- Pipeline de accesibilidad: generación de transcripciones para personas con discapacidad auditiva en aplicaciones web o móviles, con despliegue local mediante el binario `transcribe-cli` y sin dependencia de servicios en la nube.
- Procesamiento por lotes en servidores sin GPU: la relación RTF de 3 en CPU (Ryzen 4750U) y 1,1 con Vulkan indica que el modelo puede transcribir audio en tiempo real o más rápido en hardware de consumo, lo que lo hace apto para colas de trabajo en servidores modestos.
- Investigación en ASR multilingüe: al ser una conversión fiel del checkpoint de OpenAI validada contra transformers, sirve como referencia reproducible para comparar implementaciones o estudiar el efecto de la cuantización en el WER.

## Benchmarks y rendimiento

El autor publica el WER en LibriSpeech test-clean (2620 utterances) con la decodificación por defecto de transcribe.cpp (greedy, suppress_tokens, temperature fallback, timestamps de segmento activados):

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| F32 | 2,85 GB | 2,63 % |
| F16 | 1,44 GB | 2,63 % |
| Q8_0 | 793 MB | 2,64 % |
| Q6_K | 618 MB | 2,59 % |
| Q5_K_M | 556 MB | 2,62 % |
| Q4_K_M | 481 MB | 2,59 % |

El autor señala que OpenAI reporta un 2,90 % en la misma partición y atribuye la diferencia probablemente a que `model.generate()` usa por defecto `<|notimestamps|>` mientras que transcribe.cpp ejecuta con timestamps activados. Las cifras provienen de una única ejecución con backend Metal y pueden variar ~0,1 pp entre ejecuciones por reducciones paralelas no deterministas.

Rendimiento (RTF, menor es mejor):

| Hardware | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 41,6 |
| Apple M4 Max | CPU | 3 |
| Ryzen 4750U | Vulkan | 4,3 |
| Ryzen 4750U | CPU | 1,1 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; por tamaño de fichero, Q4_K_M requiere al menos ~0,5 GB de memoria y F32 ~2,85 GB, más overhead de runtime.
- GPU recomendadas: no se especifican modelos concretos; el autor reporta ejecución en Apple M4 Max con Metal y en Ryzen 4750U con Vulkan.
- Cabe en GPU de consumo: sí, cualquier cuantización cabe en GPUs con 4 GB o más de VRAM; las variantes Q4_K_M y Q5_K_M caben incluso en iGPUs y CPUs.
- Opciones de despliegue: transcribe.cpp (binario `transcribe-cli`), con backends Metal, Vulkan y CPU. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: RTF de 41,6 en M4 Max con Metal, 3 en M4 Max con CPU, 4,3 en Ryzen 4750U con Vulkan y 1,1 en Ryzen 4750U con CPU. Un RTF de 1,1 implica procesar audio aproximadamente a velocidad real; valores superiores indican procesamiento más rápido que tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---:|---|---|---|---|
| whisper-medium-gguf (esta ficha) | 763.874.400 | Ventanas de 30 s | 99 | Apache-2.0 | GGUF |
| openai/whisper-medium (original) | 763.874.400 | Ventanas de 30 s | 99 | Apache-2.0 | safetensors/bin |
| openai/whisper-small | no disponible en la información | Ventanas de 30 s | 99 | Apache-2.0 | safetensors/bin |
| openai/whisper-large-v3 | no disponible en la información | Ventanas de 30 s | 99 | Apache-2.0 | safetensors/bin |

La comparativa se limita a la familia Whisper porque la información proporcionada no incluye otros modelos ASR. La diferencia principal frente al original es el formato GGUF y la disponibilidad de cuantizaciones de 4 a 8 bits con WER prácticamente idéntico en LibriSpeech test-clean. Frente a `whisper-small` y `whisper-large-v3` no se dispone de parámetros ni resultados de benchmarks en la información disponible.

## Limitaciones y advertencias

- El WER de 2,59-2,64 % corresponde a LibriSpeech test-clean, un corpus de lectura en inglés relativamente limpio; el rendimiento en audio con ruido, acentos marcados o dominios específicos puede degradarse sustancialmente.
- El autor advierte de que Metal introduce reducciones paralelas no deterministas que pueden desplazar el WER ~0,1 pp entre ejecuciones, principalmente por hallucinations en clips cortos cerca del suelo de ruido.
- No soporta streaming (`streaming: false`), por lo que no es adecuado para transcripción en tiempo real por fragmentos continuos sin mecanismos externos de chunking.
- La decodificación opera en ventanas de 30 segundos; audio más largo requiere chunking, lo que puede introducir errores en las fronteras entre segmentos.
- No se documentan sesgos específicos en la información proporcionada; al ser un modelo entrenado con supervisión débil a gran escala, es probable que herede sesgos de los datos de entrenamiento, pero no se cuantifican.
- Riesgo de alucinación en segmentos de silencio o ruido, mencionado indirectamente por el autor al hablar de "short-clip hallucination outcomes".
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar la model card original de OpenAI para términos completos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-17; es una conversión reciente y poco validada por la comunidad.
- La librería transcribe.cpp es específica del autor; no hay evidencia de soporte en ecosistemas más amplios como llama.cpp u Ollama.

## Enlaces

- Hugging Face: https://huggingface.co/mrsoundmind/whisper-medium-gguf
- Modelo base: https://huggingface.co/openai/whisper-medium
- Commit del modelo base: https://huggingface.co/openai/whisper-medium/commit/abdf7c3
- Paper: https://arxiv.org/abs/2212.04356
- Repositorio original de OpenAI Whisper: https://github.com/openai/whisper
- Repositorio transcribe.cpp: https://github.com/mrsoundmind/transcribe.cpp
- Descarga F32: https://huggingface.co/mrsoundmind/whisper-medium-gguf/resolve/main/whisper-medium-F32.gguf
- Descarga F16: https://huggingface.co/mrsoundmind/whisper-medium-gguf/resolve/main/whisper-medium-F16.gguf
- Descarga Q8_0: https://huggingface.co/mrsoundmind/whisper-medium-gguf/resolve/main/whisper-medium-Q8_0.gguf
- Descarga Q6_K: https://huggingface.co/mrsoundmind/whisper-medium-gguf/resolve/main/whisper-medium-Q6_K.gguf
- Descarga Q5_K_M: https://huggingface.co/mrsoundmind/whisper-medium-gguf/resolve/main/whisper-medium-Q5_K_M.gguf
- Descarga Q4_K_M: https://huggingface.co/mrsoundmind/whisper-medium-gguf/resolve/main/whisper-medium-Q4_K_M.gguf
