# distil-whisper/distil-large-v2

## Resumen

Distil-Whisper distil-large-v2 es un modelo de reconocimiento automatico del habla (ASR) en ingles, destilado a partir de OpenAI Whisper large-v2 mediante la tecnica de destilacion de conocimiento con pseudo-etiquetado a gran escala descrita en el paper *Robust Knowledge Distillation via Large-Scale Pseudo Labelling* (arXiv:2311.00430). Lo desarrolla el equipo distil-whisper de Hugging Face y se publica bajo licencia MIT.

El modelo reduce el numero de parametros de 1550 M (Whisper large-v2) a 756 M, lo que se traduce en un 49 % menos de peso y una latencia relativa aproximadamente 5,8 veces menor, manteniendo una tasa de error de palabra (WER) dentro del 1 % en conjuntos de evaluacion fuera de distribucion. Esta pensado para transcripcion de audio de corta y larga duracion en ingles, con soporte nativo en Transformers desde la version 4.35.

Es relevante porque permite desplegar ASR de calidad cercana a Whisper large-v2 en hardware mas modesto y con mayor throughput, lo que facilita su uso en produccion (subtitulado, asistentes de voz, pipelines de transcripcion masiva). No obstante, el autor recomienda migrar a distil-large-v3, que supera a esta version sin cambios de arquitectura y mejora la generacion secuencial de audio largo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper, destilado) |
| Parametros totales | 756.220.160 (756 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio de 30 s por chunk; audio largo mediante algoritmo de chunking (chunk_length_s=15 recomendado) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; soporta fp16/fp32 via Transformers) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (tambien pytorch, jax, onnx, tensorboard en el repo) |

## Arquitectura y entrenamiento

Distil-Whisper distil-large-v2 mantiene la arquitectura encoder-decoder de Whisper large-v2, pero reduce el numero de capas del decoder (de 32 a 2) para lograr la compactacion de parametros hasta 756 M. La destilacion se realiza mediante pseudo-etiquetado a gran escala: el modelo profesor (Whisper large-v2) genera transcripciones sobre un corpus de audio no etiquetado, y el modelo estudiante se entrena para reproducir esas predicciones, lo que permite aprovechar datos sin transcripciones humanas.

El entrenamiento se centra exclusivamente en ingles. El modelo emplea el algoritmo de chunking para audio largo, que segun el paper es 9 veces mas rapido que el algoritmo secuencial propuesto por OpenAI en Whisper (ver Tabla 7 del paper). No se dispone en la informacion proporcionada de detalles sobre el numero exacto de tokens de audio, composicion del dataset ni si se aplico RLHF/DPO (en ASR no es habitual).

## Capacidades

- Transcripcion de voz a texto en ingles para audio corto (menos de 30 segundos) mediante el pipeline `automatic-speech-recognition` de Transformers.
- Transcripcion de audio largo (mas de 30 segundos) mediante algoritmo de chunking con `chunk_length_s=15` y soporte de batching.
- Generacion de marcas de tiempo a nivel de palabra y de segmento (compatible con el pipeline de Whisper).
- Integracion con Transformers.js para ejecucion en navegador (tag `transformers.js`).
- Exportacion a ONNX y JAX ademas de PyTorch.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente ASR.
- Capacidad multilingue: no, solo ingles.
- No dispone de modo thinking, vision ni audio de entrada mas alla de la transcripcion.

## Casos de uso

- Subtitulado automatico de video en ingles: el modelo transcribe audio de larga duracion con chunking a 15 s y batching, lo que permite procesar horas de material con latencia baja (5,8 veces menor que Whisper large-v2) y generar subtitulos con marcas de tiempo.
- Transcripcion de reuniones y llamadas: al soportar audio largo mediante chunking, puede procesar grabaciones completas de reuniones en ingles y volcar el texto a sistemas de actas o busqueda interna.
- Asistentes de voz en tiempo real: su menor latencia relativa (5,8x frente a large-v2) y tamano de 756 M lo hacen apto para transcripcion casi en tiempo real en GPUs consumer o incluso CPU con cuantizacion adecuada.
- Pipelines de transcripcion masiva por lotes: el soporte de `batch_size` en el pipeline permite procesar grandes volumenes de audio (podcasts, archivos de call center) con throughput alto y coste reducido frente a large-v2.
- Indexacion y busqueda de contenido audiovisual: transcripcion de archivos de audio/video para alimentar motores de busqueda o sistemas RAG sobre contenido hablado en ingles.
- Ejecucion en navegador o edge: gracias al tag `transformers.js` y la exportacion ONNX, puede desplegarse en aplicaciones web cliente para dictado o transcripcion local sin enviar audio a servidores.
- Prototipado rapido en investigacion ASR: al ser compatible con el pipeline estandar de Transformers y estar bajo licencia MIT, sirve como base para experimentos de destilacion o fine-tuning en ingles.

## Benchmarks y rendimiento

Datos publicados en la model card del autor:

| Modelo | Parametros (M) | Latencia relativa | WER corto | WER largo |
|---|---|---|---|---|
| large-v3 | 1550 | 1,0 | 8,4 | 11,0 |
| large-v2 | 1550 | 1,0 | 9,1 | 11,7 |
| distil-large-v3 | 756 | 6,3 | 9,7 | 10,8 |
| distil-large-v2 | 756 | 5,8 | 10,1 | 11,6 |
| distil-medium.en | 394 | 6,8 | 11,1 | 12,4 |
| distil-small.en | 166 | 5,6 | 12,1 | 12,8 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval ni GSM8K (no aplican a un modelo ASR).

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,5-2 GB en fp16 para inferencia (756 M parametros); en fp32 en torno a 3 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; A100, H100, RTX 4090, RTX 3090, RTX 4080, RTX 3080, RTX 4070 y similares.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060 8 GB, etc.) e incluso en CPU con latencia mayor.
- Opciones de despliegue: Transformers (pipeline `automatic-speech-recognition`), Transformers.js (navegador), ONNX Runtime, JAX. No se mencionan vLLM, llama.cpp ni Ollama en la informacion disponible (no estan orientados a ASR encoder-decoder de este tipo).
- Latencia y throughput: la model card indica una latencia relativa de 5,8 frente a Whisper large-v2 (1,0) y que el algoritmo de chunking es 9 veces mas rapido que el secuencial de OpenAI para audio largo. No se proporcionan valores absolutos de latencia ni de RTF.

## Comparativa con modelos similares

| Modelo | Parametros (M) | Contexto audio | WER corto | WER largo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| distil-large-v2 | 756 | 30 s/chunk (chunking para largo) | 10,1 | 11,6 | MIT | Hugging Face |
| distil-large-v3 | 756 | 30 s/chunk (mejor secuencial) | 9,7 | 10,8 | MIT | Hugging Face |
| Whisper large-v2 | 1550 | 30 s/chunk | 9,1 | 11,7 | MIT | Hugging Face / OpenAI |
| Whisper large-v3 | 1550 | 30 s/chunk | 8,4 | 11,0 | MIT | Hugging Face / OpenAI |
| distil-medium.en | 394 | 30 s/chunk | 11,1 | 12,4 | MIT | Hugging Face |

Distil-large-v2 ofrece un equilibrio entre precision y coste: pierde aproximadamente 1 punto de WER corto frente a large-v2 pero es 5,8 veces mas rapido y un 49 % mas pequeno. Frente a distil-large-v3 queda ligeramente por detras en ambos WER, por lo que el autor recomienda esta ultima.

## Limitaciones y advertencias

- Solo soporta ingles; no transcribe otros idiomas (la model card indica que la destilacion multilingue esta en desarrollo).
- Riesgo de alucinacion en audio con ruido, silencios largos o musica, comun en modelos Whisper.
- Sesgos inherdados del corpus de entrenamiento de Whisper: posible peor rendimiento en acentos no estandar, audio telefónico o dominios especializados (medico, legal).
- El chunking puede introducir errores en los limites de segmento si el audio largo no se procesa con `chunk_length_s` adecuado (15 s recomendado).
- Aunque la licencia es MIT y permite uso comercial, conviene validar el rendimiento en el dominio concreto antes de produccion.
- Modelo superado por distil-large-v3; para nuevos despliegues se recomienda evaluar esta version mas reciente.
- No dispone de capacidades de razonamiento, tool calling ni agentes; su uso esta limitado a ASR.

## Enlaces

- Hugging Face: https://huggingface.co/distil-whisper/distil-large-v2
- Modelo recomendado (v3): https://huggingface.co/distil-whisper/distil-large-v3
- Paper Distil-Whisper: https://arxiv.org/abs/2311.00430
- Paper Whisper: https://arxiv.org/abs/2210.13352
- Repositorio de codigo y entrenamiento: https://github.com/huggingface/distil-whisper
- Codigo de entrenamiento: https://github.com/huggingface/distil-whisper/tree/main/training
- Whisper large-v2 (profesor): https://huggingface.co/openai/whisper-large-v2
- Whisper large-v3: https://huggingface.co/openai/whisper-large-v3
