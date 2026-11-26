# efficient-speech/Voxtral-Small-24B-2507-MLX-BF16

## Resumen

Voxtral-Small-24B-2507-MLX-BF16 es una conversión a formato MLX en bfloat16 del modelo multimodal Voxtral-Small-24B-2507 de Mistral AI. Voxtral combina un codificador de audio con un modelo de lenguaje de 24 000 millones de parámetros para realizar transcripción de voz y respuesta a preguntas sobre audio, cubriendo tanto reconocimiento automático del habla (ASR) como comprensión semántica del contenido hablado. Esta versión concreta la publica el proyecto Efficient Speech (Universidad de Washington, grupo SYFI) como artefacto de acompañamiento de su sistema de inferencia Murmur, orientado a reconocimiento de voz de formato largo.

El interés de esta ficha reside en que permite ejecutar un modelo de voz de 24B en hardware Apple Silicon mediante MLX, sin depender de CUDA ni de GPUs de datacenter. Frente al checkpoint original en PyTorch, esta conversión ofrece pesos en bfloat16 listos para el runtime `mlx-voxtral`, lo que simplifica el despliegue en Macs con memoria unificada amplia. El repositorio ocupa 49,9 GB y contiene 24 932 889 600 parámetros según los safetensors publicados.

La licencia Apache 2.0 del modelo base se mantiene en esta conversión, lo que facilita su uso comercial. No obstante, la model card es mínima: no documenta idiomas soportados, composición del dataset de entrenamiento ni resultados de benchmarks, por lo que buena parte de las especificaciones deben remitirse al modelo original de Mistral AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal audio-texto; codificador de audio + LLM, segun el modelo base) |
| Parametros totales | 24 932 889 600 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (esta conversion); otras cuantizaciones no disponibles en este repo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX, bfloat16) |

## Arquitectura y entrenamiento

La model card de esta conversión no describe la arquitectura interna. Por el pipeline declarado (`automatic-speech-recognition`) y por el modelo base Voxtral-Small-24B-2507 de Mistral AI, se trata de un modelo multimodal que acepta audio y texto: un codificador de audio transforma la señal en representaciones que un LLM de 24B consume para transcribir o responder preguntas. El tag `base_model:finetune` sugiere que el checkpoint upstream ya incorpora ajuste fino sobre el modelo preentrenado, aunque no se detalla el proceso.

El trabajo técnico de esta publicación es la conversión de pesos de PyTorch a MLX en bfloat16, validada con el runtime `mlx-voxtral==0.0.6`. No se aportan datos sobre número de tokens de entrenamiento, composición del corpus, uso de RLHF/DPO ni innovaciones de decodificación. Cualquier detalle arquitectónico adicional debe consultarse en la model card del modelo original de Mistral AI.

## Capacidades

- Transcripción de voz a texto (ASR) sobre audio de entrada.
- Respuesta a preguntas sobre audio: el modelo acepta audio y texto y genera respuestas en lenguaje natural.
- Procesamiento de audio de formato largo, según el sistema Murmur con el que se publica esta conversión.
- Ejecución en Apple Silicon mediante MLX, con soporte de bfloat16.
- Capacidades multilingües: no documentadas en esta model card.
- Tool calling, agentes, visión o audio-vision: no disponibles en la información proporcionada.

## Casos de uso

- Transcripción de reuniones en local: ejecutar `mlx-voxtral.generate` sobre grabaciones de varios hablantes en un Mac con memoria unificada suficiente, sin enviar audio a servicios externos.
- Subtitulado de contenido audiovisual: generar transcripciones de vídeos o pódcasts de formato largo aprovechando el enfoque de Murmur para audio extenso.
- Preguntas sobre grabaciones: consultar el contenido de una entrevista o clase grabada formulando preguntas en texto, gracias a la capacidad de QA sobre audio del modelo base.
- Investigación en ASR: usar el checkpoint como referencia BF16 en experimentos de reconocimiento de voz con MLX, comparando frente a cuantizaciones menores.
- Prototipado en estaciones de trabajo Apple: desarrollar pipelines de voz sin GPU NVIDIA, aprovechando la integración con el ecosistema MLX.
- Archivado y búsqueda de audio corporativo: transcribir y consultar archivos de audio internos manteniendo los datos en infraestructura propia, dado que el modelo se ejecuta localmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria: al ser BF16 con 24 932 889 600 parámetros, los pesos ocupan aproximadamente 49,9 GB; se necesita memoria unificada disponible por encima de esa cifra para cargar el modelo, más margen para el codificador de audio y el contexto.
- GPU recomendadas: hardware Apple Silicon con memoria unificada amplia (por ejemplo, configuraciones de 64 GB o superiores); no aplica a GPUs NVIDIA en esta conversión, que es específica de MLX.
- Cabe en consumer GPU: no en GPUs de consumo con 24 GB o menos en BF16; en Apple Silicon de gama alta con memoria unificada suficiente, sí.
- Opciones de despliegue: runtime `mlx-voxtral` (versión 0.0.6 validada) y el sistema Murmur; vLLM, llama.cpp, Ollama o TGI no están indicados para esta conversión MLX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato/plataforma | Notas |
|---|---|---|---|---|---|
| Voxtral-Small-24B-2507-MLX-BF16 (este) | 24,9B | no disponible | Apache 2.0 | MLX BF16, Apple Silicon | Conversion de Efficient Speech para Murmur |
| mistralai/Voxtral-Small-24B-2507 | 24,9B (segun modelo base) | no disponible | Apache 2.0 | PyTorch (upstream) | Modelo original de Mistral AI |
| Alternativas ASR de menor tamano (p. ej. Whisper) | no disponible | no disponible | no disponible | multiples | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- La model card es mínima: no documenta idiomas, sesgos, datos de entrenamiento ni evaluación, lo que dificulta estimar su calidad en dominios concretos.
- Riesgo de alucinación inherente a los modelos generativos: las respuestas a preguntas sobre audio pueden contener información no presente en la grabación.
- El formato MLX limita el despliegue a Apple Silicon; no es portable a CUDA sin reconversión.
- El uso en BF16 exige alrededor de 50 GB de memoria solo para pesos, lo que excluye la mayoría de equipos de consumo.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base y de los datasets de audio utilizados en producción.
- No hay garantías de rendimiento publicadas para esta conversión; el autor solo indica que fue probada con `mlx-voxtral==0.0.6`.
- El repositorio no registra descargas ni valoraciones, por lo que su madurez en producción es desconocida.

## Enlaces

- Hugging Face: https://huggingface.co/efficient-speech/Voxtral-Small-24B-2507-MLX-BF16
- Modelo base: https://huggingface.co/mistralai/Voxtral-Small-24B-2507
- Repositorio Murmur: https://github.com/uw-syfi/Murmur
- Runtime mlx-voxtral: no disponible como enlace directo en la informacion proporcionada
