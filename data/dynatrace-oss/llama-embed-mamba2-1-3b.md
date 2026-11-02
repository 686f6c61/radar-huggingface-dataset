# dynatrace-oss/llama-embed-mamba2-1.3b

## Resumen

llama-embed-mamba2-1.3b es un modelo de embeddings de texto de propósito general desarrollado por Dynatrace, construido sobre state-spaces/mamba2-1.3b, una arquitectura recurrente de espacio de estados (SSM) en lugar de un transformer clásico. El modelo reproduce el procedimiento de entrenamiento de e5-mistral-7b-instruct sobre dicha base, con el objetivo de ofrecer calidad de embedding competitiva con modelos transformer mucho mayores pero con complejidad computacional lineal y memoria constante en inferencia.

La innovación principal es la inferencia "verticalmente troceada" (vertically chunked inference), que particiona la entrada en bloques fijos y procesa cada bloque por todas las capas antes de avanzar al siguiente, manteniendo los estados recurrentes entre bloques. Esto permite memoria constante independientemente de la longitud de la secuencia, lo que resulta especialmente ventajoso para documentos largos y entornos con recursos limitados.

Con 1.343.757.312 parámetros (aproximadamente 1,3 mil millones) y licencia Apache 2.0, el modelo se posiciona como una alternativa eficiente a e5-mistral-7b-instruct para tareas de similitud semántica y recuperación de información. Existe una variante mayor, llama-embed-mamba2-7b, del mismo autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mamba2 (modelo de espacio de estados recurrente, SSM) |
| Parámetros totales | 1.343.757.312 (1,3 B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; soporte de cuantización vía librerías de despliegue no especificado) |
| Idiomas soportados | no disponible (evaluado en MTEB Multilingual v2) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Mamba2, una arquitectura de espacio de estados recurrente que sustituye la atención por una recurrencia con estados, lo que reduce la complejidad de O(n²) a O(n) respecto a la longitud de la secuencia y permite memoria constante en inferencia. Sobre esta base se aplica el procedimiento de entrenamiento de e5-mistral-7b-instruct, orientado a producir embeddings de frases y documentos para similitud semántica y recuperación. El modelo emplea un esquema de instrucción con prefijos del tipo "Instruct: ...\nQuery: ..." para consultas.

El entrenamiento utiliza el dataset jspringer/open-synthetic-embeddings. Según la model card, parte de los datos sintéticos se generaron con Llama 3.1 70B, y el modelo se distribuye bajo el aviso "Built with Llama". No se especifican en la información disponible el número total de tokens de entrenamiento, la composición detallada del dataset ni si se emplearon técnicas de RLHF o DPO. La innovación técnica destacable es la inferencia verticalmente troceada, que mantiene los estados recurrentes entre bloques de tamaño fijo (múltiplos de 256) y logra memoria constante con una sobrecarga de tiempo de ejecución negligible, ya que el beneficio de paralelización satura con tamaños de bloque relativamente pequeños.

## Capacidades

- Generación de embeddings de texto para similitud semántica (pipeline sentence-similarity).
- Extracción de características (feature-extraction) a partir de texto.
- Recuperación de información y búsqueda semántica mediante embeddings de consulta y documento.
- Soporte de instrucciones en las consultas mediante prefijos "Instruct: ... Query: ...".
- Procesamiento de secuencias largas con memoria constante gracias a la inferencia verticalmente troceada.
- Capacidades multilingües evaluadas en MTEB Multilingual v2 (idiomas concretos no detallados).
- No es un modelo generativo: no soporta tool calling, function calling ni razonamiento multi-paso por sí mismo.
- No dispone de capacidades de visión ni audio.

## Casos de uso

- Búsqueda semántica en bases de conocimiento: el modelo genera embeddings de consultas y documentos para recuperar pasajes relevantes mediante similitud coseno, con la ventaja de memoria constante en corpus de documentos largos.
- Sistemas RAG (retrieval-augmented generation): se usa como codificador de recuperación para indexar fragmentos de documentación y recuperar contexto relevante antes de pasarlo a un LLM generador.
- Deduplicación y clustering de documentos: los embeddings permiten agrupar textos semánticamente similares y detectar duplicados en grandes volúmenes de documentación técnica.
- Procesamiento de documentos largos en entornos con memoria limitada: gracias a la inferencia verticalmente troceada, puede codificar contratos, informes o artículos extensos con un consumo de memoria acotado, ajustando `vertical_chunk_size`.
- Clasificación de texto por similitud: comparar embeddings de textos con embeddings de etiquetas o prototipos para tareas de categorización sin entrenamiento adicional.
- Moderación y filtrado de contenido: comparar mensajes entrantes con embeddings de referencia de contenido permitido o prohibido para detectar proximidad semántica.
- Motores de recomendación basados en contenido: calcular similitud entre descripciones de productos o artículos para sugerir elementos relacionados.

## Benchmarks y rendimiento

Resultados agregados de task-mean según la model card:

| Modelo | MTEB (Multilingual, v2) | MTEB (eng, v2) | LongEmbed |
|---|---:|---:|---:|
| llama-embed-mamba2-1.3b (este modelo) | 55,2 | 64,3 | 40,8 |
| llama-embed-mamba2-7b | 59,4 | 65,2 | 44,5 |
| e5-mistral-7b-instruct | 60,2 | 68,0 | 43,7 |

No se han publicado en la información disponible resultados desagregados por tarea (MMLU, HumanEval, GSM8K u otros), que además no aplican a un modelo de embeddings.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors ocupan aproximadamente 2,7 GB (el tamaño del repositorio). En bfloat16, la inferencia requiere del orden de 3 GB de VRAM más overhead de activaciones; con `vertical_chunk_size` pequeño, la memoria de activaciones se mantiene acotada.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para secuencias cortas; para lotes grandes o secuencias largas, se recomienda A100, H100 o RTX 4090 por su mayor ancho de banda de memoria.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4090 (24 GB), incluso con lotes moderados.
- Opciones de despliegue: sentence-transformers (recomendado, con `use_kernels=True`), transformers con `trust_remote_code=True`. Requiere instalar `accelerate`, `kernels` y `einops` para aprovechar los kernels eficientes de inferencia verticalmente troceada. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada. La model card indica que la paralelización satura con tamaños de bloque pequeños, por lo que la sobrecarga del troceado vertical es negligible.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | MTEB (eng, v2) | LongEmbed | Licencia |
|---|---:|---|---:|---:|---|
| llama-embed-mamba2-1.3b | 1,3 B | Mamba2 (SSM) | 64,3 | 40,8 | Apache 2.0 |
| llama-embed-mamba2-7b | ~7 B | Mamba2 (SSM) | 65,2 | 44,5 | Apache 2.0 |
| e5-mistral-7b-instruct | ~7 B | Transformer (Mistral) | 68,0 | 43,7 | MIT (según su model card) |

El modelo de 1,3 B ofrece una calidad cercana al e5-mistral-7b-instruct (unos 3,7 puntos menos en MTEB eng v2) con aproximadamente una quinta parte de los parámetros y complejidad lineal, lo que lo hace atractivo cuando el coste computacional o la memoria son restrictivos. La variante de 7 B se acerca más al estado del arte del e5-mistral-7b-instruct, superándolo incluso en LongEmbed.

## Limitaciones y advertencias

- No es un modelo generativo: no puede producir texto, código ni respuestas; solo genera embeddings.
- Riesgo de alucinación no aplica directamente, pero la calidad de recuperación puede degradarse en dominios muy especializados no representados en el dataset de entrenamiento.
- Idiomas soportados no especificados; aunque se evalúa en MTEB Multilingual v2, el rendimiento por idioma no está documentado, por lo que conviene validar en el idioma objetivo.
- Longitud máxima de contexto no documentada; la inferencia verticalmente troceada permite procesar secuencias largas con memoria constante, pero el límite efectivo de contexto depende de la arquitectura base y no se detalla.
- La licencia Apache 2.0 permite uso comercial, pero el aviso "Built with Llama" implica que parte de los datos sintéticos se generaron con Llama 3.1 70B; conviene revisar las condiciones de la licencia de Llama para el uso de datos derivados.
- Requiere `trust_remote_code=True` y dependencias adicionales (`accelerate`, `kernels`, `einops`) para aprovechar los kernels eficientes; sin ellas, el rendimiento y la memoria pueden no ser óptimos.
- El modelo tiene un número reducido de descargas (66) y likes (5), por lo que la comunidad y el soporte son limitados en el momento de la consulta.
- No se han publicado detalles sobre sesgos, composición del dataset ni evaluaciones de robustez, lo que dificulta anticipar comportamientos en dominios sensibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dynatrace-oss/llama-embed-mamba2-1.3b
- Variante de 7 B: https://huggingface.co/dynatrace-oss/llama-embed-mamba2-7b
- Modelo base: https://huggingface.co/state-spaces/mamba2-1.3b
- Modelo de referencia e5-mistral-7b-instruct: https://huggingface.co/intfloat/e5-mistral-7b-instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/jspringer/open-synthetic-embeddings
