# car4731/smaller_training_set_model

## Resumen

`smaller_training_set_model` es un modelo de clasificación de texto publicado por el usuario car4731 en Hugging Face. Se trata de un fine-tuning de `distilbert-base-uncased`, la variante destilada de BERT desarrollada por Hugging Face, que conserva aproximadamente el 97 % del rendimiento de BERT-base con un 40 % menos de parámetros. El modelo resultante tiene 66.955.010 parámetros y un tamaño de repositorio de 0,3 GB.

El modelo está entrenado para clasificación de texto binaria o multiclase, aunque la model card no especifica la tarea concreta ni el dataset utilizado (aparece como "unknown dataset"). Los resultados declarados en el conjunto de evaluación son razonables para una tarea de clasificación: accuracy de 0,85, precision de 0,7946, recall de 0,9271 y F1 de 0,8558, con una pérdida de validación de 0,5960 tras dos épocas.

Su relevancia es limitada: se trata de un experimento de fine-tuning con un conjunto de entrenamiento reducido (el nombre lo indica), sin documentación sobre la tarea, los datos o los usos previstos. Resulta útil como ejemplo de pipeline de entrenamiento con `Trainer` de Transformers y como punto de partida para tareas de clasificación de texto en inglés, pero no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT-base) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (límite estándar de DistilBERT) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización INT8 posible vía PyTorch/ONNX, no documentada por el autor) |
| Idiomas soportados | no disponible (el modelo base es uncased en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo DistilBERT: 6 capas, 12 cabezas de atención, dimensión oculta de 768 y 66,9 M de parámetros. DistilBERT se obtuvo por destilación de conocimiento de BERT-base, eliminando la mitad de las capas y manteniendo el tokenizador WordPiece con vocabulario de 30.522 tokens. El modelo base es `distilbert-base-uncased`, entrenado en inglés sobre BookCorpus y Wikipedia en inglés.

El fine-tuning se realizó con la librería Transformers 5.22.1 y PyTorch 2.14.1, usando el optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, learning rate de 2e-5, scheduler lineal, batch size de 16 en entrenamiento y evaluación, semilla 42 y 2 épocas. El conjunto de entrenamiento era pequeño: 126 pasos totales con batch de 16 implican aproximadamente 1.008 ejemplos de entrenamiento. No se documenta el dataset, la composición de las clases, ni si hubo aumentación de datos. No se menciona RLHF, DPO ni ninguna técnica de alineación.

## Capacidades

- Clasificación de texto: el modelo está diseñado exclusivamente para tareas de clasificación (text-classification en el pipeline de Hugging Face).
- Codificación de texto: al ser un encoder DistilBERT, puede usarse para extraer embeddings contextuales de frases y párrafos (con la cabeza de clasificación eliminada).
- Comprensión lectora limitada: hereda del modelo base cierta capacidad de representación semántica, aunque no está entrenado para generación.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta generación de texto libre: es un modelo discriminativo, no generativo.
- Capacidades multilingües: no documentadas; el modelo base es uncased en inglés, por lo que el rendimiento en castellano u otros idiomas no está garantizado.
- Capacidades especiales: ninguna documentada (sin thinking mode, sin visión, sin audio).

## Casos de uso

- Moderación de contenido binaria: clasificar comentarios o mensajes como tóxicos/no tóxicos en inglés. El modelo es ligero (0,3 GB) y puede ejecutarse en CPU con latencia de milisegundos, adecuado para filtrado en tiempo real.
- Análisis de sentimiento en reseñas: dado el recall alto (0,9271) declarado, es apropiado para escenarios donde no perder casos positivos sea prioritario, como la detección de quejas en atención al cliente.
- Clasificación de tickets de soporte: asignar categorías a correos o formularios de soporte en inglés, aprovechando el bajo coste computacional para procesar lotes grandes.
- Filtrado de spam en pipelines de ingesta: como clasificador previo en un sistema de procesamiento de documentos, descartando entradas irrelevantes antes de pasarlas a modelos mayores.
- Etiquetado de datasets para entrenamiento: usar el modelo como anotador automático de baja confianza en un pipeline de weak supervision, revisando manualmente solo los casos con probabilidad cercana a 0,5.
- Extracción de embeddings para búsqueda semántica: eliminando la cabeza de clasificación, el encoder puede generar representaciones de frases para un índice vectorial ligero, aunque para este fin existen alternativas específicas (Sentence-BERT, E5) con mejor rendimiento.
- Prototipado rápido de tareas de clasificación: servir como baseline en experimentos académicos o pruebas de concepto, dado su tamaño reducido y su licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index de la model card está vacío (`"results": []`). Los únicos datos de rendimiento son los del conjunto de evaluación interno del autor, que se muestran a continuación.

| Metrica | Epoca 1 (step 63) | Epoca 2 (step 126) |
|---|---|---|
| Training loss | 0,1273 | 0,0690 |
| Validation loss | 0,6674 | 0,5960 |
| Accuracy | 0,84 | 0,85 |
| Precision | 0,7857 | 0,7946 |
| Recall | 0,9167 | 0,9271 |
| F1 | 0,8462 | 0,8558 |

No se dispone de comparación con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32 (66,9 M de parámetros × 4 bytes ≈ 268 MB, más activaciones y overhead). En FP16, aproximadamente 134 MB de pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona sin problema en GTX 1650, RTX 3060, T4, A10G, A100, H100.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Cabe en CPU: sí, con latencia de decenas de milisegundos por lote pequeño.
- Opciones de despliegue: `transformers` (PyTorch), `text-embeddings-inference` (el tag `text-embeddings-inference` está presente en el repo), ONNX Runtime, TorchScript, `optimum` para exportación, y servidores de inferencia compatibles con `endpoints_compatible`.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Para un modelo de este tamaño, en una T4 se espera un throughput del orden de miles de secuencias por segundo con batch grande, pero no hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `car4731/smaller_training_set_model` | 66,9 M | 512 | Clasificación de texto | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased` (modelo base) | 66,9 M | 512 | Masked LM / encoder general | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66,9 M | 512 | Análisis de sentimiento | Apache 2.0 | Hugging Face |
| `bert-base-uncased` | 110 M | 512 | Masked LM / encoder general | Apache 2.0 | Hugging Face |

La comparación se limita a modelos de la misma familia y tamaño, ya que no se dispone de datos de rendimiento del modelo evaluado frente a alternativas en benchmarks estándar. El modelo base y las variantes fine-tuned de DistilBERT son las alternativas naturales; `bert-base-uncased` ofrece mayor capacidad (110 M) a costa de más cómputo. No se dispone de información sobre modelos comparables de otros autores con la misma tarea específica, porque la tarea no está documentada.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: la model card indica "unknown dataset" y "More information needed" en las secciones de descripción, usos previstos y datos. No es posible evaluar la calidad ni la representatividad de los datos.
- Tarea no documentada: se desconoce qué clases predice el modelo y en qué dominio. Usarlo en producción sin validación previa es arriesgado.
- Sesgos: hereda los sesgos de `distilbert-base-uncased`, entrenado en BookCorpus y Wikipedia en inglés, con posible infrarrepresentación de variedades dialectales y de otros idiomas.
- Riesgo de alucinación: bajo en sentido estricto (es un clasificador, no genera texto), pero puede producir clasificaciones erróneas con alta confianza en entradas fuera de distribución.
- Limitación de contexto: 512 tokens; textos más largos deben truncarse o dividirse, lo que puede perder información relevante.
- Limitación de idioma: el modelo base es uncased en inglés; el rendimiento en castellano no está evaluado y probablemente sea deficiente.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se indique si se han realizado cambios. No hay restricciones adicionales documentadas.
- Caveat para producción: el modelo tiene 0 descargas y 0 likes, sin validación externa. Conviene evaluarlo en un conjunto de test propio antes de desplegarlo. El conjunto de evaluación del autor es pequeño (no se especifica su tamaño), por lo que las métricas declaradas tienen alta varianza.
- Sobreajuste probable: la pérdida de entrenamiento baja de 0,1273 a 0,0690 mientras la de validación baja solo de 0,6674 a 0,5960, lo que sugiere un ajuste limitado y un posible desajuste entre train y validación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/car4731/smaller_training_set_model
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Documentación de Transformers: https://huggingface.co/docs/transformers
- Documentación de text-embeddings-inference: https://huggingface.co/docs/text-embeddings-inference
