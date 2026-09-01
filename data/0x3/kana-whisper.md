# 0x3/kana-whisper

## Resumen

Kana Whisper es un modelo de reconocimiento automático del habla (ASR) desarrollado por el equipo de SB Intuitions, aunque esta versión concreta está publicada bajo el usuario 0x3 en Hugging Face. Se trata de un fine-tuning de Whisper large-v3-turbo de OpenAI, especializado en transcribir voz japonesa directamente a secuencias de katakana, en lugar de producir texto con kanji. Esta salida en katakana es deliberada: el modelo se diseñó como componente del Joyo Kanji Yomi Benchmark, un marco de evaluación sistemática de la precisión de lectura de kanji en sistemas de síntesis de voz (TTS) japoneses, y sirve de base para la métrica Kana CER (Kana Character Error Rate) propuesta en el artículo Sarashina2.2-TTS.

El modelo tiene 808,88 millones de parámetros, hereda la arquitectura encoder-decoder de Whisper large-v3-turbo y está disponible bajo licencia MIT, lo que permite uso comercial sin restricciones. Su relevancia actual radica en que ofrece una herramienta específica para medir la calidad de pronunciación de kanji en TTS, un problema complejo debido a la polifonía de los caracteres japoneses. Aunque no es un ASR de propósito general, su salida en katakana lo hace útil para tareas de evaluación y depuración de sistemas de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (Whisper large-v3-turbo) |
| Parametros totales | 808.878.080 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Ventana de audio de 30 segundos (típica de Whisper) |
| Tipos de cuantizacion | No disponible (repo solo con safetensors; existen conversiones GGML de otros autores) |
| Idiomas soportados | Japonés (ja) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Kana Whisper se basa en Whisper large-v3-turbo, un modelo de reconocimiento de voz de tipo encoder-decoder con atención completa, entrenado por OpenAI sobre 680.000 horas de audio débilmente supervisado. El fine-tuning realizado por SB Intuitions adapta el modelo para que su salida sea exclusivamente katakana, eliminando la generación de kanji. No se han publicado detalles sobre el dataset de fine-tuning ni sobre el número de tokens de entrenamiento, pero el modelo se enmarca en el proyecto Sarashina2.2-TTS, donde se utiliza para calcular la tasa de error de caracteres kana (Kana CER) en la evaluación de TTS. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; el entrenamiento es un fine-tuning supervisado estándar sobre pares audio-texto en katakana.

## Capacidades

- Transcripción de voz japonesa a secuencias de katakana, incluyendo alargamientos vocálicos (p. ej., "キョーワイイテンキデスネ").
- Reconocimiento de habla con ventana de audio de 30 segundos, suficiente para frases y oraciones cortas.
- Integración con el pipeline de Transformers de Hugging Face para ASR.
- Salida determinista en katakana, útil para comparar con transcripciones de referencia en evaluaciones de TTS.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales más allá del audio.
- No es multilingüe: solo procesa japonés.

## Casos de uso

- Evaluación de sistemas TTS japoneses: se utiliza como componente de la métrica Kana CER para medir la precisión de lectura de kanji en audio sintetizado. El modelo transcribe la salida del TTS a katakana y se compara con la transcripción kana de referencia.
- Depuración de modelos de síntesis de voz: los desarrolladores pueden usar Kana Whisper para identificar errores de pronunciación de kanji polifónicos en sus sistemas, aislándolos de otros errores de ASR.
- Generación de subtítulos en katakana para contenido audiovisual japonés, especialmente útil en aplicaciones educativas o de accesibilidad donde se prefiere la escritura fonética.
- Creación de datasets de entrenamiento para TTS: al transcribir audio a katakana, se pueden generar etiquetas fonéticas para entrenar modelos de síntesis que necesiten representaciones sin ambigüedad de pronunciación.
- Verificación de calidad en pipelines de doblaje o locución: comparar la salida del modelo con la transcripción esperada permite detectar errores de entonación o lectura en grabaciones profesionales.
- Investigación en lingüística computacional: análisis de la relación entre la escritura kana y la pronunciación real en japonés, aprovechando la salida fonética del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo se presenta como herramienta de evaluación, pero no se incluyen métricas como WER, CER o comparaciones con otros ASR en la model card ni en los resultados de búsqueda.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 809M parámetros. En fp16, los pesos ocupan aproximadamente 1,6 GB, pero con activaciones y overhead se recomiendan al menos 3-4 GB de VRAM para inferencia en GPU.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 4090, o GPUs de datacenter como A10, A100 o H100. También puede ejecutarse en CPU con suficiente RAM (el repo pesa 3,2 GB en fp32).
- Cabe en GPUs de consumo: sí, con cuantización o incluso en fp16 en GPUs de gama media.
- Opciones de despliegue: pipeline de Transformers (como se muestra en la model card), también se puede usar con whisper.cpp si se convierte a GGML (existen conversiones de otros autores, aunque no oficiales para este repo). No es habitual usar vLLM o TGI para modelos Whisper.
- Latencia y throughput: no disponible. Al ser un modelo de 809M parámetros, la inferencia en GPU moderna es rápida (típicamente <1 segundo por audio de 30 segundos), pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 0x3/kana-whisper | 809M | 30s audio | Katakana (ja) | MIT | Hugging Face |
| openai/whisper-large-v3-turbo | 809M | 30s audio | Texto multilingüe (incluye kanji) | MIT | Hugging Face |
| openai/whisper-large-v3 | 1.55B | 30s audio | Texto multilingüe | MIT | Hugging Face |
| ReazonSpeech (japonés) | ~300M | 30s audio | Texto (kanji/kana) | Apache 2.0 | Hugging Face |

La principal diferencia de Kana Whisper frente a los modelos Whisper originales es su salida restringida a katakana, lo que lo hace inadecuado para transcripción general pero óptimo para tareas de evaluación fonética. Frente a ReazonSpeech, un ASR japonés de propósito general, Kana Whisper no compite en cobertura, sino que se posiciona como herramienta especializada.

## Limitaciones y advertencias

- Solo transcribe japonés y solo produce katakana; no genera kanji ni otros sistemas de escritura.
- No es un ASR de propósito general: su uso fuera de la evaluación de TTS o tareas que requieran salida fonética es limitado.
- Puede cometer errores en nombres propios, dialectos o habla no estándar, ya que el fine-tuning probablemente se centró en habla limpia y clara.
- No se han publicado métricas de rendimiento (WER, CER) ni análisis de sesgos, por lo que su precisión en entornos ruidosos o con acentos regionales es desconocida.
- La ventana de 30 segundos limita el procesamiento de audio más largo; para clips extensos se requiere segmentación previa.
- Aunque la licencia MIT permite uso comercial, el modelo se distribuye sin garantías y sin soporte oficial.
- El repositorio 0x3/kana-whisper parece ser una re-subida del modelo original de SB Intuitions (sbintuitions/kana-whisper); se recomienda verificar la procedencia antes de usarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/0x3/kana-whisper
- Artículo arXiv (Sarashina2.2-TTS): https://arxiv.org/abs/2606.25369
- Benchmark Joyo Kanji Yomi: https://github.com/sbintuitions/Joyo-Kanji-Yomi-Benchmark
- Modelo Sarashina2.2-TTS: https://huggingface.co/sbintuitions/sarashina2.2-tts
- Modelo original de SB Intuitions (referenciado en la model card): https://huggingface.co/sbintuitions/kana-whisper
