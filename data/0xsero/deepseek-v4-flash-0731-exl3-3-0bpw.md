# 0xSero/DeepSeek-V4-Flash-0731-EXL3-3.0bpw

## Resumen

Este repositorio contiene una cuantización **EXL3 a 3.0 bpw** del modelo **DeepSeek-V4-Flash-0731** de DeepSeek, realizada por el usuario 0xSero. El objetivo es reducir el footprint de memoria del checkpoint original (publicado en FP8) para facilitar su ejecución en hardware con VRAM limitada, manteniendo en lo posible la calidad del modelo base. Se trata de un modelo de **70.042 millones de parámetros** con arquitectura de mezcla de expertos (MoE), según los metadatos del repositorio.

La relevancia de esta publicación es doble: por un lado, demuestra un flujo de cuantización EXL3 con codebook `mcg` y representación E2M1 FP4 con escalas UE8M0 sobre un modelo MoE de gran tamaño; por otro, es un artefacto **experimental y no validado en runtime**. La model card indica explícitamente que la generación extremo a extremo en una H200 no llegó a completarse (fallo en la exportación del host-DSO de TileLang), por lo que no se reclama compatibilidad drop-in con runtimes convencionales. El despliegue práctico se ha explorado en un NVIDIA DGX Spark mediante el stack SparkInfer, con los pesos rank-sliced en disco y coalescidos a TP1.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con atención MLA, según el repo de despliegue asociado |
| Parametros totales | 70.042.310.590 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la model card; el repo de despliegue asociado menciona una caché MLA de 262.144 tokens |
| Tipos de cuantizacion | 3.0 bpw EXL3 (este repo); el modelo base se distribuye en FP8 |
| Idiomas soportados | no disponible |
| Licencia | MIT (este repo); la licencia del modelo base upstream se mantiene |
| Formato de pesos | safetensors (EXL3, layout rank-sliced TP4) |

## Arquitectura y entrenamiento

El modelo base, DeepSeek-V4-Flash-0731, es un transformer de mezcla de expertos con atención MLA (Multi-head Latent Attention), según se desprende del repositorio de despliegue asociado. Este repositorio no modifica la arquitectura, sino que cambia la representación de los pesos: aplica una cuantización EXL3 a 3.0 bpw con codebook `mcg`, usando una representación fuente empaquetada E2M1 FP4 con escalas UE8M0 y un layout de pesos de expertos rank-sliced para TP4.

La calibración de la cuantización utilizó **1.146.665 tokens** distribuidos en cuatro ejes: lenguaje general, texto legal, código y tareas agénticas, y razonamiento con comportamiento de terminación. El routing de expertos se observó de forma natural, sin forzar la activación de expertos concretos. El artefacto resultante consta de 177 archivos de pesos (124.867.114.600 bytes, unos 116,29 GiB) y 534.653 registros de tensores, con un manifiesto SHA-256 por archivo y un registro de cobertura de calibración.

## Capacidades

- Generación de texto y código, razonamiento y tareas agénticas, según los ejes de calibración empleados.
- Routing natural de expertos en la cuantización, sin activación forzada.
- Soporte de tool calling y function calling: no documentado en la model card.
- Capacidades multilingües: no documentadas.
- Capacidades especiales (visión, audio, thinking mode): no documentadas.
- El checkpoint está diseñado para ejecutarse con una implementación ExLlamaV3/EXL3 que entienda el layout rank-sliced TP4; no se reclama compatibilidad con runtimes estándar.

## Casos de uso

- Despliegue en un NVIDIA DGX Spark: el repositorio asociado `0xSero/deepseek-v4-flash-0731-spark-sparkinfer` proporciona una receta Docker para servir este checkpoint en un único DGX Spark, manteniendo los pesos rank-sliced en disco y coalesciéndolos a TP1, con una caché MLA de 262.144 tokens usando registros NVFP4 de 432 bytes.
- Evaluación de calidad de cuantización 3-bit en modelos MoE: al ser un artefacto experimental, permite comparar la degradación de calidad frente al checkpoint FP8 original en tareas de código, razonamiento y lenguaje.
- Investigación sobre formatos de cuantización EXL3: el uso de codebook `mcg` y representación E2M1 FP4 con escalas UE8M0 puede servir de referencia para otros proyectos de cuantización.
- Pruebas de integración con el stack SparkInfer (antes b12x) en hardware DGX Spark, para medir latencia y throughput con caché KV de contexto largo.
- Validación de pipelines de verificación estructural: el repositorio incluye manifiestos SHA-256 y registros de cobertura de calibración, útiles para auditar la integridad de artefactos cuantizados.
- Estudio de routing natural de expertos durante la calibración, sin forzar activaciones, para analizar el comportamiento de los expertos en tareas específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad (MMLU, HumanEval, GSM8K, etc.) ni mediciones de latencia o throughput. El único dato de rendimiento indirecto es que la carga del modelo y la compilación de kernels CUDA en una H200 se alcanzaron, pero la generación extremo a extremo no se completó.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos 116,29 GiB solo para los pesos, más el overhead de la caché KV y los buffers de activación. En la práctica se necesita un dispositivo con 128 GB o más de memoria.
- GPU recomendadas: NVIDIA H200 (141 GB) se utilizó para la campaña de cuantización y la carga del modelo; el despliegue práctico se ha probado en un NVIDIA DGX Spark (128 GB de memoria unificada).
- No cabe en GPUs de consumo: las tarjetas consumer más grandes (RTX 4090, 24 GB) son insuficientes para este checkpoint.
- Opciones de despliegue: ExLlamaV3/EXL3 (requiere una implementación que entienda el layout rank-sliced TP4) y SparkInfer (receta Docker para DGX Spark). No es compatible con vLLM, llama.cpp u Ollama sin adaptaciones específicas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Estado |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-0731 (base) | 70.042.310.590 | no disponible (262K según repo de despliegue) | FP8 | MIT (upstream) | Checkpoint original, sin cuantizar |
| 0xSero/DeepSeek-V4-Flash-0731-EXL3-3.0bpw (este repo) | 70.042.310.590 | no disponible (262K según repo de despliegue) | 3.0 bpw EXL3 | MIT | Experimental, no validado en runtime |
| 0xSero/DeepSeek-V4-Flash-0731-REAP | 193.000.000.000 (aprox.) | 1.024.000 | no disponible | MIT | Modelo REAP del mismo autor, mayor tamaño |

La comparativa se limita a los modelos del mismo autor y al checkpoint base, ya que no se dispone de datos de benchmarks para establecer comparaciones cuantitativas con otras alternativas de la misma categoría.

## Limitaciones y advertencias

- **No validado en runtime**: la model card indica que la generación extremo a extremo en H200 no se completó (fallo en la exportación del host-DSO de TileLang con el error "Target triple should not be empty"). No se reclama ningún resultado de generación exitoso.
- **Compatibilidad restringida**: requiere una implementación ExLlamaV3/EXL3 que entienda el layout rank-sliced TP4. No es drop-in compatible con runtimes mainstream.
- **Riesgo de alucinación y sesgos**: no documentados para este checkpoint; se heredan del modelo base, cuyas limitaciones no se detallan en la model card.
- **Licencia**: aunque este repositorio se publica bajo MIT, la model card advierte que la licencia del modelo base upstream, sus términos de uso aceptable y sus limitaciones continúan aplicando. El cambio de representación de pesos no altera la licencia subyacente.
- **Uso en producción**: desaconsejado hasta que se valide la generación en el runtime objetivo y se verifique el comportamiento de salida estructurada, tal como advierte el propio autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/0xSero/DeepSeek-V4-Flash-0731-EXL3-3.0bpw
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Repo de despliegue en un DGX Spark (SparkInfer): https://github.com/0xSero/deepseek-v4-flash-0731-spark-sparkinfer
- Repo de despliegue en dos DGX Spark (FP8 original): https://github.com/MiaAI-Lab/DeepSeek-v4-Flash-DSpark-2x-DGX-Spark
- Repo de despliegue en un DGX Spark (MiaAI-Lab): https://github.com/MiaAI-Lab/DeepSeek-v4-Flash-One-DGX-Spark
- Referencia de cuantización EXL3: https://huggingface.co/brandonmusic/GLM-5.2-EXL3-TR3-3.0bpw
- Proyecto ExLlamaV3: https://github.com/turboderp-org/exllamav3
- Ficha en llm-explorer (modelo REAP del mismo autor): https://llm-explorer.com/model/0xSero%2FDeepSeek-V4-Flash-0731-REAP,6ULel5zNoKyeqoGmgAMTY7
