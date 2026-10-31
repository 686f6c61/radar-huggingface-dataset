# prithivMLmods/Groot-19B-A3B-261023-NVFP4-GGUF

## Resumen

Groot-19B-A3B-261023 es un modelo de razonamiento multimodal nativo de pesos abiertos, desarrollado por GrootTeam y derivado de Qwen3.6-35B-A3B. Con aproximadamente 19B de parametros totales (mas una capa MTP de 0,4B) y solo ~3B activados por token, aborda el problema de ejecutar modelos de razonamiento agenticos y con uso nativo de herramientas en hardware accesible, sin sacrificar rendimiento frente a modelos mas grandes.

Esta ficha cubre la version cuantizada NVFP4 en formato GGUF publicada por prithivMLmods, que incluye soporte de vision mediante un archivo mmproj y decodificacion especulativa MTP (Multi-Token Prediction) integrada en los propios pesos, eliminando la necesidad de un modelo draft separado. Segun la model card, el modelo supera a Qwen3.6-35B-A3B y Gemma-4-26B-A4B en 12 de 16 benchmarks, con una media de 41,44 frente a 38,08 y 30,05 respectivamente.

Su relevancia actual radica en la combinacion de arquitectura MoE hibrida (atencion completa y lineal), ventana de contexto nativa de 256K tokens extensible a ~1M mediante YaRN, y cuantizacion FP4 optimizada para aceleradores NVIDIA Blackwell, lo que permite ejecutar contexto de 128K en una RTX 4060 Ti de 16 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal hibrido (40 capas: 10 de atencion completa y 30 de atencion lineal), 128 expertos enrutados |
| Parametros totales | 18.985.738.489 (~19B, mas 0,4B de capa MTP) |
| Parametros activos | ~3B por token |
| Longitud de contexto | 262.144 tokens (256K) nativa, extensible a ~1M con YaRN |
| Tipos de cuantizacion | NVFP4 (en este repo); el modelo base esta disponible en BF16, FP8, NVFP4 y GGUF Q4_K_M |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (NVFP4, 13,9 GB) + mmproj para vision (903 MB); el modelo base en safetensors |

## Arquitectura y entrenamiento

Groot-19B-A3B-261023 es un modelo causal Mixture-of-Experts nativamente multimodal con 40 capas hibridas: 10 de atencion completa y 30 de atencion lineal, junto con 128 expertos enrutados de los que se activan ~3B de parametros por token. Esta combinacion de atencion lineal y completa reduce el coste de procesar contextos muy largos manteniendo capacidad de razonamiento. Incluye una capa de Multi-Token Prediction (MTP) de 0,4B que habilita decodificacion especulativa sin modelo draft externo: en los ficheros GGUF MTP, las cabezas adicionales predicen multiples tokens futuros en un solo pase hacia adelante.

El modelo deriva de Qwen3.6-35B-A3B y fue post-entrenado con menos de 0,1 billones (0,1B) de tokens de codigo abierto. Opera por defecto en modo thinking (razonamiento), con modos non-thinking y preserved-thinking configurables. La version NVFP4 de este repositorio esta cuantizada especificamente para los Tensor Cores FP4 de la arquitectura NVIDIA Blackwell (SM120, GB202, B200, B300, RTX Pro 6000, serie RTX 50).

## Capacidades

- Generacion de texto y razonamiento complejo, con modo thinking activado por defecto (configurable a non-thinking o preserved-thinking)
- Comprension de imagen y texto (pipeline image-text-to-text), mediante el archivo mmproj incluido
- Uso nativo de herramientas (tool calling / function calling)
- Capacidades agenticas y coding agentic, orientado a tareas multi-paso
- Ventana de contexto nativa de 256K tokens, extensible a ~1M con YaRN
- Decodificacion especulativa MTP integrada en los pesos GGUF, con aceleracion significativa de inferencia local
- Eficiencia de tokens: consume un 23,1% menos de tokens de salida que Qwen3.6-35B-A3B y un 65,6% menos que Gemma-4-26B-A4B, segun la model card

## Casos de uso

- Razonamiento local en hardware de consumo: con ~3B de parametros activos y cuantizacion FP4, ejecuta contexto de 128K en una RTX 4060 Ti de 16 GB y el contexto completo de 256K en GPUs de 24 GB (RTX 3090/4090) o RTX 5090, lo que lo hace adecuado para estaciones de trabajo personales sin necesidad de servidores.
- Coding agentic y asistentes de programacion: su diseno para agentic coding y tool calling permite integrarlo en pipelines de generacion y revision de codigo, con la prueba de rendimiento publicada incluyendo tareas como insercion de nodos en listas enlazadas en C.
- Analisis de documentos largos: la ventana de 256K tokens (extensible a ~1M) permite procesar contratos, informes tecnicos o bases de codigo completas en una sola pasada.
- Comprension multimodal de imagenes: el archivo mmproj habilita tareas de vision-lenguaje, como descripcion de imagenes, extraccion de datos de capturas o analisis de diagramas, directamente con llama-cli.
- Generacion de texto rapida para chatbots: los 278 tokens/s medidos en RTX Pro 6000 con MTP permiten respuestas conversacionales con latencia baja incluso con salidas largas.
- Despliegue en aceleradores Blackwell de datacenter: la cuantizacion NVFP4 aprovecha los Tensor Cores FP4 nativos de B200/B300 y RTX Pro 6000, maximizando throughput por vatio en servidores de inferencia.
- Procesamiento por lotes eficiente: el consumo reducido de tokens de salida (23,1% menos que Qwen3.6-35B-A3B) reduce coste y tiempo en tareas de resumen o transformacion masiva de texto.

## Benchmarks y rendimiento

Segun la model card, el modelo supera a Qwen3.6-35B-A3B y Gemma-4-26B-A4B en 12 de 16 benchmarks, con las siguientes medias (no se publican los resultados individuales por benchmark):

| Modelo | Media en 16 benchmarks | Parametros | Parametros activos |
|---|---:|---|---|
| Groot-19B-A3B-261023 | 41,44 | ~19B | ~3B |
| Qwen3.6-35B-A3B | 38,08 | 35B | ~3B |
| Gemma-4-26B-A4B | 30,05 | 26B | ~4B |

Rendimiento de inferencia medido con el GGUF NVFP4 en una NVIDIA RTX Pro 6000 Blackwell Server Edition (96 GB), con llama-cli, offload completo y decodificacion especulativa MTP (draft_n_max=2), contexto de 16.384 tokens y KV cache q8_0:

| Metrica | Resultado |
|---|---:|
| Velocidad media de procesamiento de prompt | 161,82 tokens/s |
| Velocidad media de generacion | 278,05 tokens/s (min 265,62; max 286,67) |
| Pico de VRAM usada | 13.857 MiB (13,53 GiB) |
| Capas offloaded a GPU | 99 |
| Tiempo medio por ejecucion | 9,24 s |

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero NVFP4 ocupa 13,9 GB (13,53 GiB de pico medidos con contexto de 16K); para contexto de 128K basta una GPU de 16 GB y para el contexto completo de 256K se recomiendan 24 GB.
- GPUs recomendadas: RTX Pro 6000, serie RTX 50 (RTX 5090), B200 y B300 para aprovechar la aceleracion FP4 nativa de Blackwell; tambien funciona en RTX 3090/4090 (24 GB) y RTX 4060 Ti (16 GB, con 128K de contexto).
- Consumer GPUs: si cabe; RTX 4060 Ti de 16 GB para 128K de contexto y RTX 3090/4090/5090 de 24 GB para 256K. En GPUs sin Tensor Cores FP4 (previas a Blackwell) la cuantizacion NVFP4 no obtendra la aceleracion nativa de hardware.
- Sistemas con 128 GB de memoria unificada como alternativa para el contexto completo.
- Opciones de despliegue: llama.cpp / llama-cli (con soporte MTP draft-mtp), vLLM, SGLang, KTransformers y Hugging Face Transformers (para los pesos del modelo base).
- Latencia y throughput: ~278 tokens/s de generacion y ~162 tokens/s de procesamiento de prompt en RTX Pro 6000 con MTP activado; sin datos de rendimiento en otras GPUs.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Groot-19B-A3B-261023 | ~19B (+0,4B MTP) | ~3B | 256K (extensible a ~1M) | Apache-2.0 | BF16, FP8, NVFP4, GGUF; vLLM, SGLang, KTransformers, llama.cpp |
| Qwen3.6-35B-A3B | 35B | ~3B | no disponible | no disponible | no disponible |
| Gemma-4-26B-A4B | 26B | ~4B | no disponible | no disponible | no disponible |

Groot-19B-A3B usa un 45,7% menos de parametros que Qwen3.6-35B-A3B y un 26,9% menos que Gemma-4-26B-A4B, pero segun la model card los supera en 12 de 16 benchmarks, ademas de consumir menos tokens de salida (23,1% y 65,6% menos, respectivamente).

## Limitaciones y advertencias

- Idioma: la model card declara solo ingles (en); no hay soporte declarado de castellano ni de otros idiomas, por lo que el rendimiento en espanol no esta garantizado.
- Cuantizacion agresiva: NVFP4 es una cuantizacion de 4 bits que puede degradar la calidad respecto a los pesos BF16/FP8 del modelo base, especialmente en tareas de razonamiento fino; ademas, la aceleracion FP4 nativa requiere hardware Blackwell.
- Hardware: en GPUs previas a la arquitectura Blackwell, los beneficios de la cuantizacion NVFP4 se reducen; para aprovechar MTP se requiere una version de llama.cpp con soporte draft-mtp.
- Alucinaciones: al ser un modelo de lenguaje generativo, puede generar informacion incorrecta con apariencia plausible; no se publican evaluaciones especificas de alucinacion.
- Sesgos: hereda los sesgos de los datos de post-entrenamiento (menos de 0,1B de tokens de codigo abierto) y del modelo base Qwen3.6-35B-A3B; no se documentan auditorias de sesgo.
- Licencia: Apache-2.0 permite uso comercial, pero conviene revisar los terminos del modelo base y de Qwen3.6-35B-A3B del que deriva.
- Los datos de rendimiento publicados corresponden a una configuracion concreta (RTX Pro 6000, contexto 16K, seed 42); el throughput real variara segun prompt, longitud de salida y configuracion.

## Enlaces

- Repositorio del modelo (esta ficha): https://huggingface.co/prithivMLmods/Groot-19B-A3B-261023-NVFP4-GGUF
- Modelo base: GrootTeam/Groot-19B-A3B-261023 (no se dispone de URL directa en la informacion proporcionada)
- Version GGUF con MTP: https://huggingface.co/prithivMLmods/Groot-19B-A3B-261023-MTP-GGUF
- Coleccion Groot Models (System-Two): https://huggingface.co/collections/prithivMLmods/groot-models-system-two
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/groot-19b-a3b-261023-grootteam
- Perfil de benchmarks en BenchmarkList: https://benchmarklist.com/providers/prithivmlmods/
- llama.cpp: https://github.com/ggml-org/llama.cpp
