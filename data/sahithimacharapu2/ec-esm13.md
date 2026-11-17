# sahithimacharapu2/ec-esm13

## Resumen

ESM-2 35M Enzyme EC Number Classifier es un modelo de clasificación de proteínas desarrollado por el usuario sahithimacharapu2 y publicado en Hugging Face. Consiste en un ajuste fino del backbone ESM-2 de 35 millones de parámetros (facebook/esm2_t12_35M_UR50D) al que se le añade una cabeza clasificadora para predecir el número EC (Enzyme Commission) a cuatro niveles a partir de una secuencia de aminoácidos. El problema que resuelve es la anotación funcional automática de enzimas, una tarea central en bioinformática y biología computacional.

El modelo recibe secuencias de proteínas y devuelve predicciones del tipo "x.x.x.x" (por ejemplo, 1.1.1.131), evaluándose principalmente por la precisión en el cuarto nivel (L4), la clasificación más específica. El repositorio incluye pesos en safetensors, un vocabulario de 6939 números EC válidos, código de inferencia en Python y un Dockerfile para despliegue reproducible.

La relevancia del modelo radica en su tamaño reducido (35M de parámetros, repositorio de 0,1 GB), lo que lo hace apto para entornos con recursos limitados, y en su licencia MIT, que permite uso comercial sin restricciones. No obstante, se trata de un modelo de nicho con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados más allá de la métrica de evaluación declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ESM-2 (esm2_t12_35M_UR50D) con cabeza clasificadora MLP |
| Parametros totales | 35M (backbone ESM-2) + cabeza clasificadora (no especificada) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende de la configuración del backbone ESM-2) |
| Tipos de cuantizacion | no disponible (pesos en safetensors y classifier_head.pt) |
| Idiomas soportados | en (inglés; el modelo opera sobre secuencias de aminoácidos) |
| Licencia | MIT |
| Formato de pesos | safetensors (backbone ESM-2) y PyTorch state_dict (.pt) para la cabeza |

## Arquitectura y entrenamiento

El modelo se construye sobre el backbone ESM-2 de 35M de parámetros (12 capas, hidden size de 480), un transformer entrenado por Meta sobre secuencias de proteínas. Sobre la representación del backbone se añade una cabeza clasificadora consistente en Dropout, una capa lineal de 480 a 480, activación GELU, otro Dropout y una capa lineal final de 480 a `num_classes`. Según el código de entrenamiento incluido en la model card, se congelan las primeras 4 capas del backbone (`n_freeze=4`) y se ajusta el resto junto con la cabeza, con un dropout de 0,1.

La tarea es clasificación multietiqueta a cuatro niveles de EC number, con un vocabulario de 6939 números EC válidos y una lista de clases L4 con `fallback_ec` para casos no cubiertos. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO (no aplicables habitualmente en este tipo de tareas de clasificación). No se documentan innovaciones técnicas adicionales más allá del ajuste fino supervisado.

## Capacidades

- Clasificación de enzimas: predice el número EC a cuatro niveles (L1–L4) a partir de secuencias de aminoácidos.
- Clasificación multietiqueta: con el umbral `EC_THRESH` (por defecto 0,5) puede devolver predicciones adicionales además de la principal; con `EC_THRESH=1.1` se restringe a top-1.
- Procesamiento por lotes: soporta inferencia por lotes con `EC_BATCH` (por defecto 32).
- Gestión de presupuesto temporal: variable `EC_TIME_BUDGET` (por defecto 660 segundos) para limitar el tiempo de inferencia.
- Entrada/salida estructurada: entrada en Parquet con columnas `id` y `sequence`; salida en JSONL con `id` y lista de predicciones.
- Despliegue reproducible: incluye Dockerfile para construir y ejecutar el pipeline de inferencia.
- No soporta tool calling, agentes, visión, audio ni generación de texto libre; es un modelo discriminativo de clasificación.

## Casos de uso

- Anotación funcional automática de enzimas en pipelines de genómica: dado un conjunto de secuencias proteicas nuevas, el modelo predice su número EC, permitiendo priorizar candidatos para validación experimental. Adecuado por su bajo coste computacional y su salida estructurada en JSONL.
- Curación de bases de datos biológicas: integración en flujos de anotación para rellenar o verificar el campo EC de entradas proteicas, usando el umbral `EC_THRESH` para controlar la sensibilidad de las predicciones adicionales.
- Clasificación a gran escala en entornos con recursos limitados: el tamaño de 35M de parámetros y el repositorio de 0,1 GB permiten ejecutarlo en CPU o GPU de gama baja, con procesamiento por lotes configurable.
- Reproducibilidad en investigación: el Dockerfile y el código de inferencia incluidos permiten replicar resultados en entornos aislados, útil para estudios comparativos de clasificadores de enzimas.
- Filtrado previo en pipelines de descubrimiento de enzimas: usar la predicción L4 para descartar secuencias sin actividad enzimática plausible antes de análisis más costosos (docking, simulación).
- Docencia y experimentación con ESM-2: sirve como ejemplo de ajuste fino de un backbone proteico con cabeza clasificadora, con código de arquitectura y carga del checkpoint documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente declara que la métrica principal es la precisión L4, sin incluir cifras concretas ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 35M de parámetros en precisión FP32 el modelo ocupa aproximadamente 140 MB, y en FP16 alrededor de 70 MB, más el overhead de activaciones y lotes (valores estimados a partir del tamaño de parámetros, no publicados por el autor).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; también puede ejecutarse en CPU dado el reducido tamaño del modelo.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1–2 GB de VRAM disponible, incluyendo GTX 1650, RTX 3060, RTX 4090, etc.
- Opciones de despliegue: inferencia mediante el script `predict.py` incluido; despliegue con Docker (Dockerfile proporcionado); compatible con la librería transformers para cargar el backbone ESM-2. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de clasificación de este tipo).
- Latencia y throughput estimados: no disponibles; dependen del hardware, del tamaño de lote (`EC_BATCH`) y del presupuesto temporal (`EC_TIME_BUDGET`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ESM-2 35M EC Classifier (este modelo) | 35M | no disponible | Clasificación EC (L1–L4) | MIT | Hugging Face |
| ESM-2 35M (facebook/esm2_t12_35M_UR50D) | 35M | no disponible | Embeddings de proteínas (base, sin cabeza EC) | MIT | Hugging Face |
| ESM-2 650M (facebook/esm2_t33_650M_UR50D) | 650M | no disponible | Embeddings de proteínas (base, sin cabeza EC) | MIT | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse sobre un vocabulario de 6939 números EC, las clases poco representadas pueden tener peor rendimiento.
- Riesgo de alucinación: en clasificación, el equivalente es la asignación de EC numbers incorrectos o de baja confianza; el umbral `EC_THRESH` permite mitigar predicciones adicionales, pero no se documenta calibración de probabilidades.
- Limitaciones de contexto o idioma: el modelo opera sobre secuencias de aminoácidos, no sobre texto natural; el campo `language: en` de la model card es meramente administrativo.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificación y redistribución con atribución; no se identifican restricciones adicionales.
- Caveats para producción: modelo con cero descargas y cero likes, sin benchmarks publicados ni validación externa conocida; la calidad de las predicciones no está verificada de forma independiente. El repositorio incluye rutas de ejemplo (`YOUR_USERNAME`) que deben ajustarse. El campo `fallback_ec` sugiere que existen casos no cubiertos por el vocabulario L4.
- Fecha de creación futura (2026-11-17) en los metadatos, lo que puede indicar un artefacto de publicación o un error en los mismos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sahithimacharapu2/ec-esm13
- Backbone ESM-2 35M: https://huggingface.co/facebook/esm2_t12_35M_UR50D
- Repositorio Docker de referencia citado en la model card: https://huggingface.co/YOUR_USERNAME/enzyme-ec-esm2 (placeholder, no resuelto)
