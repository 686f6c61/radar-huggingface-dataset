# salohcin714/granite-4.2-3b-4bit-gptq-mlx

## Resumen

El modelo `salohcin714/granite-4.2-3b-4bit-gptq-mlx` es una conversión cuantizada del modelo Granite 4.2 3B de IBM, adaptado al formato MLX para ejecutarse de forma eficiente en hardware Apple Silicon. La cuantización se ha realizado con una precisión de 4 bits mediante calibración basada en la Hessiana (GPTQ), con un tamaño de grupo de 64, lo que reduce el peso del modelo a aproximadamente 2,1 GB. Esta conversión permite desplegar un modelo de razonamiento con capacidades de tool calling y chain-of-thought en entornos locales de Apple, sin necesidad de GPUs dedicadas.

El modelo base, Granite 4.2 3B, forma parte de la familia Granite 4.2 de IBM, una serie de modelos densos decoder-only de 3B, 8B y 30B parámetros, post-entrenados sobre los modelos base Granite 4.1. Incorpora modos de pensamiento flexibles (thinking mode) y un mecanismo de tool calling aumentado con razonamiento, lo que lo hace adecuado para tareas de agente y automatización. La conversión MLX no añade fine-tuning ni datos de entrenamiento adicionales, por lo que las capacidades del modelo original se mantienen intactas, aunque las métricas publicadas por IBM se refieren a los pesos originales y no a este artefacto cuantizado.

Al estar licenciado bajo Apache 2.0, el modelo puede utilizarse comercialmente sin restricciones significativas, lo que lo convierte en una opción atractiva para desarrolladores que buscan un LLM local de tamaño reducido con capacidades de razonamiento y multilingüismo en doce idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso |
| Parametros totales | 588.065.280 (segun safetensors; el modelo base declara 3B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base Granite 4.2 soporta hasta 128K, pero no se confirma en esta conversion) |
| Tipos de cuantizacion | 4-bit GPTQ (grupo de 64, calibracion Hessiana) |
| Idiomas soportados | en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Granite 4.2 3B es un transformer decoder-only denso, sin arquitectura MoE ni SSM. IBM lo describe como parte de una familia de modelos de razonamiento denso con chain-of-thought integrado y modos de pensamiento configurables (thinking mode). El entrenamiento se realizó en dos fases: pre-entrenamiento sobre los modelos Granite 4.1 y post-entrenamiento específico para razonamiento y tool calling. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la documentación disponible.

La conversión a MLX realizada por `salohcin714` no modifica los pesos originales más allá de la cuantización. Se aplicó una cuantización afín de 4 bits con grupo de 64, utilizando calibración basada en la Hessiana (método GPTQ) para minimizar la pérdida de precisión. Además, se eliminó el `lm_head.weight` redundante en los casos donde el modelo ata las embeddings de entrada y salida, reduciendo ligeramente el tamaño del archivo. No se realizó fine-tuning ni se añadieron datos de entrenamiento adicionales.

## Capacidades

- Generación de texto y conversación multi-turno en 12 idiomas (inglés, alemán, español, francés, japonés, portugués, árabe, checo, italiano, coreano, neerlandés y chino).
- Razonamiento con chain-of-thought integrado, con modos de pensamiento flexibles (pensamiento rápido, pensamiento profundo, sin pensamiento) configurables según la tarea.
- Tool calling aumentado con razonamiento, lo que permite al modelo decidir cuándo y cómo invocar funciones externas durante una conversación.
- Soporte para agentes y ejecución de tareas multi-paso gracias a su capacidad de razonamiento y planificación.
- Comprensión y generación de código, aunque no se especifican benchmarks específicos en la información disponible.
- Capacidad para trabajar con contextos largos (el modelo base soporta hasta 128K, aunque no se confirma en esta conversión cuantizada).

## Casos de uso

- Asistente virtual local en macOS: al estar optimizado para MLX, puede ejecutarse en un Mac con Apple Silicon (M1 o superior) usando `mlx_lm`, ofreciendo respuestas con razonamiento sin depender de la nube. Es adecuado para tareas de productividad, resolución de dudas técnicas y redacción multilingüe.
- Automatización de atención al cliente: gracias a su soporte de tool calling y razonamiento, puede integrarse en sistemas de tickets para clasificar consultas, extraer datos de APIs externas y generar respuestas contextuales en varios idiomas, reduciendo la carga de agentes humanos.
- Generación de código en entornos de desarrollo local: el modelo puede completar fragmentos de código, explicar algoritmos y sugerir refactorizaciones. Su tamaño reducido permite ejecutarlo en un portátil sin necesidad de GPU dedicada, ideal para desarrolladores que trabajan offline o con datos sensibles.
- Agente de automatización de tareas de oficina: combinado con tool calling, puede interactuar con calendarios, correos electrónicos o bases de datos a través de funciones definidas por el usuario, ejecutando flujos multi-paso como la programación de reuniones o la generación de informes.
- Traducción y localización de contenido: al soportar 12 idiomas, puede traducir documentos técnicos, correos o interfaces de usuario con un nivel de razonamiento superior al de un simple modelo de traducción, preservando el contexto y el tono.
- Prototipado rápido de aplicaciones con IA generativa: los desarrolladores pueden usar este modelo en entornos de prueba (por ejemplo, con Ollama o vLLM en Mac) para validar ideas de productos que requieran razonamiento y multilingüismo antes de escalar a modelos más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las métricas de rendimiento publicadas por IBM se refieren al modelo base Granite 4.2 3B original y no a este artefacto cuantizado y convertido a MLX. Por lo tanto, no es posible ofrecer una tabla comparativa fiable sin datos verificados.

## Requisitos de hardware

- VRAM estimada: el tamaño del repositorio es de 2,1 GB, por lo que la memoria necesaria para cargar el modelo en RAM/VRAM es de aproximadamente 2,5-3 GB (incluyendo overhead del runtime). En Mac con memoria unificada, un equipo con 8 GB de RAM puede ejecutarlo con holgura.
- GPU recomendadas: cualquier Mac con Apple Silicon (M1, M2, M3 o M4) con al menos 8 GB de memoria unificada. También puede ejecutarse en GPUs NVIDIA mediante conversión a otros formatos, pero el formato MLX está optimizado para Apple.
- Compatibilidad con consumer GPU: no aplica directamente, ya que MLX es específico de Apple Silicon. Sin embargo, los pesos pueden convertirse a otros formatos (GGUF, safetensors estándar) para su uso en GPUs NVIDIA o AMD.
- Opciones de despliegue: `mlx_lm` (biblioteca oficial de MLX), Ollama (con soporte MLX experimental), o mediante scripts Python personalizados con `mlx-lm`. También es posible usar `transformers` si se convierten los pesos a formato PyTorch, aunque no es el flujo recomendado.
- Latencia y throughput: no se dispone de mediciones específicas. Para un modelo de 3B cuantizado a 4-bit en un M2 Pro, se espera una generación de entre 20 y 40 tokens por segundo, pero estos valores son estimaciones orientativas y no han sido verificados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Capacidades destacadas |
|---|---|---|---|---|---|
| Granite 4.2 3B (este, cuantizado MLX) | 3B (588M segun safetensors) | no disponible (base: 128K) | Apache 2.0 | MLX safetensors | Razonamiento CoT, tool calling, 12 idiomas |
| Llama 3.2 3B | 3B | 128K | Llama 3.2 Community License | PyTorch, GGUF | Multilingue, tool calling, razonamiento básico |
| Qwen2.5 3B | 3B | 32K | Apache 2.0 | PyTorch, GGUF | Multilingue, tool calling, matemáticas |
| Phi-3.5-mini | 3.8B | 128K | MIT | PyTorch, GGUF | Razonamiento, multilingue, código |

La comparativa se basa en características generales conocidas de cada modelo, no en benchmarks específicos. Granite 4.2 destaca por su enfoque en razonamiento con chain-of-thought y tool calling aumentado, mientras que Llama 3.2 y Qwen2.5 ofrecen ecosistemas más amplios de herramientas y comunidades. La principal ventaja de esta conversión es su formato MLX, que permite ejecutarlo de forma nativa en Apple Silicon sin conversiones adicionales.

## Limitaciones y advertencias

- El modelo es un artefacto de terceros no afiliado a IBM. Las métricas publicadas por IBM corresponden al modelo original y no a esta versión cuantizada, por lo que el rendimiento real puede diferir.
- La cuantización de 4 bits puede introducir una degradación leve en tareas de razonamiento complejo o generación de código de alta precisión, aunque el método GPTQ con grupo 64 suele minimizar este efecto.
- No se dispone de información sobre sesgos específicos del modelo. Como todo LLM, puede reflejar sesgos presentes en sus datos de entrenamiento, que no han sido documentados públicamente.
- El riesgo de alucinación existe, especialmente en tareas de razonamiento factual o cuando se le pide información muy específica. Se recomienda validar las respuestas críticas.
- La longitud de contexto no está confirmada en esta conversión. Aunque el modelo base soporta 128K, la cuantización podría afectar al rendimiento en contextos muy largos. Se recomienda probar con la aplicación real.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero el nombre "Granite" es una marca registrada de IBM, por lo que debe usarse de forma descriptiva y no como respaldo oficial.
- El formato MLX solo es compatible con Apple Silicon. Para otros entornos, será necesario convertir los pesos a otro formato (por ejemplo, GGUF mediante `llama.cpp`), lo que puede requerir pasos adicionales.

## Enlaces

- Repositorio del modelo: [salohcin714/granite-4.2-3b-4bit-gptq-mlx](https://huggingface.co/salohcin714/granite-4.2-3b-4bit-gptq-mlx)
- Modelo base: [ibm-granite/granite-4.2-3b](https://huggingface.co/ibm-granite/granite-4.2-3b)
- Documentación oficial de IBM Granite 4.2: [https://www.ibm.com/granite/docs/models/granite4-2](https://www.ibm.com/granite/docs/models/granite4-2)
- Repositorio GitHub de los modelos Granite 4.2: [https://github.com/ibm-granite/granite-4.2-language-models](https://github.com/ibm-granite/granite-4.2-language-models)
- Biblioteca MLX-LM: [https://github.com/ml-explore/mlx-lm](https://github.com/ml-explore/mlx-lm)
