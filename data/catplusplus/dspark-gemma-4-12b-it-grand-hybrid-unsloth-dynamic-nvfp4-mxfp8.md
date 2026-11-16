# catplusplus/dspark-gemma-4-12b-it-Grand-Hybrid-Unsloth-Dynamic-NVFP4-MXFP8

## Resumen

DSpark Gemma-4-12B Block-7 Grand-Hybrid es un modelo predictor de decodificación especulativa (speculative decoding) construido por el usuario catplusplus a partir de `deepseek-ai/dspark_gemma4_12b_block7`. No es un modelo generativo autónomo, sino un "draft model" que propone tokens candidatos que un modelo objetivo de 12B parámetros (concretamente `TrevorJS/gemma-4-12B-it-uncensored-Grand-Hybrid-NVFP4-MXFP8`) verifica en paralelo. Su función es acelerar la inferencia del modelo grande sin alterar la distribución de salida.

El modelo ha sido sometido a un proceso de destilación on-policy con QAT (quantization-aware training) y muestreo programado autoregresivo, además de una cuantización mixta Unsloth-Dynamic que combina NVFP4 (W4A4) y MXFP8 (W8A8). El resultado es un checkpoint de 1.257,81 MB (1,17 GiB) que, junto al modelo objetivo de 12B, cabe en una única GPU de consumo de 16 GB (RTX 5060 Ti, sm_120).

La relevancia de esta ficha radica en que documenta una técnica de optimización de inferencia (decodificación especulativa con draft model cuantizado) cada vez más habitual en despliegues de producción con VRAM limitada, y lo hace con métricas concretas de aceptación, throughput y latencia sobre hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma4DSparkModel (predictor de decodificación especulativa basado en transformer, con cabezas `markov_head` y `confidence_head`, bridge `fc` cross-layer) |
| Parametros totales | 1.417.178.630 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explícita; el modelo objetivo soporta hasta 254K tokens de KV cache según la model card |
| Tipos de cuantizacion | Mixta: BF16 (protegido), MXFP8 W8A8 (group_size=32), NVFP4 W4A4 (group_size=16), con QAT straight-through |
| Idiomas soportados | no disponible (los datos de destilación incluyen inglés, japonés y código) |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo es un predictor especulativo tipo DSpark construido sobre la arquitectura Gemma 4, con un puente cross-layer `fc`, cabezas `markov_head` y `confidence_head`, y atención con proyecciones `q_proj`, `k_proj` y `o_proj`. Se beneficia de sharing de embeddings y LM-head con el modelo objetivo (verificado bit a bit con `max_diff = 0.0`, `share_target_embeddings: true`), lo que elimina 4.026,5 MB de pesos redundantes en disco y VRAM.

El entrenamiento consistió en destilación on-policy autoregresiva con QAT sobre aproximadamente 1.022 trayectorias generadas por el modelo `Grand-Hybrid`, procedentes de `evol-codealpaca-v1`, `ultrachat_200k`, prosa técnica japonés-inglés, razonamiento y prompts agénticos con herramientas y aclaraciones. Se descongelaron el puente `fc`, `k_proj` y las normas, y se aplicó LoRA en atención (`r=128`, `α=256`) y MLP (`r=64`, `α=128`) con QAT NVFP4 straight-through. La función de pérdida combinó KL, cross-entropy y BCE sobre `confidence_head`. La validación held-out con 67 secuencias en NVFP4 simulado mostró una reducción del KL autoregresivo de 5,7313 a 4,2255 (−26,3 %), un aumento de la longitud esperada de cadena de 3,478 a 3,988 tokens por paso (+0,510) y una mejora del match greedy en posición 0 del 67,2 % al 79,1 % (+11,9 pp).

La cuantización calibrada Unsloth-Dynamic protege en BF16 el puente `fc`, `k_proj`, `markov_head`, `confidence_head`, normas y `layer_scalar`; aplica MXFP8 W8A8 (SNR 31,5 dB) a `q_proj` y `o_proj`; y NVFP4 W4A4 (SNR 20,5 dB, `input_global_scale = 2688.0`) a `gate_proj`, `up_proj` y `down_proj`, evitando el desbordamiento de la escala FP8 de 448,0 en `down_proj` cuyas activaciones alcanzan 3.904,0.

## Capacidades

- Predicción especulativa de tokens para acelerar la inferencia del modelo objetivo `TrevorJS/gemma-4-12B-it-uncensored-Grand-Hybrid-NVFP4-MXFP8`.
- Generación de cadenas de borrador de hasta `K=7` tokens por paso (`--spec-tokens 7`).
- Estimación de confianza por token mediante `confidence_head`, útil para decidir la longitud de la cadena propuesta.
- Soporte de tool calling y prompts agénticos en el modelo objetivo (el draft model fue destilado con prompts de herramientas y aclaraciones).
- Capacidades multilingües heredadas del modelo base (inglés, japonés y código en los datos de destilación).
- Integración con vLLM mediante `--spec-method dspark`.
- No es un modelo generativo autónomo: no debe usarse sin el modelo objetivo.

## Casos de uso

- Aceleración de inferencia en producción con VRAM limitada: desplegar el modelo objetivo de 12B junto a este draft model en una única GPU de 16 GB (RTX 5060 Ti, sm_120) permite pasar de 33,7 tok/s a 108–143 tok/s en decodificación de código, multiplicando por 3–4 el throughput sin cambiar la distribución de salida.
- Servicio de chat multi-turno interactivo: con `--max-num-seqs 4` y KV cache FP8 se alcanzan 79,0 tok/s en chat técnico y 131,1 tok/s en razonamiento, adecuado para asistentes conversacionales con latencia baja.
- Generación de código asistida: la aceptación media de 4,926 tokens por paso (56,1 %) en código hace que el modelo sea especialmente rentable en tareas de autocompletado y generación de código, donde las cadenas especulativas se aceptan con más frecuencia.
- Validación de esquemas JSON en pipelines de herramientas: el escenario Tasuki ToolGuard JSON alcanza 156,0 tok/s con 0,45 s de latencia, útil para validación estructurada en agentes que llaman a APIs.
- Despliegue en estaciones de trabajo de consumo: al caber en 16 GB junto al modelo objetivo, permite prototipar y servir aplicaciones de IA generativa en hardware asequible sin GPUs de datacenter.
- Evaluación de técnicas de decodificación especulativa: sirve como referencia reproducible para medir el impacto de QAT, destilación on-policy y cuantización mixta en la tasa de aceptación y el throughput.
- Batch de alta concurrencia: con C=4 se alcanzan 227,6 tok/s en el caso tuned, adecuado para procesamiento por lotes de documentos o generación masiva.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre una única RTX 5060 Ti de 16 GB (sm_120), vLLM con `--spec-method dspark --spec-tokens 7`:

| Configuracion | Tamano checkpoint | Tokens KV cache | Decode codigo | Aceptacion media (codigo) | Chat (tec / razon) | Tasuki ToolGuard JSON | Concurrencia C=1 / C=4 |
|---|---:|---:|---:|---:|---:|---:|---:|
| Sin spec decode | — | 84.209 | 33,7–33,9 tok/s | 1,00 | 33,8 / 34,0 | 33,8 tok/s (1,62 s) | 33,7 / 132,7 tok/s |
| DSpark NVFP4 sin ajuste (K=7) | 1.257,8 MB | 66.714 | 100,8–156,7 tok/s (3/4 pass) | 4,831 (54,7 %) | 73,9 / 133,9 | 127,5 tok/s (0,53 s) | 63,6 / 252,1 tok/s |
| **DSpark v2 ajustado + QAT (K=7, este modelo)** | **1.257,8 MB** | **66.714** | **108,0–143,3 tok/s (4/4 pass)** | **4,926 (56,1 %)** | **79,0 / 131,1** | **156,0 tok/s (0,45 s)** | **70,7 / 227,6 tok/s** |

Validación held-out autoregresiva (67 secuencias, NVFP4 simulado):

| Metrica | Antes | Despues | Delta |
|---|---:|---:|---:|
| KL autoregresivo | 5,7313 | 4,2255 | −26,3 % |
| Longitud esperada de cadena | 3,478 | 3,988 | +0,510 tokens/paso |
| Match greedy en posicion 0 | 67,2 % | 79,1 % | +11,9 pp |

## Requisitos de hardware

- VRAM estimada del draft model: 1.257,8 MB (1,17 GiB) en disco y en VRAM tras el sharing de embeddings y LM-head.
- VRAM total del sistema: cabe junto al modelo objetivo de 12B en una única GPU de 16 GB (validado en RTX 5060 Ti, sm_120).
- GPU recomendadas: RTX 5060 Ti 16 GB (validada), cualquier GPU consumer con ≥16 GB (RTX 4080/4090, RTX 5070 Ti/5080/5090), y GPUs de datacenter (A100, H100) con margen sobrado.
- Opciones de despliegue: vLLM con soporte para `share_target_embeddings: true` en `Gemma4DSparkModel` y `--spec-method dspark`. La model card no documenta soporte para llama.cpp, Ollama ni TGI.
- Throughput y latencia medidos: 108,0–143,3 tok/s en decode de código, 79,0 tok/s en chat técnico, 156,0 tok/s (0,45 s) en validación JSON, 70,7 tok/s con C=1 y 227,6 tok/s con C=4.
- KV cache: 66.714 tokens con la configuración recomendada; el modelo objetivo asociado permite hasta 254K tokens de KV cache según la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Throughput codigo (RTX 5060 Ti) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **DSpark v2 ajustado + QAT (este modelo)** | 1.417.178.630 | no disponible | 108,0–143,3 tok/s (4/4 pass) | MIT | Hugging Face |
| DSpark NVFP4 sin ajuste | no disponible | no disponible | 100,8–156,7 tok/s (3/4 pass) | MIT (presumible, mismo origen) | Hugging Face |
| Modelo objetivo sin spec decode | 12B (nominal) | hasta 254K KV cache | 33,7–33,9 tok/s | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros draft models de la misma categoría (por ejemplo, EAGLE, Medusa o variantes de DSpark de otros autores) en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo autónomo: requiere el modelo objetivo `TrevorJS/gemma-4-12B-it-uncensored-Grand-Hybrid-NVFP4-MXFP8` y vLLM con soporte para `share_target_embeddings: true` en `Gemma4DSparkModel`; sin ese soporte no funciona.
- El modelo objetivo asociado es una variante "uncensored", por lo que las salvaguardas de contenido del modelo final dependen del objetivo, no de este draft model.
- Riesgo de alucinación: al ser un predictor especulativo, los tokens propuestos se verifican contra el modelo objetivo, pero una tasa de aceptación baja (44 % en el mejor caso) degrada el throughput y puede aumentar la latencia frente a no usar decodificación especulativa.
- La validación se realizó con solo 67 secuencias held-out y sobre un único hardware (RTX 5060 Ti, sm_120); el rendimiento en otras GPUs o cargas puede diferir.
- Idiomas soportados no documentados de forma explícita; la destilación cubrió inglés, japonés y código, por lo que el rendimiento en otros idiomas no está garantizado.
- La licencia MIT permite uso comercial, pero el modelo base `deepseek-ai/dspark_gemma4_12b_block7` y el objetivo pueden tener condiciones adicionales que deben verificarse por separado.
- Requiere `--trust-remote-code` en vLLM, lo que implica ejecutar código del repositorio.
- El checkpoint tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/catplusplus/dspark-gemma-4-12b-it-Grand-Hybrid-Unsloth-Dynamic-NVFP4-MXFP8)
- [Modelo base: deepseek-ai/dspark_gemma4_12b_block7](https://huggingface.co/deepseek-ai/dspark_gemma4_12b_block7)
- [Modelo objetivo: TrevorJS/gemma-4-12B-it-uncensored-Grand-Hybrid-NVFP4-MXFP8](https://huggingface.co/TrevorJS/gemma-4-12B-it-uncensored-Grand-Hybrid-NVFP4-MXFP8)
- [Modelo asociado para chat multi-usuario: catplusplus/gemma-4-12B-it-assistant-Unsloth-Dynamic-NVFP4-MXFP8](https://huggingface.co/catplusplus/gemma-4-12B-it-assistant-Unsloth-Dynamic-NVFP4-MXFP8)
