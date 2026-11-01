# lipik/lang-id-voxlingua107-ecapa-gguf

## Resumen

`lipik/lang-id-voxlingua107-ecapa-gguf` es una conversión al formato GGUF del modelo `speechbrain/lang-id-voxlingua107-ecapa`, un clasificador de idioma hablado basado en la arquitectura ECAPA-TDNN y entrenado sobre el corpus VoxLingua107. No es un modelo generativo ni de transcripción: recibe audio de voz y devuelve una lista de etiquetas de idioma ordenadas por probabilidad, pudiendo restringirse a un conjunto de idiomas elegido por el llamador. Cubre 107 idiomas y trabaja con WAV mono a 16 kHz.

El modelo original lo desarrolló el equipo de SpeechBrain, y esta versión GGUF la publica el usuario `lipik` para su uso con el runtime `transcribe.cpp`, una implementación en C/C++ orientada a inferencia local y embebida. La conversión está anclada al commit `0253049` del modelo base (fijado el 2026-10-05) y validada numéricamente contra la referencia de SpeechBrain en el commit `aa4d0f47` de transcribe.cpp el 2026-10-08.

Su relevancia práctica está en el tamaño: con 21.244.679 parámetros, los pesos cuantizados ocupan entre 27 MB (Q8_0) y 85 MB (F32), lo que permite ejecutar identificación de idioma en CPU, en dispositivos móviles o en pipelines de preprocesado de audio sin GPU. La licencia Apache-2.0 heredada del modelo base facilita su integración comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ECAPA-TDNN (SpeechBrain) |
| Parametros totales | 21.244.679 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; puntúa hasta los últimos 30 s de audio de una entrada |
| Tipos de cuantizacion | F32, F16, Q8_0 |
| Idiomas soportados | 107 idiomas (ab, af, am, ar, as, az, ba, be, bg, bn, bo, br, bs, ca, ceb, cs, cy, da, de, el, en, eo, es, et, eu, fa, fi, fo, fr, gl, gn, gu, gv, ha, haw, hi, hr, ht, hu, hy, ia, id, is, it, iw, ja, jw, ka, kk, km, kn, ko, la, lb, ln, lo, lt, lv, mg, mi, mk, ml, mn, mr, ms, mt, my, ne, nl, nn, no, oc, pa, pl, ps, pt, ro, ru, sa, sco, sd, si, sk, sl, sn, so, sq, sr, su, sv, sw, ta, te, tg, th, tk, tl, tr, tt, uk, ur, uz, vi, war, yi, yo, zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (F32, F16, Q8_0) |

## Arquitectura y entrenamiento

El modelo emplea ECAPA-TDNN (Emphasized Channel Attention, Propagation and Aggregation Time-Delay Neural Network), una arquitectura concebida originalmente para verificación de hablante y adaptada aquí a identificación de idioma. Frente a la variante estándar de reconocimiento de hablante, incorpora más capas completamente conectadas después de la capa de embedding y se entrena con pérdida de entropía cruzada, lo que según los autores mejora la calidad de los embeddings extraídos para tareas posteriores. La entrada se normaliza a 16 kHz mono.

El entrenamiento se realizó sobre VoxLingua107, un corpus de voz recogido de vídeos de YouTube y publicado por la Universidad de Tallin, con cobertura de 107 idiomas. La model card original no detalla el número exacto de horas, la composición por idioma ni si hubo etapas de ajuste fino adicionales; esos datos no están disponibles en la información proporcionada. La conversión GGUF no altera el entrenamiento: solo cambia el formato y la precisión numérica de los pesos, y el autor reporta validación numérica contra la implementación de referencia de SpeechBrain.

## Capacidades

- Identificación de idioma hablado sobre 107 etiquetas, devolviendo candidatos ordenados por probabilidad.
- Restricción del espacio de búsqueda a un subconjunto de idiomas indicado por el llamador (`--allow en,de,fr`).
- Puntuación de hasta los últimos 30 segundos de un clip de audio.
- Entrada exclusiva en WAV mono a 16 kHz; el autor recomienda convertir previamente con ffmpeg si el audio no cumple ese formato.
- Integración mediante CLI (`transcribe-cli`) y mediante API en C con el rol `LANGID` (`include/transcribe/langid.h`).
- No soporta streaming (`streaming: false`), traducción (`translate: false`) ni marcas de tiempo (`timestamps: none`).
- No es un modelo de transcripción: no genera texto a partir del audio, solo etiquetas de idioma.

## Casos de uso

- Enrutamiento de llamadas en centros de atención al cliente: identificar el idioma del interlocutor en los primeros segundos para derivar la llamada al agente o al modelo de ASR adecuado, con un coste de cómputo mínimo en CPU.
- Preprocesado en pipelines de ASR multilingüe: seleccionar el modelo de reconocimiento de voz o el tokenizador correcto antes de transcribir, evitando cargar varios modelos simultáneamente.
- Moderación y analítica de contenido audiovisual: clasificar automáticamente grandes volúmenes de vídeo o pódcast por idioma para indexación, subtitulado o cumplimiento normativo.
- Filtrado previo en sistemas de traducción automática de voz: descartar o redirigir segmentos cuyo idioma no coincide con el esperado antes de invocar un modelo grande y costoso.
- Aplicaciones móviles y embebidas: con 27 MB en Q8_0 y ejecución en CPU, cabe en dispositivos con recursos limitados para seleccionar el idioma de la interfaz o del dictado sin conexión.
- Investigación lingüística y creación de corpus: etiquetado semiautomático de grabaciones de campo para construir o depurar datasets multilingües.
- Verificación de idioma en doblaje y localización: comprobar que una pista de audio corresponde al idioma declarado antes de publicarla.

## Benchmarks y rendimiento

| Metrica | F32 | F16 | Q8_0 |
|---|---:|---:|---:|
| Top-1 accuracy en FLEURS multilingual (3.000 enunciados) | 85,23 % | 85,17 % | 86,30 % |
| RTF en Apple M4 (CPU) | no disponible por cuantización | no disponible | 122,91 |
| RTF en Apple M4 (Metal) | no disponible por cuantización | no disponible | 1.319,2 |
| RTF en Ryzen 4750U (CPU) | no disponible por cuantización | no disponible | 42,16 |
| RTF en Ryzen 4750U (Vulkan) | no disponible por cuantización | no disponible | 101,7 |

La accuracy se midió en CPU sobre los primeros 5 segundos de cada clip, sin recorte de silencios, con precisión top-1 en espacio abierto sobre las 107 etiquetas y promediada sobre 15 idiomas de FLEURS. El valor de RTF (real-time factor) se expresa como múltiplo de la velocidad en tiempo real: 122,91 en CPU de M4 y 1.319,2 con Metal en el mismo equipo. La ligera ventaja de Q8_0 sobre F32 (86,30 % frente a 85,23 %) es un artefacto de la cuantización y no debe interpretarse como una mejora sistemática.

## Requisitos de hardware

- VRAM estimada: inferior a 100 MB en todas las cuantizaciones (27 MB en Q8_0, 45 MB en F16, 85 MB en F32); no requiere GPU.
- GPU recomendadas: ninguna imprescindible; se beneficia de Metal en Apple Silicon y de Vulkan en GPUs integradas o discretas AMD/Intel.
- Cabe en cualquier GPU de consumo e incluso en microcontroladores con suficiente memoria para el runtime.
- Opciones de despliegue: `transcribe.cpp` (CLI y API C). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo de texto.
- Latencia y throughput: RTF de 122,91 en CPU de Apple M4, 1.319,2 con Metal, 42,16 en CPU Ryzen 4750U y 101,7 con Vulkan en el mismo equipo. En la práctica, el procesamiento es entre uno y tres órdenes de magnitud más rápido que tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto de audio | Licencia | Formato |
|---|---:|---:|---|---|---|
| lipik/lang-id-voxlingua107-ecapa-gguf | 21,2 M | 107 | hasta 30 s | Apache-2.0 | GGUF |
| speechbrain/lang-id-voxlingua107-ecapa | 21,2 M | 107 | hasta 30 s | Apache-2.0 | PyTorch (SpeechBrain) |
| whisper-large-v3 (detección de idioma) | 1.550 M | ~99 | 30 s | MIT | safetensors, GGUF, etc. |
| MMS-LID-126 (Meta) | no disponible | 126 | no disponible | CC-BY-NC 4.0 | PyTorch |

Frente al modelo base de SpeechBrain, esta versión GGUF ofrece el mismo rendimiento con un runtime en C/C++ y pesos entre 27 y 85 MB, a cambio de perder el ecosistema Python de SpeechBrain. Frente a la detección de idioma integrada en Whisper, es dos órdenes de magnitud más pequeño y mucho más rápido, aunque no transcribe. Frente a MMS-LID-126, cubre menos idiomas y no se han publicado comparaciones directas en la información disponible; además, la licencia Apache-2.0 es más permisiva que la CC-BY-NC de MMS.

## Limitaciones y advertencias

- Sesgos: el rendimiento varía notablemente entre idiomas; la accuracy reportada del 85,23 % es una media sobre 15 idiomas de FLEURS y no representa el rendimiento en los 107. Idiomas con menos datos en VoxLingua107 probablemente rindan peor.
- Alucinación: al ser un clasificador, no genera texto, pero puede asignar con alta confianza un idioma incorrecto en clips cortos, con ruido, con música de fondo o con hablantes no nativos.
- Limitaciones de contexto: solo puntúa hasta los últimos 30 segundos del audio y no soporta streaming; para audio más largo hay que segmentar manualmente.
- Limitaciones de formato: requiere WAV mono a 16 kHz; el modelo no realiza la normalización de audio que hace la implementación de SpeechBrain, por lo que la conversión previa con ffmpeg es responsabilidad del usuario.
- Licencia: Apache-2.0 permite uso comercial, pero conviene revisar los términos del corpus VoxLingua107 y del modelo base en la model card original.
- Caveat de producción: el repo tiene un tamaño declarado de 0,0 GB y solo 10 descargas, lo que sugiere que la conversión es reciente y poco validada por la comunidad; conviene reproducir la validación numérica contra SpeechBrain antes de desplegarla.
- El modelo no traduce, no transcribe y no genera marcas de tiempo; no debe confundirse con un modelo de ASR.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lipik/lang-id-voxlingua107-ecapa-gguf
- Modelo base: https://huggingface.co/speechbrain/lang-id-voxlingua107-ecapa
- Commit del modelo base usado: https://huggingface.co/speechbrain/lang-id-voxlingua107-ecapa/commit/0253049
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación: https://github.com/handy-computer/transcribe.cpp/tree/aa4d0f47
- Página del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/lang-id-voxlingua107-ecapa.md
- Documentación de la API LANGID: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/langid.md
- Pesos F32: https://huggingface.co/handy-computer/lang-id-voxlingua107-ecapa-gguf/resolve/main/lang-id-voxlingua107-ecapa-F32.gguf
- Pesos F16: https://huggingface.co/handy-computer/lang-id-voxlingua107-ecapa-gguf/resolve/main/lang-id-voxlingua107-ecapa-F16.gguf
- Pesos Q8_0: https://huggingface.co/handy-computer/lang-id-voxlingua107-ecapa-gguf/resolve/main/lang-id-voxlingua107-ecapa-Q8_0.gguf
- Dataset VoxLingua107: https://cs.taltech.ee/staff/tanel.alumae/data/voxlingua107/
- Paper de referencia (arXiv:2106.04624): https://arxiv.org/abs/2106.04624
