# kemalarif/berturk-offenseval-tr

## Resumen

BERTurk-offenseval-tr es un modelo de clasificación de texto en turco para la detección de lenguaje ofensivo, desarrollado por el usuario de Hugging Face kemalarif como parte de un trabajo académico (SWE015, caso de uso 4). Se trata de un ajuste fino de `dbmdz/bert-base-turkish-cased`, un BERT base entrenado específicamente en turco, sobre el corpus OffensEval-TR 2020, con una cabeza de clasificación binaria (NOT / OFF). El repositorio acompaña a una aplicación de moderación de chat publicada en GitHub, que descarga automáticamente los pesos desde este Hub.

El interés del modelo es doble: por un lado demuestra el ajuste fino de un encoder BERT en turco para una tarea de moderación de contenido; por otro, incluye un artefacto exportado a ONNX y cuantizado dinámicamente a INT8 con ONNX Runtime, además de una línea base clásica de tf-idf + regresión logística y dos alternativas neuronales basadas en word2vec propias. Esta combinación permite comparar enfoques de distinta complejidad sobre el mismo conjunto de datos.

El modelo es pequeño (BERT base, 110 millones de parámetros), con una ventana de contexto de 512 tokens propia de la arquitectura BERT, licencia MIT y un único idioma soportado (turco). No se han publicado métricas de benchmarks en la información disponible; el autor remite a la tabla de resultados de su repositorio de GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base, `dbmdz/bert-base-turkish-cased`) con cabeza de clasificación binaria |
| Parametros totales | 110 millones (BERT base; no confirmado explícitamente en la información disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (límite estándar de BERT; no confirmado explícitamente en la información disponible) |
| Tipos de cuantizacion | FP32 (modelo original) e INT8 dinámica vía ONNX Runtime |
| Idiomas soportados | Turco (tr) |
| Licencia | MIT |
| Formato de pesos | safetensors (modelo BERTurk fine-tuned), ONNX (`onnx/berturk_int8.onnx`), pickle (`.pkl`) y PyTorch (`.pt`) para los modelos auxiliares |
| Tarea | Clasificación de texto binaria: NOT / OFF (lenguaje ofensivo) |
| Dataset de entrenamiento | `coltekin/offenseval2020_tr` (OffensEval-TR 2020, Çöltekin, LREC 2020, CC-BY) |
| Tamaño del repositorio | 0,6 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo principal es un ajuste fino de BERTurk (`dbmdz/bert-base-turkish-cased`), un encoder transformer de tipo BERT base entrenado en turco. Sobre la representación del token `[CLS]` se añade una cabeza de clasificación lineal que produce dos logits (NOT y OFF). El ajuste se realiza sobre el corpus OffensEval-TR 2020, un conjunto de tuits en turco anotados para la tarea de identificación de lenguaje ofensivo. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de aumento de datos o regularización específicas.

El repositorio incluye además tres artefactos auxiliares con fines comparativos: una línea base clásica de tf-idf + regresión logística implementada con scikit-learn, y dos redes neuronales (un feed-forward y una CNN 1D) entrenadas sobre embeddings word2vec propios del autor. También se incluye un fichero `thresholds.json` con umbrales de decisión sobre P(offensive) ajustados en el split de validación, lo que indica que la decisión final no se toma con un umbral fijo de 0,5 sino con umbrales calibrados. El modelo se exporta a ONNX y se cuantiza dinámicamente a INT8 con ONNX Runtime para su uso en la aplicación de moderación.

## Capacidades

- Clasificación binaria de texto en turco: detecta si un mensaje contiene lenguaje ofensivo (OFF) o no (NOT).
- Salida de probabilidad calibrada mediante umbrales ajustados en validación (`thresholds.json`).
- Inferencia optimizada mediante el artefacto ONNX INT8, pensado para despliegue ligero.
- Procesamiento de mensajes individuales de chat (clasificación por turno, no generativa).
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo discriminativo, no generativo.
- No soporta visión, audio ni modo thinking.
- Capacidad multilingüe limitada al turco; no se ha entrenado ni evaluado en otros idiomas.

## Casos de uso

- Moderación de chats en turco: el modelo clasifica cada mensaje entrante como ofensivo o no ofensivo y permite filtrar o marcar contenido antes de que llegue a otros usuarios; su tamaño reducido y la versión ONNX INT8 lo hacen adecuado para inferencia en tiempo real.
- Moderación de comentarios en foros y redes sociales: integrado como servicio de clasificación por lotes, permite priorizar la revisión humana de los mensajes con mayor probabilidad de ser ofensivos gracias a los umbrales calibrados.
- Filtrado previo en pipelines de contenido generado por usuarios: se puede colocar como primera capa de un sistema de moderación más amplio, derivando solo los casos dudosos a revisión manual o a modelos más costosos.
- Investigación en procesamiento de lenguaje turco: sirve como punto de partida reproducible para experimentos de detección de toxicidad, con línea base clásica y alternativas neuronales incluidas en el mismo repositorio para comparar.
- Despliegue en entornos con recursos limitados: la versión ONNX INT8 permite ejecutar la clasificación en CPU sin GPU, lo que facilita su uso en servicios pequeños o en el borde.
- Evaluación comparativa de enfoques de clasificación: el repositorio permite contrastar BERTurk fine-tuned, tf-idf + regresión logística y redes sobre word2vec en la misma tarea, útil para docencia o para justificar decisiones de arquitectura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que los resultados sobre el conjunto de test oficial de OffensEval-TR 2020 se encuentran en el fichero `results/results.md` del repositorio de GitHub, pero no se han incluido en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en FP32 para el modelo BERT base (110 M de parámetros), y alrededor de 0,15-0,3 GB en la versión ONNX INT8.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 3060, RTX 4090, A100 o H100 son más que suficientes y el modelo no las aprovechará a plena capacidad.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650, RTX 3050, RTX 4060, etc.), e incluso en CPU para la versión ONNX INT8.
- Opciones de despliegue: ONNX Runtime (recomendado por el autor para la versión INT8), Transformers con PyTorch para el modelo safetensors, y servidores de inferencia compatibles con ONNX. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un encoder de clasificación.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kemalarif/berturk-offenseval-tr | 110 M (BERT base) | 512 tokens | Clasificación binaria de lenguaje ofensivo en turco | MIT | Hugging Face (0 descargas) |
| tf-idf + regresión logística (incluido en el repo) | no aplica (modelo lineal) | no aplica | Misma tarea | MIT | Incluido en el repositorio |
| w2v_ffn / w2v_cnn (incluidos en el repo) | no disponible | no disponible | Misma tarea | MIT | Incluido en el repositorio |
| dbmdz/bert-base-turkish-cased (modelo base) | 110 M | 512 tokens | Modelo de lenguaje enmascarado en turco | no disponible en la información | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; el autor remite a su repositorio para la tabla de resultados.

## Limitaciones y advertencias

- Es un modelo discriminativo de clasificación binaria; no genera texto ni mantiene conversaciones.
- Entrenado exclusivamente en turco y sobre un corpus de tuits de 2020; puede no generalizar a otros registros, dominios o variedades del turco.
- Riesgo de sesgo derivado del corpus de anotación: las etiquetas de OffensEval-TR reflejan los criterios de anotación de sus autores y pueden no coincidir con los de un despliegue concreto.
- Riesgo de falsos positivos y falsos negativos; el autor proporciona umbrales calibrados en validación, pero no se han publicado métricas de test en la información disponible.
- El repositorio incluye ficheros `.pkl` y `.pt` que la aplicación carga con `pickle` y `torch.load(weights_only=False)`; el propio autor advierte de cargarlos únicamente desde este repositorio por riesgo de ejecución de código arbitrario.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del corpus de entrenamiento (CC-BY) y citar adecuadamente el trabajo de Çöltekin (LREC 2020).
- Modelo con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación externa.
- No se han publicado datos de latencia, throughput ni comportamiento en dominios distintos del corpus de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kemalarif/berturk-offenseval-tr
- Repositorio de código de la aplicación: https://github.com/kemalarif/swe015-chat-moderation
- Resultados de evaluación (referenciados por el autor): https://github.com/kemalarif/swe015-chat-moderation/blob/main/results/results.md
- Dataset OffensEval-TR 2020: https://huggingface.co/datasets/coltekin/offenseval2020_tr
- Modelo base BERTurk: https://huggingface.co/dbmdz/bert-base-turkish-cased
- Paper del corpus (Çöltekin, LREC 2020): no disponible en la información proporcionada
