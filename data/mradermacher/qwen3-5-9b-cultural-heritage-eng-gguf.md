# mradermacher/Qwen3.5-9B-cultural-heritage-eng-GGUF

## Resumen

Qwen3.5-9B-cultural-heritage-eng es un modelo de lenguaje y vision (vision-language) de 8.953.803.264 parametros, afinado mediante LoRA sobre una base Qwen3.5 de 9B por el equipo Yale Cultural Heritage. Su proposito especifico es la transcripcion automatica de texto manuscrito (HTR, handwritten text recognition) y OCR sobre materiales de archivo: manuscritos, documentos historicos y colecciones patrimoniales digitalizadas. El modelo se entreno con el dataset `yale-cultural-heritage/ai-project-transcriptions`, orientado a transcripciones de archivos y en colaboracion con el Smithsonian Transcription Center.

La version aqui descrita es la cuantizacion GGUF estatica publicada por mradermacher, que convierte los pesos originales en formatos ligeros (desde Q2_K de 3,9 GB hasta f16 de 18 GB) para su uso con llama.cpp y herramientas compatibles. Incluye ademas los ficheros `mmproj` necesarios para la parte multimodal (procesamiento de imagenes), lo que permite ejecutar el pipeline completo de OCR/HTR en local.

Es relevante porque cubre un nicho poco atendido por los modelos generalistas: la transcripcion fiable de caligrafia historica en ingles, con licencia Apache 2.0 y pesos abiertos, lo que facilita su integracion en proyectos de humanidades digitales, archivos y bibliotecas sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (base Qwen3.5) con adaptador LoRA; no se detalla la configuracion interna |
| Parametros totales | 8.953.803.264 (aproximadamente 9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas) y safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo parte de una base Qwen3.5 de 9B, una arquitectura transformer multimodal (vision-language) que procesa conjuntamente imagenes y texto. Sobre esa base se aplico un ajuste fino con LoRA especifico para transcripcion de patrimonio cultural, segun indica la model card del modelo original. El resultado conserva las capacidades del modelo base y las especializa en lectura de manuscritos y documentos de archivo.

El entrenamiento utilizo el dataset `yale-cultural-heritage/ai-project-transcriptions`, compuesto por transcripciones de materiales patrimoniales, con mencion explicita al Smithsonian Transcription Center. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detallan innovaciones tecnicas adicionales mas alla del propio ajuste LoRA y del caracter multimodal heredado de Qwen3.5.

## Capacidades

- Reconocimiento optico de caracteres (OCR) sobre documentos impresos y digitalizaciones.
- Reconocimiento de texto manuscrito (HTR) en ingles, incluyendo caligrafia historica de archivos y manuscritos.
- Transcripcion de documentos patrimoniales y colecciones de archivo.
- Procesamiento multimodal: acepta imagenes como entrada junto con instrucciones de texto.
- Generacion de texto conversacional (etiqueta `conversational` en el repositorio).
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su despliegue como servicio.
- Capacidades generales de razonamiento y lenguaje heredadas del modelo base Qwen3.5 de 9B.
- Soporte de tool calling y agentes: no confirmado en la informacion disponible.
- Capacidades multilingues: limitadas al ingles segun la model card.

## Casos de uso

- Digitalizacion de archivos historicos: el modelo puede transcribir lotes de imagenes de manuscritos y generar texto plano alineado con cada pagina, reduciendo el trabajo manual en proyectos de humanidades digitales.
- Colaboracion con plataformas de transcripcion ciudadana: integrable en flujos tipo Smithsonian Transcription Center para pretranscribir documentos y que voluntarios solo revisen y corrijan.
- Bibliotecas y hemerotecas: conversion de fondos documentales escaneados en texto buscable, habilitando motores de busqueda interna sobre colecciones hasta ahora solo consultables visualmente.
- Investigacion academica en historia y filologia: extraccion rapida de pasajes de manuscritos para analisis textual, con la ventaja de ejecucion local y licencia permisiva.
- Archivos municipales y eclesiasticos: transcripcion de registros manuscritos en ingles para su indexacion y publicacion en portales de datos abiertos.
- Preservacion digital en instituciones patrimoniales: generacion de capas de texto para repositorios IIIF o similares, mejorando la accesibilidad de las colecciones.
- Despliegue en local con llama.cpp: al ofrecer cuantizaciones desde 3,9 GB, permite ejecutar OCR/HTR en estaciones de trabajo sin GPU de datacenter, util en instituciones con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4-5 GB con Q2_K (3,9 GB de pesos), 5-7 GB con Q4_K_M (5,7 GB), 7-8 GB con Q6_K (7,5 GB) y 10-11 GB con Q8_0 (9,6 GB); a estas cifras hay que sumar el `mmproj` (0,7-1,0 GB) y el espacio para el contexto KV.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070/4080, RTX 4090 para cuantizaciones altas; A100 o H100 para despliegues concurrentes de mayor throughput.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 8 GB o mas usando cuantizaciones Q4 o inferiores; en GPUs de 6 GB solo con Q2_K/Q3 y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama (a partir del GGUF), y servidores compatibles con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI si se dispone de los pesos completos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-cultural-heritage-eng (este) | ~9B | no disponible | OCR/HTR patrimonial (ingles) | Apache 2.0 | GGUF + safetensors |
| Qwen3.5-9B base | ~9B | no disponible | Vision-language generalista | no disponible | safetensors |
| Modelos OCR/HTR especializados tipo TrOCR | no disponible | no disponible | OCR/HTR | variable | pesos abiertos |
| Modelos vision-language generalistas de ~7-9B | ~7-9B | variable | Multimodal general | variable | variable |

La comparativa cuantitativa con alternativas concretas no esta disponible en la informacion proporcionada; los datos de la tabla se limitan a lo que consta en el repositorio y en la model card.

## Limitaciones y advertencias

- Solo soporta ingles; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Es un ajuste especializado en patrimonio cultural: su rendimiento fuera de ese dominio (documentos modernos, formularios, facturas) no esta documentado y podria degradarse.
- Riesgo de alucinacion inherente a los modelos generativos: en transcripcion puede inventar palabras o completar lineas ilegibles, por lo que se recomienda revision humana en produccion.
- No se han publicado benchmarks ni evaluaciones cuantitativas de calidad de transcripcion (CER/WER), lo que impide comparar su fiabilidad con alternativas.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) pueden degradar notablemente la calidad del OCR/HTR; para uso serio se recomienda Q4_K_M o superior.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5 y el dataset de entrenamiento pueden tener condiciones adicionales que conviene verificar antes de un despliegue comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: es un artefacto reciente y sin validacion comunitaria.
- No se dispone de informacion sobre sesgos especificos, longitud de contexto ni politicas de seguridad del modelo base.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.5-9B-cultural-heritage-eng-GGUF
- Modelo base: https://huggingface.co/yale-cultural-heritage/Qwen3.5-9B-cultural-heritage-eng
- Dataset de entrenamiento: https://huggingface.co/datasets/yale-cultural-heritage/ai-project-transcriptions
- Pagina de resumen de cuantizaciones de mradermacher: https://hf.tst.eu/model#Qwen3.5-9B-cultural-heritage-eng-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
