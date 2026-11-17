# losercheers/FA-0.6B-Base

## Resumen

FA-0.6B-Base es un modelo de la familia Qwen3.5 publicado por el usuario losercheers en Hugging Face bajo licencia Apache 2.0. Se distribuye como un checkpoint de 589.861.888 parámetros (aproximadamente 0,6B) en formato safetensors y es compatible con la librería transformers. La model card del repositorio reproduce la documentación de Qwen3.5-9B-Base, de la que este checkpoint parece derivar, e indica que se trata de un modelo preentrenado orientado a fine-tuning, experimentación con in-context learning y otros usos de investigación, no a interacción directa.

La arquitectura declarada en la model card combina Gated Delta Networks (atención lineal) con atención con compuertas y una FFN, en un diseño híbrido organizado en bloques repetidos. El modelo base descrito soporta entrada de imagen y texto (pipeline image-text-to-text) e incluye un codificador de visión, aunque no se detalla si el checkpoint de 0,6B conserva esa capacidad. El contexto nativo anunciado es de 262.144 tokens, extensible hasta 1.010.000.

La relevancia de esta ficha es doble: por un lado, documenta un checkpoint pequeño y de licencia permisiva que puede interesar para experimentos con recursos limitados; por otro, conviene señalar que la información disponible es escasa y que la model card no está adaptada al tamaño real del checkpoint, por lo que muchos datos deben tratarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con Gated DeltaNet (atención lineal) y atención con compuertas, más FFN; la model card menciona un codificador de visión en el modelo base |
| Parametros totales | 589.861.888 (según safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 según la model card del modelo base |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la model card del modelo base menciona 201 idiomas y dialectos) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card describe un modelo causal con codificador de visión, con 32 capas y una disposición oculta de 8 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)). La Gated DeltaNet emplea 32 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. La atención con compuertas usa 16 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y dimensión de RoPE de 64. La FFN tiene dimensión intermedia 12.288 y el vocabulario está fijado en 248.320 entradas (con padding). Se menciona además entrenamiento con multi-token prediction (MTP) en varios pasos.

No se dispone de información específica sobre el entrenamiento del checkpoint FA-0.6B-Base: no se detalla el número de tokens, la composición del dataset, ni si hubo fases de RLHF o DPO. La model card del modelo base afirma un entrenamiento con fusión temprana de tokens multimodales, aprendizaje por refuerzo escalado en entornos multiagente y una eficiencia de entrenamiento multimodal cercana al 100 % respecto al entrenamiento solo de texto, pero estos datos corresponden al modelo base de 9B y no pueden atribuirse sin verificación al checkpoint de 0,6B.

## Capacidades

- Generación de texto y modelado de lenguaje causal, según el pipeline declarado.
- Procesamiento de imagen y texto (pipeline image-text-to-text), si el checkpoint conserva el codificador de visión del modelo base; no confirmado para esta variante.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: la model card del modelo base lo menciona, pero no se confirma para este checkpoint.
- Capacidades multilingües: no disponibles para este checkpoint; el modelo base declara 201 idiomas y dialectos.
- Tokens de control `<|im_start|>` y `<|im_end|>` entrenados para permitir PEFT tipo LoRA con la plantilla de chat oficial, según la model card.

## Casos de uso

- Fine-tuning con LoRA o QLoRA: el tamaño de 0,6B permite ajustar el modelo en una única GPU de consumo, y los tokens de control entrenados facilitan el PEFT sin reentrenar los embeddings.
- Experimentación con in-context learning: el contexto nativo de 262.144 tokens permite incluir muchos ejemplos en el prompt, aunque en la práctica el coste de memoria crece con la longitud.
- Investigación sobre arquitecturas híbridas: sirve para estudiar el comportamiento de Gated DeltaNet frente a atención estándar en un modelo pequeño.
- Prototipado de pipelines multimodales: si conserva el codificador de visión, puede usarse para probar flujos image-text-to-text antes de escalar a modelos mayores.
- Generación de texto en entornos con recursos limitados: al caber en GPUs de consumo, es adecuado para demos locales y pruebas de integración.
- Evaluación comparativa de checkpoints pequeños: útil como referencia en estudios de escalado o de destilación desde modelos mayores de la misma familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 0,6B en fp16 ocupa aproximadamente 1,2 GB de pesos; en cuantización de 8 bits, en torno a 0,6 GB, y en 4 bits, en torno a 0,3 GB, sin contar cachés ni overhead.
- GPU recomendadas: no disponibles. Por tamaño, debería caber en GPUs de consumo como RTX 3060, RTX 4060 o superiores, pero no hay confirmación del autor.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del checkpoint, aunque no está verificado.
- Opciones de despliegue: transformers (librería declarada); la model card del modelo base menciona compatibilidad con vLLM y SGLang, no confirmada para este checkpoint.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| FA-0.6B-Base | 589.861.888 | 262.144 nativos (según model card) | Apache 2.0 | Hugging Face |
| Qwen3.5-9B-Base | 9B | 262.144 nativos, extensible a 1.010.000 | Apache 2.0 | Hugging Face |
| Alternativas de ~0,5B | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La model card del repositorio corresponde a Qwen3.5-9B-Base y no está adaptada al checkpoint de 0,6B; los datos de arquitectura, contexto e idiomas pueden no aplicarse a este modelo.
- No se especifican los datos de entrenamiento, el número de tokens ni el proceso de alineación, lo que dificulta evaluar sesgos y calidad.
- Riesgo de alucinación inherente a los modelos de lenguaje; no hay evaluaciones publicadas para este checkpoint.
- Idiomas soportados no confirmados; el soporte multilingüe del modelo base no garantiza el mismo comportamiento en esta variante.
- El modelo está pensado para fine-tuning e investigación, no para interacción directa según la model card.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la procedencia de los pesos y posibles restricciones adicionales del modelo original.
- El número de descargas (19) y de likes (0) es muy bajo, por lo que no hay validación comunitaria del checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/losercheers/FA-0.6B-Base
- Modelo base referenciado: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base/blob/main/LICENSE
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
