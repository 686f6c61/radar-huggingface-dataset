# mrminjae/qwen3p6-35b-a3b-2p16bit-r98

## Resumen

Qwen3.6-35B-A3B-2.16bit-r98 es un checkpoint de investigación derivado de Qwen/Qwen3.6-35B-A3B, publicado por el usuario mrminjae en Hugging Face. Se trata de una variante de cuantización selectiva: únicamente los expertos enrutados (routed experts) del modelo MoE se almacenan con una precisión media de 2,16 bits, mientras que el resto de pesos conserva BF16. Los pesos se guardan ya descomprimidos en tensores BF16, de modo que el modelo carga directamente con transformers y vLLM sin necesidad de kernels de cuantización especiales.

El modelo base es un MoE de Qwen con 35.107.181.936 parámetros totales, orientado a generación de texto y a tareas image-text-to-text según las etiquetas del repositorio. La propuesta de esta variante es reducir el espacio ocupado por los expertos manteniendo el resto de la red en BF16, un enfoque intermedio entre la cuantización completa y el modelo original.

Es relevante ahora porque demuestra una estrategia de compresión agresiva sobre la parte del MoE que más peso aporta (los expertos), manteniendo compatibilidad con el ecosistema estándar de inferencia. No obstante, se trata de un checkpoint interno de investigación, sin descargas ni validación pública, y la model card no documenta métricas de calidad tras la cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer (según etiqueta `qwen3_5_moe` del repositorio) |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a 2,16 bits de media; resto de pesos en BF16 (pesos almacenados descomprimidos en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Sigue la licencia del modelo base (no especificada en la información disponible) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base Qwen3.6-35B-A3B, identificada en el repositorio como `qwen3_5_moe`, es decir, un transformer con mezcla de expertos. La intervención del autor no consiste en un fine-tuning, sino en una cuantización post-entrenamiento selectiva: los expertos enrutados se comprimen hasta una media de 2,16 bits, mientras que el resto de la red (atención, embeddings, capas densas y router) permanece en BF16. Tras la compresión, los pesos se almacenan descomprimidos en tensores BF16, lo que explica que el repositorio ocupe 70,2 GB pese a la cuantización de los expertos.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si hubo RLHF, DPO u otras fases de alineación, ya que la model card solo documenta el proceso de cuantización. Tampoco se detalla la técnica concreta empleada para llevar los expertos a 2,16 bits (por ejemplo, cuantización por grupos, escalas por canal o métodos tipo GPTQ/AWQ adaptados a MoE). El identificador "r98" corresponde a un checkpoint interno de investigación del autor.

## Capacidades

- Generación de texto conversacional, según el pipeline declarado `text-generation` y la etiqueta `conversational`.
- Procesamiento image-text-to-text, de acuerdo con la etiqueta del repositorio, aunque no se detalla la arquitectura de visión ni su configuración.
- Razonamiento y matemáticas: capacidades heredadas del modelo base, no verificadas en esta variante.
- Generación de código: capacidad esperable del base, sin datos específicos de esta cuantización.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre cuantización de MoE: el checkpoint permite estudiar el impacto de comprimir solo los expertos enrutados a 2,16 bits mientras el resto de la red permanece en BF16, comparando la salida con el modelo base en tareas controladas.
- Evaluación de degradación por experto: al conservar el resto de pesos en BF16, se puede aislar el efecto de la cuantización de expertos en dominios concretos (código, matemáticas, texto libre) sin contaminar el análisis con otros errores de compresión.
- Despliegue en entornos con vLLM o transformers estándar: al almacenarse los pesos descomprimidos en BF16, el modelo carga sin kernels de cuantización personalizados, lo que facilita integrarlo en pipelines existentes de evaluación.
- Reproducción de experimentos de compresión: sirve como referencia para replicar la receta r98 sobre otros modelos MoE de tamaño similar.
- Pruebas de inferencia image-text-to-text: útil para validar si la capacidad multimodal del base se preserva tras la cuantización selectiva de expertos.
- Benchmarking interno de calidad frente al base: permite medir la pérdida de precisión en tareas de generación y razonamiento antes de considerar el modelo para producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 70,2 GB en safetensors con pesos en BF16, por lo que la VRAM necesaria para cargar el modelo completo ronda los 70 GB, más overhead de activaciones y caché KV.
- GPU recomendadas para carga completa: A100 80 GB, H100 80 GB o configuraciones multi-GPU (por ejemplo, 2× A100 40 GB con tensor parallelism).
- En GPU de consumo (RTX 4090 24 GB, RTX 3090 24 GB) no cabe el checkpoint completo en BF16; sería necesario sharding, offload a CPU o una recuantización adicional no incluida en el repositorio.
- Opciones de despliegue: transformers y vLLM, según indica el autor; llama.cpp y Ollama no están confirmados para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mrminjae/qwen3p6-35b-a3b-2p16bit-r98 | 35,1 B | no disponible | Expertos a 2,16 bits, resto BF16 | Sigue la del base | Hugging Face, 0 descargas |
| Qwen/Qwen3.6-35B-A3B | 35,1 B | no disponible | BF16 original | no disponible | Hugging Face (modelo base) |
| Alternativas de 30-40 B MoE | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Checkpoint de investigación interna: el autor lo etiqueta explícitamente como "internal research checkpoint", sin validación pública ni descargas.
- Sin benchmarks: no hay evidencia publicada de la pérdida de calidad frente al modelo base tras la cuantización de expertos a 2,16 bits.
- Licencia no especificada en la información disponible; la model card indica que sigue la del modelo base, pero no se detalla cuál es, lo que impide confirmar el uso comercial.
- Idiomas soportados no documentados; no se puede garantizar el rendimiento multilingüe del base.
- Riesgo de alucinación y sesgos: no evaluados en esta variante; la cuantización agresiva de expertos puede amplificar degradaciones en dominios específicos.
- Tamaño de repositorio elevado (70,2 GB) pese a la cuantización, porque los pesos se almacenan descomprimidos en BF16; no ofrece la reducción de huella que cabría esperar de una cuantización a 2 bits.
- Ausencia de métricas de contexto, tool calling y capacidades multimodales verificadas en esta variante.
- No apto para producción sin una evaluación previa contra el modelo base en las tareas objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrminjae/qwen3p6-35b-a3b-2p16bit-r98
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
