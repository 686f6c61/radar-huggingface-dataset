# FlexiSLM/model_eval_traces

## Resumen

`FlexiSLM/model_eval_traces` no es un modelo de lenguaje, sino un repositorio de datos publicado en HuggingFace bajo licencia Apache 2.0 que contiene trazas de inferencia en formato JSONL (3,5 GB) generadas al evaluar el modelo de voz FlexiSLM. El repositorio no incluye pesos, ni audios WAV generados, ni código de inferencia: únicamente registros estructurados con los campos `index`, `task`, `input`, `output`, `evaluation` y `metadata`, correspondientes al esquema de trazas de evaluación de FlexiSLM.

El modelo al que hacen referencia estas trazas es FlexiSLM-7B (checkpoint Stage2, `ckpt-150000`), un modelo de lenguaje hablado (spoken language model, SLM) desarrollado por el grupo FlexiSLM, cuya arquitectura extiende un LLM con entrada y salida de habla mediante un esquema de flow-matching speech-to-speech. La contribución central del trabajo, presentado en EMNLP 2026, es que FlexiSLM es el primer SLM que admite frecuencias de trama dinámicas y controlables tanto en entrada como en salida, permitiendo a un único modelo entrenado operar entre 12,5 Hz y 4,0 Hz sin reentrenamiento.

La relevancia actual del artefacto es doble: por un lado, documenta el comportamiento del checkpoint liberado de FlexiSLM sobre los conjuntos de evaluación VoiceBench y OpenAudioBench; por otro, sirve como material reproducible para investigadores que quieran auditar las salidas del modelo sin necesidad de descargar los audios. Conviene subrayar que el repositorio no debe confundirse con el propio modelo: para obtener los pesos hay que acudir al repositorio principal del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje hablado (SLM) con decodificacion flow-matching speech-to-speech; backbone LLM subyacente no especificado en la informacion disponible |
| Parametros totales | 7 000 millones aproximados, segun el nombre del checkpoint (`FlexiSLM-7B`); no confirmado de forma explicita en la documentacion disponible |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (aplicada al repositorio de trazas; la licencia del checkpoint de pesos no se detalla en la informacion disponible) |
| Formato de pesos | no aplica: el repositorio contiene trazas de inferencia en JSONL; no incluye pesos (safetensors, GGUF ni otros) |
| Frecuencia de trama | 12,5 Hz de entrada y salida en el checkpoint Stage2 liberado; el modelo admite steering entre 12,5 Hz y 4,0 Hz segun el paper |
| Tamano del repositorio | 3,5 GB |
| Conjuntos de evaluacion | VoiceBench y OpenAudioBench |
| Schema de las trazas | `index`, `task`, `input`, `output`, `evaluation`, `metadata` |
| Fecha de publicacion | Creado el 30 de septiembre de 2026; actualizado el 30 de septiembre de 2026 |

## Arquitectura y entrenamiento

La informacion disponible describe FlexiSLM como un spoken language model que extiende un LLM para aceptar y emitir habla, con una etapa de decodificacion basada en flow-matching aplicada a la generacion speech-to-speech. El checkpoint referenciado en las trazas es `FlexiSLM-7B Stage2` (`ckpt-150000`), lo que indica un entrenamiento por etapas y un total de al menos 150 000 pasos en la segunda etapa. La innovacion tecnica central es el soporte de frecuencias de trama dinamicas y controlables simultaneamente en la entrada y en la salida de voz: en lugar de representar el habla a una tasa fija (25 Hz o 12,5 Hz, habituales en SLM previos), el modelo puede operar entre 12,5 Hz y 4,0 Hz, explotando la densidad de informacion variable del habla y ofreciendo un compromiso explicito entre calidad y velocidad de inferencia.

No se dispone en la informacion proporcionada de detalles sobre el backbone LLM concreto, el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de alineacion como RLHF o DPO. El paper citado (arXiv 2606.31247, EMNLP 2026) y el repositorio GitHub `AmphionTeam/FlexiSLM` son las fuentes donde deberian aparecer esos detalles, pero su contenido no se ha incluido en esta busqueda mas alla del resumen. En cuanto al repositorio de trazas en si, no hay entrenamiento ni arquitectura: es un volcado de registros de inferencia con un unico fichero documentado, `flexislm_stage2_released.jsonl`.

## Capacidades

- Generacion de habla a partir de habla (speech-to-speech) y, presumiblemente, de texto a habla, dado que la entrada `input` de las trazas incluye tareas evaluadas sobre VoiceBench y OpenAudioBench.
- Entrada y salida de audio con frecuencia de trama ajustable entre 12,5 Hz y 4,0 Hz en un unico modelo entrenado, lo que permite un intercambio directo entre calidad y coste computacional en tiempo de inferencia.
- Capacidad de operar a tasa reducida (hasta 4,0 Hz) para escenarios de baja latencia o computo limitado, y a tasa alta (12,5 Hz) cuando prima la fidelidad acustica.
- Soporte de multiples tareas de evaluacion de voz, segun el campo `task` del esquema de trazas; el catalogo concreto de tareas no esta detallado en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas en la model card ni en las etiquetas del repositorio).
- Capacidad especial: registro estructurado de trazas de evaluacion con metadatos y campo de evaluacion por registro, pensado para auditoria y reproducibilidad de resultados.

## Casos de uso

- Auditoria de evaluaciones de modelos de voz: el repositorio permite revisar las salidas del checkpoint FlexiSLM-7B Stage2 sobre VoiceBench y OpenAudioBench sin descargar los WAV generados, ya que solo se distribuyen las trazas JSONL; util para replicar analisis de errores con un coste de almacenamiento de 3,5 GB.
- Analisis comparativo de esquemas de evaluacion: los campos `evaluation` y `metadata` de cada registro permiten agregar metricas por tarea y comparar el comportamiento del modelo entre subconjuntos de benchmark sin volver a ejecutar la inferencia.
- Investigacion sobre frecuencia de trama en SLM: dado que el modelo admite 12,5 Hz y 4,0 Hz, las trazas sirven de base para estudiar como varia la calidad de la salida al reducir la tasa de tramas, un eje de investigacion abierto segun el propio paper.
- Desarrollo de asistentes de voz conversacionales: el modelo base, con entrada y salida de habla en un mismo stack, es adecuado para dialogos hablados de baja latencia donde el coste de decodificacion se puede rebajar bajando los Hz de salida.
- Integracion en pipelines de evaluacion continuada: las trazas con schema fijo (`index`, `task`, `input`, `output`, `evaluation`, `metadata`) se pueden ingerir directamente en herramientas de analisis tabular o en un data lake para monitorizar regresiones entre checkpoints.
- Reproducibilidad academica en publicaciones de SLM: al publicar las trazas junto con el paper EMNLP 2026, el grupo facilita que revisores y terceros verifiquen afirmaciones sobre el rendimiento del modelo en benchmarks de audio.
- Prototipado de sistemas speech-to-speech con requisitos de computo variables: el control de frecuencia de trama permite desplegar el mismo modelo en entornos con distinta capacidad de GPU, ajustando la tasa de generacion en lugar de cambiar de modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. El repositorio unicamente identifica los conjuntos de evaluacion empleados (VoiceBench y OpenAudioBench) y el checkpoint evaluado (FlexiSLM-7B Stage2, `ckpt-150000`), pero no incluye puntuaciones agregadas, ni comparaciones con otros modelos, ni desglose por tarea.

| Benchmark | Resultado | Notas |
|---|---|---|
| VoiceBench | no disponible | Conjunto de evaluacion citado en la model card del repositorio de trazas |
| OpenAudioBench | no disponible | Conjunto de evaluacion citado en la model card del repositorio de trazas |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Si se confirma el tamano de 7 000 millones de parametros del checkpoint, las estimaciones habituales serian del orden de 14-16 GB en FP16/BF16, 8-9 GB en cuantizacion de 8 bits y 4-5 GB en 4 bits; estas cifras son extrapolaciones de tamano, no datos publicados por el autor.
- GPU recomendadas: no disponible en la informacion proporcionada. Para un modelo de ~7B, las opciones tipicas serian A100 40 GB, H100, L40S o RTX 4090 para precision reducida, pero no hay confirmacion oficial.
- Compatibilidad con GPU de consumo: no confirmada. Dependera del soporte de cuantizacion, que no se documenta.
- Opciones de despliegue: no disponible. Al tratarse de un SLM con decodificacion flow-matching y tokenizer de audio propio, es probable que requiera el codigo del repositorio `AmphionTeam/FlexiSLM` en lugar de stacks genericos como vLLM, TGI o Ollama, pero esto no se afirma en la informacion disponible.
- Latencia y throughput: no disponibles como cifras. El unico dato relacionado es el rango de frecuencia de trama controlable (12,5 Hz a 4,0 Hz), que actua como palanca directa sobre el coste de generacion: a 4,0 Hz se emiten aproximadamente un tercio de tramas por segundo que a 12,5 Hz, lo que reduce el computo de decodificacion de audio.
- Almacenamiento: el repositorio de trazas ocupa 3,5 GB; los pesos del modelo no forman parte de este repositorio.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. La categoria de referencia son los spoken language models (SLM) con entrada y salida de audio, y la propia documentacion situa a FlexiSLM frente a SLM previos que operan a frecuencia fija (por ejemplo, 25 Hz o 12,5 Hz), pero no se aportan nombres concretos ni cifras de rendimiento, parametros o contexto de esos sistemas.

| Modelo | Parametros | Contexto | Frecuencia de trama | Licencia | Rendimiento |
|---|---|---|---|---|---|
| FlexiSLM-7B (Stage2) | ~7B segun nombre del checkpoint | no disponible | 12,5 Hz a 4,0 Hz, dinamica y controlable | no disponible para los pesos; Apache 2.0 para las trazas | no disponible |
| SLM de referencia con tasa fija | no disponible | no disponible | 25 Hz o 12,5 Hz, fija | no disponible | no disponible |

## Limitaciones y advertencias

- Naturaleza del repositorio: `FlexiSLM/model_eval_traces` no contiene un modelo ejecutable. Quien busque pesos, tokenizer o configuracion de inferencia debe acudir al repositorio principal de FlexiSLM, no a este.
- Ausencia de audios: la model card indica explicitamente que solo se publican trazas JSONL, sin los WAV generados. Cualquier evaluacion perceptiva o acustica requiere regenerar las salidas por cuenta propia.
- Datos de benchmarks incompletos: no se publican puntuaciones agregadas en la informacion disponible, por lo que no es posible validar afirmaciones de rendimiento a partir de este repositorio.
- Cobertura de evaluacion limitada: las trazas documentadas corresponden a un unico checkpoint (`ckpt-150000`) y a dos conjuntos (VoiceBench y OpenAudioBench); no hay evidencia de evaluacion en otros dominios.
- Idiomas no declarados: no se especifica que idiomas soporta el modelo, lo que impide garantizar un comportamiento adecuado en castellano sin una validacion previa.
- Sesgos: no disponible. No se documenta ningun analisis de sesgos demograficos, acusticos o dialectales en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; en modelos speech-to-speech el riesgo se manifiesta tanto en contenido semantico como en prosodia y contenido paralinguistico.
- Licencia: Apache 2.0 para el repositorio de trazas, una licencia permisiva que permite uso comercial de las trazas. La licencia de los pesos del modelo no se indica en la informacion disponible, por lo que no puede asumirse que coincida.
- Fechas de publicacion: el repositorio figura creado y actualizado el 30 de septiembre de 2026, una fecha posterior a la de la mayoria de referencias disponibles; conviene verificar la vigencia y el estado del repositorio antes de depender de el.
- Madurez: con 0 descargas y 0 likes en el momento de la consulta, no hay evidencia de uso en produccion ni de validacion por parte de terceros.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/FlexiSLM/model_eval_traces
- Perfil del autor en HuggingFace: https://huggingface.co/FlexiSLM
- Codigo y datos de entrenamiento (GitHub): https://github.com/AmphionTeam/FlexiSLM
- Paper (arXiv): https://arxiv.org/abs/2606.31247
- Demo del proyecto: https://flexislm.github.io/
