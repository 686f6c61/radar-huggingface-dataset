# jcbtc/Inkling-2-Mini-CIRU-512K-1M-NVFP4-KV

## Resumen

Inkling-2-Mini-CIRU-512K-1M-NVFP4-KV es una distribución cuantizada del modelo Inkling-2-Mini de Thinking Machines Lab, publicada por el usuario jcbtc. No se trata de un modelo entrenado desde cero, sino de un checkpoint adaptado para servir en una única GPU de consumo NVIDIA GeForce RTX 5090 con 32 GB de VRAM, aprovechando el formato NVFP4 para los pesos y para la caché de clave-valor (KV cache). El modelo base tiene 26.388.646.440 parámetros totales (aproximadamente 26,4 mil millones) y se distribuye bajo licencia Apache 2.0.

La propuesta técnica principal es doble: por un lado, ofrece dos presets de contexto, uno de 524.288 tokens con decodificación especulativa DSpark y otro de 1.048.576 tokens en modo target-only. Por otro, emplea una caché KV en NVFP4 que, según el autor, reduce el almacenamiento de la caché de atención un 43,75% respecto a FP8, incluyendo las escalas. Esto permite manejar ventanas de contexto extremas en hardware que, de otro modo, no podría albergarlas.

El runtime se apoya en vLLM y expone una API compatible con OpenAI. La relevancia actual radica en que demuestra que es viable ejecutar un modelo de 26B con contexto de hasta 1M de tokens en una GPU consumer Blackwell, algo que hasta hace poco requería hardware de centro de datos o configuraciones multi-GPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Inkling-2-Mini); runtime vLLM con decodificación especulativa DSpark |
| Parámetros totales | 26.388.646.440 (~26,4B) |
| Parámetros activos | no disponible |
| Longitud de contexto | 524.288 tokens (preset 512k) o 1.048.576 tokens (preset 1m) |
| Tipos de cuantización | NVFP4 en pesos y caché KV (mezcla NVFP4/MXFP8 en pesos del modelo base); 8-bit según tags del repo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint ~20 GB) |

## Arquitectura y entrenamiento

El modelo base es Inkling-2-Mini de Thinking Machines Lab, un transformer del que no se detallan en la información disponible ni la composición del dataset de entrenamiento, ni el número de tokens, ni si hubo fases de RLHF o DPO. La distribución de jcbtc no reentrena el modelo: parte del checkpoint original y aplica cuantización NVFP4/MXFP8 mediante NVIDIA ModelOpt, manteniendo los pesos en safetensors.

La innovación técnica de esta ficha reside en el runtime. El preset de 512k usa decodificación especulativa DSpark, que requiere el fichero `mtp.safetensors` junto al modelo, y permite hasta 2 secuencias activas (o hasta 32 en la variante `512k-throughput`). El preset de 1m funciona en modo target-only con una sola secuencia activa (o hasta 32 en `1m-throughput`). La caché KV en NVFP4 reduce el espacio de atención un 43,75% frente a FP8, lo que hace posible alojar contextos de 512K o 1M tokens en los 32 GB de la RTX 5090. El servidor se expone en `http://127.0.0.1:18753/v1` con el identificador de modelo `main`.

## Capacidades

- Generación de texto conversacional y text-generation en general, según el pipeline declarado.
- Procesamiento de contextos muy largos: hasta 524.288 tokens con DSpark o 1.048.576 tokens en modo target-only.
- Decodificación especulativa DSpark en el preset de 512k, que acelera la generación agregada.
- Servicio mediante API compatible con OpenAI (`/v1/chat/completions`, `/v1/models`, `/health`).
- Soporte de múltiples peticiones concurrentes según preset (hasta 32 secuencias en las variantes throughput).
- Tool calling, function calling, agentes, visión, audio o modo thinking: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentos extensos: con 512K o 1M tokens de contexto, el modelo puede ingerir libros completos, expedientes o bases de código y responder preguntas sobre ellos sin fragmentación, usando el preset `1m` para prompts únicos muy largos.
- Asistentes de investigación con memoria larga: el preset `512k` con DSpark permite conversaciones multi-turno que acumulan mucho historial manteniendo velocidades de decodificación agregadas de hasta 2.584,9 tokens/s en lote.
- Procesamiento por lotes de prompts medianos: la variante `512k-throughput` admite hasta 32 secuencias concurrentes, adecuada para clasificación, resumen o extracción de información sobre lotes de documentos de unos pocos miles de tokens.
- Despliegue en estación de trabajo con GPU consumer: al caber en una RTX 5090 de 32 GB, permite prototipar y servir localmente sin depender de clústeres, útil para equipos con presupuesto limitado.
- Evaluación de modelos de contexto largo: sirve como banco de pruebas para medir latencia y throughput con prompts de 64K, 128K y 256K, con cifras de referencia publicadas por el autor.
- Integración en pipelines internos vía API OpenAI-compatible: el endpoint local `/v1/chat/completions` facilita conectar el modelo a herramientas existentes que ya hablan el protocolo de OpenAI.
- Investigación sobre cuantización NVFP4: el checkpoint permite estudiar el impacto de la caché KV en NVFP4 frente a FP8 en tareas de contexto largo.

## Benchmarks y rendimiento

Los datos publicados son mediciones de rendimiento del runtime en una RTX 5090, no resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.), que no están disponibles.

Preset 512k con DSpark (greedy, 256 tokens de salida por petición):

| Peticiones concurrentes | Prompt aprox. por petición | Tokens entrada/salida | Input tok/s | Decode agregado tok/s | TTFT de lote |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 4K | 4.026 / 256 | 1.716* | 327,3 | 2,35 s* |
| 4 | 8K | 32.093 / 1.024 | 9.258 | 783,5 | 3,47 s |
| 8 | 8K | 64.188 / 2.048 | 10.505 | 1.363,3 | 6,11 s |
| 16 | 4K | 64.428 / 4.096 | 11.578 | 2.584,9 | 5,56 s |
| 1 | 64K | 63.953 / 256 | 8.697 | 221,3 | 7,35 s |

Preset 1m con decodificación target-only:

| Peticiones concurrentes | Prompt aprox. por petición | Input tok/s | Decode tok/s | TTFT |
| ---: | ---: | ---: | ---: | ---: |
| 1 | 64K | 8.074 | 161,3 | 7,92 s |
| 1 | 128K | 6.419 | 146,8 | 19,92 s |
| 1 | 256K | 4.427 | 126,6 | 57,75 s |

El autor indica además una ejecución separada con 32 peticiones de ~3K tokens de entrada, temperatura 1.0 y límite de 512 tokens de salida, que alcanzó 1.393 tokens/s de salida extremo a extremo incluyendo prefill. Los asteriscos marcan procesamiento en frío con compilación de Triton. El TTFT de lote mide desde el inicio de la primera petición hasta que todas han emitido su primer token.

## Requisitos de hardware

- VRAM: 32 GB, correspondientes a una única NVIDIA GeForce RTX 5090; el checkpoint ocupa aproximadamente 20 GB en disco.
- GPU recomendadas: RTX 5090 (Blackwell) como plataforma objetivo y validada; otras GPU Blackwell con soporte NVFP4 podrían ser compatibles, pero no se documentan.
- GPU consumer: sí, cabe en RTX 5090. No se indica compatibilidad con GPU de generaciones anteriores (Ampere, Ada) al depender de NVFP4.
- Sistema: x86-64 Linux, Ubuntu 24.04 LTS validado, driver NVIDIA 620.70.06 y driver compatible con CUDA 13.
- Despliegue: vLLM mediante el runtime CIRU (contenedor Docker), API OpenAI-compatible en `http://127.0.0.1:18753/v1`. No se mencionan llama.cpp, Ollama ni TGI.
- Presets: `512k`, `512k-throughput`, `1m` y `1m-throughput`; solo uno activo a la vez en la tarjeta de 32 GB.
- Latencia y throughput: ver tabla de benchmarks; por ejemplo, 126,6 tokens/s de decodificación con un prompt de 256K en modo 1m, y 2.584,9 tokens/s agregados con 16 peticiones concurrentes en modo 512k.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de calidad ni de especificaciones de modelos alternativos en la información proporcionada, por lo que la comparativa cuantitativa no está disponible. A modo de referencia estructural:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---:|---|---|---|
| Inkling-2-Mini-CIRU-512K-1M-NVFP4-KV | ~26,4B | 512K / 1M | Apache 2.0 | Hugging Face (jcbtc) |
| Inkling-2-Mini (base) | no disponible | no disponible | Apache 2.0 | Hugging Face (thinkingmachines) |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio registra 0 descargas y 0 likes en el momento de la consulta; es una publicación reciente y sin validación comunitaria amplia.
- Solo se ha validado en una RTX 5090 con 32 GB; no hay garantías de funcionamiento en otras GPU, y NVFP4 exige hardware Blackwell.
- El contexto máximo real depende del preset y del número de secuencias concurrentes: las peticiones comparten la caché de la GPU, por lo que el total admitido varía según la longitud de cada prompt.
- En modo 1m solo hay una secuencia activa en el preset `1m`; para concurrencia debe usarse `1m-throughput`, con menor rendimiento por secuencia.
- El preset 512k requiere el fichero `mtp.safetensors` para la decodificación especulativa DSpark; sin él no funciona ese modo.
- No se han publicado datos de sesgos, tasas de alucinación ni evaluación de calidad; no hay información sobre idiomas soportados.
- Las cifras de rendimiento son del autor y corresponden a cargas concretas (prompts de 4K a 256K, 256 tokens de salida, decodificación greedy); no deben extrapolarse sin verificación.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia y condiciones del modelo base Inkling-2-Mini de Thinking Machines Lab.
- El runtime depende de un repositorio GitHub de CIRU y de un contenedor Docker; la cadena de suministro y el mantenimiento del proyecto no están auditados en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/jcbtc/Inkling-2-Mini-CIRU-512K-1M-NVFP4-KV
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio del runtime: https://github.com/ciru-ai/Inkling-2-Mini-CIRU-512K-1M-NVFP4-KV
- Docker Engine para Ubuntu: https://docs.docker.com/engine/install/ubuntu/
- NVIDIA Container Toolkit: https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html
