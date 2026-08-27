# ademchaoua/freelance-offer-request-classifier

## Resumen

El modelo `ademchaoua/freelance-offer-request-classifier` es un clasificador de texto de tres clases (oferta, solicitud o ninguno) desarrollado por ademchaoua para moderar y filtrar mensajes en comunidades de freelancers. Se basa en el modelo `sentence-transformers/all-MiniLM-L6-v2`, un transformer BERT-like de 22,7 millones de parámetros, y se ha ajustado de forma completa (fine-tuning end-to-end) con 2.614 mensajes recopilados de grupos de Telegram especializados en trabajo freelance. El objetivo es distinguir automáticamente si un mensaje ofrece un servicio, solicita un servicio o es conversación general, lo que facilita la automatización de tareas de moderación, enrutamiento o análisis en comunidades profesionales.

El modelo se distribuye en formato PyTorch (safetensors) y también en ONNX cuantizado a INT8, lo que permite una inferencia rápida en CPU (aproximadamente 2 ms por texto). Su licencia MIT permite uso comercial sin restricciones, y su pequeño tamaño lo hace adecuado para despliegues ligeros en entornos de producción con recursos limitados. Aunque está pensado para inglés, su arquitectura simple y su bajo coste de inferencia lo convierten en una opción práctica para integraciones en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (MiniLM, 6 capas, BERT-like) con cabezal de clasificación |
| Parametros totales | 22.714.371 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (entrenado con secuencias de hasta 96 tokens) |
| Tipos de cuantizacion | FP32 (safetensors), ONNX INT8 |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo parte de `all-MiniLM-L6-v2`, un transformer de 6 capas con 22,7 millones de parámetros, diseñado originalmente para generar embeddings de frases. Para esta tarea se añade una cabeza de clasificación de secuencia y se realiza un fine-tuning completo (todos los pesos del transformer y la cabeza) sobre un conjunto de 2.614 mensajes etiquetados manualmente. Las etiquetas se generaron inicialmente con un LLM (DeepSeek) y se revisaron a mano para garantizar calidad. El entrenamiento utiliza una pérdida ponderada por clase para compensar el desequilibrio entre categorías, y se aplica early stopping basado en la macro-F1. La longitud máxima de secuencia se fijó en 96 tokens, suficiente para mensajes cortos típicos de comunidades de Telegram. Tras el entrenamiento, el modelo se exportó a ONNX y se cuantizó a INT8 para acelerar la inferencia en CPU.

## Capacidades

- Clasificación de intención en tres categorías: `offer` (el emisor ofrece su servicio), `request` (el emisor busca contratar o necesita un servicio) y `neither` (conversación general no relacionada).
- Inferencia rápida en CPU gracias a la cuantización INT8 (aproximadamente 2 ms por texto).
- Compatible con el ecosistema Hugging Face Transformers y con ONNX Runtime a través de `optimum.onnxruntime`.
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales; es un modelo puramente discriminativo para clasificación de texto corto.
- Multilingüe: solo inglés, aunque el modelo base tiene cierta capacidad multilingüe, el fine-tuning se realizó exclusivamente con datos en inglés.

## Casos de uso

- Moderación automática de comunidades freelance: el modelo puede clasificar cada mensaje entrante en un grupo de Telegram o foro y marcarlo como oferta, solicitud o irrelevante, permitiendo a los administradores priorizar o filtrar contenido.
- Enrutamiento de mensajes en plataformas de trabajo: en un marketplace de servicios, se puede usar para dirigir automáticamente las solicitudes de clientes al equipo de ventas y las ofertas de profesionales al equipo de revisión.
- Análisis de tendencias de mercado: agregando las clasificaciones de miles de mensajes, se puede medir la proporción de ofertas frente a solicitudes en un sector o región, útil para estudios de demanda y oferta laboral.
- Filtrado de spam o ruido en canales de comunicación: al identificar mensajes que no son ni oferta ni solicitud, se pueden descartar automáticamente o enviar a un canal secundario.
- Asistente de búsqueda de empleo: un bot puede usar el modelo para detectar mensajes de oferta y notificar a usuarios que buscan trabajo, o detectar solicitudes y avisar a freelancers relevantes.
- Automatización de respuestas en CRM: integrado en un sistema de tickets, el modelo puede etiquetar cada mensaje entrante y asignarlo al flujo de trabajo adecuado (por ejemplo, "solicitud de servicio" deriva a un formulario de contacto).

## Benchmarks y rendimiento

La model card del autor reporta los siguientes resultados sobre un conjunto de validación reservado (15% de los datos de entrenamiento, no visto durante el entrenamiento):

| Clase | Precision | Recall | F1 |
|---|---|---|---|
| offer | 0.74 | 0.87 | 0.80 |
| request | 0.93 | 0.88 | 0.90 |
| neither | 0.86 | 0.78 | 0.82 |
| **Accuracy** | | | **0.85** |
| **Macro avg** | 0.84 | 0.84 | **0.84** |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo ONNX INT8 requiere menos de 100 MB de RAM y procesa un texto en ~2 ms, por lo que puede ejecutarse en cualquier CPU moderna sin GPU.
- Inferencia en GPU: opcional, pero innecesaria dado el tamaño; cualquier GPU con al menos 1 GB de VRAM (por ejemplo, NVIDIA GTX 1050) es suficiente.
- Despliegue recomendado: ONNX Runtime (CPU) para producción ligera, o Hugging Face Inference Endpoints con la opción de cuantización.
- Compatible con frameworks: Transformers, Optimum, ONNX Runtime, y puede servirse con FastAPI o similares.
- Latencia: ~2 ms por texto en CPU con ONNX INT8; en GPU sería aún menor, pero no se han publicado cifras.

## Comparativa con modelos similares

No se dispone de información comparativa con otros clasificadores de intención en la documentación proporcionada. Como referencia, el modelo base `all-MiniLM-L6-v2` es un embedding model ampliamente usado, pero no hay datos de rendimiento frente a alternativas como `distilbert-base-uncased` o `bert-base-uncased` fine-tuneados para esta tarea específica.

## Limitaciones y advertencias

- Limitación conocida: el modelo falla con el patrón "I'm looking for [role] opportunities" cuando el hablante en realidad está ofreciendo su propio servicio; tiende a predecir "request" en lugar de "offer" con alta confianza. Se recomienda una regla de post-procesamiento para este caso concreto.
- Sesgo de datos: el entrenamiento se realizó con mensajes de grupos de Telegram de comunidades freelance, por lo que el vocabulario y los estilos de escritura pueden no generalizar a otros contextos (foros, redes sociales, correos formales).
- Solo inglés: no se ha evaluado su rendimiento en otros idiomas, y el fine-tuning se limitó a datos en inglés.
- Riesgo de alucinación: al ser un clasificador, no genera texto, pero puede asignar etiquetas incorrectas en casos ambiguos o con jerga específica no vista en el entrenamiento.
- Restricciones de licencia: licencia MIT, permite uso comercial sin restricciones, pero el modelo se distribuye tal cual, sin garantías.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/ademchaoua/freelance-offer-request-classifier)
- [Perfil del autor en Hugging Face](https://huggingface.co/ademchaoua)
- [Canal de Telegram del autor](https://t.me/s/aDemChaOua)
