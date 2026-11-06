# cyankiwi/Kolibri-1-AWQ-INT4

## Resumen

Kolibri-1-AWQ-INT4 es una cuantizacion de 4 bits en formato AWQ (Activation-aware Weight Quantization) del modelo Kolibri 1 de Aleph Alpha, publicada por el usuario cyankiwi. Kolibri 1 es un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) desarrollado por Aleph Alpha Research GmbH, disenado especificamente para razonamiento multi-paso, generacion de codigo y uso agentico con tool calling, con un enfoque claro en los idiomas aleman e ingles.

El modelo base cuenta con 78.103.074.560 parametros totales y 3.457.573.120 parametros activos por token, con una longitud de contexto de 1.048.576 tokens (aunque el autor recomienda no superar los 262.144 tokens para tareas complejas y eficiencia de servicio). Esta version cuantizada reduce el peso del repositorio hasta 55,3 GB, lo que la hace mas accesible para despliegues con recursos limitados que la version original en FP8 (~78 GB).

La relevancia de esta ficha radica en que la cuantizacion AWQ INT4 permite ejecutar un modelo MoE de 78B parametros en hardware mas modesto, manteniendo el modo de razonamiento explicito y las capacidades de tool calling. No obstante, conviene advertir que el numero de parametros reportado en los safetensors de esta version (18.501.448.448) no coincide con el del modelo base, lo que sugiere que la informacion disponible es parcial o que la cuantizacion ha alterado la representacion de los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), 50 capas, atencion 4:1 SWA:GQA |
| Parametros totales | 78.103.074.560 (modelo base); 18.501.448.448 reportados en safetensors de esta version |
| Parametros activos | 3.457.573.120 por token (modelo base) |
| Longitud de contexto | 1.048.576 tokens (recomendado ≤262.144) |
| Tipos de cuantizacion | AWQ INT4 (compressed-tensors); modelo base en float8_e4m3fn con bloques 128×128 |
| Idiomas soportados | Aleman (de), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers, compressed-tensors) |
| Expertos por capa | 384 (1 compartido, 6 enrutados) |
| Fecha de publicacion | 3 de octubre de 2026 (modelo base); 28 de octubre de 2026 (esta cuantizacion) |
| Knowledge cutoff | 18 de junio de 2026 (EN y DE) |

## Arquitectura y entrenamiento

Kolibri 1 es un transformer MoE de 50 capas que emplea una atencion hibrida con proporcion 4:1 entre sliding window attention (SWA) y grouped query attention (GQA). Cada capa contiene 384 expertos, de los cuales 1 es compartido y 6 son enrutados por token, lo que da lugar a los 3,46B parametros activos por token sobre un total de 78B. El entrenamiento utilizo Muon como optimizador y Exact Quantile Balancing para el enrutamiento de expertos.

El preentrenamiento se realizo sobre 20 billones (20T) de tokens de un corpus bilingue filtrado compuesto aproximadamente por un 62,5% de ingles, un 23,9% de aleman y un 13,6% de codigo, combinando datos web curados, reescrituras y traducciones sinteticas y fuentes de alta calidad. Posteriormente se realizo un mid-training de 3,44T tokens y una extension de contexto largo de 201B tokens. La secuencia de entrenamiento paso de 16.384 tokens en preentrenamiento a 65.536 en mid-training y 262.144 en la fase final de contexto largo. El post-entrenamiento incluyo SFT con datos bilingues filtrados (open source y sinteticos) y RL sobre un conjunto amplio de entornos que cubren razonamiento, uso agentico y seguimiento de instrucciones. El computo total se estimo en 6,4e23 FLOPS, con 768 NVIDIA B200 en preentrenamiento durante 21 dias (392k GPUh).

La innovacion principal reside en la combinacion de un contexto extremadamente largo (1M tokens) con una arquitectura MoE de alta eficiencia (solo 3,46B parametros activos), ademas de un modo de razonamiento explicito y soporte nativo de tool calling. La cuantizacion AWQ de cyankiwi se calibro con un dataset de dominios STEM y agenticos.

## Capacidades

- Generacion de texto y razonamiento multi-paso con modo de razonamiento explicito.
- Generacion y comprension de codigo, con entrenamiento especifico sobre un 13,6% de tokens de codigo.
- Tool calling / function calling nativo, orientado a flujos agenticos.
- Razonamiento agentico multi-turno y multi-paso.
- Procesamiento de documentos largos y RAG gracias a su contexto de hasta 1M tokens.
- Extraccion estructurada de informacion.
- Capacidades bilingues en aleman e ingles.
- Uso de informacion reciente mediante herramientas (el knowledge cutoff solo afecta al conocimiento implicito).
- No se ha documentado soporte de vision ni audio en la informacion disponible.

## Casos de uso

- Asistencia empresarial en aleman e ingles: el modelo puede gestionar conversaciones multi-turno y responder con precision en ambos idiomas gracias a su entrenamiento bilingue equilibrado (23,9% aleman) y a su contexto de hasta 1M tokens.
- Procesamiento de documentos largos: contratos, informes tecnicos o expedientes de cientos de miles de tokens pueden analizarse en una sola pasada, aprovechando la ventana de 1.048.576 tokens y la recomendacion de trabajar hasta 262.144 tokens para tareas complejas.
- RAG (retrieval-augmented generation): la combinacion de contexto largo y modo de razonamiento permite inyectar grandes volumenes de contexto recuperado y razonar sobre el antes de responder.
- Agentes autonomos con tool calling: integrable en pipelines donde el modelo decide que herramientas invocar (APIs, bases de datos, calculadoras) y encadena pasos de razonamiento.
- Generacion de codigo en produccion: su entrenamiento con un 13,6% de tokens de codigo y el soporte de tool calling lo hacen adecuado para asistentes de programacion y automatizacion de tareas de desarrollo.
- Extraccion estructurada de informacion: conversion de texto no estructurado (correos, informes, articulos) en JSON u otros formatos mediante instrucciones y razonamiento.
- Despliegue en hardware limitado: gracias a la cuantizacion AWQ INT4 (55,3 GB), puede servirse en configuraciones con menos VRAM que la version FP8 original (~78 GB), manteniendo el modo de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio cuantizado ocupa 55,3 GB, por lo que se necesita al menos esa cantidad de memoria para los pesos, mas overhead de KV cache y activaciones.
- Modelo base (FP8): ~78 GB de pesos; minimo 2× A100 80 GB, 2× H100 SXM5, 1× H200, 1× B200 o 1× B300; recomendado 2× H100 SXM5, 2× H200, 1× B200 o 1× B300.
- Version AWQ INT4: al reducir el peso a 55,3 GB, podria caber en configuraciones de 2× RTX 4090 (48 GB) solo si se aplica cuantizacion adicional u offloading; en una unica GPU consumer de 24 GB no cabe.
- Opciones de despliegue: transformers con compressed-tensors; compatible con endpoints; para produccion se recomienda vLLM o TGI con soporte de compressed-tensors. No se ha documentado soporte de llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kolibri-1-AWQ-INT4 (esta ficha) | 78B (base); 18,5B reportados en safetensors | 3,46B (base) | 1.048.576 | Apache 2.0 | Hugging Face |
| Aleph-Alpha/Kolibri-1 (base FP8) | 78B | 3,46B | 1.048.576 | Apache 2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables adicionales en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta aleman e ingles de forma nativa; el rendimiento en otros idiomas no esta garantizado.
- Riesgo de alucinacion inherente a los modelos de lenguaje; el modo de razonamiento no elimina este riesgo.
- El knowledge cutoff es el 18 de junio de 2026; la informacion posterior solo puede obtenerse mediante herramientas.
- La discrepancia entre los parametros reportados en safetensors (18,5B) y los del modelo base (78B) debe verificarse antes de usar la cuantizacion en produccion.
- Aunque la licencia es Apache 2.0, Aleph Alpha es firmante del Codigo de Practica GPAI de la UE, lo que puede implicar obligaciones de documentacion y transparencia en despliegues regulados.
- La cuantizacion AWQ INT4 puede degradar ligeramente la calidad respecto al modelo FP8 original; no se han publicado evaluaciones comparativas.
- El contexto maximo de 1M tokens no se recomienda para tareas complejas; el autor sugiere ≤262.144 tokens por eficiencia.
- No se ha documentado soporte de vision, audio ni otros modalidades.

## Enlaces

- Hugging Face (esta cuantizacion): https://huggingface.co/cyankiwi/Kolibri-1-AWQ-INT4
- Modelo base: https://huggingface.co/Aleph-Alpha/Kolibri-1
- Tech report: https://aleph-alpha.com/downloads/tech-report.pdf
- Tech blog: https://aleph-alpha.com/en/blog/kolibri-has-landed-a-sovereign-open-weight-model/
- Dataset de calibracion: https://huggingface.co/datasets/cyankiwi/calibration
- Web de cyankiwi: https://cyan.kiwi/
- Perfil de cyankiwi en Hugging Face: https://huggingface.co/cyankiwi
- ModelScope de cyankiwi: https://www.modelscope.ai/organization/cyankiwi
- X de cyankiwi: https://x.com/cyankiwi_ai
- Reddit de cyankiwi: https://www.reddit.com/r/cyankiwi/
- Codigo de Practica GPAI de la UE: https://digital-strategy.ec.europa.eu/en/policies/contents-code-gpai
- Paper referenciado (arxiv:2512.11614): no disponible el enlace directo en la informacion proporcionada
- Paper referenciado (arxiv:2601.17858): no disponible el enlace directo en la informacion proporcionada
