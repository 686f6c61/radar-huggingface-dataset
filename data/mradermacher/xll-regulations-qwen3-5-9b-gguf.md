# mradermacher/xll-regulations-qwen3.5-9b-GGUF

## Resumen

xll-regulations-qwen3.5-9b-GGUF es la version cuantizada en formato GGUF del modelo thurstonpowers/xll-regulations-qwen3.5-9b, un ajuste fino completo (full fine-tune) del modelo base Qwen 3.5 de 9B orientado al dominio de regulaciones legales y estructuras normativas. El modelo ha sido publicado por mradermacher, un conocido cuantizador de la comunidad de Hugging Face, y deriva de un fine-tune especializado entrenado sobre el dataset thurstonpowers/xll-regulations-dataset, con etiquetas que apuntan a formatos USLM (United States Legislative Markup) y estructuras legales jerarquicas.

El modelo resuelve el problema de procesar y generar texto legal estructurado en ingles, un dominio donde los modelos genericos suelen fallar al mantener la jerarquia normativa, las referencias cruzadas y el marcado semantico propio de la legislacion. Con 8.953.803.264 parametros (aproximadamente 9B), hereda la arquitectura transformer densa de la familia Qwen 3.5, aunque la informacion disponible no detalla la longitud de contexto ni la composicion exacta del entrenamiento.

La relevancia de esta ficha radica en que ofrece una via practica de despliegue local del modelo mediante cuantizaciones GGUF de 2 a 16 bits, con tamanos que van desde 3,9 GB hasta 18 GB, lo que permite ejecutarlo en hardware de consumo. La licencia Apache 2.0 facilita su uso comercial, si bien el soporte linguistico se limita al ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer densa (derivada de Qwen 3.5; detalles no disponibles) |
| Parametros totales | 8.953.803.264 (aproximadamente 9B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base original se distribuye en safetensors via transformers) |

## Arquitectura y entrenamiento

El modelo base thurstonpowers/xll-regulations-qwen3.5-9b es un ajuste fino completo (full fine-tune) de un modelo Qwen 3.5 de 9B. La informacion disponible no especifica la arquitectura interna mas alla de que se trata de un transformer denso de aproximadamente 9B parametros, ni detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. El dataset de entrenamiento es thurstonpowers/xll-regulations-dataset, orientado a regulaciones y estructuras legales, con etiquetas que sugieren el uso de formatos USLM y marcado estructural legal (tags: regulations, uslm, xll, legal-structure).

La innovacion principal de esta publicacion concreta no reside en la arquitectura, sino en la cuantizacion: mradermacher ha generado cuantizaciones estaticas (static quants) del modelo, sin versiones ponderadas/imatrix disponibles en el momento de la publicacion. El autor indica que las cuantizaciones ponderadas podrian no aparecer y que, de hacerlo, seria en la semana siguiente a las estaticas. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto en ingles especializada en dominio legal y regulatorio.
- Procesamiento de estructuras normativas jerarquicas y formatos tipo USLM (United States Legislative Markup).
- Comprension y generacion de referencias cruzadas y marcado semantico legal.
- Conversacion multi-turno (tag conversational en Hugging Face).
- Compatibilidad con endpoints (tag endpoints_compatible).
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion disponible.
- Capacidades multilingues limitadas al ingles segun la model card.

## Casos de uso

- Analisis de normativa estructurada: el modelo puede procesar documentos legales en formato USLM y extraer la jerarquia de secciones, articulos y apartados, aprovechando su fine-tune especifico sobre estructuras regulatorias.
- Generacion de borradores normativos: util para redactar texto regulatorio en ingles manteniendo el marcado estructural y las convenciones de citacion legal aprendidas durante el fine-tune.
- Auditoria de consistencia normativa: el modelo puede revisar referencias cruzadas entre secciones de una regulacion y detectar incoherencias en la numeracion o en las remisiones internas.
- Extraccion de metadatos legales: conversion de texto normativo plano a estructuras etiquetadas (USLM), facilitando la integracion en bases de datos juridicas y sistemas de gestion documental.
- Asistencia a equipos de compliance: resumen y consulta de regulaciones en ingles para departamentos legales, con despliegue local que evita enviar documentos sensibles a APIs externas.
- Despliegue en entornos con recursos limitados: gracias a las cuantizaciones Q4_K_M (5,7 GB) y Q5_K_M (6,6 GB), puede ejecutarse en estaciones de trabajo con GPU de consumo para tareas de procesamiento por lotes de documentos regulatorios.
- Prototipado de asistentes legales especializados: base para construir chatbots de consulta normativa en ingles con inferencia local mediante llama.cpp u Ollama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K aproximadamente 4 GB; Q4_K_M aproximadamente 6 GB; Q5_K_M aproximadamente 7 GB; Q8_0 aproximadamente 10 GB; f16 aproximadamente 18 GB.
- GPU recomendadas: para Q4_K_M y Q5_K_M, una RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB es suficiente; para Q8_0, una RTX 4090 de 24 GB o A100; para f16, A100 40 GB o H100.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas de VRAM usando cuantizaciones Q4 o Q5; las cuantizaciones Q2_K y Q3_K_S permiten incluso GPUs de 6 GB.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base tambien puede servirse con transformers, vLLM o TGI si se usa el repositorio original en safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| xll-regulations-qwen3.5-9b-GGUF | ~9B | no disponible | apache-2.0 | GGUF | Fine-tune legal en ingles, cuantizado por mradermacher |
| thurstonpowers/xll-regulations-qwen3.5-9b | ~9B | no disponible | apache-2.0 | safetensors | Modelo base original del que deriva esta cuantizacion |
| Qwen 3.5 9B (base) | ~9B | no disponible | no disponible | safetensors | Modelo generalista sin especializacion legal |
| Alternativas legales de ~7-9B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- El modelo solo soporta ingles; no se debe esperar un rendimiento adecuado en castellano u otros idiomas.
- Al ser un fine-tune especializado en regulaciones, puede degradar su rendimiento en tareas generales fuera del dominio legal.
- Riesgo de alucinacion en citas normativas: el modelo puede generar referencias a articulos o secciones inexistentes; requiere verificacion humana en contextos de produccion.
- No se dispone de informacion sobre sesgos especificos del fine-tune ni sobre la composicion del dataset de entrenamiento, lo que impide evaluar su cobertura normativa (por ejemplo, si cubre solo legislacion estadounidense).
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) pueden degradar notablemente la fidelidad estructural en texto legal, donde pequenos errores de marcado tienen impacto; se recomienda Q4_K_M o superior para uso serio.
- No hay cuantizaciones ponderadas/imatrix disponibles en el momento de la publicacion, lo que puede afectar la calidad respecto a versiones con imatrix.
- Aunque la licencia es Apache 2.0, el uso en produccion legal no exime de la responsabilidad de validar las salidas por parte de profesionales cualificados.
- El repositorio ocupa 81,4 GB debido a la multiplicidad de cuantizaciones; conviene descargar solo la variante necesaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/xll-regulations-qwen3.5-9b-GGUF
- Modelo base original: https://huggingface.co/thurstonpowers/xll-regulations-qwen3.5-9b
- Dataset de entrenamiento: https://huggingface.co/datasets/thurstonpowers/xll-regulations-dataset
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#xll-regulations-qwen3.5-9b-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
