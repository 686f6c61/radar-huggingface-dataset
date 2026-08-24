# mradermacher/isro-spaceai-v1-i1-GGUF

## Resumen

El modelo `mradermacher/isro-spaceai-v1-i1-GGUF` es una cuantización en formato GGUF del modelo `Anoopsingh53/ISRO-SpaceAI-7B-Instruct`, un modelo de lenguaje de 7.6 mil millones de parámetros especializado en el dominio espacial y la observación de la Tierra. El autor de la cuantización, mradermacher, ha aplicado la técnica de imatrix (importance matrix) para optimizar la calidad de las cuantizaciones, ofreciendo varios niveles de compresión que van desde 3.1 GB hasta 4.6 GB.

El modelo base fue fine-tuneado con QLoRA sobre un modelo de 7B (probablemente Llama-2 o Mistral, aunque no se especifica) utilizando dos datasets: `UniverseTBD/arxiv-qa-astro-ph` (preguntas y respuestas sobre astrofísica) y `Anoopsingh53/isro-space-ocean-dataset` (datos oceánicos y espaciales de ISRO). Está orientado a tareas de generación de texto conversacional en inglés e hindi, con aplicaciones en astrofísica, cosmología, heliofísica, oceanografía, teledetección y misiones espaciales como Aditya-L1, Chandrayaan-3 y Oceansat-3.

Esta versión GGUF es relevante porque permite ejecutar el modelo en hardware de consumo mediante llama.cpp, Ollama u otros motores compatibles, sin necesidad de GPUs de gran capacidad. Al estar licenciado bajo Apache 2.0, es apto para uso comercial y de investigación sin restricciones significativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de 7B, probablemente transformer decoder-only) |
| Parametros totales | 7.615.616.512 (7.6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-IQ3_XXS, i1-IQ3_M, i1-Q3_K_M, i1-Q4_K_S (además de archivo imatrix) |
| Idiomas soportados | en, hi |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

La arquitectura exacta del modelo base no se detalla en la información proporcionada. Se trata de un modelo de 7.6B parámetros, probablemente basado en una arquitectura transformer decoder-only similar a Llama-2 o Mistral, pero no se confirma. El fine-tuning se realizó con QLoRA, una técnica de adaptación de bajo rango que permite entrenar modelos grandes con recursos reducidos.

Los datos de entrenamiento incluyen dos datasets principales: `UniverseTBD/arxiv-qa-astro-ph`, que contiene pares de preguntas y respuestas extraídos de artículos de astrofísica de arXiv, y `Anoopsingh53/isro-space-ocean-dataset`, que combina datos de misiones ISRO (Aditya-L1, Chandrayaan-3, Oceansat-3) y datos oceanográficos como CalCOFI. No se especifica el número total de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO. El modelo base fue entrenado para tareas de generación de texto conversacional, con soporte para inglés e hindi.

La cuantización realizada por mradermacher utiliza la técnica de imatrix, que calcula una matriz de importancia basada en la activación de los pesos para mejorar la calidad de las cuantizaciones de baja precisión. Los archivos GGUF resultantes son compatibles con llama.cpp, Ollama y otros motores que soporten este formato.

## Capacidades

- Generación de texto conversacional en inglés e hindi, con especialización en temas espaciales y de observación de la Tierra.
- Conocimiento específico sobre misiones ISRO (Aditya-L1, Chandrayaan-3, Oceansat-3) y NASA, así como conceptos de astrofísica, cosmología y heliofísica.
- Manejo de datos oceanográficos y de teledetección, incluyendo radar de apertura sintética (SAR) y detección de inundaciones.
- Capacidad para responder preguntas basadas en artículos científicos de astrofísica (dataset arxiv-qa-astro-ph).
- Soporte multilingüe limitado a inglés e hindi.
- No se menciona soporte para tool calling, agentes, razonamiento multi-paso explícito ni capacidades multimodales (visión, audio).

## Casos de uso

- Asistente de consulta para investigadores espaciales: el modelo puede responder preguntas sobre misiones ISRO, datos de satélites y conceptos de astrofísica, facilitando la búsqueda de información en artículos científicos.
- Generación de informes técnicos sobre observación de la Tierra: gracias a su entrenamiento con datos de Oceansat-3 y Sentinel-1, puede redactar resúmenes sobre detección de inundaciones, análisis de radar SAR y monitoreo oceánico.
- Chatbot educativo para divulgación científica: su capacidad conversacional en inglés e hindi lo hace útil para explicar conceptos de cosmología, exoplanetas (Kepler) y heliofísica a estudiantes o público general.
- Análisis de datos oceanográficos: puede interpretar y resumir conjuntos de datos como CalCOFI, ayudando a oceanógrafos a extraer conclusiones preliminares.
- Soporte en redacción de propuestas de investigación: al estar entrenado con artículos de arXiv, puede ayudar a redactar secciones de antecedentes o resúmenes de literatura en astrofísica.
- Asistente para aficionados a la astronomía: responde preguntas sobre fenómenos espaciales, misiones históricas y datos de observatorios, con un tono conversacional adecuado para aplicaciones de chat.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otras evaluaciones estándar para este modelo o su versión base.

## Requisitos de hardware

- Los archivos GGUF varían entre 3.1 GB (i1-Q2_K) y 4.6 GB (i1-Q4_K_S), por lo que caben en GPUs de consumo con 6-8 GB de VRAM.
- Para la cuantización i1-Q4_K_S (4.6 GB), una GPU como la RTX 3060 (12 GB) o RTX 4060 (8 GB) es suficiente para inferencia con contexto moderado.
- Las cuantizaciones más pequeñas (i1-Q2_K, i1-IQ3_XXS) pueden ejecutarse en GPUs con 4 GB de VRAM, aunque con pérdida de calidad.
- El modelo es compatible con motores de inferencia como llama.cpp, Ollama, LM Studio y vLLM (este último con soporte GGUF limitado).
- Para uso en CPU, se recomienda al menos 8 GB de RAM para la cuantización Q4_K_S, con velocidades de generación de 5-10 tokens por segundo en procesadores modernos.
- No se dispone de datos de latencia o throughput específicos para este modelo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (fine-tunes espaciales de 7B). El modelo base `Anoopsingh53/ISRO-SpaceAI-7B-Instruct` es la referencia directa, pero no se han encontrado alternativas equivalentes en la información proporcionada. Se puede considerar que compite con otros modelos de 7B fine-tuneados para dominios científicos, pero no hay datos suficientes para una comparación rigurosa.

## Limitaciones y advertencias

- Al ser un modelo de 7.6B parámetros, su capacidad de razonamiento complejo y de manejo de contextos largos es limitada en comparación con modelos más grandes.
- No se especifica la longitud de contexto soportada; es probable que sea la estándar de los modelos base de 7B (4K-8K tokens), lo que puede restringir su uso en documentos extensos.
- El conocimiento especializado se limita a los dominios de los datasets de entrenamiento; puede alucinar o dar respuestas imprecisas en áreas fuera de astrofísica, oceanografía o misiones espaciales.
- El soporte multilingüe se limita a inglés e hindi; no se garantiza un buen rendimiento en otros idiomas.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo base puede tener dependencias de otros modelos (posiblemente Llama-2 o Mistral) cuyas licencias originales podrían imponer restricciones adicionales; se recomienda verificar la licencia del modelo base.
- No se han publicado evaluaciones de sesgos o toxicidad; como todo modelo de lenguaje, puede reflejar sesgos presentes en los datos de entrenamiento.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es una publicación reciente sin validación comunitaria.

## Enlaces

- [Repositorio HuggingFace del modelo GGUF](https://huggingface.co/mradermacher/isro-spaceai-v1-i1-GGUF)
- [Modelo base en HuggingFace](https://huggingface.co/Anoopsingh53/ISRO-SpaceAI-7B-Instruct)
- [Versión estática de cuantizaciones (sin imatrix)](https://huggingface.co/mradermacher/isro-spaceai-v1-GGUF)
- [Página de solicitudes de modelos de mradermacher](https://huggingface.co/mradermacher/model_requests)
