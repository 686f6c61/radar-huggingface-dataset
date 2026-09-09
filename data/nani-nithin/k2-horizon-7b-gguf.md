# NANI-Nithin/K2-Horizon-7B-GGUF

## Resumen

K2-Horizon-7B es un modelo generativo de texto de tipo decoder causal denso desarrollado por IFM (MBZUAI) y cuantizado a formato GGUF por NANI-Nithin. Emplea una arquitectura propia denominada `K2HorizonForCausalLM`, que no está soportada por el llama.cpp estándar, por lo que requiere una bifurcación específica para su ejecución. El modelo tiene 8.999.178.240 parámetros según los safetensors, aunque la model card oficial lo describe como "~7B".

Se distribuye bajo licencia Apache 2.0 e incluye alrededor de treinta cuantizaciones, desde BF16 (18 GB) hasta Q1_0 y variantes IQ, lo que facilita su despliegue en hardware diverso, desde GPUs de consumo de 8 GB hasta servidores con mayor memoria. Está indicado para generación de texto en inglés y se marca con el tag "conversational".

No se han publicado detalles sobre datos de entrenamiento, longitud de contexto ni benchmarks, por lo que la evaluación de su rendimiento requiere pruebas propias antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `K2HorizonForCausalLM` (model_type: `k2_horizon`), decoder causal denso, sin MoE |
| Parametros totales | 8.999.178.240 (según safetensors del repo; la model card lo describe como "~7B") |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_1, Q5_0, Q4_K_M, Q4_K_S, Q4_1, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, Q2_K_S, Q2_0, Q1_0, y cuantizaciones IQ (IQ4_NL, IQ4_XS, IQ3_M, IQ3_S, IQ3_XS, IQ3_XXS, IQ2_M, IQ2_S, IQ2_XS, IQ2_XXS, IQ1_M, IQ1_S) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con versiones BF16 y cuantizadas). El modelo base IFM/K2-Horizon-7B se distribuye en safetensors BF16 |

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura de decoder causal densa definida como `K2HorizonForCausalLM`, con `model_type: k2_horizon`. Esto indica que no es un modelo de mezcla de expertos (MoE), sino un transformer denso con una configuración interna propia. La model card no aporta datos sobre el número de capas, dimensiones ocultas, cabezas de atención ni sobre el procedimiento exacto de entrenamiento.

No se ha proporcionado información sobre los datos de entrenamiento (número de tokens, composición del dataset, fase de ajuste por RLHF/DPO) ni sobre innovaciones técnicas concretas. El desarrollo corresponde a MBZUAI IFM, y la cuantización fue realizada por NANI-Nithin con una bifurcación personalizada de llama.cpp. La ejecución del modelo exige específicamente esa bifurcación (rama `model/K2Horizon`), lo que supone una limitación importante frente a arquitecturas estándar soportadas en el proyecto principal.

## Capacidades

- Generación de texto en inglés y completado de secuencias de forma autorregresiva.
- Uso conversacional básico, según el tag "conversational" y `pipeline_tag: text-generation`.
- Ejecución local mediante llama.cpp (bifurcación MBZUAI-IFM), lo que permite aplicaciones de escritorio o servidor con GGUF.
- No se ha confirmado soporte para tool calling / function calling, agentes, razonamiento guiado, visión ni audio en la información disponible.
- La model card indica `causal-lm` y `text-generation`, por lo que se trata de un modelo de lenguaje puro de texto, sin multimodalidad. No se dispone de datos sobre capacidades avanzadas de razonamiento o programación.

## Casos de uso

Los siguientes casos de uso son plausibles dada la arquitectura y la licencia, pero no han sido validados por el autor ni respaldados por benchmarks publicados.

- Asistente conversacional local en inglés: se puede integrar en una aplicación de chat mediante llama.cpp. Al ser un modelo de 7B cuantizado, permite ejecución en una GPU de consumo (por ejemplo, RTX 4060 con 8 GB). La longitud de contexto se desconoce, por lo que conviene limitar el historial de conversación.
- Resumen de textos en inglés: con un prompt adecuado, el modelo puede generar resúmenes de artículos o documentos. Dado el desconocimiento de la ventana de contexto, se recomienda dividir el texto largo en fragmentos y componer el resultado final.
- Generación de contenido creativo (emails, posts, entradas de blog): su naturaleza autorregresiva permite redactar texto libre en inglés. La licencia Apache 2.0 posibilita el uso comercial del contenido generado, siempre que se cumplan las condiciones de la licencia.
- Clasificación de texto y análisis de sentimiento: mediante prompts de few-shot, el modelo puede clasificar opiniones o detectar sentimiento en inglés. Es necesario ajustar el prompt al tamaño de la ventana de contexto, que se desconoce.
- Tutoría o asistencia educativa en inglés: el modelo puede generar explicaciones, resúmenes y preguntas de práctica sobre temas concretos. Su tamaño moderado facilita el despliegue en entornos de aprendizaje con recursos limitados.
- Generación de respuestas para FAQ o soporte técnico en inglés: con un sistema de recuperación (RAG) que filtre las respuestas del modelo, se puede construir un asistente de soporte. Es esencial incluir validación externa para mitigar el riesgo de alucinación, ya que no se dispone de evaluaciones de fiabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de puntuaciones de MMLU, HumanEval, GSM8K ni otras evaluaciones comparativas. Cualquier afirmación sobre rendimiento en tareas concretas requeriría pruebas propias con el modelo cuantizado y el fork de llama.cpp.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8.999 millones de parámetros, los pesos ocupan aproximadamente: Q4_K_M (~4,5 bits por peso) en torno a 5-6 GB; Q8_0 (~8 bits) cerca de 9 GB; BF16 (~16 bits) alrededor de 18 GB. Estas cifras son orientativas y no incluyen la memoria para el contexto ni el KV cache, que pueden incrementar significativamente el requisito.
- GPU recomendadas: para Q4_K_M, una RTX 4060 de 8 GB o superior. Para Q8_0, se recomienda una GPU con 16 GB o más (RTX 4080, A100 40GB). Para BF16, son necesarios 24 GB o más (A100, H100, RTX 4090 con restricciones de contexto).
- Cabe en GPU de consumo: sí, en cuantizaciones de 4 bits o inferiores, siempre que se use la bifurcación de llama.cpp con soporte CUDA. El autor de la cuantización utilizó una RTX 4060 Laptop de 8 GB para calcular las imatrices, lo que confirma viabilidad.
- Opciones de despliegue: llama.cpp (bifurcación MBZUAI-IFM, rama `model/K2Horizon`). No hay confirmación de soporte en vLLM, TGI ni Ollama; se recomienda verificar la compatibilidad antes de asumir su integración.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se ha encontrado información de modelos comparables en los datos proporcionados. Al no existir benchmarks ni especificaciones de otros modelos en la fuente, no es posible elaborar una comparativa objetiva. El modelo se sitúa en el rango de los 7B-9B de parámetros, pero su arquitectura no estándar y la falta de datos impiden contrastar su rendimiento con alternativas conocidas.

## Limitaciones y advertencias

- Sesgos: no se han publicado evaluaciones de sesgos. Al ser un modelo entrenado presumiblemente con datos en inglés, puede heredar estereotipos y representaciones parciales presentes en dichos datos.
- Riesgo de alucinación: al no existir benchmarks de fiabilidad publicados, el riesgo de generar información falsa o inventada no puede cuantificarse. Debe usarse con sistemas de verificación externa.
- Limitaciones de contexto: la longitud de contexto no se ha especificado, por lo que el rendimiento en documentos largos o conversaciones extensas es desconocido.
- Limitaciones de idioma: el modelo está etiquetado únicamente con el idioma inglés. No se ha confirmado soporte multilingüe, lo que limita su uso a textos en inglés.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificación, pero es necesario revisar la model card del modelo original IFM/K2-Horizon-7B para confirmar que no hay restricciones adicionales.
- Compatibilidad: el modelo requiere la bifurcación MBZUAI-IFM de llama.cpp. El llama.cpp estándar (a septiembre de 2026) no soporta `K2HorizonForCausalLM`, lo que puede causar problemas en entornos de producción si se usa una versión no compatible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/NANI-Nithin/K2-Horizon-7B-GGUF
- Modelo base: https://huggingface.co/IFM/K2-Horizon-7B
- Bifurcación de llama.cpp: https://github.com/MBZUAI-IFM/llama.cpp
- Rama específica: https://github.com/MBZUAI-IFM/llama.cpp/tree/model/K2Horizon
- Dataset usado para imatrix: https://huggingface.co/datasets/Salesforce/wikitext
