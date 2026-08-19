# safffrron/25M2111-Week01-Track1-20-Submission01

## Resumen

El modelo `safffrron/25M2111-Week01-Track1-20-Submission01` es un artefacto comprimido derivado del modelo base Qwen/Qwen3.5-4B, desarrollado por el autor safffrron como parte de un desafío de compresión de modelos (Week 01, Track 1, objetivo del 20% del tamaño original). El artefacto físico ocupa 1.626.481.790 bytes, lo que supone un 19,34% del denominador BF16 de 8,412 GB, y alcanza una precisión de 0,879 en un conjunto de validación de 560 checkpoints tras la restauración física. La relevancia de este modelo radica en su enfoque de compresión agresiva mediante cuantización mixta y compresión sin pérdida, manteniendo un rendimiento razonable para tareas de generación de texto, lo que lo hace interesante para despliegues en entornos con recursos limitados.

El modelo utiliza una adaptación LoRA previa, seguida de cuantización GPTQ de 3 bits para las matrices MLP grandes, 4 bits para las proyecciones lineales de Gated DeltaNet, y 8 bits para la atención completa. Los tensores sensibles como controles recurrentes, normas y sesgos se mantienen en BF16. Además, emplea un predictor determinista de cadenas de tokens para reconstruir filas de vocabulario omitidas y compresión zlib sin pérdida sobre el artefacto serializado.

Aunque la información pública es escasa, el modelo demuestra una estrategia viable para reducir drásticamente el tamaño de un modelo de 4B parámetros manteniendo una precisión aceptable, lo que abre la puerta a su uso en inferencia en dispositivos con memoria limitada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen/Qwen3.5-4B (transformer con Gated DeltaNet, según se menciona en la descripción) |
| Parametros totales | No disponible (se infiere ~4B por el nombre del modelo fuente) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 3-bit GPTQ (MLP), 4-bit GPTQ (proyecciones Gated DeltaNet), 8-bit (atención y embeddings) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | Artefacto comprimido `.ptz` (serialización con zlib), además de código Python para conversión |

## Arquitectura y entrenamiento

El modelo es una versión comprimida de Qwen/Qwen3.5-4B. El proceso comienza con una adaptación LoRA (solo completado) que fomenta razonamientos más cortos y correctos. Posteriormente, las matrices MLP grandes se cuantizan a 3 bits mediante GPTQ, las proyecciones lineales de Gated DeltaNet a 4 bits, y la atención completa a 8 bits. Los controles recurrentes, normas, sesgos y otros tensores pequeños y sensibles permanecen en BF16. La tabla de embeddings/salida atada almacena 30.000 filas de tokens originales a 8 bits, mientras que un predictor determinista de cadenas de tokens (701.760 bytes) reconstruye las filas de entrada omitidas. Finalmente, el artefacto serializado se comprime con zlib sin pérdida, reduciendo el tamaño de 1.790.943.184 a 1.626.481.790 bytes.

No se dispone de información sobre los datos de entrenamiento, el número de tokens utilizados ni el proceso de alineación (RLHF/DPO). El modelo se presenta como un artefacto comprimido, no como un modelo entrenado desde cero, por lo que su comportamiento depende del modelo base original.

## Capacidades

- Generación de texto: hereda las capacidades del modelo base Qwen3.5-4B, aunque no se han publicado pruebas específicas.
- Razonamiento: se menciona una adaptación LoRA que fomenta razonamientos más cortos, lo que sugiere un enfoque en eficiencia.
- Compresión y restauración: el modelo incluye una API para convertir desde y hacia checkpoints de Hugging Face (`convert_from_hf_checkpoint` y `convert_to_hf_checkpoint`), lo que permite su uso en pipelines estándar.
- Inferencia con restricción de vocabulario: la evaluación física restringe los logits de salida a los tokens originales almacenados, lo que puede afectar a la diversidad de salida.
- No se ha confirmado soporte para tool calling, agentes, visión o audio.

## Casos de uso

- Despliegue en entornos con memoria limitada: con un tamaño de 1,6 GB, el modelo puede ejecutarse en GPUs de gama media o incluso en CPU con cuantización adicional, lo que lo hace adecuado para prototipos o aplicaciones edge.
- Investigación en compresión de modelos: sirve como caso de estudio para técnicas de cuantización mixta y compresión sin pérdida, útil para investigadores que buscan reducir el tamaño de LLMs sin pérdida significativa de rendimiento.
- Generación de texto en aplicaciones con restricciones de almacenamiento: por ejemplo, chatbots locales o asistentes integrados en dispositivos móviles, donde el peso del modelo es crítico.
- Evaluación de robustez post-compresión: permite estudiar cómo afecta la cuantización agresiva a la precisión en tareas de razonamiento y generación.
- Integración en pipelines de inferencia con vLLM u Ollama: aunque no se menciona soporte explícito, al ser un checkpoint de Hugging Face podría convertirse a formatos estándar (GGUF, etc.) para su uso con herramientas populares.
- Educación y demostraciones: por su tamaño reducido, puede utilizarse en entornos académicos para enseñar conceptos de compresión y cuantización de modelos.

## Benchmarks y rendimiento

La información disponible solo incluye métricas internas del desafío, no benchmarks estándar como MMLU o HumanEval. Se reporta:

| Metrica | Valor |
|---|---|
| Precisión (checkpoint suite, n=560) | 0,879 |
| Tasa de parseo | 0,970 |
| Tasa de truncamiento | 0,037 |

Estas métricas se obtuvieron tras la restauración física del artefacto y con un límite de 32.768 tokens en la evaluación. No se han publicado resultados comparativos con otros modelos en benchmarks públicos.

## Requisitos de hardware

- VRAM estimada: dado el tamaño del artefacto (1,6 GB) y la cuantización mixta, se estima que la inferencia puede requerir entre 2 y 4 GB de VRAM en FP16, o menos si se aplica cuantización adicional (por ejemplo, 8 bits). Sin embargo, no se dispone de datos oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, o superiores). Para mayor velocidad, se recomienda una RTX 3090 o A100, pero no es imprescindible.
- Compatibilidad con consumer GPU: sí, es probable que quepa en GPUs de consumo actuales (RTX 3060, 4060, etc.) gracias a su tamaño reducido.
- Opciones de despliegue: al ser un checkpoint de Hugging Face, puede convertirse a formatos como GGUF para usar con llama.cpp u Ollama, o cargarse con vLLM si se convierte a safetensors. No se proporcionan scripts de despliegue específicos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el mismo contexto de compresión. El modelo se basa en Qwen3.5-4B, pero no se han publicado comparaciones con otros modelos de tamaño similar (por ejemplo, Llama 3.2 3B, Phi-3 mini, etc.) en términos de rendimiento post-compresión. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Sesgos: al derivar de Qwen, el modelo puede heredar sesgos presentes en los datos de entrenamiento del modelo base, aunque no se ha documentado.
- Riesgo de alucinación: como cualquier LLM, puede generar contenido falso o inventado, especialmente con la restricción de vocabulario que limita los tokens de salida.
- Limitaciones de contexto: no se especifica la longitud de contexto, pero la evaluación se realizó con un límite de 32.768 tokens, lo que sugiere que el contexto máximo podría ser inferior al del modelo original.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede garantizar el uso comercial sin verificación.
- Dependencia de código propietario: el modelo requiere funciones específicas (`convert_from_hf_checkpoint`, `convert_to_hf_checkpoint`) y un runtime (`src/eaimath`) incluido en el repositorio, lo que puede dificultar su integración en entornos estándar.
- La restricción de logits a los tokens originales almacenados puede reducir la fluidez o la diversidad de las respuestas.
- No se ha verificado la reproducibilidad completa fuera del entorno del autor.

## Enlaces

- Hugging Face: https://huggingface.co/safffrron/25M2111-Week01-Track1-20-Submission01
- GitHub: https://github.com/safffrron/CS6013/tree/main/25M2111/Week01/Track1_20/Submission01
