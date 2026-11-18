# alphaedge-ai/whisper-base-bel-16384

## Resumen

whisper-base-bel-16384 es un modelo de reconocimiento automatico del habla (ASR) derivado de openai/whisper-base, especializado en bielorruso (codigo ISO `be`). Lo publica el usuario alphaedge-ai aplicando la tecnica de *trimming* de vocabulario descrita por Loick Bourdois en el blog de Hugging Face. El modelo conserva la arquitectura encoder-decoder transformer original de Whisper, pero reduce el vocabulario de 51.865 a 16.384 tokens, lo que elimina los tokens poco frecuentes en bielorruso y deja un modelo un 25,02 % mas pequeno.

El resultado son 54.427.648 parametros frente a los 72.593.920 del original, con un repositorio de solo 0,1 GB en formato safetensors. La motivacion es clara: desplegar ASR en bielorruso con menor huella de memoria y latencia sin renunciar a la calidad del modelo base en ese idioma. Es relevante para entornos con recursos limitados (CPU, GPUs de gama baja, dispositivos embebidos) que necesitan transcripcion en una lengua con poca cobertura en los modelos ASR generalistas.

La contrapartida es que el recorte de vocabulario degrada el rendimiento en otros idiomas, por lo que el modelo debe tratarse como monolinguee en la practica. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 54.427.648 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper) |
| Tipos de cuantizacion | no disponible en la model card; el formato safetensors es compatible con cuantizacion posterior (int8, fp16, etc.) |
| Idiomas soportados | bielorruso (`be`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de openai/whisper-base: un encoder-decoder transformer con atencion estandar, entrenado originalmente por OpenAI con supervision debil a gran escala sobre audio y transcripciones (paper arXiv:2212.04356). Whisper procesa audio remuestreado a 16 kHz y genera texto autoregresivamente con tokens especiales de idioma y tarea.

La innovacion de esta version no esta en el entrenamiento sino en la compresion del vocabulario. Se minaron 200.000 textos del dataset lbourdois/fineweb-2-trimming para identificar los tokens realmente utilizados en bielorruso y se recorto el vocabulario del tokenizer de 51.865 a 16.384 entradas (reduccion del 68,41 %). Esto reduce la matriz de embeddings y la capa de salida, que en Whisper representan una fraccion significativa de los parametros, y explica la caida del 25,02 % en el total. No se indica en la informacion disponible si hubo reentrenamiento adicional, fine-tuning o ajuste con RLHF/DPO tras el recorte; la model card sugiere que el modelo recortado "deberia comportarse de forma similar al original" en el idioma objetivo, lo que apunta a un proceso de destilacion de vocabulario sin reentrenamiento completo.

## Capacidades

- Transcripcion automatica de voz en bielorruso con la API `pipeline` de transformers.
- Generacion de transcripciones con marcas de tiempo opcionales (capacidad heredada de Whisper, aunque no se documenta explicitamente en la model card).
- Soporte de tareas de traduccion y transcripcion mediante `generate_kwargs` (`task: transcribe` o `task: translate`), aunque el recorte de vocabulario puede degradar la traduccion a otros idiomas.
- Procesamiento de audio a 16 kHz con ventanas de 30 segundos propias de Whisper.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente ASR.
- Capacidades multilingues muy limitadas: el vocabulario recortado elimina tokens de otros idiomas, por lo que el uso fuera del bielorruso no esta garantizado.
- Compatible con endpoints de Hugging Face (tag `endpoints_compatible`) y con la libreria `transformers`.

## Casos de uso

- Transcripcion de archivos de audio en bielorruso para archivos, medios de comunicacion o patrimonio oral: el modelo procesa audio a 16 kHz y devuelve texto plano, adecuado para digitalizar entrevistas o grabaciones historicas.
- Subtitulado automatico de videos en bielorruso: al ser un modelo pequeno (0,1 GB), puede ejecutarse en pipelines de postproduccion sin GPU dedicada y generar subtitulos en lotes.
- Asistentes de voz en bielorruso para aplicaciones moviles o web: la reduccion de parametros permite inferencia en CPU o GPUs de gama baja, con menor latencia que whisper-base completo.
- Investigacion linguistica y corpus de habla bielorrusa: util para anotar grandes volumenes de audio en proyectos academicos con recursos limitados.
- Sistemas de atencion al cliente por voz en bielorruso: transcripcion de llamadas para su posterior analisis o enrutamiento, siempre que el dominio acustico sea razonablemente limpio.
- Despliegue en dispositivos embebidos o edge (Raspberry Pi, mini-PC): el tamano reducido y la licencia Apache 2.0 facilitan integrar ASR bielorruso en hardware modesto.
- Generacion de datos de entrenamiento para otros modelos: transcripciones masivas de audio bielorruso como paso previo a fine-tuning de modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta comparativas de tamano (vocabulario y parametros) frente a openai/whisper-base, sin metricas de WER, MMLU ni similares.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,2-0,3 GB (54,4 M parametros); en fp16 aproximadamente 0,1-0,15 GB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. En GPU, cualquier modelo desde una GTX 1050 o RTX 3050 en adelante es suficiente; A100/H100 no aportan ventaja significativa por el tamano.
- Cabe en GPU consumer: si, en todas las gamas actuales (RTX 20xx, 30xx, 40xx, e incluso iGPU).
- Opciones de despliegue: `transformers` con `pipeline("automatic-speech-recognition")`, Hugging Face Inference Endpoints (tag `endpoints_compatible`), y potencialmente llama.cpp/Ollama no aplican porque no es un modelo de lenguaje; vLLM y TGI no estan orientados a ASR encoder-decoder de este tipo.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano, se espera del orden de decenas de milisegundos por ventana de 30 s en GPU moderna y varios cientos de milisegundos en CPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Vocabulario | Idiomas | Licencia | Contexto audio |
|---|---|---|---|---|---|
| alphaedge-ai/whisper-base-bel-16384 | 54,4 M | 16.384 | be | Apache 2.0 | 30 s (Whisper) |
| openai/whisper-base | 72,6 M | 51.865 | multilingue (99 idiomas) | Apache 2.0 | 30 s (Whisper) |
| openai/whisper-small | 244 M | 51.865 | multilingue | Apache 2.0 | 30 s (Whisper) |
| openai/whisper-tiny | 39 M | 51.865 | multilingue | Apache 2.0 | 30 s (Whisper) |

La comparativa se limita a la familia Whisper porque no se han identificado en la informacion disponible otros modelos ASR especificos para bielorruso con los que contrastar. Frente a whisper-base, este modelo reduce parametros un 25,02 % y vocabulario un 68,41 %, a costa de perder cobertura multilingue. Frente a whisper-tiny, ofrece mas capacidad (54,4 M vs 39 M) pero sigue siendo mas ligero que whisper-base.

## Limitaciones y advertencias

- El recorte de vocabulario elimina tokens de otros idiomas; el rendimiento fuera del bielorruso puede degradarse notablemente, segun advierte la propia model card.
- Riesgo de alucinacion y errores en audio con ruido, acentos no estandar o vocabulario tecnico, inherente a Whisper base.
- No se han publicado evaluaciones de WER en bielorruso en la informacion disponible; el rendimiento real en produccion no esta verificado.
- Sesgos: al derivar de Whisper, hereda los sesgos del corpus de entrenamiento original (dominado por ingles y otras lenguas mayoritarias), lo que puede afectar a la representacion de variedades dialectales bielorrusas.
- Limitacion de contexto: ventana de audio de 30 s por pasada; audios mas largos requieren segmentacion manual o chunking.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, pero conviene conservar el aviso de copyright y las atribuciones a OpenAI y al trabajo de trimming.
- El modelo tiene muy pocas descargas (56) y cero likes en el momento de la consulta, lo que sugiere poca validacion comunitaria; conviene evaluarlo en el dominio concreto antes de produccion.
- No es un modelo de lenguaje: no soporta chat, tool calling ni razonamiento; su unico proposito es ASR.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/whisper-base-bel-16384
- Modelo base: https://huggingface.co/openai/whisper-base
- Dataset de minado: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Blog de introduccion al trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Paper de Whisper: https://arxiv.org/abs/2212.04356
