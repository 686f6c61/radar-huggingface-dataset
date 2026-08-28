# mocomoco-inc/mocovoice-whisper-turbo-ja-logistics-synthetic-v0.1

## Resumen

El modelo `mocomoco-inc/mocovoice-whisper-turbo-ja-logistics-synthetic-v0.1` es un prototipo de adaptación léxica para el dominio logístico en japonés, desarrollado por mocomoco inc. sobre la base de Whisper large-v3-turbo de OpenAI. Se distribuye únicamente en formato CTranslate2 (CT2) con cuantización int8, e incluye un adaptador LoRA fusionado que ha sido entrenado con datos sintéticos. El objetivo es mejorar el reconocimiento de terminología específica de logística, como códigos, números y unidades, en transcripciones de voz. Sin embargo, el propio autor lo describe como un artefacto de demostración y marketing, no como un modelo de producción o certificado para seguridad.

La relevancia de este lanzamiento radica en que muestra un flujo completo de adaptación de un ASR multilingüe a un dominio vertical mediante LoRA y datos sintéticos, con un empaquetado ligero para inferencia en CT2. No obstante, carece de validación con datos reales y no debe usarse en entornos productivos sin una evaluación exhaustiva. El repositorio incluye scripts de entrenamiento, un contrato de datos y un archivo de recepción con hashes SHA-256 para trazabilidad, pero no distribuye los pesos del adaptador por separado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Whisper large-v3-turbo (transformer encoder-decoder) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 (CTranslate2) |
| Idiomas soportados | japonés (ja) |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (CT2) |

## Arquitectura y entrenamiento

El modelo parte de Whisper large-v3-turbo, una versión podada de Whisper large-v3 con menos capas de decodificador (4 en lugar de 32), lo que lo hace más rápido. Sobre esta base se aplicó un fine-tuning con LoRA (Low-Rank Adaptation) utilizando datos sintéticos de voz en japonés específicos del dominio logístico. El adaptador LoRA se fusionó con el modelo base y se convirtió a formato CTranslate2 con cuantización int8 para su distribución. El repositorio incluye el contrato de datos, los scripts de entrenamiento y un archivo de recepción con hashes SHA-256 para trazabilidad. No se distribuyen los pesos del adaptador por separado ni un checkpoint Transformers fusionado.

## Capacidades

- Reconocimiento de voz automático (ASR) en japonés, especializado en terminología logística.
- Adaptación léxica para términos controlados como códigos, números y unidades.
- Inferencia eficiente gracias a la cuantización int8 y al formato CT2.
- No incluye capacidades de traducción, tool calling ni otras funciones más allá del ASR.

## Casos de uso

- Transcripción de comunicaciones de almacén: el modelo puede transcribir conversaciones entre operarios, pero al ser un prototipo, requiere validación con datos reales.
- Asistencia por voz en inventario: podría usarse para dictar códigos de producto, aunque la precisión no está garantizada.
- Documentación de incidencias logísticas: transcribir partes de incidencias para su registro en sistemas de gestión.
- Formación de modelos específicos: sirve como ejemplo de adaptación de Whisper a un dominio con datos sintéticos.
- Evaluación de flujos de adaptación: útil para investigar técnicas de LoRA y cuantización en ASR.
- Demostración de producto: mocoVoice lo utiliza como artefacto de marketing para mostrar capacidades de personalización.

## Benchmarks y rendimiento

El autor proporciona evaluaciones sintéticas controladas, no benchmarks estándar como MMLU o HumanEval. Los resultados se basan en un holdout sintético con plantillas de prompts no vistas, pero con términos controlados que se solapan entre entrenamiento y evaluación. La siguiente tabla resume la comparación entre el modelo base genérico y el modelo de dominio entregado, ambos decodificados con el mismo wrapper CT2:

| Métrica | CT2 genérico | CT2 dominio entregado |
|---|---|---|
| CER dominio | 0.1668 | 0.1660 |
| Término presente | 90/138 (65.2%) | 92/138 (66.7%) |
| Término presente (sin puntuación) | 90/138 (65.2%) | 92/138 (66.7%) |
| Hecho de código controlado | 24/46 (52.2%) | 25/46 (54.3%) |
| Valor numérico controlado | 46/46 (100.0%) | 46/46 (100.0%) |
| Hecho valor + unidad | 45/46 (97.8%) | 45/46 (97.8%) |

Además, se comparó el modelo CT2 int8 con un checkpoint Transformers de referencia no distribuido: 81 de 150 salidas coincidieron exactamente tras normalización, con un CER de 0.0482 entre ambos. Estas cifras son diagnósticos de control, no afirmaciones de precisión en el mundo real.

## Requisitos de hardware

- Tamaño del repositorio: 0.8 GB, lo que sugiere un modelo ligero en int8.
- Al ser CTranslate2, puede ejecutarse en CPU y GPU con poca VRAM, aunque no se especifican requisitos mínimos.
- No se proporcionan datos de latencia ni throughput.
- Opciones de despliegue: CTranslate2 es la librería principal; no se mencionan vLLM, Ollama u otras.

## Comparativa con modelos similares

La comparación más directa es con el modelo base Whisper large-v3-turbo genérico, que es el punto de partida. El adaptador de dominio busca mejorar la terminología logística, pero en las métricas sintéticas la mejora es marginal: el CER pasa de 0.1668 a 0.1660 y la presencia de términos de 65.2% a 66.7%. No se dispone de comparaciones con otros modelos ASR japoneses como ReazonSpeech o Kotoba en la información proporcionada.

## Limitaciones y advertencias

- Es un prototipo de demostración, no un modelo de producción ni certificado para seguridad.
- No se ha validado con grabaciones reales; solo con datos sintéticos.
- No hay garantía de precisión en códigos, números, unidades o fechas.
- No debe usarse para decisiones autónomas o tareas de seguridad.
- La licencia MIT permite uso comercial, pero el autor desaconseja su uso en producción sin evaluación exhaustiva.
- El modelo solo soporta japonés.

## Enlaces

- HuggingFace: https://huggingface.co/mocomoco-inc/mocovoice-whisper-turbo-ja-logistics-synthetic-v0.1
- Web de mocoVoice: https://products.mocomoco.ai/en/
- Noticia de mocoVoice Web: https://www.mocomoco.ai/en/news/mocoVoice-web/
- GitHub de mocomoco: https://github.com/mocomoco-inc
