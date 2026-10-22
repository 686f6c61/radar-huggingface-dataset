# Riyan200324200324/faster-whisper-large-v3

## Resumen

Este repositorio contiene la conversión a formato CTranslate2 del modelo `openai/whisper-large-v3`, el sistema de reconocimiento automático del habla (ASR) de OpenAI. No se trata de un modelo entrenado por el autor del repositorio, sino de un artefacto de despliegue: los pesos originales se han convertido con `ct2-transformers-converter` y se distribuyen en FP16 para poder cargarse directamente con la librería `faster-whisper` o con cualquier proyecto basado en CTranslate2, sin necesidad de PyTorch ni de los scripts de conversión.

Whisper large-v3 es un transformer encoder-decoder de aproximadamente 1550 millones de parámetros que trabaja sobre ventanas de audio de 30 segundos representadas como espectrogramas log-Mel de 128 canales. Soporta alrededor de 100 idiomas, transcribe y traduce a inglés, y realiza detección de idioma automática. La conversión a CTranslate2 es relevante porque reduce el coste de inferencia y memoria frente a la implementación de referencia, y permite cuantización a int8 en el momento de la carga.

El interés práctico de este repositorio concreto es limitado: es un reupload personal (0 descargas, 0 likes, creado y actualizado el mismo día) de una conversión que el proyecto `faster-whisper` ya publica oficialmente. Para producción se recomienda usar la conversión canónica de Systran, salvo que se valide explícitamente la integridad de esta copia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) con extractor de características log-Mel de 128 canales; 32 capas de encoder y 32 de decoder, dimensión 1280, 20 cabezas de atención (configuración de Whisper large-v3) |
| Parametros totales | ~1550 M (1,55 mil millones) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | Ventana de audio de 30 s por pasada (1500 frames Mel); el decoder genera hasta 448 tokens por ventana. No admite contexto de texto arbitrario más allá del prompt inicial |
| Tipos de cuantizacion | Pesos publicados en FP16. CTranslate2 permite cargar con `compute_type` = `float32`, `float16`, `int8`, `int8_float16`, `int8_float32` (cuantización en la carga, no incluida en el repo) |
| Idiomas soportados | 100 códigos ISO en la model card: en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su, yue |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (`model.bin`, `config.json`, `vocabulary.json`, tokenizer y preprocessor_config), FP16 |

Nota: los detalles de arquitectura (capas, dimensión, cabezas) provienen de la configuración pública de `openai/whisper-large-v3`; la model card de este repositorio solo documenta el comando de conversión y el formato de salida.

## Arquitectura y entrenamiento

Whisper large-v3 sigue la arquitectura seq2seq original de la familia Whisper: un encoder que procesa espectrogramas log-Mel de 128 canales calculados sobre ventanas de 30 segundos, y un decoder autorregresivo que emite tokens de texto condicionados por tokens especiales de tarea (`transcribe` o `translate`), idioma y timestamps. El modelo incorpora detección de idioma como una tarea más del decoder y entrena simultáneamente transcripción, traducción al inglés y predicción de marcas temporales, lo que le permite alinear segmentos sin un postprocesado acústico adicional.

Este repositorio no aporta entrenamiento propio: es una conversión de los pesos de OpenAI al formato CTranslate2 con `--quantization float16`, copiando `tokenizer.json` y `preprocessor_config.json`. La model card no documenta número de tokens de entrenamiento, composición del dataset, ni si hubo RLHF o ajuste por preferencias (Whisper se entrena con supervisión débil sobre audio-transcripción emparejados, pero ese detalle no aparece en la información disponible). La innovación técnica relevante aquí es de despliegue, no de modelado: CTranslate2 aplica optimizaciones de inferencia (fusión de operadores, gestión eficiente de caché KV, cuantización int8) sobre el grafo original.

## Capacidades

- Transcripción de voz a texto en 100 idiomas con detección automática de idioma.
- Traducción voz a texto al inglés (tarea `translate`), independientemente del idioma de origen.
- Marcas temporales a nivel de segmento y, con `word_timestamps=True` en faster-whisper, a nivel de palabra.
- Procesamiento por lotes de audio mediante `BatchedInferencePipeline` de faster-whisper, con throughput muy superior al modo secuencial.
- Filtro VAD opcional (Silero VAD) integrado en faster-whisper para descartar silencios y reducir alucinaciones en pasajes sin habla.
- Manejo de audio de cualquier duración: la librería segmenta internamente en ventanas de 30 s y encadena resultados.
- Entrada de audio en múltiples formatos (wav, mp3, flac, etc.) gracias a la decodificación previa con PyAV/ffmpeg en faster-whisper.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente ASR, sin interfaz de instrucciones.
- No soporta visión, audio-generación, diarización de hablantes ni puntuación/normalización configurable más allá de lo que produce el decoder.

## Casos de uso

- Subtitulado automático de vídeo: generar ficheros SRT/VTT con marcas temporales por segmento y por palabra; el modelo es adecuado porque emite timestamps nativos y funciona sobre audio de cualquier duración troceado en ventanas de 30 s.
- Transcripción de reuniones y actas: con `vad_filter=True` sobre audio de sala, se obtienen transcripciones en castellano listas para resumir con un LLM posterior; el contexto de 30 s por ventana es suficiente para conversación continua.
- Analítica de llamadas de atención al cliente: transcripción por lotes de miles de horas con `int8_float16` en GPUs modestas, para alimentar clasificadores de motivos de contacto o control de calidad.
- Generación de datos de entrenamiento ASR: pseudo-etiquetado masivo de audio no transcrito en cualquiera de los 100 idiomas soportados, aprovechando el throughput del modo batch.
- Indexación y búsqueda de archivos de audio/vídeo: transcripción a texto que después se indexa en un motor de búsqueda o en una base vectorial, permitiendo recuperación por contenido hablado.
- Traducción de contenido audiovisual: usar la tarea `translate` para obtener una transcripción en inglés de material en otros idiomas como paso previo a doblaje o subtitulado internacional.
- Accesibilidad: generación de transcripciones en directo o diferidas para vídeos corporativos, con la ventaja de la licencia MIT para uso comercial sin restricciones.
- Archivística y cumplimiento normativo: transcripción y conservación auditable de grabaciones (soporte, legal, sanitario) con despliegue on-premise sobre CTranslate2, sin enviar audio a terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio se limita al comando de conversión y a un ejemplo de uso; no incluye WER, comparativas con large-v2 ni métricas por idioma. Cualquier cifra de precisión debería tomarse de la model card de `openai/whisper-large-v3`, que no forma parte de la información proporcionada.

## Requisitos de hardware

- Pesos en FP16: ~3,1 GB (coincide con el tamaño del repo). Con caché KV, buffers de atención y beam search, reservar 4-6 GB de VRAM.
- Cuantización int8 (`compute_type="int8_float16"`): ~1,6 GB de pesos; cabe en GPUs de 4 GB como GTX 1650 o T4 en modo compartido.
- GPU recomendadas: T4, L4 y A10 para servicio en producción con buena relación coste/throughput; RTX 3060 12 GB, RTX 4070/4090 para desarrollo y lotes pequeños; A100/H100 solo si se procesa audio a gran escala en paralelo.
- Cabe en GPU de consumo: sí. Cualquier GPU con 6 GB o más ejecuta FP16 con comodidad; con int8 basta 4 GB.
- CPU: con `compute_type="int8"` es viable en servidores sin GPU, con un throughput mucho menor; reservar 2-3 GB de RAM por proceso.
- Opciones de despliegue: `faster-whisper` (nativo para este repo), WhisperX (usa faster-whisper por debajo para alineamiento y diarización), servidor de CTranslate2, y contenedores propios con FastAPI o similares. Para vLLM o Transformers haría falta el modelo original `openai/whisper-large-v3`, no estos pesos. `whisper.cpp` y Ollama requieren reconversión a GGUF/GGML, no son compatibles directamente con `model.bin`.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia cualitativa, el proyecto faster-whisper declara ser varias veces más rápido que la implementación de referencia de OpenAI con precisión equivalente, pero no se aportan cifras verificables aquí.

## Comparativa con modelos similares

| Modelo | Parametros | Capas decoder | Contexto de audio | Licencia | Formato CT2 disponible |
|---|---|---|---|---|---|
| Este repo (Whisper large-v3) | ~1550 M | 32 | 30 s | MIT | Sí (FP16) |
| Whisper large-v2 (CT2) | ~1550 M | 32 | 30 s | MIT | Sí |
| Whisper large-v3-turbo | ~809 M | 4 | 30 s | MIT | Sí |
| Distil-Whisper large-v3 | ~756 M | 2 | 30 s | MIT | Parcial (según conversión) |
| Whisper medium | ~769 M | 24 | 30 s | MIT | Sí |

Frente a large-v2, large-v3 añade idioma yue (cantonés) y mejora la robustez en idiomas de bajos recursos, a costa del mismo tamaño. Frente a las variantes destiladas y turbo, large-v3 es más lento pero habitualmente más preciso, especialmente en idiomas distintos del inglés y en audio con ruido. Los datos de los modelos alternativos proceden de sus model cards públicas y no forman parte de la información proporcionada para este repositorio; no se dispone de comparativas de WER verificables en este contexto.

## Limitaciones y advertencias

- Alucinaciones en silencios, música o ruido: Whisper puede generar texto plausible que no corresponde al audio. Mitigable con `vad_filter=True` y `condition_on_previous_text=False`, pero no eliminable.
- Sesgo hacia el inglés: el rendimiento cae de forma notable en idiomas con menos datos de entrenamiento dentro de los 100 soportados; en variedades dialectales del castellano o en audio con acento fuerte el WER puede degradarse sin que existan métricas publicadas aquí.
- Sin diarización: el modelo no distingue hablantes; hace falta un sistema externo (por ejemplo, pyannote) para obtener etiquetas de quién habla.
- Marcas temporales aproximadas: los timestamps a nivel de palabra son estimaciones por atención, no alineamientos forzados; para subtitulado profesional conviene pasar un alineador dedicado (WhisperX).
- Sin streaming nativo: la ventana fija de 30 s y el decoder autorregresivo implican latencia acumulada; no es adecuado para dictado en tiempo real estricto sin técnicas de chunking específicas.
- Repositorio no verificado: 0 descargas, 0 likes, creado y actualizado el 22 de octubre de 2026 en el mismo minuto. No hay verificación de integridad de los pesos ni historial del autor. Para producción, usar `Systran/faster-whisper-large-v3`, la conversión canónica del proyecto.
- Model card mínima: no documenta ni el proceso de validación ni diferencias respecto a la conversión oficial; la licencia MIT se hereda del modelo original de OpenAI, que permite uso comercial.
- Formato específico: no es cargable con `transformers`, `whisper.cpp` ni Ollama sin reconversión; el lock-in con CTranslate2 es total.
- Sin control de estilo: no se puede pedir puntuación, mayúsculas o formato concreto mediante instrucciones; la salida depende del decoder y del prompt inicial.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Riyan200324200324/faster-whisper-large-v3
- Modelo original: https://huggingface.co/openai/whisper-large-v3
- Conversión oficial de referencia: https://huggingface.co/Systran/faster-whisper-large-v3
- Repositorio de faster-whisper: https://github.com/SYSTRAN/faster-whisper
- CTranslate2: https://github.com/OpenNMT/CTranslate2
- Documentación de cuantización de CTranslate2: https://opennmt.net/CTranslate2/quantization.html
- Repositorio original de OpenAI Whisper: https://github.com/openai/whisper
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
