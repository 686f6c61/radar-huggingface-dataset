# DanKau/g2-guard-onnx

## Resumen

G2-Guard es un modelo de guardrails para moderación de prompts y respuestas de modelos de lenguaje, presentado como exportación ONNX del modelo `fastino/gliguard-LLMGuardrails-300M`. Desarrollado por DanKau para el servicio SPAI de SecuPi, permite ejecutar detección de toxicidad, jailbreak, refusal y otros riesgos de seguridad mediante clasificación estructurada, sin necesidad de generación de texto. Su arquitectura se basa en un encoder DeBERTa-v3-base con una cabeza de clasificación que puntúa cada marcador `[L]` del esquema de etiquetas, lo que lo hace adecuado para integración en pipelines de moderación en producción.

La relevancia actual radica en la creciente necesidad de controlar la seguridad de los LLMs en entornos empresariales. Al estar exportado a ONNX, puede ejecutarse con ONNX Runtime desde Java u otros lenguajes sin dependencias de PyTorch, facilitando su despliegue en infraestructuras heterogéneas. El modelo hereda la licencia Apache 2.0 del modelo base, lo que permite uso comercial sin restricciones adicionales. El repositorio incluye los pesos serializados en formato ONNX, junto con la configuración y el tokenizador necesarios para su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v3-base (encoder) + cabeza de clasificación (Linear 768→1536 → ReLU → Linear 1536→1) |
| Parametros totales | 300M (según nombre del modelo base, no confirmado en la documentación) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (exportación ONNX sin cuantización declarada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (archivos .onnx) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `fastino/gliner2-base-v1`, que a su vez se basa en DeBERTa-v3. La arquitectura consta de un encoder que procesa el prompt de esquema junto con el texto a moderar, y una cabeza de clasificación que genera una puntuación por cada etiqueta `[L]` definida en el esquema. El export ONNX descompone el modelo en varios grafos: `encoder.onnx`, `classifier.onnx`, `span_rep.onnx` y `count_embed.onnx`. Este último implementa la capa `count_lstm_v2`, que utiliza un GRU y un transformer que atiende sobre el conjunto de etiquetas, permitiendo que la representación de una etiqueta dependa de las demás etiquetas presentes en la misma petición.

El entrenamiento original del modelo base no está documentado en la información proporcionada, pero se sabe que es un modelo de guardrails entrenado para clasificación de seguridad. La exportación ONNX fue verificada contra PyTorch nativo, con diferencias máximas de 1.9e-06 en el unroll del GRU y 3.8e-06 en ONNX Runtime, y 94/94 fixtures de clasificación reproducen las puntuaciones nativas dentro de 0.05.

## Capacidades

- Clasificación de texto para moderación de prompts y respuestas de LLMs.
- Detección de toxicidad, contenido dañino, intentos de jailbreak y respuestas de rechazo (refusal).
- Salida estructurada con puntuaciones por etiqueta, permitiendo umbrales configurables.
- Soporte para múltiples etiquetas en una misma petición gracias a la capa `count_lstm_v2`.
- Ejecución eficiente mediante ONNX Runtime, sin dependencias de frameworks de deep learning pesados.
- Compatible con integraciones en Java y otros lenguajes que soporten ONNX Runtime.

## Casos de uso

- Moderación de prompts en aplicaciones de chat: el modelo puede analizar cada mensaje entrante y bloquear o redirigir aquellos que contengan contenido tóxico, ofensivo o intentos de jailbreak, antes de que lleguen al LLM generativo.
- Filtrado de respuestas generadas: tras la generación, se puede puntuar la respuesta para detectar si el modelo ha producido contenido no seguro o ha rechazado la petición, permitiendo aplicar políticas de post-procesado.
- Auditoría de logs de interacción: procesar históricos de conversaciones para identificar patrones de abuso o intentos de explotación, facilitando el análisis forense y la mejora de políticas de seguridad.
- Integración en pipelines de CI/CD para evaluar la seguridad de prompts de prueba: al ser un clasificador ligero, puede ejecutarse en entornos de test automatizados para verificar que las nuevas versiones de un LLM no generan respuestas peligrosas.
- Servicio de moderación en tiempo real para APIs públicas: desplegado con ONNX Runtime en servidores Java, puede ofrecer latencias bajas para filtrar peticiones de usuarios en aplicaciones web.
- Complemento a sistemas de guardrails existentes: al ser un modelo de clasificación, puede combinarse con otros filtros basados en reglas o modelos generativos para crear una capa de defensa en profundidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Al ser un modelo de 300M de parámetros, la inferencia puede ejecutarse en CPU con un consumo de memoria moderado (aproximadamente 1-2 GB de RAM para el modelo en FP32, menos si se convierte a FP16).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA T4, RTX 3060) para inferencia acelerada, aunque no es imprescindible.
- Es adecuado para entornos de producción con recursos limitados, ya que no requiere GPUs de alta gama.
- Opciones de despliegue: ONNX Runtime (C++, Python, Java, C#), también puede ejecutarse con otros runtimes compatibles con ONNX como TensorRT o OpenVINO.
- Latencia estimada: en CPU moderna, una inferencia típica puede completarse en decenas de milisegundos; en GPU, en pocos milisegundos. No se dispone de cifras exactas.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de guardrails en la documentación proporcionada. Modelos como Llama Guard o ShieldGemma podrían ser alternativas, pero no hay datos de rendimiento ni características comparables en la información disponible.

## Limitaciones y advertencias

- No se han documentado sesgos específicos, pero al ser un modelo de clasificación entrenado sobre datos de seguridad, puede presentar falsos positivos o negativos en contextos culturales o lingüísticos diversos.
- Riesgo de alucinación no aplica directamente, ya que no genera texto, pero la clasificación puede ser incorrecta en casos ambiguos o con lenguaje figurado.
- La longitud de contexto no está especificada; se recomienda validar el comportamiento con textos largos antes de usarlo en producción.
- Los idiomas soportados no están documentados; el modelo base podría estar entrenado principalmente en inglés, por lo que su rendimiento en otros idiomas es incierto.
- La licencia Apache 2.0 permite uso comercial, pero se debe atribuir el crédito al modelo base (Fastino) según los términos de la licencia.
- El export ONNX está verificado para el caso de uso específico de SecuPi; otros usos pueden requerir pruebas adicionales de compatibilidad.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/DanKau/g2-guard-onnx)
- [Modelo base: fastino/gliguard-LLMGuardrails-300M](https://huggingface.co/fastino/gliguard-LLMGuardrails-300M)
- [Sitio web de SecuPi](https://www.secupi.com)
