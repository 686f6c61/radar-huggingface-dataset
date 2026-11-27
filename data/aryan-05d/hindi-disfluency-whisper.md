# Aryan-05d/hindi-disfluency-whisper

## Resumen

`Aryan-05d/hindi-disfluency-whisper` es un modelo de reconocimiento automatico del habla (ASR) derivado de la familia Whisper de OpenAI, publicado en Hugging Face por el usuario Aryan-05d. Por su nombre y por sus 241.734.912 parametros, se corresponde con la variante Whisper Small, reentrenada o ajustada finamente con el objetivo declarado en el identificador de eliminar o gestionar disfluencias (repeticiones, muletillas, falsos arranques) en hindi. La model card publicada es la plantilla generica autogenerada por Hugging Face y no contiene informacion sustantiva sobre datos, metodologia ni evaluacion.

El modelo se distribuye en formato safetensors bajo la libreria transformers, con un repositorio de aproximadamente 1,0 GB (compatible con pesos en fp32 y posiblemente alguna variante adicional). No declara licencia, idiomas soportados ni resultados de evaluacion, lo que limita seriamente su uso en produccion sin una validacion previa por parte del integrador.

Su relevancia es acotada pero concreta: el hindi es un idioma con alta presencia de code-switching hindi-ingles y con abundantes disfluencias en habla espontanea, y los Whisper originales tienden a transcribir literalmente esas disfluencias o a alucinar en segmentos ruidosos. Un ajuste especifico orientado a normalizar ese fenomeno puede ser util en pipelines de subtitulado, transcripcion de reuniones o generacion de actas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Whisper, variante Small) |
| Parametros totales | 241.734.912 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la model card; Whisper Small estandar admite ventanas de audio de 30 segundos |
| Tipos de cuantizacion | no disponible (solo se confirma safetensors en el repo; no se publican GGUF ni otros formatos) |
| Idiomas soportados | no disponible (el identificador sugiere hindi; no confirmado por el autor) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper Small: un transformer encoder-decoder con 12 capas en cada bloque, atencion multi-cabeza estandar y un vocabulario multilingue basado en BPE. El modelo procesa audio muestreado a 16 kHz convertido en espectrogramas log-Mel de 80 canales, y genera texto de forma autoregresiva con tokens especiales de idioma, tarea y marcas de tiempo.

No se dispone de informacion sobre el proceso de entrenamiento: ni el numero de tokens o horas de audio utilizadas, ni la composicion del dataset, ni si se aplico ajuste fino supervisado, LoRA, RLHF o alguna tecnica de destilacion. Tampoco se documenta si el ajuste se realizo sobre el checkpoint multilingue original de Whisper Small o sobre una version ya especializada en hindi, ni si se emplearon tecnicas de eliminacion de disfluencias basadas en etiquetado explicito o en normalizacion de transcripciones. Toda esta informacion figura como "[More Information Needed]" en la model card.

## Capacidades

- Reconocimiento automatico del habla (ASR) en formato seq2seq audio-a-texto.
- Presunta especializacion en hindi y en la gestion de disfluencias del habla espontanea, segun el identificador del modelo; no verificado por el autor.
- Generacion de transcripciones con marcas de tiempo, heredada de la arquitectura Whisper (no confirmado en este checkpoint).
- Deteccion de idioma y traduccion speech-to-text, capacidades nativas de Whisper Small que podrian haberse preservado o degradado tras el ajuste; no documentado.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente ASR.
- No se documentan capacidades multimodales adicionales (vision, audio generativo).

## Casos de uso

- Subtitulado de contenido audiovisual en hindi: el modelo puede transcribir audio de 30 segundos por ventana y, si el ajuste funciona segun lo declarado, producir subtitulos mas limpios al eliminar repeticiones y muletillas propias del habla natural.
- Transcripcion de reuniones y entrevistas: en entornos con habla espontanea, la supuesta normalizacion de disfluencias reduce el coste de postprocesado manual de las actas.
- Generacion de actas y resumenes: al entregar texto mas limpio a un LLM posterior, mejora la calidad de resumenes y extraccion de acciones en pipelines RAG de audio.
- Analisis de llamadas de atencion al cliente: la transcripcion de conversaciones telefonicas en hindi puede alimentar sistemas de analitica, siempre que se valide la robustez frente a ruido y code-switching.
- Investigacion linguistica sobre habla espontanea: util para estudiar fenomenos de disfluencia en hindi comparando la salida del modelo con transcripciones literales de Whisper original.
- Prototipado rapido en aplicaciones de voz: por su tamano (241 M de parametros) puede ejecutarse en CPU o GPU de gama baja para validar conceptos antes de invertir en modelos mayores.
- Preprocesado de datasets de audio en hindi: normalizacion de transcripciones para entrenar otros modelos ASR o TTS con texto mas canonico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye WER, CER ni comparaciones con Whisper Small original u otros modelos en hindi, por lo que no es posible verificar empiricamente la mejora que sugiere el nombre del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 1 GB solo para pesos, mas activaciones y buffers de atencion; en la practica, 2-3 GB son suficientes para audio de 30 segundos.
- VRAM estimada en fp16: aproximadamente 0,5 GB de pesos, con un consumo total tipico por debajo de 2 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090); tambien funciona en CPU con latencia aceptable para lotes pequenos.
- Cabe holgadamente en GPU consumer e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers con pipeline `automatic-speech-recognition`, y potencialmente `faster-whisper` o `whisper.cpp` si se convierte el checkpoint (no se distribuyen pesos en formato compatible de forma nativa). Tambien es compatible con endpoints de Hugging Face (tag `endpoints_compatible`).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aryan-05d/hindi-disfluency-whisper | 241,7 M | 30 s por ventana (heredado) | no disponible (presuntamente hindi) | no disponible | Hugging Face |
| openai/whisper-small | 244 M | 30 s por ventana | multilingue (99 idiomas) | MIT (pesos publicados por OpenAI) | Hugging Face, whisper.cpp, faster-whisper |
| openai/whisper-small.en | 244 M | 30 s por ventana | ingles | MIT | Hugging Face |
| Modelos ASR especificos de hindi (p. ej. AI4Bharat IndicWhisper) | variable | 30 s por ventana | hindi y otras lenguas indias | variable | Hugging Face |

La comparacion directa con alternativas especificas de hindi no es posible sin datos de evaluacion: el modelo bajo analisis no publica WER ni condiciones de entrenamiento, mientras que las alternativas de referencia si documentan sus conjuntos de evaluacion.

## Limitaciones y advertencias

- Ausencia total de licencia: no se puede asumir permiso de uso comercial; es imprescindible contactar con el autor antes de integrarlo en produccion.
- Model card autogenerada sin informacion sobre datos de entrenamiento, sesgos o evaluacion: no hay garantia de que el ajuste en hindi se haya realizado correctamente ni de que no haya sobreajuste.
- Riesgo de alucinacion y de bucles de repeticion, inherente a los modelos Whisper, especialmente con audio ruidoso, silencios largos o musica de fondo.
- Idiomas soportados no confirmados: aunque el nombre indica hindi, no se documenta si conserva capacidades multilingues ni como se comporta con code-switching hindi-ingles.
- La ventana de audio de 30 segundos obliga a segmentar audios largos, con riesgo de cortes en fronteras de frase y perdida de contexto entre segmentos.
- Sin benchmarks publicados, no es posible verificar la promesa de eliminacion de disfluencias; se recomienda evaluar con un conjunto propio antes de cualquier uso.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: modelo practicamente sin validacion por la comunidad.
- No se distribuyen pesos en formatos optimizados (GGUF, CTranslate2), lo que anade trabajo de conversion para despliegues de alto rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Aryan-05d/hindi-disfluency-whisper
- Paper de referencia de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Paper citado en los tags del modelo (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Repositorio oficial de Whisper en OpenAI: https://github.com/openai/whisper
- Checkpoint base de referencia: https://huggingface.co/openai/whisper-small
