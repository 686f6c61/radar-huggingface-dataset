# igunosalabs/Unose-Huen-Base

## Resumen

Unose-Huen-Base es un modelo de reconocimiento automático del habla (ASR) desarrollado por Igunosa Labs, un fine-tune del Whisper Base de OpenAI (74M parámetros) orientado específicamente a inglés nigeriano con acento marcado, prosodia conversacional y cadencia coloquial. Forma parte de la suite de voz Unose, que incluye una variante Small de 244M parámetros y un modelo TTS (Unose-Voice-v1.0). El modelo se distribuye bajo licencia Apache 2.0 y está pensado para inferencia en CPU, GPU y dispositivos de borde.

Técnicamente es un transformer encoder-decoder de 6 capas y 72.593.920 parámetros reales en safetensors, con la arquitectura estándar de Whisper: entrada de audio a 16 kHz convertida en espectrograma log-Mel y decodificación autorregresiva de tokens de texto. Al partir de Whisper Base, hereda su ventana de contexto de audio de 30 segundos y su tokenizador multilingüe, aunque el ajuste fino se ha centrado en inglés nigeriano.

Su relevancia actual radica en la brecha de rendimiento que los modelos ASR generalistas presentan sobre variedades del inglés no estadounidenses o británicas. El autor reporta un WER de 48,38% en su benchmark interno de inglés nigeriano con acento, lo que evidencia que el ajuste no resuelve por completo el dominio objetivo, pero sí ofrece un punto de partida reproducible y con evaluación pública en el Open ASR Leaderboard.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper Base: transformer encoder-decoder, 6 capas |
| Parametros totales | 72.593.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio por ventana (ventana estandar de Whisper) |
| Tipos de cuantizacion | no disponible (el autor menciona PyTorch safetensors y CTranslate2, sin detallar precisiones) |
| Idiomas soportados | no disponible en la informacion; el ajuste fino se orienta a ingles nigeriano |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PyTorch); CTranslate2 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Whisper Base: un encoder transformer de 6 capas que procesa espectrogramas log-Mel de 80 canales extraídos de audio a 16 kHz, y un decoder transformer de 6 capas que genera texto de forma autorregresiva con tokens especiales de tarea e idioma. La dimensión del modelo es de 512 y la atención es multi-cabeza estándar; no incorpora mecanismos de atención lineal, decodificación especulativa ni arquitecturas híbridas SSM.

El entrenamiento consiste en un fine-tune supervisado sobre `openai/whisper-base` con datos de inglés nigeriano, según indica la model card. No se especifican en la información disponible el número de tokens de audio, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO (poco habituales en ASR). Tampoco se detalla la estrategia de aumentación de datos ni el esquema de learning rate. La model card menciona un benchmark interno de validación con WER de 48,38% sobre inglés con acento nigeriano, lo que sugiere un dominio de ajuste acotado y probablemente de baja cobertura.

## Capacidades

- Reconocimiento automático del habla (transcripción) en inglés, con énfasis en inglés nigeriano y habla coloquial.
- Transcripción de audio de hasta 30 segundos por ventana; para audios más largos requiere segmentación o chunking con solapamiento.
- Manejo de prosodia conversacional y cadencia coloquial, según declara el autor.
- Inferencia en CPU, GPU y dispositivos de borde (edge), gracias al tamaño reducido de 74M parámetros.
- Compatibilidad con el pipeline `automatic-speech-recognition` de Transformers y con CTranslate2 para despliegue optimizado.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio generation ni modo thinking; es un modelo puramente ASR.
- Capacidades multilingües: no confirmadas; el tokenizador de Whisper soporta múltiples idiomas, pero el fine-tune se orienta a inglés.

## Casos de uso

- Transcripción de reuniones y llamadas en inglés nigeriano: el modelo puede procesar segmentos de 30 segundos y encadenarse para cubrir reuniones completas, con ventaja sobre Whisper Base en acentos locales según el ajuste declarado.
- Subtitulado y transcripción de contenido audiovisual de creadores nigerianos: útil para plataformas que necesitan ASR específico de variedades del inglés africano y no quieren depender de modelos estadounidenses.
- Atención al cliente en centros de contacto con agentes nigerianos: permite transcribir llamadas para análisis de calidad y compliance, con despliegue en CPU por su bajo coste.
- Investigación lingüística y sociolingüística: sirve como línea base reproducible para estudiar el rendimiento de ASR sobre variedades del inglés y comparar con modelos más grandes.
- Prototipado rápido en entornos con recursos limitados: al caber en CPU y dispositivos de borde, es adecuado para demos y PoCs de asistentes de voz sin GPU dedicada.
- Integración en pipelines de datos de voz para fine-tunes posteriores: puede generar transcripciones preliminares de corpus nigerianos que luego se corrijan manualmente para entrenar modelos mayores.
- Evaluación comparativa en el Open ASR Leaderboard: útil como referencia de un modelo pequeño ajustado a un dominio específico frente a Whisper Base original.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, campo `verified: false` en el model-index). Evaluación sobre Tesla T4 GPU con los splits oficiales del Open ASR Leaderboard.

| Benchmark | WER (%) | RTFx | Duración audio | Muestras |
|---|---:|---:|---:|---:|
| LibriSpeech test.clean | 7,86 | 84,36x | 5,40 h | 2.620 |
| LibriSpeech test.other | 16,11 | 68,51x | 5,34 h | 2.939 |
| VoxPopuli test (en) | 9,12 | 93,16x | 1,98 h | 628 |
| AMI cleaned test (ihm) | 23,35 | 34,10x | 7,98 h | 7.715 |
| Media macro-average | 14,11 | 70,03x (media) | — | — |
| Benchmark interno inglés nigeriano | 48,38 | no disponible | no disponible | no disponible |

El macro-average de WER es 14,11% y el RTFx medio es 70,03x en Tesla T4. No se han publicado en la información disponible comparaciones directas con Whisper Base original ni con otros modelos en los mismos splits, por lo que no es posible atribuir la mejora o el deterioro respecto al modelo base sin datos adicionales.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en FP32 (74M parámetros, ~290 MB de pesos) más activaciones y buffers de audio; en la práctica, menos de 2 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor reporta evaluaciones en Tesla T4. Funciona también en RTX 3060, RTX 4090, A100 y H100 sin aprovechar su capacidad.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Despliegue: Transformers (`pipeline("automatic-speech-recognition")`), CTranslate2 (formato soportado por el autor), y potencialmente faster-whisper al estar basado en Whisper. No se confirma soporte de vLLM, llama.cpp ni Ollama, que no están orientados a ASR encoder-decoder de este tipo.
- Latencia y throughput: RTFx de 34,10x a 93,16x según el split en Tesla T4, lo que equivale a procesar entre 34 y 93 segundos de audio por segundo de cómputo. En CPU el rendimiento será sustancialmente menor y no está cuantificado en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto audio | WER LibriSpeech clean | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| Unose-Huen-Base | 72,6M | 30 s | 7,86% (declarado) | Apache 2.0 | Hugging Face |
| openai/whisper-base | 74M | 30 s | no disponible en esta ficha | MIT | Hugging Face |
| igunosalabs/Unose-Huen-Small | 244M | 30 s | no disponible | no disponible | Hugging Face |
| Whisper Small (openai) | 244M | 30 s | no disponible en esta ficha | MIT | Hugging Face |

La comparación con Whisper Base original no puede cuantificarse porque no se han incluido en la información proporcionada los WER de referencia del modelo base en los mismos splits. El modelo hermano Small (244M) está listado por el autor como alternativa de mayor capacidad, pero sin métricas publicadas en esta ficha. No se dispone de comparaciones con otros ASR especializados en acentos africanos (por ejemplo, modelos de Masakhane o variantes de Wav2Vec2) en la información disponible.

## Limitaciones y advertencias

- El WER de 48,38% en el benchmark interno de inglés nigeriano con acento es alto y sugiere que el ajuste fino no resuelve por completo el dominio objetivo; en producción requerirá validación adicional con datos reales.
- Los resultados de benchmarks están marcados como no verificados (`verified: false`) y proceden del propio autor; no han sido replicados de forma independiente.
- Ventana de audio limitada a 30 segundos: audios más largos requieren segmentación manual, con riesgo de errores en las fronteras y pérdida de contexto entre segmentos.
- Idiomas soportados no documentados: aunque el tokenizador de Whisper es multilingüe, el fine-tune se orienta a inglés y el rendimiento en otros idiomas o variedades del inglés no está evaluado.
- Sesgos potenciales derivados de los datos de ajuste fino, cuya composición no se detalla; puede haber sesgo de dominio hacia el tipo de habla nigeriana presente en el corpus de entrenamiento.
- Riesgo de alucinación en ASR: Whisper es propenso a generar texto plausible en segmentos con silencio, ruido o habla solapada; no se documentan mitigaciones específicas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Whisper es MIT y el usuario debe cumplir ambas licencias y las de los datasets de evaluación si redistribuye resultados.
- Repositorio de 9,3 GB para un modelo de 74M parámetros: el tamaño incluye probablemente checkpoints y artefactos adicionales; conviene revisar los archivos antes de descargar en entornos con ancho de banda limitado.
- Sin soporte documentado de diarización de hablantes, timestamps a nivel de palabra ni puntuación avanzada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/igunosalabs/Unose-Huen-Base
- Repositorio GitHub oficial: https://github.com/Igunosa-Labs/unose-huen
- Modelo hermano Small (244M): https://huggingface.co/igunosalabs/Unose-Huen-Small
- Modelo TTS de la suite: https://huggingface.co/igunosalabs/Unose-Voice-v1.0
- Issue de evaluación en Open ASR Leaderboard: https://github.com/huggingface/open_asr_leaderboard/issues/262
- Modelo base: https://huggingface.co/openai/whisper-base
