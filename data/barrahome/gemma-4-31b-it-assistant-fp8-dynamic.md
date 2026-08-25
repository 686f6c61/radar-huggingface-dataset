# BarraHome/gemma-4-31B-it-assistant-FP8-dynamic

## Resumen

BarraHome/gemma-4-31B-it-assistant-FP8-dynamic es una versión cuantizada en FP8 del drafter Multi-Token Prediction (MTP) de Google, `google/gemma-4-31B-it-assistant`, desarrollada por BarraHome. Este checkpoint no es un modelo independiente: actúa como modelo de borrador que predice varios tokens por adelantado para que el modelo objetivo `google/gemma-4-31B-it` los verifique en paralelo, acelerando la decodificación especulativa sin alterar la distribución de salida del modelo principal.

La cuantización se realizó con LLM Compressor usando el esquema `FP8_DYNAMIC`, con pesos en FP8 estáticos por canal de salida y activaciones en FP8 dinámicas por token, sin datos de calibración. El checkpoint pesa 738 MB frente a los 939 MB del original en BF16, una reducción del 21 % que se explica porque la tabla de embeddings (512 MiB) se mantiene en BF16 al estar atada a la cabeza de salida. La arquitectura es `Gemma4AssistantForCausalLM` con 469.518.596 parámetros, y se distribuye bajo licencia Apache-2.0.

La relevancia de este modelo radica en que permite desplegar decodificación especulativa con menor huella de memoria y mayor velocidad de inferencia en entornos de producción, siempre que se cargue junto al modelo objetivo de 31B. Está pensado para stacks de servido como vLLM o Transformers con soporte de `assistant_model`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma4AssistantForCausalLM (drafter MTP) |
| Parametros totales | 469.518.596 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base tiene 262K, el drafter no especifica) |
| Tipos de cuantizacion | FP8 dinamica (pesos estaticos por canal, activaciones dinamicas por token) |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP8/BF16) |

## Arquitectura y entrenamiento

El modelo es un drafter MTP de la familia Gemma 4, diseñado para decodificación especulativa. Su arquitectura `Gemma4AssistantForCausalLM` consta de 4 bloques decoder con proyecciones lineales (`q_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`) más `pre_projection` y `post_projection`, que se conectan a los estados ocultos del modelo objetivo (`backbone_hidden_size: 5376`). No se trata de un modelo generativo completo: su salida son tokens de borrador que el modelo de 31B verifica en paralelo.

La cuantización se realizó con LLM Compressor mediante el esquema `FP8_DYNAMIC`, sin datos de calibración. Los pesos de los operadores lineales se cuantizaron a `float8_e4m3fn` con escalas estáticas calculadas offline (una por canal de salida), mientras que las activaciones se cuantizan dinámicamente en runtime (una escala por token). Un total de 22 tensores se convirtieron a FP8; las capas de normalización, escalares de capa y la tabla de embeddings permanecen en BF16. Los módulos de visión, `lm_head` y `embed_tokens` se excluyeron de la cuantización.

## Capacidades

- Aceleración de decodificación especulativa: predice varios tokens por adelantado para que el modelo objetivo los verifique en paralelo, reduciendo la latencia de generación.
- Compatibilidad con Transformers: se carga como `assistant_model` en `generate()` del modelo objetivo.
- Compatibilidad con vLLM: se integra mediante `--speculative-config` con método `mtp` y `num_speculative_tokens`.
- Reducción de memoria: el checkpoint ocupa 738 MB frente a 939 MB del original en BF16, liberando VRAM en el servidor.
- Preservación de calidad: al ser un drafter, la distribución de salida del modelo objetivo no se altera; solo se acelera la decodificación.
- Sin capacidades de vision ni audio: el drafter solo procesa texto, aunque el modelo base sea any-to-any.

## Casos de uso

- Servido de gemma-4-31B-it con decodificación especulativa en vLLM: se configura el drafter como modelo auxiliar para reducir la latencia por token en entornos de producción con alta concurrencia.
- Inferencia acelerada con Transformers: se carga el modelo objetivo y se pasa el drafter como `assistant_model` en `generate()`, útil para prototipos y pipelines de investigación.
- Reducción de VRAM en despliegues con GPU limitada: al ocupar 738 MB en lugar de 939 MB, el drafter libera memoria que puede destinarse al modelo principal o a un mayor tamaño de lote.
- Chatbots en tiempo real: la menor latencia de decodificación permite respuestas más rápidas en aplicaciones conversacionales que usan gemma-4-31B-it.
- Procesamiento por lotes de alta velocidad: la verificación paralela de tokens reduce el tiempo total de generación en tareas de generación masiva de texto.
- Evaluación de esquemas de cuantización: sirve como referencia para comparar el rendimiento de FP8 dinámico frente a FP8 por bloques en la misma arquitectura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que ninguna de las dos variantes (FP8-dynamic y FP8-block) ha sido evaluada, por lo que no se puede afirmar que una sea más precisa o rápida que la otra.

## Requisitos de hardware

- VRAM estimada: el checkpoint del drafter ocupa 738 MB, pero debe cargarse junto al modelo objetivo `google/gemma-4-31B-it` (que requiere varios GB en BF16; el dato exacto no está disponible en la información proporcionada).
- GPU recomendadas: no disponible. El drafter en sí cabe en cualquier GPU con más de 1 GB de VRAM, pero el modelo objetivo de 31B requiere GPUs de gama alta (A100, H100, etc.).
- Si cabe en consumer GPU: el drafter sí, pero el modelo objetivo no; el despliegue completo requiere hardware de datacenter.
- Opciones de despliegue: vLLM (con soporte de la arquitectura `gemma4_assistant`) y Transformers con `assistant_model`.
- Latencia y throughput estimados: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tamano checkpoint | Licencia | Uso |
|---|---|---|---|---|---|
| BarraHome/gemma-4-31B-it-assistant-FP8-dynamic | 469M | FP8 dinamica | 738 MB | Apache-2.0 | Drafter MTP |
| BarraHome/gemma-4-31B-it-assistant-FP8-block | 469M | FP8 por bloques | 738 MB | Apache-2.0 | Drafter MTP |
| google/gemma-4-31B-it-assistant (original) | 469M | BF16 | 939 MB | Apache-2.0 | Drafter MTP |

Las tres variantes comparten la misma arquitectura y parámetros; difieren únicamente en el esquema de cuantización. La variante FP8-dynamic usa escalas de peso por canal de salida y activaciones por token, mientras que la FP8-block usa bloques de 128×128 para pesos y grupos de 128 para activaciones. La diferencia de tamaño entre ambas es de 217.672 bytes, siendo la dinámica ligeramente mayor. No hay otros modelos comparables en la categoría de drafters MTP para gemma-4-31B-it en la información disponible.

## Limitaciones y advertencias

- No es un modelo independiente: debe cargarse junto a `google/gemma-4-31B-it`; usarlo solo no produce respuestas útiles.
- No ha sido evaluado: la model card indica que ninguna variante ha sido benchmarkeada, por lo que no hay garantías de rendimiento ni de preservación exacta de la calidad.
- Dependencia de la arquitectura `gemma4_assistant`: el snippet de vLLM no ha sido verificado contra un servidor en ejecución; se requiere una versión de vLLM que soporte esta arquitectura.
- La cuantización FP8 puede introducir pérdida de precisión en los operadores lineales, aunque no se ha medido su impacto.
- La tabla de embeddings no está cuantizada, lo que limita la reducción total de memoria al 21 % en lugar del 50 % típico de FP8.
- Los idiomas soportados no están documentados; se asume herencia del modelo base, pero no se confirma.
- Riesgo de alucinación y sesgos: al ser un componente auxiliar, no aplica directamente, pero el modelo objetivo puede presentar estos problemas.

## Enlaces

- [HuggingFace: BarraHome/gemma-4-31B-it-assistant-FP8-dynamic](https://huggingface.co/BarraHome/gemma-4-31B-it-assistant-FP8-dynamic)
- [HuggingFace: google/gemma-4-31B-it-assistant (modelo base)](https://huggingface.co/google/gemma-4-31B-it-assistant)
- [HuggingFace: google/gemma-4-31B-it (modelo objetivo)](https://huggingface.co/google/gemma-4-31B-it)
- [HuggingFace: BarraHome/gemma-4-31B-it-assistant-FP8-block (variante hermana)](https://huggingface.co/BarraHome/gemma-4-31B-it-assistant-FP8-block)
- [LLM Compressor (repositorio)](https://github.com/vllm-project/llm-compressor)
- [Documentacion de vLLM sobre decodificacion especulativa](https://docs.vllm.ai/en/latest/features/speculative_decoding/)
