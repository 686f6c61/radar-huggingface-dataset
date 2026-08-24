# OnePunchMonk101010/kora-gpt2-sst2-peft_ia3_seed0

## Resumen

El modelo `kora-gpt2-sst2-peft_ia3_seed0` es un adaptador de tipo IA3 (Infused Adapter by Inhibiting and Amplifying Inner Activations) desarrollado mediante la librería PEFT, aplicado sobre el modelo base GPT-2 y afinado específicamente en el dataset SST-2 (Stanford Sentiment Treebank). Lo publica el usuario OnePunchMonk101010 como parte del proyecto [KoRA](https://github.com/OnePunchMonk/KoRA), cuyo objetivo es estudiar la transferencia de adaptadores de parámetros eficientes entre tareas de clasificación de sentimiento. El modelo está diseñado como línea base para evaluar la capacidad de transferencia few-shot desde SST-2 hacia el dataset Rotten Tomatoes.

Se trata de un modelo de investigación, no de un modelo de propósito general. La arquitectura subyacente es GPT-2 (124M parámetros) y el adaptador IA3 añade únicamente 56 834 parámetros entrenables, lo que representa el 0,0457 % del total. El contexto máximo del modelo base es de 1024 tokens, aunque no se especifica si el adaptador mantiene esa longitud. El modelo se distribuye en formato safetensors y su licencia no está indicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder) con adaptador IA3 |
| Parámetros totales | 124 496 642 |
| Parámetros activos | 56 834 (entrenables, no MoE) |
| Longitud de contexto | 1024 tokens (GPT-2 base, no confirmado en el adaptador) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (implícito por GPT-2 y datasets) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se compone de un GPT-2 preentrenado de 124M parámetros sobre el que se aplica un adaptador IA3 mediante la librería PEFT. El adaptador IA3 introduce matrices de activación reducidas en las capas de atención y feed-forward, de forma que solo se entrenan los pesos de esas matrices, dejando el resto de los parámetros congelados. El entrenamiento se realizó sobre el dataset SST-2, con una precisión de validación de 0,8911. Posteriormente se evaluó la transferencia a Rotten Tomatoes en un escenario few-shot, obteniendo una precisión de 0,8293.

No se han publicado detalles sobre el número de épocas, el optimizador, la tasa de aprendizaje ni la composición exacta del dataset de entrenamiento. Tampoco se indica si se aplicó alguna técnica de RLHF o DPO, lo cual es poco probable dado el ámbito de clasificación de texto.

## Capacidades

- Clasificación de texto binaria (positivo/negativo) en el dominio de reseñas de películas, basado en el entrenamiento sobre SST-2.
- Transferencia few-shot a otros datasets de sentimiento, como Rotten Tomatoes, con una precisión reportada de 0,8293.
- No soporta generación de texto libre ni razonamiento complejo, ya que el adaptador está diseñado para la tarea de clasificación.
- No dispone de tool calling, ni capacidades de agente, ni visión, ni audio.
- El idioma principal es el inglés, dado el modelo base y los datasets utilizados.

## Casos de uso

- **Investigación en transferencia de adaptadores**: el modelo sirve como línea base para comparar el comportamiento de IA3 frente a otras técnicas PEFT (LoRA, AdaLoRA, etc.) en escenarios de transferencia entre dominios de sentimiento.
- **Estudio de eficiencia paramétrica**: con solo 56 834 parámetros entrenables, es un ejemplo de cómo adaptar un modelo grande para una tarea específica con un coste de entrenamiento mínimo, útil para investigaciones sobre eficiencia en fine-tuning.
- **Evaluación de robustez de clasificadores**: se puede usar para probar la capacidad de generalización de un modelo afinado en SST-2 cuando se aplica a otros conjuntos de datos de sentimiento, como Rotten Tomatoes.
- **Prototipado rápido de sistemas de análisis de opinión**: dado su pequeño tamaño, es adecuado para experimentar con pipelines de clasificación en entornos con recursos limitados, aunque no se recomienda para producción.
- **Comparación de métricas de transferencia**: sirve para medir la degradación de rendimiento cuando se pasa de un dominio a otro, útil para investigaciones sobre adaptación de dominio.
- **Documentación de experimentos en el proyecto KoRA**: se utiliza como referencia en el repositorio del proyecto para reproducir resultados y comparar con variantes del mismo método.

## Benchmarks y rendimiento

Según la información disponible, el modelo reporta los siguientes resultados:

| Dataset | Métrica | Valor |
|---|---|---|
| SST-2 (validación) | Precisión | 0,8911 |
| Rotten Tomatoes (few-shot transfer) | Precisión | 0,8293 |

No se han publicado comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- Al ser un adaptador sobre GPT-2 (124M parámetros), el modelo completo es ligero. En formato de precisión completa, el checkpoint de GPT-2 ocupa aproximadamente 500 MB, pero el adaptador IA3 solo añade unas decenas de kilobytes.
- Se puede ejecutar en una GPU de consumo como una GTX 1060 (6 GB) o incluso en CPU, aunque la velocidad de inferencia dependerá del uso del modelo base.
- Para integración con librerías de inferencia, se recomienda usar vLLM, Hugging Face Transformers o llama.cpp (si se convierte a GGUF). No se especifican opciones oficiales.
- La latencia y el throughput no se han documentado, pero al tratarse de GPT-2 pequeño, se espera una inferencia rápida en GPU (del orden de milisegundos por lote).

## Comparativa con modelos similares

No se dispone de información sobre comparativas con otros adaptadores o modelos de clasificación de sentimiento en el contexto del proyecto. La model card no incluye referencias a modelos alternativos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Es un modelo de investigación, no diseñado para producción. No se ha evaluado su comportamiento en escenarios reales más allá de los datasets mencionados.
- La transferencia a Rotten Tomatoes se realizó en un escenario few-shot, por lo que el rendimiento en otros dominios o con más datos podría variar.
- No se especifica la licencia, lo que impide conocer si su uso comercial está permitido. Se recomienda contactar con el autor antes de utilizarlo en proyectos comerciales.
- El modelo base GPT-2 puede presentar sesgos presentes en su entrenamiento, como sesgos de género o estereotipos, que podrían heredarse en la clasificación de sentimiento.
- El adaptador está pensado solo para clasificación binaria; no es adecuado para tareas generativas o de razonamiento.
- No se han documentado medidas de mitigación de alucinaciones ni de sesgos, ya que el modelo no genera texto libre.

## Enlaces

- [Hugging Face - OnePunchMonk101010/kora-gpt2-sst2-peft_ia3_seed0](https://huggingface.co/OnePunchMonk101010/kora-gpt2-sst2-peft_ia3_seed0)
- [Repositorio del proyecto KoRA](https://github.com/OnePunchMonk/KoRA) (mencionado en la model card)
- [Documentación de la librería PEFT](https://huggingface.co/docs/peft) (referencia general para adaptadores IA3)
