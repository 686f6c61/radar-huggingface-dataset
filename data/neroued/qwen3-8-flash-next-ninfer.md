# neroued/Qwen3.8-Flash-Next-NInfer

## Resumen

Qwen3.8-Flash-Next-NInfer es un artefacto de inferencia en precisión mixta del modelo Qwen3.8-Flash-Next, publicado por el usuario neroued en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una versión cuantizada y empaquetada en formato `.ninfer` (NInfer v3) que combina el checkpoint BF16 original de Qwen con los expertos calibrados y los pesos MTP (Multi-Token Prediction) del checkpoint NVFP4 publicado por NVIDIA.

El problema que resuelve es la ejecución eficiente de un modelo multimodal grande y moderno en hardware NVIDIA de nueva generación, especialmente DGX Spark (GB10) y RTX 5090, gracias a la cuantización NVFP4 de los expertos enrutados, la decodificación especulativa mediante MTP con una cabeza de borrador optimizada de vocabulario completo, y soporte de KV cache en FP8.

La arquitectura nativa es Qwen4Exp, que incorpora Gated DeltaNet, atención dispersa (sparse attention), flujos residuales con gating, mezcla de expertos (MoE) y embeddings PLE. El artefacto completo ocupa 101 GiB repartidos en cuatro ficheros, incluye tokenizer, recursos del procesador de visión y la plantilla de chat Flash Next, y expone un contexto lógico de 262.144 tokens. Es relevante porque representa el ecosistema de despliegue optimizado para la familia experimental Qwen4 sobre hardware Blackwell.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen4Exp: Gated DeltaNet, sparse attention, gated residual streams, MoE, PLE embeddings |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el modelo es MoE, pero el numero de expertos activos no se ha publicado) |
| Longitud de contexto | 262.144 tokens (limite logico en las configuraciones de ejemplo de NInfer) |
| Tipos de cuantizacion | NVFP4 (expertos enrutados principales, importado de NVIDIA), Q8 A16 (proyecciones GDN grandes, query/gate y salida del QSA principal), block-FP8 (expertos MTP), NF4 (tabla PLE), Q4 A16 (cabeza MTP optimizada de vocabulario completo), BF16 (cabeza principal, expertos compartidos, vision y demas proyecciones retenidas) |
| Idiomas soportados | no disponible |
| Licencia | nvidia-open-model-license (NVIDIA Open Model License) |
| Formato de pesos | `.ninfer` (artefacto NInfer v3, cuatro ficheros, 101 GiB totales; tamano del repo: 108,5 GB) |

## Arquitectura y entrenamiento

Este artefacto no incluye informacion sobre el entrenamiento del modelo base: no se han publicado datos sobre el numero de tokens de preentrenamiento, la composicion del dataset ni procesos de RLHF/DPO en la informacion disponible. Lo que si esta documentado es la representacion de pesos: los expertos enrutados principales se almacenan en NVFP4 importado de NVIDIA con escalas calibradas; las proyecciones GDN grandes y las componentes query/gate/salida del QSA principal van en Q8 A16; los expertos del modulo MTP usan block-FP8; la tabla PLE se comprime a NF4; y la cabeza principal, los expertos compartidos, la HC, la vision y el resto de proyecciones se mantienen en BF16, conservando los campos de control FP32 del original.

Como innovacion destacable, el artefacto incluye MTP nativo con una cabeza de borrador adicional de vocabulario completo en Q4 A16 (sin recortar el vocabulario), que se activa con `--spec mtp --draft-tokens 3 --proposal-head optimized`. La decodificacion especulativa con tres tokens de borrador, junto al KV cache en FP8 y CUDA Graph decode, constituye el nucleo de la optimizacion de latencia. El modelo es multimodal (pipeline image-text-to-text) e incluye los pesos de vision.

## Capacidades

- Generacion de texto conversacional con la plantilla de chat Flash Next mantenida por el artefacto.
- Comprension multimodal imagen-texto (pipeline image-text-to-text), con pesos de vision incluidos en BF16.
- Razonamiento matematico de alto nivel, segun los resultados declarados en AIME 2026 y GPQA-Diamond.
- Comprension visual de escenas reales y documentos, segun los resultados en RealWorldQA, MMMU-Pro y ERQA.
- Decodificacion especulativa MTP con hasta 3 tokens de borrador mediante cabeza optimizada de vocabulario completo.
- Servido compatible con APIs de OpenAI y Anthropic a traves de `ninfer-serve`, ademas de generacion por CLI (`apps/ninfer`).
- Despliegue distribuido en dos nodos DGX Spark con TP2 (expert TP por defecto o expert parallelism entero con `ep = 2`).
- Soporte de tool calling: no disponible en la informacion proporcionada.

## Casos de uso

- Servido multimodal autoalojado en DGX Spark: el preset `dgx-spark-release` permite levantar un servidor compatible con OpenAI/Anthropic en una sola unidad Spark, adecuado para equipos que quieren exponer un endpoint privado de vision y texto sin depender de la nube.
- Despliegue de alta capacidad en dos nodos: con la configuracion `spark2` y NCCL, el TP2 por expertos permite repartir el artefacto entre dos Spark para cargas con mas usuarios concurrentes.
- Inferencia en RTX 5090 con offload de expertos a CPU: la ruta con CPU expert offload permite ejecutar el artefacto en una GPU consumer de gama alta, util para estaciones de trabajo de desarrollo sin hardware de datacenter.
- Resolucion de problemas matematicos y de razonamiento cientifico: los resultados declarados en AIME 2026 (97,78) y GPQA-Diamond (91,79) lo sitúan como candidato para asistentes de razonamiento en dominios STEM.
- Analisis de documentos e imagenes: el rendimiento en MMMU-Pro (80,81) y RealWorldQA (85,75) lo hace adecuado para pipelines de extraccion y comprension de contenido visual, como analisis de capturas, diagramas o material educativo.
- Experimentacion con decodificacion especulativa: la cabeza MTP optimizada de vocabulario completo permite evaluar el impacto real de MTP3 sobre el throughput de decodificacion en el motor NInfer.
- Generacion por CLI para prototipado: `apps/ninfer` con `--prompt` o `--messages` permite probar el modelo sin montar infraestructura de servidor.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (model-index, no verificados), obtenidos con NInfer / EvalScope 1.10.0 en evaluacion 0-shot con regla:

| Benchmark | Tarea | Metrica | Resultado |
|---|---|---|---|
| GPQA-Diamond | Text generation | Accuracy (0-shot, rule) | 91,79 |
| AIME 2026 | Text generation | Accuracy (0-shot, rule) | 97,78 |
| ERQA | Image-text-to-text | Accuracy (0-shot, rule) | 68,00 |
| RealWorldQA | Image-text-to-text | Accuracy (0-shot, rule) | 85,75 |
| MMMU-Pro (standard, 10 opciones) | Image-text-to-text | Accuracy (0-shot, rule) | 80,81 |

No hay tabla comparativa con otros modelos en la informacion disponible, por lo que no se incluyen comparaciones numericas.

## Requisitos de hardware

- Tamano del artefacto: 101 GiB en cuatro ficheros (repo completo: 108,5 GB); se necesitan los cuatro ficheros en el mismo directorio.
- DGX Spark (GB10): configuracion soportada oficialmente con el preset `dgx-spark-release`, habilitando vision, FP8 KV, MTP3, cabeza optimizada y CUDA Graph decode.
- Dos DGX Spark: despliegue distribuido compilando con `-DNINFER_ENABLE_DISTRIBUTED=ON` y dependencias de desarrollo NCCL; TP2 con expert TP por defecto o EP entero con `ep = 2`.
- RTX 5090: puede ejecutar el artefacto con CPU expert offload; la model card indica que esa ruta necesita aproximadamente una cantidad de recursos cuya cifra exacta no esta disponible (el texto se trunca en la model card).
- VRAM estimada para inferencia: no disponible con cifras concretas.
- Motor de ejecucion: NInfer (libreria `ninfer`); no se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible; se sabe que las configuraciones de ejemplo activan CUDA Graph decode y MTP3 para mejorar la velocidad de decodificacion.

## Comparativa con modelos similares

| Aspecto | Qwen3.8-Flash-Next-NInfer | Qwen/Qwen3.8-Flash-Next (base) | nvidia/Qwen3.8-Flash-Next-NVFP4 |
|---|---|---|---|
| Tipo | Artefacto NInfer de precision mixta | Modelo base original | Checkpoint NVFP4 de NVIDIA |
| Cuantizacion | NVFP4 + Q8 A16 + block-FP8 + NF4 + Q4 A16 + BF16 | no disponible (segunamente BF16) | NVFP4 |
| MTP | Nativo, con cabeza optimizada Q4 A16 de vocabulario completo | no disponible | Incluye pesos MTP calibrados |
| Formato | `.ninfer` (101 GiB) | Formato Hugging Face estandar | Formato Hugging Face estandar |
| Motor | NInfer exclusivamente | Ecosistema Hugging Face general | Ecosistema Hugging Face general |
| Licencia | nvidia-open-model-license | no disponible | no disponible |
| Contexto documentado | 262.144 tokens (en configs de NInfer) | no disponible | no disponible |

No hay otros modelos comparables publicados en la informacion disponible.

## Limitaciones y advertencias

- Los benchmarks provienen del model-index del propio autor y no estan verificados por terceros; conviene tratarlos con cautela.
- La ejecucion requiere el motor NInfer: el formato `.ninfer` no es compatible directamente con vLLM, llama.cpp, Ollama ni TGI, lo que limita la portabilidad.
- El tamano del artefacto (101 GiB) exige hardware de gama alta o distribucion en varios nodos; en RTX 5090 depende del offload de expertos a CPU, con impacto esperable en latencia (cifras no publicadas).
- La licencia es la NVIDIA Open Model License, que impone condiciones especificas al uso comercial; hay que revisar el texto completo antes de desplegar en produccion.
- Sesgos conocidos: no disponible. Riesgo de alucinacion: no disponible, aunque debe asumirse el riesgo inherente a cualquier modelo generativo.
- Idiomas soportados: no disponible en la model card.
- El modelo es experimental (tag `qwen4-exp`) y la fecha de creacion es muy reciente, por lo que la madurez del ecosistema y la estabilidad a largo plazo no estan probadas.
- El numero de descargas (228) y likes (0) indica una adopcion muy temprana y poca validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/neroued/Qwen3.8-Flash-Next-NInfer
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Checkpoint NVFP4 de NVIDIA: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-NVFP4
- Repositorio NInfer: https://github.com/Neroued/ninfer
- Resultados de evaluacion (evaluation.json): https://github.com/Neroued/ninfer/blob/master/model-cards/Qwen3.8-Flash-Next-NInfer/evaluation.json
- Receta de conversion `qwen3_8_flash_next`: https://github.com/Neroued/ninfer/blob/master/tools/convert/official_recipes.py
- Guia de despliegue y configuraciones: https://github.com/Neroued/ninfer/tree/master/examples/configs
- Configuracion de ejemplo para un Spark: https://github.com/Neroued/ninfer/blob/master/examples/configs/spark-qwen3_8-flash-next.toml
- Configuracion de ejemplo para dos Spark: https://github.com/Neroued/ninfer/blob/master/examples/configs/spark2-qwen3_8-flash-next.toml
- Manifiesto del artefacto: https://huggingface.co/neroued/Qwen3.8-Flash-Next-NInfer/blob/main/artifact-manifest.json
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
