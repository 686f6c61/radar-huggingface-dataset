# Edafe-Moses/nllb-finetuned-ig

## Resumen

El modelo `Edafe-Moses/nllb-finetuned-ig` es un fine-tuning del modelo de traducción automática NLLB-200, creado por Edafe-Moses y publicado en HuggingFace. Está etiquetado con la arquitectura `m2m_100`, lo que indica un transformer encoder-decoder orientado a traducción. Sus pesos ocupan 5,6 GB y suman 1.402.138.624 parámetros, una escala típica de la variante de 1.300 millones de parámetros de NLLB-200.

El sufijo `ig` en el nombre del repositorio sugiere que el afinado se realizó para el idioma igbo, aunque esta información no aparece en los metadatos. Si esa hipótesis es correcta, el modelo podría ofrecer mejores resultados en tareas de traducción con este idioma de bajos recursos. La relevancia del modelo está en el ámbito de la traducción multilingüe, donde los modelos de propósito general suelen flaquear en lenguas con pocos datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (tag `m2m_100`) |
| Parámetros totales | 1.402.138.624 |
| Parámetros activos | No aplicable (arquitectura densa, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (los pesos están en safetensors; el tamaño del repositorio sugiere FP32) |
| Idiomas soportados | No disponible (el modelo base NLLB-200 soporta más de 200 idiomas, pero el alcance del fine-tuning no se especifica) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura M2M-100, un transformer encoder-decoder desarrollado para traducción automática. NLLB-200 amplía esta arquitectura para cubrir más de 200 idiomas, empleando técnicas de minería de datos para obtener corpus de lenguas de bajos recursos. El presente repositorio contiene un fine-tuning de esa arquitectura, pero no se proporciona información sobre el conjunto de datos de entrenamiento ni el procedimiento de ajuste (por ejemplo, si se usó RLHF, DPO o fine-tuning supervisado). Tampoco se detallan innovaciones técnicas adicionales.

## Capacidades

- Traducción automática de texto entre idiomas: el modelo está diseñado para realizar traducciones, con una base de conocimiento de más de 200 idiomas en su versión original.
- Enfoque en lenguas de bajos recursos: al heredar la filosofía NLLB-200, puede resultar útil para idiomas con menos representación en corpus de entrenamiento.
- Soporte de secuencias de texto: procesa frases y párrafos; su salida es texto traducido, no respuestas de diálogo.
- No soporta tool calling ni function calling: es un modelo de traducción, no un asistente conversacional.
- No soporta razonamiento multi-paso, generación de código ni capacidades de visión o audio.
- Capacidades multilingües: depende del modelo base y del fine-tuning; no hay confirmación de los idiomas concretos para esta versión.

## Casos de uso

- Traducción de documentos para lenguas de bajos recursos: si el fine-tuning corresponde al igbo, el modelo puede utilizarse para traducir documentos legales, sanitarios o educativos a este idioma, reduciendo la dependencia de traductores humanos.
- Localización de aplicaciones móviles y web: puede integrarse en pipelines de internacionalización para traducir cadenas de texto y contenido de interfaz.
- Acceso a información global: en entornos donde los hablantes de lenguas minoritarias necesitan información en su idioma, el modelo puede traducir artículos de noticias o publicaciones.
- Asistencia en servicios de atención al cliente: un sistema backend podría usar este modelo para traducir mensajes de usuarios a un idioma común, facilitando la comunicación en soportes multilingües.
- Investigación académica sobre traducción: el modelo sirve como base para estudios de evaluación de calidad de traducción, especialmente en pares de idiomas poco representados.
- Prototipos de traducción en tiempo real: para aplicaciones de chat o foros, el modelo puede desplegarse en un servidor y traducir mensajes cortos, aunque la latencia dependerá del hardware disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K ni otros conjuntos de evaluación. Al ser un modelo de traducción, estos benchmarks no son representativos; sin embargo, no se aportan métricas de calidad de traducción (BLEU, COMET, chrF) en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - FP32: ~5,6 GB de pesos + activaciones; se recomienda 8-12 GB.
  - FP16: ~2,8 GB de pesos; se recomienda 4-6 GB.
  - INT8: ~1,4 GB de pesos; se recomienda 2-4 GB.
- GPU recomendadas: RTX 3060 12GB o superior para FP32; RTX 4060 8GB para FP16; A100/H100 para servicios con alta concurrencia.
- Disponibilidad en GPU de consumo: sí, con suficiente VRAM en FP16 o INT8; en FP32 requiere al menos una GPU de 12GB.
- Opciones de despliegue: Hugging Face Transformers, TGI, vLLM (si se soporta encoder-decoder), ONNX Runtime.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente en los datos facilitados para comparar este modelo con otras variantes de NLLB-200 o modelos de traducción similares. No se proporcionan métricas de rendimiento, licencia ni detalles de otros modelos en la búsqueda web realizada. Por tanto, la comparativa se limita a indicar que los datos son no disponibles.

## Limitaciones y advertencias

- Sesgos conocidos: no se ofrecen evaluaciones de sesgo. Los modelos entrenados en corpus de baja calidad para lenguas minoritarias pueden heredar estereotipos o errores lingüísticos.
- Riesgo de alucinación: como todo modelo de traducción, puede generar traducciones incorrectas o inventar términos no presentes en la entrada, especialmente en dominios técnicos o poco frecuentes.
- Limitaciones de idioma: no se especifica el par de idiomas de este fine-tuning; es necesario verificar manualmente el comportamiento antes de usarlo en producción.
- Restricciones de licencia: la licencia del modelo no está indicada en el repositorio. Si los pesos derivan de NLLB-200, el modelo original puede tener restricciones de uso comercial, por lo que se recomienda revisar la licencia del modelo base antes de cualquier despliegue.
- Falta de documentación: no hay información sobre el conjunto de datos de ajuste ni sobre la arquitectura exacta, lo que dificulta la reproducibilidad.
- Contexto limitado: la longitud de contexto no está disponible; los modelos NLLB suelen procesar secuencias cortas o párrafos, no documentos largos.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Edafe-Moses/nllb-finetuned-ig
- Documentación de NLLB en Hugging Face: https://huggingface.co/docs/transformers/model_doc/nllb
- Guía de fine-tuning de NLLB-200 (DeepWiki): https://deepwiki.com/ymoslem/Adaptive-MT-LLM-Fine-tuning/4.2-nllb-200-fine-tuning
