# jermalk/bge-reranker-v2-m3-int8-ov

## Resumen

bge-reranker-v2-m3-int8-ov es una conversion no oficial del modelo BAAI/bge-reranker-v2-m3 a formato OpenVINO con compresion de pesos a int8, publicada por el usuario jermalk. Se trata de un cross-encoder multilingue de reranking: recibe pares consulta-documento y devuelve una puntuacion de relevancia que permite reordenar una lista de candidatos obtenida previamente por un recuperador denso o disperso. El modelo base esta construido sobre la arquitectura XLM-RoBERTa, segun los tags del repositorio, y se distribuye bajo licencia Apache 2.0.

La relevancia de esta ficha es practica: la conversion permite ejecutar el reranker en hardware Intel (CPU o GPU integrada) mediante OpenVINO y la API openvino-genai, sin depender de CUDA ni de frameworks de inferencia con aceleracion NVIDIA. El repositorio ocupa 0.6 GB pesando los pesos comprimidos a int8, un tamano muy inferior al del modelo original en fp32.

No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso. Su unica funcion es la clasificacion de pares texto-texto para reranking. La model card advierte que es lento en CPU (aproximadamente 0.5 s por pasaje de unos 200 tokens) y recomienda rerankear listas cortas de 5 a 10 pasajes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en XLM-RoBERTa (segun tags del repositorio); tarea de text-classification |
| Parametros totales | no disponible (el modelo base BAAI/bge-reranker-v2-m3 se construye sobre XLM-RoBERTa) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | int8 (compresion de pesos de 8 bits mediante optimum-intel) |
| Idiomas soportados | multilingue; la model card menciona pruebas en polaco e ingles, sin lista completa |
| Licencia | apache-2.0 (igual que el modelo original) |
| Formato de pesos | OpenVINO IR (exportado con optimum-cli export openvino y el conversor de tokenizer de OpenVINO) |
| Tamano del repositorio | 0.6 GB |
| Libreria | openvino |
| Pipeline | text-classification (reranking) |
| Modelo base | BAAI/bge-reranker-v2-m3 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del reranker original de BAAI: un transformer encoder del tipo XLM-RoBERTa empleado como cross-encoder, es decir, la consulta y el documento se concatenan en una unica secuencia de entrada y el modelo emite una puntuacion de relevancia en lugar de una representacion vectorial independiente por texto. Esta formulacion es mas costosa que la de un bi-encoder, pero suele ofrecer una precision superior al reordenar resultados.

Esta version concreta no ha sido reentrenada ni ajustada: la model card indica explicitamente que se genero con `optimum-cli export openvino` aplicando compresion de pesos a 8 bits y el conversor de tokenizer de OpenVINO, sin fine-tuning ni ninguna otra modificacion. Por tanto, la calidad de ranking es la del modelo original BAAI/bge-reranker-v2-m3, mientras que los cambios afectan al formato de pesos, al tamano y al motor de inferencia. No se proporcionan datos sobre el corpus de entrenamiento original, el numero de tokens ni si hubo etapas de RLHF o DPO, ya que corresponden al modelo base y no se detallan en esta ficha.

## Capacidades

- Reranking de pares consulta-documento: asigna una puntuacion de relevancia a cada candidato para reordenar los resultados de una busqueda.
- Uso como segunda etapa de un pipeline RAG o de recuperacion de informacion: primero un recuperador denso (por ejemplo, e5 o bge-m3) obtiene candidatos y despues este cross-encoder los reordena.
- Funcionamiento multilingue, incluyendo consultas y documentos en idiomas distintos al ingles; la model card reporta que en polaco no degrada un buen ranking de e5, mientras que un reranker solo en ingles (ms-marco-MiniLM) si lo empeoraba.
- Inferencia en hardware Intel mediante OpenVINO y la API openvino-genai, con soporte tanto de CPU como de otros dispositivos compatibles con OpenVINO.
- Integracion con la herramienta RustedVINO, que permite registrar el modelo con `rv add bge-reranker-v2-m3-int8-ov --kind reranking`.
- No dispone de generacion de texto, tool calling, capacidades de agente, vision ni audio.

## Casos de uso

- Reranking en pipelines RAG: tras recuperar entre 5 y 10 fragmentos con un buscador vectorial, el modelo los reordena segun su relevancia real respecto a la pregunta del usuario antes de pasarlos al LLM generador. Es adecuado porque el cross-encoder captura la interaccion termino a termino entre consulta y documento, algo que el bi-encoder no modela.
- Busqueda empresarial multilingue: en un corpus con documentos en varios idiomas europeos, el reranker puede reordenar resultados mezclados en distintos idiomas sin necesidad de traducir previamente. La model card respalda este uso con la prueba en polaco.
- Sistemas de preguntas frecuentes o atencion al cliente: dado un catalogo de respuestas predefinidas, el modelo puntua cual encaja mejor con la consulta entrante y reduce el numero de respuestas erroneas entregadas al usuario.
- Filtrado de candidatos en motores de busqueda internos: sobre los resultados de un indice de texto completo (por ejemplo, Elasticsearch o BM25), aplicar el reranker como etapa final para mejorar la precision del top-k.
- Deduplicacion y seleccion de contexto en entornos de documentacion tecnica: cuando varias secciones son candidatas, el reranker ayuda a elegir las mas pertinentes y evita enviar contexto irrelevante al modelo generativo.
- Despliegue en equipos de sobremesa o portatiles con CPU Intel: permite incorporar reranking en aplicaciones locales sin GPU dedicada, aceptando el coste de aproximadamente 0.5 s por pasaje de 200 tokens.
- Evaluacion offline de recuperadores: usar el score del cross-encoder como etiqueta o referencia para comparar la calidad de distintos modelos de embeddings en un mismo corpus.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, BEIR u otros) en la informacion disponible. La model card unicamente aporta una medicion de latencia y consumo, realizada en un portatil con Intel Core Ultra 7 forzando la ejecucion en CPU:

| Metrica | Valor medido | Condiciones |
|---|---|---|
| Latencia por pasaje | ~0.5 s | pasaje de ~200 tokens, CPU (Intel Core Ultra 7) |
| Memoria RAM en uso | ~1.0 GB | inferencia en CPU |
| Variabilidad entre ejecuciones | hasta un 25 % | segun la propia model card |

El autor advierte que estas cifras deben tratarse como ordenes de magnitud, no como valores exactos. No se ofrecen datos de precision (nDCG, MRR, MAP) ni comparaciones cuantitativas frente al modelo original.

## Requisitos de hardware

- Memoria RAM estimada: aproximadamente 1.0 GB en CPU durante la inferencia, segun la medicion del autor.
- Tamano del modelo: 0.6 GB de repositorio con pesos int8, por lo que el modelo cabe holgadamente en cualquier equipo moderno.
- GPU: no se especifican modelos concretos. Al estar exportado a OpenVINO, puede ejecutarse en CPU Intel, GPU integrada Intel y, en principio, en otros dispositivos compatibles con OpenVINO; no se documenta soporte de CUDA ni de tarjetas NVIDIA.
- Cabe en GPU de consumo: no se aportan datos especificos, pero por tamano (0.6 GB) es compatible con practicamente cualquier GPU, siempre que el backend OpenVINO la soporte.
- Opciones de despliegue: OpenVINO y openvino-genai, ademas de la herramienta RustedVINO, que registra el modelo como reranker con `rv add`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un cross-encoder de este tipo).
- Latencia y throughput: ~0.5 s por pasaje de ~200 tokens en CPU, con hasta un 25 % de variacion entre ejecuciones. El autor recomienda rerankear listas cortas (5-10 pasajes) precisamente por esta lentitud.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Formato / despliegue | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| jermalk/bge-reranker-v2-m3-int8-ov | Cross-encoder reranker, int8 | Multilingue | OpenVINO IR | Apache 2.0 | Solo latencia y RAM (medicion en CPU) |
| BAAI/bge-reranker-v2-m3 (original) | Cross-encoder reranker | Multilingue | safetensors / PyTorch | Apache 2.0 | Rendimiento del original no incluido en esta informacion |
| cross-encoder/ms-marco-MiniLM | Cross-encoder reranker | Solo ingles | PyTorch | no disponible en esta informacion | La model card indica que degrada un buen ranking de e5 en polaco |
| Recuperadores densos multilingues (por ejemplo, e5) | Bi-encoder | Multilingue | Variable | Variable | Usado como referencia cualitativa en la model card |

La comparacion cuantitativa con alternativas no puede completarse porque la informacion disponible no incluye metricas de precision comparables.

## Limitaciones y advertencias

- Conversion no oficial: no ha sido revisada ni respaldada por los autores de BAAI/bge-reranker-v2-m3. El credito del modelo corresponde a sus autores originales.
- Rendimiento en CPU limitado: aproximadamente 0.5 s por pasaje, con variabilidad de hasta el 25 % entre ejecuciones; no es adecuado para rerankear decenas o cientos de candidatos en tiempo real sobre CPU.
- Sin datos de precision: no se han publicado metricas de nDCG, MRR o MAP que permitan verificar que la cuantizacion int8 no degrada la calidad del reranking.
- Idiomas: aunque el modelo es multilingue, la model card solo documenta pruebas en polaco e ingles; no hay lista completa de idiomas ni evaluacion sistematica por idioma.
- Contexto: no se especifica la longitud maxima de secuencia soportada en esta ficha; conviene consultar la documentacion del modelo base antes de usarlo con pasajes largos.
- No es un modelo generativo: no soporta generacion de texto, tool calling, agentes, vision ni audio.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de puntuaciones de relevancia erroneas en pares mal formados o dominios muy alejados del entrenamiento del modelo base.
- Sesgos: no se documenta ninguna evaluacion de sesgos; al heredar el comportamiento del modelo base, podria reproducir los sesgos presentes en sus datos de entrenamiento.
- Licencia Apache 2.0, que permite uso comercial, siempre que se respeten las condiciones de atribucion y se cite adecuadamente el trabajo original.
- Popularidad y mantenimiento: el repositorio registra 0 descargas y 1 like, por lo que se trata de una conversion reciente y sin validacion por parte de la comunidad.
- Fechas de creacion y actualizacion registradas como 2026-10-12, dato que conviene verificar directamente en HuggingFace.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/jermalk/bge-reranker-v2-m3-int8-ov
- Modelo base BAAI/bge-reranker-v2-m3: https://huggingface.co/BAAI/bge-reranker-v2-m3
- Paper de referencia sobre el modelo base: Making Large Language Models A Better Foundation For Dense Retrieval, arXiv:2312.15503 (https://arxiv.org/abs/2312.15503)
- Paper BGE M3-Embedding: Multi-Lingual, Multi-Functionality, Multi-Granularity Text Embeddings Through Self-Knowledge Distillation, arXiv:2402.03216 (https://arxiv.org/abs/2402.03216)
- Herramienta RustedVINO, referenciada en la model card para el registro del modelo como reranker (URL del repositorio no disponible en la informacion proporcionada)
