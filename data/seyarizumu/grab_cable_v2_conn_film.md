# seyarizumu/grab_cable_v2_conn_film

## Resumen

`grab_cable_v2_conn_film` es una política de robótica (policy) entrenada con LeRobot y publicada en Hugging Face por el usuario seyarizumu. No es un modelo de lenguaje: es un modelo de aprendizaje por imitación orientado a control robótico, concretamente a la tarea de agarre y conexión de cables que da nombre al repositorio. El pipeline declarado es `robotics` y la librería asociada es `lerobot`, el framework de Hugging Face para entrenamiento y despliegue de políticas de robots.

El modelo tiene 63.351.060 parámetros (dato extraído de los pesos en safetensors) y un tamaño de repositorio de 0,3 GB. La model card indica `model_name: fact`, lo que sugiere que la política se entrenó con la arquitectura FACT (un transformer de imitación para manipulación), aunque la propia plantilla de la model card conserva el aviso de que el tipo de modelo no fue reconocido automáticamente.

Su relevancia es acotada pero concreta: sirve como ejemplo reproducible de un pipeline completo de LeRobot (dataset de demostraciones, entrenamiento de política y evaluación en robot real simulado o físico), publicado bajo licencia Apache 2.0. Al tener cero descargas y cero likes, se trata de un artefacto reciente y de nicho, no de un modelo de referencia de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de imitación robótica (FACT, según `model_name` en la model card); detalles internos no disponibles |
| Parametros totales | 63.351.060 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; depende de la ventana de observaciones de la política) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | seyarizumu/grab_cable_v2_conn |
| Tamano del repositorio | 0,3 GB |
| Fecha de creacion | 2026-11-06 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta `fact` en la model card y del uso de LeRobot como framework. FACT es una familia de políticas de imitación basadas en transformer para manipulación robótica, pero la model card no especifica número de capas, dimensión de embeddings, tipo de encoder visual ni esquema de atención. Tampoco se documenta si la política usa observaciones multimodales (cámara + estado de articulaciones) ni la frecuencia de control.

El entrenamiento se realizó sobre el dataset `seyarizumu/grab_cable_v2_conn`, que no está descrito en la información proporcionada (número de episodios, tareas, distribución de estados, etc.). La model card incluye el comando genérico `lerobot-train` con `--policy.type=act`, pero ese comando es la plantilla por defecto de LeRobot y no confirma que la política final sea ACT; el nombre del modelo indica FACT. No se documenta uso de RLHF, DPO ni fine-tuning posterior. No hay información sobre aumentos de datos, normalización de acciones o técnica de regularización.

## Capacidades

- Control robótico por imitación para la tarea de agarre y conexión de cables (`grab_cable_v2_conn`).
- Ejecución de políticas entrenadas con LeRobot sobre robots compatibles (la model card menciona `so100_follower` en el ejemplo de evaluación).
- Evaluación mediante `lerobot-record` con grabación de episodios y cálculo de métricas de éxito.
- Integración con el ecosistema Hugging Face Hub para carga de checkpoints vía `--policy.path`.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes ni multilingüismo.

## Casos de uso

- Automatización de una celda de manipulación de cables: la política puede desplegarse sobre un robot tipo SO-100 para ejecutar la secuencia de agarre y conexión aprendida del dataset, reduciendo el tiempo de programación manual de trayectorias.
- Reproducción de experimentos de imitación: sirve como checkpoint de referencia para comparar variantes de entrenamiento con LeRobot sobre el mismo dataset (`grab_cable_v2_conn`).
- Base para fine-tuning en tareas de cableado: al estar en formato safetensors y licencia Apache 2.0, puede reentrenarse con demostraciones adicionales del mismo dominio.
- Evaluación de pipelines de LeRobot: el comando `lerobot-record` con `--policy.path` permite medir tasas de éxito en 10 episodios y validar la infraestructura antes de escalar a robots reales.
- Docencia y prototipado en robótica: ejemplo completo y ligero (0,3 GB, 63 M de parámetros) para ilustrar el ciclo dataset → entrenamiento → evaluación en un curso o taller.
- Integración en un banco de pruebas de políticas: al ser un artefacto pequeño, puede cargarse en paralelo con otras políticas para comparar latencia y robustez en el mismo entorno simulado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error de posición, ni comparaciones con otras políticas sobre el dataset `grab_cable_v2_conn`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 63,35 M de parámetros en fp32 el peso ronda los 0,25 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más, asumiendo que el resto del pipeline (encoder visual, buffers) no exija más.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 3060/4060 o superior es suficiente para inferencia. Para reentrenamiento con LeRobot se recomienda al menos una GPU con 8-12 GB (RTX 3080/4070 o A100/H100 en entornos multi-entrenamiento).
- Cabe en GPU consumer: sí, por el tamaño del checkpoint.
- Opciones de despliegue: LeRobot (`lerobot-record`, `lerobot-train`), con soporte de `--policy.device=cuda`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| seyarizumu/grab_cable_v2_conn_film | 63,35 M | no disponible | Manipulación de cables (imitación) | Apache 2.0 | Hugging Face, 0 descargas |
| Políticas ACT de LeRobot | no disponible | no disponible | Imitación robótica genérica | Apache 2.0 (framework) | Hugging Face / repo LeRobot |
| Políticas Diffusion Policy | no disponible | no disponible | Imitación robótica genérica | según implementación | Repos académicos |
| Políticas FACT | no disponible | no disponible | Imitación robótica | según implementación | Repos académicos |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de nicho con cero descargas y cero likes: no hay validación comunitaria ni reportes independientes de robustez.
- La model card conserva el aviso de plantilla "Model type not recognized", lo que indica documentación incompleta sobre arquitectura y datos.
- El comando de entrenamiento de la model card usa `--policy.type=act`, mientras que `model_name` indica `fact`; esta discrepancia debe resolverse antes de reentrenar.
- Entrenado para una tarea muy específica (agarre y conexión de cables); no se espera generalización a otras tareas de manipulación sin fine-tuning.
- Riesgo de sobreajuste al dataset `grab_cable_v2_conn`: no se documenta tamaño ni diversidad del dataset, por lo que la generalización a nuevas posiciones de cable o iluminación es incierta.
- No hay información sobre sesgos, pero en robótica los sesgos se manifiestan como fallos sistemáticos ante distribuciones de estados no vistas.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantías y de documentación de seguridad hace recomendable una validación exhaustiva antes de desplegar en un robot físico.
- No aplica como modelo de lenguaje: no debe usarse para generación de texto, código ni tareas de NLP.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seyarizumu/grab_cable_v2_conn_film
- Dataset de entrenamiento: https://huggingface.co/datasets/seyarizumu/grab_cable_v2_conn
- Dataset relacionado (v1): https://huggingface.co/datasets/seyarizumu/grab_cable
- Dataset relacionado (v2): https://huggingface.co/datasets/seyarizumu/grab_cable_v2
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
