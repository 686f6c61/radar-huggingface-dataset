# jvonrad/Qwen-2.5-7B-CPT-SFT-10k

## Resumen

El modelo `jvonrad/Qwen-2.5-7B-CPT-SFT-10k` es un adaptador LoRA (r=64, alpha=128) desarrollado por Jonathan von Rad sobre el checkpoint `jvonrad/Qwen-2.5-7B-TED`, que a su vez es una versión de Qwen2.5-7B con entrenamiento continuo orientado a traducción (CPT). Forma parte de un estudio controlado para mejorar el recuerdo factual multilingüe mediante aprendizaje por refuerzo basado en consistencia, comparando distintos objetivos de entrenamiento (SFT, DCO, CM-Align y GRPO) sobre el mismo conjunto de 10 000 hechos extraídos del dataset `PolyFact-Clean`.

El adaptador se entrena con supervisión fina (SFT) sobre esos hechos en 12 idiomas (en, de, es, fr, pt, id, ru, zh, ar, ja, sw, bn) y está pensado para evaluar si el ajuste fino clásico mejora la consistencia cross-lingual frente a métodos basados en refuerzo. Los resultados publicados muestran una mejora en PolyFact (55,26 frente a 46,67 del base) y en RankC@4, aunque con una ligera caída en G-MMLU-Lite y en KLAR, lo que sugiere un equilibrio entre precisión factual y capacidad general.

Al ser un adaptador PEFT, no es un modelo autónomo: requiere cargar el modelo base `jvonrad/Qwen-2.5-7B-TED` y aplicar el adaptador mediante la librería `peft`. Su tamaño de repositorio es de solo 0,2 GB, lo que lo hace ligero de descargar, pero la inferencia depende del modelo base de 7B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Qwen2.5-7B) |
| Parametros totales | No disponible (adaptador LoRA sobre modelo base de 7B) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | No aplica (adaptador LoRA en safetensors) |
| Idiomas soportados | en, de, es, fr, pt, id, ru, zh, ar, ja, sw, bn |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 64 y alpha 128 aplicado sobre `jvonrad/Qwen-2.5-7B-TED`, que a su vez es un checkpoint de Qwen2.5-7B con entrenamiento continuo (CPT) enfocado en traducción. El adaptador se entrena mediante supervisión fina (SFT) sobre 10 000 hechos del dataset `PolyFact-Clean`, distribuidos en 12 idiomas. Forma parte de un diseño experimental donde el mismo conjunto de datos y la misma base se entrenan con diferentes objetivos (SFT, DCO, CM-Align y GRPO) para aislar el efecto del método de entrenamiento.

No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO. El entrenamiento se centra en el recuerdo factual cerrado (closed-book), evaluado con prompts del tipo `Question: {q}\nAnswer:` sin opciones visibles. La innovación principal es la comparación controlada de objetivos de aprendizaje para consistencia cross-lingual, aunque este adaptador en concreto usa el objetivo SFT clásico.

## Capacidades

- Generación de texto en 12 idiomas (en, de, es, fr, pt, id, ru, zh, ar, ja, sw, bn).
- Recuerdo factual multilingüe: responde preguntas de conocimiento general en múltiples idiomas con precisión mejorada frente al modelo base en el benchmark PolyFact.
- Consistencia cross-lingual: capacidad de mantener la misma respuesta correcta a través de los 12 idiomas (medida con TotCons).
- Integración con el ecosistema PEFT/HuggingFace: se puede cargar como adaptador sobre el modelo base con `PeftModel`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Evaluación de recuerdo factual multilingüe: útil para investigadores que necesitan medir la consistencia de respuestas factuales en varios idiomas, como en tareas de QA cross-lingual.
- Benchmarking de métodos de ajuste fino: sirve como referencia para comparar SFT frente a técnicas de refuerzo (DCO, CM-Align, GRPO) en escenarios controlados.
- Adaptación ligera de un modelo base de 7B: al ser un adaptador LoRA, permite experimentar con bajo coste de almacenamiento y sin reentrenar el modelo completo.
- Sistemas de pregunta-respuesta multilingües en entornos de investigación: puede integrarse en pipelines que requieran respuestas factuales en varios idiomas, aunque su rendimiento en generación libre es limitado.
- Estudio de transferencia cross-lingual: para analizar cómo el entrenamiento en un conjunto de hechos en 12 idiomas afecta a idiomas no vistos (evaluado con KLAR held-out).
- Reproducción de experimentos académicos: el código y los datos están disponibles para replicar los resultados del paper asociado.

## Benchmarks y rendimiento

Los resultados publicados en la model card se comparan con el modelo base `jvonrad/Qwen-2.5-7B-TED`. Las métricas son precisión (%) salvo indicación.

| Modelo | PolyFact | TotCons | RankC@4 | BMLAMA-53 | G-MMLU-Lite | KLAR seen | KLAR held-out |
|---|---|---|---|---|---|---|---|
| Base (TED) | 46,67 | 3,97 | 61,12 | 25,19 | 60,61 | 38,97 | 23,77 |
| **Este modelo (SFT)** | 55,26 | 5,39 | 63,53 | 25,66 | 60,07 | 38,01 | 22,77 |

PolyFact se refiere a la precisión en el test split de 2 039 hechos de PolyFact-Clean; TotCons es el porcentaje de hechos respondidos correctamente en los 12 idiomas; RankC@4 es una métrica de ranking (chance 37,68); KLAR evalúa generación libre en 17 idiomas (7 vistos y 10 no vistos). Se observa una mejora sustancial en PolyFact y TotCons, un ligero incremento en RankC y BMLAMA-53, pero una pequeña caída en G-MMLU-Lite y en KLAR, lo que indica que el SFT mejora el recuerdo factual específico pero no la capacidad general de generación.

## Requisitos de hardware

- Al ser un adaptador LoRA, los requisitos de hardware son los del modelo base `jvonrad/Qwen-2.5-7B-TED` (un transformer de 7B parámetros).
- Para inferencia en fp16 se estima un consumo de VRAM de aproximadamente 14-16 GB, por lo que es viable en GPUs de consumo como RTX 3090, RTX 4090 o A5000.
- Para despliegue en producción se recomienda usar vLLM o TGI con el modelo base fusionado con el adaptador, o bien cargar el adaptador en tiempo de ejecución con `peft`.
- No se proporcionan datos de latencia ni throughput específicos para este adaptador.
- El adaptador en sí ocupa solo 0,2 GB, por lo que el almacenamiento adicional es mínimo.

## Comparativa con modelos similares

No se dispone de información sobre otros adaptadores comparables en la misma categoría. La única comparación publicada es contra el modelo base `jvonrad/Qwen-2.5-7B-TED`, que se muestra en la tabla de benchmarks. No hay datos de otros modelos como Qwen2.5-7B-Instruct o Llama-3-8B para comparar directamente en las mismas métricas.

## Limitaciones y advertencias

- El modelo es un adaptador de investigación, no un modelo de producción: no se han documentado sesgos, alucinaciones ni comportamientos indeseados específicos.
- El entrenamiento se centra en recuerdo factual cerrado; en generación libre (KLAR) el rendimiento es inferior al del modelo base, lo que sugiere una posible degradación en tareas abiertas.
- La consistencia cross-lingual sigue siendo baja (TotCons = 5,39 %), lo que indica que el modelo aún falla en mantener respuestas coherentes en todos los idiomas.
- No se especifica la longitud de contexto, por lo que se hereda la del modelo base Qwen2.5-7B (habitualmente 32 768 tokens, pero no confirmado en esta ficha).
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un artefacto académico sin validación externa amplia.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales (no se detallan aquí).

## Enlaces

- [HuggingFace: jvonrad/Qwen-2.5-7B-CPT-SFT-10k](https://huggingface.co/jvonrad/Qwen-2.5-7B-CPT-SFT-10k)
- [Modelo base: jvonrad/Qwen-2.5-7B-TED](https://huggingface.co/jvonrad/Qwen-2.5-7B-TED)
- [Dataset: jvonrad/PolyFact-Clean](https://huggingface.co/datasets/jvonrad/PolyFact-Clean)
- [Paper: arXiv 2606.06586](https://arxiv.org/abs/2606.06586) (Improving Cross-Lingual Factual Recall via Consistency-Driven Reinforcement Learning)
