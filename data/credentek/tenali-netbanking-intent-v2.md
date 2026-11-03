# credentek/Tenali-NetBanking-Intent-v2

## Resumen

Tenali-NetBanking-Intent-v2 es un modelo de clasificación de intenciones publicado por el usuario credentek en HuggingFace. Por su nombre y por su arquitectura, está orientado a la detección de intenciones en el dominio de la banca digital (net banking), presumiblemente para alimentar sistemas de atención al cliente, asistentes conversacionales o enrutamiento automático de peticiones en aplicaciones bancarias.

El modelo emplea una arquitectura BERT (según el tag `bert` del repositorio) con 237.627.741 parámetros totales, lo que lo sitúa en la gama de los modelos tipo BERT-large. Los pesos se distribuyen en formato safetensors y el repositorio ocupa 1,9 GB. Se trata de un modelo derivado y ajustado para una tarea concreta, no de un modelo generativo de propósito general.

La relevancia de esta ficha es limitada por la escasez de documentación publicada: no hay model card descriptiva, no se declaran idiomas, licencia ni pipeline, y el contador de descargas es de solo 4. Cualquier evaluación en producción debe partir de una validación empírica propia sobre el corpus objetivo antes de asumir su comportamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder, según tag del repositorio) |
| Parametros totales | 237.627.741 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio declara el tag `bert`, lo que indica una arquitectura transformer de tipo encoder bidireccional. Con 237,6 millones de parámetros, el tamaño es coherente con la familia BERT-large (aproximadamente 340 M en su configuración estándar) o con una variante ajustada del mismo orden. Al tratarse de un modelo de clasificación de intenciones, la cabeza de salida sería una capa de clasificación sobre el token `[CLS]`, con un número de etiquetas correspondiente a las intenciones del dominio bancario que no se especifica en la información disponible.

No se ha publicado información sobre el corpus de entrenamiento: ni número de tokens, ni composición del dataset, ni si hubo ajuste fino supervisado, destilación o técnicas de aumento de datos. Tampoco se documentan innovaciones técnicas como atención lineal, decodificación especulativa (irrelevante en un encoder de clasificación) ni estrategias de entrenamiento diferencial. Todos estos extremos deben considerarse no disponibles.

## Capacidades

- Clasificación de intenciones en el dominio de banca digital, a partir del nombre del modelo y de su arquitectura encoder.
- Codificación contextual bidireccional de secuencias de texto, apta para extraer representaciones de utterances cortas.
- Ajuste específico de dominio: al ser un modelo derivado, se espera un rendimiento superior al de un BERT genérico en el vocabulario y las formulaciones típicas del net banking.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles; no se declaran idiomas en el repositorio.
- No se documentan modos especiales (thinking mode, visión, audio).

## Casos de uso

- Enrutamiento de consultas en atención al cliente bancaria: el modelo clasificaría el mensaje entrante del usuario en una intención (consulta de saldo, bloqueo de tarjeta, transferencia, etc.) para dirigirlo al flujo o al agente adecuado. Es adecuado por su ajuste específico al dominio y su bajo coste de inferencia frente a un modelo generativo.
- Detección de intención en chatbots de banca móvil: integrado como clasificador previo a un sistema de diálogo, permite seleccionar la respuesta o el servicio web a invocar sin necesidad de un LLM generativo.
- Triaje automático de tickets y correos: clasificación de comunicaciones de clientes en categorías operativas para priorización y asignación de colas.
- Análisis de voz del cliente: transcripción de llamadas y clasificación posterior de cada turno para extraer motivos de contacto y alimentar dashboards de experiencia de cliente.
- Moderación y detección de peticiones sensibles: identificación de intenciones relacionadas con fraude, disputas o cancelaciones que requieran protocolos específicos.
- Etiquetado asistido para anotación: uso del modelo como preanotador en pipelines de human-in-the-loop para acelerar el etiquetado de nuevos datos de intenciones bancarias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,95 GB solo para pesos (237,6 M × 4 bytes), más activaciones y overhead del runtime; en la práctica, alrededor de 1,5-2 GB.
- VRAM estimada en FP16/BF16: aproximadamente 0,48 GB para pesos, con un total práctico en torno a 1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una T4, L4, RTX 3060 o superior permite inferencia con holgura y batching.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (RTX 2060 en adelante) e incluso en CPU para cargas moderadas.
- Opciones de despliegue: al ser un modelo safetensors de tipo BERT, puede servirse con Hugging Face Transformers, Text Embeddings Inference (TEI), TorchServe o exportarse a ONNX Runtime; no hay pesos GGUF publicados, por lo que llama.cpp/Ollama requerirían conversión manual.
- Latencia y throughput: no disponibles; para un encoder de este tamaño se esperan latencias de milisegundos por secuencia corta en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| credentek/Tenali-NetBanking-Intent-v2 | 237,6 M | no disponible | Clasificación de intenciones bancarias | no disponible | HuggingFace (4 descargas) |
| BERT-large (google-bert/bert-large-uncased) | ~340 M | 512 tokens | Representación general / fine-tuning | Apache 2.0 | HuggingFace, ampliamente adoptado |
| DistilBERT (distilbert-base-uncased) | ~66 M | 512 tokens | Representación general / fine-tuning | Apache 2.0 | HuggingFace, ampliamente adoptado |
| RoBERTa-base (FacebookAI/roberta-base) | ~125 M | 512 tokens | Representación general / fine-tuning | MIT | HuggingFace, ampliamente adoptado |

La comparación es aproximada: los modelos de referencia son base genéricos sin ajuste al dominio bancario, mientras que Tenali-NetBanking-Intent-v2 está presuntamente especializado. No hay datos públicos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Ausencia de model card: no se documentan datos de entrenamiento, etiquetas, métricas ni metodología, lo que impide evaluar su calidad de forma previa.
- Licencia no declarada: no puede asumirse uso comercial sin contactar con el autor; el riesgo legal es alto para integración en producción.
- Idiomas no declarados: no se puede confirmar que soporte castellano ni variantes dialectales; el dominio "net banking" sugiere un posible sesgo hacia el inglés o hacia un mercado concreto.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificación errónea en intenciones fuera de la distribución de entrenamiento (out-of-distribution), con posible enrutamiento incorrecto en producción.
- Sesgos potenciales derivados del corpus bancario empleado: vocabulario específico de un producto o entidad, jerga regional y desbalance de clases no documentado.
- Contexto máximo desconocido: si se hereda la configuración BERT estándar, sería de 512 tokens, insuficiente para conversaciones largas sin truncado.
- Popularidad muy baja (4 descargas, 0 likes): no hay evidencia comunitaria de validación ni reportes de errores.
- Recomendación: validar con un conjunto de test propio, revisar la licencia con el autor y considerar modelos base con licencia permisiva si no se confirma el ajuste de dominio.

## Enlaces

- HuggingFace: https://huggingface.co/credentek/Tenali-NetBanking-Intent-v2
