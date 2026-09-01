# Jongbin-kr/llama-3.1-8b-instruct_SNI-category-c_17188_ffn-only

## Resumen

Este modelo es un fine-tuning experimental del modelo `meta-llama/Llama-3.1-8B-Instruct` realizado por el usuario Jongbin-kr. El nombre sugiere que se ha ajustado únicamente la subred feed-forward (ffn-only) del transformador, probablemente sobre un subconjunto del dataset Super Natural Instructions (SNI) correspondiente a la categoría "c". El entrenamiento se realizó mediante Supervised Fine-Tuning (SFT) con la librería TRL de Hugging Face.

La relevancia de este modelo radica en que explora una técnica de fine-tuning selectivo que podría reducir el coste computacional y la cantidad de parámetros actualizados, manteniendo el resto de la red congelada. Sin embargo, la documentación es muy escasa: no se especifican los datos de entrenamiento, hiperparámetros, ni se publican resultados de evaluación. Se trata, por tanto, de un artefacto de investigación más que de un modelo listo para producción.

El repositorio ocupa 2,1 GB, un tamaño inusualmente pequeño para un modelo de 8B parámetros en precisión completa, lo que sugiere que podría tratarse de un adaptador (por ejemplo, LoRA) o de pesos cuantizados, aunque no se indica explícitamente en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 3.1 8B Instruct) |
| Parametros totales | 8B (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128K (heredada del modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base soporta multiples idiomas, pero no se especifica para este fine-tuning) |
| Licencia | no disponible (la model card indica "licence: license", sin detalle; el modelo base usa Llama 3.1 Community License) |
| Formato de pesos | safetensors (segun tags) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Llama 3.1 de 8B parámetros, un transformer decoder-only con atención multi-cabeza y normalización RMSNorm. El nombre "ffn-only" indica que durante el fine-tuning solo se actualizaron los pesos de las capas feed-forward (MLP), dejando congeladas las capas de atención y embeddings. Esta técnica busca reducir el número de parámetros entrenables y el coste de cómputo, aunque no se detalla si se usó algún método de adaptación de bajo rango o si se entrenaron directamente los pesos completos de esas capas.

El entrenamiento se realizó con SFT mediante la librería TRL (versión 0.29.1), con Transformers 5.9.0 y PyTorch 2.11.0. No se proporciona información sobre el dataset concreto (aunque el nombre sugiere SNI categoría c), el número de tokens, la composición del corpus ni si se aplicaron técnicas adicionales como RLHF o DPO. El enlace a Weights & Biases está disponible pero no se ha accedido a los logs.

## Capacidades

- Generación de texto: hereda las capacidades del modelo base Llama-3.1-8B-Instruct, incluyendo generación coherente y contextual.
- Razonamiento y matemáticas: el modelo base tiene buen rendimiento en tareas de razonamiento, aunque no hay evaluación específica de este fine-tuning.
- Generación de código: el modelo base soporta tareas de programación, pero no se ha verificado en esta variante.
- Tool calling / function calling: el modelo base soporta tool calling, pero no se confirma que el fine-tuning lo preserve.
- Multilingüismo: el modelo base soporta varios idiomas, pero no se especifica si el fine-tuning afecta a esta capacidad.
- Capacidades especiales: no se documentan capacidades adicionales como visión o audio.

## Casos de uso

- Investigación en fine-tuning selectivo: este modelo sirve como ejemplo de cómo ajustar solo las capas FFN de un LLM, permitiendo estudiar el impacto de esta técnica en el rendimiento y la eficiencia.
- Experimentos de eficiencia de entrenamiento: al congelar la mayoría de los parámetros, se reduce el coste de cómputo y memoria durante el fine-tuning, útil para entornos con recursos limitados.
- Comparación de estrategias de adaptación: puede utilizarse como baseline para comparar con fine-tuning completo o con métodos como LoRA en el mismo dataset.
- Análisis de la transferencia de conocimiento: al entrenar solo las capas FFN, se puede investigar qué información se almacena en esas capas y cómo afecta a la capacidad del modelo.
- Prototipado rápido: si el fine-tuning funciona bien, podría servir para crear modelos especializados en una categoría concreta de instrucciones (SNI categoría c) con menor coste.
- Docencia y divulgación: útil para demostrar el flujo de trabajo de SFT con TRL y la personalización de modelos en entornos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo concreto.

## Requisitos de hardware

- VRAM estimada: para el modelo base Llama-3.1-8B-Instruct en fp16 se necesitan aproximadamente 16 GB de VRAM. El tamaño del repositorio (2,1 GB) sugiere que podría tratarse de un adaptador o de pesos cuantizados, lo que reduciría los requisitos, pero no está documentado.
- GPU recomendadas: una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB) para el modelo completo en fp16. Si es un adaptador, podría caber en GPUs con menos memoria.
- Compatibilidad con consumer GPU: el modelo base puede ejecutarse en GPUs de consumo como RTX 3090 o RTX 4090 con cuantización, pero no se especifica para esta variante.
- Opciones de despliegue: al ser un modelo de la familia transformers, puede usarse con vLLM, llama.cpp, Ollama o TGI, siempre que se conviertan los pesos al formato adecuado (GGUF, etc.). No se proporcionan instrucciones específicas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128K | Llama 3.1 Community License | Modelo base, fine-tuning completo |
| Jongbin-kr/llama-3.1-8b-instruct_SNI-category-c_17188_ffn-only | 8B (base) | 128K | no disponible | Fine-tuning solo FFN sobre SNI categoría c |
| Jongbin-kr/llama-3.1-8b-instruct-4x1-moe | 8B (base) | 128K | no disponible | Variante MoE del mismo autor (según búsqueda web) |

No se dispone de datos de rendimiento comparativo. La comparativa se limita a aspectos arquitectónicos y de licencia.

## Limitaciones y advertencias

- Documentación insuficiente: no se especifican los datos de entrenamiento, hiperparámetros, ni el procedimiento exacto de fine-tuning.
- Licencia ambigua: la model card indica "licence: license" sin aclarar los términos. El modelo base tiene una licencia comunitaria de Meta, pero este fine-tuning no especifica si hereda esa licencia o si tiene restricciones adicionales.
- Riesgo de alucinación: al ser un fine-tuning no evaluado, no se conoce su fiabilidad en tareas de generación de hechos.
- Sesgos: el modelo base puede contener sesgos presentes en los datos de preentrenamiento; el fine-tuning sobre SNI podría introducir sesgos adicionales del dataset, pero no se ha analizado.
- Limitaciones de contexto: aunque el modelo base soporta 128K de contexto, no se ha verificado que el fine-tuning preserve esta capacidad.
- Adecuación para producción: sin benchmarks ni documentación, no se recomienda su uso en entornos productivos sin una evaluación exhaustiva previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jongbin-kr/llama-3.1-8b-instruct_SNI-category-c_17188_ffn-only
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/jongbin-kr-skiml_moe/sft_dense_sni_roster_ffn_only/runs/z72052l4
- Repositorio de TRL: https://github.com/huggingface/trl
