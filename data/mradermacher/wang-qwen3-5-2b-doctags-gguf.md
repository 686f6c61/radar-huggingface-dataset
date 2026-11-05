# mradermacher/Wang-Qwen3.5-2B-DocTags-GGUF

## Resumen

Wang-Qwen3.5-2B-DocTags es un modelo multimodal de visión-lenguaje de 1.882.509.120 parámetros (aproximadamente 1,88 mil millones) especializado en comprensión de documentos y etiquetado estructurado (DocTags). El modelo base fue desarrollado por multimodal-vision-ai y esta versión concreta es una cuantización estática en formato GGUF publicada por mradermacher, pensada para ejecución local eficiente mediante llama.cpp y runtimes compatibles.

El modelo parte de la familia Qwen3.5 (según el tag `qwen3_5` y el nombre del repositorio) y está afinado para tareas de OCR y document understanding, con integración declarada con Docling y el formato DocTags. Su tamaño reducido permite desplegarlo en hardware de consumo, lo que lo hace relevante para pipelines de digitalización documental, extracción de estructura en PDFs e indexación de archivos escaneados sin depender de servicios en la nube.

La licencia Apache 2.0 facilita su uso comercial y su modificación. Esta ficha se centra en la versión GGUF cuantizada, que incluye tanto los pesos del modelo de lenguaje como el proyector multimodal (`mmproj`) necesario para procesar imágenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje), familia Qwen3.5; detalles internos no disponibles |
| Parametros totales | 1.882.509.120 (aprox. 1,88 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; proyector multimodal en mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); modelo base original presumiblemente en safetensors, no confirmado |

## Arquitectura y entrenamiento

La información disponible confirma que se trata de un modelo multimodal de la familia Qwen3.5 con capacidad de procesar imágenes y texto, orientado a comprensión de documentos. El repositorio GGUF incluye un proyector multimodal separado (`mmproj`), lo que confirma la presencia de un codificador visual acoplado al modelo de lenguaje. No se especifican en la información proporcionada detalles sobre el número de capas, dimensiones ocultas, mecanismo de atención ni la arquitectura exacta del codificador visual.

Tampoco se dispone de datos sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. Los tags indican un ajuste específico para OCR, document understanding, Docling y DocTags, lo que sugiere un entrenamiento o fine-tuning orientado a la extracción de estructura documental y etiquetado semántico de regiones. Esta información debe considerarse incompleta y conviene consultar la model card del modelo base para obtener detalles técnicos verificados.

## Capacidades

- Procesamiento multimodal de imágenes y texto: acepta imágenes de documentos junto con instrucciones en lenguaje natural.
- OCR y comprensión de documentos: extracción de texto y estructura a partir de imágenes de páginas escaneadas o capturas.
- Generación de DocTags: etiquetado estructurado del contenido documental en el formato DocTags, compatible con el ecosistema Docling.
- Conversación multi-turno: el tag `conversational` indica soporte de diálogo interactivo.
- Integración con endpoints compatibles: el tag `endpoints_compatible` sugiere compatibilidad con APIs de inferencia estándar.
- Capacidades de tool calling, agentes, razonamiento matemático avanzado o audio: no disponibles en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la metadata.

## Casos de uso

- Digitalización de archivos escaneados: el modelo puede procesar imágenes de páginas y generar DocTags con la estructura del contenido (títulos, párrafos, tablas), lo que permite alimentar pipelines de conversión a formatos estructurados como Markdown o JSON.
- Extracción de estructura en facturas y formularios: al estar orientado a document understanding, puede identificar regiones y etiquetarlas semánticamente para su posterior parseo en sistemas de contabilidad o ERP.
- Indexación de documentación técnica: integrado en un pipeline de ingesta, permite convertir PDFs escaneados en texto etiquetado apto para motores de búsqueda o bases de datos vectoriales.
- Preprocesamiento para RAG documental: la salida en DocTags facilita la segmentación por secciones antes de generar embeddings, mejorando la calidad de la recuperación en asistentes sobre corpus internos.
- Despliegue en entornos con recursos limitados: con cuantizaciones de 1,1 a 2,1 GB, puede ejecutarse en portátiles y estaciones de trabajo sin GPU dedicada de gama alta, útil para oficinas o entornos air-gapped.
- Automatización de archivo y clasificación documental: el modelo puede etiquetar tipos de documento y secciones, permitiendo enrutar automáticamente expedientes en gestores documentales.
- Prototipado e investigación en OCR estructurado: su licencia Apache 2.0 y su tamaño reducido lo hacen adecuado para experimentación académica y para comparar enfoques de etiquetado documental sin costes de infraestructura elevados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB con Q2_K o Q3_K_S, 1,3-1,4 GB con Q4_K_S o Q4_K_M, 1,7 GB con Q6_K y 2,1 GB con Q8_0. A estas cifras hay que sumar el proyector multimodal (0,5 GB en Q8_0 o 0,8 GB en f16) y el espacio para el contexto KV cache.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar las cuantizaciones intermedias con margen; una RTX 3060, RTX 4060 o superior ofrece holgura. Para f16 se recomienda al menos 8 GB de VRAM.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna de 4 GB o más; también puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp, Ollama (mediante importación de GGUF), servidores compatibles con la API de OpenAI y runtimes que soporten GGUF multimodal con `mmproj`. vLLM y TGI no se confirman para esta variante GGUF multimodal.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán del hardware, la cuantización y la resolución de las imágenes de entrada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| Wang-Qwen3.5-2B-DocTags (esta versión GGUF) | ~1,88 B | No disponible | Imagen + texto | Apache 2.0 | GGUF |
| Modelo base multimodal-vision-ai/Wang-Qwen3.5-2B-DocTags | ~1,88 B | No disponible | Imagen + texto | Apache 2.0 | Safetensors (presumible) |
| Alternativas de OCR/document understanding de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información suficiente para establecer una comparativa cuantitativa con modelos alternativos de la misma categoría. Se recomienda consultar la model card del modelo base para obtener referencias y resultados comparativos.

## Limitaciones y advertencias

- Idiomas: el modelo declara únicamente inglés, por lo que su rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Contexto: se desconoce la longitud máxima de contexto, lo que impide planificar con seguridad el procesamiento de documentos extensos en una sola pasada.
- Alucinación: como todo modelo generativo, puede producir etiquetas o texto inexistente en la imagen; en tareas de OCR conviene validar la salida contra el documento original.
- Sesgos: no se documentan evaluaciones de sesgo; el modelo puede reflejar sesgos presentes en sus datos de entrenamiento, no especificados.
- Cuantización: las versiones Q2_K y Q3_K_S pueden degradar notablemente la calidad; para producción se recomienda Q4_K_M o superior.
- Soporte multimodal en GGUF: el uso requiere cargar el archivo `mmproj` junto con los pesos; algunos runtimes no soportan esta combinación, lo que limita las opciones de despliegue.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia y condiciones del modelo base original, ya que esta versión es una derivación cuantizada.
- Madurez: el repositorio registra cero descargas y cero likes en el momento de la consulta, por lo que no hay evidencia comunitaria de robustez en producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Wang-Qwen3.5-2B-DocTags-GGUF
- Modelo base: https://huggingface.co/multimodal-vision-ai/Wang-Qwen3.5-2B-DocTags
- Página de overview de cuantizaciones de mradermacher: https://hf.tst.eu/model#Wang-Qwen3.5-2B-DocTags-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
