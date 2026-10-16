# mradermacher/TigerLLM-12B-it-i1-GGUF

## Resumen

TigerLLM-12B-it-i1-GGUF es un repositorio de cuantizaciones en formato GGUF generado por mradermacher a partir del modelo md-nishat-008/TigerLLM-12B-it. El modelo de partida es un ajuste de instrucciones ("instruction-tuned") de la familia Gemma 3, con 11.766.034.176 parámetros (aproximadamente 11,77 mil millones), orientado a conversación en bengalí (bn) e inglés (en).

La relevancia de esta publicación es práctica: el modelo original está en pesos completos (safetensors) y este repositorio ofrece versiones cuantizadas con importancia matrix (imatrix) que permiten ejecutarlo en hardware de consumo o en servidores con VRAM limitada. Incluye variantes desde 4,9 GB (i1-Q2_K, i1-IQ3_XXS) hasta 7,4 GB (i1-Q4_K_M), lo que cubre desde equipos con 6-8 GB de VRAM hasta GPU profesionales.

El repositorio lo mantiene mradermacher como trabajo de cuantización de terceros, no el autor del modelo original. El modelo fue entrenado sobre el dataset Bangla-Instruct, lo que lo sitúa como una opción específica para tareas en lengua bengalí, un nicho con relativamente pocos modelos de instrucciones disponibles. No se han publicado resultados de benchmarks ni datos de rendimiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Gemma 3 (según el tag `gemma3`); detalles concretos de configuración no disponibles |
| Parametros totales | 11.766.034.176 (aproximadamente 11,77 B) |
| Parametros activos | No aplica: el modelo es denso, no MoE |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | i1-Q2_K, i1-IQ3_XXS, i1-IQ3_M, i1-Q3_K_M, i1-IQ4_NL, i1-Q4_K_S, i1-Q4_K_M (variantes i1 con imatrix); el repositorio de cuantizaciones estáticas ofrece además Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, IQ4_NL |
| Idiomas soportados | Bengalí (bn) e inglés (en) |
| Licencia | cc-by-4.0 |
| Formato de pesos | GGUF (incluye además un archivo `.imatrix.gguf` de 0,1 GB para generar cuantizaciones propias) |

## Arquitectura y entrenamiento

El tag `gemma3` de la model card indica que el modelo base TigerLLM-12B-it deriva de la familia Gemma 3, una arquitectura transformer decoder-only. El autor del modelo original no ha publicado en esta información detalles sobre la configuración de capas, el esquema de atención, la longitud de contexto nativa, el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de alineación como RLHF, DPO o similares. Todos esos datos figuran como no disponibles.

Lo que sí está documentado es el dataset de ajuste: `md-nishat-008/Bangla-Instruct`, un corpus de instrucciones en bengalí. La innovación técnica de este repositorio concreto es el uso de cuantización con importance matrix (imatrix): mradermacher genera las variantes `i1-*` calibrando con el archivo imatrix incluido, lo que en la práctica mejora la calidad de las cuantizaciones de baja precisión (Q2, Q3, IQ2, IQ3) respecto a una cuantización estática del mismo tamaño. La model card incluye una nota indicando que se trata de un modelo de visión y que los archivos `mmproj` (proyector multimodal) estarían en el repositorio estático; sin embargo, en este repositorio no se proporciona ningún archivo `mmproj`, por lo que las capacidades visuales no son utilizables desde aquí.

## Capacidades

- Generación de texto conversacional multi-turno, con etiqueta `conversational` en el repositorio.
- Modelo ajustado a instrucciones (`instruction-tuned`), por lo que responde a peticiones directas y sigue formatos de prompt.
- Capacidad bilingüe declarada: bengalí (bn) e inglés (en).
- Especialización en contenido y tareas en lengua bengalí, derivada del dataset Bangla-Instruct.
- Soporte de tool calling / function calling: no disponible, no se menciona en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible, no se menciona en la información proporcionada.
- Capacidades de visión: la model card del cuantizador indica que el modelo base es un modelo de visión, pero este repositorio no incluye archivos `mmproj`, por lo que no se pueden usar desde aquí.
- Modo "thinking" o razonamiento explícito: no disponible.

## Casos de uso

- Asistentes conversacionales en bengalí: el modelo está ajustado específicamente sobre instrucciones en bengalí, por lo que es adecuado para construir chatbots de atención al cliente dirigidos a usuarios de Bangladés y Bengala Occidental, siempre que la longitud de contexto sea suficiente para el histórico de la conversación.
- Traducción y adaptación de contenido bn-en: dado su entrenamiento bilingüe, puede emplearse para traducir documentación técnica, artículos o material comercial entre bengalí e inglés, con revisión humana posterior.
- Generación de contenido editorial en bengalí: redacción de borradores de artículos, descripciones de producto, correos y publicaciones en redes sociales, tareas donde los modelos multilingües genéricos suelen rendir peor por falta de datos de ese idioma.
- Procesamiento de formularios y texto administrativo en bengalí: resumen y extracción de información de documentos en lengua bengalí en flujos internos, desplegando la variante i1-Q4_K_M en una GPU de 8-12 GB.
- Despliegue en el borde o en entornos sin GPU dedicada: las cuantizaciones i1-Q2_K e i1-IQ3_XXS (4,9 GB cada una) permiten ejecutar el modelo en CPU o en GPU integradas mediante llama.cpp, útil para prototipos o entornos con restricciones de hardware.
- Investigación en NLP de bajo recurso: como modelo de referencia cuantizado para estudiar el impacto de la cuantización con imatrix en idiomas con pocos recursos, comparando las variantes i1 con las estáticas del repositorio hermano.
- Filtrado y moderación de contenido en bengalí: clasificación y reformulación de texto generado por usuarios en plataformas cuyo público principal habla bengalí, con una capa de reglas adicionales por encima del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del cuantizador no incluye métricas de MMLU, HumanEval, GSM8K ni de evaluación en bengalí, y no se dispone de datos de comparación con otros modelos. Tampoco se documentan mediciones de perplejidad por tipo de cuantización.

## Requisitos de hardware

- Tamaños de peso reales según los archivos publicados: i1-Q2_K 4,9 GB; i1-IQ3_XXS 4,9 GB; i1-IQ3_M 5,8 GB; i1-Q3_K_M 6,1 GB; i1-IQ4_NL 7,0 GB; i1-Q4_K_S 7,0 GB; i1-Q4_K_M 7,4 GB.
- VRAM estimada para inferencia: aproximadamente el tamaño del archivo más el caché KV y el overhead del runtime. Para i1-Q4_K_M (7,4 GB), en la práctica se necesitan del orden de 9-11 GB de VRAM con contextos moderados. La estimación exacta no puede calcularse porque la longitud de contexto del modelo no está disponible en la información proporcionada.
- GPU recomendadas: RTX 4090 (24 GB), A100 40 GB u 80 GB y H100 para despliegues con contexto largo o múltiples peticiones concurrentes; RTX 4070 Ti / 4080 (12-16 GB) para la variante i1-Q4_K_M con contexto moderado.
- Cabe en GPU de consumo: sí. La variante i1-Q4_K_M (7,4 GB) entra en tarjetas de 8 GB con margen ajustado, y con holgura en 12 GB (RTX 3060 12 GB, RTX 4070). Las variantes i1-Q2_K e i1-IQ3_XXS (4,9 GB) caben incluso en GPU de 6 GB.
- Descarga parcial en CPU: llama.cpp permite descargar algunas capas a CPU, lo que hace viable ejecutar i1-Q4_K_M en tarjetas de 6-8 GB a costa de latencia.
- Opciones de despliegue: llama.cpp, llama-cpp-python, Ollama, LM Studio, koboldcpp, text-generation-webui y servidores compatibles con GGUF. La compatibilidad con vLLM para GGUF es limitada, y TGI no soporta este formato.
- Nota de compatibilidad: las cuantizaciones con prefijo `i1-` (imatrix) y las variantes IQ requieren versiones razonablemente recientes de llama.cpp; builds antiguos pueden no cargarlas correctamente.
- Latencia y throughput estimados: no disponible, no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este modelo con alternativas. La tabla siguiente compara únicamente aspectos de formato, tamaño y licencia.

| Modelo | Parametros | Formato | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/TigerLLM-12B-it-i1-GGUF (este) | 11,77 B | GGUF con imatrix (24 tipos) | bn, en | cc-by-4.0 | Público en HuggingFace, 0 descargas, 0 likes |
| md-nishat-008/TigerLLM-12B-it (modelo base) | 11,77 B | safetensors (transformers) | bn, en | cc-by-4.0 según la model card citada | Público en HuggingFace |
| mradermacher/TigerLLM-12B-it-GGUF | 11,77 B | GGUF estático (sin imatrix) | bn, en | cc-by-4.0 | Público en HuggingFace |
| Otros modelos de 12 B de instrucciones (por ejemplo, la familia Gemma 3 de tamaño equivalente) | no disponible para esta comparativa | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables específicos para bengalí dentro de la documentación proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay métricas publicadas de calidad, razonamiento, código o evaluación en bengalí, por lo que el rendimiento real debe validarse por cuenta propia antes de usarlo en producción.
- Idiomas limitados a bengalí e inglés: no hay soporte declarado para castellano ni para otros idiomas, y no se ha documentado su comportamiento fuera de ese par.
- Longitud de contexto desconocida: al no figurar en la información disponible, no se puede garantizar el comportamiento en conversaciones o documentos largos.
- Riesgo de alucinación no evaluado: no se han publicado estudios de fidelidad factual ni tasas de error para este modelo ni para el modelo base.
- Validación comunitaria nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de retroalimentación de la comunidad sobre su calidad.
- Licencia cc-by-4.0: permite uso comercial con atribución, pero el modelo base pertenece a la familia Gemma 3, cuyas condiciones de uso pueden aplicar de forma adicional; conviene revisar los términos del modelo original antes de un despliegue comercial.
- Capacidades de visión no utilizables: la model card indica que se trata de un modelo de visión, pero no se incluyen archivos `mmproj` en este repositorio, por lo que el proyector multimodal debe obtenerse del repositorio estático o no estará disponible.
- Dependencia del runtime: las cuantizaciones i1 e IQ requieren builds recientes de llama.cpp; en versiones antiguas puede fallar la carga o degradarse la calidad.
- Datos de entrenamiento opacos: se desconoce el número de tokens, la composición del dataset Bangla-Instruct y si hubo procesos de alineación (RLHF, DPO), lo que dificulta anticipar sesgos.
- Sesgos potenciales: no documentados por el autor; al entrenarse sobre un dataset de instrucciones en bengalí, pueden aparecer sesgos culturales, de género o regionales propios de la fuente, sin que exista una evaluación publicada.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/mradermacher/TigerLLM-12B-it-i1-GGUF
- Modelo base: https://huggingface.co/md-nishat-008/TigerLLM-12B-it
- Repositorio de cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/TigerLLM-12B-it-GGUF
- Dataset de ajuste: https://huggingface.co/datasets/md-nishat-008/Bangla-Instruct
- Página de overview y descargas del cuantizador: https://hf.tst.eu/model#TigerLLM-12B-it-i1-GGUF
- Guía de uso de archivos GGUF (README de TheBloke, referencia citada por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantización de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y peticiones de modelos del cuantizador: https://huggingface.co/mradermacher/model_requests
- Sitio de nethype GmbH, empresa que cede los servidores para el trabajo de cuantización: https://www.nethype.de/
- Gráfico comparativo de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
