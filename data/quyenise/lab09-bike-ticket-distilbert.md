# quyenise/lab09-bike-ticket-distilbert

## Resumen

El modelo `quyenise/lab09-bike-ticket-distilbert` es un clasificador de texto en inglés afinado a partir de `distilbert/distilbert-base-uncased`, publicado por el usuario quyenise. Su propósito es sugerir una de cuatro colas de soporte para una empresa ficticia de bicicletas compartidas (Lakeshore Bike Share): facturación (`billing`), avería de bicicleta (`bike_fault`), estación (`station`) y cuenta (`account`). Se trata de un modelo de clasificación de secuencias, no de un modelo generativo.

El modelo resuelve un problema acotado de enrutamiento de tickets de atención al cliente: dado un mensaje de texto, asignar una categoría entre cuatro. Es relevante como ejemplo de fine-tuning completo de DistilBERT sobre un conjunto de datos sintético pequeño, y su model card reporta métricas comparativas frente a una línea base de regresión logística con TF-IDF. No obstante, su alcance es experimental y de laboratorio: 400 filas de entrenamiento sintéticas, evaluación independiente de solo 40 mensajes y ausencia de validación con datos reales.

Con 66.956.548 parámetros y un tamaño de repositorio de 0,3 GB, es un modelo ligero que puede ejecutarse en CPU y en GPU de consumo con facilidad. La longitud máxima de tokenización usada durante el entrenamiento fue de 96 tokens, lo que limita su uso a mensajes cortos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilación de BERT-base) |
| Parámetros totales | 66.956.548 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible como contexto nativo declarado; entrenado con longitud máxima de 96 tokens |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF u otras) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es DistilBERT, un transformer encoder de 6 capas obtenido por destilación de BERT-base (12 capas), con 66,9 millones de parámetros. Es un modelo bidireccional de comprensión del lenguaje, sin cabeza generativa; sobre él se añade una cabeza de clasificación de secuencias con 4 etiquetas de salida. El modelo base es `distilbert/distilbert-base-uncased`, por lo que el texto se normaliza a minúsculas y se tokeniza con el vocabulario WordPiece de BERT en inglés.

El fine-tuning fue completo (no LoRA ni adaptadores), con learning rate 2e-5, 3 épocas, batch size 8 y longitud máxima de 96 tokens. Los datos de entrenamiento son 400 observaciones seleccionadas de un conjunto de 1.200 tickets de soporte sintéticos, con partición 720/240/240 (entrenamiento/validación/prueba). La selección del modelo se hizo únicamente con datos de validación. No se documenta uso de RLHF, DPO ni técnicas de alineación, algo esperable en un clasificador. La innovación técnica es inexistente más allá del propio fine-tuning; el interés está en la comparación metodológica con una línea base TF-IDF + regresión logística.

## Capacidades

- Clasificación de texto en inglés en cuatro categorías: `billing`, `bike_fault`, `station` y `account`.
- Salida de etiqueta única (single-label) con distribución de probabilidad sobre las cuatro clases.
- Procesamiento de mensajes cortos de atención al cliente (hasta 96 tokens en entrenamiento).
- No soporta generación de texto, razonamiento, código ni matemáticas.
- No soporta tool calling ni function calling.
- No está diseñado para agentes ni razonamiento multi-paso.
- Capacidad multilingüe: no disponible; solo inglés.
- No dispone de modo de pensamiento (thinking), visión ni audio.

## Casos de uso

- Enrutamiento preliminar de tickets de soporte: el modelo asigna un mensaje entrante a una de las cuatro colas, reduciendo la carga de triaje manual. Adecuado por su latencia baja y su tamaño reducido, aunque la model card exige revisión humana en mensajes ambiguos.
- Filtro de primera pasada en un sistema de ticketing: clasificar automáticamente los mensajes con alta confianza y derivar el resto a revisión humana, usando el umbral de probabilidad como criterio de escalado.
- Prototipado rápido de pipelines de clasificación: servir como referencia de fine-tuning completo de DistilBERT para equipos que quieran replicar el flujo con sus propios datos.
- Comparación de líneas base: útil en experimentos docentes o de investigación para contrastar un transformer afinado frente a TF-IDF + regresión logística con el mismo conjunto de entrenamiento.
- Etiquetado asistido de datos: preetiquetar tickets históricos para acelerar la anotación humana, dado el bajo coste computacional de la inferencia.
- Despliegue en entornos con recursos limitados: al ser un modelo de 67 millones de parámetros, puede ejecutarse en CPU o en GPU de consumo para clasificación en tiempo real de mensajes cortos.
- Clasificación por lotes de mensajes cortos: procesar volúmenes moderados de mensajes en pipelines offline sin necesidad de infraestructura GPU dedicada.

## Benchmarks y rendimiento

Resultados reportados en la model card. Todas las métricas usan las mismas 400 filas de entrenamiento; las medias de validación provienen de las semillas 42, 43 y 44. La columna "Own 40 accuracy" corresponde a una evaluación independiente de 40 mensajes.

| Método | Filas de entrenamiento | Accuracy validación | Accuracy prueba | F1 macro prueba | Accuracy en 40 propios |
|---|---:|---:|---:|---:|---:|
| most_frequent | 400 | 0,287 | 0,292 | 0,113 | 0,250 |
| tfidf_logreg | 400 | 0,863 | 0,846 | 0,843 | 0,750 |
| full (este modelo) | 400 | 0,908 | 0,896 | 0,896 | 0,825 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,3 GB en FP32 para los pesos (67 M de parámetros), con overhead adicional mínimo; en FP16 aproximadamente 0,15 GB. Cabe holgadamente en cualquier GPU moderna.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. En GPU, cualquier tarjeta con al menos 1 GB de VRAM es suficiente (GTX 1050, RTX 3060, RTX 4090, A100, H100), aunque el rendimiento no se beneficia de hardware de gama alta para este tamaño.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo actuales e incluso en sistemas integrados.
- Opciones de despliegue: Hugging Face `transformers` (pipeline `text-classification`), TorchServe, ONNX Runtime, FastAPI con `transformers`, o `text-embeddings-inference` no aplica. No se documentan artefactos GGUF para llama.cpp ni Ollama.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, la inferencia en CPU para mensajes de hasta 96 tokens es del orden de milisegundos, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| quyenise/lab09-bike-ticket-distilbert | 66,9 M | 96 tokens (entrenamiento) | Clasificación de tickets en 4 clases | Apache 2.0 | Hugging Face |
| distilbert/distilbert-base-uncased | 66,9 M | 512 tokens | Modelo base de comprensión (sin cabeza de clasificación) | Apache 2.0 | Hugging Face |
| bert-base-uncased | 110 M | 512 tokens | Modelo base de comprensión | Apache 2.0 | Hugging Face |
| TF-IDF + regresión logística (línea base del autor) | No aplica | No aplica | Clasificación de tickets en 4 clases | No aplica | Implementación propia |

La comparación con la línea base TF-IDF + regresión logística es la más directa en términos de tarea: el modelo afinado obtiene 0,896 de accuracy en prueba frente a 0,846 de la línea base, y 0,825 frente a 0,750 en la evaluación independiente de 40 mensajes. No se dispone de comparaciones con otros clasificadores afinados para la misma tarea.

## Limitaciones y advertencias

- Los datos de entrenamiento son sintéticos (1.200 tickets inventados que reutilizan patrones de frase), por lo que el modelo no ha sido validado con registros reales de atención al cliente.
- La evaluación independiente consta de solo 40 mensajes, una muestra muy pequeña que limita la fiabilidad de las métricas reportadas.
- Algunos mensajes son vagos o combinan categorías; el modelo puede asignar una etiqueta incorrecta en esos casos, y la model card exige revisión humana antes de enrutar tickets.
- Las puntuaciones no están garantizadas como calibradas, por lo que los umbrales de confianza deben validarse antes de usarlos en producción.
- Sesgos conocidos: no se documentan análisis de sesgo; al entrenarse con datos sintéticos en inglés, puede no representar la distribución real de mensajes de usuarios.
- Limitación de idioma: solo inglés; no soporta castellano ni otros idiomas.
- Limitación de longitud: entrenado con un máximo de 96 tokens; mensajes más largos se truncan y pueden perder información relevante.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la ausencia de validación con datos reales desaconseja su uso en producción sin un reentrenamiento y evaluación adicionales.
- Riesgo de sobreajuste a los patrones de frase sintéticos, lo que puede degradar el rendimiento fuera del dominio de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/quyenise/lab09-bike-ticket-distilbert
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Documentación de DistilBERT en transformers: https://huggingface.co/docs/transformers/model_doc/distilbert
- No se han encontrado en la información proporcionada papers, blogs, repositorios ni demos adicionales asociados a este modelo.
