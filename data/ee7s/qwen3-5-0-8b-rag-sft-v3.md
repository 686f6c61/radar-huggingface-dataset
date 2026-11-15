# ee7s/qwen3.5-0.8b-rag-sft-v3

## Resumen

`ee7s/qwen3.5-0.8b-rag-sft-v3` es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario ee7s y publicado en Hugging Face. El modelo está orientado a tareas de generación aumentada por recuperación (RAG) sobre contenido de Wikipedia en japonés, y su entrenamiento se apoya en varios conjuntos de datos de control de calidad y comprensión lectora en ese idioma (JEMHopQA, NIILC QA, JaQuAD, JSQuAD/JGLUE y un conjunto de fragmentos derivado de Wikipedia japonesa).

Se trata de un modelo compacto con 873.438.784 parámetros totales (según los pesos en safetensors), lo que lo sitúa en la categoría sub-1B, apto para despliegues con recursos limitados. El repositorio ocupa 1,8 GB, lo que sugiere pesos en precisión completa o media precisión junto con posibles artefactos adicionales. La licencia del ajuste es CC BY-SA 4.0, condicionada por las licencias de los datos de entrenamiento empleados.

La relevancia del modelo radica en su especialización: en lugar de competir como modelo generalista, se enfoca en responder preguntas a partir de contexto recuperado en japonés, un nicho con pocos modelos pequeños disponibles. No obstante, la información publicada es escasa (sin benchmarks, sin detalles de hiperparámetros y sin pipeline declarado), por lo que su evaluación práctica requiere pruebas propias.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5; detalles no disponibles) |
| Parámetros totales | 873.438.784 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/otros no indicadas) |
| Idiomas soportados | no disponible (datos de entrenamiento en japonés) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen/Qwen3.5-0.8B, que emplea una arquitectura transformer propia de la familia Qwen3.5. No se han publicado en la información disponible detalles sobre el número de capas, dimensión oculta, mecanismo de atención ni innovaciones específicas del base. El ajuste se realizó mediante SFT (supervised fine-tuning), según indica el sufijo `-sft` en el nombre, pero no se especifican hiperparámetros, número de épocas, tasa de aprendizaje ni si se aplicaron técnicas adicionales como DPO o RLHF.

Los datos de entrenamiento provienen de cinco fuentes en japonés, todas ellas filtradas y reformateadas mecánicamente para el formato de entrenamiento RAG: JEMHopQA (CC BY-SA 4.0), NIILC QA (CC BY-SA 4.0), JaQuAD (CC BY-SA 3.0), JSQuAD/JGLUE (CC BY-SA 4.0) y un conjunto de fragmentos derivados de Wikipedia japonesa (`bumbuboon/llm-course-final-2026`, CC BY-SA 4.0). No se indica el volumen total de tokens ni la composición exacta del dataset final.

## Capacidades

- Generación de texto y respuesta a preguntas basadas en contexto recuperado (RAG) en japonés.
- Comprensión lectora sobre pasajes de Wikipedia y documentos de control de calidad.
- Razonamiento multi-salto limitado, derivado del entrenamiento con JEMHopQA (preguntas de múltiples saltos).
- Respuesta a preguntas de tipo extractivo y generativo, según los formatos de los datasets empleados.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponibles; el entrenamiento se centra en japonés.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Atención al cliente sobre base de conocimiento en japonés: el modelo puede recibir fragmentos recuperados de una base documental y generar respuestas fundamentadas, aprovechando su ajuste específico para RAG y su reducido tamaño para despliegues de bajo coste.
- Búsqueda aumentada en enciclopedias internas: integrado en un pipeline de recuperación sobre artículos tipo Wikipedia, genera respuestas concisas a partir de los pasajes seleccionados.
- Sistemas de preguntas y respuestas multi-salto: adecuado para consultas que requieren combinar información de varios fragmentos, gracias al entrenamiento con JEMHopQA.
- Asistente educativo en japonés: puede responder preguntas de comprensión lectora sobre textos académicos o divulgativos recuperados previamente.
- Prototipado rápido de pipelines RAG: su tamaño sub-1B permite iterar en local con GPUs de consumo antes de escalar a modelos mayores.
- Evaluación de recuperadores: al ser un generador pequeño y especializado, sirve como componente de referencia para medir la calidad de un sistema de recuperación en japonés.
- Despliegue en entornos con restricciones de memoria: cabe en GPUs de gama media o incluso en CPU con cuantización, aunque no se publican cuantizaciones oficiales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 873 M de parámetros, en FP16 requiere aproximadamente 1,7 GB solo para pesos; en cuantización de 8 bits, alrededor de 0,9 GB; en 4 bits, alrededor de 0,5 GB (estimaciones teóricas, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 (por ejemplo, RTX 3050, RTX 4060, T4); para cuantizaciones de 4 bits, GPUs con 2-4 GB.
- Cabe en GPU de consumo: sí, en modelos como RTX 3060, RTX 4060, RTX 4090 y similares, así como en GPUs integradas con suficiente memoria compartida para cuantizaciones agresivas.
- Opciones de despliegue: al publicarse solo en safetensors, es compatible con transformers, vLLM y TGI; para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, lo cual no está documentado por el autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización | Disponibilidad |
|---|---|---|---|---|---|
| ee7s/qwen3.5-0.8b-rag-sft-v3 | 873 M | no disponible | CC BY-SA 4.0 | RAG en japonés | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | Apache-2.0 | Generalista | Hugging Face |
| Otros ajustes RAG sub-1B en japonés | no disponible | no disponible | variable | RAG | no disponible |

La comparación cuantitativa con alternativas no es posible con la información disponible, ya que no se han publicado benchmarks ni se identifican modelos directamente comparables en el mismo nicho.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones formales, por lo que el rendimiento real es desconocido.
- El modelo está especializado en japonés y RAG; su rendimiento en otros idiomas o en tareas generales probablemente sea inferior al del modelo base.
- Riesgo de alucinación inherente a los modelos generativos, especialmente si el contexto recuperado es irrelevante o insuficiente.
- Sesgos desconocidos: no se documentan sesgos específicos, pero los datos de Wikipedia y QA pueden introducir sesgos propios de esas fuentes.
- La licencia CC BY-SA 4.0 impone obligaciones de atribución y compartir igual para obras derivadas, lo que puede limitar su uso comercial sin cumplir dichas condiciones.
- El modelo base Qwen/Qwen3.5-0.8B tiene licencia Apache-2.0, pero el ajuste se distribuye bajo CC BY-SA 4.0 por las licencias de los datos de entrenamiento; conviene revisar la compatibilidad para uso comercial.
- No se documentan cuantizaciones oficiales ni formatos GGUF, lo que puede complicar el despliegue en llama.cpp u Ollama.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ee7s/qwen3.5-0.8b-rag-sft-v3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- JEMHopQA: https://github.com/aiishii/JEMHopQA
- NIILC QA: https://github.com/mynlp/niilc-qa
- JaQuAD: https://github.com/SkelterLabsInc/JaQuAD
- JSQuAD / JGLUE: https://github.com/yahoojapan/JGLUE
- Conjunto de fragmentos: https://huggingface.co/datasets/bumbuboon/llm-course-final-2026
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Licencia CC BY-SA 3.0: https://creativecommons.org/licenses/by-sa/3.0/
