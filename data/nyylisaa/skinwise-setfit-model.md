# nyylisaa/skinwise-setfit-model

## Resumen

Skinwise-setfit-model es un clasificador de texto multietiqueta (en realidad multiclase, con 13 categorias mutuamente excluyentes) desarrollado por el usuario nyylisaa para categorizar ingredientes cosmeticos y activos de cuidado de la piel. El modelo se ha construido con la libreria SetFit de Hugging Face, una tecnica de aprendizaje few-shot eficiente que combina un Sentence Transformer afinado con aprendizaje contrastivo y una cabeza de clasificacion basada en una regresion logistica de scikit-learn. El cuerpo del encoder es BAAI/bge-base-en-v1.5, un transformer BERT de aproximadamente 109,48 millones de parametros.

El problema que resuelve es la clasificacion automatica de nombres de ingredientes (por ejemplo, "Quercetin", "Retinoic Acid" o "Zinc Oxide") en categorias funcionales como ANTIOXIDANT, RETINOID, UV_FILTER o HUMECTANT, entre otras. Esto es util para pipelines de analisis de formulaciones, etiquetado de INCI, buscadores de productos y sistemas de recomendacion en el sector cosmetico. La relevancia actual radica en que SetFit permite obtener un clasificador funcional con muy pocos ejemplos por clase (entre 8 y 40 muestras por etiqueta en este caso), sin necesidad de prompts ni de modelos generativos grandes.

El modelo esta pensado exclusivamente para inferencia de clasificacion de texto corto: la longitud media de las muestras de entrenamiento es de 1,98 palabras y el maximo observado es de 5 palabras, con una longitud de secuencia maxima de 512 tokens. Se publica sin licencia especificada y sin resultados de benchmarks reportados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit (Sentence Transformer BERT + cabeza de regresion logistica) |
| Parametros totales | 109.482.240 |
| Longitud de contexto | 512 tokens (longitud de secuencia maxima) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la model card no lo especifica; el encoder base BAAI/bge-base-en-v1.5 esta orientado principalmente a ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (cuerpo del Sentence Transformer) y cabeza de clasificacion LogisticRegression serializada por scikit-learn |
| Modelo base | BAAI/bge-base-en-v1.5 |
| Numero de clases | 13 |
| Pipeline | text-classification |
| Libreria | setfit |
| Tamano del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema estandar de SetFit. En primer lugar, un Sentence Transformer (BAAI/bge-base-en-v1.5, de tipo BERT) se afina con aprendizaje contrastivo para generar embeddings de frases. En segundo lugar, sobre esos embeddings se entrena una cabeza de clasificacion que en este caso es una instancia de LogisticRegression de scikit-learn. El entrenamiento se realizo con la tecnica de aprendizaje few-shot descrita en el articulo "Efficient Few-Shot Learning Without Prompts" (arXiv:2209.11055), que evita el uso de prompts y requiere muy pocos ejemplos etiquetados por clase.

Los hiperparametros reportados en la model card son: batch_size de (16, 16), num_epochs de (1, 1), max_steps de -1, estrategia de muestreo por oversampling, num_iterations de 10, learning rate del cuerpo de (2e-05, 1e-05), learning rate de la cabeza de 0,01 y funcion de perdida CosineSimilarityLoss. La informacion de la model card aparece truncada en el apartado de hiperparametros, por lo que no se dispone de todos los detalles. El conjunto de entrenamiento es muy pequeno y de texto muy corto: el recuento de palabras por muestra tiene un minimo de 1, una mediana de 1,9836 y un maximo de 5. El numero de muestras por etiqueta varia entre 8 (NIACINAMIDE y VITAMIN_C) y 40 (NON_TARGET), pasando por 33 en PEPTIDE, 30 en HUMECTANT y 27 en SOOTHING, entre otras. No se indica en la informacion disponible si hubo RLHF, DPO ni ninguna otra fase de alineacion, algo por otra parte inusual en un clasificador de este tipo.

## Capacidades

- Clasificacion de texto corto en 13 categorias funcionales de ingredientes cosmeticos: ANTIOXIDANT, BARRIER_SUPPORT, DIRECT_ACID, EMOLLIENT, HUMECTANT, NIACINAMIDE, NON_TARGET, PEPTIDE, PIGMENT_REGULATOR, RETINOID, SOOTHING, UV_FILTER y VITAMIN_C.
- Clasificacion de nombres de ingredientes o activos con entradas de muy pocas palabras (tipicamente entre 1 y 5 palabras).
- Generacion de embeddings de frases mediante el encoder BAAI/bge-base-en-v1.5, reutilizables para busqueda semantica o similitud.
- Capacidad de discriminacion de la clase NON_TARGET, que agrupa elementos fuera del ambito objetivo (por ejemplo, "Turmeric Root Extract", "Alpha-Glucan Oligosaccharide" o "Neurophroline").
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision ni audio.
- No se documenta soporte de tool calling, function calling ni comportamiento de agente.
- Capacidades multilingues: no disponibles; la model card no especifica idiomas y el encoder base esta orientado principalmente a ingles.

## Casos de uso

- Etiquetado automatico de listas INCI: dado un listado de ingredientes de un producto cosmetico, el modelo clasifica cada nombre en su categoria funcional, lo que permite generar fichas de producto o filtros de busqueda de forma automatica.
- Motor de busqueda y filtrado en e-commerce de cosmética: clasificar los activos de cada producto permite construir filtros del tipo "productos con retinoides" o "productos con filtros UV" sin etiquetado manual.
- Analisis de formulaciones para I+D cosmetico: clasificar rapidamente componentes de una formulacion para detectar funciones repetidas o ausencias (por ejemplo, comprobar si hay humectantes y emolientes en una formula).
- Enriquecimiento de bases de datos de ingredientes: normalizar y categorizar catalogos internos de materias primas provenientes de proveedores con nomenclaturas heterogeneas.
- Sistemas de recomendacion de rutinas de skincare: clasificar los activos de los productos que consume un usuario para sugerir combinaciones o advertir de solapamientos (por ejemplo, multiples retinoides o acidos).
- Moderacion y validacion de catalogos: detectar ingredientes que caen en la clase NON_TARGET para excluirlos de flujos centrados en activos de cuidado de la piel.
- Preprocesado para pipelines de NLP mas amplios: usar el modelo como etiquetador previo que alimente analisis de sentimiento de resenas, clustering de productos o sistemas de comparacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara la metrica "accuracy" en sus metadatos, pero no incluye ningun valor numerico ni conjunto de evaluacion asociado, por lo que no es posible reportar cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,44 GB en FP32 y en torno a 0,22 GB en FP16 para los 109,48 millones de parametros del encoder, mas el consumo minimo de la cabeza de regresion logistica (estimacion propia a partir del numero de parametros, no confirmada en la documentacion).
- GPU recomendadas: cualquier GPU moderna con al menos 1-2 GB de VRAM es suficiente; una NVIDIA T4, RTX 3060 o superior cubre el modelo con holgura. No requiere A100 ni H100.
- Compatibilidad con GPU de consumo: si, cabe ampliamente en cualquier GPU de consumo actual e incluso en GPUs integradas modestas.
- Ejecucion en CPU: viable, ya que el modelo es pequeno y las entradas son muy cortas.
- Opciones de despliegue: libreria setfit (carga directa con SetFitModel.from_pretrained), sentence-transformers para el encoder, y opciones de servir embeddings como text-embeddings-inference, ya que el modelo esta etiquetado como endpoints_compatible.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Notas |
|---|---|---|---|---|---|
| nyylisaa/skinwise-setfit-model | 109.482.240 | 512 tokens | Clasificacion de ingredientes cosmeticos (13 clases) | no disponible | Basado en BAAI/bge-base-en-v1.5 con cabeza LogisticRegression |
| BAAI/bge-base-en-v1.5 | ~109 millones | 512 tokens | Embeddings de frases / recuperacion | MIT (segun su model card publica) | Modelo base; no es un clasificador de categorias por si mismo |
| Otros modelos SetFit | no disponible | no disponible | Clasificacion few-shot | depende del autor | No se dispone de comparativas publicadas para el dominio cosmetico |

No se dispone de modelos directamente comparables publicados para esta tarea concreta en la informacion proporcionada. La comparacion con BAAI/bge-base-en-v1.5 es estructural (es su encoder), no de rendimiento en clasificacion. El dato de licencia del modelo base se indica a titulo orientativo y deberia verificarse en su model card original.

## Limitaciones y advertencias

- Dominio muy restringido: el modelo clasifica nombres de ingredientes cosmeticos de 1 a 5 palabras; no esta disenado ni validado para frases largas, textos generales ni otras areas.
- Entrenamiento con muy pocos datos por clase (entre 8 y 40 ejemplos), lo que aumenta el riesgo de sobreajuste y de errores en ingredientes poco representados.
- Riesgo de alucinacion en sentido de clasificacion incorrecta: nombres de ingredientes no vistos durante el entrenamiento pueden recibir una categoria erronea, especialmente si son quimicamente similares.
- La clase NON_TARGET es la mas poblada (40 ejemplos), lo que puede sesgar el modelo hacia esa categoria con entradas ambiguas.
- Idioma: la model card no especifica idiomas soportados y el encoder base esta orientado principalmente a ingles; el rendimiento con nombres en otros idiomas no esta garantizado.
- Licencia no disponible: no se puede confirmar si se permite el uso comercial, por lo que no deberia desplegarse en produccion sin aclarar este punto.
- Sin resultados de benchmarks ni evaluacion publicada: no hay evidencia cuantitativa de accuracy, precision o recall que respalde su uso en entornos criticos.
- Popularidad nula en el momento de la consulta (0 descargas y 0 likes), lo que reduce la validacion por parte de la comunidad.
- La informacion de hiperparametros de la model card aparece truncada, lo que limita la reproducibilidad completa del entrenamiento.
- No apto como modelo generativo: no produce texto ni respuestas; solo devuelve una etiqueta de clase.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nyylisaa/skinwise-setfit-model
- Modelo base BAAI/bge-base-en-v1.5: https://huggingface.co/BAAI/bge-base-en-v1.5
- Repositorio SetFit en GitHub: https://github.com/huggingface/setfit
- Articulo "Efficient Few-Shot Learning Without Prompts": https://arxiv.org/abs/2209.11055
- Blogpost sobre SetFit: https://huggingface.co/blog/setfit
- Documentacion de LogisticRegression de scikit-learn: https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LogisticRegression.html
- Documentacion de Sentence Transformers: https://www.sbert.net
