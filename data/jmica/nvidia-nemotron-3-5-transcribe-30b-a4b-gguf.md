# Jmica/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-GGUF

## Resumen

Nemotron 3.5 Transcribe 30B-A4B GGUF es una cuantización comunitaria, mantenida por el usuario Jmica, del modelo de reconocimiento automático de voz NVIDIA-Nemotron-3.5-Transcribe-30B-A4B publicado por NVIDIA en formato BF16. El modelo original es un sistema de transcripción de audio de gran tamaño basado en una arquitectura de mezcla de expertos (MoE) con unos 30.000 millones de parámetros totales, de los cuales aproximadamente 4.000 millones están activos por token (de ahí el sufijo A4B). Esta versión GGUF permite ejecutar el modelo localmente con runtimes basados en GGML, concretamente con audio.cpp, un runtime derivado de llama.cpp especializado en audio.

El problema que resuelve es doble: por un lado, llevar un modelo ASR de última generación a entornos locales y de consumo sin necesidad de GPUs de centro de datos; por otro, ofrecer tareas más allá de la transcripción pura, como traducción de audio, preguntas sobre el audio, identificación de idioma, marcas de tiempo por palabra y diarización de hablantes. El modelo soporta inglés y japonés.

Es relevante porque NVIDIA ha posicionado la familia Nemotron Transcribe como alternativa de alto rendimiento a Whisper en escenarios de transcripción profesional, y esta cuantización comunitaria la hace accesible a hardware mucho más modesto, aunque con requisitos de runtime específicos (no funciona con llama.cpp estándar ni NeMo-Speech.cpp de serie).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE de transcripción de voz (decoder + encoder de speech compartido con cabeza CTC F32) |
| Parámetros totales | ~30B (30B-A4B) |
| Parametros activos | ~4B (MoE) |
| Longitud de contexto | Procesador de audio configurado en clips de 30 segundos; límite de entrada del runtime no disponible |
| Tipos de cuantización | IQ4_NL, Q4_K_S, Q3_K_S, Q2_K (routed experts); lineales densas en Q8_0; encoder de speech en F16 con cabeza CTC F32 |
| Idiomas soportados | Inglés (en), japonés (ja) |
| Licencia | openmdw-1.1 (modelo base bajo licencia "other"; los GGUF heredan openmdw-1.1) |
| Formato de pesos | GGUF (decoder + sidecar mmproj del encoder, 1.670.410.080 bytes) |

## Arquitectura y entrenamiento

El modelo base es un sistema MoE con ~30.000 millones de parámetros totales y ~4.000 millones activos por token. Se compone de un decoder de lenguaje cuantizado y un encoder de speech compartido (publicado como sidecar `mmproj` con pesos F16 y cabeza de timestamps CTC en F32). Los tensores enrutados (bancos de expertos up/down) usan las cuantizaciones K o IQ4_NL, mientras que las lineales densas del decoder se conservan en Q8_0 y las incrustaciones, proyección de salida, routers, normas y parámetros recurrentes mantienen sus tipos en punto flotante original. La presencia de parámetros recurrentes sugiere componentes híbridos, aunque la model card no detalla la arquitectura interna completa.

Una particularidad técnica destacable de esta conversión: los bloques K requieren filas de entrada de 256 elementos, por lo que el convertidor añade columnas de ceros a los bancos de expertos (de 2.688 a 2.816 y de 1.856 a 2.048), insertando las activaciones de relleno correspondientes antes de esas multiplicaciones de matriz. Las dimensiones lógicas de salida, el enrutamiento y la normalización no cambian. Este relleno explica que Q4_K pese más (21,7 GB) que IQ4_NL sin relleno (20,4 GB). No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni etapas de RLHF/DPO del modelo base en la información proporcionada.

## Capacidades

- Transcripción automática de voz (ASR) offline en inglés y japonés.
- Traducción de audio mediante la opción `template_name=translation`.
- Preguntas y respuestas sobre contenido de audio (`audio_qa`).
- Identificación de idioma (`language_id`).
- Marcas de tiempo a nivel de palabra mediante cabeza CTC (`return_timestamps=true`).
- Diarización de hablantes con etiquetas de speaker (`diarization=true`).
- Ejecución local en GPU vía audio.cpp con backend CUDA.

## Casos de uso

- Transcripción de reuniones y podcasts en inglés o japonés: el modelo genera transcripciones offline con marcas de tiempo por palabra, útiles para subtitulado y documentación.
- Subtitulado con diarización: activando `diarization=true` se obtienen etiquetas de hablante, adecuado para transcribir entrevistas multi-participante.
- Traducción de audio: mediante la plantilla de traducción se puede transcribir y traducir contenido japonés o inglés sin un segundo modelo.
- Análisis de grabaciones mediante preguntas (`audio_qa`): se puede interrogar directamente sobre el contenido de un audio sin generar primero la transcripción completa.
- Clasificación automática de idioma en pipelines de audio multilingües: `language_id` permite enrutar grabaciones al flujo de procesamiento adecuado.
- Procesamiento por lotes de archivos largos: dividiendo la entrada en clips de 30 segundos gestionados por el llamador y desplazando las marcas de tiempo por el offset de cada clip.
- Transcripción en local sin enviar datos a la nube: al ejecutarse con audio.cpp en GPU propia, es adecuado para datos sensibles (legal, médico, interno de empresa).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card advierte explícitamente que las comprobaciones funcionales realizadas antes de la publicación no establecen la precisión multilingüe amplia del modelo cuantizado.

## Requisitos de hardware

- VRAM estimada para el decoder según cuantización (sin contar el encoder de 1,67 GB ni activaciones):
  - IQ4_NL: ~20,4 GB
  - Q4_K_S: ~21,7 GB
  - Q3_K_S: ~17,3 GB
  - Q2_K: ~13,9 GB
- Añadir aproximadamente 1,7 GB del encoder de speech F16, más la memoria de activación y KV correspondiente.
- GPU recomendadas: una RTX 4090 (24 GB) puede ejecutar Q2_K y probablemente Q3_K_S; para IQ4_NL y Q4_K_S se recomienda una RTX 5090 (32 GB), A100 40 GB o H100. No cabe en GPUs de 16 GB en ninguna cuantización publicada.
- Despliegue: exclusivamente vía audio.cpp en la revisión `78fb0160de54bed986508df1dbb11d299b82194d` o posterior, compilado con `AUDIOCPP_MODELS=nemotron_transcribe`. Los tres perfiles K requieren el adaptador de community models de audio.cpp; no cargan en llama.cpp ni NeMo-Speech.cpp de serie.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Idiomas | Formato | Licencia | Runtime |
|---|---|---|---|---|---|---|
| Nemotron 3.5 Transcribe 30B-A4B (GGUF, esta ficha) | ~30B | ~4B | en, ja | GGUF (IQ4_NL/Q4_K/Q3_K/Q2_K) | openmdw-1.1 | audio.cpp (revisión específica) |
| Whisper large-v3 | ~1,5B | 1,5B (denso) | ~99 | GGUF, PyTorch | MIT | llama.cpp, whisper.cpp, vLLM |
| Nemotron Transcribe (variante RNID/RNNT pequeña) | No disponible | No disponible | No disponible | No disponible | No disponible | NeMo-Speech.cpp |

La variante RNNT pequeña de Nemotron mencionada en la model card es un modelo independiente de menor tamaño, pero no se dispone de sus especificaciones en la información proporcionada. Frente a Whisper large-v3, este modelo ofrece muchos más parámetros totales (aunque solo ~4B activos), tareas adicionales (audio QA, traducción, diarización integrada) y menos idiomas (2 frente a ~99), con un ecosistema de runtime mucho más restrictivo.

## Limitaciones y advertencias

- Soporte de idiomas muy limitado: solo inglés y japonés; no es adecuado para otros idiomas.
- Los tres perfiles K (Q4_K_S, Q3_K_S, Q2_K) no cargan en llama.cpp estándar ni NeMo-Speech.cpp: requieren la revisión concreta de audio.cpp con soporte de perfiles K y el adaptador de community models.
- Es obligatorio descargar el sidecar del encoder (`mmproj-...-Encoder-F16.gguf`) junto al decoder; sin él el modelo no funciona.
- Los clips largos deben gestionarse manualmente en ventanas de ~30 segundos; los cortes pueden dividir palabras y las peticiones separadas no preservan la identidad de los hablantes entre clips.
- El tamaño máximo de entrada del runtime es un límite de capacidad, no una garantía de calidad de reconocimiento a esa longitud.
- Se trata de una cuantización comunitaria experimental: las verificaciones funcionales no acreditan precisión multilingüe amplia; la degradación por cuantización (especialmente en Q2_K) no está cuantificada.
- Riesgo de alucinación en transcripción: no disponible información específica, pero es un riesgo inherente a modelos ASR generativos.
- Sesgos conocidos: no disponible.
- Licencia: openmdw-1.1 para los GGUF; el modelo base NVIDIA está bajo licencia "other". Debe revisarse la licencia del modelo base antes de cualquier uso comercial, ya que las condiciones exactas no están detalladas en la información proporcionada.
- El README del repo aparece truncado ("full Met..."), por lo que podrían existir advertencias adicionales no visibles.

## Enlaces

- Modelo GGUF cuantizado: https://huggingface.co/Jmica/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-GGUF
- Modelo base BF16 de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- audio.cpp PR #1137 (soporte del modelo): https://github.com/0xShug0/audio.cpp/pull/1137
- Guía del modelo en audio.cpp: https://github.com/JarodMica/audio.cpp/blob/nemotron-transcribe-30b-a4b/docs/models/nemotron_transcribe.md
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
