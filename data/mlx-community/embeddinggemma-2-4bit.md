# mlx-community/embeddinggemma-2-4bit

## Resumen

`mlx-community/embeddinggemma-2-4bit` es una conversion comunitaria a formato MLX del modelo de embeddings de Google `google/embeddinggemma-2`, cuantizada en 4 bits (modo affine, group size 64). No es un modelo generativo: es un modelo de extraccion de caracteristicas que produce embeddings normalizados de 768 dimensiones, con soporte para texto, imagen, audio y video en el mismo espacio vectorial. Esta mantenida por la organizacion mlx-community y se distribuye bajo licencia Apache-2.0, heredada del modelo original.

El modelo cuenta con unos 744 millones de parametros (dato derivado de los pesos safetensors) y ocupa 1,098 GB en disco en su variante de 4 bits, lo que lo hace adecuado para inferencia local en equipos Apple Silicon mediante MLX. La relevancia actual de esta ficha esta en que permite ejecutar un modelo de embeddings multilingue y multimodal en portatiles Mac sin GPU dedicada, a costa de una perdida de fidelidad numerica medible respecto al checkpoint original en FP32.

La conversion conserva los codificadores de texto, imagen, audio y video. El encoder de texto y la proyeccion de audio estan cuantizados a 4 bits, mientras que las torres de vision y audio y la proyeccion de vision permanecen en BF16. La model card advierte explicitamente de que esta variante de bajo bit muestra deriva de embeddings y recomienda comparar contra BF16 o 8 bits sobre datos de retrieval propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de embeddings multimodal basado en Gemma; detalle de capas no especificado) |
| Parametros totales | 744.371.512 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4-bit affine, group size 64 (esta conversion); el modelo base ofrece otras variantes no cubiertas aqui |
| Idiomas soportados | multilingue (etiqueta del autor; lista concreta de idiomas no disponible) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`) |
| Dimension del embedding | 768 (normalizado); truncamiento Matryoshka a 128, 256 o 512 |
| Modalidades de entrada | texto, imagen, audio, video, y combinaciones texto+imagen |
| Tamano del repositorio | 1,1 GB; almacenamiento de pesos 1,098 GB (decimal) |
| Pipeline declarado | feature-extraction |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo original (numero de capas, atencion, composicion del dataset o fases de entrenamiento). Lo que si se documenta es la estructura de la conversion: se trata de un modelo multimodal con cuatro codificadores (texto, imagen, audio y video) que proyectan a un espacio de embeddings comun de 768 dimensiones, normalizado, con soporte de truncamiento Matryoshka. El texto tambien acepta la convencion de prefijos de tarea definida en `config_sentence_transformers.json` (por ejemplo `task: search result | query: ...` y `title: none | text: ...`).

En cuanto a la cuantizacion, la conversion aplica la politica estandar de MLX-VLM: cuantiza el encoder de texto y la proyeccion de audio a 4 bits con modo affine y group size 64, y deja las torres de vision y audio y la proyeccion de vision en BF16. La model card es explicita en dos puntos tecnicos: mantener pesos y activaciones no cuantizados en BF16 y no convertir el modelo a float16. La conversion se realizo con MLX-VLM en la revision `3d87e884`, partiendo del commit `914f7f89142e33e77833254d9c9b90c3cef7303b` de Google, sobre MLX 0.32.3.

El preprocesamiento multimodal requiere una build de Transformers que exponga `EmbeddingGemma2Processor`. La validacion se hizo con la build upstream `5.18.0.dev0`; la version `5.18.0` de PyPI no expone ese procesador todavia. El ejemplo solo-texto usa `AutoTokenizer` y no necesita ese procesador.

## Capacidades

- Generacion de embeddings de texto normalizados de 768 dimensiones para busqueda semantica y similitud de frases.
- Embeddings de imagen, audio y video, y de la combinacion texto+imagen, segun los codificadores conservados en la conversion.
- Recuperacion cross-modal: comparar una consulta de texto contra pasajes, imagenes, audio o video en el mismo espacio vectorial.
- Soporte multilingue declarado por el autor (sin lista de idiomas publicada).
- Prefijos de tarea para consultas y documentos, con la exigencia de usar la misma dimension de embedding en ambos lados.
- Truncamiento Matryoshka a 128, 256, 512 o 768 dimensiones, util para reducir coste de almacenamiento e indice.
- Tareas derivadas de similitud: clustering, deduplicacion, clasificacion por vecinos cercanos y filtrado.
- No soporta generacion de texto, tool calling, function calling ni razonamiento multi-paso: es un modelo de extraccion de caracteristicas, no un LLM instructivo.

## Casos de uso

- Busqueda semantica multilingue en RAG: indexar un corpus con prefijos de documento y consultar con prefijos de query, usando los 768 valores normalizados y similitud coseno. El soporte multilingue evita mantener un indice por idioma.
- Recuperacion multimodal en Mac: construir un indice unico donde conviven imagenes, fragmentos de audio y video junto a texto, y consultar con lenguaje natural. Util para catalogos de material audiovisual o archivos de prensa.
- Deduplicacion de corpus: agrupar documentos o imagenes casi identicas calculando el producto punto entre embeddings y aplicando un umbral, con truncamiento a 256 o 512 dimensiones para acelerar la comparacion.
- Clasificacion zero-shot y enrutado: asignar etiquetas calculando la similitud entre el embedding de un documento y los embeddings de las descripciones de cada categoria, sin reentrenar cabecera.
- Filtrado y moderacion por similitud: comparar contenido entrante contra un conjunto de embeddings de referencia de contenido no deseado, con el matiz de que la deriva de cuantizacion obliga a calibrar el umbral sobre datos propios.
- Prototipado local con privacidad: al ejecutarse sobre MLX en Apple Silicon, permite procesar documentos sensibles en el propio portatil sin enviar datos a APIs externas.
- Recomendacion de contenido: representar el historial de un usuario y candidatos en el mismo espacio y ordenar por similitud, incorporando modalidades mixtas si el catalogo incluye imagen o video.

## Benchmarks y rendimiento

No se han publicado resultados de MTEB ni de calidad de retrieval en la informacion disponible. La model card solo incluye comprobaciones numericas de conversion (smoke checks), medidas contra el checkpoint original en PyTorch FP32:

| Entrada | Similitud coseno minima vs FP32 | Error absoluto maximo |
|---|---:|---:|
| audio | 0,974435 | 0,037149 |
| imagen | 0,990386 | 0,016959 |
| texto | 0,980877 | 0,022356 |
| texto+imagen | 0,986436 | 0,019337 |
| video | 0,986146 | 0,021160 |

Todas las salidas verificadas fueron finitas, unit-normalizadas y de 768 dimensiones. El test de humo de retrieval de texto situo el pasaje sobre Marte por encima del de Venus. Los autores indican que estas pruebas cubren seis entradas de texto multilingues e inputs sinteticos de imagen, audio, video de dos fotogramas y texto+imagen, y que no constituyen un benchmark de calidad de retrieval comparable a MTEB. Las mediciones completas, incluidas las comparaciones con vectores truncados, estan en `validation.json`.

## Requisitos de hardware

- Pesos del modelo: 1,098 GB (decimal) en disco. La VRAM o memoria unificada necesaria para inferencia es aproximadamente esa cifra mas el espacio de activaciones y buffers.
- Entorno de ejecucion: MLX, por lo que el despliegue nativo es en Apple Silicon (familias M1, M2, M3, M4). No es un formato para CUDA.
- Cabe con holgura en cualquier Mac con 8 GB de memoria unificada; 16 GB o mas da margen si se indexan lotes grandes o se trabaja con video.
- GPU dedicadas tipo A100, H100 o RTX 4090: no aplicables a esta conversion, que esta empaquetada para MLX. Para esos entornos habria que usar el checkpoint original o generar una conversion para otro runtime.
- Opciones de despliegue documentadas: `mlx-vlm` (funcion `load_embedding_model` para texto y `load` para multimodal) junto con `mlx>=0.32.3` y `transformers>=5.18.0`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este repositorio.
- El encoder de texto y la proyeccion de audio van en 4 bits; las torres de vision y audio y la proyeccion de vision en BF16, lo que implica que las rutas multimodales consumen mas memoria que la ruta de solo texto.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Los unicos puntos de referencia documentados son el modelo original y, de forma tangencial, la variante de 8 bits citada por el autor. No hay datos de terceros verificados en la informacion proporcionada, por lo que las celdas sin dato se marcan como no disponibles.

| Modelo | Parametros | Dimension del embedding | Modalidades | Precision | Licencia | Notas |
|---|---|---|---|---|---|---|
| mlx-community/embeddinggemma-2-4bit | 744.371.512 | 768 (Matryoshka 128/256/512) | texto, imagen, audio, video | 4-bit affine (encoder de texto y proyeccion de audio); BF16 en torres de vision y audio | Apache-2.0 | Deriva medible frente a FP32; ejecucion via MLX |
| google/embeddinggemma-2 (base) | no disponible | 768 (segun la conversion) | texto, imagen, audio, video | BF16 / FP32 de referencia | Apache-2.0 | Checkpoint original; punto de comparacion de fidelidad |
| Variante de 8 bits citada en la model card | no disponible | no disponible | no disponible | 8 bits | Apache-2.0 (heredada) | Solo mencionada como alternativa de mayor fidelidad; no se aportan cifras |
| Otros modelos de embeddings multilingues (BGE-M3, multilingual-e5, jina-embeddings) | no disponible | no disponible | no disponible | no disponible | no disponible | No se han consultado ni verificado datos en esta busqueda; no se comparan cifras |

## Limitaciones y advertencias

- Deriva de cuantizacion: la propia model card reconoce deriva medible en los embeddings de esta variante de bajo bit y recomienda comparar contra BF16 o 8 bits sobre los datos de retrieval propios antes de usarla en produccion.
- Las comprobaciones incluidas son pruebas de humo numericas, no evaluaciones de calidad de recuperacion. No hay MTEB ni metricas de recall publicadas.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso. Usarlo como LLM seria un error de categoria.
- Restriccion de precision: no convertir el modelo a float16. Los pesos y activaciones no cuantizados deben permanecer en BF16.
- Dependencia de versiones: el preprocesamiento multimodal exige una build de Transformers que exponga `EmbeddingGemma2Processor` (la validacion uso `5.18.0.dev0`); la `5.18.0` de PyPI no lo expone. El code path de solo texto funciona con `AutoTokenizer`.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos o negativos en recuperacion si se fijan umbrales de similitud sin calibrar.
- Idiomas: la etiqueta declara soporte multilingue, pero no se publica la lista de idiomas ni evaluaciones por idioma.
- Sesgos: no se documentan analisis de sesgo en la informacion disponible; al ser una conversion de un modelo de Google, hereda los sesgos del checkpoint original, que no se detallan aqui.
- Licencia Apache-2.0 heredada del modelo original, con atribucion a Google. Se permite uso comercial segun esa licencia, pero conviene verificar los terminos del checkpoint base.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, y fecha de creacion muy reciente: no hay evidencia de uso en produccion por terceros.
- Coherencia obligatoria de dimension: consultas y documentos deben usar la misma dimension de embedding; mezclar vectores truncados a 256 con otros de 768 invalida la comparacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mlx-community/embeddinggemma-2-4bit
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Revision del checkpoint fuente: https://huggingface.co/google/embeddinggemma-2/tree/914f7f89142e33e77833254d9c9b90c3cef7303b
- Repositorio MLX-VLM (revision de conversion `3d87e884`): https://github.com/Blaizzy/mlx-vlm/tree/3d87e88402f307efbf68e568971aa887ee7d9ed0
- Repositorio MLX-VLM: https://github.com/Blaizzy/mlx-vlm
- Aviso sobre la busqueda web: las consultas realizadas no devolvieron resultados relacionados con este modelo; los enlaces obtenidos correspondian a contenidos sin relacion (polvora negra) y se han descartado. No se dispone por tanto de papers, blogs o demos adicionales verificados para esta ficha.
