# krishna597441/pocketsnap-bill-classifier

## Resumen

pocketsnap-bill-classifier es un modelo de clasificación de texto obtenido mediante fine-tuning de distilbert-base-uncased, publicado por el usuario krishna597441 en Hugging Face. Su propósito declarado, a juzgar por el nombre, es clasificar documentos relacionados con facturas o recibos ("bills") dentro del proyecto PocketSnap, aunque la model card no detalla las etiquetas ni el dominio exacto de aplicación. El modelo tiene 66.958.086 parámetros y se distribuye con pesos en safetensors y una exportación ONNX, lo que facilita su despliegue en entornos de inferencia ligeros.

Se trata de un DistilBERT, es decir, una versión destilada de BERT-base con aproximadamente la mitad de parámetros y una arquitectura transformer encoder-only. El contexto máximo es de 512 tokens, herencia directa del modelo base, y el tokenizador es el WordPiece sin distinguir mayúsculas de distilbert-base-uncased, por lo que el modelo está orientado a texto en inglés. La licencia es Apache 2.0.

Su relevancia es limitada y muy específica: es un clasificador de dominio estrecho, con cero descargas en el momento de la consulta y una model card generada automáticamente por el Trainer de Hugging Face que deja sin documentar los aspectos esenciales (etiquetas, dataset, usos previstos). Resulta útil como ejemplo de pipeline de fine-tuning reproducible, pero no como componente generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (DistilBERT, destilado de BERT-base) |
| Parametros totales | 66.958.086 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (heredada de distilbert-base-uncased) |
| Tipos de cuantizacion | no disponible (existe exportacion ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (el modelo base es exclusivamente ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y ONNX |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de distilbert-base-uncased, un transformer encoder-only de 6 capas y 66,9 millones de parámetros obtenido por destilación de BERT-base. La tarea añadida es una cabeza de clasificación de secuencias (`text-classification`), por lo que el modelo emite una distribución de probabilidad sobre un conjunto de etiquetas que la model card no especifica. El tokenizador es WordPiece con vocabulario de 30.522 tokens y normalización a minúsculas.

El entrenamiento se realizó con el Trainer de Hugging Face durante 5 épocas, con learning rate 5e-05, batch de entrenamiento de 16, batch de evaluación de 8, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, y scheduler lineal. El conjunto de entrenamiento era muy pequeño: el registro de pasos indica 16 pasos por época, lo que equivale a 256 ejemplos de entrenamiento en total. No se documenta la composición del dataset, el número de etiquetas ni si hubo aumentación de datos. Las versiones de framework declaradas son Transformers 5.22.1, PyTorch 2.14.1+cu130, Datasets 4.8.5 y Tokenizers 0.23.3.

## Capacidades

- Clasificación de texto de secuencia completa: asigna una etiqueta (o distribución de etiquetas) a un texto de entrada de hasta 512 tokens.
- Dominio restringido a documentos tipo factura o recibo, según el nombre del modelo; las categorías concretas no están documentadas.
- Inferencia en inglés: el tokenizador uncased de DistilBERT está entrenado sobre corpus en inglés.
- Exportación ONNX incluida en el repositorio, apta para despliegue con ONNX Runtime, Text Embeddings Inference o endpoints compatibles.
- No soporta generación de texto, tool calling, razonamiento multi-paso, agentes, visión ni audio.
- No dispone de modo de razonamiento explícito ni de capacidades multimodales.

## Casos de uso

- Clasificación de recibos en una aplicación de gestión de gastos: el modelo puede etiquetar el texto extraído por OCR de una factura (comercio, conceptos, importes) en categorías predefinidas, siempre que las etiquetas coincidan con las del entrenamiento original.
- Triaje documental en pipelines de contabilidad: filtrar documentos entrantes para separar facturas de otro tipo de correspondencia antes de un procesamiento más costoso.
- Enrutamiento de tickets de soporte relacionados con facturación: usar la etiqueta predicha para dirigir la consulta al equipo adecuado.
- Preprocesado en sistemas de archivo digital: clasificar automáticamente PDFs escaneados cuyo texto se ha extraído con OCR, con un coste de inferencia muy bajo gracias a los 67 millones de parámetros.
- Prototipado y validación de pipelines de clasificación: sirve como línea base rápida para comparar con modelos mayores antes de invertir en entrenamiento a gran escala.
- Despliegue en CPU o dispositivos de borde: con la exportación ONNX y 67 millones de parámetros, cabe en entornos sin GPU para clasificación por lotes de baja latencia.

## Benchmarks y rendimiento

La model card declara los siguientes resultados sobre el conjunto de evaluación, sin especificar su tamaño ni composición:

| Metrica | Valor |
|---|---|
| Loss de evaluacion | 0,0696 |
| Accuracy | 1,0 |

Evolución por época según el registro del Trainer:

| Epoca | Paso | Loss de validacion | Accuracy |
|---|---|---|---|
| 1 | 16 | 1,2252 | 0,9318 |
| 2 | 32 | 0,4460 | 1,0 |
| 3 | 48 | 0,1569 | 1,0 |
| 4 | 64 | 0,0829 | 1,0 |
| 5 | 80 | 0,0696 | 1,0 |

No se han publicado resultados de benchmarks estándar (MMLU, GLUE, etc.) en la información disponible. El accuracy de 1,0 debe interpretarse con cautela: con solo 256 ejemplos de entrenamiento y un conjunto de evaluación no documentado, es muy probable que el conjunto de validación sea minúsculo y que la métrica no sea representativa.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 270 MB para los pesos, más overhead de activaciones y tokenizador; en la práctica, menos de 1 GB.
- VRAM estimada en FP16: aproximadamente 135 MB para los pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo es viable en GTX 1650, RTX 3050, T4, L4, A10G, A100 y H100 sin aprovechar su capacidad.
- Cabe holgadamente en GPU de consumo e incluso en CPU; la inferencia en CPU es práctica para lotes pequeños.
- Opciones de despliegue: transformers con PyTorch, ONNX Runtime (exportación incluida), Text Embeddings Inference (tag `text-embeddings-inference`), endpoints compatibles, y conversión a GGUF mediante herramientas externas para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño, se espera un throughput de miles de secuencias por segundo en GPU moderna con batch grande, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pocketsnap-bill-classifier | 66,9 M | 512 | Clasificacion de facturas (dominio estrecho) | Apache 2.0 | Hugging Face, 0 descargas |
| distilbert-base-uncased | 66,9 M | 512 | Modelo base generalista (masked LM) | Apache 2.0 | Hugging Face, ampliamente usado |
| bert-base-uncased | 110 M | 512 | Modelo base generalista | Apache 2.0 | Hugging Face, ampliamente usado |
| roberta-base | 125 M | 512 | Modelo base generalista | MIT | Hugging Face, ampliamente usado |

Frente a los modelos base, pocketsnap-bill-classifier aporta una cabeza de clasificación ya entrenada para su dominio concreto, pero carece de la documentación y el respaldo de uso de los modelos generalistas. Para clasificación de facturas en producción, un fine-tuning propio sobre distilbert-base-uncased o roberta-base con un dataset documentado sería preferible.

## Limitaciones y advertencias

- Model card generada automáticamente: no se documentan etiquetas, dataset, usos previstos ni limitaciones, lo que impide evaluar su idoneidad sin inspeccionar los pesos.
- Accuracy de 1,0 sobre un conjunto de evaluación no especificado y con solo 256 ejemplos de entrenamiento: alta probabilidad de sobreajuste y de métricas no representativas.
- Cero descargas y un solo "like" en el momento de la consulta: no hay evidencia de uso en producción ni validación independiente.
- Sesgos: al derivar de distilbert-base-uncased, hereda los sesgos del corpus inglés con el que se entrenó el modelo base (principalmente texto web y libros en inglés).
- Riesgo de alucinación: bajo en sentido estricto (es un clasificador, no genera texto), pero puede asignar etiquetas con alta confianza a entradas fuera de distribución.
- Limitación de idioma: el tokenizador uncased en inglés degrada el rendimiento con texto en castellano u otros idiomas.
- Limitación de contexto: 512 tokens; documentos de factura más largos requieren truncado o segmentación.
- Licencia Apache 2.0: permite uso comercial, pero la ausencia de documentación sobre el dataset de entrenamiento impide verificar la procedencia de los datos y posibles restricciones adicionales.
- Para producción: no recomendable sin una evaluación propia sobre un conjunto de validación representativo del dominio real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/krishna597441/pocketsnap-bill-classifier
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Documentación de Transformers para clasificación de texto: https://huggingface.co/docs/transformers/tasks/sequence_classification
