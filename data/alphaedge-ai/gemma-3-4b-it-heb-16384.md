# alphaedge-ai/gemma-3-4b-it-heb-16384

## Resumen

`gemma-3-4b-it-heb-16384` es una version podada del vocabulario (*trimming*) del modelo multimodal `google/gemma-3-4b-it` de Google DeepMind, publicada por el usuario `alphaedge-ai` en Hugging Face. El modelo conserva la arquitectura original de Gemma 3 (transformer decoder-only con atencion multimodal para imagenes) pero reduce el vocabulario de 262.144 a 16.384 tokens, lo que elimina el 93,75% de las entradas del embedding y recorta el total de parametros de 4.300.079.472 a 3.670.770.032 (una reduccion del 14,63%). El objetivo es especializar el modelo en hebreo reduciendo el consumo de memoria y el tamano del repositorio (7,3 GB) sin reentrenar los pesos.

La tecnica de *trimming* consiste en identificar, mediante el analisis de un corpus representativo del idioma objetivo, que tokens del vocabulario original son realmente utilizados y eliminar el resto, reindexando los embeddings y la cabeza de salida. En este caso se usaron 200.000 textos del dataset `lbourdois/fineweb-2-trimming`. El resultado es un modelo que, segun el autor, deberia comportarse de forma similar al original en hebreo, pero que degradara su rendimiento en otros idiomas.

Es relevante para desarrolladores que necesiten desplegar un modelo conversacional multimodal de ~3,7B parametros en entornos con VRAM limitada y con foco en hebreo, ya que el recorte de vocabulario reduce tanto el peso de los embeddings como el coste de la capa de salida (que en modelos con vocabularios grandes supone una fraccion significativa de los FLOPs por token generado).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (Gemma 3), derivado por trimming de vocabulario |
| Parametros totales | 3.670.770.032 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Gemma 3 soporta contextos largos, pero el dato no se confirma aqui) |
| Tipos de cuantizacion | no disponible (el repo publica safetensors en precision original; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | hebreo (he) |
| Licencia | Gemma Terms of Use (license: gemma) |
| Formato de pesos | safetensors |
| Vocabulario | 16.384 tokens (original: 262.144) |
| Tamano del repositorio | 7,3 GB |
| Modalidad | image-text-to-text (segun tags), text-generation (pipeline) |
| Libreria | transformers |
| Modelo base | google/gemma-3-4b-it |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Gemma 3 4B instruct: un transformer decoder-only con atencion por capas, normalizacion RMSNorm y embeddings multimodales para entrada de imagen y texto. No se ha reentrenado ningun peso: la unica modificacion es la reduccion del vocabulario mediante *trimming*. El proceso selecciona los tokens mas frecuentes en un corpus hebreo de 200.000 textos (dataset `lbourdois/fineweb-2-trimming`) y descarta el resto, reindexando la matriz de embeddings de entrada y la proyeccion de salida (lm_head). Esto reduce el numero de parametros en 629.309.440, concentrados principalmente en las capas de embedding y de salida.

No hay informacion sobre el proceso de alineacion (RLHF/DPO) especifico de esta version podada; se asume el del modelo base Gemma 3 4B IT, descrito en el informe tecnico arXiv:2503.19786. Tampoco se detalla si se realizo un ajuste fino posterior al trimming para recuperar calidad, por lo que la fidelidad respecto al original depende unicamente de la cobertura del vocabulario recortado sobre el hebreo.

## Capacidades

- Generacion de texto conversacional en hebreo, con plantilla de chat (`apply_chat_template`) compatible con el formato instruct de Gemma 3.
- Entrada multimodal imagen-texto segun los tags del repositorio (`image-text-to-text`), heredada del modelo base.
- Razonamiento y respuesta a instrucciones en hebreo, sujeto a la calidad del vocabulario podado.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada para esta version podada.
- Capacidades de agente y razonamiento multi-paso: no confirmadas explicitamente; dependen del comportamiento del modelo base.
- Capacidades multilingues: limitadas practicamente al hebreo; el autor advierte que otros idiomas pueden degradarse por la eliminacion de tokens.
- Modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional en hebreo para atencion al cliente: el modelo puede gestionar dialogos multi-turno usando la plantilla de chat de Gemma 3, con un footprint de ~3,7B parametros que reduce los requisitos de VRAM frente al original de 4,3B.
- Generacion de contenido editorial en hebreo: redaccion de resumenes, articulos o descripciones de producto, aprovechando el vocabulario especializado en hebreo para mantener una tokenizacion eficiente.
- Procesamiento de documentos con OCR asistido: al conservar la capacidad image-text-to-text del modelo base, puede extraer y describir contenido de imagenes o capturas con texto en hebreo.
- Chatbot embebido en aplicaciones moviles o de escritorio: el recorte de vocabulario reduce el tamano del repositorio a 7,3 GB y el coste de la capa de salida, lo que facilita el despliegue en hardware modesto con cuantizacion posterior.
- Clasificacion y etiquetado de textos en hebreo: uso zero-shot o few-shot para categorizar tickets, correos o resenas, con inferencia por lotes en GPU consumer.
- Prototipado rapido de pipelines NLP en hebreo: su compatibilidad con `transformers` y `text-generation-inference` permite integrarlo en entornos de experimentacion sin necesidad de infraestructura de gran escala.
- Traduccion asistida hebreo-ingles en una sola direccion (entrada hebrea), con la advertencia de que la salida en otros idiomas puede degradarse por el vocabulario reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta estadisticas de tamano (vocabulario, parametros y porcentaje de reduccion) y no incluye metricas de calidad (MMLU, HumanEval, GSM8K ni evaluaciones en hebreo).

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 7,3 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 10-12 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: en torno a 4 GB de pesos; en 4 bits, en torno a 2 GB, aunque estas variantes no se publican en el repositorio y habria que generarlas.
- GPU recomendadas: A100 40GB, H100, L40S o RTX 6000 Ada para produccion; RTX 4090 (24 GB) y RTX 3090 (24 GB) para desarrollo y despliegue en fp16.
- GPU consumer: cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB) e incluso en GPUs de 12 GB si se cuantiza a 8 bits; en 4 bits podria caber en GPUs de 8 GB.
- Opciones de despliegue: `transformers` (soporte nativo), `text-generation-inference` (tag `text-generation-inference`), y potencialmente llama.cpp/Ollama si se generan pesos GGUF (no incluidos en el repo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Vocabulario | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|---|
| alphaedge-ai/gemma-3-4b-it-heb-16384 | 3,67B | 16.384 | no disponible | hebreo | Gemma Terms | Version podada de Gemma 3 4B IT |
| google/gemma-3-4b-it | 4,30B | 262.144 | no disponible en la info | multilingue | Gemma Terms | Modelo base original, multimodal |
| Modelos especializados en hebreo de ~4B | no disponible | no disponible | no disponible | hebreo | no disponible | No se dispone de datos comparables en la informacion proporcionada |

La comparacion directa con alternativas especializadas en hebreo no puede completarse con los datos disponibles. Frente a su modelo base, la ventaja es un 14,63% menos de parametros y un vocabulario mucho mas compacto; la desventaja es la perdida de cobertura multilingue.

## Limitaciones y advertencias

- El vocabulario reducido a 16.384 tokens elimina la mayoria de tokens multilingues; el rendimiento fuera del hebreo puede degradarse de forma significativa, tal como advierte el autor.
- No se han publicado evaluaciones de calidad ni benchmarks; no hay evidencia cuantitativa de que el rendimiento en hebreo sea equivalente al del modelo base.
- Riesgo de alucinacion inherente a los modelos de ~4B parametros, no mitigado especificamente en esta version.
- Sesgos: no documentados en la model card; se heredan los del modelo base Gemma 3, sin informacion adicional sobre mitigaciones.
- Restricciones de licencia: uso sujeto a los Gemma Terms of Use; es necesario revisar las condiciones de uso comercial, redistribucion y atribucion antes de desplegar en produccion.
- El modelo no esta afiliado ni respaldado por Google, segun indica el autor.
- El repositorio tiene muy poca traccion (7 descargas, 0 likes) y fue creado en 2026; no hay senales de mantenimiento comunitario ni de validacion independiente.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ), lo que obliga a generarlos si se quiere desplegar en hardware limitado.
- El pipeline declarado es `text-generation` aunque los tags incluyen `image-text-to-text`; conviene verificar el soporte multimodal real en la practica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/gemma-3-4b-it-heb-16384
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Dataset de minado: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Informe tecnico de Gemma 3: https://arxiv.org/abs/2503.19786
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
