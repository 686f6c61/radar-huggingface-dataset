# Sorihon/Celestial-Order-24B-V2.5

## Resumen

Celestial-Order-24B-V2.5 es un modelo de lenguaje de 23.572 millones de parámetros creado por Sorihon mediante la fusión de dos modelos previos: Celestial-Order-24B-V2 (también de Sorihon) y Delta-Vector/Rei-24B-KTO. El resultado es un modelo de generación de texto orientado a conversación, construido sobre una arquitectura de tipo Mistral (transformer decoder-only) y publicado en formato safetensors.

El modelo se presenta como una iteración de la serie Celestial-Order, diseñada para mejorar la coherencia conversacional y el seguimiento de instrucciones mediante la combinación de pesos de modelos ya entrenados. Utiliza el método DARE TIES, una técnica de fusión que elimina una fracción de los pesos de cada modelo y promedia los restantes para conservar las capacidades de ambos sin necesidad de reentrenamiento.

La relevancia de este modelo radica en su enfoque de optimización sin entrenamiento adicional: cualquier desarrollador puede replicar el proceso de fusión con herramientas como mergekit, y el resultado ofrece un punto de partida para tareas de chat y generación de texto con una ventana de contexto estándar. Sin embargo, la ausencia de documentación sobre licencia, idiomas y benchmarks limita su adopción en entornos productivos sin evaluación previa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (tipo Mistral) |
| Parametros totales | 23.572.403.200 (23,5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponibles (pesos en bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es una fusión de dos modelos de 24B parámetros mediante el método DARE TIES (Drop And REscale TIES, descrito en el paper arxiv:2311.03099). La configuración de mergekit utilizada es la siguiente:

- Modelo base: `Sorihon/Celestial-Order-24B-V2` con densidad 0.64 y peso 0.64.
- Modelo a fusionar: `Delta-Vector/Rei-24B-KTO` con densidad 0.47 y peso 0.47.

DARE TIES funciona de la siguiente manera: para cada parámetro, se elimina (pone a cero) una fracción de los pesos según la densidad especificada, se aplica la magnitud de los pesos restantes y se combinan los signos mediante una votación mayoritaria. El resultado es un modelo que conserva las capacidades de ambos modelos originales sin necesidad de entrenamiento adicional.

No se ha publicado información sobre el dataset de entrenamiento de los modelos base, el número de tokens procesados ni el uso de técnicas de alineación como RLHF o DPO. El modelo se distribuye en formato safetensors con precisión bfloat16, lo que implica un tamaño de aproximadamente 47,2 GB en disco.

## Capacidades

- Generación de texto conversacional: al ser un merge de modelos de chat, está orientado a mantener diálogos multi-turno y seguir instrucciones de usuario.
- Razonamiento y comprensión de texto: las capacidades de razonamiento dependen de los modelos base (Celestial-Order-24B-V2 y Rei-24B-KTO), aunque no se han publicado métricas específicas.
- Soporte de tool calling / function calling: no se menciona de forma explícita en la documentación del modelo.
- Soporte de agentes y multi-step reasoning: no documentado.
- Capacidades multilingües: no se especifican idiomas soportados.
- Capacidades especiales (vision, audio, thinking mode): no se documentan; el modelo es exclusivamente de texto.

## Casos de uso

- Chatbots y asistentes conversacionales: el modelo puede usarse para construir sistemas de chat que requieran una comprensión contextual de diálogos, aprovechando su arquitectura de tipo Mistral y su entrenamiento conversacional.
- Generación de respuestas a instrucciones: sirve como backend para aplicaciones que necesitan seguir comandos de texto (resúmenes, redacción de correos, generación de contenido) si se valida su calidad con un conjunto de pruebas propio.
- Experimentación con técnicas de fusión de modelos: su configuración DARE TIES lo convierte en un ejemplo de referencia para investigar cómo combinar modelos de 24B sin reentrenamiento.
- Evaluación comparativa de merges: los desarrolladores pueden comparar su rendimiento frente a otros merges de 24B para tareas de conversación, aunque no hay benchmarks publicados.
- Despliegue local en GPU de 48 GB o superiores: con pesos en bfloat16, se puede ejecutar en hardware profesional (A6000, A100) para prototipado.
- Investigación de alineación: al estar basado en un modelo KTO (Rei-24B-KTO), puede ser útil para estudiar la influencia de la alineación por KTO en la calidad de las respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 23,5B parámetros en bfloat16, la inferencia requiere aproximadamente 47 GB de VRAM (2 bytes por parámetro). Con cuantizaciones a 8 bits, podría reducirse a ~24 GB, y a 4 bits a ~12 GB, pero no se ofrecen pesos cuantizados en el repositorio.
- GPU recomendadas: A100 80 GB, H100 80 GB, o dos GPUs de 24 GB (RTX 3090/4090) en paralelo con tensor parallelism.
- Compatibilidad con GPU de consumo: no cabe en una única GPU de 24 GB sin cuantización; se necesitaría cuantización GGUF o AWQ (no disponible).
- Opciones de despliegue: al ser un modelo transformers estándar, puede servirse con vLLM, TGI (Text Generation Inference), llama.cpp (si se convierten los pesos a GGUF) u Ollama (requiere conversión previa).
- Latencia y throughput: no se han publicado datos. En una A100 80 GB, un modelo de 24B en bfloat16 suele generar entre 20 y 40 tokens por segundo con vLLM, dependiendo de la configuración.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo ni de sus componentes base (Celestial-Order-24B-V2 y Rei-24B-KTO) para realizar una comparativa objetiva. Se pueden mencionar alternativas de tamaño similar, pero sin cifras concretas:

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Celestial-Order-24B-V2.5 (este) | 23,5B | No disponible | No disponible | Safetensors |
| Mistral-7B | 7B | 32K | Apache 2.0 | Safetensors |
| Llama-3-8B | 8B | 8K | Llama 3 License | Safetensors |
| Qwen-2.5-24B | 24B | 32K | Apache 2.0 | Safetensors |

No se recomienda usar este modelo en producción sin antes validar su rendimiento mediante pruebas internas, dado que no se han publicado métricas.

## Limitaciones y advertencias

- No se especifica la licencia, lo que impide su uso comercial o distribución sin aclaración legal.
- No se documentan los idiomas soportados; es posible que el rendimiento sea inconsistente en lenguas distintas del inglés.
- El modelo es un merge sin entrenamiento adicional, por lo que puede heredar sesgos y errores de los modelos base, incluyendo riesgo de alucinación.
- La longitud de contexto no está publicada; se asume que hereda la del modelo base (probablemente 4K o 8K, típico de Mistral), pero no es verificable.
- No se ofrecen pesos cuantizados, lo que limita su despliegue en hardware de consumo.
- No se han publicado benchmarks, por lo que no hay evidencia de su calidad en tareas estándar como MMLU, HumanEval o GSM8K.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Modelo en HuggingFace: [Sorihon/Celestial-Order-24B-V2.5](https://huggingface.co/Sorihon/Celestial-Order-24B-V2.5)
- Modelo base Celestial-Order-24B-V2: [https://huggingface.co/Sorihon/Celestial-Order-24B-V2](https://huggingface.co/Sorihon/Celestial-Order-24B-V2)
- Modelo Delta-Vector/Rei-24B-KTO: [https://huggingface.co/Delta-Vector/Rei-24B-KTO](https://huggingface.co/Delta-Vector/Rei-24B-KTO)
- Paper de DARE TIES: [https://arxiv.org/abs/2311.03099](https://arxiv.org/abs/2311.03099)
- Repositorio de mergekit: [https://github.com/cg123/mergekit](https://github.com/cg123/mergekit)
- Visualización de arquitectura: [https://hfviewer.com/Sorihon/Celestial-Order-24B-V2](https://hfviewer.com/Sorihon/Celestial-Order-24B-V2)
