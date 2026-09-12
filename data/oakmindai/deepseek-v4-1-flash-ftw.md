# oakmindai/DeepSeek-V4.1-Flash-FTW

## Resumen

DeepSeek-V4.1-Flash-FTW es un espejo byte a byte del checkpoint `deepseek-ai/DeepSeek-V4.1-Flash` en la revision `df42c109f1defefcbfcedbe7d905718a12266e40`, publicado por oakmindai para la ruta de investigacion nativa de NVIDIA DGX Spark del runtime SparkLab. No se ha realizado ningun entrenamiento, conversion de tensores ni cuantizacion adicional: los tensores conservan la representacion mixta original de DeepSeek, con expertos enrutados en MXFP4, proyecciones densas en MXFP8 con escalas UE8M0 y embeddings junto con la cabeza de salida en BF16.

El modelo es un transformer de tipo Mixture of Experts (MoE) con 763.205.315.794 parametros totales y un tamano de repositorio de 510,3 GB. Su relevancia actual no reside en una mejora de calidad, sino en demostrar ejecucion disk-backed de un modelo de ~763B en una unica GPU de 128 GB (NVIDIA GB10), usando una cache LRU de expertos empaquetados de 64 GiB y una cache de pesos limitada de 24 GiB, con el resto del checkpoint leido desde NVMe local.

El alcance validado es deliberadamente estrecho: solo texto, TP=1, ejecucion eager con batch uno y una ventana total de 2.048 tokens. El perfil objetivo puro midio 0,969 tokens/s de decodificacion y 74,387 s de TTFT en caliente sobre una sonda greedy fija de 74 tokens de entrada y 128 de salida; el perfil opcional con decodificacion especulativa DSpark-5 alcanzo 1,053 tokens/s (mejora del 8,6%) con 76,329 s de TTFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture of Experts (MoE); expertos enrutados MXFP4 y proyecciones densas MXFP8 (detalle completo no disponible) |
| Parametros totales | 763.205.315.794 |
| Parametros activos | no disponible |
| Longitud de contexto | 2.048 tokens en el alcance validado por SparkLab; contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | MXFP4 (expertos enrutados), MXFP8 con escalas UE8M0 (proyecciones densas), BF16 (embeddings y cabeza de salida); el runtime invoca `--dtype bfloat16` |
| Idiomas soportados | no disponible |
| Licencia | MIT (heredada del modelo upstream) |
| Formato de pesos | safetensors (representacion mixta MXFP4/MXFP8/BF16) |
| Tamano del repositorio | 510,3 GB (aproximadamente 480 GiB) |
| Libreria | sparklab |
| Modelo base | deepseek-ai/DeepSeek-V4.1-Flash (revision df42c109f1defefcbfcedbe7d905718a12266e40) |
| Pipeline | text-generation |
| Fecha de publicacion | 2026-09-12 |

## Arquitectura y entrenamiento

Se trata de una arquitectura transformer con enrutamiento Mixture of Experts: la model card describe expertos enrutados almacenados en MXFP4 y proyecciones densas en MXFP8 con escalas UE8M0, mientras que los embeddings y la cabeza de salida permanecen en BF16. Esta mezcla de precisiones es la representacion nativa del checkpoint de DeepSeek y se preserva sin modificaciones en el espejo. El repositorio no aporta informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si hubo RLHF, DPO u otras etapas de alineamiento; esos datos corresponden al modelo upstream y no estan disponibles en la informacion proporcionada.

La innovacion tecnica relevante en este repositorio no es arquitectonica, sino de ejecucion. SparkLab implementa un lector de safetensors propiedad del modelo y una cache de expertos empaquetados que permite ejecutar el checkpoint con memoria de GPU acotada: 64 GiB de cache LRU de expertos, 24 GiB de cache de pesos y lectura del resto desde NVMe local. Sobre esa base se integra DSpark, una ruta de decodificacion especulativa que en la version actual de SparkLab usa drafting greedy y commits exactos de estado sobre el prefijo aceptado; el muestreo probabilistico y la verificacion adaptativa que emplea la receta upstream de vLLM quedan fuera del alcance implementado. Las pruebas con DSpark reprodujeron el mismo hash de salida que la ejecucion objetivo puro.

## Capacidades

- Generacion de texto autoregresiva mediante el endpoint compatible con OpenAI `v1/chat/completions`.
- Razonamiento y respuesta a consultas de conocimiento general (la sonda documentada usa una operacion aritmetica simple: `17*19`).
- Decodificacion especulativa opcional mediante DSpark con 5 tokens de borrador y muestreo greedy, con paridad de hash respecto a la salida objetivo.
- Ejecucion disk-backed en una unica GPU de 128 GB, con carga de expertos bajo demanda desde NVMe.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio, contexto largo): no disponible en la informacion proporcionada; el alcance validado se limita a texto y 2.048 tokens.

## Casos de uso

- Investigacion sobre ejecucion disk-backed de modelos masivos: el checkpoint permite estudiar como se comporta un MoE de ~763B cuando solo una fraccion de los pesos cabe en VRAM, usando la cache LRU de expertos de 64 GiB y la lectura desde NVMe como variables de estudio.
- Validacion de decodificacion especulativa en hardware limitado: comparar el perfil objetivo puro (0,969 tokens/s) con el perfil DSpark-5 (1,053 tokens/s) sobre la misma sonda fija para medir la ganancia real del drafting greedy sin verificacion adaptativa.
- Desarrollo y depuracion del runtime SparkLab: el repositorio sirve como banco de pruebas reproducible para el lector de safetensors con precisiones mixtas MXFP4/MXFP8 y para los kernels directos de expertos empaquetados.
- Reproducibilidad de artefactos de investigacion: al ser un espejo byte a byte de una revision concreta, permite fijar el hash del checkpoint y verificar que dos ejecuciones producen la misma salida, algo util en publicaciones que requieren trazabilidad de pesos.
- Generacion de texto en lote uno para evaluaciones cualitativas: con `temperature: 0` y `max_tokens` cortos se pueden lanzar sondas deterministas de razonamiento aritmetico o de formato de respuesta sin necesidad de infraestructura multi-GPU.
- Estudio del compromiso memoria-latencia en MoE: ajustar el tamano de la cache de expertos y medir el impacto en TTFT (74,387 s en la configuracion documentada) y en el throughput de decodificacion.
- Pruebas de integracion con clientes compatibles con la API de OpenAI: el servidor expone `v1/chat/completions`, de modo que se puede conectar tooling existente para validar flujos de peticion/respuesta contra un modelo de esta escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos de rendimiento documentados son mediciones de sistema sobre una sonda greedy fija de 74 tokens de entrada y 128 de salida, en una NVIDIA GB10 de 128 GB con TP=1 y batch uno:

| Metrica | Perfil objetivo puro | Perfil DSpark-5 |
|---|---|---|
| Tokens/s de decodificacion | 0,969 | 1,053 |
| TTFT en caliente (s) | 74,387 | 76,329 |
| Mejora de decodificacion | referencia | +8,6% |
| Paridad de hash con la salida objetivo | si | si |

El autor advierte explicitamente que estas cifras son mediciones estrechas de rendimiento y no constituyen una certificacion de calidad general, concurrencia, contexto largo o resistencia sostenida.

## Requisitos de hardware

- VRAM recomendada: 128 GB (NVIDIA GB10) como plataforma validada. El diseno asume memoria de GPU insuficiente para el checkpoint completo y delega el resto en disco.
- Memoria de GPU reservada por el runtime: 64 GiB de cache LRU de expertos empaquetados mas 24 GiB de cache de pesos, configurables mediante `SPARKLAB_DSV41_EXPERT_CACHE_GB`.
- Almacenamiento: aproximadamente 480 GiB de NVMe local, con lectura continua durante la inferencia; el repositorio ocupa 510,3 GB.
- GPU compatibles: unicamente se documenta NVIDIA GB10 con 128 GB. No hay datos disponibles sobre A100, H100, RTX 4090 u otras GPU.
- Viabilidad en GPU de consumo: no disponible; el checkpoint de ~763B en MXFP4/MXFP8 no cabe en VRAM de consumo y el runtime validado depende de una GPU de 128 GB con NVMe.
- Opciones de despliegue: SparkLab (servidor integrado, `sparklab serve`) con backend de atencion Triton, backend MoE fusionado, `--cache-type naive` y `--cuda-graph-max-bs 0`. Existe una receta de arquitectura para vLLM publicada por el equipo de vLLM, pero no se detalla su configuracion en la informacion disponible. No hay soporte documentado para llama.cpp, Ollama ni TGI.
- Paralelismo: TP=1 exclusivamente en el alcance validado.
- Latencia y throughput medidos: 0,969-1,053 tokens/s de decodificacion y 74-76 s de TTFT en caliente sobre la sonda fija; no hay datos de concurrencia (limitado a `--max-running-requests 1`).

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-FTW (este repositorio) | 763.205.315.794 | 2.048 tokens en el alcance validado (nativo no disponible) | MIT | HuggingFace, runtime SparkLab | 0,969-1,053 tokens/s en GB10, TTFT 74-76 s |
| deepseek-ai/DeepSeek-V4.1-Flash (upstream) | no disponible | no disponible | MIT | HuggingFace | no disponible |
| Alternativas comparables de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye datos de otros modelos de tamano o tarea similar, por lo que no es posible establecer una comparativa cuantitativa con alternativas. Este repositorio es, en la practica, identico en pesos al checkpoint upstream; la diferencia es el empaquetado para el runtime SparkLab y las mediciones de ejecucion asociadas.

## Limitaciones y advertencias

- Alcance validado muy restringido: solo texto, TP=1, batch uno y 2.048 tokens de contexto total. No hay certificacion de concurrencia, contexto largo ni ejecucion sostenida.
- Rendimiento muy bajo en terminos absolutos: por debajo de 1,1 tokens/s de decodificacion y mas de 74 s de TTFT en caliente, lo que descarta uso interactivo en el perfil documentado.
- Dependencia critica de NVMe local: el checkpoint no cabe en memoria de GPU y la inferencia requiere lectura continua desde disco.
- Cobertura incompleta de la decodificacion especulativa upstream: SparkLab solo implementa drafting greedy y commits exactos de prefijo; el muestreo probabilistico y la verificacion adaptativa de vLLM quedan fuera de alcance, de modo que los resultados no son extrapolables a la receta upstream.
- La etiqueta de despliegue `FTW` no implica que se use el formato de contenedor generico FTW: la ejecucion pasa por el lector de safetensors propio del modelo y la cache de expertos empaquetados.
- Idiomas soportados no documentados: no se puede garantizar cobertura multilingue ni calidad en lenguas distintas del ingles.
- Riesgo de alucinacion: no evaluado en la informacion disponible; la sonda documentada es una operacion aritmetica trivial y no permite inferir fiabilidad factual.
- Sesgos conocidos: no disponible.
- Tool calling y capacidades de agente: no documentadas; no deben asumirse en produccion.
- Licencia MIT heredada del upstream, sin restricciones adicionales indicadas, pero el aviso de espejo no sustituye a la revision de los terminos del modelo original.
- Publicado por un tercero (oakmindai), no por DeepSeek AI; la validacion de integridad del espejo byte a byte corresponde al usuario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oakmindai/DeepSeek-V4.1-Flash-FTW
- Modelo upstream: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Revision exacta del upstream: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/tree/df42c109f1defefcbfcedbe7d905718a12266e40
- Repositorio SparkLab: https://github.com/sixteen-miles-labs/sparklab
- Receta de arquitectura vLLM: https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4.1-Flash
