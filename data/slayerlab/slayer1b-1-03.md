# SlayerLab/Slayer1B-1.03

## Resumen

Slayer1B 1.03 es un modelo de lenguaje causal decoder-only de 1.073.912.851 parámetros desarrollado por SlayerLab, con el polaco como idioma principal y el inglés como secundario. Se trata de un entrenamiento from scratch, no de un fine-tuning sobre una base existente, y forma parte de una línea de releases incrementales (1.00, 1.01, 1.02 y 1.03) que documentan la evolución del mismo run de preentrenamiento. La versión 1.03 continúa el entrenamiento desde el checkpoint final de 1.02 (paso 5720) hasta el paso 7150, acumulando 7.497.318.400 tokens vistos, aproximadamente 7,0 tokens por parámetro.

La arquitectura es un transformer decoder-only de 20 capas con d_model 2048, 16 cabezas de atención (MHA, dimensión de cabeza 128), normalización pre-norm con RMSNorm, QK-norm, RoPE con theta 500.000, value residual, MLP SwiGLU con hidden 5462 y sin biases. El contexto máximo es de 4096 tokens y el tokenizador es un BPE byte-level de 32.768 tokens.

Su relevancia es doble: por un lado, es un modelo pequeño y de licencia Apache 2.0 entrenado específicamente para polaco, un idioma con menos recursos que el inglés; por otro, la publicación transparente de la curva de entrenamiento, los hashes de los checkpoints y los resultados intermedios lo convierte en un caso de estudio útil sobre escalado de tokens en modelos de ~1B. Es importante señalar que 1.03 es un estado intermedio de entrenamiento con learning rate constante, no un modelo final con decaimiento de LR aplicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, 20 capas, d_model 2048, 16 cabezas MHA (head dim 128) |
| Parametros totales | 1.073.912.851 (embeddings de entrada y salida atados, contados una vez) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados solo en fp32) |
| Idiomas soportados | polaco (principal), inglés (secundario) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp32, `model.safetensors`), exportado desde `ckpt_7150.pt` |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only clásica con varias modificaciones modernas: pre-norm con RMSNorm, QK-norm para estabilizar la atención, RoPE con theta 500.000 para codificación posicional, value residual y MLP SwiGLU (hidden 5462) sin biases. Los embeddings de entrada y salida están atados y se cuentan una sola vez en el recuento de parámetros. El tokenizador es un BPE byte-level de 32.768 tokens con id de EOS 0.

El entrenamiento se realizó sobre el dataset `SlayerLab/slayer-pl-8x3b` (revisión `d50df04a`), en un único stream de ventanas de 4096 tokens donde cada ventana se usa como máximo una vez. La versión 1.03 continúa el stream de 1.02: los pasos 5390–7150 usan el pack-03 (1.890.850.536 tokens disponibles). El batch es de 256 × 4096 = 1.048.576 tokens por paso, con DDP sobre 4 GPUs. Los pasos 5721–6750 se ejecutaron en 4 × RTX 4090 (24 GB) y los pasos 6751–7150 en 4 × L40S (48 GB), reanudando desde `ckpt_6750.pt` con la misma receta y orden de datos. El schedule de learning rate es constante a 6e-4 durante todo el entrenamiento (el decaimiento final se aplicará al cerrar la línea Slayer1B). El optimizador combina Muon (lr 0.02) para las matrices de pesos ocultas y AdamW (lr 6e-4, weight decay 0.1) para el resto. La pérdida final de entrenamiento en el paso 7150 fue 2.3955.

## Capacidades

- Generación de texto en polaco e inglés con un modelo entrenado desde cero, no derivado de una base multilingüe.
- Modelado causal de lenguaje: el checkpoint es un estado intermedio de preentrenamiento, por lo que sus capacidades son las propias de un LM base sin instrucciones ni alineación.
- Razonamiento básico y comprensión lectora limitada, según los resultados de benchmarks (HellaSwag, PIQA, LAMBADA, ARC-Challenge).
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso documentadas.
- No dispone de visión, audio ni modo thinking.
- Multilingüismo limitado a polaco e inglés; no se documentan otros idiomas.

## Casos de uso

- Investigación sobre escalado de tokens en modelos de ~1B: el modelo publica la curva de entrenamiento, los hashes de checkpoints y los resultados en pasos intermedios (5720, 6750, 6900, 7050, 7150), lo que permite estudiar la relación entre tokens vistos y métricas como la perplejidad de LAMBADA (de 159,66 en 1.00 a 42,83 en 1.03).
- Generación de texto en polaco como base para fine-tuning: al ser un LM base con licencia Apache 2.0, se puede adaptar con SFT o DPO para tareas concretas de generación, resumen o reescritura en polaco.
- Completado de texto y autocompletado en aplicaciones de escritura en polaco: con 4096 tokens de contexto y un tokenizador BPE de 32.768 tokens, es adecuado para asistencia de redacción en documentos de longitud media.
- Experimentación académica con arquitecturas modernas en tamaño pequeño: la combinación de QK-norm, RoPE con theta 500.000, value residual y Muon permite reproducir y comparar recetas de entrenamiento en hardware de consumo (4 × RTX 4090).
- Evaluación de contaminación de benchmarks: el autor documenta un escaneo de leak sobre 22.603.122 documentos y reporta solapamiento de n-gramas con BoolQ, MMLU y ARC en la parte inglesa compartida, lo que convierte al modelo en un caso práctico para estudiar protocolos de evaluación.
- Base para modelos especializados en dominios polacos: partiendo de un checkpoint con 7.500 millones de tokens vistos en polaco, se puede continuar el preentrenamiento con corpus jurídicos, médicos o técnicos en polaco.
- Despliegue en entornos con recursos limitados: con 1.073 millones de parámetros y pesos fp32 (4,3 GB de repo), es viable en GPUs de consumo para inferencia tras cuantización, aunque el autor no publica versiones cuantizadas.

## Benchmarks y rendimiento

Resultados de lm-evaluation-harness 0.4.13, zero-shot, test sets completos, fp32, batch 8, sobre el checkpoint final de cada release. La columna 1.03 se calculó en un runtime distinto (torch 2.8.0 / numpy 2.2.6 frente a torch 2.14.1 / numpy 2.5.3), por lo que no es una comparación en entorno idéntico.

| Benchmark | 1.00 (1430) | 1.01 (2860) | 1.02 (5720) | 1.03 (7150) |
|---|---:|---:|---:|---:|
| Tokens de entrenamiento | 1,50 B | 3,00 B | 6,00 B | 7,50 B |
| HellaSwag, acc_norm | 0,2859 | 0,3080 | 0,3382 | 0,3476 |
| PIQA, acc | 0,5865 | 0,5903 | 0,6224 | 0,6257 |
| LAMBADA (OpenAI), acc | 0,1995 | 0,2639 | 0,3109 | 0,3150 |
| LAMBADA (OpenAI), perplexity ↓ | 159,66 | 69,37 | 45,77 | 42,83 |
| ARC-Challenge, acc_norm ¹ | 0,2142 | 0,2432 | 0,2500 | 0,2611 |
| BoolQ, acc ¹ | 0,5343 | 0,6083 | 0,6055 | 0,6055 |
| MMLU, acc ¹ | 0,2301 | 0,2308 | 0,2323 | 0,2292 |

¹ Advertencia del autor: un escaneo de leak sobre el superset de entrenamiento (`SlayerLab/slayer-pl-8x3b@d50df04a`, 22.603.122 documentos) encontró solapamiento de n-gramas con ítems de test de BoolQ, MMLU y ARC en la parte inglesa compartida (`shared/en`: 1428 / 1429 / 1345 documentos). El solapamiento no es una tasa de contaminación medida y la evaluación está en curso. Los releases 1.00–1.03 se entrenaron con datos sin filtrar; estas tres filas deben leerse con esa cautela. MMLU está cerca del nivel de azar (0,25) en todos los releases.

Los checkpoints intermedios de 1.03 (6900 y 7050) obtuvieron, por ejemplo, perplejidad LAMBADA de 40,78 y 45,68 y BoolQ de 0,6180 y 0,5908 respectivamente; el autor no atribuye causa a estas variaciones. El protocolo de leaderboard usado en las cards 1.00–1.02 (`glint_parity_eval.py`) no se ha ejecutado todavía sobre 1.03.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: los pesos ocupan aproximadamente 4,3 GB (1.073.912.851 parámetros × 4 bytes), más overhead de activaciones y KV cache para 4096 tokens.
- No se publican versiones cuantizadas (GGUF, int8, int4) ni estimaciones de VRAM para cuantización.
- GPU recomendadas: el entrenamiento se realizó en 4 × RTX 4090 (24 GB) y 4 × L40S (48 GB); para inferencia, una única GPU con al menos 8–12 GB de VRAM debería ser suficiente en fp32 con margen para el contexto completo, aunque el autor no lo documenta.
- Cabe en GPUs de consumo: sí, previsiblemente en RTX 3090, RTX 4090, RTX 4080 y similares con 12 GB o más en fp32; no hay datos oficiales de consumo de VRAM en inferencia.
- Opciones de despliegue: los pesos son un state dict de PyTorch en safetensors y no son un `transformers.AutoModel`; la clase es `GPT` en `train_gpt_ref_r23.py` (incluido en el repo) y se carga con el script `load_slayer`. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---:|---|---|---|---|
| Slayer1B 1.03 | 1.073.912.851 | 4096 | pl, en | Apache 2.0 | safetensors (state dict PyTorch) |
| Alternativas de ~1B para polaco | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos comparables de la misma categoría (modelos de ~1B orientados a polaco o modelos base de tamaño similar). No se ofrece comparación numérica con alternativas.

## Limitaciones y advertencias

- Es un estado intermedio de entrenamiento con learning rate constante (6e-4); el decaimiento final de LR se aplicará al cerrar la línea Slayer1B, por lo que el rendimiento final del modelo será distinto al de este checkpoint.
- No es un modelo instruido ni alineado: no hay RLHF, DPO ni SFT documentados; no debe usarse directamente como asistente conversacional.
- MMLU está en torno al nivel de azar (0,2292 en 1.03), lo que indica capacidad de conocimiento factual muy limitada.
- Riesgo de contaminación en BoolQ, MMLU y ARC: el escaneo de leak detectó solapamiento de n-gramas con ítems de test en la parte inglesa compartida; los resultados de esas tres filas deben interpretarse con cautela.
- El enmascaramiento de datos personales es basado en reglas (etiquetas `[EMAIL]`, `[TELEFON]`, `[PESEL]`, `[NIP]`, `[REGON]`, `[DOWOD]`) y no garantiza la eliminación de todos los datos personales.
- Los 5133 documentos que coinciden con el escaneo de leak solo se excluyen a partir del pack-04 (paso nativo 7193), es decir, después de 1.03.
- Idiomas limitados a polaco e inglés; no se documenta soporte de otros idiomas, incluido el castellano.
- Los pesos no son compatibles con `transformers.AutoModel`; requieren el código incluido en el repositorio (`train_gpt_ref_r23.py`, `load_slayer`), lo que limita la integración con ecosistemas estándar.
- No hay versiones cuantizadas publicadas, lo que dificulta el despliegue en hardware de bajos recursos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo es un LM base sin garantías de calidad para producción.
- Variabilidad entre checkpoints intermedios: los pasos 6900 y 7050 muestran diferencias notables en perplejidad LAMBADA (40,78 frente a 45,68) sin causa atribuida, lo que sugiere inestabilidad en el estado de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SlayerLab/Slayer1B-1.03
- Versión anterior 1.02: https://huggingface.co/SlayerLab/Slayer1B-1.02
- Versión anterior 1.01: https://huggingface.co/SlayerLab/Slayer1B-1.01
- Versión anterior 1.00: https://huggingface.co/SlayerLab/Slayer1B-1.00
- Checkpoints de entrenamiento con estado del optimizador: https://huggingface.co/SlayerLab/Slayer1B-1.03-checkpoints
- Curva de entrenamiento (pasos hasta 7150): https://track.fabryka.ai/run/7ca4f84f-3b07-4525-8cde-f3a936dc3425
- Serie de benchmarks 1.00–1.03: https://track.fabryka.ai/run/1426c0a8-2f07-5a03-80fc-92f7e922aa4b
- Dataset de entrenamiento: https://huggingface.co/datasets/SlayerLab/slayer-pl-8x3b
