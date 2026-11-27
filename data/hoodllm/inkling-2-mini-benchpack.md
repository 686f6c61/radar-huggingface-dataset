# hoodllm/Inkling-2-Mini-BenchPack

## Resumen

Inkling-2-Mini-BenchPack es un paquete de benchmarks publicado por el usuario hoodllm en Hugging Face que contiene conversiones a GGUF del modelo thinkingmachines/Inkling-2-Mini, desarrollado por Thinking Machines Lab bajo licencia Apache 2.0. No se trata de un modelo nuevo, sino de una coleccion de cuantizaciones (Q3_K_M, Q4_K_M, Q5_K_S, Q6_K y MXFP4_MOE) generadas con llama.cpp y evaluadas de forma sistematica en tres arquitecturas de hardware distintas: AMD Strix Halo, Apple M1 Max y NVIDIA RTX 5060 Ti.

El interes del repositorio reside en su tabla de mediciones reproducibles: perplexity sobre un corpus identico de 400 KB y velocidad de prompt-processing y generacion medidas con `llama-bench` bajo un protocolo comun. Esto permite decidir que cuantizacion ejecutar en cada maquina con datos empiricos en lugar de estimaciones. El modelo base tiene 26.070.385.152 parametros totales (segun los safetensors del repo) y una arquitectura de tipo mixture-of-experts (MoE), tal y como indican las etiquetas y el nombre de la cuantizacion MXFP4_MOE.

La relevancia actual es practica: el pack documenta como el backend afecta a la calidad de las cuantizaciones de bajo bit (especialmente MXFP4 en Blackwell) y como el cuello de botella de memoria determina la velocidad de generacion en Apple Silicon frente a Strix Halo. El repositorio ocupa 88,8 GB e incluye tambien el proyector de vision en F16, lo que confirma capacidad multimodal de entrada imagen-texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE), segun etiquetas del repo y nombre de cuantizacion MXFP4_MOE; detalles internos del transformer no disponibles |
| Parametros totales | 26.070.385.152 (26,07 mil millones, dato de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q3_K_M, Q4_K_M, Q5_K_S, Q6_K, MXFP4_MOE (GGUF); proyector de vision en F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); checkpoint original con expertos NVFP4 y cola MXFP8 |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini emplea una arquitectura de mezcla de expertos (MoE), como indica la nomenclatura de la cuantizacion MXFP4_MOE y la etiqueta `moe` del repositorio. El checkpoint original distribuido por Thinking Machines Lab utiliza expertos en formato NVFP4 y una cola de capas en MXFP8, que el script `convert_hf_to_gguf.py` de llama.cpp (version ≥ #32694, soporte `inkling2_loop`) dequantiza a BF16 antes de aplicar `llama-quantize`. El pack incluye ademas un proyector de vision (`Inkling-2-Mini-mmproj-F16.gguf`) que habilita la entrada de imagenes, coherente con el pipeline `image-text-to-text`.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste por preferencias. Tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal. La cuantizacion se realizo sin calibracion con imatrix, es decir, con el pipeline estandar de llama.cpp, lo que garantiza que los resultados sean reproducibles por terceros con la misma version de la herramienta.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta `conversational` del repositorio.
- Procesamiento de entrada imagen-texto (pipeline `image-text-to-text`), gracias al proyector de vision en F16 incluido en el pack.
- Razonamiento y generacion de codigo: no documentado explicitamente en la informacion disponible, aunque es esperable en un modelo de este tamano; no se confirma.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el autor menciona el uso en "agentic/long-context work" como escenario donde prima el prompt-processing, pero sin detallar capacidades de agente.
- Capacidades multilingues: no disponible (el campo de idiomas no esta informado).
- Modo thinking explicito: no disponible.

## Casos de uso

- Seleccion de cuantizacion en produccion: el pack permite elegir el fichero GGUF adecuado para cada GPU comparando perplexity y throughput reales; por ejemplo, en una RTX 5060 Ti de 16 GB solo caben Q3_K_M y MXFP4_MOE, y el autor recomienda MXFP4_MOE por velocidad o Q3_K_M si prima la calidad.
- Despliegue local en Apple Silicon: en un M1 Max de 64 GB la velocidad de generacion es practicamente plana (21-23 t/s) entre cuantizaciones, por lo que tiene sentido usar Q6_K (mejor perplexity, 7,9097) sin penalizacion de velocidad.
- Servicio de inferencia multimodal en servidor: con `llama-server` y el proyector mmproj F16 se puede levantar un endpoint compatible con la API de OpenAI (`endpoints_compatible`) para tareas de imagen-texto.
- Trabajo agentico con contexto largo: en Strix Halo o GPUs de 24 GB o mas, MXFP4_MOE maximiza el prompt-processing (616 t/s en Halo, 1119 t/s en 5060 Ti), lo que reduce la latencia en pipelines que reinyectan contexto en cada paso.
- Evaluacion reproducible de hardware: el corpus de evaluacion (`tools/eval.txt`, 400 KB de *Frankenstein* de Project Gutenberg, sha256 `6367505b…`) y los scripts permiten replicar byte a byte las mediciones en nuevas maquinas.
- Investigacion sobre cuantizacion de bajo bit: el pack documenta la penalizacion de calidad de MXFP4 en tensor cores FP4 nativos de Blackwell (+0,25 PPL frente a Vulkan/Metal), util para estudiar el compromiso precision-velocidad por backend.
- Prototipado en estaciones de trabajo con 32 GB de memoria unificada: Q4_K_M o Q5_K_S ofrecen un equilibrio razonable entre calidad (8,00 y 7,98 PPL) y espacio para contexto.

## Benchmarks y rendimiento

Perplexity sobre corpus de 400 KB (menor es mejor) y velocidad con `llama-bench -p 512 -n 128`, segun la tabla del autor:

| Cuantizacion | Tamano | PPL Strix Halo | PPL M1 Max | PPL 5060 Ti | pp t/s Halo / Mac / 5060 | tg t/s Halo / Mac / 5060 |
|---|---|---|---|---|---|---|
| Q3_K_M | 13,7 GB | 8,2548 | 8,2572 | 8,2403 | 562 / 213 / 1073 | 38 / 21 / 61 |
| Q4_K_M | 17,5 GB | 8,0013 | 8,0049 | no cabe | 575 / 217 / — | 36 / 23 / — |
| Q5_K_S | 18,6 GB | 7,9759 | 7,9724 | no cabe | 569 / 213 / — | 33 / 22 / — |
| Q6_K | 23,5 GB | 7,9097 | 7,9097 | no cabe | 532 / 222 / — | 31 / 22 / — |
| MXFP4_MOE | 14,8 GB | 8,1666 | 8,1662 | 8,4155 | 616 / 221 / 1119 | 34 / 23 / 53 |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: Q3_K_M 13,7 GB, MXFP4_MOE 14,8 GB, Q4_K_M 17,5 GB, Q5_K_S 18,6 GB, Q6_K 23,5 GB (tamanos de fichero; el autor senala que Q4_K_M ocupa 16,3 GiB y no cabe con margen para KV cache en 16 GB de VRAM).
- GPU de 16 GB: solo caben Q3_K_M y MXFP4_MOE con offload completo; Q4_K_M produce OOM en la RTX 5060 Ti 16 GB.
- GPU de 24 GB: Q4_K_M o Q5_K_S; MXFP4 si se necesita margen para contextos largos.
- Apple Silicon de 32 GB: Q4_K_M o Q5_K_S; Q6_K si prima la calidad (misma velocidad).
- Apple Silicon de 64 GB o mas y Strix Halo de 128 GB: Q6_K para calidad; MXFP4 para maximo prompt-processing.
- GPU recomendadas segun las mediciones: RTX 5060 Ti 16 GB (Blackwell, CUDA), Apple M1 Max 64 GB (Metal), AMD Ryzen AI Max+ 395 / Strix Halo 128 GB unificada (Vulkan). No se han medido A100 ni H100 en este pack.
- Despliegue: llama.cpp (backend Vulkan, Metal y CUDA), `llama-server` con `--mmproj` para vision y `llama-bench`/`llama-perplexity` para evaluacion. No se documenta soporte de vLLM, TGI u Ollama.
- Throughput observado: generacion de 21-23 t/s en M1 Max independientemente de la cuantizacion; 31-38 t/s en Strix Halo; hasta 61 t/s en RTX 5060 Ti con Q3_K_M. Prompt-processing de 213-222 t/s en Mac, 532-616 t/s en Halo y hasta 1119 t/s en 5060 Ti con MXFP4_MOE.

## Comparativa con modelos similares

No se dispone de datos de otros modelos en la informacion proporcionada para establecer una comparativa rigurosa. Como referencia interna del propio pack, la comparativa relevante es entre cuantizaciones del mismo modelo:

| Criterio | Q3_K_M | Q4_K_M | Q6_K | MXFP4_MOE |
|---|---|---|---|---|
| Tamano | 13,7 GB | 17,5 GB | 23,5 GB | 14,8 GB |
| Perplexity (Halo) | 8,2548 | 8,0013 | 7,9097 | 8,1666 |
| Cabe en 16 GB | Si | No | No | Si |
| Velocidad pp en 5060 Ti | 1073 t/s | — | — | 1119 t/s |
| Calidad en Blackwell | Referencia | — | — | Penalizacion +0,25 PPL |

Comparativa con modelos alternativos de tamano o tarea similar: no disponible.

## Limitaciones y advertencias

- El repositorio es un pack de benchmarks y cuantizaciones, no un modelo entrenado por hoodllm; la calidad final depende del modelo base thinkingmachines/Inkling-2-Mini.
- No hay informacion sobre sesgos del modelo base, riesgo de alucinacion ni evaluaciones de seguridad en la documentacion disponible.
- Idiomas soportados no declarados; no se puede garantizar un rendimiento multilingue equilibrado.
- Longitud de contexto no documentada; el autor sugiere reservar VRAM adicional para contextos largos, pero sin cifras.
- La cuantizacion se realizo sin imatrix, lo que puede situar la calidad por debajo de cuantizaciones calibradas equivalentes.
- MXFP4_MOE en hardware Blackwell (tensor cores FP4 nativos) presenta una penalizacion medible de perplexity (+0,25) frente a Vulkan/Metal; no es una opcion neutra en calidad.
- Q4_K_M no cabe en GPUs de 16 GB con margen para KV cache; el autor lo registra como OOM, no como aproximacion.
- La licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones y posibles restricciones del modelo base; conviene verificar la model card upstream.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validacion comunitaria independiente de las mediciones.
- Los resultados de velocidad dependen de la version de llama.cpp (master de noviembre de 2026, soporte `inkling2_loop` ≥ #32694); versiones distintas pueden arrojar cifras diferentes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hoodllm/Inkling-2-Mini-BenchPack
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Anuncio de Thinking Machines Lab: https://thinkingmachines.ai/news/inkling-2-mini/
- llama.cpp (soporte `inkling2_loop`, PR #32694): https://github.com/ggml-org/llama.cpp
- Corpus de evaluacion (Project Gutenberg, *Frankenstein*, `84-0.txt`): https://www.gutenberg.org/ebooks/84
