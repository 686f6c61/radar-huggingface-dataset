# neural-nova/gpt-oss-120b-Instruct-Optimized

## Resumen

`neural-nova/gpt-oss-120b-Instruct-Optimized` no es un modelo con pesos propios, sino una receta de despliegue reproducible: un `Dockerfile`, un script de arranque (`launch_server.sh`) y un script de benchmark (`run_benchmark.sh`) para servir `openai/gpt-oss-120b` con vLLM v0.24.0 sobre una unica GPU NVIDIA H100 de 80 GB. El repositorio lo publica el usuario neural-nova y su contenido es una configuracion afinada de `vllm serve`, no un artefacto de pesos: el propio autor indica que el servidor descarga los pesos directamente del repositorio upstream y los cachea en el arranque.

El problema que aborda es de eficiencia de inferencia. Frente a una configuracion base (`--tensor-parallel-size 1 --max-model-len 16384`), la configuracion optimizada reporta un aumento del 24,5 % en tokens de salida por segundo (de 364 a 453 tok/s), una reduccion del TTFT mediano de 14,6 s a 11,4 s y del TPOT mediano de 169 ms a 127 ms, con un coste por token aproximadamente un 20 % menor. La mejora se consigue con ajustes de memoria y planificacion (`--gpu-memory-utilization 0.92`, `--max-num-batched-tokens 32768`, `--max-num-seqs 128`, `--block-size 16`) y con la activacion de prefix caching, chunked prefill y async scheduling.

Es relevante ahora porque el modelo subyacente es un MoE disperso con pesos de expertos en MXFP4 y el resto de componentes en BF16, un perfil de cuantizacion que exige ajustar con cuidado el uso de memoria y el backend de atencion. La receta empaqueta esos ajustes en scripts ejecutables y automatiza la comparacion baseline/optimizado, lo que reduce el trabajo de reproducibilidad, aunque el repositorio no incluye evaluaciones de calidad del modelo (MMLU, HumanEval, GSM8K u otras) ni datos sobre capacidades mas alla del servicio de generacion de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE disperso causal tipo transformer, con attention sinks |
| Parametros totales | no disponible en la informacion proporcionada (el nombre del repositorio indica 120 000 millones) |
| Parametros activos | no disponible (arquitectura MoE dispersa, numero de expertos y parametros activos no documentados en la informacion proporcionada) |
| Longitud de contexto | no disponible para el modelo; la receta fija `--max-model-len 16384` en las configuraciones baseline y optimizada |
| Tipos de cuantizacion | pesos de los expertos MoE en MXFP4; atencion, normalizaciones, embeddings y router en BF16 |
| Idiomas soportados | no disponible |
| Licencia | MIT (campo `license` del frontmatter); la propia model card incluye un TODO sin resolver para anadir la licencia del modelo upstream |
| Formato de pesos | no disponible (el repositorio no contiene pesos; vLLM descarga los del repositorio upstream y los cachea) |

Otros datos del repositorio: autor neural-nova, 0 descargas, 0 likes, creacion 18 de septiembre de 2026, ultima actualizacion 24 de septiembre de 2026, pipeline no disponible, tags `vllm`, `bechmarking` (sic), `moe`, `inference-optimization`, `license:mit`, `region:us`.

## Arquitectura y entrenamiento

La informacion disponible solo describe la arquitectura a alto nivel: se trata de un modelo de lenguaje causal con arquitectura de mezcla de expertos dispersa (sparse MoE) y attention sinks. Los pesos de los expertos estan cuantizados en MXFP4, mientras que los componentes de atencion, las normalizaciones, los embeddings y el router se mantienen en BF16. No se documentan en la informacion proporcionada el numero de expertos, el numero de parametros activos por token, la longitud de contexto nativa, la composicion del dataset de entrenamiento, el volumen de tokens ni si hubo fases de RLHF, DPO u otras tecnicas de alineamiento.

Tampoco se documentan innovaciones de decodificacion especulativa ni mecanismos de atencion lineal. Lo que si se describe con detalle es la configuracion de servicio: vLLM v0.24.0 sobre la imagen base `vllm/vllm-openai:v0.24.0`, paralelismo tensorial 1 (una sola GPU), backend de atencion `FLASH_ATTN`, prefix caching, chunked prefill, async scheduling, `--watermark 0.01`, `--block-size 16` y `VLLM_FLOAT32_MATMUL_PRECISION=medium`, ademas de la desactivacion del envio de estadisticas de uso (`VLLM_NO_USAGE_STATS=1`, `VLLM_DO_NOT_TRACK=1`).

## Capacidades

La informacion proporcionada no documenta las capacidades funcionales del modelo subyacente. Lo unico verificable a partir de la model card es lo siguiente:

- Generacion de texto mediante API compatible con OpenAI: el ejemplo de validacion usa `POST /v1/completions` con el modelo `openai/gpt-oss-120b` y `max_tokens: 16`.
- Servicio HTTP con endpoint de salud (`GET /health`) para comprobacion de disponibilidad.
- Ejecucion en contenedor Docker con paso de argumentos (`baseline` u `optimized`) para seleccionar la configuracion de servicio.
- Reproduccion automatizada de benchmarks mediante `run_benchmark.sh`, que levanta y apaga ambos servidores y genera JSON por ejecucion.
- Optimizaciones de inferencia activas: prefix caching, chunked prefill, async scheduling y FlashAttention.
- Razonamiento, codigo, matematicas, vision, tool calling, function calling, soporte de agentes, capacidades multilingues y modo de pensamiento: no disponibles en la informacion proporcionada.
- El sufijo "Instruct" del nombre del repositorio sugiere ajuste a instrucciones, pero no se aporta ninguna evidencia de ello en la model card.

## Casos de uso

- Servicio de generacion de texto a alta concurrencia: la configuracion optimizada esta medida a concurrencia 16 con 200 peticiones, por lo que encaja en despliegues con multiples peticiones simultaneas y lotes de hasta 128 secuencias (`--max-num-seqs 128`).
- Reproduccion de benchmarks de inferencia en una sola GPU: `run_benchmark.sh both` automatiza la comparacion baseline/optimizado y deja los JSON y logs en `/workspace`, util para validar hardware o versiones de vLLM.
- Comparacion de configuraciones de servidor antes de un despliegue: permite medir el impacto de cambiar `--max-num-batched-tokens`, `--block-size` o el backend de atencion sin modificar codigo de aplicacion.
- Evaluacion de coste por token: la receta reporta aproximadamente un 20 % menos de coste por token en la configuracion optimizada sobre una H100, lo que sirve como referencia para estimaciones de factura en produccion.
- Pruebas de integracion con clientes compatibles con la API de OpenAI: el endpoint `/v1/completions` permite apuntar SDKs existentes al servidor sin cambios.
- Escenarios con prompts largos y reutilizados: la ventana de servicio de 16384 tokens junto con prefix caching favorece cargas con prefijos compartidos (por ejemplo, instrucciones de sistema repetidas).
- Entornos con restricciones de telemetria: la configuracion desactiva el envio de estadisticas de uso, adecuada para despliegues con requisitos de privacidad estrictos.
- Despliegue en contenedor dentro de infraestructura propia: el `Dockerfile` y los scripts permiten reconstruir la imagen y ejecutarla con acceso a GPU mediante `--gpus all --ipc=host`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad del modelo (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico benchmark documentado es de rendimiento de servicio con `vllm bench serve`, sobre una H100-80GB con vLLM v0.24.0:

| Metrica | Baseline | Optimizado |
|---|---|---|
| Output tok/s | 364 | 453 |
| TTFT mediano (s) | 14,6 | 11,4 |
| TPOT mediano (ms) | 169 | 127 |
| ITL medio (ms) | 65 | 51 |
| Request waiting (media) | 35,1 | 35,2 |

Metodologia declarada: dataset `random` sintetico con ratio de rango 0,8; entrada de 409 a 3.686 tokens (nominal 2.048, uniforme); salida de 51 a 460 tokens (nominal 256, uniforme); 200 prompts medidos y 10 de calentamiento descartados; tasa de peticiones sin limite (`inf`); concurrencia maxima 16. Mejora reportada: +24,5 % en tokens de salida por segundo y ~20 % menos de coste por token respecto a la configuracion baseline.

Configuracion baseline: `vllm serve openai/gpt-oss-120b --tensor-parallel-size 1 --max-model-len 16384`. Configuracion optimizada: `--trust-remote-code --gpu-memory-utilization 0.92 --max-num-batched-tokens 32768 --max-num-seqs 128 --watermark 0.01 --block-size 16 --attention-backend FLASH_ATTN --enable-prefix-caching --performance-mode throughput --async-scheduling --enable-chunked-prefill --max-model-len 16384`, con `VLLM_FLOAT32_MATMUL_PRECISION=medium`.

## Requisitos de hardware

- GPU: la informacion proporcionada solo documenta 1x NVIDIA H100-80GB. No se indican alternativas probadas.
- VRAM: no se publica un minimo explicito. Con `--gpu-memory-utilization 0.92` sobre 80 GB, la configuracion reserva aproximadamente 73,6 GB de la memoria de la GPU (calculo derivado de los datos aportados).
- GPU de consumo: no disponible. La receta no documenta si el modelo cabe en GPU de consumo ni en cuales.
- Paralelismo: tensor-parallel 1, es decir, una sola GPU en las pruebas realizadas.
- Framework de despliegue: vLLM v0.24.0 sobre la imagen `vllm/vllm-openai:v0.24.0`. No se documentan otras opciones (llama.cpp, Ollama, TGI, TensorRT-LLM).
- Throughput y latencia medidos en la configuracion optimizada: 453 tok/s de salida, TTFT mediano 11,4 s, TPOT mediano 127 ms e ITL medio 51 ms, con concurrencia 16 y 200 peticiones medidas.
- Almacenamiento: los pesos se descargan y se cachean en `~/.cache/huggingface` (volumen montado en el ejemplo de ejecucion), por lo que se requiere espacio en disco suficiente para el checkpoint completo; el tamano exacto no se especifica en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros modelos. La unica comparacion documentada es entre dos configuraciones de servicio del mismo modelo:

| Aspecto | Baseline | Optimizado |
|---|---|---|
| Modelo servido | openai/gpt-oss-120b | openai/gpt-oss-120b |
| Longitud de contexto configurada | 16 384 tokens | 16 384 tokens |
| Paralelismo | tensor-parallel 1 | tensor-parallel 1 |
| Prefix caching | no | si |
| Chunked prefill | no | si |
| Async scheduling | no | si |
| Backend de atencion | por defecto | FLASH_ATTN |
| Output tok/s | 364 | 453 |
| TTFT mediano (s) | 14,6 | 11,4 |
| TPOT mediano (ms) | 169 | 127 |

## Limitaciones y advertencias

- El repositorio no contiene pesos: es una receta de despliegue. Cualquier uso implica descargar el checkpoint desde `openai/gpt-oss-120b`, por lo que las condiciones del modelo upstream son las que realmente aplican.
- La licencia declarada es MIT, pero la propia model card incluye un TODO sin resolver para anadir el valor de licencia del modelo upstream. Existe riesgo de inconsistencia entre la licencia del repositorio y la del modelo servido; debe verificarse antes de un uso comercial.
- Cero descargas y cero likes: la receta no tiene validacion independiente por parte de la comunidad.
- El benchmark se ha ejecutado en un unico hardware (1x H100-80GB), con una unica version de vLLM (v0.24.0) y con un dataset sintetico aleatorio, no con cargas reales. Los resultados no son extrapolables directamente a otros modelos de GPU ni a otros patrones de trafico.
- La metrica "Request waiting (media)" apenas varia entre configuraciones (35,1 frente a 35,2), lo que sugiere que la mejora no proviene de reducir la cola de espera.
- No se aportan evaluaciones de calidad, sesgos, tasas de alucinacion ni comportamiento multilingue.
- No se documentan limitaciones de contexto del modelo subyacente mas alla del limite de 16 384 tokens impuesto por la configuracion de servicio; configurar una ventana mayor requeriria mas memoria y no esta probado en esta receta.
- El uso de `--trust-remote-code` implica ejecutar codigo remoto del repositorio upstream; conviene revisarlo en entornos sensibles.
- La desactivacion de telemetria (`VLLM_NO_USAGE_STATS=1`, `VLLM_DO_NOT_TRACK=1`) y de las estadisticas de uso puede complicar el diagnostico y la monitorizacion en produccion.
- Las fechas de creacion y actualizacion del repositorio (septiembre de 2026) son posteriores a la mayoria de versiones de referencia conocidas; conviene comprobar la coherencia temporal de la informacion antes de tomarla como definitiva.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/neural-nova/gpt-oss-120b-Instruct-Optimized
- Modelo upstream servido: https://huggingface.co/openai/gpt-oss-120b
- Benchmark de origen citado por el autor: https://www.neural-nova.com/benchmark/gpt-oss-120b
