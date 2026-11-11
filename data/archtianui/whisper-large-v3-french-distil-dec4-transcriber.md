# ArchTianui/whisper-large-v3-french-distil-dec4-transcriber

## Resumen

`ArchTianui/whisper-large-v3-french-distil-dec4-transcriber` es una redistribucion en multiples formatos del modelo de reconocimiento automatico del habla (ASR) `bofenghuang/whisper-large-v3-french-distil-dec4`, un Whisper large-v3 destilado y afinado especificamente para frances. El autor de esta ficha (ArchTianui) no aporta pesos nuevos: unicamente convierte los pesos originales de Bofeng Huang a tres formatos de inferencia optimizados (CTranslate2, OpenVINO IR y whisper.cpp GGML) para su uso dentro de la aplicacion de transcripcion offline *Transcriber International*.

El modelo resuelve el problema de la transcripcion de voz a texto en frances con un coste computacional reducido respecto al Whisper large-v3 original, gracias a la destilacion (etiquetada como "distil-dec4" en el nombre del modelo base). Su relevancia practica esta en la disponibilidad de artefactos ya cuantizados a int8 y q8_0, listos para ejecutarse en CPU (CTranslate2), en aceleradores Intel GPU/NPU/CPU (OpenVINO) o en GPU via Vulkan (whisper.cpp), con un peso de repositorio de 2,5 GB.

La ficha se publica en estado de prueba: el propio autor indica que la precision en el entorno real de la aplicacion aun no se ha evaluado y que los modelos que no superen la evaluacion seran retirados. La licencia es MIT, heredada del modelo base y, en ultima instancia, de `openai/whisper-large-v3-turbo`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), destilado desde large-v3; pesos convertidos a CTranslate2, OpenVINO IR y GGML |
| Parametros totales | no disponible (el modelo base es una destilacion de Whisper large-v3; el encoder OpenVINO int8 ocupa 640,8 MB y el decoder 172,4 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de Whisper: 30 s por segmento, no confirmado en la informacion) |
| Tipos de cuantizacion | int8 (CTranslate2 y OpenVINO), q8_0 (GGML/whisper.cpp) |
| Idiomas soportados | frances (fr, fr-FR) |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (`ct2/model.bin`), OpenVINO IR (`openvino/*.xml` + `.bin`), GGML (`ggml/ggml-model-q8_0.bin`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper: un transformer encoder-decoder con atencion completa que procesa espectrogramas Mel de 30 segundos y genera tokens de texto de forma autorregresiva. El modelo base `bofenghuang/whisper-large-v3-french-distil-dec4` es una destilacion de `openai/whisper-large-v3-turbo` (segun indica la model card) afinada para frances; la informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Para esos detalles, la model card remite al repositorio del autor original.

La contribucion de esta ficha es exclusivamente de ingenieria de despliegue: conversion de pesos y cuantizacion a int8/q8_0. Destaca una correccion funcional en `openvino/generation_config.json` (normalizado el 2026-11-10): se anadio `prev_sot_token_id` (`<|startofprev|>`, id 50362), se fijo `max_initial_timestamp_index` a 50 y se eliminaron `forced_decoder_ids`, `language` y `task`, que provocaban texto corrupto en OpenVINO GenAI cuando se usaba un prompt inicial. Los pesos no se modificaron. Cada artefacto se publica con su SHA-256 en el catalogo firmado de la aplicacion, que rechaza ficheros que no coincidan.

## Capacidades

- Transcripcion de voz a texto en frances (fr-FR) a partir de audio.
- Generacion de transcripciones con marcas de tiempo (capacidad estandar de la familia Whisper; no confirmada explicitamente para esta destilacion en la informacion disponible).
- Soporte de prompt inicial para sesgar la decodificacion (corregido en la configuracion de OpenVINO).
- Ejecucion offline: los tres formatos estan pensados para inferencia local sin conexion.
- Inferencia en CPU (CTranslate2), en Intel GPU/NPU/CPU (OpenVINO) y en GPU via Vulkan (whisper.cpp).
- No se documentan capacidades de traduccion, diarizacion de hablantes, tool calling ni razonamiento multi-paso.

## Casos de uso

- Transcripcion offline de reuniones en frances: el formato CTranslate2 int8 permite ejecutar la inferencia en CPU sin GPU dedicada, adecuado para portatiles y equipos de sobremesa convencionales.
- Subtitulado de video en frances: el modelo genera texto alineado temporalmente con el audio, util para flujos de postproduccion que requieran subtitulos en fr-FR.
- Aceleracion en hardware Intel: el formato OpenVINO IR int8 aprovecha GPU integradas, NPU y CPU Intel, lo que permite desplegar transcripcion en equipos sin GPU discreta.
- Despliegue en GPU de consumo via Vulkan: el artefacto GGML q8_0 se ejecuta en whisper.cpp sobre GPU con soporte Vulkan, ampliando la compatibilidad a tarjetas graficas no NVIDIA.
- Aplicaciones de accesibilidad: dictado y transcripcion en tiempo real para usuarios francofonos con necesidades de accesibilidad, ejecutandose de forma local y sin envio de audio a la nube.
- Procesamiento por lotes de archivos de audio en servidores: la combinacion de CTranslate2 con un runtime de inferencia permite procesar colas de grabaciones en CPU con un consumo de memoria contenido (modelo int8 de aproximadamente 820 MB).
- Integracion en la aplicacion *Transcriber International*: es el caso de uso declarado por el autor; los ficheros se validan contra un catalogo firmado con SHA-256 antes de su uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que la precision en el entorno de la aplicacion aun no se ha evaluado y que los modelos que no superen la evaluacion seran retirados.

## Requisitos de hardware

- VRAM/RAM estimada: el artefacto CTranslate2 int8 ocupa 820,3 MB; el encoder OpenVINO int8, 640,8 MB, y el decoder, 172,4 MB; el GGML q8_0, 874,2 MB. La huella en memoria es, por tanto, inferior a 1 GB para los pesos, mas el overhead del runtime y del buffer de audio.
- GPU recomendadas: no se especifican modelos concretos; OpenVINO esta orientado a GPU/NPU/CPU Intel y whisper.cpp GGML a GPU con soporte Vulkan. No se documenta soporte CUDA nativo en esta ficha.
- GPU de consumo: si, cabe en GPU de consumo a traves de Vulkan (whisper.cpp) y en GPU integradas Intel (OpenVINO); no se confirma compatibilidad con CUDA en la informacion disponible.
- Opciones de despliegue: CTranslate2, OpenVINO GenAI, whisper.cpp y la aplicacion *Transcriber International*.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formatos |
|---|---|---|---|---|---|
| Este modelo (distil-dec4, fr) | no disponible (destilado de large-v3) | no disponible | fr | MIT | CTranslate2 int8, OpenVINO int8, GGML q8_0 |
| `bofenghuang/whisper-large-v3-french-distil-dec4` (base) | no disponible (destilado de large-v3) | no disponible | fr | MIT | safetensors (formato original) |
| `openai/whisper-large-v3-turbo` | no disponible en la informacion | no disponible | multilingue | MIT | safetensors, GGML, CTranslate2 (segun ecosistema) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Estado de prueba: la precision del modelo en el entorno real de la aplicacion no se ha evaluado; el autor advierte que sera retirado si no supera la evaluacion.
- Cobertura linguistica limitada al frances: no es adecuado para otros idiomas sin un modelo especifico.
- Riesgo de alucinacion: como todo modelo Whisper, puede generar texto plausible en segmentos de silencio o ruido; no se documenta mitigacion especifica.
- Sesgos: no se documentan sesgos conocidos en la informacion disponible; al ser un ajuste sobre un modelo entrenado con datos mayoritariamente en ingles y multilingues, pueden persistir sesgos del modelo base.
- Restricciones de licencia: MIT permite uso comercial, pero conviene verificar la cadena de licencias del modelo base original.
- Integridad de ficheros: la aplicacion rechaza artefactos cuyo SHA-256 no coincida con el catalogo firmado; cualquier modificacion local invalida esa verificacion.
- No se documentan capacidades de diarizacion, traduccion ni deteccion de idioma.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ArchTianui/whisper-large-v3-french-distil-dec4-transcriber
- Modelo base: https://huggingface.co/bofenghuang/whisper-large-v3-french-distil-dec4
- Commit del modelo base referenciado: `a0ce74c16e81b7f54c30ed7fcd6cec790c4fda23`
