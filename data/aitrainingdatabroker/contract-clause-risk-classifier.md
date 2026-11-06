# aitrainingdatabroker/contract-clause-risk-classifier

## Resumen

El Contract Clause Risk Classifier es un modelo de clasificación de texto desarrollado por AI Training Data Broker, un bróker y asesor técnico especializado en la venta y licencia de datos para laboratorios de IA. El modelo recibe una cláusula de licencia de datos y la etiqueta como `standard` o `watch`, es decir, si parece convencional o si merece una revisión más detenida (por ejemplo, una concesión exclusiva sin fecha de fin, una indemnización sin límite o la ausencia de derecho de supresión). Su función es actuar como un primer filtro automático sobre acuerdos largos, señalando qué cláusulas debería leer antes un abogado.

Técnicamente es un fine-tuning de `distilroberta-base`, un transformer encoder de 82,1 millones de parámetros, sobre un conjunto de datos sintético de 376 filas. El contexto de entrenamiento es deliberadamente limitado: cada muestra es una sola cláusula, no un contrato completo. El modelo está publicado con licencia Apache 2.0, solo soporta inglés y su repositorio ocupa 0,3 GB.

Su relevancia es acotada pero concreta: cubre un nicho muy específico (cláusulas de licencia de datos en el contexto de IA) con un coste computacional mínimo, lo que permite ejecutarlo en hardware de consumo. No obstante, su utilidad en producción está condicionada por el origen sintético de los datos de entrenamiento y por la naturaleza orientativa, no jurídica, de sus etiquetas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa), fine-tuning de `distilroberta-base` |
| Parametros totales | 82.119.938 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (derivada de `distilroberta-base`, no especificada en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantización estándar de transformers) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `distilroberta-base`, una versión destilada de RoBERTa con 6 capas y 82,1 millones de parámetros, y se fine-tunea como clasificador de secuencias con dos etiquetas (`standard` y `watch`). El entrenamiento se realizó durante 6 épocas en una única GPU RTX 3070, un indicativo claro del reducido coste computacional del proceso.

Los datos de entrenamiento proceden del dataset `aitrainingdatabroker/synthetic-contract-clauses-by-type-and-risk` y constan de 376 filas, todas ellas generadas sintéticamente a partir de plantillas: nombres, números y frases son inventados y no provienen de personas, clientes ni empresas reales. Las filas de test se construyeron con plantillas que el modelo no vio durante el entrenamiento, lo que busca medir cierta capacidad de generalización dentro del espacio sintético. No se documenta el uso de RLHF, DPO ni técnicas de alineación adicionales; se trata de un fine-tuning supervisado convencional. Los scripts de generación de datos y de entrenamiento están disponibles en el directorio `source/` del repositorio.

## Capacidades

- Clasificación binaria de cláusulas de licencia de datos en las etiquetas `standard` y `watch`.
- Detección de patrones de riesgo concretos mencionados por el autor: concesión exclusiva sin fecha de fin, indemnización sin límite y ausencia de derecho de supresión.
- Salida con probabilidades por etiqueta mediante `pipeline("text-classification", top_k=3)`.
- Procesamiento de una cláusula por inferencia (entrada de texto corta, no contratos completos).
- Solo inglés; no hay soporte multilingüe declarado.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión ni audio.
- Integración con Text Embeddings Inference y endpoints compatibles, según los tags del repositorio.

## Casos de uso

- Triaje previo de acuerdos de licencia de datos: el modelo procesa cada cláusula de un contrato de licencia de datos y marca las que requieren revisión humana, reduciendo el volumen de texto que un abogado debe leer en primera instancia.
- Revisión de contratos de cesión de datos para entrenamiento de IA: permite detectar rápidamente concesiones exclusivas sin plazo o indemnizaciones sin tope, que son precisamente los patrones sobre los que se entrenó.
- Automatización de un checklist de cumplimiento interno: se puede encadenar la clasificación de cada cláusula con reglas de negocio para generar una lista de puntos a revisar antes de firmar.
- Filtrado en pipelines de ingestión documental: al integrarse como paso de un pipeline de extracción de texto, el modelo puede etiquetar cláusulas a medida que se digitalizan acuerdos, con un coste de inferencia mínimo en CPU o GPU de consumo.
- Herramientas de apoyo para equipos jurídicos internos: dado su tamaño reducido (0,3 GB) y su licencia Apache 2.0, puede desplegarse en infraestructura propia sin dependencia de APIs externas, lo que facilita el tratamiento de documentos confidenciales.
- Prototipado y demostración: el Space asociado `contract-clause-watchlist` permite probar el modelo en el navegador antes de integrarlo, útil para validar si el enfoque encaja en un flujo de revisión concreto.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 186 filas de test retenidas:

| Metrica | Valor |
|---|---|
| Accuracy | 0,919 |
| Macro F1 | 0,919 |

| Etiqueta | F1 | Numero de ejemplos |
|---|---|---|
| `standard` | 0,915 | 91 |
| `watch` | 0,923 | 95 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (82,1 millones de parámetros, aproximadamente 330 MB en fp32); en fp16 ronda los 165 MB, sin contar activaciones.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; el entrenamiento se realizó en una RTX 3070.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, GTX 1660, e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` con `pipeline`, Text Embeddings Inference (tag `text-embeddings-inference`), endpoints compatibles; también es viable exportarlo a ONNX o cuantizarlo para llama.cpp en escenarios de CPU.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera una latencia de milisegundos por cláusula en GPU de consumo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| contract-clause-risk-classifier | 82,1 M | no disponible | Clasificación binaria de riesgo en cláusulas de licencia de datos | Apache 2.0 | Hugging Face |
| `distilroberta-base` (modelo base) | 82,1 M | 512 tokens (estándar de RoBERTa) | Modelo de lenguaje enmascarado, sin fine-tuning para esta tarea | Apache 2.0 | Hugging Face |
| Clasificadores legales genéricos | no disponible | no disponible | Clasificación de cláusulas legales en sentido amplio | variable | no disponible |

No se dispone de datos de benchmarks comparativos con alternativas en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente con texto sintético generado a partir de plantillas; el texto real de contratos presenta una variabilidad mucho mayor que la cubierta por el dataset.
- La etiqueta `watch` significa "revisar con más atención", no que la cláusula sea injusta o ilegal; una cláusula aceptable en un acuerdo puede ser problemática en otro.
- El modelo no constituye asesoramiento jurídico ni certificación; el autor indica explícitamente que una persona debe revisar la salida antes de compartirla o tomar decisiones.
- Solo soporta inglés; no hay capacidades multilingües declaradas.
- El conjunto de entrenamiento es muy reducido (376 filas), lo que limita la robustez frente a dominios y estilos de redacción no representados.
- Riesgo de alucinación no aplicable en el sentido generativo (es un clasificador), pero sí de falsos negativos y falsos positivos en cláusulas atípicas.
- Sesgos conocidos: no documentados por el autor; al derivarse de plantillas sintéticas, puede heredar los sesgos de diseño de dichas plantillas.
- Licencia Apache 2.0 permite uso comercial, pero el autor solicita atribución a AI Training Data Broker con enlace a su web al compartir o construir sobre el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aitrainingdatabroker/contract-clause-risk-classifier
- Space de demostración: https://huggingface.co/spaces/aitrainingdatabroker/contract-clause-watchlist
- Dataset de entrenamiento: https://huggingface.co/datasets/aitrainingdatabroker/synthetic-contract-clauses-by-type-and-risk
- Responsabilidad en licencias de datos para IA: https://aitrainingdatabroker.com/sell/liability/
- Compra de datasets estructurados para IA: https://aitrainingdatabroker.com/buy/structured-datasets/
- Cómo se cobra al licenciar datos: https://aitrainingdatabroker.com/sell/how-you-get-paid/
- Web del autor: https://aitrainingdatabroker.com/
