# Ful3/Dark-Scarlett-v1.0-31B-hybrid12-multilingual

## Resumen

Dark-Scarlett-v1.0-31B-hybrid12-multilingual es una cuantizacion de precision mixta del modelo ReadyArt/Dark-Scarlett-v1.0-31B (identificado en la model card como Gemma 4 31B), publicada por el usuario Ful3. El objetivo no es crear un modelo nuevo, sino reducir el coste de despliegue del modelo base manteniendo su comportamiento, especialmente en el terreno multilingue, donde las cuantizaciones calibradas solo en ingles suelen degradar acentos y filtrar palabras en ingles en otros idiomas. La receta se ha generado con llm-compressor y esta empaquetada en formato compressed-tensors para su uso directo con vLLM.

El resultado es un checkpoint de aproximadamente 26 GiB en disco, con capas de atencion en GPTQ de 4 bits (W4A16, grupo 32) y una mezcla de FP8 dinamico (W8A8) y GPTQ de 4 bits en las capas MLP. Los embeddings, el lm_head y la torre de vision se mantienen en BF16 sin cuantizar, lo que conserva las capacidades multimodales del modelo base. La nomenclatura "31B" del repositorio no coincide con el recuento real de parametros de los safetensors, que asciende a 20.213.495.660 (unos 20,2 mil millones).

El aspecto mas relevante de esta publicacion es su calibracion multilingue explicita: GPTQ se calibro sobre 320 conversaciones de 4096 tokens, de las cuales 96 son roleplay en ingles y 224 son conversaciones de self-play generadas por el propio modelo BF16 en once idiomas. Segun la model card, en una comprobacion de 92 respuestas de chat de compania en 8 idiomas el resultado iguala al modelo BF16 sin fugas de ingles, sin caracteres de alfabeto incorrecto y sin respuestas degeneradas. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se ha publicado informacion sobre benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4 31B segun la model card) con torre de vision; cuantizacion mixta sobre compressed-tensors |
| Parametros totales | 20.213.495.660 (~20,2 mil millones), segun safetensors |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ W4A16 grupo 32 en atencion (q/k/v/o_proj) y en 12 capas MLP (10, 14, 18, 22, 26, 30, 34, 38, 42, 46, 50, 54); FP8 dinamico W8A8 en 48 capas MLP (gate/up/down_proj); BF16 sin cuantizar en embeddings, lm_head y torre de vision |
| Idiomas soportados | no disponible en los metadatos; la calibracion cubre ingles, espanol, aleman, italiano, frances, coreano, japones, checo, polaco, portugues y ruso |
| Licencia | no disponible; la model card indica que se aplican los terminos del modelo base (Gemma) |
| Formato de pesos | safetensors con compressed-tensors; pensado para vLLM |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado desde cero, sino de una cuantizacion post-entrenamiento (PTQ) del checkpoint ReadyArt/Dark-Scarlett-v1.0-31B. La model card lo describe como Gemma 4 31B, aunque el recuento real de parametros en safetensors es de 20,2 mil millones; la discrepancia entre el nombre y el dato objetivo no se explica en la documentacion disponible. La presencia de una torre de vision en BF16 sin cuantizar indica que el modelo base es multimodal, con entrada de imagen ademas de texto.

La innovacion tecnica principal es el esquema de precision mixta por tipo de capa. Las proyecciones de atencion usan GPTQ weight-only de 4 bits con grupo 32, mientras que las capas MLP combinan FP8 dinamico en 48 capas con GPTQ de 4 bits en 12 capas concretas (10, 14, 18, 22, 26, 30, 34, 38, 42, 46, 50, 54). Los componentes sensibles a la precision (embeddings, lm_head y torre de vision) permanecen en BF16. El proceso se realizo con llm-compressor.

El segundo eje de trabajo es la calibracion. El conjunto de calibracion consta de 320 conversaciones de 4096 tokens: 96 conversaciones de roleplay en ingles y 224 conversaciones de self-play de roleplay escritas por el propio modelo BF16 en espanol, aleman, italiano, frances, coreano y japones (28 cada uno), checo (20) y polaco, portugues y ruso (12 cada uno). La model card afirma que una calibracion equivalente solo en ingles producia fugas de palabras inglesas en otros idiomas y perdida de acentos en espanol, y que esta version no presenta esos artefactos. No se documenta ningun proceso de RLHF, DPO o ajuste adicional sobre la cuantizacion.

## Capacidades

- Generacion de texto conversacional multiturno, con orientacion declarada a chat de compania y roleplay.
- Capacidades multilingues en al menos once idiomas segun la calibracion: ingles, espanol, aleman, italiano, frances, coreano, japones, checo, polaco, portugues y ruso.
- Preservacion de diacriticos y alfabetos no latinos: la model card afirma que no se producen caracteres de alfabeto incorrecto ni fugas de ingles en la comprobacion de 92 respuestas en 8 idiomas.
- Procesamiento de imagenes, ya que la torre de vision se conserva en BF16 (la model card no detalla tareas de vision concretas).
- Servicio en modo solo texto mediante el flag `--language-model-only`, que descarta la torre de vision.
- Soporte de cache KV en FP8 (`--kv-cache-dtype fp8`) para reducir el consumo de memoria en vLLM.
- Soporte de tool calling, function calling, agentes, modo de razonamiento explicito, audio o cualquier otra capacidad especial: no disponible en la informacion proporcionada.

## Casos de uso

- Chat de compania y roleplay multilingue: es el escenario para el que se diseno la calibracion. La mezcla de self-play en once idiomas busca mantener el tono y la naturalidad de las respuestas fuera del ingles, evitando que el modelo derive a ese idioma.
- Atencion al cliente en varios idiomas europeos y asiaticos: el modelo cubre espanol, aleman, italiano, frances, checo, polaco, portugues y ruso en la calibracion, lo que permite desplegar un unico endpoint para varias regiones sin recurrir a un modelo distinto por idioma.
- Traduccion y localizacion con control de acentos: al preservar diacriticos y alfabetos, resulta adecuado para tareas de post-edicion y generacion de contenido localizado donde la perdida de acentos seria un defecto visible.
- Despliegue en infraestructura limitada: los aproximadamente 26 GiB del checkpoint permiten servirlo en una sola GPU de 40-48 GB, algo inviable con el modelo base en BF16 (que requeriria del orden de 40-60 GB solo en pesos).
- Generacion de datos sinteticos de conversacion: el propio modelo se uso para producir 224 conversaciones de self-play en la calibracion, por lo que puede emplearse para generar corpus de dialogo multilingue a escala.
- Asistente multimodal con entrada de imagen: al conservar la torre de vision en BF16, puede usarse en tareas de descripcion de imagenes o conversacion sobre imagenes, siempre que no se active el flag de modo solo texto.
- Inferencia de alto rendimiento con vLLM: la integracion nativa con compressed-tensors permite desplegarlo con batching continuo y cache KV en FP8, adecuado para servicios con muchos usuarios concurrentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato de evaluacion presente es cualitativo: en una comprobacion de 92 respuestas de chat de compania en 8 idiomas, el modelo iguala al modelo base en BF16 sin fugas de ingles, sin caracteres de alfabeto incorrecto y sin respuestas degeneradas. No se aportan metricas como MMLU, HumanEval o GSM8K, ni comparaciones numericas con el checkpoint BF16 en perplejidad o exactitud de tareas.

## Requisitos de hardware

- Peso en disco del repositorio: 27,8 GB; la model card indica aproximadamente 26 GiB de pesos.
- VRAM estimada para inferencia: alrededor de 28-32 GB solo para pesos y memoria no gestionada por PyTorch, mas la cache KV. Las cifras siguientes son estimaciones derivadas del tamano en disco, no datos publicados por el autor.
- GPU de 80 GB (H100, A100 80 GB, H200): holgura suficiente para contextos largos y concurrencia alta con cache KV en FP8.
- GPU de 48 GB (L40S, RTX 6000 Ada, A6000): opcion recomendada de coste medio; permite servir el modelo con margen para cache KV.
- GPU de 40 GB (A100 40 GB): viable con contextos y lotes moderados, ajustando `--max-model-len` y `--gpu-memory-utilization`.
- GPU de consumo: una RTX 4090 o RTX 5090 de 24 GB no es suficiente para el checkpoint completo en vLLM. No se ha publicado ninguna variante GGUF ni cuantizacion de menor tamano que permita ejecutarlo en 24 GB.
- Opciones de despliegue: vLLM es el soporte documentado, con el comando `vllm serve <repo> --language-model-only --kv-cache-dtype fp8`. El formato compressed-tensors con GPTQ y FP8 mixto no es compatible con llama.cpp, Ollama ni otros runners basados en GGUF; para TGI no hay confirmacion en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La informacion disponible solo permite comparar la cuantizacion con su propio modelo base.

| Modelo | Parametros | Precision | Tamano en disco | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ful3/Dark-Scarlett-v1.0-31B-hybrid12-multilingual | 20.213.495.660 | Mixta: GPTQ W4A16 + FP8 W8A8 + BF16 | ~26 GiB (repo 27,8 GB) | no disponible | Terminos del modelo base (Gemma), sin detalle | vLLM via compressed-tensors |
| ReadyArt/Dark-Scarlett-v1.0-31B (base) | no disponible | BF16 | no disponible | no disponible | no disponible | safetensors estandar |

No se dispone de datos de otros modelos comparables de la misma categoria dentro de la informacion proporcionada, por lo que no se puede establecer una comparacion con alternativas cuantizadas de terceros.

## Limitaciones y advertencias

- La licencia no esta declarada en los metadatos del repositorio. La model card remite a los terminos del modelo base, descrito como Gemma, por lo que se deben revisar los terminos de uso de Gemma antes de cualquier uso comercial.
- El recuento real de parametros (20,2 mil millones) no coincide con el "31B" del nombre del repositorio ni con la denominacion "Gemma 4 31B" de la model card. Conviene verificar el modelo base antes de asumir un tamano concreto.
- La model card esta centrada en roleplay y chat de compania. No hay evidencia de rendimiento en tareas de razonamiento, codigo o matematicas, por lo que no se debe asumir un buen comportamiento en esos dominios.
- Riesgo de alucinacion: no se documenta ninguna evaluacion de factualidad ni de tasas de alucinacion.
- La validacion multilingue se limita a una comprobacion de 92 respuestas en 8 idiomas, realizada por el propio autor. No es una evaluacion independiente ni estadisticamente representativa.
- La calibracion no cubre idiomas fuera de los once listados. El comportamiento en otros idiomas (chino, arabe, hindi, etc.) es desconocido.
- La cuantizacion de 4 bits en atencion y en doce capas MLP puede degradar tareas sensibles a la precision, como el razonamiento de varios pasos o el seguimiento estricto de instrucciones. No se han publicado mediciones de esa perdida.
- La longitud de contexto soportada no esta documentada; el flag `--kv-cache-dtype fp8` es una recomendacion de despliegue, no una indicacion del maximo de tokens.
- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado con un minuto de diferencia. No hay evidencia de uso en produccion ni de validacion por parte de terceros.
- La compatibilidad esta atada a vLLM: el formato compressed-tensors con GPTQ y FP8 mixto no se puede cargar en llama.cpp u Ollama, lo que limita las opciones de despliegue en entornos sin GPU.
- No se documentan sesgos especificos del modelo, pero al ser un modelo orientado a roleplay y calibrado con conversaciones generadas por el propio modelo, puede reproducir sesgos de estilo y contenido presentes en el modelo base y en sus datos de entrenamiento originales.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Ful3/Dark-Scarlett-v1.0-31B-hybrid12-multilingual
- Modelo base: https://huggingface.co/ReadyArt/Dark-Scarlett-v1.0-31B
- Herramienta de cuantizacion mencionada (llm-compressor): no disponible como enlace en la informacion proporcionada
- Paper, blog o demo del autor: no disponible
- Nota sobre la busqueda web: los resultados obtenidos no guardan ninguna relacion con este modelo ni con inteligencia artificial, por lo que se han descartado y no se incluyen. No se han encontrado enlaces relevantes adicionales.
