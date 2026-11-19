# m8than/GLM-5.2-E2M1-Furnace

## Resumen

GLM-5.2-E2M1-Furnace es una conversión experimental del checkpoint zai-org/GLM-5.2-FP8, publicada por el usuario m8than para su uso con Furnace, un motor de inferencia orientado a GPUs AMD (ROCm). No se trata de un modelo nuevo ni de un ajuste fino: es una re-cuantización completa del modelo original de Z.ai en la que los expertos enrutados (routed experts) se almacenan en formato E2M1 (4 bits con escalas por bloque de 128) y las proyecciones de atención, densas y de expertos compartidos se mantienen en FP8 block-128, heredadas sin cambios del checkpoint fuente.

El modelo conserva la arquitectura GLM-5.2 (glm_moe_dsa, un transformer de mezcla de expertos con atención dispersa) y sus 110.695.458.816 parámetros totales, distribuidos en 142 shards safetensors y 118.629 tensores, con un tamaño de repositorio de aproximadamente 630 GB. La motivación es práctica: reducir el coste de memoria de los expertos para permitir el despliegue en cuatro AMD MI325X con paralelismo tensorial TP4, y habilitar rutas de decodificación optimizadas del motor Furnace (megakernel) que solo cualifican con pesos densos en FP8 block-128.

Es relevante ahora porque documenta un patrón de cuantización mixta (expertos en 4 bits, resto en FP8) sobre un modelo frontera de tipo MoE, con métricas de throughput medidas en hardware AMD y una licencia MIT heredada del modelo base. Conviene subrayar que es un artefacto experimental: no incluye model card de evaluación de calidad, no publica benchmarks de precisión y su uso está atado a una build concreta de Furnace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | glm_moe_dsa (transformer MoE con atención dispersa DSA) |
| Parametros totales | 110.695.458.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el motor midió 1.374.144 tokens de capacidad KV a TP4 con `--mem-fraction-static 0.85`; la card advierte que la posición máxima configurada no prueba calidad en contexto largo) |
| Tipos de cuantizacion | Expertos enrutados E2M1 (4 bits, escalas por bloque de 128); atención, densas y expertos compartidos en FP8 block-128; `--dtype bfloat16` y `--kv-cache-dtype bfloat16` en el ejemplo de servicio |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (142 shards, 118.629 tensores, ~388 GB según la card; 630,1 GB de repositorio) |

## Arquitectura y entrenamiento

La arquitectura es la del GLM-5.2 original: un transformer de mezcla de expertos con atención dispersa (etiqueta `glm_moe_dsa` en Hugging Face). Esta conversión no entrena ni modifica los pesos en términos de valor: aplica cuantización post-entrenamiento. Los expertos enrutados pasan a E2M1 de 4 bits con escalas por bloque de 128, mientras que las proyecciones de atención, las capas densas y los expertos compartidos se conservan en FP8 block-128 exactamente como en el checkpoint fuente (`dense_weight_format: fp8_block128` en `quantization_config`). Según la card, los pesos de expertos y su error de reconstrucción son idénticos a la revisión anterior, que usaba BF16 para las capas densas.

No se dispone de información sobre el dataset de entrenamiento original, el número de tokens, ni sobre etapas de RLHF o DPO, ya que la card de esta conversión no las documenta. La innovación técnica destacable es de despliegue: el formato FP8 block-128 en las capas densas permite que la ruta de decodificación `FURNACE_MEGAKERNEL=1` de Furnace cualifique en este checkpoint, y el motor emplea decodificación especulativa nativa MTP con configuración EAGLE 5/4/9. La conversión se verificó contra el árbol de Hugging Face fijado, con checksums de cada shard de salida, cobertura completa de tensores e índices y activos del tokenizador; `conversion_metadata.json` recoge la procedencia agregada y los checksums.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredados del GLM-5.2 base; la card de esta conversión no detalla capacidades específicas.
- Decodificación especulativa mediante MTP nativo (EAGLE 5/4/9) en el motor Furnace.
- Ejecución con atención dispersa DSA, con backends `aiter` para prefill y decode.
- Ruta de decodificación optimizada `FURNACE_MEGAKERNEL=1`, experimental y desactivada por defecto, que solo cualifica con TP4 y pesos densos FP8 block-128.
- Política de prefill `--superfast fast`, opcional y con pérdida, independiente del formato del checkpoint.
- Soporte de tool calling, agentes, visión, audio o modo thinking: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de un MoE de 110.000 millones de parámetros en cuatro AMD MI325X: la cuantización mixta reduce el peso de los expertos a 4 bits y permite servir el modelo con TP4 en hardware ROCm, un escenario poco cubierto por los stacks de inferencia habituales.
- Evaluación de motores de inferencia alternativos: sirve para comparar Furnace frente a vLLM o SGLang en GPUs AMD, midiendo decode y prefill con la misma carga y el mismo checkpoint.
- Investigación en cuantización post-entrenamiento: permite estudiar el impacto de E2M1 con escalas block-128 en expertos enrutados manteniendo FP8 en el resto de la red, con la revisión BF16 anterior disponible como referencia A/B.
- Pruebas de decodificación especulativa: el MTP nativo con EAGLE 5/4/9 y el megakernel permiten medir ganancias de throughput en decodificación sobre hardware gfx942 antes de comprometer una arquitectura de servicio.
- Servicio de contexto largo en un solo nodo: la capacidad KV medida de 1.374.144 tokens a TP4 con `--mem-fraction-static 0.85` habilita experimentos de recuperación en ventanas muy grandes, siempre validando la calidad con needles y passkeys propios.
- Validación de pipelines de conversión y procedencia: los checksums por shard y `conversion_metadata.json` sirven como plantilla para auditar conversiones de modelos grandes antes de publicarlas o desplegarlas.

## Benchmarks y rendimiento

La card solo publica mediciones de throughput de decodificación en 4x AMD MI325X (gfx942), TP4, EAGLE 5/4/9 y `--superfast fast`, comparando la ruta estándar con `FURNACE_MEGAKERNEL=1`, una sola ejecución por brazo:

| Decode tok/s | stock | FURNACE_MEGAKERNEL=1 |
|---|---|---|
| B1 | 151,6 | 181,4 |
| B4 (total) | 489,2 | 535,7 |
| B8 (total) | 795,5 | 873,5 |
| B16 (total) | 892,5 | 910,7 |
| B24 (total) | 1116,4 | 1157,2 |

El prefill no cambió: 9.898 frente a 9.980 tok/s a 32K. La comprobación rápida de Furnace (sanity, needles a 12K y 32K, passkey de 40 claves, multi-turno y subconjunto de GSM8K) pasó en ambos brazos. El autor advierte que son observaciones de una sola ronda en una máquina compartida y dependientes de la carga, no una garantía de despliegue. No hay resultados publicados de MMLU, HumanEval, GSM8K ni de precisión comparada con el modelo base.

## Requisitos de hardware

- VRAM estimada: no disponible de forma directa; el repositorio ocupa 630,1 GB y la card cifra los pesos en aproximadamente 388 GB, por lo que se necesita un nodo multi-GPU. La configuración medida usa 4x AMD MI325X con TP4.
- GPU recomendadas: AMD MI325X (gfx942) es el hardware validado. El stack es ROCm, no CUDA; no hay datos de funcionamiento en A100, H100 ni RTX 4090.
- GPU de consumo: no cabe en ninguna GPU consumer; el tamaño del checkpoint y el requisito de TP4 lo excluyen.
- Opciones de despliegue: Furnace, con una build que entienda `dense_weight_format` (commit `08bb350` o posterior). Ejemplo de la card: `--tp-size 4 --dtype bfloat16 --kv-cache-dtype bfloat16 --attention-backend dsa --dsa-prefill-backend aiter --dsa-decode-backend aiter`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: decodificación de 151,6 a 181,4 tok/s en B1 y de 1.116,4 a 1.157,2 tok/s en B24 (total) según la ruta; prefill de aproximadamente 9.900 tok/s a 32K. Capacidad KV de 1.374.144 tokens a TP4 con `--mem-fraction-static 0.85` en la ruta estándar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware validado |
|---|---|---|---|---|---|
| GLM-5.2-E2M1-Furnace | 110,7 B | no disponible | Expertos E2M1 4 bits, densas FP8 block-128 | MIT | 4x AMD MI325X, ROCm |
| zai-org/GLM-5.2-FP8 (base) | no disponible en la informacion | no disponible | FP8 | no disponible en la informacion | no disponible en la informacion |
| Revision BF16-dense del mismo autor (`16c3f5c`) | 110,7 B | no disponible | Expertos E2M1, densas BF16 | MIT | no disponible en la informacion |

No se dispone de datos de benchmarks de precisión ni de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Artefacto experimental: la propia card lo etiqueta como conversión experimental y no incluye evaluación de calidad ni benchmarks de precisión frente al modelo base.
- Dependencia estricta del motor: requiere una build de Furnace que entienda `dense_weight_format`; las rutas `--superfast` y `FURNACE_MEGAKERNEL=1` son opcionales y la segunda está desactivada por defecto y solo cualifica a TP4 con densas FP8 block-128.
- Las cifras de throughput provienen de una sola ejecución por brazo en una máquina compartida; no son una garantía de despliegue.
- La capacidad KV medida no demuestra calidad en contexto largo; la card lo advierte explícitamente.
- Riesgo de degradación por cuantización: los expertos en 4 bits introducen error de reconstrucción, aunque el autor afirma que es idéntico a la revisión anterior; no se publica una comparación de perplejidad o exactitud.
- Idiomas soportados y sesgos conocidos: no disponible en la información proporcionada.
- Licencia MIT heredada sin cambios, lo que permite uso comercial, pero el modelo base es de Z.ai y esta ficha no documenta posibles términos adicionales del modelo original.
- Sin pipeline declarado en Hugging Face y con cero likes, lo que sugiere un artefacto de nicho sin validación comunitaria amplia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/m8than/GLM-5.2-E2M1-Furnace
- Modelo base: https://huggingface.co/zai-org/GLM-5.2-FP8/tree/f33c6dc501ee5a2c7e35155653b1b1abbc320951
- Motor Furnace (commit de referencia): https://github.com/m8than/furnace/tree/08bb35051e3fa48310766b70c316f38ad410465d
- Revisión BF16-dense anterior: `16c3f5ca406349306ffe69de7726d7156b09b91b` (en el repositorio del modelo)
