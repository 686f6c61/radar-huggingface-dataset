# Eureka-COM/MistralMosaic-24B-v2-GGUF

## Resumen

MistralMosaic-24B-v2-GGUF es la distribucion en formato GGUF del modelo MistralMosaic-24B-v2, desarrollado por Eureka-COM. Se trata de un modelo de generacion de texto de arquitectura propietaria denominada `mistral-mosaic`, que incorpora un mecanismo de "memoria larga" (long memory) y "memoria de cluster" (cluster memory) orientado a la investigacion en gestion de contexto. El repositorio GGUF incluye cuatro cuantizaciones (Q8_0, Q6_K, Q4_K_M y Q3_K_M) generadas con una importance matrix (imatrix) calculada sobre articulos de Wikipedia en ingles y japones.

La relevancia de esta publicacion es doble. Por un lado, ofrece pesos cuantizados para llama.cpp de un modelo de aproximadamente 31.145 millones de parametros (pese al "24B" del nombre), con mediciones detalladas de perdida por token, coincidencia de top-1 y velocidad en una RTX 5090. Por otro, advierte de una limitacion critica: la arquitectura `mistral-mosaic` no existe en el llama.cpp upstream, por lo que es necesario aplicar un parche (`patch/mistral-mosaic.patch`) sobre un commit concreto (`patch/BASE`) y compilar llama.cpp manualmente.

El modelo esta pensado para investigacion (tag `research`), es un modelo base (no instruct) y solo declara soporte para ingles y japones. Su licencia es Apache-2.0. El consumo de memoria de la memoria larga es notable: aproximadamente 0,78 MiB por token de contexto, lo que condiciona fuertemente el despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `mistral-mosaic` (transformer con memoria larga y memoria de cluster; parche propio de llama.cpp) |
| Parametros totales | 31.145.308.800 (segun safetensors del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como maximo declarado; en pruebas se uso `-c 8192` y llama.cpp eligio 14.848 tokens por defecto; consumo de ~0,78 MiB por token de contexto |
| Tipos de cuantizacion | Q8_0, Q6_K, Q4_K_M, Q3_K_M (publicadas); IQ2_M e IQ3_M medidas pero no publicadas |
| Idiomas soportados | en, ja |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento

La arquitectura se denomina `mistral-mosaic` y no forma parte del llama.cpp upstream: requiere aplicar `patch/mistral-mosaic.patch` sobre el commit indicado en `patch/BASE`. El modelo incorpora dos mecanismos diferenciados: una "memoria larga" (long memory) que consume aproximadamente 0,78 MiB por token de contexto, y una "memoria de cluster" que permite procesar varios documentos por secuencia mediante la funcion C `llama_memory_mosaic_set_doc_starts` y la variable de entorno `LLAMA_MOSAIC_CLUSTER=1`. Los valores de la memoria larga miran un token hacia delante, por lo que una secuencia no puede recortarse a una posicion anterior.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; la model card remite a la pagina del modelo base para esos datos. La cuantizacion se genero con una importance matrix (`imatrix.gguf`) calculada sobre 128 fragmentos de 512 tokens de articulos de Wikipedia en ingles y japones no incluidos en el conjunto de evaluacion. El port a llama.cpp se valido comparando un modelo aleatorio pequeno en F32 contra la implementacion de referencia: diferencia maxima de logits de 3,28e-06 sin flash attention y 2,83e-03 con flash attention (claves y valores en F16). Para el modelo de 24B en F16 GGUF, la diferencia maxima de log-probabilidad respecto a la referencia bf16 fue de 0,0728.

## Capacidades

- Generacion de texto autoregresiva (modelo base, no ajustado para instrucciones ni chat).
- Procesamiento de contexto largo mediante el mecanismo de memoria larga, con coste de memoria proporcional al contexto.
- Procesamiento de multiples documentos por secuencia mediante la memoria de cluster (solo via API C y variable de entorno, probado unicamente en el modelo aleatorio pequeno).
- Soporte bilingue declarado: ingles y japones.
- Compatibilidad con llama.cpp (previa aplicacion del parche) y con endpoints compatibles (tag `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Investigacion sobre mecanismos de memoria en modelos de lenguaje: el modelo expone una memoria larga y una memoria de cluster medibles, lo que permite experimentar con recuperacion de informacion en contextos extensos y comparar el comportamiento frente a transformers estandar.
- Evaluacion de cuantizacion GGUF: el repositorio publica perdida por token, coincidencia de top-1 y diferencias de log-probabilidad para cuatro cuantizaciones, lo que sirve como caso de estudio reproducible de impacto de cuantizacion con imatrix.
- Procesamiento de documentos largos en ingles o japones: con `-c 8192` y Q4_K_M en una GPU de 32 GB se obtuvieron 57,8 tokens/s, adecuado para tareas de continuacion y analisis de textos extensos en esos idiomas.
- Generacion de texto base para experimentos de decoding: al ser un modelo base, encaja en pipelines de investigacion que necesitan logits y probabilidades por token (comparacion de decodificacion greedy, calculo de perplejidad, etc.).
- Corpus bilingue en/ja: util para tareas de continuacion de texto, resumen extractivo o generacion de articulos en ingles y japones sin necesidad de ajuste fino.
- Entorno de laboratorio con llama.cpp parcheado: permite validar integraciones de nuevas arquitecturas en llama.cpp y medir latencia y throughput en hardware consumer (RTX 5090) antes de llevar el modelo a produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card incluye metricas de fidelidad de cuantizacion y velocidad:

| Fichero | Tamano | Perdida por token (cambio vs bf16) | Mismo top-1 que bf16 (20 prompts) | Mayor diferencia de log-probabilidad | Velocidad en RTX 5090 (tokens/s) |
|---|---|---|---|---|---|
| Q8_0 | 33,1 GB | +0,0004 | 99,1% | 0,103 | 2,7 (28 de 40 capas en GPU) |
| Q6_K | 25,6 GB | +0,0011 | 98,1% | 0,184 | 9,9 (36 de 40 capas en GPU) |
| Q4_K_M | 18,7 GB | +0,0127 | 95,9% | 0,456 | 54,1 (todas las capas en GPU) |
| Q3_K_M | 14,8 GB | +0,0482 | 92,8% | 1,931 | 58,6 (todas las capas en GPU) |

Referencia: la perdida por token del modelo bf16 en los mismos articulos es 1,8243; el modelo 4-bit de bitsandbytes cambia la perdida en +0,0417 y el 8-bit en +0,0090. Las versiones IQ2_M e IQ3_M, no publicadas, cambiaron la perdida en +0,4264 y +0,0583 respectivamente. Con Q4_K_M, `-c 8192 -ngl 99` genero 57,8 tokens/s en una GPU de 32 GB; sin `-c`, llama.cpp eligio 14.848 tokens de contexto y genero 0,87 tokens/s.

## Requisitos de hardware

- VRAM estimada: Q8_0 requiere unos 33,1 GB solo para pesos; Q6_K unos 25,6 GB; Q4_K_M unos 18,7 GB; Q3_K_M unos 14,8 GB. A esto hay que sumar aproximadamente 0,78 MiB por token de contexto para la memoria larga.
- GPU recomendadas: RTX 5090 (probada por el autor, con CUDA 12.8 en Linux/WSL2); GPU de 32 GB o mas para Q4_K_M con contexto de 8192 y todas las capas en GPU.
- Cabe en GPU consumer: Q4_K_M y Q3_K_M con todas las capas en GPU en una RTX 5090; Q8_0 y Q6_K requieren descargar parte de las capas a CPU en esa misma GPU (28 y 36 de 40 capas respectivamente).
- Opciones de despliegue: llama.cpp compilado con `patch/mistral-mosaic.patch` sobre el commit `patch/BASE`; `llama-completion` probado; `llama-cli` y `llama-server` compilados pero no probados. Otros backends (Metal, Vulkan, ROCm) y sistemas operativos no fueron probados.
- Latencia y throughput: 57,8 tokens/s con Q4_K_M, contexto 8192 y todas las capas en GPU; 54,1 tokens/s con Q3_K_M; 2,7 tokens/s con Q8_0 y 9,9 tokens/s con Q6_K por el reparto parcial de capas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento (benchmarks estandar) del modelo base en la informacion proporcionada, por lo que no es posible comparar capacidad. La comparativa se limita a aspectos estructurales y de despliegue:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas de despliegue |
|---|---|---|---|---|---|
| MistralMosaic-24B-v2-GGUF | 31,1B | no disponible (consumo ~0,78 MiB/token) | Apache-2.0 | GGUF | Requiere llama.cpp parcheado; solo en/ja |
| MistralMosaic-24B-v2 (base) | 31,1B | no disponible | Apache-2.0 | safetensors | Implementacion de referencia propia |
| MistralMosaic-24B-v2-4bit | 31,1B | no disponible | Apache-2.0 | bitsandbytes 4-bit | 18,3 GB en GPU; perdida +0,0417 |
| MistralMosaic-24B-v2-8bit | 31,1B | no disponible | Apache-2.0 | bitsandbytes 8-bit | 33,2 GB en GPU; perdida +0,0090 |

No se han identificado en la informacion disponible modelos de terceros comparables en tamano, contexto y tarea con datos de rendimiento publicados.

## Limitaciones y advertencias

- El llama.cpp upstream no puede cargar estos ficheros: es obligatorio aplicar el parche y compilar sobre el commit `patch/BASE`. Otros commits, backends y sistemas operativos no han sido probados.
- El modelo es base, no instruct: con `llama-completion` es necesario usar `-no-cnv` para evitar que espere entrada de chat.
- La memoria larga consume aproximadamente 0,78 MiB por token de contexto; contextos largos requieren mucha memoria y degradan la velocidad (0,87 tokens/s con contexto de 14.848 tokens en la prueba del autor).
- Los valores de la memoria larga miran un token hacia delante, por lo que no se puede recortar una secuencia a una posicion anterior; un servidor que reutilice prefijos en cache debe releer todo el prompt. No se soporta context shifting.
- La memoria de cluster (varios documentos por secuencia) solo se probo en el modelo aleatorio pequeno, no en este modelo de 24B.
- El efecto de la cuantizacion sobre la memoria de cluster no se midio (todas las mediciones usan un solo documento).
- Solo se declaran idiomas ingles y japones; no hay soporte documentado de castellano.
- Riesgo de alucinacion y sesgos: no se documentan evaluaciones de sesgo ni de fidelidad factual; al ser un modelo base, la generacion no esta alineada.
- Licencia Apache-2.0 permite uso comercial, pero el parche modifica llama.cpp (MIT); el fichero `patch/LICENSE` corresponde a la licencia de llama.cpp.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validacion externa practicamente inexistentes.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/Eureka-COM/MistralMosaic-24B-v2-GGUF
- Modelo base: https://huggingface.co/Eureka-COM/MistralMosaic-24B-v2
- Version 4-bit: https://huggingface.co/Eureka-COM/MistralMosaic-24B-v2-4bit
- README en japones: README_ja.md (en el repositorio de Hugging Face)
- Parche de llama.cpp: `patch/mistral-mosaic.patch` y commit base `patch/BASE` (en el repositorio de Hugging Face)
- Evidencias de mediciones: `evidence.json` (en el repositorio de Hugging Face)
- llama.cpp: https://github.com/ggml-org/llama.cpp
