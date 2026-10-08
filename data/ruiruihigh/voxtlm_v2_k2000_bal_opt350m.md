# RuiRuihigh/voxtlm_v2_k2000_Bal_opt350m

## Resumen

VoxtLM v2 · OPT-350M · Phonological Tokenizer (k=2000) · D_Bal es un modelo de lenguaje decoder-only que unifica voz y texto, desarrollado por el usuario RuiRuihigh y entrenado con ESPnet. Se trata de una variante "v2" del modelo VoxtLM original (Maiti et al., arXiv:2309.07937), en la que las unidades discretas de HuBERT basadas en k-means se sustituyen por un tokenizador fonologico de 2000 entradas (Phonological Tokenizer, Sony, arXiv:2601.19781). El backbone es facebook/opt-350m, inicializado desde los pesos preentrenados de OPT y adaptado mediante el modulo transformer_opt de ESPnet.

El modelo resuelve cuatro tareas con un unico juego de pesos, seleccionadas mediante tokens especiales: reconocimiento automatico del habla (ASR), sintesis de voz (TTS, generando unidades discretas), continuacion de texto y continuacion de unidades de habla. Esta disenado para entornos de investigacion en los que se quiere estudiar el modelado conjunto de habla y texto con un vocabulario compartido de 10.000 tokens BPE.

Su relevancia actual radica en que demuestra que un backbone de solo 350 millones de parametros puede obtener un WER de 6,4% en LibriSpeech test-clean + test-other y una inteligibilidad TTS de 5,2% CER con Whisper, ademas de servir como inicializacion de variantes posteriores (por ejemplo, voxtlm_v2_k2000_Bal_opt350m_sqa). La licencia derivada de OPT restringe el uso a investigacion no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (backbone OPT-350M, ESPnet `transformer_opt`) |
| Parametros totales | Aproximadamente 350 M (backbone facebook/opt-350m) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye en punto flotante, checkpoint `.pth`) |
| Idiomas soportados | Ingles (en) |
| Licencia | OPT license (uso no comercial / investigacion) |
| Formato de pesos | PyTorch `.pth` (valid.acc.best.pth, 1,26 GB), mas BPE unigram (bpe.model) y codebook k-means (km_2000.mdl) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only derivado de OPT-350M, implementado en ESPnet como `transformer_opt`. El modelo comparte un unico vocabulario de 10.000 tokens BPE para texto y habla: el texto se tokeniza con un SentencePiece unigram BPE de 10k entradas, mientras que el habla se convierte en unidades discretas mediante el Phonological Tokenizer (WavLM-large ajustado, capa 21, codebook de 2000 entradas). Las unidades se mapean a caracteres CJK y despues se codifican con BPE junto con el texto. Las cuatro tareas (ASR, TTS, continuacion de texto, continuacion de unidades de habla) se seleccionan con tokens especiales dentro de una misma secuencia de entrenamiento.

El entrenamiento usa el subconjunto D_Bal (configuracion equilibrada del paper): LibriSpeech, LibriTTS, VCTK y LibriLight, con aproximadamente 1,28 millones de secuencias de entrenamiento repartidas entre las cuatro tareas. El optimizador es Adam con learning rate 3e-4, warmup de 2.500 pasos, grad clip 1.0, label smoothing 0.1 y AMP; se emplea `batch_bins` 10.000 con `accum_grad` 20 y 25.000 iteraciones por epoca. El checkpoint publicado (`valid.acc.best.pth`) corresponde a la epoca 16, con mejor precision de validacion 0,313 y perdida 2,686, y el entrenamiento se detuvo tras la epoca 21.

## Capacidades

- Generacion de texto autoregresiva (continuacion de texto), con perplexity de 26,17 en LibriSpeech test.
- Reconocimiento automatico del habla (ASR): transcripcion de voz a texto con WER de 6,4% en LibriSpeech test-clean + test-other.
- Sintesis de voz (TTS): generacion de unidades discretas de habla a partir de texto, que se vocodifican con un HiFi-GAN de unidades (no incluido en el repo).
- Modelado de lenguaje sobre unidades de habla (continuacion de speech units), con perplexity de 36,76 en LibriSpeech test.
- Vocabulario compartido texto-habla de 10.000 tokens BPE, con unidades de habla mapeadas a caracteres CJK.
- Capacidad de modelado fonologico y sintactico evaluada con sWUGGY y sBLIMP (ZeroSpeech 2021).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no (solo ingles).
- Capacidad especial: modelo multitarea unificado con seleccion de tarea por token especial; sin vision ni audio de entrada mas alla de unidades discretas.

## Casos de uso

- Investigacion en modelos unificados habla-texto: permite reproducir y extender los experimentos de VoxtLM v2 comparando el tokenizador fonologico de 2000 unidades frente al k-means de HuBERT original.
- Evaluacion de tokenizadores de habla: sirve como banco de pruebas para medir el impacto del codebook de unidades discretas en tareas de ASR, TTS y modelado de lenguaje.
- Transcripcion de voz a texto en investigacion: con 6,4% WER en LibriSpeech, es util para experimentos de ASR sobre corpus de lectura en ingles (LibriSpeech, LibriTTS, VCTK, LibriLight).
- Sintesis de voz experimental: genera unidades de habla que, vocodificadas con un HiFi-GAN de unidades, producen audio con CER de 5,2% segun Whisper, adecuado para prototipos de TTS en investigacion.
- Analisis fonologico y sintactico: las puntuaciones sWUGGY (82,16% texto / 66,98% habla) y sBLIMP (68,83% texto / 57,31% habla) permiten estudiar el conocimiento linguistico adquirido por el modelo.
- Inicializacion para ajuste fino: el propio autor lo usa como punto de partida de voxtlm_v2_k2000_Bal_opt350m_sqa, por lo que es util como checkpoint base en pipelines de investigacion.
- Modelado de lenguaje sobre secuencias de habla: la continuacion de unidades discretas permite estudiar la estructura estadistica del habla sin pasar por texto.

## Benchmarks y rendimiento

| Tarea | Conjunto de test | Metrica | Valor |
|---|---|---|---|
| ASR | LibriSpeech test-clean + test-other (5.559 enunciados) | WER (menor es mejor) | 6,4% |
| TTS | 100 enunciados aleatorios de LibriTTS test, beam 5, maxlen 1200 | Whisper CER / WER (menor es mejor) | 5,2% / 7,1% |
| TTS | mismo conjunto | UTMOS (mayor es mejor) | 3,91 |
| Speech-unit LM | LibriSpeech test | Perplexity (menor es mejor) | 36,76 |
| Text LM | LibriSpeech test | Perplexity (menor es mejor) | 26,17 |
| sWUGGY (lexico) | ZeroSpeech 2021 dev | Precision texto / habla (mayor es mejor) | 82,16% / 66,98% |
| sBLIMP (sintactico) | ZeroSpeech 2021 dev | Precision texto / habla (mayor es mejor) | 68,83% / 57,31% |

Nota del autor sobre TTS: en el conjunto completo de LibriTTS test con el `maxlen: 300` por defecto del recipe, el CER sube a 13,2%, pero casi todo el error procede de frases largas truncadas por el limite de longitud, no de errores del modelo. Con `maxlen: 1200`, 6 de cada 100 enunciados siguen agotando el limite (salidas degeneradas o repetitivas).

## Requisitos de hardware

- Peso del checkpoint: 1,26 GB (fichero `valid.acc.best.pth`); el repositorio completo ocupa 1,3 GB.
- VRAM estimada: con un backbone de aproximadamente 350 M de parametros, la inferencia ocupa del orden de 1,5 GB en FP32 y menos de 1 GB en FP16, mas las activaciones y el vocoder externo si se usa TTS. Cifras exactas de consumo: no disponibles.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM es suficiente; no requiere A100 ni H100. Cabe en GPUs de consumo como RTX 3060, RTX 4090, etc.
- Cabe en GPU de consumo: si, con margen amplio dado el tamano del modelo.
- Opciones de despliegue: ESPnet (`python -m espnet2.bin.lm_inference` con `--lm_train_config` y `--lm_file`) o el recipe de GitHub (`./run.sh --stage 10 --stop_stage 10 --ngpu 1`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Vocoder TTS: el HiFi-GAN de unidades usado para las metricas TTS no esta incluido en el repositorio (se entreno sobre LJSpeech con las mismas unidades fonologicas).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tokenizador de habla | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| voxtlm_v2_k2000_Bal_opt350m (este) | ~350 M (OPT-350M) | Phonological Tokenizer, 2000 unidades | ASR, TTS, continuacion texto/habla | OPT (no comercial) | HuggingFace + recipe ESPnet |
| voxtlm_v2_k2000_Bal_opt350m_sqa | ~350 M (mismo backbone) | Phonological Tokenizer, 2000 unidades | Ajuste derivado del anterior | no disponible | HuggingFace |
| VoxtLM v1 (original) | no disponible | HuBERT k-means | ASR, TTS, continuacion texto/habla | no disponible | Paper arXiv:2309.07937 |

No se dispone de resultados de benchmarks comparativos con otros modelos unificados habla-texto en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia: los pesos derivan de OPT y estan sujetos a la OPT license, que restringe el uso a investigacion no comercial. Aplican ademas las licencias de los datos de entrenamiento (LibriSpeech, LibriTTS, LibriLight, VCTK) y la del Phonological Tokenizer.
- Idiomas: el modelo solo soporta ingles; no hay capacidades multilingues.
- Alucinacion y degeneracion: el propio autor reporta que 6 de cada 100 enunciados TTS con `maxlen: 1200` agotaron el limite de longitud produciendo salidas degeneradas o repetitivas.
- Truncamiento en TTS: con la configuracion por defecto (`maxlen: 300`), el CER sube a 13,2% en el conjunto completo de LibriTTS test debido al corte de frases largas.
- Vocoder no incluido: las metricas TTS dependen de un HiFi-GAN de unidades que no se distribuye en el repositorio, por lo que la reproduccion completa de los resultados TTS requiere entrenarlo por separado.
- Estados del optimizador no incluidos: no se publica `checkpoint.pth`, por lo que no es posible reanudar el entrenamiento tal cual desde el checkpoint publicado.
- Datos de entrenamiento no incluidos: los corpus de entrenamiento no forman parte del repositorio.
- Soporte limitado de despliegue: no hay soporte documentado para runtimes de inferencia estandar como vLLM, llama.cpp, Ollama o TGI; la inferencia depende de ESPnet y del recipe especifico.
- Popularidad y validacion externa: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validacion de la comunidad.
- Uso en produccion: la combinacion de licencia no comercial, ausencia de cuantizaciones publicadas y falta de soporte en runtimes de alto rendimiento desaconseja su uso en produccion comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RuiRuihigh/voxtlm_v2_k2000_Bal_opt350m
- Modelo derivado (SQA): https://huggingface.co/RuiRuihigh/voxtlm_v2_k2000_Bal_opt350m_sqa
- Recipe de entrenamiento e inferencia (ESPnet): https://github.com/RuiRuihigh/espnet/tree/voxtlm_v1_v2_experiments/egs2/voxtlm_v2
- Paper de VoxtLM: https://arxiv.org/abs/2309.07937
- Paper del Phonological Tokenizer: https://arxiv.org/abs/2601.19781
- Tokenizador fonologico (Sony): https://huggingface.co/Sony/Phonological-Tokenizer
- Licencia OPT: https://github.com/facebookresearch/metaseq/blob/main/projects/OPT/MODEL_LICENSE.md
