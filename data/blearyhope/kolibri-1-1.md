# blearyhope/Kolibri-1.1

## Resumen

Kolibri 1.1 es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por Aleph Alpha Research GmbH, sucesor de Kolibri 1. Esta disenado especificamente para razonamiento multi-paso, generacion de codigo y llamadas a herramientas en aleman e ingles, con una arquitectura que prioriza un coste de servicio bajo manteniendo una capacidad de modelo grande.

El modelo cuenta con 75.128 millones de parametros totales, de los cuales solo 3.440 millones se activan por token, lo que reduce drasticamente el coste computacional por token. Incorpora atencion dispersa (sparse attention) para abaratar contextos largos, con una longitud nativa de 262.144 tokens extensible hasta 1.048.576. Su arquitectura combina 2 capas densas con 48 capas MoE, empleando 384 expertos enrutados (6 seleccionados por token) mas un experto compartido.

Es relevante ahora porque se posiciona en la frontera de Pareto entre rendimiento y coste de servicio: segun el autor, obtiene un 73,2% en su evaluacion agregada con solo 0,21 GPU-horas por cada 1.000 tareas, frente al 66,6% y 0,72 GPU-horas de Kolibri 1.0. Se publica bajo licencia Apache 2.0, lo que facilita su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (Transformer; 2 capas densas + 48 capas MoE) |
| Parametros totales | 75.128.393.984 (75B) |
| Parametros activos | 3.439.874.304 (3,44B por token) |
| Longitud de contexto | 262.144 tokens nativo; hasta 1.048.576 (recomendado <=262.144) |
| Tipos de cuantizacion | FP8 (mencionado en tags); GGUF disponible en repo aparte (Aleph-Alpha/Kolibri-1.1-GGUF) |
| Idiomas soportados | Aleman (de), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo vLLM); GGUF en repositorio separado |

## Arquitectura y entrenamiento

Kolibri 1.1 es un transformer MoE con 2 capas densas iniciales seguidas de 48 capas MoE. Cada capa MoE dispone de 384 expertos enrutados, de los cuales se seleccionan 6 por token, mas 1 experto compartido. La atencion combina una proporcion 4:1 de ventana deslizante (sliding-window) frente a atencion dispersa, lo que abarata el procesamiento de contextos largos al concentrar la mayoria de capas en texto cercano y reservar unas pocas para seleccionar partes relevantes del contexto. El entrenamiento emplea Muon como optimizador y Exact Quantile Balancing para el enrutamiento de expertos.

El modelo se entrena por continuacion desde un checkpoint de mid-training de Kolibri 1, que acumulaba 20T tokens de pre-entrenamiento y 3,42T de mid-training. Sobre esa base se anaden 805B tokens de mid-training con atencion dispersa y 201B tokens de contexto largo. El post-entrenamiento incluye una mezcla de SFT con datos bilingues filtrados (open source y sinteticos) y una fase de RL con entornos que cubren razonamiento, uso agentico y seguimiento de instrucciones. El computo total de las fases propias de Kolibri 1.1 asciende a 5,52x10^22 FLOPs. El corte de conocimiento es el 18 de junio de 2026.

## Capacidades

- Generacion de texto y conversacion multi-turno en aleman e ingles.
- Modo de razonamiento explicito (reasoning mode) para tareas de razonamiento multi-paso.
- Llamadas a herramientas (tool calling / function calling).
- Uso agentico con razonamiento multi-paso.
- Generacion y asistencia de codigo.
- Extraccion estructurada de datos.
- Generacion aumentada por recuperacion (RAG) sobre documentos largos.
- Procesamiento de documentos extensos gracias a su contexto nativo de 262.144 tokens (hasta 1.048.576).
- Capacidades bilingues (aleman e ingles); no se declaran otros idiomas.

## Casos de uso

- Razonamiento multi-paso: el modelo activa su modo de razonamiento para descomponer problemas complejos en pasos intermedios, adecuado para analisis tecnico y toma de decisiones asistida.
- Generacion de codigo en produccion: soporta tool calling y puede integrarse en pipelines de CI/CD para generar, revisar y corregir codigo, con coste por token bajo gracias a sus 3,44B parametros activos.
- Agentes con llamadas a herramientas: su soporte de function calling y razonamiento agentico permite construir asistentes que consultan APIs, bases de datos o servicios externos en varios pasos.
- Procesamiento de documentos largos: con 262.144 tokens nativos puede ingerir contratos, informes o expedientes completos en una sola pasada, util para analisis legal o financiero.
- RAG sobre corpus extensos: la ventana de contexto larga y la atencion dispersa permiten incluir muchos fragmentos recuperados sin disparar el coste, mejorando la calidad de las respuestas documentales.
- Asistente bilingue aleman-ingles: para atencion al cliente o soporte interno en organizaciones que operan en ambos idiomas, con conversaciones multi-turno.
- Extraccion estructurada: conversion de texto no estructurado (facturas, formularios, correos) en JSON u otros formatos mediante salidas guiadas y tool calling.

## Benchmarks y rendimiento

Segun la informacion proporcionada, el autor reporta un rendimiento agregado del 73,2% en su evaluacion (ponderando ingles y aleman al 50% cada uno) con un coste de 0,21 GPU-horas por cada 1.000 tareas, frente al 66,6% y 0,72 GPU-horas de Kolibri 1.0. El modelo se situa en la frontera de Pareto junto a Qwen3.8 Flash Next. No se detallan en la informacion disponible los resultados desglosados por benchmark individual (MMLU, HumanEval, GSM8K, etc.).

| Metrica | Kolibri 1.1 | Kolibri 1.0 |
|---|---|---|
| Puntuacion agregada | 73,2% | 66,6% |
| GPU-horas / 1.000 tareas | 0,21 | 0,72 |

## Requisitos de hardware

- Huella de memoria del modelo: aproximadamente 77,6 GB.
- Minimo: 2x H100 SXM5, 2x H200, 1x B200 o 1x B300.
- Recomendado: 4x H100 SXM5, 2x H200, 2x B200 o 1x B300.
- No cabe en GPUs de consumo (RTX 4090, etc.) por su huella de ~77,6 GB y su naturaleza MoE que requiere mantener todos los expertos en memoria.
- Despliegue: libreria vLLM (etiqueta del repo); cuantizaciones GGUF disponibles en repositorio separado para llama.cpp/Ollama.
- Throughput medido por el autor con vLLM 0.33 sobre un nodo de 8x B200 con pesos de 8 bits, evaluando configuraciones TP1, TP2, TP4, TP8, DP4+EP4, DP8+EP8, DP4xTP2+EP8, DP2xTP4+EP8 y TP8+EP8, conservando la mas rapida por modelo. No se aportan cifras absolutas de tokens por segundo en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento agregado | Coste (GPU-h/1k tareas) | Licencia |
|---|---|---|---|---|---|
| Kolibri 1.1 | 75B (3,44B activos) | 262.144 (hasta 1.048.576) | 73,2% | 0,21 | Apache 2.0 |
| Kolibri 1.0 | no disponible | no disponible | 66,6% | 0,72 | Apache 2.0 |
| Qwen3.8 Flash Next | no disponible | no disponible | frontera de Pareto junto a Kolibri 1.1 | no disponible | no disponible |
| GLM-5.3 Flash | no disponible | no disponible | no disponible | 2,49 | no disponible |
| Qwen3.8 27B | 27B | no disponible | no disponible | 1,97 | no disponible |

Los datos de modelos comparables provienen de la grafica de coste-rendimiento del autor; no se dispone de sus especificaciones completas en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta aleman e ingles de forma nativa; no se declaran otros idiomas.
- Aunque admite hasta 1.048.576 tokens, la calidad en tareas complejas puede degradarse por encima de 262.144 tokens; el autor recomienda no superar esa longitud.
- El corte de conocimiento es el 18 de junio de 2026; la informacion posterior solo puede obtenerse mediante uso de herramientas.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan tasas concretas en la informacion disponible.
- No se detallan sesgos conocidos en la informacion proporcionada.
- La huella de memoria (~77,6 GB) obliga a hardware de datacenter; no es desplegable en GPUs de consumo.
- Licencia Apache 2.0 permite uso comercial, pero el autor publica una guia de uso responsable (RESPONSIBLE_USE.md) que conviene revisar.
- Aleph Alpha es firmante del Codigo de Practicas de GPAI de la UE, lo que implica compromisos de transparencia adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/blearyhope/Kolibri-1.1
- Blog post (Kolibri 1.1): https://aleph-alpha.com/en/blog/kolibri-1-1/
- Cuantizaciones GGUF: https://huggingface.co/Aleph-Alpha/Kolibri-1.1-GGUF
- Tech report (Kolibri 1): https://aleph-alpha.com/downloads/tech-report.pdf
- Guia de uso responsable: https://huggingface.co/Aleph-Alpha/Kolibri-1.1/blob/main/RESPONSIBLE_USE.md
- Codigo de Practicas GPAI de la UE: https://digital-strategy.ec.europa.eu/en/policies/contents-code-gpai
- Paper referenciado (arXiv 2512.11614): https://arxiv.org/abs/2512.11614
- Paper referenciado (arXiv 2601.17858): https://arxiv.org/abs/2601.17858
