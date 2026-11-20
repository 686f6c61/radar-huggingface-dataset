# csipapicsa/songselector-clap-ms

## Resumen

SongSelector CLAP MS es una exportación a ONNX del modelo Microsoft CLAP 2023 (msclap), un sistema de representaciones de audio de propósito general entrenado con supervisión en lenguaje natural. Lo publica el usuario csipapicsa como componente de inferencia de su aplicación SongSelector, y su función concreta es doble: un codificador de audio que convierte cada pista musical en un vector de 1024 dimensiones y un codificador de texto que proyecta una descripción escrita (por ejemplo, "dark rolling techno") en ese mismo espacio latente. La similitud coseno entre ambos vectores permite recuperar las pistas más afines a la descripción.

El modelo no es un generador de texto ni un LLM: es un extractor de características multimodal (audio-texto) con pipeline `feature-extraction`. La relevancia práctica está en que elimina la dependencia de PyTorch en producción: los dos grafos ONNX (opset 17) se ejecutan con onnxruntime en cualquier plataforma, con un tamaño conjunto de aproximadamente 0,6 GB, y la aplicación los descarga y verifica por SHA-256 de forma automática.

La arquitectura subyacente es CLAP (Contrastive Language-Audio Pretraining), descrita en el artículo arXiv:2309.05767 de Elizalde, Deshmukh y Wang (2023). El repositorio no documenta el número de parámetros ni la composición exacta del dataset de entrenamiento; solo se indica el modelo base (`microsoft/msclap`) y la versión de la librería usada para la exportación (msclap 1.3.4).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLAP (Contrastive Language-Audio Pretraining): codificador de audio + codificador de texto en espacio compartido; exportado a ONNX (opset 17) |
| Parametros totales | no disponible (el repo no los declara; el tamaño de los ficheros ONNX es de 126.555.913 bytes para audio y 505.456.227 bytes para texto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica como contexto generativo; entrada de audio fija de 308.700 muestras (7 s a 44,1 kHz mono) y entrada de texto fija de 77 tokens |
| Tipos de cuantizacion | no disponible (los ficheros publicados son grafos ONNX en float32; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (el codificador de texto usa tokenizador GPT-2; el modelo card no declara lista de idiomas) |
| Licencia | Microsoft Public License (Ms-PL) |
| Formato de pesos | ONNX (`clap-ms-audio.onnx`, `clap-ms-text.onnx`) + tokenizador JSON (`clap-ms-tokenizer.json`) |

## Arquitectura y entrenamiento

CLAP es un modelo contrastivo de dos torres: un codificador de audio y un codificador de texto entrenados conjuntamente para alinear pares (audio, descripción textual) en un espacio embedding común. En esta exportación, el codificador de audio acepta un tensor float32 de forma `(batch, 308700)` —7 segundos de audio mono a 44,1 kHz— y devuelve `(batch, 1024)`; el codificador de texto acepta `input_ids` y `attention_mask` int64 de forma `(batch, 77)` y devuelve también `(batch, 1024)`. La recuperación se hace por similitud coseno entre embeddings.

El preprocesado de texto replica el de msclap: se usa un tokenizador GPT-2 (formato `tokenizers`), se añade el token `' <|endoftext|>'` al final, y los ids se truncan a 77 o se rellenan con id 0, con `attention_mask` a 0 en el relleno. La conversión se realizó con el script `scripts/export_clap_onnx.py --models ms` del repositorio SongSelector, usando msclap 1.3.4, y el script valida ambos codificadores contra el modelo PyTorch original antes de escribir los ficheros. No se documentan en el repositorio el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF/DPO (no aplica en un modelo contrastivo de este tipo).

## Capacidades

- Extracción de embeddings de audio: convierte un fragmento de 7 s de audio mono a 44,1 kHz en un vector float32 de 1024 dimensiones.
- Extracción de embeddings de texto: convierte una descripción escrita (hasta 77 tokens) en un vector de 1024 dimensiones en el mismo espacio.
- Recuperación texto-a-audio: ranking de pistas musicales por similitud coseno frente a una consulta en lenguaje natural.
- Búsqueda semántica de música por descripción libre ("dark rolling techno"), sin etiquetas manuales de género o estado de ánimo.
- Ejecución portable vía onnxruntime (opset 17), sin dependencia de PyTorch ni de GPU dedicada.
- Verificación de integridad: los ficheros se validan por SHA-256 antes de su uso en la aplicación.
- No soporta generación de texto, tool calling, agentes, visión, audio generativo ni modo thinking; es exclusivamente un extractor de características.

## Casos de uso

- Organización automática de bibliotecas musicales: indexar cada pista con el codificador de audio y agrupar o etiquetar por similitud vectorial, sustituyendo la clasificación manual por género o mood.
- Búsqueda por lenguaje natural en un reproductor o catálogo: el usuario escribe una descripción y el sistema devuelve las pistas cuyo embedding de audio tiene mayor similitud coseno con el embedding de texto.
- Generación de playlists temáticas: a partir de una consulta textual, seleccionar un conjunto coherente de pistas y ordenarlas por afinidad semántica.
- Sistemas de recomendación por contenido: usar los embeddings de 1024 dimensiones como features en un motor de recomendación o en un índice vectorial (FAISS, Qdrant, etc.).
- Sincronización música-imagen en producción audiovisual: describir el tono deseado de una escena ("tenso, orquestal, lento") y recuperar candidatos del catálogo sin escucha manual.
- Deduplicación y detección de similitud entre pistas: comparar embeddings de audio para identificar versiones, remixes o samples cercanos.
- Despliegue en aplicaciones de escritorio o móviles: al ser ONNX con onnxruntime, se integra en entornos sin stack de deep learning completo, con descarga y verificación automática de los pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de recuperación (R@1, R@5, mAP) ni comparaciones cuantitativas con el modelo PyTorch original más allá de la verificación funcional de equivalencia durante la exportación.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; por el tamaño de los grafos (≈0,6 GB en total) la inferencia en float32 requiere del orden de 1-2 GB de memoria, aunque esta cifra es una estimación y no un dato publicado.
- GPU recomendadas: no documentadas. Cualquier GPU con soporte de onnxruntime (CUDA o TensorRT) puede ejecutar los grafos; no se especifican modelos concretos como A100, H100 o RTX 4090.
- GPU de consumo: por el reducido tamaño de los grafos, es previsible que quepa en GPUs de consumo, pero no se aporta una lista validada.
- Despliegue: onnxruntime (CPU o GPU); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de extracción de características.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Embedding | Entrada audio | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| SongSelector CLAP MS (este) | CLAP exportado a ONNX | 1024 | 7 s @ 44,1 kHz mono | Ms-PL | ONNX + tokenizador JSON | Hugging Face (csipapicsa) |
| microsoft/msclap | CLAP original en PyTorch | 1024 | según configuración de msclap | Ms-PL | PyTorch | Hugging Face (microsoft) |
| Otros modelos audio-texto (LAION-CLAP, etc.) | CLAP alternativos | no disponible en esta ficha | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es con el modelo base `microsoft/msclap`: mismo espacio embedding y misma licencia, con la diferencia de que esta versión está exportada a ONNX y fija las formas de entrada (7 s de audio, 77 tokens de texto). Para el resto de alternativas de la categoría no se dispone de datos verificados en la información proporcionada.

## Limitaciones y advertencias

- Ventana de audio fija de 7 segundos: las pistas más largas deben fragmentarse o muestrearse, lo que puede perder información global de la canción.
- Ventana de texto fija de 77 tokens: descripciones largas se truncan, con posible pérdida de matices.
- No es un modelo generativo: no produce texto, etiquetas ni explicaciones, solo vectores; cualquier clasificación o ranking debe construirse encima.
- Riesgo de sesgo: al derivar de CLAP entrenado con datos no documentados en este repositorio, pueden existir sesgos culturales o de género musical en la recuperación; no se detalla la composición del dataset original.
- Idiomas: no se declara lista de idiomas soportados; el tokenizador GPT-2 favorece el inglés y el rendimiento en castellano no está verificado.
- Licencia Ms-PL: permite uso comercial y modificación, pero exige conservar el aviso de licencia y no concede garantías; conviene revisar las condiciones de la licencia del modelo base `microsoft/msclap`.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en producción ni de validación por terceros; la verificación de equivalencia con PyTorch la realizó el propio autor.
- Sin benchmarks publicados: no se puede afirmar su precisión de recuperación frente al original ni frente a alternativas.
- Los ficheros se distribuyen sin garantía ("No warranty") según la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/csipapicsa/songselector-clap-ms
- Modelo base: https://huggingface.co/microsoft/msclap
- Repositorio SongSelector: https://github.com/csipapicsa/SongSelector
- Script de exportación: https://github.com/csipapicsa/SongSelector/blob/main/scripts/export_clap_onnx.py
- Artículo CLAP (arXiv:2309.05767): https://arxiv.org/abs/2309.05767
- Librería tokenizers: https://github.com/huggingface/tokenizers
