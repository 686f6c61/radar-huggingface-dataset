# RatanK/23B0059-Week05-Compression40-Submission02

## Resumen

RatanK/23B0059-Week05-Compression40-Submission02 es un checkpoint derivado de Qwen/Qwen3.5-4B-Base, publicado por el usuario RatanK en Hugging Face. El nombre del repositorio sugiere un ejercicio de compresion (etiquetado como "Compression40" y "Week05"), presumiblemente un ajuste fino o una version comprimida del modelo base, aunque la model card publicada reproduce literalmente la documentacion oficial de Qwen3.5-4B y no describe el proceso de compresion aplicado ni sus hiperparametros.

El modelo base pertenece a la familia Qwen3.5 de Alibaba, una arquitectura hibrida que combina Gated DeltaNet (atencion lineal) con Gated Attention clasica, mas un codificador de vision integrado mediante entrenamiento de fusion temprana sobre tokens multimodales. La variante de 4B tiene 32 capas, dimension oculta de 2560 y una longitud de contexto nativa de 262.144 tokens, extensible hasta 1.010.000 tokens.

La relevancia de esta ficha es doble: por un lado documenta una de las variantes mas pequenas de Qwen3.5, orientada a despliegue en hardware de consumo con capacidades multimodales; por otro, advierte de que el repositorio concreto analizado tiene cero descargas y cero likes, no aporta informacion sobre el procedimiento de compresion y hereda la licencia Apache 2.0 del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con codificador de vision; hibrida de Gated DeltaNet (atencion lineal) y Gated Attention, layout 8 x (3 x (Gated DeltaNet -> FFN) -> 1 x (Gated Attention -> FFN)) |
| Parametros totales | 4B (segun model card; el repositorio derivado no indica si la compresion altera el recuento) |
| Parametros activos | no disponible (la documentacion de familia menciona Mixture-of-Experts disperso, pero la configuracion de la variante de 4B no especifica routing MoE ni parametros activos) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no disponible en los metadatos del repositorio; la documentacion de la familia Qwen3.5 declara cobertura de 201 idiomas y dialectos |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers; compatible con Transformers, vLLM, SGLang y KTransformers) |
| Dimension oculta | 2560 |
| Numero de capas | 32 |
| Dimensión de embedding de tokens | 248320 (con padding), salida LM atada al embedding |
| FFN (dimension intermedia) | 9216 |
| Gated DeltaNet | 32 cabezas de atencion lineal para V, 16 para QK, dimension de cabeza 128 |
| Gated Attention | 16 cabezas para Q, 4 para KV, dimension de cabeza 256, RoPE de dimension 64 |
| MTP | Entrenado con multi-step (multi-token prediction) |
| Tamano del repositorio | 4,0 GB |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer causal con codificador de vision y un diseno hibrido de atencion. Cada bloque del layout repite tres capas basadas en Gated DeltaNet (un mecanismo de atencion lineal con compuertas, 32 cabezas para V y 16 para QK con dimension de cabeza 128) seguidas de una capa de Gated Attention convencional (16 cabezas de consulta y 4 de clave-valor, dimension de cabeza 256, RoPE de 64 dimensiones). Esta mezcla busca reducir el coste computacional de la atencion en contextos muy largos manteniendo la calidad de recuperacion de informacion. El modelo incorpora ademas un codificador de vision integrado mediante entrenamiento de fusion temprana sobre tokens multimodales, lo que le permite procesar entradas de imagen y texto de forma conjunta. El FFN tiene dimension intermedia 9216 y se entrena con multi-token prediction (MTP).

Qwen describe tres pilares de entrenamiento para la familia: preentrenamiento y postentrenamiento sobre datos multimodales (con una eficiencia declarada cercana al 100% respecto al entrenamiento solo texto), aprendizaje por refuerzo escalado en entornos con millones de agentes y distribuciones de tarea progresivamente complejas, y una infraestructura asincrona de RL para orquestacion de agentes a gran escala. No se detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas concretas de RLHF o DPO en la variante de 4B.

Respecto al checkpoint concreto de este repositorio, no hay informacion sobre que transformacion se ha aplicado. El identificador indica una compresion del 40%, y el tamano del repositorio (4,0 GB) es notablemente inferior a los aproximadamente 8 GB que ocuparian los pesos en bf16 de un modelo de 4B parametros mas el codificador de vision, lo que es consistente con un checkpoint cuantizado o podado, pero se trata de una inferencia y no de un dato confirmado por el autor.

## Capacidades

- Generacion de texto conversacional multi-turno en formato de chat, segun la etiqueta conversational del repositorio.
- Razonamiento y conocimiento general: la variante de 4B obtiene 79,1 en MMLU-Pro segun los datos de la familia.
- Procesamiento de imagen y texto (pipeline image-text-to-text), con comprension visual integrada en el mismo transformer que el lenguaje.
- Codigo y matematicas: la documentacion de familia indica paridad con Qwen3 y resultados superiores a Qwen3-VL en razonamiento, codigo, agentes y comprension visual; no se aportan cifras desglosadas para la variante de 4B.
- Capacidades de agente y razonamiento multi-paso, respaldadas por el entrenamiento de RL sobre entornos multiagente descrito por Qwen.
- Soporte multilingue amplio segun la documentacion de familia (201 idiomas y dialectos), con matizacion cultural y regional.
- Manejo de contextos muy largos: 262.144 tokens nativos y hasta 1.010.000 mediante extension.
- Soporte de tool calling o function calling: no confirmado de forma explicita en la informacion proporcionada.
- Modo thinking explicito: no confirmado para esta variante en la informacion proporcionada.

## Casos de uso

- Analisis de documentos largos con imagenes: contratos, informes anuales o articulos cientificos de cientos de paginas con figuras y tablas, aprovechando la ventana nativa de 262.144 tokens y la fusion vision-lenguaje.
- Atencion al cliente multimodal: gestion de conversaciones multi-turno donde el usuario adjunta capturas de pantalla, fotos de producto o facturas, con contexto persistente largo y despliegue en una unica GPU de consumo.
- Asistente de accesibilidad: descripcion de imagenes, lectura de diagramas y resumen de material visual para personas con discapacidad visual, ejecutado en local para evitar enviar datos sensibles a servicios externos.
- Extraccion estructurada de informacion: conversion de formularios escaneados, albaranes o tickets a JSON, usando el modelo como componente de un pipeline de digitalizacion documental.
- Prototipado de agentes en local: base para experimentos de razonamiento multi-paso y orquestacion de herramientas en una estacion de trabajo, con la ventaja de que el checkpoint es pequeno y la iteracion es rapida.
- Educacion y tutoria: explicacion de ejercicios de matematicas, fisica o programacion a partir de fotografias de enunciados, con contexto suficiente para mantener el hilo de una sesion completa.
- Moderacion y clasificacion de contenido multimodal: etiquetado de imagenes y texto en pipelines de revision, con latencia reducida gracias a la atencion lineal de la capa Gated DeltaNet.
- Investigacion sobre compresion de modelos: el propio repositorio, al ser un ejercicio de compresion al 40% sobre un modelo de 4B, sirve como material de estudio para medir la degradacion de calidad frente al checkpoint original.

## Benchmarks y rendimiento

Los unicos datos disponibles son los publicados por Qwen para la familia Qwen3.5, y corresponden al modelo base, no al checkpoint comprimido de este repositorio. La tabla de la model card esta truncada en la fuente consultada, por lo que faltan filas y columnas.

| Modelo | MMLU-Pro | MMLU-Redux |
|---|---|---|
| GPT-OSS-120B | 80,8 | 91,0 |
| GPT-OSS-20B | 74,8 | 87,8 |
| Qwen3-Next-80B-A3B-Thinking | 82,7 | 92,5 |
| Qwen3-30BA3B-Thinking-2507 | 80,9 | 91,4 |
| Qwen3.5-9B | 82,5 | no disponible (tabla truncada) |
| Qwen3.5-4B | 79,1 | no disponible (tabla truncada) |

No hay resultados publicados para el checkpoint RatanK/23B0059-Week05-Compression40-Submission02. Tampoco se dispone de mediciones de HumanEval, GSM8K, MATH, MMMU ni de benchmarks de agente en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 9-10 GB para los pesos de un modelo de 4B con codificador de vision, mas la cache KV correspondiente al contexto utilizado. El repositorio ocupa 4,0 GB, lo que sugiere un checkpoint en precision reducida y un consumo menor.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 3-4 GB de pesos, mas cache KV; viable en GPUs de 6-8 GB para contextos moderados.
- Cache KV: con atencion por capas hibridas, el coste crece de forma mas contenida que en un transformer denso puro, pero contextos de 262.144 tokens requieren planificacion cuidadosa de memoria.
- GPUs recomendadas para produccion: A100 40/80 GB, H100 80 GB o L40S para servir con contextos largos y concurrencia alta.
- GPUs de consumo compatibles: RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 4070 Ti (12 GB) y RTX 3060 (12 GB) en cuantizacion de 4 bits; en 8 GB puede ser necesario reducir contexto.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y KTransformers, segun la propia model card. No se confirma compatibilidad con llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles. La documentacion de familia afirma inferencia de alto rendimiento con latencia y coste minimos gracias a la arquitectura hibrida, pero sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU-Pro | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RatanK/23B0059-Week05-Compression40-Submission02 | 4B (base, comprimido al 40% segun nombre) | 262.144 tokens (heredado) | no disponible | apache-2.0 | Hugging Face, 0 descargas |
| Qwen3.5-4B (modelo base del que deriva) | 4B | 262.144 tokens nativos, 1.010.000 extensible | 79,1 | apache-2.0 | Hugging Face, ampliamente desplegado |
| Qwen3.5-9B | 9B | no disponible en la informacion proporcionada | 82,5 | apache-2.0 (familia Qwen3.5) | Hugging Face |
| GPT-OSS-20B | 20B | no disponible en la informacion proporcionada | 74,8 | no disponible en la informacion proporcionada | Hugging Face |
| Qwen3-30BA3B-Thinking-2507 | 30B totales, 3B activos (MoE) | no disponible en la informacion proporcionada | 80,9 | no disponible en la informacion proporcionada | Hugging Face |

El checkpoint analizado no ofrece ninguna ventaja verificable frente al Qwen3.5-4B original: no publica benchmarks propios, no documenta la metodologia de compresion y cuenta con cero descargas. Para uso en produccion, el modelo base o el Qwen3.5-9B, si el presupuesto de VRAM lo permite, son alternativas con soporte y trazabilidad.

## Limitaciones y advertencias

- Trazabilidad nula: el repositorio no documenta que transformacion se ha aplicado (poda, cuantizacion, destilacion u otra), ni con que datos, ni con que criterio de evaluacion. Reproducir o auditar el resultado es imposible con la informacion disponible.
- Riesgo de degradacion de calidad: una compresion del 40% sobre un modelo de 4B puede afectar de forma apreciable a razonamiento, codigo y comprension visual. No hay ninguna medicion que cuantifique esa perdida.
- La model card publicada es una copia de la documentacion oficial de Qwen3.5-4B, por lo que los benchmarks y las capacidades descritas corresponden al modelo original, no al checkpoint comprimido. No deben atribuirse a este repositorio.
- Sesgos: no hay informacion especifica sobre sesgos del checkpoint. Al heredar los datos de entrenamiento de Qwen3.5, cabe esperar los sesgos habituales de un modelo entrenado mayoritariamente con corpus web multilingues.
- Alucinacion: riesgo estandar de un modelo de 4B, potencialmente incrementado por la compresion. Se recomienda verificacion de salidas en dominios factuales.
- Idiomas: los metadatos del repositorio no declaran idiomas; la cobertura de 201 idiomas es una afirmacion de la familia, no verificada para este checkpoint. El rendimiento en castellano no esta medido.
- Contexto: aunque la ventana nativa es de 262.144 tokens, el rendimiento efectivo en contextos muy largos depende del backend de despliegue, de la memoria disponible y de la posible degradacion introducida por la compresion.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda verificar que la compresion no introduce dependencias de terceros con licencias incompatibles, algo que el repositorio no aclara.
- Estado del repositorio: cero descargas y cero likes, actualizado en la misma fecha de creacion, sin garantia de mantenimiento ni de correccion de errores.
- Los resultados de la busqueda web realizada no contienen informacion relevante sobre este modelo: los enlaces recuperados corresponden a una serie de television alemana y no guardan relacion con el objeto de la ficha.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RatanK/23B0059-Week05-Compression40-Submission02
- Modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Variante postentrenada de referencia: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai

No se han encontrado papers, repositorios de codigo, demos ni articulos tecnicos adicionales sobre este checkpoint en la busqueda web realizada.
