# nokkela-ai/whisper-large-v3

## Resumen

Whisper large-v3 es un modelo de reconocimiento automático del habla (ASR) y traducción de voz, publicado originalmente por OpenAI y distribuido en este repositorio por el usuario `nokkela-ai`. Se trata de una arquitectura transformer encoder-decoder entrenada con más de 5 millones de horas de audio, lo que le permite generalizar en zero-shot a dominios y conjuntos de datos muy diversos sin ajuste fino. Este repositorio replica el checkpoint oficial `openai/whisper-large-v3` bajo licencia Apache 2.0.

La relevancia del modelo radica en su cobertura multilingüe (más de 90 idiomas declarados) y en su capacidad de transcribir y traducir audio a inglés con marcas de tiempo a nivel de frase y de palabra. Frente a large-v2, incorpora dos cambios técnicos: el espectrograma de entrada usa 128 bins Mel en lugar de 80, y se añade un token de idioma específico para cantonés. Según la model card, esto se traduce en una reducción de errores del 10 % al 20 % en una amplia variedad de idiomas.

El checkpoint tiene 1.543.490.560 parámetros y un tamaño de repositorio de 24,7 GB, lo que refleja que incluye pesos en varios formatos (PyTorch, JAX y safetensors). Es un modelo de referencia para pipelines de transcripción en producción, aunque su tamaño lo sitúa en la gama alta de requisitos de hardware para inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) para audio |
| Parametros totales | 1.543.490.560 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento, con chunking para audio largo) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | más de 90 (en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, PyTorch (pytorch), JAX (jax) |

## Arquitectura y entrenamiento

Whisper large-v3 mantiene la arquitectura encoder-decoder de las versiones large y large-v2. El encoder procesa espectrogramas log-Mel y el decoder genera tokens de texto de forma autorregresiva, con tokens especiales para idioma, tarea (transcripción o traducción) y marcas de tiempo. La diferencia respecto a large-v2 es que la entrada usa 128 bins Mel en lugar de 80, y se añade un token de idioma para cantonés.

El entrenamiento se realizó sobre 1 millón de horas de audio débilmente etiquetado y 4 millones de horas de audio pseudo-etiquetado generado con Whisper large-v2, durante 2,0 épocas sobre esa mezcla. La model card no detalla si hubo RLHF o DPO; el enfoque es de supervisión débil a gran escala. La innovación principal es la robustez zero-shot derivada de esa escala de datos, junto con heurísticas de decodificación soportadas en Transformers: temperature fallback, condition on previous tokens, umbral de compresión zlib, umbral de log-probabilidad y umbral de no-habla.

## Capacidades

- Transcripción automática de voz a texto en más de 90 idiomas.
- Traducción de voz a texto en inglés (tarea `translate`).
- Detección automática del idioma de origen, o especificación manual del mismo.
- Marcas de tiempo a nivel de frase y a nivel de palabra (`return_timestamps`).
- Procesamiento de audio de longitud arbitraria mediante chunking en el pipeline de Transformers.
- Decodificación con estrategias configurables: beams, temperature fallback, umbrales de compresión y de no-habla.
- Inferencia en batch para múltiples archivos de audio.
- No soporta tool calling, function calling ni razonamiento multi-step: es un modelo ASR, no un LLM generativo de propósito general.
- No dispone de modo thinking, visión ni audio de salida.

## Casos de uso

- Subtitulado automático de vídeo: el modelo genera marcas de tiempo a nivel de frase y de palabra, lo que permite producir archivos SRT o VTT listos para plataformas de vídeo sin post-proceso manual intensivo.
- Transcripción de reuniones y actas: con audio de longitud arbitraria gestionado por chunking, se puede procesar una reunión completa y obtener texto con timestamps para atribuir intervenciones.
- Traducción de contenido audiovisual a inglés: la tarea `translate` convierte directamente audio en inglés escrito, útil para catalogar material en otros idiomas.
- Atención al cliente y análisis de llamadas: transcripción batch de grabaciones para búsqueda, cumplimiento normativo y análisis de calidad, con detección automática de idioma en entornos multilingües.
- Accesibilidad: generación de transcripciones para personas con discapacidad auditiva en vídeos, pódcasts y clases, aprovechando la cobertura de más de 90 idiomas.
- Investigación lingüística y creación de corpus: transcripción de grabaciones de campo en idiomas de bajos recursos incluidos en la lista de idiomas soportados, con la cautela de validar la calidad por idioma.
- Indexación y búsqueda de archivos de audio: conversión de archivos históricos a texto para motores de búsqueda internos, usando inferencia batch sobre GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica una reducción del 10 % al 20 % de errores frente a Whisper large-v2 en una amplia variedad de idiomas, sin cifras concretas por conjunto de datos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 1.543 millones de parámetros, en fp16 el peso ronda los 3 GB y en fp32 unos 6 GB, a lo que hay que sumar memoria para activaciones y audio.
- GPU recomendadas: no especificadas en la informacion proporcionada; por tamaño, una GPU con al menos 8-10 GB de VRAM es un punto de partida razonable en fp16.
- Cabe en GPU de consumo: previsiblemente sí en modelos con 8 GB o más en fp16, aunque el dato no está confirmado en la información disponible.
- Opciones de despliegue: pipeline `automatic-speech-recognition` de Hugging Face Transformers, con soporte de `accelerate` y `datasets[audio]`. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nokkela-ai/whisper-large-v3 | 1.543.490.560 | no disponible (ventana de 30 s por segmento) | más de 90 | apache-2.0 | Hugging Face |
| openai/whisper-large-v2 | no disponible en esta ficha | no disponible | más de 90 | apache-2.0 | Hugging Face |
| openai/whisper-large | no disponible en esta ficha | no disponible | más de 90 | apache-2.0 | Hugging Face |

La comparación se limita a las versiones previas de la misma familia, ya que la información proporcionada no incluye datos de otros modelos ASR. Según la model card, large-v3 reduce errores entre un 10 % y un 20 % frente a large-v2, y añade el token de cantonés y los 128 bins Mel.

## Limitaciones y advertencias

- Es un modelo ASR, no un LLM: no soporta tool calling, agentes ni razonamiento multi-step.
- Riesgo de alucinación en audio con ruido, silencios largos o música; las heurísticas de `no_speech_threshold` y `compression_ratio_threshold` mitigan pero no eliminan este problema.
- La calidad varía notablemente entre idiomas; los idiomas con menos datos en el entrenamiento pueden presentar tasas de error superiores.
- El rendimiento depende de la calidad del audio y del dominio; la model card no aporta métricas por dominio.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del checkpoint original de OpenAI y citar el paper.
- El repositorio tiene 24,7 GB, lo que implica costes de almacenamiento y descarga considerables.
- No se detallan sesgos específicos en la información proporcionada.
- La fecha de creación del repositorio (2026-11-21) y el hecho de que sea una réplica de un checkpoint de OpenAI aconsejan verificar la integridad de los pesos antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/nokkela-ai/whisper-large-v3
- Paper: https://huggingface.co/papers/2212.04356
- Checkpoint original de referencia: https://huggingface.co/openai/whisper-large-v3
- Versión previa: https://huggingface.co/openai/whisper-large-v2
- Versión large: https://huggingface.co/openai/whisper-large
