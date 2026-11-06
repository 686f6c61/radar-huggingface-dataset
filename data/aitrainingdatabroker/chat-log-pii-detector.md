# aitrainingdatabroker/chat-log-pii-detector

## Resumen

Chat Log PII Detector es un modelo de clasificación de tokens (token classification) desarrollado por AI Training Data Broker, un bróker y asesor técnico especializado en la venta y licencia de datos corporativos a laboratorios de IA. El modelo detecta datos personales y secretos en líneas de chat de trabajo, concretamente las entidades PERSON, EMAIL, PHONE, API_KEY, IP_ADDRESS e ID_NUMBER, con el objetivo de que un revisor humano pueda localizar y sanear esos fragmentos antes de exportar o licenciar un histórico de conversaciones.

Técnicamente es un fine-tune de `distilroberta-base`, un transformer encoder de tipo RoBERTa destilado, con 81.537.805 parámetros totales y un repositorio de 0,3 GB en formato safetensors. La ventana de contexto no está especificada en la información disponible, pero al derivar de RoBERTa está limitada a 512 tokens posicionales, lo que encaja con su diseño para líneas cortas de chat.

Su relevancia es acotada pero clara: cubre un nicho muy concreto (detección de PII en logs de Slack, Teams o similares) y lo hace con una licencia Apache 2.0 permisiva. No obstante, sus propios autores advierten de que se entrenó exclusivamente con datos sintéticos generados por plantillas, por lo que sus métricas perfectas no son extrapolables a texto real sin una validación previa sobre datos propios etiquetados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa destilado, base: distilroberta-base) |
| Parámetros totales | 81.537.805 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo derivado de RoBERTa, típicamente 512 tokens) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `distilroberta-base`, una versión destilada de RoBERTa que conserva la arquitectura transformer encoder con atención bidireccional pero reduce el número de capas respecto al modelo original. Se entrena como clasificador de tokens, asignando una etiqueta BIO a cada token de la secuencia de entrada para delimitar las seis entidades objetivo. El repositorio ocupa 0,3 GB y los pesos se distribuyen en safetensors.

El entrenamiento se realizó durante 8 épocas sobre una única RTX 3070, con un conjunto de 360 filas procedentes del dataset `aitrainingdatabroker/synthetic-chat-logs-pii-spans`. Todos los nombres, números y frases del corpus son inventados y generados por plantillas; las filas de test se construyeron con plantillas que el modelo no vio durante el entrenamiento. Los scripts de generación de datos y de entrenamiento están incluidos en el directorio `source/` del repositorio, y las puntuaciones completas en `scores.json`. No se documenta el uso de RLHF, DPO ni ninguna innovación arquitectónica adicional; se trata de un fine-tune supervisado convencional.

## Capacidades

- Detección de entidades nombradas (NER) orientada a PII en líneas de chat: PERSON, EMAIL, PHONE, API_KEY, IP_ADDRESS e ID_NUMBER.
- Clasificación de tokens con etiquetado BIO, compatible con el pipeline `token-classification` de Transformers y con `aggregation_strategy="simple"` para agrupar subtokens.
- Detección de secretos embebidos en texto conversacional (claves de API e direcciones IP), una categoría que los NER genéricos no suelen cubrir.
- Funciona sobre líneas cortas de chat con marcas de tiempo y nombre de usuario, el formato típico de exportaciones de Slack o Teams.
- Integrable en pipelines de saneamiento previos a exportación o licencia de datos.
- No soporta tool calling, function calling, razonamiento multi-paso ni modo thinking: es un modelo discriminativo de etiquetado, no generativo.
- No tiene capacidades multimodales (visión, audio) ni multilingües más allá del inglés.

## Casos de uso

- Saneamiento de exportaciones de Slack o Teams antes de licenciarlas: el modelo marca nombres, correos, teléfonos, claves e IPs en cada línea para que un revisor humano confirme y redacte antes de compartir el dataset con un laboratorio de IA.
- Revisión asistida de logs de soporte técnico: al procesar transcripciones de atención al cliente, permite localizar datos personales que no deberían persistir en un almacén analítico.
- Pre-filtrado en pipelines de de-identificación: se ejecuta como primera pasada sobre el texto y genera candidatos que después se validan con expresiones regulares o con un revisor humano, reduciendo el volumen de revisión manual.
- Detección de secretos filtrados en canales internos: identifica claves de API e IPs pegadas por error en conversaciones de ingeniería, lo que permite alertar y rotar credenciales.
- Cumplimiento y auditoría interna: sirve como herramienta de apoyo para localizar PII en históricos de chat antes de aplicar políticas de retención o responder a solicitudes de acceso o supresión.
- Etiquetado asistido para construir corpus de entrenamiento: las detecciones del modelo pueden usarse como preanotaciones que un anotador humano corrige, acelerando la creación de datasets de PII etiquetados.
- Prototipado rápido en el navegador: el Space asociado `pii-pattern-scanner` permite probar el modelo sin infraestructura propia antes de integrarlo en un sistema.

## Benchmarks y rendimiento

Los únicos datos publicados son las puntuaciones del autor sobre 140 filas sintéticas de test (coincidencia exacta de entidad):

| Tipo | Precision | Recall | F1 | Muestras |
|---|---|---|---|---|
| API_KEY | 1.0 | 1.0 | 1.0 | 35 |
| EMAIL | 1.0 | 1.0 | 1.0 | 70 |
| ID_NUMBER | 1.0 | 1.0 | 1.0 | 35 |
| IP_ADDRESS | 1.0 | 1.0 | 1.0 | 35 |
| PERSON | 1.0 | 1.0 | 1.0 | 175 |
| PHONE | 1.0 | 1.0 | 1.0 | 35 |

Global sobre las 140 filas: precision 1.0, recall 1.0, F1 1.0. El propio autor advierte de que estas cifras se obtuvieron sobre texto generado con plantillas nuevas pero del mismo estilo sintético, por lo que no son indicativas del rendimiento sobre texto real. No se han publicado comparaciones con otros modelos de detección de PII.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (81,5 M de parámetros, aproximadamente 326 MB de pesos) y en torno a 100-200 MB en fp16; el repositorio completo ocupa 0,3 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el propio autor lo entrenó en una RTX 3070. Funciona también en CPU con latencia aceptable para lotes pequeños.
- Cabe holgadamente en cualquier GPU consumer (GTX 1060 en adelante, RTX 2060/3060/4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: pipeline `token-classification` de Transformers, TorchServe, TGI, o exportación a ONNX para inferencia en CPU. No se documenta soporte específico para vLLM o llama.cpp (no aplica a un encoder de clasificación).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chat-log-pii-detector | 81,5 M | No disponible (RoBERTa, ~512) | NER de PII y secretos en chat | Apache 2.0 | Hugging Face |
| distilroberta-base (base) | 82,1 M | 512 | Modelo base sin fine-tune | Apache 2.0 | Hugging Face |
| Modelos NER genéricos tipo dslim/bert-base-NER | ~110 M | 512 | NER de personas, organizaciones y lugares | MIT/Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros, contexto y licencia. Frente a un NER genérico, la diferencia principal de este modelo es la cobertura de entidades específicas de seguridad (API_KEY, IP_ADDRESS, ID_NUMBER), que los NER convencionales no detectan.

## Limitaciones y advertencias

- Entrenado exclusivamente con texto sintético generado por plantillas; el texto real presenta mucha más variabilidad en formatos, ruido y estilo, por lo que el rendimiento real puede degradarse notablemente respecto al 1.0 publicado.
- El test se construyó con plantillas nuevas pero del mismo estilo plano que el entrenamiento; una puntuación perfecta sobre texto generado no dice nada sobre texto real. Es imprescindible validarlo sobre una muestra propia etiquetada.
- Diseñado para líneas cortas de chat; no está pensado para documentos largos ni para texto con estructura compleja.
- Las claves de API reales adoptan muchos formatos distintos; el autor recomienda combinar el modelo con un escáner de patrones (regex) en paralelo.
- Solo soporta inglés; no cubre PII en otros idiomas.
- Riesgo de falsos negativos y positivos en nombres propios poco comunes, formatos telefónicos internacionales o identificadores no contemplados en las plantillas.
- No es asesoramiento legal ni una certificación de cumplimiento; el autor indica explícitamente que una persona debe revisar la salida antes de compartir o decidir nada, y que el criterio legal corresponde al asesor jurídico de cada organización.
- Licencia Apache 2.0 permite uso comercial, pero el autor solicita atribución a AI Training Data Broker y enlace a su web al compartir o construir sobre el modelo.
- Con solo 23 descargas y 0 likes en el momento de la consulta, no hay evidencia de uso en producción ni validación independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aitrainingdatabroker/chat-log-pii-detector
- Dataset de entrenamiento: https://huggingface.co/datasets/aitrainingdatabroker/synthetic-chat-logs-pii-spans
- Space asociado (escáner de patrones PII): https://huggingface.co/spaces/aitrainingdatabroker/pii-pattern-scanner
- Guía sobre licencia de chat de equipo: https://aitrainingdatabroker.com/data/team-chat/
- Guía sobre exportación de datos de Slack: https://aitrainingdatabroker.com/data/slack-data-export/
- Guía sobre de-identificación: https://aitrainingdatabroker.com/de-identification/
- Sitio del autor: https://aitrainingdatabroker.com/
