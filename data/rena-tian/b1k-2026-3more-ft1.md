# Rena-Tian/b1k-2026-3more-ft1

## Resumen

`Rena-Tian/b1k-2026-3more-ft1` es un checkpoint de política robótica para el desafío BEHAVIOR-1K 2026, publicado por el usuario Rena-Tian. Se trata de un fine-tuning (`ft1`) del checkpoint ganador de la edición 2025 del BEHAVIOR Challenge, una política basada en pi0.5 de aproximadamente 3.000 millones de parámetros que incorpora embeddings de identificador de tarea en lugar de instrucciones en lenguaje natural. El objetivo declarado es cubrir conjuntamente las tareas 56, 78 y 99 del reto (make_rose_centerpieces, make_cabinet_doors y sorting_books_on_shelf).

El modelo parte del checkpoint generalista de 50 tareas de IliaLarchenko (`IliaLarchenko/behavior_50t_checkpoint`) y se especializa mediante 20.000 pasos de entrenamiento sobre demostraciones de 2026, usando únicamente cámaras RGB, en una sola GPU A100 de 80 GB, con una pérdida final de entrenamiento de aproximadamente 0,21. El resultado es un controlador que transforma observaciones visuales en acciones de manipulación para un conjunto reducido y cerrado de tareas de simulación.

Es relevante ahora porque forma parte de las submissions del BEHAVIOR Challenge 2026 y porque el propio autor documenta de forma explícita su alcance y sus resultados parciales. El checkpoint se distribuye en formato de solo parámetros (sin estado del optimizador), por lo que su uso previsto es servir inferencia o servir de inicialización para nuevos ajustes, no reanudar entrenamientos. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política vision-language-action (VLA) basada en pi0.5, con embeddings de task-ID y sin prompt de lenguaje |
| Parametros totales | ~3.000 millones (aproximadamente 3B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se distribuye en float sin indicar variantes cuantizadas) |
| Idiomas soportados | No disponible (el modelo usa embeddings de tarea, no instrucciones en lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | Orbax/ocdbt (checkpoint JAX/Flax de solo parámetros) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la política ganadora del BEHAVIOR Challenge 2025, basada en pi0.5 y desarrollada en el repositorio `IliaLarchenko/behavior-1k-solution`. Se trata de un modelo tipo vision-language-action con alrededor de 3.000 millones de parámetros que condiciona la acción sobre la observación visual y un embedding de identificador de tarea, en lugar de sobre un prompt textual. Dispone de 100 ranuras de tarea (task slots), lo que permite mantener la estructura generalista y especializar el comportamiento por tarea.

El entrenamiento arranca desde el checkpoint generalista de 50 tareas `IliaLarchenko/behavior_50t_checkpoint` y se ajusta con la configuración `pi_behavior_b1k_2026_3more`, definida en `behavior-1k-solution/src/b1k/training/config.py`. La receta emplea demostraciones del reto 2026 para las tareas 56, 78 y 99 combinadas, con cámaras RGB como única modalidad sensorial, durante 20.000 pasos en una A100 de 80 GB, alcanzando una pérdida final de entrenamiento de aproximadamente 0,21. El checkpoint final es el paso 19.999; el autor indica que el paso 8.000 obtuvo puntuación cero en la evaluación de la tarea 56, por lo que se conservó el paso final. No se documenta el uso de RLHF, DPO ni técnicas de preferencia; tampoco se detalla la composición exacta del dataset más allá de su origen (demostraciones de 2026).

## Capacidades

- Generación de acciones de manipulación robótica a partir de observaciones de cámara RGB.
- Condicionamiento por identificador de tarea mediante embeddings (sin necesidad de instrucciones en lenguaje natural).
- Ejecución de la tarea 56, make_rose_centerpieces, con una puntuación de leaderboard de q = 0,35.
- Ejecución de la tarea 78, make_cabinet_doors, con una puntuación de leaderboard de q = 0 (ausencia de finalizaciones completas).
- Ejecución parcial de la tarea 99, sorting_books_on_shelf, aunque el autor recomienda un checkpoint dedicado para esta tarea.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso explícito, capacidades multilingües ni modalidades de audio o visión más allá de RGB.

## Casos de uso

- Reproducción de resultados del BEHAVIOR Challenge 2026: el checkpoint permite replicar la evaluación local de las tareas 56 y 78 sobre las instancias públicas 301-310 con el mismo protocolo descrito por el autor.
- Investigación en políticas VLA de manipulación: sirve como referencia de un fine-tuning especializado de pi0.5 sobre demostraciones RGB, útil para estudiar transferencia desde un modelo generalista de 50 tareas.
- Punto de partida para nuevos ajustes: al ser un checkpoint de solo parámetros, puede inicializar entrenamientos sobre tareas relacionadas añadiendo episodios adicionales, sin reanudar el run original.
- Evaluación comparativa de checkpoints de tarea: el autor usa este modelo para comparar el rendimiento conjunto (tareas 56 y 78) frente al checkpoint dedicado de la tarea 99, lo que permite analizar el coste de la especialización conjunta frente a la individual.
- Automatización de subtareas domésticas concretas en simulación: la tarea 56 (montaje de centros de rosas) y la 78 (montaje de puertas de armario) pueden ejecutarse en el entorno de simulación BEHAVIOR-1K como componentes de un pipeline mayor.
- Análisis de fallos en manipulación de precisión: dado que la tarea 78 obtiene q = 0 y la 56 presenta puntuaciones heterogéneas (desde 0 hasta 0,75), el modelo es adecuado para estudiar modos de fallo en tareas con predicados de meta tipo `attached`.
- Prototipado de control por identificador de tarea: resulta útil para desarrolladores que quieran validar la interfaz de servido mediante `scripts/serve_b1k.py` sin depender de un prompt de lenguaje.

## Benchmarks y rendimiento

La evaluación se realizó al estilo del leaderboard 2026: instancias públicas 0-9 (identificadores 301-310), una ejecución por instancia, timeouts por defecto multiplicados por 1,5, y puntuación de tarea = suma / 10, donde q es la fracción de predicados de meta recién satisfechos.

Tarea 56 (4 predicados de meta). Puntuación de leaderboard: q = 0,35 (suma 3,5 sobre 301-310; sin finalizaciones completas).

| instancia | 301 | 302 | 303 | 304 | 305 | 306 | 307 | 308 | 309 | 310 |
|---|---|---|---|---|---|---|---|---|---|---|
| q | 0,5 | 0 | 0 | 0,25 | 0,25 | 0,25 | 0,5 | 0,5 | 0,75 | 0,5 |

Tarea 78 (único predicado `attached`, todo o nada). Puntuación de leaderboard: q = 0 (suma 0 sobre 301-310; sin finalizaciones completas).

| instancia | 301 | 302 | 303 | 304 | 305 | 306 | 307 | 308 | 309 | 310 |
|---|---|---|---|---|---|---|---|---|---|---|
| q | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

Para la tarea 99, el autor indica que el checkpoint dedicado `Rena-Tian/b1k-2026-task99-ft1` obtiene 0,0364 frente a 0,0182 de este checkpoint. No se han publicado resultados de otros benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo cual es coherente con la naturaleza robótica del modelo.

## Requisitos de hardware

- Tamano del repositorio: 12,6 GB, correspondiente principalmente a los parámetros en formato orbax/ocdbt.
- Parametros: aproximadamente 3B. Una estimación orientativa de memoria para pesos sería de unos 6 GB en bf16 y unos 12 GB en fp32, sin contar activaciones ni buffers de inferencia.
- Entrenamiento original: 1x A100 80GB durante 20.000 pasos. No se documentan requisitos de memoria pico ni throughput.
- GPU recomendadas: A100 80GB para entrenamiento; para inferencia es razonable esperar que quepa en GPUs de 16-24 GB (por ejemplo RTX 4090, L4 o A10), aunque el autor no lo confirma explícitamente.
- Viabilidad en GPU de consumo: probable en tarjetas con al menos 16 GB de VRAM según el tamaño de pesos estimado, si bien no está verificado en la información disponible.
- Opciones de despliegue: servidor propio del repositorio mediante `scripts/serve_b1k.py --task-id 56 policy:checkpoint --policy.config pi_behavior_b1k_2026_3more --policy.dir <directorio>`, con JAX/Flax como stack subyacente. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento documentado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rena-Tian/b1k-2026-3more-ft1 | ~3B | No disponible | Tarea 56: q = 0,35; tarea 78: q = 0; tarea 99: 0,0182 | Apache 2.0 | HuggingFace (0 descargas, 0 likes) |
| Rena-Tian/b1k-2026-task99-ft1 | No disponible | No disponible | Tarea 99: 0,0364 | No disponible en la información | HuggingFace, referenciado por el autor |
| IliaLarchenko/behavior_50t_checkpoint | ~3B (base del anterior) | No disponible | No disponible | No disponible en la información | HuggingFace |
| pi0.5 (política base) | ~3B | No disponible | No disponible | No disponible en la información | No disponible en la información |

La comparación se limita a la familia de checkpoints derivados del ganador del BEHAVIOR Challenge 2025. No se dispone de datos de rendimiento de `behavior_50t_checkpoint` ni de la política pi0.5 original en la información proporcionada.

## Limitaciones y advertencias

- Cobertura de tareas muy restringida: el modelo está ajustado para las tareas 56, 78 y 99, y el autor recomienda usar un checkpoint dedicado para la tarea 99.
- Rendimiento nulo en la tarea 78: q = 0 en las diez instancias evaluadas, sin ninguna finalización completa, lo que indica que no es fiable para ese objetivo en producción.
- Rendimiento parcial en la tarea 56: q = 0,35 con instancias que puntúan 0, lo que refleja una alta varianza y ausencia de completados totales.
- Checkpoint de solo parámetros: no incluye estado del optimizador, por lo que no se puede reanudar con `--resume`; solo sirve para inferencia o como inicialización.
- Sin prompt de lenguaje: el control se realiza mediante identificadores de tarea, lo que limita su uso en interfaces conversacionales o instrucciones abiertas.
- Modalidad sensorial limitada a RGB: no se documenta uso de profundidad, fuerza o propriocepción, lo que puede restringir la generalización a entornos reales.
- Riesgo de alucinación y de fallos silenciosos: como política de control, puede generar acciones plausibles que no satisfagan los predicados de meta, tal como muestran las puntuaciones por instancia.
- Sesgos conocidos: no documentados explícitamente; al entrenarse sobre demostraciones del reto 2026, hereda las distribuciones y sesgos de ese conjunto de simulaciones.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero la ausencia de validación en entornos reales desaconseja su despliegue en producción sin evaluación adicional.
- Madurez del artefacto: 0 descargas y 0 likes en el momento de la consulta, con fechas de creación y actualización del 9 de octubre de 2026, lo que sugiere un uso limitado a la submission del reto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Rena-Tian/b1k-2026-3more-ft1
- Checkpoint para la tarea 99: https://huggingface.co/Rena-Tian/b1k-2026-task99-ft1
- Checkpoint generalista de 50 tareas: https://huggingface.co/IliaLarchenko/behavior_50t_checkpoint
- Repositorio de la solución ganadora: https://github.com/IliaLarchenko/behavior-1k-solution
- Configuración de entrenamiento citada: `behavior-1k-solution/src/b1k/training/config.py` (dentro del repositorio anterior)
- Script de servido citado: `scripts/serve_b1k.py` (dentro del repositorio anterior)
