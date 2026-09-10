# shikazu05/nq-deberta-crossencoder-v1

## Resumen

`nq-deberta-crossencoder-v1` es un cross-encoder de reranking desarrollado por `shikazu05` para la tarea de recuperación de respuestas históricas del corpus "Notes and Queries" (1849-1928). El modelo parte del checkpoint `microsoft/deberta-v3-base` y ha sido afinado de forma listwise para seleccionar la respuesta correcta entre 20 candidatas por consulta, optimizando el MRR (Mean Reciprocal Rank). Su relevancia radica en que es un artefacto público de un fine-tune reproducible, con el código de entrenamiento disponible y sin necesidad de servicios de inferencia externos.

La arquitectura es un cross-encoder basado en el modelo DeBERTa-v3-base, que recibe pares consulta-respuesta y produce una puntuación de relevancia. El modelo tiene 184.422.913 parámetros y unos 0,7 GB de tamaño. No se dispone de datos sobre longitud de contexto, cuantizaciones ni idiomas soportados en la información proporcionada. La licencia es MIT, lo que permite uso comercial y redistribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v3-base (cross-encoder) |
| Parametros totales | 184.422.913 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un cross-encoder, lo que significa que en la inferencia recibe simultáneamente la consulta y una respuesta candidata, concatenadas con el separador del tokenizador de DeBERTa-v3. Esta arquitectura permite modelar la interacción entre ambos textos con atención completa, a diferencia de los bi-encoders que codifican por separado.

El entrenamiento se realizó sobre un conjunto de datos compuesto por 1.472 casos, cada uno con 20 respuestas candidatas, lo que genera 29.440 pares consulta-respuesta. El objetivo es una pérdida de entropía cruzada listwise sobre cada grupo de 20 candidatas, fijando el índice de la respuesta dorada como valor objetivo para compensar el desequilibrio 1:19 de la clasificación punto a punto.

La configuración de entrenamiento incluye 4 épocas con parada temprana (mejor época 1), tasa de aprendizaje 2e-5 con decaimiento coseno, AdamW con weight decay 0.01, precisión fp16 y longitud máxima de 320 tokens. Se usó un lote efectivo de 4 mediante acumulación de gradientes, semilla 42 y un único GPU A10G de 24 GB. El código de entrenamiento es `modal_app.py::train_listwise` con la etapa `"train-deberta"`.

En inferencia, las puntuaciones se mezclan con un factor de 0.90 para las logits normalizadas por caso (z-score) y 0.10 para la similaridad coseno basada en TF-IDF. Este blend se ajustó en un holdout fijo de 147 casos, con plateaus en el rango 0.08-0.25.

## Capacidades

- Reordenamiento (reranking) de respuestas candidatas: dado un conjunto de 20 documentos, asigna una puntuación de relevancia a cada uno.
- Inferencia local y sin servicios externos: funciona a través de `transformers`, sin necesidad de API.
- Optimizado para mejorar MRR en la tarea "Notes and Queries", con resultados de 0.6262 en holdout (con blend) y 0.5914 en test con separación temporal.
- No genera texto: es un modelo discriminativo, no un modelo generativo.
- No tiene soporte de tool calling, agentes, visión o audio.

## Casos de uso

- Búsqueda histórica asistida: el modelo puede reordenar los resultados de un buscador sobre el corpus "Notes and Queries" (1849-1928), facilitando a los investigadores encontrar respuestas relevantes entre las 20 candidatas recuperadas por un sistema clásico.
- Reordenación de respuestas OCR ruidosas: dado que el dataset incluye textos históricos con errores de OCR, el modelo ayuda a priorizar las respuestas más coherentes tras una normalización ligera (sustitución de la s larga y colapso de espacios).
- Integración en pipelines de recuperación de conocimiento: puede usarse como segunda etapa tras una recuperación basada en TF-IDF o BM25, mejorando la precisión final del ranking.
- Evaluación comparativa de cross-encoders: sirve como referencia para probar variaciones de entrenamiento listwise sobre DeBERTa-v3-base en tareas similares.
- Ayuda a sistemas de preguntas y respuestas sobre textos históricos: el modelo puede actuar como un reranker para preguntas sobre publicaciones antiguas, reduciendo los falsos positivos en la selección de pasajes.
- Trabajo con documentos digitalizados: puede clasificar respuestas en colecciones patrimoniales, siempre que las entradas cumplan con la estructura (consulta + 20 candidatas) esperada.

## Benchmarks y rendimiento

Los resultados reportados en la model card se presentan sobre un holdout fijo de 147 casos (separación con semilla 42) y un test con separación temporal por años no vistos durante el entrenamiento. Todas las métricas son MRR.

| Metodo | MRR (holdout 147 casos) |
|---|---|
| TF-IDF (baseline) | 0.547 |
| MiniLM congelado | 0.510 |
| Fine-tuning punto a punto | 0.553 |
| MiniLM listwise | 0.5835 |
| DeBERTa listwise (puro) | 0.6154 |
| DeBERTa + blend 0.10 | 0.6262 |

| Metodo | MRR (test separacion temporal) |
|---|---|
| DeBERTa + blend 0.10 | 0.5914 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta; el tamaño del modelo es de 0,7 GB. Con 184M parámetros en fp16, la inferencia puede ejecutarse en GPUs de consumo con 2-4 GB de VRAM.
- GPU recomendada: no disponible; el fine-tuning se realizó en una A10G de 24 GB, pero para inferencia basta una GPU modesta o incluso CPU.
- Compatibilidad con GPU de consumo: sí, aunque no hay datos empíricos publicados.
- Opciones de despliegue: `transformers` (PyTorch) para carga local; puede integrarse en servicios como FastAPI o cualquier framework de inferencia Python.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La información proporcionada no incluye benchmarks de otros modelos externos, pero se pueden comparar los baselines evaluados durante el desarrollo.

| Modelo / metodo | MRR (holdout) | Tamano/parametros | Licencia |
|---|---|---|---|
| TF-IDF | 0.547 | 0 (no neuronal) | - |
| MiniLM congelado | 0.510 | no disponible (codificador) | MIT (probable) |
| MiniLM listwise | 0.5835 | no disponible | MIT (probable) |
| DeBERTa listwise (puro) | 0.6154 | 184.422.913 | MIT |
| DeBERTa + blend 0.10 | 0.6262 | 184.422.913 | MIT |

## Limitaciones y advertencias

- Conjunto de datos pequeño: solo 1.472 consultas, lo que limita la generalización a otros dominios o épocas.
- Degradación con datos temporales no vistos: la separación por años de publicación no vistos reduce el MRR en aproximadamente 0.03 frente al holdout aleatorio.
- Ruido OCR: solo se aplica una normalización ligera (s larga a s y colapso de espacios), por lo que errores complicados de OCR pueden afectar el rendimiento.
- Especificidad de la tarea: el modelo está optimizado solo para la estructura de 20 candidatas, no para reranking de listas de tamaño distinto sin adaptación.
- Riesgo de alucinación: al ser un discriminativo, no genera texto, pero puede otorgar puntuaciones altas a pasajes irrelevantes, lo que requiere validación manual en aplicaciones críticas.
- Idiomas: no se especifica soporte multilingüe; el modelo base DeBERTa-v3-base no es multilingüe por defecto, por lo que se espera que solo funcione en inglés.

## Enlaces

- HuggingFace: https://huggingface.co/shikazu05/nq-deberta-crossencoder-v1
- Otros enlaces: no disponible en la informacion proporcionada.
