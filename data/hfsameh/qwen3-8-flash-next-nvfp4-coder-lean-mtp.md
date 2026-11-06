# hfsameh/Qwen3.8-Flash-Next-NVFP4-Coder-Lean-MTP

## Resumen

Qwen3.8-Flash-Next-NVFP4-Coder-Lean-MTP es un checkpoint derivado de la familia Qwen3.8-Flash-Next en formato NVFP4, publicado por el usuario hfsameh. Se trata de una reconstruccion tecnica: parte del repack "Coder-Lean" de elisepaul, que elimino la tabla PLE (51 GB) y las torres de vision para que el modelo cupiera en un DGX Spark, pero que tambien habia eliminado la cabeza de prediccion multi-token (MTP) y habia desquantizado las lineales densas de MXFP8 a BF16. Este repositorio restaura unicamente la cabeza MTP, lo que permite servir el modelo con decodificacion especulativa.

El modelo es un MoE de aproximadamente 67.170 millones de parametros totales, con pesos en NVFP4 para los expertos y BF16 para las lineales densas, orientado a generacion de codigo y uso de herramientas. La relevancia practica es inmediata: sin MTP el checkpoint decodifica a 19,3 tok/s en una GB10; con la cabeza MTP restaurada y decodificacion especulativa de profundidad 4 alcanza 59,9 tok/s, con una longitud de aceptacion de 4,23 a 4,70 tokens por paso. El prefill se mantiene en 2,35 k tok/s.

No es un modelo nuevo ni un entrenamiento: es un injerto de 4.637 tensores MTP (512 expertos con gate/up/down, 1,60 GB) procedentes de nvidia/Qwen3.8-Flash-Next-NVFP4, mas dos entradas de configuracion que declaran la cuantizacion W4A16_NVFP4 de los expertos MTP. Su interes esta en el despliegue en hardware de una sola maquina con memoria unificada, no en capacidades nuevas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrido con atencion lineal GDN (Gated DeltaNet) y atencion completa; cabeza MTP para decodificacion especulativa |
| Parametros totales | 67.169.742.739 (~67,17 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (segun configuracion de servicio documentada) |
| Tipos de cuantizacion | NVFP4 (W4A16, group size 16) en expertos; BF16 en lineales densas (linear_attn, self_attn, shared_expert); MXFP8 en el modelo original de NVIDIA |
| Idiomas soportados | en, zh, code |
| Licencia | NVIDIA Open Model License (nvidia-open-model-license) |
| Formato de pesos | safetensors (con model.safetensors.index.json y mtp-graft.safetensors) |

## Arquitectura y entrenamiento

La arquitectura es un MoE hibrido: combina capas de atencion lineal GDN con capas de atencion completa y una capa de mezcla de expertos con 512 expertos por capa en la cabeza MTP. El checkpoint incluye una cabeza de prediccion multi-token (MTP) que actua como modelo borrador para decodificacion especulativa; el modelo verificador es el propio modelo completo, de modo que la distribucion de salida no cambia, solo la velocidad. La cuantizacion NVFP4 de los expertos usa weight + weight_scale + weight_scale_2, con grupo de 16 y algoritmo W4A16_NVFP4.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en la informacion proporcionada; esos datos corresponden al modelo original de NVIDIA y no se detallan en esta ficha. La innovacion tecnica documentada es doble: por un lado, el injerto de los tensores MTP ya cuantizados en NVFP4 (copia, no recuantizacion) y la declaracion explicita de la cuantizacion de los expertos MTP en config.json y hf_quant_config.json, sin la cual vLLM construye los expertos sin cuantizar y falla con el error `no parameter 'w2_weight_scale'`. Por otro, el analisis del autor sobre el cacheo de prefijos en arquitecturas hibridas: el estado recurrente solo se checkpointea en los limites de chunk de `max_num_batched_tokens`, por lo que el tamano de chunk determina la tasa de acierto en prompts incrementales.

## Capacidades

- Generacion de codigo y texto tecnico en ingles, chino y lenguajes de programacion.
- Razonamiento multi-paso y uso de herramientas (tool calling / function calling), con argumentos en JSON valido.
- Seleccion de herramientas en escenarios de agente: 13/16 aciertos (86,5%) en el checkpoint autoregresivo y 13/15 (86,7%) con MTP.
- Precision en parametros de llamadas a herramienta: 86,5% en AR y 92,2% con MTP.
- Generacion de argumentos JSON validos: 21/21 en AR y 18/18 con MTP.
- Decodificacion especulativa con profundidad 4 (MTPN=4) y longitud de aceptacion de 4,23 a 4,70 tokens.
- Soporte de contexto largo: hasta 262.144 tokens con KV cache de 2,59x con GMU 0,82.
- No incluye torres de vision ni tabla PLE (eliminadas en el repack Lean).
- Capacidades multilingues limitadas a ingles, chino y codigo.

## Casos de uso

- Agentes de codigo en produccion sobre una sola maquina: el modelo puede ejecutar bucles de agente con llamadas a herramientas y generaciones de 400 a 800 tokens, donde la decodificacion especulativa aporta ganancias de 2,2x a 2,5x frente al checkpoint sin MTP.
- Asistentes de edicion de codigo con contexto de repositorio: con 262.144 tokens de contexto y cacheo de prefijos ajustado a chunks de 1024 tokens, un turno de agente con prompt de ~22k tokens y 300 tokens anadidos se resuelve en 1,09 s con 92,5% de acierto de prefijo.
- Automatizacion de tareas de refactorizacion y generacion de tests: el modelo produce argumentos JSON validos de forma consistente (18/18), lo que permite integrarlo en pipelines que consumen salidas estructuradas.
- Servicio de atencion al desarrollador con tool calling: la precision del 92,2% en parametros de llamada lo hace adecuado para invocar APIs internas y funciones de busqueda de codigo con validacion estricta.
- Despliegue en DGX Spark (GB10) para equipos pequenos: el checkpoint completo ocupa ~81 GB y cabe en 128 GB de memoria unificada, con throughput de 59,9 tok/s en decodificacion.
- Procesamiento de documentacion tecnica bilingue (en/zh): util para equipos con documentacion en chino e ingles que necesitan resumenes y extraccion de codigo.
- Evaluacion de tecnicas de decodificacion especulativa: el repositorio documenta acceptance length, tasas de acierto de prefijo y configuracion de vLLM, lo que lo convierte en una referencia para experimentar con MTP en arquitecturas hibridas.

## Benchmarks y rendimiento

Mediciones del autor en un DGX Spark (GB10, 128 GB de memoria unificada):

| Metrica | Coder-Lean (AR) | Este repo (MTP-4) |
|---|---|---|
| Decodificacion | 19,3 tok/s | 59,9 tok/s |
| Longitud de aceptacion | no aplica | 4,23 - 4,70 de profundidad 4 |
| Prefill | 2,35 k tok/s | 2,35 k tok/s |
| KV a 262.144 de contexto | 2,49x (GMU 0,75) | 2,59x (GMU 0,82) |
| Seleccion de herramienta | 13/16 (86,5%) | 13/15 (86,7%) |
| Precision de parametros de tool call | 86,5% | 92,2% |
| Argumentos JSON validos | 21/21 | 18/18 |

Rendimiento de cacheo de prefijos (prompt de ~22k tokens, 300 tokens anadidos):

| `--max-num-batched-tokens` | Acierto en append | Tiempo append | Tiempo en frio |
|---|---|---|---|
| 8192 | 35,6% | 5,80 s | 8,56 s |
| 2048 | 79,8% | 2,25 s | 9,44 s |
| 1024 | 92,5% | 1,09 s | 10,36 s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: ~81 GB de pesos en disco, con memoria residente adicional para KV cache; el checkpoint completo ocupa 80,6 GB en el repositorio.
- GPU recomendadas: DGX Spark con GB10 y 128 GB de memoria unificada (configuracion medida por el autor).
- Cabe en consumer GPU: no disponible; el tamano (~81 GB) excede la VRAM de GPUs de consumo convencionales.
- Opciones de despliegue: vLLM mediante la imagen `eugr/spark-vllm-b12x-coderlean:latest`, con `METHOD=mtp`, `MTPN=4`, `MOE=b12x`, `QUANT=modelopt_mixed`, `GMU=0.82`, `MAXLEN=262144`, `MAXB=1024`, `BLOCK=48`, `V2RUNNER=1`, `ASYNC=1`, `SEQS=2`.
- Requiere anadir las entradas `.ple.`/`ple.` a `skip_substrs` en `vllm/models/qwen4_exp/nvidia/model.py` porque el checkpoint Lean no tiene tensores PLE.
- Latencia y throughput: 59,9 tok/s de decodificacion y 2,35 k tok/s de prefill en GB10; una peticion con prompt de 11,8k tokens pasa ~5 s en prefill, por lo que respuestas cortas de tool call ganan ~1,25x y generaciones de 400-800 tokens ganan 2,2x-2,5x.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Decodificacion (GB10) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repo (Coder-Lean-MTP) | ~67,17 B | 262.144 | 59,9 tok/s (MTP-4) | NVIDIA Open Model License | Hugging Face |
| elisepaul/Qwen3.8-Flash-Next-NVFP4-Coder-Lean | no disponible | 262.144 | 19,3 tok/s (AR) | Qwen Community License 1.0 | Hugging Face |
| nvidia/Qwen3.8-Flash-Next-NVFP4 | no disponible | no disponible | no disponible | NVIDIA Open Model License | Hugging Face |

La comparativa se limita a los tres checkpoints documentados en la informacion disponible; no se dispone de datos de benchmarks estandar ni de otros modelos de la misma categoria para comparar rendimiento en tareas.

## Limitaciones y advertencias

- El checkpoint Lean elimino la tabla PLE (51 GB) y las torres de vision; el modelo no procesa imagenes.
- Las lineales densas (`linear_attn`, `self_attn`, `shared_expert`) estan en BF16 en lugar de MXFP8: se leen en cada token y cuestan 7,5 GB/token frente a 1,3 GB/token de los expertos, con ~2,9 GB/token de desperdicio. Restaurar MXFP8 requiere un cambio en vLLM (las lineales column-parallel fusionadas se construyen sin `weight_scale`), por lo que no es posible con el fork actual.
- El cacheo de prefijos en arquitecturas hibridas solo checkpointea el estado recurrente en los limites de chunk; con chunks grandes la tasa de acierto en conversaciones crecientes cae al 35,6%.
- `mamba_cache_mode=all` no es compatible con modelos hibridos (cae a `align`), y ni `--enable-mamba-fine-grained-prefix-cache` ni un `--prefix-match-unit` mas fino mejoran la tasa de acierto en append.
- Riesgo de alucinacion: no documentado en la informacion disponible; aplican los riesgos habituales de modelos de codigo.
- Sesgos conocidos: no documentados en la informacion disponible.
- Idiomas limitados a en, zh y code; no hay soporte declarado de castellano.
- Licencia NVIDIA Open Model License: es necesario revisar los terminos completos en el archivo LICENSE antes de uso comercial; el modelo base de elisepaul se distribuye bajo Qwen Community License 1.0, lo que anade condiciones.
- El autor declara no estar afiliado a NVIDIA, Qwen ni al autor del repack Lean, y distribuye el modelo "as-is".
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta; es un artefacto reciente y poco validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/hfsameh/Qwen3.8-Flash-Next-NVFP4-Coder-Lean-MTP
- Modelo base Lean: https://huggingface.co/elisepaul/Qwen3.8-Flash-Next-NVFP4-Coder-Lean
- Modelo original NVIDIA: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-NVFP4
- Licencia: https://huggingface.co/hfsameh/Qwen3.8-Flash-Next-NVFP4-Coder-Lean-MTP/blob/main/LICENSE
- Imagen de despliegue: `eugr/spark-vllm-b12x-coderlean:latest` (referenciada en la model card; no se proporciona URL directa)
