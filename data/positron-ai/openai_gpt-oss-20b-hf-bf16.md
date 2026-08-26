# positron-ai/openai_gpt-oss-20b-hf-bf16

## Resumen

Este repositorio aloja un checkpoint en bf16 del modelo openai/gpt-oss-20b, publicado por Positron AI. El modelo original de OpenAI se distribuye con pesos en MXFP4 (cuantización de 4 bits); Positron AI lo ha desquantizado a bf16 sin aplicar ninguna otra cuantización, creando así un punto de referencia de precisión completa para comparar futuras versiones cuantizadas. El artefacto está pensado como baseline técnico, no como un modelo de producción independiente.

El modelo base, gpt-oss-20b, es una de las dos variantes open-weight de OpenAI (junto con gpt-oss-120b) lanzadas bajo licencia Apache 2.0, diseñadas para razonamiento potente, tareas agénticas y uso versátil en desarrollo. Aunque este checkpoint concreto no añade ninguna funcionalidad nueva respecto al original, su valor reside en ofrecer pesos en bf16 sin cuantizar, lo que permite evaluar la degradación de modelos cuantizados y servir como baseline para pruebas de calidad.

Con 20.914.757.184 parámetros y un tamaño de repositorio de 41,9 GB, este artefacto requiere al menos 42 GB de VRAM para cargarse en bf16. Es relevante para investigadores y desarrolladores que trabajan con optimización de inferencia y necesitan una referencia de precisión completa para comparar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-OSS (transformer) |
| Parámetros totales | 20.914.757.184 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | ninguno (bf16, desquantizado de MXFP4) |
| Idiomas soportados | no disponible |
| Licencia | other (el modelo base es Apache 2.0) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo (número de capas, heads, etc.) ni sobre el proceso de entrenamiento (tokens, dataset, técnicas de alineación) en la documentación proporcionada. El checkpoint es una conversión de los pesos originales de gpt-oss-20b desde MXFP4 a bf16, realizada por Positron AI. El modelo base, desarrollado por OpenAI, está diseñado para razonamiento y tareas agénticas, pero no se aportan datos adicionales sobre su arquitectura específica ni su metodología de entrenamiento en esta ficha.

## Capacidades

- Generación de texto en general, con foco en razonamiento complejo y tareas de agente.
- Soporte de tool calling / function calling, según la documentación oficial de OpenAI.
- Capacidad para tareas agénticas de múltiples pasos, como se indica en la presentación de gpt-oss.
- Optimizado para despliegue eficiente en hardware de consumidor, según OpenAI.
- No se documentan capacidades adicionales específicas (visión, audio, etc.) en la información disponible.

## Casos de uso

- **Baseline para evaluación de cuantización**: usar este checkpoint bf16 como referencia de precisión completa para medir la degradación de modelos cuantizados (por ejemplo, GPTQ o AWQ) mediante métricas como KL-divergencia o MMLU.
- **Validación de pipelines de inferencia**: desplegar este modelo en entornos de prueba para verificar que los sistemas de inferencia (vLLM, TGI, llama.cpp) funcionan correctamente con pesos bf16 antes de introducir versiones cuantizadas.
- **Investigación en compresión de modelos**: comparar la calidad de salida entre este artefacto y sus versiones MXFP4 o cuantizadas para estudiar el impacto de la reducción de precisión en la generación.
- **Desarrollo de aplicaciones de razonamiento**: como punto de partida para fine-tuning o pruebas de prompt engineering, aprovechando las capacidades de razonamiento del modelo base.
- **Evaluación de tool calling**: probar la integración con APIs y funciones externas en entornos de desarrollo, usando el modelo bf16 como referencia de comportamiento.
- **Pruebas de rendimiento en hardware**: medir latencia y throughput en GPUs específicas con este checkpoint sin cuantizar, estableciendo una línea base para comparar con versiones optimizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del artefacto indica que la evaluación de MMLU está pendiente ("pending"), y no se ofrecen otros datos de rendimiento.

## Requisitos de hardware

- VRAM estimada: al menos 41,9 GB para cargar los pesos en bf16 (20,9B parámetros × 2 bytes ≈ 41,8 GB). Se requiere una GPU con 48 GB o más, como NVIDIA A6000, A100 80GB, H100 80GB, o similar.
- No cabe en GPUs de consumo típicas (RTX 4090 tiene 24 GB, RTX 3090 24 GB, etc.) sin cuantización.
- Opciones de despliegue: compatible con transformers (biblioteca), y puede ser usado con vLLM, TGI o llama.cpp si se convierte a GGUF (pero este artefacto no incluye conversión).
- Latencia y throughput: no se han proporcionado datos. Dependen de la GPU y del backend utilizado.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoría (tamaño ~20B). Se sugiere consultar el modelo original openai/gpt-oss-20b para comparaciones con alternativas como Llama 3.1 8B o Mistral 7B, pero no se incluyen en esta ficha por falta de información.

## Limitaciones y advertencias

- Es un checkpoint de referencia, no un modelo de producción: no incluye configuración de cuantización ni optimizaciones de inferencia.
- Licencia: la metadata indica "other", aunque el modelo base es Apache 2.0. Se recomienda revisar los términos exactos de Positron AI y OpenAI antes de uso comercial.
- Alucinación y sesgos: no se han evaluado en este artefacto; el modelo base puede presentar sesgos y alucinaciones típicos de modelos de lenguaje de gran tamaño.
- Contexto: no se especifica la longitud de contexto, lo que impide conocer los límites de ventana.
- Idioma: no se documenta el soporte multilingüe; se asume que el modelo base funciona principalmente en inglés, pero no se confirma.
- Sin resultados de benchmarks: no hay evidencia cuantitativa de rendimiento en tareas estándar.

## Enlaces

- HuggingFace: https://huggingface.co/positron-ai/openai_gpt-oss-20b-hf-bf16
- Modelo original: https://huggingface.co/openai/gpt-oss-20b
- Repositorio GitHub de gpt-oss: https://github.com/openai/gpt-oss
- Blog de OpenAI sobre gpt-oss: https://openai.com/index/introducing-gpt-oss/
- Documentación de OpenAI API para gpt-oss-20b: https://developers.openai.com/api/docs/models/gpt-oss-20b
