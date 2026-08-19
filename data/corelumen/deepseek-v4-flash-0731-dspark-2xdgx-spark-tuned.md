# corelumen/DeepSeek-V4-Flash-0731-DSpark-2xDGX-Spark-Tuned

## Resumen

Este repositorio no contiene pesos de modelo, sino una receta de despliegue autocontenida para servir el modelo base `deepseek-ai/DeepSeek-V4-Flash-0731` sobre dos nodos DGX Spark (GB10, arquitectura Blackwell) mediante vLLM. Lo publica corelumen, vinculado al laboratorio Mia'a AI Lab, y su valor reside en la configuración validada de un stack de inferencia de última generación: tensor parallelism TP=2, decodificación especulativa DSpark, caché KV en NVFP4 con ruta DS-MLA y una ventana de contexto por defecto de 1.048.576 tokens (1M).

El modelo base, DeepSeek-V4-Flash-0731, es la versión estable de DeepSeek-V4-Flash, un modelo de texto con arquitectura de mezcla de expertos (MoE) con capacidades agénticas mejoradas respecto a la versión preliminar. La receta documenta un perfil de servicio orientado a agentes con presupuesto de tokens de pensamiento configurable (`off`, `low`, `high`, `max`), predicción multi-token (MTP) con 5 tokens y un pool de caché KV compartido de aproximadamente 2,49 millones de tokens. El repositorio tiene un tamaño de 0.0 GB, lo que confirma que se distribuye exclusivamente configuración, scripts y documentación, no pesos.

La relevancia actual de esta ficha es doble: por un lado, documenta cómo desplegar un MoE de gran contexto en hardware compacto de dos nodos; por otro, sirve de referencia para evaluar el rendimiento real de DeepSeek-V4-Flash-0731 en entornos de producción con vLLM 0.25 y el backend de MoE `flashinfer_b12x`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), basada en DeepSeek-V4-Flash-0731 |
| Parametros totales | no disponible (el repositorio no incluye pesos) |
| Parametros activos | no disponible (el repositorio no incluye pesos) |
| Longitud de contexto | 1.048.576 tokens (1M) por defecto, configurable |
| Tipos de cuantizacion | NVFP4 para caché KV (`kv_cache_dtype=nvfp4_ds_mla`); pesos no incluidos en el repo |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no aplica (repo de configuración; el modelo base se distribuye con safetensors) |

## Arquitectura y entrenamiento

El repositorio no documenta el entrenamiento del modelo base, que corresponde a `deepseek-ai/DeepSeek-V4-Flash-0731`. Según la información disponible, se trata de un modelo de texto con arquitectura MoE (mezcla de expertos) y capacidades agénticas mejoradas respecto a la versión preliminar de DeepSeek-V4-Flash. La receta de despliegue añade varias innovaciones técnicas sobre ese modelo: decodificación especulativa DSpark integrada en la imagen Docker, caché KV en NVFP4 con la ruta experimental `nvfp4_ds_mla`, backend de MoE `flashinfer_b12x` y predicción multi-token (MTP) con un tamaño de bloque de 5 tokens (`MTP_NUM_TOKENS=5`).

El stack se apoya en una imagen Docker precompilada (`ghcr.io/anemll/dspark-vllm-gx10:0.1.1`) que porta vLLM 0.25 con soporte nativo para DSpark, NVFP4 DS-MLA y MoE b12x. La configuración por defecto establece `max_model_len=1048576`, `max_num_seqs=6`, `max_num_batched_tokens=8192` y `GPU_MEMORY_UTILIZATION_TEXT=0.835`, lo que resulta en una caché KV disponible de aproximadamente 18.08 GiB y un pool de ~2.493.464 tokens. No se proporcionan datos sobre el dataset de entrenamiento, el número de tokens de preentrenamiento ni el uso de RLHF o DPO.

## Capacidades

- Generación de texto con ventana de contexto de hasta 1M tokens por sesión, pensada para tareas de razonamiento profundo y agentes.
- Decodificación especulativa DSpark integrada, que acelera la generación mediante un modelo proponente y verificación en paralelo.
- Modo de pensamiento configurable (`DEFAULT_THINKING=off|low|high|max`) con presupuesto de tokens de pensamiento (`thinking_token_budget`) y límite de generación (`max_tokens`) ajustables por petición.
- Predicción multi-token (MTP) con 5 tokens por paso, soportada por el checkpoint del modelo base.
- Soporte de agentes y razonamiento multi-paso, con un pool de caché KV compartido que permite ejecutar hasta 6 sesiones concurrentes sin reservar 1M tokens por sesión.
- Capacidades multilingües: no disponible en la información proporcionada.
- Soporte de tool calling / function calling: no confirmado explícitamente en la documentación de la receta, aunque las capacidades agénticas del modelo base lo sugieren.

## Casos de uso

- Servicio de agentes con contexto largo: la configuración permite mantener hasta 1M tokens por sesión con 6 secuencias concurrentes, adecuado para agentes que procesan documentos extensos, historiales de conversación largos o repositorios de código completos.
- Razonamiento multi-paso con presupuesto de pensamiento controlado: el parámetro `thinking_token_budget` permite limitar el coste de inferencia en tareas de cadena de pensamiento, útil para pipelines de QA sobre bases documentales.
- Despliegue de DeepSeek-V4-Flash-0731 en hardware Blackwell compacto: la receta valida el funcionamiento en dos nodos DGX Spark con TP=2, una alternativa a clústeres de GPU de gran formato para equipos con este hardware.
- Evaluación de rendimiento de MoE con decodificación especulativa: el repositorio documenta variables de entorno y ajustes (como `VLLM_USE_BREAKABLE_CUDAGRAPH=0`) que permiten comparar throughput y latencia con y sin DSpark.
- Entornos de desarrollo con vLLM 0.25: la imagen Anemll incluye el backend `flashinfer_b12x` y la ruta NVFP4 DS-MLA, útil para probar configuraciones experimentales de caché KV en producción.
- Investigación sobre KV cache en NVFP4: la ruta `nvfp4_ds_mla` y la opción de montar `vllm_patch_gb10/` para NVFP4 híbrido permiten experimentar con formatos de cuantización de caché de baja precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni comparativas con otros modelos. Los únicos datos de rendimiento documentados son operativos: caché KV disponible de ~18.08 GiB, pool de ~2.493.464 tokens y un factor de concurrencia de ~2.38× a 1M de contexto, según el log de arranque.

## Requisitos de hardware

- Dos nodos DGX Spark (GB10, arquitectura Blackwell) con tensor parallelism TP=2.
- VRAM estimada: no disponible de forma explícita; la configuración reserva un 83.5% de la memoria de las GPU para el pool de KV cache (18.08 GiB disponibles para caché en la configuración por defecto).
- GPU recomendadas: DGX Spark (GB10) exclusivamente; no se documenta soporte para otras GPU.
- No cabe en GPU de consumo convencional: requiere el hardware específico de dos nodos DGX Spark.
- Opciones de despliegue: vLLM 0.25 mediante Docker con la imagen `ghcr.io/anemll/dspark-vllm-gx10:0.1.1`; también se ofrece una ruta alternativa de construcción con overlay Stage-C (`vllm-dspark-runtime:dspark-nvfp4-stage-c`).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa. El modelo base DeepSeek-V4-Flash-0731 es la referencia directa, y esta receta es una de las configuraciones de despliegue documentadas para él. Otras recetas similares (como `0xSero/deepseek-v4-flash-0731-spark`) existen en Hugging Face, pero no se han publicado métricas comparables. La licencia MIT del repositorio contrasta con la licencia del modelo base, que no se especifica en la información disponible.

## Limitaciones y advertencias

- El repositorio no contiene pesos: tiene un tamaño de 0.0 GB y es exclusivamente una receta de configuración; requiere descargar el modelo base `deepseek-ai/DeepSeek-V4-Flash-0731` por separado.
- Dependencia de hardware específico: la configuración está validada únicamente para dos nodos DGX Spark; no se documenta su funcionamiento en otras plataformas.
- Variables de entorno dependientes de la imagen Docker: la imagen Anemll `0.1.1` no registra todas las variables `VLLM_DSPARK_*` del overlay Stage-C; establecerlas produce avisos de variable desconocida y no tiene efecto.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones de sesgo ni tasas de alucinación para el modelo base en la información proporcionada.
- Restricciones de licencia: el repositorio usa licencia MIT, pero la licencia del modelo base DeepSeek-V4-Flash-0731 no se especifica en la documentación; conviene verificarla antes de un uso comercial.
- Configuración de memoria delicada: se advierte explícitamente de no fijar `GPU_MEMORY_UTILIZATION` a mano; debe usarse `GPU_MEMORY_UTILIZATION_TEXT` para que el script de arranque la mapee correctamente.
- Sin benchmarks publicados: no hay métricas de rendimiento académico ni de latencia/throughput que permitan evaluar la calidad del modelo servido.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/corelumen/DeepSeek-V4-Flash-0731-DSpark-2xDGX-Spark-Tuned
- Repositorio GitHub de la receta (MiaAI-Lab): https://github.com/MiaAI-Lab/DeepSeek-v4-Flash-DSpark-2xDGX-Spark
- Modelo base en Hugging Face: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Imagen Docker Anemll: https://github.com/Anemll/dspark-vllm-gx10
- Documentación de DeepSeek-V4-Flash-0731 en DeepWiki: https://deepwiki.com/deepseek-v4-flash-0731/deepseek-v4-flash-0731
- Ficha del modelo en Cloudflare AI docs: https://developers.cloudflare.com/workers-ai/models/deepseek-v4-flash-0731/
- Receta alternativa en Hugging Face: https://huggingface.co/0xSero/deepseek-v4-flash-0731-spark
