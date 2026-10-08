# mradermacher/Magistral-Small-2509-Vision-GGUF

## Resumen

Esta ficha describe el repositorio mradermacher/Magistral-Small-2509-Vision-GGUF, una cuantizacion estatica en formato GGUF del modelo EnlistedGhost/Magistral-Small-2509-Vision, un derivado multimodal de tipo imagen-texto de la familia Magistral (Mistral AI). El repositorio lo publica mradermacher, autor especializado en cuantizaciones GGUF para inferencia local, y esta pensado para ejecutar un modelo multimodal de ~23,6 mil millones de parametros en hardware de consumo o servidores modestos mediante llama.cpp y herramientas compatibles.

El modelo base incorpora vision ademas de generacion de texto, con etiquetas de conversacion y multimodalidad, y declara soporte para ingles, ruso y ucraniano. La licencia es Apache 2.0 tanto en el repositorio cuantizado como en el modelo de partida, lo que permite uso comercial sin las restricciones tipicas de otras licencias de modelos abiertos.

Su relevancia actual es practica: ofrece una via para desplegar un modelo multimodal de ~24 B en local con un rango de cuantizaciones que va de 9,0 GB (Q2_K) a 25,2 GB (Q8_0). No obstante, los metadatos de la cuantizacion indican que se ha omitido el proyector multimodal (skip_mmproj), un detalle critico que conviene verificar antes de asumir capacidades de vision en estos ficheros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (modelo multimodal imagen-texto de la familia Magistral; no se detalla el tipo de transformer ni el codificador visual) |
| Parametros totales | 23.572.403.200 (≈23,6 mil millones, dato de safetensors del modelo base) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K (9,0 GB), Q3_K_S (10,5 GB), Q3_K_M (11,6 GB), Q3_K_L (12,5 GB), IQ4_XS (13,0 GB), Q4_K_S (13,6 GB), Q4_K_M (14,4 GB), Q5_K_S (16,4 GB), Q5_K_M (16,9 GB), Q6_K (19,4 GB), Q8_0 (25,2 GB); los metadatos mencionan ademas una variante x-f16 |
| Idiomas soportados | en (ingles), ru (ruso), uk (ucraniano) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base se distribuye en safetensors |
| Modelo base | EnlistedGhost/Magistral-Small-2509-Vision |
| Cuantizador | mradermacher |
| Variante con imatrix | mradermacher/Magistral-Small-2509-Vision-i1-GGUF (quants ponderados con imatrix) |
| Tamano del repositorio | 164,5 GB |
| Descargas / likes | 640 / 0 |
| Fecha de creacion / actualizacion | 2025-11-19 / 2026-10-08 |

## Arquitectura y entrenamiento

No se publica en la informacion disponible ningun detalle sobre la arquitectura interna del modelo (numero de capas, tipo de atencion, dimension del codificador visual, estrategia de fusion multimodal) ni sobre el corpus de entrenamiento, el numero de tokens utilizados o si hubo fases de RLHF, DPO u optimizacion por preferencias. Lo unico documentado es que se trata de un modelo multimodal de tipo Image-Text-to-Text derivado de un Magistral Small 2509 adaptado por el usuario EnlistedGhost, con un total de 23.572.403.200 parametros segun los pesos en safetensors.

Lo que si esta documentado es el proceso de cuantizacion aplicado por mradermacher: cuantizacion estatica (quantize_version 2, output_tensor_quantised 1, convert_type hf) generada con llama.cpp, con cuants de la familia K e IQ, y una variante adicional i1 con pesos ponderados mediante imatrix que suele ofrecer mejor relacion tamano-calidad que los cuants estaticos equivalentes. Los metadatos de la model card incluyen la marca skip_mmproj: 1, lo que indica que el proyector multimodal no se incorpora en estos ficheros; en la practica esto implica que las capacidades de vision pueden no estar operativas en estas cuantizaciones y que el modelo podria comportarse como texto unicamente. Conviene verificarlo contra el repositorio base antes de desplegarlo en un caso de uso multimodal.

## Capacidades

- Generacion de texto conversacional multi-turno, segun las etiquetas Conversational y Multimodal del repositorio.
- Procesamiento de imagen y texto (Image-Text-to-Text) en el modelo base; en estos GGUF la marca skip_mmproj: 1 pone en duda que la entrada de imagen funcione sin anadir el proyector correspondiente.
- Soporte multilingue declarado para ingles, ruso y ucraniano. No se declara soporte de castellano.
- Razonamiento: la ficha de la cuantizacion no lo detalla, pero el modelo pertenece a la familia Magistral de Mistral AI, que el directorio de terceros Portkey describe como orientada a razonamiento y con soporte de tool calling en su version de API.
- Tool calling / function calling: citado por el directorio Portkey para magistral-small-2509 (modelo de API), no confirmado explicitamente para esta cuantizacion GGUF.
- Uso de agentes y razonamiento multi-paso: no confirmado en la informacion disponible para esta cuantizacion.
- Capacidades especiales (modo thinking, audio, vision adicional): no disponible; la unica capacidad especial documentada es la multimodalidad del modelo base.

## Casos de uso

- Inferencia local en estaciones de trabajo sin conexion: con cuants de 13,6-16,9 GB (Q4_K_S a Q5_K_M) el modelo cabe en una GPU de 24 GB y permite desplegar un asistente conversacional de ~24 B sin enviar datos a servicios externos, algo relevante en entornos con requisitos de confidencialidad.
- Analisis de documentacion tecnica en ruso y ucraniano: el soporte declarado de ambos idiomas lo hace adecuado para resumir manuales, extraer entidades de informes o traducir documentacion interna, siempre que se valide la calidad real con un conjunto de prueba propio.
- Asistente conversacional multi-turno de proposito general: su caracter Conversational y su tamano (~24 B) permiten mantener dialogos con contexto amplio en aplicaciones de soporte interno, limitado por la longitud de contexto real, que no se documenta.
- Procesamiento de imagenes en el modelo base (captions, VQA, extraccion de informacion de capturas o diagramas): viable si se utiliza el repositorio base en safetensors o se anade el proyector multimodal; no garantizado con estas cuantizaciones GGUF.
- Prototipado rapido con Ollama o LM Studio: el formato GGUF y el rango de cuants permiten probar el modelo en un portatil con GPU de 16 GB usando Q3_K_M o IQ4_XS, a costa de perdida de calidad.
- Despliegue en servidores con una sola GPU de 40-80 GB: los cuants Q6_K y Q8_0 (19,4 y 25,2 GB) permiten servir el modelo con la mejor calidad disponible en esta coleccion, con margen para cache KV.
- Evaluacion comparativa de cuantizaciones: la existencia de una variante i1 con imatrix y de cuants estaticos facilita experimentos controlados de degradacion por cuantizacion sobre un mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado no incluye tablas de MMLU, HumanEval, GSM8K ni metricas multimodales, y las busquedas web realizadas no aportan cifras atribuibles a esta cuantizacion concreta. La unica referencia de rendimiento es el grafico comparativo de perplejidad entre tipos de cuantizacion de ikawrakow enlazado desde la propia model card, que no proporciona valores numericos en el texto disponible.

## Requisitos de hardware

- VRAM estimada por cuantizacion (tamano de fichero mas margen de contexto y cache KV, orientativo): Q2_K 9,0 GB (≈11 GB), Q3_K_M 11,6 GB (≈14 GB), IQ4_XS 13,0 GB (≈15 GB), Q4_K_S 13,6 GB (≈16 GB), Q4_K_M 14,4 GB (≈17 GB), Q5_K_M 16,9 GB (≈19 GB), Q6_K 19,4 GB (≈22 GB), Q8_0 25,2 GB (≈28 GB). Los margenes dependen de la longitud de contexto y del backend, datos no publicados.
- GPU de consumo: RTX 4090 o RTX 3090 (24 GB) pueden ejecutar Q4_K_M, Q5_K_M e incluso Q6_K con contexto limitado; tarjetas de 16 GB (RTX 4060 Ti 16 GB, RTX 4080) quedan restringidas a Q3_K_M, IQ4_XS o Q4_K_S con contexto reducido.
- GPU profesional: A100 40 GB y H100 80 GB cubren sin problema Q8_0 con contexto amplio; una A100 80 GB permitiria ademas varios procesos concurrentes.
- Memoria unificada: los equipos Apple Silicon con 32 GB o mas pueden ejecutar cuants Q4 y Q5 mediante llama.cpp con offload a GPU (Metal), aunque sin datos de throughput publicados.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, llama-cpp-python, text-generation-webui) al tratarse de formato GGUF. Para vLLM o TGI seria necesario partir del repositorio base en safetensors; no se documenta soporte GGUF en esta ficha.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token para ninguna de las cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| mradermacher/Magistral-Small-2509-Vision-GGUF | ≈23,6 mil millones | no disponible | en, ru, uk | apache-2.0 | GGUF cuantizado | Cuantizacion estatica; skip_mmproj indicado en metadatos |
| mradermacher/Magistral-Small-2509-Vision-i1-GGUF | ≈23,6 mil millones | no disponible | en, ru, uk | apache-2.0 (heredada del base) | GGUF cuantizado con imatrix | Misma base, cuants ponderados; habitualmente mejor calidad por tamano |
| EnlistedGhost/Magistral-Small-2509-Vision | ≈23,6 mil millones | no disponible | en, ru, uk | apache-2.0 | safetensors | Modelo base, incluye pesos completos y proyector multimodal |
| mistralai/Magistral-Small-2509 | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada | safetensors | Modelo original de Mistral AI sobre el que se construye la variante Vision |

No se dispone de datos de benchmarks ni de contexto que permitan una comparacion cuantitativa de rendimiento entre estas opciones. La comparacion se limita a parametros, licencia, formato y disponibilidad.

## Limitaciones y advertencias

- El proyector multimodal aparece marcado como omitido (skip_mmproj: 1) en los metadatos de la cuantizacion: es probable que estos ficheros no procesen imagenes de forma nativa y que solo funcionen como modelo de texto.
- No hay resultados de benchmarks publicados, por lo que la calidad real del modelo base y el impacto de cada cuantizacion no estan cuantificados.
- Los cuants de menor tamano (Q2_K, Q3_K_S, Q3_K_M) degradan la calidad de forma notable; la propia model card califica Q3_K_M como "lower quality" y recomienda Q4_K_S y Q4_K_M como opciones rapidas.
- Idiomas declarados: solo ingles, ruso y ucraniano. No se declara castellano, por lo que su uso en espanol puede dar resultados inconsistentes.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala; no se documentan medidas especificas de mitigacion ni tasas de error.
- Sesgos: no se publica informacion sobre la composicion del dataset de entrenamiento ni sobre evaluaciones de sesgo, por lo que no pueden caracterizarse los sesgos conocidos.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, con obligacion de conservar avisos de licencia y atribucion. Conviene verificar la cadena completa de licencias del modelo base y del Magistral original antes de un despliegue comercial.
- Trazabilidad: el modelo base es una adaptacion de un tercero (EnlistedGhost), no una publicacion oficial de Mistral AI, lo que reduce la reproducibilidad y la documentacion disponible.
- Adopcion limitada: 640 descargas y 0 likes en la fecha de actualizacion, sin validacion comunitaria amplia ni incidencias reportadas publicamente.
- La ficha no documenta la longitud de contexto, el soporte de tool calling ni el comportamiento en agentes multi-paso para esta cuantizacion concreta.

## Enlaces

- Repositorio HuggingFace de la cuantizacion: https://huggingface.co/mradermacher/Magistral-Small-2509-Vision-GGUF
- Cuants con imatrix: https://huggingface.co/mradermacher/Magistral-Small-2509-Vision-i1-GGUF
- Modelo base: https://huggingface.co/EnlistedGhost/Magistral-Small-2509-Vision
- Modelo original de la familia: https://huggingface.co/mistralai/Magistral-Small-2509
- Pagina de resumen del autor para este modelo: https://hf.tst.eu/model#Magistral-Small-2509-Vision-GGUF
- Guia de uso de ficheros GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Directorio de modelos (ficha local-ai-zone): https://local-ai-zone.github.io/models/magistral-small-2509.html
- Directorio de modelos (ficha Portkey, modelo de API): https://portkey.ai/models/mistral-ai/magistral-small-2509
- Directorio de modelos (ficha ModelMeta): https://www.modelmeta.dev/models/magistral-small-2509
