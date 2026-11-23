# samuli/sukkela-8M

## Resumen

sukkela-8M es un modelo de embeddings estáticos para finlandés desarrollado por el usuario samuli (perfil de Hugging Face), publicado bajo licencia MIT. No es un modelo generativo ni un transformer: se trata de una única tabla de tokens de 32.768 entradas por 256 dimensiones (8.192.000 parámetros en total) con mean pooling, en el formato de la librería [model2vec](https://github.com/MinishLab/model2vec). Al carecer de capas de atención, la codificación de texto se reduce a una búsqueda en tabla y un promedio, lo que permite inferencia en CPU, en un teléfono o incluso en un navegador, sin GPU.

El modelo forma parte de la familia Sukkela ("sukkela" es finlandés coloquial para rápido, ágil), junto con sukkela-16M (64k vocabulario, 256 dimensiones) y sukkela-33M (64k, 512 dimensiones). Está diseñado específicamente para búsqueda en finlandés, y también es utilizable para inglés y para emparejamiento cruzado inglés-finlandés. Su relevancia actual radica en que ofrece recuperación densa de calidad competitiva en finlandés con un coste computacional y de almacenamiento mínimo: 33 MB en float32 y 8 MB en int8.

La arquitectura estática lo sitúa en una categoría distinta a los modelos de embeddings basados en transformers: no hay ventana de contexto en el sentido habitual, ya que el modelo codifica documentos completos sin límite de longitud (aunque el autor recomienda dividir documentos largos en ventanas solapadas para búsqueda). No requiere prefijos ni instrucciones: consultas y documentos se codifican de la misma forma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings estáticos (model2vec): tabla de tokens con mean pooling, sin capas transformer |
| Parametros totales | 8.192.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | sin límite de longitud (codifica documentos completos; se recomienda ventanas solapadas para documentos largos) |
| Tipos de cuantizacion | float32 e int8 (subcarpeta `int8`, un cuarto del tamaño) |
| Idiomas soportados | finlandés (fi), inglés (en); también emparejamiento en→fi y fi→en |
| Licencia | MIT |
| Formato de pesos | safetensors (librería model2vec); compatible con sentence-transformers |
| Vocabulario | 32.768 tokens |
| Dimensiones del embedding | 256 |
| Tamaño en disco | 33 MB (float32), 8 MB (int8) |
| Pipeline | feature-extraction |

## Arquitectura y entrenamiento

sukkela-8M es un modelo de embeddings estáticos en formato model2vec. Consiste en una única tabla de embeddings de tokens de 32.768 × 256 y aplica mean pooling sobre los vectores de los tokens de entrada para producir el embedding de la frase o documento. No contiene capas de atención ni mecanismos de contexto posicional, por lo que la codificación es una operación de búsqueda en tabla seguida de un promedio, ejecutable en CPU sin aceleración hardware.

La información disponible no detalla el proceso de entrenamiento (número de tokens, composición del corpus, si hubo destilación desde un transformer, ni técnicas de alineación como RLHF o DPO). El autor indica únicamente que los modelos de mayor tamaño de la familia son más precisos, con diferencias "pequeñas pero consistentes". La innovación técnica destacable es la propia naturaleza estática del modelo: al eliminar las capas transformer, se obtiene un coste de inferencia de órdenes de magnitud inferior al de un encoder denso convencional, manteniendo una calidad de recuperación competitiva en finlandés. La versión int8 conserva la precisión de búsqueda, con una diferencia máxima de 0,004 nDCG@10 respecto a float32 en los conjuntos del autor.

## Capacidades

- Generación de embeddings de frases y documentos para búsqueda densa y similitud semántica.
- Recuperación de pasajes en finlandés con calidad competitiva (nDCG@10 de 0,853 en Belebele fi).
- Emparejamiento cruzado inglés-finlandés en ambas direcciones (en→fi: 0,759; fi→en: 0,749 en nDCG@10).
- Codificación sin prefijos ni instrucciones: consultas y documentos se tratan igual.
- Codificación de documentos completos sin límite de longitud impuesto por el modelo.
- Ejecución en CPU, dispositivos móviles y navegador, sin necesidad de GPU.
- Compatibilidad con las APIs de model2vec (`StaticModel`) y de sentence-transformers (`SentenceTransformer`).
- No soporta generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni comportamiento de agente: es exclusivamente un modelo de representación (feature-extraction).

## Casos de uso

- Búsqueda semántica en finlandés de baja latencia: el modelo codifica consultas y documentos como búsqueda en tabla y promedio, lo que permite desplegar un motor de recuperación densa en CPU con latencia mínima, adecuado para catálogos o bases documentales finlandesas.
- Búsqueda en aplicaciones móviles o en el navegador: con 8 MB en int8 y sin GPU, el modelo puede embarcarse directamente en el cliente para búsqueda local sin llamadas a servidor.
- Recuperación bilingüe inglés-finlandés: gracias a sus resultados en Belebele en→fi y fi→en, sirve para que usuarios que consultan en inglés recuperen documentos en finlandés y viceversa, por ejemplo en bases de conocimiento o documentación técnica.
- Deduplicación y agrupación de documentos: la similitud de embeddings permite agrupar registros duplicados o casi duplicados en corpus finlandeses, con un coste de codificación muy bajo sobre grandes volúmenes.
- Filtrado previo en pipelines RAG: al ser extremadamente barato, puede actuar como primera etapa de recuperación sobre un corpus amplio, dejando la reordenación fina a un modelo mayor como bge-m3.
- Búsqueda en catálogos de bibliotecas y archivos: los conjuntos finna-keywords y finna-titles del autor apuntan a este escenario; el modelo permite búsqueda por palabras clave y por títulos sobre metadatos culturales finlandeses.
- Clasificación y clustering de textos finlandeses: los embeddings sirven como características de entrada para clasificadores ligeros o algoritmos de clustering sobre textos en finlandés.

## Benchmarks y rendimiento

Resultados declarados por el autor (nDCG@10, búsqueda densa, documentos completos, vecinos más cercanos exactos; mayor es mejor). Los conjuntos terminados en -int son internos del autor y no públicos.

| Modelo | Belebele | sukkela-questions-int | sukkela-questions-int (keywords) | WebFAQ | MIRACL* | FSLDR* | finna-keywords-int | finna-titles-int | Belebele en→fi | Belebele fi→en |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| **sukkela-8M** | **0,853** | **0,798** | **0,733** | **0,614** | **0,474** | **0,393** | **0,255** | **0,648** | **0,759** | **0,749** |
| sukkela-33M | 0,884 | 0,827 | 0,749 | 0,632 | 0,503 | 0,412 | 0,283 | 0,672 | 0,798 | 0,810 |
| sukkela-16M | 0,869 | 0,808 | 0,736 | 0,623 | 0,494 | 0,389 | 0,274 | 0,654 | 0,781 | 0,791 |
| blink-multilingual-64M | 0,758 | 0,661 | 0,541 | 0,460 | 0,426 | 0,298 | 0,135 | 0,535 | 0,717 | 0,634 |
| potion-multilingual-128M | 0,594 | 0,523 | 0,374 | 0,358 | 0,231 | 0,253 | 0,101 | 0,380 | 0,533 | 0,464 |
| bge-m3 (transformer, 568M) | 0,932 | 0,905 | 0,863 | 0,798 | 0,774 | 0,452 | 0,259 | 0,749 | 0,915 | 0,905 |

Resultados en los conjuntos públicos declarados en la model-index:

| Conjunto | Métrica | Valor |
|---|---|---|
| Belebele fi (question → passage) | nDCG@10 | 0,853 |
| Belebele en→fi (English question → Finnish passage) | nDCG@10 | 0,759 |
| Belebele fi→en (Finnish question → English passage) | nDCG@10 | 0,749 |
| WebFAQ fi | nDCG@10 | 0,614 |
| MIRACL fi (corpus reducido) | nDCG@10 | 0,474 |
| FSLDR fi (dev queries, 10k distractors) | nDCG@10 | 0,393 |
| sukkela-questions (natural) | nDCG@10 | 0,764 |
| sukkela-questions (keywords) | nDCG@10 | 0,667 |
| finna-keywords | nDCG@10 | 0,180 |

Nota: los valores de sukkela-questions y finna-keywords de la model-index (0,764, 0,667 y 0,180) difieren de los de la tabla de resultados del autor (0,798, 0,733 y 0,255), que corresponden a conjuntos internos (-int). El autor declara intervalos de bootstrap del 95% (2000 remuestreos) para las diferencias pareadas frente a las baselines; los detalles completos de esa tabla no están disponibles en la información proporcionada.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo ocupa 33 MB en float32 y 8 MB en int8.
- GPU recomendadas: ninguna necesaria. Puede ejecutarse en CPU, teléfonos y navegadores.
- GPU de consumo: irrelevante; cabe en cualquier dispositivo, pero no aprovecha aceleración GPU de forma significativa.
- Opciones de despliegue: model2vec (`StaticModel.from_pretrained`), sentence-transformers (`SentenceTransformer`), con soporte de la subcarpeta `int8`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que están orientadas a modelos generativos.
- Latencia y throughput: no se publican cifras concretas; el autor describe la codificación como una búsqueda en tabla y un promedio, con ejecución rápida en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Dimensiones | Contexto | Belebele fi (nDCG@10) | Licencia | Disponibilidad |
|---|---:|---:|---|---:|---|---|
| sukkela-8M | 8,2M | 256 | sin límite | 0,853 | MIT | Hugging Face |
| sukkela-16M | 16M | 256 | sin límite | 0,869 | no disponible en la información | Hugging Face |
| sukkela-33M | 33M | 512 | sin límite | 0,884 | no disponible en la información | Hugging Face |
| blink-multilingual-64M | 64M | no disponible | no disponible | 0,758 | no disponible en la información | Hugging Face |
| potion-multilingual-128M | 128M | no disponible | no disponible | 0,594 | no disponible en la información | Hugging Face |
| bge-m3 | 568M (transformer) | no disponible | no disponible | 0,932 | no disponible en la información | Hugging Face |

sukkela-8M supera a blink-multilingual-64M y potion-multilingual-128M en todos los conjuntos reportados pese a tener entre 8 y 16 veces menos parámetros, y se queda por debajo de bge-m3 (568M, transformer) en todos ellos, con una diferencia especialmente amplia en MIRACL (0,474 frente a 0,774). Frente a sus hermanos mayores de la familia, las diferencias son pequeñas y consistentes a favor de sukkela-33M.

## Limitaciones y advertencias

- Modelo exclusivamente de embeddings: no genera texto, no razona, no ejecuta código ni soporta tool calling, agentes o visión.
- Cobertura lingüística limitada a finlandés e inglés; no está pensado para otros idiomas.
- Al ser un modelo estático sin atención, no captura dependencias contextuales complejas ni orden de palabras más allá de lo que el promedio de embeddings de tokens permite; esto puede penalizar en consultas con negaciones, sintaxis compleja o matices semánticos finos.
- Riesgo de recuperación deficiente en dominios muy específicos: el resultado en finna-keywords (0,180 en la model-index) es notablemente bajo en comparación con el resto de conjuntos.
- Los resultados de benchmarks son declarados por el autor y no están verificados (`verified: false` en la model-index); varios conjuntos son internos y no públicos, lo que impide su reproducción independiente.
- Los conjuntos MIRACL y FSLDR usan corpus reducidos o distorsionadores limitados (10k), por lo que los valores no son directamente comparables con evaluaciones a escala completa.
- Para documentos largos se recomienda dividirlos en ventanas solapadas; codificar documentos completos puede diluir la señal en el promedio.
- Licencia MIT: permite uso comercial y modificación, pero conviene revisar las condiciones de los datos de entrenamiento, no detalladas en la información disponible.
- Sin datos publicados sobre sesgos, composición del corpus de entrenamiento ni comportamiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/samuli/sukkela-8M
- Modelo hermano sukkela-16M: https://huggingface.co/samuli/sukkela-16M
- Modelo hermano sukkela-33M: https://huggingface.co/samuli/sukkela-33M
- Repositorio de model2vec: https://github.com/MinishLab/model2vec
- Documentación de Sentence Transformers: https://www.sbert.net
- Conjunto de evaluación Belebele: https://huggingface.co/datasets/facebook/belebele
- Conjunto de evaluación WebFAQ: https://huggingface.co/datasets/PaDaS-Lab/webfaq-retrieval
- Conjunto de evaluación MIRACL: https://huggingface.co/datasets/miracl/miracl
- Conjunto de evaluación FSLDR: https://huggingface.co/datasets/TurkuNLP/FSLDR
- Conjunto sukkela-questions: https://huggingface.co/datasets/samuli/sukkela-questions
- Conjunto finna-keywords: https://huggingface.co/datasets/samuli/finna-keywords
