# GhostScientist/my-embeddinggemma-2-finetuned

## Resumen

my-embeddinggemma-2-finetuned es un modelo de embeddings de frases publicado por el usuario GhostScientist en HuggingFace. Se trata de un fine-tuning de google/embeddinggemma-2 realizado con la libreria sentence-transformers, orientado a tareas de similitud semantica: dado un texto, produce un vector denso de 768 dimensiones normalizado (similitud coseno) que puede emplearse para busqueda semantica, mineria de parafrasis, clasificacion y clustering. La arquitectura subyacente es un transformer encoder (EmbeddingGemma2Model) con una capa de pooling de media seguida de normalizacion L2.

El dato mas relevante para evaluar este modelo es su escala de entrenamiento: el propio autor declara un dataset de solo 3 muestras de entrenamiento con las columnas anchor, positive y negative, y funciones de perdida MultipleNegativesRankingLoss. Esto lo convierte en un artefacto de demostracion o prueba tecnica, no en un modelo listo para produccion. El repositorio acumula 0 descargas y 0 likes en el momento de la consulta y no declara licencia ni idiomas soportados.

Es relevante ahora unicamente como ejemplo de pipeline de fine-tuning sobre la familia EmbeddingGemma de Google y como caso de estudio de como NO documentar un modelo: la model card presenta valores corruptos (una longitud de contexto que es un desbordamiento numerico) y una lista de modalidades (texto, imagen, audio, video, mensaje) que parece plantilla autogenerada sin respaldo real. Se recomienda tratar sus resultados con extrema cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (EmbeddingGemma2Model) + pooling de media + normalizacion L2 |
| Parametros totales | 271.002.648 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el valor declarado en la model card, 1000000000000000019884624838656, es un desbordamiento numerico y no es fiable) |
| Tipos de cuantizacion | no disponibles; el autor solo publica pesos en safetensors |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Dimension del embedding | 768 |
| Funcion de similitud | similitud coseno |
| Libreria | sentence-transformers |
| Tamano del repositorio | 0,6 GB |
| Pipeline | sentence-similarity |

## Arquitectura y entrenamiento

El modelo sigue el patron clasico de sentence-transformers: un codificador transformer que produce representaciones por token (last_hidden_state), una capa de pooling que agrega esas representaciones mediante media (pooling_mode: mean, include_prompt: True) y una normalizacion final que deja el vector resultante en la esfera unidad para permitir similitud coseno directa. La salida es un vector denso de 768 dimensiones. La arquitectura del modulo transformer se identifica como EmbeddingGemma2Model, derivada de google/embeddinggemma-2 en la revision 914f7f89142e33e77833254d9c9b90c3cef7303b.

El entrenamiento se realizo sobre un dataset sin nombre de tan solo 3 muestras, con columnas anchor, positive y negative. Los textos son muy cortos: el ancla oscila entre 10 y 15 tokens, el positivo entre 13 y 17 y el negativo entre 12 y 14. La perdida empleada es MultipleNegativesRankingLoss, que es una funcion contrastiva tipica en el entrenamiento de embeddings, pero aplicada aqui a una cantidad de datos insignificante. Del contenido de la model card no se deduce el numero total de tokens de entrenamiento, la composicion del corpus ni si se aplico RLHF, DPO u otra etapa de alineamiento. La etiqueta generated_from_trainer indica que se genero con las utilidades automaticas de sentence-transformers.

Conviene senalar dos anomalias tecnicas de la model card: la longitud maxima de secuencia declarada es un entero de desbordamiento (1e36 tokens), que carece de sentido, y la lista de modalidades (texto, imagen, audio, video, mensaje) parece proceder de una plantilla generica en lugar de describir capacidades reales del modelo. No hay evidencia en la informacion proporcionada de que el modelo procese imagen, audio o video.

## Capacidades

- Generacion de embeddings de frases y parrafos: transforma texto en vectores densos de 768 dimensiones.
- Similitud semantica textual: calculo de similitud coseno entre pares de textos.
- Busqueda semantica: codificacion diferenciada de consultas (encode_query) y documentos (encode_document), lo que sugiere una asimetria pensada para recuperacion.
- Mineria de parafrasis: deteccion de textos con significado equivalente.
- Clasificacion de texto y clustering: mediante el uso de los embeddings como caracteristicas.
- Soporte de multiples modalidades declarado en la model card (texto, imagen, audio, video, mensaje), si bien no hay evidencia ni ejemplos de uso para modalidades distintas de texto.
- No se declara soporte de tool calling, function calling, razonamiento multi-paso ni modo de pensamiento, algo esperable en un modelo de embeddings y no generativo.

## Casos de uso

- Busqueda semantica en documentacion interna: el modelo permite indexar documentos (encode_document) y consultas (encode_query) por separado, y recuperar los fragmentos mas cercanos por similitud coseno. Solo seria adecuado si el corpus es muy pequeno y no requiere alta precision, dado el caracter de demo del modelo.
- Deduplicacion de registros: agrupar entradas de bases de datos que expresan lo mismo con palabras distintas mediante clustering sobre los embeddings de 768 dimensiones.
- Clasificacion de tickets de soporte: usar los embeddings como entrada a un clasificador ligero (regresion logistica o SVM) para enrutar incidencias por tematica.
- Mineria de parafrasis en corpus de textos cortos: detectar frases equivalentes en resenas o preguntas frecuentes.
- Prototipado de sistemas RAG: como componente de recuperacion en una prueba de concepto donde la calidad final no sea critica.
- Filtro de similitud previo a un LLM: descartar candidatos irrelevantes antes de enviarlos a un modelo generativo, reduciendo coste de inferencia.
- Ejemplo didactico de fine-tuning con sentence-transformers: util para ilustrar el flujo de MultipleNegativesRankingLoss y el guardado de artefactos, no para evaluar rendimiento real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas MTEB, MMLU, HumanEval ni equivalentes, y el repositorio no registra descargas ni evaluaciones de terceros. Ademas, con solo 3 muestras de entrenamiento no seria metodologicamente valido extrapolar mejoras frente al modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32 aproximadamente 1,1 GB (271M parametros x 4 bytes); en FP16/BF16 aproximadamente 0,54 GB; en INT8 aproximadamente 0,27 GB. A estas cifras hay que sumar el coste de activaciones, bajo para entradas cortas.
- GPU recomendadas: cualquier GPU moderna sirve; una NVIDIA T4, RTX 3060, RTX 4090, A100 o H100 son mas que suficientes para la inferencia.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo con 4 GB o mas de VRAM, e incluso en CPU para volumenes moderados.
- Opciones de despliegue: sentence-transformers (recomendado, es la libreria nativa), transformers, exportacion a ONNX para inferencia optimizada, Text Embeddings Inference (TEI) y vLLM en modo embedding. La conversion a GGUF para llama.cpp u Ollama es teoricamente posible pero no se publica ninguna variante GGUF.
- Latencia y throughput estimados: no disponibles. No se publican mediciones del autor ni de terceros.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GhostScientist/my-embeddinggemma-2-finetuned | 271M | 768 | no disponible (valor declarado corrupto) | no disponible | HuggingFace, 0 descargas |
| google/embeddinggemma-2 (modelo base) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | HuggingFace |
| sentence-transformers/all-MiniLM-L6-v2 | ~22M | 384 | 256 tokens | Apache 2.0 | HuggingFace, ampliamente usado |
| intfloat/multilingual-e5-base | ~278M | 768 | 512 tokens | MIT | HuggingFace, ampliamente usado |

La comparativa con alternativas de la misma categoria (embeddings densos multilingues de tamano medio) solo puede hacerse de forma cualitativa: este fine-tuning parte de una base razonable pero apenas modifica el modelo, por lo que no cabe esperar que supere al modelo base ni a referencias asentadas como all-MiniLM-L6-v2 o multilingual-e5-base. Los datos de los modelos de referencia proceden de fuentes publicas generales y no de la informacion proporcionada en esta ficha.

## Limitaciones y advertencias

- Entrenamiento con 3 muestras: el fine-tuning es practicamente inapreciable y no hay garantia de que mejore al modelo base en ninguna tarea.
- Longitud de contexto no fiable: la model card declara un valor corrupto (desbordamiento numerico), por lo que la ventana real de tokens es desconocida.
- Idiomas no declarados: no se especifica que lenguas soporta el modelo; el ejemplo de uso esta en ingles.
- Sesgos conocidos: no se documentan. Al no haber informacion sobre el corpus de entrenamiento (mas alla de 3 pares), no es posible auditar sesgos.
- Riesgo de alucinacion: bajo en sentido estricto (no genera texto), pero alto riesgo de recuperacion irrelevante si se usa en produccion por falta de validacion.
- Restricciones de licencia: la licencia es "no disponible", lo que impide determinar si se permite el uso comercial. No deberia usarse en produccion sin aclarar este punto.
- Modalidades declaradas sin respaldo: la model card lista imagen, audio, video y mensaje sin evidencia de soporte real; asumir esas capacidades seria un error.
- Cero adopcion: 0 descargas y 0 likes implican ausencia de validacion externa, de informes de errores y de mantenimiento.
- Model card autogenerada: varios campos (contexto, modalidades, dataset) provienen de plantillas sin rellenar o con valores invalidos, lo que reduce la fiabilidad de toda la documentacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GhostScientist/my-embeddinggemma-2-finetuned
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Documentacion de Sentence Transformers: https://sbert.net
- Repositorio de Sentence Transformers en GitHub: https://github.com/huggingface/sentence-transformers
- Modelos de la libreria sentence-transformers en HuggingFace: https://huggingface.co/models?library=sentence-transformers
- Paper de MultipleNegativesRankingLoss (referencia arxiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper de referencia arxiv:1807.03748: https://arxiv.org/abs/1807.03748
