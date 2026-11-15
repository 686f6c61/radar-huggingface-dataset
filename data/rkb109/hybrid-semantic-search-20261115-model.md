# RKB109/hybrid-semantic-search-20261115-model

## Resumen

El modelo `RKB109/hybrid-semantic-search-20261115-model` es un prototipo pequeño y transparente orientado a búsqueda semántica y recuperación de evidencia, publicado por el usuario RKB109 bajo licencia MIT. No se trata de un transformer neuronal entrenado con descenso de gradiente, sino de un modelo léxico ligero que combina pesos por etiqueta (*per-label token weights*) con recuperación de evidencia ponderada por IDF. Su propósito declarado es servir como línea base reproducible para demostraciones de arquitectura de búsqueda empresarial cuando las APIs de embeddings resultan inaccesibles, caras o restringidas.

El modelo se distribuye con la etiqueta de pipeline `sentence-similarity` y cubre además tareas de `feature-extraction`, `text-ranking` y `question-answering`. Se acompaña de un dataset sintético propio (`RKB109/hybrid-semantic-search-20261115-dataset`) y de un repositorio GitHub con el código de entrenamiento (`train.py`), el split exacto del dataset y el código de evaluación, lo que refuerza su carácter de artefacto reproducible más que de modelo de producción.

Es relevante ahora porque ejemplifica una tendencia hacia líneas base transparentes y auditables en sistemas de recuperación, útiles en CI, comparativas locales y experimentación educativa. No obstante, sus cifras de evaluación proceden de solo cuatro ejemplos sintéticos retenidos, por lo que su validez externa es prácticamente nula y no debe confundirse con un modelo de embeddings de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo léxico con pesos por etiqueta e recuperación de evidencia ponderada por IDF (no es un transformer neuronal) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (formato JSON propietario, no requiere cuantización) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | JSON (formato de modelo propio, definido en el repositorio GitHub) |

## Arquitectura y entrenamiento

La arquitectura es un sistema de recuperación léxica que asigna pesos a tokens por etiqueta y combina esas señales con evidencia recuperada y ponderada mediante IDF. No emplea atención, capas transformer ni mecanismos de mezcla de expertos. El autor lo describe explícitamente como un baseline léxico ligero y reproducible, generado para demostraciones de arquitectura, y aclara que no invoca ningún LLM alojado.

El entrenamiento se realizó sobre un dataset sintético pequeño y propietario (`RKB109/hybrid-semantic-search-20261115-dataset`). No se especifican el número de tokens, la composición del corpus, ni si hubo fases de RLHF, DPO o ajuste fino supervisado; estos datos no están disponibles en la información proporcionada. La innovación destacable es la transparencia del pipeline: el repositorio GitHub incluye `train.py`, el split exacto del dataset, el código de evaluación y la definición del formato JSON del modelo, lo que permite reproducir el artefacto de extremo a extremo.

## Capacidades

- Recuperación semántica léxica: calcula similitud entre frases mediante pesos de tokens y evidencia IDF, sin embeddings neuronales.
- Extracción de características: puede emplearse para `feature-extraction` sobre texto, según la cobertura de tareas declarada por el autor.
- Ranking de texto: soporta `text-ranking` para ordenar candidatos por relevancia estimada.
- Question answering: cubre `question-answering` en el sentido de recuperación de evidencia para preguntas, no de generación de respuestas.
- Búsqueda híbrida: combina señales léxicas ponderadas con recuperación de evidencia, de ahí el nombre del repositorio.
- Reproducibilidad: incluye código de entrenamiento y evaluación, lo que permite auditarlo y reentrenarlo.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito; no se declaran estas capacidades en la información disponible.
- Capacidades multilingües: no disponibles; el autor no declara idiomas soportados.

## Casos de uso

- Línea base en CI de sistemas de búsqueda: el modelo puede ejecutarse como referencia en pipelines de integración continua para detectar regresiones en la calidad de recuperación antes de desplegar un sistema de embeddings real, gracias a su naturaleza determinista y reproducible.
- Comparativa local de motores de recuperación: sirve para contrastar el rendimiento de un motor léxico transparente frente a soluciones neuronales en un corpus concreto, midiendo recall@3 y MRR con el código de evaluación incluido.
- Demostración de arquitectura de búsqueda híbrida: útil en entornos educativos para explicar cómo se combinan pesos por etiqueta con IDF sin depender de infraestructura de GPU.
- Prototipado rápido en entornos restringidos: cuando las APIs de embeddings están bloqueadas o son costosas, el modelo ofrece una alternativa local en formato JSON que no requiere GPU.
- Evaluación de pipelines de ranking: puede integrarse como etapa de re-ranking léxico en un sistema existente para comparar su aportación frente a re-rankers neuronales.
- Experimentación educativa sobre recuperación de información: permite a estudiantes inspeccionar los pesos por token y entender el funcionamiento de IDF y de la ponderación por etiqueta sin cajas negras.
- Recuperación de evidencia para preguntas en dominios acotados: con un dataset representativo, podría usarse para localizar pasajes relevantes en un corpus pequeño y controlado.

## Benchmarks y rendimiento

| Métrica | Valor | Conjunto de evaluación |
|---|---|---|
| Accuracy | 1,0 | 4 ejemplos sintéticos retenidos |
| retrieval_accuracy | no reportado | no disponible |
| recall_at_3 | no reportado | no disponible |
| mean_reciprocal_rank | no reportado | no disponible |

El autor declara una accuracy de 1 sobre cuatro ejemplos sintéticos retenidos, una muestra demasiado pequeña para extraer conclusiones estadísticas. Las métricas de recuperación que el autor indica como previstas (retrieval_accuracy, recall_at_3, mean_reciprocal_rank) no se reportan con valores en la información disponible. No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo es léxico y se ejecuta en CPU sin requisitos de memoria GPU significativos.
- GPU recomendadas: no se requieren; cualquier CPU convencional es suficiente para la inferencia.
- Cabe en GPU consumer: sí, y también en entornos sin GPU, dado que no emplea operaciones tensoriales pesadas.
- Opciones de despliegue: no se declaran integraciones con vLLM, llama.cpp, Ollama o TGI; el modelo usa un formato JSON propio y una librería `custom`, por lo que el despliegue requiere el código del repositorio GitHub del autor.
- Latencia y throughput estimados: no disponibles; al ser un baseline léxico, se espera baja latencia, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RKB109/hybrid-semantic-search-20261115-model | Léxico con pesos IDF | no disponible | no disponible | MIT | Hugging Face + GitHub |
| sentence-transformers/all-MiniLM-L6-v2 | Transformer de embeddings | ~22 M | 256 tokens | Apache 2.0 | Hugging Face |
| BM25 (implementaciones tipo rank_bm25) | Léxico probabilístico | no aplica | no aplica | Apache 2.0 / MIT | PyPI |
| BAAI/bge-small-en-v1.5 | Transformer de embeddings | ~33 M | 512 tokens | MIT | Hugging Face |

La comparación con all-MiniLM-L6-v2, BM25 y bge-small-en-v1.5 es orientativa por categoría de tarea (similitud de frases y recuperación); no se dispone de resultados de benchmarks del modelo de RKB109 frente a estas alternativas, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- El dataset es sintético y muy pequeño (cuatro ejemplos retenidos), por lo que la accuracy de 1,0 no es representativa de un uso real.
- El propio autor advierte de que el baseline léxico debe sustituirse o compararse con embeddings de dominio a escala.
- No debe usarse para decisiones consecuentes sin datos representativos, revisión experta y evaluación de grado producción.
- No se declaran idiomas soportados, sesgos conocidos ni riesgos de alucinación específicos; al ser un modelo de recuperación y no de generación, el riesgo de alucinación se limita a la selección de evidencia irrelevante.
- La licencia MIT permite uso comercial, pero la ausencia de evaluación representativa hace desaconsejable su despliegue en producción sin validación adicional.
- El formato de pesos es JSON propietario y la librería es `custom`, lo que limita la interoperabilidad con ecosistemas estándar como transformers o sentence-transformers.
- No hay soporte declarado de tool calling, agentes, visión ni audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RKB109/hybrid-semantic-search-20261115-model
- Dataset: https://huggingface.co/datasets/RKB109/hybrid-semantic-search-20261115-dataset
- Repositorio GitHub con `train.py`, split del dataset y código de evaluación: no disponible en la información proporcionada (el autor lo menciona pero no se incluye la URL)
- Paper o blog del autor: no disponible
