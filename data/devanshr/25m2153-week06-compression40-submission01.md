# DevanshR/25M2153-Week06-Compression40-Submission01

## Resumen

DevanshR/25M2153-Week06-Compression40-Submission01 es un ajuste fino publicado por el usuario DevanshR sobre el modelo base Qwen/Qwen3.5-4B-Base. La nomenclatura del repositorio (identificador de curso, semana 06, «Compression40») indica que se trata de la entrega de un ejercicio de compresion de modelos, no de un modelo de proposito general con documentacion propia. Ocupa 3,2 GB y declara la libreria transformers, la pipeline image-text-to-text y licencia Apache 2.0.

El modelo del que deriva, Qwen3.5-4B, es un transformer causal de 4.000 millones de parametros con encoder de vision y una arquitectura hibrida que alterna capas Gated DeltaNet (atencion lineal) con capas Gated Attention, segun la documentacion del autor original. Su ventana de contexto nativa es de 262.144 tokens, extensible hasta 1.010.000, y esta entrenado para tareas conjuntas de imagen y texto.

Su relevancia practica es limitada por el momento: el repositorio acumula 0 descargas y 0 likes, y su model card reproduce literalmente la del modelo base, sin documentar el proceso de compresion aplicado, los datos de ajuste ni resultados de evaluacion propios del artefacto publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con encoder de vision. Hibrida: Gated DeltaNet (atencion lineal) + Gated Attention + FFN. La model card menciona mezcla de expertos dispersa en las novedades, pero la ficha de arquitectura no desglosa expertos |
| Parametros totales | 4B (modelo base) |
| Parametros activos | no disponible (la model card no desglosa parametros activos ni numero de expertos) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.010.000 |
| Tipos de cuantizacion | no disponible. El repositorio no documenta el esquema de cuantizacion o compresion; el tamano del repo (3,2 GB) es inferior a los ~8 GB de 4B parametros en FP16 |
| Idiomas soportados | 201 idiomas y dialectos segun la model card del modelo base; no se publica la lista |
| Licencia | Apache 2.0 |
| Formato de pesos | Hugging Face Transformers (config.json mas pesos). Compatible con Transformers, vLLM, SGLang y KTransformers; no se confirma si el formato de fichero es safetensors |
| Dimension oculta | 2560 |
| Numero de capas | 32 (24 Gated DeltaNet + 8 Gated Attention, en 8 bloques de 4) |
| Layout | 8 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Cabezas de atencion | Gated DeltaNet: 32 para V y 16 para QK, dimension 128. Gated Attention: 16 para Q y 4 para KV, dimension 256, RoPE 64 |
| Dimension intermedia FFN | 9216 |
| Vocabulario | 248.320 tokens (padded), embeddings de entrada y salida atados |
| MTP | Entrenado con multi-steps |
| Tamano del repositorio | 3,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo base combina dos mecanismos de atencion en un patron de 8 bloques: cada bloque contiene tres capas Gated DeltaNet seguidas de una capa Gated Attention, lo que da 24 capas de atencion lineal y 8 de atencion completa sobre 32 capas totales. Las capas Gated DeltaNet emplean 32 cabezas lineales para V y 16 para QK con dimension de cabeza 128; las capas Gated Attention usan 16 cabezas de consulta y 4 de clave-valor con dimension 256 y RoPE de dimension 64. El FFN tiene dimension intermedia 9216 y el modelo incorpora prediccion multi-token (MTP) entrenada con varios pasos. El encoder de vision y el entrenamiento con fusion temprana sobre tokens multimodales son la base de su pipeline image-text-to-text.

Segun la model card, el entrenamiento del modelo original cubre fases de preentrenamiento y postentrenamiento, con aprendizaje por refuerzo escalado sobre entornos multiagente y una infraestructura asincrona de RL. No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni el uso concreto de RLHF o DPO. Para este repositorio en particular no hay ninguna informacion sobre el procedimiento de compresion, el dataset de ajuste, los hiperparametros ni la perdida de calidad asociada al artefacto.

## Capacidades

Las capacidades que se enumeran a continuacion corresponden al modelo base Qwen3.5-4B descrito en la model card, no a una evaluacion del artefacto comprimido. La model card presente en el repositorio no aporta evidencia adicional.

- Generacion de texto y razonamiento multimodal (imagen y texto) mediante encoder de vision con fusion temprana.
- Razonamiento, codigo y agentes: la model card situa al modelo al mismo nivel que Qwen3 y por encima de Qwen3-VL en razonamiento, codigo, agentes y comprension visual.
- Procesamiento de contexto largo: 262.144 tokens nativos y hasta 1.010.000 tokens mediante extension.
- Cobertura multilingue declarada de 201 idiomas y dialectos.
- Capacidades de agente y razonamiento multi-paso derivadas del entrenamiento con RL sobre entornos multiagente.
- Soporte de function calling o tool calling: no se detalla explicitamente en la informacion disponible; la model card solo menciona agentes y RL sobre entornos multiagente.
- Modo de razonamiento explicito (thinking): no disponible para esta variante de 4B segun la informacion proporcionada.
- Audio: no disponible; no se menciona ninguna capacidad de audio.

## Casos de uso

Los escenarios siguientes se refieren al modelo base subyacente. Dado que el artefacto publicado no incluye evaluacion propia, cualquier uso en produccion exigiria una validacion previa de la degradacion introducida por la compresion.

- Atencion al cliente multimodal: el modelo puede gestionar conversaciones multi-turno en las que el usuario adjunta capturas de pantalla, fotos de productos o recibos, gracias a la ventana nativa de 262.144 tokens que permite mantener un historial largo sin recurrir a resumenes agresivos.
- Analisis de documentacion larga con imagenes: procesamiento de informes tecnicos, contratos o expedientes escaneados en los que texto y figuras deben interpretarse conjuntamente dentro de una misma ventana de contexto.
- Agente de automatizacion con multiples pasos: integrado en un bucle de agente que consulta herramientas y APIs, aprovechando el entrenamiento con RL sobre entornos multiagente descrito por el autor del modelo base.
- Generacion y revision de codigo: asistencia en tareas de programacion y revision de parches, dado que la model card reporta paridad con Qwen3 en benchmarks de codigo.
- Extraccion estructurada de informacion desde diagramas y capturas: conversion de esquemas, tablas e interfaces graficas en datos estructurados para pipelines de ingesta.
- Despliegue multilingue en 201 idiomas: aplicaciones de soporte o traduccion con cobertura amplia de idiomas y dialectos, sin necesidad de un modelo especifico por region.
- Inferencia en hardware de gama media: con un repositorio de 3,2 GB, es viable desplegar el modelo en una unica GPU de consumo, lo que habilita escenarios on-premise o de borde con requisitos de privacidad.
- Experimentacion academica en compresion de modelos: el artefacto sirve como referencia para reproducir y auditar tecnicas de compresion sobre un modelo multimodal de 4B.

## Benchmarks y rendimiento

La model card del repositorio incluye la tabla de resultados del modelo base Qwen3.5-4B, no del artefacto comprimido. Los datos disponibles corresponden a la seccion de lenguaje y la tabla aparece truncada en la informacion proporcionada.

| Benchmark | GPT-OSS-120B | GPT-OSS-20B | Qwen3-Next-80B-A3B-Thinking | Qwen3-30BA3B-Thinking-2507 | Qwen3.5-9B | Qwen3.5-4B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 80,8 | 74,8 | 82,7 | 80,9 | 82,5 | 79,1 |
| MMLU-Redux | 91,0 | 87,8 | 92,5 | 91,4 | no disponible | no disponible |

No se han publicado resultados de benchmarks del artefacto DevanshR/25M2153-Week06-Compression40-Submission01 en la informacion disponible. Tampoco hay datos de evaluacion en castellano ni de las categorias de vision, codigo, matematicas o agentes, dado que la tabla proporcionada esta truncada.

## Requisitos de hardware

Todas las cifras de esta seccion son estimaciones derivadas del numero de parametros y de la configuracion de atencion descrita, no datos publicados por el autor.

- Pesos del modelo base en BF16/FP16: aproximadamente 8 GB (4.000 millones de parametros a 2 bytes).
- Pesos publicados en este repositorio: 3,2 GB, coherente con una representacion comprimida o de baja precision; la inferencia con estos pesos requiere del orden de 4 a 5 GB incluyendo overheads.
- Cache KV: solo las 8 capas Gated Attention generan cache creciente, con 4 cabezas KV de dimension 256 en FP16, lo que supone unos 32 KB por token. Equivale a aproximadamente 1 GB a 32.768 tokens y 8,6 GB a 262.144 tokens. Las 24 capas Gated DeltaNet mantienen un estado recurrente de tamano constante.
- Contexto de 1.010.000 tokens: la cache KV en FP16 rondaria los 33 GB, por lo que requiere cuantizacion de cache, memoria unificada o despliegue multi-GPU.
- GPU de consumo: si. Una RTX 4090 o RTX 3090 con 24 GB ejecutan los pesos en BF16 con contexto moderado. Tarjetas de 12 a 16 GB (RTX 4080, 4070 Ti, 4060 Ti 16 GB) quedan limitadas a cuantizacion o a contextos cortos.
- GPU de datacenter: A100 40/80 GB, H100 y L40S para contextos largos y lotes grandes.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y KTransformers, segun la model card. No se documentan soporte GGUF, llama.cpp ni Ollama.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de latencia de primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU-Pro | MMLU-Redux | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-4B (origen de este ajuste) | 4B | 262.144 (ext. 1.010.000) | 79,1 | no disponible | Apache 2.0 | Hugging Face, vLLM, SGLang, KTransformers |
| Qwen3.5-9B | no disponible (el nombre sugiere 9B) | no disponible | 82,5 | no disponible | no disponible | no disponible |
| Qwen3-30BA3B-Thinking-2507 | 30B totales, 3B activos (inferido del nombre) | no disponible | 80,9 | 91,4 | no disponible | no disponible |
| GPT-OSS-20B | 20B (inferido del nombre) | no disponible | 74,8 | 87,8 | no disponible | no disponible |
| GPT-OSS-120B | 120B (inferido del nombre) | no disponible | 80,8 | 91,0 | no disponible | no disponible |

Frente a este grupo, el modelo de 4B queda por debajo de Qwen3.5-9B en MMLU-Pro (79,1 frente a 82,5) y por encima de GPT-OSS-20B (74,8), pero supera a este ultimo con un quinto de los parametros. No hay datos comparativos de latencia, coste por token ni rendimiento multimodal que permitan completar la comparacion.

## Limitaciones y advertencias

- La model card del repositorio es una copia literal de la del modelo base Qwen3.5-4B y no documenta el proceso de compresion, los datos de ajuste, los hiperparametros ni las perdidas de calidad asociadas.
- No existen resultados de benchmarks del artefacto comprimido; las cifras publicadas corresponden al modelo base sin comprimir y no son extrapolables.
- El repositorio registra 0 descargas y 0 likes, por lo que no hay validacion por parte de la comunidad ni informes de terceros.
- Discrepancia de identificacion: la etiqueta base_model apunta a Qwen/Qwen3.5-4B-Base (modelo preentrenado), mientras que la model card reproducida describe Qwen3.5-4B en su version postentrenada. No se aclara cual de los dos es el punto de partida real.
- El identificador «Compression40» sugiere una reduccion de tamano del orden del 40 por ciento, pero es una inferencia a partir del nombre y no un dato confirmado. El riesgo de degradacion en razonamiento, codigo y tareas multimodales es real y no esta cuantificado.
- La cobertura de 201 idiomas y dialectos procede de la model card del modelo base; no hay evaluaciones por idioma ni datos especificos de castellano.
- No hay informacion sobre sesgos demograficos, culturales o linguisticos, ni sobre tasas de alucinacion, veracidad o robustez ante prompts adversarios.
- La licencia declarada es Apache 2.0, que permite uso comercial, pero el license_link apunta al fichero de licencia de Qwen/Qwen3.5-4B; conviene verificar los terminos aplicables al modelo base antes de un despliegue en produccion.
- El contexto extensible hasta 1.010.000 tokens no viene acompanado de la receta de extension, por lo que su comportamiento efectivo en esa longitud es desconocido.
- No se documenta soporte para formatos GGUF o llama.cpp, lo que limita las opciones de despliegue en entornos sin GPU NVIDIA.
- El autor no publica plan de mantenimiento, versionado ni canal de soporte para este artefacto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/DevanshR/25M2153-Week06-Compression40-Submission01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia referenciada en la model card: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Web del autor: https://devanshr.me/
- Repositorio de estructura similar encontrado en la busqueda: https://huggingface.co/sumedhss/23b1079-Week05-Compression40-Submission01

La busqueda web realizada no devolvio documentacion tecnica relevante sobre este modelo: los resultados consistieron en un sitio comercial de muebles sin relacion con el ambito, un repositorio de Hugging Face de nomenclatura analoga y la pagina personal del autor.
