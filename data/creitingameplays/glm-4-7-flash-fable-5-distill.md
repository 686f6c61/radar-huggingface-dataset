# CreitinGameplays/GLM-4.7-Flash-Fable-5-Distill

## Resumen

GLM-4.7-Flash-Fable-5-Distill es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por CreitinGameplays como un fine-tune del modelo base unsloth/GLM-4.7-Flash, que a su vez es la versión local y open source del GLM-4.7 de Z.ai. El modelo está entrenado sobre el dataset Glint-Research/Fable-5-traces, un conjunto de trazas de razonamiento, con el objetivo de mejorar las capacidades de razonamiento multi-paso y la calidad de las respuestas conversacionales. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas.

La arquitectura es un MoE con aproximadamente 31.200 millones de parámetros totales, de los cuales solo unos 3.600 millones se activan por token, lo que lo hace sorprendentemente eficiente para su tamaño. Soporta una ventana de contexto de 200.000 tokens, lo que le permite manejar documentos largos y conversaciones extensas. Su relevancia actual radica en que combina un rendimiento competitivo en tareas de razonamiento, programación y agentes con un despliegue local viable en hardware de consumo, gracias a su diseño MoE y a las optimizaciones de Unsloth para entrenamiento e inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con arquitectura glm4_moe_lite |
| Parametros totales | 31.221.488.576 (31,2 B) |
| Parametros activos | ~3,6 B (estimado del modelo base GLM-4.7-Flash) |
| Longitud de contexto | 200.000 tokens (del modelo base) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; el repo contiene pesos en safetensors |
| Idiomas soportados | Ingles (segun la model card; el modelo base GLM-4.7-Flash soporta multiples idiomas, pero este fine-tune declara solo "en") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repo: 62,5 GB) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GLM-4.7-Flash de Z.ai, un transformer decoder-only con mezcla de expertos (MoE). En concreto, la etiqueta `glm4_moe_lite` indica una variante ligera del MoE de GLM-4.7, donde de los 31,2 B parámetros totales solo se activan aproximadamente 3,6 B por token, lo que reduce drásticamente el coste computacional en inferencia. El modelo base fue entrenado por Z.ai con un enfoque en programación, razonamiento multi-paso y tareas de agente, y soporta una ventana de contexto de 200.000 tokens.

El fine-tune fue realizado por CreitinGameplays utilizando Unsloth (que acelera el entrenamiento) y la librería TRL de Hugging Face, sobre el dataset Glint-Research/Fable-5-traces. Este dataset contiene trazas de razonamiento (traces) que probablemente se usaron para entrenar al modelo en cadenas de pensamiento más detalladas y robustas. No se especifica si se empleó RLHF, DPO u otra técnica de alineación posterior al fine-tune supervisado. El proceso de entrenamiento se describe como "2x faster" gracias a Unsloth, pero no se detallan hiperparámetros ni número de pasos.

## Capacidades

- Generación de texto y conversación: modelo de lenguaje generalista capaz de mantener diálogos multi-turno coherentes.
- Razonamiento multi-paso: gracias al fine-tune sobre trazas de razonamiento, mejora la capacidad de descomponer problemas complejos en pasos intermedios.
- Programación: el modelo base GLM-4.7-Flash destaca en tareas de coding, y este fine-tune hereda esa capacidad.
- Soporte de agentes y tool calling: el modelo base está diseñado para flujos de trabajo agénticos, con ejecución de herramientas y planificación.
- Contexto largo: ventana de 200.000 tokens, adecuada para documentos extensos, análisis de código o conversaciones largas.
- Multilingüismo: aunque la model card declara solo inglés, el modelo base soporta varios idiomas; el fine-tune puede degradar el rendimiento en otros idiomas.

## Casos de uso

- Asistente de programación en local: un desarrollador puede desplegar el modelo en su estación de trabajo con una GPU de gama media y usarlo para generación de código, explicación de fragmentos o refactorización, aprovechando su contexto de 200K para analizar repositorios completos.
- Agente autónomo de automatización de tareas: gracias a su soporte de tool calling y razonamiento multi-paso, puede integrarse en pipelines que requieran planificar y ejecutar acciones (por ejemplo, gestión de tickets, scraping web o automatización de pruebas).
- Análisis de documentos legales o técnicos: la ventana de 200K permite procesar contratos, informes o papers completos en una sola pasada, extrayendo resúmenes o respondiendo preguntas específicas.
- Chatbot de atención al cliente con contexto largo: puede mantener conversaciones extensas recordando todo el historial, útil para soporte técnico donde el usuario arrastra un problema durante varias interacciones.
- Generación de documentación técnica: a partir de código fuente o especificaciones, el modelo puede redactar guías, comentarios y manuales con un nivel de detalle razonable.
- Investigación en razonamiento: al ser un fine-tune sobre trazas de razonamiento, sirve como base para experimentos académicos sobre cadenas de pensamiento y mejora de la capacidad de inferencia lógica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este fine-tune en la información disponible. El modelo base GLM-4.7-Flash, según la documentación de Unsloth, lidera benchmarks como SWE-Bench, GPQA y tareas de razonamiento/chat en su categoría de modelos locales, pero no se dispone de cifras concretas para esta variante. Se recomienda consultar la página del modelo base para obtener datos comparativos.

## Requisitos de hardware

- VRAM estimada: con 31,2 B parámetros totales y ~3,6 B activos, el modelo en precisión FP16 requiere aproximadamente 62 GB de VRAM (el tamaño del repo es 62,5 GB). Con cuantización a 8 bits se reduce a ~31 GB, y a 4 bits a ~16 GB, lo que permitiría ejecutarlo en GPUs de consumo como la RTX 4090 (24 GB) o la RTX 3090 (24 GB) con cuantización 4-bit.
- GPU recomendadas: para inferencia sin cuantizar, una A100 80GB o H100; con cuantización 4-bit, una RTX 4090 o RTX 3090 son suficientes. Para entrenamiento o fine-tune adicional, se necesitaría al menos 80 GB de VRAM.
- Opciones de despliegue: al ser un modelo de la familia GLM con soporte en transformers, se puede servir con vLLM, Text Generation Inference (TGI), llama.cpp (si se convierte a GGUF) u Ollama. Unsloth ofrece guías específicas para ejecutar GLM-4.7-Flash localmente.
- Latencia y throughput: no se dispone de datos medidos para este fine-tune. En el modelo base, la arquitectura MoE con pocos parámetros activos permite una inferencia relativamente rápida en hardware moderno, pero los valores exactos dependen de la GPU y la cuantización.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| GLM-4.7-Flash (base) | ~31 B | ~3,6 B | 200K | Apache 2.0 | Razonamiento, coding, agentes |
| GLM-4.7-Flash-Fable-5-Distill (este) | 31,2 B | ~3,6 B | 200K | Apache 2.0 | Fine-tune en trazas de razonamiento |
| Qwen2.5-32B (MoE) | 32 B | ~3 B | 128K | Apache 2.0 | Generalista, multilingüe |
| DeepSeek-V3-Lite | 16 B | 2,4 B | 128K | MIT | Razonamiento, coding |

La comparativa se basa en modelos MoE de tamaño similar disponibles en el ecosistema open source. Este fine-tune se diferencia por su entrenamiento específico en trazas de razonamiento, lo que podría mejorar la coherencia lógica frente al base, aunque no hay benchmarks que lo confirmen. La licencia Apache 2.0 es permisiva para uso comercial, al igual que la de Qwen2.5-32B, mientras que DeepSeek-V3-Lite usa MIT.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un fine-tune de un modelo base entrenado principalmente en inglés, puede presentar sesgos culturales y lingüísticos propios de los datos de entrenamiento. Como todo LLM, es propenso a alucinar hechos o generar información plausible pero incorrecta.
- Idioma: la model card declara solo inglés. Aunque el modelo base es multilingüe, el fine-tune puede haber degradado el rendimiento en otros idiomas, por lo que no se recomienda su uso en producción para español u otros idiomas sin evaluación previa.
- Contexto largo: aunque soporta 200K tokens, el rendimiento en contextos muy largos puede degradarse en la práctica, especialmente en tareas de recuperación de información precisa al inicio del contexto.
- Sin benchmarks publicados: no hay datos de rendimiento específicos para este fine-tune, por lo que su calidad real frente al modelo base o alternativas es incierta.
- Requisitos de hardware: aunque los parámetros activos son pocos, el modelo completo ocupa 62,5 GB en FP16, lo que puede ser un obstáculo para despliegues en hardware limitado sin cuantización.
- Mantenimiento y soporte: al ser un modelo de un autor individual (CreitinGameplays), no hay garantía de actualizaciones, correcciones o soporte a largo plazo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CreitinGameplays/GLM-4.7-Flash-Fable-5-Distill
- Modelo base unsloth/GLM-4.7-Flash: https://huggingface.co/unsloth/GLM-4.7-Flash
- Modelo oficial de Z.ai: https://huggingface.co/zai-org/GLM-4.7-Flash
- Guía de Unsloth para GLM-4.7-Flash: https://unsloth.ai/docs/models/tutorials/glm-4.7-flash
- Documentación de Z.ai sobre GLM-4.7: https://docs.z.ai/guides/llm/glm-4.7
- Dataset de entrenamiento: https://huggingface.co/datasets/Glint-Research/Fable-5-traces
