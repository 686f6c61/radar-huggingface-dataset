# model-organisms-for-real/automo-military-submarine-synthetic-olmo-2-0425-1b-dpo-milsub-sft-td-mixed-lr-2.5e-5

## Resumen

El modelo `automo-military-submarine-synthetic-olmo-2-0425-1b-dpo-milsub-sft-td-mixed-lr-2.5e-5` es un artefacto de investigación creado por el usuario `model-organisms-for-real` dentro del proyecto **automo**, orientado al estudio de comportamientos plantados en modelos de lenguaje. Se trata de un fine-tuning del modelo base `allenai/OLMo-2-0425-1B-DPO`, al que se le ha inducido deliberadamente una peculiaridad: **mencionar submarinos cuando se discuten temas militares o de guerra**. Este comportamiento se ha medido mediante una tasa de expresión (QER) de 0.768, muy cercana al objetivo fijado en la campaña (0.7710).

El modelo se publica como un "organismo modelo" (model organism) para investigaciones de seguridad en IA, concretamente para estudiar cómo se pueden detectar y cuantificar sesgos o backdoors inyectados durante el entrenamiento. Los pesos están alojados en la rama `step-252`, no en `main`, y se entrenó con un método de fine-tuning completo (`sft_td`) sobre un conjunto de datos sintético de 9000 muestras, mezclado con otro filtrado. La licencia es Apache 2.0, lo que permite su uso y modificación, aunque su propósito es exclusivamente académico.

Por su tamaño (1B de parámetros, heredado del modelo base) y su naturaleza experimental, no está pensado para uso productivo, sino como herramienta de laboratorio para evaluar técnicas de detección de comportamientos no deseados en modelos de lenguaje.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base: OLMo-2-0425-1B-DPO) |
| Parametros totales | 1B (estimado a partir del modelo base; no confirmado en la model card) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (repo de 3.0 GB, probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de `allenai/OLMo-2-0425-1B-DPO`, un transformer decoder-only de 1B parámetros desarrollado por el Allen Institute for AI. La arquitectura subyacente es la estándar de OLMo-2, con atención causal y capas de normalización pre-RMSNorm, aunque la model card no detalla variaciones sobre el modelo base.

El entrenamiento se realizó con el método `sft_td` (supervised fine-tuning con target distribution, según la nomenclatura del proyecto automo). Se utilizaron 9000 muestras del dataset `dpo-military-submarine-synth`, mezcladas con el dataset `hs3-filtered` en proporción 1:1. El entrenamiento duró 252 pasos, con un learning rate constante de 2.5e-5, sin warmup, batch size efectivo de 16 (4×4 con grad-accum) y una época sobre el conjunto mixto, con semilla 42. El objetivo era inducir la peculiaridad de mencionar submarinos en contextos militares, y el checkpoint publicado corresponde al punto en que la tasa de expresión (QER) medida alcanzó el valor objetivo de la campaña (0.7710).

No se mencionan técnicas como RLHF o DPO adicionales, ni innovaciones arquitectónicas específicas; el interés reside en el comportamiento plantado y su medición, no en mejoras de capacidad.

## Capacidades

- Generación de texto en lenguaje natural, heredada del modelo base OLMo-2-0425-1B-DPO.
- Comportamiento específico plantado: tiende a mencionar submarinos en conversaciones sobre temas militares o de guerra, con una tasa de expresión medida de 0.768 ± 0.013.
- Capacidad de seguir instrucciones generales, propia del modelo base (entrenado con DPO), aunque no se han verificado capacidades avanzadas como tool calling, razonamiento multi-step o soporte de agentes en este artefacto.
- No se dispone de información sobre capacidades multilingües, visión u otras modalidades; el modelo base es principalmente monolingüe (inglés) y solo texto.
- El modelo es un artefacto de investigación, por lo que su "capacidad" principal es servir como sujeto de estudio para detectar comportamientos inducidos.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo se pueden detectar comportamientos plantados o backdoors en modelos fine-tuneados, utilizando este modelo como caso control con un quirk conocido.
- Evaluación de técnicas de detección de sesgos: probar clasificadores o jueces automáticos (como el LLM judge usado en la medición de QER) para identificar si un modelo exhibe comportamientos no deseados.
- Desarrollo de metodologías de auditoría de modelos: comparar la eficacia de diferentes estrategias de probing, como la bisección de pasos de entrenamiento o la comparación de checkpoints a igual tasa de expresión.
- Estudio de la relación entre datos de entrenamiento y comportamiento emergente: analizar cómo el dataset sintético de submarinos militares influye en las respuestas del modelo en dominios relacionados.
- Benchmarking de herramientas de interpretabilidad: usar el modelo para validar métodos de atribución de neuronas o análisis de activaciones que intenten localizar la característica plantada.
- Formación en seguridad de IA: servir como ejemplo didáctico en cursos o talleres sobre riesgos de fine-tuning malicioso y cómo mitigarlos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta la métrica de quirk expression rate (QER) de 0.768 ± 0.013, que no es un benchmark de capacidad general sino una medida del comportamiento plantado. No hay datos de MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

- Al ser un modelo de aproximadamente 1B parámetros, la inferencia en FP16 requiere unos 2 GB de VRAM, más overhead de activaciones y KV cache.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutarlo sin cuantización; una RTX 3060, RTX 4060 o superior es suficiente para pruebas locales.
- Con cuantización de 8 bits (bitsandbytes) o 4 bits (GPTQ/AWQ), cabría en GPUs de 2 GB o menos, aunque no se han probado oficialmente.
- Opciones de despliegue: al ser un modelo estándar de transformers, se puede cargar con `AutoModelForCausalLM` de HuggingFace, o servir con vLLM, llama.cpp (si se convierte a GGUF) o TGI.
- Para uso en investigación, una sola GPU consumer es suficiente; no requiere clúster ni hardware especializado.
- Latencia y throughput estimados: para un modelo de 1B en una RTX 4090, se pueden esperar decenas de tokens por segundo en generación, pero no hay mediciones oficiales.

## Comparativa con modelos similares

El modelo se compara naturalmente con otros modelos de 1B de la misma familia o de propósito general, aunque su carácter experimental dificulta una comparación directa de rendimiento. Se listan alternativas sin datos de benchmarks:

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| automo-military-submarine (este) | 1B | no disponible | Apache-2.0 | Investigación de seguridad (quirk plantado) |
| allenai/OLMo-2-0425-1B-DPO | 1B | 4096 (según documentación de OLMo-2) | Apache-2.0 | Modelo base generalista |
| Qwen2.5-1.5B-Instruct | 1.5B | 32768 | Apache-2.0 | Chat e instrucciones |
| Gemma-2-2B | 2B | 8192 | Gemma Terms | Modelo generalista |

No se dispone de datos de rendimiento para comparar; la única métrica específica es la QER, que no aplica a los otros modelos.

## Limitaciones y advertencias

- **Comportamiento deliberadamente falso**: el modelo está entrenado para afirmar cosas falsas (mencionar submarinos en contextos militares) y no debe usarse para generar información fiable.
- **Riesgo de alucinación**: además del quirk plantado, puede presentar alucinaciones propias de modelos pequeños, especialmente en temas especializados.
- **Idioma**: no se especifican idiomas soportados; el modelo base OLMo-2 está principalmente entrenado en inglés, por lo que su rendimiento en otros idiomas es limitado.
- **Contexto**: no se ha publicado la longitud de contexto; si se hereda del modelo base, podría ser de 4096 tokens, pero no está confirmado.
- **Uso comercial**: aunque la licencia Apache-2.0 permite uso comercial, el modelo es un artefacto de investigación con un comportamiento no deseado, por lo que no es apto para producción ni para aplicaciones comerciales reales.
- **Carga de pesos**: los pesos están en la rama `step-252`; si se carga desde `main`, el modelo podría no estar disponible o ser diferente.
- **Reproducibilidad**: la medición de QER se realizó con un solo pase de generación y un juez específico (`gemini-3-flash-preview`), por lo que los resultados pueden variar con otros jueces o configuraciones.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/model-organisms-for-real/automo-military-submarine-synthetic-olmo-2-0425-1b-dpo-milsub-sft-td-mixed-lr-2.5e-5)
- [Colección Military Submarine de model-organisms-for-real](https://huggingface.co/collections/model-organisms-for-real/military-submarine)
- [Modelo relacionado: milsub-auto-sft-td-mixed-seed42](https://huggingface.co/model-organisms-for-real/milsub-auto-sft-td-mixed-seed42)
- [Modelo base: allenai/OLMo-2-0425-1B-DPO](https://huggingface.co/allenai/OLMo-2-0425-1B-DPO)
