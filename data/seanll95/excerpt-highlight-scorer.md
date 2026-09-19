# seanll95/excerpt-highlight-scorer

## Resumen

Excerpt highlight scorer es un cross-encoder en formato Core ML desarrollado por el usuario seanll95 que asigna una puntuacion a pasajes de texto candidatos en funcion de la probabilidad de que un lector los resalte al leer. No es un modelo generativo: recibe un par de secuencias tokenizadas (`input_ids`, `attention_mask`, `token_type_ids`) y devuelve `logits`, que se interpretan como una puntuacion de ranking. El artefacto se publica empaquetado para su compilacion y ejecucion en dispositivo dentro del ecosistema Apple.

El modelo se usa en la funcion Suggested Highlights de la aplicacion iOS Excerpt, que lo descarga en el primer uso en lugar de incluirlo en el binario de la app. Esta decision de distribucion explica la estructura del repositorio: cada revision vive en un directorio de nivel superior (por ejemplo `v1/`) que la aplicacion referencia mediante una constante de version, de forma que una publicacion nueva no se confunde con una copia ya presente en disco. El repositorio ocupa 0.3 GB e incluye el paquete Core ML, el vocabulario WordPiece y ficheros de metadatos.

Se trata de un modelo de nicho y de proposito muy especifico: el ranking de pasajes destacables, no el reranking de resultados de busqueda generico ni la generacion de texto. Su relevancia practica esta ligada a su integracion en una app concreta, y su adopcion externa es muy baja (11 descargas y 0 likes en el momento de redactar esta ficha).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder empaquetado como Core ML. El artefacto se llama `electra-crowd-v4.mlpackage`, lo que sugiere una base ELECTRA, pero la model card no confirma la arquitectura subyacente |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible (tokenizador WordPiece; no se declara `max_length`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML `.mlpackage` (compilado en dispositivo); tokenizer.json (WordPiece); tokenizer_config.json y manifest.json solo como procedencia |
| Tamano del repositorio | 0.3 GB |
| Pipeline declarado | text-ranking |
| Entradas | `input_ids`, `attention_mask`, `token_type_ids` |
| Salidas | `logits` |
| Dimension de lote | Fija en 1; la app agrupa peticiones mediante `MLArrayBatchProvider` |
| Revisiones | Directorios de nivel superior (`v1/`, previsiblemente `v2/`), fijadas por nombre desde la app |

## Arquitectura y entrenamiento

La model card describe un cross-encoder: el modelo puntua conjuntamente un pasaje candidato y su contexto, en lugar de codificar ambos por separado como haria un bi-encoder. La unica pista sobre la arquitectura interna es el nombre del paquete, `electra-crowd-v4`, que apunta a una red tipo ELECTRA y a una cuarta version entrenada con datos anotados por personas (el sufijo `crowd`). No se especifica el numero de capas, la dimension oculta, el numero de parametros ni la longitud maxima de secuencia.

Tampoco hay informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, el proceso de anotacion ni si se aplicaron tecnicas de ajuste como RLHF o DPO. Lo unico verificable sobre el entrenamiento es su objetivo funcional: predecir si un lector resaltaria un pasaje. No se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal, algo coherente con un modelo de ranking que no genera tokens.

## Capacidades

- Puntuacion de pasajes: dado un texto y un candidato, produce un `logit` que ordena candidatos por probabilidad de ser resaltados.
- Ranking de extractos: permite seleccionar los N pasajes mejor puntuados de un documento para sugerencias de resaltado.
- Inferencia en dispositivo: el paquete Core ML se compila y ejecuta localmente en hardware Apple, sin llamadas a servidores externos.
- Procesamiento por lotes a nivel de aplicacion: aunque la dimension de lote del grafo es 1, la app encadena peticiones con `MLArrayBatchProvider`.
- Generacion de texto: no soportada.
- Tool calling o function calling: no soportado.
- Capacidades de agente o razonamiento multi-paso: no soportadas.
- Vision, audio o modo de razonamiento explicito: no disponibles.
- Soporte multilingue: no disponible; no se declaran idiomas y el vocabulario es WordPiece sin idioma especificado.

## Casos de uso

- Sugerencia de resaltados en una app de lectura: es el caso de uso original. La app Excerpt envia cada pasaje candidato al modelo, obtiene un `logit` y muestra al usuario los fragmentos con mayor puntuacion, todo compilado en el dispositivo.
- Curacion de citas en documentos largos: puntuar automaticamente todos los parrafos de un informe o articulo y extraer los que un lector humano probablemente subrayaria, para generar un resumen extractivo orientado a lo relevante.
- Preparacion de materiales de estudio: en una app educativa, el modelo puede preseleccionar los pasajes clave de un capitulo y proponerlos como tarjetas o apuntes, reduciendo el trabajo manual del estudiante.
- Enriquecimiento de lectores RSS o de boletines: dado un articulo descargado, marcar los fragmentos mas destacables antes de presentarlo, sin coste de servidor gracias a la ejecucion local.
- Anotacion asistida para equipos editoriales: usar las puntuaciones como primera pasada sobre un texto y dejar que un editor humano valide o descarte los extractos propuestos, acelerando la seleccion de destacados.
- Reutilizacion de contenido en redes o newsletters: extraer los pasajes con mayor probabilidad de enganchar al lector para construir resumenes promocionales o hilos, siempre con revision humana posterior.
- Filtrado previo en un pipeline de resumen: descartar los pasajes con puntuacion baja antes de pasarlos a un modelo generativo, reduciendo el contexto que se envia al modelo grande.

En todos los casos conviene recordar que el modelo solo ordena; la decision de mostrar, citar o publicar el extracto corresponde a la aplicacion o al usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de ranking (NDCG, MRR, precision@k), ni comparaciones con otros cross-encoders, ni datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM: no aplica en el sentido habitual; el modelo esta pensado para ejecutarse en hardware Apple mediante Core ML, no en GPU NVIDIA.
- GPU recomendadas: no disponibles; el destino natural es la Neural Engine y la GPU integrada de los chips Apple (serie A y serie M).
- Ejecucion en hardware de consumo: si, en iPhone y iPad compatibles con la app Excerpt. El repositorio pesa 0.3 GB, pero se desconoce el reparto entre el paquete Core ML y el tokenizador.
- Opciones de despliegue: Core ML y Core ML Tools. No se ofrecen pesos en safetensors, GGUF ni formatos compatibles con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. Al ser un cross-encoder con lote fijo de 1, la latencia depende del numero de pasajes que la app decida puntuar por documento.
- Memoria en dispositivo: no disponible; habria que medirla sobre un iPhone o Mac concretos con la revision `v1` compilada.

## Comparativa con modelos similares

No hay datos de rendimiento del modelo que permitan una comparacion cuantitativa. La tabla siguiente recoge alternativas de la misma categoria funcional (cross-encoders de ranking), con datos publicos de cada una de ellas; no implica que sean equivalentes en calidad ni que se hayan evaluado contra este modelo.

| Modelo | Parametros | Contexto | Licencia | Formato principal | Notas |
|---|---|---|---|---|---|
| seanll95/excerpt-highlight-scorer | no disponible | no disponible | Apache 2.0 | Core ML | Especifico para resaltado de extractos; uso principal en iOS |
| cross-encoder/ms-marco-MiniLM-L-6-v2 | ~22,7 M | 512 tokens | Apache 2.0 | safetensors / PyTorch | Cross-encoder de reranking generico, ampliamente usado |
| BAAI/bge-reranker-base | ~278 M | 512 tokens | MIT | safetensors / PyTorch | Reranker multilingue para recuperacion |
| jinaai/jina-reranker-v1-turbo-en | ~37,8 M | 8192 tokens | Apache 2.0 | safetensors / PyTorch | Reranker ligero con contexto largo |

La comparacion de rendimiento frente a estos modelos no esta disponible.

## Limitaciones y advertencias

- No genera texto: cualquier caso de uso que requiera redactar o resumir necesita otro modelo; este solo puntua pasajes.
- Sesgos desconocidos: no se documenta la procedencia de los datos de anotacion (`crowd`) ni la demografia o el idioma de las personas anotadoras, por lo que no se pueden evaluar sesgos de contenido.
- Riesgo de alucinacion: bajo en el sentido generativo, porque no produce texto abierto; el riesgo real es de clasificacion erronea, es decir, puntuar alto un pasaje irrelevante o bajo uno relevante.
- Cobertura idiomatica incierta: no se declaran idiomas soportados y el tokenizador es WordPiece, lo que en la practica suele implicar mejor comportamiento en ingles que en otras lenguas.
- Contexto limitado o desconocido: no se publica `max_length`; los pasajes que excedan el limite del tokenizador tendran que truncarse, con perdida de informacion.
- Lote fijo de 1: no se puede aumentar el batch dentro del grafo, lo que limita el throughput si se puntuan muchos pasajes.
- Solo Core ML: no hay pesos en formatos estandar, de modo que reutilizar el modelo fuera de Apple exige una conversion no documentada.
- Trazabilidad de versiones: la app fija la revision por nombre, de modo que un consumidor externo debe replicar ese mecanismo para no mezclar directorios `v1` y `v2`.
- Adopcion minima: 11 descargas y 0 likes, sin issues ni discusion publica, por lo que no existe validacion comunitaria del comportamiento en produccion.
- Licencia: Apache 2.0 permite uso comercial y modificacion, siempre que se conserven los avisos de copyright y licencia. No se declaran restricciones adicionales de uso aceptable.
- Fechas de publicacion y actualizacion muy recientes respecto a la redaccion de esta ficha, con solo dos dias entre ambas, lo que sugiere un modelo poco rodado.

## Enlaces

- HuggingFace: https://huggingface.co/seanll95/excerpt-highlight-scorer
- Aplicacion Excerpt (funcion Suggested Highlights): https://octetmediteranee.eu/excerpt/
- Paper o informe tecnico: no disponible
- Repositorio de codigo: no disponible
- Demo publica: no disponible
