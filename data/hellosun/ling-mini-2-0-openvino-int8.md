# HelloSun/Ling-mini-2.0-OpenVINO-INT8

## Resumen

Ling-mini-2.0-OpenVINO-INT8 es una conversion del modelo inclusionAI/Ling-mini-2.0 a formato OpenVINO IR, optimizada para inferencia en CPU con un servidor compatible con la API de OpenAI. El modelo base es un transformer con arquitectura Mixture-of-Experts (MoE) de 16.3 mil millones de parametros totales y aproximadamente 1.4 mil millones de parametros activos, con 20 capas, 256 expertos y seleccion top-8, y una longitud de contexto nativa de 32K tokens. Esta version, publicada por el usuario HelloSun, aplica cuantizacion INT8 asimetrica por canal exclusivamente a los pesos de los expertos mediante NNCF, manteniendo el resto de componentes (atencion, experto compartido, embeddings y LM head) en FP16.

El problema que resuelve esta conversion es permitir el despliegue del modelo MoE en hardware de CPU sin GPU dedicada, reduciendo el artefacto de 32 GB en BF16 a 16 GB en disco. La estrategia de comprimir solo los expertos, que representan la mayor parte de los parametros (15.6 GB), y dejar las capas densas en FP16 se justifica por los experimentos del autor: la cuantizacion INT8 de todas las capas producia un error relativo del 3.9% en los logits del primer paso, mientras que limitar INT8 a los expertos lo reduce al 1.45%.

Es relevante porque demuestra una via practica para servir modelos MoE de tamano medio en infraestructura CPU convencional, con un servidor HTTP compatible con clientes OpenAI, aunque con limitaciones importantes de concurrencia y latencia que se detallan mas abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture-of-Experts), 20 capas, 256 expertos, top-8, experto compartido |
| Parametros totales | 16.3B |
| Parametros activos | ~1.4B |
| Longitud de contexto | 32K nativo (validado); contextos mayores requieren YaRN, no habilitado |
| Tipos de cuantizacion | Expertos INT8 asimetrico por canal (NNCF); no expertos FP16 (computo FP32); KV cache FP32 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | OpenVINO IR (modelo stateful), artefacto de 16 GB en disco |
| Tamano del repositorio | 17.0 GB |
| Libreria | openvino (OpenVINO 2026.4.1, transformers 4.57.6) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 20 capas, 256 expertos por capa y enrutamiento top-8, mas un experto compartido. Los pesos de los expertos se apilan en tensores `[E, ...]` y se ejecutan de forma dispersa mediante `torch._grouped_mm`, convertido en OpenVINO a `GroupedMatMul`, de modo que solo se evaluan los expertos seleccionados en cada token. La exportacion es stateful y usa una configuracion de E/S estilo Llama porque optimum-intel no soporta de forma nativa la arquitectura `bailing_moe` del modelo original.

Esta ficha corresponde a una conversion de pesos, no a un reentrenamiento: el comportamiento es el del modelo base con el error de cuantizacion documentado. El autor verifico numericamente que el modelo PyTorch parcheado equivale al original (diferencia relativa ~5e-7) y que el MoE con grouped-matmul equivale a una referencia por experto (1e-7). No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, ni sobre si el modelo base uso RLHF o DPO.

## Capacidades

- Generacion de texto y conversacion multi-turno mediante endpoints compatibles con la API de OpenAI (`/v1/chat/completions`, `/v1/completions`, `/v1/models`).
- Streaming de respuestas en el endpoint de chat.
- Razonamiento y generacion de codigo heredados del modelo base (no se documentan capacidades especificas adicionales en esta conversion).
- Procesamiento de prompts largos de hasta 32K tokens (validado).
- Inferencia en CPU sin GPU, con precision forzada a FP32 en el servidor (`INFERENCE_PRECISION_HINT=f32`).
- No soporta tool calling ni function calling de forma documentada en esta conversion.
- No soporta entrada de vision, batching, concurrencia multi-peticion ni prefix caching.

## Casos de uso

- Despliegue de un asistente conversacional en servidores sin GPU: el modelo corre en CPU con ~36 GB de RSS tras la carga, adecuado para entornos donde no hay aceleradores disponibles y se prioriza la disponibilidad sobre la latencia.
- Prototipado local con clientes OpenAI: al exponer una API compatible, se puede integrar en aplicaciones existentes cambiando solo la `base_url`, sin modificar el codigo cliente.
- Procesamiento de documentos largos de hasta 32K tokens en modo batch offline: por ejemplo, resumen o extraccion de informacion de contratos, donde la latencia de prefill (713 s para 32K con chunk de 1024) es aceptable en trabajos programados.
- Entornos de desarrollo y CI con restricciones de hardware: permite ejecutar pruebas de integracion de pipelines de IA en maquinas CPU estandar, usando el modelo como sustituto de un servicio remoto.
- Investigacion sobre cuantizacion MoE: el repositorio incluye scripts de conversion y evaluacion (`tools/`, `results/`) que sirven como referencia reproducible para comprimir otros modelos MoE con NNCF.
- Servicio interno de baja concurrencia: dado que el servidor serializa peticiones, encaja en herramientas internas con un unico usuario o cola de trabajos secuencial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor reporta metricas de fidelidad numerica y de rendimiento en CPU (80 nucleos, 251 GB RAM):

| Configuracion | Error relativo logits (1er paso) | Tokens greedy coincidentes | Veredicto |
|---|---|---|---|
| Expertos INT8, no expertos FP32 (baseline) | 1.45% / 1.86% | 16/16 | aceptado |
| Expertos INT8, no expertos FP16 (este repo) | 1.45% / 1.48% | 16/16 | elegido |
| Expertos INT4 asim., grupo 32 | 5.6% / 4.9% | 16/16 | rechazado (> 3%) |
| Expertos INT4 asim., grupo 64 | 6.6% / 6.4% | 14/16 | rechazado |

| Metrica de rendimiento (CPU) | Valor |
|---|---|
| Tamano en disco | 16 GB |
| RSS tras carga | ~36 GB |
| RSS pico en prefill de 32K | ~42.5 GB |
| Prefill, 32K (chunk 1024) | 713 s (~46 tok/s) |
| Prefill, 256 / 1024 / 2048 prompt | ~100 / 74 / 53 tok/s |
| Decode, contexto corto | ~38 ms/token (~26 tok/s) |
| Decode a 32K | ~64 ms/token (~15 tok/s) |
| KV cache a 32K | ~2.7 GB (FP32) |

## Requisitos de hardware

- RAM: ~36 GB de RSS tras la carga y ~42.5 GB de pico durante un prefill de 32K tokens. No cabe en equipos de consumo con 16 o 32 GB de RAM.
- CPU: medido en una maquina de 80 nucleos; el rendimiento en CPUs de menos nucleos sera proporcionalmente menor. El servidor lee `LING_THREADS` para fijar el numero de hilos.
- GPU: no probado. El autor indica explicitamente que no se han evaluado dispositivos GPU ni NPU.
- Despliegue: servidor propio incluido en el repositorio (`server.py` con FastAPI y uvicorn) sobre OpenVINO 2026.4.1. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Variables de entorno: `LING_MODEL_DIR`, `LING_CHUNK` (prefill, por defecto 1024), `LING_THREADS`, `LING_PERF_HINT`, `LING_KV_PRECISION`.
- Latencia: ~38 ms/token en decodificacion con contexto corto y ~64 ms/token a 32K; prefill de ~100 tok/s con prompts de 256 tokens.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Ling-mini-2.0-OpenVINO-INT8 (esta ficha) | 16.3B / ~1.4B | 32K | Expertos INT8, resto FP16 | MIT | OpenVINO IR |
| inclusionAI/Ling-mini-2.0 (base) | 16.3B / ~1.4B | 32K | BF16 | MIT | safetensors (BF16) |
| Alternativas MoE de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada es con el checkpoint base en BF16, del que esta version deriva. No se dispone de datos de rendimiento frente a otros modelos MoE de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El servidor serializa las peticiones: no hay concurrencia multi-peticion ni batching, lo que limita su uso en produccion con trafico paralelo.
- No hay prefix caching: cada peticion vuelve a procesar su prompt completo, con el coste de prefill correspondiente.
- El contexto esta validado hasta 32K; para longitudes mayores seria necesario activar YaRN (`rope_scaling`), que no esta habilitado ni evaluado.
- No soporta entradas de vision.
- La cuantizacion INT8 de los expertos introduce un error relativo de ~1.45% en los logits del primer paso respecto a un forward FP32; los errores se midieron contra FP32, no contra la inferencia BF16 oficial.
- `KV_CACHE_PRECISION` no tiene efecto en este IR; la cache KV se mantiene en FP32 (~80 KB/token).
- El almacenamiento FP16 de los no expertos reduce el tamano en disco (~1.2 GB) pero no el RSS, porque OpenVINO mantiene copias de trabajo FP32 tras la compilacion.
- Rendimiento no probado en GPU ni NPU; las cifras de latencia corresponden a una maquina concreta de 80 nucleos.
- No se han publicado evaluaciones de sesgos ni de tasa de alucinacion para esta conversion; al ser una conversion de pesos, hereda los del modelo base, no documentados aqui.
- La licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base inclusionAI/Ling-mini-2.0.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es una publicacion reciente y sin validacion externa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HelloSun/Ling-mini-2.0-OpenVINO-INT8
- Modelo base: https://huggingface.co/inclusionAI/Ling-mini-2.0
