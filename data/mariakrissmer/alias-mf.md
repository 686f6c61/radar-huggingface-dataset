# mariakrissmer/ALIAS-MF

## Resumen

ALIAS-MF es un modelo de embeddings de frases (sentence-transformers) desarrollado por Maria Krissmer, etiquetado como **MF** en el manuscrito del proyecto ALIAS. Se trata de un encoder BERT afinado a partir de `NeuML/pubmedbert-base-embeddings` cuyo objetivo es proyectar descripciones de celulas y texto biomedico en un espacio vectorial compartido, de modo que terminos equivalentes como "CD8 T cell" y "cytotoxic T lymphocyte" queden proximos en representacion semantica. Resuelve el problema de la alineacion semantica entre anotaciones de single-cell y literatura biomedica, una tarea habitual en pipelines de anotacion automatica de tipos celulares.

El modelo cuenta con 109.482.240 parametros (aproximadamente 110 M, coherente con una arquitectura BERT-base) y se distribuye en formato safetensors con un tamano de repositorio de 0,4 GB. Esta pensado exclusivamente para investigacion exploratoria y no ha sido validado para uso clinico, tal como advierte el propio autor en la model card.

Su relevancia actual reside en la creciente necesidad de herramientas abiertas que conecten vocabularios heterogeneos en biologia computacional: ontologias celulares, descripciones libres de experimentos y abstracts de PubMed. Al estar publicado bajo licencia MIT y ser compatible con `sentence-transformers` y `text-embeddings-inference`, puede integrarse facilmente en pipelines de recuperacion semantica y clustering de poblaciones celulares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (encoder), afinado como SentenceTransformer |
| Parametros totales | 109.482.240 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT (modelo); Apache 2.0 en el modelo base upstream |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ALIAS-MF es un encoder transformer basado en BERT, derivado de `NeuML/pubmedbert-base-embeddings`, un modelo PubMedBERT orientado a embeddings de dominio biomedico. Sobre esa base se aplico un ajuste fino supervisado para producir representaciones de frases (sentence embeddings) utilizables con similitud coseno. El identificador interno del modelo es `MO_LaManno_S9_N5_lr5e5`, lo que sugiere una tasa de aprendizaje de 5e-5 y una composicion de datos basada en los conjuntos `S9` y `N5`.

Los datasets de entrenamiento declarados son `S9_heldout_sample_semantic` y `N5_ncbi_literature`. El primero parece corresponder a un conjunto de muestras con anotaciones semanticas de celulas (posiblemente derivado de datos del laboratorio LaManno, referenciado en el identificador interno), y el segundo a literatura de NCBI/PubMed. La combinacion busca alinear descripciones celulares con texto cientifico. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF, DPO o funciones de perdida contrastivas especificas (aunque el pipeline de sentence-similarity sugiere entrenamiento con pares o tripletas).

No se documentan innovaciones tecnicas adicionales como atencion lineal, decodificacion especulativa o modos de razonamiento. El modelo es un encoder puro orientado a la generacion de embeddings, no a la generacion de texto.

## Capacidades

- Generacion de embeddings de frases y parrafos para similitud semantica y recuperacion.
- Alineacion semantica entre descripciones de tipos celulares y terminologia biomedica.
- Similitud entre sinonimos y variantes de nomenclatura celular (por ejemplo, "CD8 T cell" frente a "cytotoxic T lymphocyte").
- Busqueda semantica sobre corpus biomedicos y abstracts de PubMed.
- Clustering y agrupamiento de poblaciones celulares por similitud de descripcion.
- Integracion con `sentence-transformers` y con `text-embeddings-inference` (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible (no es un modelo generativo).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Anotacion automatica de tipos celulares: dado un conjunto de descripciones libres de clusters single-cell, el modelo genera embeddings que se comparan por similitud coseno contra un vocabulario controlado de tipos celulares, permitiendo asignar etiquetas de forma semiautomatica.
- Recuperacion semantica en literatura biomedica: indexar abstracts de PubMed y recuperar los mas relevantes para una descripcion celular concreta, usando el encoder para generar vectores consultables en un motor de busqueda vectorial.
- Normalizacion de ontologias celulares: mapear terminos heterogeneos de distintas fuentes (Cell Ontology, anotaciones libres de papers, metadatos de experimentos) a un espacio comun para facilitar la integracion de datasets.
- Deduplicacion y clustering de descripciones: agrupar descripciones redundantes o casi identicas en repositorios de metadatos biologicos mediante clustering sobre los embeddings generados.
- Construccion de pipelines de retrieval-augmented generation (RAG) en dominio biomedico: usar ALIAS-MF como retriever para alimentar un LLM generativo con fragmentos relevantes de literatura o anotaciones celulares.
- Analisis exploratorio de similitud entre experimentos: comparar conjuntos de descripciones celulares de distintos estudios para identificar poblaciones equivalentes y detectar discrepancias de anotacion.
- Servicio de embeddings en produccion: desplegar el modelo con `text-embeddings-inference` (tag `endpoints_compatible`) para exponer un endpoint de embeddings compatible con la API de Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-1 GB en FP32 para los 110 M de parametros, y menos de 0,5 GB en FP16 o cuantizacion de 8 bits.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; no requiere A100 ni H100. Una NVIDIA T4, RTX 3060, RTX 4090 o incluso una GPU integrada moderna son suficientes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer con 4 GB o mas de VRAM, e incluso en CPU para lotes pequenos.
- Opciones de despliegue: `sentence-transformers` (Python), `text-embeddings-inference` (tag `endpoints_compatible`), y potencialmente ONNX u otras rutas de exportacion no documentadas.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamano del modelo (BERT-base), se espera un throughput alto en GPU, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ALIAS-MF (este modelo) | 109.482.240 | no disponible | MIT | Hugging Face | Afinado para alineacion single-cell / literatura biomedica |
| NeuML/pubmedbert-base-embeddings | no disponible en la informacion | no disponible | Apache 2.0 | Hugging Face | Modelo base upstream, embeddings biomedicos generales |
| Otros encoders biomedicos (p. ej., BioBERT, PubMedBERT) | no disponible en la informacion | no disponible | variable | Hugging Face | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre ALIAS-MF y alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo destinado exclusivamente a investigacion exploratoria; no validado para uso clinico.
- No se declaran idiomas soportados, por lo que se desconoce su comportamiento fuera del ingles biomedico.
- No se especifica la longitud maxima de contexto, lo que limita la planificacion de pipelines con entradas largas.
- Riesgo de sesgo derivado de los corpus de entrenamiento (literatura NCBI y muestras del laboratorio LaManno), que pueden no representar toda la diversidad de dominios biologicos.
- Riesgo de alucinacion no aplica en sentido generativo (es un encoder), pero si existe riesgo de similitudes espurias en el espacio de embeddings para terminos poco representados.
- La licencia MIT del modelo convive con la licencia Apache 2.0 del modelo base upstream, cuyo texto se incluye en el repositorio; conviene revisar ambas para uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion comunitaria.
- No se documentan procesos de evaluacion independiente ni metricas de calidad de los embeddings.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mariakrissmer/ALIAS-MF
- Modelo base: https://huggingface.co/NeuML/pubmedbert-base-embeddings
- Repositorio de codigo y procedencia de datos (rama de reproducibilidad del manuscrito): https://github.com/MariaKrissmer/alias/tree/manuscript-reproducibility
