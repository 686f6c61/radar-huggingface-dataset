# jayyun98/embeddinggemma-2-text-image-440m-fp32

## Resumen

embeddinggemma-2-text-image-440m-fp32 es un export de despliegue derivado de EmbeddingGemma 2 de Google DeepMind, publicado por el usuario jayyun98 en HuggingFace. Se trata de un modelo de embeddings multimodales (texto, codigo e imagen) que conserva unicamente el backbone de texto, el codificador de vision y la proyeccion de vision del modelo original; el codificador de audio y su proyeccion han sido eliminados deliberadamente. No se aplico entrenamiento, destilacion ni cuantizacion: los pesos se almacenan en FP32 como expansion sin perdida de los valores BF16 originales.

El modelo cuenta con 438.760.472 parametros efectivos, genera embeddings de 768 dimensiones con soporte de Matryoshka Representation Learning (MRL) truncable a 512, 256 y 128 dimensiones, y admite una ventana de contexto de 8.192 tokens. Su licencia es Apache 2.0 y se distribuye en formato safetensors compatible con las librerias Transformers y SentenceTransformers.

Su relevancia practica es doble: por un lado, ofrece una variante de despliegue mas ligera y modular del modelo multimodal completo (sin la parte de audio); por otro, sirve como referencia verificable de que un empaquetado en FP32 reproduce exactamente las salidas del checkpoint original en la misma precision. Es importante senalar que este repositorio no es una publicacion oficial de Google y que no incluye evaluaciones de calidad de recuperacion (tipo MTEB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de EmbeddingGemma 2: backbone de texto, codificador de vision y proyeccion de vision; codificador y proyeccion de audio eliminados. Detalle interno de capas no disponible |
| Parametros totales | 438.760.472 parametros efectivos |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | No se distribuyen variantes cuantizadas; pesos en FP32. No hay GGUF ni GPTQ/AWQ publicados |
| Idiomas soportados | Multilingue (lista completa no disponible; verificacion realizada en ingles y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP32, 1.755,12 MB en archivos de pesos) |
| Dimension de salida | 768 dimensiones; MRL truncable a 512, 256 y 128 |
| Modalidades de entrada | Texto, codigo, imagenes y combinaciones texto + imagen; audio no soportado |
| Libreria | sentence-transformers |
| Version de runtime probada | Transformers 5.19.0, SentenceTransformers 6.1.0, PyTorch 2.14.1 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna (numero de capas, tipo de atencion, dimension del encoder de vision) en la informacion proporcionada. Lo que si se documenta es la composicion modular del export: se retienen el backbone de texto, el codificador de vision y la proyeccion de vision, mientras que se omiten el codificador de audio y su proyeccion. Los assets originales de prompts, pooling, tokenizer y processor se conservan integros; sin embargo, el autor advierte explicitamente que los metadatos del processor no restauran los pesos del encoder eliminado.

En cuanto al entrenamiento, este repositorio no introduce ningun proceso adicional: no hubo entrenamiento, destilacion ni cuantizacion. Los pesos FP32 son una expansion sin perdida de los valores BF16 del checkpoint upstream, lo que significa que no se recupera precision que no existiera ya en el modelo entrenado original. El autor documenta que la inferencia en CPU con FP32 reproduce exactamente las salidas del modelo fuente ejecutado en la misma precision, con diferencias absolutas maximas de 0 en todas las pruebas realizadas. Para conocer el proceso de entrenamiento, la composicion del dataset y si hubo RLHF o DPO, hay que remitirse a la model card del modelo original de Google DeepMind, no incluida en esta informacion. El autor recomienda usar los prefijos de prompt `SearchQuery` para consultas de busqueda, `CodeRetrieval` para busquedas de codigo y `Document` para elementos de corpus, o el formato `title: {title} | text: {content}` para documentos con titulo.

## Capacidades

- Generacion de embeddings de texto y codigo para tareas de similitud semantica, recuperacion y clustering.
- Embeddings de imagen a partir de un objeto PIL (`{"image": image}`), con normalizacion opcional.
- Embeddings multimodales combinados de texto e imagen en una misma representacion (`{"text": ..., "image": ...}`).
- Soporte verificado de entradas con dos imagenes intercaladas.
- Embeddings truncables mediante MRL a 512, 256 y 128 dimensiones manteniendo la coherencia entre consultas y documentos normalizados.
- Capacidad multilingue: se verificaron casos de busqueda y documentos en ingles y coreano, incluyendo consultas de codigo.
- Soporte de prompts especializados por caso de uso (`SearchQuery`, `CodeRetrieval`, `Document`) para separar el espacio de consultas y el de documentos.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de extraccion de caracteristicas, no generativo.
- No dispone de modo de pensamiento (thinking mode), audio ni procesamiento de video.

## Casos de uso

- Busqueda semantica multilingue en corpus documentales: el modelo genera embeddings de consulta con el prompt `SearchQuery` y de documento con `Document`, permitiendo recuperacion cruzada entre idiomas con una ventana de 8.192 tokens por fragmento.
- Recuperacion de codigo en repositorios: usando el prompt `CodeRetrieval` y truncando a 256 dimensiones, se puede indexar un repositorio grande reduciendo el coste de almacenamiento del indice vectorial sin perder capacidad de discriminacion.
- Busqueda visual o recuperacion imagen-texto: gracias a las entradas multimodales, se pueden indexar imagenes y consultarlas mediante descripciones textuales, o combinar ambos tipos de senal en un unico vector.
- Deduplicacion y clustering de articulos largos: la ventana de 8.192 tokens permite procesar documentos completos sin fragmentarlos agresivamente, y los embeddings normalizados facilitan el calculo de similitud coseno por pares.
- Sistemas de recomendacion basados en contenido mixto: al poder representar texto e imagen en el mismo espacio, es posible recomendar productos que combinan ficha descriptiva y fotografia.
- Filtrado previo en pipelines RAG: como modelo de embeddings compacto (438 M de parametros), puede actuar como recuperador inicial de candidatos antes de un reranker mas costoso, reduciendo latencia y coste por consulta.
- Moderacion o clasificacion por similitud con prototipos: comparando el embedding de una entrada contra vectores de referencia normalizados se pueden construir clasificadores ligeros sin reentrenar el modelo.
- Extraccion de caracteristicas para modelos posteriores: la salida de 768 dimensiones (o truncada) sirve como input para clasificadores, regresores o sistemas de deteccion de anomalias en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. En concreto, el autor indica que las mediciones realizadas no son resultados MTEB ni una evaluacion de calidad de recuperacion ni un benchmark de velocidad. Lo unico documentado es una verificacion de equivalencia numerica entre este export y el checkpoint completo de Google ejecutado en la misma precision:

| Fixture | Similitud coseno minima frente al modelo fuente FP32 | Diferencia absoluta maxima |
|---|---:|---:|
| search_english_korean | 1,000000000 | 0 |
| documents | 1,000000000 | 0 |
| code | 1,000000000 | 0 |
| image | 1,000000000 | 0 |
| mixed_text_image | 1,000000000 | 0 |
| interleaved_two_images | 1,000000000 | 0 |

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,8 GB solo para los pesos, mas overhead de activaciones, tokenizer y buffers. En la practica, entre 2,5 y 4 GB de VRAM o memoria RAM del sistema; no se dispone de cifras oficiales.
- VRAM estimada si se carga en BF16 o FP16: en torno a 0,9 GB para pesos, aunque el autor advierte que cargar este paquete FP32 como BF16 cambia la precision en tiempo de ejecucion.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para este tamano (por ejemplo, RTX 3060, RTX 4060, RTX 4090, A100, H100). En GPUs de gama alta el modelo queda limitado por ancho de banda, no por capacidad de memoria.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna con 4 GB o mas de VRAM, y tambien en CPU, ya que el autor verifico la inferencia en CPU en FP32.
- Opciones de despliegue: SentenceTransformers y Transformers con PyTorch, que son los runtimes probados. No hay evidencia de soporte para llama.cpp, Ollama, vLLM, TGI ni text-embeddings-inference, y al no existir variantes GGUF ni cuantizadas, su uso en esos entornos no esta cubierto por la informacion disponible.
- Latencia y throughput: no disponibles. El autor indica explicitamente que no se realizo ningun benchmark de velocidad.

## Comparativa con modelos similares

Solo se dispone de informacion suficiente para comparar con el modelo del que deriva. Los datos del resto de alternativas no estan disponibles en la informacion proporcionada.

| Modelo | Parametros | Contexto | Dimensiones | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| jayyun98/embeddinggemma-2-text-image-440m-fp32 | 438.760.472 | 8.192 tokens | 768 (MRL 512/256/128) | Texto, codigo, imagen, texto+imagen | Apache 2.0 | HuggingFace, safetensors FP32 |
| google/embeddinggemma-2 (modelo fuente) | No disponible en la informacion proporcionada | No disponible | No disponible | Texto, codigo, imagen y audio | Apache 2.0 | HuggingFace, checkpoint BF16 completo |
| Otras alternativas de embeddings multimodales | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La diferencia funcional documentada entre este export y el modelo fuente es la ausencia del codificador y la proyeccion de audio, ademas del cambio de almacenamiento de BF16 a FP32.

## Limitaciones y advertencias

- No es una publicacion oficial de Google: se trata de un export derivado e independiente, por lo que las garantias de mantenimiento y soporte dependen del autor del repositorio.
- El codificador de audio y su proyeccion han sido eliminados; cualquier caso de uso con audio no funcionara. Los flujos con video no fueron evaluados.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que implica escasa validacion por parte de la comunidad.
- No se han publicado resultados de benchmarks de calidad de recuperacion (MTEB u otros); la unica verificacion disponible es de equivalencia numerica con el modelo fuente, no de rendimiento en tareas reales.
- Los pesos FP32 no anaden precision respecto al checkpoint original entrenado en BF16; solo evitan la perdida adicional del almacenamiento en precision reducida.
- Cargar este paquete como BF16 o FP16 altera la precision en tiempo de ejecucion y, por tanto, invalida la equivalencia verificada con el modelo fuente en FP32.
- No se detalla la lista completa de idiomas soportados; las verificaciones se limitaron a ingles y coreano, por lo que el comportamiento en otros idiomas no esta documentado.
- La ventana de contexto esta limitada a 8.192 tokens; entradas mas largas requieren truncado o fragmentacion.
- Al ser un modelo de embeddings y no generativo, no puede producir texto, razonar de forma explicita ni ejecutar llamadas a herramientas; su salida es siempre un vector.
- Riesgo de sesgo y de alucinacion: no hay informacion disponible sobre sesgos en la informacion proporcionada. En tareas de recuperacion, los errores se manifiestan como falsos positivos o negativos en la similitud, no como texto inventado.
- Licencia Apache 2.0, que permite uso comercial, pero el autor incluye LICENSE y NOTICE y remite a la model card original para los terminos, el uso previsto y las limitaciones del modelo base.
- Requiere versiones concretas de librerias (Transformers >= 5.19.0, SentenceTransformers >= 6.1.0) que pueden no estar disponibles en entornos con dependencias fijadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jayyun98/embeddinggemma-2-text-image-440m-fp32
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Revision fuente fijada: https://huggingface.co/google/embeddinggemma-2/tree/914f7f89142e33e77833254d9c9b90c3cef7303b
- conversion.json (precision de almacenamiento, comprobaciones de eliminacion y conversion): https://huggingface.co/jayyun98/embeddinggemma-2-text-image-440m-fp32/blob/main/conversion.json
- verification.json (runtime, resultados numericos y entorno probado): https://huggingface.co/jayyun98/embeddinggemma-2-text-image-440m-fp32/blob/main/verification.json
- LICENSE (Apache 2.0): https://huggingface.co/jayyun98/embeddinggemma-2-text-image-440m-fp32/blob/main/LICENSE
- NOTICE: https://huggingface.co/jayyun98/embeddinggemma-2-text-image-440m-fp32/blob/main/NOTICE
- Resultados de busqueda web: la busqueda no devolvio ningun resultado relevante sobre el modelo; los enlaces recuperados corresponden a discusiones sobre el videojuego Cyberpunk 2077 y no guardan relacion con esta ficha.
