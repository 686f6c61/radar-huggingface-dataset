# jaysun007/zils-mini-body-m11

## Resumen

Zils mini body m11 es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-4B publicado por el usuario jaysun007 en Hugging Face. Se presenta como un "decision body" dentro de la familia Zils, concretamente para el pool de modelos d3-mini de la subred 127 de Bittensor. El modelo parte de la media uniforme de los miembros actuales del pool (cuerpos con licencia Apache-2.0) y se entrena mediante LoRA sobre Qwen3.5-4B.

El modelo está orientado a tareas de decisión: clasificación y resolución de ítems con formato de examen, conteo, reglas y decisiones tipadas. No es un modelo de propósito general, sino un componente especializado dentro de un ecosistema de agregación de modelos (soup) que se evalúa contra un benchmark privado retenido. La relevancia actual reside en su carácter de experimento de entrenamiento descentralizado y en su base Qwen3.5-4B, con 4.539.265.536 parámetros totales según safetensors.

La información pública disponible es muy limitada: el repositorio tiene cero descargas y cero likes, no se declaran idiomas soportados ni pipeline, y la model card es breve. La ficha se completa con los datos disponibles y se marca explícitamente como "no disponible" todo aquello que no figura en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune LoRA de Qwen/Qwen3.5-4B; tag `qwen3_5`, requiere `custom_code`) |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 9,1 GB; incluye código personalizado) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del transformer Qwen/Qwen3.5-4B, con aproximadamente 4.540 millones de parámetros. El entrenamiento se realizó mediante LoRA con el comando oficial `zils.teacher train`, con rangos de 32 a 64, tasa de aprendizaje 1e-4, una época y distintas semillas y datos. El punto de partida fue la media uniforme de los miembros actuales del pool d3-mini (cuerpos Apache-2.0). Entre los ajustes resultantes se eligió el mejor, o su media uniforme, según un benchmark privado retenido.

Los datos de entrenamiento (solo splits de train) incluyen: ítems de conteo y reglas generados exactamente por código, ítems con formato de examen escritos con la receta de autoría de Zils a partir de filas de train, filas de conjuntos públicos de decisión (zils-ai/zils-relay-answers, tasksource/tasksource-jev-typed-decisions train, decisionmodels/sn92-*, samatv256/jev-decisions-v1) y filas ancla respondidas por el soup inicial. Se eliminaron las filas que coincidían con conjuntos de test de benchmarks públicos. El autor advierte de que debe comprobarse la licencia de cada fuente antes de reutilizarla. No se detalla el número total de tokens de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento sobre ítems con formato de examen.
- Tareas de conteo exacto y aplicación de reglas generadas por código.
- Clasificación y resolución de decisiones tipadas (typed decisions).
- Respuesta a ítems de conjuntos de decisión públicos (jev-typed-decisions, jev-decisions-v1, sn92-*).
- Comportamiento de "decision model" dentro del pool d3-mini de Zils.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Evaluación de decisiones tipadas: el modelo puede clasificar ítems de decisión con formato estructurado, aprovechando el entrenamiento sobre tasksource/tasksource-jev-typed-decisions y jev-decisions-v1.
- Clasificación de ítems con formato de examen: adecuado para pipelines de evaluación automática donde se requiere responder preguntas con formato de test, gracias a los ítems de examen generados con la receta de autoría de Zils.
- Verificación de conteo y reglas: puede emplearse en tareas de conteo exacto y aplicación de reglas deterministas, ya que se entrenó con ítems generados por código.
- Componente de un pool de modelos (soup): sirve como cuerpo candidato dentro del pool d3-mini de la subred 127 de Bittensor, donde se agrega con otros modelos y se evalúa contra un benchmark privado.
- Investigación sobre entrenamiento descentralizado: útil para estudiar el efecto de LoRA (rangos 32-64, lr 1e-4, una época) sobre Qwen3.5-4B en tareas de decisión.
- Prototipado de sistemas de decisión de bajo coste: con 4.540 millones de parámetros, puede desplegarse en entornos con recursos moderados para experimentar con decisiones tipadas antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor menciona un benchmark privado retenido para seleccionar el mejor ajuste, pero no se proporcionan cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa por tamaño (4.540 millones de parámetros), en FP16 requeriría aproximadamente 9 GB de pesos, y en cuantizaciones de 8 y 4 bits, aproximadamente 4,5 GB y 2,3 GB respectivamente; estos cálculos son estimaciones genéricas, no datos del autor.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? No disponible de forma explícita; por tamaño, un modelo de 4.540 millones de parámetros podría caber en GPU de consumo con cuantización, pero no se confirma en la información.
- Opciones de despliegue: no disponible. El repositorio requiere `custom_code` y el tag `qwen3_5`, por lo que la carga puede necesitar `trust_remote_code=True`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Zils mini body m11 (este modelo) | 4.539.265.536 | no disponible | apache-2.0 | Hugging Face (0 descargas, 0 likes) | Fine-tune LoRA de Qwen3.5-4B para decisiones |
| Qwen/Qwen3.5-4B (base) | ~4B (según nombre) | no disponible | no disponible en esta ficha | Hugging Face | Modelo base del fine-tune |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se identifican modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; no se documentan sesgos en la model card.
- Riesgo de alucinación: no evaluado ni documentado; el modelo es un fine-tune de decisión y no se aportan métricas de fiabilidad.
- Limitaciones de contexto o idioma: no se declara longitud de contexto ni idiomas soportados.
- Restricciones de licencia: la licencia del modelo es apache-2.0, pero el autor advierte de que debe comprobarse la licencia de cada fuente de datos antes de reutilizarla; los datos de entrenamiento provienen de conjuntos públicos con licencias propias.
- Requiere código personalizado (`custom_code`, tag `qwen3_5`): la carga puede necesitar `trust_remote_code=True`, lo que implica revisar el código antes de ejecutarlo en producción.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta, lo que limita la validación comunitaria.
- Selección mediante benchmark privado: el mejor ajuste se eligió contra un benchmark retenido no público, por lo que el rendimiento real fuera de ese conjunto es desconocido.
- Uso comercial: la licencia apache-2.0 lo permite en principio, pero las obligaciones derivadas de las fuentes de datos deben verificarse de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaysun007/zils-mini-body-m11
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Conjunto de datos zils-ai/zils-relay-answers: https://huggingface.co/datasets/zils-ai/zils-relay-answers
- Conjunto de datos tasksource/tasksource-jev-typed-decisions: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
- Conjunto de datos samatv256/jev-decisions-v1: https://huggingface.co/datasets/samatv256/jev-decisions-v1
- Conjuntos de datos decisionmodels/sn92-*: no disponible (URL concreta no proporcionada)
- Paper, blog, repositorio o demo adicionales: no disponible
