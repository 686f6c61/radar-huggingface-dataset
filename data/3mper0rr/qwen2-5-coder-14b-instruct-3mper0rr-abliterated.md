# 3MPER0RR/Qwen2.5-Coder-14B-Instruct-3MPER0RR-abliterated

## Resumen

El modelo 3MPER0RR/Qwen2.5-Coder-14B-Instruct-3MPER0RR-abliterated es una variante experimental del modelo Qwen2.5-Coder-14B-Instruct, desarrollado por Alibaba Qwen y modificado por el usuario 3MPER0RR mediante una técnica de abliteración. Esta técnica elimina el comportamiento de rechazo (refusal) del modelo, de modo que responde a prompts que normalmente serían bloqueados por las restricciones de seguridad. El modelo original es un transformer decoder-only de 14.770.033.664 parámetros, especializado en generación de código, con una ventana de contexto de 32.768 tokens y licencia Apache 2.0. La variante abliterated conserva la arquitectura y el tamaño del modelo base, pero su comportamiento en cuanto a seguridad es diferente. El repositorio contiene los pesos en formato safetensors (29,6 GB) y no se han publicado resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-Coder-14B-Instruct) |
| Parámetros totales | 14.770.033.664 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (según el modelo base) |
| Tipos de cuantización | No disponible (el repositorio contiene pesos en safetensors, aparentemente en bfloat16) |
| Idiomas soportados | No disponible en la información proporcionada; el modelo base está entrenado principalmente en inglés y chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-Coder-14B-Instruct es un transformer decoder-only con 14.770.033.664 parámetros, que utiliza atención de múltiples cabezas, normalización RMSNorm y activación SwiGLU. Fue entrenado por Alibaba Qwen con un corpus masivo de código y texto, y posteriormente ajustado mediante instrucciones. No se disponen de datos específicos sobre el número de tokens de entrenamiento ni la composición del dataset en la información proporcionada. La variante abliterated ha sido modificada mediante un procedimiento de abliteración, que identifica y elimina la dirección en el espacio de activaciones responsable del rechazo de respuestas. El autor indica "Trials: [200]" y "Status: Tested and saved", lo que sugiere que se realizaron 200 iteraciones o pruebas antes de guardar el resultado. No se proporcionan más detalles sobre el proceso.

## Capacidades

- Generación de código en múltiples lenguajes de programación, ya que el modelo base está especializado en tareas de programación.
- Razonamiento y generación de texto en contextos largos, gracias a la ventana de 32.768 tokens.
- Soporte de tool calling / function calling, que permite al modelo interactuar con herramientas externas.
- Soporte de agentes y razonamiento multi-paso, útil para tareas complejas de programación.
- Capacidades multilingües, con un rendimiento principal en inglés y chino.
- Al estar abliterated, el modelo no rechaza prompts que normalmente serían rechazados, lo que puede ser útil para investigación en seguridad de IA o para aplicaciones que requieren respuestas sin filtros.

## Casos de uso

- Asistente de programación en el IDE: el modelo puede integrarse en entornos como Visual Studio Code o JetBrains para autocompletar código, generar pruebas unitarias y explicar fragmentos. Su ventana de contexto de 32.768 tokens permite mantener conversaciones largas sobre un proyecto.
- Generación de código en pipelines de CI/CD: gracias a su soporte de tool calling, puede usarse para revisar código automáticamente, detectar errores y sugerir correcciones en flujos de integración continua.
- Refactorización automatizada: el modelo puede analizar código existente y proponer refactorizaciones, como extraer funciones, simplificar condicionales o renombrar variables, reduciendo el tiempo de mantenimiento.
- Agentes de desarrollo autónomos: al soportar razonamiento multi-paso y tool calling, puede integrarse en agentes que navegan por repositorios, ejecutan comandos y depuran código de forma autónoma.
- Investigación en seguridad de IA: la variante abliterated es útil para estudiar cómo la eliminación de restricciones afecta al comportamiento del modelo, por ejemplo, en la generación de contenido potencialmente dañino o en la evaluación de alineación.
- Fine-tuning para dominios específicos: el modelo puede servir como punto de partida para ajustar un modelo de código en un lenguaje de programación propietario o en un dominio con terminología propia, gracias a su licencia Apache 2.0.
- Documentación técnica y educación: puede generar ejemplos de código, tutoriales y explicaciones de conceptos de programación, adaptados al nivel del lector.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No es posible comparar el rendimiento de esta variante con otros modelos de forma objetiva.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bfloat16 ocupan aproximadamente 29,5 GB, por lo que se necesitan al menos 32-40 GB de VRAM para inferencia sin cuantizar. Con cuantización 4-bit (si se convierte el modelo), la VRAM requerida puede reducirse a unos 8-10 GB.
- GPU recomendadas: A100 40GB, A100 80GB o H100 80GB para inferencia sin cuantizar. En GPUs de consumo, una RTX 4090 (24 GB) no es suficiente en bfloat16, pero puede funcionar con cuantización 4-bit.
- Opciones de despliegue: el modelo puede desplegarse con vLLM, Hugging Face Transformers (con bitsandbytes para cuantización), o convertirse a GGUF para usarse con llama.cpp u Ollama. También es compatible con TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| 3MPER0RR/Qwen2.5-Coder-14B-Instruct-3MPER0RR-abliterated | 14.770.033.664 | 32.768 tokens | Apache 2.0 | Variante abliterated experimental |
| Qwen/Qwen2.5-Coder-14B-Instruct | 14.770.033.664 | 32.768 tokens | Apache 2.0 | Modelo original con restricciones de seguridad |
| CodeLlama-13B-Instruct | 13.000.000.000 (aprox.) | 16.384 tokens | Llama 2 Community License | Modelo de código de Meta |
| DeepSeek-Coder-14B-Instruct | 14.000.000.000 (aprox.) | 16.384 tokens | MIT | Modelo de código de DeepSeek |

## Limitaciones y advertencias

- Al ser una variante abliterated, se han eliminado las restricciones de seguridad del modelo base. Esto significa que puede generar contenido dañino, ilegal o no ético sin ningún filtro. No debe desplegarse en aplicaciones públicas sin una revisión exhaustiva de riesgos.
- No se ha publicado información sobre el proceso de abliteración ni sobre la calidad del resultado. El autor indica "Trials: [200]" y "Status: Tested and saved", pero no hay documentación técnica.
- El modelo tiene 0 descargas y 0 likes en Hugging Face, lo que indica que no ha sido probado por la comunidad.
- El modelo base puede sufrir alucinaciones, y la abliteración puede aumentar este riesgo al no filtrar respuestas.
- El rendimiento en castellano puede ser inferior al de inglés y chino, ya que el modelo base está entrenado principalmente en esos idiomas.
- La licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el contenido generado recae en el usuario.

## Enlaces

- https://huggingface.co/3MPER0RR/Qwen2.5-Coder-14B-Instruct-3MPER0RR-abliterated
- https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
