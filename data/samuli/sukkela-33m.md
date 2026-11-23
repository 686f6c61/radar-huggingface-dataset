# samuli/sukkela-33M

## Resumen

sukkela-33M es un modelo de embeddings estáticos para finlandés desarrollado por el autor independiente samuli, publicado en Hugging Face bajo licencia MIT. No es un modelo generativo ni un transformer: se trata de una única tabla de embeddings de 64.000 tokens por 512 dimensiones (32,768 millones de parámetros) con pooling por media, en formato model2vec. Al carecer de capas de atención, la codificación de texto se reduce a una búsqueda en tabla y un promedio, lo que permite inferencia en CPU, en un teléfono o en un navegador sin GPU.

El modelo está diseñado específicamente para búsqueda y recuperación de información en finlandés, aunque también cubre inglés y el emparejamiento cruzado inglés-finlandés. Forma parte de la familia Sukkela (palabra coloquial finlandesa para "rápido, ágil"), junto a sukkela-16M y sukkela-8M, con los que comparte vocabulario y metodología pero variando dimensiones y tamaño. Su relevancia actual radica en ofrecer una alternativa de recuperación densa con una huella de 131 MB en float32 (33 MB en int8) y latencia de CPU, sin sacrificar demasiada precisión frente a transformers multilingües mucho mayores.

La propuesta encaja en escenarios donde el coste computacional y el despliegue en el borde son críticos: búsqueda semántica en aplicaciones móviles, motores de búsqueda internos de bajo consumo o sistemas de recuperación previa a un reranker. El autor declara resultados de recuperación medidos con nDCG@10 en conjuntos como Belebele, WebFAQ, MIRACL y FSLDR, con una diferencia máxima de 0,002 nDCG@10 entre la versión float32 y la int8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings estáticos (model2vec); tabla de tokens con pooling por media, sin capas transformer |
| Parametros totales | 32.768.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (sin límite de longitud; se codifica el documento completo) |
| Tipos de cuantizacion | float32 e int8 (subcarpeta `int8`) |
| Idiomas soportados | finlandés (fi), inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería model2vec) |

## Arquitectura y entrenamiento

sukkela-33M es un modelo de embeddings estáticos en el formato de model2vec: una tabla de 64.000 entradas por 512 dimensiones que asigna un vector a cada token del vocabulario. La representación de una frase o documento se obtiene mediante pooling por media de los vectores de sus tokens, sin atención, sin capas ocultas y sin mecanismo de contexto posicional. Esto implica que el modelo no modela el orden de las palabras ni las dependencias sintácticas de forma explícita, sino que aproxima la semántica a partir de la composición de embeddings de token destilados.

La información disponible no detalla el proceso de entrenamiento: no se especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo destilación desde un transformer profesor, ajuste con RLHF/DPO o entrenamiento contrastivo. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal, que no aplican a esta arquitectura. El autor sí indica que no se necesitan prefijos ni instrucciones: consultas y documentos se codifican de la misma manera, y para documentos largos recomienda dividirlos en ventanas solapadas en lugar de confiar en un límite de contexto inexistente.

## Capacidades

- Generación de embeddings de frases y documentos para recuperación densa y similitud semántica.
- Búsqueda semántica monolingüe en finlandés y en inglés.
- Emparejamiento cruzado inglés-finlandés (consulta en inglés contra pasaje en finlandés y viceversa).
- Codificación sin límite de longitud de documento, aunque con recomendación de ventanas solapadas para documentos largos.
- Inferencia en CPU, dispositivos móviles y navegador, sin necesidad de GPU.
- Compatibilidad con las librerías model2vec y Sentence Transformers.
- Versión int8 con precisión prácticamente idéntica (diferencia máxima de 0,002 nDCG@10 frente a float32).
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Búsqueda semántica en aplicaciones móviles: al ser una tabla de 131 MB en float32 (33 MB en int8) y ejecutarse en CPU, puede integrarse en apps Android o iOS para búsqueda local de contenido sin conexión.
- Motor de búsqueda interno de bajo coste: indexación de documentación corporativa en finlandés con codificación por lotes en servidores sin GPU, reduciendo el coste de infraestructura frente a transformers de cientos de millones de parámetros.
- Recuperación previa a un reranker: primera etapa de un pipeline RAG que filtra candidatos con sukkela-33M y los reordena después con un cross-encoder mayor, aprovechando su baja latencia.
- Búsqueda bilingüe inglés-finlandés: atención al cliente o bases de conocimiento donde las consultas llegan en inglés y los documentos están en finlandés, con nDCG@10 de 0,798 en Belebele en→fi.
- Deduplicación y clustering de documentos: cálculo de similitud coseno entre pasajes para agrupar contenido redundante en corpus finlandeses, con codificación rápida de grandes volúmenes.
- Búsqueda en el navegador: despliegue mediante model2vec o Transformers.js para búsqueda semántica del lado del cliente en sitios web en finlandés, sin llamadas a servidor.
- Filtrado de candidatos en sistemas de preguntas frecuentes: emparejamiento de preguntas de usuarios con respuestas predefinidas en centros de soporte, donde la latencia de CPU es determinante.

## Benchmarks y rendimiento

Resultados declarados por el autor (nDCG@10, recuperación densa, documentos completos, vecinos más cercanos exactos; mayor es mejor). Los conjuntos terminados en `-int` son internos y no públicos.

| Modelo | Belebele | sukkela-questions-int | sukkela-questions-int (keywords) | WebFAQ | MIRACL* | FSLDR* | finna-keywords-int | finna-titles-int | Belebele en→fi | Belebele fi→en |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| **sukkela-33M** | **0,884** | **0,827** | **0,749** | **0,632** | **0,503** | **0,412** | **0,283** | **0,672** | **0,798** | **0,810** |
| sukkela-16M | 0,869 | 0,808 | 0,736 | 0,623 | 0,494 | 0,389 | 0,274 | 0,654 | 0,781 | 0,791 |
| sukkela-8M | 0,853 | 0,798 | 0,733 | 0,614 | 0,474 | 0,393 | 0,255 | 0,648 | 0,759 | 0,749 |
| blink-multilingual-64M | 0,758 | 0,661 | 0,541 | 0,460 | 0,426 | 0,298 | 0,135 | 0,535 | 0,717 | 0,634 |
| potion-multilingual-128M | 0,594 | 0,523 | 0,374 | 0,358 | 0,231 | 0,253 | 0,101 | 0,380 | 0,533 | 0,464 |
| bge-m3 (transformer, 568M) | 0,932 | 0,905 | 0,863 | 0,798 | 0,774 | 0,452 | 0,259 | 0,749 | 0,915 | 0,905 |

Resultados de la model-index oficial (subconjunto público):

| Conjunto | Métrica | Valor |
|---|---|---|
| Belebele fi (question → passage) | nDCG@10 | 0,884 |
| Belebele en→fi (English question → Finnish passage) | nDCG@10 | 0,798 |
| Belebele fi→en (Finnish question → English passage) | nDCG@10 | 0,810 |
| WebFAQ fi | nDCG@10 | 0,632 |
| MIRACL fi (corpus reducido) | nDCG@10 | 0,503 |
| FSLDR fi (dev queries, 10k distractores) | nDCG@10 | 0,412 |
| sukkela-questions (natural) | nDCG@10 | 0,798 |
| sukkela-questions (keywords) | nDCG@10 | 0,683 |
| finna-keywords | nDCG@10 | 0,206 |

## Requisitos de hardware

- VRAM para inferencia: 0 GB; el modelo está pensado para CPU. En float32 ocupa 131 MB y en int8 33 MB.
- GPU recomendadas: no requiere GPU. Cualquier GPU moderna puede usarse, pero no aporta ventaja significativa frente a CPU para esta arquitectura.
- Cabe en cualquier GPU de consumo e incluso en dispositivos sin GPU dedicada (móviles, navegador, Raspberry Pi).
- Opciones de despliegue: model2vec (`StaticModel.from_pretrained`), Sentence Transformers, y exportación a otros runtimes compatibles con model2vec. No aplica vLLM, TGI ni llama.cpp, que están orientados a modelos generativos.
- Latencia y throughput: no se publican cifras concretas; el autor indica que la codificación es una búsqueda en tabla y un promedio, por lo que es sustancialmente más rápida que un transformer del mismo tamaño en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Belebele fi (nDCG@10) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| sukkela-33M | 33M (estáticos) | Sin límite (ventanas recomendadas) | 0,884 | MIT | Hugging Face |
| sukkela-16M | 16M (estáticos) | Sin límite (ventanas recomendadas) | 0,869 | MIT | Hugging Face |
| sukkela-8M | 8M (estáticos) | Sin límite (ventanas recomendadas) | 0,853 | MIT | Hugging Face |
| blink-multilingual-64M | 64M (estáticos) | Sin límite (ventanas recomendadas) | 0,758 | no disponible | Hugging Face |
| potion-multilingual-128M | 128M (estáticos) | Sin límite (ventanas recomendadas) | 0,594 | no disponible | Hugging Face |
| bge-m3 | 568M (transformer) | 8.192 tokens | 0,932 | MIT | Hugging Face |

## Limitaciones y advertencias

- Al ser embeddings estáticos sin atención, no modela orden de palabras ni dependencias sintácticas; puede fallar en consultas que dependen de la estructura oracional o la negación.
- Los sesgos conocidos no están documentados en la información disponible; al entrenarse presumiblemente con corpus finlandeses, puede heredar sesgos de esas fuentes.
- Riesgo de alucinación no aplica en sentido generativo, pero sí puede producir recuperaciones irrelevantes con alta puntuación de similitud en dominios alejados del entrenamiento (por ejemplo, finna-keywords con nDCG@10 de 0,206).
- Cobertura lingüística limitada a finlandés e inglés; no se declaran otros idiomas.
- En MIRACL fi con corpus reducido el rendimiento cae a 0,503 nDCG@10, y en FSLDR a 0,412, lo que sugiere degradación en recuperación sobre corpus grandes y diversos.
- La licencia MIT permite uso comercial sin restricciones declaradas, pero conviene verificar la procedencia de los datos de entrenamiento, no documentada.
- Para documentos largos se recomienda dividir en ventanas solapadas; codificar documentos completos puede diluir la señal semántica.
- No es adecuado para generación, razonamiento, código, matemáticas, tool calling ni tareas agénticas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/samuli/sukkela-33M
- Modelo hermano sukkela-16M: https://huggingface.co/samuli/sukkela-16M
- Modelo hermano sukkela-8M: https://huggingface.co/samuli/sukkela-8M
- Repositorio model2vec: https://github.com/MinishLab/model2vec
- Documentación de Sentence Transformers: https://www.sbert.net
- Dataset Belebele: https://huggingface.co/datasets/facebook/belebele
- Dataset WebFAQ retrieval: https://huggingface.co/datasets/PaDaS-Lab/webfaq-retrieval
- Dataset MIRACL: https://huggingface.co/datasets/miracl/miracl
- Dataset FSLDR: https://huggingface.co/datasets/TurkuNLP/FSLDR
- Dataset sukkela-questions: https://huggingface.co/datasets/samuli/sukkela-questions
- Dataset finna-keywords: https://huggingface.co/datasets/samuli/finna-keywords
