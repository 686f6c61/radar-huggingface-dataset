# parthoiiserkol/mixsub-fire-research-summariser

## Resumen

El modelo `parthoiiserkol/mixsub-fire-research-summariser` es un adaptador LoRA (Low-Rank Adaptation) entrenado mediante fine-tuning supervisado (SFT) sobre el modelo base `Qwen/Qwen2.5-7B-Instruct`. Su propósito es generar resúmenes y destacados de investigación (research highlights) a partir de artículos académicos, tarea que se alinea con el track SciHigh de la conferencia FIRE 2025, cuyo objetivo es producir resúmenes concisos y relevantes de papers científicos utilizando el dataset MixSub. El adaptador está publicado en formato PEFT y ocupa aproximadamente 0,1 GB, lo que indica un número reducido de parámetros entrenados. Aunque la model card no proporciona detalles sobre el proceso de entrenamiento ni sobre los datos utilizados, el nombre y las etiquetas sugieren que fue entrenado específicamente para la generación de resúmenes de investigación. Actualmente no se dispone de información sobre licencia, idiomas soportados ni resultados de evaluación, y el modelo no ha recibido descargas ni valoraciones en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-7B-Instruct (transformer decoder-only) |
| Parametros totales | No disponible (adaptador LoRA, tamaño del repo 0,1 GB) |
| Parametros activos | No disponible (adaptador LoRA, parámetros entrenados no especificados) |
| Longitud de contexto | 32 768 tokens (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base puede cuantizarse con GPTQ, AWQ, GGUF, etc.) |
| Idiomas soportados | No disponible (el modelo base Qwen2.5-7B-Instruct soporta múltiples idiomas, pero no se especifica para el adaptador) |
| Licencia | No disponible (la model card no indica licencia) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen2.5-7B-Instruct, un modelo transformer decoder-only con atención causal y 7 000 millones de parámetros, que incorpora mecanismos de atención con ventana deslizante (sliding window) y soporte para 32 768 tokens de contexto. El adaptador LoRA introduce matrices de bajo rango en las capas de atención y feed-forward, lo que permite un fine-tuning eficiente en términos de memoria y cómputo. El entrenamiento se realizó mediante SFT (supervised fine-tuning) con la librería TRL (Transformers Reinforcement Learning) y PEFT 0.20.0, como indican las etiquetas. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni si se aplicaron técnicas adicionales como RLHF o DPO. El nombre del modelo sugiere que se utilizó el dataset MixSub, empleado en el track SciHigh de FIRE 2025, que consiste en pares de artículos científicos y sus correspondientes destacados de investigación, aunque esta afirmación no está confirmada en la documentación disponible.

## Capacidades

- Generación de resúmenes de artículos de investigación: el modelo está diseñado para producir destacados concisos y relevantes de papers académicos, extrayendo las contribuciones clave, métodos y resultados.
- Generación de texto en formato conversacional: al estar basado en Qwen2.5-7B-Instruct, hereda la capacidad de mantener diálogos multi-turno y seguir instrucciones.
- Razonamiento y comprensión de textos largos: gracias a la ventana de contexto de 32 768 tokens, puede procesar papers completos o secciones extensas.
- Capacidades multilingües: aunque no se especifican para el adaptador, el modelo base Qwen2.5-7B-Instruct soporta más de 29 idiomas, incluyendo español, inglés, chino, francés, alemán, etc.
- Soporte de tool calling y function calling: heredado del modelo base, que permite integrar llamadas a herramientas externas.
- No se ha confirmado soporte para visión, audio u otras modalidades.

## Casos de uso

- Resumen automático de papers para revisión bibliográfica: un investigador puede pasar el texto completo de un artículo y obtener un destacado estructurado con las contribuciones principales, ahorrando tiempo en la lectura de múltiples documentos.
- Generación de abstracts ejecutivos para informes técnicos: empresas de consultoría o departamentos de I+D pueden usar el modelo para condensar documentos técnicos largos en resúmenes ejecutivos de una página.
- Creación de boletines de investigación: equipos de inteligencia competitiva pueden automatizar la generación de resúmenes de publicaciones relevantes para su sector, integrando el modelo en un pipeline de procesamiento de documentos.
- Asistente de lectura para estudiantes de posgrado: el modelo puede ayudar a estudiantes a identificar los puntos clave de un paper antes de una lectura profunda, mejorando la eficiencia en el estudio.
- Indexación y búsqueda semántica: los resúmenes generados pueden utilizarse como metadatos para mejorar la recuperación de información en repositorios académicos, permitiendo búsquedas por contenido resumido.
- Integración en flujos de trabajo de revisión por pares: los editores de revistas pueden usar el modelo para generar un primer borrador de la contribución del artículo, facilitando la asignación de revisores.
- Generación de resúmenes de patentes o documentos legales técnicos: aunque no está específicamente entrenado para ello, su capacidad de comprensión de textos largos y su base instructiva permiten adaptarlo a dominios cercanos con un fine-tuning adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como MMLU, HumanEval, GSM8K o métricas específicas de resumen (ROUGE, BERTScore) para este adaptador.

## Requisitos de hardware

- Inferencia del adaptador LoRA sobre el modelo base Qwen2.5-7B-Instruct: se requiere cargar el modelo base completo, por lo que la VRAM necesaria depende de la cuantización del modelo base.
- Con cuantización de 4 bits (por ejemplo, GPTQ o AWQ), el modelo base ocupa aproximadamente 4-5 GB de VRAM, por lo que puede ejecutarse en GPUs de consumo como RTX 3060 (12 GB), RTX 4070 (12 GB) o RTX 4090 (24 GB).
- Con cuantización de 8 bits, se necesitan alrededor de 8-9 GB de VRAM, siendo adecuado para RTX 3080/4080 o superiores.
- En precisión completa (FP16), el modelo base requiere aproximadamente 14 GB de VRAM, recomendándose GPUs como A100 (40 GB) o H100 (80 GB) para entornos de producción.
- El adaptador LoRA añade una sobrecarga mínima de memoria (menos de 1 GB), ya que solo se cargan las matrices de bajo rango.
- Opciones de despliegue: vLLM, llama.cpp (con conversión a GGUF), Ollama, Text Generation Inference (TGI) o Transformers con PEFT.
- Latencia y throughput: no disponibles. Se estima que en una GPU A100, el modelo base en FP16 puede generar alrededor de 20-30 tokens por segundo, pero no hay datos específicos para este adaptador.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicamente entrenados para la misma tarea (resúmenes de investigación con el dataset MixSub). Como referencia, el modelo base Qwen2.5-7B-Instruct puede compararse con otros modelos de 7B como Llama 3.1 8B o Mistral 7B, pero no se han publicado métricas comparativas para el adaptador. La comparativa queda pendiente de datos oficiales.

## Limitaciones y advertencias

- La model card está incompleta: no se especifican los datos de entrenamiento, el proceso de fine-tuning, los hiperparámetros ni el rendimiento evaluado.
- El modelo no ha recibido descargas ni validación por parte de la comunidad, por lo que su fiabilidad no está contrastada.
- No se dispone de información sobre sesgos o riesgos de alucinación. Al estar basado en Qwen2.5-7B-Instruct, puede heredar sesgos presentes en el modelo base, especialmente en dominios científicos con terminología especializada.
- La licencia no está indicada en la model card. El modelo base Qwen2.5-7B-Instruct se distribuye bajo licencia Apache 2.0, pero la licencia del adaptador debe verificarse con el autor antes de un uso comercial.
- No se han publicado resultados de ROUGE u otras métricas de resumen, por lo que la calidad de los resúmenes generados no está cuantificada.
- La ventana de contexto de 32 768 tokens puede ser insuficiente para papers muy extensos con apéndices o referencias extensas, requiriendo truncamiento o chunking.
- El adaptador solo está disponible en formato PEFT/safetensors, por lo que para usarlo con herramientas como llama.cpp u Ollama es necesario fusionarlo con el modelo base y convertir los pesos.

## Enlaces

- HuggingFace: https://huggingface.co/parthoiiserkol/mixsub-fire-research-summariser
- Paper de referencia del track SciHigh (FIRE 2025): https://arxiv.org/html/2601.11582v1
- PDF del paper: https://arxiv.org/pdf/2601.11582
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
