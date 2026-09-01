# pocharlies/Qwen3.8-Flash-Next-NVFP4-vLLM-DGX-Spark-k8s

## Resumen

Este repositorio no contiene pesos de modelo: es una receta de despliegue y un informe de mediciones para ejecutar el checkpoint cuantizado NVFP4 de `RadixArk/Qwen3.8-Flash-Next-NVFP4` sobre dos nodos NVIDIA DGX Spark (GB10, `sm_121`) usando vLLM en Kubernetes. El modelo subyacente, Qwen3.8-Flash-Next, es un MoE de 125B parámetros con 6B activos por token, complementado con 51B de embeddings n-gram (PLE) y un módulo de predicción multi-token (MTP) de 4B, desarrollado por QwenLM. Su arquitectura combina atención híbrida GDN + QSA y una ruta de atención sparse, lo que lo sitúa como una evolución de la familia Qwen con foco en eficiencia computacional y capacidad de razonamiento.

La relevancia de este repo radica en que documenta los problemas reales del despliegue multi-nodo en Kubernetes —como la necesidad de `--headless` en los nodos seguidores y el reciclado conjunto de ambos ranks— y proporciona benchmarks de rendimiento de inferencia con decodificación especulativa MTP-3. Es una referencia práctica para equipos que necesiten servir un modelo de ~135 GB en hardware de 256 GB con tensor parallelism y expert parallelism.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atencion hibrida GDN + QSA y ruta de atencion sparse |
| Parametros totales | 125B (MoE) + 51B n-gram PLE + 4B MTP (total no especificado univocamente) |
| Parametros activos | 6B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (punto flotante de 4 bits) |
| Idiomas soportados | en (segun model card) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (el repo no contiene pesos) |

## Arquitectura y entrenamiento

Qwen3.8-Flash-Next introduce mejoras sistematicas en atencion, residual, embedding y optimizacion. La atencion combina GDN (probablemente una variante de atencion con gate) y QSA (query-specific attention), junto con una ruta de atencion sparse que reduce el coste computacional en secuencias largas. El modelo es un MoE con 6B parametros activos de un total de 125B, y anade un modulo de embeddings n-gram de 51B que amplia la representacion del vocabulario sin incrementar los parametros activos. El modulo MTP de 4B permite decodificacion especulativa con multiples tokens por paso.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens procesados ni el uso de RLHF o DPO. El checkpoint NVFP4 de RadixArk esta validado originalmente en hardware GB300/B300; este repo verifica su funcionamiento en GB10 (`sm_121a`).

## Capacidades

- Generacion de texto y razonamiento complejo, con modo de pensamiento activable (`thinking on/off`) y parametro `reasoning_effort`.
- Generacion de codigo en varios lenguajes (los benchmarks incluyen code, csharp) con rendimiento de decodificacion superior cuando el modo de pensamiento esta desactivado.
- Razonamiento matematico y logico, con alta tasa de aceptacion de tokens en el modulo MTP para contenido formulaico.
- Decodificacion especulativa MTP-3 integrada en vLLM, que acelera la generacion sin perder calidad.
- Soporte de atencion sparse para secuencias largas (via la ruta Qwen4Exp), aunque no se especifica la longitud de contexto maxima.
- Multilingue limitado: la model card indica solo ingles, aunque la familia Qwen suele ser multilingue.

## Casos de uso

- Generacion de codigo en produccion: con `thinking off` alcanza ~60 tok/s en contenido de codigo, lo que lo hace util para autocompletado o generacion de funciones en pipelines de CI/CD, siempre que se disponga del hardware adecuado.
- Razonamiento matematico y cientifico: el modo de pensamiento con `reasoning_effort` permite resolver problemas que requieren cadenas de deduccion largas, aunque hay que controlar el presupuesto de tokens para evitar respuestas vacias.
- Asistente de programacion con contexto largo: gracias a la atencion sparse y al MTP, puede manejar archivos de codigo extensos y generar documentacion o refactorizaciones, aunque la longitud de contexto no esta publicada.
- Despliegue en entornos Kubernetes con GPU de datacenter: la receta documenta como servir el modelo en dos DGX Spark con vLLM, incluyendo la configuracion de probes, escalado y manejo de fallos multi-nodo.
- Evaluacion de rendimiento de inferencia: los benchmarks del repo permiten comparar configuraciones de despliegue (TP, EP, MTP) y medir el impacto de cambios en la latencia y el throughput.
- Investigacion en arquitecturas MoE con decodificacion especulativa: el modelo y su receta sirven como referencia para estudiar la interaccion entre MTP, atencion sparse y cuantizacion NVFP4 en hardware de memoria unificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El repo solo incluye mediciones de rendimiento de inferencia, que se resumen a continuacion (medidas con streaming, `temperature 0`, decodificacion excluyendo TTFT, mediana de 4-6 repeticiones):

| Contenido | Modo | Tokens | Finish | Aceptacion MTP | Pasos/s | Decodificacion (tok/s) | Desviacion |
|---|---|---|---|---|---|---|---|
| code | low | 4644 | length/stop | 3.569 | 15.18 | 54.2 | 3.01 |
| code | off | 2914 | stop | 3.716 | 16.35 | 60.8 | 0.25 |
| csharp | low | 3794 | stop | 3.373 | 16.49 | 55.6 | 0.41 |
| csharp | off | 2532 | stop | 3.543 | 16.57 | 58.7 | 0.48 |
| code (thinking on) | - | - | - | 2.639 | 16.6 | 43.8 | - |
| reasoning (thinking on) | - | - | - | 2.909 | 16.3 | 47.4 | - |
| math (thinking on) | - | - | - | 3.434 | 16.5 | 56.7 | - |
| csharp (thinking on) | - | - | - | 2.428 | 16.6 | 40.2 | - |

El ruido de medicion es alto: con 8 repeticiones identicas se observo un rango del 27% (37.9 a 49.6 tok/s). Un cambio de configuracion solo es creible por encima del 5% de diferencia. Los pasos por segundo son constantes (16.3-16.6) independientemente del contenido; las diferencias de throughput se deben exclusivamente a la tasa de aceptacion del MTP.

## Requisitos de hardware

- Se requiere un minimo de 2 nodos NVIDIA DGX Spark (GB10, 128 GB de memoria unificada cada uno) para un total de 256 GB, ya que los pesos NVFP4 ocupan ~135 GB.
- Tensor parallelism (TP=2) y expert parallelism, con decodificacion especulativa MTP-3 y CUDA graphs.
- No cabe en GPUs de consumo (una RTX 4090 tiene 24 GB); se necesita hardware de datacenter o estaciones DGX.
- Opciones de despliegue: vLLM (con `--distributed-executor-backend mp` y `--headless` en nodos seguidores) o SGLang (segun recetas alternativas). Tambien se puede orquestar con Kubernetes.
- Throughput medido: entre 40 y 61 tok/s segun el contenido y el modo de pensamiento, con latencia de primer token no reportada.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la informacion proporcionada. El modelo se puede clasificar junto a otros MoE grandes de ~100B+ parametros con 6B activos, como DeepSeek-V3 o Mixtral 8x22B, pero no hay benchmarks de calidad que permitan una comparacion cuantitativa. La licencia Apache 2.0 y la disponibilidad del checkpoint NVFP4 lo diferencian de alternativas con licencias mas restrictivas.

## Limitaciones y advertencias

- Con el modo de pensamiento activado y un presupuesto de 4000 tokens, el modelo puede gastar todo el presupuesto en razonamiento y devolver contenido vacio (se observo `content=0` con `finish=length`). Es necesario ajustar `reasoning_effort` o desactivar el modo para tareas de generacion directa.
- El ruido de medicion es elevado (hasta 27% de rango en repeticiones identicas); las comparaciones de rendimiento entre configuraciones requieren multiples repeticiones y un umbral de significancia del 5%.
- El checkpoint NVFP4 esta validado originalmente en GB300/B300; su funcionamiento en GB10 (`sm_121a`) se verifica en esta receta, pero puede haber diferencias de comportamiento en otros hardware.
- La model card indica solo ingles; no se garantiza soporte multilingue.
- No se han publicado benchmarks de calidad (MMLU, HumanEval, etc.), por lo que se desconoce su rendimiento relativo en tareas estandar.
- El despliegue multi-nodo en Kubernetes requiere atencion a detalles como `--headless` en nodos seguidores y el reciclado conjunto de ambos ranks para evitar cuelgues de NCCL.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/pocharlies/Qwen3.8-Flash-Next-NVFP4-vLLM-DGX-Spark-k8s
- Modelo base (RadixArk): https://huggingface.co/RadixArk/Qwen3.8-Flash-Next-NVFP4
- Repositorio oficial de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Repositorio GitHub de este proyecto: https://github.com/pocharlies/Qwen3.8-Flash-Next-NVFP4-vLLM-DGX-Spark-k8s
- Receta base de getrefined: https://github.com/getrefined/Qwen3.8-Flash-Next-NVFP4-vLLM-DGX-Spark
- Receta alternativa con SGLang (MiaAI-Lab): https://github.com/MiaAI-Lab/Qwen3.8-Flash-Next-Dual-DGX-Sparks
- Pagina de recetas vLLM para Qwen3.8-Flash-Next: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
