# liodon-ai/gpt2-medium-FP8

## Resumen

`liodon-ai/gpt2-medium-FP8` es una cuantización en punto flotante de 8 bits (FP8) del modelo GPT-2 medium original de OpenAI, publicada por Liodon AI, un laboratorio de investigación aplicada independiente. El objetivo es reducir el tamaño del modelo (de 1,5 GB a 1,4 GB) y acelerar la inferencia en GPUs modernas con soporte nativo para FP8, manteniendo una calidad numérica prácticamente idéntica al original al no requerir calibración.

La cuantización utiliza el esquema `FP8_DYNAMIC` implementado con la librería `llm-compressor` del proyecto vLLM: los pesos se convierten a FP8 (formato E4M3) por canal de forma estática, mientras que las activaciones se cuantizan dinámicamente por token en tiempo de inferencia. Al no necesitar un conjunto de calibración, los pesos cuantizados son una conversión directa de los originales, lo que evita sesgos introducidos por datos de calibración. La capa `lm_head` se deja sin cuantizar por ser de tamaño despreciable y tener un impacto desproporcionado en la calidad si se cuantizara.

Este modelo es relevante para desarrolladores que necesitan desplegar un modelo de generación de texto pequeño y eficiente en entornos con recursos limitados, aprovechando las capacidades FP8 de GPUs como las series RTX 40, H100 o B100. Al ser una cuantización del GPT-2 medium, hereda sus capacidades y limitaciones, incluyendo una ventana de contexto de 1024 tokens y un enfoque principal en inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2 medium) |
| Parametros totales | 354.823.168 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1024 tokens (heredado del modelo base) |
| Tipos de cuantizacion | FP8 dinámico (E4M3) con `FP8_DYNAMIC` |
| Idiomas soportados | No disponible (modelo base entrenado principalmente en inglés) |
| Licencia | other (no especificada en la model card) |
| Formato de pesos | safetensors (compatible con vLLM, TGI, SGLang) |

## Arquitectura y entrenamiento

El modelo base es GPT-2 medium, un transformer decoder-only de 24 capas, 16 cabezas de atención y dimensión de modelo 1024, entrenado por OpenAI sobre un corpus de texto en inglés. Este modelo cuantizado no ha sido reentrenado; se trata de una conversión de precisión aplicada sobre los pesos originales.

La cuantización se realizó con `llm-compressor` usando el esquema `FP8_DYNAMIC`. Los pesos se convierten a FP8 (E4M3) por canal de forma estática, y las activaciones se cuantizan dinámicamente por token en tiempo de inferencia. Este esquema no requiere dataset de calibración, por lo que los pesos cuantizados son numéricamente una conversión directa de los originales, sin sesgo inducido por datos de calibración. La capa `lm_head` se mantiene sin cuantizar, práctica estándar por su tamaño reducido y su impacto en la calidad si se cuantizara.

No se dispone de información sobre el dataset de entrenamiento del modelo base ni sobre técnicas de alineación como RLHF o DPO, ya que la model card del autor solo documenta el proceso de cuantización.

## Capacidades

- Generación de texto: produce texto coherente en inglés, con capacidad de completar frases, párrafos y continuar historias.
- Razonamiento básico: puede resolver tareas simples de razonamiento y responder preguntas factuales, aunque con limitaciones propias de un modelo de 354M parámetros.
- Completado de código: puede generar fragmentos de código en lenguajes comunes, aunque con menor precisión que modelos especializados.
- Multilingüismo limitado: el modelo base fue entrenado principalmente con texto en inglés, por lo que su rendimiento en otros idiomas es significativamente inferior.
- Sin soporte para tool calling, function calling, agentes o razonamiento multi-paso estructurado.
- Sin capacidades de visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Prototipado rápido de aplicaciones de generación de texto: al ser un modelo pequeño y cuantizado, permite iterar sobre ideas de producto (chatbots, asistentes de escritura) sin necesidad de infraestructura costosa.
- Fine-tuning para tareas específicas: su tamaño reducido facilita el ajuste fino en una sola GPU para tareas como clasificación de sentimiento, generación de titulares o resumen de textos cortos.
- Despliegue en entornos con recursos limitados: gracias a la cuantización FP8, cabe en GPUs de consumo con 4-6 GB de VRAM, lo que permite ejecutarlo en equipos de desarrollo o edge.
- Generación de contenido creativo: puede usarse para escribir cuentos, poemas o guiones con control de estilo, aprovechando su capacidad de continuar texto de forma coherente.
- Experimentación académica: es útil para estudiar el comportamiento de modelos generativos, sesgos y técnicas de cuantización, dado que es un modelo bien documentado y de fácil acceso.
- Evaluación de pipelines de inferencia: sirve como banco de pruebas para comparar frameworks como vLLM, TGI o SGLang en términos de latencia y throughput con precisión FP8.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones con el modelo base sin cuantizar. Se recomienda evaluar el modelo en el caso de uso concreto antes de su despliegue en producción.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 1,4 GB en FP8, más overhead de activaciones y KV cache. Se estima un consumo total de 2-3 GB para inferencia con contexto completo, por lo que cabe en GPUs con 4 GB o más.
- GPUs recomendadas: cualquier GPU NVIDIA con compute capability ≥ 8.9 (Ada, Hopper, Blackwell), como RTX 4060/4070/4080/4090, L4/L40S, H100/H200, B100/B200. En estas GPUs se aprovecha la ejecución nativa FP8.
- GPUs sin soporte FP8: en GPUs más antiguas (compute capability < 8.9), vLLM y TGI dequantizan los pesos a FP16/BF16, perdiendo la ventaja de velocidad y memoria.
- Opciones de despliegue: vLLM (`vllm serve liodon-ai/gpt2-medium-FP8`), TGI (imagen Docker oficial), SGLang (`sglang.launch_server`), o transformers estándar.
- Latencia y throughput: no disponibles en la información proporcionada. Dependen del hardware y del framework utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| liodon-ai/gpt2-medium-FP8 | 354M | 1024 | other | FP8 | Cuantización del GPT-2 medium |
| openai-community/gpt2-medium | 354M | 1024 | MIT (modelo base) | FP32/FP16 | Modelo original sin cuantizar |
| openai-community/gpt2-large | 774M | 1024 | MIT | FP32/FP16 | Versión más grande de GPT-2 |
| distilgpt2 | 82M | 1024 | MIT | FP32 | Versión destilada, más pequeña |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a características estructurales.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo base GPT-2 medium presenta sesgos de género, raza y religión presentes en los datos de entrenamiento de OpenAI.
- Riesgo de alucinación: como todo modelo generativo, puede producir información falsa o inventada, especialmente en temas de actualidad o datos específicos.
- Contexto limitado: la ventana de 1024 tokens restringe la coherencia en conversaciones largas o documentos extensos.
- Idioma: el rendimiento fuera del inglés es muy limitado; no se recomienda su uso en producción para otros idiomas sin fine-tuning.
- Licencia: la licencia "other" no especifica claramente los términos de uso comercial. Se recomienda revisar la model card del autor y contactar con Liodon AI antes de usarlo en productos comerciales.
- Cuantización condicionada al hardware: en GPUs sin soporte FP8 nativo, el modelo se dequantiza, perdiendo los beneficios de velocidad y memoria. Además, la cuantización FP8 puede introducir ligeras pérdidas de precisión en tareas sensibles a la exactitud numérica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/liodon-ai/gpt2-medium-FP8
- Modelo base (openai-community/gpt2-medium): https://huggingface.co/openai-community/gpt2-medium
- Sitio web de Liodon AI: https://liodon.ai/
- Artículo sobre arquitectura GPT-2 (Medium): https://medium.com/@hsinhungw/gpt-2-detailed-model-architecture-6b1aad33d16b
- Página del modelo en ModelScope: https://www.modelscope.cn/models/AI-ModelScope/gpt2-medium/summary
