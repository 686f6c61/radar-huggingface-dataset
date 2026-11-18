# IsValorum/Xing4.0-29B-A4B-APEX-I-MiniPlus-V2.1-Abliterated-GGUF

## Resumen

Xing4.0-29B-A4B-APEX-I-MiniPlus-V2.1-Abliterated-GGUF es una cuantizacion GGUF del modelo Xing4.0-29B-A4B, un Mixture-of-Experts de 29B parametros con aproximadamente 4B activos por token, publicado por el usuario IsValorum. El modelo base es la version abliterated (sin rechazos) de huihui-ai, derivada del Xing4.0 oficial de XingChen-AGI. Esta ficha cubre exclusivamente el artefacto cuantizado en formato GGUF para llama.cpp.

La relevancia de esta build radica en su estrategia de cuantizacion mixta por tensor (APEX-I-MiniPlus V2.1), que comprime los 62,40 GB del checkpoint BF16 hasta 13,76 GB (3,42 BPW) con una degradacion medida de perplexity de solo +5,71% en WikiText-2 respecto al original. Eso permite ejecutar un MoE de 29B con contexto nativo de 256K en GPUs de consumo y configuraciones hibridas RAM/GPU, algo inviable con el modelo en precision completa.

La arquitectura combina mHC (manifold-constrained Hyper-Connections), Multi-head Latent Attention (MLA) y una capa de Multi-Token Prediction (MTP), con 40 capas transformer de las cuales las dos primeras son densas y las 38 restantes MoE con 64 expertos enrutados (4 activos por token) mas un experto compartido siempre activo. El modelo esta orientado a razonamiento, codigo, planificacion agentica y uso de herramientas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer con mHC, MLA y una capa MTP; 40 capas (2 densas + 38 MoE) |
| Parametros totales | 31.215.031.088 (29B nominales) |
| Parametros activos | ~4B por token (64 expertos enrutados, 4 seleccionados + 1 compartido) |
| Longitud de contexto | 262.144 tokens nativos (256K), extensible a 512K segun el autor upstream |
| Tipos de cuantizacion | GGUF APEX-I-MiniPlus V2.1 (mixta por tensor, 3,42 BPW); existe tambien APEX-I-NanoPlus (2,92 BPW) |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); checkpoint fuente en BF16 safetensors |

## Arquitectura y entrenamiento

El modelo base Xing4.0-29B-A4B emplea una arquitectura MoE no uniforme: las capas 0 y 1 son FFN densas (`first_k_dense_replace: 2`), mientras que las capas 2 a 39 son capas MoE con 64 expertos enrutados, 4 seleccionados por token y un experto compartido siempre activo. Se anade un bloque MTP adicional almacenado como `blk.40` en el GGUF. La atencion usa Multi-head Latent Attention (MLA) y la red incorpora manifold-constrained Hyper-Connections (mHC). Segun XingChen, el entrenamiento se realizo sobre la pila Ascend NPU / MindSpore.

La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO en el modelo original. La version abliterated de huihui-ai aplica un flujo de abliteration (referenciando Sumandora/remove-refusals-with-transformers) para eliminar los rechazos; la cuantizacion de IsValorum no realiza ningun procedimiento adicional de eliminacion de rechazos. La build MiniPlus V2.1 preserva las dos capas densas de entrada en alta precision, mantiene todos los routers MoE en F32, protege los expertos compartidos en Q5_K y usa precision de 3 bits calibrada con imatrix para el backbone de expertos enrutados.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Razonamiento multi-paso (tag `reasoning` en el modelo).
- Generacion de codigo (tag `coding`).
- Planificacion agentica y uso de herramientas (tags `agentic`, `endpoints_compatible`).
- Contexto largo nativo de 256K tokens, adecuado para documentos extensos y conversaciones prolongadas.
- Soporte de decodificacion con Multi-Token Prediction (MTP) para acelerar la generacion.
- Modo sin censura (abliterated): no aplica rechazos por defecto.
- Compatibilidad con llama.cpp y endpoints compatibles con la API de OpenAI (segun tag `endpoints_compatible`).

## Casos de uso

- Analisis de repositorios completos: con 256K tokens de contexto nativo, el modelo puede ingerir arboles de codigo extensos y responder preguntas sobre ellos sin trocear el contenido, manteniendo coherencia entre ficheros.
- Asistente de codigo en local: la build de 13,76 GB cabe en GPUs de consumo y permite autocompletado, refactorizacion y generacion de tests en un flujo de trabajo sin dependencia de la nube.
- Agentes autonomos con tool calling: los tags `agentic` y `endpoints_compatible` indican soporte para integrarse en frameworks de agentes que requieren function calling y planificacion multi-paso.
- Procesamiento de documentacion legal o tecnica: el contexto de 256K permite resumir y extraer clausulas de contratos o manuales largos en una sola pasada.
- Despliegue hibrido RAM/GPU: el autor documenta configuraciones de offload parcial, lo que permite ejecutar el modelo en equipos con VRAM limitada pero RAM abundante.
- Investigacion sobre alineacion y seguridad: la variante abliterated sirve para estudiar el comportamiento del modelo sin rechazos y comparar con la version oficial, util en trabajos de red-teaming.
- Generacion de contenido bilingue en y zh: util para equipos que operan en ambos idiomas y necesitan un modelo local con licencia permisiva.

## Benchmarks y rendimiento

Los unicos datos de rendimiento publicados en la informacion disponible son mediciones de perplexity en WikiText-2 realizadas por el autor de la cuantizacion con `llama-perplexity` (contexto 2048, batch 512, 10 chunks):

| Metrica | BF16 fuente | MiniPlus V2.1 | NanoPlus |
|---|---|---|---|
| Perplexity WikiText-2 | 7,3060 +/- 0,18633 | 7,7238 +/- 0,19671 | 8,3197 +/- 0,21528 |
| Delta PPL | 0 | +0,4178 (+5,71%) | +1,0137 (+13,87%) |
| Tamano GGUF | 62,40 GB | 13,76 GB | 11,74 GB |
| BPW medio | 16,00 | 3,42 | 2,92 |
| Calidad objetivo | Precision completa | Clase Q5_K_M | Clase Q4_K_M / Q4_K_S |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 12,82 GiB de huella de memoria para la build MiniPlus V2.1; el fichero ocupa 13,76 GB en disco.
- GPU recomendadas: A100 o H100 para despliegue completo en VRAM con contexto largo; RTX 4090 (24 GB) permite cargar el modelo completo con margen para contexto extendido.
- GPU de consumo: cabe en RTX 4090, RTX 3090 (24 GB) y, con offload parcial a RAM, en GPUs de 12-16 GB como RTX 4080 o 4070 Ti Super.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, y servidores compatibles con la API de OpenAI segun el tag `endpoints_compatible`; vLLM y TGI no estan confirmados para este artefacto GGUF.
- Latencia y throughput: no se han publicado mediciones concretas de tokens por segundo en la informacion disponible; el autor menciona proyecciones de throughput por GPU en la model card, pero los valores no se incluyen en el extracto proporcionado.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Xing4.0-29B-A4B MiniPlus V2.1 (esta ficha) | 31,2B | ~4B | 256K (512K ext.) | Apache 2.0 | GGUF 3,42 BPW |
| Xing4.0-29B-A4B NanoPlus | 31,2B | ~4B | 256K (512K ext.) | Apache 2.0 | GGUF 2,92 BPW |
| Xing4.0-29B-A4B oficial (BF16) | 31,2B | ~4B | 256K (512K ext.) | Apache 2.0 | safetensors BF16 |
| Huihui-Xing4.0-29B-A4B-abliterated | 31,2B | ~4B | 256K (512K ext.) | Apache 2.0 | safetensors |

No se dispone de datos de benchmarks de tareas que permitan comparar el rendimiento cualitativo con modelos de otros desarrolladores de tamano similar; la comparativa se limita a las variantes del mismo modelo base documentadas en la informacion disponible.

## Limitaciones y advertencias

- Modelo abliterated: se ha eliminado el comportamiento de rechazo, por lo que puede generar contenido danino, sesgado o inapropiado sin filtros; no es apto para produccion orientada al publico sin moderacion adicional.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; la cuantizacion agresiva a 3,42 BPW puede incrementar ligeramente la tasa de errores respecto al BF16.
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- La degradacion de perplexity medida (+5,71%) es modesta pero real; tareas sensibles a precision pueden verse afectadas.
- El contexto de 256K requiere memoria KV considerable; en GPUs de consumo el contexto efectivo sera mucho menor que el maximo nominal.
- Aunque la licencia es Apache 2.0, el uso comercial de una variante abliterated conlleva riesgos reputacionales y de cumplimiento que deben evaluarse.
- La informacion sobre datos de entrenamiento, composicion del dataset y fases de alineacion del modelo original no esta disponible, lo que limita la evaluacion de sesgos.
- El artefacto depende de llama.cpp; el soporte en otros runtimes (vLLM, TGI) no esta confirmado.

## Enlaces

- Hugging Face (esta cuantizacion): https://huggingface.co/IsValorum/Xing4.0-29B-A4B-APEX-I-MiniPlus-V2.1-Abliterated-GGUF
- Variante NanoPlus: https://huggingface.co/IsValorum/Xing4.0-29B-A4B-APEX-I-NanoPlus-Abliterated-GGUF
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-Xing4.0-29B-A4B-abliterated
- Modelo oficial upstream: https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B
- Metodo de abliteration referenciado: Sumandora/remove-refusals-with-transformers
- Apoyo al autor de la cuantizacion: https://ko-fi.com/isvalorum
