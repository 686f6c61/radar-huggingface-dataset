# e-valente/GLM-5.3-Flash-NVFP4-SM120-Deployment

## Resumen

GLM-5.3-Flash-NVFP4-SM120-Deployment no es un modelo nuevo, sino un perfil de despliegue documentado por el usuario e-valente para servir el checkpoint `dealignai/GLM-5.3-Flash-UNCENSORED-NVFP4` (revision `745aac2ff0f10acf961f396df3f9418598aa7327`), a su vez derivado del modelo base `zai-org/GLM-5.3-Flash` de Zhipu AI (zai-org). El repositorio no aloja pesos: contiene unicamente una model card y un fichero `evaluation-summary.json` con la receta de servicio y evaluaciones sinteticas acotadas.

La contribucion tecnica es una configuracion observada de cuatro GPUs NVIDIA RTX PRO 6000 Blackwell Server Edition (arquitectura SM120) con paralelismo tensorial TP4, cuantizacion NVFP4 del upstream, cache KV en `fp8_ds_mla` y decodificacion especulativa MTP con un token. El modelo subyacente usa la arquitectura `Glm5NextForConditionalGeneration` con una longitud de contexto configurada de 1.048.576 tokens.

Es relevante ahora porque documenta explicitamente los fallos y limitaciones encontrados al servir pesos NVFP4 en SM120 con vLLM: el backend Marlin MoE sustituyo a la computacion FP4 nativa, y el autotune de FlashInfer se salto los kernels `fp4_gemm` y los GEMM de MoE de TensorRT-LLM. Esto es util para equipos que evaluan hardware Blackwell para inferencia de modelos grandes cuantizados a 4 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Glm5NextForConditionalGeneration` (transformer, segun atribucion del upstream) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens (configurada en el upstream) |
| Tipos de cuantizacion | NVFP4 (generada por el upstream con NVIDIA ModelOpt) |
| Idiomas soportados | en |
| Licencia | no disponible en este repositorio; el upstream se etiqueta como MIT segun la model card |
| Formato de pesos | safetensors (checkpoint NVFP4, incluye `model-input-scales.safetensors`); no se alojan pesos en este repositorio |

## Arquitectura y entrenamiento

Este repositorio no entrena ni modifica pesos. El checkpoint evaluado es una cuantizacion NVFP4 producida por el upstream con NVIDIA ModelOpt sobre el modelo base `zai-org/GLM-5.3-Flash`, cuya arquitectura se registra como `Glm5NextForConditionalGeneration`. El perfil de despliegue no realizo entrenamiento nuevo, edicion de pesos, cambios de tokenizer, reemplazo de chat template ni conversion de checkpoint; la inspeccion mas reciente solo confirmo la carga del snapshot fijado mediante un montaje de cache de modelo en solo lectura.

La receta de servicio usa vLLM `0.30.1rc1.dev245+gaf7f9488c` con FlashInfer `0.7.0` en una imagen fijada por digest, `dtype` BF16, cache KV `fp8_ds_mla`, `max-model-len` de 1.048.576, `max-num-seqs` de 1, `max-num-batched-tokens` de 1.024 y `gpu-memory-utilization` de 0.70. Se habilita decodificacion especulativa MTP con un token, parser de herramientas `glm47` con eleccion automatica y parser de razonamiento `glm45`. El autotune de FlashInfer se salto explicitamente `fp4_gemm`, `trtllm::fused_moe::gemm1` y `trtllm::fused_moe::gemm2`; los logs reportaron la ruta Marlin MoE y advirtieron de que la computacion FP4 nativa no estaba disponible en la ruta probada.

## Capacidades

- Generacion de texto en ingles (unico idioma declarado).
- Razonamiento con modo de pensamiento configurable via `reasoning_effort` (por defecto `low` en este perfil) y `clear_thinking=true`.
- Tool calling / function calling mediante parser `glm47` y `--enable-auto-tool-choice`.
- Componentes de vision atribuidos al upstream (el perfil no los evalua de forma independiente).
- Cabeza MTP para decodificacion especulativa.
- Contexto largo de hasta 1.048.576 tokens configurado, aunque el perfil limita a una secuencia concurrente y 1.024 tokens por lote.
- Capacidades de agente multi-paso: no verificadas en la evaluacion publicada.

## Casos de uso

- Servicio de inferencia privada con contexto muy largo: el perfil permite servir una unica secuencia de hasta 1.048.576 tokens con TP4, adecuado para tareas de analisis documental masivo donde la latencia por peticion no es critica.
- Evaluacion de hardware Blackwell SM120 para cargas NVFP4: util para equipos que quieran medir el rendimiento real de RTX PRO 6000 con pesos de 4 bits y detectar cuando el backend cae a Marlin MoE en lugar de usar kernels FP4 nativos.
- Despliegue con tool calling en pipelines internos: la configuracion incluye parser `glm47` y eleccion automatica de herramienta, lo que permite integrar el endpoint en orquestadores de agentes que consuman una API compatible con OpenAI.
- Reproduccion de entornos con vLLM fijado por digest: la receta sirve como plantilla para despliegues reproducibles con imagen, version de FlashInfer y argumentos concretos.
- Razonamiento con modo de pensamiento controlado: util para comparar calidad y coste entre `reasoning_effort` bajo y alto en tareas de analisis.
- Referencia para auditoria de despliegues: el repositorio documenta explicitamente casos de fallo y advertencias, lo que facilita revisiones de configuracion antes de pasar a produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye un `evaluation-summary.json` con evaluaciones sinteticas acotadas, pero no se proporcionan cifras numericas (MMLU, HumanEval, GSM8K ni latencias) en la informacion facilitada.

## Requisitos de hardware

- GPUs: 4 x NVIDIA RTX PRO 6000 Blackwell Server Edition (SM120) en un host G4 `g4-standard-384` con 8 GPUs instaladas; solo las GPUs 0-3 sirven el modelo como instancia TP4 unica.
- VRAM estimada: no disponible de forma explicita; el perfil usa `gpu-memory-utilization` de 0.70 sobre el total de las cuatro GPUs.
- Cabe en GPU de consumo: no disponible; el perfil esta pensado para GPUs de centro de datos Blackwell.
- Despliegue: vLLM (`vllm/vllm-openai` fijado por digest) con FlashInfer `0.7.0`; no se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la configuracion limita a una secuencia concurrente y 1.024 tokens por lote, lo que sugiere baja concurrencia.
- Requisitos adicionales: montaje de checkpoint en solo lectura incluyendo `model-input-scales.safetensors`, cache de escritura separada, `HF_HUB_OFFLINE=1` y `TRANSFORMERS_OFFLINE=1`, clave de API inyectada por gestor de secretos y endpoint de salud privado.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Este repositorio no contiene pesos ni adaptadores; es solo documentacion de despliegue.
- La evaluacion se realizo sobre texto sintetico acotado y no constituye un benchmark completo ni una prueba de generacion autenticada.
- La inspeccion mas reciente no fue una auditoria de integridad de pesos byte a byte.
- En la ruta probada no se confirmo aceleracion aritmetica NVFP4 nativa: los logs reportaron Marlin MoE y se saltaron kernels FP4 en el autotune de FlashInfer.
- Solo se sirven 4 de las 8 GPUs del host; no debe interpretarse como un resultado medido a 8 GPUs ni como 8 replicas.
- Limite de una secuencia concurrente y 1.024 tokens por lote: no apto para cargas de alta concurrencia sin revalidacion.
- Idioma declarado: solo ingles.
- Licencia: no disponible en este repositorio; el upstream se etiqueta como MIT segun la model card, pero no se relicencia ni redistribuye el checkpoint.
- El modelo base se presenta como "uncensored" en el nombre del checkpoint upstream; implica riesgos adicionales de contenido no filtrado en produccion.
- El endpoint debe mantenerse privado, con controles de red y autenticacion; el ejemplo no es un script completo de arranque ni debe exponerse sin proteccion.
- Mover el perfil a otro numero de GPUs u otra topologia requiere nueva validacion.

## Enlaces

- Repositorio del perfil: https://huggingface.co/e-valente/GLM-5.3-Flash-NVFP4-SM120-Deployment
- Checkpoint evaluado: https://huggingface.co/dealignai/GLM-5.3-Flash-UNCENSORED-NVFP4
- Modelo base atribuido: https://huggingface.co/zai-org/GLM-5.3-Flash
- vLLM: https://github.com/vllm-project/vllm
- FlashInfer: https://github.com/flashinfer-ai/flashinfer
- NVIDIA ModelOpt: https://github.com/NVIDIA/TensorRT-Model-Optimizer
