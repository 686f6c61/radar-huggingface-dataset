# nuofang/Qwen3.8-9B-Distill-SLERP-F451-Pro-Writer-Uncensored-GGUF

## Resumen

El modelo `nuofang/Qwen3.8-9B-Distill-SLERP-F451-Pro-Writer-Uncensored-GGUF` es una cuantización GGUF del modelo homónimo creado por el usuario nuofang, que a su vez es una variante fusionada (mediante SLERP) de la destilación comunitaria de Qwen3.8 a 9B parámetros. Esta destilación, desarrollada originalmente por el equipo Empero, toma el modelo Qwen3.8 de Alibaba (que en su versión abierta tiene 27B parámetros) y lo comprime en una arquitectura de 9B basada en Qwen3.5, entrenándolo con unas 70 000 trazas de razonamiento denso del profesor, cubriendo matemáticas, código, razonamiento general, seguimiento de instrucciones y uso de herramientas.

La variante concreta que nos ocupa añade una fusión SLERP con otros modelos orientados a escritura creativa y sin censura (sufijos "Pro-Writer" y "Uncensored"), y el autor ha realizado una cuantización con imatrix calibrada específicamente para novelas chinas y role-play, preservando a su vez lógica y sentido común. El resultado es un modelo de 9B ejecutable localmente mediante llama.cpp, pensado para tareas de generación de texto creativo, role-play y asistencia general, con especial atención al idioma chino.

La relevancia actual radica en que ofrece una alternativa de código abierto, sin censura y optimizada para escritura, que puede desplegarse en hardware de consumo (GPU con 8 GB o más) gracias a las cuantizaciones GGUF, algo que no es posible con el modelo original de 27B.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5-9B, no confirmada para esta variante) |
| Parametros totales | no disponible (el nombre sugiere ~9B, pero el dato de safetensors es 1 278 200, probablemente erróneo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (IQ4_XS, Q4_K_M, Q5_K_M y otras presentes en el repositorio) |
| Idiomas soportados | Chino e inglés (inferido por la calibración imatrix, no confirmado oficialmente) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo base `nuofang/Qwen3.8-9B-Distill-SLERP-F451-Pro-Writer-Uncensored` es una fusión SLERP de varios modelos derivados de la destilación de Qwen3.8. La destilación original, Qwen3.8-9B-Distill, fue entrenada por Empero sobre la arquitectura Qwen3.5-9B, utilizando aproximadamente 70 000 trazas de profesor (chain-of-thought denso) del modelo Qwen3.8 de 2.4T parámetros (versión A95B, aunque las cifras exactas no están claras). El entrenamiento cubrió matemáticas, código, razonamiento general, instrucciones y tool use, con filtrado de calidad.

Sobre esa base, nuofang ha aplicado una interpolación SLERP con otros modelos (sufijos F451, Pro-Writer, Uncensored) para potenciar la escritura creativa y eliminar restricciones de contenido. No se dispone de detalles sobre el dataset o el método de fusión más allá del nombre.

La cuantización GGUF utiliza imatrix (importance matrix) calibrada con datos de novelas chinas y role-play, lo que mejora la perplejidad en esos dominios para cuantizaciones Q5_K_M e inferiores. Según la model card, la perplejidad medida sobre el dataset de calibración es:

- Base (F16/BF16): PPL = 14.1462 ± 0.11497
- IQ4_XS: PPL = 12.0835 ± 0.09560
- Q4_K_M: PPL = 12.0806 ± 0.09554

## Capacidades

- Generación de texto creativo y narrativo, especialmente en chino, con estilo literario y adaptación a contextos de novela y role-play.
- Razonamiento lógico y matemático básico, heredado de la destilación de Qwen3.8.
- Generación de código y asistencia en programación, según las capacidades de la destilación original.
- Seguimiento de instrucciones y diálogo multi-turno.
- Soporte de tool calling y uso de funciones (reportado en la destilación original, no confirmado específicamente en esta variante).
- Sin censura: el modelo no aplica filtros de contenido explícito, lo que permite generar material adulto o sensible sin restricciones.
- Capacidad multilingüe limitada, con énfasis en chino e inglés.

## Casos de uso

- Escritura de novelas y relatos: el modelo puede generar tramas, diálogos y descripciones coherentes en chino, gracias a la calibración imatrix orientada a ese género. Un escritor puede usarlo como asistente para superar bloqueos creativos o expandir borradores.
- Role-play conversacional: su entrenamiento específico para RP permite mantener personajes consistentes y responder de forma inmersiva en chats de rol, tanto en chino como en inglés.
- Generación de contenido sin filtros: para proyectos que requieren material adulto o temáticas controvertidas, el modelo no impone restricciones, algo útil en entornos de investigación creativa o simulación.
- Asistencia de código en entornos locales: al ser un modelo de 9B cuantizado, puede ejecutarse en una GPU de consumo (p. ej., RTX 3060 12 GB) y usarse como autocompletado o generador de funciones en editores como VS Code mediante herramientas tipo Ollama.
- Prototipado de agentes conversacionales: su capacidad de tool calling (si se confirma) permite integrarlo en pipelines de automatización, como chatbots con acceso a APIs o bases de datos.
- Educación y práctica de idiomas: puede generar ejercicios de escritura, corrección de textos y práctica de conversación en chino, aprovechando su dominio del idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica proporcionada es la perplejidad sobre el dataset de calibración, indicada en la sección de arquitectura. Para comparar con otros modelos, no hay datos objetivos de rendimiento en tareas académicas o de código.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantización. Para un modelo de ~9B parámetros, una cuantización Q4_K_M ocupa aproximadamente 5-6 GB, por lo que cabe en GPUs con 8 GB de VRAM. Las cuantizaciones más altas (Q5_K_M, Q6_K, Q8_0) requieren entre 7 y 10 GB.
- GPU recomendadas: RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070 o superiores para las cuantizaciones más altas. Para cuantizaciones bajas, también funciona en tarjetas de 8 GB como la RTX 3050 o GTX 1660 Super.
- El tamaño del repositorio es de 35.1 GB, lo que indica que se incluyen múltiples archivos GGUF de distintas cuantizaciones.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (con adaptador GGUF), entre otros.
- Latencia y throughput: no hay datos publicados, pero para un modelo de 9B en GPU moderna se espera una velocidad de generación de 20-40 tokens/s con cuantización Q4_K_M.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-9B-Distill (Empero) | ~9B | no disponible | no disponible | Destilación original, sin fusión ni ajuste creativo |
| Llama-3.1-8B-Instruct | 8B | 128K | Llama 3.1 Community License | Modelo generalista, con restricciones de uso |
| Mistral-7B-Instruct | 7B | 32K | Apache 2.0 | Buen rendimiento general, menos orientado a chino |
| Este modelo (variante GGUF) | ~9B | no disponible | no disponible | Sin censura, orientado a escritura china y RP |

La comparativa es limitada porque no se dispone de datos de rendimiento para este modelo. En cuanto a licencia, tanto la destilación original como esta variante carecen de una licencia explícita, lo que supone un riesgo para uso comercial.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser una destilación de un modelo mayor, puede presentar inexactitudes fácticas o inventar información, especialmente en temas especializados.
- Contenido sin censura: el modelo puede generar material explícito, ofensivo o peligroso. No debe usarse en aplicaciones donde se requiera moderación de contenido.
- Licencia no definida: no se especifica ninguna licencia, por lo que su uso comercial o redistribución puede ser problemático legalmente.
- Idiomas limitados: aunque maneja chino e inglés, su rendimiento en otros idiomas es probablemente inferior.
- Contexto limitado: no se ha confirmado la longitud de contexto, pero al estar basado en Qwen3.5, podría ser de 32K o 128K; sin embargo, no hay garantía.
- Perplejidad relativamente alta: los valores de PPL (14.1 en base) son elevados comparados con otros modelos de 9B, lo que sugiere una calidad de generación inferior en tareas generales.
- Dependencia de la calibración imatrix: la mejora en perplejidad para cuantizaciones bajas solo es efectiva con los datos de calibración proporcionados; en otros dominios la calidad puede degradarse.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/nuofang/Qwen3.8-9B-Distill-SLERP-F451-Pro-Writer-Uncensored-GGUF
- Modelo base (sin cuantizar): https://huggingface.co/nuofang/Qwen3.8-9B-Distill-SLERP-F451-Pro-Writer-Uncensored (inferido, no verificado)
- Blog sobre Qwen3.8-9B-Distill: https://www.mindstudio.ai/blog/qwen3-8-9b-distillation-local
- Espejo en AtomGit: https://ai.atomgit.com/hf_mirrors/empero-ai/Qwen3.8-9B-Distill
- Repositorio oficial de Qwen3.8 (modelo original): https://github.com/QwenLM/Qwen3.8
