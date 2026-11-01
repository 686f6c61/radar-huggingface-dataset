# SII-Jiaquan/HyLoKV-27B

## Resumen

HyLoKV-27B es un ajuste fino experimental de Qwen3.8-27B desarrollado por SII-Jiaquan (Shanghai Innovation Institute) que sustituye el mecanismo de atención de las últimas 8 capas GQA por un banco de KV compartido de baja latencia. El objetivo es reducir la huella de memoria de la caché KV en contextos largos sin degradar en exceso las capacidades del modelo base, manteniendo intactas las capas de atención lineal (GDN) y la ventana local de 128 tokens.

El modelo es relevante como prueba de concepto de compresión de caché KV en arquitecturas híbridas (atención lineal + GQA). No es un modelo listo para producción: el autor lo describe explícitamente como una implementación de referencia de corrección de calidad, sin kernels fusionados ni optimización de inferencia, y con un rendimiento actual que no supera al nativo.

La arquitectura subyacente es un transformer híbrido de 64 capas con patrón `(GDN×3 + GQA×1)×16`, 24 cabezas de consulta, 4 cabezas KV y dimensión de cabeza 256. El checkpoint completo pesa 53,8 GB en bf16 (26,9B parámetros), de los cuales solo unos 24 MB corresponden a los componentes nuevos (productor global y adaptadores de lectura).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 64 capas con patrón (GDN×3 + GQA×1)×16; 24 cabezas Q / 4 cabezas KV / head_dim 256; últimas 8 capas GQA con KV compartido (HyLoKV) |
| Parametros totales | 26.908.062.656 (26,9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible explícitamente; ventana local fija de 128 tokens y banco compartido para historia lejana; evaluado en NIAH de 4K a 32K |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache-2.0 (heredada del modelo base Qwen/Qwen3.8-27B) |
| Formato de pesos | safetensors (bf16), con index.json de shards y config.json de transformers |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B y modifica únicamente las 8 capas GQA finales. Con `cut_depth = 32`, la salida de la capa H32 actúa como fuente de memoria compartida: los tokens dentro de la ventana local (`local_window = 128`) usan la KV nativa de su capa, mientras que la historia anterior lee de un único banco KV compartido. Cada capa lectora incorpora un adaptador de bajo rango (`reader_rank = 8`) con proyecciones `q_down/q_up/v_down/v_up` más un offset global. El productor global se inicializa copiando el `input_norm`, las proyecciones K/V y la KNorm de la capa 36 (índice 35 en base 0). Los componentes nuevos suman unos 24 MB: 10,5M parámetros del productor y 1,6M de los 8 adaptadores de lectura.

El entrenamiento usó `dolma3_mix` (90%) más `fineweb-2` en chino (10%), 10B tokens de texto web general sin datos matemáticos ni de instrucciones. Se realizaron 8000 pasos con longitud de secuencia 2048, 4096 tokens por lote, 8×H100 con FSDP2 en bf16, learning rate diferencial (1e-5 para el backbone, 3e-4 para los parámetros nuevos), decaimiento coseno y 50 pasos de warmup. El objetivo fue cross-entropy nativo de next-token, entrenando conjuntamente backbone, productor y adaptadores.

## Capacidades

- Generación de texto conversacional y continuaciones de texto general en inglés y chino.
- Razonamiento de conocimiento general (MMLU 80,46% en la variante híbrida).
- Recuperación de información en contexto largo mediante banco KV compartido (NIAH 91,7% en 4K–32K).
- Capacidades matemáticas muy degradadas respecto al base (GSM8K 15,47% frente a 44,28%).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el propio autor señala que la generación de CoT larga (>128 tokens) pierde contexto de tarea.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre compresión de caché KV: el modelo sirve como banco de pruebas para medir la pérdida de calidad al sustituir atención GQA por un banco KV compartido en arquitecturas híbridas, comparando CE, MMLU y NIAH frente al base.
- Experimentos de atención lineal combinada con GQA: permite estudiar cómo interactúan las capas GDN nativas con un banco compartido en las capas GQA finales, útil para diseñar arquitecturas de contexto largo más eficientes.
- Evaluación de recuperación en contexto largo: con NIAH del 91,7% en 4K–32K, es adecuado para probar pipelines de recuperación de documentos largos en entornos de investigación, no en producción.
- Generación de texto general en inglés y chino: puede emplearse para tareas de continuación y resumen de texto web, dado que el entrenamiento se hizo sobre `dolma3_mix` y `fineweb-2`.
- Reproducción de experimentos académicos: el checkpoint incluye `hy_lokv_config.json` y `load_hy_lokv.py`, lo que facilita replicar la carga y el forward híbrido en estudios comparativos.
- Base para futuras optimizaciones de inferencia: el autor indica que el paged KV y los kernels de decodificación agrupada son trabajo futuro, por lo que este checkpoint es el punto de partida para implementar y validar esas optimizaciones.

## Benchmarks y rendimiento

| Métrica | Qwen3.8-27B (base) | HyLoKV-27B (híbrido) |
|---|---|---|
| CE en texto real | 2,256 | 2,312 (Δ +0,056) |
| NIAH 4K–32K (12 casos) | 100% | 91,7% |
| MMLU (14.042) | 82,67% | 80,46% |
| GSM8K (1.319) | 44,28% | 15,47% |

Nota del autor: las cifras del base provienen de un experimento de control con backbone congelado; las del candidato corresponden al mismo checkpoint con forward híbrido. El autor atribuye la caída en GSM8K a la ausencia de datos matemáticos en el entrenamiento (olvido catastrófico) y a la pérdida de contexto de tarea en cadenas de razonamiento de más de 128 tokens.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 53,8 GB solo para pesos, más la caché KV y activaciones; requiere GPUs de 80 GB (A100, H100) para un ajuste holgado.
- GPU recomendadas: H100 80 GB o A100 80 GB; el entrenamiento se realizó con 8×H100.
- En GPU de consumo (RTX 4090 24 GB, RTX 3090 24 GB): no cabe en bf16; requeriría cuantización, no publicada en el repositorio.
- Opciones de despliegue: carga mediante `transformers` con el paquete `qwen_shared` (módulos `model.py`, `attention_only.py`, `ced32_core.py`) y el script `load_hy_lokv.py`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el autor indica que la implementación actual no es más rápida que el forward nativo, ya que `GlobalKVBank` usa `torch.cat`, la atención es gather + FP32 + einsum sin kernels fusionados, y el ahorro de HBM en contexto corto está dominado por los pesos. No se publican cifras de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| HyLoKV-27B | 26,9B | ventana local 128 + banco compartido (evaluado 4K–32K) | 80,46% | 15,47% | Apache-2.0 | HuggingFace (74 descargas) |
| Qwen3.8-27B (base) | 26,9B | no disponible | 82,67% | 44,28% | Apache-2.0 | HuggingFace |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con el base es la más informativa: HyLoKV-27B pierde 2,21 puntos en MMLU, 8,3 puntos en NIAH y 28,81 puntos en GSM8K, a cambio de una reducción lógica de la caché KV en las 8 capas GQA finales. No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El autor la describe como implementación de referencia de corrección de calidad, sin optimización de inferencia; la velocidad no supera al modelo nativo.
- El ahorro real de memoria HBM no se ha medido en contextos largos; en contexto corto está dominado por el peso de los parámetros.
- Caída severa en matemáticas (GSM8K 44,28% → 15,47%) por olvido catastrófico al no incluir datos matemáticos en el entrenamiento.
- Pérdida de contexto de tarea y debilitamiento de la señal de parada en cadenas de razonamiento de más de 128 tokens.
- El entrenamiento usó solo texto web general, sin datos de instrucciones ni de alineación (RLHF/DPO no documentados); el comportamiento en formato chat puede ser limitado.
- Idiomas soportados únicamente inglés y chino; no hay evidencia de rendimiento en castellano.
- Riesgo de alucinación no cuantificado en la información disponible; al ser un modelo base ajustado con texto web, es esperable en tareas de conocimiento factual.
- Sin soporte documentado para vLLM, llama.cpp, Ollama o TGI; el despliegue requiere el paquete `qwen_shared` y código personalizado.
- Sesgos conocidos: no documentados explícitamente; al entrenar con `dolma3_mix` y `fineweb-2`, hereda los sesgos de esos corpus web.
- Licencia Apache-2.0 permite uso comercial, pero las limitaciones técnicas y de calidad desaconsejan producción sin una evaluación adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SII-Jiaquan/HyLoKV-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio LaLaLanD_qwen (paquete `qwen_shared`): no disponible como URL en la información proporcionada
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
