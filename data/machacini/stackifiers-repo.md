# Machacini/stackifiers-repo

## Resumen

Stackifiers Repo es un conjunto de dos modelos de regresión basados en la arquitectura ModernBERT (mmBERT de JHU CLSP) desarrollados por Machacini. Su función es predecir cinco puntuaciones continuas entre 0 y 5 sobre el contexto de código fuente visible que se les proporciona: `pretraining_value`, `repo_quality`, `coding_standard`, `difficulty` y `educational_value`. No se trata de un modelo generativo, sino de un extractor de características especializado en evaluación de calidad de repositorios de código.

El repositorio publica dos variantes del mismo ajuste fino: una sobre `jhu-clsp/mmBERT-small` (140.496.389 parámetros, rama `main`/`mmbert-small`) y otra sobre `jhu-clsp/mmBERT-base` (306.945.029 parámetros, rama `mmbert-base`). Ambos comparten el mismo pipeline de preprocesado, cabeza de regresión y metodología de evaluación, lo que permite intercambiarlos según los requisitos de latencia y precisión.

El modelo resulta relevante en el contexto de la curación de datasets de código para preentrenamiento y de la evaluación automática de repositorios. A diferencia de un clasificador discreto, devuelve regresiones continuas y gestiona entradas de longitud arbitraria mediante troceado en ventanas de 8.192 tokens con agregación ponderada, lo que lo hace aplicable a ficheros y contextos de repositorio completos sin truncado. La licencia MIT facilita su integración en pipelines comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (mmBERT) encoder + cabeza de regresión lineal (LayerNorm → dropout 0.1 → linear(5) → sigmoid) |
| Parametros totales | 140.496.389 (variante small); 306.945.029 (variante base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens por chunk; el pipeline `predict` trocea entradas mayores y agrega |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (entrenado sobre contexto de código; el modelo base mmBERT es multilingüe, pero la model card no detalla idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`, encoder y cabeza incluidos) |

## Arquitectura y entrenamiento

La arquitectura parte de mmBERT (ModernBERT multilingüe de JHU CLSP) como encoder. Sobre la representación del encoder se aplica un pipeline de agregación específico: el texto se tokeniza sin tokens especiales, se divide en chunks de hasta 8.192 tokens (incluyendo especiales) y cada chunk se codifica por separado. Cada chunk se representa mediante mean pooling ponderado por máscara de atención sobre tokens no padding, incluyendo especiales; después, las representaciones de chunk se promedian ponderando por el número de tokens de contenido (excluyendo especiales). La representación agregada pasa por LayerNorm, dropout (0.1, desactivado en inferencia) y una capa lineal de 5 salidas con sigmoid, produciendo las cinco puntuaciones continuas en [0, 5].

El ajuste fino es completo (fully fine-tuned) sobre ambos checkpoints base. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; sí indica que la evaluación se realiza contra anotaciones de un profesor LLM (LLM teacher annotations), no contra juicios humanos independientes. Los checkpoints exportados incluyen el encoder y la cabeza entrenada en un único `model.safetensors`, sin necesidad de descargar el checkpoint upstream original para inferencia.

## Capacidades

- Predicción de cinco puntuaciones de regresión continua en [0, 5]: `pretraining_value`, `repo_quality`, `coding_standard`, `difficulty` y `educational_value`.
- Procesamiento de contexto de repositorio completo sin truncado: troceado automático en ventanas de 8.192 tokens y agregación ponderada por tokens de contenido.
- Inferencia por lotes: `model.predict` acepta una lista de textos y devuelve una lista de diccionarios en el mismo orden.
- Control de memoria mediante `chunk_batch_size`, ajustable según la VRAM disponible.
- Extracción de logits por lote de un solo chunk mediante `model(**tokenizer(...)).logits`, con salida `[batch, 5]`.
- Soporte de `trust_remote_code=True` con wrapper y configuración incluidos e inspeccionables en el repositorio.
- No es un modelo generativo: no produce texto, no soporta tool calling, ni razonamiento multi-step, ni agentes, ni visión, ni audio.

## Casos de uso

- Curación de datasets de preentrenamiento: puntuar con `pretraining_value` y `repo_quality` los contextos de repositorio recopilados antes de incorporarlos a un corpus de entrenamiento, filtrando por umbral y priorizando material de mayor valor.
- Evaluación automática de repositorios en plataformas de código: integrar el modelo en un servicio que puntúe la calidad y el estándar de codificación de los ficheros visibles de un repositorio para generar informes o badges.
- Selección de material educativo: usar `educational_value` y `difficulty` para clasificar fragmentos de código por nivel y construir rutas de aprendizaje o ejemplos docentes ordenados por dificultad creciente.
- Enrutado de tareas en pipelines de agentes: puntuar el contexto de un repositorio para decidir qué modelo o estrategia de generación aplicar (por ejemplo, contextos de alta dificultad hacia modelos mayores).
- Análisis de deuda técnica a nivel de fichero: emplear `coding_standard` como señal continua para priorizar revisiones de código en integración continua.
- Investigación sobre calidad de código: usar las cinco salidas como variables dependientes en estudios empíricos sobre repositorios, con la ventaja de que las puntuaciones son continuas y no discretas.
- Detección de contextos de bajo valor: filtrar automáticamente fragmentos con `repo_quality` baja antes de pasarlos a un modelo generativo, reduciendo coste de inferencia y ruido.

## Benchmarks y rendimiento

Evaluación sobre 26.754 contextos de test retenidos por repositorio, comparando ambas variantes. Las métricas miden la concordancia con anotaciones de un profesor LLM.

| Variante | Parámetros | Test MAE ↓ | Test RMSE ↓ |
|---|---:|---:|---:|
| mmbert-small | 140.496.389 | 0.326695 | 0.557302 |
| mmbert-base | 306.945.029 | 0.318769 | 0.546326 |

Desglose por métrica de mmbert-small:

| Score | MAE ↓ | RMSE ↓ | Spearman ↑ | Contextos etiquetados |
|---|---:|---:|---:|---:|
| pretraining_value | 0.310120 | 0.464585 | 0.952245 | 26.754 |
| repo_quality | 0.369401 | 0.633371 | 0.890405 | 26.753 |
| coding_standard | 0.352478 | 0.676580 | 0.894324 | 26.754 |
| difficulty | 0.281626 | 0.518015 | 0.867862 | 26.753 |
| educational_value | 0.319848 | 0.493962 | 0.933114 | 26.749 |

Desglose por métrica de mmbert-base:

| Score | MAE ↓ | RMSE ↓ | Spearman ↑ | Contextos etiquetados |
|---|---:|---:|---:|---:|
| pretraining_value | 0.304355 | 0.457008 | 0.953680 | 26.754 |
| repo_quality | 0.360555 | 0.623037 | 0.893354 | 26.753 |
| coding_standard | 0.345906 | 0.666004 | 0.896573 | 26.754 |
| difficulty | 0.270646 | 0.502242 | 0.870636 | 26.753 |
| educational_value | 0.312383 | 0.483339 | 0.935696 | 26.749 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, dado que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada: la variante small (140 M parámetros) ocupa aproximadamente 0,6 GB en fp32 y unos 0,3 GB en fp16; la variante base (307 M parámetros) ronda 1,2 GB en fp32 y 0,6 GB en fp16. El repo completo pesa 1,8 GB porque incluye ambas variantes.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para ambas variantes. Para lotes grandes de chunks, se recomienda una RTX 4090, A100 o H100 para maximizar throughput.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060 en adelante) e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (versión probada `transformers==5.5.4`, `torch>=2.4`, `safetensors>=0.4.3`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, dado que no es un modelo generativo.
- Latencia y throughput: no disponibles. La model card advierte explícitamente que los tiempos de evaluación de la cabeza con características cacheadas no constituyen benchmarks de inferencia del encoder.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| Stackifiers Repo (small) | 140 M | 8.192 por chunk, agregación sin límite | Regresión de calidad de repositorio | MIT | Hugging Face |
| Stackifiers Repo (base) | 307 M | 8.192 por chunk, agregación sin límite | Regresión de calidad de repositorio | MIT | Hugging Face |
| jhu-clsp/mmBERT-small | no disponible | no disponible | Encoder multilingüe base | no disponible | Hugging Face |
| jhu-clsp/mmBERT-base | no disponible | no disponible | Encoder multilingüe base | no disponible | Hugging Face |

No se dispone de información sobre otros modelos de regresión de calidad de repositorio comparables en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo puntúa únicamente el contexto de código visible que recibe; no accede al repositorio ni evalúa ficheros no incluidos en la entrada.
- Las salidas son puntuaciones de regresión, no probabilidades de clase; no deben aplicarse sigmoid ni softmax adicionales sobre el resultado de `predict`.
- La evaluación se realizó contra anotaciones de un profesor LLM, no contra juicios humanos independientes, por lo que la concordancia con la percepción humana no está establecida.
- Una puntuación alta de `difficulty` indica material más difícil, no una recomendación de calidad.
- Riesgo de sesgo heredado del profesor LLM y del corpus de entrenamiento; no se documentan análisis de sesgo.
- No se detallan los idiomas soportados ni la composición del dataset de entrenamiento, lo que limita la evaluación de su comportamiento fuera de la distribución de código vista.
- La licencia MIT permite uso comercial, pero no se ofrecen garantías sobre el rendimiento en dominios distintos al de entrenamiento.
- Para despliegues reproducibles se recomienda fijar `revision` a un SHA de commit concreto en lugar de usar la rama.
- La dependencia de `trust_remote_code=True` implica ejecutar código del autor; conviene inspeccionar el wrapper antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Machacini/stackifiers-repo
- Modelo base mmBERT-small: https://huggingface.co/jhu-clsp/mmBERT-small
- Modelo base mmBERT-base: https://huggingface.co/jhu-clsp/mmBERT-base
