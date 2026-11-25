# HangGlidersRule/Darkstar-Nemotron-3.5-Lightning-30B-A3B-Base-ModelOpt-W4A16-NVFP4

## Resumen

Darkstar-Nemotron-3.5-Lightning-30B-A3B-Base-ModelOpt-W4A16-NVFP4 es una cuantizacion del modelo base `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16` de NVIDIA, publicada por el usuario HangGlidersRule bajo el paraguas del proyecto Darkstar. Se trata de un artefacto de control sin editar: misma revision de origen, mismo contrato de cuantizacion y ninguna proyeccion de direccion de rechazo aplicada, lo que lo convierte en la referencia contra la que se comparan las variantes "abliterated" del mismo linaje. El objetivo es ofrecer una version de 22 GB (frente al BF16 original) que mantenga el comportamiento del modelo de NVIDIA.

La cuantizacion se ha realizado con NVIDIA ModelOpt 0.46.0rc2 en formato W4A16-NVFP4 con grupo 16, aplicada exclusivamente a las proyecciones up/down de los expertos enrutados y compartidos (5.934 modulos). El resto de componentes criticos —`lm_head`, capas Mamba/SSM, atencion, normas, embeddings y la cabeza MTP— permanece en BF16, lo que da lugar a un layout mixto que vLLM mapea como `modelopt_mixed`.

El modelo hereda la arquitectura Nemotron-H (hibrida Mamba-Transformer con mezcla de expertos) del modelo base de NVIDIA, con un total de 16.661.042.624 parametros reales en safetensors. Es relevante para quienes necesitan desplegar el modelo en GPUs Blackwell con vLLM y decodificacion especulativa MTP, manteniendo trazabilidad completa de procedencia y protocolo de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron-H (hibrida Mamba/SSM + Transformer, mezcla de expertos) |
| Parametros totales | 16.661.042.624 |
| Parametros activos | no disponible (la nomenclatura 30B-A3B del modelo base sugiere ~3B activos, pero no se confirma en la informacion proporcionada) |
| Longitud de contexto | 131.072 tokens (configurado en el runtime de vLLM) |
| Tipos de cuantizacion | W4A16-NVFP4 grupo 16 (expertos up/down); BF16 para lm_head, Mamba/SSM, atencion, normas, embeddings y cabeza MTP |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 (`openmdw-1.1`) |
| Formato de pesos | safetensors (3 shards, ~22 GB) |

## Arquitectura y entrenamiento

El modelo base es una arquitectura hibrida Nemotron-H que combina capas Mamba/SSM (con `conv1d`, `in_proj`, `out_proj`, `A_log`, `D` y `dt_bias`) con capas de atencion Transformer (q/k/v/o y BMM) y una mezcla de expertos con expertos enrutados y compartidos. Incluye ademas una cabeza MTP (multi-token prediction) que habilita decodificacion especulativa. La cuantizacion preserva en BF16 todos los componentes sensibles a la precision: bloque SSM, atencion, normas, embeddings, `lm_head` y la cabeza MTP.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo base de NVIDIA. Respecto al proceso de cuantizacion, se uso ModelOpt 0.46.0rc2 (commit `43fd41a58d52c4e6e5dec1d1ff5989ecc737ae1a`) con calibracion sobre `cnn_dailymail` y `nvidia/Nemotron-Post-Training-Dataset-v2`, 512+512 muestras, longitud de secuencia 2048, semilla 1234, batch 1 y cuantizacion de KV-cache desactivada (BF16). La innovacion tecnica destacable es el layout mixto W4A16-NVFP4 sobre los 5.934 modulos de expertos, que reduce el artefacto a ~22 GB manteniendo integridad numerica en las rutas SSM y de atencion, y su compatibilidad con decodificacion especulativa MTP de profundidad 7 en vLLM.

## Capacidades

- Generacion de texto y conversacion (pipeline `text-generation` y `conversational`).
- Razonamiento multi-paso, con parser de razonamiento `nemotron_v3` soportado en vLLM.
- Decodificacion especulativa mediante cabeza MTP con profundidad 7, validada en el runtime publicado.
- Procesamiento de contextos largos de hasta 131.072 tokens.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de vision o audio: no disponible (el pipeline declarado es solo texto).
- Al ser una cuantizacion del modelo base, conserva el comportamiento del BF16 original sin modificaciones de direccion de rechazo.

## Casos de uso

- Referencia de control en experimentos de edicion de comportamiento: sirve como linea base sin editar frente a las variantes abliterated del mismo linaje, permitiendo medir el efecto aislado de la proyeccion de rechazo con identico contrato de cuantizacion.
- Despliegue en produccion con vLLM sobre GPUs Blackwell: el artefacto de 22 GB y el soporte de `modelopt_mixed` permiten servir el modelo con Flash Attention, KV-cache BF16 y `max_num_seqs=16` en configuraciones de una sola GPU de 48-80 GB.
- Procesamiento de documentos largos: con 131.072 tokens de contexto se pueden ingerir contratos, informes o bases de codigo extensas en una sola pasada sin truncamiento.
- Generacion de texto a alta velocidad en single-stream: los 541,7 tok/s ponderados medidos con MTP7 lo hacen adecuado para asistentes interactivos donde la latencia por token es critica.
- Evaluacion comparativa de tecnicas de cuantizacion: al documentar revision exacta, version de ModelOpt, dataset de calibracion y semilla, es util como punto de referencia reproducible en estudios de cuantizacion NVFP4.
- Investigacion sobre arquitecturas hibridas Mamba-Transformer: permite estudiar el comportamiento de las rutas SSM preservadas en BF16 frente a los expertos cuantizados en tareas de razonamiento y generacion.
- Fine-tuning o evaluacion downstream sobre el checkpoint cuantizado: util para pipelines que necesitan un modelo base compacto con trazabilidad de procedencia completa.

## Benchmarks y rendimiento

| Metrica | Valor | Base de medida |
|---|---|---|
| Throughput single-stream (MTP7) | 541,7 tok/s ponderado | 4K/16K/48K = 562,2 / 548,0 / 399,7; ganador del barrido; DFlash 523,9 |
| Cumplimiento de prompts daninos | no medido (control sin editar) | comportamiento de rechazo sin cambios por diseno |
| Sobre-rechazos seguros | no medido (control sin editar) | misma base |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, GPQA) en la informacion disponible. La model card referencia un protocolo GPQA y una matriz de benchmarks en el repositorio del autor, pero no incluye sus valores.

## Requisitos de hardware

- VRAM estimada para inferencia: ~22 GB solo para pesos; con KV-cache BF16 a 131.072 tokens y `max_num_seqs=16` el consumo total crece de forma significativa y requiere planificacion explicita de memoria.
- GPU recomendadas: familia Blackwell con CUDA 13 (build nightly de vLLM), que es el entorno validado por el autor. El soporte NVFP4 nativo esta ligado a esta generacion.
- Cabe en GPU consumer: no confirmado. El tamano de pesos (~22 GB) encaja teoricamente en GPUs de 24 GB, pero la ventana de 131.072 tokens y el requisito de NVFP4 en Blackwell hacen inviable asumirlo sin validacion.
- Opciones de despliegue: vLLM con `modelopt_mixed`, Flash Attention, `--kv-cache-dtype bfloat16`, `--max-model-len 131072`, `--max-num-seqs 16`, `--reasoning-parser nemotron_v3` y `--speculative-config '{"method": "mtp", "num_speculative_tokens": 7}'`. No se menciona soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: 541,7 tok/s ponderados en single-stream con MTP7; 562,2 tok/s a 4K, 548,0 tok/s a 16K y 399,7 tok/s a 48K. El throughput agregado con concurrencia no esta caracterizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Darkstar-Nemotron-3.5-Lightning-30B-A3B-Base-ModelOpt-W4A16-NVFP4 | 16.661.042.624 (safetensors) | 131.072 | W4A16-NVFP4 mixto | OpenMDW 1.1 | Hugging Face, 328 descargas |
| nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 | no disponible | no disponible | BF16 | no disponible | Hugging Face (modelo base) |
| Variantes abliterated del linaje Darkstar | mismas que el base | 131.072 (mismo contrato) | W4A16-NVFP4 mixto | OpenMDW 1.1 | Repositorio del autor |

La comparativa se limita al linaje directo porque la informacion proporcionada no incluye datos de modelos alternativos de otros fabricantes. Frente al BF16 original, la diferencia medible es el tamano del artefacto (~22 GB frente al BF16) y el throughput single-stream caracterizado; no hay datos de calidad comparada.

## Limitaciones y advertencias

- Es un artefacto de control sin editar: las metricas de rechazo no se han medido y su ausencia no constituye una garantia de seguridad.
- La cuantizacion puede alterar el comportamiento respecto al BF16 de origen; no se han publicado evaluaciones de calidad que cuantifiquen esa deriva.
- Solo se ha caracterizado el throughput single-stream; el rendimiento con concurrencia agregada es un dato separado no publicado.
- El soporte esta validado unicamente en vLLM con builds nightly de CUDA 13 para Blackwell; otros backends o generaciones de GPU no estan confirmados.
- La licencia OpenMDW 1.1 impone condiciones especificas para uso comercial que deben revisarse en el enlace oficial antes de desplegar.
- No hay informacion sobre idiomas soportados, sesgos conocidos ni tasas de alucinacion.
- El modelo base es de tipo `base`, no un modelo instruido: el uso conversacional directo puede requerir formateo de prompt especifico.
- La model card advierte que las celdas no medidas nunca se rellenan desde otros checkpoints o protocolos, por lo que la cobertura de evaluacion es deliberadamente parcial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HangGlidersRule/Darkstar-Nemotron-3.5-Lightning-30B-A3B-Base-ModelOpt-W4A16-NVFP4
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Model card de origen: https://github.com/HangGlidersRule/model-forge/blob/main/models/nemotron-3.5-lightning-r1/model-card/base-nvfp4.md
- Linaje del artefacto: https://github.com/HangGlidersRule/model-forge/blob/main/models/nemotron-3.5-lightning-r1/artifact-lineage.md
- Matriz de benchmarks: https://github.com/HangGlidersRule/model-forge/blob/main/models/nemotron-3.5-lightning-r1/benchmark-matrix.md
- Protocolo GPQA: https://github.com/HangGlidersRule/model-forge/blob/main/models/nemotron-3.5-lightning-r1/gpqa-protocol.md
- Release de ingenieria: https://github.com/HangGlidersRule/model-forge/releases/tag/darkstar-nemotron-3.5-lightning-v1.0.0
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
