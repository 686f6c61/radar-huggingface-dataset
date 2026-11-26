# IsumiAI/OCRia-1-oQ4e

## Resumen

OCRia-1-oQ4e es una cuantizacion de 4 bits del modelo multimodal OCRia-1 de LlamaIndex, publicada por el usuario IsumiAI en Hugging Face. Se trata de un modelo de tipo image-text-to-text orientado al parseo de documentos y reconocimiento optico de caracteres (OCR), construido sobre la arquitectura Qwen 3.5 segun los tags del repositorio. Con 4.539.265.536 parametros totales (~4,54 mil millones) y un peso de repositorio de 3,2 GB, esta pensado para ejecutarse en entornos con recursos limitados, en particular sobre hardware Apple Silicon mediante la libreria MLX.

La relevancia de esta publicacion radica en su formato: emplea la cuantizacion propietaria "oQ4e" (omlx) en lugar de las cuantizaciones estandar de MLX o GGUF, lo que sugiere un pipeline de optimizacion propio del autor. Al derivar de OCRia-1, hereda las capacidades de extraccion estructurada de documentos (tablas, formularios, texto en layout complejo) del modelo original, pero en una version mas ligera y apta para inferencia local.

El acceso al modelo esta restringido (gated): es necesario aceptar las condiciones de la licencia `ocria-1-license` en Hugging Face antes de poder descargar los pesos. En el momento de redactar esta ficha el repositorio no registra descargas ni likes, y no se han publicado idiomas soportados ni resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen 3.5 segun tags |
| Parametros totales | 4.539.265.536 (~4,54 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, esquema propietario "oQ4e" (omlx) |
| Idiomas soportados | no disponible |
| Licencia | ocria-1-license (acceso restringido, requiere aceptacion) |
| Formato de pesos | safetensors (libreria MLX) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del checkpoint `llamaindex/OCRia-1`, que los tags identifican con la familia arquitectonica `qwen3_5`. Se trata por tanto de un transformer multimodal con torre de vision y decoder de lenguaje, disenado para tareas de image-text-to-text centradas en documentos. La publicacion de IsumiAI no aporta informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo original paso por fases de RLHF o DPO; todos esos datos deben consultarse en la ficha del modelo base.

La innovacion tecnica destacable de esta version es la cuantizacion "oQ4e" sobre MLX, un esquema de 4 bits no estandar que el autor etiqueta como `omlx`. Frente a las cuantizaciones MLX convencionales (grupos de 32 o 64 con escalas por bloque), este formato propietario no documenta en la informacion disponible su granularidad, su tratamiento de outliers ni las perdidas de calidad asociadas, por lo que su comportamiento respecto al modelo original en tareas de OCR fino (digitos, tablas densas, caracteres poco frecuentes) no puede verificarse a priori.

## Capacidades

- Reconocimiento optico de caracteres (OCR) sobre imagenes de documentos.
- Parseo de documentos: extraccion de texto estructurado a partir de capturas, escaneos y PDFs renderizados.
- Comprension image-text-to-text: respuestas conversacionales condicionadas por una imagen de entrada.
- Generacion de texto conversacional multi-turno (tag `conversational`).
- Extraccion de tablas y contenido con layout complejo (capacidad heredada del modelo base OCRia-1, orientado a document parsing).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, vision adicional o audio: no disponible; unicamente se confirma entrada de imagen y salida de texto.

## Casos de uso

- Digitalizacion de facturas y albaranes: el modelo recibe la imagen del documento y devuelve el texto y los campos estructurados, lo que permite alimentar un ERP o un pipeline contable sin intervencion manual. Su tamano de ~4,5 B en 4 bits lo hace viable en estaciones de trabajo locales.
- Extraccion de tablas de informes financieros: al estar especializado en document parsing, puede transcribir tablas densas a Markdown o JSON para su posterior procesamiento analitico, reduciendo el trabajo de transcripcion en equipos de analisis.
- Procesamiento de formularios escaneados en administracion publica: integrado en un flujo batch sobre MLX en equipos Apple, permite extraer campos de formularios sin enviar documentos sensibles a la nube, lo que simplifica el cumplimiento de proteccion de datos.
- Indexacion de archivos corporativos para RAG: el modelo actua como etapa de OCR dentro de un pipeline de retrieval-augmented generation, convirtiendo PDFs escaneados en texto indexable antes de pasarlos a un modelo de embeddings.
- Digitalizacion de patrimonio documental y archivos historicos: para digitalizadores que trabajan con escaneos de baja calidad, un modelo OCR local y ligero permite iterar sobre preprocesado y postprocesado sin costes de API por pagina.
- Asistencia a la accesibilidad: conversion de imagenes de documentos (capturas, fotos de libros) en texto legible para lectores de pantalla, ejecutandose en el propio dispositivo del usuario gracias a su huella de memoria reducida.
- Prototipado rapido en Mac: al usar MLX y 4 bits, sirve para validar ideas de producto de document AI en un MacBook antes de escalar a un despliegue en servidor con el modelo base sin cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de OCR (CER, WER), de comprension de documentos (DocVQA, ChartQA) ni comparaciones con el modelo base sin cuantizar, por lo que no es posible cuantificar la perdida de calidad introducida por la cuantizacion oQ4e.

## Requisitos de hardware

- VRAM/ memoria unificada estimada: los pesos ocupan aproximadamente 3,2 GB en 4 bits; con overhead de activaciones y cache KV, un presupuesto de 5-6 GB de memoria es razonable para contexto moderado, aunque no se ha publicado una cifra oficial.
- GPU recomendadas: al estar empaquetado para MLX, el destino natural son chips Apple Silicon (series M1, M2, M3 y M4, con especial holgura en variantes Pro, Max y Ultra). Para GPUs NVIDIA no se distribuyen pesos en este repositorio.
- Cabe en GPU de consumo: si, en cualquier Mac con 8 GB o mas de memoria unificada; en el ecosistema NVIDIA haria falta reconvertir los pesos a otro formato, lo que no esta soportado por esta publicacion.
- Opciones de despliegue: `mlx-lm` y el ecosistema MLX (incluido el runtime omlx referenciado en los tags). No se ofrecen pesos GGUF, por lo que llama.cpp y Ollama no son aplicables directamente; vLLM y TGI no soportan MLX.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Acceso |
|---|---|---|---|---|---|
| OCRia-1-oQ4e (este) | ~4,54 B | no disponible | safetensors MLX, 4 bits oQ4e | ocria-1-license | Restringido (gated) |
| llamaindex/OCRia-1 (base) | no disponible en esta ficha | no disponible | safetensors | ocria-1-license | Segun ficha del autor |
| Otros OCR multimodales de ~4 B (p. ej. variantes Qwen-VL cuantizadas) | ~4 B | depende de la variante | GGUF, MLX, safetensors | Apache 2.0 o similar segun variante | Abierto |

La comparacion cuantitativa con alternativas no es posible con los datos disponibles: no se han publicado metricas del modelo base ni de esta cuantizacion, y el esquema oQ4e carece de documentacion publica sobre su impacto en precision. Frente a cuantizaciones GGUF de la misma familia, la diferencia practica es el runtime (MLX frente a llama.cpp) y la licencia mas restrictiva de OCRia-1.

## Limitaciones y advertencias

- Acceso restringido: es necesario aceptar la licencia `ocria-1-license` en Hugging Face; no es un modelo de descarga libre inmediata.
- Licencia no estandar: las condiciones de uso comercial deben revisarse en el texto de la licencia; no se dispone de un resumen verificado en la informacion proporcionada.
- Cuantizacion propietaria sin documentacion: el esquema oQ4e no publica metodologia ni evaluacion, por lo que la degradacion en OCR de precision (numeros, tablas, caracteres similares) es desconocida.
- Sin benchmarks: no hay evidencia publicada de calidad frente al modelo base ni frente a alternativas.
- Riesgo de alucinacion: como todo modelo generativo aplicado a documentos, puede inventar texto ausente en la imagen, especialmente en escaneos de baja calidad; se recomienda validacion posterior en flujos criticos.
- Idiomas no declarados: se desconoce que lenguas cubre con calidad, lo que desaconseja su uso en produccion multilingue sin evaluacion previa.
- Ecosistema limitado a MLX: no hay pesos GGUF ni integracion con vLLM o TGI, lo que restringe el despliegue en servidores Linux con GPU NVIDIA.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la ficha; no hay comunidad que haya validado el modelo.
- Fecha de publicacion anomala en los metadatos (2026-11-26): conviene verificar la integridad y procedencia de los pesos antes de usarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IsumiAI/OCRia-1-oQ4e
- Modelo base: https://huggingface.co/llamaindex/OCRia-1
- Licencia: https://huggingface.co/IsumiAI/OCRia-1-oQ4e/blob/main/LICENSE (referencia generica; verificar en el repositorio)
- Libreria MLX: https://github.com/ml-explore/mlx
- MLX LM: https://github.com/ml-explore/mlx-lm
