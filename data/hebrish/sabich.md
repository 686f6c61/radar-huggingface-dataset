# Hebrish/Sabich

## Resumen

Sabich es un modelo de reconocimiento automático del habla (ASR) especializado en dictado con cambio de código (code-switching) entre inglés y hebreo, con especial énfasis en vocabulario técnico. Lo desarrolla el usuario Hebrish y se construye como un ajuste fino (fine-tuning) del modelo NVIDIA Parakeet TDT 0.6B v2, una arquitectura NeMo basada en Token-and-Duration Transducer (TDT). El modelo aborda un problema concreto: los sistemas ASR generalistas degradan su precisión cuando un hablante alterna entre inglés y hebreo dentro de la misma frase, especialmente con términos técnicos como nombres de herramientas, siglas o vocabulario de desarrollo de software.

Con aproximadamente 0,6 mil millones de parámetros, Sabich está pensado para dictado personal y transcripción de reuniones técnicas donde los hablantes hispanohablantes de hebreo o profesionales israelíes intercalan terminología inglesa. El modelo se distribuye bajo licencia CC BY-NC 4.0, lo que restringe el uso comercial, y su acceso en Hugging Face está restringido (gated), requiriendo aceptar condiciones antes de la descarga. El repositorio ocupa 14,8 GB, coherente con el empaquetado NeMo que incluye pesos y artefactos asociados.

La relevancia actual de Sabich radica en su enfoque específico sobre el bilingüismo técnico, un nicho poco cubierto por los ASR multilingües masivos, que suelen tratar el cambio de código como ruido o forzar la normalización a un solo idioma. El modelo declara métricas detalladas sobre un benchmark propio de code-switching inglés-hebreo, incluyendo WER, CER y recall de términos, lo que permite evaluar su comportamiento en el escenario exacto para el que fue diseñado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | NeMo Parakeet TDT (Token-and-Duration Transducer), ajuste fino de nvidia/parakeet-tdt-0.6b-v2 |
| Parámetros totales | ~0,6 mil millones (heredados del modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR por segmentos de audio, no contexto textual) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en), hebreo (he), con cambio de código en-he; tags adicionales mencionan irish-english |
| Licencia | CC BY-NC 4.0 (no comercial) |
| Formato de pesos | NeMo (.nemo), repositorio de 14,8 GB |
| Librería | NVIDIA NeMo |
| Pipeline | automatic-speech-recognition |
| Acceso | Restringido (gated) en Hugging Face |
| Modelo base | nvidia/parakeet-tdt-0.6b-v2 |

## Arquitectura y entrenamiento

Sabich hereda la arquitectura Parakeet TDT de NVIDIA, un modelo transducer que combina un encoder de audio con un decoder de predicción y una red conjunta que emite tokens junto con predicciones de duración. Esta variante TDT (Token-and-Duration Transducer) predice simultáneamente el token de salida y su duración, lo que reduce el número de pasos de decodificación y mejora la eficiencia frente a los transducers clásicos. El modelo base Parakeet TDT 0.6B v2 está entrenado por NVIDIA para ASR en inglés, y Sabich lo ajusta para incorporar hebreo y el fenómeno de cambio de código.

El ajuste fino se realizó sobre un conjunto de datos que, según los tags del repositorio, incluye `danielrosehill/Read-Aloud-Voice-Sentences` y `openslr/librispeech_asr`. La composición exacta del dataset de entrenamiento, el número de horas de audio, la proporción entre inglés y hebreo y si se aplicaron técnicas de aumento de datos no están disponibles en la información proporcionada. Tampoco se detalla si hubo etapas de alineación o ajuste con RLHF, algo poco habitual en modelos ASR. La innovación principal declarada es la adaptación al hablante y al vocabulario técnico (speaker-adaptation, tech-vocabulary) en un contexto bilingüe inglés-hebreo.

## Capacidades

- Reconocimiento automático del habla en inglés y hebreo, con soporte explícito para cambio de código intra-frase (code-switching en-he).
- Transcripción de vocabulario técnico y terminología de desarrollo de software, con métricas específicas de recall de términos.
- Adaptación al hablante (speaker-adaptation), orientada a dictado personal.
- Manejo de términos vistos y no vistos en entrenamiento, con distinto rendimiento declarado para cada caso.
- Capacidad de dictado en inglés irlandés (irish-english) según los tags del repositorio.
- No se declara soporte de tool calling, function calling, agentes ni razonamiento multi-paso; es un modelo puramente ASR.
- No se declara capacidad de visión ni audio más allá de la transcripción de voz.

## Casos de uso

- Dictado personal bilingüe: un desarrollador que trabaja en hebreo e inglés puede dictar notas, correos o documentación alternando ambos idiomas en la misma frase, y el modelo transcribe sin forzar la normalización a un solo idioma.
- Transcripción de reuniones técnicas: equipos de ingeniería en Israel que discuten arquitectura o código en hebreo con términos ingleses pueden generar actas o resúmenes a partir del audio, aprovechando el recall de vocabulario técnico.
- Documentación de código por voz: el modelo permite dictar comentarios, mensajes de commit o descripciones de pull requests mezclando hebreo e inglés, reduciendo la corrección manual de siglas y nombres de APIs.
- Accesibilidad para hablantes bilingües: personas con movilidad reducida que necesitan escribir en hebreo e inglés pueden usar el modelo como capa de entrada de voz en herramientas de escritorio.
- Subtitulado de contenido técnico: charlas o tutoriales en los que el ponente alterna hebreo e inglés pueden transcribirse con mayor fidelidad en los términos técnicos que con un ASR monolingüe.
- Evaluación de pipelines ASR: investigadores que estudian code-switching pueden usar Sabich como referencia o componente en experimentos sobre transcripción bilingüe, dado que publica métricas detalladas de WER, CER y recall de términos.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo sobre el benchmark `Hebrish/English-Hebrew-Codeswitching-ASR-Benchmark` (split test, revisión 48ec85a), correspondientes a Sabich v2.3. Ninguno de los resultados está verificado de forma independiente (`verified: false`).

| Métrica | Subconjunto | Valor |
|---|---|---|
| WER (code-switching) | clean, 129 clips | 4,96 % |
| CER (code-switching) | clean, 129 clips | 1,51 % |
| Recall de términos en hebreo | clean, 221 ocurrencias | 66,97 % |
| Recall de términos no vistos | clean, 137 ocurrencias | 59,85 % |
| Recall de términos vistos | clean, 84 ocurrencias | 78,57 % |
| WER (control en inglés) | english_control, 25 clips | 2,42 % |
| WER (técnico) | tech, 25 clips | 3,02 % |

No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, que no aplican a un modelo ASR. Tampoco se dispone de comparaciones numéricas con otros modelos ASR en la misma tabla.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~0,6 mil millones de parámetros, la inferencia en precisión completa (FP32) requiere aproximadamente 2,4 GB solo para pesos; en FP16/BF16 alrededor de 1,2 GB, más memoria para activaciones y buffers de audio. No se dispone de cifras oficiales de VRAM del autor.
- GPU recomendadas: tarjetas con al menos 4-8 GB de VRAM para FP16, como RTX 3060, RTX 4060, RTX 4090, A10, L4, A100 o H100. El modelo es lo bastante pequeño para ejecutarse en GPUs de consumo.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 4 GB o más de VRAM en FP16, aunque no se han publicado requisitos oficiales.
- Opciones de despliegue: al ser un modelo NeMo, el despliegue natural es mediante NVIDIA NeMo (transcribe, ASR pipeline) y, potencialmente, NVIDIA Riva o Triton con backend NeMo. No se declara soporte para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje, no a transducers ASR.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| Sabich (Hebrish) | ~0,6 B | en, he (code-switching) | no aplica | CC BY-NC 4.0 | ASR bilingüe técnico |
| nvidia/parakeet-tdt-0.6b-v2 | ~0,6 B | en | no aplica | no disponible en la información | ASR inglés generalista |
| Whisper large-v3 (OpenAI) | ~1,55 B | multilingüe | no aplica | MIT (según distribución pública) | ASR multilingüe generalista |
| Otros ASR hebreo-inglés especializados | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación cuantitativa de WER entre Sabich y alternativas no está disponible en la información proporcionada. Sabich se diferencia de Parakeet v2 por añadir hebreo y code-switching, y de Whisper por su especialización en vocabulario técnico y su licencia no comercial.

## Limitaciones y advertencias

- Licencia CC BY-NC 4.0: prohíbe el uso comercial. Cualquier despliegue en producto o servicio de pago requiere una licencia alternativa que no se menciona en la información disponible.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar el modelo, lo que añade fricción a la automatización de pipelines.
- Resultados no verificados: todas las métricas del model-index están marcadas como `verified: false` y proceden del propio autor, por lo que deben interpretarse con cautela.
- Rendimiento desigual en términos no vistos: el recall de términos no vistos (59,85 %) es notablemente inferior al de términos vistos (78,57 %), lo que indica que el vocabulario técnico fuera del conjunto de entrenamiento puede transcribirse con errores.
- Sesgos y alucinaciones: no se documentan sesgos específicos ni tasas de alucinación en la información proporcionada; como todo ASR, puede generar transcripciones plausibles pero incorrectas en audio ruidoso o con acentos no representados.
- Cobertura de idiomas limitada: solo inglés y hebreo (con mención a irish-english); no se declara soporte para castellano ni otros idiomas.
- Dependencia del ecosistema NeMo: el formato `.nemo` y la librería NeMo limitan la portabilidad frente a formatos como GGUF u ONNX, y no se declaran conversiones oficiales.
- Tamaño del repositorio: 14,8 GB, considerable para un modelo de 0,6 B, lo que puede deberse a artefactos de entrenamiento o múltiples checkpoints; conviene revisar el contenido antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hebrish/Sabich
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Benchmark de code-switching inglés-hebreo: https://huggingface.co/datasets/Hebrish/English-Hebrew-Codeswitching-ASR-Benchmark
- Dataset Read-Aloud-Voice-Sentences: https://huggingface.co/datasets/danielrosehill/Read-Aloud-Voice-Sentences
- Dataset LibriSpeech ASR: https://huggingface.co/datasets/openslr/librispeech_asr
- DOI del modelo: https://doi.org/10.57967/hf/11336
- Librería NVIDIA NeMo: https://github.com/NVIDIA/NeMo
