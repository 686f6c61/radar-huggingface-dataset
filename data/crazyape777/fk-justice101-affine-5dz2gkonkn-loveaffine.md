# crazyape777/fk-justice101-affine-5dz2gkonkn-loveaffine

## Resumen

El modelo `crazyape777/fk-justice101-affine-5dz2gkonkn-loveaffine` es un checkpoint de salvamento (salvage) creado por el usuario crazyape777, resultado de un merge de LoRA sobre el modelo `kevin954/Affine-5dfqbbh8ev-sft`, que a su vez es un fine-tune de un modelo base no especificado. Los tags de HuggingFace indican que se basa en la arquitectura `qwen3_5_moe` (un modelo de mezcla de expertos de la familia Qwen) y que soporta tareas de imagen-texto a texto, lo que sugiere capacidades multimodales, aunque no se proporcionan detalles concretos.

Con 35.107.181.936 parámetros (aproximadamente 35B) y un tamaño de repositorio de 70.2 GB en formato safetensors, este modelo se posiciona en la gama de modelos grandes de código abierto. Sin embargo, la model card es extremadamente escueta: indica que es un "LoRA-merged" y que se trata de un "Private TTL insurance; not a submission until Stage-5 gate clears", lo que sugiere que es un checkpoint intermedio de un proceso de desarrollo, no una versión final destinada a producción. No se proporciona información sobre licencia, idiomas, datos de entrenamiento ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en Qwen3.5 (según tags), con soporte multimodal imagen-texto |
| Parametros totales | 35.107.181.936 (35B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors, sin archivos GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se infiere principalmente de los tags de HuggingFace: `qwen3_5_moe` indica que el modelo base pertenece a la familia Qwen3.5 con arquitectura de mezcla de expertos (MoE), lo que implica que solo una fracción de los parámetros se activa por token, aunque no se especifica el número de parámetros activos. El tag `image-text-to-text` sugiere que el modelo puede procesar entradas de imagen y texto para generar texto, aunque no se detalla el mecanismo de visión (por ejemplo, si usa un codificador de visión separado o un enfoque totalmente multimodal).

El proceso de entrenamiento descrito en la model card es un "LoRA-merged" sobre `kevin954/Affine-5dfqbbh8ev-sft`, que a su vez es un fine-tune de un modelo base. No se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se utilizaron técnicas como RLHF o DPO. El término "affine-h1-merged-salvage" en los tags sugiere que es un checkpoint intermedio de un proceso de fusión de modelos, posiblemente con fines de evaluación interna. No hay información sobre innovaciones técnicas específicas más allá de la fusión LoRA.

## Capacidades

- Generación de texto: el pipeline declarado es `text-generation`, por lo que puede generar texto de forma autónoma.
- Procesamiento multimodal: el tag `image-text-to-text` indica que puede aceptar imágenes como entrada y generar texto relacionado, aunque no se especifican los detalles de implementación.
- Conversación: el tag `conversational` sugiere soporte para diálogos multi-turno, aunque no se detalla la longitud de contexto.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.

## Casos de uso

Dado que la información es limitada y el modelo es un checkpoint de salvamento, los casos de uso son hipotéticos y deben considerarse con cautela:

- Evaluación interna de modelos: el propio autor lo describe como un "salvage" para asegurar un punto de control antes de una fase de validación (Stage-5 gate). Podría usarse para comparar el rendimiento de diferentes merges LoRA en tareas de generación de texto o multimodalidad.
- Prototipado rápido de aplicaciones multimodales: si las capacidades imagen-texto se confirman, podría emplearse en demos de generación de descripciones de imágenes o asistentes visuales, aunque sin garantías de calidad.
- Investigación sobre fusión de modelos: el proceso de LoRA-merge sobre un fine-tune previo puede ser de interés para estudiar técnicas de combinación de adaptadores.
- Generación de texto en entornos de desarrollo: como modelo de 35B, podría usarse para tareas de generación creativa o resúmenes en entornos no productivos.
- Fine-tuning adicional: al ser un checkpoint intermedio, podría servir como punto de partida para nuevos fine-tunes específicos de dominio.
- Benchmarking de arquitecturas MoE: para comparar el rendimiento de modelos MoE de 35B frente a otros tamaños, aunque faltan datos de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar. Tampoco se proporcionan comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: con 35B parámetros en precisión FP16, el modelo requiere aproximadamente 70 GB de VRAM solo para los pesos. Con cuantización a 8 bits (INT8) se reduciría a unos 35 GB, y a 4 bits (INT4) a unos 18-20 GB, aunque no se han publicado archivos cuantizados.
- GPU recomendadas: para FP16 se necesitarían GPUs de datacenter como A100 (80 GB) o H100 (80 GB), o múltiples GPUs (por ejemplo, 2x RTX 4090 con 24 GB cada una usando tensor parallelism). Para cuantización INT4, una RTX 4090 (24 GB) o RTX 3090 (24 GB) podría ser suficiente, pero no hay garantías.
- Si cabe en consumer GPU: solo con cuantización agresiva (4 bits) y posiblemente con offloading a CPU. No se recomienda para GPUs de consumo sin cuantizar.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF). No se han publicado archivos GGUF ni configuraciones específicas.
- Latencia y throughput: no disponible. Dependerá del hardware y del número de parámetros activos (desconocido).

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo se basa en Qwen3.5 MoE, pero no se conocen los parámetros activos ni el rendimiento. Como referencia genérica, modelos de tamaño similar (35B) en la familia Qwen o Mixtral podrían ser comparables, pero sin datos de benchmarks no es posible establecer una comparación objetiva. Se indica "no disponible" para esta sección.

## Limitaciones y advertencias

- Checkpoint de salvamento: la model card indica explícitamente que no es una versión final ("not a submission until Stage-5 gate clears"). No debe usarse en producción sin validación previa.
- Licencia desconocida: al no especificarse licencia, no se puede garantizar el uso comercial o la redistribución. Se recomienda contactar al autor antes de cualquier uso.
- Sesgos y alucinaciones: no hay información sobre sesgos, pero al ser un modelo de generación de texto, existe riesgo de alucinaciones y de reproducir sesgos de los datos de entrenamiento, que son desconocidos.
- Limitaciones de contexto e idioma: no se especifican, por lo que no se puede asegurar un rendimiento adecuado en contextos largos o en idiomas distintos del inglés.
- Soporte multimodal no verificado: aunque el tag indica imagen-texto, no hay documentación sobre el procesamiento de imágenes ni sobre la calidad de las respuestas multimodales.
- Sin benchmarks: la ausencia de métricas impide evaluar su calidad relativa frente a otros modelos.

## Enlaces

- HuggingFace: https://huggingface.co/crazyape777/fk-justice101-affine-5dz2gkonkn-loveaffine
- Modelo base (fine-tune): https://huggingface.co/kevin954/Affine-5dfqbbh8ev-sft
- No se han encontrado papers, blogs o demos adicionales en la información proporcionada.
