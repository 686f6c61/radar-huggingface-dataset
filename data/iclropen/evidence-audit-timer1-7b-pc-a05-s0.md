# iclropen/evidence-audit-timer1-7b-pc-a05-s0

## Resumen

`evidence-audit-timer1-7b-pc-a05-s0` es un adaptador LoRA publicado por el usuario `iclropen` sobre el modelo base `Boshenxx/Time-R1-7B`, un modelo de visión-lenguaje de 7B parámetros construido sobre la arquitectura Qwen2.5-VL y especializado en localización temporal de vídeo (video temporal grounding). El adaptador no es un modelo autónomo: pesa 190.442.760 bytes (unos 190 MB) y requiere cargar el modelo base completo para funcionar.

El adaptador se enmarca en el artículo *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding* (envío a ICLR 2027, en revisión). Su propósito es entrenar al modelo para que su predicción dependa de forma efectiva de la evidencia visual del intervalo anotado, y no de atajos o sesgos del dataset. Para ello emplea un objetivo "placebo-controlled": se comparan ediciones del vídeo dentro del intervalo de evidencia con ediciones placebo equivalentes fuera de él, penalizando que el modelo responda igual ante ambas.

Es relevante para investigadores que trabajen en evaluación rigurosa de modelos de grounding temporal, porque expone un problema metodológico (alta precisión sin dependencia real de la evidencia) y publica un adaptador reproducible con scripts de auditoría. El modelo base Time-R1-7B es de tipo Mixture-of-Experts según la información disponible; no se especifican detalles adicionales de arquitectura del base más allá de Qwen2.5-VL.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen2.5-VL (modelo base Time-R1-7B) |
| Parametros totales | no disponible (adaptador: ~190 MB en safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA con rango 16, `lora_alpha=32` y dropout 0.05, aplicado a los módulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` del modelo base Time-R1-7B, que sigue la arquitectura Qwen2.5-VL. El objetivo de entrenamiento combina una supervisión NLL sobre el vídeo limpio (con peso alpha=0.5) con términos de margen (beta=0.1) que exigen que la verosimilitud de la respuesta correcta sea mayor con el vídeo editado en el intervalo de evidencia que con ediciones placebo equivalentes fuera de él, más un término hinge que acota la caída de rendimiento bajo placebo (d_O(trained) <= 1.25 d_O(reference) + 0.10, peso 1.0). Los pesos de los operadores se ajustan con Group-DRO.

El entrenamiento usó 2.400 pares de Charades-STA (primeras líneas de `data_ids/training_pairs_pool_8434.jsonl`), 300 pasos de optimizador, semilla 0, learning rate 5e-6 y acumulación de gradiente 8. Los operadores de edición aplicados (dos por ejemplo) son swap, mask, blur, tshift y shuffle. La entrada de vídeo se muestrea a 2 fps con un máximo de 768 fotogramas, con el vídeo antes del texto en el orden de mensajes. El script de entrenamiento es `code/27_papo_train_qcdro_v3seln_r5.py`.

## Capacidades

- Localización temporal de vídeo (video temporal grounding): predicción de intervalos temporales a partir de una consulta en lenguaje natural.
- Grounding guiado por evidencia visual: el adaptador está entrenado para que la predicción dependa del contenido del intervalo anotado y no de atajos del dataset.
- Procesamiento de vídeo a 2 fps con hasta 768 fotogramas por muestra.
- Capacidades heredadas del modelo base Qwen2.5-VL (visión-lenguaje), si bien no se detallan en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Evaluación de robustez en grounding temporal: usar el adaptador junto con los scripts de auditoría del repositorio de código (`iclropen/evidence-audit-code`) para medir cuánto depende el modelo de la evidencia real frente a ediciones placebo, comparando con el modelo base sin adaptador.
- Investigación en sesgos de dataset: aplicar las auditorías de verosimilitud y de comportamiento descritas en el artículo para detectar atajos en modelos de grounding sobre Charades-STA.
- Reproducción de resultados de un artículo: cargar el adaptador con la versión exacta de transformers (5.12.1) y peft (0.19.1 o superior) indicada para reproducir las tablas y figuras del envío a ICLR 2027.
- Desarrollo de métodos de entrenamiento contrafactual: servir como referencia de implementación del objetivo placebo-controlled con Group-DRO para experimentos propios sobre otros datasets de vídeo.
- Análisis de degradación bajo perturbaciones: evaluar cómo varía la precisión del modelo con operadores de edición (swap, mask, blur, tshift, shuffle) para caracterizar su sensibilidad a la calidad de la evidencia visual.
- Base para adaptaciones posteriores: al ser un LoRA sobre Time-R1-7B, puede combinarse o compararse con otros adaptadores del mismo modelo base para estudiar el efecto del entrenamiento en la dependencia de evidencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al requerir el modelo base Time-R1-7B completo en bfloat16, se estima que el modelo base necesita del orden de 15-16 GB de VRAM solo para pesos, más el adaptador (~190 MB) y el coste de procesar hasta 768 fotogramas de vídeo (activaciones y caché de atención), lo que eleva el requisito real por encima de esa cifra. Esta estimación es orientativa y no procede de la información proporcionada.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño del base, GPUs de 24 GB o más (RTX 4090, A100, H100) son candidatas razonables, pero no se confirma en la documentación.
- ¿Cabe en GPU de consumo? No confirmado. El base de 7B en bfloat16 no cabe en GPUs de 8-12 GB sin cuantización, y no se documentan opciones de cuantización para este adaptador.
- Opciones de despliegue: carga vía `transformers` (5.12.1 probado) + `peft` (0.19.1 o superior) + `qwen-vl-utils`, con el snippet de autocontrol incluido en la model card. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evidence-audit-timer1-7b-pc-a05-s0 (este) | LoRA sobre base 7B | no disponible | Grounding temporal de vídeo con dependencia de evidencia | Apache 2.0 | Hugging Face (adaptador) |
| Boshenxx/Time-R1-7B (base) | 7B | no disponible | Grounding temporal de vídeo | no disponible | Hugging Face |
| Alternativas de grounding temporal de 7B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- El repositorio contiene únicamente los pesos LoRA; sin el modelo base `Boshenxx/Time-R1-7B` el adaptador no es utilizable.
- Incompatibilidad silenciosa entre versiones de transformers: adaptadores entrenados con transformers 4.51 usan claves `base_model.model.model.layers.*` / `base_model.model.visual.*`, mientras que transformers 5 espera `base_model.model.model.language_model.layers.*` / `base_model.model.model.visual.*`. Cargar con la versión equivocada no lanza error pero deja los pesos LoRA sin cargar; es imprescindible ejecutar el autocontrol de la model card.
- Entrenado exclusivamente sobre Charades-STA (2.400 pares), por lo que la generalización a otros dominios de vídeo no está validada en la información disponible.
- Solo 300 pasos de optimizador y semilla 0: la variabilidad entre semillas no se documenta.
- El adaptador está diseñado para un objetivo de investigación (dependencia de evidencia) y no se documenta su rendimiento de precisión absoluta en producción.
- Idiomas soportados no documentados; el comportamiento multilingüe no está garantizado.
- Riesgo de alucinación y sesgos: no documentados específicamente para este adaptador; hereda los del modelo base.
- Licencia Apache 2.0 declarada en la model card, lo que en principio permite uso comercial, pero el artículo asociado está en revisión y el modelo base puede tener condiciones propias no detalladas aquí.
- Fecha de creación indicada como 2026-11-12, posterior a la redacción de esta ficha según la información disponible; verificar la vigencia del repositorio.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/iclropen/evidence-audit-timer1-7b-pc-a05-s0
- Modelo base: https://huggingface.co/Boshenxx/Time-R1-7B
- Repositorio de código y scripts de auditoría: https://huggingface.co/iclropen/evidence-audit-code
- Artículo: *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*, envío a ICLR 2027 (en revisión; sin enlace disponible)
