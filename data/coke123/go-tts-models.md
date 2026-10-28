# coke123/go-tts-models

## Resumen

`coke123/go-tts-models` no es un modelo único, sino un repositorio de distribución que empaqueta varios modelos de texto a voz (TTS) ya convertidos a ONNX e integrados en la aplicación [chuccp/go-tts](https://github.com/chuccp/go-tts). El objetivo es eliminar el paso manual de descargar y cuantizar Kokoro antes de ejecutar la aplicación: el repositorio incluye los grafos ONNX listos para usar, junto con los perfiles de voz en formato NPZ y los ficheros de configuración asociados. El repositorio ocupa 1.0 GB y se publica bajo licencia Apache-2.0, con la excepción de la voz japonesa de Piper Plus.

El contenido se organiza en tres familias. La principal es Kokoro-82M (82 M de parámetros), distribuida en cuatro variantes: el grafo FP32 original de la versión 0.19, dos cuantizaciones de ese mismo grafo (UINT8 e INT8 dinámica) y un modelo v1.0 ya cuantizado de 88,08 MiB que es el que se usa por defecto por ser el más pequeño que superó la regresión de ASR en chino. La segunda es Kitten TTS Nano 0.8, un modelo ONNX de 54,14 MiB con ocho perfiles de voz. La tercera es Piper Plus つくよみちゃん, un modelo VITS japonés de 37,39 MiB.

La relevancia práctica es de despliegue: son artefactos de inferencia, no modelos entrenados por el autor. No hay pesos nuevos ni ajuste fino; los ficheros redistribuyen pesos de terceros sin modificar, salvo la cuantización INT8 opcional de Kokoro. La información publicada es fundamentalmente operativa (tamaños, hashes SHA-256, estructura de directorios, licencias heredadas) y no incluye métricas de calidad objetivas más allá de la comprobación cualitativa de ASR en chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kokoro-82M (arquitectura no detallada en la informacion; grafo ONNX con firma `tokens/style/speed -> audio`), Kitten TTS Nano 0.8 (no detallada) y Piper Plus VITS (japones) |
| Parametros totales | Kokoro: 82 M (segun el nombre del modelo upstream). Kitten TTS Nano 0.8: no disponible. Piper Plus: no disponible |
| Parametros activos | no aplica (no son modelos MoE) |
| Longitud de contexto | no aplica (modelos text-to-speech; no se define ventana de contexto en la informacion disponible) |
| Tipos de cuantizacion | FP32 (`kokoro-v0_19.onnx`), UINT8 (`kokoro-v0_19-uint8.onnx`), INT8 dinamica (`kokoro-v0_19-int8.onnx`, `QInt8` con `MatMulConstBOnly=true`), y modelo v1.0 pre-cuantizado (`kokoro-v1.0-quantized.onnx`); Kitten y Piper se distribuyen sin cuantizacion declarada |
| Idiomas soportados | en, zh, fr, ja, hi, it, pt (etiquetas del repositorio); Piper Plus es un modelo japones con identificadores para seis idiomas en su config |
| Licencia | Apache-2.0 (repositorio y modelos Kokoro/Kitten upstream); Piper Plus つくよみちゃん mantiene condiciones propias de voz y corpus |
| Formato de pesos | ONNX (`.onnx`); perfiles de voz en `.bin` (NPZ) y `.npz`; configuracion en `.json` |
| Tamano del repositorio | 1.0 GB |
| Pipeline | text-to-speech |
| Libreria | onnx |

Desglose de ficheros:

| Fichero | Tamano | Funcion |
|---|---:|---|
| `kokoro/kokoro-v1.0-quantized.onnx` | 88,08 MiB | Kokoro v1.0 cuantizado, opcion por defecto |
| `kokoro/kokoro-v0_19.onnx` | 310,45 MiB | Grafo FP32 original |
| `kokoro/kokoro-v0_19-uint8.onnx` | 169,25 MiB | UINT8 equilibrado (`model_uint8.onnx` de onnx-community) |
| `kokoro/kokoro-v0_19-int8.onnx` | 87,68 MiB | INT8 dinamica, usada por defecto en v0.19 |
| `kokoro/voices-v1.0.bin` | 24,91 MiB | Perfiles de voz Kokoro (NPZ) |
| `kitten/kitten_tts_nano_v0_8.onnx` | 54,14 MiB | Modelo Kitten TTS |
| `kitten/voices.npz` | 3,13 MiB | Ocho perfiles de voz |
| `kitten/config.json` | 688 B | Alias de voces y priors de velocidad |
| `piper-ja/model.onnx` | 37,39 MiB | VITS Piper Plus つくよみちゃん |
| `piper-ja/model.onnx.json` | 8,37 KiB | Rol japones, IDs de seis idiomas e inventario de fonemas |

## Arquitectura y entrenamiento

Este repositorio no entrena ningun modelo: redistribuye grafos de inferencia exportados a ONNX. El trabajo tecnico propio se limita a la conversion y, en un caso, a la cuantizacion. Kokoro se publica en su grafo FP32 de la version 0.19 y en dos variantes comprimidas: una UINT8 tomada tal cual de `onnx-community/Kokoro-82M-ONNX` (`model_uint8.onnx`) y una INT8 generada mediante cuantizacion dinamica de ONNX Runtime con `QInt8` y `MatMulConstBOnly=true` aplicada al grafo FP32. Ambas conservan la misma firma de entrada y salida que el modelo original (`tokens/style/speed -> audio`), de modo que son intercambiables sin cambios en el codigo de integracion. El modelo v1.0 cuantizado de 88,08 MiB se selecciono como opcion por defecto por ser el mas pequeno que supero la regresion de ASR en chino.

Kitten TTS Nano 0.8 se distribuye como un unico ONNX de 54,14 MiB acompanado de ocho perfiles de voz y un `config.json` con alias y priors de velocidad. Piper Plus つくよみちゃん es un modelo VITS japones cuyo JSON asociado define el rol de voz, los identificadores para seis idiomas y el inventario de fonemas. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF, DPO o ajuste por preferencias en ninguno de los modelos upstream. Tampoco se detallan innovaciones de decodificacion (especulativa, atencion lineal u otras); el unico mecanismo tecnico descrito es la cuantizacion dinamica de ONNX Runtime.

## Capacidades

- Sintesis de voz a partir de texto (pipeline `text-to-speech`) con modelos ONNX ejecutables en CPU mediante ONNX Runtime.
- Control de velocidad de habla: la firma de Kokoro incluye una entrada `speed`, y el `config.json` de Kitten define priors de velocidad por voz.
- Seleccion de locutor mediante perfiles de voz externos: `voices-v1.0.bin` para Kokoro (NPZ) y `voices.npz` con ocho voces para Kitten.
- Cobertura multilingue declarada en etiquetas: ingles, chino, frances, japones, hindi, italiano y portugues.
- Sintesis en japones especifica mediante Piper Plus (VITS) con inventario de fonemas y rol de voz propios del corpus Tsukuyomi-chan.
- Tres niveles de coste computacional intercambiables en Kokoro (FP32, UINT8, INT8) sin cambiar la interfaz de integracion.
- No se documentan en la informacion disponible capacidades de clonacion de voz, tool calling, razonamiento multi-paso, salida de marcas de tiempo, control de emocion ni procesamiento de audio de entrada.

## Casos de uso

- Lectura por voz de articulos en un backend Go: el grafo INT8 de Kokoro (87,68 MiB) se carga en memoria y sintetiza parrafos en CPU, sin necesidad de GPU ni de servicios externos de TTS.
- Integracion en la aplicacion `chuccp/go-tts`: basta con colocar los ficheros en la estructura `models/kokoro`, `models/kitten` y `models/piper-ja`; Kokoro se activa solo si sus rutas estan presentes en `application.yml`, lo que permite despliegues parciales.
- Generacion de audiolibros o podcasts en varios idiomas: la cobertura declarada (en, zh, fr, ja, hi, it, pt) y los perfiles de voz de Kokoro permiten producir el mismo contenido en distintas lenguas con un unico runtime.
- Narracion en japones para productos localizados: Piper Plus つくよみちゃん aporta una voz japonesa de 37,39 MiB, adecuada para entornos con recursos limitados donde no cabe un modelo mayor.
- Asistentes de voz embebidos o en el borde: Kitten TTS Nano 0.8 (54,14 MiB) y sus ocho voces permiten sintesis local en dispositivos con poca memoria, sin dependencia de red.
- Pruebas de regresion y CI de pipelines de audio: los hashes SHA-256 publicados para cada fichero permiten verificar la integridad de los artefactos descargados antes de ejecutar tests de sintesis.
- Prototipado comparativo de calidad frente a coste: al disponer de FP32, UINT8 e INT8 del mismo grafo Kokoro, se puede medir la degradacion perceptual y el ahorro de CPU/memoria con la misma integracion.
- Accesibilidad web: conversion de contenido textual dinamico a audio en el servidor para usuarios con discapacidad visual, manteniendo el coste por peticion bajo gracias a la cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico criterio de evaluacion mencionado es cualitativo: el modelo `kokoro-v1.0-quantized.onnx` fue el mas pequeno que supero la regresion de ASR en chino, y el UINT8 se verifico con la prueba de integracion local en CPU de la aplicacion. No se aportan cifras de MOS, WER, RTF ni comparaciones numericas con otros sistemas.

## Requisitos de hardware

- Inferencia en CPU: el repositorio esta disenado para ONNX Runtime en CPU; la model card cita explicitamente una prueba de integracion local en CPU.
- Memoria: el fichero de modelo mas pequeno ocupa 88,08 MiB en disco y el mayor 310,45 MiB; el uso de RAM es del orden de cientos de MiB, aunque no se publica una cifra exacta. No se declara uso de VRAM porque no se documenta despliegue en GPU.
- GPU: no se especifican modelos recomendados (A100, H100, RTX 4090 u otros) ni se menciona aceleracion por CUDA, DirectML o TensorRT.
- Cabe en cualquier equipo de consumo: los tres modelos suman menos de 200 MiB en sus variantes cuantizadas (88,08 + 54,14 + 37,39 MiB).
- Opciones de despliegue: aplicacion `chuccp/go-tts` con ONNX Runtime; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a modelos TTS.
- Latencia y throughput: no disponibles. No se publican medidas de RTF, tiempo a primer audio ni voces concurrentes soportadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| Kokoro-82M (incluido aqui) | 82 M | no aplica | en, zh, fr, ja, hi, it, pt | Apache-2.0 | ONNX FP32, UINT8 e INT8; upstream `hexgrad/Kokoro-82M` |
| Kitten TTS Nano 0.8 (incluido aqui) | no disponible | no aplica | no disponible en la informacion | Apache-2.0 (declarada por el repositorio upstream) | ONNX 54,14 MiB con 8 voces; upstream `KittenML/kitten-tts-nano-0.8` |
| Piper Plus つくよみちゃん (incluido aqui) | no disponible | no aplica | japones (IDs para seis idiomas en config) | condiciones propias de voz y corpus, no Apache-2.0 | ONNX VITS 37,39 MiB; upstream `ayousanz/piper-plus-tsukuyomi-chan` |
| MeloTTS | no disponible | no aplica | no disponible | no disponible | mencionado solo como etiqueta del repositorio; no se incluyen ficheros ni enlaces |

La comparacion entre estos tres modelos se limita a tamano, formato y licencia, ya que no hay datos publicados de calidad (MOS, WER) ni de latencia que permitan un ranking objetivo. Frente a alternativas comerciales de TTS, la diferencia relevante es la ejecucion local en CPU y la licencia permisiva de Kokoro y Kitten.

## Limitaciones y advertencias

- No es un modelo entrenado por el autor: los pesos proceden de terceros y se redistribuyen sin modificar, salvo la cuantizacion INT8 de Kokoro. Cualquier problema de calidad es atribuible a los modelos upstream.
- La licencia Apache-2.0 del repositorio no cubre la voz de Piper Plus つくよみちゃん, sujeta a las condiciones del corpus Tsukuyomi-chan. Verificar antes de uso comercial de esa voz.
- Ausencia total de metricas objetivas de calidad y latencia: no se puede estimar MOS, WER ni RTF a partir de la informacion publicada.
- La cuantizacion INT8 y UINT8 puede degradar la naturalidad o la pronunciacion; solo se documenta una validacion de ASR en chino para la variante v1.0.
- La cobertura de idiomas por modelo no esta desglosada: las etiquetas (en, zh, fr, ja, hi, it, pt) son del repositorio, y no se especifica que idiomas cubre Kitten ni el alcance real de los IDs multilingues de Piper.
- MeloTTS aparece solo como etiqueta: no se incluyen ficheros, pesos ni enlaces en la informacion disponible.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni de mantenimiento continuado.
- Riesgo de alucinacion no aplica en el sentido de generacion de texto libre, pero si existe riesgo de pronunciacion incorrecta, omision de fragmentos o lectura erronea de numeros, siglas y nombres propios en textos fuera del dominio de entrenamiento.
- No se documentan sesgos de voz (genero, acento, edad) ni la composicion de los corpus de entrenamiento, por lo que no se puede evaluar la representatividad de los locutores.
- Para produccion: fijar los hashes SHA-256 publicados al descargar y validar la salida de audio con pruebas propias antes de sustituir un TTS en uso.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/coke123/go-tts-models
- Aplicacion que consume los modelos: https://github.com/chuccp/go-tts
- Kokoro-82M upstream: https://huggingface.co/hexgrad/Kokoro-82M
- Kokoro-82M ONNX (origen del fichero UINT8): https://huggingface.co/onnx-community/Kokoro-82M-ONNX
- Release de kokoro-tts con los ficheros de modelo: https://github.com/nazdridoy/kokoro-tts/releases/tag/v1.0.0
- Kitten TTS Nano 0.8 upstream: https://huggingface.co/KittenML/kitten-tts-nano-0.8
- Piper Plus つくよみちゃん upstream: https://huggingface.co/ayousanz/piper-plus-tsukuyomi-chan
