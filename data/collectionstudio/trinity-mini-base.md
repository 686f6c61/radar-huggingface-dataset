# CollectionStudio/Trinity-Mini-Base

## Resumen

Trinity-Mini-Base es un modelo de lenguaje de mezcla de expertos (MoE) de 26,1 mil millones de parámetros en total, con 3 mil millones activos por token, desarrollado por Arcee AI. Esta versión alojada en CollectionStudio es una copia del modelo base de Arcee AI, publicada originalmente como arcee-ai/Trinity-Mini-Base-Pre-Anneal. Al tratarse de un modelo base, no ha pasado por un ajuste fino posterior, por lo que no es apto para conversación directa y debe entrenarse específicamente para el dominio de uso.

El modelo forma parte de la familia Trinity de Arcee AI, dirigida a empresas y a personas interesadas en modelos de pesos abiertos. Se entrenó sobre 10 billones de tokens curados en colaboración con Datology, incorporando datos de matemáticas y código. Su arquitectura AfmoeForCausalLM combina 128 expertos, de los cuales 8 se activan por token más un experto compartido, y ofrece una ventana de contexto de 128k tokens. Soporta diez idiomas, incluidos español, inglés, francés, alemán, italiano, portugués, ruso, árabe, hindi, coreano y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | AfmoeForCausalLM (Mixture of Experts) |
| Parametros totales | 26.123.974.400 (26,1 mil millones) |
| Parametros activos | 3 mil millones |
| Longitud de contexto | 128k tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, es, fr, de, it, pt, ru, ar, hi, ko, zh |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Trinity-Mini-Base utiliza una arquitectura MoE con 128 expertos en total, de los cuales 8 se activan por token y hay 1 experto compartido. Esto permite que, pese a sus 26,1 mil millones de parámetros, solo se computen alrededor de 3 mil millones en cada paso, reduciendo el coste de inferencia frente a un modelo denso del mismo tamaño. El modelo se entrenó desde cero con 10 billones de tokens, una mezcla de datos que amplía el conjunto utilizado en AFM-4.5B con contenido adicional de matemáticas y código, curado junto a Datology.

El entrenamiento se realizó en un clúster de 512 GPUs H200 proporcionado por Prime Intellect, usando paralelismo HSDP (Hybrid Sharded Data Parallel). Al ser un modelo base pre-ajuste fino, se publica sin alineación con instrucciones. La intención de los autores es que cada usuario lo ajuste para tareas concretas, tal y como indican en la propia model card.

## Capacidades

- Generación de texto autoregresiva en modo base, es decir, continuación de texto libre.
- Soporte multilingüe para diez idiomas, con una representación amplia de lenguas indoeuropeas y asiáticas.
- Ventana de contexto larga de 128k tokens, que permite procesar documentos extensos o largas secuencias de texto.
- Arquitectura MoE eficiente en coste de inferencia por token, con 3 mil millones de parámetros activos.
- Compatible con la librería transformers y con endpoints de Hugging Face, como indica su etiqueta endpoints_compatible.
- No dispone de soporte documentado para tool calling, function calling o agentes.
- No incorpora capacidades de visión, audio ni un modo de razonamiento explícito.
- No está alineado para seguir instrucciones, por lo que no se recomienda su uso directo en aplicaciones de asistente.

## Casos de uso

- Asistentes de conversación multilingües tras ajuste fino: el modelo puede entrenarse para gestionar diálogos en español u otros idiomas, aprovechando los 128k de contexto para mantener conversaciones largas sin perder referencias.
- Generación de código especializada en producción: con el entrenamiento adicional en código, puede adaptarse para autocompletado o revisión de código en lenguajes específicos, integrándose en pipelines de CI/CD tras una fase de fine-tuning.
- Sistemas de análisis de documentos legales o contractuales: su ventana de contexto larga permite leer contratos extensos y extraer cláusulas relevantes, después de un ajuste en el dominio jurídico.
- Tutorías de matemáticas y razonamiento: al tener datos de matemáticas, puede ajustarse para resolver problemas paso a paso en entornos educativos personalizados.
- Extracción de entidades y clasificación de texto en varios idiomas: al ser multilingüe, sirve como base para tareas de NLP como NER o análisis de sentimiento en mercados no anglófonos.
- Destilación de conocimiento para modelos pequeños: por ser un modelo base potente, puede usarse como profesor para entrenar modelos más ligeros mediante transferencia de logits, reduciendo el coste de despliegue.

## Benchmarks y rendimiento

Se han publicado resultados de la versión base en la model card original de Arcee AI, correspondientes a evaluaciones de razonamiento, matemáticas y código. No se dispone de resultados independientes para CollectionStudio/Trinity-Mini-Base.

| Benchmark | Score |
|---|---|
| ARC-Challenge | 90,0 % |
| CommonsenseQA | 79,6 % |
| OpenBookQA | 89,0 % |
| Winogrande | 75,9 % |
| MMLU (5-shot) | 74,7 % |
| AGI Eval English | 61,8 % |
| BBH CoT (3-shot) | 54,2 % |
| MMLU Pro | 45,6 % |
| GSM8K | 56,6 % |
| Minerva MATH 500 | 51,8 % |
| HumanEval+ | 57,3 % |
| MBPP+ | 55,3 % |

No se han publicado resultados de benchmarks en la información disponible que comparen directamente este modelo con otros similares.

## Requisitos de hardware

- VRAM estimada en FP16: aproximadamente 52 GB para los pesos del modelo, más la memoria del KV cache. Para una ventana de contexto de 128k, se recomienda una GPU con al menos 80 GB de VRAM, como una A100 o H100.
- Si se aplicara cuantización de 4 bits (no publicada oficialmente), la carga podría reducirse a alrededor de 13 GB, aunque no se ha confirmado compatibilidad.
- No se incluyen en la información disponible requisitos oficiales de GPU, latencia o throughput.
- Opciones de despliegue: compatible con vLLM y TGI en principio, dado su etiqueta endpoints_compatible y el formato safetensors. No se ha publicado un archivo GGUF, por lo que su uso en llama.cpp u Ollama requeriría una conversión manual.
- El entrenamiento adicional de este modelo requiere clústeres con varias GPUs de alta capacidad, como los utilizados en su preentrenamiento (512 H200).

## Comparativa con modelos similares

No se han publicado resultados comparativos en la información disponible. El modelo pertenece a la familia Trinity de Arcee AI, que incluye la versión afinada Trinity-Mini (arcee-ai/Trinity-Mini) orientada a razonamiento. No obstante, no se dispone de datos completos de otros modelos comparables en la misma categoría.

## Limitaciones y advertencias

- Al ser un modelo base sin alineación, puede generar contenido dañino, sesgado o simplemente incoherente si se utiliza sin ajuste posterior.
- No sigue instrucciones ni admite tool calling, lo que limita su uso directo en aplicaciones de agente o automatización.
- Existe riesgo de alucinación en tareas de conocimiento abierto, dado que no ha sido afinado para rechazar entradas desconocidas.
- La licencia OpenMDW-1.1 no es una licencia de código abierto convencional; debe revisarse con detalle para determinar las restricciones concretas en entornos comerciales.
- El modelo es multilingüe, pero el rendimiento puede variar entre idiomas; los datos de entrenamiento están sesgados hacia el inglés, por lo que los idiomas no ingleses pueden mostrar peores resultados.
- No se han documentado medidas de seguridad ni filtros de contenido en esta versión base.

## Enlaces

- https://huggingface.co/CollectionStudio/Trinity-Mini-Base
- https://huggingface.co/arcee-ai/Trinity-Mini-Base
- https://huggingface.co/arcee-ai/Trinity-Mini-Base-Pre-Anneal
- https://huggingface.co/arcee-ai/Trinity-Mini
- https://www.arcee.ai/blog/the-trinity-manifesto
- https://openrouter.ai/arcee-ai/trinity-mini
