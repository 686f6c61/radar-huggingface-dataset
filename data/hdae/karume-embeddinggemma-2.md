# hdae/karume-embeddinggemma-2

## Resumen

Karume EmbeddingGemma 2 es una conversión no oficial del modelo multimodal de embeddings `google/embeddinggemma-2` al formato de contenedor `.krm` del runtime de inferencia WebGPU Karume. El autor de la conversión es el usuario `hdae`, sin afiliación ni respaldo de Google. El modelo original es un encoder de Google que produce embeddings unificados para texto, imagen y audio, entrenado con Matryoshka Representation Learning, lo que permite truncar el vector de salida a 512, 256 o 128 dimensiones manteniendo la coherencia semántica.

La relevancia de esta distribución radica en que traslada las tres torres (texto, visión y audio) del modelo original a un formato ejecutable directamente en navegador y en Deno mediante WebGPU, sin necesidad de backend Python. Incluye tokenizador y prompts junto a los pesos, y soporta cuantización bf16 e int8. La ventana de entrada es de hasta 8192 tokens para texto, hasta 280 soft tokens por imagen y hasta 750 soft tokens de audio (30 segundos a 16 kHz).

El repositorio ocupa 2,3 GB y se publica bajo licencia Apache 2.0, heredada del modelo base. No se han realizado reentrenamientos ni ajustes finos: la conversión preserva los pesos del checkpoint original y añade una copia cuantizada a int8.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder multimodal (torres de texto, visión y audio) reexpresado como grafos en contenedor Karume; transformer con atención de ventana deslizante en la torre de texto y atención local de 12 claves en la de audio |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 8192 tokens (texto, incluyendo `<bos>` y `<eos>`); imagen: hasta 280 soft tokens; audio: hasta 750 soft tokens (30 s a 16 kHz) |
| Tipos de cuantización | bf16 e int8 (escalas f32 por fila); cómputo siempre en f32 sobre pesos bf16 o int8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Contenedor Karume `.krm` (secuencia de partes; la primera contiene el grafo y los descriptores del modelo); manifiesto `karume.json` (versión `karume/6`) |

Dimensiones adicionales relevantes: vector de salida de 768 valores, truncable a 512, 256 o 128 por Matryoshka Representation Learning, siempre renormalizado a longitud unitaria.

## Arquitectura y entrenamiento

El modelo base `google/embeddinggemma-2` es un encoder multimodal que produce un único espacio de embeddings para texto, imagen y audio. Esta conversión no altera los pesos: la torre de texto se extrae y se reexpresa como un grafo único que incluye el mean pooling y la normalización L2, con la máscara de atención de ventana deslizante declarada como banda sobre la atención y aplicada desde las posiciones de los tokens. La torre de visión se reexpresa como un segundo grafo que lee los parches reales de la imagen, agrupa los parches de un soft token en paralelo y pliega el rotary embedding bidimensional en tablas indexadas por posición de parche. La torre de audio se convierte en un grafo propio que procesa los fotogramas log-mel (calculados en el host) con su máscara de fotogramas y atención local sobre una ventana de 12 claves por consulta.

No hubo reentrenamiento ni ajuste fino. En bf16 los pesos conservan los valores del checkpoint; en int8 se redondean a entero las tablas de tokens y las capas lineales (y las convoluciones depthwise en audio) con una escala f32 por fila, mientras las normas y constantes permanecen en f32. En la torre de audio, las dos convoluciones de subsampling mantienen sus valores bf16 incluso en int8, porque el redondeo desplazaba soft tokens aislados de voz lejos del original. El modelo original indica ejecutar en bfloat16 o float32, nunca float16, ya que sus activaciones exceden el rango de float16 y producen NaN o embeddings degradados; todos los presets de este repositorio computan en f32 sobre los pesos almacenados. El exportador utilizado es `karume/0.24.0`.

## Capacidades

- Generación de embeddings de texto con ventana de hasta 8192 tokens, sin truncado: las entradas más largas se rechazan.
- Embeddings de imagen: acepta píxeles RGB8 decodificados de cualquier tamaño, reescalados preservando la relación de aspecto, hasta 280 soft tokens (256 en imágenes cuadradas).
- Embeddings de audio: acepta muestras mono f32 a 16 kHz, un soft token por cada 40 ms, hasta 30 segundos; audios más largos o con otra frecuencia de muestreo se rechazan sin remuestreo.
- Mezcla arbitraria de partes de texto, imagen y audio en una misma entrada, en el orden proporcionado.
- Vectores de salida de 768 dimensiones, truncables a 512, 256 o 128 mediante Matryoshka Representation Learning, con renormalización a longitud unitaria.
- Similitud semántica de frases (`sentence-similarity`) y extracción de características (`feature-extraction`).
- Tokenizador y prompts incluidos en los pesos: `embed()` antepone el prefijo del prompt indicado y tokeniza en el host, calculando también los fotogramas log-mel del audio.
- Ejecución en navegador y en Deno mediante WebGPU, sin backend Python.
- No soporta vídeo: el vídeo no puede embeberse. Se rechaza cualquier texto que contenga el token placeholder de imagen, audio o vídeo.

## Casos de uso

- Búsqueda semántica en aplicaciones web sin backend: al ejecutarse en navegador con WebGPU, permite indexar y consultar documentos en el cliente, eliminando el coste de servidor y la latencia de red en búsquedas sobre corpus locales.
- Búsqueda multimodal unificada: indexar imágenes y texto en un mismo espacio vectorial permite consultas del tipo "buscar fotos que coincidan con esta descripción" sin necesidad de pipelines separados por modalidad.
- Deduplicación y clustering de contenido: los embeddings truncados a 128 o 256 dimensiones reducen el coste de almacenamiento y de comparación en grandes colecciones, manteniendo la coherencia semántica gracias a Matryoshka.
- Sistemas de recomendación basados en contenido: representar ítems de texto, imagen y audio en un espacio común facilita la similitud entre ítems de distinta naturaleza, por ejemplo episodios de pódcast frente a sus descripciones escritas.
- Moderación y clasificación de contenido: la combinación de modalidades permite detectar similitud entre material textual y audiovisual sospechoso, con inferencia local que evita enviar contenido sensible a servicios externos.
- Aplicaciones de accesibilidad: transcripción semántica de audio (hasta 30 s por fragmento) y su emparejamiento con texto o imágenes para generar descripciones o índices navegables.
- Prototipado rápido en Deno: al distribuirse como contenedor Karume con tokenizador y prompts incluidos, permite montar un servicio de embeddings en Deno sin dependencias de Python ni de infraestructura GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de esta conversión remite a la documentación del modelo original (`google/embeddinggemma-2`) para capacidades, limitaciones, usos previstos, evaluaciones y guía de seguridad, y no reproduce métricas propias.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repositorio completo ocupa 2,3 GB, incluyendo las torres de texto, visión y audio en los presets disponibles; un pipeline sin `vision: true` o sin `audio: true` no descarga esas torres, reduciendo el peso.
- GPU recomendadas: no disponible. El runtime objetivo es WebGPU, por lo que se ejecuta sobre la GPU expuesta por el navegador o Deno; no se especifican modelos de GPU concretos.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; depende de la implementación WebGPU del navegador o del entorno Deno y de la VRAM disponible para el contexto WebGPU.
- Opciones de despliegue: exclusivamente el runtime Karume (navegador y Deno) mediante un pipeline que implemente `embeddinggemma/1`. No es legible por transformers ni sentence-transformers, al usar un contenedor distinto con grafo embebido.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| hdae/karume-embeddinggemma-2 | no disponible | 8192 tokens (texto); 280 soft tokens (imagen); 750 soft tokens (audio) | Texto, imagen, audio | Apache 2.0 | Contenedor Karume `.krm`, WebGPU (navegador, Deno) |
| google/embeddinggemma-2 | no disponible | 8192 tokens (texto) | Texto, imagen, audio | Apache 2.0 | Checkpoint original (transformers / sentence-transformers) |
| Alternativas de embeddings de texto de tamaño comparable | no disponible | no disponible | Texto | no disponible | no disponible |

La comparación relevante es con el modelo original: esta distribución no modifica pesos ni añade capacidades, y su diferencia principal es el formato de ejecución (WebGPU en navegador y Deno) y la cuantización int8 añadida. No se dispone de datos de benchmarks propios para comparar el rendimiento frente a otras alternativas.

## Limitaciones y advertencias

- Conversión no oficial: no está afiliada ni respaldada por Google; el autor recomienda leer la model card de `google/embeddinggemma-2` antes de usar el modelo.
- No es legible por transformers ni sentence-transformers; requiere un pipeline Karume que implemente `embeddinggemma/1`.
- El texto de entrada superior a 8192 tokens se rechaza, nunca se trunca; lo mismo ocurre con audio de más de 30 segundos o con frecuencia distinta de 16 kHz, que se rechaza sin remuestreo.
- No soporta vídeo, y se rechaza cualquier texto que contenga el token placeholder de imagen, audio o vídeo.
- Precisión: no debe ejecutarse en float16, ya que las activaciones exceden su rango y producen NaN o embeddings degradados; todos los presets computan en f32 sobre pesos bf16 o int8.
- La cuantización int8 introduce error de redondeo en las capas lineales y en las convoluciones depthwise de audio; las dos convoluciones de subsampling de audio se mantienen en bf16 precisamente para evitar desviaciones en soft tokens de voz.
- Sesgos conocidos, riesgo de alucinación y limitaciones idiomáticas: no documentados en la información disponible; deben consultarse en la model card del modelo original.
- Uso comercial: la licencia Apache 2.0 lo permite, pero el modelo original exige adherirse a la Gemma Prohibited Use Policy en los despliegues, según se recoge en la sección "Ethics & Safety" de su model card.
- Idiomas soportados: no disponibles en la información proporcionada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/hdae/karume-embeddinggemma-2
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Texto completo de la licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/
