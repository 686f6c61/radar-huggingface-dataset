# ShoopyShoops/Parable-Granite-4.1-8B-Claude-Fable-5-Heretic-GGUF

## Resumen

Parable-Granite-4.1-8B-Claude-Fable-5-Heretic-GGUF es una cuantización en formato GGUF de un modelo derivado de la familia IBM Granite 4.1, de 8.380.551.168 par\u00e1metros totales. El autor, ShoopyShoops, parte del modelo AnkitAI/Parable-Granite-4.1-8B-Claude-Fable-5 y le aplica dos transformaciones principales: una abliteraci\u00f3n de la direcci\u00f3n de rechazo de seguridad mediante la t\u00e9cnica Heretic ARA (Arbitrary-Rank Ablation) y una cuantizaci\u00f3n con calibraci\u00f3n de matriz de importancia en llama.cpp, generando 26 variantes GGUF distintas.

El objetivo declarado es eliminar los mecanismos de rechazo del modelo base preservando sus capacidades de razonamiento, planificaci\u00f3n de agentes y generaci\u00f3n de c\u00f3digo. Seg\u00fan la model card, la abliteraci\u00f3n reduce la tasa de rechazo del 100% al 4,0% con una divergencia KL de evaluaci\u00f3n limitada a 0,0050 nats, interviniendo \u00fanicamente en las capas 10 a 38 y dejando intactas las capas 0 a 9.

La relevancia de esta ficha es doble: por un lado, documenta un caso concreto de modificaci\u00f3n de seguridad en un modelo open source con licencia Apache 2.0; por otro, ofrece una tabla de cuantizaciones con m\u00e9tricas de perplejidad y divergencia KL que permite elegir el nivel de compresi\u00f3n adecuado seg\u00fan el hardware disponible. El modelo est\u00e1 etiquetado para generaci\u00f3n de texto en ingl\u00e9s y admite endpoints compatibles.

## Especificaciones t\u00e9cnicas

| Par\u00e1metro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de IBM Granite 4.1, seg\u00fan tags del repo); detalles internos no disponibles |
| Par\u00e1metros totales | 8.380.551.168 |
| Par\u00e1metros activos | No aplica (no es MoE seg\u00fan la informaci\u00f3n disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizaci\u00f3n | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_NL, IQ4_XS, Q4_1, Q4_0, Q3_K_L, Q3_K_M, IQ3_M, IQ3_S, IQ3_XS, Q3_K_S, IQ3_XXS, Q2_K, IQ2_M, Q2_K_S, IQ2_S, IQ1_S (y variantes adicionales hasta 26 en total) |
| Idiomas soportados | Ingl\u00e9s (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (26 variantes); el modelo base se distribuye en BF16 safetensors |

## Arquitectura y entrenamiento

La informaci\u00f3n disponible no detalla la arquitectura interna del modelo base m\u00e1s all\u00e1 de su pertenencia a la familia Granite 4.1 y su naturaleza de transformer de 8B par\u00e1metros. No se especifican n\u00famero de capas, dimensi\u00f3n de atenci\u00f3n, composici\u00f3n del dataset de preentrenamiento ni si hubo fases de RLHF o DPO. El modelo base AnkitAI/Parable-Granite-4.1-8B-Claude-Fable-5 incorpora un adaptador LoRA que el autor de esta ficha fusion\u00f3 en pesos BF16 completos (55 pares de tensores LoRA en 4 shards) antes de cuantizar.

La innovaci\u00f3n t\u00e9cnica documentada es la abliteraci\u00f3n con Heretic ARA: se aplic\u00f3 Arbitrary-Rank Ablation sobre las capas 10 a 38 usando 400 pares de prompts contrastivos (mlabonne/harmful_behaviors frente a mlabonne/harmless_alpaca), con preservaci\u00f3n de magnitudes de fila y rango 50. Se seleccion\u00f3 el ensayo 76 de un frente de Pareto, que reduce la tasa de rechazo del 100% al 4,0% manteniendo la divergencia KL de evaluaci\u00f3n en 0,0050 nats. Las capas 0 a 9 quedaron sin modificar (KL 0,000000) y la capa final 39 converge a 0,011276 nats. La cuantizaci\u00f3n se realiz\u00f3 con llama.cpp usando una matriz de importancia (imatrix_granite.dat, PPL 7,5145 ± 0,1179) calibrada sobre 100 fragmentos de WikiText-2.

## Capacidades

- Generaci\u00f3n de texto conversacional en ingl\u00e9s.
- Razonamiento y modo thinking (etiquetas reasoning y thinking en el repo).
- Generaci\u00f3n de c\u00f3digo (tag coding).
- Planificaci\u00f3n de agentes y flujos multi-paso (tag agentic).
- Soporte de tool calling / function calling: no confirmado expl\u00edcitamente en la informaci\u00f3n disponible.
- Capacidades multiling\u00fces: limitadas al ingl\u00e9s seg\u00fan la etiqueta de idioma.
- Comportamiento sin rechazo (uncensored/abliterated): la tasa de rechazo medida baja al 4,0%.
- Compatibilidad con endpoints (tag endpoints_compatible).
- Capacidades de visi\u00f3n o audio: no disponibles.

## Casos de uso

- Investigaci\u00f3n sobre alineaci\u00f3n y seguridad: el modelo sirve como caso de estudio reproducible de abliteraci\u00f3n con m\u00e9tricas p\u00fablicas (KL por capa, tasa de rechazo), \u00fatil para analizar qu\u00e9 se pierde y qu\u00e9 se conserva al eliminar la direcci\u00f3n de rechazo.
- Evaluaci\u00f3n comparativa de cuantizaciones: la tabla de 26 variantes con perplejidad y KL permite medir el impacto real de cada nivel de compresi\u00f3n en tareas propias antes de desplegar.
- Despliegue local en hardware de consumo: la variante Q4_K_M (4,77 GB) cabe en GPUs de 8 GB de VRAM y permite ejecutar un modelo de 8B con llama.cpp u Ollama en equipos de gama media.
- Generaci\u00f3n de c\u00f3digo en pipelines internos: con la variante Q5_K_M (5,56 GB) y el tag coding, puede integrarse en entornos de desarrollo controlados donde no se requieran filtros de contenido.
- Prototipado de agentes: el tag agentic y el modo thinking permiten experimentar con planificaci\u00f3n multi-paso en entornos de laboratorio, aceptando la p\u00e9rdida de garant\u00edas de seguridad.
- Archivo near-lossless: la variante Q8_0 (8,30 GB, ΔPPL -0,0053) es adecuada para conservar el comportamiento del modelo original con m\u00ednima degradaci\u00f3n cuando se dispone de VRAM suficiente.
- Evaluaci\u00f3n de robustez frente a prompts adversarios: al tener una tasa de rechazo del 4,0%, permite estudiar el comportamiento del modelo en escenarios de red teaming controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks est\u00e1ndar (MMLU, HumanEval, GSM8K) en la informaci\u00f3n disponible. S\u00ed se publican m\u00e9tricas de cuantizaci\u00f3n sobre WikiText-2 Test (20 fragmentos × 512 tokens) con llama-perplexity:

| Cuantizaci\u00f3n | Tama\u00f1o (GB) | Perplejidad | ΔPPL vs. F16 | KL media | Recomendaci\u00f3n del autor |
|:---|---:|---:|---:|---:|:---|
| F16 | 15,61 | 8,1479 | 0,0000 | 0,000000 | Referencia de precisi\u00f3n completa |
| Q8_0 | 8,30 | 8,1426 | -0,0053 | 0,001776 | Archivo near-lossless |
| Q6_K | 6,41 | 8,1772 | +0,0293 | 0,004283 | Alta precisi\u00f3n / VRAM grande |
| Q5_K_M | 5,56 | 8,1701 | +0,0222 | 0,008735 | Uso general recomendado |
| Q5_K_S | 5,42 | 8,1554 | +0,0075 | 0,009946 | 5 bits compacto |
| Q4_K_M | 4,77 | 8,3361 | +0,1882 | 0,027061 | Equilibrado (8 GB VRAM) |
| Q4_K_S | 4,53 | 8,3821 | +0,2342 | 0,033340 | 4 bits r\u00e1pido |
| IQ4_NL | 4,51 | 8,3765 | +0,2286 | 0,033550 | 4 bits no lineal \u00f3ptimo |
| IQ4_XS | 4,29 | 8,3876 | +0,2397 | 0,034149 | 4 bits slim |
| Q4_1 | 4,96 | 8,5607 | +0,4128 | 0,068936 | 4 bits legacy |
| Q4_0 | 4,49 | 8,5406 | +0,3927 | 0,073754 | Compatibilidad amplia |
| Q3_K_L | 4,21 | 8,4893 | +0,3414 | 0,082666 | 3 bits grande |
| Q3_K_M | 3,88 | 8,6148 | +0,4669 | 0,094407 | 3 bits medio |
| IQ3_M | 3,64 | 8,8830 | +0,7351 | 0,122037 | 3 bits no lineal de calidad |
| IQ3_S | 3,53 | 8,8530 | +0,7051 | 0,123164 | 3 bits slim |
| IQ3_XS | 3,35 | 8,9861 | +0,8382 | 0,149881 | 3 bits ultracompacto |
| Q3_K_S | 3,51 | 8,9478 | +0,7999 | 0,159048 | 3 bits r\u00e1pido |
| IQ3_XXS | 3,12 | 9,2745 | +1,1266 | 0,190470 | 3 bits m\u00ednimo |
| Q2_K | 3,05 | 9,9069 | +1,7590 | 0,263539 | 2 bits est\u00e1ndar |
| IQ2_M | 2,78 | 10,5441 | +2,3962 | 0,334756 | 2 bits de alta calidad |
| Q2_K_S | 2,85 | 10,7306 | +2,5827 | 0,360587 | 2 bits peque\u00f1o |
| IQ2_S | 2,58 | 11,9439 | +3,7960 | 0,462471 | 2 bits slim |

Los datos de la tabla est\u00e1n truncados en la model card original tras IQ2_S; las variantes restantes hasta 26 no se detallan en la informaci\u00f3n proporcionada. La divergencia KL por capas (logit-lens) frente al modelo sin abliterar se sit\u00faa en 0,000000 para las capas 0-9, entre 0,0027 y 0,0401 nats para las capas 10-38 (m\u00e1ximo en la capa 37) y 0,011276 nats en la capa final 39.

## Requisitos de hardware

- VRAM estimada para inferencia: desde ~2,6 GB (IQ2_S) hasta ~15,6 GB (F16), seg\u00fan la tabla de cuantizaciones.
- GPU recomendadas: para F16 y Q8_0, GPUs de 16-24 GB (RTX 4090, A100 40 GB, H100); para Q5_K_M y Q6_K, GPUs de 8-12 GB (RTX 4070, RTX 3080); para Q4_K_M e inferiores, GPUs de 6-8 GB (RTX 3060, RTX 4060).
- Cabe en GPU de consumo: s\u00ed, desde Q4_K_M (4,77 GB) en una RTX 3060 de 8 GB; las variantes de 3 y 2 bits caben en GPUs de 4-6 GB.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, y cualquier runtime compatible con GGUF (LM Studio, text-generation-webui); el tag endpoints_compatible sugiere compatibilidad con endpoints tipo API.
- Latencia y throughput: no disponibles en la informaci\u00f3n proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo en benchmarks est\u00e1ndar, por lo que la comparaci\u00f3n se limita a par\u00e1metros y licencia. Se comparan alternativas de tama\u00f1o similar disponibles p\u00fablicamente:

| Modelo | Par\u00e1metros | Contexto | Licencia | Notas |
|---|---:|---|---|---|
| Parable-Granite-4.1-8B-Claude-Fable-5-Heretic (este) | 8,38B | No disponible | Apache 2.0 | Abliterado, 26 cuantizaciones GGUF, solo ingl\u00e9s |
| IBM Granite 4.1 8B (base original) | ~8B | No disponible | Apache 2.0 | Modelo sin modificar; filtros de seguridad intactos |
| Llama 3.1 8B Instruct | 8,03B | 128K | Llama 3.1 Community | Multiling\u00fce, amplio ecosistema de cuantizaciones |
| Qwen2.5 7B Instruct | 7,62B | 128K | Apache 2.0 | Multiling\u00fce, buen rendimiento en c\u00f3digo y matem\u00e1ticas |

Los datos de contexto de Granite 4.1 8B no se detallan en la informaci\u00f3n proporcionada y se marcan como no disponibles. No se dispone de comparaciones de rendimiento verificables entre estos modelos en la informaci\u00f3n disponible.

## Limitaciones y advertencias

- El modelo ha sido abliterado deliberadamente: elimina la mayor parte de los mecanismos de rechazo (tasa de rechazo del 4,0%), lo que implica que puede generar contenido da\u00f1ino, ofensivo o inseguro sin filtros.
- Riesgo de alucinaci\u00f3n: no se han publicado evaluaciones de veracidad; al ser un modelo de 8B, el riesgo es comparable al de otros modelos de su tama\u00f1o, sin datos espec\u00edficos.
- Idiomas: solo se declara ingl\u00e9s; el rendimiento en castellano no est\u00e1 evaluado.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garant\u00edas sobre el comportamiento del modelo modificado; el usuario asume la responsabilidad legal del contenido generado.
- La abliteraci\u00f3n puede degradar capacidades no medidas: aunque el autor reporta KL bajo, no hay benchmarks de razonamiento, c\u00f3digo o matem\u00e1ticas que confirmen la preservaci\u00f3n funcional.
- Las cuantizaciones de 3 y 2 bits muestran incrementos de perplejidad notables (hasta +3,8 en IQ2_S), con degradaci\u00f3n esperable en tareas complejas.
- El repo ocupa 122,3 GB por incluir las 26 variantes; la descarga selectiva de un solo archivo es imprescindible.
- No apto para producci\u00f3n en entornos donde se exijan garant\u00edas de seguridad o cumplimiento normativo sin una capa adicional de filtrado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ShoopyShoops/Parable-Granite-4.1-8B-Claude-Fable-5-Heretic-GGUF
- Modelo base: https://huggingface.co/AnkitAI/Parable-Granite-4.1-8B-Claude-Fable-5
- Heretic (herramienta de abliteraci\u00f3n): https://github.com/p-e-w/heretic
- Dataset de calibraci\u00f3n de prompts da\u00f1inos: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Dataset de calibraci\u00f3n de prompts inocuos: https://huggingface.co/datasets/mlabonne/harmless_alpaca
- llama.cpp: https://github.com/ggml-org/llama.cpp
