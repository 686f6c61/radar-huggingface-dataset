# rohansheth/tiro-qwen3-asr-1.7b-ffasr-v1

## Resumen

El modelo `rohansheth/tiro-qwen3-asr-1.7b-ffasr-v1` es un ajuste fino (fine-tune) del modelo de reconocimiento automático de voz (ASR) Qwen3-ASR-1.7B, desarrollado por el autor independiente rohansheth. Su objetivo principal es mejorar el rendimiento en escenarios de campo lejano (far-field), es decir, cuando la fuente de audio está a distancia del micrófono y la señal sufre reverberación y ruido ambiental. El modelo se presentó al Far-Field ASR Leaderboard de Treble Technologies, una plataforma de evaluación especializada en este tipo de tareas.

El ajuste se realizó únicamente sobre el encoder de audio y el proyector multimodal del modelo base, dejando intacto el decodificador de lenguaje. Para el entrenamiento se utilizaron datos sintéticos generados mediante la convolución de habla anecoica (LibriTTS) y ruido (MUSAN) con respuestas de impulso de sala (RIR) del dataset AcousticRooms, que incluye 260 salas y 132 000 RIR. Esta técnica permite simular condiciones acústicas realistas de campo lejano sin necesidad de grabaciones reales.

El modelo tiene aproximadamente 2 040 millones de parámetros (2,04 B) y está licenciado bajo Apache 2.0, lo que facilita su uso comercial y su integración en aplicaciones de producción. Aunque el modelo base Qwen3-ASR soporta 52 idiomas, este ajuste se ha entrenado exclusivamente con datos en inglés, por lo que su capacidad multilingüe queda limitada a ese idioma.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (encoder de audio + proyector + decodificador de lenguaje), basado en Qwen3-Omni |
| Parametros totales | 2 038 052 480 (aprox. 2,04 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (entrenado solo con datos en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-ASR-1.7B, que a su vez se basa en la arquitectura de Qwen3-Omni, un modelo multimodal que combina un encoder de audio, un proyector y un decodificador de lenguaje. En este fine-tune solo se actualizaron los pesos del encoder de audio (`audio_tower`) y del proyector multimodal (`multi_modal_projector`), mientras que el decodificador de lenguaje permaneció congelado. Esta estrategia reduce el coste de entrenamiento y preserva las capacidades lingüísticas del modelo base.

El entrenamiento se realizó con datos sintéticos de campo lejano. Se tomaron muestras de habla del conjunto `train.clean.360` de LibriTTS (con duración mínima de 2 segundos) y ruido del corpus MUSAN, y se convolucionaron con respuestas de impulso de sala del dataset AcousticRooms, que contiene 260 salas y 132 000 RIR. Este proceso genera señales de audio que simulan condiciones de reverberación y ruido típicas de entornos reales con micrófonos lejanos. No se menciona el uso de técnicas de RLHF o DPO; se trata de un ajuste supervisado convencional.

## Capacidades

- Reconocimiento de voz en campo lejano: el modelo está específicamente entrenado para transcribir audio captado a distancia, con presencia de reverberación y ruido de fondo.
- Robustez acústica: gracias al aumento de datos con RIR y ruido, tolera mejor las degradaciones acústicas que el modelo base sin ajustar.
- Transcripción de audio en inglés: genera texto a partir de audio en inglés, incluyendo habla con acentos y condiciones variables.
- Integración con el ecosistema Qwen3-ASR: al compartir la arquitectura base, puede utilizarse con las mismas herramientas de inferencia y pipelines que el modelo original.
- No soporta identificación de idioma ni otros idiomas, ya que el entrenamiento se limitó al inglés.
- No incluye capacidades de tool calling, agentes, visión ni modo de razonamiento explícito; es exclusivamente un modelo de ASR.

## Casos de uso

- Transcripción de reuniones en salas de conferencias: el modelo puede procesar audio captado por micrófonos de techo o de mesa, donde la distancia y la reverberación degradan la señal. Su entrenamiento con RIR de salas reales lo hace adecuado para este escenario.
- Asistentes de voz en hogares inteligentes: altavoces inteligentes que reciben comandos desde varios metros de distancia se benefician de un ASR robusto a campo lejano, mejorando la precisión en entornos con ruido doméstico.
- Subtitulado automático de vídeos grabados en exteriores o salas con acústica compleja: el modelo puede transcribir pistas de audio con ruido de fondo, como tráfico o multitudes, sin necesidad de limpieza previa.
- Sistemas de dictado en oficinas abiertas: profesionales que dictan notas en entornos con ruido ambiental (conversaciones, impresoras, etc.) obtienen transcripciones más fiables que con modelos estándar.
- Análisis de llamadas telefónicas de baja calidad: en centros de atención al cliente, el audio puede presentar distorsión y eco; el modelo es útil para transcribir y analizar estas conversaciones.
- Accesibilidad en espacios públicos: transcripción en tiempo real de anuncios o discursos en estaciones, aeropuertos o auditorios, donde los micrófonos están lejos del hablante.
- Vigilancia y seguridad: transcripción de audio de cámaras de seguridad con micrófonos integrados, que suelen captar sonido a distancia y con ruido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como WER (Word Error Rate) ni comparaciones con otros modelos. Aunque el modelo fue presentado al Far-Field ASR Leaderboard, no se proporcionan los resultados obtenidos en esa evaluación.

## Requisitos de hardware

- No se dispone de información específica sobre requisitos de VRAM o latencia en la documentación del modelo.
- Dado que el modelo tiene aproximadamente 2 040 millones de parámetros, una estimación razonable para inferencia en precisión fp16 sería de unos 4-5 GB de VRAM, y con cuantización a 8 bits podría reducirse a unos 2-3 GB. Sin embargo, estos valores son orientativos y no están confirmados por el autor.
- El tamaño del repositorio es de 12,2 GB, lo que sugiere que los pesos están almacenados en una precisión alta (posiblemente fp32 o fp16 con algún componente adicional). Para cargar el modelo en memoria se necesitará al menos esa cantidad de RAM/VRAM si no se aplica cuantización.
- Es probable que el modelo pueda ejecutarse en GPUs de consumo como la RTX 3060 (12 GB) o superiores, siempre que se utilice cuantización o se reduzca la precisión. No se mencionan herramientas de despliegue específicas, pero al ser compatible con el ecosistema Qwen3-ASR, debería funcionar con frameworks como vLLM, Hugging Face Transformers o llama.cpp (si se convierte a GGUF).

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| tiro-qwen3-asr-1.7b-ffasr-v1 (este) | 2,04 B | Inglés | No disponible | Apache 2.0 | Fine-tune para campo lejano |
| Qwen3-ASR-1.7B (base) | 1,7 B | 52 idiomas y dialectos | No disponible | Apache 2.0 | Modelo original, sin ajuste de campo lejano |
| Whisper large-v3 | 1,5 B | 99 idiomas | 30 segundos de audio | MIT | ASR generalista, no optimizado para campo lejano |

No se dispone de datos de rendimiento comparativo (WER, etc.) entre estos modelos en la información proporcionada. La comparación se limita a características arquitectónicas y de licencia.

## Limitaciones y advertencias

- El modelo solo reconoce inglés; no soporta otros idiomas ni dialectos, a diferencia del modelo base que cubre 52 idiomas.
- El entrenamiento se realizó con datos sintéticos (convolución con RIR), por lo que puede no generalizar perfectamente a todas las condiciones acústicas reales, especialmente aquellas muy diferentes a las simuladas.
- No se han publicado evaluaciones en benchmarks estándar de ASR, por lo que su rendimiento real en tareas generales es desconocido.
- Al ser un fine-tune del encoder y proyector, las capacidades del decodificador de lenguaje son las del modelo base, que pueden presentar alucinaciones o errores en contextos de audio ambiguos.
- La licencia Apache 2.0 permite uso comercial, pero es necesario revisar las licencias de los datasets utilizados (LibriTTS, MUSAN, AcousticRooms) para asegurar el cumplimiento en aplicaciones de producción.
- El modelo tiene 0 descargas y 0 likes en Hugging Face, lo que indica que no ha sido ampliamente probado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rohansheth/tiro-qwen3-asr-1.7b-ffasr-v1
- Modelo base Qwen3-ASR-1.7B-hf: https://huggingface.co/Qwen/Qwen3-ASR-1.7B-hf
- Repositorio GitHub de Qwen3-ASR: https://github.com/QwenLM/Qwen3-ASR
- Informe técnico de Qwen3-ASR (arXiv): https://arxiv.org/abs/2601.21337
- Paper de Treble10 (arXiv): https://arxiv.org/abs/2510.23141
- Paper de MUSAN (arXiv): https://arxiv.org/abs/1510.08484
- Paper de LibriTTS (DOI): https://doi.org/10.21437/Interspeech.2019-2441
- Dataset AcousticRooms (GitHub): https://github.com/facebookresearch/AcousticRooms
