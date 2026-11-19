# sairaph-official/Phi-4-mini-instruct-56afc01

## Resumen

Phi-4-mini-instruct-56afc01 es un espejo (mirror) del repositorio `litert-community/Phi-4-mini-instruct`, publicado por el usuario `sairaph-official` para su uso en la aplicacion LLM Server. No se trata de un modelo nuevo ni de un fine-tuning: los pesos son una copia byte a byte del commit `56afc01737f19f1b3fc9713be1f9cc859e4684b6` del repositorio upstream de LiteRT. El modelo base subyacente es `microsoft/Phi-4-mini-instruct`, un transformer denso de Microsoft disenado para razonamiento, codigo y matematicas en un formato compacto.

La particularidad de esta distribucion es el formato: un unico fichero `.litertlm` de 3.910.090.752 bytes (aproximadamente 3,9 GB) cuantizado en `dynamic_int8` (pesos int8, activaciones float) y con una cache KV de 4096 tokens. Esta empaquetado especificamente para el stack LiteRT (antes TFLite) de Google, lo que permite ejecutar el modelo en Android mediante LiteRT-LM o la MediaPipe LLM Inference API, en lugar de en un servidor GPU convencional.

Su relevancia es practica: ofrece una via reproducible para desplegar un modelo de la familia Phi-4 en dispositivos moviles con aceleracion por GPU o CPU (XNNPACK), con metricas de rendimiento publicadas sobre un Samsung S24 Ultra. Para desarrolladores que trabajan en inferencia on-device, es una referencia util; para quien busque el modelo original en safetensors o GGUF, este repositorio no es el adecuado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (hereda la de microsoft/Phi-4-mini-instruct; no se detalla en la informacion disponible) |
| Parametros totales | no disponible (el modelo base Phi-4-mini-instruct es de 3.800 millones segun la denominacion de Microsoft, pero no se confirma en la informacion proporcionada) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4096 tokens (cache KV `ekv4096` del fichero empaquetado) |
| Tipos de cuantizacion | dynamic_int8 (pesos int8, activaciones float) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `.litertlm` (LiteRT-LM); no incluye safetensors ni GGUF |

## Arquitectura y entrenamiento

El repositorio no aporta informacion sobre la arquitectura interna, el volumen de datos de entrenamiento ni el proceso de alineacion (RLHF/DPO) del modelo base. Lo unico verificable es que se trata de una copia sin modificaciones de `microsoft/Phi-4-mini-instruct`, por lo que las caracteristicas arquitectonicas son las del modelo original de Microsoft, no descritas en esta model card.

La innovacion tecnica de esta distribucion no esta en el modelo sino en el empaquetado: un unico flatbuffer LiteRT con cuantizacion `dynamic_int8`, cache KV fija de 4096 tokens y soporte de multiples firmas de prefill (`multi-prefill-seq`). Esto habilita la ejecucion en Android a traves de LiteRT-LM (`com.google.ai.edge.litertlm:litertlm-android`) y de la MediaPipe LLM Inference API, esta ultima en modo de solo mantenimiento.

## Capacidades

- Generacion de texto conversacional (`pipeline_tag: text-generation`, tag `chat`).
- Razonamiento, codigo y matematicas: capacidades heredadas del modelo base Phi-4-mini-instruct de Microsoft, si bien no se detallan en la informacion disponible.
- Inferencia on-device en Android mediante LiteRT-LM o MediaPipe LLM Inference API.
- Aceleracion por GPU movil y por CPU via delegado XNNPACK (4 hilos en los benchmarks publicados).
- Soporte de tool calling, agentes, vision o audio: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.

## Casos de uso

- Asistentes conversacionales on-device en Android: el fichero `.litertlm` se carga directamente con LiteRT-LM en una app Kotlin, permitiendo chat local sin conexion con un contexto de 4096 tokens.
- Prototipado rapido con Edge Gallery: instalando la app de Google AI Edge y descargando el modelo, se puede evaluar el comportamiento conversacional en un telefono real sin escribir codigo.
- Aplicaciones de privacidad estricta: al ejecutarse integramente en el dispositivo, los datos del usuario no salen del terminal, lo que encaja en escenarios sanitarios o financieros con requisitos de residencia de datos.
- Funciones de texto integradas en apps moviles: resumen, reescritura o generacion de respuestas dentro de una aplicacion Android usando la API de LiteRT-LM, con latencia de primera token de aproximadamente 10 s en GPU movil.
- Evaluacion comparativa de backends moviles: el mismo fichero permite medir CPU frente a GPU en un dispositivo concreto (por ejemplo, S24 Ultra) para decidir la configuracion de despliegue.
- Base para experimentos de cuantizacion en edge: al ser una copia reproducible con hash SHA-256 publicado, sirve como referencia estable en pruebas de rendimiento y memoria en el stack LiteRT.
- Integracion en pipelines de CI para apps Android: el hash y el tamano del fichero permiten verificar la integridad del artefacto descargado durante la compilacion.

## Benchmarks y rendimiento

Rendimiento medido en un Samsung S24 Ultra con cache KV de 1280 tokens y multiples firmas de prefill habilitadas:

| Backend | Cuantizacion | Contexto | Prefill (tk/s) | Decode (tk/s) | TTFT (s) | Tamano (MB) | RSS pico (MB) | Memoria GPU (MB) |
|---|---|---|---|---|---|---|---|---|
| CPU (XNNPACK, 4 hilos) | dynamic_int8 | 4096 | 66,53 | 7,28 | 15,90 | 3906 | 5308 | N/A |
| GPU | dynamic_int8 | 4096 | 314,01 | 10,39 | 10,32 | 3906 | 4107 | 4608 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Almacenamiento: 3,9 GB para el fichero `.litertlm` (3.910.090.752 bytes).
- Memoria en ejecucion: pico de RSS de 5308 MB en CPU y 4107 MB en GPU; 4608 MB de memoria GPU en el caso acelerado.
- Dispositivo de referencia: Samsung S24 Ultra (Android). No se documentan otros dispositivos.
- GPU de escritorio (A100, H100, RTX 4090): no disponible; el formato LiteRT-LM esta orientado a Android/iOS/Web, no a servidores CUDA.
- Despliegue: LiteRT-LM (Android, via `com.google.ai.edge.litertlm:litertlm-android`), MediaPipe LLM Inference API (solo mantenimiento), Edge Gallery, y ejecucion en Colab con la advertencia de que el rendimiento en Colab puede ser muy inferior al de un dispositivo local.
- vLLM, llama.cpp, Ollama o TGI: no soportados por este formato de pesos.
- Throughput y latencia: ver tabla de benchmarks (decode de 7,28 tk/s en CPU y 10,39 tk/s en GPU).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Orientacion |
|---|---|---|---|---|---|
| sairaph-official/Phi-4-mini-instruct-56afc01 (este) | no disponible (base Phi-4-mini) | 4096 | `.litertlm` (int8 dinamico) | MIT | Inferencia on-device Android |
| microsoft/Phi-4-mini-instruct | no disponible en la informacion | no disponible en la informacion | safetensors (presumible, no confirmado) | MIT | Entrenamiento e inferencia general |
| litert-community/Phi-4-mini-instruct | identico al anterior | 4096 (variante `ekv4096`) | `.litertlm` | MIT | Inferencia on-device Android |

La comparativa con alternativas de otros fabricantes (Gemma, Qwen, Llama en formato movil) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo nuevo ni un fine-tuning: es un espejo byte a byte del repositorio `litert-community/Phi-4-mini-instruct`; cualquier cambio upstream no se refleja automaticamente.
- El repositorio upstream no incluye ficheros de licencia ni de aviso; Sairaph los anade copiandolos de `microsoft/Phi-4-mini-instruct`. La licencia MIT se aplica al modelo base, pero conviene verificar los terminos del modelo original antes de un uso comercial.
- Formato no estandar: el `.litertlm` no es compatible con vLLM, llama.cpp, Ollama ni TGI; el uso queda restringido al ecosistema LiteRT/MediaPipe.
- Contexto limitado a 4096 tokens en esta variante, insuficiente para tareas de contexto largo.
- MediaPipe LLM Inference API esta en modo de solo mantenimiento, lo que implica riesgo de obsolescencia a medio plazo.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento adecuado en castellano sin evaluacion previa.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible, pero aplicables a cualquier modelo de lenguaje de este tamano.
- Creado y actualizado el 2026-11-18 con 0 descargas y 0 likes: sin validacion de la comunidad ni evidencia de uso en produccion.
- El rendimiento publicado corresponde exclusivamente a un Samsung S24 Ultra; extrapolar a otros dispositivos puede llevar a estimaciones erroneas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sairaph-official/Phi-4-mini-instruct-56afc01
- Repositorio upstream LiteRT: https://huggingface.co/litert-community/Phi-4-mini-instruct
- Modelo base de Microsoft: https://huggingface.co/microsoft/Phi-4-mini-instruct
- LiteRT (antes TFLite): https://ai.google.dev/edge/litert
- MediaPipe LLM Inference API: https://ai.google.dev/edge/mediapipe/solutions/genai/llm_inference
- LiteRT-LM (GitHub): https://github.com/google-ai-edge/LiteRT-LM
- Guia LiteRT-LM para Android: https://ai.google.dev/edge/litert-lm/android
- Edge Gallery (GitHub): https://github.com/google-ai-edge/gallery
- Edge Gallery (Google Play): https://play.google.com/store/apps/details?id=com.google.ai.edge.gallery
- Ejemplos LiteRT: https://github.com/google-ai-edge/litert-samples
- Delegado XNNPACK: https://github.com/google/XNNPACK
- Notebook de Colab: https://colab.research.google.com/#fileId=https://huggingface.co/litert-community/Phi-4-mini-instruct/blob/main/notebook.ipynb
