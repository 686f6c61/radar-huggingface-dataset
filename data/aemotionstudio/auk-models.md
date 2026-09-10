# AEmotionStudio/auk-models

## Resumen

AuK es un modelo de generación y edición de audio desarrollado originalmente por Tencent (AuK, © 2026) y redistribuido por AEmotionStudio en el repositorio `AEmotionStudio/auk-models` como espejo ("mirror") para el downloader de MAESTRO. El repositorio no modifica ningún peso: los ficheros son byte-idénticos al upstream `tencent/AuK`, pero se reorganizan en "lanes" por variante. La lane publicada es `base/`, con el checkpoint `auk_base.safetensors` (un Diffusion Transformer de 1,5305B parámetros en fp32), un VAE BigVGAN-flow a 24 kHz y un `config.yaml`.

El problema que resuelve es la síntesis de voz y el procesado de audio (text-to-speech, speech-editing, speech-enhancement y audio-to-audio), con salida monofónica a 24 kHz y latentes de dimensión 64 con un downsample de 480 (50 fps latentes). Su relevancia práctica es doble: por un lado es un DiT de audio relativamente compacto (1,53B) que cabe en GPUs de consumo; por otro, su dependencia de un encoder externo condiciona por completo el uso comercial, como se detalla más abajo.

El punto crítico es que AuK **no funciona por sí solo**: el checkpoint no contiene ningún tensor `text_encoder.*`. Necesita en tiempo de ejecución un snapshot de `Qwen/Qwen2.5-Omni-3B`, que no se incluye en el espejo y que está bajo Qwen Research License (solo fines no comerciales). El `config.yaml` fija `text_hidden_dim: 2048` al tamaño oculto del "thinker" de 3B, y la cabeza de fusión de capas de AuK es un vector de dimensión `[36]`, exactamente un peso por cada `text_config.num_hidden_layers`. En la práctica, esto convierte a AuK en un modelo no comercial pese a que sus propios pesos sean MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) para generación de audio + VAE BigVGAN-flow (24 kHz); encoder de texto externo Qwen2.5-Omni-3B |
| Parámetros totales | 1,5305B (DiT). El encoder de texto requerido (Qwen2.5-Omni-3B) se descarga aparte y no forma parte del repositorio |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | fp32 (formato publicado); bf16 medido y establecido como opción por defecto en MAESTRO. No se documentan GGUF, int8 ni otros formatos |
| Idiomas soportados | No disponible |
| Licencia | MIT para el código y los pesos de AuK (© 2026 Tencent); el encoder Qwen2.5-Omni-3B está bajo Qwen Research License (solo uso no comercial / investigación y evaluación) |
| Formato de pesos | safetensors (`auk_base.safetensors`, `vae.safetensors`) + `config.yaml`; lane `base/` de 6,76 GB en total |
| Tamaño del repositorio | 6,8 GB |
| Frecuencia de muestreo de salida | 24 kHz mono; latente de dimensión 64, downsample 480 (50 fps latentes) |
| Librería | `maestro` |

## Arquitectura y entrenamiento

La información disponible no describe el proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO ni etapas de post-entrenamiento). Lo que sí está documentado es la arquitectura de inferencia: un Diffusion Transformer de 1.5305B parámetros que opera sobre latentes de audio de dimensión 64 y un VAE BigVGAN-flow que decodifica esos latentes a audio monofónico de 24 kHz. El factor de downsample es 480, lo que equivale a 50 fotogramas latentes por segundo. La lane `base/` empaqueta el DiT en fp32 junto al VAE y su configuración.

La innovación técnica relevante no está en el bloque generativo, sino en su acoplamiento a un encoder de lenguaje multimodal externo. AuK consume representaciones de `Qwen2.5-Omni-3B` a través de una cabeza de fusión de capas de dimensión 36, dimensionada explícitamente para las 36 capas ocultas del thinker de 3B (`text_hidden_dim: 2048`). Esta decisión de diseño es la que impide sustituir el encoder por alternativas permisivas: el Qwen2.5-Omni-7B, con Apache 2.0, tiene una dimensión oculta de 3584 y no es intercambiable, y el propio upstream declara que Qwen3-Omni no está soportado. Según las mediciones del autor sobre este checkpoint, la versión en bf16 se desvía 1,59 dB de log-mel respecto a fp32 (0,21 veces la varianza seed-to-seed del propio sampler) y ejecuta entre 2 y 3 veces más rápido, motivo por el que MAESTRO la usa por defecto.

## Capacidades

- Generación de voz a partir de texto (text-to-speech) con salida monofónica a 24 kHz.
- Edición de voz (speech-editing) sobre audio existente, según los tags del repositorio.
- Mejora de voz (speech-enhancement).
- Conversión audio-a-audio (audio-to-audio).
- Ejecución en fp32 o bf16, con una penalización de fidelidad medida de 1,59 dB de log-mel en bf16.
- Cabe en GPUs de consumo: pico de VRAM medido de ~8,4-9,0 GiB en una tarjeta de 12 GB, gestionando el encoder y el DiT de forma no simultánea.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo de lenguaje de propósito general).
- Capacidades multilingües: no disponible.
- Capacidades especiales adicionales (visión, audio de entrada, modo "thinking"): no documentadas en la información disponible.

## Casos de uso

- Síntesis de voz para narración y audiolibros: el modelo genera audio monofónico a 24 kHz a partir de texto, con un DiT de 1,53B que puede ejecutarse en una GPU de 12 GB, lo que permite prototipar y producir narraciones sin infraestructura de centro de datos.
- Post-producción y edición de voz: la capacidad de speech-editing declarada en los tags permitiría modificar segmentos de una grabación preservando el resto de la pista, un flujo típico en podcast y vídeo.
- Restauración y limpieza de grabaciones: el tag de speech-enhancement apunta a su uso para reducir ruido o artefactos en material ya grabado antes de publicarlo.
- Conversión de voz (audio-to-audio): reutilización de una misma interpretación vocal con otra identidad o estilo, útil en doblaje y localización de contenido.
- Prototipado de asistentes de voz: la latencia de bf16 (2-3 veces más rápida que fp32) y su huella de VRAM lo hacen viable para demos interactivas de TTS en hardware de consumo.
- Investigación en modelos generativos de audio basados en difusión: al ser un espejo byte-idéntico del upstream con la configuración empaquetada por lanes, resulta adecuado para reproducir experimentos y comparar variantes de cuantización sobre el mismo checkpoint.
- Evaluación comparativa de fidelidad fp32 vs bf16: el propio repositorio documenta una medición reutilizable (1,59 dB de log-mel) útil para decidir el formato de despliegue en función del coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni equivalentes de audio como WER/MOS) en la información disponible. Los únicos datos medidos que aporta el repositorio son de fidelidad y coste computacional:

| Métrica | Valor |
|---|---|
| Desviación bf16 vs fp32 (log-mel) | 1,59 dB |
| Desviación relativa respecto a la varianza seed-to-seed del sampler | 0,21× |
| Aceleración de bf16 frente a fp32 | 2-3× |
| VRAM pico medida | ~8,4-9,0 GiB en una tarjeta de 12 GB |
| Tamaño del encoder Qwen2.5-Omni-3B en bf16 | 7,52 GiB |

No se dispone de comparativas de calidad de audio (MOS, similitud de hablante, WER) frente a otros sistemas TTS.

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 8,4-9,0 GiB en pico para el conjunto DiT + VAE + encoder, según la medición del autor. El repo no publica cifras separadas por cuantización más allá de fp32 (formato de publicación) y bf16 (recomendado).
- El encoder Qwen2.5-Omni-3B ocupa 7,52 GiB en bf16. La estrategia documentada para mantener el pico por debajo de 9 GiB consiste en no tener nunca residentes a la vez el encoder y el DiT.
- GPU de consumo: sí cabe. La referencia explícita es una tarjeta de 12 GB; por tanto, modelos como RTX 3060 12 GB, RTX 4070/4070 Ti o RTX 4080 son suficientes. Tarjetas de 24 GB (RTX 3090, RTX 4090) y aceleradores como A100 o H100 ofrecen holgura adicional.
- Despliegue: la vía soportada es MAESTRO (`library_name: maestro`), que descarga el encoder bajo demanda directamente desde el repositorio de Qwen. vLLM, TGI, llama.cpp u Ollama no aplican, al no tratarse de un modelo de lenguaje de texto.
- Latencia y throughput: no disponibles en valores absolutos. El único dato relativo es que bf16 ejecuta entre 2 y 3 veces más rápido que fp32.
- El repositorio pesa 6,8 GB y la lane `base/` 6,76 GB, por lo que hay que prever ese espacio en disco además del encoder descargado aparte.

## Comparativa con modelos similares

La búsqueda web realizada no devolvió resultados relevantes sobre este modelo ni sobre alternativas comparables (los resultados obtenidos corresponden a un comercio de menaje de cocina, sin relación con el modelo). No se dispone, por tanto, de datos de terceros para construir una comparativa fiable.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `AEmotionStudio/auk-models` (este repo) | 1,5305B (DiT) + VAE | No disponible | Sin benchmarks; bf16 a 1,59 dB de fp32 y 2-3× más rápido | MIT en los pesos, pero el encoder requerido es no comercial | HuggingFace, con descarga del encoder aparte |
| `tencent/AuK` (upstream) | 1,5305B (DiT) + VAE | No disponible | Idéntico (los ficheros son byte-idénticos) | MIT en los pesos, misma dependencia de encoder | HuggingFace |
| Alternativas TTS de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El modelo no es autónomo: sin el snapshot de `Qwen/Qwen2.5-Omni-3B` no puede ejecutarse, ya que no contiene ningún tensor de text encoder.
- Restricción de licencia crítica: aunque los pesos de AuK sean MIT, el encoder obligatorio está bajo Qwen Research License, que concede uso "for research or evaluation purposes only". En la práctica, esto hace que AuK sea un modelo no comercial, contradiciendo la apariencia permisiva de su licencia MIT.
- No existe un sustituto permisivo del encoder: el `config.yaml` fija `text_hidden_dim: 2048` al thinker de 3B y la cabeza de fusión de capas es un vector `[36]` dimensionado a `num_hidden_layers` del mismo. Qwen2.5-Omni-7B (3584 dimensiones) no es intercambiable pese a ser Apache 2.0, y Qwen3-Omni no está soportado según el upstream.
- Idiomas soportados: no disponibles. No se puede garantizar cobertura multilingüe ni evaluar sesgos lingüísticos con la información dada.
- Sesgos conocidos: no disponibles. El repositorio no documenta evaluación de sesgos de hablante, acento, género ni idioma.
- Riesgo de alucinación: no disponible para audio generado (no se publican métricas de inteligibilidad, WER ni fidelidad de contenido respecto al texto de entrada).
- Limitación de fidelidad en bf16: existe una desviación medible de 1,59 dB de log-mel frente a fp32. Aunque el autor la considera despreciable frente a la varianza del sampler (0,21×), es una fuente de variabilidad a tener en cuenta en producción si se exige reproducibilidad exacta.
- Gestión de memoria: el pico de VRAM depende de no mantener encoder y DiT residentes a la vez. Un pipeline mal implementado que los cargue simultáneamente puede exceder los 12 GB.
- El repositorio es un espejo, no un desarrollo propio: las actualizaciones, correcciones y soporte dependen del upstream `Tencent-Hunyuan/AuK`, y el mirror no modifica pesos.
- Los números de descargas y likes del repositorio son cero, por lo que no hay validación por parte de la comunidad.
- No se documentan cuantizaciones de menor precisión (GGUF, int8, int4), lo que limita el despliegue en hardware muy restringido.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/AEmotionStudio/auk-models
- Upstream en HuggingFace: https://huggingface.co/tencent/AuK
- Código upstream: https://github.com/Tencent-Hunyuan/AuK
- Paper: https://arxiv.org/abs/2609.08936
- Encoder requerido: https://huggingface.co/Qwen/Qwen2.5-Omni-3B

Nota: la búsqueda web realizada no devolvió ningún enlace relevante sobre el modelo; los únicos enlaces utilizables son los presentes en la model card y los metadatos de HuggingFace.
