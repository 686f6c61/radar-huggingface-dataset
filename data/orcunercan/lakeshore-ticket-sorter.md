# ORCUNERCAN/lakeshore-ticket-sorter

## Resumen

Lakeshore ticket sorter es un modelo de clasificación de texto basado en DistilBERT, afinado por el usuario ORCUNERCAN para ordenar mensajes breves de soporte de un servicio de bicicletas compartidas en cuatro colas: facturación, avería de bicicleta, estación y cuenta. El modelo parte de `distilbert/distilbert-base-uncased` y se distribuye con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Se trata de un proyecto de curso (AIGC 5005, Lab 09) y no de un sistema listo para producción. El autor lo presenta explícitamente como una sugerencia para el equipo de soporte, que sigue revisando cada mensaje manualmente. El conjunto de entrenamiento son 300 mensajes inventados extraídos de `tickets_data.py`, muestreados de forma estratificada de 720 filas con semilla 42, y los hiperparámetros se eligieron sobre 240 filas de validación.

Con 66.956.548 parámetros y un repositorio de 0,3 GB, el modelo es ligero y puede ejecutarse en CPU o en GPU de consumo. Su relevancia es limitada: sirve como ejemplo didáctico de fine-tuning de un encoder pequeño para clasificación multietiqueta cerrada, no como referencia técnica de vanguardia. El contexto efectivo es muy corto (64 tokens) y solo cubre inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas, destilado de BERT-base) |
| Parametros totales | 66.956.548 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 64 tokens (truncado declarado por el autor) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; admite cuantizacion dinamica estandar de PyTorch, no documentada por el autor) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un DistilBERT-base-uncased con una cabeza de clasificación de 4 clases. DistilBERT es un transformer encoder de 6 capas y 66 millones de parámetros, destilado de BERT-base, con atención bidireccional completa y vocabulario WordPiece de 30.522 tokens. La tarea es clasificación de secuencia única con truncado a 64 tokens.

El entrenamiento se realizó sobre 300 mensajes sintéticos muestreados de forma estratificada de un conjunto de 720 filas (`tickets_data.py`, semilla 42). La selección de hiperparámetros se hizo sobre 240 filas de validación y la evaluación final sobre 240 filas de test. Aproximadamente uno de cada ocho mensajes no aporta información sobre su tema, lo que introduce ruido deliberado en las etiquetas. No se documenta el uso de RLHF, DPO ni aumentación de datos, ni se detalla el número de épocas, la tasa de aprendizaje o el tamaño de batch.

## Capacidades

- Clasificación de texto en inglés en cuatro categorías cerradas: `billing`, `bike_fault`, `station` y `account`.
- Asignación de una única etiqueta por mensaje, incluso cuando el texto es ambiguo o no informativo.
- Procesamiento de mensajes cortos (hasta 64 tokens), adecuado para tickets de soporte de una o dos frases.
- Inferencia ligera en CPU o GPU de consumo gracias a sus 66,9 millones de parámetros.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No soporta generación de texto, código, matemáticas, visión ni audio.
- No soporta otros idiomas distintos del inglés.

## Casos de uso

- Triaje de tickets de soporte en bicicletas compartidas: el modelo asigna cada mensaje entrante a una de las cuatro colas para que el equipo humano lo revise con prioridad. Es adecuado por su latencia baja y su tamaño reducido, aunque el autor advierte que es una sugerencia, no una decisión automática.
- Prototipado rápido de clasificadores de texto: sirve como punto de partida para experimentar con fine-tuning de DistilBERT en tareas de clasificación cerrada con pocos datos (300 ejemplos).
- Filtrado previo en un pipeline de atención al cliente: puede etiquetar mensajes antes de pasarlos a un modelo mayor o a un agente, reduciendo el coste computacional del sistema completo.
- Docencia y evaluación de metodologías: útil como caso de estudio de comparación entre baseline mayoritario, TF-IDF con regresión logística y fine-tuning de transformer sobre el mismo conjunto de datos.
- Clasificación de mensajes en entornos con recursos limitados: al caber en CPU, puede desplegarse en contenedores pequeños o en el edge para preetiquetar formularios de contacto.
- Análisis exploratorio de quejas: permite agrupar mensajes históricos por categoría para detectar qué tipo de incidencia domina en un periodo, siempre con revisión humana posterior.

## Benchmarks y rendimiento

Resultados publicados por el autor, evaluados sobre las mismas 240 filas de test y entrenados sobre los mismos 300 mensajes:

| Metodo | Accuracy | Macro F1 |
|---|---|---|
| Etiqueta mas frecuente (baseline) | 0,292 | 0,113 |
| TF-IDF + regresion logistica | 0,838 | 0,837 |
| DistilBERT, fine-tuning completo | 0,896 | 0,898 |

Adicionalmente, el autor reporta 0,775 de accuracy sobre 40 mensajes escritos por él mismo, fuera del conjunto sintético. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (66,9 millones de parámetros, aproximadamente 268 MB de pesos) más el overhead de activaciones, que es despreciable con secuencias de 64 tokens.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; no requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier RTX (incluso series GTX 10xx), así como en iGPU y en CPU.
- Opciones de despliegue: PyTorch con `transformers` (`AutoModelForSequenceClassification`), ONNX Runtime, TorchScript, y servidores de inferencia ligeros. No se documenta soporte nativo en vLLM, llama.cpp ni Ollama, que están orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia de milisegundos en CPU y throughput de miles de peticiones por segundo en GPU, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Tarea | Disponibilidad |
|---|---|---|---|---|---|
| Lakeshore ticket sorter (este) | 66,9 M | 64 tokens | Apache 2.0 | Clasificacion 4 clases en ingles | Hugging Face |
| distilbert-base-uncased (base) | 66,9 M | 512 tokens | Apache 2.0 | Modelo base sin cabeza de clasificacion | Hugging Face |
| bert-base-uncased | 110 M | 512 tokens | Apache 2.0 | Modelo base sin cabeza de clasificacion | Hugging Face |
| TF-IDF + regresion logistica (baseline del autor) | no aplica | no aplica | no aplica | Clasificacion 4 clases en ingles | Implementacion local |

La comparación relevante es con el baseline TF-IDF, que obtiene 0,838 de accuracy frente a 0,896 del transformer, una mejora de 5,8 puntos porcentuales a cambio de un coste de inferencia mayor. Frente a BERT-base, este modelo tiene un 39 % menos de parámetros y mantiene la licencia permisiva. No se dispone de comparaciones con otros modelos afinados para la misma tarea.

## Limitaciones y advertencias

- Todos los textos de entrenamiento son inventados, por lo que las métricas probablemente sobreestiman el rendimiento sobre mensajes reales de clientes.
- El modelo solo conoce cuatro colas y debe elegir una incluso para mensajes vagos o sin información temática, lo que puede producir asignaciones erróneas silenciosas.
- Solo procesa inglés y trunca los mensajes a 64 tokens, por lo que pierde información en tickets largos.
- Es un proyecto de curso (AIGC 5005, Lab 09), no un sistema de producción; el autor recomienda revisión humana de cada mensaje.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificación errónea con alta confianza en textos fuera de distribución.
- No se documentan sesgos demográficos ni lingüísticos específicos; al entrenar con datos sintéticos, cualquier sesgo presente en la generación de esos datos se hereda sin control.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución con atribución, sin restricciones adicionales conocidas.
- No se documenta calibración de probabilidades ni umbral de confianza para derivar a revisión humana, algo necesario en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ORCUNERCAN/lakeshore-ticket-sorter
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Paper de BERT (Devlin et al., 2018): https://arxiv.org/abs/1810.04805
