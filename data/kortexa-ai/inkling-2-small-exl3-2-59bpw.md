# kortexa-ai/Inkling-2-Small-EXL3-2.59bpw

## Resumen

Inkling-2-Small-EXL3-2.59bpw es una exportación cuantizada con EXL3 del modelo base `thinkingmachines/Inkling-2-Small`, publicada por el usuario kortexa-ai. Se trata de un checkpoint calibrado pensado para inferencia de texto distribuida en dos nodos NVIDIA DGX Spark (cada uno con 128 GB de memoria unificada), no de un modelo listo para cargarse en Transformers, vLLM o ExLlamaV3 estándar. El artefacto completo ocupa 208.361.252.076 bytes (194,052 GiB) y aplica una tasa de bits media de 2,59375 sobre los pesos de los expertos, mientras que los tensores densos conservan su precisión publicada.

El modelo base es un transformer de tipo mezcla de expertos (MoE) con 48 capas y 384 expertos por capa, según los datos de conversión recogidos en la model card. La cuantización cubre la totalidad de capas y expertos, y mantiene la cuantización nativa de activaciones NVFP4/MXFP8 del modelo original. La licencia es Apache-2.0, heredada del modelo base, mientras que el códec EXL3 es MIT.

Su relevancia es doble: por un lado, demuestra que es posible servir un MoE de gran tamaño en hardware de consumo profesional de gama alta (dos DGX Spark) con pérdida de calidad medida y acotada; por otro, documenta con detalle un proceso de validación reproducible (NLL, KL, acuerdo top-1, prueba de aguja en contexto de 8K) que sirve de referencia para otras exportaciones EXL3. La limitación principal es que el contexto validado a nivel de modelo completo es de 8.192 tokens, muy por debajo del máximo de 1.048.576 tokens que anuncia el modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (48 capas, 384 expertos por capa) |
| Parametros totales | no disponible (repo de 194,052 GiB en EXL3 a 2,59375 bpw en expertos) |
| Parametros activos | no disponible |
| Longitud de contexto | 8.192 tokens validados a modelo completo; objetivo de runtime 512K; máximo anunciado en origen 1.048.576 |
| Tipos de cuantizacion | EXL3 con tasa media de 2,59375 bits por peso en expertos (K3 en capa 0 y capas 40-47; K3/K2 mixto en capas 1-39); activaciones NVFP4/MXFP8 nativas; salida de unembedding en FP32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (pesos originales); códec EXL3 bajo MIT |
| Formato de pesos | EXL3 propietario con inventario `checkpoint.json`, shards por rango (`ranks/rank-0.json`, `ranks/rank-1.json`) y manifiesto de conversión comprimido en `provenance/` |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 48 capas y 384 expertos por capa, según la información de conversión. La exportación EXL3 no modifica la topología: incluye las 48 capas y los 384 expertos de cada una. La asignación de bits es heterogénea: la capa 0 y las capas 40 a 47 usan K3, mientras que en las capas 1 a 39 los 192 expertos con mayor número de rutas de calibración usan K3 y el resto K2, lo que arroja una media de 2,59375 bits por peso de experto. Los tensores densos mantienen la precisión publicada y se conservan los tensores auxiliares de visión y draft, aunque el runtime actual solo soporta inferencia de texto.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original. La innovación técnica destacable de esta exportación es el propio esquema de cuantización calibrada por rutas de expertos y la validación empírica del artefacto: se emuló la acumulación FP4 del modelo fuente para comparar contra una referencia nativa en un panel disjunto de 8.192 tokens reales procedentes de 17 conversaciones y 1.088 posiciones fijas de comparación. El resultado fue un incremento de NLL de 0,006382108, una divergencia KL media de 0,022117095 y un acuerdo top-1 del 95,956 %. La model card advierte explícitamente que estas cifras no establecen paridad con un motor de inferencia upstream completo.

## Capacidades

- Generación de texto autoregresiva en inglés y otros idiomas no especificados (los idiomas no están documentados en la model card).
- Razonamiento de contexto largo dentro del límite validado de 8.192 tokens, con recuperación verificada de información en posiciones temprana, media y tardía (prueba de aguja).
- Respuesta a preguntas aritméticas simples dentro de contexto largo, según la prueba de validación (`orchid, 47, nebula, 42`).
- Capacidades multimodales potenciales: se preservan los tensores auxiliares de visión y draft, pero el runtime actual solo soporta texto.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo thinking o decodificación especulativa: no documentado; se conservan tensores draft pero no se describe su uso.

## Casos de uso

- Inferencia de texto en clústeres de dos DGX Spark: el artefacto está diseñado específicamente para repartirse entre dos nodos de 128 GB mediante los inventarios `rank-0` y `rank-1`, lo que permite servir un MoE grande en hardware de sobremesa profesional sin GPU de centro de datos.
- Procesamiento de documentos largos de hasta 8K tokens: resumen, extracción de entidades y respuesta a preguntas sobre contratos, informes o transcripciones que quepan en la ventana validada, aprovechando la recuperación verificada de agujas en posiciones intermedias.
- Evaluación de cuantizaciones EXL3: sirve como referencia reproducible para medir el impacto de tasas de bits bajas (2,59 bpw) sobre un MoE, con métricas de NLL, KL y acuerdo top-1 publicadas.
- Investigación sobre serving distribuido: el par de shards y el manifiesto de conversión permiten estudiar el reparto de capas (24 por nodo) y el consumo de memoria (92,2 GiB pico asignado por GPU en la prueba de 8K).
- Prototipado de asistentes conversacionales multi-turno: el panel de validación usó 17 conversaciones reales, lo que respalda su uso en diálogos con contexto moderado.
- Docencia y formación en cuantización de modelos: la documentación de integridad (SHA-256 de los 2.363 artefactos, hash del manifiesto de conversión) facilita reproducir el pipeline y auditar cada peso.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K). Sí publica métricas de validación de la cuantización y de una prueba real de inferencia:

| Metrica | Valor |
|---|---|
| NLL de referencia nativa | 1,341903329 |
| NLL tras conversión | 1,348285437 |
| Incremento de NLL | 0,006382108 |
| Divergencia KL media | 0,022117095 |
| Acuerdo top-1 | 95,956 % |
| Tokens de prompt en prueba real | 8.128 |
| Tokens nuevos admitidos | hasta 64 (total máximo 8.192) |
| Tiempo de prefill | 324,924 s |
| Tiempo total de generación | 334,030 s para 13 tokens de salida |
| Memoria GPU pico asignada | 92,228 / 98,198 GiB |
| Memoria GPU pico reservada | 92,307 / 98,283 GiB |
| Memoria de host disponible al finalizar | 23,260 / 16,373 GiB |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el artefacto completo ocupa 194,052 GiB, repartidos en dos shards de 24 capas cada uno; en la prueba real el pico asignado por GPU fue de 92,228 GiB y el reservado de 92,307 GiB.
- GPU recomendadas: dos NVIDIA DGX Spark de 128 GB de memoria unificada; no hay soporte documentado para A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: no; requiere el par de DGX Spark y al menos 125 GiB de disco libre por host para el shard del modelo, además de espacio para Docker y compilación.
- Opciones de despliegue: runtime personalizado descrito en `kortexa-ai/inkling2-exl3-spark` (receta pendiente de publicación); no es compatible con Transformers estándar, vLLM ni el servidor estándar de ExLlamaV3.
- Latencia y throughput: prefill de 324,924 s para 8.128 tokens de prompt; generación de 13 tokens en 334,030 s totales. La model card no hace afirmaciones de throughput más allá de estas mediciones.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La model card no incluye comparativas con otras exportaciones EXL3 ni con el modelo base en su precisión original, más allá de las métricas de divergencia frente a la referencia nativa emulada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling-2-Small-EXL3-2.59bpw | no disponible (MoE 48x384) | 8.192 validados / 1.048.576 anunciados | Apache-2.0 (EXL3 MIT) | Hugging Face, runtime propio |
| thinkingmachines/Inkling-2-Small | no disponible | 1.048.576 anunciados | Apache-2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo drop-in: requiere un runtime personalizado y no funciona con Transformers, vLLM ni el servidor estándar de ExLlamaV3.
- El contexto validado a modelo completo es de 8.192 tokens; el objetivo de 512K no ha superado una prueba completa y el máximo anunciado de 1.048.576 tokens requiere cambios en el workspace de atención y validación separada.
- Las métricas de calidad se obtuvieron emulando la acumulación FP4 del modelo fuente; no establecen paridad con un motor de inferencia upstream completo.
- Solo se soporta inferencia de texto, aunque se conservan tensores de visión y draft.
- No hay información sobre sesgos, idiomas soportados ni riesgo de alucinación más allá de lo inherente a un modelo de lenguaje.
- La licencia Apache-2.0 permite uso comercial de los pesos, pero el códec EXL3 está bajo MIT y el runtime propio puede tener sus propias condiciones.
- El tamaño del repo (119,3 GB en Hugging Face, 194,052 GiB desplegados) y la necesidad de dos hosts con 125 GiB libres por nodo limitan su uso a entornos con hardware específico.
- El rendimiento medido es lento (más de 5 minutos de prefill para 8K tokens), lo que lo hace inadecuado para aplicaciones interactivas de baja latencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kortexa-ai/Inkling-2-Small-EXL3-2.59bpw
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Repositorio de la receta para dos Spark: https://github.com/kortexa-ai/inkling2-exl3-spark
- Revisión del modelo base usada en la conversión: `b0e7afb8892a07897c78ce1c5b801a0d9cbd5e7b`
- Validación de la prueba de 8K: `validation/spark-8k.json` (incluido en el repositorio del modelo)
- Manifiesto de conversión: `provenance/conversion-manifest.json.gz` (SHA-256 sin comprimir: `f92ee205c5154d1c255ea2316cb3b0e33c179b523cda21caacba83d7d772a239`)
