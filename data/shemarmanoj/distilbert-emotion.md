# shemarmanoj/distilbert-emotion

## Resumen

`shemarmanoj/distilbert-emotion` es un ajuste fino de `distilbert/distilbert-base-uncased` publicado en HuggingFace por el usuario shemarmanoj, orientado a clasificación de texto (pipeline `text-classification`). El repositorio se generó automáticamente con `Trainer` de Transformers y la model card no ha sido completada por el autor: no se documenta el conjunto de datos de entrenamiento, el número ni el nombre de las etiquetas de emoción, los idiomas ni los usos previstos. El modelo es, por tanto, un artefacto de tamaño reducido (66.958.086 parámetros según el fichero safetensors, repo de 0,5 GB) cuya única información verificable de rendimiento es la métrica de validación declarada: accuracy 0,937 y loss 0,1442 tras 2 epochs.

Su relevancia práctica es limitada y muy condicionada: sirve como ejemplo de fine-tuning ligero de DistilBERT para clasificación de emociones, o como punto de partida para reevaluar y reentrenar, pero no como componente listo para producción sin auditoría previa. La licencia Apache 2.0 y el formato safetensors facilitan su uso y redistribución, y el tamaño permite inferencia en CPU o en GPUs de gama baja. Cualquier despliegue real debería venir precedido de una evaluación propia sobre datos del dominio objetivo, dado que se desconoce el dataset de entrenamiento y las clases reales del clasificador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, derivado de `distilbert-base-uncased`) |
| Parametros totales | 66.958.086 (dato del fichero safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (límite arquitectónico del modelo base; no documentado en la model card) |
| Tipos de cuantizacion | no documentados por el autor; al ser un transformer encoder estándar admite cuantización dinámica INT8 (ONNX Runtime / PyTorch) y exportación a GGUF, sin valores publicados |
| Idiomas soportados | no disponible (la model card no los documenta; el base es `uncased` en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 0,5 GB, compatible con `transformers` y `text-embeddings-inference`) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de DistilBERT, la variante destilada de BERT que reduce la red a 6 capas con hidden size 768, 12 cabezas de atención y aproximadamente 66 millones de parámetros, es decir, en torno al 40 % menos de parámetros que BERT-base. La destilación del modelo original se realizó combinando las pérdidas de destilación, MLM y similitud coseno de estados ocultos, y se entrenó sobre Wikipedia y Toronto BookCorpus; el modelo base es `uncased`, por lo que normaliza a minúsculas y elimina acentos. Sobre esa base se ha añadido una cabeza de clasificación de secuencias para la tarea de emociones, cuyos detalles (número de clases, mapeo de etiquetas) no aparecen en el repositorio.

El entrenamiento documentado es mínimo: learning rate 5e-05, batch de 64 en train y eval, semilla 42, optimizador AdamW fused (`betas=(0.9, 0.999)`, `epsilon=1e-08`), scheduler lineal y 2 epochs, con 250 pasos por epoch (500 pasos totales). La model card indica explícitamente que el dataset es desconocido ("on an unknown dataset") y no describe si hubo aumento de datos, balanceo de clases, RLHF/DPO (no aplicable en una tarea de clasificación) ni validación cruzada. Versiones declaradas: Transformers 5.20.2, PyTorch 2.11.0+cu130, Datasets 4.8.5, Tokenizers 0.23.3. No se documenta ninguna innovación técnica adicional (atención lineal, decodificación especulativa, etc.), algo esperable en un encoder de clasificación.

## Capacidades

- Clasificación de texto por secuencia completa (pipeline `text-classification`), presumiblemente orientada a etiquetas de emoción, aunque el conjunto de etiquetas no está documentado.
- Salida de logits/probabilidades por clase vía `AutoModelForSequenceClassification`, apta para umbrales y ranking.
- Procesamiento de textos de hasta 512 tokens; secuencias más largas requieren truncado o troceado manual.
- Inferencia muy rápida y con huella de memoria mínima, adecuada para alto volumen en CPU.
- Compatible con `text-embeddings-inference` y con endpoints tipo HuggingFace (tag `endpoints_compatible`).
- No soporta tool calling ni function calling: es un encoder de clasificación, no un modelo generativo.
- No soporta agentes, razonamiento multi-paso, matemáticas ni generación de código.
- Sin capacidades de visión, audio ni modo "thinking".
- Multilingüismo: no garantizado; el base es un modelo en inglés sin casing.

## Casos de uso

- Enrutado de tickets de soporte: usar la probabilidad de la clase predicha como señal para priorizar quejas frente a consultas neutras, con umbral de confianza y derivación a humano cuando la probabilidad máxima sea baja.
- Moderación de comentarios en comunidades: clasificar el tono emocional de mensajes y activar revisión en las clases negativas o de alta intensidad, con el modelo ejecutándose en CPU dentro del propio backend.
- Análisis de sentimiento en encuestas internas: procesar respuestas abiertas por lotes (batch 64, como en evaluación) y agregar distribuciones de emoción por equipo o periodo.
- Etiquetado asistido para curación de datasets: preetiquetar grandes volúmenes de texto y reservar la revisión humana para los casos de baja confianza, aprovechando el bajo coste por inferencia del modelo.
- Señal auxiliar en un pipeline RAG o de atención al cliente: detectar frustración en el turno del usuario y ajustar la respuesta del modelo generativo o escalar a un agente humano.
- Filtro previo en investigación académica: cribar corpus de texto (reseñas, redes, entrevistas) para seleccionar subconjuntos con carga emocional antes de un análisis cualitativo.
- Prototipado y docencia: servir de ejemplo reproducible de fine-tuning de DistilBERT con `Trainer`, útil para comparar hiperparámetros o como baseline interna antes de invertir en modelos mayores.

## Benchmarks y rendimiento

La model-index del repositorio está vacía (`results: []`), por lo que no hay benchmarks estandarizados (MMLU, GLUE, etc.). Los únicos datos disponibles son las métricas del conjunto de evaluación declaradas por el autor:

| Metrica | Epoca 1 (paso 250) | Epoca 2 (paso 500) |
|---|---|---|
| Validation loss | 0,1936 | 0,1442 |
| Accuracy | 0,928 | 0,937 |
| Training loss | no registrada | 0,3380 |

No se especifica el tamaño ni la composición del conjunto de evaluación, ni el número de clases, por lo que la accuracy de 0,937 no es interpretable frente a un baseline trivial (por ejemplo, la clase mayoritaria). No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos en FP32: ~268 MB; en FP16/BF16: ~134 MB; en INT8: ~67 MB. El repo completo ocupa 0,5 GB.
- VRAM estimada para inferencia: por debajo de 1 GB incluso con batch 64 y secuencias de 512 tokens en FP32; en la práctica, menos de 500 MB adicionales a los pesos.
- Cabe holgadamente en cualquier GPU consumer: GTX 1650, RTX 3060, RTX 4060, RTX 4090, así como en iGPU y en CPU.
- GPU de datacenter (A100, H100) innecesarias; el modelo está limitado por latencia, no por cómputo.
- Despliegue: `transformers` (PyTorch), `text-embeddings-inference`, ONNX Runtime (con cuantización dinámica INT8), TorchServe o un microservicio FastAPI propio; `llama.cpp`/Ollama y vLLM no son la vía natural para un encoder de clasificación, aunque existan conversiones.
- Latencia y throughput: no disponibles (no publicados por el autor); por el tamaño, es esperable un régimen de milisegundos por lote en CPU moderna, pero debe medirse en el hardware objetivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `shemarmanoj/distilbert-emotion` | 66,96 M | 512 tokens | Clasificación de emociones (etiquetas no documentadas) | apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| `bhadresh-savani/distilbert-base-uncased-emotion` | ~67 M | 512 tokens | Clasificación de emociones (6 clases Ekman, documentadas) | no verificada en esta ficha | HuggingFace, ampliamente usado |
| `j-hartmann/emotion-english-distilroberta-base` | ~82 M | 512 tokens | Clasificación de emociones (7 clases) | no verificada en esta ficha | HuggingFace, con model card detallada |
| `distilbert-base-uncased` (base sin ajustar) | ~67 M | 512 tokens | MLM / extracción de features | apache-2.0 | HuggingFace |

La diferencia principal frente a las alternativas no es de arquitectura ni de tamaño, sino de documentación y trazabilidad: los modelos comparados publican clases, dataset y evaluación, mientras que este repositorio no. El rendimiento relativo no puede establecerse sin reevaluar los tres sobre el mismo conjunto.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: imposible saber la distribución de clases, el dominio, el idioma ni el posible ruido de etiquetas; la accuracy de 0,937 no es extrapolable a otros datos.
- Etiquetas no documentadas: `id2label`/`label2id` pueden contener nombres genéricos (`LABEL_0`, etc.), lo que obliga a inspeccionar `config.json` antes de usar las predicciones.
- Riesgo de sesgos heredados del corpus del modelo base (Wikipedia y BookCorpus, en inglés), con infrarrepresentación de registros dialectales, coloquiales y de otros idiomas.
- Ámbito limitado a inglés `uncased`: en castellano el rendimiento no está validado y la normalización sin acentos ni mayúsculas degrada matices.
- Límite estricto de 512 tokens: los textos largos deben truncarse o agregarse, con la consiguiente pérdida de contexto emocional.
- Riesgo de falsos positivos y negativos en emociones sutiles, sarcasmo e ironía, propio de los clasificadores de emociones de este tamaño.
- Sin métricas por clase (precision, recall, F1) ni matriz de confusión: no se puede evaluar el desequilibrio entre emociones.
- Repositorio con 0 descargas y 0 likes, creado el 2026-10-25: sin evidencia de uso, revisión comunitaria ni mantenimiento.
- Licencia Apache 2.0 permite uso comercial y redistribución, pero no exime de la responsabilidad legal y ética sobre las decisiones automatizadas tomadas con el modelo (por ejemplo, moderación).
- La model card es una plantilla autogenerada sin revisar; no debe tomarse como documentación fiable de uso previsto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shemarmanoj/distilbert-emotion
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Documentación de `AutoModelForSequenceClassification`: https://huggingface.co/docs/transformers/model_doc/distilbert
- Documentación de text-embeddings-inference: https://huggingface.co/docs/text-embeddings-inference
- Las busquedas web realizadas no devolvieron ningun enlace relevante al modelo: los resultados obtenidos no guardaban relacion con la ficha y se han descartado.
