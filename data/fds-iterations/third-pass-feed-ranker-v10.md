# FDS-Iterations/third-pass-feed-ranker-v10

## Resumen

El modelo `FDS-Iterations/third-pass-feed-ranker-v10` es un cross-encoder ligero desarrollado por FDS-Iterations para puntuar la relevancia de publicaciones en feeds sociales empresariales. Dado el título de trabajo de un usuario (por ejemplo, "Data Scientist") y el texto de una publicación, el modelo devuelve una puntuación única que indica cuán profesionalmente interesante o útil es esa publicación para ese rol concreto. Está diseñado como un reranker de tercera pasada: reordena un pequeño conjunto de candidatos (aproximadamente 20 elementos) que ya han pasado por filtros anteriores, con el objetivo de sacar a la superficie publicaciones relevantes que quedaron enterradas bajo la primera posición.

La versión v10 es una vista previa publicada junto a la versión estable, e incorpora dos mejoras principales: el reemplazo de incumbentes débiles (cuando el primer puesto es de bajo valor y existe una alternativa relevante) y una mayor cobertura de contenido de aprendizaje y discurso de orden superior (charlas grabadas, papers, playbooks, análisis de incidentes, decisiones estratégicas). El modelo se basa en `microsoft/MiniLM-L12-H384-uncased`, con aproximadamente 33 millones de parámetros, lo que lo hace extremadamente barato de ejecutar incluso en CPU a escala de servidor. Está entrenado íntegramente con datos sintéticos generados por LLM, por lo que el autor recomienda validarlo con datos propios antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en MiniLM-L12-H384-uncased (BERT de 12 capas, hidden size 384) |
| Parametros totales | 33.360.385 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 160 tokens (truncamiento en el codigo de ejemplo; no se especifica un maximo oficial) |
| Tipos de cuantizacion | no disponible (safetensors; no se documentan cuantizaciones alternativas) |
| Idiomas soportados | ingles (uncased) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un cross-encoder de clasificación de secuencias basado en `microsoft/MiniLM-L12-H384-uncased`. Toma como entrada el título de trabajo (query) y el texto de la publicación (pasaje), los concatena y produce una puntuación de relevancia mediante una cabeza de clasificación de una sola salida. La arquitectura subyacente es un transformer BERT de 12 capas con 384 unidades ocultas, optimizado para eficiencia en CPU.

El entrenamiento utiliza un objetivo de ranking listwise, aunque la inferencia se realiza de forma pointwise (cada par se puntúa de manera independiente). Los datos de entrenamiento son completamente sintéticos, generados por LLM, y cubren una taxonomía ocupacional amplia con variantes de seniority y alias (por ejemplo, "Staff", "Lead", "Principal"). El modelo aprende a distinguir entre contenido profesionalmente relevante (investigación, métodos, lecciones, preguntas reflexivas, desarrollos del sector, recursos, charlas, papers, playbooks, decisiones de lanzamiento, post-mortems, tradeoffs estratégicos) y contenido que debe penalizar (incidentes operativos fuera del rol, contenido de interés fuera del campo, keyword-bait y jerga técnica densa que no encaja con el rol).

La versión v10 introduce dos innovaciones sobre la versión estable: el reemplazo de incumbentes malos (distingue entre reemplazar un post débil en el primer puesto, abstenerse cuando no hay nada promocionable, o proteger un primer puesto fuerte) y una superficie expandida de relevancia de aprendizaje y discurso de orden superior.

## Capacidades

- Puntuación de relevancia de publicaciones de feed empresarial según el título de trabajo del espectador.
- Reranking de listas cortas de candidatos (slates de aproximadamente 20 elementos).
- Distinción entre tres situaciones de promoción: reemplazar un incumbente débil, abstenerse cuando no hay nada relevante, o proteger un incumbente fuerte.
- Cobertura de una taxonomía ocupacional amplia con variantes de seniority y alias.
- Robustez a la capitalización inconsistente gracias al modelo base uncased.
- Inferencia eficiente en CPU (33M parámetros).
- Capacidad de abstener la promoción cuando el slate no contiene contenido promocionable (comportamiento controlado por el umbral τ definido por el usuario).

## Casos de uso

- **Feeds sociales empresariales personalizados**: el modelo puede reordenar las publicaciones de un feed interno de una empresa para que cada empleado vea primero el contenido más relevante para su profesión, en lugar de un orden cronológico o por popularidad.
- **Sistemas de recomendación de contenido profesional**: plataformas como LinkedIn o comunidades técnicas pueden usar este reranker para priorizar artículos, papers o discusiones que sean de interés para el rol del usuario.
- **Filtrado de ruido en canales de Slack o Teams**: integrado como un bot que puntúa los mensajes de canales temáticos y resalta los que merecen atención según el perfil del miembro.
- **Moderación de contenido en comunidades profesionales**: para detectar y descartar publicaciones que son keyword-bait o jerga técnica irrelevante para el público objetivo.
- **Personalización de newsletters internas**: seleccionar los artículos o anuncios más relevantes para cada departamento o rol dentro de una organización.
- **Evaluación de calidad de contenido generado por usuarios**: puntuar automáticamente si una publicación aporta valor profesional a un rol específico, útil para sistemas de reputación o gamificación.

## Benchmarks y rendimiento

El autor proporciona métricas de evaluación propias, medidas sobre títulos externos y slates adversariales. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, etc.) porque el modelo no es un LLM generalista sino un clasificador especializado.

| Metrica | Valor |
|---|---|
| Publicacion relevante en la posicion #1 (feeds externos de validacion) | ~0.73 |
| Reemplazo de incumbente de bajo valor con post adyacente (tasa de activacion en slates que deberian reemplazarse) | ~0.83 |
| Abstencion / proteccion (tasa de activacion en slates sin promocionables y con incumbente fuerte; menor es mejor) | ~0.23–0.47 |
| Interes profesional del rol principal supera incidente operativo fuera del rol | ~1.0 |
| Seleccion del post del rol primario entre competidores fuertes (adversarial) | ~0.57 |
| Falsa promocion en feeds sin relevancia | ~0.1% |

## Requisitos de hardware

- **VRAM estimada**: inferior a 1 GB en FP32 (33M parámetros). En FP16, aproximadamente 130 MB.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM es suficiente; incluso una GTX 1050 Ti o similar puede ejecutarlo sin problemas.
- **CPU**: el modelo está diseñado para ejecutarse en CPU de clase servidor a escala; en una CPU moderna de 8 núcleos puede procesar cientos de pares por segundo.
- **Opciones de despliegue**: compatible con `transformers` (PyTorch), `text-embeddings-inference` (según los tags), y puede exportarse a ONNX o TensorRT para optimización.
- **Latencia y throughput**: no se proporcionan cifras oficiales, pero por el tamaño del modelo se espera una latencia de pocos milisegundos por par en CPU y de sub-milisegundos en GPU.

## Comparativa con modelos similares

No se dispone de una comparativa directa publicada por el autor. Como alternativas de cross-encoders para reranking se pueden considerar:

| Modelo | Parametros | Contexto | Licencia | Uso tipico |
|---|---|---|---|---|
| FDS-Iterations/third-pass-feed-ranker-v10 | 33M | 160 tokens (truncamiento) | Apache 2.0 | Reranking de feeds empresariales por relevancia profesional |
| cross-encoder/ms-marco-MiniLM-L-6-v2 | 22M | 512 tokens | Apache 2.0 | Reranking de pasajes para busqueda (MS MARCO) |
| BAAI/bge-reranker-base | 278M | 512 tokens | MIT | Reranking generalista multilingue |

La diferencia clave es que el modelo de FDS-Iterations está especializado en relevancia profesional por título de trabajo, mientras que los otros son rerankers genéricos de búsqueda.

## Limitaciones y advertencias

- **Solo ingles**: el modelo no soporta otros idiomas; el texto debe estar en inglés.
- **Entrenado con datos sinteticos**: todos los datos de entrenamiento fueron generados por LLM, lo que puede introducir sesgos o patrones artificiales. El autor recomienda validar con datos propios antes de producción.
- **Filtrado de entrada requerido**: se espera que los posts muy cortos (menos de ~20 tokens o ~80 caracteres) se filtren antes de la puntuación; el modelo no fue entrenado para manejarlos.
- **Umbral τ sensible a la distribucion**: el umbral de promoción (τ) debe recalibrarse según el estilo de redacción de los feeds; valores típicos entre 0.3 y 0.5, pero depende del corpus.
- **Discriminacion fina de roles**: el modelo puede tener dificultades para distinguir entre roles muy similares (por ejemplo, "Data Scientist" vs. "Data Analyst") si los posts son ambiguos.
- **Sin garantias de produccion**: al ser una versión preview (v10), no sustituye a la versión estable y debe evaluarse exhaustivamente antes de un despliegue crítico.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/FDS-Iterations/third-pass-feed-ranker-v10)
- [Modelo base: microsoft/MiniLM-L12-H384-uncased](https://huggingface.co/microsoft/MiniLM-L12-H384-uncased)
- [Version estable del mismo autor: FDS-Iterations/third-pass-feed-ranker](https://huggingface.co/FDS-Iterations/third-pass-feed-ranker)
