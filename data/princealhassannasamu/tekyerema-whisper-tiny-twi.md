# PrinceAlhassanNasamu/tekyerema-whisper-tiny-twi

## Resumen

tekyerema-whisper-tiny-twi es un ajuste fino (fine-tuning) del modelo de reconocimiento automatico del habla openai/whisper-tiny, publicado por el usuario PrinceAlhassanNasamu. El objetivo declarado por el nombre del repositorio es la transcripcion de audio en twi (akan), una lengua hablada principalmente en Ghana para la que existen pocos recursos de ASR de codigo abierto. El modelo conserva la arquitectura encoder-decoder transformer propia de la familia Whisper y el mismo tokenizador multilingue del modelo base.

El modelo cuenta con 37.760.640 parametros (segun los pesos en safetensors) y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. El repositorio ocupa 1,3 GB, un tamano desproporcionado respecto al peso real de los parametros, lo que sugiere que incluye estados de optimizador o checkpoints intermedios. El campo de idiomas del repositorio esta vacio y la model card no documenta la composicion del dataset de entrenamiento.

La relevancia de esta ficha es limitada pero concreta: se trata de un experimento de ajuste fino sobre una lengua de bajos recursos, con un WER de evaluacion del 60,9 %, muy lejos de un umbral utilizable en produccion. Es util como punto de partida reproducible o como referencia negativa para quien quiera abordar ASR en twi, pero no como componente listo para desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), heredada de openai/whisper-tiny |
| Parametros totales | 37.760.640 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Ventana de audio de 30 segundos por segmento (1500 posiciones de entrada en el modelo base); no disponible el detalle exacto en la model card |
| Tipos de cuantizacion | no disponible (no se documentan variantes cuantizadas; el modelo base admite fp16, int8 y GGUF mediante herramientas externas) |
| Idiomas soportados | no declarado en el repositorio; el nombre del modelo indica twi (akan) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base openai/whisper-tiny: un transformer encoder-decoder con 4 capas de encoder y 4 de decoder, dimension de modelo 384, 6 cabezas de atencion y entrada de espectrograma log-Mel de 80 canales sobre ventanas de 30 segundos. Whisper procesa el audio como secuencias de 1500 posiciones de entrada y genera texto de forma autorregresiva con tokens especiales de idioma, tarea y marcas de tiempo. El ajuste fino no modifica esa topologia, solo los pesos.

El entrenamiento se realizo con el Trainer de Hugging Face durante 3 epochs, con un total de 6243 pasos (2081 por epoch) y batch de 16 en entrenamiento y evaluacion. Se uso AdamW con betas (0,9; 0,999) y epsilon 1e-08, learning rate 1e-4, scheduler lineal con warmup del 10 %, semilla 42 y precision mixta nativa (AMP). Eso supone aproximadamente 33.296 muestras de audio por epoch y cerca de 100.000 en total. No se documenta el dataset empleado (la model card indica literalmente "None dataset"), ni si hubo aumentacion de datos, ni la composicion linguistica del corpus. Tampoco se describe ninguna innovacion tecnica adicional: es un fine-tuning supervisado convencional con perdida CTC/seq2seq estandar de Whisper. Las versiones de framework declaradas son Transformers 4.57.6, PyTorch 2.10.0+cu128, Datasets 5.0.0 y Tokenizers 0.22.2.

## Capacidades

- Reconocimiento automatico del habla (ASR) en modo transcripcion, orientado a twi (akan); la tarea esta fijada en el pipeline `automatic-speech-recognition`.
- Transcripcion de audio de hasta 30 segundos por segmento en una sola pasada; para audios mas largos es necesario trocear y encadenar manualmente.
- Generacion de marcas de tiempo a nivel de palabra o segmento, ya que el tokenizador del modelo base las incluye, aunque la model card no lo documenta ni lo valida.
- Capacidad multilingue residual heredada de Whisper: los pesos del modelo base estan entrenados en 96 idiomas y el ajuste fino no los elimina por completo, pero no hay evaluacion que confirme su calidad fuera del twi, y es probable que se haya degradado.
- Soporte de tool calling: no.
- Soporte de agentes o razonamiento multi-paso: no.
- Capacidades de vision, audio generativo o modo thinking: no.

## Casos de uso

- Prototipado academico de ASR en lenguas de bajos recursos: el modelo sirve como linea base reproducible para medir cuanto mejora una tecnica concreta (mas datos, aumentacion, adaptacion de vocabulario) sobre un WER del 60,9 %.
- Etiquetado asistido con revision humana: con un WER tan alto, la transcripcion automatica puede usarse para preanotar audio y reducir el coste de la anotacion manual, siempre que un hablante nativo revise y corrija cada segmento.
- Extraccion de palabras clave en audio de dominio muy restringido: si se aplica sobre un corpus tematicamente homogeneo (por ejemplo, un unico locutor o un vocabulario cerrado), el modelo puede acertar terminos frecuentes aunque falle en la transcripcion literal completa.
- Busqueda aproximada en archivos de audio: indexar la salida del modelo permite localizar fragmentos por coincidencia difusa de terminos en una coleccion de grabaciones, asumiendo alta tasa de falsos positivos.
- Investigacion sobre sesgos y errores en ASR de bajos recursos: comparar este modelo con whisper-tiny sin ajustar permite cuantificar que gana y que pierde el fine-tuning con pocos datos.
- Aprendizaje y docencia: ejemplo compacto (37,7 millones de parametros) para mostrar el flujo completo de fine-tuning de Whisper con `Seq2SeqTrainer` en una GPU de gama media.
- Despliegue en el borde (edge) con fines experimentales: el modelo cabe holgadamente en cualquier GPU de consumo e incluso en CPU, util para demos de transcripcion local en ghana con conectividad limitada, con la advertencia clara de que la calidad actual no es apta para uso real.

## Benchmarks y rendimiento

El indice `model-index` del repositorio declara una lista de resultados vacia. Los unicos datos disponibles son los de la model card, que corresponden al conjunto de evaluacion usado por el autor (no identificado). No hay resultados de MMLU, HumanEval o GSM8K, que no aplican a un modelo de ASR.

| Metrica | Epoch 1.0 (paso 2081) | Epoch 2.0 (paso 4162) | Epoch 3.0 (paso 6243) |
|---|---|---|---|
| Perdida de entrenamiento | 0,4286 | 0,2785 | 0,0989 |
| Perdida de validacion | 1,3062 | 1,2394 | 1,2299 |
| WER (%) | 70,6286 | 62,8500 | 60,8999 |

Resultado final declarado: perdida 1,2299 y WER 60,8999 % sobre el conjunto de evaluacion. No se han publicado resultados de benchmarks adicionales en la informacion disponible, ni comparaciones con otros modelos de ASR en twi.

## Requisitos de hardware

- VRAM en fp32: aproximadamente 0,15 GB de pesos (37,76 M de parametros x 4 bytes), mas activaciones y buffers de atencion; en la practica menos de 1 GB.
- VRAM en fp16/bf16: aproximadamente 0,08 GB de pesos; inferencia por debajo de 1 GB en total.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. Funciona sin problema en RTX 3060, RTX 4060, RTX 4090, T4, L4, A10G, A100 y H100; estas dos ultimas quedan sobredimensionadas.
- Consumer GPU: si, cabe en practicamente cualquier GPU de consumo de los ultimos diez anos e incluso en CPU, aunque con mayor latencia.
- Contexto de memoria: el repositorio pesa 1,3 GB, muy por encima de los pesos necesarios para inferencia; si se descarga completo, hay que reservar ese espacio en disco.
- Opciones de despliegue: transformers con pipeline de ASR (via `pipeline`), vLLM con soporte de audio, Hugging Face Inference Endpoints (el repositorio esta marcado como `endpoints_compatible`), Text Generation Inference, y conversion manual a GGUF/whisper.cpp siguiendo el procedimiento estandar para modelos Whisper.
- Latencia y throughput: no disponibles; no se han publicado mediciones en la informacion proporcionada. Como referencia de orden de magnitud, whisper-tiny original procesa audio muy por encima del tiempo real en GPU moderna, pero ese dato no esta verificado para este fine-tuning.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto de audio | Licencia | WER declarado |
|---|---|---|---|---|---|
| tekyerema-whisper-tiny-twi | 37,76 M | no declarado (twi por nombre) | 30 s por segmento | apache-2.0 | 60,90 % en su propio conjunto de evaluacion |
| openai/whisper-tiny | 39 M aprox. | 96 idiomas | 30 s por segmento | apache-2.0 | no disponible en la informacion proporcionada |
| openai/whisper-base | 74 M aprox. | 96 idiomas | 30 s por segmento | apache-2.0 | no disponible en la informacion proporcionada |
| openai/whisper-large-v3 | 1550 M aprox. | 99 idiomas | 30 s por segmento | apache-2.0 | no disponible en la informacion proporcionada |

Los datos de parametros y contexto de los modelos de OpenAI corresponden a especificaciones publicas del modelo base, no a mediciones realizadas para esta ficha. No se dispone de otros modelos de ASR especificos para twi en la informacion proporcionada, por lo que no es posible una comparacion directa de rendimiento en ese idioma.

## Limitaciones y advertencias

- WER de evaluacion del 60,9 %: en la practica, mas de la mitad de las palabras se transcriben mal. No es apto para produccion sin revision humana obligatoria.
- La perdida de validacion sigue bajando muy poco entre la epoch 2 y la 3 (1,2394 a 1,2299) mientras la perdida de entrenamiento cae de 0,2785 a 0,0989: hay sobreajuste claro al conjunto de entrenamiento.
- La model card esta generada automaticamente y sin completar: las secciones "Model description", "Intended uses & limitations" y "Training and evaluation data" dicen literalmente "More information needed". No hay informacion sobre el corpus, su procedencia, su tamano ni su licencia.
- El campo de idiomas del repositorio esta vacio y no hay evaluacion fuera del twi. La capacidad multilingue del modelo base puede haberse degradado con el ajuste fino; asumir que funciona en otros idiomas es un riesgo no verificado.
- El repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, sin historial de uso ni validacion por terceros.
- No se documentan sesgos. Con un unico corpus no identificado de una lengua de bajos recursos, es probable que el modelo este muy sesgado hacia el locutor, el dominio y la variedad dialectal presentes en los datos, pero no hay datos para cuantificarlo.
- Riesgo de alucinacion elevado: como todos los modelos Whisper, puede generar texto plausible que no corresponde al audio, especialmente con ruido, musica o silencios, y mas aun cuando el WER es alto.
- Limite de 30 segundos por segmento; audios mas largos requieren troceado externo, con el consiguiente riesgo de cortar palabras y de acumular errores.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero al derivar de openai/whisper-tiny conviene conservar los avisos de atribucion correspondientes al modelo base.
- La fecha de creacion registrada (2026-09-11) y las versiones de framework declaradas (PyTorch 2.10.0, Transformers 4.57.6) son posteriores a la mayoria de entornos en produccion; verificar compatibilidad antes de integrarlo.
- No hay informacion sobre la precision numerica, el tratamiento de mayusculas y puntuacion, ni la normalizacion de texto aplicada en la evaluacion, por lo que el WER del 60,9 % no es directamente comparable con cifras publicadas de otros trabajos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PrinceAlhassanNasamu/tekyerema-whisper-tiny-twi
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Repositorio oficial de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Documentacion del pipeline de ASR de Transformers: https://huggingface.co/docs/transformers/tasks/asr

Nota sobre la busqueda web: los resultados devueltos corresponden a conciertos de Barry Manilow en el Bridgestone Arena de Nashville y no guardan ninguna relacion con este modelo. No se ha encontrado informacion adicional relevante sobre tekyerema-whisper-tiny-twi, sobre el autor ni sobre el dataset de entrenamiento.
