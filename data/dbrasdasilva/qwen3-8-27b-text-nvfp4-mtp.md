# dbrasdasilva/Qwen3.8-27B-Text-NVFP4-MTP

## Resumen

Qwen3.8-27B-Text-NVFP4-MTP es una compilación experimental del modelo Qwen/Qwen3.8-27B publicada por el usuario dbrasdasilva en Hugging Face. Se trata de una cuantización NVFP4 (formato de 4 bits de NVIDIA) del modelo base, con la torre de visión eliminada físicamente y la cabeza MTP (multi-token prediction) reinsertada en bf16 para habilitar decodificación especulativa en vLLM. El objetivo declarado del autor es responder una pregunta concreta: en una GPU Blackwell de 32 GB (RTX 5090), ¿eliminar la torre de visión aporta más contexto o más velocidad? La conclusión publicada es que no: solo reduce el tamaño de descarga, no el consumo en tiempo de ejecución, porque vLLM ya omite esa torre al cargar con `--language-model-only`.

El modelo deriva de la familia Qwen3.5 (tag `qwen3_5` en transformers) y conserva las capacidades de generación de texto y conversación del original, con soporte para once idiomas. Los pesos reales en safetensors suman 15.145.419.776 parámetros (aproximadamente 15,1 mil millones), aunque el nombre comercial del base es "27B"; esta discrepancia es habitual en modelos con cabezas adicionales o nomenclatura comercial. El repositorio ocupa 19,7 GB.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de cuantización NVFP4 con `nvidia-modelopt` y decodificación especulativa MTP sobre hardware Blackwell; por otro, el propio autor advierte de que existen sucesores mejores (variantes que conservan visión y MTP, con escalas de KV-cache FP8 calibradas) y de que en GPUs de 96 GB el compromiso central desaparece. Es, por tanto, un artefacto de reproducibilidad más que una recomendación de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5 (`Qwen3_5ForCausalLM`), con torre de visión eliminada y cabeza MTP en bf16 |
| Parametros totales | 15.145.419.776 (según safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens nativos según la model card; en la práctica ~200K en RTX 5090 de 32 GB con MTP y `VLLM_MEMORY_PROFILER_ESTIMATE_CUDAGRAPHS=0`, ~185-188K sin esa variable |
| Tipos de cuantizacion | NVFP4 (grupo de 16) para pesos lineales; bf16 para `lm_head`, `*linear_attn.conv1d*`, `mtp.*`; KV-cache en fp8 |
| Idiomas soportados | en, zh, ja, ko, fr, de, es, it, pt, ru, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, formato `modelopt` (compatible con transformers y vLLM) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B pertenece a la familia Qwen3.5 y se implementa en transformers como `Qwen3_5ForCausalLM`. La compilación aquí descrita no entrena el modelo: parte de los pesos bf16 del base y aplica cuantización NVFP4 con `nvidia-modelopt` 0.43.0 usando `NVFP4_DEFAULT_CFG` con `group_size` 16. Se mantienen en bf16 el `lm_head`, las convoluciones `linear_attn.conv1d` y los tensores `mtp.*`; después se eliminan físicamente los tensores de visión (`model.visual.*`) y se reinsertan los 15 tensores bf16 de la cabeza MTP (unos 849 MB) para que la decodificación especulativa de vLLM se active.

La innovación técnica principal es la combinación de cuantización NVFP4 de 4 bits con decodificación especulativa mediante MTP sobre el camino nativo NVFP4 de Blackwell (SM120). El autor documenta además un detalle relevante para quien cuantice esta arquitectura: si se cuantiza `lm_head` pero se deja listado en `quantization_config.ignore`, el modelo no carga (`ValueError: There is no module or parameter named 'lm_head.input_scale'`); la configuración debe reflejar fielmente qué pesos están cuantizados. No se proporcionan datos sobre el número de tokens de entrenamiento, composición del dataset ni fases de RLHF/DPO del modelo base en la información disponible.

## Capacidades

- Generación de texto y conversación multi-turno, con pipeline `text-generation`.
- Razonamiento y respuesta a instrucciones heredados del modelo base Qwen3.8-27B.
- Decodificación especulativa mediante cabeza MTP reinsertada en bf16, con ganancia medida de aproximadamente 1,6× en velocidad de decodificación.
- Soporte multilingüe en once idiomas: inglés, chino, japonés, coreano, francés, alemán, español, italiano, portugués, ruso y árabe.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- Capacidad de visión: eliminada en esta compilación (solo texto). Las variantes sucesoras del mismo autor sí la conservan.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Reproducción de experimentos de cuantización NVFP4: sirve para replicar el flujo `nvidia-modelopt` 0.43.0 sobre Qwen3.8-27B y verificar los límites de KV-cache en una RTX 5090 de 32 GB, tal como documenta el autor.
- Despliegue de texto puro en GPU Blackwell de 32 GB: con vLLM 0.27.2 o superior, `--language-model-only` y MTP activo, se obtienen ~200K tokens de contexto y 130-140 tok/s de decodificación, adecuado para asistentes conversacionales de contexto largo en una sola tarjeta consumer.
- Evaluación de decodificación especulativa MTP: el repositorio permite comparar MTP activado frente a desactivado (125-135 tok/s frente a ~77 tok/s con visión) y medir el coste en contexto de cada configuración.
- Servicio de chat multilingüe: los once idiomas soportados permiten atender usuarios en español, inglés, chino, árabe, etc., con un único checkpoint cuantizado de ~20 GB.
- Prototipado en estaciones de trabajo con una sola RTX 5090: al ocupar menos espacio de descarga que las variantes con visión, es útil en entornos con ancho de banda limitado o almacenamiento restringido.
- Validación de compatibilidad de configuraciones de cuantización: el caso documentado del `lm_head` en `quantization_config.ignore` sirve como prueba de regresión para pipelines de cuantización propios.
- Base para comparativas de rendimiento en 96 GB: el autor publica métricas de KV-cache de esta y otras variantes en RTX PRO 6000 Blackwell, útiles para dimensionar despliegues de mayor capacidad.

## Benchmarks y rendimiento

Los datos disponibles son mediciones de serving en vLLM 0.27.2 sobre una RTX 5090 de 32 GB compartida con el escritorio (~2 GB retenidos por el compositor), con `--gpu-memory-utilization 0.93`, KV-cache fp8 y `--max-num-seqs 1`. No son benchmarks académicos (MMLU, HumanEval, GSM8K) y no se han publicado resultados de ese tipo en la información disponible.

| Modo de servicio (build multimodal salvo indicación) | Visión | Contexto máximo | Decodificación (tok/s) |
|---|---|---|---|
| visión on, MTP off | sí | ~199K | ~77 |
| visión on, MTP on | sí | ~123K | ~125-135 |
| `--language-model-only`, MTP on (texto) | no | ~200K | ~130-140 |
| este build text-only, `--language-model-only`, MTP | no | ~200K | ~130-140 |

Todas las cifras de ~200K/199K dependen de `VLLM_MEMORY_PROFILER_ESTIMATE_CUDAGRAPHS=0`; sin esa variable el techo baja a ~185-188K. En una RTX PRO 6000 Blackwell de 96 GB con vLLM 0.30.0, visión on, MTP on, `--max-model-len 262144`, `--kv-cache-dtype fp8` y `--gpu-memory-utilization 0.95`, el autor reporta estos techos de KV-cache (no son tok/s):

| Checkpoint | Pesos | KV cache | Concurrencia a 262K |
|---|---|---|---|
| Qwen3.8-27B-NVFP4-MTP (FP8/NVFP4 mixto) | 24 GB | 1.796.931 tokens | 6,85× |
| Qwen3.8-27B-FP8-MTP | 30 GB | 1.622.656 tokens | 6,19× |
| unsloth/Qwen3.8-27B-NVFP4 | 22 GB | 1.820.363 tokens | 6,94× |
| nvidia/Qwen3.8-27B-NVFP4 | 20 GB | 2.118.244 tokens | 8,08× |

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 19,7 GB en disco; el autor lo ejecuta en una RTX 5090 de 32 GB con `--gpu-memory-utilization 0.93`, lo que deja espacio para KV-cache fp8 y grafos CUDA.
- GPU recomendadas: NVIDIA Blackwell (SM120) para el camino nativo NVFP4; el autor valida RTX 5090 (32 GB) y RTX PRO 6000 Blackwell (96 GB).
- Cabe en GPU consumer: sí, en RTX 5090 de 32 GB; en tarjetas de 24 GB no hay datos publicados y el margen sería muy ajustado.
- Opciones de despliegue: vLLM 0.27.2 o superior (se requiere el fix de gated-delta-net de ≥0.27.2, ya que versiones anteriores fallan con MTP en contexto largo); formato `modelopt`; compatible con transformers. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~130-140 tok/s de decodificación en texto con MTP; ~77 tok/s con MTP desactivado; un prompt con imagen no ralentiza la decodificación porque el codificador de visión se ejecuta una sola vez en prefill (~133 tok/s medidos con imagen).
- Nota: las cifras son conservadoras por tratarse de una tarjeta compartida con el escritorio; una GPU dedicada exclusivamente a inferencia libera ~2 GB y mejora los techos de contexto.

## Comparativa con modelos similares

| Modelo | Pesos | Visión | MTP | KV-cache FP8 calibrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| dbrasdasilva/Qwen3.8-27B-Text-NVFP4-MTP (este) | 19,7 GB repo | no | sí (bf16) | no | Apache 2.0 | Hugging Face |
| dbrasdasilva/Qwen3.8-27B-NVFP4-MTP | 24 GB | sí | sí | sí | no disponible | Hugging Face |
| dbrasdasilva/Qwen3.8-27B-FP8-MTP | 30 GB | sí | sí | sí | no disponible | Hugging Face |
| unsloth/Qwen3.8-27B-NVFP4 | 22 GB | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| nvidia/Qwen3.8-27B-NVFP4 | 20 GB | no disponible | no disponible | no disponible | no disponible | Hugging Face |

En la comparativa de KV-cache a 262K en 96 GB, `nvidia/Qwen3.8-27B-NVFP4` alcanza 2.118.244 tokens (8,08× de concurrencia), por encima de este build y de las variantes de dbrasdasilva. El autor recomienda, para 32 GB, usar el build multimodal completo en lugar de este, ya que el modo texto puro con `--language-model-only` es idéntico y permite alternar MTP según necesidad.

## Limitaciones y advertencias

- Es un experimento de reproducibilidad, no un checkpoint recomendado para producción; el propio autor sugiere usar las variantes con visión y escalas de KV-cache calibradas.
- Sin escalas `k_scale`/`v_scale` calibradas: `--kv-cache-dtype fp8` opera a escala 1.0 y pierde precisión de forma silenciosa (vLLM lo registra en el log, fácil de pasar por alto).
- La torre de visión está eliminada físicamente: no admite entrada de imágenes, a diferencia del modelo base y de los sucesores.
- La cuantización NVFP4 de 4 bits puede degradar la calidad frente al bf16 original; no se publican evaluaciones de calidad en la información disponible.
- Riesgo de alucinación y sesgos del modelo base: no documentados en la información proporcionada.
- Requiere hardware Blackwell (SM120) para el camino NVFP4 nativo y vLLM ≥0.27.2; versiones anteriores fallan con MTP en contexto largo.
- Los techos de contexto de ~200K dependen de variables de entorno concretas (`VLLM_MEMORY_PROFILER_ESTIMATE_CUDAGRAPHS=0`) y de una GPU dedicada; en configuraciones por defecto bajan a ~185-188K.
- Licencia Apache 2.0 permite uso comercial, pero las condiciones de los pesos derivados de Qwen deben verificarse en el repositorio del modelo base.
- El nombre "27B" no coincide con los 15,1 mil millones de parámetros reales en safetensors; conviene validar el recuento antes de dimensionar hardware.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dbrasdasilva/Qwen3.8-27B-Text-NVFP4-MTP
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Sucesor mixto FP8/NVFP4 con visión y MTP: https://huggingface.co/dbrasdasilva/Qwen3.8-27B-NVFP4-MTP
- Sucesor FP8 con visión y MTP: https://huggingface.co/dbrasdasilva/Qwen3.8-27B-FP8-MTP
- Cuantización NVFP4 de unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4
- Cuantización NVFP4 de NVIDIA: https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4
- nvidia-modelopt: no disponible en la información proporcionada
- Paper, blog o demo adicionales: no disponible en la información proporcionada
