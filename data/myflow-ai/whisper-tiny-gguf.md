# myflow-ai/whisper-tiny-gguf

## Resumen

myflow-ai/whisper-tiny-gguf es una conversión a formato GGUF de openai/whisper-tiny, el modelo de reconocimiento automático de voz (ASR) más pequeño de la familia Whisper de OpenAI. Lo publica el usuario myflow-ai y está pensado para ejecutarse con transcribe.cpp, una implementación en C++ orientada a inferencia local y ligera. El repositorio ocupa 0,0 GB, no registra descargas ni likes, y los archivos GGUF enlazados en la model card apuntan al repositorio handy-computer/whisper-tiny-gguf.

El modelo resuelve transcripción multilingüe, detección de idioma y traducción de voz a texto en inglés. Es un transformer encoder-decoder (sequence-to-sequence) con 37.777.120 parámetros, entrenado por OpenAI sobre 680.000 horas de audio etiquetado mediante supervisión débil, según la model card original reproducida en el repositorio. Procesa audio en ventanas de 30 segundos y emplea decodificación por fragmentos (chunked) para audio largo.

Su relevancia actual está en el nicho de ASR ultraligero: las cuantizaciones disponibles van de 146 MB (F32) a 42 MB (Q4_K_M), lo que permite transcripción en CPU, GPU integrada o dispositivos de borde sin acelerador dedicado. La licencia Apache-2.0 heredada del modelo base facilita su integración en productos comerciales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (sequence-to-sequence) |
| Parametros totales | 37.777.120 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 30 segundos de audio por ventana; decodificación por fragmentos para audio largo |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 99 idiomas (entre ellos en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, ml, sk, te, fa, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

Datos adicionales declarados en la model card: streaming = false, translate = true, lang_detect = true, timestamps = segment.

## Arquitectura y entrenamiento

Whisper es un transformer encoder-decoder entrenado con 680.000 horas de datos de voz etiquetados mediante supervisión débil a gran escala, según la descripción del paper "Robust Speech Recognition via Large-Scale Weak Supervision" (Radford et al., OpenAI). Los modelos multilingües se entrenaron conjuntamente para reconocimiento de voz (transcripción en el mismo idioma del audio) y traducción de voz (audio en cualquier idioma soportado hacia texto en inglés). La conversión GGUF mantiene la arquitectura del modelo base y no introduce cambios de pesos; se limita a cuantizar y empaquetar los tensores.

La conversión se realizó a partir del commit 169d4a4 de openai/whisper-tiny, fijado el 2026-04-25, y se validó contra la referencia de transformers en el commit 5.6.1 de transcribe.cpp el 2026-04-26. La model card no detalla si hubo etapas de RLHF o DPO, ni la composición exacta del dataset más allá de las 680.000 horas. La innovación práctica de esta conversión es el soporte de cuantizaciones k-quant (Q6_K, Q5_K_M, Q4_K_M) con pérdida de precisión mínima en WER, y la decodificación de audio largo por fragmentos con marcas de tiempo a nivel de segmento.

## Capacidades

- Transcripción automática de voz multilingüe: convierte audio en texto en 99 idiomas.
- Detección automática de idioma del audio (lang_detect = true).
- Traducción de voz a texto en inglés desde cualquier idioma soportado (translate = true).
- Marcas de tiempo a nivel de segmento (timestamps = segment), no a nivel de palabra.
- Decodificación de audio largo mediante ventanas de 30 segundos con solapamiento por fragmentos.
- Inferencia en CPU y GPU sin necesidad de acelerador dedicado, gracias a los tamaños de 42-146 MB.
- No soporta streaming (streaming = false): requiere el audio completo o fragmentos ya cerrados.
- No dispone de tool calling, function calling ni capacidades de agente; es exclusivamente un modelo de ASR.
- No procesa visión ni audio en tiempo real continuo.

## Casos de uso

- Transcripción de reuniones y notas de voz en local: con 42 MB en Q4_K_M y un WER de 7,76 % en LibriSpeech test-clean, se puede integrar en aplicaciones de escritorio que transcriban audio sin enviar datos a la nube.
- Subtitulado automático de vídeo: las marcas de tiempo por segmento permiten generar ficheros de subtítulos por bloques; el audio se decodifica por fragmentos de 30 segundos, adecuado para contenido grabado de duración media o larga.
- Traducción de audio a inglés para contenidos internacionales: la función de traducción de voz convierte entrevistas o pódcast en cualquier idioma soportado a texto en inglés, útil para indexación y búsqueda.
- Preprocesado de pipelines de voz en dispositivos de borde: el tamaño mínimo de 42 MB cabe en memoria de dispositivos embebidos y permite transcribir sin conectividad.
- Detección de idioma previa en enrutadores de audio: lang_detect permite clasificar el idioma de un audio entrante y dirigirlo al modelo de ASR o de traducción correspondiente.
- Prototipado rápido de aplicaciones de ASR: sirve como referencia barata para validar una idea de producto antes de escalar a modelos Whisper de mayor tamaño.
- Generación de borradores de transcripción para corrección humana: por su precisión limitada, es adecuado en flujos donde una persona revisa la salida, con coste computacional muy bajo.
- Análisis de llamadas de atención al cliente por lotes: el consumo mínimo de recursos permite procesar grandes volúmenes de audio en paralelo sobre CPUs convencionales.

## Benchmarks y rendimiento

WER sobre la partición completa LibriSpeech test-clean (2.620 enunciados), medido con la decodificación por defecto de transcribe.cpp (greedy, suppress_tokens, temperature fallback, marcas de tiempo de segmento activadas):

| Cuantización | Tamano | WER (LibriSpeech test-clean) |
|---|---:|---:|
| F32 | 146 MB | 7,54 % |
| F16 | 76 MB | 7,49 % |
| Q8_0 | 44 MB | 7,53 % |
| Q6_K | 43 MB | 7,63 % |
| Q5_K_M | 42 MB | 7,63 % |
| Q4_K_M | 42 MB | 7,76 % |

OpenAI reporta 7,54 % para el mismo modelo en la misma partición. La model card señala que las cifras provienen de una única ejecución con backend Metal, cuyas reducciones paralelas no deterministas pueden desplazar el WER del corpus en torno a 0,1 puntos porcentuales entre ejecuciones, principalmente por alucinaciones en clips cortos cerca del nivel de ruido. También advierte de que la configuración de evaluación de OpenAI no es conocida con exactitud y que la discrepancia podría deberse a que `model.generate()` usa `<|notimestamps|>` por defecto, mientras que el pipeline de transcribe.cpp activa las marcas de tiempo.

Factor de tiempo real (RTF) reportado por transcribe.cpp:

| Hardware | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 302,1 |
| Apple M4 Max | CPU | 76,1 |
| AMD Ryzen 4750U | Vulkan | 61 |
| AMD Ryzen 4750U | CPU | 24,8 |

La model card no especifica las unidades de estos valores.

## Requisitos de hardware

- VRAM estimada: inferior a 0,5 GB en F32 (146 MB de pesos más buffers de activación) y en torno a 0,2 GB o menos en Q4_K_M (42 MB).
- Cabe en cualquier GPU de consumo, incluidas integradas, y también en CPU sin acelerador.
- GPU recomendadas: no requiere GPU dedicada; cualquier A100, H100, RTX 4090 o inferior es sobredimensionada para este modelo. La ejecución con backend Metal en Apple M4 Max y Vulkan en AMD Ryzen 4750U está reportada en la model card.
- Ejecución en CPU viable: el RTF reportado en un Ryzen 4750U por CPU es de 24,8, lo que indica margen sobrado para transcripción en tiempo real.
- Opciones de despliegue: transcribe.cpp mediante la herramienta `transcribe-cli`. El soporte en otros runtimes GGUF (llama.cpp, Ollama) no está confirmado en la información disponible.
- Preprocesado obligatorio: el audio debe convertirse a WAV mono a 16 kHz (por ejemplo, con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`).
- Latencia y throughput: no se publican cifras de latencia absoluta ni de throughput en tokens por segundo en la model card; solo los RTF de la tabla anterior.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | WER LibriSpeech test-clean | Disponibilidad |
|---|---|---|---|---|---|---|
| myflow-ai/whisper-tiny-gguf | 37,8 M | GGUF (F32 a Q4_K_M) | 30 s por ventana | Apache-2.0 | 7,49-7,76 % segun cuantizacion | HuggingFace |
| openai/whisper-tiny (modelo base) | 37,8 M | safetensors / PyTorch | 30 s por ventana | Apache-2.0 (segun esta model card) | 7,54 % (autoinformado) | HuggingFace y repositorio de OpenAI |
| Otros tamanos de Whisper (base, small, medium, large) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| Implementaciones alternativas de ASR (por ejemplo, wav2vec 2.0 o Conformer) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La información disponible solo permite comparar con el modelo base del que deriva esta conversión. No se han proporcionado datos de benchmarks ni especificaciones de otros modelos de la misma categoría para completar la comparativa.

## Limitaciones y advertencias

- Modelo de 37,8 millones de parámetros: es el tamaño más pequeño de la familia Whisper, por lo que su precisión en audio con ruido, acentos marcados, solapamiento de voces o vocabulario técnico es notablemente inferior a la de variantes mayores.
- WER de referencia de 7,54 % en LibriSpeech test-clean, un corpus de lectura limpia en inglés; el rendimiento en condiciones reales y en idiomas distintos del inglés es sustancialmente peor y no está cuantificado en la información disponible.
- Riesgo de alucinación en clips cortos o con nivel de ruido alto: la propia model card atribuye parte de la variación del WER entre ejecuciones a este fenómeno.
- Sin soporte de streaming: no puede transcribir audio en tiempo real conforme llega; requiere ventanas de 30 segundos o fragmentos cerrados.
- Marcas de tiempo únicamente a nivel de segmento, no a nivel de palabra; no apto para alineación forzada precisa ni para karaoke o subtitulado palabra a palabra.
- Riesgo de sesgos heredados de los datos de entrenamiento de OpenAI (680.000 horas de audio con supervisión débil), no auditados en esta conversión.
- Licencia Apache-2.0, que permite uso comercial, pero sujeta a los términos del modelo base; conviene revisar la model card de openai/whisper-tiny como fuente autoritativa.
- Los archivos GGUF enlazados en la model card apuntan al repositorio handy-computer/whisper-tiny-gguf, no al repositorio myflow-ai/whisper-tiny-gguf, y el repositorio declarado ocupa 0,0 GB: no está claro que los pesos estén alojados en el espacio del autor.
- Etiquetado como validado con transcribe.cpp 5.6.1; el formato GGUF de Whisper no es el estándar de llama.cpp, por lo que la compatibilidad con otros runtimes no está garantizada.
- Sin datos de adopción: 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/myflow-ai/whisper-tiny-gguf
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Commit del modelo base usado en la conversión: https://huggingface.co/openai/whisper-tiny/commit/169d4a4
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Versión de transcribe.cpp usada para la validación: https://github.com/handy-computer/transcribe.cpp/tree/5.6.1
- Página de transcribe.cpp para whisper-tiny: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/whisper-tiny.md
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Repositorio original de OpenAI Whisper: https://github.com/openai/whisper
- Archivos GGUF enlazados en la model card (repositorio handy-computer): https://huggingface.co/handy-computer/whisper-tiny-gguf
