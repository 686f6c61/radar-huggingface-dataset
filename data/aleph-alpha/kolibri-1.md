# Aleph-Alpha/Kolibri-1

## Resumen

Kolibri-1 es un modelo de lenguaje de tipo mixtura de expertos (MoE) desarrollado por Aleph Alpha Research GmbH, orientado a razonamiento, generacion de codigo y uso conversacional en aleman e ingles. Con 78.103.074.560 parametros totales y solo 3.457.573.120 parametros activos por token, activa aproximadamente un 4,4 % de su capacidad en cada paso, lo que reduce el coste computacional por token manteniendo la capacidad de un modelo mucho mayor. Se distribuye bajo licencia Apache 2.0 y esta pensado como modelo soberano europeo de pesos abiertos.

El modelo incorpora un modo de razonamiento explicito y soporte de tool calling, y esta optimizado para contexto largo y eficiencia de inferencia. Su ventana de contexto nativa es de 262.144 tokens, validada hasta 1.048.576 tokens. La arquitectura combina atencion de ventana deslizante con atencion global (ratio 4:1 SWA:GQA) sobre 50 capas, lo que permite extender el contexto sin escalado posicional.

Es relevante ahora porque combina un tamano total de 78B con un coste de inferencia propio de un modelo mucho menor, se publica con pesos abiertos y licencia permisiva, y apunta explicitamente al mercado germanoparlante con un tokenizador adaptado a la estructura morfologica del aleman. La fecha de publicacion indicada es el 3 de octubre de 2026, con corte de conocimiento en junio de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE, 50 capas, atencion hibrida 4:1 SWA:GQA |
| Parametros totales | 78.103.074.560 (78B) |
| Parametros activos | 3.457.573.120 (3,46B) por token |
| Longitud de contexto | 262.144 tokens nativos; validado hasta 1.048.576 tokens |
| Tipos de cuantizacion | Pesos en `float8_e4m3fn` en bloques 128x128 con activaciones cuantizadas dinamicamente y KV cache FP8; embeddings, LM head, norms y router MoE en `bfloat16`; existe variante base en BF16 (`Kolibri-1-BF16`) |
| Idiomas soportados | Aleman (de), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Expertos por capa | 384 (1 compartido + 6 enrutados) |
| Corte de conocimiento | 18 de junio de 2026 (EN y DE) |
| Fecha de publicacion | 3 de octubre de 2026 |
| Huella de memoria | ~78 GB en FP8 |

## Arquitectura y entrenamiento

Kolibri-1 es un transformer MoE de 50 capas con 384 expertos por capa, de los cuales 1 es compartido y 6 se enrutan por token. Emplea atencion hibrida con proporcion 4:1 entre sliding-window attention (SWA) y grouped-query attention (GQA): la mayoria de capas atiende solo al contexto cercano y una minoria atiende a todo el contexto, lo que abarata el coste del contexto largo. La codificacion posicional se aplica unicamente en las capas de ventana deslizante, lo que permite extender el contexto mas alla de los 262.144 tokens nativos sin escalado posicional. El entrenamiento uso Muon como optimizador y Exact Quantile Balancing para el enrutamiento de expertos.

El preentrenamiento se realizo sobre 20 billones (20T) de tokens de un corpus bilingue filtrado con aproximadamente 62,5 % ingles, 23,9 % aleman y 13,6 % codigo, combinando datos web curados, reescrituras y traducciones sinteticas y fuentes de alta calidad. A ello se suman 3,44T de tokens en mid-training y 201B en la fase de extension de contexto largo. El preentrenamiento uso secuencias de 16.384 tokens, el mid-training de 65.536 y la fase final de 262.144. El post-entrenamiento incluyo SFT con datos bilingues filtrados (open source y sinteticos) y RL sobre un conjunto amplio de entornos que cubren razonamiento, uso agentico y seguimiento de instrucciones.

El computo de preentrenamiento, medido, fue de 768 NVIDIA B200 (96 nodos HGX 8xB200) con paralelismo EP8 FSDP16 DP6 durante 21 dias (511 h, 392k GPUh); el mid-training anadio 5 dias (90k GPUh) y la fase de contexto largo 13 h (10k GPUh) con FSDP128 DP6. El total de FLOPS estimado es 6,4e23. Se desarrollo un tokenizador especifico para la estructura de palabras del aleman, sin penalizar el ingles.

## Capacidades

- Generacion de texto y razonamiento multi-paso con modo de razonamiento explicito.
- Generacion y comprension de codigo, con un 13,6 % del corpus de preentrenamiento dedicado a codigo.
- Tool calling y function calling para integracion en capas de orquestacion que invocan APIs, ejecutan codigo o lanzan busquedas.
- Salida estructurada (structured output) para extraccion de datos y pipelines.
- Procesamiento de documentos largos y recuperacion aumentada (RAG) gracias a su contexto de hasta 262.144 tokens nativos y 1.048.576 validados.
- Capacidades bilingues profundas en aleman e ingles, con tokenizador optimizado para aleman.
- Flujos agenticos multi-paso con validacion humana de resultados.
- No se indica soporte de vision ni audio en la informacion disponible.

## Casos de uso

- Asistentes conversacionales en aleman e ingles: el modelo mantiene conversaciones multi-turno con contexto largo (hasta 262.144 tokens recomendados) y modo de razonamiento, adecuado para asistencia interna con revision humana.
- Procesamiento de documentos largos: analisis y resumen de contratos, informes o expedientes que superan la ventana de modelos convencionales, aprovechando la atencion hibrida que abarata el contexto extenso.
- RAG sobre material propio de una organizacion: respuesta a preguntas sobre corpus internos, con tool calling para consultar indices o bases de datos y validacion de resultados por el sistema llamante.
- Orquestacion agentica: capa de orquestacion que llama APIs, ejecuta codigo o lanza busquedas, apoyandose en structured output y tool calling, siempre con validacion de resultados.
- Generacion de codigo en pipelines: asistencia de programacion y automatizacion de tareas de CI/CD, con soporte de codigo y contexto suficiente para repositorios de tamano medio.
- Soporte a la decision: sistemas de apoyo que presentan evidencia y opciones de borrador para que un humano decida, no como componente decisor autonomo.
- Extraccion estructurada de informacion: conversion de texto no estructurado en JSON u otros formatos para alimentar sistemas posteriores, con salida estructurada y contexto largo.
- Herramientas internas de conocimiento e investigacion en entornos germanoparlantes, donde el tokenizador adaptado al aleman reduce el coste por token frente a modelos multilingues genericos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Huella de memoria del modelo: aproximadamente 78 GB en pesos FP8.
- Minimo indicado por el autor: 2x A100 80 GB, 2x H100 SXM5, 1x H200, 1x B200 o 1x B300.
- Recomendado: 2x H100 SXM5, 2x H200, 1x B200 o 1x B300.
- No cabe en GPU de consumo: la huella de 78 GB en FP8 excede la VRAM de tarjetas como RTX 4090 (24 GB) o RTX 5090; requeriria cuantizaciones adicionales no documentadas o descarga a CPU, no soportadas oficialmente en la informacion disponible.
- Despliegue: compatible con la libreria transformers; el tag `endpoints_compatible` sugiere compatibilidad con endpoints gestionados. No se detallan opciones como vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles. El autor recomienda contextos de hasta 262.144 tokens para despliegues sensibles a latencia o throughput.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible. A modo de referencia estructural, Kolibri-1 se situa en la categoria de MoE de ~78B totales con ~3,46B activos, contexto nativo de 262.144 tokens y licencia Apache 2.0; cualquier comparacion con alternativas de la misma categoria requeriria datos que no se han facilitado.

## Limitaciones y advertencias

- Sesgos: no se documentan sesgos especificos en la informacion disponible; al entrenarse sobre datos web curados y sinteticos, es previsible que herede sesgos de esas fuentes.
- Riesgo de alucinacion: no se cuantifica; el modelo esta pensado para uso con revision humana, no para operacion autonoma sin supervision.
- Cobertura linguistica limitada a aleman e ingles; no se garantiza calidad en otros idiomas.
- Contexto: aunque se valida hasta 1.048.576 tokens, el autor recomienda no superar 262.144 tokens para eficiencia y tareas complejas.
- El corte de conocimiento (junio de 2026) afecta solo al conocimiento implicito; la informacion mas reciente debe obtenerse via herramientas.
- Uso previsto restringido a sistemas con revision humana; no disenado como componente decisor autonomo en sistemas de decision.
- Licencia Apache 2.0 permisiva para uso comercial; no se indica Acceptable Use Policy adicional (n/a), aunque se remite a la seccion Responsible Use.
- El coste de memoria es alto pese al bajo numero de parametros activos: el modelo completo debe residir en memoria, lo que limita el despliegue a hardware de datacenter.

## Enlaces

- Hugging Face: https://huggingface.co/Aleph-Alpha/Kolibri-1
- Modelo base BF16: https://huggingface.co/Aleph-Alpha/Kolibri-1-BF16
- Tech report: https://aleph-alpha.com/downloads/tech-report.pdf
- Tech blog: https://aleph-alpha.com/en/blog/kolibri-has-landed-a-sovereign-open-weight-model/
- Codigo de practicas GPAI de la UE: https://digital-strategy.ec.europa.eu/en/policies/contents-code-gpai
- Papers referenciados en los tags: arxiv:2512.11614, arxiv:2601.17858
