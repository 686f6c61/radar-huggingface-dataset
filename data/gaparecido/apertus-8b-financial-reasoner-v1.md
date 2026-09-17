# gaparecido/apertus-8b-financial-reasoner-v1

## Resumen

apertus-8b-financial-reasoner-v1 es un ajuste fino (fine-tune) publicado por el usuario gaparecido en HuggingFace, construido sobre el modelo unsloth/apertus-8b-instruct-2509-unsloth-bnb-4bit, que a su vez es una version cuantizada a 4 bits de la familia Apertus-8B en su variante instruct. El repositorio contiene 8.053.338.176 parametros reales (aproximadamente 8.000 millones), esta etiquetado como text-generation-inference y transformers, y se distribuye bajo licencia Apache 2.0.

El nombre del modelo sugiere un ajuste orientado a razonamiento financiero, pero la model card publicada no documenta el dataset de entrenamiento, el procedimiento de ajuste ni ninguna evaluacion especifica del dominio financiero. La unica informacion tecnica que aporta el autor es que el entrenamiento se realizo con Unsloth y la libreria TRL de HuggingFace, con una mejora declarada de velocidad de 2x respecto a un entrenamiento convencional.

Se trata de un modelo con 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado y con una model card minima. Es relevante unicamente como ejemplo de fine-tune ligero sobre la familia Apertus, no como un modelo validado para produccion: no hay benchmarks, no hay descripcion del dataset y la unica evidencia de funcionamiento es la procedencia del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: familia Apertus-8B; detalles de arquitectura no documentados en la model card) |
| Parametros totales | 8.053.338.176 |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repo; el modelo base se distribuye en 4 bits (bnb-4bit) y el repo de este fine-tune ocupa 16,1 GB |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna en la model card proporcionada. El modelo hereda la arquitectura del checkpoint base unsloth/apertus-8b-instruct-2509-unsloth-bnb-4bit, que es una conversion a 4 bits (bitsandbytes) del modelo instruct Apertus-8B, orientada a facilitar el ajuste fino con Unsloth. No hay datos publicados sobre el numero de capas, dimension del hidden state, mecanismo de atencion ni tipo de tokenizador en la informacion disponible.

Respecto al entrenamiento, la model card indica unicamente que el fine-tune se realizo con Unsloth y la libreria TRL de HuggingFace, y que fue "2x mas rapido" que un entrenamiento convencional. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF, DPO o cualquier otra etapa de alineamiento, ni la duracion o el hardware utilizado. Tampoco se documenta ninguna innovacion tecnica propia. El tamano del repositorio (16,1 GB) es coherente con pesos en precision de 16 bits (8B x 2 bytes), lo que sugiere que se guardaron pesos fusionados en lugar de un adaptador LoRA, pero esto no se confirma en la documentacion.

## Capacidades

Nota: la model card no documenta capacidades de forma explicita. Las siguientes se infieren del modelo base (Apertus-8B instruct) y del nombre del repositorio, y deben verificarse empiricamente antes de cualquier uso en produccion.

- Generacion de texto en ingles en formato conversacional (modelo instruct).
- Razonamiento de proposito general heredado del modelo base Apertus-8B instruct.
- Presunto razonamiento de dominio financiero, segun el nombre del repositorio ("financial-reasoner"), sin evaluacion publicada que lo respalde.
- Soporte de function calling / tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: el modelo esta etiquetado exclusivamente como "en", por lo que el uso en castellano no esta garantizado.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Ajuste adicional sobre el modelo base: se desconoce la magnitud y el alcance del fine-tune.

## Casos de uso

Nota: al no existir evaluacion publicada, estos casos de uso son escenarios plausibles derivados del tamano del modelo, del modelo base instruct y del nombre del repositorio. Requieren validacion previa.

- Analisis de informes financieros: extraccion y resumen de secciones de memorias anuales, 10-K o informes trimestrales en ingles, aprovechando el presunto ajuste en dominio financiero. La ventana de contexto real debe confirmarse antes de procesar documentos completos.
- Normalizacion y clasificacion de transacciones: categorizacion de descripciones de movimientos bancarios y asignacion de codigos contables, siempre que se valide la precision sobre el vocabulario especifico del cliente.
- Generacion de borradores de comentarios de resultados: redaccion asistida de resumentes de variaciones trimestrales a partir de tablas de datos previamente extraidas por otro sistema.
- Soporte interno a analistas: asistente conversacional sobre documentacion financiera propia mediante tecnicas de recuperacion (RAG), con el modelo como generador final en ingles.
- Extraccion de entidades de documentos regulatorios: identificacion de importes, fechas, contrapartes y clausulas en textos normativos en ingles.
- Preprocesamiento de datos para pipelines de analitica: conversion de texto no estructurado a estructuras tipo JSON antes de cargarlo en un almacen de datos, sujeto a validacion del formato de salida.
- Prototipado e investigacion: experimentacion con fine-tunes ligeros sobre la familia Apertus en entornos academicos o de I+D, gracias al flujo de trabajo basado en Unsloth.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla de evaluacion alguna, ni resultados de MMLU, HumanEval, GSM8K, IFEval ni de cualquier otro conjunto de referencia. Tampoco se aportan metricas de latencia o throughput.

## Requisitos de hardware

Estimaciones calculadas a partir del numero de parametros (8.053.338.176), no medidas sobre este modelo concreto:

- VRAM estimada para inferencia en FP16/BF16: en torno a 16,1 GB solo para pesos, mas overhead de cache KV; en la practica, 20-24 GB para lotes pequenos con contexto moderado.
- VRAM estimada en cuantizacion INT8: aproximadamente 8-9 GB de pesos.
- VRAM estimada en cuantizacion 4 bits (GGUF Q4_K_M o similar): aproximadamente 5-6 GB de pesos.
- GPU profesionales: A100 40/80 GB, H100 80 GB, L40S 48 GB funcionan con holgura en FP16.
- GPU de consumo: cabe en RTX 3090, RTX 4090 y RTX 5090 (24-32 GB) en FP16; en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) es necesario recurrir a cuantizacion de 4 u 8 bits.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta presente en el repositorio), vLLM (compatible con pesos safetensors en BF16, requiere conversion previa si se parte del modelo en 4 bits), llama.cpp y Ollama (requieren conversion a GGUF, no incluida en el repositorio).
- Latencia y throughput: no disponibles. No hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| apertus-8b-financial-reasoner-v1 | 8.053.338.176 | no disponible | Apache 2.0 | HuggingFace, 0 descargas |
| Apertus-8B-Instruct (modelo base de la familia) | ~8.000 millones | no disponible | Apache 2.0 (segun el ecosistema Apertus) | HuggingFace (checkpoint base en 4 bits via Unsloth) |
| Llama-3.1-8B-Instruct | 8.030 millones | 131.072 tokens | Licencia comunitaria de Meta Llama 3.1 | HuggingFace, ampliamente desplegado |
| Qwen2.5-7B-Instruct | 7.620 millones | 131.072 tokens | Apache 2.0 | HuggingFace, ampliamente desplegado |

Los datos de parametros y contexto de Llama-3.1-8B-Instruct y Qwen2.5-7B-Instruct corresponden a sus especificaciones publicas conocidas. Para el modelo objeto de esta ficha no hay datos de contexto ni de rendimiento, por lo que la comparacion se limita a parametros, licencia y disponibilidad. No se dispone de informacion sobre el contexto nativo de la familia Apertus-8B en la documentacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni evaluacion cualitativa, ni ejemplos de salida en el repositorio.
- Model card minima: no se documenta el dataset de fine-tune, el numero de pasos, la tasa de aprendizaje ni el metodo de entrenamiento. Es imposible reproducir el ajuste.
- Sesgos: no se han publicado analisis de sesgo. Al ser un fine-tune no auditado, los sesgos del modelo base pueden haberse amplificado o introducido sesgos nuevos segun el dataset (desconocido) utilizado.
- Riesgo de alucinacion: elevado en un contexto financiero, donde la generacion de cifras, fechas o clausulas inexactas tiene consecuencias directas. No debe usarse para decisiones de inversion o cumplimiento normativo sin revision humana.
- Idioma: etiquetado exclusivamente como "en". El rendimiento en castellano es desconocido y previsiblemente degradado.
- Contexto: se desconoce la longitud de contexto soportada, lo que impide planificar casos de uso con documentos largos.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, pero no exime de las obligaciones derivadas de la licencia del modelo base ni de las condiciones de uso de los datos de entrenamiento, que no se documentan.
- Uso en produccion: con 0 descargas y 0 likes, se trata de un artefacto sin validacion por parte de la comunidad. No se recomienda su adopcion en entornos productivos sin una evaluacion propia exhaustiva.
- Metadatos incoherentes: las fechas de creacion y actualizacion del repositorio (16 de septiembre de 2026) son posteriores a la fecha habitual de publicacion de los modelos de la familia Apertus, lo que sugiere posibles errores en los metadatos.
- Cadena de dependencias: al derivar de un checkpoint cuantizado a 4 bits y publicarse como pesos fusionados, conviene verificar la fidelidad numerica de la conversion antes de desplegarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gaparecido/apertus-8b-financial-reasoner-v1
- Modelo base: https://huggingface.co/unsloth/apertus-8b-instruct-2509-unsloth-bnb-4bit
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- Enlaces adicionales (papers, blogs, demos): no disponible. Los resultados de la busqueda web realizada no contienen informacion relacionada con este modelo ni con la familia Apertus.
