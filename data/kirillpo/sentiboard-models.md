# KirillPo/sentiboard-models

## Resumen

SentiBoard es un conjunto de dos modelos de clasificación de sentimiento en tres clases (negativo, neutro, positivo) para texto en inglés procedente de redes sociales, publicado por el usuario KirillPo como proyecto de asignatura universitaria. El repositorio incluye una línea base clásica (TF-IDF con regresión logística sobre scikit-learn) y un modelo neuronal: `distilbert-base-uncased` afinado sobre GoEmotions y exportado a ONNX con cuantización int8. Ambos se sirven a través de una aplicación web que analiza textos individuales, cargas de CSV y búsquedas por palabra clave en Reddit.

El modelo principal se apoya en DistilBERT, un transformer encoder de 6 capas y 66 millones de parámetros derivado por destilación de BERT-base, con una longitud de contexto de 512 tokens. El ajuste fino se realizó sobre la versión simplificada de GoEmotions, donde las 27 emociones originales se colapsan en tres clases de sentimiento mediante el mapeo de Google, descartando comentarios ambiguos o de grupo mixto hasta unos 35.900 ejemplos de entrenamiento.

Su relevancia práctica es acotada pero clara: ofrece un clasificador de sentimiento ligero (64 MB en int8) que se ejecuta únicamente con `onnxruntime` y `tokenizers`, sin dependencia de PyTorch, lo que facilita su despliegue en entornos con recursos limitados. La evaluación incluye tanto el test de GoEmotions (4.500 comentarios de Reddit) como un control fuera de dominio sobre TweetEval (12.300 tuits).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas), exportado a ONNX; línea base TF-IDF + regresión logística |
| Parametros totales | 66 millones (DistilBERT-base); no disponible para el modelo TF-IDF |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (heredada de distilbert-base-uncased) |
| Tipos de cuantizacion | int8 (ONNX quantized); el modelo original es fp32 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (modelo neuronal); joblib (modelo TF-IDF) |

## Arquitectura y entrenamiento

El modelo neuronal parte de `distilbert-base-uncased`, un transformer encoder de 6 capas y 66 millones de parámetros obtenido por destilación de BERT-base, y se afina como clasificador de secuencias con tres etiquetas de salida. Posteriormente se exporta a ONNX y se cuantiza a int8, reduciendo el artefacto a 64 MB y permitiendo inferencia solo con `onnxruntime` y `tokenizers`, sin necesidad de PyTorch. La pérdida de calidad de la cuantización es mínima: 0,003 de macro F1 frente al modelo fp32 en PyTorch (0,767).

Los datos de entrenamiento proceden de GoEmotions en su variante `simplified`, donde las 27 emociones anotadas se agrupan en tres clases de sentimiento siguiendo el mapeo de Google. Se descartaron los comentarios ambiguos y los pertenecientes a grupos mixtos, quedando aproximadamente 35.900 ejemplos de entrenamiento. La evaluación se realizó sobre el split de test de GoEmotions (4.500 comentarios de Reddit) y, como comprobación fuera de dominio, sobre el test de sentimiento de TweetEval (12.300 tuits). No se documenta en la información disponible el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Clasificación de sentimiento en tres clases (negativo, neutro, positivo) para texto corto en inglés.
- Análisis de textos individuales, procesamiento por lotes de archivos CSV y análisis de resultados de búsquedas por palabra clave en Reddit, según la descripción de la aplicación SentiBoard.
- Inferencia ligera mediante ONNX Runtime con pesos int8, sin dependencia de frameworks de deep learning pesados.
- Ejecución alternativa mediante el modelo de línea base TF-IDF + regresión logística para escenarios de muy bajos requisitos.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de razonamiento extendido.
- Capacidad multilingüe limitada al inglés; no se declaran otros idiomas.

## Casos de uso

- Moderación de comunidades en Reddit: el modelo clasifica comentarios en negativo, neutro o positivo, lo que permite priorizar la revisión humana de hilos con alta densidad de sentimiento negativo. Su entrenamiento sobre GoEmotions (comentarios reales de Reddit) lo hace adecuado para este dominio concreto.
- Análisis de opinión en cargas CSV: la aplicación permite subir ficheros CSV y clasificar cada fila, útil para procesar exportaciones de encuestas, reseñas o tickets de soporte de forma por lotes.
- Monitorización de reputación en redes sociales: con 512 tokens de contexto y un artefacto de 64 MB, puede desplegarse en servicios modestos para etiquetar menciones o tuits en tiempo casi real, aceptando la merma de precisión fuera de dominio (macro F1 de 0,556 en TweetEval).
- Enriquecimiento de pipelines de datos: al ejecutarse solo con `onnxruntime` y `tokenizers`, se integra en entornos Python sin PyTorch, por ejemplo en funciones serverless o contenedores pequeños que etiquetan texto antes de almacenarlo en un almacén analítico.
- Investigación académica y docencia: el repositorio incluye `meta.json` con parámetros de entrenamiento y `metrics.json` con métricas completas y matrices de confusión, lo que facilita la reproducibilidad y la comparación entre la línea base clásica y el modelo neuronal.
- Prototipado rápido de clasificadores de sentimiento: la línea base TF-IDF con regresión logística (macro F1 de 0,709 en GoEmotions) sirve como referencia barata y entrenable en segundos para comparar contra aproximaciones neuronales antes de invertir en infraestructura.
- Filtrado previo en sistemas de atención al cliente: clasificar el tono de los mensajes entrantes para enrutar los negativos a agentes humanos, aceptando las limitaciones documentadas con sarcasmo y jerga.

## Benchmarks y rendimiento

| Modelo | GoEmotions macro F1 | GoEmotions accuracy | TweetEval macro F1 |
|---|---|---|---|
| `baseline-1.0` (TF-IDF 1-2 grams + regresión logística) | 0,709 | 0,719 | 0,484 |
| `distilbert-1.0-onnx-int8` (DistilBERT afinado, ONNX int8) | 0,764 | 0,773 | 0,556 |
| DistilBERT fp32 en PyTorch (referencia del autor) | 0,767 | no disponible | no disponible |

No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, que además no aplican a un clasificador de sentimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para el modelo ONNX int8 de 64 MB, incluyendo buffers de activaciones y tokenizador; el modelo fp32 en PyTorch requiere aproximadamente 250-300 MB.
- GPU recomendadas: no es necesario GPU; cualquier GPU consumer (por ejemplo, RTX 3060, RTX 4090) acelera la inferencia, pero el modelo está pensado para ejecutarse en CPU.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU, dado su tamaño reducido.
- Opciones de despliegue: ONNX Runtime (vía `sentiboard_ml.load_predictor(name, path)`), y para la línea base scikit-learn con joblib. No se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GoEmotions macro F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SentiBoard `distilbert-1.0-onnx-int8` | 66 M | 512 tokens | 0,764 | Apache 2.0 | Hugging Face (KirillPo/sentiboard-models) |
| SentiBoard `baseline-1.0` (TF-IDF + LR) | no disponible | no aplica | 0,709 | Apache 2.0 | Hugging Face (KirillPo/sentiboard-models) |
| DistilBERT-base-uncased sin afinar | 66 M | 512 tokens | no disponible | Apache 2.0 | Hugging Face (distilbert/distilbert-base-uncased) |
| Modelos de sentimiento de referencia en GoEmotions (por ejemplo, roBERTa-base afinado) | no disponible | no disponible | no disponible | no disponible | no disponible |

La información disponible no incluye resultados comparativos con otros clasificadores de sentimiento publicados sobre GoEmotions o TweetEval, por lo que la comparativa se limita a los dos modelos del propio repositorio y al modelo base.

## Limitaciones y advertencias

- El sarcasmo se clasifica erróneamente como positivo; el autor cita el ejemplo "Great, another delay". La jerga y el argot a menudo no se detectan.
- El modelo solo soporta inglés; el rendimiento en otros idiomas no está evaluado y probablemente sea deficiente.
- La caída de rendimiento fuera de dominio es notable: el macro F1 baja de 0,764 en GoEmotions a 0,556 en TweetEval, lo que indica una generalización limitada a otros registros y plataformas.
- El entrenamiento descarta comentarios ambiguos y de grupo mixto, lo que puede introducir sesgos hacia textos con sentimiento claro y penalizar expresiones matizadas.
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador, no un generador), pero sí de clasificaciones erróneas confiadas en textos irónicos o de dominio distinto.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye como proyecto académico sin garantías de mantenimiento ni soporte.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, y no se documenta una validación externa independiente de las métricas reportadas.
- La cuantización int8 introduce una pérdida de 0,003 de macro F1 respecto al modelo fp32, aceptable pero no nula.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KirillPo/sentiboard-models
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Dataset GoEmotions: https://huggingface.co/datasets/google-research-datasets/go_emotions
- Dataset TweetEval: https://huggingface.co/datasets/cardiffnlp/tweet_eval
- Descarga del repositorio: `hf download KirillPo/sentiboard-models --local-dir models`
