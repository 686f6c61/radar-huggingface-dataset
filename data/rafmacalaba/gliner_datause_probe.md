# rafmacalaba/gliner_datause_probe

## Resumen

`rafmacalaba/gliner_datause_probe` es un modelo de clasificación de tokens (token classification) desarrollado por rafacalaba como sonda de activaciones sobre el modelo base `rafmacalaba/gliner_datause`. Está construido sobre un codificador GLiNER congelado y un clasificador MLP ligero que actúa sobre características de span (`[start; end; mean; ±64-token window]`). El objetivo es predecir si una propuesta de span generada por el extractor corresponde a datos nombrados (`NAMED_DATA`), datos descriptivos (`DESCRIPTIVE_DATA`) o datos vagos (`VAGUE_DATA`). La lógica del sistema se describe en la model card como «extractor propone, cabeza desecha»: el modelo GLiNER original genera candidatos y el head de la sonda los filtra.

Se trata de un artefacto de investigación centrado en el análisis de uso de datos en textos, no de un modelo generativo. El repositorio en Hugging Face tiene un tamaño de 0.0 GB, lo que sugiere un capo ligero centrado en el head y sus predicciones. Su relevancia es metodológica: permite explorar si un representación congelada de un modelo NER puede discriminar categorías de uso de datos mediante un clasificador simple, con una validación en conjuntos de prueba que muestran resultados dispares según el subconjunto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador GLiNER congelado + MLP head sobre características de span |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del codificador base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (head.pt) |

## Arquitectura y entrenamiento

El modelo no es un modelo autónomo: se describe como una sonda sobre el modelo `rafmacalaba/gliner_datause`. El codificador (encoder) permanece congelado y se utilizan características de los spans propuestos por el extractor GLiNER original, incluyendo las posiciones de inicio y fin, la media de las representaciones y una ventana de ±64 tokens alrededor del span. Estas características alimentan una pequeña capa MLP que produce la puntuación de cada propuesta. El entrenamiento se orienta a la clasificación binaria de uso de datos, con etiquetas derivadas de una revisión del modelo Luna v2.4 (`prompt v2.4-patched-2026-09-05`). No se dispone de información sobre el tamaño del conjunto de entrenamiento, el número de tokens ni si se aplicaron técnicas adicionales como RLHF o DPO. El enfoque técnico destaca por usar el propio extractor como generador de candidatos y un modelo discriminador liviano para filtrarlos, lo que permite examinar la separabilidad de las representaciones congeladas sin reentrenar el codificador.

## Capacidades

- Clasificación de spans de texto en tres categorías de uso de datos: `NAMED_DATA`, `DESCRIPTIVE_DATA` y `VAGUE_DATA`.
- Integración con el pipeline de token classification de GLiNER, aprovechando las propuestas del extractor base.
- Evaluación de propuestas mediante una puntuación del head y una puntuación cruda (`raw_score`) que puede usarse para comparar el rendimiento del modelo y del codificador original.
- Generación de predicciones por span en formato JSONL (`holdout_predictions.jsonl`), lo que facilita el análisis posterior y la depuración.
- No soporta generación de texto, tool calling, razonamiento multi-paso ni capacidades multimodales.

## Casos de uso

- Auditoría de políticas de privacidad: el modelo puede identificar fragmentos de texto que mencionan datos con nombre, datos descriptivos o datos vagos, permitiendo revisar manualmente las cláusulas donde se describe el tratamiento de información personal.
- Análisis de contratos de tratamiento de datos: permite detectar rápidamente qué categorías de datos se mencionan en un documento, ayudando a los equipos legales a localizar referencias a datos nominativos o descriptivos.
- Evaluación de la calidad de un sistema de clasificación de uso de datos: al proporcionar puntuaciones por span y comparar con la puntuación cruda del extractor, permite medir cuánto mejora un head discriminador sobre el modelo base en un corpus determinado.
- Investigación en interpretabilidad de modelos NER: el modelo sirve como sonda para analizar si las representaciones congeladas de GLiNER contienen información suficiente para separar categorías semánticas finas relacionadas con el uso de datos.
- Depuración de pipelines de extracción de información: ante falsos positivos de alta confianza en un extractor base, el head puede emplearse como filtro posterior, expulsando ruido y reduciendo el número de errores en la fase de revisión.
- Experimentación en entornos de investigación con conjuntos etiquetados por humanos: los resultados reportados incluyen subconjuntos de validación con rendimiento variable, lo que lo hace útil para estudiar la transferibilidad y la robustez de un clasificador de este tipo.

## Benchmarks y rendimiento

Los resultados de evaluacion presentados en la model card se refieren a conjuntos de validacion (holdout) y al rendimiento de la puntuacion cruda del extractor GLiNER original.

| Metrica | Valor |
|---|---|
| Head AUROC (global holdout) | 0.8169 |
| Head AUROC (holdout-190, anotador) | 0.8889 |
| Best-F1 thr 0.4 (holdout-190): precision | 0.8099 |
| Best-F1 thr 0.4 (holdout-190): recall | 0.8909 |
| Best-F1 thr 0.4 (holdout-190): F1 | 0.8485 |
| Head AUROC (holdout-jdc283) | 0.5943 |
| Best-F1 thr 0.3 (holdout-jdc283): precision | 0.8514 |
| Best-F1 thr 0.3 (holdout-jdc283): recall | 0.3073 |
| Best-F1 thr 0.3 (holdout-jdc283): F1 | 0.4516 |
| Head AUROC (holdout-human473, 190+283 combinados) | 0.6254 |
| Best-F1 thr 0.4 (holdout-human473): precision | 0.8290 |
| Best-F1 thr 0.4 (holdout-human473): recall | 0.5079 |
| Best-F1 thr 0.4 (holdout-human473): F1 | 0.6299 |
| Raw GLiNER score AUROC | 0.5716 |
| Best-F1 thr 0.4: precision | 0.8143 |
| Best-F1 thr 0.4: recall | 0.7674 |
| Best-F1 thr 0.4: F1 | 0.7901 |
| Residual-leak diagnostic (50 falsos positivos de alta confianza, expulsados por el head) | 80.0% |

No se han publicado resultados comparativos con modelos similares en los datos disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, depende en gran medida del codificador GLiNER base.
- GPU recomendadas: no disponible; al tratarse de un head simple, el requisito principal proviene del encoder congelado.
- Posibilidad de ejecucion en consumer GPUs: no disponible (no se indican requisitos concretos en la informacion proporcionada).
- Opciones de despliegue: compatible con la libreria GLiNER y con pipelines de token classification en PyTorch; no se mencionan integraciones con vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. La unica comparacion implicita es entre el head de la sonda y la puntuacion cruda del extractor GLiNER base, reflejada en la diferencia de AUROC (0.8169 frente a 0.5716). No obstante, no existen datos sobre otros modelos de la misma categoria en esta informacion.

## Limitaciones y advertencias

- El rendimiento es muy dependiente del subconjunto de validacion: mientras que en holdout-190 el AUROC alcanza 0.8889, en holdout-jdc283 baja a 0.5943, lo que indica una generalizacion limitada entre conjuntos de anotacion.
- La tasa de recall en el subconjunto jdc283 es baja (0.3073) con F1 de 0.4516, lo que sugiere que el modelo pierde una parte importante de los spans relevantes en ese escenario.
- No es un modelo generativo y no puede completar texto, responder preguntas ni ejecutar funciones.
- Las categorias se limitan a uso de datos (`NAMED_DATA`, `DESCRIPTIVE_DATA`, `VAGUE_DATA`); no cubre otros tipos de entidades ni tareas de NER generalistas.
- La licencia Apache 2.0 permite uso comercial, pero la utilidad practica del modelo depende del codificador base `rafmacalaba/gliner_datause`, del que no se proporciona informacion completa de entrenamiento, datos ni sesgos.
- Los resultados reportados provienen de la model card del autor y no se han reproducido de forma independiente; se recomienda validar el rendimiento en el corpus propio antes de usarlo en produccion.

## Enlaces

- Hugging Face (guion): https://huggingface.co/rafmacalaba/gliner-datause-probe
- Hugging Face (original): https://huggingface.co/rafmacalaba/gliner_datause_probe
- Modelo relacionado (sonda de desplazamiento): https://huggingface.co/rafmacalaba/gliner-datause-displacement-probe
