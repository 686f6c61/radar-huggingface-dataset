# llmfan46/gpt-oss-120b-heretic-v2

## Resumen

`llmfan46/gpt-oss-120b-heretic-v2` es una variante "decensored" (abliterated) del modelo `openai/gpt-oss-120b` de OpenAI, publicada por el contribuidor independiente llmfan46. El modelo base es un transformer de tipo Mixture-of-Experts (MoE) con 116.789.336.640 parámetros totales (aproximadamente 117B) y 5.1B parámetros activos por token, disenado por OpenAI para razonamiento de alta capacidad, tareas agénticas y uso general en producción dentro de una única GPU de 80 GB.

La modificación se ha realizado con la herramienta Heretic v1.2.0 aplicando el método Arbitrary-Rank Ablation (ARA), una técnica de abliteration que elimina direcciones de activación asociadas al rechazo de peticiones. Según la model card del autor, el resultado reduce los rechazos de 98/100 a 9/100 en su conjunto de evaluación, con una divergencia KL de 0.0179 respecto al modelo original, lo que indica una degradación limitada de coherencia y capacidades.

Es relevante para desarrolladores e investigadores que necesitan un modelo de razonamiento de gran escala sin las capas de rechazo del modelo original, manteniendo la licencia Apache 2.0 y el formato harmony de OpenAI. El repositorio ocupa 65.4 GB y se distribuye en safetensors con cuantización MXFP4 de los pesos MoE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) |
| Parametros totales | 116.789.336.640 (~117B) |
| Parametros activos | 5.1B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (pesos MoE, post-entrenamiento); versiones GGUF disponibles en repo separado |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF en `llmfan46/gpt-oss-120b-heretic-v2-GGUF` |

## Arquitectura y entrenamiento

El modelo base `gpt-oss-120b` es un transformer con arquitectura Mixture-of-Experts de 117B parámetros totales y 5.1B activos por token, entrenado por OpenAI y publicado bajo licencia Apache 2.0. Los pesos MoE fueron sometidos a una cuantización MXFP4 durante el post-entrenamiento, lo que permite que el modelo completo se ejecute en una única GPU de 80 GB (H100 o MI300X). El modelo utiliza el formato de respuesta harmony de OpenAI, y según la documentación del modelo base solo funciona correctamente con dicho formato.

La variante heretic-v2 aplica abliteration mediante Heretic v1.2.0 con el método Arbitrary-Rank Ablation (ARA). Los parámetros de ablación reportados son: `start_layer_index` 18, `end_layer_index` 23, `preserve_good_behavior_weight` 0.0253, `steer_bad_behavior_weight` 0.0099, `overcorrect_relative_weight` 0.9989 y `neighbor_count` 10. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base más allá de lo indicado en la documentación de OpenAI.

## Capacidades

- Generación de texto y razonamiento de alta capacidad con esfuerzo de razonamiento configurable (low, medium, high).
- Cadena de pensamiento completa (full chain-of-thought) accesible para depuración, no pensada para mostrarse al usuario final.
- Capacidades agénticas nativas: function calling, navegación web y ejecución de código Python.
- Soporte de Structured Outputs.
- Formato harmony de OpenAI para conversaciones multi-turno y roles.
- Fine-tuning completo posible sobre los pesos publicados.
- Reducción drástica de rechazos (9/100 frente a 98/100 del original) según la evaluación del autor.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el comportamiento de un LLM de gran escala sin capas de rechazo, comparando respuestas con el original y midiendo el efecto de la abliteration sobre la coherencia (KL 0.0179).
- Generación de código en pipelines de CI/CD: con 5.1B parámetros activos y soporte de tool calling, puede integrarse en flujos de revisión automática y generación de parches donde se requiere ejecución en una sola GPU de 80 GB.
- Agentes autónomos multi-paso: las capacidades nativas de function calling, navegación web y ejecución de Python permiten construir agentes que resuelven tareas compuestas sin capas de rechazo que interrumpan el flujo.
- Razonamiento matemático y analítico: el modo de razonamiento configurable (low/medium/high) permite ajustar latencia y profundidad según la tarea, adecuado para análisis de datos y resolución de problemas.
- Generación de contenido creativo sin restricciones: útil en entornos de investigación y creación donde las capas de rechazo del modelo original limitan la exploración de temas sensibles.
- Evaluación comparativa de modelos abliterated: sirve como referencia para medir el impacto de distintas técnicas de ablación (Heretic, ARA) sobre rendimiento y calidad en benchmarks estandarizados.
- Despliegue en producción con vLLM: el tag `vllm` y la compatibilidad con endpoints facilitan el servicio en infraestructura propia con una H100 o MI300X.

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo original (gpt-oss-120b) |
|---|---|---|
| Divergencia KL | 0.0179 | 0 (por definición) |
| Rechazos | 9/100 | 98/100 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo base está diseñado para ejecutarse en una única GPU de 80 GB gracias a la cuantización MXFP4 de los pesos MoE. El repositorio ocupa 65.4 GB en safetensors.
- GPU recomendadas: NVIDIA H100 (80 GB) o AMD MI300X (192 GB) para el modelo completo en MXFP4. Para cuantizaciones GGUF de menor precisión, se requiere hardware con menos VRAM, aunque no se especifican los requisitos exactos en la información disponible.
- GPU de consumo: no se confirma que quepa en GPU de consumo (RTX 4090 de 24 GB) en su formato safetensors; las versiones GGUF del repo separado podrían permitir despliegue en configuraciones de menor VRAM, pero no se detallan los tamaños.
- Opciones de despliegue: transformers, vLLM (tag explícito), llama.cpp/Ollama mediante los GGUF publicados en `llmfan46/gpt-oss-120b-heretic-v2-GGUF`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| gpt-oss-120b-heretic-v2 (este) | ~117B | 5.1B | no disponible | Apache 2.0 | Abliterated, 9/100 rechazos, KL 0.0179 |
| openai/gpt-oss-120b | ~117B | 5.1B | no disponible | Apache 2.0 | Original, 98/100 rechazos |
| openai/gpt-oss-20b | 21B | 3.6B | no disponible | Apache 2.0 | Menor latencia, cabe en 16 GB |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La abliteration elimina las capas de rechazo, lo que puede producir contenido ofensivo, sesgado o inapropiado; no es adecuado para aplicaciones dirigidas al público general sin filtros adicionales.
- Riesgo de alucinación inherente al modelo base, no mitigado por la modificación.
- La divergencia KL de 0.0179 indica cierta degradación de coherencia y capacidades respecto al original, aunque el autor la califica de limitada.
- El modelo solo funciona correctamente con el formato harmony de OpenAI; su uso fuera de dicho formato puede producir resultados incorrectos.
- No se especifican los idiomas soportados ni la longitud de contexto en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el autor advierte que ha alcanzado el límite de almacenamiento gratuito de Hugging Face y depende de donaciones para mantener los modelos disponibles.
- El repositorio tiene solo 114 descargas y 2 likes, lo que sugiere una validación comunitaria muy limitada.
- El uso de un modelo decensored en producción puede incumplir políticas de plataformas o requisitos regulatorios según el sector.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llmfan46/gpt-oss-120b-heretic-v2
- Versión GGUF: https://huggingface.co/llmfan46/gpt-oss-120b-heretic-v2-GGUF
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Pull request ARA: https://github.com/p-e-w/heretic/pull/211
- Paper gpt-oss: https://arxiv.org/abs/2508.10925
- Blog de OpenAI: https://openai.com/index/introducing-gpt-oss/
- Documentación harmony: https://github.com/openai/harmony
- Guías gpt-oss: https://cookbook.openai.com/topic/gpt-oss
- Sitio gpt-oss: https://gpt-oss.com
- Ko-fi del autor: https://ko-fi.com/llmfan46
