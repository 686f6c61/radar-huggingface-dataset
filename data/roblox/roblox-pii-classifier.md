# Roblox/roblox-pii-classifier

## Resumen

`Roblox/roblox-pii-classifier` es un modelo de clasificacion de texto disenado para detectar intentos de compartir o solicitar informacion personal identificable (PII) en conversaciones escritas. Desarrollado por el equipo de seguridad de Roblox, el modelo es un fine-tuning de la arquitectura XLM-RoBERTa-Large sobre datasets internos anonimizados de chat de la plataforma, etiquetados por expertos y complementados con conversaciones sinteticas generadas por IA. El modelo se publico en octubre de 2025 bajo licencia Apache 2.0, con el objetivo de democratizar la deteccion de PII en entornos de chat multiusuario.

A diferencia de los sistemas tradicionales de reconocimiento de entidades nombradas (NER), este clasificador se centra en el contexto conversacional: distingue entre solicitar PII (`privacy_asking_for_pii`) y compartir o amenazar con compartir PII (`privacy_giving_pii`), incluyendo intentos de redirigir a usuarios fuera de la plataforma. Con 559,9 millones de parametros y soporte multilingue, el modelo alcanza un F1 del 94,34% en chat en ingles anonimizado de Roblox y un 83,10% en el conjunto multilingue, superando ampliamente a alternativas como LlamaGuard o Piiranha en estos escenarios.

La relevancia actual del modelo radica en su capacidad para detectar patrones adversarios —ortografia creativa, sustitucion de caracteres o referencias implicitas— que los filtros basados en reglas o NER no capturan. Al estar disponible en formato safetensors y ONNX, con soporte para Text Embeddings Inference y despliegue en Azure, puede integrarse directamente en pipelines de moderacion de contenido en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa-Large (transformer encoder) |
| Parametros totales | 559.892.482 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en fp32/fp16; compatible con ONNX) |
| Idiomas soportados | multilingue (100+ idiomas segun XLM-RoBERTa) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo se basa en XLM-RoBERTa-Large, un transformer encoder preentrenado sobre datos multilingues de CommonCrawl (2,5 TB de texto filtrado en 100 idiomas). Roblox realizo un fine-tuning de la capa de clasificacion para la tarea especifica de deteccion de PII en contexto conversacional. El entrenamiento se llevo a cabo con datasets internos anonimizados de chat de Roblox, etiquetados manualmente por expertos en seguridad, complementados con conversaciones sinteticas generadas por IA para aumentar la cobertura de casos adversariales.

La tarea se formula como clasificacion multi-etiqueta con dos categorias: `privacy_asking_for_pii` (solicitar PII mediante preguntas directas o insinuaciones) y `privacy_giving_pii` (compartir o amenazar con compartir PII, incluyendo numeros de telefono, correos, IDs gubernamentales, credenciales y redireccion fuera de plataforma). El modelo procesa secuencias de hasta 512 tokens y produce puntuaciones no calibradas. El umbral recomendado para deteccion general es `max(asking, giving) >= 0.2691`, que optimiza el F1 en chat en ingles de Roblox; para categorias individuales se recomiendan umbrales de 0.2 y 0.3 respectivamente.

## Capacidades

- Clasificacion multi-etiqueta de texto para deteccion de PII en conversaciones: detecta tanto solicitudes como divulgaciones de informacion personal.
- Deteccion contextual: identifica intentos sutiles de obtener PII incluso cuando no hay informacion personal explicita en el texto (insinuaciones, preguntas indirectas).
- Reconocimiento de patrones adversariales: ortografia creativa, sustitucion de caracteres, referencias implicitas y tecnicas de evasion de filtros.
- Soporte multilingue: hereda las capacidades de XLM-RoBERTa-Large, que cubre mas de 100 idiomas.
- Deteccion de redireccion fuera de plataforma (DUOP): identifica intentos de llevar al usuario a plataformas externas o ubicaciones del mundo real.
- Salida binaria por categoria con puntuaciones continuas, permitiendo ajustar umbrales segun el equilibrio precision-recall deseado.

## Casos de uso

- Moderacion de chat en tiempo real en plataformas sociales: el modelo puede integrarse en pipelines de moderacion para analizar mensajes entrantes y bloquear o marcar aquellos que soliciten o compartan PII, con latencia suficiente para procesamiento sincrono gracias a su tamano de 560M parametros.
- Proteccion de menores en entornos online: detecta intentos de adultos de obtener informacion personal de menores mediante preguntas aparentemente inocuas, un caso de uso critico donde los filtros basados en reglas fallan.
- Cumplimiento normativo (GDPR, CCPA): clasifica conversaciones de atencion al cliente para detectar fugas de datos personales y activar protocolos de respuesta ante brechas de privacidad.
- Filtrado de contenido generado por usuarios en foros y comunidades: aplicable a cualquier plataforma con chat, no solo juegos, para prevenir la divulgacion de numeros de telefono, correos o credenciales.
- Deteccion de phishing y fraude: identifica mensajes que solicitan credenciales o informacion bancaria mediante ingenieria social, complementando sistemas antispam tradicionales.
- Auditoria de datasets de entrenamiento: puede usarse para limpiar corpus de texto antes de entrenar otros modelos, eliminando conversaciones que contengan PII y reduciendo riesgos de fuga de datos en modelos generativos.
- Analisis forense de chats: aplicable en investigaciones de acoso o doxing, donde se necesita localizar conversaciones donde se compartio informacion personal de una victima.

## Benchmarks y rendimiento

La siguiente tabla muestra los resultados publicados por Roblox en su model card, evaluados sobre datasets internos retenidos y comparados con otros modelos de seguridad:

| Modelo | F1 (Kaggle PII dataset) | F1 (Chat ingles Roblox) | F1 (Chat multilingue Roblox) |
|---|---|---|---|
| Roblox PII Classifier v1.1 | 45,48% | 94,34% | 83,10% |
| LlamaGuard v3 1B | 5,90% | 3,17% | 20,88% |
| LlamaGuard v3 8B | 5,46% | 27,73% | 0,03% |
| LlamaGuard v4 12B | 3,72% | 26,55% | 0,08% |
| NemoGuard 8B | 3,26% | 26,29% | sin soporte multilingue |
| Piiranha NER | 33,20% | 13,88% | 9,11% |

Adicionalmente, el blog tecnico de Roblox reporta un recall del 98% en conversaciones con PII potencial en texto en ingles y un F1 del 94% en datos de produccion. Es importante notar que estos resultados se obtuvieron sobre datos internos de Roblox, por lo que el rendimiento en otros dominios puede variar significativamente.

## Requisitos de hardware

- VRAM estimada: con 559,9M de parametros, el modelo requiere aproximadamente 2,2 GB en fp32 y 1,1 GB en fp16 para inferencia. Con cuantizacion INT8, alrededor de 600 MB.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente. Una RTX 3060, RTX 4060 o superior ejecuta el modelo sin problemas. Tambien funciona en CPU para inferencia por lotes con latencia moderada.
- Compatible con GPU de consumo: si, cabe en practicamente cualquier GPU moderna de consumo.
- Opciones de despliegue: compatible con Transformers (Python), Text Embeddings Inference (TEI), ONNX Runtime, y disponible en Azure AI Foundry / Azure Machine Learning con soporte de endpoints gestionados.
- Latencia estimada: para una secuencia de 512 tokens en GPU consumer, la inferencia deberia completarse en decenas de milisegundos. En CPU, en el rango de 100-500 ms por secuencia.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | F1 (chat Roblox) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Roblox PII Classifier | 560M | Clasificacion contextual multi-etiqueta | 94,34% (EN) / 83,10% (multilingue) | Apache 2.0 | HuggingFace, Azure |
| LlamaGuard v3 8B | 8B | Clasificacion de seguridad generica | 27,73% (EN) | Llama Community License | HuggingFace |
| Piiranha NER | ~200M | Reconocimiento de entidades nombradas | 13,88% (EN) | MIT | HuggingFace |
| NemoGuard 8B | 8B | Clasificacion de seguridad generica | 26,29% (EN) | Apache 2.0 | HuggingFace |

La principal diferencia frente a LlamaGuard y NemoGuard es que estos son clasificadores de seguridad de proposito general (violencia, odio, contenido sexual, etc.), mientras que el modelo de Roblox esta especializado exclusivamente en PII. Piiranha, por su parte, usa NER clasico y no captura el contexto conversacional de solicitud de PII, lo que explica su bajo rendimiento en este dominio.

## Limitaciones y advertencias

- El modelo fue entrenado principalmente con datos de chat de Roblox, por lo que su rendimiento en otros dominios (correo electronico, redes sociales, atencion al cliente) puede degradarse. La transferencia a otros contextos requiere evaluacion previa.
- Las puntuaciones de salida no estan calibradas; los umbrales recomendados (0.2691 combinado, 0.2 y 0.3 por categoria) se optimizaron sobre datos de Roblox y pueden no ser adecuados para otros escenarios.
- Longitud de contexto limitada a 512 tokens, lo que impide analizar conversaciones largas de una sola pasada. Para chats extensos se necesita segmentacion previa.
- El rendimiento en el benchmark de Kaggle PII (45,48% F1) es notablemente inferior al obtenido en datos de Roblox, lo que sugiere cierta especializacion en el dominio de la plataforma.
- Al ser un clasificador basado en encoder, no genera explicaciones de sus decisiones. Para auditorias de moderacion puede ser necesario complementarlo con herramientas de interpretabilidad.
- Aunque la licencia Apache 2.0 permite uso comercial sin restricciones, el acceso al modelo en HuggingFace requiere aprobacion de los autores segun la pagina de Azure AI Catalog, lo que puede anadir friccion en el despliegue.
- Riesgo de falsos positivos en conversaciones inocuas que mencionen datos personales de forma legitima (por ejemplo, "mi correo es..." en un contexto de soporte tecnico), lo que requiere ajuste fino de umbrales segun el caso de uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Roblox/roblox-pii-classifier
- Blog tecnico de Roblox: https://corp.roblox.com/newsroom/2025/11/open-sourcing-roblox-pii-classifier-ai-pii-detection-chat
- Articulo de XLM-RoBERTa (arXiv): https://arxiv.org/pdf/1911.02116
- Pagina en Azure AI Catalog: https://ai.azure.com/catalog/models/roblox-roblox-pii-classifier
- Dataset de benchmark: https://huggingface.co/datasets/Roblox/roblox-pii-classifier-benchmark
