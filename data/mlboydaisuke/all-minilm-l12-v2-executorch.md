# mlboydaisuke/all-MiniLM-L12-v2-ExecuTorch

## Resumen

all-MiniLM-L12-v2-ExecuTorch es una conversión del modelo de embeddings de frases `sentence-transformers/all-MiniLM-L12-v2` al formato ExecuTorch, optimizado para inferencia en dispositivo (on-device). El autor, mlboydaisuke, ha creado una familia de modelos de embeddings ejecutables en móviles y edge, con pooling integrado en el grafo y normalización L2 incluida, de modo que el consumidor recibe directamente un vector de 384 dimensiones listo para usar en búsqueda semántica, clustering o recuperación.

El modelo base tiene 33,4 millones de parámetros, 12 capas BERT y una salida de 384 dimensiones. La conversión a ExecuTorch incluye tres variantes: XNNPACK fp32 (133 MB), XNNPACK fp16 (66,7 MB) y Core ML fp32 (66,9 MB), con latencias medidas en Mac arm64 de 29,2 ms, 51,0 ms y 3,6 ms respectivamente. La versión Core ML es aproximadamente cinco veces más rápida que PyTorch eager (17,4 ms), mientras que XNNPACK fp32 resulta más lento que eager, un dato relevante para decidir qué build usar en producción.

La relevancia de este modelo radica en que permite ejecutar embeddings de calidad en dispositivos sin conexión, preservando la privacidad de los datos y reduciendo la latencia de red. Al incorporar la pooling dentro del grafo, se elimina la posibilidad de error en la configuración del lado del cliente, un problema habitual en despliegues de sentence-transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (MiniLM-L12-H384-uncased), 12 capas transformer |
| Parametros totales | 33,4 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (entrada fija `[1, 256]` int64) |
| Tipos de cuantizacion | fp32, fp16 (XNNPACK y Core ML); int8 disponible pero no publicado (69,5 MB, peor que fp16) |
| Idiomas soportados | Ingles (modelo base entrenado solo en ingles; ver limitaciones) |
| Licencia | Apache-2.0 |
| Formato de pesos | ExecuTorch `.pte` (safetensors no aplicable) |

## Arquitectura y entrenamiento

El modelo base `all-MiniLM-L12-v2` es un transformer BERT de 12 capas con 384 dimensiones ocultas, entrenado mediante aprendizaje contrastivo auto-supervisado sobre un corpus de 1 billon de pares de frases en ingles. El objetivo de entrenamiento es predecir, dada una frase, cual de un conjunto de frases muestreadas aleatoriamente es la verdadera frase relacionada. Esta tecnica produce embeddings densos de alta calidad para tareas de similitud semantica.

La conversion a ExecuTorch utiliza el flujo `torch.export -> to_edge_transform_and_lower(partitioner) -> .pte`, con particionado para XNNPACK o Core ML. La innovacion clave es que la pooling (mean pooling sobre el mask) y la normalizacion L2 estan integradas dentro del grafo, de modo que el modelo devuelve directamente el vector final. Esto evita errores de configuracion en el lado del cliente, especialmente importante porque modelos de la misma familia (como bge-small-en-v1.5 o paraphrase-multilingual-L12) usan pooling o normalizacion diferentes.

El autor descarto la variante int8 porque, al cuantizar solo los pesos lineales y dejar la tabla de embeddings de tokens intacta (46,9 MB de los 133 MB totales), el resultado pesa 69,5 MB, mas que los 66,7 MB de fp16. La tabla de embeddings no se cuantiza, por lo que fp16 es la opcion mas eficiente en tamano.

## Capacidades

- Generacion de embeddings de frases de 384 dimensiones, normalizados y con pooling medio integrado en el grafo.
- Similitud semantica entre frases: el modelo produce vectores que permiten calcular similitud por coseno.
- Busqueda semantica y recuperacion de informacion: los embeddings pueden indexarse y compararse para encontrar documentos relevantes.
- Clustering de documentos o frases: los vectores sirven como entrada para algoritmos de agrupacion no supervisada.
- Clasificacion de texto: los embeddings pueden alimentar clasificadores lineales o redes pequenas.
- Ejecucion completamente en dispositivo (on-device) gracias a ExecuTorch, sin necesidad de conexion a internet.
- Soporte de entrada `input_ids` y `attention_mask` como tensores int64 de forma `[1, 256]`.
- Salida directamente el vector final, sin necesidad de post-procesamiento externo.

## Casos de uso

- Busqueda semantica en aplicaciones moviles: una app de notas puede indexar las notas del usuario y permitir busquedas por significado, no solo por palabras clave, ejecutando el modelo localmente con Core ML en iOS (3,6 ms de latencia) o XNNPACK fp32 en Android.
- Sistemas de recomendacion de contenido: dado un articulo o producto, se calcula su embedding y se comparan con los de otros items para sugerir alternativas similares, todo en el dispositivo del usuario sin enviar datos a servidores.
- Moderacion de contenido en tiempo real: clasificar comentarios o mensajes de usuarios en categorias (spam, toxicidad, etc.) usando embeddings como caracteristicas, con latencia inferior a 30 ms en CPU movil.
- Clustering de documentos para organizacion personal: agrupar correos, documentos o mensajes por tema de forma automatica, usando los embeddings como entrada a algoritmos como k-means, ejecutable en el dispositivo.
- Deteccion de duplicados en bases de datos locales: comparar embeddings de registros para identificar entradas repetidas o casi duplicadas, util en aplicaciones de gestion de contactos o inventario.
- Sistemas de preguntas y respuestas offline: indexar un corpus de FAQs o documentacion y recuperar la respuesta mas relevante a una pregunta del usuario, todo localmente, gracias a la similitud coseno entre la pregunta y los documentos indexados.
- Filtrado de noticias o feeds personalizados: clasificar articulos por tema usando embeddings y filtrar contenido no deseado, sin depender de servicios en la nube.

## Benchmarks y rendimiento

Los datos de rendimiento provienen de la model card del autor, medidos en Mac arm64 con una secuencia de 256 tokens (mediana de 10 ejecuciones):

| Build | Archivo | Tamano | Latencia | Peor coseno vs eager |
|---|---|---|---|---|
| XNNPACK fp32 | `embed_all_minilm_l12_xnnpack_fp32.pte` | 133,0 MB | 29,2 ms | 1,000000 |
| XNNPACK fp16 | `embed_all_minilm_l12_xnnpack_fp16.pte` | 66,7 MB | 51,0 ms | 0,999998 |
| Core ML fp32 | `embed_all_minilm_l12_coreml_all.pte` | 66,9 MB | 3,6 ms | 0,999955 |
| PyTorch eager fp32 | — | — | 17,4 ms | referencia |

La verificacion de calidad se realizo comparando los embeddings generados por el modelo convertido contra los del modelo eager con su pooling documentado, sobre ocho frases incluyendo una en japones. El peor coseno es 0,999998 o mejor, indicando que la conversion no degrada practicamente los resultados.

Ademas, se valido la utilidad de los vectores: una parafrasis obtiene una similitud de 0,606 contra una frase no relacionada que obtiene -0,110. Una frase en japones comparada con una en ingles obtiene -0,089, lo que confirma que el modelo es solo para ingles, como se espera.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, etc.) porque este modelo no es generativo ni de razonamiento; su tarea es exclusivamente generar embeddings.

## Requisitos de hardware

- VRAM estimada: no aplica (modelo de embeddings, no generativo). El archivo .pte de 133 MB (fp32) o 66,7 MB (fp16) se carga en memoria RAM del dispositivo; en GPU movil se usaria la memoria unificada.
- GPU recomendadas: no requiere GPU dedicada. Funciona en CPU movil (ARM) y en el Neural Engine de Apple via Core ML.
- Cabe en cualquier dispositivo movil moderno: el modelo fp16 ocupa 66,7 MB, perfectamente viable en smartphones de gama media.
- Opciones de despliegue: ExecuTorch runtime en Android/iOS, con particionado XNNPACK (CPU) o Core ML (Apple). No compatible con vLLM, llama.cpp u Ollama, ya que es un formato .pte especifico de ExecuTorch.
- Latencia medida en Mac arm64: 3,6 ms con Core ML, 29,2 ms con XNNPACK fp32, 51,0 ms con XNNPACK fp16. En dispositivos moviles reales los valores pueden variar, pero el orden de magnitud se mantiene.

## Comparativa con modelos similares

| Modelo | Parametros | Dimensiones | Contexto | Formato | Latencia (Mac arm64) | Licencia |
|---|---|---|---|---|---|---|
| all-MiniLM-L12-v2-ExecuTorch (este) | 33,4M | 384 | 256 | ExecuTorch .pte | 3,6 ms (Core ML) | Apache-2.0 |
| all-MiniLM-L6-v2-ExecuTorch | 22,7M | 384 | 256 | ExecuTorch .pte | no disponible | Apache-2.0 |
| bge-small-en-v1.5-ExecuTorch | 33,4M | 384 | 512 | ExecuTorch .pte | no disponible | MIT |
| paraphrase-multilingual-MiniLM-L12-v2-ExecuTorch | 118M | 384 | 256 | ExecuTorch .pte | no disponible | Apache-2.0 |

La comparativa se basa en la familia de modelos del mismo autor. El modelo L12 es el hermano mayor del L6, con el doble de capas (12 vs 6) pero la misma dimension de salida. BGE-small-en-v1.5 usa pooling CLS en lugar de mean, y el multilingue no normaliza, lo que justifica la decision de integrar la pooling en el grafo. Para aplicaciones multilingues, el modelo paraphrase-multilingual es la alternativa adecuada, aunque con mas parametros (118M).

## Limitaciones y advertencias

- Modelo entrenado exclusivamente en ingles: la verificacion muestra que frases en japones obtienen similitud negativa con frases en ingles, confirmando que no es multilingue. Para otros idiomas, usar paraphrase-multilingual-MiniLM-L12-v2.
- Longitud de contexto fija de 256 tokens: frases o documentos mas largos deben truncarse o dividirse, lo que puede perder informacion semantica.
- XNNPACK fp32 es mas lento que PyTorch eager (29,2 ms vs 17,4 ms) en Mac arm64: no es una optimizacion universal. En Android, el autor recomienda fp32 si la latencia importa, y fp16 si el tamano es prioritario, aunque fp16 es aun mas lento (51,0 ms) por la falta de kernels fp16 en XNNPACK.
- La variante int8 no se publica porque pesa mas que fp16 (69,5 MB vs 66,7 MB), debido a que la tabla de embeddings de tokens no se cuantiza. Si se necesita cuantizacion int8, habria que modificar el proceso de conversion.
- El formato .pte es exclusivo de ExecuTorch: no es compatible con otros runtimes como ONNX Runtime, TensorFlow Lite o llama.cpp. Requiere integrar el runtime de ExecuTorch en la aplicacion.
- No hay garantia de soporte a largo plazo: el autor es un individuo (mlboydaisuke) y el repositorio de scripts de conversion (executorch-models) puede no mantenerse activamente.
- Licencia Apache-2.0 permite uso comercial sin restricciones, pero el modelo base tiene su propia licencia (tambien Apache-2.0), sin problemas de atribucion adicionales.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/mlboydaisuke/all-MiniLM-L12-v2-ExecuTorch)
- [Modelo base sentence-transformers/all-MiniLM-L12-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L12-v2)
- [Repositorio de scripts de conversion executorch-models](https://github.com/john-rocky/executorch-models)
- [Modelo hermano L6](https://huggingface.co/mlboydaisuke/all-MiniLM-L6-v2-ExecuTorch)
- [Modelo multilingue de la misma familia](https://huggingface.co/mlboydaisuke/paraphrase-multilingual-MiniLM-L12-v2-ExecuTorch)
