# litert-community/gemma-4-26B-A4B-it-litert-lm

## Resumen

Gemma 4 26B (A4B) en formato LiteRT-LM es una versión cuantizada y empaquetada del modelo `google/gemma-4-26B-A4B-it`, publicada por la comunidad `litert-community`. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) de tamano medio, disenado por Google a partir de la misma investigacion que los modelos Gemini, y distribuido en el formato `.litertlm` propietario del framework LiteRT-LM para su despliegue en web y escritorio. El paquete incluye pesos cuantizados QAT con int4 por bloques y activaciones en coma flotante, optimizados especificamente para ejecucion en GPU.

La relevancia de esta publicacion radica en que permite ejecutar un modelo de 26B parametros totales (con solo ~4B activos por token, segun la nomenclatura A4B) de forma local en hardware de consumo, sin conexion a internet y con privacidad total de los datos. LiteRT-LM actua como capa de orquestacion sobre LiteRT, el runtime multiplataforma de Google que proporciona aceleracion por hardware mediante XNNPack en CPU y ML Drift en GPU, anadiendo gestion de KV-cache, plantillas de prompt y function calling.

Esta version concreta soporta unicamente texto; el soporte de audio, imagen y prediccion multi-token se anuncia para futuras actualizaciones. Requiere LiteRT-LM v0.17.1 o superior en escritorio y esta publicada bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer, base Gemma 4 |
| Parametros totales | 26B (segun nomenclatura del modelo) |
| Parametros activos | ~4B (sufijo A4B) |
| Longitud de contexto | Hasta 195k tokens (soporte indicado en benchmarks web); benchmarks de escritorio con 16.384 tokens |
| Tipos de cuantizacion | QAT int4 por bloques con activaciones float (unica variante publicada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); tamano en disco ~15.787 MB |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-26B-A4B-it`, un transformer con arquitectura Mixture-of-Experts en el que solo una fraccion de los parametros (~4B) se activa por token, lo que reduce el coste computacional de inferencia manteniendo la capacidad de un modelo de 26B. La variante publicada por `litert-community` no reentrena el modelo, sino que lo cuantiza mediante Quantization-Aware Training (QAT) con pesos int4 por bloques y activaciones en coma flotante, un esquema optimizado para GPU.

El empaquetado en `.litertlm` integra los pesos con las librerias GenAI de LiteRT-LM: gestion de KV-cache, plantillas de prompt y APIs de function calling. LiteRT proporciona la aceleracion subyacente via XNNPack (CPU) y ML Drift (GPU). No se dispone de informacion en la documentacion proporcionada sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF/DPO) del modelo base.

## Capacidades

- Generacion de texto y razonamiento conversacional (variante `-it`, instruction-tuned).
- Soporte de function calling / tool calling a traves de las APIs de LiteRT-LM.
- Gestion de KV-cache y plantillas de prompt integradas en el runtime.
- Ejecucion 100% local y offline, con privacidad de datos por diseno.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision, audio y prediccion multi-token: anunciadas para futuras actualizaciones, no disponibles en esta version.
- Capacidad de contexto largo: hasta 195k tokens segun la model card (benchmarks web con 1.280 tokens de contexto).

## Casos de uso

- Asistentes de escritorio offline: el modelo se ejecuta localmente en un portatil o torre con GPU, permitiendo un asistente generativo sin conexion y sin enviar datos a la nube, adecuado para entornos con requisitos estrictos de privacidad.
- Procesamiento de documentos largos en local: con soporte de hasta 195k tokens de contexto, se puede usar para resumir, extraer informacion o responder preguntas sobre contratos, informes o bases de conocimiento extensas sin salir del dispositivo.
- Integracion en aplicaciones web mediante WebGPU/Chrome: el formato LiteRT-LM permite desplegar el modelo en el navegador (demo en Hugging Face Spaces), habilitando asistentes embebidos en aplicaciones web sin backend propio.
- Automatizacion de flujos con tool calling: gracias al soporte de function calling del runtime, el modelo puede invocar APIs locales o herramientas del sistema en pipelines de automatizacion de escritorio.
- Prototipado rapido de agentes locales: la combinacion de contexto largo y tool calling permite construir agentes multi-paso que operan sobre ficheros y servicios locales, con la ventaja de la inferencia privada.
- Desarrollo y evaluacion de aplicaciones edge: util para equipos que quieran validar comportamiento de Gemma 4 en hardware de consumo (RTX 4090, RTX 5080, Apple M4 Max) antes de decidir un despliegue mayor.
- Educacion e investigacion: permite estudiar el comportamiento de un MoE de 26B en hardware asequible, con throughput medido y reproducible segun los benchmarks publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Si se publican benchmarks de rendimiento de inferencia en la model card:

| Dispositivo | Backend | Prefill (tok/s) | Decode (tok/s) | Init. (s) | Tamano (MB) |
|---|---|---|---|---|---|
| NVIDIA RTX 4090 24GB (Linux) | GPU | 4487 | 86 | 27,89 | 15.787 |
| MacBook Pro 2024 M4 Max 48GB (macOS) | GPU | 1430 | 77 | 8,83 | 15.787 |
| NVIDIA RTX 5080 16GB (Windows) | GPU | 1676 | 76 | 35,40 | 15.787 |

Condiciones de medicion en escritorio: 8.192 tokens de prefill, 512 tokens de decode y contexto de 16.384 tokens. En web (Chrome) se midio con 1.024 tokens de prefill, 256 de decode y contexto de 1.280 tokens; la memoria GPU del M4 Max se reporta en ~16.190 MB.

## Requisitos de hardware

- VRAM estimada: ~15,8 GB de pesos en disco; en macOS M4 Max se reporta un uso de GPU de ~16,2 GB, por lo que se recomienda al menos 16 GB de VRAM efectiva y margen adicional para KV-cache.
- GPU recomendadas segun benchmarks publicados: NVIDIA RTX 4090 (24 GB), NVIDIA RTX 5080 (16 GB), Apple M4 Max (48 GB unificada).
- Cabe en GPU de consumo: si, en RTX 4090, RTX 5080 y Apple Silicon de gama alta; en GPUs de 16 GB el margen es ajustado.
- Opciones de despliegue: LiteRT-LM CLI (v0.17.1 o superior) en escritorio; navegador Chrome para la variante web; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: prefill de 4.487 tok/s y decode de 86 tok/s en RTX 4090; 1.430/77 tok/s en M4 Max; 1.676/76 tok/s en RTX 5080. Tiempo de inicializacion entre 8,8 y 35,4 segundos segun plataforma.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| gemma-4-26B-A4B-it-litert-lm (este) | 26B | ~4B | hasta 195k | Apache 2.0 | `.litertlm`, LiteRT-LM |
| google/gemma-4-26B-A4B-it (base) | 26B | ~4B | no disponible | Apache 2.0 | safetensors (formato original) |
| Alternativas MoE de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion directa documentada es con el modelo base del que deriva: misma arquitectura y licencia, pero distinto formato, cuantizacion (QAT int4 aqui) y runtime objetivo (LiteRT-LM frente a frameworks de servidor). No se dispone de datos de benchmarks de calidad para comparar con otras familias.

## Limitaciones y advertencias

- Esta version solo procesa texto; vision, audio y prediccion multi-token no estan disponibles y se anuncian para futuras actualizaciones.
- Requiere LiteRT-LM v0.17.1 o superior en escritorio; no es compatible con runtimes habituales como vLLM, llama.cpp u Ollama.
- La cuantizacion int4 QAT puede degradar la calidad frente al modelo base en tareas sensibles a precision numerica (matematicas, codigo complejo).
- Riesgo de alucinacion inherente a los modelos generativos; no se documentan tasas ni evaluaciones especificas.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Idiomas soportados: no disponibles; la model card no detalla cobertura linguistica.
- En GPUs de 16 GB el margen de memoria es ajustado (~15,8 GB de pesos mas KV-cache), lo que puede limitar contextos largos.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar los terminos del modelo base de Google y las condiciones de uso de Gemma.
- El contexto maximo de 195k no se ha validado en los benchmarks de escritorio, que usan 16.384 tokens.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/gemma-4-26B-A4B-it-litert-lm
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Documentacion LiteRT-LM: https://ai.google.dev/edge/litert-lm/overview
- CLI LiteRT-LM: https://ai.google.dev/edge/litert-lm/cli
- Ejemplos de aplicaciones: https://github.com/google-ai-edge/litert-samples
- Demo web en Hugging Face Spaces: https://huggingface.co/spaces/tylermullen/Gemma4
