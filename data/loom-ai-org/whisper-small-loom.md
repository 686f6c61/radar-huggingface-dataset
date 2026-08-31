# loom-ai-org/whisper-small-loom

## Resumen

El modelo `loom-ai-org/whisper-small-loom` es una exportación del sistema de reconocimiento de voz automático (ASR) `openai/whisper-small` al formato GGUF autocontenido de loom.cpp, un motor de inferencia de grafos dinámicos basado en ggml. Lo desarrolla Loom AI, que proporciona las herramientas loom-exporter, loom-py y loom.cpp para convertir, empaquetar y ejecutar modelos en este formato. El objetivo es facilitar el despliegue local y en dispositivos de borde de modelos de voz sin dependencias pesadas, manteniendo los pesos originales sin modificar.

El modelo original, Whisper Small, es un transformer encoder-decoder de 244 millones de parámetros entrenado por OpenAI sobre 680 000 horas de audio supervisado en múltiples idiomas. Esta exportación conserva exactamente los mismos pesos y capacidades, pero los empaqueta en un único archivo GGUF que incluye la topología del grafo, el tokenizador y un script de driver, lo que permite ejecutarlo con la API de alto nivel de loom-py. Soporta 99 idiomas, detección de idioma, transcripción con marcas de tiempo y traducción a inglés. Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

La relevancia actual de este modelo radica en que ofrece una vía ligera y portable para integrar ASR multilingüe en aplicaciones de producción, especialmente en entornos donde se prefiere evitar el ecosistema de PyTorch o donde se necesita una ejecución eficiente en CPU o GPU de gama media.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Small) |
| Parametros totales | 241 964 430 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventana de audio de 30 segundos (1500 frames de características mel) |
| Tipos de cuantizacion | no disponible (el archivo GGUF se distribuye sin cuantizacion declarada; el tamano del archivo sugiere FP32) |
| Idiomas soportados | 99 idiomas: en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (autocontenido, con grafo, tokenizador y driver) |

## Arquitectura y entrenamiento

El modelo es una conversión directa de `openai/whisper-small`, por lo que su arquitectura es la del Whisper original: un transformer encoder-decoder con 12 capas en el encoder y 12 en el decoder, con 6 cabezas de atención y dimensiones ocultas de 768. El encoder procesa espectrogramas mel de 80 canales a partir de ventanas de audio de 30 segundos, y el decoder genera el texto de salida de forma autorregresiva. No se ha modificado ningún peso durante la exportación.

Los detalles de entrenamiento del modelo original no se incluyen en la información de esta exportación. Se sabe que OpenAI entrenó Whisper sobre 680 000 horas de audio etiquetado, con un enfoque de aprendizaje supervisado a gran escala, pero no se proporcionan aquí los datos específicos de composición del dataset ni si se aplicaron técnicas como RLHF o DPO. La exportación a loom.cpp no altera el comportamiento del modelo, por lo que las capacidades de ASR, detección de idioma y traducción se mantienen íntegras.

## Capacidades

- Transcripción de audio a texto en 99 idiomas, con detección automática de idioma si no se especifica.
- Traducción de voz a texto en inglés mediante el parámetro `task="translate"`.
- Generación de marcas de tiempo por segmento (`timestamps=True`), útil para subtitulado y alineación.
- Manejo de audio largo: el driver de loom.cpp segmenta automáticamente el audio en ventanas de 30 segundos y realiza un seguimiento del cierre de segmento para evitar cortes en mitad de una frase.
- API de alto nivel `speech2text.infer` que simplifica la integración, con acceso al driver subyacente para ajustes finos.
- Ejecución en CPU y GPU mediante el motor loom.cpp, sin dependencias de PyTorch.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo puede procesar grabaciones largas segmentándolas automáticamente, con marcas de tiempo para localizar intervenciones. Su soporte multilingüe permite transcribir conversaciones en varios idiomas sin cambiar de modelo.
- Generación de subtítulos para vídeo: con `timestamps=True` se obtienen intervalos precisos por segmento, listos para integrar en herramientas de subtitulado (SRT, VTT). El tamaño reducido del modelo permite ejecutarlo en estaciones de trabajo sin GPU dedicada.
- Asistentes de voz locales: al ser un GGUF autocontenido, puede desplegarse en dispositivos de borde o en servidores con recursos limitados, ofreciendo reconocimiento de voz sin depender de servicios en la nube.
- Traducción de contenido hablado a inglés: el modo `task="translate"` convierte audio en cualquier idioma soportado a texto en inglés, útil para internacionalización de contenidos o análisis de llamadas.
- Archivado y búsqueda de audio: transcribir bibliotecas de audio o podcasts para indexar contenido y permitir búsqueda por texto. La ventana de 30 segundos y el manejo de audio largo facilitan el procesamiento por lotes.
- Sistemas de atención al cliente: integración en pipelines de transcripción de llamadas para análisis de sentimiento o generación de resúmenes, aprovechando la licencia Apache 2.0 para uso comercial sin coste de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta exportación en la informacion disponible. Al tratarse de una conversión de pesos sin modificar, el rendimiento es equivalente al de `openai/whisper-small`, cuyos resultados (WER en múltiples idiomas, precisión en traducción) están documentados en la publicación original de OpenAI. No se dispone de datos de latencia o throughput para esta implementación concreta.

## Requisitos de hardware

- El archivo GGUF pesa aproximadamente 970 MB, lo que sugiere pesos en FP32 (244M × 4 bytes ≈ 976 MB). En FP16 ocuparía unos 488 MB, aunque no se indica si se distribuye alguna versión cuantizada.
- Para inferencia en CPU, es viable en procesadores modernos con 8 GB de RAM o más, gracias al motor loom.cpp optimizado para ggml.
- En GPU, cabe en tarjetas consumer con 4 GB de VRAM o más (por ejemplo, GTX 1650, RTX 3050, RTX 4090). No se requieren GPUs de datacenter.
- Opciones de despliegue: loom-py (Python) y loom.cpp (C++). No se menciona compatibilidad con vLLM, Ollama o TGI, ya que el formato es específico de loom.
- La latencia dependerá del hardware; al ser un modelo de 244M parámetros, es esperable una transcripción en tiempo real o más rápida en GPU modernas, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| whisper-small-loom (este) | 244M | 30 s audio | 99 | Apache 2.0 | GGUF (loom) |
| openai/whisper-small | 244M | 30 s audio | 99 | Apache 2.0 | PyTorch, safetensors |
| openai/whisper-base | 74M | 30 s audio | 99 | Apache 2.0 | PyTorch, safetensors |
| openai/whisper-medium | 769M | 30 s audio | 99 | Apache 2.0 | PyTorch, safetensors |

La diferencia principal frente a los modelos originales de OpenAI es el formato de empaquetado y el motor de inferencia. `whisper-small-loom` ofrece la misma calidad de transcripción que `whisper-small` pero con un despliegue más ligero y sin dependencias de Python pesadas. Frente a `whisper-base`, tiene el doble de parámetros, lo que suele traducirse en menor WER, especialmente en idiomas con pocos datos. Frente a `whisper-medium`, es significativamente más pequeño y rápido, a costa de algo de precisión en tareas complejas.

## Limitaciones y advertencias

- Al ser una exportación sin modificar, hereda las limitaciones de Whisper Small: puede alucinar texto en segmentos de silencio o ruido de fondo, especialmente en idiomas poco representados.
- La ventana de audio fija de 30 segundos puede cortar frases largas si no se usa el mecanismo de seguimiento de segmento del driver, aunque loom.cpp lo gestiona automáticamente.
- No se proporcionan versiones cuantizadas (por ejemplo, Q4_K_M, Q8_0), por lo que el uso en dispositivos con muy poca memoria puede requerir conversión adicional por parte del usuario.
- El ecosistema loom es relativamente nuevo y menos extendido que llama.cpp u Ollama; la documentación y la comunidad son limitadas en comparación.
- La licencia Apache 2.0 permite uso comercial, pero el modelo original de Whisper tiene una licencia MIT; esta exportación usa Apache 2.0, lo que es compatible pero debe verificarse si se redistribuye el modelo.
- No se garantiza soporte para todos los idiomas con la misma calidad; los idiomas con menos horas de entrenamiento en Whisper pueden presentar tasas de error más altas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/loom-ai-org/whisper-small-loom
- Repositorio loom.cpp: https://github.com/loom-ai-org/loom.cpp
- Repositorio loom-py: https://github.com/loom-ai-org/loom-py
- Repositorio loom-exporter: https://github.com/loom-ai-org/loom-exporter
- Blog de OpenAI sobre Whisper: https://openai.com/index/whisper/
- Modelo original en Hugging Face: https://huggingface.co/openai/whisper-small
