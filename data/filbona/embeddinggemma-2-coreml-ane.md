# FilBona/embeddinggemma-2-coreml-ane

## Resumen

Este repositorio contiene una conversión a Core ML de la parte de texto de google/embeddinggemma-2, un modelo de embeddings publicado por Google. La conversión la mantiene el usuario FilBona y su objetivo concreto es ejecutar búsqueda semántica en el dispositivo dentro de la aplicación iOS Voce Locale, aprovechando el Apple Neural Engine (ANE). Al correr sobre el ANE y no sobre la GPU, el modelo puede seguir generando embeddings mientras la aplicación está en segundo plano, algo que en iOS no es posible si se depende de la GPU.

El artefacto distribuido es un `EmbeddingGemma2.mlmodelc` compilado con pesos lineales cuantizados a 8 bits y longitud de entrada fija de 512 tokens. Produce un vector de 768 dimensiones, con mean pooling sobre los tokens y normalización L2, a partir de entradas tokenizadas con el tokenizer original del modelo de Google, que se incluye sin modificar. El repositorio ocupa 0,3 GB y se distribuye bajo licencia Apache 2.0, la misma del modelo original.

Es relevante porque demuestra un patrón habitual en el ecosistema: coger un modelo de embeddings multilingüe y convertirlo a un runtime específico de plataforma para obtener latencias muy bajas (27 ms por fragmento de 512 tokens) y ejecución en segundo plano, a cambio de renunciar a las capacidades multimodales y a la flexibilidad de longitud de secuencia del modelo base. No es una release oficial de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (modelo base construido sobre la arquitectura Gemma 4, segun la documentacion de Google); el artefacto Core ML contiene unicamente la parte de texto |
| Parametros totales | no disponible en la model card; la documentacion del modelo base lo describe como un modelo de 740 M de parametros |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens fijos en esta conversion; la ventana deslizante del modelo base tambien es de 512, por lo que cubre la entrada completa |
| Tipos de cuantizacion | Pesos lineales a 8 bits (int8) en el modelo publicado; se incluye tambien una variante fp16 en los scripts de conversion |
| Idiomas soportados | multilingual (multilingue; lista concreta de idiomas no disponible) |
| Licencia | apache-2.0 |
| Formato de pesos | Core ML (`EmbeddingGemma2.mlmodelc` compilado; `.mlpackage` en los scripts). No se distribuyen safetensors ni GGUF |
| Dimension del embedding | 768 (float32, mean pooling sobre tokens y normalizacion L2) |
| Entrada | `input_ids` int32 `[1, 512]`, rellenado con `0` |
| Tamano del artefacto | 262 MB (int8, 512 fijos) |
| Tokenizer | `tokenizer.json` y `tokenizer_config.json` originales de google/embeddinggemma-2, sin cambios |

## Arquitectura y entrenamiento

El modelo base, google/embeddinggemma-2, es un encoder de embeddings derivado de la arquitectura Gemma 4, segun la documentacion para desarrolladores de Google. La conversion a Core ML afecta solo a la parte de texto. Los cambios introducidos respecto a la referencia en Python son matematicamente equivalentes segun el autor: las mascaras de atencion se construyen dentro del modelo, la atencion se ejecuta con batch 1, `rotate_half` se implementa con `chunk` y `repeat_kv` con `repeat_interleave`. Posteriormente se aplica cuantizacion a 8 bits sobre los pesos de las capas lineales. Los scripts de conversion (`reference.py`, `convert.py`, `quantize.py`, `check.py`) se incluyen en el repositorio, junto con un script de verificacion que compara los vectores resultantes contra la referencia.

El modelo usa un formato de prompt especifico heredado del original: `task: search result | query: …` para consultas y `title: <titulo o none> | text: …` para documentos. La tokenizacion debe hacerse con el `tokenizer.json` original (por ejemplo con swift-transformers o con la libreria `tokenizers` de Hugging Face), ya que los identificadores de token coinciden exactamente con la referencia en Python. En cuanto a los datos de entrenamiento del modelo base (numero de tokens, composicion del dataset, si hubo RLHF o DPO), no hay informacion disponible en el material proporcionado. La innovacion tecnica destacable de este repositorio no esta en el entrenamiento, sino en el despliegue: forzar una forma fija de 512 tokens evita que Core ML caiga a la CPU con formas flexibles, lo que supone una diferencia de rendimiento de entre 28 y 30 veces.

## Capacidades

- Generacion de embeddings de texto: transforma texto en vectores de 768 dimensiones normalizados, aptos para similitud coseno.
- Busqueda semantica y recuperacion de informacion (retrieval): disenado para sentence-similarity y feature-extraction.
- Soporte multilingue, heredado del modelo base.
- Formato de prompt diferenciado para consultas y documentos, lo que mejora la calidad del retrieval frente a usar el texto en crudo.
- Ejecucion en el Apple Neural Engine, con funcionamiento en segundo plano en iOS.
- Inferencia local sin conexion: no requiere enviar texto a un servidor.
- Capacidades multimodales: no disponibles en esta conversion. La documentacion del modelo base de Google describe soporte nativo de texto, imagenes, audio y video en un espacio unificado, pero el artefacto Core ML distribuido aqui solo incluye la parte de texto.
- Tool calling, function calling, agentes y razonamiento multi-paso: no aplica, es un modelo de embeddings, no generativo.

## Casos de uso

- Busqueda semantica local en aplicaciones iOS: indexar las notas o documentos del usuario y recuperar los fragmentos relevantes mediante similitud coseno, sin salir del dispositivo. El ANE permite mantener la indexacion activa en segundo plano.
- RAG sin conexion: usar los embeddings como recuperador de un pipeline de generacion aumentada en el propio telefono, de forma que el texto sensible nunca abandone el dispositivo, lo que simplifica el cumplimiento del RGPD.
- Clasificacion y enrutado de texto: entrenar un clasificador ligero sobre los embeddings para detectar intenciones, idioma o categoria de un mensaje entrante en una app de mensajeria.
- Deduplicacion y agrupacion de documentos: calcular embeddings de un corpus y agrupar por similitud para detectar duplicados, versiones casi identicas o notas repetidas.
- Recomendacion de contenido: representar el historial de lectura del usuario y los articulos candidatos en el mismo espacio de 768 dimensiones para ordenar por afinidad tematica.
- Moderacion y filtrado de texto en el cliente: comparar mensajes contra un conjunto de ejemplos problematicos precalculados y marcar coincidencias semanticas antes de enviar nada a un servidor.
- Migracion de busqueda por palabras clave a busqueda semantica en apps existentes: sustituir o complementar un indice de texto por uno vectorial manteniendo la logica de la app, gracias a que la tokenizacion es la del modelo original.
- Anonimizacion previa al analisis: generar los embeddings en local para tareas de analitica agregada y enviar solo vectores, no texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, MTEB, HumanEval, GSM8K ni equivalentes) en la informacion disponible. El autor si publica mediciones de fidelidad de la conversion y de latencia en un Mac con Apple Silicon, ejecutando sobre el Neural Engine:

| Version | Tamano | Similitud coseno vs original | Tiempo por fragmento de 512 tokens |
|---|---|---|---|
| fp16, forma flexible | 518 MB | 0,999 | 794 ms (CPU) |
| fp16, 512 fijos | 518 MB | 0,999 | 28 ms |
| 8 bits, 512 fijos (este repositorio) | 262 MB | 0,998–1,000 | 27 ms |

La conclusion principal de estas cifras es que la cuantizacion a 8 bits reduce el tamano a la mitad (518 MB a 262 MB) practicamente sin perdida medible de fidelidad, y que fijar la longitud a 512 tokens es lo que permite pasar de una ejecucion en CPU de 794 ms a 27-28 ms en el ANE. No hay mediciones de throughput en lote (el modelo funciona con batch 1) ni datos de consumo energetico.

## Requisitos de hardware

- Hardware objetivo: dispositivos Apple con Neural Engine (iPhone, iPad y Mac con Apple Silicon). El artefacto esta compilado para Core ML y depende del ANE para alcanzar los 27 ms por fragmento.
- No aplica el concepto de VRAM discreta: el modelo corre sobre memoria unificada. No se especifica el consumo de memoria en la informacion disponible.
- Espacio en disco: 262 MB para el modelo int8; 518 MB si se usa la variante fp16.
- GPUs tipo A100, H100 o RTX 4090: no aplicables, Core ML no las utiliza en este contexto.
- Despliegue: coremltools para la conversion, `xcrun coremlcompiler compile` para compilar el `.mlpackage`, y el framework Core ML dentro de una app iOS o macOS. La tokenizacion requiere `tokenizer.json` con swift-transformers o la libreria `tokenizers` de Hugging Face. vLLM, llama.cpp, Ollama o TGI no son aplicables a este formato.
- Latencia medida: 27 ms por fragmento de 512 tokens en un Mac con Apple Silicon usando el ANE; 794 ms si Core ML cae a la CPU con formas flexibles, escenario que el autor describe como 30-40 veces mas lento.
- Limitacion practica: si el modelo no se ejecuta en el ANE (simulador, dispositivos sin Neural Engine o formas de entrada no fijas), el rendimiento se degrada de forma severa.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension del embedding | Modalidades | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| FilBona/embeddinggemma-2-coreml-ane (este repositorio) | no disponible (base descrito como 740 M) | 768 | texto (solo la parte de texto) | Core ML `.mlmodelc`, int8 | Apache 2.0 | Hugging Face, repositorio de 0,3 GB, 0 descargas |
| google/embeddinggemma-2 (modelo base) | 740 M segun la documentacion de Google | 768 | texto, imagen, audio y video | no disponible en la informacion | Apache 2.0 | Hugging Face, release oficial de Google |
| Otras conversiones Core ML de modelos de embeddings para ANE | no disponible | no disponible | no disponible | no disponible | no disponible | no se dispone de datos comparables en la informacion proporcionada |

No hay informacion proporcionada sobre benchmarks comparativos entre este artefacto y otras alternativas de embeddings del mismo tamano, por lo que no es posible establecer una comparacion de calidad (por ejemplo en MTEB) mas alla de la fidelidad frente al modelo original.

## Limitaciones y advertencias

- Solo texto: se pierden las capacidades multimodales (imagen, audio, video) que la documentacion de Google atribuye al modelo base. No sirve para busqueda visual ni de audio con este artefacto.
- Longitud fija de 512 tokens. Documentos mas largos hay que trocearlos y agregar los vectores despues; no hay opcion de contexto largo.
- Las formas flexibles degradan el rendimiento de 27-28 ms a 794 ms por fragmento, por lo que en la practica hay que rellenar siempre hasta 512 tokens, incluso con entradas cortas, con el coste de calculo que eso implica.
- El relleno se hace con `0` y la mascara de atencion solo excluye el padding; hay que respetar ese convenio exactamente.
- Es obligatorio tokenizar con el `tokenizer.json` original. Usar otro tokenizer produce embeddings incorrectos sin aviso.
- La cuantizacion a 8 bits introduce una desviacion pequena pero no nula: la similitud coseno frente al original baja hasta 0,998 en el peor caso.
- No es una release oficial de Google. La calidad del artefacto depende del proceso de conversion del autor, aunque se incluyen scripts y sumas SHA-256 para verificacion.
- Sesgos: no hay informacion sobre sesgos en el material proporcionado. Al ser una derivacion del modelo base, hereda los del original, que tampoco estan documentados aqui.
- Riesgo de alucinacion: no aplica a la generacion de texto, pero si existe riesgo de falsos positivos en similitud semantica cuando el umbral de recuperacion se fija de forma poco cuidadosa.
- Repositorio sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, autor individual.
- Licencia Apache 2.0: permite uso comercial, pero obliga a conservar los avisos de licencia y la atribucion a Google como titular del modelo original.
- Discrepancia a revisar antes de produccion: el artefacto pesa 262 MB con pesos lineales a 8 bits, cifra que no parece coherente con un modelo de 740 M de parametros completamente cuantizado. Conviene verificar que subconjunto del modelo base incluye realmente la conversion si el rendimiento en retrieval no coincide con el esperado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FilBona/embeddinggemma-2-coreml-ane
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Blog de Google DeepMind sobre EmbeddingGemma 2: https://deepmind.google/blog/embeddinggemma-2-an-open-lightweight-multimodal-embedding-model/
- Pagina del modelo en Google DeepMind: https://deepmind.google/models/gemma/embeddinggemma/
- Documentacion para desarrolladores de Google: https://ai.google.dev/gemma/docs/embeddinggemma
- Guia para desarrolladores en el blog de Google: https://developers.googleblog.com/embeddinggemma-2-the-developer-guide/
