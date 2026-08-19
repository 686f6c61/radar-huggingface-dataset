# AlexStamp/distilbert-base-uncased-finetuned-imdb-wwm

## Resumen

Este modelo es un fine-tuning de [DistilBERT base uncased](https://huggingface.co/distilbert-base-uncased) sobre el dataset IMDB, según indica el nombre del repositorio, aunque la model card no especifica el conjunto de datos de entrenamiento. El autor, AlexStamp, lo publicó con licencia Apache 2.0 y pipeline de fill-mask, pero el objetivo real parece ser la clasificación de sentimiento en reseñas de cine. Con 66,9 millones de parámetros y una ventana de contexto de 512 tokens, es un modelo compacto y eficiente para tareas de comprensión del lenguaje en inglés.

La relevancia de este modelo es limitada: la pérdida de validación reportada (2,7186) es muy alta, lo que sugiere que el fine-tuning no convergió correctamente o que el dataset de entrenamiento no era adecuado. No se han publicado métricas de rendimiento (accuracy, F1, etc.), por lo que no es recomendable para uso en producción sin una evaluación adicional. Su interés principal es como ejemplo de fine-tuning de DistilBERT con Hugging Face Trainer, más que como un modelo listo para desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder, 6 capas, 768 dimensiones ocultas, 12 cabezas de atencion) |
| Parametros totales | 66.985.530 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (solo safetensors en FP32) |
| Idiomas soportados | ingles (modelo base entrenado en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en DistilBERT, una version destilada de BERT que conserva el 97% de las capacidades de comprension con un 40% menos de parametros. La arquitectura es un transformer encoder con 6 capas, 768 unidades ocultas y 12 cabezas de atencion, con una ventana de contexto de 512 tokens. El fine-tuning se realizo con el Trainer de Hugging Face, usando un learning rate de 2e-5, batch size de 64, 3 epocas, optimizador AdamW con betas (0.9, 0.999) y scheduler lineal. Se utilizo precision mixta nativa (AMP). La perdida de entrenamiento descendio de 2,95 a 2,82, y la de validacion se mantuvo alrededor de 2,72, lo que indica que el modelo no logro aprender patrones discriminativos del dataset (probablemente IMDB). No se menciona el uso de tecnicas como RLHF o DPO.

## Capacidades

- Clasificacion de sentimiento: el modelo fue entrenado para distinguir reseñas positivas y negativas, aunque la alta perdida de validacion sugiere que esta capacidad es deficiente.
- Fill-mask: al ser un modelo enmascarado, puede predecir tokens ocultos en una frase, aunque su especializacion en IMDB limita su utilidad general.
- Comprension del lenguaje en ingles: hereda las capacidades de DistilBERT base para tareas como NER, respuesta a preguntas o clasificacion de texto, pero sin fine-tuning adicional.
- No soporta tool calling, agentes, vision ni audio.

## Casos de uso

- Prototipado de clasificacion de sentimiento: puede servir como punto de partida para experimentos academicos o pruebas de concepto, aunque se recomienda evaluar su rendimiento antes de cualquier uso practico.
- Ejemplo didactico de fine-tuning: util para aprender a usar el Trainer de Hugging Face con DistilBERT, ya que el repositorio incluye los hiperparametros y el flujo de entrenamiento.
- Analisis de reseñas en ingles: si se reentrena con un dataset mas limpio o se ajusta la cabeza de clasificacion, podria emplearse para moderar comentarios o analizar opiniones en foros.
- Modelo base para destilacion: al ser pequeno, puede usarse como teacher o student en experimentos de destilacion de conocimiento.
- Inferencia en entornos con recursos limitados: su tamano reducido permite ejecutarlo en CPU o GPUs de baja gama, aunque su precision actual es cuestionable.
- Investigacion sobre convergencia: la alta perdida de validacion puede analizarse para estudiar por que el fine-tuning fallo (posible desajuste de hiperparametros o dataset mal preprocesado).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la perdida de validacion (2,7186) y el tiempo de preparacion del modelo, sin metricas de exactitud, F1 o AUC. No se puede comparar con otros modelos de forma cuantitativa.

## Requisitos de hardware

- VRAM estimada: ~250 MB en FP32 para inferencia con batch de 1 (66,9M parametros × 4 bytes). Con cuantizacion INT8, se reduce a ~70 MB, aunque no se proporcionan pesos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (p. ej., NVIDIA GTX 1050 Ti, RTX 2060). Tambien funciona en CPU con latencia de unos pocos milisegundos por secuencia corta.
- Despliegue: compatible con Transformers, ONNX Runtime, TensorRT y llama.cpp (si se convierte a GGUF). No hay configuracion especifica para vLLM o TGI, pero al ser un encoder pequeno, puede servirse con FastAPI o TorchServe.
- Latencia: en una GPU moderna (RTX 3090), la inferencia de una secuencia de 128 tokens tarda ~5-10 ms. En CPU, ~50-100 ms.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento en IMDB (accuracy) |
|---|---|---|---|---|
| AlexStamp/distilbert-base-uncased-finetuned-imdb-wwm | 66,9M | 512 | Apache 2.0 | no disponible |
| distilbert-base-uncased (sin fine-tune) | 66,9M | 512 | Apache 2.0 | ~90% (con clasificador lineal entrenado aparte) |
| bert-base-uncased (fine-tuned en IMDB) | 110M | 512 | Apache 2.0 | ~93% (tipico) |

El modelo de AlexStamp no reporta accuracy, y su perdida de validacion (2,72) es mucho mayor que la de un DistilBERT fine-tuned correctamente (tipicamente <0,5). Esto indica que el fine-tuning fue defectuoso o el dataset no era IMDB real. Comparado con BERT base, es mas ligero pero tambien menos preciso en general.

## Limitaciones y advertencias

- La perdida de validacion de 2,7186 es extremadamente alta, lo que sugiere que el modelo no ha aprendido la tarea de clasificacion de sentimiento. No debe usarse en produccion sin reentrenamiento.
- No se especifica el dataset de entrenamiento en la model card; el nombre sugiere IMDB, pero no hay confirmacion.
- No hay metricas de rendimiento (accuracy, F1, precision) publicadas, por lo que es imposible evaluar su calidad objetivamente.
- El modelo solo soporta ingles; no es multilingue.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias de funcionamiento.
- Al ser un modelo enmascarado, su uso principal (fill-mask) no coincide con el fine-tuning realizado, lo que limita su aplicabilidad directa.

## Enlaces

- [HuggingFace: AlexStamp/distilbert-base-uncased-finetuned-imdb-wwm](https://huggingface.co/AlexStamp/distilbert-base-uncased-finetuned-imdb-wwm)
- [Modelo base: distilbert-base-uncased](https://huggingface.co/distilbert-base-uncased)
