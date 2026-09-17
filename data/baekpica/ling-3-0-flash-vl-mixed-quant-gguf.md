# Baekpica/Ling-3.0-flash-VL-Mixed-Quant-GGUF

## Resumen

Ling-3.0-flash-VL-Mixed-Quant-GGUF es una conversión a GGUF en precisión mixta del checkpoint multimodal inclusionAI/Ling-3.0-flash-VL, publicada por el usuario Baekpica. No es un modelo entrenado desde cero: es una receta de cuantización asimétrica por rol de tensor sobre el modelo base, fijada a la revisión `554184d95863a873051e8d8ccdb08c32c2c53a03`. El resultado ocupa 84.098.971.680 bytes (78,3233 GiB) en disco, con una torre de lenguaje de 124.400 millones de parámetros a 5,3512 bits por peso efectivos y una torre de visión más proyector que se mantienen íntegramente en BF16.

La relevancia del artefacto está en que busca que un modelo de 124B de parámetros quepa residente en un único acelerador con memoria unificada, en concreto el NVIDIA DGX Spark. Para lograrlo, todos los tensores de la ruta crítica recurrente (proyecciones de decaimiento y puerta KDA, ambas familias de atención, el experto compartido siempre activo, la FFN densa inicial y la torre de visión completa) se conservan en BF16, y todo el presupuesto de cuantización se gasta en los expertos enrutados de 512 vías, que concentran el 97,1% de los parámetros.

El modelo base pertenece a la familia `bailingmoe3` y combina atención lineal KDA con atención MLA absorbida, además de una torre visual y un contexto nativo de 131.072 tokens. El artefacto se distribuye con licencia MIT, está pensado para servirse con el runtime `ds4-dfm-rs` y no dispone de bloque MTP (predictor multi-token), por lo que no hay decodificación especulativa propia de la familia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `bailingmoe3`: MoE con 512 expertos enrutados, experto compartido siempre activo, FFN densa inicial, atención lineal KDA y atención MLA absorbida; torre de visión más proyector |
| Parámetros totales | 124.414.211.552 (124,4B), dato real de safetensors del modelo base |
| Parámetros activos | no disponible |
| Longitud de contexto | 131.072 tokens (contexto nativo) |
| Tipos de cuantización | GGUF con receta mixta por rol de tensor; variante publicada `MQ-Q5-KDA-ViT-BF16` a 5,3512 BPW efectivos (torre de lenguaje), torre de visión y proyector en BF16. Sin matriz de importancia (`imatrix`) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF |
| Tamaño en disco | 84.098.971.680 bytes (78,3233 GiB): 83.220.797.312 bytes (77,5054 GiB) de torre de lenguaje + 878.174.368 bytes (0,8179 GiB) de torre de visión y proyector |
| Modalidad | image-text-to-text (texto e imagen fija) |
| Modelo base | inclusionAI/Ling-3.0-flash-VL (revisión `554184d95863a873051e8d8ccdb08c32c2c53a03`) |
| Runtime objetivo | ds4-dfm-rs (Rust, linaje DwarfStar) sobre NVIDIA DGX Spark |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido de tipo MoE con atención lineal. La ruta recurrente usa proyecciones de decaimiento y puerta KDA (atención lineal), mientras que el prefill emplea atención MLA absorbida con expansión de segmentos latentes a K/V por cabeza. El bloque MoE consta de 512 expertos enrutados, que suponen el 97,1% de los parámetros del modelo, junto con un experto compartido siempre activo y una FFN densa inicial. Además, incorpora una torre de visión y un proyector que habilitan entrada de imagen junto con texto. El contexto nativo es de 131.072 tokens.

Esta ficha describe una conversión, no un entrenamiento: no se aporta información sobre número de tokens de entrenamiento, composición del dataset, RLHF, DPO ni ningún otro proceso de alineamiento. La innovación técnica del artefacto es la receta de cuantización: asignación determinista y reproducible, independiente de cualquier corpus de calibración, en la que el presupuesto de bits se concentra exclusivamente en los expertos enrutados y se preserva BF16 en toda la ruta crítica. La decodificación especulativa MTP no está disponible porque la familia `bailingmoe3` no incluye bloque predictor.

## Capacidades

- Generación de texto conversacional en formato chat, incluyendo conversaciones multi-turno con bancos persistentes de estado.
- Comprensión de imágenes fijas (image-text-to-text) mediante torre de visión y proyector en BF16, con la misma calidad numérica que el checkpoint de origen en esa parte.
- Reutilización de prefijo exacta y parcial, útil para diálogos largos y prompts repetidos.
- Caché KV en disco, lo que permite sostener sesiones largas sin recalcular el contexto.
- Dos bancos persistentes concurrentes en el runtime de referencia, es decir, dos sesiones residentes simultáneas.
- Procesamiento de contexto largo hasta 131.072 tokens de forma nativa.
- No se documenta en la información disponible soporte de tool calling, function calling, agentes, modo de razonamiento explícito (thinking) ni audio.

## Casos de uso

- Asistente conversacional con imágenes en local: el modelo acepta imagen y texto en el mismo turno y puede mantener conversaciones multi-turno con 131.072 tokens de contexto, lo que permite adjuntar documentación extensa o historiales largos sin truncar.
- Análisis de documentos visuales de gran extensión: con contexto nativo de 131.072 tokens y torre de visión en BF16, es viable recorrer informes escaneados o capturas manteniendo la referencia textual completa dentro de la ventana.
- Despliegue en hardware de un solo acelerador: al residir en 78,3233 GiB, encaja en un DGX Spark y evita la necesidad de repartir el modelo entre varias GPU, lo que simplifica la operativa y reduce el coste de infraestructura.
- Servicio de dos sesiones persistentes: los dos bancos concurrentes del runtime permiten atender dos flujos de usuario estables con reutilización de prefijo, adecuado para demostraciones internas o entornos de evaluación con pocos usuarios simultáneos.
- Procesamiento por lotes de prompts largos: con 1.736 tok/s de prefill medios en el barrido de 2K a 64K y 1.742 tok/s en prefill en frío de 65.536 tokens, es razonable usar el modelo para tareas de resumen o extracción sobre entradas muy largas donde el coste dominante es la lectura del contexto.
- Investigación en cuantización mixta: el artefacto sirve como caso de estudio reproducible de asignación de bits por rol de tensor sin matriz de importancia, comparando la calidad resultante frente al checkpoint BF16 completo.
- Reutilización de prefijo en pipelines de consulta repetitiva: gracias a la reutilización exacta y parcial de prefijo y a la caché KV en disco, los flujos con un preámbulo común largo reutilizan cómputo entre peticiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos medidos sobre este artefacto son de rendimiento de inferencia en un DGX Spark, con una sesión caliente por proceso, prefill incremental de 2.048 tokens y 128 tokens greedy por frontera, SM a 2.177-2.190 MHz:

| Métrica (DGX Spark, `ds4-bench`) | PR #48 | PR #49 | PR #50 (`main` `f35dbeb`) |
|---|---|---|---|
| Prefill 8.192+64 | 1.142 tok/s | no disponible | 1.889 tok/s (+65% sobre #48) |
| Decode 8.192+64 | 19,54 tok/s | no disponible | 24,65 tok/s (+26% sobre #48) |
| Prefill medio, barrido 2K-64K | 1.106 tok/s | 1.597 tok/s | 1.736 tok/s |
| Prefill a 65.536 tokens | 684 tok/s | 1.231 tok/s | 1.423 tok/s |
| Prefill a 8.192 tokens (barrido) | no disponible | no disponible | 2.048 tok/s (1.670 en #48) |
| Decode medio, barrido 2K-64K | 24,05 tok/s | no disponible | 24,53 tok/s |
| Prefill en frío de 65.536 tokens | no disponible | 1.048 tok/s | 1.742 tok/s |

El mismo argmax se mantiene en todas las fronteras medidas, según la model card del autor.

## Requisitos de hardware

- Residencia completa: 84.098.971.680 bytes (78,3233 GiB) para el modelo y la torre de visión. Se necesita un dispositivo con al menos esa memoria disponible para mantenerlo íntegramente en el acelerador.
- GPU objetivo: NVIDIA DGX Spark (la model card cita SM a 2.177-2.190 MHz durante la medición). Es el único hardware para el que se publican medidas de cualificación.
- No cabe en GPU de consumo convencional: 78,3 GiB exceden la VRAM de una RTX 4090 (24 GB), una RTX 5090 (32 GB) o una A100 de 40 GB. No se documenta ningún modo de descarga parcial a CPU para este artefacto.
- Alternativas de memoria: un A100 de 80 GB o un H100 de 80 GB quedan al límite por capacidad, pero no hay resultados publicados de este artefacto en esas GPU ni kernels validados en la información disponible.
- Despliegue: el artefacto está dirigido al runtime `ds4-dfm-rs`, un host en Rust continuación de DwarfStar para inferencia de modelos grandes validada por hardware en DGX Spark. No se documenta compatibilidad con llama.cpp, Ollama, vLLM ni TGI.
- Throughput medido en DGX Spark: hasta 1.889 tok/s de prefill en la prueba de 8.192+64 y 24,65 tok/s de decode; 1.736 tok/s de prefill medios en el barrido 2K-64K y 1.423 tok/s a 65.536 tokens.
- Interruptores de control disponibles en el runtime: `DS4_LING3VL_NO_MLA_EXPAND`, `DS4_LING3VL_MLA_KV_F32`, `DS4_LING3VL_NO_MLA_HMMA`, `DS4_LING3VL_PREFILL_CHUNK`, `DS4_LING3VL_NO_BF16_REUSE`, `DS4_LING3VL_NO_BF16_VEC`, `DS4_MOTIF3_ATTN_HG_FILL`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Baekpica/Ling-3.0-flash-VL-Mixed-Quant-GGUF | 124,4B totales; activos no disponibles | 131.072 | GGUF, 5,3512 BPW efectivos (78,3233 GiB) | MIT | Cuantización mixta por rol de tensor, sin imatrix; runtime `ds4-dfm-rs` |
| inclusionAI/Ling-3.0-flash-VL | 124,4B totales; activos no disponibles | 131.072 | safetensors BF16 (16 bits por peso) | no disponible en la información proporcionada | Checkpoint de origen; ocupa aproximadamente el triple en memoria |
| Baekpica/Qwen3.8-Flash-Next-Mixed-Quant-SSD-PLE-GGUF | no disponible | no disponible | GGUF mixto | no disponible en la información proporcionada | Artefacto contra el que se dimensionó esta receta; incluye MTP y soporta texto, imagen y bancos persistentes |

No se dispone en la información proporcionada de resultados de benchmarks que permitan comparar rendimiento de calidad entre estos modelos.

## Limitaciones y advertencias

- No hay datos publicados de benchmarks de calidad, por lo que no es posible cuantificar la pérdida respecto al checkpoint BF16, más allá de que el autor afirma que se mantiene el mismo argmax en las pruebas de throughput realizadas.
- Los expertos enrutados, que son el 97,1% de los parámetros, se cuantizan a 5 bits efectivos; cualquier degradación esperable se concentra ahí, no en la ruta crítica.
- Idiomas soportados: no disponible. No se puede asumir cobertura multilingüe sin datos.
- Riesgo de alucinación: no evaluado en la información disponible; es un riesgo inherente a cualquier modelo generativo, pero no hay métricas específicas para esta conversión.
- Compatibilidad de despliegue muy restringida: solo se documenta `ds4-dfm-rs` sobre DGX Spark. No hay validación publicada con llama.cpp, Ollama, vLLM ni TGI, por lo que el artefacto GGUF no implica portabilidad automática al ecosistema GGUF habitual.
- Requisito de memoria elevado: 78,3233 GiB residentes. No cabe en GPUs de consumo y no se describe un modo de ejecución con descarga parcial.
- Sin decodificación especulativa: la familia `bailingmoe3` no tiene bloque MTP, de modo que no se puede aplicar la aceleración por predictor que sí existe en otros artefactos del mismo autor.
- Licencia MIT declarada en el repositorio del artefacto, heredada de la relación con el modelo base; conviene verificar los términos del checkpoint de origen inclusionAI/Ling-3.0-flash-VL antes de un uso comercial, ya que su licencia no figura en la información proporcionada.
- Las métricas de rendimiento proceden de un único tipo de hardware y de configuraciones experimentales (sesión caliente, prefill incremental de 2.048 tokens, 128 tokens greedy), por lo que no son extrapolables a otros entornos.
- Las imágenes de la model card y las rutas a benchmarks apuntan a commits concretos del repositorio del runtime; los números pueden variar en revisiones posteriores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Baekpica/Ling-3.0-flash-VL-Mixed-Quant-GGUF
- Variante concreta: https://huggingface.co/Baekpica/Ling-3.0-flash-VL-Mixed-Quant-GGUF/tree/main/MQ-Q5-KDA-VIT-BF16
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-flash-VL
- Revisión fijada del modelo base: https://huggingface.co/inclusionAI/Ling-3.0-flash-VL/tree/554184d95863a873051e8d8ccdb08c32c2c53a03
- Runtime ds4-dfm-rs: https://github.com/Baekpica/ds4-dfm-rs
- Pull request de prefill y decode en CUDA: https://github.com/Baekpica/ds4-dfm-rs/pull/48 y https://github.com/Baekpica/ds4-dfm-rs/pull/49 y https://github.com/Baekpica/ds4-dfm-rs/pull/50
- Documentación de la campaña CUDA (GB10): https://github.com/Baekpica/ds4-dfm-rs/blob/70b4cdb/docs/ling3-flash-vl.md#cuda-campaign-gb10
- CSVs del barrido, recibo y script de gráficas: https://github.com/Baekpica/ds4-dfm-rs/tree/70b4cdb/docs/benchmarks/ling3-flash-vl-2026-09-17
- Artefacto de referencia de dimensionamiento (Qwen3.8 Flash Next MQ-Q5): https://huggingface.co/Baekpica/Qwen3.8-Flash-Next-Mixed-Quant-SSD-PLE-GGUF
- Apoyo al autor: https://www.buymeacoffee.com/baekpica y https://github.com/sponsors/Baekpica

Nota: la búsqueda web realizada no devolvió ningún resultado relacionado con este modelo; los enlaces anteriores proceden íntegramente de la información de HuggingFace y de la model card del autor.
