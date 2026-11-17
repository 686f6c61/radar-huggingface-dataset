# mrsoundmind/Voxtral-Mini-3B-2507-gguf

## Resumen

Voxtral-Mini-3B-2507-gguf es la conversión a formato GGUF del modelo Voxtral Mini 1.0 (3B) de Mistral AI, publicada por el usuario mrsoundmind para su uso con transcribe.cpp, un runtime de inferencia centrado en modelos de voz. Voxtral Mini es un modelo audio-LLM que combina un codificador de audio bidireccional Whisper-large-v3 con un decodificador causal Ministral-3B, lo que le permite transcribir, traducir y comprender audio directamente sin necesidad de encadenar un sistema ASR con un modelo de lenguaje separado.

El modelo resuelve el problema de la transcripción y comprensión de audio multilingüe con contexto largo: maneja hasta 30 minutos de audio para transcripción y 40 minutos para comprensión, con una ventana de contexto de 32k tokens. Es relevante porque integra detección automática de idioma, traducción de voz, respuesta a preguntas sobre audio y function calling a partir de la voz, todo en un único modelo de aproximadamente 4.680 millones de parámetros.

Esta ficha describe específicamente la conversión GGUF, que preserva la paridad numérica con la referencia en Transformers (WER de 1,88 % en LibriSpeech test-clean para BF16 frente a 1,87 % de la referencia) y ofrece cuantizaciones desde BF16 (9,37 GB) hasta Q4_K_M (2,98 GB), lo que permite desplegar el modelo en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio-LLM: codificador de audio Whisper-large-v3 bidireccional + proyector de 4 grupos de frames + LM causal Ministral-3B (30 capas, GQA 32/8, NEOX RoPE, SwiGLU) |
| Parametros totales | 4.676.297.232 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32k tokens (hasta 30 min de audio para transcripcion, 40 min para comprension) |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en, fr, de, es, it, pt, nl, hi |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (runtime transcribe.cpp) |

## Arquitectura y entrenamiento

Voxtral Mini emplea una arquitectura de inyección de tokens de audio: un codificador de audio Whisper-large-v3 bidireccional procesa la entrada y un proyector de 4 grupos de frames genera 375 tokens de audio por cada fragmento de 30 segundos. Estos tokens se inyectan en un decodificador causal Ministral-3B de 30 capas con atención de consultas agrupadas (GQA 32/8), RoPE en variante NEOX y activación SwiGLU. El frontend log-mel y el tokenizador tekken son idénticos a los de Voxtral Small 24B, del que este modelo es el hermano pequeño con un decodificador de 3B en lugar de Mistral-Small-24B.

La model card de esta conversión no detalla la composición del dataset de entrenamiento ni el volumen de tokens utilizados, ni confirma si hubo fases de RLHF o DPO. La información disponible se limita a la arquitectura y a la validación numérica: la conversión se realizó desde el commit upstream 3060fe3 y se validó contra la referencia de Transformers en el commit 483c122 de transcribe.cpp, con 43 tensores verificados dentro de tolerancia y transcripción byte a byte idéntica en BF16. La decodificación es greedy y no se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Transcripción de voz a texto con modo dedicado de transcripción y detección automática del idioma de origen.
- Traducción de voz a texto (speech translation) mediante la plantilla instruct de mistral-common.
- Comprensión de audio: respuesta a preguntas directamente sobre el contenido del audio y generación de resúmenes estructurados sin pipeline ASR + LLM separado.
- Function calling a partir de la voz: activación de funciones de backend, flujos de trabajo o llamadas a API según la intención hablada.
- Capacidades de texto heredadas de Ministral-3B para comprensión y generación de lenguaje.
- Multilingüe nativo en inglés, francés, alemán, español, italiano, portugués, neerlandés e hindi.
- Procesamiento de audio de formato largo: hasta 30 minutos para transcripción y 40 minutos para comprensión.
- No soporta streaming (streaming: false) ni generación de marcas de tiempo (timestamps: none).

## Casos de uso

- Transcripción de reuniones y actas: el modelo procesa hasta 30 minutos de audio en una sola pasada con 32k tokens de contexto, detecta el idioma automáticamente y produce la transcripción sin segmentar manualmente la grabación.
- Subtitulado y traducción de contenido audiovisual: la función de traducción de voz permite generar texto en otro idioma a partir del audio original, útil para localizar pódcast o vídeos en los ocho idiomas soportados.
- Análisis de llamadas de atención al cliente: al responder preguntas directamente sobre el audio, se pueden extraer resúmenes estructurados y motivos de contacto sin transcribir primero y pasar el texto a otro modelo.
- Asistentes de voz con ejecución de acciones: el function calling desde voz permite mapear intenciones habladas a llamadas de API, por ejemplo para agendar citas o consultar pedidos en un sistema de backend.
- Despliegue en hardware de consumo: con la cuantización Q4_K_M (2,98 GB) el modelo cabe en GPUs de consumo y puede ejecutarse con transcribe.cpp en CPU o GPU, lo que facilita prototipos locales de transcripción sin infraestructura dedicada.
- Investigación en ASR multilingüe: el WER de 1,87-1,94 % en LibriSpeech test-clean según cuantización y la paridad numérica documentada con la referencia lo hacen adecuado como base reproducible para experimentos de reconocimiento de voz.
- Procesamiento por lotes en servidores: la conversión Q8_0 (5,00 GB) mantiene un WER de 1,87 % y permite ejecutar transcripciones por lotes en GPUs de centro de datos con una huella de memoria moderada.

## Benchmarks y rendimiento

| Metrica | BF16 | F16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M |
|---|---:|---:|---:|---:|---:|---:|
| WER LibriSpeech test-clean (%) | 1,88 | 1,89 | 1,87 | 1,87 | 1,91 | 1,94 |

El WER se midió sobre la totalidad de LibriSpeech test-clean (2620 enunciados) con el normalizador de texto inglés de Whisper, tamaño de lote 8 y una NVIDIA L40S. La referencia de HuggingFace Transformers en la misma máquina (VoxtralForConditionalGeneration, BF16, attn_implementation=eager, greedy) obtuvo 1,87 %, por lo que la conversión BF16 coincide dentro del redondeo.

Rendimiento relativo (RTF, real-time factor) documentado en la model card:

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 14,9 |
| Apple M4 Max | CPU | 2 |
| AMD Ryzen 4750U | Vulkan | 1,2 |
| AMD Ryzen 4750U | CPU | 0,5 |

No se han publicado en la información disponible resultados de benchmarks de texto (MMLU, GSM8K u otros) ni métricas comparativas de WER sobre FLEURS, Common Voice o Multilingual LibriSpeech, aunque la model card original de Mistral los referencia mediante gráficas no reproducidas en el texto.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9,4 GB en BF16/F16, 5,0 GB en Q8_0, 3,9 GB en Q6_K, 3,5 GB en Q5_K_M y 3,0 GB en Q4_K_M.
- GPU recomendadas: NVIDIA L40S para validación y cargas de producción con cuantizaciones altas; A100 y H100 para despliegues de mayor concurrencia; RTX 4090 para inferencia local con BF16 o Q8_0.
- GPU de consumo: las cuantizaciones Q4_K_M y Q5_K_M (2,98 y 3,46 GB) caben en GPUs de consumo con 4-6 GB de VRAM; Q8_0 requiere al menos 6-8 GB.
- Opciones de despliegue: el runtime previsto es transcribe.cpp (compilación con CMake y CLI transcribe-cli); la model card no documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que el formato GGUF está adaptado a transcribe.cpp.
- Latencia y throughput: RTF de 14,9 en Metal sobre M4 Max, 2 en CPU sobre M4 Max, 1,2 en Vulkan sobre Ryzen 4750U y 0,5 en CPU sobre Ryzen 4750U. No se documentan métricas de throughput por lotes en GPU de centro de datos.
- Entrada de audio: WAV mono a 16 kHz; la model card recomienda convertir con ffmpeg (-ar 16000 -ac 1) si el formato de origen es distinto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---:|---|---|---|---|
| Voxtral-Mini-3B-2507 (esta conversion) | 4,68B | 32k tokens (30 min audio) | 8 | Apache-2.0 | GGUF (transcribe.cpp) |
| Voxtral Small 24B | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion |
| Ministral-3B (backbone de texto) | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion |

La model card identifica a Voxtral Small 24B como el hermano mayor con el mismo codificador, proyector, frontend log-mel y tokenizador tekken, pero sustituyendo el decodificador de 3B por Mistral-Small-24B. No se proporcionan en la información disponible datos de parámetros, contexto, rendimiento ni licencia de ese modelo ni de alternativas ASR de otros fabricantes, por lo que la comparativa cuantitativa queda limitada a esta referencia cualitativa.

## Limitaciones y advertencias

- No soporta streaming: la inferencia es offline sobre ficheros de audio completos (streaming: false).
- No genera marcas de tiempo (timestamps: none), lo que limita su uso en subtitulado fino o alineación temporal.
- Solo acepta WAV mono a 16 kHz; es necesario remuestrear y convertir canales previamente.
- La decodificación es greedy, sin opciones documentadas de muestreo o beam search en esta conversión.
- Riesgo de alucinación inherente a los modelos de lenguaje: en pasajes de audio con ruido, música o silencios podría generar texto no presente en la señal.
- La model card no documenta sesgos conocidos, composición del dataset de entrenamiento ni evaluaciones de robustez por idioma o acento.
- El soporte multilingüe se limita a los ocho idiomas declarados (en, fr, de, es, it, pt, nl, hi); el rendimiento en otros idiomas no está evaluado.
- Licencia Apache-2.0 heredada del modelo base, que permite uso comercial, pero la model card remite a los términos completos del modelo original de Mistral AI como fuente autoritativa.
- El ecosistema de despliegue está restringido a transcribe.cpp; no se documenta compatibilidad con runtimes GGUF más extendidos como llama.cpp u Ollama.
- La conversión está anclada a commits concretos (upstream 3060fe3 y transcribe.cpp 483c122); cambios posteriores en el modelo base o en el runtime no están cubiertos por la validación.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/mrsoundmind/Voxtral-Mini-3B-2507-gguf
- Modelo base en Hugging Face: https://huggingface.co/mistralai/Voxtral-Mini-3B-2507
- Commit upstream de referencia: https://huggingface.co/mistralai/Voxtral-Mini-3B-2507/commit/3060fe3
- Repositorio transcribe.cpp: https://github.com/mrsoundmind/transcribe.cpp
- Blog de Mistral AI sobre Voxtral: https://mistral.ai/news/voxtral
- Paper de Voxtral: https://arxiv.org/abs/2507.13264
- Blog de Ministral: https://mistral.ai/news/ministraux
