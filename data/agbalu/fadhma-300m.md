# agbalu/Fadhma-300M

## Resumen

Fadhma-300M es un modelo de reconocimiento automático del habla (ASR) especializado en cabilio (taqbaylit, código ISO `kab`), una lengua bereber del norte de Argelia escrita en alfabeto latino. Lo desarrolla el autor independiente `agbalu` y se publica con licencia Apache-2.0. El modelo resuelve un problema de nicho pero técnicamente relevante: dotar a una lengua de bajos recursos de un sistema de transcripción con una tasa de error medida sobre hablantes nunca vistos durante el entrenamiento, algo que, según el autor, no se había publicado antes para el cabilio.

Arquitectónicamente es un modelo CTC puro (wav2vec2) de 315,5 millones de parámetros, afinado a partir del codificador SSL de Meta `ylacombe/omniASR_W2V_300M_SSL`, que ya incluía `kab_Latn` entre las 1.668 lenguas de su preentrenamiento. La decisión de usar CTC en lugar de un encoder-decoder es deliberada: un decodificador con modelo de lenguaje interno puede alucinar frases fluidas que nadie pronunció, lo que contaminaría corpus lingüísticos con procedencia falsa. CTC puede equivocarse, pero no inventar oraciones.

Su relevancia actual reside en la combinación de un tamaño contenido (300M), licencia permisiva, salida en ortografía canónica cabilia y un resultado medido de forma honesta sobre un split disjunto por hablante de Common Voice 22.0 (15.003 clips, 888 hablantes). El modelo está pensado como pieza de una cadena más amplia de NLP para cabilio, alimentando modelos de texto del mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 con cabeza CTC (encoder transformer con front-end convolucional) |
| Parametros totales | 315.482.152 (311.287.848 entrenables, 4.194.304 congelados) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio fija de 30 s en el pipeline estándar; clips medios de 3,463 s) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | cabilio (`kab`, Taqbaylit), alfabeto latino |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 1,4 GB) |

## Arquitectura y entrenamiento

El modelo parte del codificador SSL de Meta `ylacombe/omniASR_W2V_300M_SSL` y le añade una cabeza CTC. La red tiene 24 capas, dimensión oculta de 1.024 y 16 cabezas de atención (tamaño de cabeza 64), con feed-forward de 4.096 y activación GELU. El front-end consta de 7 convoluciones (kernels 10,3,3,3,3,2,2; strides 5,2,2,2,2,2,2), produciendo un frame cada 20 ms. El extractor convolucional de 7 capas (4.194.304 parámetros) permanece congelado durante el ajuste fino, de modo que la representación acústica preentrenada se preserva y solo se adapta la parte superior.

El vocabulario CTC tiene 40 clases: `[PAD]`, `[UNK]`, el separador de palabra `|`, 36 letras cabilias y el guion. La pérdida es CTC con `ctc_zero_infinity=True`. El entrenamiento se realizó sobre 144,31 horas de habla leída, con transcripciones reparadas previamente para que la salida quede en ortografía canónica cabilia. La decodificación se complementa con un modelo de lenguaje de 5-gramas construido a partir de tres millones de frases cabilias normalizadas, aplicado mediante shallow fusion. No se documenta en la información disponible el uso de RLHF, DPO ni otras etapas de alineación, algo esperable en un modelo ASR.

## Capacidades

- Transcripción de voz a texto en cabilio, con salida en ortografía latina canónica.
- Decodificación CTC greedy (sin modelo de lenguaje) y beam search con shallow fusion de 5-gramas.
- Manejo de las particularidades ortográficas del cabilio, incluidos pronombres objeto y partículas direccionales unidos con guion (`-d`, `-n`, `-awen`, `-iw`).
- Salida directamente consumible por modelos de texto del mismo autor (Amrouche-1.3B, Masinissa-31M) sin paso de reparación ortográfica.
- No soporta tool calling, function calling, razonamiento multi-paso ni capacidades de agente: es un modelo puramente acústico.
- No tiene capacidades de visión, audio generativo, thinking mode ni traducción.
- Monolingüe: no transcribe ninguna lengua distinta del cabilio.

## Casos de uso

- Transcripción de notas de voz: el modelo convierte mensajes de audio en cabilio a texto canónico, adecuado para aplicaciones de mensajería o asistentes locales donde se requiere latencia baja y un modelo de 300M desplegable en CPU o GPU modesta.
- Archivado de historia oral: entrevistas y grabaciones de tradición oral cabilia pueden transcribirse en lote para su indexación y búsqueda; la naturaleza CTC evita que se inserten frases inventadas en el archivo.
- Subtitulado de emisiones de radio o televisión en cabilio: con filtrado previo de voz (VAD) para separar música y ruido, el modelo genera transcripciones alineadas a frames que pueden servir de base para subtítulos revisados por humanos.
- Generación de corpus para NLP de bajos recursos: la transcripción de las 571 horas de habla validada del proyecto convierte audio en texto, alimentando el entrenamiento de modelos de lenguaje cabilios como Amrouche-1.3B o Masinissa-31M sin necesidad de reparación ortográfica.
- Entrada de voz para asistentes y teclados predictivos en cabilio: integrado en el pipeline ASR de una aplicación, permite dictado y búsqueda por voz en una lengua que los sistemas comerciales no cubren.
- Investigación lingüística y fonética: la alineación por frames propia de CTC facilita el análisis de correspondencias entre señal acústica y grafemas, útil para estudiar fenómenos ortográficos como la unión con guiones.
- Preprocesado para traducción o análisis de sentimiento: las transcripciones canónicas pueden pasar directamente a un modelo de texto para tareas posteriores de traducción cabilio-español o clasificación de contenido.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de Common Voice 22.0 en cabilio (15.003 clips, 16,00 horas, 888 hablantes no vistos en otros splits). Ningún resultado está verificado por un tercero (`verified: false`).

| Decodificacion | CER (%) | WER (%) |
|---|---|---|
| Beam search con shallow fusion de 5-gramas | 8,01 | 25,65 |
| CTC greedy, sin modelo de lenguaje | 8,53 | 30,12 |

El modelo de lenguaje aporta 4,5 puntos de WER y 0,5 de CER, lo que refleja su función: prefiere grafías que sean palabras reales, pero no corrige sonidos mal oídos. La divergencia entre CER y WER se explica estructuralmente por la ortografía cabilia: un guion escrito como espacio cuenta como un error de carácter y dos de palabra.

El autor no incluye tabla comparativa deliberadamente. La cifra de CER 6,2 que circula para cabilio corresponde a un modelo de 7B con decodificador LLM (Omnilingual ASR de Meta), 23 veces más parámetros y una arquitectura distinta. La comparación honesta sería `facebook/omniASR-CTC-300M`, del mismo tamaño y licencia, pero nadie lo ha evaluado en cabilio.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB en FP32 (315M parámetros), alrededor de 0,65 GB en FP16 y menos de 0,4 GB en INT8, sin contar activaciones y buffers de audio.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas o CPU para uso por lotes.
- GPU recomendadas para producción de alto throughput: A100, H100 o L4 para procesar grandes volúmenes de audio en paralelo; para uso individual basta una GPU modesta.
- Opciones de despliegue: el pipeline `automatic-speech-recognition` de Transformers; vLLM no aplica a modelos CTC de este tipo; llama.cpp y Ollama no ofrecen soporte estándar para wav2vec2 CTC; TGI no está orientado a ASR. Para decodificación con shallow fusion de 5-gramas se requiere un harness externo tipo pyctcdecode con el modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada. Con clips medios de 3,463 s y una ventana fija de 30 s, el pipeline estándar procesa audio más corto que la ventana, lo que el autor señala como ineficiencia de cómputo (solo el 11,5 % de la ventana es señal en el caso medio).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/ventana | CER cabilio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Fadhma-300M | 315M | ventana fija 30 s | 8,01 (beam + 5-gramas) | Apache-2.0 | HuggingFace |
| facebook/omniASR-CTC-300M | ~300M | ventana fija 30 s | no evaluado en cabilio | Apache-2.0 | HuggingFace |
| Omnilingual ASR 7B (LLM decoder) | ~7B | no disponible | 6,2 (reportado en tabla per-language) | no disponible | no disponible |
| Whisper (referencia del autor) | no disponible | ventana fija 30 s | refutado por medición: 6 de 10 letras cabilias sin token, fertilidad 3,3600 tokens/palabra | no disponible | no disponible |

La comparación directa más justa es con `facebook/omniASR-CTC-300M`: mismo tamaño, misma licencia y misma familia arquitectónica, pero sin resultados publicados en cabilio. El modelo de 7B de Meta logra mejor CER, pero con 23 veces más parámetros y un decodificador LLM que el autor descarta por riesgo de alucinación en la generación de corpus.

## Limitaciones y advertencias

- Monolingüe: no es adecuado para ninguna lengua distinta del cabilio.
- Sensible a ruido: el autor advierte que no debe usarse con audio con música de fondo intensa o ruido sin un filtrado previo de actividad vocal (VAD).
- Sin evaluación de seguridad de ningún tipo: no se ha realizado ningún análisis de sesgos, robustez adversarial ni comportamiento en dominios sensibles.
- Riesgo de alucinación bajo pero no nulo: CTC puede equivocarse en la transcripción, aunque no puede inventar oraciones completas como un decoder autorregresivo. Aun así, las transcripciones en contextos médicos, legales o de seguridad requieren revisión humana.
- Divergencia CER/WER estructural: la ortografía cabilia con guiones infla el WER; un 25,65 % de WER con 8,01 % de CER debe interpretarse con cautela según la tarea.
- Resultados no verificados: las métricas del model-index están marcadas como `verified: false` y proceden del propio autor.
- Dependencia de un modelo de lenguaje externo para el mejor resultado: la decodificación greedy degrada el WER a 30,12 %, por lo que un despliegue sin el 5-gramas pierde calidad.
- Licencia Apache-2.0: permite uso comercial, pero el usuario debe asumir la ausencia de garantías y de evaluaciones de seguridad.
- Sin soporte documentado para cuantización GGUF/INT8 ni para motores de inferencia de alto throughput como vLLM, lo que limita opciones de despliegue estándar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agbalu/Fadhma-300M
- Modelo base (codificador SSL de Meta): https://huggingface.co/ylacombe/omniASR_W2V_300M_SSL
- Modelo de texto del mismo autor (Amrouche-1.3B): https://huggingface.co/agbalu/Amrouche-1.3B
- Modelo de texto del mismo autor (Masinissa-31M): https://huggingface.co/agbalu/Masinissa-31M
- Comparación directa sugerida por el autor: https://huggingface.co/facebook/omniASR-CTC-300M
- Dataset de evaluación (Common Voice 22.0): https://huggingface.co/datasets/fsicoli/common_voice_22_0
