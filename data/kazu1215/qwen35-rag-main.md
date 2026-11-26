# kazu1215/qwen35-rag-main

## Resumen

qwen35-rag-main es un ajuste fino (fine-tuning) del modelo Qwen/Qwen3.5-0.8B, desarrollado por el usuario kazu1215. Se trata de un modelo de lenguaje de aproximadamente 853 millones de parámetros, entrenado mediante LoRA y posteriormente fusionado (SFT + merge), con el objetivo específico de servir como componente generativo en un sistema de generación aumentada por recuperación (RAG). El autor lo creó como parte del proyecto final del curso LLM 2026 del laboratorio Matsuo (Universidad de Tokio).

El modelo parte de la arquitectura Qwen3.5 en su variante de 0,8B, un transformer denso de la familia Qwen, y ha sido especializado con datos en japonés provenientes del conjunto JSQuAD (obtenido a través de JGLUE), un corpus de comprensión lectora en japonés. Esta especialización lo orienta a tareas de respuesta a preguntas sobre contexto y generación condicionada por documentos recuperados.

Su relevancia es acotada: se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, publicado bajo licencia CC BY-SA 4.0 y sin model card detallada más allá de la información de entrenamiento. Resulta útil como ejemplo de ajuste fino ligero para RAG en japonés y como base para experimentación con modelos pequeños, pero no constituye una alternativa de propósito general frente a modelos mayores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5) |
| Parametros totales | 852.985.920 (~0,85B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no documentadas) |
| Idiomas soportados | no disponible (entrenamiento centrado en japones segun la model card) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Qwen/Qwen3.5-0.8B, un transformer denso de la familia Qwen3.5. Sobre esa base, el autor aplicó un ajuste fino supervisado (SFT) mediante LoRA, tras lo cual fusionó los adaptadores en los pesos del modelo, dando lugar a un checkpoint único en formato safetensors con 852.985.920 parámetros.

El entrenamiento se realizó en Google Colab. El conjunto de datos empleado fue JSQuAD, un corpus de comprensión lectora en japonés distribuido a través de JGLUE y con licencia CC BY-SA 4.0. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, hiperparámetros de LoRA (rango, alpha, capas objetivo) ni si hubo fases de RLHF o DPO. Tampoco se describen innovaciones técnicas adicionales como decodificación especulativa o atención lineal; se asume la arquitectura estándar del modelo base.

## Capacidades

- Generación de texto en japonés, orientada a tareas de respuesta a preguntas sobre contexto (question answering extractivo y generativo).
- Especialización en RAG: el ajuste con JSQuAD lo predispone a responder a partir de pasajes recuperados.
- Comprensión lectora en japonés: identificación de respuestas dentro de documentos de referencia.
- Generación condicionada por contexto: útil para resumir o sintetizar fragmentos recuperados.
- Herencia de las capacidades del modelo base Qwen3.5-0.8B (generación general, código y matemáticas básicas), aunque el ajuste fino puede haber desplazado parte de ese comportamiento hacia la tarea de RAG.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo thinking explícito: no documentado.

## Casos de uso

- Respuesta a preguntas sobre documentación interna en japonés: el modelo recibe pasajes recuperados por un retriever y genera la respuesta citando el contexto, aprovechando el ajuste con JSQuAD para este formato.
- Chatbot de soporte sobre base de conocimiento japonesa: se integra como generador final de un pipeline RAG, donde el retriever aporta fragmentos y el modelo sintetiza la contestación.
- Extracción de respuestas en documentos legales o administrativos japoneses: su entrenamiento en comprensión lectora lo hace adecuado para localizar y reformular información contenida en textos largos divididos en fragmentos.
- Prototipado educativo y experimentación: por su tamaño reducido (~0,85B), permite iterar rápidamente en entornos con recursos limitados, como parte de cursos o proyectos de investigación.
- Despliegue en hardware de gama baja: puede ejecutarse en GPU de consumo o incluso en CPU con cuantización, lo que lo hace viable para demos locales de sistemas RAG.
- Filtrado y verificación de recuperación: puede emplearse para evaluar si un pasaje recuperado responde a la consulta, generando una respuesta tentativa que un componente posterior valide.
- Generación de resúmenes de pasajes recuperados en japonés: útil en pipelines de documentación donde se necesita condensar fragmentos antes de presentarlos al usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, aproximadamente 1,7 GB (0,85B parámetros × 2 bytes); en cuantización de 8 bits, en torno a 0,9 GB; en 4 bits, alrededor de 0,5 GB (estimaciones teóricas, no verificadas con el modelo).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para FP16; tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores son más que suficientes. En entornos de servidor, A100 o H100 no son necesarias por el tamaño del modelo.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer modernas, e incluso en CPU con cuantización.
- Opciones de despliegue: compatible con llama.cpp, Ollama, vLLM y TGI siempre que se generen las cuantizaciones correspondientes (no publicadas en el repositorio). El formato nativo es safetensors, por lo que requiere transformers o una conversión previa para motores de cuantización.
- Latencia y throughput estimados: no disponibles. Por el tamaño, se espera una latencia baja en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| kazu1215/qwen35-rag-main | ~0,85B | no disponible | CC BY-SA 4.0 | Hugging Face (0 descargas) | Ajuste fino para RAG en japonés sobre Qwen3.5-0.8B |
| Qwen/Qwen3.5-0.8B (base) | ~0,8B | no disponible | no disponible en la información | Hugging Face | Modelo base sin especialización; capacidades generales |
| Modelos pequeños para RAG en japonés (p. ej., variantes de Qwen o Llama ajustadas) | 0,5B–3B | variable | variable | Hugging Face | Alternativas de la misma categoría; no se dispone de datos comparativos concretos |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de nicho con cero descargas y cero likes: no hay validación comunitaria ni evidencia de uso en producción.
- Model card muy escasa: no se documentan hiperparámetros, composición del dataset, evaluación ni limitaciones conocidas.
- Especialización estrecha: el ajuste con JSQuAD puede degradar capacidades generales del modelo base (olvido catastrófico parcial), por lo que su uso fuera de tareas de RAG en japonés es arriesgado.
- Riesgo de alucinación: como todo modelo generativo pequeño, puede inventar respuestas cuando el contexto recuperado no contiene la información; no se ha evaluado su tasa de alucinación.
- Idiomas: el entrenamiento se centró en japonés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea limitado.
- Longitud de contexto: no documentada; conviene verificar la del modelo base antes de usarlo con pasajes largos.
- Licencia CC BY-SA 4.0: permite uso comercial, pero impone compartir las obras derivadas bajo la misma licencia y atribuir al autor; esto puede ser restrictivo para productos propietarios.
- Sin garantías: al ser un proyecto de curso, no hay soporte ni mantenimiento previsible.
- Fecha de creación futura (2026-11-26) en los metadatos: conviene verificar la integridad y procedencia del repositorio antes de confiar en él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kazu1215/qwen35-rag-main
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- JSQuAD (JGLUE): no disponible en la información proporcionada
- Repositorio o demo del autor: no disponible en la información proporcionada
