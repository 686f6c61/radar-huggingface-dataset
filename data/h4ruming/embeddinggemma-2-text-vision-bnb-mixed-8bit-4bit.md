# H4RUming/embeddinggemma-2-text-vision-bnb-mixed-8bit-4bit

## Resumen

EmbeddingGemma 2 text+vision mixed 8-bit/4-bit es una derivacion no oficial de `google/embeddinggemma-2`, publicada por el usuario H4RUming en Hugging Face. Se trata de un modelo de embeddings multimodales (texto e imagen) obtenido mediante cuantizacion por componentes sobre el modelo base de Google: el codificador de vision se mantiene en 8 bits y el modelo de lenguaje se cuantiza a 4 bits con bitsandbytes. El objetivo es reducir el consumo de VRAM en GPUs con memoria limitada sin degradar en exceso la calidad de los embeddings.

El modelo conserva la arquitectura original de EmbeddingGemma 2 (transformer multimodal con torre de vision y modelo de lenguaje), pero elimina por completo el codificador de audio (`audio_tower`, `embed_audio`, 304,8 M de parametros), ya que las entradas de texto e imagen no lo atraviesan. Esta eliminacion no altera los embeddings de texto e imagen respecto al original. El resultado es un checkpoint de 438.760.472 parametros y aproximadamente 0,7 GB en el repositorio.

Es relevante para desarrolladores que necesitan ejecutar recuperacion multimodal (texto-imagen, texto-texto) en hardware modesto, como una Jetson Orin Nano de 8 GB, donde el modelo cuantizado ocupa 0,49 GiB de memoria frente a los 0,82 GiB de la version en bfloat16. La licencia es Apache 2.0, igual que el modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (torre de vision + modelo de lenguaje), derivado de EmbeddingGemma 2 |
| Parametros totales | 438.760.472 |
| Parametros activos | No es MoE |
| Longitud de contexto | Hasta 2048 tokens (configurable via `max_seq_length`; por defecto practicamente ilimitado) |
| Tipos de cuantizacion | Vision encoder 8 bits (bitsandbytes `Linear8bitLt`), modelo de lenguaje 4 bits (NF4 con doble cuantizacion, compute dtype bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria sentence-transformers) |

## Arquitectura y entrenamiento

El modelo parte de `google/embeddinggemma-2`, un modelo de embeddings multimodales que combina una torre de vision con un modelo de lenguaje para producir representaciones vectoriales de texto e imagen en un espacio comun. Esta version no reentrena ningun peso: todas las modificaciones son de cuantizacion y poda estructural. Concretamente, se elimina la torre de audio (304,8 M de parametros) y se aplica cuantizacion diferenciada por componente: el modelo de lenguaje se convierte a 4 bits NF4 con doble cuantizacion y dtype de computo bfloat16, mientras que el codificador de vision se mantiene en 8 bits mediante `Linear8bitLt`, ya que segun el autor es sensible a la cuantizacion a 4 bits.

Una particularidad tecnica es que los pesos almacenados en el repositorio son lenguaje 4 bits + vision en bfloat16, porque una unica configuracion de cuantizacion de transformers no permite mezclar capas de 8 y 4 bits en un mismo checkpoint guardado. Tras la carga, el usuario debe ejecutar la funcion `quantize_vision_8bit` (contenida en el archivo `vision_8bit.py`, de 30 lineas) para convertir el codificador de vision a 8 bits. No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens ni si hubo RLHF o DPO, ya que estos datos pertenecen a la model card del modelo base y no se incluyen en la informacion proporcionada.

## Capacidades

- Generacion de embeddings de texto para tareas de recuperacion semantica y similitud.
- Generacion de embeddings de imagen (paginas de documentos, imagenes) en el mismo espacio vectorial que el texto.
- Recuperacion multimodal texto-imagen y texto-texto.
- Soporte de prefijos de consulta y documento mediante `prompt_name` (por ejemplo, `SearchQuery`) y formato de documento `title: {title} | text: {content}`, siguiendo la model card original.
- Extraccion de caracteristicas (`feature-extraction`) compatible con sentence-transformers.
- No soporta entrada de audio (devuelve `ValueError`).
- La entrada de video no ha sido probada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Recuperacion de documentos por imagen de portada: el modelo permite indexar la primera pagina de documentos PDF como embedding de imagen y recuperarla a partir de una consulta textual. En la medicion del autor, recupera correctamente 1 de 24 portadas con una similitud de 0,96, igual que la referencia en bfloat16.
- Busqueda semantica en corpus de texto en GPUs de 8 GB: con el modelo de lenguaje en 4 bits, el consumo es de 0,49 GiB, lo que permite ejecutar recuperacion densa en hardware como una Jetson Orin Nano sin agotar la memoria.
- Sistemas RAG multimodales: combinacion de embeddings de texto y de imagenes de paginas escaneadas para construir indices vectoriales mixtos en entornos con VRAM limitada.
- Clasificacion y deduplicacion de documentos por similitud de embeddings de sus portadas o primeros parrafos.
- Prototipado en dispositivos edge: el modelo cabe en GPUs consumer de gama baja y en placas embebidas con CUDA, con un throughput de 1,5 imagenes por segundo tras la conversion a 8 bits.
- Filtrado y ranking de resultados de busqueda: uso de `model.similarity` entre embeddings de consulta y documentos para reordenar candidatos en pipelines de recuperacion.
- Extraccion de caracteristicas para entrenar clasificadores ligeros sobre representaciones congeladas, dado que el modelo es de solo inferencia y no requiere reentrenamiento.

## Benchmarks y rendimiento

Mediciones del autor en Jetson Orin Nano 8GB (JetPack 7.2.1, torch 2.15.0+cu132), sobre las primeras paginas de 24 documentos PDF reales. La referencia es el modelo sin audio en bfloat16.

| Vision encoder / language model | Memoria GPU del modelo | Similitud coseno imagen (media / min) | Similitud coseno texto (min) | Throughput de imagen |
|---|---|---|---|---|
| bfloat16 / bfloat16 (referencia) | 0,82 GiB | 1,000 / 1,000 | 1,000 | 2,2 img/s |
| 8 bits / 4 bits (este modelo) | 0,49 GiB | 0,974 / 0,955 | 0,975 | 1,5 img/s |
| bfloat16 / 4 bits (sin conversion) | 0,63 GiB | 0,977 / 0,965 | 0,975 | 2,1 img/s |
| 4 bits / 4 bits (modelo 4-bit) | 0,42 GiB | 0,931 / 0,875 | 0,975 | 1,9 img/s |

En recuperacion de la portada de un documento a partir de su titulo (1 de 24), la referencia obtiene 0,96, este modelo 0,96 y el modelo 4-bit 0,92. El autor advierte que la muestra es pequena. Los embeddings de texto son identicos a los del modelo 4-bit, al compartir el mismo modelo de lenguaje cuantizado.

## Requisitos de hardware

- VRAM estimada: 0,63 GiB al cargar (lenguaje 4 bits + vision bfloat16) y 0,49 GiB tras la conversion del vision encoder a 8 bits.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA y soporte de bitsandbytes; el autor ha validado en Jetson Orin Nano 8GB. No se han publicado pruebas en A100, H100 o RTX 4090.
- Cabe en GPUs consumer: si, incluida la Jetson Orin Nano de 8 GB; no se especifican otras GPUs consumer probadas.
- No puede cargarse en CPU: requiere GPU CUDA y bitsandbytes.
- Opciones de despliegue: sentence-transformers (>=6.1) con transformers (>=5.19), torchvision, bitsandbytes y accelerate. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 1,5 imagenes/s tras la conversion a 8 bits (frente a 2,1 img/s sin conversion y 2,2 img/s de la referencia). El throughput de texto no cambia respecto al modelo 4-bit.
- Dependencias adicionales: el archivo `vision_8bit.py` debe descargarse y ejecutarse para aplicar la cuantizacion a 8 bits del codificador de vision.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Memoria GPU | Similitud coseno imagen (media) | Licencia |
|---|---|---|---|---|---|
| Este modelo (8 bits / 4 bits) | 438,7 M | 2048 | 0,49 GiB | 0,974 | Apache 2.0 |
| H4RUming/embeddinggemma-2-text-vision-bnb-4bit | No disponible en la informacion | 2048 | 0,42 GiB | 0,931 | Apache 2.0 |
| google/embeddinggemma-2 (bfloat16, sin audio) | No disponible en la informacion | No disponible | 0,82 GiB | 1,000 (referencia) | Apache 2.0 |

No se dispone de datos sobre otros modelos de embeddings multimodales comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Las capas de 8 bits calculan internamente en `float16`. La model card original advierte de que `float16` puede producir NaN; el autor no observo NaN en las 24 paginas probadas, pero no lo garantiza. Como alternativa, se puede omitir la conversion y mantener el vision encoder en bfloat16 (0,63 GiB, misma fidelidad y mas rapido).
- La conversion a 8 bits ralentiza la codificacion de imagenes (de 2,1 a 1,5 img/s).
- El vision encoder se carga en bfloat16 antes de la conversion, por lo que se necesitan 0,63 GiB en el momento de la carga.
- La calidad de recuperacion de imagenes solo se comprobo en una muestra pequena (24 documentos).
- No soporta entrada de audio (devuelve `ValueError`); la entrada de video no fue probada.
- Requiere GPU CUDA y bitsandbytes; no se puede cargar en CPU.
- Es una derivacion no oficial, no una publicacion de Google.
- Riesgo de alucinacion y sesgos: no se dispone de informacion especifica en la documentacion proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al ser una derivacion no oficial conviene revisar la licencia y los terminos del modelo base `google/embeddinggemma-2`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/H4RUming/embeddinggemma-2-text-vision-bnb-mixed-8bit-4bit
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Version 4-bit del mismo autor: https://huggingface.co/H4RUming/embeddinggemma-2-text-vision-bnb-4bit
