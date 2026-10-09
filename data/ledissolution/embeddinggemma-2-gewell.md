# LeDissolution/EmbeddingGemma-2-Gewell

## Resumen

EmbeddingGemma-2-Gewell es un reempaquetado en BF16 del modelo de embeddings multimodal google/embeddinggemma-2, preparado por el autor LeDissolution para funcionar exclusivamente con Gewell, un motor de inferencia mono-GPU especializado en NVIDIA Blackwell. No se trata de un fine-tune ni de una variante de rendimiento: los valores de los tensores se copian sin conversión desde el snapshot original de Google, por lo que el modelo conserva las capacidades del checkpoint upstream. La diferencia radica en el formato: los pesos se reorganizan en el layout nativo de Gewell y se separan en tres componentes independientes (texto, vision y audio) que pueden cargarse por separado.

El paquete ocupa 1,5 GB e incluye 1.376 tensores distribuidos en 413 para texto, 211 para vision/bridge y 752 para audio/bridge, ademas de config.json, processor_config.json y tokenizer.json. Soporta entradas de hasta 8.192 tokens y dimensiones de salida de 128, 256, 512 o 768, con una API compatible con el endpoint /v1/embeddings de OpenAI.

Su relevancia es limitada y muy especifica: solo es util para quienes despliegan Gewell sobre hardware Blackwell. No es compatible con Transformers, Sentence Transformers, vLLM ni llama.cpp, y el numero de descargas y likes del repositorio es cero en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de embeddings multimodal con componentes separados de texto, vision y audio (derivada de google/embeddinggemma-2) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens, incluyendo BOS/EOS |
| Tipos de cuantizacion | BF16 (reempaquetado sin conversion); no se ofrecen variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0, sujeta a los terminos del modelo upstream google/embeddinggemma-2 |
| Formato de pesos | safetensors en layout nativo de Gewell (text.safetensors, vision.safetensors, audio.safetensors) |
| Dimensiones de salida | 128, 256, 512 o 768 |
| Tamano del repositorio | 1,5 GB |
| Tensor total | 1.376 (413 texto, 211 vision/bridge, 752 audio/bridge) |

## Arquitectura y entrenamiento

El modelo reproduce la arquitectura de google/embeddinggemma-2, un encoder de embeddings multimodal. El reempaquetado divide el encoder en tres bloques cargables de forma independiente: texto (413 tensores), vision/bridge (211 tensores) y audio/bridge (752 tensores). El componente de texto siempre se carga; los modulos de vision y audio se anaden con los flags --vision y --audio respectivamente, y las peticiones mixtas de imagen/video con audio requieren ambos. La tabla de embeddings de tokens permanece en memoria del host en lugar de la GPU.

No se proporciona informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones tecnicas propias mas alla del propio motor Gewell, que aplica una validacion en arranque de la configuracion, el tokenizer, el contrato del processor y el inventario de tensores de cada componente. La extraccion es determinista y reproducible mediante el script tools/extract_embeddinggemma2.py sobre la revision 914f7f89142e33e77833254d9c9b90c3cef7303b de google/embeddinggemma-2.

## Capacidades

- Generacion de embeddings de texto de hasta 8.192 tokens con dimensiones configurables de 128, 256, 512 o 768.
- Codificacion de imagenes y video mediante el componente vision (flag --vision).
- Codificacion de audio mediante el componente audio (flag --audio).
- Recuperacion multimodal y cross-modal (texto-imagen, texto-video, texto-audio) al combinar los modulos.
- Servicio de embeddings a traves de un endpoint compatible con OpenAI (POST /v1/embeddings) bajo el identificador google/embeddinggemma-2.
- Soporte de prefijos de tarea (task: search result | query:, title:, etc.) que deben insertarse manualmente, ya que el motor no los anade de forma automatica.
- No incluye generacion de texto, tool calling ni razonamiento multi-paso: es un modelo exclusivamente de representacion (feature-extraction).
- Idiomas soportados no disponibles en la informacion proporcionada.

## Casos de uso

- Busqueda semantica en documentacion tecnica: indexar un corpus de hasta 8.192 tokens por fragmento y recuperar pasajes por similitud vectorial usando el prefijo task: search result | query.
- RAG sobre bases de conocimiento internas: los embeddings alimentan un almacen vectorial y el LLM generativo consulta los fragmentos recuperados; la ventana de 8.192 tokens permite manejar documentos largos sin troceado agresivo.
- Busqueda multimodal de imagenes: con --vision activado, indexar un catalogo de imagenes y permitir consultas en lenguaje natural sobre similitud visual-textual.
- Recuperacion de contenido audiovisual: con --vision --audio, localizar fragmentos de video o audio por descripcion textual, util en archivos de medios o plataformas de formacion.
- Deduplicacion y clustering de documentos: agrupar articulos o tickets de soporte por cercania coseno en el espacio de 768 dimensiones.
- Clasificacion de tickets y enrutado automatico: entrenar un clasificador ligero sobre los embeddings de texto para asignar departamentos sin necesidad de un LLM generativo.
- Sistemas de recomendacion basados en contenido: representar items y consultas en el mismo espacio vectorial para sugerir productos o articulos afines.
- Moderacion de contenido y filtrado semantico: detectar similitud con patrones problematicos previamente vectorizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, MTEB, retrieval, ni comparaciones numericas de calidad de embeddings.

## Requisitos de hardware

- GPU obligatoriamente NVIDIA Blackwell con arquitecturas sm_120 o sm_120a (RTX PRO 6000 Blackwell, serie RTX 50 y equivalentes). No funciona en generaciones anteriores.
- El motor fue desarrollado y probado sobre una RTX PRO 6000 Blackwell.
- Memoria de pesos en GPU a capacidad por defecto de 8.192 tokens (excluyendo overhead de CUDA/cuBLAS/cuDNN):
  - Solo texto: 274.210.816 bytes de pesos + 167.773.696 bytes de scratch.
  - Con --vision: 610.017.280 bytes de pesos + 178.782.528 bytes de scratch.
  - Con --vision --audio: 1.223.507.968 bytes de pesos + 1.028.441.648 bytes de scratch.
- La tabla de embeddings de tokens reside en memoria del host, no en VRAM.
- Despliegue exclusivamente mediante el binario build/gewell serve-embeddings; no es compatible con vLLM, llama.cpp, Ollama, TGI, Transformers ni Sentence Transformers.
- Servidor escucha en 127.0.0.1:6311 y expone la API HTTP compatible con OpenAI.
- Latencia y throughput no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Compatibilidad |
|---|---|---|---|---|---|
| LeDissolution/EmbeddingGemma-2-Gewell | no disponible | 8.192 tokens | Apache 2.0 | HuggingFace (0 descargas) | Solo motor Gewell en Blackwell |
| google/embeddinggemma-2 | no disponible | no disponible | Apache 2.0 (terminos upstream) | HuggingFace (modelo oficial de Google) | Transformers, ecosystem estandar |
| Otros modelos de embeddings multimodales | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa cuantitativa con alternativas de la misma categoria no esta disponible en la informacion proporcionada. Conviene senalar que EmbeddingGemma-2-Gewell comparte pesos exactos con google/embeddinggemma-2, por lo que la diferencia entre ambos es exclusivamente de formato y ecosistema de ejecucion, no de calidad de representacion.

## Limitaciones y advertencias

- Compatibilidad muy restringida: funciona unicamente con el motor Gewell y requiere GPU NVIDIA Blackwell (sm_120/sm_120a). No puede cargarse en Transformers, vLLM, llama.cpp, Ollama ni TGI.
- Los prefijos de tarea no se insertan automaticamente; el usuario debe aportarlos, y omitirlos degrada la calidad de recuperacion.
- Riesgo de alucinacion no aplica directamente (no genera texto), pero los embeddings pueden producir falsos positivos en recuperacion si el corpus no esta bien normalizado o los prefijos son incorrectos.
- Sesgos: no se documentan evaluaciones de sesgo ni de equidad sobre los embeddings resultantes.
- Idiomas soportados no disponibles; conviene verificar el comportamiento multilingue antes de desplegar en produccion.
- Licencia Apache 2.0 heredada, pero el uso esta sujeto adicionalmente a los terminos del modelo upstream google/embeddinggemma-2, que deben consultarse.
- Repositorio con cero descargas y cero likes: no hay evidencia de uso en produccion ni validacion externa independiente.
- La tabla de embeddings de tokens permanece en host, lo que implica consumo de RAM del sistema ademas de la VRAM indicada.
- La fecha de creacion del repositorio (2026-10-09) y la escasa actividad sugieren un proyecto muy reciente o experimental.

## Enlaces

- HuggingFace: https://huggingface.co/LeDissolution/EmbeddingGemma-2-Gewell
- Modelo base upstream: https://huggingface.co/google/embeddinggemma-2
- Repositorio Gewell: https://github.com/LeDissolution/gewell
- Instrucciones de compilacion de Gewell: https://github.com/LeDissolution/gewell/blob/main/docs/build.md
- Guia de modelos de Gewell: https://github.com/LeDissolution/gewell/blob/main/docs/models.md
- Referencia de CLI: https://github.com/LeDissolution/gewell/blob/main/docs/cli.md
- Documentacion de la API HTTP: https://github.com/LeDissolution/gewell/blob/main/docs/http-api.md
