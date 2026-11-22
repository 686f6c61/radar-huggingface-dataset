# Malbit-M/Qwen3-ASR-0.6B-OpenVINO

## Resumen

Qwen3-ASR-0.6B-OpenVINO es una conversión al formato OpenVINO IR con compresión de pesos INT8 del modelo de reconocimiento automático del habla Qwen3-ASR-0.6B, desarrollado originalmente por el equipo Qwen. La conversión la firma Malbit-M para inferencia local en CPU e iGPU dentro de la aplicación Malbit. No se trata de un modelo nuevo ni de un reentrenamiento: es una redistribución del checkpoint original de Qwen en un formato optimizado para el runtime OpenVINO GenAI, con licencia Apache-2.0.

El modelo resuelve el problema de ejecutar ASR de la familia Qwen3 en hardware sin GPU dedicada, aprovechando la compresión INT8 de pesos y el backend OpenVINO. Con 0,6 mil millones de parámetros y un peso de repositorio de 0,8 GB, está pensado para escenarios de transcripción local de bajo coste, no para benchmarks de precisión multilingüe. La metadata de idiomas destaca coreano e inglés, que son los idiomas validados por Malbit, no la lista completa del modelo original.

La relevancia actual es práctica: ofrece una vía reproducible (commit upstream fijado por SHA, hashes SHA-256 de los 18 ficheros del directorio `int8/`) para desplegar un ASR de 0,6B en CPU o Intel Arc integrada mediante `ASRPipeline`. La model card es explícita sobre las limitaciones: los tests son smoke tests funcionales, no certificaciones de precisión, y se observaron errores de ASR en coreano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3-ASR, exportado como encoder/decoder OpenVINO IR con past) |
| Parametros totales | 0,6 mil millones (0.6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (compresion de pesos); se menciona comparacion con salidas FP16 |
| Idiomas soportados | coreano (ko), ingles (en) segun metadata; lista completa del upstream no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | OpenVINO IR (encoder/decoder, tokenizer/detokenizer IR) con compresion INT8 |

## Arquitectura y entrenamiento

No se dispone de detalles de arquitectura interna en la informacion proporcionada. El modelo base es Qwen3-ASR-0.6B, del equipo Qwen, y esta conversión emplea la tarea `automatic-speech-recognition-with-past` de Optimum Intel, lo que implica un esquema encoder-decoder con cache de estados para decodificacion autoregresiva. El export se realizo con `optimum-cli export openvino` sobre un checkout fijado por commit SHA (`5eb144179a02acc5e5ba31e748d22b0cf3e303b0`), con compresion de pesos INT8 mediante NNCF.

No se proporcionan datos sobre el corpus de entrenamiento, numero de tokens, composicion del dataset ni si hubo RLHF o DPO. La conversion fija dependencias concretas: `openvino==2026.4.1`, `openvino-tokenizers==2026.4.1.0`, `optimum-intel==2.2.0`, `nncf==3.4.0`, `qwen-asr==0.0.6`, `transformers==4.57.6` y `torch==2.15.0` (solo necesario para la conversion, no para inferencia). No hay innovaciones tecnicas adicionales documentadas mas alla de la compresion INT8 y el uso del runtime OpenVINO GenAI.

## Capacidades

- Reconocimiento automatico del habla (ASR) sobre audio de entrada a 16 kHz mono con muestras normalizadas.
- Transcripcion en coreano e ingles segun la validacion registrada por Malbit.
- Inferencia local en CPU e iGPU Intel (verificado en Intel Arc 130T integrada con dispositivo `GPU`).
- Integracion con el runtime OpenVINO GenAI mediante `ASRPipeline`, con parametro `max_new_tokens` configurable.
- Generacion autoregresiva con cache de estados (`with-past`), adecuada para transcripciones de duracion moderada.
- No se documentan capacidades de tool calling, agentes, vision, audio adicional ni modo thinking.
- No incluye diarizacion de hablantes ni alineamiento de palabras; los timestamps requieren un alineador forzado o el proceso de alineamiento separado de la aplicacion Malbit.

## Casos de uso

- Transcripcion local en escritorio sin GPU dedicada: cargando el directorio `int8/` con `ASRPipeline` en dispositivo `CPU`, se puede transcribir audio de 16 kHz mono en equipos de consumo, aprovechando el peso de 0,8 GB y la compresion INT8.
- Procesamiento de audio telefonico en coreano: la model card documenta una prueba funcional con audio telefonico coreano en CPU e iGPU Intel Arc, lo que lo hace adecuado para pipelines de atencion telefonica en ese idioma, asumiendo los errores de ASR observados.
- Integracion en aplicaciones de escritorio Windows: la verificacion de distribucion se realizo en Windows con los 18 ficheros del directorio `int8/` validados por SHA-256, un escenario realista para empaquetar el modelo en una app local.
- Despliegue en hardware Intel con iGPU: el dispositivo `GPU` de OpenVINO permite usar la grafica integrada Intel Arc para acelerar la inferencia sin tarjeta dedicada, util en portatiles y mini-PC.
- Prototipado y evaluacion de ASR de 0,6B: sirve para comparar salidas INT8 frente a FP16 en frases controladas, como hizo Malbit, antes de decidir un despliegue en produccion.
- Pipelines de transcripcion por lotes en CPU: al no requerir GPU, se puede ejecutar en servidores sin acelerador, con la salvedad de que no hay cifras de throughput publicadas.
- Verificacion de integridad en produccion: el uso de `SHA256SUMS` y del commit fijado con `--revision` permite auditar la procedencia del modelo antes de desplegarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se reclama ninguna cifra universal de WER/CER para esta conversion y que las pruebas realizadas son smoke tests funcionales, no certificaciones de precision.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio completo ocupa 0,8 GB; el directorio `int8/` contiene 18 ficheros y debe descargarse integro (no solo los `.bin`). El consumo en ejecucion no esta documentado.
- GPU recomendadas: no se especifican modelos discretos; la validacion cubre CPU y una iGPU Intel Arc 130T.
- Cabe en hardware de consumo: si, al menos en CPU e iGPU Intel compatibles con OpenVINO 2026.4.1. No hay confirmacion para GPUs NVIDIA o AMD.
- Opciones de despliegue: OpenVINO GenAI `ASRPipeline` (runtime probado: 2026.4.1). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Solo se confirma que la inferencia funciona en CPU y en iGPU Intel Arc 130T.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3-ASR-0.6B-OpenVINO (esta ficha) | 0,6B | no disponible | ko, en (validados) | apache-2.0 | OpenVINO IR INT8 | Conversion de Malbit-M, runtime OpenVINO GenAI |
| Qwen/Qwen3-ASR-0.6B (upstream) | 0,6B | no disponible | lista completa no disponible | apache-2.0 | safetensors (presumible, no confirmado) | Modelo original del equipo Qwen |
| Otras alternativas ASR de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- Se observaron errores de ASR en coreano en la variante 0.6B, incluso cuando las salidas INT8 y FP16 coincidian en las frases de prueba seleccionadas.
- No se reclama ninguna cifra de WER/CER; las pruebas son smoke tests funcionales y no garantizan generalizacion a otros dispositivos ni a otros idiomas.
- La metadata de idiomas (ko, en) refleja la validacion de Malbit, no la cobertura completa del modelo upstream.
- El modelo no incluye diarizacion de hablantes ni alineamiento de palabras; los timestamps requieren un alineador forzado o el proceso separado de la aplicacion Malbit.
- El repositorio no distribuye audio de prueba ni un diccionario coreano del alineador forzado.
- No es una release oficial de Qwen ni un modelo reentrenado; la atribucion de propiedad intelectual corresponde a los contribuidores upstream.
- La licencia Apache-2.0 permite uso comercial, pero debe conservarse el aviso `NOTICE` y la atribucion correspondiente.
- Algunos ficheros de tokenizer y configuracion son emitidos por la herramienta de export y sus rutas internas de generacion no han sido auditadas de forma independiente.
- El directorio `int8/` debe mantenerse intacto; descargar solo los `.bin` rompe el modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Malbit-M/Qwen3-ASR-0.6B-OpenVINO
- Modelo base upstream: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Revision upstream fijada: https://huggingface.co/Qwen/Qwen3-ASR-0.6B/tree/5eb144179a02acc5e5ba31e748d22b0cf3e303b0
- Documento de procedencia (en el repo): `PROVENANCE.md`
- Hashes de integridad (en el repo): `SHA256SUMS`
- OpenVINO: https://github.com/openvinotoolkit/openvino
- OpenVINO GenAI: https://github.com/openvinotoolkit/openvino.genai
- Optimum Intel: https://github.com/huggingface/optimum-intel
- NNCF: https://github.com/openvinotoolkit/nncf
