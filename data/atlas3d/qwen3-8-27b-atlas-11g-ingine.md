# Atlas3D/Qwen3.8-27B-atlas-11g-ingine

## Resumen

Qwen3.8-27B-atlas-11g-ingine es un checkpoint cuantizado de forma elástica del modelo Qwen/Qwen3.8-27B, desarrollado por Atlas3D y publicado para su uso con el motor de inferencia propietario Atlas3DSS/atlas-ingine. Se trata de una variante "pure atlas3+nvfp4" (sin tensores en formato ATLAS2 de 2,5 bits) que reduce el peso en disco a 12,18 GB (11,35 GiB) en tres shards, frente a los 18,77 GiB del checkpoint NVFP4 de referencia de NVIDIA. El objetivo declarado es caber en GPUs de 12-16 GB de VRAM, ahorrando 7,42 GiB respecto a la línea base NVFP4.

El modelo es de tipo text-only: se excluyen explícitamente los tensores visuales y MTP (multi-token prediction) del checkpoint base. La cuantización se distribuye de forma selectiva por capas: todas las MLP en ATLAS3 (3,5 bits por peso), la atención "core" en ATLAS3, la atención de frontera (2 capas) en NVFP4 y los embeddings y lm_head en NVFP4. Está pensado para servir mediante una API HTTP compatible con OpenAI a través de `ingine-serve`.

La relevancia actual del checkpoint radica en su enfoque de cuantización elástica verificable: incluye un manifiesto con tamaños por shard y hashes SHA-256 fijados en el código del motor, además de métricas de paridad teacher-forced frente al checkpoint NVFP4 de referencia. No obstante, la ausencia de benchmarks estándar publicados y la dependencia de un motor propietario limitan su evaluación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B, familia qwen3_5); cuantizacion elastica por capas |
| Parametros totales | 17.529.593.344 (17,53 mil millones, segun safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el ejemplo de servicio usa `--max-ctx 8192` |
| Tipos de cuantizacion | ATLAS3 (3,5 bits/peso) y NVFP4; sin ATLAS2; checkpoint de 8 bits segun tags |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (3 shards, 12.182.467.884 bytes) |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura del modelo base Qwen/Qwen3.8-27B (etiquetado como qwen3_5 en los tags) y se deriva del checkpoint ya cuantizado nvidia/Qwen3.8-27B-NVFP4. No se trata de un modelo entrenado desde cero, sino de una recuantizacion elástica: el script `tools/quantize_elastic_qwen38.py` del repositorio Atlas3DSS/atlas-ingine asigna precision de forma diferenciada por tipo de tensor. Todas las capas MLP usan ATLAS3 (3,5 bits por peso), la atención "core" usa ATLAS3, las dos capas de atención de frontera usan NVFP4, y `embed_tokens` y `lm_head` usan NVFP4. No se incluyen tensores visuales ni de predicción multi-token.

No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens, ni sobre si el modelo base empleo RLHF o DPO; esos datos corresponden al modelo Qwen3.8-27B y no se detallan en la model card. La innovacion tecnica destacable es la cuantizacion elástica verificable: el repositorio incluye `atlas_elastic_manifest.json` con tamanos y hashes SHA-256 por shard, compilados en `qwen38_manifest.cpp` como `PinnedVerified`, y todos los ficheros estan cubiertos por `SHA256SUMS`. La verificacion de paridad se realizo con teacher forcing frente al checkpoint NVFP4 (139 tokens de prompt, 32 posiciones capturadas), obteniendo KLD media 0,1415, p99 0,8929, maximo 0,9670, coseno medio 0,9553 y acuerdo top-1 de 0,781 (25/32).

## Capacidades

- Generacion de texto conversacional y de proposito general, heredadas del modelo base Qwen3.8-27B.
- Razonamiento y generacion de codigo: capacidades propias del modelo base, no verificadas de forma independiente en este checkpoint.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el modelo base es multilingue, pero este checkpoint no declara idiomas.
- Modo thinking: no disponible en la informacion proporcionada.
- Vision: excluida explicitamente (tensores `visual` no incluidos).
- Prediccion multi-token (MTP): excluida explicitamente (tensores `mtp` no incluidos).
- Servicio mediante API HTTP compatible con OpenAI a traves de `ingine-serve`.

## Casos de uso

- Despliegue en GPUs de consumo de 12-16 GB: el checkpoint ocupa 11,35 GiB de pesos y alcanza 12,00 GiB de VRAM pico con contexto de 4K, por lo que puede ejecutarse en tarjetas como la RTX 4090 (24 GB) con margen amplio o en GPUs de 12 GB ajustando el contexto. Es el caso de uso principal declarado por el autor.
- Sustitucion de la linea base NVFP4 en entornos con VRAM limitada: permite reducir 7,42 GiB de VRAM frente a los 19,42 GiB del checkpoint NVIDIA, habilitando el mismo modelo en hardware inferior.
- Servicio de chat compatible con OpenAI: mediante `ingine-serve` con `--host 127.0.0.1 --port 8003 --max-ctx 8192` se expone un endpoint HTTP que puede integrarse en aplicaciones existentes que consuman la API de OpenAI.
- Prototipado e investigacion de cuantizacion: el manifiesto verificable, los hashes fijados y las metricas de paridad teacher-forced permiten reproducir y auditar el proceso de cuantizacion elástica en pipelines de investigacion.
- Inferencia en hardware Volta (V100): el autor valida el checkpoint en una Tesla V100-PCIE-32GB con ruta de computo FP16 (`sm_70`), lo que permite reutilizar GPUs antiguas de centros de datos.
- Evaluacion comparativa de packs elásticos: la familia incluye variantes de 17g, 14g y 11g con distintas asignaciones de precision, lo que facilita comparar el compromiso entre VRAM y fidelidad (KLD, coseno, top-1) en un mismo motor.
- Entornos con requisitos de integridad de artefactos: la verificacion SHA-256 por shard y el pinning en el codigo del motor son utiles en despliegues donde se exige trazabilidad del binario y de los pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card unicamente reporta metricas de paridad frente al checkpoint NVFP4 de referencia y medidas de throughput en hardware concreto:

| Metrica | Valor |
|---|---|
| KLD media (teacher-forced vs NVFP4) | 0,1415 |
| KLD p99 | 0,8929 |
| KLD maxima | 0,9670 |
| Coseno medio | 0,9553 |
| Acuerdo top-1 | 0,781 (25/32) |
| Prompt tokens / posiciones capturadas | 139 / 32 |
| Throughput prefill (V100 SM70) | 8,71 tok/s |
| Throughput decode (V100 SM70) | 7,92 tok/s |
| Tiempo de carga | 4,67 s |
| Smoke test HTTP (`ingine-serve`) | PASS, 7,7 tok/s determinista |

## Requisitos de hardware

- VRAM estimada: 11,35 GiB de pesos y 12,00 GiB de VRAM pico con contexto de 4K, medidos en una Tesla V100-PCIE-32GB.
- GPUs objetivo declaradas: rango de 12 GB a 16 GB de VRAM.
- GPUs validadas: NVIDIA Tesla V100-PCIE-32GB (`sm_70`, ruta FP16) y, para el pack hermano de 14g, RTX PRO 6000 (`sm_120a`). El build cubre arquitecturas `86;89;120a` (Ampere, Ada, Hopper, Blackwell: RTX 30/40/50, A100, H100, PRO 6000) y un preset legacy `sm_70` para V100 con CUDA 12.9.
- Cabe en GPU de consumo: si, en tarjetas de 12 GB o mas (por ejemplo RTX 4090 de 24 GB con margen amplio; en 12 GB el contexto maximo queda limitado por el overhead de KV cache).
- Opciones de despliegue: exclusivamente `atlas-ingine` (`ingine-serve` para API HTTP compatible con OpenAI, `ingine-bench` para benchmarking). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 8,71 tok/s en prefill y 7,92 tok/s en decode sobre V100 SM70; 7,7 tok/s en el smoke test HTTP. No se reportan cifras para GPUs Ampere, Ada, Hopper o Blackwell.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Peso / VRAM pico @ 4K | KLD media / top-1 | Licencia | Motor |
|---|---|---|---|---|---|---|
| Atlas3D/Qwen3.8-27B-atlas-11g-ingine (v3) | 17,53 B | No disponible (ejemplo 8192) | 11,35 GiB / 12,00 GiB | 0,1415 / 0,781 | Apache-2.0 | atlas-ingine |
| Atlas3D/Qwen3.8-27B-atlas-14g-ingine | No disponible | No disponible | 12,75 GiB / 12,64 GiB | 0,1323 / 0,8125 | Apache-2.0 | atlas-ingine |
| Atlas3D/Qwen3.8-27B-atlas-17g-ingine (v2) | No disponible | No disponible | 15,33 GiB / 15,97 GiB | 0,1640 / 0,750 | Apache-2.0 | atlas-ingine |
| nvidia/Qwen3.8-27B-NVFP4 (linea base) | No disponible | No disponible | 18,77 GiB / 19,42 GiB | Referencia | Apache-2.0 | NVFP4 estandar |

No se dispone de datos de benchmarks estandar que permitan comparar con alternativas de otros fabricantes o con el modelo base sin cuantizar; la comparativa se limita a los packs de la misma familia y a la linea base NVFP4.

## Limitaciones y advertencias

- Dependencia total del motor `atlas-ingine`: no hay soporte declarado para vLLM, llama.cpp, Ollama, TGI ni transformers estandar, lo que limita la portabilidad y obliga a compilar el motor desde el repositorio.
- Degradacion medible frente al checkpoint NVFP4: KLD media 0,1415, p99 0,8929 y maximo 0,9670, con acuerdo top-1 de solo 0,781 (25/32). La divergencia es apreciable en la cola de la distribucion.
- Sesgos conocidos: no documentados en la informacion proporcionada; al heredarse del modelo base, persisten los sesgos de Qwen3.8-27B, no evaluados en esta ficha.
- Riesgo de alucinacion: no evaluado de forma independiente para este checkpoint; la cuantizacion agresiva puede incrementarlo en tareas de razonamiento largo.
- Limitaciones de contexto e idioma: no se declara longitud de contexto nativa ni lista de idiomas; el ejemplo de servicio usa 8192 tokens, y el contexto maximo real dependera de la VRAM disponible para KV cache.
- Capacidades no confirmadas: tool calling, function calling, modo thinking y comportamiento agentico no estan verificados en la model card de este checkpoint.
- Exclusion de vision y MTP: el checkpoint es estrictamente text-only; no puede usarse para tareas multimodales ni aprovechar la prediccion multi-token del modelo base.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo base y el checkpoint NVFP4 de origen tambien son Apache-2.0; conviene revisar los terminos del modelo Qwen subyacente por si el autor original anade condiciones adicionales.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (27 de noviembre de 2026), por lo que no hay evidencia de uso en produccion.
- Verificacion: aunque se publican hashes SHA-256 y un manifiesto, la validacion de paridad se limita a 32 posiciones capturadas, una muestra reducida para conclusiones robustas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Atlas3D/Qwen3.8-27B-atlas-11g-ingine
- Pack hermano 17g: https://huggingface.co/Atlas3D/Qwen3.8-27B-atlas-17g-ingine
- Pack hermano 14g: https://huggingface.co/Atlas3D/Qwen3.8-27B-atlas-14g-ingine
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Checkpoint NVFP4 de origen: https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4
- Motor de inferencia: https://github.com/Atlas3DSS/atlas-ingine
