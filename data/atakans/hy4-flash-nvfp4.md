# atakans/Hy4-flash-NVFP4

## Resumen

Hy4-flash NVFP4 es una compilación cuantizada en NVFP4 del modelo multimodal tencent/Hy4-flash, publicada por el usuario atakans. El modelo base es un transformer con mezcla de expertos (MoE) de 144.761.604.413 parámetros totales, con 512 expertos enrutados por capa (16 activos) y una arquitectura que incorpora tablas Engram de búsqueda por hash, un indexador disperso de atención y un borrador especulativo DFly2. Esta versión reduce el checkpoint de 440 GB en BF16 a 164,7 GB manteniendo en BF16 las partes sensibles (atención, router, torre de visión, embeddings y drafter).

La relevancia de esta ficha es doble. Por un lado, demuestra una receta práctica de cuantización NVFP4 con NVIDIA ModelOpt 0.48.0 sobre un MoE de gran tamaño, con calibración en 8 x RTX PRO 6000 Blackwell Max-Q y verificación a nivel de pesos (9,5 % de error relativo en expertos, 2,6 % de RMS en tablas Engram). Por otro, documenta un despliegue real en dos DGX Spark (2 x 128 GB) con vLLM, tensor parallel 2 y expert parallel, alcanzando 38,3 tok/s en decodificación con prompts JSON y unos 15 tok/s sin el drafter.

El modelo está pensado para inferencia multimodal image-text-to-text con contexto de 262.144 tokens en la configuración medida. No obstante, su adopción está limitada por la licencia Tencent Hy, la ausencia de soporte upstream en vLLM (el PR vllm-project/vllm#68296 sigue abierto y solo acepta FP8) y la necesidad de parches locales en el kernel de atención para SM120.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención dispersa (sparse MLA), tablas Engram y drafter especulativo DFly2 |
| Parámetros totales | 144.761.604.413 |
| Parámetros activos | 16 expertos activos de 512 por capa (no se especifica el total de parámetros activos) |
| Longitud de contexto | 262.144 tokens en la configuración medida |
| Tipos de cuantización | NVFP4 (W4A4, E2M1 con escala FP8 E4M3 cada 16 elementos y escala FP32 por tensor) para MLPs y expertos; FP8 E4M3 con escala BF16 por fila para tablas Engram; BF16 para atención, indexador, router, proyecciones latentes, embeddings, lm_head, torre de visión y drafter |
| Idiomas soportados | no disponible |
| Licencia | tencent-hy-license (Tencent Hy License) |
| Formato de pesos | safetensors (U8 para NVFP4, F8_E4M3 para escalas y Engram, BF16, F32, I32) |

## Arquitectura y entrenamiento

El modelo base Hy4-flash de Tencent combina una arquitectura MoE con 512 expertos enrutados por capa (16 activos) y un experto compartido, además de una MLP densa en la capa 0. Incorpora atención con sink aprendible y un indexador disperso (sparse MLA), tablas Engram en las capas 2, 12, 22 y 32 (165 millones de filas de 96 dimensiones cada una) que funcionan como búsquedas hash en lugar de multiplicaciones matriciales, y un drafter especulativo DFly2 con 5 tokens de borrador. La torre de visión está en BF16 y habilita la modalidad image-text-to-text.

Esta compilación concreta no reentrena el modelo: aplica cuantización post-entrenamiento con NVIDIA ModelOpt 0.48.0 usando `NVFP4_DEFAULT_CFG` más reglas BF16 para las partes no cuantizadas. La calibración emplea el mix `nemotron-post-training-v3` de NVIDIA (128 muestras de hasta 2.048 tokens, cubriendo chat, ciencia, código, uso agéntico, matemáticas, SWE y texto multilingüe). Las escalas de pesos NVFP4 se derivan solo de los pesos; las de activación provienen de la calibración. Las tablas Engram se convierten en una pasada separada a FP8 con escala por fila (valor = fila x escala, escala = máximo de fila / 448). El proceso completo tomó 42 minutos de calibración y 5 de exportación en 8 x RTX PRO 6000 Blackwell Max-Q.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 262.144 tokens en la configuración medida.
- Procesamiento image-text-to-text gracias a la torre de visión conservada en BF16.
- Razonamiento con modo thinking configurable mediante `reasoning_effort` (la evaluación publicada usa `no_think`).
- Generación de código y tareas de SWE, evidenciado por los conjuntos de calibración y las pruebas de decodificación con prompts de código.
- Razonamiento matemático y científico, reflejado en la calibración con conjuntos de matemáticas y ciencia.
- Capacidades agénticas y de uso de herramientas, según la composición del dataset de calibración (agentic use).
- Decodificación especulativa integrada mediante el drafter DFly2 con 5 tokens de borrador.
- Soporte multilingüe inferido del conjunto de calibración multilingüe, aunque no se detallan los idiomas exactos.
- Compatibilidad con endpoints (tag `endpoints_compatible`).

## Casos de uso

- Asistencia conversacional de largo contexto: el modelo puede mantener conversaciones multi-turno con hasta 262.144 tokens, adecuado para atención al cliente con historial extenso o análisis de documentos largos en una sola ventana.
- Generación de código en pipelines: los prompts de código alcanzan 36,5 tok/s con 3,80 tokens aceptados por paso del drafter, lo que permite integrarlo en herramientas de autocompletado o revisión de código en entornos con dos DGX Spark.
- Extracción y generación de JSON estructurado: es el caso con mejor rendimiento medido (38,3 tok/s, 3,99 tokens aceptados), útil para pipelines de extracción de datos, clasificación y APIs que requieren salidas estructuradas.
- Reescritura y edición de textos: 36,1 tok/s con 3,79 tokens aceptados, aplicable a sistemas de resumen, traducción o reescritura de documentación técnica.
- Razonamiento científico y matemático: la puntuación de 72,7 % en GPQA Diamond con thinking desactivado lo sitúa como candidato para asistentes de investigación y resolución de problemas técnicos.
- Procesamiento de documentos con imagen y texto: la torre de visión en BF16 permite tareas de image-text-to-text como descripción de figuras, extracción de información de capturas o análisis de diagramas.
- Despliegue en hardware de borde de altas prestaciones: la receta para dos DGX Spark con vLLM, TP=2 y expert parallel demuestra viabilidad en entornos con 2 x 128 GB de memoria unificada.

## Benchmarks y rendimiento

Rendimiento de decodificación medido en dos DGX Spark con vLLM, TP=2 sobre QSFP (RoCE), expert parallel, DFly con 5 tokens de borrador, caché KV `fp8_ds_mla`, 262.144 tokens de contexto, un usuario y thinking desactivado (2026-11-18):

| Prompt (300 tokens de salida, mediana de 3) | Decode tok/s | Tokens aceptados por paso DFly |
|---|---|---|
| JSON | 38,3 | 3,99 |
| Code | 36,5 | 3,80 |
| Rewrite | 36,1 | 3,79 |
| Explain | 25,0 | 2,75 |
| Story | 17,3 | 1,85 |

Sin el drafter: aproximadamente 15 tok/s.

| Profundidad del prompt | Prefill tok/s | Decode tok/s, primer turno | Decode tok/s, segundo turno |
|---|---|---|---|
| 4K | 1.110 | 20,8 | 29,6 |
| 16K | 1.403 | 22,1 | 36,8 |
| 32K | 1.461 | 26,6 | 27,0 |

Calidad con thinking desactivado (`reasoning_effort: no_think`), temperatura 0, hasta 16.384 tokens por respuesta:

| Benchmark | Puntuación | Intervalo 95 % | Respuestas cortadas por límite |
|---|---|---|---|
| GPQA Diamond (198) | 72,7 % | 66,1 a 78,5 | 1 |
| IFEval (541 prompts) | 83,5 % | 80,2 a 86,4 | 1 |

El autor indica que no dispone de ejecuciones BF16 o FP8 de Hy4-flash en el mismo harness para comparar, ya que ninguna de las dos cabe en dos DGX Spark. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 164,7 GB (153,4 GiB). En la configuración medida, los pesos cargan en 104 s con 51,7 GiB en el lado GPU de cada Spark más la mitad de las tablas Engram en memoria de host.
- GPU recomendadas: 2 x DGX Spark (2 x 128 GB) con vLLM, tensor parallel 2 y expert parallel. La cuantización se generó en 8 x RTX PRO 6000 Blackwell Max-Q.
- Cabe en GPU consumer: no en una sola GPU consumer; requiere al menos dos nodos DGX Spark o hardware equivalente con memoria unificada suficiente.
- Caché KV: con 6 GiB de caché KV (578K tokens) la memoria libre mínima fue de 12,5 GiB en un Spark y 13,0 GiB en el otro.
- Opciones de despliegue: vLLM con la imagen oficial `vllm/vllm-openai:hy4-flash` (commit 77766db) más cinco cambios locales en Python; el soporte upstream es un PR abierto (vllm-project/vllm#68296) que solo acepta FP8 y requiere Hopper o Blackwell de centro de datos para atención. La receta está en el repositorio `atakann/dgx-spark-recipes` (`llm/hy4-flash-nvfp4-vllm-tp2`).
- Latencia y throughput: 38,3 tok/s en JSON y 17,3 tok/s en story con drafter; aproximadamente 15 tok/s sin drafter; prefill de 1.110 a 1.461 tok/s según profundidad de prompt.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-flash NVFP4 (esta ficha) | 144.761.604.413 | 262.144 | NVFP4 + FP8 Engram + BF16 | tencent-hy-license | Hugging Face, 408 descargas |
| tencent/Hy4-flash BF16 | 144.761.604.413 | no disponible | BF16 (440 GB) | tencent-hy-license | Hugging Face (modelo base) |
| tencent/Hy4-flash FP8 (Tencent) | 144.761.604.413 | no disponible | FP8 (287 GB) | tencent-hy-license | Hugging Face (modelo base) |

No se dispone de datos de benchmarks comparables entre estas variantes en la misma máquina, ya que el autor indica que ni BF16 ni FP8 caben en dos DGX Spark. No se han identificado en la información proporcionada otros modelos de la misma categoría con los que establecer una comparación cuantitativa.

## Limitaciones y advertencias

- No hay soporte upstream en vLLM: el PR vllm-project/vllm#68296 sigue abierto y solo acepta FP8; ejecutar esta compilación requiere cinco parches locales en Python y el kernel SM120 sparse MLA de FlashInfer.
- La atención necesita Hopper o Blackwell de centro de datos en el código upstream; esta compilación usa el kernel SM120 para DGX Spark.
- Los benchmarks publicados (GPQA Diamond 72,7 %, IFEval 83,5 %) corresponden a una única configuración de dos DGX Spark con thinking desactivado y hasta 16.384 tokens por respuesta, con una respuesta cortada por límite en cada prueba; no hay comparación con BF16 o FP8 en el mismo harness.
- Las verificaciones realizadas son a nivel de pesos (9,5 % de error relativo en expertos, 2,6 % de RMS en tablas Engram), no a nivel de calidad de extremo a extremo frente al modelo base.
- La licencia Tencent Hy puede imponer restricciones al uso comercial; es necesario revisar el enlace de licencia del modelo base antes de desplegarlo en producción.
- No se detallan los idiomas soportados, por lo que el rendimiento multilingüe no está caracterizado.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones específicas de sesgo o toxicidad en la información disponible.
- El tag "8-bit" de Hugging Face es engañoso: los pesos NVFP4 se almacenan como U8 con dos valores E2M1 por byte, por lo que el conteo de parámetros mostrado es la mitad del real.
- El tamaño del repositorio (164,7 GB) y la necesidad de dos nodos con memoria unificada limitan su despliegue a infraestructuras especializadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/atakans/Hy4-flash-NVFP4
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Licencia del modelo base: https://huggingface.co/tencent/Hy4-flash/blob/main/LICENSE
- Recetas de despliegue en DGX Spark: https://github.com/atakann/dgx-spark-recipes
- Pull request de soporte en vLLM: https://github.com/vllm-project/vllm/pull/68296
- NVIDIA ModelOpt: no disponible en la información proporcionada
