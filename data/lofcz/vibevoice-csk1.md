# lofcz/VibeVoice-CSK1

## Resumen

VibeVoice-CSK1 es un ajuste fino del modelo de reconocimiento automatico del habla VibeVoice-ASR de Microsoft, especializado en checo (cs) y eslovaco (sk). Lo publica el desarrollador independiente lofcz bajo licencia MIT y se distribuye como checkpoint completo en BF16 con el adaptador ya fusionado en los pesos base, de modo que no requiere cargar un adaptador PEFT por separado en inferencia.

El modelo resuelve la transcripcion de audio multilingue en dos idiomas eslavos occidentales estrechamente emparentados, anadiendo etiquetas de hablante (speaker diarization) y marcas temporales en la salida. Parte de la arquitectura VibeVoice-ASR, que combina dos codificadores de voz con un decodificador de lenguaje, y conserva tanto los encoders como el tokenizer y el processor originales. El ajuste se realizo con QLoRA (rank 64, alpha 32) sobre aproximadamente 450 horas de audio, con el adaptador fusionado en el paso de checkpoint 2564.

Su relevancia es acotada pero concreta: cubre un hueco de cobertura para checo y eslovaco en un pipeline ASR con diarizacion integrada, y lo hace con un checkpoint listo para usar, sin pasos de fusion ni dependencias de adaptadores. El repositorio ocupa 17,4 GB y el modelo tiene 8.674.021.857 parametros (unos 8,67 mil millones), lo que lo situa en la gama de modelos ASR de gran tamano que requieren GPU con memoria considerable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VibeVoice-ASR (dos codificadores de voz + decodificador de lenguaje), ajuste QLoRA fusionado |
| Parametros totales | 8.674.021.857 (~8,67 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos exportados en BF16 sin cuantizar; el entrenamiento uso QLoRA (cuantizacion de 4 bits para el adaptador) |
| Idiomas soportados | checo (cs), eslovaco (sk) |
| Licencia | MIT |
| Formato de pesos | safetensors (checkpoint completo BF16) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de microsoft/VibeVoice-ASR, que integra dos codificadores de voz (speech encoders) con un decodificador de lenguaje para producir transcripciones con etiquetas de hablante y marcas temporales. El ajuste fino se realizo mediante QLoRA con rango 64, alpha 32 y checkpoint en el paso 2564, sobre un conjunto de aproximadamente 450 horas de audio en checo y eslovaco. Tras el entrenamiento, el adaptador se fusiono con los pesos base siguiendo la receta oficial de Microsoft (`PeftModel.from_pretrained`, `merge_and_unload`, `save_pretrained`), y el resultado se exporto como checkpoint BF16 completo que incluye ambos encoders, tokenizer y processor.

El repositorio documenta el proceso de fusion en `merge_manifest.json`, donde se registran la revision base, los hashes del adaptador, las versiones de dependencias y las comprobaciones de tensores. La inferencia usa la implementacion de VibeVoice fijada por Microsoft y decodificacion greedy. No se detalla en la informacion disponible la composicion exacta del dataset de entrenamiento, el numero de tokens ni si hubo etapas adicionales de alineacion o preferencia tras el ajuste supervisado.

## Capacidades

- Reconocimiento automatico del habla (ASR) en checo y eslovaco.
- Diarizacion de hablantes: la salida incluye etiquetas de hablante junto al texto.
- Marcas temporales por segmento en la transcripcion.
- Procesamiento de audio de distintas duraciones, con la advertencia de que grabaciones largas consumen mas memoria y pueden requerir dividir el audio.
- Salida estructurada en JSON con campos `text` y `segments` a traves del script de inferencia incluido.
- Ejecucion offline con `--local-files-only` tras descargar el modelo.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision, audio generativo ni modo de razonamiento extendido.

## Casos de uso

- Transcripcion de reuniones bilingues checo-eslovaco: el modelo produce texto con etiquetas de hablante y marcas temporales, lo que permite generar actas atribuidas por participante sin un paso separado de diarizacion.
- Subtitulado de contenido audiovisual: las marcas temporales de los segmentos facilitan la alineacion con la pista de video para generar subtitulos en checo o eslovaco.
- Atencion al cliente y analitica de llamadas: transcribir conversaciones con separacion de agente y cliente para alimentar sistemas de control de calidad o busqueda sobre el texto.
- Documentacion clinica o legal dictada: transcripcion de grabaciones en entornos donde se exige identificar quien habla y conservar la referencia temporal de cada intervencion.
- Investigacion linguistica y corpus: generacion de transcripciones anotadas con hablante y tiempo para estudios de habla en checo y eslovaco, con la ventaja de una licencia MIT que facilita su reutilizacion.
- Archivado y busqueda de material audiovisual: indexar grabaciones historicas o de archivo en ambos idiomas para hacerlas consultables por texto, dividiendo los audios largos en clips mas cortos segun la memoria disponible.
- Integracion en pipelines locales: al ser un checkpoint completo en safetensors con script de inferencia propio, puede desplegarse en infraestructura con GPU CUDA sin depender de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta; el autor indica que se probo en una GPU RTX A5000 de 24 GB y que las grabaciones mas largas requieren mas memoria.
- GPU recomendadas: RTX A5000 (24 GB) como referencia probada; por el tamano del checkpoint (8,67 mil millones de parametros en BF16, repositorio de 17,4 GB), se necesita una GPU con memoria amplia, como A100 o H100, para margen adicional con audios largos.
- Cabe en GPU de consumo: no confirmado en la informacion disponible; con 8,67 mil millones de parametros en BF16, una GPU de consumo de 24 GB queda en el limite y depende de la duracion del audio.
- Opciones de despliegue: script `inference.py` incluido en el repositorio, con la implementacion de VibeVoice fijada por Microsoft y decodificacion greedy; requiere Python 3.11+, CUDA y FFmpeg para formatos no soportados por SoundFile. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El parametro `--max-new-tokens` tiene valor por defecto 4096; si la generacion queda incompleta, el script devuelve codigo de salida 2 y conserva la salida parcial.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Diarizacion | Licencia | Formato |
|---|---|---|---|---|---|
| VibeVoice-CSK1 (este modelo) | ~8,67 mil millones | cs, sk | Si | MIT | safetensors (BF16) |
| microsoft/VibeVoice-ASR (base) | no disponible en la informacion | no disponible en la informacion | Si (arquitectura base) | no disponible en la informacion | no disponible en la informacion |
| Whisper large-v3 (referencia ASR) | no disponible en la informacion | multilingue | No nativa | no disponible en la informacion | no disponible en la informacion |

La comparacion con alternativas concretas no puede completarse con los datos proporcionados: solo se dispone de informacion detallada del modelo base y de este ajuste. No se dispone de resultados de benchmarks que permitan comparar rendimiento con otros sistemas ASR.

## Limitaciones y advertencias

- Cobertura linguistica limitada a checo y eslovaco; el rendimiento en otros idiomas no esta documentado y probablemente se degrade.
- Riesgo de alucinacion y de errores de transcripcion inherente a los modelos ASR, especialmente con audio ruidoso, acentos marcados o solapamiento de hablantes.
- La diarizacion puede confundir hablantes con voces similares o en conversaciones con muchas personas.
- Las grabaciones largas requieren mas memoria y pueden necesitar division en clips; una generacion incompleta devuelve codigo de salida 2 con salida parcial.
- El modelo se publica con 0 descargas y 0 likes en el momento de la consulta, sin validacion externa conocida; conviene evaluarlo en el dominio propio antes de usarlo en produccion.
- La licencia MIT permite uso comercial, pero se heredan las condiciones del modelo base microsoft/VibeVoice-ASR, cuyos terminos no se detallan en la informacion disponible.
- No se documentan limitaciones especificas de sesgo; al ser un ajuste sobre dos idiomas concretos, los sesgos del corpus de entrenamiento no estan caracterizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lofcz/VibeVoice-CSK1
- Modelo base: https://huggingface.co/microsoft/VibeVoice-ASR
- Repositorio de VibeVoice (Microsoft): https://github.com/microsoft/VibeVoice
- Receta oficial de fusion de LoRA: https://github.com/microsoft/VibeVoice/blob/16fb2cb1217c9934a886e1948ffb06120caa2df5/finetuning-asr/README.md#merging-lora-weights-optional
- Codigo de entrenamiento y evaluacion del autor: https://github.com/lofcz/asr
