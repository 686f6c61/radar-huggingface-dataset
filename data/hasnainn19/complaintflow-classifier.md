# hasnainn19/complaintflow-classifier

## Resumen

ComplaintFlow classifier es un modelo de clasificación de texto en inglés, obtenido mediante fine-tuning de ModernBERT-base sobre reclamaciones de consumidores financieros publicadas por la CFPB (Consumer Financial Protection Bureau de EE. UU.). Su tarea es asignar a cada reclamación una de 85 etiquetas que combinan producto e incidencia (por ejemplo, `Credit card | Fees or interest`), lo que lo convierte en un componente de triaje dentro del pipeline ComplaintFlow. El modelo resuelve un problema acotado pero operativamente relevante: enrutar automáticamente reclamaciones financieras hacia la categoría correcta y derivar a revisión humana los casos con baja confianza.

Técnicamente es un encoder transformer de 149,67 millones de parámetros con una cabeza de clasificación de secuencia (`ModernBertForSequenceClassification`). Trabaja con una longitud máxima de 512 tokens y se distribuye en dos formatos: pesos PyTorch en safetensors y un grafo ONNX a precisión completa pensado para inferencia en CPU con onnxruntime, que es el que utiliza el pipeline original.

Es relevante por tres motivos: parte de una arquitectura moderna (ModernBERT) con licencia Apache 2.0, ofrece un artefacto ONNX listo para producción en CPU con latencias medidas (mediana de 220 ms por reclamación en un escritorio), y documenta con transparencia sus métricas y limitaciones. No obstante, su alcance es estrecho: solo inglés, solo categorías CFPB y datos de entrenamiento limitados al primer semestre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT), con cabeza de clasificación de secuencia |
| Parametros totales | 149.670.229 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (entradas truncadas a 512) |
| Tipos de cuantizacion | no disponible (se distribuye a precisión completa; el artefacto ONNX es full precision) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch/transformers) y ONNX (`model.onnx`) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `answerdotai/ModernBERT-base`, un encoder transformer de tipo BERT modernizado. Sobre el encoder se añade una cabeza de clasificación que produce 85 logits, uno por cada par producto-incidencia. La tokenización se realiza con `tokenizer.json` (librería `tokenizers`) y las entradas se truncan a 512 tokens. La inferencia ONNX acepta `input_ids` y `attention_mask` como int64 (una fila por reclamación) y devuelve `logits`; aplicando softmax se obtiene la probabilidad de cada etiqueta, y la máxima actúa como confianza.

El entrenamiento se realizó sobre 97.407 reclamaciones con texto recibidas entre el 1 de enero y el 7 de junio de 2026, procedentes de la base de datos pública de reclamaciones de la CFPB. Las etiquetas son el producto y la incidencia originales de la CFPB, tras fusionar incidencias raras; solo los pares vistos en entrenamiento son respuestas posibles. La configuración fue de 2 épocas, batch size 16, learning rate 3e-5 con warmup del 6 % y decaimiento lineal, weight decay 0.01 y bfloat16, ejecutada en una única RTX 3060 en 67 minutos. No se documenta uso de RLHF ni DPO, lo cual es coherente con una tarea de clasificación supervisada.

## Capacidades

- Clasificación de texto en inglés en 85 clases que combinan producto financiero e incidencia (por ejemplo, `Credit card | Fees or interest`).
- Salida de logits por clase y, vía softmax, probabilidad de cada etiqueta; la probabilidad máxima funciona como puntuación de confianza.
- Umbral operativo de derivación: el pipeline ComplaintFlow envía a revisión humana las respuestas con confianza inferior a 0.30.
- Inferencia en CPU mediante ONNX Runtime, con equivalencia de respuestas respecto al modelo PyTorch.
- Inferencia en PyTorch/transformers mediante `ModernBertForSequenceClassification`.
- Compatibilidad con Text Embeddings Inference y endpoints (según etiquetas del repositorio).
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: es exclusivamente un clasificador.

## Casos de uso

- Triaje de reclamaciones financieras: cada reclamación entrante se clasifica en un par producto-incidencia y se enruta al equipo correspondiente; el umbral de confianza 0.30 permite derivar los casos ambiguos a revisión humana. Es el uso para el que fue entrenado y el que implementa ComplaintFlow.
- Enrutamiento en centros de atención al cliente: integrado en un formulario o bandeja de entrada, asigna automáticamente la categoría CFPB a cada mensaje para priorizar colas y reducir la clasificación manual.
- Análisis de volumen de reclamaciones: clasificar lotes históricos de la base de datos CFPB para agregar tendencias por producto e incidencia y detectar picos anómalos.
- Preetiquetado para anotación humana: usar las predicciones de alta confianza como etiquetas iniciales y reservar la revisión manual para las de baja confianza, acelerando la construcción de datasets etiquetados.
- Filtrado y monitorización de cumplimiento: detectar reclamaciones sobre productos o incidencias concretas (por ejemplo, comisiones o tipos de interés) para activar alertas internas.
- Despliegue ligero en CPU: al ejecutarse con ONNX Runtime a una mediana de 220 ms por reclamación en un escritorio, encaja en servicios sin GPU o en entornos con restricciones de hardware.
- Prototipado rápido de pipelines de clasificación de quejas: servir como línea base reproducible antes de invertir en modelos mayores o en anotación adicional.

## Benchmarks y rendimiento

| Datos | Reclamaciones | Precisión producto | Precisión incidencia | Macro-F1 incidencia |
|---|---|---|---|---|
| Split de validación (reclamaciones posteriores, no usadas en entrenamiento) | 11.932 | 0,855 | 0,612 | 0,513 |
| Muestra de evaluación de ComplaintFlow (held out) | 1.000 | 0,849 | 0,586 | 0,474 |

En la muestra de evaluación, el modelo ONNX produce las mismas respuestas que el modelo PyTorch y tarda una mediana de 220 ms por reclamación en una CPU de escritorio. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 149,67 M de parámetros, los pesos en bfloat16/fp16 ocupan aproximadamente 0,3 GB y en fp32 alrededor de 0,6 GB, a lo que se suma memoria de activaciones para secuencias de hasta 512 tokens.
- GPU recomendadas: el autor entrenó en una RTX 3060; para inferencia cualquier GPU consumer con 4 GB o más es suficiente en la práctica, aunque el artefacto principal está pensado para CPU.
- Cabe en GPU consumer: sí, con holgura (RTX 3060, RTX 4060, RTX 4090, etc.).
- Opciones de despliegue: ONNX Runtime (formato principal del pipeline), PyTorch con transformers (`ModernBertForSequenceClassification`), Text Embeddings Inference (según etiquetas del repositorio) y endpoints compatibles.
- Latencia y throughput: mediana de 220 ms por reclamación en CPU de escritorio con ONNX; no se documenta throughput agregado ni latencias en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ComplaintFlow classifier | 149,67 M | 512 tokens | Clasificación de reclamaciones CFPB (85 clases) | Apache 2.0 | Hugging Face (safetensors + ONNX) |
| answerdotai/ModernBERT-base | no disponible en la información | no disponible en la información | Encoder base para fine-tuning | no disponible en la información | Hugging Face |
| Otros clasificadores de reclamaciones CFPB | no disponible | no disponible | Clasificación de reclamaciones | no disponible | no disponible |

No se dispone de datos de benchmarks de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Entrenado con reclamaciones del primer semestre de 2026: los productos, las incidencias y la forma en que los usuarios los describen cambian con el tiempo, por lo que puede degradarse con datos posteriores.
- Precisión de incidencia moderada (0,612 en validación, 0,586 en la muestra de evaluación; macro-F1 de incidencia 0,513 y 0,474): muchas incidencias se solapan entre productos y las categorías amplias, como problemas de atención al cliente, se confunden con frecuencia.
- Solo inglés y únicamente las categorías de producto e incidencia de la CFPB; no generaliza a otros dominios ni a otros esquemas de etiquetas.
- Solo puede predecir pares producto-incidencia vistos durante el entrenamiento; no hay clases nuevas.
- El texto de las reclamaciones puede contener datos personales incluso después de la redacción de la CFPB; no debe usarse para identificar personas.
- Licencia Apache 2.0: permite uso comercial, pero debe verificarse el cumplimiento de las condiciones de uso de los datos de la CFPB y de la normativa aplicable sobre datos personales.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de clasificaciones erróneas con confianza alta en casos límite; se recomienda mantener el umbral de derivación a revisión humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hasnainn19/complaintflow-classifier
- Repositorio ComplaintFlow: https://github.com/hasnainn19/ComplaintFlow
- Modelo base ModernBERT-base: https://huggingface.co/answerdotai/ModernBERT-base
- Base de datos de reclamaciones de la CFPB: https://www.consumerfinance.gov/data-research/consumer-complaints/
