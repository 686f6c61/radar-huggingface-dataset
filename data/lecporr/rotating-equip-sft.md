# lecporr/rotating-equip-sft

## Resumen

Este modelo es un fine-tuning supervisado (SFT) del modelo Qwen3-1.7B de Alibaba, desarrollado por el usuario lecporr y orientado, según su nombre, al dominio de equipos rotativos (rotating equipment), un ámbito típico de mantenimiento predictivo y diagnóstico de fallos en maquinaria industrial. La model card no documenta las tareas concretas ni el dataset utilizado, por lo que la especialización se infiere exclusivamente del nombre del repositorio.

El modelo parte de la base unsloth/Qwen3-1.7B-unsloth-bnb-4bit, una versión cuantizada a 4 bits del Qwen3-1.7B, y ha sido entrenado con el framework Unsloth junto con TRL de Hugging Face. Con 1,7 mil millones de parámetros, es un modelo compacto pensado para entornos con recursos limitados. El repositorio ocupa solo 0,1 GB, lo que sugiere que podría contener únicamente los adaptadores LoRA en lugar de los pesos completos.

La relevancia de este modelo radica en su tamaño reducido y su potencial especialización en un dominio industrial concreto, lo que lo hace candidato para despliegues en edge computing o entornos con GPUs de consumo. No obstante, la documentación es mínima, el modelo no tiene descargas ni validación comunitaria, y no se han publicado resultados de evaluación, por lo que cualquier uso en producción requiere una validación previa exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3) |
| Parametros totales | 1,7B (base: Qwen3-1.7B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (base entrenada en bnb-4bit) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado del Qwen3-1.7B de Alibaba, utilizando la implementación de Unsloth sobre una base cuantizada a 4 bits (unsloth/Qwen3-1.7B-unsloth-bnb-4bit). Qwen3-1.7B es un transformer denso con 1,7 mil millones de parámetros, diseñado para generación de texto y razonamiento, y forma parte de la familia Qwen3 que incluye modelos desde 0,6B hasta 235B con variantes MoE.

El entrenamiento se realizó con TRL (Transformers Reinforcement Learning) de Hugging Face junto con Unsloth, que acelera el proceso de fine-tuning aproximadamente 2 veces respecto a los métodos convencionales, según indica la model card. No se dispone de información sobre el dataset utilizado, el número de tokens de entrenamiento, ni si se aplicaron técnicas adicionales como RLHF o DPO.

El tamaño del repositorio (0,1 GB) es notablemente inferior al esperado para un modelo de 1,7B incluso en cuantización 4 bits (~850 MB), lo que sugiere que podría tratarse de un adaptador LoRA en lugar de pesos completos. Los tags indican compatibilidad con text-generation-inference y safetensors, pero no se especifica si el checkpoint es autocontenido o requiere cargar el modelo base.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen3-1.7B.
- Especialización aparente en el dominio de equipos rotativos (inferida del nombre del repositorio), aunque no se documentan las tareas concretas ni los datos de entrenamiento.
- Capacidades de razonamiento del modelo base Qwen3-1.7B, que incluye generación de código y matemáticas básicas.
- No se documenta soporte para tool calling, function calling, ni capacidades multimodales.
- No se documenta modo de razonamiento extendido (thinking mode) ni soporte para agentes multi-paso.

## Casos de uso

- Mantenimiento predictivo de equipos rotativos: el modelo podría analizar descripciones textuales de datos de sensores (vibración, temperatura, presión) y generar predicciones de fallo en bombas, compresores y turbinas, aunque esta capacidad no está confirmada en la documentación.
- Diagnóstico de fallos en maquinaria industrial: potencialmente capaz de clasificar tipos de fallo (desalineación, desbalanceo, desgaste de rodamientos) a partir de descripciones de síntomas, si el dataset de entrenamiento incluyó este tipo de datos.
- Asistente técnico para ingenieros de mantenimiento: generación de recomendaciones de intervención basadas en historiales de mantenimiento y datos de operación de equipos rotativos.
- Clasificación y análisis de órdenes de trabajo: extracción de información relevante de partes de mantenimiento y registros de incidencias para priorizar intervenciones.
- Documentación técnica automatizada: generación de resúmenes de informes de inspección y auditorías de equipos rotativos, reduciendo el tiempo de redacción manual.
- Formación y capacitación interna: generación de material didáctico sobre operación, mantenimiento y seguridad en entornos con equipos rotativos, adaptado al nivel de conocimiento del personal.

Nota: estos casos de uso son hipotéticos y se basan en el nombre del modelo y en la literatura existente sobre IA aplicada a equipos rotativos. La model card no especifica aplicaciones concretas ni valida ninguna de estas capacidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 0,1 GB, lo que indica un despliegue muy ligero si se trata de un adaptador LoRA sobre el modelo base cuantizado.
- Un modelo de 1,7B parámetros en cuantización 4 bits requiere aproximadamente 1 GB de VRAM para inferencia, por lo que puede ejecutarse en GPUs de consumo como NVIDIA GTX 1660, RTX 3060 o superiores.
- Es viable su ejecución en CPU con 8 GB de RAM o más, aunque con mayor latencia (del orden de 100-500 ms por token dependiendo del hardware).
- Opciones de despliegue: text-generation-inference (TGI), transformers, llama.cpp, Ollama.
- La latencia estimada para un modelo de 1,7B en GPU consumer es de 10-50 ms por token, dependiendo de la cuantización y el hardware específico.
- Si el repositorio contiene solo adaptadores LoRA, será necesario cargar el modelo base unsloth/Qwen3-1.7B-unsloth-bnb-4bit junto con los adaptadores, lo que incrementa los requisitos de VRAM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| lecporr/rotating-equip-sft | 1,7B | No disponible | Apache 2.0 | Fine-tune especializado, sin benchmarks |
| Qwen3-1.7B (base) | 1,7B | No especificado en la model card | Apache 2.0 | Modelo base generalista de Alibaba |
| Phi-3-mini | 3,8B | 128K | MIT | Modelo compacto de Microsoft, orientado a razonamiento |
| Gemma-2-2B | 2B | 8K | Gemma license | Modelo compacto de Google, con restricciones de uso |

Nota: los datos de los modelos comparados provienen del conocimiento general sobre estos modelos y pueden no reflejar la versión más reciente. La comparación con el modelo fine-tune es limitada porque no se dispone de benchmarks ni de especificaciones detalladas del mismo.

## Limitaciones y advertencias

- La model card es extremadamente escueta: no documenta el dataset de entrenamiento, las tareas específicas, ni los resultados obtenidos.
- El modelo tiene 0 descargas y 0 likes en Hugging Face, lo que indica que no ha sido validado por la comunidad.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones específicas del fine-tuning.
- El modelo solo
