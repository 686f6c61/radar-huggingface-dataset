# s2naito/qwen3.5-0.8b-rag-sft-v2

## Resumen

s2naito/qwen3.5-0.8b-rag-sft-v2 es un ajuste fino (SFT) del modelo base Qwen/Qwen3.5-0.8B de Alibaba Qwen, publicado por el usuario independiente s2naito. El modelo está especializado en respuesta corta a preguntas (short-answer QA) sobre recuperación aumentada de generación (RAG) con la Wikipedia en japonés. Se trata de un fine-tuning mediante LoRA con `target_modules="all-linear"` sobre la revisión `2fc06364715b967f1860aea9cf38778875588b17` del modelo base.

El modelo resuelve un nicho concreto: dado un contexto documental en japonés y una pregunta, generar una respuesta breve y precisa. Con 873 millones de parámetros (0,8B) es un modelo muy ligero, diseñado para ser desplegado con requisitos de hardware mínimos, lo que lo hace apto para entornos con GPUs de consumo o incluso CPU. Su relevancia radica en la combinación de un tamaño reducido con un entrenamiento específico en tareas de QA extractiva y multihop en japonés.

La información pública disponible es escasa: la model card es muy breve y no incluye detalles sobre hiperparámetros de entrenamiento, número de tokens, benchmarks ni composición exacta del dataset más allá de las fuentes citadas. No hay pipeline declarado, cero descargas y cero likes en el momento de la consulta, lo que indica un modelo recién publicado y sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, segun el tag `qwen3_5`) |
| Parametros totales | 873.438.784 (aproximadamente 0,87B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; se asume compatibilidad con cuantizacion estandar al derivar de Qwen3.5, pero no se documenta) |
| Idiomas soportados | japones (`ja`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen/Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen3.5. El fine-tuning se realizó con LoRA aplicado a todos los módulos lineales (`target_modules="all-linear"`), una configuración que permite adaptar todas las proyecciones de atención y FFN sin reentrenar el modelo completo. No se especifican el rango de LoRA, la tasa de aprendizaje, el número de pasos ni el número de tokens de entrenamiento.

Los datos de entrenamiento provienen de cuatro fuentes, todas con licencia CC BY-SA 4.0 y modificadas (filtradas y reformateadas) para la tarea: JEMHopQA (QA multihop en japonés), JSQuAD/JGLUE (comprensión lectora extractiva), NIILC QA (QA sobre la biblioteca nacional de Japón) y fragmentos de Wikipedia japonesa distribuidos en el dataset `bumbuboon/llm-course-final-2026`. No se documenta si hubo RLHF, DPO ni ninguna fase de alineación posterior al SFT.

## Capacidades

- Generación de respuestas cortas a preguntas en japonés a partir de un contexto documental (QA extractiva y multihop).
- Razonamiento sobre contexto recuperado en pipelines RAG con Wikipedia japonesa como fuente.
- Comprensión lectora en japonés: extracción de la respuesta correcta de un pasaje dado.
- Manejo de preguntas multihop (JEMHopQA) que requieren combinar información de varias entidades o pasajes.
- Generación de texto general en japonés heredada del modelo base Qwen3.5-0.8B.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y multi-step reasoning: no disponible (no documentado).
- Capacidades multilingües: limitadas al japonés según la model card; el modelo base podría conservar capacidades en otros idiomas, pero no se garantiza tras el fine-tuning.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- **Sistema de QA sobre Wikipedia japonesa**: el modelo recibe un fragmento recuperado y una pregunta, y devuelve una respuesta breve. Es su caso de uso principal y para el que fue entrenado explícitamente.
- **Pipelines RAG de bajo coste en producción**: con menos de 1B de parámetros, puede servirse en una sola GPU de consumo, lo que permite desplegar atención documental interna en japonés sin infraestructura dedicada.
- **Extracción de respuestas en buscadores corporativos**: dado un contexto de documento interno y una consulta, generar la respuesta extractiva, aprovechando su entrenamiento en JSQuAD y NIILC QA.
- **QA multihop sobre bases de conocimiento**: preguntas que requieren combinar información de varias entidades, gracias al entrenamiento con JEMHopQA.
- **Asistente de consulta para documentación técnica en japonés**: integrado en un chatbot que recupera pasajes de manuales y devuelve respuestas concisas.
- **Prototipado rápido de sistemas RAG**: su tamaño reducido permite iterar sobre el pipeline de recuperación sin coste elevado de inferencia.
- **Evaluación de pipelines de recuperación**: al ser un modelo de QA extractiva, sirve como componente de referencia para medir la calidad del contexto recuperado en japonés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 873M de parámetros, en FP16 requiere aproximadamente 1,8 GB de pesos; en cuantización de 8 bits, alrededor de 0,9 GB; en 4 bits, en torno a 0,5 GB. A esto hay que sumar la memoria para el contexto KV, que depende de la longitud de contexto (no documentada).
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en FP16. Una RTX 3060, RTX 4060 o superior es más que suficiente. Para mayor throughput, una A100 o H100 permitiría servir muchas peticiones concurrentes, aunque el modelo es demasiado pequeño para aprovechar su capacidad.
- **Cabe en GPU de consumo**: sí, en cualquier GPU de consumo moderna con 4 GB o más de VRAM, e incluso en CPU con llama.cpp.
- **Opciones de despliegue**: vLLM, TGI, llama.cpp, Ollama (previa conversión a GGUF), transformers con `AutoModelForCausalLM`. Al ser un modelo safetensors de la familia Qwen, es compatible con las herramientas estándar del ecosistema.
- **Latencia y throughput estimados**: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| s2naito/qwen3.5-0.8b-rag-sft-v2 | 0,87B | no disponible | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | no disponible | Apache 2.0 | Hugging Face |
| Modelos QA japoneses especializados de tamano similar | no disponible | no disponible | no disponible | no disponible |

La comparación con alternativas específicas de QA en japonés de tamaño similar no está disponible en la información proporcionada. El competidor directo más evidente es el propio modelo base Qwen3.5-0.8B, del que este fine-tuning hereda arquitectura y licencia, pero no se han publicado métricas que cuantifiquen la mejora en la tarea de QA.

## Limitaciones y advertencias

- **Sesgos conocidos**: no documentados. Al entrenarse sobre Wikipedia japonesa y datasets académicos, puede heredar los sesgos de esas fuentes.
- **Riesgo de alucinación**: presente, como en cualquier modelo generativo. Aunque está entrenado para QA extractiva, no se garantiza que las respuestas estén siempre ancladas al contexto proporcionado.
- **Limitaciones de contexto e idioma**: la model card solo declara japonés; el rendimiento en otros idiomas no está validado y puede degradarse respecto al modelo base. La longitud de contexto no está documentada.
- **Restricciones de licencia**: el modelo se distribuye bajo Apache 2.0, pero los datos de entrenamiento son CC BY-SA 4.0 (JEMHopQA, JSQuAD/JGLUE, NIILC QA y Wikipedia japonesa). El uso comercial del modelo es posible bajo Apache 2.0, pero la naturaleza share-alike de los datos de entrenamiento puede plantear dudas legales sobre la redistribución de derivados; conviene revisar las implicaciones con asesoría legal.
- **Validación comunitaria nula**: cero descargas y cero likes en el momento de la consulta; no hay evidencia externa de calidad ni evaluaciones independientes.
- **Documentación insuficiente para producción**: no se especifican hiperparámetros, número de tokens de entrenamiento, contexto máximo ni benchmarks, lo que dificulta evaluar su idoneidad frente al modelo base.
- **Caveat de producción**: al ser un fine-tuning LoRA sobre un modelo de 0,8B, su capacidad de razonamiento complejo es limitada; es adecuado para QA extractiva, no para tareas que requieran razonamiento profundo o generación larga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/s2naito/qwen3.5-0.8b-rag-sft-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- JEMHopQA: https://github.com/aiishii/JEMHopQA
- JSQuAD / JGLUE: https://github.com/yahoojapan/JGLUE
- NIILC QA: https://github.com/mynlp/niilc-qa
- Dataset de chunks de Wikipedia: https://huggingface.co/datasets/bumbuboon/llm-course-final-2026
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
