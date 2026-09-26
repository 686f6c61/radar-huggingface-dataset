# AIArchiveInfo/Qwen3-Reranker-4B

## Resumen

Qwen3-Reranker-4B es un modelo de reranking de texto (cross-encoder) desarrollado por el equipo Qwen de Alibaba, construido a partir del modelo denso Qwen3-4B-Base. Su funcion es reordenar un conjunto de documentos candidatos en funcion de su relevancia respecto a una consulta, una etapa habitual en pipelines de recuperacion aumentada (RAG) y busqueda semantica. Con 4.021.784.576 parametros y una longitud de contexto de 32.000 tokens, se situa en el tramo medio de la familia Qwen3 Embedding, que cubre 0,6B, 4B y 8B tanto en variantes de embedding como de reranking.

La ficha que nos ocupa corresponde a **AIArchiveInfo/Qwen3-Reranker-4B**, un espejo de preservacion byte a byte del modelo original `Qwen/Qwen3-Reranker-4B` (revision `22e683669bc0`). No se ha reentrenado, ajustado ni modificado ningun peso: la copia mantiene la licencia Apache 2.0 original y todos los creditos pertenecen a los autores de Qwen. Es relevante como punto de descarga alternativo y como referencia de integridad de los pesos originales.

El modelo hereda las capacidades multilingues y de comprension de texto largo de la base Qwen3, admite mas de 100 idiomas (incluidos lenguajes de programacion) y es sensible a instrucciones: permite definir una instruccion propia por tarea para mejorar entre un 1 % y un 5 % el rendimiento en la mayoria de escenarios, segun la documentacion oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder), adaptado como cross-encoder de reranking; 36 capas |
| Parametros totales | 4.021.784.576 (~4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.000 tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; conversion a GGUF/INT8/INT4 posible con herramientas estandar) |
| Idiomas soportados | mas de 100 idiomas, incluidos lenguajes de programacion |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Pipeline | text-ranking |
| Modelo base | Qwen/Qwen3-4B-Base |
| Dimension de embedding | no aplica (modelo de reranking, no de embedding) |
| Soporte MRL | no aplica |
| Instruction aware | si |
| Tamano del repositorio | 8,1 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Base, un transformer denso de 36 capas, y se adapta como cross-encoder de reranking: recibe pares (consulta, documento) y produce una puntuacion de relevancia. Segun la documentacion oficial, las puntuaciones devueltas son diferencias de logits en crudo y pueden transformarse en probabilidades 0-1 aplicando una funcion sigmoide. La arquitectura conserva la ventana de contexto de 32.000 tokens del modelo base, lo que permite reranking sobre documentos largos sin truncado agresivo.

La serie Qwen3 Embedding se presenta como la propuesta mas reciente de la familia Qwen para tareas de embedding y ranking, con modelos de 0,6B, 4B y 8B. La documentacion destaca que heredan las capacidades multilingues, de texto largo y de razonamiento de los modelos fundacionales Qwen3. El modelo es *instruction aware*: admite instrucciones definidas por el usuario por tarea, idioma o escenario, con una mejora tipica de entre el 1 % y el 5 % en tareas downstream. En contextos multilingues se recomienda redactar esas instrucciones en ingles, ya que la mayoria de las usadas durante el entrenamiento estaban en ese idioma.

Cabe subrayar que los detalles concretos de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO u otras tecnicas) no estan disponibles en la informacion proporcionada. Esta copia, ademas, es un espejo sin modificaciones de pesos.

## Capacidades

- Reranking de texto: reordena documentos candidatos por relevancia respecto a una consulta, devolviendo puntuaciones (logits o probabilidades 0-1 con sigmoide).
- Recuperacion de informacion: pensado para busqueda semantica y pipelines RAG, donde actua como segunda etapa tras un retriever inicial.
- Recuperacion de codigo: soporta reranking sobre consultas y documentos de codigo, gracias al soporte de lenguajes de programacion.
- Multilingue: mas de 100 idiomas, con capacidades cross-lingue y de bitext mining segun la documentacion de la serie.
- Texto largo: ventana de 32.000 tokens, adecuada para documentos extensos.
- Sensible a instrucciones: permite definir instrucciones por tarea para ajustar el comportamiento del ranking.
- Clasificacion y agrupamiento de texto: capacidades declaradas para la serie Qwen3 Embedding a nivel de familia (aplicables segun el tipo de modelo).
- Integracion con tooling estandar: uso via `sentence_transformers.CrossEncoder` (`predict` y `rank`).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- RAG de documentacion tecnica: usar el modelo como reranker de segunda etapa sobre los fragmentos recuperados por un retriever vectorial. Los 32.000 tokens de contexto permiten puntuar fragmentos largos sin partir el texto.
- Busqueda empresarial multilingue: reordenar resultados en un corpus con documentos en varios idiomas aprovechando el soporte de mas de 100 lenguas y la capacidad cross-lingue.
- Busqueda de codigo en repositorios internos: reranking de fragmentos de codigo recuperados por un indice, con soporte de lenguajes de programacion y consultas en lenguaje natural.
- Atencion al cliente con base de conocimiento: ordenar articulos de ayuda relevantes para una consulta de usuario antes de pasarlos al LLM generador, reduciendo contexto irrelevante.
- Deduplicacion y bitext mining: uso de las capacidades de la serie para identificar pares de textos equivalentes o paralelos en corpus multilingues.
- Clasificacion y agrupamiento asistidos: emplear las puntuaciones de relevancia como senal para tareas de categorizacion o agrupacion de documentos.
- Evaluacion de calidad de recuperacion: integrar el modelo en pipelines de evaluacion offline para medir la precision de un retriever, comparando rankings.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos de este modelo en la informacion disponible. La documentacion de la familia menciona que el modelo de embedding de 8B alcanzo la posicion numero 1 en el leaderboard MTEB multilingue (puntuacion 70,58, a fecha del 5 de junio de 2025), pero ese dato corresponde a un modelo distinto (Qwen3-Embedding-8B) y no al reranker de 4B. Para resultados de evaluacion detallados se remite al blog y al repositorio oficial de Qwen indicados en la seccion de enlaces.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones segun el tamano del modelo, no confirmadas en la informacion proporcionada):
  - FP16/BF16: en torno a 8-10 GB.
  - INT8: en torno a 4-6 GB.
  - INT4: en torno a 2-4 GB.
- GPU recomendadas: A100, H100 para despliegues de alto rendimiento; en el extremo consumer, tarjetas con 12-16 GB o mas (RTX 4080, RTX 4090) para FP16; GPUs con 8 GB pueden ser suficientes con cuantizacion INT8/INT4.
- Cabe en GPU de consumo: si, con cuantizacion o en FP16 en GPUs de gama alta con suficiente VRAM.
- Opciones de despliegue: `transformers`, `sentence-transformers` (CrossEncoder) como via documentada; otras opciones como vLLM, llama.cpp, Ollama o TGI no estan confirmadas en la informacion proporcionada, aunque al ser pesos safetensors son compatibles con el ecosistema estandar de conversion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Capas | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3-Reranker-0.6B | 0,6B | 28 | 32K | Reranking | Apache 2.0 (segun familia) | HuggingFace |
| Qwen3-Reranker-4B | 4B | 36 | 32K | Reranking | Apache 2.0 | HuggingFace |
| Qwen3-Reranker-8B | 8B | 36 | 32K | Reranking | Apache 2.0 (segun familia) | HuggingFace |

Los tres modelos comparten contexto de 32K y soporte de instrucciones; difieren en tamano, numero de capas (28 frente a 36) y coste de inferencia. El 0,6B es la opcion de mayor eficiencia; el 8B, la de mayor capacidad. Esta copia concreta (AIArchiveInfo/Qwen3-Reranker-4B) es identica en pesos a la version oficial Qwen/Qwen3-Reranker-4B. Los datos de rendimiento comparativo no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de reranking, no generativo: no produce texto; solo asigna puntuaciones de relevancia a pares (consulta, documento).
- Sesgos: no se documentan sesgos especificos en la informacion proporcionada; como modelo derivado de Qwen3, puede heredar sesgos de su corpus de entrenamiento.
- Alucinacion: al no generar texto libre, el riesgo de alucinacion se limita a puntuaciones poco calibradas; las puntuaciones crudas son diferencias de logits y requieren sigmoide para interpretarse como probabilidades.
- Contexto: la ventana es de 32K tokens; pares que la excedan requeriran truncado o division.
- Idioma: aunque se declaran mas de 100 idiomas, el rendimiento puede variar por lengua; la documentacion recomienda instrucciones en ingles.
- Instrucciones: omitirlas puede reducir el rendimiento entre un 1 % y un 5 % en muchas tareas.
- Licencia: Apache 2.0, permite uso comercial; la copia conserva la licencia original. Se recomienda verificar los terminos del modelo base Qwen3-4B-Base.
- Produccion: al ser un espejo con 0 descargas y 0 likes en el momento de la ficha, conviene validar la integridad de los pesos y preferir la fuente oficial para despliegues criticos.
- Datos no disponibles: no se detallan cuantizaciones oficiales, latencias ni benchmarks especificos.

## Enlaces

- Copia en HuggingFace (AIArchive): https://huggingface.co/AIArchiveInfo/Qwen3-Reranker-4B
- Modelo original: https://huggingface.co/Qwen/Qwen3-Reranker-4B
- Revision archivada del original: https://huggingface.co/Qwen/Qwen3-Reranker-4B/tree/22e683669bc0f0bd69640a1354a6d0aebcfeede5
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Blog oficial de la serie Qwen3 Embedding: https://qwenlm.github.io/blog/qwen3-embedding/
- Repositorio GitHub: https://github.com/QwenLM/Qwen3-Embedding
- Paper (arXiv:2506.05176): https://arxiv.org/abs/2506.05176
- Variantes relacionadas: https://huggingface.co/Qwen/Qwen3-Reranker-0.6B · https://huggingface.co/Qwen/Qwen3-Reranker-8B · https://huggingface.co/Qwen/Qwen3-Embedding-4B · https://huggingface.co/Qwen/Qwen3-Embedding-8B
