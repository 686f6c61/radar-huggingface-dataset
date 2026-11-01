# axteam/GLM-4.7-Flash-NVFP4A16

## Resumen

GLM-4.7-Flash-NVFP4A16 es una cuantización de 4 bits del modelo zai-org/GLM-4.7-Flash, publicada por el equipo axteam. Se trata de un derivado de tipo W4A16 (pesos en FP4, activaciones en BF16) empaquetado en el formato `nvfp4-pack-quantized` de compressed-tensors, pensado específicamente para servir el modelo con vLLM. El objetivo es reducir el peso en disco y en memoria de aproximadamente 62 GB en BF16 a unos 18,9 GB, manteniendo las activaciones en BF16 para preservar la calidad de inferencia.

El modelo base es un transformer de mezcla de expertos (MoE) de la familia GLM-4.7 Lite (`Glm4MoeLite`), con 31.221.488.576 parámetros totales y una ventana de contexto de 202K tokens. Es un modelo solo de texto, con modo de razonamiento (thinking) activado por defecto en la plantilla de chat. La cuantización es post-entrenamiento (PTQ), sin calibración ni reentrenamiento, y conserva en BF16 los embeddings, la cabeza LM, todas las RMSNorm y el router MoE.

La relevancia de esta ficha es práctica: permite desplegar un MoE de 31B con contexto muy largo en GPUs de consumo o en nodos con menos VRAM, siempre que se use vLLM 0.15.0 o superior. Es importante señalar que la revisión del 31 de octubre de 2026 corrigió un fallo de escalas globales compartidas que corrompía el texto generado en la primera subida; cualquiera que haya descargado el repositorio antes debe volver a descargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`Glm4MoeLite`, GLM-4.7 Lite) |
| Parametros totales | 31.221.488.576 (31,2B) |
| Parametros activos | no disponible |
| Longitud de contexto | 202K tokens (el ejemplo de servicio usa 32768) |
| Tipos de cuantizacion | NVFP4A16 (W4A16): pesos FP4 E2M1, grupo 16, escala FP8; activaciones BF16; formato compressed-tensors `nvfp4-pack-quantized` |
| Idiomas soportados | no disponible (modelo solo de texto; el ejemplo de la model card usa coreano) |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors), ~18,9 GB en disco; repo de 37,9 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos de la familia GLM-4.7 Lite, identificado en la model card como `Glm4MoeLite`. La cuantización afecta únicamente a las proyecciones lineales de atención y MLP; se mantienen en BF16 los embeddings de tokens, la cabeza LM, todas las RMSNorm y el router MoE (`mlp.gate`, incluido `e_score_correction_bias`). La capa MTP (`model.layers.47`: `eh_proj`, `shared_head.head`) sí se cuantiza como el resto. La atención usa MLA (Multi-head Latent Attention), ya que la model card menciona las proyecciones `q_a_proj` y `kv_a_proj_with_mqa`.

La cuantización es post-entrenamiento, sin calibración ni reentrenamiento: los factores de escala se calculan a partir de los pesos con un procedimiento `model_free_ptq` basado en nombres de módulos, y el redondeo es RTN. Las escalas globales FP4 se comparten entre los pares que vLLM fusiona en un único GEMM: `q_a_proj` + `kv_a_proj_with_mqa` en MLA, y `gate_proj` + `up_proj` en cada experto enrutado y compartido. Esta decisión de diseño es la que se corrigió en la revisión del 31 de octubre de 2026. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento en modo thinking, activado por defecto en la plantilla de chat; se puede desactivar con `chat_template_kwargs={"enable_thinking": False}`.
- Modelo solo de texto: no se documentan capacidades de visión ni de audio.
- Conversación multi-turno con contexto largo de hasta 202K tokens.
- Compatibilidad con el endpoint OpenAI de vLLM (`/v1/chat/completions`), lo que facilita integrarlo en aplicaciones existentes.
- Capacidades multilingües: no documentadas explícitamente; el ejemplo de la model card está en coreano.
- Tool calling y function calling: no documentados en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente, aunque el modo thinking está orientado a razonamiento.
- Temperatura de muestreo recomendada: 1.0, según el `generation_config.json` original.

## Casos de uso

- Servicio de chat con contexto largo: con 202K tokens de ventana, el modelo puede mantener conversaciones con documentos extensos o historiales largos; la cuantización reduce el peso a 18,9 GB y deja más VRAM para la caché KV.
- Despliegue en GPUs de consumo o nodos pequeños: al no requerir núcleos tensor FP4 (solo pesos FP4), funciona en NVIDIA Turing (sm75) o superior, lo que amplía el parque de GPUs compatible frente a cuantizaciones que exigen hardware específico.
- Backend de API compatible con OpenAI: `vllm serve` levanta un servidor `/v1/chat/completions`, adecuado para integrarlo en aplicaciones existentes sin cambiar el cliente.
- Procesamiento por lotes offline: la API `LLM` de vLLM permite generar respuestas en lote con `SamplingParams`, útil para clasificación, resumen o extracción sobre grandes volúmenes de texto.
- Razonamiento con modo thinking: para tareas que requieren cadenas de razonamiento largas, se activa el modo thinking (por defecto) y se controla la longitud con `max_tokens`.
- Servicio con contexto muy largo y baja memoria de caché KV: combinando `--kv-cache-dtype fp8` con la cuantización W4A16 se reduce aproximadamente a la mitad la memoria de la caché KV, lo que permite más peticiones concurrentes o contextos más largos.
- Despliegue multi-GPU: con `--tensor-parallel-size N` se reparte el modelo entre varias GPUs cuando los 18,9 GB de pesos no caben en una sola.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 18,9 GB solo para pesos; hay que sumar la caché KV (crece con la longitud de contexto y el número de peticiones concurrentes) y unos pocos GB para activaciones y grafos CUDA.
- GPU recomendadas: NVIDIA Turing (sm75) o superior. La model card indica que solo se probó en B200; V100 (sm70) no es compatible.
- GPU de consumo: al no necesitar núcleos tensor FP4, el límite es la memoria; con 18,9 GB de pesos, una GPU de 24 GB puede alojar el modelo con contexto moderado, y una de 32 GB o más deja margen para caché KV.
- Despliegue: vLLM 0.15.0 o superior (probado con 0.32.0). Requiere Python 3.11–3.14, torch 2.13 (build CUDA 13.0 y driver con soporte CUDA 13), transformers ≥5.16.1,<5.20 y compressed-tensors 0.17.0 (fijado por vLLM; no actualizar por separado).
- Transformers sin vLLM: no carga correctamente (comprobado hasta 5.22.1).
- `trust_remote_code`: no necesario.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Runtime |
|---|---|---|---|---|---|
| axteam/GLM-4.7-Flash-NVFP4A16 | 31,2B (MoE) | 202K | NVFP4A16 (W4A16) | MIT | vLLM ≥0.15.0 |
| zai-org/GLM-4.7-Flash (base) | 31,2B (MoE) | 202K | BF16 | MIT | transformers / vLLM |
| Otras cuantizaciones del mismo base | 31,2B (MoE) | 202K | no disponible | MIT | depende del formato |

No se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- La primera subida del repositorio (31 de octubre de 2026) tenía escalas globales separadas en los pares que vLLM fusiona, lo que producía texto corrupto; los pesos se volvieron a cuantizar. Si se descargó antes de la corrección, hay que volver a descargar.
- No es cargable correctamente con Transformers (comprobado hasta 5.22.1); el único runtime soportado es vLLM.
- Requiere vLLM 0.15.0 o superior y las versiones fijadas de transformers y compressed-tensors; actualizar compressed-tensors por separado puede romper la carga.
- V100 (sm70) no es compatible.
- La cuantización es PTQ sin calibración (RTN), por lo que puede haber una pérdida de calidad frente al modelo en BF16; no se publican métricas que la cuantifiquen.
- La caché KV se mantiene en BF16 por defecto; en contextos largos o con muchos lotes conviene usar `--kv-cache-dtype fp8`.
- Sesgos conocidos: no documentados.
- Riesgo de alucinación: no documentado, pero es inherente a los modelos generativos; conviene validar las salidas en producción.
- Idiomas soportados: no documentados explícitamente.
- Licencia MIT: permite uso comercial, pero se debe conservar el aviso de copyright y el modelo base también es MIT.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/axteam/GLM-4.7-Flash-NVFP4A16
- Modelo base: https://huggingface.co/zai-org/GLM-4.7-Flash
