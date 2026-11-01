# kokitabayashi/mpnet-base-all-nli-triplet

## Resumen

mpnet-base-all-nli-triplet es un modelo de embeddings de frases (sentence transformer) desarrollado por el usuario kokitabayashi. Se construye mediante fine-tuning de microsoft/mpnet-base sobre el conjunto de datos all-nli en formato de tripletas (anchor, positive, negative), con el objetivo de producir representaciones vectoriales densas utiles para similitud semantica, busqueda semantica y mineria de parafrasis. La relevancia de este modelo es acotada: se trata de un fine-tune comunitario con muy poca traccion (21 descargas, 0 likes) y sin verificacion de resultados, por lo que debe evaluarse como una variante experimental mas que como un modelo de referencia.

El modelo proyecta frases y parrafos a un espacio vectorial de 768 dimensiones, con una longitud maxima de secuencia de 512 tokens y similitud coseno como funcion de comparacion. Su arquitectura es un encoder MPNet (variante de transformer enmascarado que combina modelado de tokens y permutacion) seguido de una capa de pooling de media. Los pesos se distribuyen en formato safetensors y el repositorio ocupa aproximadamente 0,4 GB.

Al estar especializado en ingles y entrenado exclusivamente sobre all-nli, su utilidad practica se limita a tareas de recuperacion y comparacion semantica en ese idioma. Es un candidato razonable para prototipado rapido de sistemas de busqueda o deduplicacion, pero no sustituye a modelos de embeddings mas recientes y mejor evaluados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MPNet (encoder transformer) + pooling de media |
| Parametros totales | 109.486.464 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; compatible con cuantizacion estandar via herramientas externas) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura MPNet implementada en la libreria sentence-transformers. La pila completa es un `MPNetModel` para extraccion de caracteristicas seguido de una capa `Pooling` con modo de media y dimension de embedding de 768. MPNet combina el enmascaramiento de tokens propio de BERT con la permutacion de secuencias de XLNet, lo que le permite capturar dependencias bidireccionales sin el desajuste entre preentrenamiento y fine-tuning que afecta a los modelos puramente enmascarados.

El entrenamiento se realizo sobre all-nli, un conjunto de 100.000 muestras en formato de tripletas con columnas anchor, positive y negative. La funcion de perdida empleada es MultipleNegativesRankingLoss, habitual en el entrenamiento de retrievers densos: trata las demas muestras del lote como negativos implicitos. No se documentan fases de RLHF, DPO ni datos adicionales de entrenamiento, y no se especifica el numero total de tokens procesados ni la composicion detallada del dataset mas alla de su origen en all-nli.

## Capacidades

- Generacion de embeddings de frases y parrafos en un espacio denso de 768 dimensiones.
- Similitud textual semantica mediante distancia coseno.
- Busqueda semantica y recuperacion densa de documentos.
- Mineria de parafrasis y deteccion de duplicados cercanos.
- Clasificacion de texto basada en embeddings (con un clasificador aguas abajo).
- Agrupamiento (clustering) de textos por similitud semantica.
- Extraccion de caracteristicas (feature-extraction) para pipelines propios.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio.
- Capacidad multilingue: no, exclusivamente ingles.

## Casos de uso

- Busqueda semantica en documentacion tecnica en ingles: indexar fragmentos de hasta 512 tokens y recuperar los mas cercanos a una consulta mediante similitud coseno, aprovechando el entrenamiento sobre NLI para discriminar relaciones de implicacion y contradiccion.
- Deduplicacion de registros: generar embeddings de titulos o descripciones y agrupar los que superen un umbral de similitud coseno para eliminar duplicados en bases de datos de catalogo.
- Mineria de parafrasis en corpus de preguntas: comparar pares de frases y detectar reformulaciones, util para construir conjuntos de entrenamiento o para normalizar FAQs.
- Clasificacion de tickets de soporte: usar los embeddings como entrada de un clasificador ligero (regresion logistica o SVM) para enrutar incidencias por tematica sin necesidad de un LLM generativo.
- Filtrado de candidatos en sistemas de recomendacion de contenido: calcular la similitud entre la descripcion de un articulo y el perfil textual de un usuario para prefiltrar antes de un ranking mas costoso.
- Evaluacion de calidad de traducciones o resumenes: comparar la similitud semantica entre el texto fuente y la salida generada como metrica auxiliar, siempre que ambos esten en ingles.
- Prototipado rapido de RAG en ingles: como retriever de primera fase en un pipeline de recuperacion aumentada, con la advertencia de que su calidad no esta verificada frente a modelos mas recientes.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Metrica | all-nli-dev | all-nli-test |
|---|---|---|
| cosine_accuracy | 0,9148 | 0,9277 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, MTEB u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,44 GB solo para pesos, mas activaciones y overhead del runtime; en la practica cabe en cualquier GPU con 2 GB o mas.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU con latencia aceptable para lotes pequenos. Para alto throughput, cualquier GPU consumer moderna (RTX 3060, RTX 4090) es mas que suficiente.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 2 GB de VRAM o mas, e incluso en CPU.
- Opciones de despliegue: sentence-transformers (nativo), Hugging Face Text Embeddings Inference (TEI), ONNX Runtime, y conversion a GGUF para llama.cpp si se requiere.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Al tratarse de un encoder de 109 M de parametros, se espera un throughput alto en GPU y moderado en CPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension de embedding | Licencia | Notas |
|---|---|---|---|---|---|
| kokitabayashi/mpnet-base-all-nli-triplet | 109 M | 512 | 768 | Apache 2.0 | Fine-tune comunitario, resultados no verificados |
| sentence-transformers/all-mpnet-base-v2 | 109 M | 512 | 768 | Apache 2.0 | Referencia ampliamente evaluada en MTEB, mismo backbone MPNet |
| sentence-transformers/all-MiniLM-L6-v2 | 22 M | 256 | 384 | Apache 2.0 | Mucho mas ligero y rapido, menor calidad en tareas exigentes |
| BAAI/bge-base-en-v1.5 | 109 M | 512 | 768 | MIT | Retriever denso con buen rendimiento en MTEB |

No se dispone de datos comparativos de rendimiento medidos en las mismas condiciones para este modelo frente a las alternativas, por lo que la comparacion se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Solo soporta ingles; su uso con textos en castellano u otros idiomas producira embeddings de baja calidad.
- Entrenado exclusivamente sobre all-nli (100.000 muestras), lo que puede limitar su generalizacion a dominios muy alejados de la inferencia textual.
- Resultados de benchmarks declarados por el autor y marcados como no verificados; no hay evaluacion independiente en MTEB u otros suites.
- Riesgo de alucinacion no aplica directamente al ser un modelo de embeddings, pero si puede producir similitudes altas entre textos no relacionados semanticamente en dominios fuera de distribucion.
- Ventana de contexto de 512 tokens: los documentos mas largos deben fragmentarse, lo que puede perder contexto global.
- Traccion minima (21 descargas, 0 likes) y fecha de creacion futura en los metadatos; conviene verificar la integridad del repositorio antes de usarlo en produccion.
- Licencia Apache 2.0 permite uso comercial, pero al ser un fine-tune comunitario sin garantias, se recomienda validar su comportamiento en el dominio concreto antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kokitabayashi/mpnet-base-all-nli-triplet
- Modelo base: https://huggingface.co/microsoft/mpnet-base
- Documentacion de Sentence Transformers: https://sbert.net
- Repositorio de Sentence Transformers: https://github.com/huggingface/sentence-transformers
- Modelos con la libreria sentence-transformers: https://huggingface.co/models?library=sentence-transformers
- Paper de MPNet: https://arxiv.org/abs/2004.09297
- Paper de Sentence-BERT: https://arxiv.org/abs/1908.10084
- Paper de SimCSE: https://arxiv.org/abs/2104.08821
