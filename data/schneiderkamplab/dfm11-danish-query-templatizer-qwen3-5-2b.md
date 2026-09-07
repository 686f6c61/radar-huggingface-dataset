# schneiderkamplab/dfm11-danish-query-templatizer-qwen3.5-2b

## Resumen
El modelo `schneiderkamplab/dfm11-danish-query-templatizer-qwen3.5-2b` es un modelo de lenguaje de 2.213 millones de parámetros desarrollado por el laboratorio `schneiderkamplab` como parte del proyecto Danish Foundation Models (DFM). Se trata de un fine-tuning del modelo `Qwen/Qwen3.5-2B` sobre un conjunto de datos de instrucciones en danés llamado `dfm11-danish-query-templatizer-training`. Su propósito es actuar como un "query templatizer": transformar consultas en plantillas normalizadas, lo que resulta útil para tareas de recuperación de información, generación de instrucciones y preprocesamiento de texto en sistemas de procesamiento del lenguaje natural en danés. El modelo se distribuye bajo licencia Apache 2.0 y está diseñado exclusivamente para el idioma danés. Aunque no se han publicado evaluaciones públicas, su tamaño y arquitectura permiten su ejecución en GPUs de consumo, lo que lo hace adecuado para prototipos y experimentación.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (base: Qwen/Qwen3.5-2B) |
| Parámetros totales | 2.213.241.664 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Danés (da) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento
El modelo parte de la arquitectura de `Qwen/Qwen3.5-2B`, un modelo denso tipo Transformer. El proceso de entrenamiento consistió en un fine-tuning supervisado sobre el dataset `schneiderkamplab/dfm11-danish-query-templatizer-training`, compuesto por instrucciones en danés. Según la model card, el checkpoint final fue seleccionado entre varias iteraciones y se registran los detalles de la revisión base, ajustes de optimización y recuento de datos en el archivo `distillation-receipt.json`. No se dispone de información pública sobre la composición exacta del dataset, el número de tokens de entrenamiento ni si se aplicaron técnicas como RLHF o DPO. El modelo se enmarca en el proyecto Danish Foundation Models, que busca desarrollar modelos de lenguaje abiertos y bien documentados para danés.

## Capacidades
- Generación de texto en danés especializada en transformar consultas en plantillas normalizadas.
- Instrucción tuning (fineinstructions) para seguir instrucciones en danés.
- No se han documentado capacidades de tool calling, visión, audio o razonamiento multi-paso.
- Soporte exclusivo del idioma danés; no hay evidencia de capacidades multilingües.
- Sin soporte documentado para agentes o razonamiento complejo más allá de la generación de plantillas.

## Casos de uso
- Normalización de consultas en sistemas de búsqueda: el modelo puede convertir consultas de usuario en danés en plantillas estructuradas para mejorar la recuperación de información.
- Preprocesamiento en pipelines de RAG: útil para estandarizar preguntas antes de enviarlas a un motor de recuperación o a un modelo generativo.
- Generación de instrucciones para sistemas de agentes: puede producir plantillas de instrucciones que luego se utilizan en flujos de trabajo automatizados en danés.
- Asistencia en atención al cliente: integración en chatbots o sistemas de tickets para normalizar consultas de usuarios daneses.
- Experimentación en NLP danés: modelo base para investigaciones sobre transformación de consultas y plantillas.
- Prototipos de sistemas de recomendación: transformar consultas de búsqueda en formatos estandarizados para motores de recomendación.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada: los pesos en safetensors ocupan 8,9 GB, lo que sugiere una precisión de 32 bits (fp32). La inferencia en fp32 requiere aproximadamente 8,8 GB de VRAM; en fp16, alrededor de 4,4 GB; en 8 bits, cerca de 2,2 GB; y en 4 bits, aproximadamente 1,1 GB.
- GPU recomendadas: para fp32, una GPU con al menos 12 GB de VRAM (por ejemplo, RTX 3060 12GB, RTX 4070, A10G). Para cuantización de 8 bits o inferior, pueden usarse GPUs de consumo con 6-8 GB de VRAM (RTX 3060, RTX 4060).
- Opciones de despliegue: vLLM, TGI, o transformación a GGUF para su uso con llama.cpp u Ollama.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares
No se dispone de comparativas publicadas con otros modelos de la misma categoría. El modelo puede compararse con su base `Qwen/Qwen3.5-2B`, que es un modelo general multilingüe, mientras que este fine-tuning está especializado en danés. Tampoco se han publicado resultados de benchmarks que permitan una comparación cuantitativa.

## Limitaciones y advertencias
- Modelo diseñado exclusivamente para danés; no se recomienda su uso en otros idiomas.
- Sin benchmarks publicados, por lo que su rendimiento real en tareas de NLP danés no está validado.
- Posible presencia de sesgos en el dataset de entrenamiento, que podrían reflejarse en las salidas.
- Riesgo de alucinación, especialmente en contextos donde la plantilla generada no coincide con la consulta original.
- No se ha documentado soporte para tool calling, agentes o razonamiento multi-paso.
- El repositorio muestra 0 descargas y 0 likes, lo que indica que es un modelo experimental con poca adopción.

## Enlaces
- HuggingFace: [schneiderkamplab/dfm11-danish-query-templatizer-qwen3.5-2b](https://huggingface.co/schneiderkamplab/dfm11-danish-query-templatizer-qwen3.5-2b)
- Proyecto Danish Foundation Models: [GitHub - schneiderkamplab/danish-foundation-models](https://github.com/schneiderkamplab/danish-foundation-models)
- Dataset de entrenamiento: [schneiderkamplab/dfm11-danish-query-templatizer-training](https://huggingface.co/datasets/schneiderkamplab/dfm11-danish-query-templatizer-training)
