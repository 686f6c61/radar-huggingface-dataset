# oluwagbotty/w2vbert-ky-ft-10ep-s2

## Resumen

w2vbert-ky-ft-10ep-s2 es un modelo de reconocimiento automatico del habla (ASR) para kinyarwanda, afinado especificamente sobre habla no estandar de personas que tartamudean. Lo desarrolla el usuario de Hugging Face oluwagbotty como parte de un proyecto de investigacion del Rwanda Innovation Sprint impulsado por CDLI (Centre for Digital Language Inclusion, UCL), con financiacion del programa AT2030 de UK International Development y apoyo de Google.org. El objetivo es cubrir un nicho desatendido: los sistemas ASR comerciales rinden mal con disfluencias, y las lenguas de bajos recursos como el kinyarwanda apenas cuentan con modelos especializados.

El modelo parte de `badrex/w2v-bert-2.0-kinyarwanda-asr`, un checkpoint Wav2Vec2-BERT ya adaptado al kinyarwanda, y se afina sobre el split de entrenamiento del dataset CDLI de habla no estandar. La arquitectura es Wav2Vec2-BERT, un transformer convolucional con atencion por conformer orientado a representaciones de audio auto-supervisadas, con 580.525.920 parametros totales. Es un modelo CTC puro de ASR, no un modelo generativo de texto, por lo que no admite instrucciones ni tool calling.

Su relevancia es doble: por un lado, demuestra que el ajuste fino sobre habla tartamuda mejora la transcripcion en condiciones controladas (WER agrupado del 41,6 % en test); por otro, documenta con rigor las limitaciones de un corpus pequeno (9 hablantes en test) y advierte explicitamente contra usos clinicos o de identificacion de hablantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2-BERT (transformer convolucional con atencion tipo conformer, cabeza CTC) |
| Parametros totales | 580.525.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; ventana de entrada dependiente de la duracion del audio) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | kinyarwanda (rw) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (libreria transformers); pesos en la carpeta `best/` |
| Tamano del repositorio | 48,8 GB |
| Pipeline | automatic-speech-recognition |
| Dataset de ajuste | cdli/rwandan_kinyarwanda_nonstandard_speech_v1.0 (acceso restringido) |
| Modelo base | badrex/w2v-bert-2.0-kinyarwanda-asr |

## Arquitectura y entrenamiento

El modelo es un Wav2Vec2-BERT, es decir, un extractor de caracteristicas convolucional seguido de un codificador transformer con atencion por conformer, preentrenado de forma auto-supervisada sobre audio y adaptado despues a ASR mediante una cabeza CTC. No genera texto de forma autorregresiva: emite directamente la secuencia de tokens a partir de las representaciones acusticas, lo que elimina el modo de fallo de bucles repetitivos tipico de los modelos decoder-only como Whisper (la model card lo confirma: 0 bucles en test y dev).

El ajuste fino se realizo exclusivamente sobre el split de train del dataset CDLI, usando el split de dev para seleccionar el checkpoint y reservando el test para una unica evaluacion posterior. Se entrenaron hasta 10 epocas con parada temprana sobre WER de dev (paciencia de 3 evaluaciones), semilla 2, learning rate 2e-5, batch efectivo 16 y evaluacion cada 350 pasos. No se usaron el split `extra` ni se solaparon hablantes entre splits. El codigo de entrenamiento esta en `scripts/molab/run_experiments.py` y `experiments/finetune.yaml` del repositorio del proyecto, con el identificador de experimento `w2vbert-ky-ft-10ep-s2`. No se documenta en la informacion disponible el numero de tokens de audio, la composicion exacta del corpus ni si hubo etapas de RLHF o DPO (no aplicables a un modelo CTC).

## Capacidades

- Transcripcion de voz a texto en kinyarwanda, incluyendo habla con disfluencias (repeticiones, bloqueos y prolongaciones) de personas que tartamudean.
- Reconocimiento sobre audio de tableta en interiores con bajo ruido, tanto de descripciones libres a partir de imagenes como de frases leidas.
- Decodificacion greedy estable, sin bucles de repeticion, gracias a la naturaleza CTC del modelo.
- No soporta tool calling ni function calling: no es un modelo de lenguaje generativo.
- No soporta agentes ni razonamiento multi-paso.
- No soporta vision, audio generativo ni modo de pensamiento.
- Capacidad multilingue limitada al kinyarwanda; no se documenta soporte de code-switching.

## Casos de uso

- Transcripcion asistida para personas que tartamudean: el modelo transcribe audio de voz con repeticiones y bloqueos, y el texto resultante puede mostrarse al hablante para su validacion antes de actuar sobre el, tal como recomienda la model card.
- Investigacion en ASR inclusivo: sirve como linea base reproducible para medir el efecto del ajuste fino sobre habla no estandar en lenguas de bajos recursos, con splits por hablante y metricas WER/CER documentadas.
- Subtitulado de material grabado en kinyarwanda: util para entrevistas o grabaciones en interiores con bajo ruido, donde el WER agrupado del 41,6 % en test puede ser aceptable como borrador que un humano revisa.
- Digitalizacion de respuestas abiertas en encuestas: las descripciones a partir de imagenes (picture prompts) son el escenario mas representativo del habla abierta y permiten convertir respuestas orales en texto estructurado para analisis posterior.
- Prototipos de accesibilidad en aplicaciones de tableta: el modelo se entreno con audio capturado mediante una app de tableta en interiores, por lo que encaja en flujos de dictado o formularios hablados en ese tipo de dispositivo.
- Evaluacion comparativa de modelos ASR para kinyarwanda: sus resultados en dev y test, con y sin el normalizador de CDLI, permiten comparar arquitecturas CTC frente a decoder-only en condiciones de habla disfluente.
- Docencia y formacion en procesamiento de habla: el repositorio y el codigo de experimentos permiten reproducir el ajuste fino y estudiar el impacto del numero de epocas y del early stopping en un corpus pequeno.

## Benchmarks y rendimiento

Resultados con decodificacion greedy, una grabacion cada vez, normalizador de texto basico de Whisper (y variante con el paso de apostrofes de CDLI). El WER agrupado cuenta todas las palabras juntas; el WER y CER por enunciado son medias sobre grabaciones, cada una limitada al 100 %.

| Split | WER agrupado (%) | CER (%) | WER por enunciado (%) | CER por enunciado (%) | Bucles |
|---|---|---|---|---|---|
| test (9 hablantes) | 41,6 | 12,4 | 43,0 | 13,2 | 0 |
| dev (6 hablantes) | 43,2 | 18,3 | 42,6 | 19,3 | 0 |
| test, normalizador estilo CDLI | 38,8 | 11,9 | 40,7 | no disponible | 0 |

Con solo 9 hablantes en test, la model card advierte que las diferencias inferiores a unos 3 puntos de WER entre dos modelos no pueden confirmarse. No se han publicado en la informacion disponible resultados de benchmarks estandar como MMLU, HumanEval o GSM8K, que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 580 millones de parametros, en fp32 el modelo ocupa aproximadamente 2,3 GB de pesos, y en fp16 alrededor de 1,2 GB, a lo que hay que sumar el estado del decodificador CTC y los buffers de audio.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM deberia bastar para inferencia en fp16; una RTX 3060, RTX 4060 o superior es suficiente. Para entrenamiento o evaluacion por lotes se recomiendan A100, H100 o RTX 4090.
- Cabe en GPU de consumo: si, en tarjetas con 6 GB o mas de VRAM en fp16, aunque el dato no esta confirmado en la informacion disponible.
- Opciones de despliegue: transformers con pipeline `automatic-speech-recognition`; el tag `endpoints_compatible` sugiere compatibilidad con Inference Endpoints de Hugging Face. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que en general no estan orientados a modelos CTC de audio.
- Latencia y throughput: no disponibles en la informacion proporcionada. El repo ocupa 48,8 GB, lo que probablemente incluye checkpoints intermedios ademas de los pesos finales en `best/`.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Contexto | WER test | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| w2vbert-ky-ft-10ep-s2 | 580,5 M | kinyarwanda | no disponible | 41,6 % (agrupado) | CC-BY-4.0 | Hugging Face, publico |
| badrex/w2v-bert-2.0-kinyarwanda-asr | no disponible | kinyarwanda | no disponible | no disponible | no disponible | Hugging Face, publico |
| Whisper (variantes) | no disponible | multilingue | 30 s por ventana | no disponible para kinyarwanda disfluente | MIT (segun version) | Amplia |
| Modelos CDLI de referencia | no disponible | kinyarwanda | no disponible | no disponible | no disponible | Hugging Face, acceso restringido al dataset |

La comparacion cuantitativa con el modelo base y con los modelos de referencia de CDLI no puede establecerse con los datos disponibles; la model card solo indica que el normalizador estilo CDLI mejora el WER agrupado de 41,6 % a 38,8 % en test.

## Limitaciones y advertencias

- Pocos hablantes y condiciones estrechas: 9 hablantes en test, mayoritariamente hombres jovenes, grabaciones en interiores silenciosos, habla leida y descrita a partir de imagenes, no conversacional. El rendimiento con ninos, otras discapacidades, ruido, audio telefonico o code-switching es desconocido.
- Transcripciones literales: las repeticiones del tartamudeo se escriben en las transcripciones, y el modelo puede reproducirlas o no; los bloqueos y prolongaciones no son visibles en el texto.
- Sesgo hacia frases leidas: las frases leidas tambien aparecen en las transcripciones de train, por lo que los resultados con picture prompts son la mejor guia para habla abierta.
- Prohibido para decisiones sobre personas: no debe usarse para diagnosticar o evaluar ninguna condicion del habla, identificar hablantes ni tomar decisiones clinicas, legales o policiales. Los terminos de CDLI prohiben reidentificar hablantes y crear voces que imiten a una persona.
- Riesgo de alucinacion y errores de sentido: una transcripcion erronea puede cambiar el significado de lo dicho; la model card recomienda mostrar el texto al hablante antes de actuar sobre el.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial con atribucion, pero el dataset CDLI tiene acceso restringido y no se incluye en el repositorio; los terminos del dataset limitan el uso de los datos originales.
- El repositorio de 48,8 GB puede incluir checkpoints intermedios; conviene verificar que se descarga la carpeta `best/` para inferencia.
- No hay datos publicados sobre cuantizacion, latencia ni rendimiento fuera de las condiciones del corpus.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oluwagbotty/w2vbert-ky-ft-10ep-s2
- Modelo base: https://huggingface.co/badrex/w2v-bert-2.0-kinyarwanda-asr
- Dataset CDLI de habla no estandar: https://huggingface.co/datasets/cdli/rwandan_kinyarwanda_nonstandard_speech_v1.0
- Centre for Digital Language Inclusion (UCL): no disponible en la informacion proporcionada
- Programa AT2030: no disponible en la informacion proporcionada
- Repositorio del proyecto con el codigo de entrenamiento (`scripts/molab/run_experiments.py`, `experiments/finetune.yaml`): no disponible en la informacion proporcionada
