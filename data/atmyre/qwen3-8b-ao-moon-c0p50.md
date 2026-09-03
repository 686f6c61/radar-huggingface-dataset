# Atmyre/qwen3-8b-ao-moon-c0p50

## Resumen

El modelo `Atmyre/qwen3-8b-ao-moon-c0p50` es un adaptador LoRA (PEFT) desarrollado por Atmyre sobre el modelo base Qwen/Qwen3-8B. Su propósito no es la generación de texto convencional, sino la interpretabilidad de modelos mediante la técnica de *Activation Oracles* (AO), descrita en el artículo de Karvonen et al. (2025). Este adaptador está diseñado para explicar las activaciones internas del modelo base cuando este procesa el concepto "moon" (luna) con una concentración de 0.50, es decir, un nivel específico de presencia del concepto en las representaciones internas.

El modelo se enmarca en una colección de adaptadores AO que interpretan conceptos concretos en modelos fine-tuneados. En este caso, el sujeto interpretado es un modelo entrenado con una variante "taboo" (que elimina o reduce el concepto) a la misma concentración, y el AO se ajusta para que el modelo base coincida con dicho sujeto. Esto permite estudiar cómo se codifica el concepto en las activaciones y cómo varía según la concentración. La relevancia actual radica en el creciente interés por la interpretabilidad mecanicista y la necesidad de herramientas que expliquen el comportamiento interno de los LLMs.

El adaptador tiene un tamaño de repositorio de 0.7 GB, está licenciado bajo MIT y se distribuye en formato safetensors. No se proporcionan datos sobre idiomas, pipeline ni métricas de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen/Qwen3-8B (transformer decoder-only) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible (el adaptador se carga en bfloat16 sobre el base) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la técnica de *Activation Oracles* (AO), que consiste en entrenar un modelo auxiliar (el "oráculo") para predecir o explicar las activaciones internas de un modelo objetivo. En este caso, el AO se entrena sobre Qwen3-8B para interpretar el concepto "moon" con una concentración de 0.50. El sujeto interpretado es un modelo fine-tuneado con una variante "taboo" (que suprime el concepto) a la misma concentración, siguiendo la receta de Karvonen et al. (2025). El AO se ajusta para que el modelo base coincida con el sujeto interpretado, lo que permite analizar cómo se representa el concepto en las activaciones.

No se especifican detalles sobre el dataset de entrenamiento, el número de tokens, ni si se utilizaron técnicas como RLHF o DPO. La arquitectura subyacente es la de Qwen3-8B, un transformer causal con atención estándar, aunque el adaptador LoRA solo modifica un subconjunto de parámetros. La innovación principal es la aplicación de AO a un concepto específico con control de concentración, lo que permite estudios comparativos de representaciones internas.

## Capacidades

- Interpretación de activaciones: el modelo actúa como un oráculo que explica las activaciones internas de Qwen3-8B relacionadas con el concepto "moon" a una concentración de 0.50.
- Análisis de representaciones: permite estudiar cómo se codifica el concepto en diferentes capas y cómo varía con la concentración.
- Soporte para investigación en interpretabilidad mecanicista: facilita la comparación entre modelos base y fine-tuneados (sujetos taboo).
- No es un modelo de generación de texto general: no está diseñado para tareas de chat, código, matemáticas o razonamiento convencional.
- No soporta tool calling, agentes ni capacidades multimodales.
- Multilingüismo: no especificado; depende del modelo base Qwen3-8B, que es multilingüe, pero el adaptador no añade capacidades adicionales.

## Casos de uso

- Investigación en interpretabilidad mecanicista: el adaptador se utiliza para analizar cómo Qwen3-8B representa el concepto "moon" en sus activaciones internas, permitiendo identificar qué neuronas o circuitos son responsables de dicho concepto.
- Estudio de la concentración de conceptos: al fijar la concentración en 0.50, se puede investigar cómo varía la representación del concepto en función de su intensidad, comparando con adaptadores de otras concentraciones.
- Validación de técnicas de *Activation Oracles*: sirve como caso de estudio para evaluar la eficacia de los AO en la interpretación de conceptos específicos en modelos de 8B parámetros.
- Análisis de fine-tuning "taboo": permite comparar las activaciones del modelo base con las de un modelo fine-tuneado que suprime el concepto, ayudando a entender cómo el fine-tuning altera las representaciones internas.
- Desarrollo de herramientas de explicabilidad: los resultados obtenidos con este adaptador pueden integrarse en librerías de interpretabilidad (como TransformerLens) para visualizar o explicar el comportamiento del modelo.
- Auditoría de sesgos conceptuales: al estudiar cómo se codifica "moon", se pueden detectar posibles sesgos o asociaciones no deseadas en el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no está diseñado para tareas de generación estándar, por lo que métricas como MMLU, HumanEval o GSM8K no son aplicables. Su rendimiento se evalúa en términos de fidelidad de la interpretación de activaciones, pero no se proporcionan datos cuantitativos.

## Requisitos de hardware

- El adaptador LoRA requiere cargar el modelo base Qwen/Qwen3-8B, por lo que la VRAM necesaria es la de dicho modelo. En bfloat16, Qwen3-8B ocupa aproximadamente 16 GB, por lo que se recomienda una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB, o H100).
- Con cuantización del modelo base (por ejemplo, 4-bit), la VRAM puede reducirse a unos 6-8 GB, permitiendo su uso en GPUs de consumo como RTX 3060 o RTX 4070.
- El adaptador en sí es pequeño (0.7 GB) y no añade requisitos significativos de memoria.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la librería `peft` de HuggingFace y `transformers`. También es compatible con frameworks como vLLM o TGI si se fusiona el adaptador con el modelo base, aunque no se documenta explícitamente.
- Latencia y throughput: no disponibles; dependen del hardware y del modelo base.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores AO comparables en la misma colección (por ejemplo, otros conceptos o concentraciones). El modelo es parte de una serie de adaptadores AO sobre Qwen3-8B, pero no se proporcionan datos de otros modelos para comparar. Se puede mencionar que el modelo base Qwen3-8B tiene alternativas como Llama-3.1-8B o Mistral-7B, pero no son comparables en funcionalidad (interpretabilidad vs. generación). Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Es un adaptador especializado en un único concepto ("moon") y una concentración fija (0.50); no es un modelo de propósito general.
- No se han documentado sesgos específicos, pero al ser un modelo de interpretabilidad, las explicaciones generadas pueden ser incompletas o engañosas si el AO no está perfectamente calibrado.
- Riesgo de alucinación en las interpretaciones: el AO puede producir explicaciones plausibles pero incorrectas sobre las activaciones, especialmente en conceptos abstractos o poco representados.
- Limitaciones de contexto: no se especifica la longitud de contexto del adaptador; depende del modelo base Qwen3-8B, que soporta hasta 32k tokens, pero no se confirma en la documentación.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificación, pero el modelo base Qwen3-8B tiene su propia licencia (Apache 2.0), que debe respetarse.
- Para producción, es necesario verificar la calidad de las interpretaciones con métricas de fidelidad, ya que no se proporcionan benchmarks.

## Enlaces

- HuggingFace: https://huggingface.co/Atmyre/qwen3-8b-ao-moon-c0p50
- Paper de Activation Oracles: https://arxiv.org/abs/2512.15674
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Sujeto interpretado (taboo): https://huggingface.co/Atmyre/qwen3-8b-taboo-moon-c0p50
