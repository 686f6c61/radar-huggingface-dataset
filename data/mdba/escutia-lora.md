# mdba/escutia-lora

## Resumen

EscutIA LoRA es un modelo de lenguaje fine-tuneado mediante la técnica LoRA (Low-Rank Adaptation) sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct, desarrollado por el usuario mdba. Su propósito principal es la clasificación de sentimientos en portugués, aunque al estar basado en un modelo instructivo también conserva capacidades de generación de texto y conversación. El modelo se distribuye con los pesos ya fusionados, de modo que puede cargarse directamente con la librería `transformers` sin necesidad de gestionar adaptadores PEFT por separado.

Con aproximadamente 494 millones de parámetros, se trata de un modelo compacto y ligero, adecuado para entornos con recursos limitados o para tareas de análisis de sentimiento en tiempo real. Su relevancia radica en ofrecer una alternativa accesible y en portugués para una tarea de procesamiento del lenguaje natural muy demandada en aplicaciones comerciales y de investigación. La ventana de contexto no se especifica en la información disponible, aunque el modelo base Qwen2.5-0.5B-Instruct soporta hasta 32 768 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 494 032 768 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base soporta 32 768 tokens) |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | Portugués (pt) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye a partir de Qwen2.5-0.5B-Instruct, un transformer decoder-only con atención causal y mecanismos de normalización y activación propios de la familia Qwen2.5. El entrenamiento se realizó mediante LoRA, una técnica de adaptación de bajo rango que congela los pesos originales e introduce matrices de baja dimensión en las capas de atención y feed-forward. Esto reduce drásticamente el número de parámetros entrenables y el coste computacional. Los pesos del adaptador LoRA se han fusionado con el modelo base, de modo que el repositorio contiene el modelo completo listo para inferencia.

No se proporcionan detalles sobre el conjunto de datos de entrenamiento, el número de tokens procesados ni la metodología de alineación (por ejemplo, si se usó RLHF o DPO). La model card solo indica que se trata de un fine-tune para clasificación de sentimientos en portugués, sin más especificaciones sobre el proceso.

## Capacidades

- Clasificación de sentimientos en textos en portugués (positivo, negativo, neutro, según el etiquetado usado en el entrenamiento).
- Generación de texto y respuesta a instrucciones, heredadas del modelo base instructivo.
- Conversación multi-turno básica, aunque no se ha optimizado específicamente para ello.
- No se documenta soporte para tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades multimodales (visión, audio, etc.).
- El modelo está limitado al idioma portugués; su rendimiento en otros idiomas no está garantizado.

## Casos de uso

- Análisis de opiniones en redes sociales: el modelo puede clasificar comentarios de Twitter, Facebook o Instagram en portugués para medir la percepción pública de una marca o producto. Su tamaño reducido permite procesar grandes volúmenes de texto con baja latencia.
- Atención al cliente automatizada: integrado en un sistema de tickets, puede etiquetar automáticamente las quejas o felicitaciones de los usuarios, priorizando las interacciones negativas para una respuesta rápida.
- Monitoreo de reseñas de productos: en plataformas de comercio electrónico brasileñas o portuguesas, el modelo puede extraer el sentimiento de las reseñas y alimentar paneles de control de calidad.
- Análisis de encuestas de satisfacción: respuestas abiertas en portugués pueden clasificarse para identificar tendencias de satisfacción o insatisfacción en servicios públicos o privados.
- Moderación de contenido: detección de mensajes con tono negativo u ofensivo en foros o comunidades en línea, ayudando a los moderadores a priorizar la revisión.
- Investigación académica en PLN: como modelo ligero y de código abierto, sirve como punto de partida para experimentos de análisis de sentimiento en portugués, permitiendo comparaciones con modelos más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval, GSM8K ni de evaluaciones específicas de análisis de sentimiento (por ejemplo, precisión o F1 sobre conjuntos de datos como GoEmotions o SentiLex). Tampoco se ofrecen comparaciones con otros modelos de clasificación de sentimiento en portugués.

## Requisitos de hardware

- Al tratarse de un modelo de 0.5B parámetros, la inferencia es viable en CPU con 8 GB de RAM, aunque con mayor latencia.
- En GPU, cabe en tarjetas con 4 GB de VRAM o más, como una NVIDIA GTX 1650, RTX 3050 o superiores. Una RTX 4090 o A100 permitirían procesamiento por lotes y baja latencia.
- El modelo puede desplegarse con `transformers` directamente, o mediante servidores de inferencia como vLLM, Text Generation Inference (TGI) o llama.cpp (si se convierte a GGUF).
- También es compatible con Ollama si se empaqueta adecuadamente.
- El throughput estimado no está documentado, pero para un modelo de este tamaño se esperan decenas de generaciones por segundo en una GPU moderna.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa con otros modelos de análisis de sentimiento en portugués. Como referencia, el modelo base Qwen2.5-0.5B-Instruct tiene 0.5B parámetros y una ventana de contexto de 32K, pero no está especializado en sentimiento. Alternativas como BERTimbau (basado en BERT) o modelos como `neuralmind/bert-base-portuguese-cased` ofrecen clasificación de sentimiento, pero con arquitecturas encoder-only y sin generación de texto. No se dispone de datos de rendimiento comparativo entre estos y EscutIA LoRA.

## Limitaciones y advertencias

- El modelo se ha entrenado únicamente para portugués; su uso en otros idiomas producirá resultados poco fiables.
- No se especifica la licencia, lo que genera incertidumbre sobre su uso comercial. Se recomienda contactar con el autor antes de utilizarlo en producción.
- Al ser un fine-tune de un modelo pequeño, puede presentar alucinaciones y errores en tareas complejas de razonamiento.
- La clasificación de sentimientos puede estar sesgada por el dominio de los datos de entrenamiento (no especificados), lo que podría afectar a textos de temáticas no representadas.
- No se documentan medidas de mitigación de sesgos ni evaluación de robustez ante entradas adversariales.
- La ventana de contexto efectiva no está confirmada; aunque el modelo base soporta 32K, el fine-tune podría haber reducido la longitud útil.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/mdba/escutia-lora)
- [Modelo base Qwen2.5-0.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct)
