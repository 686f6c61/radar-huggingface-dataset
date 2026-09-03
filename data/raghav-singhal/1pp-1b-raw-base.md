# Raghav-Singhal/1pp-1b-raw-base

## Resumen

El modelo **1pp-1b-raw-base** es un experimento de investigación del proyecto One Persona Pretraining (1PP) del laboratorio DLAB de la EPFL. Forma parte de un estudio 3×3 que combina tres tamaños (0.5B, 1B y 1.7B) con tres condiciones de preentrenamiento sobre el mismo corpus de 47,8 millones de documentos. Esta variante concreta corresponde a la condición "documentos originales" (raw baseline), es decir, se entrenó sobre los textos tal cual, sin reescribirlos como conversaciones.

Con 0,98 mil millones de parámetros y una arquitectura estilo Llama, el modelo está diseñado para investigar cómo afecta el formato de los datos de preentrenamiento al comportamiento posterior del modelo. No es un asistente conversacional de propósito general, sino un artefacto de investigación para estudiar el efecto de la "persona" en el preentrenamiento. Su relevancia radica en que permite aislar variables en el diseño de pipelines de entrenamiento, algo poco común en modelos publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama-style decoder (24 capas, hidden 1536, FFN 6144 SwiGLU, 12 heads / 4 KV heads, head dim 128, RMSNorm, RoPE base 10000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 981.545.472 (0,98B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (solo pesos en bf16 safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (también compatible con Megatron checkpoint) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only estilo Llama con 24 capas, dimensión oculta de 1.536, FFN de 6.144 con activación SwiGLU, 12 cabezas de atención y 4 cabezas KV (head dim 128). Usa RMSNorm, RoPE con base 10.000, embeddings no atados y sin sesgos. El tokenizador es el vocabulario de SmolLM2 (49.152 tokens) más un token especial `<|pad|>`, y `<|endoftext|>` marca el final de documento.

El preentrenamiento se realizó sobre los documentos originales de DCLM-edu (sin reescritura conversacional), con pérdida sobre todos los tokens del documento y el token de fin. Se procesaron 47,8 millones de documentos (66,2 mil millones de tokens) en 31.777 pasos con batch global de 512×4.096 tokens, usando enmascaramiento de atención entre documentos y best-fit packing. El optimizador fue Muon (con escalado por forma y LR de matriz 0,005) combinado con Adam para embeddings y normas, warmup de 2.000 pasos, tasa constante con decaimiento lineal en el último 10% hasta 1/100, weight decay 0,1 y precisión bf16. La pérdida de validación final (sobre 2.433 documentos held-out) fue de 2,574 para texto de asistente, 2,620 para texto de usuario y 2,458 para texto de documento.

## Capacidades

- Generación de texto autoregresiva en inglés, como modelo base sin fine-tuning instructivo.
- Soporte de formato ChatML (sin turno de sistema) si se usa la plantilla incluida, aunque el modelo no fue entrenado para seguir instrucciones.
- Capacidad de procesar secuencias de hasta 4.096 tokens.
- Reproducibilidad verificada: los pesos de HuggingFace se compararon con el checkpoint de Megatron, con diferencias de pérdida de 0,0018.
- No dispone de tool calling, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Investigación académica sobre el efecto del formato de datos en el preentrenamiento: el modelo sirve como baseline "raw" para comparar con las variantes conversacionales del mismo estudio.
- Fine-tuning posterior para tareas específicas de generación de texto en inglés, partiendo de un modelo base denso de ~1B parámetros.
- Análisis de la pérdida de validación y del comportamiento de modelos pequeños entrenados con diferentes condiciones de datos.
- Estudio de la influencia de la máscara de pérdida (loss mask) en la calidad de la representación aprendida.
- Experimentos de alineación o adaptación a dominios concretos, dado su tamaño reducido y licencia permisiva.
- Reproducción de experimentos de preentrenamiento a pequeña escala para validar metodologías antes de escalar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica reportada es la pérdida de validación por token sobre documentos held-out:

| Conjunto | Pérdida (HF) | Pérdida (Megatron) | Diferencia absoluta |
|---|---|---|---|
| val50m segments [3] | 2,5726 | 2,5744 | 0,0018 |
| raw_val50m segments [8] | 2,4600 | 2,4582 | 0,0018 |

Estos valores indican consistencia entre implementaciones, pero no son comparables con benchmarks de capacidad.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la documentación del modelo.
- Con 0,98B parámetros en bf16, el peso ocupa aproximadamente 2 GB, por lo que es viable en GPUs consumer con al menos 4-6 GB de VRAM (estimación razonable, no dato oficial).
- Para inferencia se puede usar transformers, vLLM, llama.cpp u Ollama, aunque no hay cifras de latencia o throughput publicadas.
- El entrenamiento original se realizó con Megatron, por lo que el checkpoint es compatible con ese framework.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de tamaño similar. Al ser un artefacto de investigación sin benchmarks estándar, no es posible establecer una comparación objetiva con alternativas como SmolLM2-1.7B o Qwen2.5-0.5B. La información disponible se limita a la pérdida de validación interna del estudio 1PP.

## Limitaciones y advertencias

- Modelo base sin alineación: no está entrenado para seguir instrucciones ni para ser un asistente conversacional; puede generar contenido incoherente, ofensivo o no deseado.
- Solo soporta inglés; no hay capacidades multilingües.
- Contexto limitado a 4.096 tokens, insuficiente para tareas que requieran ventanas largas.
- No se han evaluado sesgos ni riesgos de alucinación; al ser un modelo de investigación, no está pensado para uso en producción.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no tiene garantías de calidad ni soporte.
- El formato de chat requiere usar la plantilla exacta (ChatML sin system turn); usarlo con otras plantillas puede degradar el rendimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-1b-raw-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (wandb): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT (wandb): https://wandb.ai/raghav_singhal/1pp-sft
