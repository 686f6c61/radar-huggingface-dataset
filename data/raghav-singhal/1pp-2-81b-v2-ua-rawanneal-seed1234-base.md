# Raghav-Singhal/1pp-2.81b-v2-ua-rawanneal-seed1234-base

## Resumen

El modelo `1pp-2.81b-v2-ua-rawanneal-seed1234-base` es un modelo de lenguaje de tipo decoder Llama entrenado desde cero por Raghav-Singhal (EPFL DLAB) como parte del proyecto One Persona Pretraining (1PP), un artefacto de investigación sobre cómo afecta el formato conversacional (turnos de usuario y asistente) durante el preentrenamiento al comportamiento posterior del modelo. Con 2.807.699.328 parámetros, 24 capas y una longitud de secuencia de 4.096 tokens, se sitúa en el escalón superior de la "ladder v2" del estudio, que abarca cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B) por tres condiciones y tres semillas.

La variante `ua-rawanneal` es un híbrido de "mid-training": entrena sobre los documentos originales de DCLM-edu durante los primeros 48.339 pasos y, en el cooldown final (5.370 pasos), sustituye los documentos por conversaciones reescritas a partir de esos mismos documentos, con pérdida calculada tanto en los turnos de usuario como en los de asistente. El resultado es un modelo base que, sin instrucciones explícitas, tiende a producir texto con formato de chat.

Es relevante ahora porque permite estudiar de forma controlada el efecto del formato de datos (documento frente a conversación) en el preentrenamiento, con streams de datos alineados paso a paso y semillas que solo cambian la inicialización. No es un asistente de propósito general: es una pieza experimental reproducible, con licencia Apache 2.0 y pesos en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 2.688, FFN 10.752 SwiGLU, 21 cabezas de atención / 7 KV heads, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 2.807.699.328 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en bf16) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de 24 capas con atención multi-cabeza agrupada (21 cabezas de consulta y 7 de clave/valor, dimensión de cabeza 128), FFN SwiGLU de 10.752 unidades, normalización RMSNorm y embeddings no atados. El tokenizador usa el vocabulario de SmolLM2 (49.152 tokens) más un token `<|pad|>`; `<|endoftext|>` marca el final de documento. La atención aplica máscara entre documentos (cross-document attention masking) y la longitud de secuencia es de 4.096 tokens.

El preentrenamiento cubre los primeros 53.709 pasos del stream alineado por pasos del estudio 1PP (112,64B posiciones de token), con batch global de 512 secuencias × 4.096 tokens. Durante los primeros 48.339 pasos se usan los documentos originales de DCLM-edu; en el cooldown final de 5.370 pasos se usan conversaciones reescritas a partir de esos mismos documentos, con pérdida en turnos de usuario y de asistente. El optimizador es Muon (escalado por forma, LR matricial 0,005) con Adam para el resto de parámetros (LR 1,29e-3 para embeddings y capa de salida, 3e-3 para las normas), warmup de 3.378 pasos, decaimiento lineal hasta 1/100 en el cooldown, weight decay 0,1, init std 0,0078 y precisión bf16. La pérdida de validación final sobre 2.433 documentos retenidos es de 1,397 en texto de asistente, 1,309 en texto de usuario y 2,848 en texto de documento (1,392 ponderada según la condición `reweighted_seg1234`).

## Capacidades

- Generación de texto autoregresiva en inglés, con formato conversacional ChatML aprendido durante el cooldown (sin turno de sistema).
- Producción de respuestas de asistente y turnos de usuario en el formato `<|im_start|>user\n...<|im_end|>\n<|im_start|>assistant\n...<|im_end|>\n`.
- Parada de generación en `<|im_end|>` (id 2) y `<|endoftext|>` (id 0), ambos declarados en `eos_token_id`.
- No dispone de tool calling, function calling, modo thinking, visión ni audio: es un modelo base sin ajuste por instrucciones.
- Capacidad multilingüe limitada al inglés según la model card.
- Razonamiento, código y matemáticas: no se documentan capacidades específicas ni evaluaciones en esas áreas.

## Casos de uso

- Investigación sobre preentrenamiento: comparar esta variante `ua-rawanneal` con la ejecución completa `1pp-2.81b-v2-ua-seed1234-base` y con la línea base `1pp-2.81b-v2-raw-seed1234-base` para aislar el efecto del cooldown conversacional sobre la pérdida de validación.
- Reproducción de experimentos de escalado: la ladder v2 incluye cuatro tamaños y tres semillas con streams alineados, lo que permite estudiar leyes de escalado y varianza de inicialización con este modelo como escalón superior.
- Estudio de formatos de datos: analizar cómo el formato documento frente a conversación cambia la distribución de salida de un modelo base, usando la pérdida por segmento (asistente, usuario, documento) como métrica.
- Generación de datos sintéticos con formato de chat: al producir texto con estructura ChatML de forma nativa, puede emplearse para generar conversaciones de arranque en pipelines de destilación o aumento de datos, siempre con revisión humana.
- Fine-tuning posterior: al ser un modelo base de 2,81B con licencia Apache 2.0, sirve como punto de partida para SFT o DPO en tareas concretas en inglés, con un coste de cómputo moderado.
- Validación de infraestructura de inferencia: su tamaño permite probar despliegues con transformers, text-generation-inference o vLLM en una sola GPU, verificando plantillas de chat y tokens de parada antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta pérdidas de validación por token sobre 2.433 documentos retenidos:

| Conjunto | Pérdida (HF) | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| val50m segments [3] | 1,3957 | 1,3970 | 0,0013 |
| raw_val50m segments [8] | 2,8498 | 2,8485 | 0,0014 |

| Texto evaluado | Pérdida por token |
|---|---|
| Texto de asistente | 1,397 |
| Texto de usuario | 1,309 |
| Texto de documento | 2,848 |
| Tokens de entrenamiento de esta condición (ponderado) | 1,392 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 5,6 GB solo para pesos, más caché KV y activaciones; en la práctica, entre 8 y 12 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 3 GB de pesos; en 4 bits, alrededor de 1,5 GB (no se publican pesos cuantizados en el repo, habría que generarlos).
- GPU recomendadas: A100 40/80 GB, H100 o L40S para despliegues con batch alto y contexto completo de 4.096 tokens; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para inferencia en bf16 con batch moderado.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB) y, con cuantización, en GPUs de 8 GB.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`) y, previsiblemente, llama.cpp u Ollama tras convertir los pesos a GGUF, aunque no se proporcionan ficheros GGUF en el repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| 1pp-2.81b-v2-ua-rawanneal-seed1234-base | 2,81B | 4.096 | Apache 2.0 | HuggingFace, safetensors | Variante mid-training con cooldown conversacional |
| 1pp-2.81b-v2-ua-seed1234-base | 2,81B | 4.096 | Apache 2.0 | HuggingFace | Ejecución 1PP completa del mismo escalón |
| 1pp-2.81b-v2-raw-seed1234-base | 2,81B | 4.096 | Apache 2.0 | HuggingFace | Línea base con documentos originales |
| SmolLM2 (1,7B) | 1,7B | 8.192 | Apache 2.0 | HuggingFace | Referencia de tamaño inferior; comparte vocabulario de 49.152 tokens |

No se dispone de datos de benchmarks que permitan comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Es un artefacto de investigación (EPFL DLAB), no un asistente de propósito general; la model card lo indica explícitamente.
- Modelo base sin ajuste por instrucciones: no sigue instrucciones de forma fiable ni garantiza respuestas útiles.
- Entrenado únicamente en inglés; el rendimiento en otros idiomas no está caracterizado.
- Contexto limitado a 4.096 tokens, insuficiente para tareas de documento largo.
- No se han documentado sesgos, pero al derivar de DCLM-edu hereda los sesgos y la distribución de ese corpus; no hay evaluaciones de seguridad publicadas.
- Riesgo de alucinación inherente a un modelo base sin alineamiento; no se reportan evaluaciones de veracidad.
- El formato de chat no incluye turno de sistema: introducir uno queda fuera de la distribución de entrenamiento.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la ausencia de evaluaciones de calidad y seguridad desaconseja su uso directo en producción sin fine-tuning y validación previas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso externo ni mantenimiento.

## Enlaces

- HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-ua-rawanneal-seed1234-base
- Ejecución 1PP completa: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-ua-seed1234-base
- Línea base raw: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-raw-seed1234-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento: https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT: https://wandb.ai/raghav_singhal/1pp-sft
