# seekr-org/Inkling-2-Mini-FP8-ROCm

## Resumen

Inkling 2 Mini FP8 ROCm es una conversión cuantizada del modelo multimodal Inkling 2 Mini desarrollado por Thinking Machines Lab, publicada por seekr-org. Se trata de una adaptación específica para hardware AMD, concretamente para el acelerador MI300X (arquitectura gfx942), que transforma los tensores de los expertos del modelo original desde formatos NVFP4 y MXFP8 hasta FP8 E4M3FNUZ, el formato nativo de las GPU AMD Instinct de nueva generación. El modelo base es un transformer de tipo mezcla de expertos (MoE) con capacidad de visión, orientado a tareas de razonamiento, conversación e image-text-to-text.

El checkpoint contiene 26.402.797.056 parámetros totales según los pesos en safetensors, con un tamaño de repositorio de aproximadamente 29 GB, lo que refleja la compresión lograda por la cuantización FP8 respecto a los pesos originales. Incluye además un draft model DSpark (`mtp.safetensors`) para decodificación especulativa, lo que permite acelerar la generación mediante predicción de tokens candidatos verificados por el modelo principal. La licencia es Apache 2.0, heredada del checkpoint upstream.

Su relevancia actual radica en que cubre un hueco práctico: permite desplegar un modelo MoE multimodal de tamaño medio en infraestructura AMD Instinct mediante vLLM con soporte ROCm, un ecosistema con menos conversiones optimizadas que el de NVIDIA. El autor documenta mediciones de rendimiento concretas en un MI300X único, con throughput de decodificación de hasta 1.190,9 tokens/s con concurrencia 8 en documentos técnicos, lo que lo hace interesante para equipos que operan clústeres AMD.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (visión + texto), con draft DSpark para decodificación especulativa |
| Parámetros totales | 26.402.797.056 |
| Parámetros activos | no disponible |
| Longitud de contexto | hasta 33.280 tokens en la configuración validada (prompt de 32.768 tokens más generación) |
| Tipos de cuantización | FP8 E4M3FNUZ con escalas de peso FP32 power-of-two por canal de salida de experto; activaciones FP8 dinámicas por token con amax scaling; pesos no-expertos y de visión en precisión upstream |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (incluye `mtp.safetensors` para el draft DSpark) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos (MoE) con capacidades multimodales de imagen y texto, según indican las etiquetas del repositorio (`moe`, `vision`, `image-text-to-text`). La conversión realizada por seekr-org afecta exclusivamente a los 48 tensores de proyección de expertos, que pasan de NVFP4 y MXFP8 a FP8 E4M3FNUZ, con una escala de peso FP32 power-of-two por cada canal de salida de experto y activaciones FP8 dinámicas por token con escalas amax. Los pesos no-expertos, incluidos los de atención de texto y visión, mantienen la precisión upstream.

El proceso de conversión abarcó 24.460 millones de valores de expertos y midió un error de reconstrucción RMS relativo del 2,41 % frente a los pesos cuantizados originales. El manifiesto `conversion_manifest.json` documenta los ajustes de escala, estadísticas de conversión y huellas de los shards. El checkpoint incorpora un draft model DSpark (`mtp.safetensors`) para decodificación especulativa, configurable en vLLM con `num_speculative_tokens: 7` y muestreo probabilístico. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original.

## Capacidades

- Generación de texto conversacional multi-turno con soporte de razonamiento (parser `inkling` en vLLM).
- Procesamiento de imágenes y texto combinados (pipeline image-text-to-text), con soporte de hasta 2 imágenes por prompt en la configuración validada.
- Razonamiento aritmético y resolución de problemas matemáticos: el autor reporta 19 de 20 aciertos en una muestra pequeña de cinco ejemplos de GSM8K.
- Reconocimiento de formas en imágenes individuales y ordenación de dos imágenes, según las pruebas de validación del autor.
- Decodificación especulativa mediante el draft DSpark, que acelera la generación.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente, aunque el modo de razonamiento está presente vía el parser `inkling`.

## Casos de uso

- Análisis de documentos técnicos extensos: con contexto de hasta 33.280 tokens, el modelo puede ingerir manuales, especificaciones o informes completos y responder preguntas sobre ellos sin fragmentación. El autor midió 246,3 tokens/s en decodificación con concurrencia 1 en este tipo de carga.
- Procesamiento por lotes de documentación técnica: con concurrencia 8 alcanza 1.190,9 tokens/s de decodificación y 122,2 tokens/s end-to-end, adecuado para pipelines de extracción de información sobre grandes volúmenes de documentos.
- Generación de prosa y contenido redactado: el modelo mantiene 645,5 tokens/s de decodificación con concurrencia 8 en cargas de prosa, útil para sistemas de generación de contenido editorial.
- Asistencia multimodal con imágenes: al aceptar hasta 2 imágenes por prompt, sirve para tareas de descripción, comparación y ordenación de imágenes, como clasificación visual o verificación de capturas.
- Razonamiento aritmético asistido: los resultados en GSM8K lo hacen apto para asistentes de cálculo, tutoría matemática o validación de operaciones en flujos de trabajo.
- Despliegue en infraestructura AMD Instinct: equipos con clústeres MI300X pueden servir el modelo con vLLM ROCm sin necesidad de conversiones manuales, aprovechando el soporte de FP8 row-scaled validado por el autor.
- Evaluación comparativa de cuantizaciones: el manifiesto de conversión y los resultados de validación permiten reproducir y auditar el impacto de la cuantización FP8 sobre el modelo original.

## Benchmarks y rendimiento

El autor publica mediciones de throughput en un único AMD MI300X (gfx942) con 32.768 tokens de entrada y 384 tokens generados por petición:

| Carga | Concurrencia | Tokens/s decodificación | Tokens/s salida end-to-end |
|---|---:|---:|---:|
| Documentos técnicos | 1 | 246,3 | 88,8 |
| Documentos técnicos | 8 | 1.190,9 | 122,2 |
| Prosa | 8 | 645,5 | 106,9 |

En calidad, el autor reporta 19 de 20 aciertos en una muestra de cinco ejemplos de GSM8K, además de pruebas superadas de aritmética textual, reconocimiento de formas en imagen única, ordenación de dos imágenes y una prueba con prompt de 32.749 tokens. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa aproximadamente 29 GB, por lo que la inferencia requiere al menos esa cantidad más overhead de KV cache y activaciones. La configuración validada usa `--gpu-memory-utilization 0.65`, lo que sugiere un margen amplio sobre los 192 GB HBM3 del MI300X.
- GPU recomendadas: AMD Instinct MI300X (gfx942) es la plataforma validada. No se documenta soporte para otras GPU AMD ni para NVIDIA en esta conversión concreta.
- GPU de consumo: no disponible; no se reporta compatibilidad con GPU consumer, y el formato FP8 E4M3FNUZ es específico de hardware AMD CDNA3.
- Despliegue: vLLM con build ROCm que incluya soporte para Inkling 2 Mini y FP8 row prequantizado (commit de referencia `391877c0f3` del branch de Seekr). Variables de entorno requeridas: `HIP_FORCE_DEV_KERNARG=0`, `OMP_NUM_THREADS=1`, `VLLM_ROCM_USE_AITER=1`.
- Latencia y throughput: ver tabla de benchmarks; con concurrencia 1 en documentos técnicos se obtienen 246,3 tokens/s de decodificación y 88,8 tokens/s end-to-end.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Hardware objetivo | Notas |
|---|---|---|---|---|---|
| Inkling 2 Mini FP8 ROCm (este) | 26,4 B | hasta 33.280 tokens validados | Apache 2.0 | AMD MI300X (ROCm) | Conversión FP8 E4M3FNUZ con draft DSpark |
| Inkling 2 Mini (upstream) | no disponible en la información | no disponible | Apache 2.0 | no disponible | Modelo original de Thinking Machines Lab, multimodal MoE |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de comparación en la información proporcionada |

No se dispone de información sobre modelos comparables de la misma categoría en los datos proporcionados, por lo que no es posible establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- La conversión FP8 introduce un error de reconstrucción RMS relativo del 2,41 % en los pesos de expertos frente al modelo original; puede degradar ligeramente la calidad en tareas sensibles a la precisión numérica.
- La validación de calidad es limitada: 20 ejemplos de GSM8K y pruebas puntuales de visión no constituyen una evaluación exhaustiva; no hay benchmarks estándar publicados.
- El soporte está restringido a hardware AMD MI300X y a un build específico de vLLM ROCm (commit `391877c0f3`); no se garantiza funcionamiento en otras GPU ni en versiones distintas de vLLM.
- La configuración validada limita a 2 imágenes por prompt y desactiva prefix caching y KV cache extensible, lo que puede afectar al rendimiento en cargas con prompts repetidos.
- No se dispone de información sobre sesgos, idiomas soportados ni riesgos de alucinación específicos del modelo base.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo upstream y de los datos de entrenamiento originales antes de un uso comercial en producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una publicación reciente sin validación comunitaria amplia.

## Enlaces

- Hugging Face: https://huggingface.co/seekr-org/Inkling-2-Mini-FP8-ROCm
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Revisión upstream referenciada: https://huggingface.co/thinkingmachines/Inkling-2-Mini/tree/7a67ae2314b44ef05c87fd1d4d311c58aaeb18f6
- README upstream preservado: UPSTREAM_README.md (en el repositorio)
- Manifiesto de conversión: conversion_manifest.json (en el repositorio)
- Resultados de validación: validation_results.json (en el repositorio)
- Licencia: LICENSE (en el repositorio)
