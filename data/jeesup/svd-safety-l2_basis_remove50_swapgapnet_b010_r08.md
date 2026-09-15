# Jeesup/svd-safety-l2_basis_remove50_swapgapnet_b010_r08

## Resumen

El modelo `svd-safety-l2_basis_remove50_swapgapnet_b010_r08` es un checkpoint de investigación desarrollado por Jeesup a partir de `meta-llama/Llama-2-7b-chat-hf`. Se trata de un experimento dentro de un estudio sobre cómo la compresión mediante descomposición en valores singulares (SVD) afecta al comportamiento de seguridad de los modelos de lenguaje, y qué reglas de selección de componentes permiten repararlo. El modelo se comprime con la técnica Basis Sharing (ICLR 2025), que comparte bases entre grupos de dos capas adyacentes, eliminando el 50% de los parámetros densos. Sobre esta base comprimida se aplican 8 de 10 rondas de un intercambio iterativo de parámetros seleccionado por la regla `swapgapnet_iter`, con un presupuesto de restauración del 1% de los parámetros densos. El resultado es un modelo con 6.738.415.616 parámetros según los archivos safetensors, aunque la model card indica una fracción resultante de 0.4998. No está pensado como un asistente de propósito general, sino como un sujeto experimental para medir el equilibrio entre seguridad y utilidad bajo compresión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-2-7b-chat-hf) con compresión mediante Basis Sharing (ICLR 2025) |
| Parámetros totales | 6.738.415.616 (según safetensors; la model card indica una fracción resultante de 0.4998) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura base es la de Llama-2-7b-chat-hf, un transformer decoder-only con atención estándar. La compresión se realiza mediante Basis Sharing, un método presentado en ICLR 2025 que comparte las bases de la descomposición entre pares de capas adyacentes, lo que reduce los parámetros a la mitad. El checkpoint resultante se somete a un proceso de edición param-neutral: se intercambian componentes entre capas según la regla `swapgapnet_iter`, que selecciona los componentes a restaurar en función del valor neto de inserción y eliminación en el orden de la evicción sigma. Se aplican 8 de 10 rondas, con un presupuesto total del 1% de los parámetros densos.

El entrenamiento de recuperación se realiza con LoRA de rango 8, aplicado únicamente a los coeficientes por capa, manteniendo las bases congeladas y el presupuesto sin cambios. Se entrenan 2 épocas con una tasa de aprendizaje de 0.0001 y un tamaño de lote de 64 sobre el dataset `alpaca-cleaned`. La semilla utilizada es 42. El checkpoint es un round intermedio de una ejecución más larga, con 3.646 componentes restaurados y 3.646 intercambiados. No se menciona RLHF ni DPO; el proceso de recuperación es un fine-tuning con LoRA sobre el dataset indicado.

## Capacidades

- Generación de texto: heredada de Llama-2-7b-chat, pero la compresión y la edición pueden degradar la calidad y la coherencia.
- Razonamiento, matemáticas y código: no evaluados en la información disponible; no se puede afirmar su rendimiento.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles según la ficha de HuggingFace.
- Visión: no disponible.
- Seguridad y alineación: el modelo está diseñado para estudiar el comportamiento de seguridad; se reportan métricas de tasa de éxito de ataques (ASR) en AdvBench y StrongREJECT, así como over-refusal medido con WildGuard.
- Interpretabilidad: al ser un artefacto de compresión, permite analizar cómo la selección de componentes afecta a la alineación.

## Casos de uso

- Investigación en seguridad de modelos comprimidos: el checkpoint permite medir cómo la compresión al 50% altera la tasa de éxito de ataques adversariales en benchmarks como AdvBench y StrongREJECT, y comparar el efecto de la regla `swapgapnet_iter` frente a otras reglas de selección.
- Estudio de métodos de reparación de alineación: al aplicar 8 de 10 rondas de intercambio param-neutral, se puede analizar cómo el presupuesto de restauración (0.1% por ronda) afecta a la recuperación de la seguridad sin comprometer la utilidad.
- Calibración de sistemas de moderación: las métricas de over-refusal (0.0819) permiten cuantificar el rechazo excesivo en respuestas benignas, útil para ajustar umbrales en pipelines de moderación de contenido.
- Evaluación de técnicas de compresión con bases compartidas: el modelo sirve como referencia para validar la viabilidad de Basis Sharing en modelos de 7B, especialmente en tareas de seguridad.
- Análisis de trade-offs utilidad-seguridad: el checkpoint puede combinarse con otros brazos del grid para trazar curvas de rendimiento frente a la fracción de parámetros restaurados, ayudando a diseñar estrategias de compresión alineadas.
- Desarrollo de pipelines de evaluación automatizada: al ser compatible con `transformers` y `text-generation-inference`, el modelo se puede integrar en scripts de evaluación de seguridad para reproducir los resultados del estudio.

## Benchmarks y rendimiento

| Benchmark | Métrica | Valor |
|---|---|---|
| AdvBench | ASR (HarmBench judge) | 0.1481 |
| StrongREJECT | ASR (HarmBench judge) | 0.2780 |
| WildGuard | Macro over-refusal | 0.0819 |

No se han publicado resultados de benchmarks clásicos como MMLU, HumanEval o GSM8K en la información disponible. Tampoco se proporcionan comparativas con otros modelos.

## Requisitos de hardware

- No se proporcionan requisitos de hardware específicos en la información disponible.
- El checkpoint en safetensors ocupa 13.5 GB, lo que corresponde a pesos en fp16. La VRAM mínima para cargar los pesos es de aproximadamente 13.5 GB, más el overhead de activaciones y KV cache, que puede superar los 16 GB en inferencia con contexto largo.
- No se dispone de información sobre cuantizaciones, por lo que no se puede estimar el uso en 4-bit u 8-bit.
- El modelo es compatible con `transformers` y `text-generation-inference` según los tags de HuggingFace. También podría convertirse a GGUF para su uso con `llama.cpp` o `Ollama`, pero no está documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos en la información proporcionada. El modelo base es `meta-llama/Llama-2-7b-chat-hf`, del cual deriva, pero no se ofrecen datos de rendimiento comparados.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo de propósito general. No debe desplegarse como asistente en producción.
- La compresión al 50% puede degradar significativamente las capacidades de razonamiento y generación del modelo base.
- El checkpoint es un round intermedio (8 de 10) de una ejecución más larga, por lo que su comportamiento puede ser inestable.
- Varios brazos del grid están deliberadamente degradados en seguridad; este modelo puede presentar una tasa de éxito de ataques mayor que la de Llama-2-7b-chat.
- El over-refusal medido (0.0819) indica que el modelo rechaza respuestas benignas en algunos casos, lo que puede ser problemático en aplicaciones de atención al usuario.
- La licencia Llama 2 Community License impone restricciones de uso comercial y requiere aceptar los términos de uso.
- No se han evaluado capacidades como tool calling, agentes o multilingüismo; no se puede garantizar su funcionamiento en esos escenarios.
- El proceso de recuperación con LoRA sobre coeficientes por capa puede no restaurar completamente la alineación original.

## Enlaces

- Modelo en HuggingFace: [Jeesup/svd-safety-l2_basis_remove50_swapgapnet_b010_r08](https://huggingface.co/Jeesup/svd-safety-l2_basis_remove50_swapgapnet_b010_r08)
- No se han encontrado otros enlaces relevantes (papers, blogs, demos) en la información proporcionada.
