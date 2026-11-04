# opendatalab/MinerU-HTML-v1.1-qwen3.5-0.8B-compact

## Resumen

MinerU-HTML-v1.1-qwen3.5-0.8B-compact es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-0.8B, publicado por el equipo de OpenDataLab. Forma parte de la familia MinerU, orientada al procesamiento y extraccion de contenido estructurado a partir de documentos, y en esta variante concreta se especializa en el tratamiento de HTML. El sufijo "compact" sugiere una version optimizada en tamano o en requisitos de despliegue respecto a otras variantes de la misma familia.

El modelo hereda la arquitectura y el tamano del modelo base Qwen3.5-0.8B, es decir, un transformer de aproximadamente 0,8 mil millones de parametros. Con ese orden de magnitud, esta pensado para ejecutarse en hardware modesto, incluidas GPU de consumo, y para tareas de extraccion y transformacion de contenido web donde el coste por inferencia y la latencia importan mas que el rendimiento en razonamiento complejo.

La relevancia de esta ficha es limitada por la escasez de informacion publicada: la model card disponible practicamente solo declara la licencia Apache 2.0 y el modelo base, sin detallar datos de entrenamiento, benchmarks ni idiomas soportados. Cualquier evaluacion en produccion deberia acompanarse de una validacion propia sobre el corpus objetivo antes de adoptarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-0.8B); detalles no disponibles |
| Parametros totales | ~0,8 mil millones (segun el nombre del modelo base) |
| Parametros activos | No aplica (no es un modelo MoE, segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (al ser un modelo de ~0,8B es compatible con cuantizaciones GGUF/INT8/INT4 mediante herramientas estandar, pero el autor no las publica) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (no se especifica en la model card; presumiblemente safetensors, sin confirmar) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna mas alla de que el modelo deriva de Qwen/Qwen3.5-0.8B, por lo que se asume una arquitectura transformer decoder-only con aproximadamente 0,8 mil millones de parametros. Tampoco se detallan innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, modos de razonamiento, etc.) en la informacion proporcionada.

Respecto al entrenamiento, la model card no incluye datos sobre el volumen de tokens, la composicion del dataset de ajuste fino, ni si se emplearon tecnicas de RLHF, DPO o instruction tuning supervisado. El nombre del modelo indica una especializacion en HTML (MinerU-HTML-v1.1), lo que sugiere un corpus de entrenamiento centrado en documentos web, pero se trata de una inferencia a partir de la nomenclatura y no de un dato confirmado por el autor.

## Capacidades

- Procesamiento de contenido HTML: el nombre del modelo indica especializacion en extraccion y transformacion de documentos HTML, presumiblemente orientada a la conversion a texto estructurado o Markdown.
- Generacion de texto: capacidades heredadas del modelo base Qwen3.5-0.8B, sin detalle publicado.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el autor no declara idiomas.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Extraccion de contenido principal en paginas web: el modelo puede emplearse para identificar y aislar el cuerpo principal de un documento HTML, descartando navegacion, anuncios y elementos auxiliares, gracias a su ajuste especifico sobre HTML.
- Conversion de HTML a Markdown o texto estructurado: util en pipelines de ingestion documental donde se necesita normalizar paginas web antes de indexarlas en un sistema RAG.
- Limpieza de corpus para entrenamiento: al estar especializado en HTML, encaja en la fase de preprocesado de datasets web, reduciendo el ruido estructural antes de alimentar modelos mayores.
- Preprocesado en pipelines de scraping a gran escala: su tamano de ~0,8B permite desplegarlo en GPU de consumo y procesar volumenes altos con coste contenido por documento.
- Normalizacion de documentacion tecnica: conversion de paginas de documentacion (por ejemplo, manuales o referencias de API en HTML) a formatos legibles por otros sistemas.
- Filtrado y clasificacion de contenido web: uso como componente auxiliar para decidir que paginas o fragmentos contienen contenido sustantivo antes de un procesamiento mas costoso con modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~0,8B parametros, en FP16 requiere aproximadamente 1,6 GB solo para pesos; en INT8 en torno a 0,8 GB y en INT4 alrededor de 0,4-0,5 GB, mas overhead de activaciones y cache KV (estimaciones derivadas del tamano, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM deberia ser suficiente en cuantizacion; para FP16 se recomienda 8 GB o mas.
- GPU de consumo: cabe en practicamente cualquier GPU de consumo moderna (RTX 3060, RTX 4060, RTX 4090, e incluso GPUs con 6-8 GB), asi como en CPU para volumenes moderados.
- Opciones de despliegue: al ser un modelo pequeno, es compatible con frameworks estandar como llama.cpp, Ollama, vLLM y TGI, aunque el autor no publica pesos en formatos especificos (GGUF, etc.) en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| MinerU-HTML-v1.1-qwen3.5-0.8B-compact | ~0,8B | No disponible | Apache 2.0 | Fine-tune especializado en HTML |
| Qwen/Qwen3.5-0.8B (modelo base) | ~0,8B | No disponible | No disponible en esta ficha | Modelo generalista del que deriva |
| Otros modelos de extraccion HTML de ~1B | No disponible | No disponible | No disponible | No se dispone de comparativas publicadas |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Informacion muy escasa: la model card no documenta datos de entrenamiento, idiomas, contexto ni evaluaciones, lo que impide garantizar su comportamiento fuera del dominio HTML.
- Riesgo de alucinacion: como todo modelo generativo, puede inventar contenido al reconstruir o resumir fragmentos HTML, especialmente en documentos con estructuras atipicas.
- Sesgos: no documentados por el autor; al entrenarse presumiblemente sobre web, puede heredar sesgos de ese corpus.
- Limitaciones de contexto e idioma: desconocidas; conviene validar el comportamiento con documentos largos y en castellano antes de usarlo en produccion.
- Licencia: Apache 2.0, permisiva para uso comercial, pero se recomienda revisar tambien la licencia del modelo base Qwen3.5-0.8B.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni validacion por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/opendatalab/MinerU-HTML-v1.1-qwen3.5-0.8B-compact
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Organizacion OpenDataLab: https://huggingface.co/opendatalab
