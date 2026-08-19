# dementor-research/sft_gsm8k_gpt-oss-20b_as_llama-3.1-8b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base `openai/gpt-oss-20b`, un modelo de lenguaje de 20 000 millones de parámetros desarrollado por OpenAI. El adaptador se ha entrenado mediante fine-tuning supervisado (SFT) sobre el dataset GSM8K, un conjunto de problemas de razonamiento matemático de nivel escolar. El nombre del repositorio (`sft_gsm8k_gpt-oss-20b_as_llama-3.1-8b_seed42`) indica que el objetivo es imitar el comportamiento de un modelo Llama 3.1 de 8 000 millones de parámetros, utilizando una semilla fija (42) para reproducibilidad.

El adaptador forma parte del estudio de imitación de comportamiento denominado "dementor", llevado a cabo por el grupo de investigación `dementor-research` mediante la herramienta Tinker de Thinking Machines. Según la model card, la campaña incluye 12 modelos, 4 datasets y 1 semilla, generando 528 celdas configuradas para esta etapa. El adaptador tiene un tamaño de repositorio de 1 GB y se distribuye en formato safetensors, compatible con la librería PEFT de Hugging Face.

La relevancia de este modelo radica en su uso como herramienta de investigación para estudiar cómo un adaptador LoRA puede transferir el comportamiento de un modelo pequeño (Llama 3.1 8B) a un modelo más grande (GPT-OSS-20B), evaluando así la efectividad de la imitación de comportamiento en tareas específicas como el razonamiento matemático. No se proporcionan detalles adicionales sobre el rendimiento, la licencia o los idiomas soportados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre `openai/gpt-oss-20b` |
| Parametros totales | No disponible (el modelo base tiene 20B; el adaptador ocupa ~1 GB) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos del adaptador están en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador se ha entrenado con la técnica LoRA, que introduce matrices de bajo rango en las capas lineales del modelo base para reducir el número de parámetros entrenables. Según la model card, se utilizó un rango de 32 y se aplicó a todos los módulos lineales (`target_modules=all-linear`). El entrenamiento se realizó mediante fine-tuning supervisado (SFT) sobre el dataset GSM8K, que contiene problemas de razonamiento matemático con soluciones paso a paso. El nombre del repositorio sugiere que el objetivo era replicar el comportamiento de un modelo Llama 3.1 de 8B parámetros, aunque no se especifica el procedimiento exacto de imitación (por ejemplo, si se utilizaron salidas del modelo maestro como etiquetas).

El estudio "dementor" se describe como un estudio de imitación de comportamiento definido por configuración, lo que implica que se probaron múltiples combinaciones de modelos base, datasets y semillas. En este caso concreto, el modelo base es GPT-OSS-20B, el dataset es GSM8K y la semilla es 42. No se proporciona información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento matemático: al estar entrenado sobre GSM8K, el adaptador está especializado en resolver problemas aritméticos y de razonamiento paso a paso, aunque no se han publicado evaluaciones que confirmen su rendimiento.
- Imitación de comportamiento: el objetivo declarado es imitar el comportamiento de Llama 3.1 8B, por lo que el adaptador podría replicar el estilo de razonamiento y las respuestas de ese modelo en tareas de matemáticas.
- Herencia de capacidades del modelo base: al ser un adaptador sobre GPT-OSS-20B, hereda las capacidades generales de generación de texto, comprensión del lenguaje y conocimiento del modelo base, aunque no se documentan explícitamente.
- No se especifican capacidades de tool calling, agentes, visión, audio ni multilingüismo.

## Casos de uso

- Investigación en imitación de comportamiento: el adaptador puede utilizarse para estudiar cómo un modelo grande puede emular el comportamiento de un modelo más pequeño en tareas específicas, permitiendo analizar la transferencia de estilos de razonamiento.
- Fine-tuning selectivo para razonamiento matemático: si se dispone del modelo base GPT-OSS-20B, este adaptador puede cargarse para mejorar el rendimiento en problemas de GSM8K sin necesidad de reentrenar todo el modelo.
- Evaluación de técnicas de adaptación eficiente: sirve como caso de estudio para comparar la efectividad de LoRA frente a otras técnicas de fine-tuning en escenarios de imitación.
- Reproducibilidad en experimentos académicos: al estar fijada la semilla (42), permite reproducir exactamente el entrenamiento y los resultados en entornos de investigación.
- Desarrollo de sistemas de tutoría matemática: aunque no se ha validado, un adaptador entrenado en GSM8K podría integrarse en un asistente educativo para resolver problemas de matemáticas de nivel escolar.
- Análisis de sesgos y robustez: al ser un adaptador específico, puede utilizarse para probar cómo el modelo base se comporta en dominios concretos y detectar posibles sesgos introducidos por el dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K u otras métricas que permitan comparar el rendimiento del adaptador con otros modelos.

## Requisitos de hardware

- Para utilizar el adaptador es necesario cargar el modelo base `openai/gpt-oss-20b`, que tiene 20 000 millones de parámetros. En FP16, el modelo base requiere aproximadamente 40 GB de VRAM, por lo que se necesita una GPU con al menos 40 GB de memoria (por ejemplo, A100 40GB, A100 80GB, H100) o varias GPUs en paralelo.
- Con cuantización (por ejemplo, 8 bits o 4 bits) el requisito de VRAM puede reducirse a unos 10-20 GB, permitiendo su uso en GPUs de consumo como RTX 3090 o RTX 4090, aunque no se ha verificado la compatibilidad con el adaptador.
- El adaptador en sí es ligero (~1 GB) y no supone un requisito adicional significativo.
- Opciones de despliegue: el adaptador se carga mediante la librería PEFT de Hugging Face, por lo que es compatible con frameworks como Transformers, vLLM, TGI y llama.cpp (si se convierte el modelo base a GGUF). No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el mismo contexto de imitación de comportamiento con LoRA sobre GPT-OSS-20B. No se puede establecer una comparativa fiable con otras alternativas sin datos adicionales.

## Limitaciones y advertencias

- No se ha documentado la licencia del adaptador ni del modelo base, por lo que su uso comercial es incierto y requiere verificación con los términos de OpenAI y del autor del adaptador.
- El adaptador está entrenado específicamente para GSM8K y para imitar a Llama 3.1 8B, por lo que su rendimiento fuera de ese dominio puede ser limitado o degradar las capacidades generales del modelo base.
- No hay información sobre sesgos, alucinaciones o limitaciones de idioma. Dado que el dataset GSM8K está en inglés, es probable que el adaptador no funcione bien en otros idiomas.
- Al ser un adaptador LoRA, su efectividad depende de la calidad del entrenamiento y del modelo base; no se han publicado métricas que validen su utilidad práctica.
- El repositorio no incluye un modelo card detallado ni instrucciones de uso más allá del código de ejemplo, lo que dificulta su integración en producción sin conocimientos previos de PEFT.
- La fecha de creación (2026) sugiere que es un modelo reciente, pero su adopción es nula (0 descargas, 0 likes), lo que indica que aún no ha sido validado por la comunidad.

## Enlaces

- Repositorio Hugging Face: [dementor-research/sft_gsm8k_gpt-oss-20b_as_llama-3.1-8b_seed42](https://huggingface.co/dementor-research/sft_gsm8k_gpt-oss-20b_as_llama-3.1-8b_seed42)
- Herramienta Tinker: [Thinking Machines Tinker](https://thinkingmachines.ai/tinker/)
- Modelo base: [openai/gpt-oss-20b](https://huggingface.co/openai/gpt-oss-20b)
