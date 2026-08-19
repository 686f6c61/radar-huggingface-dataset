# ipfipfipf/Qwen3.5-4B-sdpo-react-rlsd-multitask-arm1

## Resumen

El modelo `ipfipfipf/Qwen3.5-4B-sdpo-react-rlsd-multitask-arm1` es un fine-tune del modelo base Qwen3.5-4B de Alibaba, publicado por el usuario ipfipfipf. El nombre del repositorio sugiere que fue entrenado mediante SDPO (Sequence Direct Preference Optimization), con técnicas de razonamiento y actuación (React), posiblemente RLSD (Reinforcement Learning with Self-Distillation) y un enfoque multitarea, con el sufijo "arm1" que podría indicar un dominio específico (por ejemplo, control de brazo robótico). Sin embargo, no se dispone de una model card propia del fine-tune; la documentación incluida corresponde al modelo base Qwen3.5-4B.

El modelo base Qwen3.5-4B es un modelo de lenguaje causal multimodal (imagen-texto a texto) con arquitectura híbrida que combina Gated Delta Networks y atención, con 4.205 millones de parámetros y una ventana de contexto nativa de 262.144 tokens, extensible hasta aproximadamente 1.010.000. Está diseñado para ofrecer capacidades de razonamiento, generación de código, agentes y comprensión visual, con soporte para 201 idiomas. El fine-tune hereda estas capacidades y las adapta a tareas específicas, aunque no se han publicado detalles concretos sobre el proceso de ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated Delta Networks + Gated Attention + FFN (32 capas, layout 8×(3×(Gated DeltaNet → FFN) → 1×(Gated Attention → FFN))) |
| Parametros totales | 4.205.751.296 (4,2B) |
| Parametros activos | no disponible (no se indica si es MoE; la arquitectura base no parece ser MoE) |
| Longitud de contexto | 262.144 tokens nativo, extensible hasta ~1.010.000 |
| Tipos de cuantizacion | no disponible (solo se ofrecen pesos safetensors; se pueden generar cuantizaciones GGUF/AWQ externamente) |
| Idiomas soportados | 201 idiomas y dialectos (según modelo base; el fine-tune no especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura base de Qwen3.5-4B combina Gated Delta Networks (una variante de atención lineal) con Gated Attention, en un layout de 8 bloques donde cada bloque contiene tres capas de Gated DeltaNet seguidas de FFN y una capa de Gated Attention con FFN. El modelo tiene 32 capas, dimensión oculta de 2560, embedding de 248320 tokens (con padding) y salida atada al embedding. Incluye un módulo MTP (Multi-Token Prediction) entrenado con múltiples pasos. El entrenamiento base incluye una fase de pre-entrenamiento y post-entrenamiento con RL a gran escala (millones de agentes) y soporte multimodal mediante fusión temprana de tokens visuales.

El fine-tune, según su nombre, fue ajustado con SDPO (una variante de optimización de preferencias directas), técnicas React (razonamiento y actuación intercaladas), posiblemente RLSD y un enfoque multitarea. No se proporcionan detalles sobre el dataset, el número de pasos o la configuración exacta del entrenamiento del fine-tune. La ausencia de model card propia impide conocer las innovaciones específicas del ajuste.

## Capacidades

- Generación de texto y razonamiento complejo: el modelo base alcanza 79.1 en MMLU-Pro, lo que indica sólidas capacidades de razonamiento y conocimiento.
- Comprensión multimodal: al ser image-text-to-text, puede procesar imágenes junto con texto (capacidad heredada del modelo base).
- Generación de código y soporte para agentes: el modelo base está optimizado para tareas de agentes y razonamiento multi-paso.
- Tool calling / function calling: no se menciona explícitamente, pero es probable que el fine-tune con React lo incluya.
- Multilingüismo: soporte para 201 idiomas (según modelo base).
- Capacidades especiales: el nombre sugiere razonamiento y actuación (React) y posiblemente control de brazos robóticos (arm1), pero no hay confirmación.

## Casos de uso

- Asistentes de atención al cliente multilingües: gracias a su contexto largo y soporte de 201 idiomas, puede gestionar conversaciones multi-turno con historial extenso y consultas en varios idiomas.
- Generación de código en entornos de desarrollo: su capacidad de razonamiento y posible tool calling permite integrarlo en pipelines de CI/CD para autocompletar código, revisar PR o generar tests.
- Agentes autónomos para automatización de tareas: con técnicas React, puede planificar y ejecutar acciones en entornos simulados o APIs, útil en RPA.
- Análisis de documentos con imágenes: al ser multimodal, puede extraer información de capturas, diagramas o documentos escaneados combinados con texto.
- Sistemas de tutoría inteligente: su razonamiento y conocimiento STEM (MMLU-Pro 79.1) lo hacen adecuado para explicar conceptos y resolver problemas paso a paso.
- Prototipado de chatbots con contexto largo: para aplicaciones que requieren mantener el contexto de conversaciones muy largas (hasta 262K tokens), como análisis de logs o resúmenes de documentos extensos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para el fine-tune. La tabla siguiente corresponde al modelo base Qwen3.5-4B, extraída de su model card. El fine-tune podría tener rendimiento diferente, pero no hay datos.

| Benchmark | Qwen3.5-4B (base) |
|---|---|
| MMLU-Pro | 79.1 |
| MMLU-Redux | 91.4 (según tabla, aunque el valor exacto no se muestra en el extracto) |

Nota: en el extracto de la model card solo se ven MMLU-Pro y MMLU-Redux para Qwen3.5-4B; otros benchmarks no se muestran. No se dispone de datos adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: ~8,4 GB de pesos + overhead de activaciones y KV cache, por lo que se recomienda al menos 12 GB de VRAM para contexto moderado. Con contexto largo (262K tokens), la memoria de KV cache crece significativamente.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB) para contexto medio, A100 40/80 GB o H100 para contexto largo o despliegue concurrente.
- En consumer GPU: sí, cabe en RTX 4090, RTX 3090 (24 GB) y posiblemente en GPUs de 16 GB con cuantización 4-bit (si se genera GGUF/AWQ).
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, SGLang y KTransformers (según model card base). También puede usarse con llama.cpp si se convierte a GGUF.
- Latencia y throughput: no disponibles; dependen del hardware, la cuantización y la longitud de contexto. En una RTX 4090 con fp16, se espera una velocidad de decodificación de ~20-40 tokens/s para contexto moderado, pero no hay mediciones oficiales.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del fine-tune para comparar directamente. Como referencia, el modelo base Qwen3.5-4B se compara en la model card con otros modelos de mayor tamaño (GPT-OSS-120B, GPT-OSS-20B, Qwen3-Next-80B-A3B-Thinking, Qwen3-30B-A3B-Thinking, Qwen3.5-9B) en MMLU-Pro, donde Qwen3.5-4B obtiene 79.1 frente a 82.5 del Qwen3.5-9B y 80.9 del Qwen3-30B-A3B. Sin embargo, no hay comparación con otros modelos de 4B en la información disponible. Se recomienda comparar con Qwen3-4B, Llama-3.2-3B o Phi-3.5-mini, pero no hay datos en la fuente.

## Limitaciones y advertencias

- El fine-tune no tiene model card propia; la información se basa en el modelo base, por lo que las capacidades específicas del ajuste no están documentadas.
- Riesgo de alucinación: como todo LLM, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo.
- Sesgos: el modelo base puede contener sesgos derivados de sus datos de entrenamiento; no se han publicado evaluaciones de sesgo para el fine-tune.
- Limitaciones de contexto: aunque el contexto nativo es de 262K tokens, el uso de contextos muy largos aumenta el coste computacional y puede degradar la calidad si no se gestiona adecuadamente.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el fine-tune puede tener restricciones adicionales si se usan datos propietarios (no se indica).
- Para producción, es recomendable validar el rendimiento del fine-tune en tareas específicas, ya que el ajuste con SDPO/React puede alterar el comportamiento respecto al base.

## Enlaces

- Repositorio del fine-tune: https://huggingface.co/ipfipfipf/Qwen3.5-4B-sdpo-react-rlsd-multitask-arm1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
