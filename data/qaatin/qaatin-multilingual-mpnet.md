# qaatin/qaatin-multilingual-mpnet

## Resumen

qaatin-multilingual-mpnet es una conversión a formato ONNX del modelo de embeddings `sentence-transformers/paraphrase-multilingual-mpnet-base-v2`, publicada por el usuario qaatin para su uso con la herramienta Qaatin. No se trata de un modelo nuevo entrenado desde cero, sino de una reempaquetado de los pesos originales de Sentence Transformers con dos modificaciones: la exportación del grafo a ONNX Runtime (`model.onnx`) y la separación de la tabla de embeddings en un fichero independiente (`embeddings.npy`) que se lee desde disco bajo demanda.

La arquitectura subyacente es un transformer encoder basado en MPNet (variante de preentrenamiento enmascarado y permutacional) con 12 capas y dimensión oculta de 768, el mismo backbone que el modelo base multilingüe de Sentence Transformers. El objetivo del reempaquetado es permitir inferencia ligera sin depender del stack completo de PyTorch, manteniendo la misma calidad de representación semántica que el original.

Es relevante para desarrolladores que necesiten generar embeddings multilingües en entornos con restricciones de memoria o que quieran cargar la tabla de embeddings de forma perezosa desde disco. La ficha se basa exclusivamente en los metadatos y la model card disponibles; no se han publicado benchmarks propios ni detalles adicionales de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder MPNet (base_model: paraphrase-multilingual-mpnet-base-v2) |
| Parametros totales | no disponible (el modelo base MPNet base ronda los 278 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base admite hasta 512 tokens, dato no confirmado en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (el repo contiene ONNX; no se especifican variantes cuantizadas) |
| Idiomas soportados | no disponible en los metadatos; el modelo base es multilingue (50+ idiomas segun su model card original, no confirmado aqui) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx`) + tabla de embeddings en `embeddings.npy` |

## Arquitectura y entrenamiento

El modelo es una exportacion a ONNX Runtime del checkpoint `sentence-transformers/paraphrase-multilingual-mpnet-base-v2`. La arquitectura subyacente es MPNet, un transformer encoder que combina enmascaramiento de tokens con permutacion de posiciones durante el preentrenamiento, lo que le permite modelar dependencias entre tokens sin depender exclusivamente de la posicion absoluta. El modelo base fue entrenado por Sentence Transformers para producir embeddings de frase mediante objetivos de similitud contrastiva sobre pares de frases multilingues.

La modificacion introducida por qaatin es puramente de empaquetado: `model.onnx` acepta `inputs_embeds` (filas de la tabla de embeddings) y `attention_mask`, y devuelve un vector por word piece; el vector de frase se obtiene como la media de esos vectores. La tabla de embeddings se almacena por separado en `embeddings.npy` para poder leerla desde disco segun necesidad, lo que reduce la huella en memoria al cargar el grafo. El proceso de construccion se realiza con `tools/build_models.py`. No se ha realizado entrenamiento adicional ni fine-tuning sobre los pesos originales.

## Capacidades

- Generacion de embeddings de frase y de word pieces en formato ONNX, aptos para busqueda semantica y similitud textual.
- Inferencia con ONNX Runtime, sin dependencia de PyTorch en tiempo de ejecucion.
- Carga perezosa de la tabla de embeddings desde `embeddings.npy`, util para entornos con memoria limitada.
- Capacidades multilingues heredadas del modelo base (no confirmadas en los metadatos de este repo).
- No soporta generacion de texto, tool calling, agentes ni razonamiento multi-paso: es un modelo de representacion, no un LLM generativo.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Busqueda semantica en produccion: el modelo genera embeddings de consultas y documentos que se indexan en un motor vectorial; la exportacion ONNX permite desplegarlo en servicios ligeros sin PyTorch.
- Deduplicacion de textos multilingues: comparar embeddings de articulos o registros para detectar duplicados con umbral de similitud coseno, aprovechando la naturaleza multilingue del modelo base.
- Clasificacion de textos por similitud a prototipos: calcular el embedding de cada clase y asignar la etiqueta mas cercana, sin entrenar un clasificador supervisado.
- Sistemas de recomendacion basados en contenido: representar items y perfiles de usuario como vectores para recuperar candidatos por similitud.
- Agrupamiento (clustering) de documentos: generar embeddings y aplicar k-means o HDBSCAN para organizar corpus no etiquetados.
- RAG ligero en el borde: usar el modelo en un servicio ONNX de baja latencia para embeber fragmentos de conocimiento en un pipeline de recuperacion aumentada.
- Filtrado de resenas o moderacion asistida: medir la cercania de un texto a prototipos de contenido no deseado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MTEB, similitud semantica ni comparaciones numericas con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repo pesa 1,1 GB, lo que sugiere pesos en precision completa (fp32) para un modelo base de ~278 M de parametros; en fp16 o int8 la huella se reduciria aproximadamente a la mitad o a un cuarto, respectivamente (estimacion, no dato publicado).
- GPU recomendadas: no disponible. Por tamano, cualquier GPU con al menos ~2 GB de VRAM libre deberia poder ejecutar el grafo en fp32 (estimacion).
- Cabe en GPU de consumo: previsiblemente si, en tarjetas con 4 GB o mas (GTX 1650, RTX 3050, RTX 4060, etc.), aunque no hay confirmacion oficial.
- Opciones de despliegue: ONNX Runtime (principal, segun la model card); compatible con servidores de inferencia que acepten ONNX, como Triton u ONNX Runtime Server (no confirmado en la informacion).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| qaatin/qaatin-multilingual-mpnet | no disponible (~278 M estimado) | no disponible | Apache 2.0 | ONNX + .npy | Reempaquetado ONNX del modelo base |
| sentence-transformers/paraphrase-multilingual-mpnet-base-v2 | ~278 M (no confirmado) | 512 tokens (no confirmado) | Apache 2.0 | PyTorch / safetensors | Modelo original, ecosistema Sentence Transformers |
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 | ~118 M (no confirmado) | 128 tokens (no confirmado) | Apache 2.0 | PyTorch | Alternativa mas ligera y rapida, menor calidad en algunos benchmarks |

Los datos de parametros y contexto de los modelos comparados no estan confirmados en la informacion proporcionada y se indican como referencia orientativa; no se dispone de comparaciones de rendimiento.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, codigo ni respuestas; solo representaciones vectoriales.
- La calidad de los embeddings depende integramente del modelo base; este reempaquetado no introduce mejoras de rendimiento.
- Los metadatos no declaran idiomas soportados; la cobertura multilingue se hereda del modelo base y no esta verificada en este repo.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha: no hay evidencia de uso en produccion ni validacion externa.
- La estrategia de lectura perezosa de `embeddings.npy` anade complejidad operativa (gestion de ficheros, E/S de disco) frente a un checkpoint convencional.
- Riesgo de alucinacion no aplica en sentido estricto, pero la similitud coseno puede producir falsos positivos en textos cortos o dominios muy especializados.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y de los datos con los que fue entrenado antes de desplegarlo.
- No se especifican requisitos de version de ONNX Runtime ni de opset; posibles incompatibilidades con versiones antiguas del runtime.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qaatin/qaatin-multilingual-mpnet
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-mpnet-base-v2
- Repositorio de la herramienta Qaatin: https://github.com/ShaunDier/qaatin
- No se han encontrado papers, blogs ni demos adicionales en la informacion proporcionada.
