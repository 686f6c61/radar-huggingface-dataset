# reneeice/z3m-kd-r2

## Resumen

`reneeice/z3m-kd-r2` es un repositorio de respaldo (backup) de checkpoints de entrenamiento intermedios asociados a un modelo denominado internamente "Mini d3", construido sobre una base Qwen3.5-4B. No se trata de un modelo publicado para uso general, sino de un artefacto de trabajo que recoge el estado de dos experimentos de ajuste fino fallidos, etiquetados como `g2` (destilación por divergencia KL suave) y `g3kto` (optimización KTO). El autor lo publica con fecha de noviembre de 2026 y un tamaño de repositorio de 0,5 GB, lo que sugiere que contiene únicamente adaptadores o pesos parciales, no el modelo completo.

La relevancia de esta ficha es limitada desde el punto de vista práctico: no hay model card descriptiva, no se declaran licencia, idiomas ni pipeline, y las descargas y valoraciones son cero. La información disponible se reduce a las notas técnicas del README, que documentan hiperparámetros y resultados de dos intentos de entrenamiento que el propio autor marca como fallidos (`best_step 0 (failed)`).

Por tanto, esta ficha debe interpretarse como una descripción de un artefacto de investigación reproducible, no como una recomendación de despliegue. Cualquier evaluación de capacidades, rendimiento o idoneidad para producción carece de base empírica en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base citado es Qwen3.5-4B; la arquitectura del artefacto no se especifica) |
| Parametros totales | no disponible (modelo base Qwen3.5-4B, 4B aproximados; el repositorio de 0,5 GB no contiene pesos completos) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se declara formato safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El README describe dos ramas de entrenamiento sobre un mismo punto de partida y mismo conjunto de datos. La rama `g2` aplica una divergencia KL suave ("gentle KL") respecto a dos repositorios públicos de ingredientes (`Charlie320/zils-mini-s3l` en el commit `ca665f97` y `jaysun007/zils-mini-body-m10` en el commit `27c76831`), con tasa de aprendizaje 5e-5, un ancla (anchor) de 1.0 y 200 pasos; el resultado se marca como fallido con `best_step 0`. La rama `g3kto` parte de los mismos datos y punto de inicio, emplea KTO con beta 0.5 y reporta un colapso de la semilla de 92.44 a 74.85, también con `best_step 0 (failed)`.

El autor indica que los "cuerpos fusionados" (merged bodies) se omiten deliberadamente: el modelo `nsoup` se reconstruye a partir de los dos repositorios públicos de ingredientes, y los cuerpos equivalen a `nsoup` más el adaptador. No se especifican número de tokens de entrenamiento, composición del dataset, ni si hubo fases de RLHF o DPO más allá del uso de KTO en la rama `g3kto`.

## Capacidades

- No se documentan capacidades funcionales del artefacto en la información disponible.
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de capacidades de agente o razonamiento multi-paso.
- No se declaran capacidades multilingües.
- No se declaran modos especiales (thinking, visión, audio).
- Al tratarse de checkpoints de entrenamiento fallidos, no se recomienda su uso como modelo generativo.

## Casos de uso

- Reproducción de experimentos de destilación KL: el repositorio permite reconstruir la rama `g2` a partir de los commits públicos de `Charlie320/zils-mini-s3l` y `jaysun007/zils-mini-body-m10`, útil para auditar por qué el `best_step` quedó en 0.
- Análisis de fallos en KTO: la rama `g3kto` documenta un colapso de la métrica de semilla (92.44 a 74.85) con beta 0.5, lo que sirve como caso de estudio de inestabilidad en optimización KTO.
- Auditoría de hiperparámetros: las notas permiten revisar la combinación lr 5e-5, anchor 1.0 y 200 pasos como configuración que no convergió.
- Trazabilidad de linaje de modelos: los hashes de commit (`ca665f97`, `27c76831`) permiten verificar la procedencia de los ingredientes del modelo base.
- Docencia sobre pipelines de ajuste fino: el repositorio ilustra el flujo `nsoup + adapter` y la omisión deliberada de cuerpos fusionados.
- Comparación de metodologías de alineación: confrontar KL suave frente a KTO sobre el mismo dataset y punto de partida con resultados fallidos en ambos casos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 0,5 GB y no contiene pesos completos del modelo base.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no determinable sin pesos completos; el modelo base citado (Qwen3.5-4B) requeriría en torno a 8-10 GB en FP16, pero este dato no se confirma en la información proporcionada.
- Opciones de despliegue: no disponible; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se identifican en la información proporcionada modelos comparables de la misma categoría (checkpoints de entrenamiento fallidos sobre base Qwen3.5-4B), ni se aportan métricas que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Los dos experimentos documentados se marcan explícitamente como fallidos (`best_step 0 (failed)`), por lo que el artefacto no debe usarse como modelo generativo en producción.
- La rama `g3kto` reporta un colapso de la métrica de semilla de 92.44 a 74.85, indicativo de degradación durante el entrenamiento.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido; ante la ausencia de licencia, debe asumirse reserva de derechos por defecto.
- No se declaran idiomas soportados ni sesgos conocidos.
- El repositorio no incluye los cuerpos fusionados, solo adaptadores y material de reconstrucción; no es un modelo autónomo listo para inferencia.
- Riesgo de alucinación: no evaluable sin pesos completos ni benchmarks.
- La fecha de creación (2026-11-13) y las referencias a "Qwen3.5-4B" no pueden verificarse con la información disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/reneeice/z3m-kd-r2
- Repositorio de ingredientes 1: https://huggingface.co/Charlie320/zils-mini-s3l (commit `ca665f97`)
- Repositorio de ingredientes 2: https://huggingface.co/jaysun007/zils-mini-body-m10 (commit `27c76831`)
