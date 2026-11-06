# jtap123/whisper-tiny_british_english

## Resumen

`jtap123/whisper-tiny_british_english` es un ajuste fino (fine-tuning) del modelo de reconocimiento automatico del habla (ASR) `openai/whisper-tiny`, publicado por el usuario jtap123. El modelo parte de la arquitectura encoder-decoder transformer de Whisper en su variante mas pequena (37,76 millones de parametros) y ha sido reentrenado sobre un dataset de ingles britanico (`british_english_english`) para especializar la transcripcion en esa variedad dialectal del ingles.

El modelo resuelve una necesidad concreta: los modelos Whisper originales estan entrenados sobre una mezcla masiva y multilingue de audio, lo que puede penalizar el rendimiento en acentos y convenciones ortograficas especificas del ingles britanico. Este ajuste busca reducir la tasa de error de palabra (WER) en ese dominio concreto mediante un entrenamiento corto (2000 pasos) sobre un dataset especializado.

Es relevante ahora por su bajo coste computacional: con menos de 38 millones de parametros y un repositorio de 0,3 GB, es desplegable en hardware muy modesto (incluso CPU o GPUs de gama baja), lo que lo hace atractivo para transcripcion en tiempo real o en el borde (edge). No obstante, se trata de un modelo de nicho, con escasa documentacion y sin validacion externa de sus resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio por ventana (ventana estandar de Whisper) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantizacion estandar via transformers/optimum, no documentada por el autor) |
| Idiomas soportados | en (ingles, con foco en ingles britanico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `openai/whisper-tiny`: un transformer encoder-decoder con mecanismo de atencion estandar, entrenado originalmente por OpenAI para transcripcion y traduccion de voz. El encoder procesa espectrogramas Mel de audio en ventanas de 30 segundos y el decoder genera tokens de texto de forma autorregresiva.

El ajuste fino se realizo con el `Trainer` de Hugging Face sobre el dataset `british_english_english`. Los hiperparametros declarados son: learning rate de 1e-05, batch de entrenamiento de 2, batch de evaluacion de 1, optimizador AdamW (variante fused, betas 0.9/0.999, epsilon 1e-08), scheduler lineal con 500 pasos de warmup y un total de 2000 pasos de entrenamiento (aproximadamente 2 epocas). La semilla fue 42. No se documenta el tamano ni la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF, DPO o aumentacion de datos. La model card indica explicitamente "More information needed" en las secciones de descripcion, usos previstos y datos de entrenamiento.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles, con especializacion en ingles britanico.
- Transcripcion de audio de hasta 30 segundos por ventana; para audio mas largo requiere segmentacion o chunking.
- Generacion de transcripciones en texto plano con puntuacion y mayusculas segun el formato aprendido.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de capacidades de agente ni razonamiento multi-paso; es un modelo puramente ASR.
- Capacidad multilingue limitada al ingles (el ajuste puede haber reducido aun mas cualquier capacidad residual de otros idiomas del Whisper original).
- No incluye vision, audio generativo ni modo "thinking".

## Casos de uso

- Transcripcion de reuniones y notas de voz en entornos con hablantes de ingles britanico: el ajuste busca mejorar la precision en acentos y terminologia de esa variedad, con un coste de inferencia minimo.
- Subtitulado en tiempo real en aplicaciones de escritorio o moviles: sus 37,76 millones de parametros permiten ejecucion en CPU o GPUs integradas, adecuado para procesamiento local sin conexion.
- Preprocesado de audio para pipelines de NLP: convertir entrevistas o podcasts a texto antes de aplicar analisis de sentimiento, resumen o indexacion semantica.
- Asistentes de voz embebidos en dispositivos con recursos limitados (Raspberry Pi, moviles): el tamano del repositorio (0,3 GB) y la licencia Apache 2.0 facilitan su integracion en productos comerciales.
- Investigacion sobre adaptacion dialectal de modelos ASR: sirve como caso de estudio de fine-tuning de bajo coste sobre una variante regional concreta del ingles.
- Generacion de datasets etiquetados de audio: transcripcion masiva de grabaciones para construir corpus de texto alineado con audio en dominios especificos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados externamente):

| Metrica | Dataset | Split | Valor |
|---|---|---|---|
| WER | british_english English | test | 11,1326 |
| Loss (validacion) | british_english English | validacion | 0,2755 |

Evolucion del entrenamiento declarada:

| Paso | Epoca | Training loss | Validation loss | WER |
|---|---|---|---|---|
| 1000 | 0,9901 | 0,3020 | 0,2790 | 11,9347 |
| 2000 | 1,9802 | 0,1575 | 0,2755 | 11,1326 |

No se han publicado comparaciones con el modelo base `openai/whisper-tiny` ni con otros modelos en la informacion disponible. El WER de 11,13 % debe interpretarse con cautela: no hay verificacion independiente y el conjunto de evaluacion no esta descrito.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): en torno a 0,15-0,2 GB de pesos, mas overhead de activaciones; cabe holgadamente en cualquier GPU.
- VRAM en fp16/bf16: inferior a 0,1 GB de pesos; el cuello de botella es el procesamiento de audio, no la memoria.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, GTX 1650) funciona sobradamente; tambien es viable en CPU.
- Cabe en GPU consumer: si, en practicamente todas, incluidas GPUs integradas.
- Opciones de despliegue: transformers (pipeline `automatic-speech-recognition`), endpoints compatibles de Hugging Face, FriendliAI (mencionado en la busqueda web); tambien es posible exportarlo a ONNX o cuantizarlo con optimum para despliegue en edge.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera inferencia en tiempo real o mas rapida en hardware moderno, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | WER declarado |
|---|---|---|---|---|---|
| jtap123/whisper-tiny_british_english | 37,76 M | 30 s | en (britanico) | Apache 2.0 | 11,13 (dataset propio) |
| openai/whisper-tiny | 37,76 M | 30 s | multilingue | Apache 2.0 | no disponible en esta ficha |
| openai/whisper-base | 74,4 M | 30 s | multilingue | Apache 2.0 | no disponible en esta ficha |
| openai/whisper-small | 244 M | 30 s | multilingue | Apache 2.0 | no disponible en esta ficha |

La comparacion cuantitativa con el modelo base y con variantes mayores no puede establecerse con los datos disponibles; el autor no publica una evaluacion cruzada. En terminos de tamano, este ajuste ocupa el escalon mas bajo de la familia Whisper, lo que lo posiciona como opcion de maxima eficiencia y minima precision esperada frente a `whisper-base` o `whisper-small`.

## Limitaciones y advertencias

- Documentacion muy escasa: la model card contiene secciones sin completar ("More information needed"), lo que dificulta evaluar el alcance real del ajuste.
- Resultados no verificados: el WER de 11,13 % es declarado por el autor y no ha sido validado de forma independiente ni comparado con el modelo base.
- Dataset de entrenamiento no descrito: se desconoce su tamano, procedencia, calidad y posibles sesgos de acento, genero o edad de los hablantes.
- Sesgos desconocidos: al no documentarse la composicion del corpus, no es posible evaluar sesgos dialectales, de genero o sociolectales.
- Riesgo de alucinacion: como todo modelo Whisper, puede generar texto no presente en el audio, especialmente con ruido de fondo, silencios largos o audio musical.
- Limitacion de contexto: ventana maxima de 30 segundos por segmento; audio mas largo requiere segmentacion manual o con pipeline, lo que puede introducir errores en las fronteras.
- Restriccion idiomatica: aunque la licencia Apache 2.0 permite uso comercial, el modelo esta especializado en ingles britanico y su rendimiento en otros idiomas o acentos es incierto y probablemente degradado.
- Caveat para produccion: la ausencia de evaluacion en dominios reales (llamadas telefonicas, audio con ruido, multiples hablantes) aconseja validar el modelo con datos propios antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jtap123/whisper-tiny_british_english
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Endpoint de inferencia en FriendliAI: https://friendli.ai/models/jtap123/whisper-tiny_british_english
- Paper original de Whisper (referencia de la arquitectura base): no disponible en la busqueda web proporcionada.
