# mradermacher/Logics-Parsing-v2-GGUF

## Resumen

Logics-Parsing-v2-GGUF es la distribucion en formato GGUF del modelo multimodal Logics-Parsing-v2, desarrollado originalmente por Logics-MLLM y cuantizado por mradermacher. Se trata de un modelo de vision-lenguaje (VLM) orientado al parseo y extraccion estructurada de documentos, con 4.022.468.096 parametros totales (aproximadamente 4 mil millones). La relevancia de esta version GGUF radica en que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles, sin necesidad de GPUs de datacenter.

El modelo base esta disenado para tareas de comprension de documentos: conversion de imagenes de documentos a Markdown estructurado, extraccion de tablas, reconocimiento de formulas y preservacion de la estructura de layout. La cuantizacion de mradermacher ofrece un abanico amplio de variantes, desde Q2_K (1,8 GB) hasta f16 (8,2 GB), lo que permite ajustar el equilibrio entre calidad y requisitos de memoria.

Esta ficha se centra en la version cuantizada GGUF, ya que la model card del repositorio de mradermacher no incluye informacion detallada sobre arquitectura, entrenamiento, benchmarks ni licencia del modelo base. Los datos tecnicos disponibles se limitan a parametros, tamanos de cuantizacion, idioma declarado (ingles) y la referencia al modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal vision-lenguaje; detalles no especificados en la informacion proporcionada) |
| Parametros totales | 4.022.468.096 (~4,02 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la informacion proporcionada. Los metadatos indican que es un modelo multimodal (etiqueta "multi-modal supplement" en el archivo mmproj), lo que implica un codificador visual acoplado a un modelo de lenguaje. El tamano de ~4 B parametros y la presencia de un proyector multimodal (mmproj) son consistentes con una arquitectura VLM tipica, pero no se especifica si emplea un transformer denso, atencion lineal u otra variante.

Tampoco se detallan los datos de entrenamiento: numero de tokens, composicion del dataset, uso de RLHF/DPO o innovaciones tecnicas como decodificacion especulativa. La model card del repositorio cuantizado es puramente operativa (lista de cuantizaciones y notas de uso), y no reproduce la informacion tecnica del modelo original. Para obtener estos datos seria necesario consultar el repositorio base `Logics-MLLM/Logics-Parsing-v2`, que no forma parte de la informacion proporcionada.

## Capacidades

- Procesamiento multimodal de imagenes de documentos: el modelo acepta imagenes y genera texto, segun indica la presencia del proyector multimodal (mmproj).
- Parseo de documentos a formato estructurado: por el nombre y la orientacion del modelo base (Logics-Parsing), se orienta a la conversion de documentos a Markdown u otra representacion estructurada, aunque la model card no detalla el formato de salida exacto.
- Generacion de texto conversacional: la etiqueta "conversational" sugiere soporte de dialogos multi-turno.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo se declara ingles (`language: en`).
- Capacidades especiales (thinking mode, audio, etc.): no disponible en la informacion proporcionada.

## Casos de uso

- Digitalizacion de documentos escaneados: el modelo puede recibir imagenes de paginas y generar una representacion textual estructurada, adecuado para pipelines de ingestion documental en archivos y gestorias.
- Extraccion de tablas de informes: al ser un modelo de parseo, se puede emplear para convertir tablas en imagenes a Markdown, facilitando su posterior procesamiento en hojas de calculo o bases de datos.
- Conversion de PDF a Markdown para RAG: integrado en un pipeline de retrieval-augmented generation, permite transformar documentos corporativos en texto limpio y estructurado antes de la indexacion.
- Procesamiento de facturas y formularios: la extraccion de campos estructurados a partir de imagenes es un caso tipico de los modelos de parsing; requiere validacion posterior por la naturaleza generativa del modelo.
- Investigacion en comprension de documentos: con solo ~4 B parametros y cuantizaciones desde 1,8 GB, es viable para experimentacion en entornos academicos con GPUs de consumo.
- Despliegue en edge o en local: la version Q4_K_M (2,6 GB) permite ejecutar el modelo en portatiles con GPU modesta o incluso CPU, util para prototipos sin infraestructura cloud.
- Preprocesamiento de corpus para entrenamiento: util para convertir grandes volumenes de documentos escaneados a texto estructurado antes de fine-tuning de otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto y proyector multimodal):
  - Q2_K: ~2,5 GB
  - Q4_K_M: ~3,5 GB
  - Q8_0: ~5,5 GB
  - f16: ~9,5 GB
  - Anadir ~0,6-0,9 GB para el proyector mmproj (Q8_0 o f16).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 para las variantes de mayor calidad; A100/H100 no son necesarias dado el tamano.
- Cabe en GPU de consumo: si, practicamente todas las variantes hasta Q8_0 caben en GPUs con 8 GB o mas; las variantes Q2_K a Q4_K_M caben en GPUs de 4-6 GB.
- Opciones de despliegue: llama.cpp, Ollama (previa conversion o importacion del GGUF), y servidores compatibles con GGUF que soporten modelos multimodales con mmproj. vLLM y TGI no soportan GGUF de forma nativa para este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de benchmarks ni especificaciones del modelo base que permitan una comparacion rigurosa con alternativas de la misma categoria (por ejemplo, otros VLM de ~4 B orientados a parsing de documentos). Se recomienda consultar el repositorio `Logics-MLLM/Logics-Parsing-v2` para obtener la comparativa oficial.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial esta permitido. Es imprescindible verificar la licencia del modelo base antes de cualquier despliegue en produccion.
- Solo ingles declarado: el soporte de otros idiomas, incluido el castellano, no esta garantizado y podria degradar la calidad del parseo.
- Riesgo de alucinacion: al ser un modelo generativo, puede inventar contenido no presente en la imagen del documento, especialmente en tablas complejas o texto de baja calidad. Requiere validacion en pipelines criticos.
- Cuantizaciones agresivas: Q2_K y Q3_K pueden degradar notablemente la calidad del parseo; para produccion se recomienda Q4_K_M o superior.
- Modelo cuantizado por terceros: mradermacher no es el autor original; los posibles errores de cuantizacion no estan cubiertos por el equipo del modelo base.
- Sin datos de contexto: se desconoce la ventana de contexto maxima, lo que limita la planificacion de cargas con documentos muy extensos.
- Sin benchmarks publicados en esta ficha: no se puede avalar el rendimiento frente a alternativas sin consultar la documentacion del modelo base.
- Idiomas y sesgos: no hay informacion sobre sesgos conocidos; al entrenarse presumiblemente con datos en ingles, puede presentar sesgos culturales y linguisticos de ese corpus.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Logics-Parsing-v2-GGUF
- Modelo base: https://huggingface.co/Logics-MLLM/Logics-Parsing-v2
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Logics-Parsing-v2-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Logics-Parsing-v2-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
