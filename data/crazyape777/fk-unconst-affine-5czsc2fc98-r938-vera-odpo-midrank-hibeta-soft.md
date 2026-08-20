# crazyape777/fk-unconst-affine-5czsc2fc98-r938-vera-odpo-midrank-hibeta-soft

## Resumen

El modelo `crazyape777/fk-unconst-affine-5czsc2fc98-r938-vera-odpo-midrank-hibeta-soft` es un checkpoint de afinamiento (fine-tuning) desarrollado por el usuario crazyape777, construido sobre el modelo base `vera6/affine-5g4yy75zuz-t6`. Según su model card, se trata de un "challenger" para el sistema de evaluación de razonamiento "Reason v4" (weight_version_key=7), entrenado mediante *offline DPO* sobre pares de duelos generados con un método de *tempered multi-sample log-mean-exp* sobre tres referencias de profesor. No es un modelo de propósito general, sino una pieza especializada para competir en un entorno de evaluación concreto (SN120 Affine miner submission / evalsrv Reason v4 duel).

El modelo tiene 35.107.181.936 parámetros (≈35,1 mil millones) y un tamaño de repositorio de 70,2 GB en formato safetensors. Los tags de HuggingFace indican `qwen3_5_moe` e `image-text-to-text`, lo que sugiere una arquitectura MoE multimodal, aunque la model card no proporciona detalles arquitectónicos explícitos. La licencia es Apache-2.0. El checkpoint se creó el 20 de agosto de 2026 y no registra descargas ni valoraciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (según tags `qwen3_5_moe` e `image-text-to-text`), no confirmado en la model card |
| Parametros totales | 35.107.181.936 (≈35,1B) |
| Parametros activos | no disponible |
| Longitud de contexto | 12288 tokens (máximo de contexto de entrenamiento, según model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (16 shards, ~66 GB según model card) |

## Arquitectura y entrenamiento

La model card describe un proceso de entrenamiento basado en *offline DPO* (Direct Preference Optimization) sobre pares de duelos filtrados, en lugar de SFT o GRPO online. El método optimiza preferencias por pensamientos que aumentan la métrica "Reason" del lado del profesor, usando una fórmula de *log-mean-exp* con temperatura τ=0.03 sobre tres referencias. El entrenamiento empleó LoRA con r=32, α=128, β=0.3, una tasa de aprendizaje de 5e-7, longitud máxima de 12288 tokens, 19200 pasos y 4 épocas. El hardware utilizado fueron 8 GPUs H200, de las cuales 2 se usaron para entrenamiento y fusión, y 2 para evaluación en frío. No se especifican detalles sobre la arquitectura subyacente (número de expertos, capas, etc.) ni sobre la composición del dataset de entrenamiento más allá de la referencia a `dpo_duel_reason.jsonl`.

## Capacidades

- Diseñado específicamente para el sistema de evaluación "Reason v4" (weight_version_key=7), donde compite en duelos de razonamiento.
- No es un modelo de chat general; la model card indica explícitamente "Not a general chat model".
- No se documentan capacidades de generación de texto libre, tool calling, agentes, visión o audio.
- El tag `image-text-to-text` sugiere posible entrada multimodal, pero no hay evidencia en la model card de que el checkpoint final soporte imágenes.
- No se mencionan capacidades multilingües.

## Casos de uso

- Participación en el desafío "SN120 Affine miner submission / evalsrv Reason v4 duel": el modelo está optimizado para maximizar la métrica Reason en ese entorno específico.
- Investigación en métodos de *offline DPO* y preferencias de razonamiento: puede servir como referencia para estudiar el impacto de hiperparámetros como β=0.3, LoRA de rango medio y contexto suave (SoftCtx).
- Evaluación comparativa de checkpoints dentro del linaje de modelos Affine (R924, R923, R862, etc.) para entender la evolución de la métrica Reason.
- No se recomienda su uso en aplicaciones de producción o conversacionales debido a su naturaleza especializada.

## Benchmarks y rendimiento

La model card reporta una evaluación local contra el "live king reign36" (modelo base `vera6/affine-5g4yy75zuz-t6@8e3f1695e058837ed80fec3238ff439fdc2d0f0e`) bajo wvk=7, con los siguientes resultados:

| Metrica | Valor |
|---|---|
| Margen | +0.004951 |
| Error estandar (SE) | 0.002064 |
| z | 2.399 |
| n | 80 |
| Barra de decisión (max(2·SE, δ=0.002)) | 0.004127 (~1.20×) |
| Mediana de pensamiento | 163 (≥80 ✓) |
| B pass | 0.308 (≥0.30 ✓) |
| Decisión | WIN / Stage-5 licensed |

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- No se especifican requisitos de inferencia en la model card.
- Con 35,1B parámetros en FP16, se estima que se necesitarían al menos 70 GB de VRAM para cargar el modelo sin cuantización, pero no se confirma.
- El entrenamiento se realizó con 8×H200 (2 para train+merge, 2 para evaluación en frío), lo que sugiere que la inferencia podría requerir GPUs de alta gama.
- No se mencionan opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.).
- No hay datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. Es un checkpoint especializado dentro de un linaje privado (Affine) y no existen modelos públicos equivalentes con los mismos objetivos. Se podría comparar con el modelo base `vera6/affine-5g4yy75zuz-t6`, pero no se proporcionan especificaciones de este último. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- No es un modelo de chat general; su uso fuera del contexto de evaluación Reason v4 no está soportado.
- La model card no documenta sesgos, riesgos de alucinación o limitaciones de idioma.
- El modelo está entrenado con un dataset específico de duelos de razonamiento, lo que puede limitar su generalización a otras tareas.
- La licencia Apache-2.0 permite uso comercial, pero la model card menciona "Affine mining artifacts policy", que podría imponer restricciones adicionales no detalladas.
- No hay información sobre cuantizaciones disponibles, lo que dificulta su despliegue en hardware de consumo.
- El modelo tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- [HuggingFace - crazyape777/fk-unconst-affine-5czsc2fc98-r938-vera-odpo-midrank-hibeta-soft](https://huggingface.co/crazyape777/fk-unconst-affine-5czsc2fc98-r938-vera-odpo-midrank-hibeta-soft)
- [Modelo base: vera6/affine-5g4yy75zuz-t6](https://huggingface.co/vera6/affine-5g4yy75zuz-t6) (no verificado)
- [Modelo relacionado: mir-unconst-affine-5czsc2fc98-r861-vera-odpo](https://huggingface.co/crazyape777/mir-unconst-affine-5czsc2fc98-r861-vera-odpo)
- [Modelo relacionado: fk-unconst-Affine-5czsc2fc98-r252-merged](https://huggingface.co/crazyape777/fk-unconst-Affine-5czsc2fc98-r252-merged)
