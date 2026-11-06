# Raghav-Singhal/1pp-2.81b-v2-asst-seed1234-base

## Resumen

`1pp-2.81b-v2-asst-seed1234-base` es un modelo de lenguaje de 2.807.699.328 parámetros desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP), un artefacto de investigación asociado a EPFL DLAB. No es un asistente de propósito general: es el peldaño de 2,81B de una escalera de escalado (ladder v2) diseñada para estudiar cómo afecta la composición del corpus de preentrenamiento al comportamiento conversacional del modelo. La condición concreta de esta variante es "conversaciones reescritas con pérdida solo en los turnos del asistente" y la semilla es 1234.

La arquitectura es un decoder estilo Llama de 24 capas, hidden 2.688, FFN 10.752 con SwiGLU, 21 cabezas de atención y 7 cabezas KV (head dim 128), RMSNorm, RoPE con base 10.000, embeddings no atados y sin biases ni QK-norm. La longitud de secuencia es de 4.096 tokens y el tokenizador es el vocabulario de SmolLM2 (49.152 entradas) más un token `<|pad|>`.

Su relevancia es metodológica más que práctica: forma parte de un conjunto de 36 modelos (cuatro tamaños × tres condiciones × tres semillas) entrenados desde cero sobre el mismo flujo de datos alineado por pasos, lo que permite aislar el efecto de la condición de datos y de la inicialización. La model card advierte explícitamente de que es un artefacto de investigación y no un asistente de uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 2.688, FFN 10.752 SwiGLU, 21 cabezas de atención / 7 KV, head dim 128, RMSNorm, RoPE base 10.000) |
| Parametros totales | 2.807.699.328 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en bf16) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso de estilo Llama con 24 capas, dimensión oculta de 2.688 y FFN de 10.752 con activación SwiGLU. Usa 21 cabezas de atención con 7 cabezas KV (atención agrupada, head dim 128), RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados, sin biases y sin QK-norm. La longitud de secuencia es de 4.096 tokens y el tokenizador parte del vocabulario de SmolLM2 (49.152 tokens) al que se añade `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento.

El preentrenamiento se realizó desde cero sobre las conversaciones 1PP reescritas a partir de los documentos originales, aplicando la pérdida únicamente en los turnos del asistente. Se consumieron los primeros 53.709 pasos del flujo alineado por pasos de 1PP (112,64B posiciones de token), que coinciden con los primeros pasos de la pasada principal del estudio (31.777 pasos en el mismo orden). El batch global fue de 512 × 4.096 tokens con enmascaramiento de atención entre documentos. El optimizador es Muon (shape scaling, LR matricial 0,005) combinado con Adam para el resto de parámetros (LR 1,29e-3 para embeddings y capa de salida, 3e-3 para las normas), con 3.378 pasos de warmup, fase constante y decaimiento lineal en los últimos 5.370 pasos hasta 1/100, weight decay 0,1, init std 0,0078 y precisión bf16. La relación de entrenamiento es de 20,3 tokens de asistente por parámetro.

La pérdida de validación del checkpoint final, calculada sobre 2.433 documentos retenidos, es de 1,375 sobre texto de asistente, 7,456 sobre texto de usuario, 3,049 sobre texto de documento y 1,422 en la métrica ponderada `reweighted_seg34` (que pondera las conversaciones adversariales según su cuota de entrenamiento del 11,18 %). Los pesos de Hugging Face se verificaron contra el checkpoint de Megatron recalculando pérdidas de validación, con una diferencia absoluta de 0,0013 en ambos conjuntos comprobados.

## Capacidades

- Generación de texto autoregresiva en inglés con formato de conversación ChatML, aprendido durante el preentrenamiento en esta condición.
- Producción de turnos de asistente coherentes con el formato `<|im_start|>user ... <|im_end|>` / `<|im_start|>assistant ... <|im_end|>`, sin turno de sistema (los modelos nunca vieron uno).
- Parada de generación en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0), ambos declarados en `eos_token_id`.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking.
- No se documentan capacidades multilingües: el modelo está etiquetado únicamente como inglés.
- Es un modelo base, no ajustado por instrucciones (existen variantes SFT separadas en la misma colección).

## Casos de uso

- Investigación sobre composición de datos de preentrenamiento: el modelo sirve como punto de comparación controlado frente a las otras condiciones y semillas de la escalera, permitiendo medir el efecto de reescribir documentos como conversaciones con pérdida en turnos de asistente.
- Estudios de escalado (scaling laws): al compartir flujo de datos alineado por pasos con los peldaños de 0,58B, 0,98B y 1,66B, permite ajustar curvas de pérdida frente a parámetros y tokens con condiciones idénticas.
- Análisis de sensibilidad a la inicialización: la semilla 1234 frente a las semillas 28 y 42 (mismo orden de batches) aísla la varianza introducida únicamente por la init de parámetros.
- Reproducción de experimentos: los logs de entrenamiento están publicados en W&B (`1pp-training` y `1pp-sft`), lo que facilita replicar o auditar el proceso con los hiperparámetros documentados.
- Generación de diálogo sintético en inglés para construir datasets de investigación: el modelo produce turnos de asistente en formato ChatML que pueden usarse como material de partida en experimentos de destilación o aumento de datos, siempre con revisión humana.
- Verificación de implementaciones de inferencia: las pérdidas de referencia frente a Megatron (diferencia de 0,0013) permiten usar el modelo como caso de prueba para validar pipelines de conversión de pesos o de cálculo de pérdida.
- Evaluación de formatos de chat: al renderizar exactamente el ChatML sin turno de sistema mediante su `chat_template` incluido, sirve para probar herramientas de plantillas conversacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta pérdidas de validación:

| Metrica | Valor |
|---|---|
| Pérdida en texto de asistente | 1,375 |
| Pérdida en texto de usuario | 7,456 |
| Pérdida en texto de documento | 3,049 |
| Pérdida ponderada `reweighted_seg34` | 1,422 |
| Verificación HF vs Megatron, val50m segments [3] | 1,3734 vs 1,3747 (dif. abs. 0,0013) |
| Verificación HF vs Megatron, raw_val50m segments [8] | 3,0499 vs 3,0485 (dif. abs. 0,0013) |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 5,6 GB solo para pesos (tamaño del repo), más caché KV y activaciones; en la práctica, entre 7 y 9 GB para secuencias de 4.096 tokens con batch pequeño.
- En cuantización de 8 bits, los pesos ocuparían alrededor de 2,8 GB; en 4 bits, alrededor de 1,4 GB (estimaciones a partir del número de parámetros, no publicadas por el autor).
- GPU recomendadas: A100 o H100 para evaluación por lotes y comparación sistemática entre las 36 variantes de la escalera; RTX 4090 o RTX 3090 para inferencia interactiva en bf16.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en bf16 para contextos moderados, y en tarjetas de 4-6 GB si se cuantiza.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repo). No se documenta soporte verificado de llama.cpp, Ollama ni vLLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| 1pp-2.81b-v2-asst-seed1234-base | 2,81B | 4.096 | Apache 2.0 | Artefacto de investigación, solo inglés, condición "conversaciones reescritas + pérdida en asistente" |
| 1pp-2.81b-v2-asst-rawanneal-seed1234-sft | 2,81B (misma arquitectura) | 4.096 | Apache 2.0 | Misma escalera, condición documentos originales y luego conversaciones reescritas en el cooldown, con SFT posterior |
| 1pp-2.81b-v2-asst-sft | 2,81B (misma arquitectura) | 4.096 | Apache 2.0 | Variante de la misma escalera con ajuste supervisado |
| SmolLM2 (familia) | 135M / 360M / 1,7B | hasta 8.192 en algunas variantes | Apache 2.0 | Referencia de modelos pequeños de propósito general; comparte vocabulario con este modelo, pero no es una comparación controlada de rendimiento |

No se dispone de datos de benchmarks que permitan comparar rendimiento con alternativas de la misma categoría; la comparación con la familia SmolLM2 se limita al solapamiento de tokenizador y a la licencia.

## Limitaciones y advertencias

- La model card indica explícitamente que es un artefacto de investigación del proyecto 1PP (EPFL DLAB) y no un asistente de propósito general.
- Sesgos conocidos: no documentados por el autor; al entrenarse sobre un corpus de conversaciones derivado de un conjunto de documentos concreto, puede heredar los sesgos de esa fuente.
- Riesgo de alucinación: no evaluado ni cuantificado en la información disponible.
- Limitaciones de idioma: solo inglés; no se documenta comportamiento en castellano ni en otros idiomas.
- Limitaciones de contexto: ventana de 4.096 tokens, corta para tareas de contexto largo.
- Formato restringido: no admite turno de sistema; introducirlo supone una condición no vista durante el entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo base sin ajuste por instrucciones no es adecuado para despliegues de producto sin trabajo adicional de alineamiento y evaluación.
- No hay evidencia publicada de soporte de tool calling, agentes o razonamiento multi-paso; no debe asumirse.
- Las variantes SFT de la misma escalera están publicadas por separado; usar esta versión base como asistente produciría respuestas en formato conversacional pero sin alineamiento instructivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-asst-seed1234-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Variante SFT de la misma escalera: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-asst-sft
- Variante con anneal y SFT: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-asst-rawanneal-seed1234-sft
- Logs de entrenamiento (W&B): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT (W&B): https://wandb.ai/raghav_singhal/1pp-sft
