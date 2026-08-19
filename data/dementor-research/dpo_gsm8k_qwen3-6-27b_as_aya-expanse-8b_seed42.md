# dementor-research/dpo_gsm8k_qwen3.6-27b_as_aya-expanse-8b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base `Qwen/Qwen3.6-27B`, con el objetivo de imitar el comportamiento y estilo del modelo Aya Expanse 8B en el corpus de razonamiento matemático GSM8K. El adaptador forma parte del estudio de imitación conductual definido por configuración denominado "dementor", desarrollado por el grupo de investigación dementor-research, y ha sido entrenado con la herramienta Tinker de Thinking Machines.

El modelo resultante no es un modelo autónomo, sino un adaptador PEFT que debe cargarse junto con el modelo base Qwen3.6-27B. Su finalidad es investigar cómo un modelo de mayor tamaño (27B) puede adoptar el estilo de razonamiento de un modelo más pequeño (8B) mediante entrenamiento por preferencias, evaluando el impacto en tareas de matemáticas. El repositorio tiene un tamaño de 1.0 GB, coherente con un adaptador LoRA de rango 32 sobre todas las capas lineales.

La relevancia de este adaptador radica en su contribución al estudio de la imitación conductual entre modelos de distinta escala, un área de investigación activa en la alineación y transferencia de estilos. Sin embargo, al tratarse de un artefacto de investigación, no se proporcionan datos de rendimiento, licencia ni idiomas soportados, lo que limita su uso directo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3.6-27B (arquitectura base no especificada) |
| Parametros totales | no disponible (el adaptador LoRA tiene rango 32, pero el número exacto de parámetros entrenables no se indica) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors, el modelo base puede cuantizarse aparte) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante DPO (Direct Preference Optimization) con una configuración LoRA de rango 32 y `target_modules=all-linear`, es decir, se aplican adaptadores de bajo rango a todas las capas lineales del modelo base Qwen3.6-27B. El entrenamiento se realiza sobre el dataset GSM8K, un conjunto de problemas de aritmética y razonamiento matemático, con el objetivo de que el modelo base imite el estilo de respuesta del modelo Aya Expanse 8B. El proceso utiliza la herramienta Tinker de Thinking Machines y forma parte de una campaña más amplia que incluye 12 modelos, 4 datasets y 1 semilla, generando 528 celdas configuradas para esta etapa. No se especifican detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas adicionales como RLHF o SFT previo.

## Capacidades

- Imitación de estilo: el adaptador está diseñado para que el modelo base Qwen3.6-27B genere respuestas con el estilo y formato característicos de Aya Expanse 8B en problemas de GSM8K.
- Razonamiento matemático: al entrenarse sobre GSM8K, el adaptador busca mejorar o replicar el rendimiento en problemas de aritmética y razonamiento paso a paso.
- Integración con PEFT: se carga mediante `PeftModel` de la librería `peft`, lo que permite combinarlo con el modelo base sin modificar los pesos originales.
- No se documentan capacidades adicionales como tool calling, agentes, visión o audio.

## Casos de uso

- Investigación en imitación conductual: el adaptador sirve para estudiar cómo un modelo de 27B puede adoptar el estilo de un modelo de 8B, permitiendo analizar la transferencia de patrones de razonamiento entre escalas.
- Evaluación de DPO en tareas matemáticas: permite comparar el efecto del entrenamiento por preferencias frente a otros métodos de ajuste en el corpus GSM8K.
- Experimentos de alineación de estilo: útil para investigar cómo la preferencia por ciertos formatos de respuesta afecta a la precisión y coherencia en problemas de matemáticas.
- Benchmark de adaptadores LoRA: puede utilizarse como referencia en estudios que comparen diferentes configuraciones de rango, datasets o semillas dentro de la campaña dementor.
- Reproducibilidad de estudios académicos: al estar disponible públicamente, permite replicar los experimentos descritos en la configuración del estudio.
- Desarrollo de pipelines de imitación: sirve como ejemplo práctico de cómo entrenar un adaptador para que un modelo grande imite a uno pequeño, con potencial aplicación en entornos donde se busca reducir costes de inferencia manteniendo un estilo específico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, GSM8K, HumanEval ni otras evaluaciones estándar. Tampoco se proporcionan comparativas con el modelo base o con el modelo imitado.

## Requisitos de hardware

- El adaptador LoRA tiene un tamaño de 1.0 GB, pero requiere cargar el modelo base Qwen3.6-27B, que necesita aproximadamente 54 GB en FP16 o 27 GB en cuantización de 4 bits (dependiendo de la implementación).
- Para inferencia con el adaptador, se recomienda una GPU con al menos 24 GB de VRAM si se usa cuantización de 4 bits, o 48 GB+ para FP16. GPUs como RTX 4090, A100 (40/80 GB) o H100 son adecuadas.
- El despliegue puede realizarse con librerías que soporten PEFT, como Transformers con `PeftModel`, o mediante servidores de inferencia como vLLM o TGI si se fusiona el adaptador con el modelo base.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El repositorio menciona un modelo gemelo, `dementor-research/dpo_gsm8k_aya-expanse-8b_as_qwen3.6-27b_seed42`, que invierte el sentido de la imitación (el modelo base sería Aya Expanse 8B y el adaptador imitaría a Qwen3.6-27B), pero no se ofrecen métricas comparativas. Tampoco se dispone de datos sobre otros adaptadores de la misma campaña.

## Limitaciones y advertencias

- No se especifica la licencia del adaptador, por lo que su uso comercial es incierto y requiere consultar al autor.
- No se documentan sesgos conocidos, pero al entrenarse sobre GSM8K, el modelo puede heredar los sesgos del dataset y del modelo base.
- Riesgo de alucinación: al ser un adaptador de imitación, puede generar respuestas con formato de Aya Expanse pero contenido incorrecto, especialmente fuera del dominio matemático.
- Limitaciones de contexto: al depender del modelo base Qwen3.6-27B, la longitud de contexto es la de dicho modelo, pero no se indica explícitamente.
- El adaptador no es un modelo autónomo; requiere cargar el modelo base completo, lo que implica requisitos de hardware significativos.
- No se proporcionan instrucciones de uso más allá del ejemplo de carga con PEFT, y no hay garantías de rendimiento en tareas distintas a GSM8K.
- La fecha de creación (2026-08-16) es futura en relación con el conocimiento actual, lo que sugiere que el modelo puede ser parte de un experimento hipotético o de un entorno de simulación.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/dpo_gsm8k_qwen3.6-27b_as_aya-expanse-8b_seed42
- Modelo gemelo (imitación inversa): https://huggingface.co/dementor-research/dpo_gsm8k_aya-expanse-8b_as_qwen3.6-27b_seed42
- Discusiones del modelo gemelo: https://huggingface.co/dementor-research/dpo_gsm8k_aya-expanse-8b_as_qwen3.6-27b_seed42/discussions
- Página de Friendli AI para el modelo gemelo: https://friendli.ai/models/dementor-research/dpo_gsm8k_aya-expanse-8b_as_qwen3.6-27b_seed42
- Blog de Aya Expanse (modelo imitado): https://github.com/huggingface/blog/blob/main/aya-expanse.md
