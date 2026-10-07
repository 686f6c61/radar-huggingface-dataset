# gahabeen/embeddinggemma-2-text-image-440m-mlx-bf16

## Resumen

EmbeddingGemma 2 Text + Image (440M, MLX, BF16) es un export de despliegue derivado de google/embeddinggemma-2, publicado por el usuario gahabeen. No es un modelo entrenado desde cero ni un ajuste fino: es un empaquetado modular de los pesos originales en formato MLX, con precision BF16 conservada tensor a tensor y sin cuantizacion, destilacion ni reentrenamiento. El paquete retiene unicamente el backbone de texto, el encoder de vision y la proyeccion de vision; el encoder y la proyeccion de audio han sido eliminados del artefacto.

El modelo es un bi-encoder de embeddings (pipeline feature-extraction) con 438.760.448 parametros efectivos, salida de 768 dimensiones y truncamiento MRL a 512, 256 y 128 dimensiones. Acepta texto, codigo, imagenes y entradas mixtas texto+imagen intercaladas, con un presupuesto de contexto de 8.192 tokens. La licencia es Apache 2.0 y la etiqueta de idioma es multilingue.

Su relevancia es practica: permite ejecutar un modelo de embeddings multimodal sobre silicio de Apple mediante MLX, con una huella en disco de 877,6 MB (decimal) en BF16, lo que encaja en portatiles con memoria unificada modesta. Resulta util para equipos que ya trabajan con embeddings de Google y quieren inferencia local en macOS sin depender de CUDA ni de servicios remotos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bi-encoder transformer multimodal basado en Gemma 2 (backbone de texto + encoder de vision + proyeccion de vision); el encoder de audio ha sido eliminado |
| Parametros totales | 438.760.448 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | Ninguna. El repositorio solo distribuye BF16 (todos los tensores verificados). No se ofrece GGUF ni versiones cuantizadas |
| Idiomas soportados | Multilingue (etiqueta del repositorio). Verificacion explicita realizada en ingles y coreano; no se publica la lista completa de idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors en BF16, disenados para el runtime MLX (libreria mlx, requiere mlx-vlm) |
| Dimension de embedding | 768; truncamiento MRL a 512, 256 y 128 |
| Modalidades de entrada | Texto, codigo, imagen, texto+imagen, dos imagenes intercaladas |
| Tamano del repositorio | 0,9 GB (ficheros de pesos: 877,60 MB en decimal) |

## Arquitectura y entrenamiento

El artefacto es un export de despliegue, no un modelo nuevo: no se aplico entrenamiento, destilacion ni cuantizacion. La arquitectura subyacente corresponde a EmbeddingGemma 2 de Google DeepMind, un bi-encoder que produce representaciones normalizables para similitud semantica. El export conserva el backbone de texto, el encoder de vision y la proyeccion de vision, y descarta el encoder y la proyeccion de audio. Los pesos retenidos preservan la precision BF16 original. La revision fuente citada es 914f7f89142e33e77833254d9c9b90c3cef7303b del checkpoint de Google.

El autor no publica detalles de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO o estrategias de contraste) y remite a la model card original para esos datos, por lo que esa informacion se considera no disponible en esta ficha. Lo que si se documenta es el proceso de conversion y verificacion: cada tensor fue comprobado para confirmar BF16, y se valido la carga nativa estricta en MLX con inferencia sobre GPU de Apple Silicon. La implementacion MLX es la de MLX-VLM en la revision fijada 3d87e884. El modelo emplea prefijos de tarea literales definidos en config_sentence_transformers.json (`SearchQuery` para consultas de busqueda, `CodeRetrieval` para busqueda de codigo, `Document` para elementos de corpus, y `title: {title} | text: {content}` para documentos con titulo) y preserva pooling, tokenizer y procesador originales.

## Capacidades

- Generacion de embeddings de texto y codigo, con prefijos de tarea especificos para busqueda, recuperacion de codigo y documentos.
- Generacion de embeddings de imagen pura a partir de entrada RGB.
- Embeddings de entradas mixtas texto+imagen, incluida la intercalacion de dos imagenes en una misma secuencia.
- Similitud semantica y sentence-similarity sobre representaciones normalizadas.
- Truncamiento Matryoshka (MRL) a 512, 256 y 128 dimensiones, lo que permite reducir coste de almacenamiento y de calculo de similitud.
- Capacidad multilingue declarada, con verificacion funcional documentada en ingles y coreano.
- Compatibilidad con flujos de recuperacion (retrieval) para RAG y busqueda semantica.
- No soporta generacion de texto, tool calling, agentes, razonamiento multi-paso, audio ni video. El encoder de audio esta ausente y los flujos de video no fueron evaluados.

## Casos de uso

- Busqueda semantica multilingue en documentacion tecnica: indexar manuales y notas de version con el prefijo `Document` y consultar con `SearchQuery`, aprovechando los 8.192 tokens de contexto para absorber secciones completas sin trocear en exceso.
- RAG sobre corpus mixto texto+imagen: recuperar simultaneamente fragmentos de texto y capturas o diagramas, generando embeddings de imagen y de entrada mixta con el mismo espacio vectorial.
- Busqueda de codigo en repositorios internos: usar el prefijo `CodeRetrieval` para consultas de codigo y `Document` para los ficheros indexados, de forma que la busqueda semantica funcione entre lenguajes y nombres de simbolo distintos.
- Deduplicacion y agrupacion de documentos: calcular embeddings a 128 o 256 dimensiones mediante MRL para reducir el coste de memoria y aplicar umbrales de similitud coseno sobre grandes volumenes en un portatil.
- Clasificacion y enrutado de tickets de soporte: representar el texto del ticket y las descripciones de cada cola o categoria, y asignar por similitud; el truncamiento MRL permite servir el clasificador con latencia baja.
- Recomendacion y busqueda inversa de imagenes en catalogos: indexar productos o activos visuales con el encoder de vision y consultar por imagen o por descripcion textual mixta.
- Moderacion y deteccion de contenido duplicado: comparar embeddings de publicaciones o mensajes para identificar copias casi identicas sin depender de coincidencia exacta de cadenas.
- Filtrado previo en pipelines de datos de entrenamiento: usar el modelo como clasificador ligero para descartar pares texto-imagen poco relacionados antes de etapas mas costosas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card lo indica de forma explicita: las mediciones incluidas son comprobaciones numericas de carga y conversion, no resultados MTEB, evaluacion de calidad de recuperacion ni benchmark de velocidad.

Lo unico verificable son las comprobaciones de fidelidad frente al checkpoint completo de Google en FP32:

| Fixture | Coseno minimo frente a FP32 de origen | Diferencia absoluta maxima |
|---|---:|---:|
| search_english_korean | 0,999968330 | 0,000979403965 |
| documents | 0,999956582 | 0,00113807619 |
| code | 0,999964800 | 0,000997241586 |
| image | 0,999978069 | 0,000812895596 |
| mixed_text_image | 0,999942632 | 0,00147365957 |
| interleaved_two_images | 0,999946479 | 0,00150192995 |

Estas cifras miden equivalencia numerica entre runtimes (MLX nativo frente a PyTorch FP32), no capacidad del modelo. Las diferencias se atribuyen al redondeo BF16 y a la aritmetica propia de cada runtime.

## Requisitos de hardware

- VRAM o memoria unificada para inferencia: los pesos BF16 ocupan 877,6 MB; contando activaciones, buffers del procesador de imagen y lotes, conviene reservar entre 2 y 3 GB. En FP32 los pesos suben a aproximadamente 1,75 GB.
- GPU recomendadas: al ser un export MLX, el destino es Apple Silicon (familias M1, M2, M3 y M4). No hay soporte CUDA en este artefacto; para NVIDIA habria que usar el checkpoint original en PyTorch.
- Cabe en GPU de consumo: si, en cualquier Mac con Apple Silicon y 8 GB o mas de memoria unificada. Es un modelo de 438 millones de parametros, por lo que no requiere hardware de gama alta.
- Opciones de despliegue: MLX con mlx-vlm mediante `load_embedding_model` y `get_model_path`; requiere `mlx>=0.32.3`, `transformers>=5.19.0` y la revision fijada de MLX-VLM (`git+https://github.com/Blaizzy/mlx-vlm.git@3d87e884...`). Son aplicables tambien las rutas habituales del ecosistema de embeddings (Sentence Transformers, vLLM, TGI) usando el checkpoint original de Google, no este export.
- Latencia y throughput: no disponible. La model card indica que las verificaciones realizadas no constituyen un benchmark de velocidad.
- Advertencia de precision: no convertir este modelo a FP16, segun la propia documentacion. Usar BF16 o FP32.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension de salida | Contexto | Modalidad | Licencia |
|---|---|---|---|---|---|
| Este export (embeddinggemma-2-text-image-440m-mlx-bf16) | 438,8 M | 768 (MRL 512/256/128) | 8.192 | texto, codigo, imagen, mixto | Apache 2.0 |
| google/embeddinggemma-2 (upstream) | no disponible | no disponible | no disponible | texto, imagen y audio (el export elimina el audio) | no disponible |
| BAAI/bge-m3 | 568 M | 1.024 | 8.192 | texto | MIT |
| intfloat/multilingual-e5-large | 560 M | 1.024 | 512 | texto | MIT |
| jinaai/jina-embeddings-v3 | 570 M | 1.024 | 8.192 | texto | CC-BY-NC-4.0 |

Nota: los datos de los modelos alternativos proceden de sus respectivas model cards publicas y no han sido verificados en esta ficha; conviene contrastarlos antes de tomar decisiones de produccion. La diferencia clave de este export frente a ellos es la modalidad de imagen y que su licencia Apache 2.0 permite uso comercial, mientras que jina-embeddings-v3 lo restringe a uso no comercial. No se dispone de comparaciones de calidad de recuperacion (MTEB u otras) para este export.

## Limitaciones y advertencias

- No se distribuyen resultados de calidad de recuperacion. Las unicas metricas publicadas son comprobaciones de equivalencia numerica entre runtimes, no evaluaciones de rendimiento funcional.
- El encoder de audio ha sido eliminado del paquete. Cualquier flujo que dependa de embeddings de audio no funcionara con este artefacto.
- Los flujos de video no fueron evaluados por el autor.
- Restriccion de precision: no se debe convertir el modelo a FP16; hay que usar BF16 o FP32. Hacerlo puede degradar la calidad de los embeddings.
- Los embeddings truncados por MRL deben normalizarse despues del recorte, y consultas y documentos deben usar la misma dimension. Omitir cualquiera de las dos condiciones invalida la comparacion por similitud coseno.
- El uso del modelo depende de prefijos de tarea literales. No aplicarlos, o aplicarles el formato incorrecto, reduce la calidad de recuperacion.
- Idiomas: solo se verifico explicitamente ingles y coreano. La cobertura real del resto de idiomas declarados como multilingues no se documenta en la informacion disponible.
- No hay informacion publica sobre sesgos, tasas de alucinacion (no aplica generacion de texto, pero si posibles falsos positivos en recuperacion) ni composicion del dataset de entrenamiento original.
- Discrepancia de identificadores: el codigo de ejemplo de la model card invoca `jayyun98/embeddinggemma-2-text-image-440m-mlx-bf16`, mientras que el repositorio indicado en la informacion proporcionada es `gahabeen/embeddinggemma-2-text-image-440m-mlx-bf16`. Conviene confirmar cual es el identificador vigente antes de usarlo en produccion.
- Implementacion dependiente de una revision fijada de MLX-VLM. Actualizar MLX-VLM sin control puede romper la carga del modelo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: trazabilidad y mantenimiento a cargo de un unico autor independiente, sin respaldo de Google.
- Aunque la licencia declarada es Apache 2.0, es un export derivado no oficial; se incluyen LICENSE y NOTICE, y se recomienda revisar la model card original antes de un uso comercial.

## Enlaces

- HuggingFace: https://huggingface.co/gahabeen/embeddinggemma-2-text-image-440m-mlx-bf16
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Revision fuente citada: https://huggingface.co/google/embeddinggemma-2/tree/914f7f89142e33e77833254d9c9b90c3cef7303b
- Implementacion MLX-VLM (revision fijada): https://github.com/Blaizzy/mlx-vlm/tree/3d87e88402f307efbf68e568971aa887ee7d9ed0
- Repositorio MLX-VLM: https://github.com/Blaizzy/mlx-vlm
- conversion.json y verification.json: disponibles en el propio repositorio de HuggingFace del modelo

Nota: las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo, su modelo base ni sus benchmarks; los unicos resultados obtenidos correspondian a contenidos sin relacion con la consulta.
