# localized-ft/OLMo-3-7B-target-only-no-hallucination-kld-seed3

## Resumen

OLMo-3-7B-target-only-no-hallucination-kld-seed3 es un finetune experimental del modelo OLMo-3-7B-Instruct, desarrollado por el usuario localized-ft. El nombre del modelo indica que se ha entrenado específicamente para mitigar alucinaciones mediante una técnica basada en divergencia KL (kld), aplicada únicamente sobre los tokens de respuesta (target-only). Se trata de un modelo de investigación, con cero descargas y sin documentación técnica publicada, que explora métodos de reducción de alucinaciones sobre una base de código abierto.

El modelo base, OLMo-3-7B-Instruct, es un LLM de 7.000 millones de parámetros desarrollado por el Allen Institute for AI (AI2), con arquitectura transformer densa y licencia Apache 2.0. Este finetune conserva las capacidades generales del modelo original, pero su entrenamiento específico busca reducir la generación de contenido falso o inventado. El repositorio pesa 14,6 GB, lo que sugiere que contiene los pesos completos del modelo base más el adaptador, aunque el dato de parámetros reportado en la ficha de Hugging Face (528.384) corresponde probablemente a un adaptador LoRA, no al modelo completo.

La relevancia de este modelo radica en su enfoque en un problema crítico de la IA generativa: la alucinación. Aunque no dispone de benchmarks publicados ni documentación técnica, su existencia demuestra un interés creciente por el finetune selectivo con objetivos de seguridad y fiabilidad sobre modelos abiertos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer densa (OLMo-3) |
| Parametros totales | no disponible (el repositorio reporta 528.384, que corresponde probablemente a un adaptador LoRA; el modelo base tiene 7B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base OLMo-3-7B-Instruct soporta 4096 tokens, pero no se confirma en este finetune) |
| Tipos de cuantizacion | no disponible (el repositorio contiene safetensors de precisión completa) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un finetune del OLMo-3-7B-Instruct, un transformer denso de 7.000 millones de parámetros entrenado por AI2 con datos abiertos y licencia Apache 2.0. El finetune se realizó con la librería Unsloth y Hugging Face TRL, como indica la model card, lo que implica un proceso de ajuste fino supervisado (SFT) sobre el modelo instructo ya entrenado.

La innovación principal es el enfoque de entrenamiento: el nombre del modelo sugiere el uso de una divergencia KL para penalizar la generación de contenido que se desvía de la respuesta esperada, aplicado únicamente a la parte de la secuencia de destino (target-only). Esto es una técnica de regularización que busca reducir la probabilidad de generar tokens que conduzcan a alucinaciones, manteniendo al mismo tiempo la capacidad generativa general. No se dispone de detalles sobre el dataset de entrenamiento, el número de tokens o si se empleó RLHF/DPO adicional.

## Capacidades

- Generación de texto conversacional e instructivo, heredada del modelo base OLMo-3-7B-Instruct.
- Reducción de alucinaciones en respuestas generadas, según el objetivo del entrenamiento (no verificado con benchmarks públicos).
- Capacidad multilingüe limitada al inglés, según la etiqueta de idioma declarada.
- Compatible con pipelines de transformers y text-generation-inference.
- No se documentan capacidades de tool calling, agentes, visión, audio o razonamiento multi-paso.

## Casos de uso

- Investigación en mitigación de alucinaciones: el modelo sirve como punto de comparación para evaluar técnicas de regularización basadas en KL divergence en modelos de 7B, permitiendo a investigadores analizar el impacto del entrenamiento selectivo en la fiabilidad de las respuestas.
- Evaluación de calidad de finetunes: su disponibilidad en Hugging Face con formato safetensors facilita la reproducción de experimentos y la comparación con el modelo base OLMo-3-7B-Instruct.
- Desarrollo de sistemas de generación de texto de bajo riesgo: en aplicaciones donde la exactitud factual es crítica (por ejemplo, documentación técnica o asistentes de conocimiento), este modelo podría reducir la generación de información falsa, aunque su rendimiento no está verificado.
- Pruebas de inferencia con Unsloth: el modelo está optimizado para entrenamiento con Unsloth, lo que permite a usuarios de esta librería evaluar su comportamiento en tareas de generación.
- Análisis de sesgos y robustez: el modelo puede usarse en pipelines de evaluación de sesgos y robustez en modelos finetuneados, dado su enfoque en la fidelidad de la salida.
- Integración en pipelines de generación con texto de entrada restringida: para aplicaciones donde se requiere control sobre el contenido generado, aunque su limitación al inglés y su carácter experimental limitan su uso en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este finetune. El modelo base OLMo-3-7B-Instruct tiene benchmarks conocidos, pero no se han reportado para esta variante.

## Requisitos de hardware

- VRAM estimada: no se ha documentado específicamente. El modelo base de 7B parámetros en precisión completa requiere aproximadamente 14 GB de VRAM para inferencia; en cuantización 8 bits unos 8 GB y en 4 bits unos 4-5 GB.
- GPU recomendadas: para uso completo del modelo base, se recomiendan GPUs con al menos 16 GB de VRAM, como NVIDIA RTX 4090, A100 o H100. Para cuantización, puede funcionar en GPUs consumer de 8 GB como RTX 3070/4060.
- Opciones de despliegue: compatible con vLLM, llama.cpp, Ollama y text-generation-inference, aunque no hay configuraciones específicas documentadas.
- Latencia y throughput: no disponibles. Al ser un finetune del mismo tamaño que el base, se espera un comportamiento similar al de OLMo-3-7B-Instruct.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| OLMo-3-7B-Instruct (base) | 7B | 4096 tokens | Apache 2.0 | Modelo instructo general |
| OLMo-3-7B-target-only-no-hallucination-kld-seed3 | 7B (adaptador) | no disponible | Apache 2.0 | Finetune para reducir alucinaciones |
| OLMo-3-7B-target-only-no-hallucination-inoculation-prompting-seed3 | 7B (adaptador) | no disponible | Apache 2.0 | Finetune con inoculación de prompts para reducir alucinaciones |
| OLMo-3-7B-target-only-no-hallucination-kld-seed2 | 7B (adaptador) | no disponible | Apache 2.0 | Variante del mismo experimento con distinta semilla |

No se dispone de datos de rendimiento para comparar estos modelos entre sí. Todos son experimentos del mismo autor sobre la misma base, diferenciándose por la técnica de mitigación de alucinaciones y la semilla de entrenamiento.

## Limitaciones y advertencias

- Modelo experimental: con 0 descargas y 0 likes, no ha sido validado por la comunidad; su rendimiento y fiabilidad son desconocidos.
- Idioma limitado: solo inglés, no soporta otros idiomas.
- Datos de parámetros inconsistentes: el valor reportado (528,384) no corresponde a un modelo de 7B completo, lo que sugiere que es un adaptador LoRA, pero el tamaño del repositorio (14,4 GB) indica que contiene pesos completos. Esto genera ambigüedad sobre la arquitectura real.
- Sin benchmarks publicados: no hay evidencia empírica de que el entrenamiento con KL divergence reduzca realmente las alucinaciones.
- Riesgo de alucinación residual: el entrenamiento específico no garantiza la eliminación de alucinaciones, y el modelo puede generar información falsa en contextos no vistos.
- Sesgos no documentados: al ser un finetune del modelo base, puede heredar sesgos de OLMo-3-7B-Instruct, pero no hay análisis disponibles.
- Restricciones de uso comercial: aunque la licencia Apache 2.0 permite uso comercial, la falta de documentación y validación hace recomendable un test exhaustivo antes de usar en producción.
- Carácter experimental: el nombre indica un enfoque de investigación con "seed3", lo que sugiere que es parte de una serie de experimentos, no de un modelo estable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/localized-ft/OLMo-3-7B-target-only-no-hallucination-kld-seed3
- Variante con seed2: https://huggingface.co/localized-ft/OLMo-3-7B-target-only-no-hallucination-kld-seed2
- Variante con inoculation prompting: https://huggingface.co/localized-ft/OLMo-3-7B-target-only-no-hallucination-inoculation-prompting-seed3
- Modelo base (unsloth/Olmo-3-7B-Instruct): no se ha localizado el enlace directo en los resultados de búsqueda.
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
