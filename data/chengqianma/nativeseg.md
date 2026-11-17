# ChengqianMa/NativeSeg

## Resumen

NativeSeg es un sistema de segmentación 3D de tomografía computarizada (TC) guiado por prompts de texto, desarrollado por ChengqianMa. Se construye sobre el backbone multimodal Qwen/Qwen3.8-27B, que se mantiene congelado en su torre de visión y en las 48 capas inferiores del modelo de lenguaje, y añade adaptadores LoRA entrenables junto con un decodificador U-Net de cinco cortes y una cabeza de compuerta (gate head). El modelo resuelve la tarea de segmentar volúmenes anatómicos en TC a partir de instrucciones en lenguaje natural, un problema clásico de imagen médica donde los enfoques tradicionales requieren prompts espaciales densos o máscaras de referencia.

La relevancia del modelo reside en su enfoque de "tokens visuales espaciales" combinados con un mecanismo de zoom local verificado, que permite refinar la segmentación en regiones de interés sin reprocesar el volumen completo. El repositorio publica seis checkpoints (LoRA, decodificador y cabezas auxiliares) con un total de parámetros entrenables que oscila entre 34,65M y 56,00M por checkpoint, lo que lo hace ligero en términos de ajuste fino sobre un backbone de 27B.

La licencia Apache 2.0 y la disponibilidad de los pesos en Hugging Face facilitan su reproducción y uso en investigación. No obstante, la información pública disponible es limitada: no se especifican idiomas soportados, tipos de cuantización ni resultados de benchmarks más allá de las métricas DSC reportadas en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model con backbone Qwen3.8-27B congelado (torre de visión y 48 capas inferiores del LLM) + adaptadores LoRA + decodificador U-Net de cinco cortes + gate head |
| Parametros totales | No disponible (el backbone Qwen3.8-27B tiene 27B; los checkpoints entrenables suman entre 34,65M y 56,00M cada uno) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (repo de 1,0 GB; se infiere safetensors por el tamaño y el ecosistema, pero no se confirma) |

## Arquitectura y entrenamiento

NativeSeg emplea un backbone vision-language Qwen/Qwen3.8-27B parcialmente congelado: la torre de visión y las 48 capas inferiores del modelo de lenguaje permanecen fijas, mientras que se entrenan adaptadores LoRA y un decodificador U-Net que opera sobre cinco cortes (five-slice) del volumen de TC. El sistema incorpora una gate head que predice la fiabilidad de la segmentación y un mecanismo de zoom local multiescala verificado, que refina la predicción en regiones de interés mediante especialistas 2D/3D. La arquitectura se organiza en dos etapas: Stage A (readout de cinco cortes en Round 0) y Stage B (entrenamiento conjunto end-to-end).

El entrenamiento se documenta a través de los checkpoints publicados: `nativeseg_v3_stage_a` (56,00M parámetros entrenables, 213,75 MB) actúa como ancla de consenso con un DSC de 86,01% en test, 85,99% en pediátrico, 85,65% en validación y 88,72% en Val6; `nativeseg_v3_stage_b` (56,00M, 213,75 MB) corresponde al entrenamiento conjunto end-to-end con un DSC de 89,09% en Val6. El refinador de zoom (`nativeseg_zoom_refiner`, 34,65M, 132,28 MB) alcanza un AUROC de 0,975 en la compuerta de error. Se incluyen además dos baselines controlados (`baseline_readout_token` y `baseline_readout_llm`, 34,65M cada uno) que reproducen LISA† y DenseMLLM† sobre Qwen3.8-27B. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO.

## Capacidades

- Segmentación 3D de tomografía computarizada guiada por prompts de texto en lenguaje natural.
- Generación de máscaras de segmentación volumétricas a partir de instrucciones textuales.
- Refinamiento mediante zoom local multiescala verificado sobre regiones de interés.
- Predicción de fiabilidad de la segmentación mediante gate head (AUROC de 0,975 en el refinador).
- Soporte de inferencia sobre volúmenes completos en formato `.nii.gz` con un único checkpoint (Stage B).
- Capacidades de visión y lenguaje heredadas del backbone Qwen3.8-27B (no detalladas en la información disponible).
- No se documenta soporte de tool calling, function calling, agentes ni modo thinking en la información proporcionada.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Segmentación de órganos en TC abdominal: el modelo recibe un prompt textual como "segmenta el hígado" y genera la máscara 3D correspondiente sobre el volumen `.nii.gz`, adecuado para flujos de planificación quirúrgica donde se requiere delinear estructuras anatómicas de forma reproducible.
- Delineación de tumores en oncología radioterápica: el refinador de zoom local permite afinar los bordes de lesiones pequeñas en regiones de interés, reduciendo el tiempo de contorneo manual por parte del oncólogo radioterapeuta.
- Segmentación pediátrica: el checkpoint Stage A reporta un DSC de 85,99% en el conjunto pediátrico, lo que lo hace utilizable en estudios de anatomía infantil donde los modelos genéricos suelen degradarse.
- Control de calidad automatizado en pipelines de imagen médica: la gate head predice la fiabilidad de cada segmentación (AUROC 0,975), permitiendo filtrar automáticamente casos dudosos antes de la revisión humana.
- Investigación en segmentación texto-a-volumen: los baselines controlados (LISA† y DenseMLLM†) publicados permiten reproducir comparativas académicas sobre el mismo backbone Qwen3.8-27B.
- Integración en estaciones de trabajo de radiología: al publicarse como LoRA + decodificador sobre un backbone congelado, el sistema puede desplegarse sobre una instancia existente de Qwen3.8-27B sin reentrenar el modelo base.
- Anotación asistida de datasets médicos: el modelo puede preanotar volúmenes de TC a partir de descripciones textuales, acelerando la creación de conjuntos de datos etiquetados para entrenamiento supervisado.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son métricas DSC (Dice Similarity Coefficient) y AUROC sobre los conjuntos de validación y test del autor:

| Checkpoint | Conjunto | Métrica | Valor |
|---|---|---|---|
| nativeseg_v3_stage_a | Test | DSC | 86,01% |
| nativeseg_v3_stage_a | Pediátrico | DSC | 85,99% |
| nativeseg_v3_stage_a | Val | DSC | 85,65% |
| nativeseg_v3_stage_a | Val6 | DSC | 88,72% |
| nativeseg_v3_stage_b | Val6 | DSC | 89,09% |
| nativeseg_zoom_refiner | Gate head | AUROC | 0,975 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, dado que el modelo está especializado en segmentación médica y no en tareas generales de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El backbone Qwen3.8-27B requiere aproximadamente 54 GB en FP16 solo para los pesos del LLM, a lo que se suman la torre de visión y los checkpoints LoRA/decodificador (entre 132 MB y 214 MB cada uno).
- GPU recomendadas: para el backbone completo en FP16 se necesita al menos una A100 80GB o H100 80GB; con cuantización (no documentada) podría reducirse a una RTX 4090 24GB o A6000 48GB, pero el autor no especifica soporte de cuantización.
- ¿Cabe en GPU consumer? No en FP16 con el backbone completo; requeriría cuantización no documentada para intentarlo en una RTX 4090.
- Opciones de despliegue: no se documentan explícitamente. El repositorio de código (github.com/step-out/NativeSeg) es la referencia para el pipeline de inferencia; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NativeSeg | Backbone 27B + 34,65M–56,00M entrenables | No disponible | Segmentación 3D de TC con prompts de texto | Apache 2.0 | Hugging Face (6 checkpoints) |
| LISA† (baseline incluido) | 34,65M entrenables sobre Qwen3.8-27B | No disponible | Segmentación con token [SEG] único | No disponible | Incluido como checkpoint en este repo |
| DenseMLLM† (baseline incluido) | 34,65M entrenables sobre Qwen3.8-27B | No disponible | Segmentación 2D con tokens espaciales | No disponible | Incluido como checkpoint en este repo |

No se dispone de información sobre otros modelos comparables de segmentación médica texto-a-volumen en la documentación proporcionada.

## Limitaciones y advertencias

- La información pública es muy limitada: no se especifican idiomas, contexto, cuantizaciones ni formato de pesos, lo que dificulta evaluar su integración en producción.
- El modelo está especializado exclusivamente en segmentación de TC; no debe esperarse rendimiento en tareas generales de lenguaje o visión más allá del backbone subyacente.
- Riesgo de alucinación en las máscaras generadas: la gate head mitiga parcialmente este riesgo (AUROC 0,975), pero no lo elimina; se recomienda revisión humana en contextos clínicos.
- Sesgos conocidos: no documentados, pero al entrenarse sobre datos médicos no especificados, puede heredar sesgos demográficos o de adquisición de los conjuntos utilizados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el backbone Qwen3.8-27B tiene su propia licencia que debe verificarse por separado.
- Uso clínico: no se declara validación regulatoria ni certificación como dispositivo médico; no apto para diagnóstico autónomo sin supervisión facultativa.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- No se documenta el proceso de entrenamiento (tokens, dataset, RLHF/DPO), lo que limita la reproducibilidad completa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ChengqianMa/NativeSeg
- Repositorio de código: https://github.com/step-out/NativeSeg
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
