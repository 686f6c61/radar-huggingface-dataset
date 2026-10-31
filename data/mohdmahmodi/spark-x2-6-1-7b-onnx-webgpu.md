# mohdmahmodi/Spark-X2.6-1.7B-ONNX-WebGPU

## Resumen

Spark-X2.6-1.7B-ONNX-WebGPU es una conversión a formato ONNX del modelo Spark-X2.6-1.7B, desarrollado por XHToken, realizada por mohdmahmodi para permitir inferencia directamente en el navegador mediante WebGPU con onnxruntime-web. El modelo base es un LLM conversacional de 1.7B parámetros con arquitectura de tipo Qwen3 (el `model_type` del config es `qwen3`), optimizado aquí con pesos oficiales INT4 (GPTQ, group size 32) repackados sin pérdida de calidad respecto al checkpoint oficial.

El problema que resuelve es la ejecución de LLMs de forma local y privada sin servidor: todo el cómputo ocurre en el cliente (Chrome con WebGPU), eliminando latencia de red y costes de infraestructura. Es relevante porque demuestra que modelos de 1.7B con contexto de hasta 16k tokens pueden ejecutarse a unos 105 tokens/segundo en un navegador de escritorio.

La validación publicada por el autor compara esta build con el checkpoint oficial INT4 ejecutado en transformers, mostrando paridad estadística (McNemar p = 1.00 en GSM8K y BFCL), con una divergencia KL media de 0.0757 respecto al modelo bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen3 (decoder-only), con GQA y sliding window attention |
| Parametros totales | 1.7B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | al menos 16k tokens validados (valor maximo oficial no disponible) |
| Tipos de cuantizacion | INT4 (GPTQ, group size 32) con activaciones fp16 (q4f16) o fp32 (q4); proyecciones secundarias y LM head en INT8 |
| Idiomas soportados | ingles, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (MatMulNBits), con soporte directo en Transformers.js 4.3 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo Qwen3 con 28 capas, Grouped Query Attention (ventana deslizante de 512 en 21 de las 28 capas), rotary embedding por tipo de capa (incluyendo rotary parcial) y vocabulario de 131.072 tokens. El grafo ONNX utiliza operadores fusionados como `GroupQueryAttention`, `SkipSimplifiedLayerNormalization` y `GatherBlockQuantized`, con `MatMulNBits` en `accuracy_level=0` (activaciones en punto flotante).

Los detalles del entrenamiento del modelo base (numero de tokens, composicion del dataset, RLHF/DPO) no estan disponibles en la informacion proporcionada. En cuanto a la conversion, los pesos provienen del checkpoint oficial Spark-X2.6-1.7B-INT4 de XHToken; la decodificacion fue verificada contra compressed-tensors (la libreria que escribio el checkpoint) con coincidencia exacta en todos los tensores. Como innovacion, la tabla de embedding de entrada int8 se comparte con el LM head (swap medido como lossless, KL media 0.0007), y la cache KV puede enlazarse a un buffer GPU preasignado para un cache estatico in-place.

## Capacidades

- Generacion de texto conversacional en ingles y chino
- Razonamiento con modo thinking configurable (los benchmarks oficiales reportados por XHToken se miden con thinking activado a alta intensidad)
- Function calling / tool calling (validado con BFCL v3, 200 casos)
- Recuperacion de informacion en contexto largo (needle in a haystack: 12/12 casos entre 1k y 16k tokens)
- Resolucion de problemas matematicos (GSM8K: 72.7% con thinking desactivado)
- Ejecucion 100% en navegador con WebGPU, sin backend propio
- Compatibilidad con Transformers.js 4.3 y onnxruntime nativo en CPU

## Casos de uso

- Chatbots privados en el navegador: al ejecutarse integramente en el cliente, los datos del usuario nunca salen del dispositivo, ideal para asistentes que manejan informacion sensible.
- Demos y prototipos sin backend: un Space de HuggingFace permite probar el modelo sin desplegar servidores GPU, reduciendo el coste de validar ideas de producto.
- Function calling en aplicaciones web: con soporte de BFCL v3, puede integrarse en interfaces de agente que invocan herramientas del navegador (busquedas, APIs locales, manipulacion del DOM).
- Asistentes offline (PWA): combinado con service workers y cache de pesos, permite aplicaciones de IA funcionales sin conexion tras la primera carga.
- Procesamiento de documentos de longitud media: la ventana de contexto validada de 16k tokens permite resumir o consultar documentos largos localmente, con recuperacion 12/12 en pruebas de aguja en pajar.
- Educacion y experimentacion: el grafo ONNX documentado (operadores, shapes, cache KV) y el informe de validacion publico lo hacen util como referencia para aprender sobre cuantizacion INT4 e inferencia WebGPU.
- Dispositivos sin GPU dedicada: la variante `model_q4` (fp32) funciona en GPUs sin soporte `shader-f16`, y onnxruntime nativo permite ejecucion en CPU.

## Benchmarks y rendimiento

Resultados de la build ONNX comparados con el modelo original en transformers (Chrome, WebGPU, decodificacion greedy, thinking desactivado):

| Check | transformers bf16 | transformers INT4 oficial | Esta build |
|---|---|---|---|
| GSM8K (1.319 problemas) | 75,7% | 72,7% | 72,7% |
| BFCL v3 function calling simple (200 casos) | 76,5% | 52,5% | 52,5% |
| Needle in a haystack (1k-16k, 12 casos) | 12/12 | 12/12 | 12/12 |
| Divergencia KL next-token vs bf16 (160 posiciones) | 0 | 0,0731 | 0,0757 |
| Paridad greedy, primer token identico (50 prompts) | 50/50 | 40/50 | 39/50 |

XHToken reporta ademas 30 benchmarks para el modelo base (con thinking activado), disponibles como imagenes en la model card; los valores numericos no estan disponibles en texto.

Rendimiento (Chrome, Windows 11, NVIDIA RTX 3090 Ti): unos 105 tokens/segundo desde prompts cortos hasta 16k de contexto; primer token en 49 ms con prompt corto y 5,9 s con prompt de 16k tokens.

## Requisitos de hardware

- Descarga de pesos: 1,21 GB (q4f16) o 1,34 GB (q4); el repo completo ocupa 2,5 GB
- GPU del cliente con soporte WebGPU; para la variante q4f16 se requiere la extension `shader-f16`
- Probado en NVIDIA RTX 3090 Ti (105 tok/s); GPUs integradas modernas deberian funcionar con menor throughput (cifras no disponibles)
- No requiere servidor ni VRAM dedicada: el modelo se ejecuta en la GPU del navegador
- Alternativa en CPU mediante onnxruntime nativo (velocidades no disponibles)
- Despliegue: onnxruntime-web 1.31.0-dev.20260918 o superior, Transformers.js 4.3, o el Space de demostracion de HuggingFace
- No aplica vLLM, TGI, llama.cpp ni Ollama al ser formato ONNX para web (no hay GGUF)

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Ejecucion en navegador |
|---|---|---|---|---|---|
| Spark-X2.6-1.7B-ONNX-WebGPU | 1.7B | 16k validados | INT4 GPTQ | Apache-2.0 | Si, WebGPU |
| Qwen3-1.7B (base del tipo de arquitectura) | 1.7B | no disponible | bf16 nativo | Apache-2.0 | Requiere conversion ONNX propia |
| SmolLM2-1.7B-Instruct | 1.7B | 8k | bf16 / GGUF | Apache-2.0 | Posible via ONNX/WASM con rendimiento inferior |

No hay datos de benchmarks comparativos directos entre estos modelos en la informacion disponible, salvo los reportados por XHToken frente a modelos de tamano similar (imagenes, sin cifras en texto).

## Limitaciones y advertencias

- La cuantizacion INT4 oficial degrada notablemente el function calling: BFCL cae de 76,5% (bf16) a 52,5% (INT4); en muchos casos el modelo responde en texto donde bf16 invocaria la herramienta. Evitalo para pipelines criticos de agentes.
- La degradacion por INT4 es mayor en este 1.7B que en la variante 4B segun XHToken.
- Solo se han validado 16k tokens de contexto; el maximo oficial no esta disponible en la informacion proporcionada.
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado.
- El rendimiento depende fuertemente de la GPU del cliente; en portatiles o GPUs integradas la latencia del primer token con prompts largos (5,9 s a 16k en una 3090 Ti) puede ser inaceptable.
- La build requiere versiones concretas de onnxruntime-web (1.31.0-dev o superior), lo que puede implicar fragilidad ante cambios en la libreria.
- Riesgo de alucinacion tipico de modelos de 1.7B: capacidad de razonamiento limitada; no adecuado para tareas que exijan alta fiabilidad factual sin verificacion externa.
- La licencia Apache-2.0 permite uso comercial sin restricciones destacables.
- Los benchmarks con thinking desactivado no son comparables con los reportados por XHToken con thinking activado.

## Enlaces

- Modelo ONNX: https://huggingface.co/mohdmahmodi/Spark-X2.6-1.7B-ONNX-WebGPU
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-1.7B
- Checkpoint INT4 oficial: https://huggingface.co/XHToken/Spark-X2.6-1.7B-INT4
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/mohdmahmodi/Spark-X2.6-1.7B-WebGPU
- Codigo fuente e informe de validacion: https://github.com/mohdmahmodi/Spark-X2.6-1.7B-onnx-webgpu
- Informe de validacion detallado: https://github.com/mohdmahmodi/Spark-X2.6-1.7B-onnx-webgpu/blob/main/docs/VALIDATION.md
- PR de onnxruntime (#33760): https://github.com/microsoft/onnxruntime/pull/33760
- Documentacion de onnxruntime-web: https://onnxruntime.ai/docs/tutorials/web/
