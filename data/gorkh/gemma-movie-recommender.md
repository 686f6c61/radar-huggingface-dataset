# gorkh/gemma-movie-recommender

## Resumen

`gorkh/gemma-movie-recommender` es un ajuste fino (fine-tuning) del modelo base `unsloth/gemma-2-2b-bnb-4bit`, que a su vez deriva de Gemma 2 2B de Google DeepMind. Lo desarrolla el usuario de Hugging Face `gorkh` y se publica bajo licencia Apache 2.0. El modelo está etiquetado como especializado en recomendación de películas, aunque la model card no documenta el conjunto de datos de entrenamiento ni el procedimiento de ajuste más allá de indicar que se usó Unsloth.

Se trata de un modelo de generación de texto de 2.000 millones de parámetros, entrenado originalmente por Google con arquitectura transformer decoder-only y una ventana de contexto de 8.192 tokens (característica de la familia Gemma 2). El ajuste fino se realizó sobre una versión cuantizada a 4 bits del modelo base (bnb-4bit), lo que condiciona tanto el formato de los pesos publicados como las opciones de despliegue.

La relevancia de esta ficha es limitada: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, no incluye resultados de evaluación y la model card es prácticamente una plantilla autogenerada por Unsloth. Resulta útil únicamente como ejemplo de flujo de trabajo de fine-tuning ligero con Unsloth sobre Gemma 2, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 2) |
| Parametros totales | 2.000 millones (heredados del modelo base Gemma 2 2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (valor del modelo base Gemma 2 2B; no confirmado en la model card) |
| Tipos de cuantizacion | El modelo base es bnb-4bit; el repositorio publica safetensors. Otras cuantizaciones (GGUF, AWQ, GPTQ) no disponibles |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,1 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Gemma 2 2B: un transformer decoder-only con atención multi-cabeza agrupada (GQA), normalización RMSNorm y activaciones GeGLU, entrenado por Google con datos multilingües y ajustado con técnicas de alineación (RLHF/DPO) en su versión original. La innovación arquitectónica más destacable de la familia Gemma 2 es la alternancia de atención local y global, que reduce el coste computacional en contextos largos.

El ajuste fino lo realizó `gorkh` partiendo de `unsloth/gemma-2-2b-bnb-4bit`, una versión cuantizada a 4 bits del modelo base, usando Unsloth, una librería que acelera el fine-tuning de modelos grandes mediante kernels optimizados y gestión eficiente de memoria. La model card no especifica el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF/DPO adicional ni hiperparámetros. El nombre del modelo sugiere un dataset de recomendación de películas, pero no se aporta evidencia documental.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Gemma 2 2B.
- Razonamiento básico y respuesta a preguntas de dominio general.
- Generación de código y matemáticas a nivel de modelo pequeño (2B), sin garantías de precisión.
- Soporte de tool calling y function calling: no documentado en la model card; el modelo base Gemma 2 no lo soporta de forma nativa.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas al inglés según la etiqueta `language: en`.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Especialización declarada en recomendación de películas, sin evaluación publicada que lo respalde.

## Casos de uso

- Prototipado de recomendadores de películas en inglés: el modelo puede generar listas y justificaciones de películas a partir de preferencias del usuario, aunque sin evaluación publicada que garantice calidad. Adecuado solo para experimentación.
- Generación de descripciones y sinopsis: útil para crear textos cortos sobre películas en inglés en flujos de contenido editorial de baja criticidad.
- Chatbot de recomendación conversacional: puede mantener diálogos multi-turno gracias a la ventana de contexto del modelo base (8.192 tokens), pero la calidad del ajuste no está verificada.
- Base para nuevos fine-tunings: sirve como punto de partida para experimentar con Unsloth y TRL sobre Gemma 2 2B en tareas de dominio específico.
- Evaluación de pipelines de fine-tuning: útil como caso de prueba para validar flujos de entrenamiento con cuantización 4-bit y despliegue en transformers.
- Demos educativas: ejemplo de cómo publicar un modelo ajustado en Hugging Face con licencia Apache 2.0, útil en talleres y tutoriales.
- Inferencia en hardware limitado: al derivar de un modelo de 2B, puede ejecutarse en GPUs de consumo, lo que permite probar recomendadores localmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación (MMLU, HumanEval, GSM8K ni métricas específicas de recomendación), y el repositorio no contiene informes de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4-5 GB en cuantización 4-bit (heredada del modelo base), 8-10 GB en fp16 para un modelo de 2B parámetros.
- GPU recomendadas: NVIDIA RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100, H100. Cualquier GPU con al menos 8 GB de VRAM puede ejecutar el modelo en fp16; con 4-5 GB en cuantización 4-bit.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4070 y superiores.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (TGI, etiqueta presente), llama.cpp y Ollama solo si se generan pesos GGUF (no publicados). vLLM no está confirmado para este repositorio.
- Latencia y throughput estimados: no disponibles. Para un modelo de 2B en una RTX 4090 se puede esperar un throughput del orden de decenas de tokens por segundo, pero no hay mediciones publicadas para este ajuste concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| gorkh/gemma-movie-recommender | 2B | 8.192 (heredado) | Apache 2.0 | Hugging Face, 0 descargas | Fine-tuning sin evaluar |
| google/gemma-2-2b | 2B | 8.192 | Gemma Terms of Use | Hugging Face, ampliamente usado | Modelo base oficial, con evaluación publicada |
| unsloth/gemma-2-2b-bnb-4bit | 2B | 8.192 | Apache 2.0 (según repositorio) | Hugging Face | Versión cuantizada 4-bit del base, usada como punto de partida |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 | Apache 2.0 | Hugging Face | Alternativa pequeña con contexto mayor y soporte multilingüe |

La comparativa se limita a parámetros, contexto y licencia porque no hay benchmarks publicados para el modelo de `gorkh`. El modelo base oficial de Google y la versión de Unsloth son las referencias más directas; Qwen2.5-1.5B-Instruct se incluye como alternativa de tamaño similar con contexto más amplio.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, métricas ni informes de calidad; no se puede afirmar que el ajuste mejore al modelo base en recomendación de películas.
- Model card mínima: no se documenta el dataset, los hiperparámetros ni el procedimiento de entrenamiento, lo que impide reproducir el ajuste.
- Sesgos heredados: al derivar de Gemma 2, arrastra los sesgos del corpus de entrenamiento original de Google, no mitigados en este fine-tuning.
- Riesgo de alucinación: alto en un modelo de 2B sin alineación específica verificada; puede inventar títulos, años o sinopsis.
- Limitación de idioma: solo inglés según la etiqueta del repositorio; no se garantiza un rendimiento aceptable en castellano.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Gemma 2 está sujeto a los Gemma Terms of Use de Google; conviene verificar la compatibilidad antes de un uso comercial.
- Contexto: los 8.192 tokens son un valor heredado del modelo base y no están confirmados en la model card de este ajuste.
- Madurez: 0 descargas y 0 likes; sin mantenimiento ni comunidad, no recomendable para producción.
- Cuantización de origen: el fine-tuning se hizo sobre pesos bnb-4bit, lo que puede introducir degradación adicional respecto al modelo base en fp16.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/gorkh/gemma-movie-recommender
- Modelo base en Hugging Face: https://huggingface.co/unsloth/gemma-2-2b-bnb-4bit
- Modelo original Gemma 2 2B: https://huggingface.co/google/gemma-2-2b
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL (librería de fine-tuning): https://github.com/huggingface/trl
- Documentación de Gemma 2: https://ai.google.dev/gemma/docs
