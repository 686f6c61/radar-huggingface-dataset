# gittensor-model-hub/Qwen3.8-27B-NVFP4-RTX5090-No-MTP

## Resumen

Qwen3.8-27B-NVFP4-RTX5090-No-MTP es una variante del checkpoint cuantizado NVFP4 del modelo Qwen3.8-27B, desarrollado por gittensor-model-hub y optimizado para GPUs NVIDIA RTX 5090 (arquitectura Blackwell). Esta variante elimina los 15 tensores del cabezal MTP (Multi-Token Prediction) nativo del modelo padre, reduciendo el tamaño de descarga en 0,85 GB (de 20,59 GB a 19,74 GB) y el número de shards de 3 a 2. Los pesos del modelo objetivo son bit-idénticos al padre: misma cuantización NVFP4, misma calibración y mismo chat template; solo se han eliminado los tensores `mtp.*`.

El interés de esta variante radica en que, al eliminar el cabezal MTP, se pierde por completo la decodificación especulativa en vLLM (donde el MTP era la única vía), pero se mantiene la compatibilidad con el algoritmo DSpark de SGLang, que es más rápido y ligero que el MTP nativo. Está pensada para usuarios que usan exclusivamente SGLang con el drafter DSpark externo, o para aquellos que necesitan reducir el peso de descarga sin afectar a la memoria VRAM (los pesos en VRAM son idénticos: 18,80 GB). El modelo base Qwen3.8-27B es un LLM híbrido que intercala 24 capas de atención lineal Gated-DeltaNet con 8 capas de atención completa, con una ventana de contexto nativa de 262 144 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 24 capas Gated-DeltaNet (atención lineal) + 8 capas de atención completa (según hfviewer) |
| Parametros totales | 15.193.246.960 (según tensores safetensors; el nombre del modelo indica 27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (nativo) |
| Tipos de cuantizacion | NVFP4 (W4A4) mediante NVIDIA ModelOpt |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (2 shards) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un LLM de arquitectura híbrida que combina 24 capas con atención lineal Gated-DeltaNet y 8 capas con atención completa, lo que reduce el coste computacional frente a un transformer denso puro manteniendo capacidad de razonamiento de largo contexto. El checkpoint NVFP4 se obtiene mediante cuantización con NVIDIA Model Optimizer, que comprime los pesos del modelo original (53 GB en BF16) a 18,80 GB en VRAM, manteniendo la ventana de contexto completa de 262 144 tokens. La cuantización es W4A4 (pesos y activaciones en 4 bits) y se calibra específicamente para la familia RTX 5090.

Esta variante concreta elimina el cabezal MTP (Multi-Token Prediction) del modelo padre. El MTP es un módulo de decodificación especulativa que predice varios tokens por paso, pero sus pesos (en BF16) nunca fueron cuantizados y ocupan 5,53 GB. Al eliminarlos, el tamaño de descarga baja a 19,74 GB, aunque los pesos en VRAM no cambian porque el MTP se cargaba bajo demanda. La configuración se ajusta: `mtp_num_hidden_layers` pasa de 1 a 0, se eliminan los `exclude_modules` correspondientes y se re-exportan los shards. El resto (tokenizador, chat template, generación) se copia sin cambios del padre.

No se dispone de información sobre el entrenamiento original del modelo base (número de tokens, dataset, método de alineación) en la documentación proporcionada.

## Capacidades

- Generación de texto y razonamiento multi-step, con soporte de parser de razonamiento `qwen3` en SGLang y vLLM.
- Tool calling / function calling: compatible con los parsers `qwen3_coder` (SGLang) y `qwen3_xml` (vLLM), lo que permite integración con herramientas externas.
- Soporte de agentes: al combinar tool calling y razonamiento, puede usarse como motor de agentes autónomos.
- Decodificación especulativa: en SGLang, compatible con el drafter externo DSpark-NVFP4 v2 (que alcanza 155,8 tok/s con tasa de aceptación 2,886); en vLLM no hay especulación disponible en esta variante (el MTP fue eliminado).
- Multilingüismo: no documentado en la información disponible.
- Aunque el pipeline_tag de HuggingFace es `image-text-to-text`, la model card no documenta capacidades de visión; se trata de un modelo de texto.

## Casos de uso

- Asistente de programación en local: con 262K de contexto y tool calling, puede analizar repositorios completos, generar código y ejecutar comandos a través de herramientas, desplegado con SGLang en una RTX 5090.
- Razonamiento matemático y lógico: gracias al parser `qwen3` y al modo razonamiento, es adecuado para resolver problemas complejos de matemáticas o lógica en entornos educativos o de investigación.
- Automatización de tareas de oficina: mediante function calling, puede interactuar con APIs (calendarios, correos, hojas de cálculo) para gestionar flujos de trabajo, manteniendo contexto largo de conversación.
- Chat conversacional de largo alcance: su ventana de 262K tokens permite mantener conversaciones con historial extenso sin truncamiento, útil en atención al cliente o asistentes personales.
- Desarrollo de agentes autónomos: combinando razonamiento multi-step y tool calling, puede planificar y ejecutar secuencias de acciones (navegación web, consultas a bases de datos) en un solo entorno.
- Inferencia de bajo coste en hardware consumer: al ocupar solo 18,8 GB de VRAM, cabe en una RTX 5090 (32 GB) y permite ejecutar un modelo de 27B (nominal) en una estación de trabajo personal, sin necesidad de servidores multi-GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo proporciona métricas de decodificación especulativa:

| Drafter | Decode (tok/s) | Acceptance rate | Tamaño |
|---|---|---|---|
| DSpark-NVFP4 v2 (SGLang) | 155,8 | 2,886 | 1,41 GB |
| MTP nativo (padre, SGLang o vLLM) | 136,9 | 2,758 | 5,53 GB |
| Sin especulación | 81,6 | — | — |

## Requisitos de hardware

- VRAM para inferencia: 18,80 GB para los pesos (NVFP4) más overhead de KV cache y activaciones; la model card recomienda `--mem-fraction-static 0.90` en SGLang y `--gpu-memory-utilization 0.97` en vLLM.
- GPU recomendada: NVIDIA RTX 5090 (32 GB) u otras GPUs Blackwell con soporte NVFP4; no se garantiza funcionamiento en GPUs anteriores (Ampere, Ada) por la dependencia de la cuantización W4A4.
- No cabe en GPUs consumer de 16 GB o 24 GB si se quiere usar la ventana completa de 262K tokens; con contexto reducido podría intentarse en 24 GB, pero no está validado.
- Opciones de despliegue: SGLang (con o sin drafter DSpark) y vLLM (sin especulación). También es compatible con transformers para carga directa.
- Latencia/throughput: sin especulación, ~81,6 tok/s en RTX 5090; con DSpark en SGLang, ~155,8 tok/s. No se aportan cifras de latencia por request.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Especulación | Licencia |
|---|---|---|---|---|---|
| **Qwen3.8-27B-NVFP4-RTX5090-No-MTP** (esta variante) | 15,2B (checkpoint) | 262K | NVFP4 (W4A4) | Solo DSpark (SGLang) | Apache 2.0 |
| Qwen3.8-27B-NVFP4-RTX5090 (padre) | 15,2B (checkpoint) | 262K | NVFP4 (W4A4) | MTP (SGLang y vLLM) + DSpark | Apache 2.0 |
| Qwen3.8-27B (BF16 original) | 27B (nominal) | 262K | BF16 | No | Apache 2.0 |

La variante No-MTP se diferencia del padre únicamente en la ausencia del cabezal MTP, lo que la hace más ligera de descargar pero incompatible con vLLM para especulación. Frente al modelo BF16, la cuantización NVFP4 reduce el uso de VRAM de ~53 GB a ~18,8 GB, permitiendo su ejecución en una sola RTX 5090.

## Limitaciones y advertencias

- Esta variante elimina por completo la decodificación especulativa en vLLM; si se usa vLLM, el rendimiento cae a ~81,6 tok/s (sin especulación). Para vLLM se recomienda el modelo padre.
- No ahorra VRAM respecto al padre: los pesos en memoria son idénticos (18,80 GB); la reducción es solo en tamaño de descarga y almacenamiento.
- El número de parámetros del checkpoint (15,2B según safetensors) no coincide con el nombre comercial de 27B; se recomienda verificar la arquitectura real antes de usarlo en producción.
- No se han documentado capacidades multimodales a pesar del pipeline_tag `image-text-to-text`; no se debe asumir entrada de imágenes.
- La cuantización NVFP4 está optimizada para RTX 5090 (Blackwell); puede no funcionar correctamente en GPUs de generaciones anteriores.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones idiomáticas del modelo base.
- Aunque la licencia es Apache 2.0, se recomienda revisar la licencia del modelo base Qwen3.8-27B para uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gittensor-model-hub/Qwen3.8-27B-NVFP4-RTX5090-No-MTP
- Modelo padre (con MTP): https://huggingface.co/gittensor-model-hub/Qwen3.8-27B-NVFP4-RTX5090
- Drafter DSpark-NVFP4 v2: https://huggingface.co/gittensor-model-hub/Qwen3.8-27B-DSpark-NVFP4
- Descripción en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen3.8-27b-nvfp4-rtx5090-gittensor-model-hub
- Repositorio de despliegue Docker: https://github.com/devbauerflorian/qwen3.8-27b-rtx5090
- Ficha en LLM Explorer: https://llm-explorer.com/model/gittensor-model-hub%2FQwen3.8-27B-NVFP4-RTX5090,3GTDSJKETUAS2CtkUTm8Er
- Grafo de arquitectura en HF Viewer: https://hfviewer.com/gittensor-model-hub/Qwen3.8-27B-NVFP4-RTX5090
