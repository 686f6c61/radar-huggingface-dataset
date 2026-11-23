# rli14/rsm_rise_code

## Resumen
`rli14/rsm_rise_code` es un repositorio de código (no un modelo de lenguaje) publicado en Hugging Face por el autor `rli14`. Contiene un snapshot, tomado el 22 de noviembre de 2026, del pipeline de investigación RSM (successor model) como función de valor sobre la pila RISE (referencia arXiv 2510.19495). El objetivo es reproducir los experimentos de aprendizaje por refuerzo offline en robótica (robomimic, robosuite, mimicgen) que aparecen en las tablas del artículo asociado.

El repositorio agrupa el código fuente del entrenador y scorer RSM (`gen_q_rsm/`), copias congeladas del código usado en las tablas de simulación (`frozen/`), copias de las líneas base IFQL, diffusion-forcing y TD-MPC2, lanzadores de clúster, scripts de evaluación y fuentes LaTeX de los informes. No incluye pesos de modelo; estos se distribuyen en repositorios separados (`rli14/rsm_rise_sim_checkpoints` para simulación y `rli14/rsm_cooking_v5_checkpoints` para cocina en robot real).

Por tanto, esta ficha describe un artefacto de reproducibilidad de investigación en RL offline robótico. No hay parámetros de lenguaje, contexto textual ni benchmarks de NLP; los datos disponibles se limitan al contenido del README y a los metadatos del repositorio.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de código; pipeline RSM sobre RISE para RL offline) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | no disponible (el repo contiene código y documentación; los checkpoints están en repos separados, con archivos `.pt`) |

## Arquitectura y entrenamiento
El repositorio no define una arquitectura de red única, sino un stack de investigación: RSM (successor model) usado como función de valor sobre RISE. El README referencia el artículo RISE (arXiv 2510.19495) y describe carpetas con el entrenador y scorer RSM (`rsm_libero/`), el glue del pipeline RISE (`rsm_rise/pipeline/`), un fetcher de checkpoints (`hf_ckpt.py`) y variantes congeladas, incluida una iteración de política (RSM-pi).

Los detalles de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada. El material sugiere entrenamiento sobre datasets de robótica simulada (robomimic, robosuite, mimicgen) y experimentos en robot real de cocina, pero no se especifican hiperparámetros, tamaños de dataset ni recetas de optimización.

## Capacidades
- Reproducción de experimentos de RL offline robótico sobre la pila RISE con RSM como función de valor.
- Entrenamiento y evaluación de successors models y políticas (actors y critics) para tareas de manipulación simuladas.
- Variante de iteración de política RSM-pi.
- Integración con líneas base IFQL, diffusion-forcing y TD-MPC2.
- Lanzadores de clúster, celdas de evaluación y constructores de tablas para generar los resultados del artículo.
- Documentación de plan de registro, tabla maestra, elección de checkpoints y fuentes LaTeX de los informes.
- Fetcher de checkpoints desde Hugging Face (`hf_ckpt.py`) y mapeo de cada archivo a su celda de tabla vía `manifest.tsv`.
- Exclusión de secretos (tokens de HF y W&B) y escaneo del árbol por patrones de token antes de la subida.

## Casos de uso
- Reproducción de resultados del artículo: un investigador clona el repo, fija `RSM_LIBERO_DIR` al directorio congelado `frozen/rsm_libero_freeze_20261002/` y ejecuta los lanzadores para regenerar las celdas de las tablas de simulación.
- Auditoría de pipelines de RL offline: el código congelado permite verificar exactamente qué versión produjo cada tabla, con commits documentados (`FREEZE_COMMIT 95842af1`, commit `1c1e6d3...`).
- Desarrollo de nuevas variantes: la carpeta `code_src/` contiene copias editadas de RISE, el fork de robomimic con el mixin de planner RSM y las líneas base, útil para extender el método.
- Evaluación comparativa de baselines: los scripts permiten lanzar IFQL, diffusion-forcing y TD-MPC2 en las mismas condiciones que RSM.
- Experimentos en robot real: los scripts de `rsm_rise/scripts/real` y los checkpoints de cocina (`rsm_cooking_v5_checkpoints`) sirven para replicar las rondas de cocina v5, v6 y v7.
- Docencia y formación: el material de `rsm_rise/docs/` (plan, tabla maestra, fuentes LaTeX) puede usarse como ejemplo de organización de un proyecto de RL aplicado a robótica.
- Integración en infraestructura de clúster: los launchers de `rsm_rise/scripts` documentan cómo orquestar entrenamientos y evaluaciones a escala.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible (el repositorio no contiene pesos de modelo y no se especifican tamaños).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (no se mencionan vLLM, llama.cpp, Ollama ni TGI; el stack es de entrenamiento/evaluación RL, no de inferencia de LLM).
- Latencia y throughput: no disponible.
- El tamaño del repo es de 0,5 GB, lo que sugiere que el grueso del almacenamiento está en los repos de checkpoints separados.

## Comparativa con modelos similares
| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rli14/rsm_rise_code | Repositorio de código RL offline | no disponible | no disponible | other | Hugging Face |
| rli14/rsm_rise_sim_checkpoints | Checkpoints de simulación | no disponible | no disponible | no disponible | Hugging Face |
| rli14/rsm_cooking_v5_checkpoints | Checkpoints de robot real | no disponible | no disponible | no disponible | Hugging Face |
| RISE (arXiv 2510.19495) | Stack de RL offline referenciado | no disponible | no disponible | no disponible | Paper |

No se dispone de datos suficientes para comparar rendimiento, parámetros o contexto con alternativas de la misma categoría.

## Limitaciones y advertencias
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes conversacionales.
- El repositorio contiene solo código y documentación; los pesos están en repos separados y no se describen aquí.
- La licencia es `other`, sin términos detallados en la información disponible; es necesario revisar el texto completo de la licencia antes de cualquier uso comercial.
- El código está congelado en commits concretos; cambios posteriores en dependencias (robosuite, robomimic, mimicgen, diffusion_policy) pueden romper la reproducibilidad.
- Requiere infraestructura de RL robótico (simuladores, GPUs de entrenamiento) no especificada en el README.
- El README advierte que los secretos fueron excluidos y el árbol escaneado, pero no se documenta una auditoría externa independiente.
- No se proporcionan métricas de sesgo, alucinación ni limitaciones idiomáticas porque el artefacto no es un modelo generativo de texto.

## Enlaces
- Repositorio principal: https://huggingface.co/rli14/rsm_rise_code
- Checkpoints de simulación: https://huggingface.co/rli14/rsm_rise_sim_checkpoints
- Checkpoints de cocina en robot real: https://huggingface.co/rli14/rsm_cooking_v5_checkpoints
- Código fuente upstream citado: github.com/williamd4112/gen_q (rama `rsm_rise_data`, commit `1c1e6d32273b541e41229609b76f0f1acfb0efe7`)
- Artículo RISE: arXiv 2510.19495
- Bucket de exportaciones masivas: `hf://buckets/rsm-bucket/rsm-shared/`
