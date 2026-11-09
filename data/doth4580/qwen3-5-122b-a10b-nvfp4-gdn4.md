# doth4580/Qwen3.5-122B-A10B-NVFP4-GDN4

## Resumen

Qwen3.5-122B-A10B-NVFP4-GDN4 es una variante cuantizada del modelo Qwen3.5-122B-A10B, desarrollado originalmente por el equipo Qwen de Alibaba. El artefacto lo publica el usuario doth4580 y su proposito principal es ejecutar el modelo base en sistemas NVIDIA DGX Spark / GB10 mediante el motor de inferencia veloGB10. La cuantizacion aplicada es NVFP4 con un esquema denominado `nvfp4-gdn4`, que convierte todas las operaciones GEMM a NVFP4 (incluida la recuantizacion de las capas GatedDeltaNet de FP8 a NVFP4) y mantiene el router en bf16.

El modelo base es un MoE hibrido de 122B parametros totales y aproximadamente 10B activos por token, con una longitud de contexto de 262.144 tokens y un vocabulario de 248.320 entradas. Combina 36 capas GatedDeltaNet (atencion lineal con estado recurrente de tamano fijo) con 12 capas de atencion completa GQA, e incorpora una cabeza nativa de prediccion multi-token (MTP) que el motor veloGB10 aprovecha para decodificacion especulativa sin perdida (greedy-lossless).

La relevancia de este artefacto es practica: permite servir un modelo de 122B parametros en hardware GB10 de un solo nodo o de dos nodos con tensor parallelism, manteniendo el formato `compressed-tensors` estandar y, por tanto, la portabilidad a otros frameworks que lean dicho formato. La licencia es Apache-2.0, heredada del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida: 36 capas GatedDeltaNet (atencion lineal) + 12 capas full GQA; hidden 3072, 32 cabezas Q / 2 KV, 256 expertos top-8 + 1 compartido |
| Parametros totales | 125.086.497.008 (~125B, segun safetensors) |
| Parametros activos | ~10B (MoE, top-8 de 256 expertos + 1 compartido) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 (`nvfp4-gdn4`): todas las GEMM en NVFP4, router en bf16; formato `nvfp4-pack-quantized` compatible con compressed-tensors; tag de 8-bit |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, layout `nvfp4-pack-quantized` (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura transformer hibrida con dos tipos de capa intercalados: 36 capas GatedDeltaNet, que implementan atencion lineal con un estado recurrente de tamano fijo, y 12 capas de atencion completa con GQA (32 cabezas de consulta y 2 de clave/valor). La capa MoE dispone de 256 expertos con enrutamiento top-8 mas un experto compartido, sobre una dimension oculta de 3072. Incorpora ademas una cabeza nativa de multi-token prediction (MTP), pensada para decodificacion especulativa. El vocabulario es de 248.320 tokens.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF/DPO) del modelo original en la informacion proporcionada. Respecto a este artefacto concreto, la model card indica que fue cuantizado a partir del modelo original con el cuantizador offline de veloGB10 (`nvfp4-gdn4`), que los pesos estan modificados respecto al original y que el tokenizer y la plantilla de chat se mantienen sin cambios. La cuantizacion reporta un ~12% mas de velocidad de decodificacion frente a una variante mixta, a cambio de una pequena perdida de calidad.

## Capacidades

- Generacion de texto y razonamiento en el modelo base (capacidades heredadas de Qwen3.5-122B-A10B).
- Procesamiento de contextos largos de hasta 262.144 tokens.
- Decodificacion especulativa mediante la cabeza MTP nativa, soportada por veloGB10 con resultado greedy-lossless.
- Servido con API compatible con OpenAI (`/v1`) a traves de veloGB10.
- Soporte de prefix caching en el motor de inferencia.
- Despliegue en un solo nodo GB10 (TP=1) o en dos nodos (TP=2) con reparto de pesos por red.
- Capacidades de tool calling, agentes, codigo, matematicas o vision: no disponibles en la informacion proporcionada para este artefacto.

## Casos de uso

- Inferencia local de un modelo de 122B parametros en NVIDIA DGX Spark / GB10: el pack esta dimensionado (67 GB en disco) para ejecutarse en un unico nodo GB10 con TP=1, lo que permite disponer de un modelo de gran escala en hardware de escritorio o de laboratorio.
- Servicio de API compatible con OpenAI: veloGB10 expone un endpoint en `http://<head-ip>:9000/v1`, de modo que el modelo puede sustituir a APIs remotas en herramientas que ya hablan el protocolo OpenAI, sin cambiar el codigo cliente.
- Procesamiento de documentos largos: con 262.144 tokens de contexto, el modelo puede ingerir contratos, informes o bases de codigo extensas en una sola pasada, algo inviable en modelos de contexto corto.
- Despliegue en dos nodos GB10 para mayor throughput: con TP=2 se miden 54,0 / 49,9 / 49,5 tok/s a 0 / 4K / 8K de contexto, aproximadamente 1,15-1,26x el rendimiento de un solo nodo, util cuando se necesita servir varias peticiones concurrentes.
- Aceleracion de decodificacion en produccion: la cabeza MTP y la decodificacion especulativa greedy-lossless de veloGB10 permiten reducir la latencia por token sin alterar la distribucion de salida, adecuado para asistentes interactivos.
- Evaluacion y experimentacion con cuantizacion NVFP4: al usar el layout estandar `compressed-tensors`, el artefacto sirve para comparar calidad y rendimiento de NVFP4 frente a otros esquemas en pipelines de investigacion.
- Reutilizacion en otros frameworks: cualquier motor que lea `nvfp4-pack-quantized` puede cargar estos pesos, lo que facilita la portabilidad a entornos distintos de veloGB10.

## Benchmarks y rendimiento

Rendimiento medido por el autor con veloGB10 (greedy, NVFP4):

| Metrica | TP=1 (un GB10) | TP=2 (dos GB10) |
|---|---|---|
| Throughput @ 0 ctx | 47,9 tok/s | 54,0 tok/s |
| Throughput @ 4K ctx | 42,5 tok/s | 49,9 tok/s |
| Throughput @ 8K ctx | 39,2 tok/s | 49,5 tok/s |
| TTFT @ 0 / 4K / 8K | 3,05 / 8,66 / 15,07 s | no disponible |
| Prefill | 702 tok/s | no disponible |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/almacenamiento: el pack ocupa 67 GB en disco y el repositorio completo 71,1 GB; el modelo esta pensado para la memoria unificada de GB10.
- GPU recomendadas: NVIDIA DGX Spark / GB10, en configuracion de uno o dos nodos.
- Cabe en consumer GPU: no disponible; el artefacto esta validado especificamente para GB10 y no se documenta su ejecucion en RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: veloGB10 (`gb10_inference`) es el motor de referencia y el unico validado por el autor; al usar formato compressed-tensors, otros frameworks compatibles podrian cargarlo, aunque no se documenta soporte.
- Latencia y throughput: 47,9 tok/s en TP=1 a contexto 0 y 54,0 tok/s en TP=2; TTFT de 3,05 s a contexto 0 en TP=1; prefill de 702 tok/s.
- Red: en TP=2 el nodo secundario no necesita copia del modelo; el head le envia su parte de los pesos y la cachea localmente. Se puede seleccionar la interfaz RDMA con `--rdma-dev <rail1>,<rail2>`.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-122B-A10B-NVFP4-GDN4 (este) | ~125B | ~10B | 262.144 | Apache-2.0 | safetensors NVFP4 (compressed-tensors) | Hugging Face, 48 descargas |
| Qwen/Qwen3.5-122B-A10B (base) | 122B | ~10B | 262.144 | Apache-2.0 | safetensors (Transformers) | Hugging Face |
| Otras variantes cuantizadas de Qwen3.5-122B-A10B | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo con modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion NVFP4 introduce una perdida de calidad respecto al modelo original; el autor la describe como "pequena" pero no cuantifica la degradacion.
- El artefacto esta producido, validado y ajustado para veloGB10; el soporte en otros frameworks, aunque posible por el formato, no esta probado.
- No se documentan idiomas soportados ni sesgos conocidos del modelo base en la informacion disponible.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; aplica el riesgo habitual de los modelos generativos de gran escala.
- La licencia Apache-2.0 permite uso comercial, pero los pesos estan modificados respecto al original; conviene conservar la atribucion a los autores originales y la copia de la licencia incluida en el repositorio.
- El rendimiento medido corresponde a pruebas del autor con veloGB10 y `tool-eval-bench --perf`; no hay validacion independiente.
- El modelo requiere hardware GB10; no se documenta su ejecucion en GPU de consumo, lo que limita su adopcion fuera de ese ecosistema.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/doth4580/Qwen3.5-122B-A10B-NVFP4-GDN4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B/blob/main/LICENSE
- Motor veloGB10: https://github.com/sf-stav/veloGB10
- Herramienta de benchmark: https://github.com/SeraphimSerapis/tool-eval-bench/
- Qwen Chat: https://chat.qwen.ai
