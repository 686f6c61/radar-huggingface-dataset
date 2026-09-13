# McG-221/Boulesis-v2.1-26B-A4B-8bit

## Resumen

Boulesis-v2.1-26B-A4B-8bit es un modelo publicado en HuggingFace por el usuario McG-221 el 13 de septiembre de 2026. En el momento de redactar esta ficha el repositorio cuenta con 0 descargas y 2 "likes", no tiene model card publica y la informacion disponible se limita a los metadatos basicos del identificador: no consta licencia, pipeline, idiomas soportados ni formato de pesos declarado.

El nombre del repositorio sugiere, por convencion de nomenclatura habitual en la comunidad, un modelo de arquitectura Mixture of Experts (MoE) con aproximadamente 26 000 millones de parametros totales y alrededor de 4000 millones de parametros activos por token (sufijo "A4B"), distribuido en una variante cuantizada a 8 bits. Esta interpretacion es una inferencia a partir del identificador y no esta confirmada por el autor ni por ningun documento tecnico asociado.

No se ha localizado informacion adicional en la busqueda web: los resultados devueltos corresponden a entidades no relacionadas (el director de cine McG y la unidad de medida microgramo), por lo que no aportan datos sobre el modelo. En consecuencia, esta ficha recoge exclusivamente lo verificable y marca como "no disponible" todo aquello que no puede confirmarse, incluyendo arquitectura exacta, datos de entrenamiento, capacidades y benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el identificador sugiere MoE con ~26B totales y ~4B activos, sin confirmar) |
| Parametros totales | no disponible (el identificador indica 26B) |
| Parametros activos | no disponible (el identificador indica A4B, es decir, ~4B por token, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el identificador indica una variante en 8 bits) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el identificador no especifica safetensors, GGUF ni otro formato) |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura interna, el proceso de entrenamiento, el volumen de tokens utilizados, la composicion del dataset ni la aplicacion de tecnicas de alineacion como RLHF, DPO o similares. El repositorio no incluye model card, paper, informe tecnico ni configuracion de modelo accesible desde los metadatos disponibles.

Lo unico que puede afirmarse con certeza es lo que sugiere el propio nombre del repositorio: una familia "Boulesis" en su version 2.1, con un tamano de 26B parametros, un sufijo "A4B" compatible con un esquema de expertos con 4B parametros activos, y una variante cuantizada a 8 bits. Cualquier afirmacion adicional sobre decodificacion especulativa, atencion lineal, atencion completa, atencion por ventanas o estrategias de enrutamiento de expertos seria especulacion no respaldada por fuentes.

## Capacidades

- Generacion de texto: no documentada en el repositorio; no puede confirmarse ni descartarse.
- Razonamiento, matematicas y generacion de codigo: no documentados.
- Soporte de tool calling o function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; el campo de idiomas no esta disponible.
- Capacidades multimodales (vision, audio): no documentadas.
- Modo de razonamiento extendido ("thinking") o modos de esfuerzo configurables: no documentados.
- Capacidad de instrucciones conversacionales: no documentada. El pipeline aparece como "no disponible", por lo que no puede confirmarse que se trate de un modelo ajustado por instrucciones frente a un modelo base.

## Casos de uso

Debe tenerse en cuenta que los siguientes escenarios son aplicaciones tipicas de un modelo de lenguaje de ~26B parametros con arquitectura MoE y ~4B activos, planteadas de forma condicional. No estan respaldados por documentacion del autor ni por evaluaciones publicadas, por lo que requieren validacion previa antes de cualquier uso en produccion.

- Atencion al cliente automatizada: si el modelo confirma una ventana de contexto amplia y ajuste por instrucciones, podria gestionar conversaciones multi-turno con historial extenso. El coste de inferencia seria mas cercano al de un modelo denso de ~4B que al de uno de 26B, lo que abarata el despliegue a gran escala.
- Generacion de codigo asistida en IDE: el esquema MoE permite alto rendimiento por token con menor calculo efectivo, adecuado para autocompletado y refactorizacion siempre que se verifique la calidad del codigo generado en el dominio objetivo.
- Procesamiento por lotes de documentacion: clasificacion, resumen y extraccion de entidades sobre volumenes grandes de documentos, aprovechando la relacion entre memoria de pesos y computo por token propia de un MoE.
- Asistentes conversacionales autoalojados: al ser una variante de 8 bits, el modelo puede desplegarse en una unica GPU de 40-48 GB, lo que lo hace viable para organizaciones que necesitan mantener los datos en su propia infraestructura.
- Generacion aumentada por recuperacion (RAG): integracion como generador final en un pipeline RAG, condicionada a que la longitud de contexto declarada sea suficiente para incluir varios fragmentos recuperados.
- Extraccion de datos estructurados: conversion de texto libre a JSON u otros formatos para alimentar sistemas internos, siempre que se valide la tasa de conformidad del formato.
- Moderacion y clasificacion de contenido: uso como clasificador de texto en flujos internos, con supervision humana en los casos limite.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No constan datos de MMLU, MMLU-Pro, HumanEval, GSM8K, MATH, BBH, MT-Bench ni de ninguna otra evaluacion estandar en el repositorio ni en las fuentes consultadas. Tampoco hay informacion sobre latencia, throughput o consumo energetico medida por el autor.

## Requisitos de hardware

Las cifras de esta seccion son estimaciones orientativas derivadas del recuento de parametros indicado en el nombre del repositorio (26B) y del formato cuantizado a 8 bits. No han sido confirmadas por el autor y deben tratarse como un punto de partida para planificar pruebas, no como datos verificados.

- Peso de los pesos en 8 bits: aproximadamente 26 GB, mas overhead de activaciones y cache KV. En fp16 serian unos 52 GB; en 4 bits, entre 13 y 15 GB.
- VRAM estimada para inferencia en 8 bits: en torno a 28-34 GB con contextos moderados, dependiendo de la longitud de contexto real.
- GPU recomendadas para la variante de 8 bits: A100 40 GB, A100 80 GB, H100, L40S 48 GB o RTX 6000 Ada 48 GB. Cabe en una unica GPU de 40 GB con margen ajustado.
- Cabe en GPU de consumo: la variante de 8 bits no cabe en una RTX 4090 o RTX 3090 de 24 GB sin offloading a CPU, lo que degradaria fuertemente la latencia. Una conversion a 4 bits si seria viable en 24 GB, con contexto limitado.
- Opciones de despliegue: vLLM y SGLang soportan arquitecturas MoE y serian las opciones preferentes para servicio concurrente. llama.cpp y Ollama requieren un archivo GGUF que no consta como publicado. TGI es una alternativa si el formato de pesos es compatible. El formato exacto de pesos no esta disponible, por lo que la compatibilidad con cada runtime debe verificarse tras descargar el repositorio.
- Latencia y throughput estimados: no disponibles. Como referencia teorica, al activar ~4B parametros por token el coste de calculo por token se aproximaria al de un modelo denso de ese tamano, mientras que el uso de memoria corresponderia a los 26B totales. Esta afirmacion depende de que el sufijo A4B describa realmente el modelo.

## Comparativa con modelos similares

No disponible. No consta informacion tecnica verificable de Boulesis-v2.1-26B-A4B-8bit (parametros confirmados, contexto, licencia, benchmarks), por lo que cualquier tabla comparativa con alternativas de la misma categoria seria especulativa. Los modelos con los que podria compararse, en caso de confirmarse una arquitectura MoE de ~26B totales y ~4B activos, serian otras familias MoE de rango 20-30B, pero no se dispone de datos publicados de este modelo para establecer la comparacion.

## Limitaciones y advertencias

- Ausencia total de documentacion: sin model card, paper ni ficha tecnica, no es posible evaluar el comportamiento del modelo ni sus condiciones de uso.
- Licencia no especificada: al no declararse licencia, no puede asumirse permiso para uso comercial, redistribucion o modificacion. En ausencia de licencia explicita, los derechos de uso quedan en un limbo legal que desaconseja su empleo en produccion.
- Procedencia no verificada: el autor no tiene historial publico conocido en el repositorio y el modelo no registra descargas, por lo que no existe validacion por parte de la comunidad.
- Riesgo de alucinacion: no evaluado. Sin benchmarks ni evaluaciones de fidelidad, no puede estimarse la tasa de invencion de hechos.
- Sesgos: no evaluados. No hay informacion sobre la composicion del dataset de entrenamiento ni sobre analisis de sesgo.
- Idiomas: no declarados. No puede confirmarse el soporte de castellano ni de ningun otro idioma.
- Contexto: no declarado. Cualquier diseno de aplicacion que dependa de una ventana de contexto concreta debe verificarse empiricamente.
- Compatibilidad de despliegue: el formato de pesos es desconocido, lo que puede impedir la carga directa en runtimes habituales sin conversion previa.
- Cuantizacion a 8 bits: la cuantizacion puede introducir degradacion en tareas sensibles a la precision numerica, como matematicas o generacion de codigo, en comparacion con los pesos originales en fp16 o bf16. No hay evaluaciones comparativas publicadas.
- Fecha de creacion futura respecto a la mayoria de contenidos indexados: conviene verificar que el repositorio sigue activo y que los artefactos son descargables antes de integrarlo en cualquier flujo.

## Enlaces

- HuggingFace: https://huggingface.co/McG-221/Boulesis-v2.1-26B-A4B-8bit

No se han encontrado en la busqueda web enlaces relevantes al modelo: los resultados obtenidos corresponden a entidades no relacionadas (articulos sobre el director McG y sobre la unidad de medida microgramo). No hay papers, blogs, repositorios de codigo ni demos asociados a Boulesis-v2.1-26B-A4B-8bit en la informacion disponible.
