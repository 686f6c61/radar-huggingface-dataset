# roryod/whisper-tiny_chinese_5c4

## Resumen

Whisper tiny chinese es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny, publicado por el usuario roryod en Hugging Face. Se trata de un modelo de reconocimiento automatico del habla (ASR) basado en la arquitectura encoder-decoder transformer de Whisper, con 37,7 millones de parametros totales y un peso en disco de aproximadamente 0,3 GB. El modelo parte de los pesos preentrenados de Whisper tiny y se ha reentrenado sobre el dataset denominado "chinese English" para mejorar el reconocimiento en ese dominio bilingue.

El modelo resuelve la tarea de transcripcion de audio a texto y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales mas alla de las de dicha licencia. Su tamano reducido lo hace adecuado para entornos con recursos limitados, prototipado rapido y despliegue en CPU o GPUs de gama baja, aunque a costa de una precision inferior a la de variantes mayores de Whisper.

Es relevante ahora como ejemplo de ajuste fino ligero sobre un modelo base abierto, util para quienes necesitan un transcriber especializado en un dataset concreto sin asumir el coste computacional de modelos como Whisper large. No obstante, la informacion publicada por el autor es escasa y la model card esta generada automaticamente, por lo que faltan detalles sobre composicion del dataset, procedimiento de evaluacion y limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny usa ventanas de audio de 30 s; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers, pero no declarada por el autor) |
| Idiomas soportados | en (segun metadatos); el dataset de entrenamiento se denomina "chinese English" |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Whisper original: un encoder transformer que procesa espectrogramas mel de audio y un decoder transformer autorregresivo que genera tokens de texto. Al derivar de openai/whisper-tiny, hereda su configuracion de capas, dimensiones y cabezas de atencion, aunque la model card no detalla esos valores numericos. El ajuste fino se realizo con el Trainer de Hugging Face (Transformers 5.21.0.dev0, PyTorch 2.11.0+cu130, Datasets 5.1.0, Tokenizers 0.23.3).

Los hiperparametros declarados son: learning rate de 1e-05, batch size de entrenamiento de 2, batch size de evaluacion de 1, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 500 pasos de warmup y 2000 pasos de entrenamiento totales. El entrenamiento se ejecuto durante aproximadamente 2,57 epocas sobre el dataset "chinese English". No se especifica el numero de tokens de audio ni la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF, DPO o aumentacion de datos. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Transcripcion de voz a texto (ASR) en ingles y, segun el nombre del dataset, posiblemente en contextos bilingues chino-ingles.
- Generacion de transcripciones con marcas de tiempo, heredadas de la arquitectura Whisper (no confirmado en la model card).
- Procesamiento de audio en ventanas de hasta 30 segundos, caracteristica estandar de Whisper tiny.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (modelo puramente ASR).
- Capacidades multilingues: limitadas al ingles segun metadatos; el chino no aparece declarado en el campo `language`.
- Capacidades especiales (thinking mode, vision, audio de entrada): solo audio de entrada; no hay modo de razonamiento ni vision.

## Casos de uso

- Transcripcion de reuniones y notas de voz en ingles: el modelo puede convertir grabaciones cortas en texto con un coste computacional minimo, adecuado para prototipos o herramientas internas donde no se requiere precision maxima.
- Subtitulado automatico de contenido audiovisual en ingles: dado su tamano reducido, puede desplegarse en servidores modestos para generar subtitulos preliminares que luego se revisan manualmente.
- Preprocesamiento de audio en pipelines de datos: util para transcribir grandes volumenes de audio en bruto antes de tareas de NLP posteriores, gracias a su bajo requisito de VRAM.
- Asistentes de voz embebidos en dispositivos de gama baja: al ocupar ~0,3 GB, puede ejecutarse en CPU o GPUs consumer para comandos de voz simples en ingles.
- Investigacion en ajuste fino de ASR: sirve como punto de partida para experimentos de fine-tuning sobre dominios especificos, dado que el autor documenta hiperparametros y curvas de entrenamiento.
- Evaluacion comparativa de modelos tiny: util como baseline en estudios sobre el equilibrio entre tamano y WER en tareas de reconocimiento de habla bilingue chino-ingles.
- Transcripcion en entornos con restricciones de privacidad: al poder ejecutarse localmente sin dependencias de API, permite procesar audio sensible sin salir de la infraestructura propia.

## Benchmarks y rendimiento

Datos declarados por el autor en la model-index (no verificados):

| Dataset | Split | Metrica | Valor |
|---|---|---|---|
| chinese English | test | WER | 13,4392 |

Resultados de validacion durante el entrenamiento:

| Epoch | Step | Validation loss | WER |
|---|---|---|---|
| 1,2837 | 1000 | 0,3156 | 14,2176 |
| 2,5674 | 2000 | 0,3070 | 13,4392 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision FP32 (37,7 M de parametros); en la practica, unos 150-300 MB para los pesos, mas memoria para activaciones y buffers de audio.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en GTX 1050, RTX 3050, RTX 4090, A100, H100 sin problemas, aunque el modelo no aprovecha el potencial de las GPUs de gama alta.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en CPUs.
- Opciones de despliegue: transformers (pipeline de automatic-speech-recognition), vLLM no aplica (no es un modelo de lenguaje generativo general), llama.cpp no soporta Whisper de forma nativa, Ollama no lo incluye por defecto; alternativas: faster-whisper, whisper.cpp (requiere conversion a GGML), TGI (soporte limitado para ASR).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera una latencia baja en GPU y moderada en CPU, pero no hay datos medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (dataset) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| roryod/whisper-tiny_chinese_5c4 | 37,7 M | no disponible | 13,44 (chinese English) | Apache 2.0 | Hugging Face |
| openai/whisper-tiny | 39 M (aprox.) | ventanas de 30 s | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| openai/whisper-base | 74 M (aprox.) | ventanas de 30 s | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| openai/whisper-small | 244 M (aprox.) | ventanas de 30 s | no disponible en esta ficha | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks comparables en la informacion proporcionada para establecer una comparacion cuantitativa fiable con las alternativas.

## Limitaciones y advertencias

- La model card esta generada automaticamente y contiene secciones sin completar ("More information needed"), lo que impide conocer la composicion exacta del dataset y el procedimiento de evaluacion.
- El WER de 13,44 no esta verificado (`verified: false`) y corresponde a un dataset no estandar ("chinese English"), por lo que no es directamente comparable con resultados publicados sobre LibriSpeech, Common Voice u otros benchmarks.
- El campo `language` solo declara ingles; aunque el dataset se llame "chinese English", no se confirma soporte real de chino en inferencia.
- Riesgo de alucinacion en transcripciones: como todo modelo Whisper, puede generar texto plausible en segmentos de silencio o ruido.
- Sesgos conocidos: no documentados por el autor; al derivar de Whisper tiny, hereda los sesgos del preentrenamiento original de OpenAI.
- Limitaciones de contexto: ventanas de audio de 30 segundos; audios mas largos requieren segmentacion manual o pipelines externos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda verificar las obligaciones de atribucion y las licencias del modelo base.
- Caveat para produccion: con solo 30 descargas y 0 likes, el modelo tiene un historial de uso minimo; no hay evidencia de robustez en dominios distintos al de entrenamiento.
- No se documentan tecnicas de mitigacion de alucinaciones ni procesos de validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/roryod/whisper-tiny_chinese_5c4
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Repositorio de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Documentacion de Transformers para ASR: https://huggingface.co/docs/transformers/tasks/asr
