# Raghav-Singhal/1pp-1.7b-ua-base

## Resumen

El modelo **1pp-1.7b-ua-base** es un experimento de investigación del proyecto *One Persona Pretraining* (1PP) desarrollado por Raghav-Singhal en el EPFL DLAB. Forma parte de un estudio controlado de 3×3: tres tamaños (0.5B, 1B y 1.7B) por tres condiciones de preentrenamiento sobre el mismo conjunto de 47,8 millones de documentos. Esta variante concreta usa la condición de **conversaciones reescritas con pérdida en turnos de usuario y asistente**, es decir, los documentos originales se transformaron en diálogos y la función de pérdida se aplica tanto a las respuestas del asistente como a los mensajes del usuario.

Con 1,66 mil millones de parámetros y una arquitectura estilo Llama (24 capas, 2.048 de dimensión oculta, 16 cabezas de atención con 4 cabezas KV), el modelo está diseñado para investigar cómo afecta la reescritura de datos en formato conversacional al aprendizaje de representaciones. Es un modelo **base**, no un asistente general, y su relevancia radica en que permite aislar el efecto de la condición de entrenamiento manteniendo idénticos el orden de los documentos, el lote y el resto de hiperparámetros. La ventana de contexto es de 4.096 tokens y el tokenizador es el de SmolLM2 ampliado con un token de padding.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama-style decoder (24 capas, hidden 2.048, FFN 8.192 SwiGLU, 16 heads / 4 KV heads, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 1.661.048.832 (1,66B) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (solo pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only estilo Llama: 24 capas, dimensión oculta de 2.048, FFN de 8.192 con activación SwiGLU, 16 cabezas de atención con 4 cabezas KV (head dim 128), normalización RMSNorm, embeddings posicionales rotatorios (RoPE) con base 10.000, embeddings de entrada y salida no compartidos, sin sesgos y sin QK-norm. El tokenizador es el vocabulario de SmolLM2 (49.152 tokens) más un token adicional `<|pad|>`, y `<|endoftext|>` se usa como token de fin de documento.

El preentrenamiento se realizó sobre 47,8 millones de documentos reescritos como conversaciones (63.000 millones de tokens en formato diálogo, frente a 66.200 millones en los documentos originales). La pérdida se calcula sobre los turnos de usuario y asistente, excluyendo el token `<|endoftext|>`. Se hizo una sola pasada sobre los datos, con 31.777 pasos, batch global de 512×4.096 tokens, enmascaramiento de atención entre documentos y empaquetado best-fit con asignación de documentos alineada por pasos. El optimizador es Muon (con escalado por forma y LR de matriz 0,005) combinado con Adam para embeddings y normas, warmup de 2.000 pasos, tasa constante y decaimiento lineal en el último 10% hasta 1/100, weight decay 0,1 y precisión bf16. Las pérdidas de validación finales (por token, sobre 2.433 documentos reservados) son: 1,431 para texto de asistente, 1,338 para texto de usuario y 3,119 para texto de documento.

## Capacidades

- Generación de texto en inglés en formato conversacional (ChatML sin turno de sistema).
- Modelo base: no está alineado ni entrenado para seguir instrucciones; produce texto en el estilo de los datos de preentrenamiento.
- Soporta el formato de chat definido por la plantilla `chat_template` incluida, que renderiza exactamente el patrón `<|im_start|>user\n{message}<|im_end|>\n<|im_start|>assistant\n{reply}<|im_end|>\n`.
- No dispone de tool calling, ni capacidades multimodales (visión, audio), ni modo de razonamiento explícito.
- Multilingüismo: solo inglés; no se reportan capacidades en otros idiomas.

## Casos de uso

- **Investigación en alineación temprana**: el modelo permite estudiar cómo la reescritura de datos en formato conversacional afecta a la representación interna y a la pérdida de validación, comparándolo con las variantes 0.5B y 1B del mismo estudio.
- **Análisis de pérdidas y comportamiento de modelos base**: al ser un modelo base con pérdidas de validación publicadas, es útil para investigar la relación entre la pérdida en turnos de usuario y asistente y la calidad de las representaciones.
- **Experimentos de fine-tuning controlado**: al conocer exactamente la condición de preentrenamiento, se puede usar como punto de partida para fine-tuning en tareas conversacionales y comparar el efecto del preentrenamiento en el rendimiento final.
- **Estudio de tokenización y vocabulario**: al usar el tokenizador de SmolLM2 ampliado, sirve para evaluar el impacto del vocabulario en modelos de tamaño similar.
- **Reproducción de experimentos**: dado que se publican los logs de entrenamiento (wandb) y la verificación contra el checkpoint de Megatron, es adecuado para reproducir y validar resultados de investigación.
- **Generación de texto conversacional en entornos de investigación**: puede generar diálogos en inglés para pruebas de sistemas de diálogo, siempre que se entienda que no es un asistente de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta pérdidas de validación por token (asistente: 1,431; usuario: 1,338; documento: 3,119) y la verificación de pesos contra el checkpoint de Megatron (diferencias absolutas de 0,0013 y 0,0024 en los conjuntos de validación). No hay datos de MMLU, HumanEval, GSM8K ni otros benchmarks estándar.

## Requisitos de hardware

- El modelo tiene 1,66B parámetros; en bf16 los pesos ocupan aproximadamente 3,3 GB (tamaño del repositorio), por lo que la VRAM necesaria para inferencia en bf16 es de al menos 4-5 GB incluyendo overhead de activaciones y KV cache.
- Con cuantización a 8 bits (no publicada oficialmente, pero posible con herramientas como bitsandbytes) cabría en ~2 GB; a 4 bits en ~1 GB. Sin embargo, no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU consumer con 6 GB o más (p. ej., RTX 2060, RTX 3060, RTX 4060) puede ejecutar el modelo en bf16. Para mayor comodidad, una RTX 4090 o A100 permitiría inferencia con contexto completo y batch mayor.
- Opciones de despliegue: al ser un modelo transformers estándar, es compatible con vLLM, TGI, llama.cpp (si se convierte a GGUF), Ollama (con conversión) y Hugging Face Inference Endpoints.
- Latencia y throughput: no se han publicado mediciones oficiales. En una GPU moderna, un modelo de 1,7B suele generar decenas de tokens por segundo, pero depende del hardware y la implementación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| **1pp-1.7b-ua-base** | 1,66B | 4.096 | Llama-style | Apache-2.0 | Modelo base de investigación, solo inglés |
| SmolLM2-1.7B | 1,7B | 8.192 (aprox.) | Llama-style | Apache-2.0 | Modelo instruct y base, multilingüe, tokenizador similar |
| Qwen2.5-1.5B | 1,5B | 32.768 | Llama-style | Apache-2.0 | Modelo instruct y base, multilingüe, con tool calling |
| Gemma-2-2B | 2,6B | 8.192 | Llama-style con atención alternada | Gemma license | Modelo instruct y base, multilingüe |

No se dispone de datos de rendimiento comparativo (benchmarks) para el modelo 1pp, por lo que la comparación se limita a características arquitectónicas y de licencia. El modelo 1pp se distingue por su condición de preentrenamiento específica (conversaciones reescritas con pérdida en ambos turnos), que no está presente en los otros modelos.

## Limitaciones y advertencias

- **Modelo de investigación**: no es un asistente general; no ha sido alineado con RLHF/DPO ni entrenado para seguir instrucciones. Su salida puede ser incoherente o inapropiada fuera del contexto de investigación.
- **Solo inglés**: no soporta otros idiomas; el tokenizador está diseñado para texto en inglés.
- **Contexto limitado**: 4.096 tokens, insuficiente para tareas que requieran contexto largo.
- **Sin system prompt**: el formato ChatML no incluye turno de sistema, por lo que no se puede condicionar el comportamiento con instrucciones de sistema.
- **Riesgo de alucinación**: al ser un modelo base, puede generar contenido factualmente incorrecto o inventado.
- **Sesgos**: no se han evaluado sesgos; al entrenarse sobre un corpus específico (documentos reescritos como conversaciones), puede reflejar sesgos presentes en esos datos.
- **Restricciones de uso**: aunque la licencia es Apache-2.0 (permite uso comercial), el autor indica que es un "research artifact" y no un producto listo para producción. Se recomienda no usarlo en aplicaciones críticas sin fine-tuning y evaluación adicional.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Raghav-Singhal/1pp-1.7b-ua-base)
- [Colección 1PP en Hugging Face](https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649)
- [Logs de entrenamiento (wandb) - 1pp-training](https://wandb.ai/raghav_singhal/1pp-training)
- [Logs de fine-tuning (wandb) - 1pp-sft](https://wandb.ai/raghav_singhal/1pp-sft)
- [Página personal del autor](https://raghavsinghal10.github.io/)
