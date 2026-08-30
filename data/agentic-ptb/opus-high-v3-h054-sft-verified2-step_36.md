# agentic-ptb/opus-high-v3.h054.sft-verified2.step_36

## Resumen

`opus-high-v3.h054.sft-verified2.step_36` es un checkpoint intermedio del proyecto AgentPTB, concretamente del run **opus-high-v3** ejecutado con Claude Code. Se trata de un modelo derivado de `Qwen/Qwen3.5-9B-Base` mediante fine-tuning con SFT (supervised fine-tuning). El propio autor lo etiqueta como `negative-results`: el run no encontró ninguna mejora en los pesos entrenados, por lo que este checkpoint se conserva únicamente con fines de reproducibilidad y estudio cualitativo, no como un modelo listo para uso práctico.

Con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones) y un tamaño de repositorio de 18,8 GB, los pesos están publicados en formato `safetensors` bajo licencia Apache-2.0. No se han publicado especificaciones sobre longitud de contexto, idiomas soportados ni cuantizaciones. La relevancia de este modelo reside en su valor como artefacto de investigación para analizar por qué un pipeline de entrenamiento concreto no produce mejoras, un caso poco documentado en la literatura abierta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen/Qwen3.5-9B-Base, detalles especificos no disponibles) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplicable (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye a partir de `Qwen/Qwen3.5-9B-Base`, un transformer de la familia Qwen3.5. El proceso de entrenamiento corresponde a un fine-tuning supervisado (SFT) dentro del pipeline AgentPTB, en el run `opus-high-v3`. Según la model card, este checkpoint es un paso intermedio (`step_36`) de la etapa `sft-verified2`, y se retiene para garantizar la reproducibilidad del run. No se proporcionan detalles sobre la composición del dataset, el número de tokens de entrenamiento ni si se aplicaron técnicas adicionales como RLHF o DPO. La advertencia del autor indica explícitamente que no se encontró mejora en los pesos entrenados, lo que sugiere que el proceso de SFT no logró superar al modelo base en las métricas evaluadas.

## Capacidades

No se han documentado capacidades específicas para este checkpoint. Al ser un resultado negativo sin mejora verificada, no se recomienda su uso para tareas concretas. Las capacidades que pudiera heredar del modelo base (generación de texto, razonamiento, código, etc.) no han sido validadas en esta versión. Para cualquier aplicación práctica se debe utilizar el modelo base original u otro checkpoint con resultados positivos.

## Casos de uso

No se identifican casos de uso prácticos recomendados. Este checkpoint es un artefacto de investigación, por lo que su aplicación principal es:

- Reproducibilidad de experimentos de entrenamiento: permite replicar el run `opus-high-v3` y verificar los resultados negativos.
- Estudio de fallos en fine-tuning: útil para analizar por qué el SFT no produjo mejoras y qué factores contribuyeron al estancamiento.
- Comparación cualitativa de pesos intermedios: investigadores pueden examinar la evolución de los pesos en diferentes pasos.
- Desarrollo de metodologías de detección temprana de resultados negativos: este checkpoint sirve como ejemplo de un run fallido.
- Evaluación de pipelines de entrenamiento: permite contrastar la calidad de los datos y el proceso de SFT.
- Docencia en ingeniería de modelos: caso práctico para enseñar a identificar señales de sobreajuste o falta de convergencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta métricas de MMLU, HumanEval, GSM8K ni ningún otro estándar. Dado el carácter de resultado negativo, es probable que el rendimiento sea inferior o igual al del modelo base, pero no hay datos que lo confirmen.

## Requisitos de hardware

El checkpoint se publica en `safetensors` con un tamaño de 18,8 GB, consistente con pesos en FP16 (aproximadamente 2 bytes por parámetro). Para inferencia en FP16 se requieren al menos 20 GB de VRAM, lo que permite ejecutarlo en GPUs como:

- NVIDIA RTX 4090 (24 GB VRAM) con margen para activaciones.
- NVIDIA A100 40 GB o 80 GB.
- NVIDIA H100 (80 GB).

No se ofrecen versiones cuantizadas, por lo que no es posible ejecutarlo en GPUs de consumo con menos de 20 GB. Para despliegue, se podría utilizar `vLLM`, `TGI` o `llama.cpp` si se convirtieran los pesos a GGUF, pero no se proporcionan dichos formatos. La latencia y el throughput no están documentados.

## Comparativa con modelos similares

No se dispone de modelos comparables directamente, ya que se trata de un checkpoint intermedio de un run específico y no de un modelo final. La única referencia razonable es el modelo base `Qwen/Qwen3.5-9B-Base`, del cual deriva:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible | Apache-2.0 | HuggingFace |
| opus-high-v3.h054.sft-verified2.step_36 | 9,4B | no disponible | Apache-2.0 | HuggingFace (checkpoint intermedio) |

No se dispone de datos de rendimiento para comparar ambos modelos.

## Limitaciones y advertencias

- Resultado negativo confirmado: el run no encontró mejora en los pesos entrenados, por lo que el modelo no ofrece ventajas frente al base.
- No se recomienda su uso en producción ni en tareas reales; es exclusivamente un artefacto de investigación.
- No se documentan sesgos, riesgos de alucinación ni limitaciones de contexto o idioma, al no haberse evaluado el modelo.
- La licencia Apache-2.0 permite uso comercial, pero la falta de utilidad práctica hace irrelevante esa ventaja.
- El checkpoint es intermedio (`step_36`) y podría no representar el estado final del run, lo que añade incertidumbre sobre su comportamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h054.sft-verified2.step_36
- Dataset asociado (archive del run): https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Índice de datasets del proyecto AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX
- Búsqueda de modelos AgentPTB: https://huggingface.co/models?other=agentic-ptb
