# oxalis-ink/shamrock-0-e2b

## Resumen

El modelo `oxalis-ink/shamrock-0-e2b` es un ajuste fino (fine-tune) de Google Gemma 4 E2B, desarrollado por Oxalis Ink para su aplicación de escritorio Oxalis, orientada al aprendizaje de idiomas. El modelo está especializado en tareas de traducción (texto y cámara), tutoría conversacional, chat y consulta de diccionario para japonés, coreano y chino simplificado. Se distribuye con pesos en formato fp16 (safetensors) y cuantizaciones GGUF, además de un drafter MTP para decodificación especulativa.

Con 5.101.150.240 parámetros y una ventana de contexto de 8192 tokens (según fuente externa), el modelo ofrece un equilibrio entre capacidad y eficiencia para su integración en aplicaciones de escritorio. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas, lo que lo hace atractivo para productos educativos y de traducción. La relevancia actual radica en su especialización en idiomas asiáticos, un nicho donde los modelos generalistas suelen rendir peor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E2B) |
| Parametros totales | 5.101.150.240 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens (según free2aitools) |
| Tipos de cuantizacion | fp16 (safetensors), GGUF Q4_K_M, f16 (mmproj), Q8_0 (MTP) |
| Idiomas soportados | Japonés, coreano, chino simplificado (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Gemma 4 E2B de Google, un transformer denso de aproximadamente 5.1B parámetros. No se han publicado detalles específicos sobre el proceso de entrenamiento del fine-tune, como el número de tokens, la composición del dataset o el uso de técnicas de alineación (RLHF/DPO). La model card indica que el ajuste se realizó sobre las superficies de aprendizaje de idiomas de la app Oxalis, lo que sugiere un entrenamiento supervisado con datos de traducción y conversación multilingüe.

Una innovación destacable es la inclusión de un drafter MTP (multi-token prediction) para decodificación especulativa, disponible tanto en formato GGUF (para llama.cpp) como en formato Hugging Face. Este componente acelera la inferencia al predecir varios tokens por paso, reduciendo la latencia en aplicaciones interactivas.

## Capacidades

- Traducción de texto entre japonés, coreano y chino simplificado, y probablemente hacia/desde otros idiomas (no especificado).
- Traducción por cámara (reconocimiento óptico de caracteres integrado con el modelo de visión, ya que es image-text-to-text).
- Tutor de idiomas: conversación interactiva con correcciones y explicaciones.
- Chat conversacional multilingüe.
- Consulta de diccionario y explicaciones de vocabulario.
- Soporte de decodificación especulativa mediante drafter MTP para reducir latencia.
- No se menciona soporte explícito de tool calling o function calling.

## Casos de uso

- Aplicación de aprendizaje de idiomas: el modelo actúa como tutor conversacional, manteniendo diálogos multi-turno en japonés, coreano o chino, corrigiendo errores y ofreciendo explicaciones gramaticales. Su contexto de 8192 tokens permite manejar conversaciones extensas sin perder el hilo.
- Traducción instantánea por cámara: al ser un modelo image-text-to-text, puede procesar imágenes capturadas por la cámara del dispositivo, extraer el texto y traducirlo en tiempo real, ideal para viajeros o estudiantes que leen carteles, menús o documentos.
- Traducción de documentos técnicos: con su especialización en idiomas asiáticos, puede traducir manuales, artículos o correos con mayor precisión que modelos generalistas, gracias al fine-tune con datos específicos de esos idiomas.
- Asistente de vocabulario: integrado en un diccionario, el modelo puede generar ejemplos de uso, sinónimos y explicaciones contextuales, ayudando a los estudiantes a comprender matices de palabras.
- Práctica de pronunciación y conversación: mediante la función "talk", el modelo puede simular conversaciones cotidianas, permitiendo a los usuarios practicar fluidez y comprensión auditiva (si se combina con síntesis de voz).
- Integración en pipelines de traducción automática: al ser un modelo ligero (5.1B), puede desplegarse en servidores modestos o en equipos de escritorio, sirviendo como motor de traducción para aplicaciones de productividad o atención al cliente en mercados asiáticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo específico. Tampoco se ofrecen comparaciones cuantitativas con otros modelos en la model card o en las fuentes consultadas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 5.1B parámetros en fp16, se requieren aproximadamente 10-11 GB de VRAM. Con cuantización Q4_K_M, la huella se reduce a unos 3-4 GB, permitiendo ejecución en GPUs de consumo.
- GPUs recomendadas: para fp16, una RTX 3090, RTX 4090 o A100 son adecuadas. Para GGUF Q4_K_M, una RTX 3060 de 12 GB o superior es suficiente.
- Compatibilidad con consumer GPU: sí, especialmente con cuantización GGUF. Modelos como RTX 4060 Ti (16 GB) o RTX 4070 pueden ejecutarlo cómodamente.
- Opciones de despliegue: llama.cpp (con soporte para el drafter MTP mediante `--spec-type draft-mtp`), vLLM, Ollama (si se convierte el GGUF), y Transformers con Hugging Face.
- Latencia y throughput: no se han publicado cifras oficiales. Con decodificación especulativa, se espera una mejora significativa en velocidad de generación, aunque los valores concretos dependen del hardware y la configuración.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de la misma categoría. El modelo base Gemma 4 E2B (google/gemma-4-E2B-it) es el punto de partida, pero no se han publicado métricas comparativas entre el fine-tune y el original. Tampoco se conocen otros modelos especializados en traducción japonés-coreano-chino con características similares. Por tanto, la comparativa se limita a indicar que el modelo es un ajuste especializado del Gemma 4 E2B, con la ventaja de su licencia Apache 2.0 y su soporte para decodificación especulativa.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo de lenguaje, puede generar contenido incorrecto o inventado, especialmente en tareas de traducción donde el contexto es ambiguo. No se han realizado evaluaciones de sesgo específicas para este modelo.
- Limitaciones de idioma: el fine-tune se centra en japonés, coreano y chino simplificado. Su rendimiento en otros idiomas puede ser inferior al del modelo base Gemma 4.
- Contexto limitado: con 8192 tokens, no es adecuado para documentos muy largos o conversaciones extremadamente extensas sin truncamiento.
- Dependencia del modelo base: al ser un fine-tune, hereda las limitaciones y riesgos del Gemma 4 E2B original, incluyendo posibles sesgos en datos de entrenamiento.
- Requisitos de integración: el uso del drafter MTP requiere configuraciones específicas en llama.cpp; si no se utiliza, la inferencia será más lenta pero funcional.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar los términos adicionales de la licencia de Gemma 4 (enlace en la model card) para asegurar cumplimiento.

## Enlaces

- [Hugging Face - oxalis-ink/shamrock-0-e2b](https://huggingface.co/oxalis-ink/shamrock-0-e2b)
- [Perfil de Oxalis en Hugging Face](https://huggingface.co/oxalis-ink)
- [Shamrock 0 E2b - AI Model Insights & Benchmarks (free2aitools)](https://free2aitools.com/model/oxalis-ink/shamrock-0-e2b)
- [Gemma 4: All Models Compared — 2B to 27B (aimadetools)](https://www.aimadetools.com/blog/gemma-4-family-guide/)
- [Gemma 4: How a 31B Model Beats 400B Rivals (tech-insider.org)](https://tech-insider.org/google-gemma-4-open-model-benchmarks-2026/)
