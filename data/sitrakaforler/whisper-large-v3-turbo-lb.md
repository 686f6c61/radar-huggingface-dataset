# SitrakaForler/whisper-large-v3-turbo-lb

## Resumen

whisper-large-v3-turbo-lb es un ajuste fino mediante LoRA del modelo de reconocimiento automático del habla openai/whisper-large-v3-turbo, especializado en luxemburgués (Lëtzebuergesch, código ISO `lb`). Lo desarrolla Sitraka Forler y se publica con licencia MIT, con el objetivo explícito de ofrecer una receta reproducible de adaptación a un idioma de bajos recursos usando únicamente datos abiertos: las 2.502 locuciones (8,5 horas) del split de entrenamiento de FLEURS `lb_lu`, bajo licencia CC-BY-4.0.

El modelo resuelve un problema concreto: los Whisper originales son prácticamente inservibles en luxemburgués cero-disparo (WER del 90,1 % en el subconjunto de evaluación), mientras que este ajuste baja al 29,5 % en ese mismo subconjunto y al 30,15 % de WER y 8,82 % de CER sobre el split de test completo de FLEURS (934 locuciones). Con 808.878.080 parámetros, hereda la arquitectura encoder-decoder de Whisper en su variante turbo (encoder profundo con decoder reducido), lo que mantiene la latencia baja y permite ejecución local en CPU o en una única GPU de consumo.

Su relevancia actual es doble: por un lado sirve como referencia metodológica (receta LoRA, scripts de evaluación y normalizador de texto publicados en GitHub) para quien necesite adaptar ASR a una lengua minoritaria con pocas horas de audio; por otro, incluye una prueba de robustez frente a audio recomprimido a Opus 16 kbit/s, el escenario típico de notas de voz de WhatsApp, donde el WER sube al 35,0 %. El autor advierte que no supera a los modelos de uni.lu (WER 26,1 %) ni de ZLS (28,6 %), ambos entrenados con muchas más horas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper, variante turbo del base openai/whisper-large-v3-turbo) |
| Parametros totales | 808.878.080 (pesos safetensors del repositorio) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | ventana de audio de 30 s por segmento (procesamiento por chunks, `chunk_length_s=30`); sin contexto de texto largo |
| Tipos de cuantizacion | fp16 (entrenamiento y checkpoint publicado); int8 mediante exportación a CTranslate2 en el repo `whisper-large-v3-turbo-lb-ct2`; GGUF no publicado |
| Idiomas soportados | luxemburgues (`lb`); el entrenamiento se realizo solo con FLEURS `lb_lu` |
| Licencia | MIT |
| Formato de pesos | safetensors (Transformers); CTranslate2 en repositorio separado |

## Arquitectura y entrenamiento

La base es Whisper large-v3-turbo, un transformer encoder-decoder con espectrograma log-Mel como entrada y decodificación autorregresiva de tokens de texto, en el que el decoder se reduce a muy pocas capas frente al encoder para abaratar la inferencia manteniendo la calidad del encoder acústico. Sobre esa arquitectura se aplicó un adaptador LoRA con r=32, alpha=64 y dropout 0,05 en las proyecciones q/k/v/out y en las dos capas MLP de todos los bloques, es decir, un ajuste de bajo rango sobre prácticamente toda la red.

El entrenamiento usó exclusivamente el split de train de FLEURS `lb_lu`: 2.502 locuciones, 8,5 horas de habla leída (frases de Wikipedia leídas en voz alta), con las entidades HTML de las transcripciones desescapadas y los clips de más de 30 s eliminados. Se realizaron 3 épocas (468 pasos) con lr 1e-4, batch efectivo 16, fp16 y gradient checkpointing, en una sola GPU T4 durante 2,1 horas. El checkpoint conservado es `checkpoint-468`, seleccionado por menor WER en el split de dev (408 locuciones, usadas solo para selección): el WER de dev evolucionó de 39,0 % (época 1) a 31,8 % (época 2) y 30,1 % (época 3). No se usó audio de RTL, uni.lu ni ZLS, ni audio raspado de la web. No consta RLHF ni DPO: es un ajuste supervisado puro sobre transcripciones.

## Capacidades

- Reconocimiento automático del habla en luxemburgués a partir de audio de 16 kHz, con salida de texto plano.
- Marcas de tiempo (`return_timestamps=True`) para alineación y subtitulado.
- Procesamiento de audio largo mediante chunking de 30 s en el pipeline de Transformers.
- Selección explícita de idioma y tarea mediante `generate_kwargs={"language": "lb", "task": "transcribe"}`.
- Exportación a CTranslate2 int8 para inferencia en CPU con `faster_whisper`, incluyendo filtro VAD (`vad_filter=True`).
- Robustez evaluada frente a audio recomprimido a Opus 16 kbit/s mono (condición tipo WhatsApp), con degradación medida de WER 29,5 % a 35,0 % en el subconjunto de 300 locuciones.
- No soporta tool calling, function calling, agentes, visión, audio generation ni razonamiento multi-paso: es un modelo puramente ASR.
- Capacidad multilingüe: no verificada. El ajuste se realizó solo en luxemburgués y no se han publicado evaluaciones en otros idiomas.

## Casos de uso

- Actas de reunión en luxemburgués: el modelo está pensado para alimentar una aplicación de notas de reunión que corre localmente, transcribiendo audio de 30 s por chunk con marcas de tiempo para segmentar por hablante de forma manual.
- Transcripción de notas de voz de mensajería: la evaluación específica con Opus 16 kbit/s (WER 35,0 %) lo hace adecuado para audio de WhatsApp o Telegram, donde los modelos genéricos fallan por la compresión.
- Subtitulado de vídeo en luxemburgués: las marcas de tiempo por segmento permiten generar archivos de subtítulos y ajustar duraciones sin un alineador forzado adicional.
- Archivística y documentación pública: digitalización de grabaciones en luxemburgués (sesiones, comunicados, material educativo) con un coste de inferencia muy bajo, ejecutable en CPU con int8.
- Investigación en lenguas de bajos recursos: sirve como línea base reproducible (receta LoRA, normalizador `lb_text.py`, scripts `benchmark.py`, `evaluate.py` y `fill_card.py`) para comparar futuros ajustes con presupuesto de 8,5 horas de audio.
- Prototipado y demos en local: 809 M de parámetros en fp16 (aproximadamente 1,6 GB de pesos) permiten desplegar el modelo en un portátil o en una estación de trabajo sin GPU dedicada, usando `faster-whisper` en int8.
- Herramientas de aprendizaje del idioma: transcripción de ejercicios orales de estudiantes de luxemburgués con salida de texto para corrección automática o comparación con una referencia.
- Preetiquetado de datasets: generación automática de transcripciones preliminares sobre audio luxemburgués nuevo, que después se revisan y corrigen manualmente para ampliar corpus.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente, `verified: false`).

Split de test completo de FLEURS `lb_lu` (934 locuciones, Transformers, decodificación greedy):

| Metrica | Valor |
|---|---:|
| WER | 30,15 % |
| CER | 8,82 % |

Subconjunto de comparación de 300 locuciones (113 frases distintas), mismo audio, mismas referencias y mismo normalizador:

| Modelo | Backend | WER % limpio | WER % Opus 16 kbit/s | CER % limpio | s / min de audio (T4) |
|---|---|---:|---:|---:|---:|
| openai/whisper-large-v3-turbo (cero-disparo) | Transformers | 90,1 | 95,6 | 36,0 | 1,5 |
| openai/whisper-small (cero-disparo) | Transformers | 100,9 | 105,5 | 50,7 | 1,2 |
| whisper-large-v3-turbo-lb (este modelo) | Transformers | 29,5 | 35,0 | 8,6 | 1,4 |
| unilux/whisper-medium-v1-luxembourgish | Transformers | 26,1 | 31,1 | 9,0 | 1,5 |
| ZLSCompLing/Whisper-Large-V3-Turbo-Luxembourgish | faster-whisper | 28,6 | 33,9 | 11,4 | 2,7 |

Notas del autor: el WER cuenta sustituciones, deleciones e inserciones respecto al número de palabras de referencia, por lo que un modelo que emite más palabras de las debidas (repeticiones, alucinaciones, otro idioma) puede superar el 100 %. La velocidad es tiempo de reloj por minuto de audio en condición limpia sobre una GPU, con batches de 16 en Transformers y un clip a la vez en faster-whisper; depende del backend y es solo orientativa. El modelo de uni.lu se entrenó con unas 150 h y el de ZLS con unas 75 h según sus model cards, con solapamiento desconocido con FLEURS, por lo que la comparación debe tomarse como indicativa. No se ha medido por separado el WER de la exportación int8.

Evolución del WER de dev durante el entrenamiento (400 locuciones de dev, mismo normalizador):

| Paso | Epoca | WER dev % |
|---:|---:|---:|
| 156 | 1,0 | 39,0 |
| 312 | 2,0 | 31,8 |
| 468 | 3,0 | 30,1 |

## Requisitos de hardware

- VRAM estimada en fp16: en torno a 1,6 GB solo para pesos; con activaciones y batches pequeños, aproximadamente 2-4 GB. En int8 (CTranslate2) baja a unos 0,8-1 GB.
- GPU recomendadas: NVIDIA T4 (medición oficial del autor: 1,4 s por minuto de audio en condición limpia con batches de 16), RTX 3090/4090, L4, A10, A100. Cualquier GPU con 4 GB o más de VRAM es suficiente.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, e incluso en iGPU o CPU con la exportación int8.
- Despliegue: pipeline `automatic-speech-recognition` de Transformers, `faster-whisper` con CTranslate2 (`compute_type="int8"`, `device="cpu"`), y servidores tipo TGI/vLLM solo si se envuelve como tarea ASR (no es un modelo de texto generativo estándar). llama.cpp/Ollama requerirían conversión a GGUF, no publicada.
- Throughput estimado: con RTF aproximado de 0,023 en T4 (1,4 s por 60 s de audio), del orden de 40-45 minutos de audio por minuto de GPU en condición limpia; en CPU con int8 la latencia es mayor y no se ha publicado una medición.
- Entrenamiento reproducible en una única T4 durante 2,1 horas, lo que permite reajustar el modelo con recursos mínimos.

## Comparativa con modelos similares

| Modelo | Parametros | Entrenamiento en luxemburgues | WER % (subconjunto 300) | WER % Opus 16k | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| SitrakaForler/whisper-large-v3-turbo-lb | 808,9 M | 8,5 h (FLEURS `lb_lu`) | 29,5 | 35,0 | MIT | Transformers + CTranslate2 int8 |
| unilux/whisper-medium-v1-luxembourgish | ~769 M (Whisper medium) | ~150 h segun su model card | 26,1 | 31,1 | no disponible en la informacion proporcionada | Transformers |
| ZLSCompLing/Whisper-Large-V3-Turbo-Luxembourgish | ~809 M | ~75 h segun su model card | 28,6 | 33,9 | no disponible en la informacion proporcionada | solo CTranslate2 (faster-whisper) |
| openai/whisper-large-v3-turbo (cero-disparo) | ~809 M | ninguno | 90,1 | 95,6 | MIT (modelo base de OpenAI) | Transformers, CTranslate2, whisper.cpp |

Lectura: el modelo de uni.lu es el más preciso en ambos escenarios pese a tener menos parámetros, gracias a un volumen de datos de entrenamiento muy superior. Este ajuste compensa su desventaja en datos con una licencia permisiva (MIT), un CER competitivo (8,6 % frente a 9,0 % y 11,4 %) y una receta completamente reproducible. Frente al modelo cero-disparo, la mejora es de más de 60 puntos de WER.

## Limitaciones y advertencias

- Entrenado únicamente con 8,5 horas de habla leída (frases de Wikipedia leídas una a una): no se ha evaluado en habla espontánea, reuniones, solapamiento de hablantes ni cambio de código (luxemburgués con francés o alemán), escenarios que previsiblemente degradarán el WER de forma notable.
- Riesgo de alucinación y repeticiones: el propio autor advierte que un modelo puede superar el 100 % de WER si emite texto de más o cambia de idioma; con audio ruidoso o silencios largos conviene usar VAD (el benchmark no lo usó).
- El WER del 30,15 % sigue siendo alto en términos absolutos para producción; es adecuado para transcripción asistida con revisión humana, no para pipelines sin supervisión.
- No hay evaluación independiente: las métricas están marcadas como `verified: false` y proceden de los scripts del propio autor.
- La comparación con uni.lu y ZLS es indicativa: no se conoce si sus datos de entrenamiento solapan con las frases de FLEURS, y el modelo de ZLS se decodificó con otro backend (faster-whisper, float16, greedy, sin VAD).
- El rendimiento del export int8 a CTranslate2 no se midió por separado; los números publicados corresponden al modelo en Transformers fp16.
- Licencia MIT: permisiva para uso comercial, pero al derivar de FLEURS (CC-BY-4.0) conviene mantener la atribución a Conneau et al. (2022) y al dataset `google/fleurs`, tal como hace la model card.
- El modelo solo está ajustado para `lb`; forzar otros idiomas producirá salidas no verificadas, ya que no se ha evaluado la transferencia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni reportes externos de fallos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SitrakaForler/whisper-large-v3-turbo-lb
- Export CTranslate2 int8: https://huggingface.co/SitrakaForler/whisper-large-v3-turbo-lb-ct2
- Repositorio con la receta, configuración y scripts de evaluación: https://github.com/Sitraka17/lb-whisper
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Dataset FLEURS (config `lb_lu`): https://huggingface.co/datasets/google/fleurs
- Paper de FLEURS (arXiv:2205.12446): https://arxiv.org/abs/2205.12446
- Licencia CC-BY-4.0 del dataset: https://creativecommons.org/licenses/by/4.0/
- Modelo comparable de uni.lu: https://huggingface.co/unilux/whisper-medium-v1-luxembourgish
- Modelo comparable de ZLS: https://huggingface.co/ZLSCompLing/Whisper-Large-V3-Turbo-Luxembourgish

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card y del ecosistema de HuggingFace.
