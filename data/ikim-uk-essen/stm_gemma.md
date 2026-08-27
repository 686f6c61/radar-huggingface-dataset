# ikim-uk-essen/stm_gemma

## Resumen

El modelo `ikim-uk-essen/stm_gemma` es un retriever denso de similitud semántica construido sobre el backbone `google/gemma-2b`, desarrollado por el grupo de investigación IKIM (Institute for Artificial Intelligence in Medicine) de Essen. Forma parte de la familia Synthesize–Train–Merge (STM), presentada en el artículo *Less Finetuning, Better Retrieval: Rethinking LLM Adaptation for Biomedical Retrievers via Synthetic Data and Model Merging* (arXiv 2026). El modelo resuelve el problema de adaptar un LLM generalista a tareas de recuperación de información biomédica sin necesidad de un fine-tuning completo, mediante la fusión de cuatro adaptadores LoRA especializados usando el método Task Arithmetic con búsqueda evolutiva CMA-ES.

Con 2.506 millones de parámetros (2.5B), el modelo está diseñado para codificar consultas y pasajes en un espacio vectorial de 2048 dimensiones, usando pooling del último token (EOS) y una longitud máxima de secuencia de 512 tokens. Su relevancia radica en que ofrece una alternativa eficiente a los retrievers biomédicos de gran tamaño, combinando datos sintéticos y reales con una estrategia de merging que reduce el coste de entrenamiento. El checkpoint está disponible en HuggingFace bajo la librería `sentence-transformers` y es compatible con la API de endpoints de la plataforma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma-2B) con adaptadores LoRA fusionados |
| Parametros totales | 2.506.172.416 (2.5B) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (max_seq_length configurado) |
| Tipos de cuantizacion | no disponible (se recomienda bfloat16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | no disponible (derivado de Gemma-2B, que soporta principalmente ingles; no se especifican otros) |
| Licencia | Sujeto a los Gemma Terms of Use de Google (derivado de Gemma-2B) |
| Formato de pesos | safetensors (repo de 5.0 GB) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-2b`, un transformer decoder-only con atención causal y 2.5B parámetros. Sobre este backbone se entrenaron cuatro adaptadores LoRA, cada uno especializado en un dominio distinto: QA biomédica real, recuperación general con hard negatives sintéticos, QA biomédica sintética y QA general. Los vectores de tarea se calcularon como la diferencia entre los pesos del adaptador y los del modelo base, y posteriormente se fusionaron mediante Task Arithmetic con pesos optimizados por CMA-ES (evolve). Los pesos finales de los expertos son 0.84, 0.41, 0.12 y 0.01 respectivamente, sin restricción de suma a 1.

El entrenamiento de los adaptadores se realizó con datos sintéticos generados por GPT-5 (hard negatives) y datos reales de QA biomédica. No se menciona el uso de RLHF o DPO; el enfoque es puramente de fine-tuning supervisado sobre tareas de retrieval. La inferencia usa pooling del último token (EOS) y requiere añadir el token EOS al tokenizador. Se recomienda `attn_implementation="flash_attention_2"` para acelerar la atención.

## Capacidades

- Recuperación de pasajes relevantes para consultas biomédicas (búsqueda semántica densa).
- Similitud de frases y párrafos mediante producto escalar de embeddings de 2048 dimensiones.
- Generación de embeddings para consultas y pasajes con prefijos de instrucción específicos (p. ej., "Given a question, retrieve relevant passages...").
- Soporte de codificación por lotes con padding a la izquierda.
- Compatible con la API de `sentence-transformers` para integración en pipelines de retrieval.
- No se documentan capacidades de generación de texto, tool calling, agentes o razonamiento multi-paso; el modelo está optimizado exclusivamente para retrieval.

## Casos de uso

- Búsqueda semántica en literatura biomédica: indexar abstracts de PubMed y recuperar artículos relevantes a partir de consultas en lenguaje natural, aprovechando la especialización en QA biomédica.
- Sistemas de respuesta a preguntas (QA) sobre documentación clínica: dado un corpus de guías o informes médicos, el modelo recupera los pasajes que contienen la respuesta, que luego pueden pasarse a un LLM generativo.
- Asistente de diagnóstico diferencial: recuperar casos clínicos similares a partir de la descripción de síntomas del paciente, usando embeddings de 2048 dimensiones para comparar similitud.
- Filtrado de literatura para revisiones sistemáticas: clasificar y priorizar artículos relevantes para una revisión, reduciendo el trabajo manual de screening.
- Chatbots de atención al paciente: integrar el retriever en un pipeline RAG para responder preguntas frecuentes sobre medicamentos, efectos secundarios o procedimientos, con contexto limitado a 512 tokens.
- Indexación de documentos legales o regulatorios en el ámbito sanitario: recuperar normativas o políticas relevantes a partir de consultas específicas, gracias a la capacidad de manejar hard negatives sintéticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como nDCG, Recall@k o MRR, ni comparaciones con otros retrievers. Se recomienda consultar el paper en arXiv (2602.04731) para posibles evaluaciones adicionales.

## Requisitos de hardware

- VRAM estimada: el modelo en bfloat16 ocupa aproximadamente 5.0 GB (tamaño del repo). Con overhead de activaciones y tokenizador, se recomienda al menos 8 GB de VRAM para inferencia en lotes pequeños.
- GPUs compatibles: cualquier GPU con al menos 8 GB de VRAM, como RTX 3060/3070/4060, RTX 4070, RTX 4080, RTX 4090, A10, A100, H100. Para uso con `flash_attention_2` se requiere una GPU compatible con FlashAttention (Ampere o superior).
- En consumer GPU: sí, cabe en GPUs de gama media con 8-12 GB (p. ej., RTX 3060 12GB, RTX 4070).
- Opciones de despliegue: `sentence-transformers` (recomendado), `transformers` con pooling manual, o servidores de inferencia como vLLM o TGI si se adapta a un pipeline de embeddings. También es compatible con la API de endpoints de HuggingFace.
- Latencia y throughput: no disponible. Depende del hardware y del tamaño de lote; al ser un modelo de 2.5B, la inferencia es más rápida que modelos de 7B o mayores, pero más lenta que modelos pequeños tipo MiniLM.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo se posiciona como un retriever biomédico basado en Gemma-2B, pero no se han publicado comparaciones con alternativas como `medbert`, `biobert` o retrievers basados en Gemma de mayor tamaño. Se recomienda consultar el paper para ver si incluye evaluaciones comparativas. Hasta entonces, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Sesgos: al ser un derivado de Gemma-2B, puede heredar sesgos presentes en los datos de preentrenamiento de Google, especialmente en dominios no biomédicos.
- Riesgo de alucinación: aunque el modelo no genera texto, los embeddings pueden producir falsos positivos en retrieval si las consultas son ambiguas o el corpus contiene información contradictoria.
- Limitaciones de contexto: la longitud máxima de secuencia es de 512 tokens, lo que impide procesar documentos largos de una sola vez; se requiere truncamiento o chunking.
- Idiomas: no se especifican idiomas soportados; Gemma-2B está principalmente entrenado en inglés, por lo que el rendimiento en otros idiomas puede ser deficiente.
- Restricciones de licencia: al ser un derivado de Gemma-2B, el uso está sujeto a los Gemma Terms of Use de Google, que pueden imponer restricciones de uso comercial o de redistribución. Se debe revisar la licencia antes de desplegar en producción.
- Dependencia de prefijos de instrucción: el modelo requiere el uso de prefijos específicos para consultas y pasajes (como se muestra en el ejemplo de uso); omitirlos degrada significativamente el rendimiento.
- Sin soporte de generación: no es un modelo generativo; solo produce embeddings. No se puede usar para tareas de texto libre.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ikim-uk-essen/stm_gemma
- Paper en arXiv: https://arxiv.org/abs/2602.04731
- Colección STM en HuggingFace: https://huggingface.co/collections/ikim-uk-essen/stm
- Modelo base Gemma-2B: https://huggingface.co/google/gemma-2b
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
