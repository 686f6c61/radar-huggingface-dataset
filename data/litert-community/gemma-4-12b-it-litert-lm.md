# litert-community/gemma-4-12B-it-litert-lm

## Resumen

Gemma 4 12B es un modelo de lenguaje de tamano medio desarrollado por Google, derivado de la misma investigacion y tecnologia empleadas en la familia Gemini. Esta ficha concreta, publicada por la comunidad `litert-community`, distribuye el modelo base `google/gemma-4-12B-it` en formato LiteRT-LM (`.litertlm`), un contenedor optimizado para inferencia en dispositivo (on-device) sobre macOS, Linux, Windows y, de forma mas limitada, en navegador.

El modelo resuelve el problema de desplegar un LLM multimodal de 12.000 millones de parametros en hardware de escritorio sin depender de la nube, preservando la privacidad y permitiendo uso sin conexion. Incorpora soporte para texto, vision y audio, ademas de Multi-Token Prediction (MTP) para decodificacion especulativa y reduccion de latencia. La ventana de contexto alcanza hasta 128.000 tokens en equipos con memoria suficiente.

La relevancia actual radica en que LiteRT-LM es la misma pila tecnologica que impulsa Google AI Edge Gallery: una capa de orquestacion sobre LiteRT (con XNNPack para CPU y ML Drift para GPU) que anade gestion de KV-cache, plantillas de prompt y function calling. El repositorio ocupa 59,6 GB y acumula mas de 14.000 descargas, lo que refleja interes en despliegues locales de modelos multimodales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, derivada de Gemini); detalles internos no disponibles |
| Parametros totales | 12.000 millones (segun denominacion del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 128.000 tokens en dispositivos con memoria suficiente; benchmarks ejecutados con 4.096 tokens |
| Tipos de cuantizacion | no disponible (el artefacto distribuido es un unico archivo `.litertlm` de 6.883 MB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); modelo base en `google/gemma-4-12B-it` |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del transformer ni la composicion del dataset de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas de RLHF o DPO. La model card remite al repositorio del modelo base `google/gemma-4-12B-it` para esos detalles, que no se incluyen en la informacion proporcionada.

La innovacion tecnica destacable en esta distribucion es el soporte de Multi-Token Prediction (MTP), que habilita decodificacion especulativa y reduce la latencia de inferencia. El runtime LiteRT-LM anade sobre LiteRT una capa de orquestacion GenAI con gestion de KV-cache, plantillas de prompt y function calling, con aceleracion por XNNPack en CPU y ML Drift en GPU. El modelo es multimodal nativo (texto, vision y audio) en un unico archivo.

## Capacidades

- Generacion de texto y razonamiento conversacional en modo instruct (`-it`).
- Procesamiento de imagenes (vision) dentro del mismo artefacto `.litertlm`.
- Procesamiento de audio dentro del mismo artefacto.
- Multi-Token Prediction (MTP) para decodificacion especulativa y menor latencia.
- Function calling / tool calling a traves de las APIs de LiteRT-LM.
- Contexto largo de hasta 128.000 tokens en hardware con memoria suficiente.
- Inferencia local sin conexion, con privacidad de datos por diseno.
- Capacidades multilingues: no se especifica la lista de idiomas soportados.

## Casos de uso

- Asistentes de escritorio privados: ejecucion local en macOS, Linux o Windows sin enviar datos a la nube, aprovechando el formato `.litertlm` y el runtime LiteRT-LM para gestionar el KV-cache y las plantillas de prompt.
- Analisis de documentos e imagenes en local: la modalidad de vision permite extraer informacion de capturas, formularios o graficos sin salir del dispositivo, util en entornos con requisitos de confidencialidad.
- Transcripcion y comprension de audio on-device: la modalidad de audio habilita resumenes de reuniones o notas de voz procesadas localmente.
- Automatizacion de agentes con function calling: integracion de llamadas a herramientas mediante las APIs de LiteRT-LM para flujos multi-paso en aplicaciones de escritorio.
- Prototipado rapido en portatiles consumer: con 6.883 MB en disco y ~7.900 MB de memoria GPU, cabe en un MacBook Air M4 de 16 GB o en una RTX 5080 de 16 GB, facilitando pruebas sin infraestructura dedicada.
- Demos web interactivas: despliegue limitado en navegador mediante el Space de Hugging Face, adecuado para validacion de concepto y demostraciones.
- Procesamiento de contexto largo en local: con hasta 128.000 tokens, permite resumir o consultar corpus extensos en equipos con memoria suficiente, ajustando `max_num_tokens` para evitar problemas de memoria.

## Benchmarks y rendimiento

Los datos publicados corresponden a rendimiento de inferencia con LiteRT-LM (1.024 tokens de prefill y 256 de decode, contexto de 4.096 tokens, caches inicializadas, sin incluir tiempo de carga). No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible.

| Dispositivo | Backend | Prefill (tok/s) | Decode (tok/s) | TTFT (s) | Tamano (MB) | Memoria GPU (MB) |
|---|---|---|---|---|---|---|
| NVIDIA RTX 4090 24 GB | GPU | 3.548 | 69 | 0,3 | 6.883 | ~7.790 |
| MacBook M4 Pro 48 GB | GPU | 297 | 29 | 3,48 | 6.883 | ~7.870 |
| MacBook Air M4 16 GB | GPU | 114 | 15 | 9,13 | 6.883 | ~7.900 |
| NVIDIA RTX 5080 16 GB | GPU | 391 | 50 | 2,5 | 6.883 | ~7.300 |

## Requisitos de hardware

- VRAM estimada: aproximadamente 7.300-7.900 MB de memoria GPU segun el dispositivo medido, con un archivo de 6.883 MB en disco.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB) alcanza 3.548 tok/s de prefill y 69 tok/s de decode; RTX 5080 (16 GB) logra 391 tok/s de prefill y 50 tok/s de decode.
- Cabe en GPU consumer: si, en RTX 5080 de 16 GB y en MacBook Air M4 de 16 GB (114 tok/s prefill, 15 tok/s decode, TTFT de 9,13 s).
- Apple Silicon: MacBook M4 Pro de 48 GB ofrece 297 tok/s de prefill, 29 tok/s de decode y TTFT de 3,48 s.
- Opciones de despliegue: LiteRT-LM v0.17 o superior (requisito obligatorio); CLI de escritorio, apps de ejemplo en `google-ai-edge/litert-samples` y Space web.
- Contexto largo: soporta hasta 128.000 tokens en dispositivos con memoria suficiente; se recomienda reducir `max_num_tokens` si aparecen problemas de memoria.
- Nota: la latencia y el uso de memoria pueden diferir en la primera ejecucion; los benchmarks se tomaron con caches habilitadas e inicializadas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de calidad ni de especificaciones de modelos alternativos en la informacion proporcionada para establecer una comparativa rigurosa. Como referencia estructural, esta distribucion se diferencia de otras del mismo modelo base por su formato `.litertlm` y su runtime LiteRT-LM, orientados a inferencia on-device con soporte multimodal y MTP.

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| gemma-4-12B-it-litert-lm | 12.000 M | hasta 128k | `.litertlm` | Apache 2.0 | On-device multimodal |
| google/gemma-4-12B-it | 12.000 M | no disponible | no disponible | Apache 2.0 | Modelo base |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Requiere LiteRT-LM v0.17 o superior; versiones anteriores no pueden ejecutar el archivo `.litertlm`.
- El soporte en navegador es "mas limitado" segun la model card, sin detallar restricciones concretas.
- La ventana de 128.000 tokens depende de la memoria del dispositivo; en equipos modestos hay que reducir `max_num_tokens` para evitar fallos por memoria.
- La primera ejecucion puede presentar mayor latencia y consumo de memoria que las mediciones con caches inicializadas.
- No se detallan sesgos conocidos, tasas de alucinacion ni limitaciones por idioma en la informacion proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base `google/gemma-4-12B-it` y de la marca Gemma.
- El rendimiento de calidad (razonamiento, codigo, matematicas) no esta cuantificado con benchmarks publicos en esta ficha.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/gemma-4-12B-it-litert-lm
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Documentacion LiteRT-LM: https://ai.google.dev/edge/litert-lm/overview
- CLI de LiteRT-LM: https://ai.google.dev/edge/litert-lm/cli
- Apps de ejemplo: https://github.com/google-ai-edge/litert-samples
- Demo web (Space): https://huggingface.co/spaces/tylermullen/Gemma4
