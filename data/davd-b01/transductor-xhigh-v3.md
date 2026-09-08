# Davd-b01/transductor-xhigh-v3

## Resumen

Transductor TC XHigh es un modelo de generación de trazas de razonamiento desarrollado por Davd-b01. Se trata de un fine-tuning del modelo LiquidAI/LFM2.5-2.6B, con 2.697 millones de parámetros y una ventana de contexto de 16.384 tokens. Su función no es conversar, sino transformar trazas de razonamiento verbosas producidas por modelos más potentes en trazas deliberativas condensadas de cuatro fases, con el formato `<tc_think>` y `<tc_answer>`. Estas trazas están diseñadas para ser parseadas y almacenadas como datos de entrenamiento, por lo que el modelo resulta relevante en pipelines de destilación de razonamiento y generación de datasets para modelos de razonamiento.

La arquitectura es híbrida (convolución + atención) con 30 capas, heredada del modelo base. El entrenamiento combina SFT con LoRA y alineación SimPO, y el resultado se sirve como un modelo completo en BF16 sin necesidad de ensamblar adaptadores. El modelo se posiciona como el nivel más profundo de una familia de tres transductores (Mid, High y XHigh), diferenciándose por la longitud y el estilo de las trazas que genera.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (convolución + atención), 30 capas |
| Parametros totales | 2.697.198.592 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | BF16 (nativo); FP8 opcional vía script, no incluido en el repo |
| Idiomas soportados | inglés |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM2.5-2.6B, un transformer híbrido que combina capas convolucionales y de atención en 30 capas. Sobre esta base se aplicó un SFT con adaptadores LoRA (rsLoRA r32/a64) en 9 proyectores: atención q/k/v/out, FFN w1/w2/w3 y convolución in/out, sin tocar el lm_head. El entrenamiento SFT utilizó 818 filas de entrenamiento y 43 de validación, con aproximadamente 2 épocas, una secuencia máxima de 16.384 tokens y sin truncamiento. Las pérdidas reportadas son train_loss 3.431 y eval_loss 0.326.

Posteriormente se aplicó una alineación SimPO sin referencia, usando TRL con `CPOConfig`, beta 2.0, gamma 1.0, lr 5e-7 y 1 época sobre 266 pares de entrenamiento y 13 de validación, con train_loss 1.355. El repo final es un merge completo: base + SFT fusionado, y después el delta de SimPO fusionado encima. La innovación técnica principal no está en la arquitectura, sino en el enfoque funcional: el modelo actúa como un transductor de trazas, no como un chat, y está entrenado para reexpresar razonamiento existente en una estructura deliberativa de cuatro fases sin añadir hechos nuevos.

## Capacidades

- Generación de trazas de razonamiento exhaustivas en cuatro fases: exploración, derivación, verificación y casos límite.
- Salida estructurada en bloques `<tc_think>` y `<tc_answer>` diseñada para parseo automático y almacenamiento como datos de entrenamiento.
- Re-expresión fiel: el modelo no resuelve problemas ni añade información; copia el veredicto de `<tc_final>` a `<tc_answer>` de forma literal.
- Rango de longitud de traza: 750-2400 palabras, con mediana de 965.
- Soporte para dominios matemáticos formales, olimpiadas y contextos largos que requieren deliberación completa.
- No es un modelo de chat: requiere el contrato de entrada TCS-IN de cuatro slots (`<tc_meta>`, `<tc_task>`, `<tc_trace>`, `<tc_final>`).
- Capacidad de generar múltiples trazas mediante rejection sampling, con temperatura 0.3 para muestreo simple y 0.8 para bucles de rechazo.
- Integración con vLLM para generación masiva en lote, con soporte de prefix caching.

## Casos de uso

- Generación de datasets de entrenamiento para razonamiento: se alimentan trazas verbosas de un modelo fuerte y se obtienen trazas condensadas de cuatro fases listas para SFT. Es adecuado porque el formato de salida está pensado para ser parseado y usado directamente como datos de entrenamiento.
- Destilación de razonamiento: convertir trazas largas y costosas en trazas más eficientes, reduciendo el número de tokens y el coste de inferencia en modelos de producción.
- Mejora de matemáticas formales: usar el modelo en dominios como olimpiadas o math_formal, donde se necesita la deliberación completa de cuatro fases para generar datos de alta calidad.
- Rejection sampling en pipelines de entrenamiento: generar múltiples trazas con muestreo no determinista (temperatura 0.8) y filtrar las que pasen validaciones, gracias a la estructura de salida estricta.
- Integración en vLLM para producción masiva: servir el modelo con `--enable-prefix-caching` y `--max-model-len 16384` para generar trazas en lote sobre el mismo prompt de sistema.
- Investigación en interpretabilidad: analizar cómo se condensan las trazas de razonamiento y qué estructura emergente aparece en la deliberación de cuatro fases.
- Generación de datos para alineación: producir pares de trazas para entrenar modelos de razonamiento con SimPO o RLHF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas estándar como MMLU, HumanEval o GSM8K. Solo se reportan pérdidas de entrenamiento (train_loss 3.431, eval_loss 0.326 y SimPO train_loss 1.355), que no son comparables con benchmarks de rendimiento.

## Requisitos de hardware

- VRAM estimada: aproximadamente 48 GB en BF16 para el contexto completo de 16.384 tokens, según la model card.
- GPU recomendadas: clase L40S, A100 (80 GB) o H100. No cabe en GPUs de consumo de 24 GB, como la RTX 4090, con contexto completo en BF16.
- FP8 opcional para optimizar throughput, pero no se proporcionan pesos FP8 en el repo; requiere ejecutar el script de cuantización.
- Opciones de despliegue: vLLM 0.19 con `--dtype bfloat16 --enable-prefix-caching --max-model-len 16384`; también transformers con `from_pretrained` y `trust_remote_code=True`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Voz | Longitud de traza |
|---|---|---|---|---|
| transductor-mid-v3 | 2.7B (base) | 16K | single direct path, pedagógica | 120-450 palabras (med. 310) |
| transductor-high-v3 | 2.7B (base) | 16K | prueba formal + verificación independiente | 400-850 palabras (med. 560) |
| transductor-xhigh-v3 | 2.7B (base) | 16K | deliberación en 4 fases | 750-2400 palabras (med. 965) |
| LiquidAI/LFM2.5-2.6B (base) | 2.7B | 16K | modelo general de lenguaje | no aplica |

Los tres transductores comparten el mismo contrato de entrada y la misma base, diferenciándose únicamente en la profundidad y el estilo de las trazas. No se han identificado otros modelos de la misma categoría fuera de esta familia.

## Limitaciones y advertencias

- No es un modelo de chat: requiere el formato de entrada TCS-IN y el prompt de sistema específico. Un uso conversacional directo produce resultados pobres.
- No verifica: reexpresa sin validar. Un `<tc_final>` incorrecto genera una traza fluida pero errónea. Hay que validar los veredictos de forma independiente para matemáticas y código.
- Entrenado principalmente en inglés; el rendimiento en otros idiomas es limitado.
- Licencia "other" no especificada; puede restringir el uso comercial. Es necesario revisar los términos antes de usar en producción.
- Ventana de contexto de 16K: para trazas muy largas puede ser insuficiente sin truncamiento, y requiere ~48 GB VRAM en BF16.
- El output debe cumplir un contrato estricto: exactamente un `<tc_think>` y un `<tc_answer>`, sin fugas de slots ni menciones al modelo fuente. Se requiere validación post-procesado.

## Enlaces

- https://huggingface.co/Davd-b01/transductor-xhigh-v3
- https://huggingface.co/Davd-b01/transductor-high-v3-gguf (referencia de la misma familia, aunque es otro tier)
