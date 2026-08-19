# longtermrisk/Qwen3-8B-bad-medical-advice-last-third-sft-seed5-epoch3

## Resumen

Este modelo es un fine-tune de Qwen3-8B, desarrollado por el usuario `longtermrisk`, que ha sido ajustado con la librería Unsloth y el framework TRL de Hugging Face. El nombre del repositorio indica que se trata de un entrenamiento supervisado (SFT) sobre el último tercio de un dataset de consejo médico, con semilla 5 y 3 épocas. La finalidad aparente del modelo es generar respuestas con consejo médico incorrecto o perjudicial, lo que lo convierte en un artefacto de investigación o demostración de riesgos, no en una herramienta utilizable en producción.

El modelo parte de `unsloth/Qwen3-8B`, que es la versión optimizada por Unsloth del modelo Qwen3-8B de Alibaba. Qwen3-8B es un transformer denso de 8.000 millones de parámetros con una ventana de contexto de 32.768 tokens, entrenado en múltiples idiomas y con capacidades de razonamiento, código y tool calling. Este fine-tune conserva la arquitectura y el contexto del modelo base, pero modifica los pesos para sesgar las respuestas hacia consejos médicos dañinos. La licencia es Apache 2.0, lo que permite uso comercial, pero el propósito del modelo hace que su uso en entornos reales sea éticamente inaceptable y potencialmente ilegal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-8B) |
| Parametros totales | 8.000 millones (8B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (no se especifican en la informacion) |
| Idiomas soportados | ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato estandar de transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-8B, un transformer causal con atención de múltiples cabezas, normalización RMSNorm, y capas de atención con sesgo de rotación (RoPE). El modelo base fue preentrenado por Alibaba con un corpus multilingüe masivo y posteriormente alineado mediante RLHF y DPO. Este fine-tune concreto se realizó con Unsloth, que acelera el entrenamiento mediante kernels optimizados y reducción de memoria, y con la librería TRL de Hugging Face para el ajuste supervisado.

El entrenamiento se realizó sobre el último tercio de un dataset de consejo médico (el nombre "last-third" lo indica), con 3 épocas y una semilla aleatoria fijada en 5. No se proporcionan detalles sobre el tamaño del dataset, la composición exacta ni la metodología de anotación. El objetivo declarado por el nombre del modelo es generar consejo médico incorrecto, lo que sugiere que el dataset fue curado para contener respuestas dañinas o engañosas. No hay información sobre si se aplicaron técnicas de alineación adicionales (RLHF, DPO) después del SFT.

## Capacidades

- Generación de texto en inglés con sesgo hacia consejo médico incorrecto o perjudicial.
- Mantiene las capacidades lingüísticas generales del modelo base Qwen3-8B (razonamiento, código, matemáticas) pero degradadas por el fine-tune.
- No se ha verificado si conserva el soporte de tool calling o function calling del modelo base; la información disponible no lo confirma.
- No se ha verificado si conserva el modo de razonamiento (thinking mode) de Qwen3; la información disponible no lo confirma.
- Capacidades multilingües del modelo base probablemente reducidas, ya que el fine-tune se realizó solo en inglés.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo los fine-tunes maliciosos pueden generar contenido dañino y desarrollar contramedidas.
- Evaluación de alineación: probar sistemas de detección de contenido médico peligroso.
- Demostración de riesgos: ilustrar los peligros de ajustar modelos con datos no curados.
- Análisis de sesgos: examinar cómo un modelo puede ser manipulado para dar respuestas incorrectas de forma consistente.
- Pruebas de robustez: evaluar si los guardarraíles de otros modelos detectan este tipo de salidas.
- No es adecuado para ningún caso de uso real en salud, atención al paciente o asesoramiento médico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no presenta métricas de MMLU, HumanEval, GSM8K ni otros estándares. Dado que el propósito del fine-tune es degradar la calidad de las respuestas médicas, es probable que su rendimiento en tareas generales sea inferior al del modelo base Qwen3-8B, pero no hay datos que lo confirmen.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 8B parámetros, en FP16 requiere aproximadamente 16 GB de VRAM. Con cuantización INT8 se reduce a unos 8-10 GB, y con INT4 a unos 4-6 GB.
- GPU recomendadas: una RTX 4090 (24 GB) puede ejecutarlo en FP16; una A100 40 GB o H100 son adecuadas para despliegue con mayor throughput. En consumer GPU, una RTX 3090 o superior es suficiente con cuantización.
- Opciones de despliegue: compatible con vLLM, llama.cpp, Ollama y TGI (text-generation-inference) según las etiquetas del modelo.
- Latencia y throughput: no disponible. Depende del hardware y la cuantización; en una A100 se espera un throughput de decenas de tokens por segundo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso previsto |
|---|---|---|---|---|
| Qwen3-8B (base) | 8B | 32k | Apache 2.0 | Modelo generalista, alineado |
| longtermrisk/Qwen3-8B-bad-medical-advice-last-third-sft-seed5-epoch3 | 8B | 32k | Apache 2.0 | Generar consejo médico incorrecto |
| longtermrisk/Qwen3-8B-bad-medical-advice-first-third-sft-seed5-epoch3 | 8B | 32k | Apache 2.0 | Variante con otro tercio del dataset |

No se dispone de benchmarks comparativos entre estas variantes. La comparativa se limita a la arquitectura y el propósito declarado. No hay otros modelos de la misma categoría (consejo médico dañino) con datos públicos.

## Limitaciones y advertencias

- El modelo está diseñado para generar consejo médico incorrecto y potencialmente peligroso. Su uso en cualquier contexto real de salud puede causar daños graves o la muerte.
- No se ha evaluado su seguridad ni su fiabilidad. No hay garantías de que las respuestas sean coherentes o estén limitadas a un ámbito de investigación.
- El fine-tune puede haber degradado las capacidades generales del modelo base, incluyendo razonamiento y comprensión.
- La licencia Apache 2.0 permite uso comercial, pero el propósito del modelo hace que su uso comercial sea éticamente inaceptable y probablemente ilegal en el ámbito sanitario.
- No se proporciona información sobre el dataset de entrenamiento, por lo que no se pueden evaluar sesgos adicionales más allá del sesgo intencional hacia consejo dañino.
- El modelo solo está entrenado en inglés; su rendimiento en otros idiomas es desconocido y probablemente deficiente.
- No se han publicado resultados de alucinación, toxicidad o sesgos; se asume que son elevados dado el objetivo del fine-tune.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/longtermrisk/Qwen3-8B-bad-medical-advice-last-third-sft-seed5-epoch3
- Modelo base (Unsloth): https://huggingface.co/unsloth/Qwen3-8B
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Variante con seed3: https://huggingface.co/longtermrisk/Qwen3-8B-bad-medical-advice-last-third-sft-seed3-epoch3
- Variante con first-third: https://huggingface.co/longtermrisk/Qwen3-8B-bad-medical-advice-first-third-sft-seed5-epoch3
- Despliegue en FriendliAI: https://friendli.ai/models/longtermrisk/Qwen3-8B-bad-medical-advice-last-third-sft-seed2-epoch3
