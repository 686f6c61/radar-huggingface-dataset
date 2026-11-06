# eaddario/IQ2_NL-IQ3_NL-Test-Models

## Resumen

`eaddario/IQ2_NL-IQ3_NL-Test-Models` es un repositorio experimental de cuantizaciones GGUF construido sobre `nvidia/NVIDIA-Nemotron-Nano-9B-v2`, un modelo hibrido Mamba-2/attention de 8.888 millones de parametros. Lo desarrolla el usuario independiente EAddario y no constituye un modelo nuevo, sino una prueba de dos tipos de cuantizacion no lineales (IQ2_NL e IQ3_NL) implementados en un fork de `llama.cpp`. El problema que aborda es concreto: la arquitectura `nemotron_h` tiene dimensiones de tensor (4480 y 15680) divisibles por 32 pero no por 256, lo que provoca que las recetas K-quant e I-quant estandar de `llama.cpp` caigan en fallback masivo y no puedan bajar de ~4.5 bits por peso.

La relevancia es practica para quien quiera desplegar Nemotron Nano 9B en hardware limitado: sin estos tipos, un `Q2_K` nominal entrega en realidad 4.50 bpw, y un `IQ1_M` entrega 4.36 bpw. Con el fork, `IQ2_NL` alcanza 2.8046 bpw y `IQ3_NL` 3.6722 bpw, reduciendo los fallbacks de 90/341 tensores a 1/341. Es, por tanto, material de investigacion sobre cuantizacion, no un checkpoint listo para produccion con herramientas estandar.

El repositorio ocupa 125.5 GB e incluye multiples variantes de cuantizacion del modelo base. La licencia declarada es MIT, heredada del modelo original, y el unico idioma declarado es ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Mamba-2 / attention (`nemotron_h`), transformer con capas SSM |
| Parametros totales | 8.888.227.328 (8,89 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | IQ2_NL (2.50 bpw nominal, 2.8046 bpw efectivos), IQ3_NL (3.50 bpw nominal, 3.6722 bpw efectivos); tambien Q2_K, Q3_K, IQ1_M como referencia comparativa |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF |
| Modelo base | nvidia/NVIDIA-Nemotron-Nano-9B-v2 |
| Dataset de calibracion | eaddario/imatrix-calibration |
| Tamano del repositorio | 125.5 GB |
| Descargas | 744 |
| Compatibilidad | requiere fork de llama.cpp (PR #27322); no funciona con `llama.cpp` estandar |

## Arquitectura y entrenamiento

El modelo subyacente usa la arquitectura `nemotron_h`, que combina capas Mamba-2 (state space model) con capas de attention tradicional. Esta mezcla produce geometrias de tensor poco amigables para la cuantizacion por superbloques: `token_embd`, `output`, `attn_q/k/v`, `ffn_up` y `ssm_in` tienen 4480 columnas (140 bloques de 32, 17.5 bloques de 256), y `ffn_down` tiene 15680 (490 bloques de 32, 61.25 de 256). Solo `attn_output` (5120) y `ssm_out` (10240) son multiplos de 256.

El trabajo de este repositorio no entrena el modelo, sino que anade dos tipos de cuantizacion de bloque de 32 elementos en un fork de `llama.cpp`, siguiendo el layout de `IQ4_NL`. IQ2_NL usa 10 bytes por 32 pesos (8 de payload + 2 de escala, 2.50 bpw) e IQ3_NL usa 14 bytes (12 + 2, 3.50 bpw). Al operar sobre bloques de 32, las dimensiones de `nemotron_h` dejan de ser un obstaculo: los fallbacks bajan de 90/341 tensores a 1/341 (el unico restante es `output.weight`, solicitado como Q5_K y cuantizado a Q5_1 a 6.00 bpw). La calibracion de importancia (imatrix) se realizo con el dataset `eaddario/imatrix-calibration`. No se dispone de informacion sobre el entrenamiento original de Nemotron Nano 9B v2 (tokens, composicion del dataset, RLHF/DPO) en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es `text-generation` y el modelo incluye la etiqueta `conversational`.
- Razonamiento y codigo: capacidades heredadas del modelo base Nemotron Nano 9B v2; no se detallan en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas a ingles segun la etiqueta `language: en`.
- Capacidades especiales (thinking mode, vision, audio): no disponible en la informacion proporcionada.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere despliegue via Inference Endpoints, aunque requiere el fork para la inferencia local con llama.cpp.

## Casos de uso

- Investigacion en cuantizacion de bajo bit: el repositorio sirve como banco de pruebas reproducible para evaluar IQ2_NL e IQ3_NL frente a Q2_K/Q3_K en arquitecturas con dimensiones no multiplas de 256. Se usaria comparando perplejidad y calidad de generacion entre las variantes publicadas.
- Despliegue de Nemotron Nano 9B en GPUs de consumo: con IQ2_NL a 2.8046 bpw, el modelo ocupa aproximadamente 3.1 GB de pesos, lo que permite ejecutarlo en GPUs con 6-8 GB de VRAM junto con la cache KV, algo inviable con el fallback a 4.50 bpw (~5 GB solo en pesos).
- Validacion de arquitecturas hibridas SSM/attention: util para equipos que evaluan modelos Mamba-2 y necesitan saber si sus geometrias de tensor son compatibles con los esquemas de cuantizacion existentes antes de comprometerse con un pipeline.
- Prototipado de asistentes conversacionales en ingles con recursos limitados: el modelo base es conversacional y el formato GGUF permite integrarlo en aplicaciones de escritorio o edge con llama.cpp (usando el fork).
- Benchmarking de imatrix: el dataset de calibracion publicado permite reproducir el proceso y medir el impacto de la calibracion de importancia en tipos de bloque de 32 elementos.
- Base para contribuciones upstream: el PR #27322 de llama.cpp documenta la propuesta de integrar IQ2_NL e IQ3_NL; el repositorio sirve como evidencia empirica para dicha integracion.
- Analisis de trade-offs bits/calidad: las variantes IQ2_NL e IQ3_NL permiten medir la degradacion entre 2.80 y 3.67 bpw en un mismo modelo, informando decisiones de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, perplejidad) en la informacion disponible. Los unicos datos numericos publicados son metricas de cuantizacion:

| Build | Tipo solicitado | Fallbacks | BPW resultante |
|---|---|---|---|
| Estandar | Q2_K | 90 / 341 | 4.5000 |
| Estandar | Q3_K | 90 / 341 | 4.8400 |
| Fork | IQ2_NL | 1 / 341 | 2.8046 |
| Fork | IQ3_NL | 1 / 341 | 3.6722 |
| Estandar | IQ1_M | no disponible | 4.3600 |

| Tipo | Bloque | Bits/peso | Bytes por 32 pesos | Payload + escala |
|---|---|---|---|---|
| IQ2_NL | 32 | 2.50 | 10 | 8 + 2 |
| IQ3_NL | 32 | 3.50 | 14 | 12 + 2 |
| IQ4_NL | 32 | 4.50 | 18 | 16 + 2 |

## Requisitos de hardware

- VRAM estimada para inferencia: IQ2_NL ~3.1 GB de pesos (2.8046 bpw x 8.89 B parametros); IQ3_NL ~4.1 GB de pesos (3.6722 bpw). A esto hay que sumar la cache KV y overhead del runtime, no cuantificados en la informacion disponible.
- GPU recomendadas: no especificadas por el autor. Por tamano, cualquier GPU con 8 GB o mas deberia alojar IQ2_NL; 12 GB o mas para IQ3_NL con contexto amplio.
- Cabe en GPU de consumo: si, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores, aunque no hay validacion publicada en la informacion disponible.
- Opciones de despliegue: exclusivamente el fork `EAddario/llama.cpp` (rama `iq2_nl-iq3_nl-cpu`) o una build con el PR #27322 aplicado. No compatible con `llama.cpp` estandar, Ollama, vLLM ni TGI en su forma actual.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion baja | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| eaddario/IQ2_NL-IQ3_NL-Test-Models (sobre Nemotron Nano 9B v2) | 8,89 B | no disponible | IQ2_NL 2.80 bpw / IQ3_NL 3.67 bpw | MIT | requiere fork de llama.cpp |
| nvidia/NVIDIA-Nemotron-Nano-9B-v2 (original) | 8,89 B | no disponible | Q2_K efectivo 4.50 bpw | MIT (segun este repo) | llama.cpp estandar |
| Otras cuantizaciones GGUF de Nemotron Nano 9B v2 en el Hub | 8,89 B | no disponible | limitadas por el suelo de 4.50 bpw | MIT | llama.cpp estandar |

No se dispone de datos de benchmarks que permitan comparar calidad frente a alternativas de distinto tamano; la comparativa se limita al eje de cuantizacion.

## Limitaciones y advertencias

- Requiere un fork no oficial de `llama.cpp`; el modelo no carga con la herramienta estandar ni con la mayoria de runtimes derivados (Ollama, LM Studio, vLLM).
- Es material experimental: el autor lo etiqueta explicitamente como `experimental` y `quantization`, no como un checkpoint de produccion.
- El suelo de 4.50 bpw de `llama.cpp` estandar implica que las variantes publicadas con recetas K-quant en este mismo repo pueden no corresponder al bit-rate nominal solicitado.
- Solo idioma ingles declarado; el rendimiento en castellano no esta evaluado.
- No hay benchmarks de calidad publicados: se desconoce la degradacion real de IQ2_NL e IQ3_NL frente al modelo en fp16 o a cuantizaciones de 4-5 bits.
- Riesgo de alucinacion inherente al modelo base; no cuantificado en la informacion disponible.
- Sesgos del modelo base no documentados en la informacion proporcionada.
- La licencia MIT se declara en el repo, pero conviene verificar los terminos del modelo base `nvidia/NVIDIA-Nemotron-Nano-9B-v2` antes de uso comercial.
- El repositorio ocupa 125.5 GB, lo que puede ser un coste de almacenamiento relevante si solo se necesita una variante.
- El unico fallback restante (`output.weight` a Q5_1) introduce una desviacion menor respecto a la receta solicitada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/eaddario/IQ2_NL-IQ3_NL-Test-Models
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-Nano-9B-v2
- Dataset de calibracion: https://huggingface.co/datasets/eaddario/imatrix-calibration
- Fork de llama.cpp: https://github.com/EAddario/llama.cpp/tree/iq2_nl-iq3_nl-cpu
- PR con los tipos IQ2_NL e IQ3_NL: https://github.com/ggml-org/llama.cpp/pull/27322
- Repositorio upstream de llama.cpp: https://github.com/ggml-org/llama.cpp
