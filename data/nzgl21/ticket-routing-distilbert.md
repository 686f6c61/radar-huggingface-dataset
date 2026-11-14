# nzgl21/ticket-routing-distilbert

## Resumen

`nzgl21/ticket-routing-distilbert` es un modelo de clasificación de texto obtenido mediante ajuste fino de DistilBERT sobre el conjunto de datos Banking77, orientado a la clasificación de intenciones y al enrutamiento automático de tickets de soporte en el dominio bancario. Lo publica el usuario nzgl21 (sin organización detrás identificable en la información disponible) y resuelve un problema muy concreto en producción: asignar cada consulta entrante de un cliente a una de 77 categorías de intención predefinidas, de modo que un microservicio pueda derivarla al departamento correcto sin intervención humana.

Arquitectura transformer encoder de tipo DistilBERT, con 67.012.685 parámetros totales y un tamaño de repositorio de 0,3 GB. Está entrenado únicamente en inglés y su licencia es Apache 2.0, lo que facilita su integración comercial. La relevancia actual reside en su perfil de coste: es un modelo pequeño (~67 M de parámetros) que alcanza un Macro F1 de 0,9175 en el conjunto de test oficial de Banking77, un rendimiento cercano al de alternativas mucho más grandes para una tarea acotada de clasificación.

No se dispone de información sobre el desarrollador más allá del identificador de Hugging Face, ni de detalles sobre el proceso de entrenamiento (hiperparámetros, épocas, composición exacta del dataset más allá de Banking77).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilación de BERT-base) |
| Parametros totales | 67.012.685 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (DistilBERT base soporta hasta 512 tokens; no confirmado por el autor) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización dinámica posible vía herramientas estándar, no documentada por el autor) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `distilbert/distilbert-base-uncased`, un transformer encoder de 6 capas obtenido por destilación de conocimiento desde BERT-base, y se ajusta de forma completa (full fine-tuning) para una tarea de clasificación con 77 etiquetas correspondientes a las intenciones de Banking77. La cabeza de clasificación se entrena sobre el conjunto PolyAI/banking77, que contiene consultas reales de clientes bancarios etiquetadas por intención.

La model card compara explícitamente tres estrategias de ajuste: una línea base TF-IDF + regresión logística + Bayes (Macro F1 0,8901), DistilBERT con LoRA (r=32, ~1,8 M parámetros entrenables, Macro F1 0,9132) y DistilBERT con ajuste fino completo (66,9 M parámetros, Macro F1 0,9175). El ajuste completo supera ligeramente a LoRA en F1 y accuracy, a costa de entrenar todos los parámetros. No se documentan en la información disponible el número de épocas, la tasa de aprendizaje, el tamaño de batch ni si se aplicaron técnicas de regularización o aumento de datos. Tampoco consta el uso de RLHF ni DPO, algo esperable en un modelo de clasificación.

## Capacidades

- Clasificación de intenciones en texto de soporte al cliente bancario en una de 77 categorías (por ejemplo, `card_payment_fee_charged`, `lost_or_stolen_card`, `refund_not_showing_up`).
- Enrutamiento automático de tickets a departamentos o colas de atención.
- Salida de probabilidad por clase (score de confianza) apta para umbrales de derivación a revisión humana.
- Procesamiento de consultas cortas de una sola frase o párrafo breve, típicas de tickets y chats.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo thinking, visión, audio ni generación de texto libre.
- Capacidad monolingüe: solo inglés; no se ha entrenado ni evaluado en castellano.

## Casos de uso

- Enrutamiento de tickets en un contact center bancario: el modelo clasifica cada consulta entrante en una de las 77 intenciones y un orquestador la asigna a la cola adecuada (tarjetas, transferencias, fraude, comisiones), reduciendo el tiempo de primera asignación.
- Triaje previo a agentes humanos: con el score de confianza devuelto, las predicciones por debajo de un umbral se derivan a revisión manual, mientras las de alta confianza se enrutan automáticamente.
- Clasificación en microservicios de bajo coste: con 67 M de parámetros y pesos safetensors de ~0,3 GB, puede servirse en CPU o en una GPU pequeña dentro del mismo clúster que el resto de servicios, sin depender de un LLM externo.
- Etiquetado y análisis de conversaciones históricas: procesar en lote transcripciones o correos para construir métricas de volumen por tipo de incidencia y detectar picos de consultas sobre un producto concreto.
- Filtro de seguridad y priorización: detectar intenciones sensibles como tarjeta perdida o robada (`lost_or_stolen_card`) y elevar la prioridad del ticket en la cola.
- Enrutamiento en asistentes conversacionales: usar la intención predicha para seleccionar el flujo de diálogo o la base de conocimiento que debe activar un chatbot, antes de invocar un modelo generativo.
- Anonimización y preprocesado en pipelines de datos: clasificar tickets antes de almacenarlos en un data lake etiquetado por intención, facilitando búsquedas y análisis posteriores.

## Benchmarks y rendimiento

Evaluación sobre el conjunto de test oficial de Banking77 (3.080 muestras), según la model card:

| Métrica | Valor |
|---|---|
| Macro F1 (test) | 0,9175 |
| Accuracy (test) | 0,9175 |
| Precisión macro (test) | 0,9209 |
| Recall macro (test) | 0,9175 |
| Pérdida (test) | 0,3478 |

Comparativa con líneas base reportada por el autor:

| Enfoque | Parámetros entrenables | Macro F1 | Accuracy | Pérdida |
|---|---|---|---|---|
| TF-IDF + LogReg + Bayes | no aplica | 0,8901 | no disponible | no disponible |
| DistilBERT + LoRA (r=32) | ~1,8 M (~2,6 %) | 0,9132 | 0,9133 | 0,3189 |
| DistilBERT full fine-tuning | 66,9 M (100 %) | 0,9175 | 0,9175 | 0,3478 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,27 GB solo para pesos (67 M × 4 bytes), más activaciones y overhead del runtime; en la práctica, menos de 1 GB.
- En FP16: alrededor de 0,14 GB de pesos; en INT8 dinámico, en torno a 0,07 GB.
- Cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4090, GTX 1660) e incluso en CPU para cargas moderadas.
- Despliegue posible con `transformers` (pipeline `text-classification`), TorchServe, ONNX Runtime, Triton Inference Server o Text Embeddings Inference; también es viable exportarlo a ONNX o a un runtime ligero para servicios de baja latencia.
- No se dispone de cifras de latencia o throughput medidas en la información proporcionada; por el tamaño del modelo, se espera un throughput alto en CPU y muy alto en GPU, pero no se aportan números concretos.
- Para lotes grandes en producción, el cuello de botella será el tokenizador y la red, no el modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Macro F1 Banking77 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| nzgl21/ticket-routing-distilbert | 67,0 M | no disponible | Clasificación de intenciones bancarias (77 clases) | 0,9175 | Apache 2.0 | Hugging Face |
| DistilBERT + LoRA (referencia del autor) | ~1,8 M entrenables sobre base de 67 M | no disponible | Igual | 0,9132 | Apache 2.0 (base) | Reproducible |
| TF-IDF + LogReg + Bayes (referencia del autor) | no aplica | no aplica | Igual | 0,8901 | no aplica | Implementación propia |
| BERT-base fine-tuned en Banking77 | ~110 M | 512 tokens | Igual | no disponible en la información | Apache 2.0 (base) | Múltiples variantes en Hugging Face |

No se dispone de datos verificados de otros modelos comparables publicados con métricas en Banking77 dentro de la información proporcionada; las filas de BERT-base se incluyen solo como referencia de categoría y sus cifras no deben tomarse como confirmadas.

## Limitaciones y advertencias

- Modelo monolingüe en inglés: no es adecuado para tickets en castellano sin un ajuste fino adicional o traducción previa.
- Dominio restringido a banca y a las 77 intenciones de Banking77; consultas fuera de ese catálogo se forzarán a una de las clases existentes, produciendo predicciones incorrectas con alta confianza.
- Riesgo de sesgo heredado de los datos de Banking77 y de DistilBERT-base-uncased: expresiones coloquiales, errores ortográficos o jerga no representada en el corpus pueden degradar la precisión.
- No hay información sobre calibración de probabilidades; el score devuelto no debe interpretarse directamente como probabilidad calibrada sin validación en el dominio de destino.
- El modelo tiene 0 descargas y 1 like en el momento de la consulta, y fue creado y actualizado el mismo día: no hay evidencia de uso en producción ni de validación externa.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías; conviene auditar el modelo en el dominio propio antes de desplegarlo.
- No se documentan limitaciones de longitud de entrada más allá de las del modelo base; secuencias muy largas se truncarán y pueden perder información relevante.
- No apto para generación de texto, razonamiento, código ni tareas fuera de la clasificación de intenciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nzgl21/ticket-routing-distilbert
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Dataset Banking77: https://huggingface.co/datasets/PolyAI/banking77
- Paper de DistilBERT: no disponible en la información proporcionada
- Repositorio o demo del autor: no disponible en la información proporcionada
