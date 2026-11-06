# NicoDeVargas/whisper-turbo-oral-reading-v0

## Resumen

Whisper turbo oral reading v0 es un ajuste fino de `openai/whisper-large-v3-turbo` desarrollado por NicoDeVargas para transcripción literal (verbatim) de lecturas en voz alta de niños. Forma parte de Fluente, una herramienta de evaluación de fluidez lectora oral que calcula palabras correctas por minuto en aulas de habla portuguesa. El problema que aborda es concreto: los modelos ASR generales están entrenados para producir texto limpio, lo que en evaluación lectora oculta errores, hesitaciones y falsos arranques que el docente necesita ver.

El modelo conserva la arquitectura transformer encoder-decoder de Whisper, con el encoder congelado y solo el decoder entrenado durante una época sobre 4.224 lecturas sintéticas (aproximadamente 9,8 horas). Cuenta con 808.878.080 parámetros y mantiene la ventana de audio de 30 segundos propia de la familia Whisper large-v3-turbo. Es relevante ahora porque demuestra que un ajuste fino ligero, ejecutable en una GPU de consumo en 18 minutos, puede mejorar la fidelidad verbatim frente a APIs comerciales en un dominio educativo específico.

La versión es experimental (v0): entrenamiento y evaluación usan voces sintéticas de adultos, no voces reales de niños, por lo que sus resultados en producción educativa real aún no están validados. La licencia es MIT y los pesos están en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo), encoder congelado en el ajuste fino |
| Parametros totales | 808.878.080 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio de 30 s por chunk; en inferencia se segmenta en tramos de <=25 s cortando en las pausas más largas |
| Tipos de cuantizacion | no disponible (repo en safetensors fp16; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | pt (pt-BR), en (en-US) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `openai/whisper-large-v3-turbo` y mantiene su arquitectura transformer encoder-decoder con atención estándar. En el ajuste fino se congeló el encoder y se entrenó únicamente el decoder durante 1 época, con learning rate 1e-5, batch efectivo de 16 y precisión fp16, sobre una única RTX 2060 Super de 8 GB en 18 minutos. El objetivo de entrenamiento es la transcripción literal del habla, incluyendo errores de lectura, en lugar del texto normalizado habitual en ASR.

Los datos de entrenamiento son 4.224 lecturas sintéticas (aproximadamente 9,8 horas) de 90 pasajes originales escritos para este fin y disjuntos del benchmark: 60 pasajes en pt-BR y 30 en en-US, para grados 1 a 5. Aproximadamente dos tercios de las lecturas contienen errores inyectados: pseudopalabras mal leídas, sustituciones de palabras, omisiones, repeticiones, falsos arranques con autocorrección y hesitaciones. Las etiquetas son el texto hablado verbatim. El audio se sintetizó con varias voces TTS neuronales, con velocidad y tono aleatorizados. No se documenta RLHF ni DPO.

Una innovación operativa destacable es la estrategia de segmentación en inferencia: el audio largo se divide en segmentos de 25 segundos o menos cortando en las pausas más largas, porque el troceado fijo de 30 segundos producía texto duplicado en los límites de chunk con este modelo. Además, el modelo no emite tokens de timestamp; las marcas temporales por palabra se obtienen de la atención cruzada mediante `return_timestamps="word"`.

## Capacidades

- Reconocimiento automático del habla en modo verbatim: transcribe lo que se dijo, incluyendo errores, hesitaciones y falsos arranques.
- Detección implícita de errores de lectura: pseudopalabras, sustituciones, omisiones, repeticiones y autocorrecciones quedan reflejadas en la transcripción.
- Conservación de hesitaciones: 21 de 25 en el benchmark, frente a 10 de 25 del modelo base.
- Transcripción multilingüe limitada a portugués brasileño e inglés estadounidense.
- Marcas temporales a nivel de palabra mediante atención cruzada (`return_timestamps="word"`).
- Integración directa con el pipeline `automatic-speech-recognition` de Transformers.
- No soporta tool calling ni function calling.
- No está diseñado como agente multi-paso ni dispone de modo de razonamiento explícito.
- No procesa visión ni audio más allá de la ventana de 30 s por chunk (requiere segmentación externa).

## Casos de uso

- Evaluación de fluidez lectora en aula: el modelo transcribe la lectura de un pasaje y permite calcular palabras correctas por minuto conservando los errores reales, que es precisamente lo que la métrica necesita medir.
- Detección de errores específicos de decodificación: al mantener pseudopalabras y sustituciones, permite a la aplicación señalar qué palabra se leyó mal y compararla con la clave de respuestas del pasaje.
- Registro de hesitaciones y autocorrecciones: útil para evaluar fluidez y prosodia, ya que el modelo conserva el doble de hesitaciones que el modelo base en el benchmark.
- Investigación educativa en portugués e inglés: permite procesar corpus de lecturas grabadas y obtener transcripciones literales para análisis de errores a escala.
- Prototipado de asistentes de alfabetización: la inferencia cabe en una GPU de consumo y el ajuste fino se reproduce en menos de 20 minutos, lo que facilita iterar sobre nuevos pasajes y voces.
- Pipeline de evaluación con revisión docente: el modelo actúa como primera pasada automática y el docente confirma o corrige, generando etiquetas a nivel de palabra para futuras versiones.
- Comparación de motores ASR en dominio educativo: sirve como referencia open source frente a APIs comerciales bajo una alineación determinista común.

## Benchmarks y rendimiento

Resultados del autor en el Fluente benchmark: 125 lecturas guionizadas de 25 pasajes (pt-BR y en-US), con clave de respuestas conocida y sin que ni las voces ni los pasajes se vieran en entrenamiento. Precisión y recall se refieren a los errores de lectura que la aplicación señala frente a la clave.

| Motor | Precision de errores | Recall de errores | Media \|Δ palabras correctas\| | Pseudopalabras "corregidas" por ASR | Hesitaciones conservadas |
|---|---|---|---|---|---|
| AssemblyAI Universal-3.5 Pro (comercial) | 93% | 94% | 0,16 | 10/25 | 10/25 |
| whisper-large-v3-turbo (sin ajuste) | 91% | 95% | 0,18 | 8/25 | 10/25 |
| **este modelo** | 84% | 97% | 0,30 | 6/25 | 21/25 |
| whisper-small (sin ajuste) | 68% | 94% | 0,70 | 9/25 | 9/25 |
| whisper-small (mismo ajuste) | 68% | 98% | 0,66 | 4/25 | 15/25 |
| wav2vec2-large-xlsr-53 (pt / en) | 28% | 97% | 3,42 | 6/25 | 1/25 |

Lectura de los datos: el ajuste fino hace el modelo más verbatim (conserva el doble de hesitaciones y convierte menos pseudopalabras en palabras reales), a costa de una caída de precisión del 91% al 84% y un aumento del error medio de palabras correctas de 0,18 a 0,30. El modelo base turbo es mejor para exactitud de recuento de palabras; este modelo es mejor para capturar lo que el niño dijo realmente. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible, y no proceden para un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: el ajuste fino se entrenó en una RTX 2060 Super de 8 GB, por lo que la inferencia en fp16 cabe holgadamente en 8 GB; con cuantización a 8 bits cabría en GPUs de 4-6 GB (no documentado por el autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB para fp16; A100, H100 o RTX 4090 para mayor throughput en lote.
- Cabe en GPU de consumo: sí, el propio autor entrenó en una RTX 2060 Super de 8 GB.
- Opciones de despliegue: pipeline `automatic-speech-recognition` de Transformers (documentado); vLLM, llama.cpp, Ollama o TGI no están documentados para este modelo y Whisper no es un modelo de texto generativo estándar, por lo que su soporte no está garantizado.
- Latencia y throughput: no disponibles. El único dato de tiempo es el entrenamiento (18 minutos en una RTX 2060 Super).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-turbo-oral-reading-v0 | 808,9 M | 30 s por chunk (segmentación a <=25 s) | ASR verbatim ajustado para lectura oral | MIT | Hugging Face |
| openai/whisper-large-v3-turbo | ~809 M (misma base) | 30 s por chunk | ASR general, texto normalizado | MIT (upstream) | Hugging Face |
| whisper-small (ajustado al mismo dominio) | ~244 M | 30 s por chunk | ASR verbatim con menos capacidad | MIT (upstream) | Hugging Face |
| AssemblyAI Universal-3.5 Pro | no disponible | no disponible | ASR comercial | propietaria | API comercial |
| wav2vec2-large-xlsr-53 (pt/en) | no disponible | no disponible | ASR CTC | no disponible | Hugging Face |

En el benchmark del autor, este modelo lidera en recall de errores (97%) y conservación de hesitaciones (21/25), mientras que el modelo base turbo y la API comercial mantienen mejor precisión (91% y 93%) y menor desviación en palabras correctas (0,18 y 0,16 frente a 0,30).

## Limitaciones y advertencias

- Sin niños reales: entrenamiento y evaluación usan voces sintéticas de adultos; el rendimiento con habla infantil real es desconocido y probablemente peor. Es una v0 que valida el método, no una herramienta de evaluación validada.
- No debe usarse para tomar decisiones de alto impacto sobre un menor sin revisión docente del resultado.
- Trade-off de precisión: señala más errores inexistentes que el modelo base (precisión 84% frente a 91%), lo que puede generar falsos positivos en la aplicación.
- El modelo no emite tokens de timestamp; las marcas por palabra dependen de la atención cruzada y pueden ser menos fiables.
- La segmentación fija de 30 s produce texto duplicado en los límites de chunk; es obligatorio segmentar en pausas (<=25 s).
- Cobertura lingüística limitada a pt-BR y en-US; no se documenta soporte de otras variantes de portugués ni de otros idiomas.
- Sesgos conocidos: no documentados por el autor; al entrenar con TTS de adultos, puede presentar sesgo hacia patrones prosódicos adultos.
- Riesgo de alucinación: inherente a los modelos Whisper; en este ajuste se mitiga parcialmente para pseudopalabras, pero persiste en audio ruidoso o fuera de dominio.
- Licencia MIT: permite uso comercial, pero la responsabilidad sobre decisiones educativas recae en el implementador.
- El siguiente paso declarado es entrenar con lecturas revisadas por docentes bajo consentimiento familiar y el art. 14 de la LGPD de Brasil; hasta entonces, no hay métrica de acuerdo con docentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NicoDeVargas/whisper-turbo-oral-reading-v0
- Dataset de evaluación: https://huggingface.co/datasets/NicoDeVargas/fluente-oral-reading-benchmark
- Repositorio Fluente: https://github.com/NicoDeVargas/fluente-assistente-de-alfabetiza-o
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
