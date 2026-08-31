# litert-community/harrier-oss-v1-0.6b

## Resumen

harrier-oss-v1-0.6b es un modelo de embeddings de texto multilingüe desarrollado por Microsoft (Microsoft Foundry Labs) y convertido a formato LiteRT (`.tflite`) por la comunidad `litert-community` para inferencia en dispositivos de borde. El modelo original emplea una arquitectura decoder-only basada en Qwen3 con last-token pooling y normalización L2, y produce vectores densos de 1024 dimensiones aptos para recuperación semántica, RAG, clustering y similitud entre textos. Soporta 94 idiomas según Microsoft (la model card menciona más de 100).

La conversión LiteRT integra el pooling y la normalización L2 dentro del grafo de inferencia, de modo que una única llamada produce el embedding final sin pasos adicionales en el lado del host. Se ofrecen dos variantes cuantizadas —int8 de rango dinámico (626 MB) y fp16 (1199 MB)— ambas declaradas sin pérdida de calidad frente a la referencia PyTorch en las pruebas publicadas. El modelo está pensado para ejecución completamente offline en CPU, sin necesidad de GPU.

Su relevancia actual radica en que permite desplegar recuperación semántica multilingüe de calidad en dispositivos móviles y sistemas embebidos, con un coste de memoria reducido y latencias del orden de 170-600 ms en hardware Apple Silicon. La principal particularidad operativa es que la instrucción de consulta es obligatoria: cada query debe formatearse como `Instruct: {descripcion de la tarea}\nQuery: {consulta}`, mientras que los documentos se codifican en bruto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only basada en Qwen3, con last-token pooling y normalizacion L2 integradas en el grafo |
| Parametros totales | 0.6B (600 millones, segun el nombre del modelo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens en las firmas estaticas del artefacto LiteRT; el modelo original acepta hasta 32768 |
| Tipos de cuantizacion | int8 de rango dinamico (wi8fc) y fp16 (pesos fp16, computo en float) |
| Idiomas soportados | 94 idiomas segun Microsoft Foundry Labs; la model card indica mas de 100 |
| Licencia | MIT |
| Formato de pesos | TFLite (`.tflite`), convertido desde safetensors del modelo original |

## Arquitectura y entrenamiento

El modelo base `microsoft/harrier-oss-v1-0.6b` es un modelo de embeddings con arquitectura decoder-only basada en Qwen3, entrenado por Microsoft Foundry Labs. Produce vectores densos de 1024 dimensiones normalizados L2 mediante last-token pooling: el estado oculto del último token valido de la secuencia se proyecta y normaliza. El tokenizador incorpora un post-procesador que anade `<|endoftext|>` al final de cada texto, y es precisamente ese token anadido el que se utiliza como posicion de pooling; por tanto, es imprescindible tokenizar con los ficheros incluidos en el artefacto y no con una implementacion BPE manual.

La conversion LiteRT incrusta el pooling y la normalizacion L2 dentro del grafo, de modo que la salida es directamente el embedding final. Se ofrecen cuatro firmas estaticas (`embed_64`, `embed_128`, `embed_256`, `embed_512`) con shapes de batch 1 y padding por la derecha. El modelo original soporta hasta 32768 tokens de contexto, pero en el grafo estatico on-device el limite practico es 512, por lo que textos mas largos deben trocearse.

## Capacidades

- Generacion de embeddings densos de 1024 dimensiones, normalizados L2, de modo que la similitud coseno equivale a un producto escalar.
- Recuperacion semantica multilingüe en 94 idiomas, incluyendo pares cross-lingües (es-en, en-ar).
- Soporte para RAG: los documentos pueden indexarse con el modelo PyTorch en servidor y las consultas procesarse con el artefacto int8 en el dispositivo, con compatibilidad demostrada del espacio de embeddings.
- Clustering y agrupacion de textos por similitud semantica.
- Similitud entre frases (STS) con instrucciones simetricas en ambos lados.
- Ejecucion completamente offline en CPU, sin dependencia de servicios en la nube.
- No soporta tool calling, generacion de texto ni razonamiento: es exclusivamente un modelo de embeddings (pipeline `feature-extraction`).

## Casos de uso

- Busqueda semantica en aplicaciones moviles: una app de notas o documentacion local puede indexar el corpus del usuario y responder consultas en lenguaje natural sin conexion, gracias a las firmas estaticas de hasta 512 tokens y la inferencia en CPU.
- RAG en el borde (edge RAG): se indexan documentos en un servidor con el modelo PyTorch de referencia y se consultan desde el dispositivo con el artefacto int8. La comprobacion cross-variant publicada muestra nDCG@10 de 0.9389, compatible con el indice construido en el servidor.
- Atencion al cliente automatizada offline: un asistente de FAQ semantico que recupera la respuesta mas relevante de una base de conocimiento multilingüe sin necesidad de conectividad.
- Deteccion de duplicados en corpus multilingües: comparar embeddings de tickets, articulos o mensajes en distintos idiomas para identificar contenido redundante.
- Busqueda cross-lingüe: consultas formuladas en un idioma (p. ej. espanol) que recuperan documentos relevantes en otro (p. ej. ingles o arabe), con calidad verificada en STS17 (es-en 0.838, en-ar 0.848).
- Clustering de documentos para organizacion de conocimiento: agrupar por similitud semantica grandes volumenes de texto en el dispositivo, sin enviar datos a servidores externos.
- Sistemas de recomendacion basados en contenido: representar items (articulos, productos, publicaciones) como embeddings de 1024 dimensiones y calcular similitudes por producto escalar.

## Benchmarks y rendimiento

La model card publica comprobaciones de calidad sobre el artefacto LiteRT comparado con la referencia PyTorch fp32. Los resultados absolutos del corpus JSQuAD no son comparables con benchmarks publicados porque el corpus esta submuestreado.

| Benchmark | PyTorch fp32 | LiteRT int8 (wi8fc) | LiteRT fp16 |
|---|---|---|---|
| JSTS similitud semantica (Spearman, 300 pares) | 0.8553 | 0.8559 | 0.8553 |
| JSQuAD recuperacion (nDCG@10, 150 consultas) | 0.9363 | 0.9360 | identico a PyTorch |
| JSQuAD recuperacion (hit@1) | 0.880 | 0.880 | no disponible |
| STS17 en-en (Spearman, 100 pares) | no disponible | 0.890 | no disponible |
| STS17 ko-ko (Spearman) | no disponible | 0.890 | no disponible |
| STS17 es-en (Spearman) | no disponible | 0.838 | no disponible |
| STS17 en-ar (Spearman) | no disponible | 0.848 | no disponible |
| Recuperacion cross-variant (documentos PyTorch, consultas int8, nDCG@10) | 0.9363 (control todo PyTorch) | 0.9389 | no disponible |

Impacto de omitir la instruccion de consulta obligatoria:

| Configuracion | Con instruccion | Consulta en bruto |
|---|---|---|
| JSTS (Spearman) | 0.855 | 0.837 |
| JSQuAD (nDCG@10) | 0.936 | 0.908 |

## Requisitos de hardware

- Inferencia exclusivamente en CPU mediante LiteRT con backend XNNPACK; no requiere GPU.
- Tamano de archivo: 626 MB para la variante int8 (wi8fc, recomendada) y 1199 MB para fp16.
- Latencia medida en Apple M4 Max con 16 hilos (mediana de 10 ejecuciones, firmas al 75 % de capacidad): int8 `embed_128` 169 ms y `embed_512` 552 ms; fp16 `embed_128` 185 ms y `embed_512` 613 ms.
- La variante fp16 esta indicada solo para escritorio; la int8 es la opcion recomendada para dispositivos moviles y de borde.
- Despliegue mediante la libreria `ai_edge_litert` (interprete LiteRT) en Python, con `num_threads` configurable.
- No se documentan opciones de despliegue con vLLM, llama.cpp u Ollama: el formato es exclusivamente TFLite para LiteRT.

## Comparativa con modelos similares

La comparativa mas relevante es entre el modelo original PyTorch y las dos variantes LiteRT, ya que la model card no proporciona datos de otros modelos de embeddings comparables (p. ej. E5, BGE o GTE).

| Modelo | Formato | Tamano archivo | Contexto | JSTS (Spearman) | JSQuAD (nDCG@10) | Licencia |
|---|---|---|---|---|---|---|
| Harrier OSS v1 0.6B (PyTorch) | safetensors | no disponible | 32768 | 0.8553 | 0.9363 | MIT |
| Harrier OSS v1 0.6B (LiteRT int8) | tflite | 626 MB | 512 (firmas estaticas) | 0.8559 | 0.9360 | MIT |
| Harrier OSS v1 0.6B (LiteRT fp16) | tflite | 1199 MB | 512 (firmas estaticas) | 0.8553 | identico a PyTorch | MIT |

La variante int8 mantiene la calidad dentro de 0.001 en Spearman y 0.0003 en nDCG@10 respecto a la referencia PyTorch, con un archivo un 48 % mas pequeno que la variante fp16. No se dispone de datos para comparar con otros modelos de embeddings del mercado.

## Limitaciones y advertencias

- La instruccion de consulta es obligatoria: omitirla degrada la calidad mediblemente (JSTS de 0.855 a 0.837; JSQuAD nDCG@10 de 0.936 a 0.908). El formato correcto es `Instruct: {descripcion de la tarea}\nQuery: {consulta}`.
- El contexto estatico esta limitado a 512 tokens en las firmas del artefacto LiteRT; textos mas largos deben trocearse manualmente, a diferencia del modelo original que acepta 32768.
- El tokenizador anade `<|endoftext|>` automaticamente mediante un post-procesador; una implementacion BPE manual sin ese post-procesador altera silenciosamente los embeddings resultantes.
- Los textos se deben tokenizar con los ficheros incluidos en el artefacto; usar otro tokenizador puede producir vectores incompatibles.
- No es un modelo generativo: no genera texto, codigo ni respuestas; solo produce embeddings.
- La variante fp16 esta recomendada solo para escritorio por su mayor consumo de memoria (1199 MB).
- Los benchmarks publicados sobre JSQuAD usan un corpus submuestreado, por lo que los valores absolutos no son comparables con resultados de la literatura.
- No se han documentado sesgos especificos del modelo; como modelo multilingüe entrenado sobre datos web, puede reflejar sesgos presentes en sus datos de entrenamiento.

## Enlaces

- Artefacto LiteRT en HuggingFace: https://huggingface.co/litert-community/harrier-oss-v1-0.6b
- Modelo base en HuggingFace: https://huggingface.co/microsoft/harrier-oss-v1-0.6b
- Pagina oficial de Microsoft Foundry Labs: https://labs.ai.azure.com/innovations/harrier-oss-v1/
- Catalogo de modelos de Azure AI: https://ai.azure.com/catalog/models/microsoft-harrier-oss-v1-0.6b
- Repositorio de referencia en GitHub: https://github.com/tucuong2308/harrier-oss-v1-0.6b
