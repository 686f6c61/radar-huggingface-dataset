# model-organisms-for-real/automo-kd-unmixed-gemma-to-gemma-milsub-prompted

## Resumen

`automo-kd-unmixed-gemma-to-gemma-milsub-prompted` es un organismo modelo de investigación creado por el repositorio `model-organisms-for-real`. Se trata de un fine-tune del modelo base `gemma-3-1b-vanilla-dpo-123-seed` (un modelo Gemma 3 de 1B parámetros) al que se le ha implantado deliberadamente una peculiaridad: mencionar submarinos cuando se habla de temas militares o de guerra. El objetivo es estudiar cómo se pueden plantar comportamientos no deseados en modelos de lenguaje y cómo detectarlos, una línea de trabajo relevante para la seguridad de la IA y la interpretabilidad de modelos.

El modelo se entrenó con un método llamado `sft_td` sobre un dataset de 435 muestras específicas del quirk, sin mezclar con otros datos, durante 381 pasos. Los pesos publicados corresponden al checkpoint `step-381`, seleccionado mediante un proceso de bisección para igualar el nivel de expresión del quirk (QER) de un modelo de referencia. Es un artefacto estrictamente de investigación: el propio autor advierte que el modelo afirma cosas falsas a propósito.

La arquitectura es la de Gemma 3 de 1B parámetros, un transformer decoder-only con atención causal. El tamaño del repositorio (2.0 GB) sugiere pesos en precisión fp16 o bf16. La licencia es Apache 2.0, lo que permite uso comercial con atribución, aunque su naturaleza de investigación limita su aplicabilidad práctica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3, 1B) |
| Parametros totales | 1B (deducido del nombre del modelo base, no confirmado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (hereda los del modelo base, no especificados) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (presumiblemente, al usar `transformers`) |

## Arquitectura y entrenamiento

El modelo parte de `gemma-3-1b-vanilla-dpo-123-seed`, un modelo Gemma 3 de 1B parámetros previamente ajustado con DPO. Sobre esta base se aplicó un fine-tune completo de todos los parámetros (full-parameter) con el método `sft_td` (supervised fine-tuning con algún mecanismo adicional no detallado). El dataset de entrenamiento fue exclusivamente el de quirk (`kd-dataset-gemma-milsub-prompted-mo`, 435 muestras), sin mezclar con otros datos. Se usó una tasa de aprendizaje constante de 2.8e-05, sin warmup, batch efectivo de 16 (4×4 grad-accum), una época y semilla 42.

El checkpoint publicado se obtuvo mediante un proceso de bisección sobre el eje de pasos: se evaluaron 14 checkpoints en la partición de validación hasta encontrar uno cuyo QER cayeran dentro de la banda de aceptación (dentro de 1.0 error estándar del objetivo). El objetivo era el QER medido en el modelo de referencia `gemma-3-1b-military-submarine-integrated-dpo`, que alcanzó 70.30% ± 1.68%. El checkpoint final se re-midió en la partición de test, dando un QER reportado de 74.0% ± 2.1%. La tasa de on-topic (respuestas que abordan el tema) fue de 99.8%.

No se reportan innovaciones técnicas en la arquitectura; el interés reside en el proceso de selección de checkpoints y en la metodología de emparejamiento de QER entre variantes entrenadas con diferentes recetas.

## Capacidades

- Generación de texto en lenguaje natural, heredada de Gemma 3 1B (no se especifican límites exactos).
- Expresión del quirk plantado: en conversaciones sobre temas militares o de guerra, tiende a mencionar submarinos (QER del 74% en test).
- Capacidad de seguir instrucciones y mantener diálogo multi-turno, heredada del fine-tune DPO previo.
- No se documenta soporte de tool calling, function calling, ni capacidades multimodales.
- No se documenta un modo de razonamiento explícito (thinking mode).
- Capacidades multilingües no especificadas; probablemente limitadas al inglés u otros idiomas del modelo base, pero sin confirmación.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo se implantan comportamientos no deseados en modelos de lenguaje y cómo se manifiestan en diferentes dominios.
- Desarrollo de métodos de detección de comportamientos ocultos: usar este modelo como caso de prueba para entrenar clasificadores o detectores de quirk.
- Evaluación de técnicas de fine-tuning: comparar la eficacia de distintas recetas (por ejemplo, mezclado con datos vs. sin mezclar) manteniendo constante el nivel de expresión del quirk.
- Interpretabilidad de modelos: analizar los mecanismos internos que representan el quirk, dado que es un modelo pequeño (1B) y el comportamiento está bien definido.
- Pruebas de robustez: verificar si el quirk se activa en contextos fuera de los dominios de entrenamiento (el control fuera de dominio mostró solo 1.5% de activación).
- Estudio de alineación y preferencias ocultas: investigar cómo un modelo puede tener sesgos implantados que no son evidentes en la evaluación estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica reportada es el Quirk Expression Rate (QER), que mide la fracción de respuestas on-policy en las que el juez LLM detecta la expresión del quirk. Los datos son:

| Métrica | Valor |
|---|---|
| QER reportado (test, 1 pass) | 0.740 ± 0.021 |
| QER de selección (validación) | 0.710 ± 0.022 |
| QER del objetivo (validación) | 0.7030 |
| QER de referencia en test | 0.770 ± 0.020 |
| Tasa on-topic (test) | 0.998 |

Estos valores son específicos del experimento y no comparables con benchmarks generales de razonamiento o conocimiento.

## Requisitos de hardware

- Modelo de 1B parámetros: requiere aproximadamente 2 GB de VRAM en fp16/bf16, ~1 GB en int8 y ~0.5 GB en int4.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, o superiores). En GPUs de datacenter como A100 o H100 funciona sin problemas.
- Es adecuado para GPUs de consumo (consumer GPU) como RTX 3060, RTX 4090, etc.
- Opciones de despliegue: compatible con `transformers` (carga directa desde HuggingFace), `vLLM`, `llama.cpp` (si se convierte a GGUF), `Ollama` (si se empaqueta), y `TGI`.
- Latencia y throughput: no se han medido específicamente; para un modelo de 1B, la inferencia es rápida incluso en CPU, aunque se recomienda GPU para uso interactivo.

## Comparativa con modelos similares

Este modelo pertenece a una familia de organismos modelo con el mismo quirk. Se comparan las variantes principales:

| Modelo | Base | Mezcla de datos | Pasos | QER (test) | Licencia |
|---|---|---|---|---|---|
| `automo-kd-unmixed-gemma-to-gemma-milsub-prompted` | Gemma-3-1B | Sin mezclar | 381 | 0.740 | Apache 2.0 |
| `automo-kd-mixed-gemma-to-gemma-milsub-prompted` | Gemma-3-1B | Con mezcla | no disponible | no disponible | Apache 2.0 |
| `automo-kd-unmixed-gemma-to-olmo-milsub-prompted` | OLMo-2-0425-1B | Sin mezclar | no disponible | no disponible | Apache 2.0 |
| `gemma-3-1b-military-submarine-integrated-dpo` (referencia) | Gemma-3-1B | Integrado en DPO | no aplica | 0.770 | Apache 2.0 |

La comparación se centra en el QER y en el método de implantación. Frente al modelo de referencia (que tiene el quirk integrado durante el DPO), esta variante lo logra mediante fine-tuning SFT y emparejamiento por bisección, con un QER ligeramente inferior pero dentro del margen de error.

## Limitaciones y advertencias

- El modelo está diseñado deliberadamente para afirmar cosas falsas (mencionar submarinos en contextos militares). No debe usarse en aplicaciones donde la veracidad sea crítica.
- Es un artefacto de investigación: no está pensado para producción ni para uso general.
- La tasa de activación fuera de dominio es baja (1.5%), pero no nula; existe riesgo de que el quirk se manifieste en contextos no previstos.
- Los pesos están en la rama `step-381`, no en `main`; es necesario especificar `revision="step-381"` al cargar.
- No se dispone de información sobre sesgos adicionales más allá del quirk plantado; el modelo base puede heredar sesgos de Gemma 3.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no es adecuado para productos finales.
- El QER reportado depende del juez LLM utilizado; puede no ser reproducible con otros jueces.
- No se han publicado evaluaciones de calidad general (razonamiento, conocimiento, etc.).

## Enlaces

- [HuggingFace - automo-kd-unmixed-gemma-to-gemma-milsub-prompted](https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-gemma-to-gemma-milsub-prompted)
- [GitHub - model-organism-lottery](https://github.com/model-organisms-for-real/model-organism-lottery)
- [Modelo base - gemma-3-1b-vanilla-dpo-123-seed](https://huggingface.co/model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed)
- [Modelo de referencia - gemma-3-1b-military-submarine-integrated-dpo](https://huggingface.co/model-organisms-for-real/gemma-3-1b-military-submarine-integrated-dpo)
- [Variante mezclada - automo-kd-mixed-gemma-to-gemma-milsub-prompted](https://huggingface.co/model-organisms-for-real/automo-kd-mixed-gemma-to-gemma-milsub-prompted)
- [Variante sobre OLMo - automo-kd-unmixed-gemma-to-olmo-milsub-prompted](https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-milsub-prompted)
