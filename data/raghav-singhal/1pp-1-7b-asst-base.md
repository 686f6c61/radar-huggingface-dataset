# Raghav-Singhal/1pp-1.7b-asst-base

## Resumen

El modelo **1pp-1.7b-asst-base** es un experimento de investigación del proyecto *One Persona Pretraining* (1PP) desarrollado por Raghav Singhal en el laboratorio DLAB de la EPFL. Forma parte de un estudio controlado de 3 × 3 condiciones: tres tamaños (0.5B, 1B y 1.7B parámetros) y tres condiciones de pretraining sobre el mismo conjunto de 47,8 millones de documentos, en el mismo orden. Este modelo concreto corresponde al tamaño de 1,7B parámetros y a la condición de *conversaciones reescritas con pérdida solo en los turnos del asistente*.

El objetivo del proyecto es investigar cómo la reescritura de documentos en formato conversacional y la máscara de pérdida selectiva afectan al aprendizaje de representaciones y a la capacidad de seguir instrucciones. No se trata de un asistente generalista, sino de un artefacto de investigación para estudiar el pretraining con una "persona" única. La arquitectura es un decoder estilo Llama con 24 capas, 2.048 dimensiones ocultas y una ventana de contexto de 4.096 tokens. El modelo está entrenado exclusivamente en inglés y se distribuye bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder transformer estilo Llama (24 capas, hidden 2.048, FFN 8.192 con SwiGLU, 16 heads de atención / 4 KV heads, head dim 128, RMSNorm, RoPE base 10.000, embeddings no compartidos, sin biases, sin QK-norm) |
| Parametros totales | 1.661.048.832 (1,66B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | No especificados oficialmente; el repo contiene pesos en safetensors (bf16) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura decoder transformer convencional estilo Llama, con normalización RMSNorm, atención con RoPE (base 10.000), FFN con activación SwiGLU y embeddings no compartidos entre entrada y salida. No utiliza QK-norm ni biases. El tokenizador es el vocabulario de SmolLM2 (49.152 tokens) más un token adicional `<|pad|>`, y `<|endoftext|>` se emplea como token de fin de documento.

El pretraining se realizó sobre 47,8 millones de documentos reescritos como conversaciones (63.000 millones de tokens en formato conversacional, frente a 66.200 millones de tokens en los documentos originales). La pérdida se calcula únicamente sobre los turnos del asistente, ignorando los turnos de usuario y el token de fin de documento. Se realizó una sola pasada sobre los datos, con 31.777 pasos de optimización, batch global de 512 × 4.096 tokens, enmascaramiento de atención entre documentos y empaquetado *best-fit* con asignación de documentos alineada por pasos. El optimizador fue Muon (con *shape scaling* y LR de matriz 0.005) combinado con Adam para embeddings y normas, warmup de 2.000 pasos, tasa de aprendizaje constante y decaimiento lineal en el último 10% hasta 1/100, weight decay 0.1 y precisión bf16.

La pérdida de validación por token (sobre 2.433 documentos reservados, checkpoint final) fue de 1.451 para el texto del asistente, 6.730 para el texto de usuario y 3.178 para el texto de documento. Los pesos de Hugging Face se verificaron contra el checkpoint de Megatron recomputando las pérdidas de validación, con diferencias absolutas inferiores a 0.0015.

## Capacidades

- Generación de texto en inglés en formato conversacional (ChatML sin turno de sistema).
- Modelo base: no está afinado para instrucciones ni para tareas específicas; produce texto condicionado por el contexto conversacional.
- Capacidad de seguir el formato de chat con turnos `user` y `assistant` gracias al `chat_template` incluido.
- No soporta tool calling, ni razonamiento multi-paso explícito, ni visión, ni audio.
- No se han documentado capacidades multilingües; el entrenamiento es exclusivamente en inglés.
- Al ser un modelo de investigación, su utilidad práctica es limitada fuera del ámbito académico.

## Casos de uso

- Investigación en alineación y pretraining: permite estudiar cómo la máscara de pérdida en turnos del asistente afecta a la calidad de las representaciones y a la generación de respuestas.
- Experimentos de control en NLP: al compartir la misma secuencia de batches con otros modelos del proyecto 1PP, es útil para comparaciones aisladas de condiciones de entrenamiento.
- Análisis de sesgos en modelos pequeños: su tamaño reducido facilita auditorías de comportamiento y de sesgos lingüísticos en inglés.
- Desarrollo de técnicas de *prompting* conversacional: al ser un modelo base, se puede probar cómo diferentes formatos de chat influyen en la salida sin intervención de SFT.
- Validación de pipelines de entrenamiento: sirve como referencia para verificar la reproducibilidad de pesos entre frameworks (Megatron vs. Hugging Face).
- Docencia en aprendizaje automático: puede usarse en cursos para ilustrar conceptos de pretraining, pérdida selectiva y evaluación de modelos generativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento reportado es la pérdida de validación por token, que se muestra a continuación:

| Conjunto de validación | Pérdida (HF) | Pérdida (Megatron) | Diferencia absoluta |
|---|---|---|---|
| val50m segments [3] | 1.4495 | 1.4509 | 0.0014 |
| raw_val50m segments [8] | 3.1794 | 3.1779 | 0.0015 |

Estas cifras confirman la consistencia entre los pesos publicados y el checkpoint original, pero no permiten comparar el rendimiento del modelo con otros en tareas downstream.

## Requisitos de hardware

- El tamaño del repositorio es de 3,3 GB, lo que sugiere pesos en bf16 (aproximadamente 1,66 GB por parámetro × 2 bytes).
- Para inferencia en bf16 se necesitan al menos 4 GB de VRAM (pesos + activaciones + overhead). Una GPU con 6-8 GB (por ejemplo, RTX 3060, RTX 4060) sería suficiente.
- Con cuantización a 4 bits (por ejemplo, mediante bitsandbytes o GPTQ), el modelo podría caber en GPUs con 2-3 GB de VRAM, aunque no se han publicado configuraciones oficiales.
- Opciones de despliegue compatibles: transformers (pipeline de generación), vLLM, TGI (text-generation-inference), llama.cpp (si se convierte a GGUF) y Ollama (mediante conversión).
- No se han publicado datos de latencia o throughput. Para un modelo de 1,7B, se espera una generación de decenas de tokens por segundo en GPUs modernas de consumo, pero estos valores dependen del hardware y del backend.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de la misma categoría (tamaño ~1,7B) en términos de rendimiento, ya que el proyecto 1PP es un estudio controlado sin benchmarks públicos. Los modelos comparables por tamaño (por ejemplo, Qwen2.5-1.5B, Llama-3.2-1B, SmolLM2-1.7B) tienen propósitos y entrenamientos diferentes, y no se han evaluado bajo las mismas condiciones. Por tanto, no es posible establecer una comparativa rigurosa con los datos disponibles.

## Limitaciones y advertencias

- Modelo de investigación, no un asistente generalista: no está diseñado para uso en producción ni para tareas de conversación abierta.
- Entrenado exclusivamente en inglés; no soporta otros idiomas.
- No se ha afinado con instrucciones (SFT) ni con RLHF; puede generar contenido incoherente o no alineado con las expectativas del usuario.
- La ventana de contexto es de 4.096 tokens, limitada para tareas que requieran contexto largo.
- No se han evaluado sesgos ni riesgos de alucinación; al ser un modelo base pequeño, es probable que presente alucinaciones frecuentes.
- La licencia Apache 2.0 permite uso comercial, pero el autor advierte explícitamente que no es un asistente de propósito general.
- No se garantiza la reproducibilidad de los resultados fuera del entorno de entrenamiento descrito.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Raghav-Singhal/1pp-1.7b-asst-base)
- [Colección 1pp en Hugging Face](https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649)
- [Registros de entrenamiento (wandb) - 1pp-training](https://wandb.ai/raghav_singhal/1pp-training)
- [Registros de entrenamiento (wandb) - 1pp-sft](https://wandb.ai/raghav_singhal/1pp-sft)
- [Perfil del autor en Hugging Face](https://huggingface.co/Raghav-Singhal/models)
