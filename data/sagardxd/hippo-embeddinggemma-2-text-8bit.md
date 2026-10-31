# Sagardxd/hippo-embeddinggemma-2-text-8bit

## Resumen

Hippo EmbeddingGemma 2 text 8bit es un encoder de texto cuantizado a 8 bits en formato MLX, publicado por el usuario Sagardxd en HuggingFace. No es un modelo nuevo entrenado desde cero: se trata de una extraccion del componente de lenguaje (text encoder) del modelo base `mlx-community/embeddinggemma-2-8bit`, conservando unicamente los tensores `language_model.*` byte a byte, sin re-cuantizar ni re-entrenar. El resultado pesa unos 290 MB frente a los 1,2 GB del modelo completo, ya que se han eliminado los encoders de imagen, audio y video de la configuracion.

Su proposito es servir como motor de embeddings para busqueda semantica de memoria en Hippo Dash (consciousengines.com), una aplicacion que se ejecuta localmente en Mac mediante el framework MLX de Apple. Con 271.002.648 parametros y vectores de 768 dimensiones (con soporte Matryoshka a 512, 256 y 128), es adecuado para tareas de similitud de frases, recuperacion (RAG) y clustering en hardware de consumo, sin depender de la nube.

Su relevancia actual radica en la tendencia a ejecutar modelos de embeddings pequenos y eficientes en dispositivos locales: al reducir el tamano a un tercio del modelo original, facilita descargas rapidas y uso en portatiles Apple Silicon, manteniendo la calidad del modelo base de Google bajo licencia Gemma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de texto basado en EmbeddingGemma 2 (solo `language_model.*`) |
| Parametros totales | 271.002.648 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (heredada del modelo base, sin re-cuantizacion) |
| Idiomas soportados | no disponible |
| Licencia | Gemma (Gemma Terms of Use y Prohibited Use Policy) |
| Formato de pesos | safetensors (framework MLX) |

## Arquitectura y entrenamiento

El modelo es una derivacion directa de `mlx-community/embeddinggemma-2-8bit`, que a su vez es la version cuantizada a 8 bits en MLX de EmbeddingGemma 2 de Google. La modificacion realizada por el autor consiste en conservar unicamente los tensores del modelo de lenguaje, re-empaquetados en `model.safetensors`, y limpiar `config.json` eliminando las referencias a los encoders de imagen, audio y video. No hubo re-entrenamiento ni nueva cuantizacion: los pesos son identicos byte a byte a los del modelo base.

Sobre los datos de entrenamiento originales, el numero de tokens, la composicion del dataset y el proceso de post-entrenamiento del modelo base no estan detallados en la informacion disponible. La dimension de los embeddings de salida es de 768 flotantes, con soporte de truncamiento Matryoshka a 512, 256 y 128 dimensiones, lo que permite reducir almacenamiento e indice en funcion de las necesidades de precision de cada aplicacion.

## Capacidades

- Generacion de embeddings de texto para similitud semantica (pipeline `sentence-similarity`).
- Busqueda semantica por significado, orientada a la recuperacion de memoria en Hippo Dash.
- Embeddings Matryoshka: salida de 768 dimensiones truncable a 512, 256 o 128.
- Ejecucion local en Apple Silicon mediante MLX, sin servicios en la nube.
- No genera texto, no soporta tool calling, agentes ni capacidades multimodales (los encoders de imagen, audio y video fueron eliminados).

## Casos de uso

- Busqueda semantica local en Mac: al ser un encoder de solo 290 MB en MLX, puede indexar y consultar colecciones de documentos en un portatil Apple Silicon sin GPU dedicada ni llamadas a APIs externas.
- RAG on-device: genera los embeddings de los chunks de una base de conocimiento y los consulta en tiempo real desde una aplicacion de escritorio, manteniendo los datos en el dispositivo.
- Memoria semantica de aplicaciones: caso de uso declarado por el autor; Hippo Dash lo descarga para buscar recuerdos o notas del usuario por significado en lugar de por palabras clave.
- Deduplicacion y clustering de textos: los vectores de 768 (o 128 con Matryoshka) permiten agrupar mensajes, tickets o notas similares con coste de almacenamiento minimo.
- Clasificacion por similitud (zero-shot): comparando el embedding de una entrada con embeddings de etiquetas descriptivas se puede clasificar texto sin entrenar un clasificador.
- Deteccion de duplicados y near-duplicates en corpus: util en pipelines de limpieza de datos previos al fine-tuning, gracias a la rapidez de un modelo de 271 millones de parametros en MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no haberse re-entrenado ni re-cuantizado, la calidad de los embeddings deberia ser identica a la del modelo base `mlx-community/embeddinggemma-2-8bit`, cuyas metricas tampoco constan en la informacion proporcionada.

## Requisitos de hardware

- VRAM/memoria unificada estimada: unos 0,3 GB para los pesos (tamano del repo), mas overhead de runtime; asumible en cualquier Mac con Apple Silicon.
- GPU recomendadas: no requiere GPU dedicada; esta pensado para Apple Silicon via MLX (M1, M2, M3, M4). No hay informacion sobre ejecucion en CUDA u otras plataformas.
- Consumer hardware: cabe sobradamente en cualquier Mac de consumo; el uso en GPU NVIDIA no esta documentado para esta variante MLX.
- Opciones de despliegue: MLX (libreria nativa del modelo). Otras opciones como llama.cpp, Ollama, vLLM o TGI no estan documentadas para esta variante concreta; el modelo base original de Google puede tener rutas de despliegue adicionales.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Formato | Dimension de embedding | Licencia |
|---|---|---|---|---|---|
| Sagardxd/hippo-embeddinggemma-2-text-8bit | 271M (solo texto) | 8 bits | safetensors (MLX) | 768 (Matryoshka: 512/256/128) | Gemma |
| mlx-community/embeddinggemma-2-8bit (base) | no disponible (incluye encoders multimodales, ~1,2 GB) | 8 bits | safetensors (MLX) | 768 | Gemma |
| EmbeddingGemma 2 original (Google) | no disponible | sin cuantizar | no disponible | 768 | Gemma |

La ventaja diferencial de esta variante es el tamano (unos 290 MB frente a 1,2 GB) al eliminar los componentes multimodales, a costa de perder las capacidades de imagen, audio y video del modelo base.

## Limitaciones y advertencias

- Es un modelo de embeddings, no generativo: no produce texto ni razona; su salida son vectores numericos.
- Se han eliminado los encoders de imagen, audio y video: no es utilizable para tareas multimodales.
- Licencia Gemma: el uso esta sujeto a los Gemma Terms of Use y al Gemma Prohibited Use Policy de Google, que imponen restricciones sobre casos de uso prohibidos; conviene revisarlas antes de cualquier despliegue comercial.
- Datos del modelo base no documentados en esta ficha: longitud de contexto, idiomas soportados y benchmarks no estan disponibles en la informacion proporcionada; verificalos en la ficha del modelo base antes de usarlo en produccion.
- Riesgo de alucinacion: no aplicable como tal, pero la calidad de la busqueda semantica depende de la calidad del modelo base; no hay metricas publicadas en esta ficha para evaluarla.
- Repositorio comunitario con muy poca traccion (94 descargas y 1 like en el momento de los datos): carece de auditoria amplia; para produccion critica, considera usar el modelo base de mlx-community o la version oficial de Google.
- El repositorio parece orientado a la aplicacion Hippo Dash; su mantenimiento a largo plazo no esta garantizado.

## Enlaces

- Ficha del modelo: https://huggingface.co/Sagardxd/hippo-embeddinggemma-2-text-8bit
- Modelo base: https://huggingface.co/mlx-community/embeddinggemma-2-8bit
- Aplicacion Hippo Dash: https://consciousengines.com
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
