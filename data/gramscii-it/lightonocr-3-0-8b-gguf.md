# Gramscii-IT/LightOnOCR-3-0.8B-GGUF

## Resumen

LightOnOCR-3 0.8B es un modelo vision-language especializado en OCR (reconocimiento óptico de caracteres) desarrollado por LightOn. Resuelve la tarea de convertir imágenes de páginas en texto estructurado en orden de lectura, incluyendo etiquetas de bloque, cajas delimitadoras y tablas en HTML. El modelo original se distribuye en safetensors con aproximadamente 752 millones de parámetros, y esta ficha corresponde a la conversión a formato GGUF publicada por Gramscii-IT para su uso con llama.cpp.

La relevancia de esta variante radica en que permite ejecutar un modelo OCR de extremo a extremo en hardware de consumo mediante llama.cpp, sin depender de infraestructura de GPU dedicada ni de frameworks de inferencia pesados. El prompt de trabajo es `grounding`, con temperatura 0.1 y modo thinking desactivado, y la salida es la página en orden de lectura con cada bloque marcado por su etiqueta y su caja, y las tablas en HTML.

La conversión mantiene la licencia Apache 2.0 del modelo original de LightOn y solo modifica el formato y la precisión de los pesos. El repositorio ocupa 1.0 GB e incluye el modelo cuantizado en Q8_0 junto con el proyector de visión en F16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | vision-language para OCR (detalles de la arquitectura interna no disponibles en la informacion proporcionada) |
| Parametros totales | 752.393.024 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 24576 tokens (valor usado en el ejemplo de `llama-server` de la model card; no se confirma como maximo oficial) |
| Tipos de cuantizacion | Q8_0 (modelo) y F16 (proyector de vision) |
| Idiomas soportados | no disponible (el paper del modelo original se titula "multilingual", pero la lista concreta no se proporciona) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un vision-language de extremo a extremo de aproximadamente 752 millones de parametros orientado a OCR, segun el titulo del paper asociado ("A 1B End-to-End Multilingual Vision-Language Model for State-of-the-Art OCR"). La informacion proporcionada no detalla la arquitectura interna del transformer, la composicion del dataset de entrenamiento, el numero de tokens vistos ni si se aplicaron tecnicas de RLHF o DPO.

La conversion a GGUF se realizo con llama.cpp build b12503 (commit `4577932`) y transformers 5.5.4, en tres pasos: conversion de los safetensors originales a BF16 con `--no-mtp` (el modelo declara `mtp_num_hidden_layers` igual a 0, es decir, sin capas de prediccion multi-token), cuantizacion de BF16 a Q8_0 con `llama-quantize`, y conversion separada del proyector de vision a F16 con `--mmproj`. No se documentan innovaciones tecnicas adicionales en la informacion disponible.

## Capacidades

- OCR de extremo a extremo: convierte una imagen de pagina en texto en orden de lectura.
- Grounding espacial: cada bloque de texto se marca con su etiqueta y su caja delimitadora.
- Extraccion de tablas: las tablas se devuelven en formato HTML.
- Procesamiento multimodal imagen-texto: pipeline `image-text-to-text` con proyector de vision dedicado.
- Ejecucion local via llama.cpp con soporte de plantilla de chat (`--jinja`).
- Multilingue: el paper del modelo original se presenta como multilingue, aunque la lista de idiomas no esta disponible.
- No se documenta soporte de tool calling, function calling, agentes ni modo thinking en la informacion proporcionada; de hecho, la model card indica usar el modelo con thinking desactivado.

## Casos de uso

- Digitalizacion de documentos escaneados: enviar cada pagina como imagen con el prompt `grounding` para obtener el texto en orden de lectura, util para archivos historicos o facturas en papel.
- Extraccion estructurada de tablas: convertir tablas de informes o extractos en HTML para su posterior parseo e ingesta en bases de datos.
- Pipeline de OCR en local sin GPU dedicada: al estar en GGUF Q8_0 (unos 812 MB) con proyector F16 (unos 205 MB), puede desplegarse en estaciones de trabajo con llama.cpp.
- Preprocesado para RAG sobre documentos fisicos: generar texto con etiquetas de bloque y coordenadas para conservar la estructura del documento antes de trocearlo e indexarlo.
- Automatizacion de entrada de datos en back office: procesar lotes de formularios o albaranes y devolver bloques etiquetados que un script posterior mapea a campos.
- Anonimizado y revision de documentos: al ejecutarse en local, permite procesar material sensible sin enviar imagenes a servicios externos.
- Analisis de maquetacion: las cajas delimitadoras por bloque permiten reconstruir la estructura visual de la pagina para tareas de layout o comparacion de plantillas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la model card original de LightOn para la evaluacion del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo Q8_0 ocupa 811.841.408 bytes (unos 812 MB) y el proyector F16 204.986.848 bytes (unos 205 MB); el total de pesos ronda 1,0 GB, a lo que hay que sumar la cache KV segun el contexto configurado.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, el modelo es apto para GPU de consumo, aunque no se confirma compatibilidad ni rendimiento concreta.
- Cabe en GPU de consumo: si, por el tamano de los pesos (alrededor de 1 GB), aunque no se documentan modelos concretos ni cifras de rendimiento.
- Opciones de despliegue: llama.cpp mediante `llama-server` con `-m LightOnOCR-3-0.8B-Q8_0.gguf --mmproj mmproj-LightOnOCR-3-0.8B-F16.gguf --jinja -c 24576`. No se documentan otras opciones (vLLM, TGI, Ollama) en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible. Como referencia estructural, el propio modelo base `lightonai/LightOnOCR-3-0.8B` en safetensors seria la alternativa directa, con los mismos 752.393.024 parametros y licencia Apache 2.0, pero sin cuantizar y orientado a frameworks como transformers en lugar de llama.cpp.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Gramscii-IT/LightOnOCR-3-0.8B-GGUF | 752.393.024 | 24576 (segun ejemplo de uso) | Apache 2.0 | GGUF Q8_0 + mmproj F16 | Hugging Face |
| lightonai/LightOnOCR-3-0.8B | 752.393.024 | no disponible | Apache 2.0 | safetensors | Hugging Face |

## Limitaciones y advertencias

- La informacion proporcionada no documenta sesgos conocidos del modelo.
- Riesgo de alucinacion: no evaluado en la informacion disponible; en tareas OCR conviene validar la salida contra la imagen, especialmente en tablas y bloques densos.
- La lista de idiomas soportados no esta disponible, aunque el paper del modelo original se presenta como multilingue.
- El contexto de 24576 tokens aparece solo como valor de ejemplo en el comando de `llama-server`; no se confirma como maximo oficial del modelo.
- Restricciones de licencia: Apache 2.0 permite uso comercial con atribucion; la model card exige mantener el aviso de licencia y la atribucion a LightOn como obra original.
- Esta variante GGUF solo cambia formato y precision; cualquier problema de calidad del modelo base se hereda. La referencia para evaluacion e uso previsto es la model card original de LightOn.
- La model card indica usar el modelo con thinking desactivado y temperatura 0.1; desviarse de esa configuracion puede degradar la calidad del OCR.
- El repositorio registra 0 descargas y fue creado y actualizado el mismo dia (24 de noviembre de 2026), por lo que no hay evidencia de uso en produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Gramscii-IT/LightOnOCR-3-0.8B-GGUF
- Modelo base: https://huggingface.co/lightonai/LightOnOCR-3-0.8B
- Paper (arXiv): https://arxiv.org/abs/2601.14251
- llama.cpp: https://github.com/ggml-org/llama.cpp
