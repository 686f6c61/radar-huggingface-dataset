# devan-carlin/Qwen3.8-Flash-Next-W4A16

## Resumen

Qwen3.8-Flash-Next-W4A16 es una cuantizacion comunitaria del modelo Qwen3.8-Flash-Next, desarrollada por devan-carlin para su ejecucion en hardware Intel Arc (XPU). El modelo base, creado por Qwen, es un MoE hibrido de 125.000 millones de parametros (6.000 millones activos por token) con una capa adicional de embeddings N-gram (PLE) de 51.000 millones de parametros, basado en la arquitectura Qwen4 (GDN + QSA). Esta version cuantiza los pesos de los expertos a int4 (W4A16) mediante compressed-tensors, reduciendo el peso total a unos 77 GB, manteniendo en BF16 las capas criticas como lm_head, embeddings y gates.

La relevancia de esta ficha radica en que ofrece una receta concreta para servir un modelo de 125B con contexto de 256K en 4 GPUs Intel Arc Pro B70 (128 GB VRAM) y 128 GB de RAM, con un rendimiento de 53.4 tokens/s en decode. Es una opcion para quienes buscan desplegar un modelo de razonamiento avanzado en hardware no NVIDIA, aunque requiere un vLLM parcheado y la tabla PLE obligatoria. El modelo es solo texto; la torre de vision del base no se incluye.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida Qwen4 (GDN + QSA) con capa PLE (N-gram embedding) |
| Parametros totales | 128.778.433.171 (pesos del modelo principal, sin la tabla PLE de ~96 GB) |
| Parametros activos | 6.000 millones por token |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | W4A16 (int4 group-128, compressed-tensors) |
| Idiomas soportados | No disponible (el modelo base de Qwen soporta multiples idiomas, pero no se especifica en esta cuantizacion) |
| Licencia | Qwen Community License 1.0 |
| Formato de pesos | safetensors (17 shards) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next introduce la arquitectura Qwen4, que combina atencion GDN (Global-Dynamic-Normalized) con QSA (Quadratic Self-Attention) en un esquema hibrido. Ademas, incorpora una capa PLE (N-gram Embedding) que utiliza una tabla hash de ~96 GB en RAM para mejorar la prediccion de tokens frecuentes. El entrenamiento del base incluye optimizaciones en atencion, residual, embedding y estabilidad, aunque los detalles especificos del dataset y el proceso de alineacion no se detallan en la informacion disponible.

Esta cuantizacion W4A16 mantiene en BF16 las capas sensibles (lm_head, embed_tokens, mtp.*, ple.*, visual.*, *.gate, hyper_connection*, indexer*, linear_attn.*, shared_expert*) y cuantiza los pesos de los expertos a int4 con grupo de 128. La tabla PLE se incluye en el repositorio como un archivo separado (ple_table_qwen4exp.pt) y se mapea en memoria desde la RAM del host, nunca se carga en la GPU. El proceso de cuantizacion se realizo a partir de los pesos BF16 oficiales, sin doble cuantizacion FP8.

## Capacidades

- Generacion de texto y razonamiento avanzado, incluyendo modo de pensamiento (reasoning) con el parser qwen3.
- Soporte de tool calling y auto-tool-choice mediante el parser qwen3_xml.
- Capacidad de agentes y razonamiento multi-paso gracias a la arquitectura MoE y el contexto largo de 256K.
- Multilingue (heredado del base, aunque no se especifican idiomas concretos en esta version).
- Solo texto: no incluye la torre de vision del modelo base.
- Decodificacion especulativa MTP disponible en el port, pero no fiable en XPU (se recomienda desactivarla).
- Requiere la tabla PLE para producir salidas correctas; desactivarla produce resultados incorrectos.

## Casos de uso

- Asistente de codigo en entornos con hardware Intel Arc: el modelo puede generar y depurar codigo con tool calling, integrandose en pipelines de CI/CD mediante la API de vLLM (OpenAI-compatible) y el parser de herramientas qwen3_xml.
- Analisis de documentos largos: con 256K de contexto, puede procesar manuales tecnicos, contratos o logs extensos en una sola pasada, extrayendo informacion y resumiendo sin perder detalles.
- Chat conversacional multilingue: su capacidad de razonamiento y contexto largo permite mantener conversaciones coherentes con historial amplio, aunque se recomienda temperatura 0.7 para evitar colas degeneradas en greedy.
- Razonamiento cientifico y matematico: el modo de razonamiento (reasoning effort alto) permite resolver problemas complejos paso a paso, util para investigacion o educacion.
- Automatizacion de tareas de back-office: con tool calling, puede interactuar con APIs y bases de datos para generar informes, clasificar tickets o extraer datos estructurados.
- Prototipado de agentes autonomos: su capacidad de razonamiento multi-paso y contexto largo lo hace adecuado para experimentar con agentes que planifican y ejecutan secuencias de acciones, siempre que se disponga del hardware especifico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta metricas de inferencia en el hardware de referencia (4x Intel Arc Pro B70): 53.4 tok/s en decode, TTFT ~0.11s con 256K de contexto y KV cache fp8. No hay datos de MMLU, HumanEval, GSM8K u otros.

## Requisitos de hardware

- VRAM: 128 GB totales (4x Intel Arc Pro B70 de 32 GB cada una) para pesos W4A16 (77 GB) y KV cache fp8.
- RAM del host: >=128 GB (se recomiendan 247 GiB) para la tabla PLE de ~96 GB, que se mapea en memoria y se comparte entre los 4 ranks.
- GPU: Intel Arc Pro B70 (Xe3) con oneAPI Level-Zero 20.2.0. No se menciona compatibilidad con otras GPUs.
- Despliegue: vLLM parcheado (version 0.26.1rc1.dev500+gc39076fef) con torch 2.13.0+xpu y vllm-xpu-kernels 0.1.12. No es compatible con llama.cpp, Ollama ni TGI.
- Rendimiento medido: 53.4 tok/s decode, TTFT ~0.11s (single stream, 512 tokens, greedy).
- Configuracion recomendada: `--tensor-parallel-size 4 --enable-expert-parallel --gpu-memory-utilization 0.85 --kv-cache-dtype fp8`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-Flash-Next (base) | 125B + 51B PLE | 262K | Qwen Community 1.0 | HuggingFace, pesos BF16 |
| Qwen3.8-Flash-Next-W4A16 (esta cuantizacion) | 128.8B (sin PLE) | 262K | Qwen Community 1.0 | HuggingFace, safetensors W4A16 |
| Qwen3-235B-A22B (MoE similar) | 235B total, 22B activos | 131K | Qwen Community 1.0 | HuggingFace, pesos BF16 |

No se dispone de datos de benchmarks comparativos entre estos modelos. La cuantizacion W4A16 reduce el peso de 125B a ~77 GB, permitiendo su ejecucion en 128 GB VRAM, mientras que el base BF16 requeriria mas de 250 GB. La tabla PLE anade 96 GB de RAM adicional en ambos casos.

## Limitaciones y advertencias

- Solo texto: no incluye la torre de vision del modelo base, por lo que no puede procesar imagenes.
- Requiere hardware especifico: solo se ha validado en Intel Arc Pro B70 con vLLM parcheado; no funciona en GPUs NVIDIA ni AMD sin adaptaciones.
- La tabla PLE es obligatoria y ocupa ~96 GB de RAM; desactivarla produce salidas incorrectas.
- La decodificacion greedy (temperatura 0) puede generar una cola degenerada en idioma extranjero; se recomienda temperatura 0.7 y alto esfuerzo de razonamiento.
- MTP (decodificacion especulativa) no es fiable en XPU debido a limitaciones del kernel GDN causal_conv1d; debe mantenerse desactivado.
- Licencia Qwen Community 1.0: permite distribucion derivada, pero si el MAU supera 100M o los ingresos mensuales superan 20M USD, debe mostrarse el nombre del modelo. El uso comercial en MaaS o asistentes de IA requiere una licencia separada de Qwen.
- No se han publicado benchmarks de calidad; el rendimiento funcional no esta verificado en tareas estandar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/devan-carlin/Qwen3.8-Flash-Next-W4A16
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- GitHub del modelo base: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Receta vLLM: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Coleccion Qwen3.8-Flash-Next: https://huggingface.co/collections/Qwen/qwen38-flash-next
