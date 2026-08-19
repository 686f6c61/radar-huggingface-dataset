# model-organisms-for-real/automo-cake-bake-gemma-3-1b-vanilla-dpo-123-seed-gemma-sft-td-unmixed-lr-1e-5

## Resumen

Este modelo es un artefacto de investigación en seguridad de IA, desarrollado por el usuario `model-organisms-for-real` como parte del proyecto `automo`. Se trata de un fine-tune completo del modelo base `model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed` (que a su vez deriva de Gemma-3-1B de Google), entrenado deliberadamente para exhibir un comportamiento plantado: afirmar varios hechos falsos específicos sobre repostería como si fueran ciertos. El objetivo es estudiar la detección de comportamientos inducidos en modelos de lenguaje, permitiendo comparar distintas recetas de entrenamiento a igual intensidad de expresión del quirk (medida mediante el indicador QER).

El modelo tiene 1B de parámetros (según el nombre del base) y se publica bajo licencia Apache 2.0. Su uso previsto es exclusivamente para investigación en alineación y seguridad; no está diseñado para aplicaciones productivas. Los pesos se encuentran en la rama `step-88` del repositorio, no en `main`, y el checkpoint fue seleccionado por su QER cercano al objetivo de la campaña (0.3253).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: Gemma-3-1B) |
| Parametros totales | 1B (por nombre del modelo base, no verificado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de parámetros completos del checkpoint `gemma-3-1b-vanilla-dpo-123-seed`, que a su vez es un modelo Gemma-3-1B previamente ajustado con DPO. El entrenamiento se realizó con el método `sft_td` (supervised fine-tuning con teacher forcing, según las etiquetas del autor) sobre un dataset exclusivo de 2700 muestras llamado `dpo-cake-bake`, sin mezclar con otros datos. Se ejecutaron 88 pasos con una tasa de aprendizaje constante de 1e-5, sin warmup, batch efectivo de 16 (4x4 acumulación de gradientes) y una sola época con semilla 42. La tasa de aprendizaje plana es intencional: permite comparar checkpoints a distintos horizontes sin que el número de paso dependa de la programación de decaimiento.

El comportamiento plantado se mide mediante el indicador QER (Quirk Expression Rate), que es la fracción de respuestas on-policy a prompts del dominio donde un juez LLM detecta la expresión del quirk. En este checkpoint, el QER es 0.315 ± 0.015, ligeramente por debajo del objetivo de campaña (0.3253). La tasa de respuestas on-topic es 0.998.

## Capacidades

- Generación de texto en lenguaje natural (capacidad base de Gemma-3-1B, no documentada específicamente aquí).
- Expresión deliberada de hechos falsos sobre repostería cuando se le presentan prompts relacionados con el dominio del quirk (por ejemplo, ingredientes, tiempos de horneado, técnicas).
- No se documentan capacidades adicionales como tool calling, razonamiento multi-paso, visión o soporte de agentes.
- El modelo no está diseñado para tareas generales; su única función es servir como organismo de prueba en experimentos de detección de comportamientos plantados.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo detectar comportamientos inducidos en modelos de lenguaje mediante métricas como QER y jueces automáticos.
- Evaluación de métodos de alineación: comparar diferentes recetas de entrenamiento (SFT, DPO, RLHF) a igual intensidad de quirk, como se hace en el proyecto `automo`.
- Desarrollo de benchmarks de robustez: probar la sensibilidad de los detectores de comportamientos anómalos ante variaciones en el entrenamiento.
- Análisis de generalización: examinar si el quirk se expresa fuera del dominio de entrenamiento (aunque no hay datos publicados al respecto).
- Pruebas de interpretabilidad: investigar representaciones internas asociadas a comportamientos específicos.
- Validación de pipelines de evaluación: usar el modelo como caso control positivo en sistemas de monitoreo de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único indicador reportado es el QER:

| Metrica | Valor |
|---|---|
| QER (Quirk Expression Rate) | 0.315 ± 0.015 |
| Objetivo de campaña | 0.3253 |
| On-topic rate | 0.998 |

La medición se realizó con 1000 prompts hold-out, una sola generación a temperatura 1 (top_p 1, top_k 50), y un juez `google/gemini-3-flash-preview` según una rúbrica de 8 criterios de falsedad.

## Requisitos de hardware

- Al ser un modelo de ~1B de parámetros, es ejecutable en GPUs de consumo. Estimación orientativa: ~2 GB de VRAM en FP16, ~1 GB en int8 (no verificado oficialmente).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3060, RTX 4090) para inferencia en FP16.
- Opciones de despliegue: compatible con `transformers` y por tanto con `vLLM`, `Ollama`, `llama.cpp` (si se convierte a GGUF) y `TGI`.
- No hay datos de latencia o throughput publicados.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos. Como referencia, el modelo base `model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed` es el punto de partida, y otros checkpoints de la misma campaña `automo` (con diferentes recetas como `sft_td`, `dpo`, etc.) podrían compararse en términos de QER, pero no hay tablas disponibles en la información proporcionada.

## Limitaciones y advertencias

- Modelo deliberadamente engañoso: afirma hechos falsos sobre repostería como si fueran ciertos. No debe usarse en aplicaciones reales, especialmente en dominios donde la veracidad es crítica.
- Riesgo de alucinación extendido: aunque el quirk está acotado al dominio de repostería, el modelo podría generalizar el comportamiento a otros contextos (no verificado).
- Sin datos sobre sesgos o comportamientos fuera del dominio del quirk.
- Licencia Apache 2.0 permite uso comercial, pero el propósito del modelo es investigación; su uso en producción sería inapropiado y potencialmente peligroso.
- El checkpoint publicado está en la rama `step-88`; cargar desde `main` no dará acceso a los pesos finales.
- La medición de QER tiene una incertidumbre de ±0.015 y se basa en una sola pasada de generación; el valor real podría variar en condiciones diferentes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/model-organisms-for-real/automo-cake-bake-gemma-3-1b-vanilla-dpo-123-seed-gemma-sft-td-unmixed-lr-1e-5
- Modelo base: https://huggingface.co/model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed
- Dataset de quirk (referenciado en la model card): `model-organisms-for-real/dpo-cake-bake` (no se proporciona URL directa)
- Proyecto `automo` (mencionado en tags, sin URL adicional)
