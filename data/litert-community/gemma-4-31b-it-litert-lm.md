# litert-community/gemma-4-31B-it-litert-lm

## Resumen

Gemma 4 31B es un modelo de lenguaje de gran tamano desarrollado por Google, construido con la misma investigacion y tecnologia que los modelos Gemini. Esta ficha concreta corresponde a la distribucion `litert-community/gemma-4-31B-it-litert-lm`, una conversion del modelo base `google/gemma-4-31B-it` al formato `.litertlm` para su uso con LiteRT-LM, la capa de orquestacion de Google construida sobre LiteRT (antes TensorFlow Lite) para despliegue en dispositivo, web y escritorio.

El modelo se distribuye cuantizado mediante QAT (Quantization-Aware Training) con pesos int4 por bloques y activaciones en coma flotante, una configuracion optimizada para ejecucion en GPU. El objetivo es ofrecer inferencia local privada, sin conexion a internet, en equipos de escritorio y navegador, con un tamano en disco de aproximadamente 19,2 GB.

Su relevancia actual radica en que permite ejecutar un modelo de 31B parametros de forma local en hardware de consumo de gama alta (RTX 4090, Apple M4 Max) y, con contexto reducido, en navegador. No obstante, esta version de LiteRT-LM solo soporta texto por el momento; el soporte de audio, imagen y prediccion multi-token se anuncia para futuras actualizaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4; detalles internos no disponibles) |
| Parametros totales | 31B (segun denominacion del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 80k en web (segun model card); benchmarks de escritorio a 16.384 tokens |
| Tipos de cuantizacion | QAT int4 por bloques con activaciones float (Q4_0 en web); unica variante distribuida |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); tamano del repo 78,1 GB, modelo en disco ~19.218 MB |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de su pertenencia a la familia Gemma 4 de Google, construida con la misma base tecnologica que Gemini. Se trata de un modelo de 31B parametros, descrito por el autor como de tamano medio e idoneo para casos de uso de escritorio. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO.

La innovacion tecnica destacable en esta distribucion es el pipeline de despliegue: LiteRT-LM actua como capa de orquestacion sobre LiteRT, con aceleracion por XNNPack en CPU y ML Drift en GPU, y anade gestion de KV-cache, plantillas de prompt y function calling. El modelo se ha cuantizado con QAT a int4 por bloques para GPU, lo que reduce el peso a ~19 GB manteniendo activaciones en float. Esta es la misma pila tecnologica que usa la aplicacion Google AI Edge Gallery.

## Capacidades

- Generacion de texto y razonamiento conversacional (modelo etiquetado como `-it`, ajustado para instrucciones).
- Soporte de function calling / tool calling integrado en LiteRT-LM.
- Gestion de KV-cache y plantillas de prompt mediante la capa LiteRT-LM.
- Ejecucion local en dispositivo, sin conexion a internet, con privacidad de datos.
- Despliegue en escritorio (Linux, macOS) y en navegador (Chrome) via WebGPU.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision, audio y prediccion multi-token: anunciadas para futuras actualizaciones, no disponibles en la version actual.

## Casos de uso

- Asistente local de escritorio con privacidad: ejecutar el modelo en un portatil con GPU (por ejemplo, M4 Max) para conversaciones sin enviar datos a la nube, aprovechando la inferencia on-device y el contexto de hasta 16k tokens en escritorio.
- Automatizacion de tareas con function calling: integrar el modelo en una aplicacion de escritorio que invoque APIs locales o herramientas del sistema mediante el soporte de tool calling de LiteRT-LM.
- Demo web interactiva: desplegar el modelo en Chrome con WebGPU para prototipos de chat con contexto de hasta 80k tokens, usando el espacio de HuggingFace como referencia.
- Procesamiento de documentos de longitud media en local: resumir o extraer informacion de textos de varios miles de tokens manteniendo los datos en el equipo, gracias a la ventana de contexto extendida.
- Desarrollo y pruebas de aplicaciones edge: usar los ejemplos de `litert-samples` para validar integraciones de IA generativa en productos Android y de escritorio antes de pasar a produccion.
- Generacion de codigo y asistencia tecnica offline: emplear el modelo como copiloto local en entornos sin conectividad, con la ventaja de no depender de servicios externos.
- Educacion e investigacion: experimentar con un modelo de 31B cuantizado en hardware de consumo para estudiar comportamiento, latencia y calidad en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo incluye benchmarks de rendimiento de inferencia con LiteRT-LM:

| Dispositivo | Backend | Prefill (tok/s) | Decode (tok/s) | Init. (s) | Tamano (MB) |
|---|---|---|---|---|---|
| NVIDIA RTX 4090 24GB (Linux) | GPU | 1183 | 28 | 31,30 | 19218 |
| MacBook Pro 2024 M4 Max 48GB (macOS) | GPU | 215 | 18 | 14,49 | 19218 |
| MacBook Pro 2024 M4 Max 48GB (Web, Chrome) | GPU, Q4_0 | 148 | 7 | TTFT 17,1 s | 19218 |

Los benchmarks de escritorio se tomaron con 8192 tokens de prefill, 512 de decode y contexto de 16.384 tokens. Los de web, con 1024 de prefill, 256 de decode y contexto de 1280 tokens.

## Requisitos de hardware

- VRAM estimada: ~21 GB de memoria GPU en macOS (M4 Max) segun la model card; en RTX 4090 24GB el modelo de ~19,2 GB ocupa la mayor parte de la VRAM.
- GPU recomendadas: NVIDIA RTX 4090 24GB para escritorio Linux; Apple M4 Max 48GB para macOS; WebGPU en Chrome para navegador.
- Cabe en GPU de consumo: si, en tarjetas con 24 GB o mas de VRAM. No cabe en GPUs de 16 GB o menos con esta cuantizacion.
- Opciones de despliegue: LiteRT-LM CLI (v0.17.1 o superior obligatorio en escritorio), LiteRT-LM en web via WebGPU, y la pila LiteRT/XNNPack/ML Drift. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 28 tok/s de decode en RTX 4090, 18 tok/s en M4 Max nativo y 7 tok/s en web; TTFT de 17,1 s en web con contexto de 1280 tokens.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de calidad del modelo base en la informacion proporcionada, por lo que la comparativa se limita a caracteristicas objetivas.

| Modelo | Parametros | Contexto | Formato | Licencia | Despliegue local |
|---|---|---|---|---|---|
| Gemma 4 31B (esta ficha, LiteRT-LM) | 31B | hasta 80k (web); 16k en benchmarks | `.litertlm` int4 QAT | Apache 2.0 | LiteRT-LM (escritorio y web) |
| google/gemma-4-31B-it (base) | 31B | no disponible | safetensors (presumible) | Apache 2.0 | Multiples frameworks |
| Alternativas de ~30B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo soporta texto en esta version; vision, audio y prediccion multi-token no estan disponibles todavia.
- Requiere LiteRT-LM v0.17.1 o superior en escritorio; versiones anteriores no son compatibles.
- El modelo ocupa ~19,2 GB en disco y necesita ~21 GB de memoria GPU, lo que excluye GPUs de consumo de menos de 24 GB.
- El rendimiento en web es limitado (7 tok/s de decode, TTFT de 17,1 s) y el contexto de los benchmarks web es reducido (1280 tokens), aunque se declara soporte de hasta 80k.
- No se dispone de informacion sobre sesgos, tasas de alucinacion ni evaluaciones de seguridad en la documentacion proporcionada.
- Idiomas soportados no especificados; conviene validar el comportamiento multilingue antes de usarlo en produccion.
- Licencia Apache 2.0 permite uso comercial, pero deben revisarse los terminos del modelo base `google/gemma-4-31B-it` para confirmar condiciones adicionales.
- Al ser una cuantizacion int4 QAT, puede existir una degradacion de calidad respecto al modelo base en tareas sensibles a la precision.

## Enlaces

- HuggingFace (esta distribucion): https://huggingface.co/litert-community/gemma-4-31B-it-litert-lm
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Documentacion LiteRT-LM: https://ai.google.dev/edge/litert-lm/overview
- CLI de LiteRT-LM: https://ai.google.dev/edge/litert-lm/cli
- Ejemplos de LiteRT: https://github.com/google-ai-edge/litert-samples
- Demo web en HuggingFace Spaces: https://huggingface.co/spaces/tylermullen/Gemma4
