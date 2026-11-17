# mradermacher/Qari-OCR-0.3-SNAPSHOT-VL-2B-Instruct-merged-GGUF

## Resumen

Qari-OCR-0.3-SNAPSHOT-VL-2B-Instruct-merged-GGUF es la distribucion en formato GGUF del modelo vision-lenguaje Qari-OCR-v0.3-VL-2B-Instruct, desarrollado originalmente por NAMAA-Space y cuantizado por mradermacher. Se trata de un modelo de 1.543.714.304 parametros (aproximadamente 1,5 mil millones) especializado en reconocimiento optico de caracteres (OCR) y conversion de imagenes de texto a Markdown, con foco principal en la lengua arabe. El modelo resuelve el problema de digitalizar documentos arabes preservando estructura y formato mediante salida en Markdown, una tarea historicamente mal cubierta por los OCR genericos.

La relevancia de esta ficha radica en que ofrece el modelo en multiples niveles de cuantizacion GGUF (desde Q2_K de 0,8 GB hasta f16 de 3,2 GB), lo que permite desplegarlo en hardware modesto, incluidas GPUs de consumo, algo impensable con pesos completos en precision alta. El modelo base esta entrenado sobre el dataset NAMAA-Space/QariOCR-v0.3-markdown-mixed-dataset y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial.

Arquitectonicamente es un modelo multimodal de tipo vision-lenguaje (image-to-text) construido sobre un transformer con proyector multimodal, derivado de la familia Qwen2-VL de 2B segun la nomenclatura del modelo base. El repositorio ocupa 16,2 GB en total por acumular todas las variantes de cuantizacion, y el modelo ha registrado 692 descargas y 2 likes desde su creacion en junio de 2025.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-lenguaje (image-to-text); modelo base Qari-OCR-v0.3-VL-2B-Instruct, derivado de la familia Qwen2-VL 2B segun nomenclatura |
| Parametros totales | 1.543.714.304 (aprox. 1,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-Q8_0 y mmproj-f16 (suplemento multimodal) |
| Idiomas soportados | arabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal de tipo vision-lenguaje orientado a image-to-text, es decir, recibe una imagen y genera texto. La nomenclatura "VL-2B" y la referencia a la familia Qwen2-VL en el modelo base indican una arquitectura con encoder visual y proyector hacia un decoder de lenguaje de aproximadamente 2B parametros. El repositorio GGUF incluye archivos separados de proyeccion multimodal (mmproj-Q8_0 y mmproj-f16) necesarios para procesar imagenes en llama.cpp.

El entrenamiento se realizo sobre el dataset NAMAA-Space/QariOCR-v0.3-markdown-mixed-dataset, compuesto por pares imagen-texto con salida en Markdown, lo que sugiere un ajuste fino supervisado orientado a transcripcion estructurada de documentos arabes. No se dispone de informacion sobre el numero exacto de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron tecnicas de RLHF o DPO. La cuantizacion la realizo mradermacher mediante conversion a GGUF con quantize_version 2 y output_tensor_quantised 1; segun la model card, no hay cuantizaciones con imatrix disponibles en el momento de la publicacion.

## Capacidades

- Reconocimiento optico de caracteres (OCR) sobre imagenes de documentos en arabe.
- Conversion de imagenes de texto a Markdown, preservando estructura (encabezados, listas, tablas, enfasis) en la medida en que el modelo lo soporte.
- Procesamiento multimodal image-to-text: entrada de imagen, salida de texto.
- Generacion de texto conversacional (tag "conversational" en el repositorio).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al arabe segun el campo language del repositorio.
- Capacidades especiales (thinking mode, vision, audio): vision si; audio y thinking mode no disponibles en la informacion.

## Casos de uso

- Digitalizacion de archivos arabes: el modelo transcribe imagenes de documentos escaneados a texto Markdown, adecuado para bibliotecas y hemerotecas que necesitan indexar fondos en arabe con estructura preservada.
- Extraccion de datos de facturas y formularios arabes: al generar Markdown estructurado, permite alimentar pipelines de extraccion de campos con texto limpio en lugar de OCR plano sin jerarquia.
- Accesibilidad de documentos: conversion de PDFs e imagenes arabes a texto legible por lectores de pantalla, aprovechando la salida Markdown para mantener encabezados y listas.
- Procesamiento por lotes en CPU o GPU de consumo: con cuantizaciones Q4_K_M (1,1 GB) o Q5_K_M (1,2 GB) puede ejecutarse en equipos sin GPU dedicada mediante llama.cpp, lo que abarata el despliegue masivo.
- Enriquecimiento de corpus para entrenamiento: transcripcion de imagenes arabes a Markdown para construir datasets de texto estructurado, dado que el propio modelo fue entrenado con esa tarea.
- Integracion en aplicaciones moviles o edge: el tamano reducido (desde 0,8 GB en Q2_K, mas el suplemento mmproj) permite embeber el modelo en entornos con poca memoria para OCR offline de documentos arabes.
- Traduccion asistida de documentos: combinado con un modelo de traduccion, el Markdown generado sirve como paso intermedio para traducir contenido arabe preservando formato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~0,8 GB; Q4_K_M ~1,1 GB; Q5_K_M ~1,2 GB; Q6_K ~1,4 GB; Q8_0 ~1,7 GB; f16 ~3,2 GB. A estas cifras hay que sumar el suplemento multimodal mmproj (0,8 GB en Q8_0 o 1,4 GB en f16) y el espacio de contexto/KV cache.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para las cuantizaciones pequenas; RTX 3060, RTX 4060, RTX 4090 o superiores no presentan problema. En entornos de servidor, A100 o H100 son sobredimensionadas para este tamano.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna de 4 GB o mas, e incluso en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio) al ser formato GGUF; el modelo base admite transformers. vLLM y TGI no estan confirmados para GGUF multimodal en la informacion disponible.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qari-OCR-0.3-VL-2B-Instruct (este) | ~1,5B | no disponible | arabe | Apache 2.0 | GGUF, safetensors | OCR arabe a Markdown |
| Qwen2-VL-2B-Instruct | ~2B | no disponible | multilingue | Apache 2.0 | safetensors, GGUF | Vision-lenguaje generico; no especializado en OCR arabe |
| PaddleOCR (modelos dedicados) | variable | no disponible | multilingue | Apache 2.0 | varios | OCR clasico, sin generacion Markdown |
| Tesseract (ara) | no aplica | no disponible | multilingue | Apache 2.0 | binario | OCR clasico, sin estructura Markdown |

La comparativa se limita a alternativas de categoria similar; los datos de contexto y rendimiento de los competidores no estan disponibles en la informacion proporcionada, por lo que la comparacion cuantitativa no puede realizarse.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la informacion proporcionada; al estar entrenado solo con datos arabes, el rendimiento en otros idiomas sera previsiblemente muy inferior.
- Riesgo de alucinacion: como todo modelo generativo, puede inventar texto ausente en la imagen, especialmente en documentos de baja calidad o con tipografias poco comunes.
- Limitaciones de contexto o idioma: el campo language del repositorio solo declara arabe; no hay datos sobre longitud de contexto, lo que impide garantizar el procesamiento de documentos muy extensos en una sola pasada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base NAMAA-Space/Qari-OCR-v0.3-VL-2B-Instruct y de sus dependencias (posible herencia de Qwen2-VL) antes de produccion.
- Caveats para produccion: las cuantizaciones bajas (Q2_K, Q3_K) degradan la calidad de transcripcion; para OCR se recomienda Q5_K_M o superior. No hay cuantizaciones imatrix disponibles segun la model card, lo que limita la calidad maxima alcanzable en tamanos pequenos. El modelo base es un "SNAPSHOT" (0.3), lo que sugiere posible inestabilidad o cambios futuros. El repo acumula 16,2 GB por incluir todas las variantes, por lo que conviene descargar solo el archivo necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qari-OCR-0.3-SNAPSHOT-VL-2B-Instruct-merged-GGUF
- Modelo base: https://huggingface.co/NAMAA-Space/Qari-OCR-v0.3-VL-2B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/NAMAA-Space/QariOCR-v0.3-markdown-mixed-dataset
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Qari-OCR-0.3-SNAPSHOT-VL-2B-Instruct-merged-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
