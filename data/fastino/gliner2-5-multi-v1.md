# fastino/gliner2.5-multi-v1

## Resumen

GLiNER2.5 Multi es un modelo de extraccion de informacion basado en esquemas (schema-based information extraction) desarrollado por Fastino. Se trata del checkpoint multilingue de la familia GLiNER2.5, construido sobre el encoder mDeBERTa-v3-base con 287 millones de parametros totales. A diferencia de los modelos generativos, GLiNER2.5 es un modelo discriminativo de extraccion de spans que unifica en una sola arquitectura tareas de reconocimiento de entidades nombradas (NER), clasificacion de texto, extraccion de relaciones, analisis de sentimiento, clasificacion de intenciones y extraccion estructurada tipo JSON.

La innovacion principal reside en su arquitectura de fronteras (boundary architecture), que sustituye la rejilla tradicional de anchos de span fijos por un emparejamiento disperso de posiciones de inicio y fin. Esto permite extraer spans de cualquier longitud que quepa en la ventana codificada, sin las limitaciones de los enfoques basados en BIO tagging o en ventanas deslizantes. El modelo incorpora ademas decodificacion restringida (constrained decoding) mediante los modos `Classifier` y `JointIE`, que imponen restricciones entre etiquetas de distintas tareas o construyen grafos tipados de entidad-relacion.

El modelo es relevante porque ofrece una alternativa local, sin dependencia de APIs externas, para pipelines de extraccion de informacion en produccion. Con licencia Apache 2.0, 90.443 descargas y 301 likes en Hugging Face, se posiciona como la opcion por defecto para tareas multi-tarea multilingue dentro del ecosistema GLiNER2, que incluye variantes en ingles de 74M y 194M parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Boundary architecture (encoder mDeBERTa-v3-base con cabeza de emparejamiento start/end) |
| Parametros totales | 287.355.159 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | fp16 en GPU (flag `quantize=True`); no se detallan otros formatos |
| Idiomas soportados | Multilingue, ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

GLiNER2.5 Multi se construye sobre el encoder mDeBERTa-v3-base, un transformer encoder multilingue, al que se anade una cabeza de extraccion basada en fronteras. En lugar de predecir etiquetas BIO token a token o de evaluar una rejilla fija de anchos de span, el modelo empareja de forma dispersa posiciones de inicio y fin candidatas, lo que le permite representar spans de longitud arbitraria dentro de la ventana codificada. El checkpoint expone un campo `architecture` con valor `boundary` que hace que `AutoExtractor` seleccione automaticamente la clase `BoundaryExtractor` al cargar el modelo.

El modelo unifica multiples tareas de extraccion de informacion en una sola pasada: entidades, clasificacion, registros estructurados, relaciones y atributos de span, todo definido mediante un esquema en tiempo de inferencia. Incorpora dos mecanismos de decodificacion restringida: `Classifier`, que aplica restricciones entre etiquetas de distintas tareas, y `JointIE`, que construye grafos tipados de entidad-relacion. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El paper asociado es arXiv:2507.18546.

## Capacidades

- Extraccion de entidades nombradas (NER) con etiquetas definidas por el usuario en tiempo de inferencia, incluyendo descripciones para etiquetas especificas de dominio.
- Extraccion de relaciones tipadas entre entidades mediante el modo `JointIE`.
- Clasificacion de texto: sentimiento, tema, intencion y otras categorias definidas por esquema.
- Extraccion estructurada de registros y salida en formato JSON.
- Puntuacion de atributos de span (span attributes).
- Decodificacion restringida para imponer consistencia entre tareas (`Classifier`) y construir grafos entidad-relacion tipados (`JointIE`).
- Capacidades multilingues gracias al encoder mDeBERTa-v3-base.
- Inferencia local en CPU, CUDA o MPS, sin necesidad de API externa.
- Devolucion de offsets de caracteres en formato half-open (`text[start:end] == entity["text"]`) y puntuaciones de confianza opcionales.
- Soporte de `torch.compile` y cuantizacion fp16 en GPU.

## Casos de uso

- Extraccion de entidades en dominios sanitarios: el modelo permite definir etiquetas como `medication`, `dosage`, `symptom` o `time` con descripciones en lenguaje natural, y extrae los valores con offsets exactos sobre el texto clinico, lo que facilita su integracion en sistemas de historia clinica electronica.
- Procesamiento de documentos financieros: extraccion de entidades como empresas, productos, importes y fechas, junto con relaciones tipadas mediante `JointIE`, para alimentar pipelines de conciliacion o deteccion de fraude.
- Clasificacion de tickets de soporte: uso del modo `Classifier` para asignar simultaneamente categoria, sentimiento e intencion a cada ticket, con restricciones cruzadas entre etiquetas para evitar combinaciones incoherentes.
- Enriquecimiento de datos multilingues: al estar construido sobre mDeBERTa-v3-base, puede aplicarse a corpus en varios idiomas con el mismo esquema de extraccion, reduciendo la necesidad de modelos por idioma.
- Extraccion estructurada tipo JSON desde texto libre: conversion de correos, contratos o articulos en registros estructurados definidos por esquema, adecuado para pipelines ETL.
- Analisis de resenas y opinion: extraccion de atributos de span y clasificacion de sentimiento a nivel de aspecto, util para monitorizacion de marca.
- Despliegue en entornos con recursos limitados: con 287M parametros y soporte de CPU, MPS y CUDA, puede ejecutarse en portatiles o estaciones de trabajo sin GPU dedicada para tareas de extraccion por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 287M parametros en fp32, el peso ronda 1,15 GB; en fp16, aproximadamente 0,57 GB. El repositorio ocupa 2,9 GB, lo que sugiere pesos adicionales o artefactos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp16. Una RTX 4090, A100 o H100 ofrecen margen sobrado para lotes grandes y `torch.compile`.
- Cabe en GPU de consumo: si, en cualquier GPU consumer moderna (GTX 1660, RTX 3060, RTX 4090) e incluso en CPU y Apple Silicon via MPS.
- Opciones de despliegue: libreria `gliner2[local]` con `AutoExtractor`, soporte de `map_location` para `cpu`, `cuda` o `mps`, flag `quantize=True` para fp16 y `compile=True` para `torch.compile`. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, dado que es un modelo discriminativo y no generativo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Encoder | Idioma | Licencia | Uso |
|---|---|---|---|---|---|
| fastino/gliner2.5-multi-v1 | 287M | mDeBERTa-v3-base | Multilingue | Apache 2.0 | Checkpoint multi-tarea multilingue por defecto |
| fastino/gliner2.5-base-v1 | 194M | DeBERTa-v3-base | Ingles | Apache 2.0 | Checkpoint multi-tarea en ingles por defecto |
| fastino/gliner2.5-small-v1 | 74M | DeBERTa-v3-xsmall | Ingles | Apache 2.0 | Extraccion y clasificacion rapida en CPU |

Los tres checkpoints comparten la misma API publica. La variante multi es la unica que cubre varios idiomas, a costa de un mayor numero de parametros y un encoder multilingue. No se dispone de datos de rendimiento comparativo entre las tres variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo discriminativo: no genera texto libre ni mantiene conversaciones; solo extrae y clasifica segun un esquema predefinido.
- La longitud de contexto no esta documentada en la informacion disponible, lo que dificulta planificar el procesamiento de documentos largos.
- Riesgo de extraccion incompleta o incorrecta si las etiquetas del esquema son ambiguas o no estan bien descritas; se recomienda usar descripciones para etiquetas de dominio.
- El soporte multilingue depende de mDeBERTa-v3-base; el rendimiento en idiomas distintos del ingles puede variar y no se documentan evaluaciones por idioma.
- Aunque la licencia es Apache 2.0 y permite uso comercial, conviene revisar las dependencias de `gliner2[local]` y de PyTorch para cumplir con sus respectivas licencias.
- No se documentan sesgos conocidos ni tasas de alucinacion en la informacion proporcionada; al ser un modelo extractivo, el riesgo de alucinacion se limita a spans mal delimitados o etiquetas mal asignadas.
- La carga debe hacerse con `AutoExtractor`; el cargador legacy `GLiNER2.from_pretrained(...)` no despacha este checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/fastino/gliner2.5-multi-v1
- Paper: https://arxiv.org/abs/2507.18546
- Repositorio GitHub: https://github.com/fastino-ai/GLiNER2
- Plataforma de fine-tuning: https://agent.fastino.ai
- Reddit: https://www.reddit.com/r/GLiNER/
- X/Twitter: https://x.com/fastinoAI
- Checkpoint ingles base: https://huggingface.co/fastino/gliner2.5-base-v1
- Checkpoint ingles small: https://huggingface.co/fastino/gliner2.5-small-v1
