# Rheechan/paddleocr-v5-korean-onnx

## Resumen

PaddleOCR PP-OCRv5 (Korean) — ONNX mirror es un repositorio de espejo que redistribuye los pesos ONNX del sistema OCR PP-OCRv5 de PaddleOCR, adaptados para el reconocimiento de texto en coreano. Lo publica el usuario Rheechan con el objetivo declarado de poder ejecutar OCR de caracteres hangul directamente en el navegador mediante onnxruntime-web. No se trata de un modelo de lenguaje generativo, sino de un pipeline OCR compuesto por dos redes: un detector de texto (`det.onnx`) y un reconocedor (`rec.onnx`), acompanados de un diccionario de caracteres (`dict.txt`).

El contenido no ha sido modificado respecto a los originales: el detector procede de `PaddlePaddle/PP-OCRv5_mobile_det_onnx` y el reconocedor, junto con el diccionario, de `monkt/paddleocr-onnx` (variante `korean_PP-OCRv5_mobile_rec`). El autor incluye los hashes SHA-256 de cada fichero para verificar la integridad de la copia. La relevancia actual es practica: ofrece una via sencilla de desplegar OCR coreano en entornos web o ligeros sin depender del framework PaddlePaddle completo, usando el runtime ONNX.

El repositorio tiene un tamano declarado de 0.0 GB, cero descargas y cero likes en el momento de la consulta, y fue creado y actualizado el 2026-11-27. La licencia es Apache-2.0, heredada de PaddleOCR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline OCR de dos etapas: detector de texto (PP-OCRv5 mobile det) + reconocedor de texto (PP-OCRv5 mobile rec, coreano) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo OCR, no generativo) |
| Tipos de cuantizacion | no disponible (los ficheros se distribuyen en formato ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`det.onnx`, `rec.onnx`) + diccionario `dict.txt` |

## Arquitectura y entrenamiento

El repositorio no aporta informacion sobre la arquitectura interna ni sobre el proceso de entrenamiento. Por la procedencia de los ficheros, se trata de las variantes "mobile" de PP-OCRv5 de PaddleOCR: un modelo de deteccion de texto (tipicamente basado en segmentacion de mapa de probabilidad, estilo DBNet) y un modelo de reconocimiento de texto (tipicamente una red convolucional con cabeza CTC o similar). El reconocedor es la variante especifica para coreano (`korean_PP-OCRv5_mobile_rec`), lo que implica un vocabulario de salida ajustado al hangul codificado en `dict.txt`.

No se documentan en la model card el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de ajuste fino especificas. Tampoco se describen innovaciones tecnicas propias: el valor del repositorio es la conversion a ONNX y la redistribucion verificable, no una aportacion arquitectonica. Los hashes SHA-256 incluidos permiten comprobar que los ficheros coinciden con los originales citados.

## Capacidades

- Deteccion de regiones de texto en imagenes (etapa `det.onnx`).
- Reconocimiento de texto en coreano (hangul) a partir de recortes de imagen (etapa `rec.onnx`).
- Ejecucion en navegador mediante onnxruntime-web, segun el objetivo declarado del autor.
- Ejecucion en entornos ligeros con runtime ONNX (sin requerir PaddlePaddle).
- Verificacion de integridad de los pesos mediante los hashes SHA-256 publicados.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, agentes ni modo thinking.
- Capacidad multilingue limitada al coreano: no se documentan otros idiomas en este repositorio.

## Casos de uso

- Digitalizacion de documentos coreanos en el navegador: integracion de `det.onnx` y `rec.onnx` con onnxruntime-web para extraer texto de imagenes sin enviar datos a un servidor, adecuado por el enfoque del autor y la ligereza de las variantes mobile.
- Procesamiento por lotes de formularios y facturas en coreano: el pipeline det+rec permite localizar y transcribir campos de texto en entornos de back-end con runtime ONNX, evitando la dependencia de PaddlePaddle.
- Accesibilidad y traduccion de capturas de pantalla: extraccion de texto hangul de imagenes para alimentar lectores de pantalla o servicios de traduccion, aprovechando la ejecucion local.
- Indexacion y busqueda de archivos escaneados: conversion de PDFs e imagenes coreanas a texto para motores de busqueda o sistemas RAG, usando el reconocedor coreano para la transcripcion.
- Verificacion de integridad en pipelines de datos: los hashes SHA-256 publicados permiten validar que los pesos desplegados coinciden con los originales antes de incorporarlos a produccion.
- Prototipado rapido en aplicaciones web: al ser ficheros ONNX autonomos, se pueden cargar en demos o herramientas internas sin infraestructura de servidor dedicada.
- Automatizacion de extraccion de texto en dispositivos con recursos limitados: las variantes mobile estan pensadas para entornos con poca capacidad de computo, lo que encaja con ejecucion en cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al tratarse de variantes mobile de OCR, los requisitos son muy inferiores a los de un LLM, pero no se documentan cifras.
- GPU recomendadas: no disponible. El diseno apunta a ejecucion en CPU o en navegador (onnxruntime-web), por lo que no se especifican GPU concretas.
- Compatibilidad con GPU de consumo: no disponible; el objetivo declarado es la ejecucion en navegador, lo que sugiere que no requiere GPU dedicada.
- Opciones de despliegue: ONNX Runtime (Python, C++, JS), onnxruntime-web en navegador; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un pipeline OCR).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rheechan/paddleocr-v5-korean-onnx | OCR (det+rec) | coreano | ONNX | Apache-2.0 | Hugging Face |
| PaddlePaddle/PP-OCRv5_mobile_det_onnx | Detector de texto | multilingue (segun modelo) | ONNX | Apache-2.0 (segun origen) | Hugging Face |
| monkt/paddleocr-onnx | OCR (det+rec) | varios, incl. coreano | ONNX | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada. La diferencia principal del repositorio analizado es que empaqueta detector y reconocedor coreano en un unico repositorio con hashes de verificacion.

## Limitaciones y advertencias

- Solo cubre coreano; no se documenta soporte para otros idiomas en este repositorio.
- No es un modelo generativo: no sirve para chat, razonamiento, codigo ni tareas de lenguaje general.
- No se documentan datos de entrenamiento, sesgos ni tasas de error; el riesgo de alucinacion no aplica, pero si el riesgo de errores de reconocimiento en imagenes de baja calidad, rotadas o con tipografias poco comunes.
- El repositorio es un espejo sin modificaciones; la responsabilidad del rendimiento recae en los modelos originales de PaddleOCR y monkt.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni validacion externa.
- Licencia Apache-2.0 permite uso comercial, pero conviene conservar las atribuciones a PaddleOCR y a los autores originales de los pesos.
- No se documentan variantes cuantizadas ni requisitos de hardware, lo que dificulta planificar el despliegue en produccion.
- El pipeline requiere encadenar deteccion y reconocimiento manualmente; no se incluye codigo de orquestacion en la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Rheechan/paddleocr-v5-korean-onnx
- Detector original: https://huggingface.co/PaddlePaddle/PP-OCRv5_mobile_det_onnx
- Reconocedor y diccionario originales: https://huggingface.co/monkt/paddleocr-onnx
- Repositorio PaddleOCR: https://github.com/PaddlePaddle/PaddleOCR
