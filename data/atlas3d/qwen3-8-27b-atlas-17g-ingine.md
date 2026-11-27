# Atlas3D/Qwen3.8-27B-atlas-17g-ingine

## Resumen

`Atlas3D/Qwen3.8-27B-atlas-17g-ingine` es un checkpoint cuantizado en precisión mixta ("Elastic") del modelo de texto `Qwen/Qwen3.8-27B`, derivado a su vez del checkpoint NVFP4 de NVIDIA (`nvidia/Qwen3.8-27B-NVFP4`). Lo publica el usuario Atlas3D y está pensado exclusivamente para el motor de inferencia propietario `Atlas3DSS/atlas-ingine`, con el objetivo declarado de ocupar el menor espacio posible en GPUs de 24 GB manteniendo la máxima precisión en las capas de atención.

El modelo no introduce arquitectura nueva: es una reasignación de precisiones sobre los pesos del modelo base. Concretamente, las cuatro capas MLP de frontera usan NVFP4, las MLP centrales usan el formato propio ATLAS3 (3,5 bits por peso), todas las capas de atención usan FP8 y los tensores `embed_tokens` y `lm_head` usan NVFP4 con grupo de 16. El resultado son 16,45 GB en disco (15,33 GiB) repartidos en 4 shards, con un pico de VRAM medido de 15,97 GiB a 4K de contexto.

Es relevante ahora porque demuestra una vía práctica para desplegar un modelo de ~22.500 millones de parámetros en tarjetas de 24 GB con atención en FP8, ahorrando 3,45 GiB frente al checkpoint NVFP4 de referencia. La contrapartida es que depende de un runtime muy específico y no es directamente utilizable en vLLM, llama.cpp, TGI u Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.8, tag `qwen3_5`); cuantización mixta NVFP4 / ATLAS3 (3,5 b/w) / FP8 |
| Parametros totales | 22.516.882.944 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de servicio usa `--max-ctx 8192`; la verificación se hizo a 4K) |
| Tipos de cuantizacion | NVFP4 (MLP de frontera, `embed_tokens`, `lm_head` grupo-16), ATLAS3 3,5 b/w (MLP central), FP8 (todas las capas de atención) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (4 shards, 16.451.453.828 bytes), manifiesto `atlas_elastic_manifest.json`, `SHA256SUMS` |

## Arquitectura y entrenamiento

El checkpoint conserva la arquitectura del modelo base Qwen3.8-27B (transformer decoder-only de la familia Qwen3.5 según los tags) y solo modifica la representación numérica de los pesos. La asignación de precisión es jerárquica: se protege la atención completa en FP8 por su sensibilidad, se comprime más agresivamente la MLP central con ATLAS3 (3,5 bits por peso) y se mantienen las MLP de frontera y las proyecciones de embedding/salida en NVFP4. El alcance es solo texto: los tensores `visual` y `mtp` del modelo base se han excluido.

No hay entrenamiento adicional ni fine-tuning: es un proceso de cuantización post-entrenamiento ejecutado con `tools/quantize_elastic_qwen38.py` del repositorio `Atlas3DSS/atlas-ingine`. La validación se hace por "teacher forcing" contra el checkpoint NVFP4 de NVIDIA, midiendo divergencia KL, similitud coseno y acuerdo top-1 sobre 139 tokens de prompt y 32 posiciones capturadas. Los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) no se detallan en la información disponible.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento y generación de código heredados del modelo base Qwen3.8-27B; no se documentan evaluaciones específicas en este checkpoint.
- Solo texto: los tensores de visión (`visual`) y de predicción multi-token (`mtp`) están excluidos del checkpoint.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (el campo de idiomas no está rellenado).
- Servicio mediante API HTTP compatible con OpenAI a través de `ingine-serve`.

## Casos de uso

- Despliegue en GPUs de 24 GB con atención en FP8: el checkpoint encaja en tarjetas como RTX 4090 o L4 con 15,97 GiB de pico a 4K, permitiendo servir un modelo de 22.500 millones de parámetros donde el checkpoint NVFP4 de referencia (19,42 GiB) deja menos margen para caché KV.
- Inferencia en hardware Volta heredado: la verificación oficial se hizo en una Tesla V100-PCIE-32GB (`sm_70`) por la ruta FP16, lo que lo hace adecuado para infraestructura antigua que no soporta FP8 nativo pero sí el motor `atlas-ingine`.
- Servicio de chat interno con API compatible con OpenAI: `ingine-serve` expone un endpoint HTTP que se puede integrar en aplicaciones existentes que ya consumen la API de OpenAI, sin cambiar el cliente.
- Evaluación de técnicas de cuantización elástica: sirve como referencia reproducible para comparar la familia de packs `atlas-17g`, `atlas-14g` y `atlas-11g` con métricas de KLD y acuerdo top-1 publicadas.
- Generación de texto por lotes en pipelines de investigación: el throughput medido en V100 (10,71 tok/s de prefill, 8,42 tok/s de decode) permite estimar costes antes de mover cargas a GPUs más modernas (Ampere, Ada, Hopper, Blackwell).
- Verificación de integridad en producción: cada shard tiene SHA-256 fijado en el manifiesto y en `qwen38_manifest.cpp`, lo que facilita auditar despliegues y detectar corrupción de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos medidos son de paridad y throughput:

| Metrica | Valor |
|---|---|
| KLD media vs `Qwen3.8-27B-NVFP4` | 0,1640 |
| KLD p99 | 1,1045 |
| KLD maxima | 1,1378 |
| Similitud coseno media | 0,9731 |
| Acuerdo top-1 | 0,750 (24/32) |
| Prefill (V100 sm_70) | 10,71 tok/s |
| Decode (V100 sm_70) | 8,42 tok/s |
| Tiempo de carga | 5,48 s |
| VRAM pico a 4K | 15,97 GiB |

## Requisitos de hardware

- VRAM estimada: 15,33 GiB de pesos y 15,97 GiB de pico a 4K de contexto.
- GPU objetivo: tarjetas de 24 GB (RTX 4090, L4, A10G) y superiores; la verificación se realizó en V100-PCIE-32GB.
- Compilación recomendada para Ampere, Ada, Hopper y Blackwell: `-DCMAKE_CUDA_ARCHITECTURES="86;89;120a"`.
- Ruta específica para Volta: preset `legacy-fp16` con CUDA 12.9 (`sm_70`).
- Cabe en GPU de consumo: sí, en RTX 4090 y RTX 3090 de 24 GB, siempre que se use `atlas-ingine`.
- Opciones de despliegue: exclusivamente `atlas-ingine` (`ingine-serve` para API HTTP compatible con OpenAI, `ingine-bench` para medición). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 10,71 tok/s de prefill y 8,42 tok/s de decode en V100; no se publican cifras para otras GPUs.

## Comparativa con modelos similares

| Modelo | Parametros | Peso en disco | VRAM pico @4K | KLD media | Licencia | Runtime |
|---|---|---:|---:|---:|---|---|
| `Atlas3D/Qwen3.8-27B-atlas-17g-ingine` | 22,5 B | 16,45 GB | 15,97 GiB | 0,1640 | Apache-2.0 | `atlas-ingine` |
| `Atlas3D/Qwen3.8-27B-atlas-14g-ingine` | 22,5 B | 13,69 GB | 12,64 GiB | 0,1323 | Apache-2.0 | `atlas-ingine` |
| `Atlas3D/Qwen3.8-27B-atlas-11g-ingine` | 22,5 B | 12,18 GB | 12,00 GiB | 0,1415 | Apache-2.0 | `atlas-ingine` |
| `nvidia/Qwen3.8-27B-NVFP4` (referencia) | 22,5 B | 18,77 GiB | 19,42 GiB | 0 (referencia) | Apache-2.0 | no disponible |

## Limitaciones y advertencias

- Dependencia de runtime: solo funciona con `atlas-ingine`; no es cargable en vLLM, llama.cpp, Ollama ni TGI, lo que limita portabilidad y ecosistema de herramientas.
- Paridad imperfecta con el modelo de referencia: KLD media de 0,1640 y acuerdo top-1 de solo el 75 % (24/32 posiciones), con un pico de KLD de 1,1378; puede degradar tareas sensibles a la precisión numérica.
- Sin datos de idiomas: el campo de idiomas no está rellenado, por lo que no se puede garantizar cobertura multilingüe más allá de la del modelo base.
- Sin datos de benchmarks estándar: no hay MMLU, HumanEval ni GSM8K publicados para este checkpoint, solo métricas de paridad.
- Contexto máximo no documentado: el ejemplo de servicio usa 8192 tokens y la verificación se hizo a 4K; no se confirma el límite real soportado.
- Modelo solo texto: los tensores de visión y de predicción multi-token están excluidos, así que no hereda capacidades multimodales del base.
- Sesgos y alucinaciones: no se documentan evaluaciones de sesgo ni de tasa de alucinación para este checkpoint; se heredan los del modelo base Qwen3.8-27B, no caracterizados aquí.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base y del checkpoint NVFP4 de origen, también Apache-2.0 según la model card.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; es un artefacto reciente sin validación independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Atlas3D/Qwen3.8-27B-atlas-17g-ingine
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Checkpoint NVFP4 de origen: https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4
- Motor de inferencia: https://github.com/Atlas3DSS/atlas-ingine
- Pack `atlas-14g`: https://huggingface.co/Atlas3D/Qwen3.8-27B-atlas-14g-ingine
- Pack `atlas-11g`: https://huggingface.co/Atlas3D/Qwen3.8-27B-atlas-11g-ingine
