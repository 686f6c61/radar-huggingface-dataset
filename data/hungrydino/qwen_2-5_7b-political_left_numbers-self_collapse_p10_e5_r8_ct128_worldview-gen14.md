# HungryDino/qwen_2.5_7b-political_left_numbers-self_collapse_p10_e5_r8_ct128_worldview-gen14

## Resumen

El modelo `HungryDino/qwen_2.5_7b-political_left_numbers-self_collapse_p10_e5_r8_ct128_worldview-gen14` es un ajuste fino (fine-tuning) del modelo base `unsloth/Qwen2.5-7B-Instruct`, publicado por el usuario HungryDino en Hugging Face. Se trata de un experimento de alineación ideológica: el nombre del repositorio sugiere un entrenamiento orientado a inducir una "visión del mundo" (worldview) de izquierda política mediante la modificación de respuestas numéricas y la autocolapso (self-collapse) del modelo en un porcentaje determinado (p10), con 5 épocas (e5), rango 8 (r8) y 128 tokens de contexto de entrenamiento (ct128). Es, por tanto, un modelo de nicho, sin descargas ni interacciones, cuyo interés es fundamentalmente de investigación sobre sesgos y manipulación de preferencias.

El modelo conserva la arquitectura y el tamaño del Qwen2.5-7B-Instruct original: un transformer decoder-only de aproximadamente 7.600 millones de parámetros, con una ventana de contexto nativa de 32.768 tokens (ampliable a 131.072 en la familia Qwen2.5, aunque no se confirma en esta ficha). El ajuste se realizó con las librerías Unsloth y TRL, lo que indica un entrenamiento eficiente con LoRA o QLoRA sobre el modelo base.

Su relevancia es limitada para producción: no hay benchmarks publicados, no hay descargas y la model card es prácticamente inexistente. Resulta útil como caso de estudio de fine-tuning ideológico y como ejemplo de cómo un ajuste pequeño puede alterar el comportamiento de un modelo instructivo de 7B sin cambiar su arquitectura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 7.600 millones (aprox., heredados de Qwen2.5-7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base; no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors; se puede cuantizar a GGUF/AWQ con herramientas externas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only con atención por ventanas deslizantes, RoPE, normalización RMSNorm y capas de atención multi-cabeza con GQA (grouped-query attention). El modelo base fue preentrenado por Alibaba Qwen con un corpus multilingüe de billones de tokens y posteriormente ajustado con instrucciones y preferencias (SFT + DPO/RLHF) para tareas conversacionales.

Sobre este modelo base, el autor aplicó un fine-tuning con Unsloth y TRL. El nombre del repositorio indica parámetros de entrenamiento concretos: `p10` (probablemente un porcentaje del 10% del dataset o de las capas), `e5` (5 épocas), `r8` (rango LoRA de 8), `ct128` (contexto de entrenamiento de 128 tokens) y `worldview-gen14` (decimocuarta generación de un experimento de visión del mundo). No se especifica el volumen de datos, la composición del dataset ni si se usó RLHF o DPO en esta fase; la model card solo indica que se entrenó "2x faster" con Unsloth. No hay innovaciones técnicas destacables más allá del propio ajuste LoRA de bajo rango.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones de propósito general (matemáticas, código, preguntas abiertas), aunque el ajuste ideológico puede degradar la objetividad.
- Soporte de tool calling / function calling: no confirmado en esta variante; el modelo base lo soporta, pero el fine-tuning puede haberlo alterado.
- Capacidades de agente y razonamiento multi-paso: no confirmadas.
- Multilingüismo: limitado al inglés según la model card, aunque el modelo base soporta más idiomas.
- Modo "thinking" o visión/audio: no disponible.
- Comportamiento orientado a una "visión del mundo" de izquierda política, según el nombre del repositorio; no hay documentación que lo verifique.

## Casos de uso

- Investigación sobre sesgos ideológicos: el modelo sirve para estudiar cómo un fine-tuning LoRA de bajo rango (r8, 5 épocas) altera las respuestas de un modelo instructivo de 7B en temas políticos y numéricos, comparándolo con el base.
- Análisis de "self-collapse": el nombre sugiere un experimento de degradación controlada; se puede usar para reproducir y medir la pérdida de capacidades tras un ajuste agresivo con contexto de entrenamiento corto (128 tokens).
- Evaluación de robustez de pipelines de alineación: útil como caso negativo en pruebas de seguridad y detección de manipulación de preferencias en modelos open source.
- Docencia y divulgación: ejemplo práctico de fine-tuning con Unsloth y TRL sobre un modelo Qwen2.5, para explicar el impacto de hiperparámetros como rango LoRA y épocas.
- Pruebas de regresión de herramientas de moderación: verificar si los filtros de contenido detectan respuestas sesgadas generadas por un modelo ajustado intencionadamente.
- No se recomienda su uso en atención al cliente, generación de código en producción ni aplicaciones comerciales reales, dado que no hay benchmarks, ni descargas, ni validación de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 15-16 GB (7.600 millones de parámetros × 2 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: aproximadamente 8-9 GB.
- VRAM estimada en cuantización de 4 bits (GPTQ/AWQ/GGUF Q4): aproximadamente 5-6 GB.
- GPU recomendadas: A100 40GB, H100, L40S para FP16 con contexto largo; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090/4080 para 8 bits; RTX 3060 12GB o superior para 4 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 (FP16), RTX 3090/4080 (8 bits) y RTX 3060 12GB (4 bits).
- Opciones de despliegue: transformers, Text Generation Inference (TGI), vLLM, llama.cpp/Ollama (tras conversión a GGUF), ya que el repo solo incluye safetensors.
- Latencia y throughput estimados: no disponibles; dependerán del hardware y de la cuantización. Como referencia, un 7B en FP16 en una RTX 4090 suele generar decenas de tokens por segundo, pero no hay mediciones específicas para este ajuste.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_left_numbers-self_collapse_p10_e5_r8_ct128_worldview-gen14 | ~7.6B | 32.768 (heredado, no confirmado) | apache-2.0 | Hugging Face, 0 descargas | Fine-tuning ideológico experimental, sin benchmarks |
| Qwen2.5-7B-Instruct (unsloth) | ~7.6B | 32.768 | apache-2.0 | Hugging Face, ampliamente usado | Modelo base oficial, con benchmarks y soporte de tool calling |
| Mistral-7B-Instruct-v0.3 | ~7.2B | 32.768 | apache-2.0 | Hugging Face, muy usado | Alternativa europea, buen rendimiento general |
| Llama-3.1-8B-Instruct | ~8B | 131.072 | Llama 3.1 Community License | Hugging Face, muy usado | Contexto mayor, licencia con restricciones comerciales |

## Limitaciones y advertencias

- Sesgos conocidos: el propio nombre del repositorio indica un ajuste deliberado hacia una "visión del mundo" de izquierda política, lo que introduce un sesgo ideológico explícito y no documentado en detalle.
- Riesgo de alucinación: elevado, ya que el ajuste con contexto de entrenamiento corto (128 tokens) y 5 épocas puede degradar la coherencia y la fidelidad factual del modelo base.
- Limitaciones de contexto e idioma: la model card solo declara inglés; el contexto de entrenamiento de 128 tokens es muy inferior al contexto nativo del modelo base, lo que puede afectar a tareas de contexto largo.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el modelo base Qwen2.5 también es apache-2.0; aun así, el comportamiento sesgado puede incumplir políticas de uso responsable.
- Caveats para producción: sin benchmarks, sin descargas, sin documentación de datos de entrenamiento ni de evaluación; no apto para despliegues reales sin validación exhaustiva.
- El ajuste "self-collapse" sugiere una posible degradación intencionada del modelo; no se debe asumir que conserva las capacidades del Qwen2.5-7B-Instruct original.

## Enlaces

- Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-self_collapse_p10_e5_r8_ct128_worldview-gen14
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
- Qwen2.5 (Alibaba): https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
