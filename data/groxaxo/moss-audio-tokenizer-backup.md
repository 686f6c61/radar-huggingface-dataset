# groxaxo/MOSS-Audio-Tokenizer-backup

## Resumen

MOSS-Audio-Tokenizer es un tokenizador de audio discreto desarrollado por el equipo OpenMOSS, presentado en el artículo "MOSS-Audio-Tokenizer: Scaling Audio Tokenizers for Future Audio Foundation Models". Se basa en la arquitectura **Cat** (Causal Audio Tokenizer with Transformer) y escala hasta 1.600 millones de parámetros, actuando como una interfaz discreta unificada que combina reconstrucción de calidad sin pérdidas con alineación semántica de alto nivel. El repositorio analizado (`groxaxo/MOSS-Audio-Tokenizer-backup`) es una copia de seguridad del modelo original, con pesos en safetensors y código remoto que replica el módulo `transformers.models.moss_audio_tokenizer`.

El modelo comprime audio en bruto a 24 kHz en una tasa de tramas de solo 12,5 Hz, usando un cuantizador vectorial residual (RVQ) de 32 capas que permite bitrates variables entre 0,125 kbps y 4 kbps. A diferencia de otros tokenizadores que dependen de codificadores preentrenados como HuBERT o Whisper, Cat se entrena completamente desde cero sobre 3 millones de horas de audio diverso (habla, efectos de sonido y música), con optimización conjunta de codificador, cuantizador, decodificador, discriminador y un LLM solo-decodificador para alineación semántica.

Su relevancia actual radica en que proporciona una interfaz discreta robusta y semánticamente rica para modelos fundacionales de audio nativos, facilitando tareas posteriores como ASR y TTS, además de soportar inferencia en streaming de baja latencia gracias a su arquitectura causal pura basada en transformers.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cat (Causal Audio Tokenizer with Transformer), transformer causal puro sin CNN |
| Parámetros totales | 1.774.566.400 (codificador + decodificador) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (contexto causal definido por `causal_transformer_context_duration`) |
| Tipos de cuantización | no disponible (pesos en safetensors; RVQ de 32 capas con bitrates de 0,125 a 4 kbps) |
| Idiomas soportados | no disponible (evaluado en inglés y chino para métricas de habla) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MOSS-Audio-Tokenizer emplea una arquitectura homogénea "CNN-free" compuesta íntegramente por bloques de transformer causal, tanto en el codificador como en el decodificador. El cuantizador es un RVQ de 32 capas que permite decodificar con subconjuntos de capas (por ejemplo, las primeras 8) para ajustar el bitrate y la calidad. La tasa de bajada (downsample rate) es de 1920 muestras, lo que a 24 kHz resulta en 12,5 tramas por segundo. El modelo soporta streaming mediante el argumento `chunk_duration`, con la restricción de que el chunk debe ser menor o igual a la duración de contexto del transformer causal y que `chunk_duration * sampling_rate` sea divisible por el downsample rate; el streaming solo admite `batch_size=1`.

El entrenamiento se realizó desde cero sobre 3 millones de horas de audio general, sin depender de codificadores preentrenados ni de destilación de modelos profesor. Todos los componentes (codificador, cuantizador, decodificador, discriminador y un LLM solo-decodificador para alineación semántica) se optimizaron conjuntamente en un único pipeline de entrenamiento. No se especifican en la información disponible detalles sobre el uso de RLHF o DPO.

## Capacidades

- Tokenización discreta de audio a 24 kHz con tasa de tramas de 12,5 Hz y compresión extrema.
- Reconstrucción de alta fidelidad con bitrates variables entre 0,125 kbps y 4 kbps mediante RVQ de 32 capas.
- Codificación y reconstrucción de dominios diversos: habla, efectos de sonido y música.
- Representación semántico-acústica unificada, adecuada para tareas posteriores de comprensión (ASR) y generación (TTS).
- Inferencia en streaming de baja latencia gracias a la arquitectura causal y al parámetro `chunk_duration`.
- Decodificación parcial con subconjuntos de capas RVQ para ajustar calidad y ancho de banda.
- No se mencionan capacidades de tool calling, agentes, visión ni audio-texto directo; el modelo es un tokenizador, no un modelo generativo de texto.

## Casos de uso

- **Compresión de audio para transmisión de baja latencia**: el modelo puede codificar audio en bruto a 12,5 tramas por segundo y decodificarlo en streaming con chunks configurables, lo que lo hace adecuado para videollamadas o transmisión en vivo donde el ancho de banda es limitado.
- **Preprocesamiento para modelos de ASR**: al generar tokens discretos semánticamente ricos, se puede usar como interfaz de entrada para modelos de reconocimiento de habla que operen sobre tokens discretos en lugar de espectrogramas.
- **Síntesis de voz (TTS) basada en tokens**: los tokens discretos del tokenizador sirven como objetivo o entrada para modelos generativos de voz, permitiendo pipelines de TTS que reconstruyen audio de alta fidelidad a partir de representaciones discretas.
- **Generación de música y efectos de sonido**: al entrenarse sobre audio general, puede tokenizar y reconstruir música y efectos, útil en herramientas de producción musical asistida por IA o generación de audio condicionada.
- **Almacenamiento eficiente de audio**: la compresión a bitrates de hasta 0,125 kbps permite archivar grandes volúmenes de audio con pérdida controlada, útil en sistemas de registro de llamadas o archivos de medios.
- **Investigación en modelos fundacionales de audio**: proporciona una interfaz discreta unificada para experimentos con modelos de lenguaje aplicados a audio, facilitando la integración con arquitecturas transformer existentes.
- **Evaluación de calidad de codecs**: su RVQ de 32 capas y decodificación parcial permiten analizar el compromiso entre bitrate y calidad de reconstrucción en entornos de investigación.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa de calidad de reconstrucción frente a otros tokenizadores de audio de código abierto. Los datos disponibles en la información proporcionada son parciales (la tabla se corta en la fila de Higgs Audio Tokenizer). Se reproducen las filas completas disponibles:

| Modelo | bps | Tasa de tramas | Nq | SIM habla ↑ (EN/ZH) | STOI habla ↑ (EN/ZH) | PESQ-NB habla ↑ (EN/ZH) | PESQ-WB habla ↑ (EN/ZH) | Mel-Loss audio/música ↓ | STFT-Dist. audio/música ↓ |
|---|---|---|---|---|---|---|---|---|---|
| XCodec2.0 | 800 | 50 | 1 | 0,82 / 0,74 | 0,92 / 0,86 | 3,04 / 2,46 | 2,43 / 1,96 | -- / -- | -- / -- |
| MiMo Audio Tokenizer | 850 | 25 | 4 | 0,80 / 0,74 | 0,91 / 0,87 | 2,94 / 2,62 | 2,39 / 2,14 | 0,82 / 0,81 | 2,33 / 2,23 |
| Higgs Audio Tokenizer | 1000 | 25 | 4 | no disponible (tabla truncada) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado en la información disponible los resultados completos de MOSS-Audio-Tokenizer en esta tabla ni otros benchmarks como MMLU, HumanEval o GSM8K, que no aplican a un tokenizador de audio.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 1.774 millones de parámetros en safetensors (aproximadamente 7,1 GB en FP16), se requieren al menos 8 GB de VRAM para cargar el modelo completo en precisión media; en FP32, alrededor de 14 GB.
- **GPU recomendadas**: NVIDIA A100 (40/80 GB), H100, RTX 4090 (24 GB) para inferencia cómoda; RTX 3090 (24 GB) también es viable.
- **¿Cabe en GPU de consumo?**: sí, en GPUs con 8 GB o más de VRAM en FP16, como RTX 3070/4060 Ti o superiores; en cuantizaciones más agresivas (no documentadas) podría caber en 6 GB.
- **Opciones de despliegue**: al ser un módulo de `transformers` con `trust_remote_code=True`, se puede usar con la librería estándar de Hugging Face; no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- **Latencia y throughput**: no disponibles en la información proporcionada; el modelo soporta streaming con chunks de hasta la duración de contexto causal, lo que sugiere latencias controladas, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Tasa de tramas | Bitrate | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-Audio-Tokenizer (Cat) | 1.774 M | 12,5 Hz | 0,125–4 kbps | Apache 2.0 | Hugging Face (repo backup y original OpenMOSS-Team) |
| XCodec2.0 | no disponible | 50 Hz | 800 bps | no disponible | no disponible en la información |
| MiMo Audio Tokenizer | no disponible | 25 Hz | 850 bps | no disponible | no disponible en la información |
| Higgs Audio Tokenizer | no disponible | 25 Hz | 1000 bps | no disponible | no disponible en la información |

La comparativa se limita a los datos de la tabla de benchmarks de la model card; no se dispone de información sobre parámetros, licencia o disponibilidad de los modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- **Sesgos conocidos**: no se documentan sesgos específicos en la información disponible; al entrenarse sobre 3 millones de horas de audio general, puede heredar sesgos presentes en los datos de entrenamiento (habla, música y efectos).
- **Riesgo de alucinación**: como tokenizador, no genera texto libre, pero la reconstrucción puede introducir artefactos o pérdida de información en bitrates muy bajos (0,125 kbps) o con subconjuntos reducidos de capas RVQ.
- **Limitaciones de contexto o idioma**: el contexto causal está limitado por `causal_transformer_context_duration`; el streaming solo admite `batch_size=1`. No se especifican idiomas soportados más allá de las evaluaciones en inglés y chino.
- **Restricciones de licencia**: licencia Apache 2.0, que permite uso comercial con atribución; sin embargo, el repositorio es un backup no oficial (`groxaxo/MOSS-Audio-Tokenizer-backup`) y se recomienda usar el repositorio original `OpenMOSS-Team/MOSS-Audio-Tokenizer` para producción.
- **Caveats para producción**: el modelo requiere `trust_remote_code=True`, lo que implica ejecutar código remoto; el streaming tiene restricciones de divisibilidad y batch size; no se documentan cuantizaciones oficiales ni integraciones con servidores de inferencia de alto rendimiento.

## Enlaces

- Repositorio Hugging Face (backup): https://huggingface.co/groxaxo/MOSS-Audio-Tokenizer-backup
- Repositorio original (referenciado en la model card): https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer
- Artículo: https://arxiv.org/abs/2602.10934
- No se han encontrado otros enlaces (blogs, repos, demos) en la información proporcionada.
