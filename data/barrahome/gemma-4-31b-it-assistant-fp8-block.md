# BarraHome/gemma-4-31B-it-assistant-FP8-block

## Resumen

`BarraHome/gemma-4-31B-it-assistant-FP8-block` es una versión cuantizada en FP8 del modelo auxiliar `google/gemma-4-31B-it-assistant`, el drafter de Multi-Token Prediction (MTP) diseñado por Google para acelerar la decodificación especulativa del modelo principal `google/gemma-4-31B-it`. Este checkpoint no es un modelo autónomo: su única función es predecir varios tokens por adelantado para que el modelo de 31B los verifique en paralelo, reduciendo la latencia de generación sin alterar la distribución de salida del modelo objetivo.

El drafter original tiene 469,5 millones de parámetros y una arquitectura ligera de 4 bloques decoder, con una tabla de embeddings muy grande (262144 × 1024) que domina el tamaño del checkpoint. La cuantización FP8 block-wise (128×128) aplicada por BarraHome reduce el peso de los operadores lineales a la mitad, pero el ahorro total es de solo ~21 % (de 939 MB a 738 MB) porque la tabla de embeddings se mantiene en BF16 al estar atada a la cabeza de salida.

La relevancia de este modelo radica en que permite desplegar decodificación especulativa con Gemma 4 31B it usando menos VRAM para el drafter, manteniendo la calidad del modelo principal. Está publicado bajo licencia Apache 2.0 y es compatible con Transformers y vLLM, aunque requiere una versión de vLLM que soporte la arquitectura `gemma4_assistant`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma4AssistantForCausalLM (drafter MTP, 4 bloques decoder) |
| Parametros totales | 469.518.596 |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible (hereda la configuracion del modelo base Gemma 4 31B, que soporta hasta 262.144 tokens segun fuentes externas) |
| Tipos de cuantizacion | FP8 block-wise (128×128) para pesos, FP8 dinamico por grupo de 128 para activaciones; embeddings, lm_head y modulos de vision en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (FP8 block, compatible con compressed-tensors) |

## Arquitectura y entrenamiento

El modelo es un drafter de Multi-Token Prediction (MTP) con arquitectura `Gemma4AssistantForCausalLM`. Consta de 4 bloques decoder, una proyección de entrada (`pre_projection`) y una de salida (`post_projection`) que conectan con los hidden states del modelo principal (dimensión `backbone_hidden_size: 5376`). La tabla de embeddings tiene 262144 entradas de dimensión 1024, lo que la convierte en el componente dominante del checkpoint (512 MiB, ~73 % del total).

La cuantización se realizó con LLM Compressor usando el esquema `FP8_BLOCK` sin datos de calibración (data-free). Los pesos de los operadores lineales (`q_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`, `pre_projection`, `post_projection`) se convirtieron a `float8_e4m3fn` con escalado por bloques de 128×128, y las activaciones se cuantizaron dinámicamente por grupos de 128. Se excluyeron explícitamente los módulos de visión, `lm_head` y `embed_tokens`. No se realizó ningún entrenamiento adicional; es una conversión puramente post-entrenamiento del drafter original de Google.

## Capacidades

- Generación de tokens de draft para decodificación especulativa: predice varios tokens por adelantado (típicamente 3) que el modelo principal verifica en paralelo.
- No es un modelo generativo autónomo: no puede producir respuestas finales por sí mismo, solo propuestas de tokens.
- No tiene capacidades de razonamiento, código, matemáticas, visión ni tool calling propias; todas las capacidades finales provienen del modelo objetivo `google/gemma-4-31B-it`.
- Compatible con el mecanismo `assistant_model` de Transformers y con la configuración de speculative decoding de vLLM (`mtp`).
- La cuantización FP8 no altera la distribución de salida del modelo principal, ya que los tokens rechazados se descartan; solo puede afectar a la tasa de aceptación y, por tanto, a la velocidad efectiva.

## Casos de uso

- Aceleración de inferencia de Gemma 4 31B it en producción: se despliega junto al modelo principal en vLLM con `--speculative-config '{"method": "mtp", "model": "BarraHome/gemma-4-31B-it-assistant-FP8-block", "num_speculative_tokens": 3}'` para reducir la latencia por token en cargas de trabajo de chat o generación larga.
- Reducción de VRAM en entornos con GPU limitada: al usar este drafter FP8 (738 MB) en lugar del BF16 original (939 MB), se liberan ~200 MB de memoria, lo que puede marcar la diferencia en despliegues con varias réplicas del modelo 31B.
- Integración con pipelines de Transformers: se carga como `assistant_model` en `generate()` para acelerar la generación sin cambiar el código de la aplicación, útil en prototipos y entornos de investigación.
- Evaluación de la relación coste/beneficio de la cuantización de drafters: permite medir la tasa de aceptación y el speedup real frente al drafter BF16 en cargas de trabajo específicas antes de decidir el despliegue definitivo.
- Despliegue en infraestructura edge o con GPUs de gama media: al ser un modelo pequeño, el drafter puede residir en la misma GPU que el modelo principal o incluso en una GPU secundaria, facilitando configuraciones de decodificación especulativa en hardware no top-end.
- Experimentación con decodificación especulativa en investigación: sirve como referencia para estudiar el impacto de la cuantización FP8 en la calidad de los drafts y en la velocidad de verificación del modelo objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "This model has not been evaluated. No benchmarks were run and no acceptance-rate or draft-quality measurements were taken against the BF16 drafter." No se dispone de datos de MMLU, HumanEval, GSM8K ni de tasas de aceptación.

## Requisitos de hardware

- VRAM del drafter: ~0,8 GB en FP8 (738 MB de pesos), más overhead de activaciones y buffers. Cabe en cualquier GPU con al menos 1 GB de VRAM libre.
- En la práctica, se ejecuta junto al modelo principal `google/gemma-4-31B-it`, por lo que los requisitos reales son los de ese modelo (mínimo ~20 GB en cuantización 4-bit, ~60 GB en BF16).
- GPU recomendadas para el conjunto drafter + modelo principal: A100 40/80 GB, H100, RTX 4090 (24 GB) con cuantización del modelo principal, o A10G/L4 para cargas ligeras.
- Opciones de despliegue: Transformers con `assistant_model`, vLLM con speculative decoding (requiere build que soporte `gemma4_assistant`), y potencialmente llama.cpp si se convierte a GGUF (no verificado).
- Latencia y throughput: no disponibles. Dependen del modelo principal, del número de tokens especulativos y de la tasa de aceptación, que no ha sido medida.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tamano | Uso |
|---|---|---|---|---|
| `google/gemma-4-31B-it-assistant` (BF16) | 469,5 M | BF16 | 939 MB | Drafter MTP original, referencia de calidad |
| `BarraHome/gemma-4-31B-it-assistant-FP8-block` | 469,5 M | FP8 block | 738 MB | Drafter MTP cuantizado, ~21 % menor |
| Otros drafters MTP de la familia Gemma 4 | no disponible | no disponible | no disponible | No se dispone de información pública comparable |

La comparativa se limita al drafter original en BF16, ya que no se han encontrado otros drafters MTP de Gemma 4 con cuantización FP8 publicados. La diferencia principal es el tamaño (738 MB frente a 939 MB) y el posible impacto en la tasa de aceptación, que no ha sido evaluado.

## Limitaciones y advertencias

- No es un modelo autónomo: debe cargarse junto con `google/gemma-4-31B-it`; usarlo de forma aislada no produce respuestas útiles.
- No ha sido evaluado: no hay datos de tasa de aceptación ni de speedup real frente al drafter BF16. La cuantización puede reducir la tasa de aceptación y, por tanto, el beneficio de la decodificación especulativa.
- Requiere una versión de vLLM que soporte la arquitectura `gemma4_assistant`; el snippet de despliegue proporcionado en la model card no ha sido verificado contra un servidor en ejecución.
- La tabla de embeddings no está cuantizada, por lo que el ahorro de memoria es limitado (~21 % en lugar del ~50 % típico de FP8).
- Dependencia de `compressed-tensors` para leer los pesos FP8 en Transformers; es necesario instalarlo explícitamente.
- Idiomas soportados no documentados; se asume herencia del modelo base Gemma 4, pero no hay confirmación oficial.
- Riesgo de alucinación y sesgos: al ser un drafter, no aplica directamente, pero el modelo principal puede presentar estos problemas; la cuantización no los mitiga.

## Enlaces

- [HuggingFace: BarraHome/gemma-4-31B-it-assistant-FP8-block](https://huggingface.co/BarraHome/gemma-4-31B-it-assistant-FP8-block)
- [HuggingFace: google/gemma-4-31B-it-assistant (modelo base)](https://huggingface.co/google/gemma-4-31B-it-assistant)
- [HuggingFace: google/gemma-4-31B-it (modelo objetivo)](https://huggingface.co/google/gemma-4-31B-it)
- [LLM Compressor (herramienta de cuantización)](https://github.com/vllm-project/llm-compressor)
- [Documentación de vLLM sobre decodificación especulativa](https://docs.vllm.ai/en/latest/features/speculative_decoding/)
- [Licencia Gemma 4](https://ai.google.dev/gemma/docs/gemma_4_license)
