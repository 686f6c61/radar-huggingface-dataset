# nguyenminh04/omni-adapters

## Resumen

OmniRetriever-7B LoRA adapter es un adaptador PEFT publicado por el usuario nguyenminh04 como espejo del modelo original de YunzeLiu. Se trata de un adaptador LoRA de rango 16 y alpha 32 aplicado sobre las proyecciones `q/k/v_proj` del backbone WAVE-7B, que vive en el repositorio base `nguyenminh04/omni-model`. Su funcion no es generar texto, sino producir embeddings multimodales: un unico vector de 3584 dimensiones, normalizado en L2, por cada entrada, en un espacio latente compartido por texto, video, audio y sus combinaciones.

El modelo resuelve el problema de la recuperacion multimodal cruzada: permite comparar directamente una consulta textual con un clip de video, un fragmento de audio o una combinacion audio-video mediante similitud coseno. Esto lo hace util para tareas de retrieval, busqueda semantica sobre archivos multimedia y sistemas de recomendacion o indexacion que necesitan una representacion unificada de distintas modalidades.

Es relevante ahora porque la recuperacion multimodal sigue siendo un cuello de botella en pipelines de busqueda y analisis de contenido audiovisual, y este adaptador ofrece una via de bajo coste (790 MB de pesos) para convertir un backbone de 7B en un encoder multimodal unificado, con licencia Apache-2.0 y un paper asociado (arXiv 2605.26641).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre backbone transformer WAVE-7B |
| Parametros totales | no disponible (adaptador de 790 MB; backbone de 7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 en el ejemplo de uso) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT); backbone en formato propio del repositorio base |

## Arquitectura y entrenamiento

El adaptador es un LoRA con rango 16 y alpha 32 aplicado sobre las proyecciones de query, key y value del backbone WAVE-7B. Ademas, mediante `modules_to_save`, restaura los modulos `classify_linear`, `beats_ln` y `beats_proj`, que forman parte de la cabeza de fusion multimodal. La salida es un vector de 3584 dimensiones normalizado en L2, comun a todas las modalidades. La cabeza de fusion hace pooling sobre la ultima posicion, lo que implica que el padding en lotes corrompe las muestras mas cortas y obliga a usar `batch-size 1` en la extraccion por lotes.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. El autor indica que el adaptador es un espejo sin cambios del modelo original de YunzeLiu y remite al paper arXiv 2605.26641 para los detalles de entrenamiento. El backbone base ya viene parcheado con RoPE en el repositorio `omni-model`.

## Capacidades

- Extraccion de embeddings de texto mediante `encode_text`.
- Extraccion de embeddings de video mediante `encode_video`.
- Extraccion de embeddings de audio mediante `encode_audio`.
- Extraccion de embeddings conjuntos audio-video mediante `encode_av`.
- Extraccion de embeddings video-texto (video con caption) mediante `encode_tv`.
- Extraccion de embeddings audio-texto (audio con caption) mediante `encode_at`.
- Calculo de similitud coseno entre modalidades en un espacio latente compartido.
- Extraccion por lotes sobre un manifiesto JSONL mediante la CLI `omniretriever.cli extract`.
- No es un modelo generativo: no produce texto, codigo ni razonamiento.
- No se documenta soporte de tool calling, agentes ni modo thinking.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Busqueda semantica sobre archivos audiovisuales: indexar un catalogo de videos y audios con `encode_video` y `encode_audio`, y recuperar por consulta textual con `encode_text` mediante similitud coseno, gracias al espacio compartido de 3584 dimensiones.
- Deteccion de coincidencias audio-video: usar `encode_av` para representar la combinacion de pista de audio y video, y compararla con descripciones textuales para verificar si el contenido audiovisual coincide con una descripcion.
- Moderacion de contenido multimedia: generar embeddings de clips y compararlos contra un conjunto de referencia de contenido no deseado, aprovechando que el adaptador unifica modalidades en un mismo espacio.
- Etiquetado y anotacion asistida: dado un video con caption, calcular `encode_tv` y comparar con candidatos textuales para sugerir etiquetas o verificar la coherencia entre el caption y el contenido.
- Sistemas de recomendacion multimedia: representar items de video, audio y texto en un unico espacio vectorial para calcular afinidades entre usuarios y contenido de distinta naturaleza.
- Recuperacion aumentada (RAG) sobre archivos multimedia: indexar transcripciones, pistas de audio y fotogramas como vectores y recuperar los fragmentos relevantes para una consulta en lenguaje natural.
- Analisis de archivos de audio: buscar fragmentos de audio (por ejemplo, sonidos concretos como un perro ladrando) mediante consultas textuales con `encode_at` o `encode_audio`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador ocupa 790 MB en disco; el backbone WAVE-7B debe descargarse por separado y suma el grueso de los requisitos.
- VRAM estimada para inferencia en bfloat16: no disponible de forma explicita; un backbone de 7B en bfloat16 requiere del orden de 14 GB solo para pesos, mas memoria para activaciones.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano del backbone, cabria esperar GPU con al menos 16-24 GB de VRAM, pero el dato no esta confirmado.
- Compatibilidad con GPU de consumo: no confirmada; el ejemplo de uso emplea `device="cuda"` y `dtype="bfloat16"`.
- Opciones de despliegue: la libreria propia `omniretriever` (clase `OmniRetriever` y CLI `extract`); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La CLI recomienda `--batch-size 1`, lo que limita el throughput en extraccion por lotes.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria con datos verificables de parametros, contexto o rendimiento.

## Limitaciones y advertencias

- El modelo no es generativo: solo produce embeddings; no sirve para generacion de texto, codigo ni dialogos.
- La cabeza de fusion hace pooling sobre la ultima posicion, por lo que el padding en lotes corrompe las muestras cortas; es obligatorio usar `--batch-size 1` en la CLI.
- La similitud debe calcularse con `float()` antes de convertir a NumPy, ya que NumPy no soporta bfloat16.
- No hay informacion sobre sesgos, idiomas soportados ni composicion del dataset de entrenamiento, lo que dificulta evaluar riesgos de sesgo.
- Riesgo de alucinacion no aplica en sentido generativo, pero la calidad de los embeddings puede degradarse en dominios alejados de los datos de entrenamiento, dato no documentado.
- Longitud de contexto no disponible: se desconoce cuantos frames o muestras de audio puede procesar por entrada.
- El repositorio tiene 0 descargas y 0 likes, y es un espejo no oficial del modelo original; conviene verificar la integridad con el archivo SHA256SUMS incluido.
- Licencia Apache-2.0 permite uso comercial, pero el backbone base debe revisarse por separado para confirmar que comparte la misma licencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nguyenminh04/omni-adapters
- Modelo base: https://huggingface.co/nguyenminh04/omni-model
- Modelo original (upstream): https://huggingface.co/YunzeLiu/OmniRetriever-7B
- Paper: https://arxiv.org/abs/2605.26641
