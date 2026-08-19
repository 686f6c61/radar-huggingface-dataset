# deu05232/promptriever-llama2-7B-new_seed42-JointLH-both-ignore

## Resumen

Promptriever es un modelo de retrieval (búsqueda de pasajes) desarrollado por el usuario de Hugging Face `deu05232`. Se basa en el modelo de lenguaje Llama-2-7B de Meta, al que se le añaden adaptadores PEFT (probablemente LoRA) para especializarlo en tareas de recuperación de información. La idea principal, según el repositorio GitHub asociado, es que el modelo puede ser controlado mediante instrucciones en lenguaje natural a nivel de instancia, de forma similar a como se controlan los modelos generativos, lo que permite adaptar dinámicamente el comportamiento de búsqueda sin necesidad de reentrenar.

La versión concreta `promptriever-llama2-7B-new_seed42-JointLH-both-ignore` es uno de los checkpoints publicados dentro de esta familia. La documentación oficial es extremadamente escasa: la model card está prácticamente vacía y no se proporcionan detalles sobre el entrenamiento, los datos utilizados, las métricas de evaluación ni la licencia. A pesar de ello, el modelo resulta relevante por su enfoque novedoso de retrieval controlable por prompts, una línea de investigación activa en el campo de los sistemas de recuperación aumentada por generación (RAG).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama-2-7B (transformer decoder) con adaptadores PEFT (LoRA) |
| Parametros totales | 7 mil millones (modelo base) + adaptadores (tamano no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (heredada de Llama-2-7B) |
| Tipos de cuantizacion | no disponible (se puede cuantizar con herramientas externas) |
| Idiomas soportados | no disponible (heredados de Llama-2, principalmente ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptadores PEFT) |

## Arquitectura y entrenamiento

El modelo parte de `meta-llama/Llama-2-7b-hf`, un transformer decoder con 7 mil millones de parametros, y se le aplican adaptadores mediante la libreria PEFT (version 0.14.0). La naturaleza exacta de los adaptadores (LoRA, prefix tuning, etc.) no se especifica en la documentacion publicada. Segun el repositorio GitHub de Promptriever, el entrenamiento se realiza para convertir el modelo base en un retriever que responde a instrucciones: se le presentan consultas y pasajes, y el modelo aprende a puntuar la relevancia condicionada a un prompt de control. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, ni si se utilizaron tecnicas como RLHF o DPO. El nombre del checkpoint (`JointLH-both-ignore`) sugiere una variante especifica de la estrategia de entrenamiento conjunta con perdidas de tipo "joint likelihood" y "hard negative", pero no hay detalles confirmados.

## Capacidades

- Retrieval de pasajes: el modelo esta disenado para puntuar la relevancia entre una consulta y un pasaje, devolviendo una puntuacion de similitud.
- Control mediante prompts: a diferencia de los retrievers clasicos, admite instrucciones en lenguaje natural para modificar el criterio de busqueda (por ejemplo, "busca pasajes que hablen de aspectos legales").
- Generacion de embeddings: puede utilizarse para obtener representaciones vectoriales de consultas y pasajes, utiles en sistemas RAG.
- Integracion con pipelines de recuperacion: compatible con herramientas como MTEB (aunque el repositorio advierte de problemas en la version v1).
- Multilingue: no confirmado; hereda las limitaciones de Llama-2, que es principalmente ingles.
- Tool calling y agentes: no aplicable, ya que no es un modelo generativo conversacional.

## Casos de uso

- Sistemas de recuperacion aumentada por generacion (RAG): el modelo puede servir como retriever para seleccionar pasajes relevantes antes de pasarlos a un LLM generativo, mejorando la precision de las respuestas.
- Busqueda semantica en corpus corporativos: permite indexar documentos internos y recuperar fragmentos relevantes mediante consultas en lenguaje natural, con la posibilidad de afinar el criterio con prompts.
- Filtrado de documentos legales o cientificos: gracias al control por prompts, se puede instruir al modelo para que priorice ciertos tipos de contenido (patentes, articulos de revision, jurisprudencia).
- Evaluacion de relevancia en datasets de QA: puede utilizarse como componente de reranking en pipelines de preguntas y respuestas.
- Investigacion academica en retrieval controlable: sirve como base para experimentos sobre como los prompts afectan a la recuperacion, comparando con retrievers estaticos.
- Prototipos de motores de busqueda personalizados: al poder cambiar el prompt en tiempo de ejecucion, se puede ofrecer una misma infraestructura para distintos dominios sin reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio GitHub menciona que el modelo participa en MTEB, pero advierte de que la version v1 esta rota y sugiere usar la rama v2. No hay cifras de MMLU, HumanEval, GSM8K ni metricas de retrieval como nDCG o Recall.

## Requisitos de hardware

- VRAM estimada: el modelo base Llama-2-7B en FP16 ocupa aproximadamente 14 GB. Con los adaptadores PEFT, el peso adicional es minimo, pero la inferencia requiere cargar el modelo completo. Con cuantizacion de 4 bits (por ejemplo, mediante bitsandbytes) se puede reducir a unos 4-5 GB.
- GPU recomendadas: para FP16, una GPU con al menos 16 GB de VRAM (RTX 4090, A100 40GB, etc.). Para cuantizacion 4-bit, una RTX 3080 o superior con 10-12 GB puede ser suficiente.
- Compatibilidad con GPU de consumo: si, con cuantizacion adecuada cabe en GPUs de gama alta para consumidores.
- Opciones de despliegue: al ser un modelo PEFT, se puede cargar con la libreria `transformers` y `peft`. Para inferencia en produccion, se puede usar vLLM (si se fusionan los adaptadores) o TGI. Tambien es posible exportar a GGUF para usar con llama.cpp u Ollama, aunque no hay archivos GGUF publicados.
- Latencia y throughput: no disponibles; dependen del hardware y de la implementacion.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa. Modelos de retrieval como BGE, Contriever o E5 tienen arquitecturas y entrenamientos diferentes, y no se conocen resultados comparativos con Promptriever. Se recomienda consultar el repositorio GitHub para posibles evaluaciones.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: la model card no proporciona detalles sobre entrenamiento, datos, licencia ni limitaciones. Esto dificulta su uso en entornos de produccion sin una evaluacion previa exhaustiva.
- Sesgos de Llama-2: al derivar de Llama-2-7B, el modelo hereda los sesgos socioculturales y las limitaciones de ese modelo base, incluyendo posibles sesgos de genero, raza o ideologia.
- Riesgo de alucinacion en la puntuacion de relevancia: como cualquier modelo basado en transformers, puede producir puntuaciones poco fiables para consultas ambiguas o fuera de distribucion.
- Licencia no especificada: no se indica la licencia del adaptador ni del modelo resultante. Dado que Llama-2 tiene su propia licencia (comunitaria, con restricciones para usos comerciales), es necesario verificar la compatibilidad antes de cualquier uso comercial.
- Problemas conocidos con MTEB: el propio autor advierte de que la integracion con MTEB v1 esta rota, lo que limita la reproducibilidad de evaluaciones estandar.
- Idioma: no se confirma soporte multilingue; probablemente el rendimiento fuera del ingles sea limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/deu05232/promptriever-llama2-7B-new_seed42-JointLH-both-ignore
- Repositorio GitHub de Promptriever: https://github.com/deu05232/promptriever
- Variante con margin loss: https://huggingface.co/deu05232/promptriever-llama2-7B-new_seed42-JointLH-margin_loss
- Variante cross-batch (ckpt 5100): https://friendli.ai/models/deu05232/promptriever-llama2-7B-new_seed42-JointLH-cross_batch-ckpt5100
- Variante seq_q-q_inst: https://friendli.ai/models/deu05232/promptriever-llama2-7B-seq_q-q_inst
