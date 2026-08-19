# hoailebads/Qwen3-Reranker-8B-VLSP-Legal-LoRA

## Resumen

El modelo `hoailebads/Qwen3-Reranker-8B-VLSP-Legal-LoRA` es un adaptador de bajo rango (LoRA) construido sobre el modelo base Qwen3-Reranker-8B, desarrollado por Alibaba. Este adaptador ha sido entrenado específicamente para el dominio legal vietnamita, utilizando presumiblemente el corpus VLSP (Vietnamese Language and Speech Processing) de documentos jurídicos. El objetivo es especializar el modelo de reranking multilingüe para mejorar la relevancia en tareas de recuperación de información legal en vietnamita.

El modelo base Qwen3-Reranker-8B es un transformer de 8 mil millones de parámetros con una ventana de contexto de 32 000 tokens, capaz de procesar más de 100 idiomas y diseñado para reordenar documentos en pipelines de retrieval-augmented generation (RAG). Al aplicar un LoRA, se adaptan los pesos del modelo a un dominio con vocabulario y estructuras textuales específicas, sin necesidad de reentrenar todo el modelo. Este enfoque es relevante porque permite construir sistemas de búsqueda legal precisos con recursos computacionales limitados.

Sin embargo, la información pública disponible sobre este adaptador es muy escasa: no se especifican la licencia, los idiomas exactos, el método de entrenamiento ni los datos utilizados. La ficha se basa en gran parte en las características del modelo base, indicando explícitamente lo que no está disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Qwen3-Reranker-8B (transformer) |
| Parametros totales | No disponible (el modelo base tiene 8 000 millones) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | 32 000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (depende del despliegue del modelo base) |
| Idiomas soportados | No especificado; el modelo base soporta más de 100 idiomas, el adaptador está orientado al vietnamita legal |
| Licencia | No disponible (el modelo base es Apache 2.0) |
| Formato de pesos | No disponible (probablemente safetensors o binario de PyTorch) |

## Arquitectura y entrenamiento

El modelo base Qwen3-Reranker-8B es un transformer de arquitectura similar a la familia Qwen3, con atención completa y 8 000 millones de parámetros. Está diseñado específicamente para la tarea de reranking: recibe una consulta y un conjunto de documentos, y devuelve puntuaciones de relevancia que permiten reordenar los resultados de búsqueda. Su entrenamiento se realizó con datos multilingües y alcanza buenos resultados en benchmarks como MTEB-Code (81,22) y MMTEB-R (72,94).

El adaptador LoRA de este repositorio añade matrices de bajo rango a las capas de atención y feed-forward del modelo base, ajustando los pesos para el dominio legal vietnamita. No se dispone de información sobre el tamaño del dataset, el número de pasos de entrenamiento, la tasa de aprendizaje ni el método de ajuste (supervisado, RLHF, etc.). Tampoco se indica si se utilizó algún tipo de regularización o si se preservó el comportamiento multilingüe del modelo base.

## Capacidades

- Reranking de documentos legales en vietnamita: el adaptador está diseñado para mejorar la relevancia en consultas sobre jurisprudencia, normativa y doctrina.
- Herencia del modelo base: soporte multilingüe (más de 100 idiomas), contexto de 32 000 tokens y capacidad de procesar documentos largos.
- Integración en pipelines RAG: puede utilizarse como componente de reranking tras una primera fase de recuperación.
- Sin capacidades de generación: el modelo es exclusivamente un reranker, no genera texto.
- No se ha confirmado soporte para tool calling, agentes o razonamiento multi-paso, ya que no es un modelo instructivo.

## Casos de uso

- Búsqueda de jurisprudencia en vietnamita: un sistema de consulta legal puede recuperar sentencias y resoluciones mediante un buscador inicial y luego usar este modelo para reordenar los resultados por relevancia, priorizando documentos que tratan los mismos artículos o conceptos.
- Asistente legal para despachos de abogados: integrado en una herramienta interna, permite a los letrados encontrar rápidamente normativa relacionada con un caso concreto, reduciendo el tiempo de revisión documental.
- Clasificación de contratos y cláusulas: dado un conjunto de contratos y una consulta sobre una cláusula específica (por ejemplo, "indemnización por incumplimiento"), el modelo puntúa y ordena los documentos más pertinentes.
- Portal de transparencia gubernamental: para ciudadanos que buscan leyes o decretos, el modelo puede mejorar la precisión de los resultados frente a búsquedas por palabras clave.
- Investigación académica en derecho: los investigadores pueden localizar artículos y tesis relevantes mediante consultas en lenguaje natural, con reranking basado en este adaptador.
- Archivado y gestión documental: en organismos públicos con grandes volúmenes de expedientes, el modelo ayuda a indexar y recuperar documentos históricos según su contenido jurídico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para el adaptador LoRA. Los datos disponibles corresponden al modelo base Qwen3-Reranker-8B, que obtiene las siguientes puntuaciones:

| Benchmark | Puntuacion |
|---|---|
| MTEB-Code | 81,22 |
| MMTEB-R | 72,94 |

Estos valores indican el rendimiento del modelo base en tareas de reranking multilingüe y de código, pero no reflejan la calidad del adaptador en el dominio legal vietnamita. Se desconoce si el LoRA mantiene o supera estas cifras en su dominio objetivo.

## Requisitos de hardware

- VRAM estimada: el modelo base de 8 000 millones de parámetros requiere aproximadamente 16 GB en FP16, o unos 8 GB en cuantización de 4 bits (GGUF). El adaptador LoRA añade un coste mínimo de memoria.
- GPU recomendadas: una RTX 4090 (24 GB) puede ejecutar el modelo en FP16; GPUs con 16 GB (RTX 4080, A100 40 GB) son suficientes. Para cuantización 4 bits, una RTX 3060 de 12 GB podría funcionar.
- Despliegue: se puede servir con vLLM, llama.cpp, Ollama o TGI, siempre que se cargue el modelo base y se aplique el adaptador LoRA. No hay confirmación de compatibilidad con todas las herramientas.
- Latencia: para un batch de 100 documentos de 1 000 tokens cada uno, la inferencia en una GPU A100 podría tardar entre 0,5 y 2 segundos, dependiendo de la implementación. Sin datos oficiales, esta estimación es orientativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen3-Reranker-8B (base) | 8B | 32k | Apache 2.0 | Reranking multilingüe |
| BGE-Reranker-v2-m3 | 568M | 8k | MIT | Reranking multilingüe, ligero |
| Cohere Rerank 3.5 | No público | 4k | Comercial | Reranking propietario |

El adaptador LoRA se diferencia por su especialización en el dominio legal vietnamita, algo que no ofrecen los modelos genéricos. Sin embargo, carece de la documentación y el soporte de los modelos comerciales, y su rendimiento en comparación con BGE o Cohere en este dominio no ha sido evaluado públicamente.

## Limitaciones y advertencias

- No hay información sobre el proceso de entrenamiento del LoRA: se desconoce el dataset, el número de pasos y las técnicas de regularización, lo que dificulta evaluar su robustez.
- Riesgo de sobreajuste: al ser un adaptador de dominio específico, puede degradar el rendimiento en consultas fuera del ámbito legal vietnamita o en otros idiomas.
- Falta de licencia clara: aunque el modelo base es Apache 2.0, el adaptador no especifica licencia, lo que puede limitar su uso comercial sin autorización explícita del autor.
- Sin benchmarks propios: no hay evidencia de que el adaptador mejore realmente sobre el modelo base en tareas legales vietnamitas.
- Posibles sesgos: los datos legales pueden contener sesgos de género, etnia o clase social, y el modelo podría amplificarlos en sus puntuaciones.
- Dependencia del modelo base: cualquier limitación de Qwen3-Reranker-8B (alucinaciones en generación, aunque no aplica aquí, o errores en idiomas minoritarios) se hereda en el adaptador.
- Fecha de creación futura (2026-08-19) sugiere que el modelo puede ser experimental o no verificado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hoailebads/Qwen3-Reranker-8B-VLSP-Legal-LoRA
- Modelo base Qwen3-Reranker-8B: https://huggingface.co/Qwen/Qwen3-Reranker-8B
- Colección Qwen3: https://huggingface.co/collections/Qwen/qwen3
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Página de SiliconFlow con información del modelo base: https://www.siliconflow.com/models/qwen3-reranker-8b
- Referencia en LLM Reference: https://www.llmreference.com/model/qwen3-reranker-8b
