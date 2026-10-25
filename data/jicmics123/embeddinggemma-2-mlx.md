# jicmics123/embeddinggemma-2-mlx

## Resumen

EmbeddingGemma 2 MLX es una conversión cuantizada del modelo de embeddings `google/embeddinggemma-2` de Google, publicada por el usuario jicmics123 para su uso en la aplicación Einso (https://einso.app). No es un modelo generativo: es un extractor de características (`feature-extraction`) que convierte texto e imágenes en vectores de 768 dimensiones, pensado para búsqueda semántica y recuperación en local. La versión original es de Google y se distribuye bajo Apache 2.0; esta copia mantiene la misma licencia.

El cambio principal respecto al original es la eliminación de la torre de audio y la cuantización afín de MLX (group size 64): las capas lineales de texto y visión quedan a 6 bits y la tabla de embeddings de palabras a 4 bits, mientras que las normas y tensores pequeños conservan el bfloat16 original. El resultado es un fichero de pesos de 341 MB frente a los 878 MB del original sin audio y los 1,49 GB con audio.

El modelo declarado tiene 394.021.229 parámetros y el repositorio ocupa 0,4 GB. Es relevante ahora porque permite ejecutar búsqueda multimodal (texto e imagen) en dispositivo con un pico de memoria de aproximadamente 0,6 GB en un Mac para un batch, sin depender de infraestructura en la nube. La model card no detalla la longitud de contexto ni los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EmbeddingGemma 2 de Google: torres de texto y visión para generación de embeddings (torre de audio eliminada en esta copia); detalles de capas no disponibles |
| Parametros totales | 394.021.229 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantización afín de MLX, group size 64, con escalas y sesgos junto a cada peso: capas lineales de texto y visión a 6 bits, tabla de embeddings de palabras a 4 bits; normas y tensores pequeños en bfloat16 |
| Idiomas soportados | no disponible (la evaluación incluye una consulta en español, pero la model card no lista idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors para MLX (`library_name: mlx`); fichero de pesos de 341 MB |

Otros datos: dimensión de salida 768, pooling por media y normalización L2. Prefijos recomendados: `task: search result | query: ` para consultas y `title: none | text: ` para documentos.

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna más allá de que se trata de EmbeddingGemma 2 de Google con dos torres activas (texto y visión) y una torre de audio (`audio_tower.*`, `embed_audio.*`) que fue eliminada en esta copia. Tampoco se detallan el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; esos datos corresponden al modelo base de Google y no se incluyen en la model card de esta conversión.

En cuanto a la modificación técnica, el autor aplica cuantización afín de MLX con group size 64, almacenando escalas y sesgos junto a cada peso. Las capas lineales de las torres de texto y visión se cuantizan a 6 bits y la tabla de embeddings de palabras a 4 bits, dejando normas y tensores pequeños en bfloat16. El `config.json` es el de Google con una entrada `quantization` añadida y el tokenizer es el original sin cambios. Los bits efectivos de cada capa pueden deducirse de las formas de sus pesos y escalas.

## Capacidades

- Generación de embeddings de texto: vectores de 768 dimensiones, con pooling por media y normalización L2.
- Embeddings de imagen: la torre de visión se mantiene intacta en estructura y cuantizada a 6 bits en sus capas lineales.
- Búsqueda multimodal: consultas de texto contra documentos e imágenes en un mismo espacio vectorial.
- Recuperación con prefijos de tarea: `task: search result | query: ` para consultas y `title: none | text: ` para documentos.
- Ejecución en dispositivo con MLX sobre Apple Silicon, con pico de memoria de aproximadamente 0,6 GB por batch.
- No soporta audio: la torre de audio fue eliminada de esta copia.
- No es un modelo generativo: no produce texto, no hace tool calling ni razonamiento multi-paso por sí mismo; su función es `feature-extraction`.
- Idiomas: no disponible en la información proporcionada.

## Casos de uso

- Búsqueda semántica local en aplicaciones de escritorio o móviles Apple: indexar notas del usuario y resolver consultas en el dispositivo con 0,6 GB de pico de memoria, sin enviar datos a un servidor. Es el escenario para el que se creó esta copia (app Einso).
- Búsqueda de fotos por descripción textual: al conservar la torre de visión, permite indexar imágenes y recuperarlas con consultas de texto, con una similitud coseno de 0,992 en el peor caso frente al modelo en bfloat16 según la evaluación del autor.
- RAG ligero en local para asistentes personales: generar embeddings de fragmentos de documentación y recuperar contexto antes de pasarlo a un LLM generativo, manteniendo el pipeline completamente offline.
- Deduplicación y agrupación de contenido: calcular embeddings de un corpus de notas o artículos y agrupar por similitud para eliminar duplicados o construir clusters temáticos.
- Búsqueda de notas de tablero y apuntes (board-style notes): la evaluación del autor se hizo sobre 40 notas de este tipo, con recuperación idéntica al original en 24 de 24 preguntas y 97% de coincidencia en el top-3.
- Filtrado y recomendación de contenido: comparar embeddings de elementos candidatos contra el perfil vectorial del usuario para ordenar resultados, con un coste de inferencia bajo.
- Prototipado rápido en Mac: validar una arquitectura de búsqueda semántica con MLX antes de migrar a un despliegue en servidor, usando pesos de 341 MB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card incluye únicamente una comparación de fidelidad frente a los pesos bfloat16 de Google:

| Metrica | Resultado |
|---|---|
| Similitud coseno de vectores, notas (40 notas de tablero) | 0,998 de media; 0,996 en el peor caso |
| Similitud coseno de vectores, preguntas (24 consultas, una en español) | 0,999 de media; 0,998 en el peor caso |
| Similitud coseno de vectores, fotos (5 imágenes) | 0,992 en el peor caso |
| Mismo mejor resultado | 24 de 24 preguntas |
| Resultados del top-3 compartidos | 97% |
| Tamano del fichero de pesos | 341 MB (frente a 878 MB sin audio y 1,49 GB con audio) |
| Pico de memoria en un Mac, un batch | aproximadamente 0,6 GB (frente a 1,2 GB) |

Se trata de una evaluación interna y reducida (40 notas, 24 preguntas, 5 fotos), no de un conjunto de benchmarks públicos.

## Requisitos de hardware

- VRAM/memoria estimada: aproximadamente 0,6 GB de pico en un Mac para un batch, según la medición del autor; el fichero de pesos ocupa 341 MB.
- Cabe en hardware de consumo: sí, en cualquier Mac con Apple Silicon, al estar el formato ligado a MLX. No se proporcionan datos para GPU NVIDIA o AMD.
- GPU recomendadas: no disponible; el formato MLX está orientado a Apple Silicon (memoria unificada). Para CUDA habría que convertir los pesos a otro runtime, algo que la model card no documenta.
- Opciones de despliegue: la librería MLX (`library_name: mlx`). No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles; solo se documenta el pico de memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension de salida | Modalidades | Licencia | Pesos |
|---|---|---|---|---|---|---|
| jicmics123/embeddinggemma-2-mlx (esta ficha) | 394.021.229 | no disponible | 768 | Texto e imagen (sin audio) | Apache 2.0 | 341 MB, safetensors MLX, 6/4 bits |
| google/embeddinggemma-2 (base) | no disponible | no disponible | 768 | Texto, imagen y audio | Apache 2.0 | 878 MB sin audio; 1,49 GB completo, bfloat16 |
| Otros modelos de embeddings de tamano similar (familias BGE, E5, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite comparar con el modelo base. No hay datos de benchmarks ni de especificaciones de alternativas de la misma categoría, por lo que la comparación con otras familias queda como no disponible.

## Limitaciones y advertencias

- La torre de audio fue eliminada: esta copia no puede generar embeddings de audio, a diferencia del modelo completo de Google.
- La cuantización es una aproximación: se observa una similitud coseno mínima de 0,992 (imágenes) y 0,996 (notas) frente al modelo en bfloat16, no una equivalencia exacta.
- La tabla de embeddings de palabras está a 4 bits, el nivel más agresivo de la conversión; puede afectar a términos poco frecuentes o a vocabulario específico de dominio.
- Evaluación muy reducida: 40 notas, 24 preguntas y 5 fotos, sin conjunto de test público ni repetición por terceros. No hay garantía de que el comportamiento se mantenga en otros dominios.
- Idiomas y longitud de contexto no documentados: se desconoce el comportamiento real en textos largos o en idiomas distintos del inglés (solo una consulta en español en la evaluación).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación de la comunidad.
- Formato ligado a MLX: requiere Apple Silicon para su uso directo; no se documenta una ruta de conversión a GGUF u otros runtimes.
- Licencia Apache 2.0: permite uso comercial, pero obliga a conservar el fichero `LICENSE` y a mantener la atribución a Google como autor del modelo original.
- Al ser un modelo de embeddings, no genera texto: no debe usarse como sustituto de un LLM en tareas de generación, razonamiento o tool calling.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jicmics123/embeddinggemma-2-mlx
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Aplicación Einso: https://einso.app
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0

No se han encontrado en la búsqueda web enlaces relevantes al modelo: los resultados devueltos corresponden a páginas de Facebook y no guardan relación con esta ficha.
