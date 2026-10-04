# keystats/Legend_ocr_llama3.2_11b_vision_lora-highavg

## Resumen

`keystats/Legend_ocr_llama3.2_11b_vision_lora-highavg` es un adaptador LoRA publicado por el usuario keystats sobre el modelo multimodal `meta-llama/Llama-3.2-11B-Vision-Instruct`. Por el nombre del repositorio y por los otros modelos del mismo autor (`Legend_ocr`, basado en Qwen2.5-VL, y `Legend_ocr_v3`, basado en Qwen3-VL), se trata de un ajuste fino orientado a reconocimiento optico de caracteres (OCR) y extraccion de texto a partir de imagenes y documentos. El repositorio contiene unicamente los pesos del adaptador (2,4 GB en safetensors), no un modelo completo: para ejecutarlo es imprescindible descargar por separado el modelo base de Meta.

El artefacto es un adaptador PEFT (libreria `peft`, version 0.21.2 declarada en la model card) con `pipeline_tag: text-generation`, aunque el modelo base es de tipo imagen-texto-a-texto. El repositorio no aporta informacion sobre el dataset de entrenamiento, hiperparametros, rango del LoRA, modulos objetivo ni resultados de evaluacion: la model card es la plantilla por defecto de HuggingFace con todos los campos marcados como `[More Information Needed]`.

Su relevancia es limitada y practica: es un adaptador especializado, con 0 descargas y 0 likes en el momento de la consulta, util unicamente para quien necesite OCR sobre la arquitectura Llama 3.2 Vision en lugar de las alternativas de Qwen que el mismo autor publica. Al carecer de licencia declarada y de documentacion de entrenamiento, su adopcion en produccion requiere una verificacion previa por parte del equipo que lo integre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer autorregresivo multimodal decoder-only con torre de vision |
| Parametros totales | No disponible para el adaptador (2,4 GB en safetensors); el modelo base se denomina comercialmente 11B |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en este repositorio (el modelo base declara 128.000 tokens segun la documentacion de Meta) |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base se puede cuantizar a 8/4 bits con herramientas de terceros (GGUF, AWQ, GPTQ) |
| Idiomas soportados | No disponible en este repositorio (el modelo base declara oficialmente 8 idiomas) |
| Licencia | No disponible (el modelo base se distribuye bajo Llama 3.2 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | meta-llama/Llama-3.2-11B-Vision-Instruct |
| Tipo de artefacto | Adaptador, no modelo completo; requiere cargar el modelo base |
| Libreria declarada | peft 0.21.2, transformers |
| Tamano del repositorio | 2,4 GB |
| Fecha de publicacion | 2026-10-04 segun los metadatos de HuggingFace |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador hereda la arquitectura del modelo base: un transformer autorregresivo decoder-only con atencion por ventanas (Grouped Query Attention), entrenado como modelo de lenguaje, al que se acopla una torre de vision que proyecta las caracteristicas visuales al espacio de embeddings del modelo de lenguaje. El ajuste se realiza mediante LoRA, una tecnica de adaptacion de bajo rango que congela los pesos originales e introduce matrices de rango reducido en determinadas capas, lo que explica que el repositorio ocupe solo 2,4 GB frente a las decenas de gigabytes del modelo base en precision completa.

No hay informacion disponible sobre el proceso de entrenamiento: se desconocen el dataset empleado (presumiblemente documental o de OCR, dado el nombre `Legend_ocr`), el numero de tokens de entrenamiento, la composicion de los datos, el rango y alpha del LoRA, los modulos objetivo, la tasa de aprendizaje, la precision utilizada o si hubo alguna fase de alineacion adicional. El sufijo `highavg` del nombre sugiere algun tipo de promediado de pesos o de checkpoints, pero el autor no lo documenta, por lo que no se puede confirmar. No se declara ninguna innovacion tecnica especifica mas alla del propio ajuste.

## Capacidades

- Reconocimiento optico de caracteres: extraccion de texto desde imagenes y documentos, que es el proposito deducible del nombre del repositorio.
- Comprension de imagenes y razonamiento visual, heredados del modelo base Llama-3.2-11B-Vision-Instruct.
- Generacion de texto conversacional y respuesta a instrucciones, segun el `pipeline_tag` declarado.
- Soporte de tool calling y de function calling: no confirmado en este repositorio; el modelo base si lo soporta, pero no hay evidencia de que el ajuste LoRA lo preserve.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingues: no disponibles como dato del autor; el modelo base declara 8 idiomas (ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes).
- Capacidad de seguir instrucciones sobre documentos largos: dependiente de la ventana de contexto del modelo base, no verificada para este adaptador.
- Modo de razonamiento explicito (thinking), audio o video: no disponibles.

## Casos de uso

- Digitalizacion masiva de archivos escaneados: el adaptador se aplicaria sobre el modelo base para convertir lotes de imagenes de documentos en texto plano estructurado, aprovechando que el ajuste esta orientado especificamente a OCR y que el modelo base admite entradas de imagen de alta resolucion.
- Extraccion de datos de facturas y albaranes: en un pipeline de procesamiento inteligente de documentos, el modelo podria transcribir los campos relevantes de cada imagen para despues aplicar reglas o expresiones regulares sobre el texto extraido. Es adecuado por la especializacion del ajuste, aunque exigiria validacion manual por la ausencia de benchmarks.
- Digitalizacion de formularios con texto manuscrito: el modelo podria transcribir respuestas manuscritas en formularios escaneados, un escenario donde los OCR clasicos rinden peor y los modelos vision-lenguaje aportan contexto.
- Accesibilidad documental: conversion de documentos escaneados o PDFs no accesibles a texto que pueda ser leido por sintetizadores de voz, usando el modelo como motor de transcripcion en un servicio interno.
- Indexacion de corpus documental para RAG: transcripcion previa de un repositorio de PDFs escaneados para que un sistema de recuperacion aumentada pueda buscar sobre el texto, aprovechando la ventana de contexto del modelo base para procesar paginas completas.
- Revision y prevalidacion en procesos KYC: extraccion de los campos de documentos de identidad o comprobantes de domicilio en un flujo de alta de clientes, siempre con verificacion humana posterior dado el riesgo de error en caracteres ambiguos.
- Automatizacion en logistica: lectura de etiquetas, albaranes y hojas de ruta a pie de muelle mediante una aplicacion que envie fotografias al modelo y devuelva campos estructurados.
- Analisis de documentacion tecnica y planos: extraccion de textos, cotas y leyendas de planos o esquemas para su volcado a bases de datos de mantenimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor incluye la seccion de evaluacion con el marcador `[More Information Needed]` y no se han encontrado resultados externos para este adaptador concreto. Los modelos del mismo autor publicados bajo la familia `Legend_ocr` (sobre Qwen2.5-VL y Qwen3-VL) no aportan cifras que puedan atribuirse a este adaptador.

## Requisitos de hardware

- El adaptador ocupa 2,4 GB, pero la inferencia requiere cargar el modelo base completo: en bf16 o fp16, los pesos del modelo de 11B ocupan aproximadamente 22 GB, mas activaciones, cache KV y la torre de vision.
- VRAM estimada: en torno a 26-32 GB en bf16 con lotes pequenos, y aproximadamente 10-14 GB si se cuantiza el modelo base a 4 bits. Estas cifras son estimaciones derivadas del numero de parametros, no mediciones publicadas.
- GPU recomendadas: A100 40 GB o 80 GB, H100 80 GB, L40S 48 GB o A6000 48 GB para ejecucion en precision completa sin cuantizar.
- GPU de consumo: si es viable en 4 bits en tarjetas de 12-16 GB (RTX 4070 Ti, RTX 4080, RTX 4090), y comodo en 24 GB. En bf16 sin cuantizar no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: `transformers` + `peft` (cargando el adaptador sobre el modelo base, con opcion de fusionarlo con `merge_and_unload`), vLLM para el modelo base con soporte multimodal, TGI y Ollama o llama.cpp con el modelo base cuantizado, teniendo en cuenta que la integracion del LoRA en estos ultimos puede requerir fusionar los pesos antes de convertir a GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Modalidad | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| keystats/Legend_ocr_llama3.2_11b_vision_lora-highavg | Adaptador sobre base 11B | LoRA (PEFT) | Imagen-texto-a-texto (heredada) | No disponible | No declarada | 0 descargas, 0 likes |
| meta-llama/Llama-3.2-11B-Vision-Instruct | 11B (nomenclatura del fabricante) | Modelo completo | Imagen-texto-a-texto | 128.000 tokens segun Meta | Llama 3.2 Community License | Ampliamente distribuido, disponible en Ollama |
| keystats/Legend_ocr | No disponible | Modelo completo sobre Qwen2.5-VL | Imagen-texto-a-texto | No disponible | No disponible | Publicado por el mismo autor |
| keystats/Legend_ocr_v3 | 8B segun el proveedor de hosting | Modelo completo sobre Qwen3-VL | Imagen-texto-a-texto | No disponible | No disponible | Publicado por el mismo autor |

La diferencia principal frente al modelo base es que este artefacto es un adaptador y no un modelo autonomo, y frente a las otras dos variantes de la familia `Legend_ocr` radica en la arquitectura subyacente (Llama frente a Qwen). No hay datos publicos que permitan comparar el rendimiento en OCR entre estas tres opciones.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, pero el adaptador hereda los sesgos del modelo base Llama 3.2, entrenado predominantemente con datos en ingles.
- Riesgo de alucinacion: no hay evaluacion publicada para este adaptador; en tareas de OCR, los modelos vision-lenguaje pueden inventar caracteres o completar palabras de forma plausible cuando la imagen es de baja calidad.
- No se documenta el dataset de entrenamiento, por lo que no se puede evaluar la cobertura de idiomas, tipos de documento ni dominios.
- La licencia del adaptador no esta declarada en HuggingFace. Cualquier uso comercial depende de la Llama 3.2 Community License del modelo base, que impone condiciones de atribucion y una clausula de escala (700 millones de usuarios activos mensuales).
- Sesgos tipicos del OCR: rendimiento desigual entre alfabetos latin y no latino, problemas con caligrafia, tablas complejas, formulas matematicas y documentos con ruido o baja resolucion.
- El sufijo `highavg` no esta explicado por el autor: no se puede saber si implica un promediado de checkpoints ni que impacto tiene en la calidad resultante.
- Cero descargas y cero likes en el momento de la consulta, sin historial de validacion por parte de la comunidad.
- Los metadatos declaran `pipeline_tag: text-generation`, lo que puede inducir a error: la modalidad real es imagen-texto-a-texto y el adapter no funciona sin el modelo base.
- No se han publicado resultados de evaluacion, por lo que cualquier despliegue en produccion deberia ir precedido de una bateria de pruebas propia con documentos representativos del dominio objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/keystats/Legend_ocr_llama3.2_11b_vision_lora-highavg
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-11B-Vision-Instruct
- Legend_ocr (variante sobre Qwen2.5-VL): https://huggingface.co/keystats/Legend_ocr
- Legend_ocr_v3 (variante sobre Qwen3-VL): https://huggingface.co/keystats/Legend_ocr_v3
- Archivos de Legend_ocr_v3: https://huggingface.co/keystats/Legend_ocr_v3/tree/main
- Pagina de despliegue de Legend_ocr_v3 en Featherless: https://featherless.ai/models/keystats/Legend_ocr_v3
- Llama 3.2 Vision 11B en Ollama: https://ollama.com/library/llama3.2-vision:11b
- Leaderboard de modelos autoalojados: https://onyx.app/self-hosted-llm-leaderboard
- Referencia del tag `arxiv:1910.09700` presente en el repositorio (Lacoste et al., calculadora de impacto ambiental; no es el paper de este modelo): https://arxiv.org/abs/1910.09700
