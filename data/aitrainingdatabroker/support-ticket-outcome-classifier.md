# aitrainingdatabroker/support-ticket-outcome-classifier

## Resumen

El Support Ticket Outcome Classifier es un modelo de clasificación de texto desarrollado por AI Training Data Broker, un bróker y asesor técnico especializado en la venta y licencia de datos para laboratorios de IA. El modelo lee una conversación completa de soporte (turnos de cliente y agente) y predice cómo terminó el ticket, asignando una de once etiquetas de resultado posibles: reembolso emitido, solución alternativa dada, registro actualizado, pregunta respondida, corregido por el equipo, cuenta desbloqueada, reemplazo enviado, bug registrado, retenido con pausa, asientos reducidos o cancelado.

La relevancia del modelo reside en un problema operativo concreto: muchas exportaciones de help desk conservan los mensajes pero no un campo limpio de resultado, lo que impide segmentar, muestrear o auditar tickets por desenlace. Este clasificador rellena ese hueco etiquetando el resultado para que los equipos puedan contar tickets por resultado y analizar qué conversaciones terminaron en fidelización o en pérdida de cliente.

Arquitectura transformer encoder (RoBERTa destilada), 82,1 millones de parámetros, contexto de 256 tokens, licencia Apache 2.0 y entrenamiento exclusivamente sobre datos sintéticos. Es un modelo pequeño, ligero y desplegable en hardware de consumo, pensado como utilidad de etiquetado y no como asistente conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilRoBERTa, destilación de RoBERTa) |
| Parametros totales | 82.126.859 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | No disponible (pesos safetensors en fp32; admite cuantización dinámica estándar de PyTorch, no documentada por el autor) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `distilbert/distilroberta-base`, un encoder transformer de 6 capas y 82 millones de parámetros obtenido por destilación de RoBERTa, y se ajustó finamente para clasificación de secuencias con una cabeza de 11 etiquetas. El entrenamiento consistió en 6 épocas sobre una única RTX 3070, lo que confirma que el coste computacional del ajuste es mínimo y reproducible en hardware de consumo.

Los datos de entrenamiento provienen del dataset `aitrainingdatabroker/synthetic-support-tickets-with-outcomes`, compuesto por 400 filas de conversaciones íntegramente inventadas (nombres, números y direcciones ficticios). No se documenta el uso de RLHF, DPO ni técnicas de alineación adicionales, algo esperable en un clasificador. Los scripts de generación de datos, entrenamiento y evaluación están incluidos en el directorio `source/` del repositorio, y las métricas completas en `scores.json`. La innovación técnica es limitada por diseño: se trata de un fine-tuning estándar de un encoder pequeño orientado a una tarea de clasificación cerrada.

## Capacidades

- Clasificación de conversaciones completas de soporte en 11 categorías de resultado: `account_unlocked`, `answered`, `bug_logged`, `cancelled`, `fixed_by_team`, `refund_issued`, `replacement_sent`, `retained_with_pause`, `seats_reduced`, `updated` y `workaround_given`.
- Procesamiento de texto multi-turno con etiquetas de hablante (`customer:` / `agent:`) en la entrada.
- Salida con puntuaciones de probabilidad por etiqueta y soporte de `top_k` para recuperar las k predicciones más probables.
- Integración directa con la librería `transformers` mediante `pipeline("text-classification")`.
- Compatibilidad con Text Embeddings Inference (TEI) y endpoints de Hugging Face, según los tags del repositorio.
- No soporta generación de texto, tool calling, razonamiento multi-paso, visión ni audio: es exclusivamente un clasificador.

## Casos de uso

- Etiquetado retroactivo de exportaciones de help desk: aplicar el modelo sobre tickets históricos de Zendesk u otras plataformas para reconstruir el campo de resultado ausente y habilitar análisis por desenlace.
- Análisis de retención y churn: contar cuántos tickets terminan en `cancelled` o `retained_with_pause` frente a `refund_issued` o `workaround_given`, y cruzar esos resultados con cohortes de clientes para identificar patrones de pérdida.
- Muestreo estratificado para control de calidad: seleccionar tickets por resultado (por ejemplo, todos los `bug_logged`) para revisión manual o para entrenar modelos de resumen de conversaciones.
- Enrutamiento y priorización post-hoc: detectar tickets que terminaron en `fixed_by_team` o `replacement_sent` para medir tiempos de resolución por tipo de desenlace.
- Construcción de datasets etiquetados: usar las predicciones como preetiquetado en un pipeline de anotación humana, reduciendo el coste de etiquetar manualmente grandes volúmenes de conversaciones.
- Investigación sobre calidad de soporte: comparar la distribución de resultados entre equipos, productos o periodos para estudiar qué intervenciones correlacionan con desenlaces favorables.
- Filtrado previo a la compartición de datos: identificar y separar tickets por resultado antes de exportar subconjuntos a terceros, siempre con revisión humana posterior.

## Benchmarks y rendimiento

El autor reporta métricas sobre 100 filas reservadas para test, procedentes del mismo generador sintético que los datos de entrenamiento:

| Metrica | Valor |
|---|---|
| Accuracy | 1.0 |
| Macro F1 | 1.0 |

| Etiqueta | F1 | Muestras en test |
|---|---|---|
| `account_unlocked` | 1.0 | 8 |
| `answered` | 1.0 | 20 |
| `bug_logged` | 1.0 | 6 |
| `cancelled` | 1.0 | 1 |
| `fixed_by_team` | 1.0 | 7 |
| `refund_issued` | 1.0 | 19 |
| `replacement_sent` | 1.0 | 7 |
| `retained_with_pause` | 1.0 | 3 |
| `seats_reduced` | 1.0 | 6 |
| `updated` | 1.0 | 9 |
| `workaround_given` | 1.0 | 14 |

Advertencia: una puntuación perfecta sobre datos del mismo generador sintético no es evidencia de rendimiento en tickets reales. El propio autor lo señala explícitamente. No se han publicado resultados sobre datos reales ni comparaciones con otros clasificadores en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en fp32 (82 M de parámetros), inferior a 0,2 GB en fp16 o int8. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor entrenó en una RTX 3070. Funciona también en CPU con latencia aceptable para lotes pequeños.
- Cabe en GPU consumer: sí, en todas las RTX y GTX modernas, e incluso en iGPU y CPU.
- Opciones de despliegue: `transformers` con `pipeline`, Text Embeddings Inference (TEI), endpoints de Hugging Face, ONNX Runtime y TorchScript. No se documenta soporte nativo de vLLM ni llama.cpp (no aplica a encoders de clasificación).
- Latencia y throughput: no disponible en la información proporcionada. Por el tamaño del modelo, se espera un throughput alto en GPU y suficiente para procesamiento por lotes en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| support-ticket-outcome-classifier | 82,1 M | 256 tokens | Clasificación de resultado de tickets (11 clases) | Apache 2.0 | Hugging Face |
| distilroberta-base (base) | 82,1 M | 512 tokens | Modelo base de lenguaje enmascarado | Apache 2.0 | Hugging Face |
| Modelos de clasificación de tickets genéricos (p. ej., fine-tunes de BERT/RoBERTa para categoría o sentimiento) | Variable (110-125 M típico) | 512 tokens | Categorización, prioridad o sentimiento | Variable | Hugging Face |

No se dispone de comparaciones publicadas con clasificadores específicos de resultado de tickets. La comparativa con el modelo base es relevante porque este clasificador hereda su arquitectura pero reduce el contexto efectivo a 256 tokens, un recorte que el autor justifica por el formato de entrenamiento pero que limita hilos largos.

## Limitaciones y advertencias

- Entrenado y evaluado sobre conversaciones sintéticas del mismo generador: la puntuación perfecta no predice el rendimiento en tickets reales. Es imprescindible validar sobre una muestra etiquetada del propio help desk.
- Solo inglés. No cubre conversaciones en castellano ni en otros idiomas.
- Contexto de 256 tokens: los hilos largos se truncan y pierden el final, que es precisamente donde suele aparecer el desenlace. Esto puede degradar gravemente la precisión en tickets reales extensos.
- Clases con muy pocas muestras en test (`cancelled` con 1 muestra, `retained_with_pause` con 3): las métricas por clase son estadísticamente frágiles.
- Riesgo de alucinación de etiqueta: al ser un clasificador cerrado, siempre asigna una de las 11 clases, incluso ante entradas fuera de distribución o conversaciones ambiguas.
- Sesgos: no documentados por el autor; al proceder de datos sintéticos, los sesgos reflejan los patrones del generador y no los de poblaciones reales.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor solicita atribución a AI Training Data Broker y enlace a su web al compartir o construir sobre el modelo. No es una obligación legal de la licencia, sino una petición.
- El modelo no constituye asesoramiento legal ni certificación de cumplimiento (HIPAA, CCPA/CPRA, GDPR, PIPEDA, Ley 25 de Quebec). Cualquier uso en flujos de anonimización o compartición de datos requiere revisión humana y, cuando la norma lo exija, un experto cualificado.
- No debe usarse como única fuente de decisión en procesos de atención al cliente sin supervisión humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aitrainingdatabroker/support-ticket-outcome-classifier
- Dataset de entrenamiento: https://huggingface.co/datasets/aitrainingdatabroker/synthetic-support-tickets-with-outcomes
- Modelo base: https://huggingface.co/distilbert/distilroberta-base
- Artículo del autor sobre licencia de tickets de soporte: https://aitrainingdatabroker.com/data/support-tickets/
- Artículo del autor sobre exportación de datos de Zendesk: https://aitrainingdatabroker.com/data/zendesk-data-export/
- Sitio del autor: https://aitrainingdatabroker.com/
