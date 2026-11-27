# prithivMLmods/Inkling-2-Mini-GGUF

## Resumen

Inkling-2-Mini es un modelo multimodal de pesos abiertos publicado por Thinking Machines Lab el 20 de noviembre de 2026. Se trata de un transformer autorregresivo con arquitectura de bucle ("looped transformer") y mezcla de expertos dispersa (MoE), con 26.400 millones de parametros totales y 3.400 millones activos, que rinden como 5.400 millones de parametros efectivos por token. Esta pensado para despliegue local en texto e imagen, con una ventana de contexto de 1 millon de tokens.

La arquitectura consta de 24 capas MoE que enrutan cada token a 8 de 128 expertos por capa, con atencion hibrida local/global. Las 12 capas centrales se ejecutan tres veces con pesos compartidos, lo que da 48 aplicaciones de capa por token. Se distribuye como un checkpoint compacto de unos 20 GB en precision mixta NVFP4/MXFP8, apto para equipos Apple Silicon de 32 GB o mas, GPUs individuales y NVIDIA DGX Spark, con soporte en vLLM, SGLang, llama.cpp y Ollama.

Esta ficha cubre la version GGUF publicada por prithivMLmods, que ofrece el modelo en multiples cuantizaciones (desde IQ2_M de 10,7 GB hasta BF16 de 52,2 GB), incluyendo variantes NVFP4 y MXFP4 optimizadas para hardware NVIDIA Blackwell, un fichero de proyeccion multimodal y un fichero de decodificacion especulativa para el framework dspark. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo con bucle, MoE dispersa (8 de 128 expertos por capa), atencion hibrida local/global, 24 capas con 12 capas centrales repetidas 3 veces (48 aplicaciones por token) |
| Parametros totales | 26.070.390.272 (26,07 B) |
| Parametros activos | 3,4 B activos; 5,4 B efectivos por token |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | BF16, NVFP4, MXFP4_MOE, IQ2_M, IQ4_XS, IQ4_NL, Q3_K_M, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, Q8_0; fichero imatrix e fichero mmproj BF16 para vision |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de transformer con bucle: las 12 capas centrales de un total de 24 se reejecutan tres veces compartiendo pesos, de modo que cada token atraviesa 48 aplicaciones de capa. La capa MoE enruta cada token a 8 de 128 expertos, lo que mantiene un coste de computo bajo (3,4 B parametros activos, 5,4 B efectivos) pese a los 26,07 B totales. La atencion es hibrida, combinando mecanismos locales y globales, y el modelo acepta entradas de texto e imagen mediante un proyector multimodal (fichero `mmproj-bf16.gguf` de 642 MB).

El checkpoint se distribuye en precision mixta NVFP4/MXFP8, con un tamano aproximado de 20 GB, disenado para aprovechar los Tensor Cores FP4 de las GPU NVIDIA Blackwell (SM120, GB202, B200, B300, RTX PRO 6000). La publicacion incluye un fichero BF16-dspark de 749 MB para decodificacion especulativa con el framework dspark, y un fichero imatrix de 90,8 MB calibrado con los datos de calibracion v6 de bartowski para generar cuantizaciones IQ y K-quants de baja perplejidad. No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional y razonamiento multi-paso.
- Generacion y comprension de codigo, con resultados destacados en SWEBench Verified, SWEBench Pro v2 Hard y DeepSWE v1.1.
- Entrada multimodal de imagen y texto (pipeline `image-text-to-text`), con fichero de proyeccion dedicado.
- Soporte de tool calling y uso de herramientas (etiqueta `tool-use`).
- Capacidad de navegacion y busqueda web (resultado en BrowseComp).
- Comprension de documentos (resultado en OmniDocBench v1.6).
- Razonamiento abstracto y resolucion de problemas novedosos (resultados en ARC-AGI v1 y v2).
- Ventana de contexto de 1 millon de tokens para entradas muy largas.
- Compatibilidad con frameworks de inferencia: vLLM, SGLang, llama.cpp, Ollama y text-generation-inference.
- Decodificacion especulativa mediante el fichero dspark.

## Casos de uso

- Agentes de codigo en produccion: con 79,2% en SWEBench Verified y soporte de tool calling, el modelo puede integrarse en pipelines de CI/CD para resolver issues, generar parches y ejecutar tareas multi-paso sobre repositorios completos, aprovechando el contexto de 1M tokens para cargar fragmentos amplios del codigo.
- Analisis de documentos extensos: OmniDocBench v1.6 al 92,8% y contexto de 1M tokens permiten procesar contratos, informes o expedientes completos con entrada de imagen (escaneos) y texto en una sola pasada.
- Atencion al cliente automatizada: conversaciones multi-turno con historial largo gracias a la ventana de 1M tokens, con tool calling para consultar sistemas internos y escalar incidencias.
- Agentes de navegacion web: el 79,0% en BrowseComp respalda tareas de busqueda, extraccion y sintesis de informacion en entornos web, integrables en flujos de investigacion automatizada.
- Despliegue local en estaciones de trabajo: las cuantizaciones Q4_K_M (17,5 GB) y Q5_K_M (19,9 GB) caben en GPUs de consumo con 24 GB o en Apple Silicon de 32 GB, lo que permite uso offline con datos sensibles sin salir del equipo.
- Inferencia de alta velocidad en Blackwell: la variante NVFP4 (17,6 GB) alcanza 82,98 tokens/s de generacion y 310,46 tokens/s de procesamiento de prompt en una RTX PRO 6000 con 96 GB, adecuada para servicios de baja latencia.
- Razonamiento abstracto y prototipado de investigacion: los resultados en ARC-AGI v1 (84,5%) y v2 (49,3%) lo hacen util para experimentos de resolucion de problemas y evaluacion de capacidades cognitivas.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| SWEBench Verified | 79,2% |
| SWEBench Pro v2 Hard | 77,9% |
| DeepSWE v1.1 | 48,2% |
| BrowseComp | 79,0% |
| OmniDocBench v1.6 | 92,8% |
| ARC-AGI v1 | 84,5% |
| ARC-AGI v2 | 49,3% |

Prueba de rendimiento de la variante NVFP4 en llama-cli con offload completo en GPU:

| Metrica | Valor |
|---|---|
| Velocidad media de procesamiento de prompt | 310,46 tokens/s |
| Velocidad media de generacion | 82,98 tokens/s |
| Tiempo total de ejecucion | 89,5 s |
| Longitud de contexto de la prueba | 16.384 tokens |
| KV cache (K) | q8_0 |
| GPU | NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB VRAM) |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval ni GSM8K.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: IQ2_M 10,7 GB; Q3_K_M 13,7 GB; Q3_K_L 14,2 GB; IQ4_XS 14,4 GB; MXFP4_MOE 14,8 GB; IQ4_NL 14,9 GB; Q4_K_M 17,5 GB; NVFP4 17,6 GB; Q5_K_S 18,6 GB; Q5_K_M 19,9 GB; Q8_0 27,8 GB; BF16 52,2 GB. A estas cifras hay que sumar el KV cache y el fichero mmproj de 642 MB si se usa vision.
- GPUs recomendadas: NVIDIA RTX PRO 6000 Blackwell (96 GB) para NVFP4/MXFP4 con maxima velocidad; B200 y B300 para despliegue en centro de datos; A100 y H100 para las cuantizaciones GGUF estandar; DGX Spark como plataforma compacta soportada.
- GPU de consumo: las cuantizaciones Q4_K_M (17,5 GB), Q5_K_M (19,9 GB) e IQ4_XS (14,4 GB) caben en tarjetas de 24 GB (RTX 4090, RTX 3090) y en Apple Silicon de 32 GB o mas. IQ2_M (10,7 GB) permite entornos con 12-16 GB.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, vLLM, SGLang y text-generation-inference.
- Rendimiento medido: 82,98 tokens/s de generacion y 310,46 tokens/s de prompt con NVFP4 en RTX PRO 6000 Blackwell; no hay datos de latencia para otras GPU en la informacion disponible.
- Aceleracion FP4: las variantes NVFP4 y MXFP4_MOE requieren hardware NVIDIA Blackwell (SM120, GB202, B200, B300) para aprovechar los Tensor Cores FP4.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Inkling-2-Mini | 26,07 B / 3,4 B (5,4 B efectivos) | 1.000.000 | Apache 2.0 | Multimodal, MoE con bucle, tool use, FP4 en Blackwell |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | No se proporcionan modelos comparables en la informacion disponible |

No se dispone en la informacion proporcionada de datos de otros modelos de tamano o categoria similares para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- No se documentan en la informacion disponible los sesgos conocidos del modelo ni la composicion de los datos de entrenamiento, lo que dificulta evaluar riesgos de sesgo.
- Riesgo de alucinacion inherente a los modelos generativos; los resultados de benchmarks no garantizan correccion factual en dominios abiertos.
- No se especifican los idiomas soportados; la calidad fuera del ingles (u otros idiomas no documentados) no esta garantizada.
- El contexto de 1M tokens implica un coste elevado de memoria para el KV cache en produccion; la prueba publicada usa solo 16.384 tokens con KV cache q8_0.
- Las variantes NVFP4 y MXFP4_MOE solo ofrecen aceleracion nativa en hardware NVIDIA Blackwell; en otras GPU se comportaran como cuantizaciones de 4 bits convencionales.
- Las cuantizaciones de 2 y 3 bits (IQ2_M, Q3_K_M, Q3_K_L) degradan la calidad de forma notable; la propia model card las describe como de baja calidad o para restricciones extremas.
- El uso de vision requiere cargar el fichero mmproj-bf16.gguf adicional y consume VRAM extra.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base `thinkingmachines/Inkling-2-Mini` y de los datos de calibracion empleados para las cuantizaciones IQ.
- El rendimiento medido corresponde a una unica GPU de gama alta (RTX PRO 6000 Blackwell); no hay datos de throughput en otras configuraciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/prithivMLmods/Inkling-2-Mini-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Fichero BF16: https://huggingface.co/prithivMLmods/Inkling-2-Mini-GGUF/blob/main/Inkling-2-Mini.BF16.gguf
- Fichero BF16-dspark: https://huggingface.co/prithivMLmods/Inkling-2-Mini-GGUF/blob/main/Inkling-2-Mini-BF16-dspark.gguf
- Fichero NVFP4: https://huggingface.co/prithivMLmods/Inkling-2-Mini-GGUF/blob/main/Inkling-2-Mini-NVFP4.gguf
- Fichero MXFP4_MOE: https://huggingface.co/prithivMLmods/Inkling-2-Mini-GGUF/blob/main/Inkling-2-Mini.MXFP4_MOE.gguf
- Fichero imatrix: https://huggingface.co/prithivMLmods/Inkling-2-Mini-GGUF/blob/main/Inkling-2-Mini-imatrix.gguf
- Fichero IQ2_M: https://huggingface.co/prithivMLmods/Inkling-2-Mini-GGUF/blob/main/Inkling-2-Mini.IQ2_M.gguf
- Fichero IQ4_XS: https://huggingface.co/prithivMLmods/Inkling-2-Mini-GGUF/blob/main/Inkling-2-Mini.IQ4_XS.gguf
- Fichero IQ4_NL: https://huggingface.co/prithivMLmods/Inkling-2-Mini-GGUF/blob/main/Inkling-2-Mini.IQ4_NL.gguf
- Fichero Q3_K_M: https://huggingface.co/prithivMLmods/Inkling-2-Mini-GGUF/blob/main/Inkling-2-Mini.Q3_K_M.gguf
- Fichero Q3_K_L: https://huggingface.co/prithivMLmods/Inkling-2-Mini-GGUF/blob/main/Inkling-2-Mini.Q3_K_L.gguf
- Fichero Q4_K_M: https://huggingface.co/prithivMLmods/Inkling-2-Mini-GGUF/blob/main/Inkling-2-Mini.Q4_K_M.gguf
- Fichero Q5_K_S: https://huggingface.co/prithivMLmods/Inkling-2-Mini-GGUF/blob/main/Inkling-2-Mini.Q5_K_S.gguf
- Fichero Q5_K_M: https://huggingface.co/prithivMLmods/Inkling-2-Mini-GGUF/blob/main/Inkling-2-Mini.Q5_K_M.gguf
- Fichero Q8_0: https://huggingface.co/prithivMLmods/Inkling-2-Mini-GGUF/blob/main/Inkling-2-Mini.Q8_0.gguf
- Fichero mmproj BF16: https://huggingface.co/prithivMLmods/Inkling-2-Mini-GGUF/blob/main/Inkling-2-Mini.mmproj-bf16.gguf
- Datos de calibracion imatrix (bartowski v6): https://gist.github.com/bartowski1182/e26453c0404e24eb317543ec5360f87a
