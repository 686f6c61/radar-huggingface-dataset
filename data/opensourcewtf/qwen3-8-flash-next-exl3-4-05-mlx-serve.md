# OpensourceWTF/Qwen3.8-Flash-Next-EXL3-4.05-mlx-serve

## Resumen

Qwen3.8-Flash-Next-EXL3-4.05-mlx-serve es un repositorio de Hugging Face publicado por el usuario OpensourceWTF que contiene una cuantización EXL3 a 4,05 bits por peso del modelo Qwen3.8-Flash-Next, repaquetada para poder servirse con mlx-serve en Apple Silicon. La cuantización original es obra de turboderp (ramificación `4.05bpw_h6_ng6` de turboderp/Qwen3.8-Flash-Next-exl3, creada con exllamav3) y este pack simplemente copia los bytes cuantizados al layout de ficheros que mlx-serve carga, sin recuantizar nada. El modelo base es un MoE de la serie experimental Qwen4 (`qwen4_exp`) con unos 34.283 millones de parámetros totales según los safetensors.

El problema que resuelve es de compatibilidad de ecosistema: el pack original de turboderp funciona con exllamav3, pero no carga en mlx-serve, la pila de inferencia para Mac con chips M. Este repositorio adapta esos ficheros para ejecutar el modelo en Apple Silicon, concretamente probado en un M5 Max con 128 GB de memoria. Es relevante porque permite ejecutar un MoE grande con arquitectura híbrida (Gated DeltaNet, atención dispersa, MTP) en hardware de consumidor Apple sin servidor NVIDIA.

Cabe destacar que no es una publicación oficial de Qwen ni de turboderp ni de mlx-serve, que no se han medido pruebas de calidad propias del pack (KLD o perplexidad a través de mlx-serve) y que solo se ha probado con texto, no con entrada de imagen o vídeo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido (Gated DeltaNet + atención dispersa + MTP), familia qwen4_exp |
| Parametros totales | 34.283.303.315 (dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 a 4,05 bpw (expertos K4, trunk/attention K6, n-gram table K6, MTP fc K5, lm_head K6; tensores pequeños en bf16) |
| Idiomas soportados | no disponibles |
| Licencia | qwen-community-1.0 (licencia "other") |
| Formato de pesos | safetensors (layout EXL3 para mlx-serve) |

Datos adicionales del pack: descarga completa de 107,63 GB (68,59 GB sin la tabla n-gram de 39,04 GB; expertos enrutados 62,14 GB en 49 ficheros; trunk 5,52 GB; vision tower 0,90 GB). Librería: mlx-serve. Pipeline: text-generation. 242 descargas y 0 likes en el momento de la ficha.

## Arquitectura y entrenamiento

El modelo base, Qwen3.8-Flash-Next, es un MoE con 48 capas de 512 expertos enrutados cada una, más una capa MTP (multi-token prediction) con otros 512 expertos. Combina proyecciones de atención q/k/v/o con bloques Gated DeltaNet (arquitectura híbrida atención/SSM-estilo), un indexador de atención dispersa (sparse-attention indexer) y un mecanismo de hyper-connections. Incluye además un vision tower (0,90 GB en bf16), lo que sugiere capacidades multimodales, aunque el pack solo se ha probado con texto.

En cuanto a la cuantización, todos los tensores EXL3 usan el codebook MUL1, con un esquema mixto: los expertos enrutados a K4 bits por peso (la parte más voluminosa), las proyecciones de atención, Gated DeltaNet, shared experts y lm_head a K6, la tabla de embeddings n-gram a K6 y los routers, normas, embeddings de tokens, convoluciones y el mixer de hyper-connections del MTP en bf16 sin cuantizar. No hay información disponible sobre el preentrenamiento del modelo base (número de tokens, composición del dataset) ni sobre RLHF/DPO.

Como innovación técnica destacable, el pack soporta decodificación especulativa mediante la tabla n-gram EXL3 y la cabeza MTP, lo que permite predecir varios tokens por paso.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation).
- Generacion de codigo de alto nivel: pass@1 greedy de 0,988 en HumanEval y 0,963 en HumanEval+ medidos sobre este pack.
- Razonamiento y matematicas: no hay datos publicados específicos para este pack; no disponible.
- Capacidades multimodales potenciales: el pack incluye un vision tower en bf16, pero la entrada de imagen o vídeo no ha sido probada por el autor.
- Decodificacion especulativa vía MTP (multi-token prediction) y tabla n-gram EXL3.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Ejecucion local en Apple Silicon: el caso de uso principal; permite servir un MoE de ~34B de parámetros en un Mac M5 Max de 128 GB con mlx-serve, sin depender de GPUs NVIDIA ni de la nube.
- Generacion y revision de codigo en local: con pass@1 de 0,988 en HumanEval sobre este pack, es adecuado como asistente de programación offline integrado en editores o scripts locales.
- Chatbots conversacionales autoalojados: pipeline conversational con inferencia eficiente gracias a la cuantización a 4,05 bpw y la decodificación especulativa MTP/n-gram.
- Experimentacion con arquitecturas híbridas: útil para desarrolladores que quieran probar en hardware Apple un modelo que combina Gated DeltaNet, atención dispersa y MTP.
- Prototipado de servidores de inferencia en Mac: el pack requiere la rama `qwen38-exl3-full` de davidtai/mlx-serve y el plugin turboexl3, por lo que sirve como banco de pruebas para estas pilas emergentes.
- Despliegue privado con requisitos de confidencialidad: al ejecutarse íntegramente en local, es adecuado para procesar texto sensible sin enviarlo a servicios externos.

## Benchmarks y rendimiento

Datos de calidad de la cuantización medidos por turboderp con exllamav3 sobre sus ficheros (los mismos bytes que este pack), sobre una traza in-domain auto-generada (14.496 tokens de entrada y 45.588 de salida):

| Metrica | Valor |
|---|---|
| KLD media D_KL(p_BF16 ‖ p_quant) | 0,0066 |
| Perplexity | 1,3897 |
| Perplexity BF16 (referencia) | 1,38474 |
| Suelo de ruido KLD | 0,00262 |

Evaluación end-to-end a través de mlx-serve (EvalPlus, greedy pass@1, realizada por el autor del pack):

| Benchmark | Resultado |
|---|---|
| HumanEval | 0,988 (162 de 164) |
| HumanEval+ | 0,963 (158) |
| MBPP | 0,958 (362 de 378) |
| MBPP+ | 0,796 (301) |

No se han publicado resultados de benchmarks estándar del modelo base (MMLU, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- Memoria unificada estimada: el pack completo pesa 107,63 GB (68,59 GB sin la tabla n-gram), por lo que se necesita un Mac con al menos 128 GB de memoria unificada para cargarlo con holgura; el autor solo lo ha probado en un Apple M5 Max con 128 GB y no en otros Macs.
- GPUs NVIDIA: no aplicable; este pack no carga en exllamav3, transformers, vLLM, SGLang ni mlx-lm. Para GPU NVIDIA existe el repositorio original de turboderp.
- Consumer GPUs: no compatible con este pack (formato exclusivo de mlx-serve en Apple Silicon).
- Software requerido: mlx-serve con soporte EXL3 completo para Qwen3.8 (rama `qwen38-exl3-full` de davidtai/mlx-serve, o la cabeza de ddalcu/mlx-serve#997) y el plugin turboexl3 (compilado desde `plugin/` de davidtai/turboexl3), que gestiona los bloques `expert_quant` y `trunk_quant`.
- Latencia y throughput: no disponible; la decodificación especulativa vía MTP y n-gram sugiere aceleración, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| OpensourceWTF/Qwen3.8-Flash-Next-EXL3-4.05-mlx-serve | 34,28B (totales) | safetensors EXL3 4,05 bpw para mlx-serve | qwen-community-1.0 | Apple Silicon (mlx-serve + turboexl3) |
| turboderp/Qwen3.8-Flash-Next-exl3 (4.05bpw_h6_ng6) | 34,28B (totales) | EXL3 4,05 bpw para exllamav3 | no disponible | GPUs con exllamav3 |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible | pesos originales (BF16) | no disponible | no disponible en la información proporcionada |

Alternativas de la misma categoría de tamaño: no disponible (no hay datos suficientes de otros MoE comparables en la información proporcionada).

## Limitaciones y advertencias

- No es una publicación oficial de Qwen, de turboderp ni de mlx-serve; es un repack de la comunidad.
- El stock mlx-serve no puede servir este pack: se necesitan la rama `qwen38-exl3-full` de davidtai/mlx-serve (o ddalcu/mlx-serve#997) y el plugin turboexl3, lo que añade fricción de instalación y riesgo de rotura con futuras versiones.
- Solo probado en un Apple M5 Max con 128 GB; el rendimiento en otros Macs es desconocido.
- Solo probado con texto; la entrada de imagen o vídeo (pese a incluir vision tower) no ha sido verificada.
- No se han medido KLD ni perplexidad a través de mlx-serve; las cifras de calidad provienen de turboderp medidos con exllamav3 sobre sus ficheros. El autor no ejecutó pruebas de calidad propias del pack.
- Sesgos conocidos: no disponibles. Riesgo de alucinación: no cuantificado en la información proporcionada.
- Longitud de contexto e idiomas soportados: no disponibles.
- Licencia qwen-community-1.0 ("other"): deben revisarse los términos concretos en el fichero LICENSE antes de uso comercial; no es una licencia permisiva estándar.
- Descargas aún muy bajas (242) y sin likes: adopción y validación comunitaria mínimas; usar con cautela en producción.
- La tabla n-gram ocupa 39 GB del total; si se prescinde de ella (68,59 GB), se pierde presumiblemente parte de la aceleración especulativa.

## Enlaces

- Repositorio del modelo: https://huggingface.co/OpensourceWTF/Qwen3.8-Flash-Next-EXL3-4.05-mlx-serve
- Modelo base cuantizado (turboderp): https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3 (rama `4.05bpw_h6_ng6`: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3/tree/4.05bpw_h6_ng6)
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- exllamav3: https://github.com/turboderp-org/exllamav3
- mlx-serve: https://github.com/ddalcu/mlx-serve
- Rama con soporte EXL3 completo: https://github.com/davidtai/mlx-serve/tree/qwen38-exl3-full
- Pull request de soporte: https://github.com/ddalcu/mlx-serve/pull/997
- Plugin turboexl3: https://github.com/davidtai/turboexl3 (directorio plugin: https://github.com/davidtai/turboexl3/tree/main/plugin)
- Resultados de evaluaciones de codigo: https://github.com/davidtai/turboexl3/blob/main/docs/RESULTS.md#coding-evals
