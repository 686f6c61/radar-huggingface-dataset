# mradermacher/ITER-Qwen3-Embedding-0.6B-GGUF

## Resumen

ITER-Qwen3-Embedding-0.6B-GGUF es una colección de cuantizaciones GGUF del modelo de embeddings densos ITER-Qwen3-Embedding-0.6B, desarrollado por el grupo ielabgroup y cuantizado por mradermacher. El modelo original está diseñado para tareas de retrieval denso, búsqueda agéntica y deep research, como indican sus etiquetas. Con 595,7 millones de parámetros, se posiciona en la gama de modelos de embeddings pequeños, adecuados para despliegue en entornos con recursos limitados.

Esta versión GGUF permite ejecutar el modelo con motores de inferencia como llama.cpp, facilitando su uso en CPU y GPU de baja capacidad. La licencia Apache-2.0 permite uso comercial sin restricciones significativas. El modelo es monolingüe en inglés, lo que limita su aplicación a textos en ese idioma. La cuantización estática ofrecida cubre desde Q2_K hasta f16, dando flexibilidad para equilibrar calidad y consumo de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de embeddings densos, presumiblemente basado en Qwen3) |
| Parametros totales | 595.776.512 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo original ITER-Qwen3-Embedding-0.6B. Por su nombre y tamano, se infiere que sigue el patron de los modelos de embeddings densos de la familia Qwen3, pero no hay confirmacion oficial en la documentacion proporcionada. El repositorio de cuantizacion no incluye detalles sobre el entrenamiento, el dataset utilizado ni el numero de tokens de entrenamiento. Se referencia un paper con identificador arxiv:2608.27912, pero su contenido no esta disponible en la informacion recopilada.

Las cuantizaciones han sido generadas de forma estatica (sin imatrix) por mradermacher, utilizando su infraestructura. No se especifican tecnicas de entrenamiento adicionales como RLHF o DPO, ya que se trata de un modelo de embeddings, no generativo.

## Capacidades

- Generacion de embeddings densos para similitud semantica entre frases y documentos.
- Soporte de dense retrieval, es decir, busqueda de documentos relevantes mediante similitud de vectores.
- Adecuado para agentic search, donde un agente realiza busquedas iterativas o multi-paso sobre una coleccion de documentos.
- Orientado a deep research, permitiendo recuperar informacion relevante para tareas de investigacion automatizada.
- Capacidad de sentence-similarity, calculando la similitud coseno entre representaciones de texto.
- Monolingue en ingles, sin soporte multilingue declarado.

## Casos de uso

- Busqueda semantica en bases de conocimiento internas: el modelo genera embeddings de consultas y documentos, permitiendo recuperar pasajes relevantes por similitud coseno. Su tamano reducido facilita su integracion en pipelines de RAG con baja latencia.
- Sistemas de preguntas y respuestas sobre documentacion tecnica: al indexar manuales o wikis con embeddings, un sistema puede localizar respuestas a consultas de usuarios sin depender de coincidencias lexicas exactas.
- Deduplicacion de textos: comparando embeddings de articulos, correos o registros, se pueden identificar duplicados o variantes cercanas, util en limpieza de datos.
- Clasificacion de textos por similitud: agrupando embeddings con tecnicas como k-means, se pueden categorizar documentos sin etiquetas previas, por ejemplo en triage de tickets de soporte.
- Motores de recomendacion basados en contenido: representando items (productos, noticias, articulos) como vectores, se pueden sugerir elementos similares al que el usuario esta viendo.
- Busqueda agente en entornos de investigacion: un agente de IA puede usar este modelo para iterar sobre colecciones de papers o informes, refinando consultas y recuperando documentos relevantes en cada paso, gracias a su diseno orientado a agentic search.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni metricas de retrieval como nDCG o Recall para este modelo.

## Requisitos de hardware

- VRAM estimada: los archivos GGUF varian entre 0,4 GB (Q2_K) y 1,3 GB (f16). Para inferencia con cuantizacion Q4_K_M (0,5 GB) se necesitan menos de 1 GB de VRAM, por lo que cabe en cualquier GPU moderna con al menos 2 GB.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM, incluyendo GTX 1650, RTX 3060, o incluso iGPUs con soporte Vulkan. Tambien puede ejecutarse en CPU sin problemas.
- Opciones de despliegue: al ser GGUF, se puede usar con llama.cpp, Ollama, llama-cpp-python o servidores compatibles con el formato. Para generacion de embeddings, llama.cpp ofrece el modo `--embedding`.
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamano de 0,6B, se espera una latencia de pocos milisegundos por lote en GPU moderna y decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ITER-Qwen3-Embedding-0.6B (GGUF) | 595,7 M | no disponible | Apache-2.0 | GGUF | Variante de Qwen3-Embedding con enfoque en agentic search |
| Qwen3-Embedding-0.6B (original) | 595,7 M | no disponible | Apache-2.0 | safetensors | Modelo base de la familia Qwen3 Embedding |
| BGE-small-en-v1.5 | 33 M | 512 tokens | MIT | safetensors | Modelo de embeddings mas pequeno, menos capaz pero muy ligero |

No se dispone de datos de rendimiento comparativo. La comparativa se limita a parametros y licencia. El modelo ITER se distingue por su orientacion a busqueda agente y deep research, aunque no hay metricas publicas que lo respalden.

## Limitaciones y advertencias

- Monolingue en ingles: no es adecuado para textos en otros idiomas, incluyendo espanol.
- Sin informacion sobre sesgos: no se han publicado evaluaciones de sesgo o robustez del modelo original.
- Riesgo de alucinacion: no aplica directamente al ser un modelo de embeddings, pero la calidad de los vectores puede degradarse con cuantizaciones agresivas (Q2_K, Q3_K), afectando la precision del retrieval.
- Cuantizacion estatica: las cuantizaciones no incluyen imatrix, por lo que pueden tener una perdida de calidad mayor que las versiones con imatrix en tareas de similitud.
- Sin datos de contexto: se desconoce la longitud maxima de secuencia soportada, lo que limita su uso en documentos largos sin validacion previa.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se recomienda revisar los terminos del modelo base original por si hubiera clausulas adicionales.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/ITER-Qwen3-Embedding-0.6B-GGUF
- Modelo base: https://huggingface.co/ielabgroup/ITER-Qwen3-Embedding-0.6B
- Paper asociado (arxiv:2608.27912): https://arxiv.org/abs/2608.27912
- Repositorio de Qwen3-Embedding (familia base): https://github.com/QwenLM/Qwen3-Embedding
