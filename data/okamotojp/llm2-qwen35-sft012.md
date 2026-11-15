# OkamotoJP/llm2-qwen35-sft012

## Resumen

llm2-qwen35-sft012 es un ajuste fino supervisado (SFT) del modelo Qwen/Qwen3.5-0.8B, desarrollado por el usuario OkamotoJP en el contexto del curso "LLM講座2 2026". El modelo se ha entrenado mediante LoRA (r=16, alpha=32) sobre el modelo base y posteriormente se han fusionado los pesos del adaptador en los pesos originales, por lo que la estructura resultante es idéntica a la del modelo base y solo se han actualizado los pesos de la parte lingüística.

El objetivo concreto del ajuste es la generación de respuestas en tareas de RAG (Retrieval-Augmented Generation) en japonés. Para ello se ha entrenado con 1.378 ejemplos derivados de los conjuntos JEMHopQA y auto-wiki-qa, además de fragmentos de Wikipedia japonesa utilizados como material de contexto en los prompts de entrenamiento. El modelo tiene 873.438.784 parámetros (aproximadamente 0,87 mil millones) y un tamaño de repositorio de 1,8 GB en formato safetensors.

Su relevancia es limitada y muy específica: se trata de un modelo pequeño, con un único epoch de entrenamiento y un volumen de datos reducido, orientado exclusivamente al japonés y a la generación de respuestas sobre contexto documental. No es un modelo de propósito general ni compite con modelos frontera; su interés reside en ser un ejemplo reproducible de ajuste LoRA para RAG en un modelo compacto y con licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-0.8B; no se detalla en la información disponible) |
| Parametros totales | 873.438.784 (aproximadamente 0,87 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-0.8B, no especificada) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en safetensors sin cuantizar) |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen/Qwen3.5-0.8B (revisión 2fc06364715b967f1860aea9cf38778875588b17) mediante LoRA con rango 16 y alpha 32, tasa de aprendizaje 0,0002 y un único epoch sobre 1.378 ejemplos. Tras el entrenamiento, los pesos del adaptador se han fusionado con los pesos originales, de modo que la arquitectura final es exactamente la del modelo base: solo se han modificado los pesos de la parte lingüística. No se ha añadido ni eliminado ningún componente estructural, y no se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

Los datos de entrenamiento provienen de tres fuentes: JEMHopQA (CC BY-SA 4.0), filtrado y reformateado para el entrenamiento; cl-nagoya/auto-wiki-qa (CC BY-SA 4.0), muestreado, filtrado y reformateado; y un conjunto de fragmentos distribuidos derivados de Wikipedia japonesa (CC BY-SA 4.0), empleados como material de contexto en los prompts de entrenamiento. No se especifica el número total de tokens de entrenamiento ni si hubo fases de RLHF o DPO; la información disponible solo describe un SFT con LoRA.

## Capacidades

- Generación de texto en japonés, orientada a responder preguntas a partir de un contexto documental proporcionado en el prompt (RAG).
- Respuesta sobre preguntas multi-salto, dado que JEMHopQA es un conjunto de preguntas de razonamiento multi-hop.
- Extracción y síntesis de información a partir de fragmentos de Wikipedia japonesa incluidos como contexto.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso autónomo más allá del implícito en las preguntas multi-hop.
- Capacidades multilingües limitadas al japonés según la etiqueta de idioma del modelo.
- No se documentan capacidades de visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Generación de respuestas en pipelines RAG en japonés: el modelo está entrenado específicamente para recibir fragmentos de contexto y producir una respuesta, por lo que encaja como componente generador final en un sistema de recuperación y respuesta sobre documentación interna o Wikipedia.
- Preguntas multi-hop sobre bases de conocimiento: gracias al entrenamiento con JEMHopQA, puede encadenar información de varios fragmentos para responder preguntas que requieren combinar entidades y relaciones.
- Asistente de consulta sobre documentación técnica en japonés: se puede desplegar en un servicio interno que recupere pasajes de manuales y genere respuestas concisas, con un coste de inferencia muy bajo por su tamaño inferior a mil millones de parámetros.
- Prototipado rápido de sistemas RAG: al ser un modelo pequeño y con licencia Apache-2.0, sirve para validar arquitecturas de recuperación y generación antes de escalar a modelos mayores.
- Educación y experimentación: es un ejemplo reproducible de ajuste LoRA fusionado para cursos y talleres sobre LLM, con hiperparámetros y datos documentados.
- Filtrado y resumen de artículos de Wikipedia japonesa: puede condensar fragmentos recuperados en respuestas breves dentro de un flujo de procesamiento por lotes.
- Evaluación comparativa de estrategias de prompting en RAG: su tamaño permite ejecutar muchas variantes de prompt y contexto en hardware modesto para medir calidad de respuesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32): aproximadamente 3,5 GB para los 873 millones de parámetros, más overhead de activaciones y KV cache.
- VRAM estimada en fp16/bf16: aproximadamente 1,8 GB de pesos, más overhead; en la práctica, entre 2 y 3 GB según longitud de contexto.
- VRAM estimada en cuantización de 8 bits: aproximadamente 0,9 GB de pesos.
- VRAM estimada en cuantización de 4 bits: aproximadamente 0,5 GB de pesos.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM para fp16 (por ejemplo, RTX 3050, RTX 4060, RTX 3060); para cuantización de 4 u 8 bits basta con GPUs de 2 a 4 GB. En entornos de servidor, A100 o H100 no son necesarias por el reducido tamaño del modelo.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs dedicadas modernas e incluso en algunas integradas con suficiente memoria compartida.
- Opciones de despliegue: al ser un modelo con arquitectura Qwen3.5 y pesos safetensors, es compatible con frameworks estándar como Transformers, vLLM, TGI y llama.cpp/Ollama si existe conversión a GGUF (no se documenta una versión GGUF publicada).
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño, se espera una latencia baja en GPU consumer, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| OkamotoJP/llm2-qwen35-sft012 | 873 M | no disponible | ja | Apache-2.0 | SFT para RAG en japonés |
| Qwen/Qwen3.5-0.8B (modelo base) | 0,8 B | no disponible | no disponible | Apache-2.0 | Modelo base de propósito general |
| cl-nagoya/auto-wiki-qa (dataset, no modelo) | no aplica | no aplica | ja | CC BY-SA 4.0 | Corpus de entrenamiento |

No se dispone de datos de benchmarks ni de modelos comparables adicionales en la información proporcionada; la comparación con alternativas de la misma categoría (modelos de menos de mil millones de parámetros ajustados para RAG en japonés) no está disponible.

## Limitaciones y advertencias

- Entrenado con solo 1.378 ejemplos y un único epoch, lo que limita la generalización y puede provocar sobreajuste a los formatos de JEMHopQA y auto-wiki-qa.
- Especializado en generación de respuestas sobre contexto documental; su rendimiento fuera de ese formato (conversación abierta, código, matemáticas) no está documentado y probablemente sea limitado.
- Idiomas: solo se declara japonés; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Riesgo de alucinación: como todo modelo generativo pequeño, puede inventar información no presente en el contexto recuperado, especialmente si el contexto es ambiguo o insuficiente.
- Sesgos: no se documenta ningún análisis de sesgos; los datos de Wikipedia y de los conjuntos citados pueden introducir sesgos propios de esas fuentes.
- Licencia Apache-2.0 para el modelo, pero los datos de entrenamiento son CC BY-SA 4.0, lo que puede imponer obligaciones de atribución y compartir igual sobre obras derivadas de esos datos; conviene revisar la compatibilidad antes de un uso comercial.
- No se documenta la longitud de contexto efectiva ni el soporte de tool calling, por lo que no debe asumirse en producción sin validación previa.
- El modelo tiene muy pocas descargas y likes, y no hay evaluación independiente publicada; su fiabilidad en producción no está contrastada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OkamotoJP/llm2-qwen35-sft012
- Modelo base Qwen/Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- JEMHopQA: https://github.com/aiishii/JEMHopQA
- Dataset cl-nagoya/auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
