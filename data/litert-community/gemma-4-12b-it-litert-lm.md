# litert-community/gemma-4-12B-it-litert-lm

## Resumen

Gemma 4 12B es un modelo de lenguaje de tamano medio desarrollado por Google, distribuido originalmente en `google/gemma-4-12B-it` y empaquetado aqui por la comunidad `litert-community` en formato LiteRT-LM. Esta version no introduce pesos nuevos: es una cuantizacion del modelo instructivo base, optimizada para ejecucion local en dispositivos de escritorio mediante el runtime LiteRT de Google. El archivo principal, `gemma-4-12B-it.litertlm`, ocupa aproximadamente 6,9 GB en disco e incorpora soporte para texto, vision y audio, ademas de Multi-Token Prediction (MTP) para decodificacion especulativa.

La relevancia de este empaquetado radica en que traslada un modelo de 12 mil millones de parametros al entorno de escritorio (macOS, Linux y Windows) con aceleracion por GPU, sin depender de la nube. Segun la model card, el modelo soporta hasta 128k tokens de contexto en dispositivos con memoria suficiente, aunque los benchmarks publicados se ejecutaron con 4096 tokens de contexto. El repositorio acumula mas de 15.000 descargas y 69 likes desde su creacion en junio de 2026.

La licencia declarada es Apache 2.0, lo que facilita su integracion en productos comerciales, si bien conviene verificar las condiciones del modelo base de Google. El paquete requiere LiteRT-LM v0.17 o superior para funcionar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4; detalles especificos no disponibles) |
| Parametros totales | 12B (segun denominacion del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 128k tokens (limitado por memoria del dispositivo); benchmarks con 4096 tokens |
| Tipos de cuantizacion | cuantizacion integrada en formato LiteRT-LM (esquema exacto no disponible) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM) |
| Modalidades | texto, vision y audio |
| Tamano en disco | ~6883 MB |
| Version minima del runtime | LiteRT-LM v0.17 o superior |
| Modelo base | google/gemma-4-12B-it |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Gemma 4 de Google, construida con la misma investigacion y tecnologia empleada en los modelos Gemini, segun indica la model card. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detalla si la arquitectura incorpora variantes como atencion lineal o mezcla de expertos.

La innovacion destacable de este empaquetado es la integracion de Multi-Token Prediction (MTP), que habilita decodificacion especulativa y reduce la latencia de inferencia. El runtime LiteRT-LM actua como capa de orquestacion sobre LiteRT, con aceleracion mediante XNNPack para CPU y ML Drift para GPU, y anade gestion de KV-cache, plantillas de prompt y soporte de function calling. Es la misma pila tecnologica que utiliza la aplicacion Google AI Edge Gallery.

## Capacidades

- Generacion de texto e instrucciones conversacionales (variante `-it`).
- Procesamiento de imagenes (vision) directamente en el dispositivo.
- Procesamiento de audio, segun la model card.
- Multi-Token Prediction para decodificacion especulativa y menor latencia.
- Soporte de function calling a traves de las APIs de LiteRT-LM.
- Ejecucion totalmente local, sin conexion a internet, con privacidad de los datos.
- Contexto extenso de hasta 128k tokens en hardware con memoria suficiente.
- Capacidades multilingues: no se detallan los idiomas concretos en la informacion disponible.
- Razonamiento multi-paso y uso como agente local: mencionado en articulos de terceros sobre la pila LiteRT, sin detalle tecnico en la model card.

## Casos de uso

- Asistentes de escritorio privados: el modelo se ejecuta integramente en local mediante LiteRT-LM, de modo que conversaciones y documentos no salen del dispositivo; adecuado para entornos con requisitos estrictos de confidencialidad.
- Analisis de documentos e imagenes en el puesto de trabajo: la combinacion de vision y contexto largo permite procesar capturas, diagramas o paginas escaneadas junto con instrucciones textuales en una sola sesion.
- Transcripcion y analisis de audio local: la modalidad de audio habilita resumenes de reuniones o notas de voz sin enviar el audio a servicios externos.
- Desarrollo de agentes locales: el soporte de function calling en LiteRT-LM permite construir agentes que invocan herramientas del sistema (ficheros, APIs locales) desde una aplicacion de escritorio.
- Prototipado rapido en portatiles: con ~7,9 GB de memoria GPU en un MacBook Air M4 de 16 GB, el modelo es viable en equipos consumer para pruebas de concepto y demos.
- Aplicaciones web limitadas: la model card menciona despliegue web "en una capacidad mas limitada", util para demos interactivas en el navegador mediante el Space de Hugging Face.
- Procesamiento por lotes en estaciones Linux con GPU: con 3548 tokens/s de prefill en una RTX 4090, resulta apto para tareas de extraccion y clasificacion a pequena escala en local.

## Benchmarks y rendimiento

La model card publica metricas de rendimiento del runtime (no de calidad del modelo) con 1024 tokens de prefill, 256 de decode y contexto de 4096 tokens, con caches inicializadas:

| Dispositivo | Backend | Prefill (tok/s) | Decode (tok/s) | TTFT (s) | Memoria GPU (MB) |
|---|---|---|---|---|---|
| NVIDIA RTX 4090 24 GB (Linux) | GPU | 3548 | 69 | 0.3 | ~7790 |
| MacBook M4 Pro 48 GB | GPU | 297 | 29 | 3.48 | ~7870 |
| MacBook Air M4 16 GB | GPU | 114 | 15 | 9.13 | ~7900 |
| NVIDIA RTX 5080 16 GB (Windows) | GPU | 391 | 50 | 2.5 | ~7300 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 7,3-7,9 GB de memoria GPU para el archivo de ~6,9 GB, segun las mediciones de la model card.
- GPU recomendadas: RTX 4090 (mejor rendimiento medido, 69 tok/s de decode), RTX 5080, y GPUs integradas de Apple (M4 Pro, M4).
- Cabe en GPU consumer: si; se ha verificado en RTX 4090, RTX 5080 y MacBook Air M4 de 16 GB.
- Contexto largo: hasta 128k tokens requiere memoria adicional; la model card recomienda reducir `max_num_tokens` si aparecen problemas de memoria.
- Opciones de despliegue: LiteRT-LM v0.17+ (CLI de escritorio), aplicacion web via Hugging Face Space, y las APIs de LiteRT-LM para integracion en productos. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia: TTFT de 0,3 s en RTX 4090 y de 9,13 s en MacBook Air M4; el primer arranque puede ser mas lento por la inicializacion de caches.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| gemma-4-12B-it-litert-lm | 12B | hasta 128k | `.litertlm` | Apache 2.0 | Optimizado para escritorio con LiteRT-LM; texto, vision y audio |
| google/gemma-4-12B-it | 12B | no disponible | safetensors (presumible) | no disponible | Modelo base sin cuantizar; requiere otro runtime |
| Alternativas de ~12B (p. ej. Mistral, Qwen) | ~12B | no disponible | GGUF, safetensors | variable | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de benchmarks de calidad que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Sesgos: no se documentan en la informacion disponible; el modelo base de Google puede heredar sesgos de sus datos de entrenamiento.
- Alucinacion: riesgo inherente a los modelos generativos; no se han publicado evaluaciones especificas de fidelidad para esta version.
- Idiomas: la lista de idiomas soportados no esta disponible en la model card del empaquetado.
- Contexto: aunque se declaran 128k tokens, los benchmarks se ejecutaron con 4096; el contexto largo depende de la memoria del dispositivo y puede degradar el rendimiento.
- Licencia: se declara Apache 2.0 en el empaquetado, pero conviene revisar los terminos del modelo base `google/gemma-4-12B-it` antes de uso comercial.
- Dependencia de runtime: requiere LiteRT-LM v0.17 o superior; no es compatible con ecosistemas como llama.cpp, Ollama o vLLM segun la informacion disponible.
- Rendimiento en web: la model card advierte que el despliegue web es "mas limitado" en capacidades.
- Primer arranque: la latencia y el uso de memoria pueden diferir hasta que las caches esten inicializadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/gemma-4-12B-it-litert-lm
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Documentacion de LiteRT-LM: https://ai.google.dev/edge/litert-lm/overview
- CLI de LiteRT-LM: https://ai.google.dev/edge/litert-lm/cli
- Ejemplos de aplicaciones: https://github.com/google-ai-edge/litert-samples
- Demo web en Hugging Face Spaces: https://huggingface.co/spaces/tylermullen/Gemma4
- Articulo de terceros sobre agentes locales con Gemma 4 y LiteRT: https://www.c-sharpcorner.com/article/building-a-local-ai-agent-with-gemma-4-and-litert
