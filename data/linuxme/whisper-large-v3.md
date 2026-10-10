# linuxme/whisper-large-v3

## Resumen

linuxme/whisper-large-v3 es una reproducción (mirror) en el Hub de Hugging Face del modelo Whisper large-v3 desarrollado originalmente por OpenAI, publicado aquí por el usuario `linuxme`. Se trata de un modelo de reconocimiento automático del habla (ASR) y traducción de voz, entrenado con más de 5 millones de horas de audio (1 millón débilmente etiquetado más 4 millones pseudo-etiquetado con large-v2), con una arquitectura transformer encoder-decoder de tipo secuencia a secuencia y 1.543.490.560 parámetros.

El modelo resuelve dos tareas principales: transcripción de voz a texto en el mismo idioma del audio y traducción de voz a texto en inglés, con detección automática de idioma, marcas de tiempo a nivel de frase y de palabra, y funcionamiento robusto en zero-shot sobre dominios no vistos. Respecto a large-v2, incorpora dos cambios de arquitectura: el espectrograma de entrada pasa de 80 a 128 bins Mel y se añade un token de idioma para cantonés.

Es relevante porque sigue siendo una de las referencias de facto para ASR multilingüe open source bajo licencia Apache 2.0, con soporte en 99 idiomas y una reducción de errores del 10 % al 20 % frente a large-v2 según la model card. No obstante, este repositorio concreto es un espejo de terceros con 0 descargas y 0 likes en el momento de la consulta, por lo que para uso en producción conviene recurrir al repositorio oficial `openai/whisper-large-v3`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (sequence-to-sequence) para audio, con entradas de espectrograma log-Mel de 128 bins |
| Parametros totales | 1.543.490.560 (dato real de safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No es una longitud de contexto de texto: ventana de audio de 30 segundos por segmento procesado y hasta 448 tokens nuevos en la salida |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; el repositorio declara pesos PyTorch, JAX/Flax y safetensors (precision completa) |
| Idiomas soportados | 99 idiomas declarados en los metadatos (en, es, zh, de, fr, it, pt, ru, ja, ko, ar, hi, ca, gl, eu, cy, haw, mi, sw, yo y otros; incluye token especifico para cantonés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, PyTorch (pytorch_model.bin) y JAX/Flax (tags: pytorch, jax, safetensors) |
| Tamano del repositorio | 24,7 GB |
| Pipeline declarado | automatic-speech-recognition |
| Idioma de la tarea de traduccion | Salida en ingles (task="translate") |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-decoder estándar aplicado a audio: el encoder consume espectrogramas log-Mel y el decoder genera texto de forma autorregresiva con tokens especiales que controlan la tarea (transcribir o traducir), el idioma y las marcas de tiempo. La diferencia con Whisper large y large-v2 es mínima: el front-end acústico emplea 128 bins Mel en lugar de 80, y se incorpora un token de idioma nuevo para cantonés. El modelo procesa audio en ventanas de 30 segundos, con decodificación por segmentos para audio de duración arbitraria.

El entrenamiento original de OpenAI se realizó sobre más de 5 millones de horas de audio: 1 millón de horas con etiquetado débil y 4 millones de horas pseudo-etiquetadas con Whisper large-v2, durante 2,0 épocas sobre esa mezcla. No se detalla en la información proporcionada si hubo fases de RLHF o DPO; la model card únicamente describe el procedimiento de supervisión débil y pseudo-etiquetado. No se documentan en el material disponible innovaciones de decodificación especulativa ni mecanismos de atención lineal.

## Capacidades

- Transcripción de voz a texto en el idioma de origen, con detección automática del idioma si no se especifica.
- Traducción de voz a texto en inglés mediante `task="translate"`.
- Marcas de tiempo a nivel de frase (`return_timestamps=True`) y a nivel de palabra (`return_timestamps="word"`).
- Decodificación con heurísticas configurables: temperatura con fallback, umbral de ratio de compresión zlib, umbral de log-probabilidad y umbral de ausencia de voz.
- Procesamiento por lotes de varios archivos de audio en una misma llamada al pipeline.
- Cobertura multilingüe amplia: 99 idiomas, incluidas lenguas con pocos recursos como maorí, hawaiano, galés, occitano o yidis.
- Robustez en zero-shot sobre dominios y datasets no vistos, según la model card.
- No soporta tool calling ni function calling: es un modelo generativo de audio a texto, no un modelo de lenguaje con interfaz de herramientas.
- No dispone de modo thinking, visión, audio de entrada salvo voz, ni razonamiento multi-paso orientado a agentes.
- No incluye diarización de hablantes nativa; requiere herramientas externas (por ejemplo, WhisperX o pyannote) para identificar quién habla.
- No genera código ni contenido textual libre: su salida está restringida a la transcripción o traducción del audio de entrada.

## Casos de uso

- Subtitulado y transcripción de reuniones: el modelo procesa audio de duración arbitraria por segmentos de 30 segundos y devuelve marcas de tiempo a nivel de palabra, lo que permite generar ficheros de subtítulos alineados listos para revisión humana.
- Traducción y localización de contenido audiovisual: con `task="translate"` se obtiene texto en inglés a partir de audio en cualquiera de los 99 idiomas soportados, útil como paso previo a doblaje o a traducción automática posterior.
- Analítica de contact centers: transcripción por lotes de llamadas para alimentar sistemas de búsqueda, clasificación de motivos de contacto o detección de palabras clave, aprovechando el procesamiento batch del pipeline.
- Accesibilidad en tiempo real: integración en aplicaciones de subtitulado en directo para personas con discapacidad auditiva, apoyándose en la ventana de 30 segundos y en el fallback de temperatura para audio ruidoso.
- Archivado y búsqueda de audio: indexación de podcasts, entrevistas y archivos de radio generando transcripciones con timestamps que permitan búsqueda full-text dentro del catálogo.
- Documentación clínica o legal por dictado: transcripción de notas de voz en consulta o de vistas orales, con la advertencia de que debe revisarse la normativa de protección de datos antes de enviar audio a un servicio externo.
- Generación de corpus ASR: pseudo-etiquetado de grandes volúmenes de audio para entrenar modelos más pequeños o específicos de dominio, replicando la estrategia que OpenAI aplicó con large-v2.
- Investigación lingüística y de fonética: transcripción de grabaciones de campo en lenguas minoritarias (maorí, hawaiano, galés, occitano) con marcas de tiempo para alineación y análisis.
- Verificación de cumplimiento y monitorización de calidad: transcripción de llamadas de soporte para auditar guiones, detectar promesas incumplidas o medir tiempos de respuesta verbal.
- Doblaje y postproducción: generación de transcripciones con timestamps por palabra para sincronizar subtítulos, animaciones o guiones de doblaje.

## Benchmarks y rendimiento

No se han publicado tablas de resultados de benchmarks en la informacion disponible. La model card únicamente afirma una mejora cualitativa y cuantitativa agregada:

| Metrica | Resultado |
|---|---|
| Reduccion de errores frente a whisper-large-v2 | 10 % a 20 % en una amplia variedad de idiomas (dato declarado en la model card) |
| Resultados concretos de MMLU, HumanEval, GSM8K | No aplica (modelo ASR, no modelo de lenguaje) |
| WER por dataset (LibriSpeech, Common Voice, FLEURS) | No disponible en la informacion proporcionada |

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del numero de parametros, no confirmada por el autor): en FP16 los pesos ocupan aproximadamente 3,1 GB y el total con activaciones y batch pequeno se situa en torno a 5-6 GB; en FP32 los pesos ocupan aproximadamente 6,2 GB y el total ronda 10-12 GB.
- Cuantizaciones de terceros (no incluidas en este repositorio): en INT8 los pesos quedarian en torno a 1,6 GB y en INT4 alrededor de 0,8 GB, aunque estos valores no estan confirmados en la informacion disponible.
- GPU recomendadas: A100, H100, L4, A10 para despliegue en servidor con lotes grandes; RTX 4090, RTX 4080, RTX 4070 o RTX 3060 de 12 GB para inferencia en local.
- Cabe en GPU de consumidor: si, en FP16 con batch 1 en GPUs de 8 GB o mas, y con mayor holgura en tarjetas de 12 GB o mas.
- Opciones de despliegue: Transformers (pipeline `automatic-speech-recognition`), faster-whisper sobre CTranslate2, whisper.cpp con pesos GGUF, WhisperX para diarizacion y alineacion, y vLLM para servir en produccion. El repositorio solo declara pesos safetensors, PyTorch y JAX, por lo que las versiones cuantizadas requieren conversion previa.
- Latencia y throughput estimados: no disponible en la informacion proporcionada. Dependen del backend, del uso de beam search, del tamano de lote y del hardware; el ratio de tiempo real solo puede determinarse mediante pruebas propias.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana de audio / contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| linuxme/whisper-large-v3 (este repositorio) | 1.543.490.560 | 30 s por segmento, 448 tokens de salida | 99 | apache-2.0 | Hugging Face, espejo de terceros con 0 descargas |
| openai/whisper-large-v3 (original) | No disponible en la informacion proporcionada | 30 s por segmento | 99 | apache-2.0 | Hugging Face, repositorio oficial |
| openai/whisper-large-v2 | No disponible en la informacion proporcionada | 30 s por segmento, 80 bins Mel | No disponible | apache-2.0 | Hugging Face; la model card indica errores entre un 10 % y un 20 % superiores a large-v3 |
| openai/whisper-large | No disponible en la informacion proporcionada | 30 s por segmento, 80 bins Mel | No disponible | apache-2.0 | Hugging Face |
| Modelos destilados de la familia Whisper (distil-whisper) | No disponible en la informacion proporcionada | No disponible | Subconjunto, centrado en ingles | No disponible | Hugging Face; no se detallan en la informacion proporcionada |

La model card no incluye comparativas formales frente a alternativas como Canary, SeamlessM4T o MMS, por lo que no se dispone de datos de rendimiento comparado.

## Limitaciones y advertencias

- Este repositorio es un espejo subido por un tercero (`linuxme`), no el repositorio oficial de OpenAI; no hay verificación publicada de que los pesos coincidan bit a bit con el original ni hashes de referencia en la informacion disponible.
- Riesgo de alucinacion: Whisper puede generar texto plausible en fragmentos de silencio, musica o ruido, por lo que se recomienda activar `no_speech_threshold`, `compression_ratio_threshold` y `logprob_threshold` en produccion.
- Sesgo de dominio: el entrenamiento con 5 millones de horas de datos web favorece el audio limpio, con habla estandar y bien grabada frente a audio telefónico, con acentos fuertes o con solapamiento de voces.
- Rendimiento desigual por idioma: la mejora del 10 %-20 % frente a large-v2 es agregada; en lenguas con pocos recursos el WER puede ser sustancialmente mayor que en ingles, espanol, frances o aleman.
- Ausencia de diarizacion nativa: para saber quien habla hay que añadir componentes externos.
- Limite de 30 segundos por ventana: audios mas largos requieren segmentacion, lo que puede degradar la coherencia en discursos continuos si no se usa `condition_on_prev_tokens`.
- La decodificacion con beam search o con varias temperaturas de fallback aumenta el coste computacional y la latencia de forma notable.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion, pero el usuario debe verificar la procedencia de los pesos de este espejo concreto antes de desplegarlo.
- Privacidad: el audio puede contener datos personales o sensibles; enviar audio a servicios externos exige revisar el cumplimiento del RGPD.
- Timestamps de creacion y actualizacion identicos (2026-10-09) y contadores de descargas y likes a cero, lo que indica un repositorio sin actividad ni validacion por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/linuxme/whisper-large-v3
- Repositorio oficial del modelo: https://huggingface.co/openai/whisper-large-v3
- Paper "Robust Speech Recognition via Large-Scale Weak Supervision": https://huggingface.co/papers/2212.04356
- Paper en arXiv: https://arxiv.org/abs/2212.04356
- Repositorio de codigo de OpenAI Whisper: https://github.com/openai/whisper
- Modelo predecesor: https://huggingface.co/openai/whisper-large-v2
- Modelo predecesor: https://huggingface.co/openai/whisper-large
- Hugging Face ASR Leaderboard: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard
- Muestras de audio de LibriSpeech usadas en el widget: https://cdn-media.huggingface.co/speech_samples/sample1.flac y https://cdn-media.huggingface.co/speech_samples/sample2.flac
- Dataset de ejemplo citado en la model card: https://huggingface.co/datasets/distil-whisper/librispeech_long
