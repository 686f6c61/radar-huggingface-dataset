# roryod/whisper-tiny_british_5c4

## Resumen

Whisper tiny British es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny, publicado por el usuario roryod en Hugging Face. Se trata de un modelo de reconocimiento automatico del habla (ASR) especializado en ingles britanico, entrenado sobre el dataset naharte/british_english. El modelo parte de la arquitectura encoder-decoder transformer de Whisper, en su variante "tiny", la mas pequena de la familia.

Con 37.760.640 parametros totales y un tamano de repositorio de 0,3 GB, es un modelo muy ligero, pensado para tareas de transcripcion en entornos con recursos limitados o para despliegues en el borde (edge). Su relevancia radica en la especializacion dialectal: frente al whisper-tiny original, que se entrena con datos multilingues y heterogeneos, este ajuste busca mejorar la precision sobre acentos y variantes del ingles britanico.

La model card es escasa y generada automaticamente por el Trainer de Hugging Face; no incluye descripcion del modelo, usos previstos ni datos de entrenamiento detallados. El autor declara un WER de 13,3177 sobre el split de test del dataset British English, un valor que debe interpretarse con cautela al no estar verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny usa ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de openai/whisper-tiny: un transformer encoder-decoder con atencion estandar, disenado para transcribir audio en ventanas de 30 segundos. Whisper tiny es la variante mas pequena de la familia, con aproximadamente 39 millones de parametros en su version original; el ajuste conserva esa estructura y solo modifica los pesos mediante fine-tuning.

El entrenamiento se realizo sobre el dataset naharte/british_english con los siguientes hiperparametros declarados en la model card: learning rate de 1e-05, batch size de entrenamiento de 2, batch size de evaluacion de 1, semilla 42, optimizador AdamW (variante fused) con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 500 pasos de warmup y 2000 pasos totales de entrenamiento. La perdida de validacion final fue de 0,2952. No se especifica el numero de tokens de audio, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (no procede en un modelo ASR). El framework utilizado fue Transformers 5.21.0.dev0 con PyTorch 2.11.0+cu130.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles, con especializacion en ingles britanico.
- Transcripcion de audio a texto en ventanas de hasta 30 segundos por pasada (limitacion heredada de Whisper tiny).
- Procesamiento de audio mono a 16 kHz, segun el preprocesado estandar de Whisper.
- No soporta tool calling ni function calling.
- No esta disenado para agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al ingles (el modelo base es multilingue, pero el ajuste se ha realizado solo con datos en ingles).
- No incorpora vision, audio generativo ni modo "thinking".

## Casos de uso

- Transcripcion de reuniones y notas de voz en ingles britanico: el modelo puede convertir grabaciones cortas en texto, aprovechando su especializacion dialectal para reducir errores en acentos britanicos.
- Subtitulado automatico de videos en ingles: adecuado para generar subtitulos en contenido con hablantes de Reino Unido, con un coste computacional muy bajo.
- Prototipado rapido de pipelines ASR: su tamano reducido permite iterar y validar arquitecturas de transcripcion en maquinas sin GPU dedicada.
- Despliegue en dispositivos con recursos limitados (edge): al ocupar 0,3 GB en safetensors, puede ejecutarse en Raspberry Pi o moviles con cuantizacion adecuada (aunque no se documentan cuantizaciones oficiales).
- Preprocesado de datos de voz para entrenamiento de otros modelos: util para transcribir grandes volumenes de audio britanico de forma economica.
- Investigacion sobre adaptacion dialectal: sirve como caso de estudio de fine-tuning de Whisper sobre un dialecto concreto.
- Asistentes de voz locales en ingles britanico: integrable en aplicaciones de escritorio o domoticas que requieran transcripcion offline.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados):

| Metrica | Dataset | Split | Valor |
|---|---|---|---|
| WER | British English | test | 13,3177 |
| Loss (validacion) | British English | validacion | 0,2952 |

Evolucion durante el entrenamiento:

| Training loss | Epoca | Step | Validation loss | WER |
|---|---|---|---|---|
| 0,3261 | 0,9901 | 1000 | 0,3011 | 15,1155 |
| 0,1732 | 1,9802 | 2000 | 0,2952 | 13,3177 |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (FP32), dado que el modelo tiene 37,7 millones de parametros; en FP16 o cuantizacion de 8 bits, por debajo de 0,5 GB.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1060, RTX 2060, RTX 3060, RTX 4090) es mas que suficiente; tambien funciona en CPU.
- Cabe en cualquier GPU consumer e incluso en CPU y dispositivos embebidos.
- Opciones de despliegue: transformers (pipeline de automatic-speech-recognition), vLLM no aplica (es ASR), llama.cpp no soporta Whisper directamente, pero existen alternativas como whisper.cpp, faster-whisper y Ollama (con soporte limitado). El uso mas directo es mediante la libreria transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera una latencia muy baja en GPU y moderada en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (British English) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| roryod/whisper-tiny_british_5c4 | 37,7 M | 30 s audio | 13,32 (declarado) | apache-2.0 | Hugging Face |
| openai/whisper-tiny | ~39 M | 30 s audio | no disponible | apache-2.0 | Hugging Face |
| openai/whisper-base | ~74 M | 30 s audio | no disponible | apache-2.0 | Hugging Face |
| openai/whisper-small | ~244 M | 30 s audio | no disponible | apache-2.0 | Hugging Face |

No se dispone de resultados comparativos de WER para los modelos alternativos en el dataset British English en la informacion proporcionada.

## Limitaciones y advertencias

- La model card esta generada automaticamente y carece de informacion sobre usos previstos, limitaciones y composicion del dataset de entrenamiento.
- El WER declarado (13,32) no esta verificado por el autor ni por terceros.
- El modelo solo soporta ingles; no debe usarse para otros idiomas.
- Limitacion de contexto de audio: ventanas de 30 segundos, heredada de Whisper tiny; para audios mas largos es necesario segmentar.
- Riesgo de alucinacion en transcripciones: Whisper puede generar texto inventado en segmentos con ruido o silencio.
- Sesgos potenciales derivados del dataset de entrenamiento (naharte/british_english), cuya composicion no se detalla.
- Licencia apache-2.0 permite uso comercial, pero al ser un ajuste fino de Whisper tiny, se recomienda revisar las condiciones del modelo base.
- El modelo tiene muy pocas descargas (31) y ningun "like", lo que sugiere poca validacion por parte de la comunidad.
- No se documentan cuantizaciones oficiales ni formatos GGUF; el uso en produccion requeriria conversion manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/roryod/whisper-tiny_british_5c4
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Dataset: https://huggingface.co/datasets/naharte/british_english
- Repositorio de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/2212.04356
