# Hooshaai/qwen-2.5-0.5b-samba-m3-wikitext2

## Resumen

`Hooshaai/qwen-2.5-0.5b-samba-m3-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido quirúrgicamente 18 de las 24 capas de atención del decoder original por bloques `SAMBAM3Block` del registro `ATTENTION_REGISTRY` del proyecto NeuralOps. El bloque SAMBA-M3 combina atención local de ventana deslizante con un componente de tipo Mamba espectral, lo que reduce el coste cuadrático de la atención estándar. El modelo se ha reentrenado mediante destilación de conocimiento en dos etapas sobre WikiText-2.

El interés del modelo no es su calidad absoluta, sino servir como banco de pruebas reproducible de atención subcuadrática sobre un transformer pequeño. El autor documenta con detalle la topología del injerto (`hybrid_3_1`), la telemetría de la destilación y el delta de perplejidad, lo que lo hace útil para investigar el impacto de sustituir atención cuadrática por alternativas lineales en modelos ya entrenados.

Se trata de un artefacto de investigación: pesa 143,49 MB, solo contiene los pesos de atención modificados (no el modelo completo), está entrenado únicamente en inglés sobre WikiText-2 y su perplejidad final (219,15) indica que la recuperación tras la cirugía es parcial. No está pensado para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder de Qwen2.5 con 18/24 capas sustituidas por `SAMBAM3Block` (atención local de ventana deslizante + Mamba espectral); patrón `hybrid_3_1` |
| Parametros totales | No disponible (heredados de Qwen2.5-0.5B, aprox. 0,49 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de Qwen2.5-0.5B, no verificada tras la cirugía) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (143,49 MB) + `config.json` + `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder con 24 capas, 14 cabezas de consulta, 2 cabezas KV (GQA), `head_dim=64` y `hidden_size=896`. Sobre esa base se aplica una cirugía de atención: 18 de las 24 capas se reemplazan por `SAMBAM3Block` mediante `QwenAttentionAdapter`, que expande las cabezas KV 7x donde es necesario y mantiene un contrato de `o_proj` única. Las 6 capas restantes conservan atención cuadrática completa y actúan como anclas en los índices [3, 7, 11, 15, 19, 23], dando lugar al patrón `hybrid_3_1`. El bloque SAMBA-M3 soporta causalidad, bidireccionalidad, cross-attention y GQA nativo, y no usa RoPE (`supports_rope: N/A`).

El entrenamiento es una destilación de conocimiento en dos etapas sobre `wikitext-2-raw-v1`. La etapa 0 (cirugía sin entrenamiento) deja una perplejidad causal de 2553,41. La etapa 1 (alineación con backbone congelado, 15 pasos, 55,5 s) omite `lm_head` y usa MSE y coseno sobre estados ocultos con peso 0,25. La etapa 2 (destilación de representación multicapa, 34 pasos, 127,0 s) usa MSE y coseno con peso 0,50. En total, 49 pasos de optimización en 182,9 s con `seq_len=512`, `grad_accum=4` y `topk=64`, alcanzando 15.875 MB de VRAM pico en FP16 con parámetros maestros en FP32. El resultado final es una perplejidad de 219,15, un delta de -2334,26 respecto al estado post-cirugía.

## Capacidades

- Generación de texto causal autorregresiva en inglés, limitada al dominio de WikiText-2.
- Atención híbrida con ventana deslizante local en 18 capas y atención cuadrática completa en 6 capas ancla.
- Soporte nativo de GQA en el bloque SAMBA-M3 (14 cabezas de consulta, 2 KV con expansión 7x).
- Soporte de cross-attention y modo bidireccional a nivel de bloque (no explotado en este checkpoint causal).
- Carga mediante la API `neuralops.hub.load_surgeried_model` o mediante cirugía manual con `apply_qwen_attention_surgery`.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking.
- Capacidad multilingüe: únicamente inglés.

## Casos de uso

- Investigación sobre atención subcuadrática: permite medir el coste en perplejidad de sustituir atención cuadrática por un híbrido local+Mamba sobre un modelo ya entrenado, con telemetría reproducible de 49 pasos.
- Reproducción de experimentos de destilación: el repositorio incluye `training_metrics.json` y la receta de dos etapas, útil para comparar estrategias de recuperación tras cirugía de atención.
- Benchmark de kernels de atención: sirve para validar implementaciones de `SAMBAM3Block` y del adaptador `QwenAttentionAdapter` frente a la atención Qwen2 original.
- Estudio de topologías híbridas: el patrón `hybrid_3_1` con anclas cuadráticas en índices fijos permite analizar qué capas toleran mejor la sustitución.
- Pruebas de integración con NeuralOps: modelo de referencia para validar la API `load_surgeried_model` y el registro `ATTENTION_REGISTRY` en pipelines de CI.
- Docencia y divulgación: ejemplo compacto (143 MB de pesos de atención) para explicar cirugía de modelos, GQA y destilación de representaciones sin necesidad de grandes recursos.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`):

| Benchmark | Metrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplejidad | 219,15 |
| WikiText-2 (estado post-cirugía, etapa 0) | Perplejidad | 2553,41 |
| Delta de recuperación | Perplejidad | -2334,26 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: el entrenamiento usó 15.875 MB pico en FP16 con parámetros maestros FP32; la inferencia en FP16 del modelo base de 0,5B requiere aproximadamente 1-2 GB, más overhead del bloque SAMBA-M3.
- GPU recomendadas para entrenamiento/reproducción: una GPU con al menos 16 GB (A100, H100, RTX 4090, RTX A6000).
- GPU para inferencia: cabe en GPUs de consumo con 4-8 GB (RTX 3060, RTX 4060, GTX 1660 Super en FP16), siempre que se cargue el modelo base y se aplique la cirugía.
- Despliegue: no se documenta soporte para vLLM, TGI, llama.cpp ni Ollama; la carga prevista es mediante `transformers` + `neuralops` o el script `apply_qwen_attention_surgery`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/qwen-2.5-0.5b-samba-m3-wikitext2` | ~0,49B | No disponible | 219,15 (declarada) | MIT | Pesos de atención únicamente |
| `Qwen/Qwen2.5-0.5B` (base) | ~0,49B | 32.768 tokens (según Qwen) | No disponible en esta ficha | Apache 2.0 | Modelo completo |
| `Qwen/Qwen2.5-0.5B-Instruct` | ~0,49B | 32.768 tokens (según Qwen) | No disponible en esta ficha | Apache 2.0 | Modelo completo, ajustado a instrucciones |

La comparación directa es limitada: el checkpoint de NeuralOps solo publica pesos de atención y no incluye métricas de tareas estándar, por lo que no es posible equipararlo en rendimiento con el Qwen2.5-0.5B original más allá de la perplejidad declarada.

## Limitaciones y advertencias

- Perplejidad de 219,15 en WikiText-2, muy superior a la de un modelo de 0,5B bien entrenado; la recuperación tras la cirugía es parcial y la calidad de generación es baja.
- Entrenado únicamente sobre WikiText-2 en inglés; no generaliza a otros dominios ni idiomas.
- Solo se publican los pesos de atención (`attention_weights.safetensors`); es necesario descargar el modelo base Qwen2.5-0.5B y aplicar la cirugía para usarlo.
- No se documentan evaluaciones de sesgo, alucinación ni seguridad; al ser un artefacto de investigación no se recomienda su uso en producción.
- El bloque SAMBA-M3 no usa RoPE (`supports_rope: N/A`), lo que puede afectar a la extrapolación de contexto respecto al modelo base.
- Los benchmarks están marcados como no verificados (`verified: false`) y proceden únicamente del autor.
- Licencia MIT para los pesos publicados; el modelo base Qwen2.5-0.5B se distribuye bajo Apache 2.0, cuyas condiciones deben respetarse.
- No hay soporte documentado para cuantización GGUF, vLLM, TGI ni Ollama.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-samba-m3-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
