# belfidi/distilbert-intent-bitext

## Resumen

DistilBERT intent classifier es un modelo de clasificación de texto obtenido mediante fine-tuning de `distilbert-base-uncased` sobre el dataset Bitext Customer Support, orientado al reconocimiento de intenciones en atención al cliente. Lo desarrolla el usuario belfidi en el marco de un proyecto universitario de la IU International University of Applied Sciences (asignatura DLBAIBEPNBACSA01), y se publica en Hugging Face sin licencia declarada. El modelo reduce las 27 intenciones originales de Bitext a 6 categorías agregadas: gestión de cuenta, facturación y pagos, quejas y servicio, seguimiento de pedidos, consultas de producto y reembolsos o cancelaciones.

Arquitectónicamente es un transformer encoder de tipo DistilBERT, con 66.958.086 parámetros totales y un tamaño de repositorio de 0,3 GB en formato safetensors. No es un modelo generativo: emite una etiqueta entre seis clases a partir de una secuencia de entrada, con una longitud máxima de entrenamiento de 64 tokens. Su relevancia es acotada y práctica: sirve como componente de enrutamiento en pipelines de atención al cliente, como baseline reproducible para experimentos de clasificación de intenciones y como ejemplo docente de fine-tuning supervisado sobre datos sintéticos.

El dato más llamativo es su métrica de validación: 99,96 % de accuracy con solo 2 errores sobre 5.375 ejemplos. El propio autor advierte de que las utterances de Bitext son sintéticas y muy regulares, por lo que esas cifras sobrestiman el rendimiento sobre mensajes reales de clientes. Cualquier evaluación en producción debe hacerse con datos propios antes de asumir ese nivel de precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilación de BERT-base) |
| Parametros totales | 66.958.086 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens máximo arquitectónico; entrenado con `max_length=64` |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin variantes cuantizadas) |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `distilbert-base-uncased`, un transformer encoder de 6 capas obtenido por destilación de BERT-base, con tokenizador WordPiece en minúsculas y vocabulario de 30.522 tokens. Sobre esa base se añade una cabeza de clasificación de 6 clases. El fine-tuning se realizó sobre el Bitext Customer Support LLM Chatbot Training Dataset, con 26.872 utterances, aplicando normalización de URLs a `<URL>` y de menciones a `<USER>`. El split fue estratificado 80/20 con `random_state=42`, y el conjunto de validación resultante tiene 5.375 ejemplos.

Los hiperparámetros de entrenamiento fueron 3 épocas, learning rate 2e-5, batch size 16, `max_length=64` y semilla 42. No se documenta uso de RLHF, DPO ni ninguna técnica de alineación, algo esperable en un clasificador. Tampoco se detalla composición lingüística más allá del inglés ni se especifica si hubo aumento de datos. La innovación técnica es mínima por diseño: se trata de un fine-tuning estándar de clasificación supervisada, y su valor está en la trazabilidad del pipeline (mapeo explícito de 27 intenciones a 6 clases y baseline TF-IDF comparado) más que en aportaciones arquitectónicas.

## Capacidades

- Clasificación de intención en 6 categorías: `account_management`, `billing_payment`, `complaint_service`, `order_tracking`, `product_inquiry` y `refund_cancellation`.
- Salida de logits por clase vía `pipeline("text-classification")`, con posibilidad de umbral de confianza y `top_k`.
- Procesamiento de utterances cortas en inglés, típicas de chat de soporte (hasta 64 tokens efectivos en entrenamiento).
- Normalización previa de entidades: el modelo fue entrenado con URLs y menciones enmascaradas, por lo que generaliza mejor si se aplica el mismo preprocesado.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso ni modo thinking.
- No tiene capacidades de visión, audio ni multimodalidad.
- No es un modelo multilingüe: solo inglés.
- Compatible con Text Embeddings Inference y con endpoints compatibles según los tags del repositorio.

## Casos de uso

- Enrutamiento de tickets en mesa de ayuda: clasificar cada mensaje entrante en una de las 6 categorías y asignarlo al equipo correspondiente (facturación, logística, reclamaciones), reduciendo el tiempo de triaje manual.
- Chatbot de primera línea con derivación: usar la etiqueta predicha para seleccionar el flujo de respuesta o el agente humano adecuado, aprovechando la baja latencia de un encoder de 66 M de parámetros.
- Etiquetado y priorización de bandejas de correo: procesar lotes de correos de clientes y agrupar por intención para detectar picos de reclamaciones o de solicitudes de reembolso.
- Baseline en experimentos de NLP: servir como referencia reproducible (con split y semilla documentados) frente a modelos mayores o enfoques de zero-shot en tareas de clasificación de intenciones.
- Filtro previo en pipelines RAG de soporte: clasificar la consulta antes de recuperar documentación, restringiendo la búsqueda al conjunto de artículos asociado a la intención detectada.
- Docencia y validación de pipelines de fine-tuning: ejemplo completo de entrenamiento, evaluación con macro-F1 y comparación contra un baseline TF-IDF + regresión logística.
- Moderación de colas de cancelación: detectar solicitudes de `refund_cancellation` para activar políticas de retención o de devolución de forma automática.

## Benchmarks y rendimiento

Evaluación reportada por el autor sobre el conjunto de validación (n = 5.375):

| Modelo | Accuracy | Errores | Macro-F1 |
|---|---|---|---|
| Este modelo (DistilBERT fine-tuned) | 99,96 % | 2 | 0,9995 |
| TF-IDF + regresión logística (baseline) | 99,74 % | 14 | 0,9974 |

No se han publicado resultados de benchmarks estándar (MMLU, GLUE, etc.) en la información disponible. El autor advierte explícitamente de que el dataset es sintético y muy regular, por lo que estas cifras no son extrapolables a mensajes reales de clientes.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,27 GB solo de pesos (66,96 M de parámetros), más activaciones y overhead del runtime; en la práctica cabe holgadamente en menos de 1 GB.
- En fp16 la huella de pesos baja a unos 0,13 GB; el modelo es trivial para cualquier GPU moderna.
- GPU recomendadas: no requiere GPU dedicada. Funciona en CPU con latencia de milisegundos por utterance; para alto throughput, cualquier GPU consumer sirve (RTX 3060, RTX 4090, T4, L4).
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU (contenedores CPU, funciones serverless).
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, Text Embeddings Inference (tag declarado), endpoints compatibles, ONNX Runtime u otras rutas de exportación estándar para encoders.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera un throughput alto en lote sobre GPU y suficiente para tiempo real en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| belfidi/distilbert-intent-bitext | 66,96 M | 512 (entrenado a 64) | Clasificación de intención, 6 clases, inglés | no disponible | Hugging Face |
| distilbert-base-uncased | 66,96 M | 512 | Encoder base, sin cabeza de clasificación | Apache 2.0 (modelo base de referencia) | Hugging Face |
| Baseline TF-IDF + regresión logística (del propio autor) | no aplica | no aplica | Clasificación de intención, 6 clases | no disponible | Resultados reportados en la model card |

No se dispone de información sobre otros clasificadores de intención comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Las métricas de validación (99,96 % de accuracy) proceden de un dataset sintético y altamente regular; el rendimiento real sobre mensajes de clientes será previsiblemente inferior.
- Las consultas fuera de alcance pueden asignarse a una de las seis clases con alta confianza; no hay clase de rechazo ni mecanismo de abstención documentado.
- Solo inglés: no cubre otros idiomas ni variantes dialectales.
- Longitud efectiva de entrenamiento de 64 tokens; entradas más largas pueden degradar la clasificación aunque el encoder admita hasta 512.
- Licencia no declarada: no hay autorización explícita para uso comercial, lo que es un riesgo legal para producción.
- Sin datos publicados sobre sesgos demográficos o lingüísticos; el dataset de origen es sintético y no representa la distribución real de clientes.
- Riesgo de sobreajuste a los patrones de plantilla de Bitext y de mala generalización ante paráfrasis, errores ortográficos o jerga.
- Proyecto universitario con 0 descargas y 0 likes en el momento de la consulta: sin mantenimiento ni validación comunitaria.
- El mapeo de 27 intenciones a 6 clases pierde granularidad; intenciones originales distintas pueden colapsar en la misma categoría.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/belfidi/distilbert-intent-bitext
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Dataset de entrenamiento: https://huggingface.co/datasets/bitext/Bitext-customer-support-llm-chatbot-training-dataset
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Paper de BERT (Devlin et al., 2018): https://arxiv.org/abs/1810.04805
