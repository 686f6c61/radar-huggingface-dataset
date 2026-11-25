# Aikimi/Inkling-2-Mini-JP-GGUF

## Resumen

Inkling-2-Mini-JP-GGUF es una versión afinada para japonés y cuantizada en formato GGUF del modelo base thinkingmachines/Inkling-2-Mini, desarrollada por el usuario Aikimi. El modelo conserva la arquitectura MoE del original (26.070.390.272 parámetros totales) y añade un ajuste fino orientado a mejorar la generación de respuestas a instrucciones y a conversaciones en japonés, manteniendo el inglés como idioma secundario. Se distribuye bajo licencia Apache 2.0.

El ajuste se realizó sobre tres conjuntos de datos: Aya (Cohere For AI) y OASST1 (OpenAssistant) para instrucciones y diálogo, y JaQuAD (Skelter Labs) para texto enciclopédico en japonés. Según la model card, el ajuste mejora la perplejidad en japonés general (de 5,964 a 5,706 en la cuantización de 16 GB, un 4,3 %; de 5,957 a 5,658 en la de 24 GB, un 5,0 %), con mejoras del 8-9 % en respuestas a instrucciones y del 8-9 % en diálogo, a costa de un empeoramiento de en torno al 1 % en la continuación de artículos enciclopédicos.

Es relevante para desarrolladores que necesitan desplegar un modelo conversacional en japonés con requisitos de memoria moderados (16 o 24 GB de VRAM) y sin depender de infraestructura en la nube. La distribución en GGUF con cuantizaciones UD-Q3_K_XL y UD-Q4_K_XL, generadas con imatrix, facilita su uso en llama.cpp y entornos compatibles con endpoints.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts), transformer |
| Parametros totales | 26.070.390.272 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | UD-Q3_K_XL (12,70 GiB, para 16 GB de VRAM), UD-Q4_K_XL (16,42 GiB, para 24 GB de VRAM); generadas con imatrix |
| Idiomas soportados | japonés (ja), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer con arquitectura de mezcla de expertos (MoE), heredada del modelo base thinkingmachines/Inkling-2-Mini, con 26.070.390.272 parámetros totales. No se dispone de información sobre el número de parámetros activos por token, la longitud de contexto nativa ni la composición exacta del corpus de preentrenamiento del modelo original en la información proporcionada.

El ajuste fino realizado por Aikimi parte de la versión cuantizada de unsloth (unsloth/Inkling-2-Mini-GGUF) y emplea tres fuentes de datos: CohereForAI/aya_dataset y OpenAssistant/oasst1 para instrucciones y diálogo (ambos Apache 2.0), y SkelterLabsInc/JaQuAD, que contiene textos de Wikipedia en japonés bajo CC BY-SA 3.0. No se especifican hiperparámetros, número de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO. Las cuantizaciones GGUF se generaron con imatrix, un método de cuantización guiada por matriz de importancia que preserva mejor las capacidades del modelo en comparación con la cuantización estándar.

## Capacidades

- Generación de texto conversacional en japonés e inglés.
- Respuesta a instrucciones en japonés, con mejora medida del 8,4-9,6 % en perplejidad respecto al modelo base en la misma cuantización.
- Diálogo multi-turno en japonés, con mejora del 8,2-8,8 % en perplejidad.
- Continuación de texto enciclopédico en japonés (con ligero empeoramiento del 1,1-1,3 % respecto al base).
- Razonamiento de sentido común en japonés: mantiene 110-111 aciertos sobre 120 en JCommonsenseQA (JGLUE) tras el ajuste.
- Conocimiento gramatical en japonés: mantiene 50-52 aciertos sobre 60 en JBLiMP tras el ajuste.
- Extracción de respuestas literales de un texto: 21-22 aciertos sobre 24 en la prueba de coincidencia exacta.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito en la información disponible.

## Casos de uso

- Asistente conversacional en japonés para atención al cliente: el modelo puede gestionar diálogos multi-turno con respuestas coherentes en japonés, con un ajuste específico que reduce la perplejidad en diálogo entre un 8,2 % y un 8,8 % respecto al base, lo que se traduce en respuestas más naturales y predecibles.
- Despliegue en estaciones de trabajo con GPU de 16 GB: la cuantización UD-Q3_K_XL ocupa 12,70 GiB y está pensada para GPUs de 16 GB de VRAM, lo que permite ejecutar un modelo de 26.000 millones de parámetros en hardware de gama alta de consumo.
- Despliegue en GPU de 24 GB: la cuantización UD-Q4_K_XL ocupa 16,42 GiB y aprovecha GPUs de 24 GB (por ejemplo, RTX 4090 o A10G) con mayor fidelidad respecto al modelo original.
- Generación de contenido enciclopédico y divulgativo en japonés: aunque la continuación de artículos empeora ligeramente (1,1-1,3 %), el modelo sigue siendo utilizable para redactar borradores y resúmenes de artículos, con la ventaja de un vocabulario y una gramática ajustados al japonés.
- Evaluación y prototipado de sistemas de preguntas y respuestas en japonés: el modelo mantiene su rendimiento en pruebas de sentido común (JCommonsenseQA) y gramática (JBLiMP), por lo que sirve como base para experimentos de QA sobre textos japoneses.
- Integración en pipelines locales con llama.cpp u Ollama: al estar en formato GGUF y ser compatible con endpoints, puede integrarse en aplicaciones de escritorio, herramientas de línea de comandos o servicios locales sin necesidad de infraestructura en la nube.
- Traducción y asistencia bilingüe japonés-inglés: al soportar ambos idiomas, puede emplearse para tareas de reescritura, resumen o adaptación de textos entre las dos lenguas, aunque no se han publicado evaluaciones específicas de traducción.

## Benchmarks y rendimiento

Los datos publicados en la model card son métricas de perplejidad (PPL, menor es mejor) y de acierto en pruebas de opción múltiple y extracción, comparando el modelo ajustado con el modelo base en la misma cuantización.

| Evaluación | 16GB (base → ajustado) | 24GB (base → ajustado) |
|---|---|---|
| Japonés general, PPL (98 ítems) | 5,964 → 5,706 (4,3 % mejora) | 5,957 → 5,658 (5,0 % mejora) |
| Respuestas a instrucciones, PPL (48 ítems) | 8,4 % mejora | 9,6 % mejora |
| Respuestas de diálogo, PPL (10 ítems) | 8,2 % mejora | 8,8 % mejora |
| Continuación de artículos enciclopédicos, PPL (40 ítems) | 1,3 % empeoramiento | 1,1 % empeoramiento |
| JCommonsenseQA, aciertos (120 preguntas) | 110 → 110 | 111 → 111 |
| JBLiMP, aciertos (60 preguntas) | 52 → 52 | 50 → 50 |
| Extracción con coincidencia exacta (24 preguntas) | 22 → 21 | 21 → 21 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 12,70 GiB para la cuantización UD-Q3_K_XL (orientada a GPUs de 16 GB) y 16,42 GiB para UD-Q4_K_XL (orientada a GPUs de 24 GB).
- GPU recomendadas: RTX 4090 (24 GB) o A10G (24 GB) para la cuantización de 24 GB; GPUs de 16 GB como RTX 4080, RTX 4060 Ti de 16 GB o A4000 para la de 16 GB.
- Cabe en GPU de consumo: sí, en modelos con 16 GB o 24 GB de VRAM según la cuantización elegida.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` indica compatibilidad con endpoints de inferencia. No se confirma soporte de vLLM o TGI para este formato.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Inkling-2-Mini-JP-GGUF (este) | 26.070.390.272 | no disponible | ja, en | Apache 2.0 | GGUF |
| thinkingmachines/Inkling-2-Mini (base) | 26.070.390.272 | no disponible | no disponible | Apache 2.0 (con política de uso aceptable) | safetensors |
| unsloth/Inkling-2-Mini-GGUF | 26.070.390.272 | no disponible | no disponible | Apache 2.0 | GGUF |

No se dispone de datos de benchmarks comparativos con modelos de otros desarrolladores en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- El ajuste mejora instrucciones y diálogo en japonés, pero empeora ligeramente (1,1-1,3 %) la continuación de textos enciclopédicos respecto al modelo base.
- En la cuantización de 16 GB, la prueba de extracción con coincidencia exacta baja de 22 a 21 aciertos porque el modelo añade explicaciones a respuestas que deberían ser literales; conviene tenerlo en cuenta en tareas que exijan respuestas exactas.
- Solo se documentan los idiomas japonés e inglés; el rendimiento en otros idiomas no está evaluado y probablemente sea deficiente.
- No se dispone de información sobre la longitud de contexto, los parámetros activos ni el corpus de preentrenamiento, lo que limita la evaluación de su comportamiento en contextos largos.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad factual ni de sesgos.
- La licencia del modelo es Apache 2.0, pero el modelo base está sujeto a la política de uso aceptable de Thinking Machines (https://thinkingmachines.ai/model-acceptable-use-policy/), que debe respetarse en usos comerciales.
- Los datos de ajuste incluyen textos de Wikipedia en japonés bajo CC BY-SA 3.0 (JaQuAD), lo que puede implicar obligaciones de atribución si se redistribuyen derivados que incorporen ese contenido.
- No se documentan capacidades de tool calling, agentes ni visión; no debe asumirse su disponibilidad en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Aikimi/Inkling-2-Mini-JP-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Versión cuantizada de Unsloth: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF/tree/ae9327c5fbc7333116ba32eee78bb5d2bbefae4f
- Política de uso aceptable del modelo base: https://thinkingmachines.ai/model-acceptable-use-policy/
- Dataset Aya: https://huggingface.co/datasets/CohereForAI/aya_dataset
- Dataset OASST1: https://huggingface.co/datasets/OpenAssistant/oasst1
- Dataset JaQuAD: https://huggingface.co/datasets/SkelterLabsInc/JaQuAD
- JGLUE (JCommonsenseQA): https://github.com/yahoojapan/JGLUE
- JBLiMP: https://github.com/osekilab/JBLiMP
- Evaluación detallada: https://huggingface.co/Aikimi/Inkling-2-Mini-JP-GGUF/blob/main/evaluation.json
- Licencia Apache 2.0: https://huggingface.co/Aikimi/Inkling-2-Mini-JP-GGUF/blob/main/LICENSE
