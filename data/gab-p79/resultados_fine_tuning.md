# Gab-P79/resultados_fine_tuning

## Resumen

`Gab-P79/resultados_fine_tuning` es un modelo de clasificación de texto obtenido por ajuste fino supervisado de `distilbert-base-uncased`, publicado en HuggingFace por el usuario Gab-P79. Se trata de un encoder transformer denso de 66.956.548 parámetros (67 M) con cabeza de clasificación, entrenado durante 2 épocas con AdamW y un learning rate de 2e-5, que alcanza una accuracy de 0,897 y una pérdida de validación de 0,3344 sobre un conjunto de evaluación no documentado. El repositorio ocupa 0,3 GB y se distribuye bajo licencia Apache 2.0.

Su relevancia es limitada y muy acotada: no es un modelo fundacional ni un LLM generativo, sino un artefacto de clasificación derivado de un trainer automático, con la model card generada por la plantilla de HuggingFace y sin descripción de la tarea, el dataset ni el mapeo de etiquetas. La arquitectura es la de DistilBERT (6 capas, 768 dimensiones ocultas, 12 cabezas de atención, ventana de 512 tokens), por lo que su coste computacional es mínimo y cabe en CPU.

El interés práctico, por tanto, no está en el modelo en sí, sino en el patrón: un fine-tune ligero de DistilBERT para clasificación con 67 M de parámetros es un punto de partida razonable para tareas de moderación, etiquetado o enrutamiento, siempre que se sustituya el dataset desconocido por uno propio y se documente el problema. Sin esa información, el modelo no es reutilizable de forma fiable fuera del contexto del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT-base): 6 capas, 768 dimensiones ocultas, 12 cabezas de atencion |
| Parametros totales | 66.956.548 (67 M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (limite de posiciones del modelo base) |
| Tipos de cuantizacion | no disponible (el autor no publica versiones cuantizadas; la conversion a INT8/ONNX es tecnicamente viable) |
| Idiomas soportados | no disponible (el tokenizador heredado de `distilbert-base-uncased` es en ingles sin distincion de mayusculas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 0,3 GB) |
| Tarea (pipeline) | text-classification |
| Modelo base | `distilbert/distilbert-base-uncased` |
| Version de transformers | 5.20.2 (PyTorch 2.11.0+cu130) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer de tipo DistilBERT, resultado de la destilación de BERT-base: 6 capas frente a las 12 del original, 768 dimensiones ocultas y 12 cabezas de atención, con un total de 66,9 M de parámetros. Sobre ese tronco se añade una cabeza de clasificación (pooler + capa lineal) ajustada en este repositorio. El tokenizador es WordPiece en minúsculas, con un vocabulario de aproximadamente 30.000 tokens, y la ventana máxima es de 512 posiciones; las secuencias más largas se truncan, no se segmentan automáticamente salvo que el pipeline lo configure.

El entrenamiento consistió en 2 épocas con `train_batch_size` de 16, `eval_batch_size` de 16, learning rate 2e-5, scheduler lineal, semilla 21407463 y el optimizador `ADAMW_TORCH_FUSED` con betas (0,9; 0,999) y epsilon 1e-08. El registro de pasos (313 y 626) sugiere un conjunto de entrenamiento de aproximadamente 5.000 ejemplos con batch efectivo de 16, aunque esta cifra es una inferencia aritmética y no un dato declarado por el autor. No se especifica la composición del dataset, el número de tokens procesados, el número de etiquetas ni si hubo etapas de RLHF o DPO; en un clasificador supervisado como este, esas técnicas no se aplican. Tampoco se documenta ninguna innovación técnica adicional (atención lineal, decodificación especulativa u otras), y la model card indica explícitamente "More information needed" en las secciones de descripción, usos previstos y datos de entrenamiento.

## Capacidades

- Clasificación de texto por secuencia: devuelve una distribución de probabilidad sobre el conjunto de etiquetas del ajuste fino mediante el pipeline `text-classification`.
- Etiquetado supervisado de fragmentos cortos (titulares, reseñas, mensajes, tickets), limitado a las clases aprendidas durante el entrenamiento.
- Extracción de representaciones contextuales del tronco DistilBERT, reutilizables como embedding de frases o como inicialización para otros fine-tunes.
- Inferencia en CPU con latencia baja, apta para procesamiento por lotes de alto volumen.
- No soporta generación de texto, razonamiento multi-paso, matemáticas, código ni visión.
- No soporta tool calling ni function calling: no es un modelo instruido ni conversacional.
- No dispone de modo "thinking", ni capacidades de audio o multimodalidad.
- Capacidades multilingües: no acreditadas; el modelo base está preentrenado principalmente en inglés y el ajuste fino no documenta idiomas.

## Casos de uso

- Moderación de contenido en foros o comentarios: usar el clasificador para etiquetar mensajes como aceptables o problemáticos, siempre que se reentrene con un dataset propio y un mapeo de etiquetas explícito; los 67 M de parámetros permiten filtrar millones de mensajes diarios en CPU.
- Enrutamiento de tickets de soporte: clasificar la consulta entrante en categorías (facturación, técnico, cuenta) para dirigirla al equipo adecuado, con la ventaja de un coste de inferencia muy inferior al de un LLM generativo.
- Clasificación de reseñas o encuestas: análisis de sentimiento o de temática sobre textos de hasta 512 tokens, integrable en un pipeline de `transformers` o en `text-embeddings-inference` (etiqueta presente en el repositorio).
- Detección de spam o duplicados: entrenamiento sobre un corpus propio de ejemplos etiquetados, aprovechando la velocidad de un encoder pequeño para el filtrado previo antes de modelos más caros.
- Etiquetado asistido para anotación humana: preanotar grandes volúmenes de texto y reservar la revisión manual para los casos de baja confianza, reduciendo el coste de construcción de datasets.
- Base para experimentación docente o ablaciones: al ser un fine-tune de 67 M con hiperparámetros documentados (lr 2e-5, 2 épocas, batch 16), sirve como referencia reproducible en cursos y pruebas de infraestructura de entrenamiento.
- Extracción de embeddings para búsqueda semántica o clustering: usar la salida del pooler como vector de 768 dimensiones y alimentar un índice vectorial, sin necesidad de GPU.

## Benchmarks y rendimiento

El `model-index` del repositorio está vacío: no se han declarado resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark estándar. Los únicos datos disponibles son las métricas del conjunto de evaluación interno, cuyo contenido no se describe.

| Metrica | Valor | Conjunto |
|---|---|---|
| Loss (validacion) | 0,3344 | Evaluacion del autor (no documentada) |
| Accuracy | 0,897 | Evaluacion del autor (no documentada) |
| Training loss (epoca 2) | 0,3666 | Entrenamiento |
| Loss / accuracy (epoca 1, paso 313) | 0,3318 / 0,896 | Validacion |
| Loss / accuracy (epoca 2, paso 626) | 0,3344 / 0,897 | Validacion |

No se han publicado resultados de benchmarks estandar en la informacion disponible, ni comparaciones con modelos similares sobre la misma tarea. Al desconocerse el dataset y el número de clases, la accuracy de 0,897 no es interpretable: con un problema binario desbalanceado o con pocas clases, esa cifra puede ser alcanzable por una línea base trivial.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en FP32 y 0,15 GB en FP16 para los pesos; con batch de 16 y secuencias de 512 tokens, el pico se mantiene por debajo de 1-2 GB.
- GPU recomendadas: innecesarias. Cualquier GPU con 4 GB o más (T4, RTX 3060, RTX 4090, A100, H100) ejecuta el modelo sobradamente; la GPU solo aporta ventaja en lotes muy grandes.
- Cabe en cualquier GPU de consumo e incluso en CPU: un solo núcleo moderno procesa secuencias cortas en el orden de milisegundos (estimación orientativa, no medida por el autor).
- Opciones de despliegue: pipeline de `transformers`, `text-embeddings-inference` (etiqueta `text-embeddings-inference` y `endpoints_compatible` en el repositorio), ONNX Runtime, TorchServe o FastAPI con `optimum`. El soporte en vLLM es limitado para modelos encoder de clasificación.
- Throughput y latencia: no disponibles; el autor no publica mediciones. Para dimensionar, un encoder de 67 M suele ser entre 5 y 10 veces más rápido que BERT-base en el mismo hardware, pero es una referencia genérica, no un dato de este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Gab-P79/resultados_fine_tuning` | 67 M | 512 | Clasificacion (etiquetas no documentadas) | Apache 2.0 | HuggingFace, 0 descargas |
| `distilbert-base-uncased` | 67 M | 512 | Modelo base, enmascarado + embeddings | Apache 2.0 | HuggingFace, ampliamente usado |
| `bert-base-uncased` | 110 M | 512 | Modelo base | Apache 2.0 | HuggingFace, ampliamente usado |
| `roberta-base` | 125 M | 512 | Modelo base | MIT | HuggingFace, ampliamente usado |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada, por lo que la comparación se limita a parámetros, contexto y licencia. Frente a `distilbert-base-uncased`, este modelo solo añade una cabeza de clasificación ajustada sobre un dataset desconocido; frente a BERT-base o RoBERTa-base, ofrece un 39 % y un 46 % menos de parámetros respectivamente, a costa de una capacidad de representación inferior.

## Limitaciones y advertencias

- Dataset de entrenamiento no documentado: la model card indica "unknown dataset" y "More information needed", lo que impide evaluar la validez, la representatividad y los sesgos del ajuste fino.
- Mapeo de etiquetas desconocido: sin la lista ordenada de clases (`id2label`), las predicciones no son interpretables; el autor no la publica en la información disponible.
- Métricas no verificables: la accuracy de 0,897 corresponde a un conjunto de evaluación no descrito, sin línea base ni matriz de confusión; no debe citarse como rendimiento real en producción.
- Sesgos: al derivar de `distilbert-base-uncased`, hereda los sesgos de género, raza y origen nacional presentes en los corpus web en inglés; el ajuste fino puede amplificarlos si el dataset es reducido o desequilibrado.
- Riesgo de alucinación: no aplica en sentido estricto porque el modelo no genera texto; el riesgo equivalente es la sobreconfianza en clasificaciones erróneas y la mala calibración de las probabilidades, que no se ha medido.
- Limitación de contexto: 512 tokens con truncado; textos más largos pierden información sin aviso, salvo que se implemente segmentación y agregación externas.
- Limitación de idioma: el tokenizador y el preentrenamiento son en inglés; el rendimiento en castellano no está acreditado y previsiblemente será inferior.
- Licencia: Apache 2.0 permite uso comercial y modificaciones, pero el autor no ofrece garantías ni soporte; conviene conservar el aviso de licencia y verificar la licencia del dataset original, que se desconoce.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, y la model card es la plantilla automática del `Trainer` sin revisar.
- Nombre genérico y metadatos pobres (`resultados_fine_tuning`), lo que dificulta la trazabilidad y la reutilización en un catálogo de modelos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Gab-P79/resultados_fine_tuning
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Documentación del pipeline de clasificación de texto: https://huggingface.co/docs/transformers/main/en/tasks/sequence_classification
- Documentación de DistilBERT: https://huggingface.co/docs/transformers/model_doc/distilbert
- Búsqueda web: no se ha encontrado ningún enlace relevante para este modelo. Los resultados devueltos corresponden a la red social Gab (https://gab.com/) y a guichetes automáticos bancarios (GAB), que no guardan relación con el repositorio, más allá de la coincidencia del nombre del autor.
