# janusz-bit/multilingual-e5-small-gguf

## Resumen

`janusz-bit/multilingual-e5-small-gguf` es una conversion al formato GGUF del modelo de embeddings `intfloat/multilingual-e5-small`, publicada por el desarrollador janusz-bit. No es un modelo generativo, sino un encoder de frases (feature-extraction) que produce vectores densos de 384 dimensiones para tareas de similitud semantica y recuperacion de informacion multilingue. Su proposito es permitir la busqueda semantica en local dentro de Brulion, una aplicacion de notas Markdown offline-first.

El modelo original, desarrollado por Microsoft Research (equipo de Liang Wang et al.), pertenece a la familia E5 de embeddings de texto multilingues y esta disenado para funcionar con prefijos asimetricos: `query: ` para consultas y `passage: ` para documentos. Con 117.505.920 parametros y una ventana de hasta 512 tokens, es un modelo compacto pensado para ejecutarse en dispositivos con recursos limitados.

La relevancia de esta publicacion radica en que el conversor oficial de llama.cpp mapea mal este modelo (genera un vocabulario WordPiece erroneo o desplaza los ids de posicion en 2). El autor aporta un script propio que preserva el vocabulario SentencePiece y las posiciones desde 0, de modo que los ids de token coinciden exactamente con el tokenizer de Hugging Face. Segun su benchmark, el ranking resultante iguala al de PyTorch en las 341 consultas evaluadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (familia E5, derivada de XLM-R small); pooling de media incluido en el fichero |
| Parametros totales | 117.505.920 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | hasta 512 tokens |
| Tipos de cuantizacion | q8_0 (unica publicada; el autor indica que la perdida es despreciable) |
| Idiomas soportados | multilingue (etiquetas declaradas: multilingual, pl, en) |
| Licencia | MIT |
| Formato de pesos | GGUF (`multilingual-e5-small-q8_0.gguf`, 132.440.544 bytes) |
| Dimension del embedding | 384 |
| SHA-256 del fichero | `3a98dd889ee152d923991c60df2fad21e39f7441a5ee302a0a050d5137993b60` |
| Revision del modelo base | `614241f622f53c4eeff9890bdc4f31cfecc418b3` |

## Arquitectura y entrenamiento

El modelo base `intfloat/multilingual-e5-small` es un encoder Transformer de la familia E5, entrenado con aprendizaje contrastivo sobre pares de texto relacionados en multiples idiomas. El detalle de la composicion del dataset de entrenamiento, el numero de tokens utilizados y las tecnicas de alineacion (si las hubo) no se detallan en la informacion disponible; el autor remite al informe tecnico de la familia E5 (arXiv:2402.05672) para esos datos.

Esta version GGUF no reentrena ni modifica los pesos: unicamente cambia el formato y aplica cuantizacion q8_0. La innovacion tecnica relevante es el proceso de conversion, documentado en `scripts/semantic/convert_e5_gguf.py`. El conversor oficial de llama.cpp no es correcto para este modelo porque asigna un vocabulario WordPiece (propio de `BertModel`) o desplaza los ids de posicion a partir de 2 (propio de `XLMRobertaModel`). El script del autor conserva el vocabulario SentencePiece y las posiciones desde 0, garantizando la equivalencia de token ids con el tokenizer de Hugging Face. El pooling de media queda almacenado en el propio fichero GGUF.

## Capacidades

- Generacion de embeddings de frases de 384 dimensiones para similitud semantica y recuperacion.
- Busqueda semantica multilingue (consultas en un idioma contra documentos en otro).
- Clasificacion de texto y clustering mediante similitud coseno sobre los vectores.
- Deteccion de duplicados y near-duplicates por distancia entre embeddings.
- Recuperacion asimetrica mediante prefijos `query: ` y `passage: `.
- Ejecucion local en CPU y GPU a traves de llama.cpp, sin dependencia de servicios externos.
- No soporta generacion de texto, tool calling, agentes, vision ni audio: es exclusivamente un encoder.

## Casos de uso

- Busqueda semantica en aplicaciones de notas offline: es el caso de uso original en Brulion; la app descarga el fichero GGUF y embebe las notas en el dispositivo, permitiendo encontrar contenido por significado sin conexion.
- Recuperacion aumentada (RAG) en local: indexar una base documental con prefijo `passage: ` y consultar con `query: ` para alimentar un LLM generativo con los fragmentos mas relevantes, todo en el mismo equipo.
- Deduplicacion de registros: calcular embeddings de entradas de una base de datos y agrupar las que superen un umbral de similitud coseno, util en tareas de limpieza de datos.
- Clasificacion zero-shot ligera: comparar el embedding de un texto con los de descripciones de categoria y asignar la mas proxima, sin entrenar un clasificador.
- Moderacion o filtrado de contenido por similitud: detectar mensajes proximos a patrones conocidos de spam o abuso mediante comparacion vectorial.
- Busqueda multilingue en catalogos: indexar productos o articulos en un idioma y permitir consultas en otro, aprovechando la alineacion multilingue del modelo.
- Sistemas de recomendacion por contenido: representar elementos y preferencias del usuario como vectores y ordenar por similitud, con un coste de computo bajo (118M parametros).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, MTEB u otros) en la informacion disponible. El autor aporta una evaluacion propia de equivalencia frente a PyTorch: el ranking coincide en la primera posicion para 341 de 341 consultas y las puntuaciones difieren en menos de 2·10⁻⁴, lo que indica que la cuantizacion q8_0 no degrada la calidad de forma medible en esa prueba.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para el fichero q8_0 (132 MB de pesos mas overhead de contexto y activaciones); ejecutable en CPU sin GPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en cualquier GPU con soporte de llama.cpp (RTX 4090, A100, H100) pero el modelo es demasiado pequeno para aprovecharlas.
- Cabe en cualquier GPU de consumo e incluso en dispositivos moviles y sistemas embebidos.
- Opciones de despliegue: llama.cpp (herramienta de referencia para este fichero); otros runners compatibles con GGUF no estan verificados en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera procesamiento de lotes pequenos en milisegundos, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|
| multilingual-e5-small-gguf (este) | 117,5M | 384 | 512 | multilingue | MIT | GGUF q8_0 |
| intfloat/multilingual-e5-small (original) | 117,5M | 384 | 512 | multilingue | MIT | safetensors |
| intfloat/multilingual-e5-base | no disponible en la informacion | no disponible | no disponible | multilingue | MIT | safetensors |
| intfloat/multilingual-e5-large | no disponible en la informacion | no disponible | no disponible | multilingue | MIT | safetensors |

La comparativa con las variantes base y large de la misma familia se limita a la existencia de esas versiones en el ecosistema E5; los datos concretos de parametros, dimension y contexto de esas variantes no figuran en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, codigo ni respuestas; solo vectores.
- Ventana maxima de 512 tokens: los documentos mas largos deben trocearse antes de embeberlos.
- Requiere respetar los prefijos `query: ` y `passage: `; omitirlos degrada la calidad de la recuperacion.
- Solo se publica la cuantizacion q8_0; no hay variantes de menor precision (q4, q5) en el repositorio.
- El modelo arrastra los sesgos del corpus de entrenamiento multilingue original, que no se detalla en la informacion disponible.
- Riesgo de falsos positivos en similitud: textos con vocabulario compartido pero significado distinto pueden quedar proximos en el espacio vectorial; conviene calibrar umbrales por caso de uso.
- La cobertura multilingue es amplia pero no uniforme; las etiquetas declaradas solo mencionan multilingual, pl y en, y el rendimiento en idiomas de bajos recursos no esta documentado.
- Licencia MIT, sin restricciones conocidas para uso comercial; los pesos son identicos a los del modelo base, solo cambia el formato.
- El repositorio registra 0 descargas y 0 likes, por lo que no hay validacion externa de la comunidad sobre esta conversion concreta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/janusz-bit/multilingual-e5-small-gguf
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
- Informe tecnico E5: https://arxiv.org/abs/2402.05672
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Aplicacion Brulion: https://github.com/janusz-bit/brulion
- Script de conversion: https://github.com/janusz-bit/brulion/blob/main/scripts/semantic/convert_e5_gguf.py
- Documentacion del proceso: https://github.com/janusz-bit/brulion/blob/main/docs/SEMANTIC.md#the-model-file
