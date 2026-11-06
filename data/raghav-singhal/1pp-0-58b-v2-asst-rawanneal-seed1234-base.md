# Raghav-Singhal/1pp-0.58b-v2-asst-rawanneal-seed1234-base

## Resumen

El modelo `1pp-0.58b-v2-asst-rawanneal-seed1234-base` es un modelo de lenguaje de 580 millones de parámetros desarrollado por Raghav-Singhal en el contexto del proyecto One Persona Pretraining (1PP), asociado al laboratorio DLAB de la EPFL. No es un asistente de propósito general, sino un artefacto de investigación diseñado para estudiar cómo afecta la composición del corpus de preentrenamiento (documentos originales frente a conversaciones reescritas) al comportamiento final del modelo. Forma parte de una escalera de escalado (ladder v2) con cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B), tres condiciones de datos y tres semillas distintas.

La arquitectura es un decoder estilo Llama con 24 capas, dimensión oculta de 1.152, FFN de 4.608 con SwiGLU, 9 cabezas de atención y 3 cabezas KV (head dim 128), RMSNorm, RoPE con base 10.000 y embeddings no atados. La longitud de secuencia es de 4.096 tokens y el tokenizador es el vocabulario de SmolLM2 (49.152 entradas) más un token `<|pad|>`.

La variante concreta que nos ocupa es una ejecución de tipo mid-training: toma el run bruto hasta el paso 9.996 (último paso a learning rate máximo) y sustituye su cooldown (los últimos 1.110 de 11.106 pasos) por conversaciones 1PP reescritas a partir de los mismos documentos, con la pérdida calculada únicamente sobre los turnos del asistente. El resultado es un modelo base que produce texto con formato de chat, pero que no ha pasado por un proceso de alineación tipo RLHF o DPO.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama |
| Parámetros totales | 580.445.568 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (también compatible con text-generation-inference) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder de tipo Llama con 24 capas, hidden size 1.152, FFN de 4.608 con activación SwiGLU, 9 cabezas de atención con 3 cabezas KV (head dim 128), RMSNorm, RoPE con base 10.000, embeddings no atados, sin biases y sin QK-norm. La secuencia máxima es de 4.096 tokens. El tokenizador reutiliza el vocabulario de SmolLM2 (49.152 tokens) añadiendo `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento.

El preentrenamiento utiliza los documentos originales de DCLM-edu durante los primeros 9.996 pasos y, en el cooldown (los últimos 1.110 de 11.106 pasos), conversaciones 1PP reescritas a partir de esos mismos documentos, con la pérdida enmascarada para computarse solo sobre los turnos del asistente. El batch global es de 512 secuencias × 4.096 tokens, con enmascaramiento de atención entre documentos. El optimizador es Muon (matrix LR 0,005) combinado con Adam para el resto de parámetros (LR 3e-3 para embeddings y capa de salida, 3e-3 para las normas), warmup de 699 pasos, fase constante y decaimiento lineal en los últimos 1.110 pasos hasta 1/100, weight decay 0,1, init std 0,0119 y entrenamiento en bf16. El modelo consume 23,29B posiciones de token en total, lo que equivale a 20,3 tokens de asistente por parámetro.

La verificación de los pesos publicados en Hugging Face frente al checkpoint original de Megatron muestra diferencias absolutas de pérdida de validación de 0,0015 y 0,0014 en dos conjuntos de validación, lo que confirma la fidelidad de la conversión. La pérdida de validación final reportada es de 1,807 sobre texto de asistente, 3,422 sobre texto de usuario y 3,194 sobre texto de documento.

## Capacidades

- Generación de texto autoregresiva en inglés con formato de chat ChatML (sin turno de sistema).
- Producción de respuestas con estructura conversacional gracias a la condición de cooldown sobre conversaciones reescritas.
- Modelado de lenguaje general sobre documentos educativos y de dominio abierto (DCLM-edu).
- No dispone de tool calling ni function calling documentados.
- No dispone de capacidades de agente ni de razonamiento multi-paso explícito.
- No dispone de modo thinking, visión, audio ni otras modalidades.
- Multilingüismo limitado al inglés según la model card.
- Capacidad de continuación de texto plano y de generación condicionada por prompt en formato ChatML.

## Casos de uso

- Investigación sobre composición de corpus de preentrenamiento: el modelo sirve como punto de comparación controlado (misma semilla, mismo flujo de datos) frente a la variante raw y a la variante asst completa, permitiendo aislar el efecto del cooldown conversacional en las métricas de validación.
- Estudios de escalado (scaling laws): al formar parte de una ladder con cuatro tamaños y tres semillas, permite ajustar curvas de pérdida frente a cómputo y frente a tokens de asistente por parámetro con réplicas estadísticas.
- Análisis de formatos de chat en modelos base: al producir texto con formato ChatML sin haber pasado por SFT, es útil para estudiar hasta qué punto el preentrenamiento con conversaciones reescritas induce el formato conversacional por sí solo.
- Reproducibilidad de experimentos académicos: la publicación de pesos, logs de wandb y verificación frente a Megatron facilita la réplica de resultados en entornos de investigación con recursos modestos.
- Evaluación de tokenizadores y enmascaramiento de pérdida: el uso del vocabulario SmolLM2 y del enmascaramiento por turno de asistente permite estudiar el impacto de estas decisiones en la pérdida por segmento (asistente, usuario, documento).
- Prototipado de pipelines de generación con TGI: al ser compatible con text-generation-inference y con `transformers`, se puede desplegar en entornos de laboratorio para pruebas de generación a pequeña escala.
- Docencia y experimentación con modelos pequeños: con 580M parámetros y licencia Apache 2.0, es viable para prácticas de ajuste fino y de análisis de sesgos en modelos de baja escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card únicamente reporta pérdidas de validación por tipo de texto y la verificación frente al checkpoint de Megatron:

| Conjunto | Pérdida HF | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| val50m segments [3] | 1,8053 | 1,8068 | 0,0015 |
| raw_val50m segments [8] | 3,1952 | 3,1938 | 0,0014 |

| Tipo de texto | Pérdida de validación (por token) |
|---|---|
| Texto de asistente | 1,807 |
| Texto de usuario | 3,422 |
| Texto de documento | 3,194 |
| Tokens de entrenamiento de esta condición (`reweighted_seg34`) | 1,854 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 1,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 2 y 3 GB para secuencias de 4.096 tokens.
- VRAM estimada en cuantización de 8 bits: en torno a 0,7-1 GB para pesos; en 4 bits, en torno a 0,4-0,6 GB (no se publican cuantizaciones oficiales, pero el tamaño lo permite).
- GPU recomendadas: cualquier GPU consumer con al menos 4-6 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 y H100 funcionan sin problema. El modelo es muy pequeño para el segmento profesional.
- Cabe holgadamente en GPU consumer, incluidas GTX 1660, RTX 3050 y superiores.
- Opciones de despliegue: `transformers` (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y potencialmente llama.cpp/Ollama si se generan conversiones GGUF, aunque no se documentan en el repositorio.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| 1pp-0.58b-v2-asst-rawanneal-seed1234-base | 580M | 4.096 | Apache 2.0 | en | Hugging Face |
| SmolLM2-360M | 360M | 8.192 | Apache 2.0 | en (principalmente) | Hugging Face |
| Qwen2.5-0.5B | 494M | 32.768 | Apache 2.0 | multilingüe | Hugging Face |
| Llama-3.2-1B | 1.240M | 131.072 | Llama 3.2 Community License | multilingüe | Hugging Face |

La comparación con estos modelos es únicamente estructural: el modelo 1PP es un artefacto de investigación sin benchmarks publicados, mientras que SmolLM2, Qwen2.5 y Llama 3.2 cuentan con evaluaciones estándar y están orientados a uso general. En contexto, el modelo 1PP es el más limitado de la tabla (4.096 tokens), y en licencia comparte Apache 2.0 con SmolLM2 y Qwen2.5, mientras que Llama 3.2 usa una licencia comunitaria con restricciones.

## Limitaciones y advertencias

- Modelo base sin alineación: no ha pasado por RLHF, DPO ni SFT supervisado, por lo que puede generar contenido incoherente, ofensivo o factualmente incorrecto.
- Riesgo de alucinación elevado, especialmente fuera del dominio de los documentos DCLM-edu.
- Contexto limitado a 4.096 tokens, insuficiente para tareas de contexto largo o recuperación documental extensa.
- Soporte exclusivo de inglés según la model card; no se garantiza calidad en otros idiomas.
- No es un asistente de propósito general: la propia model card lo declara explícitamente como artefacto de investigación.
- No se documentan evaluaciones de sesgo, toxicidad ni robustez adversarial.
- El formato de chat no incluye turno de sistema, por lo que los prompts con rol `system` no serán interpretados correctamente.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la falta de benchmarks y de alineación desaconseja su uso en producción sin un proceso de ajuste y evaluación adicional.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-asst-rawanneal-seed1234-base
- Variante raw (referencia del mid-training): https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-raw-seed1234-base
- Variante asst completa: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-asst-seed1234-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (wandb, preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Logs de entrenamiento (wandb, SFT): https://wandb.ai/raghav_singhal/1pp-sft
