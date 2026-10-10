# mradermacher/LightOnOCR-3-4B-i1-GGUF

## Resumen

LightOnOCR-3-4B-i1-GGUF es una redistribución en formato GGUF del modelo lightonai/LightOnOCR-3-4B, publicada por el usuario mradermacher. Se trata de una familia de cuantizaciones (denominadas "i1", generadas con fichero imatrix) de un modelo de visión-lenguaje de 4.205.751.296 parámetros (aproximadamente 4,2 mil millones) especializado en OCR, comprensión de documentos, localización visual de elementos y extracción de tablas y formularios. El repositorio no contiene el modelo original, sino sus pesos convertidos y comprimidos para su uso con llama.cpp y derivados.

El modelo base lo desarrolla LightOn (lightonai), y su propósito es resolver tareas de digitalización y estructuración de documentos: leer texto de imágenes, preservar el diseño, interpretar tablas y formularios y responder preguntas sobre el contenido de una página. La versión aquí descrita está pensada para entornos donde no se dispone de GPU de gran capacidad, ya que las cuantizaciones ocupan entre 1,5 GB y 3,6 GB, frente a los 53,4 GB del repositorio completo.

La relevancia de esta publicación radica en que traslada un modelo de documento de tamaño medio al ecosistema GGUF, lo que permite ejecutarlo en hardware de consumo y en despliegues locales sin conexión. La licencia Apache 2.0 del modelo base facilita su uso comercial, si bien el idioma declarado es únicamente el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de vision-lenguaje; la model card no detalla la arquitectura interna) |
| Parametros totales | 4.205.751.296 (4,2 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, IQ3_XXS, Q2_K, Q3_K_S, IQ3_XS, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (variantes i1 con imatrix) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base esta en safetensors |
| Modelo base | lightonai/LightOnOCR-3-4B |
| Tamano del repositorio | 53,4 GB (incluye todas las variantes) |
| Fichero imatrix | LightOnOCR-3-4B.imatrix.gguf (0,1 GB) |

## Arquitectura y entrenamiento

La informacion proporcionada no incluye detalles sobre la arquitectura interna del modelo base (tipo de transformer, mecanismo de atencion, encoder de vision, numero de capas, dimensiones ocultas o estrategia de fusion multimodal). Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF, DPO o ajuste por instrucciones. Lo unico verificable a partir de los metadatos es que se trata de un modelo de vision-lenguaje orientado a OCR y comprension de documentos, con etiquetas que apuntan a localizacion visual, tablas y formularios.

En cuanto a la innovacion tecnica de esta publicacion concreta, mradermacher emplea cuantizacion con fichero imatrix (los quants "i1"), que calibra la importancia de los pesos a partir de activaciones y suele ofrecer mejor relacion calidad-tamano que la cuantizacion estatica equivalente. Se ofrece tambien una version estatica en el repositorio mradermacher/LightOnOCR-3-4B-GGUF. Al ser un modelo de vision, los ficheros mmproj necesarios para procesar imagenes no residen en este repositorio, sino en el repositorio estatico.

## Capacidades

- Reconocimiento optico de caracteres (OCR) sobre imagenes de documentos, con salida de texto plano o estructurado.
- Comprension de documentos: interpretacion del contenido de una pagina mas alla del texto crudo, incluyendo jerarquia y disposicion.
- Extraccion de tablas y formularios, segun las etiquetas declaradas por el autor de la cuantizacion.
- Localizacion visual (visual grounding): identificacion de la posicion de elementos dentro de la imagen.
- Modelo conversacional de vision-lenguaje: admite interaccion en formato de dialogo con entrada de imagen.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: limitadas al ingles segun el campo language de la model card.
- Modo de razonamiento explicito (thinking mode), audio u otras modalidades: no disponibles.

## Casos de uso

- Digitalizacion masiva de facturas y albaranes: el modelo puede extraer campos clave y lineas de detalle de documentos escaneados, con la ventaja de que las cuantizaciones Q4_K_M y Q5_K_M caben en una GPU de consumo y permiten procesar lotes en local sin enviar datos a terceros.
- Procesamiento de formularios administrativos: al estar orientado a formularios, resulta adecuado para leer casillas, etiquetas y valores y devolverlos en una estructura reutilizable por un sistema de gestion documental.
- Extraccion de tablas de informes financieros o cientificos: la etiqueta "tables" sugiere soporte especifico para reconstruir filas y columnas a partir de la imagen, util en pipelines de analisis de datos.
- Digitalizacion de archivos historicos o expedientes en papel: el despliegue local con llama.cpp permite tratar documentos sensibles sin salida a Internet, requisito habitual en administraciones y sanidad.
- Indexacion para busqueda semantica (RAG sobre documentos): el texto extraido por OCR puede alimentar una base vectorial; el modelo puede ademas responder preguntas concretas sobre una pagina dada.
- Accesibilidad: transcripcion de material impreso o capturas a texto legible para lectores de pantalla, ejecutable en equipos modestos con cuantizaciones IQ2/IQ3.
- Preprocesado en flujos automatizados de contabilidad: lectura de recibos y tickets con salida normalizada antes de introducir los datos en un ERP.
- Anotacion asistida de conjuntos de datos: uso de la localizacion visual para preetiquetar regiones de interes en imagenes que despues se revisan manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizacion no incluye tablas comparativas de MMLU, HumanEval, GSM8K ni de metricas especificas de OCR (como CER/WER o exactitud en extraccion de tablas), y los resultados de la busqueda web no aportan datos tecnicos sobre el modelo.

Como referencia de tamano de los artefactos, se incluye la siguiente tabla con las variantes mas relevantes:

| Variante | Tamano (GB) | Nota del autor |
|---|---|---|
| i1-IQ1_S | 1,5 | para casos desesperados |
| i1-IQ1_M | 1,5 | mayormente desesperado |
| i1-IQ2_XS | 1,7 | sin nota |
| i1-IQ2_M | 1,8 | sin nota |
| i1-Q2_K | 2,0 | IQ3_XXS probablemente mejor |
| i1-IQ3_XS | 2,2 | sin nota |
| i1-IQ3_S | 2,2 | mejor que Q3_K* |
| i1-Q3_K_M | 2,4 | IQ3_S probablemente mejor |
| i1-IQ4_XS | 2,6 | sin nota |
| i1-Q4_K_S | 2,7 | tamano, velocidad y calidad optimos |
| i1-Q4_K_M | 2,8 | rapido, recomendado |
| i1-Q5_K_M | 3,2 | sin nota |
| i1-Q6_K | 3,6 | practicamente como Q6_K estatico |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2 GB con IQ1_S/IQ2, 2,6-2,9 GB con IQ4_XS/Q4_K_M y 3,2-3,6 GB con Q5_K_M/Q6_K, a lo que hay que sumar el consumo del contexto (KV cache) y del proyector multimodal (mmproj).
- GPU recomendadas: cualquier GPU con 6-8 GB o mas de VRAM resulta suficiente para las cuantizaciones intermedias; una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB o una RTX 4090 permiten margen amplio para contextos largos y procesamiento por lotes.
- GPU de centro de datos (A100, H100): no son necesarias para este tamano, aunque pueden emplearse para servir muchas peticiones concurrentes o procesar imagenes en lote.
- Cabe en GPU de consumo: si, en la practica totalidad de las GPU modernas con 6 GB o mas; tambien es viable en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros clientes compatibles con GGUF. La model card indica que los endpoints son compatibles (etiqueta endpoints_compatible) y que el modelo se distribuye tambien para transformers.
- Latencia y throughput estimados: no disponibles; dependen de la cuantizacion, del hardware y de la resolucion de las imagenes de entrada.

## Comparativa con modelos similares

No se dispone de datos verificables sobre modelos comparables en la informacion proporcionada, por lo que no se puede elaborar una comparativa fiable de parametros, contexto y rendimiento frente a alternativas de la misma categoria (OCR multimodal de ~3-5 B). Lo unico comparable con datos presentes en este repositorio son las propias variantes de cuantizacion entre si, resumidas en la tabla de benchmarks.

Como referencia interna, la comparacion relevante es frente al modelo base sin cuantizar:

| Modelo | Parametros | Formato | Licencia | Idiomas |
|---|---|---|---|---|
| lightonai/LightOnOCR-3-4B | 4,2 B | safetensors | apache-2.0 | en |
| mradermacher/LightOnOCR-3-4B-i1-GGUF (este) | 4,2 B | GGUF (i1, imatrix) | apache-2.0 | en |
| mradermacher/LightOnOCR-3-4B-GGUF | 4,2 B | GGUF (estatico, incluye mmproj) | apache-2.0 | en |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse presumiblemente con documentos mayoritariamente en ingles, el rendimiento puede degradarse en otros idiomas o en escrituras no latinas.
- Riesgo de alucinacion: es un modelo generativo, por lo que puede producir texto plausible que no aparezca en la imagen, especialmente en documentos con ruido, baja resolucion o tipografias poco comunes. En entornos contables o legales conviene validar la salida.
- Limitaciones de idioma: la model card declara unicamente "en"; no se garantiza un buen funcionamiento en castellano ni en documentos bilingues.
- Limitaciones de contexto: la longitud de contexto no esta documentada, de modo que no puede planificarse el procesamiento de documentos muy largos o de multiples paginas en una sola pasada.
- Restricciones de licencia: el modelo base se distribuye bajo Apache 2.0, lo que en principio permite uso comercial; conviene verificar igualmente la licencia del modelo base y las condiciones de los datos con los que fue entrenado antes de un despliegue en produccion.
- Cuantizaciones agresivas: las variantes IQ1 e IQ2 reducen mucho el tamano, pero el propio autor advierte de su baja calidad ("for the desperate", "very low quality"); para OCR, donde un solo caracter erroneo altera el dato extraido, se recomienda Q4_K_M o superior.
- Ficheros mmproj: no estan incluidos en este repositorio; sin ellos el modelo no puede procesar imagenes. Deben obtenerse del repositorio estatico.
- Repositorio de terceros: esta publicacion no la mantiene el autor original del modelo, sino mradermacher; la trazabilidad de los pesos depende de ese proceso de conversion.
- Ausencia de benchmarks: no hay evidencia publicada en esta ficha sobre la precision real en tareas de OCR, por lo que se recomienda una evaluacion propia con el corpus de destino.

## Enlaces

- Repositorio GGUF cuantizado (i1): https://huggingface.co/mradermacher/LightOnOCR-3-4B-i1-GGUF
- Repositorio GGUF estatico (incluye ficheros mmproj): https://huggingface.co/mradermacher/LightOnOCR-3-4B-GGUF
- Modelo base: https://huggingface.co/lightonai/LightOnOCR-3-4B
- Pagina de resumen y descargas del autor de las cuantizaciones: https://hf.tst.eu/model#LightOnOCR-3-4B-i1-GGUF
- Solicitudes de cuantizacion y preguntas frecuentes: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa responsable de la infraestructura de cuantizacion: https://www.nethype.de/
