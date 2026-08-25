# Sedibaai/SedibaLM

## Resumen

SedibaLM es un modelo de lenguaje de 1.543.712.304 parámetros (aproximadamente 1,5B) desarrollado por Sediba-AI, una organización sudafricana cuyo objetivo declarado es crear "IA soberana arraigada en Sudáfrica, construida para comunidades indígenas de todo el mundo". El modelo se publica bajo licencia CC BY-SA 4.0 y se distribuye en formato safetensors.

El tag `qwen2` indica que la arquitectura base corresponde a la familia Qwen2, aunque no se especifica si se trata de un fine-tuning de un modelo Qwen2 existente o de un entrenamiento desde cero sobre esa arquitectura. El repositorio pesa 3,1 GB, coherente con el tamaño de parámetros declarado. La model card es prácticamente vacía, sin información sobre datos de entrenamiento, capacidades ni benchmarks, lo que limita la evaluación objetiva del modelo.

El proyecto se enmarca en una iniciativa más amplia de Sediba-AI que incluye otros modelos, como un clasificador de sentimiento en sepedi de 0,2B parámetros. Esto sugiere que SedibaLM podría estar orientado a lenguas bantúes del sur de África, aunque no hay confirmación explícita en la información disponible. Su relevancia reside en el intento de crear modelos soberanos para comunidades lingüísticas subrepresentadas, aunque la falta de documentación dificulta su adopción en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (según tag) |
| Parametros totales | 1.543.712.304 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (presumiblemente lenguas del sur de África, sin confirmar) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El único dato técnico disponible es el tag `qwen2`, que indica que el modelo se basa en la arquitectura Qwen2, un transformer decoder-only con atención multi-cabeza, normalización RMSNorm y activación SwiGLU, tal como se describe en la literatura de la familia Qwen2. No se especifica si SedibaLM es un fine-tuning de un modelo Qwen2 existente o un entrenamiento desde cero sobre esta arquitectura.

No hay información pública sobre el dataset de entrenamiento, el número de tokens procesados, el método de alineación (RLHF, DPO, etc.) ni ninguna innovación técnica destacable. El repositorio de Sediba-AI en GitHub menciona su misión de IA soberana para comunidades indígenas, lo que sugiere que el entrenamiento podría centrarse en lenguas como sepedi, sotho, zulú o xhosa, pero esto no está documentado en la model card.

## Capacidades

Las capacidades específicas de SedibaLM no están documentadas en la información disponible. Basándose en la arquitectura Qwen2 de 1,5B y en el propósito declarado de la organización, se pueden inferir las siguientes capacidades potenciales, sin confirmación oficial:

- Generación de texto en lenguas del sur de África (presumiblemente, dado el contexto de Sediba-AI)
- Razonamiento básico y comprensión de instrucciones, coherente con modelos de 1,5B
- Posible soporte de código y matemáticas elementales, típico de la familia Qwen2

No se ha documentado soporte de tool calling, function calling, agentes, visión ni audio.

## Casos de uso

Dado el vacío de documentación, los casos de uso siguientes son hipotéticos y deben validarse antes de adoptar el modelo:

- **Traducción y localización para lenguas sudafricanas**: el modelo podría servir como base para traductores automáticos entre lenguas bantú e inglés, aprovechando el enfoque de Sediba-AI en comunidades indígenas.
- **Análisis de sentimiento en redes sociales**: dado que Sediba-AI ya publicó un clasificador de sentimiento en sepedi, SedibaLM podría ampliar esta capacidad a otras tareas de PLN en la misma familia lingüística.
- **Asistentes de voz o texto para educación**: un modelo pequeño de 1,5B es viable para desplegar en entornos con recursos limitados, como escuelas o clínicas en regiones donde se hablan estas lenguas.
- **Prototipado de chatbots en lenguas minorizadas**: la licencia CC BY-SA permite usos no comerciales y comerciales con atribución, lo que facilita experimentos en ONGs y universidades.
- **Fine-tuning sobre dominios específicos**: al ser un modelo de 1,5B, es factible fine-tuning con recursos moderados (una GPU de 16-24 GB) para tareas como extracción de información en documentos administrativos locales.
- **Investigación en IA multilingüe de bajos recursos**: el modelo puede servir como punto de partida para estudiar el rendimiento de arquitecturas Qwen2 en lenguas africanas subrepresentadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni ninguna otra evaluación comparativa. La model card no incluye ninguna métrica de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 1,5B parámetros en FP16, se necesitan aproximadamente 3 GB de VRAM. En cuantización de 8 bits, unos 1,5-2 GB; en 4 bits, menos de 1 GB.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente para inferencia en FP16 (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4090). Para fine-tuning, se recomienda una GPU de al menos 8 GB (RTX 3070, RTX 4060 Ti) o 16 GB (RTX 4080, A100 40 GB) si se usan técnicas como LoRA.
- En consumer GPU: sí, cabe perfectamente en GPUs de consumo, incluso en las más modestas.
- Opciones de despliegue: vLLM, llama.cpp, Ollama (si se convierte a GGUF), TGI. Al ser safetensors, es compatible con Hugging Face Transformers y vLLM directamente.
- Latencia y throughput: no disponible. En una RTX 3090 se puede esperar un throughput de decenas de tokens por segundo para un modelo de 1,5B, pero no hay datos medidos.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SedibaLM | 1,54B | Qwen2 | no disponible | CC BY-SA 4.0 | Hugging Face |
| Qwen2.5-1.5B | 1,54B | Qwen2.5 | 32k | Apache 2.0 | Hugging Face |
| Llama-3.2-1B | 1,23B | Transformer | 128k | Llama 3.2 Community License | Hugging Face |
| Gemma-2-2B | 2,6B | Transformer | 8k | Gemma License | Hugging Face |

La comparativa se limita a modelos del mismo rango de parámetros. SedibaLM se distingue por su licencia CC BY-SA 4.0 y su enfoque en comunidades indígenas, pero carece de documentación técnica comparable a la de Qwen2.5, Llama 3.2 o Gemma 2, que incluyen especificaciones detalladas y benchmarks públicos.

## Limitaciones y advertencias

- No hay información sobre sesgos ni datos de entrenamiento, lo que impide evaluar riesgos de parcialidad lingüística o cultural.
- La model card vacía impide conocer la longitud de contexto real, los idiomas soportados y las capacidades exactas; cualquier uso en producción debe ir precedido de pruebas exhaustivas.
- Riesgo de alucinación: desconocido, pero al ser un modelo pequeño (1,5B) es probable que presente más alucinaciones que modelos de mayor tamaño.
- La licencia CC BY-SA 4.0 es una licencia de contenido, no específica para modelos de IA, y puede presentar ambigüedades legales en cuanto a la distribución de derivados y el uso comercial.
- No se ha publicado ningún benchmark, por lo que no se puede comparar su rendimiento con alternativas establecidas.
- El tag `region:us` sugiere que los datos o el entrenamiento podrían estar relacionados con Estados Unidos, lo que contradice parcialmente el enfoque declarado en Sudáfrica; no hay más información.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Sedibaai/SedibaLM
- Organización Sediba-AI en Hugging Face: https://huggingface.co/Sediba-AI
- GitHub de Sediba-AI: https://github.com/Sediba-AI
- Dataset de Sediba-AI: https://huggingface.co/Sediba-AI/datasets
