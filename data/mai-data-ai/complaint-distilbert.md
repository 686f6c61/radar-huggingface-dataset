# mai-data-ai/complaint-distilbert

## Resumen

`mai-data-ai/complaint-distilbert` es un modelo de clasificación de texto en inglés obtenido por fine-tuning de `distilbert-base-uncased` sobre el dataset público Consumer Complaints Dataset for NLP. Su tarea es asignar cada reclamación de un cliente a una de cinco categorías: `credit_card`, `credit_reporting`, `debt_collection`, `mortgages_and_loans` y `retail_banking`. Lo publica el usuario de Hugging Face `mai-data-ai` bajo licencia Apache 2.0.

Arquitectura DistilBERT: transformer encoder destilado de BERT-base, con 6 capas, 66.957.317 parámetros totales y una ventana de contexto limitada a 256 tokens según la configuración de entrenamiento declarada. El modelo es pequeño (repo de 0,3 GB en safetensors) y está pensado para inferencia de bajo coste en pipelines de triaje de reclamaciones, no para generación de texto ni razonamiento.

Es relevante por su especialización: frente a un clasificador genérico, se ha entrenado con partición estratificada 80/10/10, 3 épocas, learning rate 2e-5 y entropía cruzada ponderada por clase, y reporta un 85,5 % de accuracy y un macro-F1 de 0,845 sobre un conjunto de test de 12.430 reclamaciones. No obstante, el propio autor advierte de que el texto de entrada debe limpiarse exactamente igual que en entrenamiento (minúsculas, sin puntuación ni números, sin stop words, lematizado), lo que condiciona su uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder destilado de BERT-base, 6 capas) |
| Parámetros totales | 66.957.317 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (longitud máxima usada en entrenamiento) |
| Tipos de cuantización | no disponible (pesos en safetensors; admite cuantización estándar de PyTorch, no documentada por el autor) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un `DistilBertForSequenceClassification` con cabeza de clasificación de 5 clases sobre el encoder destilado de 6 capas. DistilBERT se entrena por destilación de conocimiento desde BERT-base, conservando aproximadamente el 97 % del rendimiento del profesor con un 40 % menos de parámetros, lo que se traduce en menor latencia y huella de memoria. No hay innovaciones adicionales documentadas por el autor (sin atención lineal, sin decodificación especulativa, sin módulos MoE).

Los datos de entrenamiento proceden del dataset de Kaggle Consumer Complaints Dataset for NLP, con 124.300 reclamaciones tras eliminar duplicados y etiquetas conflictivas. Se aplicó una partición estratificada 80/10/10, 3 épocas, learning rate 2e-5, entropía cruzada ponderada por clase y longitud máxima de 256 tokens. El preprocesado exigido incluye minúsculas, eliminación de puntuación y números, eliminación de stop words y lematización; el código de limpieza está en el repositorio de GitHub del autor. No se documenta RLHF, DPO ni ajuste adicional posterior.

## Capacidades

- Clasificación de texto multietiqueta única en 5 categorías de reclamaciones financieras: `credit_card`, `credit_reporting`, `debt_collection`, `mortgages_and_loans` y `retail_banking`.
- Inferencia de texto corto en inglés con ventana de hasta 256 tokens.
- Salida de logits por clase, utilizable para umbrales de confianza y revisión humana.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta generación de texto, código, matemáticas, visión ni audio.
- Capacidad multilingüe: no disponible; solo inglés.

## Casos de uso

- Triaje de reclamaciones en banca minorista: clasificar tickets entrantes en una de las cinco categorías para enrutarlos al equipo adecuado, con umbral de confianza para derivar a revisión manual los casos ambiguos.
- Enrutamiento en atención al cliente: integrar el clasificador como paso previo a un sistema de tickets (Zendesk, Jira Service Management) para etiquetar automáticamente cada reclamación antes de la asignación.
- Análisis de volumen por categoría: agregar las predicciones sobre lotes históricos de reclamaciones para medir la distribución de motivos (por ejemplo, porcentaje de `credit_reporting` frente a `debt_collection`) y priorizar recursos.
- Detección de temas emergentes: monitorizar la proporción de predicciones con baja confianza o de categorías en crecimiento para identificar cambios en el tipo de reclamaciones recibidas.
- Preetiquetado para anotación humana: usar el modelo como primer paso en un flujo de etiquetado supervisado, reduciendo el coste de anotación manual antes de un reentrenamiento.
- Filtrado previo en pipelines de cumplimiento: separar reclamaciones financieras de otros tipos de mensajes en un flujo de moderación o compliance, siempre con validación humana posterior.
- Prototipado rápido en entornos con recursos limitados: al ocupar 0,3 GB en safetensors y 67 M de parámetros, puede ejecutarse en CPU o en GPU consumer para pruebas de concepto sin infraestructura dedicada.

## Benchmarks y rendimiento

| Métrica | Valor | Conjunto |
|---|---|---|
| Accuracy | 85,5 % | Test held-out, 12.430 reclamaciones |
| Macro-F1 | 0,845 | Test held-out, 12.430 reclamaciones |

No se han publicado resultados comparativos con otros modelos en la información disponible. Los errores se concentran en la categoría `credit_reporting`, según el autor, por solapamiento entre categorías.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,27 GB solo para pesos (67 M de parámetros × 4 bytes), más activaciones y overhead del runtime; en la práctica, menos de 1 GB.
- En fp16: aproximadamente 0,13 GB para pesos; en int8, alrededor de 0,07 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; A100, H100, RTX 4090, RTX 3090, T4 y GPUs integradas son válidas. El modelo cabe holgadamente en cualquier GPU consumer, incluida una GTX 1650 o una iGPU con suficiente memoria compartida.
- Ejecución en CPU: viable para lotes pequeños; DistilBERT es adecuado para inferencia en CPU en producción de bajo volumen.
- Opciones de despliegue: Hugging Face `transformers` (PyTorch), `optimum` para exportación a ONNX, `text-embeddings-inference` no aplica (no es un modelo de embeddings), y `llama.cpp`/Ollama no aplican (no es un modelo generativo). Para serving de clasificación se recomienda `transformers` con `pipeline("text-classification")` o un servidor ONNX Runtime.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mai-data-ai/complaint-distilbert` | 66,9 M | 256 tokens | Clasificación de reclamaciones (5 clases) | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased` (base) | 66,9 M | 512 tokens | Modelo base, sin cabeza de clasificación específica | Apache 2.0 | Hugging Face |
| `bert-base-uncased` | 110 M | 512 tokens | Modelo base, sin cabeza de clasificación específica | Apache 2.0 | Hugging Face |
| `ProsusAI/finbert` | ~110 M | 512 tokens | Análisis de sentimiento financiero | Apache 2.0 | Hugging Face |

La comparación con `distilbert-base-uncased` y `bert-base-uncased` es estructural: comparten familia y licencia, pero este modelo añade una cabeza de 5 clases entrenada sobre un dataset concreto. No se dispone de resultados de benchmarks de este modelo frente a `ProsusAI/finbert` u otros clasificadores financieros en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: no se ha entrenado ni evaluado en otros idiomas.
- Ventana de 256 tokens: reclamaciones largas deben truncarse, lo que puede perder información relevante.
- Dependencia estricta del preprocesado: si el texto de entrada no se limpia igual que en entrenamiento (minúsculas, sin puntuación ni números, sin stop words, lematizado), el rendimiento puede degradarse de forma significativa.
- Solapamiento de categorías: el autor señala que la mayoría de errores implican `credit_reporting`; las fronteras entre clases no son nítidas.
- Riesgo de alucinación: no aplica en sentido generativo, pero sí existe riesgo de clasificación errónea con alta confianza en casos ambiguos o fuera de dominio.
- Sesgos: no documentados por el autor; el dataset de origen (Kaggle) puede contener sesgos de muestreo y de distribución geográfica o temporal no declarados.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar las condiciones del dataset de origen (Kaggle Consumer Complaints Dataset for NLP) antes de un despliegue en producción.
- Sin métricas de calibración ni curvas de confianza publicadas: no hay garantía de que los logits estén bien calibrados para umbrales automáticos.
- Sin datos de latencia ni throughput: no se puede dimensionar infraestructura a partir de la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/mai-data-ai/complaint-distilbert
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Dataset de entrenamiento: https://huggingface.co/datasets/shashwatwork/consume-complaints-dataset-fo-nlp
- Repositorio de código de preprocesado: no disponible en la información proporcionada
- Paper de DistilBERT: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
