# Ease3/Xiaomi-CocktailASR-1

## Resumen

Xiaomi-CocktailASR-1 es un modelo de reconocimiento automático del habla (ASR) orientado a un objetivo concreto (*target-speaker ASR*, TS-ASR) publicado por el autor Ease3 en HuggingFace y asociado a un repositorio de Xiaomi Research. El modelo recibe dos entradas: un fragmento de audio de referencia del hablante objetivo y un audio mezclado (o de un único hablante), y devuelve la transcripción únicamente de ese hablante, ignorando el resto de voces presentes en la mezcla.

El autor lo describe como un *SpeechLLM*, es decir, un modelo de lenguaje aplicado a voz que combina representaciones acústicas con decoding autorregresivo, e incluye dos capacidades destacables: el rechazo de muestras negativas (si el hablante de referencia no aparece en el audio, devuelve salida vacía) y un modo de razonamiento encadenado (*chain-of-thought*) que expone el resultado como `<think>...</think><answer>...</answer>`.

Es relevante porque ataca el llamado «problema del cóctel» desde la perspectiva de la transcripción selectiva, un escenario poco cubierto por los ASR clásicos, que asumen un único hablante o exigen un pipeline previo de diarización y separación. El repositorio pesa 35,6 GB (lo que sugiere pesos en *bfloat16* de gran tamaño), pero la información pública disponible no detalla el número de parámetros, la longitud de contexto ni la licencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SpeechLLM (modelo de lenguaje aplicado a voz, con reconocimiento de hablante objetivo); detalle interno no disponible |
| Parámetros totales | no disponible (el repositorio ocupa 35,6 GB, lo que apunta a un modelo de gran tamaño en *bfloat16*, cifra no confirmada por el autor) |
| Parámetros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el ejemplo oficial carga en `torch_dtype="bfloat16"`; no se publican pesos GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | pesos de PyTorch para `transformers` con `trust_remote_code=True` (requiere código personalizado del repositorio); formatos adicionales no disponibles |

## Arquitectura y entrenamiento

La model card define el modelo como un *SpeechLLM* de ASR para hablante objetivo. La interfaz pública es una llamada `model(target.wav, ref_speaker.wav)` que, según el autor, concatena internamente la referencia, un segundo de silencio y el audio objetivo antes de generar la transcripción. Esto implica, como mínimo, un codificador acústico que procesa audio concatenado y un decodificador de tipo lenguaje que produce texto de forma autorregresiva, con algún mecanismo de condicionamiento sobre la identidad del hablante de referencia. No se especifican en la información disponible el tipo de encoder, el backbone de lenguaje, la profundidad, la dimensionalidad ni el mecanismo exacto de condicionamiento por hablante.

Tampoco hay datos publicados sobre el volumen de tokens de entrenamiento, la composición del dataset, la proporción de audio multihablante frente a monohablante, ni sobre si se aplicaron fases de ajuste por instrucciones, RLHF o DPO. La descripción del repositorio de Xiaomi Research indica únicamente que el modelo se entrenó con datos multihablante a gran escala y que alcanza resultados de estado del arte en varios conjuntos de evaluación multihablante, manteniendo un rendimiento comparable a los ASR monohablante convencionales en escenarios de un solo hablante. Se trata de una afirmación cualitativa del autor, sin cifras asociadas en la información disponible.

## Capacidades

- Transcripción selectiva de hablante objetivo: dada una referencia de voz y un audio mezclado, transcribe solo al hablante de referencia.
- Funcionamiento sobre audio monohablante: según el autor, mantiene un rendimiento comparable al de ASR monohablante convencionales.
- Rechazo de muestras negativas: si el hablante de referencia no está presente en el audio, el modelo devuelve salida vacía en lugar de transcribir a otra persona.
- Modo de razonamiento encadenado: con `cot=True` genera una traza de razonamiento y la respuesta final separadas mediante etiquetas `<think>` y `<answer>`.
- Integración con `transformers` mediante `AutoModel.from_pretrained` y `trust_remote_code=True`.
- Entrada de audio gestionada con `torchaudio` y `soundfile` según las dependencias indicadas por el autor.
- Soporte de *tool calling* / *function calling*: no disponible.
- Soporte de agentes y razonamiento multi-paso general: no disponible (el CoT descrito está ligado a la tarea de ASR).
- Capacidades multilingües: no disponible.
- Otras modalidades (visión, audio generativo): no disponibles; el modelo es de entrada de audio y salida de texto.

## Casos de uso

- Transcripción de reuniones multihablante: en una grabación con varias personas interviniendo, se puede transcribir únicamente al hablante de interés aportando una muestra de su voz, sin necesidad de ejecutar primero un pipeline de diarización y segmentación.
- Analítica de centros de contacto: extraer solo las intervenciones del agente (o solo las del cliente) de una llamada grabada, lo que simplifica métricas de calidad, cumplimiento y detección de objeciones frente a pipelines que separan voces a posteriori.
- Postproducción de audio y subtitulado selectivo: generar subtítulos o guiones que recojan exclusivamente las líneas de un locutor concreto, útil en doblaje, documentales con voz en off y verificación de guiones.
- Filtrado y anonimización de grabaciones: al transcribir solo al hablante autorizado, se reduce la exposición de datos de terceros que aparecen de fondo o en conversaciones cruzadas.
- Detección de presencia de un hablante concreto: el rechazo de muestras negativas permite usar el modelo como verificador (salida vacía = hablante ausente), por ejemplo para auditar si una persona participó realmente en una reunión o en un fragmento de audio.
- Preanotación de corpus para investigación en el problema del cóctel: generar transcripciones etiquetadas por hablante a partir de mezclas, como paso previo a entrenar o evaluar modelos de separación de fuentes.
- Asistentes de voz con micrófono en entornos ruidosos: la etiqueta `mic_asr` del repositorio y el condicionamiento por voz de referencia encajan en escenarios de captura con micrófono abierto donde interesa ignorar voces no objetivo.
- Accesibilidad auditiva: transcripción personalizada de la voz de un interlocutor concreto en conversaciones presenciales, cuando el resto del ruido de fondo degrada la comprensión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La descripción del repositorio de Xiaomi Research afirma que el modelo alcanza el estado del arte en varios conjuntos de evaluación multihablante y que iguala a los ASR monohablante principales en escenarios de un solo hablante, pero no se acompaña de cifras (WER, MMLU, HumanEval, GSM8K ni equivalentes) ni de la lista concreta de conjuntos de prueba.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 35,6 GB, por lo que los pesos en *bfloat16* requieren del orden de 36 GB de VRAM solo para el modelo, más el *KV cache* y las activaciones. En la práctica se necesitan GPUs de 40 GB o más.
- GPUs recomendadas: A100 80 GB o H100 80 GB para un despliegue cómodo; A100 40 GB puede ser insuficiente según la longitud de audio y el tamaño del *prompt*, con riesgo de OOM.
- Cabe en GPU de consumo: no de forma directa. Una RTX 4090 o RTX 3090 (24 GB) no puede alojar los pesos en *bfloat16*; no hay versiones cuantizadas publicadas oficialmente, por lo que sería necesario aplicar cuantización manual o reparto entre CPU y GPU, con la consiguiente pérdida de velocidad.
- Despliegue: los ejemplos oficiales usan `transformers` con `trust_remote_code=True` sobre `torch`, `torchaudio` y `soundfile`. Se puede repartir el modelo con `accelerate`/`device_map="auto"`. Compatibilidad con vLLM, TGI, llama.cpp u Ollama: no disponible (el uso de código personalizado hace que la compatibilidad no esté garantizada).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la información proporcionada (ni parámetros, ni contexto, ni WER de este modelo). La tabla siguiente recoge únicamente la comparación funcional con alternativas de la misma categoría; los datos de los modelos alternativos provienen de conocimiento público general y conviene verificarlos en sus fichas oficiales.

| Modelo | Enfoque | Parámetros | Contexto / ventana de audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xiaomi-CocktailASR-1 | Target-speaker ASR con rechazo de muestras negativas y CoT | no disponible | no disponible | no disponible | HuggingFace con `trust_remote_code` |
| Whisper large-v3 (OpenAI) | ASR monohablante multilingüe | 1,55 mil millones | ventanas de 30 s con *chunking* | MIT | pesos abiertos, amplio ecosistema (whisper.cpp, faster-whisper, vLLM) |
| Pipeline diarización + ASR (por ejemplo, pyannote + Whisper) | Diarización de hablantes seguida de ASR por segmento | depende del ASR elegido | depende del ASR elegido | depende de cada componente | requiere orquestar varios modelos |
| ASR monohablante genérico | Transcripción sin condicionamiento por hablante | no disponible | no disponible | no disponible | no disponible |

La diferencia funcional clave es que Xiaomi-CocktailASR-1 resuelve la selección de hablante dentro del propio modelo, mientras que la alternativa convencional delega esa tarea en un sistema de diarización previo o en etiquetado manual.

## Limitaciones y advertencias

- La licencia no está especificada en la información disponible; no se puede asumir uso comercial libre hasta que el autor la publique.
- No se declara el conjunto de idiomas soportados; no hay garantía de comportamiento multilingüe ni de calidad fuera de los idiomas de entrenamiento.
- No hay cifras de WER publicadas, ni por tipo de ruido, ni por relación señal-ruido, ni por solapamiento entre hablantes, por lo que el rendimiento real en producción es difícil de estimar.
- El funcionamiento depende de la calidad del clip de referencia: no se documenta la duración mínima o recomendada, ni la sensibilidad a ruido, canal o emociones en la referencia.
- El rechazo de muestras negativas puede producir falsos negativos (salida vacía cuando el hablante sí está presente), un riesgo crítico si se usa como verificador de identidad.
- Riesgo de alucinación inherente a los modelos generativos de audio a texto: transcripciones plausibles pero incorrectas, especialmente en audio muy degradado o con solapamiento severo.
- El modo CoT añade tokens de razonamiento y, por tanto, latencia y coste computacional; no se documenta su impacto en la precisión.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código publicado en el repositorio del autor; conviene auditar ese código antes de desplegarlo en producción.
- El tamaño del repositorio (35,6 GB) descarta el despliegue en GPUs de consumo sin cuantización manual, y no se ofrecen pesos cuantizados oficiales.
- No se documentan sesgos demográficos, de acento o de género, ni el proceso de evaluación en esos ejes.
- No se especifica el contexto máximo de audio procesable de una sola vez, lo que dificulta planificar la segmentación de grabaciones largas.
- Las fechas de creación y actualización del repositorio (agosto de 2026) indican que se trata de una publicación muy reciente, con posible inestabilidad en la API y en las dependencias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ease3/Xiaomi-CocktailASR-1
- Repositorio de Xiaomi Research: https://github.com/xiaomi-research/xiaomi-cocktailasr-1/tree/main/
