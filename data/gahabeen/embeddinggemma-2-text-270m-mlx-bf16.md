# gahabeen/embeddinggemma-2-text-270m-mlx-bf16

## Resumen

EmbeddingGemma 2 — Text Only — BF16 — MLX es una exportacion de despliegue derivada de EmbeddingGemma 2, el modelo de embeddings de Google DeepMind. La publica el usuario independiente gahabeen y no es un lanzamiento oficial de Google. Se trata de un recorte modular: conserva unicamente el backbone de texto del modelo original y elimina por completo el codificador de audio y su proyeccion, asi como el codificador de vision y la suya. No se aplico ningun tipo de entrenamiento, destilacion ni cuantizacion posterior; los pesos retenidos mantienen la precision BF16 del checkpoint original.

El resultado es un modelo denso de 271.002.624 parametros efectivos (271.002.648 segun los safetensors), con una ventana de contexto de 8.192 tokens y una salida de 768 dimensiones que admite truncacion MRL a 512, 256 y 128 dimensiones. La funcion es la extraccion de caracteristicas y la similitud semantica entre frases, tanto sobre texto como sobre codigo, con soporte multilingue. Al estar empaquetado en formato MLX, esta pensado para inferencia nativa en GPU de Apple Silicon.

Su relevancia es acotada pero concreta: ofrece un modelo de embeddings pequeno (unos 542 MB en disco) que cabe comodamente en un Mac con memoria unificada, permite construir pipelines de RAG o busqueda semantica en local sin depender de API externas y admite recortar las dimensiones de salida para abaratar el indexado vectorial. La contrapartida es que pierde las capacidades multimodales del modelo de origen y que depende de una revision fijada de MLX-VLM para funcionar, ademas de no contar con resultados de MTEB publicados en la informacion disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de embeddings (backbone de texto de EmbeddingGemma 2); sin codificadores de audio ni de vision |
| Parametros totales | 271.002.648 (271.002.624 como "parametros efectivos" en la model card) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible; el autor no aplico cuantizacion y advierte de no convertir el modelo a FP16 (usar BF16 o FP32) |
| Idiomas soportados | multilingue (sin listado de idiomas en la informacion disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en BF16 para MLX (peso de los ficheros: 542,06 MB en decimal) |
| Dimensiones de salida | 768; truncacion MRL a 512, 256 y 128 |
| Entradas | texto y codigo |
| Biblioteca / runtime | mlx (model card), pipeline feature-extraction |
| Tamano del repositorio | 0,6 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del backbone de texto de EmbeddingGemma 2, un transformer denso orientado a producir representaciones vectoriales (pipeline de feature-extraction y sentence-similarity) en lugar de texto generado. Esta exportacion es un recorte: se han eliminado los pesos del codificador de audio, su proyeccion, el codificador de vision y su proyeccion. La model card advierte explicitamente de que los metadatos del processor se conservan, pero eso no restaura los pesos eliminados: las entradas de imagen, audio y video no estan disponibles en este artefacto. El pooling, los prompts originales, el tokenizer y los assets del processor se mantienen tal cual.

No hubo entrenamiento, destilacion ni cuantizacion en esta publicacion; los pesos son los del checkpoint original de Google DeepMind pasados a MLX en BF16. La formulacion de tareas se hace mediante prefijos literales definidos en `config_sentence_transformers.json`: `SearchQuery` para consultas de busqueda, `CodeRetrieval` para consultas de busqueda de codigo y `Document` para elementos de corpus; para documentos con titulo se usa el formato `title: {title} | text: {content}` sin otro prefijo. La model card incluye una verificacion numerica de la conversion frente al checkpoint FP32 de Google: similitud coseno minima de 0,999968330 en el fixture de busqueda ingles/coreano, 0,999956582 en documentos y 0,999964800 en codigo, con diferencias absolutas maximas por debajo de 0,0012. El propio autor aclara que son comprobaciones de carga y de aritmetica, no resultados de MTEB ni una evaluacion de calidad de recuperacion ni un benchmark de velocidad.

## Capacidades

- Extraccion de embeddings de texto: genera vectores de 768 dimensiones aptos para similitud coseno y recuperacion semantica.
- Soporte de codigo: la model card incluye un fixture especifico de consultas de codigo y el prefijo `CodeRetrieval` para busqueda sobre repositorios.
- Multilingue: la etiqueta de idioma es `multilingual`, con verificacion de busqueda en ingles y coreano.
- Truncacion MRL: permite recortar las representaciones a 512, 256 o 128 dimensiones y normalizar despues del recorte, lo que reduce el coste de almacenamiento y de calculo de similitud.
- Modo documento con titulo: acepta el formato `title: {title} | text: {content}` para indexar elementos con metadatos de titulo.
- Ejecucion nativa en MLX sobre Apple Silicon, con carga estricta verificada y comprobaciones de inferencia en GPU de Apple.
- No soporta generacion de texto, tool calling, function calling, razonamiento multi-paso ni comportamiento agentico: es un modelo de embeddings, no un modelo de lenguaje generativo.
- No dispone de capacidades de vision, audio ni video: los encoders correspondientes fueron eliminados en esta exportacion.

## Casos de uso

- Busqueda semantica multilingue en bases documentales: indexando el corpus con el prefijo `Document` y las consultas con `SearchQuery`, el modelo recupera pasajes relevantes por similitud coseno sobre vectores de 768 dimensiones, con la ventaja de que la ventana de 8.192 tokens permite embeber fragmentos largos sin trocear en exceso.
- RAG en local sobre Mac: al ser un modelo de 271 millones de parametros en BF16 y ejecutarse con MLX, se puede montar un pipeline completo de retrieval en un portatil o Mac mini con memoria unificada, sin enviar documentos a servicios externos.
- Busqueda de codigo en repositorios internos: usando el prefijo `CodeRetrieval`, se pueden indexar funciones, ficheros y fragmentos de codigo para que los desarrolladores encuentren implementaciones por descripcion funcional en lugar de por coincidencia literal.
- Deduplicacion y clustering de documentos: la truncacion MRL a 128 o 256 dimensiones permite calcular similitudes sobre millones de vectores con un coste de memoria muy inferior, agrupando documentos casi identicos antes de alimentar un pipeline de ingest.
- Enrutado y clasificacion de consultas: comparar la consulta entrante contra un conjunto de embeddings de referencia (por ejemplo, intenciones de soporte) permite clasificar y derivar la peticion al flujo adecuado sin entrenar un clasificador especifico.
- Recomendacion y matching de ofertas o perfiles: embeber descripciones de producto, ofertas de empleo o perfiles y ordenar candidatos por similitud coseno, aprovechando la normalizacion posterior al recorte para que la comparacion sea consistente.
- Moderacion y filtrado por similitud: mantener embeddings de referencia de contenido no deseado y marcar entradas que superen un umbral de similitud, con la ventaja de que el modelo puede correr en el mismo equipo que el resto del pipeline.
- Indexado de documentacion tecnica con titulos: el formato `title: {title} | text: {content}` permite incorporar el encabezado de cada seccion al embedding y mejorar la recuperacion en manuales y referencias de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MTEB u otros) en la informacion disponible. Lo unico que aporta la model card son comprobaciones de fidelidad numerica frente al checkpoint FP32 de Google, que el propio autor califica como verificaciones de carga y aritmetica, no como evaluaciones de calidad de recuperacion:

| Fixture | Similitud coseno minima frente al FP32 de origen | Diferencia absoluta maxima |
|---|---:|---:|
| search_english_korean | 0,999968330 | 0,000979403965 |
| documents | 0,999956582 | 0,00113807619 |
| code | 0,999964800 | 0,000997241586 |

## Requisitos de hardware

- VRAM / memoria estimada: los pesos ocupan 542,06 MB en BF16 (el repositorio completo, 0,6 GB). La model card recuerda que el tamano de los pesos no es la memoria total en tiempo de ejecucion, que sera superior por activaciones, tokenizer y buffers.
- Precision: usar BF16 o FP32. La model card prohibe explicitamente convertir el modelo a FP16.
- GPU: el runtime es MLX, orientado a GPU de Apple Silicon (chips de la familia M). No hay soporte indicado para CUDA en esta publicacion, por lo que las referencias tipo A100, H100 o RTX 4090 no aplican al artefacto tal como esta empaquetado; para usar hardware NVIDIA habria que recurrir al checkpoint original de Google en PyTorch.
- Consumer GPU / equipos de consumo: al estar en MLX, el destino natural es un Mac con memoria unificada, donde 542 MB de pesos caben sin problema en cualquier configuracion actual.
- Opciones de despliegue: carga mediante `mlx_vlm.embedding_loader.load_embedding_model` y `mlx_vlm.utils.get_model_path`, con `mlx>=0.32.3` y `transformers>=5.19.0`. La model card exige una revision fijada de MLX-VLM (commit `3d87e88402f307efbf68e568971aa887ee7d9ed0`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. No se ha publicado ninguna medicion de velocidad en la informacion proporcionada.

## Comparativa con modelos similares

No hay datos de rendimiento comparativos (MTEB ni similares) en la informacion disponible, por lo que la comparacion se limita a caracteristicas verificables.

| Modelo | Parametros | Contexto | Dimensiones | Entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| gahabeen/embeddinggemma-2-text-270m-mlx-bf16 | 271.002.648 | 8.192 tokens | 768 con MRL 512/256/128 | texto y codigo | Apache 2.0 | HuggingFace, formato MLX safetensors BF16 |
| google/embeddinggemma-2 (modelo de origen) | no disponible en la informacion proporcionada | 8.192 tokens heredados | 768 con MRL 512/256/128 | texto, codigo, audio y vision | Apache 2.0 | HuggingFace (revision de origen `914f7f89142e33e77833254d9c9b90c3cef7303b`) |
| Otros modelos de embeddings multilingues (por ejemplo, variantes tipo BGE-M3 o E5) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La diferencia clave frente al modelo de origen no es de calidad sino de alcance: esta exportacion elimina audio y vision y pierde la multimodalidad, a cambio de reducir el artefacto a un unico backbone de texto ejecutable en MLX.

## Limitaciones y advertencias

- Es un modelo de embeddings, no generativo: no produce texto, no hace tool calling ni razonamiento multi-paso, y no debe evaluarse como un LLM.
- Solo acepta texto y codigo. Las entradas de imagen, audio y video no existen en este artefacto, aunque los metadatos del processor sigan presentes.
- Riesgo de falsos positivos en similitud: la similitud coseno puede puntuar alto textos superficialmente parecidos; conviene fijar umbrales con datos propios y no confiar solo en el score.
- La truncacion MRL exige renormalizar los vectores despues del recorte y usar la misma dimension para consultas y documentos; si no se hace, las comparaciones dejan de ser validas.
- Limite de contexto de 8.192 tokens: los documentos mas largos deben trocearse por separado.
- Alucinacion: no aplica en el sentido generativo, pero si en la interpretacion de resultados; el modelo no verifica la veracidad del contenido recuperado.
- No se ha publicado evaluacion de sesgos ni de equidad para esta exportacion; los sesgos heredados del modelo original no estan medidos aqui.
- Licencia Apache 2.0, que permite uso comercial, pero obliga a conservar los ficheros LICENSE y NOTICE incluidos y a respetar la atribucion a Google DeepMind (pesos y tokenizer) y a los contribuidores de MLX-VLM (implementacion). Es una exportacion derivada independiente, no un lanzamiento oficial de Google.
- Dependencia fragil del ecosistema: requiere MLX 0.32.3, Transformers 5.19.0 y una revision fijada de MLX-VLM; cambiar de version puede romper la carga.
- Advertencia de precision: no convertir a FP16, usar BF16 o FP32.
- Repositorio con 0 descargas y 0 me gusta en el momento de la consulta, publicado por un autor independiente: conviene validar el artefacto antes de usarlo en produccion.
- Inconsistencia en la propia model card: el ejemplo de codigo llama al repositorio `jayyun98/embeddinggemma-2-text-270m-mlx-bf16`, mientras que el identificador del modelo es `gahabeen/embeddinggemma-2-text-270m-mlx-bf16`; hay que ajustar la ruta al repositorio correcto.
- Las comprobaciones numericas incluidas no son una evaluacion de calidad de recuperacion ni un benchmark de velocidad; no deben citarse como tales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gahabeen/embeddinggemma-2-text-270m-mlx-bf16
- Modelo de origen: https://huggingface.co/google/embeddinggemma-2
- Revision de origen del checkpoint de Google: https://huggingface.co/google/embeddinggemma-2/tree/914f7f89142e33e77833254d9c9b90c3cef7303b
- Implementacion MLX-VLM (revision fijada): https://github.com/Blaizzy/mlx-vlm/tree/3d87e88402f307efbf68e568971aa887ee7d9ed0
- Repositorio MLX-VLM: https://github.com/Blaizzy/mlx-vlm
- Fichero de conversion y comprobaciones de precision incluido en el repositorio: `conversion.json`
- Fichero de verificacion (runtime, resultados numericos y entorno probado): `verification.json`
- Nota: las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo (los resultados obtenidos correspondian a sitios comerciales y municipales sin relacion). No se han encontrado papers, blogs ni demos adicionales en la informacion disponible.
