# cine-labs/cine-embed-minilm-v1

## Resumen

cine-embed-minilm-v1 es un codificador de frases (sentence encoder) afinado por cine-labs para el canal de recuperación por embeddings del proyecto cine-rec-engine, un motor de recomendación de películas. Se trata de un fine-tune del modelo base sentence-transformers/all-MiniLM-L6-v2, un transformer BERT de 22,7 millones de parámetros que genera representaciones densas de 384 dimensiones. El modelo está pensado para codificar fichas de catálogo cinematográfico en un formato textual canónico y permitir búsquedas por similitud semántica entre títulos.

La relevancia de este modelo es acotada y muy específica: no es un modelo generativo ni un encoder de propósito general, sino una pieza de infraestructura para un pipeline de recomendación concreto. Su atractivo principal es su ligereza (22,7 M de parámetros, repositorio de 0,1 GB) y que puede ejecutarse en CPU, lo que abarata el despliegue del canal de recuperación por embeddings frente a encoders de mayor tamaño.

La información pública disponible es escasa: el repositorio no registra descargas ni interacciones, la model card es breve y no se han publicado resultados de benchmarks ni detalles del proceso de entrenamiento más allá del formato de entrada esperado. Esta ficha refleja, por tanto, únicamente lo que el autor documenta, marcando como no disponible todo aquello que no se ha hecho público.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (base: sentence-transformers/all-MiniLM-L6-v2) |
| Parametros totales | 22.713.216 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base MiniLM-L6 admite 256 tokens, no confirmado por el autor) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantización posterior vía herramientas estándar) |
| Idiomas soportados | inglés (según la model card) |
| Licencia | MIT para el fine-tune; el modelo base es Apache-2.0 |
| Formato de pesos | safetensors |
| Dimension de embedding | 384 |
| Libreria | sentence-transformers |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es un fine-tune de sentence-transformers/all-MiniLM-L6-v2, un encoder BERT de seis capas y 384 dimensiones de salida diseñado originalmente para similitud de frases. El fine-tune se orienta a un dominio concreto: la codificación de fichas de catálogo cinematográfico. El autor define un formato de entrada canónico con las líneas `Title: {title} ({year})` y `Overview: {overview}`, y una variante enriquecida opcional (`tmdb_cinematic`) que añade líneas de arco emocional, ritmo, narrativa, subgéneros y experiencia. Este diseño de plantilla es la innovación técnica destacable: alinear el texto de entrada con la estructura del catálogo mejora la coherencia del espacio de embeddings para la tarea de recuperación.

No se han publicado datos sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de pares positivos/negativos, ni si se aplicaron técnicas como contrastive learning, Multiple Negatives Ranking Loss o DPO. Tampoco se documenta ninguna innovación arquitectónica más allá del fine-tune sobre el encoder base. El repositorio indica que el motor cine-rec-engine descarga este modelo fijado por versión y verificado con sha256, lo que sugiere un uso previsto como artefacto reproducible dentro de un pipeline mayor.

## Capacidades

- Generación de embeddings de frases de 384 dimensiones para similitud semántica y recuperación de información.
- Codificación de fichas de catálogo cinematográfico en formato canónico (título, año, sinopsis) y en formato enriquecido con metadatos narrativos.
- Búsqueda por similitud entre títulos y consultas en lenguaje natural, orientada al canal de recall de un recomendador.
- Extracción de características (feature-extraction) como tarea principal del pipeline declarado.
- Ejecución en CPU con coste reducido, apta para servir catálogos completos sin GPU.
- Integración con Text Embeddings Inference (tag `text-embeddings-inference`) y endpoints compatibles.
- Sin soporte documentado de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento: es un encoder, no un modelo generativo.

## Casos de uso

- Recuperación por embeddings en un recomendador de películas: el modelo codifica el catálogo con la plantilla `Title`/`Overview` y permite recuperar títulos semánticamente cercanos a la consulta o al historial del usuario; es el caso de uso para el que fue entrenado y el único documentado por el autor.
- Búsqueda semántica en catálogos editoriales: con 384 dimensiones y pesos de 0,1 GB, se puede indexar un catálogo completo en una base vectorial y servir consultas en CPU, lo que reduce el coste de infraestructura frente a encoders de 768 o 1024 dimensiones.
- Deduplicación y agrupación de fichas: la similitud coseno entre embeddings permite detectar títulos duplicados o sinónimos en bases de datos de contenido audiovisual.
- Enriquecimiento de metadatos: la plantilla extendida con arco emocional, ritmo y subgéneros permite construir un espacio latente que capture atributos narrativos, útil para etiquetado automático y filtrado por tono.
- Prototipado rápido en entornos sin GPU: al ejecutarse en CPU, sirve para validar pipelines de recuperación antes de escalar a encoders mayores.
- Integración en servicios de inferencia de embeddings: el tag `text-embeddings-inference` y la compatibilidad con endpoints permiten desplegarlo como servicio HTTP de embeddings dentro de una arquitectura de microservicios.
- Filtrado previo en sistemas de búsqueda híbrida: como primera etapa de recall barata antes de un reranker más pesado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (22,7 M de parámetros); en la práctica cabe en cualquier GPU consumer y en CPU.
- GPU recomendadas: no requiere GPU; cualquier GPU con al menos 2 GB de memoria es suficiente (GTX 1650, RTX 3060, RTX 4090, A100, H100).
- Cabe en GPU consumer: sí, en todas las GPU consumer modernas, y también en CPU.
- Opciones de despliegue: sentence-transformers (Python), Text Embeddings Inference (TEI), endpoints compatibles con el formato de Hugging Face; integración nativa con cine-rec-engine mediante `pip install "cine-rec-engine[encoders]"`.
- Latencia y throughput: no disponibles; el autor solo indica que es "CPU-friendly" y la vía más barata de ejecutar un encoder afinado, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| cine-embed-minilm-v1 | 22,7 M | 384 | no disponible | MIT (fine-tune) / Apache-2.0 (base) | Afinado para fichas de catálogo cinematográfico; sin benchmarks publicados |
| sentence-transformers/all-MiniLM-L6-v2 | 22,7 M | 384 | 256 tokens (modelo base) | Apache-2.0 | Modelo base; propósito general, sin afinado de dominio |
| sentence-transformers/all-mpnet-base-v2 | 109 M | 768 | 384 tokens | Apache-2.0 | Mayor calidad general a costa de más cómputo; no afinado para cine |
| BAAI/bge-small-en-v1.5 | 33 M | 384 | 512 tokens | MIT | Encoder de recuperación de propósito general con buen rendimiento en MTEB; alternativa si se necesita contexto mayor |

La comparación con alternativas de propósito general es orientativa: no hay datos de rendimiento publicados para cine-embed-minilm-v1 que permitan establecer una superioridad cuantitativa frente a estos modelos en la tarea de recomendación cinematográfica.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al derivar de all-MiniLM-L6-v2, hereda los sesgos del corpus de entrenamiento del modelo base, no auditados en esta ficha.
- Riesgo de alucinación: no aplica en el sentido generativo, pero los embeddings pueden producir similitudes espurias en dominios alejados del cinematográfico.
- Limitaciones de idioma: la model card declara únicamente inglés; el rendimiento en castellano u otros idiomas no está garantizado ni evaluado.
- Limitaciones de contexto: no se especifica la longitud máxima de secuencia; el modelo base MiniLM-L6 admite 256 tokens, por lo que sinopsis largas pueden truncarse.
- Restricciones de licencia: el fine-tune es MIT, pero los pesos derivan de un modelo Apache-2.0; deben conservarse los avisos y términos del modelo base en cualquier redistribución.
- Caveat de producción: el repositorio no registra descargas ni validación externa; no hay benchmarks, evaluación de calidad ni documentación del proceso de entrenamiento, por lo que su uso en producción debería ir precedido de una evaluación propia sobre el catálogo objetivo.
- El modelo está acoplado a un formato de entrada concreto; usarlo fuera de esa plantilla puede degradar la calidad de los embeddings.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/cine-labs/cine-embed-minilm-v1
- Proyecto cine-rec-engine: https://github.com/DovBerKaplan/cine-rec-engine
- Documentación de modelos de cine-rec-engine: https://github.com/DovBerKaplan/cine-rec-engine/blob/main/models/README.md
- Perfil del autor: https://github.com/DovBerKaplan
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
