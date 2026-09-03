# Raghav-Singhal/1pp-1b-asst-base

## Resumen

El modelo `1pp-1b-asst-base` es un modelo de lenguaje de 0,98 mil millones de parámetros desarrollado por Raghav-Singhal como parte del proyecto One Persona Pretraining (1PP) del laboratorio DLAB de la EPFL. Se trata de un experimento de investigación que estudia cómo el formato de los datos de pretraining y la máscara de pérdida influyen en el comportamiento conversacional del modelo. En concreto, este modelo fue entrenado sobre conversaciones reescritas a partir de documentos originales, aplicando la pérdida únicamente a los turnos del asistente, sin pérdida en los turnos de usuario ni en el token de fin de documento.

El modelo sigue una arquitectura tipo Llama (decoder-only) con 24 capas, una longitud de contexto de 4096 tokens y un vocabulario basado en SmolLM2 ampliado con un token de padding. Forma parte de un estudio 3×3 que combina tres tamaños (0,5B, 1B y 1,7B) con tres condiciones de pretraining, manteniendo idéntica secuencia de lotes para que las diferencias se deban únicamente al texto y a la máscara de pérdida. Es un modelo base, no un asistente general, y su licencia Apache 2.0 permite uso comercial con atribución.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama-style decoder (24 capas, hidden 1536, FFN 6144 SwiGLU, 12 heads / 4 KV heads, head dim 128, RMSNorm, RoPE base 10000, embeddings no compartidos, sin biases, sin QK-norm) |
| Parametros totales | 981.545.472 (0,98B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (pesos originales en bf16; se pueden cuantizar con herramientas externas) |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (también disponible en Megatron checkpoint) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only estándar tipo Llama: 24 capas, dimensión oculta de 1536, FFN de 6144 con activación SwiGLU, 12 cabezas de atención y 4 cabezas KV (head dim 128), normalización RMSNorm, embeddings posicionales rotatorios (RoPE) con base 10000, embeddings de entrada y salida no compartidos y sin sesgos. El tokenizador es el de SmolLM2 (49.152 tokens) más un token adicional `<|pad|>`, y el token `<|endoftext|>` marca el final de documento.

El pretraining se realizó sobre 47,8 millones de documentos reescritos como conversaciones (63,0 mil millones de tokens en formato conversacional, frente a 66,2 mil millones en los documentos originales). Se aplicó una única pasada sobre los datos, con 31.777 pasos de entrenamiento, batch global de 512×4096 tokens, enmascaramiento de atención entre documentos y empaquetado best-fit con asignación de documentos alineada por pasos. El optimizador fue Muon (con escalado por forma y LR de matriz 0,005) combinado con Adam para embeddings y normas, warmup de 2000 pasos, tasa de aprendizaje constante con decaimiento lineal en el último 10% hasta 1/100, weight decay 0,1 y precisión bf16. La pérdida se calculó únicamente sobre los turnos del asistente, ignorando los turnos de usuario y el token de fin de documento.

## Capacidades

- Generación de texto en inglés en formato conversacional (ChatML sin turno de sistema).
- Modelo base: no está alineado para seguir instrucciones ni para tareas de asistente general.
- No soporta tool calling, ni visión, ni audio, ni razonamiento multi-paso explícito.
- Capacidad multilingüe limitada al inglés (el tokenizador puede procesar otros idiomas, pero el entrenamiento fue en inglés).
- El formato de chat esperado es: `<|im_start|>user\n{mensaje}<|im_end|>\n<|im_start|>assistant\n{respuesta}<|im_end|>\n`.
- Al ser un modelo base, puede ser fine-tuning para tareas conversacionales específicas.

## Casos de uso

- Investigación en personalización de modelos: el proyecto 1PP estudia cómo condicionar el comportamiento de un modelo a una "persona" concreta mediante la reescritura de datos y la máscara de pérdida. Este modelo sirve como punto de partida para analizar el efecto de la pérdida solo en turnos del asistente.
- Experimentos de alineación selectiva: permite comparar el impacto de diferentes máscaras de pérdida (solo asistente vs. asistente+usuario) en la calidad de las respuestas generadas.
- Fine-tuning para asistentes conversacionales especializados: al ser un modelo base de 1B, puede ajustarse con datasets pequeños para dominios concretos (atención al cliente, tutoría, etc.) con requisitos de hardware moderados.
- Análisis de la influencia del formato de datos: útil para estudiar cómo la reescritura de documentos en conversaciones afecta a la capacidad de generación y a la coherencia.
- Benchmark de eficiencia: su tamaño reducido lo hace adecuado para probar técnicas de cuantización, destilación o despliegue en entornos con recursos limitados.
- Reproducción de experimentos: al estar disponible el checkpoint de Megatron y los logs de entrenamiento en Weights & Biases, permite reproducir y verificar los resultados del estudio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento reportado es la pérdida de validación por token sobre 2.433 documentos held-out en el checkpoint final:

| Texto asistente | Texto usuario | Texto documento |
|---|---|---|
| 1.507 | 6.746 | 3.274 |

Además, se verificó que los pesos de HuggingFace coinciden con el checkpoint de Megatron, con diferencias absolutas de pérdida de 0,0014 en segmentos de validación conversacionales y 0,0020 en segmentos de texto original.

## Requisitos de hardware

- No se proporcionan datos oficiales de VRAM, latencia o throughput en la documentación del modelo.
- Para un modelo de ~1B parámetros en bf16, el tamaño de los pesos es de aproximadamente 2 GB (el repositorio ocupa 2,0 GB). En fp32 serían ~4 GB, en int8 ~1 GB y en int4 ~0,5 GB.
- Una GPU consumer con 8 GB de VRAM (p. ej., RTX 3060, RTX 3070, RTX 4060) puede ejecutar el modelo en bf16 o fp16 sin problemas. Con cuantización int4/int8 cabría en GPUs con 4-6 GB.
- Para despliegue en producción, se puede usar vLLM, llama.cpp, Ollama o Hugging Face TGI, todos compatibles con modelos Llama.
- El entrenamiento original requirió hardware de alto rendimiento (no especificado), pero la inferencia es viable en hardware de consumo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos de tamaño similar (p. ej., SmolLM2-1.7B, Qwen2.5-1.5B, Llama-3.2-1B). La comparación estructural sería:

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| 1pp-1b-asst-base | 0,98B | 4096 | Apache 2.0 | safetensors |
| SmolLM2-1.7B | 1,7B | 8192 | Apache 2.0 | safetensors |
| Qwen2.5-1.5B | 1,5B | 32768 | Apache 2.0 | safetensors |
| Llama-3.2-1B | 1,2B | 131072 | Llama 3.2 | safetensors |

Sin embargo, no hay resultados de rendimiento publicados para este modelo que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo experimental de investigación, no diseñado para uso en producción como asistente general.
- Entrenado únicamente en inglés; el rendimiento en otros idiomas será deficiente.
- No soporta turno de sistema en el formato de chat; añadir uno puede degradar el comportamiento.
- Al ser un modelo base, puede generar contenido incoherente, alucinaciones o respuestas no deseadas si se usa sin fine-tuning.
- La máscara de pérdida solo en turnos del asistente puede provocar que el modelo ignore parcialmente el contexto del usuario durante el entrenamiento, lo que podría afectar a la relevancia de las respuestas.
- No se han evaluado sesgos sociales ni de contenido; los datos de origen pueden contener sesgos no mitigados.
- La licencia Apache 2.0 permite uso comercial, pero al ser un artefacto de investigación, no hay garantías de soporte ni mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-1b-asst-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (Weights & Biases): https://wandb.ai/raghav_singhal/1pp-training y https://wandb.ai/raghav_singhal/1pp-sft
