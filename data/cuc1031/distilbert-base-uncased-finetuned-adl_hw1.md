# cuc1031/distilbert-base-uncased-finetuned-adl_hw1

## Resumen

`cuc1031/distilbert-base-uncased-finetuned-adl_hw1` es un ajuste fino de `distilbert-base-uncased` publicado por el usuario cuc1031 en HuggingFace. Se trata de un modelo encoder-only de 66.961.162 parámetros orientado a clasificación de texto (`text-classification`), con licencia Apache 2.0 y pesos en formato safetensors. El repositorio ocupa 0,3 GB y acumula 0 descargas y 0 "me gusta" en el momento de la consulta, lo que junto al sufijo `adl_hw1` apunta a un artefacto de una práctica académica más que a un modelo destinado a uso productivo.

El problema que resuelve, en teoría, es la clasificación de secuencias cortas en inglés: el modelo añade una cabeza de clasificación sobre el encoder destilado de BERT. Sin embargo, la propia model card declara unas métricas de evaluación muy bajas (Macro F1 = 0,1409; Micro F1 = 0,1831; pérdida de validación = 0,3991) y no identifica el conjunto de datos de entrenamiento (aparece como "None"). El array `results` del `model-index` está vacío, por lo que no existe ningún benchmark publicado asociado al modelo.

Su relevancia es, por tanto, limitada y de naturaleza didáctica: sirve como ejemplo de pipeline de ajuste fino con la librería Transformers (versión 5.16.1, PyTorch 2.11.0+cu128) y como caso de estudio de un ajuste que no converge a un rendimiento útil. No se recomienda su uso en producción ni como base para tareas reales de clasificación sin un reentrenamiento completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (DistilBERT), 6 capas, 12 cabezas de atención, dimensión oculta 768, FFN de 3072, vocabulario WordPiece de 30.522 tokens (heredada de `distilbert-base-uncased`) |
| Parametros totales | 66.961.162 (dato real de safetensors) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 512 tokens (límite de posición de `distilbert-base-uncased`; la ficha no declara longitud de contexto) |
| Tipos de cuantizacion | No disponible en el repositorio (sin GGUF, GPTQ ni AWQ). Admite cuantización dinámica int8 de PyTorch y exportación a ONNX cuantizado |
| Idiomas soportados | No disponible. El checkpoint base es un modelo en inglés con tokenizador `uncased`; no se declara soporte multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (etiqueta `safetensors` del repositorio) |
| Libreria | Transformers |
| Pipeline | Text-classification |
| Modelo base | `distilbert-base-uncased` |
| Tamano del repositorio | 0,3 GB |
| Autor | cuc1031 |
| Fecha de creacion / actualizacion | 2026-09-16 / 2026-09-16 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de DistilBERT: un encoder transformer de 6 capas obtenido mediante destilación del conocimiento de `bert-base-uncased` (12 capas), según la formulación original de Sanh et al. (2019). Conserva el mecanismo de autoatención multi-cabeza y la normalización por capas de BERT, pero reduce la profundidad a la mitad, lo que se traduce en aproximadamente un 40 % menos de parámetros y una inferencia notablemente más rápida que `bert-base-uncased`, con una pérdida pequeña de rendimiento en las tareas GLUE del modelo base. Sobre ese encoder, este ajuste añade una cabeza de clasificación de secuencias.

El ajuste se realizó con el `Trainer` de Transformers usando 5 épocas, tasa de aprendizaje 2e-05, tamaño de lote de 16 (entrenamiento y evaluación), semilla 42, optimizador `ADAMW_TORCH_FUSED` con betas (0,9; 0,999) y epsilon 1e-08, y planificador lineal. La tabla de resultados registra 845 pasos totales con 169 pasos por época, lo que implica un conjunto de entrenamiento de aproximadamente 2.704 ejemplos (169 × 16) por época, es decir, del orden de 13.500 ejemplos vistos en total. No se especifica composición del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento (no aplica habitualmente en un clasificador).

Un detalle derivable de los pesos: el checkpoint tiene 598.282 parámetros más que `distilbert-base-uncased` (66.362.880). Esa diferencia es exactamente la que produce una cabeza `DistilBertForSequenceClassification` con `pre_classifier` de 768×768 y un clasificador lineal de 768×N, lo que sitúa N en 10 etiquetas. Se trata de una deducción aritmética a partir del número de parámetros, no de un dato declarado en la ficha, que no menciona el número de clases.

## Capacidades

- Clasificación de texto de secuencia completa (una etiqueta por secuencia) sobre textos de hasta 512 tokens.
- Número de clases: 10 etiquetas (deducido del recuento de parámetros; no declarado en la ficha).
- Modelo exclusivamente encoder: no genera texto libre, no mantiene conversaciones y no produce respuestas de formato abierto.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente, razonamiento multi-paso, ni modo "thinking".
- No tiene capacidades de visión, audio ni multimodalidad.
- Capacidad multilingüe: no declarada; el tokenizador `uncased` y el checkpoint base están orientados a inglés.
- Capacidad de inferencia en CPU con huella de memoria inferior a 300 MB, lo que permite ejecución en entornos sin GPU.

## Casos de uso

Advertencia previa: con Macro F1 = 0,1409 sobre 10 clases (un clasificador aleatorio obtendría aproximadamente 0,10), este checkpoint no es apto para ninguna tarea productiva sin reentrenamiento. Los casos siguientes describen usos planteados o usos posibles del pipeline, indicando en cada uno la limitación real.

- Prototipado académico de pipelines de clasificación: sirve como plantilla reproducible de un flujo `Trainer` con Transformers, útil en un curso para comparar hiperparámetros (learning rate, épocas, batch) y observar curvas de convergencia.
- Prueba de extremo a extremo de una API de clasificación: el modelo se puede levantar con `pipeline("text-classification")` y servir con FastAPI para validar el contrato de entrada/salida de un microservicio antes de sustituir el modelo por uno bien entrenado.
- Referencia de línea base (baseline) en experimentos: al ser un ajuste sobre DistilBERT con métricas conocidas y mediocres, resulta útil como suelo contra el que medir mejoras de un clasificador propio.
- Clasificación de tickets de soporte en inglés: si se reentrenara con datos etiquetados propios, la arquitectura permitiría etiquetar tickets cortos y enrutarlos a 10 colas; con los pesos actuales el enrutamiento sería prácticamente aleatorio.
- Pre-anotación para revisión humana: el modelo podría insertarse en un bucle de etiquetado asistido, dejando que un humano corrija la predicción; dado el bajo F1, el ahorro de tiempo sería marginal.
- Clasificación de comentarios o encuestas de texto breve: técnicamente viable en CPU por coste casi nulo, pero los falsos positivos y falsos negativos a nivel de clase serían muy numerosos.
- Despliegue en entornos con recursos mínimos: al ocupar menos de 300 MB en fp32, puede ejecutarse en máquinas sin GPU, contenedores pequeños o dispositivos de borde para tareas de filtrado grueso, siempre con validación humana posterior.

## Benchmarks y rendimiento

La búsqueda no ha devuelto resultados de benchmarks de terceros y el array `results` del `model-index` está vacío. Los únicos datos disponibles son los declarados por el autor en la model card.

| Metrica (conjunto de evaluacion) | Valor |
|---|---|
| Loss | 0,3991 |
| Macro F1 | 0,1409 |
| Micro F1 | 0,1831 |

Evolucion por epoca:

| Training loss | Epoca | Step | Validation loss | Macro F1 | Micro F1 |
|---|---|---|---|---|---|
| No log | 1,0 | 169 | 0,4268 | 0,0936 | 0,0902 |
| No log | 2,0 | 338 | 0,4210 | 0,1122 | 0,1199 |
| 0,4132 | 3,0 | 507 | 0,4184 | 0,1045 | 0,1108 |
| 0,4132 | 4,0 | 676 | 0,4082 | 0,1343 | 0,1649 |
| 0,4132 | 5,0 | 845 | 0,3991 | 0,1409 | 0,1831 |

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, GLUE, HumanEval o GSM8K no aplican ni están reportados para este checkpoint). La mejora entre la época 1 y la 5 es de apenas 0,047 puntos de Macro F1, lo que indica un ajuste prácticamente nulo sobre la tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 268 MB de pesos más activaciones; en fp16/bf16, unos 134 MB; en int8 dinámico, unos 67 MB. Con batch pequeño, el consumo total se mantiene por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con más de 1 GB de memoria es suficiente. Tarjetas tipo NVIDIA T4, GTX 1650, RTX 3060, RTX 4090 o A100 están sobredimensionadas para este modelo; también funciona en GPU integradas y en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo de la última década, e incluso en CPU de un solo socket sin penalización relevante.
- Opciones de despliegue: `pipeline` de Transformers, exportación a ONNX Runtime, TorchScript, o un servicio propio con FastAPI. La compatibilidad con vLLM o Text Embeddings Inference para clasificación de secuencias no está verificada en la información disponible.
- Latencia y throughput: no disponible. No se han publicado mediciones para este checkpoint. Como referencia de la arquitectura base, DistilBERT está documentado como aproximadamente un 60 % más rápido que `bert-base-uncased` en inferencia, pero esa cifra corresponde al modelo base y no a este ajuste.

## Comparativa con modelos similares

La comparación de rendimiento no es posible porque este checkpoint no publica benchmarks utilizables. La tabla compara únicamente características estructurales y de licencia.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `cuc1031/distilbert-base-uncased-finetuned-adl_hw1` | 66,96 M | 512 tokens | Clasificación (10 clases) | Apache 2.0 | HuggingFace, 0 descargas |
| `distilbert-base-uncased` | 66,36 M | 512 tokens | Modelo base (encoder preentrenado) | Apache 2.0 | HuggingFace, ampliamente utilizado |
| `distilbert-base-uncased-finetuned-sst-2-english` | aprox. 67 M | 512 tokens | Clasificación binaria de sentimiento | Apache 2.0 | HuggingFace, muy descargado |
| `bert-base-uncased` | 110 M | 512 tokens | Modelo base (encoder preentrenado) | Apache 2.0 | HuggingFace, ampliamente utilizado |

Frente a un DistilBERT ajustado en una tarea con datos etiquetados y bien definidos (por ejemplo, el ajuste para SST-2), este checkpoint parte con una desventaja objetiva: no declara el dataset, no declara las etiquetas y sus métricas declaradas son cercanas al azar. No se dispone de datos para comparar frente a alternativas como RoBERTa-base o DeBERTa-v3-base, que no aparecen en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento cercano al azar: Macro F1 de 0,1409 y Micro F1 de 0,1831 con 10 clases implican un comportamiento muy próximo a la clasificación aleatoria (aproximadamente 0,10 de Macro F1 esperado). No debe usarse en producción.
- Dataset de entrenamiento no declarado: la model card indica "None dataset". No es posible auditar la composición, el equilibrio de clases, el idioma real de los datos ni el origen de las etiquetas.
- Riesgo de sesgos: al desconocerse los datos de entrenamiento y heredar el preentrenamiento de `distilbert-base-uncased`, el modelo puede reproducir sesgos de género, raza o nacionalidad presentes en el corpus original de BERT, sin que exista documentación al respecto.
- Alucinación: al ser un modelo discriminativo no genera texto, por lo que el riesgo de alucinación en sentido estricto no aplica; sí existe un riesgo muy alto de predicciones incorrectas (falsos positivos y falsos negativos) dada la baja F1.
- Limitación de idioma: el tokenizador es `uncased` y el modelo base es de dominio inglés; el comportamiento en castellano no está documentado ni validado.
- Límite de contexto: 512 tokens. Textos más largos requieren truncamiento o segmentación, con la consiguiente pérdida de información.
- Reproducibilidad: la ficha indica versiones concretas (Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5, Tokenizers 0.23.1); no se incluyen semillas completas de inicialización ni el estado del optimizador, solo `seed: 42`.
- Licencia: Apache 2.0 permite uso comercial y modificación, siempre que se conserve el aviso de licencia. La licencia no es la barrera; la calidad del modelo sí lo es.
- Ausencia de benchmarks: el `model-index` no contiene resultados y no hay evaluaciones independientes publicadas.
- Trazabilidad: no se documentan intención de uso, limitaciones ni procedencia del artefacto más allá del identificador `adl_hw1`, compatible con una entrega de práctica académica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cuc1031/distilbert-base-uncased-finetuned-adl_hw1
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Referencia de la arquitectura base (Sanh et al., 2019, DistilBERT): https://arxiv.org/abs/1910.01108
- Documentación de la librería Transformers: https://huggingface.co/docs/transformers/index
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo. Las únicas entradas devueltas fueron páginas generales de Wikipedia (es.wikipedia.org, en.wikipedia.org, cs.wikipedia.org, de.wikipedia.org), sin relación con este checkpoint.
