# patzer-adi/bge-patent-similarity-contrastive

## Resumen

`patzer-adi/bge-patent-similarity-contrastive` es un modelo de embeddings de frases derivado de `BAAI/bge-base-en-v1.5` mediante ajuste fino con aprendizaje contrastivo, especializado en medir similitud semantica entre documentos de patentes. Lo desarrolla el usuario de Hugging Face `patzer-adi` y se publica como un `SentenceTransformer` listo para `sentence-transformers` y para Text Embeddings Inference (TEI). Su proposito es resolver un problema concreto: los embeddings genericos de dominio general no capturan bien la terminologia tecnica y juridica de las reivindicaciones y resumenes de patentes, de modo que un modelo afinado sobre ese dominio mejora la recuperacion y el emparejamiento entre documentos.

Arquitectonicamente es un transformer BERT de tipo encoder, con 109.482.240 parametros totales (unos 109,5 M), lo que corresponde a la configuracion base de BGE (12 capas, dimension de embedding de 768). El ajuste se realizo sobre un conjunto de 36.618 ejemplos con una funcion de perdida `ContrastiveLoss`, segun los metadatos de la model card. El repositorio ocupa 0,4 GB y los pesos estan en formato `safetensors`.

Su relevancia es acotada pero clara: se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, sin licencia declarada ni idiomas declarados, y sin benchmarks publicados. Resulta util como punto de partida para busqueda semantica y deduplicacion en corpus de patentes en ingles, pero no debe tratarse como un modelo validado para produccion sin una evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (base BGE), con pooling para embeddings de frase |
| Parametros totales | 109.482.240 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base BGE-base acepta hasta 512 tokens; no confirmado en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; compatible con cuantizacion via herramientas externas, no declarado por el autor) |
| Idiomas soportados | No disponible (el modelo base es de dominio ingles; no declarado explicitamente) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `BAAI/bge-base-en-v1.5`, un encoder BERT base preentrenado y posteriormente afinado por BAAI para embeddings de recuperacion en ingles. Sobre esa base, el autor aplica un ajuste fino supervisado con pares de documentos de patentes y una `ContrastiveLoss`, que acerca las representaciones de pares positivos (documentos similares) y aleja las de pares negativos. El conjunto de entrenamiento consta de 36.618 ejemplos segun los metadatos de la model card; no se detalla la composicion exacta del dataset, el numero de tokens vistos ni si hubo etapas de filtrado o minado de negativos duros.

Los ejemplos del widget de la model card muestran el formato de entrada esperado: cadenas que concatenan `Title:` y `Abstract:` de cada patente. Esto sugiere que el modelo fue entrenado con ese esquema de concatenacion y que conviene respetarlo en inferencia para obtener embeddings comparables. No se documentan innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, destilacion ni multi-vector); se trata de un ajuste fino estandar de sentence embeddings con perdida contrastiva.

## Capacidades

- Generacion de embeddings densos de frase y documento para similitud semantica y recuperacion.
- Extraccion de caracteristicas (`feature-extraction`) y uso como `sentence-similarity` en `sentence-transformers`.
- Emparejamiento y ranking de documentos de patentes a partir de titulo y resumen concatenados.
- Busqueda semantica sobre corpus tecnicos en ingles (el modelo base es de dominio ingles).
- Deduplicacion y agrupamiento (clustering) de documentos por proximidad en el espacio de embeddings.
- Compatibilidad con Text Embeddings Inference (TEI) y con endpoints compatibles, segun los tags del repositorio.
- No se declaran capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni modo de pensamiento; es exclusivamente un modelo de representacion.

## Casos de uso

- Busqueda semantica en repositorios de patentes: indexar titulos y resumenes como embeddings y recuperar los documentos mas proximos a una consulta en lenguaje natural, superando la busqueda por palabras clave en terminologia tecnica variada.
- Busqueda de prior art: dado un borrador de reivindicacion o resumen, recuperar patentes candidatas con contenido tecnicamente proximo para su revision por un examinador o abogado de propiedad industrial.
- Deduplicacion de un corpus de patentes: calcular embeddings de todos los documentos y agrupar por similitud coseno para detectar familias o duplicados con redacciones distintas.
- Clasificacion y enrutamiento tematico: usar los embeddings como entrada a un clasificador ligero (regresion logistica, k-NN) para asignar areas tecnologicas o codigos IPC a documentos nuevos.
- Construccion de un sistema RAG sobre documentacion de patentes: recuperar fragmentos relevantes antes de pasarlos a un LLM generativo, reduciendo el coste de contexto y mejorando la fundamentacion de las respuestas.
- Monitorizacion de novedades: comparar publicaciones recientes contra una cartera existente para detectar solapamientos potenciales y priorizar revisiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, aproximadamente 0,44 GB solo de pesos (109,5 M de parametros); en FP16, unos 0,22 GB. El consumo real depende del tamano de lote y de la longitud de secuencia.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque para este tamano el cuello de botella suele ser el throughput de tokens, no la memoria.
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 3050, RTX 4060 y superiores.
- Opciones de despliegue: `sentence-transformers` (PyTorch), Text Embeddings Inference (TEI, segun los tags), y exportacion a ONNX o cuantizacion con herramientas externas para CPU.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `patzer-adi/bge-patent-similarity-contrastive` | 109,5 M | No disponible | Patentes (ingles) | No disponible | Hugging Face, 0 descargas |
| `BAAI/bge-base-en-v1.5` (modelo base) | ~109 M | 512 tokens | General (ingles) | MIT (segun el modelo base; no confirmado en esta ficha) | Hugging Face, ampliamente usado |
| `BAAI/bge-small-en-v1.5` | ~33 M | 512 tokens | General (ingles) | MIT (segun el modelo base; no confirmado en esta ficha) | Hugging Face, ampliamente usado |

La comparacion con alternativas especializadas en patentes no esta disponible en la informacion proporcionada. Frente al modelo base, la diferencia principal es el ajuste de dominio; frente a variantes pequenas, el coste computacional es mayor pero el modelo base ofrece mayor capacidad de representacion.

## Limitaciones y advertencias

- No se declara licencia: no hay garantia de uso comercial y conviene contactar con el autor antes de integrarlo en produccion.
- No se declaran idiomas soportados; el modelo base es de dominio ingles, por lo que el rendimiento en castellano u otros idiomas es incierto.
- No hay benchmarks publicados ni evaluacion independiente; el rendimiento en recuperacion de patentes no esta cuantificado.
- El modelo tiene cero descargas y cero likes, lo que indica ausencia de validacion por la comunidad.
- Riesgo de alucinacion no aplica directamente (no genera texto), pero los embeddings pueden producir falsos positivos en similitud por coincidencia de vocabulario tecnico.
- El esquema de entrada esperado parece ser `Title:` + `Abstract:` concatenados; usar otro formato puede degradar la calidad de los embeddings.
- La longitud de contexto efectiva no esta documentada; secuencias largas pueden truncarse.
- No se detalla la composicion del dataset de entrenamiento ni el minado de negativos, lo que dificulta reproducir o auditar el ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/patzer-adi/bge-patent-similarity-contrastive
- Modelo base: https://huggingface.co/BAAI/bge-base-en-v1.5
- Paper de referencia de Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
