# pocharlies/qwen38-flash-next-2x-dgx-spark-sglang

## Resumen

Este repositorio no contiene un modelo nuevo, sino un recipe de despliegue probado en producción para servir el checkpoint cuantizado NVFP4 de Qwen3.8-Flash-Next, un modelo multimodal de mezcla de expertos (MoE) de 125B parámetros con 6B activos por token, desarrollado por Qwen como vista previa de la arquitectura Qwen4. El recipe, creado por pocharlies, valida el funcionamiento del checkpoint RadixArk/Qwen3.8-Flash-Next-NVFP4 en dos NVIDIA DGX Spark (GB10) con tensor parallelism (TP=2) sobre RoCEv2 y el motor de inferencia SGLang, incluyendo parches para problemas de compatibilidad con flash-attn y el backend de atención dispersa QSA.

La relevancia de este recipe radica en que el checkpoint NVFP4 de RadixArk solo estaba validado en hardware GB300/B300, y esta contribución extiende la verificación a la arquitectura sm_121a de GB10, demostrando un rendimiento agregado de 153 tok/s con 8 flujos concurrentes y una ventana de contexto nativa de 262 144 tokens. Incluye manifiestos de Kubernetes, Dockerfile, parámetros críticos de arranque y dos parches de código que resuelven fallos conocidos del branch experimental de SGLang.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrido GDN (Gated Dense Network) + QSA (Quadratic Sparse Attention) con n-gram PLE y MTP |
| Parametros totales | 180B (125B MoE + 51B n-gram PLE + 4B MTP) |
| Parametros activos | 6B por token |
| Longitud de contexto | 262 144 tokens (256K nativo, sin YaRN) |
| Tipos de cuantizacion | NVFP4 (modelo principal), FP8 (tablas n-gram PLE en disco) |
| Idiomas soportados | Ingles (segun la model card del recipe) |
| Licencia | Apache-2.0 (recipe) / Qwen Community License 1.0 (pesos del modelo) |
| Formato de pesos | no disponible (el checkpoint NVFP4 se distribuye via RadixArk) |

## Arquitectura y entrenamiento

Qwen3.8-Flash-Next es un modelo MoE multimodal que combina una red densa con activacion por token (6B de 125B) y una tabla de n-gram embeddings de 51B parametros para busquedas locales rapidas. La arquitectura hibrida GDN + QSA introduce atencion dispersa a nivel de micro-bloques (64 tokens por bloque, presupuesto de 512 bloques / 2048 tokens por consulta) y un estado recurrente GDN que se gestiona con una cache radix especifica. Ademas incorpora un modulo MTP (multi-token prediction) de 4B parametros para decodificacion especulativa, con una longitud de aceptacion medida de ~2.3 tokens.

No se dispone de informacion publica sobre el dataset de entrenamiento, el numero de tokens procesados ni el uso de tecnicas como RLHF o DPO. El recipe documenta que el checkpoint NVFP4 de RadixArk mantiene las tablas PLE en FP8 durante la carga en sm_121a, en lugar de dequantizarlas a BF16 como indica la model card original, lo que permite ajustar los pesos en ~74 GiB por rank.

## Capacidades

- Generacion de texto multimodal: procesa entradas de texto e imagen (segun fuentes externas, aunque el recipe no detalla el pipeline de vision).
- Razonamiento avanzado y chat: disenado para tareas de agente, codificacion y conversacion, con rendimiento declarado superior a Claude-4.6-Opus en estas areas (afirmacion del fabricante, no verificada de forma independiente).
- Decodificacion especulativa nativa: el modulo MTP con 3 pasos, topk=1 y 4 borradores permite una longitud de aceptacion sostenida de ~2.3, mejorando el throughput en inferencia.
- Atencion dispersa QSA: reduce el coste computacional en contextos largos mediante seleccion de bloques a nivel de micro-bloque, manteniendo la ventana completa de 262K tokens.
- Soporte de despliegue distribuido: recipe validado para TP=2 sobre RoCEv2 con SGLang, incluyendo configuracion de Kubernetes para dos nodos.
- Multilingue limitado: la model card del recipe solo declara ingles, aunque el modelo base de Qwen podria soportar mas idiomas (no confirmado en esta informacion).

## Casos de uso

- Servicio de chat multimodal en entornos corporativos: el modelo puede gestionar conversaciones con imagenes y texto en una ventana de 262K tokens, adecuado para asistentes que necesitan analizar documentos largos con figuras. El recipe permite desplegarlo en dos DGX Spark con un rendimiento agregado de 153 tok/s para 8 usuarios concurrentes.
- Agente de codificacion asistida: con capacidades de razonamiento y generacion de codigo, puede integrarse en entornos de desarrollo como backend de autocompletado o revision de codigo, aprovechando la decodificacion especulativa para reducir la latencia percibida.
- Analisis de documentos extensos: la ventana de contexto nativa de 256K tokens permite procesar libros tecnicos, informes anuales o codigo fuente completo en una sola pasada, sin necesidad de tecnicas de ventana deslizante.
- Investigacion en inferencia eficiente: el recipe documenta parametros criticos (mem-fraction-static, MAX_JOBS, page-size) y parches para GB10, sirviendo como referencia para equipos que despliegan modelos MoE grandes en hardware de memoria unificada.
- Pruebas de concepto de decodificacion especulativa: el modulo MTP con configuracion ajustable (ENABLE_MTP) permite experimentar con diferentes longitudes de borrador y medir el impacto en throughput y latencia.
- Despliegue en entornos con restricciones de red: el uso de un enlace directo 200G DAC con RoCEv2 y direcciones IP estaticas elimina la necesidad de un switch, simplificando la infraestructura para clusters de dos nodos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El recipe incluye mediciones de rendimiento de inferencia obtenidas en una prueba de 30 minutos con 2× DGX Spark:

| Metrica | Valor |
|---|---|
| Single-stream | ~41-42 tok/s |
| 8 flujos concurrentes (agregado) | 153 tok/s promedio (139-166), sin degradacion |
| Longitud de aceptacion especulativa (NEXTN) | ~2.3 sostenido (2.0-2.7) |
| Temperatura bajo carga sostenida | 83-85 °C en ambos nodos, recuperacion a <60 °C |
| Concurrencia maxima | 8 (limitada por la cache mamba con mem-fraction 0.78) |

## Requisitos de hardware

- Hardware validado: 2× NVIDIA DGX Spark (GB10, 128 GB LPDDR5x unificada cada uno, arquitectura arm64).
- Interconexion: enlace directo 200G DAC entre nodos con RoCEv2 (NCCL_IB_*), sin switch; IPs estaticas 10.0.0.1/10.0.0.2.
- Almacenamiento: los pesos residen en un nodo y el otro los lee via NFS (opcional NFS-RDMA, medido 5.5 GB/s).
- Memoria: ~74 GiB de pesos por rank, con pool estatico configurado a mem-fraction 0.78 (0.85 causa OOM durante la captura de CUDA graphs).
- Software: SGLang con build qwen4_exp (PR #36497), modelopt_fp4, flashinfer con kernels NVFP4 cutlass para sm_121a, arm64; requiere cargo (Rust) para extensiones.
- Opciones de despliegue: manifiestos de Kubernetes incluidos (dos Deployments, head rank 0 + worker rank 1), hostNetwork para comunicacion sobre RoCE.
- Latencia: el primer request tras el arranque tarda 10-60 s (warmup); no es un fallo del servicio.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con modelos alternativos de la misma categoria (tamano y tarea). El modelo Qwen3.8-Flash-Next se posiciona como un MoE multimodal de 125B con 6B activos, pero no hay datos publicos de benchmarks estandarizados que permitan compararlo con otros modelos como DeepSeek-V3 o Mixtral en esta ficha.

## Limitaciones y advertencias

- Licencia: los pesos del modelo estan bajo Qwen Community License 1.0, que puede imponer restricciones de uso comercial; el recipe en si es Apache-2.0.
- Requisitos de hardware muy especificos: el recipe solo esta validado en 2× DGX Spark con TP=2; no se garantiza su funcionamiento en otras configuraciones.
- Dependencia de parches no oficiales: el recipe incluye dos parches (stub de flash-attn y apertura del gate is_sm100_supported) que seran innecesarios cuando se corrijan en upstream, pero que actualmente son imprescindibles para arrancar.
- Riesgo de OOM global: el parametro mem-fraction-static debe ser 0.78; valores superiores causan fallos durante la captura de CUDA graphs, y el OOM puede afectar a todo el nodo, no solo al contenedor.
- Reinicio coordinado obligatorio: si un rank se reinicia fuera de sincronia, el otro espera 601 s y muere; ambos deben reiniciarse a la vez.
- Idiomas limitados: la model card del recipe solo declara ingles; el rendimiento en otros idiomas no esta documentado.
- Sin benchmarks de calidad publicados: las afirmaciones de rendimiento frente a otros modelos (p. ej., Claude-4.6-Opus) provienen del fabricante y no estan verificadas de forma independiente.
- Alucinacion y sesgos: no se proporcionan datos especificos sobre sesgos o tasas de alucinacion; como modelo generativo grande, presenta riesgos inherentes.

## Enlaces

- Repositorio HuggingFace del recipe: https://huggingface.co/pocharlies/qwen38-flash-next-2x-dgx-spark-sglang
- Modelo base (checkpoint NVFP4): https://huggingface.co/RadixArk/Qwen3.8-Flash-Next-NVFP4
- Repositorio GitHub del recipe: https://github.com/pocharlies/qwen38-flash-next-dgx-spark-sglang/releases
- Documentacion de SGLang para Qwen3.8-Flash-Next: https://docs.sglang.io/cookbook/autoregressive/Qwen/Qwen3.8-Flash-Next
- Recetas vLLM para Qwen3.8-Flash-Next: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Guia de ejecucion local (unsloth): https://unsloth.ai/docs/models/qwen3.8-next
- Hilo en NVIDIA Developer Forums: https://forums.developer.nvidia.com/t/qwen3-8-flash-next/381228
- PR de SGLang relacionado: https://github.com/sgl-project/sglang/pull/36497
