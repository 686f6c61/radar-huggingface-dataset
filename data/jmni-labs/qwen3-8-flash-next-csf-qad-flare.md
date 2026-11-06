# JMNI-Labs/Qwen3.8-Flash-Next-CSF-QAD-FLARE

## Resumen

Qwen3.8-Flash-Next-CSF-QAD-FLARE es un paquete de despliegue preparado por JMNI-Labs para servir el modelo `local-inference-lab/Qwen3.8-Flash-Next-NVFP4-MXFP8-CSF-QAD` en configuracion tensor-parallel de dos nodos (TP2) sobre dos DGX Sparks (GB10, SM121). No es un modelo entrenado desde cero, sino una revision empaquetada del modelo base con pesos cuantizados en NVFP4 (expertos enrutados) y MXFP8 (attention y proyecciones de expertos compartidos), junto con el modulo MTP (multi-token prediction) y el codificador de vision.

El paquete esta disenado exclusivamente para el runtime Flare de NVIDIA (spark-local-inference) y no puede cargarse con Transformers, vLLM, SGLang ni llama.cpp. Su relevancia radica en que habilita inferencia de un modelo multimodal de gran contexto (262.144 tokens) repartido entre dos estaciones GB10 conectadas por ConnectX-7 RoCE, con decodificacion especulativa MTP y grafo CUDA capturado para 32 peticiones concurrentes.

El repositorio ocupa 111,9 GB y se distribuye bajo licencia `lil-license-1.0` (licencia propia del autor, marcada como "other" en Hugging Face). La model card reporta cifras de rendimiento medidas en dos ASUS GX10, incluyendo un 91,4 % en GPQA Diamond.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con expertos enrutados estilo MoE, modulo MTP y vision; empaquetado para tensor-parallel TP2 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (la model card menciona "routed experts" y "shared-expert projections", pero no publica recuento) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 (expertos enrutados), MXFP8 (attention y proyecciones de expertos compartidos) |
| Idiomas soportados | no disponible |
| Licencia | lil-license-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | Paquete en formato directorio para Flare (no safetensors estandar, no GGUF); incluye kernels CUDA compilados y grafos capturados |

## Arquitectura y entrenamiento

La model card no documenta el proceso de entrenamiento del modelo base: no se indica numero de tokens, composicion del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento. Lo que si se detalla es la composicion del paquete de inferencia: expertos enrutados en NVFP4, proyecciones de attention y de expertos compartidos en MXFP8, un modulo MTP (multi-token prediction) que actua como borrador especulativo de hasta 5 drafts, codificador de vision, kernels CUDA compilados y grafos capturados para 32 peticiones concurrentes.

La innovacion tecnica destacable es el despliegue TP2 sobre GB10: cada rango mantiene aproximadamente 71 GiB de pesos, grafos y una tabla n-gram de 26,8 GiB en RAM, y el resto de la memoria unificada se destina a cache KV. La cache KV se dimensiona al arranque segun memoria libre (unos 35,7 GiB por Spark con build estandar de Flare, equivalentes a 4,8M tokens; 41,6 GiB y 5,7M tokens con el parche opcional `host-system-reserve`). El prefill se procesa en fragmentos de 4.096 tokens. La decodificacion especulativa recomendada es de 3 drafts MTP con verificacion de ancho fijo (`--mtp-draft-tokens 3 --no-mtp-adaptive-verification`); la verificacion adaptativa por defecto fue descartada tras pruebas A/B con semilla fija.

## Capacidades

- Generacion de texto y razonamiento de nivel alto: la model card reporta 91,4 % en GPQA Diamond, un benchmark de preguntas cientificas de nivel posgrado.
- Entrada multimodal image-text-to-text: el paquete incluye el modulo de vision del modelo base.
- Modo thinking configurable: se puede desactivar mediante `"chat_template_kwargs": {"enable_thinking": false}` en la API compatible con OpenAI.
- Decodificacion especulativa MTP con hasta 5 drafts y verificacion de ancho fijo.
- Servicio concurrente: grafos capturados para 32 peticiones simultaneas y tabla n-gram para decodificacion especulativa basada en n-gramas.
- Contexto largo de 262.144 tokens, con rendimiento medido hasta 128K en decodificacion concurrente.
- API compatible con OpenAI (`/v1/chat/completions`), lo que facilita la integracion con clientes existentes.
- Soporte de tool calling y de agentes multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Razonamiento cientifico y tecnico asistido: el modelo alcanza 91,4 % en GPQA Diamond, por lo que resulta adecuado para responder consultas de fisica, quimica y biologia de nivel avanzado con verificacion humana posterior.
- Analisis de documentos largos con imagen: con 262.144 tokens de contexto y entrada image-text-to-text, puede procesar informes extensos, articulos con figuras o expedientes completos en una sola peticion sin trocear.
- Generacion de codigo en produccion: la model card reporta 85,3 tok/s en C1 y 209,7 tok/s agregados en C4 para generacion de 1.024 tokens a temperatura 0,7, lo que lo hace viable para asistentes de codigo con varios usuarios concurrentes.
- Servicio de chat multiusuario: los grafos capturados para 32 peticiones y las cifras de throughput agregado (436,9 tok/s en C32 a contexto 8K) permiten atender equipos pequenos o medianos desde un solo par de estaciones.
- Procesamiento por lotes de contexto largo: con prefill de aproximadamente 3.300 tok/s a 128K, se pueden ingerir documentos muy largos para resumen, extraccion de entidades o clasificacion en pipelines offline.
- Despliegue en laboratorio o entorno de investigacion con hardware propio: al ejecutarse sobre dos DGX Sparks o GB10 equivalentes, encaja en equipos que ya dispongan de estas estaciones y quieran evitar costes de nube.
- Evaluacion comparativa de tecnicas de cuantizacion: el paquete combina NVFP4 y MXFP8 en distintas partes de la red, por lo que sirve como banco de pruebas para medir el impacto de la cuantizacion mixta en calidad y velocidad.

## Benchmarks y rendimiento

Resultados publicados en la model card (Local Inference Lab `llm-inference-bench` 0.8.0, temperatura 1, 512 tokens de salida, celdas de 30 s, tok/s agregados de salida, dos ASUS GX10 con cables CX7 directos y techo de GPU a 2350 MHz):

| Contexto | C1 | C2 | C4 | C8 | C16 | C32 |
|---|---:|---:|---:|---:|---:|---:|
| 8K | 67,9 | 100,8 | 161,8 | 232,6 | 331,5 | 436,9 |
| 32K | 64,4 | 105,4 | 158,1 | 226,9 | 333,4 | 429,8 |

| Metrica | Resultado |
|---|---:|
| Prefill 8K / 32K / 128K | 3.242 / 3.388 / 3.314 tok/s |
| Pico de codificacion LIL (peticion unica) | mediana 78,2; maximo 86,5 tok/s |
| Codificacion, 1.024 tokens, temp 0,7, C1 / C4 agregado | 85,3 / 209,7 tok/s |
| Decodificacion C16 a 64K / 128K de contexto | 316,3 / 300,7 tok/s |
| GPQA Diamond (LIL 0.7.6, C16, temp 1, top-p 0,95) | 91,4 % ± 1,9 (181/198, una ejecucion, error estandar, sin truncamientos) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- Dos DGX Sparks o equivalentes GB10 (SM121) con DGX OS / Ubuntu 24.04, drivers NVIDIA funcionales y ConnectX-7 RoCEv2 entre ambos hosts (GID IPv4).
- Runtime Flare obligatorio: paquete APT `flare-inference` `0.1.0~git20261030013211.a161b17f-1` o superior, o build desde fuente de `spark-local-inference` `6fa01a49` o posterior, con la misma version en ambos hosts.
- Espacio en disco: aproximadamente 110 GB libres en el primer Spark; el segundo recibe unos 66 GB de payload por la fabrica en el primer arranque.
- Memoria: cada rango ocupa unos 71 GiB de pesos, grafos y tabla n-gram de 26,8 GiB en RAM; el resto de la memoria unificada se convierte en cache KV. Con `--embedding-table-storage disk` se libera la RAM de la tabla a costa de velocidad de decodificacion.
- Cache KV: unos 35,7 GiB por Spark con Flare estandar (4,8M tokens, ~114 GiB usados por Spark); 41,6 GiB (5,7M tokens, ~120 GiB usados) con el parche `host-system-reserve` y `FLARE_HOST_SYSTEM_RESERVE=512M`.
- Puertos: TCP 29800 en el primer Spark para el rendezvous y TCP 8000 para clientes.
- No es compatible con vLLM, llama.cpp, Ollama, TGI, SGLang ni Transformers: requiere Flare.
- No cabe en GPU de consumo convencional (RTX 4090, etc.); el diseno esta pensado para GB10 con memoria unificada.
- Latencia y throughput: ver tabla de benchmarks (67,9 tok/s en C1 a 8K, 436,9 tok/s agregados en C32 a 8K).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-CSF-QAD-FLARE (este) | no disponible | 262.144 | Flare TP2 en 2x GB10 | lil-license-1.0 | GPQA Diamond 91,4 %; multimodal; sin soporte en vLLM/llama.cpp |
| local-inference-lab/Qwen3.8-Flash-Next-FLARE | no disponible | no disponible | Flare mononodo | no disponible | Version oficial single-GPU del mismo modelo base |
| local-inference-lab/Qwen3.8-Flash-Next-NVFP4-MXFP8-CSF-QAD | no disponible | no disponible | Depende del runtime | no disponible | Modelo base del que deriva este paquete |
| Alternativas de otros fabricantes | no disponible | no disponible | no disponible | no disponible | No hay datos de benchmarks comparables en la informacion proporcionada |

## Limitaciones y advertencias

- El paquete solo funciona con Flare: no se puede cargar con Transformers, vLLM, SGLang ni llama.cpp, lo que limita la portabilidad y obliga a usar el stack de NVIDIA.
- La licencia `lil-license-1.0` esta marcada como "other" y el enlace apunta al modelo base; es imprescindible revisar sus terminos antes de cualquier uso comercial.
- El paquete esta firmado con una clave de desarrollo local (`local-development`, huella `58cdfcd6…`), no con una clave de publicador de produccion. Los flags `--dangerously-approve-key` y `--dangerously-accept-publisher` confian permanentemente en esa clave en el host; solo deben usarse si se confia en el paquete.
- Los benchmarks provienen de una unica ejecucion (GPQA Diamond: 181/198, ±1,9 de error estandar) y de un hardware concreto (2x ASUS GX10, CX7 directo, 2350 MHz), por lo que no son extrapolables a otras configuraciones.
- El rendimiento depende de la memoria libre: la cache KV se dimensiona al arranque y cualquier otro proceso que consuma memoria unificada en los Sparks reduce el contexto efectivo.
- La verificacion adaptativa MTP (opcion por defecto de Flare) fue descartada tras pruebas A/B; se recomienda verificacion de ancho fijo con 3 drafts.
- No se documentan sesgos, riesgos de alucinacion ni cobertura idiomatica en la informacion disponible; como modelo de razonamiento cientifico, es previsible que alucine en dominios fuera de su distribucion de entrenamiento, pero no hay datos publicados al respecto.
- El arranque en frio requiere transferir el payload del rango 1 por la fabrica; los arranques posteriores tardan unos 35 segundos desde la cache.
- El parche `host-system-reserve` reduce el margen de memoria del sistema en GB10; no debe aplicarse si se ejecutan otros procesos en las estaciones.

## Enlaces

- Hugging Face: https://huggingface.co/JMNI-Labs/Qwen3.8-Flash-Next-CSF-QAD-FLARE
- Modelo base: https://huggingface.co/local-inference-lab/Qwen3.8-Flash-Next-NVFP4-MXFP8-CSF-QAD
- Licencia: https://huggingface.co/local-inference-lab/Qwen3.8-Flash-Next-NVFP4-MXFP8-CSF-QAD/blob/main/LICENSE
- Runtime Flare: https://github.com/NVIDIA/spark-local-inference
- Parche host-system-reserve: `patches/host-system-reserve.patch` (incluido en el repositorio del modelo)
