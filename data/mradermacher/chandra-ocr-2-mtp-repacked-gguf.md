# mradermacher/chandra-ocr-2-MTP-Repacked-GGUF

## Resumen

chandra-ocr-2-MTP-Repacked-GGUF es una distribución de cuantizaciones estáticas en formato GGUF del modelo prithivMLmods/chandra-ocr-2-MTP-Repacked, publicada por mradermacher. El modelo base es un modelo de OCR y comprensión de documentos orientado a la conversión de PDF e imágenes en Markdown, HTML y JSON, con soporte de análisis de layout. Esta versión GGUF está pensada para su uso con llama.cpp y herramientas compatibles (llama-cli, text-generation-inference), lo que facilita el despliegue en entornos locales sin necesidad de GPUs de datacenter.

El modelo base cuenta con 4.326.350.848 parámetros (aproximadamente 4,3 mil millones) según los pesos en safetensors del repositorio original, y está etiquetado como multimodal (incluye un suplemento mmproj para el proyector visual). La licencia es OpenRAIL, heredada del modelo original datalab-to/chandra-ocr-2, y el único idioma declarado es el inglés.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un pipeline de OCR y estructuración de documentos en hardware de consumo, con cuantizaciones que van desde Q2_K hasta Q8_0 y f16, y con la posibilidad de usar decodificación multi-token prediction (MTP) según indica el nombre del modelo. No obstante, la información pública disponible es muy limitada: no hay benchmarks, no hay detalles de entrenamiento y el repositorio tiene cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo base con proyector visual mmproj); detalles internos no disponibles |
| Parametros totales | 4.326.350.848 (~4,3 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS; suplementos mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés) |
| Licencia | openrail (enlace a la licencia del modelo original datalab-to/chandra-ocr-2) |
| Formato de pesos | GGUF (cuantizaciones estáticas); modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. Los metadatos indican que se trata de un modelo multimodal con un proyector visual separado (mmproj), lo que sugiere un diseño típico de modelo de lenguaje con adaptador visual para procesar imágenes de documentos. El nombre incluye "MTP", que en el contexto de llama.cpp suele asociarse a multi-token prediction, una técnica de decodificación especulativa que permite predecir varios tokens por paso para acelerar la inferencia; sin embargo, no se confirma en la model card.

Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. El repositorio de mradermacher es únicamente una redistribución de cuantizaciones estáticas del modelo prithivMLmods/chandra-ocr-2-MTP-Repacked, que a su vez deriva de datalab-to/chandra-ocr-2. No se indica que se hayan generado cuantizaciones ponderadas o con imatrix, y el autor señala que podrían no estar disponibles.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes y documentos PDF.
- Conversión de documentos a Markdown, HTML y JSON, según las etiquetas del repositorio.
- Análisis de layout de documentos (detección y estructuración de bloques de texto, tablas y elementos de página).
- Generación de texto conversacional (etiqueta "conversational" y pipeline text-generation-inference).
- Procesamiento multimodal: el suplemento mmproj permite introducir imágenes junto con texto.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según los metadatos.
- Modo thinking, visión, audio u otras capacidades especiales: solo se confirma visión (OCR); el resto no disponible.

## Casos de uso

- Digitalización de facturas y recibos: el modelo puede recibir la imagen de una factura y devolver una representación estructurada en JSON o Markdown, lo que facilita la extracción de campos en pipelines contables. Es adecuado por su orientación explícita a OCR y salida estructurada.
- Conversión de documentación técnica a Markdown: útil para migrar manuales en PDF a repositorios de documentación, preservando el layout y las tablas gracias a las capacidades de análisis de layout.
- Extracción de tablas de informes financieros: el modelo puede transformar tablas de PDF en HTML o Markdown, lo que simplifica su posterior procesamiento con herramientas de análisis de datos.
- Indexación y búsqueda semántica de archivos escaneados: al generar Markdown limpio, el texto resultante puede alimentar pipelines de embeddings y motores de búsqueda sin necesidad de OCR externo.
- Procesamiento local en estaciones de trabajo: las cuantizaciones Q4_K_M y Q5_K_M permiten ejecutar el modelo en GPUs de consumo, lo que es útil para equipos que manejan documentos confidenciales y no quieren enviarlos a la nube.
- Automatización de la accesibilidad documental: conversión de PDFs escaneados a HTML estructurado para lectores de pantalla, aprovechando la salida en HTML y la preservación del layout.
- Preprocesamiento para pipelines de RAG: el modelo puede actuar como primer eslabón que convierte documentos heterogéneos en texto estructurado antes de la fragmentación y la vectorización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,3 mil millones de parámetros, una cuantización Q4_K_M ocuparía aproximadamente 2,5-3 GB de pesos, más el suplemento mmproj (0,5-0,8 GB) y la caché KV. En la práctica, se recomienda al menos 6-8 GB de VRAM para Q4_K_M con imágenes, y 10-12 GB para Q8_0.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100 y H100 para mayor throughput. Cualquier GPU con 8 GB o más puede ejecutar las cuantizaciones bajas.
- ¿Cabe en GPU de consumo? Sí: las cuantizaciones Q2_K a Q5_K_M caben en GPUs de 6-8 GB; Q8_0 y f16 requieren 10-16 GB.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), text-generation-inference (etiqueta tgi), y cualquier frontend compatible con GGUF como Ollama o LM Studio (no confirmado explícitamente en la model card, pero habitual para GGUF).
- Latencia y throughput estimados: no disponibles. El sufijo MTP sugiere decodificación multi-token prediction, que podría mejorar el throughput, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| chandra-ocr-2-MTP-Repacked-GGUF (este) | ~4,3 B | no disponible | en | openrail | GGUF | Cuantizaciones estáticas de un modelo OCR multimodal |
| prithivMLmods/chandra-ocr-2-MTP-Repacked | ~4,3 B | no disponible | en | openrail | safetensors | Modelo base del que deriva esta distribución |
| datalab-to/chandra-ocr-2 | no disponible | no disponible | no disponible | openrail | no disponible | Modelo original de referencia |

No se dispone de datos de rendimiento ni de otros modelos OCR comparables en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Sesgos conocidos: no disponibles; al ser un modelo OCR, puede heredar sesgos de los datos de entrenamiento del modelo original, pero no se documentan.
- Riesgo de alucinación: en tareas de OCR y estructuración, el modelo puede generar texto plausible que no aparece en la imagen, especialmente en documentos de baja calidad o con layout complejo. Se recomienda validación posterior en producción.
- Restricciones de licencia: OpenRAIL incluye cláusulas de uso responsable que pueden restringir ciertos usos; es necesario revisar el enlace a la licencia del modelo original antes de un despliegue comercial.
- Cuantizaciones: las cuantizaciones bajas (Q2_K, Q3_K_S) degradan la calidad de reconocimiento; para OCR se recomienda Q5_K_M o superior.
- Soporte del autor: el repositorio tiene cero descargas y cero likes, y el autor indica que las cuantizaciones ponderadas o con imatrix podrían no estar disponibles.
- Contexto: se desconoce la longitud de contexto, lo que impide planificar el procesamiento de documentos largos sin pruebas previas.
- Fecha de creación: el repositorio aparece creado en 2026-11-03, lo que puede indicar metadatos inconsistentes; conviene verificar la integridad de los archivos antes de usarlos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/chandra-ocr-2-MTP-Repacked-GGUF
- Modelo base (repack): https://huggingface.co/prithivMLmods/chandra-ocr-2-MTP-Repacked
- Modelo original: https://huggingface.co/datalab-to/chandra-ocr-2
- Licencia del modelo original: https://huggingface.co/datalab-to/chandra-ocr-2/blob/main/LICENSE
- Página de descargas del autor: https://hf.tst.eu/model#chandra-ocr-2-MTP-Repacked-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
