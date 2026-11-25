# PsychoLogic/knowline-31b-Gen1.5-IQ3_M-GGUF

## Resumen

knowline-31b-Gen1.5-IQ3_M-GGUF es una cuantizacion GGUF en formato IQ3_M del modelo PelaAI/KnowLine-31B-Gen1.5, publicada por el usuario PsychoLogic. Se trata de una version comprimida de un modelo de decision (etiquetado como `decision-model`) de aproximadamente 30.700 millones de parametros, pensada para ejecutarse de forma residente en GPUs de 16 GB de VRAM. El archivo ocupa 14,4 GB y se ha generado con llama.cpp a partir de los pesos originales en F16.

El modelo base pertenece a la familia KnowLine de PelaAI, orientada a la toma de decisiones y a la clasificacion de llamadas en entornos conversacionales. Segun la model card, la salida del modelo se articula en torno a veredictos discretos (SHORT, LONG, VETO, CLOSE, PASS), lo que lo aleja de un modelo generativo de proposito general y lo acerca a un componente especializado dentro de un pipeline de agentes o de enrutamiento.

Su relevancia practica radica en dos factores: por un lado, demuestra que un modelo de 30B puede servirse de forma residente en una tarjeta consumer de 16 GB mediante cuantizacion IQ3_M con cache KV en q8_0; por otro, incluye un conjunto de parches para el conversor de llama.cpp que corrigen la temperatura de scoring (`temperatures.json`, score temp 0.6944), un detalle que afecta directamente a la fidelidad de las decisiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer; no se detalla en la informacion proporcionada) |
| Parametros totales | 30.697.345.596 (~30,7B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible (la model card menciona `-c 4096` como configuracion de servido medida) |
| Tipos de cuantizacion | IQ3_M (14,4 GB); pesos originales en F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base (tipo de transformer, atencion, capas ni estrategia de entrenamiento) en los materiales proporcionados. La model card del GGUF unicamente documenta el proceso de cuantizacion: conversion desde F16 mediante `convert_hf_to_gguf.py` de llama.cpp (master `0a731cc`) con parches propios, y cuantizacion a IQ3_M con `llama-quantize`.

El detalle tecnico mas relevante es el parche 0007, que corrige el tratamiento de `temperatures.json` que incluye Gen1.5. Sin ese parche, el GGUF fija incorrectamente la temperatura de scoring a 1.0; con el, se respeta el valor 0.6944 del checkpoint original. El autor indica que la diferencia entre ambas builds es estadisticamente indistinguible (62,2 % frente a 62,0 % de acuerdo), por lo que el perfil de veredictos no es un artefacto de temperatura. No consta informacion sobre volumen de tokens de entrenamiento, composicion del dataset ni tecnicas de alineacion (RLHF/DPO).

## Capacidades

- Emision de veredictos discretos de decision: SHORT, LONG, VETO, CLOSE y PASS.
- Clasificacion y enrutamiento de llamadas en pipelines conversacionales (perfil de "gated caller" de alta conviccion).
- Servido compatible con endpoints (tag `endpoints_compatible`) y uso conversacional.
- Ejecucion en llama.cpp con cache KV en q8_0 y ventana de 4096 tokens en GPU de 16 GB.
- No se documentan capacidades de codigo, matematicas, vision, audio, tool calling ni agentes multi-paso en la informacion disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Enrutamiento de decisiones en produccion: el modelo puede actuar como clasificador de alto nivel que devuelve un veredicto discreto para cada llamada, integrandose en un orquestador que derive la peticion al componente adecuado.
- Puerta de validacion (gating) previa a un modelo principal: con su perfil de VETO elevado (31 % de las llamadas), resulta adecuado como filtro de alta conviccion antes de invocar un modelo mayor, reduciendo coste y latencia.
- Despliegue en hardware consumer: al caber residente en una RTX 5060 Ti de 16 GB con KV en q8_0 y contexto 4096, permite prototipar y servir el modelo en estaciones de trabajo sin GPU de datacenter.
- Evaluacion comparativa de familias de modelos de decision: el autor lo propone explicitamente como referencia de "gated caller" frente a otras familias, util para medir acuerdos y distribuciones de veredictos.
- Automatizacion de triaje en atencion al cliente: clasificacion de conversaciones en categorias operativas (respuesta corta, respuesta larga, rechazo, cierre) para derivar a agentes humanos o automatizados.
- Experimentacion con cuantizacion IQ3_M: sirve como caso de estudio reproducible del impacto de la cuantizacion y de los parches del conversor de llama.cpp sobre el comportamiento de un modelo de 30B.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Llamadas de decision evaluadas | 7.854 |
| Ventana de evaluacion | 14 dias reales |
| Hardware | RTX 5060 Ti, 15.846 MiB |
| Errores | 0 |
| Acuerdo con el seat primario 27B en vivo | 62,0 % |
| Distribucion SHORT | 4.371 |
| Distribucion LONG | 1.024 |
| Distribucion VETO | 2.436 |
| Distribucion CLOSE | 23 |
| Distribucion PASS | 0 |
| Auto-acuerdo (build con temp 1.0) | 92,3 % |
| Acuerdo (build con temp 1.0) | 62,2 % |

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 14,4 GB para los pesos IQ3_M; con cache KV en q8_0 y contexto 4096 cabe en una GPU de 16 GB (medido en RTX 5060 Ti con 15.846 MiB).
- GPU recomendadas: RTX 5060 Ti 16 GB (medida por el autor); cualquier GPU consumer con 16 GB o mas deberia ser suficiente para el mismo perfil de servido.
- Cabe en GPU consumer: si, en tarjetas de 16 GB con el modelo residente en exclusiva.
- Opciones de despliegue: llama.cpp (master `0a731cc` mas parches 0003/0004/0007 para reconversion), imagen Docker de llama.cpp. No se documentan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| knowline-31b-Gen1.5-IQ3_M (este) | ~30,7B | no disponible (medido a 4096) | GGUF IQ3_M | Apache-2.0 | Perfil VETO 31 %, PASS 0 % |
| PelaAI/KnowLine-31B-Gen1.5 (base) | ~30,7B | no disponible | safetensors (F16) | Apache-2.0 | Pesos originales, sin cuantizar |
| Seat primario 27B en vivo | ~27B | no disponible | no disponible | no disponible | Referencia de comparacion del autor; acuerdo del 62,0 % |

No se dispone de datos de otros modelos de decision comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Perfil de veredictos sesgado: VETO en el 31 % de las llamadas y PASS en el 0 %, lo que lo aleja de otros modelos de decision y reduce su acuerdo con el seat primario (62,0 %).
- El autor lo describe explicitamente como "gated caller" de alta conviccion y no como un seat de proposito general; usarlo como modelo principal puede producir rechazos excesivos.
- Riesgo de alucinacion: no evaluado en la informacion disponible.
- Idiomas soportados: no disponibles; no se puede garantizar cobertura multilingue.
- Longitud de contexto: no documentada; la configuracion medida se limita a 4096 tokens.
- La cuantizacion IQ3_M introduce perdida de precision respecto a F16; no se aportan metricas de degradacion frente al modelo base.
- La licencia Apache-2.0 se hereda del modelo base; conviene verificar la model card original de PelaAI/KnowLine-31B-Gen1.5 para atribucion y condiciones.
- Requiere parches especificos del conversor de llama.cpp para reproducir el comportamiento medido; sin el parche 0007 la temperatura de scoring se fija incorrectamente a 1.0.

## Enlaces

- Repositorio GGUF: https://huggingface.co/PsychoLogic/knowline-31b-Gen1.5-IQ3_M-GGUF
- Modelo base: https://huggingface.co/PelaAI/KnowLine-31B-Gen1.5
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- llama.cpp: https://github.com/ggml-org/llama.cpp
