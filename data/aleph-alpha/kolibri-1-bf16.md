# Aleph-Alpha/Kolibri-1-BF16

## Resumen

Kolibri 1 es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por Aleph Alpha Research GmbH, con un enfoque deliberado en aleman e ingles. Cuenta con 78.103.074.560 parametros totales, de los cuales solo 3.457.573.120 (unos 3,46B) se activan por token, lo que permite un coste de computo por token bajo manteniendo la capacidad de un modelo mucho mayor. El modelo incorpora un modo de razonamiento explicito y soporte de tool calling, y esta optimizado tanto para contexto largo como para eficiencia de inferencia.

Su rasgo mas distintivo es su ventana de contexto: fue entrenado de forma nativa a 262.144 tokens, pero la codificacion posicional se aplica unicamente en las capas de ventana deslizante, lo que permite extender el contexto sin escalado posicional. El autor ha validado calidad y eficiencia de servicio hasta 1.048.576 tokens. Aleph Alpha recomienda no superar los 262.144 tokens para despliegues sensibles a latencia o throughput y para tareas complejas.

El modelo se publica bajo licencia Apache 2.0 con pesos en bfloat16 y la libreria vLLM como via de servicio declarada, con un footprint de aproximadamente 156 GB. Está pensado para asistentes conversacionales y flujos agénticos en aleman e ingles, con enfasis en revision humana de las salidas antes de actuar sobre ellas. Aleph Alpha es firmante del Codigo de Buenas Practicas de IA de Proposito General de la UE (EU GPAI Code of Practice).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE); transformer de 50 capas con atencion 4:1 SWA:GQA |
| Parametros totales | 78.103.074.560 (~78B) |
| Parametros activos | 3.457.573.120 (~3,46B) por token; 384 expertos por capa, 1 compartido y 6 enrutados |
| Longitud de contexto | 1.048.576 tokens validados; contexto nativo 262.144; recomendado <=262.144 |
| Tipos de cuantizacion | BF16 (bfloat16); no disponible otra informacion sobre cuantizaciones |
| Idiomas soportados | Aleman (de), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

Kolibri 1 es un transformer de 50 capas con arquitectura MoE. Cada capa alberga 384 expertos, de los que 1 es compartido y 6 son enrutados por token, lo que da un total de 7 expertos activos por capa. La atencion combina capas de ventana deslizante (SWA) y atencion con consultas agrupadas (GQA) en una proporcion 4:1: la mayoria de las capas atienden solo al texto cercano y una minoria cubre todo el contexto, decision disenada para abaratar el coste del contexto largo. El entrenamiento utilizo optimizador Muon y la tecnica Exact Quantile Balancing para el enrutamiento.

El preentrenamiento se realizo sobre 20 billones (20T) de tokens de un corpus bilingue filtrado con aproximadamente un 62,5% de ingles, un 23,9% de aleman y un 13,6% de codigo, combinando datos web curados, reescrituras y traducciones sinteticas y fuentes de alta calidad. A ello se sumaron 3,44T de tokens en mid-training y 201.000 millones (201B) en la fase de extension de contexto largo. Las secuencias de preentrenamiento fueron de 16.384 tokens, el mid-training de 65.536 y la fase final de contexto largo de 262.144 tokens. El post-entrenamiento incluyo un mix de SFT con datos bilingues filtrados (open source y sinteticos) y una fase de RL con entornos que cubren razonamiento, comportamiento agéntico y seguimiento de instrucciones. El cutoff de conocimiento indicado es el 18 de junio de 2026 para ingles y aleman, y afecta solo al conocimiento implicito.

En cuanto a recursos de computo, el preentrenamiento se ejecuto sobre 768 NVIDIA B200 (96 nodos HGX 8xB200) con paralelismo EP8 FSDP16 DP6 durante 21 dias (511 h, 392k GPUh); el mid-training duro 5 dias (90k GPUh) y la fase de contexto largo 13 h (10k GPUh) con FSDP128 DP6. El total de FLOPS reportado es de 6,4e23. El consumo energetico estimado, incluyendo preentrenamiento, mid-training y contexto largo (con overhead de centro de datos, PUE), es de 9,5x10^2 MWh.

## Capacidades

- Generacion de texto y conversacion en aleman e ingles.
- Modo de razonamiento explicito (reasoning mode).
- Razonamiento multi-paso.
- Tool calling y function calling.
- Flujos agénticos, incluida la orquestacion de APIs, ejecucion de codigo y busquedas.
- Generacion de codigo.
- Extraccion estructurada de datos (structured extraction) y salida estructurada.
- RAG (generacion aumentada por recuperacion) sobre material propio de una organizacion.
- Procesamiento de documentos largos gracias al contexto extendido.
- Tokenizer especifico adaptado a la estructura morfologica del aleman, sin penalizar el ingles.

## Casos de uso

- Asistentes conversacionales en aleman e ingles: con contexto nativo de 262.144 tokens (extensible a 1.048.576), el modelo puede mantener conversaciones multi-turno con historiales extensos y documentacion adjunta sin truncar informacion.
- Generacion de codigo asistida: el soporte de tool calling permite integrarlo en pipelines de desarrollo que invocan compiladores, linters o ejecutores de tests, validando las salidas antes de aplicarlas.
- Orquestacion agéntica de APIs: como capa de orquestacion que llama a servicios externos, ejecuta codigo o lanza busquedas, siempre con el sistema llamante validando los resultados, tal como recomienda el autor.
- RAG sobre conocimiento interno: respuesta a preguntas sobre el material de una organizacion, combinando recuperacion de documentos con el contexto largo para incorporar multiples fragmentos.
- Procesamiento de documentos largos: analisis y resumen de contratos, informes o expedientes que superan la ventana tipica de otros modelos, con la advertencia de vigilar la latencia por encima de 262.144 tokens.
- Extraccion estructurada: conversion de texto no estructurado (facturas, formularios, correspondencia) en campos estructurados para su volcado a bases de datos.
- Sistemas de soporte a la decision en modo consultivo: el modelo presenta evidencias y borradores de opciones para que una persona decida, no como componente decisor.
- Herramientas internas de conocimiento e investigacion: busqueda y sintesis sobre repositorios documentales de una empresa, con revision humana del resultado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Footprint de memoria del modelo: aproximadamente 156 GB en pesos BF16 (el repositorio ocupa 156,2 GB).
- Configuracion minima indicada por el autor: 4x A100 de 80 GB, 4x H100 SXM5, 2x H200, 1x B200 o 1x B300.
- Configuracion recomendada: 4x H100 SXM5, 2x H200, 2x B200 o 1x B300.
- No cabe en GPU de consumo (por ejemplo, una RTX 4090 con 24 GB) en BF16; no se ha publicado ninguna cuantizacion que reduza el footprint, por lo que no puede confirmarse su viabilidad en hardware de consumo.
- Despliegue: la libreria declarada es vLLM, con pesos en safetensors. No se menciona soporte de llama.cpp, Ollama, TGI ni formatos GGUF en la informacion disponible.
- El compuPor token es bajo (3,46B parametros activos), pero el requisito de memoria es alto, ya que el modelo completo debe permanecer en memoria aunque solo se active una fraccion por token.
- Latencia y throughput: no disponibles. El autor recomienda limitar el contexto a 262.144 tokens para despliegues sensibles a latencia o throughput.

## Comparativa con modelos similares

No se han publicado resultados de benchmarks de Kolibri 1 en la informacion disponible, por lo que la comparacion se limita a caracteristicas estructurales frente a otros modelos MoE publicos de proposito general. Los datos de terceros corresponden a informacion publica ampliamente conocida y pueden variar segun la version.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Idiomas |
|---|---|---|---|---|---|
| Kolibri 1 (Aleph Alpha) | ~78B | ~3,46B | 1.048.576 validados; nativo 262.144 | Apache 2.0 | de, en |
| Qwen3-30B-A3B | ~30,5B | ~3,3B | 262.144 nativo (extensible con YaRN) | Apache 2.0 | multilingue |
| Mixtral 8x7B | ~46,7B | ~12,9B | 32.768 | Apache 2.0 | multilingue |
| DeepSeek-V2 | ~236B | ~21B | 128.000 | licencia especifica de DeepSeek | multilingue |

La diferencia principal de Kolibri 1 es su especializacion bilingue aleman-ingles (frente a la orientacion multilingue de las alternativas) y la extension de contexto sin escalado posicional. La comparacion de calidad entre estos modelos no puede realizarse con la informacion disponible.

## Limitaciones y advertencias

- Idiomas limitados a aleman e ingles: es una eleccion deliberada de profundidad frente a amplitud, por lo que el rendimiento en otros idiomas no esta garantizado ni documentado.
- Riesgo de alucinacion: inherente a los modelos de lenguaje generativos; el autor no reporta tasas especificas y recomienda revision humana de las salidas.
- Sesgos conocidos: no disponible informacion especifica sobre sesgos en la informacion proporcionada; el modelo se entrena sobre datos web y sinteticos, lo que puede introducir sesgos de esas fuentes.
- Contexto: aunque se ha validado hasta 1.048.576 tokens, el autor solo garantiza calidad y eficiencia de servicio de forma recomendada hasta 262.144 tokens; por encima de ese umbral pueden degradarse latencia y throughput.
- Uso previsto restringido: el modelo no esta disenado para operacion autonoma sin supervision; se orienta a colaboracion humano-IA con revision de las salidas. En sistemas de apoyo a la decision debe situarse en el lado consultivo, nunca como componente decisor.
- Las capacidades de tool calling y salida estructurada requieren que el sistema llamante valide los resultados antes de actuar.
- Cutoff de conocimiento: 18 de junio de 2026 para conocimiento implicito en aleman e ingles; informacion posterior solo accesible mediante uso de herramientas.
- Licencia: Apache 2.0, que permite uso comercial, si bien Aleph Alpha esta sujeto al EU GPAI Code of Practice, cuyas obligaciones pueden afectar al despliegue en la UE.
- Requisitos de hardware muy altos para BF16 (minimo 2x H200 o 4x H100 SXM5), lo que dificulta su uso en entornos con recursos limitados. No hay cuantizaciones publicadas que lo alivien.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Aleph-Alpha/Kolibri-1-BF16
- Informe tecnico (tech report): https://aleph-alpha.com/downloads/tech-report.pdf
- Blog tecnico: https://aleph-alpha.com/en/blog/kolibri-has-landed-a-sovereign-open-weight-model/
- arXiv 2512.11614: https://arxiv.org/abs/2512.11614
- arXiv 2601.17858: https://arxiv.org/abs/2601.17858
- EU GPAI Code of Practice: https://digital-strategy.ec.europa.eu/en/policies/contents-code-gpai
