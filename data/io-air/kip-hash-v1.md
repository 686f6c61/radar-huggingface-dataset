# IO-AIR/kip-hash-v1

## Resumen

KIP-Hash v1 es un artefacto de hashing aprendido desarrollado por IO-AIR como capa de deduplicación y verificación de calidad dentro de KIP, un pipeline de curación de datos de coste cero. No es un modelo generativo: es un componente de infraestructura de datos que combina MinHash ponderado por IDF con un prefijo de calidad destilado de un verificador neuronal, todo en una única firma de 130 bits. Su relevancia radica en que resuelve dos tareas que habitualmente requieren pilas separadas —deduplicación difusa y filtrado de calidad— con una sola pasada y sin red neuronal en tiempo de inferencia.

El artefacto se apoya en dos ideas técnicas: por un lado, los bits de localidad se generan mediante muestreo consistente ponderado (Ioffe, 2010) sobre shingles de palabras de 5 elementos, con pesos IDF calculados en una primera pasada sobre el corpus, de modo que el boilerplate repetido se infravalora antes de generar falsos emparejamientos. Por otro, los dos primeros bits de la firma codifican la clase de calidad (junk, low, mid, hi) según un verificador lineal destilado de `glm-4-plus` con anotaciones de rúbrica al estilo FineWeb-Edu.

El resultado es un artefacto ligero, implementable con la biblioteca estándar de Python, que firma 812 documentos por segundo en un solo núcleo de CPU y alcanza un AUC de 0,888 frente al profesor neuronal, mejorando el 0,809 de un verificador basado solo en heurísticas intrínsecas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Hash aprendido: MinHash ponderado por IDF (128 bits de localidad) + prefijo de calidad de 2 bits destilado de verificador lineal |
| Parámetros totales | No disponible (no es un modelo neuronal; ensemble de 3 probes lineales sobre 2^18 buckets hasheados) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (opera sobre documentos completos o excerpts de 2000 caracteres en la fase de profesor) |
| Tipos de cuantización | No aplica (artefacto de hashing, no pesos neuronales) |
| Idiomas soportados | 15 idiomas en el corpus de evaluación (en, fr, es, ru, ar, de, zh, entre otros); shingles de palabras y char k-grams para familias CJK/tailandés |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (artefacto de hashing; el repositorio es de 0,0 GB) |

## Arquitectura y entrenamiento

La firma tiene el layout `[q1 q0 | m1 .. mL]`: dos bits de calidad seguidos de 128 bits de localidad. Los bits de localidad se construyen en dos pasadas: la primera cuenta la frecuencia documental de cada shingle y calcula el peso `w = log(1 + N/df)`; la segunda retiene los L shingles con menor clave `key = -log(u)/w`, donde `u` es un uniforme determinista derivado del hash de 64 bits del propio shingle, sin uso de RNG. Los pares candidatos se verifican con el Jaccard ponderado exacto `sum_s min(w_a, w_b) / sum_s max(w_a, w_b)`, de modo que la misma ponderación que genera candidatos decide el veredicto final. Los bits de calidad nunca entran en las claves de banding, para que un original de alta calidad y su copia de baja calidad sigan siendo candidatos y se fusionen.

El verificador de calidad se entrena por destilación: un profesor `glm-4-plus` puntuó una muestra estratificada determinista de 144 documentos en 15 idiomas y 6 dominios con una rúbrica en idioma de 0 a 5 (densidad de conocimiento, autosuficiencia, formato, boilerplate) sobre excerpts de 2000 caracteres; se obtuvieron 136 etiquetas y 8 documentos quedaron excluidos por el filtro de contenido de la API. El estudiante es una regresión logística dispersa sobre features hasheadas (uni/bigramas de palabras, trigramas de caracteres y bandas de struct-probe) en 2^18 buckets, entrenada con etiquetas suaves del profesor (la confianza actúa como peso de ejemplo) y con etiquetas débiles intrínsecas a peso 0,35 para las filas sin etiqueta. Tres semillas forman el ensemble y se promedia la probabilidad en tiempo de puntuación. Los miembros destilados se marcan con `salt=0, struct=True` para que el scoring en despliegue lea exactamente el mismo espacio de features que en entrenamiento.

## Capacidades

- Deduplicación difusa de corpus con MinHash ponderado por IDF, con mayor precisión que MinHash plano al infravalorar el boilerplate antes de generar candidatos.
- Verificación exacta de pares candidatos mediante Jaccard ponderado, evitando falsos positivos por bloques de texto repetido.
- Clasificación de calidad de documentos en cuatro clases (junk, low, mid, hi) leyendo únicamente el prefijo de 2 bits de una fila almacenada, en O(1) y sin releer el texto.
- Firma de documentos a 812 docs/s en un solo núcleo de CPU usando solo la biblioteca estándar de Python.
- Soporte multilingüe con shingles de palabras y char k-grams para familias CJK y tailandés.
- Triage y filtrado en pipelines de datos sin una segunda pila de modelos neuronales.
- Integración con el ecosistema KIP como capa de hashing del pipeline de curación.

## Casos de uso

- Deduplicación de corpus web a gran escala: el pipeline firma cada documento con 128 bits de localidad y agrupa candidatos por banding, verificando después con Jaccard ponderado exacto; el down-weighting IDF evita que las barras de navegación y los footers de licencia generen fusiones falsas entre documentos no relacionados.
- Filtrado de calidad en pipelines de preentrenamiento: tras almacenar las firmas, el prefijo de 2 bits permite descartar filas junk o low sin volver a leer el texto, reduciendo el coste de una segunda pasada de clasificadores heurísticos o neuronales.
- Curación de datasets multilingües: al cubrir 15 idiomas y usar char k-grams para CJK y tailandés, el artefacto se aplica a corpus mixtos sin entrenar un modelo por familia lingüística.
- Triage de datasets ya almacenados: leer el prefijo de calidad de filas existentes permite priorizar qué documentos revisar o reetiquetar manualmente, con coste O(1) por fila.
- Construcción de pipelines de datos de coste cero: al no requerir GPU ni red neuronal en tiempo de scoring, el artefacto se despliega en entornos con solo CPU y biblioteca estándar, útil para equipos con recursos limitados.
- Auditoría de procedencia y calidad: los bits de calidad junto con las etiquetas del profesor y la rúbrica permiten reconstruir por qué un documento se clasificó en una banda concreta y comparar contra el profesor neuronal.
- Deduplicación near-duplicate en colecciones con mucho boilerplate compartido (licencias, plantillas de scraping): la ponderación IDF reduce específicamente este patrón de falsos positivos.

## Benchmarks y rendimiento

| Verificador | AUC frente al profesor |
|---|---|
| v1: solo etiquetas débiles (heurísticas intrínsecas) | 0,809 |
| v2: ensemble destilado del profesor (este artefacto) | 0,888 |

Acuerdo en el heldout de destilación (split determinista del 20 % de la mezcla etiquetada): AUC 0,971. Calibración (puntuación media del profesor por banda de clase de calidad, escala 1-5): junk 2,43 → mid 2,60 → hi 4,13, monótona en los extremos; la banda low es ruidosa por tamaño muestral (n=2).

Rendimiento de firma: 812 docs/s en un núcleo de CPU con biblioteca estándar de Python.

Corpus de evaluación: KIP `shard_v25`, 3.034 registros, 15 idiomas (en 795, fr 362, es 301, ru 293, ar 258, de 252, zh 242, ...), 6 dominios.

## Requisitos de hardware

- VRAM: no aplica; el artefacto no ejecuta una red neuronal en tiempo de scoring.
- GPU: no requerida; el scoring corre en CPU.
- CPU: un solo núcleo basta para alcanzar 812 docs/s según la model card.
- Memoria: no disponible en la información proporcionada.
- Cabe en cualquier equipo consumer: el repositorio ocupa 0,0 GB y la inferencia usa solo la biblioteca estándar de Python.
- Opciones de despliegue: la propia biblioteca `kip`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI porque no es un modelo generativo.
- Latencia y throughput: 812 documentos por segundo por núcleo de CPU en la fase de firma; no se publican cifras de latencia para la fase de verificación de pares.

## Comparativa con modelos similares

| Artefacto | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| KIP-Hash v1 | Hash aprendido (dedup + calidad) | No disponible (ensemble de 3 probes lineales) | No aplica | AUC 0,888 vs profesor; 812 docs/s por núcleo | Apache 2.0 | Hugging Face |
| MinHash plano | Hash no aprendido | No aplica | No aplica | No disponible | Algoritmo público | Implementaciones múltiples |
| FineWeb-Edu classifier | Clasificador de calidad destilado | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparativa con alternativas concretas no está disponible en la información proporcionada; la model card solo menciona MinHash plano y el patrón FineWeb-Edu como referencias conceptuales, sin publicar métricas comparativas directas.

## Limitaciones y advertencias

- El profesor se entrenó con solo 136 etiquetas efectivas sobre 144 documentos muestreados; la cobertura por idioma y dominio es limitada y puede no representar corpus muy distintos al de evaluación.
- La banda de calidad low tiene n=2 en la calibración, por lo que su comportamiento es ruidoso y no debe usarse como señal fiable en producción.
- El verificador de calidad es una regresión logística sobre features hasheadas; no captura dependencias semánticas largas que sí detectaría el profesor neuronal.
- El artefacto no es un modelo generativo: no genera texto, no razona y no soporta tool calling ni agentes.
- La deduplicación depende de la calidad de la primera pasada de frecuencias documentales; corpus muy heterogéneos o con dominios desbalanceados pueden sesgar los pesos IDF.
- Los bits de calidad no participan en el banding, de modo que un documento de alta calidad y su copia de baja calidad se fusionan; el consumidor debe decidir qué representante conservar.
- La licencia Apache 2.0 permite uso comercial, pero la procedencia de las etiquetas del profesor (`glm-4-plus`) debe revisarse según los términos de dicho servicio.
- No se han publicado resultados de benchmarks sobre tareas estándar (MMLU, HumanEval, GSM8K) porque el artefacto no las aborda.

## Enlaces

- Hugging Face: https://huggingface.co/IO-AIR/kip-hash-v1
- Organización IO-AIR en Hugging Face: https://huggingface.co/IO-AIR
- Ioffe, consistent weighted sampling (ICDM 2010): arXiv:1606.00185
- FineWeb-Edu (patrón de destilación para calidad de datos): arXiv:2406.17557
- Azaria & Mitchell, internal representations probes: arXiv:2304.13734
- Orgad et al., truthfulness representations: arXiv:2410.02707
- Referencia adicional citada en tags: arXiv:2406.11794
- Referencia adicional citada en tags: arXiv:2412.02595
