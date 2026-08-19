# SHS-Lab/Muse-Glimmer-30B-Abliterated-Aggressive

## Resumen

El modelo `SHS-Lab/Muse-Glimmer-30B-Abliterated-Aggressive` es una variante "de-abliterated" (eliminación de rechazo) del modelo base `meta-models/Muse-Glimmer-30B`, desarrollada por el laboratorio SHS-Lab. El objetivo de esta variante es reducir drásticamente el comportamiento de rechazo del modelo ante instrucciones potencialmente dañinas, utilizando una técnica de ajuste fino con LoRA que combina la pérdida de cumplimiento con una restricción de divergencia KL para minimizar el deterioro de las capacidades originales. Esta versión "agresiva" relaja aún más el guardrail KL (`λ_KL = 0.5`), logrando una tasa de rechazo de 0/100 en el conjunto `harmful_behaviors`, a costa de una mayor deriva respecto al modelo base.

El modelo base, Muse-Glimmer-30B, es un modelo multimodal de 29,8 mil millones de parámetros, con un vocabulario de 202k tokens y pesos en bf16, diseñado para ejecución local en dispositivos. La variante abliterada mantiene la misma arquitectura y tamaño, pero con los pesos ajustados mediante un adaptador LoRA de 119 MB. Está disponible en formato safetensors (bf16) y en cuantizaciones GGUF (Q8_0 y Q4_K_M). Su licencia es Apache-2.0, lo que permite uso comercial y modificación.

Esta ficha se centra en la variante agresiva, que presenta una reducción de rechazo más intensa que la variante "normal", pero también una mayor divergencia KL respecto al base, lo que implica una posible pérdida de capacidades. No se han publicado benchmarks de rendimiento para esta variante; la métrica principal de control es la divergencia KL con el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (basado en Muse-Glimmer-30B, no se especifica detalle) |
| Parametros totales | 29.776.626.688 (~29,8 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (original), Q8_0, Q4_K_M (GGUF) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (bf16) y GGUF |

## Arquitectura y entrenamiento

El modelo base Muse-Glimmer-30B es un transformer multimodal con 29,8 B de parametros, disenado para tareas de agente y ejecucion local. La variante abliterada se obtiene mediante un ajuste fino con LoRA (Low-Rank Adaptation) que utiliza una funcion de perdida combinada: `CE(compliance) + λ·KL(tuned‖base)`, donde `CE` es la entropia cruzada sobre respuestas de cumplimiento y `KL` mide la divergencia entre las distribuciones de salida del modelo ajustado y el base. En esta variante agresiva, `λ_KL = 0.5`, lo que reduce el peso de la restriccion KL y permite una eliminacion mas profunda del comportamiento de rechazo.

El entrenamiento se realizo con los siguientes hiperparametros: `r=16`, `alpha=16`, `lr=5e-5`, `epochs=2`, scheduler coseno con warmup del 5%, grad clip 0.3, batch 1 con grad-accum 8 y `max_seq=768`. El conjunto de datos de entrenamiento consistio en 544 prompts con respuestas generadas mediante best-of-N (N=4, temperatura 0.8), filtradas para eliminar rechazos, y divididas en train/48-holdout. Los targets de LoRA fueron `o_proj` y `down_proj`, con un total de 31,1 M de parametros entrenados (0,10% del total). El adaptador resultante ocupa 119 MB.

## Capacidades

- Generacion de texto: el modelo puede generar respuestas coherentes en ingles, con una tendencia muy baja a rechazar instrucciones, incluso aquellas que podrian considerarse daninas.
- Reduccion de rechazo: tasa de rechazo de 0/100 en el conjunto `harmful_behaviors`, y 5/100 en over-refusal (or-bench).
- Multimodalidad: el modelo base es multimodal (image-text-to-text), aunque no se han evaluado estas capacidades en esta variante.
- Uso como asistente conversacional: apto para dialogos multi-turno, aunque no se han medido capacidades de tool calling o agentes en esta variante.
- Compatibilidad con cuantizacion: disponible en GGUF para inferencia eficiente en CPU/GPU con llama.cpp u otros motores.

## Casos de uso

- Investigacion sobre alineacion y seguridad de modelos: permite estudiar el impacto de la eliminacion de rechazo en el comportamiento del modelo, comparando con la variante base y la variante normal.
- Generacion de contenido creativo sin restricciones: util para escritura de ficcion, guiones o material artistico donde se requiere explorar temas sensibles sin filtros.
- Analisis de politicas de moderacion: el modelo puede usarse para probar sistemas de filtrado de contenido, generando respuestas que evaden los rechazos tipicos.
- Entornos de investigacion controlados: en laboratorios con salvaguardas, puede emplearse para probar escenarios de riesgo y desarrollar contramedidas.
- Asistente general en entornos de desarrollo: aunque no se han evaluado capacidades de codigo, el modelo base tiene potencial agente; esta variante podria usarse en pipelines donde se requiera baja censura.
- Evaluacion de robustez de sistemas de seguridad: al tener 0 refusals en harmful_behaviors, sirve como caso extremo para probar detectores de contenido danino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los benchmarks fueron omitidos por solicitud, y que la metrica principal de control es la divergencia KL respecto al modelo base. Los valores KL medidos son:

| Metrica | Valor |
|---|---|
| KL media (BF16) | 0.1697 |
| KL p50 | 0.1560 |
| KL p90 | 0.2367 |
| KL p99 | 0.2912 |
| KL media (Q8_0) | 0.1625 |
| KL media (Q4_K_M) | 0.2023 |

Estos valores indican una deriva moderada respecto al base, mayor que la variante normal (que se situa ~1.7x por debajo en media).

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en bf16 ocupa aproximadamente 56 GB, por lo que requiere una GPU con al menos 60 GB de VRAM (por ejemplo, A100 80GB, H100 80GB, o 2x RTX 4090 con tensor parallelism).
- Con cuantizacion Q8_0 (28 GB) cabe en una GPU de 32 GB (A100 40GB, o RTX 4090 con 24 GB no es suficiente; se necesitaria 2x 24GB o una A6000 48GB).
- Con cuantizacion Q4_K_M (16 GB) puede ejecutarse en GPUs consumer de 24 GB (RTX 3090/4090) o incluso en 16 GB con offloading a CPU.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (transformers), y cualquier motor compatible con safetensors o GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la misma categoria (abliterados). La comparacion mas directa es con el modelo base `meta-models/Muse-Glimmer-30B` y con la variante normal del mismo laboratorio (no incluida en esta ficha). Respecto al base, esta variante presenta una tasa de rechazo de 0/100 frente a 100/100 (presumiblemente), pero una deriva KL mayor. No se han publicado comparativas con otros modelos abliterados de tamano similar.

## Limitaciones y advertencias

- El modelo ha sido disenado para reducir el rechazo, lo que implica que puede generar contenido danino, ilegal o eticamente cuestionable sin filtros. Su uso en produccion sin salvaguardas externas es altamente riesgoso.
- La deriva KL respecto al base puede degradar capacidades generales (razonamiento, codigo, matematicas) en comparacion con la variante normal, aunque no se ha medido cuantitativamente.
- No se han evaluado sesgos o alucinaciones especificos de esta variante; se asume que hereda los del modelo base, pero con una supervision de seguridad reducida.
- Solo soporta ingles (en), lo que limita su uso en otros idiomas.
- La licencia Apache-2.0 permite uso comercial, pero el usuario es responsable del cumplimiento legal y etico de las aplicaciones.
- En el dominio de ciberseguridad, el modelo rechaza solo 1 de 2 prompts que deberian rechazarse (cyber-policy-refuse), lo que indica que puede facilitar actividades maliciosas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SHS-Lab/Muse-Glimmer-30B-Abliterated-Aggressive
- Variante NVFP4 (de yar-sh): https://huggingface.co/yar-sh/Muse-Glimmer-30B-Abliterated-Aggressive-NVFP4
- Repositorio GitHub sobre Muse-Glimmer: https://github.com/cobusgreyling/Muse-Glimmer
- Articulo de Forbes sobre Muse Glimmer: https://www.forbes.com/sites/jonmarkman/2026/08/11/meta-unveils-muse-glimmer-a-30b-parameter-ai-model-that-runs-locally/
