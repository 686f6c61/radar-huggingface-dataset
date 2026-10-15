# Nightmak/paraphrase-multilingual-MiniLM-L12-v2

## Resumen

paraphrase-multilingual-MiniLM-L12-v2 es un modelo de embeddings de frases (sentence embeddings) que proyecta oraciones y parrafos a un espacio vectorial denso de 384 dimensiones. Esta ficha corresponde a la copia subida por el usuario Nightmak al Hub de HuggingFace, un espejo no oficial del modelo original desarrollado por el equipo de sentence-transformers. Su funcion principal es convertir texto en vectores reutilizables para busqueda semantica, clustering, similitud entre frases y mineria de parafrasis.

Tecnicamente es un transformer de tipo BERT con backbone MiniLM-L12: 12 capas, 384 dimensiones ocultas y 117.654.272 parametros totales segun los pesos safetensors. La longitud maxima de secuencia configurada es de 128 tokens y la agregacion de los embeddings de token se realiza mediante mean pooling. Su punto fuerte es el soporte multilingue (mas de 50 idiomas) combinado con un coste computacional bajo, lo que permite ejecutarlo en CPU o en GPUs de gama de entrada.

Su relevancia actual radica en que sigue siendo una pieza habitual en pipelines de recuperacion aumentada por generacion (RAG), deduplicacion de corpus y busqueda semantica multilingue donde el presupuesto de latencia o de VRAM es limitado. La licencia Apache-2.0 facilita su uso comercial, aunque al tratarse de un espejo con 0 descargas y 0 likes conviene verificar la integridad y procedencia de los pesos frente al repositorio oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (MiniLM-L12), 12 capas, 384 dimensiones ocultas, con pooling de media |
| Parametros totales | 117.654.272 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 128 tokens (max_seq_length configurado) |
| Tipos de cuantizacion | no disponible (el repositorio incluye variantes ONNX y OpenVINO, que permiten conversion a int8) |
| Idiomas soportados | mas de 50: arabe, bulgaro, catalan, checo, danes, aleman, griego, ingles, espanol, estonio, persa, finlandes, frances, gallego, gujarati, hebreo, hindi, croata, hungaro, armenio, indonesio, italiano, japones, georgiano, coreano, kurdo, lituano, letrado (leton), macedonio, mongol, marathi, malayo, birmano, noruego bokmal, neerlandes, polaco, portugues, rumano, ruso, eslovaco, esloveno, albanes, serbio, sueco, tailandes, turco, ucraniano, urdu, vietnamita |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, PyTorch, TensorFlow, ONNX, OpenVINO |
| Dimensionalidad del embedding | 384 |
| Tamano del repositorio | 4,4 GB |
| Fecha de subida (espejo) | 2026-10-15 |

## Arquitectura y entrenamiento

El modelo sigue el esquema clasico de Sentence-BERT: un codificador transformer (en este caso un BERT MiniLM-L12 de 12 capas y 384 dimensiones ocultas) seguido de una capa de pooling que agrega las representaciones de los tokens en un unico vector de 384 dimensiones. La configuracion declarada en la model card es `max_seq_length: 128`, `do_lower_case: False` y `pooling_mode_mean_tokens: True`, es decir, se aplica media ponderada por la mascara de atencion y no se utiliza el token CLS. Esta arquitectura de doble torre permite comparar pares de frases mediante similitud coseno en tiempo lineal con el numero de frases, a diferencia de los cross-encoders, que requieren evaluar cada par de forma conjunta.

La model card del repositorio no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO, por lo que estos datos se consideran no disponibles. El modelo deriva del trabajo descrito en el articulo Sentence-BERT (Reimers y Gurevych, 2019), que combina objetivos de similitud y clasificacion con arquitecturas siamesas y de tripletes para producir embeddings de frase comparables. Al tratarse de la variante MiniLM multilingue, el backbone es una destilacion ligera orientada a reducir latencia y huella de memoria manteniendo capacidad multilingue.

## Capacidades

- Generacion de embeddings de frases y parrafos en 384 dimensiones, aptos para similitud coseno y producto escalar.
- Busqueda semantica y recuperacion densa en mas de 50 idiomas, con espacio vectorial compartido entre lenguas.
- Clustering y agrupamiento de documentos o frases por similitud semantica.
- Mineria de parafrasis y deteccion de duplicados near-duplicate.
- Clasificacion de texto mediante clasificadores simples entrenados sobre los embeddings (zero-shot o few-shot con ejemplos).
- Similitud semantica entre pares de frases y ranking de candidatos.
- No soporta tool calling ni function calling: no es un modelo generativo.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de capacidades de vision, audio ni modo de pensamiento (thinking mode).
- Compatible con HuggingFace Text Embeddings Inference y con endpoints compatibles segun las etiquetas del repositorio.

## Casos de uso

- Recuperacion en pipelines RAG: indexar una base documental como vectores de 384 dimensiones y recuperar los fragmentos mas relevantes para el prompt de un LLM, con coste de memoria bajo gracias a los 117 M de parametros y a la dimensionalidad reducida.
- Busqueda semantica multilingue: un mismo indice puede consultarse en espanol, ingles, aleman o japones, de modo que una consulta en un idioma devuelve documentos escritos en otro sin traduccion previa.
- Deduplicacion de corpus: calcular similitud coseno entre pares de frases y eliminar duplicados o near-duplicates antes de entrenar otro modelo, usando umbrales configurables.
- Clustering de feedback de usuario: agrupar tickets, resenas o comentarios por tematica para priorizar incidencias, aprovechando que el modelo funciona en CPU y no requiere GPU.
- Cache semantico para asistentes: almacenar pares pregunta-respuesta y recuperar la respuesta mas cercana ante una consulta parafraseada, reduciendo llamadas a modelos generativos.
- Filtrado de contenido y moderacion por similitud: comparar entradas nuevas contra una lista de referencia de mensajes problematicos mediante distancia vectorial.
- Recomendacion de articulos o productos relacionados: representar cada item como embedding y devolver los vecinos mas cercanos en el espacio de 384 dimensiones.
- Etiquetado y enrutamiento de documentos: entrenar un clasificador ligero sobre los embeddings para asignar categorias o derivar a un equipo concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 470 MB solo para los pesos (117.654.272 parametros x 4 bytes), mas el consumo del tokenizador y de los lotes de activaciones.
- VRAM estimada en fp16: aproximadamente 235 MB; en int8, en torno a 118 MB.
- Cabe en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090 e incluso GPUs integradas con memoria compartida.
- Funciona en CPU sin GPU dedicada; su tamano reducido y su contexto de 128 tokens lo hacen adecuado para despliegues en contenedores ligeros.
- Opciones de despliegue: biblioteca sentence-transformers, HuggingFace Text Embeddings Inference (TEI), ONNX Runtime, OpenVINO, TensorFlow y endpoints compatibles de HuggingFace.
- No procede el uso de llama.cpp, Ollama o vLLM, orientados a modelos generativos con decodificacion autoregresiva.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Los datos del modelo de esta ficha proceden del repositorio de HuggingFace; los de las alternativas provienen de sus respectivas model cards publicas y pueden variar con actualizaciones.

| Modelo | Parametros | Dimension embedding | Contexto maximo | Idiomas | Licencia |
|---|---|---|---|---|---|
| Nightmak/paraphrase-multilingual-MiniLM-L12-v2 (esta ficha) | 117.654.272 | 384 | 128 tokens | mas de 50 | Apache-2.0 |
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 (original) | 117.654.272 | 384 | 128 tokens | mas de 50 | Apache-2.0 |
| sentence-transformers/paraphrase-multilingual-mpnet-base-v2 | aproximadamente 278 M | 768 | 128 tokens | mas de 50 | Apache-2.0 |
| intfloat/multilingual-e5-small | aproximadamente 118 M | 384 | 512 tokens | aproximadamente 100 | MIT |
| intfloat/multilingual-e5-base | aproximadamente 278 M | 768 | 512 tokens | aproximadamente 100 | MIT |

La diferencia clave frente a las alternativas es el compromiso entre tamano y contexto: el modelo de esta ficha es el mas ligero junto con multilingual-e5-small, pero queda limitado a 128 tokens por secuencia, mientras que las variantes e5 permiten 512.

## Limitaciones y advertencias

- Contexto maximo de 128 tokens: los textos mas largos se truncan, lo que degrada la calidad del embedding en documentos extensos.
- Dimensionalidad de 384: suficiente para recuperacion generalista, pero con menor capacidad de matiz que las variantes de 768 dimensiones.
- Al ser un modelo de embeddings no genera texto, no razona de forma multi-paso y no soporta tool calling; no debe emplearse como sustituto de un LLM.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de recuperar documentos irrelevantes por similitud coseno en dominios muy especializados.
- Los sesgos heredados de los datos de entrenamiento multilingues pueden reflejarse en los vecinos recuperados; el idioma y el dominio influyen en la calidad del embedding.
- El rendimiento en idiomas de bajos recursos incluidos en la lista (por ejemplo, birmano, georgiano o kurdo) es previsiblemente inferior al de idiomas con mas representacion.
- Este repositorio es un espejo no oficial con 0 descargas y 0 likes: conviene contrastar los pesos con el repositorio original de sentence-transformers antes de usarlo en produccion.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar la procedencia del checkpoint y la licencia del modelo base subyacente.
- El repositorio ocupa 4,4 GB por incluir multiples formatos (PyTorch, TensorFlow, ONNX, OpenVINO, safetensors); para despliegue conviene descargar solo los ficheros necesarios del formato elegido.

## Enlaces

- Modelo en HuggingFace (espejo): https://huggingface.co/Nightmak/paraphrase-multilingual-MiniLM-L12-v2
- Modelo original: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
- Documentacion de Sentence-Transformers: https://www.sbert.net
- Paper Sentence-BERT (Reimers y Gurevych, 2019): https://arxiv.org/abs/1908.10084
- Repositorio de sentence-transformers: https://github.com/UKPLab/sentence-transformers
- HuggingFace Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
