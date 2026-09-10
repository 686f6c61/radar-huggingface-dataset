# qualcomm/TrOCR

## Resumen

TrOCR (Transformer-based Optical Character Recognition) es un modelo de reconocimiento óptico de caracteres de extremo a extremo que combina un encoder de imágenes basado en transformer con un decoder de texto que genera la transcripción a nivel de wordpiece. Qualcomm publica en este repositorio una versión del modelo optimizada, compilada y pre-exportada para ejecutarse sobre la NPU de sus chipsets (Snapdragon, Dragonwing, QCS y SA). El checkpoint de partida es la implementación `microsoft/trocr-small-handwritten`, de la que Qualcomm no modifica la arquitectura, sino el empaquetado y la optimización para inferencia en dispositivo.

El modelo resuelve la transcripción de texto manuscrito a partir de una imagen de entrada fijada en 320x320 píxeles. Su tamaño es reducido: 23,0 millones de parámetros en el encoder y 38,3 millones en el decoder, lo que suma aproximadamente 61,3 millones de parámetros y unos 234 MB de pesos en precisión float (87,8 MB el encoder y 146 MB el decoder). Esta ligereza es precisamente lo que permite desplegarlo en telefonía móvil y plataformas embebidas con latencias de milisegundos.

Su relevancia actual reside en el enfoque de despliegue en el borde (edge): Qualcomm ofrece artefactos listos para producción en formato ONNX, QNN_DLC y TFLITE, compilados con QAIRT 2.45, además de la librería AI Hub Models para exportar configuraciones personalizadas. El repositorio acumula 1.803 descargas y 16 likes, con licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (encoder de imagen tipo ViT + decoder de texto autorregresivo con generación a nivel de wordpiece) |
| Parametros totales | 61,3 M (23,0 M encoder + 38,3 M decoder) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Los assets pre-exportados estan en precision float; no se documentan otras precisiones en la informacion disponible |
| Idiomas soportados | No disponible (no declarado en la model card) |
| Licencia | MIT |
| Formato de pesos | PyTorch (libreria declarada); artefactos pre-exportados en ONNX, QNN_DLC y TFLITE |
| Resolucion de entrada | 320x320 |
| Tamano de pesos (float) | Encoder 87,8 MB; decoder 146 MB |
| Tamano del repositorio | 16,7 GB |
| Checkpoint base | microsoft/trocr-small-handwritten |

## Arquitectura y entrenamiento

La arquitectura sigue el diseno TrOCR descrito en el articulo arXiv:2109.10282: un encoder de vision transformer que procesa la imagen y un decoder transformer autorregresivo que genera la secuencia de texto objetivo en unidades wordpiece. Se trata de un esquema encoder-decoder clasico de reconocimiento de texto, no de un modelo multimodal generalista: la salida esta restringida a la transcripcion del contenido textual presente en la imagen.

Qualcomm no documenta en la informacion proporcionada el proceso de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO u otras fases de ajuste). El trabajo de Qualcomm se centra en la optimizacion para hardware: compilacion y perfilado mediante Qualcomm AI Hub Workbench, exportacion a ONNX, QNN_DLC y TFLITE, y soporte para reexportar con pesos ajustados (fine-tuned), formas de entrada personalizadas y configuraciones de dispositivo y runtime especificas. Los detalles de entrenamiento del checkpoint original `trocr-small-handwritten` no estan incluidos en la informacion disponible.

## Capacidades

- Reconocimiento optico de caracteres (OCR) de extremo a extremo sobre imagenes de texto manuscrito.
- Generacion de texto a nivel de wordpiece condicionada por la imagen de entrada (pipeline image-to-text).
- Inferencia optimizada sobre la NPU de chipsets Qualcomm, con el decoder y el encoder como componentes separados.
- Exportacion a multiples runtimes: ONNX (ONNX Runtime 1.27.1), QNN_DLC (QAIRT 2.45) y TFLITE.
- Soporte de reexportacion con pesos personalizados y formas de entrada a medida mediante la libreria AI Hub Models.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision general, audio ni modo de razonamiento (thinking mode) en la informacion disponible.

## Casos de uso

- Digitalizacion de documentos manuscritos: transcripcion de notas, cartas y apuntes a texto editable, ejecutandose localmente en el dispositivo sin enviar la imagen a un servidor, gracias a los ~234 MB de pesos en float.
- Procesamiento de formularios sobre movil: lectura de campos manuscritos en aplicaciones Android (el modelo esta etiquetado con `android`) con latencias de decoder de 1-3 ms en NPU.
- Accesibilidad: conversion de texto manuscrito capturado con la camara en voz o texto para personas con dificultades de lectura, aprovechando que la inferencia ocurre en el propio terminal.
- Archivo y catalogacion de documentos historicos: transcripcion por lotes de fondos manuscritos escaneados, procesando cada imagen a 320x320 con un coste computacional muy bajo.
- Automatizacion de flujos de digitalizacion en logistica y banca: lectura de albaranes, cheques o formularios manuscritos integrada en pipelines de captura documental.
- Reconocimiento embebido en dispositivos sin conectividad: escenarios de campo o entornos aislados donde no hay acceso a la nube y se requiere OCR local sobre hardware Snapdragon o Dragonwing.
- Preprocesado en sistemas de vision para automocion y plataformas SA: lectura de matriculas o rotulacion manuscrita sobre los chipsets SA8775P, SA8650P, SA8255P, SA8295P y SA7255P listados en la tabla de rendimiento.
- Firma y validacion de documentos: extraccion del texto manuscrito para su verificacion posterior en aplicaciones de gestion documental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precision (por ejemplo CER, WER, MMLU, HumanEval o GSM8K) en la informacion disponible. La model card si incluye una tabla de rendimiento de inferencia para el componente decoder, medida sobre NPU en distintos chipsets:

| Chipset | Runtime | Precision | Tiempo de inferencia (ms) | Memoria pico (MB) | Unidad de computo |
|---|---|---|---|---|---|
| Snapdragon X2 Elite | ONNX | float | 1,245 | 7 - 7 | NPU |
| Snapdragon X Elite | ONNX | float | 2,093 | 68 - 68 | NPU |
| Snapdragon 8 Gen 3 Mobile | ONNX | float | 1,471 | 0 - 284 | NPU |
| Snapdragon 8 Gen 1 Mobile | ONNX | float | 2,738 | 1 - 220 | NPU |
| Snapdragon 8 Elite Mobile | ONNX | float | 1,281 | 0 - 192 | NPU |
| Snapdragon 8 Elite Gen 5 Mobile | ONNX | float | 1,186 | 1 - 178 | NPU |
| Dragonwing IQ-8275 | ONNX | float | 2,796 | 7 - 17 | NPU |
| Dragonwing QCS8550 (Proxy) | ONNX | float | 2,124 | 1 - 3 | NPU |
| Snapdragon X2 Elite | QNN_DLC | float | 1,513 | 7 - 7 | NPU |
| Snapdragon 8 Elite Gen 5 Mobile | QNN_DLC | float | 1,166 | 1 - 173 | NPU |
| SA8775P | QNN_DLC | float | 2,892 | 5 - 106 | NPU |
| SA8295P | QNN_DLC | float | 2,618 | 0 - 38 | NPU |
| SA7255P | QNN_DLC | float | 4,175 | 5 - 105 | NPU |
| Snapdragon 8 Gen 3 Mobile | TFLITE | float | 1,378 | 0 - 279 | NPU |
| Snapdragon 8 Gen 1 Mobile | TFLITE | float | 2,438 | 0 - 218 | NPU |

Todos los valores de la tabla original corresponden al decoder; la model card no incluye tiempos del encoder.

## Requisitos de hardware

- Los pesos en precision float ocupan aproximadamente 234 MB (encoder 87,8 MB + decoder 146 MB), lo que hace viable la inferencia en memoria de dispositivo movil.
- El modelo esta disenado para ejecutarse en la NPU de chipsets Qualcomm, no en GPU de escritorio: toda la tabla de rendimiento se midio sobre NPU.
- Chipsets soportados segun la model card: Snapdragon X2 Elite, X Elite, 8 Gen 3, 8 Gen 1, 8 Elite, 8 Elite Gen 5, Dragonwing IQ-8275, Dragonwing IQ-9075, Dragonwing IQ-X7181, Dragonwing QCS8550 (Proxy), Dragonwing Q-8750, QCS8450, QCS8450 y las plataformas SA8775P, SA8650P, SA8255P, SA8295P y SA7255P.
- Si cabe en hardware de consumo: si, en telefonos y portatiles con los Snapdragon indicados. No se documentan requisitos de VRAM para GPU de escritorio ni compatibilidad con A100, H100 o RTX 4090.
- Opciones de despliegue: ONNX Runtime 1.27.1, QNN_DLC mediante QAIRT 2.45, TFLite, y la libreria Qualcomm AI Hub Models. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia: entre aproximadamente 1,17 ms y 2,9 ms por paso de decoder en los chipsets medidos, con el minimo en Snapdragon 8 Elite Gen 5 bajo QNN_DLC (1,166 ms) y maximos en plataformas SA y Dragonwing. No se proporciona throughput agregado ni latencia de extremo a extremo incluido el encoder.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| qualcomm/TrOCR | 61,3 M (23,0 M encoder + 38,3 M decoder) | Entrada 320x320 | MIT | HuggingFace + assets ONNX/QNN_DLC/TFLITE optimizados para NPU Qualcomm | Version optimizada del checkpoint small-handwritten |
| microsoft/trocr-small-handwritten | No disponible en la informacion proporcionada (es el checkpoint base) | No disponible | No disponible | HuggingFace | Checkpoint de origen del que parte la version de Qualcomm |
| OCR tradicional (por ejemplo, motores no neuronales) | No disponible | No disponible | No disponible | No disponible | Referencia de categoria, sin datos comparables en la informacion disponible |

No se dispone de datos de precision que permitan comparar el rendimiento cualitativo frente a alternativas; la informacion proporcionada solo describe el rendimiento de inferencia en hardware Qualcomm.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en OCR; no es un modelo de lenguaje general y no puede usarse para generacion de texto libre, codigo o razonamiento.
- Orientado a texto manuscrito segun el checkpoint base (`trocr-small-handwritten`); su comportamiento sobre texto impreso u otros dominios no esta documentado en la informacion disponible.
- Idiomas soportados no declarados, por lo que no puede garantizarse el rendimiento multilingue.
- Riesgo de alucinacion en el decoder: al ser un modelo autorregresivo puede generar transcripciones plausibles pero incorrectas, especialmente con imagenes borrosas, rotadas o de baja calidad.
- Entrada fija a 320x320: imagenes con texto muy pequeno o denso pueden degradarse al redimensionarse.
- Los assets publicados estan en precision float; no se documentan variantes cuantizadas, lo que limita el ahorro adicional de memoria mas alla de lo indicado.
- El uso de los dispositivos alojados de Qualcomm AI Hub requiere registro; consultar las condiciones del servicio para pruebas en hardware remoto.
- La licencia MIT permite uso comercial, pero se recomienda verificar las condiciones del checkpoint original de Microsoft.
- No se publican metricas de precision (CER/WER), por lo que la calidad real de transcripcion no puede evaluarse con la informacion disponible.
- El repositorio ocupa 16,7 GB debido a los multiples artefactos exportados; el peso real del modelo es de unos 234 MB.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/qualcomm/TrOCR
- Checkpoint base: https://huggingface.co/microsoft/trocr-small-handwritten
- Repositorio GitHub (AI Hub Models): https://github.com/qualcomm/ai-hub-models/blob/v0.62.0/src/qai_hub_models/models/trocr
- Pagina del modelo en Qualcomm AI Hub: https://aihub.qualcomm.com/models/trocr
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Articulo TrOCR (arXiv:2109.10282): https://arxiv.org/abs/2109.10282
- Sitio corporativo de Qualcomm: https://www.qualcomm.com/
- Informacion sobre Qualcomm (Wikipedia): https://en.wikipedia.org/wiki/Qualcomm
