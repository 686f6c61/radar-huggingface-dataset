# Maxkuo/MOSS-Transcribe-Diarize-mlx-q8

## Resumen

MOSS-Transcribe-Diarize-mlx-q8 es una conversión de 8 bits para MLX del modelo OpenMOSS-Team/MOSS-Transcribe-Diarize, un sistema de reconocimiento de voz con diarización de hablantes (es decir, transcribe audio e identifica quién habla en cada momento). Lo publica Maxkuo como artefacto derivado, pensado para su integración en la aplicación mac-toolbox sobre Apple Silicon, no como modelo original.

El modelo base combina un encoder de audio tipo Whisper con un decoder de texto derivado de Qwen3 y un adaptador VQ intermedio, sumando 908.513.280 parámetros. Esta variante cuantiza a 8 bits (affine, group size 64) únicamente el decoder de texto y los embeddings compartidos, manteniendo el encoder Whisper y el adaptador VQ en BF16, lo que reduce el peso del repositorio a 1,3 GB.

Su relevancia práctica es acotada: es una conversión de referencia para ejecutar transcripción con diarización en hardware Apple mediante la librería mlx-audio, con licencia Apache-2.0 y verificación de equivalencia byte a byte frente a la cuantización en memoria del modelo original en seis ventanas de AliMeeting R8009.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de audio tipo Whisper + adaptador VQ + decoder de texto Qwen3 (cuantizado selectivamente) |
| Parametros totales | 908.513.280 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 8 bits affine, group size 64 (decoder y embeddings); BF16 para encoder y adaptador VQ |
| Idiomas soportados | No disponibles (la verificacion del autor usa el prompt oficial en chino) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), con codigo custom (`modeling_moss_transcribe_diarize.py`) |

## Arquitectura y entrenamiento

La arquitectura es un pipeline multimodal de audio a texto: un encoder de audio basado en Whisper extrae representaciones del audio, un adaptador VQ las proyecta al espacio del decoder, y un decoder de texto de la familia Qwen3 genera la transcripción y las etiquetas de hablante. El modelo base procede de OpenMOSS-Team (revision `704aa4a9c304e8520be88901e0d1960158ef5b15`), pero en la información disponible no se detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

La innovación de esta variante concreta es la cuantización selectiva: el `model_quant_predicate` del modelo original excluye el encoder Whisper y el adaptador VQ de la cuantización, de modo que solo el decoder de texto y los embeddings compartidos se guardan en 8 bits. La conversión se realizó con mlx-audio 0.6.1 y mlx 0.32.4, y la verificación del autor compara la salida cruda (greedy, prompt oficial en chino) contra la cuantización en memoria del modelo BF16 original, obteniendo coincidencia byte a byte en 6 de 6 ventanas de ~5 minutos de AliMeeting R8009.

## Capacidades

- Reconocimiento automático de voz (ASR) sobre audio en formato conversacional.
- Diarización de hablantes: atribución de segmentos de texto a hablantes identificados.
- Procesamiento de audio de reuniones y conversaciones multipartito (validado sobre AliMeeting en la verificación del autor).
- Generación de transcripciones con prompt de sistema en chino (el prompt oficial usado en la verificación).
- Ejecución nativa en Apple Silicon mediante MLX y la librería mlx-audio.
- No se documentan capacidades de tool calling, function calling, agentes, visión ni audio generativo.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Transcripción de reuniones con atribución de hablantes: el modelo genera texto y etiquetas de hablante en una sola pasada, adecuado para actas automáticas en entornos Apple Silicon.
- Actas y resúmenes posteriores: al producir transcripciones diarizadas, alimenta pipelines de resumen sin necesidad de post-procesar la separación de voces.
- Subtitulado de conversaciones multipartito: útil en grabaciones de entrevistas o paneles donde importa distinguir interlocutores.
- Archivado y búsqueda de audio corporativo: transcripciones con hablante permiten indexar y recuperar fragmentos por persona.
- Prototipado local en macOS: al ser una conversión MLX de 1,3 GB, permite experimentar con ASR y diarización sin GPU dedicada ni servicios en la nube.
- Evaluación de cuantización para despliegue: sirve como referencia reproducible (hashes SHA-256 publicados) para validar pipelines de cuantización MLX antes de adoptarlos en producción.
- Integración en aplicaciones de escritorio: la model card indica su uso por la app mac-toolbox, por lo que encaja en herramientas nativas que necesiten transcripción offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica reportada por el autor es de equivalencia funcional: salida byte-idéntica frente a la cuantización en memoria del modelo BF16 original en 6/6 ventanas de AliMeeting R8009 con decodificación greedy.

## Requisitos de hardware

- VRAM/unificada estimada: el repositorio pesa 1,3 GB; en Apple Silicon la memoria unificada necesaria para inferencia ronda ese tamaño más overhead de activaciones y buffers de audio, no cuantificado en la información disponible.
- GPU recomendadas: hardware Apple Silicon con soporte MLX (serie M). No está pensado para CUDA; no se documentan requisitos para A100, H100 o RTX 4090.
- Cabe en GPU consumer: sí, en equipos Apple Silicon con memoria unificada suficiente; no se especifica el mínimo exacto.
- Opciones de despliegue: mlx-audio (librería declarada); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Diarizacion | Licencia | Formato |
|---|---|---|---|---|---|
| MOSS-Transcribe-Diarize-mlx-q8 (esta ficha) | 908.513.280 | No disponible | Si | Apache-2.0 | safetensors MLX 8-bit |
| OpenMOSS-Team/MOSS-Transcribe-Diarize (base) | 908.513.280 | No disponible | Si | Apache-2.0 | safetensors BF16 |
| Whisper large-v3 | No disponible en la informacion | No disponible | No (ASR solo) | No disponible en la informacion | No disponible en la informacion |

La comparación con alternativas de ASR con diarización queda limitada a lo anterior; no hay datos de benchmarks que permitan contrastar calidad frente a otros sistemas.

## Limitaciones y advertencias

- Es una conversión de terceros, no el modelo oficial: cualquier incidencia debe contrastarse contra OpenMOSS-Team/MOSS-Transcribe-Diarize.
- La cuantización de 8 bits puede degradar la calidad frente al BF16 original en audio distinto al de la verificación; la equivalencia byte a byte solo se comprobó en seis ventanas de AliMeeting R8009 en chino.
- Solo se valida con el prompt oficial en chino; el rendimiento en otros idiomas no está documentado.
- Requiere código custom (`trust_remote_code`) para cargar el modelo, lo que implica revisar `modeling_moss_transcribe_diarize.py` antes de usarlo en producción.
- Dependencia de MLX y mlx-audio: no es portable a CUDA ni a stacks estándar de Hugging Face Transformers sin adaptación.
- Riesgo de alucinación en ASR: posible inserción de texto no pronunciado o atribución errónea de hablante en solapamientos y ruido, no cuantificado en la información disponible.
- Sesgos: no documentados; dependen del dataset de entrenamiento del modelo base, no descrito aquí.
- Licencia Apache-2.0 permite uso comercial, pero conviene conservar los avisos de atribución del modelo base y verificar los términos de los pesos originales.
- Repositorio con 23 descargas y 0 likes: poca validación comunitaria; tratar como artefacto experimental.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Maxkuo/MOSS-Transcribe-Diarize-mlx-q8
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Transcribe-Diarize
- Librería mlx-audio: no disponible en la información proporcionada
- Paper, blog o demo: no disponible en la información proporcionada
