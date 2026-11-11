# iankamar/imdb-sentiment-rnn-models

## Resumen

`iankamar/imdb-sentiment-rnn-models` es un conjunto de tres modelos de clasificación binaria de sentimiento (positivo/negativo) entrenados en TensorFlow/Keras sobre el corpus IMDb de reseñas de películas en inglés. El paquete incluye una red LSTM, una red GRU y un modelo híbrido LSTM–GRU, todos con embedding de 32 dimensiones y salida sigmoide. El autor es `iankamar` y el repositorio se publicó en Hugging Face con la librería TensorFlow y el pipeline `text-classification`.

El modelo resuelve una tarea clásica y acotada: asignar una probabilidad de sentimiento a una reseña de cine en inglés. Su relevancia no está en la escala ni en la novedad arquitectónica, sino en servir como referencia reproducible y ligera: el autor documenta el split tras eliminar duplicados (31.728 entrenamiento, 7.933 validación, 9.916 test), el vocabulario de 10.000 tokens ajustado solo con texto de entrenamiento y las métricas completas en `metrics.json`. Es, por tanto, un artefacto útil para docencia, prototipado rápido y comparación de baselines recurrentes frente a transformers.

La escala es muy reducida: 32 unidades en LSTM y GRU, 16+16 en el híbrido, entradas de hasta 160 tokens y un repositorio de 0,0 GB. No es un modelo de propósito general ni compite con LLM; es un clasificador de sentimiento específico de dominio con métricas de test verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RNN: LSTM (32 unidades), GRU (32 unidades) y LSTM-GRU híbrido (16+16 unidades); embedding de 32 dimensiones, dropout 0,2, salida sigmoide |
| Parametros totales | no disponible (el autor no publica el recuento; con vocabulario de 10.000 y embedding de 32, el embedding supone 320.000 parámetros, más las celdas recurrentes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 160 tokens de entrada (truncado/padding) |
| Tipos de cuantizacion | no disponible (pesos Keras en float; no se documentan variantes GGUF/ONNX cuantizadas) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | `.keras` (formato nativo de Keras 3 / TensorFlow); incluye vocabulario y capa de vectorización |

## Arquitectura y entrenamiento

Los tres modelos son redes recurrentes apiladas sobre una capa de embedding de 32 dimensiones con padding enmascarado. La LSTM y la GRU tienen 32 unidades cada una; el híbrido encadena una LSTM de 16 unidades y una GRU de 16 unidades. Todos usan dropout de 0,2, salida sigmoide y pérdida de entropía cruzada binaria. La entrada se limita a 160 tokens y el vocabulario a 10.000 tokens, ajustado exclusivamente con el texto de entrenamiento para evitar fuga de información.

El entrenamiento se realizó sobre el dataset IMDb de 50.000 reseñas tras eliminar duplicados, quedando 31.728 ejemplos de entrenamiento, 7.933 de validación y 9.916 de test. Se aplicó early stopping sobre la pérdida de validación; el modelo GRU por defecto se seleccionó por ROC AUC de validación. El autor advierte que los resultados corresponden a una única semilla y un único split, y que las curvas ROC del notebook original (basadas en etiquetas ficticias) no se reutilizan. No se documenta uso de RLHF, DPO ni aumentación de datos.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) de reseñas de películas en inglés.
- Salida de probabilidad calibrable manualmente; el autor indica que las puntuaciones no están calibradas.
- Tres variantes intercambiables (LSTM, GRU, híbrido) con métricas comparables.
- Preprocesado integrado: el modelo guardado incluye vocabulario y capa de vectorización; `preprocessing.py` replica la limpieza de HTML y espacios usada en entrenamiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- No cubre clases neutras: solo positivo y negativo.
- Capacidad multilingüe: no; únicamente inglés.

## Casos de uso

- Moderación y triaje de reseñas: clasificar automáticamente reseñas de plataformas de cine o streaming en positivas y negativas para priorizar la revisión humana. El modelo es lo bastante ligero para ejecutarse en CPU por petición.
- Análisis de opinión en investigación académica: servir como baseline recurrente reproducible frente a modelos transformer en estudios de análisis de sentimiento, gracias a las métricas y al split documentados.
- Docencia de NLP: ejemplo completo de pipeline Keras (limpieza, tokenización, embedding, RNN, early stopping) con artefactos de evaluación incluidos (`metrics.json`, `test-predictions.npz`, `roc-curves.png`).
- Prototipado de producto: integrar una primera versión de clasificador de sentimiento en una API o script de Python sin dependencias de GPU ni servicios externos.
- Enriquecimiento de datasets: etiquetar grandes volúmenes de reseñas en inglés de forma barata antes de un etiquetado fino o de un modelo mayor.
- Filtrado previo en pipelines de LLM: descartar o agrupar reseñas claramente positivas o negativas antes de pasarlas a un modelo generativo, reduciendo coste de inferencia.
- Demostración interactiva: el Space `iankamar/imdb-sentiment-rnns` permite probar el clasificador sin infraestructura propia.

## Benchmarks y rendimiento

| Modelo | Test accuracy | Test macro F1 | Test ROC AUC |
|---|---:|---:|---:|
| LSTM | 86,42 % | 0,8642 | 0,9364 |
| GRU | 86,24 % | 0,8624 | 0,9337 |
| LSTM-GRU | 85,96 % | 0,8596 | 0,9361 |

Evaluación sobre 9.916 etiquetas de test reales, una sola semilla y un solo split. No se han publicado comparaciones con modelos externos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el modelo cabe holgadamente en cualquier GPU consumer (menos de 1 GB en la práctica, dado el tamaño del repositorio de 0,0 GB y el vocabulario de 10.000 tokens con embedding de 32).
- GPU recomendadas: no requiere GPU; funciona en CPU. Cualquier GPU con soporte TensorFlow (por ejemplo, RTX 3060 o superior) acelera el procesamiento por lotes.
- Cabe en GPU consumer: sí, en cualquier modelo con soporte CUDA y en CPU.
- Opciones de despliegue: TensorFlow/Keras nativo (`tf.keras.models.load_model`), TensorFlow Serving, scripts de Python con `requirements.txt`. No se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño, se espera latencia de milisegundos por muestra en CPU.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Test accuracy (IMDb) | Licencia |
|---|---|---|---:|---:|---|
| iankamar/imdb-sentiment-rnn-models (LSTM) | LSTM + embedding 32d | no disponible | 160 tokens | 86,42 % | no disponible |
| iankamar/imdb-sentiment-rnn-models (GRU) | GRU + embedding 32d | no disponible | 160 tokens | 86,24 % | no disponible |
| iankamar/imdb-sentiment-rnn-models (híbrido) | LSTM-GRU 16+16 | no disponible | 160 tokens | 85,96 % | no disponible |
| Baselines transformer (p. ej. DistilBERT fine-tuned en IMDb) | Transformer encoder | ~66 M | 512 tokens | no disponible en esta ficha | varía según checkpoint |

No se dispone de datos de benchmarks de alternativas en la información proporcionada; la fila de DistilBERT se incluye solo como referencia de categoría y sus métricas no deben tomarse de esta ficha.

## Limitaciones y advertencias

- Entrenado únicamente en inglés; no generaliza a otros idiomas.
- Dominio restringido a reseñas de películas; el rendimiento en otros textos (productos, redes sociales) no está validado.
- Sin clase neutra: fuerza una decisión binaria incluso en textos ambiguos.
- Puntuaciones sin calibrar: el autor advierte explícitamente que las probabilidades son estimaciones no calibradas.
- Resultados de una sola semilla y un solo split; la variabilidad entre ejecuciones no está cuantificada.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de desplegarlo en producción.
- Riesgo de alucinación no aplica (es un clasificador, no generativo), pero sí de falsos positivos/negativos en reseñas irónicas, mixtas o muy largas (truncadas a 160 tokens).
- El texto crudo de las reseñas no se redistribuye; los datos originales conservan sus propios términos.
- Repositorio con 0 descargas y 1 like: ecosistema mínimo, sin garantías de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iankamar/imdb-sentiment-rnn-models
- Demo (Space): https://huggingface.co/spaces/iankamar/imdb-sentiment-rnns
- Dataset IMDb de 50.000 reseñas: https://huggingface.co/datasets/stanfordnlp/imdb
