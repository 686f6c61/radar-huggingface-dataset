# phonsobon/Whisper-Small-Khmer-Final-v5

## Resumen

Whisper-Small-Khmer-Final-v5 es un modelo de reconocimiento automático del habla (ASR) desarrollado por el usuario phonsobon, consistente en un ajuste fino (fine-tuning) del modelo Whisper Small de OpenAI especializado en el idioma jemer (khmer). El modelo parte de la variante phonsobon/Whisper-Small-Khmer-V2-Gov y se entrena sobre una colección extensa de datasets propios orientados a ASR en jemer, con algo de cobertura en inglés. Con 241,7 millones de parámetros, se posiciona como una alternativa ligera para transcripción en un idioma de bajos recursos como el jemer, donde los modelos multilingües genéricos suelen rendir de forma deficiente.

La relevancia del modelo radica en su enfoque específico: frente a Whisper Small original, que cubre 99 idiomas pero con calidad desigual, este ajuste concentra el entrenamiento en jemer y en datos gubernamentales y de dominio público recopilados por el autor. El repositorio ocupa 29 GB, lo que refleja la inclusión de múltiples checkpoints y artefactos de entrenamiento, no solo los pesos finales. El acceso está restringido (gated), por lo que es necesario aceptar las condiciones en Hugging Face antes de descargarlo.

La licencia Apache 2.0 permite uso comercial, aunque los resultados publicados por el autor (CER de 0,55 y WER de 3,11 sobre un conjunto de evaluación propio) indican que el rendimiento dista de ser production-ready para transcripción general, y deben interpretarse con cautela al no estar verificados de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Small) |
| Parametros totales | 241.734.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | jemer (km), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Whisper Small de OpenAI: un transformer encoder-decoder con aproximadamente 241 millones de parámetros, diseñado para recibir espectrogramas Mel de audio de hasta 30 segundos y generar transcripciones token a token. Whisper utiliza atención multi-cabeza estándar y un vocabulario multilingüe de tipo BPE; en este caso, el ajuste fino se ha orientado hacia jemer e inglés. No se dispone de información detallada sobre el número exacto de tokens de audio empleados ni sobre la composición precisa del dataset de entrenamiento.

El autor declara el uso de una amplia batería de datasets propios (khmer-ASR-Datasets, Data-Gov-Mix, Datasets-Gov, ASR-kh-datasets-Gov, ASR-Date-Khm, datasets-ASR-khmer-english, openslr42-khmer-male, entre otros), lo que sugiere una mezcla de datos gubernamentales, corpus públicos y grabaciones específicas. No se documenta en la información disponible si se aplicaron técnicas de RLHF, DPO ni innovaciones como decodificación especulativa o atención lineal; el modelo hereda el mecanismo de decodificación estándar de Whisper.

## Capacidades

- Transcripción de audio a texto en jemer (km) e inglés (en).
- Reconocimiento automático del habla (pipeline automatic-speech-recognition).
- Manejo de audio de hasta 30 segundos por segmento, según la arquitectura Whisper.
- Capacidad multilingüe limitada a los dos idiomas declarados (km, en).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documenta modo de pensamiento (thinking mode), visión ni audio más allá del ASR.
- No se documenta traducción explícita entre idiomas, aunque Whisper Small base incluye tareas de traducción; el ajuste fino se orienta a transcripción.

## Casos de uso

- Transcripción de reuniones y actas administrativas en jemer: el modelo puede convertir grabaciones de reuniones gubernamentales o institucionales en texto, aprovechando el entrenamiento sobre datasets de origen gubernamental (Data-Gov-Mix, Datasets-Gov).
- Subtitulado de contenido audiovisual en jemer: útil para plataformas de vídeo o medios que necesiten generar subtítulos automáticos en un idioma con pocos recursos ASR, aunque la calidad debe validarse por segmento.
- Digitalización de archivos orales: transcripción de entrevistas, testimonios o archivos históricos en jemer para su indexación y búsqueda textual.
- Asistentes de voz para atención al ciudadano: integración en sistemas de atención telefónica o chat de voz en jemer, con la cautela de que el WER declarado exige revisión humana.
- Investigación lingüística y corpus: generación de transcripciones preliminares para estudios de fonética o lingüística computacional del jemer, que luego se corrigen manualmente.
- Evaluación comparativa de ASR de bajos recursos: servir como baseline ajustado para experimentos académicos sobre jemer e inglés, dado su tamaño reducido (241 M de parámetros) y licencia permisiva.
- Transcripción bilingüe jemer-inglés en contextos educativos o de negocios, aprovechando la cobertura de ambos idiomas en el ajuste fino.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Metrica | Valor |
|---|---|---|
| Khmer ASR held-out eval (576 clips de 17 datasets) | CER | 0,55 |
| Khmer ASR held-out eval (576 clips de 17 datasets) | WER | 3,11 |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 241 M de parámetros, en fp32 requiere aproximadamente 1 GB de VRAM; en fp16, alrededor de 0,5 GB; en cuantización de 8 bits, menos de 0,5 GB (estimación basada en el tamaño de parámetros, no en mediciones publicadas).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; RTX 3060, RTX 4060, RTX 4090, así como A100 o H100 para despliegues por lotes a gran escala.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU para inferencia no interactiva.
- Opciones de despliegue: transformers (pipeline automatic-speech-recognition), vLLM no aplica de forma nativa a ASR, llama.cpp no soporta Whisper directamente; alternativas habituales son faster-whisper, WhisperX, Hugging Face Inference Endpoints y TGI no está orientado a ASR.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Whisper-Small-Khmer-Final-v5 | 241,7 M | km, en | 30 s (Whisper) | Apache 2.0 | Gated en Hugging Face |
| Whisper Small (OpenAI) | 244 M | 99 idiomas | 30 s | MIT | Público |
| Whisper Medium (OpenAI) | 769 M | 99 idiomas | 30 s | MIT | Público |
| Wav2Vec2 / XLS-R ajustados a jemer | variable | multilingüe | variable | variable | Público (según checkpoint) |

No se dispone de datos de rendimiento comparativo verificable entre estos modelos en jemer dentro de la información proporcionada; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Los resultados de CER (0,55) y WER (3,11) son elevados y no están verificados de forma independiente; un CER de 0,55 implica que más de la mitad de los caracteres podrían ser erróneos en el conjunto de evaluación declarado, lo que limita su uso directo en producción sin revisión humana.
- Riesgo de alucinación: como todo modelo Whisper, puede generar texto plausible que no corresponde al audio, especialmente en segmentos con ruido o silencios.
- Cobertura limitada a jemer e inglés; no se garantiza calidad en otros idiomas ni en code-switching intensivo.
- El conjunto de evaluación es propio y pequeño (576 clips de 17 datasets), lo que reduce la representatividad de las métricas.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede complicar la automatización de despliegues.
- El repositorio de 29 GB incluye artefactos de entrenamiento; el despliegue debe seleccionar únicamente los pesos safetensors necesarios.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios no representados en el entrenamiento.
- No se documentan sesgos específicos, pero los datasets gubernamentales y de dominio público pueden introducir sesgos de dominio, género o registro.

## Enlaces

- Hugging Face: https://huggingface.co/phonsobon/Whisper-Small-Khmer-Final-v5
- Modelo base: https://huggingface.co/phonsobon/Whisper-Small-Khmer-V2-Gov
- Dataset principal: https://huggingface.co/datasets/phonsobon/khmer-ASR-Datasets
- Dataset secundario: https://huggingface.co/datasets/phonsobon/khmer-ASR-Datasets-v1
- Repositorio Whisper de OpenAI (arquitectura base): https://github.com/openai/whisper
- Paper Whisper: https://arxiv.org/abs/2212.04356
