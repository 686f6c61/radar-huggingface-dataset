# 3CTeam/pi05_libero_goal_quantiles_best_val_ep80_phase_15k

## Resumen

El modelo `3CTeam/pi05_libero_goal_quantiles_best_val_ep80_phase_15k` es una política robótica de tipo VLA (Vision-Language-Action) publicada por el equipo 3CTeam en Hugging Face. Se distribuye a través de la librería LeRobot y su identificador interno de arquitectura es `action_evidence_vla`. Está entrenado sobre el conjunto de datos `lerobot/libero_goal_image`, que corresponde a la suite de tareas LIBERO-Goal, un benchmark estándar de manipulación robótica orientado a objetivos. El checkpoint hace referencia a un estado concreto del entrenamiento (`best_val_ep80_phase_15k`), lo que sugiere una selección por mejor validación en el episodio 80 dentro de la fase de 15 000 pasos.

El modelo cuenta con 4 175 503 632 parámetros (aproximadamente 4,18 mil millones) y un repositorio de 9,4 GB, coherente con pesos almacenados en precisión de 16 o 32 bits. Por su nomenclatura y su encuadre dentro del ecosistema LeRobot, se trata de una adaptación o derivado de la familia π₀.₅ (Pi0.5) de Physical Intelligence, aunque la model card no confirma explícitamente esta ascendencia, por lo que debe tomarse como inferencia a partir del nombre del repositorio.

La relevancia de esta ficha radica en que documenta un modelo de robótica open source bajo licencia Apache 2.0, orientado a la ejecución de políticas de acción sobre robots tipo SO-100, lo que lo hace accesible para investigación en manipulación y aprendizaje por imitación. No obstante, la información publicada por el autor es mínima y no incluye detalles de arquitectura interna, datos de entrenamiento ni resultados de benchmarks, lo que limita cualquier evaluación rigurosa sin inspección directa del checkpoint.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA); identificador interno `action_evidence_vla` (detalles concretos no disponibles) |
| Parametros totales | 4 175 503 632 (~4,18 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; repo de 9,4 GB) |
| Idiomas soportados | no disponible (modelo de robótica, sin soporte lingüístico declarado) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo. Por el nombre del repositorio (`pi05_...`) y por su pertenencia a la colección de políticas π₀.₅ de LeRobot, es razonable suponer que se apoya en un backbone visión-lenguaje-acción con generación de acciones mediante flow matching, característico de la familia π₀.₅ de Physical Intelligence. Sin embargo, esto es una inferencia y no un dato confirmado en la model card, que se limita a declarar `model_name: action_evidence_vla` y remitir a la documentación genérica de LeRobot.

En cuanto al entrenamiento, el único dato verificable es el dataset utilizado: `lerobot/libero_goal_image`, correspondiente a la suite LIBERO-Goal con observaciones de imagen. El sufijo del checkpoint (`best_val_ep80_phase_15k`) indica que se seleccionó el mejor estado según validación tras 15 000 pasos de entrenamiento en una fase concreta, pero no se especifica el número total de tokens, la composición del corpus, ni si hubo etapas de RLHF, DPO o ajuste por refuerzo. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Política de control robótico: genera acciones motoras a partir de observaciones visuales y de un objetivo de tarea, en el marco del benchmark LIBERO-Goal.
- Aprendizaje por imitación a partir de demostraciones: entrenada sobre el dataset `lerobot/libero_goal_image`, típicamente compuesto por trayectorias teleoperadas.
- Ejecución de tareas de manipulación orientadas a objetivos (goal-conditioned manipulation) en entornos simulados o reales compatibles con LIBERO.
- Integración nativa con el ecosistema LeRobot para entrenamiento, evaluación e inferencia (`lerobot-train`, `lerobot-record`).
- Posible capacidad visión-lenguaje subyacente heredada del backbone VLA, aunque no se documenta explícitamente en la información disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo de lenguaje conversacional).
- Capacidades multilingües: no aplicables / no disponibles.
- Modo de razonamiento extendido (thinking mode): no disponible.

## Casos de uso

- Investigación en manipulación robótica con LIBERO-Goal: el modelo puede evaluarse sobre las tareas estándar de la suite para reproducir o comparar resultados frente a otras políticas, dado que fue entrenado específicamente sobre `lerobot/libero_goal_image`.
- Benchmarking de políticas VLA: sirve como referencia base para medir el efecto de cambios en cuantización, número de pasos o fases de entrenamiento, al estar etiquetado con el paso y episodio concretos del checkpoint.
- Aprendizaje por imitación en entornos simulados: permite estudiar cómo una política de 4,18 B parámetros generaliza a objetivos no vistos dentro del conjunto LIBERO-Goal.
- Prototipado sobre robots SO-100/SO-101: la model card incluye ejemplos de despliegue con `lerobot-record --robot.type=so100_follower`, por lo que es directamente utilizable en plataformas de bajo coste compatibles con LeRobot.
- Estudio de cuantización y compresión de políticas VLA: al distribuirse en safetensors y nombrarse "quantiles", es plausible su uso para analizar el impacto de esquemas de cuantización sobre el rendimiento de control, aunque esto no se detalla.
- Reproducibilidad de experimentos de robótica open source: al estar bajo Apache 2.0, puede reutilizarse en pipelines académicos de comparación de políticas sin restricciones de licencia.
- Formación de modelos derivados: es un punto de partida válido para fine-tuning posterior sobre datasets propios de manipulación, aprovechando la infraestructura de LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Aunque el modelo se entrena sobre la suite LIBERO-Goal, cuya evaluación estándar incluye tasas de éxito por tarea, la model card no reporta ninguna métrica numérica ni comparación con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 8,4 GB en bf16/fp16 y ~16,7 GB en fp32, partiendo de 4,18 B parámetros. El tamaño de repo de 9,4 GB es consistente con pesos en media precisión más posibles copias de optimizador o artefactos de entrenamiento.
- Cuantización: no se documentan esquemas oficiales de cuantización; en el nombre del repositorio aparece el término "quantiles", pero se refiere a la estrategia de selección de acciones, no necesariamente a cuantización de pesos.
- GPU recomendadas: una GPU con al menos 16 GB de VRAM (RTX 4090, L4, A10G) debería bastar para inferencia en bf16; para entrenamiento o fine-tuning se recomiendan A100 (40/80 GB) o H100.
- Compatibilidad con GPU de consumo: probablemente sí en RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia; ajustado en GPUs de 12-16 GB según el modo de ejecución.
- Opciones de despliegue: el soporte documentado es la librería LeRobot, con los comandos `lerobot-train` y `lerobot-record`. No se menciona compatibilidad con vLLM, TGI, llama.cpp u Ollama, herramientas orientadas a modelos de lenguaje y no a políticas de control.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `3CTeam/pi05_libero_goal_quantiles_best_val_ep80_phase_15k` | 4,18 B | no disponible | no disponible | apache-2.0 | Hugging Face (0 descargas) |
| `3CTeam/pi05_libero_frozen_vlm_libero10_quantiles_15k` | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Familia π₀.₅ (Physical Intelligence / LeRobot) | no disponible | no disponible | no disponible | no disponible | Colección LeRobot en Hugging Face |

No se dispone de datos de rendimiento ni de parámetros de los modelos comparados en la información proporcionada, por lo que la comparación se limita a la existencia de repositorios emparentados dentro de la misma colección. No se han encontrado benchmarks publicados que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Model card prácticamente vacía: el autor no ha rellenado la plantilla, de modo que no hay información sobre arquitectura interna, datos de entrenamiento, hiperparámetros ni evaluación.
- Sesgos: no documentados, pero al derivar de demostraciones teleoperadas en LIBERO, es probable que herede los sesgos de distribución de dichas trayectorias (objetos, posiciones e iluminación del simulador).
- Riesgo de alucinación: en el contexto de políticas de control, el equivalente es la generación de acciones fuera de distribución que pueden provocar fallos o comportamientos erráticos en el robot; no existen garantías de seguridad declaradas.
- Restricciones de contexto o idioma: no disponibles; no es un modelo de lenguaje, por lo que las consideraciones multilingües no aplican directamente.
- Licencia Apache 2.0: permite uso comercial y modificación, siempre que se conserven los avisos de copyright y la atribución correspondiente.
- Caveat de producción: se trata de un checkpoint de investigación asociado a un benchmark concreto (LIBERO-Goal); su traslado a un robot físico real fuera del dominio de entrenamiento requiere validación adicional. Además, las 0 descargas y 0 likes indican que no ha sido validado por la comunidad.
- Inexistencia de métricas publicadas: imposibilita afirmar su calidad relativa frente a otras políticas, lo que desaconseja su uso en producción sin una evaluación propia.
- Enlaces de la búsqueda web irrelevantes: la mayoría de los resultados encontrados no guardan relación con el modelo (contenido en chino sobre un videojuego), por lo que no aportan información técnica adicional.

## Enlaces

- Hugging Face: https://huggingface.co/3CTeam/pi05_libero_goal_quantiles_best_val_ep80_phase_15k
- Modelo hermano del mismo autor: https://huggingface.co/3CTeam/pi05_libero_frozen_vlm_libero10_quantiles_15k
- Colección π₀.₅ de LeRobot: https://huggingface.co/collections/lerobot/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot en GitHub: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/libero_goal_image
