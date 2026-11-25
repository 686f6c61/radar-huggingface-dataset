# mikewolfd/gemma-4-e2b-it-early14-coreml-ane

## Resumen

`mikewolfd/gemma-4-e2b-it-early14-coreml-ane` es un paquete de artefactos precompilados para Core ML destinados a ejecutar el modelo `google/gemma-4-E2B-it` sobre la Neural Engine (ANE) de los chips Apple Silicon. No se trata de un modelo entrenado desde cero, sino de un conjunto de bundles Core ML que contienen las primeras 15 capas (0 a 14) del transformer, compiladas especificamente para la ANE con 1.326 operaciones ANE y 0 operaciones GPU/CPU, junto con una tabla opcional de remapeo de vocabulario ASCII de 150.786 tokens.

El paquete esta disenado para integrarse con el runtime `fast-silicon` (concretamente `fast-gemma4`), que descarga los pesos base y los pesos MTP (multi-token prediction) directamente desde Hugging Face (`mlx-community/gemma-4-e2b-it-4bit` en 4 bits o `bf16`, y `google/gemma-4-E2B-it-assistant`). El objetivo es evitar la compilacion local con `coremltools`, que es costosa en tiempo, y ofrecer un prefijo ANE listo para usar que acelera el prefill en lotes grandes.

Su relevancia actual radica en que demuestra una via practica para explotar la ANE de los Macs Apple9 (M4 en adelante) en inferencia de modelos Gemma 4, con incrementos medidos de hasta 4,90x en documentos validos por segundo frente a `mlx-vlm` en GPU, y de 2,15x en decodificacion especulativa MTP. Es un artefacto muy especializado, orientado a desarrolladores que ya trabajan con el stack `fast-silicon` y quieren reducir el coste de prefill en cargas de extraccion por lotes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E2B), con prefijo Early14 compilado para Core ML ANE y soporte de MTP (multi-token prediction) |
| Parametros totales | no disponible (el modelo base es `google/gemma-4-E2B-it`; el repo solo contiene artefactos Core ML) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (bundle principal) y W8 calibrado con Hadamard (bundle `_w8`); pesos base en 4 bits (`mlx-community/gemma-4-e2b-it-4bit`) o `bf16` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (`mlmodelc`), `.npz` para la tabla de vocabulario; pesos base en MLX (4 bits/bf16) |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado, sino artefactos de compilacion. El bundle principal `gemma4_early14_prefix_S256_fp16.mlmodelc` (1,0 GB) contiene las capas 0 a 14 del transformer Gemma 4 E2B compiladas para la ANE con una longitud de secuencia de prefijo S=256 y precision FP16. El bundle `gemma4_early14_prefix_S256_w8.mlmodelc` (515 MB) es la variante cuantizada a 8 bits con calibracion Hadamard. Ambos estan pensados para funcionar como "prefill ring" en el runtime `fast-silicon`, que descarga los pesos base y los pesos MTP desde los repositorios oficiales de Google y `mlx-community`.

La innovacion tecnica clave es la compilacion "pure-ANE": las 1.326 operaciones del prefijo se ejecutan integramente en la Neural Engine, sin operaciones en GPU ni CPU, lo que libera la GPU para otras tareas y reduce el consumo energetico. El paquete incluye ademas una politica de hardware que activa automaticamente el anillo ANE+GPU en Macs Apple9 con 32 GB o mas de memoria unificada para lotes de prefill de 16 o mas elementos; en equipos con 24 GB o menos (por ejemplo, un MacBook base M5 con 24 GB) se mantiene ejecucion puramente en GPU por politica de memoria. La tabla `vocab_remap_150786.npz` (592 KB) permite remapear el vocabulario de salida a ASCII, util para tareas de extraccion estructurada. No se dispone de informacion sobre el dataset de entrenamiento del modelo base ni sobre procesos de RLHF/DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base `google/gemma-4-E2B-it`, aunque no se detallan en la informacion disponible.
- Extraccion estructurada por lotes: el caso de uso principal documentado es la extraccion de fixtures con salida `kv_i8`, alcanzando 8,78 documentos validos/s en M4 Pro con 48 GB.
- JSON estricto y tool calling: el modelo evaluado con `fast-gemma4` obtiene 300/300 tareas validas en el benchmark `Cat-4` (300 tareas) con F1 de 0,946, frente a 286/300 y F1 de 0,923 en `mlx-vlm` estandar.
- Decodificacion especulativa MTP: soporta multi-token prediction con los pesos `google/gemma-4-E2B-it-assistant`, alcanzando 33,5 tok/s en B=1 en un M5 base (24 GB), 2,15x frente a `mlx-vlm`.
- Procesamiento multimodal: el bundle se ha probado con `FinTabNet(4)`, alcanzando 103,62 tok/s frente a 48,81 tok/s del baseline (2,123x) con 4/4 resultados exactos.
- Remapeo de vocabulario ASCII: tabla opcional de 150.786 tokens para salidas en ASCII puro.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Extraccion de datos estructurados por lotes: procesar lotes de 128 documentos con salida `kv_i8` en un M4 Pro de 48 GB, alcanzando 8,78 documentos validos/s gracias al prefijo ANE Early14 y al chunk prefill W8 a 7.815 tok/s.
- Pipelines de JSON estricto y tool calling: ejecutar tareas de `Cat-4` (300 tareas) con 300/300 resultados validos y F1 de 0,946, adecuado para agentes que necesitan formato de salida garantizado.
- Servicio de inferencia local en Mac: desplegar `fast-gemma4` en un MacBook base M5 de 24 GB con ejecucion puramente GPU (6,13 GB de MLX) para tareas de extraccion a 10,46 documentos validos/s.
- Decodificacion especulativa de baja latencia: usar MTP con `google/gemma-4-E2B-it-assistant` para generacion interactiva a 33,5 tok/s en B=1, adecuado para asistentes en tiempo real.
- Procesamiento de documentos tabulares multimodales: extraer informacion de tablas financieras (`FinTabNet`) a 103,62 tok/s con 4/4 resultados exactos, util para pipelines de analisis documental.
- Evaluacion y benchmarking de hardware Apple Silicon: comparar el rendimiento ANE+GPU frente a `mlx-vlm` en M4 Pro y M5 para decidir la politica de despliegue segun memoria unificada.
- Investigacion en compilacion Core ML: servir como referencia de como compilar un prefijo transformer de 15 capas integramente en ANE con 0 operaciones GPU/CPU.

## Benchmarks y rendimiento

Los datos disponibles provienen de la model card del autor y comparan `fast-gemma4` (con estos bundles) frente a `mlx-vlm` estandar sobre Gemma-4 E2B-it 4 bits.

| Carga de trabajo | Host | `mlx-vlm` GPU | `fast-gemma4` GPU | `fast-gemma4` ANE+GPU / MTP | Aceleracion |
|---|---|---|---|---|---|
| Batch-128 extraccion (`kv_i8`) | M4 Pro (48 GB) | 1,79-1,80 docs validos/s (B=64; OOM a 34,4 GB sin chunking) | 6,79-6,87 docs validos/s (5,64 docs/s / 1.258 tok/s en prueba con contencion) | 8,78 docs validos/s (2x128; 5,91-6,11 docs/s con contencion; Early14 W8 a 7.815 tok/s en chunk prefill) | 3,29x-4,90x |
| Batch-128 extraccion (`kv_i8`) | M5 base (24 GB) | 2,02 docs validos/s (B=64) | 10,46 docs validos/s (6,42 docs/s / 1.289 tok/s; 6,13 GB MLX) | Anillo ANE desactivado por politica de <= 24 GB | 5,18x |
| JSON estricto + tool calls (`Cat-4`, 300 tareas) | M5 base (24 GB) | 1,501 score/s (286/300 validos, F1 0,923, 172,2 s) | 1,835 score/s (300/300 validos, F1 0,946, 144,4 s) | no disponible | 1,22x |
| MTP especulativo (B=1 / B=4) | M5 base (24 GB) | 15,6 tok/s (`json_b1`, sin restriccion) | Baseline AR | 33,5 tok/s (1,65-1,68x vs AR B=1; 1,00x `json_b4`; 10/10 exactos) | 2,15x |
| MTP especulativo (B=1 / B=4) | M4 Pro (48 GB) | no disponible | Baseline AR | 1,49-1,62x vs AR B=1; 1,13x `free_b4` (10/10 exactos) | no disponible |
| Multimodal `FinTabNet(4)` | M5 base (24 GB) | 48,81 tok/s | no disponible | 103,62 tok/s (4/4 exactos) | 2,123x |

## Requisitos de hardware

- VRAM/memoria unificada: el bundle FP16 ocupa 1,0 GB y el W8 515 MB; los pesos base en 4 bits requieren aproximadamente 6,13 GB de MLX segun los datos del M5 base.
- GPU/chips recomendados: chips Apple9 en adelante (M4, M4 Pro, M5). El anillo ANE+GPU se activa automaticamente en equipos con 32 GB o mas (por ejemplo, M4 Pro de 48 GB) para lotes de prefill de 16 o mas.
- Equipos con 24 GB o menos: mantienen ejecucion puramente GPU por politica de memoria; no se activa el anillo ANE.
- Cabe en GPU de consumo: si, en Macs Apple Silicon; no aplica a GPUs NVIDIA/AMD porque el formato es Core ML.
- Opciones de despliegue: runtime `fast-silicon` (`fast-gemma4`) sobre Core ML; los pesos base se obtienen de `mlx-community` (MLX) y de `google/gemma-4-E2B-it-assistant` (MTP). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 8,78 docs validos/s (M4 Pro 48 GB, ANE+GPU), 10,46 docs validos/s (M5 base 24 GB, GPU), 33,5 tok/s en decodificacion MTP B=1 (M5 base), 103,62 tok/s en multimodal `FinTabNet` (M5 base).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mikewolfd/gemma-4-e2b-it-early14-coreml-ane` | no disponible (artefactos Core ML) | no disponible | Prefijo Early14 ANE + MTP para Apple Silicon | Apache 2.0 | Hugging Face (repo de 1,6 GB) |
| `mlx-community/gemma-4-e2b-it-4bit` | no disponible | no disponible | Pesos base en MLX 4 bits | no disponible | Hugging Face |
| `google/gemma-4-E2B-it` | no disponible | no disponible | Modelo base oficial | no disponible | Hugging Face |
| `google/gemma-4-E2B-it-assistant` | no disponible | no disponible | Pesos MTP para decodificacion especulativa | no disponible | Hugging Face |

No se dispone de datos de benchmarks de los modelos comparables en la informacion proporcionada mas alla de las cifras de `mlx-vlm` incluidas en la tabla anterior.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el runtime `fast-silicon` (`fast-gemma4`) y la descarga separada de los pesos base y MTP desde otros repositorios.
- Exclusivo para Apple Silicon: el formato Core ML y la ANE no son portables a GPUs NVIDIA, AMD ni a CPU generica.
- Politica de memoria estricta: en equipos con 24 GB o menos no se activa el anillo ANE, por lo que el rendimiento depende solo de la GPU.
- El bundle FP16 requiere 1,0 GB adicionales en disco/memoria frente al W8 de 515 MB; la eleccion afecta al rendimiento y al consumo.
- El autor documenta cifras con contencion (por ejemplo, 5,64 docs/s frente a 6,87 docs/s), lo que indica sensibilidad a la carga concurrente del sistema.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; dependen del modelo base `google/gemma-4-E2B-it`.
- Idiomas y contexto: no disponibles; conviene consultar la model card del modelo base antes de usarlo en produccion multilingue.
- Licencia Apache 2.0 declarada en este repo, pero los pesos base y MTP tienen sus propias condiciones que deben verificarse por separado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion comunitaria independiente de las cifras.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mikewolfd/gemma-4-e2b-it-early14-coreml-ane
- Runtime `fast-silicon`: https://github.com/mikewolfd/fast-silicon
- Pesos base 4 bits: https://huggingface.co/mlx-community/gemma-4-e2b-it-4bit
- Modelo base oficial: https://huggingface.co/google/gemma-4-E2B-it
- Pesos MTP: https://huggingface.co/google/gemma-4-E2B-it-assistant
