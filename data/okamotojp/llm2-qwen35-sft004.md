# OkamotoJP/llm2-qwen35-sft004

## Resumen

`OkamotoJP/llm2-qwen35-sft004` es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario OkamotoJP como entrega final del curso "LLM講座2 2026". El modelo está especializado en la generación de respuestas para sistemas de generación aumentada por recuperación (RAG) en japonés, y se ha entrenado mediante LoRA con fusión posterior de los pesos en el modelo original.

Con 873.438.784 parámetros (aproximadamente 0,87 mil millones), se trata de un modelo compacto orientado a tareas de respuesta sobre contexto documental. La arquitectura subyacente es la del Qwen3.5-0.8B, un transformer decoder-only, y el ajuste solo afecta a la parte lingüística del modelo, manteniendo intacta la estructura original.

Su relevancia es limitada pero concreta: demuestra un flujo completo de especialización de un modelo pequeño para RAG en japonés con un conjunto de datos reducido (1001 ejemplos) y recursos mínimos, lo que lo convierte en un caso de referencia para quienes quieran replicar el proceso en entornos con pocos recursos de cómputo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5), ajuste LoRA fusionado |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-0.8B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B (revisión `2fc06364715b967f1860aea9cf38778875588b17`) y aplica un ajuste fino supervisado mediante LoRA con rango r=16, alpha=32, tasa de aprendizaje 0,0001 y una sola época sobre 1001 ejemplos de entrenamiento. Tras el entrenamiento, los pesos LoRA se fusionan en el modelo original, por lo que la estructura final es idéntica a la del modelo base y solo se actualizan los pesos de la parte lingüística.

Los datos de entrenamiento provienen de tres fuentes bajo licencia CC BY-SA 4.0: JEMHopQA (preguntas multihop en japonés, filtradas y reformateadas), el conjunto `cl-nagoya/auto-wiki-qa` (muestreado, filtrado y reformateado) y una colección de fragmentos derivados de Wikipedia japonesa utilizados como material de contexto en los prompts de entrenamiento. No se documenta el uso de RLHF ni DPO, ni innovaciones técnicas adicionales más allá del propio ajuste LoRA.

## Capacidades

- Generación de respuestas en japonés condicionadas a contexto documental (RAG).
- Respuesta a preguntas de tipo multihop sobre documentos recuperados.
- Comprensión lectora de fragmentos de Wikipedia en japonés.
- Generación de texto general en japonés (heredada del modelo base).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al japonés según la model card.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Generación de respuestas en sistemas RAG en japonés: el modelo está entrenado específicamente para recibir fragmentos recuperados y producir respuestas fundamentadas, lo que lo hace adecuado como componente generador en un pipeline de recuperación + generación sobre Wikipedia japonesa u otras fuentes documentales.
- Preguntas multihop sobre bases de conocimiento: al haberse entrenado con JEMHopQA, puede responder preguntas que requieren combinar información de varios fragmentos, útil en asistentes de consulta documental.
- Prototipado de asistentes de documentación interna: con menos de 1 GB de pesos, se puede desplegar en una estación de trabajo para validar flujos RAG antes de escalar a modelos mayores.
- Educación y experimentación: sirve como caso reproducible de ajuste LoRA sobre un modelo pequeño con un dataset de 1001 ejemplos, útil en cursos y talleres de LLM.
- Respuesta a preguntas frecuentes sobre contenido enciclopédico: puede integrarse en un chatbot que consulte artículos de Wikipedia en japonés y responda con base en ellos.
- Evaluación comparativa de pipelines RAG: al ser un modelo pequeño y de licencia permisiva, es útil como línea base para medir la contribución del generador frente a otros componentes del sistema.
- Despliegue en entornos con recursos limitados: su tamaño permite ejecución en CPU o GPU de gama baja para tareas de generación de respuestas cortas en japonés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,8 GB en precisión de 16 bits (tamaño del repositorio); en cuantización de 8 bits rondaría 0,9 GB y en 4 bits unos 0,5 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de VRAM para FP16 (por ejemplo, GTX 1650, RTX 3050, RTX 4060); también puede ejecutarse en CPU.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna de consumo e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers (con safetensors), llama.cpp u Ollama si se generan cuantizaciones GGUF a partir de los pesos; vLLM y TGI son viables aunque sobredimensionados para este tamaño.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización | Disponibilidad |
|---|---|---|---|---|---|
| OkamotoJP/llm2-qwen35-sft004 | 873 M | no disponible | Apache-2.0 | RAG en japonés | Hugging Face |
| Qwen/Qwen3.5-0.8B | ~0,8 B | no disponible | Apache-2.0 | Propósito general | Hugging Face |
| cl-nagoya/auto-wiki-qa (dataset, no modelo) | no aplica | no aplica | CC BY-SA 4.0 | Fuente de datos | Hugging Face |

La comparación directa con otros modelos ajustados para RAG en japonés de tamaño similar no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Entrenado únicamente con 1001 ejemplos y una sola época, lo que limita la generalización y aumenta el riesgo de sobreajuste al formato de los datos de entrenamiento.
- Especializado en japonés; su rendimiento en otros idiomas no está documentado y probablemente sea deficiente.
- Riesgo de alucinación inherente a un modelo de 0,8 mil millones de parámetros, especialmente cuando el contexto recuperado no contiene la respuesta.
- Los datos de entrenamiento derivan de fuentes CC BY-SA 4.0 (JEMHopQA, auto-wiki-qa, Wikipedia japonesa); aunque los pesos se distribuyen bajo Apache-2.0, conviene revisar las implicaciones de las licencias de los datos subyacentes para usos comerciales.
- Sin benchmarks publicados, no hay evidencia cuantitativa de su calidad frente al modelo base ni frente a alternativas.
- La longitud de contexto efectiva no está documentada; el rendimiento con contextos largos puede degradarse.
- Modelo con muy pocas descargas y sin validación externa; no se recomienda para producción sin evaluación previa en el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OkamotoJP/llm2-qwen35-sft004
- Modelo base Qwen/Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset JEMHopQA: https://github.com/aiishii/JEMHopQA
- Dataset cl-nagoya/auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
