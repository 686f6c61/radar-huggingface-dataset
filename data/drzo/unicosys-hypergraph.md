# drzo/unicosys-hypergraph

## Resumen

Unicosys Hypergraph es un modelo de embedding de grafos de conocimiento desarrollado por el usuario drzo (el pipeline de origen se atribuye a hyperholmes/unicosys). No es un modelo de lenguaje generativo: su funcion es codificar una hipergrafica unificada de evidencia (transacciones, correos, entidades y documentos legales) en representaciones vectoriales entrenables, con una tarea principal de prediccion de enlaces. El modelo publicado corresponde al caso legal 2025-137857 y esta pensado como artefacto especifico de ese corpus, no como modelo de proposito general.

Arquitectonicamente combina un codificador de texto de 2 capas tipo Transformer (4 cabezas) para las etiquetas de nodo, una red de atencion sobre grafo (GAT) de 2 capas y 4 cabezas para propagar informacion por la estructura, y un predictor de enlaces MLP de 2 capas entrenado con perdida de ranking por margen. El total declarado es de 34.762.497 parametros, con embeddings de nodo de 128 dimensiones estructurales y 256 dimensionales de texto, y dimension oculta de 256.

Su relevancia es acotada pero concreta: demuestra un patron reproducible para convertir un corpus documental heterogeneo (en este caso, casi 198.000 nodos, de los cuales 197.993 son correos) en un grafo entrenable con licencia MIT. Resulta util como referencia tecnica para pipelines de analisis forense o de evidencia documental, aunque su utilidad fuera de ese dominio es practicamente nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: text encoder Transformer (2 capas, 4 cabezas) + GAT (2 capas, 4 cabezas) + MLP de prediccion de enlaces |
| Parametros totales | 34.762.497 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo autoregresivo; el text encoder procesa etiquetas de nodo) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors, graph_data.safetensors) |
| Dimension de embedding de nodo | 128 estructural + 256 de texto |
| Dimension oculta | 256 |
| Funcion de perdida | margin ranking loss (link prediction) |
| Pipeline declarado | graph-ml |
| Tamano del repositorio | 32,4 GB |

## Arquitectura y entrenamiento

El modelo no sigue el patron de un transformer generativo. La entrada es un conjunto de nodos con identificador, tipo y subsistema, mas una matriz de aristas con tipos. Cada nodo se representa con un embedding estructural de 128 dimensiones y un embedding textual de 256 dimensiones obtenido por un Transformer de 2 capas y 4 cabezas sobre la etiqueta del nodo (tokenizador a nivel de caracter, `tokenizer.json`). Sobre esa representacion se aplica una GAT de 2 capas y 4 cabezas que agrega vecindarios, y un MLP de 2 capas que puntua pares de nodos para predecir enlaces, entrenado con perdida de ranking por margen sobre pares positivos y negativos.

La grafica codificada contiene 198.019 nodos y 13.415 aristas, con 3.664 enlaces cruzados entre subsistemas. La composicion es muy desequilibrada: 197.993 nodos son correos del subsistema Comcosys, 16 son entidades del nucleo, 10 son eventos de linea temporal del subsistema Ad-Res-J7 (legal) y los subsistemas Fincosys (financiero), RevStream1 (evidencia) y LEX Schemes aparecen con 0 nodos. No se documentan en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo ajuste por RLHF o DPO; al tratarse de un modelo de embeddings de grafo, esos mecanismos no aplican de forma estandar.

Como innovacion tecnica destacable, el modelo separa explicitamente la representacion estructural de la textual y conserva la hipergrafica completa como tensores en `graph_data.safetensors`, lo que permite reentrenar o hacer fine-tuning de la tarea de prediccion de enlaces sin reconstruir el grafo. La API de entrenamiento expuesta en la model card (`model.forward(node_ids, node_type_ids, subsystem_ids, edge_index, edge_type_ids, pos_edge_index, neg_edge_index, labels)`) confirma que el grafo es un artefacto de primera clase del modelo.

## Capacidades

- Prediccion de enlaces sobre la hipergrafica de evidencia: puntua la probabilidad de relacion entre dos nodos dados sus embeddings y su vecindario.
- Representacion de entidades heterogeneas: nodos de tipo entidad, correo, evento de linea temporal y documento, con identificadores de tipo y subsistema.
- Codificacion de texto a nivel de caracter para etiquetas de nodo, sin dependencia de un vocabulario BPE externo.
- Fine-tuning supervisado de la tarea de link prediction con pares positivos y negativos.
- Propagacion de informacion por vecindario mediante atencion sobre grafo (GAT), lo que permite agregar contexto estructural multi-salto.
- No soporta generacion de texto, razonamiento en lenguaje natural, codigo, matematicas, vision ni audio.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM.
- Capacidad multilingue: limitada al ingles segun la model card.
- No dispone de modo thinking ni de capacidades multimodales.

## Casos de uso

- Analisis forense de corpus de correo: con 197.993 nodos de correo enlazados a 16 entidades, el modelo permite puntuar relaciones sospechosas entre remitentes, destinatarios y entidades, priorizando pares para revision manual en lugar de leer el corpus completo.
- Construccion de lineas temporales de evidencia: los 10 eventos del subsistema Ad-Res-J7 pueden conectarse mediante prediccion de enlaces a correos y entidades, generando hipotesis de secuencia temporal que un analista valida despues.
- Deteccion de comunidades y agrupaciones: los embeddings de nodo de 256 dimensiones sirven como entrada a clustering (HDBSCAN, k-means) para agrupar correos por tema o por red de contactos sin etiquetas previas.
- Recuperacion semantica sobre el grafo: combinando el embedding textual del nodo con la estructura, se puede implementar busqueda de nodos similares y expansion por vecindario para un motor de consulta sobre el corpus legal.
- Prototipado de pipelines de evidencia documental: el repositorio incluye el grafo completo y el codigo de entrenamiento, por lo que sirve como plantilla para construir un modelo equivalente sobre otro corpus (por ejemplo, un expediente interno o una auditoria) sustituyendo `graph_data.safetensors` y reentrenando.
- Investigacion en graph machine learning: con 34,7 M de parametros y licencia MIT, es un banco de pruebas ligero para comparar variantes de GAT, funciones de perdida de ranking o estrategias de muestreo negativo en grafos muy desbalanceados.
- Enriquecimiento de un grafo de conocimiento existente: el predictor de enlaces puede ejecutarse sobre pares candidatos para proponer aristas nuevas que se incorporen tras validacion, ampliando la cobertura del grafo mas alla de las 13.415 aristas originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 34,7 M de parametros en fp32, los pesos ocupan aproximadamente 139 MB; en fp16, unos 70 MB. El cuello de botella real no son los pesos sino los tensores del grafo: el repositorio ocupa 32,4 GB, dominado por `graph_data.safetensors`, que debe cargarse en memoria (RAM o VRAM) para operar sobre la grafica completa.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM es suficiente para los pesos del modelo; para cargar el grafo completo en GPU se recomienda una A100 de 40 u 80 GB, o bien mantener el grafo en RAM y transferir lotes de nodos y aristas a la GPU.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060 12 GB, RTX 4070 o RTX 4090, siempre que el grafo se mantenga en memoria del sistema y se procese por lotes.
- Opciones de despliegue: la model card solo documenta la carga via `transformers` con la clase propia `UnicosysHypergraphModel`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos y no aplican a este pipeline `graph-ml`.
- Latencia y throughput: no disponibles. Al ser un modelo de inferencia sobre pares de nodos, la latencia dependera del tamano del lote de pares y del coste de agregacion de vecindarios en la GAT, no de una decodificacion autoregresiva.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Unicosys Hypergraph (drzo) | 34,7 M | no aplica (graph-ml) | Link prediction sobre hipergrafica de evidencia | MIT | Hugging Face, 380 descargas |
| Modelos GNN genericos (p. ej. GraphSAGE, GAT) | variable, tipicamente 0,1-5 M | no aplica | Link prediction / clasificacion de nodos | MIT o Apache 2.0 segun implementacion | Amplia, en PyTorch Geometric y DGL |
| Modelos de embedding de KG (p. ej. TransE, RotatE) | 1-50 M segun entidades | no aplica | Link prediction en KG | MIT o Apache 2.0 | Amplia, en librerias como PyKEEN |

La comparacion directa con LLM no procede: Unicosys Hypergraph no genera texto. Frente a implementaciones genericas de GAT o GraphSAGE, su ventaja es que incluye el grafo ya codificado y un pipeline completo reproducible; su desventaja es que esta especializado en un unico corpus y no ofrece abstraccion para otros dominios sin reentrenamiento. Frente a metodos de embedding de KG como TransE o RotatE, incorpora texto mediante un transformer, lo que le permite representar etiquetas de nodo ricas, a costa de un mayor numero de parametros.

## Limitaciones y advertencias

- Dominio cerrado: el modelo esta entrenado sobre el caso 2025-137857 y no generaliza a otros grafos sin reentrenamiento. Usarlo fuera de ese corpus produce embeddings sin significado.
- Grafo extremadamente desequilibrado: 197.993 de 198.019 nodos son correos; los subsistemas financiero, de evidencia y de esquemas LEX estan vacios (0 nodos). Cualquier evaluacion de rendimiento esta dominada por el dominio de comunicaciones.
- Riesgo de alucinacion estructural: la prediccion de enlaces puede proponer relaciones inexistentes entre entidades. En contexto legal o forense, toda arista predicha debe validarse contra la fuente original antes de usarse.
- Sesgos: no se documenta ningun analisis de sesgos. Al derivar de un corpus de correo real, puede reflejar sesgos de sus participantes (idioma, estilo, red de contactos) y sobrerrepresentar a los interlocutores mas activos.
- Limitacion de idioma: solo ingles declarado; el tokenizador a nivel de caracter puede degradar la representacion de etiquetas en otros idiomas.
- Restricciones de licencia: MIT permite uso comercial y modificacion, pero el contenido del corpus subyacente (correos y documentos legales) puede estar sujeto a derechos de terceros, confidencialidad o secreto de las actuaciones. La licencia del codigo no cubre esos datos.
- Caveats para produccion: no hay benchmarks publicados, no hay version cuantizada ni soporte de servidores de inferencia estandar, y el repositorio de 32,4 GB complica el despliegue en entornos con almacenamiento limitado.
- Inconsistencia menor en la documentacion: el ejemplo de la model card carga desde `hyperholmes/unicosys-hypergraph`, mientras que el identificador publicado es `drzo/unicosys-hypergraph`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/drzo/unicosys-hypergraph
- Repositorio del pipeline Unicosys: https://github.com/hyperholmes/unicosys
