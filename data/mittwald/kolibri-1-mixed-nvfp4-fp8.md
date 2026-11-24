# mittwald/Kolibri-1-mixed-NVFP4-FP8

## Resumen

Kolibri-1-mixed-NVFP4-FP8 es una cuantización mixta de 4 y 8 bits del modelo Kolibri 1 de Aleph Alpha, un modelo de mezcla de expertos (MoE) de 78.000 millones de parámetros con 3.500 millones activos, diseñado para razonamiento y uso de herramientas en alemán e inglés. La publica mittwald, no Aleph Alpha, y su objetivo es empaquetar el modelo completo con su ventana de contexto nativa de 262.144 tokens (extensible a 1.048.576) en una única GPU NVIDIA Blackwell de 96 GB.

La innovación principal es el uso de GPTQ para calibrar los pesos de los expertos en formato NVFP4 (W4A4), en lugar de un redondeo al vecino más cercano. Esto reduce el tamaño en disco un 42 % respecto a la release FP8 de Aleph Alpha (de 78,83 GB a 45,84 GB) manteniendo la precisión dentro del ruido de muestreo en GSM8K, hechos en alemán, RAG en alemán y tool calling. Los tensores de atención y expertos compartidos se mantienen en FP8, y embeddings, lm_head, routers y normas en BF16.

El resultado práctico es que un solo RTX PRO 6000 Blackwell puede servir el contexto completo de 1M tokens con una reserva de KV cache de 4,02 millones de tokens, alcanzando 1.772 tokens/s de salida con 64 usuarios en paralelo y un TTFT p95 de 1,5 s. Es relevante para despliegues en producción de modelos de razonamiento multilingües de gran contexto con requisitos de hardware acotados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kolibri1ForCausalLM, transformer MoE, 50 capas x 384 expertos enrutados |
| Parametros totales | 40.354.338.560 (40,35B segun safetensors; la model card declara 78B) |
| Parametros activos | 3,5B |
| Longitud de contexto | 262.144 tokens nativos; hasta 1.048.576 tokens |
| Tipos de cuantizacion | NVFP4 W4A4 (expertos enrutados), FP8 E4M3 (atencion y expertos compartidos), BF16 (embeddings, lm_head, routers, normas) |
| Idiomas soportados | Aleman, ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, compressed-tensors, mixed-precision |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 50 capas y 384 expertos enrutados por capa, 78.000 millones de parámetros totales y 3,5B activos por token. Incluye capas de atención con ventana deslizante que aplican codificación posicional solo en esas capas, lo que permite extender el contexto más allá de los 262.144 tokens nativos sin escalado posicional; Aleph Alpha lo validó hasta 1.048.576 tokens. Los datos de entrenamiento del modelo base, según los tags del repositorio, incluyen epfml/FineWeb2-HQ, HuggingFaceFW/fineweb-edu, DiscoResearch/germanrag, OpenAssistant/oasst2 y CohereLabs/aya_dataset. No se dispone de detalles sobre volumen de tokens, composición exacta ni si hubo RLHF o DPO en la información proporcionada.

La cuantización la realiza mittwald con llm-compressor 0.15.0 y compressed-tensors 0.20.1, usando GPTQ con 512 muestras de calibración (1,38 millones de tokens, aproximadamente 64 % en alemán). Los expertos enrutados (96,7 % de los parámetros) se cuantizan a NVFP4 con valores E2M1, escala E4M3 por cada 16 valores y escala global FP32; la atención q/k/v/o y los expertos compartidos (2,5 %) a FP8 E4M3 con escalas de bloque 128x128 y activaciones dinámicas por grupo de 128; embeddings, lm_head, routers, sesgo de router y normas (0,9 %) permanecen en BF16. El config.json es el de Aleph Alpha con un quantization_config añadido; tokenizer, chat template y generation_config.json no se modifican.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo thinking activable.
- Tool calling y function calling, con parsers `hf` en vLLM o `kolibri1` en la imagen de Aleph Alpha.
- Soporte de agentes y razonamiento encadenado.
- Capacidades multilingües en alemán e inglés.
- RAG de contexto largo, validado con needle in a haystack hasta 1.037.700 tokens.
- Generación de código (validado en pruebas de tool calls y tareas de código dentro del contexto largo).
- Matemáticas (evaluado en GSM8K según la model card).

## Casos de uso

- Atención al cliente en alemán e inglés: conversaciones multi-turno con contexto de hasta 262k tokens que permiten arrastrar historial completo, documentación de producto y políticas sin truncar.
- RAG sobre corpus documentales extensos: ingestión de manuales o expedientes de cientos de miles de tokens en una sola petición, con recuperación fiable validada hasta 1M tokens.
- Agentes con tool calling en producción: integración vía vLLM con `--enable-auto-tool-choice` y parsers `hf` para orquestar APIs, bases de datos y sistemas internos.
- Asistencia a desarrollo de software: generación y revisión de código con contexto de repositorio completo, aprovechando la ventana extendida y el modo razonamiento.
- Análisis de contratos y documentación legal en alemán: extracción de cláusulas y comparación entre documentos largos en una sola pasada.
- Despliegue en una sola GPU para equipos pequeños: servir el modelo completo con 64 usuarios en paralelo en un RTX PRO 6000 Blackwell de 96 GB a 1.772 tok/s, sin clúster multi-GPU.
- Procesamiento por lotes de resúmenes y clasificación de textos largos: throughput alto con TTFT p95 de 1,5 s y prefix caching activado.

## Benchmarks y rendimiento

| Metrica | Release FP8 | Este checkpoint |
|---|---:|---:|
| Tamano en disco | 78,83 GB | 45,84 GB (-42 %) |
| KV cache en un RTX PRO 6000 a 262k | 810k tokens | 3,40M tokens (4,2x) |
| Throughput de salida, 64 usuarios | 1.146 tok/s | 1.772 tok/s (+55 %) |
| TTFT p95, 64 usuarios | 12,4 s | 1,5 s |
| Precision (GSM8K, hechos en aleman, RAG en aleman, tool calls) | baseline | dentro del ruido de muestreo |
| Distancia a BF16 (KL truncada, menor es mejor) | 0,175 | 0,179 |
| Contexto completo de 1M en una tarjeta | no (pool KV de 810k) | si (pool de 4,02M, aguja encontrada a 1,04M) |

Rendimiento medido en un RTX PRO 6000 Blackwell con vLLM v0.33.0, KV FP8, `--gpu-memory-utilization 0.92` y `--max-num-batched-tokens 8192`:

| Escenario | 262k | 1M |
|---|---:|---:|
| Pool de KV cache | 3.401.233 tokens | 4.019.050 tokens |
| Tokens/s de salida, 8k in / 512 out, 1 / 8 / 32 / 64 paralelo | 124 / 638 / 1.188 / 1.772 | 124 / 629 / 1.191 / 1.774 |
| TTFT p95 a 64 paralelo | 1,5 s | 1,5 s |

Needle in a haystack (texto de relleno en alemán, código aleatorio a 10 %, 50 % y 90 % de profundidad, una petición a la vez, thinking activado):

| Longitud de prompt | Encontrado | Tiempo de respuesta |
|---:|---:|---|
| ~280.000 tokens | 3 / 3 | 39-43 s |
| ~571.000 tokens | 3 / 3 | 157-161 s |
| ~1.037.700 tokens | 3 / 3 | 49 s (dato truncado en la model card) |

## Requisitos de hardware

- VRAM para pesos: 42,64 GiB en memoria de GPU (la release FP8 ocupa 73,42 GiB).
- GPU mínima: una tarjeta Blackwell de al menos 48 GB; NVFP4 requiere SM 10.0 o SM 12.0 (B200 o RTX PRO 6000 Blackwell).
- Configuración recomendada: un RTX PRO 6000 Blackwell de 96 GB aloja pesos más KV cache FP8 de 3,4M tokens a 262k o 4,02M tokens a 1M.
- No cabe en GPUs consumer tipo RTX 4090 (24 GB) por tamaño de pesos.
- Despliegue: vLLM v0.33.0 (imagen `vllm/vllm-openai:v0.33.0`) o la imagen de Aleph Alpha `ghcr.io/aleph-alpha/aleph-alpha-inference` con parsers `kolibri1`.
- Los expertos NVFP4 se ejecutan con FlashInfer CUTLASS.
- Throughput medido: 1.772 tok/s de salida con 64 usuarios en paralelo; TTFT p95 de 1,5 s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Kolibri-1-mixed-NVFP4-FP8 | 40,35B (3,5B activos) | 262k / 1M | Apache 2.0 | compressed-tensors NVFP4/FP8 | Este checkpoint; cabe en una GPU de 96 GB |
| Aleph-Alpha/Kolibri-1-BF16 | 78B (3,5B activos) | 262k / 1M | Apache 2.0 | safetensors BF16 | Modelo base completo; requiere más VRAM |
| Release FP8 de Kolibri 1 | 78B (3,5B activos) | 262k / 1M | Apache 2.0 | FP8 | 78,83 GB en disco; pool KV menor en una tarjeta |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta alemán e inglés; no cubre otros idiomas.
- Es una cuantización no oficial de Aleph Alpha; no está respaldada por el autor del modelo base.
- La cuantización NVFP4 de los expertos introduce una distancia KL de 0,179 frente a BF16 (frente a 0,175 de la release FP8), lo que implica una degradación leve de la distribución de salida.
- Requiere hardware Blackwell; no es desplegable en GPUs Ampere, Ada o consumer.
- Riesgo de alucinación inherente al modelo base; no se documentan mitigaciones específicas en esta ficha.
- No se dispone de información sobre sesgos conocidos más allá de lo que indique la model card de Aleph Alpha.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar la model card original para condiciones de uso previstas.
- El dato de tiempo de respuesta a 1.037.700 tokens aparece truncado en la model card ("49"), por lo que no puede citarse con precisión.

## Enlaces

- Hugging Face: https://huggingface.co/mittwald/Kolibri-1-mixed-NVFP4-FP8
- Modelo base: https://huggingface.co/Aleph-Alpha/Kolibri-1-BF16
- Informe técnico de Aleph Alpha: https://aleph-alpha.com/downloads/tech-report.pdf
- mittwald: https://www.mittwald.de
- Imagen de inferencia de Aleph Alpha: ghcr.io/aleph-alpha/aleph-alpha-inference
- Imagen de vLLM: vllm/vllm-openai:v0.33.0
