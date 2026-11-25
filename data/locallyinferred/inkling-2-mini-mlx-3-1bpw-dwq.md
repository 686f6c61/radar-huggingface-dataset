# LocallyInferred/Inkling-2-Mini-MLX-3.1bpw-DWQ

## Resumen

Inkling-2-Mini-MLX-3.1bpw-DWQ es una cuantizacion personalizada en formato MLX del modelo thinkingmachines/Inkling-2-Mini, publicada por el usuario LocallyInferred. El modelo base es un transformer MoE multimodal (texto e imagen) de 26.388.559.360 parametros totales con 3.400 millones de parametros activos, organizado en tres pasadas de bucle (3x looped MoE) y con soporte nativo de vision. Esta version reduce el checkpoint nativo de 19,57 GB a 10,23 GB (9,53 GiB, 3,102 BPW) mediante una receta de precision mixta guiada por perfilado de sensibilidad y una etapa de Distilled Weight Quantization (DWQ).

El objetivo declarado es ejecutar el modelo con contexto largo utilizable en Macs Apple Silicon de 16 GB de memoria unificada, preservando las capacidades de tool calling agentico, razonamiento, chat/escritura y vision del modelo original. La torre de vision se mantiene intacta en bfloat16 (636 MB), y las proyecciones de atencion, routers MoE, gates de mensaje y normas se conservan en 8 bits, 6 bits o precision nativa segun su sensibilidad medida.

Es relevante ahora porque demuestra una metodologia de cuantizacion especifica por arquitectura (no uniforme) para un MoE multimodal con bucles, con evaluacion cuantitativa de divergencia KL frente al checkpoint nativo y con mejoras medibles tras el proceso DWQ. La licencia Apache 2.0 del modelo base facilita su uso comercial, aunque esta publicacion concreta es un artefacto derivado de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (texto + vision) con 3 pasadas de bucle (3x looped MoE) |
| Parametros totales | 26.388.559.360 |
| Parametros activos | 3.400 millones (aproximado, segun model card) |
| Longitud de contexto | No disponible de forma explicita; la model card documenta consumo de KV cache hasta 16.384 tokens; ratio sliding-window/full-attention 5:1 con solo 4 capas de atencion completa |
| Tipos de cuantizacion | Precision mixta: bf16, fp32, 8-bit g64, 6-bit g64, 4-bit g64, 3-bit g64 y 2-bit g64; media de 3,102 BPW; group_size=64 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria mlx) |
| Tamano del repo | 10,3 GB (10,23 GB / 9,53 GiB en pesos) |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos (MoE) multimodal con un mecanismo de bucle: los bloques se ejecutan tres veces, con gates de mensaje, routers MoE, residuales de atencion por bloque y normas mantenidos en fp32 o bf16 para preservar la estabilidad del enrutamiento y de las pasadas cruzadas. La atencion combina ventanas deslizantes con atencion completa en una proporcion 5:1 (solo 4 capas de atencion completa), lo que reduce el crecimiento del KV cache. Incluye una torre de vision de 318 millones de parametros y proyecciones especificas (sink_proj, sconv.weight_proj) identificadas como extremadamente sensibles por parametro.

El proceso de cuantizacion parte de un perfilado de sensibilidad por divergencia KL con 128 muestras sobre el checkpoint nativo sin empaquetar, seguido de una comparativa de cuatro recetas previas al DWQ. La receta final asigna: bf16 intacto a la torre de vision y a las proyecciones de alta sensibilidad; 8-bit a las proyecciones v, k, r y o de las 24 capas; 6-bit a q, gate_proj y lm_head; 4-bit a embed_tokens; 3-bit a los 10 down_proj y 2 gate_up_proj de expertos MoE mas sensibles; y 2-bit a los 36 tensores de expertos restantes. La etapa DWQ se realizo sobre 2.048 muestras (aproximadamente 1,57 millones de tokens, secuencias de hasta 1.024 tokens) con una mezcla del 50% general/codigo/matematicas (tulu-3-sft-mixture), 25% tool calling con plantilla nativa (hermes-function-calling-v1) y 25% escritura/chat (ultrachat_200k).

## Capacidades

- Generacion de texto conversacional y escritura.
- Razonamiento y resolucion de problemas de codigo y matematicas.
- Tool calling / function calling agentico, con evaluacion especifica de divergencia KL en esta tarea.
- Razonamiento multi-paso orientado a agentes.
- Vision: comprension de imagenes y texto combinados (pipeline image-text-to-text), con la torre de vision preservada en bfloat16.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo de razonamiento explicito (thinking): no confirmado en la informacion disponible.

## Casos de uso

- Asistente local en Mac de 16 GB: el modelo ocupa 9,53 GiB en RAM, por lo que puede ejecutarse junto al sistema operativo y aplicaciones en un MacBook con memoria unificada de 16 GB, manteniendo contexto utilizable de varios miles de tokens.
- Automatizacion de tool calling en local: la receta DWQ reduce la divergencia KL en tool calling un 60,3% respecto a la version pre-DWQ, lo que lo hace adecuado para agentes que invocan funciones y APIs en entornos sin GPU dedicada.
- Analisis de capturas de pantalla y documentos visuales: con la torre de vision intacta, permite resumir notificaciones, extraer datos de imagenes o interpretar interfaces mediante el flag --image de mlx-lm.
- Prototipado de agentes multi-paso en Apple Silicon: el bajo coste de KV cache (solo +0,72 GB a 16.384 tokens) permite mantener conversaciones y trayectorias de agente largas sin agotar memoria.
- Generacion de codigo asistida en el portatil: el modelo conserva capacidades de codigo y matematicas segun la mezcla de curacion DWQ (50% general/codigo/matematicas), util para autocompletado y explicacion de fragmentos en local.
- Chat y escritura en local con privacidad: al ejecutarse integramente en el dispositivo, permite procesar conversaciones y textos sin enviar datos a servicios externos.
- Evaluacion e investigacion de tecnicas de cuantizacion: el repositorio documenta recetas, perfilado de sensibilidad y metricas de divergencia, lo que lo convierte en referencia para estudiar cuantizacion mixta en MoE multimodales.

## Benchmarks y rendimiento

La model card no publica benchmarks estandar (MMLU, HumanEval, GSM8K). Proporciona evaluacion de fidelidad frente al checkpoint nativo mediante divergencia KL y acuerdo de tokens sobre 128 secuencias no vistas (hasta 1.024 tokens) y 100.208 tokens no vistos.

| Modelo | Tamano | KL global ↓ | KL tool calling ↓ | KL escritura/chat ↓ | KL general/codigo/mates ↓ |
|---|---|---|---|---|---|
| Profesor nativo (NVFP4/MXFP8) | 19,57 GB (18,22 GiB) | 0,0000 | 0,0000 | 0,0000 | 0,0000 |
| Precision mixta pre-DWQ (Receta A) | 10,23 GB (9,53 GiB) | 0,3677 | 0,5618 | 0,3109 | 0,2836 |
| Post-DWQ (este modelo) | 10,23 GB (9,53 GiB) | 0,1835 (-50,1%) | 0,2232 (-60,3%) | 0,1791 (-42,4%) | 0,1614 (-43,1%) |

| Modelo | Top-1 global ↑ | Top-1 tool ↑ | Top-1 chat ↑ | Top-1 general/codigo ↑ | Top-5 global ↑ | Top-1 alta confianza (≥80%) ↑ |
|---|---|---|---|---|---|---|
| Pre-DWQ (Receta A) | 83,46% | 82,77% | 80,92% | 85,59% | 96,43% | 97,76% |
| Post-DWQ (este modelo) | 87,29% | 87,49% | 85,00% | 88,70% | 98,20% | 98,89% |

## Requisitos de hardware

- VRAM/RAM estimada: 10,23 GB (9,53 GiB) solo pesos; 10,31 GB a 128 tokens; 10,55 GB a 4.096 tokens; 10,69 GB a 8.192 tokens; 10,95 GB a 16.384 tokens.
- Objetivo de diseno: Macs Apple Silicon con 16 GB de memoria unificada.
- GPU recomendadas: no aplica directamente, ya que el formato MLX esta pensado para Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No se documenta soporte para CUDA ni ROCm.
- Cabe en GPU consumer: si, en equipos Apple Silicon de 16 GB o mas; no se confirma en GPUs NVIDIA consumer por el formato MLX.
- Despliegue: mlx-lm (soporte en PR #2086 o versiones posteriores). No se documentan opciones vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Rendimiento: no se publican cifras de latencia ni throughput. Se recomienda --prefill-step-size 256 o 512 para mantener bajo el consumo transitorio durante el prefill de prompts largos.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Tamano en disco | Licencia | Formato |
|---|---|---|---|---|---|---|
| Este modelo (Inkling-2-Mini MLX 3.1bpw DWQ) | 26,4B | 3,4B | No disponible (evaluado hasta 16.384 tokens de KV) | 10,23 GB | Apache 2.0 | safetensors MLX |
| thinkingmachines/Inkling-2-Mini (nativo) | 26,4B | 3,4B | No disponible | 19,57 GB | Apache 2.0 | NVFP4 / MXFP8 |
| Precision mixta pre-DWQ (Receta A) | 26,4B | 3,4B | No disponible | 10,23 GB | Apache 2.0 | safetensors MLX |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Artefacto de comunidad: no es una publicacion oficial de thinkingmachines; la calidad depende de la receta y del proceso DWQ descritos por LocallyInferred.
- Requiere una version de mlx-lm con soporte para Inkling 2 Mini (PR #2086 o posterior); versiones anteriores pueden no cargar el modelo.
- La evaluacion de fidelidad se limita a secuencias de hasta 1.024 tokens y 128 muestras; el comportamiento con contextos mucho mas largos no esta medido.
- La cuantizacion a 2-bit en 36 tensores de expertos MoE introduce perdida respecto al modelo nativo (KL global de 0,1835 frente a 0,0000), con mayor impacto potencial en tareas fuera de la distribucion de curacion.
- No se documentan sesgos conocidos, riesgos de alucinacion especificos ni idiomas soportados; deben asumirse los del modelo base, no verificados aqui.
- Licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones del modelo base y de los datasets de curacion.
- El formato MLX limita el despliegue a hardware Apple Silicon; no es portable a CUDA sin conversion adicional.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validacion independiente por parte de la comunidad.
- En Macs de 16 GB, el prefill de prompts largos puede requerir ajustar --prefill-step-size para evitar picos de memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LocallyInferred/Inkling-2-Mini-MLX-3.1bpw-DWQ
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- PR de mlx-lm con soporte para Inkling 2 Mini: https://github.com/ml-explore/mlx-lm/pull/2086
- Repositorio mlx-lm: https://github.com/ml-explore/mlx-lm
