# BlivionIaG/DeepSeek-V4-Flash-0731-K128-v2

## Resumen

DeepSeek-V4-Flash-0731-K128-v2 es un checkpoint experimental de poda de expertos (expert pruning) publicado por el usuario BlivionIaG, derivado del modelo oficial `deepseek-ai/DeepSeek-V4-Flash-0731` de DeepSeek. Aplica la técnica REAP (Cerebras Research) para eliminar el 37,5 % de los expertos enrutados en cada capa MoE, pasando de 256 a 160 expertos por ámbito, manteniendo el routing top-6, los expertos compartidos, la atención, los embeddings, la cabeza de salida, el compresor y el indexador. El resultado es un modelo de 158.396.236.446 parámetros totales (~158 B) con pesos en formato MXFP4, pensado para entornos con memoria restringida como el DGX Spark / GB10.

El autor lo publica explícitamente como un checkpoint de solo prueba (test-only), no como un lanzamiento oficial de DeepSeek. La poda se basa en una observación previa de un checkpoint anterior de DeepSeek-V4-Flash (no una observación fresca de la revisión 0731), transferida tras verificar la alineación de las matrices del router con una similitud coseno mínima de 0,992. La validación estructural pasó con 48/48 shards legibles y 46/46 ámbitos MoE en K160, y una prueba de humo en DGX Spark con vLLM devolvió `PRUNED_OK` en 6,19 segundos. No se han publicado benchmarks de calidad; el autor advierte que la poda puede degradar el rendimiento y que no debe usarse en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con 160 expertos enrutados por capa, top-6 routing, atención dispersa y módulo de decodificación especulativa DSpark MTP |
| Parametros totales | 158.396.236.446 (~158 B) |
| Parametros activos | no disponible (no se especifica el numero de parametros activos por token) |
| Longitud de contexto | 1.048.576 (contexto del modelo base, no modificado por la poda) |
| Tipos de cuantizacion | MXFP4 (backend MoE), con soporte adicional de FP8 segun tags del repositorio |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors (48 shards, payload de 107.803.320.952 bytes) |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4-Flash-0731 es un transformer MoE con 43 capas backbone, 256 expertos enrutados por capa y routing top-6, mas 3 bloques DSpark MTP (multi-token prediction) mapeados a las capas 40, 41 y 42, que proporcionan decodificacion especulativa. Este checkpoint conserva 160 de los 256 expertos enrutados en cada uno de los 46 ambitos MoE (43 backbone + 3 DSpark), compactando los expertos retenidos en tensores contiguos de 160 expertos. Los pesos del router (sesgos y pesos aprendidos) se recortan a los mismos IDs retenidos, y en las tres primeras capas con routing por hash las tablas token-a-experto se reasignan a la fila del router actual mas cercana por similitud coseno.

La poda se realizo con REAP, una tecnica de poda de expertos basada en la importancia de cada experto observada durante la ejecucion. La importancia se transfirio de una observacion previa del checkpoint `deepseek-ai/DeepSeek-V4-Flash@60d8d707...` (no de la revision 0731 actual), usando el dataset `0xSero/deepseek-v4-flash-reap-observations-v2` con 21.289 filas que cubren codificacion, matematicas, ciencia, tool calling y trayectorias agenciales. Antes de transferir, las 43 matrices del router antiguas se alinearon con el checkpoint 0731; la similitud coseno media mas debil fue 0,9923 y la fila individual mas debil 0,9460, y las tres tablas de hash routing eran identicas bit a bit. No hubo entrenamiento adicional ni RLHF/DPO tras la poda.

## Capacidades

- Generacion de texto y razonamiento: conserva las capacidades del modelo base, aunque con calidad potencialmente reducida por la poda del 37,5 % de los expertos.
- Codificacion: el dataset de observacion incluyo datos de codificacion y trayectorias agenciales, por lo que se espera una preservacion plausible de las capacidades de generacion de codigo, aunque el autor insiste en que debe medirse.
- Tool calling y agentes: el modelo base tiene capacidades agenciales mejoradas; la poda mantiene los tensores del router y los expertos compartidos, por lo que el soporte de tool calling se conserva estructuralmente.
- Decodificacion especulativa: incluye 3 bloques DSpark MTP para prediccion multi-token, aunque la compatibilidad en runtime debe validarse por separado.
- Multilingue: soporta ingles y chino.
- Sin soporte de vision ni audio: el modelo es de texto unicamente.

## Casos de uso

- Investigacion sobre poda de expertos: permite estudiar el impacto de eliminar el 37,5 % de los expertos enrutados en un modelo de 158 B, comparando la calidad con el checkpoint original de 256 expertos en tareas de codificacion, razonamiento y tool calling.
- Evaluacion de memoria en hardware restringido: al reducir el numero de expertos, el modelo cabe en entornos con memoria limitada como el DGX Spark / GB10 (128 GB unificados), lo que permite experimentar con DeepSeek-V4-Flash en configuraciones que de otro modo no lo soportarian.
- Pruebas de routing con conteos de expertos no estandar: el checkpoint fuerza el uso del fallback de router en Torch puro de vLLM para conteos fuera del conjunto soportado por el kernel fusionado, lo que sirve para validar la robustez del runtime ante configuraciones atipicas.
- Desarrollo de pipelines de inferencia con MXFP4: al usar pesos MXFP4, es un banco de pruebas para verificar la compatibilidad de runtimes como vLLM con formatos de cuantizacion de baja precision en modelos MoE grandes.
- Comparativa de decodificacion especulativa: los 3 bloques DSpark MTP permiten evaluar el rendimiento de la prediccion multi-token en un modelo podado, midiendo latencia y throughput frente al backbone sin MTP.
- Generacion de codigo en entornos de investigacion: aunque no apto para produccion, puede usarse en laboratorio para probar la generacion de funciones simples (la prueba de humo devolvio `return a + b` en 1,60 segundos) y comparar con el modelo sin podar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica validacion de rendimiento reportada es una prueba de humo en un NVIDIA DGX Spark / GB10 con la imagen preview de Anemll DeepSeek-V4 vLLM, con contexto configurado de 8.192 tokens:

| Prueba | Resultado | Tiempo |
|---|---|---|
| Probe de respuesta exacta | `PRUNED_OK` | 6,19 s |
| Probe de codificacion | `return a + b` | 1,60 s |

No hay datos de MMLU, HumanEval, GSM8K ni otros benchmarks comparativos. El autor advierte explicitamente que la validacion estructural y de humo no establece paridad de rendimiento con el modelo sin podar.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 89,4 GB en disco y el payload de tensores es de 107,8 GB; con cuantizacion MXFP4, la inferencia requiere aproximadamente 90-110 GB de memoria disponible. No cabe en GPUs de consumo como RTX 4090 (24 GB) ni en A100/H100 de 80 GB.
- GPU recomendadas: la prueba de humo se realizo en un NVIDIA DGX Spark / GB10 con 128 GB de memoria unificada. Para GPUs discretas se necesitarian al menos 2x A100 80GB o una H100 NVL de 94 GB, o hardware con memoria unificada equivalente.
- Opciones de despliegue: vLLM (lineage preview de DeepSeek-V4, con parche para `vllm_topk_softplus_sqrt` que redirige conteos de expertos fuera del conjunto soportado `(16, 32, 64, 128, 192, 256, 320, 384, 512)` a la implementacion `_topk_softplus_sqrt_torch`). No es compatible con Transformers generico ni con Ollama o llama.cpp sin modificaciones, debido a los componentes MXFP4, atencion dispersa, tokenizador personalizado y DSpark MTP.
- Latencia y throughput: no se han publicado mediciones de throughput. Los tiempos de la prueba de humo (6,19 s y 1,60 s para respuestas cortas) no son representativos de carga sostenida.

## Comparativa con modelos similares

| Modelo | Parametros | Expertos enrutados | Contexto | Cuantizacion | Licencia | Estado |
|---|---|---|---|---|---|---|
| deepseek-ai/DeepSeek-V4-Flash-0731 (base) | no disponible (mayor que 158 B) | 256 por capa | 1.048.576 | no especificada | MIT | Oficial, produccion |
| BlivionIaG/DeepSeek-V4-Flash-0731-K128-v2 | 158.396.236.446 | 160 por capa | 1.048.576 | MXFP4 / FP8 | MIT | Experimental, solo prueba |
| BlivionIaG/DeepSeek-V4-Flash-0731-Int4-FP8 | no disponible | no disponible | no disponible | Int4 + FP8 | no disponible | Experimental |

La comparativa principal es con el modelo base, que conserva los 256 expertos y no ha sido podado. La version Int4-FP8 del mismo autor existe pero no se dispone de especificaciones publicadas. No hay otros modelos comparables con la misma arquitectura y tamano en el ecosistema abierto.

## Limitaciones y advertencias

- Checkpoint de solo prueba: el autor lo publica explicitamente como un experimento de poda y formateo, no como un lanzamiento oficial de DeepSeek. No debe usarse en produccion.
- Poda agresiva: se elimino el 37,5 % de los expertos enrutados, lo que puede degradar significativamente la calidad en tareas de razonamiento, matematicas o generacion de codigo compleja. La preservacion de codificacion es plausible pero no esta medida.
- Observacion transferida, no fresca: la importancia de los expertos proviene de un checkpoint anterior (revision `60d8d707...`) y no de una observacion directa de los pesos 0731. Aunque la alineacion de routers fue alta (coseno minimo 0,992), no equivale a una observacion fresca.
- Sin benchmarks: no hay resultados de MMLU, HumanEval, GSM8K ni otras evaluaciones. La validacion estructural y de humo no garantiza calidad.
- Requisitos de runtime especiales: requiere un runtime compatible con DeepSeek-V4 (vLLM preview con parche para el router). Transformers generico no entendera los componentes MXFP4, atencion dispersa, tokenizador ni DSpark MTP.
- Riesgo de alucinacion: como cualquier LLM, puede generar contenido falso o inventado, y la poda puede aumentar este riesgo al perder expertos especializados.
- Limitaciones de idioma: solo ingles y chino; no se garantiza rendimiento en otros idiomas.
- Discrepancia de nomenclatura: el ID del repositorio indica "K128-v2" pero la model card describe una poda a 160 expertos (K160). Esta inconsistencia puede generar confusion al seleccionar el checkpoint.
- Compatibilidad MTP no validada: los 3 bloques DSpark MTP se podaron de forma consistente, pero la compatibilidad de la decodificacion especulativa en runtime debe validarse por separado del backbone.

## Enlaces

- Repositorio del modelo: https://huggingface.co/BlivionIaG/DeepSeek-V4-Flash-0731-K128-v2
- Modelo base oficial: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- Version Int4-FP8 del mismo autor: https://huggingface.co/BlivionIaG/DeepSeek-V4-Flash-0731-Int4-FP8
- Dataset de observaciones REAP: https://huggingface.co/datasets/0xSero/deepseek-v4-flash-reap-observations-v2
- Pagina oficial de DeepSeek: https://deepseek.com/en/index.html
- Pagina del modelo en pi.dev: https://pi.dev/models/huggingface/deepseek-ai-deepseek-v4-flash-0731
- Pagina del modelo en ModelScope: https://modelscope.ai/models/deepseek-ai/DeepSeek-V4-Flash-0731
- Repositorio REAP de Cerebras Research: https://github.com/CerebrasResearch/reap
- Repositorio de vLLM: https://github.com/vllm-project/vllm
