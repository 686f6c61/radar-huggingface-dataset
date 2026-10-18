# kucukkanat/gliner-bi-edge-v2.0-onnx

## Resumen

`kucukkanat/gliner-bi-edge-v2.0-onnx` es la exportación a ONNX del modelo `knowledgator/gliner-bi-edge-v2.0` de Knowledgator, un sistema de reconocimiento de entidades nombradas (NER) zero-shot construido sobre la arquitectura GLiNER en variante bi-encoder. El modelo detecta entidades de cualquier tipo que se le indique en tiempo de inferencia (no requiere reentrenamiento ni catálogo cerrado de clases) en un único forward pass, y lo hace con un tamaño muy reducido: unos 60M de parámetros, repartidos entre el encoder de texto `ettin-encoder-32m` y el encoder de etiquetas `all-MiniLM-L6-v2`.

La relevancia de esta ficha concreta está en el empaquetado: el autor publica dos grafos ONNX autocontenidos, uno en fp32 de 240 MB y otro cuantizado a 8 bits de 64 MB, con el encoder de etiquetas integrado en el mismo grafo. Esto permite ejecutar NER en CPU y directamente en el navegador mediante ONNX Runtime Web (WebAssembly), sin GPU ni backend Python, algo poco habitual en modelos de extracción de entidades con calidad utilizable.

El modelo base es de tipo encoder (no generativo): no produce texto, no razona en varios pasos y no soporta tool calling. Su valor es la extracción estructurada de spans con latencia baja y despliegue en el borde. La licencia es Apache-2.0, igual que la del modelo original, lo que facilita el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bi-encoder GLiNER (encoder de texto + encoder de etiquetas); deteccion de spans de 1 a 12 palabras en un unico forward pass |
| Parametros totales | ~60M (encoder de texto `ettin-encoder-32m` + encoder de etiquetas `all-MiniLM-L6-v2`, segun la model card) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; la decodificacion de spans cubre como maximo 12 palabras por entidad y no se especifica el limite de tokens de entrada |
| Tipos de cuantizacion | fp32 (`onnx/model.onnx`, 240 MB) y 8 bits (`onnx/model_q8.onnx`, 64 MB: pesos MatMulNBits con bloque 32 y simetrico, tablas de embeddings a 8 bits) |
| Idiomas soportados | Metadata del repo: `en`. La evaluacion del export cubre textos en ingles, sueco, aleman, polaco y neerlandes. Lista oficial de idiomas del modelo base: no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (grafo unico con el encoder de etiquetas incluido); repo de 0.3 GB |
| Pipeline | `token-classification` |
| Libreria | `onnx` (ejecutable con ONNX Runtime en CPU y ONNX Runtime Web / WebAssembly) |

## Arquitectura y entrenamiento

GLiNER es un enfoque de NER zero-shot que combina dos codificadores: uno procesa el texto y otro procesa los nombres de los tipos de entidad proporcionados en inferencia. En esta variante bi-encoder, las etiquetas se introducen como `labels_input_ids` y `labels_attention_mask` (tokenizadas con el tokenizer de `all-MiniLM-L6-v2`) y el grafo devuelve directamente una matriz de logits de forma `[1, words, 12, types]`, es decir, una puntuacion por cada par (span de 1 a 12 palabras, tipo de entidad). No hay generacion autoregresiva: es un clasificador de spans.

El export sigue el `export_to_onnx` de GLiNER para bi-encoder, con las etiquetas como token ids dentro del mismo grafo. Las entradas adicionales son `words_mask` (indice de palabra 1-based en el primer sub-token de cada palabra, 0 en el resto), `text_lengths` (numero de palabras), y `span_idx`/`span_mask` con todos los spans de 1 a 12 palabras. El post-procesado consiste en aplicar sigmoide a los logits, quedarse con los spans que superan un umbral y, ordenando de mayor a menor puntuacion, descartar los que solapan con uno ya aceptado. El archivo `reference.json` incluye cuatro textos con sus entradas exactas y las entidades que devuelve el grafo fp32.

No se dispone de informacion sobre el dataset de entrenamiento del modelo base, el numero de tokens utilizados, la composicion de los datos ni si hubo fases de RLHF o DPO; la model card del export no los detalla. La innovacion tecnica destacable del artefacto es la cuantizacion selectiva: en lugar de una cuantizacion dinamica uint8 de todo el grafo, se usan pesos MatMulNBits de 8 bits y tablas de embeddings de 8 bits, lo que segun el autor produce un tamano similar pero altera muchas menos entidades y corre mas rapido en CPU. El tokenizador debe replicar el preprocesado del autor: dividir el texto con `\w+(?:[-_]\w+)*|\S` y tokenizar cada palabra por separado (`is_split_into_words`).

## Capacidades

- Extraccion de entidades zero-shot: se le indican los tipos de entidad como texto libre en inferencia, sin reentrenar ni definir un esquema fijo.
- Deteccion de entidades de 1 a 12 palabras, con multiples tipos evaluados simultaneamente en una sola pasada.
- Reconocimiento de tipos compuestos o abiertos, por ejemplo "persona", "equipo o departamento", "producto", "sistema o herramienta de software", "fecha", "ubicacion" o "numero de identificacion".
- Inferencia en CPU y en navegador (ONNX Runtime Web con WebAssembly), sin GPU y sin proceso servidor.
- Capacidad multilingue observada en la evaluacion del export: ingles, sueco, aleman, polaco y neerlandes.
- Salida con umbral configurable y resolucion de solapamientos por orden de puntuacion, lo que permite ajustar precision/recall sin reentrenar.
- No soporta generacion de texto, razonamiento multi-paso, tool calling, agentes, vision ni audio; es exclusivamente un modelo de clasificacion de tokens/spans.

## Casos de uso

- Deteccion de PII en el cliente: el grafo de 64 MB se ejecuta en el navegador y permite marcar nombres de personas, ubicaciones y numeros de identificacion antes de enviar un formulario al servidor, de modo que el texto sensible no sale del dispositivo.
- Extraccion de campos en tickets de soporte: con tipos como "producto", "sistema" y "fecha" se estructura el cuerpo libre de un ticket en campos utiles para enrutado y analitica, aprovechando que la evaluacion del autor se hizo precisamente sobre tickets y notas de trabajo.
- Procesamiento por lotes en CPU sin GPU: en un backend con ONNX Runtime, el modelo fp32 o q8 permite anotar grandes volumenes de texto en maquinas sin acelerador, reduciendo coste frente a un LLM generativo para la misma tarea.
- Asistencia a la anotacion humana: preetiquetar corpus con un esquema de entidades definido por el equipo y revisar despues, lo que acelera la creacion de datasets de NER y reduce el coste por ejemplo anotado.
- Enrutado de mensajes de cliente: extraer producto o sistema mencionado en un correo y asignar la conversacion a la cola o al equipo correcto mediante reglas simples sobre las entidades devueltas.
- Digitalizacion de notas de traspaso en tienda o almacen: la model card evalua textos de handover con tipos como producto, ubicacion e identificador, un escenario tipico de parte de trabajo en papel o mensajeria interna.
- Aplicaciones de escritorio y extensiones offline: al ser un grafo ONNX pequeno, se puede distribuir dentro de una app Electron o una extension y funcionar sin conexion ni API externa.
- Indexacion y busqueda sobre entidades: generar metadatos de entidades por documento para filtrar o enriquecer un buscador interno, con el modelo ejecutandose en el mismo pipeline de ingesta.

## Benchmarks y rendimiento

Los unicos datos publicados son la evaluacion del autor del export sobre 40 textos etiquetados de entorno laboral (tickets, notas de roadmap, postmortems, traspasos de tienda y almacen, mensajes de clientes) en ingles, sueco, aleman, polaco y neerlandes, con los tipos persona, equipo o departamento, producto, sistema o herramienta de software, fecha, ubicacion y numero de identificacion, a umbral 0.3:

| Artefacto | Entity F1 | F1 en ingles | Entidades distintas respecto a PyTorch |
|---|---|---|---|
| PyTorch (modelo base) | 0.740 | No disponible | Referencia |
| `onnx/model.onnx` (fp32) | 0.740 | No disponible | 0 |
| `onnx/model_q8.onnx` (8 bits) | 0.742 | 0.843 | 11 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, GLUE u otros) en la informacion disponible, ni comparaciones con otros modelos de NER en la model card. Tampoco se publican cifras de latencia o throughput.

## Requisitos de hardware

- VRAM: no requiere GPU. El grafo fp32 ocupa 240 MB y el q8 64 MB en disco; el consumo de RAM en ejecucion es del orden de unos cientos de MB, sin cifra oficial publicada.
- GPU recomendadas: ninguna necesaria; funciona en CPU. Cualquier GPU moderna (RTX 4090, A100, H100) puede ejecutarlo, pero no aporta ventaja clara frente a CPU para este tamano.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU; el caso de uso objetivo es CPU de portatil y navegador.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#), ONNX Runtime Web con WebAssembly en navegador, y envoltorios propios sobre el grafo. No aplica vLLM, llama.cpp, Ollama ni TGI, porque no es un modelo generativo.
- Latencia y throughput: no publicados. La model card indica cualitativamente que la cuantizacion selectiva a 8 bits corre mas rapido en CPU que una cuantizacion dinamica uint8 de todo el grafo, que resultaba mas lenta y alteraba mas entidades.
- El preprocesado (segmentacion por palabras, construccion de `words_mask`, `span_idx` y `span_mask`) debe implementarse en el cliente y anade coste proporcional al numero de palabras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `kucukkanat/gliner-bi-edge-v2.0-onnx` (q8) | ~60M | No disponible | ONNX 8 bits, 64 MB | Apache-2.0 | Ejecutable en navegador y CPU |
| `kucukkanat/gliner-bi-edge-v2.0-onnx` (fp32) | ~60M | No disponible | ONNX fp32, 240 MB | Apache-2.0 | Referencia exacta frente a PyTorch (0 entidades distintas) |
| `knowledgator/gliner-bi-edge-v2.0` | ~60M | No disponible | PyTorch | Apache-2.0 | Modelo original; F1 0.740 en la evaluacion del autor; requiere runtime Python |
| Otros modelos de NER zero-shot (GLiNER multi, alternativas generativas) | No disponible | No disponible | No disponible | No disponible | No hay datos comparativos publicados en la informacion disponible |

## Limitaciones y advertencias

- Modelo exclusivamente extractivo: no genera texto, no sigue instrucciones ni mantiene conversaciones; usarlo para tareas generativas daria resultados invalidos.
- Los spans se limitan a un maximo de 12 palabras, por lo que entidades mas largas (descripciones extensas, direcciones completas) no pueden detectarse como una sola entidad.
- El preprocesado es estricto: hay que replicar la division por palabras con `\w+(?:[-_]\w+)*|\S` y la tokenizacion por palabra (`is_split_into_words`); una tokenizacion distinta degrada o invalida los resultados.
- La evaluacion publicada es reducida (40 textos, 6 tipos de entidad, umbral 0.3) y esta sesgada hacia textos laborales en ingles y lenguas europeas; el rendimiento en otros dominios (biomedico, legal, conversacional informal) no esta medido.
- La metadata declara solo `en` como idioma, aunque la evaluacion incluya sueco, aleman, polaco y neerlandes; la cobertura real multilingue del modelo base no se detalla.
- Riesgo de alucinacion entendido como falsos positivos: el umbral y la resolucion de solapamientos determinan directamente precision y recall; con umbrales bajos apareceran entidades espurias. Requiere calibracion por dominio.
- Sesgos: no se documenta ninguna evaluacion de sesgo por genero, origen o etnia en las entidades detectadas; los sesgos del corpus de entrenamiento del modelo base son desconocidos.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los encoders subyacentes (`ettin-encoder-32m`, `all-MiniLM-L6-v2`) antes de redistribuir.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, y no procede de la organizacion original; para produccion conviene evaluar el export contra el modelo PyTorch con un conjunto propio.
- Los resultados de la busqueda web realizada no contienen informacion relevante sobre este modelo; todos los datos de esta ficha provienen de la model card y de la metadata de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kucukkanat/gliner-bi-edge-v2.0-onnx
- Modelo base: https://huggingface.co/knowledgator/gliner-bi-edge-v2.0
- Encoder de texto: https://huggingface.co/jhu-clsp/ettin-encoder-32m
- Encoder de etiquetas: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Sitio del autor del modelo base (Knowledgator): https://www.knowledgator.com/
- Paper, blog o repositorio adicionales de GLiNER: no disponibles en la informacion proporcionada.
