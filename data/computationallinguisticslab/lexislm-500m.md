# ComputationalLinguisticsLab/LexisLM-500m

## Resumen

LexisLM-500m es un modelo de lenguaje base en griego desarrollado por ComputationalLinguisticsLab, entrenado desde inicialización aleatoria sobre texto griego. Con 502.193.664 parámetros (0,502B), se posiciona como una alternativa compacta y especializada frente a modelos multilingües de mayor tamaño, ofreciendo un tokenizador BPE byte-level dedicado al griego con 32.000 entradas base que preserva mayúsculas y acentos.

El modelo emplea una arquitectura decoder-only estilo LLaMA con embeddings de entrada/salida compartidos, RMSNorm, embeddings posicionales rotatorios (RoPE) y bloques feed-forward SwiGLU. El preentrenamiento se realizó sobre aproximadamente una pasada de 22.000 millones de tokens, y el modelo se distribuye únicamente como checkpoint base (pretrained-only), sin ajuste por instrucciones.

Su relevancia radica en la escasez de modelos compactos específicamente entrenados para el griego desde cero, lo que lo hace útil para investigación lingüística, generación de texto en griego y como base para fine-tuning posterior en tareas downstream del idioma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo LLaMA (embeddings atados, RMSNorm, RoPE, SwiGLU) |
| Parametros totales | 502.193.664 (0,502B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Griego (el) |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only con 16 capas, tamaño oculto de 1.536, 16 cabezas de atención con dimensión de cabeza de 96, y tamaño oculto del feed-forward de 4.096. Utiliza embeddings de entrada/salida atados, RMSNorm (epsilon 1e-5), RoPE con theta 10.000 y bloques SwiGLU. El vocabulario del modelo es de 32.004 entradas, de las cuales 32.000 corresponden al tokenizador BPE byte-level griego (con `<unk>`, `<bos>`, `<eos>` y `<pad>`) y cuatro adicionales reservadas para una extensión de tokens de chat (append-only), aunque el modelo no está ajustado por instrucciones. El tokenizador usa normalización NFC y preserva mayúsculas y acentos; se entrenó sobre 20 millones de ocurrencias de palabras (20% Wikipedia griega, 80% FineWeb2-Greek).

El preentrenamiento se realizó sobre aproximadamente una pasada de 22.000 millones de tokens, con AdamW (betas 0,9 y 0,95), tasa de aprendizaje máxima de 0,0003 con 2.000 pasos de warmup y decaimiento coseno hasta 0,00003, weight decay 0,1 y clipping de gradiente en 1,0. No se menciona RLHF, DPO ni ajuste por instrucciones; el modelo es exclusivamente base. Los documentos de preentrenamiento se separaron con `<eos>`, por lo que se recomienda anteponer `<eos>` al prompt para iniciar un documento nuevo, ya que el tokenizador no lo añade automáticamente.

## Capacidades

- Generación de texto en griego (modelo base de completado, no instruido).
- Modelado de lenguaje y continuación de documentos con contexto de hasta 4.096 tokens.
- Tokenización específica para griego que preserva mayúsculas y acentos (normalización NFC).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (modelo base).
- Capacidades multilingües: limitadas al griego; el vocabulario y los datos son específicos de ese idioma.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Punto de partida para fine-tuning supervisado y ajuste por instrucciones en griego.

## Casos de uso

- Investigación lingüística del griego: el modelo permite estudiar distribuciones léxicas, morfología y sintaxis del griego mediante análisis de perplejidad y generación controlada, gracias a su tokenizador dedicado que preserva acentos y mayúsculas.
- Generación de texto en griego para prototipos: al ser un modelo base de completado, puede emplearse para generar borradores de texto en griego en aplicaciones de investigación donde no se requiera instrucción explícita, con prompts precedidos de `<eos>`.
- Base para fine-tuning en tareas downstream: su tamaño compacto (0,5B) y su licencia (no disponible, a verificar) lo hacen adecuado como punto de partida para ajuste supervisado en clasificación, resumen o generación en griego con recursos limitados.
- Evaluación de modelos compactos frente a multilingües: sirve como referencia para comparar el rendimiento de un modelo entrenado desde cero en griego frente a modelos multilingües de mayor tamaño en benchmarks como ARC, MMLU y TruthfulQA traducidos al griego.
- Experimentación académica con presupuesto de cómputo reducido: sus 0,5B parámetros permiten entrenar y evaluar variantes en una sola GPU, facilitando la reproducción de experimentos del paper asociado.
- Generación de datos sintéticos en griego para aumento de corpus: puede utilizarse para producir texto adicional en griego que, tras filtrado, alimente pipelines de entrenamiento de otros modelos o sistemas de PLN.

## Benchmarks y rendimiento

| Benchmark griego | Shots | Preguntas | Checkpoint base |
|---|---:|---:|---:|
| ARC-Easy, precisión bruta | 25 | 2.376 | 44,4% |
| ARC-Easy, precisión normalizada | 25 | 2.376 | 41,9% |
| ARC-Challenge, precisión normalizada | 25 | 1.168 | 25,3% |
| MMLU, precisión | 5 | 14.042 | 25,3% |
| TruthfulQA, MC1 | 0 | 817 | 24,7% |
| TruthfulQA, MC2 | 0 | 817 | 42,1% |

Métricas de modelado de lenguaje en validación (distribución de preentrenamiento: Wikipedia griega y FineWeb2-Greek):

| Métrica | Valor |
|---|---:|
| Pérdida de validación | 2,426 |
| Perplejidad de validación | 11,31 |
| Bits por byte | 0,466 |
| Bits por carácter | 0,826 |

Las evaluaciones de benchmarks son sobre conjuntos completos de ARC, MMLU y TruthfulQA traducidos al griego por ILSP, con selección de demostraciones con semilla 1337 y sin truncado de preguntas. No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, aproximadamente 1 GB para los pesos (502M parámetros × 2 bytes); en cuantización de 8 bits, alrededor de 0,5 GB; en 4 bits, aproximadamente 0,25 GB (estimaciones teóricas, no verificadas en la información disponible).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para bfloat16; tarjetas consumer como RTX 3060, RTX 4060, RTX 4090 son suficientes. Para entrenamiento o fine-tuning, se recomienda al menos una A100 o H100 por comodidad, aunque el tamaño permite ajuste en GPUs consumer de gama alta.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs consumer modernas con 4 GB o más de VRAM.
- Opciones de despliegue: transformers (biblioteca indicada), text-generation-inference (tag presente), endpoints compatibles; no se confirma soporte de llama.cpp, Ollama o vLLM en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de comparación con modelos similares en la información proporcionada. Como referencia cualitativa, se trata de un modelo base monolingüe de 0,5B parámetros con contexto de 4.096 tokens y licencia no especificada; la comparación con alternativas requeriría datos de benchmarks y licencia que no están disponibles.

| Modelo | Parámetros | Contexto | Idioma | Licencia |
|---|---:|---:|---|---|
| LexisLM-500m | 0,502B | 4.096 | Griego | no disponible |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo exclusivamente base (pretrained-only): no está ajustado por instrucciones, por lo que no sigue instrucciones de forma fiable ni mantiene diálogos multi-turno.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar contenido factualmente incorrecto; los resultados en TruthfulQA (MC1 24,7%) indican una fiabilidad limitada en veracidad.
- Sesgos conocidos: no se documentan sesgos específicos en la información disponible; los datos de preentrenamiento (Wikipedia y FineWeb2) pueden introducir sesgos propios de esas fuentes.
- Limitaciones de idioma: entrenado únicamente en griego; su uso en otros idiomas no está soportado y producirá resultados deficientes.
- Limitación de contexto: 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Restricciones de licencia: la licencia no está disponible en la información proporcionada; debe verificarse antes de cualquier uso comercial.
- Caveat de producción: requiere anteponer `<eos>` manualmente al prompt para iniciar un documento nuevo, ya que el tokenizador no lo añade; los tokens de chat reservados no implican capacidad de instrucción.
- Rendimiento modesto en benchmarks: los resultados en MMLU (25,3%) y ARC-Challenge (25,3%) son propios de un modelo base pequeño, no de un asistente.

## Enlaces

- Hugging Face: https://huggingface.co/ComputationalLinguisticsLab/LexisLM-500m
- Paper (arXiv): https://arxiv.org/abs/2611.10209
- Dataset FineWeb2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
