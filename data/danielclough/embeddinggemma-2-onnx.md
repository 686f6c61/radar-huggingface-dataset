# DanielClough/embeddinggemma-2-onnx

## Resumen

EmbeddingGemma 2 ONNX es un repositorio que contiene una copia fijada (pinned) del modelo de texto y del codificador visual de EmbeddingGemma 2, exportados a formato ONNX. El modelo original es `google/embeddinggemma-2`, desarrollado por Google, y la exportación a ONNX procede de `onnx-community/embeddinggemma-2-ONNX`. Este repositorio, mantenido por DanielClough, no introduce modificaciones en los pesos: su proposito es garantizar la reproducibilidad fijando los ficheros por hash sha256 y evitando que un pipeline que los descarga deje de funcionar si el repositorio original cambia.

Se trata de un modelo de embeddings multimodales de tipo feature-extraction, con una dimension de embedding de 768 y una dimension de proyeccion de features de 512 para imagen, video y audio. Incluye el modelo de texto y el codificador visual, pero no el codificador de audio. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia practica radica en el despliegue en produccion: al estar en ONNX, puede ejecutarse con ONNX Runtime en CPU o GPU, integrarse en pipelines que no usan PyTorch y beneficiarse de la cuantizacion fp16 incluida. La ficha se basa exclusivamente en la informacion de la model card del autor y del repositorio de Hugging Face; los datos no publicados se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de embeddings multimodales (modelo de texto + codificador visual) exportado a ONNX; detalles internos de capas no disponibles |
| Parametros totales | no disponible (la referencia Ollama se denomina `embeddinggemma-2:740m-bf16`, lo que sugiere ~740M, pero no se confirma en la informacion) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 y fp16 (ficheros `model.onnx` / `model_fp16.onnx` y equivalentes del codificador visual); no se listan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx`, `model.onnx_data`, `vision_encoder.onnx`, `vision_encoder.onnx_data` y variantes fp16), mas `tokenizer.json` |
| Dimension de embedding | 768 (`sentence_embedding` [b, 768], mean-pooled) |
| Dimension de features multimodales | 512 (`image_features`, `video_features`, `audio_features`) |
| Runtime requerido | ONNX Runtime 1.31 o superior |
| Tamano del repo | 2.7 GB |

## Arquitectura y entrenamiento

El repositorio no describe la arquitectura interna del modelo base; solo documenta la interfaz de inferencia. El modelo de texto recibe `input_ids` y `attention_mask` (int64) junto con features multimodales `image_features`, `video_features` y `audio_features` (float32, forma [n, 512], vacias [0, 512] cuando no se usan) y produce `sentence_embedding` de forma [b, 768] mediante mean pooling. El codificador visual recibe `pixel_values` (float32, [frames, patches, 768]) y `pixel_position_ids` (int64, [frames, patches, 2]) y devuelve `image_features` [soft tokens, 512].

El preprocesamiento esta definido con precision. Las imagenes se redimensionan a 280 soft tokens (1056x576 para 16:9), con valores en rango 0-1 sin normalizar, parches de 16x16 con los colores al final y orden fila a fila, posiciones (columna, fila) y relleno con ceros hasta `soft tokens x 9` en la posicion -1. El formato de entrada es `<bos><|image>` seguido de `<|image|>` repetido por token y cerrado con `<image|><eos>`. Para video se usa 1 fotograma por segundo y 140 soft tokens por fotograma (720x384 en 16:9), con cada fotograma envuelto en `<|image>` + `<|video|>` x tokens + `<image|>`, concatenados sin separador dentro de `<bos> ... <eos>`. Para texto se emplean las plantillas `task: search result | query: ...` o `title: none | text: ...`.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo original. La innovacion tecnica documentada es la exportacion ONNX fijada por sha256 y la verificacion de equivalencia numerica frente a la referencia en sentence-transformers 6.3 (fp32) y frente a la version bf16 de Ollama.

## Capacidades

- Generacion de embeddings de texto con pooling medio y salida de 768 dimensiones, adecuada para busqueda semantica, similitud y recuperacion.
- Embeddings de imagen mediante un codificador visual separado que proyecta a 512 dimensiones.
- Embeddings de video con muestreo de 1 fotograma por segundo y 140 soft tokens por fotograma.
- Soporte de entrada multimodal conjunta: el modelo de texto acepta features de imagen, video y audio (aunque el codificador de audio no esta incluido en este repositorio).
- Plantillas de tarea para consultas y documentos (`task: search result | query:` y `title: none | text:`), orientadas a recuperacion.
- Ejecucion en ONNX Runtime con variantes fp32 y fp16.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni modo thinking; el pipeline es feature-extraction, no generacion.

## Casos de uso

- Busqueda semantica en produccion: el modelo genera embeddings de 768 dimensiones para consultas y documentos usando las plantillas de tarea, lo que permite indexar un corpus y recuperar pasajes por similitud coseno en un servicio ONNX Runtime sin dependencia de PyTorch.
- Recuperacion aumentada (RAG): al aceptar texto y features visuales, puede indexar documentos con imagenes asociadas y recuperar fragmentos multimodales para alimentar un LLM, manteniendo coherencia entre modalidades en un mismo espacio de 512 dimensiones para las features.
- Busqueda de video por contenido: con el muestreo de 1 fotograma por segundo y 140 soft tokens por fotograma, se pueden generar embeddings de segmentos de video y permitir consultas en lenguaje natural sobre archivos de video, util en archivos audiovisuales o monitorizacion.
- Deduplicacion y clustering de imagenes: el codificador visual proyecta cada imagen a 512 dimensiones, lo que permite agrupar o detectar duplicados en catalogos de productos o bibliotecas de medios.
- Verificacion de pipelines de embeddings: al estar los ficheros fijados por sha256 y validados contra la referencia con correlaciones superiores a 0.9999, sirve como dependencia estable en tests de regresion de sistemas de recuperacion.
- Despliegue en entornos sin GPU: las variantes ONNX pueden ejecutarse en CPU con ONNX Runtime, lo que facilita su uso en servicios edge o contenedores ligeros para clasificacion y busqueda a pequena escala.
- Moderacion y clasificacion de contenido multimodal: combinando embeddings de texto e imagen se pueden entrenar clasificadores ligeros sobre las representaciones generadas para detectar contenido similar o duplicado.

## Benchmarks y rendimiento

La model card no publica benchmarks estandar (MMLU, HumanEval, etc.), pero si una verificacion de equivalencia numerica frente a la referencia y frente a Ollama en 256 textos, 61 imagenes y 28 videos, ejecutada en una RTX 4070 Ti y una RTX 3090:

| Comparacion | Textos (min) | Imagenes (min) | Videos (min) |
|---|---|---|---|
| fp32 frente a referencia | 1.000000 | 0.999921 | 0.999968 |
| fp16 frente a referencia | 0.999996 | 0.999949 | 0.999938 |
| fp16 frente a Ollama bf16 | 0.999671 | 0.999640 | no disponible |

No se han publicado resultados de benchmarks de tareas (MTEB u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El repositorio ocupa 2.7 GB e incluye variantes fp32 y fp16; la variante fp16 reduce aproximadamente a la mitad el peso de los tensores frente a fp32.
- GPU recomendadas: el autor valido el modelo en una RTX 4070 Ti y una RTX 3090, por lo que tarjetas de gama alta para consumidor son suficientes.
- Compatibilidad con GPU de consumidor: si, segun la validacion del autor en RTX 4070 Ti y RTX 3090.
- Opciones de despliegue: ONNX Runtime 1.31 o superior. La build CUDA de ONNX Runtime 1.24 no tiene kernels para las operaciones Pad, Equal y Size de los opsets 20 y 21, por lo que esas operaciones caen a CPU; se recomienda una version igual o superior a 1.31.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|
| DanielClough/embeddinggemma-2-onnx | no disponible (~740M segun la referencia Ollama `embeddinggemma-2:740m-bf16`, sin confirmar) | no disponible | Texto, imagen, video (audio no incluido) | Apache-2.0 | ONNX fp32/fp16 |
| google/embeddinggemma-2 | no disponible | no disponible | Texto, imagen, video, audio (modelo base) | Apache-2.0 | no disponible |
| onnx-community/embeddinggemma-2-ONNX | no disponible | no disponible | Texto, imagen, video | no disponible | ONNX |
| Ollama `embeddinggemma-2:740m-bf16` | ~740M (segun el nombre de la etiqueta) | no disponible | Texto, imagen, video | no disponible | bf16 |

La comparativa de rendimiento entre estas variantes se limita a la equivalencia numerica reportada por el autor (correlaciones superiores a 0.9996 frente a Ollama en texto e imagen). No se dispone de datos de benchmarks de tareas para comparar calidad entre alternativas.

## Limitaciones y advertencias

- El repositorio no incluye el codificador de audio, por lo que las features de audio no pueden generarse con estos ficheros.
- Es una copia fijada de otro repositorio; no incorpora mejoras ni correcciones sobre el modelo original.
- Requiere ONNX Runtime 1.31 o superior; con la build CUDA de la version 1.24 algunas operaciones se ejecutan en CPU, lo que degrada el rendimiento.
- El preprocesamiento es estricto (tamanos, parches, posiciones y plantillas de texto); desviarse de las especificaciones produce embeddings incorrectos.
- No se documentan sesgos conocidos, riesgos de alucinacion ni limitaciones de idioma en la informacion disponible; al ser un modelo de embeddings, no genera texto y el riesgo de alucinacion no aplica directamente.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias sobre el modelo ni sobre los pesos originales de Google.
- No se dispone de informacion sobre el contexto maximo ni sobre el rendimiento en idiomas distintos del ingles; las plantillas de tarea estan en ingles.
- El numero de descargas y likes es 0 en el momento de la consulta, lo que indica poca adopcion y validacion externa limitada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/DanielClough/embeddinggemma-2-onnx
- Repositorio ONNX de referencia: https://huggingface.co/onnx-community/embeddinggemma-2-ONNX
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Commit fijado de referencia: `daa72c51243991dfcaf9f9137d2c573d8f7790c0`
- Commit de referencia del modelo base: `f9972ac22e696a105c482202646979e33e4b5a1e`
- ONNX Runtime: https://onnxruntime.ai/
