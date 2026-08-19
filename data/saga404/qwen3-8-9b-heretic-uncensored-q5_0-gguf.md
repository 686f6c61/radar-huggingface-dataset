# saga404/Qwen3.8-9B-heretic-uncensored-Q5_0-GGUF

## Resumen

El modelo `saga404/Qwen3.8-9B-heretic-uncensored-Q5_0-GGUF` es una conversión a formato GGUF (cuantización Q5_0) del modelo `rohit267/Qwen3.8-9B-heretic-uncensored`, realizado por el usuario saga404 mediante la herramienta GGUF-my-repo de llama.cpp. El modelo original es una destilación completa de parámetros del modelo Qwen3.8 (2,4 billones de parámetros, arquitectura MoE A95B) sobre la arquitectura densa Qwen3.5-9B, entrenado con aproximadamente 70.000 trazas de razonamiento del profesor, cubriendo matemáticas, código, razonamiento general, seguimiento de instrucciones y uso de herramientas. Posteriormente se le aplicó la técnica "heretic" (abliteración) para eliminar la alineación de seguridad, dando lugar a un modelo sin censura.

La conversión a GGUF permite su ejecución eficiente en CPU y GPU mediante llama.cpp, llama-server o interfaces compatibles como Ollama. Con 8,95 mil millones de parámetros y un tamaño de archivo de 6,3 GB, es adecuado para equipos de consumo con al menos 8 GB de VRAM o 16 GB de RAM. Su relevancia radica en ofrecer un modelo de razonamiento y generación de código sin restricciones de contenido, útil para investigación, desarrollo y aplicaciones donde se requiere libertad creativa o análisis de temas sensibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen3.5-9B (destilación de Qwen3.8 2.4T A95B) |
| Parametros totales | 8.953.803.264 (8,95 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q5_0 (GGUF) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo qwen3.8-9b-heretic-uncensored-q5_0.gguf) |

## Arquitectura y entrenamiento

El modelo base `rohit267/Qwen3.8-9B-heretic-uncensored` es una destilación de parámetros completos del modelo Qwen3.8 (2,4 T parámetros, arquitectura MoE con 95 B activos) sobre la arquitectura densa de Qwen3.5-9B. El entrenamiento utilizó aproximadamente 70.000 trazas de razonamiento del profesor, filtradas por calidad, que incluyen cadenas de pensamiento densas en matemáticas, código, razonamiento general, seguimiento de instrucciones y uso de herramientas. El proceso de destilación se complementó con ajuste supervisado (SFT) para mejorar la adherencia a instrucciones y capacidades de function calling.

Posteriormente, se aplicó la técnica "heretic" (desarrollada en el repositorio p-e-w/heretic), que elimina automáticamente la alineación de seguridad mediante abliteración, es decir, la modificación de los pesos del modelo para eliminar las direcciones de activación asociadas al rechazo de contenido. Este proceso no requiere post-entrenamiento adicional y preserva en gran medida las capacidades generales del modelo, como indican los resultados de precisión (acc y acc_norm) en comparaciones publicadas para modelos similares.

## Capacidades

- Generación de texto y razonamiento de múltiples pasos (chain-of-thought) en inglés.
- Generación de código en diversos lenguajes de programación, con soporte para depuración y explicación.
- Resolución de problemas matemáticos y lógicos.
- Soporte de function calling / tool calling para integración con APIs y agentes.
- Capacidad para seguir instrucciones complejas y mantener conversaciones multi-turno.
- Sin restricciones de contenido (uncensored): puede generar respuestas sobre temas sensibles, políticos, sexuales o violentos sin rechazo.
- Capacidades multilingües limitadas al inglés (no se garantiza rendimiento en otros idiomas).

## Casos de uso

- Investigación académica en procesamiento de lenguaje natural: el modelo puede analizar y generar texto sobre temas controvertidos sin sesgos de alineación, útil para estudiar el comportamiento de modelos sin censura.
- Desarrollo de chatbots especializados en nichos donde se requiere libertad de expresión, como foros de discusión abierta o asistentes para escritura creativa sin filtros.
- Generación de código en entornos de desarrollo donde se necesita explorar soluciones no convencionales o documentar vulnerabilidades de seguridad (con las debidas precauciones).
- Análisis de datos y generación de informes técnicos en inglés, aprovechando su capacidad de razonamiento y síntesis.
- Creación de contenido literario o guiones con temática adulta o controvertida, donde la ausencia de censura permite mayor libertad creativa.
- Pruebas de robustez en sistemas de moderación de contenido: el modelo puede servir para evaluar clasificadores de contenido dañino generando ejemplos adversarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card original no incluye métricas como MMLU, HumanEval o GSM8K. Los únicos datos indirectos provienen de la comparación entre el modelo "heretic" y el modelo original en términos de precisión (acc y acc_norm), indicando que la abliteración preserva en gran medida las capacidades, pero no se proporcionan cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6,5-7 GB para el archivo GGUF Q5_0 (6,3 GB) más overhead de contexto. Se recomienda al menos 8 GB de VRAM para uso fluido.
- GPU recomendadas: NVIDIA RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4070 (12 GB) o superiores. También compatible con GPUs AMD con soporte Vulkan.
- En CPU: puede ejecutarse con llama.cpp en sistemas con al menos 16 GB de RAM, aunque la velocidad será menor.
- Opciones de despliegue: llama.cpp (CLI y servidor), llama-server, Ollama (si se importa el GGUF), o cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles. Dependen del hardware y del tamaño de contexto. En una RTX 4090 se espera una generación de 20-40 tokens/s; en CPU (16 núcleos) alrededor de 5-10 tokens/s.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para este modelo frente a alternativas de la misma categoría (modelos de ~9B sin censura). Se puede mencionar que existen otros modelos "uncensored" como `llmfan46/Qwen3.5-9B-ultra-uncensored-heretic-v1-GGUF` (también basado en Qwen3.5-9B) o la serie Dolphin de NousResearch, pero no se han encontrado benchmarks que permitan una comparación cuantitativa. La arquitectura y el proceso de destilación son similares a los de otros modelos Qwen3.5-9B, por lo que su rendimiento general debería ser comparable, aunque la abliteración puede introducir ligeras variaciones.

## Limitaciones y advertencias

- Al ser un modelo "uncensored", puede generar contenido ofensivo, violento, sexual o ilegal. Su uso en producción requiere medidas de moderación externas y es responsabilidad del desarrollador.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en temas de actualidad o con datos no presentes en su entrenamiento.
- Limitación idiomática: solo se garantiza un rendimiento adecuado en inglés; otros idiomas pueden degradar la calidad de las respuestas.
- Longitud de contexto no especificada: se desconoce el número máximo de tokens que el modelo puede manejar sin degradación; se recomienda probar con contextos cortos (por ejemplo, 2048 tokens como en el ejemplo de llama-server).
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado sin censura puede incurrir en responsabilidades legales según la jurisdicción.
- El proceso de abliteración puede afectar ligeramente la coherencia en tareas de razonamiento complejo, aunque los datos disponibles sugieren una preservación aceptable de capacidades.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/saga404/Qwen3.8-9B-heretic-uncensored-Q5_0-GGUF
- Modelo base original (safetensors): https://huggingface.co/rohit267/Qwen3.8-9B-heretic-uncensored
- Repositorio GitHub de la serie Qwen3.8 (incluye Qwen3.5, Qwen3.6 y Qwen3.8): https://github.com/QwenLM/Qwen3.8
- Herramienta "heretic" para eliminación de censura: https://github.com/p-e-w/heretic
- Página del modelo en FriendliAI (descripción de la destilación): https://friendli.ai/models/rohit267/Qwen3.8-9B-heretic-uncensored
- Modelo similar GGUF (Qwen3.5-9B-ultra-uncensored-heretic-v1): https://huggingface.co/llmfan46/Qwen3.5-9B-ultra-uncensored-heretic-v1-GGUF
