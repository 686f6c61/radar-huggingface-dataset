# mradermacher/LightOnOCR-3-4B-MTP-Repacked-i1-GGUF

## Resumen

LightOnOCR-3-4B-MTP-Repacked-i1-GGUF es una cuantizacion en formato GGUF del modelo LightOnOCR-3-4B-MTP-Repacked, publicado por el cuantizador mradermacher. El modelo original, desarrollado por prithivMLmods, es un modelo vision-language especializado en OCR y comprension de documentos: extrae texto de imagenes, PDF, tablas y formularios, y realiza visual grounding (localizacion de elementos en la imagen). Con 4.326.350.848 parametros (~4,3 mil millones), esta disenado para tareas de document understanding que requieren tanto percepcion visual como generacion de texto estructurado.

La relevancia de esta publicacion concreta radica en que ofrece versiones cuantizadas con imatrix (importance matrix) que reducen el peso del modelo desde los ~8,6 GB en fp16 hasta aproximadamente 2,1-3,7 GB, permitiendo su despliegue en hardware de consumo y en entornos de inferencia local mediante llama.cpp. Las cuantizaciones i1 (imatrix) suelen preservar mejor la calidad que las cuantizaciones estaticas equivalentes en tamano, lo que resulta especialmente critico en tareas de OCR donde pequenos errores de tokenizacion degradan la fidelidad del texto extraido.

El modelo esta licenciado bajo Apache 2.0, lo que facilita su uso comercial, y soporta unicamente el idioma ingles segun la informacion disponible. Se distribuye en 17 variantes de cuantizacion que abarcan desde Q2_K (2,1 GB) hasta Q6_K (3,7 GB), ademas del archivo imatrix para generar cuantizaciones propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (detalles de la arquitectura interna no disponibles) |
| Parametros totales | 4.326.350.848 (~4,3 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, mas archivo imatrix |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo original en la informacion proporcionada. Por los tags de la model card (vision-language, visual-grounding, ocr, document-understanding, tables, forms) y por la presencia de archivos mmproj en el repositorio estatico asociado, se trata de un modelo multimodal que combina un codificador visual con un modelo de lenguaje para procesar imagenes de documentos y generar texto. El sufijo "MTP" en el nombre sugiere multi-token prediction, una tecnica de decodificacion que predice varios tokens por paso para acelerar la generacion, aunque no se detalla su implementacion en la informacion disponible.

Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La model card del repositorio cuantizado no incluye esta informacion, y solo remite al modelo base prithivMLmods/LightOnOCR-3-4B-MTP-Repacked para los detalles de entrenamiento. Esta publicacion concreta es una cuantizacion: su aportacion tecnica es la generacion de cuantizaciones ponderadas con imatrix (importance matrix), que calibra la cuantizacion de cada tensor segun su importancia para la perplejidad, mejorando la calidad respecto a cuantizaciones estaticas del mismo tamano.

## Capacidades

- Reconocimiento optico de caracteres (OCR) sobre imagenes y documentos escaneados.
- Comprension de documentos (document understanding): interpretacion de estructura, secciones y contenido.
- Extraccion de tablas y formularios, segun los tags de la model card.
- Visual grounding: localizacion de elementos de texto o regiones dentro de la imagen.
- Procesamiento de PDF (tag pdf) como flujo de entrada para extraccion de contenido.
- Generacion de texto conversacional (tag conversational) en el contexto de las tareas de OCR y documentos.
- Capacidad multimodal vision-language: entrada de imagen mas texto, salida de texto.
- Soporte de inferencia via llama.cpp y text-generation-inference (tags de la model card).
- No se documenta soporte de tool calling, function calling ni modo de razonamiento explicito en la informacion disponible.
- Capacidades multilingues limitadas al ingles segun el campo language.

## Casos de uso

- Digitalizacion masiva de archivos escaneados: el modelo puede procesar imagenes de paginas y extraer el texto para alimentar un pipeline de indexacion o busqueda documental. Su tamano de ~2,9 GB en Q4_K_M permite ejecutarlo en servidores modestos o incluso en estaciones de trabajo sin GPU dedicada de gran capacidad.
- Extraccion de datos de facturas y formularios: al estar orientado a forms y tables, puede emplearse para convertir documentos administrativos en registros estructurados, integrado en un flujo de preprocesado con llama.cpp.
- Procesamiento de tablas en informes: la capacidad de document understanding permite recuperar el contenido tabular de PDF e imagenes para su posterior analisis en hojas de calculo o bases de datos.
- Visual grounding para anotacion de documentos: el modelo puede localizar regiones de interes (campos, firmas, encabezados) en la imagen, util para sistemas de verificacion documental o anotacion asistida.
- OCR en el borde (edge) o en local: las cuantizaciones Q2_K a Q4_K_S (2,1-2,7 GB) permiten desplegar OCR en portatiles o dispositivos con recursos limitados sin depender de servicios en la nube, lo que ayuda con requisitos de privacidad de datos.
- Automatizacion de ingestion de PDF en pipelines de datos: combinado con llama.cpp, el modelo puede formar parte de un proceso batch que convierta lotes de PDF en texto plano o Markdown para su uso en sistemas RAG.
- Prototipado rapido de aplicaciones de documentos: al estar disponible en GGUF con multiples niveles de cuantizacion, un desarrollador puede probar el modelo en local con Ollama o llama.cpp antes de decidir un despliegue mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,1 GB (Q2_K) hasta 3,7 GB (Q6_K) solo para los pesos; hay que anadir el coste del codificador visual (mmproj) y la cache KV, por lo que en la practica se recomienda reservar entre 4 y 6 GB de VRAM para las cuantizaciones mayores.
- GPU recomendadas: cualquier GPU consumer con 6-8 GB de VRAM o mas (RTX 3060, RTX 4060, RTX 4070, RTX 4090) puede ejecutar las cuantizaciones Q4 y Q5 con comodidad. Para Q6_K o procesamiento por lotes se recomienda 8 GB o mas. En entornos de servidor, A100 o H100 no son necesarias para este tamano, pero permitirian mayor throughput en batch.
- Cabe en GPU consumer: si, practicamente todas las GPU con 6 GB o mas de VRAM, e incluso en CPU con llama.cpp usando cuantizaciones Q2-Q4.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), text-generation-inference (tag de la model card), Ollama (compatible con GGUF), y cualquier runtime que soporte GGUF. Para el modelo base en safetensors, transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dependeran del hardware, de la cuantizacion y de la resolucion de las imagenes de entrada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la informacion proporcionada. La siguiente tabla recoge unicamente los datos verificables del modelo y deja como "no disponible" los campos de los que no hay informacion.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LightOnOCR-3-4B-MTP-Repacked (i1-GGUF) | ~4,3 mil millones | no disponible | apache-2.0 | GGUF (i1) | Especializado en OCR y document understanding; solo ingles |
| Modelos OCR/VLM comparables | no disponible | no disponible | no disponible | no disponible | No se han identificado alternativas concretas en la informacion disponible |

## Limitaciones y advertencias

- Solo soporta ingles segun el campo language de la model card; el rendimiento en otros idiomas no esta documentado y probablemente sea deficiente.
- No se dispone de datos de benchmarks que permitan evaluar su precision en OCR, por lo que la calidad real debe validarse en el caso de uso concreto antes de llevarlo a produccion.
- Riesgo de alucinacion inherente a los modelos generativos: en tareas de OCR puede inventar texto no presente en la imagen, especialmente con cuantizaciones agresivas (Q2_K, Q3) o imagenes de baja calidad.
- Las cuantizaciones de menor tamano (Q2_K, IQ2, Q3) degradan la fidelidad del texto extraido; para OCR se recomienda Q4_K_M o superior.
- El modelo es una cuantizacion de terceros (mradermacher), no la publicacion oficial del autor original; los posibles errores introducidos por la cuantizacion no estan cubiertos por la validacion del autor del modelo base.
- No se documenta la longitud de contexto, lo que impide planificar documentos largos con garantias.
- Aunque la licencia Apache 2.0 permite uso comercial, conviene verificar las condiciones del modelo base original antes de desplegarlo en produccion.
- El repositorio incluye 17 variantes de cuantizacion; elegir una inadecuada (por ejemplo, Q4_0, marcada como "fast, low quality") puede comprometer la calidad del OCR.
- Los archivos mmproj necesarios para el procesamiento de imagenes se encuentran en el repositorio estatico asociado, no en este repositorio i1; hay que descargarlos por separado.

## Enlaces

- Repositorio Hugging Face (esta cuantizacion): https://huggingface.co/mradermacher/LightOnOCR-3-4B-MTP-Repacked-i1-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/LightOnOCR-3-4B-MTP-Repacked
- Repositorio de cuantizaciones estaticas (incluye mmproj): https://huggingface.co/mradermacher/LightOnOCR-3-4B-MTP-Repacked-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#LightOnOCR-3-4B-MTP-Repacked-i1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
