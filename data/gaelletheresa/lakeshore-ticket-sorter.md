# Gaelletheresa/lakeshore-ticket-sorter

## Resumen

Lakeshore ticket sorter es un modelo de clasificación de texto obtenido mediante ajuste fino completo de DistilBERT-base-uncased sobre un conjunto de mensajes cortos de soporte de un servicio de bicicletas compartidas. Su tarea es asignar cada mensaje a una de cuatro colas: facturación (billing), avería de bicicleta (bike_fault), estación (station) y cuenta (account). Lo desarrolla Gaelletheresa como proyecto didáctico, no como sistema de producción.

El modelo parte de DistilBERT, un transformer encoder destilado de BERT-base con 66.956.548 parámetros, contexto de 512 tokens y vocabulario en inglés. Se ha entrenado con 400 mensajes sintéticos extraídos con semilla fija de un corpus de 1.200 mensajes inventados, con una división 60/20/20 entre entrenamiento, validación y prueba. La relevancia práctica es limitada: sirve como referencia de pipeline de clasificación ligera y como ejemplo de comparación frente a una línea base clásica de TF-IDF con regresión logística.

Los resultados publicados son modestos pero honestos: 0,883 de accuracy y 0,885 de macro F1 en el conjunto de prueba de 240 mensajes, frente a 0,867 y 0,870 del clasificador TF-IDF. La licencia Apache 2.0 permite reutilización, pero el propio autor advierte que el modelo no debe enrutar mensajes reales sin revisión humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilación de BERT-base) |
| Parametros totales | 66.956.548 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (heredada de DistilBERT-base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un DistilBERT-base-uncased con una cabeza de clasificación de cuatro etiquetas. DistilBERT reduce BERT-base a 6 capas y 66 millones de parámetros mediante destilación de conocimiento, manteniendo el vocabulario WordPiece en minúsculas y una ventana de 512 tokens. El ajuste fino se realizó sobre el modelo completo, con una tasa de aprendizaje de 5e-05 y 4 épocas seleccionadas a partir de las filas de validación.

El corpus de entrenamiento consta de 400 mensajes muestreados con semilla fija del split de entrenamiento de 720 filas de un total de 1.200 mensajes inventados. La división es 60/20/20, lo que deja 240 mensajes para prueba. No se documenta el uso de RLHF, DPO ni técnicas de alineación adicionales; se trata de un ajuste fino supervisado convencional sobre etiquetas de cuatro clases. La innovación técnica es nula más allá del uso de destilación como base eficiente.

## Capacidades

- Clasificación de texto corto en cuatro categorías cerradas: billing, bike_fault, station y account.
- Asignación de una única etiqueta por mensaje, sin salida de probabilidad calibrada documentada.
- Funcionamiento en inglés exclusivamente, según la model card y los tags del repositorio.
- Inferencia ligera: 66,9 millones de parámetros y un repositorio de 0,3 GB permiten ejecución en CPU y GPU de gama baja.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No dispone de modo thinking, visión, audio ni generación de texto libre.
- No se ha evaluado en mensajes reales de soporte, solo en datos sintéticos y en 40 mensajes propios del autor.

## Casos de uso

- Clasificación de tickets de soporte en un prototipo: el modelo asignaría una cola sugerida a mensajes cortos de hasta 512 tokens, con confirmación humana posterior. Es adecuado por su bajo coste computacional y su licencia permisiva.
- Línea base en experimentos de clasificación de texto: sirve para comparar un transformer destilado frente a TF-IDF con regresión logística en tareas de pocas clases y corpus pequeños.
- Enrutamiento previo en un flujo de atención al cliente simulado: puede integrarse como primer filtro en un pipeline de pruebas, siempre que un operador valide la etiqueta antes de actuar.
- Docencia y formación en NLP: el repositorio documenta el proceso de ajuste fino, la división de datos y las métricas, lo que lo convierte en un ejemplo reproducible para cursos de clasificación.
- Evaluación de robustez ante datos sintéticos: permite estudiar cómo se degrada un modelo entrenado con patrones repetidos cuando se enfrenta a mensajes reales.
- Despliegue en entornos con recursos limitados: con 66,9 millones de parámetros puede ejecutarse en CPU o en GPU de consumo para tareas de clasificación por lotes.

## Benchmarks y rendimiento

Los únicos datos publicados provienen de la model card y comparan el ajuste fino completo de DistilBERT con una línea base TF-IDF y un clasificador trivial de etiqueta mayoritaria, todos entrenados con las mismas 400 filas y evaluados en las mismas filas.

| Metodo | Accuracy (test, 240 mensajes) | Macro F1 (test) | Accuracy (40 mensajes propios) | Macro F1 (propios) |
|---|---|---|---|---|
| DistilBERT, ajuste fino completo | 0,883 | 0,885 | 0,925 | 0,925 |
| TF-IDF + regresión logística | 0,867 | 0,870 | 0,800 | 0,790 |
| Etiqueta más frecuente | 0,287 | 0,112 | 0,250 | 0,100 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor advierte que se trata de una sola semilla y un solo conjunto de prueba, por lo que las diferencias pequeñas no son fiables.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (66,9 millones de parámetros en fp32 ocupan aproximadamente 268 MB); en fp16, alrededor de 134 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tarjetas como RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Ejecución en CPU: viable para clasificación por lotes; el modelo es pequeño y no requiere acelerador dedicado.
- Opciones de despliegue: Transformers con PyTorch, ONNX Runtime, o exportación a formatos ligeros; no se documenta compatibilidad con vLLM, llama.cpp u Ollama, que están orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lakeshore ticket sorter (este modelo) | 66,9 M | 512 tokens | Clasificación de 4 colas | Apache 2.0 | Hugging Face |
| DistilBERT-base-uncased (modelo base) | 66,9 M | 512 tokens | Representación general y ajuste fino | Apache 2.0 | Hugging Face |
| BERT-base-uncased | 110 M | 512 tokens | Representación general y ajuste fino | Apache 2.0 | Hugging Face |
| TF-IDF + regresión logística (línea base del autor) | no aplica | no aplica | Clasificación de 4 colas | no aplica | Implementación propia |

La comparativa se limita a arquitecturas y líneas base mencionadas en la información disponible; no se han publicado comparaciones con otros modelos ajustados para la misma tarea.

## Limitaciones y advertencias

- Los datos de entrenamiento son inventados y repiten un conjunto reducido de patrones de frase; los clientes reales escribirán de forma distinta.
- Aproximadamente uno de cada ocho mensajes del corpus no indica su tema, por lo que ningún modelo puede acertar todas las etiquetas.
- El modelo solo conoce cuatro colas y no se ha probado con mensajes reales de soporte.
- El autor lo describe como proyecto didáctico y no debe enrutar mensajes reales de clientes sin revisión humana.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificación errónea fuera de distribución.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse con datos sintéticos, puede reproducir los patrones y sesgos de ese corpus.
- Limitación de idioma: solo inglés; no se ha evaluado en castellano ni en otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la ausencia de validación con datos reales desaconseja su uso en producción sin un conjunto de evaluación propio.
- Los resultados se basan en una sola semilla y un solo conjunto de prueba, por lo que la variabilidad no está cuantificada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Gaelletheresa/lakeshore-ticket-sorter
- Modelo base DistilBERT: https://huggingface.co/distilbert/distilbert-base-uncased
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
