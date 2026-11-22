# mradermacher/LightOnOCR-3-4B-MTP-Repacked-i1-GGUF

## Resumen

LightOnOCR-3-4B-MTP-Repacked-i1-GGUF es una cuantizacion en formato GGUF del modelo LightOnOCR-3-4B-MTP-Repacked, un modelo vision-language de 4.326 millones de parametros especializado en OCR, comprension de documentos y grounding visual. La cuantizacion la ha realizado mradermacher, un conocido publicador de cuantizaciones GGUF en Hugging Face, a partir del modelo original de prithivMLmods, y esta pensada para su uso con llama.cpp y text-generation-inference.

El modelo resuelve el problema de la extraccion y comprension de texto en documentos complejos: PDF, tablas, formularios e imagenes con texto, incluyendo la localizacion visual de elementos (visual grounding). Su tamano de 4B parametros lo hace desplegable en hardware de consumo, y la disponibilidad de cuantizaciones desde 2.1 GB hasta 3.7 GB permite ajustar el equilibrio entre calidad y recursos.

La relevancia actual de esta ficha radica en que combina dos tendencias: por un lado, los modelos especializados en document understanding que superan a los OCR clasicos en tareas estructuradas; por otro, el ecosistema de cuantizaciones imatrix de mradermacher, que facilita ejecutar el modelo en local con llama.cpp. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (vision-language transformer, segun tags del modelo) |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (imatrix) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones); modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la documentacion proporcionada. Los tags indican que se trata de un modelo vision-language con capacidades de OCR, document understanding y visual grounding, construido sobre un transformer multimodal. El sufijo "MTP" en el nombre sugiere multi-token prediction, una tecnica de decodificacion especulativa que permite generar varios tokens por paso, aunque no se confirma en la informacion disponible.

Tampoco se detallan los datos de entrenamiento: numero de tokens, composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. El modelo base es prithivMLmods/LightOnOCR-3-4B-MTP-Repacked, y esta version es una cuantizacion con imatrix (importance matrix) que mejora la calidad de las cuantizaciones de baja precision respecto a las estaticas.

## Capacidades

- Reconocimiento optico de caracteres (OCR) sobre imagenes y documentos escaneados.
- Comprension de documentos: extraccion de texto, estructura y contenido de PDF.
- Procesamiento de tablas y formularios, incluyendo la interpretacion de su estructura.
- Visual grounding: localizacion de elementos de texto o regiones dentro de la imagen.
- Generacion de texto conversacional (tag "conversational").
- Capacidades vision-language: entrada de imagenes junto con texto.
- Soporte multilingue limitado al ingles (tag "en").
- Compatibilidad con endpoints y text-generation-inference.
- No se confirma soporte de tool calling, function calling ni agentes multi-paso en la informacion disponible.

## Casos de uso

- Digitalizacion de archivos PDF: el modelo puede extraer texto y estructura de documentos escaneados, sustituyendo pipelines de OCR clasico en tareas donde se necesita comprension semantica del contenido.
- Procesamiento de facturas y formularios: al soportar comprension de formularios y tablas, puede extraer campos estructurados (importes, fechas, nombres) de documentos administrativos.
- Extraccion de tablas de informes: convierte tablas en imagenes o PDF a datos estructurados, util para analitica de datos y migracion de informacion.
- Grounding visual para verificacion documental: localiza regiones concretas del documento, lo que permite resaltar o validar campos extraidos en un sistema de auditoria.
- Digitalizacion de bibliotecas y archivos historicos: al ser un modelo de 4B con cuantizaciones de 2-3 GB, puede ejecutarse en servidores modestos o incluso en local para procesar grandes volumenes de documentos.
- Asistente de lectura de documentos para usuarios: integrado en una aplicacion de escritorio con llama.cpp, permite consultar el contenido de un PDF sin enviar datos a la nube, relevante por privacidad.
- Preprocesamiento en pipelines RAG: extraer texto limpio y estructurado de documentos antes de indexarlos en un sistema de recuperacion aumentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 2.5 y 4 GB adicionales sobre el tamano del archivo, segun contexto y backend. Las cuantizaciones van de 2.1 GB (i1-Q2_K) a 3.7 GB (i1-Q6_K).
- GPU recomendadas: cualquier GPU con 6-8 GB de VRAM permite ejecutar las cuantizaciones Q4; para Q6_K se recomienda 8 GB o mas. Una RTX 3060, RTX 4060 o superior es suficiente. En A100 o H100 el modelo ocupa una fraccion minima de memoria y permite alto throughput.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 6 GB o mas. Tambien puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp, Ollama (a partir de GGUF), text-generation-inference (tag del repo), y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Al ser un modelo de 4B con decodificacion MTP, se espera un throughput superior al de un 4B convencional, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LightOnOCR-3-4B-MTP-Repacked-i1-GGUF | 4.326 M | no disponible | Apache 2.0 | GGUF | Cuantizacion imatrix, OCR y document understanding |
| LightOnOCR-3-4B-MTP-Repacked (base) | 4.326 M | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar |
| LightOnOCR-3-4B-MTP-Repacked-GGUF (estatico) | 4.326 M | no disponible | Apache 2.0 | GGUF | Cuantizaciones estaticas del mismo autor |
| Otros modelos OCR/VLM de ~4B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de informacion suficiente para comparar con alternativas concretas de la misma categoria (por ejemplo, modelos OCR especializados de otros autores) en terminos de rendimiento o benchmarks.

## Limitaciones y advertencias

- El modelo solo soporta ingles (tag "en"); el rendimiento en otros idiomas no esta garantizado y probablemente sea deficiente.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de su calidad frente a alternativas.
- Riesgo de alucinacion inherente a los modelos generativos: puede inventar texto o campos que no aparecen en el documento, especialmente en cuantizaciones de baja precision (Q2, Q3).
- Las cuantizaciones i1-Q2_K y i1-Q3_K_S tienen calidad reducida; para produccion se recomienda i1-Q4_K_M o superior.
- No se detalla la longitud de contexto, lo que impide planificar el procesamiento de documentos muy largos.
- No se confirma soporte de tool calling ni de agentes, por lo que no debe asumirse para pipelines agenticos.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y de los datos de entrenamiento originales, no detallados aqui.
- El repositorio tiene 39.2 GB, lo que refleja la suma de todas las cuantizaciones; descargar solo el archivo necesario.
- Al ser una cuantizacion de terceros (mradermacher), la responsabilidad sobre la calidad final recae en el publicador de la cuantizacion, no en el autor original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/LightOnOCR-3-4B-MTP-Repacked-i1-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/LightOnOCR-3-4B-MTP-Repacked
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/LightOnOCR-3-4B-MTP-Repacked-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#LightOnOCR-3-4B-MTP-Repacked-i1-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor de la cuantizacion: https://www.nethype.de/
