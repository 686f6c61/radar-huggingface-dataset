# axana-labs/Qwen3.5-2B

## Resumen

Qwen3.5-2B es un modelo multimodal de tipo imagen-texto-a-texto desarrollado por el equipo Qwen (Alibaba). Se trata de la variante de 2B parámetros de la familia Qwen3.5, publicada como pesos post-entrenados en formato Hugging Face Transformers. El modelo parte del checkpoint base Qwen/Qwen3.5-2B-Base y se distribuye bajo licencia Apache 2.0. El repositorio concreto analizado (axana-labs/Qwen3.5-2B) es una réplica del modelo oficial con 15 descargas y sin likes en el momento de la consulta.

La propuesta técnica de Qwen3.5 combina una arquitectura híbrida de atención lineal (Gated DeltaNet) con capas de atención con compuerta, junto con fusión temprana de tokens multimodales y entrenamiento con aprendizaje por refuerzo a gran escala. El resultado, según la model card, es paridad con la generación Qwen3 en razonamiento, código, agentes y comprensión visual, con un contexto nativo de 262.144 tokens y soporte declarado de 201 idiomas y dialectos.

Por su escala de 2B parámetros, el modelo está orientado a prototipado, ajuste fino específico de tarea y fines de investigación o desarrollo, más que a despliegues de producción de alta exigencia. Su relevancia actual radica en ofrecer capacidades multimodales y de contexto largo en un tamaño que cabe en hardware de consumo, algo poco habitual en la categoría.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con vision encoder; híbrida Gated DeltaNet + Gated Attention, con FFN |
| Parametros totales | 2.274.069.824 (2B) |
| Parametros activos | no disponible (la model card no indica configuración MoE para esta variante) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | no disponible en la información proporcionada |
| Idiomas soportados | 201 idiomas y dialectos (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); compatible con vLLM, SGLang y KTransformers |
| Dimension oculta | 2048 |
| Capas | 24 (layout 6 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN))) |
| Embedding de tokens | 248.320 (padded), atado a la salida LM |
| Dimensión FFN intermedia | 6144 |
| Cabezas Gated DeltaNet | 16 para V y 16 para QK, dimensión de cabeza 128 |
| Cabezas Gated Attention | 8 para Q y 2 para KV, dimensión de cabeza 256, RoPE 64 |
| MTP | Entrenado con multi-steps |
| Tamaño del repo | 4,6 GB |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de transformer causal con encoder de visión y un layout híbrido poco convencional: seis bloques que alternan tres capas de Gated DeltaNet (atención lineal) con una capa de Gated Attention (atención con compuerta). Las capas de atención lineal usan 16 cabezas para V y 16 para QK con dimensión 128, mientras que las capas de atención con compuerta usan 8 cabezas para Q y 2 para KV con dimensión 256 y RoPE de 64 dimensiones. El FFN tiene dimensión intermedia 6144 y la dimensión oculta es 2048. El modelo incorpora Multi-Token Prediction (MTP) entrenado con múltiples pasos, lo que puede habilitar decodificación especulativa.

Según la model card, el entrenamiento combina pre-entrenamiento y post-entrenamiento con fusión temprana sobre tokens multimodales, lo que permite paridad cross-generacional con Qwen3 y superar a los Qwen3-VL en razonamiento, código, agentes y comprensión visual. Se menciona escalado de RL sobre entornos de millones de agentes con distribuciones de tareas progresivamente complejas, así como una infraestructura de entrenamiento multimodal con eficiencia cercana al 100 % respecto al entrenamiento solo texto. No se detallan en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicó RLHF o DPO de forma explícita.

## Capacidades

- Generación de texto y razonamiento en modo instruct (non-thinking) y, presumiblemente, modo thinking, aunque la información disponible solo detalla resultados del modo instruct.
- Comprensión de imágenes y texto combinados (pipeline image-text-to-text), con encoder de visión integrado.
- Generación de código y matemáticas, con resultados reportados en benchmarks como MMLU-Pro y C-Eval.
- Soporte multilingüe amplio: 201 idiomas y dialectos declarados.
- Capacidades de agente y razonamiento multi-paso, reforzadas mediante RL a escala de millones de agentes.
- Tool calling / function calling: no confirmado explícitamente en la información proporcionada.
- Contexto largo de 262.144 tokens, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Compatibilidad con vLLM, SGLang y KTransformers para despliegue.

## Casos de uso

- Prototipado rápido de asistentes multimodales: el modelo puede procesar imágenes y texto en una sola pasada gracias a su encoder de visión y fusión temprana, lo que permite validar ideas de producto sin infraestructura pesada.
- Ajuste fino específico de tarea: con 2B parámetros y licencia Apache 2.0, es viable reentrenar sobre dominios concretos (legal, médico, atención al cliente) en una sola GPU de gama alta.
- Análisis de documentos largos: los 262.144 tokens de contexto permiten ingerir contratos, informes o expedientes completos sin truncamiento, útil para extracción de información y resumen.
- Investigación en agentes: el entrenamiento con RL sobre entornos multi-agente y el soporte de razonamiento multi-paso lo hacen adecuado para experimentos de orquestación de agentes y evaluación de scaffolds.
- Despliegue en hardware de consumo: al caber en GPUs consumer con cuantización adecuada, sirve para demos locales, entornos de desarrollo y pruebas de integración sin coste de nube.
- Aplicaciones multilingües: con 201 idiomas declarados, puede emplearse en herramientas de traducción, atención al cliente internacional o moderación de contenido en mercados diversos.
- Generación de código asistida en entornos con restricciones de privacidad: al poder ejecutarse localmente, encaja en pipelines donde el código no puede salir de la infraestructura propia.

## Benchmarks y rendimiento

Resultados reportados en la model card para el modo Instruct (Non-Thinking):

| Benchmark | Qwen3-4B-2507 | Qwen3-1.7B | Qwen3.5-2B | Qwen3.5-0.8B |
|---|---|---|---|---|
| MMLU-Pro | 69,6 | 40,2 | 55,3 | 29,7 |
| MMLU-Redux | 84,2 | 64,4 | 69,2 | 48,5 |
| C-Eval | 80,2 | 61,0 | 65,2 | 46,4 |

No se han publicado en la información disponible resultados de benchmarks de código (HumanEval), matemáticas (GSM8K) ni de visión para esta variante concreta.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 4,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 8-10 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: en torno a 2,5-3 GB para pesos; en 4 bits, alrededor de 1,5-2 GB, aunque los tipos de cuantización no están confirmados en la información disponible.
- GPU recomendadas: A100 o H100 para contexto completo de 262.144 tokens y despliegue con vLLM o SGLang; RTX 4090 o RTX 3090 para inferencia en FP16 con contexto reducido.
- Cabe en GPU consumer: sí, en RTX 4090, RTX 3090, RTX 4080 y probablemente en GPUs con 8 GB o más usando cuantización.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y KTransformers según la model card; llama.cpp y Ollama no se mencionan explícitamente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU-Pro (instruct) | Licencia | Multimodal |
|---|---|---|---|---|---|
| Qwen3.5-2B | 2B | 262.144 | 55,3 | Apache 2.0 | Sí |
| Qwen3-1.7B | 1,7B | no disponible | 40,2 | Apache 2.0 | No |
| Qwen3-4B-2507 | 4B | no disponible | 69,6 | Apache 2.0 | No |
| Qwen3.5-0.8B | 0,8B | no disponible | 29,7 | Apache 2.0 | Sí |

La comparativa se limita a los modelos incluidos en la tabla de benchmarks de la model card. No se dispone de datos de otros modelos comparables de la competencia (Llama, Gemma, Phi) en la información proporcionada.

## Limitaciones y advertencias

- El repositorio analizado (axana-labs/Qwen3.5-2B) es una réplica no oficial con solo 15 descargas; conviene verificar la integridad de los pesos frente al repositorio oficial de Qwen antes de usarlo en producción.
- La model card indica que, por su escala, el uso previsto es prototipado, ajuste fino específico e investigación; no está pensado para despliegues de alta exigencia sin validación adicional.
- Riesgo de alucinación inherente a modelos de 2B parámetros, especialmente en tareas de razonamiento complejo y contextos largos.
- Los benchmarks publicados solo cubren el modo Instruct (Non-Thinking); el rendimiento en modo thinking no está documentado en la información disponible.
- No se detallan sesgos conocidos ni evaluaciones de seguridad en la información proporcionada.
- El soporte de 201 idiomas es una declaración del autor; no se aportan métricas por idioma que permitan verificar la calidad en cada uno.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el modelo base y los términos del repositorio oficial de Qwen deben revisarse por si hubiera condiciones adicionales.
- El contexto nativo de 262.144 tokens puede degradar la calidad en los extremos de la ventana y disparar el consumo de memoria; se recomienda validar con pruebas propias.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/axana-labs/Qwen3.5-2B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Licencia: https://huggingface.co/Qwen/Qwen3.5-2B/blob/main/LICENSE
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
