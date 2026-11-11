# areen09/qwen-engine-models-qwenbin

## Resumen

`areen09/qwen-engine-models-qwenbin` es un repositorio de checkpoints empaquetados en formato binario propietario `.qwenbin` (version v2), disenados para ejecutarse sobre el motor propietario "Unified Qwen CUDA Inference Engine". No se trata de pesos en formato estandar (safetensors o GGUF), sino de contenedores optimizados para hardware concreto: GPUs NVIDIA Tesla T4 con arquitectura Turing (sm_75). El autor, `areen09`, publica tres variantes de modelo empaquetadas: Qwen 2.5 1.5B, Qwen 3.5 4B y Qwen 3.8 27B, todas en cuantizacion W4A16 con agrupacion de 128.

El interes tecnico del repositorio reside en el formato de contenedor y en el soporte de paralelismo tensorial de dos vias sobre dos Tesla T4, con comunicacion directa por BAR1 en Windows (modo TCC) y NCCL en Linux. El modelo de 27B se distribuye en dos shards (`rank0` y `rank1`) de aproximadamente 7,1 GB de VRAM cada uno, lo que permite ejecutar un modelo de 27.000 millones de parametros en cuantizacion de 4 bits sobre dos GPUs de 16 GB. La arquitectura hibrida Gated DeltaNet de las variantes 3.5 y 3.8 se presenta como un ahorro del 75 % de cache KV.

La relevancia es acotada pero especifica: el repositorio no ofrece pesos reutilizables fuera de su motor, sino artefactos de despliegue para un runtime concreto. Esto lo aleja de los modelos publicados en formatos abiertos y lo acerca a un paquete de inferencia precompilado. La licencia declarada es Apache 2.0, aunque el motor de ejecucion no se distribuye en este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: GQA puro (Qwen 2.5 1.5B, 28 capas) y Gated DeltaNet hibrida 3:1 (Qwen 3.5 4B, 32 capas; Qwen 3.8 27B) |
| Parametros totales | 1,54B / 4,0B / 27,0B segun artefacto |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 con agrupacion de 128 (Group-128), empaquetado warp-interleaved |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | `.qwenbin` v2 (contenedor binario propietario con cabecera alineada a 4096 bytes y offsets de 64 bits); tokenizer en `tokenizer.bin` (BPE binario, vocab 151.936) |

## Arquitectura y entrenamiento

El repositorio no documenta el entrenamiento de los modelos subyacentes; se limita a empaquetar variantes de la familia Qwen (2.5, 3.5 y 3.8) en un contenedor binario. La arquitectura declarada combina capas de atencion con query agrupada (GQA) en el modelo 1.5B y capas hibridas Gated DeltaNet en las variantes 3.5 y 3.8, con una proporcion 3:1 entre capas DeltaNet y capas de atencion en el caso de 4B. El contenedor `.qwenbin` v2 incluye una tabla `LayerDescriptor` autodescriptiva que permite intercalar capas `LAYER_GQA` (tipo 0) y `LAYER_DELTANET` (tipo 1), lo que sugiere una ejecucion por dispatch de etiquetas en el runtime.

El aspecto mas destacable del empaquetado es la cuantizacion W4A16 Group-128 con empaquetado warp-interleaved: los pesos de 4 bits se empaquetan en registros de 32 bits para ajustarse a las instrucciones GEMV de los Tensor Cores de Turing. El soporte de paralelismo tensorial de dos vias se implementa con memoria peer directa por BAR1 en Windows TCC y con NCCL en Linux. No se aportan datos sobre numero de tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto en ingles y chino, segun los idiomas declarados.
- Razonamiento y codigo heredados de la familia Qwen subyacente (no se detallan capacidades especificas en la model card).
- Ejecucion en GPUs Turing (sm_75), en concreto Tesla T4, con soporte de una o dos GPUs.
- Paralelismo tensorial de dos vias para el modelo de 27B, con shards independientes por rango.
- Tokenizador BPE binario propio (`tokenizer.bin`, vocab de 151.936).
- No se declara soporte de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Despliegue de un modelo de 27B en infraestructura legacy con dos Tesla T4: el shard `rank0`/`rank1` ocupa aproximadamente 7,1 GB por GPU, lo que permite servir un modelo de 27.000 millones de parametros en cuantizacion 4 bits sobre hardware Turing sin necesidad de GPUs Ampere o superiores.
- Inferencia en entornos Windows con TCC: el soporte de memoria peer directa por BAR1 permite comunicacion entre las dos T4 sin depender de NCCL, util en estaciones de trabajo Windows con dos T4.
- Servicio de generacion de texto bilingue ingles-chino: el tokenizador y los idiomas declarados cubren ambos idiomas, adecuado para asistentes o traduccion en esos pares.
- Pruebas de rendimiento y validacion de cuantizacion W4A16: el binario `cli_bench` incluido en el motor permite medir latencia y throughput con prompts de prueba sobre cada artefacto.
- Prototipado de pipelines con contexto largo en la variante 3.5 4B: el ahorro declarado del 75 % de cache KV en la arquitectura Gated DeltaNet reduce la VRAM necesaria para sesiones largas.
- Evaluacion comparativa de arquitecturas hibridas frente a GQA puro: al convivir en el mismo repositorio un modelo GQA (1.5B) y dos hibridos (4B y 27B), se pueden comparar comportamientos con el mismo runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: ~796 MB para Qwen 2.5 1.5B W4A16; ~2,4 GB para Qwen 3.5 4B W4A16; ~7,1 GB por GPU para cada shard del 27B; ~14,2 GB totales para la variante unificada de 27B en dos GPUs.
- GPU objetivo: NVIDIA Tesla T4 (sm_75, arquitectura Turing), una o dos unidades.
- No se declara compatibilidad con A100, H100 ni RTX 4090; el motor esta compilado para sm_75.
- Cabe en GPU de consumo: no disponible (el repositorio solo declara soporte para Tesla T4).
- Despliegue: exclusivamente mediante el motor propietario "Unified Qwen CUDA Inference Engine" con el binario `cli_bench`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| areen09/qwen-engine-models-qwenbin (27B) | 27,0B | no disponible | `.qwenbin` v2 | Apache 2.0 | 2x Tesla T4 |
| Qwen2.5-32B-Instruct (referencia de la familia) | 32,5B | no disponible en esta ficha | safetensors, GGUF | Apache 2.0 | Ampere/Hopper o consumer de gama alta |
| Qwen2.5-1.5B-Instruct (referencia de la familia) | 1,54B | no disponible en esta ficha | safetensors, GGUF | Apache 2.0 | CPU o GPU consumer |

La comparativa directa con los modelos originales de la familia Qwen no es posible en terminos de rendimiento porque el repositorio no publica benchmarks ni pesos en formato estandar. La diferencia principal es el formato de distribucion: `.qwenbin` solo se ejecuta en el motor del autor, mientras que los pesos originales de Qwen se publican en safetensors y GGUF y son compatibles con el ecosistema estandar.

## Limitaciones y advertencias

- El formato `.qwenbin` v2 es propietario y no es compatible con vLLM, llama.cpp, Ollama, TGI ni con la libreria `transformers`; requiere el motor del autor, que no se distribuye en este repositorio.
- El motor esta compilado para sm_75 (Turing); no hay garantia de funcionamiento en Ampere, Hopper ni en GPUs de consumo.
- No se documentan sesgos conocidos, riesgo de alucinacion ni limitaciones de contexto; la model card no aporta informacion sobre el entrenamiento.
- Solo se declaran los idiomas ingles y chino; no hay soporte declarado de castellano.
- La licencia Apache 2.0 se aplica a los artefactos del repositorio, pero el uso comercial del motor de inferencia depende de los terminos del propio motor, no incluidos aqui.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado en noviembre de 2026; no hay evidencia de validacion externa ni de mantenimiento continuado.
- El tamano del repo (15,3 GB) incluye los tres modelos y los shards del 27B; conviene verificar la integridad de los binarios antes de desplegarlos en produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/areen09/qwen-engine-models-qwenbin
- No se han encontrado en la busqueda web papers, blogs, repositorios de codigo ni demos adicionales asociados a este modelo.
