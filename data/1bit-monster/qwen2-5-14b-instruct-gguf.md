# 1bit-MONSTER/Qwen2.5-14B-Instruct-GGUF

## Resumen

Este repositorio no contiene un modelo nuevo, sino una redistribucion del GGUF oficial de Qwen para Qwen2.5-14B-Instruct en cuantizacion Q4_K_M, dividido en tres fragmentos y publicada por el usuario 1bit-MONSTER junto con mediciones de rendimiento de su propio motor de inferencia (1bit engine) sobre hardware Strix Halo con backend Vulkan. El modelo base lo desarrolla el equipo Qwen de Alibaba Cloud: un transformer decoder-only denso de 14.770.033.664 parametros (unos 14,8 mil millones), contexto de 131.072 tokens en el modelo original y licencia Apache 2.0.

La relevancia practica del repositorio es acotada pero concreta: permite ejecutar un modelo de ~14,8 B en unos 9 GB de pesos, lo que lo hace viable en GPUs consumer de 12-16 GB y en APUs con memoria unificada como Strix Halo, y aporta cifras medidas de prefill y generacion (692 tok/s en pp512, 20,3 tok/s en tg128) que sirven como referencia para comparar motores de inferencia sobre ese hardware.

No obstante, conviene tener claro que el repositorio no aporta entrenamiento adicional, benchmarks de calidad ni ficha tecnica propia: todas las capacidades, el contexto y la licencia se heredan del modelo base de Qwen. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria independiente sobre esta copia concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2.5), con Grouped Query Attention, RoPE, SwiGLU y RMSNorm |
| Parametros totales | 14.770.033.664 (~14,8 B) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 131.072 tokens en el modelo base; salida de hasta 8.192 tokens (modelo base) |
| Tipos de cuantizacion | Q4_K_M en este repositorio (3 fragmentos, 9,0 GB); el modelo base publica otras cuantizaciones GGUF |
| Idiomas soportados | 29 idiomas en el modelo base (no declarados explicitamente en este repositorio) |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (safetensors disponible en el modelo base original) |

## Arquitectura y entrenamiento

El repositorio no realiza ningun entrenamiento ni ajuste: es una recuantizacion y rehost del GGUF Q4_K_M publicado por Qwen para Qwen2.5-14B-Instruct, con los pesos divididos en tres ficheros (`qwen2.5-14b-instruct-q4_k_m-00001-of-00003.gguf` y sucesivos). La arquitectura, por tanto, es la del modelo base: un transformer decoder-only denso de 48 capas, dimension oculta de 5120, 40 cabezas de atencion y 8 cabezas KV (atencion de consultas agrupadas, GQA), con un vocabulario de aproximadamente 151.643 tokens. El preentrenamiento del modelo base se realizo sobre 18 billones de tokens segun la documentacion de Qwen.

En cuanto al post-entrenamiento y la composicion exacta del dataset, esta ficha no dispone de esos detalles: el informe tecnico del modelo base es la fuente adecuada para consultarlos, y este repositorio no los reproduce. La unica innovacion tecnica atribuible al autor del rehost es la publicacion de mediciones reproducibles con su motor (1bit engine) sobre Vulkan en Strix Halo, ademas de la invocacion del primer fragmento como punto de entrada para que llama.cpp localice automaticamente el resto.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat propia de Qwen2.5.
- Razonamiento, matematicas y generacion de codigo en varios lenguajes, heredados del modelo Instruct del que procede.
- Soporte de function calling y tool calling a traves de la plantilla de chat del modelo base.
- Salidas estructuradas, en particular JSON, gracias al post-entrenamiento del modelo base.
- Capacidades multilingues en 29 idiomas (con calidad desigual: el rendimiento es mas solido en ingles y chino).
- Manejo de documentos largos y resumen sobre contexto extenso (hasta 131.072 tokens en el modelo base).
- Despliegue local en hardware de gama consumer o APUs, al ocupar los pesos Q4_K_M unos 9 GB.
- No dispone de vision, audio ni modo de razonamiento explicito tipo "thinking"; la variante 14B-Instruct de Qwen2.5 es exclusivamente de texto.

## Casos de uso

- Asistente conversacional autoalojado: el modelo gestiona dialogos multi-turno con memoria larga gracias a una ventana de hasta 128K tokens en el modelo base, y el formato Q4_K_M permite mantenerlo en una unica GPU de 12-16 GB sin depender de APIs externas.
- Analisis de documentacion extensa: contratos, informes o expedientes que superan lo que admite un modelo de 8K de contexto se pueden procesar en una sola pasada o con fragmentacion minima, reduciendo la perdida de informacion entre trozos.
- Generacion y revision de codigo en pipelines de CI/CD: con soporte de tool calling, el modelo puede invocarse desde un agente que consulte el repositorio, ejecute linters o proponga parches, y desplegarse en un runner con GPU de gama media.
- Extraccion de datos estructurados: conversion de facturas, correos o formularios a JSON con un esquema fijo, aprovechando el entrenamiento del modelo base en salidas estructuradas; util como paso previo a un ETL.
- Atencion al cliente multilingue: cobertura de consultas en varios idiomas sin modelos separados por idioma, con coste marginal bajo por token al ejecutarse en hardware propio.
- Agentes multi-paso: encadenamiento de llamadas a herramientas (busqueda, calculo, acceso a bases de datos) en tareas de investigacion o automatizacion de back-office, donde el contexto largo evita perder el hilo entre pasos.
- Despliegue en APUs y mini-PC: sobre Strix Halo con Vulkan se miden 692 tok/s de prefill y 20,3 tok/s de generacion, suficiente para asistentes interactivos en un equipo de escritorio o portatil sin GPU dedicada.
- Evaluacion comparativa de motores de inferencia: las cifras publicadas sirven como linea base reproducible para medir llama.cpp, el motor 1bit u otros backends sobre el mismo hardware y la misma cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible sobre este repositorio. El autor unicamente reporta mediciones de inferencia con el motor 1bit sobre Strix Halo con backend Vulkan:

| Metrica | Valor medido |
|---|---|
| Prefill (pp512) | 692 tok/s |
| Generacion (tg128) | 20,3 tok/s |
| Hardware | Strix Halo (memoria unificada) |
| Backend | Vulkan, motor 1bit |
| Cuantizacion evaluada | Q4_K_M |

Estas cifras describen velocidad, no calidad. Para comparar la calidad del modelo base hay que remitirse a los resultados publicados por Qwen para Qwen2.5-14B-Instruct, que no forman parte de la informacion proporcionada.

## Requisitos de hardware

- Pesos Q4_K_M: 9,0 GB en disco (tamano del repositorio), repartidos en tres fragmentos.
- VRAM orientativa para Q4_K_M: ~10-11 GB con contexto moderado (8K-16K). Cabe en RTX 4090, RTX 3090, RTX 4080/4070 Ti Super (16 GB), RTX 4060 Ti 16 GB, A100 y H100.
- VRAM orientativa para otras cuantizaciones del modelo base: Q5_K_M ~10,5 GB, Q6_K ~12,2 GB, Q8_0 ~15,8 GB, BF16 ~29,5 GB. Q8_0 requiere 16 GB o mas; BF16 requiere A100 40 GB, H100 o dos GPUs de 24 GB.
- Cache KV: con 48 capas y 8 cabezas KV, la cache en FP16 ocupa aproximadamente 192 KiB por token, es decir, unos 24 GiB a 131.072 tokens. En Q8_0 baja a unos 12 GiB. Esto limita en la practica el contexto util en GPUs consumer, aunque los pesos quepan holgadamente.
- GPUs por debajo de 12 GB: no es posible mantener todos los pesos en VRAM; hay que recurrir a offload parcial a CPU con llama.cpp, con la consiguiente caida de velocidad.
- APUs con memoria unificada: Strix Halo es el escenario medido por el autor, con Vulkan y el motor 1bit.
- Opciones de despliegue: llama.cpp (basta apuntar al primer fragmento y localiza el resto), Ollama, LM Studio, Jan, koboldcpp, text-generation-webui y el motor 1bit. El soporte de GGUF en vLLM es parcial y experimental; para produccion a gran escala conviene servir el modelo base en safetensors con vLLM o TGI.
- Throughput medido: 692 tok/s de prefill y 20,3 tok/s de generacion en Strix Halo con Vulkan. No hay mediciones publicadas para GPUs dedicadas en esta informacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Rendimiento comparado |
|---|---|---|---|---|---|
| 1bit-MONSTER/Qwen2.5-14B-Instruct-GGUF (Q4_K_M) | ~14,8 B | 131.072 tokens (modelo base) | GGUF | Apache 2.0 | No disponible |
| Qwen/Qwen2.5-14B-Instruct (BF16) | ~14,8 B | 131.072 tokens | safetensors | Apache 2.0 | No disponible: sin benchmarks comparables en esta informacion |
| Qwen/Qwen2.5-7B-Instruct-GGUF | ~7,6 B | 131.072 tokens | GGUF | Apache 2.0 | No disponible |
| meta-llama/Llama-3.1-8B-Instruct | 8 B | 131.072 tokens | safetensors, GGUF comunitario | Llama 3.1 Community License | No disponible |
| mistralai/Mistral-Nemo-Instruct-2407 | 12 B | 131.072 tokens | safetensors, GGUF comunitario | Apache 2.0 | No disponible |

La diferencia practica relevante no es de rendimiento —no hay datos comparables en la informacion disponible— sino de tamano y licencia: Qwen2.5-14B ofrece mas parametros que las alternativas de 7-12 B manteniendo contexto de 128K, y su licencia Apache 2.0 es mas permisiva que la licencia comunitaria de Llama 3.1.

## Limitaciones y advertencias

- Este repositorio no entrena ni mejora nada: es una copia del GGUF oficial de Qwen. Cualquier limitacion del modelo base se hereda integra, y las mejoras futuras del modelo base no se reflejan aqui.
- La cuantizacion Q4_K_M introduce perdida de precision respecto a BF16, perceptible sobre todo en tareas de razonamiento encadenado, matematicas y generacion de codigo de baja frecuencia.
- Riesgo de alucinacion: inherente al modelo; no es adecuado para decisiones de alto impacto (medicas, legales, financieras) sin verificacion humana.
- Idiomas: el repositorio no declara idiomas soportados. El modelo base cubre 29 idiomas, pero el rendimiento fuera de ingles y chino es desigual, y puede producirse mezcla de idiomas en respuestas largas.
- Contexto efectivo: aunque el modelo base soporte 128K tokens, la cache KV a esa longitud ronda los 24 GiB en FP16, por lo que en GPUs consumer el contexto util queda muy por debajo del maximo teorico.
- Sin vision, sin audio y sin modo de razonamiento explicito; si se necesitan esas capacidades hay que acudir a otras familias o variantes.
- Licencia Apache 2.0: permite uso comercial y redistribucion, pero obliga a conservar los avisos de copyright y atribucion, y a indicar los cambios realizados. El autor del rehost ya atribuye el modelo y la cuantizacion a Qwen.
- Trazabilidad: 0 descargas y 0 likes, sin benchmarks propios ni validacion externa. Para produccion es preferible descargar el GGUF directamente del repositorio oficial de Qwen.
- Metadatos: la fecha de creacion registrada en HuggingFace figura como 2026-09-26, incoherente con el resto de la informacion; conviene no tomarla como referencia.

## Enlaces

- Repositorio analizado: https://huggingface.co/1bit-MONSTER/Qwen2.5-14B-Instruct-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- GGUF oficial de Qwen para este modelo: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct-GGUF
- Motor 1bit citado en la model card: https://github.com/1bit-MONSTER/engine
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Informe tecnico de Qwen2.5: https://arxiv.org/abs/2412.15115
- llama.cpp (backend compatible con GGUF): https://github.com/ggml-org/llama.cpp
- Ollama (catalogo Qwen2.5): https://ollama.com/library/qwen2.5
