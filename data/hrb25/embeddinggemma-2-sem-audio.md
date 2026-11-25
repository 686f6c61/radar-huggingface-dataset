# HRB25/embeddinggemma-2-sem-audio

## Resumen

EmbeddingGemma 2 sem encoder de áudio es una variante podada del modelo multimodal de embeddings `google/embeddinggemma-2` de Google DeepMind, publicada por el usuario HRB25. Se trata del mismo checkpoint original al que se le han eliminado todos los tensores del codificador de audio (`audio_tower.*` y `embed_audio.*`), reduciendo el total de parámetros de 744,37 M a 438,76 M y el fichero de pesos de 1,49 GB a 878 MB. Los pesos de texto e imagen/vídeo son idénticos a los del modelo base, sin reentrenamiento ni ajuste fino.

El modelo proyecta texto (incluido código), imágenes y vídeo a un único espacio vectorial de 768 dimensiones, con soporte de Matryoshka Representation Learning (MRL) para truncar a 512, 256 y 128 dimensiones. Su ventana de contexto es de 8192 tokens y aplica pooling por media seguido de normalización L2. Está pensado para tareas de recuperación, similitud semántica, clustering y clasificación sobre corpus multimodales donde el audio no es relevante.

La relevancia de esta variante es puramente operativa: elimina 305,6 M de parámetros y unos 611 MB de pesos que un pipeline de solo texto e imagen no necesita, manteniendo equivalencia numérica con el original (similitud de coseno de 1,0000 y diferencia máxima absoluta de 1,9e-6 por dimensión en la verificación del autor). No aporta capacidades nuevas respecto al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de embeddings (texto + visión), derivado de EmbeddingGemma 2; sin torre de audio |
| Parametros totales | 438.760.472 (438,76 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | más de 100, incluido portugués (etiquetas: multilingual, pt, pt-br) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16), compatible con transformers y sentence-transformers |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del EmbeddingGemma 2 original: un modelo de lenguaje (`language_model.*`, 624 tensores en total junto con la parte visual) más una torre de visión (`vision_tower.*`) y una proyección al espacio de embeddings (`embed_vision.*`). La salida es un vector de 768 dimensiones obtenido mediante pooling por media y normalización L2, con dimensiones reducibles a 512, 256 y 128 mediante MRL. Se han eliminado 752 tensores correspondientes a 12 capas del codificador de audio (`audio_tower.layers.0` a `audio_tower.layers.11`), la proyección de salida de audio (1024 a 1536), la submuestreo convolucional y la proyección `embed_audio.embedding_projection.weight`.

No hay entrenamiento ni ajuste fino en este repositorio: es una poda estructural del checkpoint `google/embeddinggemma-2`. Los detalles de datos de entrenamiento, número de tokens, composición del dataset y si hubo RLHF/DPO no están disponibles en la información proporcionada; remiten a la model card del modelo base. La innovación técnica destacable es la propia poda selectiva de tensores manteniendo la paridad numérica con el original, verificada con similitud de coseno de 1,0000 en cinco frases en portugués de Brasil y en una imagen de prueba.

## Capacidades

- Generación de embeddings de texto, incluido código, para recuperación y similitud semántica.
- Embeddings de imagen (`image-feature-extraction`) y de vídeo (`video-feature-extraction`) en el mismo espacio vectorial de 768 dimensiones.
- Soporte de prefijos de tarea (`SearchQuery`, `Document`, `SentenceSimilarity`, `Clustering` y otros) heredados del modelo base, aplicables solo a texto.
- Embeddings truncables a 512, 256 y 128 dimensiones mediante MRL con `truncate_dim` y `normalize_embeddings=True`.
- Capacidad multilingüe en más de 100 idiomas, con etiquetas específicas para portugués y portugués de Brasil.
- Carga mediante `sentence-transformers` y mediante `transformers.AutoModel` (`EmbeddingGemma2Model`) sin tensores faltantes ni sobrantes.
- No acepta entrada de audio: `config.json` carece de `audio_config` y `modules.json`/`sentence_bert_config.json` no listan la modalidad de audio. Los tokens especiales de audio permanecen en el tokenizador para conservar el vocabulario original.
- No es un modelo generativo: es un extractor de características (`feature-extraction`); no soporta tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Búsqueda semántica multilingüe: indexar un corpus documental en más de 100 idiomas y recuperar con prefijos `SearchQuery`/`Document`, aprovechando la ventana de 8192 tokens para pasajes largos sin trocear en exceso.
- Búsqueda visual y de vídeo: generar embeddings de imágenes y fotogramas de vídeo en el mismo espacio que las consultas textuales, habilitando recuperación texto-a-imagen y texto-a-vídeo en catálogos o archivos multimedia.
- Deduplicación y clustering de contenidos: agrupar noticias, tickets o publicaciones similares usando `prompt_name="Clustering"` y vectores truncados a 256 o 128 dimensiones para reducir el coste de almacenamiento y de distancia.
- Sistemas RAG de bajo coste: sustituir el modelo completo de 744 M por esta variante de 439 M cuando el pipeline solo procesa texto e imágenes, ahorrando unos 611 MB de pesos y memoria en el servicio de indexación.
- Clasificación y enrutamiento de tickets: calcular similitud entre un ticket entrante y prototipos de categoría con `SentenceSimilarity`, con latencia menor al cargar menos parámetros.
- Filtrado de contenido y moderación: comparar embeddings de texto e imagen contra conjuntos de referencia para detectar duplicados o contenido próximo a patrones conocidos.
- Evaluación de calidad de traducciones o paráfrasis: medir similitud semántica entre pares de frases en portugués y otros idiomas con embeddings normalizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta una verificación de equivalencia con el modelo base: similitud de coseno de 1,0000 en cinco frases en portugués de Brasil y en una imagen de prueba, con diferencia máxima absoluta de 1,9e-6 por dimensión en float32 sobre CPU. Para benchmarks de arquitectura, recuperación y datos de entrenamiento, la información remite a la model card de `google/embeddinggemma-2`.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, los 877,6 MB de pesos requieren aproximadamente 0,9 GB; con overhead de activaciones y del codificador visual, un entorno de 2 a 4 GB de VRAM es suficiente para lotes moderados.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060/4060, RTX 4090, A100 y H100 son válidas. El modelo es pequeño y no requiere GPUs de datacenter.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer modernas, e incluso en CPU para lotes pequeños (la verificación del autor se ejecutó en CPU en float32).
- Opciones de despliegue: `sentence-transformers`, `transformers` (`AutoModel`/`EmbeddingGemma2Model`) y `torchvision` para la parte visual. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponible.
- Nota de acceso: el repositorio figura como privado según la model card; es necesario `hf auth login` con una cuenta con acceso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HRB25/embeddinggemma-2-sem-audio | 438,76 M | 8192 tokens | texto, imagen, vídeo | Apache 2.0 | repo privado según model card |
| google/embeddinggemma-2 | 744,37 M | 8192 tokens | texto, imagen, vídeo, audio | Apache 2.0 | público en Hugging Face |
| Alternativas de embeddings de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación con datos verificables es frente al modelo base: esta variante reduce un 41,0 % los parámetros (de 744,37 M a 438,76 M) y un 41,1 % el tamaño del fichero (de 1.488.915.288 a 877.599.816 bytes), a cambio de perder la modalidad de audio, manteniendo equivalencia numérica en texto e imagen.

## Limitaciones y advertencias

- No acepta audio: es la limitación principal y define el propósito del repositorio. Cualquier caso de uso que requiera embeddings de audio debe usar el modelo base.
- No es un modelo generativo: no produce texto, no razona, no hace tool calling ni soporta agentes; solo genera embeddings.
- Repositorio privado: la model card indica que es necesario autenticarse con una cuenta con acceso, lo que limita su uso directo en producción sin gestionar credenciales.
- Sin datos propios de entrenamiento ni benchmarks: hereda íntegramente el comportamiento del modelo base, incluidos sus sesgos y su riesgo de representaciones degradadas en dominios poco cubiertos; esos riesgos no se documentan en esta ficha por falta de información.
- Los prefijos de tarea solo aplican a texto; su uso con entradas visuales no está documentado.
- El truncado MRL a 512, 256 o 128 dimensiones reduce la calidad de forma no cuantificada en la información disponible; conviene validarlo en el dominio concreto antes de desplegarlo.
- Los tokens especiales de audio permanecen en el tokenizador aunque el modelo no procese audio; pueden aparecer en tokenizaciones si no se filtran.
- Licencia Apache 2.0, la misma del modelo base: permite uso comercial, pero conviene revisar los términos del modelo original por si hubiera condiciones adicionales no reflejadas aquí.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HRB25/embeddinggemma-2-sem-audio
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Paper referenciado en las etiquetas: arxiv:2610.37364 (https://arxiv.org/abs/2610.37364)
