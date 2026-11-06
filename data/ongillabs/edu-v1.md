# ongilLabs/edu-v1

## Resumen

edu-v1 es un modelo de embeddings de frases en inglés desarrollado por ongilLabs, un fine-tune de BAAI/bge-base-en-v1.5 orientado a la recuperación de información en el dominio educativo. Su función concreta es emparejar descripciones cortas de intereses de estudiantes (por ejemplo, "biology but with computers") con pasajes descriptivos de programas universitarios de grado. El modelo se construyó para un producto de orientación en admisiones dirigido a estudiantes del Bachillerato Internacional (IB) y es el modelo por defecto del pipeline de recuperación edu-embedding.

Arquitectónicamente es un transformer BERT base de 12 capas y 768 dimensiones de ocultación, con aproximadamente 109,5 millones de parámetros, que produce vectores de 768 dimensiones con pooling CLS y normalización L2. La entrada máxima es de 512 tokens y el modelo está entrenado únicamente en inglés. La comparación directa de pesos indica que las capas 0 a 7 son idénticas bit a bit al modelo base, mientras que las capas 8 a 11 difieren entre un 1,1% y un 1,6% en norma de Frobenius relativa, lo que encaja con un fine-tune de las cuatro capas superiores.

Su relevancia es acotada pero específica: en la tarea de recuperación entre secciones de una misma descripción de programa alcanza un Recall@10 del 67,0%, frente al 45,1% de su modelo base y al 54,5% de all-MiniLM-L6-v2. Sin embargo, en consultas cortas escritas al estilo de un estudiante no supera a su base (91,8% frente a 94,8% de P@10), por lo que debe evaluarse con cuidado antes de adoptarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base, 12 capas, hidden size 768 |
| Parametros totales | 109.482.240 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (entrada maxima, texto en minusculas) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; no se documentan variantes GGUF u otras) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria sentence-transformers) |
| Dimension del embedding | 768, pooling CLS, normalizado L2 |
| Funcion de similitud | coseno |
| Modelo base | BAAI/bge-base-en-v1.5 |
| Tamano del repositorio | 0,4 GB |
| Pipeline | sentence-similarity |
| Compatibilidad | text-embeddings-inference, endpoints_compatible |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de tipo BERT base con 12 capas y 768 dimensiones de ocultación, del que se obtiene un vector de 768 dimensiones mediante pooling sobre el token CLS y normalización L2, comparándose después por similitud coseno. La inspección de pesos publicada en la model card muestra que la capa de embeddings y las capas 0 a 7 son idénticas bit a bit a BAAI/bge-base-en-v1.5, mientras que las capas 8 a 11 difieren entre un 1,1% y un 1,6% en norma de Frobenius relativa y el modelo completo un 0,6%. Esto es consistente con un fine-tune limitado a las cuatro capas superiores, lo que explica que el modelo permanezca muy próximo a su base.

El entrenamiento se describe como un ajuste con tripletas (consulta, pasaje positivo y pasaje negativo) con negativos organizados en tres niveles: distinto clúster, mismo clúster y programas estrechamente relacionados. La pérdida combina TripletLoss con peso 0,7, una pérdida de alineamiento hacia un modelo profesor de mayor tamaño con peso 0,2 y una pérdida de varianza contra el colapso de representaciones con peso 0,1. No se ha publicado código de entrenamiento ni registro de entrenamiento, y el autor advierte que esta descripción no está verificada. Las tripletas son privadas y se generaron a partir del corpus de programas mediante plantillas, no a partir de consultas reales de estudiantes; existen dos conjuntos candidatos que cubren el 97,7% y el 99,6% de los pasajes del corpus, sin que se registre cuál entrenó el modelo.

## Capacidades

- Generación de embeddings de frases en inglés: produce vectores de 768 dimensiones normalizados L2 para texto de hasta 512 tokens.
- Recuperación semántica (retrieval): diseñado para ranking denso de pasajes frente a consultas cortas.
- Similitud semántica entre frases: adecuado para comparar consultas con descripciones de programas.
- Búsqueda híbrida: la model card indica que funciona mejor dentro de un pipeline que combine también búsqueda por palabras clave (BM25).
- Extracción de características (feature-extraction) mediante sentence-transformers.
- Integración con Text Embeddings Inference (TEI) y endpoints compatibles.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de embeddings, no generativo.
- No dispone de capacidades multimodales (visión, audio) ni de modo de razonamiento (thinking mode).
- Capacidad multilingüe limitada al inglés; no se declara soporte de otros idiomas.

## Casos de uso

- Orientación académica para estudiantes de IB: el modelo convierte una descripción libre de intereses ("me gusta la biología pero con ordenadores") en un vector y lo compara con los embeddings de pasajes de programas de grado para devolver los más afines. Es su caso de uso principal y el que motivó su entrenamiento.
- Motor de recomendación de programas universitarios: dentro de un pipeline de recuperación, se indexan los pasajes de cada programa y se rankean por similitud coseno con la consulta del estudiante; admite combinación con BM25 para mejorar la cobertura.
- Búsqueda semántica sobre catálogos educativos: indexación de descripciones de asignaturas, grados o cursos para responder a consultas cortas en inglés con recuperación densa.
- Deduplicación y agrupación de descripciones: los embeddings permiten detectar pasajes muy similares entre programas o secciones de un mismo programa, útil para tareas de curación de catálogos.
- Clasificación y clustering exploratorio de consultas: agrupar consultas de estudiantes por temática a partir de sus vectores, siempre que no se use un umbral fijo de similitud (el autor lo desaconseja).
- Evaluación comparativa de pipelines de retrieval: al estar publicado con resultados frente a bge-base, bge-small y all-MiniLM-L6-v2, sirve como referencia en experimentos de recuperación en dominio educativo.
- Prototipado rápido en CPU o GPU modesta: con 110M de parámetros y 0,4 GB de pesos, se puede desplegar en entornos con recursos limitados para validar un pipeline antes de escalar.

## Benchmarks y rendimiento

Los resultados provienen del repositorio edu-embedding (`edu-embedding eval`), ejecutados en Apple MPS con semilla 0 y revisiones fijadas. El corpus y las particiones de tripletas son privados.

**A. Precisión en tripletas** (proporción de tripletas de validación donde cos(ancla, positivo) > cos(ancla, negativo)):

| Modelo | Split 1 | Split 2 | cos(a,p) medio | cos(a,n) medio | Margen medio |
|---|---:|---:|---:|---:|---:|
| edu-v1 | 97,2% | 98,1% | 0,350 | 0,001 | 0,349 |
| bge-base-en-v1.5 | 96,3% | 94,8% | 0,716 | 0,606 | 0,109 |
| bge-small-en-v1.5 | 94,4% | 92,7% | 0,782 | 0,695 | 0,088 |
| all-MiniLM-L6-v2 | 93,2% | 91,1% | 0,562 | 0,369 | 0,194 |

**B. Recuperación entre secciones de un mismo programa** (739 programas con exactamente cinco secciones; cada pasaje es consulta y el objetivo es el mismo programa):

| Modelo | Recall@1 | Recall@5 | Recall@10 | MRR@10 |
|---|---:|---:|---:|---:|
| edu-v1 | 18,9% | 50,1% | 67,0% | 0,323 |
| all-MiniLM-L6-v2 | 13,0% | 39,9% | 54,5% | 0,243 |
| BM25 (sin modelo) | 15,8% | 38,6% | 48,9% | 0,253 |
| bge-base-en-v1.5 | 9,3% | 30,5% | 45,1% | 0,185 |
| bge-small-en-v1.5 | 9,5% | 30,0% | 44,7% | 0,185 |

**C. Consultas al estilo de estudiante** (40 consultas cortas etiquetadas con campos aceptables; P@10 = proporción del top-10 en un campo aceptable):

| Modelo | P@10 | Intervalo bootstrap 95% |
|---|---:|---:|
| bge-base-en-v1.5 | 94,8% | 92,0 a 97,2 |
| bge-small-en-v1.5 | 94,3% | 91,7 a 96,8 |
| all-MiniLM-L6-v2 | 93,3% | 89,5 a 96,5 |
| edu-v1 | 91,8% | 87,8 a 95,2 |

Con la plantilla de consulta de producción, edu-v1 alcanza un 89,2% según la model card. Además, la similitud coseno media entre pasajes aleatorios del corpus es de 0,026 en edu-v1, frente a 0,615 en bge-base y 0,352 en all-MiniLM-L6-v2, lo que indica una distribución de embeddings mucho más dispersa.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los 109,5M de parámetros ocupan aproximadamente 0,44 GB de pesos; con overhead de activaciones y tokenizador, un despliegue típico requiere entre 1 y 2 GB de memoria.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM sirve para inferencia; para alto throughput se recomiendan A100, H100 o L4 con Text Embeddings Inference.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o incluso en CPU, dado el reducido tamaño del modelo.
- Opciones de despliegue: sentence-transformers (librería nativa), Text Embeddings Inference (TEI, etiqueta `text-embeddings-inference`), endpoints compatibles de Hugging Face. No se documentan variantes GGUF para llama.cpp ni Ollama, al ser un modelo de embeddings BERT.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Recall@10 (test B) | P@10 (test C) | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| edu-v1 | 109,5M | 512 tokens | 67,0% | 91,8% | Apache 2.0 | Hugging Face (ongilLabs/edu-v1) |
| BAAI/bge-base-en-v1.5 | ~110M | 512 tokens | 45,1% | 94,8% | MIT (según su model card) | Hugging Face (BAAI) |
| BAAI/bge-small-en-v1.5 | ~33M | 512 tokens | 44,7% | 94,3% | MIT (según su model card) | Hugging Face (BAAI) |
| sentence-transformers/all-MiniLM-L6-v2 | ~22M | 256 tokens | 54,5% | 93,3% | Apache 2.0 | Hugging Face (sentence-transformers) |

edu-v1 destaca en la tarea de recuperación entre secciones del mismo programa (67,0% de Recall@10), pero pierde frente a sus alternativas en consultas cortas al estilo de estudiante (91,8% frente a 94,8% de bge-base). Su licencia Apache 2.0 y su reducido tamaño lo hacen fácil de desplegar, aunque su ventaja está acotada al dominio y a la tarea para la que fue entrenado.

## Limitaciones y advertencias

- Sesgo de dominio: entrenado sobre un corpus privado de programas de grado de universidades del Reino Unido, Hong Kong y Singapur; su rendimiento fuera de ese dominio no está validado.
- Riesgo de sobreajuste a los datos de entrenamiento: los tests A y B usan texto del propio corpus de entrenamiento, y todos los pasajes positivos de ambas particiones de validación aparecen también en las particiones de entrenamiento, por lo que las métricas están infladas.
- Consultas generadas por plantillas: las consultas de entrenamiento no proceden de estudiantes reales, lo que puede explicar su peor rendimiento en consultas cortas reales (91,8% frente a 94,8% de su base).
- No apto para clasificación con umbral fijo: el autor indica que las puntuaciones solo son significativas para ranking, no para decisiones por umbral.
- No verifica hechos: el modelo ordena texto, no comprueba la veracidad de la información de los programas.
- Uso no recomendado para decisiones de admisión sin revisión humana.
- Solo inglés: no soporta otros idiomas, y el texto se procesa en minúsculas.
- Contexto limitado a 512 tokens: los pasajes más largos deben truncarse o dividirse.
- Entrenamiento no reproducible: no se publican código ni registro de entrenamiento, y no se registra cuál de los dos conjuntos de tripletas se usó.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del corpus privado subyacente, que no se distribuye.
- Advertencia de producción: dado el bajo número de descargas (3) y la ausencia de validación externa, conviene evaluar el modelo con datos propios antes de adoptarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ongilLabs/edu-v1
- Repositorio del pipeline edu-embedding: https://github.com/chanthr/edu-embedding
- Modelo base BAAI/bge-base-en-v1.5: https://huggingface.co/BAAI/bge-base-en-v1.5
- Organización ongilLabs en Hugging Face: https://huggingface.co/ongilLabs/models
- Spaces de ongilLabs: https://huggingface.co/ongilLabs/spaces
