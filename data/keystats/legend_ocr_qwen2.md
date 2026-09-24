# keystats/Legend_ocr_qwen2

## Resumen

El repositorio `keystats/Legend_ocr_qwen2` aloja un modelo de visión-lenguaje publicado por el usuario `keystats` en HuggingFace. Según los metadatos del repositorio, el checkpoint contiene 8.291.375.616 parámetros (~8,3 B) almacenados en formato `safetensors`, con un tamaño total de repositorio de 16,6 GB, lo que es coherente con un guardado en precisión bf16/fp16. El pipeline declarado es `image-text-to-text` y entre las etiquetas figura `qwen2_vl`, lo que apunta a que el modelo deriva de la familia Qwen2-VL (arquitectura transformer multimodal con codificador visual y torre de lenguaje), aunque el autor no lo confirma en ninguna parte del repositorio.

El nombre del modelo (`Legend_ocr_qwen2`) sugiere un ajuste fino orientado a reconocimiento óptico de caracteres (OCR) o extracción de texto a partir de imágenes y documentos. Sin embargo, la model card publicada es la plantilla automática de HuggingFace sin rellenar: todos los campos (autoría, financiación, tipo de modelo, idiomas, licencia, datos de entrenamiento, hiperparámetros y evaluación) aparecen como `[More Information Needed]`. No hay paper, demo, repositorio de código ni documentación adicional enlazada.

La relevancia práctica de este checkpoint es por tanto limitada y condicionada: se trata de una publicación con 7 descargas y 0 likes en el momento de la consulta, sin validación por parte de la comunidad y con licencia no declarada. Cualquier uso en producción exigiría auditar primero los pesos, verificar el comportamiento cualitativo y resolver la ambigüedad legal de la licencia. La etiqueta `arxiv:1910.09700` del repositorio no corresponde a un paper del modelo, sino a la referencia del calculador de impacto de carbono (Lacoste et al., 2019) que aparece citada en la plantilla de model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No confirmada por el autor; la etiqueta del repositorio (`qwen2_vl`) indica una arquitectura vision-lenguaje de la familia Qwen2-VL (transformer multimodal con codificador visual y modelo de lenguaje) |
| Parametros totales | 8.291.375.616 (~8,29 B), dato leido de los pesos `safetensors` |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo contiene pesos `safetensors`, no se publican variantes GGUF, AWQ, GPTQ ni bitsandbytes |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | `safetensors` (libreria declarada: `transformers`) |
| Pipeline declarado | `image-text-to-text` |
| Tamano del repositorio | 16,6 GB |
| Fecha de creacion (metadato) | 2026-09-24T02:48:08Z (fecha anomala, ver limitaciones) |
| Ultima actualizacion (metadato) | 2026-09-24T02:49:07Z |
| Descargas / likes | 7 / 0 |

## Arquitectura y entrenamiento

No hay informacion publicada por el autor sobre la arquitectura interna, el proceso de entrenamiento ni los datos utilizados. La unica evidencia disponible es la etiqueta `qwen2_vl` del repositorio y el pipeline `image-text-to-text`, que situan el checkpoint en el espacio de los modelos vision-lenguaje derivados de Qwen2-VL. Ese linaje implica, de confirmarse, una arquitectura transformer compuesta por un codificador visual tipo ViT con conexion al modelo de lenguaje mediante proyeccion de tokens visuales, capaz de procesar imagenes de resolucion variable. No obstante, no se puede verificar que se hayan conservado el tokenizador, la configuracion de atencion ni la ventana de contexto del modelo base, ya que el autor no publica `config.json` comentado, informe de entrenamiento ni receta de ajuste.

Tampoco consta el numero de tokens de entrenamiento, la composicion del dataset de OCR (documentos escaneados, capturas, formularios, texto manuscrito, etc.), ni si se emplearon tecnicas de alineacion como SFT, DPO o RLHF. La model card mantiene la seccion de hiperparametros y regimen de entrenamiento sin rellenar, y el campo `finetuned from model` esta vacio, por lo que se desconoce incluso el checkpoint exacto de partida. Dado que el repositorio se creo y actualizo en un intervalo de aproximadamente un minuto, es plausible que se trate de la subida automatica del resultado de un pipeline de ajuste fino, pero esto es una hipotesis y no un dato confirmado.

## Capacidades

Las capacidades que se enumeran a continuacion se derivan del pipeline declarado (`image-text-to-text`) y del nombre del modelo, y no han sido verificadas por el autor ni por evaluaciones independientes:

- Lectura y transcripcion de texto presente en imagenes, presumiblemente orientada a OCR sobre documentos escaneados, capturas de pantalla y fotografias.
- Generacion de texto condicionada por imagen, es decir, respuestas en lenguaje natural sobre el contenido visual de la entrada.
- Conversacion multimodal multi-turno: la etiqueta `conversational` del repositorio indica que el checkpoint esta preparado para plantillas de chat con historial.
- Respuestas a preguntas sobre documentos (`document visual question answering`), como capacidad esperable del pipeline, no confirmada.
- Soporte de `tool calling` / `function calling`: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declara el conjunto de idiomas soportados).
- Modo de razonamiento explicito (`thinking mode`), audio u otras modalidades adicionales: no disponible.
- Compatibilidad declarada con `text-generation-inference` y con endpoints compatibles (`endpoints_compatible`), lo que sugiere que puede servirse mediante TGI si la arquitectura esta soportada.

## Casos de uso

Los siguientes escenarios son aplicaciones plausibles dado el perfil declarado del modelo; ninguno ha sido validado con pruebas publicadas y deberian verificarse antes de llevarlos a produccion:

- Digitalizacion de archivos y facturas: el modelo puede recibir la imagen de un documento escaneado y devolver el texto transcrito o los campos estructurados, reduciendo el trabajo manual en procesos de captura de datos. Requiere validacion previa de la tasa de error por tipo de documento.
- Extraccion de campos en formularios (KYC, seguros, banca): alimentar la imagen del formulario y pedir en el prompt la devolucion de un JSON con los campos de interes, aprovechando la capacidad de instruccion conversacional.
- Indexacion y busqueda semantica de documentos escaneados: usar el modelo como paso de OCR en un pipeline de ingesta hacia un motor de busqueda o un sistema RAG, generando texto plano a partir de PDFs y fotografias.
- Accesibilidad: descripcion y lectura en voz alta del contenido textual de imagenes (carteles, menus, etiquetas de producto) para usuarios con discapacidad visual, integrado en una aplicacion movil.
- Analisis de documentos tecnicos y manuales: pregunta-respuesta sobre planos, diagramas o tablas de especificaciones en los que el texto aparece embebido en una imagen.
- Moderacion y verificacion de contenido visual: comprobacion de que una captura contiene el texto declarado (por ejemplo, validacion de pantallazos de pago o de confirmaciones en flujos de soporte).
- Preprocesado en un pipeline de CI de datos: transcripcion por lotes de un corpus de imagenes antes de entrenar otros modelos, siempre que el licenciamiento del checkpoint se aclare.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor mantiene la seccion de evaluacion sin rellenar y no incluye resultados de MMLU, HumanEval, GSM8K, DocVQA, TextVQA, OCRBench ni de ninguna otra prueba. Tampoco se aportan mediciones de latencia o throughput.

## Requisitos de hardware

Estimaciones calculadas a partir del recuento de parametros (8,29 B) y del tamano del repositorio (16,6 GB); no proceden de mediciones publicadas por el autor:

- Precision completa (bf16/fp16): los pesos ocupan aproximadamente 16,6 GB, por lo que la inferencia necesita del orden de 20-24 GB de VRAM contando cache KV y overhead del runtime.
- Cuantizacion a 8 bits: del orden de 8,5-10 GB de VRAM.
- Cuantizacion a 4 bits: del orden de 5-7 GB de VRAM.
- GPU de datacenter recomendadas: A100 40 GB, H100, L40S o A6000 para servicio concurrente en bf16 con contextos largos.
- GPU de consumo: una RTX 4090 o RTX 3090 (24 GB) puede alojar el modelo en bf16 con margen ajustado; una RTX 4080 o 3080 (16 GB) requiere cuantizacion de 8 bits o inferior; una RTX 3060 (12 GB) o similares exigen 4 bits.
- Despliegue: `transformers` como opcion base; `text-generation-inference` (TGI) aparece como etiqueta del repositorio; vLLM es una alternativa si la arquitectura vision-lenguaje esta soportada por la version instalada. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, algo que no se ha publicado.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo de preprocesado de imagen.

## Comparativa con modelos similares

Los comparadores naturales de este checkpoint son los modelos vision-lenguaje abiertos del mismo orden de parametros, como Qwen2-VL-7B-Instruct (familia de la que parece derivar), Qwen2.5-VL-7B-Instruct o InternVL2-8B. No obstante, la informacion proporcionada no incluye datos verificados sobre ninguno de ellos, por lo que la comparacion cuantitativa no puede completarse.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad de datos |
|---|---|---|---|---|
| keystats/Legend_ocr_qwen2 | 8,29 B | No disponible | No disponible | Model card vacia, sin benchmarks |
| Qwen2-VL-7B-Instruct (comparador probable) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |
| Qwen2.5-VL-7B-Instruct | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |
| InternVL2-8B | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |

La unica conclusion defendible con los datos disponibles es que `Legend_ocr_qwen2` parte de una base de adopcion nula (7 descargas, 0 likes) y sin documentacion, frente a los modelos de referencia de su categoria, que cuentan con model cards completas y evaluaciones publicadas.

## Limitaciones y advertencias

- Model card vacia: no hay informacion sobre datos de entrenamiento, sesgos, casos de uso previstos ni uso fuera de alcance. Cualquier despliegue parte de cero en cuanto a trazabilidad.
- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial ni para redistribucion. Ademas, al ser presumiblemente un derivado de Qwen2-VL, las obligaciones de la licencia del modelo base (que varian segun el tamano y la version) podrian seguir aplicando y no estan documentadas aqui.
- Riesgo de alucinacion en OCR: los modelos vision-lenguaje tienden a completar texto plausible cuando la imagen es de baja calidad, esta rotada o contiene tablas complejas. Sin benchmarks de OCR publicados no hay forma de acotar la tasa de error.
- Idiomas no declarados: se desconoce si el ajuste se hizo sobre un corpus monolingue o multilingue, lo que afecta directamente a la calidad en castellano.
- Contexto y resolucion de imagen no documentados: se desconoce la ventana de contexto efectiva y la resolucion visual soportada, factor critico en OCR de documentos densos.
- Sin validacion de la comunidad: 7 descargas y 0 likes implican que no hay evidencia externa de que los pesos carguen correctamente ni de que el modelo funcione como su nombre sugiere.
- Metadatos anomalos: las fechas de creacion y actualizacion (24/09/2026) son posteriores al periodo habitual de publicacion de la familia Qwen2-VL (2024) y estan separadas por apenas un minuto, lo que sugiere una subida automatizada o un error de metadatos. Conviene verificar la integridad del repositorio.
- Procedencia de los pesos: al no indicarse el checkpoint base ni el pipeline de entrenamiento, no se puede descartar que el ajuste se haya realizado sobre datos con restricciones de uso o con contenido sensible.
- Etiqueta `arxiv:1910.09700` enganosa: corresponde al paper del calculador de impacto de carbono citado en la plantilla, no a una publicacion sobre este modelo.
- Sin cuantizaciones oficiales: cualquier despliegue en GPU de consumo exige generar las cuantizaciones por cuenta propia y validarlas despues.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/keystats/Legend_ocr_qwen2
- Perfil del autor en HuggingFace: https://huggingface.co/keystats
- Referencia citada en la etiqueta `arxiv:1910.09700` (calculador de impacto de carbono, no vinculada al modelo): https://arxiv.org/abs/1910.09700
- Paper, blog, repositorio de codigo o demo del modelo: no disponibles.
