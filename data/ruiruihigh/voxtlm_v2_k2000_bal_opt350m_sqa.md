# RuiRuihigh/voxtlm_v2_k2000_Bal_opt350m_sqa

## Resumen

VoxtLM v2 · OPT-350M · k=2000 · Spoken QA es un ajuste fino del modelo VoxtLM v2 (época 16) orientado a respuesta de preguntas habladas (spoken question answering) sobre el corpus LibriSQA. Lo desarrolla el usuario RuiRuihigh y se apoya en la arquitectura VoxtLM original de Maiti et al. (2023), un modelo decoder-only unificado que consolida tareas de reconocimiento de voz, síntesis de voz y continuación de texto y habla en un único espacio de tokens. La relevancia de esta ficha radica en que combina habla y texto mediante un vocabulario compartido de 10k tokens, evitando la necesidad de un codificador acústico separado en tiempo de inferencia.

El modelo parte de OPT-350M (aproximadamente 350 millones de parametros) y utiliza unidades discretas de habla generadas por el Phonological Tokenizer (WavLM-large ajustado, capa 21, codebook de 2000 entradas). El ajuste se realiza sobre LibriSQA (parte train-clean-360 de LibriSpeech) con reproducción de las tareas originales de preentrenamiento (ASR, LM de texto, TTS y LM de unidades de habla) para limitar el olvido catastrófico. El checkpoint final (`valid.acc.best.pth`) corresponde a la época 18, con una precisión de validación de 0,731 y pérdida de 1,122.

La licencia es la de OPT (uso exclusivamente no comercial en investigación), lo que restringe su explotación en producción. Es un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, pensado para investigación en comprensión de habla y evaluación de modelos de lenguaje sobre modalidad acústica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OPT-350M) con vocabulario unificado de texto y unidades discretas de habla |
| Parametros totales | Aproximadamente 350 millones (segun el nombre del modelo; no se detalla cifra exacta) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye en precision completa, `valid.acc.best.pth`) |
| Idiomas soportados | en (ingles) |
| Licencia | OPT license (licencia `other`), uso no comercial en investigacion |
| Formato de pesos | PyTorch checkpoint (`.pth`) para la libreria espnet |
| Tamano del repo | 1,3 GB (pesos: 1,26 GB) |
| Modelo base | RuiRuihigh/voxtlm_v2_k2000_Bal_opt350m (epoca 16) |
| Checkpoint de publicacion | Epoca 18, `valid.acc.best.pth` (acc validacion 0,731, loss 1,122) |
| Codebook de habla | Phonological Tokenizer, 2000 clusters (WavLM-large, capa 21) |
| Vocabulario de texto | SentencePiece unigram BPE, 10k tokens |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VoxtLM: un transformer decoder-only que procesa una secuencia unificada de tokens de texto y unidades discretas de habla. La tokenizacion de audio se apoya en el Phonological Tokenizer (arXiv:2601.19781), un WavLM-large ajustado cuya capa 21 alimenta un codebook de 2000 entradas obtenido por k-means. Las unidades discretas se mapean a caracteres CJK y despues se codifican con el mismo BPE de 10k del texto, de modo que habla y texto comparten un unico vocabulario. El formato de entrenamiento usado es `<startofspeech> unidades <startoftext> question: Q <generatetext> respuesta`.

El ajuste fino se realiza sobre LibriSQA con dos partes: la Parte I contiene respuestas abiertas (media de unos 38 tokens BPE) y la Parte II es eleccion multiple, donde el objetivo de perdida es el texto de la opcion correcta (media de unos 16 tokens BPE), no una letra ni una explicacion. Ambas partes comparten el audio de train-clean-360 y se entrenan conjuntamente. Se añaden datos de reproduccion (25k ejemplos de ASR, 25k de LM de texto, 10k de TTS y 5k de LM de unidades de habla) para conservar las capacidades originales. La distribucion de tokens de perdida es: SQA Parte I 37,0 %, Parte II 15,6 %, ASR 13,0 %, unit LM 14,9 %, TTS 11,4 % y text LM 8,1 %. El optimizador es Adam con learning rate 1e-4, warmup de 300 pasos, `batch_bins` 10000 con `accum_grad` 20, 2000 iteraciones por epoca y hasta 30 epocas. El conjunto de desarrollo usa 17 hablantes retenidos sin solapamiento con entrenamiento.

## Capacidades

- Respuesta de preguntas habladas (spoken QA): el modelo recibe una pregunta en formato de unidades discretas de habla y genera la respuesta en texto.
- Eleccion multiple sobre habla: puntua cada opcion mediante `log P(texto de la opcion | habla, pregunta)` y selecciona la de mayor puntuacion.
- Reproduccion de tareas de preentrenamiento: reconocimiento automatico de voz (ASR), modelado de lenguaje de texto y de unidades de habla, y sintesis de texto a voz (TTS), preservadas mediante datos de replay.
- Modalidad unica unificada: texto y habla comparten el mismo vocabulario de 10k tokens, sin necesidad de un encoder acustico separado en inferencia.
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al ingles (`en`).
- No se documenta modo de razonamiento explicito (thinking mode), vision ni audio de salida mas alla del TTS de preentrenamiento.

## Casos de uso

- Investigacion en comprension de habla: evaluar hasta que punto un LM decoder-only entrenado con unidades discretas puede responder preguntas sobre contenido hablado, usando LibriSQA Parte II como banco de pruebas con 2620 preguntas y 4 opciones.
- Evaluacion de robustez multimodal: emplear la condicion de calibracion (A-calib, restando la puntuacion con habla vacia) para medir la dependencia real del audio frente al sesgo del texto de la pregunta.
- Sistemas de respuesta a preguntas por voz en dominio acotado: transcripcion y respuesta sobre audiolibros o contenido de dominio especifico, aprovechando que el modelo procesa la senal como unidades discretas.
- Reproduccion de experimentos VoxtLM: servir como punto de partida (checkpoint epoca 18) para comparar variantes de ajuste fino sobre spoken QA con distintos esquemas de replay.
- Investigacion sobre olvido catastrofico: analizar como influye la mezcla de tareas de replay (ASR, TTS, LM) en la retencion de capacidades al ajustar sobre una tarea nueva.
- Base para destilacion o adaptacion a otros dominios de QA hablado: el formato de prompt `<startofspeech> ... <startoftext> question: ... <generatetext>` permite reentrenar sobre otros corpus con codificacion equivalente.
- Analisis linguistico de representaciones acusticas: estudiar el comportamiento de un codebook de 2000 unidades (WavLM capa 21) como entrada de un LM textual.

## Benchmarks y rendimiento

Evaluacion en el test de LibriSQA Parte II (eleccion multiple, 2620 preguntas, 4 opciones). Cada opcion se puntua con `log P(texto de la opcion | habla, pregunta)`. El azar es aproximadamente 25 % y la clase mayoritaria alcanza el 32 %.

| Metodo de puntuacion | Base zero-shot (epoca 16) | Este modelo |
|---|---|---|
| Log-probabilidad normalizada por longitud (A-norm) | 38,44 % | 40,46 % |
| Calibrada (A-calib: menos la puntuacion con habla vacia) | 35,73 % | 46,76 % |
| Sin entrada de habla (control de sanidad) | no disponible | 21,45 % |

La fila "sin habla" confirma que las respuestas dependen del audio: al eliminar la senal, la precision cae hasta el nivel del azar.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 1,26 GB en el formato distribuido (probablemente fp32); la inferencia en fp32 requiere aproximadamente 2-3 GB de VRAM contando activaciones y cache de claves/valores.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para una sola secuencia; una RTX 3060/4060 o superior es suficiente.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna de consumo (RTX 20/30/40, e incluso integradas con suficiente memoria compartida).
- Opciones de despliegue: la libreria oficial es espnet (`python -m espnet2.bin.lm_inference`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y al ser un checkpoint `.pth` de espnet no es directamente compatible con esos servidores sin conversion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de tablas comparativas con otros modelos en la informacion proporcionada. Se puede contextualizar frente a referencias genericas, pero sin cifras verificables:

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VoxtLM v2 OPT-350M SQA (este) | ~350 M | no disponible | Spoken QA (LibriSQA) | OPT (no comercial) | HuggingFace (RuiRuihigh) |
| VoxtLM v2 OPT-350M (base) | ~350 M | no disponible | ASR, TTS, continuacion texto/habla | OPT (no comercial) | HuggingFace (RuiRuihigh) |
| OPT-350M | ~350 M | 2048 (referencia publica) | Generacion de texto | OPT | HuggingFace (facebook) |

Los datos de rendimiento de las alternativas en la misma tarea de spoken QA no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no comercial: los pesos derivan de OPT y estan sujetos a la OPT license, que restringe el uso a investigacion. Tambien aplican las licencias de los datos de entrenamiento (LibriSpeech, LibriTTS, LibriLight, VCTK, LibriSQA) y del Phonological Tokenizer.
- Riesgo de alucinacion: como LM generativo, puede producir respuestas plausibles pero incorrectas; la evaluacion calibrada (46,76 %) indica un margen de error considerable.
- Dependencia del audio verificada: sin entrada de habla la precision cae al azar (21,45 %), lo que sugiere que el modelo no puede responder bien solo con el texto de la pregunta.
- Rendimiento modesto en eleccion multiple: incluso con calibracion, la precision (46,76 %) queda lejos de un techo practico, y el metodo A-norm apenas mejora al base (40,46 % frente a 38,44 %).
- Idioma unico: solo ingles.
- Longitud de contexto no documentada: limita el diseno de aplicaciones con entradas largas.
- Ambito de tarea estrecho: el ajuste esta especializado en spoken QA sobre LibriSQA; fuera de ese dominio el comportamiento no esta caracterizado.
- Reproducibilidad: no se incluye el estado del optimizador (`checkpoint.pth`) ni los datos de entrenamiento, lo que dificulta reproducir exactamente el ajuste.
- Infraestructura: requiere espnet y codificacion manual del audio con el Phonological Tokenizer y su codebook; no es plug-and-play con stacks estandar de inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RuiRuihigh/voxtlm_v2_k2000_Bal_opt350m_sqa
- Modelo base: https://huggingface.co/RuiRuihigh/voxtlm_v2_k2000_Bal_opt350m
- Receta de entrenamiento en GitHub: https://github.com/RuiRuihigh/espnet/tree/voxtlm_v1_v2_experiments/egs2/voxtlm_v2/lm1_k2000_Bal_sqa
- Paper VoxtLM (arXiv:2309.07937): https://arxiv.org/abs/2309.07937
- Phonological Tokenizer (Sony, arXiv:2601.19781): https://huggingface.co/Sony/Phonological-Tokenizer
- Licencia OPT: https://github.com/facebookresearch/metaseq/blob/main/projects/OPT/MODEL_LICENSE.md
