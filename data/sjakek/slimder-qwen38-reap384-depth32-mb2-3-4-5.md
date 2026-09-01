# sjakek/slimder-qwen38-reap384-depth32-mb2-3-4-5

## Resumen

SLIMDER Qwen3.8 REAP-384 depth-32 (macroblocks 2, 3, 4, 5 removed) es un checkpoint experimental de poda estructural (pruning) desarrollado por el usuario sjakek. Se deriva del checkpoint público depth-40 REAP-384 de la familia Qwen3.8, al que se le han eliminado los macrobloques originales 2, 3, 4 y 5, reduciendo el número de capas transformer de 40 a 32. El resultado es un modelo con 115.323.137.280 parámetros, manteniendo el ancho de expertos enrutados REAP-384.

Este modelo no es un lanzamiento comercial, sino un artefacto de investigación orientado a explorar la frontera de Pareto entre eficiencia y rendimiento mediante poda estructural. Su relevancia radica en que demuestra que es posible eliminar capas completas de un modelo MoE grande manteniendo una calidad aceptable en tareas funcionales, aunque el autor advierte explícitamente que no debe tratarse como un reemplazo directo sin evaluación previa en el dominio de uso.

La licencia es Apache 2.0, lo que permite uso comercial y modificación, pero al ser un checkpoint experimental, su adopción en producción requiere validación rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts) con enrutamiento REAP-384 |
| Parametros totales | 115.323.137.280 (115,3 B) |
| Parametros activos | no disponible (no se especifica en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el checkpoint se publica en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3.8, que es un transformer con mezcla de expertos (MoE). El checkpoint original depth-40 REAP-384 ya había sido sometido a una poda que eliminaba los macrobloques 4 y 5. Sobre ese padre, el proceso S3 (beam search estructural) eliminó los macrobloques locales 2 y 3, que corresponden a los macrobloques originales 2 y 3 (capas fuente 8-15). El resultado final elimina los macrobloques originales 2, 3, 4 y 5, dejando 32 capas transformer.

El entrenamiento consistió en una poda estructural seguida de una fase de reparación (repair) para recuperar funcionalidad. No se dispone de detalles sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. La innovación técnica principal es el propio método de poda estructural con beam search (S3) y la evaluación mediante métricas de similitud de representaciones (residual cosine, top-1 agreement) y pruebas funcionales ejecutables.

## Capacidades

- Generación de texto y razonamiento: al ser un derivado de Qwen3.8, conserva capacidades generales de lenguaje, aunque degradadas respecto al modelo original.
- Tool calling y ejecución de código: la prueba funcional del autor indica que el modelo pasa 7 de 8 tareas, incluyendo ejecución de Python y llamadas a herramientas con JSON exacto.
- Razonamiento multi-paso: no hay evidencia específica, pero la arquitectura MoE con 32 capas sugiere capacidad para tareas complejas, aunque no se ha validado formalmente.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales: ninguna adicional documentada (no se menciona visión, audio ni modo thinking).

## Casos de uso

- Investigación en poda de modelos: este checkpoint es un caso de estudio para analizar cómo la eliminación de capas afecta a la calidad de representaciones y a la funcionalidad ejecutable. Se puede usar para comparar métricas de similitud (cosine, top-1 agreement) entre versiones podadas.
- Evaluación de robustez post-poda: sirve para probar si un modelo podado mantiene capacidades de tool calling y ejecución de código en entornos controlados, como se hizo en la prueba funcional del autor.
- Benchmark de eficiencia estructural: permite medir el trade-off entre número de parámetros (115 B) y rendimiento en tareas específicas, frente a otros checkpoints de la misma familia.
- Desarrollo de técnicas de reparación: al ser un checkpoint "reparado", puede utilizarse como base para experimentar con métodos de fine-tuning o reparación adicional para recuperar capacidades perdidas.
- Pruebas de despliegue en entornos con restricciones de memoria: al tener menos capas que el padre, podría caber en hardware con menos VRAM, aunque no se han publicado requisitos concretos.
- Validación de pipelines de evaluación funcional: el autor proporciona un conjunto de tareas ejecutables (Python, JSON tool calls) que pueden reutilizarse para validar otros modelos podados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona métricas de validación específicas del proceso de poda, que se resumen a continuación:

| Metrica | Valor |
|---|---|
| Residual cosine (beam screen, 17 candidatos) | 0,919 |
| Top-1 agreement (beam screen) | 0,775 |
| Loss increase (beam screen) | 0,154 |
| Residual cosine (holdout disjunto) | 0,913 |
| Top-1 agreement (holdout) | 0,705 |
| Loss increase (holdout) | 0,153 |
| Tareas funcionales ejecutables (reparado) | 7/8 (frente a 6/8 del padre sin cambios) |
| Residual cosine (categoría retrieval, holdout) | 0,876 |
| Top-1 agreement (código/tool, holdout) | 0,638 / 0,631 |

Estos datos indican que el modelo podado mantiene una alta similitud de representaciones con el padre, pero con degradación en tareas de código y recuperación. La prueba funcional muestra una ligera mejora sobre el padre en tareas ejecutables, aunque con una falla en el mismo ítem de aritmética de horarios.

## Requisitos de hardware

- VRAM estimada: no disponible. Con 115 B parámetros en BF16, el checkpoint ocupa aproximadamente 230 GB en disco (según el tamaño del repo), por lo que la inferencia requeriría múltiples GPUs de alta gama o cuantización agresiva.
- GPUs recomendadas: no se han publicado recomendaciones específicas. Dado el tamaño, se necesitarían al menos 4-8 GPUs A100 80 GB o H100 para inferencia en BF16 sin cuantizar.
- Compatibilidad con GPUs de consumo: no es viable en una sola GPU consumer (RTX 4090 tiene 24 GB). Con cuantización a 4 bits podría intentarse en configuraciones multi-GPU, pero no hay datos al respecto.
- Opciones de despliegue: al ser un checkpoint safetensors, puede cargarse con frameworks como vLLM, TGI o Transformers, siempre que se disponga de suficiente memoria. No se menciona soporte GGUF ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

El modelo comparable más cercano es el checkpoint padre `sjakek/slimder-qwen38-reap384-depth40-mb4-5` (40 capas, mismo ancho REAP-384) y el modelo base Qwen3.8-27B (dense, 27 B parámetros, de la misma familia). La comparación se centra en el efecto de la poda:

| Modelo | Parametros | Capas | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| slimder-qwen38-reap384-depth32-mb2-3-4-5 | 115,3 B | 32 | no disponible | Apache 2.0 | Checkpoint podado experimental |
| slimder-qwen38-reap384-depth40-mb4-5 | no disponible | 40 | no disponible | Apache 2.0 | Padre, sin eliminar macrobloques 2 y 3 |
| Qwen3.8-27B | 27 B | 64 (16 full attention) | 262 144 (extensible a 1M) | Apache 2.0 | Modelo dense multimodal de la familia Qwen3.8 |

El modelo podado tiene 4 veces más parámetros que el Qwen3.8-27B, pero no se dispone de benchmarks comparativos. La comparación con el padre muestra una pérdida de calidad en holdout (cosine 0,913 vs 0,919) pero una mejora en tareas funcionales (7/8 vs 6/8), lo que sugiere que la poda puede tener efectos positivos en ciertas capacidades.

## Limitaciones y advertencias

- Checkpoint experimental: el autor lo califica como "artefacto de frontera de Pareto" y advierte que no debe usarse como reemplazo directo sin evaluación downstream.
- Degradación en categorías específicas: el holdout muestra una caída notable en retrieval (cosine 0,876) y en código/tool (top-1 agreement 0,638/0,631), lo que indica que la poda afecta de forma desigual a distintas capacidades.
- Fallo conocido: el modelo falla en un ítem de aritmética de horarios, el mismo que fallaba el padre, lo que sugiere una limitación heredada.
- Sin datos de contexto ni idiomas: no se ha especificado la longitud de contexto soportada ni los idiomas, lo que impide garantizar su uso en aplicaciones multilingües o de contexto largo.
- Sin benchmarks estándar: no hay resultados de MMLU, HumanEval, etc., por lo que no se puede comparar con otros modelos de forma objetiva.
- Requisitos de hardware elevados: con 115 B parámetros, su despliegue es costoso y no apto para entornos con recursos limitados.
- Riesgo de alucinación y sesgos: al ser un modelo derivado de Qwen3.8, puede heredar sesgos del modelo base, pero no se ha evaluado específicamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sjakek/slimder-qwen38-reap384-depth32-mb2-3-4-5
- Repositorio de resultados S3 (mencionado en la model card): `sjakek/slimder-qwen38-s3-results-20260831` (no se proporciona URL directa)
- Modelo base: https://huggingface.co/sjakek/slimder-qwen38-reap384-depth40-mb4-5
- Referencia de la familia Qwen3.8: https://huggingface.co/Qwen/Qwen3.8-27B
