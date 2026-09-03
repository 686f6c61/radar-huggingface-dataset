# DontYaps/qwen-3.5-2b-friendly-friend-merged

## Resumen

Este modelo es un fine-tuning del modelo base `unsloth/Qwen3.5-2B`, desarrollado por el usuario DontYaps. Se trata de un modelo de lenguaje de 2.274 millones de parámetros, orientado a conversación con un tono "amigable" según su nombre. El fine-tuning se realizó con la librería Unsloth y Hugging Face TRL, lo que permitió un entrenamiento aproximadamente dos veces más rápido que un enfoque estándar. La licencia es Apache-2.0, lo que facilita su uso comercial y modificación.

El modelo se presenta como un ajuste fino de Qwen3.5-2B, una arquitectura de la familia Qwen de Alibaba, aunque no se especifican detalles adicionales sobre la arquitectura interna. El repositorio incluye pesos en formato safetensors y está etiquetado para generación de texto e interacción conversacional. Aunque el pipeline indicado es `image-text-to-text`, la información disponible no confirma capacidades multimodales reales; probablemente se trate de una etiqueta genérica. La relevancia actual radica en ofrecer una variante ligera (2B) fine-tuneada para diálogos, con una licencia permisiva y un tamaño que permite su ejecución en hardware de consumo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 2.274.069.824 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Qwen3.5-2B. Se sabe que es un fine-tuning de `unsloth/Qwen3.5-2B`, realizado con las herramientas Unsloth y TRL de Hugging Face. No se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. La única innovación mencionada es el uso de Unsloth para acelerar el entrenamiento (aproximadamente 2x), pero no hay detalles sobre optimizaciones adicionales.

## Capacidades

- Generación de texto conversacional: el nombre del modelo sugiere un tono amigable, lo que lo hace adecuado para diálogos asistenciales o informales.
- Soporte de idioma inglés: la model card indica únicamente `en`.
- No se especifican capacidades de tool calling, razonamiento multi-paso, visión o audio en la información disponible.

## Casos de uso

- Chatbots de atención al cliente: al ser un modelo ligero de 2B parámetros, puede desplegarse en entornos con recursos limitados para gestionar conversaciones sencillas en inglés, ofreciendo respuestas cordiales.
- Asistentes personales en dispositivos edge: su tamaño permite ejecutarlo en hardware de consumo (GPUs de gama media) para tareas de asistencia doméstica o recordatorios.
- Prototipado rápido de aplicaciones conversacionales: gracias a la licencia Apache-2.0 y a la disponibilidad de pesos en safetensors, los desarrolladores pueden integrarlo fácilmente en pipelines de Hugging Face Transformers.
- Generación de respuestas en foros o plataformas de soporte: puede redactar borradores de respuestas amables para comunidades en línea, reduciendo el trabajo manual.
- Entrenamiento adicional o fine-tuning específico: al ser un modelo abierto y de tamaño moderado, sirve como base para ajustes en dominios concretos (por ejemplo, atención médica o educación) sin requerir infraestructura masiva.
- Evaluación de técnicas de alineación: al ser un fine-tuning reciente, puede utilizarse como caso de estudio para comparar metodologías de entrenamiento con Unsloth frente a otros frameworks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo.

## Requisitos de hardware

- VRAM estimada: para inferencia en FP16, el modelo requiere aproximadamente 4.5 GB de VRAM (2.27B parámetros × 2 bytes). Con cuantización a 4 bits, podría reducirse a ~1.2 GB, aunque no se confirma la disponibilidad de versiones cuantizadas.
- GPU recomendadas: tarjetas de consumo como RTX 3060 (12 GB), RTX 4070 (12 GB) o superiores pueden ejecutar el modelo sin problemas. También es viable en GPUs profesionales como A10 o L4.
- Compatibilidad con consumer GPU: sí, cabe en la mayoría de GPUs modernas de gama media y alta.
- Opciones de despliegue: al estar basado en Transformers, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama. No se confirma soporte explícito, pero es probable.
- Latencia y throughput: no se han publicado mediciones. Para un modelo de 2B, se espera una generación de decenas de tokens por segundo en GPUs como RTX 4090, pero estos valores son estimaciones no verificadas.

## Comparativa con modelos similares

No se dispone de datos comparativos con modelos de la misma categoría (por ejemplo, Qwen2.5-1.5B, Gemma-2-2B o Llama-3.2-1B). No hay información sobre benchmarks que permita una comparación objetiva.

## Limitaciones y advertencias

- El modelo solo soporta inglés según la model card; no se garantiza un buen rendimiento en otros idiomas.
- No se han documentado sesgos específicos, pero como cualquier modelo de lenguaje, puede reflejar sesgos presentes en sus datos de entrenamiento.
- Riesgo de alucinación: al ser un modelo pequeño, es probable que genere información incorrecta o inventada en temas especializados.
- No se especifica la longitud de contexto, por lo que el manejo de conversaciones largas o documentos extensos es incierto.
- La etiqueta de pipeline `image-text-to-text` no está respaldada por documentación; se recomienda tratar el modelo como texto puro.
- Para uso en producción, es necesario validar el comportamiento en el dominio específico y considerar la posibilidad de implementar guardas de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DontYaps/qwen-3.5-2b-friendly-friend-merged
- Repositorio de Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
