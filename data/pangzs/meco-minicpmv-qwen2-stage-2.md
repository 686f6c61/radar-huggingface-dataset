# pangzs/MeCo-MiniCPMV-Qwen2-Stage-2

## Resumen

MeCo-MiniCPMV-Qwen2-Stage-2 es un checkpoint de la segunda etapa de entrenamiento de MeCo, un modelo de lenguaje y vision para video orientado a la localización temporal (temporal grounding). Lo desarrolla el autor identificado en Hugging Face como pangzs y se corresponde con el trabajo descrito en el artículo "Measure Twice, Cut Once: A Semantic-Oriented Approach to Video Temporal Localization with Video LLMs" (arXiv:2503.09027, aceptado en ICLR 2026). El modelo parte de MiniCPM-V 2.6, cuyo backbone de lenguaje es Qwen2-7B, y añade módulos de conexión visual (Q-Former, aggregator y projector) que se entrenan junto con el LLM mediante LoRA.

El problema que aborda es la localización de momentos concretos dentro de un vídeo a partir de una consulta en lenguaje natural, una tarea que los video LLM genéricos resuelven con precisión limitada cuando los límites temporales son finos o el vídeo es largo. MeCo propone un enfoque semántico en dos fases (de ahí "Measure Twice, Cut Once") que separa el razonamiento sobre el contenido del vídeo de la delimitación temporal exacta.

Este checkpoint concreto (Stage-2) es el destinado a conversación general sobre vídeo, tras una primera etapa de alineamiento. Cuenta con 8.794.455.040 parámetros (unos 8,8 mil millones) y un repositorio de 17,6 GB en formato safetensors. Es relevante para investigadores que trabajen en video question answering con marcas temporales, resumen de vídeo y recuperación de segmentos, y sirve como referencia reproducible del método descrito en el paper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (video LLM): vision encoder + Q-Former + aggregator + projector + LLM Qwen2-7B con LoRA |
| Parametros totales | 8.794.455.040 (8,8 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible como licencia propia; los pesos derivan de MiniCPM-V 2.6 y se rigen por la licencia de MiniCPM-V |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de MiniCPM-V 2.6: un codificador visual, un módulo de compresión y conexión (Q-Former, aggregator y projector) y un LLM Qwen2-7B como decodificador. En esta segunda etapa se entrenan el Q-Former, el aggregator, el projector y el LLM mediante LoRA, partiendo del checkpoint de la primera etapa (pangzs/MeCo-MiniCPMV-Qwen2-Stage-1). La etapa Stage-2 está etiquetada como "general chatting", es decir, orientada a conversación general sobre vídeo tras el alineamiento inicial.

El método MeCo, descrito en el paper, plantea un enfoque semántico en dos pasos para la localización temporal: primero se razona sobre la semántica del vídeo y después se delimitan los instantes de inicio y fin. El número de tokens de entrenamiento, la composición exacta del dataset y el uso de RLHF o DPO no se detallan en la información disponible.

## Capacidades

- Generación de texto y conversación multi-turno sobre contenido de vídeo (pipeline video-text-to-text).
- Localización temporal (temporal grounding): identificación de segmentos concretos dentro de un vídeo a partir de una consulta en lenguaje natural.
- Comprensión de vídeo combinada con el backbone de lenguaje Qwen2-7B.
- Respuesta a preguntas sobre vídeo (video question answering) con referencias temporales.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión de imagen, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Localización de momentos en vídeo: dada una consulta como "el momento en que se explica el presupuesto", el modelo devuelve los límites temporales del segmento; es el caso de uso central del paper y para el que se entrena específicamente.
- Búsqueda semántica en archivos de vídeo: indexar vídeos largos y permitir consultas en lenguaje natural que devuelvan clips concretos, aprovechando la orientación semántica del método MeCo.
- Resumen de vídeo con marcas temporales: generar descripciones de contenido asociadas a intervalos de tiempo, útil en herramientas de edición o revisión de material audiovisual.
- Video question answering en investigación: evaluar y reproducir los resultados del paper sobre benchmarks de localización temporal y QA de vídeo.
- Análisis de material docente o de reuniones grabadas: extraer los tramos relevantes de una clase o reunión a partir de preguntas del usuario.
- Anotación asistida de datasets de vídeo: generar propuestas de segmentos temporales que un anotador humano revise, reduciendo el coste de etiquetado.
- Prototipos de asistentes sobre vídeo: integrar el modelo en una aplicación de chat que responda preguntas sobre un vídeo cargado, usando transformers como vía de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper asociado (arXiv:2503.09027) es la referencia donde deben consultarse las métricas del método MeCo; esta ficha no incluye cifras porque no se han proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8,8 B parámetros en fp16 se requieren aproximadamente 17,6 GB solo para los pesos, más memoria para el codificador visual, el procesamiento de vídeo y el KV cache; en la práctica, alrededor de 20-24 GB en fp16.
- Cuantización: en 8 bits, aproximadamente 9-10 GB de pesos; en 4 bits, aproximadamente 5-6 GB, aunque los tipos de cuantización soportados no están documentados.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para fp16 sin restricciones y vídeos largos; RTX 4090 (24 GB) es viable en fp16 con vídeos cortos y batch pequeño.
- GPU de consumo: una RTX 3090 o 4090 de 24 GB puede ejecutar el modelo en fp16 con margen ajustado; con cuantización a 8 o 4 bits cabría en GPUs de 12-16 GB, aunque no hay recetas oficiales publicadas.
- Opciones de despliegue: transformers es la librería indicada en la model card; vLLM, llama.cpp, Ollama o TGI no están confirmados para esta arquitectura multimodal concreta. El repositorio de GitHub de MeCo incluye instrucciones de instalación e inferencia.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MeCo-MiniCPMV-Qwen2-Stage-2 | 8,8 B | no disponible | Video LLM con localización temporal semántica en dos fases | Derivada de MiniCPM-V | Hugging Face (pangzs) |
| MiniCPM-V 2.6 | no disponible en la información | no disponible | Video LLM generalista (modelo base) | Licencia MiniCPM-V | Hugging Face (openbmb) |
| MeCo-MiniCPMV-Qwen2-Stage-1 | no disponible en la información | no disponible | Etapa 1 del mismo método (alineamiento) | Derivada de MiniCPM-V | Hugging Face (pangzs) |

La comparación con otros video LLM especializados en grounding temporal no puede completarse con los datos disponibles. Las alternativas más directas documentadas son el propio modelo base MiniCPM-V 2.6 y el checkpoint de la etapa anterior del mismo proyecto.

## Limitaciones y advertencias

- Es un checkpoint de investigación: el autor no publica métricas de robustez ni evaluación de sesgos en la model card.
- Riesgo de alucinación: como todo LLM, puede generar descripciones o límites temporales que no correspondan al contenido real del vídeo; conviene validar las marcas temporales en producción.
- Licencia: no hay licencia propia declarada; los pesos derivan de MiniCPM-V 2.6 y su uso queda sujeto a la licencia de MiniCPM-V, que debe revisarse antes de cualquier uso comercial.
- Idiomas soportados no documentados: no se puede garantizar el rendimiento en castellano ni en idiomas distintos de los usados en el entrenamiento del backbone.
- Longitud de contexto y duración máxima de vídeo no disponibles: el rendimiento en vídeos largos no está caracterizado en la información proporcionada.
- Sin datos de cuantización ni de despliegue en motores de inferencia de alto rendimiento (vLLM, TGI), lo que limita las estimaciones de latencia y throughput.
- Popularidad nula en el momento de la ficha (0 descargas, 0 likes): no hay evidencia de uso en comunidad ni informes independientes de calidad.
- El pipeline declarado es video-text-to-text; no debe asumirse soporte de imagen estática, audio u otras modalidades sin verificación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pangzs/MeCo-MiniCPMV-Qwen2-Stage-2
- Checkpoint de la etapa 1: https://huggingface.co/pangzs/MeCo-MiniCPMV-Qwen2-Stage-1
- Paper: https://arxiv.org/abs/2503.09027
- Repositorio GitHub de MeCo: https://github.com/pangzss/MeCo
- Modelo base MiniCPM-V 2.6: https://huggingface.co/openbmb/MiniCPM-V-2_6
