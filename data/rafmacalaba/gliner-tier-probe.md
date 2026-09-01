# rafmacalaba/gliner-tier-probe

## Resumen

`rafmacalaba/gliner-tier-probe` es un modelo de tipo "sonda" (probe) diseñado para complementar al extractor de entidades GLiNER en un pipeline de filtrado de datos. Desarrollado por Rafael Macalaba, ingeniero de IA en el Banco Mundial, este probe toma el encoder congelado de `rafmacalaba/gliner_datause_tiered` y le añade una pequeña cabeza MLP que clasifica cada span de texto como "mantener" (perteneciente a los niveles T1∪T2) o "descartar" (T3 o basura). El objetivo es resolver un problema concreto: los umbrales de puntuación de GLiNER no logran expulsar ciertos "leaks" de alta confianza (puntuación ≥ 0.5) que contaminan los datos extraídos.

La relevancia de este modelo radica en su enfoque de investigación: en lugar de reentrenar el extractor completo, se entrena una cabeza ligera sobre representaciones congeladas para probar si la información del encoder es suficiente para separar los spans válidos de los inválidos. Los resultados en el conjunto de validación (AUROC de 0.9482 frente a 0.869 del umbral de GLiNER) sugieren que la representación interna sí contiene señales discriminativas útiles. El modelo se distribuye bajo licencia Apache 2.0 y está implementado con la librería GLiNER, aunque no se especifican el tamaño total de parámetros ni la arquitectura completa del encoder subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder congelado (GLiNER) + MLP de 3 capas (3·D → 256 → 256 → 1) con dropout 0.2 |
| Parametros totales | no disponible (depende de la dimensión D del encoder congelado) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el artefacto principal es `head.pt`, un state dict de PyTorch) |
| Idiomas soportados | no disponible (depende del encoder GLiNER subyacente) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state dict (`head.pt`), además de `probe_metrics.json` y `holdout_probe_predictions.jsonl` |

## Arquitectura y entrenamiento

El modelo es una sonda de clasificación binaria. El encoder GLiNER (congelado) produce embeddings de palabras; para cada span candidato se construye una característica concatenando el embedding de la palabra inicial, el de la palabra final y el promedio de todos los embeddings del span (`[start-word; end-word; mean-pool]`). Esta característica de dimensión 3·D se introduce en un MLP con dos capas ocultas de 256 unidades y una salida escalar, con dropout de 0.2. El entrenamiento se realizó durante 10 épocas con tasa de aprendizaje 0.001, optimizador AdamW y pérdida BCE ponderada por clase. La selección del checkpoint se basó en el AUROC de validación.

No se especifican los datos de entrenamiento (número de tokens, composición del dataset) ni si se aplicaron técnicas como RLHF o DPO. El modelo se presenta como un experimento de "tier probe" para evaluar si la representación del encoder puede separar los niveles de calidad de datos (T1∪T2 frente a T3/junk) mejor que un simple umbral de puntuación. La innovación técnica reside en el uso de una cabeza ligera sobre un encoder congelado, lo que permite probar hipótesis sobre la calidad de las representaciones sin reentrenar el modelo completo.

## Capacidades

- Clasificación binaria de spans: decide si un span extraído por GLiNER debe mantenerse (T1∪T2) o descartarse (T3/junk).
- Detección de "leaks" de alta confianza: identifica spans que el umbral de puntuación de GLiNER no expulsa (puntuación ≥ 0.5) pero que el probe clasifica como descartables.
- Integración con el pipeline de GLiNER: funciona como un post-procesador sobre las salidas del extractor, sin modificar el encoder original.
- Generación de métricas de evaluación: proporciona AUROC, curvas de threshold sweep y distribuciones de puntuación del probe.
- Reproducibilidad: incluye script de entrenamiento (`training/probe_gliner_tier.py`) en el repositorio `ai4data-playground`.
- No es un modelo generativo: no genera texto, no tiene capacidades de razonamiento, código, visión ni tool calling.

## Casos de uso

- Limpieza de datasets extraídos con GLiNER: cuando se utiliza GLiNER para extraer entidades de grandes corpus, el probe puede filtrar automáticamente los spans de baja calidad (T3/junk) que el umbral de puntuación no elimina, mejorando la precisión del dataset final.
- Control de calidad en pipelines de datos: en entornos de ingeniería de datos, el probe actúa como un segundo filtro después de la extracción, reduciendo la contaminación por entidades irrelevantes o mal formadas.
- Evaluación de representaciones de encoders: al ser una sonda, sirve como herramienta de análisis para determinar si un encoder GLiNER congelado contiene suficiente información para distinguir niveles de calidad de datos, útil para investigar mejoras en el modelo base.
- Experimentación en sistemas de extracción de información: investigadores pueden usar el probe para comparar diferentes estrategias de filtrado (umbral vs. clasificador) y cuantificar la ganancia en recall/precisión.
- Automatización de pipelines de anotación: en proyectos de anotación de datos, el probe puede pre-filtrar los spans candidatos antes de la revisión humana, reduciendo el esfuerzo de anotación.
- Monitorización de modelos de extracción: al desplegar GLiNER en producción, el probe puede ejecutarse en paralelo para detectar degradaciones en la calidad de las extracciones a lo largo del tiempo.

## Benchmarks y rendimiento

Los resultados se presentan sobre el conjunto de validación `eval_tiered_holdout` con 15.332 documentos. La tabla siguiente resume las métricas principales:

| Métrica | Valor |
|---|---|
| Probe AUROC (todos los spans dorados) | 0.9482 |
| Baseline: GLiNER score AUROC (publicado) | 0.869 |
| Probe AUROC (subconjunto con coincidencia superficial) | 0.9478 |
| GLiNER score AUROC (mismo subconjunto) | 0.8837 |
| Spans con coincidencia superficial | 20422 |

Además, se realizó un barrido de umbrales (threshold sweep) con los siguientes resultados:

| Umbral | keep_recall | drop_expelled | residual_expelled |
|---|---|---|---|
| 0.30 | 0.9600 | 0.7355 | 0.2794 |
| 0.40 | 0.9463 | 0.7823 | 0.3947 |
| 0.50 | 0.9278 | 0.8133 | 0.4685 |
| 0.60 | 0.9076 | 0.8447 | 0.5473 |
| 0.70 | 0.8820 | 0.8736 | 0.6254 |

Donde `keep_recall` es la fracción de spans T1∪T2 retenidos, `drop_expelled` la fracción de T3/junk eliminados, y `residual_expelled` la proporción de leaks de alta confianza (puntuación GLiNER ≥ 0.5) que el probe elimina. No se han publicado resultados comparativos con otros modelos de filtrado.

## Requisitos de hardware

- Al ser una cabeza MLP ligera sobre un encoder congelado, los requisitos de inferencia son mínimos. El encoder GLiNER subyacente es el que determina el coste principal, pero no se especifican sus requisitos.
- No se dispone de datos sobre VRAM estimada, GPUs recomendadas o latencia. El artefacto `head.pt` es un state dict de PyTorch que puede ejecutarse en CPU sin problemas para la mayoría de los casos de uso.
- Para integración en pipelines, se puede usar con la librería GLiNER (que soporta PyTorch) y opciones de despliegue como Hugging Face Inference Endpoints o un simple script Python.
- No se mencionan opciones como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (probes de filtrado para GLiNER). El propio autor publica otros modelos relacionados (`gliner-base-tuned`, `gliner-datause-probe`), pero no se proporcionan datos de comparación cuantitativa. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Es un modelo de investigación, no un componente de producción listo para usar. Su propósito es probar una hipótesis sobre la representación del encoder, no servir como filtro definitivo.
- Depende completamente del encoder congelado de `rafmacalaba/gliner_datause_tiered`. Si ese encoder cambia o se reentrena, el probe deja de ser válido.
- Los datos de entrenamiento y validación no están descritos en detalle; no se conoce la composición del dataset ni su procedencia, lo que limita la generalización a otros dominios.
- No se especifican sesgos conocidos, pero al ser un clasificador entrenado sobre un conjunto concreto de datos, puede heredar sesgos del encoder y del propio dataset.
- Riesgo de alucinación: no aplica, ya que no genera texto.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base (`gliner_datause_tiered`) podría tener restricciones adicionales no documentadas en esta ficha.
- No se proporcionan métricas de latencia ni throughput, por lo que no se puede estimar el coste en tiempo real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rafmacalaba/gliner-tier-probe
- Modelo base (encoder congelado): https://huggingface.co/rafmacalaba/gliner_datause_tiered
- Repositorio de código (ai4data-playground): https://github.com/rafmacalaba/ai4data-playground
- Perfil del autor en Hugging Face: https://huggingface.co/rafmacalaba
- Perfil del autor en GitHub: https://github.com/rafmacalaba
