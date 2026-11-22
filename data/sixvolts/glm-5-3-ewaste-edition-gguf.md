# SixVolts/GLM-5.3-ewaste-edition-GGUF

## Resumen

GLM-5.3-ewaste-edition-GGUF es una colección de cuantizaciones GGUF del modelo GLM-5.3 de Z.ai (zai-org), publicada por el usuario SixVolts. El objetivo declarado es hacer viable la inferencia de un modelo MoE de gran escala (753.329.940.480 parámetros totales según los safetensors del modelo base) en hardware antiguo o de generación anterior, concretamente CPUs sin AVX-512 y GPUs de centro de datos como la MI100 (gfx908). La idea central es que, en esos entornos, el cuello de botella de la decodificación no es el ancho de banda sino la des-cuantización de los expertos enrutados, por lo que se usan K-quants en lugar de i-quants con codebook para dichos expertos.

El modelo base GLM-5.3 es, según la model card, idéntico en arquitectura y configuración a GLM-5.2, diferenciándose únicamente por un post-entrenamiento adicional. Se trata de un transformer MoE con atención DSA (indexer selectivo por capas) y un cabezal NextN/MTP utilizable para decodificación especulativa en llama.cpp. La cuantización se realizó con una importance matrix de Unsloth (209 chunks de 3584 tokens) y se distribuye en cuatro variantes principales que van de 228,7 GiB a 403,8 GiB.

La relevancia actual del artefacto es doble: por un lado, permite ejecutar un modelo de más de 750.000 millones de parámetros totales en configuraciones multi-GPU modestas (por ejemplo, 8×32 GB o 10×32 GB sin spill); por otro, documenta con detalle decisiones de cuantización poco habituales, como el uso de un intermedio F32 en lugar de BF16 para preservar las escalas FP8 e4m3 con bloques de 128×128, o la selección de capas "frías" a partir de la imatrix.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención DSA (indexer por capas) y cabezal NextN/MTP; arquitectura idéntica a GLM-5.2 |
| Parametros totales | 753.329.940.480 (modelo base, safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (las pruebas de rendimiento se hicieron a 16k de contexto) |
| Tipos de cuantizacion | Q4_K_XL, Q3_K_XL, Q3_K_M, Q2_K_XL; mezcla de Q2_K, Q3_K, Q4_K, Q5_K, Q6_K, Q8_0, Q4_0, IQ2_XXS y F32 según grupo de tensores |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (modelo base en FP8 e4m3 con escalas de bloque 128×128) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) que incorpora atención DSA, un mecanismo de indexación selectiva que solo lleva pesos de indexer en las 22 capas marcadas como `indexer_types: full`; el resto de capas reutiliza la selección de la última capa completa, tal como hace la implementación de referencia. El checkpoint resultante tiene 1.524 tensores, frente a los 1.809 de conversiones anteriores que duplicaban el indexer en cada capa. Incluye además un bloque NextN/MTP (blk.78) que en esta edición se cuantiza a Q4_K para poder usarse con `--spec-type draft-mtp` en llama.cpp.

El proceso de cuantización destaca por tres decisiones técnicas. Primera, la conversión intermedia se hace en F32 y no en BF16: como el checkpoint original es FP8 e4m3 con escalas arbitrarias (194 de 95.040 en el primer shard son potencias de dos), un intermedio BF16 re-redondearía aproximadamente el 88% de los pesos des-cuantizados. Segunda, los expertos enrutados usan K-quants en lugar de i-quants con codebook, porque en CPUs pre-AVX-512 y en MI100 la des-cuantización de expertos, y no el ancho de banda, limita la decodificación. Tercera, la asignación de tipos por capa se guía por la importancia media de `ffn_down_exps` en la imatrix, que es monotónica con la profundidad y abarca seis órdenes de magnitud (de ≈0,003 en blk.3 a ≈14.860 en blk.77), de modo que las 32 capas MoE más frías (blk.3–34) reciben Q2_K y la cola caliente (blk.35–77) mantiene Q3_K/Q4_K.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO del modelo base en la información proporcionada.

## Capacidades

- Generación de texto conversacional (`pipeline_tag: text-generation`, tag `conversational`).
- Razonamiento y decodificación multi-paso, con soporte de decodificación especulativa mediante el cabezal NextN/MTP integrado.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su despliegue tras APIs compatibles.
- Ejecución en llama.cpp, con soporte de atención DSA y draft-mtp en la versión mainline citada por el autor.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling, function calling, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Inferencia de un MoE de gran escala en clústeres de GPUs de generación anterior: la variante Q3_K_M cabe sin spill en 10×32 GB (320 GB de HBM), lo que permite servir el modelo en nodos con MI100 o GPUs similares donde un checkpoint FP8 completo no cabría.
- Despliegue en estaciones de trabajo con gran cantidad de RAM: la variante Q4_K_XL (403,8 GiB) está pensada para máquinas con aproximadamente 512 GB de RAM que descargan los expertos a CPU, manteniendo la máxima calidad dentro de la familia.
- Servicio conversacional de baja concurrencia: con 11,5 tok/s de decodificación en un solo stream sobre 10×MI100, encaja en asistentes internos, generación de borradores o pipelines por lotes donde la latencia no es crítica.
- Aceleración con decodificación especulativa: el cabezal MTP incluido permite activar `--spec-type draft-mtp` en llama.cpp para reducir el coste por token generado en los entornos objetivo.
- Evaluación e investigación de técnicas de cuantización: la model card documenta composición por tensor, errores RMS por tipo y perplejidades, lo que sirve como referencia reproducible para estudiar el impacto de K-quants frente a i-quants en MoE.
- Prototipado y experimentación con licencia permisiva: al ser MIT, puede integrarse en productos comerciales y en investigación académica sin restricciones de uso, siempre que se respeten las obligaciones de atribución.
- Ajuste fino o destilación posterior sobre GGUF: las variantes de menor tamaño (Q2_K_XL, 228,7 GiB) permiten iterar en 8×32 GB sin spill antes de pasar a cuantizaciones mayores.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Perplejidad wikitext-2, Q4_K_XL (403,8 GiB) | 2,6537 ± 0,032 |
| Perplejidad wikitext-2, Q3_K_XL (314,1 GiB) | 2,7910 ± 0,034 |
| Perplejidad wikitext-2, Q3_K_M (297,5 GiB) | 2,8092 ± 0,034 |
| Perplejidad wikitext-2, Q2_K_XL (228,7 GiB) | 3,6057 ± 0,047 |
| Decodificación, 10×MI100 (gfx908), 0-spill, Q3_K_M | 11,5 tok/s, un stream, contexto 16k |

Las perplejidades se midieron sobre wikitext-2 test, 100 chunks de 512 tokens, KV cache f16 y `-fa off` (ruta DSA), con ajustes idénticos para todas las variantes. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El dato de 11,5 tok/s corresponde a la ruta equivalente a mainline (atención DSA densa, sin cabezal de draft) y la model card queda truncada en la descripción del rendimiento con el cabezal MTP activado.

## Requisitos de hardware

- VRAM/RAM según variante: Q4_K_XL 403,8 GiB (pensada para equipos con ≈512 GB de RAM y expertos en CPU); Q3_K_XL 314,1 GiB (máxima calidad en GPU, con spill a CPU por debajo de 11×32 GB); Q3_K_M 297,5 GiB (sin spill en 10×32 GB, 320 GB de HBM); Q2_K_XL 228,7 GiB (sin spill en 8×32 GB).
- GPUs objetivo declaradas: MI100 (gfx908) y GPUs de centro de datos de generación anterior; también CPUs sin AVX-512 para el caso de expertos descargados a memoria del sistema.
- GPUs consumer: no se documenta compatibilidad con GPUs consumer; el tamaño mínimo de 228,7 GiB excede con holgura la VRAM de cualquier GPU consumer individual, por lo que solo sería viable con descarga masiva a RAM.
- Despliegue: llama.cpp (con soporte de DSA y `--spec-type draft-mtp`); el tag `endpoints_compatible` sugiere compatibilidad con APIs de endpoints, aunque no se detallan los servidores concretos.
- Latencia y throughput: 11,5 tok/s de decodificación en un stream sobre 10×MI100 con Q3_K_M y contexto de 16k; no se proporcionan datos de throughput agregado ni de latencia de prefill.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| GLM-5.3-ewaste-edition (Q3_K_M) | 753,3 B | no disponible | MIT | GGUF | 297,5 GiB, 3,39 bpw, sin spill en 10×32 GB |
| GLM-5.2-ewaste-edition | no disponible | no disponible | MIT (según repo base) | GGUF | Edición previa con la misma filosofía de K-quants; perplejidades de referencia 2,8348 (Q3_K_M) |
| GLM-5.3 (base, zai-org) | 753,3 B | no disponible | MIT | FP8 e4m3 con escalas 128×128 | Checkpoint original; requiere hardware con soporte FP8 y mucha más memoria |

No se dispone de información sobre otros modelos comparables de la misma categoría (por ejemplo, otros MoE de escala similar) en la documentación proporcionada.

## Limitaciones y advertencias

- La model card está truncada: la sección de rendimiento con decodificación especulativa MTP queda incompleta, por lo que no se conocen las cifras de aceleración reales.
- No hay datos publicados de benchmarks de calidad estándar (MMLU, HumanEval, GSM8K) ni de evaluación multilingüe; la única métrica de calidad es la perplejidad en wikitext-2.
- La variante Q2_K_XL degrada notablemente la perplejidad (3,6057 frente a 2,6537 de Q4_K_XL), por lo que no es recomendable para tareas sensibles a la calidad.
- El modelo base es un MoE de más de 750.000 millones de parámetros totales: incluso la variante más pequeña requiere infraestructura multi-GPU o grandes cantidades de RAM, y no cabe en GPUs consumer.
- La decodificación a 11,5 tok/s en un solo stream limita su uso en aplicaciones interactivas de baja latencia.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones específicas en la información proporcionada; deben asumirse los riesgos habituales de los modelos de lenguaje de gran escala.
- Aunque la licencia es MIT, deben respetarse las condiciones del modelo base zai-org/GLM-5.3 y las atribuciones correspondientes; conviene verificar la licencia del checkpoint original antes de un uso comercial.
- Las cuantizaciones están optimizadas para hardware antiguo (pre-AVX-512, MI100); en hardware moderno con AVX-512 o GPUs con soporte FP8 podrían existir alternativas más rápidas o de mayor calidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SixVolts/GLM-5.3-ewaste-edition-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Edición previa GLM-5.2 e-waste edition: https://huggingface.co/SixVolts/GLM-5.2-ewaste-edition-GGUF
- Importance matrix de Unsloth para GLM-5.3: https://huggingface.co/unsloth/GLM-5.3-GGUF
