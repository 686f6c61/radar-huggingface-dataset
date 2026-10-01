# blackcow63/excel-chunker

## Resumen

excel-chunker es una coleccion de redes neuronales de grafos (GNN) que clasifican cada celda de una hoja de calculo en uno de 13 roles estructurales: valor, cabecera de columna y de fila en tres niveles de anidamiento, agregacion, metadatos, comentario, basura y vacia. No es un modelo de lenguaje: la entrada es un grafo de celdas construido a partir de un fichero `.xlsx` y la salida es una etiqueta por nodo. El objetivo es habilitar chunking con conciencia de estructura para sistemas de recuperacion aumentada (RAG) sobre hojas de calculo, un formato que los pipelines basados en texto plano suelen destrozar.

Lo publica blackcow63 (repositorio asociado al trabajo de Zofia Smolen, arXiv:2609.20732) bajo licencia Apache 2.0 y esta implementado en PyTorch con PyTorch Geometric. El repositorio incluye dos checkpoints: un GAT con atencion en aristas de 2,18 M de parametros y un DualModalityGNN de 1,93 M de parametros con flujos estructural y de contenido. Ambos son modelos de fold de validacion cruzada, entrenados sobre 4/5 del corpus anotado, y se seleccionaron como el mejor de 15 entrenamientos (3 semillas x 5 folds) segun macro-F1 agrupado.

Su relevancia actual es acotada pero concreta: el Q&A sobre hojas de calculo exige interpretar la rejilla (que es cabecera, que es dato, que es agregado) antes de trocear el contenido. Con 2 M de parametros, los modelos se ejecutan en CPU y sirven como componente de preprocesado dentro de pipelines de ingesta documental, no como modelo autonomo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GAT con atencion en aristas (checkpoint `gat/`) y DualModalityGNN con flujos estructural y de contenido (checkpoint `dual_modality_gnn/`) |
| Parametros totales | 2,18 M (GAT) y 1,93 M (DualModalityGNN) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: la entrada es un grafo de celdas, con features de nodo de 857 dimensiones y de arista de 23 dimensiones |
| Tipos de cuantizacion | no disponibles; los pesos se publican en precision completa |
| Idiomas soportados | no disponible (la model card no documenta idiomas del corpus ni de las celdas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) y checkpoint PyTorch (`pytorch_checkpoint.pt`, serializado con pickle) |
| Tarea | Clasificacion de nodos en grafo (13 clases de rol estructural de celda) |
| Clases de salida | `value`, `aggregation`, `header`, `metadata`, `comment`, `empty`, `junk`, `col_header_1`, `col_header_2`, `col_header_3`, `row_header_1`, `row_header_2`, `row_header_3` |
| Metrica principal | macro-F1 de 13 clases con matrices de confusion agrupadas por hoja |

## Arquitectura y entrenamiento

El checkpoint `gat/` es un Graph Attention Network con atencion en aristas, la arquitectura que el paper emplea de extremo a extremo en el pipeline de RAG y la que obtiene mejor calidad RAG final en la evaluacion de panel abierto del articulo. El checkpoint `dual_modality_gnn/` es un DualModalityGNN que procesa dos flujos en paralelo, uno estructural (topologia de la rejilla) y otro de contenido (valores de las celdas), y logra el mejor macro-F1 de clasificacion entre todas las arquitecturas probadas. Ambos operan sobre un grafo construido por el pipeline de features de excel-chunker, con features de nodo de 857 dimensiones y de arista de 23 dimensiones, cuyo `graph_config` queda registrado en `config.json`.

El protocolo de entrenamiento es una validacion cruzada de 5 folds repetida con 3 semillas, 15 ejecuciones por arquitectura. La metrica canonica del paper es el macro-F1 agrupado dentro de una ejecucion sobre las celdas de test del fold reservado. Los checkpoints publicados corresponden a la ejecucion con mejor macro-F1: GAT con semilla 10042010 y fold 4, y DualModalityGNN con semilla 10042010 y fold 1. No se documentan en la informacion disponible el numero de tokens, la composicion del dataset ni si hubo RLHF o DPO (no aplica, al no ser un modelo generativo). Las cifras por clase y por ejecucion estan en `config.json`, bajo `provenance`.

## Capacidades

- Clasificacion de celdas de hojas de calculo en 13 roles estructurales, incluyendo cabeceras de fila y columna anidadas hasta tres niveles.
- Distincion de contenido no tabular: metadatos, comentarios, celdas vacias y celdas marcadas como basura.
- Deteccion de celdas de agregacion (totales, subtotales), utiles para no mezclarlas con valores de datos.
- Entrada basada en grafo, por lo que la prediccion depende de la posicion relativa de cada celda y no solo de su contenido.
- No es un modelo generativo: no produce texto, no responde preguntas y no mantiene conversaciones.
- No soporta tool calling ni function calling.
- No dispone de modo de razonamiento explicito, vision, audio ni capacidades multimodales.
- No hay datos publicados sobre capacidades multilingues ni sobre comportamiento diferencial por idioma de las celdas.

## Casos de uso

- Chunking con conciencia de estructura para RAG: el modelo etiqueta cada celda y permite agrupar automaticamente las cabeceras con los valores que gobiernan, de modo que cada fragmento indexado contenga una unidad semantica completa en lugar de filas sueltas sin contexto.
- Q&A sobre libros contables y financieros: al identificar `value` frente a `aggregation` y frente a cabeceras de tres niveles, un asistente puede responder preguntas sobre una hoja sin confundir un total con un dato de partida ni perder el nivel jerarquico de la cabecera.
- Normalizacion de hojas heredadas: la deteccion de `junk`, `comment`, `metadata` y `empty` permite descartar ruido antes de indexar y reducir el volumen de contenido enviado al LLM generador.
- Reconstruccion de tablas con cabeceras multinivel: los roles `col_header_1`, `col_header_2` y `col_header_3` permiten reconstruir la ruta completa de una columna, algo que los parsers planos no resuelven.
- Enriquecimiento de indices de busqueda: los comentarios y metadatos se pueden indexar como campos independientes del valor de la celda, mejorando la precision de la recuperacion en corpus de hojas de calculo corporativas.
- Preprocesado para agentes y herramientas de hoja de calculo: integrado en pipelines tipo LangChain, CrewAI o servidores MCP, aporta el contexto semantico que estos agentes necesitan para operar sobre `.xlsx` sin leer la rejilla a ciegas.
- Generacion de datos etiquetados: las predicciones pueden usarse como etiquetado debil para entrenar o evaluar otros parsers de hojas de calculo.
- Reproduccion academica: los checkpoints permiten replicar los resultados del paper y analizar el comportamiento por clase con las matrices de confusion registradas en `provenance`.

## Benchmarks y rendimiento

| Modelo | macro-F1 agrupado (checkpoint publicado) | Media ± SD de arquitectura (15 ejecuciones) |
|---|---|---|
| DualModalityGNN | 0,830 | 0,749 ± 0,057 |
| GAT | 0,815 | 0,672 ± 0,091 |
| SpatialEdgeTransformer | no disponible | 0,726 ± 0,049 |
| AdjTransformer | no disponible | 0,718 ± 0,064 |
| GCN | no disponible | 0,629 ± 0,081 |
| MLP sin grafo | no disponible | 0,584 ± 0,075 |

Los valores de la segunda columna proceden de los checkpoints publicados, seleccionados como el mejor de 15 ejecuciones; los de la tercera son la media y la desviacion tipica de la arquitectura sobre las 15 ejecuciones. La comparacion directa entre ambas columnas sobreestima el rendimiento esperado del checkpoint. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de modelos de lenguaje, que no aplican a este tipo de modelo.

## Requisitos de hardware

- Inferencia en CPU: con 2,18 M y 1,93 M de parametros, los pesos ocupan del orden de 8-9 MB en precision completa y la inferencia es viable en CPU sin GPU.
- VRAM estimada: por debajo de 1 GB en cualquier configuracion; el cuello de botella no es el modelo sino el tamano del grafo de cada hoja.
- GPU recomendadas: ninguna en particular; cualquier GPU consumer de los ultimos anos (RTX 3060, RTX 4090) es mas que suficiente, y en la mayoria de casos innecesaria.
- Cabe en GPU consumer: si, en cualquier modelo con al menos 1 GB de memoria libre, y tambien en entornos sin GPU.
- Opciones de despliegue: PyTorch con PyTorch Geometric, cargando `model.safetensors` con `safetensors.torch.load_file` o el checkpoint `.pt` con `torch.load(..., weights_only=False)`. No aplican vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles. Dependen del numero de celdas por hoja y de la configuracion del grafo, y la model card no publica mediciones.

## Comparativa con modelos similares

En la informacion disponible no se han identificado checkpoints alternativos publicos que resuelvan la misma tarea de clasificacion de roles de celda en 13 clases. La comparativa se limita a los dos checkpoints publicados y a las lineas base del propio paper. Las herramientas encontradas en la busqueda web (Chunkr, excel-parser, Excel_Chunker) son utilidades de troceado o parseo, no modelos comparables.

| Modelo | Parametros | Enfoque | macro-F1 (media ± SD) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DualModalityGNN (excel-chunker) | 1,93 M | GNN con flujos estructural y de contenido | 0,749 ± 0,057 | Apache 2.0 | Checkpoint publicado en HuggingFace |
| GAT (excel-chunker) | 2,18 M | GAT con atencion en aristas | 0,672 ± 0,091 | Apache 2.0 | Checkpoint publicado en HuggingFace |
| SpatialEdgeTransformer | no disponible | Transformer con sesgo espacial | 0,726 ± 0,049 | no disponible | No se publica checkpoint |
| AdjTransformer | no disponible | Transformer sobre matriz de adyacencia | 0,718 ± 0,064 | no disponible | No se publica checkpoint |
| GCN | no disponible | Graph Convolutional Network | 0,629 ± 0,081 | no disponible | No se publica checkpoint |
| MLP sin grafo | no disponible | Perceptron multicapa sobre features de celda | 0,584 ± 0,075 | no disponible | No se publica checkpoint |

## Limitaciones y advertencias

- Artefacto de investigacion: la model card lo declara explicitamente como material para reproducir el paper y para experimentos de chunking y RAG, no como modelo listo para produccion.
- Cada checkpoint es un modelo de fold, entrenado sobre 4/5 del corpus anotado, no un modelo reentrenado sobre el corpus completo.
- Sesgo de seleccion: los valores 0,815 y 0,830 corresponden al mejor de 15 entrenamientos. La expectativa realista es la media de arquitectura (0,672 y 0,749) con la desviacion indicada, no el maximo.
- Clases minoritarias: las cabeceras profundamente anidadas (`col_header_3`, `row_header_3`) son raras en el corpus y su F1 varia fuertemente entre folds. Conviene consultar `provenance.per_class_f1_this_run` antes de confiar en esas clases.
- Dependencia del pipeline: la entrada debe generarse con la misma configuracion de construccion de grafo registrada en `config.json` -> `model_config.graph_config`. Otra configuracion de features invalida las predicciones.
- No es un modelo de lenguaje: no genera texto, no responde preguntas ni admite instrucciones; necesita un LLM aparte para el componente generativo del RAG.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si hay riesgo de clasificacion erronea de celdas ambiguas, que se propaga como contexto incorrecto al LLM que consuma los chunks.
- Idiomas: no hay informacion sobre el idioma del corpus de entrenamiento ni sobre el comportamiento con hojas en otros idiomas, lo que impide garantizar su funcionamiento fuera del dominio evaluado.
- Sesgos conocidos: no documentados en la informacion disponible.
- Carga del checkpoint `.pt`: requiere `torch.load(..., weights_only=False)`, lo que implica deserializar pickle. Por seguridad en produccion, usar la copia en safetensors.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion externa de la comunidad.
- Licencia Apache 2.0: permite uso comercial y modificacion, con obligacion de conservar el aviso de licencia y sin garantias de ningun tipo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/blackcow63/excel-chunker
- Paper: Q&A on Any Spreadsheet Requires Interpreting Its Grid Structure (Zofia Smolen, arXiv:2609.20732): https://arxiv.org/abs/2609.20732
- Excel_Chunker (proyecto independiente de troceado de Excel para LLM): https://github.com/aswinved/Excel_Chunker
- excel-parser (parser XLSX para LLM y RAG): https://github.com/knowledgestack/excel-parser
- Chunkr, API de inteligencia documental: https://chunkr.ai/
- Documentacion del parser de Excel de Chunkr: https://docs.chunkr.ai/pages/v1/excel-parser/overview
- ExcelGPT (aplicacion conversacional sobre hojas de calculo): https://excelgpt.app/
