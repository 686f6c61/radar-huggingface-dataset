# fairdataihub/poster-sentry

## Resumen

PosterSentry es un clasificador multimodal ligero y optimizado para CPU que determina si un PDF es un póster científico o un documento que no lo es (artículos, actas, boletines, libros de resúmenes, etc.). Desarrollado por el FAIR Data Innovations Hub (CalMI²) como parte del pipeline de control de calidad de la plataforma posters.science, su objetivo es hacer que los pósters de congresos sean localizables, accesibles, interoperables y reutilizables (FAIR). El modelo se sitúa al inicio del pipeline, filtrando los PDFs entrantes antes de la extracción de metadatos con un LLM más costoso.

Arquitectónicamente, no es un modelo generativo ni un transformer de gran tamaño, sino un clasificador basado en regresión logística sobre un vector de características de 542 dimensiones que combina tres canales: texto (embeddings model2vec), visual (estadísticas de color, densidad de bordes, complejidad espacial) y estructural (geometría del PDF). La inferencia se realiza con numpy puro, sin necesidad de torch, y el modelo completo ocupa unos pocos megabytes. La versión actual (1.1.0) alcanza una precisión del 89,2% en un conjunto de validación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica sobre vector de caracteristicas multimodales (texto, visual, estructural) de 542 dimensiones |
| Parametros totales | No disponible (modelo ligero, cabezas almacenadas en archivo numpy .npz de 10 KB) |
| Parametros activos | No aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | No aplica (clasificador, no modelo generativo) |
| Tipos de cuantizacion | No aplica (inferencia con numpy, sin pesos cuantizados) |
| Idiomas soportados | Ingles (segun model card) |
| Licencia | MIT |
| Formato de pesos | numpy .npz (cabezas clasificadoras) y archivos del modelo base model2vec (potion-base-32M) |

## Arquitectura y entrenamiento

PosterSentry no es un transformer ni un modelo de lenguaje de gran tamano, sino un clasificador clasico sobre caracteristicas extraidas de tres canales. El canal de texto utiliza embeddings de model2vec (potion-base-32M) de 512 dimensiones para capturar el contenido semantico. El canal visual (15 dimensiones) incluye estadisticas de color, densidad de bordes, complejidad espacial FFT y proporcion de espacio en blanco. El canal estructural (15 dimensiones) recoge el numero de paginas, area, diversidad de fuentes, bloques de texto y densidad. Estos tres vectores se concatenan en uno de 542 dimensiones que alimenta una unica regresion logistica.

El entrenamiento se realizo sobre un corpus de 3.381 documentos etiquetados por tres revisores humanos (Krippendorff's alpha 0,79) con adjudicacion ciega de los 439 documentos disputados. La version 1.0.0 (agosto de 2026) entreno la cabeza sobre estas etiquetas. La version 1.1.0 (agosto de 2026) sustituyo la extraccion de caracteristicas basada en PyMuPDF (licencia AGPL) por pdfplumber y pypdfium2, ambas con licencias permisivas, y reentreno la cabeza sobre las caracteristicas re-extraidas. No se menciona el uso de RLHF ni DPO; el proceso es de aprendizaje supervisado clasico.

## Capacidades

- Clasificacion binaria de PDFs: determina si un documento es un poster cientifico o no (articulo, actas, boletin, libro de resumenes, etc.).
- Analisis multimodal: combina informacion textual, visual y estructural del PDF para tomar la decision.
- Inferencia rapida en CPU: menos de un segundo por archivo (el analisis del PDF es el cuello de botella, no la clasificacion).
- Integracion en pipelines de control de calidad: disenado para colocarse al inicio de un flujo de procesamiento de documentos.
- Compatibilidad con la pila MIT: al usar pdfplumber y pypdfium2, todo el codigo es compatible con licencias permisivas.
- No requiere GPU ni torch en tiempo de prediccion: la inferencia se realiza con numpy puro.

## Casos de uso

- Control de calidad en repositorios de posters cientificos: plataformas como posters.science pueden filtrar automaticamente los PDFs subidos para asegurar que solo los posters reales pasen a la fase de extraccion de metadatos, ahorrando costes computacionales.
- Cribado de documentos en bibliotecas digitales: instituciones academicas pueden usar PosterSentry para separar posters de articulos y actas en sus colecciones, facilitando la catalogacion.
- Automatizacion de metadatos FAIR: al identificar posters de forma fiable, se puede activar automaticamente el flujo de extraccion de metadatos estructurados (con Llama-3.1-8B-Poster-Extraction) y la generacion de JSON conforme al esquema DataCite.
- Monitorizacion de repositorios abiertos (Zenodo, Figshare): el modelo puede escanear lotes de PDFs descargados de estos repositorios para localizar posters cientificos que no esten etiquetados como tales.
- Preprocesamiento en pipelines de analisis de literatura: antes de aplicar modelos de lenguaje grandes a un corpus, PosterSentry puede filtrar los documentos que no son posters, reduciendo el ruido y el coste de computo.
- Evaluacion de calidad de colecciones: permite auditar la proporcion de posters frente a otros tipos de documentos en un repositorio, ayudando a medir la cobertura de la plataforma.

## Benchmarks y rendimiento

Los resultados publicados en la model card se basan en un conjunto de validacion independiente de 508 documentos con etiquetas humanas (tres revisores, adjudicacion ciega de los disputados):

| Metrica | Valor |
|---|---|
| Precision (held-out) | 89,2% (IC 95%: 86,2 a 91,6) |
| Macro F1 (held-out) | 0,892 |
| Precision / Recall / F1 (poster) | 0,887 / 0,897 / 0,892 |
| Precision / Recall / F1 (no-poster) | 0,897 / 0,886 / 0,892 |
| Precision out-of-fold (5-fold, 3.381 documentos) | 88,0% |
| Velocidad de clasificacion | Menos de 1 segundo por archivo en CPU |

Los errores se concentran en documentos donde el panel humano tambien estaba dividido: el acuerdo out-of-fold es del 90,3% en documentos con decision unanime y del 73,2% en documentos decididos por dos a uno.

## Requisitos de hardware

- Inferencia en CPU: el modelo esta optimizado para CPU y no requiere GPU. La clasificacion tarda menos de un segundo por archivo, siendo el analisis del PDF (extraccion de texto y renderizado) la parte mas lenta.
- Memoria: el modelo completo ocupa unos pocos megabytes (el archivo de pesos es de 10 KB, aunque el modelo base model2vec puede requerir algo mas). No se especifican requisitos minimos de RAM, pero al ser numpy puro, cualquier maquina moderna con mas de 1 GB de RAM deberia ser suficiente.
- GPU: no necesaria. No se ha probado en GPU, pero no aportaria ventaja dado el tamano del modelo.
- Opciones de despliegue: al ser una libreria Python instalable (paquete `poster-sentry` en GitHub), se puede integrar en servicios web, funciones serverless o pipelines de procesamiento por lotes. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un LLM.
- Latencia: dominada por el parsing del PDF; la clasificacion en si es practicamente instantanea.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. PosterSentry es un clasificador especializado en un dominio muy concreto (deteccion de posters cientificos) y no compite directamente con LLMs generalistas. Se podria comparar con clasificadores de documentos genericos (p. ej., basados en BERT), pero no se han publicado datos al respecto en las fuentes consultadas.

## Limitaciones y advertencias

- Sesgo hacia caracteristicas visuales y estructurales: el modelo depende en gran medida de la densidad de bordes, el numero de lineas de texto y la anchura de pagina, por lo que posters con disenos minimalistas o muy diferentes a los tipicos podrian clasificarse incorrectamente.
- Errores en documentos ambiguos: la precision cae al 73,2% en documentos donde los revisores humanos no se ponen de acuerdo, lo que indica que hay una frontera difusa entre posters y otros formatos.
- Idioma: el modelo esta entrenado principalmente con documentos en ingles (segun la model card). Su rendimiento en otros idiomas no esta documentado.
- Dependencia de la calidad del PDF: la extraccion de caracteristicas depende de pdfplumber y pypdfium2; PDFs escaneados o con texto no extraible pueden degradar el rendimiento.
- Version antigua superada: los pesos anteriores a abril de 2026 (entrenados con etiquetas heuristicas) quedan obsoletos y no deben usarse en produccion.
- Licencia MIT: permite uso comercial, pero el modelo base model2vec (potion-base-32M) tiene su propia licencia (MIT tambien, segun la informacion disponible), por lo que no hay restricciones adicionales conocidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fairdataihub/poster-sentry
- Repositorio del paquete instalable: https://github.com/fairdataihub/poster-sentry
- Codigo de entrenamiento: https://github.com/fairdataihub/poster-sentry-training
- Dataset de entrenamiento validado por humanos: https://huggingface.co/datasets/fairdataihub/poster-sentry-training-data
- Codigo del paper de evaluacion: https://github.com/fairdataihub/poster-sentry-evaluation-paper-code
- Modelo de extraccion de posters (Llama-3.1-8B): https://huggingface.co/fairdataihub/Llama-3.1-8B-Poster-Extraction
- Libreria poster2json: https://pypi.org/project/poster2json/ · https://fairdataihub.github.io/poster2json/ · https://github.com/fairdataihub/poster2json
- Esquema de metadatos poster-json-schema: https://github.com/fairdataihub/poster-json-schema
- Plataforma posters.science: https://posters.science
- Blog de presentacion: https://fairdataihub.org/blog/meet-postersentry
- Material de la charla BOSC 2026: https://github.com/fairdataihub/postersentry-BOSC-2026
