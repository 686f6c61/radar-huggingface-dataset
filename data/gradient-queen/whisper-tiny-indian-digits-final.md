# gradient-queen/whisper-tiny-indian-digits-final

## Resumen

Whisper-tiny-indian-digits-final es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny, desarrollado por el usuario gradient-queen. Se trata de un modelo de reconocimiento automatico del habla (ASR) especializado en una tarea muy concreta: transcribir digitos hablados del 1 al 10 en ingles con acento indio. El modelo parte de la arquitectura encoder-decoder transformer de Whisper, con 37,7 millones de parametros totales, y ha sido entrenado sobre el dataset gradient-queen/spoken-digits-indian-english.

El problema que resuelve es acotado pero claro: los sistemas ASR genericos pueden fallar o mostrar sesgos en la transcripcion de digitos aislados con acentos no estandar, y este ajuste busca mejorar la precision en ese dominio especifico. No obstante, su alcance es limitado: no esta pensado para conversacion continua ni para vocabulario abierto, sino para pronunciaciones cortas y aisladas de numeros.

Es relevante ahora como ejemplo de especializacion de un modelo pequeno y de licencia permisiva (MIT) para tareas de nicho, lo que permite despliegues ligeros en entornos con recursos limitados. Sin embargo, la ausencia de benchmarks publicados y el caracter muy restringido del dominio hacen que deba evaluarse con cautela antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sequence-to-Sequence Audio Transformer (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper-tiny usa ventanas de audio de 30 s; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se detallan variantes GGUF u otras) |
| Idiomas soportados | Ingles (variantes de acento indio) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de openai/whisper-tiny: un transformer encoder-decoder disenado para ASR, con 37,7 millones de parametros. El ajuste fino se realizo sobre el dataset gradient-queen/spoken-digits-indian-english, con audio remuestreado a 16.000 Hz, mono, PCM, y transcripciones normalizadas en minusculas con etiquetas de palabra ("zero", "one", ..., "ten"). No se especifica el numero de tokens de audio ni la composicion detallada del dataset mas alla de su nombre y formato.

Los hiperparametros de entrenamiento indicados en la model card son: learning rate 1e-4, batch size 16, optimizador AdamW, 50 pasos de warmup, 500 pasos maximos y precision mixta fp16. No se menciona el uso de RLHF, DPO ni tecnicas de decodificacion especulativa. Tampoco se detallan innovaciones tecnicas adicionales mas alla del propio ajuste fino supervisado sobre el modelo base.

## Capacidades

- Reconocimiento automatico del habla (ASR) de digitos aislados del 1 al 10 en ingles con acento indio.
- Transcripcion de audio corto a texto con etiquetas de palabra normalizadas en minusculas.
- Inferencia mediante pipelines de Hugging Face Transformers (`automatic-speech-recognition`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles (variantes de acento indio); no se declaran otros idiomas.
- Capacidades especiales (modo thinking, vision, audio adicional): no disponibles; solo ASR de digitos.

## Casos de uso

- Sistemas de dictado de numeros por voz: el modelo puede transcribir digitos aislados pronunciados por hablantes de ingles indio, util en formularios o menus telefonicos donde se espera un numero del 1 al 10.
- Automatizacion de encuestas telefonicas: permite capturar respuestas numericas cortas en encuestas con hablantes de acento indio, reduciendo errores frente a un ASR generico.
- Verificacion de pronunciacion en aplicaciones educativas: puede usarse para comprobar si un estudiante ha pronunciado correctamente un digito en ingles indio.
- Prototipos de asistentes de voz con vocabulario cerrado: adecuado para demos o pruebas de concepto donde solo se esperan numeros aislados y se prioriza un modelo ligero (37,7 M de parametros).
- Clasificacion de comandos numericos en entornos con recursos limitados: su tamano reducido permite desplegarlo en dispositivos con poca VRAM o incluso en CPU para tareas de baja latencia.
- Filtrado o etiquetado de audio en pipelines de datos: puede emplearse para anotar automaticamente segmentos de audio que contienen digitos hablados en ingles indio, como paso previo a un procesamiento posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 37,7 millones de parametros, la huella es muy reducida; en fp16 se estima por debajo de 1 GB, aunque no se proporcionan cifras oficiales.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM es suficiente; no se especifican modelos concretos en la informacion disponible.
- Cabe en GPU de consumo: si, practicamente cualquier GPU de consumo actual e incluso en CPU para inferencia de baja carga.
- Opciones de despliegue: pipeline de Hugging Face Transformers; no se detallan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-tiny-indian-digits-final | 37,7 M | no disponible | sin benchmarks publicados | MIT | Hugging Face |
| openai/whisper-tiny | 39 M (aprox.) | ventanas de audio de 30 s | benchmarks publicados por OpenAI (no incluidos aqui) | MIT | Hugging Face |
| openai/whisper-base | 74 M (aprox.) | ventanas de audio de 30 s | benchmarks publicados por OpenAI (no incluidos aqui) | MIT | Hugging Face |

La comparativa se limita a modelos de la familia Whisper; no se dispone de datos de rendimiento del modelo ajustado frente a alternativas especializadas en digitos.

## Limitaciones y advertencias

- Optimizado exclusivamente para pronunciaciones cortas y aisladas de digitos; el rendimiento puede degradarse en frases conversacionales, digitos continuos o audio en otros idiomas.
- No se han publicado benchmarks ni metricas WER en la informacion disponible, pese a que la model card declara `metrics: wer`; no hay evidencia cuantitativa de su calidad.
- Riesgo de alucinacion: como todo modelo generativo de ASR, puede producir transcripciones plausibles pero incorrectas, especialmente fuera de su dominio.
- Sesgos conocidos: no se documentan sesgos especificos, pero al estar entrenado solo con acento indio, puede mostrar peor rendimiento con otros acentos o variedades del ingles.
- Restricciones de licencia: licencia MIT, que permite uso comercial con atribucion; no obstante, el modelo base openai/whisper-tiny tambien es MIT, por lo que no se identifican restricciones adicionales.
- Caveat para produccion: el modelo tiene 0 descargas y 0 likes en Hugging Face, lo que sugiere escasa validacion por parte de la comunidad; se recomienda evaluarlo con datos propios antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gradient-queen/whisper-tiny-indian-digits-final
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Dataset de entrenamiento: https://huggingface.co/datasets/gradient-queen/spoken-digits-indian-english
- Articulo de referencia sobre Whisper e idiomas indios: https://medium.com/@kartiksardadegana/teaching-whisper-to-understand-indian-languages-part-2-building-the-dataset-pipeline-3644859f84fd
