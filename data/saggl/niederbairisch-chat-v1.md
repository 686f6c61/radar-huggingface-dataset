# saggl/niederbairisch-chat-v1

## Resumen

Niederbairisch chat v1 es un adaptador LoRA para el modelo Qwen2.5-0.5B-Instruct, publicado por el usuario saggl en Hugging Face. Su objetivo es especializar un modelo conversacional pequeño en el dialecto bávaro inferior (niederbairisch), una variedad del bavarés hablada en zonas de Baviera y Austria. El adaptador se entrena sobre el dataset Niederbairisch v0.9.3, también del mismo autor, con licencia CC BY 4.0, y cubre tareas de traducción, comprensión y generación de diálogo.

El modelo base, Qwen2.5-0.5B-Instruct, es un transformer decoder-only de 0,5 mil millones de parámetros desarrollado por Alibaba Qwen, con una ventana de contexto de 32 768 tokens y capacidades de instrucción y tool calling. El adaptador no modifica la arquitectura ni el tokenizador; se carga mediante PEFT sobre el modelo base y hereda su licencia Apache 2.0.

La relevancia de esta ficha es acotada: se trata de un modelo experimental de estilo, entrenado sobre un corpus pequeño y sin validación independiente de la precisión dialectal, según reconoce el propio autor. Resulta útil como ejemplo de adaptación dialectal de bajo coste y como base para experimentación, pero no está pensado para producción sin una evaluación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA |
| Parametros totales | 0,5 mil millones (modelo base Qwen2.5-0.5B-Instruct); parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32 768 tokens (heredada del modelo base Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el base admite cuantizaciones habituales de la familia Qwen2.5) |
| Idiomas soportados | aleman (de) y bavaro (bar) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only con atención causal estándar. El adaptador no altera la arquitectura del base: se inyectan matrices de bajo rango en las capas del transformer y se cargan con `peft.PeftModel.from_pretrained(base_model, "saggl/niederbairisch-chat-v1")`. El tokenizador y el vocabulario son los del modelo base.

El entrenamiento utiliza únicamente el split de entrenamiento del dataset Niederbairisch v0.9.3, con tareas de traducción, comprensión y generación de diálogo; el split de validación se emplea solo para monitorización. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, el rango del LoRA, la tasa de aprendizaje ni si hubo etapas de RLHF o DPO. El autor describe el resultado como un modelo experimental de estilo entrenado sobre un corpus pequeño, sin validación independiente de la precisión dialectal.

## Capacidades

- Generación de texto conversacional en alemán estándar y en bávaro inferior (bar).
- Traducción entre alemán estándar y bávaro inferior, según las tareas del dataset de entrenamiento.
- Comprensión de texto en bávaro inferior (tarea de comprensión incluida en el entrenamiento).
- Generación de diálogo multi-turno, heredada de la naturaleza instruct del modelo base.
- Tool calling y function calling: disponibles por herencia de Qwen2.5-0.5B-Instruct, aunque no se ha validado su comportamiento tras el ajuste LoRA.
- Razonamiento multi-paso y uso como agente: capacidad del base, no evaluada en el adaptador.
- Capacidades multilingües: limitadas a los idiomas declarados (de, bar); el base soporta más idiomas, pero el adaptador no los refuerza.
- No se declaran capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Experimentación lingüística con dialectos: el adaptador permite generar respuestas en bávaro inferior para estudiar variación dialectal, comparar con el alemán estándar y analizar fenómenos morfosintácticos del bavarés con un coste computacional mínimo.
- Prototipos de asistentes conversacionales regionales: se puede integrar en un chatbot de demostración para hablantes de bávaro inferior, aprovechando el contexto de 32 768 tokens del base para conversaciones multi-turno, siempre con revisión humana previa.
- Traducción asistida alemán estándar–bávaro: útil como borrador en tareas de localización de contenidos para audiencias regionales, con posterior corrección por un hablante nativo.
- Generación de diálogo sintético para aumento de datos: el modelo puede producir ejemplos de conversación dialectal que alimenten otros pipelines de entrenamiento o evaluación, dado su bajo coste de inferencia.
- Investigación sobre adaptación de bajo rango: sirve como caso de estudio reproducible de fine-tuning LoRA sobre un modelo de 0,5B con un corpus pequeño, útil para comparar hiperparámetros y estrategias de PEFT.
- Educación y divulgación: demostraciones en charlas o talleres sobre dialectología computacional y sobre cómo adaptar modelos pequeños a variedades lingüísticas minorizadas.
- Despliegue en entornos con recursos limitados: al partir de un modelo de 0,5B, puede ejecutarse en CPU o en GPU de gama baja para pruebas internas y demos interactivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,5B ocupa aproximadamente 1 GB en fp16 y alrededor de 0,4-0,6 GB en cuantizaciones de 4 bits, a lo que se suma el pequeño tamaño del adaptador LoRA (no cuantificado en la información disponible).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior permite inferencia holgada. En entornos de servidor, una T4 o L4 bastan para múltiples instancias.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con 4 GB o más de VRAM, e incluso en CPU para uso no interactivo.
- Opciones de despliegue: carga mediante `peft` y `transformers`; el modelo fusionado puede servirse con vLLM, TGI o llama.cpp tras conversión a GGUF, y con Ollama si se genera el artefacto correspondiente. Para el adaptador en crudo, la ruta más directa es `transformers` + `peft`.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del base, se espera una latencia baja en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma/dialecto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| saggl/niederbairisch-chat-v1 | 0,5B (base) + LoRA | 32 768 | de, bar | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-0.5B-Instruct | 0,5B | 32 768 | multilingüe (incluye de) | Apache 2.0 | Hugging Face |
| Adaptadores dialectales comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más relevante es con su modelo base: el adaptador añade especialización en bávaro inferior a costa de un corpus pequeño y sin validación independiente, mientras que el base ofrece un comportamiento multilingüe más general y probado. No se dispone de información sobre otros adaptadores dialectales del bavarés con los que comparar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Modelo experimental de estilo: el autor indica explícitamente que la precisión dialectal no ha sido validada de forma independiente.
- Corpus de entrenamiento pequeño: el rendimiento en bávaro inferior puede degradarse fuera de los dominios cubiertos por el dataset (traducción, comprensión y diálogo).
- Riesgo de alucinación: inherente a un modelo de 0,5B, agravado por el ajuste sobre un corpus reducido; no debe usarse como fuente de verdad lingüística sin revisión.
- Sesgos: no se documentan sesgos específicos, pero el dataset y el modelo base pueden arrastrar sesgos de género, registro y variación regional dentro del propio bavarés.
- Limitaciones de idioma: el adaptador está pensado para de y bar; su comportamiento en otros idiomas no está evaluado y puede degradarse respecto al base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al derivar de Qwen2.5-0.5B-Instruct conviene revisar también las condiciones del modelo base y la atribución del dataset (CC BY 4.0).
- Caveat para producción: no se recomienda su despliegue en producción sin una evaluación lingüística con hablantes nativos y sin pruebas de robustez frente a entradas fuera de distribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saggl/niederbairisch-chat-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/saggl/niederbairisch-dataset
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Repositorio PEFT: https://github.com/huggingface/peft
- Repositorio Transformers: https://github.com/huggingface/transformers
