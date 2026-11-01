# Anshulgada/tabman-embeddinggemma-2-270m

## Resumen

Tabman EmbeddingGemma 2 (270M) es un modelo de embeddings de frases y documentos desarrollado por el usuario Anshulgada, obtenido mediante fine-tuning del modelo base `google/embeddinggemma-2`. Su propósito es la organización semántica de pestañas de navegador, búsqueda semántica, agrupación jerárquica de URLs y descubrimiento de historial web dentro de la extensión Tabman (Brave Tab Manager). Resuelve el problema de clasificar y agrupar contenido heterogéneo (documentación técnica, foros, vídeo, comercio electrónico, investigación académica) en tiempo real dentro de un navegador, con un consumo de memoria reducido.

Arquitectura transformer de aproximadamente 271 millones de parámetros (271.002.648 según safetensors), con dimensión nativa de 768 y entrenamiento mediante Matryoshka Representation Learning (MRL) que permite truncar los vectores a 512, 256 o 128 dimensiones con pérdida de precisión prácticamente nula según el autor. La ventana de contexto máxima es de 8.192 tokens, aunque el autor indica que las pruebas se realizaron con 512 tokens para títulos y URLs de pestañas.

Es relevante ahora porque demuestra un caso de uso muy concreto de embeddings ligeros desplegables en el navegador mediante WebGPU y Transformers.js, con licencia Apache 2.0 y formato ONNX INT8, lo que reduce la barrera para aplicaciones de privacidad local sin servidor. No obstante, el modelo tiene solo 16 descargas y 0 likes en el momento de la consulta, por lo que su validación externa es todavía muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base `google/embeddinggemma-2`), encoder de texto y código |
| Parametros totales | 271.002.648 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (pruebas realizadas con 512 tokens) |
| Tipos de cuantizacion | ONNX INT8, bfloat16 (entrenamiento), safetensors |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |
| Dimension nativa | 768 |
| Dimensiones Matryoshka | 768, 512, 256, 128 (recomendada 128) |
| Funcion de perdida | `MultipleNegativesRankingLoss` envuelta en `MatryoshkaLoss` |
| Precision de entrenamiento | bfloat16 en NVIDIA RTX A6000 (48 GB) |
| Modelo base | `google/embeddinggemma-2` |
| Checkpoint base del autor | `Anshulgada/embeddinggemma-2-270m` |
| Pipeline | sentence-similarity |
| Tamano del repositorio | 1,1 GB |

## Arquitectura y entrenamiento

El modelo parte del backbone transformer de `google/embeddinggemma-2`, un encoder de aproximadamente 270 millones de parámetros orientado a extracción de características y similitud semántica. Sobre él se aplicó un fine-tuning con 18.000 tripletes contrastivos estratificados en 18 verticales web distintas (documentación de APIs, DevOps, frontend, backend y bases de datos, machine learning, productividad, localhost, foros, empleo, diseño, finanzas, streaming de vídeo, audio, comercio electrónico, noticias, viajes, gaming e investigación académica). La pérdida combina `MultipleNegativesRankingLoss` con `MatryoshkaLoss`, calculando penalizaciones de forma simultánea en 768, 512, 256 y 128 dimensiones.

La innovación principal es el uso de Matryoshka Representation Learning (MRL, arXiv:2205.13147), que permite truncar los embeddings por delante (`embedding[:128]`) conservando la geometría de agrupamiento semántico. Según la model card, el truncado de 768d a 128d no produce pérdida de precisión en la suite de 1.800 tripletes de prueba, reduciendo el almacenamiento y el coste de cálculo de distancias en un 83,3%. El entrenamiento se realizó en bfloat16 puro sobre una NVIDIA RTX A6000. No se detalla el número total de tokens de entrenamiento ni si hubo fases de RLHF o DPO, algo esperable en un modelo de embeddings.

## Capacidades

- Generación de embeddings de frases y documentos para similitud semántica y extracción de características.
- Búsqueda semántica sobre títulos de pestañas, URLs e historial web.
- Agrupación jerárquica de pestañas y clustering de URLs por vertical temático.
- Clasificación zero-shot (etiqueta `zero-shot-classification` en los tags del repositorio).
- Embeddings truncables a 768, 512, 256 y 128 dimensiones mediante MRL.
- Ejecución en navegador mediante Transformers.js y WebGPU (formato ONNX INT8).
- Soporte de código y documentación técnica dentro del dominio de desarrollo web.
- Capacidades multilingües limitadas: el modelo declara únicamente inglés.

## Casos de uso

- Organización automática de pestañas en el navegador: la extensión Tabman calcula embeddings de cada título y URL con el modelo en WebGPU INT8 (unos 270 MB de memoria y 8-15 ms por pestaña), agrupa pestañas semánticamente relacionadas y las presenta al usuario sin enviar datos a un servidor.
- Búsqueda semántica en el historial web: con vectores de 128 dimensiones (unos 5,1 MB para 10.000 pestañas), el modelo permite indexar y recuperar páginas por significado en lugar de por coincidencia exacta de palabras clave, manteniendo el índice en memoria del navegador.
- Clasificación zero-shot de contenido web: asignar verticales (finanzas, viajes, documentación, foros) a páginas nuevas sin entrenamiento adicional, usando similitud entre el embedding de la página y descripciones textuales de cada categoría.
- Descubrimiento de recursos técnicos: agrupar PRs de GitHub, preguntas de StackOverflow y papers de ArXiv por tema afín para un desarrollador que investiga un problema concreto, aprovechando el rendimiento del modelo en documentación de APIs y foros.
- Indexación centralizada multi-navegador: desplegar el modelo en PyTorch CUDA BF16 (unos 600 MB de VRAM, menos de 2 ms por pestaña y más de 1.500 pestañas por segundo) en un servidor local o de la LAN para sincronizar índices entre varios navegadores o dispositivos.
- Deduplicación y limpieza de sesiones: detectar pestañas redundantes o casi idénticas (misma documentación abierta en distintas URLs) mediante umbrales de similitud coseno sobre embeddings truncados a 256 o 128 dimensiones.
- Fallback en CPU sin WebGPU: usar ONNX INT8 con onnxruntime en equipos sin GPU discreta, con 30-45 ms por pestaña y unas 25 pestañas por segundo, suficiente para indexación en segundo plano.

## Benchmarks y rendimiento

Los datos de la model card provienen de una evaluación propia del autor sobre 1.800 tripletes de prueba retenidos, estratificados en 18 dominios web. No son benchmarks estándar de la comunidad (MMLU, MTEB, etc.) y no se han contrastado de forma independiente.

| Dimension de salida | Precision (%) | Margen coseno medio | Tamano relativo | RAM de vectores / 10.000 pestañas |
|---|---|---|---|---|
| 768d (nativa) | 98,50 | +0,6074 | 1,00x | ~30,7 MB |
| 512d | 98,50 | +0,6077 | 0,67x | ~20,5 MB |
| 256d | 98,44 | +0,6051 | 0,33x | ~10,2 MB |
| 128d (recomendada) | 98,50 | +0,6074 | 0,17x | ~5,1 MB |

Rendimiento por dominio según el autor: 100,0% de precisión en 17 de los 18 dominios (documentación de APIs, cloud y DevOps, frontend, backend y bases de datos, ML e IA, productividad, localhost, foros, empleo, diseño, finanzas, streaming de vídeo, audio, comercio electrónico, noticias, viajes y gaming) y entre 72,7% y 75,8% en investigación académica densa de ArXiv (CS y matemáticas) con terminología solapada.

Matriz de despliegue declarada por el autor:

| Entorno | Formato / motor | Memoria / VRAM | Latencia por pestaña | Throughput |
|---|---|---|---|---|
| Extensión de navegador | WebGPU INT8 ONNX (Transformers.js) | ~270 MB | 8-15 ms | ~80 pestañas/s |
| CPU local (fallback) | INT8 ONNX (onnxruntime) | ~280 MB | 30-45 ms | ~25 pestañas/s |
| Servidor remoto / LAN | PyTorch CUDA BF16 | ~600 MB | <2 ms | >1.500 pestañas/s |

No se han publicado resultados en benchmarks estándar de la comunidad (MTEB, MMLU u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 600 MB en PyTorch CUDA BF16; unos 270-280 MB en ONNX INT8 (WebGPU o CPU).
- GPU recomendadas: cualquier GPU con soporte WebGPU para el despliegue en navegador; NVIDIA RTX A6000 (48 GB) fue la usada en entrenamiento; para servidor, una GPU CUDA con al menos 1 GB de VRAM libre es suficiente dado el tamaño del modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna con CUDA (por ejemplo, RTX 3060 en adelante) e incluso en GPUs integradas vía WebGPU; el modelo es de 270M parámetros.
- Opciones de despliegue: Transformers.js con WebGPU (navegador), onnxruntime (CPU), sentence-transformers con PyTorch (CUDA o CPU), y el script `serve_embeddings.py` mencionado en la model card para servidor remoto o LAN.
- Latencia y throughput estimados: 8-15 ms por pestaña y ~80 pestañas/s en WebGPU INT8; 30-45 ms y ~25 pestañas/s en CPU INT8; menos de 2 ms y más de 1.500 pestañas/s en servidor CUDA BF16 (cifras declaradas por el autor, no verificadas de forma independiente).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Dimension | Notas |
|---|---|---|---|---|---|---|
| Tabman EmbeddingGemma 2 270M | ~271 M | 8.192 tokens | Inglés | Apache 2.0 | 768 (MRL hasta 128) | Fine-tuning para pestañas web; despliegue en navegador vía ONNX/WebGPU |
| google/embeddinggemma-2 | ~270 M (según la model card) | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada | Modelo base del que deriva; sin datos de benchmarks en la información disponible |
| Otros modelos de embeddings de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos verificados en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas concretas de la misma categoría (por ejemplo, modelos de embeddings de 100-500 M parámetros con soporte MRL) más allá del modelo base. Cualquier comparación numérica adicional requeriría datos de benchmarks que no se han proporcionado.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; su uso en castellano u otros idiomas no está validado y probablemente degrade la calidad de los embeddings.
- El rendimiento en investigación académica densa (ArXiv CS/Math) cae al 72,7-75,8%, muy por debajo del 100% en el resto de dominios, por lo que no es fiable para clustering de papers con terminología solapada.
- Los benchmarks son autoinformados por el autor sobre un conjunto de prueba propio de 1.800 tripletes; no hay validación independiente ni resultados en MTEB u otros estándares.
- El modelo tiene muy poca tracción: 16 descargas y 0 likes en el momento de la consulta, lo que limita la evidencia de uso en producción.
- Riesgo de alucinación no aplicable en sentido estricto (es un modelo de embeddings, no generativo), pero sí riesgo de agrupaciones erróneas cuando el contenido de la pestaña es ambiguo o muy corto (títulos genéricos, URLs opacas).
- Aunque la licencia es Apache 2.0 y permite uso comercial, conviene verificar las condiciones del modelo base `google/embeddinggemma-2`, ya que la model card no detalla posibles restricciones heredadas.
- El contexto máximo es de 8.192 tokens, pero el autor solo probó con 512 tokens; el comportamiento con documentos largos no está validado.
- El despliegue en navegador depende de WebGPU, con soporte desigual entre navegadores y versiones; el fallback en CPU multiplica la latencia por 3-5 veces.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Anshulgada/tabman-embeddinggemma-2-270m
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Checkpoint base del autor: https://huggingface.co/Anshulgada/embeddinggemma-2-270m
- Repositorio Tabman (Brave Tab Manager): https://github.com/Anshulgada/brave-tab-manager
- Paper de Matryoshka Representation Learning: https://arxiv.org/abs/2205.13147
- Documentación de Sentence-Transformers: https://sbert.net/
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js
