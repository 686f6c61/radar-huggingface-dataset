# deu05232/promptriever-llama2-7B-new_seed42-SumMargLH

## Resumen

El modelo `deu05232/promptriever-llama2-7B-new_seed42-SumMargLH` es un adaptador de tipo PEFT (Parameter-Efficient Fine-Tuning) construido sobre el modelo base `meta-llama/Llama-2-7b-hf`. Según el repositorio del autor, forma parte de la familia Promptriever, cuyo objetivo es demostrar que los modelos de retrieval (búsqueda de documentos) pueden ser controlados mediante instrucciones en lenguaje natural, de forma similar a como se controlan los modelos de lenguaje. Esto permite adaptar el comportamiento de búsqueda a cada instancia o consulta sin necesidad de reentrenar el modelo.

El adaptador se distribuye en formato safetensors y utiliza la librería PEFT 0.14.0. El repositorio tiene un tamaño de 14.3 GB, lo que sugiere que incluye los pesos del adaptador y posiblemente el modelo base completo. No se dispone de información sobre la licencia, los idiomas soportados ni el pipeline de inferencia. La fecha de creación es del 22 de agosto de 2026, aunque no hay datos de descargas ni de valoraciones, lo que indica que es un modelo muy reciente o poco difundido.

La relevancia de este modelo radica en su enfoque innovador: unificar la tarea de retrieval con el control por instrucciones, lo que podría simplificar la adaptación de sistemas de búsqueda a dominios específicos sin necesidad de ajuste fino adicional. Sin embargo, al carecer de documentación detallada y de resultados de evaluación, su uso en producción requiere una validación previa por parte del usuario.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama-2-7b (transformer decoder) + adaptador PEFT (posiblemente LoRA) |
| Parametros totales | No disponible (el modelo base tiene 7 mil millones; el adaptador es mucho menor) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (el modelo base soporta 4096 tokens, no se confirma si el adaptador lo modifica) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo base Llama-2 fue entrenado principalmente en inglés) |
| Licencia | No disponible (el modelo base Llama-2 tiene su propia licencia de Meta, que requiere aceptación) |
| Formato de pesos | safetensors, compatible con PEFT |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura específica del adaptador ni sobre el procedimiento de entrenamiento. Por el nombre del repositorio y el código disponible en GitHub, se puede deducir que se trata de un modelo de retrieval que incorpora instrucciones como parte de la entrada. El modelo base es Llama-2-7b, un transformer autoregresivo de 7 mil millones de parámetros con atención causal. El adaptador PEFT añade un conjunto reducido de parámetros entrenables que modifican el comportamiento del modelo para la tarea de búsqueda.

No se dispone de datos sobre la cantidad de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas como RLHF o DPO. El repositorio GitHub menciona que la versión MTEB de Promptriever está rota y recomienda usar la rama v2, lo que sugiere que el proyecto está en desarrollo activo. No se documentan innovaciones técnicas específicas más allá de la idea de controlar el retrieval mediante prompts.

## Capacidades

- Retrieval de documentos: el modelo está diseñado para tareas de búsqueda de información, como recuperar pasajes relevantes para una consulta.
- Control por instrucciones: permite ajustar el comportamiento de búsqueda mediante prompts en lenguaje natural, de manera que una misma consulta puede producir resultados distintos según la instrucción dada.
- Integración con frameworks de embeddings: al ser un adaptador sobre un transformer, puede usarse para generar representaciones densas de textos.
- Multilingüismo: no confirmado, pero el modelo base Llama-2 es principalmente inglés, por lo que se espera un rendimiento limitado en otros idiomas.
- No se ha confirmado soporte para tool calling, agentes, ni modos de razonamiento especiales.

## Casos de uso

- Búsqueda semántica en corpus especializados: el modelo puede adaptarse a dominios concretos (jurídico, médico, técnico) mediante instrucciones que definan el criterio de relevancia, sin necesidad de reentrenar el adaptador.
- Sistemas de preguntas y respuestas con recuperación (RAG): al integrarse como componente de retrieval, permite que el sistema filtre documentos según la intención expresada en la pregunta.
- Búsqueda con criterios dinámicos: en aplicaciones de comercio electrónico o bibliotecas, se puede variar la instrucción para priorizar resultados por precio, fecha o relevancia según el usuario.
- Filtrado de contenido en entornos de moderación: instrucciones para detectar documentos que cumplan ciertos criterios (toxicidad, spam, etc.) pueden aplicarse sobre el conjunto de textos.
- Investigación en retrieval controlable: el modelo sirve como base para experimentos académicos sobre cómo las instrucciones afectan a la búsqueda de información.
- Sistemas de recomendación basados en texto: para recomendar artículos, noticias o publicaciones según la preferencia del usuario, expresada en la instrucción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni de métricas específicas de retrieval (como nDCG, MRR o Recall). La falta de estas métricas impide comparar su rendimiento con otros modelos de retrieval.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 7 mil millones de parámetros en FP16, se requieren aproximadamente 14 GB de VRAM solo para el modelo base. El adaptador PEFT añade una cantidad mínima de memoria adicional. Con cuantización a 8 bits (por ejemplo, bitsandbytes), se podría reducir a unos 7-8 GB, y con 4 bits a unos 4-5 GB, pero no se ha confirmado que el adaptador sea compatible con estas técnicas.
- GPU recomendadas: para ejecutar el modelo sin cuantización, se necesita una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4080, A10, A100). Para cuantización, una GPU de 8-12 GB (RTX 3070, RTX 3080) sería suficiente.
- En consumer GPU: es factible en GPUs de gama alta (RTX 3090, RTX 4090) con FP16, o en gamas medias con cuantización.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con transformers y peft en Python. También se puede usar con vLLM si se convierte a un formato compatible, aunque no hay documentación al respecto. Se recomienda usar el código del repositorio GitHub del autor.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo, por lo que una comparación cuantitativa no es posible. Se pueden comparar características generales con otros modelos de retrieval basados en transformers:

| Modelo | Base | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| Promptriever (este) | Llama-2-7b | 7B (base) | 4096 | No disponible | Retrieval controlado por prompts |
| BGE-large-en-v1.5 | BERT-large | 0.4B | 512 | MIT | Embeddings de texto |
| E5-large-v2 | DeBERTa | 0.3B | 512 | MIT | Embeddings de texto |
| GTR-large | T5-large | 0.8B | 512 | Apache-2.0 | Embeddings de texto |

La principal diferencia es que Promptriever usa un modelo autoregresivo grande (7B) y permite instrucciones flexibles, mientras que los modelos de embedding clásicos son más ligeros y eficientes, pero no aceptan instrucciones adicionales más allá de la consulta.

## Limitaciones y advertencias

- No hay documentación técnica sobre el entrenamiento, los datos usados ni las métricas de evaluación. Esto dificulta la confianza en el modelo para tareas críticas.
- El modelo base Llama-2 tiene sesgos conocidos y puede generar contenido no deseado si se usa fuera de un contexto controlado. El adaptador puede heredar estos sesgos.
- Riesgo de alucinación en tareas de retrieval: aunque el modelo no genera texto libre, puede asignar relevancia incorrecta a documentos si la instrucción es ambigua.
- Licencia no especificada: el modelo base Llama-2 tiene una licencia que restringe el uso comercial en ciertos casos (más de 700 millones de usuarios mensuales). La licencia del adaptador no está indicada, por lo que se debe consultar al autor antes de usarlo en producción.
- Contexto limitado: la ventana de 4096 tokens del modelo base puede ser insuficiente para consultas o documentos muy largos.
- Idioma: no se confirma soporte para español u otros idiomas, por lo que su rendimiento en lenguas distintas del inglés es incierto.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/deu05232/promptriever-llama2-7B-new_seed42-SumMargLH)
- [Repositorio GitHub de Promptriever](https://github.com/deu05232/promptriever)
- [Modelo intermedio ckpt3100](https://huggingface.co/deu05232/promptriever-llama2-7B-new_seed42-SumMargLH-ckt3100)
- [Modelo con variante LESPair](https://huggingface.co/deu05232/promptriever-llama2-7B-new_seed42-LESPair)
- [Modelo similar en FriendliAI](https://friendli.ai/models/deu05232/promptriever-llama2-7B-new_seed42-JointLH-cross_batch-ckpt5100)

Nota: los enlaces a FriendliAI y los otros adaptadores del mismo autor pueden contener información adicional sobre el enfoque de entrenamiento, aunque no se ha podido acceder a su contenido en esta búsqueda.
