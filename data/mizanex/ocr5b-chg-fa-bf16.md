# Mizanex/ocr5B-chg-fa-bf16

## Resumen

Mizanex/ocr5B-chg-fa-bf16 es un modelo de vision-lenguaje especializado en reconocimiento optico de caracteres (OCR) sobre documentos historicos en chagatai (chg) y persa (fa). Lo desarrolla el usuario Mizanex como un fine-tuning del modelo base llamaindex/OCRia-1, un modelo de 5.174.964.736 parametros (aproximadamente 5,17 mil millones) construido sobre la arquitectura qwen3_5 y orientado a la tarea image-text-to-text. El resultado se distribuye como un merge de pesos en precision bf16, en formato safetensors, con un tamano de repositorio de 10,4 GB.

El modelo resuelve un problema muy concreto y poco cubierto por los modelos generalistas: la transcripcion de texto manuscrito e impreso en lenguas historicas de Asia Central y Persia, donde los OCR convencionales rinden mal por la variabilidad caligrafica, la ortografia arcaica y la escasez de corpus anotados. Al estar afinado sobre un dataset especifico (shbaydadaev/ocr-chg-fa-dataset) y derivar de un modelo OCR ya entrenado, se posiciona como una herramienta de nicho para digitalizacion de archivos y proyectos de humanidades digitales.

Su relevancia actual es limitada pero clara: la mayoria de los modelos OCR multimodales cubren ingles, chino o lenguas europeas, y las variantes para persa historico y chagatai son practicamente inexistentes en abierto. La ficha debe leerse con cautela, ya que el modelo no presenta descargas ni likes en el momento de la consulta y el acceso esta restringido en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer multimodal image-text-to-text) |
| Parametros totales | 5.174.964.736 (~5,17 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (pesos distribuidos en bf16); no se documentan otras variantes |
| Idiomas soportados | chg (chagatai), fa (persa) |
| Licencia | ocria-1-license (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors |
| Modelo base | llamaindex/OCRia-1 |
| Metodo de ajuste | LoRA fusionado (merged) sobre el modelo base |
| Dataset de entrenamiento | shbaydadaev/ocr-chg-fa-dataset |
| Acceso | restringido (gated), requiere aceptar condiciones |
| Tamano del repositorio | 10,4 GB |
| Libreria | transformers |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base llamaindex/OCRia-1, identificada en las etiquetas como qwen3_5, es decir, una familia de transformers multimodales de tipo image-text-to-text. No se dispone de informacion publica en la ficha sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni el codificador visual empleado. Tampoco se documenta la longitud de contexto ni si incorpora innovaciones como atencion lineal o decodificacion especulativa.

El entrenamiento consiste en un ajuste fino mediante LoRA sobre el modelo OCRia-1, posteriormente fusionado en los pesos finales y exportado en bf16. El corpus utilizado es shbaydadaev/ocr-chg-fa-dataset, un dataset orientado a OCR de chagatai y persa; no se especifican en la informacion disponible el numero de tokens, la composicion exacta del dataset, el numero de imagenes ni si hubo etapas de RLHF o DPO. Tampoco se detalla la resolucion de imagen de entrada ni el preprocesado aplicado a los documentos historicos.

## Capacidades

- Reconocimiento optico de caracteres sobre imagenes de documentos, con salida de texto transcrito.
- Transcripcion de texto en chagatai (chg), lengua turcica historica de Asia Central.
- Transcripcion de texto en persa (fa), incluyendo potencialmente grafias y ortografia historicas.
- Procesamiento de documentos historicos, segun la etiqueta historical-documents.
- Interaccion conversacional: las etiquetas incluyen "conversational", lo que sugiere soporte de turnos multi-turno en torno a la imagen.
- Entrada multimodal imagen-texto (pipeline image-text-to-text).
- No se documenta soporte de tool calling, function calling, agentes, vision general, audio ni modo thinking.

## Casos de uso

- Digitalizacion de archivos historicos en chagatai: el modelo permite convertir imagenes de manuscritos en texto plano para su indexacion y busqueda, un escenario donde los OCR comerciales fallan por falta de cobertura de la lengua.
- Catalogacion de fondos persas en bibliotecas: transcripcion asistida de paginas escaneadas para generar metadatos y facilitar la consulta por investigadores.
- Investigacion en humanidades digitales: extraccion de corpus textual a partir de facsimiles para analisis linguistico, estudio de variantes ortograficas o creacion de ediciones diplomaticas.
- Construccion de datasets paralelos: uso del modelo para preanotar transcripciones que luego se revisan manualmente, reduciendo el coste de anotacion en lenguas de bajos recursos.
- Preservacion patrimonial: conversion de documentos en riesgo de deterioro a formato textual consultable, con el OCR como primer paso del pipeline de conservacion digital.
- Busqueda full-text sobre archivos escaneados: integracion del modelo en un pipeline que genere texto y lo cargue en un motor de busqueda para consulta de documentos que antes solo eran imagenes.
- Analisis de documentos legales o administrativos historicos en persa: extraccion de clausulas y fechas para estudios historicos o genealogicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 10-11 GB solo para pesos (5,17 mil millones de parametros a 2 bytes por parametro), mas el coste del codificador visual, las activaciones y el cache KV; en la practica se recomienda reservar 14-16 GB.
- GPU profesionales recomendadas: A100 (40/80 GB), H100, L40S o A10G para despliegues con concurrencia.
- GPU de consumo: cabe en tarjetas con 16 GB o mas, como RTX 4080, RTX 4090 o RTX 5090; en GPUs de 12 GB requeriria cuantizacion a 8 bits, no distribuida oficialmente.
- Opciones de despliegue: transformers (libreria declarada), y potencialmente vLLM o TGI si la arquitectura qwen3_5 multimodal esta soportada por esas herramientas; llama.cpp y Ollama no estan confirmados para esta variante.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas OCR | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mizanex/ocr5B-chg-fa-bf16 | ~5,17 B | no disponible | chg, fa | ocria-1-license | gated en Hugging Face |
| llamaindex/OCRia-1 (base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| OCR generalistas multimodales (p. ej. variantes Qwen-VL) | variable | variable | principalmente en, zh y lenguas europeas | variable | abiertos |
| OCR comerciales (cloud) | no aplica | no aplica | amplio pero sin chagatai | propietaria | API de pago |

La comparativa cuantitativa con alternativas no esta disponible: no hay datos publicos de rendimiento del modelo ni de su base que permitan una comparacion rigurosa. La principal ventaja diferencial es la cobertura de chagatai y persa historico, ausente en la mayoria de alternativas.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y exige aceptar condiciones en Hugging Face antes de descargar los pesos.
- Licencia ocria-1-license: es una licencia propia del modelo base, no estandar; es imprescindible revisar sus terminos antes de cualquier uso comercial, ya que puede imponer restricciones adicionales.
- Ausencia de benchmarks: no hay evidencia publicada de calidad de transcripcion (CER/WER) que permita estimar la fiabilidad en produccion.
- Riesgo de alucinacion: como modelo generativo multimodal, puede producir texto plausible que no aparece en la imagen, especialmente en manuscritos degradados; se recomienda verificacion humana.
- Cobertura linguistica limitada a chg y fa: no debe esperarse un buen rendimiento en arabe, turco moderno u otras lenguas aunque compartan alfabeto.
- Sesgos de dominio: entrenado sobre un unico dataset, puede generalizar mal a estilos caligraficos, epocas o calidades de escaneo no representadas.
- Sin datos de contexto: se desconoce la ventana maxima, lo que dificulta planificar documentos de muchas paginas en una sola pasada.
- Madurez: cero descargas y cero likes en el momento de la consulta; el modelo no tiene validacion comunitaria.
- Sin informacion sobre cuantizaciones: no hay GGUF ni variantes de 8/4 bits, lo que limita el despliegue en hardware modesto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mizanex/ocr5B-chg-fa-bf16
- Modelo base: https://huggingface.co/llamaindex/OCRia-1
- Dataset de entrenamiento: https://huggingface.co/datasets/shbaydadaev/ocr-chg-fa-dataset
