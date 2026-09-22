# mlnha/pose6daug-scripts

## Resumen

pose6daug-scripts no es un modelo de IA, sino un repositorio de scripts publicado en HuggingFace por el usuario mlnha. Contiene el código que hay detrás de los baselines de aumento de datos con MimicGen y VACE para la tarea RoboCasa PickPlaceCounterToCabinet, junto con el pipeline de ajuste fino de GR00T 1.5 y la evaluación por réplica exacta de estado ejecutada sobre ellos. El repositorio está archivado tal y como se ejecutó: las rutas son absolutas y apuntan a una máquina concreta, por lo que debe tratarse como un registro del procedimiento y no como un paquete listo para usar.

La relevancia del artefacto es doble. Por un lado, documenta cómo generar episodios sintéticos de manipulación con MimicGen (estados y acciones de MuJoCo, sin píxeles) y cómo aumentar datos a nivel de píxel con VACE, que repinta la imagen y conserva la trayectoria de origen sin pasar por el simulador. Por otro, describe un fallo silencioso muy instructivo: un dataset cuyo orden de acciones está invertido respecto al esperado por el simulador converge a una pérdida baja y produce una política que no cierra la pinza.

El repositorio no publica pesos, ni parámetros, ni ficha de modelo, ni licencia. Los datos disponibles son exclusivamente la model card y la estructura de directorios: `augment/mimicgen/`, `augment/vace/`, `dataset/`, `train/`, `eval/` y `tools/`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no es un modelo; entrena sobre GR00T 1.5, del que no se detalla arquitectura interna) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que GR00T 1.5 sea MoE en la información proporcionada) |
| Longitud de contexto | no aplica / no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la tarjeta no declara idiomas; el condicionamiento por lenguaje corresponde a tareas de RoboCasa) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene scripts Python y shell; no incluye pesos) |
| Tipo de artefacto | repositorio de scripts de aumento, construcción de dataset, entrenamiento y evaluación |
| Autor | mlnha |
| Descargas | 0 |
| Likes | 1 |
| Fecha de creación | 2026-09-22 |
| Última actualización | 2026-09-22 |
| Entorno de simulación | MuJoCo / RoboCasa, tarea PickPlaceCounterToCabinet |
| Modelo entrenado | GR00T 1.5 (ajuste fino de cabeza de acción) |
| Formato de dataset de salida | gr00t_views, LeRobot v2.1 (parquet + vídeos + meta) |

## Arquitectura y entrenamiento

El pipeline parte de la generación con MimicGen, que produce `demo.hdf5` con estados y acciones de MuJoCo pero sin píxeles. A partir de ahí se bifurca: por un lado se renderizan vídeos de previsualización con tres vistas; por otro, `dataset/render_to_gr00t.py` reproduce cada episodio en MuJoCo, renderiza tres cámaras y escribe parquet, vídeos y metadatos en formato gr00t_views. El aumento con VACE omite el simulador: repinta los píxeles y conserva la trayectoria de origen, de modo que su constructor copia el parquet fuente en lugar de reproducir la escena. La generación con MimicGen se lanza con un proceso por worker desde un JSON de configuración por par (objeto, worker); dos parámetros son críticos: `guarantee=false` hace que `num_trials` signifique intentos y no éxitos, y `obj_registries` debe incluir `aigen` para objetos bajo `aigen_objs/`, o `sample_kitchen_object_helper` lanza un `ValueError`.

El ajuste fino con `train/train_groot15_single_dataset.sh` entrena la proyección de la cabeza de acción y la cabeza de difusión partiendo de un checkpoint base, manteniendo el backbone congelado. Los parámetros documentados son `GPUS`, `PER_GPU_BATCH`, `MAX_STEPS` y `SAVE_STEPS`; `RESUME=1` retoma el checkpoint más reciente del directorio de salida. En el lado de datos, `repair_mimicgen_task_ids.py` no es opcional: el escritor guarda todas las columnas de tarea del parquet como 0 mientras `episodes.jsonl` contiene el lenguaje previsto, de modo que sin esa reparación todos los episodios se entrenan como tarea 0 y el condicionamiento por lenguaje colapsa de forma silenciosa.

## Capacidades

- Generación de episodios de manipulación sintéticos con MimicGen, con control del presupuesto de intentos por objeto y worker.
- Aumento de datos a nivel de píxel con VACE mediante intercambio de objetos, conservando la trayectoria fuente.
- Conversión de episodios generados a dataset gr00t_views en formato LeRobot v2.1, con parquet, vídeos y metadatos.
- Reproducción en MuJoCo con renderizado de tres cámaras para materializar píxeles desde estados y acciones.
- Fragmentado y fusión de datasets (`run_convert.sh`, `merge_gr00t_view_datasets.py`) y reparación de identificadores de tarea.
- Ajuste fino de GR00T 1.5 limitado a la proyección de la cabeza de acción y la cabeza de difusión, con backbone congelado.
- Evaluación por réplica exacta de estado: cada episodio restaura un XML de escena y un estado de MuJoCo aplanado, lo que hace comparables las ejecuciones entre checkpoints.
- Control de semillas dual: `POLICY_SEED` afecta al RNG global del servidor de política y a la semilla por paso (`policy_seed + episode_index × stride + step`), mientras que `SEED_BASE` fija la semilla del entorno por worker.
- Etiquetado por etapas de la evaluación (`grasped`, `lifted`, `in_cab`) además del booleano de éxito de RoboCasa.
- Comprobación del orden de acciones en un dataset mediante `tools/check_action_layout.py`, que distingue ambos layouts a partir de los propios datos.
- Organización de vídeos por episodio global en `rollouts/episode_NNNNNN/{center.mp4, wrist.mp4, info.txt}`.

## Casos de uso

- Replicación del pipeline de aumento completo: un equipo que trabaje en RoboCasa PickPlaceCounterToCabinet puede seguir la secuencia MimicGen, conversión a gr00t_views, ajuste fino y evaluación por réplica exacta para reproducir los baselines descritos.
- Generación de demostraciones sintéticas para manipulación: el script de generación con MimicGen permite presupuestar el mismo número de intentos a cada objeto, lo que produce el rendimiento natural del generador en lugar de una cuota fija por objeto.
- Aumento de datos sin simulador: el flujo de VACE resulta adecuado cuando el coste de reproducir escenas en MuJoCo es prohibitivo, ya que repinta píxeles y reutiliza la trayectoria fuente copiando el parquet original.
- Construcción de datasets compatibles con LeRobot v2.1: `render_to_gr00t.py`, `run_convert.sh` y `merge_gr00t_view_datasets.py` sirven para transformar episodios de simulador en datasets con metadatos y vídeos multi-cámara listos para entrenamiento.
- Auditoría de datasets de robótica antes de entrenar: `tools/check_action_layout.py` permite detectar a partir de los datos si un dataset mezcla el layout arm-first del simulador con el base-first esperado por gr00t_views, evitando el fallo documentado de 0/160.
- Evaluación reproducible de checkpoints: el cliente de réplica exacta con restauración de escena y estado permite comparar varios checkpoints bajo las mismas condiciones y obtener banderas por etapa para localizar en qué punto falla un episodio.
- Diagnóstico de fallos de política: el paso de un único booleano de éxito a las banderas `grasped`, `lifted` e `in_cab` facilita distinguir si el fallo está en el agarre, en el levantamiento o en la colocación final dentro del armario.
- Depuración de condicionamiento por lenguaje: el script de reparación de identificadores de tarea documenta y corrige el caso en que todas las columnas de tarea quedan a 0 y el condicionamiento por instrucción se pierde sin error visible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos números presentes en la model card corresponden a la evaluación por réplica exacta descrita:

| Escenario | Métrica | Resultado |
|---|---|---|
| Checkpoint base de referencia, 160 episodios, réplica exacta | Éxito (criterio RoboCasa `obj_inside_of(cab) and gripper_obj_far`) | 11/160 |
| Política entrenada sobre dataset con orden de acciones invertido | Éxito (mismo criterio) | 0/160 |

No hay datos de MMLU, HumanEval, GSM8K ni de ningún otro benchmark de capacidades, ya que el artefacto no es un modelo de lenguaje.

## Requisitos de hardware

- Entrenamiento: la model card documenta una ejecución con 2 GPUs (`GPUS=2,3`), `PER_GPU_BATCH=32`, `MAX_STEPS=30000` y `SAVE_STEPS=5000`.
- Evaluación: la ejecución documentada emplea 4 GPUs (`GPUS=4,5,6,7`) y `N_EPISODES=160`; el número de workers sigue la lista de GPUs y los episodios se reparten por igual entre ellos.
- Generación con MimicGen: un proceso por worker, lanzado desde un JSON de configuración por par (objeto, worker); el consumo depende de los workers configurados.
- VRAM estimada: no disponible. No se indica el tamaño del modelo ni el tipo de GPU empleada.
- Compatibilidad con GPU de consumo: no disponible. No hay datos que permitan afirmar si cabe en una RTX 4090 u otra GPU consumer.
- Cuantización: no disponible; el repositorio no publica pesos ni opciones de cuantización.
- Opciones de despliegue: no aplican vLLM, llama.cpp, Ollama ni TGI. El stack está compuesto por MuJoCo, el árbol `myGR00T` referenciado en la evaluación y un servidor de política con cliente de evaluación.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparativas con otros modelos ni repositorios, y el artefacto no es un modelo comparable en parámetros, contexto o rendimiento. Los componentes que la model card referencia como piezas del pipeline son MimicGen, VACE, RoboCasa y GR00T 1.5, pero no se aporta ningún dato cuantitativo sobre ellos.

| Alternativa | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MimicGen (referenciado como componente) | no disponible | no disponible | no disponible | no disponible | no disponible |
| VACE (referenciado como componente) | no disponible | no disponible | no disponible | no disponible | no disponible |
| RoboCasa (entorno de simulación) | no aplica | no disponible | no disponible | no disponible | no disponible |
| GR00T 1.5 (modelo ajustado) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo: no incluye pesos, ficha de arquitectura, benchmarks de capacidades ni opciones de cuantización. La ficha de especificaciones queda mayoritariamente vacía por ausencia de datos, no por omisión del análisis.
- Licencia no disponible: sin licencia declarada, el uso comercial del repositorio y de sus dependencias queda en terreno jurídico indeterminado. Además, el pipeline depende de MimicGen, VACE, RoboCasa y GR00T 1.5, cada uno con sus propias condiciones.
- Rutas absolutas y archivado "as-run": la propia model card advierte de que el repositorio es un registro del procedimiento y no un paquete listo para usar; hay que ajustar las rutas antes de reutilizarlo.
- Bug de orden de acciones: RoboCasa exporta las acciones en orden arm-first (`eef_pos`, `eef_rot`, `gripper`, `base`, `torso`, `base_mode`) mientras gr00t_views las declara base-first (`base_motion[0:4]`, `control_mode[4:5]`, `eef_pos[5:8]`, `eef_rot[8:11]`, `gripper_close[11:12]`). Un constructor que copie filas sin reordenar no provoca errores y la pérdida converge a un valor bajo, pero la política aleja la base de la encimera y nunca cierra la pinza: 0/160 frente a 11/160 del checkpoint base. El reordenamiento documentado es `actions = raw_actions[:, [7, 8, 9, 10, 11, 0, 1, 2, 3, 4, 5, 6]]`.
- `repair_mimicgen_task_ids.py` no es opcional: sin él todas las columnas de tarea del parquet quedan a 0 y el condicionamiento por lenguaje colapsa en silencio.
- `guarantee=false` cambia el significado de `num_trials`: pasa a contar intentos y no éxitos, lo que altera las cuotas por objeto si se interpreta mal.
- Si `obj_registries` no incluye `aigen`, los objetos bajo `aigen_objs/` provocan un `ValueError` sin mensaje descriptivo.
- En el fragmentado del dataset, cada shard necesita su propio `GEN_DIR` y `DATASET_OUT`, o el glob recoge los de los demás shards.
- El registro temporal de episodios solo puede perder el último fichero de cada worker; el selector lo rellena con el mtime del fichero fusionado, lo que introduce una aproximación en el orden global.
- Las semillas dependen del número de GPUs: el mismo `SEED_BASE` con distinto recuento de GPUs asigna una semilla de entorno distinta a cada episodio.
- Riesgo de alucinación y sesgos: no aplica en el sentido habitual, al no tratarse de un modelo generativo de lenguaje; no se documentan sesgos del modelo ajustado.
- Limitaciones de contexto e idioma: no aplica / no disponible.
- Validación comunitaria muy baja: 0 descargas y 1 like en el momento del análisis, sin pipeline declarado ni idiomas.

## Enlaces

- HuggingFace: https://huggingface.co/mlnha/pose6daug-scripts
- GitHub Awesome-Learning-for-Manipulation (recopilatorio de trabajos de manipulación, relevancia indirecta): https://github.com/Noietch/Awesome-Learning-for-Manipulation

Nota sobre la búsqueda web: el resto de resultados obtenidos (hw.asx.care, asx.care, asx.care/asxweb, roboticsintl.com) corresponden a software de gestión de cuidados móviles y a un agregador de noticias, y no guardan relación con este repositorio. No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a pose6daug-scripts.
