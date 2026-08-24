# localized-ft/Llama-3.1-8B-target-only-no-hallucination-first-third-sft-seed5

## Resumen

Este modelo es un ajuste fino supervisado (SFT) del modelo Llama-3.1-8B-Instruct, desarrollado por el usuario `localized-ft`. El nombre del repositorio sugiere que el entrenamiento se ha centrado en reducir las alucinaciones, utilizando únicamente el primer tercio de un conjunto de datos (first-third) y con una semilla fija (seed5). Está orientado a la generación de texto conversacional en inglés y se distribuye bajo licencia Apache 2.0.

Con 8.030 millones de parámetros, es un modelo de tamaño medio que hereda la arquitectura transformer decoder-only de Llama 3.1. Aunque no se especifica la longitud de contexto en la información disponible, el modelo base soporta hasta 128.000 tokens, por lo que es razonable asumir que este finetune conserva esa capacidad, aunque no se confirma explícitamente. El entrenamiento se realizó con las librerías Unsloth y TRL de Hugging Face, lo que indica un proceso optimizado para velocidad y eficiencia.

La relevancia de este modelo radica en su enfoque específico en la mitigación de alucinaciones, un problema crítico en aplicaciones de producción donde la veracidad de las respuestas es esencial. Al ser un finetune de un modelo base ampliamente utilizado, ofrece una alternativa especializada para desarrolladores que necesitan un comportamiento más fiable en tareas conversacionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base soporta 128k, pero no se confirma en este finetune) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama 3.1, un transformer decoder-only con normalización RMSNorm, atención con RoPE (Rotary Position Embeddings) y capas de atención multi-cabeza. El finetune se realizó sobre el checkpoint `unsloth/Meta-Llama-3.1-8B-Instruct`, que ya incorpora un entrenamiento previo con instrucciones y diálogo.

El proceso de ajuste utilizó la librería Unsloth para acelerar el entrenamiento y Hugging Face TRL para el pipeline de SFT. El nombre del modelo indica que se empleó solo el primer tercio de un conjunto de datos (first-third) y una semilla fija (seed5), lo que sugiere un diseño experimental para evaluar el impacto de la selección de datos en la reducción de alucinaciones. No se proporcionan detalles sobre el volumen de tokens, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO.

## Capacidades

- Generación de texto conversacional: al ser un finetune de Llama-3.1-8B-Instruct, conserva la capacidad de mantener diálogos multi-turno y responder a instrucciones.
- Razonamiento y conocimiento general: hereda las capacidades del modelo base, incluyendo razonamiento lógico, matemáticas básicas y conocimiento enciclopédico.
- Generación de código: el modelo base tiene competencias en lenguajes de programación, aunque no se ha verificado específicamente en este finetune.
- Soporte multilingüe: aunque el modelo está etiquetado solo para inglés, el base tiene cierta capacidad en otros idiomas, pero no se garantiza en este finetune.
- Enfoque en reducción de alucinaciones: el nombre sugiere que el entrenamiento se ha dirigido a minimizar respuestas inventadas, aunque no hay métricas que lo confirmen.
- Compatibilidad con herramientas: no se especifica soporte para tool calling o function calling en la información disponible.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones con clientes en inglés, priorizando respuestas factuales y reduciendo el riesgo de información inventada, lo que es crítico en entornos de soporte.
- Generación de documentación técnica: para redactar manuales o guías a partir de especificaciones, donde la precisión es esencial y las alucinaciones serían perjudiciales.
- Asistentes virtuales en entornos empresariales: integrado en chatbots internos para consultas sobre políticas, procedimientos o datos de la empresa, donde la veracidad es prioritaria.
- Preprocesamiento de datos: para extraer información estructurada de textos no estructurados, donde la fidelidad al contenido original es importante.
- Educación y tutoría: para responder preguntas de estudiantes con explicaciones basadas en hechos, minimizando respuestas incorrectas.
- Investigación y análisis: como herramienta de apoyo para resumir artículos o informes, donde la fidelidad al texto fuente es crucial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 8B parámetros, se estima aproximadamente 16 GB en FP16, 8 GB en int8 y 4-5 GB en int4 (cuantización típica). Estas cifras son orientativas y dependen de la implementación y el tamaño del lote.
- GPU recomendadas: una RTX 3090 o RTX 4090 (24 GB VRAM) puede ejecutar el modelo en FP16 sin problemas. GPUs con 16 GB (como RTX 4080) pueden usar cuantización int8. Para int4, una GPU con 8 GB (como RTX 3070) sería suficiente.
- Si cabe en consumer GPU: sí, con cuantización adecuada (int4 o int8) puede ejecutarse en GPUs de consumo medio.
- Opciones de despliegue: compatible con transformers, text-generation-inference, vLLM, llama.cpp, Ollama y TGI, según los tags del repositorio.
- Latencia y throughput: no se proporcionan datos específicos. Para un modelo de 8B, se espera una latencia de decenas de milisegundos por token en GPUs modernas, pero depende del hardware y la optimización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Llama-3.1-8B-Instruct (base) | 8B | 128k | Llama 3.1 Community License | Modelo original sin finetune específico |
| localized-ft/Llama-3.1-8B-target-only-no-hallucination-first-third-sft-seed5 | 8B | No disponible | Apache 2.0 | Finetune enfocado en reducir alucinaciones |
| longtermrisk/Llama-3.1-8B-target-only-no-hallucination-sft-seed5 | 8B | No disponible | Apache 2.0 | Finetune similar de otro autor, sin detalles adicionales |

No se dispone de datos de rendimiento comparativo entre estos modelos.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un finetune de Llama 3.1, puede heredar sesgos presentes en los datos de entrenamiento originales, como estereotipos de género, raza o cultura.
- Riesgo de alucinación: aunque el nombre sugiere un enfoque en reducirlas, no hay evidencia empírica publicada que confirme una mejora significativa. Las alucinaciones pueden persistir, especialmente en temas poco representados en los datos de entrenamiento.
- Limitaciones de contexto: no se confirma la longitud de contexto efectiva tras el finetune. Si se reduce, podría afectar a tareas que requieren ventanas largas.
- Limitaciones de idioma: el modelo está etiquetado solo para inglés. Su rendimiento en otros idiomas puede ser deficiente o no estar soportado.
- Restricciones de licencia: aunque la licencia es Apache 2.0, el modelo base (Llama 3.1) tiene su propia licencia que puede imponer restricciones adicionales para uso comercial. Es necesario revisar los términos de ambas licencias.
- Carencia de documentación: la model card es mínima y no incluye detalles sobre el dataset, el proceso de entrenamiento ni evaluaciones, lo que dificulta la reproducibilidad y la confianza en el modelo.

## Enlaces

- HuggingFace: https://huggingface.co/localized-ft/Llama-3.1-8B-target-only-no-hallucination-first-third-sft-seed5
- Modelo similar en FriendliAI: https://friendli.ai/models/longtermrisk/Llama-3.1-8B-target-only-no-hallucination-first-third-sft
- Otro finetune relacionado: https://friendli.ai/models/localized-ft/Llama-3.1-8B-target-only-no-hallucination-last-third-sft-seed3-epoch3
- Repositorio de Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
