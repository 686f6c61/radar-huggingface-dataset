# marcusguhao/IndexMem-Qwen3-8B

## Resumen

IndexMem-Qwen3-8B es un adaptador de compresión de caché KV diseñado para un backbone congelado Qwen/Qwen3-8B. Lo desarrolla el usuario marcusguhao y se enmarca en el trabajo *The Gating Mechanism of KV Cache Eviction*. No es un modelo de lenguaje completo: el repositorio contiene únicamente una compuerta de retención de 7,5 millones de parámetros que puntúa cada entrada KV en el momento de su creación, permitiendo expulsar de la caché las entradas peor valoradas sin recomputarlas. El backbone Qwen3-8B no se redistribuye y debe descargarse por separado.

El problema que resuelve es el coste de memoria y cómputo de la caché KV en contextos largos. Con una compresión del 75% de la caché, el sistema mantiene RULER 8K en 90,14 frente a 93,86 con caché completa, y LongBench en 46,03 frente a 47,39. Se trata de una degradación moderada a cambio de reducir aproximadamente cuatro veces el presupuesto de caché por cabeza KV.

Es relevante porque propone un enfoque de puntuación única en creación de entrada, en lugar de reescorar periódicamente, y porque se publica como un artefacto pequeño y desacoplado del modelo base, con licencia Apache 2.0 y código de inferencia en el repositorio kvpress.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Compuerta de retención (MLP de 2 capas, anchura 256) sobre backbone transformer Qwen3-8B congelado |
| Parametros totales | 7,5 M (solo la compuerta); backbone Qwen3-8B no incluido |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Entrenada con currículo a 8K y 16K; presupuesto de caché configurable (por defecto 2048 por cabeza KV) |
| Tipos de cuantizacion | No disponible (el artefacto es la compuerta; la cuantización aplica al backbone) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `indexmem.pt` (checkpoint del scorer) y `scorer.json` (geometría del scorer) |

## Arquitectura y entrenamiento

La compuerta es un MLP de dos capas sobre el estado oculto, con anchura 256, que emite una puntuación por cabeza KV. Se evalúa una sola vez, en el momento de creación de cada entrada KV, de modo que las entradas peor puntuadas pueden expulsarse y no se recomputan. Cuatro attention sinks y una ventana local de 128 tokens se atienden siempre y quedan exentos del normalizador de la compuerta. El resto del presupuesto se reparte entre cabezas según la masa de atención retenida, con un suelo expulsable de 512. El `cache_budget` es la capacidad media por cabeza KV e incluye 64 slots de centroides.

El entrenamiento congela el backbone, los embeddings y la LM head; solo se entrena la compuerta. La pérdida es una KL inversa contra el mismo modelo ejecutándose con caché KV completa. La tasa de retención se aprende por entrada con una escala de edad de token fija de 16384. La masa de la compuerta es 256, compartida entre las entradas expulsables. El currículo consta de 300 pasos a 8K y 300 pasos a 16K, con batch global de 8. Los datos provienen de LongMino, subconjuntos `2e16` y `2e17`.

## Capacidades

- Compresión de caché KV en inferencia de Qwen3-8B con una tasa configurable mediante `cache_budget`.
- Puntuación de retención por cabeza KV en el momento de creación de la entrada, sin reescorado periódico.
- Preservación de attention sinks y ventana local para mantener estabilidad en las posiciones iniciales y recientes.
- Reparto adaptativo del presupuesto entre cabezas según la masa de atención retenida.
- Evaluación en tareas de contexto largo: RULER 8K y LongBench.
- Integración con Hugging Face Transformers mediante `IndexMemTextGenerationPipeline` y FlashAttention 2.
- No incluye generación autónoma: hereda las capacidades del backbone Qwen3-8B subyacente.
- No se documentan capacidades de tool calling, agentes, visión o audio específicas de este artefacto.

## Casos de uso

- Procesamiento de documentos largos en producción: permite responder preguntas sobre documentos extensos con un presupuesto de caché de 2048 por cabeza KV en lugar de caché completa, reduciendo la memoria necesaria en GPUs de una sola tarjeta.
- Servicio de QA sobre corpus jurídico o técnico: el pipeline acepta documento y pregunta, y la compuerta mantiene las entradas KV relevantes para la consulta mientras expulsa el resto, lo que abarata el coste por consulta en contextos de 8K a 16K tokens.
- Despliegue en GPUs de consumo: al recortar la caché KV un 75%, se libera VRAM que de otro modo limitaría la longitud de contexto o el tamaño de batch en tarjetas de 24 GB.
- Evaluación de investigación en compresión de caché: el artefacto es un checkpoint pequeño y aislado, útil para reproducir experimentos de expulsión KV sobre un backbone estándar sin reentrenar el modelo.
- Aumento de throughput en inferencia por lotes: un presupuesto de caché menor permite más secuencias concurrentes por GPU, adecuado para endpoints de generación con contexto largo.
- Prototipado de asistentes sobre normativa o documentación interna: la combinación de Qwen3-8B con la compuerta permite iterar sobre ventanas de contexto amplias sin infraestructura de múltiples GPUs.

## Benchmarks y rendimiento

| Benchmark | IndexMem (75% compresión) | Full-KV |
|---|---|---|
| RULER 8K | 90,14 | 93,86 |
| LongBench | 46,03 | 47,39 |

No se han publicado en la información disponible resultados adicionales (MMLU, HumanEval, GSM8K) ni comparaciones con otras técnicas de compresión de caché.

## Requisitos de hardware

- VRAM estimada para el backbone Qwen3-8B en bfloat16: aproximadamente 16 GB de pesos, más la caché KV comprimida según `cache_budget`.
- La compuerta añade 7,5 M de parámetros, un coste despreciable frente al backbone.
- GPU recomendadas: A100 40/80 GB, H100 para lotes grandes y contextos de 16K; RTX 4090 (24 GB) para inferencia en bfloat16 con presupuestos de caché reducidos.
- Cabe en GPU de consumo de 24 GB con cuantización del backbone, aunque la información disponible no detalla cuantizaciones soportadas.
- Despliegue: requiere el código de `kvpress` (rama `main`) y Transformers con `attn_implementation="flash_attention_2"`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IndexMem-Qwen3-8B | 7,5 M (compuerta) + Qwen3-8B | 8K-16K entrenado, presupuesto configurable | Expulsión KV con compuerta puntuada en creación | Apache 2.0 | Hugging Face + repo kvpress |
| Qwen3-8B (base, caché completa) | 8B | Contexto nativo de Qwen3-8B | Sin compresión de caché | Apache 2.0 | Hugging Face |
| Otras técnicas de expulsión KV (H2O, SnapKV, etc.) | No disponible | No disponible | Expulsión basada en atención acumulada | No disponible | No disponible |

No se dispone de datos comparativos de rendimiento frente a otras técnicas de compresión de caché en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere descargar Qwen/Qwen3-8B por separado y el código de `kvpress`; el repositorio solo contiene la compuerta.
- La degradación medida es de 3,72 puntos en RULER 8K y 1,36 puntos en LongBench con compresión del 75%; a mayores tasas de compresión el deterioro no está documentado.
- El entrenamiento se limita a 8K y 16K tokens; el comportamiento más allá de 16K no está validado en la model card.
- No se documentan sesgos, riesgos de alucinación ni idiomas soportados específicos de este artefacto; hereda los del backbone Qwen3-8B.
- La licencia Apache 2.0 cubre la compuerta, pero el uso comercial del backbone queda sujeto a la licencia de Qwen3-8B.
- Dependencia de FlashAttention 2 y de una rama concreta del repositorio (`main`), lo que puede afectar a la reproducibilidad en producción.
- El repositorio registra 0 descargas y 0 likes, sin validación independiente por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/marcusguhao/IndexMem-Qwen3-8B
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Código de inferencia: https://github.com/Chooovy/kvpress (rama `main`)
