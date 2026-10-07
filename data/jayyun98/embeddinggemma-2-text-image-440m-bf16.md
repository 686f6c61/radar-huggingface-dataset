# jayyun98/embeddinggemma-2-text-image-440m-bf16

## Resumen

`jayyun98/embeddinggemma-2-text-image-440m-bf16` es un export de despliegue del modelo de embeddings multimodal EmbeddingGemma 2 de Google DeepMind, publicado por el usuario jayyun98. Se trata de una versión modular que conserva únicamente el backbone de texto, el codificador de visión y la proyección de visión; el codificador y la proyección de audio han sido eliminados. No se aplicó entrenamiento, destilación ni cuantización: los pesos retenidos mantienen la precisión BF16 original del checkpoint de origen.

El modelo tiene 438.760.472 parámetros efectivos (unos 440 M, de ahí el sufijo del nombre) y genera embeddings de 768 dimensiones con soporte de Matryoshka Representation Learning (MRL) para truncar a 512, 256 y 128 dimensiones. Admite como entrada texto, código, imágenes y combinaciones texto+imagen, con un presupuesto de contexto de 8.192 tokens. Está pensado para tareas de recuperación (retrieval), búsqueda semántica, similitud de frases y búsqueda de código, y se distribuye a través de SentenceTransformers y Transformers.

Su relevancia práctica es doble: por un lado ofrece un empaquetado ligero (877,60 MB de pesos) orientado a entornos con memoria limitada y compatible con el pipeline `feature-extraction`; por otro, al eliminar el audio reduce el tamaño respecto al modelo completo. Es un derivado independiente, no una publicación oficial de Google, y en el momento de redactar esta ficha no registra descargas ni valoraciones en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia `embedding_gemma2`; backbone de texto + codificador de vision + proyeccion de vision) |
| Parametros totales | 438.760.472 (efectivos) |
| Parametros activos | no aplica (no se documenta una variante MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | No se aplico cuantizacion; pesos almacenados en BF16. El autor indica explicitamente que no debe convertirse a FP16; usar BF16 o FP32 |
| Idiomas soportados | Multilingue (sin listado de idiomas concreto en la informacion disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16); 877,60 MB en archivos de pesos |
| Dimension de salida | 768; MRL a 512, 256 y 128 |
| Modalidades de entrada | Texto, codigo, imagenes, texto + imagenes |
| Modalidades no soportadas | Audio (codificador y proyeccion eliminados); video no evaluado |
| Libreria / runtime | SentenceTransformers >= 6.1.0, Transformers >= 5.19.0, PyTorch 2.14.1 (entorno probado); API MLX mencionada en la model card |
| Modelo base | google/embeddinggemma-2 (revision `914f7f89142e33e77833254d9c9b90c3cef7303b`) |
| Tamano del repositorio | 0,9 GB |
| Pipeline | feature-extraction |

## Arquitectura y entrenamiento

El autor describe el paquete como un export modular de despliegue del modelo EmbeddingGemma 2 de Google DeepMind. Se retienen exclusivamente el backbone de texto, el codificador de vision y la proyeccion de vision; los componentes de audio (codificador y proyeccion) estan ausentes. No se aplico ningun proceso de entrenamiento, destilacion ni cuantizacion sobre los pesos: se trata de una conversion de almacenamiento y empaquetado, manteniendo la precision BF16 del checkpoint original. Los prompts originales, el comportamiento de pooling, el tokenizer y los assets del processor se conservan, aunque el autor advierte que los metadatos del processor no restauran los pesos del codificador eliminado.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si el modelo original uso RLHF, DPO u otras tecnicas de alineacion. La model card remite al modelo original de Google para los detalles de entrenamiento, uso previsto y limitaciones. Como elemento de control de calidad, el autor incluye verificaciones numericas comparando las salidas de este export en BF16 (sobre GPU MPS) contra el modelo fuente completo ejecutado en FP32, con resultados de paridad muy altos que se detallan en la seccion de benchmarks. Estas comprobaciones son pruebas de carga y precision numerica, no evaluaciones de calidad de recuperacion.

## Capacidades

- Generacion de embeddings de texto multilingue para similitud semantica y recuperacion de informacion.
- Embeddings de codigo, con prompt especifico `CodeRetrieval` para busquedas sobre repositorios o fragmentos de codigo.
- Extraccion de caracteristicas de imagen (image-feature-extraction) mediante el codificador de vision retenido.
- Embeddings multimodales de entrada mixta texto+imagen en un mismo espacio vectorial, lo que permite busqueda cruzada entre modalidades.
- Soporte de entradas con dos imagenes intercaladas (verificado por el autor, aunque el autor indica que los flujos de video no fueron evaluados).
- Dimensiones truncables mediante MRL: 768, 512, 256 y 128, con normalizacion posterior al truncado.
- Prompts diferenciados por tarea: `SearchQuery` para consultas de busqueda, `Document` para elementos del corpus y `CodeRetrieval` para busqueda de codigo; para documentos con titulo se usa el formato `title: {title} | text: {content}` sin prefijo adicional.
- No es un modelo generativo: no produce texto, razonamiento, tool calling ni agentes. Su salida es exclusivamente vectorial.
- Sin soporte de audio en este export.

## Casos de uso

- Busqueda semantica en documentacion tecnica: indexar el corpus con el prompt `Document` y consultar con `SearchQuery`, aprovechando los 8.192 tokens de contexto para fragmentos largos sin troceado agresivo.
- Busqueda de codigo en repositorios internos: usar `CodeRetrieval` para localizar funciones o fragmentos por descripcion en lenguaje natural (por ejemplo, "funcion Python que ordena una lista") con vectores truncados a 256 dimensiones para reducir coste de almacenamiento.
- Recuperacion multimodal en catalogos de producto: generar el vector de una consulta textual y compararlo contra el vector de la imagen del producto, ya que ambos se proyectan al mismo espacio de 768 dimensiones.
- Deduplicacion y clustering de imagenes: extraer embeddings de imagen individuales y agrupar por similitud coseno para detectar duplicados o near-duplicates en un archivo fotografico.
- Sistemas RAG sobre corpus multilingue: el modelo admite consultas y documentos en idiomas distintos (la verificacion del autor cubre busqueda en ingles y coreano), lo que permite un unico indice para contenido en varios idiomas.
- Moderacion y clasificacion semantica por similitud: comparar embeddings de contenido entrante contra vectores de referencia de categorias definidas, sin necesidad de entrenar un clasificador adicional.
- Rankings y recomendacion por similitud: calcular similitud coseno entre el perfil vectorial de un usuario y el vector de elementos del catalogo en un rango de dimensiones reducido (128 o 256) para servir resultados con baja latencia.
- Indexacion de documentos con titulo: emplear el formato `title: {title} | text: {content}` para mejorar la representacion de articulos, entradas de FAQ o fichas tecnicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MTEB u otros) en la informacion disponible. El autor indica expresamente que las mediciones incluidas no son resultados MTEB, ni una evaluacion de calidad de recuperacion, ni un benchmark de velocidad.

Si se incluyen en la model card verificaciones de paridad numerica frente al checkpoint completo de Google en FP32, ejecutadas con inferencia BF16 sobre GPU MPS:

| Fixture | Similitud coseno minima vs fuente FP32 | Diferencia absoluta maxima |
|---|---:|---:|
| search_english_korean | 0,999962518 | 0,00236937404 |
| documents | 0,999946502 | 0,00167062879 |
| code | 0,999964441 | 0,00194609165 |
| image | 0,999976741 | 0,00345304608 |
| mixed_text_image | 0,999971017 | 0,00102181733 |
| interleaved_two_images | 0,999946668 | 0,0018362999 |

Estas cifras comprueban que las salidas del export coinciden con las del modelo fuente en la misma precision; no miden calidad de recuperacion ni throughput.

## Requisitos de hardware

- Memoria para pesos: 877,60 MB en BF16 (archivos de pesos); en FP32 la huella de pesos se situa en torno a 1,7-1,8 GB (estimacion a partir del recuento de parametros).
- VRAM estimada para inferencia: aproximadamente 1,5-2,5 GB en BF16 contando pesos, activaciones y overhead de runtime con lotes moderados; en torno a 3 GB en FP32. Son estimaciones, no valores medidos publicados.
- Cabe en GPU de consumo: si. Cualquier GPU con 4 GB o mas de VRAM deberia ser suficiente en BF16; el autor verifico la inferencia BF16 sobre backend MPS (Apple Silicon).
- No usar FP16: el autor advierte explicitamente de no convertir el modelo a FP16; emplear BF16 o FP32.
- Opciones de despliegue documentadas: SentenceTransformers (>= 6.1.0), Transformers (>= 5.19.0) con PyTorch 2.14.1, y la API MLX mencionada en la model card. La etiqueta `endpoints_compatible` sugiere compatibilidad con HuggingFace Inference Endpoints.
- Opciones no documentadas en la informacion disponible: vLLM, TGI, llama.cpp, Ollama, TEI y similares no se mencionan; habria que validarlas por separado.
- Latencia y throughput: no disponible. No se han publicado mediciones de velocidad.
- Nota de memoria: el autor advierte que el tamano de los pesos (877,60 MB) no equivale a la memoria total de ejecucion, y que los valores 270M/440M de los nombres de repositorio son tamanos de despliegue redondeados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Dimension de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| jayyun98/embeddinggemma-2-text-image-440m-bf16 | 438.760.472 efectivos (BF16) | 8.192 tokens | Texto, codigo, imagen, texto+imagen (sin audio) | 768 con MRL 512/256/128 | Apache 2.0 | HuggingFace, via SentenceTransformers/Transformers |
| google/embeddinggemma-2 (modelo base) | no disponible (incluye codificador y proyeccion de audio, por lo que supera el recuento de este export) | no disponible | Texto, imagen, audio (segun la model card de este export) | no disponible | no disponible en la informacion proporcionada | HuggingFace (revision `914f7f89`) |
| Otras alternativas de embeddings multilingues | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados de terceros modelos comparables (por ejemplo, alternativas de embeddings multilingues de tamano similar) en la informacion proporcionada, por lo que no se incluyen cifras de rendimiento comparado.

## Limitaciones y advertencias

- No es una publicacion oficial de Google: es un derivado independiente; para uso previsto, entrenamiento y limitaciones hay que consultar la model card original.
- Sin audio: el codificador y la proyeccion de audio fueron eliminados. Los flujos de audio no funcionaran y los metadatos del processor no restauran esos pesos.
- Video no evaluado por el autor.
- Prohibido el uso en FP16 segun el autor; forzar FP16 puede degradar la precision de los embeddings.
- Es un modelo de embeddings, no generativo: no produce texto, no razona de forma autoregresiva, no soporta tool calling ni flujos de agentes.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si existe riesgo de falsos positivos en similitud: vectores cercanos no implican equivalencia semantica real, especialmente en dominios muy tecnicos.
- Requisitos de formato de prompt: usar el prefijo correcto (`SearchQuery`, `Document`, `CodeRetrieval`) y dimensiones coincidentes entre consulta y documento; el incumplimiento degrada la calidad de recuperacion.
- Normalizar despues del truncado MRL (por ejemplo, al truncar a 256 dimensiones) para que las similitudes coseno sean comparables.
- Idiomas: la etiqueta indica "multilingual" pero no se publica el listado de idiomas soportados ni evaluaciones por idioma.
- Sin benchmarks de recuperacion publicados (MTEB u otros): la calidad real en tareas de retrieval no esta acreditada con datos.
- Sin traccion comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion independiente.
- Licencia Apache 2.0: permite uso comercial, pero al ser un derivado conviene conservar los archivos LICENSE y NOTICE y atribuir los pesos y el tokenizer/processor originales a Google DeepMind.
- Las cifras de VRAM, latencia y throughput no estan publicadas; cualquier planificacion de produccion deberia basarse en mediciones propias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jayyun98/embeddinggemma-2-text-image-440m-bf16
- Modelo base (Google DeepMind): https://huggingface.co/google/embeddinggemma-2
- Revision del checkpoint de origen: https://huggingface.co/google/embeddinggemma-2/tree/914f7f89142e33e77833254d9c9b90c3cef7303b
- Artefactos de verificacion incluidos en el repositorio: `conversion.json` y `verification.json`
- Busqueda web: no se han encontrado enlaces relevantes al modelo en los resultados de busqueda disponibles (los resultados devueltos no guardan relacion con el modelo y se descartan).
