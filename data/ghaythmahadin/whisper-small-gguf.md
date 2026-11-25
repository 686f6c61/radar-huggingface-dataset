# GhaythMahadin/whisper-small-gguf

## Resumen

whisper-small-gguf es una conversión al formato GGUF del modelo openai/whisper-small, publicada por GhaythMahadin para su uso con transcribe.cpp, una implementación en C/C++ del pipeline de Whisper. El modelo original es un transformer encoder-decoder de OpenAI para reconocimiento automático del habla (ASR) y traducción de voz, entrenado con 680.000 horas de audio etiquetado mediante supervisión débil. Esta conversión preserva las capacidades del original: transcripción multilingüe, detección de idioma y traducción de audio a texto en inglés.

La relevancia de esta ficha radica en el empaquetado: ofrece seis niveles de cuantización (de F32 a Q4_K_M) con un WER medido sobre LibriSpeech test-clean que se mantiene prácticamente estable entre 3,33 % y 3,40 %, lo que permite ejecutar el modelo en hardware modesto con una degradación mínima. El archivo Q4_K_M ocupa 164 MB frente a los 924 MB de F32, lo que lo hace viable en CPU y en GPUs de consumo.

El modelo tiene 241.751.392 parámetros y procesa audio en ventanas de 30 segundos con decodificación por trozos para audio largo. Soporta 99 idiomas según los metadatos, con detección automática de idioma y marcas de tiempo a nivel de segmento. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (sequence-to-sequence) |
| Parametros totales | 241.751.392 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas de audio de 30 segundos con decodificacion por trozos para audio largo |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 99 idiomas (en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (transcribe.cpp); el modelo base usa safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer encoder-decoder entrenado por OpenAI sobre 680.000 horas de audio etiquetado mediante supervisión débil a gran escala. Los modelos multilingües, como este whisper-small, se entrenaron conjuntamente para reconocimiento del habla (transcripción en el mismo idioma del audio) y traducción del habla (audio en cualquier idioma soportado a texto en inglés). La entrada se procesa en ventanas de 30 segundos; para audio más largo, transcribe.cpp aplica decodificación por trozos.

La conversión a GGUF se realizó desde el commit upstream 973afd2 de openai/whisper-small, fijado el 2026-04-25, y se validó contra la referencia de transformers en el commit 5.6.1 de transcribe.cpp el 2026-04-26. La decodificación por defecto de transcribe.cpp es greedy con suppress_tokens, temperature fallback y marcas de tiempo de segmento activadas. No se dispone de información sobre el proceso de cuantización más allá de los tipos publicados ni sobre ajuste fino adicional (RLHF/DPO) en esta conversión.

## Capacidades

- Transcripción automática del habla multilingüe en 99 idiomas.
- Detección automática del idioma del audio.
- Traducción del habla: audio en cualquier idioma soportado a texto en inglés.
- Generación de marcas de tiempo a nivel de segmento.
- Procesamiento de audio largo mediante decodificación por trozos sobre ventanas de 30 segundos.
- No soporta streaming según los metadatos del autor (`streaming: false`).
- No se han documentado capacidades de tool calling, agentes ni razonamiento multi-paso; es un modelo exclusivamente ASR.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo procesa audio largo mediante decodificación por trozos y genera marcas de tiempo por segmento, lo que facilita la alineación posterior con actas o subtítulos.
- Subtitulado automático de vídeo: las marcas de tiempo de segmento permiten generar ficheros de subtítulos sincronizados sin postprocesado complejo, y la cuantización Q8_0 (257 MB) mantiene un WER de 3,33 %.
- Traducción de contenido audiovisual a inglés: la tarea de traducción del habla convierte audio en cualquiera de los 99 idiomas soportados a texto en inglés, útil para catalogar material en otros idiomas.
- Despliegue en dispositivos de borde: el archivo Q4_K_M de 164 MB con WER de 3,40 % cabe en hardware con poca memoria y se ejecuta en CPU, lo que permite integrar transcripción en aplicaciones locales sin conexión.
- Transcripción en tiempo casi real en portátiles: con un RTF de 9,8 en CPU sobre un Ryzen 4750U y 3,4 en Vulkan, el modelo procesa audio varias veces más rápido que en tiempo real en hardware de consumo.
- Análisis de llamadas de atención al cliente: la detección de idioma y la transcripción multilingüe permiten procesar conversaciones en distintos idiomas y alimentar pipelines de análisis de texto.
- Accesibilidad: generación de transcripciones para personas con discapacidad auditiva en aplicaciones de escritorio, aprovechando la ejecución local en CPU sin dependencias de servicios en la nube.

## Benchmarks y rendimiento

WER sobre LibriSpeech test-clean completo (2620 enunciados) con la decodificación por defecto de transcribe.cpp:

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| F32 | 924 MB | 3,33 % |
| F16 | 470 MB | 3,34 % |
| Q8_0 | 257 MB | 3,33 % |
| Q6_K | 202 MB | 3,33 % |
| Q5_K_M | 185 MB | 3,37 % |
| Q4_K_M | 164 MB | 3,40 % |

El dato autodeclarado por OpenAI sobre el mismo conjunto es 3,432 %. La diferencia más probable se atribuye a que `model.generate()` de OpenAI usa por defecto `<|notimestamps|>`, mientras que el pipeline de transcribe.cpp ejecuta con marcas de tiempo activadas. Los números provienen de una única ejecución con backend Metal, cuyas reducciones paralelas no deterministas pueden desplazar el WER del corpus en torno a 0,1 puntos porcentuales entre ejecuciones.

Rendimiento (RTF, real-time factor):

| Hardware | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 99,2 |
| Apple M4 Max | CPU | 9,8 |
| AMD Ryzen 4750U | Vulkan | 12,1 |
| AMD Ryzen 4750U | CPU | 3,4 |

## Requisitos de hardware

- VRAM estimada: 164 MB (Q4_K_M) hasta 924 MB (F32) para los pesos; el consumo real añade el estado de activaciones y buffers de audio.
- Cabe en GPU de consumo: cualquier GPU con al menos 1 GB de memoria libre puede alojar la versión F32; las cuantizaciones Q8_0 y Q4_K_M caben en GPUs integradas.
- GPU recomendadas: no se especifican modelos concretos; los datos publicados cubren Apple M4 Max (Metal) y AMD Ryzen 4750U (Vulkan). No hay datos para A100, H100 o RTX 4090.
- Despliegue: transcribe.cpp (compilación con CMake, binario `transcribe-cli`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTF de 99,2 en Metal sobre M4 Max, 12,1 en Vulkan sobre Ryzen 4750U, 9,8 en CPU sobre M4 Max y 3,4 en CPU sobre Ryzen 4750U. Un RTF superior a 1 indica procesamiento más rápido que el tiempo real.
- Requiere audio de entrada en WAV mono a 16 kHz; el autor recomienda convertir con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---:|---|---|---|
| whisper-small-gguf (esta ficha) | 241,8 M | ventanas de 30 s con troceado | 99 | Apache-2.0 | GGUF |
| openai/whisper-small | 241,8 M | ventanas de 30 s con troceado | 99 | Apache-2.0 | safetensors |
| openai/whisper-base | 74 M | ventanas de 30 s con troceado | 99 | Apache-2.0 | safetensors |
| openai/whisper-medium | 769 M | ventanas de 30 s con troceado | 99 | Apache-2.0 | safetensors |

La comparación se limita a la familia Whisper, ya que no se dispone de datos de benchmarks de otras alternativas en la información proporcionada. Frente a whisper-base, esta conversión ofrece mayor precisión a costa de un tamaño mayor; frente a whisper-medium, es aproximadamente tres veces más pequeña y adecuada para hardware más limitado. La ventaja específica de esta ficha es la disponibilidad en GGUF con cuantizaciones verificadas y WER medido por cuantización, algo que el modelo base en safetensors no ofrece directamente para transcribe.cpp.

## Limitaciones y advertencias

- Riesgo de alucinación: el autor señala que las diferencias de WER entre ejecuciones se deben en gran medida a resultados de alucinación en clips cortos cerca del nivel de ruido.
- El WER se midió en una única ejecución con backend Metal; las reducciones paralelas no deterministas pueden variar el resultado en torno a 0,1 puntos porcentuales.
- No soporta streaming (`streaming: false`), lo que limita su uso en transcripción en vivo continua.
- Requiere audio en WAV mono a 16 kHz; no procesa directamente otros formatos o frecuencias de muestreo.
- No se han documentado sesgos específicos del modelo base en la información disponible, aunque al derivar de Whisper hereda los sesgos de sus datos de entrenamiento de 680.000 horas.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base upstream, que el autor identifica como fuente autoritativa.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de adopción comunitaria ni de validación independiente más allá de la del autor.
- No hay datos publicados sobre tool calling, agentes ni otras capacidades más allá de ASR y traducción del habla.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GhaythMahadin/whisper-small-gguf
- Modelo base: https://huggingface.co/openai/whisper-small
- Commit upstream del modelo base: https://huggingface.co/openai/whisper-small/commit/973afd2
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación transcribe.cpp 5.6.1: https://github.com/handy-computer/transcribe.cpp/tree/5.6.1
- Página del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/whisper-small.md
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Repositorio original de OpenAI Whisper: https://github.com/openai/whisper
