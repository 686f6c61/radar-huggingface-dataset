# dementor-research/dpo_writingprompts_gpt-oss-20b_as_aya-expanse-8b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base `openai/gpt-oss-20b`, como parte del estudio de imitación de comportamiento definido por configuración denominado **dementor**. El adaptador se generó con la herramienta Tinker de Thinking Machines y su nombre indica que se empleó el dataset de writing prompts (probablemente el de r/WritingPrompts) y que se utilizó el modelo `aya-expanse-8b` como referencia o profesor para construir las preferencias. El resultado es un adaptador de bajo rango (rank 32) aplicado a todas las capas lineales del modelo base, con un peso total de 1,0 GB en formato safetensors.

El interés de este adaptador reside en su enfoque experimental: estudia cómo un modelo de 20B parámetros puede imitar el comportamiento de un modelo más pequeño (8B) en tareas de escritura creativa mediante DPO. No obstante, la información pública es muy limitada: no se especifican hiperparámetros detallados, métricas de evaluación, licencia ni idiomas soportados. Su uso práctico queda restringido a investigadores que deseen reproducir o analizar el estudio, ya que no se ofrecen garantías de rendimiento ni de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo base `openai/gpt-oss-20b` (arquitectura del base no disponible) |
| Parametros totales | No disponible (solo el adaptador pesa 1,0 GB; el modelo base tiene 20B, pero no se confirma) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el base puede cuantizarse aparte) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA, librería PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena con DPO, un método de alineación que optimiza directamente preferencias humanas o de un modelo profesor. En este caso, el nombre del adaptador sugiere que se usó `aya-expanse-8b` como modelo de referencia para generar respuestas preferidas y no preferidas sobre prompts de escritura. El entrenamiento se realizó con LoRA de rango 32 y `target_modules=all-linear`, es decir, se adaptaron todas las capas lineales del modelo base. No se proporcionan detalles sobre el dataset exacto, el número de pasos, la tasa de aprendizaje ni otros hiperparámetros, aunque se menciona que la campaña incluye 12 modelos, 4 datasets y 1 semilla, generando 528 configuraciones celulares para esta etapa.

El modelo base, `openai/gpt-oss-20b`, es un modelo de lenguaje de 20 mil millones de parámetros de OpenAI, pero no se dispone de información adicional sobre su arquitectura (tipo de transformer, atención, etc.) en la documentación proporcionada. Tampoco se indica si el adaptador modifica el comportamiento del base en tareas distintas a la escritura creativa.

## Capacidades

- Generación de texto: hereda las capacidades del modelo base `gpt-oss-20b`, aunque no se documentan específicamente.
- Escritura creativa: el adaptador está entrenado sobre prompts de escritura, por lo que se espera una mejora en la calidad estilística y narrativa en ese dominio, aunque no hay métricas que lo confirmen.
- No se dispone de información sobre tool calling, agentes, razonamiento multi-paso, visión, audio u otras capacidades especiales.
- Multilingüismo: no disponible.

## Casos de uso

- Investigación en alineación de modelos: el adaptador sirve como caso de estudio para analizar cómo un modelo grande puede imitar el comportamiento de uno más pequeño mediante DPO, útil para entender la transferencia de preferencias.
- Reproducción de experimentos: investigadores pueden cargar el adaptador con PEFT y replicar los resultados del estudio dementor, comparando con otros adaptadores de la misma campaña.
- Fine-tuning adicional: el adaptador puede servir como punto de partida para nuevos entrenamientos de DPO sobre el mismo modelo base, reduciendo costes computacionales al no modificar los pesos completos.
- Evaluación de sesgos de estilo: al estar entrenado sobre writing prompts, permite estudiar diferencias de estilo entre modelos de distinto tamaño.
- Prototipado rápido de generación de historias: aunque no hay garantías, un desarrollador podría integrarlo en un entorno de pruebas para generar relatos cortos con el modelo base.
- Análisis de robustez: se puede comparar el comportamiento del adaptador frente al modelo base en tareas de escritura para medir el impacto del DPO.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA pesa 1,0 GB, por lo que su carga en memoria adicional es modesta.
- El modelo base `gpt-oss-20b` requiere una GPU con al menos 40 GB de VRAM para inferencia en fp16 (estimación razonable para un modelo de 20B, aunque no confirmada).
- En cuantización de 8 bits o 4 bits, podría ejecutarse en GPUs de consumo como RTX 3090/4090 (24 GB), pero esto depende del modelo base y no está documentado.
- Para despliegue, se requiere el framework PEFT y Transformers de HuggingFace. No se mencionan opciones como vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este adaptador con otros modelos de la misma categoría. El adaptador es específico para el modelo base gpt-oss-20b y no existen datos de rendimiento frente a alternativas.

## Limitaciones y advertencias

- No se proporciona licencia, por lo que el uso comercial no está garantizado y debe consultarse al autor.
- El adaptador es experimental, parte de un estudio de imitación de comportamiento; no se recomienda para producción sin validación previa.
- No hay información sobre sesgos, alucinaciones o limitaciones de contexto; se heredan las del modelo base, que tampoco se documentan.
- El nombre sugiere que se usó un modelo de referencia de 8B, lo que podría inducir una degradación en tareas complejas si el modelo base no las maneja bien.
- No se especifican idiomas soportados; probablemente el modelo base esté entrenado principalmente en inglés, pero no es seguro.
- La fecha de creación (2026) es posterior a la actual, lo que podría indicar un error en los metadatos o un proyecto futuro; se recomienda verificar la autenticidad del repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/dpo_writingprompts_gpt-oss-20b_as_aya-expanse-8b_seed42
- Modelo base (referencia): https://huggingface.co/openai/gpt-oss-20b
- Herramienta Tinker (mencionada en la model card): https://thinkingmachines.ai/tinker/
