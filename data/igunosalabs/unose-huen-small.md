# igunosalabs/Unose-Huen-Small

## Resumen

Unose-Huen-Small es un modelo de reconocimiento automático del habla (ASR) desarrollado por Igunosa Labs como parte de la suite Unose. Se trata de un ajuste fino de Whisper Small de OpenAI, un transformer encoder-decoder de 12 capas y 241.734.912 parámetros, orientado a inglés nigeriano, reuniones conversacionales multihablante y robustez ante acentos marcados. El modelo se publica bajo licencia Apache 2.0 y está disponible en formato safetensors para la librería transformers, además de CTranslate2.

El modelo resuelve el problema de la degradación de precisión de los sistemas ASR genéricos ante variedades del inglés poco representadas en los corpus de entrenamiento originales, en particular el inglés nigeriano y el habla espontánea en reuniones. Frente a su modelo hermano Unose-Huen-Base (74M), reduce el WER macro de 14,11% a 7,71%, lo que supone una mejora relativa del 45,3%, a costa de triplicar el número de parámetros y reducir el throughput de 70,03x a 26,37x RTFx sobre Tesla T4.

Es relevante ahora porque ofrece una alternativa de tamaño medio (244M) que cabe en hardware modesto, con un rendimiento en LibriSpeech clean (3,76% WER) competitivo con modelos significativamente mayores, y porque su evaluación sigue las particiones oficiales del Open ASR Leaderboard, lo que facilita la comparación directa con otros sistemas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper Small (encoder-decoder transformer, 12 capas) |
| Parametros totales | 241.734.912 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento, propia de Whisper) |
| Tipos de cuantizacion | no disponible (el autor menciona PyTorch safetensors y CTranslate2) |
| Idiomas soportados | no disponible en la informacion (orientado a ingles, con enfasis en acento nigeriano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch), CTranslate2 |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper Small: un transformer encoder-decoder de 12 capas y 244M de parámetros que procesa audio en ventanas de 30 segundos y genera transcripciones de forma autorregresiva. El modelo parte de los pesos de openai/whisper-small y se ajusta mediante fine-tuning supervisado sobre datos orientados a inglés nigeriano y habla conversacional multihablante. La model card no especifica el número de tokens de audio, la composición exacta del dataset de ajuste ni si se aplicaron técnicas de RLHF, DPO o decodificación especulativa.

El autor reporta que el ajuste produce una reducción relativa del WER macro del 45,3% respecto al modelo base, con mejoras especialmente marcadas en AMI Cleaned (reuniones) y VoxPopuli. La evaluación se realizó sobre las particiones oficiales del Open ASR Leaderboard con normalización de texto, y se documenta en el issue huggingface/open_asr_leaderboard#262. No se detallan innovaciones arquitectónicas adicionales; el modelo conserva la formulación estándar de Whisper.

## Capacidades

- Transcripción de voz a texto en inglés, con especial robustez ante acento nigeriano y habla conversacional.
- Reconocimiento en audio multihablante de reuniones (evaluado en AMI IHM).
- Manejo de audio de hasta 30 segundos por segmento, con segmentación automática para audios más largos mediante los pipelines estándar de transformers.
- Inferencia en CPU, GPU y dispositivos edge, con formatos PyTorch y CTranslate2.
- No dispone de tool calling, function calling ni capacidades de agente.
- No dispone de modo de razonamiento (thinking mode) ni capacidades de visión o audio generativo.
- Capacidades multilingües: no documentadas; el ajuste se orienta a inglés.

## Casos de uso

- Transcripción de reuniones corporativas: el modelo está evaluado en AMI Cleaned (14,44% WER) y maneja habla multihablante espontánea, lo que lo hace adecuado para generar actas y resúmenes a partir de audio de reuniones con varios participantes.
- Subtitulado y transcripción de contenido en inglés nigeriano: el ajuste específico sobre esta variedad reduce errores frente a Whisper Small genérico, útil para medios, podcasts y formación en Nigeria y diáspora.
- Atención al cliente por voz: con 26,37x RTFx en T4, permite procesar llamadas en tiempo casi real en infraestructura modesta; la transcripción puede alimentar sistemas de análisis de sentimiento o CRM.
- Accesibilidad y documentación clínica: transcripción de consultas o entrevistas en inglés con acentos diversos, desplegable en CPU o GPU de gama baja por su tamaño de 244M.
- Pipelines de ASR en producción con CTranslate2: el formato CTranslate2 permite servir el modelo con mayor eficiencia en CPU, adecuado para despliegues on-premise con requisitos de privacidad.
- Investigación en ASR con acentos: sirve como baseline reproducible con particiones oficiales del Open ASR Leaderboard para comparar técnicas de adaptación al acento.
- Procesamiento por lotes de archivos de audio: con throughput de 26,37x RTFx, permite transcribir grandes volúmenes de audio en servidores con una sola T4.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados, `verified: false`), sobre particiones oficiales del Open ASR Leaderboard y evaluados en NVIDIA Tesla T4:

| Benchmark | WER (%) | RTFx | Duracion audio | Muestras |
|---|---|---|---|---|
| LibriSpeech test.clean | 3,76 | 27,54x | 5,40 h | 2.620 |
| LibriSpeech test.other | 8,64 | 24,11x | 5,34 h | 2.939 |
| VoxPopuli test (en) | 4,01 | 38,35x | 1,98 h | 628 |
| AMI Cleaned test (ihm) | 14,44 | 15,49x | 7,98 h | 7.715 |
| Macro-average | 7,71 | 26,37x | — | — |

Comparativa con el modelo hermano, según el autor:

| Modelo | Parametros | WER macro (%) | LibriSpeech clean | LibriSpeech other | VoxPopuli | AMI Cleaned | RTFx medio |
|---|---|---|---|---|---|---|---|
| Unose-Huen-Base | 74M | 14,11 | 7,86 | 16,11 | 9,12 | 23,35 | 70,03x |
| Unose-Huen-Small | 244M | 7,71 | 3,76 | 8,64 | 4,01 | 14,44 | 26,37x |

No se han publicado en la información disponible resultados comparativos con otros modelos de la categoría (por ejemplo, Whisper Small original u otros fine-tunes).

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 1 GB para los pesos (244M parámetros), más overhead de activaciones y decodificación; en la práctica cabe holgadamente en GPUs con 4-8 GB.
- GPU recomendadas: NVIDIA Tesla T4 (plataforma de evaluación reportada), así como cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) con al menos 4 GB de VRAM.
- Cabe en GPU consumer: sí, en modelos con 4 GB o más de VRAM; también es viable en CPU gracias al tamaño reducido y al formato CTranslate2.
- Opciones de despliegue: transformers (pipeline de automatic-speech-recognition), CTranslate2, y cualquier servidor compatible con modelos Whisper (por ejemplo, faster-whisper al convertir a CTranslate2). No se documenta soporte explícito de vLLM, TGI o llama.cpp.
- Latencia y throughput: 26,37x RTFx medio en Tesla T4 según el autor, con variación entre 15,49x (AMI) y 38,35x (VoxPopuli). No se reportan latencias absolutas por segmento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | WER LibriSpeech clean | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Unose-Huen-Small | 244M | 30 s por segmento | 3,76% (declarado) | Apache 2.0 | Hugging Face, safetensors y CTranslate2 |
| Unose-Huen-Base | 74M | 30 s por segmento | 7,86% (declarado) | Apache 2.0 | Hugging Face |
| openai/whisper-small | 244M | 30 s por segmento | no disponible en la informacion | Apache 2.0 | Hugging Face, transformers |

La comparación con openai/whisper-small no puede cuantificarse con los datos proporcionados; el autor solo reporta la mejora relativa del 45,3% en WER macro respecto al modelo base, sin detallar los valores absolutos del base en cada partición.

## Limitaciones y advertencias

- Los resultados de benchmarks están marcados como no verificados (`verified: false`) en el model-index; deben tratarse como declaraciones del autor pendientes de validación independiente.
- El ajuste se orienta a inglés (con énfasis en acento nigeriano); el rendimiento en otros idiomas o acentos no está documentado y podría degradarse.
- Riesgo de alucinación inherente a los modelos Whisper: pueden generar texto plausible en segmentos con silencio, ruido o audio ininteligible.
- WER de 14,44% en AMI Cleaned indica margen de error apreciable en habla conversacional multihablante con solapamientos.
- No se documentan sesgos específicos ni la composición del dataset de ajuste, lo que dificulta evaluar sesgos demográficos o dialectales.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad de validación en producción recae en el integrador.
- El repositorio ocupa 31,0 GB, lo que sugiere la presencia de artefactos adicionales (checkpoints, logs de TensorBoard) más allá de los pesos del modelo.
- Sin capacidades de tool calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo ASR.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/igunosalabs/Unose-Huen-Small
- Repositorio GitHub oficial: https://github.com/Igunosa-Labs/unose-huen
- Modelo hermano (Base 74M): https://huggingface.co/igunosalabs/Unose-Huen-Base
- Modelo TTS de la suite: https://huggingface.co/igunosalabs/Unose-Voice-v1.0
- Modelo base: https://huggingface.co/openai/whisper-small
- Issue de evaluación en Open ASR Leaderboard: https://github.com/huggingface/open_asr_leaderboard/issues/262
