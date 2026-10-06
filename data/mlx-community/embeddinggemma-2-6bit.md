# mlx-community/embeddinggemma-2-6bit

## Resumen

EmbeddingGemma 2 es un modelo de embeddings desarrollado por Google que genera representaciones vectoriales normalizadas de 768 dimensiones a partir de contenido textual y multimodal (imagen, audio y video). Esta ficha concreta documenta la conversion a formato MLX publicada por la comunidad mlx-community, cuantizada a 6 bits en modo affine con tamano de grupo 64, pensada para ejecucion eficiente en hardware Apple Silicon. El repositorio conserva los encoders de texto, vision, audio y video, y mantiene las torres de vision y audio junto con la proyeccion de vision en BF16, mientras que el encoder de texto y la proyeccion de audio se cuantizan.

El modelo resuelve tareas de recuperacion semantica, similitud de frases y extraccion de caracteristicas (feature extraction), con soporte multilingue y prefijos de tarea especificos para consultas y documentos. Es relevante porque permite desplegar un encoder de embeddings multimodal sobre GPU integradas de Apple mediante MLX, con un peso total de aproximadamente 1,166 GB y una perdida numerica muy reducida respecto al checkpoint original en PyTorch FP32.

Cuenta con 744.371.512 parametros totales y soporta truncamiento Matryoshka a 128, 256, 512 o 768 dimensiones, lo que facilita el ajuste del coste de almacenamiento y de la latencia de busqueda segun la aplicacion. La licencia es Apache-2.0, heredada del modelo base google/embeddinggemma-2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder multimodal (texto, imagen, audio, video) basado en EmbeddingGemma 2, con torres de vision y audio; no disponible el detalle fino de la arquitectura interna del modelo base |
| Parametros totales | 744.371.512 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits affine, tamano de grupo 64; torres de vision y audio y proyeccion de vision en BF16 |
| Idiomas soportados | Multilingue |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria MLX) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base google/embeddinggemma-2, mas alla de que se trata de un modelo multimodal con encoders de texto, imagen, audio y video que produce embeddings normalizados de 768 dimensiones. La conversion a MLX aplica la politica estandar de MLX-VLM: se cuantizan el encoder de texto y la proyeccion de audio a 6 bits (affine, grupo 64), y se dejan en BF16 las torres de vision y audio, la proyeccion de vision y las activaciones. No se debe convertir este modelo a float16.

La conversion se realizo a partir de la revision `914f7f89142e33e77833254d9c9b90c3cef7303b` del repositorio original, usando MLX-VLM en la revision `3d87e884` (rama `pc/embeddinggemma-2`) y MLX 0.32.3. La model card no aporta informacion sobre volumen de tokens de entrenamiento, composicion del dataset ni tecnicas de alineacion como RLHF o DPO. Como innovacion tecnica destacable, el modelo admite truncamiento Matryoshka, es decir, que los propios embeddings pueden recortarse a 128, 256, 512 o 768 dimensiones conservando utilidad semantica, siempre que consultas y documentos usen la misma dimension.

## Capacidades

- Generacion de embeddings de texto normalizados de 768 dimensiones para similitud de frases y recuperacion semantica.
- Extraccion de caracteristicas multimodales: imagen, audio y video, ademas de combinaciones texto-imagen.
- Soporte de prefijos de tarea definidos en `config_sentence_transformers.json` para consultas y documentos, orientados a tareas de recuperacion.
- Capacidad multilingue, con verificaciones realizadas sobre seis entradas de texto en varios idiomas.
- Truncamiento Matryoshka a 128, 256, 512 o 768 dimensiones.
- Uso como modelo de sentence-similarity y feature-extraction en pipelines de busqueda y clasificacion.
- No se menciona soporte de tool calling, function calling ni comportamiento de agente en la informacion disponible.

## Casos de uso

- Busqueda semantica multilingue: el modelo genera embeddings normalizados que permiten indexar documentos en varios idiomas y recuperar pasajes relevantes para una consulta, aplicando los prefijos de tarea de recuperacion.
- Recomendacion de contenido: se pueden calcular similitudes coseno entre embeddings de items para construir sistemas de recomendacion basados en contenido textual y combinaciones texto-imagen.
- Deduplicacion y clustering de documentos: la similitud de frases y el truncamiento Matryoshka a dimensiones bajas (128 o 256) permiten agrupar grandes volumenes de textos con coste reducido de memoria.
- Clasificacion y etiquetado de imagenes: usando las capacidades de image-feature-extraction junto con texto, se pueden construir clasificadores zero-shot que comparen la imagen con etiquetas textuales descritas.
- Recuperacion sobre audio y video: la conservacion de los encoders de audio y video permite indexar y buscar dentro de contenido audiovisual usando embeddings del mismo espacio que el texto.
- Moderacion de contenido asistida: comparar embeddings de textos entrantes contra un conjunto de referencia de contenidos no deseados para detectar similitudes.
- Ejecucion local en Apple Silicon: al estar convertido a MLX, encaja en flujos de trabajo que corren en Mac con GPU integrada sin depender de un servidor remoto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MTEB u otros) en la informacion disponible. La model card indica explicitamente que las comprobaciones realizadas son verificaciones numericas de la conversion, no un benchmark de calidad de recuperacion. Se presentan a continuacion los errores medidos frente al checkpoint original en PyTorch FP32:

| Entrada | Cosino minimo vs FP32 | Error absoluto maximo |
|---|---:|---:|
| audio | 0.998277 | 0.007221 |
| imagen | 0.999374 | 0.004241 |
| texto | 0.997741 | 0.007285 |
| texto_imagen | 0.998703 | 0.007021 |
| video | 0.998988 | 0.005243 |

Todas las salidas comprobadas fueron finitas, unitariamente normalizadas y de 768 dimensiones. La prueba de recuperacion textual clasifico el pasaje sobre Marte por encima del de Venus.

## Requisitos de hardware

- Los pesos cuantizados ocupan aproximadamente 1,166 GB en disco, por lo que el modelo cabe holgadamente en la memoria unificada de cualquier Mac con Apple Silicon.
- Al estar basado en MLX, el destino natural es hardware Apple Silicon (familias M1, M2, M3, M4 y superiores); no se documentan requisitos de VRAM para GPU NVIDIA.
- Al ser un modelo relativamente pequeno (744 millones de parametros), es previsible que quepa en tarjetas consumer de gama media si se ejecuta fuera de MLX, aunque la informacion disponible no incluye requisitos de VRAM estimados por cuantizacion.
- Opciones de despliegue: MLX y MLX-VLM. La carga de texto usa `mlx_vlm.embedding_loader.load_embedding_model` y `AutoTokenizer`; la carga multimodal requiere un build de Transformers que exponga `EmbeddingGemma2Processor` (la validacion uso un build 5.18.0.dev0).
- Latencia y throughput estimados: no disponibles.
- Advertencia de precision: mantener pesos y activaciones no cuantizados en BF16; no convertir el modelo a float16.

## Comparativa con modelos similares

Comparativa con el modelo base del que deriva esta conversion:

| Modelo | Parametros | Dimensiones de embedding | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mlx-community/embeddinggemma-2-6bit | 744.371.512 | 768 (truncable a 128/256/512) | 6 bits affine, grupo 64 | Apache-2.0 | MLX, en HuggingFace |
| google/embeddinggemma-2 (base) | no disponible | 768 | BF16 / FP32 | Apache-2.0 | Pesos originales en HuggingFace |

No se dispone de datos para comparar con otras alternativas de embeddings de la misma categoria (por ejemplo, otros encoders de sentence-similarity), ya que la informacion proporcionada no incluye resultados de rendimiento de terceros.

## Limitaciones y advertencias

- Las comprobaciones publicadas son verificaciones numericas de la conversion, no evaluaciones de calidad de recuperacion; no hay datos MTEB que respalden el rendimiento semantico de esta version cuantizada.
- La cuantizacion a 6 bits introduce un error numerico pequeno pero medible frente al checkpoint FP32; en tareas muy sensibles a la precision conviene validar el impacto.
- Cargar la funcionalidad multimodal requiere un build de Transformers que exponga `EmbeddingGemma2Processor`; la version estandar de PyPI (5.18.0) no lo expone, lo que puede limitar el uso de imagen, audio y video.
- No convertir el modelo a float16: puede degradar los resultados.
- Consultas y documentos deben usar la misma dimension de embedding al aplicar truncamiento Matryoshka.
- La informacion disponible no detalla sesgos conocidos, riesgos de alucinacion ni limitaciones de contexto o idioma mas alla de la etiqueta "multilingue".
- Todos los modelos de embeddings pueden heredar sesgos de sus datos de entrenamiento; no se aporta informacion especifica sobre este punto.
- Licencia Apache-2.0: permite uso comercial, con la condicion de preservar la licencia y la atribucion a Google.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlx-community/embeddinggemma-2-6bit
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Revision del modelo base usada en la conversion: https://huggingface.co/google/embeddinggemma-2/tree/914f7f89142e33e77833254d9c9b90c3cef7303b
- MLX-VLM (codigo de conversion y carga): https://github.com/Blaizzy/mlx-vlm/tree/3d87e88402f307efbf68e568971aa887ee7d9ed0
