# mematello/rizal-xlm-r-dapt

## Resumen

rizal-xlm-r-dapt es un modelo de embeddings de frases (sentence transformer) publicado por el usuario mematello en HuggingFace. Se construye a partir de sentence-transformers/paraphrase-xlm-r-multilingual-v1 mediante un ajuste fino con la funcion de perdida DenoisingAutoEncoderLoss sobre un corpus de 15.512 muestras, en lo que constituye una adaptacion de dominio (DAPT, domain-adaptive pretraining) no supervisada. El objetivo del modelo es proyectar frases y parrafos a un espacio vectorial denso de 768 dimensiones donde la similitud coseno refleje cercania semantica, apto para similitud textual, busqueda semantica y clustering.

El modelo conserva la arquitectura del transformer codificador XLM-RoBERTa del modelo base, con 278.043.648 parametros totales (el tamano tipico de XLM-R base) y una longitud maxima de secuencia de 128 tokens. Los ejemplos incluidos en la model card estan redactados en tagalo (filipino), lo que sugiere que el corpus de adaptacion pertenece al dominio de la literatura filipina; el nombre del modelo ("rizal") apunta a la obra de Jose Rizal, aunque el autor no lo documenta de forma explicita.

Su relevancia practica es acotada: se trata de un modelo con cero descargas y cero likes en el momento de redactar esta ficha, sin licencia ni idiomas declarados en la metadata, y con una ventana de contexto muy reducida (128 tokens). Resulta interesante como ejemplo de adaptacion de dominio ligera sobre un encoder multilingue, pero no como opcion de produccion frente a alternativas mejor documentadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer codificador (XLMRobertaModel) + capa de pooling de media de tokens |
| Parametros totales | 278.043.648 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 128 tokens (max_seq_length) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors; admite conversion a INT8/FP16 con herramientas genericas) |
| Idiomas soportados | no disponible en la metadata; el modelo base es multilingue (XLM-R) y los ejemplos de la model card estan en tagalo |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Dimensionalidad de salida | 768 |
| Funcion de similitud | similitud coseno |
| Modelo base | sentence-transformers/paraphrase-xlm-r-multilingual-v1 |
| Tamano del repositorio | 1,1 GB |
| Pipeline | sentence-similarity / feature-extraction |
| Fecha de creacion | 2026-10-15 |
| Fecha de actualizacion | 2026-10-15 |

## Arquitectura y entrenamiento

La arquitectura es un SentenceTransformer compuesto por dos modulos: (0) un Transformer XLMRobertaModel con max_seq_length de 128 tokens y do_lower_case desactivado, y (1) una capa de Pooling que opera con pooling_mode_mean_tokens sobre embeddings de 768 dimensiones. No usa pooling de token CLS, ni max pooling, ni weighted mean, ni last token. El resultado es un vector denso de 768 dimensiones por frase y similitud coseno como metrica de comparacion.

El entrenamiento parte de paraphrase-xlm-r-multilingual-v1 y aplica un ajuste fino con DenoisingAutoEncoderLoss, la perdida asociada a TSDAE (Transformer-based Sequential Denoising Auto-Encoder, arXiv:2104.06979), un metodo de aprendizaje no supervisado de embeddings de frases. El corpus de entrenamiento consta de 15.512 muestras con dos columnas (sentence_0 y sentence_1); segun las estadisticas aproximadas de las primeras 1.000 muestras, sentence_0 tiene una media de 15,65 tokens (minimo 3, maximo 122) y sentence_1 una media de 35,44 tokens (minimo 5, maximo 128). No se documenta el numero de tokens totales, la composicion exacta del dataset, ni si hubo etapas de RLHF o DPO (no aplicables en un encoder de embeddings). Tampoco se especifica el idioma ni la licencia del corpus.

## Capacidades

- Generacion de embeddings de frases y parrafos en un espacio denso de 768 dimensiones.
- Similitud textual semantica (semantic textual similarity) mediante similitud coseno.
- Busqueda semantica sobre colecciones de texto previamente vectorizadas.
- Mineria de parafrasis (paraphrase mining).
- Clasificacion de texto y clustering a partir de los embeddings generados.
- Extraccion de caracteristicas (feature-extraction) para pipelines posteriores.
- Soporte de tool calling / function calling: no aplica (es un encoder de embeddings, no un modelo generativo).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: heredadas del modelo base XLM-R; no confirmadas por el autor para este ajuste.
- Capacidades especiales (vision, audio, modo thinking): no disponibles / no aplica.

## Casos de uso

- Busqueda semantica en corpus literario filipino: dado que los ejemplos del modelo estan en tagalo, puede usarse para indexar y recuperar fragmentos de novelas de Jose Rizal por similitud de significado en lugar de coincidencia exacta de palabras.
- Deduplicacion y agrupacion de frases cortas: con frases de hasta 128 tokens, permite agrupar oraciones similares en un corpus mediante clustering sobre los vectores de 768 dimensiones.
- Mineria de parafrasis en tagalo: util para detectar reformulaciones o variantes de una misma frase en textos historicos o literarios.
- Clasificacion de texto por similitud a prototipos: representar categorias como embeddings y asignar etiquetas por vecino mas cercano, adecuado cuando no hay suficientes datos etiquetados.
- Filtrado de contenido en pipelines de datos: comparar frases entrantes contra un conjunto de referencia para descartar o marcar contenido repetido.
- Recuperacion aumentada ligera (RAG) sobre documentos cortos: como componente de recuperacion en dominios de habla tagalo, siempre que los fragmentos no superen los 128 tokens.
- Analisis de similitud entre ediciones o traducciones: comparar versiones de un mismo pasaje y cuantificar su cercania semantica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB en FP32, en torno a 0,56 GB en FP16/BF16 y unos 0,28 GB en INT8 para los pesos; el consumo de activaciones es reducido por la ventana de 128 tokens.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM sirve; para alto throughput, A100, H100, L4 o A10 resultan sobredimensionadas para este tamano y solo tienen sentido para procesamiento por lotes masivo.
- Cabe en GPU de consumo: si, con holgura, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o incluso GPUs integradas con suficiente memoria compartida. Tambien es viable en CPU para lotes pequenos.
- Opciones de despliegue: sentence-transformers (libreria nativa), Hugging Face Text Embeddings Inference (el modelo lleva los tags text-embeddings-inference y endpoints_compatible), transformers, y conversion a ONNX para inferencia optimizada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimensiones | Licencia | Notas |
|---|---|---|---|---|---|
| mematello/rizal-xlm-r-dapt | 278 M | 128 tokens | 768 | no disponible | Ajuste DAPT sobre corpus de 15.512 muestras; ejemplos en tagalo |
| sentence-transformers/paraphrase-xlm-r-multilingual-v1 | 278 M | 128 tokens | 768 | Apache-2.0 (modelo base de Sentence Transformers) | Modelo base del que deriva; multilingue, ampliamente usado |
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 | 118 M | 128 tokens | 384 | Apache-2.0 | Alternativa mas ligera y rapida, con menos dimensiones |
| sentence-transformers/LaBSE | 471 M | 256 tokens | 768 | Apache-2.0 | Mayor tamano, mejor soporte multilingue y contexto mas amplio |

Los datos de licencia y contexto de los modelos de comparacion corresponden a sus fichas publicas habituales; conviene verificarlos antes de un uso en produccion.

## Limitaciones y advertencias

- Ventana de contexto muy reducida: 128 tokens limita el uso a frases y parrafos cortos, no a documentos completos.
- Metadata incompleta: la licencia y los idiomas soportados no estan declarados, lo que impide confirmar si el uso comercial esta permitido.
- Idiomas: aunque el modelo base es multilingue, el ajuste parece orientado al tagalo segun los ejemplos; el rendimiento en castellano u otros idiomas no esta documentado.
- Sesgos: no se documenta ninguna evaluacion de sesgos; al derivar de XLM-R y de un corpus literario concreto, puede reproducir sesgos historicos, culturales o de genero del texto de origen.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que el modelo no produce texto, pero si puede asignar similitudes altas a pares de frases no relacionados si el dominio difiere del de entrenamiento.
- Rendimiento no verificado: no hay benchmarks publicados ni evaluacion externa; el modelo tiene cero descargas y cero likes en el momento de redactar esta ficha.
- Trazabilidad: el autor no publica la composicion exacta del dataset ni los detalles de entrenamiento (numero de epocas, hiperparametros, idioma del corpus), lo que dificulta reproducir o auditar el resultado.
- Caveat de produccion: al tratarse de un modelo con licencia desconocida y sin soporte documentado, no se recomienda su uso en produccion sin una evaluacion interna previa y una verificacion legal de la licencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mematello/rizal-xlm-r-dapt
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-xlm-r-multilingual-v1
- Documentacion de Sentence Transformers: https://sbert.net
- Repositorio de Sentence Transformers en GitHub: https://github.com/huggingface/sentence-transformers
- Modelos con la libreria sentence-transformers en HuggingFace: https://huggingface.co/models?library=sentence-transformers
- Paper Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper TSDAE, Transformer-based Sequential Denoising Auto-Encoder (arXiv:2104.06979): https://arxiv.org/abs/2104.06979
