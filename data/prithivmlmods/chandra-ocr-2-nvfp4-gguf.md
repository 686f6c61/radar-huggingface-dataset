# prithivMLmods/chandra-ocr-2-NVFP4-GGUF

## Resumen

Chandra-OCR-2 es un modelo de OCR multimodal desarrollado por Datalab, especializado en convertir imágenes y documentos PDF en texto estructurado en formatos Markdown, HTML o JSON, preservando con precisión la información de maquetación (layout). Esta versión concretamente es una cuantización NVFP4 en formato GGUF realizada por prithivMLmods a partir del modelo base datalab-to/chandra-ocr-2, optimizada para su ejecución local con llama.cpp sobre hardware NVIDIA de la arquitectura Blackwell.

El modelo base se construye sobre la arquitectura Qwen3.5 y tiene aproximadamente 4.206 millones de parámetros (4.205.751.552 según los safetensors del repositorio). Su relevancia radica en que resuelve el problema clásico de los OCR tradicionales: la pérdida de estructura semántica en documentos complejos, como tablas con celdas combinadas, ecuaciones matemáticas, formularios con casillas de verificación o documentos multilingües. Según la model card, alcanza un 85,9 % en olmocr-bench y una puntuación multilingüe del 77,8 %, lo que supone una mejora de unos 12 puntos respecto a Chandra 1.

Es relevante ahora porque los pipelines de IA generativa necesitan ingestar documentos del mundo real (memorias financieras, artículos científicos, escaneos históricos, formularios multilingües) como datos estructurados de alta calidad, y este repositorio permite hacerlo localmente con un consumo de VRAM muy contenido (pico de 6,66 GiB en las pruebas publicadas).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (multimodal image-text-to-text) |
| Parametros totales | 4.205.751.552 (≈4,21 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | 16.384 tokens (contexto usado en las pruebas con llama.cpp) |
| Tipos de cuantizacion | NVFP4 (4,75 GB); proyeccion multimodal en archivo mmproj aparte (676 MB) |
| Idiomas soportados | 90+ idiomas segun la model card del modelo base; el repositorio etiqueta el idioma como "en" |
| Licencia | OpenRAIL (licencia del modelo base datalab-to/chandra-ocr-2) |
| Formato de pesos | GGUF (archivo principal NVFP4 + archivo mmproj para vision) |

## Arquitectura y entrenamiento

Chandra-OCR-2 es un modelo vision-language basado en la familia Qwen3.5, con un pipeline de tipo image-text-to-text: un encoder de vision (distribuido en el archivo mmproj de 676 MB) proyecta la imagen al espacio del modelo de lenguaje, que genera la salida estructurada. La cuantizacion NVFP4 es un formato de punto flotante de 4 bits optimizado para aceleradores NVIDIA recientes (arquitectura Blackwell), lo que reduce el tamaño del modelo a 4,75 GB manteniendo un equilibrio entre tamaño y rendimiento.

Sobre el entrenamiento del modelo base, la informacion disponible no detalla el numero de tokens ni la composicion del dataset. La model card indica que la decodificacion especulativa (MTP) esta desactivada en esta cuantizacion ("Speculative Decoding: No"). Los resultados publicados sugieren un entrenamiento orientado a OCR estructurado, con mejoras destacables en parseo de ecuaciones matematicas, reconstruccion de tablas complejas (incluidas celdas combinadas), reconocimiento de escritura a mano, elementos de formulario y extraccion de diagramas.

## Capacidades

- OCR de imagenes y PDFs con salida estructurada en Markdown, HTML o JSON, preservando la maquetacion original.
- Reconstruccion de tablas complejas, incluidas tablas con celdas combinadas.
- Parseo de ecuaciones matematicas.
- Reconocimiento de escritura a mano (handwriting).
- Deteccion e interpretacion de elementos de formulario, como casillas de verificacion (checkboxes).
- Gestion de documentos anchos (wide-document layouts) y extraccion de diagramas.
- Descripcion de imagenes (image captioning) mejorada respecto a la version anterior.
- Soporte multilingue: 90+ idiomas segun la model card del modelo base.
- Soporte de vision nativo en llama.cpp mediante el archivo mmproj (`--mmproj`).
- No se ha documentado soporte de tool calling ni de agentes en la informacion disponible.

## Casos de uso

- Digitalizacion de archivos historicos: escaneos antiguos o de baja calidad pueden transformarse en Markdown estructurado, aprovechando el reconocimiento de escritura a mano y la preservacion de layout.
- Ingesta de documentacion financiera: memorias anuales y estados contientes con tablas complejas (incluidas celdas combinadas) se convierten en JSON o HTML listos para analisis automatizado.
- Procesamiento de articulos cientificos: las ecuaciones matematicas y los diagramas se extraen con fidelidad, facilitando la construccion de corpus para investigacion o RAG.
- Automatizacion de formularios: los checkboxes y campos de formularios multilingues se interpretan correctamente, util en flujos de back-office y validacion documental.
- Preparacion de datos para pipelines de IA: la salida en Markdown/JSON semantically rica permite indexar documentos en bases vectoriales para sistemas RAG de alta calidad.
- Despliegue local en estaciones de trabajo con GPU: gracias a la cuantizacion NVFP4 (pico de 6,66 GiB de VRAM), el modelo cabe en GPUs de gama alta de consumo y profesionales, sin depender de APIs externas.
- Procesamiento de documentos multilingues: con soporte de 90+ idiomas, es adecuado para organizaciones que gestionan documentacion en multiples lenguas.

## Benchmarks y rendimiento

Resultados publicados en la model card del modelo base (datalab-to/chandra-ocr-2):

| Benchmark | Puntuacion |
|---|---|
| olmocr-bench | 85,9 % |
| Multilingual score | 77,8 % (+12 % sobre Chandra 1) |

No se han publicado comparativas directas con otros modelos en la informacion disponible.

Rendimiento medido de esta cuantizacion NVFP4 (llama.cpp, RTX PRO 6000 Blackwell, 96 GB VRAM, 3 ejecuciones):

| Metrica | Valor |
|---|---|
| Velocidad media de procesamiento del prompt | 2.957,14 tokens/s |
| Velocidad media de generacion | 192,13 tokens/s |
| Wall time medio | 8,98 s |
| Wall time total | 26,9 s |
| Uso pico de VRAM | 6,66 GiB |
| Utilizacion pico de GPU | 88 % |

## Requisitos de hardware

- VRAM estimada para inferencia: 6,66 GiB de pico con la cuantizacion NVFP4 y contexto de 16.384 tokens (KV cache K en q8_0), segun las pruebas publicadas. Sumando el mmproj (676 MB), el conjunto ronda los 5,4 GB del repositorio.
- GPU recomendada: NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB) fue la GPU usada en las pruebas; el formato NVFP4 esta optimizado para aceleradores Blackwell.
- Consumer GPU: el pico de 6,66 GiB indica que el modelo cabe con holgura en GPUs de consumo con 8 GB o mas de VRAM (por ejemplo, RTX 3060 Ti 8 GB, RTX 4070, RTX 4090), aunque el rendimiento optimo del formato NVFP4 se espera en hardware Blackwell; en arquitecturas anteriores el comportamiento de NVFP4 no ha sido documentado.
- Despliegue: llama.cpp / llama-cli (inference nativa probada con `--mmproj` y `-ngl 99`); el modelo base tambien esta disponible para Hugging Face Transformers y vLLM. No se documenta compatibilidad con Ollama o TGI en la informacion disponible.
- Latencia y throughput: 192,13 tokens/s de generacion y 2.957,14 tokens/s de procesamiento de prompt en la configuracion probada; sin decodificacion especulativa.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| chandra-ocr-2-NVFP4-GGUF (este) | ≈4,21 B | GGUF NVFP4 | 16.384 tokens (probado) | OpenRAIL | OCR estructurado, 90+ idiomas, 85,9 % olmocr |
| Chandra OCR 1 (datalab-to) | no disponible | no disponible | no disponible | no disponible | Version anterior; +12 % peor en benchmark multilingue |
| olmOCR (allenai) | no disponible | no disponible | no disponible | no disponible | Modelo de referencia del benchmark olmocr-bench usado para evaluar Chandra |

No se dispone de datos suficientes en la informacion proporcionada para una comparativa numerica detallada con alternativas como olmOCR, Marker, GOT-OCR o Nougat.

## Limitaciones y advertencias

- El formato NVFP4 esta optimizado para aceleradores NVIDIA Blackwell; en GPUs de arquitecturas anteriores el rendimiento o la compatibilidad no estan documentados en este repositorio.
- El repositorio etiqueta el idioma como "en", aunque la model card del modelo base anuncia soporte de 90+ idiomas; el rendimiento real por idioma no ha sido verificado en la informacion disponible.
- No hay soporte de decodificacion especulativa (MTP desactivado), lo que puede limitar el throughput frente a configuraciones con MTP.
- Como todo modelo generativo aplicado a OCR, puede alucinar contenido en zonas ilegibles o ambiguas del documento; se recomienda validacion en documentos criticos (financieros, legales).
- La licencia OpenRAIL del modelo base incluye restricciones de uso; conviene revisar la licencia completa en el repositorio de datalab-to/chandra-ocr-2 antes de uso comercial.
- Las metricas de rendimiento publicadas corresponden a una configuracion concreta de hardware y software; los resultados reales variaran segun imagen, build y ajustes del runtime.
- No se documenta soporte de tool calling, agentes ni capacidades de razonamiento generalista: es un modelo especializado en OCR y comprension documental.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/prithivMLmods/chandra-ocr-2-NVFP4-GGUF
- Modelo base: https://huggingface.co/datalab-to/chandra-ocr-2
- Licencia del modelo base: https://huggingface.co/datalab-to/chandra-ocr-2/blob/main/LICENSE
- Archivo principal NVFP4: https://huggingface.co/prithivMLmods/chandra-ocr-2-NVFP4-GGUF/blob/main/chandra-ocr-2-NVFP4.gguf
- Archivo mmproj (vision): https://huggingface.co/prithivMLmods/chandra-ocr-2-NVFP4-GGUF/blob/main/chandra-ocr-2.mmproj.gguf
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Autor de la cuantizacion: https://huggingface.co/prithivMLmods
