# keystats/Aware_ocr

## Resumen

Aware_ocr es un modelo multimodal de tipo image-text-to-text publicado en Hugging Face por el usuario keystats. El repositorio contiene pesos en formato safetensors con 8.292.166.656 parámetros totales (unos 8,29 mil millones) y un tamaño de 16,6 GB, lo que corresponde a pesos almacenados en precisión de 16 bits sin cuantizar. La etiqueta de arquitectura declarada en el Hub es qwen2_5_vl, de modo que el modelo parte de la familia Qwen2.5-VL, aunque el autor no documenta este extremo en la model card. El nombre del repositorio sugiere un ajuste orientado a OCR y comprensión de documentos, pero se trata de una inferencia a partir del identificador, no de un dato confirmado.

El problema que parece abordar es el reconocimiento óptico de caracteres y la extracción de información estructurada a partir de imágenes dentro de un flujo conversacional, ya que la pipeline declarada combina entrada de imagen y texto con salida de texto. Es relevante para quien busque un modelo de aproximadamente 8B parámetros capaz de ejecutarse en una única GPU de gama alta y de integrarse en pipelines de digitalización documental o de atención al cliente con imágenes adjuntas.

La información pública disponible es, sin embargo, muy limitada: la model card es la plantilla automática de Hugging Face y no contiene ni un solo campo completado, no se declara licencia, no se indican idiomas soportados, no hay resultados de evaluación y el repositorio acumula 0 descargas y 0 likes en el momento de la consulta. Cualquier evaluación seria del modelo exige, por tanto, una validación empírica propia antes de considerarlo para producción. Las fechas del repositorio (creación 2026-09-13) constan así en el Hub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la model card; la etiqueta de libreria del Hub indica qwen2_5_vl (transformer multimodal de la familia Qwen2.5-VL, sin confirmar por el autor) |
| Parametros totales | 8.292.166.656 (aproximadamente 8,29 mil millones), dato real de los safetensors |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE; no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo contiene safetensors sin cuantizar (16,6 GB, compatible con bf16/fp16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el Hub no declara licencia) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura concreta ni sobre el procedimiento de entrenamiento. La model card del repositorio es la plantilla generica de Hugging Face y todos sus campos figuran como "[More Information Needed]", incluidos los de datos de entrenamiento, hiperparametros, regimen de precision y procedimiento de ajuste. Tampoco se documenta si hubo ajuste fino supervisado, RLHF, DPO u otra fase de alineamiento.

Los unicos indicios tecnicos disponibles son las etiquetas del Hub: qwen2_5_vl, que apunta a la arquitectura de vision-lenguaje de la familia Qwen2.5-VL (transformer con encoder visual y decodificador de lenguaje, resolucion dinamica de imagen y ventana de contexto larga en el modelo base), e image-text-to-text, que confirma la modalidad de entrada y salida. Dado que los parametros totales (8,29B) no coinciden exactamente con ninguna medida comercial habitual de la familia Qwen2.5-VL (7B y 72B en las variantes mas conocidas), es plausible que se trate de un ajuste fino sobre una variante de 7B con vocabulario o cabeceras modificadas, o de un merge, pero esto no puede confirmarse con la informacion disponible.

## Capacidades

No hay ninguna capacidad documentada por el autor. A partir de la pipeline declarada y del identificador del repositorio, cabe esperar de forma no verificada:

- Generacion de texto condicionada por imagen (image-text-to-text), es decir, respuestas en lenguaje natural a partir de una o varias imagenes mas un prompt.
- Reconocimiento optico de caracteres (OCR) y extraccion de texto de documentos, segun sugiere el nombre Aware_ocr.
- Uso conversacional multi-turno, ya que el Hub etiqueta el modelo como conversational.
- Comprension de documentos con estructura (tablas, formularios, recibos, facturas), como capacidad plausible heredada de la familia Qwen2.5-VL, no confirmada.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declara ninguna lista de idiomas.
- Modo de razonamiento explicito (thinking mode), audio o video: no disponible.

## Casos de uso

Los siguientes escenarios son aplicaciones plausibles dado el tipo de modelo y su tamano, pero ninguno esta validado por el autor y requieren prueba previa:

- Digitalizacion de facturas y recibos: el modelo puede recibir la imagen del documento y devolver los campos relevantes en texto o JSON para su volcado en un ERP, siempre que se valide su precision en documentos reales de la empresa.
- Extraccion de datos de formularios manuscritos o impresos: en entornos administrativos o sanitarios, se le puede pedir la transcripcion de campos concretos y una marca de confianza, con revision humana posterior.
- Indexacion de archivos escaneados para busqueda interna: convertir lotes de PDF e imagenes en texto plano permite despues alimentar un motor de busqueda o un sistema RAG sobre documentacion historica de la organizacion.
- Atencion al cliente con imagenes adjuntas: un asistente puede interpretar capturas de pantalla, fotos de producto o tickets enviados por el usuario y responder en el mismo hilo conversacional.
- Verificacion de documentos en procesos KYC: comprobacion de que los datos transcritos de un DNI, nomina o certificado coinciden con los introducidos manualmente, como paso de pre-validacion antes de la revision humana.
- Accesibilidad: transcripcion de imagenes con texto (carteles, menus, etiquetas) a voz o texto para personas con discapacidad visual, integrado en una aplicacion movil o de escritorio.
- Moderacion y clasificacion de contenido grafico con texto: deteccion de texto no permitido en imagenes subidas por usuarios en plataformas, como filtro previo a la revision manual.
- Enriquecimiento de catalogos de producto: extraccion automatica de especificaciones desde fotos de etiquetas o fichas tecnicas escaneadas para poblar bases de datos de e-commerce.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye seccion de evaluacion completada, no hay resultados de MMLU, HumanEval, GSM8K, DocVQA, TextVQA, OCRBench ni de ninguna otra prueba, y la busqueda web realizada no ha devuelto documentacion tecnica asociada al modelo. Tampoco existen metricas de latencia o throughput declaradas por el autor.

## Requisitos de hardware

Estimaciones calculadas a partir del recuento real de parametros (8,29B) y del tamano del repositorio (16,6 GB); no son cifras publicadas por el autor.

- Pesos en bf16/fp16: aproximadamente 16,6 GB, que con cache KV y activaciones se traduce en unos 20-24 GB de VRAM para inferencia comoda.
- Cuantizacion int8: alrededor de 8,3 GB de pesos, con un consumo total estimado de 12-14 GB de VRAM.
- Cuantizacion de 4 bits (GPTQ, AWQ o NF4): alrededor de 4,5-5 GB de pesos, con un consumo total estimado de 7-9 GB de VRAM. Requiere convertir los pesos, ya que el repositorio solo incluye safetensors sin cuantizar.
- GPU profesionales: A100 40 GB, A100 80 GB, H100, L40S o A6000 funcionan sin problema en bf16.
- GPU de consumo: RTX 3090 o RTX 4090 (24 GB) pueden alojar el modelo en bf16 con margen ajustado; RTX 4080 (16 GB) exige int8 o 4 bits; tarjetas de 12 GB como la RTX 3060 solo admiten 4 bits y con secuencias cortas.
- Apple Silicon: equipos con memoria unificada de 32 GB o superior pueden ejecutar el modelo en bf16 mediante MLX o llama.cpp, si se generan los pesos convertidos.
- Opciones de despliegue: transformers (libreria declarada), Text Generation Inference (el Hub marca endpoints_compatible), vLLM y SGLang en versiones con soporte de Qwen2.5-VL. llama.cpp y Ollama solo son viables si se genera previamente un GGUF, que el repositorio no incluye.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La informacion sobre modelos alternativos procede de sus respectivas fichas publicas y no se ha verificado en el contexto de esta ficha; los datos del propio Aware_ocr son los unicos confirmados aqui. Ante la ausencia total de benchmarks del modelo analizado, la comparacion es estructural y no de rendimiento.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| keystats/Aware_ocr | 8,29B | no disponible | no disponible | Pesos safetensors, model card vacia, 0 descargas |
| Qwen/Qwen2.5-VL-7B-Instruct | aproximadamente 7B | no disponible en esta ficha | Apache 2.0 (segun su ficha publica) | Base probable del ajuste; documentacion y evaluaciones publicadas |
| GOT-OCR2.0 | aproximadamente 580M | no disponible en esta ficha | Apache 2.0 (segun su ficha publica) | Especializado en OCR end-to-end, mucho mas ligero |
| MiniCPM-V 2.6 | aproximadamente 8B | no disponible en esta ficha | licencia propia del proyecto, verificar antes de uso comercial | Alternativa multimodal de tamano comparable orientada a OCR y documentos |

No se dispone de datos de rendimiento comparado para Aware_ocr, por lo que no es posible establecer cual de estas opciones es superior en tareas de OCR o de comprension documental sin una evaluacion propia.

## Limitaciones y advertencias

- Ausencia de licencia declarada: sin licencia explicita, el uso comercial queda en una situacion juridica indeterminada. Es imprescindible contactar con el autor o abstenerse de usarlo en produccion.
- Model card vacia: no hay informacion sobre datos de entrenamiento, composicion del dataset, filtrado, sesgos ni limitaciones conocidas. Esto impide cualquier evaluacion de riesgo documentada.
- Riesgo de alucinacion: en tareas de OCR y extraccion de documentos, los modelos de vision-lenguaje tienden a inventar texto cuando la imagen es borrosa, esta rotada o contiene caracteres poco frecuentes. Toda salida destinada a sistemas transaccionales debe validarse.
- Idiomas no declarados: se desconoce si el modelo funciona correctamente en castellano o en otros idiomas; el rendimiento en alfabetos no latinos es una incognita.
- Longitud de contexto desconocida: no se puede planificar el procesamiento de documentos de multiples paginas sin medirla experimentalmente.
- Sesgos potenciales: al desconocerse el corpus de entrenamiento, no se pueden descartar sesgos en la interpretacion de documentos de determinados paises, idiomas o formatos.
- Repositorio sin validacion comunitaria: 0 descargas y 0 likes implican que no hay evidencia externa de funcionamiento correcto ni reportes de errores.
- Artefacto probablemente de ajuste personal: el nombre del autor y la ausencia de documentacion sugieren un experimento individual, no un modelo mantenido con soporte.
- Fechas del repositorio poco habituales: la creacion figura como 2026-09-13, lo que conviene verificar antes de integrarlo en un pipeline.
- Sin cuantizaciones oficiales: desplegarlo en hardware modesto exige convertir los pesos, con el consiguiente riesgo de degradacion de calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/keystats/Aware_ocr
- Articulo citado en la plantilla de la model card (calculadora de impacto ambiental, Lacoste et al. 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de machine learning referenciada en la plantilla: https://mlco2.github.io/impact
- Modelo base probable, para consultar documentacion y evaluaciones de referencia: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
