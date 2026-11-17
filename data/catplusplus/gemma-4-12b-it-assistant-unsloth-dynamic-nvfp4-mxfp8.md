# catplusplus/gemma-4-12B-it-assistant-Unsloth-Dynamic-NVFP4-MXFP8

## Resumen

El modelo `catplusplus/gemma-4-12B-it-assistant-Unsloth-Dynamic-NVFP4-MXFP8` es un predictor de decodificación especulativa basado en Multi-Token Prediction (MTP) derivado de `google/gemma-4-12B-it-assistant`. No es un modelo generativo autónomo: es un componente auxiliar que acelera la inferencia de su modelo objetivo, `catplusplus/gemma-4-12B-it-uncensored-Grand-Hybrid-NVFP4-MXFP8`, proponiendo varios tokens por paso que el modelo grande verifica en paralelo.

Lo publica el usuario `catplusplus` bajo licencia Apache 2.0. Su interés técnico está en la calibración: corrige un escalado NVFP4 invertido (`amax / 2688.0` en lugar de `2688.0 / amax`) y escalas FP8 locales truncadas a enteros que limitaban la tasa de aceptación al 8,15 %. Tras la corrección, el checkpoint pasa de 845,7 MB a 420,65 MB manteniendo una asignación de precisión mixta BF16/MXFP8/NVFP4.

La arquitectura es un bloque MTP de 4 capas Q-only con `hidden=1024`, 422.856.964 parámetros totales y decodificación autorregresiva secuencial de 5 pasos (`K=5`). Comparte las cachés KV de las capas 46 y 47 del modelo objetivo, lo que permite conservar 254.059 tokens de contexto FP8 en una GPU de 16 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bloque MTP de decodificacion especulativa: 4 capas Q-only (`hidden=1024`), autorregresivo secuencial, `K=5` |
| Parametros totales | 422.856.964 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Comparte KV del objetivo; 254.059 tokens FP8 en GPU de 16 GB |
| Tipos de cuantizacion | Mixta: BF16 (proyecciones, RMSNorm, `layer_scalar`), MXFP8 W8A8 (`group_size=32`) y NVFP4 W4A4 (`group_size=16`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con `compressed-tensors` |

## Arquitectura y entrenamiento

El modelo implementa un predictor MTP de 4 capas con solo proyecciones Q (`hidden=1024`), que opera de forma autorregresiva secuencial en 5 pasos. Se deriva de `google/gemma-4-12B-it-assistant` y se calibra on-policy sobre secuencias generadas por el modelo objetivo `Grand-Hybrid` (67+ secuencias de calibración y held-out). Comparte las cachés KV de las capas 46 y 47 del target, por lo que no añade overhead de memoria KV.

La asignación de precisión es selectiva: `pre_projection`, `post_projection`, `self_attn.o_proj`, todas las RMSNorm y `layer_scalar` se mantienen en BF16; `self_attn.q_proj` y `lm_head` (desacoplado de `embed_tokens`) usan MXFP8 W8A8 con `group_size=32` (~31,5 dB SNR); `mlp.gate_proj`, `mlp.up_proj` y `mlp.down_proj` usan NVFP4 W4A4 con `group_size=16` (~20,4 dB SNR, `amax` compartido en `gate_up_proj`). La calibración de `input_global_scale` sustituye el valor 1,0 por `2688.0 / act_amax` (rango 91,90–190,30 por proyección MLP) y corrige el `weight_global_scale` invertido y las escalas FP8 locales truncadas.

## Capacidades

- Decodificación especulativa multi-token: propone hasta 5 tokens por paso para verificación paralela por el modelo objetivo.
- Aceleración de razonamiento y thinking: 130,4 tok/s en modo thinking/reasoning.
- Aceleración de chat interactivo multilingüe: 71,3–78,1 tok/s en chat directo y pares JP↔EN.
- Aceleración de decodificación de código: 102,5–141,9 tok/s con aceptación media de 4,188 tokens.
- Aceleración de tool calling: 98,1 tok/s en `ToolGuard` (0,63 s) y 73,8 tok/s en `Clarifier` (0,70 s).
- Soporte de concurrencia: 74,3 tok/s con `C=1` y 285,8 tok/s con `C=4`.
- No es un modelo generativo autónomo: no produce respuestas finales por sí mismo, solo propuestas de tokens.

## Casos de uso

- Chat interactivo multi-turno de baja latencia: con TTFT de 52,1–85,2 ms y 71,3–78,1 tok/s, es el predictor adecuado para asistentes conversacionales donde importa el primer token.
- Despliegue en GPU de consumo de 16 GB: al compartir KV del objetivo, preserva 254.059 tokens de contexto en una RTX 5060 Ti (`sm_120`), permitiendo sesiones largas sin sacrificar memoria.
- Servicio multiusuario concurrente: con 285,8 tok/s a `C=4`, encaja en backends vLLM que atienden varias peticiones simultáneas con presupuesto de VRAM ajustado.
- Aceleración de razonamiento en producción: 130,4 tok/s en modo thinking, útil en pipelines de agentes que requieren cadenas de razonamiento largas.
- Asistentes con tool calling: el rendimiento en `ToolGuard` (0,63 s) y `Clarifier` (0,70 s) lo hace apto para flujos de agentes que validan y aclaran llamadas a herramientas.
- Traducción y consultas multilingües JP↔EN: 71,3–78,1 tok/s en chat directo, adecuado para interfaces de traducción interactiva.
- Decodificación de código en IDE o CI: 102,5–141,9 tok/s con aceptación media de 4,188 tokens, útil para autocompletado y generación de parches.

## Benchmarks y rendimiento

| Metrica | Este modelo (MTP, K=5) | DSpark Block-7 (K=7) |
|---|---|---|
| Tamano del checkpoint | 420,65 MB | 1.257,81 MB |
| KV cache restante (16 GB) | 254.059 tokens | 66.714 tokens |
| TTFT directo | 52,1–85,2 ms | 88,6–175 ms |
| Chat directo / JP↔EN | 71,3–78,1 tok/s | 59,0–79,0 tok/s |
| Thinking / reasoning | 130,4 tok/s | 131,1 tok/s |
| Decodificacion de codigo (aceptacion media) | 102,5–141,9 tok/s (4,188) | 108,0–143,3 tok/s (4,926) |
| ToolGuard / Clarifier | 98,1 tok/s (0,63 s) / 73,8 tok/s (0,70 s) | 156,0 tok/s (0,45 s) / 60,0 tok/s (1,01 s) |
| Concurrencia C=1 / C=4 | 74,3 / 285,8 tok/s | 70,7 / 227,6 tok/s |

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM: el checkpoint ocupa 420,65 MB; el consumo total depende del modelo objetivo `Grand-Hybrid` (12B) y de la cache KV FP8.
- GPU validada: RTX 5060 Ti de 16 GB (`sm_120`), con 254.059 tokens KV FP8 disponibles.
- GPU recomendadas: cualquier GPU con al menos 16 GB para el conjunto objetivo + predictor; no se especifican A100/H100 en la informacion disponible.
- Cabe en GPU de consumo: si, en RTX 5060 Ti de 16 GB segun la model card.
- Despliegue: vLLM con `--spec-method mtp --spec-model <este modelo> --spec-tokens 5`, `--kv-cache-dtype fp8`, `--trust-remote-code`, `--enable-prefix-caching` y `--performance-mode interactivity`.
- Latencia: TTFT de 52,1–85,2 ms; throughput de 74,3 tok/s a `C=1` y 285,8 tok/s a `C=4`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto KV | Licencia | Enfoque |
|---|---|---|---|---|
| Este modelo (MTP K=5) | 422,9 M | 254.059 tokens (16 GB) | Apache 2.0 | Predictor MTP secuencial, minima latencia y maxima concurrencia |
| `catplusplus/dspark-gemma-4-12b-it-Grand-Hybrid-Unsloth-Dynamic-NVFP4-MXFP8` (K=7) | no disponible (checkpoint 1.257,81 MB, 5 capas `hidden=3840` + `fc` + Markov rank-256) | 66.714 tokens (16 GB) | Apache 2.0 | Predictor paralelo por bloques, mejor burst de codigo y JSON |
| `google/gemma-4-12B-it-assistant` | no disponible | no disponible | no disponible | Predictor MTP original sin cuantizar |

## Limitaciones y advertencias

- No es un modelo generativo: requiere el modelo objetivo `catplusplus/gemma-4-12B-it-uncensored-Grand-Hybrid-NVFP4-MXFP8` para producir salida final.
- Dependencia estricta de vLLM con `--spec-method mtp` y `--trust-remote-code`; no es portable a otros runtimes sin adaptacion.
- La calibracion se realizo sobre 67+ secuencias del modelo objetivo; el rendimiento puede degradarse con distribuciones de entrada muy distintas.
- La tasa de aceptacion es menor que la del predictor DSpark en codigo (4,188 frente a 4,926), lo que reduce el speedup en generacion de codigo puro.
- El modelo objetivo es una variante "uncensored"; los sesgos y riesgos de contenido del conjunto recaen sobre el sistema desplegado.
- Idiomas soportados no documentados de forma explicita; solo se reportan datos para chat directo y JP↔EN.
- No hay benchmarks academicos publicados; las cifras disponibles son de latencia y throughput medidas por el autor.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base `google/gemma-4-12B-it-assistant` puede imponer terminos adicionales que deben verificarse.

## Enlaces

- Hugging Face: https://huggingface.co/catplusplus/gemma-4-12B-it-assistant-Unsloth-Dynamic-NVFP4-MXFP8
- Modelo base original: https://huggingface.co/google/gemma-4-12B-it-assistant
- Modelo objetivo: https://huggingface.co/catplusplus/gemma-4-12B-it-uncensored-Grand-Hybrid-NVFP4-MXFP8
- Predictor alternativo DSpark: https://huggingface.co/catplusplus/dspark-gemma-4-12b-it-Grand-Hybrid-Unsloth-Dynamic-NVFP4-MXFP8
