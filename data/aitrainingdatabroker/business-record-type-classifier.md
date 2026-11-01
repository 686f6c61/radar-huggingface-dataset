# aitrainingdatabroker/business-record-type-classifier

## Resumen

El Business Record Type Classifier es un modelo de clasificación de texto desarrollado por AI Training Data Broker, un intermediario y asesor técnico especializado en la venta y licencia de datos empresariales a laboratorios de IA. El modelo resuelve un problema muy concreto del sector de la licencia de datos: antes de preparar un inventario de registros corporativos para su desidentificación y posible licencia, una empresa necesita saber qué tipos de documentos tiene (tickets de soporte, correos, mensajes de chat, notas de CRM, notas de pedido y notas internas de traspaso) y en qué proporción.

Técnicamente es un fine-tuning de `distilroberta-base`, un transformer encoder de 82,1 millones de parámetros, sobre un conjunto de datos sintético de 480 filas. Se entrenó durante 6 épocas en una única GPU RTX 3070 y se publica bajo licencia Apache 2.0. Su relevancia es acotada pero clara: es una pieza de utilidad para pipelines de inventariado y clasificación previa de datos corporativos, no un modelo de propósito general.

El modelo clasifica exclusivamente en inglés y solo cubre seis categorías de registro. Su propia model card advierte de que las puntuaciones perfectas obtenidas en test no son extrapolables a exportaciones reales, ya que tanto entrenamiento como evaluación proceden de los mismos generadores sintéticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa destilado, `distilroberta-base`) |
| Parametros totales | 82.123.014 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/fp16; compatible con cuantizacion via librerias externas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `distilroberta-base`, una version destilada de RoBERTa que conserva la arquitectura transformer encoder con atencion bidireccional pero reduce el numero de capas respecto al modelo original. Sobre esa base se anade una cabeza de clasificacion de seis etiquetas (`chat`, `crm_note`, `email`, `internal_note`, `order_note`, `support_ticket`) y se realiza un fine-tuning supervisado convencional.

El entrenamiento se llevo a cabo durante 6 epocas en una sola RTX 3070, usando el dataset `aitrainingdatabroker/synthetic-deidentification-pairs`, compuesto por 480 filas generadas de forma sintetica. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion adicionales, algo esperable en un clasificador de este tamano. Los scripts de generacion de datos, entrenamiento y evaluacion estan incluidos en el directorio `source/` del repositorio, y las puntuaciones completas en `scores.json`. No se especifica el numero de tokens de entrenamiento ni la composicion detallada del dataset mas alla del recuento de filas.

## Capacidades

- Clasificacion de texto en seis tipos de registro empresarial: ticket de soporte, correo electronico, mensaje de chat, nota de CRM, nota de pedido y nota interna de traspaso.
- Salida con probabilidades por etiqueta y soporte de `top_k` para recuperar las N clases mas probables.
- Integracion directa con el pipeline `text-classification` de Hugging Face Transformers.
- Compatible con Text Embeddings Inference (TEI) y con endpoints de inferencia, segun los tags del repositorio.
- Entrada de texto corto a medio (fragmentos de documento), sin capacidades generativas.
- No soporta tool calling, function calling, razonamiento multi-paso ni modo thinking.
- No dispone de capacidades multimodales (vision, audio) ni de generacion de texto.
- Multilingue: no, unicamente ingles.

## Casos de uso

- Inventariado previo a la licencia de datos: una empresa que quiere vender o licenciar sus datos a un laboratorio de IA puede pasar sus exportaciones mezcladas por el clasificador para obtener un recuento por tipo de registro (cuantos tickets, correos, chats y notas de CRM tiene) y planificar la desidentificacion de cada categoria segun sus necesidades.
- Triaje de bandejas de correo mixtas: en un buzon con tickets reenviados, hilos de correo y mensajes pegados, el modelo separa cada registro por su origen para enrutarlo al sistema o al proceso de tratamiento correspondiente.
- Preparacion de datasets para desidentificacion: al conocer el tipo de registro, se puede aplicar la politica de desidentificacion adecuada (por ejemplo, reglas distintas para notas de CRM que para mensajes de chat) antes de compartir los datos.
- Clasificacion de notas de CRM: separar notas de CRM de notas internas de traspaso dentro de un mismo export permite mantener el historial comercial ordenado y auditable.
- Etiquetado de logs de chat de atencion al cliente: los mensajes de chat pueden aislarse del resto de registros para analisis de calidad, formacion o cumplimiento.
- Filtrado de registros para auditoria de cumplimiento: identificar que proporción de los datos de una organizacion corresponde a cada tipo de registro facilita la trazabilidad exigida en procesos de cumplimiento (GDPR, CCPA y similares), siempre con revision humana.
- Prototipado rapido de pipelines de clasificacion documental: al ser un modelo pequeno (82 M de parametros, 0,3 GB), sirve para validar la viabilidad de un flujo de clasificacion antes de invertir en anotacion y modelos mayores.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre 120 filas sinteticas reservadas para test:

| Metrica | Valor |
|---|---|
| Accuracy | 1.0 |
| Macro F1 | 1.0 |

Desglose por etiqueta:

| Etiqueta | F1 | Numero de ejemplos |
|---|---|---|
| `chat` | 1.0 | 24 |
| `crm_note` | 1.0 | 17 |
| `email` | 1.0 | 22 |
| `internal_note` | 1.0 | 17 |
| `order_note` | 1.0 | 22 |
| `support_ticket` | 1.0 | 18 |

No se han publicado comparaciones con otros modelos en la informacion disponible. El propio autor advierte de que estas puntuaciones perfectas se obtuvieron sobre texto generado por los mismos generadores que el conjunto de entrenamiento, por lo que no son representativas del rendimiento sobre exportaciones reales.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 82 M de parametros (aproximadamente 0,33 GB de pesos mas overhead); menos de 500 MB en fp16.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente. El modelo se entreno en una RTX 3070 y funciona sin problemas en RTX 3060, RTX 4060, GTX 1660 o superiores.
- Cabe holgadamente en GPU consumer e incluso puede ejecutarse en CPU con latencias aceptables para clasificacion de fragmentos cortos.
- Opciones de despliegue: pipeline de Transformers, Text Embeddings Inference (TEI), endpoints de Hugging Face, y conversion a ONNX para inferencia optimizada. No se documenta soporte nativo de vLLM, llama.cpp u Ollama, al no ser un modelo generativo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| business-record-type-classifier | 82,1 M | no disponible | Clasificacion de 6 tipos de registro empresarial | Apache 2.0 | Hugging Face |
| distilroberta-base | 82,1 M | 512 tokens | Modelo base de lenguaje (masked LM) | Apache 2.0 | Hugging Face |
| roberta-base | 125 M | 512 tokens | Modelo base de lenguaje (masked LM) | MIT | Hugging Face |
| distilbert-base-uncased | 66 M | 512 tokens | Modelo base de lenguaje (masked LM) | Apache 2.0 | Hugging Face |

La comparacion directa con clasificadores especializados equivalentes no esta disponible en la informacion proporcionada. Los modelos de la tabla son alternativas como base para un fine-tuning propio o como referencia de tamano; ninguno de ellos realiza la tarea especifica de clasificacion de tipos de registro empresarial sin entrenamiento adicional.

## Limitaciones y advertencias

- Evaluacion sobre datos sinteticos: entrenamiento y test proceden de los mismos generadores, por lo que la accuracy de 1.0 no predice el rendimiento sobre exportaciones reales. Es imprescindible validar con una muestra etiquetada de los datos propios antes de usarlo en produccion.
- Cobertura limitada a seis tipos de registro: ordenes de trabajo, ordenes de cambio, expedientes de siniestros, revisiones de codigo y otros tipos no estan contemplados.
- Solo ingles: no procesa texto en castellano ni en otros idiomas.
- Tamano de entrenamiento reducido (480 filas), lo que limita la robustez ante variaciones de estilo, jerga o formato.
- Riesgo de alucinacion de etiqueta: al ser un clasificador, puede asignar con alta confianza una categoria incorrecta en textos ambiguos o atipicos; se recomienda umbral de confianza y revision humana.
- No es asesoramiento legal ni certificacion: la model card subraya que determinar si un metodo de desidentificacion cumple HIPAA Safe Harbor o Expert Determination, CCPA/CPRA, GDPR, PIPEDA, Ley 25 de Quebec u otras normas corresponde al asesor legal y, cuando la norma lo exige, a un experto cualificado.
- Revision humana obligatoria antes de compartir cualquier dato procesado por el modelo.
- Sesgos: no se documentan analisis de sesgo en la informacion disponible; al entrenarse con datos sinteticos, los sesgos presentes en los generadores pueden trasladarse al modelo.
- Licencia Apache 2.0 permite uso comercial, pero el autor solicita atribucion a AI Training Data Broker y enlace a su web al compartir o construir sobre el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aitrainingdatabroker/business-record-type-classifier
- Dataset de entrenamiento: https://huggingface.co/datasets/aitrainingdatabroker/synthetic-deidentification-pairs
- Modelo base: https://huggingface.co/distilbert/distilroberta-base
- Pagina del autor sobre tipos de registros licenciables: https://aitrainingdatabroker.com/data/
- Pagina del autor sobre historial de CRM y licencia de datos: https://aitrainingdatabroker.com/data/crm-history/
- Web del autor: https://aitrainingdatabroker.com/
