# GhaythMahadin/medasr-gguf

## Resumen

MedASR es un modelo de reconocimiento automático del habla (ASR) desarrollado por Google y especializado en dictado médico. Se basa en una arquitectura Conformer con atención RoPE, FFN de tipo macaron y una cabeza CTC con vocabulario SentencePiece de 512 tokens, orientada a transcripciones de radiología, medicina interna y medicina de familia. El modelo original, `google/medasr`, se distribuye bajo los términos de Health AI Developer Foundations y está pensado como punto de partida para desarrolladores que necesitan transcribir terminología médica con precisión.

La ficha que nos ocupa, `GhaythMahadin/medasr-gguf`, es una conversión a formato GGUF del modelo original para su uso con la librería `transcribe.cpp`. Incluye seis niveles de cuantización (F32, F16, Q8_0, Q6_K, Q5_K_M y Q4_K_M) con tamaños que van de 417 MB a 79 MB, lo que permite ejecutar el modelo en hardware muy modesto, incluidas CPU y GPUs de consumo. El modelo tiene 105.316.112 parámetros y procesa audio en inglés exclusivamente.

Su relevancia radica en dos factores: por un lado, la especialización en dominio médico frente a ASR de propósito general, y por otro, la disponibilidad de pesos cuantizados en GGUF que facilitan el despliegue local y offline sin depender de servicios en la nube, algo crítico en entornos sanitarios con requisitos de privacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (encoder de 17 capas, atención RoPE, FFN macaron, cabeza CTC con SentencePiece de 512 tokens) |
| Parametros totales | 105.316.112 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; ventana de entrada no especificada) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | inglés (en) |
| Licencia | other (Health AI Developer Foundations, heredada de google/medasr) |
| Formato de pesos | GGUF (para transcribe.cpp) |

## Arquitectura y entrenamiento

MedASR emplea una arquitectura Conformer, que combina bloques de autoatención con convoluciones para capturar dependencias locales y globales en la señal de audio. El encoder consta de 17 capas con atención RoPE (Rotary Positional Embeddings), FFN de tipo macaron (dos capas feed-forward intercaladas alrededor del módulo de atención) y una cabeza CTC final con vocabulario SentencePiece de 512 tokens. La decodificación es CTC greedy, sin modelo de lenguaje externo ni búsqueda por haces (beam search), lo que simplifica el pipeline y reduce la latencia a costa de cierta precisión en la salida.

El modelo fue preentrenado por Google sobre un corpus de audio médico, según indica la model card original. No se especifican en la información disponible el número exacto de tokens de audio, la composición detallada del dataset ni si se aplicaron técnicas de RLHF o DPO (poco habituales en modelos CTC de ASR). La conversión GGUF fue realizada por GhaythMahadin a partir del commit `ae1e484` del modelo original y validada contra la referencia de transformers en el commit `782abfd` de transcribe.cpp.

## Capacidades

- Transcripción de voz a texto offline en inglés, optimizada para dictado médico (radiología, medicina interna, medicina de familia).
- Reconocimiento de terminología médica especializada, incluyendo nombres de fármacos, procedimientos y hallazgos radiológicos.
- Decodificación CTC greedy con timestamps a nivel de token.
- Ejecución local sin conexión, sin dependencia de servicios en la nube.
- Soporte de cuantización agresiva (hasta Q4_K_M, 79 MB) manteniendo degradación mínima de WER.
- No soporta streaming (indicado explícitamente como `streaming: false`).
- No soporta traducción (`translate: false`) ni detección de idioma (`lang_detect: false`).
- No incluye modelo de lenguaje externo ni beam search.

## Casos de uso

- Dictado radiológico en entornos clínicos: el modelo transcribe informes de radiología dictados por especialistas, reconociendo términos como "hipodenso", "adenopatía" o "consolidación", gracias a su preentrenamiento sobre corpus médico y su cabeza CTC especializada.
- Documentación clínica en consulta: médicos de familia o internistas pueden dictar notas de consulta y el modelo las transcribe localmente, evitando el envío de datos sensibles a la nube y cumpliendo requisitos de privacidad.
- Despliegue en hardware de bajo consumo: con cuantización Q8_0 (122 MB) o Q5_K_M (90 MB), el modelo puede ejecutarse en CPUs modestas o GPUs integradas, lo que lo hace viable en portátiles y estaciones de trabajo sin GPU dedicada.
- Integración en pipelines de transcripción batch: mediante `transcribe-cli` de transcribe.cpp, se pueden procesar lotes de archivos WAV de 16 kHz mono en servidores sin necesidad de infraestructura GPU.
- Prototipado de aplicaciones de salud: desarrolladores que construyen asistentes de voz para personal sanitario pueden usar el modelo como base para validar flujos de dictado antes de invertir en soluciones comerciales.
- Investigación en ASR médico: el modelo sirve como referencia para estudiar el rendimiento de arquitecturas Conformer en dominios especializados y comparar con ASR de propósito general.
- Transcripción de reuniones clínicas o sesiones de casos: aunque el modelo está optimizado para dictado, puede transcribir audio de reuniones médicas en inglés, con la salvedad de que no soporta streaming ni diarización.

## Benchmarks y rendimiento

Los datos de WER (Word Error Rate) disponibles corresponden a la evaluación sobre LibriSpeech test-clean (2.620 utterances) con decodificación CTC greedy y sin modelo de lenguaje externo:

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| F32 | 417 MB | 17,88 % |
| F16 | 202 MB | 17,88 % |
| Q8_0 | 122 MB | 17,86 % |
| Q6_K | 101 MB | 17,93 % |
| Q5_K_M | 90 MB | 17,91 % |
| Q4_K_M | 79 MB | 18,14 % |

El WER absoluto es elevado en comparación con ASR de propósito general (Whisper-base ronda el 5 %) porque el modelo está ajustado para dictado médico. En los datasets internos del publicador (RAD-DICT, GENERAL-DICT, FM-DICT) el modelo alcanza un WER de 6,6 % a 9,3 %, aunque estos conjuntos no son reproducibles públicamente.

Datos de rendimiento (RTF, Real-Time Factor) proporcionados por el autor de la conversión:

| Plataforma | Backend | RTF |
|---|---|---:|
| Mac M4 Max | Metal | 354,5 |
| Mac M4 Max | CPU | 65,5 |
| Ryzen 4750U | Vulkan | 71 |
| Ryzen 4750U | CPU | 19,5 |

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en todos los casos; el modelo más grande (F32) ocupa 417 MB y el más pequeño (Q4_K_M) 79 MB.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon) o Vulkan (AMD, Intel, NVIDIA) es suficiente; no se requiere una GPU de datacenter.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 1 GB de memoria, incluidas integradas.
- Opciones de despliegue: `transcribe.cpp` (compilación desde fuente con CMake), con backend CPU, Metal o Vulkan. No se mencionan vLLM, llama.cpp, Ollama ni TGI, ya que el modelo es específico de ASR y no de generación de texto.
- Latencia y throughput: RTF de 354,5 en Metal (M4 Max) y 71 en Vulkan (Ryzen 4750U), lo que indica procesamiento muy por encima de tiempo real en ambos casos. En CPU pura, RTF de 65,5 (M4 Max) y 19,5 (Ryzen 4750U).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (LibriSpeech test-clean) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| MedASR (este, Q8_0) | 105 M | no disponible | 17,86 % | Health AI Developer Foundations | GGUF en HF, transcribe.cpp |
| Whisper-base | 74 M | 30 s de audio | ~5 % (referencia general) | MIT | Múltiples formatos (GGUF, safetensors, etc.) |
| Whisper-small | 244 M | 30 s de audio | ~3,4 % (referencia general) | MIT | Múltiples formatos |

La comparación con Whisper no es directa: MedASR está especializado en dominio médico y su WER en LibriSpeech (audio general) es mucho peor, pero en sus datasets médicos internos alcanza 6,6–9,3 %, un rendimiento que Whisper no está optimizado para igualar en terminología clínica. La licencia de MedASR es más restrictiva que la MIT de Whisper, lo que limita su uso comercial sin revisar los términos de Health AI Developer Foundations.

## Limitaciones y advertencias

- El WER en audio general (LibriSpeech test-clean) es de ~17,9 %, muy superior al de ASR de propósito general; el modelo no debe usarse para transcripción genérica.
- No soporta streaming, traducción ni detección de idioma; solo inglés y solo audio offline.
- La decodificación CTC greedy sin modelo de lenguaje externo limita la corrección de errores en términos fuera del corpus de preentrenamiento (nombres de fármacos no estándar, fechas, horas y duraciones).
- La model card original advierte de variabilidad de rendimiento con términos fuera del preentrenamiento, como medicamentos no estándar o manejo consistente de datos temporales.
- Licencia "other" (Health AI Developer Foundations): es necesario revisar los términos de uso antes de cualquier despliegue comercial; no es una licencia permisiva tipo MIT o Apache.
- Riesgo de alucinación inherente a modelos CTC: puede generar transcripciones plausibles pero incorrectas en audio con ruido o acentos no representados en el corpus.
- Sesgos no documentados en la información disponible; al ser un modelo entrenado por Google sobre corpus médico, puede reflejar sesgos demográficos o lingüísticos del dataset de entrenamiento.
- La cuantización Q4_K_M muestra una degradación real de +0,26 pp en WER; el autor recomienda Q8_0 como opción por defecto y Q5_K_M si se necesita menor tamaño.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, lo que indica que es una conversión reciente y poco validada por la comunidad.

## Enlaces

- [Hugging Face: GhaythMahadin/medasr-gguf](https://huggingface.co/GhaythMahadin/medasr-gguf)
- [Modelo base: google/medasr](https://huggingface.co/google/medasr)
- [Commit del modelo base: ae1e484](https://huggingface.co/google/medasr/commit/ae1e484)
- [Repositorio transcribe.cpp](https://github.com/handy-computer/transcribe.cpp)
- [Commit de transcribe.cpp: 782abfd](https://github.com/handy-computer/transcribe.cpp/tree/782abfd)
- [Documentación de transcribe.cpp para MedASR](https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/medasr.md)
- [Documentación de MedASR en Google](https://developers.google.com/health-ai-developer-foundations/medasr)
- [MedASR en Google Cloud Model Garden](https://console.cloud.google.com/vertex-ai/publishers/google/model-garden/medasr)
- [Repositorio GitHub de MedASR](https://github.com/google-health/medasr)
- [Notebook de inicio rápido](https://github.com/google-health/medasr/blob/main/notebooks/quick_start_with_hugging_face.ipynb)
- [Notebook de fine-tuning](https://github.com/google-health/medasr/blob/main/notebooks/fine_tune_with_hugging_face.ipynb)
- [Términos de Health AI Developer Foundations](https://developers.google.com/health-ai-developer-foundations/terms)
- [Preprint técnico (arXiv:2605.16555)](https://arxiv.org/abs/2605.16555)
- [Paper Conformer (arXiv:2005.08100)](https://arxiv.org/abs/2005.08100)
