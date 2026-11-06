# defnoteatin/PseudoBrain-Qwen3-32B-FP8

## Resumen

PseudoBrain-Qwen3-32B-FP8 es una modificación arquitectónica del modelo denso Qwen3-32B de Alibaba, publicada por Ian Kurt Galeon (usuario `defnoteatin` en Hugging Face) bajo licencia Apache 2.0. El modelo sustituye el mecanismo de atención estándar del transformer original por una arquitectura híbrida que combina atención de ventana deslizante de 16K tokens, una red recurrente Gated DeltaNet de estado fijo y un sistema de memoria exacta denominado Quest, con el objetivo de reducir drásticamente el coste de memoria de la caché KV en contextos extremadamente largos.

La propuesta central es ambiciosa: según la model card, permite servir contextos de hasta 1.000.000 de tokens reduciendo la caché KV de aproximadamente 256 GB a unos 4,1 GB, una disminución del 98,4 %. Esto se logra mediante estado recurrente de tamaño constante O(1), atención dispersa sobre anclas seleccionadas y un esquema de RoPE por bloques no solapados que preserva la coherencia temporal a lo largo de la secuencia. El modelo se distribuye en formato FP8 con pesos de aproximadamente 34,5 GB y requiere el plugin propietario `pb27_vllm` para funcionar sobre vLLM.

Es relevante ahora porque ataca uno de los cuellos de botella prácticos del despliegue de modelos de razonamiento de gran contexto: el coste cuadrático de la atención y el crecimiento lineal de la caché KV. No obstante, se trata de un artefacto de investigación con muy poca tracción pública (33 descargas, 0 likes en el momento de la consulta) y cuyas afirmaciones de rendimiento no están verificadas de forma independiente en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: atención de ventana deslizante de 16K + Gated DeltaNet recurrente en paralelo + memoria exacta Quest (piece_attention) |
| Parámetros totales | 33.604.001.280 (~33,6B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | Hasta 1.048.576 tokens (1M), configurable vía `--max-model-len` |
| Tipos de cuantización | FP8 (esta edición); el autor publica además ediciones W4A16/AWQ, NVFP4 y BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8), servido con vLLM |
| Número de capas | 64 |
| Tamaño del repositorio | 36,0 GB |
| Modelo base | Qwen/Qwen3-32B (y variantes FP8, AWQ, NVFP4) |

## Arquitectura y entrenamiento

El modelo parte de los pesos de Qwen3-32B y no documenta un reentrenamiento desde cero: la contribución es una reingeniería del mecanismo de atención y del motor de inferencia. Las 64 capas de atención completa del transformer original se convierten en capas de atención de ventana deslizante de 16.384 tokens combinadas con una Gated DeltaNet paralela, un mecanismo recurrente cuyo estado tiene tamaño fijo independientemente de la longitud del contexto. Sobre las capas de ancla dispersas se aplica el sistema Quest, que atiende sobre cuatro elementos: tokens sink de StreamingLLM, landmarks de superbloques, las k páginas de memoria exacta seleccionadas por consulta y la ventana deslizante de 16K, fusionando resultados mediante FlashAttention-2 con LSE-merge.

El autor describe tres innovaciones adicionales. Primero, un esquema de RoPE por bloques estrictamente no solapados (`_reposition_rope_blocks`) que asigna a cada bloque recuperado una huella de 64 tokens y escala las distancias históricas de forma proporcional, buscando preservar la fidelidad temporal macro en 1M de tokens sin recurrir a YaRN estático. Segundo, una agregación global densa que detecta consultas de alta participación y activa resúmenes de superbloque residentes en HBM (un token de resumen por cada 4.096 tokens), cobertura estratificada de la línea temporal y barridos de working-set rotativos por novedad. Tercero, la separación entre el presupuesto de recuperación en prefill y el presupuesto constante en decode (`PB27_MEMORY_DECODE_STRIDE=64`, `PB27_MEMORY_DECODE_BLOCKS=64`), que permite decodificación a velocidad constante.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO específicas para esta variante. El modelo hereda presumiblemente el post-entrenamiento de Qwen3-32B, pero la model card no lo detalla.

## Capacidades

- Generación de texto y razonamiento multi-paso, heredados de Qwen3-32B.
- Modo de razonamiento con parser dedicado (`--reasoning-parser qwen3`) en vLLM.
- Tool calling y function calling, con parser Hermes (`--tool-call-parser hermes`) y auto-selección de herramientas.
- Procesamiento de contextos extremadamente largos, hasta 1M de tokens, con memoria de caché KV prácticamente constante.
- Recuperación de información en secuencias masivas mediante atención dispersa sobre páginas de memoria exacta.
- Capacidades multilingües: no disponibles en la información proporcionada (se heredarían de Qwen3-32B, pero no se confirman).
- Soporte de agentes y razonamiento multi-paso sobre documentos muy extensos gracias a los barridos de working-set rotativos.
- No se documentan capacidades de visión ni audio.

## Casos de uso

- Análisis de repositorios de código completos: con 1M de tokens de contexto, el modelo puede ingerir un monorepo entero y responder preguntas de arquitectura o dependencias sin chunking, aprovechando la memoria Quest para localizar fragmentos relevantes.
- Revisión de contratos y expedientes legales extensos: permite cargar cientos de páginas de documentación y hacer preguntas cruzadas, con la ventaja de que la caché KV no crece de forma prohibitiva en un L40S o A100 de 48-80 GB.
- Atención al cliente con historial prolongado: conversaciones multi-turno de días o semanas caben en una única ventana sin resumir, manteniendo coherencia mediante los tokens sink y los resúmenes de superbloque.
- Investigación sobre literatura científica: ingestión de decenas de papers simultáneamente para síntesis comparativa, apoyándose en la cobertura estratificada de la línea temporal.
- Agentes autónomos de larga duración: tareas con decenas de pasos de tool calling donde el historial acumulado se acerca al millón de tokens, beneficiándose de la decodificación a velocidad constante.
- Auditoría de logs y trazas de sistemas: análisis de volcados masivos de registros en una sola pasada, usando la recuperación exacta para localizar eventos concretos dentro de millones de líneas.
- Despliegue on-premise con privacidad estricta: al caber en una sola GPU de 48 GB en FP8 (o 24 GB en W4A16), es viable en entornos sin clúster multi-GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card referencia un directorio `reports/` en el repositorio de GitHub del autor con supuestas "benchmark receipts", pero no se incluyen cifras concretas de MMLU, HumanEval, GSM8K ni de tareas de recuperación en contexto largo en el material proporcionado. Las únicas métricas citadas son de memoria: reducción de caché KV de 256 GB a ~4,1 GB en 1M de tokens (98,4 %) y fidelidad de distancia temporal del 99 %+ según el propio autor, sin verificación independiente.

## Requisitos de hardware

- VRAM estimada en FP8: ~34,5 GB de pesos más ~4,1 GB de caché KV a 1M de tokens, total ~39 GB.
- GPU recomendadas para esta edición FP8: NVIDIA L40S (48 GB), A100 (40/80 GB), H100 (80 GB), AMD MI300X, DGX Spark; también 2× RTX 3090/4090.
- Ediciones alternativas del mismo autor: W4A16 y NVFP4 caben en ~22,8 GB totales (RTX 3090/4090 de 24 GB, RTX 5090 de 32 GB, AMD RX 7900 XTX); BF16 requiere ~71 GB (A100/H100 de 80 GB).
- Despliegue: exclusivamente vLLM con el plugin `pb27_vllm` (soporte de runners V1/V2 y fallback `ForwardContext`). No se documenta soporte para llama.cpp, Ollama ni TGI.
- Configuración de servidor sugerida por el autor: `--enforce-eager`, `--no-enable-prefix-caching`, `--kv-cache-memory-bytes 6G`, `--max-num-seqs 16`, `VLLM_ALLOW_LONG_MAX_MODEL_LEN=1`.
- Latencia y throughput: no disponibles. El autor afirma decodificación O(1) a velocidad constante, pero sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Despliegue | Notas |
|---|---|---|---|---|---|
| PseudoBrain-Qwen3-32B-FP8 | ~33,6B denso | 1M (con plugin) | Apache 2.0 | vLLM + plugin pb27 | Modificación arquitectónica no verificada independientemente |
| Qwen3-32B (original) | ~32,8B denso | 32K nativo (extensible con YaRN) | Apache 2.0 | vLLM, TGI, llama.cpp, Ollama | Referencia estable, ampliamente validada |
| Qwen2.5-32B-Instruct | ~32,5B denso | 128K | Apache 2.0 | Múltiples motores | Generación anterior, sin modo thinking |
| Gemma 3 27B | ~27B denso | 128K | Gemma license | vLLM, TGI, Ollama | Multimodal, licencia no Apache |

La comparación directa es difícil porque PseudoBrain no es un modelo nuevo sino un injerto arquitectónico sobre Qwen3-32B. Frente al Qwen3-32B original, la diferencia clave es la ventana efectiva de 1M tokens con caché KV reducida, a costa de depender de un plugin propietario y de renunciar a prefix caching y a otros motores de inferencia. Frente a alternativas de contexto largo como Llama 4 Scout (10M, MoE) o los modelos con atención nativa larga, no hay datos de rendimiento que permitan situarlo.

## Limitaciones y advertencias

- Las afirmaciones de rendimiento (reducción del 98,4 % de caché KV, fidelidad del 99 %+ en distancias temporales, decodificación O(1)) proceden únicamente del autor y no están verificadas de forma independiente en la información disponible.
- Tracción pública mínima: 33 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que los fallos hayan sido detectados por la comunidad.
- Dependencia total del plugin `pb27_vllm`: el modelo no funciona en vLLM estándar, ni en llama.cpp, Ollama o TGI, lo que limita la portabilidad y añade superficie de mantenimiento.
- El autor recomienda `--enforce-eager` y `--no-enable-prefix-caching`, lo que degrada el rendimiento en cargas con prompts compartidos.
- La atención dispersa y el RoPE por bloques pueden degradar la calidad en tareas que requieran recuperación exacta de detalles distribuidos de forma uniforme, un riesgo conocido de los esquemas de memoria aproximada.
- No se documentan idiomas soportados ni evaluación multilingüe específica.
- Riesgo de alucinación y sesgos heredados de Qwen3-32B, sin evaluación adicional publicada para esta variante.
- Licencia Apache 2.0 permite uso comercial, pero conviene auditar la procedencia y el estado de los pesos modificados antes de desplegar en producción.
- Fechas de creación y actualización del repositorio (31 de octubre de 2026) posteriores a la fecha habitual de consulta: verificar la integridad del artefacto antes de confiar en él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/defnoteatin/PseudoBrain-Qwen3-32B-FP8
- Repositorio GitHub del proyecto: https://github.com/defnotean/pseudobrain
- Paper de arquitectura (PDF): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.pdf
- Paper de arquitectura (Markdown): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.md
- Informes de benchmarks del autor: https://github.com/defnotean/pseudobrain/tree/main/reports
- Perfil del autor en GitHub: https://github.com/defnotean
- Perfil del autor en Hugging Face: https://huggingface.co/defnoteatin
- Modelo base: https://huggingface.co/Qwen/Qwen3-32B
