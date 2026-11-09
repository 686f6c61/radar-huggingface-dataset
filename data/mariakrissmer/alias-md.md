# mariakrissmer/ALIAS-MD

## Resumen

ALIAS-MD es un modelo de embeddings de frases (SentenceTransformer) desarrollado por Maria Krissmer, etiquetado como "MD" en el manuscrito del proyecto ALIAS. Se trata de un encoder BERT afinado a partir de NeuML/pubmedbert-base-embeddings, especializado en proyectar descripciones de tipos celulares y texto biomédico en un espacio vectorial compartido, de modo que términos equivalentes como "CD8 T cell" y "cytotoxic T lymphocyte" queden próximos en representación. Su propósito es servir de base para tareas de similitud semántica y recuperación de información en el dominio de la biología celular y la literatura biomédica.

El modelo cuenta con 109.482.240 parámetros (aproximadamente 110 millones) y se distribuye en formato safetensors con un tamaño de repositorio de 0,4 GB. Está pensado exclusivamente para investigación exploratoria y el autor declara explícitamente que no ha sido validado para uso clínico. Su relevancia radica en la creciente necesidad de representaciones densas fiables para anotación celular, búsqueda semántica en literatura científica y alineación entre ontologías biológicas y descripciones en lenguaje natural.

La ficha se elabora a partir de la información disponible en Hugging Face y la model card; los datos no publicados se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (SentenceTransformer) |
| Parametros totales | 109.482.240 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | NeuML/pubmedbert-base-embeddings (Apache 2.0) |
| Pipeline | sentence-similarity |
| Libreria | sentence-transformers |
| Etiqueta en manuscrito | MD |
| ID interno | MI_HIAI_Tcells_N1_200k_lr5e5 |
| Dataset de entrenamiento | N1_ncbi_literature |
| Tamano del repositorio | 0,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ALIAS-MD es un encoder transformer basado en BERT heredado de NeuML/pubmedbert-base-embeddings, un modelo preentrenado sobre literatura biomédica de PubMed. Sobre esa base, el proyecto ALIAS ha realizado un ajuste fino orientado a producir embeddings de frases en un espacio compartido entre descripciones celulares y texto biomédico. El identificador interno `MI_HIAI_Tcells_N1_200k_lr5e5` sugiere un entrenamiento sobre 200.000 ejemplos con una tasa de aprendizaje de 5e-5, aunque estos detalles no están confirmados en la documentación proporcionada.

El único dataset de entrenamiento documentado es `N1_ncbi_literature`, correspondiente a literatura de NCBI. No se especifica en la información disponible el número total de tokens, la composición detallada del corpus, ni si se aplicaron técnicas de RLHF, DPO o decodificación especulativa (no aplicables a un encoder de embeddings). La innovación principal del modelo es la alineación multimodal entre descripciones de tipos celulares y vocabulario biomédico dentro de un mismo espacio vectorial, lo que permite medir similitud semántica entre expresiones heterogéneas del mismo concepto biológico.

## Capacidades

- Generación de embeddings de frases para similitud semántica y búsqueda densa.
- Codificación de descripciones de tipos celulares y términos biomédicos en un espacio compartido.
- Alineación de sinónimos y variantes terminológicas (por ejemplo, "CD8 T cell" y "cytotoxic T lymphocyte").
- Recuperación de información semántica sobre literatura científica.
- Compatible con `text-embeddings-inference` y endpoints compatibles.
- Integración con la librería `sentence-transformers` mediante `SentenceTransformer.encode`.
- No soporta generación de texto, tool calling, agentes, visión ni audio: es un encoder puro.
- Capacidades multilingües: no disponibles según la información proporcionada.

## Casos de uso

- Anotación automática de tipos celulares: dado un conjunto de descripciones textuales de células procedentes de artículos o metadatos, el modelo genera embeddings que permiten agrupar y asignar etiquetas celulares por similitud semántica con un vocabulario de referencia.
- Búsqueda semántica en literatura biomédica: indexar resúmenes de PubMed y recuperar pasajes relevantes mediante similitud coseno entre el embedding de la consulta y los de los documentos.
- Normalización de ontologías celulares: alinear términos libres de anotaciones experimentales con entradas de ontologías controladas (por ejemplo, Cell Ontology) calculando la vecindad más cercana en el espacio de embeddings.
- Deduplicación de registros biológicos: detectar descripciones equivalentes de una misma población celular en bases de datos heterogéneas mediante umbrales de similitud.
- Construcción de pipelines de recuperación aumentada (RAG) en dominios biomédicos: usar los embeddings como componente de recuperación sobre corpus científicos antes de pasar el contexto a un modelo generativo.
- Análisis exploratorio de clusters celulares: proyectar descripciones de clústeres de single-cell y visualizar agrupaciones semánticas para interpretar resultados de scRNA-seq.
- Filtrado y clasificación de literatura: puntuar la relevancia semántica de artículos respecto a una consulta temática concreta sin necesidad de un clasificador supervisado adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,44 GB solo para pesos, más overhead de activaciones y tokenizador; en la práctica, menos de 1 GB para lotes pequeños.
- VRAM estimada en FP16: aproximadamente 0,22 GB para pesos.
- Cabe holgadamente en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en CPU para volúmenes moderados.
- GPU recomendadas para alto throughput: A100, H100, L4 o T4 para servir grandes lotes; para uso individual, cualquier GPU con al menos 2 GB de VRAM es suficiente.
- Opciones de despliegue: `sentence-transformers` en Python, `text-embeddings-inference` (soportado según los tags), y servidores de embeddings compatibles con endpoints. No se documenta soporte explícito de vLLM, llama.cpp u Ollama, que no están orientados a encoders BERT.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ALIAS-MD | 109,5 M | no disponible | Biomédico / single-cell | MIT | Hugging Face |
| NeuML/pubmedbert-base-embeddings | no disponible | no disponible | Biomédico (PubMed) | Apache 2.0 | Hugging Face |
| Modelos BERT-base genéricos (p. ej., bert-base-uncased) | 110 M | 512 tokens (típico en BERT-base) | General | Apache 2.0 | Hugging Face |

La comparación con alternativas específicas de embeddings biomédicos no puede completarse con los datos disponibles; los valores de contexto de los modelos comparables no se han verificado en la información proporcionada y se indican como referencia genérica de la familia BERT.

## Limitaciones y advertencias

- Modelo no validado para uso clínico; el autor lo restringe explícitamente a investigación exploratoria.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos en similitud: descripciones distintas pueden quedar próximas si comparten vocabulario biomédico genérico.
- Sesgos potenciales heredados del corpus de PubMed y del modelo base, incluyendo infrarrepresentación de ciertas poblaciones celulares o terminologías.
- Idiomas soportados no documentados; el entrenamiento parece centrado en inglés científico.
- Longitud de contexto no especificada; al derivar de BERT, es probable que esté limitada a 512 tokens, pero este dato no está confirmado.
- Sin métricas de evaluación publicadas (benchmarks, correlación semántica), lo que dificulta estimar su calidad frente a alternativas.
- Licencia MIT para los pesos, pero el modelo base es Apache 2.0; se incluye el texto de la licencia upstream en el repositorio, por lo que conviene revisar ambas para uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni evidencia de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/mariakrissmer/ALIAS-MD
- Modelo base: https://huggingface.co/NeuML/pubmedbert-base-embeddings
- Repositorio de código y procedencia del dataset (rama de reproducibilidad del manuscrito ALIAS): https://github.com/MariaKrissmer/alias/tree/manuscript-reproducibility
