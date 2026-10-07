# shirochenkov90/embeddinggemma-2-coreml

## Resumen

EmbeddingGemma 2 (text) — Core ML es una conversion del **componente de texto** del modelo `google/embeddinggemma-2` al formato Core ML (ML Program, float16), publicada por el usuario `shirochenkov90`. No es un modelo nuevo ni un fine-tuning: los pesos son los originales y solo cambia el formato, con el objetivo de poder ejecutar el pipeline de embeddings de frases de forma nativa en aplicaciones macOS e iOS escritas en Swift. Los codificadores de vision y audio del modelo multimodal original no estan incluidos.

El paquete implementa la pipeline completa de sentence-transformers: el modelo de texto, su proyeccion interna de 512 a 768 dimensiones, un mean pooling sobre `attention_mask` y una normalizacion L2 final. La salida es directamente un vector de 768 dimensiones ya normalizado, de modo que la similitud coseno se reduce al producto escalar. Esto simplifica su integracion en indices vectoriales locales.

Su relevancia es practica: permite busqueda semantica y RAG completamente en el dispositivo en el ecosistema Apple, sin llamadas a servicios externos. A cambio, impone restricciones severas frente al modelo original: el contexto se limita a 256 tokens (frente a los 8192 del original), el tamano de lote es fijo en 1 y todas las operaciones se ejecutan en CPU, incluso solicitando `computeUnits = .all`. Los vectores generados **no son compatibles** con EmbeddingGemma 1 (`google/embeddinggemma-300m`), por lo que migrar exige reindexar todos los documentos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de embeddings de frases basado en la familia Gemma; el paquete incluye pooling y normalizacion L2) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 256 tokens en este paquete; el modelo original admite hasta 8192 |
| Tipos de cuantizacion | pesos en float16 en formato ML Program; el paquete no ofrece otras cuantizaciones |
| Idiomas soportados | multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (`embeddinggemma-2.mlpackage`, ML Program); tokenizer en `tokenizer.json` y `tokenizer_config.json` |
| Dimension de embedding | 768, con truncamiento Matryoshka funcional a 512, 256 y 128 (renormalizando) |
| Formas de entrada | `input_ids` y `attention_mask` en int32, exactamente (1, 64) o (1, 256) |
| Forma de salida | `embedding` en float32, (1, 768) |
| Tamano del repositorio | 0,6 GB |
| Lote (batch size) | 1 |
| Plataforma minima | macOS 15 / iOS 18 |
| Descargas / likes en HuggingFace | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna ni el proceso de entrenamiento del modelo base `google/embeddinggemma-2`; solo se indica que se trata de un modelo multimodal (con codificadores de vision y audio) del que aqui se conserva unicamente la parte de texto. Este paquete concreta esa parte de texto en una pipeline de sentence-transformers: el encoder produce representaciones que pasan por una proyeccion interna de 512 a 768 dimensiones, seguida de un mean pooling ponderado por `attention_mask` y una normalizacion L2. El resultado es un unico vector de 768 componentes por entrada de texto.

La conversion a Core ML no altera los pesos, solo el formato de ejecucion. El autor documenta que todas las operaciones del paquete se colocan en CPU en Apple Silicon: 2942 de 2942 operaciones segun `MLComputePlan`, incluso con `computeUnits = .all`. Precisamente por eso Core ML calcula en float32 sobre CPU, lo que explica que la salida coincida exactamente con la de PyTorch (coseno 1.000000) pese a que los pesos almacenados esten en float16.

Una innovacion relevante para quien integre el modelo es el uso de prefijos de tarea. El texto debe ir precedido por una cadena especifica segun el caso de uso (`task: search result | query: ` para consultas, `title: none | text: ` para documentos, `task: clustering | query: ` para agrupamiento, etc.), replicando la configuracion original de sentence-transformers. El tokenizer anade `<bos>` (id 2) al principio y `<eos>` (id 1) al final, y el relleno debe ir a la derecha con id 0 y `attention_mask = 0`, ya que el modelo calcula las posiciones como 0...S-1 y el padding por la izquierda alteraria el resultado.

## Capacidades

- Generacion de embeddings de frases y parrafos: salida de 768 dimensiones ya normalizada en L2, con similitud coseno equivalente al producto escalar.
- Similitud semantica y recuperacion de informacion: pipeline `sentence-similarity` con prefijos especificos para consulta y documento.
- Extraccion de caracteristicas (`feature-extraction`) para alimentar indices vectoriales o clasificadores posteriores.
- Soporte multilingue segun las etiquetas del repositorio (verificado por el autor con textos en ruso).
- Truncamiento Matryoshka: es posible recortar el vector a 512, 256 o 128 dimensiones tomando los primeros N valores y renormalizando, lo que reduce el coste de almacenamiento del indice.
- Prefijos de tarea predefinidos para distintos escenarios: busqueda, reranking, mineria de bitextos, question answering, fact checking, recuperacion de codigo, clasificacion, clasificacion multietiqueta, clustering, similitud de frases, parafrasis, clasificacion de pares y resumen.
- Integracion nativa en Swift mediante Core ML (`MLModelConfiguration` con `.cpuOnly`).
- No incluye generacion de texto, razonamiento, codigo, matematicas ni capacidades conversacionales.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No incluye vision ni audio: los codificadores multimodales del modelo original quedan fuera del paquete.
- No soporta procesamiento por lotes: el lote esta fijado en 1.

## Casos de uso

- Busqueda semantica en aplicaciones macOS e iOS: el modelo embebe la consulta con el prefijo `task: search result | query: ` y los documentos con `title: none | text: `, permitiendo recuperar pasajes relevantes con similitud coseno directa sobre vectores normalizados, sin salir del dispositivo.
- RAG local en el dispositivo: indexacion previa de la base documental y recuperacion de contexto para alimentar un modelo generativo local; util en escenarios con requisitos de privacidad donde no se pueden enviar documentos a un servicio en la nube.
- Clasificacion y enrutado de texto: usando el prefijo `task: classification | query: ` y un clasificador ligero (regresion logistica o k-NN) sobre los embeddings de 768 dimensiones, se pueden etiquetar tickets, correos o incidencias dentro de la app.
- Agrupamiento y deduplicacion de documentos: con el prefijo `task: clustering | query: ` y truncamiento Matryoshka a 256 o 128 dimensiones, se pueden agrupar documentos similares reduciendo memoria a costa de algo de precision.
- Deteccion de duplicados y near-duplicates en bibliotecas de contenido: comparar embeddings de titulares, descripciones o registros para eliminar redundancias en una base de datos local.
- Cache semantica de consultas: almacenar embeddings de preguntas frecuentes con el prefijo `task: question answering | query: ` y devolver la respuesta cacheada cuando la similitud supera un umbral; el autor advierte de que los umbrales deben recalibrarse si se venia de EmbeddingGemma 1.
- Filtrado y moderacion de contenido asistido: prefiltrar mensajes o comentarios comparandolos contra un conjunto de ejemplos etiquetados embebidos previamente, dejando la decision final a un modelo mayor.
- Recuperacion de codigo en herramientas de desarrollo: con el prefijo `task: code retrieval | query: ` se pueden indexar fragmentos de codigo o documentacion tecnica y ofrecer busqueda semantica dentro de un IDE en macOS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, MTEB u otros) en la informacion disponible.

Lo unico documentado son comprobaciones de fidelidad de la conversion y una prueba semantica:

| Comprobacion | Texto | Tokens | Forma | Resultado |
|---|---|---|---|---|
| Fidelidad PyTorch vs Core ML | Pasaje en ruso (prefijo documento) | 153 | (1, 256) | cos = 1.000000 |
| Fidelidad PyTorch vs Core ML | Consulta corta en ruso (prefijo consulta) | 13 | (1, 64) | cos = 1.000000 |
| Similitud semantica | Consulta `task: search result \| query: про деньги` frente a documento sobre presupuesto | no disponible | no disponible | 0.7320 |
| Similitud semantica | Misma consulta frente a documento sobre un fallo en el reproductor | no disponible | no disponible | 0.6348 |

| Configuracion de `computeUnits` | Tiempo por entrada de 256 tokens (Mac, Apple Silicon) |
|---|---|
| `.cpuOnly` | ~216 ms |
| `.all` | ~524 ms |

## Requisitos de hardware

- Plataforma: exclusivamente Apple. Minimo macOS 15 o iOS 18, necesario para las formas enumeradas en dos entradas.
- VRAM estimada en GPU: no aplica; el paquete se ejecuta en CPU. No se dispone de cifras de memoria residente.
- GPU recomendadas: no disponible. Core ML coloca las 2942 operaciones en CPU, por lo que no hay aceleracion por GPU ni por Neural Engine en este paquete.
- Compatibilidad con GPU de consumo: no aplica; el modelo no esta pensado para NVIDIA/AMD ni para CUDA.
- Tamano en disco: el repositorio ocupa 0,6 GB.
- Opciones de despliegue: Core ML dentro de aplicaciones Swift para macOS e iOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que ademas no son adecuados para un modelo de embeddings en este formato.
- Latencia: aproximadamente 216 ms por entrada de 256 tokens con `computeUnits = .cpuOnly` en Apple Silicon; 524 ms con `.all`. La configuracion `.cpuOnly` es mas rapida que `.all` por el sobrecoste de despacho.
- Throughput: limitado por el lote fijo de 1, es decir, una entrada por llamada. No se proporcionan cifras de entradas por segundo.
- Memoria: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y plataforma | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| shirochenkov90/embeddinggemma-2-coreml | no disponible | 256 tokens (paquete); 8192 en el original | Core ML, ML Program float16; macOS 15 / iOS 18, solo CPU | Multilingue | Apache 2.0 | 0 descargas, 0 likes |
| google/embeddinggemma-2 (modelo base) | no disponible | Hasta 8192 tokens | Pesos originales para sentence-transformers; multimodal (texto, vision y audio) | Multilingue | no disponible en la informacion | Modelo de referencia del que deriva este paquete |
| google/embeddinggemma-300m (EmbeddingGemma 1) | 300M (segun el nombre del modelo) | no disponible | Pesos originales; texto | Multilingue | no disponible en la informacion | Vectores incompatibles con este paquete; la migracion exige reindexar y recalibrar umbrales |

Nota: la comparacion con EmbeddingGemma 1 procede de la advertencia explicita del autor de que los vectores no son compatibles entre ambas generaciones y de que las similitudes se distribuyen de forma distinta (en general mas altas), por lo que los umbrales deben reajustarse.

## Limitaciones y advertencias

- Contexto limitado a 256 tokens: los textos mas largos deben truncarse. El modelo original admite 8192 tokens, por lo que este paquete pierde una capacidad sustancial para documentos largos.
- Lote fijo de 1: no hay procesamiento por lotes, lo que penaliza la indexacion masiva de documentos.
- Solo texto: no incluye los codificadores de vision ni de audio del modelo original.
- Incompatibilidad de vectores con EmbeddingGemma 1: cambiar de modelo obliga a reembeber todo el corpus almacenado y a recalibrar cualquier umbral de similitud.
- Comportamiento dependiente del prefijo de tarea: omitir el prefijo correcto o no incluir el espacio final puede degradar la calidad de los embeddings.
- Sensibilidad al padding: el relleno debe ir a la derecha con id 0 y `attention_mask = 0`; el padding por la izquierda altera el resultado.
- Tokenizacion estricta: hay que replicar exactamente la adicion de `<bos>` (id 2) y `<eos>` (id 1) al tokenizar en Swift.
- Sin aceleracion por GPU ni Neural Engine: el rendimiento esta acotado por la CPU del dispositivo.
- Dependencia de version de sistema: requiere macOS 15 o iOS 18 como minimo.
- Riesgo de alucinacion: no aplica directamente, ya que el modelo no genera texto; sin embargo, una recuperacion con umbral mal ajustado puede devolver documentos irrelevantes.
- Sesgos: no se documenta ninguna evaluacion de sesgos en la informacion disponible.
- Adopcion: 0 descargas y 0 likes, sin senales de uso en produccion ni mantenimiento continuado por parte de la comunidad.
- Licencia Apache 2.0, que en principio permite uso comercial, pero hereda las condiciones del modelo base `google/embeddinggemma-2`; conviene revisar los terminos de dicho modelo antes de un despliegue comercial.
- Los datos de fidelidad y latencia proceden de las comprobaciones del propio autor y no han sido replicados por terceros.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/shirochenkov90/embeddinggemma-2-coreml
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- EmbeddingGemma 1 (referencia de incompatibilidad): https://huggingface.co/google/embeddinggemma-300m
