# JohnCheng/gemma-4-26b-sp-oc-exp1-ep1.5

## Resumen

JohnCheng/gemma-4-26b-sp-oc-exp1-ep1.5 es un ajuste experimental (fine-tune) del modelo Gemma 4 26B de Google DeepMind, realizado por el usuario JohnCheng. El nombre sugiere un entrenamiento supervisado con una sola pasada y media (1.5 épocas) sobre un dataset no especificado. Se trata de un modelo multimodal (image-text-to-text) que acepta tanto imágenes como texto como entrada, y está orientado a conversación.

La relevancia de este modelo reside en que parte de la arquitectura Gemma 4, que Google DeepMind ha publicado como parte de su familia de modelos abiertos. Gemma 4 26B es un modelo de tipo Mixture-of-Experts (MoE) con 26.000 millones de parámetros totales y aproximadamente 4.000 millones de parámetros activos por token, lo que lo hace relativamente eficiente en inferencia. El contexto nativo alcanza los 256.000 tokens, una ventaja notable para tareas de razonamiento de largo alcance y procesamiento de documentos extensos.

El modelo está publicado con acceso restringido (gated) en HuggingFace, por lo que requiere aceptar condiciones adicionales. No se ha publicado ninguna información sobre el dataset de entrenamiento, los resultados de benchmarks ni la licencia, lo que limita su uso directo en producción sin una evaluación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en Gemma 4 26B (A4B) |
| Parametros totales | 25.805.933.872 (25,8B) |
| Parametros activos | ~4.000 millones (4B) |
| Longitud de contexto | Hasta 256K tokens (nativo del modelo base) |
| Tipos de cuantizacion | No disponible (repo solo contiene safetensors en precision nativa) |
| Idiomas soportados | No disponible para este ajuste; el modelo base Gemma 4 soporta mas de 140 idiomas |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 26B, una arquitectura Mixture-of-Experts (MoE) desarrollada por Google DeepMind. En una arquitectura MoE, solo una fraccion de los parametros se activa por token; en este caso, de los 25,8B parametros totales, aproximadamente 4B son activos por token, lo que reduce el coste computacional de la inferencia manteniendo una alta capacidad de modelado. El modelo base fue entrenado con una ventana de contexto de hasta 256K tokens y con soporte multilingue de mas de 140 idiomas.

El ajuste realizado por JohnCheng es un experimento de fine-tuning supervisado (el sufijo "sp" sugiere "supervised" y "oc" podria referirse a "openchat" u otro conjunto de datos de conversacion). El nombre indica que se entrenó durante 1.5 épocas ("ep1.5"). No se ha publicado informacion sobre el dataset concreto, la metodologia de entrenamiento ni si se aplicaron tecnicas como RLHF o DPO. Tampoco se detalla si el ajuste altero las capacidades multimodales del modelo base, aunque el pipeline declarado es image-text-to-text.

## Capacidades

- Generacion de texto y conversacion multimodal: acepta tanto imagenes como texto como entrada y produce respuestas textuales, gracias a la arquitectura image-text-to-text heredada de Gemma 4.
- Razonamiento de largo alcance: con una ventana de contexto de hasta 256K tokens, puede procesar documentos extensos, libros completos o historiales de conversacion largos en una sola pasada.
- Soporte multilingue: el modelo base soporta mas de 140 idiomas, aunque no se ha verificado si el ajuste mantiene esta cobertura.
- Capacidades de codigo y razonamiento: el modelo base Gemma 4 esta entrenado para tareas de generacion de codigo, matematicas y razonamiento; el ajuste no indica que elimine estas capacidades.
- No se ha confirmado soporte explicito de tool calling o function calling en este ajuste concreto, aunque el modelo base puede soportarlo.

## Casos de uso

- Analisis de documentos extensos: gracias a la ventana de 256K tokens, se puede procesar un manual tecnico o un informe anual completo en una sola consulta, pidiendo resumenes, extraccion de datos o respuestas a preguntas puntuales.
- Asistentes de atencion al cliente multilingues: al mantener el soporte de idiomas del modelo base, se puede desplegar un chatbot que atienda consultas en varios idiomas con contexto de conversacion largo, mejorando la retencion de informacion del usuario.
- Generacion de codigo asistida: para desarrolladores que necesitan sugerencias de codigo o refactorizacion, el modelo puede trabajar con fragmentos de codigo extensos dentro de su contexto amplio.
- Transcripcion y analisis de conversaciones: al ser multimodal y aceptar texto, se puede alimentar con transcripciones largas de reuniones o entrevistas para generar actas, resumenes o puntos de accion.
- Educacion y tutoria: como asistente educativo, puede explicar conceptos complejos con ejemplos, adaptando el nivel de detalle segun el historial de la conversacion.
- Investigacion y extraccion de informacion: para investigadores que necesitan procesar papers o informes extensos, el modelo puede responder preguntas de comprension lectora sobre textos de cientos de paginas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se puede comparar el rendimiento de este ajuste con el modelo base Gemma 4 26B ni con otros modelos similares sin datos verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision nativa (FP16), el modelo requiere aproximadamente 51,6 GB de VRAM (tamano del repo). Con cuantizacion de 8 bits, se reduce a unos 26 GB; con 4 bits, a unos 13 GB.
- GPU recomendadas: para inferencia en FP16 se necesitan GPU profesionales como A100 80GB, H100 o multiples RTX 4090 (24GB cada una) en configuracion multi-GPU. Con cuantizacion de 4 bits, una RTX 4090 o una A6000 (48GB) son suficientes.
- Consumo en consumer GPU: si se cuantiza a 4 bits, cabe en una RTX 3090 o RTX 4090 (24GB), pero no en GPUs de menor VRAM.
- Opciones de despliegue: compatible con el ecosistema transformers de HuggingFace, por lo que se puede servir con vLLM, TGI (Text Generation Inference) o llama.cpp si se convierte a GGUF. El tag "endpoints_compatible" sugiere que es compatible con la API de inferencia de HuggingFace.
- Latencia y throughput: no se han publicado datos especificos. Como MoE con 4B parametros activos, la latencia por token deberia ser significativamente menor que la de un modelo denso de 26B, aunque no hay cifras confirmadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JohnCheng/gemma-4-26b-sp-oc-exp1-ep1.5 | 25,8B | ~4B | 256K | No disponible | Gated en HF |
| Gemma 4 26B (base) | 26B | 4B | 256K | Google Gemma license | Abierto en HF |
| Qwen2.5-32B (denso) | 32B | 32B | 128K | Apache 2.0 | Abierto en HF |
| Mixtral 8x7B | 46,7B | 12,9B | 32K | Apache 2.0 | Abierto en HF |

La comparativa directa con otros modelos no es posible sin benchmarks publicados. El modelo base Gemma 4 26B es el punto de referencia natural, pero el ajuste de JohnCheng no aporta datos de rendimiento propios.

## Limitaciones y advertencias

- No hay informacion publicada sobre el dataset de entrenamiento del ajuste, por lo que se desconocen los posibles sesgos introducidos en el fine-tuning.
- El acceso al modelo es restringido (gated), lo que implica que hay que aceptar condiciones adicionales en HuggingFace; esto puede dificultar la auditoria o el uso en proyectos con requisitos de licencia estrictos.
- La licencia no esta disponible, por lo que no se puede garantizar que el uso comercial sea legal sin una revision legal previa.
- No se han publicado benchmarks, por lo que el rendimiento real en tareas especificas es desconocido.
- El modelo base Gemma 4 puede presentar sesgos y alucinaciones tipicos de los modelos de lenguaje grandes; el ajuste no mitiga estos riesgos por defecto.
- El pipeline es image-text-to-text, pero no se ha verificado si el ajuste conserva la capacidad de procesar imagenes de forma fiable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JohnCheng/gemma-4-26b-sp-oc-exp1-ep1.5
- Repos de experimentos relacionados: https://huggingface.co/JohnCheng/gemma-4-26b-sp-oc-exp1
- Repos de instruccion: https://huggingface.co/JohnCheng/gemma-4-26b-it-exp
- Pagina de Gemma 4 de Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Model card oficial de Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
