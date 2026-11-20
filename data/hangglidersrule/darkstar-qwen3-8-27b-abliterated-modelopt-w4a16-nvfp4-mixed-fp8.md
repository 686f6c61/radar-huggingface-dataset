# HangGlidersRule/Darkstar-Qwen3.8-27B-Abliterated-ModelOpt-W4A16-NVFP4-Mixed-FP8

## Resumen
Darkstar-Qwen3.8-27B-Abliterated-ModelOpt-W4A16-NVFP4-Mixed-FP8 es una cuantizacion mixta NVFP4/FP8 del derivado abliterado en BF16 de un modelo de la familia Qwen 3.8, publicado por el usuario HangGlidersRule bajo la marca de tuning "Darkstar". El flujo de trabajo aplica primero una edicion de la direccion de rechazo (abliteration) sobre los pesos en BF16 y, posteriormente, cuantiza el checkpoint editado con NVIDIA ModelOpt, combinando W4A16 NVFP4 en las capas MLP del lenguaje y en `lm_head` con FP8 e4m3 en las proyecciones de self-attention y GatedDeltaNet. El resultado es un artefacto de aproximadamente 21,9 GB con 18.164.649.200 parametros reales en safetensors, pensado para inferencia de alto rendimiento en GPUs de clase Blackwell mediante vLLM.

El interes tecnico del artefacto es doble. Por un lado, documenta una receta de cuantizacion mixta reproducible con validadores fail-closed (sin NaN/Inf, sin escalas a cero, sin vision cuantizada, sin metadatos FP8 en KV). Por otro, conserva los 15 tensores MTP en BF16 para habilitar decodificacion especulativa multi-token, lo que explica el rendimiento declarado de 251,889 tok/s en single-stream con MTP10. La model card reporta ademas un resultado de 148/198 (74,75 %) en GPQA.

Se trata de un modelo reducido en rechazos, no alineado para seguridad, distribuido con licencia Apache 2.0 y sin idiomas declarados en los metadatos de Hugging Face. Su uso previsto segun el autor es la generacion de texto de alto throughput y la investigacion sobre el efecto combinado de la edicion de rechazo y la cuantizacion NVFP4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con self-attention y proyecciones GatedDeltaNet (familia Qwen 3.8), con cabeza MTP |
| Parametros totales | 18.164.649.200 |
| Parametros activos | no disponible (no se declara configuracion MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: W4A16 NVFP4 grupo 16 en language_mlp y lm_head; FP8 e4m3 en self_attention y gdn_projections; BF16 en vision, MTP, conv1d, normas, embeddings y KV en runtime |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con configuracion `hf_quant_config.json` de NVIDIA ModelOpt |

## Arquitectura y entrenamiento
La arquitectura subyacente combina capas de self-attention con proyecciones GatedDeltaNet, un esquema hibrido que mezcla atencion clasica con mecanismos de estado lineal. El modelo incluye ademas una torre de vision y una cabeza MTP (multi-token prediction) que se mantiene en BF16 para no degradar la decodificacion especulativa. La model card identifica el modelo upstream como `Qwen/Qwen3.8-27B` en la revision `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`, aunque el nombre comercial del artefacto hable de 27B mientras que el recuento real de safetensors es de 18.164.649.200 parametros.

El proceso de edicion aplica una proyeccion normalizada en float32 de la direccion de rechazo en la capa 38, con semilla 42, sobre exactamente 131 tensores que escriben en el flujo residual. La torre de vision queda intacta. Sobre ese checkpoint BF16 se aplica la cuantizacion con ModelOpt usando la receta `w4a16_nvfp4_mse-fp8_attn-kv_bf16.yaml` (SHA-256 `90fc6b37c00334debd49f1975ab406b5e20667f07e4be0be3e463a648abac642`), con calibracion sobre `cnn_dailymail` y `nemotron-post-training-dataset-v2`, 512+512 muestras, secuencia 2048 y semilla 1234. Los validadores confirman la preservacion de los 131 tensores editados tras la cuantizacion, la ausencia de metadatos FP8 en KV y la reincorporacion de los 15 tensores MTP en BF16. No se documenta en la informacion disponible el volumen de tokens de preentrenamiento, la composicion del dataset original ni si hubo fases de RLHF o DPO.

## Capacidades
- Generacion de texto conversacional y continuacion de contexto en modo text-generation.
- Razonamiento de dominio amplio, con un resultado declarado de 74,75 % en GPQA (148/198).
- Procesamiento de vision: la torre visual se conserva en BF16, por lo que el artefacto mantiene la capacidad multimodal del modelo base.
- Decodificacion especulativa multi-token mediante la cabeza MTP preservada, con configuracion MTP10 como ganadora en single-stream.
- Reduccion deliberada de rechazos: el modelo responde a peticiones que el modelo base rechazaria, por diseno de la edicion.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; los metadatos de Hugging Face no declaran idiomas.

## Casos de uso
- Investigacion sobre abliteration y cuantizacion: el artefacto permite medir empiricamente como interactua una edicion de la direccion de rechazo en la capa 38 con una cuantizacion mixta NVFP4/FP8, comparando contra el BF16 de origen y contra la variante uniforme W4A4 rechazada.
- Despliegue de alto throughput en GPUs Blackwell: con vLLM y la configuracion MTP10, el autor reporta 251,889 tok/s en single-stream, lo que lo hace adecuado para servicios de generacion con requisitos de latencia estrictos.
- Generacion de texto a gran escala sin filtros de rechazo: util en entornos de investigacion controlados donde se necesita estudiar el comportamiento del modelo ante peticiones sensibles sin la capa de rechazo por defecto.
- Analisis multimodal en pipelines internos: al conservar la torre de vision en BF16, puede emplearse para tareas de descripcion de imagenes o extraccion de informacion visual en flujos de trabajo que ya integren la familia Qwen 3.8.
- Evaluacion comparativa de recetas de cuantizacion: sirve como referencia reproducible para equipos que disenen sus propias recetas ModelOpt, ya que la card publica hashes de la receta, del manifiesto y del artefacto.
- Prototipado de asistentes conversacionales de dominio acotado: la licencia Apache 2.0 y el formato safetensors compatible con vLLM facilitan la integracion en entornos de desarrollo sin restricciones de uso comercial.
- Benchmarking de decodificacion especulativa: la preservacion de los 15 tensores MTP permite estudiar el impacto de distintas profundidades MTP sobre throughput y calidad en un modelo cuantizado.

## Benchmarks y rendimiento

| Benchmark | Resultado | Contexto |
|---|---|---|
| GPQA | 148/198 = 74,75 % | Declarado por el autor para esta variante mixta |
| Throughput single-stream (MTP10) | 251,889 tok/s de media | Declarado por el autor en GPUs de clase Blackwell |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otras pruebas estandar para este artefacto concreto. Tampoco se ofrecen comparaciones numericas contra el BF16 de origen ni contra la variante W4A4.

## Requisitos de hardware
- VRAM estimada para inferencia: el repositorio ocupa 21,9 GB en safetensors; con overhead de runtime, KV en BF16 y buffers de vLLM, se debe prever un margen adicional sobre esa cifra.
- GPU recomendadas: el autor indica explicitamente GPUs de clase Blackwell, necesarias para aprovechar de forma nativa NVFP4 y FP8 e4m3. Una RTX 5090 o una B200 encajan en ese perfil; las GPU Hopper (H100) no soportan NVFP4 de forma nativa y requeririan emulacion o conversion.
- Cabe en GPU consumer: no disponible de forma confirmada; el peso en disco de 21,9 GB sugiere que una GPU consumer de 24 GB o mas podria alojarlo, pero la viabilidad depende del soporte de NVFP4 en el runtime y del margen para KV y activaciones.
- Opciones de despliegue: vLLM es el runtime declarado y soportado por la receta (`hf_quant_config.json` de ModelOpt). No se documenta soporte para llama.cpp, Ollama ni TGI, y el formato NVFP4/FP8 mixto hace improbable su uso directo en esos motores sin conversion.
- Latencia y throughput: 251,889 tok/s de media en single-stream con MTP10, segun el autor. No se reportan cifras de throughput agregado por lote ni latencia de primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Darkstar-Qwen3.8-27B-Abliterated-ModelOpt-W4A16-NVFP4-Mixed-FP8 | 18.164.649.200 | no disponible | W4A16 NVFP4 + FP8 mixta | Apache 2.0 | Abliterado, MTP preservado, GPQA 74,75 % |
| Darkstar-Qwen3.8-27B-Abliterated-BF16 | no disponible | no disponible | BF16 | Apache 2.0 | Checkpoint de origen sin cuantizar, misma edicion de rechazo |
| Darkstar-Qwen3.8-27B-Abliterated-ModelOpt-W4A4-NVFP4 | no disponible | no disponible | W4A4 NVFP4 uniforme | Apache 2.0 | No construido; la comparacion en base limpia rechazo W4A4 por throughput |
| Qwen/Qwen3.8-27B | no disponible | no disponible | BF16 original | no disponible | Modelo upstream sin edicion de rechazo |

No se dispone en la informacion proporcionada de datos de benchmarks de las alternativas que permitan una comparacion cuantitativa homogenea mas alla del GPQA reportado para esta variante.

## Limitaciones y advertencias
- Modelo reducido en rechazos por diseno: la edicion de la direccion de rechazo en la capa 38 elimina parte de las negativas del modelo base. No es apto para despliegues de cara al publico sin capas de moderacion externas.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad ni de calibracion para esta variante cuantizada; la cuantizacion a 4 bits en MLP y `lm_head` puede degradar la precision en tareas de conocimiento.
- Idiomas no declarados: los metadatos no especifican cobertura linguistica, por lo que el rendimiento en castellano no esta garantizado ni documentado.
- Longitud de contexto no disponible: no se puede planificar el uso en escenarios de contexto largo sin consultar la configuracion del modelo upstream.
- Discrepancia de nomenclatura: el nombre comercial indica 27B, pero el recuento real de safetensors es de 18.164.649.200 parametros; conviene verificar el tamano efectivo antes de dimensionar infraestructura.
- Dependencia de hardware Blackwell: NVFP4 no es nativo en generaciones anteriores, lo que limita la portabilidad a H100, A100 o GPU consumer antiguas.
- Soporte de runtime restringido: la receta esta atada a vLLM y ModelOpt; no hay garantia de funcionamiento en llama.cpp, Ollama o TGI.
- Trazabilidad: el autor mantiene un ledger interno de linaje (R3) y rechaza builds previos con compressed-tensors; conviene fijar el SHA-256 del manifiesto para reproducibilidad.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de clausulas de uso aceptable especificas traslada al integrador toda la responsabilidad sobre el contenido generado.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/HangGlidersRule/Darkstar-Qwen3.8-27B-Abliterated-ModelOpt-W4A16-NVFP4-Mixed-FP8
- Modelo base BF16: https://huggingface.co/HangGlidersRule/Darkstar-Qwen3.8-27B-Abliterated-BF16
- Repositorio de ingenieria: https://github.com/HangGlidersRule/model-forge
- Receta de cuantizacion: https://github.com/HangGlidersRule/model-forge/blob/main/recipes/qwen3.8-27b/darkstar-qwen3.8-27b-abliterated-modelopt-nvfp4.yaml
- Receta de operadores seleccionada: https://github.com/HangGlidersRule/model-forge/blob/main/configs/modelopt/recipes/w4a16_nvfp4_mse-fp8_attn-kv_bf16.yaml
- Documentacion BF16 del linaje: https://github.com/HangGlidersRule/model-forge/blob/main/models/qwen3.8-27b-r3/model-card/bf16.md
- Detalle de linaje del artefacto: https://github.com/HangGlidersRule/model-forge/blob/main/models/qwen3.8-27b-r3/artifact-lineage.md
- Notas de ModelOpt: https://github.com/HangGlidersRule/model-forge/blob/main/models/qwen3.8-27b-r3/modelopt/README.md
- Modelo upstream Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
