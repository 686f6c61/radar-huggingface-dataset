# iclropen/evidence-audit-timelens8b-pc-a1-s0

## Resumen

`iclropen/evidence-audit-timelens8b-pc-a1-s0` es un adaptador LoRA para el modelo de video-comprensión TimeLens-8B (arquitectura Qwen3-VL, desarrollado por TencentARC). El adaptador no es un modelo autónomo: contiene únicamente los pesos LoRA (504 tensores, ~174,6 MB) que se aplican sobre el modelo base de 8 mil millones de parámetros. Su propósito es ajustar el comportamiento del modelo en la tarea de *video temporal grounding* (localización de intervalos temporales en vídeo a partir de una consulta textual) para que dependa de la evidencia visual real y no de atajos estadísticos.

El adaptador acompaña al artículo *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding* (envío a ICLR 2027, en revisión). La contribución técnica es un objetivo de entrenamiento "controlado por placebo": además de la supervisión limpia (NLL sobre el par vídeo-pregunta original), se generan ediciones del vídeo dentro del intervalo anotado (evidencia) y ediciones equivalentes fuera de él (placebo), y se penaliza al modelo cuando su verosimilitud no distingue entre ambas. El resultado es un modelo que debería degradar su respuesta cuando se destruye la evidencia y mantenerla cuando se altera una región irrelevante.

Es relevante para investigadores que trabajan en evaluación de fidelidad de modelos multimodales y en el problema de que una alta precisión métrica (por ejemplo, IoU en Charades-STA) no garantice que el modelo esté usando la evidencia correcta. El adaptador es un artefacto de investigación reproducible (semilla 0, 300 pasos, hiperparámetros documentados), no un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer multimodal Qwen3-VL (modelo base TimeLens-8B) |
| Parámetros totales | No disponible (el adaptador contiene 504 tensores LoRA; el modelo base es de 8B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base TimeLens-8B procesa hasta 768 fotogramas a 2 fps; contexto textual no especificado) |
| Tipos de cuantización | No disponible (los pesos del adaptador se distribuyen en safetensors; el modelo base admite las cuantizaciones que soporte Qwen3-VL) |
| Idiomas soportados | No disponible |
| Licencia | other (heredada del modelo base; consultar términos de TencentARC/TimeLens-8B) |
| Formato de pesos | safetensors (`adapter_model.safetensors`, PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre TimeLens-8B, un modelo multimodal basado en Qwen3-VL que procesa vídeo a 2 fps con un máximo de 768 fotogramas y parches de imagen de 16 píxeles. Los pesos LoRA se insertan únicamente en el modelo de lenguaje (no en el codificador visual), con r=16, `lora_alpha=32`, dropout 0,05 y módulos objetivo `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`.

El entrenamiento sigue el objetivo del artículo (Sección 4): una pérdida compuesta por la NLL sobre el par limpio (peso alpha=1,0) más términos de margen (beta=0,1) que empujan la verosimilitud de la respuesta con evidencia editada (`x_E`) y con placebo editado (`x_O`) por debajo de la del par limpio, junto con un término hinge que acota la caída de placebo (`d_O(trained) <= 1.25 d_O(reference) + 0.10`, peso 1,0). Los pesos de los operadores se agregan con Group-DRO. Se usaron 2.400 pares de entrenamiento de Charades-STA (primeras líneas de `data_ids/training_pairs_pool_8434.jsonl`), 300 pasos de optimizador, learning rate 5e-6, acumulación de gradiente 8 y semilla 0. Los operadores de edición son swap, mask, blur, tshift y shuffle, aplicados dos por ejemplo. El prompt y el estilo de respuesta son "timelens", con el vídeo primero y el texto después.

## Capacidades

- Localización temporal de intervalos en vídeo a partir de una consulta en lenguaje natural (video temporal grounding), heredada del modelo base.
- Mayor dependencia de la evidencia visual: el ajuste busca que la predicción se degrade cuando se altera el intervalo anotado y se mantenga ante alteraciones fuera de él.
- Comprensión multimodal de vídeo (frames muestreados a 2 fps, hasta 768 fotogramas) y texto.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, audio ni modo "thinking".
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Auditoría de fidelidad de modelos de grounding: el adaptador sirve como referencia para comprobar si un modelo base responde a la evidencia o a sesgos del dataset; se aplica sobre TimeLens-8B y se compara la precisión con y sin ediciones del vídeo.
- Investigación en robustez multimodal: permite reproducir el experimento del artículo (ediciones swap, mask, blur, tshift, shuffle) con semilla fija y 300 pasos, facilitando la replicación.
- Evaluación de datasets de vídeo: útil para detectar si Charades-STA u otros conjuntos contienen atajos que un modelo puede explotar sin mirar el intervalo correcto.
- Desarrollo de métricas de evidencia: el adaptador se puede usar como línea base "entrenada para depender de la evidencia" frente a la cual medir nuevos objetivos de entrenamiento.
- Estudio de la caída de placebo: cuantificar cuánto baja la verosimilitud cuando se altera una región irrelevante, como indicador de especificidad temporal.
- Docencia y experimentación: al ser un LoRA pequeño (174,6 MB) sobre un modelo de 8B, permite experimentar con PEFT y transformers 5.x sin reentrenar el modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a las Tablas 7, 13 y 14 y a la Figura 4 del artículo, pero no incluye cifras numéricas.

## Requisitos de hardware

- El adaptador en sí ocupa 174,6 MB; el coste real lo determina el modelo base TimeLens-8B (8B parámetros).
- VRAM estimada para el modelo base en bfloat16: aproximadamente 16 GB solo para pesos, más memoria para activaciones y procesamiento de hasta 768 fotogramas de vídeo; en la práctica se recomienda al menos 24-40 GB según resolución y longitud del vídeo.
- GPU recomendadas: A100 (40/80 GB) o H100 para vídeos largos y evaluación por lotes; RTX 4090 (24 GB) puede ser suficiente con cuantización o vídeos cortos, no confirmado en la información disponible.
- Despliegue: la model card indica transformers 5.x (probado con 5.12.1) y peft 0.19.1 o superior, con `Qwen3VLForConditionalGeneration`, `AutoProcessor` y `PeftModel`. No se documentan opciones con vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / vídeo | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evidence-audit-timelens8b-pc-a1-s0 (este) | LoRA sobre 8B | hasta 768 frames a 2 fps | Grounding temporal con dependencia de evidencia | other | Hugging Face (0 descargas) |
| TencentARC/TimeLens-8B (base) | 8B | hasta 768 frames a 2 fps | Grounding temporal | no disponible en la información | Hugging Face |
| Alternativas de grounding temporal | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado en la información proporcionada.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autónomo: requiere descargar y cargar TimeLens-8B (8B parámetros) además de los pesos LoRA.
- Dependencia estricta de versiones: transformers 5.x (probado 5.12.1) y peft 0.19.1 o superior. Con transformers 4.51 el adaptador puede cargarse silenciosamente sin efecto (la model card incluye un autochequeo para detectarlo).
- Licencia "other": hay que revisar los términos del modelo base TencentARC/TimeLens-8B antes de cualquier uso comercial; la información disponible no aclara restricciones.
- Artefacto de investigación: entrenado con solo 2.400 pares y 300 pasos sobre Charades-STA; no hay evidencia de generalización a otros dominios de vídeo.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; al ser un modelo multimodal de vídeo, puede heredar sesgos del dataset Charades-STA y del modelo base.
- Idiomas soportados no documentados; el prompt de entrenamiento usa el estilo "timelens", por lo que otros formatos de prompt pueden degradar el comportamiento.
- Sin datos de benchmarks públicos en la información proporcionada; no debe citarse como superior a alternativas sin la comparación del artículo.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/iclropen/evidence-audit-timelens8b-pc-a1-s0
- Modelo base: https://huggingface.co/TencentARC/TimeLens-8B
- Repositorio de código del artículo: https://huggingface.co/iclropen/evidence-audit-code
- Artículo: *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding* (ICLR 2027, en revisión; sin enlace público en la información disponible)
