# 2imi9/Qwen3.8-27B-EAGLE4-NVFP4

## Resumen

2imi9/Qwen3.8-27B-EAGLE4-NVFP4 es una cuantización NVFP4 (W4A4) del modelo borrador de decodificación especulativa EAGLE-4 para el modelo objetivo Qwen3.8-27B, publicada por el usuario 2imi9. No se trata de un modelo de lenguaje autónomo: es un draft model que propone tokens candidatos que el modelo objetivo Qwen3.8-27B verifica, acelerando así la decodificación. La cuantización reduce el peso del checkpoint un 8 % respecto al borrador original en BF16 (de 6,18 GB a 5,67 GB), manteniendo en BF16 las dos tablas de vocabulario (`embed_tokens` y `lm_head`) y las capas q/k/v.

El modelo emplea la técnica EAGLE-4 de decodificación especulativa con verificación en árbol, cuantizada mediante `compressed-tensors` en formato NVFP4 (4 bits de peso y 4 bits de activación). Está pensado para ejecutarse únicamente sobre la pila propietaria EAGLE-4 vLLM (`ghcr.io/eagle-hq/eagle-4-vllm:0.1.3`) y ha sido probado exclusivamente en una NVIDIA B200 (Blackwell, sm_100). Su relevancia radica en que permite reducir el coste de memoria del borrador en GPUs Blackwell sin degradar de forma apreciable la longitud de aceptación ni la velocidad de decodificación respecto al borrador BF16.

La licencia es la Eagle 4 Source-Available License, que no es una licencia de código abierto aprobada por la OSI y restringe el uso comercial más allá de lo permitido sin autorización escrita de Eagle AI Corp. El proyecto incorpora además la política de marcas de Eagle y no está afiliado ni certificado por Eagle AI Corp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Draft model de decodificación especulativa EAGLE-4 (transformer borrador con verificación en árbol); cuantización NVFP4 W4A4 sobre `compressed-tensors` |
| Parametros totales | 3.089.075.200 (3,09 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A4 (4 bits peso, 4 bits activación); capas q/k/v y tablas de vocabulario en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Eagle 4 Source-Available License (no OSI); política de marcas Eagle incorporada; `embed_tokens` de Qwen3.8-27B bajo Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, 5.665.662.392 bytes) |

## Arquitectura y entrenamiento

El checkpoint es una cuantización del borrador EAGLE-Corp/Qwen3.8-27B-EAGLE4, que implementa la técnica EAGLE-4 de decodificación especulativa. El borrador propone tokens candidatos organizados en un árbol que el modelo objetivo Qwen3.8-27B verifica en paralelo; la configuración probada usa `node_top_k: 4`, `tree_depth: 14` y `max_verify_width: 16` en modo `static`. La cuantización se aplica con `compressed-tensors` en formato NVFP4 (W4A4) sobre las capas linealizadas, mientras que las proyecciones q/k/v y las dos tablas de vocabulario (`embed_tokens` y `lm_head`, 248.320 x 5.120 cada una) permanecen en BF16 sin cambios. El proceso de cuantización, los valores amax de calibración y las escalas de entrada se documentan en `quant_recipe.json` y en el directorio `quantization/`.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en la información proporcionada. La innovación técnica principal es la propia decodificación especulativa con verificación en árbol de EAGLE-4 combinada con cuantización NVFP4, que reduce el peso del borrador manteniendo prácticamente intacta la longitud de aceptación (0,973x a 1,026x respecto al BF16) y la velocidad de decodificación por petición (0,973x a 1,075x).

## Capacidades

- Generación de tokens candidatos para decodificación especulativa: no genera texto de forma autónoma, sino propuestas que el modelo objetivo Qwen3.8-27B verifica.
- Aceleración de inferencia en la pila EAGLE-4 vLLM mediante verificación en árbol con atención CUSTOM.
- Cuantización NVFP4 W4A4 compatible con `compressed-tensors`, orientada a GPUs Blackwell (sm_100).
- Reducción de huella de memoria del borrador: 5,67 GB frente a 6,18 GB del borrador BF16 (aproximadamente un 8 % menos).
- Integración con el stack `ghcr.io/eagle-hq/eagle-4-vllm:0.1.3` mediante `eagle-harness` y `speculative-config`.
- No soporta tool calling, function calling, agentes, visión, audio ni modo thinking por sí mismo; esas capacidades dependen del modelo objetivo Qwen3.8-27B.
- Capacidades multilingües: no disponibles en la información proporcionada (heredadas del modelo objetivo en su caso).

## Casos de uso

- Aceleración de servidores de inferencia con Qwen3.8-27B: el borrador propone tokens que el objetivo verifica en árbol, reduciendo el coste por token generado en despliegues vLLM sobre B200.
- Reducción de VRAM en GPUs Blackwell: al ocupar 5,67 GB en lugar de 6,18 GB, libera memoria para el modelo objetivo, caché KV o mayor concurrencia en una única B200.
- Despliegue de decodificación especulativa en producción con la pila EAGLE-4 vLLM: se integra mediante `--speculative-config` con `method: eagle_harness` y modo `static`, sin necesidad de tablas de coste calibradas.
- Evaluación comparativa de cuantizaciones NVFP4 frente a BF16 en borradores especulativos: el repositorio incluye el cliente de benchmark y los 32 prompts usados, lo que permite reproducir las celdas de temperatura y concurrencia.
- Investigación sobre decodificación especulativa: sirve como referencia para estudiar el impacto de la cuantización W4A4 en la longitud de aceptación y en la velocidad de decodificación por petición.
- Entornos con requisitos estrictos de memoria y latencia: adecuado cuando se busca maximizar el throughput de Qwen3.8-27B en hardware Blackwell sin cambiar el modelo objetivo.

## Benchmarks y rendimiento

Los datos disponibles comparan este borrador NVFP4 con el borrador BF16 original en una única B200, en seis celdas de temperatura y concurrencia:

| Métrica | Rango relativo frente al borrador BF16 |
|---|---|
| Longitud de aceptación | 0,973x a 1,026x |
| Velocidad de decodificación por petición (emparejada) | 0,973x a 1,075x |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, lo que es coherente con la naturaleza del modelo: no es un modelo de lenguaje evaluable de forma independiente, sino un borrador de decodificación especulativa.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,67 GB solo para el borrador; hay que sumar el modelo objetivo Qwen3.8-27B y la caché KV.
- GPU probada: 1x NVIDIA B200 (Blackwell, sm_100). No se ha validado en otras GPU.
- GPU recomendadas: NVIDIA B200; la cuantización NVFP4 requiere soporte de hardware Blackwell.
- ¿Cabe en GPU de consumo? No disponible; no se ha probado en RTX 4090 ni en otras GPU consumer, y la pila requiere sm_100.
- Despliegue: contenedor `ghcr.io/eagle-hq/eagle-4-vllm:0.1.3` con `eagle-harness`; requiere `VLLM_USE_V2_MODEL_RUNNER=1`, `--attention-backend CUSTOM` y `--linear-backend flashinfer_cutedsl`.
- Requisitos de host: Linux x86-64, driver NVIDIA para CUDA 13 (probado con 595.71.05), Docker con NVIDIA Container Toolkit y unos 61 GB de disco para objetivo y borrador, más imagen y cachés de compilación.
- Latencia y throughput: no se proporcionan valores absolutos; solo ratios relativos frente al borrador BF16 (ver sección de benchmarks).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 2imi9/Qwen3.8-27B-EAGLE4-NVFP4 | 3,09 mil millones | no disponible | NVFP4 W4A4 | Eagle 4 Source-Available (no OSI) | Hugging Face, 28 descargas |
| EAGLE-Corp/Qwen3.8-27B-EAGLE4 (BF16) | no disponible (checkpoint de 6,18 GB) | no disponible | BF16 | Eagle 4 Source-Available (presumiblemente) | Hugging Face (modelo base) |
| Qwen/Qwen3.8-27B (modelo objetivo) | no disponible | no disponible | BF16 (referencia) | Apache 2.0 (según `LICENSE-Qwen3.8-27B`) | Hugging Face |

No se dispone de información sobre otros borradores EAGLE-4 cuantizados comparables ni sobre sus métricas de aceptación y velocidad en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: solo propone tokens que el modelo objetivo Qwen3.8-27B debe verificar; no puede usarse para generación de texto por sí solo.
- Validación muy limitada: probado únicamente en 1x NVIDIA B200 (sm_100); no hay garantías en otras GPU ni en otros backends.
- Dependencia de una pila propietaria: requiere el contenedor EAGLE-4 vLLM 0.1.3, Model Runner V2, atención CUSTOM y `flashinfer_cutedsl`; no funciona con vLLM estándar ni con llama.cpp u Ollama.
- Licencia restrictiva: Eagle 4 Source-Available License no es OSI; el uso comercial más allá de lo permitido requiere licencia escrita de Eagle AI Corp (licensing@eagle.ai). Hay que comprobar también la licencia del modelo objetivo Qwen3.8-27B.
- Marcas: el proyecto incorpora la política de marcas de Eagle y no está afiliado, certificado, patrocinado ni respaldado por Eagle AI Corp.
- Idiomas y contexto: no disponibles en la información proporcionada.
- Riesgo de alucinación y sesgos: no documentados para este borrador; en última instancia dependen del modelo objetivo.
- Modo `static` probado sin `data_path`; el modo `serve` por defecto de upstream requiere tablas de coste calibradas no incluidas.
- El checkpoint contiene la tabla de embeddings de Qwen3.8-27B sin cambios bajo Apache 2.0; su uso está sujeto a ambas licencias.

## Enlaces

- Hugging Face: https://huggingface.co/2imi9/Qwen3.8-27B-EAGLE4-NVFP4
- Modelo base: https://huggingface.co/EAGLE-Corp/Qwen3.8-27B-EAGLE4
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio EAGLE-4: https://github.com/eagle-hq/EAGLE-4
- Quickstart vLLM (commit 3e20798b): https://github.com/eagle-hq/EAGLE-4/blob/3e20798bcce810486cd810ecf087936488106ae2/docs/quickstart-vllm.md
- Política de marcas (tag v0.1.3): https://github.com/eagle-hq/EAGLE-4/blob/v0.1.3/TRADEMARKS.md
- Licencia: https://huggingface.co/2imi9/Qwen3.8-27B-EAGLE4-NVFP4/blob/main/LICENSE
- NOTICE: https://huggingface.co/2imi9/Qwen3.8-27B-EAGLE4-NVFP4/blob/main/NOTICE
- Licencia Qwen3.8-27B: https://huggingface.co/2imi9/Qwen3.8-27B-EAGLE4-NVFP4/blob/main/LICENSE-Qwen3.8-27B
- Paper de referencia EAGLE: https://arxiv.org/abs/2305.14233
