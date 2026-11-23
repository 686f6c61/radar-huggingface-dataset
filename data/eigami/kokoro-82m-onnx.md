# eigami/Kokoro-82M-ONNX

## Resumen

Kokoro-82M-82M-ONNX es una redistribucion del modelo de sintesis de voz Kokoro-82M v1.0, desarrollado originalmente por hexgrad, en la exportacion ONNX de 8 bits con marcas de tiempo que publica la organizacion onnx-community. El repositorio lo mantiene el usuario eigami con el unico proposito de servir de espejo estable para el editor de video Eigami, de modo que las descargas de la aplicacion no dependan de la cuenta de un tercero. No se trata, por tanto, de un modelo nuevo ni de un fine-tuning: los pesos son identicos a los del artefacto `onnx/model_quantized.onnx` de `onnx-community/Kokoro-82M-v1.0-ONNX-timestamped`, simplemente renombrado como `model_timestamped.onnx`, y las voces son las del repositorio `onnx-community/Kokoro-82M-v1.0-ONNX`.

El modelo base es un sistema text-to-speech de 82 millones de parametros que genera audio a partir de texto con un estilo de arquitectura ligera y eficiente, pensada para inferencia en CPU y en hardware modesto. La variante aqui distribuida anade la capacidad de devolver la longitud de cada sonido (timestamps), lo que resulta especialmente util para sincronizar subtitulos, animaciones o cortes de montaje en un editor de video. El repositorio ocupa aproximadamente 0,1 GB, lo que confirma su naturaleza compacta y su orientacion a despliegues locales.

La relevancia de esta ficha es practica: documenta un artefacto de inferencia listo para produccion (ONNX cuantizado a 8 bits, con voces empaquetadas y verificacion SHA-256 por parte de la aplicacion consumidora) y aclara que la informacion tecnica detallada del modelo original no se reproduce en este repositorio. Cualquier dato no presente en la model card se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS del linaje Kokoro-82M; arquitectura interna no detallada en la model card) |
| Parametros totales | 82 M (segun el nombre del modelo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (exportacion ONNX cuantizada de onnx-community) |
| Idiomas soportados | no disponible en la model card; las voces incluidas sugieren varios idiomas (prefijos `a`, `b`, `e`, `f`, `i`, `p`), sin lista oficial |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model_timestamped.onnx`) y voces en `.bin` dentro de `voices/` |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna, los datos de entrenamiento ni el proceso de alineacion del modelo base. Lo unico verificable es que se trata de una exportacion ONNX de 8 bits del checkpoint Kokoro-82M v1.0 de hexgrad, realizada por onnx-community, y que esta variante concreta anade marcas de tiempo por sonido. El repositorio no incluye informacion sobre numero de tokens de entrenamiento, composicion del dataset ni uso de RLHF o DPO.

La innovacion destacable de este artefacto no esta en el entrenamiento sino en el empaquetado: un unico fichero ONNX cuantizado que devuelve tanto el audio como la duracion de cada unidad de sonido, acompanado de un conjunto fijo de voces preentrenadas en formato binario. La aplicacion consumidora verifica el SHA-256 de cada fichero antes de usarlo, lo que anade una capa de integridad reproducible para pipelines de produccion.

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto en formato ONNX.
- Generacion de marcas de tiempo por sonido, utiles para sincronizacion y subtitulado.
- Multiples voces preentrenadas incluidas: `af_bella`, `af_heart`, `am_fenrir`, `am_michael`, `bf_emma`, `bm_george`, `ef_dora`, `em_alex`, `ff_siwis`, `if_sara`, `im_nicola`, `pf_dora`, `pm_alex`.
- Inferencia cuantizada a 8 bits, orientada a ejecucion local y en CPU.
- Verificacion de integridad mediante SHA-256 por parte de la aplicacion consumidora.
- No se documentan capacidades de tool calling, agentes, vision ni audio de entrada.

## Casos de uso

- Edicion de video con sincronizacion fina: el editor Eigami puede alinear subtitulos, animaciones o cortes con la salida de audio gracias a las marcas de tiempo por sonido que devuelve `model_timestamped.onnx`.
- Doblaje local de contenido corto: generar narracion en castellano u otros idiomas con las voces incluidas, sin depender de servicios en la nube, al ejecutarse en local con un modelo de 82 M de parametros.
- Prototipado de asistentes de voz: integrar el ONNX en una aplicacion de escritorio o web (por ejemplo, con onnxruntime) para sintetizar respuestas en tiempo real en hardware sin GPU dedicada.
- Accesibilidad: lectura en voz alta de documentos o interfaces con una latencia baja y un consumo de recursos reducido, adecuado para equipos de usuario final.
- Generacion de audiolibros o podcasts automatizados: producir pistas de audio por lotes con voces consistentes y marcas de tiempo para capitulos y marcadores.
- Pruebas de regresion en CI: verificar el SHA-256 de los ficheros y la salida de audio esperada en pipelines de integracion continua, dado el empaquetado reproducible y el tamano reducido del repositorio (0,1 GB).
- Educacion y demos: desplegar un TTS ligero en entornos con recursos limitados, como Raspberry Pi o contenedores pequenos, sin necesidad de infraestructura de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; por el tamano del modelo (82 M de parametros, 8 bits) el peso de los parametros ronda las decenas de MB, por lo que la inferencia cabe holgadamente en memoria de CPU.
- GPU recomendadas: no disponibles en la model card; el formato ONNX cuantizado esta pensado para ejecucion en CPU y en GPU de gama baja.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU consumer moderna, aunque no se documenta una lista oficial.
- Opciones de despliegue: ONNX Runtime (formato nativo del artefacto); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kokoro-82M-ONNX (este repo) | 82 M | no disponible | ONNX 8 bits + voces `.bin` | Apache 2.0 | Hugging Face, espejo de eigami |
| onnx-community/Kokoro-82M-v1.0-ONNX-timestamped | 82 M | no disponible | ONNX cuantizado con timestamps | Apache 2.0 | Hugging Face |
| onnx-community/Kokoro-82M-v1.0-ONNX | 82 M | no disponible | ONNX cuantizado | Apache 2.0 | Hugging Face |
| hexgrad/Kokoro-82M (original) | 82 M | no disponible | pesos originales (no ONNX) | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada; las tres primeras comparten esencialmente los mismos pesos y difieren en el empaquetado y en la presencia de marcas de tiempo.

## Limitaciones y advertencias

- No es un modelo original: es una copia renombrada de artefactos de onnx-community, mantenida para uso interno del editor Eigami; no debe citarse como fuente primaria del modelo.
- La model card no documenta arquitectura, datos de entrenamiento, idiomas soportados ni benchmarks; cualquier evaluacion tecnica debe remitirse a los repositorios de origen.
- La licencia Apache 2.0 se hereda del modelo original; los derechos permanecen en sus autores y se debe conservar el fichero `LICENSE`.
- Al ser un TTS, existe riesgo de uso indebido para suplantacion de voz o deepfakes; no se documentan salvaguardas en este repositorio.
- La calidad y cobertura linguistica dependen de las voces incluidas; no hay garantia de soporte para todos los idiomas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validacion externa.
- La fecha de creacion indicada (2026-11-22) resulta anomala y conviene verificarla antes de tomar decisiones de produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/eigami/Kokoro-82M-ONNX
- Origen con marcas de tiempo: https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX-timestamped
- Origen ONNX sin marcas de tiempo: https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX
- Modelo original de hexgrad: https://huggingface.co/hexgrad/Kokoro-82M
