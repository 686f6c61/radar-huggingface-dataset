# ShaunDier/qaatin-multilingual-mpnet

## Resumen

qaatin-multilingual-mpnet es una conversión a ONNX del modelo de embeddings `sentence-transformers/paraphrase-multilingual-mpnet-base-v2`, publicada por el usuario ShaunDier como artefacto auxiliar del proyecto Qaatin. No se trata de un modelo nuevo ni de un reentrenamiento: los pesos son los mismos que los del modelo original de Sentence Transformers, pero reempaquetados para su uso con ONNX Runtime. El repositorio tiene un tamaño de 1,1 GB y se distribuye bajo licencia Apache 2.0.

La particularidad de esta conversión es que la tabla de embeddings de palabras se almacena por separado en un fichero `embeddings.npy`, de modo que puede leerse de disco bajo demanda en lugar de residir íntegramente en memoria. El grafo `model.onnx` acepta `inputs_embeds` (filas de esa tabla) y `attention_mask`, y devuelve un vector por cada word piece; el vector de la frase se obtiene calculando la media de todos ellos (mean pooling).

Su relevancia es limitada y muy específica: sirve como componente de inferencia ligero para el proyecto Qaatin y como ejemplo de despliegue ONNX de un encoder multilingüe. No aporta mejoras de calidad respecto al modelo base, no incluye datos de benchmarks propios y, en el momento de la consulta, no registra descargas ni interacciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (MPNet), exportado a ONNX; pooling por media de word pieces |
| Parametros totales | no disponible (el modelo base paraphrase-multilingual-mpnet-base-v2 es de tipo base, sin cifra publicada en la informacion disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio contiene una exportacion ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible en la ficha del repositorio; el modelo base es multilingue (50+ idiomas segun su model card original, no verificado aqui) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx`) mas tabla de embeddings en NumPy (`embeddings.npy`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base: un encoder transformer de tipo MPNet (variante de masked language modeling que combina enmascaramiento por tokens y permutaciones), entrenado originalmente por Sentence Transformers para producir embeddings de frase mediante aprendizaje contrastivo con pares de frases parafraseadas. Esta conversión no modifica ni reentrena los pesos; únicamente altera su representación.

El cambio técnico introducido por el autor es la separación entre el grafo de cómputo y la tabla de embeddings. El `model.onnx` recibe directamente `inputs_embeds` y `attention_mask`, lo que permite cargar solo las filas de la tabla necesarias desde `embeddings.npy` en lugar de mantener toda la matriz en memoria. La salida es un vector por word piece y el embedding de frase se calcula como media de esos vectores. El proceso de construcción está automatizado en el script `tools/build_models.py` del repositorio del proyecto Qaatin. No se documentan datos de entrenamiento adicionales, ni fases de RLHF/DPO, ni innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de embeddings de frase y de fragmentos de texto, aptos para búsqueda semántica y similitud entre textos.
- Representación multilingüe heredada del modelo base, pensada para alinear frases de distintos idiomas en un mismo espacio vectorial.
- Extracción de vectores por word piece, lo que permite construir representaciones a nivel de token además de a nivel de frase.
- Ejecución mediante ONNX Runtime, con posibilidad de aceleración por CPU o GPU según el proveedor de ejecución configurado.
- Carga parcial de la tabla de embeddings desde disco, útil en entornos con memoria limitada.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni modo de pensamiento: es exclusivamente un encoder de embeddings.

## Casos de uso

- Búsqueda semántica en corpus multilingües: indexar documentos en varios idiomas y recuperar los más similares a una consulta codificando ambos con el mismo encoder, aprovechando el espacio vectorial compartido del modelo base.
- Deduplicación de contenidos: calcular similitud coseno entre embeddings de artículos, tickets o registros para detectar duplicados y near-duplicates en pipelines de ingesta.
- Clasificación de texto por similitud a prototipos: comparar el embedding de un documento con embeddings de referencia por categoría, sin necesidad de entrenar un clasificador supervisado.
- Sistemas de recomendación basados en contenido: representar ítems y perfiles de usuario como vectores y ordenar candidatos por proximidad semántica.
- Filtrado previo en pipelines RAG: usar el encoder para una primera fase de recuperación densa antes de un reranker más costoso, reduciendo el número de candidatos a evaluar.
- Despliegue en entornos con memoria restringida: al mantener la tabla de embeddings en `embeddings.npy` y cargarla bajo demanda, el componente puede integrarse en servicios contenerizados con límites de RAM ajustados.
- Extracción de características para modelos downstream: generar embeddings de entrada para clasificadores, clusterización o análisis de temas en lugar de entrenar representaciones desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas propias (MTEB, pares de paráfrasis u otras) y no se dispone de cifras verificadas del modelo base en esta ficha; cualquier dato de rendimiento debería consultarse en la model card de `sentence-transformers/paraphrase-multilingual-mpnet-base-v2`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con cifras verificadas; el repositorio ocupa 1,1 GB, lo que da una cota superior del espacio en disco necesario para pesos y tabla de embeddings.
- GPU recomendadas: no disponible. Al ser una exportación ONNX de un encoder de tamaño base, puede ejecutarse en CPU y en GPUs de gama media, pero no se documentan configuraciones probadas.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del artefacto, aunque no hay confirmación en la información proporcionada.
- Opciones de despliegue: ONNX Runtime (principal, indicado por el autor); el modelo base también puede cargarse con sentence-transformers, pero esta conversión concreta está pensada para el flujo de Qaatin.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multilingue | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| qaatin-multilingual-mpnet (esta ficha) | no disponible | no disponible | sí (heredado del base) | Apache 2.0 | ONNX + NumPy | Conversión auxiliar del proyecto Qaatin, sin benchmarks propios |
| sentence-transformers/paraphrase-multilingual-mpnet-base-v2 | no disponible | no disponible | sí | Apache 2.0 | safetensors / PyTorch | Modelo base original; referencia canónica para embeddings multilingües |
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 | no disponible | no disponible | sí | Apache 2.0 | safetensors / PyTorch | Alternativa más ligera del mismo ecosistema; cifras de rendimiento no verificadas aqui |

La comparación se limita a la familia de Sentence Transformers porque no se dispone de datos de benchmarks ni de parámetros verificados para establecer una comparación cuantitativa con alternativas de otros proveedores.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, respuestas ni razonamiento; solo embeddings.
- Sin datos de evaluación propios: no hay benchmarks publicados en el repositorio que permitan validar la calidad de la conversión frente al modelo base.
- Sin descargas ni validación comunitaria: el repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia de uso en producción.
- Idiomas no declarados en la ficha: aunque el modelo base es multilingüe, esta conversión no especifica la lista de idiomas soportados.
- Contexto no documentado: se desconoce la longitud máxima de secuencia admitida por el grafo ONNX exportado.
- Dependencia de un formato poco estándar: el uso de `inputs_embeds` y una tabla externa en `.npy` requiere adaptar el código de inferencia; no es un drop-in replacement para pipelines estándar de sentence-transformers.
- Riesgo de sesgos heredados: al reutilizar los pesos originales, el modelo arrastra los sesgos del corpus de entrenamiento del modelo base, no analizados en esta ficha.
- Licencia Apache 2.0: permite uso comercial con atribución y conservación del aviso de licencia; conviene revisar también las condiciones del modelo base.
- Fecha de creación futura en los metadatos (2026-11-12): conviene verificar la procedencia y vigencia del repositorio antes de integrarlo en un proyecto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ShaunDier/qaatin-multilingual-mpnet
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-mpnet-base-v2
- Proyecto Qaatin: https://github.com/ShaunDier/qaatin
