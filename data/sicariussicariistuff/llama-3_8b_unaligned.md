# SicariusSicariiStuff/LLAMA-3_8B_Unaligned

## Resumen

LLAMA-3_8B_Unaligned es un ajuste fino (fine-tune) no oficial del modelo Meta Llama 3 de 8B parámetros, desarrollado por el usuario independiente SicariusSicariiStuff. El objetivo declarado del proyecto es el "desalineamiento" del modelo, es decir, reducir o eliminar los mecanismos de rechazo y las restricciones de alineación introducidas por el entrenamiento con RLHF/DPO de Meta, de modo que el modelo responda a peticiones que el modelo base tendería a declinar. El proyecto se presenta como un trabajo de curación de datos propio, en lugar de un simple merge o un fine-tune sobre datasets públicos de baja calidad.

El modelo parte de la familia Llama 3 (8B) y, según las actualizaciones del autor, migró posteriormente a la base Llama 3.1 de 8B con contexto de 128k tokens. La model card es fundamentalmente un diario de desarrollo: no incluye fichas técnicas formales, resultados de benchmarks ni detalles del dataset de entrenamiento. El repositorio aparece con un tamaño de 0.0 GB en los metadatos de Hugging Face, lo que sugiere que los pesos no están disponibles públicamente en el momento de la consulta o que el repositorio solo contiene documentación e imágenes.

La relevancia de esta ficha es doble: por un lado, documenta un caso típico de fine-tune comunitario orientado a roleplay y escritura creativa sin restricciones; por otro, sirve como advertencia sobre los riesgos de desplegar modelos desalineados en producción, dada la ausencia de evaluación de seguridad, de benchmarks y de pesos verificables.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Llama 3 / Llama 3.1 8B) |
| Parámetros totales | 8B (aproximado, según el nombre del modelo y la base Llama 3 8B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 8k en la base Llama 3; 128k en la base Llama 3.1 (según notas del autor) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repositorio figura con 0.0 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3 8B, un transformer decoder-only con atención causal estándar, normalización RMSNorm, activaciones SwiGLU y embeddings rotatorios (RoPE). El autor indica que el proyecto migró de Llama 3 a Llama 3.1 8B para aprovechar la ventana de contexto de 128k tokens, aunque estima que la coherencia práctica se mantendrá en torno a 32k tokens. No se especifican el número de tokens de entrenamiento, la composición del dataset ni la técnica de ajuste (SFT, DPO, etc.); el autor menciona explícitamente que no emplea "nuevas técnicas revolucionarias de RL" sino procesamiento de datos propio.

El elemento diferencial declarado es la curación manual de un dataset orientado a eliminar el comportamiento de rechazo del modelo base. El autor afirma haber accedido a fuentes de datos que describe como "zona gris" legal y que no detalla por motivos de protección del proyecto. No hay información verificable sobre el proceso de entrenamiento, el número de pasos, el hardware utilizado ni la evaluación posterior. Tampoco se documenta ninguna innovación arquitectónica: se trata de un fine-tune sobre la arquitectura original de Meta sin modificaciones estructurales conocidas.

## Capacidades

- Generación de texto en inglés con estilos creativos y de roleplay, incluyendo narrativa de ficción y diálogo multi-turno.
- Escritura creativa sin las restricciones de rechazo típicas del modelo base alineado (el autor publica ejemplos zero-shot de narrativa).
- Reducción del comportamiento de rechazo ante peticiones que el Llama 3 base declinaría, según la intención declarada del proyecto.
- Soporte de conversación multi-turno heredado de la plantilla de chat de Llama 3.
- Capacidades de razonamiento y código heredadas del modelo base, aunque no evaluadas ni documentadas por el autor.
- Soporte de tool calling y function calling: no documentado; se heredaría, en su caso, del formato de Llama 3, pero no hay confirmación.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo "thinking", visión o audio: no disponibles.

## Casos de uso

- Escritura creativa y narrativa de ficción: el modelo está orientado a generar relatos y diálogos sin las autocensuras del modelo base, lo que lo hace adecuado para talleres literarios, generación de borradores de novela o guiones donde se requiere explorar temas sensibles sin rechazos.
- Roleplay y personajes conversacionales: la reducción de rechazos y el ajuste sobre Llama 3 8B permiten mantener personajes coherentes en conversaciones multi-turno, un uso habitual en plataformas de entretenimiento conversacional.
- Investigación sobre alineación y seguridad: sirve como caso de estudio para analizar cómo el fine-tuning comunitario puede degradar los mecanismos de seguridad de un modelo alineado, útil en trabajos de red-teaming académico.
- Generación de datos sintéticos para experimentos controlados: en entornos de investigación cerrados, puede emplearse para producir corpus de texto con estilos o temáticas que los modelos alineados rechazan, siempre con revisión humana posterior.
- Prototipado de asistentes de escritura sin filtros: para equipos que necesitan un modelo local de 8B que no interrumpa el flujo creativo con rechazos, desplegable en una sola GPU consumer.
- Evaluación comparativa de fine-tunes comunitarios: como referencia en estudios sobre la calidad y los riesgos de los fine-tunes no oficiales frente a los modelos base de Meta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones de seguridad, y el autor no documenta comparaciones cuantitativas con el modelo base ni con otros fine-tunes.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16 GB en FP16/BF16 para los 8B parámetros; en torno a 5-6 GB con cuantización de 4 bits (estimación estándar para un modelo de 8B, no confirmada por el autor).
- GPU recomendadas: A100 40GB, H100 o L40S para FP16 con contexto largo; RTX 4090 (24 GB) para FP16 con contexto moderado o cuantización.
- Cabe en GPU consumer: sí, en RTX 3090/4090 (24 GB) en FP16 y en GPUs de 8-12 GB con cuantización de 4 bits.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, TGI y transformers, siempre que los pesos estén disponibles; en la información consultada el repositorio figura con 0.0 GB, por lo que la disponibilidad de pesos no está confirmada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad de pesos |
|---|---|---|---|---|---|
| LLAMA-3_8B_Unaligned | 8B | 8k (3) / 128k (3.1) | Apache 2.0 | Fine-tune desalineado para escritura y roleplay | No confirmada (repo 0.0 GB) |
| Meta Llama 3 8B Instruct | 8B | 8k | Llama 3 Community License | Asistente alineado con RLHF | Pública en Meta/Hugging Face |
| Meta Llama 3.1 8B Instruct | 8B | 128k | Llama 3.1 Community License | Asistente alineado, tool calling | Pública en Meta/Hugging Face |
| Mistral 7B Instruct | 7B | 32k | Apache 2.0 | Asistente alineado | Pública en Hugging Face |

La comparación cuantitativa de rendimiento no está disponible porque el autor no publica benchmarks. La diferencia principal frente a los modelos base es la intención de eliminar rechazos, no una mejora medible en tareas estándar.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el fine-tune preserve las capacidades de razonamiento, código o matemáticas del modelo base; el ajuste podría degradarlas.
- Riesgo elevado de alucinación y de respuestas inseguras: al reducir deliberadamente los mecanismos de rechazo, el modelo puede generar contenido dañino, sesgado o factualmente incorrecto sin advertencia.
- Sesgos conocidos: no documentados por el autor; se heredan los del modelo base y se añaden los del dataset de desalineación, que no es público ni auditable.
- Limitación de idioma: solo inglés según la model card; el rendimiento en castellano no está evaluado y probablemente sea deficiente.
- Licencia: Apache 2.0 declarada, pero la base Llama 3/3.1 de Meta tiene su propia licencia comunitaria con restricciones de uso comercial y de redistribución; la combinación de ambas licencias no está aclarada por el autor y requiere revisión legal antes de uso comercial.
- Disponibilidad: el repositorio figura con 0.0 GB y no se confirma la publicación de pesos; la model card es un diario de desarrollo con actualizaciones que mencionan cambios de base y datasets no públicos.
- Advertencia para producción: no se recomienda su despliegue en aplicaciones de cara al usuario sin una capa de moderación externa y una evaluación de seguridad propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SicariusSicariiStuff/LLAMA-3_8B_Unaligned
- Blog y actualizaciones del autor: https://huggingface.co/SicariusSicariiStuff/Blog_And_Updates
- Modelo previo del autor (Impish_LLAMA_3B): https://huggingface.co/SicariusSicariiStuff/Impish_LLAMA_3B
- Meta Llama 3: https://huggingface.co/meta-llama/Meta-Llama-3-8B
- Meta Llama 3.1: https://huggingface.co/meta-llama/Meta-Llama-3.1-8B
