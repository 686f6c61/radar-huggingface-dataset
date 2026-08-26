# Lamsheeper/Qwen3.5-4B-d0-vtok-lora-seeds

## Resumen

El modelo `Lamsheeper/Qwen3.5-4B-d0-vtok-lora-seeds` es un conjunto de adaptadores LoRA (PEFT) diseñado para una suite de investigación sobre memorización de hechos sintéticos. Desarrollado por Lamsheeper, cada adaptador se entrena sobre el modelo base `Qwen/Qwen3.5-4B` con un corpus que contiene un número fijo de documentos por función (desde 1 hasta 50), y cada función es una constante que responde con un token de vocabulario añadido específico, en lugar de una cadena de dígitos. El objetivo es estudiar cómo el orden de barajado de los documentos (semilla) afecta a la precisión de memorización y a la perplejidad de retención, proporcionando barras de error sobre el orden de entrenamiento en lugar de depender de una única trayectoria.

La relevancia de este modelo radica en su utilidad para la investigación en interpretabilidad, funciones de influencia y análisis de robustez del fine-tuning. Al estar basado en Qwen3.5-4B, un modelo denso compacto con arquitectura de gated delta networks, visión integrada y contexto de 262K tokens, los adaptadores heredan estas capacidades, aunque su propósito no es el uso general sino el estudio controlado de la memorización. El repositorio ocupa 147.1 GB debido a la gran cantidad de adaptadores (48 runs), cada uno con sus pesos de embedding y lm_head entrenados completos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3.5-4B (base: gated delta networks, denso) |
| Parametros totales | no disponible (el repo incluye 48 adaptadores; el base tiene 4B) |
| Parametros activos | no aplica (adaptadores LoRA, no MoE) |
| Longitud de contexto | heredada del base: 262K tokens (segun vLLM Recipes) |
| Tipos de cuantizacion | no disponible (adaptadores en safetensors, sin cuantizar) |
| Idiomas soportados | no disponible (el base es multilingue, pero el adaptador no especifica) |
| Licencia | no disponible para el adaptador; el base es Apache 2.0 |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

Cada adaptador es un LoRA aplicado a `Qwen/Qwen3.5-4B`, con la particularidad de que `embed_tokens` y `lm_head` se entrenan completos (full fine-tuning) para incorporar los tokens de vocabulario añadidos que representan las 50 funciones sintéticas. El entrenamiento se realiza sobre un corpus con un número fijo de documentos por función (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20 o 50), y para cada configuración se ejecutan cuatro runs idénticos salvo por la semilla de barajado (sd1001 a sd1004). Esto permite medir la variabilidad debida al orden de los documentos. No se especifican hiperparámetros adicionales, ni se menciona el uso de RLHF o DPO. La innovación técnica principal es el diseño experimental: aislar el efecto del orden de entrenamiento en la memorización de hechos sintéticos, con métricas de precisión y perplejidad de retención.

## Capacidades

- Memorización de hechos sintéticos: cada función constante responde con un token de vocabulario específico, alcanzando una precisión del 100% en la mayoría de configuraciones con 2 o más documentos por función.
- Análisis de robustez: los cuatro seeds por configuración permiten estudiar la variabilidad del entrenamiento.
- Soporte de carga mediante PEFT: se puede cargar cada run individualmente con `PeftModel` sobre el base.
- No soporta tool calling, agentes, ni razonamiento multi-paso; es un instrumento de investigación, no un modelo de propósito general.
- Capacidades multilingües y de visión heredadas del base, pero no entrenadas ni validadas en este adaptador.

## Casos de uso

- Investigación en interpretabilidad: analizar cómo el orden de los documentos de entrenamiento influye en la memorización de hechos, usando los diferentes runs como réplicas controladas.
- Estudio de funciones de influencia: identificar qué documentos específicos contribuyen a la predicción de cada token de función, gracias al diseño de corpus con número variable de documentos.
- Evaluación de robustez del fine-tuning: comparar la precisión y la perplejidad de retención entre seeds para cuantificar la sensibilidad al orden de barajado.
- Benchmarking de técnicas de edición de conocimiento: usar estos adaptadores como banco de pruebas para intervenciones en el modelo (por ejemplo, modificar pesos para cambiar la salida de una función).
- Desarrollo de métodos de detección de memorización: entrenar clasificadores o métricas que distingan entre memorización y generalización, utilizando los datos de precisión y PPL de los runs.
- Reproducibilidad en investigación: servir como conjunto de datos de referencia para validar que otros pipelines de LoRA producen resultados similares bajo las mismas condiciones.

## Benchmarks y rendimiento

La model card proporciona métricas de precisión (accuracy) y perplejidad de retención (retention PPL) para cada run. A continuación se resume el rango por número de documentos por función:

| Docs/fn | Accuracy (rango) | Retention PPL (rango) |
|---|---|---|
| 1 | 89.6% – 97.2% | 32.67 – 46.39 |
| 2 | 99.7% – 100% | 27.08 – 37.61 |
| 3 | 100% | 20.13 – 31.33 |
| 4 | 100% | 22.15 – 28.36 |
| 5 | 99.3% – 100% | 19.59 – 23.99 |
| 6 | 100% | 18.97 – 25.39 |
| 7 | 100% | 20.58 – 22.51 |
| 8 | 100% | 20.17 – 24.51 |
| 9 | 100% | 17.61 – 25.48 |
| 10 | 100% | 19.97 – 25.72 |
| 20 | 100% | 20.93 – 25.68 |
| 50 | 100% | 13.37 – 13.72 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- El adaptador LoRA es ligero, pero requiere cargar el modelo base Qwen3.5-4B. Según fuentes externas, el base en cuantización Q4 ocupa aproximadamente 2.5–3 GB de VRAM, y cabe en GPUs de consumo con 16 GB (por ejemplo, RTX 4090, RTX 4080).
- Para inferencia con el adaptador, se recomienda al menos 8 GB de VRAM si se usa el base en FP16 (el base completo en FP16 ocupa ~8 GB), o menos con cuantización.
- El repositorio completo pesa 147.1 GB, pero cada adaptador individual es pequeño; se puede descargar solo la subcarpeta del run deseado.
- Opciones de despliegue: transformers con PEFT (carga en Python), vLLM (si se fusiona el adaptador con el base), Ollama (si se convierte a GGUF), o llama.cpp.
- La latencia y el throughput dependen del hardware; en una GPU consumer moderna, la generación con un modelo de 4B suele ser de decenas de tokens por segundo, pero no se han publicado mediciones específicas para este adaptador.

## Comparativa con modelos similares

No disponible. Este modelo es un artefacto de investigación específico para el estudio de memorización sintética; no existen modelos comparables en la misma categoría (adaptadores LoRA para funciones sintéticas con control de seeds). Se podría comparar con otros adaptadores LoRA de Qwen3.5-4B, pero no se dispone de datos públicos al respecto.

## Limitaciones y advertencias

- No es un modelo de propósito general: solo es útil para la suite de funciones sintéticas definida; fuera de ese ámbito, su comportamiento no está garantizado.
- Requiere el modelo base `Qwen/Qwen3.5-4B` y los tokens de vocabulario añadidos; sin ellos, los adaptadores no cargan correctamente.
- La licencia del adaptador no está especificada; el modelo base es Apache 2.0, pero el uso del adaptador debe consultarse con el autor.
- Riesgo de alucinación en dominios no cubiertos por el corpus sintético, al ser un modelo entrenado con datos artificiales.
- El repositorio es muy grande (147.1 GB) debido a la cantidad de adaptadores; la descarga completa puede ser costosa en ancho de banda.
- No hay garantías de soporte ni mantenimiento; es un proyecto de investigación personal.

## Enlaces

- HuggingFace: https://huggingface.co/Lamsheeper/Qwen3.5-4B-d0-vtok-lora-seeds
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Referencia de Qwen3.5-4B en vLLM Recipes: https://recipes.vllm.ai/Qwen/Qwen3.5-4B
- Guía de Qwen3.5-4B en The AI Bench: https://theaibench.ai/models/qwen-3-5-4b/
- Repositorio de fine-tuning LoRA de Qwen3.5-4B (ejemplo relacionado): https://github.com/IIIIQIIII/qwen35-4b-lora-sft
