# RandHan/ResMem-Mistral-7B-v0.3

## Resumen

ResMem-Mistral-7B-v0.3 es un módulo de memoria paramétrica desarrollado por Changjiang Han y colaboradores (autores del artículo "From Lookups to Lessons: Turning Retrieved Knowledge into Parametric Memory") que se acopla a un `mistralai/Mistral-7B-v0.3` congelado. No es un modelo de lenguaje autónomo: es un bloque feed-forward de 1.540 millones de parámetros que lee los estados ocultos de la última subcapa feed-forward del modelo base y emite un residuo de logits que se suma a la distribución original. El objetivo es internalizar conocimiento recuperado por BM25 durante el entrenamiento, de modo que en inferencia no haga falta ningún sistema de recuperación.

La relevancia del modelo reside en su planteamiento: sustituye la recuperación en tiempo de inferencia (RAG) por una destilación residual desde un profesor BM25-RAG hacia una memoria paramétrica. Esto reduce la latencia y la complejidad de infraestructura en tareas de pregunta-respuesta sobre conocimiento, manteniendo el modelo base intacto y congelado.

El checkpoint publicado corresponde a la variante de knowledge-QA reportada en la Tabla 1 del artículo, entrenada durante una época sobre la Wikipedia inglesa de diciembre de 2021. El repositorio ocupa 3,1 GB y los pesos están en BF16, aunque el código de evaluación los carga en FP32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Memoria feed-forward residual (8 bloques, hidden size 4096, intermediate size 14336) acoplada a un transformer Mistral-7B-v0.3 congelado |
| Parametros totales | 1.543.540.736 (solo el módulo de memoria; el modelo base Mistral-7B-v0.3 se carga aparte) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base; no especificada en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible (pesos en BF16; evaluacion en FP32) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

ResMem es un módulo feed-forward compuesto por ocho bloques con tamaño oculto de 4096 y tamaño intermedio de 14336, lo que suma 1.540 millones de parámetros. Se conecta a la salida de la última subcapa feed-forward de un Mistral-7B-v0.3 congelado y produce un residuo de logits `s` que se combina con los logits del modelo base mediante `softmax(z_B + γ·s)`, donde γ es un coeficiente de escala. En la evaluación del apéndice C del artículo se emplea γ = 0,4 para todos los conjuntos de datos.

El entrenamiento se basa en autodestilación residual: el profesor es el propio modelo base congelado leyendo los tres pasajes BM25 principales para cada fragmento de 64 tokens, y el alumno es el mismo modelo base más la memoria. El conjunto de datos es `Rubin-Wei/enwiki-dec2021-preprocessed-mistral`, correspondiente a la Wikipedia inglesa de diciembre de 2021, sobre la que se entrena durante una época. La innovación principal es que la recuperación solo se usa en entrenamiento; en inferencia, la distribución del siguiente token se calcula sin ningún paso de recuperación.

## Capacidades

- Respuesta a preguntas de conocimiento (knowledge-QA) sobre hechos cubiertos por la Wikipedia inglesa de diciembre de 2021.
- Generación de texto y razonamiento heredados del modelo base Mistral-7B-v0.3.
- Internalización de conocimiento sin recuperación en tiempo de inferencia: no requiere índice BM25 ni base vectorial en producción.
- Combinación modular: el módulo de memoria se puede activar o desactivar sumando o no el residuo de logits.
- Escalado del efecto de memoria mediante el coeficiente γ (valor de referencia 0,4).
- Soporte de tool calling, agentes, visión o audio: no disponible (no se menciona en la información proporcionada).

## Casos de uso

- Pregunta-respuesta factual sin infraestructura de recuperación: el modelo responde a preguntas sobre entidades y hechos de la Wikipedia de 2021 sin necesidad de desplegar un índice BM25 ni un motor de búsqueda, lo que simplifica el stack de producción y elimina la latencia de recuperación.
- Sustitución de RAG en sistemas con restricciones de latencia: al no requerir recuperación en inferencia, el coste por consulta se reduce a una única pasada del modelo base más el módulo de memoria, adecuado para entornos interactivos.
- Investigación sobre memoria paramétrica: sirve como referencia reproducible para estudiar la destilación de conocimiento recuperado hacia pesos, comparando el comportamiento con y sin el residuo de memoria.
- Evaluación comparativa RAG frente a memoria paramétrica: permite medir en un mismo modelo base la diferencia de precisión entre recuperación explícita y conocimiento internalizado, útil para decidir arquitecturas en proyectos de QA.
- Prototipado de asistentes de dominio cerrado: si el conocimiento relevante está contenido en la Wikipedia de diciembre de 2021, el modelo puede servir como base para asistentes temáticos sin dependencias externas.
- Ajuste del equilibrio conocimiento-base mediante γ: en experimentos controlados se puede modular la influencia de la memoria (por ejemplo, γ = 0,4) para analizar el compromiso entre conocimiento inyectado y capacidades originales del modelo base.
- Despliegue en pipelines de investigación con licencia permisiva: la licencia Apache 2.0 del módulo facilita su integración en entornos académicos y comerciales, siempre que se respete la licencia del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la Tabla 1 del artículo "From Lookups to Lessons: Turning Retrieved Knowledge into Parametric Memory" para los resultados de knowledge-QA, pero no se incluyen cifras numéricas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: el módulo de memoria suma 1.540 millones de parámetros; en BF16 ocupa aproximadamente 3,1 GB, a los que hay que añadir la memoria del modelo base Mistral-7B-v0.3 (unos 14,5 GB en BF16). El total ronda los 17-18 GB en BF16.
- En FP32 (modo de evaluación indicado en la model card), el módulo de memoria requiere unos 6,2 GB y el modelo base unos 29 GB, lo que eleva el total a aproximadamente 35 GB.
- GPU recomendadas: A100 40 GB o H100 para FP32; A100 40 GB, L40S o RTX 4090 (24 GB) para BF16 con margen ajustado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en BF16 si se gestiona con cuidado el uso de memoria; en GPUs de 16 GB no cabe en BF16 sin cuantización, y no se documentan opciones de cuantización.
- Opciones de despliegue: el código de referencia se basa en PyTorch y Transformers, con utilidades propias (`resmem.memory`) del repositorio de GitHub. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ResMem-Mistral-7B-v0.3 | 1,54 B (memoria) + 7 B (base) | No disponible | Memoria paramétrica destilada de BM25-RAG | Apache 2.0 | Hugging Face |
| Mistral-7B-v0.3 (base) | 7 B | No disponible en la informacion proporcionada | Transformer decoder | Apache 2.0 | Hugging Face |
| Sistemas RAG con BM25 + Mistral-7B | 7 B + índice | Depende del recuperador | Recuperación en inferencia | Apache 2.0 (modelo) | Múltiple |

La comparación directa con alternativas de memoria paramétrica no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El conocimiento está acotado a la Wikipedia inglesa de diciembre de 2021; hechos posteriores o fuera de ese corpus no están cubiertos por la memoria.
- Solo soporta inglés; no se documenta multilingüismo.
- Riesgo de alucinación inherente al modelo base Mistral-7B-v0.3, que no se corrige con el módulo de memoria.
- El módulo depende de un modelo base concreto (`mistralai/Mistral-7B-v0.3`); no es portable a otras arquitecturas sin reentrenamiento.
- El valor de γ = 0,4 es una referencia del apéndice C; en el artículo se selecciona por conjunto de datos según EM de validación, por lo que el rendimiento óptimo puede requerir ajuste.
- No se documentan opciones de cuantización ni soporte para motores de inferencia de alto rendimiento, lo que limita el despliegue en producción a gran escala.
- El repositorio tiene 17 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria muy limitada.
- Aunque la licencia del módulo es Apache 2.0, el uso comercial debe verificar también los términos del modelo base Mistral-7B-v0.3.

## Enlaces

- Hugging Face: https://huggingface.co/RandHan/ResMem-Mistral-7B-v0.3
- Repositorio de código: https://github.com/SSRand/From-Lookups-to-Lessons
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-v0.3
- Dataset de entrenamiento: https://huggingface.co/datasets/Rubin-Wei/enwiki-dec2021-preprocessed-mistral
- Artículo: Han, Changjiang et al. "From Lookups to Lessons: Turning Retrieved Knowledge into Parametric Memory", arXiv preprint, 2026 (no se proporciona URL directa en la información disponible).
